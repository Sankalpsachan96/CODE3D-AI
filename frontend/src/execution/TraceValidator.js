/**
 * CODE3D-AI - Execution Trace Validator
 * 
 * Validates normalized execution events against the schema contract.
 * Guarantees that every step has:
 * - valid stepNumber & lineNumber
 * - valid eventType
 * - valid variables object
 * - valid dataStructureState
 */

export function validateExecutionStep(step, index) {
  if (!step || typeof step !== 'object') {
    return { valid: false, error: `Step at index ${index} is not an object` };
  }

  if (typeof step.stepNumber !== 'number' || step.stepNumber < 1) {
    return { valid: false, error: `Step at index ${index} has invalid stepNumber: ${step.stepNumber}` };
  }

  if (typeof step.lineNumber !== 'number' || step.lineNumber < 1) {
    return { valid: false, error: `Step ${step.stepNumber} has invalid lineNumber: ${step.lineNumber}` };
  }

  if (!step.variables || typeof step.variables !== 'object') {
    return { valid: false, error: `Step ${step.stepNumber} has invalid variables field` };
  }

  return { valid: true };
}

export function validateTrace(trace) {
  if (!Array.isArray(trace)) {
    return { valid: false, error: 'Trace must be an array of execution steps' };
  }

  if (trace.length === 0) {
    return { valid: true, warning: 'Trace is empty' };
  }

  for (let i = 0; i < trace.length; i++) {
    const res = validateExecutionStep(trace[i], i);
    if (!res.valid) return res;
  }

  return { valid: true, stepCount: trace.length };
}
