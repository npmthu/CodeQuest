// Frontend Quiz Interfaces - Mirror của backend DTOs

export interface Quiz {
  id: string;
  topicId: string;
  title: string;
  description?: string;
  difficulty?: string;
  timeLimitMin?: number;
  passingScore: number;
  isPublished: boolean;
  createdAt?: string;
}

export interface QuizDetail extends Quiz {
  questions: QuizQuestion[];
  totalPoints: number;
  questionCount: number;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  questionType: string;
  options?: any;
  points: number;
  displayOrder: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  startedAt: string;
  submittedAt?: string;
}

export interface QuizResult extends QuizAttempt {
  answers: Record<string, any>;
  correctAnswers?: Record<string, any>;
}

export interface SubmitQuizRequest {
  answers: Record<string, any>;
}
