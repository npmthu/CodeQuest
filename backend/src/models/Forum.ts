// Forum model - forum posts and replies

// User info for joined data
export interface UserLite {
  id: string;
  display_name: string;
  avatar_url?: string;
  reputation?: number;
  level?: string;
}

// Problem info for joined data
export interface ProblemLite {
  id: string;
  title: string;
  slug: string;
  difficulty: string;
}

// Base model - match database schema
export interface ForumPost {
  id: string;
  author_id: string;
  title: string;
  content_markdown: string;
  related_problem_id?: string;
  upvotes: number;
  reply_count: number;
  has_accepted_answer: boolean;
  is_pinned: boolean;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

// API response with joined data (từ service layer)
export interface ForumPostWithAuthor extends ForumPost {
  author?: UserLite;
  problem?: ProblemLite;
}

export interface ForumReply {
  id: string;
  post_id: string;
  author_id: string;
  parent_reply_id?: string;
  content_markdown: string;
  code_snippet?: string;
  upvotes: number;
  is_accepted_answer: boolean;
  created_at: string;
  updated_at: string;
}

export interface ForumReplyWithAuthor extends ForumReply {
  author?: UserLite;
}

export interface ForumVote {
  id: string;
  user_id: string;
  votable_type: 'post' | 'reply';
  votable_id: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

// DTOs
export interface CreateForumPostDTO {
  author_id: string;
  title: string;
  content_markdown: string;
  related_problem_id?: string;
  tags?: string[];
}

export interface CreateReplyDTO {
  post_id: string;
  author_id: string;
  content_markdown: string;
  code_snippet?: string;
  parent_reply_id?: string;
}

export interface VoteDTO {
  user_id: string;
  votable_type: 'post' | 'reply';
  votable_id: string;
  vote_type: 'upvote' | 'downvote';
}
