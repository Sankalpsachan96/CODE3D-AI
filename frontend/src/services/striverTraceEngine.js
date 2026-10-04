/**
 * Problem-aware Striver trace layer.
 * The selected problem id/title is authoritative; generic source-code heuristics
 * must never turn Combination Sum into factorial, or any other unrelated trace.
 */
function step(stepNumber, lineNumber, algorithm, type, state, explanation, output = []) {
  return { stepNumber, lineNumber, algorithm, eventType: type, variables: state.variables || {}, output, dataStructureState: state.dataStructureState, explanation, aiHint: explanation };
}

function valuesFrom(input) {
  if (Array.isArray(input)) return input.map(Number).filter(Number.isFinite);
  const m = String(input ?? '').match(/-?\d+(?:\.\d+)?/g);
  return m ? m.map(Number) : [];
}

export function generateStriverTrace({ id, title, archetype, input = '', language = 'java' }) {
  const name = String(title || `Striver Problem ${id}`);
  const arch = String(archetype || '').toLowerCase();
  const values = valuesFrom(input);
  const base = values.length >= 2 ? values : [7, 2, 5, 1, 9];
  const line = 1;
  const out = [];

  if (/recursion|backtracking/.test(arch)) {
    const frames = [
      `${name}(start=0)`,
      `${name}(choose)`,
      `${name}(recurse)`,
      `${name}(backtrack)`,
    ];
    return frames.map((frame, i) => step(i + 1, line + i, name, i === frames.length - 1 ? 'RECURSION_RETURN' : 'RECURSION_CALL', {
      variables: { callDepth: i + 1 },
      dataStructureState: { type: 'recursion', callStack: frames.slice(0, i + 1).map((func, j) => ({ func, depth: j + 1 })), label: `${name} · ${i === frames.length - 1 ? 'Backtrack / return' : 'Recursive call'}`, focusInfo: `Call depth ${i + 1}` },
    }, i === frames.length - 1 ? `${name} backtracks and returns.` : `${name}: exploring the next decision.`));
  }

  if (/sort/.test(arch) || /inversion|interval|meeting|knapsack|cookies|job sequencing/.test(name.toLowerCase())) {
    const a = [...base];
    const steps = [step(1, 1, name, 'INITIAL_STATE', { dataStructureState: { type: 'array', values: a, activeIndex: 0, label: name, focusInfo: 'Initial input state' } }, `${name}: input initialized.`)];
    for (let i = 0; i < Math.min(4, a.length - 1); i++) {
      const j = i + 1;
      steps.push(step(steps.length + 1, i + 2, name, 'COMPARE', { variables: { i, j }, dataStructureState: { type: 'array', values: [...a], activeIndex: j, indices: [i, j], label: name, focusInfo: `Compare positions ${i} and ${j}` } }, `${name}: compare the current candidates.`));
      if (a[i] > a[j]) [a[i], a[j]] = [a[j], a[i]];
      steps.push(step(steps.length + 1, i + 2, name, 'UPDATE', { variables: { i, j }, dataStructureState: { type: 'array', values: [...a], activeIndex: j, indices: [i, j], label: name, focusInfo: 'Apply the algorithm decision' } }, `${name}: apply the required greedy/sorting update.`));
    }
    steps.push(step(steps.length + 1, 1, name, 'COMPLETE', { dataStructureState: { type: 'array', values: a, label: `${name} complete`, focusInfo: 'Final state' } }, `${name}: trace complete.`));
    return steps;
  }

  if (/binary-search/.test(arch)) {
    const a = [...base].sort((x, y) => x - y);
    const target = a[Math.floor(a.length / 2)] ?? 5;
    return [0, 1, 2].map((i) => {
      const low = i === 0 ? 0 : i;
      const high = a.length - 1 - i;
      const mid = Math.floor((low + high) / 2);
      return step(i + 1, i + 1, name, 'COMPARE', { variables: { low, mid, high, target }, dataStructureState: { type: 'array', values: a, activeIndex: mid, pointers: { low, mid, high }, target, label: name, focusInfo: `low=${low}, mid=${mid}, high=${high}` } }, `${name}: compare the middle element with the target.`);
    });
  }

  if (/linked-list|cycle/.test(arch)) {
    const nodes = (values.length ? values : [10, 20, 30, 40]).slice(0, 5);
    return nodes.map((value, i) => step(i + 1, i + 1, name, 'POINTER_MOVE', { variables: { index: i, value }, dataStructureState: { type: 'linked-list', values: nodes, activeIndex: i, pointers: { current: i }, label: name, focusInfo: `Current node = ${value}` } }, `${name}: move through the linked-list structure.`));
  }

  if (/stack|monotonic-stack|queue/.test(arch)) {
    const state = [];
    return base.slice(0, 4).map((value, i) => {
      if (/queue/.test(arch)) state.push(value); else if (i % 2 === 0) state.push(value); else state.pop();
      return step(i + 1, i + 1, name, 'STACK_QUEUE', { variables: { value }, dataStructureState: { type: /queue/.test(arch) ? 'queue' : 'stack', values: [...state], activeIndex: state.length - 1, label: name, focusInfo: `Process value ${value}` } }, `${name}: process ${value} using the stack/queue invariant.`);
    });
  }

  if (/heap/.test(arch)) {
    const heap = [...base].sort((a, b) => a - b);
    return heap.slice(0, 5).map((value, i) => step(i + 1, i + 1, name, 'HEAP_OPERATION', { variables: { value }, dataStructureState: { type: 'heap', values: heap.slice(0, i + 1), activeIndex: i, label: name, focusInfo: `Heap operation with ${value}` } }, `${name}: maintain heap order while processing the value.`));
  }

  if (/graph|topological|dijkstra|dsu/.test(arch)) {
    return [0, 1, 2, 3].map((node, i) => step(i + 1, i + 1, name, 'GRAPH_VISIT', { variables: { node }, dataStructureState: { type: 'graph', values: [0, 1, 2, 3, 4], activeIndex: node, label: name, focusInfo: `Visit/relax node ${node}` } }, `${name}: visit or relax the next graph node.`));
  }

  if (/tree|bst/.test(arch)) {
    const nodes = [50, 30, 70, 20, 40, 60, 80];
    return nodes.slice(0, 5).map((value, i) => step(i + 1, i + 1, name, 'TREE_VISIT', { variables: { value }, dataStructureState: { type: /bst/.test(arch) ? 'bst' : 'tree', values: nodes, activeIndex: i, label: name, focusInfo: `Visit node ${value}` } }, `${name}: process tree node ${value} according to the traversal/DP rule.`));
  }

  if (/trie/.test(arch)) {
    const chars = ['C', 'O', 'D', 'E'];
    return chars.map((char, i) => step(i + 1, i + 1, name, 'TRIE_STEP', { variables: { char }, dataStructureState: { type: 'trie', values: chars.slice(0, i + 1), activeIndex: i, label: name, focusInfo: `Process character ${char}` } }, `${name}: process trie character ${char}.`));
  }

  if (/dp|dynamic-programming|kadane|lis/.test(arch)) {
    const dp = base.map((v, i) => i === 0 ? v : Math.max(v, (base[i - 1] || 0) + v));
    return dp.slice(0, 5).map((value, i) => step(i + 1, i + 1, name, 'DP_UPDATE', { variables: { index: i, value }, dataStructureState: { type: 'array', values: dp, activeIndex: i, label: name, focusInfo: `DP state at index ${i}` } }, `${name}: update the dynamic-programming state.`));
  }

  if (/matrix|grid/.test(arch)) {
    const matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];
    return matrix.flatMap((row, r) => row.map((value, c) => step(r * 3 + c + 1, r + 1, name, 'MATRIX_VISIT', { variables: { row: r, col: c, value }, dataStructureState: { type: 'matrix', values: matrix, activeIndex: r * 3 + c, pointers: { row: r, col: c }, label: name, focusInfo: `Process matrix[${r}][${c}] = ${value}` } }, `${name}: process matrix cell (${r}, ${c}).`))).slice(0, 9);
  }

  return [1, 2, 3].map((i) => step(i, i, name, 'EXECUTION_STEP', { variables: { step: i }, dataStructureState: { type: 'array', values: base, activeIndex: i - 1, label: name, focusInfo: 'Problem-specific execution step' } }, `${name}: execute step ${i}.`));
}
