// Interview interfaces

export interface InterviewSession {
  id: string;
  intervieweeId: string;
  interviewerId?: string;
  interviewType: 'coding' | 'system_design' | 'behavioral';
  difficulty?: 'easy' | 'medium' | 'hard';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  scheduledAt?: string;
  startedAt?: string;
  endedAt?: string;
  durationMin?: number;
  communicationMode?: string;
  recordingUrl?: string;
  workspaceData?: any;
  notes?: string;
  feedbackRating?: number;
  feedbackText?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserLite {
  id: string;
  displayName: string;
  avatarUrl?: string;
}

export interface InterviewSessionWithUsers extends InterviewSession {
  interviewee: UserLite | UserLite[];
  interviewer?: UserLite | UserLite[];
}

export interface CreateInterviewSessionRequest {
  interviewerId?: string;
  interviewType: 'coding' | 'system_design' | 'behavioral';
  difficulty?: 'easy' | 'medium' | 'hard';
  scheduledAt?: string;
  durationMin?: number;
  notes?: string;
}

export interface UpdateInterviewSessionRequest {
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  startedAt?: string;
  endedAt?: string;
  recordingUrl?: string;
  notes?: string;
}

export interface InterviewFeedback {
  id?: string;
  sessionId: string;
  reviewerId?: string;
  rating: number;
  feedbackText?: string;
  technicalSkills?: number;
  communication?: number;
  problemSolving?: number;
  strengths?: string;
  improvements?: string;
  comments?: string;
  createdAt?: string;
}
