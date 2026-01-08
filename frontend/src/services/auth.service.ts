// Auth Service - Authentication and authorization operations

import { ApiResponse } from '../interfaces/api.interface';

const API_BASE_URL = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  user: any;
  session: any;
}

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    const result: ApiResponse<AuthResponse> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to register');
    }
    
    return result.data;
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    
    const result: ApiResponse<AuthResponse> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to login');
    }
    
    return result.data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
    
    const result: ApiResponse<any> = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to logout');
    }
  },

  /**
   * Get current user info
   */
  async getCurrentUser(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      credentials: 'include'
    });
    const result: ApiResponse<any> = await response.json();
    
    if (!result.success || !result.data) {
      throw new Error(result.error || 'Failed to fetch current user');
    }
    
    return result.data;
  }
};
