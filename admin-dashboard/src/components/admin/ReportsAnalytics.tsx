import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  BookOpen,
  Award,
  Download,
  Calendar,
  Loader2,
  BarChart3,
  PieChart as PieChartIcon,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Clock,
  Target,
  Zap,
  Star,
} from "lucide-react";
import { toast } from "sonner";

interface RevenueData {
  month: string;
  revenue: number;
  subscriptions: number;
  courses: number;
}

interface UserGrowthData {
  month: string;
  newUsers: number;
  activeUsers: number;
  churnedUsers: number;
}

interface CoursePerformance {
  name: string;
  enrollments: number;
  completionRate: number;
  rating: number;
  revenue: number;
}

interface TopicDistribution {
  name: string;
  value: number;
  color: string;
}

export default function ReportsAnalytics() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState("30days");
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const revenueData: RevenueData[] = [
    { month: "Jul", revenue: 45000, subscriptions: 32000, courses: 13000 },
    { month: "Aug", revenue: 52000, subscriptions: 38000, courses: 14000 },
    { month: "Sep", revenue: 48000, subscriptions: 35000, courses: 13000 },
    { month: "Oct", revenue: 61000, subscriptions: 45000, courses: 16000 },
    { month: "Nov", revenue: 55000, subscriptions: 40000, courses: 15000 },
    { month: "Dec", revenue: 67000, subscriptions: 50000, courses: 17000 },
    { month: "Jan", revenue: 72000, subscriptions: 54000, courses: 18000 },
  ];

  const userGrowthData: UserGrowthData[] = [
    { month: "Jul", newUsers: 1200, activeUsers: 8500, churnedUsers: 150 },
    { month: "Aug", newUsers: 1450, activeUsers: 9200, churnedUsers: 180 },
    { month: "Sep", newUsers: 1100, activeUsers: 9500, churnedUsers: 200 },
    { month: "Oct", newUsers: 1800, activeUsers: 10200, churnedUsers: 170 },
    { month: "Nov", newUsers: 1600, activeUsers: 11000, churnedUsers: 190 },
    { month: "Dec", newUsers: 2100, activeUsers: 12500, churnedUsers: 210 },
    { month: "Jan", newUsers: 2400, activeUsers: 14200, churnedUsers: 180 },
  ];

  const topCourses: CoursePerformance[] = [
    {
      name: "Advanced JavaScript",
      enrollments: 4520,
      completionRate: 72,
      rating: 4.8,
      revenue: 45200,
    },
    {
      name: "Python for Data Science",
      enrollments: 3890,
      completionRate: 68,
      rating: 4.7,
      revenue: 38900,
    },
    {
      name: "React Masterclass",
      enrollments: 3450,
      completionRate: 75,
      rating: 4.9,
      revenue: 34500,
    },
    {
      name: "Machine Learning Basics",
      enrollments: 2980,
      completionRate: 65,
      rating: 4.6,
      revenue: 29800,
    },
    {
      name: "AWS Cloud Practitioner",
      enrollments: 2650,
      completionRate: 82,
      rating: 4.8,
      revenue: 26500,
    },
  ];

  const topicDistribution: TopicDistribution[] = [
    { name: "Web Development", value: 35, color: "#3B82F6" },
    { name: "Data Science", value: 25, color: "#10B981" },
    { name: "Mobile Development", value: 15, color: "#F59E0B" },
    { name: "DevOps", value: 12, color: "#8B5CF6" },
    { name: "Cybersecurity", value: 8, color: "#EF4444" },
    { name: "Other", value: 5, color: "#6B7280" },
  ];

  const engagementData = [
    { day: "Mon", lessons: 4500, quizzes: 1200, coding: 2800 },
    { day: "Tue", lessons: 5200, quizzes: 1400, coding: 3100 },
    { day: "Wed", lessons: 4800, quizzes: 1300, coding: 2900 },
    { day: "Thu", lessons: 5500, quizzes: 1600, coding: 3400 },
    { day: "Fri", lessons: 4200, quizzes: 1100, coding: 2500 },
    { day: "Sat", lessons: 3500, quizzes: 900, coding: 2100 },
    { day: "Sun", lessons: 3800, quizzes: 1000, coding: 2300 },
  ];

  const subscriptionMetrics = {
    totalMRR: 54000,
    mrrGrowth: 12.5,
    churnRate: 2.3,
    ltv: 450,
    arpu: 35,
    conversionRate: 8.5,
  };

  const kpiMetrics = [
    {
      label: "Total Revenue",
      value: "$72,000",
      change: 15.2,
      trend: "up",
      icon: DollarSign,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Active Users",
      value: "14,200",
      change: 13.6,
      trend: "up",
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Course Completions",
      value: "3,240",
      change: 8.4,
      trend: "up",
      icon: Award,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Avg. Session Time",
      value: "42 min",
      change: -2.1,
      trend: "down",
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  useEffect(() => {
    setTimeout(() => setLoading(false), 500);
  }, []);

  const handleExport = (reportType: string) => {
    toast.success(`Exporting ${reportType} report...`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-blue-800 bg-clip-text text-transparent">
            Reports & Analytics
          </h1>
          <p className="text-gray-500 mt-1">
            Comprehensive platform insights and metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40 h-11 rounded-xl">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => handleExport("full")}
            className="rounded-xl hover:bg-blue-50 hover:border-blue-200"
          >
            <Download className="w-4 h-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiMetrics.map((metric) => {
          const Icon = metric.icon;
          const gradientClasses: Record<string, string> = {
            "bg-green-100 text-green-600":
              "bg-gradient-to-br from-green-400 to-emerald-500 shadow-green-500/30",
            "bg-blue-100 text-blue-600":
              "bg-gradient-to-br from-blue-400 to-indigo-500 shadow-blue-500/30",
            "bg-purple-100 text-purple-600":
              "bg-gradient-to-br from-purple-400 to-violet-500 shadow-purple-500/30",
            "bg-yellow-100 text-yellow-600":
              "bg-gradient-to-br from-yellow-400 to-orange-500 shadow-yellow-500/30",
          };
          return (
            <Card
              key={metric.label}
              className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl transition-all"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                      gradientClasses[metric.color] || metric.color
                    }`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                      metric.trend === "up"
                        ? "text-green-600 bg-green-50"
                        : "text-red-600 bg-red-50"
                    }`}
                  >
                    {metric.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {Math.abs(metric.change)}%
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}
                  </p>
                  <p className="text-sm text-gray-500">{metric.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="overview"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger
            value="revenue"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <DollarSign className="w-4 h-4 mr-2" />
            Revenue
          </TabsTrigger>
          <TabsTrigger
            value="users"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Users className="w-4 h-4 mr-2" />
            Users
          </TabsTrigger>
          <TabsTrigger
            value="courses"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Courses
          </TabsTrigger>
          <TabsTrigger
            value="engagement"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Zap className="w-4 h-4 mr-2" />
            Engagement
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50">
              <CardHeader>
                <CardTitle className="text-gray-900">Revenue Trend</CardTitle>
                <CardDescription>Monthly revenue breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => `$${value.toLocaleString()}`}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="subscriptions"
                      stackId="1"
                      stroke="#3B82F6"
                      fill="#3B82F6"
                      fillOpacity={0.6}
                      name="Subscriptions"
                    />
                    <Area
                      type="monotone"
                      dataKey="courses"
                      stackId="1"
                      stroke="#10B981"
                      fill="#10B981"
                      fillOpacity={0.6}
                      name="Courses"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* User Growth */}
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>New vs Active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={userGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="newUsers"
                      stroke="#3B82F6"
                      strokeWidth={2}
                      name="New Users"
                    />
                    <Line
                      type="monotone"
                      dataKey="activeUsers"
                      stroke="#10B981"
                      strokeWidth={2}
                      name="Active Users"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Topic Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Topic Distribution</CardTitle>
                <CardDescription>Enrollment by topic</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={topicDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {topicDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `${value}%`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {topicDistribution.map((topic) => (
                    <div key={topic.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: topic.color }}
                      />
                      <span className="text-xs text-gray-600">
                        {topic.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Courses */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Top Performing Courses</CardTitle>
                  <CardDescription>By enrollments and revenue</CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExport("courses")}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCourses.map((course, index) => (
                    <div
                      key={course.name}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-medium">{course.name}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {course.enrollments.toLocaleString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {course.completionRate}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500" />
                              {course.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">
                          ${course.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Revenue</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Monthly Recurring Revenue
                    </p>
                    <p className="text-3xl font-bold">
                      ${subscriptionMetrics.totalMRR.toLocaleString()}
                    </p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <TrendingUp className="w-3 h-3 mr-1" />+
                    {subscriptionMetrics.mrrGrowth}%
                  </Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Average Revenue Per User
                    </p>
                    <p className="text-3xl font-bold">
                      ${subscriptionMetrics.arpu}
                    </p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">ARPU</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">
                      Customer Lifetime Value
                    </p>
                    <p className="text-3xl font-bold">
                      ${subscriptionMetrics.ltv}
                    </p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">LTV</Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue by Source</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => `$${value.toLocaleString()}`}
                  />
                  <Legend />
                  <Bar
                    dataKey="subscriptions"
                    fill="#3B82F6"
                    name="Subscriptions"
                  />
                  <Bar dataKey="courses" fill="#10B981" name="Course Sales" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-bold">45,230</p>
                <p className="text-sm text-green-600 mt-1">+2,400 this month</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Active Users (30d)</p>
                <p className="text-3xl font-bold">14,200</p>
                <p className="text-sm text-gray-500 mt-1">31.4% of total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Churn Rate</p>
                <p className="text-3xl font-bold">
                  {subscriptionMetrics.churnRate}%
                </p>
                <p className="text-sm text-green-600 mt-1">
                  -0.2% vs last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Conversion Rate</p>
                <p className="text-3xl font-bold">
                  {subscriptionMetrics.conversionRate}%
                </p>
                <p className="text-sm text-green-600 mt-1">Free to Paid</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>User Growth & Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                    name="Active Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="newUsers"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.3}
                    name="New Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="churnedUsers"
                    stroke="#EF4444"
                    fill="#EF4444"
                    fillOpacity={0.3}
                    name="Churned Users"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Total Courses</p>
                <p className="text-3xl font-bold">156</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Total Enrollments</p>
                <p className="text-3xl font-bold">67,450</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Avg. Completion Rate</p>
                <p className="text-3xl font-bold">68%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-sm text-gray-500">Avg. Rating</p>
                <p className="text-3xl font-bold flex items-center">
                  4.6{" "}
                  <Star className="w-5 h-5 ml-1 text-yellow-500 fill-yellow-500" />
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Course Performance Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={topCourses} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={150} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="enrollments"
                    fill="#3B82F6"
                    name="Enrollments"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Engagement Tab */}
        <TabsContent value="engagement" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Engagement by Activity Type</CardTitle>
              <CardDescription>
                Lessons watched, quizzes taken, and coding challenges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="lessons" fill="#3B82F6" name="Lessons" />
                  <Bar dataKey="quizzes" fill="#10B981" name="Quizzes" />
                  <Bar
                    dataKey="coding"
                    fill="#F59E0B"
                    name="Coding Challenges"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
