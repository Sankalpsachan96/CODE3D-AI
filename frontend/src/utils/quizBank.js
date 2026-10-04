/**
 * CODE3D-AI Pedagogically Verified Quiz Question Bank
 * Section 21 Architecture: 100% offline-ready, accurate algorithm questions.
 */

export const QUIZ_BANK = {
  'bubble-sort': [
    {
      id: 'bs-1',
      question: 'What is the worst-case time complexity of Bubble Sort and when does it occur?',
      options: [
        'O(n) when the array is already sorted',
        'O(n log n) when the array has unique elements',
        'O(n²) when the array is reverse sorted',
        'O(1) when the array size is under 10'
      ],
      correctIndex: 2,
      explanation: 'Bubble Sort requires n(n-1)/2 comparisons in the worst case when the array is in reverse order, giving O(n²) time complexity.'
    },
    {
      id: 'bs-2',
      question: 'Is standard Bubble Sort a stable sorting algorithm?',
      options: [
        'Yes, because adjacent elements with equal values are never swapped',
        'No, because elements can jump across long distances',
        'Only if implemented with extra O(n) memory',
        'No, it depends on whether the array length is even or odd'
      ],
      correctIndex: 0,
      explanation: 'Bubble Sort compares adjacent elements and only swaps if arr[j] > arr[j+1]. Equal elements preserve their relative initial order, making it stable.'
    },
    {
      id: 'bs-3',
      question: 'With an early termination flag, what is the best-case time complexity of Bubble Sort on an already sorted array?',
      options: ['O(n²)', 'O(n)', 'O(log n)', 'O(1)'],
      correctIndex: 1,
      explanation: 'With a swapped boolean flag, Bubble Sort detects in a single pass of n-1 comparisons that no elements moved, terminating in O(n) time.'
    },
  ],

  'selection-sort': [
    {
      id: 'ss-1',
      question: 'How many swaps does Selection Sort perform in the worst case for an array of size n?',
      options: ['At most n - 1 swaps', 'O(n²) swaps', 'O(n log n) swaps', 'Zero swaps'],
      correctIndex: 0,
      explanation: 'Selection Sort locates the minimum element and performs at most 1 swap per outer loop pass, yielding at most n - 1 total swaps in all cases.'
    },
    {
      id: 'ss-2',
      question: 'What is the time complexity of Selection Sort on an array that is already completely sorted?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(1)'],
      correctIndex: 2,
      explanation: 'Selection Sort always scans the remaining unsorted subarray to verify the minimum, resulting in n(n-1)/2 comparisons regardless of initial order.'
    },
  ],

  'insertion-sort': [
    {
      id: 'is-1',
      question: 'What is the best-case time complexity of Insertion Sort and when does it occur?',
      options: [
        'O(n) when the array is already sorted',
        'O(n²) when all elements are equal',
        'O(log n) when binary insertion is used',
        'O(n log n) always'
      ],
      correctIndex: 0,
      explanation: 'When the array is already sorted, the inner while-loop condition fails on the first comparison for every element, resulting in only n - 1 comparisons (O(n)).'
    },
    {
      id: 'is-2',
      question: 'Why is Insertion Sort often preferred over QuickSort for tiny subarrays (n < 16)?',
      options: [
        'It has lower constant factor overhead and excellent cache locality',
        'It uses O(n) auxiliary space',
        'It requires no comparisons',
        'It can sort strings in O(1) time'
      ],
      correctIndex: 0,
      explanation: 'For small arrays, Insertion Sort has minimal overhead, zero recursion stack cost, and high hardware cache locality.'
    },
  ],

  'merge-sort': [
    {
      id: 'ms-1',
      question: 'What is the auxiliary space complexity of standard Merge Sort for an array of size n?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctIndex: 2,
      explanation: 'Standard Merge Sort requires O(n) auxiliary memory to hold elements in temporary buffers while merging adjacent sorted subarrays.'
    },
    {
      id: 'ms-2',
      question: 'What is the worst-case time complexity of Merge Sort?',
      options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'],
      correctIndex: 1,
      explanation: 'Merge Sort divides the array into halves in O(log n) tree levels and performs O(n) work per level, guaranteeing O(n log n) time in all cases.'
    },
  ],

  'quick-sort': [
    {
      id: 'qs-1',
      question: 'What causes QuickSort to degrade to its worst-case O(n²) time complexity?',
      options: [
        'When partitions are highly unbalanced (e.g., sorted array with first or last element as pivot)',
        'When the array contains negative numbers',
        'When the array size is a power of 2',
        'When elements are unique'
      ],
      correctIndex: 0,
      explanation: 'If the chosen pivot is consistently the smallest or largest element, the subproblems reduce by only 1 element each step (n, n-1, n-2...), causing n levels of depth and O(n²) comparisons.'
    },
    {
      id: 'qs-2',
      question: 'What is the average-case space complexity of QuickSort recursion stack?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
      correctIndex: 1,
      explanation: 'With balanced partitions, the call stack reaches a depth of log₂(n), consuming O(log n) stack frame space.'
    },
  ],

  'linear-search': [
    {
      id: 'ls-1',
      question: 'What is the average number of comparisons in Linear Search for a target present in an array of size n?',
      options: ['(n + 1) / 2', 'n', 'log₂(n)', '1'],
      correctIndex: 0,
      explanation: 'Assuming the target is uniformly distributed across the array, the average search explores (1 + 2 + ... + n)/n = (n + 1)/2 elements, which is O(n).'
    },
  ],

  'binary-search': [
    {
      id: 'bs-4',
      question: 'What prerequisite MUST be satisfied before performing Binary Search on an array?',
      options: [
        'The array must be sorted in monotonic order',
        'The array must contain only positive integers',
        'The array must have an even number of elements',
        'The array must be dynamically allocated on the heap'
      ],
      correctIndex: 0,
      explanation: 'Binary Search relies on the ordering property to safely eliminate half of the remaining search space on every comparison.'
    },
    {
      id: 'bs-5',
      question: 'How many comparisons does Binary Search take in the worst case for an array of 1,000,000 elements?',
      options: ['About 20 comparisons', 'About 500,000 comparisons', '1,000,000 comparisons', '10 comparisons'],
      correctIndex: 0,
      explanation: 'ceil(log₂(1,000,000)) ≈ 20 comparisons. That is the tremendous power of logarithmic time complexity.'
    },
  ],

  'stack': [
    {
      id: 'stk-1',
      question: 'Which principle governs the order of insertion and removal in a Stack?',
      options: ['LIFO (Last-In, First-Out)', 'FIFO (First-In, First-Out)', 'Priority Order', 'Random Access'],
      correctIndex: 0,
      explanation: 'In a stack, the most recently added item (the top) is the first element to be removed (LIFO).'
    },
  ],

  'queue': [
    {
      id: 'q-1',
      question: 'Which graph traversal algorithm fundamentally relies on a Queue data structure?',
      options: [
        'Breadth-First Search (BFS)',
        'Depth-First Search (DFS)',
        'Binary Search',
        'Heapify'
      ],
      correctIndex: 0,
      explanation: 'BFS explores vertices layer by layer (level order), using a FIFO queue to process nodes in the exact order they were discovered.'
    },
  ],

  'bst': [
    {
      id: 'bst-1',
      question: 'Which tree traversal on a Binary Search Tree (BST) visits nodes in strictly ascending sorted order?',
      options: ['In-order traversal (Left, Root, Right)', 'Pre-order traversal (Root, Left, Right)', 'Post-order traversal (Left, Right, Root)', 'Level-order traversal'],
      correctIndex: 0,
      explanation: 'Because a BST satisfies Left < Root < Right, visiting the left subtree, then the root, then the right subtree yields elements in non-decreasing order.'
    },
  ],

  'heap': [
    {
      id: 'hp-1',
      question: 'In a zero-indexed array representation of a binary heap, where are the children of the node at index i located?',
      options: ['2i + 1 and 2i + 2', '2i and 2i + 1', 'i / 2 and i / 2 + 1', 'i + 1 and i + 2'],
      correctIndex: 0,
      explanation: 'In a 0-indexed complete binary tree array: Left child = 2i + 1, Right child = 2i + 2, Parent = floor((i - 1) / 2).'
    },
  ]
};

export function getQuizForConcept(conceptId) {
  if (!conceptId) return QUIZ_BANK['bubble-sort'];
  const clean = conceptId.toLowerCase().replace(/^(sorting-|searching-|dsa-)/, '');
  return QUIZ_BANK[clean] || QUIZ_BANK['bubble-sort'];
}
