/**
 * CODE3D-AI - Sandboxed Execution Limits
 * 
 * Configurable safety limits to prevent infinite loops,
 * memory exhaustion, and browser freezing.
 */

export const EXECUTION_LIMITS = {
  MAX_EXECUTION_TIME: 5000,      // 5 seconds max runtime
  MAX_TRACE_STEPS: 10000,        // 10,000 maximum recorded steps
  MAX_OUTPUT_LENGTH: 100000,     // 100 KB stdout/stderr buffer
  MAX_RECURSION_DEPTH: 500,      // 500 call stack depth
  MAX_ARRAY_SIZE: 1000,          // 1,000 elements in array/collection
  MAX_VARIABLE_COUNT: 200,       // 200 distinct local variables in scope
  MAX_LOOP_ITERATIONS: 5000,     // 5,000 loop iterations before abort
};

export const SPEED_PRESETS = [0.25, 0.5, 1, 1.5, 2, 4];
