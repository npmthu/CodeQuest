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

interface LessonPageProps {
  onNavigate: (page: string) => void;
}

export default function LessonPage({ onNavigate }: LessonPageProps) {
  const lessons = [
    { id: 1, title: "Introduction to Variables", duration: "15 min", completed: true, type: "theory" },
    { id: 2, title: "Data Types", duration: "20 min", completed: true, type: "theory" },
    { id: 3, title: "Practice: Variable Declaration", duration: "30 min", completed: true, type: "practice" },
    { id: 4, title: "Operators and Expressions", duration: "25 min", completed: false, type: "theory", current: true },
    { id: 5, title: "Control Flow: If-Else", duration: "30 min", completed: false, type: "theory" },
    { id: 6, title: "Practice: Conditional Logic", duration: "45 min", completed: false, type: "practice" },
    { id: 7, title: "Loops: For and While", duration: "35 min", completed: false, type: "theory" },
    { id: 8, title: "Quiz: Fundamentals", duration: "20 min", completed: false, type: "quiz" },
  ];

  const completedLessons = lessons.filter(l => l.completed).length;
  const progressPercent = (completedLessons / lessons.length) * 100;

  return (
    <div className="min-h-full bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <button
            onClick={() => onNavigate("home")}
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
              const isCompleted = lesson.completed;
              const isCurrent = lesson.current;

              return (
                <Card
                  key={lesson.id}
                  className={`p-6 cursor-pointer hover:shadow-md transition-all ${
                    isCurrent ? "border-2 border-blue-500" : ""
                  }`}
                  onClick={() => onNavigate("lesson-detail")}
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
                            <Badge variant="outline" className="text-xs">
                              {lesson.type === "theory" && <BookOpen className="w-3 h-3 mr-1" />}
                              {lesson.type === "practice" && <Code className="w-3 h-3 mr-1" />}
                              {lesson.type === "quiz" && <FileText className="w-3 h-3 mr-1" />}
                              {lesson.type.charAt(0).toUpperCase() + lesson.type.slice(1)}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {lesson.duration}
                            </span>
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
              onClick={() => onNavigate("editor")}
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
