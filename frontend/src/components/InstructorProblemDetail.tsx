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
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useInstructorProblemDetail } from "../hooks/useApi";
import { useState } from "react";

export default function InstructorProblemDetail() {
  const { problemId } = useParams<{ problemId: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error } = useInstructorProblemDetail(problemId || "");
  const [expandedSubmissions, setExpandedSubmissions] = useState<Set<string>>(
    new Set()
  );

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
            Slug: <code className="bg-gray-100 px-1 rounded">{problem.slug}</code>
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
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: problem.description || "No description" }}
              />
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Input/Output Format</h3>
              {problemIO ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Input Format:
                    </p>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(problemIO.input, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-2">
                      Output Format:
                    </p>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                      {JSON.stringify(problemIO.output, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No I/O format defined</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Constraints</h3>
              {problem.constraints ? (
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: problem.constraints }}
                />
              ) : (
                <p className="text-gray-500">No constraints defined</p>
              )}
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Hints</h3>
              {problem.hints && problem.hints.length > 0 ? (
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
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto max-h-32">
                          {typeof tc.input === "object"
                            ? JSON.stringify(tc.input, null, 2)
                            : tc.input}
                        </pre>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-600 mb-1">
                          Expected Output:
                        </p>
                        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto max-h-32">
                          {typeof tc.expected_output === "object"
                            ? JSON.stringify(tc.expected_output, null, 2)
                            : tc.expected_output}
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
                        <th className="text-left p-3 font-medium">Time</th>
                        <th className="text-left p-3 font-medium">Submitted</th>
                        <th className="text-left p-3 font-medium">Actions</th>
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
                              <td colSpan={8} className="p-4 bg-gray-50">
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
    </div>
  );
}
