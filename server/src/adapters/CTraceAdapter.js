import { TraceAdapter, TraceEventType } from './TraceAdapter.js';

export class CTraceAdapter extends TraceAdapter {
  constructor() {
    super('c');
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
        explanation: 'C execution context initialized (main function entry).',
      })
    );

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      if (stepCount >= this.maxSteps) break;
      const rawLine = lines[lineIdx];
      const trimmed = rawLine.trim();
      const lineNum = lineIdx + 1;

      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('#include')) {
        continue;
      }

      // C array declaration: int arr[] = {10, 20, 30};
      const arrMatch = trimmed.match(/^int\s+([a-zA-Z_]\w*)\[.*?\]\s*=\s*\{(.+?)\};?$/);
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
            explanation: `Stack array int ${arrName}[${arrNums.length}] allocated in contiguous memory: {${arrNums.join(', ')}}`,
          })
        );
        continue;
      }

      // Scalar variable: int sum = 0;
      const varDeclMatch = trimmed.match(/^(?:int|long|double|float|char|short)\s+([a-zA-Z_]\w*)\s*=\s*(.+?);?$/);
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
            explanation: `Stack variable ${varName} initialized with value ${parsedVal}`,
          })
        );
        continue;
      }

      // For loop: for(int i = 1; i <= 5; i++) { ... }
      const forMatch = trimmed.match(/^for\s*\(\s*(?:int\s+)?([a-zA-Z_]\w*)\s*=\s*(\d+)\s*;\s*([a-zA-Z_]\w*)\s*([<>=!]+)\s*(\d+|[a-zA-Z_]\w*)\s*;\s*([a-zA-Z_]\w*)(?:\+\+|--|\s*\+=\s*\d+)\s*\)(.*)$/);
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
              explanation: `C comparison: ${iterVar} (${iter}) ${condOp} ${limitVal} -> condition holds true`,
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
                  explanation: `Updated register: ${targetVar} = ${variables[targetVar]}`,
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
            explanation: `C loop boundary reached. ${iterVar} = ${finalIter}. Loop terminated.`,
            dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
          })
        );

        if (!inlineBody) {
          lineIdx = j;
        }
        continue;
      }

      // printf(...)
      const printfMatch = trimmed.match(/^printf\((.+?)\);?$/);
      if (printfMatch) {
        const parts = printfMatch[1].split(',').map(s => s.trim());
        const formatStr = parts[0].replace(/['"]/g, '').replace(/\\n/g, '');
        let outputText = formatStr;
        if (parts.length > 1) {
          const varName = parts[1];
          const val = variables[varName] !== undefined ? variables[varName] : varName;
          outputText = formatStr.includes('%') ? formatStr.replace(/%[difs]/g, val) : `${formatStr} ${val}`;
        }
        outputLog.push(outputText);
        stepCount++;
        steps.push(
          this.createStep({
            stepNumber: stepCount,
            lineNumber: lineNum,
            eventType: TraceEventType.PRINT,
            variables,
            output: [...outputLog],
            explanation: `printf output: ${outputText}`,
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
        explanation: 'C main() exited with return code 0.',
      })
    );

    return {
      executionId: `c-exec-${Date.now()}`,
      language: 'c',
      status: 'completed',
      steps,
      totalSteps: steps.length,
      finalVariables: variables,
      output: outputLog,
    };
  }
}
