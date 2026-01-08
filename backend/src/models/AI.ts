// AI Services model - AI code reviews and generated content

export interface AICodeReview {
  id: string;
  submission_id: string;
  status: string;
  overall_score?: number;
  dimensions?: any; // jsonb
  summary?: string;
  strengths?: any; // jsonb
  improvements?: any; // jsonb
  code_suggestions?: any; // jsonb
  complexity_analysis?: any; // jsonb
  generated_at?: string;
  processing_time_ms?: number;
  created_at?: string;
}

export interface AIGeneratedContent {
  id: string;
  user_id: string;
  content_type: string;
  source_type?: string;
  source_id?: string;
  generated_data: any; // jsonb
  export_urls?: any; // jsonb
  created_at?: string;
}
