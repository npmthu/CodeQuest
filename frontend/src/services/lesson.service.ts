// Lesson Service - Gọi API backend và trả về typed data

import { Lesson, LessonWithProgress, UpdateLessonProgressRequest } from '../interfaces/lesson.interface';
import { ApiResponse } from '../interfaces/api.interface';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export const lessonService = {
  /**
   * Lấy danh sách lessons (có thể filter theo topicId)
   */
  async getLessons(topicId?: string): Promise<Lesson[]> {
    const url = new URL(`${API_BASE_URL}/lessons`);
    if (topicId) {
      url.searchParams.append('topicId', topicId);
    }
    
    const response = await fetch(url.toString(), {
      credentials: 'include'
    });
    const result: ApiResponse<Lesson[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch lessons');
    }
    
    return result.data;
  },

  /**
   * Lấy chi tiết một lesson (kèm progress nếu user đã login)
   */
  async getLessonById(lessonId: string): Promise<LessonWithProgress> {
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}`, {
      credentials: 'include'
    });
    const result: ApiResponse<LessonWithProgress> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch lesson');
    }
    
    return result.data;
  },

  /**
   * Cập nhật progress của lesson
   */
  async updateProgress(
    lessonId: string, 
    data: UpdateLessonProgressRequest
  ): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/lessons/${lessonId}/progress`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    const result: ApiResponse<any> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to update progress');
    }
  }
};
