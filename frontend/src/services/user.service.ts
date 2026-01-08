// User Service - Gọi API backend và trả về typed data

import { User, UserProfile, UpdateUserRequest } from '../interfaces/user.interface';
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

export const userService = {
  /**
   * Lấy danh sách users
   */
  async getUsers(): Promise<User[]> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<User[]> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch users');
    }
    
    return result.data;
  },

  /**
   * Lấy thông tin một user
   */
  async getUserById(userId: string): Promise<UserProfile> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<UserProfile> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch user');
    }
    
    return result.data;
  },

  /**
   * Cập nhật profile user hiện tại
   */
  async updateProfile(data: UpdateUserRequest): Promise<UserProfile> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...authHeaders
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    const result: ApiResponse<UserProfile> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to update profile');
    }
    
    return result.data;
  },

  /**
   * Lấy profile của user đang đăng nhập
   */
  async getCurrentUser(): Promise<UserProfile> {
    const authHeaders = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      credentials: 'include',
      headers: authHeaders
    });
    const result: ApiResponse<UserProfile> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch current user');
    }
    
    return result.data;
  }
};
