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
  thumbnail_url?: string;
  isEnrolled?: boolean;
}

export interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  status: 'enrolled' | 'completed' | 'dropped';
  enrolled_at: string;
  completed_at?: string;
  progress: any;
  course?: Course;
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
  },

  /**
   * Get user's enrolled courses
   */
  async getMyEnrollments(): Promise<Enrollment[]> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/enrollments`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<Enrollment[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch enrollments');
    }
    
    return result.data;
  },

  /**
   * Enroll in a course
   */
  async enrollInCourse(courseId: string): Promise<Enrollment> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/enrollments/${courseId}`, {
      method: 'POST',
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<Enrollment> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to enroll in course');
    }
    
    return result.data;
  },

  /**
   * Check if user is enrolled in a course
   */
  async checkEnrollment(courseId: string): Promise<{ enrolled: boolean; enrollment: any }> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/enrollments/check/${courseId}`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<{ enrolled: boolean; enrollment: any }> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to check enrollment');
    }
    
    return result.data;
  },

  /**
   * Unenroll from a course
   */
  async unenrollFromCourse(courseId: string): Promise<void> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/enrollments/${courseId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<any> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to unenroll from course');
    }
  }
};
