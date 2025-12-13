// Course Service - Gọi API backend và trả về typed data

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
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/courses`, {
      credentials: 'include',
      headers: authHeaders
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
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/courses/${courseId}`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<Course> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch course');
    }
    
    return result.data;
  }
};
