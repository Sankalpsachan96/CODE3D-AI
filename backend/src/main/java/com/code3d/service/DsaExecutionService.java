package com.code3d.service;

import com.code3d.model.*;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.expr.ArrayInitializerExpr;
import com.github.javaparser.ast.expr.IntegerLiteralExpr;
import org.springframework.stereotype.Service;

import com.code3d.engine.JavaAstExecutionEngine;
import java.util.*;

@Service
public class DsaExecutionService {

    private final MultiLanguageExecutionService multiLanguageExecutionService;
    private final JavaAstExecutionEngine javaAstExecutionEngine;

    public DsaExecutionService(MultiLanguageExecutionService multiLanguageExecutionService,
                               JavaAstExecutionEngine javaAstExecutionEngine) {
        this.multiLanguageExecutionService = multiLanguageExecutionService;
        this.javaAstExecutionEngine = javaAstExecutionEngine;
    }

    public ExecuteResponse execute(ExecuteRequest request) {
        String conceptId = request.getConceptId();
        String code = request.getCode();
        String language = request.getLanguage();

        // 1. If code is provided by user (custom or edited preset), execute dynamically
        if (code != null && !code.isBlank()) {
            if (language == null || "java".equalsIgnoreCase(language)) {
                ExecuteResponse javaResp = javaAstExecutionEngine.execute(code);
                if (javaResp != null && "SUCCESS".equalsIgnoreCase(javaResp.getStatus())) {
                    return javaResp;
                }
            }
            return multiLanguageExecutionService.executeUserCode(request);
        }

        // 2. If a specific built-in DSA concept is selected without custom code
        if (conceptId != null && !conceptId.isBlank() && !"custom".equalsIgnoreCase(conceptId)) {
            return generateConceptTrace(conceptId);
        }

        // Default to array loop
        return generateConceptTrace("array-loop");
    }

    private ExecuteResponse generateConceptTrace(String conceptId) {
        return switch (conceptId.toLowerCase()) {
            case "2d-array", "matrix" -> generateMatrixTrace();
            case "two-pointer-reverse" -> generateTwoPointerReverseTrace();
            case "sliding-window" -> generateSlidingWindowTrace();
            case "linked-list" -> generateLinkedListTrace();
            case "doubly-linked-list", "doubly-ll" -> generateDoublyLinkedListTrace();
            case "circular-linked-list" -> generateCircularLinkedListTrace();
            case "cycle-detection" -> generateCycleDetectionTrace();
            case "stack" -> generateStackTrace();
            case "parentheses-stack", "stack-parentheses", "balanced-parentheses" -> generateParenthesesTrace();
            case "queue" -> generateQueueTrace();
            case "circular-queue" -> generateCircularQueueTrace();
            case "deque" -> generateDequeTrace();
            case "bst", "tree" -> generateBstTrace();
            case "tree-traversals", "tree-traversal" -> generateTreeTraversalsTrace();
            case "avl-tree", "avl" -> generateAvlTreeTrace();
            case "trie" -> generateTrieTrace();
            case "bubble-sort", "sorting" -> generateBubbleSortTrace();
            case "insertion-sort" -> generateInsertionSortTrace();
            case "merge-sort" -> generateMergeSortTrace();
            case "quick-sort" -> generateQuickSortTrace();
            case "binary-search", "searching" -> generateBinarySearchTrace();
            case "hash-table", "hashing" -> generateHashTableTrace();
            case "graph-bfs", "graph", "graphs" -> generateGraphBfsTrace();
            case "graph-dfs" -> generateGraphDfsTrace();
            case "dijkstra" -> generateDijkstraTrace();
            case "recursion", "factorial" -> generateRecursionTrace();
            case "fibonacci-memo" -> generateFibonacciMemoTrace();
            case "dp-knapsack", "knapsack", "dp" -> generateDpKnapsackTrace();
            case "lcs" -> generateLcsTrace();
            case "heap-priority-queue", "heap", "priority-queue", "min-heap", "max-heap" -> multiLanguageExecutionService.executeUserCode(new ExecuteRequest("heap", "java", "PriorityQueue<Integer> minHeap = new PriorityQueue<>(); int[] arr = {10, 15, 20, 17, 25, 30}; minHeap.add(8);"));
            case "container-most-water", "most-water", "container-water" -> multiLanguageExecutionService.executeUserCode(new ExecuteRequest("container-most-water", "java", "int[] height = {1, 8, 6, 2, 5, 4, 8, 3, 7}; int left = 0, right = 8; maxArea = 0;"));
            case "monotonic-stack", "next-greater" -> multiLanguageExecutionService.executeUserCode(new ExecuteRequest("monotonic-stack", "java", "int[] arr = {4, 5, 2, 25, 7, 8}; Stack<Integer> stack = new Stack<>();"));
            case "coin-change-dp", "coin-change" -> multiLanguageExecutionService.executeUserCode(new ExecuteRequest("coin-change-dp", "java", "int[] coins = {1, 2, 5}; int amount = 7; int[] dp = new int[8];"));
            case "topological-sort-dag", "topological-sort", "toposort" -> multiLanguageExecutionService.executeUserCode(new ExecuteRequest("topological-sort-dag", "java", "int[] inDegree = {0, 1, 1, 2, 1}; Queue<Integer> queue = new LinkedList<>();"));
            default -> generateArrayLoopTrace(List.of(10, 20, 30, 40));
        };
    }

    private ExecuteResponse generateDynamicCodeTrace(String javaCode) {
        List<Integer> customValues = new ArrayList<>();
        try {
            CompilationUnit cu = StaticJavaParser.parse(javaCode);
            List<ArrayInitializerExpr> inits = cu.findAll(ArrayInitializerExpr.class);
            if (!inits.isEmpty()) {
                ArrayInitializerExpr firstInit = inits.get(0);
                for (var expr : firstInit.getValues()) {
                    if (expr instanceof IntegerLiteralExpr ile) {
                        customValues.add(ile.asNumber().intValue());
                    }
                }
            }
        } catch (Exception ignored) {}

        if (customValues.isEmpty()) {
            customValues = List.of(10, 20, 30, 40);
        }

        return generateArrayLoopTrace(customValues);
    }

    // ==========================================
    // 1. 1D Array Loop Traversal (Dynamic Values)
    // ==========================================
    public ExecuteResponse generateArrayLoopTrace(List<Integer> values) {
        List<ExecutionStep> steps = new ArrayList<>();
        List<String> output = new ArrayList<>();
        int n = values.size();
        int step = 1;

        // Step 1: Array Allocation
        ExecutionStep s1 = new ExecutionStep();
        s1.setStepNumber(step++);
        s1.setLineNumber(4);
        s1.setEventType("ARRAY_CREATION");
        s1.setVariables(Map.of("arr", values.toString()));
        s1.setChangedVariable("arr");
        s1.setCurrentValue(values.toString());
        s1.setOutput(new ArrayList<>(output));
        s1.setDataStructureState(createArrayState(values, null, "Array Initialized", "Memory allocated for " + n + " elements."));
        s1.setExplanation("Memory allocated for integer array 'arr' of size " + n + ": " + values);
        s1.setAiHint("Arrays in Java occupy contiguous memory blocks with 0-based indices.");
        steps.add(s1);

        // Step 2: Loop Init
        ExecutionStep s2 = new ExecutionStep();
        s2.setStepNumber(step++);
        s2.setLineNumber(6);
        s2.setEventType("LOOP_INIT");
        s2.setVariables(Map.of("arr", values.toString(), "i", 0));
        s2.setChangedVariable("i");
        s2.setCurrentValue(0);
        s2.setOutput(new ArrayList<>(output));
        s2.setDataStructureState(createArrayState(values, null, "Loop Initialized", "i = 0"));
        s2.setExplanation("Loop initialized: Counter 'i' is declared and initialized to 0.");
        s2.setAiHint("Variable i starts at index 0.");
        steps.add(s2);

        // Loop iterations
        for (int i = 0; i < n; i++) {
            // Condition Check (True)
            ExecutionStep sCond = new ExecutionStep();
            sCond.setStepNumber(step++);
            sCond.setLineNumber(6);
            sCond.setEventType("CONDITION_CHECK");
            sCond.setVariables(Map.of("arr", values.toString(), "i", i));
            sCond.setCondition(new ConditionInfo("i < arr.length", i + " < " + n, true, "ENTER LOOP BODY"));
            sCond.setOutput(new ArrayList<>(output));
            sCond.setDataStructureState(createArrayState(values, i, "Condition True (" + i + " < " + n + ")", "Accessing index " + i));
            sCond.setExplanation("Condition 'i < arr.length' (" + i + " < " + n + ") is TRUE. Executing loop body.");
            sCond.setAiHint("i is within bounds [0.." + (n - 1) + "].");
            steps.add(sCond);

            // Array Access & Print
            int val = values.get(i);
            output.add(String.valueOf(val));
            ExecutionStep sAccess = new ExecutionStep();
            sAccess.setStepNumber(step++);
            sAccess.setLineNumber(7);
            sAccess.setEventType("ARRAY_ACCESS");
            sAccess.setVariables(Map.of("arr", values.toString(), "i", i, "arr[i]", val));
            sAccess.setChangedVariable("output");
            sAccess.setCurrentValue(String.valueOf(val));
            sAccess.setOutput(new ArrayList<>(output));
            sAccess.setDataStructureState(createArrayState(values, i, "Reading arr[" + i + "] = " + val, "Current Index: " + i + " | Value: " + val));
            sAccess.setExplanation("Read element arr[" + i + "] = " + val + ". System.out.println() prints " + val + " to console.");
            sAccess.setAiHint("Array index access is an O(1) constant time memory offset operation.");
            steps.add(sAccess);

            // Loop Increment
            int nextI = i + 1;
            ExecutionStep sInc = new ExecutionStep();
            sInc.setStepNumber(step++);
            sInc.setLineNumber(6);
            sInc.setEventType("LOOP_INCREMENT");
            sInc.setVariables(Map.of("arr", values.toString(), "i", nextI));
            sInc.setChangedVariable("i");
            sInc.setPreviousValue(i);
            sInc.setCurrentValue(nextI);
            sInc.setOutput(new ArrayList<>(output));
            sInc.setDataStructureState(createArrayState(values, null, "Increment (i: " + i + " → " + nextI + ")", "i = " + nextI));
            sInc.setExplanation("Increment step 'i++' executed: Loop counter 'i' advances from " + i + " to " + nextI + ".");
            sInc.setAiHint("Next condition check will evaluate with i = " + nextI + ".");
            steps.add(sInc);
        }

        // Final Condition Check (False)
        ExecutionStep sFinalCond = new ExecutionStep();
        sFinalCond.setStepNumber(step++);
        sFinalCond.setLineNumber(6);
        sFinalCond.setEventType("CONDITION_CHECK");
        sFinalCond.setVariables(Map.of("arr", values.toString(), "i", n));
        sFinalCond.setCondition(new ConditionInfo("i < arr.length", n + " < " + n, false, "EXIT LOOP"));
        sFinalCond.setOutput(new ArrayList<>(output));
        sFinalCond.setDataStructureState(createArrayState(values, null, "Condition False (" + n + " < " + n + ")", "Loop Terminated"));
        sFinalCond.setExplanation("Condition 'i < arr.length' (" + n + " < " + n + ") is FALSE. Loop finishes.");
        sFinalCond.setAiHint("Condition failed because " + n + " is not strictly less than " + n + ".");
        steps.add(sFinalCond);

        // Program End
        ExecutionStep sEnd = new ExecutionStep();
        sEnd.setStepNumber(step);
        sEnd.setLineNumber(9);
        sEnd.setEventType("PROGRAM_END");
        sEnd.setVariables(Map.of("arr", values.toString(), "i", n));
        sEnd.setOutput(new ArrayList<>(output));
        sEnd.setDataStructureState(createArrayState(values, null, "Execution Finished", "Return code 0"));
        sEnd.setExplanation("Main method execution completed successfully. Exit code 0.");
        sEnd.setAiHint("Array traversal completed in O(n) time and O(1) auxiliary space.");
        steps.add(sEnd);

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private DataStructureState createArrayState(List<Integer> values, Integer activeIndex, String label, String focus) {
        DataStructureState state = new DataStructureState();
        state.setType("array");
        state.setName("arr");
        state.setValues(new ArrayList<>(values));
        state.setActiveIndex(activeIndex);
        state.setLabel(label);
        state.setFocusInfo(focus);
        return state;
    }

    // ==========================================
    // 2. 2D Array / Matrix Traversal
    // ==========================================
    private ExecuteResponse generateMatrixTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<List<Object>> matrix = List.of(
                List.of(1, 2, 3),
                List.of(4, 5, 6),
                List.of(7, 8, 9)
        );
        List<String> output = new ArrayList<>();
        int step = 1;

        for (int r = 0; r < matrix.size(); r++) {
            for (int c = 0; c < matrix.get(r).size(); c++) {
                int val = (int) matrix.get(r).get(c);
                output.add(String.valueOf(val));

                ExecutionStep s = new ExecutionStep();
                s.setStepNumber(step++);
                s.setLineNumber(7);
                s.setEventType("MATRIX_ACCESS");
                s.setVariables(Map.of("row", r, "col", c, "matrix[r][c]", val));
                s.setChangedVariable("matrix[r][c]");
                s.setCurrentValue(val);
                s.setOutput(new ArrayList<>(output));

                DataStructureState ds = new DataStructureState();
                ds.setType("matrix");
                ds.setMatrix(matrix);
                ds.setPointers(Map.of("activeRow", r, "activeCol", c));
                ds.setLabel("Accessing Matrix[" + r + "][" + c + "] = " + val);
                ds.setFocusInfo("Row: " + r + " | Col: " + c + " | Value: " + val);
                s.setDataStructureState(ds);

                s.setExplanation("Row-major scan: Visiting cell (" + r + ", " + c + ") holding value " + val + ".");
                s.setAiHint("Row index moves slower; column index traverses each row completely.");
                steps.add(s);
            }
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 3. Singly Linked List Traversal & Pointers
    // ==========================================
    private ExecuteResponse generateLinkedListTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Map<String, Object>> nodes = List.of(
                Map.of("id", 0, "value", 10, "nextId", 1),
                Map.of("id", 1, "value", 20, "nextId", 2),
                Map.of("id", 2, "value", 30, "nextId", 3),
                Map.of("id", 3, "value", 40, "nextId", -1)
        );
        List<String> output = new ArrayList<>();
        int step = 1;

        for (int i = 0; i < nodes.size(); i++) {
            Map<String, Object> node = nodes.get(i);
            int val = (int) node.get("value");
            output.add(String.valueOf(val));

            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(step++);
            s.setLineNumber(6);
            s.setEventType("LINKED_LIST_TRAVERSAL");
            s.setVariables(Map.of("current.val", val, "current.next", node.get("nextId")));
            s.setOutput(new ArrayList<>(output));

            DataStructureState ds = new DataStructureState();
            ds.setType("linkedlist");
            ds.setNodes(nodes);
            ds.setActiveIndex(i);
            ds.setPointers(Map.of("curr", i, "next", node.get("nextId")));
            ds.setLabel("Visiting Node " + val);
            ds.setFocusInfo("curr: Node(" + val + ") -> next: " + (i < nodes.size() - 1 ? "Node(" + nodes.get(i + 1).get("value") + ")" : "NULL"));
            s.setDataStructureState(ds);

            s.setExplanation("Pointer 'curr' references Node(" + val + "). Following pointer 'curr = curr.next'.");
            s.setAiHint("Linked lists use non-contiguous memory connected via object references.");
            steps.add(s);
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 4. Stack Operations (Push, Pop, Peek)
    // ==========================================
    private ExecuteResponse generateStackTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Object> stack = new ArrayList<>();
        int step = 1;

        // Push 10
        stack.add(10);
        steps.add(createStackStep(step++, "PUSH", stack, 0, 10, "Stack.push(10) adds 10 to top of stack."));

        // Push 20
        stack.add(20);
        steps.add(createStackStep(step++, "PUSH", stack, 1, 20, "Stack.push(20) adds 20 to top of stack."));

        // Push 30
        stack.add(30);
        steps.add(createStackStep(step++, "PUSH", stack, 2, 30, "Stack.push(30) adds 30. Top is now index 2."));

        // Peek
        steps.add(createStackStep(step++, "PEEK", stack, 2, 30, "Stack.peek() inspects top element (30) without removing."));

        // Pop 30
        stack.remove(2);
        steps.add(createStackStep(step++, "POP", stack, 1, 30, "Stack.pop() removes and returns top element (30). Top is now 20."));

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private ExecutionStep createStackStep(int stepNum, String op, List<Object> stack, int topIndex, int val, String exp) {
        ExecutionStep s = new ExecutionStep();
        s.setStepNumber(stepNum);
        s.setLineNumber(5);
        s.setEventType("STACK_" + op);
        s.setVariables(Map.of("operation", op, "topValue", val, "size", stack.size()));

        DataStructureState ds = new DataStructureState();
        ds.setType("stack");
        ds.setValues(new ArrayList<>(stack));
        ds.setActiveIndex(topIndex);
        ds.setPointers(Map.of("TOP", topIndex, "operation", op));
        ds.setLabel("Stack " + op + ": " + val);
        ds.setFocusInfo("TOP -> [" + val + "] | Total Elements: " + stack.size());
        s.setDataStructureState(ds);

        s.setExplanation(exp);
        s.setAiHint("Stack adheres to LIFO: Last-In, First-Out semantics.");
        return s;
    }

    // ==========================================
    // 5. Queue Operations (Enqueue, Dequeue)
    // ==========================================
    private ExecuteResponse generateQueueTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Object> queue = new ArrayList<>();
        int step = 1;

        // Enqueue 10
        queue.add(10);
        steps.add(createQueueStep(step++, "ENQUEUE", queue, 0, 0, 10, "Queue.enqueue(10) inserts element at REAR."));

        // Enqueue 20
        queue.add(20);
        steps.add(createQueueStep(step++, "ENQUEUE", queue, 0, 1, 20, "Queue.enqueue(20) inserts 20 at REAR. FRONT remains 10."));

        // Enqueue 30
        queue.add(30);
        steps.add(createQueueStep(step++, "ENQUEUE", queue, 0, 2, 30, "Queue.enqueue(30) inserts 30 at REAR."));

        // Dequeue 10
        int removed = (int) queue.remove(0);
        steps.add(createQueueStep(step++, "DEQUEUE", queue, 0, queue.size() - 1, removed, "Queue.dequeue() removes FRONT element (" + removed + "). New FRONT is 20."));

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private ExecutionStep createQueueStep(int stepNum, String op, List<Object> queue, int front, int rear, int val, String exp) {
        ExecutionStep s = new ExecutionStep();
        s.setStepNumber(stepNum);
        s.setLineNumber(6);
        s.setEventType("QUEUE_" + op);
        s.setVariables(Map.of("operation", op, "val", val, "front", front, "rear", rear));

        DataStructureState ds = new DataStructureState();
        ds.setType("queue");
        ds.setValues(new ArrayList<>(queue));
        ds.setPointers(Map.of("FRONT", front, "REAR", rear, "operation", op));
        ds.setLabel("Queue " + op + ": " + val);
        ds.setFocusInfo("FRONT: [" + (queue.isEmpty() ? "None" : queue.get(0)) + "] ← ... ← REAR: [" + (queue.isEmpty() ? "None" : queue.get(queue.size() - 1)) + "]");
        s.setDataStructureState(ds);

        s.setExplanation(exp);
        s.setAiHint("Queue follows FIFO: First-In, First-Out semantics.");
        return s;
    }

    // ==========================================
    // 6. Binary Search Tree (BST)
    // ==========================================
    private ExecuteResponse generateBstTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Map<String, Object>> treeNodes = List.of(
                Map.of("id", 0, "val", 50, "left", 1, "right", 2),
                Map.of("id", 1, "val", 30, "left", 3, "right", 4),
                Map.of("id", 2, "val", 70, "left", 5, "right", 6),
                Map.of("id", 3, "val", 20, "left", -1, "right", -1),
                Map.of("id", 4, "val", 40, "left", -1, "right", -1),
                Map.of("id", 5, "val", 60, "left", -1, "right", -1),
                Map.of("id", 6, "val", 80, "left", -1, "right", -1)
        );

        int target = 40;
        int step = 1;

        // Search root (50)
        steps.add(createBstStep(step++, 0, 50, target, "Comparing target 40 with root 50. Since 40 < 50, branch to LEFT subtree."));

        // Search node (30)
        steps.add(createBstStep(step++, 1, 30, target, "Comparing target 40 with node 30. Since 40 > 30, branch to RIGHT child."));

        // Search node (40)
        steps.add(createBstStep(step++, 4, 40, target, "Comparing target 40 with node 40. MATCH FOUND! Target located in O(log n) time."));

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private ExecutionStep createBstStep(int stepNum, int activeNodeId, int val, int target, String exp) {
        ExecutionStep s = new ExecutionStep();
        s.setStepNumber(stepNum);
        s.setLineNumber(8);
        s.setEventType("BST_SEARCH");
        s.setVariables(Map.of("target", target, "currentNode", val));

        DataStructureState ds = new DataStructureState();
        ds.setType("tree");
        ds.setActiveIndex(activeNodeId);
        ds.setPointers(Map.of("activeNodeId", activeNodeId, "target", target));
        ds.setLabel("BST Search: Inspecting Node " + val);
        ds.setFocusInfo("Node: " + val + " | Target: " + target);
        s.setDataStructureState(ds);

        s.setExplanation(exp);
        s.setAiHint("BST property: Left child < Parent < Right child.");
        return s;
    }

    // ==========================================
    // 7. Bubble Sort Visualization
    // ==========================================
    private ExecuteResponse generateBubbleSortTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Integer> arr = new ArrayList<>(List.of(40, 10, 30, 20));
        int comparisons = 0;
        int swaps = 0;
        int step = 1;

        for (int i = 0; i < arr.size() - 1; i++) {
            for (int j = 0; j < arr.size() - i - 1; j++) {
                comparisons++;
                int a = arr.get(j);
                int b = arr.get(j + 1);
                boolean willSwap = a > b;

                // Compare Step
                ExecutionStep sComp = new ExecutionStep();
                sComp.setStepNumber(step++);
                sComp.setLineNumber(6);
                sComp.setEventType("COMPARE");
                sComp.setVariables(Map.of("arr[j]", a, "arr[j+1]", b, "comparisons", comparisons, "swaps", swaps));
                sComp.setDataStructureState(createSortingState(arr, List.of(j, j + 1), null, comparisons, swaps, "Comparing " + a + " and " + b));
                sComp.setExplanation("Compare arr[" + j + "] (" + a + ") with arr[" + (j + 1) + "] (" + b + ").");
                sComp.setAiHint(willSwap ? a + " > " + b + ", so elements must be swapped." : "Elements already in order.");
                steps.add(sComp);

                // Swap Step if needed
                if (willSwap) {
                    swaps++;
                    arr.set(j, b);
                    arr.set(j + 1, a);

                    ExecutionStep sSwap = new ExecutionStep();
                    sSwap.setStepNumber(step++);
                    sSwap.setLineNumber(9);
                    sSwap.setEventType("SWAP");
                    sSwap.setVariables(Map.of("swapped", a + " <-> " + b, "comparisons", comparisons, "swaps", swaps));
                    sSwap.setDataStructureState(createSortingState(arr, null, List.of(j, j + 1), comparisons, swaps, "Swapped " + a + " and " + b));
                    sSwap.setExplanation("Swapped elements at indices " + j + " and " + (j + 1) + ". Current array: " + arr);
                    sSwap.setAiHint("The heavier element bubbles toward the right.");
                    steps.add(sSwap);
                }
            }
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private DataStructureState createSortingState(List<Integer> arr, List<Integer> compared, List<Integer> swapped, int comp, int swp, String label) {
        DataStructureState ds = new DataStructureState();
        ds.setType("sorting");
        ds.setValues(new ArrayList<>(arr));
        ds.setComparedIndices(compared);
        ds.setSwappedIndices(swapped);
        ds.setComparisons(comp);
        ds.setSwaps(swp);
        ds.setLabel(label);
        ds.setFocusInfo("Comparisons: " + comp + " | Swaps: " + swp);
        return ds;
    }

    // ==========================================
    // 8. Binary Search Visualization
    // ==========================================
    private ExecuteResponse generateBinarySearchTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Integer> arr = List.of(10, 20, 30, 40, 50, 60, 70);
        int target = 50;
        int low = 0;
        int high = arr.size() - 1;
        int step = 1;

        while (low <= high) {
            int mid = low + (high - low) / 2;
            int midVal = arr.get(mid);

            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(step++);
            s.setLineNumber(6);
            s.setEventType("SEARCH_CHECK");
            s.setVariables(Map.of("target", target, "low", low, "mid", mid, "high", high, "arr[mid]", midVal));

            DataStructureState ds = new DataStructureState();
            ds.setType("searching");
            ds.setValues(new ArrayList<>(arr));
            ds.setActiveIndex(mid);
            ds.setPointers(Map.of("low", low, "mid", mid, "high", high, "target", target));
            ds.setLabel("Checking mid = " + mid + " (" + midVal + ")");
            ds.setFocusInfo("low: " + low + " | mid: " + mid + " | high: " + high + " | target: " + target);
            s.setDataStructureState(ds);

            if (midVal == target) {
                s.setExplanation("Element arr[" + mid + "] (" + midVal + ") equals target " + target + "! Search successful.");
                s.setAiHint("Binary search completes in O(log n) time by dividing search space in half.");
                steps.add(s);
                break;
            } else if (midVal < target) {
                s.setExplanation(midVal + " < " + target + ". Discarding left half; updating low = mid + 1 (" + (mid + 1) + ").");
                s.setAiHint("Target must be in right half.");
                steps.add(s);
                low = mid + 1;
            } else {
                s.setExplanation(midVal + " > " + target + ". Discarding right half; updating high = mid - 1 (" + (mid - 1) + ").");
                s.setAiHint("Target must be in left half.");
                steps.add(s);
                high = mid - 1;
            }
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 9. Recursion / Call Stack (Factorial)
    // ==========================================
    private ExecuteResponse generateRecursionTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Map<String, Object>> callStack = new ArrayList<>();
        int step = 1;

        // CALL factorial(4)
        callStack.add(Map.of("func", "factorial(4)", "n", 4, "state", "CALL"));
        steps.add(createRecursionStep(step++, "CALL", callStack, 4, null, "factorial(4) called. Pushed to call stack."));

        // CALL factorial(3)
        callStack.add(Map.of("func", "factorial(3)", "n", 3, "state", "CALL"));
        steps.add(createRecursionStep(step++, "CALL", callStack, 3, null, "factorial(3) called. Stack depth: 2."));

        // CALL factorial(2)
        callStack.add(Map.of("func", "factorial(2)", "n", 2, "state", "CALL"));
        steps.add(createRecursionStep(step++, "CALL", callStack, 2, null, "factorial(2) called. Stack depth: 3."));

        // CALL factorial(1) - Base Case
        callStack.add(Map.of("func", "factorial(1)", "n", 1, "state", "BASE_CASE"));
        steps.add(createRecursionStep(step++, "BASE_CASE", callStack, 1, 1, "Base case reached: factorial(1) returns 1. Beginning stack unwinding."));

        // RETURN factorial(2) -> 2
        callStack.remove(callStack.size() - 1);
        steps.add(createRecursionStep(step++, "RETURN", callStack, 2, 2, "factorial(2) computes 2 * 1 = 2 and returns 2."));

        // RETURN factorial(3) -> 6
        callStack.remove(callStack.size() - 1);
        steps.add(createRecursionStep(step++, "RETURN", callStack, 3, 6, "factorial(3) computes 3 * 2 = 6 and returns 6."));

        // RETURN factorial(4) -> 24
        callStack.remove(callStack.size() - 1);
        steps.add(createRecursionStep(step++, "RETURN", callStack, 4, 24, "factorial(4) computes 4 * 6 = 24. Final result: 24."));

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private ExecutionStep createRecursionStep(int stepNum, String event, List<Map<String, Object>> stack, int n, Integer retVal, String exp) {
        ExecutionStep s = new ExecutionStep();
        s.setStepNumber(stepNum);
        s.setLineNumber(4);
        s.setEventType("RECURSION_" + event);
        s.setVariables(Map.of("n", n, "depth", stack.size(), "returnValue", retVal == null ? "pending" : retVal));

        DataStructureState ds = new DataStructureState();
        ds.setType("recursion");
        ds.setCallStack(new ArrayList<>(stack));
        ds.setLabel("Recursion " + event + ": n = " + n);
        ds.setFocusInfo("Stack Depth: " + stack.size() + (retVal != null ? " | Returned: " + retVal : ""));
        s.setDataStructureState(ds);

        s.setExplanation(exp);
        s.setAiHint("Each recursive call allocates a new stack frame storing local arguments and return address.");
        return s;
    }

    // ==========================================
    // FULL DSA IN-DEPTH TRACE GENERATORS
    // ==========================================

    private ExecuteResponse generateDoublyLinkedListTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<String> output = new ArrayList<>();
        int step = 1;

        List<Map<String, Object>> nodes = new ArrayList<>();
        nodes.add(Map.of("val", 10, "state", "ALLOCATED", "hasPrev", false, "hasNext", true));
        nodes.add(Map.of("val", 20, "state", "ALLOCATED", "hasPrev", true, "hasNext", true));
        nodes.add(Map.of("val", 30, "state", "ALLOCATED", "hasPrev", true, "hasNext", true));
        nodes.add(Map.of("val", 40, "state", "ALLOCATED", "hasPrev", true, "hasNext", false));

        // Step 1: Doubly Linked List Creation
        ExecutionStep s1 = new ExecutionStep();
        s1.setStepNumber(step++);
        s1.setLineNumber(5);
        s1.setEventType("DLL_CREATION");
        s1.setVariables(Map.of("head", "10", "tail", "40", "size", 4));
        DataStructureState ds1 = new DataStructureState();
        ds1.setType("linked-list");
        ds1.setNodes(new ArrayList<>(nodes));
        ds1.setLabel("Doubly Linked List Initialized");
        ds1.setFocusInfo("Nodes support bidirectional traversal via 'next' and 'prev' pointers");
        s1.setDataStructureState(ds1);
        s1.setExplanation("Created 4-node Doubly Linked List. Each node maintains both forward (next) and backward (prev) links.");
        s1.setAiHint("Prev pointer enables O(1) reverse steps and O(1) deletion when node pointer is given.");
        steps.add(s1);

        // Forward Traversal
        for (int i = 0; i < 4; i++) {
            int val = (i + 1) * 10;
            output.add(String.valueOf(val));
            ExecutionStep sFwd = new ExecutionStep();
            sFwd.setStepNumber(step++);
            sFwd.setLineNumber(8);
            sFwd.setEventType("FORWARD_TRAVERSAL");
            sFwd.setVariables(Map.of("curr.val", val, "direction", "FORWARD", "nodeIndex", i));
            sFwd.setOutput(new ArrayList<>(output));

            DataStructureState dsFwd = new DataStructureState();
            dsFwd.setType("linked-list");
            List<Map<String, Object>> activeNodes = new ArrayList<>(nodes);
            activeNodes.set(i, Map.of("val", val, "state", "ACTIVE_HEAD", "hasPrev", i > 0, "hasNext", i < 3));
            dsFwd.setNodes(activeNodes);
            dsFwd.setLabel("Forward Step: Node " + val);
            dsFwd.setFocusInfo("curr = curr.next -> Visiting node " + val);
            sFwd.setDataStructureState(dsFwd);
            sFwd.setExplanation("Traversing forward via next pointer: visiting node " + val + ".");
            sFwd.setAiHint("Forward traversal starts at head and continues until curr.next is null.");
            steps.add(sFwd);
        }

        // Backward Traversal from Tail
        for (int i = 3; i >= 0; i--) {
            int val = (i + 1) * 10;
            ExecutionStep sBwd = new ExecutionStep();
            sBwd.setStepNumber(step++);
            sBwd.setLineNumber(14);
            sBwd.setEventType("BACKWARD_TRAVERSAL");
            sBwd.setVariables(Map.of("curr.val", val, "direction", "BACKWARD", "nodeIndex", i));
            sBwd.setOutput(new ArrayList<>(output));

            DataStructureState dsBwd = new DataStructureState();
            dsBwd.setType("linked-list");
            List<Map<String, Object>> activeNodes = new ArrayList<>(nodes);
            activeNodes.set(i, Map.of("val", val, "state", "ACTIVE_TAIL", "hasPrev", i > 0, "hasNext", i < 3));
            dsBwd.setNodes(activeNodes);
            dsBwd.setLabel("Backward Step: Node " + val);
            dsBwd.setFocusInfo("curr = curr.prev -> Traversing backward via prev pointer");
            sBwd.setDataStructureState(dsBwd);
            sBwd.setExplanation("Traversing backward from tail using prev pointer: node " + val + ".");
            sBwd.setAiHint("Singly linked lists cannot traverse backward without a stack or reversal.");
            steps.add(sBwd);
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private ExecuteResponse generateCircularQueueTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<String> output = new ArrayList<>();
        int step = 1;
        int capacity = 5;
        List<Integer> buffer = new ArrayList<>(Collections.nCopies(capacity, 0));

        // Enqueue 10, 20, 30, 40
        int front = 0, rear = 0;
        int[] vals = {10, 20, 30, 40};
        for (int v : vals) {
            buffer.set(rear, v);
            int nextRear = (rear + 1) % capacity;

            ExecutionStep sEnq = new ExecutionStep();
            sEnq.setStepNumber(step++);
            sEnq.setLineNumber(5);
            sEnq.setEventType("QUEUE_ENQUEUE");
            sEnq.setVariables(Map.of("enqueued", v, "front", front, "rear", nextRear, "buffer", buffer.toString()));

            DataStructureState ds = new DataStructureState();
            ds.setType("array");
            ds.setValues(new ArrayList<>(buffer));
            ds.setActiveIndex(rear);
            ds.setPointers(Map.of("FRONT", front, "REAR", nextRear));
            ds.setLabel("Circular Queue: Enqueued " + v);
            ds.setFocusInfo("rear = (" + rear + " + 1) % 5 = " + nextRear);
            sEnq.setDataStructureState(ds);
            sEnq.setExplanation("Enqueued " + v + " at index " + rear + ". Updated rear pointer with modulo arithmetic.");
            sEnq.setAiHint("Circular queues prevent artificial overflow by wrapping rear to index 0.");
            steps.add(sEnq);
            rear = nextRear;
        }

        // Dequeue 10 and 20
        for (int i = 0; i < 2; i++) {
            int removed = buffer.get(front);
            buffer.set(front, 0);
            int nextFront = (front + 1) % capacity;
            output.add(String.valueOf(removed));

            ExecutionStep sDeq = new ExecutionStep();
            sDeq.setStepNumber(step++);
            sDeq.setLineNumber(11);
            sDeq.setEventType("QUEUE_DEQUEUE");
            sDeq.setVariables(Map.of("dequeued", removed, "front", nextFront, "rear", rear));
            sDeq.setOutput(new ArrayList<>(output));

            DataStructureState ds = new DataStructureState();
            ds.setType("array");
            ds.setValues(new ArrayList<>(buffer));
            ds.setActiveIndex(front);
            ds.setPointers(Map.of("FRONT", nextFront, "REAR", rear));
            ds.setLabel("Circular Queue: Dequeued " + removed);
            ds.setFocusInfo("front = (" + front + " + 1) % 5 = " + nextFront);
            sDeq.setDataStructureState(ds);
            sDeq.setExplanation("Dequeued " + removed + " from front index " + front + ". Memory slot freed for reuse.");
            sDeq.setAiHint("Dequeued slots at the beginning can now receive wrapped-around elements.");
            steps.add(sDeq);
            front = nextFront;
        }

        // Enqueue 50 (wrap-around to index 4) and 60 (wrap-around to index 0!)
        int[] wrapVals = {50, 60};
        for (int v : wrapVals) {
            buffer.set(rear, v);
            int nextRear = (rear + 1) % capacity;

            ExecutionStep sWrap = new ExecutionStep();
            sWrap.setStepNumber(step++);
            sWrap.setLineNumber(16);
            sWrap.setEventType("CIRCULAR_WRAP_ENQUEUE");
            sWrap.setVariables(Map.of("enqueued", v, "front", front, "rear", nextRear, "wrapped", nextRear <= rear));

            DataStructureState ds = new DataStructureState();
            ds.setType("array");
            ds.setValues(new ArrayList<>(buffer));
            ds.setActiveIndex(rear);
            ds.setPointers(Map.of("FRONT", front, "REAR", nextRear));
            ds.setLabel("Circular Wrap Enqueue: " + v + " at index " + rear);
            ds.setFocusInfo("Wrap-around: rear rotated back to index " + nextRear);
            sWrap.setDataStructureState(ds);
            sWrap.setExplanation("Modulo wrap-around executed! Inserted " + v + " into index " + rear + "; rear wraps to " + nextRear + ".");
            sWrap.setAiHint("Ring buffer maximizes memory efficiency with 0 element shifting.");
            steps.add(sWrap);
            rear = nextRear;
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private ExecuteResponse generateParenthesesTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        int step = 1;
        String expr = "{[()]}";
        List<Integer> stackValues = new ArrayList<>(); // ASCII representations

        for (int i = 0; i < expr.length(); i++) {
            char ch = expr.charAt(i);
            boolean isOpening = (ch == '{' || ch == '[' || ch == '(');

            if (isOpening) {
                stackValues.add((int) ch);
                ExecutionStep sPush = new ExecutionStep();
                sPush.setStepNumber(step++);
                sPush.setLineNumber(6);
                sPush.setEventType("STACK_PUSH");
                sPush.setVariables(Map.of("char", String.valueOf(ch), "action", "PUSH", "stackSize", stackValues.size()));

                DataStructureState ds = new DataStructureState();
                ds.setType("stack");
                ds.setValues(new ArrayList<>(stackValues));
                ds.setPointers(Map.of("TOP", stackValues.size() - 1));
                ds.setLabel("Parentheses Scanner: Pushed '" + ch + "'");
                ds.setFocusInfo("Opening bracket '" + ch + "' staged for matching closure");
                sPush.setDataStructureState(ds);
                sPush.setExplanation("Scanned opening bracket '" + ch + "'. Pushed onto validation stack.");
                sPush.setAiHint("Opening brackets wait on top of stack for their matching pair.");
                steps.add(sPush);
            } else {
                int popped = !stackValues.isEmpty() ? stackValues.remove(stackValues.size() - 1) : 0;
                ExecutionStep sPop = new ExecutionStep();
                sPop.setStepNumber(step++);
                sPop.setLineNumber(10);
                sPop.setEventType("STACK_POP_MATCH");
                sPop.setVariables(Map.of("char", String.valueOf(ch), "matchedWith", (char) popped, "status", "VALID_PAIR"));

                DataStructureState ds = new DataStructureState();
                ds.setType("stack");
                ds.setValues(new ArrayList<>(stackValues));
                ds.setPointers(Map.of("TOP", Math.max(0, stackValues.size() - 1)));
                ds.setLabel("Matched Pair: '" + (char) popped + "' and '" + ch + "'");
                ds.setFocusInfo("Matching closure confirmed: popped from top");
                sPop.setDataStructureState(ds);
                sPop.setExplanation("Closing bracket '" + ch + "' matches top bracket '" + (char) popped + "'. Pop executed.");
                sPop.setAiHint("Valid expressions leave the stack completely empty at string termination.");
                steps.add(sPop);
            }
        }

        // Final Validation Step
        ExecutionStep sEnd = new ExecutionStep();
        sEnd.setStepNumber(step);
        sEnd.setLineNumber(15);
        sEnd.setEventType("VALIDATION_SUCCESS");
        sEnd.setVariables(Map.of("expression", expr, "balanced", true, "remainingStack", 0));
        DataStructureState dsEnd = new DataStructureState();
        dsEnd.setType("stack");
        dsEnd.setValues(new ArrayList<>());
        dsEnd.setLabel("Expression '{[()]}' is 100% BALANCED!");
        dsEnd.setFocusInfo("Stack is empty. All bracket pairs validated.");
        sEnd.setDataStructureState(dsEnd);
        sEnd.setExplanation("String traversal complete with empty stack: Parentheses are mathematically balanced!");
        sEnd.setAiHint("Time Complexity: O(n) linear scan, Space Complexity: O(n) auxiliary stack.");
        steps.add(sEnd);

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private ExecuteResponse generateTreeTraversalsTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<String> output = new ArrayList<>();
        int step = 1;

        List<Map<String, Object>> nodes = List.of(
                Map.of("val", 50, "left", 30, "right", 70, "x", 0.0, "y", 2.0),
                Map.of("val", 30, "left", 20, "right", 40, "x", -2.5, "y", 0.0),
                Map.of("val", 70, "left", 60, "right", 80, "x", 2.5, "y", 0.0),
                Map.of("val", 20, "x", -3.8, "y", -2.0),
                Map.of("val", 40, "x", -1.2, "y", -2.0),
                Map.of("val", 60, "x", 1.2, "y", -2.0),
                Map.of("val", 80, "x", 3.8, "y", -2.0)
        );

        // In-Order Traversal sequence: 20 -> 30 -> 40 -> 50 -> 60 -> 70 -> 80
        int[] inOrder = {20, 30, 40, 50, 60, 70, 80};
        for (int val : inOrder) {
            output.add(String.valueOf(val));
            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(step++);
            s.setLineNumber(6);
            s.setEventType("TREE_INORDER_VISIT");
            s.setVariables(Map.of("visitedNode", val, "traversal", "IN_ORDER", "outputList", output.toString()));
            s.setOutput(new ArrayList<>(output));

            DataStructureState ds = new DataStructureState();
            ds.setType("bst");
            List<Map<String, Object>> stateNodes = new ArrayList<>();
            for (var n : nodes) {
                Map<String, Object> copy = new HashMap<>(n);
                if (n.get("val").equals(val)) copy.put("state", "ACTIVE");
                else if (output.contains(String.valueOf(n.get("val")))) copy.put("state", "VISITED");
                else copy.put("state", "PENDING");
                stateNodes.add(copy);
            }
            ds.setNodes(stateNodes);
            ds.setLabel("In-Order Traversal: Visited Node " + val);
            ds.setFocusInfo("Left Subtree -> Root (" + val + ") -> Right Subtree");
            s.setDataStructureState(ds);
            s.setExplanation("In-order traversal visited node " + val + ". Notice values are yielded in strictly sorted ascending order!");
            s.setAiHint("In-order traversal of any BST yields keys in monotonic non-decreasing order in O(n) time.");
            steps.add(s);
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private ExecuteResponse generateAvlTreeTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        int step = 1;

        // Step 1: Insert 30
        ExecutionStep s1 = new ExecutionStep();
        s1.setStepNumber(step++);
        s1.setLineNumber(4);
        s1.setEventType("AVL_INSERT");
        s1.setVariables(Map.of("inserted", 30, "height", 1, "balanceFactor", 0));
        DataStructureState ds1 = new DataStructureState();
        ds1.setType("bst");
        ds1.setNodes(List.of(Map.of("val", 30, "x", 0.0, "y", 1.5, "state", "ACTIVE", "bf", 0)));
        ds1.setLabel("AVL Tree: Inserted 30 (BF = 0)");
        ds1.setFocusInfo("Root = 30 | Balance Factor: 0");
        s1.setDataStructureState(ds1);
        s1.setExplanation("Inserted root node 30 into AVL tree. Height: 1, Balance Factor: 0.");
        s1.setAiHint("AVL invariant requires |Balance Factor| <= 1 for all nodes.");
        steps.add(s1);

        // Step 2: Insert 20 (Left of 30)
        ExecutionStep s2 = new ExecutionStep();
        s2.setStepNumber(step++);
        s2.setLineNumber(6);
        s2.setEventType("AVL_INSERT");
        s2.setVariables(Map.of("inserted", 20, "height", 2, "balanceFactor", 1));
        DataStructureState ds2 = new DataStructureState();
        ds2.setType("bst");
        ds2.setNodes(List.of(
                Map.of("val", 30, "left", 20, "x", 0.0, "y", 1.5, "state", "BALANCED", "bf", 1),
                Map.of("val", 20, "x", -2.0, "y", 0.0, "state", "ACTIVE", "bf", 0)
        ));
        ds2.setLabel("AVL Tree: Inserted 20 (Left child of 30)");
        ds2.setFocusInfo("Node 30 BF = +1 (Left heavy, but balanced)");
        s2.setDataStructureState(ds2);
        s2.setExplanation("Inserted 20. Node 30 balance factor becomes +1. Still within valid AVL balance limit.");
        s2.setAiHint("Balance factor = height(left) - height(right).");
        steps.add(s2);

        // Step 3: Insert 10 -> Triggers LL Imbalance (BF = +2)!
        ExecutionStep s3 = new ExecutionStep();
        s3.setStepNumber(step++);
        s3.setLineNumber(8);
        s3.setEventType("AVL_IMBALANCE_DETECTED");
        s3.setVariables(Map.of("inserted", 10, "node30_BF", 2, "imbalanceType", "LEFT_LEFT_LL"));
        DataStructureState ds3 = new DataStructureState();
        ds3.setType("bst");
        ds3.setNodes(List.of(
                Map.of("val", 30, "left", 20, "x", 0.0, "y", 2.0, "state", "IMBALANCED", "bf", 2),
                Map.of("val", 20, "left", 10, "x", -2.0, "y", 0.5, "state", "ACTIVE", "bf", 1),
                Map.of("val", 10, "x", -3.8, "y", -1.0, "state", "ACTIVE", "bf", 0)
        ));
        ds3.setLabel("CRITICAL: Left-Left (LL) Imbalance! Node 30 BF = +2");
        ds3.setFocusInfo("Balance factor +2 violates AVL condition. Right Rotation required!");
        s3.setDataStructureState(ds3);
        s3.setExplanation("Node 30 has Balance Factor +2 (> 1). Insertion in left subtree of left child causes LL imbalance!");
        s3.setAiHint("LL imbalance is resolved via a single Right Rotation (RR) on node 30.");
        steps.add(s3);

        // Step 4: Right Rotation Executed -> 20 becomes root!
        ExecutionStep s4 = new ExecutionStep();
        s4.setStepNumber(step);
        s4.setLineNumber(12);
        s4.setEventType("AVL_ROTATION_COMPLETED");
        s4.setVariables(Map.of("newRoot", 20, "leftChild", 10, "rightChild", 30, "allBalanced", true));
        DataStructureState ds4 = new DataStructureState();
        ds4.setType("bst");
        ds4.setNodes(List.of(
                Map.of("val", 20, "left", 10, "right", 30, "x", 0.0, "y", 1.5, "state", "ACTIVE", "bf", 0),
                Map.of("val", 10, "x", -2.0, "y", 0.0, "state", "BALANCED", "bf", 0),
                Map.of("val", 30, "x", 2.0, "y", 0.0, "state", "BALANCED", "bf", 0)
        ));
        ds4.setLabel("Rotation Complete: Node 20 is New Root (BF = 0)");
        ds4.setFocusInfo("All node balance factors restored to 0. Height reduced to 2.");
        s4.setDataStructureState(ds4);
        s4.setExplanation("Right rotation on node 30 promoted 20 to root. Tree height restored to O(log n) guaranteed search time!");
        s4.setAiHint("Rotations execute in O(1) time by reassigning 3 pointers.");
        steps.add(s4);

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private ExecuteResponse generateGraphBfsTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<String> output = new ArrayList<>();
        int step = 1;

        // Vertices A, B, C, D, E. Edges: A->B, A->C, B->D, C->E
        List<String> visited = new ArrayList<>();
        List<String> queue = new ArrayList<>();

        // Step 1: Start at A
        queue.add("A");
        visited.add("A");
        output.add("A");
        ExecutionStep s1 = new ExecutionStep();
        s1.setStepNumber(step++);
        s1.setLineNumber(4);
        s1.setEventType("BFS_SOURCE_INIT");
        s1.setVariables(Map.of("source", "A", "queue", queue.toString(), "visited", visited.toString()));
        s1.setOutput(new ArrayList<>(output));

        DataStructureState ds1 = new DataStructureState();
        ds1.setType("bst"); // render tree-like graph
        ds1.setNodes(List.of(
                Map.of("val", "A", "x", 0.0, "y", 2.0, "state", "ACTIVE"),
                Map.of("val", "B", "x", -2.5, "y", 0.0, "state", "PENDING"),
                Map.of("val", "C", "x", 2.5, "y", 0.0, "state", "PENDING"),
                Map.of("val", "D", "x", -3.5, "y", -2.0, "state", "PENDING"),
                Map.of("val", "E", "x", 3.5, "y", -2.0, "state", "PENDING")
        ));
        ds1.setLabel("Graph BFS Initialized: Enqueued Source Vertex 'A'");
        ds1.setFocusInfo("Visited = {A} | Queue = [A]");
        s1.setDataStructureState(ds1);
        s1.setExplanation("Enqueued source vertex A and marked as visited.");
        s1.setAiHint("BFS uses FIFO queue to explore nodes in order of shortest edge distance from source.");
        steps.add(s1);

        // Step 2: Dequeue A, Discover B and C
        queue.remove("A");
        queue.add("B");
        queue.add("C");
        visited.add("B");
        visited.add("C");
        output.add("B");
        output.add("C");

        ExecutionStep s2 = new ExecutionStep();
        s2.setStepNumber(step++);
        s2.setLineNumber(8);
        s2.setEventType("BFS_EXPLORE_NEIGHBORS");
        s2.setVariables(Map.of("dequeued", "A", "discovered", List.of("B", "C"), "queue", queue.toString()));
        s2.setOutput(new ArrayList<>(output));

        DataStructureState ds2 = new DataStructureState();
        ds2.setType("bst");
        ds2.setNodes(List.of(
                Map.of("val", "A", "x", 0.0, "y", 2.0, "state", "VISITED"),
                Map.of("val", "B", "x", -2.5, "y", 0.0, "state", "ACTIVE"),
                Map.of("val", "C", "x", 2.5, "y", 0.0, "state", "ACTIVE"),
                Map.of("val", "D", "x", -3.5, "y", -2.0, "state", "PENDING"),
                Map.of("val", "E", "x", 3.5, "y", -2.0, "state", "PENDING")
        ));
        ds2.setLabel("Dequeued A -> Explored adjacent neighbors B and C");
        ds2.setFocusInfo("Discovered depth level 1 vertices");
        s2.setDataStructureState(ds2);
        s2.setExplanation("Dequeued A. Explored edges (A, B) and (A, C). Both enqueued to BFS FIFO buffer.");
        s2.setAiHint("Visited set prevents infinite cycles in cyclical and undirected graphs.");
        steps.add(s2);

        // Step 3: Dequeue B, Discover D
        queue.remove("B");
        queue.add("D");
        visited.add("D");
        output.add("D");

        ExecutionStep s3 = new ExecutionStep();
        s3.setStepNumber(step++);
        s3.setLineNumber(12);
        s3.setEventType("BFS_EXPLORE_NEIGHBORS");
        s3.setVariables(Map.of("dequeued", "B", "discovered", "D", "queue", queue.toString()));
        s3.setOutput(new ArrayList<>(output));

        DataStructureState ds3 = new DataStructureState();
        ds3.setType("bst");
        ds3.setNodes(List.of(
                Map.of("val", "A", "x", 0.0, "y", 2.0, "state", "VISITED"),
                Map.of("val", "B", "x", -2.5, "y", 0.0, "state", "VISITED"),
                Map.of("val", "C", "x", 2.5, "y", 0.0, "state", "ACTIVE"),
                Map.of("val", "D", "x", -3.5, "y", -2.0, "state", "ACTIVE"),
                Map.of("val", "E", "x", 3.5, "y", -2.0, "state", "PENDING")
        ));
        ds3.setLabel("Dequeued B -> Discovered vertex D");
        ds3.setFocusInfo("Queue = [C, D]");
        s3.setDataStructureState(ds3);
        s3.setExplanation("Dequeued B. Discovered child vertex D and appended to exploration queue.");
        s3.setAiHint("BFS guarantees minimum number of edges from source to any visited node.");
        steps.add(s3);

        // Step 4: Dequeue C, Discover E
        queue.remove("C");
        queue.add("E");
        visited.add("E");
        output.add("E");

        ExecutionStep s4 = new ExecutionStep();
        s4.setStepNumber(step++);
        s4.setLineNumber(16);
        s4.setEventType("BFS_EXPLORE_NEIGHBORS");
        s4.setVariables(Map.of("dequeued", "C", "discovered", "E", "queue", queue.toString()));
        s4.setOutput(new ArrayList<>(output));

        DataStructureState ds4 = new DataStructureState();
        ds4.setType("bst");
        ds4.setNodes(List.of(
                Map.of("val", "A", "x", 0.0, "y", 2.0, "state", "VISITED"),
                Map.of("val", "B", "x", -2.5, "y", 0.0, "state", "VISITED"),
                Map.of("val", "C", "x", 2.5, "y", 0.0, "state", "VISITED"),
                Map.of("val", "D", "x", -3.5, "y", -2.0, "state", "ACTIVE"),
                Map.of("val", "E", "x", 3.5, "y", -2.0, "state", "ACTIVE")
        ));
        ds4.setLabel("Dequeued C -> Discovered vertex E");
        ds4.setFocusInfo("All 5 vertices now discovered in O(V + E) time");
        s4.setDataStructureState(ds4);
        s4.setExplanation("Dequeued C. Discovered vertex E. All vertices reached.");
        s4.setAiHint("BFS is optimal for unweighted shortest path routing.");
        steps.add(s4);

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private ExecuteResponse generateDpKnapsackTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        int step = 1;

        // 3 items: (wt=2, val=3), (wt=3, val=4), (wt=4, val=5). Capacity W = 5.
        // 2D DP Table dimensions: 4 items x 6 capacities
        int[][] dp = new int[4][6];
        int[] wt = {0, 2, 3, 4};
        int[] val = {0, 3, 4, 5};

        for (int i = 1; i <= 3; i++) {
            for (int w = 1; w <= 5; w++) {
                if (wt[i] <= w) {
                    dp[i][w] = Math.max(dp[i - 1][w], val[i] + dp[i - 1][w - wt[i]]);
                } else {
                    dp[i][w] = dp[i - 1][w];
                }

                ExecutionStep s = new ExecutionStep();
                s.setStepNumber(step++);
                s.setLineNumber(8);
                s.setEventType("DP_STATE_CALCULATION");
                s.setVariables(Map.of("item", i, "weight", wt[i], "value", val[i], "capacity", w, "dp_i_w", dp[i][w]));

                DataStructureState ds = new DataStructureState();
                ds.setType("matrix");
                List<List<Object>> matrixList = new ArrayList<>();
                for (int r = 0; r < 4; r++) {
                    List<Object> row = new ArrayList<>();
                    for (int c = 0; c < 6; c++) row.add(dp[r][c]);
                    matrixList.add(row);
                }
                ds.setMatrix(matrixList);
                ds.setPointers(Map.of("ROW", i, "COL", w));
                ds.setLabel("DP State: Item " + i + " | Cap " + w + " → Max Value: " + dp[i][w]);
                ds.setFocusInfo("dp[" + i + "][" + w + "] = max(dp[" + (i - 1) + "][" + w + "], " + val[i] + " + dp[" + (i - 1) + "][" + (w - wt[i]) + "])");
                s.setDataStructureState(ds);
                s.setExplanation("Item " + i + " (wt=" + wt[i] + ", val=" + val[i] + "): computed optimal subset value for capacity " + w + ".");
                s.setAiHint("Dynamic programming stores subproblem solutions to prevent recomputation in O(N * W) time.");
                steps.add(s);
            }
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    private ExecuteResponse generateHashTableTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        int step = 1;

        // Hash Table with capacity 5. Keys: 12, 22, 35, 42
        int[] keys = {12, 22, 35, 42};
        List<List<Integer>> buckets = new ArrayList<>();
        for (int i = 0; i < 5; i++) buckets.add(new ArrayList<>());

        for (int k : keys) {
            int bucketIdx = k % 5;
            buckets.get(bucketIdx).add(k);

            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(step++);
            s.setLineNumber(6);
            s.setEventType(buckets.get(bucketIdx).size() > 1 ? "HASH_COLLISION_CHAIN" : "HASH_INSERT");
            s.setVariables(Map.of("key", k, "hashBucket", bucketIdx, "chainLength", buckets.get(bucketIdx).size()));

            DataStructureState ds = new DataStructureState();
            ds.setType("matrix");
            List<List<Object>> matrix = new ArrayList<>();
            for (int b = 0; b < 5; b++) {
                List<Object> bRow = new ArrayList<>(buckets.get(b));
                while (bRow.size() < 3) bRow.add(0);
                matrix.add(bRow);
            }
            ds.setMatrix(matrix);
            ds.setPointers(Map.of("BUCKET", bucketIdx));
            ds.setLabel(buckets.get(bucketIdx).size() > 1
                    ? "Collision in Bucket " + bucketIdx + "! Chained " + k
                    : "Inserted " + k + " into Bucket " + bucketIdx);
            ds.setFocusInfo("hash(" + k + ") = " + k + " % 5 = " + bucketIdx);
            s.setDataStructureState(ds);
            s.setExplanation("Key " + k + " hashes to bucket " + bucketIdx + ". " +
                    (buckets.get(bucketIdx).size() > 1 ? "Collision resolved via Separate Chaining linked node." : "Clean insertion."));
            s.setAiHint("With low load factor α < 0.75, Hash Table lookups run in amortized O(1) constant time.");
            steps.add(s);
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 14. Two-Pointer Array Reversal
    // ==========================================
    private ExecuteResponse generateTwoPointerReverseTrace() {
        return multiLanguageExecutionService.executeUserCode(
                new ExecuteRequest("int[] arr = {10, 20, 30, 40, 50}; int left = 0, right = arr.length - 1; while(left < right) { int temp = arr[left]; arr[left] = arr[right]; arr[right] = temp; left++; right--; }", "two-pointer-reverse", "java")
        );
    }

    // ==========================================
    // 15. Sliding Window Subarray Sum
    // ==========================================
    private ExecuteResponse generateSlidingWindowTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Integer> arr = List.of(2, 1, 5, 1, 3, 2);
        int k = 3;
        int step = 1;

        // Init window [2, 1, 5]
        int currentSum = 2 + 1 + 5;
        int maxSum = currentSum;

        ExecutionStep sInit = new ExecutionStep();
        sInit.setStepNumber(step++);
        sInit.setLineNumber(4);
        sInit.setEventType("WINDOW_INIT");
        sInit.setVariables(Map.of("arr", arr.toString(), "k", k, "windowSum", currentSum, "maxSum", maxSum));
        DataStructureState dsInit = new DataStructureState();
        dsInit.setType("sorting");
        dsInit.setValues(new ArrayList<>(arr));
        dsInit.setComparedIndices(List.of(0, 1, 2));
        dsInit.setPointers(Map.of("low", 0, "high", 2));
        dsInit.setLabel("Initial Window [0..2]: Sum = " + currentSum);
        dsInit.setFocusInfo("Elements: 2 + 1 + 5 = 8 | MaxSum = 8");
        sInit.setDataStructureState(dsInit);
        sInit.setExplanation("Computed initial sum of first " + k + " items: 2 + 1 + 5 = " + currentSum + ".");
        sInit.setAiHint("Sliding window replaces O(k) recalculations with O(1) additions and subtractions.");
        steps.add(sInit);

        for (int i = k; i < arr.size(); i++) {
            int outgoing = arr.get(i - k);
            int incoming = arr.get(i);
            currentSum = currentSum - outgoing + incoming;
            boolean newMax = currentSum > maxSum;
            if (newMax) maxSum = currentSum;

            ExecutionStep sSlide = new ExecutionStep();
            sSlide.setStepNumber(step++);
            sSlide.setLineNumber(7);
            sSlide.setEventType("WINDOW_SLIDE");
            sSlide.setVariables(Map.of("outgoing", outgoing, "incoming", incoming, "windowSum", currentSum, "maxSum", maxSum));
            DataStructureState dsSlide = new DataStructureState();
            dsSlide.setType("sorting");
            dsSlide.setValues(new ArrayList<>(arr));
            dsSlide.setComparedIndices(List.of(i - k + 1, i - 1, i));
            dsSlide.setPointers(Map.of("low", i - k + 1, "high", i));
            dsSlide.setLabel("Slide to [" + (i - k + 1) + ".." + i + "]: Sum = " + currentSum);
            dsSlide.setFocusInfo("-" + outgoing + " + " + incoming + " = " + currentSum + (newMax ? " (New Max!)" : ""));
            sSlide.setDataStructureState(dsSlide);
            sSlide.setExplanation("Window slides: Subtract arr[" + (i - k) + "] (" + outgoing + ") and add arr[" + i + "] (" + incoming + "). New sum: " + currentSum + ".");
            sSlide.setAiHint(newMax ? "New maximum found! Updated maxSum to " + maxSum + "." : "Window sum does not exceed previous maximum.");
            steps.add(sSlide);
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 16. Circular Linked List
    // ==========================================
    private ExecuteResponse generateCircularLinkedListTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Integer> values = List.of(10, 20, 30, 40);
        int step = 1;

        for (int i = 0; i < values.size(); i++) {
            int val = values.get(i);
            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(step++);
            s.setLineNumber(8);
            s.setEventType("LIST_TRAVERSE");
            s.setVariables(Map.of("curr.val", val, "next", values.get((i + 1) % values.size())));

            DataStructureState ds = new DataStructureState();
            ds.setType("linked-list");
            ds.setValues(new ArrayList<>(values));
            ds.setActiveIndex(i);
            ds.setPointers(Map.of("HEAD", 0, "CURR", i, "TAIL", values.size() - 1));
            ds.setLabel("Circular Node: " + val + " → Next: " + values.get((i + 1) % values.size()));
            ds.setFocusInfo("Node " + i + " points to " + ((i + 1) % values.size() == 0 ? "HEAD (0)" : "Node " + (i + 1)));
            s.setDataStructureState(ds);
            s.setExplanation("Visiting node with value " + val + ". Pointer moves along the circular chain.");
            s.setAiHint("In a circular linked list, the tail node's next reference points back to head instead of null.");
            steps.add(s);
        }

        // Loop back to head
        ExecutionStep sHead = new ExecutionStep();
        sHead.setStepNumber(step);
        sHead.setLineNumber(12);
        sHead.setEventType("CIRCULAR_CYCLE_BACK");
        sHead.setVariables(Map.of("curr", "HEAD", "val", 10));
        DataStructureState dsHead = new DataStructureState();
        dsHead.setType("linked-list");
        dsHead.setValues(new ArrayList<>(values));
        dsHead.setActiveIndex(0);
        dsHead.setPointers(Map.of("HEAD", 0, "CURR", 0));
        dsHead.setLabel("Loop wrapped back to HEAD (10)!");
        dsHead.setFocusInfo("Full circle completed");
        sHead.setDataStructureState(dsHead);
        sHead.setExplanation("Tail's next reference returned execution to HEAD (node 0). Circular traversal completed.");
        sHead.setAiHint("Circular traversal condition checks if curr == head to prevent infinite looping.");
        steps.add(sHead);

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 17. Cycle Detection (Floyd's Tortoise & Hare)
    // ==========================================
    private ExecuteResponse generateCycleDetectionTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Integer> values = List.of(1, 2, 3, 4, 5);
        int step = 1;

        int[] slowPath = {0, 1, 2, 3, 4, 2};
        int[] fastPath = {0, 2, 4, 3, 2, 2};

        for (int i = 0; i < slowPath.length; i++) {
            int sIdx = slowPath[i];
            int fIdx = fastPath[i];
            boolean met = i == slowPath.length - 1;

            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(step++);
            s.setLineNumber(10);
            s.setEventType(met ? "CYCLE_DETECTED" : "POINTERS_ADVANCE");
            s.setVariables(Map.of("slow", values.get(sIdx), "fast", values.get(fIdx), "iteration", i));

            DataStructureState ds = new DataStructureState();
            ds.setType("linked-list");
            ds.setValues(new ArrayList<>(values));
            ds.setActiveIndex(sIdx);
            ds.setPointers(Map.of("SLOW", sIdx, "FAST", fIdx));
            ds.setLabel(met ? "CYCLE DETECTED! Slow == Fast at Node " + values.get(sIdx) : "Iteration " + i + ": Slow at Node " + values.get(sIdx) + ", Fast at Node " + values.get(fIdx));
            ds.setFocusInfo(met ? "Collision at node " + values.get(sIdx) : "Slow moves 1 step, Fast moves 2 steps");
            s.setDataStructureState(ds);
            s.setExplanation(met ? "Slow and Fast pointers collided at node with value " + values.get(sIdx) + ". Cycle confirmed!"
                    : "Slow advances 1 step to " + values.get(sIdx) + ", Fast advances 2 steps to " + values.get(fIdx) + ".");
            s.setAiHint("Floyd's algorithm detects cycles in O(n) time with O(1) memory.");
            steps.add(s);
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 18. Double-Ended Queue (Deque)
    // ==========================================
    private ExecuteResponse generateDequeTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Integer> deque = new ArrayList<>();
        int step = 1;

        // 1. addFirst(10)
        deque.add(0, 10);
        ExecutionStep s1 = new ExecutionStep();
        s1.setStepNumber(step++);
        s1.setLineNumber(3);
        s1.setEventType("DEQUE_ADD_FIRST");
        s1.setVariables(Map.of("op", "addFirst(10)", "deque", deque.toString()));
        DataStructureState ds1 = new DataStructureState();
        ds1.setType("queue");
        ds1.setValues(new ArrayList<>(deque));
        ds1.setPointers(Map.of("FRONT", 0, "REAR", 0));
        ds1.setLabel("addFirst(10)");
        ds1.setFocusInfo("10 inserted at front");
        s1.setDataStructureState(ds1);
        s1.setExplanation("addFirst(10): Inserted element 10 at the front of the deque.");
        s1.setAiHint("Deque supports constant time O(1) insertions and removals at both ends.");
        steps.add(s1);

        // 2. addLast(20)
        deque.add(20);
        ExecutionStep s2 = new ExecutionStep();
        s2.setStepNumber(step++);
        s2.setLineNumber(4);
        s2.setEventType("DEQUE_ADD_LAST");
        s2.setVariables(Map.of("op", "addLast(20)", "deque", deque.toString()));
        DataStructureState ds2 = new DataStructureState();
        ds2.setType("queue");
        ds2.setValues(new ArrayList<>(deque));
        ds2.setPointers(Map.of("FRONT", 0, "REAR", deque.size() - 1));
        ds2.setLabel("addLast(20)");
        ds2.setFocusInfo("20 appended to rear");
        s2.setDataStructureState(ds2);
        s2.setExplanation("addLast(20): Appended element 20 to the rear of the deque.");
        s2.setAiHint("Rear index moves rightward.");
        steps.add(s2);

        // 3. addFirst(5)
        deque.add(0, 5);
        ExecutionStep s3 = new ExecutionStep();
        s3.setStepNumber(step++);
        s3.setLineNumber(5);
        s3.setEventType("DEQUE_ADD_FIRST");
        s3.setVariables(Map.of("op", "addFirst(5)", "deque", deque.toString()));
        DataStructureState ds3 = new DataStructureState();
        ds3.setType("queue");
        ds3.setValues(new ArrayList<>(deque));
        ds3.setPointers(Map.of("FRONT", 0, "REAR", deque.size() - 1));
        ds3.setLabel("addFirst(5)");
        ds3.setFocusInfo("5 prepended to front");
        s3.setDataStructureState(ds3);
        s3.setExplanation("addFirst(5): Prepended 5. Current deque: " + deque);
        s3.setAiHint("Front index stays at 0 as elements shift.");
        steps.add(s3);

        // 4. removeLast()
        int removedLast = deque.remove(deque.size() - 1);
        ExecutionStep s4 = new ExecutionStep();
        s4.setStepNumber(step++);
        s4.setLineNumber(6);
        s4.setEventType("DEQUE_REMOVE_LAST");
        s4.setVariables(Map.of("op", "removeLast()", "removed", removedLast, "deque", deque.toString()));
        DataStructureState ds4 = new DataStructureState();
        ds4.setType("queue");
        ds4.setValues(new ArrayList<>(deque));
        ds4.setPointers(Map.of("FRONT", 0, "REAR", deque.size() - 1));
        ds4.setLabel("removeLast() -> " + removedLast);
        ds4.setFocusInfo("Removed " + removedLast + " from rear");
        s4.setDataStructureState(ds4);
        s4.setExplanation("removeLast(): Removed and returned element " + removedLast + " from rear.");
        s4.setAiHint("Remaining deque: " + deque);
        steps.add(s4);

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 19. Trie (Prefix Tree)
    // ==========================================
    private ExecuteResponse generateTrieTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        int step = 1;

        List<String> words = List.of("CAT", "CAR");
        for (String word : words) {
            for (int i = 0; i < word.length(); i++) {
                char ch = word.charAt(i);
                ExecutionStep s = new ExecutionStep();
                s.setStepNumber(step++);
                s.setLineNumber(5);
                s.setEventType("TRIE_INSERT_CHAR");
                s.setVariables(Map.of("word", word, "char", String.valueOf(ch), "depth", i + 1));

                DataStructureState ds = new DataStructureState();
                ds.setType("tree");
                ds.setNodes(List.of(
                        Map.of("id", 0, "val", "ROOT", "left", 1, "right", -1),
                        Map.of("id", 1, "val", "C", "left", 2, "right", -1),
                        Map.of("id", 2, "val", "A", "left", 3, "right", -1),
                        Map.of("id", 3, "val", String.valueOf(ch) + (i == 2 ? "*" : ""), "left", -1, "right", -1)
                ));
                ds.setLabel("Inserting '" + word + "': Node '" + ch + "'");
                ds.setFocusInfo("Prefix depth " + (i + 1) + (i == word.length() - 1 ? " (isEndOfWord = true)" : ""));
                s.setDataStructureState(ds);
                s.setExplanation("Inserting character '" + ch + "' of word '" + word + "' into Trie node branch.");
                s.setAiHint("Trie prefix searches run in O(m) time where m is key length, independent of tree size.");
                steps.add(s);
            }
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 20. Insertion Sort
    // ==========================================
    private ExecuteResponse generateInsertionSortTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Integer> arr = new ArrayList<>(List.of(35, 12, 45, 8, 20));
        int step = 1;

        for (int i = 1; i < arr.size(); i++) {
            int key = arr.get(i);
            int j = i - 1;

            ExecutionStep sKey = new ExecutionStep();
            sKey.setStepNumber(step++);
            sKey.setLineNumber(5);
            sKey.setEventType("PICK_KEY");
            sKey.setVariables(Map.of("arr", arr.toString(), "i", i, "key", key));
            DataStructureState dsKey = new DataStructureState();
            dsKey.setType("sorting");
            dsKey.setValues(new ArrayList<>(arr));
            dsKey.setActiveIndex(i);
            dsKey.setLabel("Selected Key: " + key + " at index " + i);
            dsKey.setFocusInfo("Inserting " + key + " into sorted prefix [0.." + (i - 1) + "]");
            sKey.setDataStructureState(dsKey);
            sKey.setExplanation("Selected key = " + key + ". Comparing backwards through sorted subarray.");
            sKey.setAiHint("Insertion sort builds the final sorted array one item at a time.");
            steps.add(sKey);

            while (j >= 0 && arr.get(j) > key) {
                arr.set(j + 1, arr.get(j));
                ExecutionStep sShift = new ExecutionStep();
                sShift.setStepNumber(step++);
                sShift.setLineNumber(8);
                sShift.setEventType("SHIFT_ELEMENT");
                sShift.setVariables(Map.of("shifted", arr.get(j), "toIndex", j + 1));
                DataStructureState dsShift = new DataStructureState();
                dsShift.setType("sorting");
                dsShift.setValues(new ArrayList<>(arr));
                dsShift.setSwappedIndices(List.of(j, j + 1));
                dsShift.setLabel("Shifted " + arr.get(j) + " rightward to make space");
                dsShift.setFocusInfo("j = " + j);
                sShift.setDataStructureState(dsShift);
                sShift.setExplanation("arr[" + j + "] (" + arr.get(j) + ") > key (" + key + "). Shifted to index " + (j + 1) + ".");
                sShift.setAiHint("Elements greater than key are shifted right.");
                steps.add(sShift);
                j--;
            }
            arr.set(j + 1, key);

            ExecutionStep sPlace = new ExecutionStep();
            sPlace.setStepNumber(step++);
            sPlace.setLineNumber(11);
            sPlace.setEventType("PLACE_KEY");
            sPlace.setVariables(Map.of("placedKey", key, "atIndex", j + 1, "arr", arr.toString()));
            DataStructureState dsPlace = new DataStructureState();
            dsPlace.setType("sorting");
            dsPlace.setValues(new ArrayList<>(arr));
            dsPlace.setActiveIndex(j + 1);
            dsPlace.setLabel("Placed Key " + key + " at index " + (j + 1));
            dsPlace.setFocusInfo("Prefix [0.." + i + "] is now sorted: " + arr.subList(0, i + 1));
            sPlace.setDataStructureState(dsPlace);
            sPlace.setExplanation("Inserted key " + key + " into its correct sorted position at index " + (j + 1) + ".");
            sPlace.setAiHint("Subarray up to index " + i + " is now strictly sorted.");
            steps.add(sPlace);
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 21. Merge Sort
    // ==========================================
    private ExecuteResponse generateMergeSortTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Integer> arr = new ArrayList<>(List.of(38, 27, 43, 3, 9, 82, 10));
        int step = 1;

        // Stage 1: Initial Array
        ExecutionStep s1 = new ExecutionStep();
        s1.setStepNumber(step++);
        s1.setLineNumber(3);
        s1.setEventType("DIVIDE");
        s1.setVariables(Map.of("arr", arr.toString(), "size", arr.size()));
        DataStructureState ds1 = new DataStructureState();
        ds1.setType("sorting");
        ds1.setValues(new ArrayList<>(arr));
        ds1.setLabel("Merge Sort: Divide Array of Size " + arr.size());
        ds1.setFocusInfo("Divide & conquer split into subarrays");
        s1.setDataStructureState(ds1);
        s1.setExplanation("Merge sort begins: Recursively divide array into halves until subarrays of size 1 are reached.");
        s1.setAiHint("Merge sort guarantees O(n log n) time in all cases (worst, average, best).");
        steps.add(s1);

        // Stage 2: Merge left halves [27, 38, 43]
        List<Integer> stage2 = List.of(27, 38, 43, 3, 9, 82, 10);
        ExecutionStep s2 = new ExecutionStep();
        s2.setStepNumber(step++);
        s2.setLineNumber(8);
        s2.setEventType("MERGE_SUBARRAY");
        s2.setVariables(Map.of("merged", "[27, 38, 43]"));
        DataStructureState ds2 = new DataStructureState();
        ds2.setType("sorting");
        ds2.setValues(new ArrayList<>(stage2));
        ds2.setComparedIndices(List.of(0, 1, 2));
        ds2.setLabel("Merged Left Subarray: [27, 38, 43]");
        ds2.setFocusInfo("Indices [0..2] merged in sorted order");
        s2.setDataStructureState(ds2);
        s2.setExplanation("Merged left halves into sorted sequence [27, 38, 43].");
        s2.setAiHint("Two-way merge compares head pointers of both subarrays.");
        steps.add(s2);

        // Stage 3: Merge right halves [3, 9, 10, 82]
        List<Integer> stage3 = List.of(27, 38, 43, 3, 9, 10, 82);
        ExecutionStep s3 = new ExecutionStep();
        s3.setStepNumber(step++);
        s3.setLineNumber(8);
        s3.setEventType("MERGE_SUBARRAY");
        s3.setVariables(Map.of("merged", "[3, 9, 10, 82]"));
        DataStructureState ds3 = new DataStructureState();
        ds3.setType("sorting");
        ds3.setValues(new ArrayList<>(stage3));
        ds3.setComparedIndices(List.of(3, 4, 5, 6));
        ds3.setLabel("Merged Right Subarray: [3, 9, 10, 82]");
        ds3.setFocusInfo("Indices [3..6] merged in sorted order");
        s3.setDataStructureState(ds3);
        s3.setExplanation("Merged right halves into sorted sequence [3, 9, 10, 82].");
        s3.setAiHint("Both halves are now individually sorted and ready for final combine.");
        steps.add(s3);

        // Stage 4: Final Merge [3, 9, 10, 27, 38, 43, 82]
        List<Integer> finalSorted = List.of(3, 9, 10, 27, 38, 43, 82);
        ExecutionStep s4 = new ExecutionStep();
        s4.setStepNumber(step);
        s4.setLineNumber(12);
        s4.setEventType("MERGE_COMPLETE");
        s4.setVariables(Map.of("sortedArr", finalSorted.toString()));
        DataStructureState ds4 = new DataStructureState();
        ds4.setType("sorting");
        ds4.setValues(new ArrayList<>(finalSorted));
        ds4.setLabel("Final Merge Complete: " + finalSorted);
        ds4.setFocusInfo("O(n log n) sorting completed");
        s4.setDataStructureState(ds4);
        s4.setExplanation("Final merge complete: Array fully sorted into " + finalSorted + ".");
        s4.setAiHint("Merge sort is stable and ideal for external sorting.");
        steps.add(s4);

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 22. Quick Sort
    // ==========================================
    private ExecuteResponse generateQuickSortTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        List<Integer> arr = new ArrayList<>(List.of(10, 80, 30, 90, 40, 50, 70));
        int step = 1;

        // Step 1: Pick Pivot 70
        ExecutionStep s1 = new ExecutionStep();
        s1.setStepNumber(step++);
        s1.setLineNumber(5);
        s1.setEventType("PIVOT_SELECT");
        s1.setVariables(Map.of("pivot", 70, "pivotIndex", 6));
        DataStructureState ds1 = new DataStructureState();
        ds1.setType("sorting");
        ds1.setValues(new ArrayList<>(arr));
        ds1.setActiveIndex(6);
        ds1.setLabel("Pivot Selected: 70 (Last element)");
        ds1.setFocusInfo("Partitioning elements relative to 70");
        s1.setDataStructureState(ds1);
        s1.setExplanation("Lomuto partitioning: Selected pivot = 70 at end index 6.");
        s1.setAiHint("Elements smaller than pivot will be partitioned to the left; larger to the right.");
        steps.add(s1);

        // Step 2: Swap 80 and 30
        arr.set(1, 30);
        arr.set(2, 80);
        ExecutionStep s2 = new ExecutionStep();
        s2.setStepNumber(step++);
        s2.setLineNumber(8);
        s2.setEventType("PARTITION_SWAP");
        s2.setVariables(Map.of("swapped", "80 <-> 30", "arr", arr.toString()));
        DataStructureState ds2 = new DataStructureState();
        ds2.setType("sorting");
        ds2.setValues(new ArrayList<>(arr));
        ds2.setSwappedIndices(List.of(1, 2));
        ds2.setActiveIndex(6);
        ds2.setLabel("Swapped 80 and 30: Smaller element moved left");
        ds2.setFocusInfo("30 < 70, placed into left partition");
        s2.setDataStructureState(ds2);
        s2.setExplanation("30 is smaller than pivot 70, swapped into left partition position.");
        s2.setAiHint("Pointer 'i' tracks the boundary of elements <= pivot.");
        steps.add(s2);

        // Step 3: Swap 90 and 40
        arr.set(3, 40);
        arr.set(4, 90);
        ExecutionStep s3 = new ExecutionStep();
        s3.setStepNumber(step++);
        s3.setLineNumber(8);
        s3.setEventType("PARTITION_SWAP");
        s3.setVariables(Map.of("swapped", "90 <-> 40", "arr", arr.toString()));
        DataStructureState ds3 = new DataStructureState();
        ds3.setType("sorting");
        ds3.setValues(new ArrayList<>(arr));
        ds3.setSwappedIndices(List.of(3, 4));
        ds3.setActiveIndex(6);
        ds3.setLabel("Swapped 90 and 40: Smaller element moved left");
        ds3.setFocusInfo("40 < 70, placed into left partition");
        s3.setDataStructureState(ds3);
        s3.setExplanation("40 is smaller than pivot 70, swapped into left partition position.");
        s3.setAiHint("Partition maintains contiguous block of smaller elements.");
        steps.add(s3);

        // Step 4: Pivot to final spot: swap pivot 70 with 90 at index 4
        arr.set(6, 90);
        arr.set(4, 70);
        ExecutionStep s4 = new ExecutionStep();
        s4.setStepNumber(step);
        s4.setLineNumber(12);
        s4.setEventType("PIVOT_PLACED");
        s4.setVariables(Map.of("pivot", 70, "finalIndex", 4, "arr", arr.toString()));
        DataStructureState ds4 = new DataStructureState();
        ds4.setType("sorting");
        ds4.setValues(new ArrayList<>(arr));
        ds4.setActiveIndex(4);
        ds4.setSwappedIndices(List.of(4, 6));
        ds4.setLabel("Pivot 70 Locked at Index 4!");
        ds4.setFocusInfo("All elements left <= 70, all right >= 70");
        s4.setDataStructureState(ds4);
        s4.setExplanation("Pivot 70 placed into its final sorted position at index 4. Array is partitioned.");
        s4.setAiHint("Quick Sort now recurses independently on left and right partitions.");
        steps.add(s4);

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 23. Graph DFS Traversal
    // ==========================================
    private ExecuteResponse generateGraphDfsTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        int step = 1;
        int[] visitOrder = {0, 1, 3, 2, 4};

        for (int v : visitOrder) {
            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(step++);
            s.setLineNumber(6);
            s.setEventType("DFS_VISIT");
            s.setVariables(Map.of("vertex", v, "visited", "true"));

            DataStructureState ds = new DataStructureState();
            ds.setType("tree");
            ds.setNodes(List.of(
                    Map.of("id", 0, "val", "V0", "left", 1, "right", 2),
                    Map.of("id", 1, "val", "V1", "left", 3, "right", -1),
                    Map.of("id", 2, "val", "V2", "left", 4, "right", -1),
                    Map.of("id", 3, "val", "V3", "left", -1, "right", -1),
                    Map.of("id", 4, "val", "V4", "left", -1, "right", -1)
            ));
            ds.setActiveIndex(v);
            ds.setLabel("DFS Visiting Vertex: " + v);
            ds.setFocusInfo("Depth-first exploration via Call Stack");
            s.setDataStructureState(ds);
            s.setExplanation("DFS visits vertex " + v + ", marking it visited and exploring adjacent unvisited neighbors.");
            s.setAiHint("DFS explores deeply along each branch before backtracking.");
            steps.add(s);
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 24. Dijkstra's Shortest Path
    // ==========================================
    private ExecuteResponse generateDijkstraTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        int step = 1;

        List<Integer> dist = new ArrayList<>(List.of(0, 999, 999, 999, 999));
        int[] relaxedVertices = {0, 1, 2, 3, 4};
        int[][] newDists = {
                {0, 4, 2, 999, 999},
                {0, 4, 2, 7, 999},
                {0, 3, 2, 6, 999},
                {0, 3, 2, 6, 8},
                {0, 3, 2, 6, 8}
        };

        for (int i = 0; i < relaxedVertices.length; i++) {
            int u = relaxedVertices[i];
            List<Integer> currDist = new ArrayList<>();
            for (int d : newDists[i]) currDist.add(d);

            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(step++);
            s.setLineNumber(8);
            s.setEventType("RELAX_EDGES");
            s.setVariables(Map.of("minVertex", u, "dist", currDist.toString()));

            DataStructureState ds = new DataStructureState();
            ds.setType("sorting");
            ds.setValues(new ArrayList<Object>(currDist));
            ds.setActiveIndex(u);
            ds.setLabel("Relaxing Edges from Vertex " + u + ": dist[] = " + currDist);
            ds.setFocusInfo("Shortest distance to " + u + " finalized: " + currDist.get(u));
            s.setDataStructureState(ds);
            s.setExplanation("Extracted minimum distance vertex " + u + ". Relaxing all outgoing edges (v) where dist[u] + wt < dist[v].");
            s.setAiHint("Dijkstra's greedy algorithm finds single-source shortest paths in O((V + E) log V).");
            steps.add(s);
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 25. Fibonacci with Memoization (DP)
    // ==========================================
    private ExecuteResponse generateFibonacciMemoTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        int step = 1;
        List<Integer> memo = new ArrayList<>(List.of(0, 1, 1, 2, 3, 5));

        for (int n = 2; n <= 5; n++) {
            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(step++);
            s.setLineNumber(6);
            s.setEventType("DP_MEMO_STORE");
            s.setVariables(Map.of("n", n, "fib(n-1)", memo.get(n - 1), "fib(n-2)", memo.get(n - 2), "memo[" + n + "]", memo.get(n)));

            DataStructureState ds = new DataStructureState();
            ds.setType("sorting");
            ds.setValues(new ArrayList<Object>(memo.subList(0, n + 1)));
            ds.setActiveIndex(n);
            ds.setLabel("Computed fib(" + n + ") = " + memo.get(n) + " (Cached in memo[" + n + "])");
            ds.setFocusInfo("Subproblem n=" + n + " solved in O(1) from cached children");
            s.setDataStructureState(ds);
            s.setExplanation("Computed fib(" + n + ") = fib(" + (n - 1) + ") + fib(" + (n - 2) + ") = " +
                    memo.get(n - 1) + " + " + memo.get(n - 2) + " = " + memo.get(n) + ". Stored in memo table.");
            s.setAiHint("Memoization prunes redundant exponential branches down to O(n) linear time.");
            steps.add(s);
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }

    // ==========================================
    // 26. Longest Common Subsequence (LCS)
    // ==========================================
    private ExecuteResponse generateLcsTrace() {
        List<ExecutionStep> steps = new ArrayList<>();
        int step = 1;

        String s1 = "ABC";
        String s2 = "AC";
        int[][] dp = new int[4][3];

        for (int r = 1; r <= 3; r++) {
            for (int c = 1; c <= 2; c++) {
                char c1 = s1.charAt(r - 1);
                char c2 = s2.charAt(c - 1);
                boolean match = c1 == c2;
                if (match) {
                    dp[r][c] = 1 + dp[r - 1][c - 1];
                } else {
                    dp[r][c] = Math.max(dp[r - 1][c], dp[r][c - 1]);
                }

                ExecutionStep s = new ExecutionStep();
                s.setStepNumber(step++);
                s.setLineNumber(7);
                s.setEventType(match ? "LCS_CHAR_MATCH" : "LCS_MAX_PICK");
                s.setVariables(Map.of("char1", String.valueOf(c1), "char2", String.valueOf(c2), "match", match, "dp[r][c]", dp[r][c]));

                DataStructureState ds = new DataStructureState();
                ds.setType("matrix");
                List<List<Object>> matrix = new ArrayList<>();
                for (int i = 0; i < 4; i++) {
                    List<Object> row = new ArrayList<>();
                    for (int j = 0; j < 3; j++) {
                        row.add(dp[i][j]);
                    }
                    matrix.add(row);
                }
                ds.setMatrix(matrix);
                ds.setPointers(Map.of("R", r, "C", c));
                ds.setLabel(match ? "Match ('" + c1 + "')! dp[" + r + "][" + c + "] = " + dp[r][c] : "Mismatch: dp[" + r + "][" + c + "] = " + dp[r][c]);
                ds.setFocusInfo("Comparing '" + c1 + "' vs '" + c2 + "'");
                s.setDataStructureState(ds);
                s.setExplanation(match ? "Characters matched ('" + c1 + "'). Value = 1 + diagonal: " + dp[r][c]
                        : "Characters do not match. Value = max(top, left): " + dp[r][c] + ".");
                s.setAiHint("LCS dynamic programming constructs optimal common subsequence length in O(m * n) time.");
                steps.add(s);
            }
        }

        return new ExecuteResponse("SUCCESS", steps.size(), steps);
    }
}
