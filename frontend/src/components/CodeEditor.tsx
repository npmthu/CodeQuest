import React, { useEffect, useRef, useState } from "react";
import { useApi } from "../api/ApiProvider";
import { useProblems, useProblem, useRequestCodeReview, useCodeReview } from "../hooks/useApi";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import {
  Play,
  RotateCcw,
  ArrowLeft,
  ChevronDown,
  Settings,
  Lightbulb,
  CheckCircle2,
  Sparkles,
  AlertTriangle,
  Loader2,
  Brain,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import type { 
  Problem, 
  TestCaseResult, 
  Hint, 
  ExecutionResult, 
  ProblemSummary, 
  Language, 
  TestCase 
} from "../interfaces";

// ---------- Component Props ----------
interface CodeEditorProps {
  apiBase?: string; // optional override for API base URL
}

// ---------- Utility helpers ----------
const difficultyText = (d: number) => (d === 1 ? "Easy" : d === 2 ? "Medium" : "Hard");
const difficultyColor = (d: number) => (d === 1 ? "green" : d === 2 ? "yellow" : "red");

// ---------- Component ----------
export default function CodeEditor({ apiBase }: CodeEditorProps) {
  const navigate = useNavigate();
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);

  // derive effective API base: prop override -> Vite env -> default
  const effectiveApiBase: string =
    apiBase ?? (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_BASE) ?? "http://localhost:3000/api";

  const [language, setLanguage] = useState<Language>({
    id: 'python',
    name: 'python',
    version: '3.x',
    isEnabled: true,
    file_extension: '.py',
    run_command: 'python3'
  });
  const [code, setCode] = useState("");

  const [loadingAction, setLoadingAction] = useState(false); // run/submit
  const [error, setError] = useState<string | null>(null);

  const [output, setOutput] = useState("");
  const [testCaseStates, setTestCaseStates] = useState<Record<number, "not_run" | "running" | "passed" | "failed">>({});
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);

  // submission polling
  const pollRef = useRef<number | null>(null);

  // API client for submission (still needed for complex operations)
  const { get, post } = useApi();

  // Fetch problems list using hook
  const { data: problemList = [], isLoading: loadingProblems } = useProblems();
  
  // Fetch selected problem detail using hook
  const { data: problem, isLoading: loadingProblem } = useProblem(selectedProblemId || '');

  // AI code review hooks
  const requestCodeReviewMutation = useRequestCodeReview();
  const { data: codeReviewData } = useCodeReview(lastSubmissionId || undefined);

  // Select first problem on mount
  useEffect(() => {
    if (problemList && problemList.length > 0 && !selectedProblemId) {
      setSelectedProblemId(problemList[0].id);
    }
  }, [problemList, selectedProblemId]);

  // Update code when problem or language changes
  useEffect(() => {
    if (problem) {
      setCode(problem.starterCode?.[language.name] ?? "");
      // initialize test case states
      const tstates: Record<number, "not_run" | "running" | "passed" | "failed"> = {};
      (problem.sampleTestCases || []).forEach((_: any, i: any) => (tstates[i] = "not_run"));
      setTestCaseStates(tstates);
    }
  }, [problem, language]);

  // Reset handler
  const handleReset = () => {
    if (!problem) return;
    setCode(problem.starterCode?.[language.name] ?? "");
    setOutput("");
    // reset testcase states
    const tstates: Record<number, "not_run" | "running" | "passed" | "failed"> = {};
    (problem.sampleTestCases || []).forEach((_: any, i: any) => (tstates[i] = "not_run"));
    setTestCaseStates(tstates);
    setAiReview(null);
    setError(null);
  };

  // Run handler (mode = run)
  const handleRun = async () => {
    if (!problem) return;
    setLoadingAction(true);
    setError(null);
    setOutput("");

    try {
      const json = await post(`/submissions`, { problem_id: problem.id, language, code, mode: "run" });

      // assume backend returns immediate result for run mode
      if (json.success && json.data) {
        const result = json.data.result;
        setOutput(result?.stdout ?? result?.output ?? "(no output)");

        // if result contains test case results, map them
        if (Array.isArray(result?.test_cases)) {
          const tstates: Record<number, "not_run" | "running" | "passed" | "failed"> = {};
          result.test_cases.forEach((tc: TestCaseResult, i: number) => (tstates[i] = tc.passed ? "passed" : "failed"));
          setTestCaseStates(tstates);
        }

        // optional AI review provided by backend
        if (result?.ai_review) setAiReview(result.ai_review as string);
      } else {
        setOutput(json.message ?? "Run failed");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error running code");
      setOutput("Error running code");
    } finally {
      setLoadingAction(false);
    }
  };

  // Submit handler (mode = submit) with polling
  const handleSubmit = async () => {
    if (!problem) return;
    setLoadingAction(true);
    setError(null);
    setOutput("");

    try {
      const json = await post(`/submissions`, { problem_id: problem.id, language, code });
      if (!json.success || !json.data) {
        setOutput(json.message ?? "Submission failed");
        setLoadingAction(false);
        return;
      }

      const submissionId: string = json.data.submission_id;
      const responseData = json.data;
      // expose submission id so AI review UI can request reviews for this submission
      setLastSubmissionId(submissionId);

      // Check if result is immediately available (synchronous execution)
      if (responseData.status === 'done' && responseData.result) {
        const r = responseData.result;
        setOutput(r?.stdout ?? r?.output ?? JSON.stringify(r, null, 2));

        if (Array.isArray(r?.test_cases)) {
          const tstates: Record<number, "not_run" | "running" | "passed" | "failed"> = {};
          r.test_cases.forEach((tc: TestCaseResult, i: number) => (tstates[i] = tc.passed ? "passed" : "failed"));
          setTestCaseStates(tstates);
        }
        if (r?.ai_review) setAiReview(r.ai_review);
        // Auto-request AI review for this submission
        try {
          requestCodeReviewMutation.mutate({
            submissionId,
            code,
            language: language.name,
            problemTitle: problem.title,
          });
        } catch (e) {
          console.error('Failed to trigger AI review mutation:', e);
        }

        setLoadingAction(false);
        return;
      }

      // Otherwise, poll for async result
      setOutput(`Submission queued: ${submissionId}`);

      // start polling for submission result every 2s
      let attempts = 0;
      const maxAttempts = 60; // 2 minutes

      if (pollRef.current) window.clearInterval(pollRef.current);

      pollRef.current = window.setInterval(async () => {
        attempts += 1;
        try {
          const pjson = await get(`/submissions/${submissionId}`);

          // expected structure: { success: true, data: { status: 'pending'|'done', result: {...} } }
          const pdata = pjson.data;
          if (pdata?.status === "done" || pdata?.status === "finished") {
            // show results
            const r = pdata.result;
            setOutput(r?.stdout ?? r?.output ?? JSON.stringify(r, null, 2));

            if (Array.isArray(r?.test_cases)) {
              const tstates: Record<number, "not_run" | "running" | "passed" | "failed"> = {};
              r.test_cases.forEach((tc:TestCaseResult, i:any) => (tstates[i] = tc.passed ? "passed" : "failed"));
              setTestCaseStates(tstates);
            }
            if (r?.ai_review) setAiReview(r.ai_review);

            // Auto-request AI review for this submission when polling finishes
            try {
              requestCodeReviewMutation.mutate({
                submissionId,
                code,
                language: language.name,
                problemTitle: problem.title,
              });
            } catch (e) {
              console.error('Failed to trigger AI review mutation (poll):', e);
            }

            if (pollRef.current) {
              window.clearInterval(pollRef.current);
              pollRef.current = null;
            }
            setLoadingAction(false);
          } else {
            // still pending
            setOutput(`Submission ${submissionId} status: ${pdata?.status ?? "pending"}`);
            // optionally mark testcase states as running
            const tstates: Record<number, "not_run" | "running"> = {};
            (problem.sampleTestCases || []).forEach((_: any, i: any) => (tstates[i] = "running"));
            setTestCaseStates((s) => ({ ...s, ...tstates }));
          }
        } catch (err: any) {
          console.error("Polling error", err);
          // don't spam the user with errors; stop after max attempts
          if (attempts >= maxAttempts) {
            if (pollRef.current) {
              window.clearInterval(pollRef.current);
              pollRef.current = null;
            }
            setError("Timed out waiting for submission result");
            setLoadingAction(false);
          }
        }
      }, 2000);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error submitting code");
      setLoadingAction(false);
    }
  };

  // UI
  if ((loadingProblems || loadingProblem) && !problem)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <Loader2 className="animate-spin" />
          <span>Loading problems…</span>
        </div>
      </div>
    );

  if (!problem)
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-2">No problem loaded.</p>
          {error && (
            <div className="text-sm text-red-600 mb-2 flex items-center justify-center gap-2">
              <AlertTriangle className="w-4 h-4" /> {error}
            </div>
          )}
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </div>
    );

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="h-6 w-px bg-gray-200" />

            <div>
              <h2 className="text-lg font-semibold">{problem.title}</h2>
              <div className="flex items-center gap-3 mt-1">
                <Badge className={`px-2 py-1 rounded-md bg-${difficultyColor(problem.difficulty)}-100 text-${difficultyColor(problem.difficulty)}-800`}> 
                  {difficultyText(problem.difficulty)}
                </Badge>
                <div className="text-sm text-gray-500">{problem.tags?.join(" • ")}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <select
                value={language.name}
                onChange={(e) => {
                  const langName = e.target.value;
                  setLanguage({
                    id: langName,
                    name: langName,
                    version: '1.0',
                    isEnabled: true,
                    file_extension: langName === 'python' ? '.py' : langName === 'java' ? '.java' : '.cpp',
                    run_command: langName === 'python' ? 'python3' : langName === 'java' ? 'java' : 'g++'
                  });
                }}
                className="appearance-none px-3 py-2 border border-gray-200 rounded-md bg-white text-sm pr-8"
              >
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <ChevronDown className="absolute right-2 top-2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>

            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left - Problem */}
        <div className="w-2/5 border-r border-gray-200 overflow-auto bg-white">
          <Tabs defaultValue="description" className="h-full flex flex-col">
            <TabsList className="w-full justify-start rounded-none border-b border-gray-200 px-6 bg-white">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="hints">Hints</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>

            <div className="p-6 space-y-4">
              <div className="text-sm text-gray-600">
                <div className="mb-3">
                  <div className="font-medium">Input format</div>
                  <div className="text-sm text-gray-500">{problem.inputFormat ?? "-"}</div>
                </div>

                <div className="mb-3">
                  <div className="font-medium">Output format</div>
                  <div className="text-sm text-gray-500">{problem.outputFormat ?? "-"}</div>
                </div>

                <div className="mb-3">
                  <div className="font-medium">Constraints</div>
                  <div className="text-sm text-gray-500">{problem.timeLimitMs ? `${problem.timeLimitMs} ms` : "-"} • {problem.memoryLimitKb ? `${problem.memoryLimitKb} KB` : "-"}</div>
                </div>
              </div>

              <div className="prose max-w-none text-sm whitespace-pre-wrap">
                {/* show markdown raw (to avoid adding dependencies). In a real app render markdown to HTML. */}
                <pre className="whitespace-pre-wrap text-sm">{problem.descriptionMarkdown}</pre>
              </div>

              <div>
                <div className="font-medium mb-2">Sample Test Cases</div>
                <div className="space-y-3">
                  {(problem.sampleTestCases || []).map((tc:TestCase, idx: any) => (
                    <Card key={idx} className="p-3 bg-gray-50 border-gray-200">
                      <div className="text-sm">
                        <div className="font-medium">Input</div>
                        <pre className="whitespace-pre-wrap">{tc.inputEncrypted}</pre>
                        <div className="font-medium">Output</div>
                        <pre className="whitespace-pre-wrap">{tc.expectedOutputEncrypted}</pre>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <TabsContent value="hints" className="p-0 m-0">
                <div className="space-y-3">
                  {(problem.hints || []).map((h: any, i: any) => (
                    <Card key={i} className="p-3 bg-blue-50 border-blue-200 flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">{h.content || h.text}</div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="discussion" className="p-0 m-0">
                <div className="text-sm text-gray-500">Discussion is not implemented in this demo.</div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Right - Editor + Output */}
        <div className="flex-1 flex flex-col">
          {/* Editor area */}
          <div className="flex-1 overflow-hidden bg-gray-900">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              className="w-full h-full p-6 font-mono text-sm bg-gray-900 text-white outline-none border-0 resize-none"
            />
          </div>

          {/* Bottom panels */}
          <div className="h-56 border-t border-gray-200 bg-white flex flex-col">
            <Tabs defaultValue="output" className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-gray-200 px-6 bg-white">
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                <TabsTrigger value="ai-review">AI Review</TabsTrigger>
              </TabsList>

              <TabsContent value="output" className="flex-1 overflow-auto p-6 m-0">
                {error && (
                  <div className="mb-3 text-sm text-red-600 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> {error}
                  </div>
                )}

                {loadingAction && (
                  <div className="mb-3 flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> Running...
                  </div>
                )}

                <div className="text-sm font-mono whitespace-pre-wrap">{output || "Click Run to execute code"}</div>
              </TabsContent>

              <TabsContent value="testcases" className="flex-1 overflow-auto p-6 m-0">
                <div className="space-y-3">
                  {(problem.sampleTestCases || []).map((tc:TestCase, i: any) => {
                    const state = testCaseStates[i] ?? "not_run";
                    return (
                      <div
                        key={i}
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          state === "passed"
                            ? "bg-green-50 border-green-200"
                            : state === "failed"
                            ? "bg-red-50 border-red-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="w-6 flex-shrink-0">
                          {state === "passed" ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                        </div>
                        <div className="flex-1 text-sm">
                          <div className="font-medium">Test case {i + 1} — {state.replace("_", " ")}</div>
                          <div className="text-xs text-gray-600 mt-1">Input: <pre className="whitespace-pre-wrap">{tc.inputEncrypted}</pre></div>
                          <div className="text-xs text-gray-600">Expected Output: <pre className="whitespace-pre-wrap">{tc.expectedOutputEncrypted}</pre></div>
                        </div>
                      </div>
                    );
                  })}

                  {(problem.sampleTestCases || []).length === 0 && <div className="text-sm text-gray-500">No sample test cases.</div>}
                </div>
              </TabsContent>

              <TabsContent value="ai-review" className="flex-1 overflow-auto p-6 m-0 space-y-4">
                {/* AI Review Request Button */}
                {lastSubmissionId && !codeReviewData && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (!lastSubmissionId || !problem) return;
                      requestCodeReviewMutation.mutate({
                        submissionId: lastSubmissionId,
                        code,
                        language: language.name,
                        problemTitle: problem.title,
                      });
                    }}
                    disabled={requestCodeReviewMutation.isPending}
                  >
                    {requestCodeReviewMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" /> Request AI Code Review
                      </>
                    )}
                  </Button>
                )}

                {/* AI Review Error */}
                {requestCodeReviewMutation.isError && (
                  <Card className="p-4 bg-red-50 border-red-200">
                    <div className="flex items-start gap-2 text-sm text-red-800">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-medium">Failed to generate review</div>
                        <div className="text-xs mt-1">
                          {requestCodeReviewMutation.error?.message || "An error occurred"}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* AI Review Results */}
                {codeReviewData && (
                  <div className="space-y-4">
                    {codeReviewData.cached && (
                      <Badge variant="outline" className="text-xs">
                        <Sparkles className="w-3 h-3 mr-1" /> Cached Review
                      </Badge>
                    )}

                    {/* Summary */}
                    <Card className="p-4 bg-blue-50 border-blue-200">
                      <div className="flex items-start gap-3">
                        <Brain className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-semibold text-sm text-blue-900 mb-2">Summary</div>
                          <div className="text-sm text-blue-800 whitespace-pre-wrap">
                            {codeReviewData.summary}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Quality Rating */}
                    {codeReviewData.qualityRating && (
                      <Card className="p-4">
                        <div className="text-sm">
                          <span className="font-medium">Quality Rating:</span>{" "}
                          <span className="text-gray-700">{codeReviewData.qualityRating}/10</span>
                        </div>
                      </Card>
                    )}

                    {/* Issues */}
                    {codeReviewData.issues && codeReviewData.issues.length > 0 && (
                      <Card className="p-4 bg-red-50 border-red-200">
                        <div className="font-semibold text-sm text-red-900 mb-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4" /> Issues Found
                        </div>
                        <div className="space-y-2">
                          {codeReviewData.issues.map((issue: string, idx: number) => (
                            <div key={idx} className="text-sm text-red-800 pl-4 border-l-2 border-red-300">
                              {issue}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Suggestions */}
                    {codeReviewData.suggestions && codeReviewData.suggestions.length > 0 && (
                      <Card className="p-4 bg-green-50 border-green-200">
                        <div className="font-semibold text-sm text-green-900 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4" /> Suggestions
                        </div>
                        <div className="space-y-2">
                          {codeReviewData.suggestions.map((suggestion: string, idx: number) => (
                            <div key={idx} className="text-sm text-green-800 pl-4 border-l-2 border-green-300">
                              {suggestion}
                            </div>
                          ))}
                        </div>
                      </Card>
                    )}

                    {/* Processing Time */}
                    {codeReviewData.processingTimeMs && (
                      <div className="text-xs text-gray-500">
                        Review generated in {codeReviewData.processingTimeMs}ms
                      </div>
                    )}
                  </div>
                )}

                {/* Legacy AI Review (from backend submission) */}
                {aiReview && !codeReviewData && (
                  <Card className="p-4 bg-blue-50 border-blue-200">
                    <div className="text-sm whitespace-pre-wrap">{aiReview}</div>
                  </Card>
                )}

                {/* No Review State */}
                {!aiReview && !codeReviewData && !lastSubmissionId && (
                  <div className="text-sm text-gray-500">
                    Submit your code first to request an AI code review.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Action row */}
          <div className="bg-white border-t border-gray-200 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" /> Reset
              </Button>
              <Button variant="outline" onClick={handleRun} disabled={loadingAction}>
                <Play className="w-4 h-4 mr-2" /> Run
              </Button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500 mr-2">{problem.timeLimitMs ? `${problem.timeLimitMs} ms` : ""} • {problem.memoryLimitKb ? `${problem.memoryLimitKb} KB` : ""}</div>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSubmit} disabled={loadingAction}>
                {loadingAction ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" /> Submit
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
