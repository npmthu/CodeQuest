import { supabaseAdmin } from '../config/database';
import type {
  InterviewSession,
  InterviewFeedback
} from '../models/Interview';
import type {
  UpdateInterviewSessionDTO,
  CreateInterviewFeedbackDTO
} from '../dtos/interview.dto';

/**
 * List interview sessions for a user
 */
export async function listInterviewSessions(userId: string, limit = 50): Promise<any[]> {
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
    .limit(limit);

  if (error) {
    console.error('Error listing interview sessions:', error);
    throw error;
  }

  return sessions || [];
}

/**
 * Get single interview session with feedback
 */
export async function getInterviewSession(sessionId: string): Promise<any | null> {
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
    .eq('id', sessionId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error getting interview session:', error);
    throw error;
  }

  return session;
}

/**
 * Get feedback for a session
 */
export async function getSessionFeedback(sessionId: string): Promise<any[]> {
  const { data: feedback, error } = await supabaseAdmin
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
    .eq('session_id', sessionId);

  if (error) {
    console.error('Error getting session feedback:', error);
    throw error;
  }

  return feedback || [];
}

/**
 * Check if user is participant in session
 */
export async function isSessionParticipant(sessionId: string, userId: string): Promise<boolean> {
  const session = await getInterviewSession(sessionId);
  if (!session) return false;

  const interviewee = Array.isArray(session.interviewee) ? session.interviewee[0] : session.interviewee;
  const interviewer = Array.isArray(session.interviewer) ? session.interviewer[0] : session.interviewer;

  return interviewee?.id === userId || interviewer?.id === userId;
}

/**
 * Create interview session
 */
export async function createInterviewSession(payload: any): Promise<InterviewSession> {
  const sessionData = {
    ...payload,
    duration_min: payload.duration_min || 60,
    communication_mode: payload.communication_mode || 'video',
    status: 'scheduled' as const
  };

  const { data: session, error } = await supabaseAdmin
    .from('interview_sessions')
    .insert([sessionData])
    .select()
    .single();

  if (error) {
    console.error('Error creating interview session:', error);
    throw error;
  }

  return session as InterviewSession;
}

/**
 * Update interview session
 */
export async function updateInterviewSession(
  sessionId: string,
  updates: UpdateInterviewSessionDTO
): Promise<InterviewSession> {
  const updateData: any = { ...updates };

  if (updates.status === 'in_progress' && !updateData.started_at) {
    updateData.started_at = new Date().toISOString();
  }
  if (updates.status === 'completed' && !updateData.ended_at) {
    updateData.ended_at = new Date().toISOString();
  }

  const { data: session, error } = await supabaseAdmin
    .from('interview_sessions')
    .update(updateData)
    .eq('id', sessionId)
    .select()
    .single();

  if (error) {
    console.error('Error updating interview session:', error);
    throw error;
  }

  return session as InterviewSession;
}

/**
 * Submit interview feedback
 */
export async function submitInterviewFeedback(payload: CreateInterviewFeedbackDTO): Promise<InterviewFeedback> {
  const { data: feedback, error } = await supabaseAdmin
    .from('interview_feedback')
    .insert([{
      session_id: payload.sessionId,
      from_user_id: payload.fromUserId,
      to_user_id: payload.toUserId,
      overall_rating: payload.overallRating,
      communication_rating: payload.communicationRating,
      problem_solving_rating: payload.problemSolvingRating,
      technical_knowledge_rating: payload.technicalKnowledgeRating,
      feedback_text: payload.feedbackText,
      recommended_topics: payload.recommendedTopics
    }])
    .select()
    .single();

  if (error) {
    console.error('Error submitting feedback:', error);
    throw error;
  }

  return feedback as InterviewFeedback;
}

/**
 * Get available interviewers
 */
export async function getAvailableInterviewers(limit = 20): Promise<any[]> {
  const { data: interviewers, error } = await supabaseAdmin
    .from('users')
    .select('id, display_name, avatar_url, level, reputation, bio')
    .or('role.eq.instructor,reputation.gte.1000')
    .eq('is_active', true)
    .order('reputation', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error getting available interviewers:', error);
    throw error;
  }

  return interviewers || [];
}
