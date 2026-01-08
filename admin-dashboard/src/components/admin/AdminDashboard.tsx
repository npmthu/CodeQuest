import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Download,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Eye,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
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
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { adminApi } from "../../services/api";
import { toast } from "sonner";

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  revenue: number;
  userGrowth: { month: string; users: number }[];
  courseEnrollments: { topic: string; enrollments: number }[];
  userDistribution: { name: string; value: number; color: string }[];
  recentActivities: { user: string; action: string; time: string }[];
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalCourses: 0,
    revenue: 0,
    userGrowth: [],
    courseEnrollments: [],
    userDistribution: [],
    recentActivities: [],
  });

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // Fetch multiple endpoints in parallel
      const [usersRes, coursesRes, plansRes] = await Promise.all([
        adminApi.getUsers(1, 1000),
        adminApi.getCourses(1, 1000),
        adminApi.getPlans(),
      ]);

      const users = usersRes.data?.users || [];
      const courses = coursesRes.data?.courses || coursesRes.data || [];
      const plans = plansRes.data || [];

      // Calculate stats from real data
      const totalUsers = usersRes.data?.pagination?.total || users.length;
      const premiumUsers = users.filter(
        (u: any) => u.subscription_tier && u.subscription_tier !== "free"
      ).length;
      const freeUsers = totalUsers - premiumUsers;

      // Group enrollments by topic
      const topicEnrollments: Record<string, number> = {};
      courses.forEach((course: any) => {
        const topic = course.topic_name || course.topic || "Other";
        topicEnrollments[topic] =
          (topicEnrollments[topic] || 0) + (course.enrollment_count || 0);
      });

      const courseEnrollmentData = Object.entries(topicEnrollments)
        .map(([topic, enrollments]) => ({ topic, enrollments }))
        .sort((a, b) => b.enrollments - a.enrollments)
        .slice(0, 6);

      // Generate user growth (last 7 months based on created_at)
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const usersByMonth: Record<string, number> = {};
      const now = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = monthNames[date.getMonth()];
        usersByMonth[key] = 0;
      }

      users.forEach((user: any) => {
        const createdAt = new Date(user.created_at);
        const monthKey = monthNames[createdAt.getMonth()];
        if (usersByMonth[monthKey] !== undefined) {
          usersByMonth[monthKey]++;
        }
      });

      // Cumulative count
      let cumulative = 0;
      const userGrowthData = Object.entries(usersByMonth).map(
        ([month, count]) => {
          cumulative += count;
          return { month, users: cumulative || totalUsers };
        }
      );

      setStats({
        totalUsers,
        activeUsers: users.filter((u: any) => {
          const lastActive = new Date(u.last_sign_in_at || u.created_at);
          const daysSinceActive =
            (Date.now() - lastActive.getTime()) / (1000 * 60 * 60 * 24);
          return daysSinceActive < 30;
        }).length,
        totalCourses: courses.length,
        revenue: premiumUsers * 39, // Estimate based on premium price
        userGrowth: userGrowthData,
        courseEnrollments:
          courseEnrollmentData.length > 0
            ? courseEnrollmentData
            : [{ topic: "No Data", enrollments: 0 }],
        userDistribution: [
          { name: "Free Users", value: freeUsers || 1, color: "#94A3B8" },
          { name: "Premium Users", value: premiumUsers || 0, color: "#2563EB" },
        ],
        recentActivities: users.slice(0, 5).map((u: any) => ({
          user: u.full_name || u.email?.split("@")[0] || "User",
          action: u.last_sign_in_at ? "Recently active" : "Joined platform",
          time: formatTimeAgo(u.last_sign_in_at || u.created_at),
        })),
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Users",
      value: stats.activeUsers.toLocaleString(),
      change: "+8.2%",
      trend: "up",
      icon: Activity,
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Total Courses",
      value: stats.totalCourses.toString(),
      change: "+5",
      trend: "up",
      icon: BookOpen,
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      change: "+18.4%",
      trend: "up",
      icon: DollarSign,
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-gray-500 animate-pulse">Loading dashboard...</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
            Analytics Dashboard
          </h1>
          <p className="text-gray-500 mt-1">
            Overview of platform performance and user engagement
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl hover:bg-gray-50"
            onClick={fetchDashboardStats}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 hover:shadow-xl hover:shadow-gray-200/60 transition-all duration-300 hover:-translate-y-1 overflow-hidden group"
            >
              <CardContent className="p-6 relative">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`}
                ></div>
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center ring-4 ring-white shadow-sm`}
                  >
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-medium ${
                      stat.trend === "up" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </h3>
                <p className="text-sm text-gray-500 font-medium">
                  {stat.title}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  User Growth
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Monthly user registration trends
                </p>
              </div>
              <Badge
                variant="outline"
                className="bg-blue-50 text-blue-600 border-blue-200"
              >
                +23% vs last month
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.userGrowth}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Enrollment Chart */}
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Course Enrollments
                </CardTitle>
                <p className="text-sm text-gray-500">Enrollments by topic</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Eye className="w-4 h-4 mr-1" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.courseEnrollments} barCategoryGap="20%">
                <defs>
                  <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366F1" stopOpacity={1} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#E5E7EB"
                  vertical={false}
                />
                <XAxis
                  dataKey="topic"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  }}
                />
                <Bar
                  dataKey="enrollments"
                  fill="url(#colorBar)"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Distribution */}
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold text-gray-900">
              User Distribution
            </CardTitle>
            <p className="text-sm text-gray-500">Free vs Premium users</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={90}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  strokeWidth={0}
                >
                  {stats.userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-6 mt-4">
              {stats.userDistribution.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-600">{item.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="rounded-2xl border-0 shadow-lg shadow-gray-200/50 lg:col-span-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  Recent Activities
                </CardTitle>
                <p className="text-sm text-gray-500">
                  Latest user actions on the platform
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-50 to-transparent hover:from-blue-50 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-lg shadow-blue-500/30 group-hover:scale-105 transition-transform">
                      {activity.user.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {activity.user}
                      </p>
                      <p className="text-sm text-gray-500">{activity.action}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
