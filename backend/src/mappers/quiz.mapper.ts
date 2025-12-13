// Quiz Mappers - Convert DB models sang DTOs

import { Quiz, QuizQuestion, QuizAttempt } from '../models/Quiz';
import {
  QuizDTO,
  QuizDetailDTO,
  QuizQuestionDTO,
  QuizQuestionWithAnswerDTO,
  QuizAttemptDTO,
  QuizResultDTO
} from '../dtos/quiz.dto';

export function mapQuizToDTO(quiz: Quiz): QuizDTO {
  return {
    id: quiz.id,
    topicId: quiz.topic_id,
    title: quiz.title,
    description: quiz.description,
    difficulty: quiz.difficulty,
    timeLimitMin: quiz.time_limit_min,
    passingScore: quiz.passing_score || 70,
    isPublished: quiz.is_published || false,
    createdAt: quiz.created_at
  };
}

export function mapQuizToDetailDTO(
  quiz: Quiz,
  questions: QuizQuestion[]
): QuizDetailDTO {
  const totalPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0);
  
  return {
    ...mapQuizToDTO(quiz),
    questions: questions.map(mapQuizQuestionToDTO),
    totalPoints,
    questionCount: questions.length
  };
}

export function mapQuizQuestionToDTO(question: QuizQuestion): QuizQuestionDTO {
  return {
    id: question.id,
    questionText: question.question_text,
    questionType: question.question_type || 'multiple_choice',
    options: question.options,
    points: question.points || 10,
    displayOrder: question.display_order || 0
  };
}

export function mapQuizQuestionWithAnswerToDTO(question: QuizQuestion): QuizQuestionWithAnswerDTO {
  return {
    ...mapQuizQuestionToDTO(question),
    correctAnswer: question.correct_answer,
    explanation: question.explanation
  };
}

export function mapQuizAttemptToDTO(attempt: QuizAttempt): QuizAttemptDTO {
  return {
    id: attempt.id,
    userId: attempt.user_id,
    quizId: attempt.quiz_id,
    score: attempt.score || 0,
    totalPoints: attempt.total_points || 0,
    passed: attempt.passed || false,
    startedAt: attempt.started_at || new Date().toISOString(),
    submittedAt: attempt.submitted_at
  };
}

export function mapQuizAttemptToResultDTO(
  attempt: QuizAttempt,
  correctAnswers?: Record<string, any>
): QuizResultDTO {
  return {
    ...mapQuizAttemptToDTO(attempt),
    answers: attempt.answers || {},
    correctAnswers
  };
}
