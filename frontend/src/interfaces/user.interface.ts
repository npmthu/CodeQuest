// Frontend User Interfaces - Mirror của backend DTOs

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  role: string;
  level?: string;
  reputation?: number;
  createdAt?: string;
  lastLoginAt?: string;
}

export interface UserProfile extends User {
  metadata?: Record<string, any>;
}

export interface UserLearningProfile {
  userId: string;
  currentLevel: string;
  weakTopics?: any[];
  strongTopics?: any[];
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityDate?: string;
}

export interface UpdateUserRequest {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}
