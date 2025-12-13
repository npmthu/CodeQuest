// Frontend Submission Interfaces - Mirror của backend DTOs

export interface Submission {
  id: string;
  problemId: string;
  userId: string;
  languageId: string;
  code: string;
  status: string;
  points: number;
  passed: boolean;
  submittedAt: string;
  completedAt?: string;
  executionSummary?: ExecutionSummary;
}

export interface SubmissionListItem {
  id: string;
  problemId: string;
  problemTitle?: string;
  languageId: string;
  languageName?: string;
  status: string;
  passed: boolean;
  submittedAt: string;
}

export interface ExecutionSummary {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionTimeMs?: number;
  memoryKb?: number;
}

export interface TestCaseResult {
  testCaseId?: string;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
  executionTimeMs?: number;
}

export interface CreateSubmissionRequest {
  problemId: string;
  languageId: string;
  code: string;
}

export interface SubmissionResult {
  id: string;
  status: string;
  passed: boolean;
  points: number;
  testResults?: TestCaseResult[];
  compilationOutput?: string;
}
