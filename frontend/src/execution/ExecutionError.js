/**
 * CODE3D-AI - Standardized Execution Error Classes
 * 
 * Supports 3 major error categories:
 * 1. COMPILE_ERROR (Syntax / Lexical / Grammar)
 * 2. RUNTIME_ERROR (Index Out of Bounds, Null Pointer, Division by Zero)
 * 3. LIMIT_ERROR (Timeout, Step Limit Exceeded, Max Output Exceeded)
 */

export const ErrorType = {
  COMPILE_ERROR: 'COMPILE_ERROR',
  RUNTIME_ERROR: 'RUNTIME_ERROR',
  TIMEOUT: 'TIMEOUT',
  LIMIT_ERROR: 'LIMIT_ERROR',
  SECURITY_ERROR: 'SECURITY_ERROR',
};

export class ExecutionError extends Error {
  constructor({
    type = ErrorType.RUNTIME_ERROR,
    message,
    line = 1,
    column = 1,
    suggestion = '',
    sourceSnippet = '',
  }) {
    super(message);
    this.name = 'ExecutionError';
    this.type = type;
    this.line = line;
    this.column = column;
    this.suggestion = suggestion;
    this.sourceSnippet = sourceSnippet;
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      message: this.message,
      line: this.line,
      column: this.column,
      suggestion: this.suggestion,
      sourceSnippet: this.sourceSnippet,
    };
  }

  static createSyntaxError(message, line = 1, column = 1, suggestion = 'Check syntax and punctuation.') {
    return new ExecutionError({
      type: ErrorType.COMPILE_ERROR,
      message,
      line,
      column,
      suggestion,
    });
  }

  static createRuntimeError(message, line = 1, suggestion = 'Check array bounds and variable values.') {
    return new ExecutionError({
      type: ErrorType.RUNTIME_ERROR,
      message,
      line,
      suggestion,
    });
  }

  static createTimeoutError(maxTimeMs) {
    return new ExecutionError({
      type: ErrorType.TIMEOUT,
      message: `Execution exceeded safety timeout of ${maxTimeMs / 1000}s. Possible infinite loop.`,
      suggestion: 'Check loop increment and termination conditions.',
    });
  }

  static createStepLimitError(maxSteps) {
    return new ExecutionError({
      type: ErrorType.LIMIT_ERROR,
      message: `Execution exceeded maximum step limit of ${maxSteps.toLocaleString()} steps.`,
      suggestion: 'Reduce input size or verify loop condition terminates.',
    });
  }
}
