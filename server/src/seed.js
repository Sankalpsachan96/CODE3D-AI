import { getPrisma, isDbOnline } from './db.js';
import { memoryTopics, memoryProblems, memorySheets } from './controllers/dsaController.js';

export const SEED_TOPICS = [
  { name: 'Arrays & Vectors', slug: 'arrays', description: 'Contiguous memory structures, two pointers, sliding window, prefix sums.', icon: 'Layers', orderIndex: 1 },
  { name: 'Sorting & Searching', slug: 'sorting-searching', description: 'Bubble, Selection, Insertion, Merge, Quick Sort and Binary Search.', icon: 'Sparkles', orderIndex: 2 },
  { name: 'Linked Lists', slug: 'linked-lists', description: 'Singly, Doubly, Circular linked nodes with pointer updates.', icon: 'GitBranch', orderIndex: 3 },
  { name: 'Stacks & Queues', slug: 'stacks-queues', description: 'LIFO and FIFO linear structures with push, pop, enqueue, dequeue.', icon: 'Box', orderIndex: 4 },
  { name: 'Binary Trees', slug: 'binary-trees', description: 'Hierarchical node trees, traversals, and path properties.', icon: 'Binary', orderIndex: 5 },
  { name: 'Binary Search Trees', slug: 'bst', description: 'Ordered binary trees for O(log n) lookup, insertion, and deletion.', icon: 'Cpu', orderIndex: 6 },
  { name: 'Heaps & Priority Queues', slug: 'heaps', description: 'Complete binary tree with min/max heap property and heapify.', icon: 'Database', orderIndex: 7 },
  { name: 'Graphs', slug: 'graphs', description: 'Vertices, edges, BFS, DFS, Dijkstra, topological sort.', icon: 'Globe', orderIndex: 8 },
  { name: 'Dynamic Programming', slug: 'dynamic-programming', description: 'Overlapping subproblems, optimal substructure, 1D & 2D tables.', icon: 'Activity', orderIndex: 9 },
  { name: 'Trie & String Algorithms', slug: 'trie', description: 'Prefix trees for efficient dictionary lookup and pattern matching.', icon: 'FileText', orderIndex: 10 },
];

export const SEED_PROBLEMS = [
  {
    title: 'Two Sum',
    slug: 'two-sum',
    topicSlug: 'arrays',
    difficulty: 'EASY',
    archetype: 'array',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    defaultInput: '2, 7, 11, 15 | target = 9',
    starterCode: {
      java: 'int[] twoSum(int[] nums, int target) {\n    Map<Integer, Integer> map = new HashMap<>();\n    for (int i = 0; i < nums.length; i++) {\n        int comp = target - nums[i];\n        if (map.containsKey(comp)) return new int[]{map.get(comp), i};\n        map.put(nums[i], i);\n    }\n    return new int[]{};\n}',
      python: 'def twoSum(nums, target):\n    prevMap = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in prevMap:\n            return [prevMap[diff], i]\n        prevMap[n] = i',
      cpp: 'vector<int> twoSum(vector<int>& nums, int target) {\n    unordered_map<int, int> m;\n    for(int i = 0; i < nums.size(); i++) {\n        int comp = target - nums[i];\n        if(m.count(comp)) return {m[comp], i};\n        m[nums[i]] = i;\n    }\n    return {};\n}',
    },
  },
  {
    title: 'Binary Search',
    slug: 'binary-search',
    topicSlug: 'sorting-searching',
    difficulty: 'EASY',
    archetype: 'array',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    description: 'Search for target in a sorted array using divide-and-conquer low, mid, and high pointers.',
    defaultInput: '-1, 0, 3, 5, 9, 12 | target = 9',
    starterCode: {
      java: 'int binarySearch(int[] arr, int target) {\n    int low = 0, high = arr.length - 1;\n    while(low <= high) {\n        int mid = low + (high - low) / 2;\n        if(arr[mid] == target) return mid;\n        if(arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}',
      python: 'def binarySearch(arr, target):\n    low, high = 0, len(arr) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if arr[mid] == target: return mid\n        elif arr[mid] < target: low = mid + 1\n        else: high = mid - 1\n    return -1',
    },
  },
  {
    title: 'Reverse Linked List',
    slug: 'reverse-linked-list',
    topicSlug: 'linked-lists',
    difficulty: 'EASY',
    archetype: 'linked-list',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Reverse a singly linked list in-place by updating next pointers from head to null.',
    defaultInput: '1 -> 2 -> 3 -> 4 -> 5',
    starterCode: {
      java: 'ListNode reverseList(ListNode head) {\n    ListNode prev = null, curr = head;\n    while(curr != null) {\n        ListNode next = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = next;\n    }\n    return prev;\n}',
    },
  },
  {
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    topicSlug: 'stacks-queues',
    difficulty: 'EASY',
    archetype: 'stack',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    description: 'Given a string containing parentheses (), [], {}, determine if the input string is valid using a LIFO stack.',
    defaultInput: '()[]{}',
    starterCode: {
      java: 'boolean isValid(String s) {\n    Stack<Character> stack = new Stack<>();\n    for(char c : s.toCharArray()) {\n        if(c == \'(\') stack.push(\')\');\n        else if(c == \'{\') stack.push(\'}\');\n        else if(c == \'[\') stack.push(\']\');\n        else if(stack.isEmpty() || stack.pop() != c) return false;\n    }\n    return stack.isEmpty();\n}',
    },
  },
  {
    title: 'Trapping Rain Water',
    slug: 'trapping-rain-water',
    topicSlug: 'arrays',
    difficulty: 'HARD',
    archetype: 'trapping-rain-water',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    description: 'Given n non-negative integers representing elevation map, compute how much water it can trap after raining.',
    defaultInput: '0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1',
    starterCode: {
      java: 'int trap(int[] height) {\n    int left = 0, right = height.length - 1;\n    int leftMax = 0, rightMax = 0, total = 0;\n    while(left < right) {\n        if(height[left] < height[right]) {\n            if(height[left] >= leftMax) leftMax = height[left];\n            else total += leftMax - height[left];\n            left++;\n        } else {\n            if(height[right] >= rightMax) rightMax = height[right];\n            else total += rightMax - height[right];\n            right--;\n        }\n    }\n    return total;\n}',
    },
  },
];

export async function seedDatabase() {
  console.log('🌱 Initializing seed catalog...');

  // Populate memory fallback
  memoryTopics.length = 0;
  memoryProblems.length = 0;
  memorySheets.length = 0;

  SEED_TOPICS.forEach((t) => memoryTopics.push({ id: `topic-${t.slug}`, ...t }));
  SEED_PROBLEMS.forEach((p) => memoryProblems.push({ id: `prob-${p.slug}`, ...p }));
  memorySheets.push({
    id: 'sheet-striver-sde',
    name: "Striver's SDE Sheet",
    slug: 'striver-sde',
    description: 'Top 182 SDE Interview Problems across Days 1–27.',
    totalProblems: 182,
  });

  if (isDbOnline()) {
    try {
      const prisma = getPrisma();

      // Seed Topics
      for (const topic of SEED_TOPICS) {
        await prisma.dsaTopic.upsert({
          where: { slug: topic.slug },
          update: { name: topic.name, description: topic.description, icon: topic.icon, orderIndex: topic.orderIndex },
          create: { name: topic.name, slug: topic.slug, description: topic.description, icon: topic.icon, orderIndex: topic.orderIndex },
        });
      }

      console.log('✅ Seeded DSA Topics into PostgreSQL.');
    } catch (err) {
      console.warn('⚠️ Seeding into PostgreSQL skipped:', err.message);
    }
  }

  console.log('✅ Seed catalog ready in memory.');
}

// Auto-seed in memory on import
seedDatabase();
