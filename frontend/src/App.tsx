import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { ApiProvider } from "./api/ApiProvider";
import { Toaster } from "sonner";
import LoginPage from "./components/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import HomePage from "./components/HomePage";
import CoursesPage from "./components/CoursesPage";
import CourseEnrollPage from "./components/CourseEnrollPage";
import CourseDetailPage from "./components/CourseDetailPage";
import TopicsPage from "./components/TopicsPage";
import LessonPage from "./components/LessonPage";
import LessonDetailPage from "./components/LessonDetailPage";
import CertificatePage from "./components/CertificatePage";
import CodeEditor from "./components/CodeEditor";
import ForumPage from "./components/ForumPage";
import NotebookPage from "./components/NotebookPage";
import InterviewPage from "./components/InterviewPage";
import ProfilePage from "./components/ProfilePage";
import SettingsPage from "./components/SettingsPage";
import PricingPage from "./components/PricingPage";
import InstructorDashboard from "./components/InstructorDashboard";
import InstructorCourseManager from "./components/InstructorCourseManager";
import InstructorQuizManager from "./components/InstructorQuizManager";
import InstructorAnalytics from "./components/InstructorAnalytics";
import InstructorCreateCourse from "./components/InstructorCreateCourse";
import InstructorProblemsPage from "./components/InstructorProblemsPage";
import InstructorProblemDetail from "./components/InstructorProblemDetail";
import BusinessDashboard from "./components/BusinessDashboard";
import BusinessAccountManagement from "./components/BusinessAccountManagement";
import BusinessInstructorManagement from "./components/BusinessInstructorManagement";
import BusinessLearnerPerformance from "./components/BusinessLearnerPerformance";
import BusinessAnalytics from "./components/BusinessAnalytics";
import BusinessCourseManagement from "./components/BusinessCourseManagement";
import BusinessSettings from "./components/BusinessSettings";
import QuizzesPage from "./components/QuizzesPage";
import QuizDetailPage from "./components/QuizDetailPage";
import QuizResultPage from "./components/QuizResultPage";
import InterviewRoom from "./components/InterviewRoom";
import InstructorInterviews from "./components/InstructorInterviews";
import StudentInterviews from "./components/StudentInterviews";
import CreateSession from "./components/CreateSession";
import InterviewLobbyPage from "./components/InterviewLobbyPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SubscriptionProvider } from "./contexts/SubscriptionContext";
import { LanguageProvider } from "./contexts/LanguageContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected route wrapper
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}

// Layout wrapper for pages that use DashboardLayout
function DashboardRoute({ children }: { children: React.ReactNode }) {
  const { profile } = useAuth();

  // Map role from database to UI role type
  const getUserRole = (): "student" | "instructor" | "business" => {
    const dbRole = profile?.role;
    if (dbRole === "instructor") return "instructor";
    if (dbRole === "business_partner") return "business";
    return "student";
  };

  return (
    <ProtectedRoute>
      <DashboardLayout userRole={getUserRole()}>{children}</DashboardLayout>
    </ProtectedRoute>
  );
}

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      {/* Protected routes with dashboard layout */}
      <Route
        path="/dashboard"
        element={
          <DashboardRoute>
            <Dashboard />
          </DashboardRoute>
        }
      />
      <Route
        path="/courses"
        element={
          <DashboardRoute>
            <CoursesPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/courses/:courseId"
        element={
          <DashboardRoute>
            <CourseDetailPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/courses/:courseId/enroll"
        element={
          <DashboardRoute>
            <CourseEnrollPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/courses/:courseId/topics"
        element={
          <DashboardRoute>
            <TopicsPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/topics"
        element={
          <DashboardRoute>
            <TopicsPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/quizzes"
        element={
          <DashboardRoute>
            <QuizzesPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/forum"
        element={
          <DashboardRoute>
            <ForumPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/notebook"
        element={
          <DashboardRoute>
            <NotebookPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/notebook/:noteId"
        element={
          <DashboardRoute>
            <NotebookPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <DashboardRoute>
            <StudentInterviews />
          </DashboardRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <DashboardRoute>
            <ProfilePage />
          </DashboardRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <DashboardRoute>
            <SettingsPage />
          </DashboardRoute>
        }
      />

      {/* Instructor routes */}
      <Route
        path="/instructor/dashboard"
        element={
          <DashboardRoute>
            <InstructorDashboard />
          </DashboardRoute>
        }
      />
      <Route
        path="/instructor/courses"
        element={
          <DashboardRoute>
            <InstructorCourseManager />
          </DashboardRoute>
        }
      />
      <Route
        path="/instructor/quizzes"
        element={
          <DashboardRoute>
            <InstructorQuizManager />
          </DashboardRoute>
        }
      />
      <Route
        path="/instructor/interviews"
        element={
          <DashboardRoute>
            <InstructorInterviews />
          </DashboardRoute>
        }
      />
      <Route
        path="/instructor/create-session"
        element={
          <DashboardRoute>
            <CreateSession />
          </DashboardRoute>
        }
      />
      <Route
        path="/instructor/analytics"
        element={
          <DashboardRoute>
            <InstructorAnalytics />
          </DashboardRoute>
        }
      />
      <Route
        path="/instructor/problems"
        element={
          <DashboardRoute>
            <InstructorProblemsPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/instructor/problems/:problemId"
        element={
          <DashboardRoute>
            <InstructorProblemDetail />
          </DashboardRoute>
        }
      />

      {/* Business routes */}
      <Route
        path="/business/dashboard"
        element={
          <DashboardRoute>
            <BusinessDashboard />
          </DashboardRoute>
        }
      />
      <Route
        path="/business/account"
        element={
          <DashboardRoute>
            <BusinessAccountManagement />
          </DashboardRoute>
        }
      />
      <Route
        path="/business/instructors"
        element={
          <DashboardRoute>
            <BusinessInstructorManagement />
          </DashboardRoute>
        }
      />
      <Route
        path="/business/performance"
        element={
          <DashboardRoute>
            <BusinessLearnerPerformance />
          </DashboardRoute>
        }
      />
      <Route
        path="/business/analytics"
        element={
          <DashboardRoute>
            <BusinessAnalytics />
          </DashboardRoute>
        }
      />
      <Route
        path="/business/courses"
        element={
          <DashboardRoute>
            <BusinessCourseManagement />
          </DashboardRoute>
        }
      />
      <Route
        path="/business/settings"
        element={
          <DashboardRoute>
            <BusinessSettings />
          </DashboardRoute>
        }
      />

      {/* Protected routes without dashboard layout */}
      <Route
        path="/editor"
        element={
          <ProtectedRoute>
            <CodeEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/editor/:problemId"
        element={
          <ProtectedRoute>
            <CodeEditor />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes/:id"
        element={
          <ProtectedRoute>
            <QuizDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quizzes/:id/result/:resultId"
        element={
          <ProtectedRoute>
            <QuizResultPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pricing"
        element={
          <ProtectedRoute>
            <PricingPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/lessons/:lessonId"
        element={
          <DashboardRoute>
            <LessonDetailPage />
          </DashboardRoute>
        }
      />
      <Route
        path="/certificate/:certificateId"
        element={
          <ProtectedRoute>
            <CertificatePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/topics/:topicId/lessons"
        element={
          <ProtectedRoute>
            <LessonPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/instructor/courses/create"
        element={
          <ProtectedRoute>
            <InstructorCreateCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/forum/:postId"
        element={
          <ProtectedRoute>
            <ForumPage />
          </ProtectedRoute>
        }
      />

      {/* Interview Lobby (Waiting Room) */}
      <Route
        path="/interview/lobby/:sessionId"
        element={
          <ProtectedRoute>
            <InterviewLobbyPage />
          </ProtectedRoute>
        }
      />

      {/* Interview Room Route */}
      <Route
        path="/interview/room/:sessionId"
        element={
          <ProtectedRoute>
            <InterviewRoom />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ApiProvider>
          <AuthProvider>
            <SubscriptionProvider>
              <LanguageProvider>
                <AppContent />
                <Toaster position="top-right" richColors />
              </LanguageProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ApiProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}
