/**
 * CODE3D-AI - C++ Language Adapter
 * 
 * Safely parses C++ source, vectors, loops, and std::cout statements into normalized traces.
 */

import { LanguageAdapter } from './LanguageAdapter.js';
import { TraceBuilder, TraceEventType } from '../TraceBuilder.js';
import { ExecutionError } from '../ExecutionError.js';

export class CppAdapter extends LanguageAdapter {
  constructor() {
    super('cpp');
  }

  detect(code) {
    const s = code.toLowerCase();
    return s.includes('#include <iostream>') ||
      s.includes('std::cout') ||
      s.includes('cout <<') ||
      s.includes('vector<') ||
      s.includes('std::vector');
  }

  validateSyntax(code) {
    if (!code || !code.trim()) {
      return { isValid: false, error: ExecutionError.createSyntaxError('C++ code is empty.', 1, 1) };
    }
    return { isValid: true };
  }

  execute(code, options = {}) {
    const validation = this.validateSyntax(code);
    if (!validation.isValid) throw validation.error;

    const builder = new TraceBuilder('cpp');
    const lines = code.split('\n');
    const variables = {};

    builder.addStep({
      lineNumber: 1,
      eventType: TraceEventType.PROGRAM_START,
      variables: {},
      explanation: 'C++ main() execution started.',
    });

    for (let i = 0; i < lines.length; i++) {
      const lineNum = i + 1;
      const raw = lines[i];
      const trimmed = raw.trim();

      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('#include') || trimmed.startsWith('using namespace')) continue;

      // Variable declaration: int sum = 0; or vector<int> arr = {1, 2, 3};
      const varMatch = trimmed.match(/(?:int|double|float|long|bool|auto)\s+([a-zA-Z_]\w*)\s*=\s*(.+?);?$/);
      if (varMatch) {
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

      // Vector declaration: vector<int> arr = {10, 20, 30};
      const vecMatch = trimmed.match(/vector<\w+>\s+([a-zA-Z_]\w*)\s*=\s*\{([^}]+)\};?/);
      if (vecMatch) {
        const name = vecMatch[1];
        const elements = vecMatch[2].split(',').map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
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
            label: `Vector ${name} created with ${elements.length} elements`,
          },
          explanation: `Allocated std::vector<int> ${name} with ${elements.length} elements.`,
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
          explanation: `C++ for loop started with ${iterVar} = ${startVal}.`,
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
          explanation: `C++ loop terminated.`,
        });
        continue;
      }

      // std::cout statement
      const coutMatch = trimmed.match(/(?:std::)?cout\s*<<\s*([^;]+);/);
      if (coutMatch) {
        const expr = coutMatch[1].replace(/<<\s*(?:std::)?endl/g, '').trim();
        const out = variables[expr] !== undefined ? variables[expr] : expr.replace(/['"]/g, '');
        builder.addStep({
          lineNumber: lineNum,
          eventType: TraceEventType.OUTPUT,
          variables: { ...variables },
          outputLine: out,
          explanation: `Output stream: ${out}`,
        });
      }
    }

    builder.addStep({
      lineNumber: lines.length,
      eventType: TraceEventType.PROGRAM_END,
      variables: { ...variables },
      explanation: 'C++ program returned 0.',
    });

    return builder.build();
  }
}
