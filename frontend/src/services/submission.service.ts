// Submission Service - Gọi API backend và trả về typed data

import { 
  Submission, 
  SubmissionListItem, 
  CreateSubmissionRequest,
  SubmissionResult 
} from '../interfaces/submission.interface';
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

export const submissionService = {
  /**
   * Tạo submission mới
   */
  async createSubmission(data: CreateSubmissionRequest): Promise<SubmissionResult> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    const result: ApiResponse<SubmissionResult> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to create submission');
    }
    
    return result.data;
  },

  /**
   * Lấy danh sách submissions của user
   */
  async getUserSubmissions(userId?: string): Promise<SubmissionListItem[]> {
    const url = userId 
      ? `${API_BASE_URL}/submissions/user/${userId}`
      : `${API_BASE_URL}/submissions/me`;
      
    const authHeaders = await getAuthHeaders();
    const response = await fetch(url, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<SubmissionListItem[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch submissions');
    }
    
    return result.data;
  },

  /**
   * Lấy chi tiết một submission
   */
  async getSubmissionById(submissionId: string): Promise<Submission> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<Submission> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch submission');
    }
    
    return result.data;
  }
};
