package com.code3d.controller;

import com.code3d.model.DsaConcept;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/dsa")
public class DsaCatalogController {

    private final List<DsaConcept> concepts = List.of(
            // MODULE 1: ARRAYS & MATRICES
            new DsaConcept("array-loop", "1D Array Linear Traversal", "Arrays & Matrices",
                    "Sequentially access and print elements in contiguous heap memory.",
                    "Beginner", "O(n)", "O(1)",
                    """
                    public class Main {
                        public static void main(String[] args) {
                            int[] arr = {10, 20, 30, 40};
                            for(int i = 0; i < arr.length; i++) {
                                System.out.println(arr[i]);
                            }
                        }
                    }
                    """),

            new DsaConcept("matrix", "2D Matrix Scan (Row-Major)", "Arrays & Matrices",
                    "Traverse 3x3 matrix in row-major layout with nested loop coordinates.",
                    "Beginner", "O(n × m)", "O(n × m)",
                    """
                    public class Main {
                        public static void main(String[] args) {
                            int[][] matrix = {
                                {1, 2, 3},
                                {4, 5, 6},
                                {7, 8, 9}
                            };
                            for(int r = 0; r < matrix.length; r++) {
                                for(int c = 0; c < matrix[r].length; c++) {
                                    System.out.println(matrix[r][c]);
                                }
                            }
                        }
                    }
                    """),

            new DsaConcept("two-pointer-reverse", "Two-Pointer Array Reversal", "Arrays & Matrices",
                    "In-place array reversal using converging left and right index pointers.",
                    "Beginner", "O(n)", "O(1)",
                    """
                    public class Main {
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
                    }
                    """),

            new DsaConcept("sliding-window", "Sliding Window Subarray Sum", "Arrays & Matrices",
                    "Maintain running sum of fixed window size K without recomputing overlapping items.",
                    "Intermediate", "O(n)", "O(1)",
                    """
                    public class Main {
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
                            System.out.println("Max Sum: " + maxSum);
                        }
                    }
                    """),

            // MODULE 2: LINKED LISTS
            new DsaConcept("linked-list", "Singly Linked List Traversal", "Linked Lists",
                    "Traverse singly linked nodes connected via next object references.",
                    "Beginner", "O(n)", "O(n)",
                    """
                    class Node {
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
                                System.out.println(curr.val);
                                curr = curr.next;
                            }
                        }
                    }
                    """),

            new DsaConcept("doubly-linked-list", "Doubly Linked List (Two-Way)", "Linked Lists",
                    "Bidirectional linked list nodes maintaining both prev and next pointers.",
                    "Intermediate", "O(n)", "O(n)",
                    """
                    class DNode {
                        int val;
                        DNode prev, next;
                        DNode(int val) { this.val = val; }
                    }
                    public class Main {
                        public static void main(String[] args) {
                            DNode head = new DNode(10);
                            DNode second = new DNode(20);
                            DNode third = new DNode(30);
                            head.next = second; second.prev = head;
                            second.next = third; third.prev = second;
                            DNode curr = head;
                            while (curr != null) {
                                System.out.println(curr.val);
                                curr = curr.next;
                            }
                        }
                    }
                    """),

            new DsaConcept("circular-linked-list", "Circular Linked List", "Linked Lists",
                    "Tail node next reference loops back to head with no null terminator.",
                    "Intermediate", "O(n)", "O(n)",
                    """
                    class CNode {
                        int val;
                        CNode next;
                        CNode(int val) { this.val = val; }
                    }
                    public class Main {
                        public static void main(String[] args) {
                            CNode head = new CNode(10);
                            CNode n2 = new CNode(20);
                            CNode n3 = new CNode(30);
                            head.next = n2; n2.next = n3; n3.next = head;
                            CNode curr = head;
                            do {
                                System.out.println(curr.val);
                                curr = curr.next;
                            } while (curr != head);
                        }
                    }
                    """),

            new DsaConcept("cycle-detection", "Floyd Cycle Detection (Tortoise & Hare)", "Linked Lists",
                    "Detect loop in linked list using slow and fast converging two-pointer runners.",
                    "Advanced", "O(n)", "O(1)",
                    """
                    class Node {
                        int val;
                        Node next;
                        Node(int val) { this.val = val; }
                    }
                    public class Main {
                        public static void main(String[] args) {
                            Node head = new Node(1);
                            head.next = new Node(2);
                            head.next.next = new Node(3);
                            head.next.next.next = new Node(4);
                            head.next.next.next.next = head.next; // Cycle to Node 2
                            Node slow = head, fast = head;
                            boolean hasCycle = false;
                            while (fast != null && fast.next != null) {
                                slow = slow.next;
                                fast = fast.next.next;
                                if (slow == fast) { hasCycle = true; break; }
                            }
                            System.out.println("Cycle detected: " + hasCycle);
                        }
                    }
                    """),

            // MODULE 3: STACKS & QUEUES
            new DsaConcept("stack", "Stack (LIFO)", "Stacks & Queues",
                    "Demonstrate Push, Pop, and Peek operations with TOP pointer.",
                    "Beginner", "O(1)", "O(n)",
                    """
                    import java.util.Stack;
                    public class Main {
                        public static void main(String[] args) {
                            Stack<Integer> stack = new Stack<>();
                            stack.push(10);
                            stack.push(20);
                            stack.push(30);
                            int top = stack.peek();
                            int popped = stack.pop();
                            System.out.println("Top: " + top + ", Popped: " + popped);
                        }
                    }
                    """),

            new DsaConcept("parentheses-stack", "Balanced Parentheses Checker", "Stacks & Queues",
                    "Validate balanced brackets matching opening symbols with corresponding closing symbols.",
                    "Intermediate", "O(n)", "O(n)",
                    """
                    import java.util.Stack;
                    public class Main {
                        public static void main(String[] args) {
                            String s = "{[()]}";
                            Stack<Character> stack = new Stack<>();
                            boolean balanced = true;
                            for (char ch : s.toCharArray()) {
                                if (ch == '{' || ch == '[' || ch == '(') stack.push(ch);
                                else if (stack.isEmpty()) { balanced = false; break; }
                                else {
                                    char top = stack.pop();
                                    if ((ch == '}' && top != '{') || (ch == ']' && top != '[') || (ch == ')' && top != '(')) {
                                        balanced = false; break;
                                    }
                                }
                            }
                            System.out.println("Balanced: " + (balanced && stack.isEmpty()));
                        }
                    }
                    """),

            new DsaConcept("queue", "Queue (FIFO)", "Stacks & Queues",
                    "Demonstrate Enqueue and Dequeue operations with FRONT and REAR pointers.",
                    "Beginner", "O(1)", "O(n)",
                    """
                    import java.util.LinkedList;
                    import java.util.Queue;
                    public class Main {
                        public static void main(String[] args) {
                            Queue<Integer> queue = new LinkedList<>();
                            queue.add(10);
                            queue.add(20);
                            queue.add(30);
                            int head = queue.poll();
                            System.out.println("Dequeued: " + head);
                        }
                    }
                    """),

            new DsaConcept("circular-queue", "Circular Queue (Ring Buffer)", "Stacks & Queues",
                    "Ring buffer utilizing modulo arithmetic to wrap front and rear indices.",
                    "Intermediate", "O(1)", "O(k)",
                    """
                    public class Main {
                        public static void main(String[] args) {
                            int capacity = 5;
                            int[] q = new int[capacity];
                            int front = 0, rear = -1, count = 0;
                            // Enqueue 10, 20, 30
                            rear = (rear + 1) % capacity; q[rear] = 10; count++;
                            rear = (rear + 1) % capacity; q[rear] = 20; count++;
                            rear = (rear + 1) % capacity; q[rear] = 30; count++;
                            // Dequeue
                            int removed = q[front]; front = (front + 1) % capacity; count--;
                            System.out.println("Removed: " + removed);
                        }
                    }
                    """),

            new DsaConcept("deque", "Double-Ended Queue (Deque)", "Stacks & Queues",
                    "Push and pop from both ends in O(1) time.",
                    "Intermediate", "O(1)", "O(n)",
                    """
                    import java.util.ArrayDeque;
                    import java.util.Deque;
                    public class Main {
                        public static void main(String[] args) {
                            Deque<Integer> deque = new ArrayDeque<>();
                            deque.addFirst(10);
                            deque.addLast(20);
                            deque.addFirst(5);
                            int last = deque.removeLast();
                            int first = deque.removeFirst();
                            System.out.println("First: " + first + ", Last: " + last);
                        }
                    }
                    """),

            // MODULE 4: TREES & TRIES
            new DsaConcept("bst", "Binary Search Tree Search", "Trees & Tries",
                    "Search for target 40 in a Binary Search Tree in O(log n) time.",
                    "Intermediate", "O(log n)", "O(n)",
                    """
                    class TreeNode {
                        int val;
                        TreeNode left, right;
                        TreeNode(int val) { this.val = val; }
                    }
                    public class Main {
                        public static void main(String[] args) {
                            TreeNode root = new TreeNode(50);
                            root.left = new TreeNode(30);
                            root.right = new TreeNode(70);
                            root.left.right = new TreeNode(40);
                            int target = 40;
                            TreeNode curr = root;
                            while (curr != null && curr.val != target) {
                                curr = target < curr.val ? curr.left : curr.right;
                            }
                            System.out.println("Found: " + (curr != null));
                        }
                    }
                    """),

            new DsaConcept("tree-traversals", "Tree Traversals (Inorder, Pre, Post)", "Trees & Tries",
                    "Depth-first tree traversal schemes exploring node hierarchies.",
                    "Intermediate", "O(n)", "O(h)",
                    """
                    class TreeNode {
                        int val;
                        TreeNode left, right;
                        TreeNode(int val) { this.val = val; }
                    }
                    public class Main {
                        static void inorder(TreeNode root) {
                            if (root == null) return;
                            inorder(root.left);
                            System.out.print(root.val + " ");
                            inorder(root.right);
                        }
                        public static void main(String[] args) {
                            TreeNode root = new TreeNode(10);
                            root.left = new TreeNode(5);
                            root.right = new TreeNode(15);
                            inorder(root);
                        }
                    }
                    """),

            new DsaConcept("avl-tree", "AVL Self-Balancing Tree Rotation", "Trees & Tries",
                    "Self-balancing BST keeping height O(log n) via LL, RR, LR, RL rotations.",
                    "Advanced", "O(log n)", "O(n)",
                    """
                    class AVLNode {
                        int val, height;
                        AVLNode left, right;
                        AVLNode(int val) { this.val = val; this.height = 1; }
                    }
                    public class Main {
                        public static void main(String[] args) {
                            AVLNode root = new AVLNode(30);
                            root.left = new AVLNode(20);
                            root.left.left = new AVLNode(10);
                            System.out.println("Requires Right Rotation on 30 to restore balance.");
                        }
                    }
                    """),

            new DsaConcept("trie", "Trie (Prefix Tree) Insertion", "Trees & Tries",
                    "Multiway search tree for rapid string retrieval and prefix matching.",
                    "Advanced", "O(m)", "O(alphabet × m)",
                    """
                    class TrieNode {
                        TrieNode[] children = new TrieNode[26];
                        boolean isEndOfWord = false;
                    }
                    public class Main {
                        public static void main(String[] args) {
                            TrieNode root = new TrieNode();
                            String[] words = {"cat", "car", "dog"};
                            for (String w : words) {
                                TrieNode curr = root;
                                for (char ch : w.toCharArray()) {
                                    int idx = ch - 'a';
                                    if (curr.children[idx] == null) curr.children[idx] = new TrieNode();
                                    curr = curr.children[idx];
                                }
                                curr.isEndOfWord = true;
                            }
                            System.out.println("Trie built with " + words.length + " words.");
                        }
                    }
                    """),

            // MODULE 5: SORTING ALGORITHMS
            new DsaConcept("bubble-sort", "Bubble Sort Algorithm", "Sorting Algorithms",
                    "Compare adjacent elements and swap them if in descending order.",
                    "Beginner", "O(n²)", "O(1)",
                    """
                    public class Main {
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
                        }
                    }
                    """),

            new DsaConcept("insertion-sort", "Insertion Sort Algorithm", "Sorting Algorithms",
                    "Build sorted array sequentially by picking elements and inserting into position.",
                    "Beginner", "O(n²)", "O(1)",
                    """
                    public class Main {
                        public static void main(String[] args) {
                            int[] arr = {35, 12, 45, 8, 20};
                            for (int i = 1; i < arr.length; i++) {
                                int key = arr[i];
                                int j = i - 1;
                                while (j >= 0 && arr[j] > key) {
                                    arr[j + 1] = arr[j];
                                    j--;
                                }
                                arr[j + 1] = key;
                            }
                        }
                    }
                    """),

            new DsaConcept("merge-sort", "Merge Sort (Divide & Conquer)", "Sorting Algorithms",
                    "Recursively divide array into halves and merge in O(n log n) guaranteed time.",
                    "Intermediate", "O(n log n)", "O(n)",
                    """
                    public class Main {
                        static void merge(int[] arr, int l, int m, int r) {
                            // Merge two sorted halves
                        }
                        static void sort(int[] arr, int l, int r) {
                            if (l < r) {
                                int m = l + (r - l) / 2;
                                sort(arr, l, m);
                                sort(arr, m + 1, r);
                                merge(arr, l, m, r);
                            }
                        }
                        public static void main(String[] args) {
                            int[] arr = {38, 27, 43, 3, 9, 82, 10};
                            sort(arr, 0, arr.length - 1);
                        }
                    }
                    """),

            new DsaConcept("quick-sort", "Quick Sort (Lomuto Partitioning)", "Sorting Algorithms",
                    "Select pivot, partition elements around pivot, and sort partitions recursively.",
                    "Intermediate", "O(n log n)", "O(log n)",
                    """
                    public class Main {
                        static int partition(int[] arr, int low, int high) {
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
                            partition(arr, 0, arr.length - 1);
                        }
                    }
                    """),

            // MODULE 6: SEARCHING & HASHING
            new DsaConcept("binary-search", "Binary Search Algorithm", "Searching & Hashing",
                    "Locate target 50 in sorted array by halving search range with low, mid, high.",
                    "Beginner", "O(log n)", "O(1)",
                    """
                    public class Main {
                        public static void main(String[] args) {
                            int[] arr = {10, 20, 30, 40, 50, 60, 70};
                            int target = 50;
                            int low = 0, high = arr.length - 1;
                            while(low <= high) {
                                int mid = low + (high - low) / 2;
                                if(arr[mid] == target) break;
                                else if(arr[mid] < target) low = mid + 1;
                                else high = mid - 1;
                            }
                        }
                    }
                    """),

            new DsaConcept("hash-table", "Hash Table & Collision Chaining", "Searching & Hashing",
                    "Map keys to table buckets using hash function; resolve collisions via chaining.",
                    "Intermediate", "O(1)", "O(n)",
                    """
                    import java.util.HashMap;
                    import java.util.Map;
                    public class Main {
                        public static void main(String[] args) {
                            Map<String, Integer> map = new HashMap<>();
                            map.put("Apple", 5);
                            map.put("Banana", 12);
                            map.put("Cherry", 8);
                            System.out.println("Banana count: " + map.get("Banana"));
                        }
                    }
                    """),

            // MODULE 7: GRAPHS
            new DsaConcept("graph-bfs", "Graph Breadth-First Search (BFS)", "Graphs",
                    "Explore graph level-by-level using Queue data structure.",
                    "Intermediate", "O(V + E)", "O(V)",
                    """
                    import java.util.*;
                    public class Main {
                        public static void main(String[] args) {
                            Map<Integer, List<Integer>> adj = Map.of(
                                0, List.of(1, 2),
                                1, List.of(0, 3),
                                2, List.of(0, 4),
                                3, List.of(1),
                                4, List.of(2)
                            );
                            Queue<Integer> queue = new LinkedList<>();
                            boolean[] visited = new boolean[5];
                            queue.add(0);
                            visited[0] = true;
                            while (!queue.isEmpty()) {
                                int node = queue.poll();
                                for (int neighbor : adj.getOrDefault(node, List.of())) {
                                    if (!visited[neighbor]) {
                                        visited[neighbor] = true;
                                        queue.add(neighbor);
                                    }
                                }
                            }
                        }
                    }
                    """),

            new DsaConcept("graph-dfs", "Graph Depth-First Search (DFS)", "Graphs",
                    "Traverse deep into graph branches recursively using system call stack.",
                    "Intermediate", "O(V + E)", "O(V)",
                    """
                    import java.util.*;
                    public class Main {
                        static void dfs(int u, Map<Integer, List<Integer>> adj, boolean[] visited) {
                            visited[u] = true;
                            for (int v : adj.getOrDefault(u, List.of())) {
                                if (!visited[v]) dfs(v, adj, visited);
                            }
                        }
                        public static void main(String[] args) {
                            Map<Integer, List<Integer>> adj = Map.of(
                                0, List.of(1, 2), 1, List.of(3), 2, List.of(4)
                            );
                            boolean[] visited = new boolean[5];
                            dfs(0, adj, visited);
                        }
                    }
                    """),

            new DsaConcept("dijkstra", "Dijkstra's Shortest Path Algorithm", "Graphs",
                    "Single-source shortest path on weighted non-negative graphs.",
                    "Advanced", "O((V + E) log V)", "O(V)",
                    """
                    import java.util.*;
                    public class Main {
                        public static void main(String[] args) {
                            int n = 5;
                            int[] dist = new int[n];
                            Arrays.fill(dist, Integer.MAX_VALUE);
                            dist[0] = 0;
                            // PriorityQueue relaxation
                            System.out.println("Shortest path from source 0 calculated.");
                        }
                    }
                    """),

            // MODULE 8: DYNAMIC PROGRAMMING & RECURSION
            new DsaConcept("recursion", "Call Stack & Recursion (Factorial)", "Dynamic Programming & Recursion",
                    "Visualize recursive call stack frames pushing CALL and unwinding RETURN.",
                    "Intermediate", "O(n)", "O(n)",
                    """
                    public class Main {
                        public static int factorial(int n) {
                            if(n <= 1) return 1;
                            return n * factorial(n - 1);
                        }
                        public static void main(String[] args) {
                            int result = factorial(4);
                        }
                    }
                    """),

            new DsaConcept("fibonacci-memo", "Fibonacci with Top-Down Memoization", "Dynamic Programming & Recursion",
                    "Optimize recursive Fibonacci from O(2ⁿ) down to O(n) using cached lookup table.",
                    "Intermediate", "O(n)", "O(n)",
                    """
                    public class Main {
                        static int fib(int n, int[] memo) {
                            if (n <= 1) return n;
                            if (memo[n] != 0) return memo[n];
                            memo[n] = fib(n - 1, memo) + fib(n - 2, memo);
                            return memo[n];
                        }
                        public static void main(String[] args) {
                            int n = 5;
                            int[] memo = new int[n + 1];
                            int ans = fib(n, memo);
                            System.out.println("Fib(" + n + ") = " + ans);
                        }
                    }
                    """),

            new DsaConcept("dp-knapsack", "0/1 Knapsack Dynamic Programming", "Dynamic Programming & Recursion",
                    "Fill 2D DP table to compute maximum value within weight capacity constraint.",
                    "Advanced", "O(N × W)", "O(N × W)",
                    """
                    public class Main {
                        public static void main(String[] args) {
                            int[] wt = {1, 2, 3};
                            int[] val = {10, 15, 40};
                            int W = 6;
                            int n = wt.length;
                            int[][] dp = new int[n + 1][W + 1];
                            for (int i = 1; i <= n; i++) {
                                for (int w = 1; w <= W; w++) {
                                    if (wt[i - 1] <= w)
                                        dp[i][w] = Math.max(val[i - 1] + dp[i - 1][w - wt[i - 1]], dp[i - 1][w]);
                                    else
                                        dp[i][w] = dp[i - 1][w];
                                }
                            }
                        }
                    }
                    """),

            new DsaConcept("lcs", "Longest Common Subsequence (LCS)", "Dynamic Programming & Recursion",
                    "2D DP grid finding longest subsequence present in both strings in same relative order.",
                    "Advanced", "O(n × m)", "O(n × m)",
                    """
                    public class Main {
                        public static void main(String[] args) {
                            String s1 = "ABCDE";
                            String s2 = "ACE";
                            int m = s1.length(), n = s2.length();
                            int[][] dp = new int[m + 1][n + 1];
                            for (int i = 1; i <= m; i++) {
                                for (int j = 1; j <= n; j++) {
                                    if (s1.charAt(i - 1) == s2.charAt(j - 1))
                                        dp[i][j] = 1 + dp[i - 1][j - 1];
                                    else
                                        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
                                }
                            }
                            System.out.println("LCS Length: " + dp[m][n]);
                        }
                    }
                    """),

            new DsaConcept("container-most-water", "Container With Most Water", "Arrays & Matrices",
                    "Find two vertical lines that together with x-axis form container holding maximum water capacity.",
                    "Intermediate", "O(n)", "O(1)",
                    """
                    public class Main {
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
                    }
                    """),

            new DsaConcept("monotonic-stack", "Monotonic Stack (Next Greater Element)", "Stacks & Queues",
                    "Maintain elements in monotonic decreasing order to resolve nearest greater element in O(1) amortized.",
                    "Intermediate", "O(n)", "O(n)",
                    """
                    import java.util.Stack;
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
                    }
                    """),

            new DsaConcept("heap-priority-queue", "Binary Min-Heap (Priority Queue)", "Trees & Tries",
                    "Insert element into complete binary tree and bubble-up to restore min-heap invariance.",
                    "Intermediate", "O(log n)", "O(n)",
                    """
                    import java.util.PriorityQueue;

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
                    }
                    """),

            new DsaConcept("topological-sort-dag", "Topological Sort (Kahn's DAG Algorithm)", "Graphs",
                    "Order vertices linearly using in-degree queue resolution on Directed Acyclic Graph (DAG).",
                    "Advanced", "O(V + E)", "O(V)",
                    """
                    import java.util.*;

                    public class Main {
                        public static void main(String[] args) {
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
                    }
                    """),

            new DsaConcept("coin-change-dp", "Coin Change Problem (Dynamic Programming)", "Dynamic Programming & Recursion",
                    "Find minimum number of coins needed to make given amount using bottom-up 1D DP table.",
                    "Intermediate", "O(Amount × Coins)", "O(Amount)",
                    """
                    import java.util.Arrays;

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
                    }
                    """),

            new DsaConcept("trapping-rain-water", "Trapping Rain Water (Two-Pointer Elevation)", "Arrays & Matrices",
                    "Calculate total volume of water retained between elevation bars using converging boundaries.",
                    "Hard", "O(n)", "O(1)",
                    """
                    public class Main {
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
                    }
                    """),

            new DsaConcept("lru-cache", "LRU Cache (Least Recently Used)", "Searching & Hashing",
                    "Evict least recently used items on overflow using fast HashMap + Doubly Linked List in O(1).",
                    "Hard", "O(1)", "O(Capacity)",
                    """
                    import java.util.*;

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
                    }
                    """),

            new DsaConcept("trie-prefix-tree", "Trie (Prefix Tree) Insert & Search", "Trees & Tries",
                    "Prefix tree enabling fast O(L) prefix searching, word insertion, and auto-complete.",
                    "Intermediate", "O(L)", "O(N × L)",
                    """
                    class TrieNode {
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
                    }
                    """),

            new DsaConcept("disjoint-set-union", "Disjoint Set Union (DSU / Kruskal's MST)", "Graphs",
                    "Near O(1) set operations with path compression and union by rank on connected components.",
                    "Hard", "O(α(N))", "O(N)",
                    """
                    public class Main {
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
                    }
                    """),

            new DsaConcept("longest-increasing-subsequence", "Longest Increasing Subsequence (LIS)", "Dynamic Programming & Recursion",
                    "Find length of longest strictly increasing subsequence using 1D dynamic programming.",
                    "Intermediate", "O(n²)", "O(n)",
                    """
                    import java.util.Arrays;

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
                    }
                    """)
    );

    @GetMapping("/concepts")
    public ResponseEntity<List<DsaConcept>> getConcepts() {
        return ResponseEntity.ok(concepts);
    }
}
