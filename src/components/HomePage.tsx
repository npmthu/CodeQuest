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

interface HomePageProps {
  onNavigate: (page: string, topic?: string) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const topics = [
    {
      id: "cpp",
      name: "C/C++",
      icon: Code,
      level: "Intermediate",
      lessons: 45,
      color: "bg-blue-500",
      progress: 65,
    },
    {
      id: "python",
      name: "Python",
      icon: FileCode,
      level: "Beginner",
      lessons: 52,
      color: "bg-green-500",
      progress: 80,
    },
    {
      id: "java",
      name: "Java",
      icon: Braces,
      level: "Intermediate",
      lessons: 48,
      color: "bg-orange-500",
      progress: 40,
    },
    {
      id: "dsa",
      name: "Data Structures & Algorithms",
      icon: Sparkles,
      level: "Advanced",
      lessons: 68,
      color: "bg-purple-500",
      progress: 55,
    },
    {
      id: "sql",
      name: "SQL & Databases",
      icon: Database,
      level: "Beginner",
      lessons: 30,
      color: "bg-cyan-500",
      progress: 45,
    },
    {
      id: "html",
      name: "HTML",
      icon: Layout,
      level: "Beginner",
      lessons: 25,
      color: "bg-red-500",
      progress: 90,
    },
    {
      id: "css",
      name: "CSS",
      icon: Sparkles,
      level: "Beginner",
      lessons: 32,
      color: "bg-pink-500",
      progress: 70,
    },
    {
      id: "javascript",
      name: "JavaScript",
      icon: Globe,
      level: "Intermediate",
      lessons: 56,
      color: "bg-yellow-500",
      progress: 60,
    },
    {
      id: "r",
      name: "R Programming",
      icon: Code,
      level: "Beginner",
      lessons: 28,
      color: "bg-indigo-500",
      progress: 20,
    },
  ];

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

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h2>Choose Your Learning Path</h2>
        <p className="text-muted-foreground mt-1">Select a topic to start learning and practicing</p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => {
          const Icon = topic.icon;
          return (
            <Card
              key={topic.id}
              className="p-6 hover:shadow-lg transition-all cursor-pointer group border-2 hover:border-blue-200"
              onClick={() => onNavigate("lesson", topic.id)}
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
                  onClick={() => onNavigate("lesson", "interview")}
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
                  onClick={() => onNavigate("editor")}
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
