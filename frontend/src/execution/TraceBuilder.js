/**
 * CODE3D-AI - Normalized Trace Builder & Event Types
 * 
 * Compliant with Section 8 specification:
 * Produces structured, validated execution events.
 */

import { EXECUTION_LIMITS } from './limits.js';
import { ExecutionError } from './ExecutionError.js';

export const TraceEventType = {
  PROGRAM_START: 'PROGRAM_START',
  PROGRAM_END: 'PROGRAM_END',
  VARIABLE_DECLARATION: 'VARIABLE_DECLARATION',
  VARIABLE_ASSIGNMENT: 'VARIABLE_ASSIGNMENT',
  EXPRESSION_EVALUATION: 'EXPRESSION_EVALUATION',
  CONDITION_CHECK: 'CONDITION_CHECK',
  LOOP_START: 'LOOP_START',
  LOOP_ITERATION: 'LOOP_ITERATION',
  LOOP_END: 'LOOP_END',
  FUNCTION_CALL: 'FUNCTION_CALL',
  FUNCTION_RETURN: 'FUNCTION_RETURN',
  ARRAY_ACCESS: 'ARRAY_ACCESS',
  ARRAY_UPDATE: 'ARRAY_UPDATE',
  OBJECT_CREATE: 'OBJECT_CREATE',
  OBJECT_UPDATE: 'OBJECT_UPDATE',
  STACK_PUSH: 'STACK_PUSH',
  STACK_POP: 'STACK_POP',
  QUEUE_ENQUEUE: 'QUEUE_ENQUEUE',
  QUEUE_DEQUEUE: 'QUEUE_DEQUEUE',
  LINK_CREATE: 'LINK_CREATE',
  LINK_REMOVE: 'LINK_REMOVE',
  TREE_INSERT: 'TREE_INSERT',
  TREE_DELETE: 'TREE_DELETE',
  TREE_ROTATE: 'TREE_ROTATE',
  GRAPH_VISIT: 'GRAPH_VISIT',
  GRAPH_EDGE: 'GRAPH_EDGE',
  SORT_COMPARE: 'SORT_COMPARE',
  SORT_SWAP: 'SORT_SWAP',
  SEARCH_COMPARE: 'SEARCH_COMPARE',
  RECURSION_ENTER: 'RECURSION_ENTER',
  RECURSION_RETURN: 'RECURSION_RETURN',
  OUTPUT: 'OUTPUT',
  ERROR: 'ERROR',
};

export class TraceBuilder {
  constructor(language = 'java') {
    this.language = language;
    this.steps = [];
    this.currentOutput = [];
    this.callStack = [{ functionName: 'main', lineNumber: 1, arguments: {}, localVariables: {} }];
    this.startTime = Date.now();
  }

  addStep({
    lineNumber = 1,
    columnNumber = 1,
    eventType = TraceEventType.EXPRESSION_EVALUATION,
    variables = {},
    changedVariable = null,
    previousValue = null,
    currentValue = null,
    condition = null,
    outputLine = null,
    dataStructureState = null,
    explanation = '',
    aiHint = '',
    callStack = null,
  }) {
    if (this.steps.length >= EXECUTION_LIMITS.MAX_TRACE_STEPS) {
      throw ExecutionError.createStepLimitError(EXECUTION_LIMITS.MAX_TRACE_STEPS);
    }

    if (Date.now() - this.startTime > EXECUTION_LIMITS.MAX_EXECUTION_TIME) {
      throw ExecutionError.createTimeoutError(EXECUTION_LIMITS.MAX_EXECUTION_TIME);
    }

    if (outputLine !== null && outputLine !== undefined) {
      this.currentOutput.push(String(outputLine));
    }

    const stepNumber = this.steps.length + 1;
    const step = {
      stepId: `step-${stepNumber}`,
      stepNumber,
      lineNumber,
      columnNumber,
      eventType,
      variables: { ...variables },
      changedVariable,
      previousValue,
      currentValue,
      condition,
      output: [...this.currentOutput],
      callStack: callStack ? [...callStack] : [...this.callStack],
      dataStructureState: dataStructureState || {
        type: 'array',
        values: [],
      },
      explanation: explanation || `Executing line ${lineNumber}.`,
      aiHint: aiHint || '',
    };

    this.steps.push(step);
    return step;
  }

  pushCallStack(functionName, lineNumber, args = {}) {
    if (this.callStack.length >= EXECUTION_LIMITS.MAX_RECURSION_DEPTH) {
      throw new ExecutionError({
        message: `Maximum call stack recursion depth (${EXECUTION_LIMITS.MAX_RECURSION_DEPTH}) exceeded.`,
        line: lineNumber,
      });
    }
    this.callStack.push({ functionName, lineNumber, arguments: args, localVariables: {} });
  }

  popCallStack() {
    if (this.callStack.length > 1) {
      return this.callStack.pop();
    }
    return null;
  }

  getSteps() {
    return this.steps;
  }

  build() {
    return {
      program: { language: this.language },
      steps: this.steps,
      totalSteps: this.steps.length,
      finalOutput: this.currentOutput,
      durationMs: Date.now() - this.startTime,
    };
  }
}
