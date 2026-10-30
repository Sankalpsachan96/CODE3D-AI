import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';

const graphSource = fs.readFileSync(
  new URL('../src/visualizers/GraphVisualizer3D.jsx', import.meta.url),
  'utf8'
);
const treeSource = fs.readFileSync(
  new URL('../src/visualizers/TreeVisualizer3D.jsx', import.meta.url),
  'utf8'
);

test('graph visualizer never fabricates default vertices or edges', () => {
  assert.doesNotMatch(graphSource, /inferredNodes|inferredEdges/);
  assert.match(graphSource, /const edgesToRender = Array\.isArray\(stateEdges\) \? stateEdges : \[\]/);
  assert.match(graphSource, /Edges unavailable — showing supplied vertices only/);
});

test('generic tree values are not reconstructed as a BST', () => {
  assert.match(treeSource, /\['bst', 'binary-search-tree'\]\.includes\(normalizedType\)/);
  assert.match(treeSource, /: \[\];/);
});
