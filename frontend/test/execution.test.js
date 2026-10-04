import assert from 'node:assert';
import test from 'node:test';

import { validateSourceCode } from '../src/services/codeValidator.js';
import { TraceBuilder } from '../src/execution/TraceBuilder.js';
import { validateExecutionStep, validateTrace } from '../src/execution/TraceValidator.js';
import { detectDataStructure, detectAlgorithm } from '../src/dsa/index.js';
import { getExecutionTrace } from '../src/services/executionSimulator.js';
import { DsaStructureType, DsaAlgorithmType } from '../src/dsa/models/types.js';

test('Frontend Execution & Validation Suite', async (t) => {
  await t.test('1. Syntax Validation: Delimiter & Structural Balance', () => {
    // Valid Java code
    const validJava = 'int[] arr = {1, 2, 3};\nint sum = 0;\nfor (int i = 0; i < arr.length; i++) {\n  sum += arr[i];\n}';
    assert.strictEqual(validateSourceCode(validJava, 'java').isValid, true);

    // Mismatched bracket
    const mismatchedBracket = 'int[] arr = [1, 2, 3};';
    const resMismatched = validateSourceCode(mismatchedBracket, 'java');
    assert.strictEqual(resMismatched.isValid, false);
    assert.ok(resMismatched.error.message.includes('Mismatched') || resMismatched.error.message.includes('closing'));

    // Unterminated quote
    const unclosedString = 'String s = "unclosed;\nint x = 10;';
    const resQuote = validateSourceCode(unclosedString, 'java');
    assert.strictEqual(resQuote.isValid, false);

    // Python missing colon
    const pythonNoColon = 'def solve()\n  return 42';
    const resPy = validateSourceCode(pythonNoColon, 'python');
    assert.strictEqual(resPy.isValid, false);
    assert.ok(resPy.error.message.includes("':'"));

    // Empty code
    const emptyRes = validateSourceCode('', 'java');
    assert.strictEqual(emptyRes.isValid, false);
    assert.ok(emptyRes.error.message.includes('empty'));
  });

  await t.test('2. TraceBuilder: Normalization & Sequencing', () => {
    const builder = new TraceBuilder('javascript');
    builder.addStep({
      lineNumber: 1,
      eventType: 'PROGRAM_START',
      variables: {},
      output: [],
    });
    builder.addStep({
      lineNumber: 2,
      eventType: 'VARIABLE_DECLARATION',
      variables: { arr: [10, 20, 30] },
      dataStructureState: { type: 'array', values: [10, 20, 30] },
      output: [],
    });
    builder.addStep({
      lineNumber: 3,
      eventType: 'PROGRAM_END',
      variables: { arr: [10, 20, 30] },
      output: ['Done'],
    });

    const steps = builder.getSteps();
    assert.strictEqual(steps.length, 3);
    assert.strictEqual(steps[0].stepNumber, 1);
    assert.strictEqual(steps[1].stepNumber, 2);
    assert.strictEqual(steps[2].stepNumber, 3);
    assert.strictEqual(steps[1].eventType, 'VARIABLE_DECLARATION');
  });

  await t.test('3. TraceValidator: Schema Validation', () => {
    const validStep = {
      stepId: 'step-1',
      stepNumber: 1,
      lineNumber: 10,
      eventType: 'ARRAY_ACCESS',
      variables: { i: 2 },
      callStack: [],
      dataStructures: [],
    };
    const validRes = validateExecutionStep(validStep, 0);
    assert.strictEqual(validRes.valid, true);

    const invalidStep = {
      // Missing stepNumber and lineNumber
      eventType: 'ARRAY_ACCESS',
    };
    const invalidRes = validateExecutionStep(invalidStep, 0);
    assert.strictEqual(invalidRes.valid, false);
    assert.ok(invalidRes.error);
  });

  await t.test('4. DSA Detector: Structure Inference', () => {
    // Array
    const arrayDsa = detectDataStructure({ arr: [1, 2, 3] }, 'int[] arr = {1,2,3};');
    assert.strictEqual(arrayDsa, DsaStructureType.ARRAY);

    // Matrix
    const matrixDsa = detectDataStructure({ matrix: [[1, 2], [3, 4]] }, 'int[][] matrix = {{1,2},{3,4}};');
    assert.strictEqual(matrixDsa, DsaStructureType.MATRIX);

    // Linked List
    const llDsa = detectDataStructure({ head: { val: 1, next: null } }, 'ListNode head = new ListNode(1);');
    assert.strictEqual(llDsa, DsaStructureType.LINKED_LIST);

    // Tree
    const treeDsa = detectDataStructure({ root: { val: 10, left: null, right: null } }, 'TreeNode root = new TreeNode(10);');
    assert.strictEqual(treeDsa, DsaStructureType.BINARY_TREE);

    // Stack
    const stackDsa = detectDataStructure({}, 'Stack<Integer> stack = new Stack<>();');
    assert.strictEqual(stackDsa, DsaStructureType.STACK);

    // Queue
    const queueDsa = detectDataStructure({}, 'Queue<Integer> q = new LinkedList<>();');
    assert.strictEqual(queueDsa, DsaStructureType.QUEUE);
  });

  await t.test('5. Algorithm Detector: Pattern Recognition', () => {
    // Binary Search
    const bsCode = 'int low = 0, high = n - 1;\nwhile (low <= high) {\n  int mid = (low + high) / 2;\n}';
    const detectedBs = detectAlgorithm(bsCode, []);
    assert.strictEqual(detectedBs, DsaAlgorithmType.BINARY_SEARCH);

    // Bubble Sort
    const sortCode = 'void bubbleSort(int[] arr) {\n  for(int i=0; i<n; i++) {\n    for(int j=0; j<n-i-1; j++) {\n      if(arr[j] > arr[j+1]) swap(arr[j], arr[j+1]);\n    }\n  }\n}';
    const detectedSort = detectAlgorithm(sortCode, []);
    assert.strictEqual(detectedSort, DsaAlgorithmType.BUBBLE_SORT);

    // Two Pointers
    const twoPtrCode = 'int left = 0, right = n - 1;\nwhile (left < right) {\n  left++; right--;\n}';
    const detectedTwoPtr = detectAlgorithm(twoPtrCode, []);
    assert.strictEqual(detectedTwoPtr, DsaAlgorithmType.TWO_POINTERS);
  });

  await t.test('6. Data Structure Models: Schema & Enums', () => {
    assert.ok(DsaStructureType.ARRAY);
    assert.ok(DsaStructureType.LINKED_LIST);
    assert.ok(DsaStructureType.STACK);
    assert.ok(DsaStructureType.QUEUE);
    assert.ok(DsaStructureType.BINARY_TREE);
    assert.ok(DsaStructureType.GRAPH);
    assert.ok(DsaStructureType.MATRIX);
    assert.ok(DsaAlgorithmType.BINARY_SEARCH);
    assert.ok(DsaAlgorithmType.BUBBLE_SORT);
  });

  await t.test('7. Edge Cases Simulation: Arrays', () => {
    // Single element array
    const singleTrace = getExecutionTrace('int[] arr = {42};', 'java');
    assert.ok(singleTrace && singleTrace.length > 0);

    // Negative numbers and duplicates
    const negTrace = getExecutionTrace('int[] arr = {-10, 0, 10, -10};', 'java');
    assert.ok(negTrace && negTrace.length > 0);
  });
});
