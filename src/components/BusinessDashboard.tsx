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
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3,
  Download
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
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";

interface BusinessDashboardProps {
  onNavigate: (page: string) => void;
}

export default function BusinessDashboard({ onNavigate }: BusinessDashboardProps) {
  const stats = [
    { 
      label: "Total Learners", 
      value: 1247, 
      change: "+124 this month",
      trend: "up",
      icon: Users, 
      color: "bg-blue-500" 
    },
    { 
      label: "Active Instructors", 
      value: 18, 
      change: "+3 this month",
      trend: "up",
      icon: GraduationCap, 
      color: "bg-green-500" 
    },
    { 
      label: "Enrolled Courses", 
      value: 45, 
      change: "+8 this month",
      trend: "up",
      icon: BookOpen, 
      color: "bg-purple-500" 
    },
    { 
      label: "Avg. Completion", 
      value: "78%", 
      change: "-2.3% from last month",
      trend: "down",
      icon: Target, 
      color: "bg-orange-500" 
    },
  ];

  const cohorts = [
    {
      id: 1,
      name: "Software Engineering Cohort 2024",
      learners: 85,
      instructors: 4,
      courses: 12,
      progress: 72,
      startDate: "Jan 2024",
      status: "Active"
    },
    {
      id: 2,
      name: "Data Science Bootcamp Q1",
      learners: 62,
      instructors: 3,
      courses: 8,
      progress: 68,
      startDate: "Feb 2024",
      status: "Active"
    },
    {
      id: 3,
      name: "Web Development Fast Track",
      learners: 124,
      instructors: 5,
      courses: 15,
      progress: 85,
      startDate: "Dec 2023",
      status: "Active"
    },
    {
      id: 4,
      name: "Mobile App Development",
      learners: 48,
      instructors: 2,
      courses: 10,
      progress: 45,
      startDate: "Mar 2024",
      status: "Active"
    },
  ];

  const engagementData = [
    { month: "Jan", learners: 980, completion: 75 },
    { month: "Feb", learners: 1050, completion: 76 },
    { month: "Mar", learners: 1120, completion: 78 },
    { month: "Apr", learners: 1180, completion: 77 },
    { month: "May", learners: 1230, completion: 79 },
    { month: "Jun", learners: 1247, completion: 78 },
  ];

  const performanceByDepartment = [
    { name: "Engineering", value: 35, color: "#2563EB" },
    { name: "Data Science", value: 28, color: "#10B981" },
    { name: "Design", value: 18, color: "#F59E0B" },
    { name: "Marketing", value: 12, color: "#8B5CF6" },
    { name: "Others", value: 7, color: "#EC4899" },
  ];

  const topPerformers = [
    { 
      name: "Alice Johnson", 
      department: "Engineering",
      courses: 8, 
      completion: 95, 
      avatar: "AJ",
      score: 2850 
    },
    { 
      name: "Bob Smith", 
      department: "Data Science",
      courses: 6, 
      completion: 92, 
      avatar: "BS",
      score: 2720 
    },
    { 
      name: "Carol White", 
      department: "Engineering",
      courses: 7, 
      completion: 90, 
      avatar: "CW",
      score: 2580 
    },
    { 
      name: "David Lee", 
      department: "Design",
      courses: 5, 
      completion: 88, 
      avatar: "DL",
      score: 2410 
    },
    { 
      name: "Emma Wilson", 
      department: "Marketing",
      courses: 6, 
      completion: 85, 
      avatar: "EW",
      score: 2290 
    },
  ];

  const recentActivities = [
    {
      type: "enrollment",
      user: "John Doe",
      action: "enrolled in",
      target: "Python Masterclass",
      time: "2 hours ago"
    },
    {
      type: "completion",
      user: "Sarah Miller",
      action: "completed",
      target: "Web Development Course",
      time: "5 hours ago"
    },
    {
      type: "instructor",
      user: "Mike Chen",
      action: "was assigned as instructor to",
      target: "Data Science Cohort",
      time: "1 day ago"
    },
    {
      type: "achievement",
      user: "Lisa Brown",
      action: "earned certification in",
      target: "React Development",
      time: "2 days ago"
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "enrollment": return UserPlus;
      case "completion": return CheckCircle;
      case "instructor": return GraduationCap;
      case "achievement": return Award;
      default: return AlertCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case "enrollment": return "bg-blue-100 text-blue-600";
      case "completion": return "bg-green-100 text-green-600";
      case "instructor": return "bg-purple-100 text-purple-600";
      case "achievement": return "bg-yellow-100 text-yellow-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Business Partner Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's your organization's learning overview
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => onNavigate("business-analytics")}>
            <BarChart3 className="w-4 h-4 mr-2" />
            View Reports
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => onNavigate("business-account")}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add Learners
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

      {/* Engagement Trend Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Learner Engagement Trend</h3>
          <Button variant="outline" size="sm">
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
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
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
            <h3>Active Cohorts</h3>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onNavigate("business-account")}
            >
              View All
            </Button>
          </div>
          <div className="space-y-4">
            {cohorts.map((cohort) => (
              <Card key={cohort.id} className="p-6 hover:shadow-lg transition-all cursor-pointer">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4>{cohort.name}</h4>
                      <Badge className="bg-green-100 text-green-700">
                        {cohort.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
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
                      <p className="text-xs text-muted-foreground">Instructors</p>
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
                    <span className="text-muted-foreground">Overall Progress</span>
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
        </div>

        {/* Performance by Department */}
        <div>
          <h3 className="mb-4">Performance by Department</h3>
          <Card className="p-6">
            <ChartContainer
              config={{
                value: {
                  label: "Percentage",
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
                <div key={dept.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: dept.color }}
                    ></div>
                    <span className="text-sm">{dept.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{dept.value}%</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Top Performers & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3>Top Performers</h3>
            <Award className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="space-y-3">
            {topPerformers.map((performer, index) => (
              <div
                key={index}
                className={`flex items-center gap-4 p-4 rounded-lg ${
                  index === 0 ? "bg-yellow-50 border border-yellow-200" : "bg-gray-50"
                }`}
              >
                <div className="text-sm text-muted-foreground w-8">#{index + 1}</div>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm text-blue-600">{performer.avatar}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{performer.name}</p>
                  <p className="text-xs text-muted-foreground">{performer.department}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-blue-600">{performer.completion}%</p>
                  <p className="text-xs text-muted-foreground">{performer.courses} courses</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6">
          <h3 className="mb-6">Recent Activities</h3>
          <div className="space-y-3">
            {recentActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              return (
                <div key={index} className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      {` ${activity.action} `}
                      <span className="text-blue-600">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
