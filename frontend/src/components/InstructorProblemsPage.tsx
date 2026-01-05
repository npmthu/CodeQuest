import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  FileCode,
  Plus,
  Eye,
  Users,
  CheckCircle2,
  Clock,
  BarChart3,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInstructorProblems } from "../hooks/useApi";
import { useState } from "react";

export default function InstructorProblemsPage() {
  const navigate = useNavigate();
  const { data: problems, isLoading, error } = useInstructorProblems();
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null);

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

  const getStatusBadge = (isPublished: boolean) => {
    return isPublished ? (
      <Badge className="bg-green-100 text-green-700">Published</Badge>
    ) : (
      <Badge className="bg-yellow-100 text-yellow-700">Draft</Badge>
    );
  };

  const filteredProblems = (problems || []).filter((problem: any) => {
    const matchesSearch =
      !searchTerm ||
      problem.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      problem.slug.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDifficulty =
      difficultyFilter === null || problem.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-6 text-center text-red-600">
          Failed to load problems. Please try again.
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Problems</h2>
          <p className="text-muted-foreground mt-1">
            Manage coding problems you've created
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate("/instructor/problems/create")}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Problem
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileCode className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Problems</p>
              <p className="text-xl font-bold">{problems?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Published</p>
              <p className="text-xl font-bold">
                {problems?.filter((p: any) => p.is_published).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
              <p className="text-xl font-bold">
                {problems?.reduce(
                  (sum: number, p: any) => sum + (p.submissionCount || 0),
                  0
                ) || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unique Submitters</p>
              <p className="text-xl font-bold">
                {problems?.reduce(
                  (sum: number, p: any) => sum + (p.uniqueSubmitters || 0),
                  0
                ) || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search problems..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={difficultyFilter ?? ""}
            onChange={(e) =>
              setDifficultyFilter(e.target.value ? Number(e.target.value) : null)
            }
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Difficulties</option>
            <option value="1">Easy</option>
            <option value="2">Medium</option>
            <option value="3">Hard</option>
          </select>
        </div>
      </div>

      {/* Problems List */}
      {filteredProblems.length === 0 ? (
        <Card className="p-12 text-center">
          <FileCode className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            {searchTerm || difficultyFilter
              ? "No problems match your filters"
              : "No problems yet"}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || difficultyFilter
              ? "Try adjusting your search or filter criteria"
              : "Create your first coding problem to get started"}
          </p>
          {!searchTerm && !difficultyFilter && (
            <Button
              onClick={() => navigate("/instructor/problems/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Problem
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredProblems.map((problem: any) => (
            <Card
              key={problem.id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/instructor/problems/${problem.id}`)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold">{problem.title}</h3>
                    {getDifficultyBadge(problem.difficulty)}
                    {getStatusBadge(problem.is_published)}
                    {problem.is_premium && (
                      <Badge className="bg-purple-100 text-purple-700">
                        Premium
                      </Badge>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 mb-3">
                    Slug: <code className="bg-gray-100 px-1 rounded">{problem.slug}</code>
                    {problem.topicName && (
                      <span className="ml-4">
                        Topic: <span className="font-medium">{problem.topicName}</span>
                      </span>
                    )}
                    {problem.courseName && (
                      <span className="ml-2">
                        ({problem.courseName})
                      </span>
                    )}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <BarChart3 className="w-4 h-4" />
                      <span>{problem.submissionCount} submissions</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      <span>{problem.uniqueSubmitters} users</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{problem.testCaseCount} test cases</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>{problem.time_limit_ms}ms limit</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    navigate(`/instructor/problems/${problem.id}`);
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </div>

              {/* Acceptance Rate Bar */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">Acceptance Rate</span>
                  <span className="font-medium">
                    {problem.acceptance_rate
                      ? `${problem.acceptance_rate.toFixed(1)}%`
                      : "N/A"}
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all"
                    style={{
                      width: `${problem.acceptance_rate || 0}%`,
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
