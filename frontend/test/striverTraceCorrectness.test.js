import assert from 'node:assert/strict';
import test from 'node:test';
import { generateStriverTrace } from '../src/services/striverTraceEngine.js';

test('DP trace does not substitute a generic Kadane recurrence for unrelated problems', () => {
  const trace = generateStriverTrace({
    id: 161,
    title: 'Matrix Chain Multiplication',
    archetype: 'dynamic-programming',
    input: '10, 20, 30, 40',
    language: 'java',
  });
  assert.deepEqual(trace, []);
});

test('matrix trace does not display a fabricated hard-coded 3x3 matrix', () => {
  const trace = generateStriverTrace({
    id: 1,
    title: 'Set Matrix Zeroes',
    archetype: 'matrix',
    input: '1, 1, 1, 1, 0, 1, 1, 1, 1',
    language: 'java',
  });
  assert.deepEqual(trace, []);
});
