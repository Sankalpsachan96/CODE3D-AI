import { AlgorithmEventType } from '../types.js';

export const selectionSortDetails = {
  id: 'selection-sort',
  name: 'Selection Sort',
  category: 'Sorting',
  description: 'Divides the list into a sorted and unsorted region, repeatedly finds the minimum element in the unsorted region, and swaps it with the first unsorted element.',
  howItWorks: 'Starting at index 0, scan the remaining unsorted subarray to locate the minimum element. Once found, swap it with the element at the current boundary index i. Advance boundary i and repeat until the array is fully sorted.',
  example: 'Initial: [64, 25, 12, 22, 11] -> Min is 11: [11, 25, 12, 22, 64] -> Min is 12: [11, 12, 25, 22, 64] -> Sorted',
  complexity: {
    time: {
      best: 'O(n²)',
      average: 'O(n²)',
      worst: 'O(n²)',
    },
    space: 'O(1)',
    stable: 'No',
    inPlace: 'Yes',
  },
  advantages: [
    'Performs at most O(n) swaps, making it ideal when writing to memory is expensive.',
    'Simple logic with zero recursion and O(1) auxiliary space overhead.',
    'Consistently executes without worst-case degradation compared to quicksort on worst partitions.'
  ],
  limitations: [
    'Always executes n(n - 1)/2 comparisons regardless of whether the array was already sorted.',
    'Unstable sort: can alter relative order of equivalent values due to long-distance swaps.'
  ],
  code: {
    java: `public class SelectionSort {
    public static void selectionSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            int minIdx = i;
            for (int j = i + 1; j < n; j++) {
                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            int temp = arr[minIdx];
            arr[minIdx] = arr[i];
            arr[i] = temp;
        }
    }
}`,
    python: `def selection_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        min_idx = i
        for j in range(i + 1, n):
            if arr[j] < arr[min_idx]:
                min_idx = j
        arr[i], arr[min_idx] = arr[min_idx], arr[i]
    return arr`,
    cpp: `void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        swap(arr[i], arr[minIdx]);
    }
}`,
    javascript: `function selectionSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
}`
  }
};

export function generateSelectionSortSteps(inputArray) {
  const arr = Array.isArray(inputArray) && inputArray.length > 0
    ? [...inputArray]
    : [29, 10, 14, 37, 13];
  
  const n = arr.length;
  const steps = [];
  let stepNumber = 1;
  const sortedIndices = [];

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
      changedVariable: swappedIndices.length > 0 ? 'arr' : (pointers.minIdx !== undefined ? 'minIdx' : null),
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
    explanation: `Selection Sort initialized with ${n} elements: [${arr.join(', ')}].`,
    aiHint: 'We will scan the unsorted partition to repeatedly find and place the minimum value.',
    operation: 'INITIALIZE',
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    createStep({
      lineNumber: 4,
      eventType: AlgorithmEventType.SELECT,
      variables: { arr: [...arr], i, minIdx, currentMin: arr[minIdx] },
      activeIndex: i,
      pointers: { i, minIdx },
      operation: 'SET_MIN',
      explanation: `Pass ${i + 1}: Starting with current minimum assumption at index ${i} (${arr[i]}).`,
      aiHint: `Variable minIdx initialized to ${i}. Now scanning j from ${i + 1} to ${n - 1}.`,
    });

    for (let j = i + 1; j < n; j++) {
      const isSmaller = arr[j] < arr[minIdx];

      createStep({
        lineNumber: 6,
        eventType: AlgorithmEventType.COMPARE,
        variables: { arr: [...arr], i, j, minIdx, 'arr[j]': arr[j], 'arr[minIdx]': arr[minIdx] },
        comparedIndices: [j, minIdx],
        activeIndex: j,
        pointers: { i, j, minIdx },
        operation: 'COMPARE',
        condition: {
          expression: `arr[${j}] < arr[${minIdx}]`,
          evaluation: `${arr[j]} < ${arr[minIdx]}`,
          result: isSmaller,
          branch: isSmaller ? 'NEW MINIMUM FOUND' : 'KEEP CURRENT MIN',
        },
        explanation: `Comparing arr[${j}] (${arr[j]}) with current minimum arr[${minIdx}] (${arr[minIdx]}).`,
        aiHint: isSmaller
          ? `Found a smaller value (${arr[j]} < ${arr[minIdx]}). Updating minIdx to ${j}.`
          : `${arr[j]} >= ${arr[minIdx]}. Current minimum remains at index ${minIdx}.`,
      });

      if (isSmaller) {
        minIdx = j;

        createStep({
          lineNumber: 7,
          eventType: AlgorithmEventType.SELECT,
          variables: { arr: [...arr], i, j, minIdx, newMin: arr[minIdx] },
          activeIndex: minIdx,
          pointers: { i, j, minIdx },
          operation: 'UPDATE_MIN',
          explanation: `Updated minimum pointer minIdx to ${minIdx} (value: ${arr[minIdx]}).`,
          aiHint: `Smallest element observed so far in this pass is ${arr[minIdx]}.`,
        });
      }
    }

    if (minIdx !== i) {
      const temp = arr[minIdx];
      arr[minIdx] = arr[i];
      arr[i] = temp;

      createStep({
        lineNumber: 11,
        eventType: AlgorithmEventType.SWAP,
        variables: { arr: [...arr], i, minIdx, swappedVal: temp },
        comparedIndices: [i, minIdx],
        swappedIndices: [i, minIdx],
        activeIndex: i,
        pointers: { i, minIdx },
        operation: 'SWAP',
        explanation: `Swapped minimum element ${temp} (from index ${minIdx}) into position ${i}.`,
        aiHint: `Element at index ${i} is now sorted in its final place.`,
      });
    }

    sortedIndices.push(i);

    createStep({
      lineNumber: 13,
      eventType: AlgorithmEventType.SORTED,
      variables: { arr: [...arr], i },
      activeIndex: i,
      pointers: { i },
      operation: 'SORTED',
      explanation: `Index ${i} (${arr[i]}) is now fully sorted.`,
      aiHint: `The sorted prefix now extends up to index ${i}.`,
    });
  }

  // Mark all sorted
  for (let k = 0; k < n; k++) {
    if (!sortedIndices.includes(k)) sortedIndices.push(k);
  }

  createStep({
    lineNumber: 15,
    eventType: AlgorithmEventType.COMPLETE,
    variables: { arr: [...arr] },
    operation: 'COMPLETE',
    explanation: `Selection Sort complete. Array is fully sorted: [${arr.join(', ')}].`,
    aiHint: 'Every item is placed in correct ascending sequence.',
  });

  return {
    initialState: Array.isArray(inputArray) ? inputArray : [29, 10, 14, 37, 13],
    steps,
    finalState: [...arr],
    complexity: selectionSortDetails.complexity,
    details: selectionSortDetails,
  };
}
