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
