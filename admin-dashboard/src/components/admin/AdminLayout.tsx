import React, { useState } from "react";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
  CreditCard,
  Settings,
  History,
  GraduationCap,
  BarChart3,
  ChevronRight,
  Search,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";

interface AdminLayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export default function AdminLayout({
  children,
  currentPage,
  onNavigate,
  onLogout,
}: AdminLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const menuItems = [
    {
      id: "admin-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      badge: null,
    },
    { id: "admin-users", label: "User Management", icon: Users, badge: null },
    {
      id: "admin-instructors",
      label: "Instructor Management",
      icon: GraduationCap,
      badge: "3",
    },
    {
      id: "admin-subscriptions",
      label: "Subscriptions",
      icon: CreditCard,
      badge: null,
    },
    {
      id: "admin-courses",
      label: "Course Management",
      icon: BookOpen,
      badge: null,
    },
    {
      id: "admin-moderation",
      label: "Content Moderation",
      icon: MessageSquare,
      badge: "12",
    },
    {
      id: "admin-notifications",
      label: "Notifications",
      icon: Bell,
      badge: "5",
    },
    {
      id: "admin-reports",
      label: "Reports & Analytics",
      icon: BarChart3,
      badge: null,
    },
    { id: "admin-audit", label: "Audit Logs", icon: History, badge: null },
    {
      id: "admin-settings",
      label: "System Settings",
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Top Navigation Bar */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="flex items-center justify-between px-4 lg:px-6 h-16">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              {isSidebarOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <span className="text-white font-bold">CQ</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-semibold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                  CodeQuest Admin
                </h1>
                <p className="text-xs text-gray-500">Management Portal</p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search users, courses, settings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-50/50 border-gray-200 rounded-xl focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 lg:gap-4">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="rounded-xl hover:bg-gray-100"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-gray-100 relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                5
              </span>
            </Button>

            <div className="h-8 w-px bg-gray-200 hidden lg:block" />

            <div className="flex items-center gap-3">
              <Avatar className="ring-2 ring-blue-100">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-semibold">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Super Admin</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onLogout}
              className="text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] bg-white/80 backdrop-blur-lg border-r border-gray-200/50
            w-72 transition-all duration-300 z-40 shadow-xl lg:shadow-none
            ${
              isSidebarOpen
                ? "translate-x-0"
                : "-translate-x-full lg:translate-x-0"
            }
          `}
        >
          <div className="p-4 border-b border-gray-100">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-900">Quick Stats</p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div>
                  <p className="text-2xl font-bold text-blue-600">1,234</p>
                  <p className="text-xs text-gray-600">Active Users</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-indigo-600">$12.4k</p>
                  <p className="text-xs text-gray-600">Revenue</p>
                </div>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1.5 overflow-y-auto h-[calc(100%-140px)]">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${
                        isActive
                          ? ""
                          : "group-hover:scale-110 transition-transform"
                      }`}
                    />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge
                        className={`${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-red-100 text-red-600"
                        } text-xs px-2`}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight
                      className={`w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${
                        isActive ? "opacity-100 translate-x-0" : ""
                      }`}
                    />
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto min-h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
