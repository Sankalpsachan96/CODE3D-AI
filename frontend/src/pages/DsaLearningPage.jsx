import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Brain, CheckCircle2, ChevronRight, Clock3, HardDrive, Layers3, Search, Sparkles, Target, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LEARNING_TOPICS = [
  {
    id: 'arrays',
    title: 'Arrays & Vectors',
    level: 'Basic → Intermediate → Advanced',
    summary: 'Contiguous indexed storage and the foundation for searching, sorting, prefix sums, sliding windows and two-pointer techniques.',
    types: ['Static Array', 'Dynamic Array / Vector', '2D Array', 'Multidimensional Array'],
    operations: [
      ['Access', 'O(1)', 'Direct indexing gives constant-time access.'],
      ['Search', 'O(n)', 'Unsorted linear search may inspect every element.'],
      ['Insert/Delete at end', 'Amortized O(1)', 'Dynamic arrays may occasionally resize and copy elements.'],
      ['Insert/Delete in middle', 'O(n)', 'Elements after the position may need to shift.'],
    ],
    memory: 'Elements are normally stored contiguously. For n elements of size s, the raw element storage is approximately n × s bytes; dynamic-array implementations may also reserve extra capacity.',
    advantages: ['O(1) random access', 'Excellent cache locality in typical implementations', 'Simple representation and iteration', 'Good base for many algorithmic techniques'],
    disadvantages: ['Middle insertion/deletion can be O(n)', 'Contiguous storage can require resizing', 'Fixed arrays have a fixed capacity'],
    uses: ['Tables and indexed collections', 'Buffers and matrices', 'Sorting/searching algorithms', 'Sliding window and two-pointer problems'],
    advanced: ['Amortized analysis of dynamic arrays', 'Cache locality and memory hierarchy', 'Prefix/difference arrays', 'Sparse representations when dense storage is wasteful'],
  },
  {
    id: 'sorting-searching',
    title: 'Sorting & Searching',
    level: 'Basic → Intermediate → Advanced',
    summary: 'Core techniques for ordering data and locating elements efficiently.',
    types: ['Linear Search', 'Binary Search', 'Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort', 'Heap Sort'],
    operations: [
      ['Linear Search', 'O(n)', 'Works without a sorted precondition.'],
      ['Binary Search', 'O(log n)', 'Repeatedly halves the search interval in sorted data.'],
      ['Merge Sort', 'O(n log n)', 'Divide, recursively sort, then merge.'],
      ['Quick Sort', 'Average O(n log n)', 'Partition around a pivot; worst case can be O(n).'],
    ],
    memory: 'Memory depends on the algorithm. In-place algorithms can use O(1) auxiliary storage, while Merge Sort commonly uses O(n) auxiliary space for arrays.',
    advantages: ['Makes later searching and processing easier', 'Many algorithms have strong asymptotic performance', 'Useful foundation for greedy, divide-and-conquer and data-processing tasks'],
    disadvantages: ['Some methods require extra memory', 'Performance can depend on input distribution and implementation', 'Sorting may be unnecessary if only one lookup is required'],
    uses: ['Databases and data processing', 'Searching and indexing', 'Ranking and analytics', 'Competitive programming and algorithm design'],
    advanced: ['Stable vs unstable sorting', 'In-place vs out-of-place algorithms', 'Adaptive sorting', 'Comparison lower bound of Ω(n log n) for general comparison sorting'],
  },
  {
    id: 'linked-lists',
    title: 'Linked Lists',
    level: 'Basic → Intermediate → Advanced',
    summary: 'Node-based linear structures where links connect elements instead of requiring contiguous storage.',
    types: ['Singly Linked List', 'Doubly Linked List', 'Circular Singly Linked List', 'Circular Doubly Linked List', 'Skip List'],
    operations: [
      ['Access by position', 'O(n)', 'Nodes must normally be followed sequentially.'],
      ['Insert after known node', 'O(1)', 'Only a constant number of links need changing.'],
      ['Delete known node', 'O(1)', 'With the required predecessor/reference already available.'],
      ['Search', 'O(n)', 'No direct random indexing.'],
    ],
    memory: 'Each node stores its data plus one or more pointer/reference fields. Therefore linked structures use extra per-node metadata and are usually non-contiguous in memory.',
    advantages: ['Flexible size', 'Efficient local insertion/deletion when references are available', 'Useful for structures built from dynamically connected nodes'],
    disadvantages: ['No O(1) random access', 'Extra pointer/reference memory', 'Typically poorer cache locality than contiguous arrays', 'Pointer bugs can cause difficult runtime errors'],
    uses: ['Stacks and queues', 'Adjacency lists', 'Memory-managed structures', 'LRU-style linked structures when combined with hashing'],
    advanced: ['Sentinel nodes', 'Cycle detection with fast/slow pointers', 'Skip lists and probabilistic balancing', 'Allocator and cache-locality trade-offs'],
  },
  {
    id: 'stacks-queues',
    title: 'Stacks & Queues',
    level: 'Basic → Intermediate → Advanced',
    summary: 'Linear access disciplines: LIFO for stacks and FIFO for queues.',
    types: ['Array Stack', 'Linked Stack', 'Circular Queue', 'Deque', 'Priority Queue', 'Monotonic Stack'],
    operations: [
      ['Stack push/pop', 'O(1) typical', 'Operate at the top.'],
      ['Queue enqueue/dequeue', 'O(1) typical', 'Efficient implementations maintain front/rear state.'],
      ['Deque end operations', 'O(1) typical', 'Supports insertion/removal at both ends.'],
      ['Priority Queue', 'O(log n) insert/extract', 'A heap is a common implementation.'],
    ],
    memory: 'Storage is O(n) for n active elements. An array-backed implementation may reserve capacity; linked implementations add node/reference overhead.',
    advantages: ['Simple and predictable access rules', 'Excellent for traversal and state management', 'Natural match for recursion, scheduling and buffering problems'],
    disadvantages: ['Restricted access compared with general collections', 'Overflow/underflow must be handled', 'Priority queues have different performance characteristics from simple queues'],
    uses: ['Function-call stacks', 'Undo/redo', 'BFS/DFS', 'Task scheduling', 'Expression parsing', 'Producer-consumer buffering'],
    advanced: ['Monotonic stacks/queues', 'Lock-free/concurrent queues', 'Call-stack memory and recursion depth', 'Heap-backed priority queues'],
  },
  {
    id: 'binary-trees',
    title: 'Binary Trees',
    level: 'Basic → Intermediate → Advanced',
    summary: 'Hierarchical structures where each node has at most two children.',
    types: ['Full Binary Tree', 'Complete Binary Tree', 'Perfect Binary Tree', 'Balanced Tree', 'Skewed / Degenerate Tree'],
    operations: [
      ['Traversal', 'O(n)', 'Preorder, inorder, postorder and level-order visit nodes.'],
      ['Height', 'O(n) worst-case to compute', 'Depends on the tree structure unless maintained.'],
      ['Search', 'O(n) general case', 'A plain binary tree has no ordering guarantee.'],
      ['Insert/Delete', 'Depends on representation/rules', 'Unlike BSTs, there is no universal ordered operation.'],
    ],
    memory: 'A node normally stores a value and up to two child references. For n nodes, structural storage is O(n), plus language/runtime object overhead where applicable.',
    advantages: ['Natural representation of hierarchy', 'Recursive algorithms map well to the structure', 'Foundation for BSTs, heaps, expression trees and many advanced structures'],
    disadvantages: ['Unbalanced trees can become deep', 'General binary trees do not provide ordered search', 'Pointer/reference overhead'],
    uses: ['Expression trees', 'Hierarchical data', 'Parsing', 'Decision structures', 'Foundation for search and priority structures'],
    advanced: ['Tree invariants', 'Euler tours', 'Lowest Common Ancestor', 'Tree DP and serialization'],
  },
  {
    id: 'bst',
    title: 'Binary Search Trees',
    level: 'Intermediate → Advanced',
    summary: 'A binary tree with an ordering invariant that enables ordered search, insertion and deletion.',
    types: ['Unbalanced BST', 'Balanced BST', 'AVL Tree', 'Red-Black Tree'],
    operations: [
      ['Search', 'Average O(log n), worst O(n)', 'Depends on tree height.'],
      ['Insert', 'Average O(log n), worst O(n)', 'Maintains the ordering invariant.'],
      ['Delete', 'Average O(log n), worst O(n)', 'Handles leaf, one-child and two-child cases.'],
      ['Inorder traversal', 'O(n)', 'Produces sorted order when the BST invariant holds.'],
    ],
    memory: 'A node stores a key/value and child references; balanced variants may store extra metadata such as height or color.',
    advantages: ['Ordered data access', 'Supports predecessor/successor concepts', 'Can provide logarithmic operations when balanced'],
    disadvantages: ['Plain BST can degrade to O(n)', 'Balancing adds implementation complexity', 'Pointer-based nodes have overhead'],
    uses: ['Ordered sets/maps', 'Symbol tables', 'Range and predecessor/successor queries', 'In-memory indexes'],
    advanced: ['AVL rotations', 'Red-Black invariants', 'Order-statistic trees', 'Augmented search trees'],
  },
  {
    id: 'heaps',
    title: 'Heaps & Priority Queues',
    level: 'Intermediate → Advanced',
    summary: 'Complete-tree-based structures optimized for repeatedly retrieving the minimum or maximum priority.',
    types: ['Min Heap', 'Max Heap', 'Binary Heap', 'd-ary Heap', 'Priority Queue'],
    operations: [
      ['Peek min/max', 'O(1)', 'Root stores the highest-priority element.'],
      ['Insert', 'O(log n)', 'Bubble/sift the new element upward.'],
      ['Extract min/max', 'O(log n)', 'Replace the root and restore the heap property.'],
      ['Build Heap', 'O(n)', 'Bottom-up heap construction is linear.'],
    ],
    memory: 'A binary heap is commonly stored in a contiguous array. For zero-based indexing, children are at 2i+1 and 2i+2, avoiding explicit child pointers.',
    advantages: ['Fast priority access', 'Array representation is memory efficient', 'Strong fit for scheduling and graph algorithms'],
    disadvantages: ['Does not provide fully sorted access', 'Searching for an arbitrary value is generally O(n)', 'More complex than a simple array for basic storage'],
    uses: ['Priority queues', 'Dijkstra/Prim', 'Heap Sort', 'Scheduling', 'Top-k problems'],
    advanced: ['d-ary heaps', 'Binomial/Fibonacci heaps', 'Decrease-key', 'Amortized analysis'],
  },
  {
    id: 'graphs',
    title: 'Graphs',
    level: 'Advanced',
    summary: 'A general model of relationships using vertices and edges.',
    types: ['Directed', 'Undirected', 'Weighted', 'Unweighted', 'DAG', 'Bipartite', 'Complete', 'Connected'],
    operations: [
      ['BFS/DFS', 'O(V + E)', 'With adjacency-list representation, each vertex and edge is processed a bounded number of times.'],
      ['Add/check edge', 'Depends on representation', 'Matrix gives O(1) adjacency checks; lists trade that for lower sparse-memory usage.'],
      ['Dijkstra', 'Depends on priority queue', 'Common binary-heap implementation is O((V+E) log V).'],
      ['Topological Sort', 'O(V + E)', 'Applies to directed acyclic graphs.'],
    ],
    memory: 'Adjacency matrices use O(V²) space. Adjacency lists use O(V + E), which is usually preferable for sparse graphs.',
    advantages: ['Models real relationships naturally', 'Supports powerful traversal and optimization algorithms', 'Flexible enough for networks, dependencies and state spaces'],
    disadvantages: ['Algorithms can become complex', 'Dense graphs can consume large memory', 'Choosing the wrong representation can hurt performance'],
    uses: ['Computer networks', 'Maps and navigation', 'Social networks', 'Dependency resolution', 'Compilers and build systems'],
    advanced: ['Strongly connected components', 'Minimum spanning trees', 'Max flow/min cut', 'Shortest paths', 'Graph coloring and complexity theory'],
  },
  {
    id: 'dynamic-programming',
    title: 'Dynamic Programming',
    level: 'Advanced',
    summary: 'A problem-solving paradigm that exploits overlapping subproblems and optimal substructure.',
    types: ['Top-down Memoization', 'Bottom-up Tabulation', 'Space-Optimized DP', '1D DP', '2D DP', 'Bitmask DP', 'Tree DP'],
    operations: [
      ['State design', 'Problem dependent', 'Define the smallest information needed to represent a subproblem.'],
      ['Transition', 'Problem dependent', 'Relate the current state to previously solved states.'],
      ['Memoized recurrence', 'Often O(number of states × transition cost)', 'Avoids recomputing the same subproblem.'],
      ['Tabulation', 'Often same asymptotic time', 'Fills states in a dependency-safe order.'],
    ],
    memory: 'A DP table usually consumes O(number of states). Space can often be reduced when each state depends only on a small previous window of states.',
    advantages: ['Turns many exponential recurrences into polynomial-time solutions', 'Systematic way to exploit repeated subproblems', 'Useful across sequences, grids, optimization and combinatorics'],
    disadvantages: ['State design can be difficult', 'Tables can consume significant memory', 'Not every recurrence has useful overlapping subproblems'],
    uses: ['Knapsack', 'LCS/LIS', 'Scheduling', 'Path optimization', 'String algorithms', 'Resource allocation'],
    advanced: ['State compression', 'Bitmask DP', 'DP optimization techniques', 'Tree/DAG DP', 'Optimal substructure proofs'],
  },
  {
    id: 'trie',
    title: 'Trie & String Algorithms',
    level: 'Intermediate → Advanced',
    summary: 'Prefix-oriented structures and algorithms for efficient dictionary, autocomplete and pattern operations.',
    types: ['Standard Trie', 'Compressed Trie / Radix Tree', 'Ternary Search Tree', 'Prefix Hashing'],
    operations: [
      ['Insert word', 'O(L)', 'L is the word length.'],
      ['Search word', 'O(L)', 'Follow one edge per character.'],
      ['Prefix query', 'O(P + output)', 'P is prefix length, plus reported results.'],
      ['Delete word', 'O(L)', 'May require cleanup of unused nodes.'],
    ],
    memory: 'A trie can use many node references. Its memory is related to the total number of stored character paths and alphabet representation; compressed variants reduce redundant paths.',
    advantages: ['Excellent prefix queries', 'Predictable operation cost by key length', 'Natural for autocomplete and dictionary problems'],
    disadvantages: ['Can use much more memory than hashing for some datasets', 'Alphabet representation affects memory', 'More complex node management'],
    uses: ['Autocomplete', 'Spell checking', 'Dictionary lookup', 'Prefix search', 'Routing/prefix matching'],
    advanced: ['Radix trees', 'Aho–Corasick', 'Suffix structures', 'Compressed representations'],
  },
];


const TOPIC_DEEP = {
  arrays: {
    concept: 'An array stores elements in indexed positions, usually next to each other in memory. That is why arr[i] is fast: the address can be calculated directly from the base address and index.',
    hinglish: 'Simple words me: array ek line me boxes jaisa hota hai. Har box ka index hota hai, isliye kisi bhi index par seedha jump kar sakte ho. Beech me insert karoge to baaki elements ko shift karna pad sakta hai.',
    why: 'Arrays are the first choice when you need fast indexing, predictable memory layout, and repeated sequential processing.',
    working: ['Index calculation gives direct access: base + index × element-size.', 'Dynamic vectors keep a size and capacity; when capacity is exhausted, a larger block is allocated and elements are copied.', 'Two-pointer and sliding-window techniques exploit the ordered, contiguous sequence.'],
    example: 'For [10, 20, 30, 40], arr[2] directly gives 30. To insert 25 at index 2, 30 and 40 may need to shift right.',
    dryRun: ['Start: [10, 20, 30, 40]', 'Insert 25 at index 2', 'Shift 40 → right, then 30 → right', 'Place 25 → [10, 20, 25, 30, 40]'],
    code: 'int a[] = {10, 20, 30, 40};\ncout << a[2]; // 30',
    mistakes: ['Off-by-one index errors', 'Accessing outside bounds', 'Assuming middle insertion is O(1)', 'Ignoring vector capacity/reallocation'],
    interview: ['Why is array access O(1)?', 'Array vs linked list?', 'Why is vector push_back amortized O(1)?', 'How do prefix sums reduce repeated range-sum work?'],
    when: 'Use for indexing, scanning, sorting, prefix sums, windows and two-pointer problems.',
    avoid: 'Avoid when frequent middle insertion/deletion is the dominant operation.'
  },
  'sorting-searching': {
    concept: 'Searching finds a target; sorting rearranges data into an order that can make later operations faster. Binary search is powerful because sorted data lets us discard half the remaining range each step.',
    hinglish: 'Linear search me ek-ek karke check karte ho. Binary search me sorted array ke middle ko check karke half data hata dete ho. Sorting ka goal sirf order banana nahi, future operations ko efficient banana bhi hai.',
    why: 'Ordering data often converts repeated linear work into logarithmic or structured processing.',
    working: ['Binary search maintains a valid search interval [low, high].', 'Merge sort divides, solves both halves, then merges in linear time.', 'Quick sort partitions around a pivot and recursively processes both sides.', 'Stable sorting preserves the relative order of equal keys.'],
    example: 'Search 42 in [10,20,30,40,42,50,60]: check 40, then the right half, then 50, then 42.',
    dryRun: ['low=0, high=6, mid=3 → 40', '42 > 40 → low=4', 'mid=5 → 50', '42 < 50 → high=4', 'mid=4 → found 42'],
    code: 'int l=0,r=n-1;\nwhile(l<=r){ int m=l+(r-l)/2; if(a[m]==x) return m; if(a[m]<x) l=m+1; else r=m-1; }',
    mistakes: ['Using binary search on unsorted data', 'Overflow-prone midpoint (l+r)/2', 'Wrong loop boundary', 'Ignoring worst-case quicksort behavior'],
    interview: ['Why O(log n) for binary search?', 'Merge sort vs quicksort?', 'What makes a sort stable?', 'When is sorting unnecessary?'],
    when: 'Use binary search for monotonic/sorted search spaces and sorting when order enables simpler or faster downstream logic.',
    avoid: 'Do not sort just to perform one lookup when a linear scan is cheaper overall.'
  },
  'linked-lists': {
    concept: 'A linked list stores nodes connected by references. The list is about relationships between nodes, not contiguous memory positions.',
    hinglish: 'Linked list ko train ke coaches ki tarah samjho. Har node ko next coach ka address pata hota hai. Isliye beech ka node insert karna easy hai agar correct position ka reference already mil gaya ho, lekin index 500 tak pahunchne ke liye nodes follow karne padenge.',
    why: 'It is useful when structure size changes frequently and local link updates matter more than random access.',
    working: ['Each node stores data plus next/previous references.', 'Insertion changes a constant number of links when the location is known.', 'Traversal follows references one by one.', 'Fast/slow pointers can detect cycles or find a middle node.'],
    example: 'A → B → C. Insert X after B: B.next = X and X.next = C.',
    dryRun: ['slow=A, fast=A', 'slow=B, fast=C', 'slow=C, fast=null → middle found', 'For cycle detection, slow moves 1 step and fast 2 steps; meeting implies a cycle.'],
    code: 'Node* x = new Node(25);\nx->next = cur->next;\ncur->next = x;',
    mistakes: ['Losing the next pointer before reconnecting', 'Null-pointer dereference', 'Forgetting to update head/tail', 'Confusing node reference with index'],
    interview: ['Reverse a linked list', 'Detect a cycle', 'Find middle node', 'Merge two sorted lists'],
    when: 'Use when frequent local insertion/deletion or node-based relationships are important.',
    avoid: 'Avoid when random indexing and cache-friendly traversal are more important.'
  },
  'stacks-queues': {
    concept: 'A stack exposes the newest item first (LIFO), while a queue exposes the oldest item first (FIFO). These access rules simplify many state-management problems.',
    hinglish: 'Stack ko plates ka stack samjho: last plate pehle niklegi. Queue ko ticket line samjho: jo pehle aaya woh pehle niklega.',
    why: 'The restricted access pattern is exactly what many algorithms need: nested work, BFS layers, undo history, scheduling and parsing.',
    working: ['Stack maintains a top pointer/index.', 'Queue maintains front and rear; circular arrays avoid repeated shifting.', 'Deque supports both ends.', 'Priority queues choose by priority rather than arrival order.'],
    example: 'Push 10,20,30 → pop gives 30, then 20. Enqueue A,B,C → dequeue gives A.',
    dryRun: ['Stack: [] → push A → [A] → push B → [A,B] → pop → [A]', 'Queue: [] → A,B,C → dequeue A → remaining B,C'],
    code: 'stack<int> st; st.push(10); st.push(20); st.pop();\nqueue<int> q; q.push(10); q.push(20); q.pop();',
    mistakes: ['Pop/dequeue on empty structure', 'Implementing queue with O(n) shifting unnecessarily', 'Mixing LIFO and FIFO semantics'],
    interview: ['Balanced parentheses', 'Next greater element', 'Implement queue using stacks', 'BFS using a queue'],
    when: 'Use stack for nested/reverse processing; queue for level-order and arrival-order processing.',
    avoid: 'Do not use them when arbitrary random access is the main requirement.'
  },
  'binary-trees': {
    concept: 'A binary tree is a hierarchy where each node has at most two children. Its power comes from recursive structure: every subtree is itself a smaller tree.',
    hinglish: 'Tree ko family hierarchy jaisa samjho. Har node ke maximum do children hain. Root se neeche levels bante hain, aur recursion naturally fit hoti hai.',
    why: 'Trees represent hierarchy and allow divide-and-conquer reasoning over subtrees.',
    working: ['Preorder: root → left → right.', 'Inorder: left → root → right.', 'Postorder: left → right → root.', 'Level-order uses a queue and visits one depth at a time.'],
    example: 'For root 1 with children 2 and 3, preorder is 1,2,3; inorder is 2,1,3; postorder is 2,3,1.',
    dryRun: ['Visit root', 'Recursively process left subtree', 'Return to root/right according to traversal', 'Continue until every node is visited once'],
    code: 'void inorder(Node* r){ if(!r) return; inorder(r->left); cout<<r->val; inorder(r->right); }',
    mistakes: ['Forgetting the null base case', 'Confusing traversal orders', 'Assuming every binary tree is a BST', 'Ignoring skewed-tree height'],
    interview: ['Height of tree', 'Level-order traversal', 'Diameter', 'Lowest common ancestor'],
    when: 'Use for hierarchical data, recursive decomposition, expression trees and tree-based algorithms.',
    avoid: 'A plain binary tree is not automatically good for searching; use an ordered/balanced structure when that invariant is required.'
  },
  bst: {
    concept: 'A BST adds an ordering invariant: keys in the left subtree are smaller and keys in the right subtree are larger (under the chosen duplicate policy).',
    hinglish: 'BST me tree ke andar order maintained hota hai. Current node se chhota left, bada right. Isi rule ki wajah se search me har step par ek side discard kar sakte ho—agar tree balanced ho.',
    why: 'The ordering invariant turns a general tree into a searchable ordered structure.',
    working: ['Compare target with current node.', 'Smaller → left; larger → right; equal → found.', 'Insertion follows the same path.', 'Deletion handles leaf, one-child and two-child cases.'],
    example: 'Insert 8,3,10,1,6. Search 6: 6<8 → left; 6>3 → right; found.',
    dryRun: ['Root 8', '6 < 8 → node 3', '6 > 3 → node 6', '6 == 6 → found'],
    code: 'bool search(Node* r,int x){ if(!r) return false; if(r->val==x) return true; return x<r->val ? search(r->left,x) : search(r->right,x); }',
    mistakes: ['Assuming every BST is balanced', 'Breaking the ordering invariant during deletion', 'Ignoring duplicate-key policy'],
    interview: ['Validate a BST', 'Kth smallest', 'Lowest common ancestor', 'AVL vs Red-Black tree'],
    when: 'Use for ordered search, predecessor/successor and range-style queries when a suitable balanced implementation is available.',
    avoid: 'Avoid plain BST for adversarial sorted input if guaranteed logarithmic height is required.'
  },
  heaps: {
    concept: 'A heap is a complete binary tree with a priority property. In a min-heap the parent is ≤ children; in a max-heap the parent is ≥ children.',
    hinglish: 'Heap ko priority line samjho jahan sabse important item root par milta hai. Ye fully sorted structure nahi hai; bas parent-child priority relation guarantee hota hai.',
    why: 'It gives constant-time access to the highest-priority item while keeping insertion/extraction logarithmic.',
    working: ['Array stores the complete tree compactly.', 'Insert appends at the end and bubbles upward.', 'Extract replaces root with last element and sifts downward.', 'Bottom-up heapify builds a heap in O(n), not O(n log n).'],
    example: 'Min-heap [2,5,7,9] always exposes 2. Insert 1 → place at end, then swap upward until heap property returns.',
    dryRun: ['Heap: [2,5,7,9]', 'Insert 1 → [2,5,7,9,1]', 'Compare 1 with parent 5 → swap', 'Compare with parent 2 → swap → [1,2,7,9,5]'],
    code: 'priority_queue<int, vector<int>, greater<int>> pq;\npq.push(5); pq.push(2); cout << pq.top(); // 2',
    mistakes: ['Thinking heap is completely sorted', 'Wrong child indices', 'Confusing heap size with array capacity', 'Claiming heapify is O(n log n)'],
    interview: ['Kth largest/smallest', 'Top K elements', 'Merge K sorted lists', 'Dijkstra priority queue'],
    when: 'Use whenever repeated min/max or priority extraction is required.',
    avoid: 'Avoid when you need fast arbitrary search or fully sorted iteration.'
  },
  graphs: {
    concept: 'A graph models relationships as vertices and edges. Unlike trees, graphs may contain cycles, multiple paths and disconnected components.',
    hinglish: 'Graph ko cities aur roads jaisa samjho. City = vertex, road = edge. Road one-way ho sakti hai (directed), distance/cost ho sakta hai (weighted), aur cycles bhi ho sakte hain.',
    why: 'Many real systems are relationship networks rather than simple hierarchies.',
    working: ['Choose adjacency list for sparse graphs and matrix for dense/constant-time edge checks.', 'BFS explores layer by layer.', 'DFS explores deeply before backtracking.', 'Shortest-path/MST algorithms add problem-specific constraints.'],
    example: 'A-B, A-C, B-D. BFS from A visits A, then B/C, then D.',
    dryRun: ['Queue starts [A]', 'Pop A → add B,C', 'Pop B → add D', 'Pop C → nothing new', 'Pop D → done'],
    code: 'queue<int> q; q.push(src); vis[src]=1;\nwhile(!q.empty()){ int u=q.front(); q.pop(); for(int v: adj[u]) if(!vis[v]) vis[v]=1,q.push(v); }',
    mistakes: ['Forgetting visited array', 'Using Dijkstra with negative edges', 'Using topological sort on cyclic graphs', 'Choosing matrix for a huge sparse graph'],
    interview: ['BFS/DFS', 'Cycle detection', 'Shortest path', 'MST', 'Topological sorting', 'SCC'],
    when: 'Use for networks, dependencies, paths, connectivity and relationship problems.',
    avoid: 'Do not force graph algorithms when the input is naturally a simple sequence or hierarchy.'
  },
  'dynamic-programming': {
    concept: 'DP stores answers to overlapping subproblems so the same work is not repeated. A good DP solution needs a state, transition, base case and evaluation order.',
    hinglish: 'DP ka core idea hai: jo subproblem ek baar solve ho chuka hai uska answer save kar lo. Phir same calculation baar-baar mat karo. Sabse important skill state define karna hai.',
    why: 'It can turn exponential recursive exploration into manageable polynomial or pseudo-polynomial work when overlapping subproblems exist.',
    working: ['Define state: what does dp[i] or dp[i][j] mean?', 'Define transition: how does the current answer depend on smaller states?', 'Set base cases.', 'Choose memoization or a dependency-safe tabulation order.'],
    example: 'Fibonacci: naive recursion repeats F(3), F(2), etc. dp[i]=dp[i-1]+dp[i-2] computes each once.',
    dryRun: ['dp[0]=0, dp[1]=1', 'dp[2]=1', 'dp[3]=2', 'dp[4]=3', 'dp[5]=5'],
    code: 'vector<int> dp(n+1); dp[0]=0; dp[1]=1;\nfor(int i=2;i<=n;i++) dp[i]=dp[i-1]+dp[i-2];',
    mistakes: ['Starting coding before defining state', 'Wrong base cases', 'Using too many dimensions', 'Confusing greedy choice with DP'],
    interview: ['0/1 Knapsack', 'LCS', 'LIS', 'Coin Change', 'Grid DP', 'Partition DP'],
    when: 'Use when subproblems overlap and an optimal/complete answer can be composed from smaller states.',
    avoid: 'Avoid when subproblems do not overlap or a simpler greedy/math solution is provably sufficient.'
  },
  trie: {
    concept: 'A trie represents strings character-by-character along paths. A node can represent a prefix, making prefix queries natural.',
    hinglish: 'Trie ko words ke common prefix ka tree samjho. “car”, “card”, “care” me “car” ka path common rahega. Isliye autocomplete aur prefix search ke liye useful hai.',
    why: 'It makes work depend primarily on key length rather than the number of stored keys for basic lookup.',
    working: ['Start at root.', 'For each character, follow/create its child.', 'Mark terminal nodes for complete words.', 'For prefix queries, stop at the prefix node and explore its descendants.'],
    example: 'Insert “cat” and “car”: c → a is shared, then branches to t and r.',
    dryRun: ['Insert cat: c → a → t', 'Insert car: c → a already exists → r', 'Prefix “ca” reaches the shared node', 'DFS below it can report cat and car'],
    code: 'struct Node{ Node* next[26]{}; bool end=false; };\n// follow one child per character',
    mistakes: ['Not marking word termination', 'Memory blow-up with large alphabets', 'Deleting shared prefix nodes incorrectly'],
    interview: ['Implement trie', 'Autocomplete', 'Word dictionary with wildcard', 'Aho–Corasick basics'],
    when: 'Use for prefix-heavy string workloads, autocomplete and dictionary-style queries.',
    avoid: 'Avoid a full trie when memory is tight and hashing/string maps are enough.'
  }
};


const VARIANT_DETAILS = {
  'Static Array': ['Fixed-size contiguous collection. Size is decided when the array is created.','Simple aur fast hota hai, lekin size fixed hota hai; random access O(1) milta hai.','Best for: fixed-size data, tables, small buffers.'],
  'Dynamic Array / Vector': ['Resizable array that grows when capacity is exhausted.','Vector ko flexible array samjho: end par add karna usually fast hota hai, aur zarurat par capacity badh sakti hai.','Best for: collections whose size changes during execution.'],
  '2D Array': ['An array arranged as rows and columns.','Matrix/table jaisa structure: a[i][j] se row i aur column j ka element access karte hain.','Best for: grids, matrices, DP tables.'],
  'Multidimensional Array': ['An array with three or more dimensions.','2D se aage multiple indexes hote hain, jaise a[x][y][z]; useful but memory layout ko samajhna important hai.','Best for: 3D grids, tensors and state spaces.'],
  'Singly Linked List': ['Each node stores data and one next reference.','Har node ko sirf next node ka address pata hota hai; forward traversal simple hai.','Best for: simple dynamic chains and stack-like structures.'],
  'Doubly Linked List': ['Each node stores next and previous references.','Aage aur peeche dono direction me move kar sakte ho, lekin extra pointer memory lagti hai.','Best for: browser history, deques, LRU-style structures.'],
  'Circular Singly Linked List': ['The last node points back to the first node.','Last ke baad list khatam nahi hoti; wapas first node par aa jate ho.','Best for: round-robin scheduling and cyclic processing.'],
  'Circular Doubly Linked List': ['A doubly linked list whose ends connect in both directions.','Last next se first aur first previous se last milta hai, isliye cyclic traversal dono directions me possible hai.','Best for: playlists, circular deques and navigation.'],
  'Skip List': ['A probabilistic linked structure with multiple levels of forward links.','Extra shortcut links ki wajah se average search O(log n) ho sakta hai, while structure remains simpler than many balanced trees.','Best for: ordered sets/maps where probabilistic balancing is acceptable.'],
  'Linear Search': ['Checks elements one by one until the target is found or the collection ends.','Simple hai aur sorted data ki requirement nahi hoti, but worst case me poora array dekhna pad sakta hai.','Best for: small or unsorted collections.'],
  'Binary Search': ['Repeatedly halves a sorted or monotonic search space.','Har comparison ke baad roughly aadha search space remove ho jata hai.','Best for: sorted arrays and monotonic answer spaces.'],
  'Bubble Sort': ['Repeatedly swaps adjacent out-of-order elements.','Har pass me bade elements end ki taraf bubble hote hain; learning ke liye useful, practical large data ke liye usually slow.','Best for: teaching and tiny inputs.'],
  'Selection Sort': ['Repeatedly selects the smallest remaining element and places it in position.','Har position ke liye minimum element find karke swap karte hain; swaps kam ho sakte hain, comparisons O(n²) hain.','Best for: simple in-place sorting on very small data.'],
  'Insertion Sort': ['Builds a sorted prefix by inserting each new element into its correct position.','Cards arrange karne jaisa: next element ko sorted left part me correct jagah insert karte ho.','Best for: small or nearly sorted data.'],
  'Merge Sort': ['Divide-and-conquer sort that recursively splits and then merges sorted halves.','Array ko halves me todkar sort karo aur merge karo; predictable O(n log n) time milta hai.','Best for: stable sorting and predictable performance.'],
  'Quick Sort': ['Partitions data around a pivot and recursively sorts the partitions.','Pivot choose karke smaller/bigger elements ko sides me rakhte hain; average fast, but bad pivot choices can cause O(n²).','Best for: fast general-purpose in-memory sorting with a good implementation.'],
  'Heap Sort': ['Uses a heap to repeatedly extract the next largest/smallest element.','Heap property se max/min efficiently milta hai; O(n log n) worst-case time aur in-place behavior possible hai.','Best for: guaranteed O(n log n) comparison sorting with low extra space.'],
  'Stack': ['LIFO structure: last inserted item is removed first.','Plates ke stack jaisa: jo last me rakha, woh pehle niklega.','Best for: recursion-like processing, undo, parsing and DFS.'],
  'Array Stack': ['Stack implemented using an array or vector.','Top ko index se maintain karte hain; cache-friendly aur simple implementation.','Best for: fast stack operations with contiguous storage.'],
  'Linked Stack': ['Stack implemented using linked nodes.','Top node par push/pop karte hain; fixed capacity ki problem nahi hoti, but pointer overhead hota hai.','Best for: dynamically growing stacks.'],
  'Circular Queue': ['Queue stored in a circular array so freed front positions can be reused.','Rear end par pahunchne ke baad index wapas beginning par aa sakta hai.','Best for: fixed-size buffers and streaming systems.'],
  'Deque': ['Double-ended queue supporting insertion and deletion at both ends.','Front aur rear dono taraf se push/pop kar sakte ho.','Best for: sliding windows, task scheduling and bidirectional processing.'],
  'Priority Queue': ['Returns the element with highest priority rather than oldest arrival.','Normal queue me first-in-first-out hota hai; priority queue me important item pehle nikalta hai.','Best for: scheduling, shortest paths and top-k problems.'],
  'Monotonic Stack': ['A stack maintained in increasing or decreasing order.','Stack ko sorted-like invariant me rakhkar next greater/smaller type problems efficiently solve karte hain.','Best for: next greater element, histogram and contribution problems.'],
  'Full Binary Tree': ['Every node has either zero or exactly two children.','Kisi node ka sirf ek child nahi hota; ya leaf hoga ya two children honge.','Best for: structures where strict branching is useful.'],
  'Complete Binary Tree': ['Every level is full except possibly the last, which is filled left to right.','Last level ko left se fill kiya jata hai; isi property ki wajah se binary heap array me efficiently store hota hai.','Best for: heaps and compact tree storage.'],
  'Perfect Binary Tree': ['All internal nodes have two children and all leaves are at the same depth.','Har level completely full hota hai. n nodes ke liye height tightly determined hoti hai.','Best for: theoretical analysis and ideal hierarchical structures.'],
  'Balanced Tree': ['A tree whose height is kept close to logarithmic relative to its size.','Goal ye hai ki tree ek side bahut lamba na ho, taaki operations fast rahen.','Best for: guaranteed or near-guaranteed efficient searching.'],
  'Skewed / Degenerate Tree': ['A tree where nodes mostly have only one child, making it chain-like.','Tree dekhne me linked list jaisa ban jata hai aur height O(n) ho sakti hai.','Best for: understanding worst-case tree behavior, not usually for performance.'],
  'Unbalanced BST': ['A BST without a balancing guarantee.','Sorted input jaise cases me tree ek side lean kar sakta hai aur search O(n) tak degrade ho sakta hai.','Best for: simple ordered data when worst-case balance is not critical.'],
  'Balanced BST': ['A BST designed to keep height small.','Ordering ke saath height bhi control ki jati hai, isliye search/insert/delete logarithmic ke close rehte hain.','Best for: ordered sets and maps needing reliable performance.'],
  'AVL Tree': ['A self-balancing BST that keeps subtree height differences within a strict bound.','Har insertion/deletion ke baad rotations se balance restore hota hai.','Best for: lookup-heavy workloads where strict height balance helps.'],
  'Red-Black Tree': ['A self-balancing BST using color invariants to control height.','Nodes ko red/black rules ke saath maintain karke rotations aur recoloring se balance rakha jata hai.','Best for: general-purpose ordered maps/sets.'],
  'Min Heap': ['Complete binary tree where every parent is less than or equal to its children.','Root par smallest priority element milta hai.','Best for: minimum extraction and shortest-path style workloads.'],
  'Max Heap': ['Complete binary tree where every parent is greater than or equal to its children.','Root par largest element milta hai.','Best for: maximum extraction and top-k largest problems.'],
  'Binary Heap': ['Heap with at most two children per node, commonly stored in an array.','2 children hone ki wajah se parent/child indexes simple formulas se milte hain.','Best for: standard priority queues.'],
  'd-ary Heap': ['Heap where each node can have d children.','Binary heap ke 2 children ki jagah d children hote hain; branching badhne se height kam hoti hai but per-level comparisons badhte hain.','Best for: workloads where fewer levels can improve cache or priority-queue behavior.'],
  'Directed': ['Edges have a direction from one vertex to another.','A → B ka matlab B → A automatically nahi hota.','Best for: dependencies, workflows and one-way relationships.'],
  'Undirected': ['Edges represent a two-way relationship.','A—B ka relation dono directions me considered hota hai.','Best for: mutual connections and many physical networks.'],
  'Weighted': ['Edges carry a numeric cost, distance or weight.','Har connection ke saath cost/distance hoti hai, jise shortest-path ya optimization algorithms use karte hain.','Best for: roads, costs, distances and resource networks.'],
  'Unweighted': ['Edges have no explicit cost; often every edge is treated equally.','Har step ki cost same maan sakte ho, isliye BFS shortest path de sakta hai in suitable graphs.','Best for: minimum-edge-count paths and simple connectivity.'],
  'DAG': ['Directed Acyclic Graph: directed graph with no directed cycle.','Isme direction follow karke wapas same node par cycle nahi ban sakti; topological ordering possible hoti hai.','Best for: dependencies, scheduling and build systems.'],
  'Bipartite': ['Vertices can be divided into two sets so every edge connects different sets.','Ek group ke nodes doosre group se connect hote hain; same group ke andar edge nahi hoti.','Best for: matching and two-group relationship problems.'],
  'Complete': ['Every pair of distinct vertices has an edge in the graph.','Har node ka har doosre node se connection hota hai, isliye edges ki count bahut high hoti hai.','Best for: theoretical graph analysis and dense relationship models.'],
  'Connected': ['In an undirected graph, every vertex is reachable from every other vertex.','Kisi bhi node se kisi bhi doosre node tak path mil jata hai.','Best for: connectivity and network reachability analysis.'],
  'Top-down Memoization': ['Recursive DP that caches answers of solved states.','Recursion se natural solution likho, aur jo state solve ho gayi uska answer save kar do.','Best for: sparse state spaces and naturally recursive problems.'],
  'Bottom-up Tabulation': ['Iterative DP that fills states from base cases toward the final answer.','Base se start karke table fill karte hain; recursion stack ki zarurat nahi hoti.','Best for: predictable state order and iterative implementations.'],
  'Space-Optimized DP': ['DP that keeps only the states currently needed.','Agar current answer ko sirf previous row/few states chahiye, to poori table store karne ki zarurat nahi.','Best for: reducing memory from O(states) when dependencies allow it.'],
  '1D DP': ['DP represented by one index.','dp[i] ek dimension ki state ko represent karta hai, jaise Fibonacci ya climbing stairs.','Best for: sequence and one-parameter state problems.'],
  '2D DP': ['DP represented by two state dimensions.','dp[i][j] jaise states do changing parameters capture karte hain, e.g. LCS or grid problems.','Best for: grids, two strings and two-parameter optimization.'],
  'Bitmask DP': ['DP that uses bits to represent subsets or selected items.','Ek integer ke bits se selected/not-selected elements represent karte hain; subset state compact ho jata hai.','Best for: small-n subset and assignment problems.'],
  'Tree DP': ['DP performed over tree nodes and their subtrees.','Har node ka answer uske children/subtrees ke answers se build karte hain.','Best for: tree optimization, independent sets and path problems.'],
  'Standard Trie': ['Character-by-character prefix tree for strings.','Common prefixes share the same path, so prefix search natural aur fast hota hai.','Best for: dictionaries and autocomplete.'],
  'Compressed Trie / Radix Tree': ['Trie variant that compresses chains with single children into longer edge labels.','Unnecessary one-child nodes hata kar memory aur traversal overhead reduce kiya ja sakta hai.','Best for: large string sets where memory matters.'],
  'Ternary Search Tree': ['String structure where each node stores a character and has lower, equal and higher links.','Trie aur BST ke ideas combine karta hai; alphabet-wide child array ki memory bach sakti hai.','Best for: dictionary/prefix workloads with memory constraints.'],
  'Prefix Hashing': ['Uses hashes of prefixes to compare or query strings efficiently.','Prefix information ko numeric hash me represent karke substring/prefix comparisons fast kiye ja sakte hain, with collision considerations.','Best for: string matching and fast equality checks.']
};

function TopicCard({ topic, onOpen, isBright }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(topic)}
      className={`text-left p-5 rounded-2xl border transition-all hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-lg cursor-pointer ${
        isBright ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Layers3 size={20} />
        </div>
        <ChevronRight size={17} className="text-slate-500 mt-1" />
      </div>
      <h3 className={`mt-4 text-base font-bold ${isBright ? 'text-slate-900' : 'text-white'}`}>{topic.title}</h3>
      <p className="mt-2 text-xs leading-relaxed text-slate-400">{topic.summary}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {topic.types.slice(0, 4).map((type) => (
          <span key={type} className="px-2 py-1 rounded-md text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/15">{type}</span>
        ))}
      </div>
    </button>
  );
}

function DetailSection({ title, icon, children, isBright }) {
  return (
    <section className={`rounded-2xl border p-5 ${isBright ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-cyan-400">{icon}</span>
        <h2 className={`text-sm font-bold uppercase tracking-wider ${isBright ? 'text-slate-800' : 'text-slate-100'}`}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export default function DsaLearningPage() {
  const { isBright } = useTheme();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LEARNING_TOPICS;
    return LEARNING_TOPICS.filter((topic) =>
      [topic.title, topic.summary, ...topic.types, ...topic.uses, ...topic.advanced, ...(TOPIC_DEEP[topic.id] ? Object.values(TOPIC_DEEP[topic.id]).flat() : [])]
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [query]);

  if (selected) {
    return (
      <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'}`}>
        <div className="max-w-6xl mx-auto space-y-5">
          <button onClick={() => setSelected(null)} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 cursor-pointer">
            <ArrowLeft size={15} /> Back to DSA Learning
          </button>

          <div className={`p-6 rounded-2xl border ${isBright ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'}`}>
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div>
                <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">{selected.level}</span>
                <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">{selected.title}</h1>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">{selected.summary}</p>
              </div>

            </div>
          </div>

          <DetailSection title="Types / Variants" icon={<Layers3 size={16} />} isBright={isBright}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {selected.types.map((type) => (
                <button key={type} type="button" onClick={() => setSelectedVariant(type)} className="text-left p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-xs font-semibold hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-colors cursor-pointer">
                  {type}<span className="block mt-1 text-[10px] font-normal text-cyan-500/70">Click to learn →</span>
                </button>
              ))}
            </div>
            {selectedVariant && VARIANT_DETAILS[selectedVariant] && (
              <div className={`mt-4 p-5 rounded-2xl border ${isBright ? 'bg-cyan-50 border-cyan-200' : 'bg-cyan-950/20 border-cyan-900/50'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold">{selectedVariant}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-400">{VARIANT_DETAILS[selectedVariant][0]}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-400"><span className="font-semibold text-cyan-400">Hinglish:</span> {VARIANT_DETAILS[selectedVariant][1]}</p>
                    <p className="mt-2 text-sm leading-7 text-slate-400"><span className="font-semibold text-cyan-400">Where to use:</span> {VARIANT_DETAILS[selectedVariant][2].replace('Best for: ','')}</p>
                  </div>
                  <button type="button" onClick={() => setSelectedVariant(null)} className="text-slate-500 hover:text-white cursor-pointer" aria-label="Close variant explanation"><X size={16} /></button>
                </div>
              </div>
            )}
          </DetailSection>

          <DetailSection title="Core operations & complexity" icon={<Clock3 size={16} />} isBright={isBright}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-slate-500 border-b border-slate-800"><th className="py-2 pr-4">Operation</th><th className="py-2 pr-4">Typical complexity</th><th className="py-2">Why</th></tr></thead>
                <tbody>
                  {selected.operations.map(([op, complexity, why]) => (
                    <tr key={op} className="border-b border-slate-800/60"><td className="py-2.5 pr-4 font-semibold">{op}</td><td className="py-2.5 pr-4 font-mono text-cyan-400">{complexity}</td><td className="py-2.5 text-slate-400">{why}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailSection>

          {TOPIC_DEEP[selected.id] && (() => { const d = TOPIC_DEEP[selected.id]; return (<>
            <div className="grid lg:grid-cols-2 gap-5">
              <DetailSection title="What is it? — Easy explanation" icon={<BookOpen size={16} />} isBright={isBright}><p className="text-sm leading-7 text-slate-400">{d.concept}</p></DetailSection>
              <DetailSection title="Hinglish explanation" icon={<Sparkles size={16} />} isBright={isBright}><p className="text-sm leading-7 text-slate-400">{d.hinglish}</p></DetailSection>
            </div>
            <DetailSection title="Why do we need it?" icon={<Target size={16} />} isBright={isBright}><p className="text-sm leading-7 text-slate-400">{d.why}</p></DetailSection>
            <DetailSection title="How it works internally" icon={<Brain size={16} />} isBright={isBright}><ul className="space-y-2">{d.working.map(x=><li key={x} className="text-sm leading-6 text-slate-400 flex gap-2"><span className="text-cyan-400">▸</span>{x}</li>)}</ul></DetailSection>
            <div className="grid lg:grid-cols-2 gap-5">
              <DetailSection title="Worked example" icon={<CheckCircle2 size={16} />} isBright={isBright}><p className="text-sm leading-7 text-slate-400">{d.example}</p></DetailSection>
              <DetailSection title="Step-by-step dry run" icon={<Clock3 size={16} />} isBright={isBright}><ol className="space-y-2 list-decimal list-inside">{d.dryRun.map(x=><li key={x} className="text-sm leading-6 text-slate-400">{x}</li>)}</ol></DetailSection>
            </div>
            <DetailSection title="Code example" icon={<ChevronRight size={16} />} isBright={isBright}><pre className="overflow-x-auto p-4 rounded-xl bg-black/30 border border-slate-800 text-xs leading-6 text-cyan-200 font-mono whitespace-pre-wrap">{d.code}</pre></DetailSection>
            <div className="grid lg:grid-cols-2 gap-5">
              <DetailSection title="Common mistakes" icon={<Target size={16} />} isBright={isBright}><ul className="space-y-2">{d.mistakes.map(x=><li key={x} className="text-sm text-slate-400 flex gap-2"><span className="text-rose-400">✕</span>{x}</li>)}</ul></DetailSection>
              <DetailSection title="Interview questions" icon={<Brain size={16} />} isBright={isBright}><ul className="space-y-2">{d.interview.map(x=><li key={x} className="text-sm text-slate-400 flex gap-2"><span className="text-purple-400">?</span>{x}</li>)}</ul></DetailSection>
            </div>
            <div className="grid lg:grid-cols-2 gap-5">
              <DetailSection title="When should you use it?" icon={<CheckCircle2 size={16} />} isBright={isBright}><p className="text-sm leading-7 text-slate-400">{d.when}</p></DetailSection>
              <DetailSection title="When should you avoid it?" icon={<X size={16} />} isBright={isBright}><p className="text-sm leading-7 text-slate-400">{d.avoid}</p></DetailSection>
            </div>
          </>); })()}

          <DetailSection title="Memory usage" icon={<HardDrive size={16} />} isBright={isBright}>
            <p className="text-sm leading-7 text-slate-400">{selected.memory}</p>
          </DetailSection>

          <div className="grid lg:grid-cols-2 gap-5">
            <DetailSection title="Advantages" icon={<CheckCircle2 size={16} />} isBright={isBright}>
              <ul className="space-y-2">{selected.advantages.map((item) => <li key={item} className="text-sm text-slate-400 flex gap-2"><span className="text-emerald-400">✓</span>{item}</li>)}</ul>
            </DetailSection>
            <DetailSection title="Disadvantages / trade-offs" icon={<Target size={16} />} isBright={isBright}>
              <ul className="space-y-2">{selected.disadvantages.map((item) => <li key={item} className="text-sm text-slate-400 flex gap-2"><span className="text-amber-400">•</span>{item}</li>)}</ul>
            </DetailSection>
          </div>

          <DetailSection title="Uses / applications" icon={<Sparkles size={16} />} isBright={isBright}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">{selected.uses.map((item) => <div key={item} className="p-3 rounded-xl bg-slate-500/5 border border-slate-700/50 text-sm text-slate-400">{item}</div>)}</div>
          </DetailSection>

          <DetailSection title="Advanced / Deep Dive" icon={<Brain size={16} />} isBright={isBright}>
            <ul className="grid sm:grid-cols-2 gap-2">{selected.advanced.map((item) => <li key={item} className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10 text-sm text-slate-400">{item}</li>)}</ul>
          </DetailSection>


        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 overflow-y-auto p-4 md:p-8 ${isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'}`}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/20"><BookOpen size={13} /> Concept-first DSA learning</span>
            <h1 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight">DSA Learning</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">Deep DSA theory from core foundations to advanced reasoning, kept separate from the DSA Hub's code, execution and 3D practice workflow.</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search topics, types, uses..." className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border outline-none focus:ring-1 focus:ring-cyan-500 ${isBright ? 'bg-white border-slate-300' : 'bg-slate-900 border-slate-800 text-white'}`} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((topic) => <TopicCard key={topic.id} topic={topic} onOpen={setSelected} isBright={isBright} />)}
        </div>

        {filtered.length === 0 && (
          <div className="py-16 text-center text-sm text-slate-500">No DSA learning topic matched your search.</div>
        )}

        <div className={`p-5 rounded-2xl border flex gap-3 ${isBright ? 'bg-white border-slate-200' : 'bg-slate-900/50 border-slate-800'}`}>
          <Brain size={18} className="text-purple-400 mt-0.5 shrink-0" />
          <div>
            <h2 className="text-sm font-bold">Learning model</h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">Each topic will progressively expand into introduction, why it is needed, variants, internal working, operations, memory, time/space complexity, advantages, disadvantages, applications, when to use/not use, examples, code, dry runs, 3D visualization, comparisons, common mistakes, interview questions and advanced concepts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
