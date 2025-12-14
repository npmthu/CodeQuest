import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  ArrowLeft,
  PlayCircle,
  Lock,
  CheckCircle,
  Clock,
  BookOpen,
  Code,
  Trophy
} from "lucide-react";

import { useNavigate } from "react-router-dom";

interface LearningPathDetailProps {
  pathId: string;
  pathName: string;
  level: string;
  onBack: () => void;
}

export default function LearningPathDetail({ 
  pathId, 
  pathName, 
  level,
  onBack 
}: LearningPathDetailProps) {
  const navigate = useNavigate();
  const getLevelColor = (level: string) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-700";
      case "Intermediate":
        return "bg-yellow-100 text-yellow-700";
      case "Advanced":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Mock courses for this learning path
  const courses = [
    {
      id: `${pathId}-intro`,
      title: "Introduction to " + pathName,
      duration: "45 min",
      status: "completed",
      locked: false,
    },
    {
      id: `${pathId}-basics`,
      title: pathName + " Basics",
      duration: "1.5 hours",
      status: "in-progress",
      locked: false,
    },
    {
      id: `${pathId}-intermediate`,
      title: "Intermediate " + pathName,
      duration: "2 hours",
      status: "not-started",
      locked: false,
    },
    {
      id: `${pathId}-advanced`,
      title: "Advanced " + pathName + " Concepts",
      duration: "2.5 hours",
      status: "not-started",
      locked: true,
    },
    {
      id: `${pathId}-project`,
      title: pathName + " Final Project",
      duration: "3 hours",
      status: "not-started",
      locked: true,
    },
  ];

  const getStatusIcon = (status: string, locked: boolean) => {
    if (locked) return <Lock className="w-5 h-5 text-gray-400" />;
    if (status === "completed") return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (status === "in-progress") return <PlayCircle className="w-5 h-5 text-blue-600" />;
    return <PlayCircle className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-6xl mx-auto px-8 py-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Learning Paths
          </Button>
          
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <h2>{pathName} Learning Path</h2>
                <Badge className={getLevelColor(level)}>{level}</Badge>
              </div>
              <p className="text-muted-foreground">
                Master {pathName} through structured lessons and hands-on practice
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl mb-1">45%</div>
              <p className="text-sm text-muted-foreground">Overall Progress</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              <span className="text-sm text-muted-foreground">Lessons</span>
            </div>
            <p className="text-2xl">{courses.length}</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-5 h-5 text-green-600" />
              <span className="text-sm text-muted-foreground">Duration</span>
            </div>
            <p className="text-2xl">9.5h</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="text-sm text-muted-foreground">XP to Earn</span>
            </div>
            <p className="text-2xl">2,500</p>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Code className="w-5 h-5 text-purple-600" />
              <span className="text-sm text-muted-foreground">Exercises</span>
            </div>
            <p className="text-2xl">45</p>
          </Card>
        </div>

        {/* Placeholder Notice */}
        <Card className="p-6 bg-blue-50 border-blue-200 mb-8">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="mb-1">🚧 Placeholder Page</h4>
              <p className="text-sm text-muted-foreground">
                This is a temporary placeholder for the <span className="font-medium text-blue-600">{pathName}</span> learning path.
                Course content will be available soon. You can click on any course below to see the placeholder structure.
              </p>
            </div>
          </div>
        </Card>

        {/* Course Curriculum */}
        <h3 className="mb-6">Course Curriculum</h3>
        
        {/* Lessons Subsection */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-blue-600" />
            <h4>Lessons</h4>
          </div>
          <div className="space-y-4">
            {courses.map((course, index) => (
              <Card
                key={course.id}
                className={`p-6 transition-all ${
                  course.locked 
                    ? "opacity-60 cursor-not-allowed" 
                    : "hover:shadow-lg cursor-pointer"
                }`}
                onClick={() => !course.locked && navigate(`/courses/${course.id}`)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                    {getStatusIcon(course.status, course.locked)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm text-muted-foreground">Lesson {index + 1}</span>
                      {course.status === "completed" && (
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      )}
                      {course.status === "in-progress" && (
                        <Badge className="bg-blue-100 text-blue-700">In Progress</Badge>
                      )}
                      {course.locked && (
                        <Badge variant="outline" className="text-gray-600">
                          <Lock className="w-3 h-3 mr-1" />
                          Locked
                        </Badge>
                      )}
                    </div>
                    <h4>{course.title}</h4>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {course.duration}
                      </span>
                    </div>
                  </div>

                  {!course.locked && (
                    <Button variant={course.status === "in-progress" ? "default" : "outline"}>
                      {course.status === "completed" ? "Review" : 
                       course.status === "in-progress" ? "Continue" : "Start"}
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Problems Subsection */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-5 h-5 text-purple-600" />
            <h4>Problems</h4>
          </div>
          <div className="space-y-4">
            <Card
              className="p-6 transition-all hover:shadow-lg cursor-pointer"
              onClick={() => navigate('/editor')}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Code className="w-6 h-6 text-purple-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-muted-foreground">Problem 1</span>
                    <Badge className="bg-green-100 text-green-700">Easy</Badge>
                    <span className="text-sm text-muted-foreground">Arrays • Hash Table</span>
                  </div>
                  <h4>Two Sum</h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    Find two numbers in an array that add up to a target value
                  </p>
                </div>

                <Button className="bg-purple-600 hover:bg-purple-700">
                  Solve Problem
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
