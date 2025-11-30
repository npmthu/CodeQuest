import { ReactNode } from "react";
import { 
  Home, 
  BookOpen, 
  MessageSquare, 
  NotebookPen, 
  User, 
  Settings,
  Code2,
  LogOut,
  Bell,
  GraduationCap,
  Video as VideoIcon,
  BarChart3,
  Building,
  Users,
  Target
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  userRole?: "student" | "instructor" | "business";
  onRoleToggle?: () => void;
}

export default function DashboardLayout({ 
  children, 
  currentPage, 
  onNavigate,
  userRole = "student",
  onRoleToggle
}: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const studentMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "home", label: "Lessons", icon: BookOpen },
    { id: "forum", label: "Forum", icon: MessageSquare },
    { id: "notebook", label: "Notebook", icon: NotebookPen },
    { id: "interview", label: "Interview", icon: VideoIcon },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const instructorMenuItems = [
    { id: "instructor-dashboard", label: "Dashboard", icon: Home },
    { id: "instructor-courses", label: "My Courses", icon: VideoIcon },
    { id: "instructor-analytics", label: "Analytics", icon: BarChart3 },
    { id: "forum", label: "Forum", icon: MessageSquare },
    { id: "profile", label: "Profile", icon: User },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const businessMenuItems = [
    { id: "business-dashboard", label: "Dashboard", icon: Home },
    { id: "business-account", label: "Account Mgmt", icon: Building },
    { id: "business-instructors", label: "Instructors", icon: GraduationCap },
    { id: "business-performance", label: "Performance", icon: Target },
    { id: "business-analytics", label: "Analytics", icon: BarChart3 },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const menuItems = 
    userRole === "instructor" ? instructorMenuItems :
    userRole === "business" ? businessMenuItems :
    studentMenuItems;

  const getRoleBadgeStyle = () => {
    switch (userRole) {
      case "instructor":
        return "bg-purple-100 text-purple-700";
      case "business":
        return "bg-emerald-100 text-emerald-700";
      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  const getRoleLabel = () => {
    switch (userRole) {
      case "instructor":
        return "Instructor Mode";
      case "business":
        return "Business Partner";
      default:
        return "Student Mode";
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-border flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl text-blue-600">CodeQuest</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {/* Role Badge */}
          <div className="mb-4 px-2">
            <Badge 
              className={`${getRoleBadgeStyle()} w-full justify-center py-2`}
            >
              <GraduationCap className="w-4 h-4 mr-2" />
              {getRoleLabel()}
            </Badge>
          </div>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <span className="text-blue-600">BQ</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate">Bug Quýt</p>
              <p className="text-xs text-muted-foreground">Level 5</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white border-b border-border flex items-center justify-between px-8">
          <div>
            <h3 className="capitalize">{currentPage}</h3>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>
            <Button onClick={() => onNavigate("pricing")} variant="outline" size="sm">
              Upgrade to Pro
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}