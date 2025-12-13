// Quiz model - quizzes and questions

export interface Quiz {
  id: string;
  topic_id: string;
  title: string;
  description?: string;
  difficulty?: string;
  time_limit_min?: number;
  passing_score?: number;
  created_by?: string;
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_text: string;
  question_type?: string;
  options?: any; // jsonb
  correct_answer: any; // jsonb
  explanation?: string;
  points?: number;
  display_order?: number;
  created_at?: string;
}

export interface QuizAttempt {
  id: string;
  user_id: string;
  quiz_id: string;
  score?: number;
  total_points?: number;
  passed?: boolean;
  started_at?: string;
  submitted_at?: string;
  answers?: any; // jsonb
}
