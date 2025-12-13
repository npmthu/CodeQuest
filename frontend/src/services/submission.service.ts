// Submission Service - Gọi API backend và trả về typed data

import { 
  Submission, 
  SubmissionListItem, 
  CreateSubmissionRequest,
  SubmissionResult 
} from '../interfaces/submission.interface';
import { ApiResponse } from '../interfaces/api.interface';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export const submissionService = {
  /**
   * Tạo submission mới
   */
  async createSubmission(data: CreateSubmissionRequest): Promise<SubmissionResult> {
    const response = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
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
      
    const response = await fetch(url, {
      credentials: 'include'
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
    const response = await fetch(`${API_BASE_URL}/submissions/${submissionId}`, {
      credentials: 'include'
    });
    const result: ApiResponse<Submission> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch submission');
    }
    
    return result.data;
  }
};
