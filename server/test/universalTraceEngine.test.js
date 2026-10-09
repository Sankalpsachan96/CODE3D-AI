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


test('Java int[] declarations produce a real array traversal trace with active indices', () => {
  const code = `public class Main {
  public static void main(String[] args) {
    int[] arr = {10, 20, 30, 40};
    for (int i = 0; i < arr.length; i++) {
      System.out.println(arr[i]);
    }
  }
}`;
  const result = universalTrace.generateTrace(code, 'java', {
    success: true,
    output: '10\\n20\\n30\\n40\\n',
  });

  assert.equal(result.supported, true);
  assert.notEqual(result.generic, true);
  assert.equal(result.algorithm, 'array_traversal');
  assert.equal(result.dataStructure, 'array');

  const initial = result.events.find((event) => event.type === 'initial_state');
  assert.deepEqual(initial.array, [10, 20, 30, 40]);
  assert.equal(initial.arrayName, 'arr');

  const visits = result.events.filter((event) => event.type === 'visit');
  assert.deepEqual(visits.map((event) => event.index), [0, 1, 2, 3]);
  assert.deepEqual(visits.map((event) => event.value), [10, 20, 30, 40]);
  assert.ok(visits.every((event) => event.array.length === 4));
});

test('C-style array declarations remain recognized after Java array parsing fix', () => {
  const result = universalTrace.generateTrace(
    'int arr[4] = {10, 20, 30, 40}; for (int i = 0; i < 4; i++) { printf("%d", arr[i]); }',
    'c',
    { success: true, output: '10 20 30 40' }
  );

  assert.equal(result.algorithm, 'array_traversal');
  assert.deepEqual(result.events[0].array, [10, 20, 30, 40]);
});
