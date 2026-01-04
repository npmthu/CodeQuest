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
  Target,
  ClipboardList,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: "student" | "instructor" | "business";
}

export default function DashboardLayout({
  children,
  userRole = "student",
}: DashboardLayoutProps) {
  const { signOut } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  const studentMenuItems = [
    { path: "/dashboard", label: t('nav.dashboard'), icon: Home },
    { path: "/courses", label: t('nav.courses'), icon: BookOpen },
    { path: "/quizzes", label: t('nav.quizzes'), icon: ClipboardList },
    { path: "/forum", label: t('nav.forum'), icon: MessageSquare },
    { path: "/notebook", label: t('nav.notebook'), icon: NotebookPen },
    { path: "/interview", label: t('nav.interview'), icon: VideoIcon },
    { path: "/profile", label: t('nav.profile'), icon: User },
    { path: "/settings", label: t('nav.settings'), icon: Settings },
  ];

  const instructorMenuItems = [
    { path: "/instructor/dashboard", label: t('nav.dashboard'), icon: Home },
    { path: "/instructor/courses", label: t('nav.myCourses'), icon: VideoIcon },
    { path: "/instructor/interviews", label: t('nav.mockInterviews'), icon: VideoIcon },
    { path: "/quizzes", label: t('nav.quizzes'), icon: ClipboardList },
    { path: "/instructor/analytics", label: t('nav.analytics'), icon: BarChart3 },
    { path: "/forum", label: t('nav.forum'), icon: MessageSquare },
    { path: "/profile", label: t('nav.profile'), icon: User },
    { path: "/settings", label: t('nav.settings'), icon: Settings },
  ];

  const businessMenuItems = [
    { path: "/business/dashboard", label: t('nav.dashboard'), icon: Home },
    { path: "/business/account", label: t('nav.accountMgmt'), icon: Building },
    {
      path: "/business/instructors",
      label: t('nav.instructors'),
      icon: GraduationCap,
    },
    { path: "/business/performance", label: t('nav.performance'), icon: Target },
    { path: "/business/analytics", label: t('nav.analytics'), icon: BarChart3 },
    { path: "/settings", label: t('nav.settings'), icon: Settings },
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
        return t('role.instructor');
      case "business":
        return t('role.business');
      default:
        return t('role.student');
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-border dark:border-gray-700 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border dark:border-gray-700">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl text-blue-600 dark:text-blue-400">CodeQuest</span>
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
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
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
        <div className="p-4 border-t border-border dark:border-gray-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400">BQ</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate dark:text-gray-300">Bug Quýt</p>
              <p className="text-xs text-muted-foreground dark:text-gray-500">Level 5</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('nav.logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-border dark:border-gray-700 flex items-center justify-between px-8">
          <div>
            <h3 className="capitalize dark:text-gray-200">
              {location.pathname.split("/").pop() || "Dashboard"}
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>
            <Link to="/pricing">
              <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                {t('nav.upgradeToPro')}
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
