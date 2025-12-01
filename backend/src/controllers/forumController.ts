import { Response } from 'express';
import { supabaseAdmin } from '../config/database';
import { AuthRequest } from '../middleware/auth';

/**
 * List forum posts
 * GET /api/forum/posts
 */
export const listForumPosts = async (req: AuthRequest, res: Response) => {
  try {
    const { data: posts, error } = await supabaseAdmin
      .from('forum_posts')
      .select(`
        id,
        title,
        content_markdown,
        related_problem_id,
        upvotes,
        reply_count,
        has_accepted_answer,
        is_pinned,
        tags,
        created_at,
        updated_at,
        author:users!author_id(id, display_name, avatar_url, reputation, level),
        problem:problems!related_problem_id(id, title, slug, difficulty)
      `)
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return res.json({ success: true, data: posts || [] });
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

    // Get post
    const { data: post, error: postError } = await supabaseAdmin
      .from('forum_posts')
      .select(`
        id,
        title,
        content_markdown,
        related_problem_id,
        upvotes,
        reply_count,
        has_accepted_answer,
        is_pinned,
        tags,
        created_at,
        updated_at,
        author:users!author_id(id, display_name, avatar_url, reputation, level),
        problem:problems!related_problem_id(id, title, slug, difficulty)
      `)
      .eq('id', id)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      throw postError;
    }

    // Get replies
    const { data: replies, error: repliesError } = await supabaseAdmin
      .from('forum_replies')
      .select(`
        id,
        content_markdown,
        code_snippet,
        upvotes,
        is_accepted_answer,
        created_at,
        updated_at,
        parent_reply_id,
        author:users!author_id(id, display_name, avatar_url, reputation, level)
      `)
      .eq('post_id', id)
      .order('is_accepted_answer', { ascending: false })
      .order('created_at', { ascending: true });

    if (repliesError) throw repliesError;

    return res.json({
      success: true,
      data: {
        ...post,
        replies: replies || []
      }
    });
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

    const { data: post, error } = await supabaseAdmin
      .from('forum_posts')
      .insert([{
        author_id: userId,
        title,
        content_markdown,
        related_problem_id,
        tags
      }])
      .select()
      .single();

    if (error) throw error;

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

    const { data: reply, error } = await supabaseAdmin
      .from('forum_replies')
      .insert([{
        post_id: postId,
        author_id: userId,
        content_markdown,
        code_snippet,
        parent_reply_id
      }])
      .select()
      .single();

    if (error) throw error;

    // Increment reply count
    const { data: post } = await supabaseAdmin
      .from('forum_posts')
      .select('reply_count')
      .eq('id', postId)
      .single();

    if (post) {
      await supabaseAdmin
        .from('forum_posts')
        .update({ reply_count: (post.reply_count || 0) + 1 })
        .eq('id', postId);
    }

    return res.status(201).json({ success: true, data: reply });
  } catch (error: any) {
    console.error('Error creating reply:', error);
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

    // Upsert vote
    const { error } = await supabaseAdmin
      .from('forum_votes')
      .upsert([{
        user_id: userId,
        votable_type,
        votable_id,
        vote_type
      }], { onConflict: 'user_id,votable_type,votable_id' });

    if (error) throw error;

    return res.json({ success: true, message: 'Vote recorded' });
  } catch (error: any) {
    console.error('Error voting:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
