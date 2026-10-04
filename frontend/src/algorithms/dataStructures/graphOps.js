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
  const count = Math.max(3, Math.min(6, numNodes || 5));
  const nodes = Array.from({ length: count }, (_, i) => i);
  // Default circular / star graph edges
  const adj = {
    0: [1, 2],
    1: [0, 3],
    2: [0, 4],
    3: [1, 4],
    4: [2, 3],
  };

  const steps = [];
  let stepNumber = 1;
  const visited = new Set();
  const queue = [0];
  visited.add(0);

  const createStep = ({
    lineNumber,
    eventType,
    variables,
    activeIndex = null,
    pointers = {},
    explanation,
    aiHint,
    operation,
  }) => {
    const dsState = {
      type: 'graph',
      name: 'graph',
      values: [...nodes],
      nodes: [...nodes],
      visited: Array.from(visited),
      queue: [...queue],
      activeIndex,
      pointers: { ...pointers, VISITED: Array.from(visited).join(', ') },
    };

    steps.push({
      stepNumber: stepNumber++,
      lineNumber,
      eventType,
      variables: { ...variables, visited: Array.from(visited), queue: [...queue] },
      changedVariable: 'graph',
      previousValue: null,
      currentValue: Array.from(visited),
      dataStructure: dsState,
      dataStructureState: dsState,
      output: [],
      metadata: { operation, pointers },
      explanation,
      aiHint,
    });
  };

  createStep({
    lineNumber: 2,
    eventType: AlgorithmEventType.START,
    variables: { startNode: 0 },
    activeIndex: 0,
    pointers: { CURRENT: 0 },
    explanation: 'Breadth-First Search (BFS) initialized at source vertex 0.',
    aiHint: 'Vertex 0 marked as visited and enqueued.',
    operation: 'INIT',
  });

  while (queue.length > 0) {
    const u = queue.shift();

    createStep({
      lineNumber: 5,
      eventType: AlgorithmEventType.TRAVERSE,
      variables: { currentNode: u },
      activeIndex: u,
      pointers: { CURRENT: u },
      explanation: `Dequeued vertex ${u}. Inspecting outgoing neighbor edges.`,
      aiHint: `Visiting all unvisited adjacent neighbors of vertex ${u}.`,
      operation: 'VISIT_VERTEX',
    });

    const neighbors = adj[u] || [];
    for (const v of neighbors) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);

        createStep({
          lineNumber: 8,
          eventType: AlgorithmEventType.DISCOVER,
          variables: { from: u, discovered: v },
          activeIndex: v,
          pointers: { CURRENT: u, DISCOVERED: v },
          explanation: `Discovered unvisited neighbor vertex ${v} from ${u}. Added to BFS queue.`,
          aiHint: `Queue now contains: [${queue.join(', ')}].`,
          operation: 'ENQUEUE_NEIGHBOR',
        });
      }
    }
  }

  createStep({
    lineNumber: 12,
    eventType: AlgorithmEventType.COMPLETE,
    variables: { totalVisited: visited.size },
    explanation: `BFS complete. All ${visited.size} connected vertices explored.`,
    aiHint: 'Radial 3D graph vertex network rendered.',
    operation: 'COMPLETE',
  });

  return {
    initialState: nodes,
    steps,
    finalState: Array.from(visited),
    complexity: graphOpsDetails.complexity,
    details: graphOpsDetails,
  };
}
