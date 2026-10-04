import { TraceAdapter, TraceEventType } from './TraceAdapter.js';

export class PythonTraceAdapter extends TraceAdapter {
  constructor() {
    super('python');
  }

  async generateTrace(code, input = '', options = {}) {
    const lines = code.split('\n');
    const steps = [];
    let stepCount = 0;
    const variables = {};
    const outputLog = [];
    let activeArray = null;

    // Step 1: Program Start
    stepCount++;
    steps.push(
      this.createStep({
        stepNumber: stepCount,
        lineNumber: 1,
        eventType: TraceEventType.PROGRAM_START,
        variables,
        scope: 'global',
        explanation: 'Python script execution started.',
      })
    );

    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      if (stepCount >= this.maxSteps) break;
      const rawLine = lines[lineIdx];
      const trimmed = rawLine.trim();
      const lineNum = lineIdx + 1;

      if (!trimmed || trimmed.startsWith('#')) continue;

      // Variable assignment: x = 0 or arr = [10, 20, 30]
      const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
      if (assignMatch && !trimmed.startsWith('for') && !trimmed.startsWith('while')) {
        const varName = assignMatch[1];
        const rawVal = assignMatch[2].trim();

        // Check if list/array creation: [10, 20, 30]
        if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
          const arrNums = rawVal.slice(1, -1).split(',').map(n => Number(n.trim())).filter(n => !isNaN(n));
          variables[varName] = arrNums;
          activeArray = arrNums;
          stepCount++;
          steps.push(
            this.createStep({
              stepNumber: stepCount,
              lineNumber: lineNum,
              eventType: TraceEventType.ARRAY_CREATE,
              variables,
              changedVariable: varName,
              dataStructureState: { type: 'array', values: [...arrNums], activeIndex: null },
              explanation: `List ${varName} assigned with ${arrNums.length} elements: [${arrNums.join(', ')}]`,
            })
          );
          continue;
        }

        // Scalar variable assignment
        let parsedVal = isNaN(Number(rawVal)) ? rawVal.replace(/['"]/g, '') : Number(rawVal);
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
            explanation: `Assigned ${varName} = ${parsedVal}`,
          })
        );
        continue;
      }

      // For in range loop: for i in range(1, 6): or for i in range(n):
      const rangeMatch = trimmed.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+range\(\s*(\d+|[a-zA-Z_]\w*)(?:\s*,\s*(\d+|[a-zA-Z_]\w*))?\s*\)\s*:/);
      if (rangeMatch) {
        const iterVar = rangeMatch[1];
        let startVal = 0;
        let endVal = 0;

        if (rangeMatch[3] !== undefined) {
          startVal = isNaN(Number(rangeMatch[2])) ? (variables[rangeMatch[2]] || 0) : parseInt(rangeMatch[2], 10);
          endVal = isNaN(Number(rangeMatch[3])) ? (variables[rangeMatch[3]] || 5) : parseInt(rangeMatch[3], 10);
        } else {
          startVal = 0;
          endVal = isNaN(Number(rangeMatch[2])) ? (variables[rangeMatch[2]] || 5) : parseInt(rangeMatch[2], 10);
        }

        // Find indented body lines
        let bodyLines = [];
        let j = lineIdx + 1;
        while (j < lines.length && (lines[j].startsWith('    ') || lines[j].startsWith('\t') || lines[j].trim() === '')) {
          if (lines[j].trim()) {
            bodyLines.push({ line: lines[j].trim(), lineNum: j + 1 });
          }
          j++;
        }

        for (let iter = startVal; iter < endVal; iter++) {
          if (stepCount >= this.maxSteps) break;

          variables[iterVar] = iter;

          stepCount++;
          steps.push(
            this.createStep({
              stepNumber: stepCount,
              lineNumber: lineNum,
              eventType: TraceEventType.LOOP_ITERATION,
              variables,
              changedVariable: iterVar,
              explanation: `Python for-loop iteration: ${iterVar} = ${iter} in range(${startVal}, ${endVal})`,
              dataStructureState: activeArray ? {
                type: 'array',
                values: [...activeArray],
                pointers: { [iterVar]: iter < activeArray.length ? iter : undefined },
                activeIndex: iter < activeArray.length ? iter : null,
              } : null,
            })
          );

          // Execute body lines
          for (const body of bodyLines) {
            if (stepCount >= this.maxSteps) break;

            // In-place addition: sum += i
            const addMatch = body.line.match(/^([a-zA-Z_]\w*)\s*\+=\s*([a-zA-Z_]\w*|\d+)$/);
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
                  explanation: `Updated ${targetVar} = ${variables[targetVar]} (+${addend})`,
                  dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
                })
              );
            }
          }
        }

        // Loop finished
        stepCount++;
        steps.push(
          this.createStep({
            stepNumber: stepCount,
            lineNumber: lineNum,
            eventType: TraceEventType.LOOP_END,
            variables,
            explanation: `Range exhausted at end = ${endVal}. Loop completed.`,
            dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
          })
        );

        lineIdx = j - 1;
        continue;
      }

      // Print statement: print(...)
      const printMatch = trimmed.match(/^print\((.+?)\)$/);
      if (printMatch) {
        const content = printMatch[1].replace(/['"]/g, '');
        const val = variables[content] !== undefined ? variables[content] : content;
        outputLog.push(String(val));
        stepCount++;
        steps.push(
          this.createStep({
            stepNumber: stepCount,
            lineNumber: lineNum,
            eventType: TraceEventType.PRINT,
            variables,
            output: [...outputLog],
            explanation: `print: ${val}`,
            dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
          })
        );
      }
    }

    // Program End
    stepCount++;
    steps.push(
      this.createStep({
        stepNumber: stepCount,
        lineNumber: lines.length,
        eventType: TraceEventType.PROGRAM_END,
        variables,
        output: [...outputLog],
        dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
        explanation: 'Python execution finished.',
      })
    );

    return {
      executionId: `py-exec-${Date.now()}`,
      language: 'python',
      status: 'completed',
      steps,
      totalSteps: steps.length,
      finalVariables: variables,
      output: outputLog,
    };
  }
}
