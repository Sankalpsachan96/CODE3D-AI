import assert from 'node:assert/strict';
import test from 'node:test';
import { buildGraphPatternTrace, buildLinearStructurePatternTrace, buildLinkedListPatternTrace, buildTreePatternTrace } from '../src/services/structurePatternTraces.js';

const cases = [
  {
    language: 'python',
    code: "graph = {0: [1, 2], 1: [0, 3], 2: [0], 3: [1]}\ndef bfs(graph, start=0):\n    visited = set()",
  },
  {
    language: 'javascript',
    code: "const graph = [[1, 2], [0, 3], [0], [1]];\nfunction bfs(graph, start = 0) { const visited = new Set(); }",
  },
  {
    language: 'java',
    code: "class Main { int[][] graph = {{0,1,1,0},{1,0,0,1},{1,0,0,0},{0,1,0,0}}; void bfs() { boolean[] visited = new boolean[4]; } }",
  },
  {
    language: 'c',
    code: "int graph[4][4] = {{0,1,1,0},{1,0,0,1},{1,0,0,0},{0,1,0,0}}; void bfs() { int visited[4] = {0}; }",
  },
  {
    language: 'cpp',
    code: "vector<vector<int>> graph = {{1,2},{0,3},{0},{1}}; void bfs() { vector<bool> visited(4); }",
  },
];

for (const example of cases) {
  test(`graph trace preserves actual topology for ${example.language}`, () => {
    const trace = buildGraphPatternTrace(example.code, ['real output']);
    assert.ok(trace && trace.length > 1, 'should create a multi-step graph trace');
    const firstState = trace[0].dataStructureState;
    assert.equal(firstState.type, 'graph');
    assert.equal(firstState.nodes.length, 4);
    assert.ok(firstState.edges.length >= 3);
    assert.ok(trace.some((step) => step.eventType === 'GRAPH_VISIT'));
    assert.ok(trace.every((step) => step.output[0] === 'real output'));
  });
}

test('graph trace uses addEdge calls for C++/Java-style graph builders', () => {
  const trace = buildGraphPatternTrace(
    'void bfs() { addEdge(graph, 10, 20); addEdge(graph, 20, 30); queue<int> q; }',
    []
  );
  assert.ok(trace);
  assert.deepEqual(trace[0].dataStructureState.nodes.map((node) => node.id), [10, 20, 30]);
  assert.deepEqual(trace[0].dataStructureState.edges.map(({ from, to }) => [from, to]), [[10, 20], [20, 30]]);
});

test('unrelated source is not falsely classified as a graph', () => {
  assert.equal(buildGraphPatternTrace('int sum = 1 + 2; printf("%d", sum);', []), null);
});

test('explicit tree allocations and left/right links produce tree edges', () => {
  const code = `class Node { int data; Node left, right; Node(int data) { this.data = data; } }
Node root = new Node(50);
root.left = new Node(30);
root.right = new Node(70);`;
  const trace = buildTreePatternTrace(code, ['actual output']);
  assert.ok(trace && trace.length >= 2);
  const finalState = trace.at(-1).dataStructureState;
  assert.equal(finalState.type, 'tree');
  assert.equal(finalState.nodes.length, 3);
  assert.deepEqual(finalState.edges.map(({ from, to, label }) => [from, to, label]), [[0, 1, 'left'], [0, 2, 'right']]);
});

test('linked-list node allocation and next links create a linked-list scene', () => {
  const code = `struct Node { int data; Node* next; };
Node* head = new Node(10);
Node* tail = new Node(20);
head->next = tail;`;
  const trace = buildLinkedListPatternTrace(code, []);
  assert.ok(trace && trace.some((step) => step.eventType === 'LIST_LINK'));
  assert.equal(trace.at(-1).dataStructureState.type, 'linked-list');
  assert.deepEqual(trace.at(-1).dataStructureState.edges.map(({ from, to }) => [from, to]), [[0, 1]]);
});

test('stack and queue explicit operations create separate timelines', () => {
  const stack = buildLinearStructurePatternTrace('stack<int> s; s.push(10); s.push(20); s.pop();', []);
  assert.deepEqual(stack.at(-1).dataStructureState.values, [10]);
  assert.equal(stack.at(-1).dataStructureState.type, 'stack');

  const queue = buildLinearStructurePatternTrace('queue<int> q; q.push(10); q.push(20); q.pop();', []);
  assert.deepEqual(queue.at(-1).dataStructureState.values, [20]);
  assert.equal(queue.at(-1).dataStructureState.type, 'queue');
});

test('source without an identifiable graph, tree, linked list, stack or queue stays unclassified', () => {
  assert.equal(buildTreePatternTrace('int total = 3;', []), null);
  assert.equal(buildLinkedListPatternTrace('int total = 3;', []), null);
  assert.equal(buildLinearStructurePatternTrace('int total = 3;', []), null);
});
