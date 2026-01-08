// Submission DTOs - Contract giữa backend và frontend

export interface SubmissionDTO {
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
  executionSummary?: ExecutionSummaryDTO;
}

export interface SubmissionListItemDTO {
  id: string;
  problemId: string;
  problemTitle?: string;
  languageId: string;
  languageName?: string;
  status: string;
  passed: boolean;
  submittedAt: string;
}

export interface ExecutionSummaryDTO {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  executionTimeMs?: number;
  memoryKb?: number;
}

export interface TestCaseResultDTO {
  testCaseId?: string;
  passed: boolean;
  input?: string;
  expectedOutput?: string;
  actualOutput?: string;
  error?: string;
  executionTimeMs?: number;
}

export interface CreateSubmissionDTO {
  problemId: string;
  languageId: string;
  code: string;
}

export interface SubmissionResultDTO {
  id: string;
  status: string;
  passed: boolean;
  points: number;
  testResults?: TestCaseResultDTO[];
  compilationOutput?: string;
}
