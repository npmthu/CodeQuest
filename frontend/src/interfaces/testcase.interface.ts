// TestCase interfaces (mirroring backend DTOs)

export interface TestCase {
  id: string;
  name?: string;
  input?: any; // JSONB object for sample test cases
  expectedOutput?: any; // JSONB object for sample test cases
  isSample: boolean;
}

export interface TestCaseResult {
  testCaseId: string;
  passed: boolean;
  actualOutput?: string;
  expectedOutput?: string;
  executionTime?: number;
  memoryUsed?: number;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  results: TestCaseResult[];
  totalPassed?: number;
  totalFailed?: number;
  error?: string;
}

export interface Hint {
  id: string;
  content: string;
  text?: string; // alias for content
  orderIndex: number;
}

export interface Language {
  id: string;
  name: string;
  version: string;
  isEnabled: boolean;
  file_extension?: string; // for internal use in editor
  run_command?: string; // for internal use in editor
}
