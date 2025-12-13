// Interview DTOs - Contract giữa backend và frontend

export interface InterviewSessionDTO {
  id: string;
  intervieweeId?: string;
  interviewerId?: string;
  interviewType?: string;
  difficulty?: string;
  status: string;
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  durationMin?: number;
  communicationMode?: string;
  recordingEnabled: boolean;
  recordingUrl?: string;
  workspaceData?: any;
  createdAt: string;
}

export interface InterviewSessionWithUsersDTO extends InterviewSessionDTO {
  interviewee?: UserSummaryDTO;
  interviewer?: UserSummaryDTO;
}

export interface CreateInterviewSessionDTO {
  intervieweeId?: string;
  interviewerId?: string;
  interviewType?: string;
  difficulty?: string;
  scheduledAt?: string;
  durationMin?: number;
  communicationMode?: string;
  recordingEnabled?: boolean;
}

export interface UpdateInterviewSessionDTO {
  status?: string;
  startedAt?: string;
  endedAt?: string;
  workspaceData?: any;
  recordingUrl?: string;
}

export interface InterviewFeedbackDTO {
  id: string;
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  overallRating?: number;
  communicationRating?: number;
  problemSolvingRating?: number;
  technicalKnowledgeRating?: number;
  feedbackText?: string;
  recommendedTopics?: any;
  createdAt: string;
}

export interface CreateInterviewFeedbackDTO {
  sessionId: string;
  fromUserId: string;
  toUserId: string;
  overallRating?: number;
  communicationRating?: number;
  problemSolvingRating?: number;
  technicalKnowledgeRating?: number;
  feedbackText?: string;
  recommendedTopics?: any;
}

export interface UserSummaryDTO {
  id: string;
  displayName?: string;
  avatarUrl?: string;
  level?: string;
  reputation?: number;
}
