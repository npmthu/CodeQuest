import { supabaseAdmin } from '../config/database';
import type { ForumPost, ForumReply } from '../models/Forum';

/**
 * List forum posts with optional tag filter
 * @param limit - Maximum number of posts to return
 * @param tag - Optional tag to filter by (filters posts containing this tag in their tags array)
 */
export async function listForumPosts(limit = 50, tag?: string): Promise<any[]> {
  let query = supabaseAdmin
    .from('forum_posts')
    .select(`
      id,
      author_id,
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
      author:users!author_id(id, display_name, avatar_url, reputation, level, email),
      problem:problems!related_problem_id(id, title, slug, difficulty)
    `);

  // Apply tag filter if provided
  // The 'tags' column is JSONB array, use @> operator to check if array contains the tag
  if (tag && tag.trim() !== '') {
    // For JSONB array containment in Supabase, we need to use the 'contains' filter
    // This checks if the tags array contains the specified tag
    query = query.contains('tags', [tag]);
  }

  query = query
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  const { data: posts, error } = await query;

  if (error) {
    console.error('Error listing forum posts:', error);
    throw error;
  }

  return posts || [];
}

/**
 * Get single forum post with replies
 */
export async function getForumPost(id: string): Promise<any | null> {
  // Get post
  const { data: post, error: postError } = await supabaseAdmin
    .from('forum_posts')
    .select(`
      id,
      author_id,
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
      author:users!author_id(id, display_name, avatar_url, reputation, level, email),
      problem:problems!related_problem_id(id, title, slug, difficulty)
    `)
    .eq('id', id)
    .single();

  if (postError) {
    if (postError.code === 'PGRST116') {
      return null;
    }
    console.error('Error getting forum post:', postError);
    throw postError;
  }

  // Get replies
  const { data: replies, error: repliesError } = await supabaseAdmin
    .from('forum_replies')
    .select(`
      id,
      author_id,
      content_markdown,
      code_snippet,
      upvotes,
      is_accepted_answer,
      created_at,
      updated_at,
      parent_reply_id,
      author:users!author_id(id, display_name, avatar_url, reputation, level, email)
    `)
    .eq('post_id', id)
    .order('is_accepted_answer', { ascending: false })
    .order('created_at', { ascending: true });

  if (repliesError) {
    console.error('Error getting replies:', repliesError);
    throw repliesError;
  }

  return {
    ...post,
    replies: replies || []
  };
}

/**
 * Create a new forum post
 */
export async function createForumPost(payload: Partial<ForumPost>): Promise<ForumPost> {
  const { data: post, error } = await supabaseAdmin
    .from('forum_posts')
    .insert([payload])
    .select(`
      id,
      author_id,
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
      author:users!author_id(id, display_name, avatar_url, reputation, level, email),
      problem:problems!related_problem_id(id, title, slug, difficulty)
    `)
    .single();

  if (error) {
    console.error('Error creating forum post:', error);
    throw error;
  }

  return post as ForumPost;
}

/**
 * Create a reply to a forum post
 */
export async function createReply(payload: Partial<ForumReply>, postId: string): Promise<ForumReply> {
  const { data: reply, error } = await supabaseAdmin
    .from('forum_replies')
    .insert([payload])
    .select(`
      id,
      post_id,
      author_id,
      parent_reply_id,
      content_markdown,
      code_snippet,
      upvotes,
      is_accepted_answer,
      created_at,
      updated_at,
      author:users!author_id(id, display_name, avatar_url, reputation, level, email)
    `)
    .single();

  if (error) {
    console.error('Error creating reply:', error);
    throw error;
  }

  return reply as ForumReply;
}

/**
 * Increment reply count for a post
 */
export async function incrementReplyCount(postId: string): Promise<void> {
  const { data: post } = await supabaseAdmin
    .from('forum_posts')
    .select('reply_count')
    .eq('id', postId)
    .single();

  if (post) {
    const { error } = await supabaseAdmin
      .from('forum_posts')
      .update({ reply_count: (post.reply_count || 0) + 1 })
      .eq('id', postId);

    if (error) {
      console.error('Error incrementing reply count:', error);
      throw error;
    }
  }
}

/**
 * Get user's votes for a post and its replies
 */
export async function getUserVotesForPost(userId: string, postId: string): Promise<{
  postVote: string | null;
  replyVotes: Record<string, string>;
}> {
  // First get all reply IDs for this post
  const { data: replies } = await supabaseAdmin
    .from('forum_replies')
    .select('id')
    .eq('post_id', postId);

  const replyIds = replies?.map(r => r.id) || [];

  // Get all votes by user for this post (direct vote on post)
  const { data: postVotes } = await supabaseAdmin
    .from('forum_votes')
    .select('vote_type')
    .eq('user_id', userId)
    .eq('votable_type', 'post')
    .eq('votable_id', postId);

  // Get all votes by user for replies of this post
  const { data: replyVotesData } = replyIds.length > 0 
    ? await supabaseAdmin
        .from('forum_votes')
        .select('votable_id, vote_type')
        .eq('user_id', userId)
        .eq('votable_type', 'reply')
        .in('votable_id', replyIds)
    : { data: [] };

  const postVote = postVotes?.[0]?.vote_type || null;
  const replyVotes: Record<string, string> = {};
  replyVotesData?.forEach(v => {
    replyVotes[v.votable_id] = v.vote_type;
  });

  return { postVote, replyVotes };
}

/**
 * Record or update a vote
 */
export const voteForumItem = async (
  userId: string,
  votableType: 'post' | 'reply',
  votableId: string,
  voteType: 'upvote' | 'downvote'
) => {
  // Check existing vote
  const { data: existingVote } = await supabaseAdmin
    .from('forum_votes')
    .select('*')
    .eq('user_id', userId)
    .eq('votable_type', votableType)
    .eq('votable_id', votableId)
    .maybeSingle();

  const table = votableType === 'post' ? 'forum_posts' : 'forum_replies';

  // If same vote type exists → toggle off (remove)
  if (existingVote?.vote_type === voteType) {
    await supabaseAdmin
      .from('forum_votes')
      .delete()
      .match({ user_id: userId, votable_type: votableType, votable_id: votableId });

    // Decrement upvotes
    const { data: item } = await supabaseAdmin
      .from(table)
      .select('upvotes')
      .eq('id', votableId)
      .single();

    if (item) {
      await supabaseAdmin
        .from(table)
        .update({ upvotes: Math.max(0, (item.upvotes || 0) - 1) })
        .eq('id', votableId);
    }

    return { action: 'removed', upvotes: -1 };
  }

  // Insert/update vote
  const { data: voteData, error: voteError } = await supabaseAdmin
    .from('forum_votes')
    .upsert({
      user_id: userId,
      votable_type: votableType,
      votable_id: votableId,
      vote_type: voteType,
      created_at: new Date().toISOString()
    });

  if (voteError) {
    console.error('Error upserting vote:', voteError);
    throw voteError;
  }

  console.log('Vote upserted:', { userId, votableType, votableId, voteType });

  // If new vote (no existing), increment upvotes
  if (!existingVote) {
    const { data: item } = await supabaseAdmin
      .from(table)
      .select('upvotes')
      .eq('id', votableId)
      .single();

    if (item) {
      const newUpvotes = (item.upvotes || 0) + 1;
      const { error: updateError } = await supabaseAdmin
        .from(table)
        .update({ upvotes: newUpvotes })
        .eq('id', votableId);

      if (updateError) {
        console.error('Error updating upvotes:', updateError);
        throw updateError;
      }

      console.log(`Updated ${table} upvotes:`, { votableId, newUpvotes });
      return { action: 'added', upvotes: newUpvotes };
    }
  }

  return { action: 'changed', upvotes: 0 };
};

/**
 * Get forum post by ID (without full details)
 */
export async function getForumPostById(id: string): Promise<any | null> {
  const { data, error } = await supabaseAdmin
    .from('forum_posts')
    .select('id, author_id, title')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Get reply by ID
 */
export async function getReplyById(id: string): Promise<any | null> {
  const { data, error } = await supabaseAdmin
    .from('forum_replies')
    .select('id, author_id, post_id')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return data;
}

/**
 * Delete forum post and all its replies
 */
export async function deleteForumPost(id: string): Promise<void> {
  // Delete all votes for this post
  await supabaseAdmin
    .from('forum_votes')
    .delete()
    .eq('votable_type', 'post')
    .eq('votable_id', id);

  // Delete all votes for replies of this post
  const { data: replies } = await supabaseAdmin
    .from('forum_replies')
    .select('id')
    .eq('post_id', id);

  if (replies && replies.length > 0) {
    const replyIds = replies.map(r => r.id);
    await supabaseAdmin
      .from('forum_votes')
      .delete()
      .in('votable_id', replyIds)
      .eq('votable_type', 'reply');
  }

  // Delete all replies
  await supabaseAdmin
    .from('forum_replies')
    .delete()
    .eq('post_id', id);

  // Delete the post
  const { error } = await supabaseAdmin
    .from('forum_posts')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

/**
 * Delete reply and update reply count
 */
export async function deleteReply(id: string, postId: string): Promise<void> {
  // Delete votes for this reply
  await supabaseAdmin
    .from('forum_votes')
    .delete()
    .eq('votable_type', 'reply')
    .eq('votable_id', id);

  // Delete nested replies recursively
  const { data: nestedReplies } = await supabaseAdmin
    .from('forum_replies')
    .select('id, post_id')
    .eq('parent_reply_id', id);

  if (nestedReplies && nestedReplies.length > 0) {
    for (const nested of nestedReplies) {
      await deleteReply(nested.id, nested.post_id);
    }
  }

  // Delete the reply
  const { error } = await supabaseAdmin
    .from('forum_replies')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }

  // Decrement reply count
  await decrementReplyCount(postId);
}

/**
 * Decrement reply count for a post
 */
async function decrementReplyCount(postId: string): Promise<void> {
  const { data: post } = await supabaseAdmin
    .from('forum_posts')
    .select('reply_count')
    .eq('id', postId)
    .single();

  if (post) {
    await supabaseAdmin
      .from('forum_posts')
      .update({ reply_count: Math.max(0, (post.reply_count || 0) - 1) })
      .eq('id', postId);
  }
}
