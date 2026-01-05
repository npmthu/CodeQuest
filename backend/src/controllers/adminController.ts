// Admin controller - system stats, content approval, user management
import { Request, Response } from "express";
import { subscriptionService } from "../services/subscriptionService";
import { AuthRequest } from "../middleware/auth";
import { supabaseAdmin } from "../config/database";

export class AdminController {
  /**
   * GET /api/admin/plans
   * Get all subscription plans (including inactive) for admin
   */
  async getPlans(req: AuthRequest, res: Response) {
    try {
      const plans = await subscriptionService.getAllPlans();
      res.json({
        success: true,
        data: plans,
      });
    } catch (error: any) {
      console.error("❌ Error fetching plans:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch plans",
      });
    }
  }

  /**
   * GET /api/admin/subscriptions
   * Get all subscriptions with user details for admin dashboard
   * Supports filtering by status: active, inactive, canceled, all
   */
  async getAllSubscriptions(req: AuthRequest, res: Response) {
    try {
      const { status, page = 1, limit = 50 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = supabaseAdmin
        .from("subscriptions")
        .select(
          `
          *,
          plan:subscription_plans(id, name, slug, price_monthly),
          user:users(id, email, display_name)
        `,
          { count: "exact" }
        )
        .order("created_at", { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      // Filter by status
      if (status && status !== "all") {
        if (status === "canceled") {
          query = query.eq("cancel_at_period_end", true);
        } else if (status === "inactive") {
          // Explicitly filter for inactive subscriptions
          query = query.eq("status", "inactive");
        } else if (status === "active") {
          // Filter for active subscriptions
          query = query.eq("status", "active");
        } else {
          // For any other status value
          query = query.eq("status", status);
        }
      }

      const { data, error, count } = await query;

      if (error) throw error;

      // Transform data for frontend
      const subscriptions = (data || []).map((sub: any) => ({
        id: sub.id,
        user_id: sub.user_id,
        user_email: sub.user?.email,
        user_name: sub.user?.display_name,
        plan_id: sub.plan_id,
        plan_name: sub.plan?.name,
        status: sub.status,
        current_period_end: sub.current_period_end,
        cancel_at_period_end: sub.cancel_at_period_end,
        created_at: sub.created_at,
      }));

      res.json({
        success: true,
        data: subscriptions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count,
        },
      });
    } catch (error: any) {
      console.error("❌ Error fetching subscriptions:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch subscriptions",
      });
    }
  }

  /**
   * GET /api/admin/users
   * Get all users with pagination and search
   */
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 20, search } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      let query = supabaseAdmin
        .from("users")
        .select(
          "id, email, display_name, role, created_at, last_login_at, is_active",
          {
            count: "exact",
          }
        )
        .neq("role", "admin")
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(
          `email.ilike.%${search}%,display_name.ilike.%${search}%`
        );
      }

      // Apply range LAST to get correct count
      query = query.range(offset, offset + Number(limit) - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      console.log("📊 Users query result:", {
        page,
        limit,
        offset,
        dataCount: data?.length,
        totalCount: count,
      });

      res.json({
        success: true,
        data: data || [],
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
        },
      });
    } catch (error: any) {
      console.error("❌ Error fetching users:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch users",
      });
    }
  }

  /**
   * POST /api/admin/plans
   * Create a new subscription plan - Fixes TC_ADMIN_SUB_01
   */
  async createPlan(req: AuthRequest, res: Response) {
    try {
      const planData = req.body;

      // Validate required fields
      if (!planData.name || !planData.slug) {
        return res.status(400).json({
          success: false,
          error: "Plan name and slug are required",
        });
      }

      // Validate price is not negative - Fixes TC_ADMIN_SUB_03
      if (planData.price_monthly < 0 || planData.price_yearly < 0) {
        return res.status(400).json({
          success: false,
          error: "Price cannot be negative",
        });
      }

      // Validate features JSON
      if (!planData.features || typeof planData.features !== "object") {
        return res.status(400).json({
          success: false,
          error: "Features must be a valid JSON object",
        });
      }

      const plan = await subscriptionService.createPlan(planData);

      console.log("📋 Admin created subscription plan:", {
        planId: plan.id,
        name: plan.name,
        slug: plan.slug,
      });

      res.status(201).json({
        success: true,
        data: plan,
        message: "Subscription plan created successfully",
      });
    } catch (error: any) {
      console.error("❌ Error creating subscription plan:", error);

      if (
        error.message.includes("duplicate key") ||
        error.message.includes("already exists")
      ) {
        return res.status(409).json({
          success: false,
          error: "Plan with this slug already exists",
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || "Failed to create subscription plan",
      });
    }
  }

  /**
   * DELETE /api/admin/plans/:id
   * Delete a subscription plan
   */
  async deletePlan(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Plan ID is required",
        });
      }

      // Check if plan exists
      const { data: plan, error: fetchError } = await supabaseAdmin
        .from("subscription_plans")
        .select("id, name")
        .eq("id", id)
        .single();

      if (fetchError || !plan) {
        return res.status(404).json({
          success: false,
          error: "Subscription plan not found",
        });
      }

      // Check if any active subscriptions are using this plan
      const { data: activeSubscriptions, error: subsError } =
        await supabaseAdmin
          .from("subscriptions")
          .select("id")
          .eq("plan_id", id)
          .eq("status", "active")
          .limit(1);

      if (subsError) {
        throw new Error(`Failed to check subscriptions: ${subsError.message}`);
      }

      if (activeSubscriptions && activeSubscriptions.length > 0) {
        return res.status(400).json({
          success: false,
          error:
            "Cannot delete plan with active subscriptions. Please deactivate the plan instead.",
        });
      }

      // Delete the plan
      const { error: deleteError } = await supabaseAdmin
        .from("subscription_plans")
        .delete()
        .eq("id", id);

      if (deleteError) {
        throw new Error(`Failed to delete plan: ${deleteError.message}`);
      }

      console.log("🗑️ Admin deleted subscription plan:", {
        planId: id,
        planName: plan.name,
        adminId: req.user?.id,
      });

      res.json({
        success: true,
        message: "Subscription plan deleted successfully",
      });
    } catch (error: any) {
      console.error("❌ Error deleting subscription plan:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to delete subscription plan",
      });
    }
  }

  /**
   * POST /api/admin/users/:userId/cancel-subscription
   * Cancel a user's subscription - Fixes TC_ADMIN_SUB_02 and TC_ADMIN_SUB_05
   */
  async cancelUserSubscription(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const result = await subscriptionService.adminCancelSubscription(userId);

      console.log("🚫 Admin cancelled user subscription:", {
        userId: userId,
        adminId: req.user?.id,
        reason: result.message,
      });

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error("❌ Error cancelling user subscription:", error);

      if (error.message.includes("No active subscription")) {
        return res.status(404).json({
          success: false,
          error: "No active subscription found for this user",
        });
      }

      if (error.message.includes("already expired")) {
        return res.status(400).json({
          success: false,
          error: "Subscription is already expired",
        });
      }

      res.status(500).json({
        success: false,
        error: error.message || "Failed to cancel subscription",
      });
    }
  }

  /**
   * PUT /api/admin/plans/:id
   * Update an existing subscription plan
   */
  async updatePlan(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: "Plan ID is required",
        });
      }

      // Validate price is not negative
      if (updateData.price_monthly < 0 || updateData.price_yearly < 0) {
        return res.status(400).json({
          success: false,
          error: "Price cannot be negative",
        });
      }

      const plan = await subscriptionService.updatePlan(id, updateData);

      console.log("📝 Admin updated subscription plan:", {
        planId: id,
        updatedBy: req.user?.id,
      });

      res.json({
        success: true,
        data: plan,
        message: "Subscription plan updated successfully",
      });
    } catch (error: any) {
      console.error("❌ Error updating subscription plan:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update subscription plan",
      });
    }
  }

  /**
   * GET /api/admin/users/:userId/subscription
   * Get a user's subscription details
   */
  async getUserSubscription(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      const subscription = await subscriptionService.getUserSubscription(
        userId
      );

      res.json({
        success: true,
        data: subscription,
      });
    } catch (error: any) {
      console.error("❌ Error fetching user subscription:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch user subscription",
      });
    }
  }

  /**
   * POST /api/admin/users/:userId/extend-subscription
   * Extend a user's subscription period
   */
  async extendUserSubscription(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { days } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: "User ID is required",
        });
      }

      if (!days || days <= 0) {
        return res.status(400).json({
          success: false,
          error: "Valid extension period (days) is required",
        });
      }

      const result = await subscriptionService.extendSubscription(userId, days);

      console.log("📅 Admin extended user subscription:", {
        userId: userId,
        days: days,
        adminId: req.user?.id,
      });

      res.json({
        success: true,
        data: result.subscription,
        message: `Subscription extended by ${days} days`,
      });
    } catch (error: any) {
      console.error("❌ Error extending user subscription:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to extend subscription",
      });
    }
  }

  /**
   * GET /api/admin/stats
   * Get comprehensive admin dashboard statistics
   */
  async getAdminStats(req: AuthRequest, res: Response) {
    try {
      console.log("📊 Fetching admin stats...");
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Get user statistics
      const { data: allUsers, error: usersError } = await supabaseAdmin
        .from("users")
        .select("id, email, role, created_at, last_login_at, is_active");

      if (usersError) {
        console.error("Error fetching users:", usersError);
        throw usersError;
      }

      console.log(`✅ Found ${allUsers?.length || 0} users`);

      // Filter out admin users for statistics
      const nonAdminUsers =
        allUsers?.filter((u) => {
          const role = (u.role || "learner").toLowerCase().trim();
          return role !== "admin";
        }) || [];

      const totalUsers = nonAdminUsers.length;
      const recentUsers =
        nonAdminUsers.filter((u) => new Date(u.created_at) >= thirtyDaysAgo)
          .length || 0;
      const activeUsers =
        nonAdminUsers.filter((u) => u.is_active === true).length || 0;

      // Role distribution (normalize to lowercase, exclude admin)
      const roleDistribution =
        nonAdminUsers.reduce((acc: any, user) => {
          const role = (user.role || "learner").toLowerCase().trim();
          acc[role] = (acc[role] || 0) + 1;
          return acc;
        }, {}) || {};

      console.log("Role distribution:", roleDistribution);

      // Get course statistics
      const { data: courses } = await supabaseAdmin
        .from("courses")
        .select("id, is_published, created_at");

      const totalCourses = courses?.length || 0;
      const publishedCourses =
        courses?.filter((c) => c.is_published).length || 0;

      // Get enrollment statistics
      const { data: enrollments } = await supabaseAdmin
        .from("enrollments")
        .select("id, created_at, status");

      const totalEnrollments = enrollments?.length || 0;
      const recentEnrollments =
        enrollments?.filter((e) => new Date(e.created_at) >= thirtyDaysAgo)
          .length || 0;
      const completedEnrollments =
        enrollments?.filter((e) => e.status === "completed").length || 0;

      // Get submission statistics
      const { data: submissions } = await supabaseAdmin
        .from("submissions")
        .select("id, passed, created_at");

      const totalSubmissions = submissions?.length || 0;
      const passedSubmissions =
        submissions?.filter((s) => s.passed).length || 0;
      const recentSubmissions =
        submissions?.filter((s) => new Date(s.created_at) >= thirtyDaysAgo)
          .length || 0;
      const successRate =
        totalSubmissions > 0
          ? ((passedSubmissions / totalSubmissions) * 100).toFixed(1)
          : "0";

      // Get subscription statistics
      const { data: subscriptions } = await supabaseAdmin
        .from("subscriptions")
        .select("id, status, plan_id, created_at");

      const activeSubscriptions =
        subscriptions?.filter((s) => s.status === "active").length || 0;
      const canceledSubscriptions =
        subscriptions?.filter((s) => s.status === "canceled").length || 0;

      // Calculate user growth by month (last 7 months) - exclude admin
      const monthlyGrowth = calculateMonthlyGrowth(nonAdminUsers);

      // Get top courses by enrollment
      const { data: topCourses } = await supabaseAdmin
        .from("courses")
        .select(
          `
          id, 
          title,
          enrollments:enrollments(count)
        `
        )
        .order("enrollments.count", { ascending: false })
        .limit(5);

      // Recent activities (last 10 non-admin users)
      const recentActivities = nonAdminUsers
        .sort(
          (a, b) =>
            new Date(b.last_login_at || b.created_at).getTime() -
            new Date(a.last_login_at || a.created_at).getTime()
        )
        .slice(0, 10)
        .map((u) => ({
          userId: u.id,
          email: u.email,
          action: u.last_login_at ? "logged in" : "registered",
          timestamp: u.last_login_at || u.created_at,
        }));

      console.log("📈 Stats Summary:", {
        totalUsers,
        activeUsers,
        totalCourses,
        publishedCourses,
        totalEnrollments,
      });

      res.json({
        success: true,
        data: {
          overview: {
            totalUsers,
            activeUsers,
            recentUsers,
            totalCourses,
            publishedCourses,
            totalEnrollments,
            recentEnrollments,
            completedEnrollments,
            totalSubmissions,
            passedSubmissions,
            recentSubmissions,
            successRate,
            activeSubscriptions,
            canceledSubscriptions,
          },
          roleDistribution,
          monthlyGrowth,
          topCourses:
            topCourses?.map((c) => ({
              title: c.title,
              enrollmentCount: c.enrollments?.length || 0,
            })) || [],
          recentActivities,
        },
      });
    } catch (error: any) {
      console.error("❌ Error fetching admin stats:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch admin statistics",
      });
    }
  }

  /**
   * GET /api/admin/courses
   * Get all courses for admin management
   */
  async getCourses(req: AuthRequest, res: Response) {
    try {
      const { page = 1, limit = 100 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);

      const { data, error, count } = await supabaseAdmin
        .from("courses")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) throw error;

      res.json({
        success: true,
        data: {
          courses: data || [],
          total: count,
        },
      });
    } catch (error: any) {
      console.error("❌ Error fetching courses:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch courses",
      });
    }
  }

  /**
   * POST /api/admin/courses
   * Create a new course
   */
  async createCourse(req: AuthRequest, res: Response) {
    try {
      const {
        title,
        slug,
        description,
        thumbnail_url,
        difficulty,
        is_published,
        partner_id,
      } = req.body;

      if (!title || !slug) {
        return res.status(400).json({
          success: false,
          error: "Title and slug are required",
        });
      }

      // Check if slug already exists
      const { data: existing } = await supabaseAdmin
        .from("courses")
        .select("id")
        .eq("slug", slug)
        .single();

      if (existing) {
        return res.status(409).json({
          success: false,
          error: "A course with this slug already exists",
        });
      }

      const { data, error } = await supabaseAdmin
        .from("courses")
        .insert({
          title,
          slug,
          description: description || null,
          thumbnail_url: thumbnail_url || null,
          difficulty: difficulty || "beginner",
          is_published: is_published || false,
          partner_id: partner_id || null,
        })
        .select()
        .single();

      if (error) throw error;

      console.log("📚 Admin created course:", {
        courseId: data.id,
        title: data.title,
        adminId: req.user?.id,
      });

      res.status(201).json({
        success: true,
        data,
        message: "Course created successfully",
      });
    } catch (error: any) {
      console.error("❌ Error creating course:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to create course",
      });
    }
  }

  /**
   * PUT /api/admin/courses/:id
   * Update a course
   */
  async updateCourse(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Remove id from update data if present
      delete updateData.id;
      delete updateData.created_at;

      const { data, error } = await supabaseAdmin
        .from("courses")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      if (!data) {
        return res.status(404).json({
          success: false,
          error: "Course not found",
        });
      }

      console.log("✏️ Admin updated course:", {
        courseId: id,
        adminId: req.user?.id,
      });

      res.json({
        success: true,
        data,
        message: "Course updated successfully",
      });
    } catch (error: any) {
      console.error("❌ Error updating course:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update course",
      });
    }
  }

  /**
   * DELETE /api/admin/courses/:id
   * Delete a course
   */
  async deleteCourse(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;

      const { error } = await supabaseAdmin
        .from("courses")
        .delete()
        .eq("id", id);

      if (error) throw error;

      console.log("🗑️ Admin deleted course:", {
        courseId: id,
        adminId: req.user?.id,
      });

      res.json({
        success: true,
        message: "Course deleted successfully",
      });
    } catch (error: any) {
      console.error("❌ Error deleting course:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to delete course",
      });
    }
  }
}

// Helper function to calculate monthly growth
function calculateMonthlyGrowth(users: any[]) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const now = new Date();
  const monthlyData: Record<string, number> = {};

  // Initialize last 7 months
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
    monthlyData[key] = 0;
  }

  // Count users by month
  users.forEach((user) => {
    const createdAt = new Date(user.created_at);
    const key = `${
      monthNames[createdAt.getMonth()]
    } ${createdAt.getFullYear()}`;
    if (monthlyData[key] !== undefined) {
      monthlyData[key]++;
    }
  });

  // Convert to array with cumulative count
  let cumulative = 0;
  return Object.entries(monthlyData).map(([month, count]) => {
    cumulative += count;
    return { month: month.split(" ")[0], count: cumulative };
  });
}
