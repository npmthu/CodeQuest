// User model - users, profiles, authentication
export interface User {
  id: string;                 // UUID
  email?: string;
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  role: 'learner' | 'admin' | string;
  is_active?: boolean;
  level?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
  reputation?: number;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
  metadata?: Record<string, any>;
}
