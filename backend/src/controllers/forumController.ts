import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as forumService from '../services/forumService';
import { mapCreateForumPostDTOToEntity, mapCreateForumReplyDTOToEntity } from '../mappers/forum.mapper.request';
import type { CreateForumPostDTO, CreateForumReplyDTO } from '../dtos/forum.dto';

/**
 * List forum posts
 * GET /api/forum/posts
 */
export const listForumPosts = async (req: AuthRequest, res: Response) => {
  try {
    const posts = await forumService.listForumPosts();
    return res.json({ success: true, data: posts });
  } catch (error: any) {
    console.error('Error listing forum posts:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single forum post with replies
 * GET /api/forum/posts/:id
 */
export const getForumPost = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const post = await forumService.getForumPost(id);

    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    return res.json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error getting forum post:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create forum post
 * POST /api/forum/posts
 */
export const createForumPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Accept camelCase from frontend
    const createDTO: CreateForumPostDTO = {
      title: req.body.title,
      contentMarkdown: req.body.contentMarkdown,
      relatedProblemId: req.body.relatedProblemId,
      tags: req.body.tags
    };

    if (!createDTO.title || !createDTO.contentMarkdown) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    // Map DTO to DB entity (snake_case)
    const entityData = mapCreateForumPostDTOToEntity(createDTO, userId);

    const post = await forumService.createForumPost(entityData);

    return res.status(201).json({ success: true, data: post });
  } catch (error: any) {
    console.error('Error creating forum post:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create reply
 * POST /api/forum/posts/:id/replies
 */
export const createReply = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id: postId } = req.params;
    
    // Accept camelCase from frontend
    const replyDTO: CreateForumReplyDTO = {
      contentMarkdown: req.body.contentMarkdown,
      codeSnippet: req.body.codeSnippet,
      parentReplyId: req.body.parentReplyId
    };

    if (!replyDTO.contentMarkdown) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    // Map DTO to DB entity (snake_case)
    const entityData = mapCreateForumReplyDTOToEntity(replyDTO, postId, userId);

    const reply = await forumService.createReply(entityData, postId);

    // Increment reply count
    await forumService.incrementReplyCount(postId);

    return res.status(201).json({ success: true, data: reply });
  } catch (error: any) {
    console.error('Error creating reply:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get user's votes for a post
 * GET /api/forum/posts/:id/votes
 */
export const getUserVotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id: postId } = req.params;
    const votes = await forumService.getUserVotesForPost(userId, postId);

    return res.json({ success: true, data: votes });
  } catch (error: any) {
    console.error('Error getting user votes:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Vote on post/reply
 * POST /api/forum/vote
 */
export const voteForumItem = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Accept camelCase from frontend
    const votableType = req.body.votableType;
    const votableId = req.body.votableId;
    const voteType = req.body.voteType;

    if (!votableType || !votableId || !voteType) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = await forumService.voteForumItem(
      userId,
      votableType,
      votableId,
      voteType
    );

    return res.json({ success: true, message: 'Vote recorded', data: result });
  } catch (error: any) {
    console.error('Error voting:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete forum post
 * DELETE /api/forum/posts/:id
 */
export const deleteForumPost = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Check if user owns the post or is admin
    const post = await forumService.getForumPostById(id);
    if (!post) {
      return res.status(404).json({ success: false, error: 'Post not found' });
    }

    if (post.author_id !== userId) {
      return res.status(403).json({ success: false, error: 'You can only delete your own posts' });
    }

    await forumService.deleteForumPost(id);

    return res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting forum post:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Delete reply
 * DELETE /api/forum/replies/:id
 */
export const deleteReply = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;

    // Check if user owns the reply or is admin
    const reply = await forumService.getReplyById(id);
    if (!reply) {
      return res.status(404).json({ success: false, error: 'Reply not found' });
    }

    if (reply.author_id !== userId) {
      return res.status(403).json({ success: false, error: 'You can only delete your own replies' });
    }

    await forumService.deleteReply(id, reply.post_id);

    return res.json({ success: true, message: 'Reply deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting reply:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
