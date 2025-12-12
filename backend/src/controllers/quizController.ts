// Quiz controller - list/get quizzes, start attempt, submit answers
import { Request, Response } from "express";
import quizService from "../services/quizService";
import { AuthRequest } from "../middleware/auth";
import { supabaseAdmin } from "../config/database";

export class QuizController {
  /**
   * GET /api/quiz - Get all quizzes (optionally filter by topic)
   */
  async getAllQuizzes(req: Request, res: Response) {
    try {
      const { topicId } = req.query;

      if (topicId && typeof topicId === "string") {
        const quizzes = await quizService.getQuizzesByTopic(topicId);
        return res.json({ success: true, data: quizzes });
      }

      // Get all quizzes if no topic filter
      const { data: quizzes, error } = await supabaseAdmin
        .from("quizzes")
        .select(
          `
          *,
          topic:topics(id, name),
          questions:quiz_questions(count),
          attempts:quiz_attempts(count)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Process count aggregates - Supabase returns [{count: n}] instead of n
      const processedQuizzes = quizzes?.map((quiz: any) => ({
        ...quiz,
        questions: quiz.questions?.[0]?.count || 0,
        attempts: quiz.attempts?.[0]?.count || 0,
      }));

      res.json({ success: true, data: processedQuizzes });
    } catch (error) {
      console.error("Error fetching quizzes:", error);
      res.status(500).json({ error: "Failed to fetch quizzes" });
    }
  }

  /**
   * GET /api/quiz/:id - Get quiz by ID
   */
  async getQuizById(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      // Instructors and admins can see correct answers
      const includeAnswers =
        user?.role === "instructor" || user?.role === "admin";

      const quiz = await quizService.getQuizById(id, includeAnswers);

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      // Check if user has already taken the quiz
      if (user) {
        const hasTaken = await quizService.hasUserTakenQuiz(user.id, id);
        return res.json({ success: true, data: { ...quiz, hasTaken } });
      }

      res.json({ success: true, data: quiz });
    } catch (error) {
      console.error("Error fetching quiz:", error);
      res.status(500).json({ error: "Failed to fetch quiz" });
    }
  }

  /**
   * POST /api/quiz - Create new quiz (Teacher/Admin only)
   */
  async createQuiz(req: AuthRequest, res: Response) {
    try {
      const user = req.user;

      // Check authorization
      if (user?.role !== "instructor" && user?.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Only instructors and admins can create quizzes" });
      }

      const {
        title,
        description,
        timeLimitMin,
        topicId,
        difficulty,
        passingScore,
        questions,
      } = req.body;

      // Validate required fields
      if (
        !title ||
        !timeLimitMin ||
        !topicId ||
        !questions ||
        !Array.isArray(questions)
      ) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      if (questions.length === 0) {
        return res
          .status(400)
          .json({ error: "Quiz must have at least one question" });
      }

      const quiz = await quizService.createQuiz({
        title,
        description,
        timeLimitMin,
        topicId,
        difficulty,
        passingScore,
        createdBy: user.id,
        questions,
      });

      res.status(201).json(quiz);
    } catch (error) {
      console.error("Error creating quiz:", error);
      res.status(500).json({ error: "Failed to create quiz" });
    }
  }

  /**
   * PUT /api/quiz/:id - Update quiz (Teacher/Admin only)
   */
  async updateQuiz(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      // Check authorization
      if (user?.role !== "instructor" && user?.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Only instructors and admins can update quizzes" });
      }

      const { title, description, timeLimitMin, difficulty, passingScore } =
        req.body;

      const quiz = await quizService.updateQuiz(id, {
        title,
        description,
        timeLimitMin,
        difficulty,
        passingScore,
      });

      res.json({ success: true, data: quiz });
    } catch (error) {
      console.error("Error updating quiz:", error);
      res.status(500).json({ error: "Failed to update quiz" });
    }
  }

  /**
   * DELETE /api/quiz/:id - Delete quiz (Teacher/Admin only)
   */
  async deleteQuiz(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      // Check authorization
      if (user?.role !== "instructor" && user?.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Only instructors and admins can delete quizzes" });
      }

      await quizService.deleteQuiz(id);

      res.json({ message: "Quiz deleted successfully" });
    } catch (error) {
      console.error("Error deleting quiz:", error);
      res.status(500).json({ error: "Failed to delete quiz" });
    }
  }

  /**
   * GET /api/quiz/:id/results - Get quiz results
   */
  async getQuizResults(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      // Students can only see their own results
      if (user.role === "learner") {
        const results = await quizService.getUserResults(user.id, id);
        return res.json({ success: true, data: results });
      }

      // Instructors and admins can see all results
      const results = await quizService.getQuizResults(id);
      res.json({ success: true, data: results });
    } catch (error) {
      console.error("Error fetching quiz results:", error);
      res.status(500).json({ error: "Failed to fetch quiz results" });
    }
  }

  /**
   * GET /api/quiz/:id/statistics - Get quiz statistics (Teacher/Admin only)
   */
  async getQuizStatistics(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const user = req.user;

      // Check authorization
      if (user?.role !== "instructor" && user?.role !== "admin") {
        return res
          .status(403)
          .json({ error: "Only instructors and admins can view statistics" });
      }

      const statistics = await quizService.getQuizStatistics(id);
      res.json({ success: true, data: statistics });
    } catch (error) {
      console.error("Error fetching quiz statistics:", error);
      res.status(500).json({ error: "Failed to fetch quiz statistics" });
    }
  }
}

export default new QuizController();
