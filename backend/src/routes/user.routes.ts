import express from "express";
import {
  listUsers,
  getUserHandler,
  updateUserHandler,
  getUserStatsHandler,
  getLearningProfileHandler,
  getLeaderboardHandler,
  changePasswordHandler,
  deleteAccountHandler,
  revokeSessionHandler,
} from "../controllers/userController";
import { supabaseAuth } from "../middleware/auth";

const router = express.Router();

// Public routes
router.get("/", listUsers);
router.get("/leaderboard", getLeaderboardHandler);
router.get("/:id", getUserHandler);

// Protected routes
router.patch("/me", supabaseAuth, updateUserHandler);
router.get("/me/stats", supabaseAuth, getUserStatsHandler);
router.get("/me/learning-profile", supabaseAuth, getLearningProfileHandler);
router.post("/change-password", supabaseAuth, changePasswordHandler);
router.delete("/account", supabaseAuth, deleteAccountHandler);
router.post("/sessions/:id/revoke", supabaseAuth, revokeSessionHandler);

export default router;
