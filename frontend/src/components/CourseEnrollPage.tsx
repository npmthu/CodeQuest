import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  Users,
  CheckCircle2,
  TrendingUp,
  Lock
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourse, useEnrollInCourse } from "../hooks/useApi";
import { useState, useEffect } from "react";

export default function CourseEnrollPage() {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const [enrolling, setEnrolling] = useState(false);

  const { data: course, isLoading: loadingCourse } = useCourse(courseId || '');
  const enrollMutation = useEnrollInCourse();

  const isEnrolled = course?.isEnrolled || false;

  // If user is already enrolled, redirect to course content
  useEffect(() => {
    if (isEnrolled && courseId) {
      navigate(`/courses/${courseId}`, { replace: true });
    }
  }, [isEnrolled, courseId, navigate]);

  const handleEnroll = async () => {
    if (!courseId || enrolling) return;
    
    setEnrolling(true);
    try {
      await enrollMutation.mutateAsync(courseId);
      // After successful enrollment, navigate to course content
      navigate(`/courses/${courseId}`);
    } catch (error: any) {
      alert(error.message || 'Failed to enroll in course');
      setEnrolling(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loadingCourse) {
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
        <p className="text-muted-foreground mb-4">The course you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/courses')}>
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
            onClick={() => navigate('/courses')}
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
                    {course.description || 'No description available'}
                  </p>
                </div>
                {course.difficulty && (
                  <Badge className={getDifficultyColor(course.difficulty)}>
                    {course.difficulty}
                  </Badge>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
                <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <BookOpen className="w-5 h-5 text-blue-600" />
                  <div>
                    <div className="text-2xl font-bold text-blue-900">{course.topic_count || 0}</div>
                    <div className="text-xs text-blue-700">Topics</div>
                  </div>
                </div>

                {course.duration && (
                  <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="text-2xl font-bold text-purple-900">{course.duration}</div>
                      <div className="text-xs text-purple-700">Duration</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Award className="w-5 h-5 text-green-600" />
                  <div>
                    <div className="text-2xl font-bold text-green-900">Certificate</div>
                    <div className="text-xs text-green-700">On Completion</div>
                  </div>
                </div>
              </div>

              {/* Enroll Button */}
              <div className="flex items-center gap-4 mt-6">
                <Button 
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white text-lg px-8 py-6"
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  {enrolling ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Enrolling...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6 mr-2" />
                      Enroll in This Course
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content Preview */}
      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* What You'll Learn */}
        <Card className="p-8 mb-8 bg-white">
          <h2 className="text-2xl font-bold mb-6">What You'll Learn</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">Master the fundamental concepts and best practices</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">Build real-world projects and applications</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">Gain hands-on experience through exercises</p>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
              <p className="text-gray-700">Earn a certificate upon completion</p>
            </div>
          </div>
        </Card>

        {/* Course Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Locked Content Preview */}
        <Card className="p-12 text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <Lock className="w-20 h-20 mx-auto text-yellow-600 mb-6" />
          <h3 className="text-2xl font-bold mb-3">Unlock Full Course Content</h3>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
            Enroll now to access {course.topic_count || 'all'} topics, interactive lessons, quizzes, and earn your certificate upon completion.
          </p>
          <Button 
            size="lg"
            className="bg-green-600 hover:bg-green-700 text-white text-lg px-10 py-6"
            onClick={handleEnroll}
            disabled={enrolling}
          >
            {enrolling ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Enrolling...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-6 h-6 mr-2" />
                Start Learning Now
              </>
            )}
          </Button>
        </Card>
      </div>
    </div>
  );
}
