import express from "express";
import {
  listLessonsHandler,
  getLessonHandler,
  updateProgressHandler,
  getUserProgressHandler,
} from "../controllers/lessonController";
import { supabaseAuth, optionalAuth } from "../middleware/auth";

const router = express.Router();

// Public routes with optional auth (to fetch user progress if logged in)
router.get("/", optionalAuth, listLessonsHandler);
router.get("/:id", optionalAuth, getLessonHandler);

// Protected routes (require authentication)
router.put("/:lessonId/progress", supabaseAuth, updateProgressHandler);
router.get("/user/progress", supabaseAuth, getUserProgressHandler);

export default router;
