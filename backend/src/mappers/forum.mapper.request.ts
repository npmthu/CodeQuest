// Forum Request Mappers - DTO → DB Entity

import { ForumPost, ForumReply } from '../models/Forum';
import { CreateForumPostDTO, CreateForumReplyDTO } from '../dtos/forum.dto';

export function mapCreateForumPostDTOToEntity(dto: CreateForumPostDTO, authorId: string): Partial<ForumPost> {
  return {
    author_id: authorId,
    title: dto.title,
    content_markdown: dto.contentMarkdown,
    related_problem_id: dto.relatedProblemId,
    tags: dto.tags,
    upvotes: 0,
    reply_count: 0,
    has_accepted_answer: false,
    is_pinned: false
  };
}

export function mapCreateForumReplyDTOToEntity(dto: CreateForumReplyDTO, postId: string, authorId: string): Partial<ForumReply> {
  return {
    post_id: postId,
    author_id: authorId,
    parent_reply_id: dto.parentReplyId,
    content_markdown: dto.contentMarkdown,
    code_snippet: dto.codeSnippet,
    upvotes: 0,
    is_accepted_answer: false
  };
}
