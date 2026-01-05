// Admin routes - /api/admin/*
import { Router } from "express";
import { AdminController } from "../controllers/adminController";
import { requireAdmin } from "../middleware/adminAuth";
import { supabaseAuth } from "../middleware/auth";

const router = Router();
const adminController = new AdminController();

// Apply authentication to all admin routes
router.use(supabaseAuth);

// Apply admin role check to all admin routes
router.use(requireAdmin);

// Dashboard Statistics
router.get("/stats", adminController.getAdminStats.bind(adminController));

// Subscription Plan Management - Fixes TC_ADMIN_SUB_01, TC_ADMIN_SUB_03
router.get("/plans", adminController.getPlans.bind(adminController));
router.post("/plans", adminController.createPlan.bind(adminController));
router.put("/plans/:id", adminController.updatePlan.bind(adminController));
router.delete("/plans/:id", adminController.deletePlan.bind(adminController));

// Get all subscriptions with user details (for admin dashboard)
router.get(
  "/subscriptions",
  adminController.getAllSubscriptions.bind(adminController)
);

// Get all users with pagination and search
router.get("/users", adminController.getAllUsers.bind(adminController));

// Course Management
router.get("/courses", adminController.getCourses.bind(adminController));
router.post("/courses", adminController.createCourse.bind(adminController));
router.put("/courses/:id", adminController.updateCourse.bind(adminController));
router.delete(
  "/courses/:id",
  adminController.deleteCourse.bind(adminController)
);

// Forum Post Moderation
router.get("/forum/posts", adminController.getForumPosts.bind(adminController));
router.get(
  "/forum/posts/:id/replies",
  adminController.getPostReplies.bind(adminController)
);
router.delete(
  "/forum/posts/:id",
  adminController.deleteForumPost.bind(adminController)
);
router.delete(
  "/forum/comments/:id",
  adminController.deleteComment.bind(adminController)
);

// User Subscription Management - Fixes TC_ADMIN_SUB_02, TC_ADMIN_SUB_05
router.post(
  "/users/:userId/cancel-subscription",
  adminController.cancelUserSubscription.bind(adminController)
);
router.get(
  "/users/:userId/subscription",
  adminController.getUserSubscription.bind(adminController)
);
router.post(
  "/users/:userId/extend-subscription",
  adminController.extendUserSubscription.bind(adminController)
);

// Notifications
router.get(
  "/notifications",
  adminController.getNotifications.bind(adminController)
);
router.post(
  "/notifications",
  adminController.sendNotification.bind(adminController)
);
router.post(
  "/notifications/draft",
  adminController.saveDraftNotification.bind(adminController)
);

export default router;
