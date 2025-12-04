import { TestCase } from './TestCase';

export interface Problem {
  id: string;
  slug?: string;
  title: string;
  description_markdown: string;
  difficulty: 1 | 2 | 3;
  starter_code: Record<string, string>;
  tags: string[];
  time_limit_ms?: number;
  memory_limit_kb?: number;
  input_format?: string;
  output_format?: string;
  sample_test_cases?: TestCase[];
  hints?: Hint[];
  related_problems?: { id: string; title: string; difficulty: 1 | 2 | 3 }[];
  user_progress?: { submission_count: number; best_submission_id?: string; solved?: boolean };
}

export interface ProblemSummary {
  id: string;
  title: string;
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


