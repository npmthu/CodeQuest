// Interview mappers - Convert DB models to DTOs

import type { InterviewSession, InterviewFeedback } from '../models/Interview';
import type { InterviewSessionDTO, InterviewFeedbackDTO } from '../dtos/interview.dto';

export function mapInterviewSessionToDTO(session: InterviewSession): InterviewSessionDTO {
  return {
    id: session.id,
    intervieweeId: session.interviewee_id,
    interviewerId: session.interviewer_id,
    interviewType: session.interview_type,
    difficulty: session.difficulty,
    status: session.status,
    scheduledAt: session.scheduled_at,
    startedAt: session.started_at,
    endedAt: session.ended_at,
    durationMin: session.duration_min,
    communicationMode: session.communication_mode,
    recordingEnabled: session.recording_enabled,
    recordingUrl: session.recording_url,
    workspaceData: session.workspace_data,
    createdAt: session.created_at
  };
}

export function mapInterviewFeedbackToDTO(feedback: InterviewFeedback): InterviewFeedbackDTO {
  return {
    id: feedback.id,
    sessionId: feedback.session_id,
    fromUserId: feedback.from_user_id,
    toUserId: feedback.to_user_id,
    overallRating: feedback.overall_rating,
    communicationRating: feedback.communication_rating,
    problemSolvingRating: feedback.problem_solving_rating,
    technicalKnowledgeRating: feedback.technical_knowledge_rating,
    feedbackText: feedback.feedback_text,
    recommendedTopics: feedback.recommended_topics,
    createdAt: feedback.created_at
  };
}
