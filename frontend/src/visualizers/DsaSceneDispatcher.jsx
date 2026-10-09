import React from 'react';
import { getVisualizerComponent, visualizerRegistry } from './visualizerRegistry';
import { resolveSceneState } from './sceneState';

const ALGORITHM_TO_VISUALIZER = [
  [/^(bubble_sort|selection_sort|insertion_sort|merge_sort|quick_sort|sorting|sort)/, 'sorting'],
  [/(binary_search|linear_search|search)/, 'searching'],
  [/(stack|parentheses|monotonic_stack)/, 'stack'],
  [/(queue|deque)/, 'queue'],
  [/(linked_list|linkedlist|cycle_detection)/, 'linked-list'],
  [/(bst|binary_search_tree)/, 'bst'],
  [/(tree|traversal|lowest_common_ancestor)/, 'tree'],
  [/(heap|priority_queue)/, 'heap'],
  [/(trie|prefix_tree)/, 'trie'],
  [/(dijkstra|shortest_path|bfs|dfs|graph|topological|dsu|union_find|kruskal|prim|bellman|kosaraju)/, 'graph'],
  [/(two_sum|hash|map|hash_table|hashmap)/, 'hash-table'],
  [/(recursion|backtracking|n_queens|sudoku)/, 'recursion'],
  [/(dynamic_programming|dp|knapsack|coin_change|edit_distance|lcs|lis|kadane)/, 'dp'],
  [/(matrix|grid|flood_fill|rotting_oranges)/, 'matrix'],
];

function resolveVisualizerType(state) {
  const rawType = String(state?.type || '').toLowerCase().replace(/_/g, '-').trim();
  const direct = getVisualizerComponent(rawType);

  // If the trace already declares a registered semantic type, trust it.
  if (rawType && visualizerRegistry[rawType]) {
    return { type: rawType, component: direct };
  }

  const algorithm = String(state?.algorithm || '').toLowerCase().replace(/-/g, '_').trim();
  for (const [pattern, type] of ALGORITHM_TO_VISUALIZER) {
    if (pattern.test(algorithm)) {
      return { type, component: getVisualizerComponent(type) };
    }
  }

  // Unknown runtime types such as "grid", "table", "call_stack" and "map"
  // are now covered by the registry aliases. This fallback is for truly generic code.
  return { type: rawType || 'array', component: direct };
}

export default function DsaSceneDispatcher({
  dataStructureState,
  showFallback = true,
  isXRayMode = false,
  onSelectElement = null,
}) {
  const state = resolveSceneState(dataStructureState, { showFallback });
  if (!state) return null;

  const rawType = String(state.type || 'array').toLowerCase().replace(/_/g, '-').trim();
  const { type, component: VisualizerComponent } = resolveVisualizerType(state);

  const isExplicitUniversal =
    type === 'universal-execution' ||
    type === 'registers' ||
    type === 'universal';

  // Do not route every variable-only DSA trace to the universal visualizer.
  // Semantic algorithm types (DP/table/grid/call-stack/hash-map) must win first.
  const hasNoStructuredState =
    !state.values &&
    !state.matrix &&
    !state.nodes &&
    !state.callStack &&
    !state.hashTable &&
    (!state.variables || Object.keys(state.variables).length === 0);

  if (isExplicitUniversal || (rawType === 'unknown' && hasNoStructuredState)) {
    const UniversalVis = visualizerRegistry.universal;
    return (
      <UniversalVis
        dataStructureState={state}
        isXRayMode={isXRayMode}
        onSelectElement={onSelectElement}
      />
    );
  }

  return (
    <VisualizerComponent
      dataStructureState={{ ...state, type }}
      isXRayMode={isXRayMode}
      onSelectElement={onSelectElement}
    />
  );
}

export { visualizerRegistry };
