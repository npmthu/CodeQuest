import { Request, Response } from 'express';
import { ProfileService, UpdateProfileRequest } from '../services/profileService';
import { AuthRequest } from '../middleware/auth';

export class ProfileController {
  private profileService: ProfileService;

  constructor() {
    this.profileService = new ProfileService();
  }

  // Get current user's profile
  async getProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const profile = await this.profileService.getProfile(req.user.id);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error in getProfile controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch profile'
      });
    }
  }

  // Update current user's profile
  async updateProfile(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const updateData: UpdateProfileRequest = req.body;
      
      // Validate that at least one field is being updated
      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No fields provided for update'
        });
      }

      const updatedProfile = await this.profileService.updateProfile(req.user.id, updateData);
      
      if (!updatedProfile) {
        return res.status(404).json({
          success: false,
          error: 'Profile not found or update failed'
        });
      }

      res.json({
        success: true,
        data: updatedProfile,
        message: 'Profile updated successfully'
      });
    } catch (error: any) {
      console.error('Error in updateProfile controller:', error);
      
      // Handle validation errors specifically
      if (error.message.includes('cannot') || error.message.includes('Invalid')) {
        return res.status(400).json({
          success: false,
          error: error.message
        });
      }

      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }

  // Upload avatar
  async uploadAvatar(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided'
        });
      }

      // Validate file type and size
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed'
        });
      }

      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          error: 'File size too large. Maximum size is 5MB'
        });
      }

      const avatarUrl = await this.profileService.uploadAvatar(req.user.id, req.file);
      
      // Update user's avatar_url in database
      const updatedProfile = await this.profileService.updateProfile(req.user.id, {
        avatar_url: avatarUrl
      });

      res.json({
        success: true,
        data: {
          avatar_url: avatarUrl,
          profile: updatedProfile
        },
        message: 'Avatar uploaded successfully'
      });
    } catch (error: any) {
      console.error('Error in uploadAvatar controller:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to upload avatar'
      });
    }
  }

  // Get public profile (for other users to view)
  async getPublicProfile(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({
          success: false,
          error: 'User ID is required'
        });
      }

      const profile = await this.profileService.getPublicProfile(userId);
      
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: 'Profile not found'
        });
      }

      res.json({
        success: true,
        data: profile
      });
    } catch (error) {
      console.error('Error in getPublicProfile controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch public profile'
      });
    }
  }

  // Search users
  async searchUsers(req: Request, res: Response) {
    try {
      const { q: query, limit } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Search query is required'
        });
      }

      const searchLimit = limit ? parseInt(limit as string) : 10;
      const users = await this.profileService.searchUsers(query, searchLimit);

      res.json({
        success: true,
        data: users,
        count: users.length
      });
    } catch (error) {
      console.error('Error in searchUsers controller:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to search users'
      });
    }
  }
}
