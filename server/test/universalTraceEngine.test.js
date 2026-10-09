import assert from 'node:assert/strict';
import test from 'node:test';
import universalTrace from '../src/services/universalTraceEngine.cjs';

test('universal trace engine reports unsupported patterns without inventing steps', () => {
  const result = universalTrace.generateTrace(
    'function bubbleSort(values) { return values; }',
    'javascript',
    { success: true, output: '[3, 2, 1]' }
  );

  assert.equal(result.supported, false);
  assert.deepEqual(result.events, []);
  assert.match(result.reason, /not recognized/i);
});

test('universal trace engine marks generic source-derived events as generic', () => {
  const result = universalTrace.generateTrace(
    'print(1 + 1)',
    'python',
    { success: true, output: '2' }
  );

  assert.equal(result.supported, true);
  assert.equal(result.generic, true);
  assert.match(result.reason, /source structure/i);
});
