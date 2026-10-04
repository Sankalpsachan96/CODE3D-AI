/**
 * Standardized Algorithm & Visualization Engine Constants
 * Section 6, 7 & 13 of CODE3D-AI Architecture
 */

export const VisualState = {
  DEFAULT: 'DEFAULT',
  CURRENT: 'CURRENT',
  COMPARE: 'COMPARE',
  SELECTED: 'SELECTED',
  SWAPPING: 'SWAPPING',
  SORTED: 'SORTED',
  FOUND: 'FOUND',
  NOT_FOUND: 'NOT_FOUND',
  PIVOT: 'PIVOT',
  TARGET: 'TARGET',
  VISITED: 'VISITED',
  PATH: 'PATH',
};

export const AlgorithmEventType = {
  START: 'START',
  COMPARE: 'COMPARE',
  SWAP: 'SWAP',
  SELECT: 'SELECT',
  INSERT: 'INSERT',
  MERGE: 'MERGE',
  PARTITION: 'PARTITION',
  SORTED: 'SORTED',
  FOUND: 'FOUND',
  NOT_FOUND: 'NOT_FOUND',
  PUSH: 'PUSH',
  POP: 'POP',
  ENQUEUE: 'ENQUEUE',
  DEQUEUE: 'DEQUEUE',
  TRAVERSE: 'TRAVERSE',
  UPDATE: 'UPDATE',
  COMPLETE: 'COMPLETE',
};

export const AlgorithmCategory = {
  SORTING: 'Sorting',
  SEARCHING: 'Searching',
  DATA_STRUCTURES: 'Data Structures',
};
