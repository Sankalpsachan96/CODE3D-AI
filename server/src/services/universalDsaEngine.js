/**
 * Universal DSA detector adapted from the uploaded CODE3D-AI-TUTOR project.
 * The deterministic execution/trace adapters remain the runtime source of truth;
 * this module provides a lightweight structural classification for the tutor and UI.
 */
export function detectDsaConcept(code = '') {
  const source = String(code).toLowerCase();
  if (/(\bbfs\b|\bdfs\b|visited|adjacency)/.test(source)) {
    return { algorithm: source.includes('dfs') ? 'dfs' : source.includes('bfs') ? 'bfs' : 'graph_traversal', dataStructure: 'graph', visualization: 'graph' };
  }
  if (/struct\s+node|class\s+node|->next|\.next\b/.test(source)) {
    return { algorithm: 'linked_list', dataStructure: 'linked_list', visualization: 'linked_list' };
  }
  if (/stack\s*</.test(source) || /\.push\s*\(/.test(source) && /\.pop\s*\(/.test(source)) {
    return { algorithm: 'stack_operations', dataStructure: 'stack', visualization: 'stack' };
  }
  if (/queue\s*</.test(source) || /\.enqueue\s*\(/.test(source) || /\.dequeue\s*\(/.test(source)) {
    return { algorithm: 'queue_operations', dataStructure: 'queue', visualization: 'queue' };
  }
  if (/\bmid\b/.test(source) && /\blow\b/.test(source) && /\bhigh\b/.test(source)) {
    return { algorithm: 'binary_search', dataStructure: 'array', visualization: 'array_search' };
  }
  if (/minindex|min_idx/.test(source)) {
    return { algorithm: 'selection_sort', dataStructure: 'array', visualization: 'array_sort' };
  }
  if (/j\s*--/.test(source) && /j\s*\+\s*1/.test(source)) {
    return { algorithm: 'insertion_sort', dataStructure: 'array', visualization: 'array_sort' };
  }
  if (/swap/.test(source) && /j\s*\+\s*1/.test(source)) {
    return { algorithm: 'bubble_sort', dataStructure: 'array', visualization: 'array_sort' };
  }
  if (/factorial\s*\(|fibonacci\s*\(|\bfib\s*\(|towerofhanoi\s*\(|backtrack/.test(source)) {
    return { algorithm: 'recursion', dataStructure: 'call_stack', visualization: 'recursion' };
  }
  if (/\b(vector|array|arr)\b|\[[^\]]+\]/.test(source)) {
    return { algorithm: 'array_traversal', dataStructure: 'array', visualization: 'array' };
  }
  if (/\b(tree|bst|root)\b/.test(source)) {
    return { algorithm: 'tree', dataStructure: 'tree', visualization: 'tree' };
  }
  return { algorithm: 'unknown', dataStructure: 'unknown', visualization: 'generic' };
}

export function buildUniversalRuntimeContext(code, steps = [], execution = {}) {
  const analysis = detectDsaConcept(code);
  const last = Array.isArray(steps) && steps.length ? steps[steps.length - 1] : null;
  return {
    analysis,
    runtimeTruth: {
      totalSteps: Array.isArray(steps) ? steps.length : 0,
      lastStep: last,
      output: execution.output || [],
      status: execution.status || null,
      error: execution.message || null,
    },
  };
}
