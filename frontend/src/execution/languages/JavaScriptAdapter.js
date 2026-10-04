/**
 * CODE3D-AI - JavaScript Language Adapter
 * 
 * Safely parses and simulates JavaScript source code into normalized execution events.
 */

import { LanguageAdapter } from './LanguageAdapter.js';
import { TraceBuilder, TraceEventType } from '../TraceBuilder.js';
import { ExecutionError } from '../ExecutionError.js';

export class JavaScriptAdapter extends LanguageAdapter {
  constructor() {
    super('javascript');
  }

  detect(code) {
    const s = code.toLowerCase();
    return s.includes('console.log') ||
      s.includes('let ') ||
      s.includes('const ') ||
      s.includes('function ') ||
      s.includes('=>');
  }

  validateSyntax(code) {
    if (!code || !code.trim()) {
      return { isValid: false, error: ExecutionError.createSyntaxError('Source code is empty.', 1, 1) };
    }
    // Check balanced brackets
    const stack = [];
    const lines = code.split('\n');
    for (let r = 0; r < lines.length; r++) {
      const line = lines[r];
      for (let c = 0; c < line.length; c++) {
        const ch = line[c];
        if (ch === '{' || ch === '(' || ch === '[') stack.push({ ch, line: r + 1, col: c + 1 });
        else if (ch === '}' || ch === ')' || ch === ']') {
          if (stack.length === 0) {
            return {
              isValid: false,
              error: ExecutionError.createSyntaxError(`Unmatched closing '${ch}'`, r + 1, c + 1, `Remove or balance '${ch}'`),
            };
          }
          const top = stack.pop();
          if ((ch === '}' && top.ch !== '{') || (ch === ')' && top.ch !== '(') || (ch === ']' && top.ch !== '[')) {
            return {
              isValid: false,
              error: ExecutionError.createSyntaxError(`Mismatched bracket '${top.ch}' closed by '${ch}'`, r + 1, c + 1),
            };
          }
        }
      }
    }

    if (stack.length > 0) {
      const top = stack.pop();
      return {
        isValid: false,
        error: ExecutionError.createSyntaxError(`Unclosed bracket '${top.ch}'`, top.line, top.col, `Add closing bracket matching '${top.ch}'`),
      };
    }

    return { isValid: true };
  }

  execute(code, options = {}) {
    const validation = this.validateSyntax(code);
    if (!validation.isValid) throw validation.error;

    const builder = new TraceBuilder('javascript');
    const lines = code.split('\n');
    const variables = {};

    builder.addStep({
      lineNumber: 1,
      eventType: TraceEventType.PROGRAM_START,
      variables: {},
      explanation: 'Program execution started in JavaScript environment.',
    });

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const raw = lines[i];
      const trimmed = raw.trim();

      if (!trimmed || trimmed.startsWith('//')) continue;

      // Variable declaration / assignment
      const varMatch = trimmed.match(/(?:let|const|var)\s+([a-zA-Z_]\w*)\s*=\s*(.+?);?$/);
      if (varMatch) {
        const name = varMatch[1];
        const expr = varMatch[2].replace(/;$/, '').trim();

        let val;
        try {
          if (expr.startsWith('[') && expr.endsWith(']')) {
            val = JSON.parse(expr);
          } else if (!isNaN(Number(expr))) {
            val = Number(expr);
          } else if (expr === 'true' || expr === 'false') {
            val = expr === 'true';
          } else if (variables[expr] !== undefined) {
            val = variables[expr];
          } else {
            val = expr;
          }
        } catch {
          val = expr;
        }

        const prev = variables[name] ?? null;
        variables[name] = val;

        const isArr = Array.isArray(val);
        builder.addStep({
          lineNumber: lineNum,
          eventType: TraceEventType.VARIABLE_DECLARATION,
          variables: { ...variables },
          changedVariable: name,
          previousValue: prev,
          currentValue: val,
          dataStructureState: isArr ? {
            type: 'array',
            name,
            values: [...val],
            label: `Array ${name} initialized with ${val.length} elements`,
          } : {
            type: 'array',
            values: [],
          },
          explanation: `Declared ${name} = ${JSON.stringify(val)}.`,
        });
        continue;
      }

      // Check for inline or multi-line for loops: for (let i = 1; i <= 5; i++)
      const forMatch = trimmed.match(/for\s*\(\s*(?:let|var)?\s*([a-zA-Z_]\w*)\s*=\s*(\d+)\s*;\s*([a-zA-Z_]\w*)\s*(<=|<)\s*(\d+)\s*;\s*([a-zA-Z_]\w*)\+\+\s*\)\s*(?:\{(.+)\})?/);
      if (forMatch) {
        const iterVar = forMatch[1];
        const startVal = parseInt(forMatch[2], 10);
        const op = forMatch[4];
        const endVal = parseInt(forMatch[5], 10);
        const inlineBody = forMatch[7] ? forMatch[7].trim() : null;

        builder.addStep({
          lineNumber: lineNum,
          eventType: TraceEventType.LOOP_START,
          variables: { ...variables, [iterVar]: startVal },
          changedVariable: iterVar,
          currentValue: startVal,
          explanation: `Initialized loop counter ${iterVar} = ${startVal}.`,
        });

        const limit = op === '<=' ? endVal : endVal - 1;
        for (let iter = startVal; iter <= limit; iter++) {
          variables[iterVar] = iter;

          builder.addStep({
            lineNumber: lineNum,
            eventType: TraceEventType.LOOP_ITERATION,
            variables: { ...variables },
            condition: {
              expression: `${iter} ${op} ${endVal}`,
              result: true,
            },
            explanation: `Loop condition ${iter} ${op} ${endVal} is TRUE. Iterating with ${iterVar} = ${iter}.`,
          });

          // If loop has inline body
          if (inlineBody) {
            const bodyAssign = inlineBody.match(/([a-zA-Z_]\w*)\s*\+=\s*([a-zA-Z_]\w*|\d+)/);
            if (bodyAssign) {
              const target = bodyAssign[1];
              const addend = bodyAssign[2] === iterVar ? iter : (parseInt(bodyAssign[2], 10) || 0);
              const prev = variables[target] || 0;
              variables[target] = prev + addend;

              builder.addStep({
                lineNumber: lineNum,
                eventType: TraceEventType.VARIABLE_ASSIGNMENT,
                variables: { ...variables },
                changedVariable: target,
                previousValue: prev,
                currentValue: variables[target],
                explanation: `Updated ${target} += ${addend} (new value = ${variables[target]}).`,
              });
            }
          }
        }

        builder.addStep({
          lineNumber: lineNum,
          eventType: TraceEventType.LOOP_END,
          variables: { ...variables },
          condition: {
            expression: `${limit + 1} ${op} ${endVal}`,
            result: false,
          },
          explanation: `Loop ended. Condition ${limit + 1} ${op} ${endVal} is FALSE.`,
        });
        continue;
      }

      // Console log
      const logMatch = trimmed.match(/console\.log\((.+?)\);?$/);
      if (logMatch) {
        const arg = logMatch[1].trim();
        const out = variables[arg] !== undefined ? variables[arg] : arg.replace(/['"]/g, '');
        builder.addStep({
          lineNumber: lineNum,
          eventType: TraceEventType.OUTPUT,
          variables: { ...variables },
          outputLine: out,
          explanation: `Printed to standard output: ${out}`,
        });
      }
    }

    builder.addStep({
      lineNumber: lines.length,
      eventType: TraceEventType.PROGRAM_END,
      variables: { ...variables },
      explanation: 'Program execution completed.',
    });

    return builder.build();
  }
}
