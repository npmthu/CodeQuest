import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import quizService from "../services/quizService";
import gradingService, { AnswerSubmission } from "../services/gradingService";
import { supabaseAdmin } from "../config/database";
import { mapQuizAttemptToDTO } from "../mappers/quiz.mapper";

export class QuizSubmissionController {
  /**
   * POST /api/quiz/:id/submit - Submit quiz answers
   */
  async submitQuiz(req: AuthRequest, res: Response) {
    try {
      const { id: quizId } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { answers } = req.body;

      // Validate answers
      const validation = gradingService.validateAnswers(answers);
      if (!validation.valid) {
        return res.status(400).json({
          error: "Invalid answers format",
          details: validation.errors,
        });
      }

      console.log(`📝 User ${user.id} submitting quiz ${quizId}`);

      // Get quiz with questions and correct answers
      const quiz = await quizService.getQuizById(quizId, true);

      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      // Allow retaking quizzes - removed the restriction
      // Users can now retake quizzes to improve their scores

      // Grade the quiz
      console.log("🎯 Starting grading process...");
      const gradingResult = gradingService.calculateScore(
        quiz.questions,
        answers as AnswerSubmission[],
        70 // Default passing score
      );

      console.log("✅ Grading completed:", {
        score: gradingResult.score,
        totalScore: gradingResult.totalScore,
        passed: gradingResult.passed,
        percentage: gradingResult.percentage,
      });

      // Save result to database
      const percentage = (gradingResult.score / gradingResult.totalScore) * 100;
      console.log("💾 Inserting quiz attempt to database...");
      const { data: quizResult, error } = await supabaseAdmin
        .from("quiz_attempts")
        .insert({
          user_id: user.id,
          quiz_id: quizId,
          score: gradingResult.score,
          total_points: gradingResult.totalScore,
          passed: gradingResult.passed,
          answers: answers, // Store user's answers
          submitted_at: new Date().toISOString(), // Set submission timestamp
        })
        .select()
        .single();

      if (error) {
        console.error("❌ Insert error:", error);
        throw error;
      }

      console.log("✅ Inserted quiz result:", quizResult);

      // Map to DTO (camelCase)
      const attemptDTO = mapQuizAttemptToDTO(quizResult);

      // Return result with grading details
      res.status(201).json({
        success: true,
        data: {
          ...attemptDTO,
          percentage: Math.round(percentage * 100) / 100,
          details: gradingResult.details, // Include question-by-question breakdown
        },
      });
    } catch (error) {
      console.error("❌ Error submitting quiz:", error);
      res.status(500).json({ error: "Failed to submit quiz" });
    }
  }

  /**
   * GET /api/quiz/:id/result/:resultId - Get specific result details
   */
  async getResultById(req: AuthRequest, res: Response) {
    try {
      const { id: quizId, resultId } = req.params;
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }
      console.log(
        `🔍 Fetching result ${resultId} for quiz ${quizId}, user: ${user.id}`
      );
      const { data: result, error } = await supabaseAdmin
        .from("quiz_attempts")
        .select(
          `
          *,
          quiz:quizzes(
            *,
            questions:quiz_questions(*)
          ),
          user:users(id, display_name, email)
        `
        )
        .eq("id", resultId)
        .single();

      console.log("📊 Query result:", result);
      console.log("❌ Query error:", error);

      if (error || !result) {
        return res
          .status(404)
          .json({ error: "Result not found", details: error?.message });
      }

      console.log("✅ Query successful! Starting grading process...");

      // Students can only see their own results
      if (user.role === "learner" && result.user_id !== user.id) {
        return res.status(403).json({ error: "Access denied" });
      }

      // Re-grade to get detailed breakdown
      const answers = result.answers as AnswerSubmission[];

      console.log("📝 Quiz questions with correct answers:");
      result.quiz.questions.forEach((q: any, index: number) => {
        console.log(`  Q${index + 1}: ${q.question_text}`);
        console.log(`    Correct: ${q.correct_answer}`);
        console.log(`    Type: ${q.question_type}, Points: ${q.points}`);
      });

      console.log("\n📋 User submitted answers:");
      answers.forEach((a: any, index: number) => {
        console.log(`  Q${index + 1} (${a.questionId}): ${a.answer}`);
      });

      const gradingResult = gradingService.calculateScore(
        result.quiz.questions,
        answers,
        result.quiz.passing_score || 70
      );

      console.log("\n✅ Grading results:");
      gradingResult.details.forEach((d: any, index: number) => {
        console.log(
          `  Q${index + 1}: ${d.isCorrect ? "✓" : "✗"} (${d.points}/${
            d.maxPoints
          } pts)`
        );
        console.log(
          `    User: "${d.userAnswer}" vs Correct: "${d.correctAnswer}"`
        );
      });

      // Merge question details with grading results
      const detailsWithQuestionInfo = gradingResult.details.map((detail) => {
        const question = result.quiz.questions.find(
          (q: any) => q.id === detail.questionId
        );

        console.log(
          `🔍 Merging Q${question?.question_text?.substring(0, 30)}...`
        );
        console.log(`   detail.correctAnswer: "${detail.correctAnswer}"`);
        console.log(`   question.correct_answer:`, question?.correct_answer);

        return {
          ...detail,
          question_text: question?.question_text || "",
          explanation: question?.explanation || null,
        };
      });

      console.log("\n📤 Final response details:");
      console.log(JSON.stringify(detailsWithQuestionInfo, null, 2));

      // Map to camelCase response
      res.json({
        success: true,
        data: {
          id: result.id,
          userId: result.user_id,
          userName: result.user.display_name,
          quizId: result.quiz_id,
          quizTitle: result.quiz.title,
          score: result.score,
          totalScore: result.total_points,
          percentage: gradingResult.percentage,
          passed: result.passed,
          submittedAt: result.submitted_at,
          details: detailsWithQuestionInfo.map((d: any) => ({
            questionId: d.questionId,
            questionText: d.question_text,
            userAnswer: d.userAnswer,
            correctAnswer: d.correctAnswer,
            isCorrect: d.isCorrect,
            points: d.points,
            maxPoints: d.maxPoints,
            explanation: d.explanation
          })),
        },
      });
    } catch (error) {
      console.error("Error fetching result:", error);
      res.status(500).json({ error: "Failed to fetch result" });
    }
  }

  /**
   * GET /api/user/results - Get all results for current user
   */
  async getMyResults(req: AuthRequest, res: Response) {
    try {
      const user = req.user;

      if (!user) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const { data: results, error } = await supabaseAdmin
        .from("quiz_attempts")
        .select(
          `
          *,
          quiz:quizzes(id, title, description)
        `
        )
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      // Calculate percentage and map to camelCase
      const resultsWithPercentage = results?.map((r) => ({
        id: r.id,
        userId: r.user_id,
        quizId: r.quiz_id,
        quizTitle: r.quiz?.title,
        quizDescription: r.quiz?.description,
        score: r.score,
        totalPoints: r.total_points,
        percentage:
          r.total_points > 0 ? Math.round((r.score / r.total_points) * 100) : 0,
        passed: r.passed,
        submittedAt: r.submitted_at,
      }));

      res.json({ success: true, data: resultsWithPercentage });
    } catch (error) {
      console.error("Error fetching user results:", error);
      res.status(500).json({ error: "Failed to fetch results" });
    }
  }
}

export default new QuizSubmissionController();
