import { useParams, useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import {
  ArrowLeft,
  CheckCircle2,
  PlayCircle,
  FileText,
  ChevronRight,
  Clock,
  BookOpen,
} from "lucide-react";
import {
  useLesson,
  useUpdateLessonProgress,
  useLessons,
} from "../hooks/useApi";
import type { LessonWithProgress } from "../interfaces";

export default function LessonDetailPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();

  // Fetch lesson data
  const { data: lesson, isLoading, error } = useLesson(lessonId || "");
  const updateProgressMutation = useUpdateLessonProgress();

  // Fetch all lessons to find next lesson
  const { data: allLessons } = useLessons(lesson?.topicId);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading lesson...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">Lesson not found</h3>
          <p className="text-muted-foreground mb-4">
            The lesson you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  // Debug: Log lesson data to verify metadata
  console.log("Full Lesson Data:", lesson);
  console.log("Metadata:", lesson.metadata);
  console.log("Type Check:", lesson.metadata?.type);

  // Determine content type from metadata
  const metadata = lesson.metadata || {};
  // Handle case-insensitive comparison for video type
  const isVideo = metadata.type?.toLowerCase() === "video";
  const videoUrl = metadata.video_url;

  // Find next lesson
  const sortedLessons = (allLessons || []).sort(
    (a: LessonWithProgress, b: LessonWithProgress) =>
      (a.displayOrder || 0) - (b.displayOrder || 0)
  );
  const currentIndex = sortedLessons.findIndex(
    (l: LessonWithProgress) => l.id === lessonId
  );
  const nextLesson =
    currentIndex >= 0 && currentIndex < sortedLessons.length - 1
      ? sortedLessons[currentIndex + 1]
      : null;

  const handleComplete = async () => {
    if (!lessonId) return;

    try {
      await updateProgressMutation.mutateAsync({
        lessonId,
        completed: true,
      });
      // Success feedback is handled by the UI update from query invalidation
    } catch (err) {
      console.error("Failed to mark lesson as complete:", err);
      alert("Failed to mark lesson as complete. Please try again.");
    }
  };

  const handleNextLesson = () => {
    if (nextLesson) {
      navigate(`/lessons/${nextLesson.id}`);
    }
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "hard":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Top Navigation Bar */}
      <div className="border-b bg-white px-8 py-4 mb-8 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/topics/${lesson.topicId}/lessons`)}
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Topic
          </Button>
          <div className="flex items-center gap-2">
            {lesson.isCompleted && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            )}
            <span className="text-sm text-muted-foreground hidden sm:inline truncate max-w-[200px]">
              {lesson.title}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8">
        {/* Lesson Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {lesson.difficulty && (
              <Badge
                variant="outline"
                className={getDifficultyColor(lesson.difficulty)}
              >
                {lesson.difficulty}
              </Badge>
            )}
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {isVideo ? (
                <>
                  <PlayCircle className="w-3 h-3 mr-1" />
                  Video Lesson
                </>
              ) : (
                <>
                  <FileText className="w-3 h-3 mr-1" />
                  Theory
                </>
              )}
            </Badge>
            {lesson.estimatedTimeMin && (
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {lesson.estimatedTimeMin} min
              </span>
            )}
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{lesson.title}</h1>
        </div>

        {/* CONTENT AREA */}
        <Card className="overflow-hidden mb-8">
          {isVideo && videoUrl ? (
            // 🎥 VIDEO PLAYER VIEW
            <div className="aspect-video bg-black w-full">
              <video
                controls
                className="w-full h-full"
                src={videoUrl}
                poster={metadata.thumbnail}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            // 📝 THEORY/TEXT VIEW
            <div className="p-8">
              <div className="prose prose-blue max-w-none">
                {/* Render markdown content */}
                <div className="whitespace-pre-wrap font-sans text-lg leading-relaxed text-gray-700">
                  {lesson.contentMarkdown ||
                    "No content available for this lesson."}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 bg-white rounded-lg border shadow-sm">
          <div className="text-sm text-muted-foreground">
            {lesson.isCompleted ? (
              <span className="flex items-center gap-2 text-green-600 font-medium">
                <CheckCircle2 className="w-4 h-4" /> Completed
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Not completed yet
              </span>
            )}
          </div>

          <div className="flex gap-3">
            {!lesson.isCompleted && (
              <Button
                onClick={handleComplete}
                disabled={updateProgressMutation.isPending}
                variant="outline"
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                {updateProgressMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Complete
                  </>
                )}
              </Button>
            )}
            <Button
              onClick={handleNextLesson}
              disabled={!nextLesson}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {nextLesson ? (
                <>
                  Next Lesson <ChevronRight className="w-4 h-4 ml-2" />
                </>
              ) : (
                "Last Lesson"
              )}
            </Button>
          </div>
        </div>

        {/* Next Lesson Preview */}
        {nextLesson && (
          <Card className="mt-6 p-4 bg-gray-50 border-dashed">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  Up Next
                </p>
                <p className="font-medium">{nextLesson.title}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={handleNextLesson}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
