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
    output: '10\n20\n30\n40\n',
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


test('representative DSA trace coverage: stack, queue, linked list, sorting and search', () => {
  const cases = [
    {
      name: 'stack LIFO',
      code: 'stack<int> s; s.push(10); s.push(20); s.pop();',
      language: 'cpp',
      algorithm: 'stack_operations',
      dataStructure: 'stack',
      stateField: 'stack',
      expected: [10],
    },
    {
      name: 'queue FIFO',
      code: 'queue<int> q; q.push(10); q.push(20); q.pop();',
      language: 'cpp',
      algorithm: 'queue_operations',
      dataStructure: 'queue',
      stateField: 'queue',
      expected: [20],
    },
    {
      name: 'linked-list node allocations',
      code: 'struct Node { int value; Node* next; }; Node* head = new Node(10); head->next = new Node(20);',
      language: 'cpp',
      algorithm: 'linked_list',
      dataStructure: 'linked_list',
      stateField: 'values',
      expected: [10, 20],
    },
    {
      name: 'bubble sort',
      code: 'int arr[3] = {3, 1, 2}; // bubble sort\nfor (int i=0; i<3; i++) { for (int j=0; j<2; j++) { if (arr[j] > arr[j+1]) { int t=arr[j]; arr[j]=arr[j+1]; arr[j+1]=t; } } }',
      language: 'cpp',
      algorithm: 'bubble_sort',
      dataStructure: 'array',
      stateField: 'array',
      expected: [1, 2, 3],
    },
    {
      name: 'linear search',
      code: 'int arr[4] = {10, 20, 30, 40}; int target = 30; for (int i=0; i<4; i++) { if (arr[i] == target) break; }',
      language: 'cpp',
      algorithm: 'linear_search',
      dataStructure: 'array',
      stateField: 'array',
      expected: [10, 20, 30, 40],
    },
  ];

  for (const item of cases) {
    const result = universalTrace.generateTrace(item.code, item.language, { success: true, output: '' });
    assert.equal(result.supported, true, item.name + ': supported');
    assert.notEqual(result.generic, true, item.name + ': specialized trace expected');
    assert.equal(result.algorithm, item.algorithm, item.name + ': algorithm');
    assert.equal(result.dataStructure, item.dataStructure, item.name + ': structure');
    const final = [...result.events].reverse().find((event) => event.type === 'complete' || event.type === 'pop' || event.type === 'insert');
    assert.ok(final, item.name + ': final state event exists');
    assert.deepEqual(final[item.stateField], item.expected, item.name + ': expected final state');
  }
});


test('JavaScript array literals produce specialized array traversal traces', () => {
  const code = 'const arr = [10, 20, 30]; for (let i = 0; i < arr.length; i++) { console.log(arr[i]); }';
  const result = universalTrace.generateTrace(code, 'javascript', {
    success: true,
    output: '10\n20\n30\n',
  });

  assert.equal(result.supported, true);
  assert.notEqual(result.generic, true);
  assert.equal(result.algorithm, 'array_traversal');
  assert.deepEqual(result.events[0].array, [10, 20, 30]);
  assert.deepEqual(result.events.filter((event) => event.type === 'visit').map((event) => event.value), [10, 20, 30]);
});

test('Python list literals produce specialized indexed traversal traces', () => {
  const code = 'arr = [10, 20, 30]\nfor i in range(len(arr)):\n    print(arr[i])';
  const result = universalTrace.generateTrace(code, 'python', {
    success: true,
    output: '10\n20\n30\n',
  });

  assert.equal(result.supported, true);
  assert.notEqual(result.generic, true);
  assert.equal(result.algorithm, 'array_traversal');
  assert.deepEqual(result.events[0].array, [10, 20, 30]);
  assert.deepEqual(result.events.filter((event) => event.type === 'visit').map((event) => event.value), [10, 20, 30]);
});

test('captured Python runtime snapshots take priority over source heuristics', () => {
  const result = universalTrace.generateTrace('value = 7\\nprint(value)', 'python', {
    success: true,
    output: '7',
    runtimeTrace: [
      { step: 1, line: 1, event: 'runtime_line', variables: { value: 7, items: [2, 4, 6] } },
      { step: 2, line: 2, event: 'runtime_line', variables: { value: 7, items: [2, 4, 6] } },
    ],
  });
  assert.equal(result.runtimeInstrumented, true);
  assert.equal(result.algorithm, 'runtime_execution');
  assert.equal(result.events.length, 2);
  assert.deepEqual(result.events[0].variables.items, [2, 4, 6]);
  assert.deepEqual(result.events[0].array, [2, 4, 6]);
  assert.equal(result.events[0].line, 1);
});


test('captured runtime object pointers become connected 3D nodes', () => {
  const result = universalTrace.generateTrace('class Node: pass', 'python', {
    success: true,
    runtimeTrace: [{
      step: 1, line: 1, event: 'runtime_line',
      variables: {
        head: { __type__: 'Node', value: 10, next: { __type__: 'Node', value: 20, next: '<cycle>' } }
      }
    }]
  });
  assert.equal(result.runtimeInstrumented, true);
  assert.equal(result.events[0].dataStructure, 'linked_list');
  assert.deepEqual(result.events[0].nodes.map((node) => node.value), [10, 20]);
  assert.deepEqual(result.events[0].edges.map((edge) => [edge.from, edge.to, edge.label]), [[0, 1, 'next']]);
});
