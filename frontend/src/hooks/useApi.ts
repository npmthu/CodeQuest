import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

// Helper to get auth headers
async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {})
  };
}

// Generic fetch wrapper
async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: { ...headers, ...options.headers }
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }

  return data;
}

// Auth Hooks
export function useRegister() {
  return useMutation({
    mutationFn: async (payload: { email: string; password: string; fullName?: string }) => {
      return apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    }
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      // Use Supabase client for login
      const { data, error } = await supabase.auth.signInWithPassword(payload);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    }
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.clear();
    }
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return null;

      const result = await apiFetch('/auth/me');
      return result.data;
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });
}

// User Stats Hook
export function useUserStats() {
  return useQuery({
    queryKey: ['userStats'],
    queryFn: async () => {
      const result = await apiFetch('/users/me/stats');
      return result.data;
    },
    enabled: true
  });
}

// Topics Hooks
export function useTopics() {
  return useQuery({
    queryKey: ['topics'],
    queryFn: async () => {
      const result = await apiFetch('/topics');
      return result.data;
    }
  });
}

export function useTopic(id: string) {
  return useQuery({
    queryKey: ['topic', id],
    queryFn: async () => {
      const result = await apiFetch(`/topics/${id}`);
      return result.data;
    },
    enabled: !!id
  });
}

// Lessons Hooks
export function useLessons(topicId?: string) {
  return useQuery({
    queryKey: ['lessons', topicId],
    queryFn: async () => {
      const endpoint = topicId ? `/lessons?topicId=${topicId}` : '/lessons';
      const result = await apiFetch(endpoint);
      return result.data;
    }
  });
}

export function useLesson(id: string) {
  return useQuery({
    queryKey: ['lesson', id],
    queryFn: async () => {
      const result = await apiFetch(`/lessons/${id}`);
      return result.data;
    },
    enabled: !!id
  });
}

export function useUpdateLessonProgress() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      lessonId, 
      isCompleted, 
      progressPercentage 
    }: { 
      lessonId: string; 
      isCompleted?: boolean; 
      progressPercentage?: number 
    }) => {
      return apiFetch(`/lessons/${lessonId}/progress`, {
        method: 'POST',
        body: JSON.stringify({ isCompleted, progressPercentage })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons'] });
      queryClient.invalidateQueries({ queryKey: ['userProgress'] });
    }
  });
}

export function useUserProgress() {
  return useQuery({
    queryKey: ['userProgress'],
    queryFn: async () => {
      const result = await apiFetch('/lessons/user/progress');
      return result.data;
    }
  });
}

// Problems Hooks
export function useProblems() {
  return useQuery({
    queryKey: ['problems'],
    queryFn: async () => {
      const result = await apiFetch('/problems');
      return result.data;
    }
  });
}

export function useProblem(id: string) {
  return useQuery({
    queryKey: ['problem', id],
    queryFn: async () => {
      const result = await apiFetch(`/problems/${id}`);
      return result.data;
    },
    enabled: !!id
  });
}

// Submissions Hook
export function useSubmitCode() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (payload: { 
      problemId: string; 
      code: string; 
      languageId: string 
    }) => {
      return apiFetch('/submissions', {
        method: 'POST',
        body: JSON.stringify(payload)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions'] });
      queryClient.invalidateQueries({ queryKey: ['userStats'] });
    }
  });
}

export function useSubmissions(problemId?: string) {
  return useQuery({
    queryKey: ['submissions', problemId],
    queryFn: async () => {
      const endpoint = problemId ? `/submissions?problemId=${problemId}` : '/submissions';
      const result = await apiFetch(endpoint);
      return result.data;
    }
  });
}
