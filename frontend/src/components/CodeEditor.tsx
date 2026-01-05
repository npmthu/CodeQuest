import React, { useEffect, useRef, useState } from "react";
import { useApi } from "../api/ApiProvider";
import { useProblems, useProblem, useRequestCodeReview, useCodeReview, useForumPosts } from "../hooks/useApi";
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
  MessageSquare,
  ThumbsUp,
  ExternalLink,
} from "lucide-react";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { useNavigate, useParams } from "react-router-dom";
import type { 
  Problem, 
  TestCaseResult, 
  Hint, 
  ExecutionResult, 
  ProblemSummary, 
  Language, 
  TestCase,
  ProblemIO,
  IOParameter 
} from "../interfaces";

// ---------- Component Props ----------
interface CodeEditorProps {
  apiBase?: string; // optional override for API base URL
}

// ---------- Utility helpers ----------
const difficultyText = (d: number) => (d === 1 ? "Easy" : d === 2 ? "Medium" : "Hard");
const difficultyColor = (d: number) => (d === 1 ? "green" : d === 2 ? "yellow" : "red");

// Type mapping helper
const mapTypeToLanguage = (type: string, lang: string): string => {
  const typeMap: Record<string, Record<string, string>> = {
    python: {
      int: 'int',
      float: 'float',
      string: 'str',
      bool: 'bool',
      array: 'List',
      object: 'Dict',
    },
    java: {
      int: 'int',
      float: 'double',
      string: 'String',
      bool: 'boolean',
      array: '[]',
      object: 'Map<String, Object>',
    },
    cpp: {
      int: 'int',
      float: 'double',
      string: 'string',
      bool: 'bool',
      array: 'vector',
      object: 'map<string, any>',
    }
  };
  return typeMap[lang]?.[type] || type;
};

// Generate function signature from problem IO
const generateFunctionSignature = (problemIO: ProblemIO | undefined, lang: string): { name: string; params: string; returnType: string } => {
  if (!problemIO) {
    return { name: 'solve', params: '', returnType: 'void' };
  }

  const params = problemIO.input.params.map((param: IOParameter) => {
    const baseType = mapTypeToLanguage(param.type, lang);
    let fullType = baseType;
    
    if (param.type === 'array' && param.element_type) {
      const elementType = mapTypeToLanguage(param.element_type, lang);
      if (lang === 'python') fullType = `List[${elementType}]`;
      else if (lang === 'java') fullType = `${elementType}[]`;
      else if (lang === 'cpp') fullType = `vector<${elementType}>`;
    }
    
    if (lang === 'python') return `${param.name}: ${fullType}`;
    else if (lang === 'java') return `${fullType} ${param.name}`;
    else if (lang === 'cpp') return `${fullType} ${param.name}`;
    return `${param.name}`;
  }).join(', ');

  const returnType = (() => {
    const baseType = mapTypeToLanguage(problemIO.output.type, lang);
    if (problemIO.output.type === 'array' && problemIO.output.element_type) {
      const elementType = mapTypeToLanguage(problemIO.output.element_type, lang);
      if (lang === 'python') return `List[${elementType}]`;
      else if (lang === 'java') return `${elementType}[]`;
      else if (lang === 'cpp') return `vector<${elementType}>`;
    }
    return baseType;
  })();

  // Generate function name (default to 'solve' or use first parameter name logic)
  const functionName = 'solve';

  return { name: functionName, params, returnType };
};

// ---------- Starter Code Templates (LeetCode style) ----------
const generateStarterCode = (problemIO: ProblemIO | undefined, lang: string): string => {
  const sig = generateFunctionSignature(problemIO, lang);

  if (lang === 'python') {
    return `from typing import List, Dict, Any

class Solution:
    def ${sig.name}(self${sig.params ? ', ' + sig.params : ''}) -> ${sig.returnType}:
        # Write your solution here
        pass
`;
  } else if (lang === 'java') {
    return `import java.util.*;

class Solution {
    public ${sig.returnType} ${sig.name}(${sig.params}) {
        // Write your solution here
        return ${sig.returnType === 'int' ? '0' : sig.returnType === 'boolean' ? 'false' : 'null'};
    }
}
`;
  } else if (lang === 'cpp') {
    return `#include <vector>
#include <string>
#include <map>
using namespace std;

class Solution {
public:
    ${sig.returnType} ${sig.name}(${sig.params}) {
        // Write your solution here
        ${sig.returnType === 'int' ? 'return 0;' : sig.returnType === 'bool' ? 'return false;' : 'return {};'}
    }
};
`;
  }
  
  return `// Starter code not available for this language`;
};

// ---------- Component ----------
export default function CodeEditor({ apiBase }: CodeEditorProps) {
  const navigate = useNavigate();
  const { problemId: urlProblemId } = useParams<{ problemId: string }>();
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(urlProblemId || null);

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
  const [testCaseResults, setTestCaseResults] = useState<TestCaseResult[]>([]);
  const [aiReview, setAiReview] = useState<string | null>(null);
  const [lastSubmissionId, setLastSubmissionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("output");

  // submission polling
  const pollRef = useRef<number | null>(null);
  
  // Refs for scroll synchronization
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // API client for submission (still needed for complex operations)
  const { get, post } = useApi();

  // Fetch problems list using hook
  const { data: problemList = [], isLoading: loadingProblems } = useProblems();
  
  // Fetch selected problem detail using hook
  const { data: problem, isLoading: loadingProblem } = useProblem(selectedProblemId || '');

  // AI code review hooks
  const requestCodeReviewMutation = useRequestCodeReview();
  const { data: codeReviewData } = useCodeReview(lastSubmissionId || undefined);

  // Select problem from URL or first problem on mount
  useEffect(() => {
    if (urlProblemId) {
      // Always use URL problem ID if present
      setSelectedProblemId(urlProblemId);
    } else if (problemList && problemList.length > 0 && !selectedProblemId) {
      // Only fallback to first problem if no URL ID and no selected problem
      setSelectedProblemId(problemList[0].id);
    }
  }, [problemList, urlProblemId]);

  // Update code when problem or language changes
  useEffect(() => {
    if (problem) {
      // Generate starter code based on problemIO
      const starterCode = generateStarterCode(problem.problemIO, language.name);
      setCode(starterCode);
      
      // initialize test case states
      const tstates: Record<number, "not_run" | "running" | "passed" | "failed"> = {};
      (problem.sampleTestCases || []).forEach((_: any, i: any) => (tstates[i] = "not_run"));
      setTestCaseStates(tstates);
    }
  }, [problem, language]);

  // Reset handler
  const handleReset = () => {
    if (!problem) return;
    // Generate starter code based on problemIO
    const starterCode = generateStarterCode(problem.problemIO, language.name);
    setCode(starterCode);
    
    setOutput("");
    setTestCaseResults([]);
    // reset testcase states
    const tstates: Record<number, "not_run" | "running" | "passed" | "failed"> = {};
    (problem.sampleTestCases || []).forEach((_: any, i: any) => (tstates[i] = "not_run"));
    setTestCaseStates(tstates);
    setAiReview(null);
    setError(null);
  };

  // Sync scroll between textarea and syntax highlighter
  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current && lineNumbersRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;
      highlightRef.current.scrollTop = scrollTop;
      highlightRef.current.scrollLeft = scrollLeft;
      lineNumbersRef.current.scrollTop = scrollTop;
    }
  };

  // Run handler (mode = run)
  const handleRun = async () => {
    if (!problem) return;
    setLoadingAction(true);
    setError(null);
    setOutput("");
    setTestCaseResults([]);

    try {
      const json = await post(`/submissions`, { problem_id: problem.id, language, code, mode: "run" });

      // assume backend returns immediate result for run mode
      if (json.success && json.data) {
        const result = json.data.result;
        
        // Set output
        let displayOutput = result?.output || result?.stdout || "";
        if (result?.status === 'COMPILE_ERROR' && result?.error) {
          displayOutput = `Compilation Error:\n${result.error}`;
        } else if (result?.error) {
          displayOutput += `\n\nError: ${result.error}`;
        }
        setOutput(displayOutput || "(no output)");

        // if result contains test case results, map them
        if (Array.isArray(result?.test_cases) && result.test_cases.length > 0) {
          setTestCaseResults(result.test_cases);
          const tstates: Record<number, "not_run" | "running" | "passed" | "failed"> = {};
          result.test_cases.forEach((tc: any, i: number) => {
            tstates[i] = tc.passed ? "passed" : "failed";
          });
          setTestCaseStates(tstates);
          
          // Show test summary in output
          const passedCount = result.test_cases.filter((tc: any) => tc.passed).length;
          const totalCount = result.test_cases.length;
          setOutput(prev => `${prev}\n\n✓ Test Cases: ${passedCount}/${totalCount} passed`);
          
          // Auto-switch to test cases tab
          setActiveTab("testcases");
        }

        // optional AI review provided by backend
        if (result?.ai_review) setAiReview(result.ai_review as string);
      } else {
        setOutput(json.message ?? "Run failed");
        setError(json.error || "Run failed");
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
    setTestCaseResults([]);

    try {
      const json = await post(`/submissions`, { problem_id: problem.id, language, code });
      if (!json.success || !json.data) {
        setOutput(json.message ?? "Submission failed");
        setError(json.error || "Submission failed");
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
        
        // Set output
        let displayOutput = r?.output || r?.stdout || "";
        if (r?.status === 'COMPILE_ERROR' && r?.error) {
          displayOutput = `Compilation Error:\n${r.error}`;
        } else if (r?.error) {
          displayOutput += `\n\nError: ${r.error}`;
        }
        
        if (Array.isArray(r?.test_cases) && r.test_cases.length > 0) {
          setTestCaseResults(r.test_cases);
          const tstates: Record<number, "not_run" | "running" | "passed" | "failed"> = {};
          r.test_cases.forEach((tc: any, i: number) => {
            tstates[i] = tc.passed ? "passed" : "failed";
          });
          setTestCaseStates(tstates);
          
          // Show submission summary
          const passedCount = r.test_cases.filter((tc: any) => tc.passed).length;
          const totalCount = r.test_cases.length;
          const score = r.total_points || 0;
          const maxScore = r.max_points || 0;
          
          displayOutput += `\n\n✓ Test Cases: ${passedCount}/${totalCount} passed`;
          displayOutput += `\n★ Score: ${score}/${maxScore} points`;
          
          if (r.passed) {
            displayOutput += `\n\n✓ All tests passed! Submission accepted.`;
          } else {
            displayOutput += `\n\n✗ Some tests failed. Check the Test Cases tab for details.`;
          }
          
          // Auto-switch to test cases tab
          setActiveTab("testcases");
        }
        
        setOutput(displayOutput || JSON.stringify(r, null, 2));
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
            
            let displayOutput = r?.output || r?.stdout || "";
            if (r?.status === 'COMPILE_ERROR' && r?.error) {
              displayOutput = `Compilation Error:\n${r.error}`;
            } else if (r?.error) {
              displayOutput += `\n\nError: ${r.error}`;
            }
            
            if (Array.isArray(r?.test_cases) && r.test_cases.length > 0) {
              setTestCaseResults(r.test_cases);
              const tstates: Record<number, "not_run" | "running" | "passed" | "failed"> = {};
              r.test_cases.forEach((tc:any, i:any) => (tstates[i] = tc.passed ? "passed" : "failed"));
              setTestCaseStates(tstates);
              
              const passedCount = r.test_cases.filter((tc: any) => tc.passed).length;
              const totalCount = r.test_cases.length;
              const score = r.total_points || 0;
              const maxScore = r.max_points || 0;
              
              displayOutput += `\n\n✓ Test Cases: ${passedCount}/${totalCount} passed`;
              displayOutput += `\n★ Score: ${score}/${maxScore} points`;
              
              if (r.passed) {
                displayOutput += `\n\n✓ All tests passed! Submission accepted.`;
              }
            }
            
            setOutput(displayOutput || JSON.stringify(r, null, 2));
            if (r?.ai_review) setAiReview(r.ai_review);

            // Auto-request AI review for this submission when polling finishes
            try {
              requestCodeReviewMutation.mutate({
                submissionId,
                code,
                language: language.name,
                problemTitle: problem.title,
              });
              // Switch to AI Review tab to show the suggestions
              setTimeout(() => setActiveTab("ai-review"), 500);
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
              onClick={() => {
                // Navigate back to the topic page if problem has topic_id
                if (problem.topicId) {
                  navigate(`/topics/${problem.topicId}/lessons`);
                } else {
                  navigate('/dashboard');
                }
              }}
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

            <TabsContent value="description" className="p-6 space-y-4 m-0">
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
                        {tc.name && <div className="font-semibold mb-2">{tc.name}</div>}
                        <div className="font-medium">Input:</div>
                        <pre className="whitespace-pre-wrap bg-white p-2 rounded border text-xs">
                          {JSON.stringify(tc.input, null, 2)}
                        </pre>
                        <div className="font-medium mt-2">Expected Output:</div>
                        <pre className="whitespace-pre-wrap bg-white p-2 rounded border text-xs">
                          {JSON.stringify(tc.expectedOutput, null, 2)}
                        </pre>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="hints" className="p-6 m-0">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  Hints
                </h3>
              </div>
              {(problem.hints || []).length > 0 ? (
                <div className="space-y-3">
                  {(problem.hints || []).map((h: any, i: any) => (
                    <Card key={i} className="p-3 bg-blue-50 border-blue-200 flex items-start gap-3">
                      <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm">{h.content || h.text}</div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-gray-500">No hints available for this problem yet.</div>
              )}
            </TabsContent>

            <TabsContent value="discussion" className="p-0 m-0">
              <DiscussionTab problemId={problem.id} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right - Editor + Output */}
        <div className="flex-1 flex flex-col">
          {/* Editor area */}
          <div className="flex-1 overflow-hidden bg-gray-900 relative">
            {/* Code Editor with Syntax Highlighting and Line Numbers */}
            <div className="absolute inset-0 flex">
              {/* Line numbers */}
              <div 
                ref={lineNumbersRef}
                className="bg-gray-800 text-gray-400 text-right px-4 py-6 font-mono text-sm select-none overflow-hidden"
                style={{ lineHeight: '1.5rem' }}
              >
                {(code + '\n').split('\n').slice(0, -1).map((_, i) => (
                  <div key={i}>
                    {i + 1}
                  </div>
                ))}
              </div>
              
              {/* Code textarea with syntax highlighting overlay */}
              <div className="flex-1 relative overflow-hidden">
                {/* Syntax highlighted preview (non-editable, positioned behind) */}
                <div 
                  ref={highlightRef}
                  className="absolute inset-0 pointer-events-none overflow-auto"
                  style={{
                    padding: '1.5rem',
                    fontSize: '0.875rem',
                    lineHeight: '1.5rem',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  }}
                >
                  <SyntaxHighlighter
                    language={language.name === 'cpp' ? 'cpp' : language.name}
                    style={vscDarkPlus}
                    customStyle={{
                      margin: 0,
                      padding: 0,
                      background: 'transparent',
                      fontSize: '0.875rem',
                      lineHeight: '1.5rem',
                      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    }}
                    showLineNumbers={false}
                    wrapLines={false}
                    codeTagProps={{
                      style: {
                        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                        fontSize: '0.875rem',
                        lineHeight: '1.5rem',
                      }
                    }}
                  >
                    {code}
                  </SyntaxHighlighter>
                </div>
                
                {/* Editable textarea (transparent text, positioned on top) */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onScroll={handleScroll}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const start = e.currentTarget.selectionStart;
                      const end = e.currentTarget.selectionEnd;
                      const newCode = code.substring(0, start) + '    ' + code.substring(end);
                      setCode(newCode);
                      // Set cursor position after the inserted spaces
                      setTimeout(() => {
                        if (textareaRef.current) {
                          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
                        }
                      }, 0);
                    }
                  }}
                  spellCheck={false}
                  className="absolute inset-0 w-full h-full p-6 font-mono text-sm bg-transparent outline-none border-0 resize-none overflow-auto"
                  style={{
                    color: 'transparent',
                    caretColor: 'white',
                    lineHeight: '1.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                    letterSpacing: 'normal',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom panels */}
          <div className="h-56 border-t border-gray-200 bg-white flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="w-full justify-start rounded-none border-b border-gray-200 px-6 bg-white">
                <TabsTrigger value="output">Output</TabsTrigger>
                <TabsTrigger value="testcases">Test Cases</TabsTrigger>
                <TabsTrigger value="ai-review" className="flex items-center gap-2">
                  AI Review
                  {codeReviewData && (
                    <Badge className="bg-blue-600 text-white text-xs px-1.5 py-0.5">
                      <Sparkles className="w-3 h-3" />
                    </Badge>
                  )}
                </TabsTrigger>
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
                  {testCaseResults.length > 0 ? (
                    // Show actual test results from execution
                    testCaseResults.map((result: any, i: number) => (
                      <div
                        key={i}
                        className={`flex items-start gap-3 p-4 rounded-lg border ${
                          result.passed
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="w-6 flex-shrink-0 pt-1">
                          {result.passed ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-red-400 flex items-center justify-center">
                              <span className="text-red-600 text-xs">✗</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="font-semibold">{result.name || `Test Case ${i + 1}`}</div>
                            {result.execution_time_ms && (
                              <Badge variant="outline" className="text-xs">
                                {result.execution_time_ms}ms
                              </Badge>
                            )}
                          </div>
                          
                          {result.error && (
                            <div className="text-red-700 bg-red-100 p-2 rounded text-xs">
                              <strong>Error:</strong> {result.error}
                            </div>
                          )}
                          
                          <div className="grid grid-cols-1 gap-2 text-xs">
                            <div>
                              <div className="font-medium text-gray-700">Input:</div>
                              <pre className="bg-gray-100 p-2 rounded mt-1 whitespace-pre-wrap overflow-auto max-h-24">
                                {result.input ? (typeof result.input === 'object' ? JSON.stringify(result.input, null, 2) : result.input) : '[Hidden]'}
                              </pre>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="font-medium text-gray-700">Expected Output:</div>
                                <pre className="bg-gray-100 p-2 rounded mt-1 whitespace-pre-wrap overflow-auto max-h-24">
                                  {result.expected_output ? (typeof result.expected_output === 'object' ? JSON.stringify(result.expected_output, null, 2) : result.expected_output) : '[Hidden]'}
                                </pre>
                              </div>
                              
                              <div>
                                <div className="font-medium text-gray-700">Your Output:</div>
                                <pre className={`p-2 rounded mt-1 whitespace-pre-wrap overflow-auto max-h-24 ${
                                  result.passed ? 'bg-green-100' : 'bg-red-100'
                                }`}>
                                  {result.actual_output || '(no output)'}
                                </pre>
                              </div>
                            </div>
                          </div>
                          
                          {result.points !== undefined && (
                            <div className="text-xs text-gray-600">
                              Points: <strong>{result.points}</strong>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Show sample test cases before execution
                    (problem.sampleTestCases || []).map((tc: TestCase, i: any) => {
                      const state = testCaseStates[i] ?? "not_run";
                      return (
                        <div
                          key={i}
                          className={`flex items-start gap-3 p-3 rounded-lg border ${
                            state === "passed"
                              ? "bg-green-50 border-green-200"
                              : state === "failed"
                              ? "bg-red-50 border-red-200"
                              : state === "running"
                              ? "bg-blue-50 border-blue-200"
                              : "bg-gray-50 border-gray-200"
                          }`}
                        >
                          <div className="w-6 flex-shrink-0">
                            {state === "passed" ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : state === "running" ? (
                              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                          <div className="flex-1 text-sm">
                            <div className="font-medium">Test case {i + 1} — {state.replace("_", " ")}</div>
                            <div className="text-xs text-gray-600 mt-1">
                              <div>Input:</div>
                              <pre className="whitespace-pre-wrap bg-gray-100 p-1 rounded mt-0.5">{tc.inputEncrypted}</pre>
                            </div>
                            <div className="text-xs text-gray-600 mt-2">
                              <div>Expected Output:</div>
                              <pre className="whitespace-pre-wrap bg-gray-100 p-1 rounded mt-0.5">{tc.expectedOutputEncrypted}</pre>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}

                  {testCaseResults.length === 0 && (problem.sampleTestCases || []).length === 0 && (
                    <div className="text-sm text-gray-500">No test cases available. Click Run or Submit to execute your code.</div>
                  )}
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

// ---------- Discussion Tab Component ----------
interface DiscussionTabProps {
  problemId: string;
}

function DiscussionTab({ problemId }: DiscussionTabProps) {
  const navigate = useNavigate();
  
  // Fetch forum posts where related_problem_id matches this problem
  const { data: allPosts, isLoading } = useForumPosts(null);
  
  // Filter posts related to this problem
  const relatedPosts = (allPosts || []).filter(
    (post: any) => post.relatedProblemId === problemId
  );

  const handlePostClick = (postId: string) => {
    navigate(`/forum/${postId}`);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">Loading discussions...</span>
      </div>
    );
  }

  if (relatedPosts.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-700 mb-2">No discussions yet</h3>
          <p className="text-xs text-gray-500 mb-4">
            Be the first to start a discussion about this problem!
          </p>
          <Button
            size="sm"
            onClick={() => navigate('/forum')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Start Discussion
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-700">
          {relatedPosts.length} {relatedPosts.length === 1 ? 'Discussion' : 'Discussions'}
        </h3>
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate('/forum')}
        >
          View All Forum
        </Button>
      </div>

      <div className="space-y-2">
        {relatedPosts.map((post: any) => (
          <Card
            key={post.id}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors border-gray-200"
            onClick={() => handlePostClick(post.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                  {post.title}
                </h4>
                
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <ThumbsUp className="w-3 h-3" />
                    {post.upvotes || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    {post.replyCount || 0}
                  </span>
                  {post.hasAcceptedAnswer && (
                    <Badge className="bg-green-100 text-green-800 text-xs px-1.5 py-0">
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Solved
                    </Badge>
                  )}
                </div>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.slice(0, 3).map((tag: string, idx: number) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="text-xs px-1.5 py-0"
                      >
                        {tag}
                      </Badge>
                    ))}
                    {post.tags.length > 3 && (
                      <span className="text-xs text-gray-400">+{post.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>

              <ExternalLink className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>

            <div className="mt-2 text-xs text-gray-500">
              by {post.author?.displayName || 'Anonymous'} • {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
