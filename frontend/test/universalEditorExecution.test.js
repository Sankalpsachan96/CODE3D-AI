import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeUniversalExecutionResult } from '../src/services/universalEditorExecution.js';
import { FALLBACK_SCENE_STATE, resolveSceneState } from '../src/visualizers/sceneState.js';

test('editor uses actual stdout when the output array is empty', () => {
  const execution = normalizeUniversalExecutionResult({
    success: true,
    status: 'COMPLETED',
    output: [],
    stdout: '10\r\n20\r\n30\r\n40\r\n',
    executionTimeMs: 42,
  });

  assert.deepEqual(execution.output, ['10', '20', '30', '40']);
  assert.equal(execution.status, 'COMPLETED');
  assert.equal(execution.executionTimeMs, 42);
});

test('editor removes the split artifact after a final stdout newline', () => {
  const execution = normalizeUniversalExecutionResult({
    success: true,
    status: 'COMPLETED',
    output: ['10', '20', '30', '40', ''],
    stdout: '10\n20\n30\n40\n',
  });

  assert.deepEqual(execution.output, ['10', '20', '30', '40']);
});

test('editor displays API compile/runtime errors and does not claim missing timing', () => {
  const execution = normalizeUniversalExecutionResult({
    success: false,
    status: 'ERROR',
    message: 'Compilation failed',
    stderr: 'Main.java:1: error: expected ;',
    executionTimeMs: null,
    traceSupported: true,
    steps: [{ step: 1 }],
  });

  assert.equal(execution.status, 'ERROR');
  assert.equal(execution.error, 'Compilation failed\nMain.java:1: error: expected ;');
  assert.equal(execution.executionTimeMs, null);
  assert.equal(execution.traceSupported, false);
  assert.deepEqual(execution.steps, []);
});

test('unsupported source keeps execution output but cannot expose a trace', () => {
  const execution = normalizeUniversalExecutionResult({
    success: true,
    status: 'COMPLETED',
    output: ['40'],
    traceSupported: false,
    traceGeneric: true,
    traceReason: 'No array traversal model is available.',
    steps: [],
  });

  assert.deepEqual(execution.output, ['40']);
  assert.equal(execution.traceSupported, false);
  assert.equal(execution.traceReason, 'Only generic source-level events were detected; no reliable data-structure trace is available.');
});

test('Universal Editor suppresses the DSA scene sample fallback when no trace exists', () => {
  assert.equal(resolveSceneState(null, { showFallback: false }), null);
  assert.equal(resolveSceneState(null), FALLBACK_SCENE_STATE);
  assert.deepEqual(resolveSceneState({ type: 'array', values: [10, 20, 30, 40] }, { showFallback: false }).values, [10, 20, 30, 40]);
});
