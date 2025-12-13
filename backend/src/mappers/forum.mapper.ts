// Forum Mappers - Convert DB models sang DTOs

import { ForumPost, ForumReply } from '../models/Forum';
import { User } from '../models/User';
import { Problem } from '../models/Problem';
import {
  ForumPostDTO,
  ForumPostWithAuthorDTO,
  ForumReplyDTO,
  ForumReplyWithAuthorDTO,
  AuthorDTO,
  ProblemSummaryDTO
} from '../dtos/forum.dto';

export function mapForumPostToDTO(post: ForumPost): ForumPostDTO {
  return {
    id: post.id,
    authorId: post.author_id,
    title: post.title,
    contentMarkdown: post.content_markdown,
    relatedProblemId: post.related_problem_id,
    upvotes: post.upvotes,
    replyCount: post.reply_count,
    hasAcceptedAnswer: post.has_accepted_answer,
    isPinned: post.is_pinned,
    tags: post.tags,
    createdAt: post.created_at,
    updatedAt: post.updated_at
  };
}

export function mapForumPostWithAuthorToDTO(
  post: ForumPost,
  author: User,
  problem?: Problem
): ForumPostWithAuthorDTO {
  return {
    ...mapForumPostToDTO(post),
    author: mapUserToAuthorDTO(author),
    problem: problem ? mapProblemToSummaryDTO(problem) : undefined
  };
}

export function mapForumReplyToDTO(reply: ForumReply): ForumReplyDTO {
  return {
    id: reply.id,
    postId: reply.post_id,
    authorId: reply.author_id,
    parentReplyId: reply.parent_reply_id,
    contentMarkdown: reply.content_markdown,
    codeSnippet: reply.code_snippet,
    upvotes: reply.upvotes,
    isAcceptedAnswer: reply.is_accepted_answer,
    createdAt: reply.created_at,
    updatedAt: reply.updated_at
  };
}

export function mapForumReplyWithAuthorToDTO(
  reply: ForumReply,
  author: User
): ForumReplyWithAuthorDTO {
  return {
    ...mapForumReplyToDTO(reply),
    author: mapUserToAuthorDTO(author)
  };
}

export function mapUserToAuthorDTO(user: User): AuthorDTO {
  return {
    id: user.id,
    displayName: user.display_name || 'Anonymous',
    avatarUrl: user.avatar_url,
    reputation: user.reputation || 0,
    level: user.level
  };
}

export function mapProblemToSummaryDTO(problem: Problem): ProblemSummaryDTO {
  return {
    id: problem.id,
    title: problem.title,
    slug: problem.slug,
    difficulty: problem.difficulty
  };
}
