export interface Quiz {
  id: string;
  topic_id: string;
  title: string;
  description?: string;
  difficulty?: string;
  time_limit_min: number;
  passing_score: number;
  created_by: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;

  // Joined data
  topic?: {
    id: string;
    name: string;
  };
  questions?: QuizQuestion[];
  attempts?: { count: number }[];
  hasTaken?: boolean;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  options?: string[] | any; // JSON field
  correct_answer: string | null; // null when hidden for students
  explanation?: string;
  points: number;
  display_order: number;
  created_at: string;
}

export interface QuizAttempt {
  id: string;
  quiz_id: string;
  user_id: string;
  score: number;
  total_points: number;
  passed: boolean;
  answers: AnswerSubmission[];
  started_at?: string;
  submitted_at: string;

  // Joined data
  quiz?: {
    id: string;
    title: string;
    description?: string;
  };
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
  percentage?: number;
}

export interface AnswerSubmission {
  questionId: string;
  answer: string;
}

export interface QuizSubmissionResult {
  id: string;
  score: number;
  totalScore: number;
  percentage: number;
  passed: boolean;
  submittedAt: string;
  details?: QuestionGrade[];
}

export interface QuestionGrade {
  questionId: string;
  isCorrect: boolean;
  points: number;
  maxPoints: number;
  userAnswer: string;
  correctAnswer: string;
}

export interface QuizStatistics {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  passRate: number;
}

export interface CreateQuizInput {
  title: string;
  description?: string;
  timeLimitMin: number;
  topicId: string;
  difficulty?: string;
  passingScore?: number;
  questions: {
    questionText: string;
    questionType: "multiple_choice" | "true_false" | "short_answer";
    options: string[];
    correctAnswer: string;
    points: number;
    explanation?: string;
  }[];
}
