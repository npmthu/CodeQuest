// Quiz Service - Gọi API backend và trả về typed data

import { 
  Quiz, 
  QuizDetail, 
  QuizResult,
  SubmitQuizRequest 
} from '../interfaces/quiz.interface';
import { ApiResponse } from '../interfaces/api.interface';
import { supabase } from '../../lib/supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

/**
 * Helper: Get Authorization header with current Supabase token
 */
async function getAuthHeaders(): Promise<Record<string, string>> {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data?.session?.access_token;
    if (token) {
      return { 'Authorization': `Bearer ${token}` };
    }
  } catch (err) {
    console.warn('Failed to get auth token:', err);
  }
  return {};
}

export const quizService = {
  /**
   * Lấy danh sách quizzes
   */
  async getQuizzes(topicId?: string): Promise<Quiz[]> {
    const url = new URL(`${API_BASE_URL}/quizzes`);
    if (topicId) {
      url.searchParams.append('topicId', topicId);
    }
    
    const authHeaders = await getAuthHeaders();
    const response = await fetch(url.toString(), {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<Quiz[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch quizzes');
    }
    
    return result.data;
  },

  /**
   * Lấy chi tiết quiz kèm questions
   */
  async getQuizById(quizId: string): Promise<QuizDetail> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<QuizDetail> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch quiz');
    }
    
    return result.data;
  },

  /**
   * Submit quiz answers
   */
  async submitQuiz(quizId: string, data: SubmitQuizRequest): Promise<QuizResult> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    const result: ApiResponse<QuizResult> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to submit quiz');
    }
    
    return result.data;
  }
};
