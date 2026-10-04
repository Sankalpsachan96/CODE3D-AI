package com.code3d.service;

import com.code3d.model.ExplainRequest;
import com.code3d.model.ExplainResponse;
import org.springframework.stereotype.Service;

@Service
public class AiExplanationService {

    public ExplainResponse explain(ExplainRequest request) {
        String type = request.getQueryType() != null ? request.getQueryType().toUpperCase() : "EXPLAIN_CODE";
        String level = request.getLevel() != null ? request.getLevel() : "Beginner";
        int line = request.getLineNumber() != null ? request.getLineNumber() : 6;

        return switch (type) {
            case "WHY" -> new ExplainResponse(
                    "Why is this step executed? In Java, arrays require iterative traversal because elements are stored at individual contiguous index offsets [0..length-1]. The loop condition acts as an invariant safeguard preventing ArrayIndexOutOfBoundsException.",
                    "Look at the condition 'i < arr.length': it guarantees we stop exactly before out-of-bounds memory.",
                    "Loop invariants protect runtime memory boundaries."
            );
            case "HINT" -> new ExplainResponse(
                    "Progressive Hint: Notice how the variable 'i' changes by +1 after the loop body finishes, and how the condition is re-checked immediately before accessing arr[i].",
                    "Hint: What would happen if the condition was 'i <= arr.length' instead?",
                    "Bounds checking occurs before element dereferencing."
            );
            case "PREDICT_NEXT" -> new ExplainResponse(
                    "Predictive Step: In the next step, the CPU will increment 'i' from its current value and re-evaluate the loop conditional. If true, the subsequent array cell will be dereferenced in memory.",
                    "Think about the difference between post-increment (i++) and pre-increment (++i) in loops.",
                    "Loop cycle: Evaluate condition → Execute body → Increment counter."
            );
            case "EXPLAIN_LINE" -> new ExplainResponse(
                    "Line " + line + " Explanation (" + level + "): This statement directly accesses an element from the array using index 'i' in O(1) time complexity, and passes the value into System.out for terminal output.",
                    "Array index lookups are instant: memory address = base_address + (i * element_size).",
                    "Direct index arithmetic enables O(1) random access."
            );
            default -> new ExplainResponse(
                    "Algorithm Overview (" + level + "): This program allocates a 1D contiguous array and executes a linear traversal loop. The time complexity is O(n) where n is the number of elements, and auxiliary space is O(1).",
                    "Arrays provide constant time access O(1) but linear time search O(n) for unsorted data.",
                    "Linear traversal visits each item exactly once."
            );
        };
    }
}
