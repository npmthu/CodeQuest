import express from "express";
import {
  listLessonsHandler,
  getLessonHandler,
  updateProgressHandler,
  getUserProgressHandler,
  getCurrentLessonHandler,
  createLessonHandler,
  updateLessonHandler,
  deleteLessonHandler,
} from "../controllers/lessonController";
import { supabaseAuth, optionalAuth } from "../middleware/auth";

const router = express.Router();

// Public routes with optional auth (to fetch user progress if logged in)
router.get("/", optionalAuth, listLessonsHandler);
router.get("/current", supabaseAuth, getCurrentLessonHandler);
router.get("/:id", optionalAuth, getLessonHandler);

// Instructor/admin routes
router.post("/", supabaseAuth, createLessonHandler);
router.patch("/:id", supabaseAuth, updateLessonHandler);
router.delete("/:id", supabaseAuth, deleteLessonHandler);

// Protected routes (require authentication)
router.put("/:lessonId/progress", supabaseAuth, updateProgressHandler);
router.get("/user/progress", supabaseAuth, getUserProgressHandler);

export default router;
