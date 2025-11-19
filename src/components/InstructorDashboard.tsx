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
  ResponsiveContainer
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

interface InstructorDashboardProps {
  onNavigate: (page: string) => void;
}

export default function InstructorDashboard({ onNavigate }: InstructorDashboardProps) {
  const stats = [
    { 
      label: "Total Courses", 
      value: 12, 
      change: "+2 this month",
      icon: BookOpen, 
      color: "bg-blue-500" 
    },
    { 
      label: "Total Students", 
      value: 2847, 
      change: "+284 this month",
      icon: Users, 
      color: "bg-green-500" 
    },
    { 
      label: "Revenue", 
      value: "$12,450", 
      change: "+18% from last month",
      icon: DollarSign, 
      color: "bg-purple-500" 
    },
    { 
      label: "Avg. Rating", 
      value: "4.8", 
      change: "From 2,451 reviews",
      icon: Star, 
      color: "bg-orange-500" 
    },
  ];

  const courses = [
    {
      id: 1,
      title: "Complete Python Programming Masterclass",
      students: 1245,
      revenue: "$4,890",
      rating: 4.9,
      reviews: 342,
      status: "Published",
      thumbnail: "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400",
      lessons: 48,
      duration: "12h 30m",
      lastUpdated: "2 days ago"
    },
    {
      id: 2,
      title: "Data Structures & Algorithms in Java",
      students: 856,
      revenue: "$3,120",
      rating: 4.7,
      reviews: 198,
      status: "Published",
      thumbnail: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400",
      lessons: 62,
      duration: "18h 45m",
      lastUpdated: "5 days ago"
    },
    {
      id: 3,
      title: "Modern Web Development with React",
      students: 546,
      revenue: "$2,840",
      rating: 4.8,
      reviews: 156,
      status: "Published",
      thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400",
      lessons: 38,
      duration: "10h 15m",
      lastUpdated: "1 week ago"
    },
    {
      id: 4,
      title: "Advanced SQL Database Design",
      students: 200,
      revenue: "$1,600",
      rating: 4.6,
      reviews: 67,
      status: "Draft",
      thumbnail: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400",
      lessons: 24,
      duration: "6h 20m",
      lastUpdated: "3 days ago"
    },
  ];

  const revenueData = [
    { month: "Jan", revenue: 8500 },
    { month: "Feb", revenue: 9200 },
    { month: "Mar", revenue: 8800 },
    { month: "Apr", revenue: 10500 },
    { month: "May", revenue: 11200 },
    { month: "Jun", revenue: 12450 },
  ];

  const enrollmentData = [
    { month: "Jan", students: 180 },
    { month: "Feb", students: 220 },
    { month: "Mar", students: 195 },
    { month: "Apr", students: 280 },
    { month: "May", students: 310 },
    { month: "Jun", students: 284 },
  ];

  const recentActivities = [
    {
      type: "review",
      user: "Alice Johnson",
      course: "Python Masterclass",
      content: "Excellent course! Very detailed explanations.",
      rating: 5,
      time: "2 hours ago"
    },
    {
      type: "enrollment",
      user: "Bob Smith",
      course: "React Web Development",
      content: "New student enrolled",
      time: "5 hours ago"
    },
    {
      type: "question",
      user: "Carol White",
      course: "Data Structures & Algorithms",
      content: "Question about binary trees implementation",
      time: "1 day ago"
    },
    {
      type: "review",
      user: "David Lee",
      course: "Python Masterclass",
      content: "Great instructor, learned a lot!",
      rating: 5,
      time: "2 days ago"
    },
  ];

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
          <p className="text-muted-foreground mt-1">Welcome back, Bug Quýt! 👋</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700"
          onClick={() => onNavigate("instructor-create-course")}
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
            <Card key={stat.label} className="p-6">
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
        {/* Revenue Chart */}
        <Card className="p-6">
          <h3 className="mb-6">Revenue Overview</h3>
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

        {/* Enrollment Chart */}
        <Card className="p-6">
          <h3 className="mb-6">Student Enrollments</h3>
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

      {/* My Courses */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>My Courses</h3>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
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
          {recentActivities.map((activity, index) => (
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