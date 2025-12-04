import { useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { 
  Code, 
  Database, 
  Globe, 
  Braces, 
  FileCode, 
  Layout,
  Sparkles,
  ChevronRight
} from "lucide-react";
import LearningPathDetail from "./LearningPathDetail";
import CourseDetailPlaceholder from "./CourseDetailPlaceholder";
import ChallengePlaceholder from "./ChallengePlaceholder";
import { useTopics } from "../hooks/useApi";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<"main" | "path-detail" | "course-detail" | "challenge">("main");
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [challengeType, setChallengeType] = useState<"interview" | "daily">("interview");
  
  const { data: topicsData, isLoading } = useTopics();

  const handlePathClick = (topic: any) => {
    setSelectedPath(topic);
    setCurrentView("path-detail");
  };

  const handleCourseClick = (courseId: string) => {
    setSelectedCourse(courseId);
    setCurrentView("course-detail");
  };

  const handleChallengeClick = (type: "interview" | "daily") => {
    setChallengeType(type);
    setCurrentView("challenge");
  };

  const handleBack = () => {
    if (currentView === "course-detail") {
      setCurrentView("path-detail");
    } else {
      setCurrentView("main");
    }
  };

  // Render different views
  if (currentView === "path-detail" && selectedPath) {
    return (
      <LearningPathDetail
        pathId={selectedPath.id}
        pathName={selectedPath.name}
        level={selectedPath.level}
        onNavigate={(page:any, courseId:any) => {
          if (page === "course-detail" && courseId) {
            handleCourseClick(courseId);
          } else if (page === "editor") {
            // Navigate to code editor (handled by parent App.tsx)
            navigate('/editor');
          }
        }}
        onBack={handleBack}
      />
    );
  }

  if (currentView === "course-detail" && selectedCourse) {
    return (
      <CourseDetailPlaceholder
        courseId={selectedCourse}
        onBack={handleBack}
      />
    );
  }

  if (currentView === "challenge") {
    return (
      <ChallengePlaceholder
        challengeType={challengeType}
        onBack={handleBack}
      />
    );
  }

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Map backend topics to UI format
  const topics = topicsData?.map((topic: any) => ({
    id: topic.id,
    name: topic.name,
    icon: Code, // Default icon, can be customized based on topic
    level: topic.difficulty || "Beginner",
    lessons: topic.lesson_count || 0,
    color: "bg-blue-500", // Default color
    progress: 0, // Will be calculated from user progress
  })) || [];

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h2>Choose Your Learning Path</h2>
        <p className="text-muted-foreground mt-1">Select a topic to start learning and practicing</p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic: any) => {
          const Icon = topic.icon;
          return (
            <Card
              key={topic.id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-blue-200"
              onClick={() => handlePathClick(topic)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${topic.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <Badge className={getLevelColor(topic.level)}>{topic.level}</Badge>
              </div>
              
              <h3 className="mb-2 group-hover:text-blue-600 transition-colors">{topic.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{topic.lessons} lessons available</p>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="text-blue-600">{topic.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${topic.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Continue learning</span>
                <ChevronRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Recommended Section */}
      <div className="mt-8">
        <h3 className="mb-4">Recommended for You</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4>Interview Prep Challenge</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Practice top 50 coding interview questions
                </p>
                <button
                  onClick={() => handleChallengeClick("interview")}
                  className="mt-3 text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  Start challenge <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-white border-purple-200">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <Code className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4>Daily Coding Challenge</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Solve today's problem and earn bonus XP
                </p>
                <button
                  onClick={() => handleChallengeClick("daily")}
                  className="mt-3 text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                >
                  View problem <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}