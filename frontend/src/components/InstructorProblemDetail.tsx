import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart3,
  AlertTriangle,
  X,
  Clipboard,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useInstructorProblemDetail } from "../hooks/useApi";
import { useState } from "react";
import type { SuspicionBreakdown, PasteEvent } from "../hooks/usePasteDetection";
import { formatTestCaseInput, formatTestCaseOutput, formatProblemIOInput, formatProblemIOOutput } from "../services/testCaseFormatter";

// Helper function to get suspicion score badge color (icon only, no percentage)
const getSuspicionBadge = (score: number | null | undefined) => {
  if (score === null || score === undefined) {
    return (
      <div className="w-4 h-4 rounded-full bg-gray-300" title="No data" />
    );
  }
  if (score < 0.2) {
    return (
      <div className="w-4 h-4 rounded-full bg-green-500" title="Low suspicion" />
    );
  }
  if (score < 0.5) {
    return (
      <div className="w-4 h-4 rounded-full bg-yellow-500" title="Moderate suspicion" />
    );
  }
  if (score < 0.75) {
    return (
      <div className="w-4 h-4 rounded-full bg-orange-500" title="High suspicion" />
    );
  }
  return (
    <div className="w-4 h-4 rounded-full bg-red-500" title="Very high suspicion" />
  );
};

// Helper function to format timestamp
const formatTimestamp = (ts: number) => {
  return new Date(ts).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
};

export default function InstructorProblemDetail() {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useInstructorProblemDetail(problemId || "");
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(
    new Set()
  );
  const [suspicionModalData, setSuspicionModalData] = useState<{
    breakdown: SuspicionBreakdown;
    userName: string;
    submissionId: string;
  } | null>(null);

  const toggleSubmissionExpand = (submissionId: string) => {
    setExpandedSubmissions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(submissionId)) {
        newSet.delete(submissionId);
      } else {
        newSet.add(submissionId);
      }
      return newSet;
    });
  };

  const openSuspicionModal = (breakdown: SuspicionBreakdown, userName: string, submissionId: string) => {
    setSuspicionModalData({ breakdown, userName, submissionId });
  };

  const closeSuspicionModal = () => {
    setSuspicionModalData(null);
  };

  const getDifficultyBadge = (difficulty: number) => {
    switch (difficulty) {
      case 1:
        return <Badge className="bg-green-100 text-green-700">Easy</Badge>;
      case 2:
        return <Badge className="bg-yellow-100 text-yellow-700">Medium</Badge>;
      case 3:
        return <Badge className="bg-red-100 text-red-700">Hard</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "accepted":
        return (
          <Badge className="bg-green-100 text-green-700">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Accepted
          </Badge>
        );
      case "wrong_answer":
        return (
          <Badge className="bg-red-100 text-red-700">
            <XCircle className="w-3 h-3 mr-1" />
            Wrong Answer
          </Badge>
        );
      case "time_limit_exceeded":
        return (
          <Badge className="bg-yellow-100 text-yellow-700">
            <Clock className="w-3 h-3 mr-1" />
            TLE
          </Badge>
        );
      case "runtime_error":
        return (
          <Badge className="bg-orange-100 text-orange-700">
            <XCircle className="w-3 h-3 mr-1" />
            Runtime Error
          </Badge>
        );
      case "compilation_error":
        return (
          <Badge className="bg-purple-100 text-purple-700">
            <XCircle className="w-3 h-3 mr-1" />
            Compilation Error
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center text-red-600">
          Failed to load problem details. Please try again.
        </Card>
      </div>
    );
  }

  const { problem, problemIO, testCases, submissions, statistics } = data;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/instructor/problems")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Problems
        </Button>
      </div>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-bold">{problem.title}</h1>
            {getDifficultyBadge(problem.difficulty)}
            {problem.is_published ? (
              <Badge className="bg-green-100 text-green-700">
                <Eye className="w-3 h-3 mr-1" />
                Published
              </Badge>
            ) : (
              <Badge className="bg-yellow-100 text-yellow-700">
                <EyeOff className="w-3 h-3 mr-1" />
                Draft
              </Badge>
            )}
            {problem.is_premium && (
              <Badge className="bg-purple-100 text-purple-700">Premium</Badge>
            )}
          </div>
          <p className="text-sm text-gray-500">
            <span className="ml-4">
              Time Limit: {problem.time_limit_ms}ms | Memory: {problem.memory_limit_kb}KB
            </span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/instructor/problems/${problemId}/edit`)}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Problem
          </Button>
          <Button variant="outline" className="text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-blue-600">
            {statistics.totalSubmissions}
          </p>
          <p className="text-sm text-gray-500">Total Submissions</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-purple-600">
            {statistics.uniqueUsers}
          </p>
          <p className="text-sm text-gray-500">Unique Users</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-green-600">
            {statistics.acceptedSubmissions}
          </p>
          <p className="text-sm text-gray-500">Accepted</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-orange-600">
            {statistics.acceptanceRate?.toFixed(1) || 0}%
          </p>
          <p className="text-sm text-gray-500">Acceptance Rate</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-2xl font-bold text-cyan-600">
            {testCases?.length || 0}
          </p>
          <p className="text-sm text-gray-500">Test Cases</p>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-lg">
          <TabsTrigger value="overview" className="px-4 py-2">
            <FileText className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="testcases" className="px-4 py-2">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Test Cases ({testCases?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="submissions" className="px-4 py-2">
            <Code className="w-4 h-4 mr-2" />
            Submissions ({submissions?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="analytics" className="px-4 py-2">
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Problem Description</h3>
              <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                {problem.description_markdown || "No description"}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Input/Output Format</h3>
              {problemIO ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Input Format:
                    </p>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto font-mono">
                      {formatProblemIOInput(problemIO.input)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Output Format:
                    </p>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto font-mono">
                      {formatProblemIOOutput(problemIO.output)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No I/O format defined</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Constraints</h3>
              {problemIO && problemIO.input && problemIO.input.params ? (
                <div className="space-y-3">
                  {problemIO.input.params.map((param: any, index: number) => (
                    <div key={index} className="text-sm">
                      <span className="font-medium text-gray-700">{param.name}:</span>
                      {param.constraints && (
                        <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                          {param.constraints.min_length !== undefined && (
                            <li>Min length: {param.constraints.min_length}</li>
                          )}
                          {param.constraints.max_length !== undefined && (
                            <li>Max length: {param.constraints.max_length}</li>
                          )}
                          {param.constraints.length !== undefined && (
                            <li>Length: {param.constraints.length}</li>
                          )}
                          {param.constraints.value_range && (
                            <li>Range: [{param.constraints.value_range[0]}, {param.constraints.value_range[1]}]</li>
                          )}
                        </ul>
                      )}
                    </div>
                  ))}
                  {problemIO.output && problemIO.output.constraints && (
                    <div className="text-sm mt-3">
                      <span className="font-medium text-gray-700">Output:</span>
                      <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                        {problemIO.output.constraints.length !== undefined && (
                          <li>Length: {problemIO.output.constraints.length}</li>
                        )}
                        {problemIO.output.constraints.min_length !== undefined && (
                          <li>Min length: {problemIO.output.constraints.min_length}</li>
                        )}
                        {problemIO.output.constraints.max_length !== undefined && (
                          <li>Max length: {problemIO.output.constraints.max_length}</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500">No constraints defined</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Hints</h3>
              {problem.hint ? (
                <div className="text-sm text-gray-700 whitespace-pre-wrap">
                  {problem.hint}
                </div>
              ) : problem.hints && problem.hints.length > 0 ? (
                <ul className="space-y-2">
                  {problem.hints.map((hint: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </span>
                      <span className="text-sm">{hint}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500">No hints available</p>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Test Cases Tab */}
        <TabsContent value="testcases" className="mt-4">
          <Card className="p-6">
            {testCases && testCases.length > 0 ? (
              <div className="space-y-4">
                {testCases.map((tc: any, index: number) => (
                  <div
                    key={tc.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">Test Case #{index + 1}</span>
                        {tc.is_sample && (
                          <Badge variant="outline">Sample</Badge>
                        )}
                        {tc.is_hidden && (
                          <Badge className="bg-gray-100 text-gray-700">
                            Hidden
                          </Badge>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        Weight: {tc.weight || 1}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Input:
                        </p>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto max-h-32 font-mono">
                          {formatTestCaseInput(tc.input)}
                        </pre>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Expected Output:
                        </p>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto max-h-32 font-mono">
                          {formatTestCaseOutput(tc.expected_output)}
                        </pre>
                      </div>
                    </div>
                    {tc.explanation && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Explanation:
                        </p>
                        <p className="text-sm text-gray-700">{tc.explanation}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No test cases defined yet</p>
                <Button className="mt-4" variant="outline">
                  Add Test Cases
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Submissions Tab */}
        <TabsContent value="submissions" className="mt-4">
          <Card className="p-6">
            {submissions && submissions.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="text-left p-3 font-medium">User</th>
                        <th className="text-left p-3 font-medium">Language</th>
                        <th className="text-left p-3 font-medium">Status</th>
                        <th className="text-left p-3 font-medium">Test Cases</th>
                        <th className="text-left p-3 font-medium">Score</th>
                        <th className="text-left p-3 font-medium">
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="w-4 h-4 text-orange-500" />
                            Suspicion
                          </div>
                        </th>
                        <th className="text-left p-3 font-medium">Time</th>
                        <th className="text-left p-3 font-medium">Submitted</th>
                        <th className="text-left p-3 font-medium">Content</th>
                      </tr>
                    </thead>
                    <tbody>
                      {submissions.map((sub: any) => (
                        <>
                          <tr
                            key={sub.id}
                            className="border-b hover:bg-gray-50 cursor-pointer"
                            onClick={() => toggleSubmissionExpand(sub.id)}
                          >
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-gray-400" />
                                <span>
                                  {sub.userName || sub.userEmail || "Unknown User"}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="outline">{sub.language}</Badge>
                            </td>
                            <td className="p-3">{getStatusBadge(sub.status)}</td>
                            <td className="p-3">
                              <span className="text-sm">
                                {sub.testCasesPassed || 0}/{sub.testCasesTotal || 0}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-medium">
                                {sub.score || 0}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {getSuspicionBadge(sub.suspicionScore)}
                                {sub.suspicionBreakdown && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 w-6 p-0"
                                    onClick={(e: React.MouseEvent) => {
                                      e.stopPropagation();
                                      openSuspicionModal(
                                        sub.suspicionBreakdown,
                                        sub.userName || sub.userEmail || 'Unknown',
                                        sub.id
                                      );
                                    }}
                                  >
                                    <Eye className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-gray-600">
                                {sub.executionTimeMs
                                  ? `${sub.executionTimeMs}ms`
                                  : "N/A"}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="text-sm text-gray-600">
                                {formatDate(sub.submittedAt)}
                              </span>
                            </td>
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e: React.MouseEvent) => {
                                  e.stopPropagation();
                                  toggleSubmissionExpand(sub.id);
                                }}
                              >
                                {expandedSubmissions.has(sub.id) ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                            </td>
                          </tr>
                          {expandedSubmissions.has(sub.id) && (
                            <tr>
                              <td colSpan={9} className="p-4 bg-gray-50">
                                <div className="space-y-3">
                                  <div className="flex items-center justify-between">
                                    <h4 className="font-medium">Submitted Code</h4>
                                    {sub.memoryKb > 0 && (
                                      <span className="text-sm text-gray-500">
                                        Memory: {sub.memoryKb}KB
                                      </span>
                                    )}
                                  </div>
                                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto max-h-96">
                                    <code>{sub.code}</code>
                                  </pre>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Code className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No submissions yet</p>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Submission Status Distribution</h3>
              <div className="space-y-3">
                {statistics.statusBreakdown &&
                  Object.entries(statistics.statusBreakdown).map(
                    ([status, count]: [string, any]) => {
                      const percentage =
                        statistics.totalSubmissions > 0
                          ? ((count / statistics.totalSubmissions) * 100).toFixed(1)
                          : 0;
                      return (
                        <div key={status} className="flex items-center gap-3">
                          <div className="w-32 text-sm">{getStatusBadge(status)}</div>
                          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                status === "accepted"
                                  ? "bg-green-500"
                                  : status === "wrong_answer"
                                  ? "bg-red-500"
                                  : "bg-yellow-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-20 text-right">
                            {count} ({percentage}%)
                          </span>
                        </div>
                      );
                    }
                  )}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Language Distribution</h3>
              <div className="space-y-3">
                {statistics.languageBreakdown &&
                  Object.entries(statistics.languageBreakdown).map(
                    ([language, count]: [string, any]) => {
                      const percentage =
                        statistics.totalSubmissions > 0
                          ? ((count / statistics.totalSubmissions) * 100).toFixed(1)
                          : 0;
                      return (
                        <div key={language} className="flex items-center gap-3">
                          <div className="w-24 text-sm font-medium capitalize">
                            {language}
                          </div>
                          <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-20 text-right">
                            {count} ({percentage}%)
                          </span>
                        </div>
                      );
                    }
                  )}
              </div>
            </Card>

            <Card className="p-6 lg:col-span-2">
              <h3 className="font-semibold mb-4">Average Performance</h3>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">
                    {statistics.avgExecutionTime?.toFixed(0) || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Avg Execution Time (ms)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-purple-600">
                    {statistics.avgMemoryUsed?.toFixed(0) || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Avg Memory Used (KB)</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">
                    {statistics.avgScore?.toFixed(1) || "N/A"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Average Score</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Suspicion Breakdown Modal */}
      {suspicionModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={closeSuspicionModal}
          />
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 flex flex-col" style={{ maxHeight: 'calc(100vh - 40px)' }}>
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
                <div>
                  <h3 className="font-semibold">Suspicion Breakdown</h3>
                  <p className="text-sm text-gray-500">
                    Submission by {suspicionModalData.userName}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeSuspicionModal}
                className="h-8 w-8 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-4 flex-1 overflow-y-auto" style={{ overflowY: 'auto' }}>
              {/* Suspicion Significance */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-medium">Suspicion Level</span>
                  <span className={`text-lg font-bold px-3 py-1 rounded-full ${
                    suspicionModalData.breakdown.finalScore < 0.2 
                      ? 'bg-green-100 text-green-700' 
                      : suspicionModalData.breakdown.finalScore < 0.5 
                      ? 'bg-yellow-100 text-yellow-700' 
                      : suspicionModalData.breakdown.finalScore < 0.75 
                      ? 'bg-orange-100 text-orange-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {suspicionModalData.breakdown.finalScore < 0.2 
                      ? 'Low' 
                      : suspicionModalData.breakdown.finalScore < 0.5 
                      ? 'Moderate' 
                      : suspicionModalData.breakdown.finalScore < 0.75 
                      ? 'High' 
                      : 'Very High'}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  {suspicionModalData.breakdown.finalScore < 0.2 
                    ? 'This submission appears to be original work with minimal external assistance.' 
                    : suspicionModalData.breakdown.finalScore < 0.5 
                    ? 'Some external paste activity detected. Review the paste events below for details.' 
                    : suspicionModalData.breakdown.finalScore < 0.75 
                    ? 'Significant external paste activity detected. This may indicate copied code.' 
                    : 'High levels of external paste activity. This submission should be reviewed carefully.'}
                </p>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="p-3 bg-blue-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-blue-600">
                    {suspicionModalData.breakdown.totalPasteCount}
                  </p>
                  <p className="text-xs text-gray-600">Total Pastes</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-orange-600">
                    {suspicionModalData.breakdown.externalPasteCount}
                  </p>
                  <p className="text-xs text-gray-600">External Pastes</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-purple-600">
                    {suspicionModalData.breakdown.totalExternalPastedChars}
                  </p>
                  <p className="text-xs text-gray-600">External Chars</p>
                </div>
                <div className="p-3 bg-red-50 rounded-lg text-center">
                  <p className="text-xl font-bold text-red-600">
                    {suspicionModalData.breakdown.largestExternalPaste}
                  </p>
                  <p className="text-xs text-gray-600">Largest Paste</p>
                </div>
              </div>

              {/* Paste Events */}
              <div>
                <h4 className="font-medium mb-3 flex items-center gap-2">
                  <Clipboard className="w-4 h-4" />
                  Paste Events ({suspicionModalData.breakdown.pasteEvents?.length || 0})
                </h4>
                {suspicionModalData.breakdown.pasteEvents &&
                suspicionModalData.breakdown.pasteEvents.length > 0 ? (
                  <div className="space-y-3">
                    {suspicionModalData.breakdown.pasteEvents.map((event: PasteEvent, index: number) => (
                      <div
                        key={event.id || index}
                        className={`p-3 rounded-lg border ${
                          event.isExternal
                            ? event.suspicionScore > 0.5
                              ? 'bg-red-50 border-red-200'
                              : 'bg-orange-50 border-orange-200'
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                event.isExternal
                                  ? 'bg-orange-100 text-orange-700'
                                  : 'bg-green-100 text-green-700'
                              }
                            >
                              {event.isExternal ? 'External' : 'Internal'}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatTimestamp(event.timestamp)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">
                              {event.pastedLength} chars
                            </span>
                            {getSuspicionBadge(event.suspicionScore)}
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{event.reason}</p>
                        {event.pastedText && (
                          <pre className="text-xs bg-white p-2 rounded border overflow-x-auto max-h-24">
                            {event.pastedText.length > 200
                              ? event.pastedText.substring(0, 200) + '...'
                              : event.pastedText}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No paste events recorded
                  </p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end p-4 border-t flex-shrink-0">
              <Button variant="outline" onClick={closeSuspicionModal}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
