// Topic Service - Gọi API backend và trả về typed data

import { Topic, TopicWithLessons } from '../interfaces/topic.interface';
import { ApiResponse } from '../interfaces/api.interface';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export const topicService = {
  /**
   * Lấy danh sách topics
   */
  async getTopics(): Promise<Topic[]> {
    const response = await fetch(`${API_BASE_URL}/topics`, {
      credentials: 'include'
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
    const response = await fetch(`${API_BASE_URL}/topics/${topicId}`, {
      credentials: 'include'
    });
    const result: ApiResponse<TopicWithLessons> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch topic');
    }
    
    return result.data;
  }
};
