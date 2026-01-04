// Forum Service - Gọi API backend và trả về typed data

import { 
  ForumPost,
  ForumPostWithAuthor,
  ForumReplyWithAuthor,
  CreateForumPostRequest,
  CreateForumReplyRequest
} from '../interfaces/forum.interface';
import { ApiResponse } from '../interfaces/api.interface';
import { supabase } from '../../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) return { 'Authorization': `Bearer ${token}` };
  } catch (err) {
    console.warn('Failed to get auth token:', err);
  }
  return {};
}

export const forumService = {
  /**
   * Lấy danh sách forum posts với optional tag filter
   * @param tag - Optional tag to filter posts by
   */
  async getPosts(tag?: string): Promise<ForumPostWithAuthor[]> {
    const authHeaders = await getAuthHeaders();
    
    // Build URL with query parameters
    const url = new URL(`${API_BASE_URL}/forum/posts`);
    if (tag && tag.trim() !== '' && tag.toLowerCase() !== 'all') {
      url.searchParams.set('tag', tag);
    }
    
    const response = await fetch(url.toString(), {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<ForumPostWithAuthor[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch posts');
    }
    
    return result.data;
  },

  /**
   * Lấy chi tiết một post kèm replies
   */
  async getPostById(postId: string): Promise<ForumPostWithAuthor> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<ForumPostWithAuthor> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch post');
    }
    
    return result.data;
  },

  /**
   * Tạo post mới
   */
  async createPost(data: CreateForumPostRequest): Promise<ForumPost> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/forum/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    const result: ApiResponse<ForumPost> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create post');
    }
    
    return result.data;
  },

  /**
   * Lấy replies của một post
   */
  async getReplies(postId: string): Promise<ForumReplyWithAuthor[]> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/replies`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<ForumReplyWithAuthor[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch replies');
    }
    
    return result.data;
  },

  /**
   * Tạo reply mới
   */
  async createReply(postId: string, data: CreateForumReplyRequest): Promise<void> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    const result: ApiResponse<any> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to create reply');
    }
  }
};
