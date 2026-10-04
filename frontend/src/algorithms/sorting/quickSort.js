import { AlgorithmEventType } from '../types.js';

export const quickSortDetails = {
  id: 'quick-sort',
  name: 'Quick Sort',
  category: 'Sorting',
  description: 'An efficient, in-place, divide-and-conquer sorting algorithm. Selects a pivot element and partitions the array such that smaller elements appear before the pivot and larger elements after.',
  howItWorks: 'Choose a pivot element. Rearrange the array so that elements smaller than the pivot go to the left and larger elements go to the right. The pivot is then in its final sorted position. Recursively apply the process to the left and right sub-arrays.',
  example: 'Initial: [10, 80, 30, 90, 40, 50, 70] -> Pivot 70 -> Partition -> [10, 30, 40, 50, 70, 90, 80] -> Recurse -> Sorted',
  complexity: {
    time: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n²)',
    },
    space: 'O(log n)',
    stable: 'No',
    inPlace: 'Yes',
  },
  advantages: [
    'One of the fastest comparison-based algorithms in practice due to exceptional CPU cache locality.',
    'Sorts in-place with only O(log n) auxiliary stack frames.',
    'Standard library default in many languages (e.g., C qsort, C++ std::sort dual-pivot).'
  ],
  limitations: [
    'O(n²) worst-case time when partitions are extremely unbalanced (mitigated by randomized/median-of-three pivot).',
    'Unstable: identical keys may change relative order during long-distance swaps.'
  ],
  code: {
    java: `public class QuickSort {
    public static void quickSort(int[] arr, int low, int high) {
        if (low < high) {
            int pi = partition(arr, low, high);
            quickSort(arr, low, pi - 1);
            quickSort(arr, pi + 1, high);
        }
    }

    private static int partition(int[] arr, int low, int high) {
        int pivot = arr[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (arr[j] < pivot) {
                i++;
                int temp = arr[i];
                arr[i] = arr[j];
                arr[j] = temp;
            }
        }
        int temp = arr[i + 1];
        arr[i + 1] = arr[high];
        arr[high] = temp;
        return i + 1;
    }
}`,
    python: `def quick_sort(arr, low, high):
    if low < high:
        pi = partition(arr, low, high)
        quick_sort(arr, low, pi - 1)
        quick_sort(arr, pi + 1, high)

def partition(arr, low, high):
    pivot = arr[high]
    i = low - 1
    for j in range(low, high):
        if arr[j] < pivot:
            i += 1
            arr[i], arr[j] = arr[j], arr[i]
    arr[i + 1], arr[high] = arr[high], arr[i + 1]
    return i + 1`,
    cpp: `int partition(vector<int>& arr, int low, int high) {
    int pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            swap(arr[i], arr[j]);
        }
    }
    swap(arr[i + 1], arr[high]);
    return i + 1;
}

void quickSort(vector<int>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
    javascript: `function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    return arr;
}`
  }
};

export function generateQuickSortSteps(inputArray) {
  const arr = Array.isArray(inputArray) && inputArray.length > 0
    ? [...inputArray]
    : [10, 80, 30, 90, 40, 50, 70];
  
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
      changedVariable: swappedIndices.length > 0 ? 'arr' : (pointers.pivot !== undefined ? 'pivot' : null),
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
    explanation: `Quick Sort initialized with ${n} elements: [${arr.join(', ')}].`,
    aiHint: 'Lomuto partition scheme: pick the last element as pivot, place elements < pivot to the left.',
    operation: 'INITIALIZE',
  });

  function partition(low, high) {
    const pivot = arr[high];
    let i = low - 1;

    createStep({
      lineNumber: 11,
      eventType: AlgorithmEventType.PARTITION,
      variables: { arr: [...arr], low, high, pivot, pivotIndex: high },
      activeIndex: high,
      pointers: { low, high, pivot: high, i: Math.max(0, i) },
      operation: 'SELECT_PIVOT',
      explanation: `Chosen pivot arr[${high}] = ${pivot}. Partitioning subarray [${low}..${high}].`,
      aiHint: `Boundary pointer i initialized to ${i}. Now iterating j from ${low} to ${high - 1}.`,
    });

    for (let j = low; j < high; j++) {
      const isSmaller = arr[j] < pivot;

      createStep({
        lineNumber: 14,
        eventType: AlgorithmEventType.COMPARE,
        variables: { arr: [...arr], low, high, j, 'arr[j]': arr[j], pivot },
        comparedIndices: [j, high],
        activeIndex: j,
        pointers: { low, high, pivot: high, i: Math.max(0, i), j },
        operation: 'COMPARE',
        condition: {
          expression: `arr[j] < pivot`,
          evaluation: `${arr[j]} < ${pivot}`,
          result: isSmaller,
          branch: isSmaller ? 'SWAP TO LEFT PARTITION' : 'LEAVE IN RIGHT PARTITION',
        },
        explanation: `Comparing arr[${j}] (${arr[j]}) with pivot (${pivot}).`,
        aiHint: isSmaller
          ? `${arr[j]} < ${pivot}: Increment i and swap arr[${i + 1}] with arr[${j}].`
          : `${arr[j]} >= ${pivot}: Stays on the right side of the partition.`,
      });

      if (isSmaller) {
        i++;
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;

        createStep({
          lineNumber: 16,
          eventType: AlgorithmEventType.SWAP,
          variables: { arr: [...arr], low, high, i, j, pivot },
          comparedIndices: [i, j],
          swappedIndices: [i, j],
          activeIndex: i,
          pointers: { low, high, pivot: high, i, j },
          operation: 'PARTITION_SWAP',
          explanation: `Swapped arr[${i}] and arr[${j}]. Value ${arr[i]} moved to left partition.`,
          aiHint: `Values up to index ${i} are now guaranteed to be smaller than the pivot (${pivot}).`,
        });
      }
    }

    // Place pivot at its final spot
    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    const finalPivotIdx = i + 1;
    sortedIndices.push(finalPivotIdx);

    createStep({
      lineNumber: 21,
      eventType: AlgorithmEventType.SORTED,
      variables: { arr: [...arr], low, high, finalPivotIdx, pivotVal: arr[finalPivotIdx] },
      comparedIndices: [finalPivotIdx, high],
      swappedIndices: [finalPivotIdx, high],
      activeIndex: finalPivotIdx,
      pointers: { low, high, pivot: finalPivotIdx },
      operation: 'PLACE_PIVOT',
      explanation: `Placed pivot ${arr[finalPivotIdx]} into its exact sorted index: ${finalPivotIdx}.`,
      aiHint: `Pivot is now fully sorted. Elements left are <= pivot, elements right are >= pivot.`,
    });

    return finalPivotIdx;
  }

  function sort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    } else if (low === high) {
      if (!sortedIndices.includes(low)) sortedIndices.push(low);
    }
  }

  sort(0, n - 1);

  for (let k = 0; k < n; k++) {
    if (!sortedIndices.includes(k)) sortedIndices.push(k);
  }

  createStep({
    lineNumber: 24,
    eventType: AlgorithmEventType.COMPLETE,
    variables: { arr: [...arr] },
    operation: 'COMPLETE',
    explanation: `Quick Sort completed! Sorted array: [${arr.join(', ')}].`,
    aiHint: 'All partition subarrays resolved successfully.',
  });

  return {
    initialState: Array.isArray(inputArray) ? inputArray : [10, 80, 30, 90, 40, 50, 70],
    steps,
    finalState: [...arr],
    complexity: quickSortDetails.complexity,
    details: quickSortDetails,
  };
}
