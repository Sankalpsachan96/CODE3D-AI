package com.code3d.service;

import com.code3d.model.QuizQuestion;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class QuizService {

    public List<QuizQuestion> generateQuiz(String conceptId) {
        if (conceptId == null || conceptId.isBlank()) conceptId = "array-loop";

        return switch (conceptId.toLowerCase()) {
            case "2d-array", "matrix" -> List.of(
                    new QuizQuestion("mat-1", "In a row-major 2D array arr[R][C], how is the memory address of element arr[i][j] computed from base address B?",
                            List.of("B + (i * C + j) * size", "B + (j * R + i) * size", "B + (i + j) * size", "B + (i * j) * size"),
                            0, "Row-major order lays out rows sequentially: each row has C columns, so row i skips i*C elements plus j."),
                    new QuizQuestion("mat-2", "What is the time complexity to traverse all elements in an N x M matrix?",
                            List.of("O(N + M)", "O(N * M)", "O(min(N, M))", "O(N log M)"),
                            1, "Traversing every cell in an N x M matrix requires visiting N*M entries in nested loops, taking O(N*M) time."),
                    new QuizQuestion("mat-3", "What is true about the primary diagonal elements of an N x N square matrix?",
                            List.of("Row index i equals Column index j", "Row index i + Column index j = N", "Row index i > Column index j", "Column index j is always 0"),
                            0, "For any square matrix, the primary diagonal is defined by all cells where row index equals column index (i == j)."),
                    new QuizQuestion("mat-4", "In C/C++, how are elements of static 2D arrays allocated in physical RAM?",
                            List.of("Contiguous linear block of memory", "Fragmented linked segments", "Separate heap blocks per row", "Hash table buckets"),
                            0, "Static 2D arrays in C/C++ occupy a single contiguous block of bytes in row-major sequence.")
            );

            case "linked-list", "doubly-linked-list", "doubly-ll" -> List.of(
                    new QuizQuestion("ll-1", "What is the primary advantage of a Singly Linked List over a contiguous array?",
                            List.of("O(1) random index access", "Dynamic size and O(1) insertion/deletion at known node", "Better CPU cache locality", "Zero memory overhead"),
                            1, "Linked lists allocate nodes dynamically on the heap and can insert/remove nodes in O(1) time without shifting elements."),
                    new QuizQuestion("ll-2", "In Floyd's Tortoise and Hare cycle detection algorithm, what is the speed ratio of the two pointers?",
                            List.of("Hare advances 2 nodes while Tortoise advances 1 node", "Hare advances 3 nodes while Tortoise advances 2", "Both advance at equal speeds", "Tortoise is stationary"),
                            0, "The fast pointer (Hare) advances two steps per iteration while the slow pointer (Tortoise) advances one. If a cycle exists, they must collide."),
                    new QuizQuestion("ll-3", "What is the time complexity to reverse a Singly Linked List of n nodes in-place?",
                            List.of("O(1)", "O(log n)", "O(n)", "O(n²)"),
                            2, "Iterating through the list once and reversing the next pointers requires O(n) time and O(1) auxiliary space."),
                    new QuizQuestion("ll-4", "In a Doubly Linked List, what additional reference does each node maintain compared to a Singly Linked List?",
                            List.of("prev pointer to previous node", "root pointer to tree", "tail pointer to end", "index counter"),
                            0, "Each node in a doubly linked list stores both next and prev pointers, enabling bidirectional traversal.")
            );

            case "stack", "parentheses-stack", "stack-parentheses", "balanced-parentheses" -> List.of(
                    new QuizQuestion("st-1", "What fundamental architectural principle does a Stack adhere to?",
                            List.of("FIFO (First In First Out)", "LIFO (Last In First Out)", "Random Access Order", "Priority-based Dequeue"),
                            1, "Stacks operate on LIFO (Last In First Out): the most recently pushed item is the first one popped."),
                    new QuizQuestion("st-2", "How does a Stack evaluate whether a string of brackets '({[]})' is balanced?",
                            List.of("Push opening brackets; pop and check match on closing brackets", "Count total number of characters", "Sort the brackets alphabetically", "Use two pointers from edges"),
                            0, "Opening brackets are pushed onto the stack; each closing bracket must match the bracket popped from the top of the stack."),
                    new QuizQuestion("st-3", "In the Shunting Yard algorithm, what role does the Stack play during Infix-to-Postfix conversion?",
                            List.of("Holding operator symbols based on precedence", "Storing operand numbers", "Reversing the final output", "Allocating array memory"),
                            0, "Operators (+, -, *, /) are staged in a stack according to operator precedence and associativity."),
                    new QuizQuestion("st-4", "What is a Monotonic Stack primarily used to solve in O(n) linear time?",
                            List.of("Next Greater Element / Daily Temperatures problems", "Finding shortest path in graphs", "Sorting strings alphabetically", "Matrix multiplication"),
                            0, "A monotonic stack maintains elements in strictly increasing or decreasing order, enabling Next Greater Element queries in O(n) time.")
            );

            case "queue", "circular-queue" -> List.of(
                    new QuizQuestion("q-1", "What operational discipline does a standard Queue follow?",
                            List.of("LIFO (Last In First Out)", "FIFO (First In First Out)", "Sorted Heap Ordering", "Depth-First Sequence"),
                            1, "Queues follow FIFO (First In First Out): the first item added (at rear) is the first item removed (from front)."),
                    new QuizQuestion("q-2", "In a Circular Queue implemented with an array of capacity N, how is the rear pointer updated after enqueue?",
                            List.of("rear = rear + 1", "rear = (rear + 1) % N", "rear = (rear - 1) % N", "rear = N - 1"),
                            1, "Modulo arithmetic (rear + 1) % N allows the rear index to wrap around to index 0 when it reaches the capacity boundary."),
                    new QuizQuestion("q-3", "What distinguishes a Deque (Double-Ended Queue) from a standard queue?",
                            List.of("Elements can be inserted and removed from both Front and Rear ends in O(1)", "It only allows push operations", "It stores only floating point numbers", "It enforces LIFO ordering exclusively"),
                            0, "A Deque supports pushFront, pushRear, popFront, and popRear in O(1) time."),
                    new QuizQuestion("q-4", "What underlying data structure typically backs an efficient Priority Queue?",
                            List.of("Binary Heap (Min-Heap / Max-Heap)", "Unsorted Linked List", "Static 2D Array", "Circular Ring Buffer"),
                            0, "A binary heap provides O(log n) insertion and O(log n) extraction of the minimum or maximum priority element.")
            );

            case "bst", "tree" -> List.of(
                    new QuizQuestion("bst-1", "In a Binary Search Tree (BST), what invariant must hold for any given node with key K?",
                            List.of("Left child key < K and Right child key > K", "Left child key > K and Right child key < K", "Both children keys == K", "Left child key + Right child key == K"),
                            0, "BST invariant: all keys in the left subtree are strictly less than K, and all keys in the right subtree are strictly greater."),
                    new QuizQuestion("bst-2", "What is the worst-case time complexity of searching in an unbalanced degenerate BST?",
                            List.of("O(1)", "O(log n)", "O(n)", "O(n log n)"),
                            2, "When keys are inserted in sorted order, the BST degenerates into a linear linked list with O(n) height and search time."),
                    new QuizQuestion("bst-3", "Which tree traversal order visits nodes in strictly ascending numerical order for a BST?",
                            List.of("Pre-order (Root, Left, Right)", "In-order (Left, Root, Right)", "Post-order (Left, Right, Root)", "Level-order (BFS)"),
                            1, "In-order traversal visits Left Subtree -> Current Node -> Right Subtree, reproducing the sorted sequence."),
                    new QuizQuestion("bst-4", "What is the maximum number of nodes in a binary tree of depth/height h (root at level 1)?",
                            List.of("2^h - 1", "2^(h - 1)", "2*h", "h^2"),
                            0, "A full binary tree has 1 + 2 + 4 + ... + 2^(h-1) = 2^h - 1 total nodes.")
            );

            case "trees-advanced", "avl", "avl-tree", "tree-traversals", "tree-traversal" -> List.of(
                    new QuizQuestion("avl-1", "In an AVL self-balancing binary search tree, what is the valid range for the balance factor of any node?",
                            List.of("{-1, 0, +1}", "{-2, 0, +2}", "{0, 1, 2}", "{all integers}"),
                            0, "An AVL tree maintains the balance factor (height(left) - height(right)) within {-1, 0, +1} at all times via rotations."),
                    new QuizQuestion("avl-2", "Which rotation restores balance after an insertion into the right subtree of the left child (LR imbalance)?",
                            List.of("Left-Right (LR) Double Rotation", "Single Right (RR) Rotation", "Single Left (LL) Rotation", "No rotation needed"),
                            0, "An LR imbalance is resolved by a left rotation on the left child followed by a right rotation on the parent node."),
                    new QuizQuestion("avl-3", "What is the time complexity to find the Lowest Common Ancestor (LCA) of two nodes in a balanced BST?",
                            List.of("O(log n)", "O(n²)", "O(1)", "O(n log n)"),
                            0, "Starting from the root, we walk down the tree until one node is on the left and the other is on the right, taking O(h) = O(log n) time."),
                    new QuizQuestion("avl-4", "Which tree traversal uses a FIFO queue to visit nodes layer-by-layer?",
                            List.of("Breadth-First / Level-Order Traversal", "Depth-First Pre-order", "In-order Traversal", "Post-order Traversal"),
                            0, "Level-order traversal visits nodes by horizontal depth levels using a FIFO queue.")
            );

            case "graphs", "graph", "graph-bfs" -> List.of(
                    new QuizQuestion("grp-1", "What is the time complexity of Breadth-First Search (BFS) on a graph with V vertices and E edges using an Adjacency List?",
                            List.of("O(V + E)", "O(V * E)", "O(V²)", "O(E log V)"),
                            0, "Each vertex is enqueued once and each edge is explored once, yielding O(V + E) linear time complexity."),
                    new QuizQuestion("grp-2", "Which algorithm finds the single-source shortest path in a graph with non-negative edge weights?",
                            List.of("Dijkstra's Algorithm", "Kruskal's MST Algorithm", "Tarjan's SCC", "Floyd-Warshall"),
                            0, "Dijkstra's algorithm uses a min-priority queue to greedily select the vertex with the shortest tentative distance."),
                    new QuizQuestion("grp-3", "What condition must a graph satisfy to possess a valid Topological Ordering?",
                            List.of("Must be a Directed Acyclic Graph (DAG)", "Must be fully connected and undirected", "Must contain at least one cycle", "Must be a complete bipartite graph"),
                            0, "Topological sort is only defined for DAGs (Directed Acyclic Graphs) where dependencies contain no circular loops."),
                    new QuizQuestion("grp-4", "Which data structure is intrinsically utilized by Depth-First Search (DFS) during recursive backtracking?",
                            List.of("Stack (Call Stack)", "Queue", "Binary Heap", "Matrix"),
                            0, "DFS explores deeply along each branch using the function call stack or an explicit LIFO stack.")
            );

            case "dp-hashing", "dp", "dp-knapsack", "knapsack", "hash-table", "hashing" -> List.of(
                    new QuizQuestion("dp-1", "What are the two core properties that indicate a problem can be solved using Dynamic Programming?",
                            List.of("Optimal Substructure and Overlapping Subproblems", "Greedy Choice and Constant Time", "Divide and Conquer with Independent Subproblems", "Sorted Input and Monotonicity"),
                            0, "DP applies when solutions to subproblems combine into an optimal overall solution and the same subproblems recur repeatedly."),
                    new QuizQuestion("dp-2", "In the 0/1 Knapsack problem with N items and capacity W, what is the standard 2D DP table size and time complexity?",
                            List.of("O(N * W)", "O(2^N)", "O(N log W)", "O(N + W)"),
                            0, "The DP state table has dimensions (N+1) x (W+1), requiring O(N*W) pseudo-polynomial time."),
                    new QuizQuestion("dp-3", "In hash table collision resolution, what does Separate Chaining do when two keys hash to the same bucket?",
                            List.of("Stores colliding key-value pairs in a linked list at that bucket", "Probes to the next empty linear index", "Doubles the hash key", "Throws a HashCollisionException"),
                            0, "Separate chaining maintains a linked list (or red-black tree) at each bucket index to hold colliding entries."),
                    new QuizQuestion("dp-4", "What is the amortized average time complexity of get(key) and put(key, val) in a well-distributed Hash Table?",
                            List.of("O(1) Constant Time", "O(log n)", "O(n)", "O(n log n)"),
                            0, "With a uniform hash function and low load factor, hash table lookups and insertions run in average O(1) time.")
            );

            case "bubble-sort", "sorting" -> List.of(
                    new QuizQuestion("bs-1", "What is the worst-case and average-case time complexity of standard Bubble Sort?",
                            List.of("O(n)", "O(n log n)", "O(n²)", "O(2^n)"),
                            2, "Bubble sort compares adjacent pairs in nested passes, requiring n*(n-1)/2 comparisons, yielding O(n²) time."),
                    new QuizQuestion("bs-2", "What is an optimized condition to terminate Bubble Sort early in O(n) best-case time?",
                            List.of("If a pass completes with 0 swaps", "If the first element is negative", "If the array length is odd", "When counter i reaches n/2"),
                            0, "If an entire pass completes without swapping any adjacent pairs, the array is already sorted and we can break immediately."),
                    new QuizQuestion("bs-3", "Is standard Bubble Sort a stable sorting algorithm, and why?",
                            List.of("Yes, because equal elements are never swapped past each other", "No, because it moves elements across large distances", "Yes, because its space complexity is O(n)", "No, stability only applies to QuickSort"),
                            0, "Bubble sort only swaps if arr[j] > arr[j+1]; when arr[j] == arr[j+1], order is preserved, guaranteeing stability."),
                    new QuizQuestion("bs-4", "What is the auxiliary space complexity of Bubble Sort?",
                            List.of("O(1)", "O(n)", "O(log n)", "O(n²)"),
                            0, "Bubble Sort sorts in-place using only a temporary swap variable, requiring O(1) auxiliary space.")
            );

            case "binary-search", "searching" -> List.of(
                    new QuizQuestion("bin-1", "What strict precondition must be satisfied before executing Binary Search on an array?",
                            List.of("The array elements must be sorted", "The array must contain only unique elements", "The array size must be a power of 2", "The array must be stored on the heap"),
                            0, "Binary search relies on order comparison to discard half the search space, so elements must be sorted."),
                    new QuizQuestion("bin-2", "Why is 'mid = low + (high - low) / 2' preferred over 'mid = (low + high) / 2' in Java, C, and C++?",
                            List.of("It prevents integer overflow when low + high exceeds INT_MAX", "It computes faster in assembly", "It handles floating point numbers", "It works for negative indices"),
                            0, "When low and high are large (e.g. > 1 billion), low + high overflows signed 32-bit integer limits and produces a negative index."),
                    new QuizQuestion("bin-3", "What is the worst-case time complexity of Binary Search on an array of size n?",
                            List.of("O(1)", "O(log n)", "O(n)", "O(n log n)"),
                            1, "At each step the search range is halved (n, n/2, n/4...), terminating in at most log2(n) comparisons."),
                    new QuizQuestion("bin-4", "In Python, which standard library module implements binary search and insertion point algorithms?",
                            List.of("bisect", "searchlib", "binary", "algorithms"),
                            0, "Python's standard library module 'bisect' (bisect_left, bisect_right) implements binary searching.")
            );

            case "recursion", "factorial" -> List.of(
                    new QuizQuestion("rec-1", "What critical condition must every recursive function contain to avoid a StackOverflowError?",
                            List.of("A Base Case (terminating condition)", "A loop statement", "A global counter variable", "A try-catch block"),
                            0, "Without a base case, recursive calls continue infinitely until the call stack runs out of memory."),
                    new QuizQuestion("rec-2", "What is the maximum call stack depth for recursive factorial(n) = n * factorial(n - 1)?",
                            List.of("O(1)", "O(log n)", "O(n)", "O(n²)"),
                            2, "Factorial unwinds n activation frames before reaching the base case factorial(1), requiring O(n) stack memory."),
                    new QuizQuestion("rec-3", "What technique transforms a recursive function so the compiler/runtime can reuse the current stack frame?",
                            List.of("Tail Call Optimization (TCO)", "Loop Inversion", "Memoization", "Garbage Collection"),
                            0, "In tail recursion, the recursive call is the final operation in the function, allowing stack frame reuse."),
                    new QuizQuestion("rec-4", "What occurs behind the scenes on the CPU call stack during a recursive function invocation?",
                            List.of("A new stack frame containing return address and local variables is pushed", "Heap memory is deallocated", "CPU clock speed increases", "The operating system restarts"),
                            0, "Each invocation pushes a stack frame with parameter values, local variables, and the return address onto the call stack.")
            );

            case "c-lang", "c" -> List.of(
                    new QuizQuestion("c-1", "In C, what is the output of sizeof(int*) on a modern 64-bit architecture?",
                            List.of("4 bytes", "8 bytes", "2 bytes", "16 bytes"),
                            1, "On a 64-bit architecture, memory addresses are 64 bits wide, making all pointers exactly 8 bytes."),
                    new QuizQuestion("c-2", "Which function in C is used to allocate uninitialized dynamic memory on the heap?",
                            List.of("malloc()", "calloc()", "realloc()", "free()"),
                            0, "malloc(size) allocates a contiguous memory segment of specified bytes without clearing existing byte values."),
                    new QuizQuestion("c-3", "What does the dereference operator '*' do when applied to a pointer variable (e.g. *ptr)?",
                            List.of("Yields the address of the pointer itself", "Accesses the value stored at the memory address held by the pointer", "Multiplies the pointer by 2", "Frees the pointer memory"),
                            1, "Dereferencing *ptr accesses the data residing at the address stored inside the pointer."),
                    new QuizQuestion("c-4", "What undefined behavior occurs when accessing an array beyond its declared boundary in C?",
                            List.of("ArrayIndexOutOfBoundsException is thrown", "Buffer Overflow / Segmentation Fault", "Compilation fails automatically", "The array auto-expands"),
                            1, "C does not perform runtime bounds checking; out-of-bounds access reads or corrupts adjacent memory, causing segmentation faults.")
            );

            case "cpp-lang", "cpp", "c++" -> List.of(
                    new QuizQuestion("cpp-1", "In C++, which container provides a dynamic array with amortized O(1) push_back?",
                            List.of("std::vector", "std::list", "std::set", "std::map"),
                            0, "std::vector manages a contiguous heap buffer that dynamically doubles capacity when full, achieving amortized O(1) append."),
                    new QuizQuestion("cpp-2", "What is the primary difference between std::vector and std::list in C++ STL?",
                            List.of("vector is contiguous with O(1) random access; list is a doubly-linked list with O(n) access", "list has O(1) random access; vector is linked", "vector cannot be resized", "list uses less memory per element"),
                            0, "std::vector stores elements contiguously for O(1) index lookups; std::list stores bidirectional nodes with pointer overhead."),
                    new QuizQuestion("cpp-3", "What is the time complexity of std::sort() in the C++ Standard Template Library?",
                            List.of("O(n²)", "O(n log n)", "O(n)", "O(log n)"),
                            1, "std::sort uses Introsort (QuickSort + HeapSort + InsertionSort), guaranteeing O(n log n) worst-case time."),
                    new QuizQuestion("cpp-4", "In C++, what is a reference variable (e.g. int& ref = x)?",
                            List.of("An alias/alternative name for an existing variable", "A copy of x in separate memory", "A pointer that can be NULL", "A const integer"),
                            0, "A C++ reference is an immutable alias bound to an existing variable without requiring manual dereference syntax.")
            );

            case "python-lang", "python" -> List.of(
                    new QuizQuestion("py-1", "In Python, how are lists implemented internally in CPython?",
                            List.of("Contiguous arrays of pointers to Python objects", "Doubly linked lists", "Binary Search Trees", "Hash tables"),
                            0, "CPython lists are variable-length contiguous arrays of object pointers, enabling O(1) indexed lookups."),
                    new QuizQuestion("py-2", "What is the average time complexity of key lookup and insertion in a Python dictionary (dict)?",
                            List.of("O(1)", "O(log n)", "O(n)", "O(n log n)"),
                            0, "Python dicts use an optimized combined-table hash table algorithm with open addressing, delivering average O(1) lookups."),
                    new QuizQuestion("py-3", "What does list slicing 'arr[::-1]' produce in Python?",
                            List.of("A reversed copy of the list", "The first element of the list", "A ValueError exception", "The list sorted ascending"),
                            0, "Slicing with step -1 traverses the sequence backwards, returning a reversed shallow copy."),
                    new QuizQuestion("py-4", "What is the difference between '==' and 'is' in Python?",
                            List.of("'==' checks equality of value, while 'is' checks object identity (same memory address)", "'==' checks object identity, while 'is' checks value", "They are 100% identical in all cases", "'is' only works on strings"),
                            0, "'==' invokes __eq__ to test value equivalence, whereas 'is' tests whether two variables point to the exact same object in memory.")
            );

            case "js-lang", "javascript", "js" -> List.of(
                    new QuizQuestion("js-1", "How does the JavaScript Event Loop handle asynchronous operations like setTimeout and Promises?",
                            List.of("Microtasks (Promises) execute before Macrotasks (setTimeout) in the event loop cycle", "All callbacks execute synchronously in order", "setTimeout always runs first", "Macrotasks cancel microtasks"),
                            0, "The V8 event loop drains the entire microtask queue (Promise resolution callbacks) after current execution before picking the next macrotask."),
                    new QuizQuestion("js-2", "What is a Closure in JavaScript?",
                            List.of("A function bundled together with references to its surrounding lexical environment", "An HTML tag closer", "A locked object property", "An unhandled rejection handler"),
                            0, "A closure gives an inner function access to an outer function's scope variables even after the outer function has returned."),
                    new QuizQuestion("js-3", "What is the difference between '==' and '===' in JavaScript?",
                            List.of("'===' checks both value and strict type without type coercion, while '==' coerces types", "'==' is stricter than '==='", "They are identical aliases", "'===' only works for numbers"),
                            0, "The triple equals '===' enforces strict equality with no implicit type casting (e.g. 5 === '5' is false)."),
                    new QuizQuestion("js-4", "Which Array higher-order method transforms each element into a new array of equal length without mutating the original?",
                            List.of("Array.prototype.map()", "Array.prototype.forEach()", "Array.prototype.pop()", "Array.prototype.sort()"),
                            0, "map(fn) returns a brand new array populated with the results of calling the provided function on every element.")
            );

            default -> List.of(
                    new QuizQuestion("arr-1", "What will be the value of 'i' when the loop condition 'i < arr.length' first evaluates to FALSE for an array of length 4?",
                            List.of("3", "4", "5", "0"),
                            1, "The loop terminates when i reaches 4 because 4 < 4 evaluates to FALSE."),
                    new QuizQuestion("arr-2", "What is the time complexity of accessing an element in an array by index in Java, C, C++, Python, and JavaScript?",
                            List.of("O(1) Constant Time", "O(n) Linear Time", "O(log n) Logarithmic Time", "O(n²) Quadratic Time"),
                            0, "Arrays provide direct random memory access in O(1) constant time via pointer arithmetic: base + index * size."),
                    new QuizQuestion("arr-3", "How many total iterations does this for-loop execute for int[] arr = {10, 20, 30, 40}?",
                            List.of("3", "4", "5", "Infinite"),
                            1, "The loop runs for i = 0, 1, 2, and 3, which is exactly 4 iterations."),
                    new QuizQuestion("arr-4", "In Java, what exception is thrown if you access arr[4] on an array of length 4?",
                            List.of("NullPointerException", "ArrayIndexOutOfBoundsException", "IllegalArgumentException", "ArithmeticException"),
                            1, "Java enforces runtime bounds checking and throws ArrayIndexOutOfBoundsException when index >= length.")
            );
        };
    }
}
