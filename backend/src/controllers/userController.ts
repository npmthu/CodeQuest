// User controller - profile, settings, dashboard data
import { Request, Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as userService from '../services/userService';
import { mapUserToDTO, mapUserToProfileDTO } from '../mappers/user.mapper';

export async function listUsers(req: Request, res: Response) {
  try {
    const users = await userService.listUsers();
    const usersDTO = users.map(mapUserToDTO);
    res.json({ success: true, data: usersDTO });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getUserHandler(req: Request, res: Response) {
  try {
    const user = await userService.getUser(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    const userDTO = mapUserToProfileDTO(user);
    res.json({ success: true, data: userDTO });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateUserHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Accept camelCase from frontend
    const updates = {
      displayName: req.body.displayName,
      bio: req.body.bio,
      avatarUrl: req.body.avatarUrl
    };
    
    const updatedUser = await userService.updateUser(userId, updates);

    const userDTO = mapUserToProfileDTO(updatedUser);
    res.json({ success: true, data: userDTO, message: 'Profile updated' });
  } catch (err: any) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}

export async function getUserStatsHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const stats = await userService.getUserStats(userId);
    return res.json({ success: true, data: stats });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getLearningProfileHandler(req: AuthRequest, res: Response) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const profile = await userService.getUserLearningProfile(userId);
    return res.json({ success: true, data: profile });
  } catch (error: any) {
    console.error('Get learning profile error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

export async function getLeaderboardHandler(req: Request, res: Response) {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const leaderboard = await userService.getLeaderboard(limit);
    return res.json({ success: true, data: leaderboard });
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}