import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Progress } from "./ui/progress";
import {
  BookOpen,
  Users,
  Search,
  Plus,
  CheckCircle,
  Clock,
  TrendingUp,
  Target,
  Eye,
  Mail,
  Loader2,
  Star,
  FileText,
} from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  lessons: number;
  enrolled: number;
  license: number;
  completionRate: number;
  rating: number;
  instructor: string;
  status: "active" | "pending" | "expired";
  assignedCohorts: string[];
  thumbnail?: string;
}

interface CourseRequest {
  id: string;
  courseName: string;
  category: string;
  reason: string;
  priority: "high" | "medium" | "low";
  status: "pending" | "approved" | "rejected";
  requestedBy: string;
  requestedDate: string;
}

export default function BusinessCourseManagement() {
  const { language } = useLanguage();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [assignForm, setAssignForm] = useState({
    cohorts: [] as string[],
    learners: [] as string[],
    startDate: "",
    deadline: "",
    mandatory: false,
  });

  const [requestForm, setRequestForm] = useState({
    courseName: "",
    category: "",
    reason: "",
    priority: "medium" as "high" | "medium" | "low",
    numberOfLicenses: 50,
  });

  // Mock data
  const licenseStats = {
    total: 1500,
    used: 1247,
    available: 253,
    expiring: 45,
  };

  const courses: Course[] = [
    {
      id: "1",
      title: "Python for Data Science",
      description:
        "Comprehensive Python programming course focused on data science applications",
      category: "Data Science",
      difficulty: "Intermediate",
      duration: "40 hours",
      lessons: 48,
      enrolled: 342,
      license: 400,
      completionRate: 78,
      rating: 4.8,
      instructor: "Dr. Sarah Chen",
      status: "active",
      assignedCohorts: ["Data Science Bootcamp", "Engineering 2024"],
    },
    {
      id: "2",
      title: "Full-Stack Web Development",
      description:
        "Master modern web development with React, Node.js, and databases",
      category: "Web Development",
      difficulty: "Advanced",
      duration: "60 hours",
      lessons: 72,
      enrolled: 456,
      license: 500,
      completionRate: 72,
      rating: 4.7,
      instructor: "Prof. Michael Johnson",
      status: "active",
      assignedCohorts: ["Web Dev Fast Track", "Software Engineering 2024"],
    },
    {
      id: "3",
      title: "Machine Learning Fundamentals",
      description:
        "Introduction to machine learning algorithms and practical applications",
      category: "Data Science",
      difficulty: "Intermediate",
      duration: "35 hours",
      lessons: 42,
      enrolled: 186,
      license: 200,
      completionRate: 68,
      rating: 4.9,
      instructor: "Dr. Sarah Chen",
      status: "active",
      assignedCohorts: ["Data Science Bootcamp", "ML Advanced"],
    },
    {
      id: "4",
      title: "UX/UI Design Principles",
      description:
        "Learn user-centered design thinking and modern UI practices",
      category: "Design",
      difficulty: "Beginner",
      duration: "25 hours",
      lessons: 30,
      enrolled: 124,
      license: 150,
      completionRate: 85,
      rating: 4.6,
      instructor: "Emily Rodriguez",
      status: "active",
      assignedCohorts: ["Design Track"],
    },
    {
      id: "5",
      title: "Mobile App Development with React Native",
      description:
        "Build cross-platform mobile applications using React Native",
      category: "Mobile Development",
      difficulty: "Advanced",
      duration: "45 hours",
      lessons: 54,
      enrolled: 89,
      license: 100,
      completionRate: 62,
      rating: 4.5,
      instructor: "David Kim",
      status: "active",
      assignedCohorts: ["Mobile App Development"],
    },
    {
      id: "6",
      title: "AWS Cloud Architecture",
      description: "Design and implement scalable cloud solutions on AWS",
      category: "Cloud Computing",
      difficulty: "Advanced",
      duration: "50 hours",
      lessons: 60,
      enrolled: 0,
      license: 50,
      completionRate: 0,
      rating: 0,
      instructor: "TBD",
      status: "pending",
      assignedCohorts: [],
    },
  ];

  const courseRequests: CourseRequest[] = [
    {
      id: "1",
      courseName: "Kubernetes & Container Orchestration",
      category: "DevOps",
      reason: "Need to upskill team on container management",
      priority: "high",
      status: "pending",
      requestedBy: "John Manager",
      requestedDate: "2024-03-15",
    },
    {
      id: "2",
      courseName: "Advanced Data Visualization",
      category: "Data Science",
      reason: "Improve reporting capabilities across teams",
      priority: "medium",
      status: "approved",
      requestedBy: "Sarah Lead",
      requestedDate: "2024-03-10",
    },
    {
      id: "3",
      courseName: "Agile Project Management",
      category: "Management",
      reason: "Standardize project management practices",
      priority: "medium",
      status: "pending",
      requestedBy: "Mike Director",
      requestedDate: "2024-03-18",
    },
  ];

  const cohorts = [
    { id: "1", name: "Software Engineering 2024", learners: 85 },
    { id: "2", name: "Data Science Bootcamp", learners: 62 },
    { id: "3", name: "Web Dev Fast Track", learners: 124 },
    { id: "4", name: "Mobile App Development", learners: 48 },
    { id: "5", name: "Design Track", learners: 35 },
  ];

  const categories = [
    "Data Science",
    "Web Development",
    "Mobile Development",
    "Cloud Computing",
    "Design",
    "DevOps",
    "Management",
  ];

  // Filter courses
  const filteredCourses = courses.filter((course) => {
    const matchesSearch =
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || course.category === filterCategory;
    const matchesStatus =
      filterStatus === "all" || course.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Handlers
  const handleAssignCourse = async () => {
    if (!selectedCourse) return;
    if (assignForm.cohorts.length === 0 && assignForm.learners.length === 0) {
      alert(
        language === "vi"
          ? "Vui lòng chọn cohort hoặc học viên"
          : "Please select cohorts or learners"
      );
      return;
    }

    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setIsAssignModalOpen(false);
    setSelectedCourse(null);
    setAssignForm({
      cohorts: [],
      learners: [],
      startDate: "",
      deadline: "",
      mandatory: false,
    });
    alert(
      language === "vi"
        ? "Đã gán khóa học thành công!"
        : "Course assigned successfully!"
    );
  };

  const handleRequestCourse = async () => {
    if (!requestForm.courseName.trim()) {
      alert(
        language === "vi"
          ? "Vui lòng nhập tên khóa học"
          : "Please enter course name"
      );
      return;
    }

    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setIsRequestModalOpen(false);
    setRequestForm({
      courseName: "",
      category: "",
      reason: "",
      priority: "medium",
      numberOfLicenses: 50,
    });
    alert(
      language === "vi"
        ? "Đã gửi yêu cầu thành công!"
        : "Request submitted successfully!"
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "expired":
        return "bg-red-100 text-red-700";
      case "approved":
        return "bg-green-100 text-green-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700";
      case "medium":
        return "bg-yellow-100 text-yellow-700";
      case "low":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === "vi" ? "Quản lý Khóa học" : "Course Management"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {language === "vi"
              ? "Quản lý và phân bổ khóa học cho tổ chức của bạn"
              : "Manage and allocate courses for your organization"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button variant="outline" onClick={() => setIsRequestModalOpen(true)}>
            <Mail className="w-4 h-4 mr-2" />
            {language === "vi" ? "Yêu cầu khóa học" : "Request Course"}
          </Button>
        </div>
      </div>

      {/* License Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {language === "vi" ? "Tổng License" : "Total Licenses"}
              </p>
              <p className="text-lg font-semibold">
                {licenseStats.total.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {language === "vi" ? "Đã sử dụng" : "Used"}
              </p>
              <p className="text-lg font-semibold">
                {licenseStats.used.toLocaleString()}
              </p>
            </div>
          </div>
          <Progress
            value={(licenseStats.used / licenseStats.total) * 100}
            className="mt-2 h-1"
          />
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {language === "vi" ? "Còn trống" : "Available"}
              </p>
              <p className="text-lg font-semibold">
                {licenseStats.available.toLocaleString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {language === "vi" ? "Sắp hết hạn" : "Expiring Soon"}
              </p>
              <p className="text-lg font-semibold">{licenseStats.expiring}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="courses">
            <BookOpen className="w-4 h-4 mr-2" />
            {language === "vi" ? "Khóa học" : "Courses"} ({courses.length})
          </TabsTrigger>
          <TabsTrigger value="requests">
            <Mail className="w-4 h-4 mr-2" />
            {language === "vi" ? "Yêu cầu" : "Requests"} (
            {courseRequests.length})
          </TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          {/* Filters */}
          <Card className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder={
                      language === "vi"
                        ? "Tìm kiếm khóa học..."
                        : "Search courses..."
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue
                    placeholder={language === "vi" ? "Danh mục" : "Category"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "vi" ? "Tất cả" : "All"}
                  </SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue
                    placeholder={language === "vi" ? "Trạng thái" : "Status"}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === "vi" ? "Tất cả" : "All"}
                  </SelectItem>
                  <SelectItem value="active">
                    {language === "vi" ? "Hoạt động" : "Active"}
                  </SelectItem>
                  <SelectItem value="pending">
                    {language === "vi" ? "Chờ duyệt" : "Pending"}
                  </SelectItem>
                  <SelectItem value="expired">
                    {language === "vi" ? "Hết hạn" : "Expired"}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>

          {/* Course Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <BookOpen className="w-10 h-10 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-lg truncate">
                          {course.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {course.instructor}
                        </p>
                      </div>
                      <Badge className={getStatusColor(course.status)}>
                        {course.status === "active"
                          ? language === "vi"
                            ? "Hoạt động"
                            : "Active"
                          : course.status === "pending"
                          ? language === "vi"
                            ? "Chờ duyệt"
                            : "Pending"
                          : language === "vi"
                          ? "Hết hạn"
                          : "Expired"}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {course.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-3 text-xs">
                      <Badge
                        variant="outline"
                        className={getDifficultyColor(course.difficulty)}
                      >
                        {course.difficulty}
                      </Badge>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {course.duration}
                      </span>
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        {course.lessons} {language === "vi" ? "bài" : "lessons"}
                      </span>
                      {course.rating > 0 && (
                        <span className="flex items-center gap-1 text-yellow-600">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          {course.rating}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground">
                          <Users className="w-4 h-4 inline mr-1" />
                          {course.enrolled}/{course.license}
                        </span>
                        {course.completionRate > 0 && (
                          <span className="text-green-600">
                            <TrendingUp className="w-4 h-4 inline mr-1" />
                            {course.completionRate}%
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCourse(course);
                            setIsAssignModalOpen(true);
                          }}
                          disabled={course.status !== "active"}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          {language === "vi" ? "Gán" : "Assign"}
                        </Button>
                      </div>
                    </div>

                    {course.assignedCohorts.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {course.assignedCohorts.map((cohort) => (
                          <Badge
                            key={cohort}
                            variant="secondary"
                            className="text-xs"
                          >
                            {cohort}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {filteredCourses.length === 0 && (
            <Card className="p-12 text-center">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">
                {language === "vi"
                  ? "Không tìm thấy khóa học"
                  : "No courses found"}
              </h3>
              <p className="text-muted-foreground">
                {language === "vi"
                  ? "Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm"
                  : "Try adjusting filters or search terms"}
              </p>
            </Card>
          )}
        </TabsContent>

        {/* Requests Tab */}
        <TabsContent value="requests" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">
              {language === "vi" ? "Yêu cầu khóa học" : "Course Requests"}
            </h3>
            <Button onClick={() => setIsRequestModalOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              {language === "vi" ? "Yêu cầu mới" : "New Request"}
            </Button>
          </div>

          <div className="space-y-3">
            {courseRequests.map((request) => (
              <Card key={request.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{request.courseName}</h4>
                      <Badge className={getPriorityColor(request.priority)}>
                        {request.priority === "high"
                          ? language === "vi"
                            ? "Cao"
                            : "High"
                          : request.priority === "medium"
                          ? language === "vi"
                            ? "Trung bình"
                            : "Medium"
                          : language === "vi"
                          ? "Thấp"
                          : "Low"}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status === "pending"
                          ? language === "vi"
                            ? "Đang chờ"
                            : "Pending"
                          : request.status === "approved"
                          ? language === "vi"
                            ? "Đã duyệt"
                            : "Approved"
                          : language === "vi"
                          ? "Từ chối"
                          : "Rejected"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {request.category}
                    </p>
                    <p className="text-sm">{request.reason}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        {language === "vi" ? "Yêu cầu bởi" : "Requested by"}:{" "}
                        {request.requestedBy}
                      </span>
                      <span>{request.requestedDate}</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            {courseRequests.length === 0 && (
              <Card className="p-12 text-center">
                <Mail className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">
                  {language === "vi" ? "Chưa có yêu cầu" : "No requests yet"}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {language === "vi"
                    ? "Tạo yêu cầu khóa học mới cho tổ chức của bạn"
                    : "Create a new course request for your organization"}
                </p>
                <Button onClick={() => setIsRequestModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  {language === "vi" ? "Yêu cầu khóa học" : "Request Course"}
                </Button>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Assign Course Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === "vi" ? "Gán khóa học" : "Assign Course"}
            </DialogTitle>
            <DialogDescription>{selectedCourse?.title}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                {language === "vi" ? "Chọn Cohort" : "Select Cohorts"}
              </Label>
              <Select>
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === "vi" ? "Chọn cohort..." : "Select cohort..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {cohorts.map((cohort) => (
                    <SelectItem key={cohort.id} value={cohort.id}>
                      {cohort.name} ({cohort.learners}{" "}
                      {language === "vi" ? "học viên" : "learners"})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  {language === "vi" ? "Ngày bắt đầu" : "Start Date"}
                </Label>
                <Input
                  type="date"
                  value={assignForm.startDate}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {language === "vi" ? "Hạn hoàn thành" : "Deadline"}
                </Label>
                <Input
                  type="date"
                  value={assignForm.deadline}
                  onChange={(e) =>
                    setAssignForm({ ...assignForm, deadline: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">
                  {language === "vi" ? "Khóa học bắt buộc" : "Mandatory Course"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === "vi"
                    ? "Học viên phải hoàn thành khóa học này"
                    : "Learners must complete this course"}
                </p>
              </div>
              <input
                type="checkbox"
                checked={assignForm.mandatory}
                onChange={(e) =>
                  setAssignForm({ ...assignForm, mandatory: e.target.checked })
                }
                className="w-4 h-4"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignModalOpen(false)}
            >
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleAssignCourse}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === "vi" ? "Gán khóa học" : "Assign Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Course Modal */}
      <Dialog open={isRequestModalOpen} onOpenChange={setIsRequestModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {language === "vi"
                ? "Yêu cầu khóa học mới"
                : "Request New Course"}
            </DialogTitle>
            <DialogDescription>
              {language === "vi"
                ? "Gửi yêu cầu để bổ sung khóa học cho tổ chức"
                : "Submit a request to add a new course for your organization"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                {language === "vi" ? "Tên khóa học" : "Course Name"} *
              </Label>
              <Input
                placeholder={
                  language === "vi"
                    ? "VD: Machine Learning nâng cao"
                    : "e.g., Advanced Machine Learning"
                }
                value={requestForm.courseName}
                onChange={(e) =>
                  setRequestForm({ ...requestForm, courseName: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{language === "vi" ? "Danh mục" : "Category"}</Label>
              <Select
                value={requestForm.category}
                onValueChange={(value: string) =>
                  setRequestForm({ ...requestForm, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      language === "vi" ? "Chọn danh mục" : "Select category"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                {language === "vi" ? "Lý do yêu cầu" : "Reason for Request"}
              </Label>
              <Textarea
                placeholder={
                  language === "vi"
                    ? "Giải thích tại sao tổ chức cần khóa học này..."
                    : "Explain why your organization needs this course..."
                }
                rows={3}
                value={requestForm.reason}
                onChange={(e) =>
                  setRequestForm({ ...requestForm, reason: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{language === "vi" ? "Độ ưu tiên" : "Priority"}</Label>
                <Select
                  value={requestForm.priority}
                  onValueChange={(value: "high" | "medium" | "low") =>
                    setRequestForm({ ...requestForm, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      {language === "vi" ? "Cao" : "High"}
                    </SelectItem>
                    <SelectItem value="medium">
                      {language === "vi" ? "Trung bình" : "Medium"}
                    </SelectItem>
                    <SelectItem value="low">
                      {language === "vi" ? "Thấp" : "Low"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  {language === "vi" ? "Số license cần" : "Licenses Needed"}
                </Label>
                <Input
                  type="number"
                  min={1}
                  value={requestForm.numberOfLicenses}
                  onChange={(e) =>
                    setRequestForm({
                      ...requestForm,
                      numberOfLicenses: parseInt(e.target.value) || 50,
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsRequestModalOpen(false)}
            >
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleRequestCourse}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === "vi" ? "Gửi yêu cầu" : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
