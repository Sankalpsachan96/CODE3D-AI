/**
 * CODE3D-AI - Sandboxed Execution Engine
 * 
 * Safely executes source code using the appropriate language adapter,
 * enforcing limits and producing verified execution traces.
 */

import { getLanguageAdapter, detectLanguage } from './languages/index.js';
import { validateTrace } from './TraceValidator.js';
import { ExecutionError } from './ExecutionError.js';
import { EXECUTION_LIMITS } from './limits.js';

export class ExecutionEngine {
  constructor() {
    this.limits = EXECUTION_LIMITS;
  }

  /**
   * Execute source code
   * @param {string} code - User source code
   * @param {string} [language] - Language name ('java', 'javascript', 'python', 'cpp', 'c')
   * @param {object} [options] - Optional execution parameters
   * @returns {Promise<object>} ExecutionResult
   */
  async execute(code, language = null, options = {}) {
    const startTime = performance.now();
    const effectiveLang = language || detectLanguage(code);
    const adapter = getLanguageAdapter(effectiveLang);

    if (!adapter) {
      return {
        success: false,
        error: ExecutionError.createRuntimeError(`Unsupported language: ${effectiveLang}`),
        language: effectiveLang,
        steps: [],
        totalSteps: 0,
      };
    }

    try {
      // 1. Syntax Validation
      const validation = adapter.validateSyntax(code);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.error,
          language: effectiveLang,
          steps: [],
          totalSteps: 0,
        };
      }

      // 2. Sandboxed Execution
      const traceResult = adapter.execute(code, options);

      // 3. Trace Validation
      const traceValidation = validateTrace(traceResult.steps);
      if (!traceValidation.valid) {
        return {
          success: false,
          error: ExecutionError.createRuntimeError(`Trace validation error: ${traceValidation.error}`),
          language: effectiveLang,
          steps: [],
          totalSteps: 0,
        };
      }

      const durationMs = Math.round(performance.now() - startTime);

      return {
        success: true,
        language: effectiveLang,
        steps: traceResult.steps,
        totalSteps: traceResult.steps.length,
        finalOutput: traceResult.finalOutput || [],
        durationMs,
        error: null,
      };
    } catch (err) {
      const execError = err instanceof ExecutionError
        ? err
        : ExecutionError.createRuntimeError(err.message || 'Execution failed');

      return {
        success: false,
        error: execError,
        language: effectiveLang,
        steps: [],
        totalSteps: 0,
        durationMs: Math.round(performance.now() - startTime),
      };
    }
  }
}

export const executionEngine = new ExecutionEngine();
