// User Mappers - Convert DB models sang DTOs

import { User, UserLearningProfile } from '../models/User';
import { UserDTO, UserProfileDTO, UserLearningProfileDTO } from '../dtos/user.dto';

export function mapUserToDTO(user: User): UserDTO {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    bio: user.bio,
    role: user.role,
    level: user.level,
    reputation: user.reputation,
    createdAt: user.created_at,
    lastLoginAt: user.last_login_at
  };
}

export function mapUserToProfileDTO(user: User): UserProfileDTO {
  return {
    ...mapUserToDTO(user),
    metadata: user.metadata
  };
}

export function mapLearningProfileToDTO(profile: UserLearningProfile): UserLearningProfileDTO {
  return {
    userId: profile.user_id,
    currentLevel: profile.current_level || 'beginner',
    weakTopics: profile.weak_topics,
    strongTopics: profile.strong_topics,
    currentStreakDays: profile.current_streak_days || 0,
    longestStreakDays: profile.longest_streak_days || 0,
    lastActivityDate: profile.last_activity_date
  };
}
