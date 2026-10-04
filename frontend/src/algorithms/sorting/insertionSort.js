import { AlgorithmEventType } from '../types.js';

export const insertionSortDetails = {
  id: 'insertion-sort',
  name: 'Insertion Sort',
  category: 'Sorting',
  description: 'Builds the final sorted array one item at a time by repeatedly taking the next element and inserting it into its correct position within the sorted prefix.',
  howItWorks: 'Starting at index 1, pick the key element. Compare the key with elements in the sorted prefix (to its left). Shift elements greater than key one position to the right. Finally, insert the key into the vacant position.',
  example: 'Initial: [12, 11, 13, 5, 6] -> Key 11: [11, 12, 13, 5, 6] -> Key 13: [11, 12, 13, 5, 6] -> Key 5: [5, 11, 12, 13, 6] -> Sorted',
  complexity: {
    time: {
      best: 'O(n)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    space: 'O(1)',
    stable: 'Yes',
    inPlace: 'Yes',
  },
  advantages: [
    'Highly efficient for small data sets or arrays that are already nearly sorted (O(n) time).',
    'Adaptive: number of operations is directly proportional to number of inversions.',
    'Stable sort with minimal memory overhead (in-place O(1) space).',
    'Online algorithm: can sort a list as it receives it element by element.'
  ],
  limitations: [
    'O(n²) time complexity for reverse-ordered or random large datasets.',
    'Shifting elements creates substantial memory write overhead compared to divide-and-conquer sorts.'
  ],
  code: {
    java: `public class InsertionSort {
    public static void insertionSort(int[] arr) {
        int n = arr.length;
        for (int i = 1; i < n; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j = j - 1;
            }
            arr[j + 1] = key;
        }
    }
}`,
    python: `def insertion_sort(arr):
    for i in range(1, len(arr)):
        key = arr[i]
        j = i - 1
        while j >= 0 and arr[j] > key:
            arr[j + 1] = arr[j]
            j -= 1
        arr[j + 1] = key
    return arr`,
    cpp: `void insertionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 1; i < n; i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
}`,
    javascript: `function insertionSort(arr) {
    const n = arr.length;
    for (let i = 1; i < n; i++) {
        const key = arr[i];
        let j = i - 1;
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`
  }
};

export function generateInsertionSortSteps(inputArray) {
  const arr = Array.isArray(inputArray) && inputArray.length > 0
    ? [...inputArray]
    : [12, 11, 13, 5, 6];
  
  const n = arr.length;
  const steps = [];
  let stepNumber = 1;
  const sortedIndices = [0];

  const createStep = ({
    lineNumber,
    eventType,
    variables,
    comparedIndices = [],
    swappedIndices = [],
    activeIndex = null,
    pointers = {},
    explanation,
    aiHint,
    operation = 'STEP',
    condition = null,
  }) => {
    const dsState = {
      type: 'sorting',
      name: 'arr',
      values: [...arr],
      comparedIndices,
      swappedIndices,
      sortedIndices: [...sortedIndices],
      activeIndex,
      pointers,
    };

    steps.push({
      stepNumber: stepNumber++,
      lineNumber,
      eventType,
      variables: { ...variables, n, ...pointers },
      changedVariable: swappedIndices.length > 0 ? 'arr' : (pointers.key !== undefined ? 'key' : null),
      previousValue: null,
      currentValue: [...arr],
      dataStructure: dsState,
      dataStructureState: dsState,
      condition,
      output: [],
      metadata: {
        operation,
        comparedIndices,
        swappedIndices,
        activeIndex,
        pointers,
      },
      explanation,
      aiHint,
    });
  };

  createStep({
    lineNumber: 2,
    eventType: AlgorithmEventType.START,
    variables: { arr: [...arr] },
    explanation: `Insertion Sort started with ${n} elements: [${arr.join(', ')}].`,
    aiHint: 'The initial element at index 0 is already considered a trivially sorted sub-array.',
    operation: 'INITIALIZE',
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    createStep({
      lineNumber: 5,
      eventType: AlgorithmEventType.SELECT,
      variables: { arr: [...arr], i, key, j },
      activeIndex: i,
      pointers: { i, j, key },
      operation: 'PICK_KEY',
      explanation: `Selected key = arr[${i}] (${key}). Comparing with elements in the sorted prefix (0 to ${i - 1}).`,
      aiHint: `Key value ${key} is cached. We will slide any larger values in the left prefix rightward.`,
    });

    while (j >= 0) {
      const isShiftNeeded = arr[j] > key;

      createStep({
        lineNumber: 7,
        eventType: AlgorithmEventType.COMPARE,
        variables: { arr: [...arr], i, j, key, 'arr[j]': arr[j] },
        comparedIndices: [j, j + 1],
        activeIndex: j,
        pointers: { i, j, key },
        operation: 'COMPARE',
        condition: {
          expression: `arr[${j}] > key`,
          evaluation: `${arr[j]} > ${key}`,
          result: isShiftNeeded,
          branch: isShiftNeeded ? 'SHIFT RIGHT' : 'INSERT POSITION FOUND',
        },
        explanation: `Comparing arr[${j}] (${arr[j]}) with key (${key}).`,
        aiHint: isShiftNeeded
          ? `${arr[j]} > ${key}, so arr[${j}] must shift right to index ${j + 1}.`
          : `${arr[j]} <= ${key}, correct insertion position reached at index ${j + 1}.`,
      });

      if (isShiftNeeded) {
        arr[j + 1] = arr[j];

        createStep({
          lineNumber: 8,
          eventType: AlgorithmEventType.INSERT,
          variables: { arr: [...arr], i, j, key },
          comparedIndices: [j, j + 1],
          swappedIndices: [j + 1],
          activeIndex: j + 1,
          pointers: { i, j, key },
          operation: 'SHIFT',
          explanation: `Shifted arr[${j}] (${arr[j + 1]}) rightward into slot ${j + 1}.`,
          aiHint: `Vacating slot ${j} for insertion.`,
        });

        j--;
      } else {
        break;
      }
    }

    arr[j + 1] = key;
    sortedIndices.push(i);

    createStep({
      lineNumber: 11,
      eventType: AlgorithmEventType.INSERT,
      variables: { arr: [...arr], i, key, insertedAt: j + 1 },
      comparedIndices: [j + 1],
      swappedIndices: [j + 1],
      activeIndex: j + 1,
      pointers: { i, key, insertedIndex: j + 1 },
      operation: 'INSERT_KEY',
      explanation: `Inserted key (${key}) into slot ${j + 1}. Sorted prefix is now indices 0 to ${i}.`,
      aiHint: `The prefix array [${arr.slice(0, i + 1).join(', ')}] is sorted.`,
    });
  }

  // Mark all elements sorted
  for (let k = 0; k < n; k++) {
    if (!sortedIndices.includes(k)) sortedIndices.push(k);
  }

  createStep({
    lineNumber: 13,
    eventType: AlgorithmEventType.COMPLETE,
    variables: { arr: [...arr] },
    operation: 'COMPLETE',
    explanation: `Insertion Sort finished. Final array: [${arr.join(', ')}].`,
    aiHint: 'All items have been inserted into their appropriate sorted locations.',
  });

  return {
    initialState: Array.isArray(inputArray) ? inputArray : [12, 11, 13, 5, 6],
    steps,
    finalState: [...arr],
    complexity: insertionSortDetails.complexity,
    details: insertionSortDetails,
  };
}
