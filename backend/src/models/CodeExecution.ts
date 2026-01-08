// Code Execution model - code runs and drafts

export interface CodeRun {
  id: string;
  submission_id: string;
  test_case_id?: string;
  worker_id?: string;
  status?: string;
  stdout?: string;
  stderr?: string;
  exit_code?: number;
  execution_time_ms?: number;
  memory_kb?: number;
  created_at?: string;
}

export interface CodeDraft {
  user_id: string;
  problem_id: string;
  code: string;
  language_id?: string;
  last_updated_at?: string;
}
