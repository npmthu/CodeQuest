import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Users, BookOpen, FileText, TrendingUp, Activity } from "lucide-react";
import api from "../../api/axios";

interface AdminStats {
  users: {
    total: number;
    active: number;
    inactive: number;
    newLast30Days: number;
    roleBreakdown: Record<string, number>;
  };
  courses: {
    total: number;
    published: number;
    draft: number;
  };
  enrollments: {
    total: number;
  };
  submissions: {
    total: number;
    passed: number;
    failed: number;
    successRate: string;
  };
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/stats");
      setStats(response.data.data);
    } catch (error: any) {
      console.error("Error fetching admin stats:", error);
      if (error.response?.status === 403) {
        navigate("/login");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Failed to load statistics</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">
          Manage your platform and monitor statistics
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.users.active} active, {stats.users.inactive} inactive
            </p>
            <p className="text-xs text-green-600 mt-1">
              +{stats.users.newLast30Days} new (30 days)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.courses.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.courses.published} published, {stats.courses.draft} draft
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.enrollments.total}</div>
            <p className="text-xs text-muted-foreground">
              Total course enrollments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.submissions.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.submissions.passed} passed, {stats.submissions.failed}{" "}
              failed
            </p>
            <p className="text-xs text-green-600 mt-1">
              {stats.submissions.successRate}% success rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Role Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>User Role Distribution</CardTitle>
          <CardDescription>Breakdown of users by role</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(stats.users.roleBreakdown).map(([role, count]) => (
              <div key={role} className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold">{count}</p>
                <p className="text-sm text-gray-600 capitalize">{role}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate("/admin/users")}
              className="p-4 text-left border rounded-lg hover:bg-gray-50 transition"
            >
              <Users className="h-6 w-6 mb-2 text-blue-600" />
              <h3 className="font-semibold">Manage Users</h3>
              <p className="text-sm text-gray-500">
                View and edit user accounts
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/courses")}
              className="p-4 text-left border rounded-lg hover:bg-gray-50 transition"
            >
              <BookOpen className="h-6 w-6 mb-2 text-blue-600" />
              <h3 className="font-semibold">Manage Courses</h3>
              <p className="text-sm text-gray-500">
                Review and approve courses
              </p>
            </button>

            <button
              onClick={() => navigate("/admin/subscriptions")}
              className="p-4 text-left border rounded-lg hover:bg-gray-50 transition"
            >
              <TrendingUp className="h-6 w-6 mb-2 text-blue-600" />
              <h3 className="font-semibold">Subscriptions</h3>
              <p className="text-sm text-gray-500">Manage subscription plans</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
