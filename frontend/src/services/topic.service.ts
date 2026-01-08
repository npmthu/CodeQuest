// Topic Service - Gọi API backend và trả về typed data

import { Topic, TopicWithLessons } from '../interfaces/topic.interface';
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

export const topicService = {
  /**
   * Lấy danh sách topics
   */
  async getTopics(): Promise<Topic[]> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/topics`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<Topic[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch topics');
    }
    
    return result.data;
  },

  /**
   * Lấy chi tiết topic kèm lessons
   */
  async getTopicById(topicId: string): Promise<TopicWithLessons> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<TopicWithLessons> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch topic');
    }
    
    return result.data;
  }
};
