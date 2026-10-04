/**
 * CODE3D-AI Execution & Visualization Type Definitions
 * Specification Phase 2, 7, 8, 35
 */

export type ExecutionState =
  | 'IDLE'
  | 'PARSING'
  | 'READY'
  | 'RUNNING'
  | 'PAUSED'
  | 'COMPLETED'
  | 'STOPPED'
  | 'ERROR';

export type EventType =
  | 'PROGRAM_START'
  | 'PROGRAM_END'
  | 'VARIABLES_INITIALIZED'
  | 'VARIABLE_DECLARE'
  | 'VARIABLE_ASSIGN'
  | 'VARIABLE_ACCUMULATE'
  | 'ARRAY_CREATION'
  | 'ARRAY_INIT'
  | 'ARRAY_ACCESS'
  | 'ARRAY_MODIFY'
  | 'ARRAY_SWAP'
  | 'LOOP_INIT'
  | 'LOOP_INCREMENT'
  | 'CONDITION_CHECK'
  | 'BRANCH_TAKEN'
  | 'BRANCH_SKIPPED'
  | 'METHOD_CALL'
  | 'METHOD_RETURN'
  | 'TARGET_SEARCH_INIT'
  | 'TARGET_FOUND'
  | 'TWO_POINTER_INIT'
  | 'TWO_POINTER_STEP'
  | 'NEW_MAX_FOUND'
  | 'NEW_MIN_FOUND'
  | 'COUNTER_INCREMENT'
  | 'INPUT_READ'
  | 'PRINT_OUTPUT'
  | 'IO_CLOSE'
  | 'ERROR';

export interface ConditionInfo {
  expression: string;
  evaluation?: string;
  result: boolean;
  branch?: string;
  evaluatedValues?: Record<string, any>;
}

export interface CallStackFrame {
  methodName: string;
  lineNumber: number;
  localVariables: Record<string, any>;
  className?: string;
}

export interface DataStructureState {
  type:
    | 'array'
    | 'linked-list'
    | 'stack'
    | 'queue'
    | 'tree'
    | 'binary-search-tree'
    | 'graph'
    | 'hash-table'
    | 'heap'
    | 'matrix'
    | 'recursion'
    | 'universal-execution'
    | string;
  name?: string;
  values?: any[];
  activeIndex?: number | null;
  previousIndex?: number | null;
  pointers?: Record<string, number | null>;
  window?: { start: number; end: number };
  targetFound?: boolean;
  label?: string;
  focusInfo?: string;
  highlightedIndices?: number[];
  variables?: Record<string, any>;
  variableTypes?: Record<string, string>;
  activeVariable?: string | null;
  outputStream?: string[];
  calculationInfo?: {
    expression: string;
    result: string | number;
    targetVar: string;
  };
  metadata?: Record<string, any>;
}

export interface ExecutionStep {
  stepNumber: number;
  lineNumber: number;
  eventType?: EventType | string;
  type?: string;
  description?: string;
  explanation?: string;
  aiHint?: string;
  variables: Record<string, any>;
  changedVariable?: string | null;
  previousValue?: any;
  currentValue?: any;
  condition?: ConditionInfo | null;
  output: string[];
  callStack?: CallStackFrame[];
  dataStructureState?: DataStructureState;
  diff?: {
    added?: string[];
    updated?: string[];
    removed?: string[];
  };
}

export interface ExecuteResponse {
  status: 'SUCCESS' | 'ERROR';
  totalSteps: number;
  steps: ExecutionStep[];
  error?: string;
  message?: string;
}

export interface Breakpoint {
  line: number;
  enabled: boolean;
}

export interface AlgorithmMetrics {
  algorithmName: string;
  timeComplexity: string;
  spaceComplexity: string;
  stepCount: number;
  comparisons: number;
  swaps: number;
  arrayAccesses: number;
}
