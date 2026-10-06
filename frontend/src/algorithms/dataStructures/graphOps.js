import { AlgorithmEventType } from '../types.js';

export const graphOpsDetails = {
  id: 'graph-ops',
  name: 'Graph Traversal (BFS & DFS)',
  category: 'Data Structures',
  description: 'A non-linear data structure comprising vertices (nodes) and edges (connections). Traversal systematically visits each reachable vertex from a starting source.',
  howItWorks: 'Breadth-First Search (BFS) explores neighbor nodes layer by layer using a FIFO queue. Depth-First Search (DFS) explores as deep as possible along each branch before backtracking using a LIFO stack/recursion.',
  example: 'Graph with 5 vertices (0 to 4). BFS from 0 visits immediate neighbors [1, 2], then neighbors of 1 and 2 [3, 4].',
  complexity: {
    time: {
      best: 'O(V + E)',
      average: 'O(V + E)',
      worst: 'O(V + E)',
    },
    space: 'O(V)',
    stable: 'Not Applicable',
    inPlace: 'No',
  },
  advantages: [
    'BFS guarantees shortest path discovery on unweighted graphs.',
    'DFS has minimal memory footprint O(h) along search branches and is great for topological sort and cycle detection.',
    'Models networks, maps, social connections, and dependency graphs.'
  ],
  limitations: [
    'Requires tracking visited sets to prevent infinite loops in cyclic graphs.',
    'Adjacency matrices consume O(V²) space for sparse graphs.'
  ],
  code: {
    java: `public class GraphBFS {
    public static void bfs(List<List<Integer>> adj, int start) {
        boolean[] visited = new boolean[adj.size()];
        Queue<Integer> q = new LinkedList<>();
        visited[start] = true;
        q.add(start);
        while (!q.isEmpty()) {
            int node = q.poll();
            System.out.print(node + " ");
            for (int neighbor : adj.get(node)) {
                if (!visited[neighbor]) {
                    visited[neighbor] = true;
                    q.add(neighbor);
                }
            }
        }
    }
}`,
    python: `from collections import deque

def bfs(adj, start):
    visited = set([start])
    q = deque([start])
    while q:
        node = q.popleft()
        for neighbor in adj[node]:
            if neighbor not in visited:
                visited.add(neighbor)
                q.append(neighbor)`,
    cpp: `void bfs(const vector<vector<int>>& adj, int start) {
    vector<bool> visited(adj.size(), false);
    queue<int> q;
    visited[start] = true;
    q.push(start);
    while (!q.empty()) {
        int u = q.front(); q.pop();
        for (int v : adj[u]) {
            if (!visited[v]) {
                visited[v] = true;
                q.push(v);
            }
        }
    }
}`,
    javascript: `function bfs(adj, start) {
    const visited = new Set([start]);
    const q = [start];
    while (q.length > 0) {
        const node = q.shift();
        for (const neighbor of adj[node]) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                q.push(neighbor);
            }
        }
    }
}`
  }
};

export function generateGraphSteps(numNodes = 5) {
  const count = Math.max(3, Math.min(5, Number(numNodes) || 5));
  const nodes = Array.from({ length: count }, (_, i) => i);

  const baseAdj = {
    0: [1, 2],
    1: [0, 3, 4],
    2: [0, 4],
    3: [1, 4],
    4: [1, 2, 3],
  };
  const adj = Object.fromEntries(nodes.map((node) => [
    node,
    (baseAdj[node] || []).filter((neighbor) => neighbor < count),
  ]));

  const steps = [];
  let stepNumber = 1;
  const bfsVisited = new Set();
  const dfsVisited = new Set();
  const bfsOrder = [];
  const dfsOrder = [];
  const queue = [];
  const stack = [];

  const createStep = ({
    lineNumber, eventType, variables = {}, activeIndex = null, pointers = {},
    explanation, aiHint, operation, traversal = 'BFS',
  }) => {
    const visited = traversal === 'DFS' ? dfsVisited : bfsVisited;
    const traversalOrder = traversal === 'DFS' ? dfsOrder : bfsOrder;
    const dsState = {
      type: 'graph',
      name: 'graph',
      values: [...nodes],
      nodes: [...nodes],
      edges: Object.entries(adj).flatMap(([from, neighbors]) =>
        neighbors.filter((to) => Number(from) < to).map((to) => ({ from: Number(from), to }))
      ),
      visited: Array.from(visited),
      bfsVisited: Array.from(bfsVisited),
      dfsVisited: Array.from(dfsVisited),
      bfsOrder: [...bfsOrder],
      dfsOrder: [...dfsOrder],
      queue: [...queue],
      stack: [...stack],
      activeIndex,
      traversal,
      pointers: { ...pointers, CURRENT: activeIndex, VISITED: Array.from(visited).join(', ') },
    };
    steps.push({
      stepNumber: stepNumber++, lineNumber, eventType,
      variables: { ...variables, visited: Array.from(visited), bfsOrder: [...bfsOrder], dfsOrder: [...dfsOrder], queue: [...queue], stack: [...stack], traversal },
      changedVariable: traversal === 'DFS' ? 'stack' : 'queue',
      previousValue: null, currentValue: [...traversalOrder],
      dataStructure: dsState, dataStructureState: dsState, output: [],
      metadata: { operation, traversal, pointers, bfsOrder: [...bfsOrder], dfsOrder: [...dfsOrder] },
      explanation, aiHint,
    });
  };

  // BFS: FIFO queue, level by level.
  bfsVisited.add(0);
  queue.push(0);
  createStep({ lineNumber: 2, eventType: AlgorithmEventType.START, variables: { startNode: 0 },
    activeIndex: 0, pointers: { CURRENT: 0 },
    explanation: 'BFS initialized at source vertex 0.',
    aiHint: 'BFS uses a FIFO queue and explores the graph level by level.',
    operation: 'BFS_INIT', traversal: 'BFS' });

  while (queue.length > 0) {
    const u = queue.shift();
    bfsOrder.push(u);
    createStep({ lineNumber: 5, eventType: AlgorithmEventType.TRAVERSE, variables: { currentNode: u },
      activeIndex: u, pointers: { CURRENT: u },
      explanation: `BFS dequeued vertex ${u} and is inspecting its neighbors.`,
      aiHint: `Current BFS order: [${bfsOrder.join(', ')}].`, operation: 'BFS_VISIT', traversal: 'BFS' });
    for (const v of adj[u] || []) {
      if (!bfsVisited.has(v)) {
        bfsVisited.add(v);
        queue.push(v);
        createStep({ lineNumber: 8, eventType: AlgorithmEventType.DISCOVER, variables: { from: u, discovered: v },
          activeIndex: v, pointers: { CURRENT: u, DISCOVERED: v },
          explanation: `BFS discovered vertex ${v} from ${u} and enqueued it.`,
          aiHint: `Queue: [${queue.join(', ')}].`, operation: 'BFS_ENQUEUE', traversal: 'BFS' });
      }
    }
  }
  createStep({ lineNumber: 12, eventType: AlgorithmEventType.SORTED, variables: { bfsOrder: [...bfsOrder] },
    activeIndex: bfsOrder[bfsOrder.length - 1] ?? 0, pointers: { ORDER: bfsOrder.join(' -> ') },
    explanation: `BFS complete. Traversal order: [${bfsOrder.join(', ')}].`,
    aiHint: 'All reachable vertices were explored using the queue.', operation: 'BFS_COMPLETE', traversal: 'BFS' });

  // DFS: LIFO stack, depth first.
  dfsVisited.add(0);
  stack.push(0);
  createStep({ lineNumber: 15, eventType: AlgorithmEventType.START, variables: { startNode: 0 },
    activeIndex: 0, pointers: { CURRENT: 0 },
    explanation: 'DFS initialized at source vertex 0.',
    aiHint: 'DFS uses a LIFO stack and follows one branch deeply before backtracking.',
    operation: 'DFS_INIT', traversal: 'DFS' });

  while (stack.length > 0) {
    const u = stack.pop();
    if (dfsOrder.includes(u)) continue;
    dfsOrder.push(u);
    createStep({ lineNumber: 18, eventType: AlgorithmEventType.TRAVERSE, variables: { currentNode: u },
      activeIndex: u, pointers: { CURRENT: u },
      explanation: `DFS visited vertex ${u} by taking the deepest available branch.`,
      aiHint: `Current DFS order: [${dfsOrder.join(', ')}].`, operation: 'DFS_VISIT', traversal: 'DFS' });
    for (const v of [...(adj[u] || [])].reverse()) {
      if (!dfsVisited.has(v)) {
        dfsVisited.add(v);
        stack.push(v);
        createStep({ lineNumber: 21, eventType: AlgorithmEventType.DISCOVER, variables: { from: u, discovered: v },
          activeIndex: v, pointers: { CURRENT: u, DISCOVERED: v },
          explanation: `DFS discovered vertex ${v} from ${u} and pushed it onto the stack.`,
          aiHint: `Stack: [${stack.join(', ')}].`, operation: 'DFS_PUSH', traversal: 'DFS' });
      }
    }
  }

  createStep({ lineNumber: 25, eventType: AlgorithmEventType.COMPLETE,
    variables: { totalNodes: nodes.length, bfsOrder: [...bfsOrder], dfsOrder: [...dfsOrder] },
    activeIndex: dfsOrder[dfsOrder.length - 1] ?? 0,
    pointers: { BFS_ORDER: bfsOrder.join(' -> '), DFS_ORDER: dfsOrder.join(' -> ') },
    explanation: `Graph traversal complete. BFS: [${bfsOrder.join(', ')}] | DFS: [${dfsOrder.join(', ')}].`,
    aiHint: 'Both BFS and DFS are available in the same interactive 3D graph trace.',
    operation: 'COMPLETE', traversal: 'DFS' });

  return {
    initialState: nodes, steps, finalState: [...dfsOrder], complexity: graphOpsDetails.complexity,
    details: graphOpsDetails, traversalResults: { bfs: [...bfsOrder], dfs: [...dfsOrder] },
  };
}
