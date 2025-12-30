// Frontend AI Interfaces - Mirror của backend AI DTOs

export interface CodeReview {
  reviewId: string;
  summary: string;
  issues: string[];
  suggestions: string[];
  qualityRating: number; // 1-5
  overallScore: number; // 0-100
  processingTimeMs?: number;
  createdAt?: string;
  cached?: boolean;
}

export interface CreateCodeReviewRequest {
  submissionId: string;
  code: string;
  language: string;
  problemTitle?: string;
}

export interface NotebookAssistRequest {
  question: string;
  context?: string;
  sourceType?: 'problem' | 'note' | 'submission';
  sourceId?: string;
}

export interface NotebookAssistResponse {
  response: string;
  suggestions?: string[];
}

export interface SummaryResponse {
  summary: string;
}

export interface MindmapNode {
  label: string;
  children: MindmapNode[];
}

export interface MindmapResponse {
  root: string;
  children: MindmapNode[];
}

export interface GenerateSummaryRequest {
  content: string;
}

export interface GenerateMindmapRequest {
  content: string;
}