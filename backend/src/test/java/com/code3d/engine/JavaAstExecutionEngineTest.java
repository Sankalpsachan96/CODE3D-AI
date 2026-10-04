package com.code3d.engine;

import com.code3d.model.ExecuteResponse;
import com.code3d.model.ExecutionStep;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

import java.util.List;

public class JavaAstExecutionEngineTest {

    private final JavaAstExecutionEngine engine = new JavaAstExecutionEngine();

    @Test
    public void testPhase30ArrayLoopProgram() {
        String code = """
            public class Main {
                public static void main(String[] args) {
                    int[] arr = {10, 20, 30, 40, 50};
                    for (int i = 0; i < arr.length; i++) {
                        System.out.println(arr[i]);
                    }
                }
            }
            """;

        ExecuteResponse response = engine.execute(code);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());
        assertTrue(response.getTotalSteps() > 0);

        List<ExecutionStep> steps = response.getSteps();
        assertNotNull(steps);

        // Verify array was initialized
        boolean hasArrayInit = steps.stream().anyMatch(s -> s.getVariables() != null && s.getVariables().containsKey("arr"));
        assertTrue(hasArrayInit, "Execution trace must contain 'arr'");

        // Verify loop index changes
        boolean hasLoopIndex = steps.stream().anyMatch(s -> s.getVariables() != null && s.getVariables().containsKey("i"));
        assertTrue(hasLoopIndex, "Execution trace must track loop variable 'i'");

        // Verify outputs contain the 5 elements
        ExecutionStep lastStep = steps.get(steps.size() - 1);
        List<String> output = lastStep.getOutput();
        assertNotNull(output);
        assertTrue(output.contains("10"), "Output must contain 10");
        assertTrue(output.contains("20"), "Output must contain 20");
        assertTrue(output.contains("30"), "Output must contain 30");
        assertTrue(output.contains("40"), "Output must contain 40");
        assertTrue(output.contains("50"), "Output must contain 50");
    }

    @Test
    public void testDifferentProgramDistinctTrace() {
        String code = """
            public class Main {
                public static void main(String[] args) {
                    int a = 15;
                    int b = 25;
                    int max = a;
                    if (b > max) {
                        max = b;
                    }
                    System.out.println(max);
                }
            }
            """;

        ExecuteResponse response = engine.execute(code);
        assertNotNull(response);
        assertEquals("SUCCESS", response.getStatus());

        List<ExecutionStep> steps = response.getSteps();
        ExecutionStep lastStep = steps.get(steps.size() - 1);

        assertEquals(25, lastStep.getVariables().get("max"));
        assertTrue(lastStep.getOutput().contains("25"));
    }

    @Test
    public void testSecurityProtection() {
        String maliciousCode = """
            public class Main {
                public static void main(String[] args) {
                    ProcessBuilder pb = new ProcessBuilder("calc.exe");
                }
            }
            """;

        ExecuteResponse response = engine.execute(maliciousCode);
        assertNotNull(response);
        assertEquals("ERROR", response.getStatus());
        assertTrue(response.getMessage().contains("Unsupported Java construct") || response.getMessage().contains("restricted"));
    }
}
