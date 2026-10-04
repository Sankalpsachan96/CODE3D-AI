/**
 * CODE3D-AI - Java Language Adapter
 * 
 * Leverages the full AST parser & deterministic simulation engine from src/engine.
 */

import { LanguageAdapter } from './LanguageAdapter.js';
import { executeJavaCode } from '../../engine/index.js';
import { ExecutionError } from '../ExecutionError.js';

export class JavaAdapter extends LanguageAdapter {
  constructor() {
    super('java');
  }

  detect(code) {
    const s = code.toLowerCase();
    return s.includes('public class') ||
      s.includes('system.out.println') ||
      s.includes('public static void main') ||
      s.includes('int[]') ||
      s.includes('new int');
  }

  validateSyntax(code) {
    if (!code || !code.trim()) {
      return { isValid: false, error: ExecutionError.createSyntaxError('Java code is empty.', 1, 1) };
    }
    return { isValid: true };
  }

  execute(code, options = {}) {
    const res = executeJavaCode(code, options.input || null, options.archetype || null);
    if (!res.success) {
      const err = res.error || {};
      throw new ExecutionError({
        message: err.message || 'Java execution failed',
        line: err.line || 1,
        column: err.column || 1,
        suggestion: err.suggestion || 'Review Java syntax and array boundaries.',
      });
    }

    return {
      program: { language: 'java' },
      steps: res.steps,
      totalSteps: res.totalSteps || res.steps.length,
      finalOutput: res.steps[res.steps.length - 1]?.output || [],
    };
  }
}
