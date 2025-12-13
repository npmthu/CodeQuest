// User model - users, profiles, authentication
export interface User {
  id: string;                 // UUID
  email?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  role: 'learner' | 'instructor' | 'business_partner' | 'admin' | string;
  is_active?: boolean;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  reputation?: number;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
  metadata?: Record<string, any>;
}

export interface UserLearningProfile {
  user_id: string;
  current_level: string;
  weak_topics?: string[];
  strong_topics?: string[];
  learning_preferences?: Record<string, any>;
  current_streak_days: number;
  longest_streak_days: number;
  last_activity_date?: string;
  updated_at: string;
}
