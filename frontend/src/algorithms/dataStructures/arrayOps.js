import { AlgorithmEventType } from '../types.js';

export const arrayOpsDetails = {
  id: 'array-ops',
  name: 'Array Traversal & Reverse',
  category: 'Data Structures',
  description: 'Contiguous memory collection of elements accessed by numeric indices in constant O(1) time.',
  howItWorks: 'Traverses each memory address slot using two pointers (left and right) moving inward, swapping pairs to invert the array in-place.',
  example: 'Initial: [10, 20, 30, 40, 50] -> Swap 10 & 50 -> Swap 20 & 40 -> Result: [50, 40, 30, 20, 10]',
  complexity: {
    time: {
      best: 'O(n)',
      average: 'O(n)',
      worst: 'O(n)',
    },
    space: 'O(1)',
    stable: 'Yes',
    inPlace: 'Yes',
  },
  advantages: [
    'O(1) constant time random access by index via base address arithmetic.',
    'Optimal CPU cache line spatial locality due to contiguous physical memory layout.',
    'Minimal metadata overhead compared to pointer-heavy nodes.'
  ],
  limitations: [
    'Fixed size in standard arrays; resizing requires O(n) re-allocation and copy.',
    'Insertions and deletions at arbitrary positions require O(n) element shifting.'
  ],
  code: {
    java: `public class ArrayReverse {
    public static void reverseArray(int[] arr) {
        int left = 0, right = arr.length - 1;
        while (left < right) {
            int temp = arr[left];
            arr[left] = arr[right];
            arr[right] = temp;
            left++;
            right--;
        }
    }
}`,
    python: `def reverse_array(arr):
    left, right = 0, len(arr) - 1
    while left < right:
        arr[left], arr[right] = arr[right], arr[left]
        left += 1
        right -= 1
    return arr`,
    cpp: `void reverseArray(vector<int>& arr) {
    int left = 0, right = arr.size() - 1;
    while (left < right) {
        swap(arr[left++], arr[right--]);
    }
}`,
    javascript: `function reverseArray(arr) {
    let left = 0, right = arr.length - 1;
    while (left < right) {
        [arr[left], arr[right]] = [arr[right], arr[left]];
        left++;
        right--;
    }
    return arr;
}`
  }
};

export function generateArraySteps(inputArray) {
  const arr = Array.isArray(inputArray) && inputArray.length > 0
    ? [...inputArray]
    : [10, 20, 30, 40, 50, 60];
  
  const n = arr.length;
  const steps = [];
  let stepNumber = 1;

  const createStep = ({
    lineNumber,
    eventType,
    variables,
    activeIndex = null,
    pointers = {},
    swappedIndices = [],
    comparedIndices = [],
    explanation,
    aiHint,
    operation = 'STEP',
  }) => {
    const dsState = {
      type: 'array',
      name: 'arr',
      values: [...arr],
      comparedIndices,
      swappedIndices,
      activeIndex,
      pointers,
    };

    steps.push({
      stepNumber: stepNumber++,
      lineNumber,
      eventType,
      variables: { ...variables, n, ...pointers },
      changedVariable: swappedIndices.length > 0 ? 'arr' : (pointers.left !== undefined ? 'left' : null),
      previousValue: null,
      currentValue: [...arr],
      dataStructure: dsState,
      dataStructureState: dsState,
      output: [],
      metadata: { operation, pointers, activeIndex },
      explanation,
      aiHint,
    });
  };

  createStep({
    lineNumber: 2,
    eventType: AlgorithmEventType.START,
    variables: { arr: [...arr], left: 0, right: n - 1 },
    pointers: { left: 0, right: n - 1 },
    explanation: `Array reversal initialized with 2 pointers: left = 0, right = ${n - 1}.`,
    aiHint: 'Two pointers converge from the ends toward the center, swapping elements in-place.',
    operation: 'INITIALIZE',
  });

  let left = 0;
  let right = n - 1;

  while (left < right) {
    createStep({
      lineNumber: 4,
      eventType: AlgorithmEventType.COMPARE,
      variables: { arr: [...arr], left, right, 'arr[left]': arr[left], 'arr[right]': arr[right] },
      comparedIndices: [left, right],
      activeIndex: left,
      pointers: { left, right },
      operation: 'COMPARE',
      explanation: `Comparing arr[${left}] (${arr[left]}) and arr[${right}] (${arr[right]}).`,
      aiHint: `Condition left (${left}) < right (${right}) is true. Proceeding to swap.`,
    });

    const temp = arr[left];
    arr[left] = arr[right];
    arr[right] = temp;

    createStep({
      lineNumber: 6,
      eventType: AlgorithmEventType.SWAP,
      variables: { arr: [...arr], left, right, temp },
      comparedIndices: [left, right],
      swappedIndices: [left, right],
      activeIndex: right,
      pointers: { left, right },
      operation: 'SWAP',
      explanation: `Swapped elements at index ${left} and ${right}. Array is now [${arr.join(', ')}].`,
      aiHint: `Values inverted at positions ${left} and ${right}. Advancing pointers inward.`,
    });

    left++;
    right--;
  }

  createStep({
    lineNumber: 10,
    eventType: AlgorithmEventType.COMPLETE,
    variables: { arr: [...arr] },
    operation: 'COMPLETE',
    explanation: `Pointers converged. Array is successfully reversed: [${arr.join(', ')}].`,
    aiHint: 'In-place array reversal completed in O(n/2) iterations.',
  });

  return {
    initialState: Array.isArray(inputArray) ? inputArray : [10, 20, 30, 40, 50, 60],
    steps,
    finalState: [...arr],
    complexity: arrayOpsDetails.complexity,
    details: arrayOpsDetails,
  };
}
