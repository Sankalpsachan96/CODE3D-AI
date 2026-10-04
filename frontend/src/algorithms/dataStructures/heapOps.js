import { AlgorithmEventType } from '../types.js';

export const heapOpsDetails = {
  id: 'heap-ops',
  name: 'Binary Heap (Priority Queue)',
  category: 'Data Structures',
  description: 'A complete binary tree that satisfies the heap property: in a max-heap, for any given node C, if P is a parent node of C, then the value of P is greater than or equal to the value of C.',
  howItWorks: 'Stored compactly in an array where parent at index i has children at 2i + 1 and 2i + 2. Insertions add the element at the end of the array and bubble (heapify) up by swapping with its parent until the heap property is restored.',
  example: 'Max-Heap: Insert 40 -> Insert 20 -> Insert 50 (swaps with 40 to become root) -> Array: [50, 20, 40].',
  complexity: {
    time: {
      best: 'O(1) [Peek Max]',
      average: 'O(log n) [Insert/Extract]',
      worst: 'O(log n)',
    },
    space: 'O(n)',
    stable: 'No',
    inPlace: 'Yes',
  },
  advantages: [
    'O(1) time access to the maximum (or minimum) priority element.',
    'Logarithmic O(log n) worst-case time for insertions and deletions.',
    'Zero pointer overhead: represented compactly in a contiguous 1D array.'
  ],
  limitations: [
    'O(n) time for arbitrary element search (unstructured beyond heap invariant).',
    'Unstable: identical priority elements can swap positions during heapify.'
  ],
  code: {
    java: `public class MaxHeap {
    private List<Integer> heap = new ArrayList<>();
    
    public void insert(int val) {
        heap.add(val);
        int i = heap.size() - 1;
        while (i > 0 && heap.get(i) > heap.get((i - 1) / 2)) {
            Collections.swap(heap, i, (i - 1) / 2);
            i = (i - 1) / 2;
        }
    }
}`,
    python: `class MaxHeap:
    def __init__(self):
        self.heap = []
        
    def insert(self, val):
        self.heap.append(val)
        i = len(self.heap) - 1
        while i > 0 and self.heap[i] > self.heap[(i - 1) // 2]:
            parent = (i - 1) // 2
            self.heap[i], self.heap[parent] = self.heap[parent], self.heap[i]
            i = parent`,
    cpp: `class MaxHeap {
    vector<int> heap;
public:
    void insert(int val) {
        heap.push_back(val);
        int i = heap.size() - 1;
        while (i > 0 && heap[i] > heap[(i - 1) / 2]) {
            swap(heap[i], heap[(i - 1) / 2]);
            i = (i - 1) / 2;
        }
    }
};`,
    javascript: `class MaxHeap {
    constructor() { this.heap = []; }
    insert(val) {
        this.heap.push(val);
        let i = this.heap.length - 1;
        while (i > 0) {
            let p = Math.floor((i - 1) / 2);
            if (this.heap[i] > this.heap[p]) {
                [this.heap[i], this.heap[p]] = [this.heap[p], this.heap[i]];
                i = p;
            } else break;
        }
    }
}`
  }
};

export function generateHeapSteps(inputValues) {
  const valuesToInsert = Array.isArray(inputValues) && inputValues.length > 0
    ? [...inputValues]
    : [20, 15, 30, 40, 10, 50];

  const heap = [];
  const steps = [];
  let stepNumber = 1;

  const createStep = ({
    lineNumber,
    eventType,
    variables,
    activeIndex = null,
    parentIndex = null,
    comparedIndices = [],
    swappedIndices = [],
    explanation,
    aiHint,
    operation,
  }) => {
    const dsState = {
      type: 'heap',
      name: 'maxHeap',
      values: [...heap],
      activeIndex,
      parentIndex,
      comparedIndices,
      swappedIndices,
      heapType: 'Max-Heap',
    };

    steps.push({
      stepNumber: stepNumber++,
      lineNumber,
      eventType,
      variables: { ...variables, heapSize: heap.length, root: heap[0] || null },
      changedVariable: swappedIndices.length > 0 ? 'heap' : null,
      previousValue: null,
      currentValue: [...heap],
      dataStructure: dsState,
      dataStructureState: dsState,
      output: [],
      metadata: { operation, activeIndex, parentIndex },
      explanation,
      aiHint,
    });
  };

  createStep({
    lineNumber: 2,
    eventType: AlgorithmEventType.START,
    variables: { size: 0 },
    explanation: 'Max-Heap initialized empty.',
    aiHint: 'Parent at index i has children at 2i + 1 and 2i + 2. Invariant: Parent >= Child.',
    operation: 'INIT',
  });

  for (const val of valuesToInsert) {
    heap.push(val);
    let i = heap.length - 1;

    createStep({
      lineNumber: 5,
      eventType: AlgorithmEventType.INSERT,
      variables: { insertedValue: val, insertedAt: i },
      activeIndex: i,
      explanation: `Appended ${val} to end of heap (index ${i}). Now heapifying up.`,
      aiHint: `Array slot [${i}] = ${val}. Checking heap invariant against parent.`,
      operation: 'INSERT_LEAF',
    });

    // Heapify up
    while (i > 0) {
      const p = Math.floor((i - 1) / 2);

      createStep({
        lineNumber: 7,
        eventType: AlgorithmEventType.COMPARE,
        variables: { current: heap[i], parent: heap[p], i, p },
        activeIndex: i,
        parentIndex: p,
        comparedIndices: [i, p],
        explanation: `Comparing child heap[${i}] (${heap[i]}) with parent heap[${p}] (${heap[p]}).`,
        aiHint: heap[i] > heap[p]
          ? `Child (${heap[i]}) > Parent (${heap[p]}): Invariant violated! Must swap.`
          : `Child (${heap[i]}) <= Parent (${heap[p]}): Heap invariant satisfied.`,
        operation: 'COMPARE_PARENT',
      });

      if (heap[i] > heap[p]) {
        const temp = heap[i];
        heap[i] = heap[p];
        heap[p] = temp;

        createStep({
          lineNumber: 9,
          eventType: AlgorithmEventType.SWAP,
          variables: { i, p, swappedVal: temp },
          activeIndex: p,
          parentIndex: i,
          swappedIndices: [i, p],
          explanation: `Swapped child ${temp} up to index ${p} with parent.`,
          aiHint: `Element bubbled up closer to the root.`,
          operation: 'HEAPIFY_SWAP',
        });

        i = p;
      } else {
        break;
      }
    }
  }

  createStep({
    lineNumber: 12,
    eventType: AlgorithmEventType.COMPLETE,
    variables: { maxHeapArray: [...heap], rootMax: heap[0] },
    activeIndex: 0,
    explanation: `Max-Heap successfully constructed: [${heap.join(', ')}]. Root maximum is ${heap[0]}.`,
    aiHint: 'Dual 3D tree and array memory synchronized.',
    operation: 'COMPLETE',
  });

  return {
    initialState: valuesToInsert,
    steps,
    finalState: [...heap],
    complexity: heapOpsDetails.complexity,
    details: heapOpsDetails,
  };
}
