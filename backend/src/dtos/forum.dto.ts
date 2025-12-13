// Forum DTOs - Contract giữa backend và frontend

export interface ForumPostDTO {
  id: string;
  authorId: string;
  title: string;
  contentMarkdown: string;
  relatedProblemId?: string;
  upvotes: number;
  replyCount: number;
  hasAcceptedAnswer: boolean;
  isPinned: boolean;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ForumPostWithAuthorDTO extends ForumPostDTO {
  author: AuthorDTO;
  problem?: ProblemSummaryDTO;
}

export interface ForumReplyDTO {
  id: string;
  postId: string;
  authorId: string;
  parentReplyId?: string;
  contentMarkdown: string;
  codeSnippet?: any;
  upvotes: number;
  isAcceptedAnswer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ForumReplyWithAuthorDTO extends ForumReplyDTO {
  author: AuthorDTO;
}

export interface AuthorDTO {
  id: string;
  displayName: string;
  avatarUrl?: string;
  reputation: number;
  level?: string;
}

export interface ProblemSummaryDTO {
  id: string;
  title: string;
  slug: string;
  difficulty: number;
}

export interface CreateForumPostDTO {
  title: string;
  contentMarkdown: string;
  relatedProblemId?: string;
  tags?: string[];
}

export interface CreateForumReplyDTO {
  contentMarkdown: string;
  parentReplyId?: string;
  codeSnippet?: any;
}

export interface VoteDTO {
  voteType: 'upvote' | 'downvote';
}
