import { Users, BookOpen, DollarSign, TrendingUp, Download } from "lucide-react";
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

const statsCards = [
  {
    title: "Total Users",
    value: "12,458",
    change: "+12.5%",
    trend: "up",
    icon: Users,
    color: "#2563EB",
  },
  {
    title: "Active Users",
    value: "8,234",
    change: "+8.2%",
    trend: "up",
    icon: TrendingUp,
    color: "#10B981",
  },
  {
    title: "Total Courses",
    value: "156",
    change: "+5",
    trend: "up",
    icon: BookOpen,
    color: "#F59E0B",
  },
  {
    title: "Revenue",
    value: "$45,230",
    change: "+18.4%",
    trend: "up",
    icon: DollarSign,
    color: "#8B5CF6",
  },
];

const userGrowthData = [
  { month: "Jan", users: 4200 },
  { month: "Feb", users: 5100 },
  { month: "Mar", users: 6300 },
  { month: "Apr", users: 7800 },
  { month: "May", users: 9200 },
  { month: "Jun", users: 10500 },
  { month: "Jul", users: 12458 },
];

const courseEnrollmentData = [
  { topic: "C/C++", enrollments: 2800 },
  { topic: "Python", enrollments: 3500 },
  { topic: "Java", enrollments: 2200 },
  { topic: "DSA", enrollments: 4100 },
  { topic: "SQL", enrollments: 1800 },
  { topic: "Web Dev", enrollments: 3200 },
];

const userDistributionData = [
  { name: "Free Users", value: 8234, color: "#94A3B8" },
  { name: "Premium Users", value: 4224, color: "#2563EB" },
];

const recentActivities = [
  {
    user: "Nguyễn Văn A",
    action: "Completed Python Course",
    time: "2 minutes ago",
  },
  {
    user: "Trần Thị B",
    action: "Upgraded to Premium",
    time: "15 minutes ago",
  },
  {
    user: "Lê Văn C",
    action: "Posted in Forum",
    time: "32 minutes ago",
  },
  {
    user: "Phạm Thị D",
    action: "Started DSA Course",
    time: "1 hour ago",
  },
  {
    user: "Hoàng Văn E",
    action: "Achieved 100% Quiz Score",
    time: "2 hours ago",
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl text-[#1E3A8A] mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Overview of platform performance and user engagement</p>
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
            <Card key={index} className="rounded-2xl border-gray-200 hover:shadow-lg transition-shadow">
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
            <p className="text-sm text-gray-600">Monthly user registration trends</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userGrowthData}>
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
              <BarChart data={courseEnrollmentData}>
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
                <Bar dataKey="enrollments" fill="#2563EB" radius={[8, 8, 0, 0]} />
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
                  data={userDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userDistributionData.map((entry, index) => (
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
            <p className="text-sm text-gray-600">Latest user actions on the platform</p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
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
