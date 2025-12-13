// User DTOs - Contract giữa backend và frontend

export interface UserDTO {
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

export interface UserProfileDTO extends UserDTO {
  metadata?: Record<string, any>;
}

export interface UserLearningProfileDTO {
  userId: string;
  currentLevel: string;
  weakTopics?: any[];
  strongTopics?: any[];
  currentStreakDays: number;
  longestStreakDays: number;
  lastActivityDate?: string;
}

export interface CreateUserDTO {
  email: string;
  displayName?: string;
  role?: string;
}

export interface UpdateUserDTO {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
}
