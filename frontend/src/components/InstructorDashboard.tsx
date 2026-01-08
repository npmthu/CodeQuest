import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  BookOpen, 
  Users, 
  DollarSign, 
  Star,
  TrendingUp,
  Eye,
  PlayCircle,
  Clock,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  BarChart3,
  MessageSquare
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
  XAxis,
  YAxis,
  CartesianGrid,

} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { 
  useInstructorStats, 
  useInstructorCourses, 
  useInstructorAnalytics, 
  useInstructorActivities 
} from "../hooks/useApi";

import { useNavigate } from "react-router-dom";

export default function InstructorDashboard() {
  const navigate = useNavigate();
  // Fetch real data from API
  const { data: instructorStats } = useInstructorStats();
  const { data: instructorCourses } = useInstructorCourses();
  const { data: instructorAnalytics } = useInstructorAnalytics();
  const { data: instructorActivities } = useInstructorActivities();

  // Transform API data to stats format
  const stats = [
    { 
      label: "Total Courses", 
      value: instructorStats?.coursesCount || 0, 
      change: "+2 this month",
      icon: BookOpen, 
      color: "bg-blue-500",
      bgColor: "#B9D6F3"
    },
    { 
      label: "Total Students", 
      value: instructorStats?.totalStudents || 0, 
      change: "+284 this month",
      icon: Users, 
      color: "bg-green-500",
      bgColor: "#B6DA9F"
    },
    { 
      label: "Revenue", 
      value: `$${instructorStats?.totalRevenue?.toLocaleString() || 0}`, 
      change: "+18% from last month",
      icon: DollarSign, 
      color: "bg-purple-500",
      bgColor: "#E0B0FF"
    },
    { 
      label: "Avg. Rating", 
      value: instructorStats?.averageRating?.toFixed(1) || "0.0", 
      change: `From ${instructorStats?.totalReviews || 0} reviews`,
      icon: Star, 
      color: "bg-orange-500",
      bgColor: "#F7D7A9"
    },
  ];

  // Use real courses data or empty array
  const courses = instructorCourses || [];

  // Use real analytics data or fallback to mock
  const revenueData = instructorAnalytics?.revenueData || [
    { month: "Jan", revenue: 0 },
    { month: "Feb", revenue: 0 },
    { month: "Mar", revenue: 0 },
    { month: "Apr", revenue: 0 },
    { month: "May", revenue: 0 },
    { month: "Jun", revenue: 0 },
  ];

  const enrollmentData = instructorAnalytics?.enrollmentData || [
    { month: "Jan", students: 0 },
    { month: "Feb", students: 0 },
    { month: "Mar", students: 0 },
    { month: "Apr", students: 0 },
    { month: "May", students: 0 },
    { month: "Jun", students: 0 },
  ];

  // Use real activities or empty array
  const recentActivities = instructorActivities || [];

  const getStatusColor = (status: string) => {
    return status === "Published" 
      ? "bg-green-100 text-green-700" 
      : "bg-yellow-100 text-yellow-700";
  };

  return (
    <div className="p-8 space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Instructor Dashboard</h2>
          <p className="text-muted-foreground mt-1">Welcome back 👋</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate('/instructor/courses/create')}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 border-2 shadow-lg" style={{ backgroundColor: stat.bgColor }}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <h3 className="mt-1">{stat.value}</h3>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600">{stat.change}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart Section */}
        <div className="space-y-4">
          {/* Revenue Title Card */}
          <Card className="p-4 border-2 shadow-lg" style={{ backgroundColor: "#126DA6" }}>
            <h3 className="text-white text-center">Revenue Overview</h3>
          </Card>
          {/* Revenue Chart */}
          <Card className="p-6 border-2 shadow-xl">
            <ChartContainer
              config={{
                revenue: {
                  label: "Revenue ($)",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-64"
            >
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#2563EB" 
                  strokeWidth={3}
                  dot={{ fill: "#2563EB", r: 4 }}
                />
              </LineChart>
            </ChartContainer>
          </Card>
        </div>

        {/* Enrollment Chart Section */}
        <div className="space-y-4">
          {/* Enrollment Title Card */}
          <Card className="p-4 border-2 shadow-lg" style={{ backgroundColor: "#48B89F" }}>
            <h3 className="text-white text-center">Student Enrollments</h3>
          </Card>
          {/* Enrollment Chart */}
          <Card className="p-6 border-2 shadow-xl">
            <ChartContainer
              config={{
                students: {
                  label: "Students",
                  color: "hsl(var(--chart-2))",
                },
              }}
              className="h-64"
            >
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="students" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </Card>
        </div>
      </div>

      {/* My Courses */}
      <div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course: any) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-all">
              <div className="aspect-video relative overflow-hidden bg-gray-100">
                <img 
                  src={course.thumbnail} 
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <Badge className={`absolute top-3 right-3 ${getStatusColor(course.status)}`}>
                  {course.status}
                </Badge>
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="flex-1">{course.title}</h4>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Course
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <PlayCircle className="w-4 h-4" />
                    <span>{course.lessons} lessons</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-border">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm">{course.rating}</span>
                    <span className="text-sm text-muted-foreground">({course.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-sm">{course.students} students</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Revenue</p>
                    <p className="text-green-600">{course.revenue}</p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <Card className="p-6">
        <h3 className="mb-6">Recent Activities</h3>
        <div className="space-y-4">
          {recentActivities.map((activity: any, index: number) => (
            <div 
              key={index}
              className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                activity.type === 'review' ? 'bg-yellow-100' :
                activity.type === 'enrollment' ? 'bg-green-100' :
                'bg-blue-100'
              }`}>
                {activity.type === 'review' && <Star className="w-5 h-5 text-yellow-600" />}
                {activity.type === 'enrollment' && <Users className="w-5 h-5 text-green-600" />}
                {activity.type === 'question' && <MessageSquare className="w-5 h-5 text-blue-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.user}</span>
                      {activity.type === 'review' && ' left a review on '}
                      {activity.type === 'enrollment' && ' enrolled in '}
                      {activity.type === 'question' && ' asked a question in '}
                      <span className="text-blue-600">{activity.course}</span>
                    </p>
                    {activity.type === 'review' && (
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(activity.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        ))}
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">{activity.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}