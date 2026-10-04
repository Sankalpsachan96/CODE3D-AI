/**
 * CODE3D-AI - Pure Java AST Simulator & Trace Generator
 * 
 * Step-by-step deterministic execution interpreter for validated Java ASTs.
 * Generates rich execution traces with:
 * - Atomic variable diffs (deep cloned snapshots)
 * - Exact condition evaluations (expression string, substituted values, boolean branch)
 * - Array access and update tracking with 3D pointers
 * - Terminal stdout stream capture
 * - Step explanations and pedagogical hints
 * - Sandboxed execution limits (max 1000 steps, bounds checking, zero-division protection)
 * Strictly sandbox-safe: no eval(), no Function().
 */

import { ASTNodeType } from './javaParser.js';

export const EventType = {
  PROGRAM_START: 'PROGRAM_START',
  VARIABLE_DECLARATION: 'VARIABLE_DECLARATION',
  ASSIGNMENT: 'ASSIGNMENT',
  CONDITION_CHECK: 'CONDITION_CHECK',
  LOOP_START: 'LOOP_START',
  LOOP_ITERATION: 'LOOP_ITERATION',
  ARRAY_ACCESS: 'ARRAY_ACCESS',
  ARRAY_UPDATE: 'ARRAY_UPDATE',
  OUTPUT: 'OUTPUT',
  PROGRAM_END: 'PROGRAM_END',
  ERROR: 'ERROR'
};

const MAX_STEPS = 1000;

export function simulateJavaAST(ast, customInput = null) {
  const steps = [];
  const stdout = [];
  const variables = {};
  const variableTypes = {};

  let stepNumber = 1;
  let activeArrayName = null;
  let activeArrayIndex = null;
  let previousArrayIndex = null;

  // Clone variable map deeply to prevent state mutation across historical steps
  const snapshotVariables = () => {
    const snap = {};
    for (const [k, v] of Object.entries(variables)) {
      if (Array.isArray(v)) {
        snap[k] = [...v];
      } else {
        snap[k] = v;
      }
    }
    return snap;
  };

  const getPrimaryArray = () => {
    if (activeArrayName && Array.isArray(variables[activeArrayName])) {
      return { name: activeArrayName, values: [...variables[activeArrayName]] };
    }
    // Search for first array in variables
    for (const [k, v] of Object.entries(variables)) {
      if (Array.isArray(v)) {
        return { name: k, values: [...v] };
      }
    }
    return null;
  };

  const makeDataStructureState = (label = '', focusInfo = '', pointers = {}) => {
    const arrInfo = getPrimaryArray();
    if (arrInfo) {
      return {
        type: 'array',
        name: arrInfo.name,
        values: arrInfo.values,
        activeIndex: activeArrayIndex,
        previousIndex: previousArrayIndex,
        pointers,
        label,
        focusInfo,
        variableTypes: { ...variableTypes }
      };
    }

    // Fallback: Variables / registers state
    return {
      type: 'universal-execution',
      name: 'Memory Registers',
      values: [],
      variables: snapshotVariables(),
      variableTypes: { ...variableTypes },
      label: label || 'Program Registers',
      focusInfo: focusInfo || 'CPU memory state'
    };
  };

  const addStep = ({
    lineNumber,
    eventType,
    explanation,
    aiHint = null,
    changedVariable = null,
    previousValue = null,
    currentValue = null,
    condition = null,
    operation = null,
    pointers = {},
    customDsState = null
  }) => {
    if (steps.length >= MAX_STEPS) {
      throw new Error(`Infinite Loop Protection: Maximum execution step limit (${MAX_STEPS}) exceeded.`);
    }

    const dsState = customDsState || makeDataStructureState(
      explanation,
      aiHint || (condition ? `Evaluating ${condition.expression}` : ''),
      pointers
    );

    const step = {
      stepNumber: stepNumber++,
      lineNumber: lineNumber || 1,
      eventType,
      explanation,
      aiHint: aiHint || (eventType === EventType.CONDITION_CHECK ? 'Check if branch condition satisfies predicate.' : null),
      variables: snapshotVariables(),
      changedVariable,
      previousValue,
      currentValue,
      condition,
      output: [...stdout],
      dataStructureState: dsState,
      operation
    };

    steps.push(step);
  };

  // PROGRAM_START step
  addStep({
    lineNumber: ast.body[0]?.line || 1,
    eventType: EventType.PROGRAM_START,
    explanation: 'Program execution started. Allocating call stack and initial runtime environment.',
    aiHint: 'The execution begins from the top of the program or main entry method.'
  });

  try {
    for (const stmt of ast.body) {
      executeStatement(stmt);
    }

    // PROGRAM_END step
    addStep({
      lineNumber: ast.body[ast.body.length - 1]?.line || 1,
      eventType: EventType.PROGRAM_END,
      explanation: 'Program execution completed successfully.',
      aiHint: 'All statements processed. Final variable states and output verified.'
    });

  } catch (err) {
    addStep({
      lineNumber: err.line || (steps[steps.length - 1]?.lineNumber || 1),
      eventType: EventType.ERROR,
      explanation: `Execution Halted: ${err.message}`,
      aiHint: err.suggestion || 'Review the exception cause and line number.'
    });
  }

  return steps;

  // -------------------------------------------------------------
  // STATEMENT EXECUTOR
  // -------------------------------------------------------------
  function executeStatement(stmt) {
    if (!stmt) return;

    switch (stmt.type) {
      case ASTNodeType.BLOCK: {
        for (const s of stmt.statements) {
          executeStatement(s);
        }
        break;
      }

      case ASTNodeType.VARIABLE_DECLARATION: {
        for (const decl of stmt.declarations) {
          const varName = decl.id;
          const varType = decl.varType;
          variableTypes[varName] = varType;

          let val = null;
          let prev = variables[varName] !== undefined ? variables[varName] : null;

          if (decl.init) {
            val = evaluateExpression(decl.init);
          } else {
            // Default Java values
            if (varType.endsWith('[]')) val = null;
            else if (varType === 'int' || varType === 'long') val = 0;
            else if (varType === 'double' || varType === 'float') val = 0.0;
            else if (varType === 'boolean') val = false;
            else val = null;
          }

          if (Array.isArray(val)) {
            activeArrayName = varName;
          }

          variables[varName] = val;

          addStep({
            lineNumber: decl.line,
            eventType: EventType.VARIABLE_DECLARATION,
            explanation: `Declared ${varType} '${varName}' initialized to ${formatVal(val)}.`,
            aiHint: Array.isArray(val)
              ? `Memory allocated for ${val.length} slots in array '${varName}'.`
              : `Variable '${varName}' stored in local stack memory with value ${formatVal(val)}.`,
            changedVariable: varName,
            previousValue: prev,
            currentValue: formatVal(val),
            operation: { type: 'DECLARATION', target: varName, value: val }
          });
        }
        break;
      }

      case ASTNodeType.EXPRESSION_STATEMENT: {
        evaluateExpression(stmt.expression, true);
        break;
      }

      case ASTNodeType.IF_STATEMENT: {
        const testRes = evaluateConditionWithTrace(stmt.test, stmt.line);
        if (testRes.result) {
          executeStatement(stmt.consequent);
        } else if (stmt.alternate) {
          executeStatement(stmt.alternate);
        }
        break;
      }

      case ASTNodeType.WHILE_STATEMENT: {
        while (true) {
          const testRes = evaluateConditionWithTrace(stmt.test, stmt.line);
          if (!testRes.result) break;
          executeStatement(stmt.body);
        }
        break;
      }

      case ASTNodeType.FOR_STATEMENT: {
        // Init
        if (stmt.init) {
          if (stmt.init.type === ASTNodeType.VARIABLE_DECLARATION) {
            executeStatement(stmt.init);
          } else {
            evaluateExpression(stmt.init, true);
          }
        }

        // Loop condition & body iterations
        let loopIter = 1;
        while (true) {
          if (stmt.test) {
            const testRes = evaluateConditionWithTrace(stmt.test, stmt.line);
            if (!testRes.result) break;
          }

          // Extract loop index pointers if any
          const currentPointers = {};
          if (variables.i !== undefined) currentPointers.i = variables.i;
          if (variables.j !== undefined) currentPointers.j = variables.j;

          addStep({
            lineNumber: stmt.line,
            eventType: EventType.LOOP_ITERATION,
            explanation: `Entering iteration ${loopIter} of for-loop.`,
            aiHint: 'Executing statements within the loop body block.',
            pointers: currentPointers
          });

          executeStatement(stmt.body);

          // Update
          if (stmt.update) {
            evaluateExpression(stmt.update, true);
          }

          loopIter++;
        }
        break;
      }

      case ASTNodeType.SYSTEM_OUT_PRINT: {
        let printed = '';
        if (stmt.argument) {
          const val = evaluateExpression(stmt.argument);
          printed = formatVal(val);
        }
        stdout.push(printed);

        addStep({
          lineNumber: stmt.line,
          eventType: EventType.OUTPUT,
          explanation: `System.out.println() output: "${printed}" printed to terminal.`,
          aiHint: 'Standard output stream received new console line.',
          changedVariable: 'stdout',
          previousValue: null,
          currentValue: printed,
          operation: { type: 'PRINT', value: printed }
        });
        break;
      }

      case ASTNodeType.RETURN_STATEMENT: {
        let retVal = null;
        if (stmt.argument) {
          retVal = evaluateExpression(stmt.argument);
        }
        addStep({
          lineNumber: stmt.line,
          eventType: EventType.PROGRAM_END,
          explanation: `Method return reached with value: ${formatVal(retVal)}.`,
          aiHint: 'Execution returning to caller.'
        });
        break;
      }

      case ASTNodeType.BREAK_STATEMENT: {
        addStep({
          lineNumber: stmt.line,
          eventType: EventType.ASSIGNMENT,
          explanation: 'Break statement encountered. Exiting active loop construct.',
          aiHint: 'Execution jumps past the end of the enclosing loop.'
        });
        break;
      }

      case ASTNodeType.CONTINUE_STATEMENT: {
        addStep({
          lineNumber: stmt.line,
          eventType: EventType.ASSIGNMENT,
          explanation: 'Continue statement encountered. Skipping to next iteration.',
          aiHint: 'Execution proceeds immediately to the loop update and condition check.'
        });
        break;
      }

      default:
        break;
    }
  }

  // -------------------------------------------------------------
  // CONDITION EVALUATOR WITH STEP TRACE
  // -------------------------------------------------------------
  function evaluateConditionWithTrace(condExpr, line) {
    const rawExprStr = formatExpressionString(condExpr);
    const evalExprStr = formatEvaluatedExpressionString(condExpr);
    const result = Boolean(evaluateExpression(condExpr));

    const currentPointers = {};
    if (variables.i !== undefined) currentPointers.i = variables.i;
    if (variables.j !== undefined) currentPointers.j = variables.j;

    addStep({
      lineNumber: line || condExpr.line || 1,
      eventType: EventType.CONDITION_CHECK,
      explanation: `Condition check: '${rawExprStr}' evaluated as (${evalExprStr}) → ${result ? 'TRUE ✓' : 'FALSE ✗'}.`,
      aiHint: result
        ? 'Condition is satisfied: entering block branch.'
        : 'Condition is not satisfied: skipping branch or terminating loop.',
      condition: {
        expression: rawExprStr,
        evaluation: evalExprStr,
        result: result,
        branch: result ? 'BRANCH TRUE' : 'BRANCH FALSE'
      },
      pointers: currentPointers
    });

    return { result, rawExprStr, evalExprStr };
  }

  // -------------------------------------------------------------
  // EXPRESSION EVALUATOR
  // -------------------------------------------------------------
  function evaluateExpression(expr, isStatement = false) {
    if (!expr) return null;

    switch (expr.type) {
      case ASTNodeType.LITERAL:
        return expr.value;

      case ASTNodeType.IDENTIFIER: {
        if (!variables.hasOwnProperty(expr.name)) {
          throw {
            line: expr.line,
            message: `Variable '${expr.name}' has not been declared or initialized.`
          };
        }
        return variables[expr.name];
      }

      case ASTNodeType.ARRAY_ACCESS: {
        const arr = evaluateExpression(expr.array);
        const idx = evaluateExpression(expr.index);

        if (!Array.isArray(arr)) {
          throw { line: expr.line, message: 'Attempted to index a non-array variable.' };
        }
        if (typeof idx !== 'number' || isNaN(idx)) {
          throw { line: expr.line, message: `Array index must be an integer, got: ${idx}` };
        }
        if (idx < 0 || idx >= arr.length) {
          throw {
            line: expr.line,
            message: `ArrayIndexOutOfBoundsException: Index ${idx} out of bounds for length ${arr.length}`
          };
        }

        previousArrayIndex = activeArrayIndex;
        activeArrayIndex = idx;
        const val = arr[idx];

        const pointers = {};
        if (variables.i !== undefined) pointers.i = variables.i;
        if (variables.j !== undefined) pointers.j = variables.j;

        addStep({
          lineNumber: expr.line,
          eventType: EventType.ARRAY_ACCESS,
          explanation: `Accessed array slot [${idx}] = ${formatVal(val)}.`,
          aiHint: `Reading value at index ${idx}.`,
          currentValue: val,
          pointers,
          operation: { type: 'ACCESS', index: idx, value: val }
        });

        return val;
      }

      case ASTNodeType.ASSIGNMENT: {
        const rightVal = evaluateExpression(expr.right);
        const op = expr.operator;

        if (expr.left.type === ASTNodeType.IDENTIFIER) {
          const varName = expr.left.name;
          const prevVal = variables[varName];
          let newVal;

          if (op === '=') newVal = rightVal;
          else if (op === '+=') newVal = prevVal + rightVal;
          else if (op === '-=') newVal = prevVal - rightVal;
          else if (op === '*=') newVal = prevVal * rightVal;
          else if (op === '/=') {
            if (rightVal === 0) throw { line: expr.line, message: 'ArithmeticException: / by zero' };
            newVal = Math.floor(prevVal / rightVal);
          } else if (op === '%=') {
            if (rightVal === 0) throw { line: expr.line, message: 'ArithmeticException: / by zero' };
            newVal = prevVal % rightVal;
          }

          if (Array.isArray(newVal)) {
            activeArrayName = varName;
          }

          variables[varName] = newVal;

          const currentPointers = {};
          if (variables.i !== undefined) currentPointers.i = variables.i;
          if (variables.j !== undefined) currentPointers.j = variables.j;

          addStep({
            lineNumber: expr.line,
            eventType: EventType.ASSIGNMENT,
            explanation: `Updated variable '${varName}' = ${formatVal(newVal)} (was ${formatVal(prevVal)}).`,
            aiHint: `Value assigned to '${varName}'.`,
            changedVariable: varName,
            previousValue: prevVal,
            currentValue: formatVal(newVal),
            pointers: currentPointers,
            operation: { type: 'ASSIGNMENT', target: varName, value: newVal }
          });

          return newVal;
        }

        if (expr.left.type === ASTNodeType.ARRAY_ACCESS) {
          const arr = evaluateExpression(expr.left.array);
          const idx = evaluateExpression(expr.left.index);
          const arrayName = expr.left.array.type === ASTNodeType.IDENTIFIER ? expr.left.array.name : 'arr';

          if (!Array.isArray(arr)) {
            throw { line: expr.line, message: 'Cannot assign to element of non-array.' };
          }
          if (idx < 0 || idx >= arr.length) {
            throw { line: expr.line, message: `ArrayIndexOutOfBoundsException: Index ${idx} out of bounds for length ${arr.length}` };
          }

          const prevSlotVal = arr[idx];
          let newSlotVal;

          if (op === '=') newSlotVal = rightVal;
          else if (op === '+=') newSlotVal = prevSlotVal + rightVal;
          else if (op === '-=') newSlotVal = prevSlotVal - rightVal;
          else if (op === '*=') newSlotVal = prevSlotVal * rightVal;
          else if (op === '/=') newSlotVal = Math.floor(prevSlotVal / rightVal);
          else if (op === '%=') newSlotVal = prevSlotVal % rightVal;

          arr[idx] = newSlotVal;
          previousArrayIndex = activeArrayIndex;
          activeArrayIndex = idx;
          activeArrayName = arrayName;

          const currentPointers = {};
          if (variables.i !== undefined) currentPointers.i = variables.i;
          if (variables.j !== undefined) currentPointers.j = variables.j;

          addStep({
            lineNumber: expr.line,
            eventType: EventType.ARRAY_UPDATE,
            explanation: `Updated ${arrayName}[${idx}] = ${newSlotVal} (was ${prevSlotVal}).`,
            aiHint: `Array slot at index ${idx} mutated in 3D WebGL memory.`,
            changedVariable: `${arrayName}[${idx}]`,
            previousValue: prevSlotVal,
            currentValue: newSlotVal,
            pointers: currentPointers,
            operation: { type: 'UPDATE', index: idx, value: newSlotVal }
          });

          return newSlotVal;
        }

        throw { line: expr.line, message: 'Invalid assignment left-hand side.' };
      }

      case ASTNodeType.UPDATE: {
        const isInc = expr.operator === '++';
        const isPrefix = expr.prefix;

        if (expr.argument.type === ASTNodeType.IDENTIFIER) {
          const varName = expr.argument.name;
          const oldVal = variables[varName];
          const newVal = isInc ? oldVal + 1 : oldVal - 1;
          variables[varName] = newVal;

          const currentPointers = {};
          if (variables.i !== undefined) currentPointers.i = variables.i;
          if (variables.j !== undefined) currentPointers.j = variables.j;

          addStep({
            lineNumber: expr.line,
            eventType: EventType.ASSIGNMENT,
            explanation: `${isInc ? 'Incremented' : 'Decremented'} '${varName}' to ${newVal} (${oldVal} ${expr.operator}).`,
            aiHint: `Loop counter or variable '${varName}' updated.`,
            changedVariable: varName,
            previousValue: oldVal,
            currentValue: newVal,
            pointers: currentPointers,
            operation: { type: 'UPDATE', target: varName, value: newVal }
          });

          return isPrefix ? newVal : oldVal;
        }

        if (expr.argument.type === ASTNodeType.ARRAY_ACCESS) {
          const arr = evaluateExpression(expr.argument.array);
          const idx = evaluateExpression(expr.argument.index);
          const oldVal = arr[idx];
          const newVal = isInc ? oldVal + 1 : oldVal - 1;
          arr[idx] = newVal;

          addStep({
            lineNumber: expr.line,
            eventType: EventType.ARRAY_UPDATE,
            explanation: `${isInc ? 'Incremented' : 'Decremented'} arr[${idx}] to ${newVal}.`,
            aiHint: `Array element updated.`,
            previousValue: oldVal,
            currentValue: newVal,
            operation: { type: 'UPDATE', index: idx, value: newVal }
          });

          return isPrefix ? newVal : oldVal;
        }

        throw { line: expr.line, message: 'Invalid update expression target.' };
      }

      case ASTNodeType.BINARY_EXPRESSION: {
        const left = evaluateExpression(expr.left);
        const right = evaluateExpression(expr.right);
        const op = expr.operator;

        switch (op) {
          case '+': return (typeof left === 'string' || typeof right === 'string') ? String(left) + String(right) : left + right;
          case '-': return left - right;
          case '*': return left * right;
          case '/':
            if (right === 0) throw { line: expr.line, message: 'ArithmeticException: / by zero' };
            return typeof left === 'number' && typeof right === 'number' && Number.isInteger(left) && Number.isInteger(right)
              ? Math.trunc(left / right)
              : left / right;
          case '%':
            if (right === 0) throw { line: expr.line, message: 'ArithmeticException: / by zero' };
            return left % right;
          case '==': return left === right;
          case '!=': return left !== right;
          case '<': return left < right;
          case '<=': return left <= right;
          case '>': return left > right;
          case '>=': return left >= right;
          case '&&': return Boolean(left && right);
          case '||': return Boolean(left || right);
          default:
            throw { line: expr.line, message: `Unknown operator: ${op}` };
        }
      }

      case ASTNodeType.UNARY_EXPRESSION: {
        const arg = evaluateExpression(expr.argument);
        if (expr.operator === '!') return !arg;
        if (expr.operator === '-') return -arg;
        throw { line: expr.line, message: `Unknown unary operator: ${expr.operator}` };
      }

      case ASTNodeType.MEMBER_ACCESS: {
        const obj = evaluateExpression(expr.object);
        if (Array.isArray(obj) && expr.property === 'length') {
          return obj.length;
        }
        if (typeof obj === 'string' && expr.property === 'length') {
          return obj.length;
        }
        throw { line: expr.line, message: `Cannot access property '.${expr.property}'.` };
      }

      case ASTNodeType.ARRAY_LITERAL: {
        return expr.elements.map(el => evaluateExpression(el));
      }

      case ASTNodeType.ARRAY_CREATION: {
        if (expr.elements) {
          return expr.elements.map(el => evaluateExpression(el));
        }
        if (expr.sizeExpression) {
          const size = evaluateExpression(expr.sizeExpression);
          if (typeof size !== 'number' || size < 0) {
            throw { line: expr.line, message: `NegativeArraySizeException: ${size}` };
          }
          const defaultVal = expr.elementType === 'String' ? '' : expr.elementType === 'boolean' ? false : 0;
          return new Array(size).fill(defaultVal);
        }
        return [];
      }

      default:
        throw { line: expr.line || 1, message: `Unsupported expression type: ${expr.type}` };
    }
  }

  // -------------------------------------------------------------
  // FORMATTING HELPERS FOR PEDAGOGICAL TRACE
  // -------------------------------------------------------------
  function formatVal(val) {
    if (val === null) return 'null';
    if (val === undefined) return 'undefined';
    if (Array.isArray(val)) return `[${val.join(', ')}]`;
    if (typeof val === 'string') return `"${val}"`;
    return String(val);
  }

  function formatExpressionString(expr) {
    if (!expr) return '';
    switch (expr.type) {
      case ASTNodeType.LITERAL: return formatVal(expr.value);
      case ASTNodeType.IDENTIFIER: return expr.name;
      case ASTNodeType.ARRAY_ACCESS: return `${formatExpressionString(expr.array)}[${formatExpressionString(expr.index)}]`;
      case ASTNodeType.MEMBER_ACCESS: return `${formatExpressionString(expr.object)}.${expr.property}`;
      case ASTNodeType.BINARY_EXPRESSION: return `${formatExpressionString(expr.left)} ${expr.operator} ${formatExpressionString(expr.right)}`;
      case ASTNodeType.UNARY_EXPRESSION: return `${expr.operator}${formatExpressionString(expr.argument)}`;
      default: return '';
    }
  }

  function formatEvaluatedExpressionString(expr) {
    if (!expr) return '';
    switch (expr.type) {
      case ASTNodeType.LITERAL: return String(expr.value);
      case ASTNodeType.IDENTIFIER: return String(variables[expr.name] !== undefined ? variables[expr.name] : expr.name);
      case ASTNodeType.ARRAY_ACCESS: {
        const idx = evaluateExpression(expr.index);
        const arr = evaluateExpression(expr.array);
        const val = Array.isArray(arr) ? arr[idx] : '?';
        return `${val}`;
      }
      case ASTNodeType.MEMBER_ACCESS: {
        const obj = evaluateExpression(expr.object);
        return Array.isArray(obj) ? String(obj.length) : expr.property;
      }
      case ASTNodeType.BINARY_EXPRESSION: {
        const l = formatEvaluatedExpressionString(expr.left);
        const r = formatEvaluatedExpressionString(expr.right);
        return `${l} ${expr.operator} ${r}`;
      }
      case ASTNodeType.UNARY_EXPRESSION: {
        const arg = formatEvaluatedExpressionString(expr.argument);
        return `${expr.operator}${arg}`;
      }
      default: return '';
    }
  }
}
