export interface Submission {
  id: string;
  problem_id: string;
  user_id?: string | null;
  language_id?: string;       // FK to Language
  code: string;
  code_url?: string;
  status: 'PENDING' | 'RUNNING' | 'ACCEPTED' | 'WRONG_ANSWER' | 'ERROR' | string;
  points?: number;
  passed?: boolean;
  execution_summary?: Record<string, any>;
  compilation_output?: string;
  metadata?: Record<string, any>;
  submitted_at?: string;
  started_execution_at?: string;
  completed_at?: string;
}
