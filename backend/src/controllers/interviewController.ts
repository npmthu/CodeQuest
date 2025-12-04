import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import * as interviewService from '../services/interviewService';

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
    return res.json({ success: true, data: sessions });
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

    return res.json({
      success: true,
      data: {
        ...session,
        feedback
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

    const {
      interviewer_id,
      interview_type,
      difficulty,
      scheduled_at,
      duration_min,
      communication_mode
    } = req.body;

    if (!interview_type || !difficulty) {
      return res.status(400).json({ success: false, error: 'Interview type and difficulty are required' });
    }

    const session = await interviewService.createInterviewSession({
      interviewee_id: userId,
      interviewer_id,
      interview_type,
      difficulty,
      scheduled_at,
      duration_min,
      communication_mode
    });

    return res.status(201).json({ success: true, data: session });
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
    const { status, workspace_data } = req.body;

    const session = await interviewService.updateInterviewSession(id, {
      status,
      workspace_data
    });

    return res.json({ success: true, data: session });
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
    const {
      to_user_id,
      overall_rating,
      communication_rating,
      problem_solving_rating,
      technical_knowledge_rating,
      feedback_text,
      recommended_topics
    } = req.body;

    if (!to_user_id || !overall_rating) {
      return res.status(400).json({ success: false, error: 'Recipient and overall rating are required' });
    }

    const feedback = await interviewService.submitInterviewFeedback({
      session_id: sessionId,
      from_user_id: userId,
      to_user_id,
      overall_rating,
      communication_rating,
      problem_solving_rating,
      technical_knowledge_rating,
      feedback_text,
      recommended_topics
    });

    return res.status(201).json({ success: true, data: feedback });
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
