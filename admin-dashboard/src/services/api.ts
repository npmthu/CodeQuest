import { supabase } from "../lib/supabaseClient";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:3000/api";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}

async function getAuthHeaders(): Promise<Record<string, string>> {
  // Try localStorage first (set by our custom signIn)
  let token = localStorage.getItem("sb-access-token");

  // Fallback to Supabase SDK session
  if (!token) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    token = session?.access_token || null;
  }

  if (!token) {
    throw new Error("Not authenticated");
  }

  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || data.message || "Request failed",
      };
    }

    return {
      success: true,
      data: data.data,
      message: data.message,
      pagination: data.pagination,
    };
  } catch (error: any) {
    console.error("API request error:", error);
    return {
      success: false,
      error: error.message || "Network error",
    };
  }
}

// Admin Subscription API
export const adminApi = {
  // Get all subscription plans including inactive (admin only)
  getPlans: () => apiRequest<any[]>("/admin/plans"),

  // Create a new subscription plan (TC-09-01)
  createPlan: (planData: {
    name: string;
    slug: string;
    description?: string;
    price_monthly: number;
    price_yearly?: number;
    features: Record<string, any>;
    is_active?: boolean;
    user_limit?: number;
  }) =>
    apiRequest<any>("/admin/plans", {
      method: "POST",
      body: JSON.stringify(planData),
    }),

  // Update a subscription plan
  updatePlan: (planId: string, updateData: any) =>
    apiRequest<any>(`/admin/plans/${planId}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    }),

  // Delete a subscription plan
  deletePlan: (planId: string) =>
    apiRequest<any>(`/admin/plans/${planId}`, {
      method: "DELETE",
    }),

  // Get user subscription
  getUserSubscription: (userId: string) =>
    apiRequest<any>(`/admin/users/${userId}/subscription`),

  // Cancel user subscription (TC-09-02)
  cancelUserSubscription: (userId: string, reason?: string) =>
    apiRequest<any>(`/admin/users/${userId}/cancel-subscription`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  // Extend user subscription
  extendUserSubscription: (userId: string, days: number) =>
    apiRequest<any>(`/admin/users/${userId}/extend-subscription`, {
      method: "POST",
      body: JSON.stringify({ days }),
    }),

  // Get all users
  getUsers: (page = 1, limit = 20, search?: string) =>
    apiRequest<any>(
      `/admin/users?page=${page}&limit=${limit}${
        search ? `&search=${search}` : ""
      }`
    ),

  // Get all subscriptions
  getAllSubscriptions: (status?: string) =>
    apiRequest<any>(`/admin/subscriptions${status ? `?status=${status}` : ""}`),

  // Dashboard Stats
  getStats: () => apiRequest<any>("/admin/stats"),
  getDashboardStats: () => apiRequest<any>("/admin/dashboard/stats"),

  // Courses (Admin endpoints)
  getCourses: (page = 1, limit = 100) =>
    apiRequest<any>(`/admin/courses?page=${page}&limit=${limit}`),

  createCourse: (data: any) =>
    apiRequest<any>("/admin/courses", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateCourse: (courseId: string, data: any) =>
    apiRequest<any>(`/admin/courses/${courseId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteCourse: (courseId: string) =>
    apiRequest<any>(`/admin/courses/${courseId}`, { method: "DELETE" }),

  // Forum Posts (Content Moderation)
  getForumPosts: (status?: string) =>
    apiRequest<any>(`/admin/forum/posts${status ? `?status=${status}` : ""}`),

  getPostReplies: (postId: string) =>
    apiRequest<any>(`/admin/forum/posts/${postId}/replies`),

  deletePost: (postId: string) =>
    apiRequest<any>(`/admin/forum/posts/${postId}`, { method: "DELETE" }),

  deleteComment: (commentId: string) =>
    apiRequest<any>(`/admin/forum/comments/${commentId}`, { method: "DELETE" }),

  // User management
  updateUserRole: (userId: string, role: string) =>
    apiRequest<any>(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),

  banUser: (userId: string, reason?: string) =>
    apiRequest<any>(`/admin/users/${userId}/ban`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  unbanUser: (userId: string) =>
    apiRequest<any>(`/admin/users/${userId}/unban`, { method: "POST" }),

  // Notifications
  getNotifications: () => apiRequest<any>("/admin/notifications"),

  sendNotification: (data: {
    title: string;
    message: string;
    target_plan_id: string | null;
    scheduled_for: string | null;
  }) =>
    apiRequest<any>("/admin/notifications", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  saveDraftNotification: (data: {
    title: string;
    message: string;
    target_plan_id: string | null;
    scheduled_for: string | null;
  }) =>
    apiRequest<any>("/admin/notifications/draft", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Payment Proofs (Subscriptions)
  getPaymentProofs: (status?: string) =>
    apiRequest<any>(
      `/admin/payment-proofs${status ? `?status=${status}` : ""}`
    ),

  approvePaymentProof: (proofId: string) =>
    apiRequest<any>(`/admin/payment-proofs/${proofId}/approve`, {
      method: "POST",
    }),

  rejectPaymentProof: (proofId: string, reason: string) =>
    apiRequest<any>(`/admin/payment-proofs/${proofId}/reject`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),

  // Interview Bookings Payment Verification
  getInterviewBookings: (status?: string) =>
    apiRequest<any>(
      `/admin/interview-bookings${status ? `?payment_status=${status}` : ""}`
    ),

  approveInterviewPayment: (bookingId: string) =>
    apiRequest<any>(`/admin/interview-bookings/${bookingId}/approve-payment`, {
      method: "POST",
    }),

  rejectInterviewPayment: (bookingId: string, reason: string) =>
    apiRequest<any>(`/admin/interview-bookings/${bookingId}/reject-payment`, {
      method: "POST",
      body: JSON.stringify({ reason }),
    }),
};

export default adminApi;
