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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return LEARNING_TOPICS;
    return LEARNING_TOPICS.filter((topic) =>
      [topic.title, topic.summary, ...topic.types, ...topic.uses, ...topic.advanced]
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
              <button onClick={() => setSelected(null)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer" aria-label="Close topic">
                <X size={17} />
              </button>
            </div>
          </div>

          <DetailSection title="Types / Variants" icon={<Layers3 size={16} />} isBright={isBright}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {selected.types.map((type) => <div key={type} className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/10 text-xs font-semibold">{type}</div>)}
            </div>
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

          <div className={`p-5 rounded-2xl border ${isBright ? 'bg-cyan-50 border-cyan-200' : 'bg-cyan-950/20 border-cyan-900/50'}`}>
            <div className="flex gap-3">
              <BookOpen size={18} className="text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <h3 className="font-bold text-sm">Next learning layer</h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-400">This topic foundation is now structured for deeper additions: internal working, worked examples, language-specific implementations, dry runs, correctness reasoning, 3D visualization links, common mistakes and interview questions.</p>
              </div>
            </div>
          </div>
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
