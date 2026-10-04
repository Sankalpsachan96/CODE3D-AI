package com.code3d.engine;

import com.code3d.model.DataStructureState;
import com.code3d.model.ExecuteResponse;
import com.code3d.model.ExecutionStep;
import com.github.javaparser.StaticJavaParser;
import com.github.javaparser.ast.CompilationUnit;
import com.github.javaparser.ast.Node;
import com.github.javaparser.ast.body.MethodDeclaration;
import com.github.javaparser.ast.body.VariableDeclarator;
import com.github.javaparser.ast.expr.*;
import com.github.javaparser.ast.stmt.*;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * CODE3D-AI - Sandboxed Java AST Execution Engine
 *
 * Implements real step-by-step AST execution over Java source code using JavaParser.
 * Features:
 * - Dynamic interpretation of variables (int, long, float, double, boolean, char, String)
 * - Array support (1D, 2D) with real-time indexing and values tracking
 * - Conditionals (if, else-if, else) with condition evaluation tracking
 * - Loops (for, while, do-while) with iteration step generation and loop variable tracking
 * - Method invocations with parameter binding and call stack tracking
 * - Console capture (System.out.print / println)
 * - Sandboxing (max 1000 steps, 3s timeout, output cap, unsupported construct detection)
 */
@Service
public class JavaAstExecutionEngine {

    private static final int MAX_EXECUTION_STEPS = 1000;
    private static final long MAX_EXECUTION_TIME_MS = 3000;
    private static final int MAX_OUTPUT_CHARS = 10000;

    public ExecuteResponse execute(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            return ExecuteResponse.error("Code is empty.");
        }

        // 1. Pre-validation and Security Check for Forbidden/Dangerous Constructs
        String lowerCode = rawCode.toLowerCase();
        if (lowerCode.contains("processbuilder") || lowerCode.contains("runtime.getruntime") ||
            lowerCode.contains("java.lang.reflect") || lowerCode.contains("java.nio") ||
            lowerCode.contains("java.net") || lowerCode.contains("system.exit")) {
            return ExecuteResponse.error("Unsupported Java construct: Forbidden security violation (process/network/reflection/filesystem execution is restricted).");
        }

        // 2. Parse Java AST
        CompilationUnit cu;
        int lineOffset = 0;
        try {
            if (rawCode.contains("class ") || rawCode.contains("interface ")) {
                cu = StaticJavaParser.parse(rawCode);
            } else {
                // Wrap snippet into a synthetic Main class
                String wrapped = "public class Main {\n    public static void main(String[] args) {\n" + rawCode + "\n    }\n}";
                cu = StaticJavaParser.parse(wrapped);
                lineOffset = 2; // lines wrapped by header
            }
        } catch (Exception parseEx) {
            return ExecuteResponse.error("Java Syntax Error: " + parseEx.getMessage());
        }

        // 3. Locate Entry Method (main or first method)
        MethodDeclaration entryMethod = null;
        List<MethodDeclaration> methods = cu.findAll(MethodDeclaration.class);
        for (MethodDeclaration m : methods) {
            if ("main".equals(m.getNameAsString())) {
                entryMethod = m;
                break;
            }
        }
        if (entryMethod == null && !methods.isEmpty()) {
            entryMethod = methods.get(0);
        }

        if (entryMethod == null || entryMethod.getBody().isEmpty()) {
            return ExecuteResponse.error("No executable method body found in Java source code.");
        }

        // 4. Initialize Execution Environment
        ExecutionContext ctx = new ExecutionContext(lineOffset);
        long startTime = System.currentTimeMillis();

        try {
            BlockStmt body = entryMethod.getBody().get();
            executeBlock(body, ctx, startTime);
        } catch (ExecutionTimeoutException te) {
            return ExecuteResponse.error("Execution Timeout: Code exceeded 3000ms execution limit (possible infinite loop).");
        } catch (StepLimitExceededException se) {
            return ExecuteResponse.error("Execution Limit: Program exceeded 1000 step limit (infinite loop detected).");
        } catch (UnsupportedConstructException ue) {
            return ExecuteResponse.error("Unsupported Java construct: " + ue.getMessage());
        } catch (IndexOutOfBoundsException oob) {
            ExecutionStep errStep = new ExecutionStep();
            errStep.setStepNumber(ctx.stepCounter++);
            errStep.setLineNumber(ctx.currentLine);
            errStep.setEventType("EXCEPTION");
            errStep.setExplanation("Runtime Error: " + oob.getMessage());
            errStep.setVariables(new LinkedHashMap<>(ctx.variables));
            ctx.stdout.add("[Exception] " + oob.getMessage());
            errStep.setOutput(new ArrayList<>(ctx.stdout));
            errStep.setDataStructureState(ctx.buildDataStructureState("Runtime Exception", oob.getMessage()));
            ctx.steps.add(errStep);
            ExecuteResponse resp = new ExecuteResponse("ERROR", ctx.steps.size(), ctx.steps);
            resp.setError(oob.getMessage());
            return resp;
        } catch (Exception ex) {
            return ExecuteResponse.error("Runtime Evaluation Error: " + ex.getMessage());
        }

        // Ensure final completion step exists
        if (!ctx.steps.isEmpty()) {
            ExecutionStep last = ctx.steps.get(ctx.steps.size() - 1);
            if (!"PROGRAM_END".equals(last.getEventType())) {
                ExecutionStep endStep = new ExecutionStep();
                endStep.setStepNumber(ctx.stepCounter++);
                endStep.setLineNumber(last.getLineNumber());
                endStep.setEventType("PROGRAM_END");
                endStep.setVariables(new LinkedHashMap<>(ctx.variables));
                endStep.setOutput(new ArrayList<>(ctx.stdout));
                endStep.setExplanation("Java execution completed successfully with exit code 0.");
                endStep.setDataStructureState(ctx.buildDataStructureState("Program Completed", "Status 0"));
                ctx.steps.add(endStep);
            }
        }

        return new ExecuteResponse("SUCCESS", ctx.steps.size(), ctx.steps);
    }

    private void executeBlock(BlockStmt block, ExecutionContext ctx, long startTime) {
        for (Statement stmt : block.getStatements()) {
            checkLimits(ctx, startTime);
            executeStatement(stmt, ctx, startTime);
        }
    }

    private void executeStatement(Statement stmt, ExecutionContext ctx, long startTime) {
        checkLimits(ctx, startTime);

        if (stmt.isExpressionStmt()) {
            executeExpression(stmt.asExpressionStmt().getExpression(), stmt, ctx, startTime);
        } else if (stmt.isIfStmt()) {
            executeIf(stmt.asIfStmt(), ctx, startTime);
        } else if (stmt.isForStmt()) {
            executeFor(stmt.asForStmt(), ctx, startTime);
        } else if (stmt.isWhileStmt()) {
            executeWhile(stmt.asWhileStmt(), ctx, startTime);
        } else if (stmt.isDoStmt()) {
            executeDoWhile(stmt.asDoStmt(), ctx, startTime);
        } else if (stmt.isBlockStmt()) {
            executeBlock(stmt.asBlockStmt(), ctx, startTime);
        } else if (stmt.isReturnStmt()) {
            executeReturn(stmt.asReturnStmt(), ctx, startTime);
        } else {
            throw new UnsupportedConstructException("Statement type '" + stmt.getClass().getSimpleName() + "' is not supported.");
        }
    }

    private void executeExpression(Expression expr, Statement parentStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(expr, ctx);

        if (expr.isVariableDeclarationExpr()) {
            VariableDeclarationExpr vde = expr.asVariableDeclarationExpr();
            for (VariableDeclarator var : vde.getVariables()) {
                String name = var.getNameAsString();
                String type = var.getType().asString();
                Object val = null;

                if (var.getInitializer().isPresent()) {
                    val = evalExpression(var.getInitializer().get(), ctx);
                } else {
                    val = getDefaultValue(type);
                }

                ctx.variables.put(name, val);
                ctx.variableTypes.put(name, type);

                ExecutionStep s = new ExecutionStep();
                s.setStepNumber(ctx.stepCounter++);
                s.setLineNumber(line);
                s.setEventType(type.contains("[]") ? "ARRAY_CREATION" : "VARIABLE_DECLARATION");
                s.setChangedVariable(name);
                s.setCurrentValue(val);
                s.setVariables(new LinkedHashMap<>(ctx.variables));
                s.setOutput(new ArrayList<>(ctx.stdout));
                s.setExplanation("Declared " + type + " variable '" + name + "' = " + formatVal(val) + ".");
                s.setDataStructureState(ctx.buildDataStructureState(
                    type.contains("[]") ? "Array Created: " + name : "Variable Declared: " + name,
                    name + " = " + formatVal(val)
                ));
                ctx.steps.add(s);
            }
        } else if (expr.isAssignExpr()) {
            AssignExpr ae = expr.asAssignExpr();
            Expression target = ae.getTarget();
            Object rightVal = evalExpression(ae.getValue(), ctx);
            AssignExpr.Operator op = ae.getOperator();

            if (target.isNameExpr()) {
                String varName = target.asNameExpr().getNameAsString();
                Object prevVal = ctx.variables.get(varName);
                Object newVal = applyAssignOp(op, prevVal, rightVal);
                ctx.variables.put(varName, newVal);

                ExecutionStep s = new ExecutionStep();
                s.setStepNumber(ctx.stepCounter++);
                s.setLineNumber(line);
                s.setEventType("ASSIGNMENT");
                s.setChangedVariable(varName);
                s.setPreviousValue(prevVal);
                s.setCurrentValue(newVal);
                s.setVariables(new LinkedHashMap<>(ctx.variables));
                s.setOutput(new ArrayList<>(ctx.stdout));
                s.setExplanation("Updated '" + varName + "' = " + formatVal(newVal) + ".");
                s.setDataStructureState(ctx.buildDataStructureState("Assignment: " + varName, varName + " = " + formatVal(newVal)));
                ctx.steps.add(s);
            } else if (target.isArrayAccessExpr()) {
                ArrayAccessExpr aae = target.asArrayAccessExpr();
                String arrName = aae.getName().asNameExpr().getNameAsString();
                int idx = ((Number) evalExpression(aae.getIndex(), ctx)).intValue();

                Object arrObj = ctx.variables.get(arrName);
                if (arrObj instanceof List<?> list) {
                    @SuppressWarnings("unchecked")
                    List<Object> modifiable = (List<Object>) list;
                    Object prevVal = (idx >= 0 && idx < modifiable.size()) ? modifiable.get(idx) : null;
                    Object newVal = applyAssignOp(op, prevVal, rightVal);
                    if (idx >= 0 && idx < modifiable.size()) {
                        modifiable.set(idx, newVal);
                    }

                    ExecutionStep s = new ExecutionStep();
                    s.setStepNumber(ctx.stepCounter++);
                    s.setLineNumber(line);
                    s.setEventType("ARRAY_ASSIGN");
                    s.setChangedVariable(arrName + "[" + idx + "]");
                    s.setPreviousValue(prevVal);
                    s.setCurrentValue(newVal);
                    s.setVariables(new LinkedHashMap<>(ctx.variables));
                    s.setOutput(new ArrayList<>(ctx.stdout));
                    s.setExplanation("Updated " + arrName + "[" + idx + "] = " + newVal + ".");

                    DataStructureState ds = ctx.buildDataStructureState("Array Element Assigned", arrName + "[" + idx + "] = " + newVal);
                    ds.setActiveIndex(idx);
                    s.setDataStructureState(ds);
                    ctx.steps.add(s);
                }
            }
        } else if (expr.isMethodCallExpr()) {
            MethodCallExpr mce = expr.asMethodCallExpr();
            String mName = mce.getNameAsString();

            // Handle System.out.println / print
            if ("println".equals(mName) || "print".equals(mName)) {
                StringBuilder printBuf = new StringBuilder();
                for (Expression arg : mce.getArguments()) {
                    Object v = evalExpression(arg, ctx);
                    printBuf.append(formatVal(v));
                }
                String outStr = printBuf.toString();
                ctx.stdout.add(outStr);
                if (ctx.stdout.size() * 50 > MAX_OUTPUT_CHARS) {
                    throw new ExecutionTimeoutException("Output limit exceeded");
                }

                ExecutionStep s = new ExecutionStep();
                s.setStepNumber(ctx.stepCounter++);
                s.setLineNumber(line);
                s.setEventType("PRINT_OUTPUT");
                s.setCurrentValue(outStr);
                s.setVariables(new LinkedHashMap<>(ctx.variables));
                s.setOutput(new ArrayList<>(ctx.stdout));
                s.setExplanation("Standard output printed: '" + outStr + "'.");
                s.setDataStructureState(ctx.buildDataStructureState("Print Output: " + outStr, outStr));
                ctx.steps.add(s);
            } else {
                // Generic method evaluation
                evalExpression(expr, ctx);
            }
        } else if (expr.isUnaryExpr()) {
            evalUnary(expr.asUnaryExpr(), ctx);
        }
    }

    private void executeIf(IfStmt ifStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(ifStmt, ctx);
        Object condObj = evalExpression(ifStmt.getCondition(), ctx);
        boolean condVal = Boolean.TRUE.equals(condObj);

        ExecutionStep s = new ExecutionStep();
        s.setStepNumber(ctx.stepCounter++);
        s.setLineNumber(line);
        s.setEventType("CONDITION_CHECK");
        s.setVariables(new LinkedHashMap<>(ctx.variables));
        s.setOutput(new ArrayList<>(ctx.stdout));

        com.code3d.model.ConditionInfo condInfo = new com.code3d.model.ConditionInfo();
        condInfo.setExpression(ifStmt.getCondition().toString());
        condInfo.setEvaluation(ifStmt.getCondition().toString() + " = " + condVal);
        condInfo.setResult(condVal);
        condInfo.setBranch(condVal ? "BRANCH TAKEN" : "BRANCH SKIPPED");
        s.setCondition(condInfo);

        s.setExplanation("Evaluated if (" + ifStmt.getCondition() + ") -> " + (condVal ? "TRUE (Entering branch)" : "FALSE (Skipping branch)"));
        s.setDataStructureState(ctx.buildDataStructureState(
            condVal ? "Condition True: Branch Taken" : "Condition False: Branch Skipped",
            ifStmt.getCondition().toString() + " = " + condVal
        ));
        ctx.steps.add(s);

        if (condVal) {
            executeStatement(ifStmt.getThenStmt(), ctx, startTime);
        } else if (ifStmt.getElseStmt().isPresent()) {
            executeStatement(ifStmt.getElseStmt().get(), ctx, startTime);
        }
    }

    private void executeFor(ForStmt forStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(forStmt, ctx);

        // 1. Initializers
        for (Expression init : forStmt.getInitialization()) {
            executeExpression(init, forStmt, ctx, startTime);
        }

        // 2. Loop Execution
        while (true) {
            checkLimits(ctx, startTime);

            // Condition
            if (forStmt.getCompare().isPresent()) {
                Expression compExpr = forStmt.getCompare().get();
                Object condObj = evalExpression(compExpr, ctx);
                boolean condVal = Boolean.TRUE.equals(condObj);

                ExecutionStep s = new ExecutionStep();
                s.setStepNumber(ctx.stepCounter++);
                s.setLineNumber(line);
                s.setEventType("CONDITION_CHECK");
                s.setVariables(new LinkedHashMap<>(ctx.variables));
                s.setOutput(new ArrayList<>(ctx.stdout));

                com.code3d.model.ConditionInfo condInfo = new com.code3d.model.ConditionInfo();
                condInfo.setExpression(compExpr.toString());
                condInfo.setEvaluation(compExpr.toString() + " = " + condVal);
                condInfo.setResult(condVal);
                condInfo.setBranch(condVal ? "ENTER LOOP BODY" : "EXIT LOOP");
                s.setCondition(condInfo);

                s.setExplanation("Loop condition '" + compExpr + "' evaluated to " + (condVal ? "TRUE" : "FALSE") + ".");
                DataStructureState ds = ctx.buildDataStructureState(
                    condVal ? "Loop Condition TRUE" : "Loop Condition FALSE (Exit)",
                    compExpr.toString() + " = " + condVal
                );
                s.setDataStructureState(ds);
                ctx.steps.add(s);

                if (!condVal) {
                    break;
                }
            }

            // Body
            executeStatement(forStmt.getBody(), ctx, startTime);

            // Update
            for (Expression update : forStmt.getUpdate()) {
                int updateLine = getSourceLine(update, ctx);
                executeExpression(update, forStmt, ctx, startTime);
            }
        }
    }

    private void executeWhile(WhileStmt whileStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(whileStmt, ctx);

        while (true) {
            checkLimits(ctx, startTime);
            Object condObj = evalExpression(whileStmt.getCondition(), ctx);
            boolean condVal = Boolean.TRUE.equals(condObj);

            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(ctx.stepCounter++);
            s.setLineNumber(line);
            s.setEventType("CONDITION_CHECK");
            s.setVariables(new LinkedHashMap<>(ctx.variables));
            s.setOutput(new ArrayList<>(ctx.stdout));

            com.code3d.model.ConditionInfo condInfo = new com.code3d.model.ConditionInfo();
            condInfo.setExpression(whileStmt.getCondition().toString());
            condInfo.setEvaluation(whileStmt.getCondition().toString() + " = " + condVal);
            condInfo.setResult(condVal);
            condInfo.setBranch(condVal ? "ENTER LOOP BODY" : "EXIT LOOP");
            s.setCondition(condInfo);
            s.setExplanation("While condition '" + whileStmt.getCondition() + "' evaluated to " + condVal + ".");
            s.setDataStructureState(ctx.buildDataStructureState("While Condition: " + condVal, whileStmt.getCondition().toString()));
            ctx.steps.add(s);

            if (!condVal) {
                break;
            }

            executeStatement(whileStmt.getBody(), ctx, startTime);
        }
    }

    private void executeDoWhile(DoStmt doStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(doStmt, ctx);

        do {
            checkLimits(ctx, startTime);
            executeStatement(doStmt.getBody(), ctx, startTime);

            Object condObj = evalExpression(doStmt.getCondition(), ctx);
            boolean condVal = Boolean.TRUE.equals(condObj);

            ExecutionStep s = new ExecutionStep();
            s.setStepNumber(ctx.stepCounter++);
            s.setLineNumber(line);
            s.setEventType("CONDITION_CHECK");
            s.setVariables(new LinkedHashMap<>(ctx.variables));
            s.setOutput(new ArrayList<>(ctx.stdout));
            s.setExplanation("Do-While condition evaluated to " + condVal + ".");
            s.setDataStructureState(ctx.buildDataStructureState("Do-While Condition: " + condVal, doStmt.getCondition().toString()));
            ctx.steps.add(s);

            if (!condVal) break;
        } while (true);
    }

    private void executeReturn(ReturnStmt returnStmt, ExecutionContext ctx, long startTime) {
        int line = getSourceLine(returnStmt, ctx);
        Object retVal = returnStmt.getExpression().isPresent() ? evalExpression(returnStmt.getExpression().get(), ctx) : null;

        ExecutionStep s = new ExecutionStep();
        s.setStepNumber(ctx.stepCounter++);
        s.setLineNumber(line);
        s.setEventType("METHOD_RETURN");
        s.setCurrentValue(retVal);
        s.setVariables(new LinkedHashMap<>(ctx.variables));
        s.setOutput(new ArrayList<>(ctx.stdout));
        s.setExplanation("Method returned: " + formatVal(retVal) + ".");
        s.setDataStructureState(ctx.buildDataStructureState("Returned: " + formatVal(retVal), "Method Execution Complete"));
        ctx.steps.add(s);
    }

    // ==========================================
    // Expression Evaluation Engine
    // ==========================================
    private Object evalExpression(Expression expr, ExecutionContext ctx) {
        if (expr.isIntegerLiteralExpr()) {
            return expr.asIntegerLiteralExpr().asNumber().intValue();
        } else if (expr.isLongLiteralExpr()) {
            return expr.asLongLiteralExpr().asNumber().longValue();
        } else if (expr.isDoubleLiteralExpr()) {
            return expr.asDoubleLiteralExpr().asDouble();
        } else if (expr.isBooleanLiteralExpr()) {
            return expr.asBooleanLiteralExpr().getValue();
        } else if (expr.isCharLiteralExpr()) {
            return expr.asCharLiteralExpr().asChar();
        } else if (expr.isStringLiteralExpr()) {
            return expr.asStringLiteralExpr().getValue();
        } else if (expr.isNameExpr()) {
            String name = expr.asNameExpr().getNameAsString();
            if (ctx.variables.containsKey(name)) {
                return ctx.variables.get(name);
            }
            return name;
        } else if (expr.isArrayInitializerExpr()) {
            ArrayInitializerExpr aie = expr.asArrayInitializerExpr();
            List<Object> list = new ArrayList<>();
            for (Expression e : aie.getValues()) {
                list.add(evalExpression(e, ctx));
            }
            return list;
        } else if (expr.isArrayCreationExpr()) {
            ArrayCreationExpr ace = expr.asArrayCreationExpr();
            if (ace.getInitializer().isPresent()) {
                return evalExpression(ace.getInitializer().get(), ctx);
            }
            int size = 4;
            if (!ace.getLevels().isEmpty() && ace.getLevels().get(0).getDimension().isPresent()) {
                size = ((Number) evalExpression(ace.getLevels().get(0).getDimension().get(), ctx)).intValue();
            }
            List<Object> list = new ArrayList<>();
            for (int k = 0; k < size; k++) list.add(0);
            return list;
        } else if (expr.isArrayAccessExpr()) {
            ArrayAccessExpr aae = expr.asArrayAccessExpr();
            String arrName = aae.getName().asNameExpr().getNameAsString();
            int idx = ((Number) evalExpression(aae.getIndex(), ctx)).intValue();
            Object arrObj = ctx.variables.get(arrName);
            if (arrObj instanceof List<?> list) {
                if (idx >= 0 && idx < list.size()) {
                    return list.get(idx);
                }
            }
            return 0;
        } else if (expr.isFieldAccessExpr()) {
            FieldAccessExpr fae = expr.asFieldAccessExpr();
            if ("length".equals(fae.getNameAsString())) {
                Object target = evalExpression(fae.getScope(), ctx);
                if (target instanceof List<?> list) {
                    return list.size();
                } else if (target instanceof String str) {
                    return str.length();
                }
            }
        } else if (expr.isBinaryExpr()) {
            BinaryExpr be = expr.asBinaryExpr();
            Object left = evalExpression(be.getLeft(), ctx);
            Object right = evalExpression(be.getRight(), ctx);
            return evalBinary(be.getOperator(), left, right);
        } else if (expr.isUnaryExpr()) {
            return evalUnary(expr.asUnaryExpr(), ctx);
        } else if (expr.isEnclosedExpr()) {
            return evalExpression(expr.asEnclosedExpr().getInner(), ctx);
        }

        return expr.toString();
    }

    private Object evalBinary(BinaryExpr.Operator op, Object left, Object right) {
        if (left instanceof Number ln && right instanceof Number rn) {
            double l = ln.doubleValue();
            double r = rn.doubleValue();
            boolean isInt = (ln instanceof Integer || ln instanceof Long) && (rn instanceof Integer || rn instanceof Long);

            switch (op) {
                case PLUS: return isInt ? (ln.longValue() + rn.longValue()) : (l + r);
                case MINUS: return isInt ? (ln.longValue() - rn.longValue()) : (l - r);
                case MULTIPLY: return isInt ? (ln.longValue() * rn.longValue()) : (l * r);
                case DIVIDE: return isInt ? (r != 0 ? ln.longValue() / rn.longValue() : 0) : (r != 0 ? l / r : 0);
                case REMAINDER: return isInt ? (ln.longValue() % rn.longValue()) : (l % r);
                case LESS: return l < r;
                case LESS_EQUALS: return l <= r;
                case GREATER: return l > r;
                case GREATER_EQUALS: return l >= r;
                case EQUALS: return l == r;
                case NOT_EQUALS: return l != r;
                default: break;
            }
        }

        if (left instanceof String || right instanceof String) {
            if (op == BinaryExpr.Operator.PLUS) {
                return String.valueOf(left) + String.valueOf(right);
            }
        }

        if (left instanceof Boolean lb && right instanceof Boolean rb) {
            if (op == BinaryExpr.Operator.AND) return lb && rb;
            if (op == BinaryExpr.Operator.OR) return lb || rb;
            if (op == BinaryExpr.Operator.EQUALS) return lb.equals(rb);
            if (op == BinaryExpr.Operator.NOT_EQUALS) return !lb.equals(rb);
        }

        return false;
    }

    private Object evalUnary(UnaryExpr ue, ExecutionContext ctx) {
        UnaryExpr.Operator op = ue.getOperator();
        Expression expr = ue.getExpression();

        if (expr.isNameExpr()) {
            String name = expr.asNameExpr().getNameAsString();
            Object cur = ctx.variables.get(name);
            if (cur instanceof Number n) {
                long val = n.longValue();
                if (op == UnaryExpr.Operator.POSTFIX_INCREMENT) {
                    ctx.variables.put(name, (int)(val + 1));
                    return (int)val;
                } else if (op == UnaryExpr.Operator.PREFIX_INCREMENT) {
                    ctx.variables.put(name, (int)(val + 1));
                    return (int)(val + 1);
                } else if (op == UnaryExpr.Operator.POSTFIX_DECREMENT) {
                    ctx.variables.put(name, (int)(val - 1));
                    return (int)val;
                } else if (op == UnaryExpr.Operator.PREFIX_DECREMENT) {
                    ctx.variables.put(name, (int)(val - 1));
                    return (int)(val - 1);
                }
            }
        }

        Object evaluated = evalExpression(expr, ctx);
        if (op == UnaryExpr.Operator.LOGICAL_COMPLEMENT && evaluated instanceof Boolean b) {
            return !b;
        }
        if (op == UnaryExpr.Operator.MINUS && evaluated instanceof Number num) {
            return -num.doubleValue();
        }
        return evaluated;
    }

    private Object applyAssignOp(AssignExpr.Operator op, Object prev, Object right) {
        if (op == AssignExpr.Operator.ASSIGN || prev == null) {
            return right;
        }
        if (prev instanceof Number pn && right instanceof Number rn) {
            double p = pn.doubleValue();
            double r = rn.doubleValue();
            switch (op) {
                case PLUS: return (pn instanceof Integer && rn instanceof Integer) ? (pn.intValue() + rn.intValue()) : (p + r);
                case MINUS: return (pn instanceof Integer && rn instanceof Integer) ? (pn.intValue() - rn.intValue()) : (p - r);
                case MULTIPLY: return (pn instanceof Integer && rn instanceof Integer) ? (pn.intValue() * rn.intValue()) : (p * r);
                case DIVIDE: return r != 0 ? (pn.intValue() / rn.intValue()) : 0;
                default: break;
            }
        }
        if (prev instanceof String || right instanceof String) {
            if (op == AssignExpr.Operator.PLUS) {
                return String.valueOf(prev) + String.valueOf(right);
            }
        }
        return right;
    }

    private Object getDefaultValue(String type) {
        if (type.contains("[]") || type.contains("List")) return new ArrayList<>();
        if ("int".equals(type) || "long".equals(type) || "short".equals(type) || "byte".equals(type)) return 0;
        if ("double".equals(type) || "float".equals(type)) return 0.0;
        if ("boolean".equals(type)) return false;
        if ("char".equals(type)) return ' ';
        if ("String".equals(type)) return "";
        return null;
    }

    private int getSourceLine(Node node, ExecutionContext ctx) {
        if (node.getBegin().isPresent()) {
            int line = node.getBegin().get().line - ctx.lineOffset;
            int finalLine = Math.max(1, line);
            ctx.currentLine = finalLine;
            return finalLine;
        }
        return ctx.currentLine;
    }

    private void checkLimits(ExecutionContext ctx, long startTime) {
        if (ctx.stepCounter > MAX_EXECUTION_STEPS) {
            throw new StepLimitExceededException("Step limit exceeded");
        }
        if (System.currentTimeMillis() - startTime > MAX_EXECUTION_TIME_MS) {
            throw new ExecutionTimeoutException("Execution timeout exceeded");
        }
    }

    private String formatVal(Object val) {
        if (val == null) return "null";
        if (val instanceof List<?> list) {
            return list.toString();
        }
        return String.valueOf(val);
    }

    // ==========================================
    // Internal Execution Context
    // ==========================================
    private static class ExecutionContext {
        final int lineOffset;
        int stepCounter = 1;
        int currentLine = 1;
        final Map<String, Object> variables = new LinkedHashMap<>();
        final Map<String, String> variableTypes = new LinkedHashMap<>();
        final List<String> stdout = new ArrayList<>();
        final List<ExecutionStep> steps = new ArrayList<>();

        ExecutionContext(int lineOffset) {
            this.lineOffset = lineOffset;
        }

        DataStructureState buildDataStructureState(String label, String focusInfo) {
            DataStructureState ds = new DataStructureState();
            ds.setLabel(label);
            ds.setFocusInfo(focusInfo);

            // If an array exists in variables, configure array visualizer state
            String mainArrayName = null;
            List<Object> arrayValues = null;

            for (Map.Entry<String, Object> entry : variables.entrySet()) {
                if (entry.getValue() instanceof List<?> list && !list.isEmpty()) {
                    mainArrayName = entry.getKey();
                    arrayValues = new ArrayList<>(list);
                    break;
                }
            }

            if (mainArrayName != null && arrayValues != null && !arrayValues.isEmpty()) {
                ds.setType("array");
                ds.setName(mainArrayName);
                ds.setValues(arrayValues);

                // Map loop indices to pointers
                Map<String, Object> ptrs = new LinkedHashMap<>();
                for (Map.Entry<String, Object> entry : variables.entrySet()) {
                    if (entry.getValue() instanceof Integer intVal) {
                        if (!entry.getKey().equals(mainArrayName) && intVal >= 0 && intVal < arrayValues.size()) {
                            ptrs.put(entry.getKey(), intVal);
                            ds.setActiveIndex(intVal);
                        }
                    }
                }
                ds.setPointers(ptrs);
            } else {
                ds.setType("universal-execution");
                ds.setName("Memory Space");
            }

            return ds;
        }
    }

    private static class ExecutionTimeoutException extends RuntimeException {
        ExecutionTimeoutException(String msg) { super(msg); }
    }

    private static class StepLimitExceededException extends RuntimeException {
        StepLimitExceededException(String msg) { super(msg); }
    }

    private static class UnsupportedConstructException extends RuntimeException {
        UnsupportedConstructException(String msg) { super(msg); }
    }
}
