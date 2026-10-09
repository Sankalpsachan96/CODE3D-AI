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
      { step: 1, line: 1, event: 'runtime_line', variables: { value: 7, items: [2, 4, 6] }, callStack: ['factorial', 'factorial'] },
      { step: 2, line: 2, event: 'runtime_line', variables: { value: 7, items: [2, 4, 6] } },
    ],
  });
  assert.equal(result.runtimeInstrumented, true);
  assert.equal(result.algorithm, 'runtime_execution');
  assert.equal(result.events.length, 2);
  assert.deepEqual(result.events[0].variables.items, [2, 4, 6]);
  assert.deepEqual(result.events[0].array, [2, 4, 6]);
  assert.equal(result.events[0].line, 1);
  assert.deepEqual(result.events[0].callStack, ['factorial', 'factorial']);
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

test('captured Python adjacency lists become graph nodes and edges', () => {
  const result = universalTrace.generateTrace('graph = {0: [1, 2], 1: [2], 2: []}', 'python', {
    success: true,
    output: 'visited: 0, 1, 2\n',
    runtimeTrace: [{
      step: 1, line: 1, event: 'runtime_line',
      variables: { graph: { 0: [1, 2], 1: [2], 2: [] } },
    }],
  });

  assert.equal(result.runtimeInstrumented, true);
  assert.equal(result.events[0].dataStructure, 'graph');
  assert.deepEqual(result.events[0].nodes.map((node) => node.value), ['0', '1', '2']);
  assert.deepEqual(result.events[0].edges.map((edge) => [edge.from, edge.to]), [[0, 1], [0, 2], [1, 2]]);
});

test('captured Python binary adjacency matrices omit zero-weight edges', () => {
  const result = universalTrace.generateTrace('adjacency_matrix = [[0, 1], [1, 0]]', 'python', {
    success: true,
    output: 'connected\n',
    runtimeTrace: [{
      step: 1, line: 1, event: 'runtime_line',
      variables: { adjacency_matrix: [[0, 1], [1, 0]] },
    }],
  });

  assert.equal(result.events[0].dataStructure, 'graph');
  assert.deepEqual(result.events[0].edges.map((edge) => [edge.from, edge.to]), [[0, 1], [1, 0]]);
});


test('non-instrumented C, C++, Java and JavaScript traces are never labelled as exact runtime snapshots', () => {
  const cases = [
    ['c', 'int x = 10; x = x + 5; printf("%d\\n", x);'],
    ['cpp', 'int x = 10; x = x + 5; std::cout << x;'],
    ['java', 'class Main { void run() { int x = 10; x = x + 5; System.out.println(x); } }'],
    ['javascript', 'let x = 10; x = x + 5; console.log(x);'],
  ];

  for (const [language, code] of cases) {
    const result = universalTrace.generateTrace(code, language, {
      success: true,
      output: '15',
    });
    assert.notEqual(result.runtimeInstrumented, true, language + ' must not claim runtime instrumentation without captured snapshots');
  }
});

test('captured runtime values override source-model estimates', () => {
  const result = universalTrace.generateTrace(
    'let x = 10;\\nx = x + 5;\\nconsole.log(x);',
    'javascript',
    {
      success: true,
      output: '15',
      runtimeTrace: [
        { step: 1, line: 1, event: 'runtime_line', variables: { x: 10 } },
        { step: 2, line: 2, event: 'runtime_line', variables: { x: 15 } },
      ],
    },
  );

  assert.equal(result.runtimeInstrumented, true);
  assert.deepEqual(result.events.map((event) => event.variables.x), [10, 15]);
});

test('modeled bubble-sort steps map to matching source lines in all editor languages', () => {
  const cases = [
    ['c', `int values[5] = {4, 1, 3, 2, 2};
for (int i = 0; i < 4; i++) {
  for (int j = 0; j < 4 - i; j++) {
    if (values[j] > values[j + 1]) {
      int temp = values[j];
      values[j] = values[j + 1];
      values[j + 1] = temp;
    }
  }
}
printf("%d", values[0]);`],
    ['cpp', `int values[] = {4, 1, 3, 2, 2};
for (int i = 0; i < 4; i++) {
  for (int j = 0; j < 4 - i; j++) {
    if (values[j] > values[j + 1]) {
      int temp = values[j];
      values[j] = values[j + 1];
      values[j + 1] = temp;
    }
  }
}
cout << values[0];`],
    ['java', `int[] values = {4, 1, 3, 2, 2};
for (int i = 0; i < 4; i++) {
  for (int j = 0; j < 4 - i; j++) {
    if (values[j] > values[j + 1]) {
      int temp = values[j];
      values[j] = values[j + 1];
      values[j + 1] = temp;
    }
  }
}
System.out.println(values[0]);`],
    ['javascript', `const values = [4, 1, 3, 2, 2];
for (let i = 0; i < values.length - 1; i++) {
  for (let j = 0; j < values.length - i - 1; j++) {
    if (values[j] > values[j + 1]) {
      const temp = values[j];
      values[j] = values[j + 1];
      values[j + 1] = temp;
    }
  }
}
console.log(values);`],
    ['python', `values = [4, 1, 3, 2, 2]
for i in range(len(values) - 1):
    for j in range(len(values) - i - 1):
        if values[j] > values[j + 1]:
            temp = values[j]
            values[j] = values[j + 1]
            values[j + 1] = temp
print(values)`],
  ];

  for (const [language, code] of cases) {
    const result = universalTrace.generateTrace(code, language, { success: true, output: '[1, 2, 2, 3, 4]' });
    assert.equal(result.algorithm, 'bubble_sort', `${language} should identify bubble sort`);
    assert.ok(result.events.length > 0, `${language} should produce modeled steps`);
    const lines = code.split(/\r?\n/);
    for (const event of result.events) {
      assert.ok(Number.isInteger(event.line), `${language} ${event.type} has a source line`);
      assert.ok(event.line >= 1 && event.line <= lines.length, `${language} ${event.type} line is in range`);
      assert.ok(lines[event.line - 1].trim(), `${language} ${event.type} line points to code`);
    }
    assert.equal(result.events[0].line, 1, `${language} initial state maps to array initialization`);
    assert.equal(result.events.find((event) => event.type === 'compare').line, 4, `${language} comparison maps to condition`);
    assert.equal(result.events.find((event) => event.type === 'swap').line, 6, `${language} swap maps to mutation`);
    assert.equal(result.events.at(-1).line, lines.length, `${language} completion maps to output`);
    assert.deepEqual(result.events.at(-1).array, [1, 2, 2, 3, 4], `${language} model final array is sorted`);
  }
});

test('modeled bubble sort preserves empty-array and unsupported-pattern behavior', () => {
  const empty = universalTrace.generateTrace(
    'const values = [];\nfor (let i = 0; i < values.length; i++) {\n  for (let j = 0; j < values.length - i; j++) {\n    if (values[j] > values[j + 1]) { values[j] = values[j + 1]; values[j + 1] = values[j]; }\n  }\n}\nconsole.log(values);',
    'javascript',
    { success: true, output: '[]' }
  );
  assert.equal(empty.supported, true);
  assert.deepEqual(empty.events[0].array, []);
  assert.equal(empty.events[0].line, 1);

  const unknown = universalTrace.generateTrace(
    'function sort(items) { return items; }',
    'javascript',
    { success: true, output: '[]' }
  );
  assert.equal(unknown.generic, true);
  assert.match(unknown.reason, /source structure/i);
});

test('C array trace respects an explicit zero logical length', () => {
  const result = universalTrace.generateTrace(`#include <stdio.h>
int main() {
  int values[1] = {0}; int n = 0;
  for (int i = 0; i < n - 1; i++) {
    for (int j = 0; j < n - i - 1; j++) {
      if (values[j] > values[j + 1]) { int t=values[j]; values[j]=values[j+1]; values[j+1]=t; }
    }
  }
  printf("[]");
}`, 'c', { success: true, output: '[]' });

  assert.equal(result.algorithm, 'bubble_sort');
  assert.deepEqual(result.events.at(-1).array, []);
});

test('every modeled DSA step maps to an executable source line', () => {
  const cases = [
    ['selection sort', 'cpp', `int values[] = {3, 1, 2};
for (int i = 0; i < 2; ++i) {
  int minIndex = i;
  for (int j = i + 1; j < 3; ++j) {
    if (values[j] < values[minIndex]) minIndex = j;
  }
  if (minIndex != i) std::swap(values[i], values[minIndex]);
}
std::cout << values[0];`],
    ['insertion sort', 'java', `int[] values = {3, 1, 2};
for (int i = 1; i < values.length; i++) {
  int key = values[i];
  int j = i - 1;
  while (j >= 0 && values[j] > key) {
    values[j + 1] = values[j];
    j--;
  }
  values[j + 1] = key;
}
System.out.println(values[0]);`],
    ['linear search', 'javascript', `const values = [10, 20, 30];
const target = 20;
for (let i = 0; i < values.length; i++) {
  if (values[i] === target) break;
}
console.log(values);`],
    ['binary search', 'javascript', `const values = [10, 20, 30, 40];
const target = 30;
let low = 0;
let high = values.length - 1;
while (low <= high) {
  const mid = Math.floor((low + high) / 2);
  if (values[mid] === target) break;
  if (values[mid] < target) low = mid + 1;
  else high = mid - 1;
}
console.log(values);`],
    ['array traversal', 'c', `int values[3] = {10, 20, 30};
for (int i = 0; i < 3; i++) {
  printf("%d", values[i]);
}`],
    ['stack', 'cpp', `std::stack<int> values;
values.push(10);
values.push(20);
values.pop();
std::cout << values.top();`],
    ['queue', 'cpp', `std::queue<int> values;
values.push(10);
values.push(20);
values.pop();
std::cout << values.front();`],
    ['linked list', 'cpp', `struct Node { int value; Node* next; };
Node* head = new Node(10);
head->next = new Node(20);`],
  ];

  for (const [name, language, code] of cases) {
    const result = universalTrace.generateTrace(code, language, { success: true, output: '' });
    assert.equal(result.supported, true, `${name} is recognized`);
    assert.ok(result.events.length > 0, `${name} has steps`);
    const lines = code.split(/\r?\n/);
    for (const event of result.events) {
      assert.ok(Number.isInteger(event.line), `${name} ${event.type} includes a source line`);
      assert.ok(event.line >= 1 && event.line <= lines.length, `${name} ${event.type} maps inside the source`);
      assert.ok(lines[event.line - 1].trim(), `${name} ${event.type} points to a non-empty statement`);
    }
  }
});

test('Java, Python, and JavaScript collection stacks and queues map operations and preserve LIFO/FIFO order', () => {
  const cases = [
    ['Java Stack', 'java', `Stack<Integer> stack = new Stack<>();
stack.push(10);
stack.push(20);
stack.pop();`, 'stack_operations', 'stack', [10]],
    ['Python list stack', 'python', `stack = []
stack.append(10)
stack.append(20)
stack.pop()`, 'stack_operations', 'stack', [10]],
    ['JavaScript array stack', 'javascript', `const stack = [];
stack.push(10);
stack.push(20);
stack.pop();`, 'stack_operations', 'stack', [10]],
    ['Java Queue', 'java', `Queue<Integer> queue = new LinkedList<>();
queue.offer(10);
queue.offer(20);
queue.poll();`, 'queue_operations', 'queue', [20]],
    ['Python list queue', 'python', `queue = []
queue.append(10)
queue.append(20)
queue.pop(0)`, 'queue_operations', 'queue', [20]],
    ['JavaScript array queue', 'javascript', `const queue = [];
queue.push(10);
queue.push(20);
queue.shift();`, 'queue_operations', 'queue', [20]],
  ];

  for (const [name, language, code, algorithm, field, expected] of cases) {
    const result = universalTrace.generateTrace(code, language, { success: true, output: '' });
    assert.equal(result.algorithm, algorithm, `${name} should have a specialized model`);
    assert.deepEqual(result.events.at(-1)[field], expected, `${name} should preserve collection order`);
    const lines = code.split(/\r?\n/);
    for (const event of result.events) {
      assert.ok(Number.isInteger(event.line) && event.line >= 1 && event.line <= lines.length, `${name} ${event.type} should map into the source`);
    }
  }
});
