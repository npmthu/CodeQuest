import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Bell,
  BookOpen,
  MessageSquare,
  Award,
  CheckCircle2,
  AlertCircle,
  Info,
  Trash2,
  Check,
  Clock,
  Video,
  Settings,
} from "lucide-react";

interface Notification {
  id: string;
  type:
    | "course"
    | "forum"
    | "achievement"
    | "interview"
    | "system"
    | "reminder";
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  link?: string;
}

// Mock notifications data
const mockNotifications: Notification[] = [
  {
    id: "1",
    type: "course",
    title: "New Lesson Available",
    message:
      "A new lesson 'Advanced React Hooks' has been added to your enrolled course.",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    read: false,
    link: "/courses",
  },
  {
    id: "2",
    type: "achievement",
    title: "Achievement Unlocked! 🎉",
    message:
      "Congratulations! You've earned the 'Problem Solver' badge for solving 50 problems.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: false,
  },
  {
    id: "3",
    type: "interview",
    title: "Interview Reminder",
    message:
      "Your mock interview session starts in 1 hour. Don't forget to prepare!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    read: false,
    link: "/interview",
  },
  {
    id: "4",
    type: "forum",
    title: "New Reply to Your Post",
    message:
      "Someone replied to your question about 'Binary Search Implementation'.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: true,
    link: "/forum",
  },
  {
    id: "5",
    type: "system",
    title: "System Maintenance",
    message:
      "Scheduled maintenance on January 10th from 2:00 AM to 4:00 AM UTC.",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
  },
  {
    id: "6",
    type: "reminder",
    title: "Continue Your Learning",
    message: "You haven't practiced in 3 days. Keep your streak going!",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    read: true,
  },
];

interface NotificationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationModal({
  open,
  onOpenChange,
}: NotificationModalProps) {
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications =
    filter === "all" ? notifications : notifications.filter((n) => !n.read);

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "course":
        return <BookOpen className="w-5 h-5 text-blue-500" />;
      case "forum":
        return <MessageSquare className="w-5 h-5 text-green-500" />;
      case "achievement":
        return <Award className="w-5 h-5 text-yellow-500" />;
      case "interview":
        return <Video className="w-5 h-5 text-purple-500" />;
      case "system":
        return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case "reminder":
        return <Clock className="w-5 h-5 text-cyan-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getNotificationBg = (type: Notification["type"], read: boolean) => {
    if (read) return "bg-gray-50 dark:bg-gray-800/50";

    switch (type) {
      case "course":
        return "bg-blue-50 dark:bg-blue-900/20";
      case "forum":
        return "bg-green-50 dark:bg-green-900/20";
      case "achievement":
        return "bg-yellow-50 dark:bg-yellow-900/20";
      case "interview":
        return "bg-purple-50 dark:bg-purple-900/20";
      case "system":
        return "bg-orange-50 dark:bg-orange-900/20";
      case "reminder":
        return "bg-cyan-50 dark:bg-cyan-900/20";
      default:
        return "bg-gray-50 dark:bg-gray-800/50";
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md md:max-w-lg p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="p-4 pb-3 border-b dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-600" />
                Notifications
              </DialogTitle>
              {unreadCount > 0 && (
                <Badge className="bg-blue-600 text-white">
                  {unreadCount} new
                </Badge>
              )}
            </div>
          </div>

          {/* Filter Tabs & Actions */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  filter === "all"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={`px-3 py-1.5 text-sm rounded-full transition-colors ${
                  filter === "unread"
                    ? "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <div className="flex gap-2">
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Notification List */}
        <ScrollArea className="h-[400px]">
          {filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
              <Bell className="w-12 h-12 mb-3 opacity-50" />
              <p className="font-medium">No notifications</p>
              <p className="text-sm">
                {filter === "unread"
                  ? "You're all caught up!"
                  : "Check back later for updates"}
              </p>
            </div>
          ) : (
            <div className="divide-y dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors hover:bg-gray-100 dark:hover:bg-gray-700/50 cursor-pointer ${getNotificationBg(
                    notification.type,
                    notification.read
                  )}`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.link) {
                      onOpenChange(false);
                      window.location.href = notification.link;
                    }
                  }}
                >
                  <div className="flex gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-sm font-medium ${
                            !notification.read
                              ? "text-gray-900 dark:text-white"
                              : "text-gray-600 dark:text-gray-300"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatTime(notification.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                        {notification.message}
                      </p>

                      {/* Actions */}
                      <div className="flex items-center gap-2 mt-2">
                        {!notification.read && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Mark as read
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="text-xs text-gray-500 hover:text-red-500 dark:text-gray-400 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </div>

                    {/* Unread indicator */}
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear all
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onOpenChange(false);
                window.location.href = "/settings";
              }}
            >
              <Settings className="w-4 h-4 mr-1" />
              Notification settings
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
