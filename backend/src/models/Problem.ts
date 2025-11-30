import { TestCase } from './TestCase';

export interface Problem {
  id: string;
  slug?: string;
  title: string;
  description_markdown: string;
  difficulty: number;
  time_limit_ms?: number;
  memory_limit_kb?: number;
  input_format?: string;
  output_format?: string;
  constraints?: string;
  created_by?: string;  // user_id
  is_published?: boolean;
  is_premium?: boolean;
  acceptance_rate?: number;
  total_submissions?: number;
  total_accepted?: number;
  metadata?: Record<string, any>;
  editorial_markdown?: string;
  test_cases?: TestCase[];
  created_at?: string;
  updated_at?: string;
}
