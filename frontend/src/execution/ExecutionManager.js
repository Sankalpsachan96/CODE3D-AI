/**
 * CODE3D-AI - Master Execution Manager
 * 
 * Coordinates code execution between:
 * 1. Sandboxed local execution engine (Java, Python, JS, C++, C)
 * 2. Cloud backend execution server (via /api/executions/run)
 * 3. Structural DSA detection & 3D visualization state synthesis
 */

import { executionEngine } from './ExecutionEngine.js';
import { detectDataStructure, detectAlgorithm } from '../dsa/index.js';
import { executeCode as executeRemoteCode } from '../services/execution.js';
import { getExecutionTrace } from '../services/executionSimulator.js';

export class ExecutionManager {
  /**
   * Run execution pipeline on code
   * @param {object} params
   * @param {string} params.code - Source code
   * @param {string} params.language - Language ('java', 'javascript', 'python', 'cpp', 'c')
   * @param {string} [params.input] - Custom input
   * @param {string} [params.archetype] - Explicit algorithm archetype
   * @param {boolean} [params.preferBackend] - Attempt backend execution first
   * @returns {Promise<{ success: boolean, steps: Array, error?: object, language: string, detectedDsa: string, detectedAlgorithm: string }>}
   */
  async run({ code, language = 'java', input = '', archetype = null, preferBackend = false, strictBackend = false }) {
    if (!code || !code.trim()) {
      return {
        success: false,
        error: { message: 'Code cannot be empty.', line: 1 },
        steps: [],
      };
    }

    let result = null;

    // 1. If backend execution requested and online, attempt backend first
    if (preferBackend) {
      try {
        const remoteRes = await executeRemoteCode({ code, language, input, title: archetype || 'Custom Run', universal: strictBackend });
        if (remoteRes && remoteRes.success && remoteRes.steps && remoteRes.steps.length > 0) {
          result = remoteRes;
        } else if (strictBackend && remoteRes && remoteRes.success === false) {
          return {
            success: false,
            language,
            steps: [],
            error: {
              message: remoteRes.message || remoteRes.error || 'Execution failed.',
              line: remoteRes.errorLine || 1,
              code: remoteRes.errorCode || 'EXECUTION_ERROR',
            },
          };
        }
      } catch (err) {
        // Fallback to local engine
      }
    }

    // 2. Local Sandboxed Execution Engine
    if (!result || !result.steps || result.steps.length === 0) {
      const localRes = await executionEngine.execute(code, language, { input, archetype });
      if (localRes.success && localRes.steps && localRes.steps.length > 0) {
        result = localRes;
      } else if (localRes.error && localRes.error.type === 'COMPILE_ERROR') {
        // Return syntax error immediately
        return {
          success: false,
          error: localRes.error,
          language,
          steps: [],
        };
      }
    }

    // 3. Resilient simulator fallback for rich DSA animations
    if (!result || !result.steps || result.steps.length === 0) {
      try {
        const simSteps = getExecutionTrace(code, language, input, archetype);
        if (simSteps && simSteps.length > 0) {
          result = {
            success: true,
            language,
            steps: simSteps,
            totalSteps: simSteps.length,
          };
        }
      } catch (simErr) {
        // Keep checking
      }
    }

    if (!result || !result.steps || result.steps.length === 0) {
      return {
        success: false,
        error: { message: 'Unable to generate execution trace. Please check code syntax.', line: 1 },
        language,
        steps: [],
      };
    }

    // 4. Enrich trace with DSA detection
    const sampleVars = result.steps[result.steps.length - 1]?.variables || {};
    const detectedDsa = detectDataStructure(sampleVars, code, archetype);
    const detectedAlgorithm = detectAlgorithm(code, result.steps);

    // Ensure each step has dataStructureState
    result.steps.forEach((step, idx) => {
      if (!step.dataStructureState || !step.dataStructureState.type) {
        step.dataStructureState = {
          type: detectedDsa || 'array',
          values: Array.isArray(step.variables?.arr) ? step.variables.arr : [],
          label: `Step ${idx + 1}`,
        };
      }
    });

    return {
      success: true,
      language: result.language || language,
      steps: result.steps,
      totalSteps: result.steps.length,
      detectedDsa,
      detectedAlgorithm,
    };
  }
}

export const executionManager = new ExecutionManager();
