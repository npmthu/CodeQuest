// Forum Service - Gọi API backend và trả về typed data

import { 
  ForumPost,
  ForumPostWithAuthor,
  ForumReplyWithAuthor,
  CreateForumPostRequest,
  CreateForumReplyRequest
} from '../interfaces/forum.interface';
import { ApiResponse } from '../interfaces/api.interface';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export const forumService = {
  /**
   * Lấy danh sách forum posts
   */
  async getPosts(): Promise<ForumPostWithAuthor[]> {
    const response = await fetch(`${API_BASE_URL}/forum/posts`, {
      credentials: 'include'
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
    const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}`, {
      credentials: 'include'
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
    const response = await fetch(`${API_BASE_URL}/forum/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
    const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/replies`, {
      credentials: 'include'
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
    const response = await fetch(`${API_BASE_URL}/forum/posts/${postId}/replies`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
