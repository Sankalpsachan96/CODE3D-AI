import { AlgorithmEventType } from '../types.js';

export const linearSearchDetails = {
  id: 'linear-search',
  name: 'Linear Search',
  category: 'Searching',
  description: 'Sequentially checks each element in a list until a match is found or the whole list has been searched.',
  howItWorks: 'Start at index 0. Compare the element at the current index with the target value. If equal, return the index. If not, advance to the next index. If the end of the array is reached without a match, report not found.',
  example: 'Array: [20, 45, 12, 78, 34], Target: 12 -> Check 20 (≠12) -> Check 45 (≠12) -> Check 12 (==12) -> Found at index 2!',
  complexity: {
    time: {
      best: 'O(1)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    space: 'O(1)',
    stable: 'Not Applicable',
    inPlace: 'Yes',
  },
  advantages: [
    'Works on unsorted arrays and collections with zero preprocessing required.',
    'Simple logic with O(1) auxiliary space requirement.',
    'Fast for very small lists (e.g. n < 10) due to linear cache layout.'
  ],
  limitations: [
    'O(n) time complexity is inefficient for large datasets compared to O(log n) binary search.',
    'Scans every item sequentially even if target is missing or at the very end.'
  ],
  code: {
    java: `public class LinearSearch {
    public static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == target) {
                return i; // Target found
            }
        }
        return -1; // Target not found
    }
}`,
    python: `def linear_search(arr, target):
    for i in range(len(arr)):
        if arr[i] == target:
            return i
    return -1`,
    cpp: `int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < arr.size(); i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1;
}`,
    javascript: `function linearSearch(arr, target) {
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] === target) {
            return i;
        }
    }
    return -1;
}`
  }
};

export function generateLinearSearchSteps(inputArray, searchTarget = 23) {
  const arr = Array.isArray(inputArray) && inputArray.length > 0
    ? [...inputArray]
    : [15, 42, 8, 99, 23, 67];
  
  const target = Number.isFinite(Number(searchTarget)) ? Number(searchTarget) : 23;
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
      changedVariable: pointers.i !== undefined ? 'i' : null,
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
    variables: { arr: [...arr], target },
    explanation: `Linear Search started for target value ${target} in array of length ${n}.`,
    aiHint: 'We will inspect each slot from index 0 sequentially.',
    operation: 'INITIALIZE',
  });

  let foundIndex = -1;

  for (let i = 0; i < n; i++) {
    const isMatch = arr[i] === target;

    createStep({
      lineNumber: 4,
      eventType: AlgorithmEventType.COMPARE,
      variables: { arr: [...arr], i, target, 'arr[i]': arr[i] },
      comparedIndices: [i],
      activeIndex: i,
      pointers: { i, target },
      operation: 'COMPARE',
      condition: {
        expression: `arr[i] == target`,
        evaluation: `${arr[i]} == ${target}`,
        result: isMatch,
        branch: isMatch ? 'TARGET FOUND' : 'CONTINUE SEARCH',
      },
      explanation: `Checking index ${i}: arr[${i}] = ${arr[i]} vs target = ${target}.`,
      aiHint: isMatch
        ? `Match found! arr[${i}] is equal to ${target}.`
        : `arr[${i}] (${arr[i]}) does not match target (${target}). Continuing to index ${i + 1}.`,
    });

    if (isMatch) {
      foundIndex = i;

      createStep({
        lineNumber: 5,
        eventType: AlgorithmEventType.FOUND,
        variables: { arr: [...arr], i, target, foundIndex },
        comparedIndices: [i],
        activeIndex: i,
        pointers: { i, target, found: i },
        operation: 'FOUND',
        explanation: `🎯 Target ${target} successfully located at index ${i}!`,
        aiHint: `Search terminated successfully in ${i + 1} comparisons.`,
      });

      break;
    }
  }

  if (foundIndex === -1) {
    createStep({
      lineNumber: 8,
      eventType: AlgorithmEventType.NOT_FOUND,
      variables: { arr: [...arr], target, foundIndex: -1 },
      pointers: { target },
      operation: 'NOT_FOUND',
      explanation: `Target value ${target} was not found in the array (returned -1).`,
      aiHint: `Scanned all ${n} elements without matching the target.`,
    });
  }

  return {
    initialState: Array.isArray(inputArray) ? inputArray : [15, 42, 8, 99, 23, 67],
    steps,
    finalState: foundIndex !== -1 ? foundIndex : -1,
    complexity: linearSearchDetails.complexity,
    details: linearSearchDetails,
  };
}
