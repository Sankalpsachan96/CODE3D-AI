/**
 * CODE3D-AI - C Language Adapter
 * 
 * Safely parses C source code, primitive arrays, loops, and printf calls into normalized traces.
 */

import { LanguageAdapter } from './LanguageAdapter.js';
import { TraceBuilder, TraceEventType } from '../TraceBuilder.js';
import { ExecutionError } from '../ExecutionError.js';

export class CAdapter extends LanguageAdapter {
  constructor() {
    super('c');
  }

  detect(code) {
    const s = code.toLowerCase();
    return s.includes('#include <stdio.h>') ||
      s.includes('printf(') ||
      (s.includes('int main(') && !s.includes('cout') && !s.includes('class'));
  }

  validateSyntax(code) {
    if (!code || !code.trim()) {
      return { isValid: false, error: ExecutionError.createSyntaxError('C code is empty.', 1, 1) };
    }
    return { isValid: true };
  }

  execute(code, options = {}) {
    const validation = this.validateSyntax(code);
    if (!validation.isValid) throw validation.error;

    const builder = new TraceBuilder('c');
    const lines = code.split('\n');
    const variables = {};

    builder.addStep({
      lineNumber: 1,
      eventType: TraceEventType.PROGRAM_START,
      variables: {},
      explanation: 'C main() routine initialized.',
    });

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const raw = lines[i];
      const trimmed = raw.trim();

      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#include')) continue;

      // Primitive variable declaration
      const varMatch = trimmed.match(/(?:int|double|float|char|long)\s+([a-zA-Z_]\w*)\s*=\s*(.+?);?$/);
      if (varMatch && !trimmed.includes('[')) {
        const name = varMatch[1];
        const expr = varMatch[2].replace(/;$/, '').trim();
        const val = !isNaN(Number(expr)) ? Number(expr) : expr;
        const prev = variables[name] ?? null;
        variables[name] = val;

        builder.addStep({
          lineNumber: lineNum,
          eventType: TraceEventType.VARIABLE_DECLARATION,
          variables: { ...variables },
          changedVariable: name,
          previousValue: prev,
          currentValue: val,
          explanation: `Declared ${name} = ${val}.`,
        });
        continue;
      }

      // C array declaration: int arr[4] = {10, 20, 30, 40};
      const arrMatch = trimmed.match(/(?:int|double|float|char|long)\s+([a-zA-Z_]\w*)\s*\[\s*\d*\s*\]\s*=\s*\{([^}]+)\};?/);
      if (arrMatch) {
        const name = arrMatch[1];
        const elements = arrMatch[2].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
        variables[name] = elements;

        builder.addStep({
          lineNumber: lineNum,
          eventType: TraceEventType.VARIABLE_DECLARATION,
          variables: { ...variables },
          changedVariable: name,
          currentValue: elements,
          dataStructureState: {
            type: 'array',
            name,
            values: [...elements],
            label: `Stack array ${name}[${elements.length}] initialized`,
          },
          explanation: `Allocated contiguous stack array ${name}[${elements.length}].`,
        });
        continue;
      }

      // For loop: for (int i = 1; i <= 5; i++)
      const forMatch = trimmed.match(/for\s*\(\s*(?:int)?\s*([a-zA-Z_]\w*)\s*=\s*(\d+)\s*;\s*([a-zA-Z_]\w*)\s*(<=|<)\s*(\d+)\s*;\s*([a-zA-Z_]\w*)\+\+\s*\)\s*(?:\{(.+)\})?/);
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
          explanation: `C for loop initiated with ${iterVar} = ${startVal}.`,
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
            explanation: `Condition ${iter} ${op} ${endVal} is TRUE. Iterating with ${iterVar} = ${iter}.`,
          });

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
                explanation: `Assigned ${target} += ${addend} (new value = ${variables[target]}).`,
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
          explanation: `C loop terminated.`,
        });
        continue;
      }

      // printf statement: printf("%d", sum);
      const printMatch = trimmed.match(/printf\s*\(\s*["']([^"']*)["'](?:\s*,\s*(.+?))?\s*\);?/);
      if (printMatch) {
        const formatStr = printMatch[1];
        const arg = printMatch[2] ? printMatch[2].trim() : null;
        const out = arg && variables[arg] !== undefined ? variables[arg] : formatStr;

        builder.addStep({
          lineNumber: lineNum,
          eventType: TraceEventType.OUTPUT,
          variables: { ...variables },
          outputLine: out,
          explanation: `Standard output from printf: ${out}`,
        });
      }
    }

    builder.addStep({
      lineNumber: lines.length,
      eventType: TraceEventType.PROGRAM_END,
      variables: { ...variables },
      explanation: 'C program returned 0.',
    });

    return builder.build();
  }
}
