import assert from 'node:assert/strict';
import test from 'node:test';
import { buildGraphPatternTrace } from '../src/services/structurePatternTraces.js';

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
