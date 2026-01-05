import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  Users,
  PlayCircle,
  CheckCircle2,
  FileText,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  useCourse,
  useTopics,
  useCourseProgress,
  useCourseCertificate,
  useClaimCertificate,
} from "../hooks/useApi";

export default function CourseDetailPage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();

  const { data: course, isLoading: loadingCourse } = useCourse(courseId || "");
  const { data: topicsData, isLoading: loadingTopics } = useTopics();
  const { data: progressData } = useCourseProgress(courseId || "");
  const { data: certificate, isLoading: loadingCertificate } =
    useCourseCertificate(courseId || "");
  const claimCertificate = useClaimCertificate();

  // Filter topics by courseId
  const topics = courseId
    ? (topicsData || []).filter((t: any) => t.course_id === courseId)
    : [];

  // Get progress stats
  const completedLessons = progressData?.completedLessons || 0;
  const totalLessons = progressData?.totalLessons || 0;
  const progressPercent = progressData?.progressPercent || 0;
  const topicStats = progressData?.topicStats || {};

  // Check if course is completed (100% progress)
  const isCourseCompleted = progressPercent === 100 && totalLessons > 0;

  // Handle claiming certificate
  const handleClaimCertificate = async () => {
    if (!courseId) return;
    try {
      const newCertificate = await claimCertificate.mutateAsync(courseId);
      navigate(`/certificate/${newCertificate.id}`);
    } catch (error) {
      console.error("Failed to claim certificate:", error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-800 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loadingCourse || loadingTopics) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen">
        <h3 className="text-xl font-semibold mb-2">Course not found</h3>
        <p className="text-muted-foreground mb-4">
          The course you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate("/courses")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate("/courses")}
            className="mb-4 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Courses
          </Button>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Course Thumbnail */}
            <div className="md:w-80 flex-shrink-0">
              {course.thumbnail_url ? (
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-48 object-cover rounded-lg shadow-md"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md flex items-center justify-center">
                  <BookOpen className="w-20 h-20 text-white" />
                </div>
              )}
            </div>

            {/* Course Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2">{course.title}</h1>
                  <p className="text-lg text-muted-foreground">
                    {course.description || "No description available"}
                  </p>
                </div>
                {course.difficulty && (
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">
                      {topics.length}
                    </div>
                    <div className="text-xs text-blue-700">Topics</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <FileText className="w-5 h-5 text-purple-600" />
                  <div>
                    <div className="text-2xl font-bold text-purple-900">
                      {totalLessons}
                    </div>
                    <div className="text-xs text-purple-700">Lessons</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Award className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">
                      {completedLessons}
                    </div>
                    <div className="text-xs text-green-700">Completed</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="text-2xl font-bold text-orange-900">
                      {progressPercent}%
                    </div>
                    <div className="text-xs text-orange-700">Progress</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-4 mt-6">
                {topics.length > 0 && (
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => {
                      // Navigate to first topic
                      const firstTopic = topics[0];
                      navigate(`/topics/${firstTopic.id}/lessons`);
                    }}
                  >
                    <PlayCircle className="w-5 h-5 mr-2" />
                    Start Learning
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="lg"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  View Syllabus
                </Button>

                {/* Certificate Buttons - Only show when course is completed */}
                {isCourseCompleted && !loadingCertificate && (
                  <>
                    {certificate ? (
                      <Button
                        size="lg"
                        className="bg-green-600 hover:bg-green-700 text-white"
                        onClick={() =>
                          navigate(`/certificate/${certificate.id}`)
                        }
                      >
                        <Award className="w-5 h-5 mr-2" />
                        View Certificate
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="bg-amber-500 hover:bg-amber-600 text-white"
                        onClick={handleClaimCertificate}
                        disabled={claimCertificate.isPending}
                      >
                        {claimCertificate.isPending ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Award className="w-5 h-5 mr-2" />
                            Claim Certificate
                          </>
                        )}
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Section */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Topics Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold">Course Topics</h2>
              <p className="text-muted-foreground mt-1">
                Explore the curriculum and start your learning journey
              </p>
            </div>
            <Badge variant="outline" className="text-sm px-4 py-2">
              {topics.length} topic{topics.length !== 1 ? "s" : ""} available
            </Badge>
          </div>

          {topics.length === 0 ? (
            <Card className="p-12 text-center bg-white">
              <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                No topics available yet
              </h3>
              <p className="text-muted-foreground">
                Topics for this course are being prepared. Check back soon!
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {topics.map((topic: any, index: number) => {
                const topicProgress = topicStats[topic.id] || {
                  total: 0,
                  completed: 0,
                };
                const topicPercent =
                  topicProgress.total > 0
                    ? Math.round(
                        (topicProgress.completed / topicProgress.total) * 100
                      )
                    : 0;

                return (
                  <Card
                    key={topic.id}
                    className="p-6 hover:shadow-lg transition-all cursor-pointer bg-white border-2 hover:border-blue-300"
                    onClick={() => navigate(`/topics/${topic.id}/lessons`)}
                  >
                    <div className="flex items-start gap-6">
                      {/* Topic Number */}
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {index + 1}
                        </div>
                      </div>

                      {/* Topic Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {topic.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className={`ml-4 ${
                              topicPercent === 100
                                ? "bg-green-50 text-green-700 border-green-200"
                                : ""
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            {topicProgress.completed}/
                            {topicProgress.total || topic.lesson_count || 0}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                          {topic.description || "No description available"}
                        </p>

                        {/* Topic Stats */}
                        <div className="flex items-center gap-6 text-sm">
                          <div className="flex items-center gap-2 text-blue-600">
                            <FileText className="w-4 h-4" />
                            <span className="font-medium">
                              {topicProgress.total || topic.lesson_count || 0}{" "}
                              lessons
                            </span>
                          </div>
                          {topic.estimated_duration && (
                            <div className="flex items-center gap-2 text-purple-600">
                              <Clock className="w-4 h-4" />
                              <span className="font-medium">
                                {topic.estimated_duration}
                              </span>
                            </div>
                          )}
                          <div
                            className={`flex items-center gap-2 ${
                              topicPercent === 100
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-medium">
                              {topicPercent}% complete
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Arrow Icon */}
                      <div className="flex-shrink-0 self-center">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                          <PlayCircle className="w-5 h-5 text-gray-600" />
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Additional Info Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card className="p-6 bg-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Interactive Learning</h4>
                <p className="text-sm text-muted-foreground">
                  Engage with hands-on coding exercises and real-world projects
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Earn Certificates</h4>
                <p className="text-sm text-muted-foreground">
                  Get recognized for your achievements with course certificates
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Track Progress</h4>
                <p className="text-sm text-muted-foreground">
                  Monitor your learning journey with detailed progress tracking
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
