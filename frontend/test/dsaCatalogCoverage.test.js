import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

import { getExecutionTrace } from '../src/services/executionSimulator.js';
import { STRIVER_PROBLEMS } from '../src/utils/striverCatalog.js';
import { SAMPLE_PROGRAMS } from '../src/utils/sampleCodes.js';

function assertWorkingTrace(trace, label) {
  assert.ok(Array.isArray(trace) && trace.length > 0, `${label}: trace is empty`);
  for (const [index, step] of trace.entries()) {
    assert.ok(step.dataStructureState, `${label}: step ${index + 1} has no dataStructureState`);
    assert.ok(step.dataStructureState.type, `${label}: step ${index + 1} has no visualizer type`);
  }
}

test('all 182 Striver problems produce a registered visualization trace', () => {
  assert.equal(STRIVER_PROBLEMS.length, 182);
  for (const problem of STRIVER_PROBLEMS) {
    const selector = `striver|${problem.id}|${problem.title.replace(/\|/g, '/') }|${problem.archetype}`;
    const trace = getExecutionTrace(
      problem.javaCode || problem.cppCode || '',
      'java',
      problem.defaultInput || '',
      selector
    );
    assertWorkingTrace(trace, `Striver #${problem.id} ${problem.shortTitle}`);
  }
});

test('all 49 DSA curriculum programs produce a registered visualization trace', () => {
  assert.equal(SAMPLE_PROGRAMS.length, 49);
  for (const program of SAMPLE_PROGRAMS) {
    const selector = `topic|${program.id}|${program.title.replace(/\|/g, '/') }|${program.category}`;
    const trace = getExecutionTrace(program.code || '', program.language || 'java', null, selector);
    assertWorkingTrace(trace, `Topic ${program.id} ${program.title}`);
  }
});

test('all 49 DSA topic code examples compile and execute successfully', () => {
  assert.equal(SAMPLE_PROGRAMS.length, 49);

  for (const program of SAMPLE_PROGRAMS) {
    assert.match(program.code || '', /static\s+void\s+main\s*\(/, `Topic ${program.id}: missing Java main()`);
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'code3d-dsa-'));
    const source = path.join(dir, 'Main.java');

    try {
      fs.writeFileSync(source, program.code, 'utf8');
      execFileSync('javac', [source], { stdio: 'pipe', timeout: 15000 });
      const mainClassMatch = program.code.match(/(?:public\s+)?class\s+([A-Za-z_$][\w$]*)[\s\S]*?public\s+static\s+void\s+main\s*\(/);
      const mainClass = mainClassMatch?.[1] || 'Main';
      const runtimeInput = program.id === 'student-result'
        ? 'Alice\n90\n80\n70\n'
        : '';
      execFileSync('java', ['-cp', dir, mainClass], {
        stdio: 'pipe',
        timeout: 5000,
        input: runtimeInput,
      });
    } catch (error) {
      const stderr = error?.stderr ? String(error.stderr) : String(error?.message || error);
      assert.fail(`Topic ${program.id} (${program.title}) failed Java compile/runtime validation: ${stderr}`);
    } finally {
      fs.rmSync(dir, { recursive: true, force: true });
    }
  }
});


const EXPECTED_TOPIC_VISUALIZERS = {
  'student-result': ['universal-execution', 'universal'],
  'array-loop': ['array'],
  'matrix': ['matrix'],
  'two-pointer-reverse': ['array'],
  'sliding-window': ['array'],
  'linked-list': ['linked-list'],
  'doubly-linked-list': ['linked-list'],
  'circular-linked-list': ['linked-list'],
  'cycle-detection': ['linked-list'],
  'stack': ['stack'],
  'parentheses-stack': ['stack'],
  'queue': ['queue'],
  'circular-queue': ['queue'],
  'deque': ['queue'],
  'bst': ['tree'],
  'tree-traversals': ['tree'],
  'avl-tree': ['avl'],
  'trie': ['trie'],
  'bubble-sort': ['sorting'],
  'insertion-sort': ['sorting'],
  'merge-sort': ['sorting'],
  'quick-sort': ['sorting'],
  'binary-search': ['searching'],
  'hash-table': ['hash-table'],
  'graph-bfs': ['graph'],
  'graph-dfs': ['graph'],
  'dijkstra': ['graph'],
  'recursion': ['recursion'],
  'fibonacci-memo': ['dp'],
  'dp-knapsack': ['matrix'],
  'lcs': ['dp'],
  'container-most-water': ['container-water'],
  'monotonic-stack': ['stack'],
  'heap-priority-queue': ['heap'],
  'topological-sort-dag': ['graph'],
  'coin-change-dp': ['array'],
  'trapping-rain-water': ['trapping-rain-water'],
  'lru-cache': ['hash-table'],
  'trie-prefix-tree': ['trie'],
  'disjoint-set-union': ['graph'],
  'longest-increasing-subsequence': ['lis'],
  'n-queens': ['matrix'],
  'sudoku-solver': ['matrix'],
  'dijkstra-shortest-path': ['graph'],
  'merge-intervals': ['array'],
  'rotten-oranges': ['matrix'],
  'word-search': ['matrix'],
  'knapsack-01': ['matrix'],
  'sliding-window-max': ['array'],
};

test('49 DSA topics use the intended visualizer family', () => {
  for (const program of SAMPLE_PROGRAMS) {
    const selector = `topic|${program.id}|${program.title.replace(/\|/g, '/')}|${program.category}`;
    const trace = getExecutionTrace(program.code || '', program.language || 'java', null, selector);
    const expected = EXPECTED_TOPIC_VISUALIZERS[program.id];
    assert.ok(expected, `Topic ${program.id}: missing visualizer expectation`);
    const actualTypes = [...new Set(trace.map((step) => step.dataStructureState?.type).filter(Boolean))];
    assert.ok(
      actualTypes.some((type) => expected.includes(type)),
      `Topic ${program.id}: expected one of [${expected.join(', ')}], got [${actualTypes.join(', ')}]`
    );
  }
});

test('all 14 algorithm catalog entries produce execution steps', async () => {
  const { ALGORITHM_CATALOG } = await import('../src/algorithms/index.js');
  assert.equal(ALGORITHM_CATALOG.length, 14);
  for (const algorithm of ALGORITHM_CATALOG) {
    const result = algorithm.generator(
      algorithm.defaultInput,
      algorithm.defaultTarget
    );
    assert.ok(Array.isArray(result?.steps) && result.steps.length > 0, `Algorithm ${algorithm.id}: no steps`);
  }
});

test('AVL topic trace matches the executable LL right-rotation result', () => {
  const program = SAMPLE_PROGRAMS.find((item) => item.id === 'avl-tree');
  assert.ok(program, 'AVL topic is missing');

  const trace = getExecutionTrace(
    program.code,
    'java',
    null,
    `topic|${program.id}|${program.title}|${program.category}`
  );
  const finalState = trace.at(-1)?.dataStructureState;
  assert.equal(finalState?.type, 'avl');
  assert.equal(finalState?.nodes?.find((node) => node.parent === null)?.val, 20);
  assert.deepEqual(
    finalState?.nodes?.map((node) => [node.val, node.left, node.right, node.parent]),
    [[20, 1, 2, null], [10, null, null, 0], [30, null, null, 0]]
  );
});

test('Graph algorithm produces both BFS and DFS traversals', async () => {
  const { generateGraphSteps } = await import('../src/algorithms/dataStructures/graphOps.js');
  const result = generateGraphSteps(5);
  assert.deepEqual(result.traversalResults.bfs, [0, 1, 2, 3, 4]);
  assert.deepEqual(result.traversalResults.dfs, [0, 1, 3, 4, 2]);
  assert.ok(result.steps.some((step) => step.metadata?.operation === 'BFS_VISIT'));
  assert.ok(result.steps.some((step) => step.metadata?.operation === 'DFS_VISIT'));
});

test('every 3D trace type is backed by a real visualizer registry entry', () => {
  const registrySource = fs.readFileSync(
    new URL('../src/visualizers/visualizerRegistry.js', import.meta.url),
    'utf8'
  );
  const registeredTypes = new Set();
  const keyPattern = /^\s*(?:['"]([^'"]+)['"]|([A-Za-z_$][\w$]*))\s*:/gm;
  for (const match of registrySource.matchAll(keyPattern)) {
    registeredTypes.add((match[1] || match[2]).toLowerCase().replace(/_/g, '-'));
  }

  const allTraces = [
    ...STRIVER_PROBLEMS.map((problem) => getExecutionTrace(
      problem.javaCode || problem.cppCode || '',
      'java',
      problem.defaultInput || '',
      'striver|' + problem.id + '|' + problem.title.replace(/\|/g, '/') + '|' + problem.archetype
    )),
    ...SAMPLE_PROGRAMS.map((program) => getExecutionTrace(
      program.code || '',
      program.language || 'java',
      null,
      'topic|' + program.id + '|' + program.title.replace(/\|/g, '/') + '|' + program.category
    )),
  ];

  const traceTypes = [...new Set(
    allTraces.flatMap((trace) => trace.map((step) => step.dataStructureState?.type).filter(Boolean))
  )];
  assert.ok(traceTypes.length > 0, 'No 3D trace types were generated');
  for (const type of traceTypes) {
    const normalized = String(type).toLowerCase().replace(/_/g, '-');
    assert.ok(
      registeredTypes.has(normalized),
      '3D trace type "' + type + '" is not registered in visualizerRegistry.js'
    );
  }
});
