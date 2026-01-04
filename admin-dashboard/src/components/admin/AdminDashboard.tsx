import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  Download,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
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
      // Use the new comprehensive stats endpoint
      const statsRes = await adminApi.getStats();
      console.log("📊 Stats Response:", statsRes);

      // Backend returns { success: true, data: {...} }
      // Axios wraps this in { data: {...} }
      const statsData = statsRes.data?.data || statsRes.data;
      console.log("📈 Parsed Stats Data:", statsData);

      if (!statsData) {
        throw new Error("No data received from server");
      }

      const {
        overview,
        roleDistribution,
        monthlyGrowth,
        topCourses,
        recentActivities,
      } = statsData;

      // Calculate revenue estimate (based on subscriptions)
      const estimatedRevenue = (overview.activeSubscriptions || 0) * 39; // $39 per subscription

      // Format user distribution for pie chart
      // Normalize roles to lowercase to avoid duplicates
      const normalizedRoles: Record<string, number> = {};
      Object.entries(roleDistribution || {}).forEach(([role, count]) => {
        const normalizedRole = role.toLowerCase().trim();
        normalizedRoles[normalizedRole] =
          (normalizedRoles[normalizedRole] || 0) + (count as number);
      });

      const userDistData = Object.entries(normalizedRoles).map(
        ([role, count]) => ({
          name: role.charAt(0).toUpperCase() + role.slice(1),
          value: count,
          color: getRoleColor(role),
        })
      );

      // Format monthly growth data
      const growthData = (monthlyGrowth || []).map((item: any) => ({
        month: item.month,
        users: item.count,
      }));

      // Format top courses data
      const courseData = (topCourses || []).slice(0, 6).map((course: any) => ({
        topic: course.title || "Unknown",
        enrollments: course.enrollmentCount || 0,
      }));

      // Format recent activities
      const activities = (recentActivities || [])
        .slice(0, 5)
        .map((activity: any) => ({
          user: activity.email?.split("@")[0] || "User",
          action:
            activity.action === "logged in"
              ? "Recently active"
              : "Joined platform",
          time: formatTimeAgo(activity.timestamp),
        }));

      setStats({
        totalUsers: overview.totalUsers || 0,
        activeUsers: overview.activeUsers || 0,
        totalCourses: overview.publishedCourses || 0,
        revenue: estimatedRevenue,
        userGrowth: growthData.length > 0 ? growthData : generateDummyGrowth(),
        courseEnrollments:
          courseData.length > 0
            ? courseData
            : [{ topic: "No Data", enrollments: 0 }],
        userDistribution:
          userDistData.length > 0
            ? userDistData
            : [{ name: "No Data", value: 1, color: "#94A3B8" }],
        recentActivities: activities.length > 0 ? activities : [],
      });

      toast.success("Dashboard data loaded successfully");
    } catch (error: any) {
      console.error("Error fetching dashboard stats:", error);
      toast.error(error.message || "Failed to load dashboard data");

      // Load with dummy data on error
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        totalCourses: 0,
        revenue: 0,
        userGrowth: generateDummyGrowth(),
        courseEnrollments: [{ topic: "No Data", enrollments: 0 }],
        userDistribution: [{ name: "No Data", value: 1, color: "#94A3B8" }],
        recentActivities: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "#DC2626",
      instructor: "#2563EB",
      learner: "#10B981",
      business_partner: "#8B5CF6",
    };
    return colors[role] || "#94A3B8";
  };

  const generateDummyGrowth = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
    return monthNames.map((month, index) => ({
      month,
      users: (index + 1) * 10,
    }));
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
      change: stats.totalUsers > 0 ? `${stats.activeUsers} active` : "+0%",
      icon: Users,
      color: "#2563EB",
    },
    {
      title: "Active Users (30d)",
      value: stats.activeUsers.toLocaleString(),
      change:
        stats.totalUsers > 0
          ? `${Math.round((stats.activeUsers / stats.totalUsers) * 100)}%`
          : "0%",
      icon: TrendingUp,
      color: "#10B981",
    },
    {
      title: "Published Courses",
      value: stats.totalCourses.toString(),
      change: stats.totalCourses > 0 ? "Active" : "None",
      icon: BookOpen,
      color: "#F59E0B",
    },
    {
      title: "Est. Revenue",
      value: `$${stats.revenue.toLocaleString()}`,
      change: stats.revenue > 0 ? "Monthly" : "$0",
      icon: DollarSign,
      color: "#8B5CF6",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#1E3A8A] mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">
            Overview of platform performance and user engagement
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" className="rounded-xl">
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="rounded-2xl border-gray-200 hover:shadow-lg transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${stat.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: stat.color }} />
                  </div>
                  <span className="text-sm text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <Card className="rounded-2xl border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#1E3A8A]">User Growth</CardTitle>
            <p className="text-sm text-gray-600">
              Monthly user registration trends
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="month" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke="#2563EB"
                  strokeWidth={3}
                  dot={{ fill: "#2563EB", r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Course Enrollment Chart */}
        <Card className="rounded-2xl border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#1E3A8A]">Course Enrollments</CardTitle>
            <p className="text-sm text-gray-600">Enrollments by topic</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.courseEnrollments}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis dataKey="topic" stroke="#6B7280" />
                <YAxis stroke="#6B7280" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "white",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                  }}
                />
                <Bar
                  dataKey="enrollments"
                  fill="#2563EB"
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
        <Card className="rounded-2xl border-gray-200">
          <CardHeader>
            <CardTitle className="text-[#1E3A8A]">User Distribution</CardTitle>
            <p className="text-sm text-gray-600">Free vs Premium users</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stats.userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent Activities */}
        <Card className="rounded-2xl border-gray-200 lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-[#1E3A8A]">Recent Activities</CardTitle>
            <p className="text-sm text-gray-600">
              Latest user actions on the platform
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#2563EB] flex items-center justify-center text-white">
                      {activity.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-gray-900">{activity.user}</p>
                      <p className="text-sm text-gray-600">{activity.action}</p>
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
