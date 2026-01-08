// Interview model - interview sessions and feedback

// User lite for joined data
export interface UserLite {
  id: string;
  display_name: string;
  avatar_url?: string;
  level?: string;
}

// Base model - match database schema
export interface InterviewSession {
  id: string;
  interviewee_id: string;
  interviewer_id?: string;
  interview_type: 'behavioral' | 'technical' | 'system_design' | 'coding' | 'mock';
  difficulty: 'easy' | 'medium' | 'hard';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduled_at?: string;
  started_at?: string;
  ended_at?: string;
  duration_min: number;
  communication_mode: 'video' | 'audio' | 'text';
  recording_enabled: boolean;
  recording_url?: string;
  workspace_data?: any;
  created_at: string;
  updated_at?: string;
}

// API response with joined data
export interface InterviewSessionWithUsers extends InterviewSession {
  interviewee?: UserLite;
  interviewer?: UserLite;
}

export interface InterviewFeedback {
  id: string;
  session_id: string;
  from_user_id: string;
  to_user_id: string;
  overall_rating: number;
  communication_rating?: number;
  problem_solving_rating?: number;
  technical_knowledge_rating?: number;
  feedback_text?: string;
  recommended_topics?: string[];
  created_at: string;
}
