import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft, 
  BookOpen, 
  Code, 
  CheckCircle2,
  Circle,
  PlayCircle,
  FileText,
  Clock
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useLessons } from "../hooks/useApi";
import type { Lesson, LessonWithProgress } from "../interfaces";

export default function LessonPage() {
  const navigate = useNavigate();
  const { topicId, courseId } = useParams<{ topicId: string; courseId?: string }>();

  // Fetch lessons for this topic using the hook
  const { data: lessonsData, isLoading } = useLessons(topicId);

  const lessons: LessonWithProgress[] = lessonsData || [];
  const completedLessons = lessons.filter((l) => l.isCompleted).length;
  const progressPercent = lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!topicId) {
    return (
      <Card className="p-12 text-center m-8">
        <BookOpen className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No topic selected</h3>
        <p className="text-muted-foreground">Please select a topic to view its lessons</p>
        <Button onClick={() => navigate(courseId ? `/courses/${courseId}/topics` : '/courses')} className="mt-4">
          Browse Topics
        </Button>
      </Card>
    );
  }

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <button
            onClick={() => {
              if (courseId) {
                navigate(`/courses/${courseId}/topics`);
              } else {
                navigate(-1); // Go back to previous page
              }
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Topics
          </button>
          <div className="flex items-start justify-between">
            <div>
              <Badge className="mb-2 bg-green-100 text-green-700">Beginner</Badge>
              <h2>Python Programming Fundamentals</h2>
              <p className="text-muted-foreground mt-2">
                Master the basics of Python programming language
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Your Progress</div>
              <div className="text-2xl mt-1">{Math.round(progressPercent)}%</div>
            </div>
          </div>
          <div className="mt-6">
            <Progress value={progressPercent} className="h-2" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lesson List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="mb-4">Course Content</h3>
            {lessons.map((lesson) => {
              const isCompleted = lesson.isCompleted;
              const isCurrent = false; // TODO: Track current lesson

              const getLessonIcon = () => {
                if (lesson.difficulty === 'easy') return <FileText className="w-5 h-5" />;
                if (lesson.difficulty === 'medium') return <Code className="w-5 h-5" />;
                return <BookOpen className="w-5 h-5" />;
              };

              return (
                <Card
                  key={lesson.id}
                  className={`p-6 cursor-pointer hover:shadow-md transition-all ${
                    isCurrent ? "border-2 border-blue-500" : ""
                  }`}
                  onClick={() => {/* TODO: implement lesson detail page */}}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {isCompleted ? (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      ) : isCurrent ? (
                        <PlayCircle className="w-6 h-6 text-blue-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className={isCompleted ? "text-muted-foreground" : ""}>
                            {lesson.title}
                          </h4>
                          <div className="flex items-center gap-3 mt-2">
                            {lesson.difficulty && (
                              <Badge variant="outline" className="text-xs">
                                {lesson.difficulty}
                              </Badge>
                            )}
                            {lesson.estimatedTimeMin && (
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {lesson.estimatedTimeMin}
                              </span>
                            )}
                          </div>
                        </div>
                        {isCurrent && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="p-6">
              <h4 className="mb-4">Course Stats</h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Lessons</span>
                  <span className="text-sm">{lessons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="text-sm text-green-600">{completedLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Remaining</span>
                  <span className="text-sm">{lessons.length - completedLessons}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Est. Time</span>
                  <span className="text-sm">4h 20m</span>
                </div>
              </div>
            </Card>

            {/* Theory Overview */}
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
              <h4 className="mb-3">What You'll Learn</h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Variables and data types</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Control flow structures</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Loops and iterations</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Functions and methods</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Problem solving techniques</span>
                </li>
              </ul>
            </Card>

            {/* Practice Button */}
            <Button
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => navigate('/editor')}
            >
              <Code className="w-4 h-4 mr-2" />
              Practice Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
