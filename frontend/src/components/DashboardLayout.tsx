import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
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
  Target,
  ClipboardList,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: "student" | "instructor" | "business";
}

export default function DashboardLayout({
  children,
  userRole = "student",
}: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const location = useLocation();

  const studentMenuItems = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/courses", label: "Courses", icon: BookOpen },
    { path: "/quizzes", label: "Quizzes", icon: ClipboardList },
    { path: "/forum", label: "Forum", icon: MessageSquare },
    { path: "/notebook", label: "Notebook", icon: NotebookPen },
    { path: "/interview", label: "Interview", icon: VideoIcon },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const instructorMenuItems = [
    { path: "/instructor/dashboard", label: "Dashboard", icon: Home },
    { path: "/instructor/courses", label: "My Courses", icon: VideoIcon },
    { path: "/instructor/interviews", label: "Mock Interviews", icon: VideoIcon },
    { path: "/quizzes", label: "Quizzes", icon: ClipboardList },
    { path: "/instructor/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/forum", label: "Forum", icon: MessageSquare },
    { path: "/profile", label: "Profile", icon: User },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const businessMenuItems = [
    { path: "/business/dashboard", label: "Dashboard", icon: Home },
    { path: "/business/account", label: "Account Mgmt", icon: Building },
    {
      path: "/business/instructors",
      label: "Instructors",
      icon: GraduationCap,
    },
    { path: "/business/performance", label: "Performance", icon: Target },
    { path: "/business/analytics", label: "Analytics", icon: BarChart3 },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  const menuItems =
    userRole === "instructor"
      ? instructorMenuItems
      : userRole === "business"
      ? businessMenuItems
      : studentMenuItems;

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
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
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
            <h3 className="capitalize">
              {location.pathname.split("/").pop() || "Dashboard"}
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>
            <Link to="/pricing">
              <Button variant="outline" size="sm">
                Upgrade to Pro
              </Button>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
