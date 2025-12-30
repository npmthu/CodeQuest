// AI Service - Frontend service for AI-powered features

import { 
  SummaryResponse,
  MindmapResponse,
  GenerateSummaryRequest,
  GenerateMindmapRequest
} from '../interfaces/ai.interface';
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

export const aiService = {
  /**
   * Generate a summary from notebook content
   */
  async generateSummary(request: GenerateSummaryRequest): Promise<SummaryResponse> {
    const authHeaders = await getAuthHeaders();
    
    try {
      const response = await fetch(`${API_BASE_URL}/ai/summary`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        credentials: 'include',
        body: JSON.stringify(request)
      });
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the status text
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const result: ApiResponse<SummaryResponse> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || result.message || 'Failed to generate summary');
      }
      
      return result.data;
    } catch (error: any) {
      // Re-throw with more context if it's not already an Error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to generate summary: ${error.message || 'Unknown error'}`);
    }
  },

  /**
   * Generate a mindmap from notebook content
   */
  async generateMindmap(request: GenerateMindmapRequest): Promise<MindmapResponse> {
    const authHeaders = await getAuthHeaders();
    
    try {
      const response = await fetch(`${API_BASE_URL}/ai/mindmap`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders
        },
        credentials: 'include',
        body: JSON.stringify(request)
      });
      
      // Check if response is ok before parsing JSON
      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the status text
          const text = await response.text();
          errorMessage = text || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      const result: ApiResponse<{ mindmap: MindmapResponse }> = await response.json();
      
      if (!result.success || !result.data) {
        throw new Error(result.error || result.message || 'Failed to generate mindmap');
      }
      
      return result.data.mindmap;
    } catch (error: any) {
      // Re-throw with more context if it's not already an Error
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Failed to generate mindmap: ${error.message || 'Unknown error'}`);
    }
  }
};

