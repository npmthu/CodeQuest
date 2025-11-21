import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Users,
  TrendingUp,
  TrendingDown,
  Award,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  Search,
  Download,
  Filter,
  BarChart3,
  BookOpen,
  Star,
  Activity
} from "lucide-react";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "./ui/chart";
import { 
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

interface BusinessLearnerPerformanceProps {
  onNavigate: (page: string) => void;
}

export default function BusinessLearnerPerformance({ onNavigate }: BusinessLearnerPerformanceProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCohort, setSelectedCohort] = useState("all");

  const stats = [
    { 
      label: "Avg. Progress", 
      value: "78%", 
      change: "+5.2% from last month",
      trend: "up",
      icon: Target, 
      color: "bg-blue-500" 
    },
    { 
      label: "Completion Rate", 
      value: "72%", 
      change: "+3.8% from last month",
      trend: "up",
      icon: CheckCircle, 
      color: "bg-green-500" 
    },
    { 
      label: "Active Learners", 
      value: "1,058", 
      change: "+124 from last month",
      trend: "up",
      icon: Users, 
      color: "bg-purple-500" 
    },
    { 
      label: "Avg. Study Time", 
      value: "4.2h/week", 
      change: "-0.3h from last month",
      trend: "down",
      icon: Clock, 
      color: "bg-orange-500" 
    },
  ];

  const progressOverTime = [
    { date: "Week 1", progress: 45, active: 920, completion: 38 },
    { date: "Week 2", progress: 52, active: 945, completion: 45 },
    { date: "Week 3", progress: 58, active: 980, completion: 52 },
    { date: "Week 4", progress: 65, active: 1010, completion: 58 },
    { date: "Week 5", progress: 70, active: 1025, completion: 64 },
    { date: "Week 6", progress: 75, active: 1045, completion: 68 },
    { date: "Week 7", progress: 78, active: 1058, completion: 72 },
  ];

  const coursePerformance = [
    { 
      course: "Python Programming",
      enrolled: 342,
      completed: 256,
      inProgress: 68,
      notStarted: 18,
      avgScore: 85,
      completionRate: 75
    },
    { 
      course: "Data Structures & Algorithms",
      enrolled: 298,
      completed: 198,
      inProgress: 82,
      notStarted: 18,
      avgScore: 78,
      completionRate: 66
    },
    { 
      course: "Web Development",
      enrolled: 456,
      completed: 358,
      inProgress: 86,
      notStarted: 12,
      avgScore: 82,
      completionRate: 78
    },
    { 
      course: "Machine Learning",
      enrolled: 186,
      completed: 124,
      inProgress: 52,
      notStarted: 10,
      avgScore: 80,
      completionRate: 67
    },
  ];

  const topPerformers = [
    { 
      name: "Alice Johnson", 
      department: "Engineering",
      cohort: "Software Engineering 2024",
      courses: 8, 
      completion: 95,
      avgScore: 92,
      avatar: "AJ",
      badges: 12,
      streak: 45
    },
    { 
      name: "Bob Smith", 
      department: "Data Science",
      cohort: "Data Science Bootcamp",
      courses: 6, 
      completion: 92,
      avgScore: 89,
      avatar: "BS",
      badges: 10,
      streak: 38
    },
    { 
      name: "Carol White", 
      department: "Engineering",
      cohort: "Software Engineering 2024",
      courses: 7, 
      completion: 90,
      avgScore: 88,
      avatar: "CW",
      badges: 11,
      streak: 42
    },
    { 
      name: "David Lee", 
      department: "Design",
      cohort: "UX/UI Design Track",
      courses: 5, 
      completion: 88,
      avgScore: 86,
      avatar: "DL",
      badges: 8,
      streak: 30
    },
    { 
      name: "Emma Wilson", 
      department: "Marketing",
      cohort: "Web Development",
      courses: 6, 
      completion: 85,
      avgScore: 85,
      avatar: "EW",
      badges: 9,
      streak: 28
    },
  ];

  const atRiskLearners = [
    {
      name: "John Doe",
      department: "Engineering",
      cohort: "Software Engineering 2024",
      progress: 25,
      lastActive: "15 days ago",
      issueReason: "Low activity",
      avatar: "JD"
    },
    {
      name: "Jane Smith",
      department: "Data Science",
      cohort: "Data Science Bootcamp",
      progress: 32,
      lastActive: "8 days ago",
      issueReason: "Failing assessments",
      avatar: "JS"
    },
    {
      name: "Mike Brown",
      department: "Design",
      cohort: "UX/UI Design Track",
      progress: 18,
      lastActive: "22 days ago",
      issueReason: "No recent activity",
      avatar: "MB"
    },
  ];

  const engagementByDepartment = [
    { department: "Engineering", avg: 82, learners: 456 },
    { department: "Data Science", avg: 78, learners: 298 },
    { department: "Design", avg: 75, learners: 186 },
    { department: "Marketing", avg: 72, learners: 124 },
    { department: "Product", avg: 68, learners: 98 },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Learner Performance</h2>
          <p className="text-muted-foreground mt-1">
            Track and analyze learner progress and engagement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={selectedCohort} onValueChange={setSelectedCohort}>
            <SelectTrigger className="w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cohorts</SelectItem>
              <SelectItem value="se-2024">Software Engineering 2024</SelectItem>
              <SelectItem value="ds-q1">Data Science Bootcamp</SelectItem>
              <SelectItem value="web-ft">Web Development</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <Card key={stat.label} className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <h3 className="mt-1">{stat.value}</h3>
                <div className={`flex items-center gap-1 mt-2 ${
                  stat.trend === "up" ? "text-green-600" : "text-red-600"
                }`}>
                  <TrendIcon className="w-4 h-4" />
                  <p className="text-xs">{stat.change}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Progress Over Time Chart */}
      <Card className="p-6">
        <h3 className="mb-6">Progress & Engagement Trends</h3>
        <ChartContainer
          config={{
            progress: {
              label: "Avg Progress (%)",
              color: "hsl(var(--chart-1))",
            },
            active: {
              label: "Active Learners",
              color: "hsl(var(--chart-2))",
            },
            completion: {
              label: "Completion Rate (%)",
              color: "hsl(var(--chart-3))",
            },
          }}
          className="h-80"
        >
          <AreaChart data={progressOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="progress"
              stroke="#2563EB"
              fill="#2563EB"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="completion"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </Card>

      {/* Course Performance & Department Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <Card className="p-6">
          <h3 className="mb-6">Performance by Course</h3>
          <div className="space-y-4">
            {coursePerformance.map((course, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm">{course.course}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {course.enrolled} enrolled
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      {course.completionRate}%
                    </p>
                    <p className="text-xs text-muted-foreground">Completion</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-xs text-muted-foreground">Completed</p>
                    <p className="text-sm font-medium text-green-600">{course.completed}</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-xs text-muted-foreground">In Progress</p>
                    <p className="text-sm font-medium text-blue-600">{course.inProgress}</p>
                  </div>
                  <div className="text-center p-2 bg-white rounded">
                    <p className="text-xs text-muted-foreground">Not Started</p>
                    <p className="text-sm font-medium text-gray-600">{course.notStarted}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Avg. Score</span>
                  <span className="text-sm font-medium text-blue-600">{course.avgScore}%</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Engagement by Department */}
        <Card className="p-6">
          <h3 className="mb-6">Engagement by Department</h3>
          <ChartContainer
            config={{
              avg: {
                label: "Avg. Progress (%)",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-64"
          >
            <BarChart data={engagementByDepartment} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="department" type="category" tick={{ fontSize: 12 }} width={100} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="avg" fill="#2563EB" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ChartContainer>
        </Card>
      </div>

      {/* Tabs for Top Performers and At-Risk */}
      <Tabs defaultValue="top" className="space-y-6">
        <TabsList>
          <TabsTrigger value="top">
            <Award className="w-4 h-4 mr-2" />
            Top Performers
          </TabsTrigger>
          <TabsTrigger value="risk">
            <AlertCircle className="w-4 h-4 mr-2" />
            At-Risk Learners
          </TabsTrigger>
        </TabsList>

        {/* Top Performers Tab */}
        <TabsContent value="top">
          <Card className="p-6">
            <div className="space-y-4">
              {topPerformers.map((learner, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-4 p-4 rounded-lg ${
                    idx === 0 ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"
                  }`}
                >
                  <div className="text-lg font-medium text-muted-foreground w-8">
                    #{idx + 1}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600">{learner.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{learner.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {learner.department}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{learner.cohort}</p>
                  </div>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Completion</p>
                      <p className="text-sm font-medium text-green-600">{learner.completion}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Avg. Score</p>
                      <p className="text-sm font-medium text-blue-600">{learner.avgScore}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Courses</p>
                      <p className="text-sm font-medium">{learner.courses}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Streak</p>
                      <p className="text-sm font-medium text-orange-600">{learner.streak} days</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* At-Risk Learners Tab */}
        <TabsContent value="risk">
          <Card className="p-6">
            <div className="space-y-4">
              {atRiskLearners.map((learner, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-4 p-4 rounded-lg bg-red-50 border border-red-200"
                >
                  <AlertCircle className="w-8 h-8 text-red-600 flex-shrink-0" />
                  <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-sm text-red-600">{learner.avatar}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{learner.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {learner.department}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{learner.cohort}</p>
                    <p className="text-xs text-red-600 mt-1">{learner.issueReason}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="text-lg font-medium text-red-600">{learner.progress}%</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Last active: {learner.lastActive}
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Take Action
                  </Button>
                </div>
              ))}
            </div>
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Activity className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-blue-900">Recommended Actions</p>
                  <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                    <li>Send automated reminder emails to inactive learners</li>
                    <li>Assign mentors to struggling students</li>
                    <li>Schedule one-on-one check-ins with at-risk learners</li>
                    <li>Provide additional learning resources</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
