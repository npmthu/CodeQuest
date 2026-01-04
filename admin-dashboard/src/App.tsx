import { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import AdminLoginPage from "./components/admin/AdminLoginPage";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import UserManagement from "./components/admin/UserManagement";
import CourseManagement from "./components/admin/CourseManagement";
import ContentModeration from "./components/admin/ContentModeration";
import NotificationManagement from "./components/admin/NotificationManagement";
import SubscriptionManagement from "./components/admin/SubscriptionManagement";
import { Toaster } from "./components/ui/sonner";
import { Loader2 } from "lucide-react";

function AppContent() {
  const { user, loading, isAdmin, signIn, signOut } = useAuth();
  const [currentPage, setCurrentPage] = useState("admin-dashboard");

  const handleLogin = async (email: string, password: string) => {
    const { error } = await signIn(email, password);
    if (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentPage("admin-dashboard");
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Login page
  if (!user || !isAdmin) {
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
      case "admin-subscriptions":
        return <SubscriptionManagement />;
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

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}