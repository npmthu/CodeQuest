import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import {
  Plus,
  Edit,
  Trash2,
  FileText,
  CheckCircle,
  Clock,
  Eye,
  Settings,
  Loader2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  Search,
  Copy,
  ToggleLeft,
  ToggleRight,
  HelpCircle,
  Target,
  ListChecks,
} from "lucide-react";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  useQuizzes,
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
  useTopics,
} from "../hooks/useApi";
import type {
  Quiz,
  QuizDetail,
  QuizQuestion,
} from "../interfaces/quiz.interface";

// ==================== Interfaces ====================
interface QuestionFormData {
  id: string;
  questionText: string;
  questionType: "multiple_choice" | "true_false" | "short_answer";
  options: string[];
  correctAnswer: string;
  points: number;
  displayOrder: number;
}

interface QuizFormData {
  title: string;
  description: string;
  topicId: string;
  difficulty: string;
  timeLimitMin: number;
  passingScore: number;
  isPublished: boolean;
  questions: QuestionFormData[];
}

// ==================== Helper Functions ====================
const generateId = () =>
  `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const createEmptyQuestion = (order: number): QuestionFormData => ({
  id: generateId(),
  questionText: "",
  questionType: "multiple_choice",
  options: ["", "", "", ""],
  correctAnswer: "",
  points: 10,
  displayOrder: order,
});

const createEmptyQuiz = (): QuizFormData => ({
  title: "",
  description: "",
  topicId: "",
  difficulty: "Beginner",
  timeLimitMin: 30,
  passingScore: 70,
  isPublished: false,
  questions: [],
});

export default function InstructorQuizManager() {
  const { language } = useLanguage();
  const { session } = useAuth();

  // Data fetching
  const {
    data: quizzes,
    isLoading: loadingQuizzes,
    refetch: refetchQuizzes,
  } = useQuizzes();
  const { data: topics } = useTopics();
  const createQuizMutation = useCreateQuiz();
  const deleteQuizMutation = useDeleteQuiz();

  // State
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // Form states
  const [quizForm, setQuizForm] = useState<QuizFormData>(createEmptyQuiz());
  const [editingQuestion, setEditingQuestion] =
    useState<QuestionFormData | null>(null);
  const [saving, setSaving] = useState(false);

  // Update quiz mutation (needs quizId)
  const updateQuizMutation = useUpdateQuiz(selectedQuiz?.id || "");

  // Filter quizzes
  const filteredQuizzes = (quizzes || []).filter((quiz: Quiz) => {
    const matchesSearch =
      quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quiz.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty =
      filterDifficulty === "all" ||
      quiz.difficulty?.toLowerCase() === filterDifficulty.toLowerCase();
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "published" && quiz.isPublished) ||
      (filterStatus === "draft" && !quiz.isPublished);
    return matchesSearch && matchesDifficulty && matchesStatus;
  });

  // ==================== Quiz CRUD Handlers ====================
  const handleCreateQuiz = async () => {
    if (!quizForm.title.trim()) {
      alert(
        language === "vi" ? "Vui lòng nhập tiêu đề" : "Please enter a title"
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: quizForm.title,
        description: quizForm.description,
        topicId: quizForm.topicId || null,
        difficulty: quizForm.difficulty,
        timeLimitMin: quizForm.timeLimitMin,
        passingScore: quizForm.passingScore,
        isPublished: quizForm.isPublished,
        questions: quizForm.questions.map((q, index) => ({
          questionText: q.questionText,
          questionType: q.questionType,
          options:
            q.questionType === "multiple_choice"
              ? q.options.filter((o) => o.trim())
              : null,
          correctAnswer: q.correctAnswer,
          points: q.points,
          displayOrder: index + 1,
        })),
      };

      await createQuizMutation.mutateAsync(payload);
      setIsCreateModalOpen(false);
      setQuizForm(createEmptyQuiz());
      refetchQuizzes();
    } catch (error: any) {
      console.error("Create quiz error:", error);
      alert(error.message || "Failed to create quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateQuiz = async () => {
    if (!selectedQuiz || !quizForm.title.trim()) {
      alert(
        language === "vi" ? "Vui lòng nhập tiêu đề" : "Please enter a title"
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: quizForm.title,
        description: quizForm.description,
        topicId: quizForm.topicId || null,
        difficulty: quizForm.difficulty,
        timeLimitMin: quizForm.timeLimitMin,
        passingScore: quizForm.passingScore,
        isPublished: quizForm.isPublished,
        questions: quizForm.questions.map((q, index) => ({
          id: q.id.startsWith("temp-") ? undefined : q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          options:
            q.questionType === "multiple_choice"
              ? q.options.filter((o) => o.trim())
              : null,
          correctAnswer: q.correctAnswer,
          points: q.points,
          displayOrder: index + 1,
        })),
      };

      await updateQuizMutation.mutateAsync(payload);
      setIsEditModalOpen(false);
      setSelectedQuiz(null);
      setQuizForm(createEmptyQuiz());
      refetchQuizzes();
    } catch (error: any) {
      console.error("Update quiz error:", error);
      alert(error.message || "Failed to update quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return;

    setSaving(true);
    try {
      await deleteQuizMutation.mutateAsync(selectedQuiz.id);
      setIsDeleteModalOpen(false);
      setSelectedQuiz(null);
      refetchQuizzes();
    } catch (error: any) {
      console.error("Delete quiz error:", error);
      alert(error.message || "Failed to delete quiz");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (quiz: Quiz) => {
    try {
      // Make an API call directly
      const API_URL = import.meta.env.VITE_API_BASE || "http://localhost:3000";
      const response = await fetch(`${API_URL}/quizzes/${quiz.id}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublished: !quiz.isPublished }),
      });

      if (!response.ok) throw new Error("Failed to update");
      refetchQuizzes();
    } catch (error: any) {
      console.error("Toggle publish error:", error);
      alert(error.message || "Failed to toggle publish status");
    }
  };

  const handleDuplicateQuiz = async (quiz: Quiz) => {
    try {
      const payload = {
        title: `${quiz.title} (Copy)`,
        description: quiz.description,
        topicId: quiz.topicId,
        difficulty: quiz.difficulty,
        timeLimitMin: quiz.timeLimitMin,
        passingScore: quiz.passingScore,
        isPublished: false,
        questions: [],
      };

      await createQuizMutation.mutateAsync(payload);
      refetchQuizzes();
    } catch (error: any) {
      console.error("Duplicate quiz error:", error);
      alert(error.message || "Failed to duplicate quiz");
    }
  };

  // ==================== Question Handlers ====================
  const addQuestion = () => {
    const newQuestion = createEmptyQuestion(quizForm.questions.length + 1);
    setEditingQuestion(newQuestion);
    setIsQuestionModalOpen(true);
  };

  const editQuestion = (question: QuestionFormData) => {
    setEditingQuestion({ ...question });
    setIsQuestionModalOpen(true);
  };

  const saveQuestion = () => {
    if (!editingQuestion) return;
    if (!editingQuestion.questionText.trim()) {
      alert(
        language === "vi" ? "Vui lòng nhập câu hỏi" : "Please enter a question"
      );
      return;
    }

    setQuizForm((prev) => {
      const existingIndex = prev.questions.findIndex(
        (q) => q.id === editingQuestion.id
      );
      if (existingIndex >= 0) {
        const newQuestions = [...prev.questions];
        newQuestions[existingIndex] = editingQuestion;
        return { ...prev, questions: newQuestions };
      } else {
        return { ...prev, questions: [...prev.questions, editingQuestion] };
      }
    });

    setIsQuestionModalOpen(false);
    setEditingQuestion(null);
  };

  const deleteQuestion = (questionId: string) => {
    const confirmMsg =
      language === "vi"
        ? "Bạn có chắc muốn xóa câu hỏi này?"
        : "Are you sure you want to delete this question?";
    if (confirm(confirmMsg)) {
      setQuizForm((prev) => ({
        ...prev,
        questions: prev.questions.filter((q) => q.id !== questionId),
      }));
    }
  };

  const moveQuestionUp = (index: number) => {
    if (index === 0) return;
    setQuizForm((prev) => {
      const newQuestions = [...prev.questions];
      [newQuestions[index - 1], newQuestions[index]] = [
        newQuestions[index],
        newQuestions[index - 1],
      ];
      return { ...prev, questions: newQuestions };
    });
  };

  const moveQuestionDown = (index: number) => {
    if (index === quizForm.questions.length - 1) return;
    setQuizForm((prev) => {
      const newQuestions = [...prev.questions];
      [newQuestions[index], newQuestions[index + 1]] = [
        newQuestions[index + 1],
        newQuestions[index],
      ];
      return { ...prev, questions: newQuestions };
    });
  };

  // ==================== Open Edit Modal ====================
  const openEditModal = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setQuizForm({
      title: quiz.title,
      description: quiz.description || "",
      topicId: quiz.topicId || "",
      difficulty: quiz.difficulty || "Beginner",
      timeLimitMin: quiz.timeLimitMin || 30,
      passingScore: quiz.passingScore || 70,
      isPublished: quiz.isPublished,
      questions: ((quiz as QuizDetail).questions || []).map(
        (q: QuizQuestion, i: number) => ({
          id: q.id,
          questionText: q.questionText,
          questionType: q.questionType as
            | "multiple_choice"
            | "true_false"
            | "short_answer",
          options: Array.isArray(q.options) ? q.options : ["", "", "", ""],
          correctAnswer: "",
          points: q.points,
          displayOrder: q.displayOrder || i + 1,
        })
      ),
    });
    setIsEditModalOpen(true);
  };

  // ==================== Stats Helpers ====================
  const getTotalPoints = () => {
    return quizForm.questions.reduce((sum, q) => sum + q.points, 0);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
      case "beginner":
        return "bg-green-100 text-green-700 border-green-200";
      case "medium":
      case "intermediate":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "hard":
      case "advanced":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  // ==================== Render ====================
  if (loadingQuizzes) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-muted-foreground">
            {language === "vi" ? "Đang tải..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {language === "vi" ? "Quản lý Quiz" : "Quiz Manager"}
          </h2>
          <p className="text-muted-foreground mt-1">
            {language === "vi"
              ? "Tạo và quản lý các bài kiểm tra"
              : "Create and manage quizzes"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Button
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              setQuizForm(createEmptyQuiz());
              setIsCreateModalOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            {language === "vi" ? "Tạo Quiz mới" : "Create Quiz"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 border-2 shadow-lg" style={{ backgroundColor: "#B9D6F3" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {language === "vi" ? "Tổng Quiz" : "Total Quizzes"}
              </p>
              <p className="text-lg font-semibold">{quizzes?.length || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-2 shadow-lg" style={{ backgroundColor: "#B6DA9F" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {language === "vi" ? "Đã xuất bản" : "Published"}
              </p>
              <p className="text-lg font-semibold">
                {quizzes?.filter((q: Quiz) => q.isPublished).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-2 shadow-lg" style={{ backgroundColor: "#F7D7A9" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {language === "vi" ? "Bản nháp" : "Drafts"}
              </p>
              <p className="text-lg font-semibold">
                {quizzes?.filter((q: Quiz) => !q.isPublished).length || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4 border-2 shadow-lg" style={{ backgroundColor: "#E0B0FF" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <HelpCircle className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">
                {language === "vi" ? "Tổng câu hỏi" : "Total Questions"}
              </p>
              <p className="text-lg font-semibold">
                {quizzes?.reduce(
                  (sum: number, q: any) => sum + (q.questionCount || 0),
                  0
                ) || 0}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 border-2 shadow-xl">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={
                  language === "vi" ? "Tìm kiếm quiz..." : "Search quizzes..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-2 shadow-sm"
              />
            </div>
          </div>
          <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
            <SelectTrigger className="w-[150px] border-2 shadow-xl">
              <SelectValue
                placeholder={language === "vi" ? "Độ khó" : "Difficulty"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === "vi" ? "Tất cả" : "All"}
              </SelectItem>
              <SelectItem value="beginner">
                {language === "vi" ? "Cơ bản" : "Beginner"}
              </SelectItem>
              <SelectItem value="intermediate">
                {language === "vi" ? "Trung bình" : "Intermediate"}
              </SelectItem>
              <SelectItem value="advanced">
                {language === "vi" ? "Nâng cao" : "Advanced"}
              </SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[150px] border-2 shadow-xl">
              <SelectValue
                placeholder={language === "vi" ? "Trạng thái" : "Status"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {language === "vi" ? "Tất cả" : "All"}
              </SelectItem>
              <SelectItem value="published">
                {language === "vi" ? "Đã xuất bản" : "Published"}
              </SelectItem>
              <SelectItem value="draft">
                {language === "vi" ? "Bản nháp" : "Draft"}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Quiz List */}
      <div className="space-y-4">
        {filteredQuizzes.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-16 h-16 mx-auto text-muted-foreground mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">
              {language === "vi" ? "Chưa có quiz nào" : "No quizzes yet"}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === "vi"
                ? "Tạo quiz đầu tiên để bắt đầu"
                : "Create your first quiz to get started"}
            </p>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setQuizForm(createEmptyQuiz());
                setIsCreateModalOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {language === "vi" ? "Tạo Quiz" : "Create Quiz"}
            </Button>
          </Card>
        ) : (
          filteredQuizzes.map((quiz: Quiz) => (
            <Card
              key={quiz.id}
              className="p-4 border-2 shadow-xl hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                {/* Quiz Icon */}
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ListChecks className="w-6 h-6 text-blue-600" />
                </div>

                {/* Quiz Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-lg truncate">
                      {quiz.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={getDifficultyColor(quiz.difficulty || "")}
                    >
                      {quiz.difficulty || "N/A"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={
                        quiz.isPublished
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-yellow-50 text-yellow-700 border-yellow-200"
                      }
                    >
                      {quiz.isPublished
                        ? language === "vi"
                          ? "Đã xuất bản"
                          : "Published"
                        : language === "vi"
                        ? "Bản nháp"
                        : "Draft"}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                    {quiz.description ||
                      (language === "vi" ? "Không có mô tả" : "No description")}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <HelpCircle className="w-3 h-3" />
                      {(quiz as any).questionCount || 0}{" "}
                      {language === "vi" ? "câu hỏi" : "questions"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {quiz.timeLimitMin || 30}{" "}
                      {language === "vi" ? "phút" : "min"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      {quiz.passingScore}%{" "}
                      {language === "vi" ? "để đạt" : "to pass"}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleTogglePublish(quiz)}
                    title={quiz.isPublished ? "Unpublish" : "Publish"}
                  >
                    {quiz.isPublished ? (
                      <ToggleRight className="w-5 h-5 text-green-600" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDuplicateQuiz(quiz)}
                    title={language === "vi" ? "Nhân bản" : "Duplicate"}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(quiz)}
                    title={language === "vi" ? "Chỉnh sửa" : "Edit"}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedQuiz(quiz);
                      setIsDeleteModalOpen(true);
                    }}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    title={language === "vi" ? "Xóa" : "Delete"}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Create/Edit Quiz Modal */}
      <Dialog
        open={isCreateModalOpen || isEditModalOpen}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setIsCreateModalOpen(false);
            setIsEditModalOpen(false);
            setQuizForm(createEmptyQuiz());
            setSelectedQuiz(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {isEditModalOpen
                ? language === "vi"
                  ? "Chỉnh sửa Quiz"
                  : "Edit Quiz"
                : language === "vi"
                ? "Tạo Quiz mới"
                : "Create New Quiz"}
            </DialogTitle>
          </DialogHeader>

          <Tabs
            defaultValue="details"
            className="flex-1 overflow-hidden flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details" style={{ backgroundColor: "#67e576ff" }}>
                <Settings className="w-4 h-4 mr-2" />
                {language === "vi" ? "Chi tiết" : "Details"}
              </TabsTrigger>
              <TabsTrigger value="questions" style={{ backgroundColor: "#ec448aff" }}>
                <HelpCircle className="w-4 h-4 mr-2" />
                {language === "vi" ? "Câu hỏi" : "Questions"} (
                {quizForm.questions.length})
              </TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent
              value="details"
              className="flex-1 overflow-y-auto space-y-4 p-1"
            >
              <div className="space-y-2">
                <Label>{language === "vi" ? "Tiêu đề" : "Title"} *</Label>
                <Input
                  placeholder={
                    language === "vi"
                      ? "VD: Kiểm tra JavaScript cơ bản"
                      : "e.g., Basic JavaScript Quiz"
                  }
                  value={quizForm.title}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, title: e.target.value })
                  }
                  className="border-2 shadow-xl"
                />
              </div>

              <div className="space-y-2">
                <Label>{language === "vi" ? "Mô tả" : "Description"}</Label>
                <Textarea
                  placeholder={
                    language === "vi"
                      ? "Mô tả ngắn về bài quiz..."
                      : "Brief description of the quiz..."
                  }
                  rows={3}
                  value={quizForm.description}
                  onChange={(e) =>
                    setQuizForm({ ...quizForm, description: e.target.value })
                  }
                  className="border-2 shadow-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{language === "vi" ? "Chủ đề" : "Topic"}</Label>
                  <Select
                    value={quizForm.topicId}
                    onValueChange={(value: string) =>
                      setQuizForm({ ...quizForm, topicId: value })
                    }
                  >
                    <SelectTrigger className="border-2 shadow-xl">
                      <SelectValue
                        placeholder={
                          language === "vi" ? "Chọn chủ đề" : "Select topic"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {(topics || []).map((topic: any) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{language === "vi" ? "Độ khó" : "Difficulty"}</Label>
                  <Select
                    value={quizForm.difficulty}
                    onValueChange={(value: string) =>
                      setQuizForm({ ...quizForm, difficulty: value })
                    }
                  >
                    <SelectTrigger className="border-2 shadow-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">
                        {language === "vi" ? "Cơ bản" : "Beginner"}
                      </SelectItem>
                      <SelectItem value="Intermediate">
                        {language === "vi" ? "Trung bình" : "Intermediate"}
                      </SelectItem>
                      <SelectItem value="Advanced">
                        {language === "vi" ? "Nâng cao" : "Advanced"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    {language === "vi"
                      ? "Thời gian (phút)"
                      : "Time Limit (min)"}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    value={quizForm.timeLimitMin}
                    onChange={(e) =>
                      setQuizForm({
                        ...quizForm,
                        timeLimitMin: parseInt(e.target.value) || 30,
                      })
                    }
                    className="border-2 shadow-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label>
                    {language === "vi" ? "Điểm đạt (%)" : "Passing Score (%)"}
                  </Label>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={quizForm.passingScore}
                    onChange={(e) =>
                      setQuizForm({
                        ...quizForm,
                        passingScore: parseInt(e.target.value) || 70,
                      })
                    }
                    className="border-2 shadow-xl"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium">
                      {language === "vi" ? "Xuất bản" : "Publish"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "vi"
                        ? "Quiz sẽ hiển thị với học viên"
                        : "Quiz will be visible to students"}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={quizForm.isPublished}
                  onCheckedChange={(checked: boolean) =>
                    setQuizForm({ ...quizForm, isPublished: checked })
                  }
                />
              </div>
            </TabsContent>

            {/* Questions Tab */}
            <TabsContent
              value="questions"
              className="flex-1 overflow-y-auto space-y-4 p-1"
            >
              {/* Stats */}
              <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
                <Badge variant="outline" className="bg-white">
                  {quizForm.questions.length}{" "}
                  {language === "vi" ? "câu hỏi" : "questions"}
                </Badge>
                <Badge variant="outline" className="bg-white">
                  {getTotalPoints()}{" "}
                  {language === "vi" ? "tổng điểm" : "total points"}
                </Badge>
              </div>

              {/* Questions List */}
              {quizForm.questions.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed rounded-lg">
                  <HelpCircle className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground mb-4">
                    {language === "vi"
                      ? "Chưa có câu hỏi nào"
                      : "No questions yet"}
                  </p>
                  <Button onClick={addQuestion}>
                    <Plus className="w-4 h-4 mr-2" />
                    {language === "vi" ? "Thêm câu hỏi" : "Add Question"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {quizForm.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="flex items-start gap-3 p-3 bg-white border rounded-lg hover:border-blue-300 transition-colors"
                    >
                      <div className="flex flex-col gap-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => moveQuestionUp(index)}
                          disabled={index === 0}
                        >
                          <ChevronUp className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => moveQuestionDown(index)}
                          disabled={index === quizForm.questions.length - 1}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-medium text-blue-700">
                          {index + 1}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {question.questionText ||
                            (language === "vi"
                              ? "Câu hỏi chưa có nội dung"
                              : "Untitled question")}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {question.questionType === "multiple_choice"
                              ? language === "vi"
                                ? "Trắc nghiệm"
                                : "Multiple Choice"
                              : question.questionType === "true_false"
                              ? language === "vi"
                                ? "Đúng/Sai"
                                : "True/False"
                              : language === "vi"
                              ? "Tự luận"
                              : "Short Answer"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {question.points}{" "}
                            {language === "vi" ? "điểm" : "pts"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => editQuestion(question)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteQuestion(question.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={addQuestion}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {language === "vi" ? "Thêm câu hỏi" : "Add Question"}
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setQuizForm(createEmptyQuiz());
                setSelectedQuiz(null);
              }}
            >
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={isEditModalOpen ? handleUpdateQuiz : handleCreateQuiz}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isEditModalOpen
                ? language === "vi"
                  ? "Lưu thay đổi"
                  : "Save Changes"
                : language === "vi"
                ? "Tạo Quiz"
                : "Create Quiz"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Question Edit Modal */}
      <Dialog open={isQuestionModalOpen} onOpenChange={setIsQuestionModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingQuestion &&
              quizForm.questions.some((q) => q.id === editingQuestion.id)
                ? language === "vi"
                  ? "Chỉnh sửa câu hỏi"
                  : "Edit Question"
                : language === "vi"
                ? "Thêm câu hỏi"
                : "Add Question"}
            </DialogTitle>
          </DialogHeader>

          {editingQuestion && (
            <div className="space-y-4 py-4">
              {/* Question Text */}
              <div className="space-y-2">
                <Label>{language === "vi" ? "Câu hỏi" : "Question"} *</Label>
                <Textarea
                  placeholder={
                    language === "vi"
                      ? "Nhập nội dung câu hỏi..."
                      : "Enter question text..."
                  }
                  rows={3}
                  value={editingQuestion.questionText}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      questionText: e.target.value,
                    })
                  }
                />
              </div>

              {/* Question Type */}
              <div className="space-y-2">
                <Label>
                  {language === "vi" ? "Loại câu hỏi" : "Question Type"}
                </Label>
                <Select
                  value={editingQuestion.questionType}
                  onValueChange={(
                    value: "multiple_choice" | "true_false" | "short_answer"
                  ) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      questionType: value,
                      options:
                        value === "true_false"
                          ? ["True", "False"]
                          : value === "multiple_choice"
                          ? ["", "", "", ""]
                          : [],
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="multiple_choice">
                      {language === "vi" ? "Trắc nghiệm" : "Multiple Choice"}
                    </SelectItem>
                    <SelectItem value="true_false">
                      {language === "vi" ? "Đúng/Sai" : "True/False"}
                    </SelectItem>
                    <SelectItem value="short_answer">
                      {language === "vi" ? "Tự luận ngắn" : "Short Answer"}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Options for Multiple Choice */}
              {editingQuestion.questionType === "multiple_choice" && (
                <div className="space-y-2">
                  <Label>
                    {language === "vi" ? "Các lựa chọn" : "Options"}
                  </Label>
                  <div className="space-y-2">
                    {editingQuestion.options.map((option, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Input
                          placeholder={`${
                            language === "vi" ? "Lựa chọn" : "Option"
                          } ${String.fromCharCode(65 + index)}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...editingQuestion.options];
                            newOptions[index] = e.target.value;
                            setEditingQuestion({
                              ...editingQuestion,
                              options: newOptions,
                            });
                          }}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newOptions = editingQuestion.options.filter(
                              (_, i) => i !== index
                            );
                            setEditingQuestion({
                              ...editingQuestion,
                              options: newOptions,
                            });
                          }}
                          disabled={editingQuestion.options.length <= 2}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    {editingQuestion.options.length < 6 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditingQuestion({
                            ...editingQuestion,
                            options: [...editingQuestion.options, ""],
                          })
                        }
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        {language === "vi" ? "Thêm lựa chọn" : "Add Option"}
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Correct Answer */}
              <div className="space-y-2">
                <Label>
                  {language === "vi" ? "Đáp án đúng" : "Correct Answer"}
                </Label>
                {editingQuestion.questionType === "multiple_choice" ? (
                  <Select
                    value={editingQuestion.correctAnswer}
                    onValueChange={(value: string) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correctAnswer: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          language === "vi"
                            ? "Chọn đáp án đúng"
                            : "Select correct answer"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {editingQuestion.options
                        .filter((o) => o.trim())
                        .map((option, index) => (
                          <SelectItem key={index} value={option}>
                            {String.fromCharCode(65 + index)}. {option}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                ) : editingQuestion.questionType === "true_false" ? (
                  <Select
                    value={editingQuestion.correctAnswer}
                    onValueChange={(value: string) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correctAnswer: value,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          language === "vi" ? "Chọn đáp án" : "Select answer"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="True">
                        {language === "vi" ? "Đúng" : "True"}
                      </SelectItem>
                      <SelectItem value="False">
                        {language === "vi" ? "Sai" : "False"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    placeholder={
                      language === "vi"
                        ? "Nhập đáp án đúng..."
                        : "Enter correct answer..."
                    }
                    value={editingQuestion.correctAnswer}
                    onChange={(e) =>
                      setEditingQuestion({
                        ...editingQuestion,
                        correctAnswer: e.target.value,
                      })
                    }
                  />
                )}
              </div>

              {/* Points */}
              <div className="space-y-2">
                <Label>{language === "vi" ? "Điểm" : "Points"}</Label>
                <Input
                  type="number"
                  min={1}
                  value={editingQuestion.points}
                  onChange={(e) =>
                    setEditingQuestion({
                      ...editingQuestion,
                      points: parseInt(e.target.value) || 10,
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsQuestionModalOpen(false);
                setEditingQuestion(null);
              }}
            >
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={saveQuestion}
            >
              {language === "vi" ? "Lưu câu hỏi" : "Save Question"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              {language === "vi" ? "Xác nhận xóa" : "Confirm Delete"}
            </DialogTitle>
            <DialogDescription>
              {language === "vi"
                ? `Bạn có chắc muốn xóa quiz "${selectedQuiz?.title}"? Hành động này không thể hoàn tác.`
                : `Are you sure you want to delete "${selectedQuiz?.title}"? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              {language === "vi" ? "Hủy" : "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteQuiz}
              disabled={saving}
            >
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {language === "vi" ? "Xóa" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
