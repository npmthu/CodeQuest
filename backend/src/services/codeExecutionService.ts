/**
 * Code Execution Service - Real execution using Piston API with JSONB support
 * Piston: Free code execution engine (https://github.com/engineer-man/piston)
 */

import { supabaseAdmin } from '../config/database';
import type { TestCase } from '../models/TestCase';
import type { ProblemIO } from '../models/ProblemIO';

const PISTON_API = 'https://emkc.org/api/v2/piston';

// Language mapping: frontend name -> Piston language name
const LANGUAGE_MAP: Record<string, string> = {
  'python': 'python',
  'javascript': 'javascript',
  'java': 'java',
  'cpp': 'cpp',
  'c++': 'cpp',
  'c': 'c',
  'go': 'go',
  'rust': 'rust',
  'typescript': 'typescript',
};

interface PistonExecuteRequest {
  language: string;
  version: string;
  files: Array<{
    name?: string;
    content: string;
  }>;
  stdin?: string;
  args?: string[];
  compile_timeout?: number;
  run_timeout?: number;
  compile_memory_limit?: number;
  run_memory_limit?: number;
}

interface PistonExecuteResponse {
  language: string;
  version: string;
  run: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
  compile?: {
    stdout: string;
    stderr: string;
    code: number;
    signal: string | null;
    output: string;
  };
}

/**
 * Execute code against a single test case
 */
const executeCodeWithInput = async (
  code: string,
  language: string,
  stdin: string,
  timeout: number = 3000
): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
  executionTime: number;
  compileError?: string;
}> => {
  const startTime = Date.now();
  
  try {
    const pistonLang = LANGUAGE_MAP[language.toLowerCase()] || 'python';
    
    const executeRequest: PistonExecuteRequest = {
      language: pistonLang,
      version: '*',
      files: [{ content: code }],
      stdin: stdin,
      compile_timeout: 10000,
      run_timeout: timeout,
      run_memory_limit: 128000000
    };

    const response = await fetch(`${PISTON_API}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(executeRequest)
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.status}`);
    }

    const result = await response.json() as PistonExecuteResponse;
    const executionTime = Date.now() - startTime;

    return {
      stdout: result.run.stdout || '',
      stderr: result.run.stderr || '',
      exitCode: result.run.code,
      executionTime,
      compileError: result.compile?.stderr || result.compile?.output
    };
  } catch (err: any) {
    return {
      stdout: '',
      stderr: err.message,
      exitCode: -1,
      executionTime: Date.now() - startTime
    };
  }
};

/**
 * Compare two outputs (parse JSON and compare)
 */
const compareOutputs = (actualStr: string, expectedValue: any): boolean => {
  try {
    // Try to parse actual output as JSON
    const actual = JSON.parse(actualStr.trim());
    
    // Deep equality comparison
    return JSON.stringify(actual) === JSON.stringify(expectedValue);
  } catch (err) {
    // If parse fails, fall back to string comparison
    const normalizeOutput = (str: string) => {
      return str.trim().replace(/\r\n/g, '\n').replace(/\s+$/gm, '');
    };
    
    return normalizeOutput(actualStr) === normalizeOutput(String(expectedValue));
  }
};

/**
 * Generate wrapper code that calls the Solution class and outputs JSON
 */
const generateWrapperCode = (userCode: string, testCaseInput: any, language: string, problemIO?: ProblemIO): string => {
  if (language === 'python') {
    // Generate function call with parameters
    const params = problemIO?.input?.params || [];
    const paramNames = params.map((p: any) => p.name);
    const argsStr = paramNames.map((name: string) => `input_data["${name}"]`).join(', ');
    
    return `import json
from typing import List, Dict, Any

${userCode}

# Test execution wrapper
solution = Solution()
input_data = ${JSON.stringify(testCaseInput)}
result = solution.solve(${argsStr})
print(json.dumps(result))
`;
  } else if (language === 'java') {
    // For Java, this is more complex - for now, simple approach
    return userCode + `
// Test execution wrapper
public static void main(String[] args) {
    Solution solution = new Solution();
    // TODO: Parse input and call solve method
    System.out.println("[]");
}
`;
  } else if (language === 'cpp' || language === 'c++') {
    // For C++, similar complexity
    return userCode + `
int main() {
    Solution solution;
    // TODO: Parse input and call solve method
    cout << "[]" << endl;
    return 0;
}
`;
  }
  
  return userCode;
};

/**
 * Execute code against all test cases for a problem
 */
export const executeCode = async (
  code: string, 
  language: string, 
  problemId: string,
  runSampleOnly: boolean = false
) => {
  const startTime = Date.now();
  
  try {
    // Fetch problem IO structure
    const { data: problemIOData, error: ioError } = await supabaseAdmin
      .from('problem_io')
      .select('*')
      .eq('problem_id', problemId)
      .maybeSingle();

    if (ioError) {
      console.warn('Error fetching problem IO:', ioError);
    }

    const problemIO = problemIOData as ProblemIO | null;

    // Fetch test cases from database
    const { data: testCases, error: tcError } = await supabaseAdmin
      .from('test_cases')
      .select('*')
      .eq('problem_id', problemId)
      .order('display_order', { ascending: true });

    if (tcError) {
      console.error('Error fetching test cases:', tcError);
      throw new Error(`Failed to fetch test cases: ${tcError.message}`);
    }

    if (!testCases || testCases.length === 0) {
      return {
        status: 'NO_TEST_CASES',
        output: 'No test cases found for this problem',
        error: 'No test cases available',
        execution_time: Date.now() - startTime,
        memory_used: 0,
        test_cases: [],
        passed: false
      };
    }

    // Filter to sample test cases if in "run" mode
    const casesToRun = runSampleOnly 
      ? testCases.filter((tc: any) => tc.is_sample === true)
      : testCases;

    if (casesToRun.length === 0 && runSampleOnly) {
      return {
        status: 'NO_SAMPLE_CASES',
        output: 'No sample test cases found for this problem',
        error: null,
        execution_time: Date.now() - startTime,
        memory_used: 0,
        test_cases: [],
        passed: true
      };
    }

    // Execute code against each test case
    const testCaseResults = [];
    let allPassed = true;
    let firstOutput = '';
    let firstError = '';
    let hasCompileError = false;

    for (const testCase of casesToRun) {
      // Generate wrapper code with test case input
      const wrappedCode = generateWrapperCode(code, testCase.input, language, problemIO || undefined);
      
      const result = await executeCodeWithInput(
        wrappedCode,
        language,
        '', // No stdin needed, input is in the code
        3000
      );

      // Check for compile errors (only need to check once)
      if (result.compileError && !hasCompileError) {
        hasCompileError = true;
        firstError = result.compileError;
        allPassed = false;
        
        testCaseResults.push({
          test_case_id: testCase.id,
          name: testCase.name || `Test Case ${testCase.display_order + 1}`,
          passed: false,
          input: testCase.is_sample ? testCase.input : '[Hidden]',
          expected_output: testCase.is_sample ? testCase.expected_output : '[Hidden]',
          actual_output: '',
          error: result.compileError,
          execution_time_ms: result.executionTime,
          points: 0
        });
        
        continue; // Skip remaining test cases if compilation failed
      }

      if (hasCompileError) {
        // If we already have a compile error, mark remaining tests as failed
        testCaseResults.push({
          test_case_id: testCase.id,
          name: testCase.name || `Test Case ${testCase.display_order + 1}`,
          passed: false,
          input: testCase.is_sample ? testCase.input : '[Hidden]',
          expected_output: testCase.is_sample ? testCase.expected_output : '[Hidden]',
          actual_output: '',
          error: 'Compilation failed',
          execution_time_ms: 0,
          points: 0
        });
        continue;
      }

      // Store first output for display
      if (!firstOutput && result.stdout) {
        firstOutput = result.stdout;
      }
      if (!firstError && result.stderr) {
        firstError = result.stderr;
      }

      // Runtime error check
      if (result.exitCode !== 0) {
        allPassed = false;
        testCaseResults.push({
          test_case_id: testCase.id,
          name: testCase.name || `Test Case ${testCase.display_order + 1}`,
          passed: false,
          input: testCase.is_sample ? testCase.input : '[Hidden]',
          expected_output: testCase.is_sample ? testCase.expected_output : '[Hidden]',
          actual_output: result.stdout,
          error: result.stderr || 'Runtime error: Non-zero exit code',
          execution_time_ms: result.executionTime,
          points: 0
        });
        continue;
      }

      // Compare outputs (parse JSON and compare with expected JSONB)
      const passed = compareOutputs(result.stdout, testCase.expected_output);
      
      if (!passed) {
        allPassed = false;
      }

      testCaseResults.push({
        test_case_id: testCase.id,
        name: testCase.name || `Test Case ${testCase.display_order + 1}`,
        passed,
        input: testCase.is_sample ? testCase.input : '[Hidden]',
        expected_output: testCase.is_sample ? testCase.expected_output : '[Hidden]',
        actual_output: result.stdout,
        error: passed ? null : 'Output does not match expected',
        execution_time_ms: result.executionTime,
        points: passed ? (testCase.points || 10) : 0
      });
    }

    // Calculate final status
    let status = 'ACCEPTED';
    if (hasCompileError) {
      status = 'COMPILE_ERROR';
    } else if (!allPassed) {
      const hasRuntimeError = testCaseResults.some(tc => tc.error && tc.error !== 'Output does not match expected');
      status = hasRuntimeError ? 'RUNTIME_ERROR' : 'WRONG_ANSWER';
    }

    const totalExecutionTime = Date.now() - startTime;
    const totalPoints = testCaseResults.reduce((sum, tc) => sum + tc.points, 0);
    const maxPoints = casesToRun.reduce((sum, tc) => sum + (tc.points || 10), 0);

    // Don't include raw code output in the response - it's just the solution's return value
    // which is not meaningful to display (e.g., [0, 1] for array return)
    return {
      status,
      output: hasCompileError ? firstError : '',
      error: hasCompileError ? firstError : null,
      execution_time: totalExecutionTime,
      memory_used: 0,
      test_cases: testCaseResults,
      passed: allPassed,
      total_points: totalPoints,
      max_points: maxPoints,
      passed_count: testCaseResults.filter(tc => tc.passed).length,
      total_count: testCaseResults.length
    };
  } catch (err: any) {
    console.error('Code execution error:', err);
    return {
      status: 'ERROR',
      output: '',
      error: `Execution failed: ${err.message}`,
      execution_time: Date.now() - startTime,
      memory_used: 0,
      test_cases: [],
      passed: false
    };
  }
};