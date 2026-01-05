import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Video,
  Users,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Search,
  Filter,
  Loader2,
  XCircle,
  TrendingUp,
  Star,
  Eye,
  PlayCircle,
  CheckCircle2,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useAuth } from "../contexts/AuthContext";
import { useLanguage } from "../contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { toast } from "sonner";
import CancelSessionModal from "./CancelSessionModal";

interface MockInterviewSession {
  id: string;
  title: string;
  description?: string;
  topic: string;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  session_date: string;
  duration_minutes: number;
  price: number;
  max_slots: number;
  slots_available: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  created_at: string;
  instructor?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export default function InstructorInterviews() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { language } = useLanguage();
  const [sessions, setSessions] = useState<MockInterviewSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  // Cancel session modal state
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] =
    useState<MockInterviewSession | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const { supabase } = await import("../../lib/supabaseClient");
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const token = session?.access_token;

      if (!token) {
        throw new Error("Session expired. Please login again.");
      }

      const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";

      const response = await fetch(
        `${API_URL}/mock-interviews/sessions?instructor_id=${user?.id}&limit=1000`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch sessions");
      }

      const result = await response.json();
      setSessions(result.data?.sessions || []);
    } catch (error: any) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load interview sessions");
    } finally {
      setLoading(false);
    }
  };

  const startSession = async (sessionId: string) => {
    // Navigate to lobby/waiting room instead of starting directly
    navigate(`/interview/lobby/${sessionId}`);
  };

  const openCancelModal = (session: MockInterviewSession) => {
    setSelectedSession(session);
    setCancelModalOpen(true);
  };

  const handleCancelSuccess = () => {
    fetchSessions(); // Refresh sessions list
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch =
      session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      session.topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || session.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "in_progress":
        return "bg-green-100 text-green-700";
      case "completed":
        return "bg-gray-100 text-gray-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "advanced":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  // Calculate stats
  const totalRevenue = sessions.reduce(
    (total, session) =>
      total + (session.max_slots - session.slots_available) * session.price,
    0
  );
  const totalBookings = sessions.reduce(
    (total, session) => total + (session.max_slots - session.slots_available),
    0
  );
  const completedSessions = sessions.filter(
    (s) => s.status === "completed"
  ).length;
  const scheduledSessions = sessions.filter(
    (s) => s.status === "scheduled"
  ).length;
  const inProgressSessions = sessions.filter(
    (s) => s.status === "in_progress"
  ).length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-pulse"></div>
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="text-muted-foreground animate-pulse">
          {language === "vi"
            ? "Đang tải phiên phỏng vấn..."
            : "Loading interview sessions..."}
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            {language === "vi" ? "Phỏng vấn thử" : "Mock Interviews"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === "vi"
              ? "Quản lý các phiên phỏng vấn của bạn"
              : "Manage your interview sessions"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button
            onClick={() => navigate("/instructor/create-session")}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === "vi" ? "Tạo phiên mới" : "Create Session"}
          </Button>
        </div>
      </div>

      {/* Stats Cards - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">
                {language === "vi" ? "Tổng số phiên" : "Total Sessions"}
              </p>
              <p className="text-3xl font-bold text-blue-700 mt-1">
                {sessions.length}
              </p>
              <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {inProgressSessions}{" "}
                {language === "vi" ? "đang diễn ra" : "in progress"}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Video className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-green-50 to-green-100/50 border-green-200 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">
                {language === "vi" ? "Đã lên lịch" : "Scheduled"}
              </p>
              <p className="text-3xl font-bold text-green-700 mt-1">
                {scheduledSessions}
              </p>
              <p className="text-xs text-green-500 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {language === "vi" ? "sắp diễn ra" : "upcoming"}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Calendar className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">
                {language === "vi" ? "Tổng đặt chỗ" : "Total Bookings"}
              </p>
              <p className="text-3xl font-bold text-purple-700 mt-1">
                {totalBookings}
              </p>
              <p className="text-xs text-purple-500 mt-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {language === "vi" ? "học viên" : "learners"}
              </p>
            </div>
            <div className="w-14 h-14 bg-purple-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-amber-100/50 border-amber-200 hover:shadow-lg transition-all duration-300 group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600">
                {language === "vi" ? "Doanh thu" : "Revenue"}
              </p>
              <p className="text-3xl font-bold text-amber-700 mt-1">
                ${totalRevenue.toLocaleString()}
              </p>
              <p className="text-xs text-amber-500 mt-1 flex items-center gap-1">
                <Star className="w-3 h-3" />
                {completedSessions}{" "}
                {language === "vi" ? "hoàn thành" : "completed"}
              </p>
            </div>
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Search & Filters - Enhanced */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={
                language === "vi" ? "Tìm kiếm phiên..." : "Search sessions..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">
                {language === "vi" ? "Tất cả trạng thái" : "All Status"}
              </option>
              <option value="scheduled">
                {language === "vi" ? "Đã lên lịch" : "Scheduled"}
              </option>
              <option value="in_progress">
                {language === "vi" ? "Đang diễn ra" : "In Progress"}
              </option>
              <option value="completed">
                {language === "vi" ? "Hoàn thành" : "Completed"}
              </option>
              <option value="cancelled">
                {language === "vi" ? "Đã hủy" : "Cancelled"}
              </option>
            </select>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className={
                showFilters ? "bg-blue-50 border-blue-200 text-blue-600" : ""
              }
            >
              <Filter className="w-4 h-4 mr-2" />
              {language === "vi" ? "Bộ lọc" : "More Filters"}
            </Button>
          </div>
        </div>

        {/* Expandable Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4 animate-in slide-in-from-top-2 duration-200">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                {language === "vi" ? "Độ khó" : "Difficulty"}
              </label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">
                  {language === "vi" ? "Tất cả" : "All Levels"}
                </option>
                <option value="beginner">
                  {language === "vi" ? "Cơ bản" : "Beginner"}
                </option>
                <option value="intermediate">
                  {language === "vi" ? "Trung bình" : "Intermediate"}
                </option>
                <option value="advanced">
                  {language === "vi" ? "Nâng cao" : "Advanced"}
                </option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                {language === "vi" ? "Chủ đề" : "Topic"}
              </label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">
                  {language === "vi" ? "Tất cả chủ đề" : "All Topics"}
                </option>
                <option value="system_design">System Design</option>
                <option value="algorithms">Data Structures & Algorithms</option>
                <option value="behavioral">Behavioral</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-1.5 block">
                {language === "vi" ? "Khoảng giá" : "Price Range"}
              </label>
              <select className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                <option value="">
                  {language === "vi" ? "Tất cả giá" : "All Prices"}
                </option>
                <option value="0-25">$0 - $25</option>
                <option value="25-50">$25 - $50</option>
                <option value="50+">$50+</option>
              </select>
            </div>
          </div>
        )}
      </Card>

      {/* Tabs for Quick Filtering */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-2xl bg-gray-100 p-1 rounded-xl">
          <TabsTrigger
            value="all"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            {language === "vi" ? "Tất cả" : "All"} ({sessions.length})
          </TabsTrigger>
          <TabsTrigger
            value="scheduled"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            {scheduledSessions}
          </TabsTrigger>
          <TabsTrigger
            value="in_progress"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <PlayCircle className="w-3.5 h-3.5 mr-1.5" />
            {inProgressSessions}
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
            {completedSessions}
          </TabsTrigger>
          <TabsTrigger
            value="cancelled"
            className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm"
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            {sessions.filter((s) => s.status === "cancelled").length}
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Sessions List - Enhanced */}
      <div className="space-y-4">
        {filteredSessions.length === 0 ? (
          <Card className="p-12 text-center bg-gradient-to-br from-gray-50 to-gray-100/50">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Video className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {language === "vi"
                ? "Không tìm thấy phiên phỏng vấn"
                : "No interview sessions found"}
            </h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              {searchTerm || statusFilter !== "all"
                ? language === "vi"
                  ? "Thử điều chỉnh bộ lọc của bạn"
                  : "Try adjusting your filters"
                : language === "vi"
                ? "Tạo phiên phỏng vấn đầu tiên để bắt đầu"
                : "Create your first mock interview session to get started"}
            </p>
            <Button
              onClick={() => navigate("/instructor/create-session")}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === "vi" ? "Tạo phiên mới" : "Create Session"}
            </Button>
          </Card>
        ) : (
          filteredSessions.map((session, index) => (
            <Card
              key={session.id}
              className="p-6 hover:shadow-xl transition-all duration-300 border-l-4 group"
              style={{
                borderLeftColor:
                  session.status === "scheduled"
                    ? "#3b82f6"
                    : session.status === "in_progress"
                    ? "#22c55e"
                    : session.status === "completed"
                    ? "#6b7280"
                    : "#ef4444",
                animationDelay: `${index * 50}ms`,
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                      {session.title}
                    </h3>
                    <Badge
                      className={`${getStatusColor(session.status)} border`}
                    >
                      {session.status === "scheduled" && (
                        <Calendar className="w-3 h-3 mr-1" />
                      )}
                      {session.status === "in_progress" && (
                        <PlayCircle className="w-3 h-3 mr-1" />
                      )}
                      {session.status === "completed" && (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      )}
                      {session.status === "cancelled" && (
                        <XCircle className="w-3 h-3 mr-1" />
                      )}
                      {session.status}
                    </Badge>
                    <Badge
                      className={`${getDifficultyColor(
                        session.difficulty_level
                      )} border`}
                    >
                      {session.difficulty_level}
                    </Badge>
                  </div>

                  {session.description && (
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {session.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 flex-wrap text-sm">
                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                      <Calendar className="w-4 h-4 text-blue-500" />
                      <span>
                        {new Date(session.session_date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                      <Clock className="w-4 h-4 text-purple-500" />
                      <span>
                        {session.duration_minutes}{" "}
                        {language === "vi" ? "phút" : "minutes"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
                      <Users className="w-4 h-4 text-green-500" />
                      <span>
                        {session.max_slots - session.slots_available}/
                        {session.max_slots}{" "}
                        {language === "vi" ? "đã đặt" : "booked"}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 bg-amber-100 px-3 py-1.5 rounded-full font-medium">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      <span className="text-amber-700">${session.price}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4">
                    <Badge variant="outline" className="bg-white">
                      {session.topic}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {(session.status === "scheduled" ||
                    session.status === "in_progress") && (
                    <Button
                      onClick={() =>
                        session.status === "scheduled"
                          ? startSession(session.id)
                          : navigate(`/interview/lobby/${session.id}`)
                      }
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg transition-all"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {session.status === "scheduled"
                        ? language === "vi"
                          ? "Bắt đầu"
                          : "Start"
                        : language === "vi"
                        ? "Tham gia"
                        : "Join"}
                    </Button>
                  )}

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-9 w-9">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/interview/lobby/${session.id}`)
                        }
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {language === "vi" ? "Xem chi tiết" : "View Details"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="w-4 h-4 mr-2" />
                        {language === "vi" ? "Chỉnh sửa" : "Edit Session"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Copy className="w-4 h-4 mr-2" />
                        {language === "vi" ? "Nhân bản" : "Duplicate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        {language === "vi" ? "Chia sẻ link" : "Share Link"}
                      </DropdownMenuItem>
                      {(session.status === "scheduled" ||
                        session.status === "in_progress") && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openCancelModal(session)}
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {language === "vi" ? "Hủy phiên" : "Cancel Session"}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Progress Bar for Bookings - Enhanced */}
              <div className="mt-5 pt-4 border-t">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600 font-medium">
                    {language === "vi"
                      ? "Tình trạng đặt chỗ"
                      : "Booking Progress"}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {session.max_slots - session.slots_available} /{" "}
                    {session.max_slots}
                    <span className="text-gray-500 font-normal ml-1">
                      (
                      {Math.round(
                        ((session.max_slots - session.slots_available) /
                          session.max_slots) *
                          100
                      )}
                      %)
                    </span>
                  </span>
                </div>
                <Progress
                  value={
                    ((session.max_slots - session.slots_available) /
                      session.max_slots) *
                    100
                  }
                  className="h-2.5"
                />
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Cancel Session Modal */}
      {selectedSession && (
        <CancelSessionModal
          isOpen={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false);
            setSelectedSession(null);
          }}
          sessionId={selectedSession.id}
          sessionTitle={selectedSession.title}
          onSuccess={handleCancelSuccess}
        />
      )}
    </div>
  );
}
