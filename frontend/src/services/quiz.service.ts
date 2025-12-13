// Quiz Service - Gọi API backend và trả về typed data

import { 
  Quiz, 
  QuizDetail, 
  QuizResult,
  SubmitQuizRequest 
} from '../interfaces/quiz.interface';
import { ApiResponse } from '../interfaces/api.interface';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const quizService = {
  /**
   * Lấy danh sách quizzes
   */
  async getQuizzes(topicId?: string): Promise<Quiz[]> {
    const url = new URL(`${API_BASE_URL}/quizzes`);
    if (topicId) {
      url.searchParams.append('topicId', topicId);
    }
    
    const response = await fetch(url.toString(), {
      credentials: 'include'
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
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`, {
      credentials: 'include'
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
    const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
