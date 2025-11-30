export interface Submission {
  id: string;
  problem_id: string;
  user_id?: string | null;
  language_id?: string;       // FK sang Language
  code: string;
  code_url?: string;
  status: 'pending' | 'running' | 'accepted' | 'wrong_answer' | 'error' | string;
  points?: number;
  passed?: boolean;
  execution_summary?: Record<string, any>;
  compilation_output?: string;
  metadata?: Record<string, any>;
  created_at?: string;
  started_execution_at?: string;
  completed_at?: string;
  updated_at?: string;
}
