import { TraceAdapter, TraceEventType } from './TraceAdapter.js';

export class CppTraceAdapter extends TraceAdapter {
  constructor() {
    super('cpp');
  }

  async generateTrace(code, input = '', options = {}) {
    const lines = code.split('\n');
    const steps = [];
    let stepCount = 0;
    const variables = {};
    const outputLog = [];
    let activeArray = null;

    stepCount++;
    steps.push(
      this.createStep({
        stepNumber: stepCount,
        lineNumber: 1,
        eventType: TraceEventType.PROGRAM_START,
        variables,
        scope: 'main',
        explanation: 'C++ execution environment and main() entrypoint invoked.',
      })
    );

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      if (stepCount >= this.maxSteps) break;
      const rawLine = lines[lineIdx];
      const trimmed = rawLine.trim();
      const lineNum = lineIdx + 1;

      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('#include') || trimmed.startsWith('using namespace')) {
        continue;
      }

      // Vector or array declaration: vector<int> arr = {10, 20, 30}; or int arr[] = {10, 20, 30};
      const arrMatch = trimmed.match(/^(?:vector<int>|int\[\]|int\s+[a-zA-Z_]\w*\[\])\s*([a-zA-Z_]\w*)\s*=\s*\{(.+?)\};?$/);
      if (arrMatch) {
        const arrName = arrMatch[1];
        const arrNums = arrMatch[2].split(',').map(n => Number(n.trim())).filter(n => !isNaN(n));
        variables[arrName] = arrNums;
        activeArray = arrNums;
        stepCount++;
        steps.push(
          this.createStep({
            stepNumber: stepCount,
            lineNumber: lineNum,
            eventType: TraceEventType.ARRAY_CREATE,
            variables,
            changedVariable: arrName,
            dataStructureState: { type: 'array', values: [...arrNums], activeIndex: null },
            explanation: `Constructed std::vector<int> ${arrName} with capacity ${arrNums.length}: {${arrNums.join(', ')}}`,
          })
        );
        continue;
      }

      // Primitive variable: int sum = 0; or auto x = 10;
      const varDeclMatch = trimmed.match(/^(?:int|long|double|float|bool|auto)\s+([a-zA-Z_]\w*)\s*=\s*(.+?);?$/);
      if (varDeclMatch && !trimmed.startsWith('for')) {
        const varName = varDeclMatch[1];
        const rawVal = varDeclMatch[2].trim();
        const parsedVal = isNaN(Number(rawVal)) ? rawVal.replace(/['"]/g, '') : Number(rawVal);
        variables[varName] = parsedVal;
        stepCount++;
        steps.push(
          this.createStep({
            stepNumber: stepCount,
            lineNumber: lineNum,
            eventType: TraceEventType.VARIABLE_DECLARE,
            variables,
            changedVariable: varName,
            dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
            explanation: `Allocated automatic stack variable ${varName} = ${parsedVal}`,
          })
        );
        continue;
      }

      // For loop: for(int i = 1; i <= 5; i++) { ... }
      const forMatch = trimmed.match(/^for\s*\(\s*(?:int\s+|auto\s+)?([a-zA-Z_]\w*)\s*=\s*(\d+)\s*;\s*([a-zA-Z_]\w*)\s*([<>=!]+)\s*(\d+|[a-zA-Z_]\w*)\s*;\s*([a-zA-Z_]\w*)(?:\+\+|--|\s*\+=\s*\d+)\s*\)(.*)$/);
      if (forMatch) {
        const iterVar = forMatch[1];
        const startVal = parseInt(forMatch[2], 10);
        const condOp = forMatch[4];
        const limitVal = isNaN(Number(forMatch[5])) ? (variables[forMatch[5]] || 5) : parseInt(forMatch[5], 10);

        let bodyLines = [];
        let j = lineIdx + 1;
        const inlineBody = (forMatch[7] || '').replace(/[{}]/g, '').trim();

        if (inlineBody) {
          bodyLines.push({ line: inlineBody, lineNum });
        } else {
          while (j < lines.length && !lines[j].includes('}')) {
            if (lines[j].trim()) bodyLines.push({ line: lines[j].trim(), lineNum: j + 1 });
            j++;
          }
        }

        for (let iter = startVal; (condOp === '<=' ? iter <= limitVal : iter < limitVal); iter++) {
          if (stepCount >= this.maxSteps) break;

          variables[iterVar] = iter;

          stepCount++;
          steps.push(
            this.createStep({
              stepNumber: stepCount,
              lineNumber: lineNum,
              eventType: TraceEventType.COMPARE,
              variables,
              changedVariable: iterVar,
              explanation: `C++ for predicate check: ${iterVar} (${iter}) ${condOp} ${limitVal} -> true`,
              dataStructureState: activeArray ? {
                type: 'array',
                values: [...activeArray],
                pointers: { [iterVar]: iter < activeArray.length ? iter : undefined },
                activeIndex: iter < activeArray.length ? iter : null,
              } : null,
            })
          );

          for (const body of bodyLines) {
            if (stepCount >= this.maxSteps) break;

            const addMatch = body.line.match(/^([a-zA-Z_]\w*)\s*\+=\s*([a-zA-Z_]\w*|\d+);?$/);
            if (addMatch) {
              const targetVar = addMatch[1];
              const addend = isNaN(Number(addMatch[2])) ? (variables[addMatch[2]] ?? 0) : Number(addMatch[2]);
              variables[targetVar] = (variables[targetVar] || 0) + addend;

              stepCount++;
              steps.push(
                this.createStep({
                  stepNumber: stepCount,
                  lineNumber: body.lineNum,
                  eventType: TraceEventType.VARIABLE_UPDATE,
                  variables,
                  changedVariable: targetVar,
                  explanation: `Updated register/stack value ${targetVar} = ${variables[targetVar]}`,
                  dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
                })
              );
            }
          }
        }

        stepCount++;
        const finalIter = condOp === '<=' ? limitVal + 1 : limitVal;
        variables[iterVar] = finalIter;
        steps.push(
          this.createStep({
            stepNumber: stepCount,
            lineNumber: lineNum,
            eventType: TraceEventType.LOOP_END,
            variables,
            changedVariable: iterVar,
            explanation: `Condition evaluated to false. C++ loop terminated.`,
            dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
          })
        );

        if (!inlineBody) {
          lineIdx = j;
        }
        continue;
      }

      // cout << ...
      const coutMatch = trimmed.match(/^std::cout\s*<<\s*(.+?);?$|^cout\s*<<\s*(.+?);?$/);
      if (coutMatch) {
        const rawContent = (coutMatch[1] || coutMatch[2]).replace(/<<\s*(?:std::)?endl/g, '').trim();
        const cleanContent = rawContent.replace(/['"]/g, '');
        const val = variables[cleanContent] !== undefined ? variables[cleanContent] : cleanContent;
        outputLog.push(String(val));
        stepCount++;
        steps.push(
          this.createStep({
            stepNumber: stepCount,
            lineNumber: lineNum,
            eventType: TraceEventType.PRINT,
            variables,
            output: [...outputLog],
            explanation: `stdout: ${val}`,
            dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
          })
        );
      }
    }

    stepCount++;
    steps.push(
      this.createStep({
        stepNumber: stepCount,
        lineNumber: lines.length,
        eventType: TraceEventType.PROGRAM_END,
        variables,
        output: [...outputLog],
        dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
        explanation: 'C++ main() returned 0.',
      })
    );

    return {
      executionId: `cpp-exec-${Date.now()}`,
      language: 'cpp',
      status: 'completed',
      steps,
      totalSteps: steps.length,
      finalVariables: variables,
      output: outputLog,
    };
  }
}
