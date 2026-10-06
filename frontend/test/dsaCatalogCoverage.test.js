import test from 'node:test';
import assert from 'node:assert/strict';

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

test('Graph algorithm produces both BFS and DFS traversals', async () => {
  const { generateGraphSteps } = await import('../src/algorithms/dataStructures/graphOps.js');
  const result = generateGraphSteps(5);
  assert.deepEqual(result.traversalResults.bfs, [0, 1, 2, 3, 4]);
  assert.deepEqual(result.traversalResults.dfs, [0, 1, 3, 4, 2]);
  assert.ok(result.steps.some((step) => step.metadata?.operation === 'BFS_VISIT'));
  assert.ok(result.steps.some((step) => step.metadata?.operation === 'DFS_VISIT'));
});
