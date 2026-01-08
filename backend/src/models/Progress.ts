// Progress model - user learning progress tracking

export interface UserLearningProfile {
  user_id: string;
  current_level?: string;
  weak_topics?: any; // jsonb
  strong_topics?: any; // jsonb
  learning_preferences?: any; // jsonb
  current_streak_days?: number;
  longest_streak_days?: number;
  last_activity_date?: string;
  updated_at?: string;
}
