import { AlgorithmEventType } from '../types.js';

export const mergeSortDetails = {
  id: 'merge-sort',
  name: 'Merge Sort',
  category: 'Sorting',
  description: 'An efficient, general-purpose, comparison-based divide-and-conquer sorting algorithm. Most implementations produce a stable sort.',
  howItWorks: 'Divides the array recursively into two halves until single-element subarrays remain. Then recursively merges adjacent sorted halves back together by comparing elements from both lists in ascending sequence.',
  example: 'Initial: [38, 27, 43, 3, 9, 82, 10] -> Divide to halves -> Merge [27, 38] & [3, 43] -> [3, 27, 38, 43] -> Final Merge -> [3, 9, 10, 27, 38, 43, 82]',
  complexity: {
    time: {
      best: 'O(n log n)',
      average: 'O(n log n)',
      worst: 'O(n log n)',
    },
    space: 'O(n)',
    stable: 'Yes',
    inPlace: 'No',
  },
  advantages: [
    'Guaranteed O(n log n) time complexity in worst, average, and best cases.',
    'Stable sort: always preserves the initial sequence of equal elements.',
    'Excellent for sorting Linked Lists and massive external datasets from disks.'
  ],
  limitations: [
    'Requires O(n) auxiliary memory for buffer allocations.',
    'Slower than QuickSort in practical cache locality benchmarks for in-memory primitive arrays.'
  ],
  code: {
    java: `public class MergeSort {
    public static void mergeSort(int[] arr, int left, int right) {
        if (left < right) {
            int mid = left + (right - left) / 2;
            mergeSort(arr, left, mid);
            mergeSort(arr, mid + 1, right);
            merge(arr, left, mid, right);
        }
    }

    private static void merge(int[] arr, int left, int mid, int right) {
        int[] temp = new int[right - left + 1];
        int i = left, j = mid + 1, k = 0;
        while (i <= mid && j <= right) {
            if (arr[i] <= arr[j]) temp[k++] = arr[i++];
            else temp[k++] = arr[j++];
        }
        while (i <= mid) temp[k++] = arr[i++];
        while (j <= right) temp[k++] = arr[j++];
        for (int p = 0; p < temp.length; p++) arr[left + p] = temp[p];
    }
}`,
    python: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    res = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            res.append(left[i])
            i += 1
        else:
            res.append(right[j])
            j += 1
    res.extend(left[i:])
    res.extend(right[j:])
    return res`,
    cpp: `void merge(vector<int>& arr, int left, int mid, int right) {
    vector<int> temp;
    int i = left, j = mid + 1;
    while (i <= mid && j <= right) {
        if (arr[i] <= arr[j]) temp.push_back(arr[i++]);
        else temp.push_back(arr[j++]);
    }
    while (i <= mid) temp.push_back(arr[i++]);
    while (j <= right) temp.push_back(arr[j++]);
    for (int k = 0; k < temp.size(); k++) arr[left + k] = temp[k];
}

void mergeSort(vector<int>& arr, int left, int right) {
    if (left < right) {
        int mid = left + (right - left) / 2;
        mergeSort(arr, left, mid);
        mergeSort(arr, mid + 1, right);
        merge(arr, left, mid, right);
    }
}`,
    javascript: `function mergeSort(arr, left = 0, right = arr.length - 1) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);
    mergeSort(arr, left, mid);
    mergeSort(arr, mid + 1, right);
    merge(arr, left, mid, right);
    return arr;
}`
  }
};

export function generateMergeSortSteps(inputArray) {
  const arr = Array.isArray(inputArray) && inputArray.length > 0
    ? [...inputArray]
    : [38, 27, 43, 3, 9, 82, 10];
  
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
      changedVariable: swappedIndices.length > 0 ? 'arr' : null,
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
    explanation: `Merge Sort initialized on array of size ${n}: [${arr.join(', ')}].`,
    aiHint: 'Divide and conquer: recursively split in half, then merge sorted halves.',
    operation: 'INITIALIZE',
  });

  function merge(left, mid, right) {
    const temp = [];
    let i = left;
    let j = mid + 1;

    createStep({
      lineNumber: 11,
      eventType: AlgorithmEventType.MERGE,
      variables: { arr: [...arr], left, mid, right },
      activeIndex: mid,
      pointers: { left, mid, right, i, j },
      operation: 'BEGIN_MERGE',
      explanation: `Merging subarrays: Left [${left}..${mid}] and Right [${mid + 1}..${right}].`,
      aiHint: `Pointers initialized: i = ${i} (left start), j = ${j} (right start).`,
    });

    while (i <= mid && j <= right) {
      const isLeftSmaller = arr[i] <= arr[j];

      createStep({
        lineNumber: 14,
        eventType: AlgorithmEventType.COMPARE,
        variables: { arr: [...arr], left, mid, right, i, j, 'arr[i]': arr[i], 'arr[j]': arr[j] },
        comparedIndices: [i, j],
        activeIndex: i,
        pointers: { left, mid, right, i, j },
        operation: 'COMPARE',
        condition: {
          expression: `arr[i] <= arr[j]`,
          evaluation: `${arr[i]} <= ${arr[j]}`,
          result: isLeftSmaller,
          branch: isLeftSmaller ? 'TAKE FROM LEFT' : 'TAKE FROM RIGHT',
        },
        explanation: `Comparing arr[${i}] (${arr[i]}) with arr[${j}] (${arr[j]}).`,
        aiHint: isLeftSmaller
          ? `${arr[i]} <= ${arr[j]}: Taking ${arr[i]} from the left half.`
          : `${arr[j]} < ${arr[i]}: Taking ${arr[j]} from the right half.`,
      });

      if (isLeftSmaller) {
        temp.push(arr[i]);
        i++;
      } else {
        temp.push(arr[j]);
        j++;
      }
    }

    while (i <= mid) {
      temp.push(arr[i]);
      i++;
    }

    while (j <= right) {
      temp.push(arr[j]);
      j++;
    }

    // Write temp buffer back into arr
    for (let p = 0; p < temp.length; p++) {
      const targetIdx = left + p;
      arr[targetIdx] = temp[p];

      if (right === n - 1 && left === 0) {
        sortedIndices.push(targetIdx);
      }

      createStep({
        lineNumber: 19,
        eventType: AlgorithmEventType.INSERT,
        variables: { arr: [...arr], left, right, targetIdx, value: temp[p] },
        comparedIndices: [targetIdx],
        swappedIndices: [targetIdx],
        activeIndex: targetIdx,
        pointers: { left, right, current: targetIdx },
        operation: 'MERGE_WRITE',
        explanation: `Wrote merged value ${temp[p]} into index ${targetIdx}.`,
        aiHint: `Subarray [${left}..${right}] is being reconstructed in sorted order.`,
      });
    }
  }

  function sort(left, right) {
    if (left >= right) return;
    const mid = Math.floor((left + right) / 2);

    createStep({
      lineNumber: 4,
      eventType: AlgorithmEventType.SELECT,
      variables: { arr: [...arr], left, mid, right },
      activeIndex: mid,
      pointers: { left, mid, right },
      operation: 'DIVIDE',
      explanation: `Dividing range [${left}..${right}] at midpoint mid = ${mid}.`,
      aiHint: `Left half: [${left}..${mid}], Right half: [${mid + 1}..${right}].`,
    });

    sort(left, mid);
    sort(mid + 1, right);
    merge(left, mid, right);
  }

  sort(0, n - 1);

  for (let k = 0; k < n; k++) {
    if (!sortedIndices.includes(k)) sortedIndices.push(k);
  }

  createStep({
    lineNumber: 22,
    eventType: AlgorithmEventType.COMPLETE,
    variables: { arr: [...arr] },
    operation: 'COMPLETE',
    explanation: `Merge Sort complete! Array fully ordered: [${arr.join(', ')}].`,
    aiHint: 'All recursive partitions merged successfully in O(n log n) time.',
  });

  return {
    initialState: Array.isArray(inputArray) ? inputArray : [38, 27, 43, 3, 9, 82, 10],
    steps,
    finalState: [...arr],
    complexity: mergeSortDetails.complexity,
    details: mergeSortDetails,
  };
}
