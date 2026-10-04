import { TraceAdapter, TraceEventType } from './TraceAdapter.js';

export class JavaScriptTraceAdapter extends TraceAdapter {
  constructor() {
    super('javascript');
  }

  async generateTrace(code, input = '', options = {}) {
    const lines = code.split('\n');
    const steps = [];
    let stepCount = 0;
    const variables = {};
    const outputLog = [];

    // Step 1: Program Start
    stepCount++;
    steps.push(
      this.createStep({
        stepNumber: stepCount,
        lineNumber: 1,
        eventType: TraceEventType.PROGRAM_START,
        variables,
        scope: 'global',
        explanation: 'JavaScript program initialized.',
      })
    );

    // Track active arrays if detected
    let activeArray = null;

    // Line-by-line parsing & state-machine execution simulation
    for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
      if (stepCount >= this.maxSteps) break;
      const rawLine = lines[lineIdx];
      const trimmed = rawLine.trim();
      const lineNum = lineIdx + 1;

      if (!trimmed || trimmed.startsWith('//') || trimmed.startsWith('/*')) continue;

      // Variable declaration / assignment: let x = 0; or var sum = 10;
      const letVarMatch = trimmed.match(/^(?:let|const|var)\s+([a-zA-Z_]\w*)\s*=\s*(.+?);?$/);
      if (letVarMatch) {
        const varName = letVarMatch[1];
        const rawVal = letVarMatch[2].trim();

        // Check if array creation: [10, 20, 30]
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
              explanation: `Array ${varName} created with ${arrNums.length} elements: [${arrNums.join(', ')}]`,
            })
          );
          continue;
        }

        // Numeric or string scalar assignment
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
            explanation: `Declared ${varName} = ${parsedVal}`,
          })
        );
        continue;
      }

      // For loop: for (let i = 1; i <= 5; i++) { ... }
      const forLoopMatch = trimmed.match(/^for\s*\(\s*(?:let|var)?\s*([a-zA-Z_]\w*)\s*=\s*(\d+)\s*;\s*([a-zA-Z_]\w*)\s*([<>=!]+)\s*(\d+|[a-zA-Z_]\w*)\s*;\s*([a-zA-Z_]\w*)(?:\+\+|--|\s*\+=\s*\d+)\s*\)(.*)$/);
      if (forLoopMatch) {
        const iterVar = forLoopMatch[1];
        const startVal = parseInt(forLoopMatch[2], 10);
        const condOp = forLoopMatch[4];
        const limitVal = isNaN(Number(forLoopMatch[5])) ? (variables[forLoopMatch[5]] || 5) : parseInt(forLoopMatch[5], 10);

        // Find loop body lines
        let bodyLines = [];
        let j = lineIdx + 1;
        const inlineBody = (forLoopMatch[7] || '').replace(/[{}]/g, '').trim();

        if (inlineBody) {
          bodyLines.push({ line: inlineBody, lineNum });
        } else {
          while (j < lines.length && !lines[j].includes('}')) {
            if (lines[j].trim()) bodyLines.push({ line: lines[j].trim(), lineNum: j + 1 });
            j++;
          }
        }

        // Execute simulated loop iterations
        for (let iter = startVal; (condOp === '<=' ? iter <= limitVal : iter < limitVal); iter++) {
          if (stepCount >= this.maxSteps) break;

          variables[iterVar] = iter;

          // Comparison step
          stepCount++;
          steps.push(
            this.createStep({
              stepNumber: stepCount,
              lineNumber: lineNum,
              eventType: TraceEventType.COMPARE,
              variables,
              changedVariable: iterVar,
              explanation: `Loop condition check: ${iterVar} (${iter}) ${condOp} ${limitVal} -> true`,
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

            // Compound addition: sum += i or sum = sum + i
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
                  explanation: `Updated ${targetVar} = ${variables[targetVar]} (+${addend})`,
                  dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
                })
              );
            }

            // Array swap or write: arr[j] = arr[j+1]
            const arrWriteMatch = body.line.match(/^([a-zA-Z_]\w*)\[(.+?)\]\s*=\s*(.+?);?$/);
            if (arrWriteMatch && activeArray) {
              const idxVal = variables[arrWriteMatch[2]] ?? parseInt(arrWriteMatch[2], 10);
              const writeVal = variables[arrWriteMatch[3]] ?? parseInt(arrWriteMatch[3], 10);
              if (idxVal >= 0 && idxVal < activeArray.length) {
                activeArray[idxVal] = writeVal;
                stepCount++;
                steps.push(
                  this.createStep({
                    stepNumber: stepCount,
                    lineNumber: body.lineNum,
                    eventType: TraceEventType.ARRAY_WRITE,
                    variables,
                    dataStructureState: { type: 'array', values: [...activeArray], activeIndex: idxVal },
                    explanation: `Wrote ${writeVal} to index [${idxVal}]`,
                  })
                );
              }
            }
          }
        }

        // Loop End condition failed
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
            explanation: `Loop condition failed: ${iterVar} (${finalIter}) ${condOp} ${limitVal} -> false. Exiting loop.`,
            dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
          })
        );

        if (!inlineBody) {
          lineIdx = j;
        }
        continue;
      }

      // Console log statement: console.log(...)
      const consoleMatch = trimmed.match(/^console\.log\((.+?)\);?$/);
      if (consoleMatch) {
        const content = consoleMatch[1].replace(/['"]/g, '');
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
            explanation: `Output: ${val}`,
            dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
          })
        );
      }
    }

    // Step Final: Program End
    stepCount++;
    steps.push(
      this.createStep({
        stepNumber: stepCount,
        lineNumber: lines.length,
        eventType: TraceEventType.PROGRAM_END,
        variables,
        output: [...outputLog],
        dataStructureState: activeArray ? { type: 'array', values: [...activeArray] } : null,
        explanation: 'JavaScript execution completed.',
      })
    );

    return {
      executionId: `js-exec-${Date.now()}`,
      language: 'javascript',
      status: 'completed',
      steps,
      totalSteps: steps.length,
      finalVariables: variables,
      output: outputLog,
    };
  }
}
