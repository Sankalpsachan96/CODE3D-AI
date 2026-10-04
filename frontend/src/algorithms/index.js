/**
 * CODE3D-AI Master Algorithm & Data Structure Engine
 * Section 6 & 7 Unified Architecture
 */

import { VisualState, AlgorithmEventType, AlgorithmCategory } from './types.js';

// Sorting
import { bubbleSortDetails, generateBubbleSortSteps } from './sorting/bubbleSort.js';
import { selectionSortDetails, generateSelectionSortSteps } from './sorting/selectionSort.js';
import { insertionSortDetails, generateInsertionSortSteps } from './sorting/insertionSort.js';
import { mergeSortDetails, generateMergeSortSteps } from './sorting/mergeSort.js';
import { quickSortDetails, generateQuickSortSteps } from './sorting/quickSort.js';

// Searching
import { linearSearchDetails, generateLinearSearchSteps } from './searching/linearSearch.js';
import { binarySearchDetails, generateBinarySearchSteps } from './searching/binarySearch.js';

// Data Structures
import { arrayOpsDetails, generateArraySteps } from './dataStructures/arrayOps.js';
import { stackOpsDetails, generateStackSteps } from './dataStructures/stackOps.js';
import { queueOpsDetails, generateQueueSteps } from './dataStructures/queueOps.js';
import { linkedListOpsDetails, generateLinkedListSteps } from './dataStructures/linkedListOps.js';
import { bstOpsDetails, generateBstSteps } from './dataStructures/bstOps.js';
import { heapOpsDetails, generateHeapSteps } from './dataStructures/heapOps.js';
import { graphOpsDetails, generateGraphSteps } from './dataStructures/graphOps.js';

export {
  VisualState,
  AlgorithmEventType,
  AlgorithmCategory,
  bubbleSortDetails,
  generateBubbleSortSteps,
  selectionSortDetails,
  generateSelectionSortSteps,
  insertionSortDetails,
  generateInsertionSortSteps,
  mergeSortDetails,
  generateMergeSortSteps,
  quickSortDetails,
  generateQuickSortSteps,
  linearSearchDetails,
  generateLinearSearchSteps,
  binarySearchDetails,
  generateBinarySearchSteps,
  arrayOpsDetails,
  generateArraySteps,
  stackOpsDetails,
  generateStackSteps,
  queueOpsDetails,
  generateQueueSteps,
  linkedListOpsDetails,
  generateLinkedListSteps,
  bstOpsDetails,
  generateBstSteps,
  heapOpsDetails,
  generateHeapSteps,
  graphOpsDetails,
  generateGraphSteps,
};

export const ALGORITHM_CATALOG = [
  // Sorting Algorithms
  {
    ...bubbleSortDetails,
    visualizerType: 'sorting',
    defaultInput: [64, 34, 25, 12, 22, 11, 90],
    generator: generateBubbleSortSteps,
  },
  {
    ...selectionSortDetails,
    visualizerType: 'sorting',
    defaultInput: [29, 10, 14, 37, 13],
    generator: generateSelectionSortSteps,
  },
  {
    ...insertionSortDetails,
    visualizerType: 'sorting',
    defaultInput: [12, 11, 13, 5, 6],
    generator: generateInsertionSortSteps,
  },
  {
    ...mergeSortDetails,
    visualizerType: 'sorting',
    defaultInput: [38, 27, 43, 3, 9, 82, 10],
    generator: generateMergeSortSteps,
  },
  {
    ...quickSortDetails,
    visualizerType: 'sorting',
    defaultInput: [10, 80, 30, 90, 40, 50, 70],
    generator: generateQuickSortSteps,
  },

  // Searching Algorithms
  {
    ...linearSearchDetails,
    visualizerType: 'searching',
    defaultInput: [15, 42, 8, 99, 23, 67],
    defaultTarget: 23,
    generator: (arr, target) => generateLinearSearchSteps(arr, target),
  },
  {
    ...binarySearchDetails,
    visualizerType: 'searching',
    defaultInput: [4, 9, 15, 23, 31, 42, 55, 68, 77, 90],
    defaultTarget: 42,
    generator: (arr, target) => generateBinarySearchSteps(arr, target),
  },

  // Data Structures
  {
    ...arrayOpsDetails,
    visualizerType: 'array',
    defaultInput: [10, 20, 30, 40, 50, 60],
    generator: generateArraySteps,
  },
  {
    ...stackOpsDetails,
    visualizerType: 'stack',
    defaultInput: [15, 28, 42, 60],
    generator: generateStackSteps,
  },
  {
    ...queueOpsDetails,
    visualizerType: 'queue',
    defaultInput: [10, 20, 30, 40],
    generator: generateQueueSteps,
  },
  {
    ...linkedListOpsDetails,
    visualizerType: 'linked-list',
    defaultInput: [10, 20, 30, 40],
    generator: generateLinkedListSteps,
  },
  {
    ...bstOpsDetails,
    visualizerType: 'tree',
    defaultInput: [50, 30, 70, 20, 40, 60, 80],
    generator: generateBstSteps,
  },
  {
    ...heapOpsDetails,
    visualizerType: 'heap',
    defaultInput: [20, 15, 30, 40, 10, 50],
    generator: generateHeapSteps,
  },
  {
    ...graphOpsDetails,
    visualizerType: 'graph',
    defaultInput: 5,
    generator: generateGraphSteps,
  },
];

/**
 * Find algorithm definition by ID or archetype
 */
export function getAlgorithm(id) {
  if (!id) return ALGORITHM_CATALOG[0];
  const clean = id.toLowerCase().trim();
  return ALGORITHM_CATALOG.find((a) => a.id === clean || a.id.replace(/-/g, '') === clean.replace(/-/g, '')) || ALGORITHM_CATALOG[0];
}

/**
 * Filter algorithms by category
 */
export function getAlgorithmsByCategory(category) {
  if (!category || category === 'All') return ALGORITHM_CATALOG;
  return ALGORITHM_CATALOG.filter((a) => a.category.toLowerCase() === category.toLowerCase());
}

/**
 * Master step generator for any algorithm in the catalog
 */
export function generateAlgorithmSteps(id, input = null, target = null) {
  const algo = getAlgorithm(id);
  if (!algo || typeof algo.generator !== 'function') {
    return generateBubbleSortSteps(input);
  }
  return algo.generator(input !== null && input !== undefined ? input : algo.defaultInput, target !== null && target !== undefined ? target : algo.defaultTarget);
}

/**
 * Big-O Mathematical comparison data for Section 17 Complexity Visualization
 */
export const COMPLEXITY_CURVES = [
  { notation: 'O(1)', name: 'Constant', color: '#10b981', formula: (n) => 1 },
  { notation: 'O(log n)', name: 'Logarithmic', color: '#06b6d4', formula: (n) => Math.log2(Math.max(1, n)) },
  { notation: 'O(n)', name: 'Linear', color: '#f59e0b', formula: (n) => n },
  { notation: 'O(n log n)', name: 'Linearithmic', color: '#8b5cf6', formula: (n) => n * Math.log2(Math.max(1, n)) },
  { notation: 'O(n²)', name: 'Quadratic', color: '#ef4444', formula: (n) => n * n },
];
