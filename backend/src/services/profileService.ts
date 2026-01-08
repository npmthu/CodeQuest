import { supabaseAdmin } from '../config/database';

export interface UpdateProfileRequest {
  display_name?: string;
  avatar_url?: string;
  bio?: string;
  level?: string;
  metadata?: Record<string, any>;
}

export interface UserProfile {
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

export class ProfileService {
  // Get user profile by ID
  async getProfile(userId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getProfile:', error);
      return null;
    }
  }

  // Update user profile
  async updateProfile(userId: string, updateData: UpdateProfileRequest): Promise<UserProfile | null> {
    try {
      // Validate input
      const validatedData: Partial<UpdateProfileRequest> = {};
      
      if (updateData.display_name !== undefined) {
        if (typeof updateData.display_name !== 'string' || updateData.display_name.trim().length === 0) {
          throw new Error('Display name cannot be empty');
        }
        if (updateData.display_name.length > 255) {
          throw new Error('Display name cannot exceed 255 characters');
        }
        validatedData.display_name = updateData.display_name.trim();
      }

      if (updateData.avatar_url !== undefined) {
        if (updateData.avatar_url && typeof updateData.avatar_url !== 'string') {
          throw new Error('Avatar URL must be a string');
        }
        validatedData.avatar_url = updateData.avatar_url;
      }

      if (updateData.bio !== undefined) {
        if (updateData.bio && typeof updateData.bio !== 'string') {
          throw new Error('Bio must be a string');
        }
        if (updateData.bio && updateData.bio.length > 2000) {
          throw new Error('Bio cannot exceed 2000 characters');
        }
        validatedData.bio = updateData.bio;
      }

      if (updateData.level !== undefined) {
        const validLevels = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];
        if (!validLevels.includes(updateData.level)) {
          throw new Error('Invalid level. Must be one of: ' + validLevels.join(', '));
        }
        validatedData.level = updateData.level;
      }

      if (updateData.metadata !== undefined) {
        if (typeof updateData.metadata !== 'object' || updateData.metadata === null) {
          throw new Error('Metadata must be a valid object');
        }
        validatedData.metadata = updateData.metadata;
      }

      // Add updated_at timestamp
      const updateWithTimestamp = {
        ...validatedData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updateWithTimestamp)
        .eq('id', userId)
        .select('*')
        .single();

      if (error) {
        console.error('Error updating profile:', error);
        throw new Error('Failed to update profile: ' + error.message);
      }

      return data;
    } catch (error) {
      console.error('Error in updateProfile:', error);
      throw error;
    }
  }

  // Upload avatar image (placeholder for future implementation)
  async uploadAvatar(userId: string, file: File): Promise<string> {
    try {
      // This is a placeholder implementation
      // In a real application, you would:
      // 1. Upload to a storage service (Supabase Storage, S3, etc.)
      // 2. Return the public URL
      // 3. Update the user's avatar_url in the database
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar.${fileExt}`;
      
      // For now, return a placeholder URL
      // In production, implement actual file upload
      const placeholderUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${userId}&backgroundColor=3b82f6`;
      
      return placeholderUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  // Get user's public profile (for other users to view)
  async getPublicProfile(userId: string): Promise<Partial<UserProfile> | null> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, display_name, avatar_url, bio, role, level, reputation, created_at')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching public profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getPublicProfile:', error);
      return null;
    }
  }

  // Search users by display name or email
  async searchUsers(query: string, limit: number = 10): Promise<Partial<UserProfile>[]> {
    try {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('id, display_name, avatar_url, role, level, reputation')
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(limit)
        .order('reputation', { ascending: false });

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in searchUsers:', error);
      return [];
    }
  }
}
