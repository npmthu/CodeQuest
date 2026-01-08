export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: string;
  correct_answer: any; // JSONB: can be {"option_id": "a"} or {"text": "answer"} or string
  points: number;
  options?: any;
}

export interface AnswerSubmission {
  questionId: string;
  answer: string; // Changed from selectedOption to answer to support different question types
}

export interface GradingResult {
  score: number;
  totalScore: number;
  passed: boolean;
  percentage: number;
  details: QuestionGrade[];
}

export interface QuestionGrade {
  questionId: string;
  isCorrect: boolean;
  points: number;
  maxPoints: number;
  userAnswer: string;
  correctAnswer: string;
}

export class GradingService {
  /**
   * Calculate score from user answers
   */
  calculateScore(
    questions: QuizQuestion[],
    answers: AnswerSubmission[],
    passingScore: number = 70
  ): GradingResult {
    const startTime = Date.now();

    // Create a map for quick answer lookup
    const answerMap = new Map(answers.map((a) => [a.questionId, a.answer]));

    let totalScore = 0;
    let earnedScore = 0;
    const details: QuestionGrade[] = [];

    // Grade each question
    for (const question of questions) {
      const userAnswer = answerMap.get(question.id);

      // Parse correct_answer from JSONB
      let correctAnswerValue: string;
      if (
        typeof question.correct_answer === "object" &&
        question.correct_answer !== null
      ) {
        // correct_answer is JSONB object like {"option_id": "a"} or {"text": "answer"}
        correctAnswerValue =
          question.correct_answer.option_id ||
          question.correct_answer.text ||
          "";
      } else {
        // Fallback to string
        correctAnswerValue = String(question.correct_answer || "");
      }

      const correctAnswer = correctAnswerValue.toLowerCase();
      const userAnswerLower = String(userAnswer || "").toLowerCase();
      const isCorrect = userAnswerLower === correctAnswer;
      const points = isCorrect ? question.points : 0;

      totalScore += question.points;
      earnedScore += points;

      details.push({
        questionId: question.id,
        isCorrect,
        points,
        maxPoints: question.points,
        userAnswer: userAnswer ?? "",
        correctAnswer: correctAnswerValue,
      });
    }

    const percentage = totalScore > 0 ? (earnedScore / totalScore) * 100 : 0;
    const passed = percentage >= passingScore;

    const endTime = Date.now();
    console.log(`⏱️ Grading completed in ${endTime - startTime}ms`);

    return {
      score: earnedScore,
      totalScore,
      passed,
      percentage: Math.round(percentage * 100) / 100,
      details,
    };
  }

  /**
   * Validate answers structure
   */
  validateAnswers(answers: AnswerSubmission[]): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!Array.isArray(answers)) {
      errors.push("Answers must be an array");
      return { valid: false, errors };
    }

    for (let i = 0; i < answers.length; i++) {
      const answer = answers[i];

      if (!answer.questionId || typeof answer.questionId !== "string") {
        errors.push(`Answer ${i}: questionId is required and must be a string`);
      }

      if (typeof answer.answer !== "string") {
        errors.push(`Answer ${i}: answer must be a string`);
      }
    }

    return { valid: errors.length === 0, errors };
  }
}

export default new GradingService();
