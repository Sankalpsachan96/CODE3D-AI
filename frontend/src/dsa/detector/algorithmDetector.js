/**
 * CODE3D-AI - Algorithm Detector
 * 
 * Identifies the high-level algorithmic pattern from AST constructs and execution behavior.
 */

import { DsaAlgorithmType } from '../models/types.js';

export function detectAlgorithm(code = '', trace = []) {
  const clean = (code || '').toLowerCase();

  if (clean.includes('binarysearch') || clean.includes('binary_search') || (cleanCodeHasBinarySearchBounds(clean))) {
    return DsaAlgorithmType.BINARY_SEARCH;
  }
  if (clean.includes('linearsearch') || clean.includes('linear_search')) {
    return DsaAlgorithmType.LINEAR_SEARCH;
  }
  if (clean.includes('bubblesort') || clean.includes('bubble_sort')) {
    return DsaAlgorithmType.BUBBLE_SORT;
  }
  if (clean.includes('selectionsort') || clean.includes('selection_sort')) {
    return DsaAlgorithmType.SELECTION_SORT;
  }
  if (clean.includes('insertionsort') || clean.includes('insertion_sort')) {
    return DsaAlgorithmType.INSERTION_SORT;
  }
  if (clean.includes('mergesort') || clean.includes('merge_sort')) {
    return DsaAlgorithmType.MERGE_SORT;
  }
  if (clean.includes('quicksort') || clean.includes('quick_sort')) {
    return DsaAlgorithmType.QUICK_SORT;
  }
  if (clean.includes('heapsort') || clean.includes('heap_sort')) {
    return DsaAlgorithmType.HEAP_SORT;
  }
  if (clean.includes('dijkstra') || (clean.includes('dist') && clean.includes('minheap'))) {
    return DsaAlgorithmType.DIJKSTRA;
  }
  if (clean.includes('bfs') || (clean.includes('queue') && clean.includes('visited'))) {
    return DsaAlgorithmType.BFS;
  }
  if (clean.includes('dfs') || (clean.includes('visited') && clean.includes('recursion'))) {
    return DsaAlgorithmType.DFS;
  }
  if (clean.includes('slidingwindow') || clean.includes('sliding_window')) {
    return DsaAlgorithmType.SLIDING_WINDOW;
  }
  if (clean.includes('twopointer') || clean.includes('two_pointer') || (clean.includes('left') && clean.includes('right') && clean.includes('while'))) {
    return DsaAlgorithmType.TWO_POINTERS;
  }
  if (clean.includes('dp[') || clean.includes('memo[') || clean.includes('knapsack')) {
    return DsaAlgorithmType.DYNAMIC_PROGRAMMING;
  }

  return null;
}

function cleanCodeHasBinarySearchBounds(code) {
  return (code.includes('low') || code.includes('left')) &&
    (code.includes('high') || code.includes('right')) &&
    code.includes('mid');
}
