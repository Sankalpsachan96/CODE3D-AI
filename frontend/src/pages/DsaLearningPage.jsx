import React, { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Brain, CheckCircle2, ChevronRight, Clock3, HardDrive, Layers3, Search, Sparkles, Target, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const LEARNING_TOPICS = [
  {
    id: 'arrays',
    title: 'Arrays & Vectors',
    level: 'Basic → Intermediate → Advanced',
    summary: 'Contiguous indexed storage and the foundation for searching, sorting, prefix sums, sliding windows and two-pointer techniques.',
    types: ['Static Array', 'Dynamic Array / Vector', 'Vector of Primitive Values', 'Vector of Strings', 'Vector of Pairs', 'Vector of Vectors (2D)', 'Vector of Objects / Structs', 'Vector of Pointers', 'vector<bool> (Specialized)', 'Nested Vectors', '2D Array', 'Multidimensional Array'],
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

  {
    id: 'hashing',
    title: 'Hashing & Hash Tables',
    level: 'Intermediate → Advanced',
    summary: 'Key-value and membership structures that use hash functions for fast average-case lookup, insertion and deletion.',
    types: ['Hash Table', 'Hash Map', 'Hash Set', 'Collision Handling', 'Frequency Map'],
    operations: [
      ['Insert', 'Average O(1)', 'A good hash function spreads keys across buckets.'],
      ['Search / Lookup', 'Average O(1)', 'The hash identifies the likely bucket before collision resolution.'],
      ['Delete', 'Average O(1)', 'Remove the key/value from its bucket or probe sequence.'],
      ['Worst-case operation', 'O(n)', 'Poor hashing or heavy collisions can degrade performance.'],
    ],
    memory: 'Hash tables use O(n) storage for n entries plus bucket capacity and collision-management overhead.',
    advantages: ['Very fast average lookup', 'Natural key-value representation', 'Excellent for membership and frequency counting'],
    disadvantages: ['No inherent sorted order', 'Collision handling adds complexity', 'Worst-case lookup can degrade to O(n)'],
    uses: ['Frequency counting', 'Caching', 'Symbol tables', 'Duplicate detection', 'Fast membership checks'],
    advanced: ['Load factor and rehashing', 'Separate chaining vs open addressing', 'Custom hash functions', 'String and composite-key hashing'],
  },


  {
    id: 'recursion-backtracking',
    title: 'Recursion & Backtracking',
    level: 'Basic → Advanced',
    summary: 'Recursive problem solving and systematic choice exploration with undo and pruning.',
    types: ['Direct Recursion', 'Tail Recursion', 'Divide & Conquer', 'Backtracking', 'Memoized Recursion'],
    operations: [['Recursive call','Problem dependent','Each call works on a smaller or changed state.'],['Backtracking search','Often exponential','Explore choices and abandon invalid branches early.'],['Call-stack usage','O(depth)','Each active call consumes stack space.']],
    memory: 'Call-stack usage is O(recursion depth); backtracking may also store the current path.',
    advantages: ['Natural for trees and divide-and-conquer','Expresses exhaustive search clearly','Pruning can remove large search branches'],
    disadvantages: ['Deep recursion can overflow the stack','Naive recursion may repeat work','Backtracking can be expensive'],
    uses: ['Tree traversal','Merge Sort','Maze solving','N-Queens','Subsets and permutations'],
    advanced: ['Memoization','Pruning','Recursion trees','Branch and bound'],
  },
  {
    id: 'greedy',
    title: 'Greedy Algorithms',
    level: 'Intermediate → Advanced',
    summary: 'Algorithms that repeatedly choose a locally best option when a proof shows that choice leads to a global optimum.',
    types: ['Activity Selection', 'Fractional Knapsack', 'Huffman Coding', 'Interval Scheduling', 'Greedy Graph Algorithms'],
    operations: [['Choice','Problem dependent','Select the best valid local option.'],['Sorting + selection','Often O(n log n)','Many greedy solutions sort candidates first.'],['Priority selection','Often O(n log n)','A heap can expose the best next candidate.']],
    memory: 'Usually O(1) to O(n) auxiliary space depending on sorting and candidate storage.',
    advantages: ['Often simple and fast','Can beat more general optimization approaches','Easy to implement once the greedy property is known'],
    disadvantages: ['Local best is not always global best','Correctness needs a problem-specific proof'],
    uses: ['Scheduling','Minimum spanning trees','Compression','Resource allocation'],
    advanced: ['Greedy-choice property','Optimal substructure','Exchange arguments','Greedy vs DP'],
  },
  {
    id: 'bit-manipulation',
    title: 'Bit Manipulation',
    level: 'Intermediate → Advanced',
    summary: 'Techniques that operate directly on binary bits using AND, OR, XOR and shifts.',
    types: ['Bitwise AND/OR/XOR', 'Bit Shifting', 'Bit Mask', 'Set/Clear/Toggle Bit', 'Bitmask Enumeration'],
    operations: [['Bitwise operation','O(1)','Operate on fixed-width integer bits.'],['Set/Clear/Toggle','O(1)','Masks modify selected bit positions.'],['Mask enumeration','O(2^n)','Enumerate subsets using binary masks.']],
    memory: 'Bitmasks can represent n boolean states in roughly n bits, making state compression very compact.',
    advantages: ['Fast primitive operations','Compact state representation','Powerful for subset problems'],
    disadvantages: ['Can reduce readability','Signed shifts and widths need care','Mask bugs can be subtle'],
    uses: ['Flags','Parity','Subset DP','Unique-number problems','State compression'],
    advanced: ['XOR tricks','Set-bit counting','Submask enumeration','Bitmask DP'],
  },
  {
    id: 'disjoint-set',
    title: 'Disjoint Set Union (Union-Find)',
    level: 'Intermediate → Advanced',
    summary: 'A structure for maintaining separate components while efficiently merging them and checking connectivity.',
    types: ['Union-Find', 'Path Compression', 'Union by Rank', 'Union by Size'],
    operations: [['Find','Amortized O(α(n))','Find the representative of a component.'],['Union','Amortized O(α(n))','Merge two components efficiently.'],['Connectivity check','Amortized O(α(n))','Equal representatives mean connected components.']],
    memory: 'O(n) parent storage plus an optional rank/size array.',
    advantages: ['Extremely fast repeated connectivity checks','Excellent for component merging','Simple once parent trees are understood'],
    disadvantages: ['Not designed for arbitrary deletions','Does not replace general graph traversal'],
    uses: ['Kruskal MST','Cycle detection','Dynamic connectivity','Grouping'],
    advanced: ['Path compression','Union by rank/size','Rollback DSU'],
  },
  {
    id: 'segment-fenwick-trees',
    title: 'Segment Trees & Fenwick Trees',
    level: 'Advanced',
    summary: 'Range-query structures for fast updates and repeated range or prefix queries.',
    types: ['Segment Tree', 'Lazy Propagation', 'Fenwick Tree / BIT', 'Range Sum Query', 'Range Minimum Query'],
    operations: [['Segment query','O(log n)','Combine only relevant interval nodes.'],['Segment update','O(log n)','Update a path and recompute ancestors.'],['Fenwick update/query','O(log n)','Binary-indexed jumps maintain prefix aggregates.']],
    memory: 'Segment trees use O(n) space; Fenwick trees also use O(n) but are usually more compact.',
    advantages: ['Fast dynamic range queries','Much faster than repeated O(n) scans','Fenwick trees are compact'],
    disadvantages: ['More complex than prefix sums','Segment trees need extra memory','Structure must match query/update requirements'],
    uses: ['Range sums','Range min/max','Dynamic intervals','Frequency and inversion problems'],
    advanced: ['Lazy propagation','Iterative segment trees','Persistent segment trees','2D range structures'],
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
    code: 'void inorder(Node* r) {\n  if (!r) return;\n\n  inorder(r->left);\n  cout << r->val;\n  inorder(r->right);\n}',
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
    code: 'bool search(Node* r, int x) {\n  if (!r) return false;\n\n  if (r->val == x) return true;\n\n  if (x < r->val) {\n    return search(r->left, x);\n  }\n\n  return search(r->right, x);\n}',
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
  },
  hashing: {
    concept: 'Hashing converts a key into a bucket/index using a hash function, making average lookup very fast.',
    hinglish: 'Hashing ko locker system jaisa samjho: key ko hash function ek bucket deta hai, phir wahi se data quickly mil jata hai. Same bucket aaye to collision handle karni padti hai.',
    why: 'Use hashing when fast average-case lookup or membership checking matters more than sorted order.',
    working: ['Compute the hash of the key.', 'Map it to a bucket using table capacity.', 'Resolve collisions using chaining or probing.', 'Resize and rehash when the load factor becomes high.'],
    example: 'A frequency map stores each value as a key and its count as the value.',
    dryRun: ['Read 5 → count 1', 'Read 2 → count 1', 'Read 5 → count 2', 'Read 5 → count 3'],
    code: 'unordered_map<int,int> freq;\nfor (int x : a) freq[x]++;',
    mistakes: ['Assuming hashing is always O(1)', 'Ignoring collisions', 'Forgetting that hash maps are not automatically sorted'],
    interview: ['How does a hash table work?', 'What is a collision?', 'Chaining vs open addressing?', 'What is load factor?'],
    when: 'Use for frequency counts, membership checks, caching and fast key-based lookup.',
    avoid: 'Avoid when sorted iteration or ordered predecessor/successor operations are required.'
  },
  'recursion-backtracking': {
    concept: 'Recursion solves a problem through smaller calls. Backtracking adds choice, exploration and undo so alternatives can be tried systematically.',
    hinglish: 'Recursion me function smaller problem ke saath khud ko call karta hai. Backtracking me choice lo, explore karo, galat ho to undo karke next choice try karo.',
    why: 'Useful for trees, divide-and-conquer and problems where many possible choices must be explored.',
    working: ['Define a base case.','Reduce the problem in each call.','For backtracking use choose → explore → undo.','Prune a branch as soon as it cannot work.'],
    example: 'For subsets of [1,2], choose or skip each value to produce [], [1], [2], [1,2].',
    dryRun: ['Start []','Choose 1 → [1]','Choose 2 → [1,2]','Undo 2 → [1]','Undo 1 → [] and try 2'],
    code: 'void solve(int i){\n  if(i==n) return;\n  solve(i+1);\n  // choose a[i]\n  solve(i+1);\n}',
    mistakes: ['Missing base case','Not reducing the state','Forgetting to undo a choice','Using unsafe recursion depth'],
    interview: ['Recursion vs iteration?','What is backtracking?','How does pruning help?','How does memoization optimize recursion?'],
    when: 'Use for trees, divide-and-conquer, subsets, permutations and constraint problems.',
    avoid: 'Avoid deep recursion when stack depth is unsafe or iteration is clearer.'
  },
  greedy: {
    concept: 'Greedy algorithms repeatedly take the best local choice and depend on a problem-specific proof that this can produce a global optimum.',
    hinglish: 'Har step par jo choice abhi best lagti hai woh lete hain, lekin ye tabhi correct hai jab greedy-choice property prove ho.',
    why: 'When valid, greedy gives simple and efficient solutions to many optimization problems.',
    working: ['Define the candidates.','Choose a local priority rule.','Take the best valid candidate.','Prove the choice can belong to an optimal solution.'],
    example: 'Activity selection works by repeatedly choosing the activity that finishes earliest.',
    dryRun: ['Sort by finish time','Pick the first activity','Skip overlaps','Pick the next compatible activity','Continue'],
    code: 'sort(a.begin(), a.end(), [](auto &x, auto &y) {\n  return x.end < y.end;\n});',
    mistakes: ['Assuming every optimization problem is greedy','Skipping the correctness proof'],
    interview: ['Greedy vs DP?','What is an exchange argument?','Why does activity selection work?','Give a case where greedy fails.'],
    when: 'Use for scheduling, MST and other problems with a proven greedy property.',
    avoid: 'Avoid when a local choice can block a better future combination.'
  },
  'bit-manipulation': {
    concept: 'Bit manipulation works directly on the binary representation of integers using operators such as &, |, ^, << and >>.',
    hinglish: 'Integer ke binary bits ko boxes samjho. Mask se kisi bit ko check, set, clear ya toggle kar sakte ho.',
    why: 'It gives compact state representation and fast low-level operations.',
    working: ['Create a mask.','Use AND to test, OR to set, XOR to toggle.','Use shifts to move bit positions.','Combine masks to represent subsets or flags.'],
    example: 'For x=10 (1010), x & 1 is 0, so x is even.',
    dryRun: ['x=10 → 1010','mask=0010','x & mask=0010 → bit is set','x ^ mask=1000 → bit toggled'],
    code: 'bool set = (x & (1 << k)) != 0;\nx |= (1 << k);',
    mistakes: ['Wrong precedence','Confusing logical and bitwise operators','Ignoring integer width/sign behavior'],
    interview: ['Why does x & 1 check parity?','How does XOR find a unique value?','What is a bitmask?','How do you count set bits?'],
    when: 'Use for flags, parity, subset states and compact boolean state.',
    avoid: 'Avoid clever bit tricks when they reduce readability without a real benefit.'
  },
  'disjoint-set': {
    concept: 'DSU maintains disjoint components using representative parent trees. Path compression and union by rank/size make operations almost constant amortized time.',
    hinglish: 'Har group ka ek leader hota hai. Find leader batata hai aur Union do groups ko merge karta hai.',
    why: 'It is ideal when components only merge and connectivity must be checked repeatedly.',
    working: ['Start with each element as its own parent.','Find follows parents to the representative.','Path compression shortens future paths.','Union by rank/size keeps trees shallow.'],
    example: 'Union(1,2) and Union(2,3) makes 1, 2 and 3 part of the same component.',
    dryRun: ['1 and 2 separate','Union(1,2)','2 points toward 1','Union(2,3)','All three now share a representative'],
    code: 'int find(int x) {\n  if (parent[x] == x) {\n    return x;\n  }\n\n  parent[x] = find(parent[x]);\n  return parent[x];\n}',
    mistakes: ['Skipping path compression','Not using rank/size','Using DSU where deletions are central'],
    interview: ['Why is DSU nearly O(1)?','Path compression vs union by rank?','How does Kruskal use DSU?'],
    when: 'Use for connectivity merging, Kruskal and undirected cycle detection.',
    avoid: 'Avoid when shortest paths, ordered traversal or frequent deletions are required.'
  },
  'segment-fenwick-trees': {
    concept: 'Segment and Fenwick trees maintain partial aggregates so repeated updates and range/prefix queries can be handled in logarithmic time.',
    hinglish: 'Agar values update bhi hoti hain aur baar-baar range sum/min nikalna hai, poora range scan karna slow hoga. Ye trees partial answers store karke query fast banate hain.',
    why: 'They are useful when both updates and repeated range queries are frequent.',
    working: ['Segment Tree stores aggregates for intervals.','Queries combine only relevant intervals.','Updates recompute affected ancestors.','Fenwick Tree uses binary-indexed jumps for prefix aggregates.'],
    example: 'For [2,4,6,8], after changing 6 to 10, a range query can use stored nodes instead of rescanning every value.',
    dryRun: ['Build structure','Update one index','Recompute affected nodes','Query a range','Combine O(log n) relevant pieces'],
    code: 'void update(int i, int d) {\n  for (; i <= n; i += i & -i) {\n    bit[i] += d;\n  }\n}',
    mistakes: ['Mixing 0-based and 1-based Fenwick indexing','Forgetting lazy propagation','Using a tree when prefix sums are enough'],
    interview: ['Segment tree vs Fenwick tree?','Why is update O(log n)?','What is lazy propagation?','When are prefix sums enough?'],
    when: 'Use for dynamic range sums/min/max and repeated updates plus queries.',
    avoid: 'Avoid when data is static and a simpler prefix-sum or sparse-table solution is enough.'
  },


};


const TOPIC_DEEP_DIVE = {
  arrays: {
    title: 'Arrays & Vectors — Deep Explanation',
    sections: [
      ['How it works internally', 'An array stores elements in contiguous memory. Because every element has the same size, the address of element i can be calculated directly from the base address plus i × element size. A vector uses the same contiguous idea, but keeps size and capacity and can allocate a larger block when it grows.'],
      ['Array vs Vector — what actually changes', 'A fixed array gets its storage for a known size. A vector owns a dynamic contiguous block, tracks how many elements are currently present (size), and how many can fit without reallocation (capacity). Reallocation moves/copies the old elements into a new block.'],
      ['Important operations', 'Index access is O(1). Linear search is O(n). Appending to a vector is amortized O(1). Inserting or deleting in the middle is O(n) because later elements may have to shift. reserve() can reduce repeated reallocations when the expected size is known.'],
      ['Worked example', 'Suppose v = [10, 20, 30, 40] and capacity = 4. push_back(50) cannot fit, so a larger block is obtained, the four old values are moved/copied, 50 is placed after them, and the old block is released. The logical size becomes 5.'],
      ['Dry run', 'Start: [10,20] → size 2. Add 30 → [10,20,30]. Add 40 → [10,20,30,40]. Add 50 when capacity is 4 → allocate larger storage → move old values → write 50 → size 5.'],
      ['Structured code example', `vector<int> v;
v.reserve(4);

v.push_back(10);
v.push_back(20);
v.push_back(30);
v.push_back(40);

cout << v.size() << "\\n";
cout << v.capacity() << "\\n";

v.push_back(50);   // growth may happen here
cout << v[4];      // 50`],
      ['Common mistakes', 'Confusing size with capacity, using an invalid index, assuming every push_back is individually O(1), and keeping pointers/references/iterators across a reallocation.'],
      ['When to use', 'Use arrays/vectors when indexed access and contiguous storage are useful. Prefer vector when the number of elements changes during execution.']
    ]
  },
  'sorting-searching': {
    title: 'Searching & Sorting — Deep Explanation',
    sections: [
      ['How searching works', 'Linear search checks elements one by one and needs no ordering. Binary search uses a sorted or monotonic search space and repeatedly compares the target with the middle, discarding half of the remaining range.'],
      ['How sorting works', 'Sorting establishes an order so later operations become easier. Bubble/selection/insertion repeatedly rearrange nearby or selected elements; merge sort divides and merges; quick sort partitions around a pivot; heap sort uses heap order.'],
      ['Choosing the right algorithm', 'For a single lookup in unsorted data, linear search is often simplest. For many lookups on sorted data, binary search is powerful. For sorting, consider n, worst-case guarantees, stability, memory limits and whether the data is nearly sorted.'],
      ['Worked example — binary search', 'For a = [3, 8, 12, 17, 25, 31] and target 25: middle is 12, target is larger, search the right half; middle becomes 25, so the target is found.'],
      ['Dry run — insertion sort', '[5, 2, 4, 1] → insert 2 before 5 → [2,5,4,1] → insert 4 → [2,4,5,1] → insert 1 → [1,2,4,5].'],
      ['Structured code example', `vector<int> a = {5, 2, 4, 1};

for (int i = 1; i < a.size(); i++) {
    int key = a[i];
    int j = i - 1;

    while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        j--;
    }

    a[j + 1] = key;
}`],
      ['Complexity', 'Linear search: O(n). Binary search: O(log n) when the precondition holds. Merge sort: O(n log n). Quick sort: O(n log n) average and O(n²) worst case with poor pivots. Elementary quadratic sorts are typically O(n²).'],
      ['Common mistakes', 'Using binary search on unsorted data, forgetting the sorted precondition, choosing a pivot without considering worst cases, and comparing algorithms only by average time.']
    ]
  },
  'linked-lists': {
    title: 'Linked Lists — Deep Explanation',
    sections: [
      ['How it works internally', 'A linked list stores nodes separately. Each node contains data plus a link to another node. The nodes do not need to be contiguous, so insertion can be done by changing links rather than shifting a whole block.'],
      ['Types and when they matter', 'Singly linked lists have next links, doubly linked lists add prev links, and circular lists connect the tail back to the head. The extra links make some operations easier but increase memory usage.'],
      ['Important operations', 'Access by position is O(n) because links must be followed. Inserting after a known node is O(1). Searching is O(n). Deleting a node is O(1) once the required predecessor/node reference is already known.'],
      ['Worked example', 'For A → B → C, insert X after B: save B.next (C), set B.next = X, then X.next = C. No array-style shifting is required.'],
      ['Dry run', 'Before: A → B → C. Create X. X.next = C. B.next = X. After: A → B → X → C.'],
      ['Structured code example', `struct Node {
    int data;
    Node* next;

    Node(int value) : data(value), next(nullptr) {}
};

Node* x = new Node(25);

x->next = current->next;
current->next = x;`],
      ['Memory and trade-off', 'Each node needs its value plus one or more pointers. This adds overhead compared with a contiguous vector, and pointer chasing can be slower because nodes may be far apart in memory.'],
      ['Common mistakes', 'Losing the next pointer before reconnecting nodes, dereferencing nullptr, forgetting head/tail updates, and assuming linked lists provide O(1) random indexing.']
    ]
  },
  'stacks-queues': {
    title: 'Stacks & Queues — Deep Explanation',
    sections: [
      ['Core idea', 'A stack is LIFO: the most recently added item leaves first. A queue is FIFO: the earliest item leaves first. A deque supports insertion/removal at both ends, while a priority queue removes by priority rather than arrival time.'],
      ['How they work internally', 'A stack can use a vector or linked nodes with a top position. A queue can use a circular array or linked nodes with front/rear references. Circular indexing avoids shifting all remaining queue elements.'],
      ['Important operations', 'Stack push/pop/top are typically O(1). Queue enqueue/dequeue are typically O(1). Deque end operations are typically O(1). Heap-based priority queue insertion and removal are O(log n), while peek is O(1).'],
      ['Worked example', 'Stack: push 10, 20, 30 → pop returns 30. Queue: enqueue A, B, C → dequeue returns A. The order is determined by the access rule, not by sorting.'],
      ['Dry run', 'Stack: [] → push A → [A] → push B → [A,B] → pop → [A]. Queue: [] → A → A,B → A,B,C → dequeue A → B,C.'],
      ['Structured code example', `stack<int> st;

st.push(10);
st.push(20);
cout << st.top();   // 20
st.pop();

queue<int> q;

q.push(10);
q.push(20);
cout << q.front();  // 10
q.pop();`],
      ['Where they are used', 'Stacks are natural for recursion, undo, parsing, balanced parentheses and monotonic-stack problems. Queues are natural for BFS, scheduling and level-order traversal.'],
      ['Common mistakes', 'Popping from an empty structure, mixing front/back semantics, implementing a queue with repeated O(n) shifting, and assuming a priority queue is fully sorted.']
    ]
  },
  'binary-trees': {
    title: 'Binary Trees — Deep Explanation',
    sections: [
      ['How it works internally', 'A binary tree is made of nodes with at most two child references: left and right. The recursive structure means every child subtree is itself a smaller binary tree.'],
      ['Traversal', 'Preorder visits root-left-right, inorder visits left-root-right, postorder visits left-right-root, and level-order visits one depth at a time using a queue. Traversal choice changes the order in which information is processed.'],
      ['Worked example', 'For root 1 with children 2 and 3: preorder = 1,2,3; inorder = 2,1,3; postorder = 2,3,1; level-order = 1,2,3.'],
      ['Dry run — inorder', 'Start at 1 → go left to 2 → no left child → visit 2 → return to 1 → visit 1 → go right to 3 → visit 3. Result: 2,1,3.'],
      ['Structured code example', `void inorder(Node* root) {
    if (root == nullptr) {
        return;
    }

    inorder(root->left);
    cout << root->data << " ";
    inorder(root->right);
}`],
      ['Complexity', 'A traversal visits every node once, so time is O(n). Recursive auxiliary space is O(h), where h is tree height; a skewed tree can have h = n.'],
      ['Common mistakes', 'Forgetting the null base case, confusing traversal orders, assuming every binary tree is a BST, and ignoring how tree height changes recursive memory usage.'],
      ['When to use', 'Use binary trees for hierarchical data, recursive decomposition, expression trees and tree-based divide-and-conquer problems.']
    ]
  },
  bst: {
    title: 'Binary Search Trees — Deep Explanation',
    sections: [
      ['Core invariant', 'For a chosen duplicate policy, values smaller than a node go left and larger values go right. This ordering invariant lets a search eliminate one subtree at every comparison.'],
      ['How search works', 'Compare target with the current node. Equal means found. Smaller means move left. Larger means move right. The number of comparisons depends on tree height h.'],
      ['Insertion and deletion', 'Insertion follows the search path and attaches a new leaf. Deletion has three cases: leaf, one child, or two children. The two-child case usually replaces the node with its inorder successor or predecessor.'],
      ['Worked example', 'Insert 8, 3, 10, 1, 6. Search for 6: 6 < 8 → go left to 3; 6 > 3 → go right to 6; found.'],
      ['Dry run', 'Root 8 → compare 6 → left. Node 3 → compare 6 → right. Node 6 → equal → stop.'],
      ['Structured code example', `bool search(Node* root, int x) {
    if (root == nullptr) {
        return false;
    }

    if (root->data == x) {
        return true;
    }

    if (x < root->data) {
        return search(root->left, x);
    }

    return search(root->right, x);
}`],
      ['Complexity', 'Search/insert/delete are O(h). A balanced BST has h ≈ log n, while a skewed BST can have h = n, making operations O(n).'],
      ['Common mistakes', 'Assuming every BST is balanced, breaking the ordering invariant during deletion, and forgetting to define how duplicate values are handled.']
    ]
  },
  heaps: {
    title: 'Heaps & Priority Queues — Deep Explanation',
    sections: [
      ['Core idea', 'A binary heap is a complete binary tree stored compactly in an array. A min-heap keeps the smallest value at the root; a max-heap keeps the largest.'],
      ['How indexing works', 'With zero-based indexing, children of i are 2i+1 and 2i+2, while the parent is (i-1)/2. This removes the need for explicit child pointers.'],
      ['Heapify and operations', 'Insert places an item at the end and bubbles it upward. Extract removes the root, moves the last item to the root, and bubbles it downward. Both are O(log n).'],
      ['Worked example', 'Max-heap [50, 30, 40, 10, 20]. Insert 60 at the end → compare with parent 40 → swap → compare with parent 50 → swap. Result begins [60,50,40,...].'],
      ['Dry run', 'Insert 60: [50,30,40,10,20,60] → swap with 40 → [50,30,60,10,20,40] → swap with 50 → [60,30,50,10,20,40].'],
      ['Structured code example', `priority_queue<int> pq;

pq.push(30);
pq.push(50);
pq.push(40);

cout << pq.top();   // 50

pq.pop();
cout << pq.top();   // 40`],
      ['Complexity', 'Peek is O(1), insertion and extraction are O(log n), and building a heap from n existing elements can be O(n).'],
      ['Common mistakes', 'Treating a heap as fully sorted, using wrong child indices, confusing min-heap and max-heap, and forgetting that priority_queue is a heap interface rather than a sorted container.']
    ]
  },
  hashing: {
    title: 'Hashing & Hash Tables — Deep Explanation',
    sections: [
      ['How it works internally', 'A hash function converts a key into a number that is mapped to a table slot. A good hash distributes keys so that most operations inspect very few entries.'],
      ['Collision handling', 'Two different keys can map to the same slot. Chaining stores multiple entries in a bucket; open addressing probes other slots. The collision strategy affects performance and memory layout.'],
      ['Hash map vs hash set', 'A hash map stores key-value pairs. A hash set stores keys only and is useful for membership checks and duplicate detection. A frequency map is simply a map whose value counts occurrences.'],
      ['Worked example', 'For array [2, 2, 5, 2, 5], start with an empty frequency map. Read 2 → freq[2]=1, read 2 → 2, read 5 → 1, read 2 → 3, read 5 → 2.'],
      ['Dry run', 'Key "cat" → hash("cat") → bucket 4. Key "dog" → bucket 1. If another key also maps to 4, the collision handler stores both without losing either value.'],
      ['Structured code example', `unordered_map<int, int> freq;

for (int x : a) {
    freq[x]++;
}

for (auto [value, count] : freq) {
    cout << value << ": " << count << "\\n";
}`],
      ['Complexity', 'Average lookup/insert/delete is O(1) under good hashing and controlled load factor. Worst-case behavior can degrade toward O(n) with severe collisions.'],
      ['Common mistakes', 'Assuming O(1) is guaranteed, ignoring collisions, forgetting key/value semantics, and using hashing when ordered iteration or predecessor/successor queries are required.']
    ]
  },
  'recursion-backtracking': {
    title: 'Recursion & Backtracking — Deep Explanation',
    sections: [
      ['Core recursion idea', 'A recursive function solves a smaller version of the same problem and eventually reaches a base case. Every active call has its own stack frame containing parameters and local state.'],
      ['Backtracking idea', 'Backtracking explores a choice, recursively solves the remaining problem, then undoes the choice before trying another branch. It is a disciplined form of search over possibilities.'],
      ['Worked example', 'For generating subsets of [1,2], at each element choose include or exclude: {}, {2}, {1}, {1,2}. The recursion tree represents these decisions.'],
      ['Dry run', 'Start [] → choose 1 → []/1 decisions → choose 2 → [1,2] → undo 2 → [1] → undo 1 → choose 2 → [2].'],
      ['Structured code example', `void generate(int index, vector<int>& current) {
    if (index == n) {
        print(current);
        return;
    }

    // Do not take a[index].
    generate(index + 1, current);

    // Take a[index].
    current.push_back(a[index]);
    generate(index + 1, current);

    // Undo the choice.
    current.pop_back();
}`],
      ['Complexity and memory', 'Time depends on the recursion tree. Generating all subsets is O(2^n). Auxiliary stack space is O(n) for depth n, excluding stored output.'],
      ['Common mistakes', 'Missing the base case, forgetting to undo state during backtracking, sharing mutable state incorrectly, and using recursion when the depth can exceed safe stack limits.']
    ]
  },
  greedy: {
    title: 'Greedy Algorithms — Deep Explanation',
    sections: [
      ['Core idea', 'A greedy algorithm makes the best local choice available at each step. Unlike brute force, it does not revisit every combination. The critical question is whether the problem has a proof that local choices can lead to a global optimum.'],
      ['Greedy-choice property', 'You need more than intuition. A correct greedy solution normally relies on an exchange argument, cut property, or another proof showing that an optimal solution can contain the greedy choice.'],
      ['Worked example — activity selection', 'Choose the activity that finishes earliest, then repeatedly choose the next activity whose start is at least the last selected finish time.'],
      ['Dry run', 'Activities sorted by finish: (1,2), (3,4), (0,6), (5,7). Choose (1,2), then (3,4), skip (0,6), then choose (5,7).'],
      ['Structured code example', `sort(activities.begin(), activities.end(),
     [](const Activity& a, const Activity& b) {
         return a.finish < b.finish;
     });

int lastFinish = -1;

for (const auto& activity : activities) {
    if (activity.start >= lastFinish) {
        choose(activity);
        lastFinish = activity.finish;
    }
}`],
      ['Complexity', 'Many greedy algorithms sort first, giving O(n log n), followed by an O(n) scan. The exact complexity depends on the chosen greedy strategy and supporting data structure.'],
      ['Common mistakes', 'Assuming every locally best choice is correct, using greedy for 0/1 knapsack without proof, and skipping the reasoning that establishes the greedy-choice property.']
    ]
  },
  'bit-manipulation': {
    title: 'Bit Manipulation — Deep Explanation',
    sections: [
      ['How bits work', 'An integer is represented in binary. Bit operations let you inspect or modify individual positions using AND, OR, XOR, NOT and shifts.'],
      ['Core operations', 'AND can test/clear bits, OR can set bits, XOR can toggle bits, and shifts move bit positions. The expression (1 << k) creates a mask with bit k set.'],
      ['Worked example', 'For x = 10 (1010₂), bit 1 is set and bit 0 is clear. x & (1<<1) is non-zero, so bit 1 is set. x ^ (1<<1) toggles bit 1 and produces 1000₂.'],
      ['Dry run', 'x = 10 → binary 1010. mask = 0010. x & mask = 0010 → bit is set. x ^ mask = 1000 → bit 1 is toggled off.'],
      ['Structured code example', `int x = 10;       // 1010
int k = 1;
int mask = 1 << k;

bool isSet = (x & mask) != 0;

x |= mask;        // set bit k
x &= ~mask;       // clear bit k
x ^= mask;        // toggle bit k`],
      ['Complexity', 'Basic bit operations on fixed-width integers are O(1) in the usual word-RAM model and use O(1) auxiliary space.'],
      ['Common mistakes', 'Ignoring operator precedence, confusing logical and bitwise operators, misunderstanding signed right shifts, and using clever tricks without checking readability and integer width.']
    ]
  },
  'disjoint-set': {
    title: 'Disjoint Set Union (Union-Find) — Deep Explanation',
    sections: [
      ['Core idea', 'DSU maintains a collection of disjoint groups. find(x) tells which component x belongs to, while union(a,b) merges the components containing a and b.'],
      ['How it works internally', 'Each set is represented as a parent tree. Path compression makes nodes point directly toward the root, while union by rank or size attaches the smaller tree below the larger one.'],
      ['Worked example', 'Start with {1},{2},{3},{4}. union(1,2) creates {1,2}; union(3,4) creates {3,4}; union(2,3) merges them into {1,2,3,4}.'],
      ['Dry run', 'parent initially points every node to itself. After union(1,2), root 2 may point to 1. After union(2,3), find(2) reaches 1, so root 3 is attached to 1.'],
      ['Structured code example', `int find(int x) {
    if (parent[x] == x) {
        return x;
    }

    return parent[x] = find(parent[x]);
}

void unite(int a, int b) {
    a = find(a);
    b = find(b);

    if (a == b) return;

    if (size[a] < size[b]) {
        swap(a, b);
    }

    parent[b] = a;
    size[a] += size[b];
}`],
      ['Complexity', 'With path compression plus union by rank/size, operations are amortized O(alpha(n)), which behaves almost like O(1) for practical input sizes.'],
      ['Common mistakes', 'Forgetting to find roots before merging, attaching arbitrary roots without balancing, and confusing component identity with the original node value.']
    ]
  },
  'segment-fenwick-trees': {
    title: 'Segment Trees & Fenwick Trees — Deep Explanation',
    sections: [
      ['Why they exist', 'When an array receives many updates and range queries, checking every element in every query can be too slow. These structures store partial information so a query can combine only O(log n) pieces.'],
      ['Segment tree', 'A segment tree recursively divides an array into intervals. Each node stores an aggregate such as sum, minimum or maximum for its interval. Updates and range queries typically take O(log n).'],
      ['Fenwick tree', 'A Fenwick tree stores prefix aggregates in a compact array. Each index represents a block determined by its lowest set bit. Point update and prefix sum are O(log n).'],
      ['Worked example', 'For [2,4,1,7], a range sum query [1,3] is 4+1+7 = 12. A segment tree can combine stored interval sums; a Fenwick tree can compute prefix(3)-prefix(0).'],
      ['Dry run', 'Fenwick add(index, delta) updates index and then jumps by lowbit(index). sum(index) moves backward by lowbit(index), accumulating the stored partial sums.'],
      ['Structured code example', `vector<int> bit(n + 1);

void add(int i, int delta) {
    for (; i <= n; i += i & -i) {
        bit[i] += delta;
    }
}

int sum(int i) {
    int result = 0;

    for (; i > 0; i -= i & -i) {
        result += bit[i];
    }

    return result;
}`],
      ['Complexity', 'Fenwick point update/prefix sum are O(log n). Standard segment-tree point update/range query are O(log n). Building can be O(n), depending on implementation.'],
      ['Common mistakes', 'Mixing zero-based and one-based Fenwick indexing, forgetting the query/update boundaries, and using a complex tree when static prefix sums would be enough.']
    ]
  },
  graphs: {
    title: 'Graphs — Deep Explanation',
    sections: [
      ['Core idea', 'A graph models entities as vertices and relationships as edges. Edges may be directed or undirected and may carry weights. The representation and edge properties determine which algorithms are valid.'],
      ['Representations', 'An adjacency list stores neighbors per vertex and uses O(V+E) space for sparse graphs. An adjacency matrix stores a V×V table and gives O(1) edge lookup at the cost of O(V²) space.'],
      ['Traversal', 'BFS uses a queue and explores by distance in unweighted graphs. DFS follows one path deeply before backtracking. Both traverse an adjacency-list graph in O(V+E).'],
      ['Worked example', 'Edges 1-2, 1-3, 2-4. BFS from 1 visits 1, then 2 and 3, then 4. DFS might visit 1,2,4, then return and visit 3.'],
      ['Dry run — BFS', 'Queue [1] → visit 1, enqueue 2,3 → queue [2,3] → visit 2, enqueue 4 → queue [3,4] → visit 3 → visit 4.'],
      ['Structured code example', `vector<vector<int>> adj(n);

queue<int> q;
vector<bool> visited(n, false);

q.push(0);
visited[0] = true;

while (!q.empty()) {
    int u = q.front();
    q.pop();

    for (int v : adj[u]) {
        if (!visited[v]) {
            visited[v] = true;
            q.push(v);
        }
    }
}`],
      ['Advanced choices', 'Dijkstra is for non-negative weighted shortest paths, topological sort applies to DAGs, DSU helps connectivity/component merging, and MST algorithms use edge-weight structure.'],
      ['Common mistakes', 'Forgetting visited tracking, confusing directed and undirected edges, using Dijkstra with negative edges, and assuming every graph is connected.']
    ]
  },
  'dynamic-programming': {
    title: 'Dynamic Programming — Deep Explanation',
    sections: [
      ['Core idea', 'Dynamic programming solves problems with overlapping subproblems and optimal substructure by storing results of states instead of recomputing them.'],
      ['How to build a DP', 'First define the state: what does dp[i] or dp[i][j] mean? Then define the transition, base cases, computation order and final answer. Only after the full table is correct should you consider space optimization.'],
      ['Memoization vs tabulation', 'Memoization starts from the target and caches recursive states. Tabulation starts from base cases and fills states iteratively. Both can represent the same recurrence.'],
      ['Worked example — Fibonacci', 'Naive recursion recomputes fib(3), fib(2), etc. Memoization computes each fib(k) once. Tabulation builds fib(0), fib(1), fib(2), ... up to fib(n).'],
      ['Dry run', 'fib(5): compute fib(0), fib(1), then 2, 3, 4, 5. Each state is reused instead of creating the same recursive subtree again.'],
      ['Structured code example', `vector<long long> dp(n + 1);

dp[0] = 0;
dp[1] = 1;

for (int i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
}

cout << dp[n];`],
      ['Complexity', 'A common DP bound is number of states × transition cost. Space is the number of stored states unless the dependency pattern allows optimization.'],
      ['Common mistakes', 'Defining an incomplete state, writing an incorrect transition, forgetting base cases, mixing up dimensions, and optimizing space before validating the full DP.']
    ]
  },
  trie: {
    title: 'Trie & String Algorithms — Deep Explanation',
    sections: [
      ['Core idea', 'A trie stores strings character by character along paths. Shared prefixes share nodes, making prefix queries natural and often proportional to the string length rather than the number of stored words.'],
      ['How it works internally', 'Starting from the root, each character chooses an outgoing edge. A terminal marker records that a complete word ends at that node.'],
      ['Worked example', 'Insert "cat" and "car". The paths c → a are shared; the final nodes branch at t and r. Searching "ca" can also answer whether a prefix exists.'],
      ['Dry run', 'Insert "cat": root → c → a → t, mark t as terminal. Insert "car": root → c → a already exists, then create r and mark it terminal.'],
      ['Structured code example', `struct Node {
    Node* child[26] = {};
    bool terminal = false;
};

void insert(Node* root, const string& s) {
    Node* cur = root;

    for (char ch : s) {
        int id = ch - 'a';

        if (!cur->child[id]) {
            cur->child[id] = new Node();
        }

        cur = cur->child[id];
    }

    cur->terminal = true;
}`],
      ['String algorithm connection', 'Prefix matching, autocomplete, word search, KMP, Z-function and rolling/prefix hashing solve different string tasks. Choose based on whether you need prefixes, pattern positions, hashing comparisons or structural storage.'],
      ['Complexity and memory', 'Trie insert/search is typically O(L), where L is string length, but memory can be large because nodes may store many child pointers.'],
      ['Common mistakes', 'Forgetting the terminal marker, allocating huge child arrays unnecessarily, confusing prefix existence with complete-word existence, and ignoring memory usage.']
    ]
  }
};

const PROBLEM_SOLVING = {
  "title": "Problem Solving & Algorithmic Thinking",
  "summary": "Learn a repeatable process for turning a problem statement into a correct, efficient and testable solution.",
  "sections": [
    [
      "1. Understand the problem",
      "Read the statement twice. Identify inputs, outputs, constraints, edge cases and exactly what must be returned. Do not start coding until you can explain the problem in your own words."
    ],
    [
      "2. Build a small example",
      "Take a tiny input and solve it manually. This reveals the expected behavior and often exposes hidden conditions before implementation."
    ],
    [
      "3. Start with brute force",
      "Write the simplest correct approach first. Brute force gives you a correctness baseline and helps you see which operation is becoming too expensive."
    ],
    [
      "4. Find the bottleneck",
      "Count how many times the expensive operation runs. Nested loops, repeated searches, repeated sorting, recursion branches and large auxiliary structures are common bottlenecks."
    ],
    [
      "5. Choose the pattern",
      "Ask whether the problem looks like two pointers, sliding window, binary search, hashing, stack/queue, recursion, greedy, dynamic programming, graph traversal or a range-query structure."
    ],
    [
      "6. Prove the idea before coding",
      "State the invariant or reason the algorithm is correct. For example, in binary search the remaining interval must always contain every possible answer; in a sliding window the maintained window must satisfy its condition."
    ],
    [
      "7. Dry run line by line",
      "Use the smallest useful example and write the state after each important step. Track indexes, pointers, queue/stack contents, DP states or graph visits."
    ],
    [
      "Structured code example",
      "vector<int> a = {2, 7, 11, 15};\nint target = 9;\n\nunordered_map<int, int> seen;\n\nfor (int i = 0; i < a.size(); i++) {\n    int need = target - a[i];\n\n    if (seen.count(need)) {\n        cout << seen[need] << \" \" << i;\n        break;\n    }\n\n    seen[a[i]] = i;\n}"
    ],
    [
      "Why this is better than brute force",
      "Brute force checks every pair and takes O(n²). The hash-map approach remembers previously seen values, so each new value can be checked in average O(1), giving O(n) expected time with O(n) auxiliary space."
    ],
    [
      "Final checklist",
      "Before submitting: test empty/minimum input, maximum-size input, duplicates, already-sorted/reversed data, boundary indexes, negative values when allowed, and cases where the answer does not exist."
    ]
  ]
};

const DSA_INTRO = {
  title: 'Introduction to DSA',
  summary: 'Understand what Data Structures and Algorithms are, why they matter, where they are used, and how they help us build efficient software.',
  sections: [
    ['What is DSA?', 'DSA stands for Data Structures and Algorithms. A data structure is a way to organize and store data so we can work with it efficiently. An algorithm is a step-by-step method for solving a problem or performing a task. Together, they help us decide both how data should be stored and how it should be processed.'],
    ['Data Structure — simple meaning', 'Think of data as things you need to keep: names, marks, messages, locations, products or connections. A data structure decides how those things are arranged so operations such as searching, inserting, deleting and updating can be performed effectively.'],
    ['Hinglish: Data Structure kya hai?', 'Data Structure ko simple language me data ko arrange karne ka tareeka samjho. Jaise real life me books ko shelf par, files ko folders me aur people ko queue me arrange karte ho. Computer me bhi data ko situation ke hisaab se different structures me rakhte hain.'],
    ['Algorithm — simple meaning', 'An algorithm is a clear sequence of steps used to solve a problem. For example, finding a name in a list, sorting marks from highest to lowest, or finding the shortest route between two places all require a sequence of decisions.'],
    ['Hinglish: Algorithm kya hai?', 'Algorithm basically problem solve karne ke steps hain. Agar tum kisi ko chai banane ke exact steps bata rahe ho, woh ek simple real-life algorithm jaisa hai. Programming me ye steps precise aur executable hote hain.'],
    ['Why do we need DSA?', 'A program can produce the correct answer and still be inefficient. With a small input, an inefficient approach may look fine. As data grows, the difference becomes huge. DSA helps us choose structures and algorithms that use reasonable time and memory.'],
    ['Real-world example', 'A navigation system cannot try every possible road blindly. It represents locations and roads as a graph and uses path-finding algorithms. A search engine needs indexing structures and efficient search. A browser uses stacks and other structures for history, parsing and internal tasks.'],
    ['Where is DSA used?', 'DSA appears throughout software: search engines, databases, operating systems, compilers, networks, maps, social platforms, recommendation systems, games, AI systems and everyday applications. Even when you do not see a data structure directly, software is constantly organizing and processing data.'],
    ['How DSA helps a programmer', 'DSA improves problem-solving, helps you reason about performance, makes large inputs manageable, and gives you reusable patterns. It also helps you compare multiple solutions instead of accepting the first working solution.'],
    ['Time & Space Complexity — basic idea', 'Time complexity describes how the amount of work grows as input size grows. Space complexity describes how extra memory usage grows. You will commonly see O(1), O(log n), O(n), O(n log n) and O(n²). These are growth-rate descriptions, not exact stopwatch timings.'],
    ['Brute Force vs Efficient Approach', 'Brute force tries a straightforward solution, often exploring many possibilities. It is useful for understanding a problem and for small inputs. An efficient approach uses the structure of the problem to avoid unnecessary work—for example, binary search removes half the search space at each step.'],
    ['Main types of Data Structures', 'Linear structures arrange data in a sequence, such as arrays, linked lists, stacks and queues. Non-linear structures represent hierarchy or relationships, such as trees and graphs. Other useful categories include static vs dynamic and contiguous vs linked storage.'],
    ['Main algorithmic patterns', 'Common patterns include searching, sorting, traversal, divide and conquer, greedy algorithms, dynamic programming, backtracking, graph algorithms and string algorithms. Learning these patterns helps you recognize how a new problem can be approached.'],
    ['How DSA connects with programming', 'Programming gives you the language and tools to implement a solution; DSA gives you ways to structure data and reason about the solution. The same idea can be implemented in C++, Java, Python or JavaScript—the underlying data-structure and algorithmic reasoning remains the important part.'],
    ['What should you learn first?', 'Start with complexity basics and simple linear structures, then move through searching/sorting, linked lists, stacks/queues, trees, BSTs, heaps, graphs, dynamic programming and string structures. Along the way, practice problems and dry runs turn theory into problem-solving skill.'],
    ['Why companies and interviews care about DSA', 'DSA questions test more than memorized syntax. They reveal how you break down a problem, choose a representation, analyze trade-offs and build a correct solution. These skills also matter in real engineering when software must handle larger workloads efficiently.']
  ],
};

const VARIANT_DETAILS = {
  'Static Array': ['Fixed-size contiguous collection. Size is decided when the array is created.','Simple aur fast hota hai, lekin size fixed hota hai; random access O(1) milta hai.','Best for: fixed-size data, tables, small buffers.'],
  'Dynamic Array / Vector': ['Resizable array that grows when capacity is exhausted.','Vector ko flexible array samjho: end par add karna usually fast hota hai, aur zarurat par capacity badh sakti hai.','Best for: collections whose size changes during execution.'],
  'Vector of Primitive Values': ['A vector whose elements are built-in values such as int, double, char or bool.','Normal values ko dynamic contiguous storage me rakhte ho; vector ka size runtime par badh sakta hai.','Best for: numbers, flags, characters and general DSA arrays.'],
  'Vector of Strings': ['A vector where each element is a std::string.','Har position par ek complete string hoti hai; vector strings ko element storage me rakhta hai, while each string manages its own character storage.','Best for: word lists, names, tokens and text collections.'],
  'Vector of Pairs': ['A vector whose each element is a pair of two related values, such as {value, index}.','Har element ke andar first aur second fields hote hain; useful jab do values ko ek unit ki tarah store karna ho.','Best for: coordinates, graph edges, key-value-like records and sorting by one field.'],
  'Vector of Vectors (2D)': ['A vector whose elements are themselves vectors, forming a dynamic 2D structure.','Har row ka size alag ho sakta hai, isliye ye fixed 2D array se zyada flexible hai.','Best for: adjacency lists, jagged matrices and dynamic grids.'],
  'Vector of Objects / Structs': ['A vector that stores user-defined objects or structs as its elements.','Har vector element ek complete object hota hai jisme multiple fields ho sakte hain.','Best for: students, products, graph edges and records.'],
  'Vector of Pointers': ['A vector whose elements store addresses/pointers to other objects or nodes.','Vector pointers ko contiguous rakhta hai, lekin actual objects alag memory locations par ho sakte hain.','Best for: polymorphism, graph/tree node references and dynamically managed objects.'],
  'vector<bool> (Specialized)': ['A special standard-library vector<bool> specialization that stores boolean values in a bit-packed representation on common implementations.','Ye normal vector<int> jaisa simple element-reference behavior nahi deta; bits ko compactly store kar sakta hai.','Best for: memory-efficient boolean flags when its specialized behavior is acceptable.'],
  'Nested Vectors': ['A vector containing vectors to represent multiple dynamic dimensions.','vector<vector<int>> se 2D aur vector<vector<vector<int>>> se 3D-style dynamic structures bana sakte ho.','Best for: variable-size matrices, DP states and multi-level collections.'],
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
  'Prefix Hashing': ['Uses hashes of prefixes to compare or query strings efficiently.','Prefix information ko numeric hash me represent karke substring/prefix comparisons fast kiye ja sakte hain, with collision considerations.','Best for: string matching and fast equality checks.'],
  'Hash Table': ['A bucket-based key-value structure that uses hashing to locate entries quickly.','Key ko hash karke bucket milta hai, jisse average lookup fast hota hai.','Best for: fast key-value lookup and caching.'],
  'Hash Map': ['A map implementation where keys are hashed rather than kept in sorted order.','Hash map me key se value quickly milti hai; sorted order guaranteed nahi hota.','Best for: frequency maps and fast lookup.'],
  'Hash Set': ['A hash-based collection that stores unique keys.','Membership check fast hota hai aur duplicate values store nahi hoti.','Best for: duplicate detection and membership checks.'],
  'Collision Handling': ['Techniques used when different keys map to the same bucket.','Do keys same bucket me aa sakti hain; chaining ya probing se collision handle karte hain.','Best for: understanding hash table internals.'],
  'Frequency Map': ['A hash map from a value to the number of times it appears.','Har element ki counting store karne ka simple pattern hai.','Best for: frequency, anagram and duplicate problems.'],

  'Direct Recursion': ['A function directly calls itself on a smaller or changed input.','Function khud ko smaller problem ke saath call karta hai aur base case par rukta hai.','Best for: trees and recursive definitions.'],
  'Tail Recursion': ['The recursive call is the final operation of the function.','Last operation recursive call hota hai; optimization language/runtime par depend karti hai.','Best for: recursive loops where supported.'],
  'Divide & Conquer': ['Split a problem, solve parts independently, then combine the results.','Problem ko parts me todkar solve karke answers combine karte hain.','Best for: merge sort and recursive search.'],
  'Backtracking': ['Search by making a choice, exploring it, then undoing it.','Choice lo, explore karo, galat ho to undo karke next option try karo.','Best for: subsets and constraint problems.'],
  'Memoized Recursion': ['Recursive states are cached so repeated states are solved once.','Same subproblem dobara aaye to stored answer use karte hain.','Best for: recursive DP.'],
  'Activity Selection': ['Select maximum compatible activities by choosing earliest finishing activities.','Sabse pehle finish hone wali compatible activity choose karna key greedy idea hai.','Best for: interval scheduling.'],
  'Fractional Knapsack': ['Items may be divided, so highest value/weight ratio is chosen first.','Item tod sakte ho, isliye value/weight ratio ke basis par greedy choice kaam karti hai.','Best for: divisible knapsack.'],
  'Huffman Coding': ['A greedy compression method that combines the two least frequent nodes repeatedly.','Least-frequency nodes ko combine karke prefix-code tree banate hain.','Best for: lossless compression.'],
  'Interval Scheduling': ['Choose a maximum compatible set of intervals using a proven ordering.','Intervals ko finish time ke order me process karke compatible ones choose karte hain.','Best for: scheduling conflicts.'],
  'Greedy Graph Algorithms': ['Graph algorithms such as Kruskal and Prim use greedy edge choices under correctness proofs.','MST me valid cheapest edge choices repeatedly select karte hain.','Best for: minimum spanning trees.'],
  'Bitwise AND/OR/XOR': ['Binary operators that combine corresponding integer bits.','Har bit position par AND, OR ya XOR apply hota hai.','Best for: masks and parity.'],
  'Bit Shifting': ['Move binary bits left or right by selected positions.','Bits ko left/right shift karke positions change karte hain.','Best for: masks and bit operations.'],
  'Bit Mask': ['An integer whose bits represent selected states.','Integer ke bits ko flags ya subset representation ki tarah use karte hain.','Best for: subset states and flags.'],
  'Set/Clear/Toggle Bit': ['Mask operations that turn a bit on, off or invert it.','OR se set, AND se clear aur XOR se toggle kar sakte ho.','Best for: bit-level state changes.'],
  'Bitmask Enumeration': ['Enumerate subsets using binary integer masks.','0 se 2^n-1 tak masks se subsets represent kar sakte ho.','Best for: subset problems and bitmask DP.'],
  'Union-Find': ['Another name for DSU, maintaining disjoint connected components.','Har component ka representative maintain karke groups merge karta hai.','Best for: connectivity and Kruskal.'],
  'Path Compression': ['Make DSU nodes point closer to the representative during find.','Find ke time parent ko root ke paas set karke future find fast karte hain.','Best for: repeated DSU queries.'],
  'Union by Rank': ['Attach the lower-rank tree below the higher-rank tree.','Chhote rank wale tree ko bade rank ke root ke neeche attach karte hain.','Best for: keeping DSU shallow.'],
  'Union by Size': ['Attach the smaller component under the larger component.','Chhote component ko bade component ke root ke neeche attach karte hain.','Best for: efficient DSU merging.'],
  'Segment Tree': ['An interval tree supporting many range queries and updates in O(log n).','Array ko intervals me todkar partial answers store karta hai.','Best for: dynamic range queries.'],
  'Lazy Propagation': ['Delay range updates until a segment must be pushed to its children.','Pending update store karke zarurat par children ko push karte hain.','Best for: range updates and queries.'],
  'Fenwick Tree / BIT': ['A compact binary-indexed structure for prefix aggregates and updates in O(log n).','Prefix sum ko binary jumps se maintain karta hai.','Best for: dynamic prefix sums and frequencies.'],
  'Range Sum Query': ['Find the aggregate sum over an interval.','Kisi range ka total sum efficiently nikalna.','Best for: Fenwick and segment trees.'],
  'Range Minimum Query': ['Find the minimum value in an interval.','Kisi range ka minimum quickly nikalna.','Best for: segment trees and sparse tables.'],

};

function TopicCard({ topic, onOpen, isBright }) {
  return (
    <button
      type="button"
      onClick={() => onOpen(topic)}
      className={`w-full min-w-0 text-left p-5 rounded-2xl border transition-all hover:-translate-y-0.5 hover:border-cyan-400/60 hover:shadow-lg cursor-pointer ${
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

const VARIANT_GROUPS = {
  arrays: [
    ['Arrays', ['Static Array', '2D Array', 'Multidimensional Array']],
    ['Vectors', ['Dynamic Array / Vector', 'Vector of Primitive Values', 'Vector of Strings', 'Vector of Pairs', 'Vector of Vectors (2D)', 'Vector of Objects / Structs', 'Vector of Pointers', 'vector<bool> (Specialized)', 'Nested Vectors']],
  ],
  'sorting-searching': [
    ['Searching', ['Linear Search', 'Binary Search']],
    ['Sorting', ['Bubble Sort', 'Selection Sort', 'Insertion Sort', 'Merge Sort', 'Quick Sort', 'Heap Sort']],
  ],
  'linked-lists': [
    ['Linear Linked Lists', ['Singly Linked List', 'Doubly Linked List']],
    ['Circular Linked Lists', ['Circular Singly Linked List', 'Circular Doubly Linked List']],
    ['Advanced Linked List', ['Skip List']],
  ],
  'stacks-queues': [
    ['Stacks', ['Array Stack', 'Linked Stack', 'Monotonic Stack']],
    ['Queues', ['Circular Queue', 'Deque']],
    ['Priority-based', ['Priority Queue']],
  ],
  'binary-trees': [
    ['Structural Types', ['Full Binary Tree', 'Complete Binary Tree', 'Perfect Binary Tree']],
    ['Shape & Balance', ['Balanced Tree', 'Skewed / Degenerate Tree']],
  ],
  bst: [
    ['BST Variants', ['Unbalanced BST', 'Balanced BST']],
    ['Self-Balancing BSTs', ['AVL Tree', 'Red-Black Tree']],
  ],
  heaps: [
    ['Heap Variants', ['Min Heap', 'Max Heap', 'Binary Heap', 'd-ary Heap']],
    ['Priority Queue', ['Priority Queue']],
  ],
  graphs: [
    ['Edge & Direction Types', ['Directed', 'Undirected', 'Weighted', 'Unweighted']],
    ['Special Graph Classes', ['DAG', 'Bipartite', 'Complete', 'Connected']],
  ],
  'dynamic-programming': [
    ['DP Approaches', ['Top-down Memoization', 'Bottom-up Tabulation', 'Space-Optimized DP']],
    ['DP State Dimensions', ['1D DP', '2D DP', 'Bitmask DP', 'Tree DP']],
  ],
  trie: [
    ['Trie Structures', ['Standard Trie', 'Compressed Trie / Radix Tree', 'Ternary Search Tree']],
    ['String Hashing', ['Prefix Hashing']],
  ],
  hashing: [
    ['Hash Structures', ['Hash Table', 'Hash Map', 'Hash Set']],
    ['Hashing Techniques', ['Collision Handling', 'Frequency Map']],
  ],
  'recursion-backtracking': [
    ['Recursion Forms', ['Direct Recursion', 'Tail Recursion', 'Memoized Recursion']],
    ['Problem-Solving Patterns', ['Divide & Conquer', 'Backtracking']],
  ],
  greedy: [
    ['Classic Greedy Problems', ['Activity Selection', 'Fractional Knapsack', 'Huffman Coding', 'Interval Scheduling']],
    ['Graph Greedy', ['Greedy Graph Algorithms']],
  ],
  'bit-manipulation': [
    ['Bitwise Operations', ['Bitwise AND/OR/XOR', 'Bit Shifting']],
    ['Bit Techniques', ['Bit Mask', 'Set/Clear/Toggle Bit', 'Bitmask Enumeration']],
  ],
  'disjoint-set': [
    ['Core Structure', ['Union-Find']],
    ['Optimization Techniques', ['Path Compression', 'Union by Rank', 'Union by Size']],
  ],
  'segment-fenwick-trees': [
    ['Segment Tree Variants', ['Segment Tree', 'Lazy Propagation']],
    ['Fenwick Tree & Range Queries', ['Fenwick Tree / BIT', 'Range Sum Query', 'Range Minimum Query']],
  ],
};

function DetailSection({ title, icon, children, isBright }) {
  return (
    <section className={`min-w-0 rounded-2xl border p-5 ${isBright ? 'bg-white border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-cyan-400">{icon}</span>
        <h2 className={`text-sm font-bold uppercase tracking-wider ${isBright ? 'text-cyan-700' : 'text-cyan-300'}`}>{title}</h2>
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
  const [showIntro, setShowIntro] = useState(false);
  const [showComplexity, setShowComplexity] = useState(false);
  const [showMemory, setShowMemory] = useState(false);
  const [showProblemSolving, setShowProblemSolving] = useState(false);
  const [revealedComplexity, setRevealedComplexity] = useState({});
  const scrollRef = useRef(null);
  const listScrollTopRef = useRef(0);

  useLayoutEffect(() => {
    const frame = requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({
        top: selected || showIntro || showComplexity || showMemory || showProblemSolving ? 0 : listScrollTopRef.current,
        left: 0,
        behavior: 'auto',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [selected, showIntro, showComplexity, showMemory, showProblemSolving]);

  const openTopic = (topic) => {
    listScrollTopRef.current = scrollRef.current?.scrollTop || 0;
    setSelectedVariant(null);
    setSelected(topic);
  };

  const openIntro = () => {
    listScrollTopRef.current = scrollRef.current?.scrollTop || 0;
    setSelected(null);
    setSelectedVariant(null);
    setShowComplexity(false);
    setShowIntro(true);
  };

  const openComplexity = () => {
    listScrollTopRef.current = scrollRef.current?.scrollTop || 0;
    setSelected(null);
    setSelectedVariant(null);
    setShowIntro(false);
    setShowMemory(false);
    setShowComplexity(true);
  };

  const openMemory = () => {
    listScrollTopRef.current = scrollRef.current?.scrollTop || 0;
    setSelected(null);
    setSelectedVariant(null);
    setShowIntro(false);
    setShowComplexity(false);
    setShowMemory(true);
  };

  const openProblemSolving = () => {
    listScrollTopRef.current = scrollRef.current?.scrollTop || 0;
    setSelected(null);
    setSelectedVariant(null);
    setShowIntro(false);
    setShowComplexity(false);
    setShowMemory(false);
    setShowProblemSolving(true);
  };

  const openVariant = (type) => {
    setSelectedVariant(type);
  };

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

  if (showProblemSolving) {
    return (
      <div ref={scrollRef} key="dsa-problem-solving" className={`h-[calc(100dvh-62px)] min-h-0 overflow-y-auto p-4 md:p-8 ${isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'}`}>
        <div className="max-w-6xl mx-auto space-y-5">
          <button onClick={() => setShowProblemSolving(false)} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 cursor-pointer">
            <ArrowLeft size={15} /> Back to DSA Learning
          </button>
          <div className={`p-6 rounded-2xl border ${isBright ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'}`}>
            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">04 · FOUNDATION</span>
            <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">{PROBLEM_SOLVING.title}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-400">{PROBLEM_SOLVING.summary}</p>
          </div>
          <div className="space-y-4">
            {PROBLEM_SOLVING.sections.map(([heading, content]) => (
              <DetailSection key={heading} title={heading} icon={<Brain size={16} />} isBright={isBright}>
                {heading === 'Structured code example'
                  ? <pre className="max-w-full overflow-x-auto rounded-lg border border-slate-800 bg-black/30 p-4 text-xs leading-7 text-cyan-200 font-mono whitespace-pre">{content}</pre>
                  : <p className="text-sm leading-7 text-slate-400">{content}</p>}
              </DetailSection>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showIntro) {
    return (
      <div ref={scrollRef} key={showIntro ? 'dsa-intro' : selected ? `dsa-topic-${selected.id}` : 'dsa-list'} className={`h-[calc(100dvh-62px)] min-h-0 overflow-y-auto p-4 md:p-8 ${isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'}`}>
        <div className="max-w-6xl mx-auto space-y-5">
          <button onClick={() => setShowIntro(false)} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 cursor-pointer"><ArrowLeft size={15} /> Back to DSA Learning</button>
          <div className={`p-6 rounded-2xl border ${isBright ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'}`}>
            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">Start Here</span>
            <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">{DSA_INTRO.title}</h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-400">{DSA_INTRO.summary}</p>
          </div>
          <div className="relative">
            <div className="absolute left-5 top-10 bottom-10 w-px bg-cyan-500/15 hidden md:block" />
            <div className="space-y-4">
              {DSA_INTRO.sections.map(([title, body], index) => (
                <div key={title} className="relative md:pl-14">
                  <div className="absolute left-0 top-5 z-10 hidden md:flex w-10 h-10 rounded-full items-center justify-center bg-[#070b14] border border-cyan-500/40 text-cyan-300 text-xs font-bold">{String(index + 1).padStart(2, '0')}</div>
                  <section className={`rounded-2xl border p-5 md:p-6 transition-all hover:border-cyan-500/25 ${isBright ? 'bg-white border-slate-200' : 'bg-slate-900/55 border-slate-800'}`}>
                    <div className="flex items-center gap-3">
                      <span className="md:hidden flex w-8 h-8 rounded-full items-center justify-center bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px] font-bold">{String(index + 1).padStart(2, '0')}</span>
                      <h2 className={`text-sm md:text-base font-bold ${isBright ? 'text-cyan-700' : 'text-cyan-300'}`}>{title}</h2>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-400">{body}</p>
                  </section>
                </div>
              ))}
            </div>
          </div>
          <div className={`p-6 rounded-2xl border ${isBright ? 'bg-cyan-50 border-cyan-200' : 'bg-cyan-950/20 border-cyan-900/50'}`}>
            <div className="flex items-center gap-3"><span className="text-xl">🚀</span><h3 className="font-bold">Ready to start DSA?</h3></div>
            <p className="mt-2 text-sm leading-7 text-slate-400">Now that the foundation is clear, start with Arrays & Vectors and move forward step by step. Each topic goes deeper with examples, dry runs, code, Hinglish explanations and practical guidance.</p>
            <button onClick={() => setShowIntro(false)} className="mt-4 px-4 py-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 cursor-pointer">Start Learning →</button>
          </div>
        </div>
      </div>
    );
  }


  if (showMemory) {
    const memoryExamples = [
      ['M1 — A normal variable', `int x = 10;`, 'A fixed-size int is stored in memory. The variable name x refers to that storage.', 'Fixed-size local variable → usually O(1) extra space.'],
      ['M2 — Pointer stores an address', `int x = 10;
int* p = &x;`, 'x stores 10. p stores the address of x. *p accesses the value at that address.', 'A fixed number of variables → O(1) auxiliary space.'],
      ['M3 — Dynamic allocation', `int* p = new int(10);
delete p;`, 'new asks dynamic storage for an object and returns its address. delete releases that object.', 'One dynamically allocated int → O(1) extra space.'],
      ['M4 — Linked-list node', `Node* node = new Node(10);
node->next = nullptr;`, 'A Node contains data plus a link/reference. node is a pointer holding the node address.', 'n nodes need O(n) total storage plus per-node link overhead.'],
      ['M5 — Array vs linked list', `int a[4] = {10,20,30,40};`, 'Array elements are contiguous in the usual model. Linked-list nodes can live at unrelated addresses and connect through pointers.', 'Both store n values, but linked lists need extra link/reference storage.'],
      ['M6 — Vector growth', `vector<int> v;
v.push_back(10);
v.push_back(20);`, 'A vector has size and capacity. When capacity is exhausted it may allocate a larger block and move/copy elements.', 'Append is commonly amortized O(1), with occasional O(n) resize work.'],
      ['M7 — Recursion stack', `int fact(int n) {
  if (n <= 1) return 1;
  return n * fact(n-1);
}`, 'Each active recursive call needs a stack frame. The frames remain active until the base case returns.', 'A linear recursion chain has O(n) auxiliary stack space.'],
      ['M8 — Tree nodes', `root->left = new Node(5);
root->right = new Node(15);`, 'Each dynamically allocated tree node has its own storage. Child pointers connect the objects.', 'A tree with n nodes uses O(n) node storage.'],
      ['M9 — Graph representations', `vector<vector<int>> adj(V);`, 'An adjacency list stores neighbors for each vertex. An adjacency matrix stores a V×V table.', 'Adjacency list: O(V+E); adjacency matrix: O(V²).'],
      ['M10 — Memory leak', `int* p = new int(10);
p = nullptr;`, 'The allocation still exists, but the only pointer to it was lost. That storage cannot be released through p.', 'A memory leak wastes allocated storage.'],
      ['M11 — Dangling pointer', `int* p = new int(10);
delete p;
// p is now dangling`, 'delete releases the allocation. The old pointer must not be dereferenced afterwards.', 'Using a released object is invalid.'],
      ['M12 — Shallow vs deep copy', `Node* a = new Node(10);
Node* b = a;`, 'This copies the address, so a and b refer to the same node. A deep copy creates separate storage.', 'Pointer assignment is O(1); cloning n nodes is generally O(n).'],
    ];

    return (
      <div ref={scrollRef} key="dsa-memory" className="h-[calc(100dvh-62px)] min-h-0 overflow-y-auto p-4 md:p-8 bg-[#070b14] text-slate-100">
        <div className="max-w-6xl mx-auto space-y-5">
          <button onClick={() => setShowMemory(false)} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 cursor-pointer"><ArrowLeft size={15} /> Back to DSA Learning</button>
          <div className="p-6 rounded-2xl border bg-slate-900/70 border-slate-800">
            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">03 · UNDERSTAND THIS</span>
            <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">Memory &amp; Memory Management</h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-400">Understand where data lives, how addresses and pointers work, how dynamic memory is allocated, and why linked lists, trees, graphs and recursion use memory the way they do.</p>
          </div>

          <DetailSection title="What is Computer Memory?" icon={<HardDrive size={16} />} isBright={isBright}>
            <p className="text-sm leading-7 text-slate-400">Computer memory is the storage area a running program uses for instructions, variables, objects and temporary data. Every memory location has an address. A variable is a name associated with a region of storage.</p>
            <div className="mt-4 grid md:grid-cols-4 gap-3">
              {[
                ['Code / Text', 'Program instructions.', 'Conceptual program-instruction area.'],
                ['Global / Static', 'Data whose lifetime is the whole program.', 'Global and static objects.'],
                ['Stack', 'Automatic call frames and local data.', 'Function calls and recursion.'],
                ['Heap / Free Store', 'Runtime-dynamic storage.', 'new/delete in C++; dynamically managed objects.'],
              ].map(([a,b,d]) => <div key={a} className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10"><h3 className="text-sm font-bold text-cyan-300">{a}</h3><p className="mt-2 text-xs leading-6 text-slate-400">{b}</p><p className="mt-2 text-[11px] text-slate-500">{d}</p></div>)}
            </div>
            <p className="mt-4 text-xs leading-6 text-slate-500">Exact layout differs by operating system, compiler and runtime; this is a conceptual model, not a promise of exact physical addresses.</p>
          </DetailSection>

          <DetailSection title="Stack vs Heap — Beginner Mental Model" icon={<Layers3 size={16} />} isBright={isBright}>
            <div className="grid md:grid-cols-2 gap-4 min-w-0">
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10"><h3 className="font-bold text-cyan-300">Stack</h3><ul className="mt-2 space-y-2 text-sm text-slate-400"><li>• Function-call frames and automatic local storage.</li><li>• Lifetime is tied to scope/call in the usual model.</li><li>• Limited resource; deep recursion can overflow it.</li></ul></div>
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10"><h3 className="font-bold text-purple-300">Heap / Free Store</h3><ul className="mt-2 space-y-2 text-sm text-slate-400"><li>• Runtime-dynamic storage.</li><li>• Lifetime can outlive the function that created it.</li><li>• Manual lifetime mistakes can cause leaks or dangling pointers.</li></ul></div>
            </div>
          </DetailSection>

          <DetailSection title="Addresses, Variables &amp; Pointers" icon={<Target size={16} />} isBright={isBright}>
            <p className="text-sm leading-7 text-slate-400">Suppose <span className="font-mono text-cyan-300">int x = 10;</span>. If an example address is 1000, then <span className="font-mono text-cyan-300">&amp;x</span> means “address of x”.</p>
            <pre className="mt-3 p-4 rounded-xl bg-black/30 border border-slate-800 text-xs leading-7 text-cyan-200 font-mono whitespace-pre overflow-x-auto max-w-full box-border">Address     Value
1000        10       ← x</pre>
            <p className="mt-3 text-sm leading-7 text-slate-400"><span className="font-mono text-cyan-300">int* p = &amp;x;</span> makes p hold x's address. <span className="font-mono text-cyan-300">*p</span> means “the value stored at the address p points to”.</p>
            <pre className="mt-3 p-4 rounded-xl bg-black/30 border border-slate-800 text-xs leading-7 text-cyan-200 font-mono whitespace-pre overflow-x-auto max-w-full box-border">x
┌─────────┐
│   10    │  address 1000
└─────────┘
     ▲
     │
p ───┘      p contains 1000</pre>
          </DetailSection>

          <DetailSection title="Dynamic Memory Allocation — new &amp; delete" icon={<ChevronRight size={16} />} isBright={isBright}>
            <p className="text-sm leading-7 text-slate-400">In C++, <span className="font-mono text-cyan-300">new</span> creates an object in dynamically managed storage and returns its address. <span className="font-mono text-cyan-300">delete</span> releases a single object created with matching scalar new. For arrays created with <span className="font-mono text-cyan-300">new[]</span>, use matching <span className="font-mono text-cyan-300">delete[]</span>.</p>
            <pre className="mt-3 p-4 rounded-xl bg-black/30 border border-slate-800 text-xs leading-7 text-cyan-200 font-mono whitespace-pre overflow-x-auto max-w-full box-border">int* p = new int(10);

Stack                 Dynamic storage
p ─────────────────► [ 10 ]

delete p;</pre>
            <p className="mt-3 text-sm leading-7 text-slate-400">In modern C++, prefer RAII and smart pointers such as <span className="font-mono text-cyan-300">std::unique_ptr</span> when ownership should be automatic.</p>
          </DetailSection>

          <DetailSection title="Linked List — Exactly How Memory Gets Allocated" icon={<BookOpen size={16} />} isBright={isBright}>
            <p className="text-sm leading-7 text-slate-400">A node normally stores its data plus one or more link/reference fields. Nodes can be allocated separately, so their addresses do not have to be adjacent.</p>
            <pre className="mt-3 p-4 rounded-xl bg-black/30 border border-slate-800 text-xs leading-7 text-cyan-200 font-mono whitespace-pre overflow-x-auto max-w-full box-border">Node* first = new Node(10);
Node* second = new Node(20);
first-&gt;next = second;

Stack                         Dynamic storage
first ─────────────────────► [ data=10 | next=addr(second) ]
second ────────────────────► [ data=20 | next=nullptr ]

first -&gt; second -&gt; nullptr</pre>
            <ol className="mt-4 space-y-2 list-decimal list-inside text-sm leading-7 text-slate-400">
              <li><span className="text-cyan-400 font-semibold">new Node(10):</span> allocates one Node and returns its address.</li>
              <li><span className="text-cyan-400 font-semibold">first:</span> stores that address.</li>
              <li><span className="text-cyan-400 font-semibold">second:</span> stores the second node's address.</li>
              <li><span className="text-cyan-400 font-semibold">first-&gt;next = second:</span> copies the second node's address into the first node's link field.</li>
              <li>Following next pointers lets us travel between separately allocated nodes.</li>
            </ol>
          </DetailSection>

          <DetailSection title="Array vs Linked List — Memory Layout" icon={<Layers3 size={16} />} isBright={isBright}>
            <div className="grid md:grid-cols-2 gap-4 min-w-0">
              <div><h3 className="text-sm font-bold text-cyan-300">Array — contiguous storage</h3><pre className="mt-2 p-3 rounded-lg bg-black/30 border border-slate-800 text-xs text-cyan-200 font-mono whitespace-pre overflow-x-auto max-w-full box-border">[10][20][30][40]
1000 1004 1008 1012</pre><p className="mt-2 text-xs leading-6 text-slate-400">Conceptually adjacent fixed-size elements help O(1) indexing and cache locality.</p></div>
              <div><h3 className="text-sm font-bold text-purple-300">Linked list — linked storage</h3><pre className="mt-2 p-3 rounded-lg bg-black/30 border border-slate-800 text-xs text-cyan-200 font-mono">[10 | 5000]    [20 | 2300]    [30 | null]
 1000            5000            2300</pre><p className="mt-2 text-xs leading-6 text-slate-400">Nodes may be far apart. Each link stores where the next node is.</p></div>
            </div>
          </DetailSection>

          <DetailSection title="Vector Memory — Size vs Capacity" icon={<Layers3 size={16} />} isBright={isBright}>
            <p className="text-sm leading-7 text-slate-400">C++ vector tracks <span className="font-semibold text-cyan-300">size</span> (elements stored) and <span className="font-semibold text-cyan-300">capacity</span> (storage currently available). Capacity can exceed size.</p>
            <pre className="mt-3 p-4 rounded-xl bg-black/30 border border-slate-800 text-xs leading-7 text-cyan-200 font-mono whitespace-pre overflow-x-auto max-w-full box-border">size = 4
capacity = 4
[10][20][30][40]

push_back(50)
→ allocate larger block
→ move/copy elements
→ release old block
→ size becomes 5</pre>
            <p className="mt-3 text-sm leading-7 text-slate-400">The occasional O(n) resize is why append is commonly <span className="text-cyan-300 font-semibold">amortized O(1)</span>, not literally O(1) for every call.</p>
          </DetailSection>

          <DetailSection title="Trees, Graphs &amp; Recursion — Memory Connection" icon={<Brain size={16} />} isBright={isBright}>
            <div className="space-y-4">
              <div><h3 className="text-sm font-bold text-cyan-300">Trees</h3><p className="mt-1 text-sm leading-6 text-slate-400">Each node stores its value plus child pointers/references. n nodes therefore require O(n) node storage.</p></div>
              <div><h3 className="text-sm font-bold text-cyan-300">Graphs</h3><p className="mt-1 text-sm leading-6 text-slate-400">Adjacency list storage is typically O(V+E); an adjacency matrix needs O(V²).</p></div>
              <div><h3 className="text-sm font-bold text-cyan-300">Recursion</h3><p className="mt-1 text-sm leading-6 text-slate-400">Every active recursive call consumes stack-frame space. A linear chain has O(n) stack space; balanced divide-and-conquer can have O(log n) depth.</p></div>
            </div>
          </DetailSection>

          <DetailSection title="Memory Leaks, Dangling Pointers &amp; Ownership" icon={<X size={16} />} isBright={isBright}>
            <div className="space-y-3">
              {[
                ['Memory leak', 'Allocated storage becomes unreachable, so the program cannot release it through the lost pointer.', 'int* p = new int(10); p = nullptr;'],
                ['Dangling pointer', 'A pointer still contains an old address after the object has been released.', 'delete p; then dereferencing p is invalid.'],
                ['Double delete', 'The same allocation is released more than once, which is undefined behavior in C++.', 'Never delete the same object twice.'],
                ['Ownership', 'Ask which part of the program is responsible for keeping an object alive and releasing it.', 'RAII and smart pointers make ownership explicit.'],
              ].map(([a,b,d]) => <div key={a} className="p-4 rounded-xl bg-rose-500/5 border border-rose-500/10"><h3 className="text-sm font-bold text-rose-300">{a}</h3><p className="mt-1 text-sm leading-6 text-slate-400">{b}</p><p className="mt-2 text-xs font-mono text-slate-500">{d}</p></div>)}
            </div>
          </DetailSection>

          <DetailSection title="Shallow Copy vs Deep Copy" icon={<Layers3 size={16} />} isBright={isBright}>
            <div className="grid md:grid-cols-2 gap-4 min-w-0">
              <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10"><h3 className="font-bold text-amber-300">Shallow copy</h3><p className="mt-2 text-sm leading-6 text-slate-400">Copies pointer values/addresses, so two pointers can refer to the same dynamically allocated resource.</p><pre className="mt-3 p-3 rounded-lg bg-black/30 text-xs text-cyan-200 font-mono whitespace-pre overflow-x-auto max-w-full box-border">Node* a = new Node(10);
Node* b = a;
// same node</pre></div>
              <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10"><h3 className="font-bold text-emerald-300">Deep copy</h3><p className="mt-2 text-sm leading-6 text-slate-400">Creates independent storage for the copied object/resource. A linked structure may need every node cloned.</p><pre className="mt-3 p-3 rounded-lg bg-black/30 text-xs text-cyan-200 font-mono whitespace-pre overflow-x-auto max-w-full box-border">Node* b = cloneList(a);
// separate nodes</pre></div>
            </div>
          </DetailSection>

          <DetailSection title="Pass by Value vs Reference vs Pointer" icon={<Target size={16} />} isBright={isBright}>
            <div className="space-y-3">
              {[
                ['Pass by value', 'void f(int x)', 'Function receives a separate value. Changing x does not directly change the caller variable.'],
                ['Pass by reference', 'void f(int& x)', 'x becomes another name for the caller variable in C++.'],
                ['Pass by pointer', 'void f(int* p)', 'Function receives an address and can access the pointed-to object through *p.'],
              ].map(([a,b,d]) => <div key={a} className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10"><h3 className="text-sm font-bold text-cyan-300">{a}</h3><pre className="mt-2 text-xs font-mono text-purple-300">{b}</pre><p className="mt-1 text-sm leading-6 text-slate-400">{d}</p></div>)}
            </div>
          </DetailSection>

          <DetailSection title="Guided Memory Practice — Think First" icon={<CheckCircle2 size={16} />} isBright={isBright}>
            <div className="space-y-4">
              {memoryExamples.map(([title,code,question,answer]) => <div key={title} className="p-4 rounded-xl border bg-black/20 border-slate-800"><h3 className="text-sm font-bold text-cyan-300">{title}</h3><pre className="mt-3 p-3 rounded-lg bg-black/30 border border-slate-800 text-xs leading-6 text-cyan-200 font-mono whitespace-pre overflow-x-auto max-w-full box-border">{code}</pre><p className="mt-3 text-sm font-semibold text-slate-200">{question}</p><div className="mt-2 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10"><p className="text-sm leading-6 text-slate-400"><span className="text-emerald-300 font-semibold">Answer:</span> {answer}</p></div></div>)}
            </div>
          </DetailSection>

          <div className="p-6 rounded-2xl border bg-cyan-950/20 border-cyan-900/50">
            <div className="flex items-center gap-3"><span className="text-xl">🧠</span><h3 className="font-bold">Mental model to remember</h3></div>
            <p className="mt-2 text-sm leading-7 text-slate-400">A variable is storage; an address tells you where that storage is; a pointer stores an address; a dynamically allocated object lives in dynamic storage for its lifetime; data structures connect or organize these objects. Once this picture is clear, linked lists, trees, graphs and recursion become much easier to reason about.</p>
          </div>
        </div>
      </div>
    );
  }

  if (showComplexity) {
    const complexityRows = [
      ['O(1) — Constant', 'Time/Space stays roughly the same as input grows.', 'Array index access: a[5], stack push/pop, hash lookup on average.', 'One direct operation → O(1).'],
      ['O(log n) — Logarithmic', 'Work grows slowly because the problem is repeatedly divided by a constant factor.', 'Binary search, heap height, balanced BST search.', 'If n becomes half each iteration → O(log n).'],
      ['O(√n) — Square Root', 'The number of iterations grows as the square root of n.', 'Trial division up to √n for checking primality.', 'Loop while i*i <= n → O(√n).'],
      ['O(n) — Linear', 'Work grows directly with the number of input elements.', 'Linear search, array traversal, finding min/max.', 'One full pass over n items → O(n).'],
      ['O(n log n) — Linearithmic', 'A linear amount of work is performed across logarithmic levels.', 'Merge sort, heap sort, efficient divide-and-conquer sorting.', 'n work per level × log n levels → O(n log n).'],
      ['O(n²) — Quadratic', 'Work grows with the square of input size.', 'Nested loops over the same n elements, bubble sort worst case.', 'n × n iterations → O(n²).'],
      ['O(n³) — Cubic', 'Three independent n-sized loops multiply their work.', 'Checking every triple, some matrix algorithms.', 'n × n × n → O(n³).'],
      ['O(nᵏ) — Polynomial', 'A fixed number k of nested n-sized loops gives polynomial growth.', 'O(n⁴), O(n⁵) style brute-force algorithms.', 'k independent loops → O(nᵏ).'],
      ['O(2ⁿ) — Exponential', 'Work roughly doubles when one more input item is added.', 'Generating all subsets, naive recursive Fibonacci.', 'Two recursive branches for each item → often O(2ⁿ).'],
      ['O(n!) — Factorial', 'Work grows extremely fast because all permutations are explored.', 'Generating all permutations by brute force.', 'n choices × (n−1) × ... × 1 → O(n!).'],
    ];

    return (
      <div ref={scrollRef} key="dsa-complexity" className={`h-[calc(100dvh-62px)] min-h-0 overflow-y-auto p-4 md:p-8 ${isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'}`}>
        <div className="max-w-6xl mx-auto space-y-5">
          <button onClick={() => setShowComplexity(false)} className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-cyan-400 cursor-pointer"><ArrowLeft size={15} /> Back to DSA Learning</button>

          <div className={`p-6 rounded-2xl border ${isBright ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'}`}>
            <span className="inline-flex px-2.5 py-1 rounded-full text-[10px] font-mono text-cyan-300 bg-cyan-500/10 border border-cyan-500/20">02 · LEARN THIS NEXT</span>
            <h1 className="mt-3 text-2xl md:text-3xl font-extrabold">Time & Space Complexity</h1>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-400">Learn how to measure algorithm efficiency, find Big-O from code, understand every important complexity class, and compare brute-force and optimized solutions.</p>
          </div>

          <DetailSection title="What is Time Complexity?" icon={<Clock3 size={16} />} isBright={isBright}>
            <p className="text-sm leading-7 text-slate-400">Time complexity describes how the number of basic operations performed by an algorithm grows as the input size n grows. It is not normally the exact clock time in seconds; it is a growth-rate model that lets us compare algorithms independent of machine speed.</p>
            <p className="mt-3 text-sm leading-7 text-slate-400"><span className="font-semibold text-cyan-400">Simple idea:</span> If an algorithm checks every element once, its work grows with n → O(n). If it keeps cutting the search space in half, its work grows with log n → O(log n).</p>
          </DetailSection>

          <DetailSection title="What is Space Complexity?" icon={<HardDrive size={16} />} isBright={isBright}>
            <p className="text-sm leading-7 text-slate-400">Space complexity describes how much memory an algorithm needs as n grows. Always separate <span className="font-semibold text-cyan-400">input space</span> from <span className="font-semibold text-cyan-400">auxiliary space</span> when discussing algorithms.</p>
            <ul className="mt-3 space-y-2">{[
              'O(1) auxiliary space: only a fixed number of variables are used.',
              'O(n) auxiliary space: an extra array/list of size n is created.',
              'O(log n) auxiliary space: common in balanced recursion such as binary search.',
              'Recursion stack counts as space: recursive calls that remain active consume stack memory.'
            ].map(x => <li key={x} className="text-sm leading-6 text-slate-400 flex gap-2"><span className="text-cyan-400">▸</span>{x}</li>)}</ul>
          </DetailSection>

          <DetailSection title="Big-O, Big-Ω and Big-Θ" icon={<Brain size={16} />} isBright={isBright}>
            <div className="grid lg:grid-cols-3 gap-3">
              {[
                ['Big-O — O(f(n))', 'Upper-bound / growth ceiling. It tells us the algorithm will not grow asymptotically faster than the stated bound under the chosen model.', 'Linear search is O(n).'],
                ['Big-Ω — Ω(f(n))', 'Lower-bound / guaranteed growth floor. It describes a lower asymptotic bound.', 'Any algorithm that must inspect all n items in a particular case is Ω(n) for that case.'],
                ['Big-Θ — Θ(f(n))', 'Tight bound: both upper and lower bounds match asymptotically.', 'A loop that always runs exactly n times is Θ(n), and therefore also O(n) and Ω(n).'],
              ].map(([title, body, ex]) => <div key={title} className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10"><h3 className="font-bold text-sm text-cyan-300">{title}</h3><p className="mt-2 text-xs leading-6 text-slate-400">{body}</p><p className="mt-2 text-xs leading-6 text-slate-500"><span className="text-cyan-400 font-semibold">Example:</span> {ex}</p></div>)}
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-400"><span className="font-semibold text-cyan-400">Interview rule:</span> Most coding interviews ask for Big-O time and space, but understanding Ω and Θ prevents you from confusing a worst-case upper bound with an exact/tight growth rate.</p>
          </DetailSection>

          <DetailSection title="All Important Time Complexity Classes" icon={<Target size={16} />} isBright={isBright}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead><tr className="text-left text-slate-500 border-b border-slate-800"><th className="py-2 pr-4">Complexity</th><th className="py-2 pr-4">Meaning</th><th className="py-2 pr-4">Typical example</th><th className="py-2">How to recognize</th></tr></thead>
                <tbody>{complexityRows.map(([a,b,c,d]) => <tr key={a} className="border-b border-slate-800/60 align-top"><td className="py-3 pr-4 font-semibold text-cyan-300 whitespace-nowrap">{a}</td><td className="py-3 pr-4 text-slate-400">{b}</td><td className="py-3 pr-4 text-slate-400">{c}</td><td className="py-3 text-slate-400">{d}</td></tr>)}</tbody>
              </table>
            </div>
          </DetailSection>

          <div className="grid lg:grid-cols-2 gap-5 min-w-0">
            <DetailSection title="How to Find Time Complexity — Step by Step" icon={<ChevronRight size={16} />} isBright={isBright}>
              <ol className="space-y-3 list-decimal list-inside text-sm leading-7 text-slate-400">
                <li>Identify the input size: usually n, but sometimes there are multiple inputs such as n and m.</li>
                <li>Find the basic operation that repeats: comparison, assignment, arithmetic, swap, function call, etc.</li>
                <li>Count how many times each loop or operation can execute in terms of n.</li>
                <li>For sequential blocks, add their costs: O(n) + O(n) = O(n).</li>
                <li>For nested independent loops, multiply: O(n) × O(n) = O(n²).</li>
                <li>For halving/doubling loops, use logarithms: n → n/2 → n/4 → ... → 1 gives O(log n).</li>
                <li>For conditionals, analyze the branch that performs the most work for worst-case Big-O.</li>
                <li>For recursion, write the recurrence and identify the number of levels/branches.</li>
                <li>Drop constants and lower-order terms: O(3n + 10) becomes O(n), and O(n² + n) becomes O(n²).</li>
              </ol>
            </DetailSection>
            <DetailSection title="How to Find Space Complexity" icon={<HardDrive size={16} />} isBright={isBright}>
              <ol className="space-y-3 list-decimal list-inside text-sm leading-7 text-slate-400">
                <li>Count variables whose memory does not depend on n → O(1).</li>
                <li>Count arrays, strings, maps, sets or other structures created from n input items → usually O(n).</li>
                <li>For a matrix of n × n cells → O(n²).</li>
                <li>For recursion, count the maximum number of active stack frames, not just total calls.</li>
                <li>If multiple extra structures coexist, add their memory and keep the dominant term.</li>
                <li>Do not automatically count the input itself as auxiliary space unless the question asks for total space.</li>
              </ol>
            </DetailSection>
          </div>

          <DetailSection title="Code Examples — Find the Complexity Yourself" icon={<CheckCircle2 size={16} />} isBright={isBright}>
            <div className="space-y-4">
              {[
                ['Example 1 — One loop', 'for (int i = 0; i < n; i++) {\n  cout << a[i];\n}', 'The loop runs n times → Time O(n). Only i and a few variables are used → Auxiliary Space O(1).'],
                ['Example 2 — Two separate loops', 'for (int i = 0; i < n; i++) work();\nfor (int j = 0; j < n; j++) work();', 'n + n = 2n → O(n), not O(n²), because the loops are sequential, not nested.'],
                ['Example 3 — Nested loops', 'for (int i = 0; i < n; i++)\n  for (int j = 0; j < n; j++) work();', 'n × n = n² → Time O(n²).'],
                ['Example 4 — Halving', 'for (int i = n; i > 1; i /= 2) work();', 'Values are n, n/2, n/4, ... → about log₂n iterations → O(log n).'],
                ['Example 5 — Doubling', 'for (int i = 1; i < n; i *= 2) work();', 'Values are 1, 2, 4, 8, ... → O(log n).'],
                ['Example 6 — Triangular loop', 'for (int i = 0; i < n; i++)\n  for (int j = 0; j < i; j++) work();', 'Work is 0 + 1 + 2 + ... + (n−1) = n(n−1)/2 → O(n²).'],
                ['Example 7 — Log inside linear', 'for (int i = 0; i < n; i++)\n  for (int j = n; j > 1; j /= 2) work();', 'Outer loop n times and inner loop log n times → O(n log n).'],
                ['Example 8 — √n loop', 'for (int i = 1; i * i <= n; i++) work();', 'i reaches √n → O(√n).'],
                ['Example 9 — Linear extra memory', 'vector<int> copy(n);', 'Creating n elements requires O(n) auxiliary space.'],
                ['Example 10 — Matrix memory', 'vector<vector<int>> grid(n, vector<int>(n));', 'n × n elements → O(n²) space.'],
              ].map(([title,code,ex]) => <div key={title} className={`p-4 rounded-xl border ${isBright ? 'bg-slate-50 border-slate-200' : 'bg-black/20 border-slate-800'}`}><h3 className="text-sm font-bold text-cyan-300">{title}</h3><pre className="mt-3 overflow-x-auto p-3 rounded-lg bg-black/30 border border-slate-800 text-xs leading-6 text-cyan-200 font-mono whitespace-pre-wrap">{code}</pre><p className="mt-3 text-sm leading-6 text-slate-400">{ex}</p></div>)}
            </div>
          </DetailSection>

          <DetailSection title="Loops — The Most Important Shortcut" icon={<Clock3 size={16} />} isBright={isBright}>
            <div className="space-y-3 text-sm leading-7 text-slate-400">
              <p><span className="text-cyan-400 font-semibold">One n-loop:</span> O(n).</p>
              <p><span className="text-cyan-400 font-semibold">Two nested n-loops:</span> O(n²).</p>
              <p><span className="text-cyan-400 font-semibold">Three nested n-loops:</span> O(n³).</p>
              <p><span className="text-cyan-400 font-semibold">Sequential loops:</span> Add them, then keep the dominant term.</p>
              <p><span className="text-cyan-400 font-semibold">n then log n nested:</span> O(n log n).</p>
              <p><span className="text-cyan-400 font-semibold">Variable shrinking by division:</span> usually O(log n).</p>
              <p><span className="text-cyan-400 font-semibold">Variable grows by multiplication:</span> usually O(log n).</p>
            </div>
          </DetailSection>

          <DetailSection title="How to Find Complexity — Beginner Guided Practice" icon={<Target size={16} />} isBright={isBright}>
            <div className="space-y-4">
              <div className={`p-4 rounded-xl border ${isBright ? 'bg-cyan-50 border-cyan-200' : 'bg-cyan-950/20 border-cyan-900/50'}`}>
                <h3 className="text-sm font-bold text-cyan-300">The 5-Step Method — use this on almost every code question</h3>
                <ol className="mt-3 space-y-2 list-decimal list-inside text-sm leading-7 text-slate-400">
                  <li><span className="text-cyan-400 font-semibold">Find n:</span> decide what the input size means.</li>
                  <li><span className="text-cyan-400 font-semibold">Find the repeated work:</span> count loops, comparisons, swaps, function calls, etc.</li>
                  <li><span className="text-cyan-400 font-semibold">Understand the loop relationship:</span> sequential blocks add; nested independent loops multiply; shrinking/growing by a factor gives log n.</li>
                  <li><span className="text-cyan-400 font-semibold">Check recursion and extra memory:</span> count active stack frames and data structures created.</li>
                  <li><span className="text-cyan-400 font-semibold">Simplify:</span> remove constants and lower-order terms, then state Time + Auxiliary Space.</li>
                </ol>
              </div>

              <div className="p-4 rounded-xl bg-slate-500/5 border border-slate-700/50">
                <h3 className="text-sm font-bold text-cyan-300">Golden pattern rules</h3>
                <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  {[
                    ['Sequential', 'ADD', 'O(n) + O(n) → O(n)'],
                    ['Nested', 'MULTIPLY', 'O(n) × O(n) → O(n²)'],
                    ['Halving / doubling', 'LOG', 'n → n/2 → ... → O(log n)'],
                    ['Dominant term', 'KEEP BIGGEST', 'O(n² + n + 1) → O(n²)'],
                  ].map(([a,b,d]) => <div key={a} className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10"><div className="text-xs font-bold text-cyan-300">{a}</div><div className="mt-1 text-[10px] font-mono text-purple-300">{b}</div><div className="mt-1 text-xs text-slate-400">{d}</div></div>)}
                </div>
              </div>

              {[
                ['P1 — One loop', `for (int i = 0; i < n; i++) {\n  cout << i;\n}`, 'O(n)', 'The loop executes once for every element. n iterations. Auxiliary space is O(1).'],
                ['P2 — Sequential loops', `for (int i = 0; i < n; i++) work();\nfor (int j = 0; j < n; j++) work();`, 'O(n)', 'n + n = 2n. The loops are not nested, so we add them and drop the constant 2.'],
                ['P3 — Nested loops', `for (int i = 0; i < n; i++)\n  for (int j = 0; j < n; j++) work();`, 'O(n²)', 'For every one of n outer iterations, the inner loop runs n times: n × n.'],
                ['P4 — Halving', `for (int i = n; i > 1; i /= 2) work();`, 'O(log n)', 'The values are n, n/2, n/4, ... 1. The number of divisions by 2 is log₂n.'],
                ['P5 — Doubling', `for (int i = 1; i < n; i *= 2) work();`, 'O(log n)', 'The values are 1, 2, 4, 8, ... n. Only about log₂n iterations occur.'],
                ['P6 — n × log n', `for (int i = 0; i < n; i++)\n  for (int j = 1; j < n; j *= 2) work();`, 'O(n log n)', 'Outer loop gives n and inner loop gives log n; because it is nested, multiply them.'],
                ['P7 — Triangular loop', `for (int i = 0; i < n; i++)\n  for (int j = 0; j < i; j++) work();`, 'O(n²)', 'Work is 0 + 1 + 2 + ... + (n−1) = n(n−1)/2, which simplifies to O(n²).'],
                ['P8 — Square root', `for (int i = 1; i * i <= n; i++) work();`, 'O(√n)', 'The condition remains true until i reaches about √n, so there are √n iterations.'],
                ['P9 — Dominant term', `for (int i = 0; i < n; i++) work();\nfor (int i = 0; i < n; i++)\n  for (int j = 0; j < n; j++) work();`, 'O(n²)', 'The total is n + n². The n² term dominates as n grows, so the final answer is O(n²).'],
                ['P10 — Linear extra space', `vector<int> copy(n);\nfor (int i = 0; i < n; i++) copy[i] = a[i];`, 'Time O(n), Space O(n)', 'The loop copies n values and the new vector stores n values.'],
                ['P11 — Constant space', `int sum = 0;\nfor (int i = 0; i < n; i++) sum += a[i];`, 'Time O(n), Space O(1)', 'One pass takes n operations, while only fixed-size variables are created.'],
                ['P12 — Matrix space', `vector<vector<int>> grid(n, vector<int>(n));`, 'Space O(n²)', 'There are n rows and n columns, giving n × n stored elements.'],
              ].map(([title, code, answer, explanation]) => (
                <div key={title} className={`p-4 rounded-xl border ${isBright ? 'bg-white border-slate-200' : 'bg-black/20 border-slate-800'}`}>
                  <h3 className="text-sm font-bold text-cyan-300">{title}</h3>
                  <pre className="mt-3 overflow-x-auto p-3 rounded-lg bg-black/30 border border-slate-800 text-xs leading-6 text-cyan-200 font-mono whitespace-pre-wrap">{code}</pre>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button type="button" onClick={() => setRevealedComplexity(prev => ({...prev, [title]: !prev[title]}))} className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[11px] font-semibold text-cyan-300 hover:bg-cyan-500/20 cursor-pointer">
                      {revealedComplexity[title] ? 'Hide solution' : 'Think first → Reveal solution'}
                    </button>
                    {!revealedComplexity[title] && <span className="text-[10px] text-slate-500">Pause and calculate it yourself.</span>}
                  </div>
                  {revealedComplexity[title] && (
                    <div className="mt-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-sm font-bold text-emerald-300">Answer: {answer}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{explanation}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </DetailSection>

          <DetailSection title="Common Beginner Traps" icon={<X size={16} />} isBright={isBright}>
            <div className="space-y-3">
              {[
                ['Two loops do not automatically mean O(n²)', 'If they run one after another, add: O(n) + O(n) = O(n).'],
                ['Nested does not always mean O(n²)', 'If the inner loop is logarithmic, n × log n gives O(n log n).'],
                ['Do not count constants', 'O(2n), O(100n) and O(n) have the same asymptotic growth.'],
                ['Do not keep smaller terms', 'O(n² + n + 1) becomes O(n²).'],
                ['Do not confuse total recursion calls with stack space', 'Space depends on the maximum number of calls active at the same time.'],
                ['Do not blindly call every hash operation O(1)', 'Hash-table lookup is usually average O(1), but worst-case can be O(n) depending on the implementation and collision behavior.'],
                ['Do not ignore constraints', 'An O(n²) solution may be fine for small n and completely impractical for large n.'],
              ].map(([a,b]) => <div key={a} className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10"><p className="text-sm font-semibold text-rose-300">{a}</p><p className="mt-1 text-xs leading-6 text-slate-400">{b}</p></div>)}
            </div>
          </DetailSection>

          <DetailSection title="From Beginner to Interview Level — Practice Order" icon={<ChevronRight size={16} />} isBright={isBright}>
            <ol className="space-y-3 list-decimal list-inside text-sm leading-7 text-slate-400">
              <li>Master O(1), O(n) and O(n²) with simple loops.</li>
              <li>Then learn sequential vs nested loop counting.</li>
              <li>Then master log n patterns: divide by 2 and multiply by 2.</li>
              <li>Combine them: O(n log n), O(n² + n), O(n + log n).</li>
              <li>Learn triangular loops and summations.</li>
              <li>Then learn recursion and recurrence relations.</li>
              <li>Finally handle multiple variables, data structures, amortized costs and tricky code.</li>
            </ol>
            <div className={`mt-4 p-4 rounded-xl border ${isBright ? 'bg-cyan-50 border-cyan-200' : 'bg-cyan-950/20 border-cyan-900/50'}`}>
              <p className="text-sm font-semibold text-cyan-300">Final habit</p>
              <p className="mt-1 text-sm leading-7 text-slate-400">Never guess the Big-O just by looking at the code. Say out loud: <span className="font-semibold text-cyan-400">“What is n? How many times does this block execute? Are the loops sequential or nested? Does the input shrink? What extra memory is created?”</span> Then simplify.</p>
            </div>
          </DetailSection>

          <DetailSection title="Recursion — How to Calculate It" icon={<Brain size={16} />} isBright={isBright}>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10"><h3 className="text-sm font-bold text-cyan-300">Binary Search</h3><pre className="mt-2 p-3 rounded-lg bg-black/30 text-xs text-cyan-200 font-mono whitespace-pre-wrap">{`T(n) = T(n/2) + O(1)`}</pre><p className="mt-2 text-sm text-slate-400">The input halves every call → O(log n) time. Recursion depth is O(log n) → O(log n) auxiliary space.</p></div>
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10"><h3 className="text-sm font-bold text-cyan-300">Merge Sort</h3><pre className="mt-2 p-3 rounded-lg bg-black/30 text-xs text-cyan-200 font-mono whitespace-pre-wrap">{`T(n) = 2T(n/2) + O(n)`}</pre><p className="mt-2 text-sm text-slate-400">Two half-size subproblems create log n levels, and each level processes n total elements → O(n log n).</p></div>
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10"><h3 className="text-sm font-bold text-cyan-300">Naive Fibonacci</h3><pre className="mt-2 p-3 rounded-lg bg-black/30 text-xs text-cyan-200 font-mono whitespace-pre-wrap">{`T(n) = T(n-1) + T(n-2) + O(1)`}</pre><p className="mt-2 text-sm text-slate-400">Repeated branching causes exponential growth; commonly stated as O(2ⁿ) time. The active recursion depth is O(n) space.</p></div>
            </div>
          </DetailSection>

          <DetailSection title="Best Case, Average Case & Worst Case" icon={<Target size={16} />} isBright={isBright}>
            <div className="grid md:grid-cols-3 gap-3">
              {[
                ['Best Case', 'Minimum work for a favorable input.', 'Linear search finds the target at index 0 → O(1).'],
                ['Average Case', 'Expected work over an input distribution/model.', 'Linear search is O(n) average under a common uniform-position assumption.'],
                ['Worst Case', 'Maximum work over valid inputs.', 'Linear search target is last/absent → O(n).'],
              ].map(([t,b,e]) => <div key={t} className="p-4 rounded-xl bg-slate-500/5 border border-slate-700/50"><h3 className="font-bold text-sm text-cyan-300">{t}</h3><p className="mt-2 text-xs leading-6 text-slate-400">{b}</p><p className="mt-2 text-xs leading-6 text-slate-500">{e}</p></div>)}
            </div>
          </DetailSection>

          <DetailSection title="Amortized vs Average vs Expected Complexity" icon={<Sparkles size={16} />} isBright={isBright}>
            <p className="text-sm leading-7 text-slate-400"><span className="text-cyan-400 font-semibold">Amortized:</span> average cost over a sequence of operations, without assuming random input. Example: dynamic-array append is amortized O(1), even though an occasional resize costs O(n).</p>
            <p className="mt-3 text-sm leading-7 text-slate-400"><span className="text-cyan-400 font-semibold">Average-case:</span> average over an input distribution or case model. Example: quicksort is average O(n log n) under common assumptions, but worst-case O(n²).</p>
            <p className="mt-3 text-sm leading-7 text-slate-400"><span className="text-cyan-400 font-semibold">Expected:</span> often used for randomized algorithms where the expectation is over random choices. Example: randomized quicksort has expected O(n log n).</p>
          </DetailSection>

          <DetailSection title="How to Compare Two Algorithms" icon={<Layers3 size={16} />} isBright={isBright}>
            <ol className="space-y-2 list-decimal list-inside text-sm leading-7 text-slate-400">
              <li>Write both complexities in terms of n.</li>
              <li>Ignore machine-dependent constants for asymptotic comparison.</li>
              <li>Keep the dominant growth term.</li>
              <li>Compare both time and auxiliary space; faster is not automatically better if memory is severely constrained.</li>
              <li>Check constraints. O(n²) may be acceptable for n = 1,000 in some settings but impossible for n = 1,000,000.</li>
            </ol>
          </DetailSection>

          <DetailSection title="Complexity Cheat Sheet" icon={<CheckCircle2 size={16} />} isBright={isBright}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {[
                ['O(1)', 'Direct access, swap, stack top'],
                ['O(log n)', 'Binary search, balanced tree search'],
                ['O(√n)', 'Trial division to √n'],
                ['O(n)', 'One traversal, linear search'],
                ['O(n log n)', 'Merge sort, heap sort'],
                ['O(n²)', 'Double nested loop, many simple comparison sorts'],
                ['O(n³)', 'Triple nested loop'],
                ['O(2ⁿ)', 'All subsets, naive Fibonacci'],
                ['O(n!)', 'All permutations'],
                ['Space O(1)', 'Few fixed variables'],
                ['Space O(n)', 'Copy/list/map proportional to n'],
                ['Space O(n²)', 'n × n matrix'],
              ].map(([a,b]) => <div key={a+b} className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10"><span className="font-mono text-cyan-300 text-xs font-bold">{a}</span><p className="mt-1 text-xs text-slate-400">{b}</p></div>)}
            </div>
          </DetailSection>

          <div className={`p-6 rounded-2xl border ${isBright ? 'bg-cyan-50 border-cyan-200' : 'bg-cyan-950/20 border-cyan-900/50'}`}>
            <div className="flex items-center gap-3"><span className="text-xl">🎯</span><h3 className="font-bold">Your goal</h3></div>
            <p className="mt-2 text-sm leading-7 text-slate-400">Whenever you see code, first identify n, then count how loops grow, check recursion, count extra data structures, remove constants/lower-order terms, and finally state Time Complexity + Auxiliary Space Complexity.</p>
          </div>
        </div>
      </div>
    );
  }

  if (selected) {
    return (
      <div ref={scrollRef} key={showIntro ? 'dsa-intro' : selected ? `dsa-topic-${selected.id}` : 'dsa-list'} className={`h-[calc(100dvh-62px)] min-h-0 overflow-y-auto p-4 md:p-8 ${isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'}`}>
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
            <div className="space-y-6">
              {(VARIANT_GROUPS[selected.id] || [['All Types / Variants', selected.types]]).map(([groupTitle, groupTypes]) => (
                <div key={groupTitle}>
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300">{groupTitle}</h3>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {groupTypes.map((type) => (
                      <button key={type} type="button" onClick={() => openVariant(type)} className="text-left p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-xs font-semibold hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-colors cursor-pointer">
                        {type}<span className="block mt-1 text-[10px] font-normal text-cyan-500/70">Click to learn →</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            {selectedVariant && VARIANT_DETAILS[selectedVariant] && (() => {
const exampleFor = (name) => {
  if (name === 'Vector of Primitive Values') return `vector<int> nums;

nums.push_back(10);
nums.push_back(20);

cout << nums[1]; // 20`;
  if (name === 'Vector of Strings') return `vector<string> names;

names.push_back("Aman");
names.push_back("Riya");

cout << names[0]; // Aman`;
  if (name === 'Vector of Pairs') return `vector<pair<int, int>> edges;

edges.push_back({1, 2});
edges.push_back({2, 5});

cout << edges[0].first << " "
     << edges[0].second;`;
  if (name === 'Vector of Vectors (2D)') return `vector<vector<int>> grid = {
    {1, 2, 3},
    {4, 5, 6}
};

cout << grid[1][2]; // 6`;
  if (name === 'Vector of Objects / Structs') return `struct Student {
    string name;
    int marks;
};

vector<Student> students;

students.push_back({"Aman", 88});
students.push_back({"Riya", 92});`;
  if (name === 'Vector of Pointers') return `int a = 10;
int b = 20;

vector<int*> ptrs;

ptrs.push_back(&a);
ptrs.push_back(&b);

cout << *ptrs[1]; // 20`;
  if (name === 'vector<bool> (Specialized)') return `vector<bool> visited(5, false);

visited[2] = true;

if (visited[2]) {
    cout << "Visited";
}`;
  if (name === 'Nested Vectors') return `vector<vector<vector<int>>> cube(
    2,
    vector<vector<int>>(
        2,
        vector<int>(2, 0)
    )
);

cube[1][0][1] = 7;`;

                const examples = {
                  'Static Array': `int a[5] = {10, 20, 30, 40, 50};

cout << a[2];  // 30`,
                  'Dynamic Array / Vector': `vector<int> v;

v.push_back(10);
v.push_back(20);
v.push_back(30);

cout << v[1];  // 20`,
                  '2D Array': `int grid[2][3] = {
    {1, 2, 3},
    {4, 5, 6}
};

cout << grid[1][2];  // 6`,
                  'Multidimensional Array': `int a[2][2][2] = {};

a[0][1][1] = 10;`,
                  'Singly Linked List': `Node* first = new Node(10);
first->next = new Node(20);

cout << first->next->data;  // 20`,
                  'Doubly Linked List': `node->next = second;
second->prev = node;`,
                  'Circular Singly Linked List': `tail->next = head;

// From tail, next points back to head.`,
                  'Circular Doubly Linked List': `tail->next = head;
head->prev = tail;`,
                  'Skip List': `skipList.insert(25);

// Multiple forward levels may be created.`,
                  'Linear Search': `for (int i = 0; i < n; i++) {
    if (a[i] == target) {
        return i;
    }
}

return -1;`,
                  'Binary Search': `while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;

    if (a[mid] == target) {
        return mid;
    }
}`,
                  'Bubble Sort': `for (int pass = 0; pass < n - 1; pass++) {
    for (int i = 0; i < n - pass - 1; i++) {
        if (a[i] > a[i + 1]) {
            swap(a[i], a[i + 1]);
        }
    }
}`,
                  'Selection Sort': `for (int i = 0; i < n - 1; i++) {
    int minIndex = i;

    for (int j = i + 1; j < n; j++) {
        if (a[j] < a[minIndex]) {
            minIndex = j;
        }
    }

    swap(a[i], a[minIndex]);
}`,
                  'Insertion Sort': `for (int i = 1; i < n; i++) {
    int key = a[i];
    int j = i - 1;

    while (j >= 0 && a[j] > key) {
        a[j + 1] = a[j];
        j--;
    }

    a[j + 1] = key;
}`,
                  'Merge Sort': `mergeSort(left, right);

1. Split the array.
2. Sort the left half.
3. Sort the right half.
4. Merge both sorted halves.`,
                  'Quick Sort': `quickSort(low, high);

1. Choose a pivot.
2. Partition the array.
3. Recursively sort both sides.`,
                  'Heap Sort': `buildMaxHeap(a);

for (int end = n - 1; end > 0; end--) {
    swap(a[0], a[end]);
    heapify(a, end, 0);
}`,
                  'Array Stack': `stack.push(x);
int x = stack.top();
stack.pop();`,
                  'Linked Stack': `Node* node = new Node(x);

node->next = top;
top = node;`,
                  'Circular Queue': `rear = (rear + 1) % capacity;
queue[rear] = value;`,
                  'Deque': `dq.push_front(10);
dq.push_back(20);

int first = dq.front();`,
                  'Priority Queue': `priority_queue<int> pq;

pq.push(10);
pq.push(30);
pq.push(20);

cout << pq.top();  // 30`,
                  'Monotonic Stack': `while (!st.empty() && a[st.top()] <= a[i]) {
    st.pop();
}

st.push(i);`,
                  'Full Binary Tree': `// Every node has either 0 or 2 children.

        1
       / \\
      2   3`,
                  'Complete Binary Tree': `// Fill levels from left to right.

        1
       / \\
      2   3
     /
    4`,
                  'Perfect Binary Tree': `// Every internal node has 2 children
// and all leaves have the same depth.

        1
       / \\
      2   3
     / \\
    4   5 6  7`,
                  'Balanced Tree': `// Keep subtree heights close
// so the tree stays approximately logarithmic in height.`,
                  'Skewed / Degenerate Tree': `10
  \\
   20
     \\
      30
        \\
         40`,
                  'Unbalanced BST': `insert(10);
insert(20);
insert(30);

// Repeated increasing inserts can create
// a chain-like tree.`,
                  'Balanced BST': `insert(10);
insert(20);
insert(15);

// Rebalancing keeps height near O(log n).`,
                  'AVL Tree': `insert(30);
insert(20);
insert(10);

// Balance factor becomes invalid.
// A right rotation restores balance.`,
                  'Red-Black Tree': `insert(10);
insert(20);
insert(30);

// Recoloring and rotations maintain
// logarithmic height.`,
                  'Min Heap': `// Parent value <= child values.

        10
       /  \\
      20   30`,
                  'Max Heap': `// Parent value >= child values.

        30
       /  \\
      20   10`,
                  'Binary Heap': `// Array representation of a heap.

vector<int> heap = {30, 20, 10, 15, 5};`,
                  'd-ary Heap': `// A node can have up to d children.
// Example: d = 4 for a 4-ary heap.`,
                  'Directed': `addEdge(u, v);

// Edge direction:
u -> v`,
                  'Undirected': `addEdge(u, v);
addEdge(v, u);

// Movement is possible in both directions.`,
                  'Weighted': `addEdge(u, v, weight);

// Example:
addEdge(1, 2, 7);`,
                  'Unweighted': `adj[u].push_back(v);

// Every edge has equal cost.`,
                  'DAG': `1 -> 2 -> 3
     \\
      -> 4

// No directed cycle exists.`,
                  'Bipartite': `color[u] = 0;
color[v] = 1;

// Adjacent vertices get opposite colors.`,
                  'Complete': `// Every pair of distinct vertices
// has an edge.`,
                  'Connected': `// Starting from any vertex,
// every other vertex is reachable.`,
                  'Top-down Memoization': `int solve(int state) {
    if (memo[state] != -1) {
        return memo[state];
    }

    return memo[state] = solve(smallerState);
}`,
                  'Bottom-up Tabulation': `vector<int> dp(n + 1);

dp[0] = baseCase;

for (int i = 1; i <= n; i++) {
    dp[i] = transition(dp, i);
}`,
                  'Space-Optimized DP': `int previous = baseCase;

for (int i = 1; i <= n; i++) {
    int current = transition(previous);
    previous = current;
}`,
                  '1D DP': `vector<int> dp(n + 1);

dp[i] = best answer for state i;`,
                  '2D DP': `vector<vector<int>> dp(n, vector<int>(m));

dp[i][j] = transition(dp, i, j);`,
                  'Bitmask DP': `// mask represents selected items.

dp[mask] = best answer for this subset;`,
                  'Tree DP': `void dfs(Node* node, Node* parent) {
    for (Node* child : node->children) {
        dfs(child, node);
    }

    // Compute node's DP state.
}`,
                  'Standard Trie': `trie.insert("cat");

if (trie.search("cat")) {
    cout << "found";
}`,
                  'Compressed Trie / Radix Tree': `// Common character paths are
// stored as compressed edge labels.`,
                  'Ternary Search Tree': `// Each node has:
// left  <  character
// equal = character
// right > character`,
                  'Prefix Hashing': `long long prefixHash = hashPrefix(s, i);

// Equal prefix hashes can be compared
// with collision-aware techniques.`,
                  'Hash Table': `int index = hash(key) % capacity;

table[index] = value;`,
                  'Hash Map': `unordered_map<string, int> freq;

freq["cat"]++;
freq["dog"]++;`,
                  'Hash Set': `unordered_set<int> seen;

seen.insert(10);

if (seen.count(10)) {
    cout << "present";
}`,
                  'Collision Handling': `// Two keys may map to the same slot.

// Common solutions:
// 1. Chaining
// 2. Open addressing / probing`,
                  'Frequency Map': `unordered_map<int, int> freq;

for (int x : a) {
    freq[x]++;
}`,
                  'Direct Recursion': `int factorial(int n) {
    if (n <= 1) {
        return 1;
    }

    return n * factorial(n - 1);
}`,
                  'Tail Recursion': `int fact(int n, int result) {
    if (n == 0) {
        return result;
    }

    return fact(n - 1, result * n);
}`,
                  'Divide & Conquer': `1. Divide the problem.
2. Solve each smaller problem.
3. Combine their answers.`,
                  'Backtracking': `choose();

solve(nextState);

undoChoice();`,
                  'Memoized Recursion': `if (memo[state] != -1) {
    return memo[state];
}

memo[state] = solve(nextState);`,
                  'Activity Selection': `sort(activities, byFinishTime);

for (activity : activities) {
    if (activity.start >= lastFinish) {
        choose(activity);
        lastFinish = activity.finish;
    }
}`,
                  'Fractional Knapsack': `sort(items, byValuePerWeight);

for (item : items) {
    take as much as possible;
}`,
                  'Huffman Coding': `while (heap.size() > 1) {
    Node* a = popMin();
    Node* b = popMin();

    push(a + b);
}`,
                  'Interval Scheduling': `sort(intervals, byFinishTime);

choose the next interval
whose start >= lastFinish;`,
                  'Greedy Graph Algorithms': `sort(edges, byWeight);

for (edge : edges) {
    if (safe(edge)) {
        choose(edge);
    }
}`,
                  'Bitwise AND/OR/XOR': `int andResult = a & b;
int orResult  = a | b;
int xorResult = a ^ b;`,
                  'Bit Shifting': `int x = 5;

x <<= 1;  // shift left
x >>= 1;  // shift right`,
                  'Bit Mask': `int mask = 0;

mask |= (1 << k);  // set bit k`,
                  'Set/Clear/Toggle Bit': `x |= (1 << k);   // set
x &= ~(1 << k);  // clear
x ^= (1 << k);   // toggle`,
                  'Bitmask Enumeration': `for (int mask = 0; mask < (1 << n); mask++) {
    // mask represents one subset.
}`,
                  'Union-Find': `dsu.unite(a, b);

if (dsu.find(a) == dsu.find(b)) {
    // Same component.
}`,
                  'Path Compression': `int find(int x) {
    if (parent[x] == x) {
        return x;
    }

    return parent[x] = find(parent[x]);
}`,
                  'Union by Rank': `if (rank[rootA] < rank[rootB]) {
    swap(rootA, rootB);
}

parent[rootB] = rootA;`,
                  'Union by Size': `if (size[rootA] < size[rootB]) {
    swap(rootA, rootB);
}

parent[rootB] = rootA;
size[rootA] += size[rootB];`,
                  'Segment Tree': `build(node, left, right);

query(node, left, right, ql, qr);

update(node, left, right, index, value);`,
                  'Lazy Propagation': `lazy[node] += value;

// Push the pending update only when
// we need to visit child nodes.`,
                  'Fenwick Tree / BIT': `add(index, delta);

int prefix = sum(index);`,
                  'Range Sum Query': `int prefixRight = prefixSum(r);\nint prefixLeft = prefixSum(l - 1);\n\nint rangeSum = prefixRight - prefixLeft;`,
                  'Range Minimum Query': `int answer = segmentTree.query(left, right);\n\ncout << answer;`
                };
                return examples[name] || `Start with a small example, trace the structure step by step, and observe how the state changes.`;
              };
              const complexityFor = (name) => {
                if (/Search|Sort/.test(name)) return name === 'Linear Search' ? 'O(n) worst case' : /Binary/.test(name) ? 'O(log n) on sorted/monotonic data' : /Merge/.test(name) ? 'O(n log n)' : /Quick/.test(name) ? 'O(n log n) average, O(n²) worst' : 'O(n²) typical for this elementary sort';
                if (/Heap|Priority Queue/.test(name)) return 'Core heap operations are typically O(log n); top/peek is O(1).';
                if (/Trie/.test(name) || /Prefix/.test(name)) return 'Typically O(L), where L is the key/prefix length, subject to implementation.';
                if (/Hash|Frequency|Collision/.test(name)) return 'Average lookup/insert is O(1); worst case can degrade with collisions.';
                if (/Graph|DAG|Bipartite|Connected|Weighted|Unweighted|Directed|Undirected|Complete/.test(name)) return 'Depends on the algorithm; traversal with adjacency lists is typically O(V + E).';
                if (/DP|Memoization|Tabulation/.test(name)) return 'Depends on number of states × transition cost; identify both explicitly.';
                if (/Union|Path Compression|Rank|Size/.test(name)) return 'With path compression + union by rank/size, operations are amortized near O(1), formally O(α(n)).';
                if (/Segment|Fenwick|Range/.test(name)) return 'Typical query/update is O(log n); build is commonly O(n) for standard segment/Fenwick constructions.';
                if (/Bit/.test(name)) return 'A fixed-width integer has O(1) bit operations in the usual word-RAM model.';
                return 'Use the parent topic operations table, then account for the specific variant’s extra pointers, levels, or invariants.';
              };
              
              const v = VARIANT_DETAILS[selectedVariant];

              const deep = (name) => {
                const detail = VARIANT_DETAILS[name] || ['', '', ''];
                const [what, hinglish, where] = detail;

                const specific = {
                  'Vector of Primitive Values': ['Stores built-in values as vector elements; the vector controls dynamic size and capacity.', 'Each element is a normal value, so indexing is direct and references follow vector reallocation rules.', 'Use for resizable collections of numbers, characters or flags.', 'Do not confuse element type with vector size or capacity.'],
                  'Vector of Strings': ['Stores std::string objects as vector elements; each string manages its own character storage.', 'The vector moves string objects when it reallocates, while each string manages its text separately.', 'Use for dynamic lists of words, names and tokens.', 'Do not assume all characters live in one contiguous block with the vector elements.'],
                  'Vector of Pairs': ['Stores pair objects so two related values travel together as one element.', 'Each vector slot contains first and second fields.', 'Use for coordinates, graph edges and index-value records.', 'Keep the meaning and order of first and second consistent.'],
                  'Vector of Vectors (2D)': ['Stores a vector in each element, creating a dynamic row-based 2D structure.', 'Each row has independent storage and can have a different length.', 'Use for adjacency lists, jagged matrices and dynamic grids.', 'Do not assume every row has the same size.'],
                  'Vector of Objects / Structs': ['Stores complete user-defined records as vector elements.', 'Each element contains all fields of the struct/class and follows that type’s copy/move behavior.', 'Use for collections of real-world records and graph/tree data.', 'Avoid unnecessary object copies and understand ownership of contained resources.'],
                  'Vector of Pointers': ['Stores addresses rather than the pointed-to objects themselves.', 'The vector storage is contiguous, but pointed objects may live elsewhere.', 'Use when object identity, polymorphism or node references are required.', 'A pointer does not transfer ownership automatically; dangling pointers are dangerous.'],
                  'vector<bool> (Specialized)': ['std::vector<bool> is a specialized representation that packs boolean values into bits on common implementations.', 'Element access uses proxy behavior rather than a normal bool reference.', 'Use when compact boolean storage matters and the specialized behavior is acceptable.', 'Do not assume vector<bool> behaves exactly like vector<int> or vector<char>.'],
                  'Nested Vectors': ['Contains vectors inside vectors, allowing dynamic multi-level structures.', 'Each dimension can have its own dynamic allocation and shape.', 'Use for variable-size DP states, grids and multi-level collections.', 'Track every dimension carefully and avoid accidental huge allocations.'],
                  'Linear Search': ['Walks from index 0 toward the end and stops at the first matching value.', 'Only the input and current index are needed; auxiliary space is O(1).', 'Best when data is unsorted or the collection is small.', 'Do not assume the target is sorted or skip positions while scanning.'],
                  'Binary Search': ['Maintains a low/high candidate interval and discards half after every midpoint comparison.', 'Iterative form uses O(1) auxiliary memory; recursive form adds O(log n) stack.', 'Requires a sorted/monotonic search space and runs in O(log n).', 'Never use it on unsorted data; boundary updates must preserve the search invariant.'],
                  'Bubble Sort': ['Repeated adjacent comparisons move an out-of-order larger value toward the right on each pass.', 'Works in place with O(1) auxiliary memory.', 'Typical time is O(n²); an early-exit check can improve sorted input.', 'The inner-loop range shrinks after each pass; getting that bound wrong breaks sorting.'],
                  'Selection Sort': ['Finds the minimum of the remaining unsorted suffix and swaps it into the next output position.', 'Uses O(1) auxiliary space because it rearranges the original array.', 'Always performs O(n²) comparisons, even when input is sorted.', 'Do not swap before finishing the minimum scan.'],
                  'Insertion Sort': ['Maintains a sorted prefix and shifts larger elements right to insert the current key.', 'Needs only the current key and indexes, so auxiliary space is O(1).', 'O(n²) worst case but close to O(n) when the input has few inversions.', 'Save the key before shifting or its original value can be overwritten.'],
                  'Merge Sort': ['Splits ranges recursively, sorts each half, then merges two sorted ranges in linear time.', 'Typical implementations allocate O(n) temporary merge storage.', 'Runs in O(n log n) for best, average and worst cases.', 'The merge must copy remaining values from both halves.'],
                  'Quick Sort': ['Chooses a pivot, partitions the range around it, then recursively sorts the two resulting ranges.', 'Partitioning can be in place; recursion stack depends on partition depth.', 'Average O(n log n), worst O(n²) with repeatedly unbalanced partitions.', 'Partition boundaries and pivot placement must be consistent.'],
                  'Heap Sort': ['Builds a heap, moves the root to the sorted suffix, then restores heap order for the remaining range.', 'Uses the array itself and normally needs O(1) auxiliary storage.', 'Guaranteed O(n log n) worst-case time and in-place sorting.', 'Only the active heap should be heapified.'],
                  'Stack': ['Exposes only the top end, enforcing last-in-first-out ordering.', 'Can use contiguous storage or linked nodes with a top position/reference.', 'push, pop and top are typically O(1).', 'Popping an empty stack or removing from the wrong end breaks LIFO.'],
                  'Priority Queue': ['Always exposes the highest or lowest priority item instead of the oldest item.', 'A heap is commonly stored as an implicit array tree.', 'peek O(1); insertion and removal O(log n).', 'A priority queue is not a fully sorted container.'],
                  'AVL Tree': ['Tracks subtree height/balance factor and performs LL, RR, LR or RL rotations after updates.', 'Nodes store height/balance metadata in addition to BST links.', 'Search/insert/delete are O(log n) because height is tightly controlled.', 'Choose the rotation from the imbalance pattern and update heights.'],
                  'Red-Black Tree': ['Maintains color invariants through rotations and recoloring rather than exact subtree heights.', 'Each node carries a color field in addition to normal BST links.', 'Search/insert/delete are O(log n).', 'Red-child and black-height rules must remain valid.'],
                  'Min Heap': ['Maintains parent <= child, so the minimum is always at the root.', 'Usually represented by a compact array with implicit child positions.', 'peek O(1); insert/extract-min O(log n).', 'Heap order does not mean the whole array is sorted.'],
                  'Max Heap': ['Maintains parent >= child, so the maximum is always at the root.', 'Uses compact array storage without explicit child pointers.', 'peek O(1); insert/extract-max O(log n).', 'Use max comparisons consistently during sift operations.'],
                  'Directed': ['Edges have source and destination; u→v does not imply v→u.', 'Adjacency lists store outgoing neighbors and can track indegree separately.', 'BFS/DFS are O(V+E) with adjacency lists.', 'Adding both directions changes the intended directed relationship.'],
                  'Undirected': ['Each edge is symmetric, so u-v can be traversed either way.', 'Adjacency lists normally store each logical edge under both endpoints.', 'BFS/DFS are O(V+E).', 'Remember that one logical edge creates two adjacency entries.'],
                  'Weighted': ['Each edge carries a cost that contributes to path comparisons or totals.', 'Adjacency entries store a neighbor plus its weight.', 'Algorithm choice depends on weights; Dijkstra requires non-negative weights.', 'Ignoring weights changes the shortest-path problem.'],
                  'Unweighted': ['Every edge contributes the same unit distance, so shortest path means minimum edge count.', 'Adjacency entries need only neighbor identities.', 'BFS finds shortest edge-count paths in O(V+E).', 'DFS does not guarantee the shortest unweighted path.'],
                  'DAG': ['Has directed edges but no directed cycle, enabling topological ordering.', 'Indegree or DFS finish states can be used for ordering.', 'Topological processing is O(V+E).', 'One directed cycle invalidates DAG-only assumptions.'],
                  'Bipartite': ['Assigns vertices to two colors and requires every edge to cross between colors.', 'A color array stores the partition and an uncolored state.', 'BFS/DFS coloring tests it in O(V+E).', 'Every connected component must be checked.'],
                  'Complete': ['Contains an edge between every pair of distinct vertices.', 'A simple undirected complete graph has V(V-1)/2 edges.', 'Traversal is O(V+E), while E itself is Θ(V²).', 'Complete means every pair is adjacent, not merely reachable.'],
                  'Connected': ['Every vertex belongs to one reachable component in an undirected graph.', 'Connectivity is a property of the graph, not a special node field.', 'One BFS/DFS visits all vertices iff the graph is connected.', 'Checking only the starting vertex is insufficient.'],
                  'Top-down Memoization': ['Starts at the requested state and recursively computes only reached states while caching results.', 'Uses a memo table plus recursion stack.', 'Repeated states are solved once; time is states × transition cost.', 'The memo key must include the complete DP state.'],
                  'Bottom-up Tabulation': ['Starts from base cases and fills states iteratively in dependency order.', 'Stores an explicit table and avoids recursive stack frames.', 'Usually computes every planned state.', 'Dependencies must be filled before dependent states.'],
                  'Space-Optimized DP': ['Drops states that can no longer affect future transitions.', 'Can reduce a full table to one/two rows or a few variables.', 'Time usually stays similar while auxiliary space decreases.', 'Do not overwrite a value before the transition has consumed it.'],
                  '1D DP': ['Represents each state with one parameter such as index, amount or day.', 'Uses one vector with one answer per state.', 'Complexity depends on state count and transition cost.', 'Define dp[i] clearly before writing the recurrence.'],
                  '2D DP': ['Represents each state using two parameters such as two indexes or capacities.', 'Uses a matrix-like table, commonly O(nm) space.', 'Time depends on number of cells and transition work.', 'Keep row/column meanings and boundaries consistent.'],
                  'Bitmask DP': ['Encodes selected items as bits of an integer state.', 'One mask is compact, but there can be 2^n states.', 'Typical complexity is exponential such as O(n2^n).', 'Only use it when n is small enough.'],
                  'Tree DP': ['Computes each node state from child states, commonly with postorder DFS.', 'Stores DP values per node plus recursion stack.', 'Usually O(n × transition cost).', 'Clearly define how the parent state depends on child states.'],
                  'Standard Trie': ['Consumes one character per edge and marks terminal nodes for complete words.', 'Nodes hold child references and a terminal flag.', 'Insert/search/prefix operations are O(L).', 'A prefix is not automatically a complete word.'],
                  'Compressed Trie / Radix Tree': ['Compresses chains of single-child nodes into multi-character edge labels.', 'Fewer nodes are stored, but edges hold string fragments.', 'Cost depends on characters compared along compressed edges.', 'Insertion must split an edge when keys diverge inside it.'],
                  'Ternary Search Tree': ['Stores one character with left/equal/right links, combining BST comparison with trie progression.', 'Uses three links per character node instead of an alphabet-sized child array.', 'Search/insert depend on string length and tree shape.', 'Advance the character index only on the equal branch.'],
                  'Prefix Hashing': ['Builds cumulative hashes so substring hashes can be derived from prefix values.', 'Stores prefix hashes and usually powers of the base.', 'Preprocessing O(n); common substring hash extraction O(1).', 'Hash equality is probabilistic unless collision-safe techniques are added.'],
                  'Hash Table': ['Maps keys to buckets and uses chaining or probing for collisions.', 'Memory includes buckets, entries and collision metadata.', 'Average lookup/insert/delete O(1); collisions can degrade performance.', 'Load factor and collision behavior matter.'],
                  'Hash Map': ['Stores key-value pairs and hashes keys to locate values.', 'Stores keys, mapped values and hash-table overhead.', 'Average find/insert/erase O(1).', 'Keys are not guaranteed to be sorted.'],
                  'Hash Set': ['Stores each key at most once and hashes it for membership checks.', 'Stores keys plus bucket/collision overhead but no mapped values.', 'Average insert/find/erase O(1).', 'Do not expect duplicates or sorted order.'],
                  'Collision Handling': ['Resolves different keys landing at the same bucket through chaining or probing.', 'Chaining needs bucket collections; open addressing needs spare slots.', 'Performance depends on load factor and collision distribution.', 'Probe termination and key equality must be handled separately.'],
                  'Frequency Map': ['Maps every distinct value to its occurrence count.', 'Uses O(k) memory for k distinct values.', 'A full counting pass is average O(n) with hashing.', 'Frequency is a count, not the value or its first index.'],
                  'Direct Recursion': ['Calls itself on a smaller or changed state until a base case is reached.', 'Each active call occupies a stack frame.', 'Time follows the recursion tree; space follows maximum depth.', 'The recursive argument must move toward termination.'],
                  'Tail Recursion': ['Makes the recursive call the final operation, often carrying an accumulator.', 'Stack usage still depends on language/runtime tail-call optimization.', 'Time is proportional to the number of calls.', 'Tail position does not guarantee automatic optimization in C++.'],
                  'Divide & Conquer': ['Splits a problem into subproblems, solves them, then combines their answers.', 'Memory includes recursion depth plus combine buffers.', 'Analyze with a recurrence such as T(n)=aT(n/b)+f(n).', 'The combine step is part of the complexity.'],
                  'Backtracking': ['Makes a choice, explores it, then undoes the choice before another branch.', 'Stores the partial solution and recursion stack.', 'Often exponential because the decision tree can be large.', 'The undo step must restore the exact previous state.'],
                  'Memoized Recursion': ['Adds caching to recursion so each unique state is computed once.', 'Uses a memo table plus active recursion stack.', 'Repeated states become cache hits.', 'The cache key must represent the complete state.'],
                  'Activity Selection': ['Sorts by finish time and repeatedly chooses the next compatible earliest-finishing activity.', 'Tracks the last finish time and selected activities.', 'O(n log n) sorting plus O(n) scan.', 'Earliest finish is the proven rule; earliest start is not.'],
                  'Fractional Knapsack': ['Ranks items by value/weight and takes as much of the best ratio as capacity allows.', 'Needs item ratios and remaining capacity, not a subset DP table.', 'O(n log n) after sorting.', 'This greedy rule does not solve 0/1 knapsack.'],
                  'Huffman Coding': ['Repeatedly merges the two least-frequent nodes using a min-heap.', 'Stores the evolving heap and resulting binary code tree.', 'O(n log n) for n distinct symbols with a heap.', 'The two smallest frequencies must be merged at every step.'],
                  'Interval Scheduling': ['Chooses a maximum compatible set using a proven interval ordering.', 'Tracks the finish time of the last selected interval.', 'O(n log n) sorting plus O(n) selection.', 'Shortest duration is not the same as earliest finish.'],
                  'Greedy Graph Algorithms': ['Makes locally cheapest safe graph choices while preserving a global invariant, as in Kruskal or Prim.', 'Kruskal uses sorted edges and DSU; Prim uses a priority queue frontier.', 'Typical MST implementations are O(E log E) or O(E log V).', 'A cheap edge is not safe if it violates the algorithm invariant.'],
                  'Bitwise AND/OR/XOR': ['Processes matching bit positions using three different rules: common bits, union of bits, or differing bits.', 'Uses fixed-width integer operands only.', 'Each operation is O(1).', 'Do not confuse bitwise operators with logical operators.'],
                  'Bit Shifting': ['Moves the binary representation left or right by a chosen number of positions.', 'Operates directly on the integer word.', 'Fixed-width shifts are O(1).', 'Shift count and signed right-shift behavior require care.'],
                  'Bit Mask': ['Uses selected 1-bits as flags to test or modify corresponding positions.', 'The mask is one fixed-size integer.', 'Set/test/apply operations are O(1).', 'Bit k is normally represented by 1 << k.'],
                  'Set/Clear/Toggle Bit': ['Uses OR to set, AND with an inverted mask to clear, and XOR to toggle a selected bit.', 'Needs only the integer and mask.', 'Each operation is O(1).', 'Using the wrong operator changes the intended bit operation.'],
                  'Bitmask Enumeration': ['Treats every integer from 0 to 2^n-1 as one subset.', 'One integer encodes each subset, but there are exponentially many.', 'Enumeration is O(2^n) before per-subset work.', 'Watch integer width and bit-to-item mapping.'],
                  'Union-Find': ['Represents components by parent-root trees and merges their representatives.', 'Stores parent plus optional rank/size arrays.', 'With compression and union heuristics, operations are amortized O(alpha(n)).', 'Always compare representatives, not arbitrary nodes.'],
                  'Path Compression': ['During find, rewires visited nodes directly toward the root.', 'Mutates the parent array in place.', 'Combined with union by rank/size, future finds are amortized near O(1).', 'Return the root while updating the current node parent.'],
                  'Union by Rank': ['Attaches the lower-rank root below the higher-rank root.', 'Stores rank metadata for roots.', 'With compression, operations are amortized O(alpha(n)).', 'Rank is not the same thing as component size.'],
                  'Union by Size': ['Attaches the smaller component below the larger component and updates the surviving size.', 'Stores component sizes for roots.', 'With compression, operations are amortized O(alpha(n)).', 'Update size only on the new representative.'],
                  'Segment Tree': ['Recursively divides an array into intervals and stores an aggregate for each interval.', 'Uses O(n) tree storage plus optional lazy tags.', 'Range query and point update are typically O(log n).', 'Interval boundaries and overlap cases must be handled precisely.'],
                  'Lazy Propagation': ['Stores a pending range update at an internal segment node and pushes it only when required.', 'Adds a lazy-tag value beside each relevant segment.', 'Suitable range updates and queries can be O(log n).', 'Push pending tags before descending and avoid applying them twice.'],
                  'Fenwick Tree / BIT': ['Stores partial prefix aggregates whose ranges are determined by each index lowbit.', 'Uses a compact one-indexed array.', 'Point update and prefix sum are O(log n).', 'Mixing zero-based external indexes with one-based Fenwick indexes causes errors.'],
                  'Range Sum Query': ['Combines values in [l,r] using addition; static prefix sums can answer ranges by subtraction.', 'Static data uses prefix storage; dynamic data commonly uses Fenwick/segment trees.', 'Static query O(1) after preprocessing; dynamic query typically O(log n).', 'l-1 boundary handling is the classic off-by-one trap.'],
                  'Range Minimum Query': ['Returns the smallest value in an interval; unlike sum, minimum has no inverse subtraction.', 'Segment trees store interval minima; sparse tables suit static RMQ.', 'Segment-tree query is typically O(log n); static sparse-table query can be O(1).', 'Never derive a range minimum by subtracting prefix minima.']
};

                if (specific[name]) {
                  const [internal, memory, operations, mistakes] = specific[name];
                  return { internal, memory, operations, mistakes };
                }

                return {
                  internal: name + ': ' + what,
                  memory: name + ' memory focus: ' + hinglish,
                  operations: name + ' usage focus: ' + where + ' Complexity depends on the exact operation.',
                  mistakes: 'For ' + name + ', remember this defining rule: ' + what + ' Do not copy assumptions from a similar-looking structure.'
                };
              };

              const d = deep(selectedVariant);
              return (
                <div className={`mt-4 p-5 rounded-2xl border ${isBright ? 'bg-cyan-50 border-cyan-200' : 'bg-cyan-950/20 border-cyan-900/50'}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 w-full">
                      <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-500">VARIANT DEEP DIVE</span>
                      <h3 className="mt-1 text-lg font-bold text-cyan-300">{selectedVariant}</h3>

                      <div className="mt-4 grid lg:grid-cols-2 gap-5 min-w-0">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">What is it?</h4>
                          <p className="mt-2 text-sm leading-7 text-slate-400">{v[0]}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Hinglish</h4>
                          <p className="mt-2 text-sm leading-7 text-slate-400">{v[1]}</p>
                        </div>
                      </div>

                      <div className="mt-5 grid lg:grid-cols-2 gap-5 min-w-0">
                        <div className="p-4 rounded-xl bg-black/10 border border-slate-800/60">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">How it works internally</h4>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{d.internal}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-black/10 border border-slate-800/60">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Memory representation</h4>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{d.memory}</p>
                        </div>
                      </div>

                      <div className="mt-5 grid lg:grid-cols-3 gap-4 min-w-0">
                        <div className="p-4 rounded-xl bg-black/10 border border-slate-800/60">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Where to use</h4>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{v[2].replace('Best for: ','')}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-black/10 border border-slate-800/60">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Key operations</h4>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{d.operations}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-black/10 border border-slate-800/60">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Complexity</h4>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{complexityFor(selectedVariant)}</p>
                        </div>
                      </div>

                      <div className="mt-5">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-300">Worked example</h4>
                        <pre className="mt-2 max-w-full overflow-x-auto p-4 rounded-xl bg-black/30 border border-slate-800 text-xs leading-6 text-cyan-200 font-mono whitespace-pre">{exampleFor(selectedVariant)}</pre>
                      </div>

                      <div className="mt-5 grid lg:grid-cols-2 gap-5 min-w-0">
                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">Common mistakes</h4>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{d.mistakes}</p>
                        </div>
                        <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">How to learn it</h4>
                          <p className="mt-2 text-sm leading-6 text-slate-400">First understand the rule/invariant, then trace the example line by line, calculate time and auxiliary space, and finally compare this variant with the other choices in the parent topic.</p>
                        </div>
                      </div>
                    </div>
                    <button type="button" onClick={() => setSelectedVariant(null)} className="shrink-0 text-slate-500 hover:text-white cursor-pointer" aria-label="Close variant explanation"><X size={16} /></button>
                  </div>
                </div>
              );
            })()}
          </DetailSection>

          {TOPIC_DEEP_DIVE[selected.id] && (
            <DetailSection title={TOPIC_DEEP_DIVE[selected.id].title} icon={<BookOpen size={16} />} isBright={isBright}>
              <div className="space-y-5">
                {TOPIC_DEEP_DIVE[selected.id].sections.map(([heading, content]) => (
                  <div key={heading} className="rounded-xl border border-cyan-500/10 bg-cyan-500/5 p-4">
                    <h3 className="text-sm font-bold text-cyan-300">{heading}</h3>
                    {heading === 'Structured code example' ? (
                      <pre className="mt-3 max-w-full overflow-x-auto rounded-lg border border-slate-800 bg-black/30 p-4 text-xs leading-7 text-cyan-200 font-mono whitespace-pre">{content}</pre>
                    ) : (
                      <p className="mt-2 text-sm leading-7 text-slate-400">{content}</p>
                    )}
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

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
            <div className="grid lg:grid-cols-2 gap-5 min-w-0">
              <DetailSection title="What is it? — Easy explanation" icon={<BookOpen size={16} />} isBright={isBright}><p className="text-sm leading-7 text-slate-400">{d.concept}</p></DetailSection>
              <DetailSection title="Hinglish explanation" icon={<Sparkles size={16} />} isBright={isBright}><p className="text-sm leading-7 text-slate-400">{d.hinglish}</p></DetailSection>
            </div>
            <DetailSection title="Why do we need it?" icon={<Target size={16} />} isBright={isBright}><p className="text-sm leading-7 text-slate-400">{d.why}</p></DetailSection>
            <DetailSection title="How it works internally" icon={<Brain size={16} />} isBright={isBright}><ul className="space-y-2">{d.working.map(x=><li key={x} className="text-sm leading-6 text-slate-400 flex gap-2"><span className="text-cyan-400">▸</span>{x}</li>)}</ul></DetailSection>
            <div className="grid lg:grid-cols-2 gap-5 min-w-0">
              <DetailSection title="Worked example" icon={<CheckCircle2 size={16} />} isBright={isBright}><p className="text-sm leading-7 text-slate-400">{d.example}</p></DetailSection>
              <DetailSection title="Step-by-step dry run" icon={<Clock3 size={16} />} isBright={isBright}><ol className="space-y-2 list-decimal list-inside">{d.dryRun.map(x=><li key={x} className="text-sm leading-6 text-slate-400">{x}</li>)}</ol></DetailSection>
            </div>
            <DetailSection title="Code example" icon={<ChevronRight size={16} />} isBright={isBright}><pre className="overflow-x-auto p-4 rounded-xl bg-black/30 border border-slate-800 text-xs leading-6 text-cyan-200 font-mono whitespace-pre-wrap">{d.code}</pre></DetailSection>
            <div className="grid lg:grid-cols-2 gap-5 min-w-0">
              <DetailSection title="Common mistakes" icon={<Target size={16} />} isBright={isBright}><ul className="space-y-2">{d.mistakes.map(x=><li key={x} className="text-sm text-slate-400 flex gap-2"><span className="text-rose-400">✕</span>{x}</li>)}</ul></DetailSection>
              <DetailSection title="Interview questions" icon={<Brain size={16} />} isBright={isBright}><ul className="space-y-2">{d.interview.map(x=><li key={x} className="text-sm text-slate-400 flex gap-2"><span className="text-purple-400">?</span>{x}</li>)}</ul></DetailSection>
            </div>
            <div className="grid lg:grid-cols-2 gap-5 min-w-0">
              <DetailSection title="When should you use it?" icon={<CheckCircle2 size={16} />} isBright={isBright}><p className="text-sm leading-7 text-slate-400">{d.when}</p></DetailSection>
              <DetailSection title="When should you avoid it?" icon={<X size={16} />} isBright={isBright}><p className="text-sm leading-7 text-slate-400">{d.avoid}</p></DetailSection>
            </div>
          </>); })()}

          {selected.id === 'arrays' && (
            <DetailSection title="Vector / Dynamic Array — Full Explanation" icon={<Layers3 size={16} />} isBright={isBright}>
              <div className="space-y-5">
                <div>
                  <h3 className="text-base font-bold text-cyan-300">What is a Vector?</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-400">A C++ <span className="font-mono text-cyan-300">vector</span> is a dynamic array. It provides O(1) indexed access like an array, while allowing its size to grow as elements are added.</p>
                  <p className="mt-2 text-sm leading-7 text-slate-400"><span className="font-semibold text-cyan-400">Hinglish:</span> Vector ko expandable array samjho. Array ka size usually fixed hota hai, lekin vector me elements add karte jao aur zarurat padne par vector apni storage badha leta hai.</p>
                </div>
                <div className="grid lg:grid-cols-2 gap-5 min-w-0">
                  <div className="min-w-0"><h3 className="text-sm font-bold text-cyan-300">size vs capacity</h3><p className="mt-2 text-sm leading-6 text-slate-400"><span className="font-mono text-cyan-300">size()</span> = current elements. <span className="font-mono text-cyan-300">capacity()</span> = current allocated element capacity.</p><pre className="mt-3 max-w-full overflow-x-auto p-4 rounded-xl bg-black/30 border border-slate-800 text-xs leading-7 text-cyan-200 font-mono whitespace-pre">vector&lt;int&gt; v;

v.push_back(10);
v.push_back(20);

Current state:
size     = 2
capacity = 2 or more</pre></div>
                  <div className="min-w-0"><h3 className="text-sm font-bold text-cyan-300">Why capacity can be bigger</h3><p className="mt-2 text-sm leading-6 text-slate-400">Spare capacity avoids allocating new storage for every append. When growth is needed, a larger block is allocated and existing elements are moved or copied.</p></div>
                </div>
                <div><h3 className="text-sm font-bold text-cyan-300">What happens when it becomes full?</h3><ol className="mt-2 space-y-2 list-decimal list-inside text-sm leading-7 text-slate-400"><li>A larger block is allocated.</li><li>Existing elements are moved or copied.</li><li>Old storage is released.</li><li>The vector continues with the new block and larger capacity.</li></ol><pre className="mt-3 max-w-full overflow-x-auto p-4 rounded-xl bg-black/30 border border-slate-800 text-xs leading-7 text-cyan-200 font-mono whitespace-pre">Before growth:
capacity = 4
size     = 4

[10]
[20]
[30]
[40]

push_back(50)

After growth:
capacity = larger
size     = 5

[10]
[20]
[30]
[40]
[50]</pre></div>
                <div><h3 className="text-sm font-bold text-cyan-300">Important Vector Operations</h3><div className="overflow-x-auto mt-3"><table className="w-full text-xs"><thead><tr className="text-left text-slate-500 border-b border-slate-800"><th className="py-2 pr-4">Operation</th><th className="py-2 pr-4">Typical complexity</th><th className="py-2">Meaning</th></tr></thead><tbody>{[['v[i]','O(1)','Direct indexed access.'],['push_back(x)','Amortized O(1)','Append; occasional growth can cost O(n).'],['pop_back()','O(1)','Remove the last element.'],['insert(begin()+i,x)','O(n)','Elements may need to shift.'],['erase(begin()+i)','O(n)','Elements after i may shift left.'],['size()','O(1)','Current number of elements.'],['capacity()','O(1)','Current allocated capacity.'],['reserve(n)','At most O(n) when growth happens','Requests capacity for at least n elements.']].map(([op,complexity,meaning])=><tr key={op} className="border-b border-slate-800/60"><td className="py-2.5 pr-4 font-mono text-cyan-300">{op}</td><td className="py-2.5 pr-4 font-mono text-cyan-400">{complexity}</td><td className="py-2.5 text-slate-400">{meaning}</td></tr>)}</tbody></table></div></div>
                <div className="grid lg:grid-cols-2 gap-5 min-w-0"><div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/10"><h3 className="text-sm font-bold text-cyan-300">Array vs Vector</h3><ul className="mt-2 space-y-2 text-sm leading-6 text-slate-400"><li>• Array: fixed-size storage in the basic model.</li><li>• Vector: dynamic-size array abstraction.</li><li>• Both provide O(1) indexed access.</li><li>• Vector manages growth for you.</li></ul></div><div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10"><h3 className="text-sm font-bold text-purple-300">When should you use Vector?</h3><p className="mt-2 text-sm leading-6 text-slate-400">Use vector when you need an indexed collection whose size may change. It is the default practical choice for many C++ DSA problems.</p></div></div>
                <div><h3 className="text-sm font-bold text-cyan-300">Code Example</h3><pre className="mt-3 max-w-full overflow-x-auto p-4 rounded-xl bg-black/30 border border-slate-800 text-xs leading-6 text-cyan-200 font-mono whitespace-pre">#include &lt;vector&gt;
using namespace std;

vector&lt;int&gt; v;
v.push_back(10);
v.push_back(20);
v.push_back(30);

cout &lt;&lt; v[1];     // 20
cout &lt;&lt; v.size(); // 3</pre></div>
                <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10"><h3 className="text-sm font-bold text-amber-300">Common beginner mistakes</h3><ul className="mt-2 space-y-2 text-sm leading-6 text-slate-400"><li>• Confusing size with capacity.</li><li>• Assuming every push_back is always O(1), instead of amortized O(1).</li><li>• Repeatedly inserting at the beginning and expecting O(1).</li><li>• Ignoring iterator/reference/pointer invalidation after reallocation.</li></ul></div>
              </div>
            </DetailSection>
          )}

          <DetailSection title="Memory usage" icon={<HardDrive size={16} />} isBright={isBright}>
            <p className="text-sm leading-7 text-slate-400">{selected.memory}</p>
          </DetailSection>

          <div className="grid lg:grid-cols-2 gap-5 min-w-0">
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
    <div ref={scrollRef} key={showIntro ? 'dsa-intro' : selected ? `dsa-topic-${selected.id}` : 'dsa-list'} className={`h-[calc(100dvh-62px)] min-h-0 overflow-y-auto p-4 md:p-8 ${isBright ? 'bg-slate-50 text-slate-900' : 'bg-[#070b14] text-slate-100'}`}>
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

        <button type="button" onClick={openIntro} className={`w-full text-left p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:border-cyan-400/60 hover:shadow-lg cursor-pointer ${isBright ? 'bg-white border-slate-200' : 'bg-gradient-to-r from-slate-900/90 to-cyan-950/20 border-cyan-900/50'}`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><BookOpen size={23} /></div>
              <div><span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400">01 · START HERE</span><h2 className="mt-1 text-xl font-extrabold">Introduction to DSA</h2><p className="mt-1 text-xs text-slate-500">Build the foundation before diving into data structures and algorithms.</p></div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">Begin learning <ChevronRight size={17} /></div>
          </div>
        </button>

        <div className="space-y-8">
          <section>
            <div className="mb-4 flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono font-bold tracking-widest text-cyan-400">FOUNDATION</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>
            <div className="space-y-4">
              <button type="button" onClick={openMemory} className={`w-full text-left p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:border-cyan-400/60 hover:shadow-lg cursor-pointer ${isBright ? 'bg-white border-slate-200' : 'bg-gradient-to-r from-slate-900/90 to-cyan-950/20 border-cyan-900/50'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4"><div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><HardDrive size={23} /></div><div><span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400">02 · UNDERSTAND THIS</span><h2 className="mt-1 text-xl font-extrabold">Memory &amp; Memory Management</h2><p className="mt-1 text-xs text-slate-500">Understand memory, addresses, pointers, stack, heap and dynamic allocation.</p></div></div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">Begin learning <ChevronRight size={17} /></div>
                </div>
              </button>
              <button type="button" onClick={openComplexity} className={`w-full text-left p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:border-cyan-400/60 hover:shadow-lg cursor-pointer ${isBright ? 'bg-white border-slate-200' : 'bg-gradient-to-r from-slate-900/90 to-cyan-950/20 border-cyan-900/50'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4"><div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"><Clock3 size={23} /></div><div><span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400">03 · LEARN THIS NEXT</span><h2 className="mt-1 text-xl font-extrabold">Time &amp; Space Complexity</h2><p className="mt-1 text-xs text-slate-500">Learn how to find complexity from code and analyze algorithms.</p></div></div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">Begin learning <ChevronRight size={17} /></div>
                </div>
              </button>
              <button type="button" onClick={openProblemSolving} className={`w-full text-left p-6 rounded-2xl border transition-all hover:-translate-y-1 hover:border-cyan-400/60 hover:shadow-lg cursor-pointer ${isBright ? 'bg-white border-slate-200' : 'bg-slate-900/70 border-slate-800'}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4"><div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 border border-purple-500/20"><Brain size={23} /></div><div><span className="text-[10px] font-mono font-bold tracking-widest text-purple-400">04 · FOUNDATION</span><h2 className="mt-1 text-xl font-extrabold">Problem Solving &amp; Algorithmic Thinking</h2><p className="mt-1 text-xs text-slate-500">Learn how to break problems down, choose approaches, find bottlenecks and derive efficient solutions.</p></div></div>
                  <span className="text-xs font-semibold text-purple-400">Begin learning <ChevronRight size={17} className="inline" /></span>
                </div>
              </button>
            </div>
          </section>

          {[
            ['CORE DATA STRUCTURES', ['arrays','sorting-searching','linked-lists','stacks-queues','binary-trees','bst','heaps','hashing']],
            ['ALGORITHMIC PATTERNS', ['recursion-backtracking','greedy']],
            ['ADVANCED', ['graphs','dynamic-programming','trie','bit-manipulation','disjoint-set','segment-fenwick-trees']],
          ].map(([phase, ids]) => {
            const phaseTopics = ids.map(id => filtered.find(topic => topic.id === id)).filter(Boolean);
            if (!phaseTopics.length) return null;
            return (
              <section key={phase}>
                <div className="mb-4 flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-mono font-bold tracking-widest text-cyan-400">{phase}</span>
                  <div className="h-px flex-1 bg-slate-800" />
                </div>
                <div className="space-y-4">
                  {phaseTopics.map((topic) => (
                    <TopicCard key={topic.id} topic={topic} onOpen={openTopic} isBright={isBright} />
                  ))}
                </div>
              </section>
            );
          })}
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
