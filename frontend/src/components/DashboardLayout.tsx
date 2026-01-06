import { ReactNode, useState } from "react";
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
  FileCode,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import NotificationModal from "./NotificationModal";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole?: "student" | "instructor" | "business";
}

export default function DashboardLayout({
  children,
  userRole = "student",
}: DashboardLayoutProps) {
  const { signOut, profile } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();
  const [notificationOpen, setNotificationOpen] = useState(false);

  const studentMenuItems = [
    { path: "/dashboard", label: t("nav.dashboard"), icon: Home },
    { path: "/courses", label: t("nav.courses"), icon: BookOpen },
    { path: "/quizzes", label: t("nav.quizzes"), icon: ClipboardList },
    { path: "/forum", label: t("nav.forum"), icon: MessageSquare },
    { path: "/notebook", label: t("nav.notebook"), icon: NotebookPen },
    { path: "/interview", label: t("nav.interview"), icon: VideoIcon },
    { path: "/profile", label: t("nav.profile"), icon: User },
    { path: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  const instructorMenuItems = [
    { path: "/instructor/dashboard", label: t("nav.dashboard"), icon: Home },
    { path: "/instructor/courses", label: t("nav.myCourses"), icon: VideoIcon },
    {
      path: "/instructor/quizzes",
      label: t("nav.quizManager"),
      icon: ClipboardList,
    },
    {
      path: "/instructor/problems",
      label: t("nav.myProblems"),
      icon: FileCode,
    },
    {
      path: "/instructor/interviews",
      label: t("nav.mockInterviews"),
      icon: VideoIcon,
    },
    {
      path: "/instructor/analytics",
      label: t("nav.analytics"),
      icon: BarChart3,
    },
    { path: "/forum", label: t("nav.forum"), icon: MessageSquare },
    { path: "/profile", label: t("nav.profile"), icon: User },
    { path: "/settings", label: t("nav.settings"), icon: Settings },
  ];

  const businessMenuItems = [
    { path: "/business/dashboard", label: t("nav.dashboard"), icon: Home },
    { path: "/business/account", label: t("nav.accountMgmt"), icon: Building },
    {
      path: "/business/courses",
      label: t("nav.courseManagement"),
      icon: BookOpen,
    },
    {
      path: "/business/instructors",
      label: t("nav.instructors"),
      icon: GraduationCap,
    },
    {
      path: "/business/performance",
      label: t("nav.performance"),
      icon: Target,
    },
    { path: "/business/analytics", label: t("nav.analytics"), icon: BarChart3 },
    { path: "/business/settings", label: t("nav.settings"), icon: Settings },
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
        return t("role.instructor");
      case "business":
        return t("role.business");
      default:
        return t("role.student");
    }
  };

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className="w-64 bg-white dark:bg-gray-800 flex flex-col fixed left-0 top-0 h-screen z-10"
        style={{ borderRight: "4px solid #B9D6F3" }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-border dark:border-gray-700">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Code2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl text-blue-600 dark:text-blue-400">
            CodeQuest
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
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
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all border-5 shadow-xl hover:shadow-lg ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-600"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-200 dark:border-gray-600"
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
        <div className="p-4 border-t border-border dark:border-gray-700 mt-auto flex-shrink-0">
          <div className="flex items-center gap-3 mb-3">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.display_name || 'User'}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-blue-600 dark:text-blue-400">
                  {profile?.display_name?.substring(0, 2).toUpperCase() || profile?.email?.substring(0, 2).toUpperCase() || 'U'}
                </span>
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm truncate dark:text-gray-300">
                {profile?.display_name || profile?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-muted-foreground dark:text-gray-500">
                {profile?.level || 'Beginner'}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="w-full dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            onClick={() => signOut()}
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t("nav.logout")}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col min-h-screen" style={{ marginLeft: "256px" }}>
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-border dark:border-gray-700 flex items-center justify-between px-8">
          <div>
            <h3 className="capitalize dark:text-gray-200">
              {(() => {
                const path = location.pathname;
                // Map paths to readable names
                if (path === '/dashboard') return 'Dashboard';
                if (path === '/courses') return 'Courses';
                if (path.startsWith('/courses/') && path.includes('/enroll')) return 'Course Enrollment';
                if (path.startsWith('/courses/')) return 'Course Details';
                if (path === '/quizzes') return 'Quizzes';
                if (path.startsWith('/quizzes/')) return 'Quiz Details';
                if (path === '/forum') return 'Forum';
                if (path.startsWith('/forum/')) return 'Forum Post';
                if (path === '/notebook') return 'Notebooks';
                if (path.startsWith('/notebook/')) return 'Notebook';
                if (path === '/interview') return 'Interview';
                if (path.startsWith('/interview/')) return 'Interview Session';
                if (path === '/profile') return 'Profile';
                if (path === '/settings') return 'Settings';
                if (path.startsWith('/topics/')) return 'Topic Lessons';
                if (path.startsWith('/lessons/')) return 'Lesson';
                if (path.startsWith('/editor/')) return 'Code Editor';
                // Instructor routes
                if (path === '/instructor/dashboard') return 'Instructor Dashboard';
                if (path === '/instructor/courses') return 'My Courses';
                if (path === '/instructor/quizzes') return 'Quiz Manager';
                if (path === '/instructor/problems') return 'My Problems';
                if (path.startsWith('/instructor/problems/')) return 'Problem Details';
                if (path === '/instructor/interviews') return 'Mock Interviews';
                if (path === '/instructor/analytics') return 'Analytics';
                // Business routes
                if (path === '/business/dashboard') return 'Business Dashboard';
                if (path === '/business/account') return 'Account Management';
                if (path === '/business/courses') return 'Course Management';
                if (path === '/business/instructors') return 'Instructors';
                if (path === '/business/performance') return 'Performance';
                if (path === '/business/analytics') return 'Analytics';
                if (path === '/business/settings') return 'Settings';
                // Fallback: prettify the last segment
                const lastSegment = path.split('/').filter(Boolean).pop() || 'Dashboard';
                return lastSegment.replace(/-/g, ' ');
              })()}
            </h3>
          </div>
          <div className="flex items-center gap-4">
            <button
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => setNotificationOpen(true)}
            >
              <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>
            <NotificationModal
              open={notificationOpen}
              onOpenChange={setNotificationOpen}
            />
            <Link to="/pricing">
              <Button
                variant="outline"
                size="sm"
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                {t("nav.upgradeToPro")}
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
