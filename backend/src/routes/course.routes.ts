import { Router } from "express";
import {
  listCoursesHandler,
  getCourseHandler,
  getCourseProgressHandler,
  createCourseHandler,
  updateCourseHandler,
} from "../controllers/courseController";
import { supabaseAuth, optionalAuth } from "../middleware/auth";

const router = Router();

router.get("/", listCoursesHandler); // GET /api/courses
router.get("/:id", optionalAuth, getCourseHandler); // GET /api/courses/:id
router.get("/:id/progress", supabaseAuth, getCourseProgressHandler); // GET /api/courses/:id/progress
router.post("/", supabaseAuth, createCourseHandler); // POST /api/courses
router.patch("/:id", supabaseAuth, updateCourseHandler); // PATCH /api/courses/:id

export default router;
