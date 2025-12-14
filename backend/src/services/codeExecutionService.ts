/**
 * Code Execution Service - Real execution using Piston API
 * Piston: Free code execution engine (https://github.com/engineer-man/piston)
 */

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

export const executeCode = async (
  code: string, 
  language: string, 
  problemId: string,
  stdin?: string
) => {
  const startTime = Date.now();
  
  try {
    // Map language name
    const pistonLang = LANGUAGE_MAP[language.toLowerCase()] || 'python';
    
    // Prepare execution request
    const executeRequest: PistonExecuteRequest = {
      language: pistonLang,
      version: '*', // Use latest version
      files: [
        {
          content: code
        }
      ],
      stdin: stdin || '',
      compile_timeout: 10000, // 10s
      run_timeout: 3000,      // 3s
      run_memory_limit: 128000000 // 128MB
    };

    // Call Piston API
    const response = await fetch(`${PISTON_API}/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(executeRequest)
    });

    if (!response.ok) {
      throw new Error(`Piston API error: ${response.status} ${response.statusText}`);
    }

    const result: PistonExecuteResponse = await response.json() as PistonExecuteResponse;
    const executionTime = Date.now() - startTime;

    // Determine status
    let status = 'ACCEPTED';
    let passed = true;
    let error = null;

    if (result.compile && result.compile.code !== 0) {
      status = 'COMPILE_ERROR';
      passed = false;
      error = result.compile.stderr || result.compile.output;
    } else if (result.run.code !== 0) {
      status = 'RUNTIME_ERROR';
      passed = false;
      error = result.run.stderr || 'Program exited with non-zero code';
    } else if (result.run.signal) {
      status = 'RUNTIME_ERROR';
      passed = false;
      error = `Program terminated by signal: ${result.run.signal}`;
    }

    return {
      status,
      output: result.run.stdout || result.run.output || '',
      error,
      execution_time: executionTime,
      memory_used: 0, // Piston doesn't provide memory info
      test_cases: [],
      passed,
      compile_output: result.compile?.output,
      language: result.language,
      version: result.version
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