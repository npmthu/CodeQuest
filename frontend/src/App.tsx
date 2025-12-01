import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import LoginPage from "./components/LoginPage";
import DashboardLayout from "./components/DashboardLayout";
import Dashboard from "./components/Dashboard";
import HomePage from "./components/HomePage";
import LessonPage from "./components/LessonPage";
import CodeEditor from "./components/CodeEditor";
import ForumPage from "./components/ForumPage";
import NotebookPage from "./components/NotebookPage";
import InterviewPage from "./components/InterviewPage";
import ProfilePage from "./components/ProfilePage";
import SettingsPage from "./components/SettingsPage";
import PricingPage from "./components/PricingPage";
import InstructorDashboard from "./components/InstructorDashboard";
import InstructorCourseManager from "./components/InstructorCourseManager";
import InstructorAnalytics from "./components/InstructorAnalytics";
import InstructorCreateCourse from "./components/InstructorCreateCourse";
import BusinessDashboard from "./components/BusinessDashboard";
import BusinessAccountManagement from "./components/BusinessAccountManagement";
import BusinessInstructorManagement from "./components/BusinessInstructorManagement";
import BusinessLearnerPerformance from "./components/BusinessLearnerPerformance";
import BusinessAnalytics from "./components/BusinessAnalytics";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

function AppContent() {
  const { user, profile, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState("dashboard");
  
  // Map role from database to UI role type
  const getUserRole = (): "student" | "instructor" | "business" => {
    const dbRole = profile?.role;
    if (dbRole === 'instructor') return 'instructor';
    if (dbRole === 'business_partner') return 'business';
    return 'student'; // Default for 'learner' or any other role
  };

  const userRole = getUserRole();

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

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

  const renderPage = () => {
    // Pages that don't use the dashboard layout
    if (!user) {
      return <LoginPage />;
    }

    if (currentPage === "editor") {
      return <CodeEditor onNavigate={handleNavigate} />;
    }

    if (currentPage === "pricing") {
      return <PricingPage onNavigate={handleNavigate} />;
    }

    if (currentPage === "lesson") {
      return <LessonPage onNavigate={handleNavigate} />;
    }

    if (currentPage === "instructor-create-course") {
      return <InstructorCreateCourse onNavigate={handleNavigate} />;
    }

    // Pages with dashboard layout
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />;
      case "home":
        return <HomePage onNavigate={handleNavigate} />;
      case "forum":
        return <ForumPage />;
      case "notebook":
        return <NotebookPage />;
      case "interview":
        return <InterviewPage onNavigate={handleNavigate} />;
      case "profile":
        return <ProfilePage />;
      case "settings":
        return <SettingsPage />;
      case "instructor-dashboard":
        return <InstructorDashboard onNavigate={handleNavigate} />;
      case "instructor-courses":
        return <InstructorCourseManager onNavigate={handleNavigate} />;
      case "instructor-analytics":
        return <InstructorAnalytics onNavigate={handleNavigate} />;
      case "business-dashboard":
        return <BusinessDashboard onNavigate={handleNavigate} />;
      case "business-account":
        return <BusinessAccountManagement onNavigate={handleNavigate} />;
      case "business-instructors":
        return <BusinessInstructorManagement onNavigate={handleNavigate} />;
      case "business-performance":
        return <BusinessLearnerPerformance onNavigate={handleNavigate} />;
      case "business-analytics":
        return <BusinessAnalytics onNavigate={handleNavigate} />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <>
      {user && currentPage !== "editor" ? (
        <DashboardLayout
          currentPage={currentPage}
          onNavigate={handleNavigate}
          userRole={userRole}
        >
          {renderPage()}
        </DashboardLayout>
      ) : (
        <>{renderPage()}</>
      )}
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
}