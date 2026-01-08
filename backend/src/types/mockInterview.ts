export interface MockInterviewSession {
  id: string;
  instructor_id: string;
  title: string;
  description?: string;
  topic: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  session_date: string;
  duration_minutes: number;
  price: number;
  max_slots: number;
  slots_available: number;
  session_link?: string;
  requirements?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
  instructor?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface InterviewBooking {
  id: string;
  session_id: string;
  learner_id: string;
  booking_status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_amount?: number;
  payment_id?: string;
  booked_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  notes?: string;
  no_show_reported: boolean;
  session?: MockInterviewSession;
  learner?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface InterviewFeedback {
  id: string;
  booking_id: string;
  instructor_id: string;
  learner_id: string;
  overall_rating: number;
  technical_rating: number;
  communication_rating: number;
  problem_solving_rating: number;
  strengths?: string;
  areas_for_improvement?: string;
  recommendations?: string;
  detailed_feedback?: Record<string, any>;
  feedback_date: string;
  is_public: boolean;
  booking?: InterviewBooking;
  instructor?: {
    id: string;
    name: string;
    email: string;
    avatar_url?: string;
  };
}

export interface AISuggestionLog {
  id: string;
  user_id: string;
  suggestion_type: 'topic_suggestion' | 'summary' | 'mindmap' | 'hint' | 'code_review';
  input_content?: string;
  output_content?: Record<string, any>;
  context_metadata?: Record<string, any>;
  tokens_used: number;
  processing_time_ms?: number;
  created_at: string;
}

export interface SessionJoinLog {
  id: string;
  session_id: string;
  user_id: string;
  user_role: 'instructor' | 'learner';
  joined_at: string;
  left_at?: string;
  session_duration_minutes?: number;
}

// Request/Response Types
export interface CreateSessionRequest {
  title: string;
  description?: string;
  topic: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  session_date: string;
  duration_minutes: number;
  price: number;
  max_slots: number;
  session_link?: string;
  requirements?: string;
}

export interface BookSessionRequest {
  session_id: string;
  notes?: string;
  cardNumber?: string; // For mock payment processing - Fixes TC_PAY_03
}

export interface CreateFeedbackRequest {
  booking_id?: string; // Optional - only for learner feedback
  session_id?: string; // Optional - for instructor system feedback
  overall_rating: number;
  technical_rating: number;
  communication_rating: number;
  problem_solving_rating: number;
  strengths?: string;
  areas_for_improvement?: string;
  recommendations?: string;
  detailed_feedback?: Record<string, any>;
  comments?: string; // General comments field
  feedback_type?: 'learner_feedback' | 'instructor_system' | 'peer_review';
  is_public?: boolean;
}

export interface AISuggestionRequest {
  type: 'topic_suggestion' | 'summary' | 'mindmap' | 'hint' | 'code_review';
  content: string;
  context?: Record<string, any>;
}

export interface TopicSuggestionRequest {
  topic: string;
  difficulty_level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface SummaryRequest {
  content: string;
  max_length?: number;
}

export interface MindmapRequest {
  content: string;
  max_depth?: number;
}

export interface HintRequest {
  problem_context: string;
  current_code?: string;
  hint_level?: 'gentle' | 'moderate' | 'strong';
}

export interface CodeReviewRequest {
  code: string;
  language?: string;
  problem_description?: string;
}

export interface StartSessionRequest {
  session_id: string;
}

export interface JoinSessionRequest {
  session_id: string;
}

export interface SessionResponse {
  success: boolean;
  data: {
    session?: MockInterviewSession;
    booking?: InterviewBooking;
    join_url?: string;
    session_token?: string;
  };
  message?: string;
}

export interface FeedbackResponse {
  success: boolean;
  data?: InterviewFeedback;
  message?: string;
}

export interface AIResponse {
  success: boolean;
  data: {
    suggestions?: string[];
    summary?: string;
    mindmap?: {
      root: string;
      children: Array<{
        text: string;
        children?: any[];
      }>;
    };
    hint?: string;
    review?: {
      overall_score: number;
      strengths: string[];
      improvements: string[];
      suggestions: string[];
    };
  };
  message?: string;
}

export interface SessionListResponse {
  success: boolean;
  data: {
    sessions: MockInterviewSession[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface BookingListResponse {
  success: boolean;
  data: {
    bookings: InterviewBooking[];
    total: number;
    page: number;
    limit: number;
  };
}

export interface FeedbackListResponse {
  success: boolean;
  data: {
    feedback: InterviewFeedback[];
    total: number;
    page: number;
    limit: number;
  };
}
