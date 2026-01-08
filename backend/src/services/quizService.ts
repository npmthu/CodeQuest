import { supabaseAdmin } from "../config/database";

export class QuizService {
  /**
   * Get all quizzes for a topic
   */
  async getQuizzesByTopic(topicId: string) {
    const { data: quizzes, error } = await supabaseAdmin
      .from("quizzes")
      .select(
        `
        *,
        questions:quiz_questions(count),
        attempts:quiz_attempts(count)
      `
      )
      .eq("topic_id", topicId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    // Process count aggregates - Supabase returns [{count: n}] instead of n
    return quizzes?.map((quiz: any) => ({
      ...quiz,
      questions: quiz.questions?.[0]?.count || 0,
      attempts: quiz.attempts?.[0]?.count || 0,
    }));
  }

  /**
   * Get quiz by ID with questions
   */
  async getQuizById(quizId: string, includeAnswers: boolean = false) {
    const { data: quiz, error } = await supabaseAdmin
      .from("quizzes")
      .select(
        `
        *,
        questions:quiz_questions(*),
        topic:topics(id, name)
      `
      )
      .eq("id", quizId)
      .order("display_order", {
        foreignTable: "quiz_questions",
        ascending: true,
      })
      .single();

    if (error || !quiz) {
      return null;
    }

    // Remove correct answers if not needed (for student view)
    if (!includeAnswers && quiz.questions) {
      quiz.questions = quiz.questions.map((q: any) => ({
        ...q,
        correct_answer: null, // Hide correct answer
      }));
    }

    return quiz;
  }

  /**
   * Create new quiz with questions
   */
  async createQuiz(data: {
    title: string;
    description?: string;
    timeLimitMin: number;
    topicId: string;
    difficulty?: string;
    passingScore?: number;
    createdBy: string;
    questions: {
      questionText: string;
      questionType: string;
      options: any;
      correctAnswer: string;
      points: number;
      explanation?: string;
    }[];
  }) {
    // Create quiz first
    const { data: quiz, error: quizError } = await supabaseAdmin
      .from("quizzes")
      .insert({
        title: data.title,
        description: data.description,
        time_limit_min: data.timeLimitMin,
        topic_id: data.topicId,
        difficulty: data.difficulty,
        passing_score: data.passingScore || 70,
        created_by: data.createdBy,
      })
      .select()
      .single();

    if (quizError || !quiz) throw quizError;

    // Create questions
    const questionsToInsert = data.questions.map((q, index) => ({
      quiz_id: quiz.id,
      question_text: q.questionText,
      question_type: q.questionType,
      options: q.options,
      correct_answer: q.correctAnswer,
      points: q.points,
      explanation: q.explanation,
      display_order: index,
    }));

    const { data: questions, error: questionsError } = await supabaseAdmin
      .from("quiz_questions")
      .insert(questionsToInsert)
      .select();

    if (questionsError) throw questionsError;

    return { ...quiz, questions };
  }

  /**
   * Update quiz
   */
  async updateQuiz(
    quizId: string,
    data: {
      title?: string;
      description?: string;
      timeLimitMin?: number;
      difficulty?: string;
      passingScore?: number;
    }
  ) {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined)
      updateData.description = data.description;
    if (data.timeLimitMin) updateData.time_limit_min = data.timeLimitMin;
    if (data.difficulty) updateData.difficulty = data.difficulty;
    if (data.passingScore) updateData.passing_score = data.passingScore;

    const { data: quiz, error } = await supabaseAdmin
      .from("quizzes")
      .update(updateData)
      .eq("id", quizId)
      .select()
      .single();

    if (error) throw error;
    return quiz;
  }

  /**
   * Delete quiz (cascade delete questions and results)
   */
  async deleteQuiz(quizId: string) {
    const { error } = await supabaseAdmin
      .from("quizzes")
      .delete()
      .eq("id", quizId);

    if (error) throw error;
    return { success: true };
  }

  /**
   * Get quiz attempts for a user
   */
  async getUserResults(userId: string, quizId: string) {
    const { data, error } = await supabaseAdmin
      .from("quiz_attempts")
      .select("*")
      .eq("user_id", userId)
      .eq("quiz_id", quizId)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Get all results for a quiz (for teachers)
   */
  async getQuizResults(quizId: string) {
    const { data, error } = await supabaseAdmin
      .from("quiz_results")
      .select(
        `
          *,
          user:users(id, display_name, email)
        `
      )
      .eq("quiz_id", quizId)
      .order("submitted_at", { ascending: false });

    if (error) throw error;
    return data;
  }

  /**
   * Check if user has already taken the quiz
   */
  async hasUserTakenQuiz(userId: string, quizId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from("quiz_attempts")
      .select("id")
      .eq("user_id", userId)
      .eq("quiz_id", quizId)
      .limit(1)
      .maybeSingle();

    return !!data && !error;
  }

  /**
   * Get quiz statistics
   */
  async getQuizStatistics(quizId: string) {
    const { data: results, error } = await supabaseAdmin
      .from("quiz_attempts")
      .select("score, total_points, passed")
      .eq("quiz_id", quizId);

    if (error) throw error;

    if (!results || results.length === 0) {
      return {
        totalAttempts: 0,
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        passRate: 0,
      };
    }

    const percentages = results.map((r) =>
      r.total_points > 0 ? (r.score / r.total_points) * 100 : 0
    );
    const passed = results.filter((r) => r.passed);

    return {
      totalAttempts: results.length,
      averageScore: Math.round(
        percentages.reduce((a, b) => a + b, 0) / percentages.length
      ),
      highestScore: Math.round(Math.max(...percentages)),
      lowestScore: Math.round(Math.min(...percentages)),
      passRate: Math.round((passed.length / results.length) * 100),
    };
  }
}

export default new QuizService();
