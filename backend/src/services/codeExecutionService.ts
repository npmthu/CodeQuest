/**
 * Code Execution Service - Code execution via Piston API ft. JSONB input/output handling
 * Piston: open source code execution engine (https://github.com/engineer-man/piston)
 * 
 * This module doesn't care at all about building/running containers, regardless of language, even C++, as Piston handles all that.
 * It simply sends code to Piston's API and retrieves the results.
 * The system currently works on server side. Although client could call Piston API directly and that's what we initially considered, but doing this in the server side making handling submission database much easier.
 */

import { supabaseAdmin } from '../config/database';
import type { TestCase } from '../models/TestCase';
import type { ProblemIO } from '../models/ProblemIO';

const PISTON_API = 'https://emkc.org/api/v2/piston';

// Language mapping: frontend name -> Piston language name
// Only 2 languages supported for now: Python and C++, but can be easily extended as long as Piston supports them
const LANGUAGE_MAP: Record<string, string> = {
  'python': 'python',
  'javascript': 'javascript',
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
// We could actually just send a code snippet to Piston that includes the user code
// but input/output structures we built is in json, so we need to generate code to parse json input and serialize output to json
const generateCppJsonSerializer = (): string => {
  return `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <map>
#include <unordered_map>
using namespace std;

// JSON serialization helpers
// int & long long: to_string because of no direct overload for long long in ostringstream, but string works
string toJson(int val) { return to_string(val); }
string toJson(long long val) { return to_string(val); }
// double: return as is
string toJson(double val) { 
    ostringstream oss;
    oss << val;
    return oss.str();
}
string toJson(bool val) { return val ? "true" : "false"; }

// Since JavaScript somehow convert \" to ", and C++ only keeps \" as \", we need to double escape here

string toJson(const string& val) { 
    string result = "\\"";
    for (char c : val) {
        if (c == '"') result += "\\\\\\"";
        else if (c == '\\\\') result += "\\\\\\\\";
        else if (c == '\\n') result += "\\\\n";
        else if (c == '\\t') result += "\\\\t";
        else result += c;
    }
    result += "\\"";
    return result;
}
string toJson(char val) { return toJson(string(1, val)); }

template<typename T>
string toJson(const vector<T>& vec) {
    string result = "[";
    for (size_t i = 0; i < vec.size(); i++) {
        if (i > 0) result += ",";
        result += toJson(vec[i]);
    }
    result += "]";
    return result;
}

template<typename T>
string toJson(const vector<vector<T>>& vec) {
    string result = "[";
    for (size_t i = 0; i < vec.size(); i++) {
        if (i > 0) result += ",";
        result += toJson(vec[i]);
    }
    result += "]";
    return result;
}
`;
};

/**
 * Generate cpp code to parse json input values
 */
const generateCppInputParser = (params: any[], testCaseInput: any): string => {
  const declarations: string[] = [];
  
  for (const param of params) {
    const name = param.name;
    const type = param.type;
    const elementType = param.element_type;
    const value = testCaseInput[name];
    
    // Handle array type with element_type field
    // Without array type handling, the input parser simply make an array look like:
    // int nums = 2,7,11,15;
    // => error: cannot convert 'int' to 'std::vector<int>'
    // Since we default to vector when the input json (from problem_io) is "type": "array"
    // Could have made it "vector", but that would be inconsistent with premade Python implementation before
    // We most likely would use "array" for any problem_io anyway so such fallback might be unnecessary
    if (type === 'array' && elementType) {
      const arr = Array.isArray(value) ? value : [];
      
      if (elementType === 'int' || elementType === 'integer') {
        declarations.push(`    vector<int> ${name} = {${arr.join(', ')}};`);
      } else if (elementType === 'long' || elementType === 'long long') {
        declarations.push(`    vector<long long> ${name} = {${arr.map((v: number) => v + 'LL').join(', ')}};`);
      } else if (elementType === 'double' || elementType === 'float') {
        declarations.push(`    vector<double> ${name} = {${arr.join(', ')}};`);
      } else if (elementType === 'string') {
        declarations.push(`    vector<string> ${name} = {${arr.map((s: string) => JSON.stringify(s)).join(', ')}};`);
      } else if (elementType === 'char' || elementType === 'character') {
        declarations.push(`    vector<char> ${name} = {${arr.map((c: string) => `'${c}'`).join(', ')}};`);
      } else if (elementType === 'bool' || elementType === 'boolean') {
        declarations.push(`    vector<bool> ${name} = {${arr.map((b: boolean) => b ? 'true' : 'false').join(', ')}};`);
      } else if (elementType === 'array' && param.element_type_2) {
        // 2D array
        const innerType = param.element_type_2;
        if (innerType === 'int' || innerType === 'integer') {
          const inner = arr.map((row: number[]) => `{${row.join(', ')}}`).join(', ');
          declarations.push(`    vector<vector<int>> ${name} = {${inner}};`);
        } else if (innerType === 'string') {
          const inner = arr.map((row: string[]) => `{${row.map((s: string) => JSON.stringify(s)).join(', ')}}`).join(', ');
          declarations.push(`    vector<vector<string>> ${name} = {${inner}};`);
        } else {
          // Default 2D int
          const inner = arr.map((row: number[]) => `{${row.join(', ')}}`).join(', ');
          declarations.push(`    vector<vector<int>> ${name} = {${inner}};`);
        }
      } else {
        // Default to int array
        declarations.push(`    vector<int> ${name} = {${arr.join(', ')}};`);
      }
    } else if (type === 'int' || type === 'integer') {
      declarations.push(`    int ${name} = ${value};`);
    } else if (type === 'long' || type === 'long long') {
      declarations.push(`    long long ${name} = ${value}LL;`);
    } else if (type === 'double' || type === 'float') {
      declarations.push(`    double ${name} = ${value};`);
    } else if (type === 'bool' || type === 'boolean') {
      declarations.push(`    bool ${name} = ${value ? 'true' : 'false'};`);
    } else if (type === 'string') {
      declarations.push(`    string ${name} = ${JSON.stringify(value)};`);
    } else if (type === 'char' || type === 'character') {
      declarations.push(`    char ${name} = '${value}';`);
    } else if (type === 'int[]' || type === 'vector<int>' || type === 'array<int>') {
      const arr = Array.isArray(value) ? value : [];
      declarations.push(`    vector<int> ${name} = {${arr.join(', ')}};`);
    } else if (type === 'long[]' || type === 'vector<long long>') {
      const arr = Array.isArray(value) ? value : [];
      declarations.push(`    vector<long long> ${name} = {${arr.map((v: number) => v + 'LL').join(', ')}};`);
    } else if (type === 'double[]' || type === 'vector<double>') {
      const arr = Array.isArray(value) ? value : [];
      declarations.push(`    vector<double> ${name} = {${arr.join(', ')}};`);
    } else if (type === 'string[]' || type === 'vector<string>') {
      const arr = Array.isArray(value) ? value : [];
      declarations.push(`    vector<string> ${name} = {${arr.map((s: string) => JSON.stringify(s)).join(', ')}};`);
    } else if (type === 'int[][]' || type === 'vector<vector<int>>') {
      const arr = Array.isArray(value) ? value : [];
      const inner = arr.map((row: number[]) => `{${row.join(', ')}}`).join(', ');
      declarations.push(`    vector<vector<int>> ${name} = {${inner}};`);
    } else if (type === 'char[]' || type === 'vector<char>') {
      const arr = Array.isArray(value) ? value : [];
      declarations.push(`    vector<char> ${name} = {${arr.map((c: string) => `'${c}'`).join(', ')}};`);
    } else {
      // Default: check if value is an array, otherwise treat as int
      if (Array.isArray(value)) {
        declarations.push(`    vector<int> ${name} = {${value.join(', ')}};`);
      } else {
        declarations.push(`    int ${name} = ${value};`);
      }
    }
  }
  
  return declarations.join('\n');
};

// The wrapper code is used to call the user's Solution class with test case input
// The initial code is default as:
// Class: Solution, Method: solve
// The code is sent to Piston along with the user's code
const generateWrapperCode = (userCode: string, testCaseInput: any, language: string, problemIO?: ProblemIO): string => {
  if (language === 'python') {
    const params = problemIO?.input?.params || [];
    const paramNames = params.map((p: any) => p.name);
    // argStr = input_data["param1"], input_data["param2"], ...
    const argsStr = paramNames.map((name: string) => `input_data["${name}"]`).join(', ');
    
    return `import json
from typing import List, Dict, Any

${userCode}

solution = Solution()
input_data = ${JSON.stringify(testCaseInput)}
result = solution.solve(${argsStr})

// This actually print to stdout captured by Piston, we will retrieve it later and treat as the output of the code execution
print(json.dumps(result))
`;
  } else if (language === 'cpp' || language === 'c++') {
    const params = problemIO?.input?.params || [];
    const paramNames = params.map((p: any) => p.name);
    const argsStr = paramNames.join(', ');
    const inputDeclarations = generateCppInputParser(params, testCaseInput);
    
    return `${generateCppJsonSerializer()}

${userCode}

int main() {
    Solution solution;
${inputDeclarations}


    // auto works for any return type that has toJson overloads
    auto result = solution.solve(${argsStr});

    // Again, this print to stdout captured by Piston
    cout << toJson(result) << endl;
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
      
      // result = { stdout, stderr, exitCode, executionTime, compileError }
      // => output = stdout
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

      // Since this is in for loop, result.stdout is output for each test case
      // firstOutput is only for the very first test case that produces output
      // We capture it for displaying in case of compile error
      // We actually don't use firstOutput here, just do it for consistency with firstError
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