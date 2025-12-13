import { supabaseAdmin } from '../config/database';
import type {
  InterviewSession,
  InterviewFeedback
} from '../models/Interview';

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
export async function createInterviewSession(payload: Partial<InterviewSession>): Promise<InterviewSession> {
  const { data: session, error } = await supabaseAdmin
    .from('interview_sessions')
    .insert([payload])
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
  updates: Partial<InterviewSession>
): Promise<InterviewSession> {
  const updateData: any = { ...updates };

  // Auto-set timestamps based on status
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
export async function submitInterviewFeedback(payload: Partial<InterviewFeedback>): Promise<InterviewFeedback> {
  const { data: feedback, error } = await supabaseAdmin
    .from('interview_feedback')
    .insert([payload])
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
