import { AlgorithmEventType } from '../types.js';

export const binarySearchDetails = {
  id: 'binary-search',
  name: 'Binary Search',
  category: 'Searching',
  description: 'A search algorithm that finds the position of a target value within a sorted array by repeatedly dividing the search interval in half.',
  howItWorks: 'Initialize pointers low = 0 and high = n - 1. Calculate midpoint mid = floor((low + high) / 2). If arr[mid] equals target, return mid. If arr[mid] < target, narrow the interval to the right half (low = mid + 1). If arr[mid] > target, narrow to the left half (high = mid - 1). Repeat until found or low > high.',
  example: 'Sorted Array: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], Target: 23 -> mid: index 4 (16 < 23) -> low=5, mid=7 (56 > 23) -> high=6, mid=5 (23 == 23) -> Found at index 5!',
  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(log n)',
      worst: 'O(log n)',
    },
    space: 'O(1)',
    stable: 'Not Applicable',
    inPlace: 'Yes',
  },
  advantages: [
    'Logarithmic time complexity O(log n) makes it immensely fast for large sorted datasets (e.g. 1 billion items in ~30 steps).',
    'Iterative implementation uses O(1) constant auxiliary space.',
    'Forms the foundation of many advanced algorithms, lower/upper bounds, and bisect search.'
  ],
  limitations: [
    'Strict requirement: the array MUST be sorted beforehand (sorting takes O(n log n)).',
    'Requires random access memory (arrays), ineffective on standard linked lists.'
  ],
  code: {
    java: `public class BinarySearch {
    public static int binarySearch(int[] arr, int target) {
        int low = 0;
        int high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) {
                return mid; // Target found
            } else if (arr[mid] < target) {
                low = mid + 1; // Discard left half
            } else {
                high = mid - 1; // Discard right half
            }
        }
        return -1; // Target not found
    }
}`,
    python: `def binary_search(arr, target):
    low = 0
    high = len(arr) - 1
    while low <= high:
        mid = (low + high) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1`,
    cpp: `int binarySearch(const vector<int>& arr, int target) {
    int low = 0;
    int high = arr.size() - 1;
    while (low <= high) {
        int mid = low + (high - low) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`,
    javascript: `function binarySearch(arr, target) {
    let low = 0;
    let high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) low = mid + 1;
        else high = mid - 1;
    }
    return -1;
}`
  }
};

export function generateBinarySearchSteps(inputArray, searchTarget = 42) {
  // Binary search requires a sorted array
  let arr = Array.isArray(inputArray) && inputArray.length > 0
    ? [...inputArray]
    : [4, 9, 15, 23, 31, 42, 55, 68, 77, 90];

  // Auto-sort if not sorted
  arr.sort((a, b) => a - b);

  const target = Number.isFinite(Number(searchTarget)) ? Number(searchTarget) : 42;
  const n = arr.length;
  const steps = [];
  let stepNumber = 1;

  const createStep = ({
    lineNumber,
    eventType,
    variables,
    comparedIndices = [],
    activeIndex = null,
    pointers = {},
    explanation,
    aiHint,
    operation = 'STEP',
    condition = null,
  }) => {
    const dsState = {
      type: 'searching',
      name: 'arr',
      values: [...arr],
      comparedIndices,
      activeIndex,
      pointers: { ...pointers, target },
    };

    steps.push({
      stepNumber: stepNumber++,
      lineNumber,
      eventType,
      variables: { ...variables, target, n, ...pointers },
      changedVariable: pointers.mid !== undefined ? 'mid' : (pointers.low !== undefined ? 'low' : null),
      previousValue: null,
      currentValue: [...arr],
      dataStructure: dsState,
      dataStructureState: dsState,
      condition,
      output: [],
      metadata: {
        operation,
        comparedIndices,
        activeIndex,
        target,
        pointers,
      },
      explanation,
      aiHint,
    });
  };

  createStep({
    lineNumber: 2,
    eventType: AlgorithmEventType.START,
    variables: { arr: [...arr], target, low: 0, high: n - 1 },
    pointers: { low: 0, high: n - 1, target },
    explanation: `Binary Search started for target ${target} on sorted array of size ${n}.`,
    aiHint: `Search window initialized: low = 0, high = ${n - 1}.`,
    operation: 'INITIALIZE',
  });

  let low = 0;
  let high = n - 1;
  let foundIndex = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = arr[mid];
    const isMatch = midVal === target;
    const isSmaller = midVal < target;

    createStep({
      lineNumber: 6,
      eventType: AlgorithmEventType.SELECT,
      variables: { arr: [...arr], low, high, mid, 'arr[mid]': midVal, target },
      comparedIndices: [mid],
      activeIndex: mid,
      pointers: { low, mid, high, target },
      operation: 'CALCULATE_MID',
      explanation: `Calculated midpoint mid = floor((${low} + ${high}) / 2) = ${mid}. Element arr[${mid}] = ${midVal}.`,
      aiHint: `Search window spans indices [${low}..${high}]. Inspecting center value ${midVal}.`,
    });

    createStep({
      lineNumber: 7,
      eventType: AlgorithmEventType.COMPARE,
      variables: { arr: [...arr], low, high, mid, 'arr[mid]': midVal, target },
      comparedIndices: [mid],
      activeIndex: mid,
      pointers: { low, mid, high, target },
      operation: 'COMPARE',
      condition: {
        expression: `arr[mid] == target`,
        evaluation: `${midVal} == ${target}`,
        result: isMatch,
        branch: isMatch
          ? 'TARGET MATCH'
          : (isSmaller ? 'TARGET IS GREATER (SEARCH RIGHT)' : 'TARGET IS SMALLER (SEARCH LEFT)'),
      },
      explanation: `Comparing arr[${mid}] (${midVal}) with target (${target}).`,
      aiHint: isMatch
        ? `Direct match found! arr[${mid}] == ${target}.`
        : (isSmaller
            ? `${midVal} < ${target}: Target must lie in right half. Adjusting low = ${mid + 1}.`
            : `${midVal} > ${target}: Target must lie in left half. Adjusting high = ${mid - 1}.`),
    });

    if (isMatch) {
      foundIndex = mid;

      createStep({
        lineNumber: 8,
        eventType: AlgorithmEventType.FOUND,
        variables: { arr: [...arr], low, high, mid, target, foundIndex },
        comparedIndices: [mid],
        activeIndex: mid,
        pointers: { low, mid, high, target, found: mid },
        operation: 'FOUND',
        explanation: `🎯 Target ${target} successfully found at index ${mid}!`,
        aiHint: `Target located in logarithmic steps. Binary Search complete.`,
      });

      break;
    } else if (isSmaller) {
      low = mid + 1;

      createStep({
        lineNumber: 10,
        eventType: AlgorithmEventType.UPDATE,
        variables: { arr: [...arr], low, high, mid, target },
        pointers: { low, high, target },
        operation: 'MOVE_LOW',
        explanation: `Discarded left partition [0..${mid}]. New search boundary: low = ${low}, high = ${high}.`,
        aiHint: `Remaining candidate window: indices ${low} to ${high}.`,
      });
    } else {
      high = mid - 1;

      createStep({
        lineNumber: 12,
        eventType: AlgorithmEventType.UPDATE,
        variables: { arr: [...arr], low, high, mid, target },
        pointers: { low, high, target },
        operation: 'MOVE_HIGH',
        explanation: `Discarded right partition [${mid}..${n - 1}]. New search boundary: low = ${low}, high = ${high}.`,
        aiHint: `Remaining candidate window: indices ${low} to ${high}.`,
      });
    }
  }

  if (foundIndex === -1) {
    createStep({
      lineNumber: 15,
      eventType: AlgorithmEventType.NOT_FOUND,
      variables: { arr: [...arr], low, high, target, foundIndex: -1 },
      pointers: { low, high, target },
      operation: 'NOT_FOUND',
      explanation: `Search boundaries crossed (low ${low} > high ${high}). Target ${target} does not exist in array (returned -1).`,
      aiHint: 'Interval exhausted without a match. Worst-case O(log n) steps executed.',
    });
  }

  return {
    initialState: arr,
    steps,
    finalState: foundIndex !== -1 ? foundIndex : -1,
    complexity: binarySearchDetails.complexity,
    details: binarySearchDetails,
  };
}
