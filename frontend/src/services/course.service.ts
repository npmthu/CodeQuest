// Course Service - Gọi API backend và trả về typed data

import { ApiResponse } from '../interfaces/api.interface';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export interface Course {
  id: string;
  title: string;
  description?: string;
  difficulty?: string;
  instructor_id?: string;
  created_at?: string;
  updated_at?: string;
  topic_count?: number;
  lesson_count?: number;
}

export const courseService = {
  /**
   * Lấy danh sách courses
   */
  async getCourses(): Promise<Course[]> {
    const response = await fetch(`${API_BASE_URL}/courses`, {
      credentials: 'include'
    });
    const result: ApiResponse<Course[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch courses');
    }
    
    return result.data;
  },

  /**
   * Lấy chi tiết course
   */
  async getCourseById(courseId: string): Promise<Course> {
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      credentials: 'include'
    });
    const result: ApiResponse<Course> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch course');
    }
    
    return result.data;
  }
};
