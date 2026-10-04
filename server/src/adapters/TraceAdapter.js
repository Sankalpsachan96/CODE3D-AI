/**
 * Base TraceAdapter class defining the canonical execution trace interface
 * for all 5 languages (Java, C++, Python, JavaScript, C).
 */

export const TraceEventType = Object.freeze({
  PROGRAM_START: 'PROGRAM_START',
  PROGRAM_END: 'PROGRAM_END',
  VARIABLE_DECLARE: 'VARIABLE_DECLARE',
  VARIABLE_UPDATE: 'VARIABLE_UPDATE',
  ASSIGNMENT: 'ASSIGNMENT',
  EXPRESSION: 'EXPRESSION',
  CONDITION_CHECK: 'CONDITION_CHECK',
  LOOP_START: 'LOOP_START',
  LOOP_ITERATION: 'LOOP_ITERATION',
  LOOP_END: 'LOOP_END',
  FUNCTION_CALL: 'FUNCTION_CALL',
  FUNCTION_RETURN: 'FUNCTION_RETURN',
  ARRAY_CREATE: 'ARRAY_CREATE',
  ARRAY_READ: 'ARRAY_READ',
  ARRAY_WRITE: 'ARRAY_WRITE',
  OBJECT_CREATE: 'OBJECT_CREATE',
  OBJECT_UPDATE: 'OBJECT_UPDATE',
  POINTER_UPDATE: 'POINTER_UPDATE',
  REFERENCE_UPDATE: 'REFERENCE_UPDATE',
  SWAP: 'SWAP',
  COMPARE: 'COMPARE',
  PUSH: 'PUSH',
  POP: 'POP',
  ENQUEUE: 'ENQUEUE',
  DEQUEUE: 'DEQUEUE',
  LINK: 'LINK',
  UNLINK: 'UNLINK',
  TREE_INSERT: 'TREE_INSERT',
  TREE_DELETE: 'TREE_DELETE',
  TREE_TRAVERSE: 'TREE_TRAVERSE',
  GRAPH_VISIT: 'GRAPH_VISIT',
  GRAPH_EDGE: 'GRAPH_EDGE',
  RETURN: 'RETURN',
  PRINT: 'PRINT',
  ERROR: 'ERROR',
});

export class TraceAdapter {
  constructor(language) {
    this.language = language;
    this.maxSteps = 10000;
  }

  /**
   * Execute or parse code and generate a normalized trace object.
   * @param {string} code Source code string
   * @param {string} input Optional user input string
   * @param {object} options Execution options
   * @returns {Promise<{ executionId: string, language: string, status: string, steps: Array, totalSteps: number, dataStructureState: object }>}
   */
  async generateTrace(code, input = '', options = {}) {
    throw new Error('generateTrace must be implemented by subclass.');
  }

  createStep({
    stepNumber,
    lineNumber,
    eventType,
    variables = {},
    scope = 'main',
    dataStructureState = null,
    output = [],
    operation = '',
    explanation = '',
    changedVariable = null,
  }) {
    return {
      step: stepNumber,
      line: lineNumber,
      event: eventType,
      variables: { ...variables },
      scope,
      operation: operation || eventType,
      explanation: explanation || `${eventType} at line ${lineNumber}`,
      changedVariable,
      dataStructureState: dataStructureState ? { ...dataStructureState } : null,
      output: Array.isArray(output) ? [...output] : [output].filter(Boolean),
    };
  }
}
