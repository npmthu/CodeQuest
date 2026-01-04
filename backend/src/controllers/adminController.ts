// Admin controller - system stats, content approval, user management
import { Request, Response } from "express";
import { subscriptionService } from "../services/subscriptionService";
import { AuthRequest } from "../middleware/auth";

export class AdminController {
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
   * GET /api/admin/users
   * Get all users with pagination and filters
   */
  async getAllUsers(req: AuthRequest, res: Response) {
    try {
      const {
        page = 1,
        limit = 20,
        search = "",
        role = "",
        status = "",
      } = req.query;

      const offset = (Number(page) - 1) * Number(limit);

      let query = supabaseAdmin.from("users").select("*", { count: "exact" });

      // Apply filters
      if (search) {
        query = query.or(
          `email.ilike.%${search}%,display_name.ilike.%${search}%`
        );
      }

      if (role) {
        query = query.eq("role", role);
      }

      if (status === "active") {
        query = query.eq("is_active", true);
      } else if (status === "inactive") {
        query = query.eq("is_active", false);
      }

      const {
        data: users,
        error,
        count,
      } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (error) throw error;

      res.json({
        success: true,
        data: {
          users: users || [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: count || 0,
            totalPages: Math.ceil((count || 0) / Number(limit)),
          },
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
   * GET /api/admin/users/:userId
   * Get user details by ID
   */
  async getUserById(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;

      const { data: user, error } = await supabaseAdmin
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) throw error;

      if (!user) {
        return res.status(404).json({
          success: false,
          error: "User not found",
        });
      }

      res.json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      console.error("❌ Error fetching user:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to fetch user",
      });
    }
  }

  /**
   * PATCH /api/admin/users/:userId
   * Update user information
   */
  async updateUser(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const updateData = req.body;

      const { data: user, error } = await supabaseAdmin
        .from("users")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      console.log("✏️ Admin updated user:", {
        userId,
        adminId: req.user?.id,
      });

      res.json({
        success: true,
        data: user,
        message: "User updated successfully",
      });
    } catch (error: any) {
      console.error("❌ Error updating user:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update user",
      });
    }
  }

  /**
   * DELETE /api/admin/users/:userId
   * Deactivate or delete user
   */
  async deleteUser(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { permanent = false } = req.body;

      if (permanent) {
        // Permanent delete from auth and database
        const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(
          userId
        );
        if (authError) throw authError;

        console.log("🗑️ Admin permanently deleted user:", {
          userId,
          adminId: req.user?.id,
        });

        res.json({
          success: true,
          message: "User permanently deleted",
        });
      } else {
        // Soft delete - just deactivate
        const { data: user, error } = await supabaseAdmin
          .from("users")
          .update({
            is_active: false,
            updated_at: new Date().toISOString(),
          })
          .eq("id", userId)
          .select()
          .single();

        if (error) throw error;

        console.log("🚫 Admin deactivated user:", {
          userId,
          adminId: req.user?.id,
        });

        res.json({
          success: true,
          data: user,
          message: "User deactivated successfully",
        });
      }
    } catch (error: any) {
      console.error("❌ Error deleting user:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to delete user",
      });
    }
  }

  /**
   * PATCH /api/admin/users/:userId/role
   * Update user role
   */
  async updateUserRole(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      if (!role) {
        return res.status(400).json({
          success: false,
          error: "Role is required",
        });
      }

      const validRoles = ["learner", "instructor", "business_partner", "admin"];
      if (!validRoles.includes(role)) {
        return res.status(400).json({
          success: false,
          error: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
        });
      }

      const { data: user, error } = await supabaseAdmin
        .from("users")
        .update({
          role,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      console.log("👑 Admin updated user role:", {
        userId,
        newRole: role,
        adminId: req.user?.id,
      });

      res.json({
        success: true,
        data: user,
        message: `User role updated to ${role}`,
      });
    } catch (error: any) {
      console.error("❌ Error updating user role:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update user role",
      });
    }
  }

  /**
   * PATCH /api/admin/users/:userId/status
   * Update user active status
   */
  async updateUserStatus(req: AuthRequest, res: Response) {
    try {
      const { userId } = req.params;
      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          error: "isActive must be a boolean",
        });
      }

      const { data: user, error } = await supabaseAdmin
        .from("users")
        .update({
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;

      console.log("🔄 Admin updated user status:", {
        userId,
        isActive,
        adminId: req.user?.id,
      });

      res.json({
        success: true,
        data: user,
        message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      });
    } catch (error: any) {
      console.error("❌ Error updating user status:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Failed to update user status",
      });
    }
  }

  /**
   * GET /api/admin/stats
   * Get admin dashboard statistics
   */
  async getAdminStats(req: AuthRequest, res: Response) {
    try {
      // Get user statistics
      const { count: totalUsers } = await supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true });

      const { count: activeUsers } = await supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true);

      // Get role breakdown
      const { data: roleData } = await supabaseAdmin
        .from("users")
        .select("role");

      const roleBreakdown = roleData?.reduce((acc: any, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      // Get course statistics
      const { count: totalCourses } = await supabaseAdmin
        .from("courses")
        .select("*", { count: "exact", head: true });

      const { count: publishedCourses } = await supabaseAdmin
        .from("courses")
        .select("*", { count: "exact", head: true })
        .eq("is_published", true);

      // Get enrollment statistics
      const { count: totalEnrollments } = await supabaseAdmin
        .from("enrollments")
        .select("*", { count: "exact", head: true });

      // Get submission statistics
      const { count: totalSubmissions } = await supabaseAdmin
        .from("submissions")
        .select("*", { count: "exact", head: true });

      const { count: passedSubmissions } = await supabaseAdmin
        .from("submissions")
        .select("*", { count: "exact", head: true })
        .eq("passed", true);

      // Get recent activities (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { count: newUsersLast30Days } = await supabaseAdmin
        .from("users")
        .select("*", { count: "exact", head: true })
        .gte("created_at", thirtyDaysAgo.toISOString());

      res.json({
        success: true,
        data: {
          users: {
            total: totalUsers || 0,
            active: activeUsers || 0,
            inactive: (totalUsers || 0) - (activeUsers || 0),
            newLast30Days: newUsersLast30Days || 0,
            roleBreakdown: roleBreakdown || {},
          },
          courses: {
            total: totalCourses || 0,
            published: publishedCourses || 0,
            draft: (totalCourses || 0) - (publishedCourses || 0),
          },
          enrollments: {
            total: totalEnrollments || 0,
          },
          submissions: {
            total: totalSubmissions || 0,
            passed: passedSubmissions || 0,
            failed: (totalSubmissions || 0) - (passedSubmissions || 0),
            successRate: totalSubmissions
              ? (((passedSubmissions || 0) / totalSubmissions) * 100).toFixed(2)
              : 0,
          },
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
}

// Import supabaseAdmin at the top
import { supabaseAdmin } from "../config/database";
