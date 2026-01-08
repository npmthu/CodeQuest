// Quiz routes - /api/quizzes/*
import { Router } from "express";
import quizController from "../controllers/quizController";
import quizSubmissionController from "../controllers/quizSubmissionController";
import { supabaseAuth } from "../middleware/auth";
import quizValidator from "../validators/quizValidator";

const router = Router();

// ===== PUBLIC ROUTES (No authentication required) =====
// Get all quizzes (can filter by lessonId)
router.get("/", quizController.getAllQuizzes);

// ===== PROTECTED ROUTES (Authentication required) =====
// Get quiz by ID
router.get(
  "/:id",
  supabaseAuth,
  quizValidator.validateQuizId,
  quizController.getQuizById
);

// Create new quiz (Teacher/Admin only)
router.post(
  "/",
  supabaseAuth,
  quizValidator.validateCreateQuiz,
  quizController.createQuiz
);

// Update quiz (Teacher/Admin only)
router.put(
  "/:id",
  supabaseAuth,
  quizValidator.validateQuizId,
  quizValidator.validateUpdateQuiz,
  quizController.updateQuiz
);

// Delete quiz (Teacher/Admin only)
router.delete(
  "/:id",
  supabaseAuth,
  quizValidator.validateQuizId,
  quizController.deleteQuiz
);

// ===== QUIZ SUBMISSION & RESULTS =====
// Submit quiz answers
router.post(
  "/:id/submit",
  supabaseAuth,
  quizValidator.validateQuizId,
  quizValidator.validateSubmission,
  quizSubmissionController.submitQuiz
);

// Get quiz results (students see their own, teachers see all)
router.get(
  "/:id/results",
  supabaseAuth,
  quizValidator.validateQuizId,
  quizController.getQuizResults
);

// Get specific result detail
router.get(
  "/:id/result/:resultId",
  supabaseAuth,
  quizSubmissionController.getResultById
);

// Get quiz statistics (Instructor/Admin only)
router.get(
  "/:id/statistics",
  supabaseAuth,
  quizValidator.validateQuizId,
  quizController.getQuizStatistics
);

export default router;
