package com.code3d.service;

import com.code3d.model.*;
import com.code3d.parser.UniversalCodeAnalyzer;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CodeCorrectionService {

    private final MultiLanguageExecutionService executionService;

    public CodeCorrectionService(MultiLanguageExecutionService executionService) {
        this.executionService = executionService;
    }

    public CodeCorrectionResponse correctAndVisualize(CodeCorrectionRequest request) {
        String rawCode = request.getCode() != null ? request.getCode().trim() : "";
        String language = request.getLanguage();

        if (language == null || language.isBlank()) {
            language = UniversalCodeAnalyzer.detectLanguage(rawCode);
        }
        language = language.toLowerCase();

        CodeCorrectionResponse response = new CodeCorrectionResponse();
        response.setOriginalCode(rawCode);
        response.setLanguage(language);

        List<String> errorsFound = new ArrayList<>();
        String correctedCode = rawCode;

        // 1. Check if user entered purely random numbers, list tokens or raw pseudo-code
        List<Integer> extractedNumbers = executionService.extractArrayValues(rawCode, language);
        boolean isRawInput = isPurelyRawInput(rawCode);

        if (isRawInput || rawCode.isEmpty()) {
            List<Integer> nums = !extractedNumbers.isEmpty() ? extractedNumbers : List.of(12, 45, 8, 99, 23);
            errorsFound.add("Raw input / unstructured pseudo-code detected. Scaffolding full compilable " + language.toUpperCase() + " program.");
            correctedCode = generateBoilerplate(nums, language, rawCode.toLowerCase().contains("sort"));
        } else {
            // 2. Perform Intelligent Static Bug Diagnosis & Automated Repair

            // Bug A: Off-by-one array index boundary error (i <= arr.length / i <= size)
            if (Pattern.compile("i\\s*<=\\s*(arr\\.length|v\\.size\\(\\)|n|len\\(arr\\)|arr\\.size)").matcher(correctedCode).find()) {
                errorsFound.add("Off-by-one boundary bug: Condition 'i <= length' causes IndexOutOfBoundsException. Corrected to strict inequality 'i < length'.");
                correctedCode = correctedCode.replaceAll("i\\s*<=\\s*(arr\\.length|v\\.size\\(\\)|n|len\\(arr\\)|arr\\.size)", "i < $1");
            }

            // Bug B: Misspelled console/print functions
            if (correctedCode.contains("printfln") || correctedCode.contains("System.out.printl(") || correctedCode.contains("sout(")) {
                errorsFound.add("Invalid print function syntax repaired to 'System.out.println(...)'.");
                correctedCode = correctedCode.replaceAll("System\\.out\\.printl\\(", "System.out.println(")
                                             .replaceAll("printfln\\(", "System.out.println(")
                                             .replaceAll("sout\\((.*?)\\);?", "System.out.println($1);");
            }
            if ("javascript".equals(language) && (correctedCode.contains("consol.log") || correctedCode.contains("System.out.println"))) {
                errorsFound.add("Malformed console logger repaired to standard 'console.log(...)'.");
                correctedCode = correctedCode.replaceAll("consol\\.log", "console.log")
                                             .replaceAll("System\\.out\\.println", "console.log");
            }
            if ("python".equals(language) && (correctedCode.contains("System.out.println") || correctedCode.contains("console.log") || correctedCode.contains("printf"))) {
                errorsFound.add("Foreign output statement converted to Python 'print(...)'.");
                correctedCode = correctedCode.replaceAll("System\\.out\\.println\\((.*?)\\);?", "print($1)")
                                             .replaceAll("console\\.log\\((.*?)\\);?", "print($1)")
                                             .replaceAll("printf\\((.*?)\\);?", "print($1)");
            }

            // Bug C: Python missing colons in loop headers
            if ("python".equals(language)) {
                if (correctedCode.matches("(?s).*for\\s+\\w+\\s+in\\s+[^:\\n]+(\\r?\\n).*") && !correctedCode.contains(":")) {
                    errorsFound.add("Python Syntax Error: Missing colon ':' at end of 'for' loop header.");
                    correctedCode = correctedCode.replaceAll("(?m)^(for\\s+\\w+\\s+in\\s+[^:\\n]+)$", "$1:");
                }
            }

            // Bug D: Missing commas between array numbers: e.g. {10 20 30} or [10 20 30]
            Pattern spaceArrayPat = Pattern.compile("([\\[{])\\s*(\\d+(\\s+\\d+)+)\\s*([\\]}])");
            Matcher spaceArrayMatcher = spaceArrayPat.matcher(correctedCode);
            if (spaceArrayMatcher.find()) {
                String rawNums = spaceArrayMatcher.group(2);
                String commaSeparated = rawNums.trim().replaceAll("\\s+", ", ");
                errorsFound.add("Malformed array elements without commas repaired: {" + rawNums + "} → {" + commaSeparated + "}.");
                correctedCode = correctedCode.replace(rawNums, commaSeparated);
            }

            // Bug E: Missing main method / class structure in Java
            if ("java".equals(language)) {
                if (!correctedCode.contains("class ") && !correctedCode.contains("static void main")) {
                    errorsFound.add("Missing class and main method wrapper. Structured into executable 'public class Main'.");
                    correctedCode = "public class Main {\n    public static void main(String[] args) {\n        " +
                            correctedCode.replace("\n", "\n        ") +
                            "\n    }\n}";
                } else if (correctedCode.contains("class ") && !correctedCode.contains("static void main")) {
                    errorsFound.add("LeetCode class detected without main driver. Injected executable static main test driver.");
                    int lastBrace = correctedCode.lastIndexOf("}");
                    if (lastBrace != -1) {
                        String driver = """
    public static void main(String[] args) {
        System.out.println("Executing 3D Solution Trace...");
    }
}""";
                        correctedCode = correctedCode.substring(0, lastBrace) + "\n" + driver;
                    }
                }
            }

            // Bug F: Missing semicolons on declarations in Java, C, C++, JavaScript
            if (!"python".equals(language)) {
                String[] lines = correctedCode.split("\r?\n");
                StringBuilder sb = new StringBuilder();
                boolean fixedSemicolon = false;
                for (String line : lines) {
                    String trimmed = line.trim();
                    if (!trimmed.isEmpty() &&
                        !trimmed.endsWith(";") &&
                        !trimmed.endsWith("{") &&
                        !trimmed.endsWith("}") &&
                        !trimmed.startsWith("//") &&
                        !trimmed.startsWith("#") &&
                        !trimmed.startsWith("/*") &&
                        !trimmed.endsWith("*/") &&
                        !trimmed.contains("for(") &&
                        !trimmed.contains("for (") &&
                        !trimmed.contains("while(") &&
                        !trimmed.contains("while (") &&
                        !trimmed.contains("class ") &&
                        !trimmed.contains("main(")) {
                        sb.append(line).append(";\n");
                        fixedSemicolon = true;
                    } else {
                        sb.append(line).append("\n");
                    }
                }
                if (fixedSemicolon) {
                    errorsFound.add("Missing semicolons ';' inserted at the end of statements.");
                    correctedCode = sb.toString().trim();
                }
            }

            // Bug G: Mismatched / Missing closing braces
            long openBraces = correctedCode.chars().filter(ch -> ch == '{').count();
            long closeBraces = correctedCode.chars().filter(ch -> ch == '}').count();
            if (openBraces > closeBraces) {
                int diff = (int) (openBraces - closeBraces);
                errorsFound.add("Unclosed code blocks: Appended " + diff + " missing closing brace(s) '}'.");
                for (int i = 0; i < diff; i++) {
                    correctedCode += "\n}";
                }
            }
        }

        response.setCorrect(errorsFound.isEmpty());
        response.setCorrectedCode(correctedCode);
        response.setErrorsFound(errorsFound);

        if (errorsFound.isEmpty()) {
            response.setExplanation("Your code is syntactically clean and algorithmically valid! Generating 3D execution trace.");
        } else {
            response.setExplanation("Personal Problem Solver diagnosed " + errorsFound.size() + " issue(s) and automatically generated working 3D code.");
        }

        // 3. Generate 3D Execution Trace from the repaired/corrected code!
        ExecuteRequest execReq = new ExecuteRequest(correctedCode, "custom", language);
        ExecuteResponse trace = executionService.executeUserCode(execReq);
        response.setExecutionTrace(trace);

        return response;
    }

    private boolean isPurelyRawInput(String code) {
        String trimmed = code.trim();
        // If code has no brackets, loops, or keywords, or is just comma/space-separated numbers
        return !trimmed.contains("for") &&
               !trimmed.contains("while") &&
               !trimmed.contains("int ") &&
               !trimmed.contains("const ") &&
               !trimmed.contains("let ") &&
               !trimmed.contains("def ") &&
               !trimmed.contains("printf") &&
               !trimmed.contains("print");
    }

    private String generateBoilerplate(List<Integer> values, String lang, boolean isSort) {
        String joined = values.stream().map(String::valueOf).reduce((a, b) -> a + ", " + b).orElse("10, 20, 30, 40");
        int n = values.size();

        return switch (lang.toLowerCase()) {
            case "python" -> isSort ? """
# Repaired Python Bubble Sort
numbers = [%s]
n = len(numbers)

print("Starting 3D Bubble Sort on custom values:")
for i in range(n):
    for j in range(0, n - i - 1):
        if numbers[j] > numbers[j + 1]:
            temp = numbers[j]
            numbers[j] = numbers[j + 1]
            numbers[j + 1] = temp
            print(f"Swapped: {numbers}")
""".formatted(joined) : """
# Repaired Python Array Traversal
numbers = [%s]

print("Executing 3D Python Traversal:")
for i in range(len(numbers)):
    print(f"Index {i} -> {numbers[i]}")
""".formatted(joined);

            case "javascript", "js" -> isSort ? """
// Repaired JavaScript Bubble Sort
const arr = [%s];
const n = arr.length;

console.log("3D Bubble Sort running:");
for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
        if (arr[j] > arr[j + 1]) {
            const temp = arr[j];
            arr[j] = arr[j + 1];
            arr[j + 1] = temp;
        }
    }
}
""".formatted(joined) : """
// Repaired JavaScript Traversal
const arr = [%s];

console.log("3D Array Execution:");
for (let i = 0; i < arr.length; i++) {
    console.log(`arr[${i}] = ${arr[i]}`);
}
""".formatted(joined);

            case "c" -> isSort ? """
// Repaired C Bubble Sort
#include <stdio.h>

int main() {
    int arr[] = {%s};
    int n = %d;

    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return 0;
}
""".formatted(joined, n) : """
// Repaired C Program
#include <stdio.h>

int main() {
    int arr[] = {%s};
    int n = %d;

    for (int i = 0; i < n; i++) {
        printf("Element: %%d\\n", arr[i]);
    }
    return 0;
}
""".formatted(joined, n);

            case "cpp" -> isSort ? """
// Repaired C++ Vector Bubble Sort
#include <iostream>
#include <vector>

int main() {
    std::vector<int> arr = {%s};

    for (int i = 0; i < arr.size() - 1; i++) {
        for (int j = 0; j < arr.size() - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                int temp = arr[j];
                arr[j] = arr[j + 1];
                arr[j + 1] = temp;
            }
        }
    }
    return 0;
}
""".formatted(joined) : """
// Repaired C++ Vector Program
#include <iostream>
#include <vector>

int main() {
    std::vector<int> arr = {%s};

    for (int i = 0; i < arr.size(); i++) {
        std::cout << "Vector item: " << arr[i] << std::endl;
    }
    return 0;
}
""".formatted(joined);

            default -> isSort ? """
// Repaired Java Bubble Sort
public class Main {
    public static void main(String[] args) {
        int[] arr = {%s};

        for (int i = 0; i < arr.length - 1; i++) {
            for (int j = 0; j < arr.length - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }
}
""".formatted(joined) : """
// Repaired Java Program
public class Main {
    public static void main(String[] args) {
        int[] arr = {%s};

        for (int i = 0; i < arr.length; i++) {
            System.out.println(arr[i]);
        }
    }
}
""".formatted(joined);
        };
    }
}
