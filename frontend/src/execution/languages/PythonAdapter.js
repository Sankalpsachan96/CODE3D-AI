/**
 * CODE3D-AI - Python Language Adapter
 * 
 * Parses assignments, lists, range loops, and print statements into normalized trace events.
 */

import { LanguageAdapter } from './LanguageAdapter.js';
import { TraceBuilder, TraceEventType } from '../TraceBuilder.js';
import { ExecutionError } from '../ExecutionError.js';

export class PythonAdapter extends LanguageAdapter {
  constructor() {
    super('python');
  }

  detect(code) {
    const s = code.toLowerCase();
    return s.includes('def ') ||
      s.includes('print(') ||
      s.includes('in range(') ||
      s.includes('elif ') ||
      s.includes('import numpy');
  }

  validateSyntax(code) {
    if (!code || !code.trim()) {
      return { isValid: false, error: ExecutionError.createSyntaxError('Python code is empty.', 1, 1) };
    }
    return { isValid: true };
  }

  execute(code, options = {}) {
    const validation = this.validateSyntax(code);
    if (!validation.isValid) throw validation.error;

    const builder = new TraceBuilder('python');
    const lines = code.split('\n');
    const variables = {};

    builder.addStep({
      lineNumber: 1,
      eventType: TraceEventType.PROGRAM_START,
      variables: {},
      explanation: 'Python interpreter started.',
    });

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const raw = lines[i];
      const trimmed = raw.trim();

      if (!trimmed || trimmed.startsWith('#')) continue;

      // Variable assignment: x = 10 or arr = [1, 2, 3]
      const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (assignMatch && !trimmed.startsWith('for ')) {
        const name = assignMatch[1];
        const expr = assignMatch[2].trim();

        let val;
        try {
          if (expr.startsWith('[') && expr.endsWith(']')) {
            val = JSON.parse(expr);
          } else if (!isNaN(Number(expr))) {
            val = Number(expr);
          } else if (expr === 'True' || expr === 'False') {
            val = expr === 'True';
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
            label: `List ${name} initialized with ${val.length} elements`,
          } : {
            type: 'array',
            values: [],
          },
          explanation: `Assigned ${name} = ${JSON.stringify(val)}.`,
        });
        continue;
      }

      // For in range loop: for i in range(1, 6):
      const rangeMatch = trimmed.match(/for\s+([a-zA-Z_]\w*)\s+in\s+range\s*\(\s*(\d+)\s*(?:,\s*(\d+))?\s*\)\s*:/);
      if (rangeMatch) {
        const iterVar = rangeMatch[1];
        let startVal = 0;
        let endVal = parseInt(rangeMatch[2], 10);
        if (rangeMatch[3]) {
          startVal = parseInt(rangeMatch[2], 10);
          endVal = parseInt(rangeMatch[3], 10);
        }

        builder.addStep({
          lineNumber: lineNum,
          eventType: TraceEventType.LOOP_START,
          variables: { ...variables, [iterVar]: startVal },
          changedVariable: iterVar,
          currentValue: startVal,
          explanation: `Initialized loop counter ${iterVar} = ${startVal}.`,
        });

        // Scan subsequent indented lines for loop body
        const loopBody = [];
        let j = i + 1;
        while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t'))) {
          loopBody.push({ lineNum: j + 1, content: lines[j].trim() });
          j++;
        }

        for (let iter = startVal; iter < endVal; iter++) {
          variables[iterVar] = iter;

          builder.addStep({
            lineNumber: lineNum,
            eventType: TraceEventType.LOOP_ITERATION,
            variables: { ...variables },
            condition: {
              expression: `${iter} < ${endVal}`,
              result: true,
            },
            explanation: `Loop condition ${iter} < ${endVal} is TRUE. Iterating with ${iterVar} = ${iter}.`,
          });

          // Execute body lines
          for (const bodyLine of loopBody) {
            const bodyAssign = bodyLine.content.match(/([a-zA-Z_]\w*)\s*\+=\s*([a-zA-Z_]\w*|\d+)/);
            if (bodyAssign) {
              const target = bodyAssign[1];
              const addend = bodyAssign[2] === iterVar ? iter : (parseInt(bodyAssign[2], 10) || 0);
              const prev = variables[target] || 0;
              variables[target] = prev + addend;

              builder.addStep({
                lineNumber: bodyLine.lineNum,
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
            expression: `${endVal} < ${endVal}`,
            result: false,
          },
          explanation: `Loop ended. Reached range upper bound ${endVal}.`,
        });

        i = j - 1; // Advance past body
        continue;
      }

      // Print statement: print(val)
      const printMatch = trimmed.match(/print\s*\((.+?)\)/);
      if (printMatch) {
        const arg = printMatch[1].trim();
        const out = variables[arg] !== undefined ? variables[arg] : arg.replace(/['"]/g, '');
        builder.addStep({
          lineNumber: lineNum,
          eventType: TraceEventType.OUTPUT,
          variables: { ...variables },
          outputLine: out,
          explanation: `Printed to stdout: ${out}`,
        });
      }
    }

    builder.addStep({
      lineNumber: lines.length,
      eventType: TraceEventType.PROGRAM_END,
      variables: { ...variables },
      explanation: 'Python script completed.',
    });

    return builder.build();
  }
}
