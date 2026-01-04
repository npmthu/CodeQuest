import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000/api';

export interface ProfileData {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: string;
  is_active: boolean;
  level: string;
  reputation: number;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  metadata: Record<string, any>;
}

export interface UpdateProfileData {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  level?: string;
  metadata?: Record<string, any>;
}

// Hook to get current user's profile
export function useProfile() {
  const { session } = useAuth();

  return useQuery({
    queryKey: ['profile'],
    queryFn: async (): Promise<ProfileData> => {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/profile`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch profile');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!session?.access_token,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to update profile
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (updateData: UpdateProfileData): Promise<ProfileData> => {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`${API_BASE}/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: (updatedProfile) => {
      // Update the profile cache
      queryClient.setQueryData(['profile'], updatedProfile);
      
      // Show success message
      toast.success('Profile updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });
}

// Hook to upload avatar
export function useUploadAvatar() {
  const queryClient = useQueryClient();
  const { session } = useAuth();

  return useMutation({
    mutationFn: async (file: File): Promise<{ avatar_url: string; profile: ProfileData }> => {
      if (!session?.access_token) {
        throw new Error('Not authenticated');
      }

      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(`${API_BASE}/profile/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to upload avatar');
      }

      const data = await response.json();
      return data.data;
    },
    onSuccess: (result) => {
      // Update the profile cache
      queryClient.setQueryData(['profile'], result.profile);
      
      // Show success message
      toast.success('Avatar uploaded successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload avatar');
    },
  });
}

// Hook to get public profile (for other users)
export function usePublicProfile(userId: string) {
  return useQuery({
    queryKey: ['public-profile', userId],
    queryFn: async (): Promise<Partial<ProfileData>> => {
      const response = await fetch(`${API_BASE}/profile/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch profile');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Hook to search users
export function useSearchUsers(query: string, limit: number = 10) {
  return useQuery({
    queryKey: ['search-users', query, limit],
    queryFn: async (): Promise<Partial<ProfileData>[]> => {
      const response = await fetch(`${API_BASE}/profile/search?q=${encodeURIComponent(query)}&limit=${limit}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to search users');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!query && query.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
