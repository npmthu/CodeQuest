// Quiz DTOs - Contract giữa backend và frontend

export interface QuizDTO {
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

export interface QuizDetailDTO extends QuizDTO {
  questions: QuizQuestionDTO[];
  totalPoints: number;
  questionCount: number;
}

export interface QuizQuestionDTO {
  id: string;
  questionText: string;
  questionType: string;
  options?: any;
  points: number;
  displayOrder: number;
}

export interface QuizQuestionWithAnswerDTO extends QuizQuestionDTO {
  correctAnswer: any;
  explanation?: string;
}

export interface QuizAttemptDTO {
  id: string;
  userId: string;
  quizId: string;
  score: number;
  totalPoints: number;
  passed: boolean;
  startedAt: string;
  submittedAt?: string;
}

export interface QuizResultDTO extends QuizAttemptDTO {
  answers: Record<string, any>;
  correctAnswers?: Record<string, any>;
}

export interface SubmitQuizDTO {
  answers: Record<string, any>;
}
