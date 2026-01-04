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
  Star
} from "lucide-react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";

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
}

interface CourseStats {
  totalLessons: number;
  publishedLessons: number;
  totalDuration: string;
  students: number;
  avgRating: number;
  completionRate: number;
}

export default function InstructorCourseManager() {
  const { t, language } = useLanguage();
  const { session } = useAuth();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      if (!session?.access_token) {
        setError(language === 'vi' ? 'Vui lòng đăng nhập' : 'Please login');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const API_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
        const response = await fetch(`${API_URL}/instructor/courses`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const result = await response.json();
        if (result.success && result.data) {
          setCourses(result.data);
          if (result.data.length > 0 && !selectedCourseId) {
            setSelectedCourseId(result.data[0].id);
          }
        }
      } catch (err: any) {
        console.error('Courses fetch error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [session, language]);

  // Get selected course
  const selectedCourse = courses.find(c => c.id === selectedCourseId);

  // Calculate stats from selected course
  const courseStats: CourseStats = selectedCourse ? {
    totalLessons: selectedCourse.lessons_count || 0,
    publishedLessons: selectedCourse.status === 'Published' ? selectedCourse.lessons_count : 0,
    totalDuration: selectedCourse.duration || '0m',
    students: selectedCourse.students_enrolled || 0,
    avgRating: selectedCourse.rating || 0,
    completionRate: 0, // Would need additional API call
  } : {
    totalLessons: 0,
    publishedLessons: 0,
    totalDuration: '0m',
    students: 0,
    avgRating: 0,
    completionRate: 0,
  };

  const getStatusColor = (status: string) => {
    return status === "Published" || status === "published"
      ? "bg-green-100 text-green-700" 
      : "bg-yellow-100 text-yellow-700";
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">{t('label.loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="p-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">{t('label.error')}</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            {language === 'vi' ? 'Thử lại' : 'Try Again'}
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
          <h2>{t('courses.title')}</h2>
          <p className="text-muted-foreground mt-1">{t('courses.subtitle')}</p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          {courses.length > 0 && (
            <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
              <SelectTrigger className="w-[280px]">
                <SelectValue placeholder={language === 'vi' ? 'Chọn khóa học' : 'Select course'} />
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
            {t('action.preview')}
          </Button>
        </div>
      </div>

      {courses.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">
            {language === 'vi' ? 'Chưa có khóa học' : 'No courses yet'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {language === 'vi' 
              ? 'Tạo bài học đầu tiên để bắt đầu' 
              : 'Create your first lesson to get started'}
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            {language === 'vi' ? 'Tạo bài học' : 'Create Lesson'}
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
                  <p className="text-xs text-muted-foreground">{t('courses.lessons')}</p>
                  <p className="text-lg font-semibold">{courseStats.totalLessons}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('courses.published')}</p>
                  <p className="text-lg font-semibold">{courseStats.publishedLessons}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('courses.duration')}</p>
                  <p className="text-lg font-semibold">{courseStats.totalDuration}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('courses.students')}</p>
                  <p className="text-lg font-semibold">{courseStats.students}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Star className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('courses.avgRating')}</p>
                  <p className="text-lg font-semibold">{courseStats.avgRating.toFixed(1)}</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-pink-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{t('courses.completion')}</p>
                  <p className="text-lg font-semibold">{courseStats.completionRate}%</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">
                <BarChart3 className="w-4 h-4 mr-2" />
                {language === 'vi' ? 'Tổng quan' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="students">
                <Users className="w-4 h-4 mr-2" />
                {t('courses.students')}
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                {t('courses.settings')}
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Course List */}
                <Card className="p-6">
                  <h3 className="mb-4">
                    {language === 'vi' ? 'Khóa học của bạn' : 'Your Courses'}
                  </h3>
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div 
                        key={course.id}
                        className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                          course.id === selectedCourseId 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-border hover:bg-gray-50'
                        }`}
                        onClick={() => setSelectedCourseId(course.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="text-sm font-medium">{course.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {course.description}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge className={getStatusColor(course.status)}>
                                {course.status === 'Published' 
                                  ? t('courses.published') 
                                  : t('courses.draft')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                <Users className="w-3 h-3 inline mr-1" />
                                {course.students_enrolled} {t('analytics.students')}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                <Star className="w-3 h-3 inline mr-1 text-yellow-500" />
                                {course.rating?.toFixed(1) || 'N/A'}
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
                      {language === 'vi' ? 'Chi tiết khóa học' : 'Course Details'}
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <Label>{t('courses.courseTitle')}</Label>
                        <p className="text-sm mt-1">{selectedCourse.title}</p>
                      </div>
                      <div>
                        <Label>{t('courses.shortDescription')}</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedCourse.description || (language === 'vi' ? 'Chưa có mô tả' : 'No description')}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>{t('courses.level')}</Label>
                          <Badge variant="outline" className="mt-1 capitalize">
                            {selectedCourse.difficulty || 'N/A'}
                          </Badge>
                        </div>
                        <div>
                          <Label>{language === 'vi' ? 'Trạng thái' : 'Status'}</Label>
                          <Badge className={`mt-1 ${getStatusColor(selectedCourse.status)}`}>
                            {selectedCourse.status === 'Published' 
                              ? t('courses.published') 
                              : t('courses.draft')}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <Label>{language === 'vi' ? 'Cập nhật lần cuối' : 'Last Updated'}</Label>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedCourse.lastUpdated}
                        </p>
                      </div>
                      <div className="pt-4 border-t">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          <Edit className="w-4 h-4 mr-2" />
                          {language === 'vi' ? 'Chỉnh sửa khóa học' : 'Edit Course'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Students Tab */}
            <TabsContent value="students" className="space-y-4">
              <Card className="p-6">
                <h3 className="mb-6">{t('courses.enrolledStudents')}</h3>
                {courseStats.students > 0 ? (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                    <p className="text-2xl font-semibold">{courseStats.students}</p>
                    <p className="text-muted-foreground">
                      {language === 'vi' ? 'học viên đã đăng ký' : 'enrolled students'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                      {language === 'vi' 
                        ? 'Xem chi tiết trong phần Analytics' 
                        : 'View details in Analytics section'}
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{language === 'vi' ? 'Chưa có học viên' : 'No students yet'}</p>
                    <p className="text-sm mt-2">
                      {language === 'vi' 
                        ? 'Học viên sẽ xuất hiện khi họ hoàn thành bài học của bạn' 
                        : 'Students will appear when they complete your lessons'}
                    </p>
                  </div>
                )}
              </Card>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-4">
              <Card className="p-6">
                <h3 className="mb-6">{t('courses.settings')}</h3>
                {selectedCourse ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>{t('courses.courseTitle')}</Label>
                      <Input defaultValue={selectedCourse.title} />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('courses.shortDescription')}</Label>
                      <Textarea 
                        defaultValue={selectedCourse.description}
                        rows={3}
                        placeholder={language === 'vi' ? 'Mô tả khóa học...' : 'Course description...'}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('courses.category')}</Label>
                      <Select defaultValue="programming">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="programming">{t('label.programming')}</SelectItem>
                          <SelectItem value="web">{t('label.webDev')}</SelectItem>
                          <SelectItem value="data">{t('label.dataScience')}</SelectItem>
                          <SelectItem value="mobile">{t('label.mobileDev')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t('courses.level')}</Label>
                      <Select defaultValue={selectedCourse.difficulty || 'beginner'}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">{t('label.beginner')}</SelectItem>
                          <SelectItem value="intermediate">{t('label.intermediate')}</SelectItem>
                          <SelectItem value="advanced">{t('label.advanced')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t('courses.visibility')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('courses.makePublic')}
                          </p>
                        </div>
                        <Switch defaultChecked={selectedCourse.status === 'Published'} />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t('courses.enableQA')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('courses.allowQuestions')}
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{t('courses.enableReviews')}</p>
                          <p className="text-sm text-muted-foreground">
                            {t('courses.allowReviews')}
                          </p>
                        </div>
                        <Switch defaultChecked />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Save className="w-4 h-4 mr-2" />
                        {t('courses.saveChanges')}
                      </Button>
                      <Button variant="outline">
                        {t('action.cancel')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{language === 'vi' ? 'Chọn khóa học để xem cài đặt' : 'Select a course to view settings'}</p>
                  </div>
                )}
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}
