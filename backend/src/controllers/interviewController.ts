import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as interviewService from '../services/interviewService';
import {
  mapInterviewSessionWithUsersToDTO,
  mapCreateInterviewSessionDTOToEntity,
  mapUpdateInterviewSessionDTOToEntity,
  mapCreateInterviewFeedbackDTOToEntity,
  mapInterviewSessionToDTO,
  mapInterviewFeedbackToDTO
} from '../mappers/interview.mapper';
import type { 
  CreateInterviewSessionDTO, 
  UpdateInterviewSessionDTO,
  CreateInterviewFeedbackDTO 
} from '../dtos/interview.dto';

/**
 * List interview sessions for user
 * GET /api/interview/sessions
 */
export const listInterviewSessions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const sessions = await interviewService.listInterviewSessions(userId);
    
    // Map each session to DTO (camelCase)
    const sessionDTOs = sessions.map(mapInterviewSessionWithUsersToDTO);
    
    return res.json({ success: true, data: sessionDTOs });
  } catch (error: any) {
    console.error('Error listing interview sessions:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get single interview session
 * GET /api/interview/sessions/:id
 */
export const getInterviewSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;

    const session = await interviewService.getInterviewSession(id);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Session not found' });
    }

    // Check if user is participant
    const isParticipant = await interviewService.isSessionParticipant(id, userId);
    if (!isParticipant) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Get feedback
    const feedback = await interviewService.getSessionFeedback(id);
    
    // Map to DTOs (camelCase)
    const sessionDTO = mapInterviewSessionWithUsersToDTO(session);
    const feedbackDTOs = feedback.map((f: any) => ({
      ...mapInterviewFeedbackToDTO(f),
      fromUser: f.from_user ? {
        id: f.from_user.id,
        displayName: f.from_user.display_name,
        avatarUrl: f.from_user.avatar_url
      } : undefined,
      toUser: f.to_user ? {
        id: f.to_user.id,
        displayName: f.to_user.display_name,
        avatarUrl: f.to_user.avatar_url
      } : undefined
    }));

    return res.json({
      success: true,
      data: {
        ...sessionDTO,
        feedback: feedbackDTOs
      }
    });
  } catch (error: any) {
    console.error('Error getting interview session:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Create interview session
 * POST /api/interview/sessions
 */
export const createInterviewSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Accept camelCase from frontend
    const requestDTO: CreateInterviewSessionDTO = {
      interviewerId: req.body.interviewerId,
      interviewType: req.body.interviewType,
      difficulty: req.body.difficulty,
      scheduledAt: req.body.scheduledAt,
      durationMin: req.body.durationMin,
      communicationMode: req.body.communicationMode,
      recordingEnabled: req.body.recordingEnabled
    };

    if (!requestDTO.interviewType || !requestDTO.difficulty) {
      return res.status(400).json({ success: false, error: 'Interview type and difficulty are required' });
    }

    // Map DTO to DB entity (snake_case)
    const entityData = mapCreateInterviewSessionDTOToEntity(requestDTO, userId);

    const session = await interviewService.createInterviewSession(entityData);
    
    // Map response to DTO (camelCase)
    const sessionDTO = mapInterviewSessionToDTO(session);

    return res.status(201).json({ success: true, data: sessionDTO });
  } catch (error: any) {
    console.error('Error creating interview session:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update interview session status
 * PATCH /api/interview/sessions/:id
 */
export const updateInterviewSession = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id } = req.params;
    
    // Accept camelCase from frontend
    const updateDTO: UpdateInterviewSessionDTO = {
      status: req.body.status,
      startedAt: req.body.startedAt,
      endedAt: req.body.endedAt,
      workspaceData: req.body.workspaceData,
      recordingUrl: req.body.recordingUrl
    };

    // Map DTO to DB entity (snake_case)
    const entityData = mapUpdateInterviewSessionDTOToEntity(updateDTO);

    const session = await interviewService.updateInterviewSession(id, entityData);
    
    // Map response to DTO (camelCase)
    const sessionDTO = mapInterviewSessionToDTO(session);

    return res.json({ success: true, data: sessionDTO });
  } catch (error: any) {
    console.error('Error updating interview session:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Submit interview feedback
 * POST /api/interview/sessions/:id/feedback
 */
export const submitInterviewFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const { id: sessionId } = req.params;
    
    // Accept camelCase from frontend
    const feedbackDTO: CreateInterviewFeedbackDTO = {
      sessionId,
      fromUserId: userId,
      toUserId: req.body.toUserId,
      overallRating: req.body.overallRating,
      communicationRating: req.body.communicationRating,
      problemSolvingRating: req.body.problemSolvingRating,
      technicalKnowledgeRating: req.body.technicalKnowledgeRating,
      feedbackText: req.body.feedbackText,
      recommendedTopics: req.body.recommendedTopics
    };

    if (!feedbackDTO.toUserId || !feedbackDTO.overallRating) {
      return res.status(400).json({ success: false, error: 'Recipient and overall rating are required' });
    }

    // Map DTO to DB entity (snake_case)
    const entityData = mapCreateInterviewFeedbackDTOToEntity(feedbackDTO);

    const feedback = await interviewService.submitInterviewFeedback(entityData);
    
    // Map response to DTO (camelCase)
    const feedbackResponseDTO = mapInterviewFeedbackToDTO(feedback);

    return res.status(201).json({ success: true, data: feedbackResponseDTO });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Find available interviewers (mock for now)
 * GET /api/interview/available-interviewers
 */
export const getAvailableInterviewers = async (req: AuthRequest, res: Response) => {
  try {
    const interviewers = await interviewService.getAvailableInterviewers();
    return res.json({ success: true, data: interviewers });
  } catch (error: any) {
    console.error('Error getting available interviewers:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
