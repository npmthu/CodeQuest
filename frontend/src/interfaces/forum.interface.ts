// Frontend Forum Interfaces - Mirror của backend DTOs

import { ProblemSummary } from "./problem.interface";

export interface ForumPost {
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

export interface ForumPostWithAuthor extends ForumPost {
  author: Author;
  problem?: ProblemSummary;
}

export interface ForumReply {
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

export interface ForumReplyWithAuthor extends ForumReply {
  author: Author;
}

export interface Author {
  id: string;
  displayName: string;
  avatarUrl?: string;
  reputation: number;
  level?: string;
}

export interface CreateForumPostRequest {
  title: string;
  contentMarkdown: string;
  relatedProblemId?: string;
  tags?: string[];
}

export interface CreateForumReplyRequest {
  contentMarkdown: string;
  parentReplyId?: string;
  codeSnippet?: any;
}
