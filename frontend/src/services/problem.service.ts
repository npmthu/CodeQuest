// Problem Service - Gọi API backend và trả về typed data

import { Problem, ProblemDetail, ProblemListItem } from '../interfaces/problem.interface';
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

export const problemService = {
  /**
   * Lấy danh sách problems
   */
  async getProblems(): Promise<ProblemListItem[]> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/problems`, {
      credentials: 'include',
      headers: authHeaders
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
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/problems/${problemId}`, {
      credentials: 'include',
      headers: authHeaders
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
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/problems/slug/${slug}`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<ProblemDetail> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch problem');
    }
    
    return result.data;
  }
};
