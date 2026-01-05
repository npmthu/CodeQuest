import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Plus,
  Edit,
  PlayCircle,
  FileText,
  CheckCircle,
  Clock,
  Save,
  Eye,
  Settings,
  Users,
  BarChart3,
  Loader2,
  AlertCircle,
  Star,
  MessageSquare,
  Trash2,
  ChevronUp,
  ChevronDown,
  Upload,
  Play,
  BookOpen,
  Video,
} from "lucide-react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

// ==================== Interfaces ====================
interface Lesson {
  id: string;
  title: string;
  type: "video" | "theory";
  content: string;
  duration: string;
  isFreePreview: boolean;
  status: "draft" | "published";
}

interface Topic {
  id: string;
  title: string;
  lessons: Lesson[];
  isExpanded: boolean;
}

interface Course {
  id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  difficulty: string;
  status: string;
  lessons_count: number;
  students_enrolled: number;
  rating: number;
  reviews_count: number;
  price: number;
  duration: string;
  lastUpdated: string;
  topics?: Topic[];
}

interface CourseStats {
  totalLessons: number;
  publishedLessons: number;
  totalDuration: string;
  students: number;
  avgRating: number;
  completionRate: number;
}

// ==================== Helper Functions ====================
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createEmptyLesson = (): Lesson => ({
  id: generateId(),
  title: "",
  type: "video",
  content: "",
  duration: "",
  isFreePreview: false,
  status: "draft",
});

const createEmptyTopic = (): Topic => ({
  id: generateId(),
  title: "",
  lessons: [],
  isExpanded: true,
});

export default function InstructorCourseManager() {
  const { t, language } = useLanguage();
  const { session } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [students] = useState<any[]>([]);
  const [questions] = useState<any[]>([]);

  // Curriculum state
  const [topics, setTopics] = useState<Topic[]>([]);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [savingLesson, setSavingLesson] = useState(false);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      if (!session?.access_token) {
        setError(language === "vi" ? "Vui lòng đăng nhập" : "Please login");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const API_URL =
          import.meta.env.VITE_API_BASE || "http://localhost:3000";
        const response = await fetch(`${API_URL}/instructor/courses`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const result = await response.json();
        if (result.success && result.data) {
          setCourses(result.data);
          if (result.data.length > 0 && !selectedCourseId) {
            setSelectedCourseId(result.data[0].id);
          }
        }
      } catch (err: any) {
        console.error("Courses fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [session, language]);

  // Get selected course
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  // Calculate stats - use topics if available, otherwise from selected course
  const curriculumLessons = topics.reduce(
    (sum, topic) => sum + topic.lessons.length,
    0
  );
  const curriculumPublished = topics.reduce(
    (sum, topic) =>
      sum + topic.lessons.filter((l) => l.status === "published").length,
    0
  );

  const courseStats: CourseStats = selectedCourse
    ? {
        totalLessons:
          curriculumLessons > 0
            ? curriculumLessons
            : selectedCourse.lessons_count || 0,
        publishedLessons:
          curriculumLessons > 0
            ? curriculumPublished
            : selectedCourse.status === "Published"
            ? selectedCourse.lessons_count
            : 0,
        totalDuration: selectedCourse.duration || "0m",
        students: selectedCourse.students_enrolled || 0,
        avgRating: selectedCourse.rating || 0,
        completionRate: 0,
      }
    : {
        totalLessons: curriculumLessons,
        publishedLessons: curriculumPublished,
        totalDuration: "0m",
        students: 0,
        avgRating: 0,
        completionRate: 0,
      };

  const getStatusColor = (status: string) => {
    return status === "Published" || status === "published"
      ? "bg-green-100 text-green-700"
      : "bg-yellow-100 text-yellow-700";
  };

  // ==================== Topic (Section) Handlers ====================
  const addTopic = () => {
    setTopics((prev) => [...prev, createEmptyTopic()]);
  };

  const updateTopicTitle = (topicId: string, title: string) => {
    setTopics((prev) =>
      prev.map((topic) => (topic.id === topicId ? { ...topic, title } : topic))
    );
  };

  const deleteTopic = (topicId: string) => {
    const confirmMsg =
      language === "vi"
        ? "Bạn có chắc muốn xóa phần này và tất cả bài học trong đó?"
        : "Are you sure you want to delete this section and all its lessons?";
    if (confirm(confirmMsg)) {
      setTopics((prev) => prev.filter((topic) => topic.id !== topicId));
    }
  };

  const toggleTopicExpanded = (topicId: string) => {
    setTopics((prev) =>
      prev.map((topic) =>
        topic.id === topicId
          ? { ...topic, isExpanded: !topic.isExpanded }
          : topic
      )
    );
  };

  const moveTopicUp = (index: number) => {
    if (index === 0) return;
    setTopics((prev) => {
      const newTopics = [...prev];
      [newTopics[index - 1], newTopics[index]] = [
        newTopics[index],
        newTopics[index - 1],
      ];
      return newTopics;
    });
  };

  const moveTopicDown = (index: number) => {
    if (index === topics.length - 1) return;
    setTopics((prev) => {
      const newTopics = [...prev];
      [newTopics[index], newTopics[index + 1]] = [
        newTopics[index + 1],
        newTopics[index],
      ];
      return newTopics;
    });
  };

  // ==================== Lesson Handlers ====================
  const openLessonModal = (topicId: string, lesson?: Lesson) => {
    setEditingTopicId(topicId);
    setEditingLesson(lesson || createEmptyLesson());
    setIsLessonModalOpen(true);
  };

  const closeLessonModal = () => {
    setIsLessonModalOpen(false);
    setEditingLesson(null);
    setEditingTopicId(null);
  };

  const saveLesson = async () => {
    if (!editingLesson || !editingTopicId) return;
    if (!editingLesson.title.trim()) {
      alert(
        language === "vi"
          ? "Vui lòng nhập tiêu đề bài học"
          : "Please enter a lesson title"
      );
      return;
    }

    setSavingLesson(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id !== editingTopicId) return topic;

        const existingIndex = topic.lessons.findIndex(
          (l) => l.id === editingLesson.id
        );
        if (existingIndex >= 0) {
          // Update existing lesson
          const newLessons = [...topic.lessons];
          newLessons[existingIndex] = editingLesson;
          return { ...topic, lessons: newLessons };
        } else {
          // Add new lesson
          return { ...topic, lessons: [...topic.lessons, editingLesson] };
        }
      })
    );

    setSavingLesson(false);
    closeLessonModal();
  };

  const deleteLesson = (topicId: string, lessonId: string) => {
    const confirmMsg =
      language === "vi"
        ? "Bạn có chắc muốn xóa bài học này?"
        : "Are you sure you want to delete this lesson?";
    if (confirm(confirmMsg)) {
      setTopics((prev) =>
        prev.map((topic) =>
          topic.id === topicId
            ? {
                ...topic,
                lessons: topic.lessons.filter((l) => l.id !== lessonId),
              }
            : topic
        )
      );
    }
  };

  const moveLessonUp = (topicId: string, lessonIndex: number) => {
    if (lessonIndex === 0) return;
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id !== topicId) return topic;
        const newLessons = [...topic.lessons];
        [newLessons[lessonIndex - 1], newLessons[lessonIndex]] = [
          newLessons[lessonIndex],
          newLessons[lessonIndex - 1],
        ];
        return { ...topic, lessons: newLessons };
      })
    );
  };

  const moveLessonDown = (topicId: string, lessonIndex: number) => {
    const topic = topics.find((t) => t.id === topicId);
    if (!topic || lessonIndex === topic.lessons.length - 1) return;
    setTopics((prev) =>
      prev.map((t) => {
        if (t.id !== topicId) return t;
        const newLessons = [...t.lessons];
        [newLessons[lessonIndex], newLessons[lessonIndex + 1]] = [
          newLessons[lessonIndex + 1],
          newLessons[lessonIndex],
        ];
        return { ...t, lessons: newLessons };
      })
    );
  };

  const toggleLessonPublish = (topicId: string, lessonId: string) => {
    setTopics((prev) =>
      prev.map((topic) => {
        if (topic.id !== topicId) return topic;
        return {
          ...topic,
          lessons: topic.lessons.map((lesson) =>
            lesson.id === lessonId
              ? {
                  ...lesson,
                  status:
                    lesson.status === "published"
                      ? "draft"
                      : ("published" as const),
                }
              : lesson
          ),
        };
      })
    );
  };

  // ==================== Calculate Curriculum Stats ====================
  const getTotalLessons = () => {
    return topics.reduce((sum, topic) => sum + topic.lessons.length, 0);
  };

  const getTotalDuration = () => {
    let totalMinutes = 0;
    topics.forEach((topic) => {
      topic.lessons.forEach((lesson) => {
        const duration = parseInt(lesson.duration) || 0;
        totalMinutes += duration;
      });
    });
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">{t("label.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t("label.error")}</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            {language === "vi" ? "Thử lại" : "Try Again"}
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>{t("courses.title")}</h2>
          <p className="text-muted-foreground mt-1">{t("courses.subtitle")}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {courses.length > 0 && (
            <Select
              value={selectedCourseId}
              onValueChange={setSelectedCourseId}
            >
              <SelectTrigger className="w-[280px]">
                <SelectValue
                  placeholder={
                    language === "vi" ? "Chọn khóa học" : "Select course"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Eye className="w-4 h-4 mr-2" />
            {t("action.preview")}
          </Button>
        </div>
      </div>

      {courses.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">
            {language === "vi" ? "Chưa có khóa học" : "No courses yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === "vi"
              ? "Tạo bài học đầu tiên để bắt đầu"
              : "Create your first lesson to get started"}
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {language === "vi" ? "Tạo bài học" : "Create Lesson"}
          </Button>
        </Card>
      ) : (
        <>
          {/* Course Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <PlayCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("courses.lessons")}
                  </p>
                  <p className="text-lg font-semibold">
                    {courseStats.totalLessons}
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
                    {t("courses.published")}
                  </p>
                  <p className="text-lg font-semibold">
                    {courseStats.publishedLessons}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("courses.duration")}
                  </p>
                  <p className="text-lg font-semibold">
                    {courseStats.totalDuration}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("courses.students")}
                  </p>
                  <p className="text-lg font-semibold">
                    {courseStats.students}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("courses.avgRating")}
                  </p>
                  <p className="text-lg font-semibold">
                    {courseStats.avgRating.toFixed(1)}
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {t("courses.completion")}
                  </p>
                  <p className="text-lg font-semibold">
                    {courseStats.completionRate}%
                  </p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">
                <BarChart3 className="w-4 h-4 mr-2" />
                {language === "vi" ? "Tổng quan" : "Overview"}
              </TabsTrigger>
              <TabsTrigger value="curriculum">
                <BookOpen className="w-4 h-4 mr-2" />
                {language === "vi" ? "Nội dung" : "Curriculum"}
              </TabsTrigger>
              <TabsTrigger value="students">
                <Users className="w-4 h-4 mr-2" />
                {t("courses.students")}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                {t("courses.settings")}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Course List */}
                <Card className="p-6">
                  <h3 className="mb-4">
                    {language === "vi" ? "Khóa học của bạn" : "Your Courses"}
                  </h3>
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div
                        key={course.id}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          course.id === selectedCourseId
                            ? "border-blue-500 bg-blue-50"
                            : "border-border hover:bg-gray-50"
                        }`}
                        onClick={() => setSelectedCourseId(course.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">
                              {course.title}
                            </h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge className={getStatusColor(course.status)}>
                                {course.status === "Published"
                                  ? t("courses.published")
                                  : t("courses.draft")}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                <Users className="w-3 h-3 inline mr-1" />
                                {course.students_enrolled}{" "}
                                {t("analytics.students")}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                <Star className="w-3 h-3 inline mr-1 text-yellow-500" />
                                {course.rating?.toFixed(1) || "N/A"}
                              </span>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Selected Course Details */}
                {selectedCourse && (
                  <Card className="p-6">
                    <h3 className="mb-4">
                      {language === "vi"
                        ? "Chi tiết khóa học"
                        : "Course Details"}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label>{t("courses.courseTitle")}</Label>
                        <p className="text-sm mt-1">{selectedCourse.title}</p>
                      </div>
                      <div>
                        <Label>{t("courses.shortDescription")}</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedCourse.description ||
                            (language === "vi"
                              ? "Chưa có mô tả"
                              : "No description")}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t("courses.level")}</Label>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {selectedCourse.difficulty || "N/A"}
                          </Badge>
                        </div>
                        <div>
                          <Label>
                            {language === "vi" ? "Trạng thái" : "Status"}
                          </Label>
                          <Badge
                            className={`mt-1 ${getStatusColor(
                              selectedCourse.status
                            )}`}
                          >
                            {selectedCourse.status === "Published"
                              ? t("courses.published")
                              : t("courses.draft")}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Curriculum Tab */}
            <TabsContent value="curriculum" className="space-y-4">
              {/* Curriculum Stats */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-center gap-3">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-2xl font-bold text-blue-900">
                        {topics.length}
                      </p>
                      <p className="text-xs text-blue-700">
                        {language === "vi" ? "Phần" : "Sections"}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-purple-50 border-purple-200">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-2xl font-bold text-purple-900">
                        {getTotalLessons()}
                      </p>
                      <p className="text-xs text-purple-700">
                        {language === "vi" ? "Bài học" : "Lessons"}
                      </p>
                    </div>
                  </div>
                </Card>
                <Card className="p-4 bg-green-50 border-green-200">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-2xl font-bold text-green-900">
                        {getTotalDuration()}
                      </p>
                      <p className="text-xs text-green-700">
                        {language === "vi"
                          ? "Tổng thời lượng"
                          : "Total Duration"}
                      </p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Sections List */}
              <div className="space-y-4">
                {topics.length === 0 ? (
                  <Card className="p-12 text-center border-dashed border-2">
                    <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h4 className="font-semibold mb-2">
                      {language === "vi"
                        ? "Chưa có phần nào"
                        : "No sections yet"}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      {language === "vi"
                        ? "Bắt đầu xây dựng nội dung bằng cách thêm phần mới"
                        : "Start building your curriculum by adding sections"}
                    </p>
                    <Button onClick={addTopic}>
                      <Plus className="w-4 h-4 mr-2" />
                      {language === "vi"
                        ? "Thêm phần đầu tiên"
                        : "Add First Section"}
                    </Button>
                  </Card>
                ) : (
                  <>
                    {topics.map((topic, topicIndex) => (
                      <Card key={topic.id} className="overflow-hidden">
                        {/* Section Header */}
                        <div className="bg-gray-50 border-b p-4">
                          <div className="flex items-center gap-3">
                            <div className="flex flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveTopicUp(topicIndex)}
                                disabled={topicIndex === 0}
                              >
                                <ChevronUp className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => moveTopicDown(topicIndex)}
                                disabled={topicIndex === topics.length - 1}
                              >
                                <ChevronDown className="w-4 h-4" />
                              </Button>
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="secondary">
                                  {language === "vi" ? "Phần" : "Section"}{" "}
                                  {topicIndex + 1}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {topic.lessons.length}{" "}
                                  {language === "vi" ? "bài học" : "lesson"}
                                  {topic.lessons.length !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <Input
                                placeholder={
                                  language === "vi"
                                    ? "Tiêu đề phần (VD: Giới thiệu Python)"
                                    : "Section title (e.g., Introduction to Python)"
                                }
                                value={topic.title}
                                onChange={(e) =>
                                  updateTopicTitle(topic.id, e.target.value)
                                }
                                className="font-medium"
                              />
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => toggleTopicExpanded(topic.id)}
                              >
                                {topic.isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteTopic(topic.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Lessons List */}
                        {topic.isExpanded && (
                          <div className="p-4 space-y-2">
                            {topic.lessons.length === 0 ? (
                              <div className="text-center py-6 text-muted-foreground">
                                <p className="text-sm mb-2">
                                  {language === "vi"
                                    ? "Chưa có bài học trong phần này"
                                    : "No lessons in this section"}
                                </p>
                              </div>
                            ) : (
                              topic.lessons.map((lesson, lessonIndex) => (
                                <div
                                  key={lesson.id}
                                  className="flex items-center gap-3 p-3 bg-white border rounded-lg hover:border-blue-300 transition-colors"
                                >
                                  <div className="flex flex-col gap-0.5">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() =>
                                        moveLessonUp(topic.id, lessonIndex)
                                      }
                                      disabled={lessonIndex === 0}
                                    >
                                      <ChevronUp className="w-3 h-3" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-5 w-5"
                                      onClick={() =>
                                        moveLessonDown(topic.id, lessonIndex)
                                      }
                                      disabled={
                                        lessonIndex === topic.lessons.length - 1
                                      }
                                    >
                                      <ChevronDown className="w-3 h-3" />
                                    </Button>
                                  </div>

                                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                                    {lesson.type === "video" ? (
                                      <Play className="w-4 h-4 text-blue-600" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-purple-600" />
                                    )}
                                  </div>

                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium truncate">
                                        {lesson.title ||
                                          (language === "vi"
                                            ? "Bài học chưa đặt tên"
                                            : "Untitled Lesson")}
                                      </p>
                                      {lesson.isFreePreview && (
                                        <Badge
                                          variant="outline"
                                          className="text-xs bg-green-50 text-green-700 border-green-200"
                                        >
                                          <Eye className="w-3 h-3 mr-1" />
                                          {language === "vi"
                                            ? "Xem trước"
                                            : "Preview"}
                                        </Badge>
                                      )}
                                      <Badge
                                        variant="outline"
                                        className={`text-xs ${
                                          lesson.status === "published"
                                            ? "bg-green-50 text-green-700 border-green-200"
                                            : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                        }`}
                                      >
                                        {lesson.status === "published"
                                          ? language === "vi"
                                            ? "Đã xuất bản"
                                            : "Published"
                                          : language === "vi"
                                          ? "Bản nháp"
                                          : "Draft"}
                                      </Badge>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                      <span className="capitalize">
                                        {lesson.type}
                                      </span>
                                      {lesson.duration && (
                                        <>
                                          <span>•</span>
                                          <span>
                                            {lesson.duration}{" "}
                                            {language === "vi" ? "phút" : "min"}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        toggleLessonPublish(topic.id, lesson.id)
                                      }
                                      title={
                                        lesson.status === "published"
                                          ? "Unpublish"
                                          : "Publish"
                                      }
                                    >
                                      {lesson.status === "published" ? (
                                        <CheckCircle className="w-4 h-4 text-green-600" />
                                      ) : (
                                        <CheckCircle className="w-4 h-4 text-gray-400" />
                                      )}
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        openLessonModal(topic.id, lesson)
                                      }
                                    >
                                      <Edit className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() =>
                                        deleteLesson(topic.id, lesson.id)
                                      }
                                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2"
                              onClick={() => openLessonModal(topic.id)}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {language === "vi"
                                ? "Thêm bài học"
                                : "Add Lesson"}
                            </Button>
                          </div>
                        )}
                      </Card>
                    ))}

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={addTopic}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {language === "vi" ? "Thêm phần mới" : "Add New Section"}
                    </Button>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-4">
              <Card className="p-6">
                <h3 className="mb-6">Enrolled Students</h3>
                <div className="space-y-4">
                  {students.length > 0 ? (
                    students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600">
                            {student.avatar}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-muted-foreground">
                            Enrolled {student.enrolled} • Last active{" "}
                            {student.lastActive}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">
                              Progress
                            </p>
                            <p className="text-blue-600">{student.progress}%</p>
                          </div>
                          <div className="w-32">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-full rounded-full"
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Profile
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>
                        {language === "vi"
                          ? "Chưa có học viên"
                          : "No students yet"}
                      </p>
                      <p className="text-sm mt-2">
                        {language === "vi"
                          ? "Học viên sẽ xuất hiện khi họ hoàn thành bài học của bạn"
                          : "Students will appear when they complete your lessons"}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent value="questions" className="space-y-4">
              <Card className="p-6">
                <h3 className="mb-6">Student Questions</h3>
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 rounded-lg border border-border hover:border-blue-200 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm text-blue-600">
                            {q.avatar}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="font-medium">{q.student}</p>
                              <p className="text-sm text-muted-foreground">
                                Asked in: {q.lesson} • {q.time}
                              </p>
                            </div>
                            <Badge
                              className={
                                q.status === "answered"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }
                            >
                              {q.status}
                            </Badge>
                          </div>
                          <p className="text-sm mb-3">{q.question}</p>
                          <div className="flex items-center gap-3">
                            <Button variant="outline" size="sm">
                              <MessageSquare className="w-4 h-4 mr-2" />
                              Reply ({q.replies})
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card className="p-6">
                <h3 className="mb-6">{t("courses.settings")}</h3>
                {selectedCourse ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>{t("courses.courseTitle")}</Label>
                      <Input defaultValue={selectedCourse.title} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("courses.shortDescription")}</Label>
                      <Textarea
                        defaultValue={selectedCourse.description}
                        rows={3}
                        placeholder={
                          language === "vi"
                            ? "Mô tả khóa học..."
                            : "Course description..."
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("courses.category")}</Label>
                      <Select defaultValue="programming">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programming">
                            {t("label.programming")}
                          </SelectItem>
                          <SelectItem value="web">
                            {t("label.webDev")}
                          </SelectItem>
                          <SelectItem value="data">
                            {t("label.dataScience")}
                          </SelectItem>
                          <SelectItem value="mobile">
                            {t("label.mobileDev")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("courses.level")}</Label>
                      <Select
                        defaultValue={selectedCourse.difficulty || "beginner"}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">
                            {t("label.beginner")}
                          </SelectItem>
                          <SelectItem value="intermediate">
                            {t("label.intermediate")}
                          </SelectItem>
                          <SelectItem value="advanced">
                            {t("label.advanced")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {t("courses.visibility")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("courses.makePublic")}
                          </p>
                        </div>
                        <Switch
                          defaultChecked={selectedCourse.status === "Published"}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t("courses.enableQA")}</p>
                          <p className="text-sm text-muted-foreground">
                            {t("courses.allowQuestions")}
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">
                            {t("courses.enableReviews")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {t("courses.allowReviews")}
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        {t("courses.saveChanges")}
                      </Button>
                      <Button variant="outline">{t("action.cancel")}</Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>
                      {language === "vi"
                        ? "Chọn khóa học để xem cài đặt"
                        : "Select a course to view settings"}
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* Lesson Edit Modal */}
      <Dialog open={isLessonModalOpen} onOpenChange={setIsLessonModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLesson &&
              topics.some((t) =>
                t.lessons.some((l) => l.id === editingLesson.id)
              )
                ? language === "vi"
                  ? "Chỉnh sửa bài học"
                  : "Edit Lesson"
                : language === "vi"
                ? "Thêm bài học mới"
                : "Add New Lesson"}
            </DialogTitle>
          </DialogHeader>

          {editingLesson && (
            <div className="space-y-4 py-4">
              {/* Lesson Title */}
              <div className="space-y-2">
                <Label>
                  {language === "vi" ? "Tiêu đề bài học" : "Lesson Title"} *
                </Label>
                <Input
                  placeholder={
                    language === "vi"
                      ? "VD: Giới thiệu về biến"
                      : "e.g., Introduction to Variables"
                  }
                  value={editingLesson.title}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      title: e.target.value,
                    })
                  }
                />
              </div>

              {/* Lesson Type */}
              <div className="space-y-2">
                <Label>
                  {language === "vi" ? "Loại bài học" : "Lesson Type"}
                </Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingLesson({
                        ...editingLesson,
                        type: "video",
                        content: "",
                      })
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      editingLesson.type === "video"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Video
                      className={`w-6 h-6 mx-auto mb-2 ${
                        editingLesson.type === "video"
                          ? "text-blue-600"
                          : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        editingLesson.type === "video"
                          ? "text-blue-900"
                          : "text-gray-600"
                      }`}
                    >
                      Video
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "vi"
                        ? "Tải lên video bài học"
                        : "Upload a video lesson"}
                    </p>
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setEditingLesson({
                        ...editingLesson,
                        type: "theory",
                        content: "",
                      })
                    }
                    className={`p-4 rounded-lg border-2 transition-all ${
                      editingLesson.type === "theory"
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <FileText
                      className={`w-6 h-6 mx-auto mb-2 ${
                        editingLesson.type === "theory"
                          ? "text-purple-600"
                          : "text-gray-400"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        editingLesson.type === "theory"
                          ? "text-purple-900"
                          : "text-gray-600"
                      }`}
                    >
                      {language === "vi" ? "Lý thuyết" : "Theory"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {language === "vi"
                        ? "Nội dung văn bản"
                        : "Text-based content"}
                    </p>
                  </button>
                </div>
              </div>

              {/* Content based on type */}
              {editingLesson.type === "video" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      {language === "vi" ? "Tải video lên" : "Video Upload"}
                    </Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer">
                      <Video className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-muted-foreground mb-2">
                        {language === "vi"
                          ? "Nhấp để tải lên hoặc kéo thả"
                          : "Click to upload or drag and drop"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MP4, WebM {language === "vi" ? "tối đa" : "up to"} 500MB
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        <Upload className="w-4 h-4 mr-2" />
                        {language === "vi" ? "Chọn file" : "Choose File"}
                      </Button>
                    </div>
                    {editingLesson.content && (
                      <p className="text-sm text-green-600">
                        ✓ {editingLesson.content}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {language === "vi"
                        ? "Thời lượng video (phút)"
                        : "Video Duration (minutes)"}
                    </Label>
                    <Input
                      type="number"
                      placeholder={language === "vi" ? "VD: 15" : "e.g., 15"}
                      value={editingLesson.duration}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>
                      {language === "vi"
                        ? "Nội dung bài học"
                        : "Lesson Content"}
                    </Label>
                    <Textarea
                      placeholder={
                        language === "vi"
                          ? "Viết nội dung bài học ở đây... (Hỗ trợ Markdown)"
                          : "Write your lesson content here... (Markdown supported)"
                      }
                      rows={8}
                      value={editingLesson.content}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          content: e.target.value,
                        })
                      }
                    />
                    <p className="text-xs text-muted-foreground">
                      {editingLesson.content.length}{" "}
                      {language === "vi" ? "ký tự" : "characters"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>
                      {language === "vi"
                        ? "Thời gian đọc ước tính (phút)"
                        : "Estimated Reading Time (minutes)"}
                    </Label>
                    <Input
                      type="number"
                      placeholder={language === "vi" ? "VD: 10" : "e.g., 10"}
                      value={editingLesson.duration}
                      onChange={(e) =>
                        setEditingLesson({
                          ...editingLesson,
                          duration: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Free Preview Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">
                      {language === "vi"
                        ? "Xem trước miễn phí"
                        : "Free Preview"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "vi"
                        ? "Cho phép học viên chưa đăng ký xem trước bài học này"
                        : "Allow non-enrolled students to preview this lesson"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={editingLesson.isFreePreview}
                  onCheckedChange={(checked: boolean) =>
                    setEditingLesson({
                      ...editingLesson,
                      isFreePreview: checked,
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={closeLessonModal}>
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button
              onClick={saveLesson}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={savingLesson}
            >
              {savingLesson && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {editingLesson &&
              topics.some((t) =>
                t.lessons.some((l) => l.id === editingLesson.id)
              )
                ? language === "vi"
                  ? "Lưu thay đổi"
                  : "Save Changes"
                : language === "vi"
                ? "Thêm bài học"
                : "Add Lesson"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
