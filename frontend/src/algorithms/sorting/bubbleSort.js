import { AlgorithmEventType } from '../types.js';

export const bubbleSortDetails = {
  id: 'bubble-sort',
  name: 'Bubble Sort',
  category: 'Sorting',
  description: 'Repeatedly steps through the list, compares adjacent elements, and swaps them if they are in the wrong order.',
  howItWorks: 'During each pass, adjacent elements are compared. If the left element is greater than the right element, they swap. After each full pass, the largest unsorted element bubbles up to its correct final position at the end.',
  example: 'Initial: [5, 1, 4, 2, 8] -> Pass 1: [1, 4, 2, 5, 8] -> Pass 2: [1, 2, 4, 5, 8] (Sorted)',
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
    'Extremely simple to understand and implement.',
    'In-place algorithm requiring O(1) auxiliary memory.',
    'Stable sort: preserves relative order of identical elements.',
    'Detects already sorted arrays in O(n) time with early termination.'
  ],
  limitations: [
    'O(n²) worst and average time complexity makes it inefficient for large datasets.',
    'Performs numerous swaps, incurring high cache miss overhead compared to Quick or Merge Sort.'
  ],
  code: {
    java: `public class BubbleSort {
    public static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) break;
        }
    }
}`,
    python: `def bubble_sort(arr):
    n = len(arr)
    for i in range(n - 1):
        swapped = False
        for j in range(n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        if not swapped:
            break
    return arr`,
    cpp: `void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        bool swapped = false;
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
                swapped = true;
            }
        }
        if (!swapped) break;
    }
}`,
    javascript: `function bubbleSort(arr) {
    const n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        if (!swapped) break;
    }
    return arr;
}`
  }
};

export function generateBubbleSortSteps(inputArray) {
  const arr = Array.isArray(inputArray) && inputArray.length > 0
    ? [...inputArray]
    : [64, 34, 25, 12, 22, 11, 90];
  
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
      changedVariable: swappedIndices.length > 0 ? 'arr' : (pointers.j !== undefined ? 'j' : null),
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
    explanation: `Bubble Sort started on array of size ${n}: [${arr.join(', ')}].`,
    aiHint: 'Adjacent pairs will be compared repeatedly from left to right.',
    operation: 'INITIALIZE',
  });

  for (let i = 0; i < n - 1; i++) {
    let swappedAny = false;

    for (let j = 0; j < n - i - 1; j++) {
      const isGreater = arr[j] > arr[j + 1];

      createStep({
        lineNumber: 6,
        eventType: AlgorithmEventType.COMPARE,
        variables: { arr: [...arr], i, j, 'arr[j]': arr[j], 'arr[j+1]': arr[j + 1] },
        comparedIndices: [j, j + 1],
        activeIndex: j,
        pointers: { i, j },
        operation: 'COMPARE',
        condition: {
          expression: `arr[${j}] > arr[${j + 1}]`,
          evaluation: `${arr[j]} > ${arr[j + 1]}`,
          result: isGreater,
          branch: isGreater ? 'SWAP NEEDED' : 'ALREADY ORDERED',
        },
        explanation: `Comparing arr[${j}] (${arr[j]}) with arr[${j + 1}] (${arr[j + 1]}).`,
        aiHint: isGreater
          ? `${arr[j]} > ${arr[j + 1]}, so we must swap them to move the larger value rightward.`
          : `${arr[j]} <= ${arr[j + 1]}, no swap needed. Elements are in relative order.`,
      });

      if (isGreater) {
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swappedAny = true;

        createStep({
          lineNumber: 8,
          eventType: AlgorithmEventType.SWAP,
          variables: { arr: [...arr], i, j, temp },
          comparedIndices: [j, j + 1],
          swappedIndices: [j, j + 1],
          activeIndex: j + 1,
          pointers: { i, j },
          operation: 'SWAP',
          explanation: `Swapped arr[${j}] (${arr[j + 1]}) and arr[${j + 1}] (${arr[j]}).`,
          aiHint: `Larger value ${temp} moves one position closer to the end.`,
        });
      }
    }

    sortedIndices.unshift(n - 1 - i);

    createStep({
      lineNumber: 13,
      eventType: AlgorithmEventType.SORTED,
      variables: { arr: [...arr], i },
      activeIndex: n - 1 - i,
      pointers: { i },
      operation: 'SORTED',
      explanation: `Element at index ${n - 1 - i} (${arr[n - 1 - i]}) is now in its final sorted position.`,
      aiHint: `The largest element of this pass has bubbled to the end.`,
    });

    if (!swappedAny) {
      break;
    }
  }

  // Mark all elements as sorted
  for (let k = 0; k < n; k++) {
    if (!sortedIndices.includes(k)) sortedIndices.push(k);
  }

  createStep({
    lineNumber: 15,
    eventType: AlgorithmEventType.COMPLETE,
    variables: { arr: [...arr] },
    operation: 'COMPLETE',
    explanation: `Array completely sorted: [${arr.join(', ')}].`,
    aiHint: 'All elements are now in non-decreasing order.',
  });

  return {
    initialState: Array.isArray(inputArray) ? inputArray : [64, 34, 25, 12, 22, 11, 90],
    steps,
    finalState: [...arr],
    complexity: bubbleSortDetails.complexity,
    details: bubbleSortDetails,
  };
}
