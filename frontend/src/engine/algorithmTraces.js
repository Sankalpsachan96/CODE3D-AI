/**
 * CODE3D-AI - Deterministic Sorting & Searching Trace Generators
 * 
 * Implements real step-by-step trace generation for:
 * - Bubble Sort
 * - Selection Sort
 * - Insertion Sort
 * - Merge Sort (with divide, conquer & merge steps)
 * - Quick Sort (with pivot selection, partitioning, and recursive bounds)
 * - Linear Search (with sequential scanning and target matching)
 * - Binary Search (with low, mid, high, range reduction, and target matching)
 * 
 * Strictly deterministic: no fake/mock animations.
 * Every step updates exact array states, comparison indicators, and 3D pointer tags.
 */

import { EventType } from './javaSimulator.js';

export function generateBubbleSortTrace(inputArray) {
  const arr = (inputArray && inputArray.length > 0) ? [...inputArray] : [64, 34, 25, 12, 22, 11, 90];
  const n = arr.length;
  const steps = [];
  const stdout = [];
  let stepNum = 1;
  const sortedIndices = [];

  const addStep = ({ line, eventType, explanation, aiHint, compared = [], swapped = [], active = null, pointers = {} }) => {
    steps.push({
      stepNumber: stepNum++,
      lineNumber: line,
      eventType,
      explanation,
      aiHint,
      variables: { arr: [...arr], n, ...pointers },
      changedVariable: swapped.length > 0 ? 'arr' : (pointers.j !== undefined ? 'j' : (pointers.i !== undefined ? 'i' : null)),
      previousValue: null,
      currentValue: [...arr],
      condition: compared.length === 2 ? {
        expression: `arr[j] > arr[j + 1]`,
        evaluation: `${arr[compared[0]]} > ${arr[compared[1]]}`,
        result: arr[compared[0]] > arr[compared[1]],
        branch: arr[compared[0]] > arr[compared[1]] ? 'SWAP NEEDED' : 'ALREADY ORDERED'
      } : null,
      output: [...stdout],
      dataStructureState: {
        type: 'sorting',
        name: 'arr',
        values: [...arr],
        comparedIndices: compared,
        swappedIndices: swapped,
        sortedIndices: [...sortedIndices],
        activeIndex: active,
        pointers
      },
      operation: { type: swapped.length > 0 ? 'SWAP' : (compared.length > 0 ? 'COMPARE' : 'STEP'), indices: swapped.length > 0 ? swapped : compared }
    });
  };

  addStep({
    line: 1,
    eventType: EventType.PROGRAM_START,
    explanation: `Bubble Sort initialized with ${n} elements: [${arr.join(', ')}].`,
    aiHint: 'Bubble Sort repeatedly steps through the list, compares adjacent elements, and swaps them if out of order.'
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Comparison step
      const isGreater = arr[j] > arr[j + 1];
      addStep({
        line: 4,
        eventType: EventType.CONDITION_CHECK,
        explanation: `Comparing adjacent elements arr[${j}] (${arr[j]}) and arr[${j + 1}] (${arr[j + 1]}).`,
        aiHint: isGreater
          ? `Because ${arr[j]} > ${arr[j + 1]}, a swap is needed to bubble the larger value rightward.`
          : `Because ${arr[j]} <= ${arr[j + 1]}, elements are already in non-decreasing order.`,
        compared: [j, j + 1],
        active: j,
        pointers: { i, j }
      });

      if (isGreater) {
        // Swap step
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;

        addStep({
          line: 6,
          eventType: EventType.ARRAY_UPDATE,
          explanation: `Swapped arr[${j}] and arr[${j + 1}]. Array is now [${arr.join(', ')}].`,
          aiHint: `Larger value ${temp} moved towards the end of the array.`,
          compared: [j, j + 1],
          swapped: [j, j + 1],
          active: j + 1,
          pointers: { i, j }
        });
      }
    }
    sortedIndices.unshift(n - 1 - i);
    stdout.push(`Pass ${i + 1} completed: element ${arr[n - 1 - i]} locked at index ${n - 1 - i}`);
  }

  sortedIndices.unshift(0);
  stdout.push(`Array fully sorted: [${arr.join(', ')}]`);

  addStep({
    line: 10,
    eventType: EventType.PROGRAM_END,
    explanation: `Bubble Sort completed. Final sorted array: [${arr.join(', ')}].`,
    aiHint: 'Time Complexity: O(n²) worst/average case, O(n) best case. Space Complexity: O(1) in-place.',
    pointers: { i: n - 1 }
  });

  return steps;
}

export function generateSelectionSortTrace(inputArray) {
  const arr = (inputArray && inputArray.length > 0) ? [...inputArray] : [29, 10, 14, 37, 13];
  const n = arr.length;
  const steps = [];
  const stdout = [];
  let stepNum = 1;
  const sortedIndices = [];

  const addStep = ({ line, eventType, explanation, aiHint, compared = [], swapped = [], active = null, pointers = {} }) => {
    steps.push({
      stepNumber: stepNum++,
      lineNumber: line,
      eventType,
      explanation,
      aiHint,
      variables: { arr: [...arr], n, ...pointers },
      changedVariable: swapped.length > 0 ? 'arr' : (pointers.minIdx !== undefined ? 'minIdx' : null),
      previousValue: null,
      currentValue: [...arr],
      output: [...stdout],
      dataStructureState: {
        type: 'sorting',
        name: 'arr',
        values: [...arr],
        comparedIndices: compared,
        swappedIndices: swapped,
        sortedIndices: [...sortedIndices],
        activeIndex: active,
        pointers
      },
      operation: { type: swapped.length > 0 ? 'SWAP' : (compared.length > 0 ? 'COMPARE' : 'STEP') }
    });
  };

  addStep({
    line: 1,
    eventType: EventType.PROGRAM_START,
    explanation: `Selection Sort started with array: [${arr.join(', ')}].`,
    aiHint: 'Selection Sort repeatedly finds the minimum element from the unsorted segment and puts it at the beginning.'
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    addStep({
      line: 3,
      eventType: EventType.VARIABLE_DECLARATION,
      explanation: `Pass ${i + 1}: Assuming initial minimum is at index ${i} (value ${arr[i]}).`,
      aiHint: `Searching remaining unsorted segment [${i}..${n - 1}] for any smaller element.`,
      active: i,
      pointers: { i, minIdx }
    });

    for (let j = i + 1; j < n; j++) {
      const isSmaller = arr[j] < arr[minIdx];
      addStep({
        line: 5,
        eventType: EventType.CONDITION_CHECK,
        explanation: `Comparing arr[${j}] (${arr[j]}) with current min arr[${minIdx}] (${arr[minIdx]}).`,
        aiHint: isSmaller ? `Found smaller element ${arr[j]} at index ${j}!` : `${arr[j]} is not smaller than current min ${arr[minIdx]}.`,
        compared: [minIdx, j],
        active: j,
        pointers: { i, j, minIdx }
      });

      if (isSmaller) {
        minIdx = j;
        addStep({
          line: 6,
          eventType: EventType.ASSIGNMENT,
          explanation: `Updated minIdx = ${minIdx} (new minimum value: ${arr[minIdx]}).`,
          aiHint: `Index ${minIdx} is now recorded as the minimum in the current pass.`,
          active: minIdx,
          pointers: { i, j, minIdx }
        });
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;
      addStep({
        line: 9,
        eventType: EventType.ARRAY_UPDATE,
        explanation: `Swapped minimum element ${arr[i]} into sorted position index ${i}.`,
        aiHint: `Element ${arr[i]} is now locked into its final sorted position.`,
        compared: [i, minIdx],
        swapped: [i, minIdx],
        active: i,
        pointers: { i, minIdx }
      });
    }

    sortedIndices.push(i);
    stdout.push(`Pass ${i + 1}: Element ${arr[i]} placed at index ${i}`);
  }

  sortedIndices.push(n - 1);
  stdout.push(`Array sorted: [${arr.join(', ')}]`);

  addStep({
    line: 12,
    eventType: EventType.PROGRAM_END,
    explanation: `Selection Sort complete. Final sorted array: [${arr.join(', ')}].`,
    aiHint: 'Time Complexity: O(n²) all cases. Space Complexity: O(1) auxiliary.',
    pointers: { i: n - 1 }
  });

  return steps;
}

export function generateInsertionSortTrace(inputArray) {
  const arr = (inputArray && inputArray.length > 0) ? [...inputArray] : [12, 11, 13, 5, 6];
  const n = arr.length;
  const steps = [];
  const stdout = [];
  let stepNum = 1;
  const sortedIndices = [0];

  const addStep = ({ line, eventType, explanation, aiHint, compared = [], swapped = [], active = null, pointers = {} }) => {
    steps.push({
      stepNumber: stepNum++,
      lineNumber: line,
      eventType,
      explanation,
      aiHint,
      variables: { arr: [...arr], n, ...pointers },
      changedVariable: swapped.length > 0 ? 'arr' : (pointers.key !== undefined ? 'key' : null),
      previousValue: null,
      currentValue: [...arr],
      output: [...stdout],
      dataStructureState: {
        type: 'sorting',
        name: 'arr',
        values: [...arr],
        comparedIndices: compared,
        swappedIndices: swapped,
        sortedIndices: [...sortedIndices],
        activeIndex: active,
        pointers
      },
      operation: { type: swapped.length > 0 ? 'UPDATE' : (compared.length > 0 ? 'COMPARE' : 'STEP') }
    });
  };

  addStep({
    line: 1,
    eventType: EventType.PROGRAM_START,
    explanation: `Insertion Sort started with array: [${arr.join(', ')}].`,
    aiHint: 'Insertion Sort builds the final sorted array one item at a time by shifting larger elements right.'
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    addStep({
      line: 3,
      eventType: EventType.VARIABLE_DECLARATION,
      explanation: `Picking key = ${key} at index ${i} to insert into sorted prefix [0..${i - 1}].`,
      aiHint: `Key ${key} will be compared backward against elements in the sorted prefix.`,
      active: i,
      pointers: { i, j, key }
    });

    while (j >= 0 && arr[j] > key) {
      addStep({
        line: 5,
        eventType: EventType.CONDITION_CHECK,
        explanation: `Condition check: arr[${j}] (${arr[j]}) > key (${key}) is TRUE.`,
        aiHint: `Because ${arr[j]} > ${key}, shift ${arr[j]} rightward to index ${j + 1}.`,
        compared: [j, j + 1],
        active: j,
        pointers: { i, j, key }
      });

      arr[j + 1] = arr[j];
      addStep({
        line: 6,
        eventType: EventType.ARRAY_UPDATE,
        explanation: `Shifted arr[${j}] (${arr[j]}) rightward to arr[${j + 1}].`,
        aiHint: `Creating slot for key ${key}.`,
        swapped: [j, j + 1],
        active: j + 1,
        pointers: { i, j, key }
      });

      j--;
    }

    arr[j + 1] = key;
    sortedIndices.push(i);

    addStep({
      line: 9,
      eventType: EventType.ARRAY_UPDATE,
      explanation: `Inserted key ${key} into correct position at index ${j + 1}.`,
      aiHint: `Prefix [0..${i}] is now completely sorted: [${arr.slice(0, i + 1).join(', ')}].`,
      active: j + 1,
      pointers: { i, insertedAt: j + 1, key }
    });

    stdout.push(`Inserted ${key} at index ${j + 1}`);
  }

  stdout.push(`Insertion Sort complete: [${arr.join(', ')}]`);

  addStep({
    line: 12,
    eventType: EventType.PROGRAM_END,
    explanation: `Insertion Sort completed. Final sorted array: [${arr.join(', ')}].`,
    aiHint: 'Time Complexity: O(n²) worst case, O(n) best case (when nearly sorted). Space Complexity: O(1).',
    pointers: { i: n - 1 }
  });

  return steps;
}

export function generateMergeSortTrace(inputArray) {
  const arr = (inputArray && inputArray.length > 0) ? [...inputArray] : [38, 27, 43, 3, 9, 82, 10];
  const steps = [];
  const stdout = [];
  let stepNum = 1;

  const addStep = ({ line, eventType, explanation, aiHint, compared = [], swapped = [], active = null, pointers = {} }) => {
    steps.push({
      stepNumber: stepNum++,
      lineNumber: line,
      eventType,
      explanation,
      aiHint,
      variables: { arr: [...arr], ...pointers },
      changedVariable: swapped.length > 0 ? 'arr' : null,
      previousValue: null,
      currentValue: [...arr],
      output: [...stdout],
      dataStructureState: {
        type: 'sorting',
        name: 'arr',
        values: [...arr],
        comparedIndices: compared,
        swappedIndices: swapped,
        sortedIndices: [],
        activeIndex: active,
        pointers
      },
      operation: { type: swapped.length > 0 ? 'MERGE' : (compared.length > 0 ? 'COMPARE' : 'STEP') }
    });
  };

  addStep({
    line: 1,
    eventType: EventType.PROGRAM_START,
    explanation: `Merge Sort initialized with array: [${arr.join(', ')}].`,
    aiHint: 'Merge Sort is a Divide-and-Conquer algorithm: divide into halves, recursively sort, and merge.'
  });

  function merge(low, mid, high) {
    const leftArr = arr.slice(low, mid + 1);
    const rightArr = arr.slice(mid + 1, high + 1);

    addStep({
      line: 8,
      eventType: EventType.LOOP_START,
      explanation: `Merging sorted subarrays [${low}..${mid}] (${leftArr.join(',')}) and [${mid + 1}..${high}] (${rightArr.join(',')}).`,
      aiHint: `Combining two sorted segments into a single sorted range.`,
      pointers: { low, mid, high }
    });

    let i = 0, j = 0, k = low;
    while (i < leftArr.length && j < rightArr.length) {
      const leftVal = leftArr[i];
      const rightVal = rightArr[j];

      addStep({
        line: 12,
        eventType: EventType.CONDITION_CHECK,
        explanation: `Comparing left element ${leftVal} with right element ${rightVal}.`,
        aiHint: leftVal <= rightVal
          ? `Taking smaller element ${leftVal} from left subarray.`
          : `Taking smaller element ${rightVal} from right subarray.`,
        compared: [low + i, mid + 1 + j],
        active: k,
        pointers: { low, mid, high, k }
      });

      if (leftVal <= rightVal) {
        arr[k] = leftVal;
        i++;
      } else {
        arr[k] = rightVal;
        j++;
      }

      addStep({
        line: 15,
        eventType: EventType.ARRAY_UPDATE,
        explanation: `Placed ${arr[k]} into position [${k}].`,
        aiHint: `Merged position ${k} finalized.`,
        swapped: [k],
        active: k,
        pointers: { low, mid, high, k }
      });

      k++;
    }

    while (i < leftArr.length) {
      arr[k] = leftArr[i];
      addStep({
        line: 18,
        eventType: EventType.ARRAY_UPDATE,
        explanation: `Copying remaining left element ${leftArr[i]} to index ${k}.`,
        swapped: [k],
        active: k,
        pointers: { low, mid, high, k }
      });
      i++;
      k++;
    }

    while (j < rightArr.length) {
      arr[k] = rightArr[j];
      addStep({
        line: 21,
        eventType: EventType.ARRAY_UPDATE,
        explanation: `Copying remaining right element ${rightArr[j]} to index ${k}.`,
        swapped: [k],
        active: k,
        pointers: { low, mid, high, k }
      });
      j++;
      k++;
    }

    stdout.push(`Merged range [${low}..${high}]: [${arr.slice(low, high + 1).join(', ')}]`);
  }

  function mergeSort(low, high) {
    if (low < high) {
      const mid = Math.floor((low + high) / 2);
      addStep({
        line: 4,
        eventType: EventType.LOOP_START,
        explanation: `Dividing range [${low}..${high}] at mid = ${mid}. Left: [${low}..${mid}], Right: [${mid + 1}..${high}].`,
        aiHint: 'Divide step splits the problem in half.',
        pointers: { low, mid, high }
      });

      mergeSort(low, mid);
      mergeSort(mid + 1, high);
      merge(low, mid, high);
    }
  }

  mergeSort(0, arr.length - 1);
  stdout.push(`Merge Sort complete: [${arr.join(', ')}]`);

  addStep({
    line: 25,
    eventType: EventType.PROGRAM_END,
    explanation: `Merge Sort complete. Final sorted array: [${arr.join(', ')}].`,
    aiHint: 'Time Complexity: O(n log n) guaranteed in all cases. Space Complexity: O(n) auxiliary memory.',
    pointers: { low: 0, high: arr.length - 1 }
  });

  return steps;
}

export function generateQuickSortTrace(inputArray) {
  const arr = (inputArray && inputArray.length > 0) ? [...inputArray] : [10, 80, 30, 90, 40, 50, 70];
  const steps = [];
  const stdout = [];
  let stepNum = 1;
  const sortedIndices = [];

  const addStep = ({ line, eventType, explanation, aiHint, compared = [], swapped = [], active = null, pointers = {} }) => {
    steps.push({
      stepNumber: stepNum++,
      lineNumber: line,
      eventType,
      explanation,
      aiHint,
      variables: { arr: [...arr], ...pointers },
      changedVariable: swapped.length > 0 ? 'arr' : null,
      previousValue: null,
      currentValue: [...arr],
      output: [...stdout],
      dataStructureState: {
        type: 'sorting',
        name: 'arr',
        values: [...arr],
        comparedIndices: compared,
        swappedIndices: swapped,
        sortedIndices: [...sortedIndices],
        activeIndex: active,
        pointers
      },
      operation: { type: swapped.length > 0 ? 'SWAP' : (compared.length > 0 ? 'COMPARE' : 'STEP') }
    });
  };

  addStep({
    line: 1,
    eventType: EventType.PROGRAM_START,
    explanation: `Quick Sort initialized with array: [${arr.join(', ')}].`,
    aiHint: 'Quick Sort picks a pivot and partitions the array so smaller elements move left and larger elements move right.'
  });

  function partition(low, high) {
    const pivot = arr[high];
    let i = low - 1;

    addStep({
      line: 5,
      eventType: EventType.VARIABLE_DECLARATION,
      explanation: `Selected pivot = ${pivot} at index ${high}. Partitioning range [${low}..${high}].`,
      aiHint: `Elements smaller than ${pivot} will be placed to the left of the pivot index.`,
      active: high,
      pointers: { low, high, pivot: high, i: low - 1 }
    });

    for (let j = low; j < high; j++) {
      const isSmaller = arr[j] < pivot;
      addStep({
        line: 8,
        eventType: EventType.CONDITION_CHECK,
        explanation: `Comparing arr[${j}] (${arr[j]}) < pivot (${pivot}).`,
        aiHint: isSmaller ? `${arr[j]} < ${pivot}: increment boundary i and swap.` : `${arr[j]} >= ${pivot}: stays on right side.`,
        compared: [j, high],
        active: j,
        pointers: { low, high, pivot: high, i, j }
      });

      if (isSmaller) {
        i++;
        const temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;

        addStep({
          line: 10,
          eventType: EventType.ARRAY_UPDATE,
          explanation: `Swapped arr[${i}] and arr[${j}]. Smaller element ${arr[i]} placed in left partition.`,
          swapped: [i, j],
          active: i,
          pointers: { low, high, pivot: high, i, j }
        });
      }
    }

    // Place pivot in correct spot
    const temp = arr[i + 1];
    arr[i + 1] = arr[high];
    arr[high] = temp;
    const pivotIndex = i + 1;
    sortedIndices.push(pivotIndex);

    addStep({
      line: 14,
      eventType: EventType.ARRAY_UPDATE,
      explanation: `Placed pivot ${arr[pivotIndex]} into its final sorted position at index ${pivotIndex}.`,
      aiHint: `All elements before index ${pivotIndex} are <= ${arr[pivotIndex]}, and all elements after are >= ${arr[pivotIndex]}.`,
      swapped: [pivotIndex, high],
      active: pivotIndex,
      pointers: { low, high, pivot: pivotIndex }
    });

    stdout.push(`Pivot ${arr[pivotIndex]} locked at index ${pivotIndex}`);
    return pivotIndex;
  }

  function quickSort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      quickSort(low, pi - 1);
      quickSort(pi + 1, high);
    } else if (low === high) {
      sortedIndices.push(low);
    }
  }

  quickSort(0, arr.length - 1);
  stdout.push(`Quick Sort complete: [${arr.join(', ')}]`);

  addStep({
    line: 20,
    eventType: EventType.PROGRAM_END,
    explanation: `Quick Sort completed. Final sorted array: [${arr.join(', ')}].`,
    aiHint: 'Time Complexity: O(n log n) average case, O(n²) worst case. Space Complexity: O(log n) call stack.',
    pointers: { low: 0, high: arr.length - 1 }
  });

  return steps;
}

export function generateLinearSearchTrace(inputArray, targetVal = 23) {
  const arr = (inputArray && inputArray.length > 0) ? [...inputArray] : [10, 50, 30, 70, 80, 23, 90];
  const target = targetVal !== undefined && targetVal !== null ? Number(targetVal) : 23;
  const n = arr.length;
  const steps = [];
  const stdout = [];
  let stepNum = 1;

  const addStep = ({ line, eventType, explanation, aiHint, active = null, pointers = {}, found = false }) => {
    steps.push({
      stepNumber: stepNum++,
      lineNumber: line,
      eventType,
      explanation,
      aiHint,
      variables: { arr: [...arr], target, n, ...pointers },
      changedVariable: pointers.i !== undefined ? 'i' : null,
      previousValue: null,
      currentValue: active !== null ? arr[active] : null,
      condition: active !== null ? {
        expression: `arr[i] == target`,
        evaluation: `${arr[active]} == ${target}`,
        result: arr[active] === target,
        branch: arr[active] === target ? 'TARGET MATCH' : 'CONTINUE SEARCH'
      } : null,
      output: [...stdout],
      dataStructureState: {
        type: 'searching',
        name: 'arr',
        values: [...arr],
        activeIndex: active,
        targetFound: found,
        pointers
      },
      operation: { type: found ? 'FOUND' : 'COMPARE', target, index: active }
    });
  };

  addStep({
    line: 1,
    eventType: EventType.PROGRAM_START,
    explanation: `Linear Search started for target ${target} across ${n} elements.`,
    aiHint: 'Linear Search sequentially checks each element of the list until a match is found or the list ends.'
  });

  let foundIndex = -1;
  for (let i = 0; i < n; i++) {
    const isMatch = arr[i] === target;
    addStep({
      line: 4,
      eventType: EventType.CONDITION_CHECK,
      explanation: `Checking element at index [${i}] (${arr[i]}) == target (${target}).`,
      aiHint: isMatch ? `Target ${target} located at index ${i}!` : `${arr[i]} != ${target}. Advancing to next index.`,
      active: i,
      pointers: { i, target },
      found: isMatch
    });

    if (isMatch) {
      foundIndex = i;
      stdout.push(`Target ${target} found at index ${i}!`);
      break;
    }
  }

  if (foundIndex === -1) {
    stdout.push(`Target ${target} not found in array.`);
    addStep({
      line: 8,
      eventType: EventType.PROGRAM_END,
      explanation: `Linear Search ended: Target ${target} was not found in the array.`,
      aiHint: 'Time Complexity: O(n). All elements checked without finding target.',
      pointers: { target }
    });
  } else {
    addStep({
      line: 7,
      eventType: EventType.PROGRAM_END,
      explanation: `Linear Search successful: Target ${target} found at index ${foundIndex}.`,
      aiHint: `Search terminated early at step ${foundIndex + 1} with O(1) best case up to O(n) worst case.`,
      active: foundIndex,
      pointers: { target, resultIndex: foundIndex },
      found: true
    });
  }

  return steps;
}

export function generateBinarySearchTrace(inputArray, targetVal = 42) {
  const arr = (inputArray && inputArray.length > 0)
    ? [...inputArray].sort((a, b) => a - b)
    : [11, 22, 33, 42, 55, 66, 77, 88, 99];
  const target = targetVal !== undefined && targetVal !== null ? Number(targetVal) : 42;
  const n = arr.length;
  const steps = [];
  const stdout = [];
  let stepNum = 1;

  const addStep = ({ line, eventType, explanation, aiHint, active = null, pointers = {}, found = false }) => {
    steps.push({
      stepNumber: stepNum++,
      lineNumber: line,
      eventType,
      explanation,
      aiHint,
      variables: { arr: [...arr], target, n, ...pointers },
      changedVariable: pointers.mid !== undefined ? 'mid' : null,
      previousValue: null,
      currentValue: active !== null ? arr[active] : null,
      output: [...stdout],
      dataStructureState: {
        type: 'searching',
        name: 'arr',
        values: [...arr],
        activeIndex: active,
        targetFound: found,
        pointers,
        window: { start: pointers.low, end: pointers.high }
      },
      operation: { type: found ? 'FOUND' : 'COMPARE', target, index: active }
    });
  };

  addStep({
    line: 1,
    eventType: EventType.PROGRAM_START,
    explanation: `Binary Search initialized for target ${target} on sorted array: [${arr.join(', ')}].`,
    aiHint: 'Binary Search requires a sorted array and halves the search space at every step.'
  });

  let low = 0;
  let high = n - 1;
  let foundIndex = -1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = arr[mid];

    addStep({
      line: 4,
      eventType: EventType.LOOP_START,
      explanation: `Active search range [${low}..${high}]. Calculated midpoint index mid = ${mid} (value ${midVal}).`,
      aiHint: `Midpoint formula: mid = low + (high - low) / 2 = ${low} + (${high} - ${low}) / 2 = ${mid}.`,
      active: mid,
      pointers: { low, mid, high, target }
    });

    if (midVal === target) {
      foundIndex = mid;
      stdout.push(`Target ${target} found at index ${mid}!`);
      addStep({
        line: 6,
        eventType: EventType.CONDITION_CHECK,
        explanation: `Condition check: arr[mid] (${midVal}) == target (${target}) is TRUE!`,
        aiHint: `Target ${target} located in ${steps.length} checks!`,
        active: mid,
        pointers: { low, mid, high, target },
        found: true
      });
      break;
    } else if (midVal < target) {
      addStep({
        line: 9,
        eventType: EventType.CONDITION_CHECK,
        explanation: `arr[mid] (${midVal}) < target (${target}) is TRUE. Eliminating left half [${low}..${mid}].`,
        aiHint: `Because array is sorted and ${midVal} < ${target}, target must lie in right half [${mid + 1}..${high}].`,
        active: mid,
        pointers: { low, mid, high, target }
      });
      low = mid + 1;
    } else {
      addStep({
        line: 12,
        eventType: EventType.CONDITION_CHECK,
        explanation: `arr[mid] (${midVal}) > target (${target}) is TRUE. Eliminating right half [${mid}..${high}].`,
        aiHint: `Because array is sorted and ${midVal} > ${target}, target must lie in left half [${low}..${mid - 1}].`,
        active: mid,
        pointers: { low, mid, high, target }
      });
      high = mid - 1;
    }
  }

  if (foundIndex === -1) {
    stdout.push(`Target ${target} not found in array.`);
    addStep({
      line: 16,
      eventType: EventType.PROGRAM_END,
      explanation: `Binary Search completed: Target ${target} not found. low (${low}) > high (${high}).`,
      aiHint: 'Time Complexity: O(log n). Maximum steps required: ceil(log2(n)).',
      pointers: { low, high, target }
    });
  } else {
    addStep({
      line: 15,
      eventType: EventType.PROGRAM_END,
      explanation: `Binary Search successful: Target ${target} confirmed at index ${foundIndex}.`,
      aiHint: 'Time Complexity: O(log n) worst case, O(1) best case.',
      active: foundIndex,
      pointers: { target, resultIndex: foundIndex },
      found: true
    });
  }

  return steps;
}
