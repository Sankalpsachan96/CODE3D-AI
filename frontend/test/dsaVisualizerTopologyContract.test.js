import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';

test('graph visualizer does not synthesize fallback nodes or edges', async () => {
  const source = await readFile(new URL('../src/visualizers/GraphVisualizer3D.jsx', import.meta.url), 'utf8');
  assert.match(source, /const sourceNodes =/);
  assert.match(source, /const edgesToRender = Array\.isArray\(stateEdges\) \? stateEdges : \[\]/);
  assert.doesNotMatch(source, /inferredNodes|inferredEdges|Array\.from\(\{ length: 5 \}/);
});

test('generic tree visualizer only builds a BST for an explicit BST trace type', async () => {
  const source = await readFile(new URL('../src/visualizers/TreeVisualizer3D.jsx', import.meta.url), 'utf8');
  assert.match(source, /explicitType/);
  assert.match(source, /return \['bst', 'binary-search-tree'\]\.includes\(explicitType\) \? buildBstFromValues\(values\) : \[\]/);
});

test('Trie types route to the dedicated Trie visualizer', async () => {
  const registry = await readFile(new URL('../src/visualizers/visualizerRegistry.js', import.meta.url), 'utf8');
  assert.match(registry, /import TrieVisualizer3D from '\.\/TrieVisualizer3D'/);
  assert.match(registry, /trie: TrieVisualizer3D/);
  assert.match(registry, /'trie-string': TrieVisualizer3D/);
});
