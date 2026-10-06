/**
 * CODE3D-AI - Extensible 3D Visualizer Registry
 * 
 * Maps canonical data structure & algorithm types to actual 3D WebGL visualizers.
 * Only registers visualizers that actually exist.
 */

import ArrayVisualizer3D from './ArrayVisualizer3D';
import LinkedListVisualizer3D from './LinkedListVisualizer3D';
import StackVisualizer3D from './StackVisualizer3D';
import QueueVisualizer3D from './QueueVisualizer3D';
import TreeVisualizer3D from './TreeVisualizer3D';
import HeapVisualizer3D from './HeapVisualizer3D';
import GraphVisualizer3D from './GraphVisualizer3D';
import HashTableVisualizer3D from './HashTableVisualizer3D';
import SortingVisualizer3D from './SortingVisualizer3D';
import MatrixVisualizer3D from './MatrixVisualizer3D';
import RecursionVisualizer3D from './RecursionVisualizer3D';
import UniversalExecutionVisualizer3D from './UniversalExecutionVisualizer3D';

export const visualizerRegistry = {
  array: ArrayVisualizer3D,
  sorting: SortingVisualizer3D,
  'array-sort': SortingVisualizer3D,
  'sorting-searching': SortingVisualizer3D,
  searching: ArrayVisualizer3D,
  search: ArrayVisualizer3D,
  'binary-search': ArrayVisualizer3D,
  'array-search': ArrayVisualizer3D,
  'linear-search': ArrayVisualizer3D,
  'two-pointer': ArrayVisualizer3D,
  'sliding-window': ArrayVisualizer3D,
  kadane: ArrayVisualizer3D,
  'cycle-detection': ArrayVisualizer3D,
  greedy: ArrayVisualizer3D,
  linkedList: LinkedListVisualizer3D,
  'linked-list': LinkedListVisualizer3D,
  'linked-lists': LinkedListVisualizer3D,
  'doubly-linked-list': LinkedListVisualizer3D,
  stack: StackVisualizer3D,
  queue: QueueVisualizer3D,
  'stacks-queues': StackVisualizer3D,
  deque: QueueVisualizer3D,
  tree: TreeVisualizer3D,
  'binary-trees': TreeVisualizer3D,
  bst: TreeVisualizer3D,
  avl: TreeVisualizer3D,
  'avl-tree': TreeVisualizer3D,
  'red-black-tree': TreeVisualizer3D,
  trie: TreeVisualizer3D,
  'trie-string': TreeVisualizer3D,
  heap: HeapVisualizer3D,
  heaps: HeapVisualizer3D,
  graph: GraphVisualizer3D,
  graphs: GraphVisualizer3D,
  'topological-sort': GraphVisualizer3D,
  dijkstra: GraphVisualizer3D,
  dsu: GraphVisualizer3D,
  hashTable: HashTableVisualizer3D,
  'hash-table': HashTableVisualizer3D,
  'hash-map': HashTableVisualizer3D,
  map: HashTableVisualizer3D,
  matrix: MatrixVisualizer3D,
  dp: MatrixVisualizer3D,
  'dp-table': MatrixVisualizer3D,
  grid: MatrixVisualizer3D,
  table: MatrixVisualizer3D,
  'matrix-grid': MatrixVisualizer3D,
  'trapping-rain-water': ArrayVisualizer3D,
  'monotonic-stack': StackVisualizer3D,
  'lru-cache': HashTableVisualizer3D,
  'container-water': ArrayVisualizer3D,
  lis: ArrayVisualizer3D,
  'dynamic-programming': MatrixVisualizer3D,
  recursion: RecursionVisualizer3D,
  'call-stack': RecursionVisualizer3D,
  'callstack': RecursionVisualizer3D,
  universal: UniversalExecutionVisualizer3D,
  'universal-execution': UniversalExecutionVisualizer3D,
};

export function getVisualizerComponent(type) {
  if (!type) return ArrayVisualizer3D;
  const normalized = type.toLowerCase().trim().replace(/_/g, '-');
  return visualizerRegistry[normalized] || visualizerRegistry[type.toLowerCase().trim()] || ArrayVisualizer3D;
}
