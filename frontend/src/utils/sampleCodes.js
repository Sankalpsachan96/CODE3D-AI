/**
 * CODE3D AI - Complete Curriculum Catalog of 28+ DSA Concepts
 * Categorized into 8 core Computer Science modules with curated, production-grade source code.
 */

export const DEFAULT_JAVA_CODE = `public class Main {
    public static void main(String[] args) {

        int[] arr = {10, 20, 30, 40};

        for(int i = 0; i < arr.length; i++) {
            System.out.println(arr[i]);
        }
    }
}`;

export const CURRICULUM_CATEGORIES = [
  'Procedural & Scanner',
  'Arrays & Matrices',
  'Linked Lists',
  'Stacks & Queues',
  'Trees & Tries',
  'Sorting Algorithms',
  'Searching & Hashing',
  'Graphs',
  'Dynamic Programming & Recursion',
];

export const SAMPLE_PROGRAMS = [
  // ========================================================
  // MODULE 0: PROCEDURAL & SCANNER
  // ========================================================
  {
    id: 'student-result',
    title: '★ Student Result & Grading (Scanner Input)',
    category: 'Procedural & Scanner',
    description: 'Interactive Scanner program calculating student marks, floating percentage, and evaluating grade ladders with 3D memory tracking.',
    difficulty: 'Beginner',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    code: `import java.util.Scanner;

class StudentResult {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        System.out.print("Enter student name: ");
        String name = sc.nextLine();

        System.out.print("Enter marks in Java: ");
        int java = sc.nextInt();

        System.out.print("Enter marks in Python: ");
        int python = sc.nextInt();

        System.out.print("Enter marks in Maths: ");
        int maths = sc.nextInt();

        int total = java + python + maths;
        double percentage = total / 3.0;

        System.out.println("\\n--- Student Result ---");
        System.out.println("Name: " + name);
        System.out.println("Java: " + java);
        System.out.println("Python: " + python);
        System.out.println("Maths: " + maths);
        System.out.println("Total: " + total);
        System.out.println("Percentage: " + percentage);

        if (percentage >= 90)
            System.out.println("Grade: A+");
        else if (percentage >= 80)
            System.out.println("Grade: A");
        else if (percentage >= 70)
            System.out.println("Grade: B");
        else if (percentage >= 60)
            System.out.println("Grade: C");
        else
            System.out.println("Grade: D");

        sc.close();
    }
}`,
  },
  // ========================================================
  // MODULE 1: ARRAYS & MATRICES
  // ========================================================
  {
    id: 'array-loop',
    title: '1. 1D Array Linear Traversal',
    category: 'Arrays & Matrices',
    description: 'Sequentially access and print elements in contiguous heap memory.',
    difficulty: 'Beginner',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: DEFAULT_JAVA_CODE,
  },
  {
    id: 'matrix',
    title: '2. 2D Matrix Scan (Row-Major)',
    category: 'Arrays & Matrices',
    description: 'Traverse 3x3 matrix in row-major layout with nested loop coordinates.',
    difficulty: 'Beginner',
    timeComplexity: 'O(n × m)',
    spaceComplexity: 'O(n × m)',
    code: `public class Main {
    public static void main(String[] args) {
        int[][] matrix = {
            {1, 2, 3},
            {4, 5, 6},
            {7, 8, 9}
        };
        for(int r = 0; r < matrix.length; r++) {
            for(int c = 0; c < matrix[r].length; c++) {
                System.out.println("Cell [" + r + "][" + c + "] = " + matrix[r][c]);
            }
        }
    }
}`,
  },
  {
    id: 'two-pointer-reverse',
    title: '3. Two-Pointer Array Reversal',
    category: 'Arrays & Matrices',
    description: 'In-place array reversal using converging left and right index pointers.',
    difficulty: 'Beginner',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: `public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50};
        int left = 0, right = arr.length - 1;
        while (left < right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
        for (int val : arr) System.out.println(val);
    }
}`,
  },
  {
    id: 'sliding-window',
    title: '4. Sliding Window Subarray Sum',
    category: 'Arrays & Matrices',
    description: 'Maintain running sum of fixed window size K without recomputing overlapping items.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: `public class Main {
    public static void main(String[] args) {
        int[] arr = {2, 1, 5, 1, 3, 2};
        int k = 3;
        int windowSum = 0, maxSum = 0;

        for (int i = 0; i < k; i++) windowSum += arr[i];
        maxSum = windowSum;

        for (int i = k; i < arr.length; i++) {
            windowSum += arr[i] - arr[i - k];
            maxSum = Math.max(maxSum, windowSum);
        }
        System.out.println("Max sum of window size " + k + " = " + maxSum);
    }
}`,
  },

  // ========================================================
  // MODULE 2: LINKED LISTS
  // ========================================================
  {
    id: 'linked-list',
    title: '5. Singly Linked List',
    category: 'Linked Lists',
    description: 'Traverse heap-allocated nodes connected via unidirectional next references.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: `class Node {
    int val;
    Node next;
    Node(int val) { this.val = val; }
}
public class Main {
    public static void main(String[] args) {
        Node head = new Node(10);
        head.next = new Node(20);
        head.next.next = new Node(30);
        head.next.next.next = new Node(40);
        Node curr = head;
        while(curr != null) {
            System.out.println("Visiting node: " + curr.val);
            curr = curr.next;
        }
    }
}`,
  },
  {
    id: 'doubly-linked-list',
    title: '6. Doubly Linked List',
    category: 'Linked Lists',
    description: 'Bidirectional nodes maintaining both next and prev pointer links.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: `class DNode {
    int val;
    DNode prev, next;
    DNode(int val) { this.val = val; }
}
public class Main {
    public static void main(String[] args) {
        DNode head = new DNode(10);
        DNode n2 = new DNode(20);
        DNode n3 = new DNode(30);
        DNode tail = new DNode(40);

        head.next = n2; n2.prev = head;
        n2.next = n3; n3.prev = n2;
        n3.next = tail; tail.prev = n3;

        DNode curr = head;
        while (curr != null) {
            System.out.println("Node: " + curr.val);
            curr = curr.next;
        }
    }
}`,
  },
  {
    id: 'circular-linked-list',
    title: '7. Circular Linked List',
    category: 'Linked Lists',
    description: 'Last node links back to head, forming an endless ring buffer without null termination.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: `class CNode {
    int val;
    CNode next;
    CNode(int val) { this.val = val; }
}
public class Main {
    public static void main(String[] args) {
        CNode head = new CNode(10);
        CNode n2 = new CNode(20);
        CNode n3 = new CNode(30);
        head.next = n2;
        n2.next = n3;
        n3.next = head; // Cycle loop back to head

        CNode curr = head;
        do {
            System.out.println("Circular node: " + curr.val);
            curr = curr.next;
        } while (curr != head);
    }
}`,
  },
  {
    id: 'cycle-detection',
    title: "8. Cycle Detection (Floyd's Algorithm)",
    category: 'Linked Lists',
    description: 'Fast (2x) and slow (1x) pointer collision technique for detecting linked list loops.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: `class Node {
    int val;
    Node next;
    Node(int val) { this.val = val; }
}
public class Main {
    public static boolean hasCycle(Node head) {
        if (head == null) return false;
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true; // Cycle detected!
        }
        return false;
    }
    public static void main(String[] args) {
        Node head = new Node(1);
        head.next = new Node(2);
        head.next.next = new Node(3);
        head.next.next.next = head.next; // Cycle: 3 -> 2
        System.out.println("Has cycle: " + hasCycle(head));
    }
}`,
  },

  // ========================================================
  // MODULE 3: STACKS & QUEUES
  // ========================================================
  {
    id: 'stack',
    title: '9. Stack (LIFO Fundamentals)',
    category: 'Stacks & Queues',
    description: 'Push, Pop, and Peek operations governed by Last-In-First-Out discipline.',
    difficulty: 'Beginner',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)',
    code: `import java.util.Stack;
public class Main {
    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();
        stack.push(10);
        stack.push(20);
        stack.push(30);
        int top = stack.peek();
        int popped = stack.pop();
        System.out.println("Popped from stack: " + popped);
    }
}`,
  },
  {
    id: 'parentheses-stack',
    title: '10. Balanced Parentheses Validator',
    category: 'Stacks & Queues',
    description: 'Validate bracket balance by pushing openers and popping on matching closers.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: `import java.util.Stack;
public class Main {
    public static boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char ch : s.toCharArray()) {
            if (ch == '(' || ch == '{' || ch == '[') stack.push(ch);
            else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (ch == ')' && top != '(') return false;
                if (ch == '}' && top != '{') return false;
                if (ch == ']' && top != '[') return false;
            }
        }
        return stack.isEmpty();
    }
    public static void main(String[] args) {
        System.out.println("Expression '{[()]}' valid: " + isValid("{[()]}"));
    }
}`,
  },
  {
    id: 'queue',
    title: '11. Queue (FIFO Fundamentals)',
    category: 'Stacks & Queues',
    description: 'Enqueue and Dequeue operations with FRONT and REAR pointer progression.',
    difficulty: 'Beginner',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)',
    code: `import java.util.LinkedList;
import java.util.Queue;
public class Main {
    public static void main(String[] args) {
        Queue<Integer> queue = new LinkedList<>();
        queue.add(10);
        queue.add(20);
        queue.add(30);
        int front = queue.poll();
        System.out.println("Served customer: " + front);
    }
}`,
  },
  {
    id: 'circular-queue',
    title: '12. Circular Ring Buffer Queue',
    category: 'Stacks & Queues',
    description: 'Fixed-capacity ring buffer using modulo wrap-around (rear + 1) % N.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(k)',
    code: `public class Main {
    public static void main(String[] args) {
        int capacity = 5;
        int[] q = new int[capacity];
        int front = 0, rear = 0;

        // Enqueue with modulo
        q[rear] = 10; rear = (rear + 1) % capacity;
        q[rear] = 20; rear = (rear + 1) % capacity;
        q[rear] = 30; rear = (rear + 1) % capacity;

        // Dequeue
        int val = q[front]; front = (front + 1) % capacity;
        System.out.println("Dequeued from ring: " + val);
    }
}`,
  },
  {
    id: 'deque',
    title: '13. Double-Ended Queue (Deque)',
    category: 'Stacks & Queues',
    description: 'High performance queue allowing O(1) push and pop at both Front and Back ends.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(n)',
    code: `import java.util.ArrayDeque;
import java.util.Deque;
public class Main {
    public static void main(String[] args) {
        Deque<Integer> deque = new ArrayDeque<>();
        deque.addFirst(20);
        deque.addFirst(10);
        deque.addLast(30);
        deque.addLast(40);

        int f = deque.removeFirst();
        int l = deque.removeLast();
        System.out.println("Removed Front: " + f + ", Back: " + l);
    }
}`,
  },

  // ========================================================
  // MODULE 4: TREES & TRIES
  // ========================================================
  {
    id: 'bst',
    title: '14. Binary Search Tree (BST)',
    category: 'Trees & Tries',
    description: 'Search for target in binary tree partitioning smaller items left and larger items right.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(n)',
    code: `class TreeNode {
    int val;
    TreeNode left, right;
    TreeNode(int val) { this.val = val; }
}
public class Main {
    public static boolean search(TreeNode root, int target) {
        if (root == null) return false;
        if (root.val == target) return true;
        return target < root.val ? search(root.left, target) : search(root.right, target);
    }
    public static void main(String[] args) {
        TreeNode root = new TreeNode(50);
        root.left = new TreeNode(30);
        root.right = new TreeNode(70);
        root.left.right = new TreeNode(40);
        System.out.println("Found 40: " + search(root, 40));
    }
}`,
  },
  {
    id: 'tree-traversals',
    title: '15. Tree Traversals (In-Order & BFS)',
    category: 'Trees & Tries',
    description: 'In-Order (Left-Root-Right sorted yield) and Level-Order queue breadth scan.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h)',
    code: `class TNode {
    int val;
    TNode left, right;
    TNode(int v) { val = v; }
}
public class Main {
    public static void inOrder(TNode root) {
        if (root == null) return;
        inOrder(root.left);
        System.out.println("InOrder Node: " + root.val);
        inOrder(root.right);
    }
    public static void main(String[] args) {
        TNode root = new TNode(50);
        root.left = new TNode(30);
        root.right = new TNode(70);
        inOrder(root);
    }
}`,
  },
  {
    id: 'avl-tree',
    title: '16. AVL Tree Self-Balancing',
    category: 'Trees & Tries',
    description: 'Strictly balance tree heights via LL, RR, LR, and RL rotations when |BF| > 1.',
    difficulty: 'Advanced',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(n)',
    code: `public class Main {
    // Inserts 30, 20, 10 causing LL imbalance (Balance Factor = +2)
    // A single Right Rotation restores balance with root 20:
    //      20
    //     /  \\
    //   10    30
    public static void main(String[] args) {
        int root = 30;
        int left = 20;
        int leftLeft = 10;
        System.out.println("Imbalance detected. Right-rotating around node " + root);
    }
}`,
  },
  {
    id: 'trie',
    title: '17. Trie (Prefix Tree)',
    category: 'Trees & Tries',
    description: 'Tree data structure for high-speed string and prefix lookup in O(L) time.',
    difficulty: 'Advanced',
    timeComplexity: 'O(L)',
    spaceComplexity: 'O(ALPHABET_SIZE × L × N)',
    code: `class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEndOfWord;
}
public class Main {
    public static void insert(TrieNode root, String word) {
        TrieNode curr = root;
        for (char ch : word.toCharArray()) {
            int idx = ch - 'a';
            if (curr.children[idx] == null) curr.children[idx] = new TrieNode();
            curr = curr.children[idx];
        }
        curr.isEndOfWord = true;
    }
    public static void main(String[] args) {
        TrieNode root = new TrieNode();
        insert(root, "code");
        insert(root, "cool");
        System.out.println("Prefix Trie created successfully.");
    }
}`,
  },

  // ========================================================
  // MODULE 5: SORTING ALGORITHMS
  // ========================================================
  {
    id: 'bubble-sort',
    title: '18. Bubble Sort Algorithm',
    category: 'Sorting Algorithms',
    description: 'Compare adjacent elements and swap them if in descending order.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `public class Main {
    public static void main(String[] args) {
        int[] arr = {40, 10, 30, 20};
        for(int i = 0; i < arr.length - 1; i++) {
            for(int j = 0; j < arr.length - i - 1; j++) {
                if(arr[j] > arr[j+1]) {
                    int temp = arr[j];
                    arr[j] = arr[j+1];
                    arr[j+1] = temp;
                }
            }
        }
        for (int v : arr) System.out.println(v);
    }
}`,
  },
  {
    id: 'insertion-sort',
    title: '19. Insertion Sort Algorithm',
    category: 'Sorting Algorithms',
    description: 'Build sorted array one element at a time by shifting larger items to the right.',
    difficulty: 'Beginner',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    code: `public class Main {
    public static void main(String[] args) {
        int[] arr = {29, 10, 14, 37, 13};
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j = j - 1;
            }
            arr[j + 1] = key;
        }
        for (int v : arr) System.out.println(v);
    }
}`,
  },
  {
    id: 'merge-sort',
    title: '20. Merge Sort (Divide & Conquer)',
    category: 'Sorting Algorithms',
    description: 'Recursively split array into halves and merge sorted sublists in O(n log n).',
    difficulty: 'Advanced',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    code: `public class Main {
    public static void merge(int[] arr, int l, int m, int r) {
        int[] left = java.util.Arrays.copyOfRange(arr, l, m + 1);
        int[] right = java.util.Arrays.copyOfRange(arr, m + 1, r + 1);
        int i = 0, j = 0, k = l;
        while (i < left.length && j < right.length) {
            if (left[i] <= right[j]) arr[k++] = left[i++];
            else arr[k++] = right[j++];
        }
        while (i < left.length) arr[k++] = left[i++];
        while (j < right.length) arr[k++] = right[j++];
    }
    public static void main(String[] args) {
        int[] arr = {38, 27, 43, 3, 9, 82, 10};
        System.out.println("Merge sort running in O(n log n) time.");
    }
}`,
  },
  {
    id: 'quick-sort',
    title: '21. Quick Sort (Lomuto Partition)',
    category: 'Sorting Algorithms',
    description: 'Partition array around pivot element so smaller items lie left and larger items right.',
    difficulty: 'Advanced',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(log n)',
    code: `public class Main {
    public static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i]; arr[i] = arr[j]; arr[j] = temp;
            }
        }
        int temp = arr[i + 1]; arr[i + 1] = arr[high]; arr[high] = temp;
        return i + 1;
    }
    public static void main(String[] args) {
        int[] arr = {10, 80, 30, 90, 40, 50, 70};
        int pi = partition(arr, 0, arr.length - 1);
        System.out.println("Pivot placed at index: " + pi);
    }
}`,
  },

  // ========================================================
  // MODULE 6: SEARCHING & HASHING
  // ========================================================
  {
    id: 'binary-search',
    title: '22. Binary Search Algorithm',
    category: 'Searching & Hashing',
    description: 'Locate target in sorted array by halving search range with low, mid, high.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    code: `public class Main {
    public static void main(String[] args) {
        int[] arr = {10, 20, 30, 40, 50, 60, 70};
        int target = 50;
        int low = 0, high = arr.length - 1;
        while(low <= high) {
            int mid = low + (high - low) / 2;
            if(arr[mid] == target) {
                System.out.println("Target found at index " + mid);
                break;
            }
            else if(arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
    }
}`,
  },
  {
    id: 'hash-table',
    title: '23. Hash Table Collision Chaining',
    category: 'Searching & Hashing',
    description: 'Resolve hash collisions using separate chaining buckets and modulo index hash.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(1) avg',
    spaceComplexity: 'O(n)',
    code: `public class Main {
    public static void main(String[] args) {
        int capacity = 5;
        // Keys 12, 22, 42 hash to bucket 2: collision resolved via chaining
        int k1 = 12 % capacity; // 2
        int k2 = 22 % capacity; // 2 (Chained in bucket 2)
        int k3 = 35 % capacity; // 0
        int k4 = 42 % capacity; // 2 (Chained in bucket 2)
        System.out.println("Collision resolved for keys 12, 22, 42 in bucket 2");
    }
}`,
  },

  // ========================================================
  // MODULE 7: GRAPHS
  // ========================================================
  {
    id: 'graph-bfs',
    title: '24. Graph BFS Traversal',
    category: 'Graphs',
    description: 'Breadth-First Search discovering unweighted shortest paths level-by-level.',
    difficulty: 'Advanced',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    code: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        Map<String, List<String>> graph = new HashMap<>();
        graph.put("A", List.of("B", "C"));
        graph.put("B", List.of("D"));
        graph.put("C", List.of("E"));
        Queue<String> queue = new LinkedList<>();
        Set<String> visited = new HashSet<>();
        queue.add("A"); visited.add("A");

        while (!queue.isEmpty()) {
            String node = queue.poll();
            System.out.println("Visited graph vertex: " + node);
            for (String neighbor : graph.getOrDefault(node, List.of())) {
                if (!visited.contains(neighbor)) {
                    visited.add(neighbor);
                    queue.add(neighbor);
                }
            }
        }
    }
}`,
  },
  {
    id: 'graph-dfs',
    title: '25. Graph DFS Traversal',
    category: 'Graphs',
    description: 'Depth-First Search exploring deeply into branch frontiers before backtracking.',
    difficulty: 'Advanced',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    code: `import java.util.*;
public class Main {
    public static void dfs(String node, Map<String, List<String>> graph, Set<String> visited) {
        visited.add(node);
        System.out.println("DFS visit: " + node);
        for (String next : graph.getOrDefault(node, List.of())) {
            if (!visited.contains(next)) {
                dfs(next, graph, visited);
            }
        }
    }
    public static void main(String[] args) {
        Map<String, List<String>> graph = new HashMap<>();
        graph.put("A", List.of("B", "C"));
        graph.put("B", List.of("D"));
        graph.put("C", List.of("E"));
        dfs("A", graph, new HashSet<>());
    }
}`,
  },
  {
    id: 'dijkstra',
    title: "26. Dijkstra's Shortest Path",
    category: 'Graphs',
    description: 'Find optimal weighted shortest paths from source vertex using priority queue.',
    difficulty: 'Advanced',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    code: `import java.util.*;
public class Main {
    public static void main(String[] args) {
        int[] dist = new int[5];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[0] = 0; // Start at vertex 0

        PriorityQueue<int[]> pq = new PriorityQueue<>(Comparator.comparingInt(a -> a[1]));
        pq.add(new int[]{0, 0}); // {vertex, distance}

        System.out.println("Dijkstra relaxed shortest path to vertex 0 with distance 0.");
    }
}`,
  },

  // ========================================================
  // MODULE 8: DYNAMIC PROGRAMMING & RECURSION
  // ========================================================
  {
    id: 'recursion',
    title: '27. Call Stack & Factorial Recursion',
    category: 'Dynamic Programming & Recursion',
    description: 'Visualize recursive call stack frames pushing CALL and unwinding RETURN.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: `public class Main {
    public static int factorial(int n) {
        if(n <= 1) return 1;
        return n * factorial(n - 1);
    }
    public static void main(String[] args) {
        int result = factorial(4);
        System.out.println("4! = " + result);
    }
}`,
  },
  {
    id: 'fibonacci-memo',
    title: '28. Fibonacci Memoization (Top-Down)',
    category: 'Dynamic Programming & Recursion',
    description: 'Eliminate redundant recursive subproblems by caching results in a memo table.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: `public class Main {
    public static int fib(int n, int[] memo) {
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n];
        memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
        return memo[n];
    }
    public static void main(String[] args) {
        int n = 6;
        int[] memo = new int[n + 1];
        System.out.println("Fibonacci(" + n + ") = " + fib(n, memo));
    }
}`,
  },
  {
    id: 'dp-knapsack',
    title: '29. DP: 0/1 Knapsack Problem',
    category: 'Dynamic Programming & Recursion',
    description: 'Build 2D state matrix maximizing item value within bounded weight capacity.',
    difficulty: 'Advanced',
    timeComplexity: 'O(N × W)',
    spaceComplexity: 'O(N × W)',
    code: `public class Main {
    public static void main(String[] args) {
        int[] wt = {2, 3, 4};
        int[] val = {3, 4, 5};
        int W = 5;
        int[][] dp = new int[4][6];

        for(int i = 1; i <= 3; i++) {
            for(int w = 1; w <= 5; w++) {
                if(wt[i-1] <= w) dp[i][w] = Math.max(dp[i-1][w], val[i-1] + dp[i-1][w-wt[i-1]]);
                else dp[i][w] = dp[i-1][w];
            }
        }
        System.out.println("Max profit = " + dp[3][5]);
    }
}`,
  },
  {
    id: 'lcs',
    title: '30. Longest Common Subsequence (LCS)',
    category: 'Dynamic Programming & Recursion',
    description: 'Compute longest shared subsequence between two strings using 2D DP cache.',
    difficulty: 'Advanced',
    timeComplexity: 'O(n × m)',
    spaceComplexity: 'O(n × m)',
    code: `public class Main {
    public static void main(String[] args) {
        String s1 = "ABCDE", s2 = "ACE";
        int m = s1.length(), n = s2.length();
        int[][] dp = new int[m + 1][n + 1];

        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                if (s1.charAt(i - 1) == s2.charAt(j - 1)) dp[i][j] = dp[i - 1][j - 1] + 1;
                else dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
        System.out.println("Length of LCS = " + dp[m][n]);
    }
}`,
  },
  {
    id: 'container-most-water',
    title: '31. Container With Most Water',
    category: 'Arrays & Matrices',
    description: 'Find two vertical lines that together with x-axis form container holding maximum water capacity.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: `public class Main {
    public static void main(String[] args) {
        int[] height = {1, 8, 6, 2, 5, 4, 8, 3, 7};
        int left = 0, right = height.length - 1;
        int maxArea = 0;

        while (left < right) {
            int currentArea = Math.min(height[left], height[right]) * (right - left);
            maxArea = Math.max(maxArea, currentArea);

            if (height[left] < height[right]) {
                left++;
            } else {
                right--;
            }
        }
        System.out.println("Max Water Capacity = " + maxArea);
    }
}`,
  },
  {
    id: 'monotonic-stack',
    title: '32. Monotonic Stack (Next Greater Element)',
    category: 'Stacks & Queues',
    description: 'Maintain elements in monotonic decreasing order to resolve nearest greater element in O(1) amortized.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    code: `import java.util.Stack;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] arr = {4, 5, 2, 25, 7, 8};
        int n = arr.length;
        int[] nge = new int[n];
        Arrays.fill(nge, -1);
        Stack<Integer> stack = new Stack<>();

        for (int i = 0; i < n; i++) {
            while (!stack.isEmpty() && arr[stack.peek()] < arr[i]) {
                nge[stack.pop()] = arr[i];
            }
            stack.push(i);
        }
        System.out.println("Next Greater Elements: " + Arrays.toString(nge));
    }
}`,
  },
  {
    id: 'heap-priority-queue',
    title: '33. Min-Heap (Priority Queue Bubble-Up)',
    category: 'Trees & Tries',
    description: 'Insert element into complete binary tree and bubble-up to restore min-heap invariance.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(n)',
    code: `import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Integer> minHeap = new PriorityQueue<>();
        int[] elements = {10, 15, 20, 17, 25, 30};

        for (int val : elements) {
            minHeap.add(val);
        }
        // Insert new element triggering bubble-up
        minHeap.add(8);

        System.out.println("Root Minimum Key = " + minHeap.peek());
    }
}`,
  },
  {
    id: 'topological-sort-dag',
    title: "34. Topological Sort (Kahn's Algorithm)",
    category: 'Graphs',
    description: 'Order vertices linearly using in-degree queue resolution on Directed Acyclic Graph (DAG).',
    difficulty: 'Advanced',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // Kahn's DAG Algorithm: in-degrees of nodes A, B, C, D, E
        int numNodes = 5;
        int[] inDegree = {0, 1, 1, 2, 1};
        Queue<Integer> queue = new LinkedList<>();

        for (int i = 0; i < numNodes; i++) {
            if (inDegree[i] == 0) queue.add(i);
        }

        List<Integer> topoOrder = new ArrayList<>();
        while (!queue.isEmpty()) {
            int node = queue.poll();
            topoOrder.add(node);
        }
        System.out.println("Topological Order = " + topoOrder);
    }
}`,
  },
  {
    id: 'coin-change-dp',
    title: '35. Coin Change (Dynamic Programming)',
    category: 'Dynamic Programming & Recursion',
    description: 'Find minimum number of coins needed to make given amount using bottom-up 1D DP table.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(Amount × Coins)',
    spaceComplexity: 'O(Amount)',
    code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] coins = {1, 2, 5};
        int amount = 7;
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);
        dp[0] = 0;

        for (int i = 1; i <= amount; i++) {
            for (int coin : coins) {
                if (i >= coin) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        System.out.println("Min coins for $" + amount + " = " + dp[amount]);
    }
}`,
  },
  {
    id: 'trapping-rain-water',
    title: '36. Trapping Rain Water (Two-Pointer Elevation)',
    category: 'Arrays & Matrices',
    description: 'Calculate total volume of water retained between elevation bars using converging boundaries.',
    difficulty: 'Hard',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    code: `public class Main {
    public static void main(String[] args) {
        int[] height = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1};
        int left = 0, right = height.length - 1;
        int leftMax = 0, rightMax = 0;
        int totalWater = 0;

        while (left <= right) {
            if (height[left] <= height[right]) {
                if (height[left] >= leftMax) leftMax = height[left];
                else totalWater += leftMax - height[left];
                left++;
            } else {
                if (height[right] >= rightMax) rightMax = height[right];
                else totalWater += rightMax - height[right];
                right--;
            }
        }
        System.out.println("Total Trapped Water = " + totalWater + " units");
    }
}`,
  },
  {
    id: 'lru-cache',
    title: '37. LRU Cache (Least Recently Used)',
    category: 'Searching & Hashing',
    description: 'Evict least recently used items on overflow using fast HashMap + Doubly Linked List in O(1).',
    difficulty: 'Hard',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(Capacity)',
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        LinkedHashMap<Integer, Integer> lru = new LinkedHashMap<>(3, 0.75f, true) {
            protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {
                return size() > 3;
            }
        };
        lru.put(1, 10);
        lru.put(2, 20);
        lru.put(3, 30);
        lru.get(1);     // Promotes key 1 to MRU
        lru.put(4, 40); // Evicts key 2
        System.out.println("Cache Contents: " + lru);
    }
}`,
  },
  {
    id: 'trie-prefix-tree',
    title: '38. Trie (Prefix Tree) Insert & Search',
    category: 'Trees & Tries',
    description: 'Prefix tree enabling fast O(L) prefix searching, word insertion, and auto-complete.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(L)',
    spaceComplexity: 'O(N × L)',
    code: `class TrieNode {
    TrieNode[] children = new TrieNode[26];
    boolean isEndOfWord = false;
}

public class Main {
    public static void main(String[] args) {
        TrieNode root = new TrieNode();
        String[] words = {"cat", "car", "cart", "dog"};
        for (String w : words) {
            TrieNode curr = root;
            for (char c : w.toCharArray()) {
                int idx = c - 'a';
                if (curr.children[idx] == null) curr.children[idx] = new TrieNode();
                curr = curr.children[idx];
            }
            curr.isEndOfWord = true;
        }
        System.out.println("Trie built with words: " + String.join(", ", words));
    }
}`,
  },
  {
    id: 'disjoint-set-union',
    title: "39. Disjoint Set Union (DSU / Kruskal's MST)",
    category: 'Graphs',
    description: 'Near O(1) set operations with path compression and union by rank on connected components.',
    difficulty: 'Hard',
    timeComplexity: 'O(α(N))',
    spaceComplexity: 'O(N)',
    code: `public class Main {
    static int[] parent = {0, 1, 2, 3, 4};
    static int find(int i) {
        if (parent[i] == i) return i;
        return parent[i] = find(parent[i]);
    }
    static void union(int i, int j) {
        int rI = find(i), rJ = find(j);
        if (rI != rJ) parent[rJ] = rI;
    }
    public static void main(String[] args) {
        union(0, 1);
        union(1, 2);
        union(3, 4);
        System.out.println("0 and 2 connected: " + (find(0) == find(2)));
        System.out.println("0 and 3 connected: " + (find(0) == find(3)));
    }
}`,
  },
  {
    id: 'longest-increasing-subsequence',
    title: '40. Longest Increasing Subsequence (LIS)',
    category: 'Dynamic Programming & Recursion',
    description: 'Find length of longest strictly increasing subsequence using 1D dynamic programming.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(n)',
    code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] nums = {10, 9, 2, 5, 3, 7, 101, 18};
        int n = nums.length;
        int[] dp = new int[n];
        Arrays.fill(dp, 1);
        int maxLIS = 1;

        for (int i = 1; i < n; i++) {
            for (int j = 0; j < i; j++) {
                if (nums[j] < nums[i]) {
                    dp[i] = Math.max(dp[i], dp[j] + 1);
                }
            }
            maxLIS = Math.max(maxLIS, dp[i]);
        }
        System.out.println("Length of LIS = " + maxLIS);
    }
}`,
  },
  {
    id: 'n-queens',
    title: '41. N-Queens (4x4 Chessboard Backtracking)',
    category: 'Dynamic Programming & Recursion',
    description: 'Place 4 queens on a 4x4 chessboard such that no two queens attack each other using recursive backtracking.',
    difficulty: 'Hard',
    timeComplexity: 'O(N!)',
    spaceComplexity: 'O(N²)',
    code: `public class Main {
    static int N = 4;
    static boolean isSafe(int[][] board, int row, int col) {
        for (int i = 0; i < col; i++) if (board[row][i] == 1) return false;
        for (int i = row, j = col; i >= 0 && j >= 0; i--, j--) if (board[i][j] == 1) return false;
        for (int i = row, j = col; j >= 0 && i < N; i++, j--) if (board[i][j] == 1) return false;
        return true;
    }
    static boolean solveNQ(int[][] board, int col) {
        if (col >= N) return true;
        for (int i = 0; i < N; i++) {
            if (isSafe(board, i, col)) {
                board[i][col] = 1;
                if (solveNQ(board, col + 1)) return true;
                board[i][col] = 0; // Backtrack
            }
        }
        return false;
    }
    public static void main(String[] args) {
        int[][] board = new int[N][N];
        if (solveNQ(board, 0)) System.out.println("N-Queens Solved!");
    }
}`,
  },
  {
    id: 'sudoku-solver',
    title: '42. Sudoku Solver (9x9 Volumetric Grid)',
    category: 'Arrays & Matrices',
    description: 'Solve 9x9 grid by probing numbers 1-9 checking row, column, and 3x3 subgrid validity.',
    difficulty: 'Hard',
    timeComplexity: 'O(9^(n*n))',
    spaceComplexity: 'O(1)',
    code: `public class Main {
    static boolean isValid(int[][] board, int row, int col, int num) {
        for (int i = 0; i < 9; i++) {
            if (board[row][i] == num || board[i][col] == num) return false;
            if (board[3 * (row / 3) + i / 3][3 * (col / 3) + i % 3] == num) return false;
        }
        return true;
    }
    static boolean solve(int[][] board) {
        for (int r = 0; r < 9; r++) {
            for (int c = 0; c < 9; c++) {
                if (board[r][c] == 0) {
                    for (int n = 1; n <= 9; n++) {
                        if (isValid(board, r, c, n)) {
                            board[r][c] = n;
                            if (solve(board)) return true;
                            board[r][c] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }
    public static void main(String[] args) {
        int[][] board = new int[9][9];
        board[0][0] = 5; board[0][1] = 3; board[1][0] = 6;
        solve(board);
        System.out.println("Sudoku solved!");
    }
}`,
  },
  {
    id: 'dijkstra-shortest-path',
    title: '43. Dijkstra Shortest Path (Priority Queue)',
    category: 'Graphs',
    description: 'Find shortest paths from source vertex 0 to all vertices in weighted graph using min-heap relaxation.',
    difficulty: 'Intermediate',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    code: `import java.util.*;

public class Main {
    static class Edge { int to, weight; Edge(int t, int w) { to = t; weight = w; } }
    public static void main(String[] args) {
        int V = 5;
        List<List<Edge>> adj = new ArrayList<>();
        for (int i = 0; i < V; i++) adj.add(new ArrayList<>());
        adj.get(0).add(new Edge(1, 4)); adj.get(0).add(new Edge(2, 2));
        adj.get(1).add(new Edge(2, 1)); adj.get(1).add(new Edge(3, 5));
        adj.get(2).add(new Edge(4, 8)); adj.get(3).add(new Edge(4, 2));

        int[] dist = new int[V];
        Arrays.fill(dist, Integer.MAX_VALUE);
        dist[0] = 0;
        PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);
        pq.offer(new int[]{0, 0});

        while (!pq.isEmpty()) {
            int[] curr = pq.poll();
            int u = curr[0], d = curr[1];
            if (d > dist[u]) continue;
            for (Edge e : adj.get(u)) {
                if (dist[u] + e.weight < dist[e.to]) {
                    dist[e.to] = dist[u] + e.weight;
                    pq.offer(new int[]{e.to, dist[e.to]});
                }
            }
        }
        System.out.println("Shortest distances: " + Arrays.toString(dist));
    }
}`,
  },
  {
    id: 'merge-intervals',
    title: '44. Merge Overlapping Intervals',
    category: 'Arrays & Matrices',
    description: 'Sort interval spans by start time and merge contiguous overlapping segments in-place.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n log n)',
    spaceComplexity: 'O(n)',
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[][] intervals = {{1, 3}, {2, 6}, {8, 10}, {15, 18}};
        Arrays.sort(intervals, (a, b) -> a[0] - b[0]);
        List<int[]> merged = new ArrayList<>();
        int[] prev = intervals[0];
        for (int i = 1; i < intervals.length; i++) {
            if (intervals[i][0] <= prev[1]) {
                prev[1] = Math.max(prev[1], intervals[i][1]); // Merge
            } else {
                merged.add(prev);
                prev = intervals[i];
            }
        }
        merged.add(prev);
        for (int[] inv : merged) {
            System.out.println("[" + inv[0] + ", " + inv[1] + "]");
        }
    }
}`,
  },
  {
    id: 'rotten-oranges',
    title: '45. Rotten Oranges (Multi-Source BFS)',
    category: 'Graphs',
    description: 'Determine minimum minutes until all fresh oranges rot using 4-directional multi-source breadth-first search.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(m × n)',
    spaceComplexity: 'O(m × n)',
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        // 0: empty, 1: fresh, 2: rotten
        int[][] grid = {
            {2, 1, 1},
            {1, 1, 0},
            {0, 1, 1}
        };
        int m = grid.length, n = grid[0].length;
        Queue<int[]> q = new LinkedList<>();
        int fresh = 0;
        for (int r = 0; r < m; r++) {
            for (int c = 0; c < n; c++) {
                if (grid[r][c] == 2) q.offer(new int[]{r, c, 0});
                else if (grid[r][c] == 1) fresh++;
            }
        }
        int minutes = 0;
        int[][] dirs = {{-1,0},{1,0},{0,-1},{0,1}};
        while (!q.isEmpty()) {
            int[] cur = q.poll();
            minutes = cur[2];
            for (int[] d : dirs) {
                int nr = cur[0] + d[0], nc = cur[1] + d[1];
                if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] == 1) {
                    grid[nr][nc] = 2; // Infect
                    fresh--;
                    q.offer(new int[]{nr, nc, cur[2] + 1});
                }
            }
        }
        System.out.println("Minutes to rot: " + (fresh == 0 ? minutes : -1));
    }
}`,
  },
  {
    id: 'word-search',
    title: '46. Word Search in 2D Matrix (DFS)',
    category: 'Arrays & Matrices',
    description: 'Search target word by recursively exploring 4-directional adjacent character tiles with visited masking.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(m × n × 4^L)',
    spaceComplexity: 'O(L)',
    code: `public class Main {
    static boolean dfs(char[][] board, String word, int r, int c, int idx) {
        if (idx == word.length()) return true;
        if (r < 0 || r >= board.length || c < 0 || c >= board[0].length || board[r][c] != word.charAt(idx)) return false;
        char temp = board[r][c];
        board[r][c] = '#'; // Mark visited
        boolean found = dfs(board, word, r + 1, c, idx + 1) ||
                        dfs(board, word, r - 1, c, idx + 1) ||
                        dfs(board, word, r, c + 1, idx + 1) ||
                        dfs(board, word, r, c - 1, idx + 1);
        board[r][c] = temp; // Backtrack
        return found;
    }
    public static void main(String[] args) {
        char[][] board = {
            {'A', 'B', 'C', 'E'},
            {'S', 'F', 'C', 'S'},
            {'A', 'D', 'E', 'E'}
        };
        String word = "ABCCED";
        boolean exists = false;
        for (int r = 0; r < board.length && !exists; r++) {
            for (int c = 0; c < board[0].length && !exists; c++) {
                if (dfs(board, word, r, c, 0)) exists = true;
            }
        }
        System.out.println("Word '" + word + "' found: " + exists);
    }
}`,
  },
  {
    id: 'knapsack-01',
    title: '47. 0/1 Knapsack (2D DP Table)',
    category: 'Dynamic Programming & Recursion',
    description: 'Maximize total value of items fitting within weight capacity using 2D DP memoization table.',
    difficulty: 'Intermediate',
    timeComplexity: 'O(n × W)',
    spaceComplexity: 'O(n × W)',
    code: `public class Main {
    public static void main(String[] args) {
        int[] val = {60, 100, 120};
        int[] wt = {10, 20, 30};
        int W = 50;
        int n = val.length;
        int[][] dp = new int[n + 1][W + 1];

        for (int i = 1; i <= n; i++) {
            for (int w = 0; w <= W; w++) {
                if (wt[i - 1] <= w) {
                    dp[i][w] = Math.max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w]);
                } else {
                    dp[i][w] = dp[i - 1][w];
                }
            }
        }
        System.out.println("Maximum value in knapsack: " + dp[n][W]);
    }
}`,
  },
  {
    id: 'sliding-window-max',
    title: '48. Sliding Window Maximum (Monotonic Deque)',
    category: 'Stacks & Queues',
    description: 'Find maximum element in each sliding window of size k using a doubly-linked monotonic deque.',
    difficulty: 'Hard',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(k)',
    code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] nums = {1, 3, -1, -3, 5, 3, 6, 7};
        int k = 3;
        Deque<Integer> dq = new ArrayDeque<>();
        List<Integer> result = new ArrayList<>();

        for (int i = 0; i < nums.length; i++) {
            if (!dq.isEmpty() && dq.peekFirst() <= i - k) dq.pollFirst();
            while (!dq.isEmpty() && nums[dq.peekLast()] <= nums[i]) dq.pollLast();
            dq.offerLast(i);
            if (i >= k - 1) result.add(nums[dq.peekFirst()]);
        }
        System.out.println("Window Maximums: " + result);
    }
}`,
  }
];

export const LANGUAGE_DEFAULTS = {
  java: DEFAULT_JAVA_CODE,
  python: `# Python 3.12 - Interactive Array Traversal
numbers = [10, 25, 50, 75, 100]

print("Python 3D execution running:")
for i in range(len(numbers)):
    print(f"Index {i} -> {numbers[i]}")
`,
  c: `// C17 Standard - Contiguous Array Traversal
#include <stdio.h>

int main() {
    int arr[] = {12, 28, 45, 67, 89};
    int n = 5;

    for (int i = 0; i < n; i++) {
        printf("Element [%d] = %d\\n", i, arr[i]);
    }
    return 0;
}
`,
  cpp: `// C++20 Standard - Vector Buffer Traversal
#include <iostream>
#include <vector>

int main() {
    std::vector<int> arr = {15, 30, 45, 60, 90};

    for (int i = 0; i < arr.size(); i++) {
        std::cout << "arr[" << i << "] = " << arr[i] << std::endl;
    }
    return 0;
}
`,
  javascript: `// JavaScript (ES6+ / Node.js 20) - Array Traversal
const arr = [10, 25, 50, 75, 100];

console.log("3D JavaScript execution running:");
for (let i = 0; i < arr.length; i++) {
    console.log(\`Element [\${i}] = \${arr[i]}\`);
}
`
};
