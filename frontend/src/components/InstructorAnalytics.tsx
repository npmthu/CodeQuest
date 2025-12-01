import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { 
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Clock,
  Star,
  Eye,
  PlayCircle,
  CheckCircle,
  Download,
  Calendar,
  Globe,
  Target,
  Award
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
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";

import { useNavigate } from "react-router-dom";

interface InstructorAnalyticsProps {}

export default function InstructorAnalytics() {
  const navigate = useNavigate();
  const overviewStats = [
    {
      label: "Total Views",
      value: "45,234",
      change: "+12.5%",
      trend: "up",
      icon: Eye,
      color: "bg-blue-500"
    },
    {
      label: "New Enrollments",
      value: "284",
      change: "+8.2%",
      trend: "up",
      icon: Users,
      color: "bg-green-500"
    },
    {
      label: "Revenue (30d)",
      value: "$12,450",
      change: "+18.3%",
      trend: "up",
      icon: DollarSign,
      color: "bg-purple-500"
    },
    {
      label: "Avg. Completion",
      value: "78%",
      change: "-2.1%",
      trend: "down",
      icon: CheckCircle,
      color: "bg-orange-500"
    },
  ];

  const revenueData = [
    { date: "Jan 1", revenue: 850, enrollments: 12 },
    { date: "Jan 8", revenue: 920, enrollments: 18 },
    { date: "Jan 15", revenue: 880, enrollments: 15 },
    { date: "Jan 22", revenue: 1050, enrollments: 22 },
    { date: "Jan 29", revenue: 1120, enrollments: 28 },
    { date: "Feb 5", revenue: 1380, enrollments: 32 },
    { date: "Feb 12", revenue: 1450, enrollments: 35 },
    { date: "Feb 19", revenue: 1520, enrollments: 38 },
    { date: "Feb 26", revenue: 1680, enrollments: 42 },
    { date: "Mar 5", revenue: 1850, enrollments: 48 },
    { date: "Mar 12", revenue: 2100, enrollments: 55 },
    { date: "Mar 19", revenue: 2350, enrollments: 62 },
  ];

  const coursePerformance = [
    { 
      name: "Python Masterclass",
      students: 1245,
      revenue: 4890,
      rating: 4.9,
      completion: 85,
      engagement: 92
    },
    { 
      name: "Java DSA",
      students: 856,
      revenue: 3120,
      rating: 4.7,
      completion: 78,
      engagement: 88
    },
    { 
      name: "React Web Dev",
      students: 546,
      revenue: 2840,
      rating: 4.8,
      completion: 72,
      engagement: 85
    },
    { 
      name: "SQL Design",
      students: 200,
      revenue: 1600,
      rating: 4.6,
      completion: 65,
      engagement: 78
    },
  ];

  const trafficSources = [
    { name: "Direct", value: 35, color: "#2563EB" },
    { name: "Search", value: 28, color: "#10B981" },
    { name: "Social Media", value: 20, color: "#F59E0B" },
    { name: "Referral", value: 12, color: "#8B5CF6" },
    { name: "Email", value: 5, color: "#EC4899" },
  ];

  const studentLocations = [
    { country: "United States", students: 432, percentage: 35 },
    { country: "India", students: 298, percentage: 24 },
    { country: "United Kingdom", students: 186, percentage: 15 },
    { country: "Canada", students: 124, percentage: 10 },
    { country: "Germany", students: 93, percentage: 8 },
    { country: "Others", students: 98, percentage: 8 },
  ];

  const engagementData = [
    { day: "Mon", avgTime: 45, completion: 78 },
    { day: "Tue", avgTime: 52, completion: 82 },
    { day: "Wed", avgTime: 38, completion: 75 },
    { day: "Thu", avgTime: 48, completion: 80 },
    { day: "Fri", avgTime: 55, completion: 85 },
    { day: "Sat", avgTime: 62, completion: 88 },
    { day: "Sun", avgTime: 58, completion: 86 },
  ];

  const topLessons = [
    { title: "Introduction to Python", views: 2456, avgTime: "12:30", completion: 95 },
    { title: "Variables and Data Types", views: 2234, avgTime: "14:15", completion: 92 },
    { title: "Control Flow", views: 2145, avgTime: "16:20", completion: 88 },
    { title: "Functions in Python", views: 1998, avgTime: "18:45", completion: 85 },
    { title: "Object-Oriented Programming", views: 1876, avgTime: "22:10", completion: 82 },
  ];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Analytics & Insights</h2>
          <p className="text-muted-foreground mt-1">Track your course performance and student engagement</p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue="30d">
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewStats.map((stat) => {
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
                  <p className="text-xs">{stat.change} vs last period</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Revenue & Enrollments Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3>Revenue & Enrollments Trend</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-sm text-muted-foreground">Revenue</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-sm text-muted-foreground">Enrollments</span>
            </div>
          </div>
        </div>
        <ChartContainer
          config={{
            revenue: {
              label: "Revenue ($)",
              color: "hsl(var(--chart-1))",
            },
            enrollments: {
              label: "Enrollments",
              color: "hsl(var(--chart-2))",
            },
          }}
          className="h-80"
        >
          <AreaChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="revenue"
              stroke="#2563EB"
              fill="#2563EB"
              fillOpacity={0.2}
              strokeWidth={2}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="enrollments"
              stroke="#10B981"
              fill="#10B981"
              fillOpacity={0.2}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </Card>

      {/* Course Performance & Traffic Sources */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Performance */}
        <Card className="p-6">
          <h3 className="mb-6">Course Performance</h3>
          <div className="space-y-4">
            {coursePerformance.map((course, index) => (
              <div key={index} className="p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-sm">{course.name}</h4>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{course.students} students</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                        <span>{course.rating}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-green-600">${course.revenue}</p>
                    <p className="text-xs text-muted-foreground mt-1">Revenue</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Completion</span>
                      <span>{course.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-full rounded-full"
                        style={{ width: `${course.completion}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">Engagement</span>
                      <span>{course.engagement}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className="bg-green-600 h-full rounded-full"
                        style={{ width: `${course.engagement}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Traffic Sources */}
        <Card className="p-6">
          <h3 className="mb-6">Traffic Sources</h3>
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
                data={trafficSources}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={5}
                dataKey="value"
              >
                {trafficSources.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ChartContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {trafficSources.map((source) => (
              <div key={source.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: source.color }}></div>
                <span className="text-sm">{source.name}</span>
                <span className="text-sm text-muted-foreground ml-auto">{source.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Student Engagement & Top Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Engagement */}
        <Card className="p-6">
          <h3 className="mb-6">Weekly Student Engagement</h3>
          <ChartContainer
            config={{
              avgTime: {
                label: "Avg Time (min)",
                color: "hsl(var(--chart-1))",
              },
              completion: {
                label: "Completion Rate (%)",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-64"
          >
            <BarChart data={engagementData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="avgTime" fill="#2563EB" radius={[8, 8, 0, 0]} />
              <Bar dataKey="completion" fill="#10B981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ChartContainer>
          <div className="flex items-center gap-4 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600"></div>
              <span className="text-sm text-muted-foreground">Avg Time (min)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600"></div>
              <span className="text-sm text-muted-foreground">Completion (%)</span>
            </div>
          </div>
        </Card>

        {/* Top Performing Lessons */}
        <Card className="p-6">
          <h3 className="mb-6">Top Performing Lessons</h3>
          <div className="space-y-3">
            {topLessons.map((lesson, index) => (
              <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm text-blue-600">#{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{lesson.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>{lesson.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{lesson.avgTime}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-green-600">{lesson.completion}%</p>
                  <p className="text-xs text-muted-foreground">Complete</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Student Geography */}
      <Card className="p-6">
        <h3 className="mb-6">Student Geography</h3>
        <div className="space-y-3">
          {studentLocations.map((location, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Globe className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">{location.country}</span>
                  <span className="text-sm text-muted-foreground">{location.students} students</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${location.percentage}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm text-muted-foreground w-12 text-right">{location.percentage}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
