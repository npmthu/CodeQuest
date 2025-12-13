// Achievement model - gamification achievements

export interface Achievement {
  id: string;
  slug: string;
  name: string;
  description?: string;
  badge_url?: string;
  xp_reward?: number;
  criteria: Record<string, any>; // jsonb
  is_active?: boolean;
  created_at?: string;
}

export interface UserAchievement {
  user_id: string;
  achievement_id: string;
  earned_at?: string;
  metadata?: Record<string, any>; // jsonb
}
