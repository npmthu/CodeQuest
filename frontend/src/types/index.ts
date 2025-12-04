/**
 * Central type definitions for frontend
 * Re-exports all types from backend models to maintain single source of truth
 */

// Forum types
export type {
  ForumPost,
  ForumPostWithAuthor,
  ForumReply,
  ForumReplyWithAuthor,
  ForumVote,
  CreateForumPostDTO,
  CreateReplyDTO,
  VoteDTO,
  UserLite,
  ProblemLite
} from '../../../backend/src/models/Forum';

// Interview types
export type {
  InterviewSession,
  InterviewSessionWithUsers,
  InterviewFeedback,
  CreateInterviewSessionDTO,
  UpdateInterviewSessionDTO,
  CreateInterviewFeedbackDTO
} from '../../../backend/src/models/Interview';

// Note types
export type {
  Note,
  CreateNoteDTO,
  UpdateNoteDTO
} from '../../../backend/src/models/Note';

// Lesson types
export type {
  Lesson,
  LessonWithProgress
} from '../../../backend/src/models/Lesson';

// Problem types
export type {
  Problem,
  ProblemSummary,
  Hint,
  TestCaseResult,
  ExecutionResult
} from '../../../backend/src/models/Problem';

// Language types
export type {
  Language
} from '../../../backend/src/models/Language';

// TestCase types
export type {
  TestCase
} from '../../../backend/src/models/TestCase';

// User types (if you have a User model in backend)
// export type { User } from '../../../backend/src/models/User';

/**
 * Frontend-specific types (UI-only, not shared with backend)
 */

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

// Form states
export interface FormState<T = any> {
  values: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
}
