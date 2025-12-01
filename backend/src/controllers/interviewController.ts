import { Response } from 'express';
import { supabaseAdmin } from '../config/database';
import { AuthRequest } from '../middleware/auth';

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

    const { data: sessions, error } = await supabaseAdmin
      .from('interview_sessions')
      .select(`
        id,
        interview_type,
        difficulty,
        status,
        scheduled_at,
        started_at,
        ended_at,
        duration_min,
        communication_mode,
        recording_enabled,
        recording_url,
        created_at,
        interviewee:users!interviewee_id(id, display_name, avatar_url, level),
        interviewer:users!interviewer_id(id, display_name, avatar_url, level)
      `)
      .or(`interviewee_id.eq.${userId},interviewer_id.eq.${userId}`)
      .order('scheduled_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    return res.json({ success: true, data: sessions || [] });
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

    const { data: session, error } = await supabaseAdmin
      .from('interview_sessions')
      .select(`
        id,
        interview_type,
        difficulty,
        status,
        scheduled_at,
        started_at,
        ended_at,
        duration_min,
        communication_mode,
        recording_enabled,
        recording_url,
        workspace_data,
        created_at,
        interviewee:users!interviewee_id(id, display_name, avatar_url, level),
        interviewer:users!interviewer_id(id, display_name, avatar_url, level)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ success: false, error: 'Session not found' });
      }
      throw error;
    }

    // Check if user is participant
    const interviewee = Array.isArray(session.interviewee) ? session.interviewee[0] : session.interviewee;
    const interviewer = Array.isArray(session.interviewer) ? session.interviewer[0] : session.interviewer;
    
    if (interviewee?.id !== userId && interviewer?.id !== userId) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Get feedback
    const { data: feedback } = await supabaseAdmin
      .from('interview_feedback')
      .select(`
        id,
        overall_rating,
        communication_rating,
        problem_solving_rating,
        technical_knowledge_rating,
        feedback_text,
        recommended_topics,
        created_at,
        from_user:users!from_user_id(id, display_name, avatar_url),
        to_user:users!to_user_id(id, display_name, avatar_url)
      `)
      .eq('session_id', id);

    return res.json({
      success: true,
      data: {
        ...session,
        feedback: feedback || []
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

    const { data: session, error } = await supabaseAdmin
      .from('interview_sessions')
      .insert([{
        interviewee_id: userId,
        interviewer_id,
        interview_type,
        difficulty,
        scheduled_at,
        duration_min: duration_min || 60,
        communication_mode: communication_mode || 'video',
        status: 'scheduled'
      }])
      .select()
      .single();

    if (error) throw error;

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

    const updateData: any = {};
    if (status) updateData.status = status;
    if (workspace_data) updateData.workspace_data = workspace_data;

    if (status === 'in_progress' && !updateData.started_at) {
      updateData.started_at = new Date().toISOString();
    }
    if (status === 'completed' && !updateData.ended_at) {
      updateData.ended_at = new Date().toISOString();
    }

    const { data: session, error } = await supabaseAdmin
      .from('interview_sessions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

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

    const { data: feedback, error } = await supabaseAdmin
      .from('interview_feedback')
      .insert([{
        session_id: sessionId,
        from_user_id: userId,
        to_user_id,
        overall_rating,
        communication_rating,
        problem_solving_rating,
        technical_knowledge_rating,
        feedback_text,
        recommended_topics
      }])
      .select()
      .single();

    if (error) throw error;

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
    // For now, return users with instructor role or high reputation
    const { data: interviewers, error } = await supabaseAdmin
      .from('users')
      .select('id, display_name, avatar_url, level, reputation, bio')
      .or('role.eq.instructor,reputation.gte.1000')
      .eq('is_active', true)
      .order('reputation', { ascending: false })
      .limit(20);

    if (error) throw error;

    return res.json({ success: true, data: interviewers || [] });
  } catch (error: any) {
    console.error('Error getting available interviewers:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
