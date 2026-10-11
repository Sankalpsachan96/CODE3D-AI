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
  const literalMatch = code.match(/\b(?:graph|adj|adjacency|adjacencyList|(?:graph|g|adj|adjacency|adjacencyList|adjList)|adjacency_list|adjacencyMatrix|adjacency_matrix)\b(?:\s*\[[^\]]*\])?\s*=\s*([\[{])/i);
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
  const edgeCall = /(?:\baddEdge|\badd_edge|\baddedge|\.addEdge)\s*\(\s*(?:(?:graph|g|adj|adjacency|adjacencyList|adjList)\s*,\s*)?(-?\d+)\s*,\s*(-?\d+)(?:\s*,\s*(-?\d+(?:\.\d+)?))?\s*\)/gi;
  for (const match of code.matchAll(edgeCall)) {
    const from = Number(match[1]), to = Number(match[2]);
    vertices.add(from); vertices.add(to);
    edges.push({ from, to, ...(match[3] == null ? {} : { weight: Number(match[3]) }) });
    parsedLiteral = true;
  }

  // C/Java/C++ matrix declarations: int graph[N][N] = {{...}, {...}}.
  if (!parsedLiteral) {
    const matrixMatch = code.match(/\b(?:graph|adj|adjacencyMatrix|adjacency_matrix)\s*\[\s*\d+\s*\]\s*\[\s*\d+\s*\]\s*=\s*\{([\s\S]*?)\}\s*;/i);
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
  // Only classify a program as a Stack when it declares/uses an identifiable
  // stack object. Generic array methods such as arr.push(...) and arr.pop(...)
  // are Array operations, not evidence of a Stack.
  const declaredStack = /\b(?:stack|Stack)\s*(?:<[^>]+>)?\s+\w+|\b(?:const|let|var)\s+stack\s*=\s*(?:\[\s*\]|new\s+Stack\s*\(|Stack\s*\()/i.test(code)
    || /\bclass\s+Stack\b/.test(code) && /\bstack\s*=\s*(?:new\s+Stack\s*\(|Stack\s*\(|\[\s*\])/i.test(code);
  const declaredQueue = /\b(?:queue|Queue|Deque)\s*(?:<[^>]+>)?\s+\w+|\b(?:const|let|var)\s+queue\s*=\s*(?:\[\s*\]|new\s+(?:Queue|Deque)\s*\(|(?:Queue|Deque)\s*\()/i.test(code);
  const stackReceiverCall = /\b(?:stack|s)\s*\.\s*(?:push|pop|peek|top)\s*\(/i.test(code);
  const queueReceiverCall = /\b(?:queue|q|deque)\s*\.\s*(?:enqueue|dequeue|offer|poll|peek|front|shift|push|pop)\s*\(/i.test(code);
  const hasArrayReceiver = /\b(?:arr|array|values|nums|items)\s*\.\s*(?:push|pop|shift|unshift|splice)\s*\(/i.test(code);
  const isStack = declaredStack || stackReceiverCall || (!hasArrayReceiver && !declaredQueue && /\b(?:std::)?stack\s*<|\b(?:push|pop|peek|top)\s*\(/i.test(code) && /\b(?:stack|Stack)\b/.test(code));
  const isQueue = declaredQueue || queueReceiverCall || (!hasArrayReceiver && !declaredStack && /\b(?:enqueue|dequeue|offer|poll)\s*\(/i.test(code) && /\b(?:queue|Queue|Deque)\b/.test(code));
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
  const lineOf = (index) => code.slice(0, index).split(/\r?\n/).length;
  const nodes = [], edges = [], steps = [];
  let sequence = 1;
  const snapshot = (index, message, operation, activeIndex = null) => {
    const nodeCopies = nodes.map((node) => ({ ...node }));
    steps.push({
      stepNumber: sequence++, lineNumber: lineOf(index), algorithm: 'linked_list',
      eventType: operation, operation, message, explanation: message,
      variables: { size: nodes.length, activeIndex },
      dataStructureState: sourceStructureState('linked-list', nodeCopies.map((node) => node.val), {
        nodes: nodeCopies, edges: edges.map((edge) => ({ ...edge })),
        activeIndex, label: message,
        focusInfo: 'Linked-list operation modeled from source calls; program output/status are real.'
      }),
      traceKind: 'pattern-model', output: runtimeOutput,
    });
  };
  const relink = () => {
    edges.length = 0;
    nodes.forEach((node, index) => {
      node.next = index + 1 < nodes.length ? nodes[index + 1].id : null;
      if (node.next !== null) edges.push({ from: node.id, to: node.next, label: 'next' });
    });
  };
  const add = (value, position, index, label) => {
    const node = { id: sequence + nodes.length + steps.length, val: value, value, label: String(value), next: null, nodeType: 'list_node' };
    const at = Math.max(0, Math.min(nodes.length, position));
    nodes.splice(at, 0, node);
    relink();
    snapshot(index, label, 'LIST_INSERT', at);
  };
  const remove = (position, index, label) => {
    if (!nodes.length) { snapshot(index, label + ': list is empty', 'LIST_DELETE_EMPTY'); return; }
    const at = Math.max(0, Math.min(nodes.length - 1, position));
    const [deleted] = nodes.splice(at, 1);
    relink();
    snapshot(index, label + ': removed ' + deleted.val, 'LIST_DELETE', at < nodes.length ? at : null);
  };
  const callPattern = /\b(?:\w+\s*\.\s*)?(insertBeginning|insert_beginning|insertEnd|insert_end|insertMiddle|insert_middle|deleteBeginning|delete_beginning|deleteEnd|delete_end|deleteMiddle|delete_middle|search|display)\s*\(([^)]*)\)/g;
  const calls = [...code.matchAll(callPattern)].filter((match) => {
    const prefix = code.slice(Math.max(0, match.index - 30), match.index);
    return !/\b(?:def|function)\s*$/.test(prefix) && !/\b(?:void|int|bool|public|private)\s*$/.test(prefix.trim());
  });
  if (calls.length) {
    for (const match of calls) {
      const method = match[1].toLowerCase();
      const args = match[2].split(',').map((part) => part.trim());
      const numberValue = (raw) => {
        if (/^-?\d+(?:\.\d+)?$/.test(raw)) return Number(raw);
        const quoted = raw.match(/^(['"])(.*)\1$/);
        return quoted ? quoted[2] : null;
      };
      const value = numberValue(args[0]);
      const position = Number(args[1]);
      if (method.startsWith('insert') && value !== null) {
        if (method.includes('beginning')) add(value, 0, match.index, 'Insert ' + value + ' at beginning');
        else if (method.includes('end')) add(value, nodes.length, match.index, 'Insert ' + value + ' at end');
        else if (method.includes('middle')) add(value, Number.isFinite(position) ? position - 1 : nodes.length, match.index, 'Insert ' + value + ' at position ' + position);
      } else if (method.startsWith('delete')) {
        if (method.includes('beginning')) remove(0, match.index, 'Delete from beginning');
        else if (method.includes('end')) remove(nodes.length - 1, match.index, 'Delete from end');
        else if (method.includes('middle')) remove(Number.isFinite(position) ? position - 1 : 0, match.index, 'Delete at position ' + position);
      } else if (method === 'search' && value !== null) {
        const found = nodes.findIndex((node) => node.val === value);
        snapshot(match.index, found >= 0 ? 'Found ' + value + ' at position ' + (found + 1) : value + ' not found', 'LIST_SEARCH', found >= 0 ? found : null);
      } else if (method === 'display') {
        snapshot(match.index, 'Display ' + nodes.length + ' linked-list node(s)', 'LIST_DISPLAY');
      }
    }
    if (steps.length) return steps;
  }
  const names = new Map();
  const allocations = /\b(\w+)\s*=\s*(?:new\s+)?(?:Node|ListNode)\s*\(\s*([^,)]+)[^)]*\)/gi;
  for (const match of code.matchAll(allocations)) {
    const name = match[1], raw = match[2].trim();
    const value = /^['"]/.test(raw) ? raw.slice(1, -1) : (/^-?\d+(?:\.\d+)?$/.test(raw) ? Number(raw) : raw);
    if (names.has(name)) continue;
    const id = nodes.length;
    names.set(name, id);
    nodes.push({ id, val: value, value, label: String(value), next: null, nodeType: 'list_node', name });
    snapshot(match.index, 'Create node ' + value, 'LIST_CREATE', id);
  }
  const links = /\b(\w+)\s*(?:->|\.)\s*next\s*=\s*(\w+)\s*;?/gi;
  for (const match of code.matchAll(links)) {
    const from = names.get(match[1]), to = names.get(match[2]);
    if (from === undefined || to === undefined) continue;
    nodes[from].next = to;
    if (!edges.some((edge) => edge.from === from && edge.to === to)) edges.push({ from, to, label: 'next' });
    snapshot(match.index, 'Link ' + nodes[from].val + ' → ' + nodes[to].val, 'LIST_LINK', from);
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
