import { getAdapter } from '../adapters/index.js';

export const ExecutionLimits = Object.freeze({
  TIMEOUT_MS: 5000,
  MAX_OUTPUT_BYTES: 100 * 1024, // 100 KB
  MAX_TRACE_STEPS: 10000,
  MAX_CODE_LENGTH: 50000,
});

export const ExecutionErrorCode = Object.freeze({
  SYNTAX_ERROR: 'SYNTAX_ERROR',
  COMPILE_ERROR: 'COMPILE_ERROR',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  TIMEOUT: 'TIMEOUT',
  MEMORY_LIMIT: 'MEMORY_LIMIT',
  OUTPUT_LIMIT: 'OUTPUT_LIMIT',
  TRACE_LIMIT: 'TRACE_LIMIT',
  UNSUPPORTED_FEATURE: 'UNSUPPORTED_FEATURE',
  SANDBOX_ERROR: 'SANDBOX_ERROR',
});

/**
 * Sandboxed Execution Queue & Runner
 */
export async function executeCodeInSandbox({ code, language, input = '', options = {} }) {
  const startTime = Date.now();

  // Validate input bounds
  if (!code || typeof code !== 'string') {
    return {
      status: 'ERROR',
      errorCode: ExecutionErrorCode.SYNTAX_ERROR,
      message: 'Source code is required and must be a string.',
      steps: [],
      executionTimeMs: 0,
    };
  }

  if (code.length > ExecutionLimits.MAX_CODE_LENGTH) {
    return {
      status: 'ERROR',
      errorCode: ExecutionErrorCode.SANDBOX_ERROR,
      message: `Code size exceeds maximum limit of ${ExecutionLimits.MAX_CODE_LENGTH} characters.`,
      steps: [],
      executionTimeMs: 0,
    };
  }

  // Security blacklist check: prevent system access attempts
  const dangerousPatterns = [
    /process\.exit/i,
    /child_process/i,
    /require\s*\(\s*['"]fs['"]\s*\)/i,
    /import\s+.*\s+from\s+['"]fs['"]/i,
    /System\.exit/i,
    /Runtime\.getRuntime/i,
    /system\s*\(/i,
    /exec\s*\(/i,
    /__import__\s*\(\s*['"]os['"]\s*\)/i,
    /import\s+os\b/i,
    /import\s+subprocess\b/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(code)) {
      return {
        status: 'ERROR',
        errorCode: ExecutionErrorCode.SANDBOX_ERROR,
        message: 'Security Policy Violation: Restricted system call or filesystem access detected.',
        steps: [],
        executionTimeMs: 0,
      };
    }
  }

  try {
    const adapter = getAdapter(language);

    // Run execution with 5-second timeout promise race
    const executionPromise = adapter.generateTrace(code, input, options);
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('EXECUTION_TIMEOUT')), ExecutionLimits.TIMEOUT_MS)
    );

    const result = await Promise.race([executionPromise, timeoutPromise]);
    const executionTimeMs = Date.now() - startTime;

    // Check trace step bounds
    if (result.steps && result.steps.length > ExecutionLimits.MAX_TRACE_STEPS) {
      result.steps = result.steps.slice(0, ExecutionLimits.MAX_TRACE_STEPS);
      result.status = 'TRUNCATED';
      result.warning = `Trace exceeded maximum limit of ${ExecutionLimits.MAX_TRACE_STEPS} steps and was truncated.`;
    }

    return {
      status: 'COMPLETED',
      executionId: result.executionId,
      language: result.language,
      steps: result.steps || [],
      totalSteps: (result.steps || []).length,
      finalVariables: result.finalVariables || {},
      output: result.output || [],
      executionTimeMs,
      complexity: result.complexity || null,
    };
  } catch (err) {
    const executionTimeMs = Date.now() - startTime;

    if (err.message === 'EXECUTION_TIMEOUT') {
      return {
        status: 'ERROR',
        errorCode: ExecutionErrorCode.TIMEOUT,
        message: `Execution timed out after ${ExecutionLimits.TIMEOUT_MS / 1000} seconds. Possible infinite loop.`,
        steps: [],
        executionTimeMs,
      };
    }

    return {
      status: 'ERROR',
      errorCode: ExecutionErrorCode.RUNTIME_ERROR,
      message: err.message || 'Execution failed due to runtime error.',
      steps: [],
      executionTimeMs,
    };
  }
}
