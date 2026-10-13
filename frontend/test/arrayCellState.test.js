import assert from 'node:assert/strict';
import test from 'node:test';
import { getArrayCellState } from '../src/visualizers/arrayCellState.js';

test('comparison events highlight both compared array indices', () => {
  const state = { activeIndex: 1, comparedIndices: [0, 1], swappedIndices: [], sortedIndices: [3] };
  assert.deepEqual(getArrayCellState(state, 0), { active: false, comparing: true, swapping: false, sorted: false });
  assert.deepEqual(getArrayCellState(state, 1), { active: true, comparing: true, swapping: false, sorted: false });
  assert.deepEqual(getArrayCellState(state, 2), { active: false, comparing: false, swapping: false, sorted: false });
});

test('swap events highlight both swapped indices and keep unrelated sorted cells distinct', () => {
  const state = { swappedIndices: [2, 3], sortedIndices: [0, 1] };
  assert.deepEqual(getArrayCellState(state, 2), { active: false, comparing: false, swapping: true, sorted: false });
  assert.deepEqual(getArrayCellState(state, 3), { active: false, comparing: false, swapping: true, sorted: false });
  assert.deepEqual(getArrayCellState(state, 1), { active: false, comparing: false, swapping: false, sorted: true });
});

test('missing or malformed trace metadata falls back to neutral cells', () => {
  assert.deepEqual(getArrayCellState({}, 0), { active: false, comparing: false, swapping: false, sorted: false });
  assert.deepEqual(getArrayCellState({ comparedIndices: '0', swappedIndices: null }, 0), { active: false, comparing: false, swapping: false, sorted: false });
});
