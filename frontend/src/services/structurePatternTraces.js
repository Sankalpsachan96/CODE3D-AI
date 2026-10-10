/**
 * Conservative source-pattern traces for common tree and graph DSA exercises.
 * These traces explain likely algorithm steps; they are not runtime instrumentation.
 */

function sourceLine(source, pattern, fallback = 1) {
  const match = String(source).match(pattern);
  return match ? String(source).slice(0, match.index).split(/\r?\n/).length : fallback;
}

function edgeState(nodes, edges, visited, activeIndex, algorithm, values = []) {
  return {
    type: 'graph',
    structureType: 'graph',
    algorithm,
    traversal: algorithm.toUpperCase(),
    nodes: nodes.map((node) => ({ ...node })),
    edges: edges.map((edge) => ({ ...edge })),
    values: values.slice(),
    visited: [...visited],
    activeIndex,
  };
}

function parseGraphSource(source) {
  const code = String(source || '');
  const edges = [];
  let vertices = new Set();
  let parsedLiteral = false;

  // Python/JavaScript adjacency dictionaries and nested adjacency arrays.
  const literalMatch = code.match(/\b(?:graph|adj|adjacency|adjacencyList|adjList|adjacency_list|adjacencyMatrix|adjacency_matrix)\b(?:\s*\[[^\]]*\])?\s*=\s*([\[{])/i);
  if (literalMatch) {
    const start = literalMatch.index + literalMatch[0].lastIndexOf(literalMatch[1]);
    const opener = code[start];
    const closer = opener === '[' ? ']' : '}';
    let depth = 0, end = -1;
    for (let i = start; i < code.length; i += 1) {
      if (code[i] === opener) depth += 1;
      if (code[i] === closer) { depth -= 1; if (depth === 0) { end = i; break; } }
    }
    if (end > start) {
      const literal = code.slice(start, end + 1);
      const dictEntries = [...literal.matchAll(/(?:^|[,{]\s*)(['"]?)(-?\d+)\1\s*:\s*\[([^\]]*)\]/g)];
      if (dictEntries.length) {
        dictEntries.forEach((m) => {
          const from = Number(m[2]); vertices.add(from);
          [...m[3].matchAll(/-?\d+/g)].forEach((n) => { const to = Number(n[0]); vertices.add(to); edges.push({ from, to }); });
        });
        parsedLiteral = true;
      } else {
        const rows = [];
        let rowDepth = 0, rowStart = -1;
        for (let i = 1; i < literal.length - 1; i += 1) {
          const ch = literal[i];
          if (ch === '[' || ch === '{') { rowDepth += 1; if (rowDepth === 1) rowStart = i + 1; }
          else if ((ch === ']' || ch === '}') && rowDepth > 0) {
            rowDepth -= 1;
            if (rowDepth === 0) rows.push(literal.slice(rowStart, i));
          }
        }
        if (rows.length) {
          const rowsParsed = rows.map((row) => [...row.matchAll(/-?\d+/g)].map((m) => Number(m[0])));
          const looksMatrix = /matrix/i.test(literalMatch[0]) || (rowsParsed.length > 1 && rowsParsed.every((row) => row.length === rowsParsed.length && row.every((v) => v === 0 || v === 1)));
          rowsParsed.forEach((row, from) => {
            vertices.add(from);
            row.forEach((value, to) => {
              if (looksMatrix ? value !== 0 : true) {
                const target = looksMatrix ? to : value;
                vertices.add(target);
                if (looksMatrix) { if (value !== 0) edges.push({ from, to: target }); }
                else edges.push({ from, to: target });
              }
            });
          });
          parsedLiteral = true;
        }
      }
    }
  }

  // C/C++/Java/JS/Python edge-builder calls such as addEdge(graph, 0, 1),
  // graph.addEdge(0, 1), or add_edge(0, 1).
  const edgeCall = /(?:\baddEdge|\badd_edge|\baddedge|\.addEdge)\s*\(\s*(?:(?:graph|g|adjacencyList|adjList)\s*,\s*)?(-?\d+)\s*,\s*(-?\d+)(?:\s*,\s*(-?\d+(?:\.\d+)?))?\s*\)/gi;
  for (const match of code.matchAll(edgeCall)) {
    const from = Number(match[1]), to = Number(match[2]);
    vertices.add(from); vertices.add(to);
    edges.push({ from, to, ...(match[3] == null ? {} : { weight: Number(match[3]) }) });
    parsedLiteral = true;
  }

  // C/Java/C++ matrix declarations: int graph[N][N] = {{...}, {...}}.
  if (!parsedLiteral) {
    const matrixMatch = code.match(/\b(?:graph|adjacencyMatrix|adjacency_matrix)\s*\[\s*\d+\s*\]\s*\[\s*\d+\s*\]\s*=\s*\{([\s\S]*?)\}\s*;/i);
    if (matrixMatch) {
      const rows = [...matrixMatch[1].matchAll(/\{([^{}]+)\}/g)].map((m) => [...m[1].matchAll(/-?\d+/g)].map((n) => Number(n[0])));
      rows.forEach((row, from) => row.forEach((weight, to) => {
        vertices.add(from); vertices.add(to);
        if (weight !== 0) edges.push({ from, to, ...(weight === 1 ? {} : { weight }) });
      }));
      parsedLiteral = rows.length > 0;
    }
  }

  if (!parsedLiteral || vertices.size === 0) return null;
  const ids = [...vertices].sort((a, b) => a - b);
  const unique = new Map();
  edges.forEach((edge) => unique.set(`${edge.from}->${edge.to}`, edge));
  return { ids, edges: [...unique.values()] };
}

export function buildGraphPatternTrace(source, runtimeOutput = []) {
  const code = String(source || '');
  const graph = parseGraphSource(code);
  if (!graph) return null;
  const lower = code.toLowerCase();
  const isDfs = /\b(?:dfs|depth\s*[- ]?first|depthfirstsearch)\b/.test(lower);
  const isBfs = /\b(?:bfs|breadth\s*[- ]?first|breadthfirstsearch)\b/.test(lower);
  const hasTraversal = isDfs || isBfs || /\bvisited\b|\bqueue\b|\bstack\b/.test(lower);
  if (!hasTraversal) return null;
  const algorithm = isDfs ? 'dfs' : 'bfs';
  const adjacency = new Map(graph.ids.map((id) => [id, []]));
  graph.edges.forEach(({ from, to }) => {
    if (adjacency.has(from) && adjacency.has(to)) adjacency.get(from).push(to);
  });
  const startMatch = code.match(/\b(?:start|source|root|startVertex|startNode)\s*=?\s*(-?\d+)/i)
    || code.match(/(?:push|append|offer|enqueue)\s*\(\s*(-?\d+)\s*\)/i);
  const start = startMatch ? Number(startMatch[1]) : graph.ids[0];
  if (!adjacency.has(start)) return null;
  const nodeList = graph.ids.map((id) => ({ id, val: id, value: id, label: String(id), nodeType: 'vertex' }));
  const edges = graph.edges.map((edge) => ({ ...edge }));
  const steps = [];
  const visited = [];
  const seen = new Set([start]);
  const work = [start];
  const visitLine = sourceLine(code, /\b(?:visited|visit|process|print|println|printf)\b/i, 1);
  let count = 1;
  const snapshot = (active, label, explanation, eventType, extra = {}) => {
    const state = edgeState(nodeList, edges, visited, active, algorithm);
    steps.push({
      stepNumber: count++, lineNumber: visitLine, algorithm, eventType,
      operation: eventType, message: label, explanation,
      variables: { current: active, visited: [...visited], worklist: [...work], ...extra },
      dataStructure: state, dataStructureState: state, traceKind: 'pattern-model',
      output: runtimeOutput,
    });
  };
  snapshot(start, `Graph ready · start at ${start}`, `Using the graph edges parsed from source; real program output is shown separately.`, 'GRAPH_START');
  while (work.length && steps.length < 300) {
    const current = isDfs ? work.pop() : work.shift();
    if (visited.includes(current)) continue;
    visited.push(current);
    snapshot(current, `${algorithm.toUpperCase()} visits ${current}`, `Visit vertex ${current}; neighbors are considered in source edge order.`, 'GRAPH_VISIT');
    const neighbors = adjacency.get(current) || [];
    const ordered = isDfs ? [...neighbors].reverse() : neighbors;
    for (const neighbor of ordered) {
      if (!seen.has(neighbor)) {
        seen.add(neighbor);
        work.push(neighbor);
        snapshot(current, `Discover edge ${current} → ${neighbor}`, `Vertex ${neighbor} is added to the ${isDfs ? 'DFS stack' : 'BFS queue'}.`, 'GRAPH_DISCOVER', { neighbor });
      }
    }
  }
  snapshot(null, `${algorithm.toUpperCase()} complete`, `Traversal reached ${visited.length} vertex(es) from start vertex ${start}.`, 'GRAPH_COMPLETE');
  return steps;
}

function sourceStructureState(type, values, extra = {}) {
  return { type, structureType: type, values: [...values], ...extra };
}

/** Trace simple stack/queue operations when the values and operations are explicit. */
export function buildLinearStructurePatternTrace(source, runtimeOutput = []) {
  const code = String(source || '');
  const lower = code.toLowerCase();
  const isStack = /\b(?:stack|push|pop|peek|top)\b/.test(lower);
  const isQueue = /\b(?:queue|enqueue|dequeue|offer|poll)\b/.test(lower);
  if (isStack === isQueue) return null;
  const type = isStack ? 'stack' : 'queue';
  const values = [];
  const steps = [];
  const lineOf = (index) => code.slice(0, index).split(/\r?\n/).length;
  const operations = /\b(push|append|add|offer|enqueue|pop|poll|dequeue|peek|top)\s*\(\s*([^)]*)\)/gi;
  let sequence = 1;
  for (const match of code.matchAll(operations)) {
    const operation = match[1].toLowerCase();
    const arg = match[2].trim();
    const lineNumber = lineOf(match.index);
    let message = '';
    let eventType = '';
    let value;
    if (['push', 'append', 'add', 'offer', 'enqueue'].includes(operation)) {
      if (!arg || !/^-?\d+(?:\.\d+)?$|^['"][^'"]*['"]$|^(true|false)$/i.test(arg)) continue;
      value = /^['"]/.test(arg) ? arg.slice(1, -1) : (/^-?\d/.test(arg) ? Number(arg) : arg);
      values.push(value);
      message = `${type === 'stack' ? 'Push onto stack' : 'Enqueue into queue'}: ${value}`;
      eventType = type === 'stack' ? 'STACK_PUSH' : 'QUEUE_ENQUEUE';
    } else if (['pop', 'poll', 'dequeue'].includes(operation)) {
      value = type === 'stack' ? values.pop() : values.shift();
      message = value === undefined ? `${type} is empty; remove operation has no element` : `${type === 'stack' ? 'Pop from stack' : 'Dequeue from queue'}: ${value}`;
      eventType = type === 'stack' ? 'STACK_POP' : 'QUEUE_DEQUEUE';
    } else {
      value = type === 'stack' ? values[values.length - 1] : values[0];
      message = value === undefined ? `${type} is empty` : `${type === 'stack' ? 'Top' : 'Front'} element: ${value}`;
      eventType = type === 'stack' ? 'STACK_PEEK' : 'QUEUE_PEEK';
    }
    const state = sourceStructureState(type, values, { activeIndex: values.length ? values.length - 1 : null, label: message, focusInfo: 'Modeled from explicit source operations; actual program output/status are shown separately.' });
    steps.push({
      stepNumber: sequence++, lineNumber, algorithm: type, eventType, operation: eventType,
      message, explanation: message, variables: { value, size: values.length },
      dataStructureState: state, traceKind: 'pattern-model', output: runtimeOutput,
    });
  }
  if (!steps.length) return null;
  return steps;
}

/** Trace linked-list node creation and next-pointer links from common C-family/JS syntax. */
export function buildLinkedListPatternTrace(source, runtimeOutput = []) {
  const code = String(source || '');
  const hasNext = /(?:->|\.)\s*next\b|\bnext\s*=/.test(code);
  const hasNodeType = /\b(?:class|struct)\s+(?:Node|ListNode)\b|\b(?:Node|ListNode)\s*\*/i.test(code);
  if (!hasNext || !hasNodeType) return null;
  const nodes = [];
  const names = new Map();
  const edges = [];
  const steps = [];
  let sequence = 1;
  const lineOf = (index) => code.slice(0, index).split(/\r?\n/).length;
  const allocations = /\b(\w+)\s*=\s*(?:new\s+)?(?:Node|ListNode)\s*\(\s*([^,)]+)[^)]*\)/gi;
  for (const match of code.matchAll(allocations)) {
    const name = match[1];
    const raw = match[2].trim();
    const value = /^['"]/.test(raw) ? raw.slice(1, -1) : (/^-?\d+(?:\.\d+)?$/.test(raw) ? Number(raw) : raw);
    if (names.has(name)) continue;
    const id = nodes.length;
    names.set(name, id);
    nodes.push({ id, val: value, value, label: String(value), next: null, nodeType: 'list_node', name });
    const state = sourceStructureState('linked-list', nodes.map((node) => node.val), {
      nodes: nodes.map((node) => ({ ...node })), edges: edges.map((edge) => ({ ...edge })),
      activeIndex: id, label: `Create node ${value}`, focusInfo: 'Node allocation inferred from source; this is not runtime instrumentation.',
    });
    steps.push({ stepNumber: sequence++, lineNumber: lineOf(match.index), algorithm: 'linked_list', eventType: 'LIST_CREATE', operation: 'CREATE_NODE', message: `Create node ${value}`, explanation: `Allocate list node ${value}.`, dataStructureState: state, traceKind: 'pattern-model', output: runtimeOutput });
  }
  const links = /\b(\w+)\s*(?:->|\.)\s*next\s*=\s*(\w+)\s*;?/gi;
  for (const match of code.matchAll(links)) {
    const from = names.get(match[1]), to = names.get(match[2]);
    if (from === undefined || to === undefined) continue;
    nodes[from].next = to;
    if (!edges.some((edge) => edge.from === from && edge.to === to)) edges.push({ from, to, label: 'next' });
    const state = sourceStructureState('linked-list', nodes.map((node) => node.val), {
      nodes: nodes.map((node) => ({ ...node })), edges: edges.map((edge) => ({ ...edge })),
      activeIndex: from, label: `Link ${nodes[from].val} → ${nodes[to].val}`, focusInfo: 'The next pointer connects these nodes.',
    });
    steps.push({ stepNumber: sequence++, lineNumber: lineOf(match.index), algorithm: 'linked_list', eventType: 'LIST_LINK', operation: 'LINK_NEXT', message: `Link ${nodes[from].val} → ${nodes[to].val}`, explanation: `Set next pointer of ${nodes[from].val} to ${nodes[to].val}.`, dataStructureState: state, traceKind: 'pattern-model', output: runtimeOutput });
  }
  return steps.length ? steps : null;
}

/** Tree/Binary-tree traces for explicit Node allocations and left/right links. */
export function buildTreePatternTrace(source, runtimeOutput = []) {
  const code = String(source || '');
  const hasTreeLinks = /(?:->|\.)\s*(?:left|right)\s*=/.test(code);
  const hasNodeType = /\b(?:class|struct)\s+(?:Node|TreeNode)\b|\b(?:Node|TreeNode)\s*\*/i.test(code);
  if (!hasTreeLinks || !hasNodeType || /(?:->|\.)\s*next\s*=/.test(code)) return null;
  const nodes = [];
  const byName = new Map();
  const edges = [];
  const steps = [];
  const lineOf = (index) => code.slice(0, index).split(/\r?\n/).length;
  const allocations = /\b([\w.]+)\s*=\s*(?:new\s+)?(?:Node|TreeNode)\s*\(\s*([^,)]+)[^)]*\)/gi;
  for (const match of code.matchAll(allocations)) {
    const name = match[1].replace(/->/g, '.');
    const raw = match[2].trim();
    const value = /^['"]/.test(raw) ? raw.slice(1, -1) : (/^-?\d+(?:\.\d+)?$/.test(raw) ? Number(raw) : raw);
    if (byName.has(name)) continue;
    const id = nodes.length;
    byName.set(name, id);
    nodes.push({ id, val: value, value, label: String(value), left: null, right: null, parent: null, depth: 0, name });
  }
  if (!nodes.length) return null;
  const rootNameMatch = code.match(/\b(?:Node|TreeNode)\s*\*?\s*(\w+)\s*=\s*(?:new\s+)?(?:Node|TreeNode)\s*\(/i);
  const rootName = rootNameMatch?.[1];
  const rootId = byName.get(rootName) ?? 0;
  const snapshot = (activeIndex, lineNumber, message, operation) => {
    const copy = nodes.map((node) => ({ ...node }));
    steps.push({
      stepNumber: steps.length + 1, lineNumber, algorithm: 'binary_tree', eventType: operation,
      operation, message, explanation: message, variables: { activeIndex },
      dataStructureState: { type: 'tree', structureType: 'tree', algorithm: 'binary_tree', nodes: copy, edges: edges.map((edge) => ({ ...edge })), values: copy.map((node) => node.val), activeIndex, root: rootId, label: message, focusInfo: 'Tree shape is inferred from explicit node allocations and child links; runtime output/status are real.' },
      traceKind: 'pattern-model', output: runtimeOutput,
    });
  };
  snapshot(rootId, lineOf(code, 1), `Tree initialized with root ${nodes[rootId].val}`, 'TREE_START');
  const links = /\b([\w.]+)\s*(?:->|\.)\s*(left|right)\s*=\s*(?:&?\s*)?([\w.]+)\s*;?/gi;
  for (const match of code.matchAll(links)) {
    const fromName = match[1].replace(/->/g, '.');
    const toName = match[3].replace(/->/g, '.');
    const from = byName.get(fromName), to = byName.get(toName);
    if (from === undefined || to === undefined || from === to) continue;
    const side = match[2].toLowerCase();
    nodes[from][side] = to;
    nodes[to].parent = from;
    nodes[to].depth = nodes[from].depth + 1;
    edges.push({ from, to, label: side });
    snapshot(to, lineOf(match.index), `Connect ${nodes[from].val} → ${side} child ${nodes[to].val}`, 'TREE_LINK');
  }
  return steps;
}
