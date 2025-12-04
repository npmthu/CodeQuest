import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as forumService from '../services/forumService';

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

    const { title, content_markdown, related_problem_id, tags } = req.body;

    if (!title || !content_markdown) {
      return res.status(400).json({ success: false, error: 'Title and content are required' });
    }

    const post = await forumService.createForumPost({
      author_id: userId,
      title,
      content_markdown,
      related_problem_id,
      tags
    });

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
    const { content_markdown, code_snippet, parent_reply_id } = req.body;

    if (!content_markdown) {
      return res.status(400).json({ success: false, error: 'Content is required' });
    }

    const reply = await forumService.createReply({
      post_id: postId,
      author_id: userId,
      content_markdown,
      code_snippet,
      parent_reply_id
    });

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

    const { votable_type, votable_id, vote_type } = req.body;

    if (!votable_type || !votable_id || !vote_type) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const result = await forumService.voteForumItem(
      userId,
      votable_type,
      votable_id,
      vote_type
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
