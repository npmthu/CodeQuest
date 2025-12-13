// Problem Service - Gọi API backend và trả về typed data

import { Problem, ProblemDetail, ProblemListItem } from '../interfaces/problem.interface';
import { ApiResponse } from '../interfaces/api.interface';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const problemService = {
  /**
   * Lấy danh sách problems
   */
  async getProblems(): Promise<ProblemListItem[]> {
    const response = await fetch(`${API_BASE_URL}/problems`, {
      credentials: 'include'
    });
    const result: ApiResponse<ProblemListItem[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch problems');
    }
    
    return result.data;
  },

  /**
   * Lấy chi tiết một problem
   */
  async getProblemById(problemId: string): Promise<ProblemDetail> {
    const response = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
      credentials: 'include'
    });
    const result: ApiResponse<ProblemDetail> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch problem');
    }
    
    return result.data;
  },

  /**
   * Lấy problem theo slug
   */
  async getProblemBySlug(slug: string): Promise<ProblemDetail> {
    const response = await fetch(`${API_BASE_URL}/problems/slug/${slug}`, {
      credentials: 'include'
    });
    const result: ApiResponse<ProblemDetail> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch problem');
    }
    
    return result.data;
  }
};
