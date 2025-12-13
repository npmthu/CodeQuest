import { useState } from "react";
import AdminLoginPage from "./components/admin/AdminLoginPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import CourseManagement from "./components/admin/CourseManagement";
import ContentModeration from "./components/admin/ContentModeration";
import NotificationManagement from "./components/admin/NotificationManagement";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState("admin-dashboard");

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage("admin-dashboard");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage("admin-dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  // Login page
  if (!isLoggedIn) {
    return <AdminLoginPage onLogin={handleLogin} />;
  }

  // Admin Dashboard
  const renderAdminPage = () => {
    switch (currentPage) {
      case "admin-dashboard":
        return <AdminDashboard />;
      case "admin-users":
        return <UserManagement />;
      case "admin-courses":
        return <CourseManagement />;
      case "admin-moderation":
        return <ContentModeration />;
      case "admin-notifications":
        return <NotificationManagement />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <AdminLayout
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderAdminPage()}
    </AdminLayout>
  );
}