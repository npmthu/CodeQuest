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
  Clock,
  Award,
  ClipboardCheck,
  Lock,
  Terminal,
  TrendingUp,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { useLessons, useQuizzes, useGetCurrentLesson, useProblemsByTopic, useTopic } from "../hooks/useApi";
import type { LessonWithProgress } from "../interfaces";

export default function LessonPage() {
  const navigate = useNavigate();
  const { topicId, courseId } = useParams<{
    topicId: string;
    courseId?: string;
  }>();

  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  // Fetch topic data to get course_id
  const { data: topicData } = useTopic(topicId || '');

  // Fetch lessons for this topic using the hook
  const { data: lessonsData, isLoading } = useLessons(topicId);

  // Fetch quizzes for this topic
  const { data: quizzesData } = useQuizzes(topicId);
  const topicQuiz = quizzesData?.[0]; // Get the first quiz for this topic

  // Fetch problems for this topic
  const { data: problemsData, isLoading: problemsLoading } = useProblemsByTopic(topicId);

  // Fetch current lesson for this topic (if available)
  const { data: currentLessonData } = useGetCurrentLesson(topicId);

  // Set current lesson from API or first incomplete lesson
  useEffect(() => {
    if (currentLessonData?.id) {
      setCurrentLessonId(currentLessonData.id);
    } else if (lessonsData && lessonsData.length > 0) {
      // Find first incomplete lesson or use first lesson
      const firstIncomplete = lessonsData.find((l: any) => !l.isCompleted);
      if (firstIncomplete) {
        setCurrentLessonId(firstIncomplete.id);
      } else {
        setCurrentLessonId(lessonsData[0].id);
      }
    }
  }, [currentLessonData, lessonsData]);

  const lessons: LessonWithProgress[] = lessonsData || [];
  const completedLessons = lessons.filter((l) => l.isCompleted).length;
  const progressPercent =
    lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;
  const allLessonsCompleted =
    lessons.length > 0 && completedLessons === lessons.length;

  // Calculate total estimated time
  const totalEstimatedMin = lessons.reduce(
    (sum, l) => sum + (l.estimatedTimeMin || 0),
    0
  );
  const hours = Math.floor(totalEstimatedMin / 60);
  const mins = totalEstimatedMin % 60;
  const estimatedTimeDisplay = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

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
        <p className="text-muted-foreground">
          Please select a topic to view its lessons
        </p>
        <Button
          onClick={() =>
            navigate(topicData?.course_id ? `/courses/${topicData.course_id}` : "/courses")
          }
          className="mt-4"
        >
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
              // Use topic's course_id for navigation back to course
              if (topicData?.course_id) {
                navigate(`/courses/${topicData.course_id}`);
              } else {
                navigate('/courses'); // Fallback to courses list
              }
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Course
          </button>
          <div className="flex items-start justify-between">
            <div>
              <Badge className="mb-2 bg-green-100 text-green-700">
                Beginner
              </Badge>
              <h2>Python Programming Fundamentals</h2>
              <p className="text-muted-foreground mt-2">
                Master the basics of Python programming language
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Your Progress</div>
              <div className="text-2xl mt-1">
                {Math.round(progressPercent)}%
              </div>
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
              const isCurrent = currentLessonId === lesson.id;

              // Get lesson icon based on difficulty
              const getLessonIconComponent = () => {
                if (lesson.difficulty === "easy")
                  return <FileText className="w-5 h-5" />;
                if (lesson.difficulty === "medium")
                  return <Code className="w-5 h-5" />;
                return <BookOpen className="w-5 h-5" />;
              };

              return (
                <Card
                  key={lesson.id}
                  className={`p-6 cursor-pointer hover:shadow-md transition-all ${
                    isCurrent ? "border-2 border-blue-500" : ""
                  }`}
                  onClick={() => navigate(`/lessons/${lesson.id}`)}
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
                          <h4
                            className={
                              isCompleted ? "text-muted-foreground" : ""
                            }
                          >
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
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            Continue
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}

            {/* Practice Problems Section */}
            <div className="mt-8">
              <h3 className="mb-4 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-blue-600" />
                Practice Problems
              </h3>
              {problemsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : problemsData && problemsData.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {problemsData.map((problem: any) => (
                    <Card
                      key={problem.id}
                      onClick={() => navigate(`/editor/${problem.id}`)}
                      className="p-4 hover:shadow-md transition-all cursor-pointer border-2 border-gray-200 hover:border-blue-300"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Code className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <h5 className="text-sm font-semibold truncate">
                              {problem.title}
                            </h5>
                          </div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                problem.difficulty === 1
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : problem.difficulty === 2
                                  ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}
                            >
                              {problem.difficulty === 1
                                ? "Easy"
                                : problem.difficulty === 2
                                ? "Medium"
                                : "Hard"}
                            </Badge>
                            {problem.acceptance_rate && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {Math.round(problem.acceptance_rate * 100)}% acceptance
                              </span>
                            )}
                            {problem.total_submissions > 0 && (
                              <span className="text-xs text-muted-foreground">
                                {problem.total_submissions} submissions
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/editor/${problem.id}`);
                          }}
                        >
                          Solve
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-8 text-center border-2 border-dashed border-gray-300">
                  <Code className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p className="text-sm text-muted-foreground">
                    No practice problems available for this topic yet
                  </p>
                </Card>
              )}
            </div>

            {/* End-of-Topic Quiz Section */}
            {topicQuiz && (
              <div className="mt-8">
                <h3 className="mb-4 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-purple-600" />
                  Topic Quiz
                </h3>
                <Card
                  className={`p-6 transition-all ${
                    allLessonsCompleted
                      ? "cursor-pointer hover:shadow-lg bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 hover:border-purple-400"
                      : "cursor-not-allowed bg-gray-50 border-2 border-gray-200 opacity-75"
                  }`}
                  onClick={() =>
                    allLessonsCompleted && navigate(`/quizzes/${topicQuiz.id}`)
                  }
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div
                        className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md ${
                          allLessonsCompleted
                            ? "bg-gradient-to-br from-purple-500 to-blue-600"
                            : "bg-gray-400"
                        }`}
                      >
                        {allLessonsCompleted ? (
                          <Award className="w-6 h-6 text-white" />
                        ) : (
                          <Lock className="w-6 h-6 text-white" />
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4
                            className={`text-lg font-semibold ${
                              allLessonsCompleted
                                ? "text-purple-900"
                                : "text-gray-600"
                            }`}
                          >
                            {topicQuiz.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {topicQuiz.description ||
                              "Test your knowledge with this topic quiz"}
                          </p>
                          <div className="flex items-center gap-4 mt-3">
                            {topicQuiz.difficulty && (
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  !allLessonsCompleted
                                    ? "bg-gray-50 text-gray-500 border-gray-200"
                                    : topicQuiz.difficulty?.toLowerCase() ===
                                      "easy"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : topicQuiz.difficulty?.toLowerCase() ===
                                      "medium"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                }`}
                              >
                                {topicQuiz.difficulty}
                              </Badge>
                            )}
                            {topicQuiz.timeLimitMin && (
                              <span className="text-sm text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {topicQuiz.timeLimitMin} min
                              </span>
                            )}
                            {topicQuiz.passingScore && (
                              <span className="text-sm text-muted-foreground">
                                Pass: {topicQuiz.passingScore}%
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className={
                            allLessonsCompleted
                              ? "bg-purple-600 hover:bg-purple-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }
                          disabled={!allLessonsCompleted}
                          onClick={(e: React.MouseEvent) => {
                            e.stopPropagation();
                            if (allLessonsCompleted) {
                              navigate(`/quizzes/${topicQuiz.id}`);
                            }
                          }}
                        >
                          {allLessonsCompleted ? (
                            "Take Quiz"
                          ) : (
                            <>
                              <Lock className="w-3 h-3 mr-1" />
                              Locked
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Quiz unlock hint */}
                  {!allLessonsCompleted && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 flex items-center gap-2">
                        <Lock className="w-4 h-4" />
                        Complete all {lessons.length - completedLessons}{" "}
                        remaining lesson
                        {lessons.length - completedLessons !== 1 ? "s" : ""} to
                        unlock this quiz
                      </p>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <Card className="p-6">
              <h4 className="mb-4">Course Stats</h4>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Total Lessons
                  </span>
                  <span className="text-sm">{lessons.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Completed
                  </span>
                  <span className="text-sm text-green-600">
                    {completedLessons}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Remaining
                  </span>
                  <span className="text-sm">
                    {lessons.length - completedLessons}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    Est. Time
                  </span>
                  <span className="text-sm">{estimatedTimeDisplay}</span>
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
          </div>
        </div>
      </div>
    </div>
  );
}
