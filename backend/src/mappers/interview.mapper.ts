// Interview mappers - Convert DB models to DTOs and vice versa

import type { InterviewSession, InterviewFeedback, UserLite } from '../models/Interview';
import type { 
  InterviewSessionDTO, 
  InterviewFeedbackDTO,
  CreateInterviewSessionDTO,
  UpdateInterviewSessionDTO,
  CreateInterviewFeedbackDTO,
  UserSummaryDTO,
  InterviewSessionWithUsersDTO
} from '../dtos/interview.dto';

// ============= Response Mappers (DB → DTO) =============

export function mapUserLiteToDTO(user: UserLite | null | undefined): UserSummaryDTO | undefined {
  if (!user) return undefined;
  return {
    id: user.id,
    displayName: user.display_name,
    avatarUrl: user.avatar_url,
    level: user.level
  };
}

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

export function mapInterviewSessionWithUsersToDTO(session: any): InterviewSessionWithUsersDTO {
  // Handle array or single object for interviewee/interviewer
  const interviewee = Array.isArray(session.interviewee) 
    ? session.interviewee[0] 
    : session.interviewee;
  const interviewer = Array.isArray(session.interviewer) 
    ? session.interviewer[0] 
    : session.interviewer;

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
    createdAt: session.created_at,
    interviewee: mapUserLiteToDTO(interviewee),
    interviewer: mapUserLiteToDTO(interviewer)
  };
}

// ============= Request Mappers (DTO → DB) =============

export function mapCreateInterviewSessionDTOToEntity(dto: CreateInterviewSessionDTO, intervieweeId: string): Partial<InterviewSession> {
  return {
    interviewee_id: intervieweeId,
    interviewer_id: dto.interviewerId,
    interview_type: dto.interviewType as any,
    difficulty: dto.difficulty as any,
    scheduled_at: dto.scheduledAt,
    duration_min: dto.durationMin || 60,
    communication_mode: (dto.communicationMode as any) || 'video',
    recording_enabled: dto.recordingEnabled ?? false,
    status: 'scheduled'
  };
}

export function mapUpdateInterviewSessionDTOToEntity(dto: UpdateInterviewSessionDTO): Partial<InterviewSession> {
  const entity: Partial<InterviewSession> = {};
  
  if (dto.status !== undefined) entity.status = dto.status as any;
  if (dto.startedAt !== undefined) entity.started_at = dto.startedAt;
  if (dto.endedAt !== undefined) entity.ended_at = dto.endedAt;
  if (dto.workspaceData !== undefined) entity.workspace_data = dto.workspaceData;
  if (dto.recordingUrl !== undefined) entity.recording_url = dto.recordingUrl;
  
  return entity;
}

export function mapCreateInterviewFeedbackDTOToEntity(dto: CreateInterviewFeedbackDTO): Partial<InterviewFeedback> {
  return {
    session_id: dto.sessionId,
    from_user_id: dto.fromUserId,
    to_user_id: dto.toUserId,
    overall_rating: dto.overallRating,
    communication_rating: dto.communicationRating,
    problem_solving_rating: dto.problemSolvingRating,
    technical_knowledge_rating: dto.technicalKnowledgeRating,
    feedback_text: dto.feedbackText,
    recommended_topics: dto.recommendedTopics
  };
}
