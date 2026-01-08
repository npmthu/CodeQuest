import { Request, Response, NextFunction } from "express";

export class QuizValidator {
  /**
   * Validate quiz creation data
   */
  validateCreateQuiz(req: Request, res: Response, next: NextFunction): void {
    const { title, duration, lessonId, questions } = req.body;

    const errors: string[] = [];

    // Validate title
    if (!title || typeof title !== "string" || title.trim().length < 3) {
      errors.push("Title is required and must be at least 3 characters");
    }

    // Validate duration
    if (!duration || typeof duration !== "number" || duration < 1) {
      errors.push("Duration must be a positive number (in minutes)");
    }

    // Validate lessonId
    if (!lessonId || typeof lessonId !== "string") {
      errors.push("lessonId is required");
    }

    // Validate questions
    if (!questions || !Array.isArray(questions)) {
      errors.push("Questions must be an array");
    } else if (questions.length === 0) {
      errors.push("Quiz must have at least one question");
    } else {
      // Validate each question
      questions.forEach((q, index) => {
        if (!q.text || typeof q.text !== "string" || q.text.trim().length < 5) {
          errors.push(
            `Question ${
              index + 1
            }: text is required and must be at least 5 characters`
          );
        }

        if (!Array.isArray(q.options) || q.options.length < 2) {
          errors.push(`Question ${index + 1}: must have at least 2 options`);
        }

        if (
          typeof q.correctAnswer !== "number" ||
          q.correctAnswer < 0 ||
          q.correctAnswer >= (q.options?.length || 0)
        ) {
          errors.push(
            `Question ${index + 1}: correctAnswer must be a valid option index`
          );
        }

        if (typeof q.points !== "number" || q.points < 1) {
          errors.push(
            `Question ${index + 1}: points must be a positive number`
          );
        }
      });
    }

    if (errors.length > 0) {
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }

    next();
  }

  /**
   * Validate quiz update data
   */
  validateUpdateQuiz(req: Request, res: Response, next: NextFunction): void {
    const { title, duration, description } = req.body;

    const errors: string[] = [];

    // Title is optional but must be valid if provided
    if (
      title !== undefined &&
      (typeof title !== "string" || title.trim().length < 3)
    ) {
      errors.push("Title must be at least 3 characters if provided");
    }

    // Duration is optional but must be valid if provided
    if (
      duration !== undefined &&
      (typeof duration !== "number" || duration < 1)
    ) {
      errors.push("Duration must be a positive number if provided");
    }

    // Description is optional but must be string if provided
    if (description !== undefined && typeof description !== "string") {
      errors.push("Description must be a string if provided");
    }

    if (errors.length > 0) {
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }

    next();
  }

  /**
   * Validate quiz submission
   */
  validateSubmission(req: Request, res: Response, next: NextFunction): void {
    const { answers } = req.body;

    const errors: string[] = [];

    if (!answers || !Array.isArray(answers)) {
      errors.push("Answers must be an array");
    } else if (answers.length === 0) {
      errors.push("Answers array cannot be empty");
    } else {
      // Validate each answer
      answers.forEach((answer, index) => {
        if (!answer.questionId || typeof answer.questionId !== "string") {
          errors.push(
            `Answer ${index + 1}: questionId is required and must be a string`
          );
        }

        if (typeof answer.answer !== "string") {
          errors.push(
            `Answer ${index + 1}: answer is required and must be a string`
          );
        }
      });
    }

    if (errors.length > 0) {
      res.status(400).json({ error: "Validation failed", details: errors });
      return;
    }

    next();
  }

  /**
   * Validate quiz ID parameter
   */
  validateQuizId(req: Request, res: Response, next: NextFunction): void {
    const { id } = req.params;

    if (!id || typeof id !== "string" || id.trim().length === 0) {
      res.status(400).json({ error: "Invalid quiz ID" });
      return;
    }

    next();
  }
}

export default new QuizValidator();
