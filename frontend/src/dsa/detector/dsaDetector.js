/**
 * CODE3D-AI - Structural DSA Detector
 * 
 * Inspects variable types, values, runtime states, and AST statements
 * to accurately identify data structures.
 */

import { DsaStructureType } from '../models/types.js';

export function detectDataStructure(variables = {}, code = '', explicitType = null) {
  if (explicitType) return explicitType;

  const clean = (code || '').toLowerCase();

  // 1. Inspect runtime variable values
  for (const [name, val] of Object.entries(variables)) {
    // 2D Array / Matrix detection
    if (Array.isArray(val) && val.length > 0 && Array.isArray(val[0])) {
      return DsaStructureType.MATRIX;
    }

    // Binary Tree Node (objects with left/right/val)
    if (val && typeof val === 'object' && ('left' in val || 'right' in val)) {
      return DsaStructureType.BINARY_TREE;
    }

    // Linked List Node (objects with next/val)
    if (val && typeof val === 'object' && 'next' in val) {
      if ('prev' in val) return DsaStructureType.DOUBLY_LINKED_LIST;
      return DsaStructureType.LINKED_LIST;
    }
  }

  // 2. Code syntactic constructs
  if (clean.includes('tree') || clean.includes('root') || clean.includes('treenode') || clean.includes('bst')) {
    return DsaStructureType.BINARY_TREE;
  }
  if (clean.includes('stack') || (clean.includes('.push(') && clean.includes('.pop(') && !clean.includes('queue'))) {
    return DsaStructureType.STACK;
  }
  if (clean.includes('queue') || clean.includes('deque') || clean.includes('poll(') || clean.includes('offer(')) {
    return DsaStructureType.QUEUE;
  }
  if (clean.includes('heap') || clean.includes('priorityqueue') || clean.includes('minheap') || clean.includes('maxheap')) {
    return DsaStructureType.HEAP;
  }
  if (clean.includes('graph') || clean.includes('adjlist') || clean.includes('adj') || clean.includes('edges')) {
    return DsaStructureType.GRAPH;
  }
  if (clean.includes('grid') || clean.includes('matrix') || clean.includes('board') || /\[\s*\w+\s*\]\s*\[\s*\w+\s*\]/.test(clean)) {
    return DsaStructureType.MATRIX;
  }
  if (clean.includes('node') || clean.includes('head') || clean.includes('listnode') || clean.includes('.next')) {
    return DsaStructureType.LINKED_LIST;
  }

  // 3. Check for array variables
  for (const [name, val] of Object.entries(variables)) {
    if (Array.isArray(val)) {
      return DsaStructureType.ARRAY;
    }
  }

  return DsaStructureType.ARRAY;
}
