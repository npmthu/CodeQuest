import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Target,
  Award,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download,
  Loader2,
} from "lucide-react";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./ui/chart";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useApi } from "../api/ApiProvider";

interface BusinessStats {
  totalLearners: number;
  activeInstructors: number;
  totalCourses: number;
  averageCompletion: number;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  level: string;
  reputation: number;
  courses: number;
  completion: number;
}

interface CohortData {
  id: string;
  name: string;
  learners: number;
  instructors: number;
  courses: number;
  progress: number;
  startDate: string;
  status: string;
}

interface EngagementData {
  month: string;
  learners: number;
  completion: number;
}

interface DepartmentData {
  name: string;
  value: number;
  color: string;
}

interface ActivityData {
  type: string;
  user: string;
  action: string;
  target: string;
  time: string;
}

export default function BusinessDashboard() {
  const navigate = useNavigate();
  const api = useApi();

  // Fetch stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['business-stats'],
    queryFn: async () => {
      const response = await api.get('/business/stats');
      return response.data as BusinessStats;
    },
  });

  // Fetch leaderboard
  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ['business-leaderboard'],
    queryFn: async () => {
      const response = await api.get('/business/leaderboard');
      return response.data as LeaderboardEntry[];
    },
  });

  // Fetch analytics
  const { data: analyticsData, isLoading: analyticsLoading } = useQuery({
    queryKey: ['business-analytics'],
    queryFn: async () => {
      const response = await api.get('/business/analytics');
      return response.data as { engagement: EngagementData[]; departments: DepartmentData[] };
    },
  });

  // Fetch cohorts
  const { data: cohortsData, isLoading: cohortsLoading } = useQuery({
    queryKey: ['business-cohorts'],
    queryFn: async () => {
      const response = await api.get('/business/cohorts');
      return response.data as CohortData[];
    },
  });

  // Fetch activities
  const { data: activitiesData, isLoading: activitiesLoading } = useQuery({
    queryKey: ['business-activities'],
    queryFn: async () => {
      const response = await api.get('/business/activities');
      return response.data as ActivityData[];
    },
  });

  const stats = [
    {
      label: "Total Learners",
      value: statsData?.totalLearners ?? 0,
      change: "enrolled in courses",
      trend: "up" as const,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Active Instructors",
      value: statsData?.activeInstructors ?? 0,
      change: "linked to your account",
      trend: "up" as const,
      icon: GraduationCap,
      color: "bg-green-500",
    },
    {
      label: "Total Courses",
      value: statsData?.totalCourses ?? 0,
      change: "in your organization",
      trend: "up" as const,
      icon: BookOpen,
      color: "bg-purple-500",
    },
    {
      label: "Avg. Completion",
      value: `${statsData?.averageCompletion ?? 0}%`,
      change: "across all courses",
      trend: (statsData?.averageCompletion ?? 0) >= 50 ? "up" as const : "down" as const,
      icon: Target,
      color: "bg-orange-500",
    },
  ];

  const cohorts = cohortsData ?? [];
  const engagementData = analyticsData?.engagement ?? [];
  const performanceByDepartment = analyticsData?.departments ?? [];
  const topPerformers = leaderboardData ?? [];
  const recentActivities = activitiesData ?? [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "enrollment":
        return UserPlus;
      case "completion":
        return CheckCircle;
      case "instructor":
        return GraduationCap;
      case "achievement":
        return Award;
      default:
        return AlertCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "enrollment":
        return "bg-blue-100 text-blue-600";
      case "completion":
        return "bg-green-100 text-green-600";
      case "instructor":
        return "bg-purple-100 text-purple-600";
      case "achievement":
        return "bg-yellow-100 text-yellow-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent">
            Business Partner Dashboard
          </h2>
          <p className="text-gray-500 mt-1">
            Welcome back! Here's your organization's learning overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/business/analytics")}
            className="rounded-xl hover:bg-blue-50 hover:border-blue-200"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            View Reports
          </Button>
          <Button
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5"
            onClick={() => navigate("/business/account")}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Learners
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50 animate-pulse">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </Card>
          ))
        ) : (
          stats.map((stat) => {
            const Icon = stat.icon;
            const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
            const gradientColors: Record<string, string> = {
              "bg-blue-500":
                "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30",
              "bg-green-500":
                "bg-gradient-to-br from-green-500 to-emerald-600 shadow-green-500/30",
              "bg-purple-500":
                "bg-gradient-to-br from-purple-500 to-violet-600 shadow-purple-500/30",
              "bg-orange-500":
                "bg-gradient-to-br from-orange-500 to-amber-600 shadow-orange-500/30",
            };
            return (
              <Card
                key={stat.label}
                className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`w-12 h-12 ${
                      gradientColors[stat.color] || stat.color
                    } rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                      stat.trend === "up"
                        ? "text-green-600 bg-green-50"
                        : "text-red-600 bg-red-50"
                    }`}
                  >
                    <TrendIcon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <h3 className="mt-1 text-2xl font-bold text-gray-900">
                    {stat.value}
                  </h3>
                  <p className="text-xs mt-2 text-gray-500">
                    {stat.change}
                  </p>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Engagement Trend Chart */}
      <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Learner Engagement Trend
          </h3>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl hover:bg-blue-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
        <ChartContainer
          config={{
            learners: {
              label: "Active Learners",
              color: "hsl(var(--chart-1))",
            },
            completion: {
              label: "Completion Rate (%)",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-80"
        >
          <LineChart data={engagementData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="learners"
              stroke="#2563EB"
              strokeWidth={3}
              dot={{ fill: "#2563EB", r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="completion"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: "#10B981", r: 4 }}
            />
          </LineChart>
        </ChartContainer>
      </Card>

      {/* Cohorts & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Cohorts */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Your Courses
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/business/courses")}
              className="rounded-xl hover:bg-blue-50"
            >
              View All
            </Button>
          </div>
          {cohortsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50 animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                    <div className="h-12 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </Card>
              ))}
            </div>
          ) : cohorts.length === 0 ? (
            <Card className="p-8 rounded-2xl border-0 shadow-lg shadow-gray-200/50 text-center">
              <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h4 className="font-semibold text-gray-900 mb-2">No courses yet</h4>
              <p className="text-gray-500 mb-4">Create your first course to get started</p>
              <Button onClick={() => navigate("/business/courses")} className="bg-blue-600 hover:bg-blue-700">
                Create Course
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {cohorts.slice(0, 4).map((cohort) => (
                <Card
                  key={cohort.id}
                  className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all cursor-pointer"
                  onClick={() => navigate("/business/courses")}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {cohort.name}
                        </h4>
                        <Badge className={cohort.status === 'Active' ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                          {cohort.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        Started {cohort.startDate}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <div>
                        <p className="text-sm">{cohort.learners}</p>
                        <p className="text-xs text-muted-foreground">Learners</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-green-600" />
                      <div>
                        <p className="text-sm">{cohort.instructors}</p>
                        <p className="text-xs text-muted-foreground">
                          Instructors
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-purple-600" />
                      <div>
                        <p className="text-sm">{cohort.courses}</p>
                        <p className="text-xs text-muted-foreground">Courses</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">
                        Completion Rate
                      </span>
                      <span className="text-blue-600">{cohort.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all"
                        style={{ width: `${cohort.progress}%` }}
                      ></div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Performance by Course */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Enrollments by Course
          </h3>
          <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
            {analyticsLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <ChartContainer
                  config={{
                    value: {
                      label: "Enrollments",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                  className="h-64"
                >
                  <PieChart>
                    <Pie
                      data={performanceByDepartment}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {performanceByDepartment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-2 mt-4">
                  {performanceByDepartment.map((dept) => (
                    <div
                      key={dept.name}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        ></div>
                        <span className="text-sm truncate max-w-[120px]">{dept.name}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {dept.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      {/* Top Performers & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Performers
            </h3>
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
              <Award className="w-5 h-5 text-white" />
            </div>
          </div>
          {leaderboardLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : topPerformers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No learner data available yet
            </div>
          ) : (
            <div className="space-y-3">
              {topPerformers.slice(0, 5).map((performer, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-4 p-4 rounded-xl transition-all ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 shadow-md"
                      : "bg-gray-50 hover:bg-gray-100"
                  }`}
                >
                  <div className="text-sm text-gray-500 w-8 font-medium">
                    #{performer.rank || index + 1}
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center overflow-hidden">
                    {performer.avatar ? (
                      <img src={performer.avatar} alt={performer.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm text-white font-medium">
                        {performer.name?.substring(0, 2).toUpperCase() || '??'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {performer.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {performer.level || 'Beginner'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-blue-600">
                      {performer.completion}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {performer.courses} courses
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Activities */}
        <Card className="p-6 rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Recent Activities
          </h3>
          {activitiesLoading ? (
            <div className="flex items-center justify-center h-48">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No recent activities
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                const colorClass = getActivityColor(activity.type);
                return (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-all"
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">
                          {activity.user}
                        </span>
                        {` ${activity.action} `}
                        <span className="text-blue-600 font-medium">
                          {activity.target}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
