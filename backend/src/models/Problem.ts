// Problem model - matches database schema

export interface Problem {
  id: string;
  slug: string;
  title: string;
  description_markdown: string;
  difficulty: number;
  time_limit_ms?: number;
  memory_limit_kb?: number;
  input_format?: string;
  output_format?: string;
  constraints?: string;
  created_by?: string;
  is_published?: boolean;
  is_premium?: boolean;
  acceptance_rate?: number;
  total_submissions?: number;
  total_accepted?: number;
  topic_id?: string;
  created_at?: string;
  updated_at?: string;
  metadata?: Record<string, any>;
  editorial_markdown?: string;
  hint?: string;
}

export interface ProblemSummary {
  id: string;
  title: string;
  difficulty?: number;
}

// Additional types for frontend/API responses (not in DB)
export interface ProblemWithTestCases extends Problem {
  sample_test_cases?: any[];
}

export interface ProblemWithProgress extends Problem {
  user_progress?: {
    submission_count: number;
    best_submission_id?: string;
    solved?: boolean;
  };
}

export interface Hint {
  level: number;
  text: string;
}

export interface TestCaseResult {
  passed: boolean;
  input?: string;
  expected_output?: string;
  actual_output?: string;
  error?: string;
}

export interface ExecutionResult {
  stdout?: string;
  output?: string;
  test_cases?: TestCaseResult[];
  ai_review?: string;
}


