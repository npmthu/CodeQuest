import { useState } from "react";
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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [userRole, setUserRole] = useState<"student" | "instructor" | "business">("student");

  const handleLogin = (role: "student" | "instructor" | "business") => {
    setIsLoggedIn(true);
    setUserRole(role);
    setCurrentPage(
      role === "student" ? "dashboard" : 
      role === "instructor" ? "instructor-dashboard" : 
      "business-dashboard"
    );
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage("dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  const toggleRole = () => {
    setUserRole(prev => prev === "student" ? "instructor" : "student");
    setCurrentPage(userRole === "student" ? "instructor-dashboard" : "dashboard");
  };

  // Login page
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLogin={handleLogin}
        onSwitchToRegister={() => {}}
      />
    );
  }

  // Pages that don't use the dashboard layout
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
  const renderPage = () => {
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
    <DashboardLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      userRole={userRole}
      onRoleToggle={toggleRole}
    >
      {renderPage()}
    </DashboardLayout>
  );
}