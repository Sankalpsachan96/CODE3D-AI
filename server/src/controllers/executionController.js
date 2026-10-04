import { executeCodeInSandbox } from '../sandbox/executionEngine.js';
import { getPrisma, isDbOnline } from '../db.js';
import { buildUniversalRuntimeContext } from '../services/universalDsaEngine.js';
import universalExecutor from '../services/universalExecutor.cjs';
import universalTrace from '../services/universalTraceEngine.cjs';

export const memoryExecutions = [];

export async function runExecution(req, res) {
  try {
    const { code, language = 'java', input = '', title = 'Custom Execution' } = req.body;

    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'INVALID_INPUT',
        message: 'Code is required.',
      });
    }

    const universal = req.body?.universal === true;
    let execResult;
    let universalTraceResult = null;

    if (universal) {
      const rawResult = await universalExecutor.executeCode(language, code, input);
      universalTraceResult = universalTrace.generateTrace(code, language, rawResult);
      const rawSteps = universalTraceResult.events || [];
      const rawErrorText = rawResult.error || '';
      const rawErrorLineMatch = rawErrorText.match(/(?:line|Line)\s*[:#]?\s*(\d+)/) || rawErrorText.match(/:(\d+)(?::\d+)?/);
      const rawErrorLine = rawErrorLineMatch ? Number(rawErrorLineMatch[1]) : null;
      execResult = {
        status: rawResult.success ? 'COMPLETED' : 'ERROR',
        errorCode: rawResult.success ? null : (rawResult.stage || 'EXECUTION_ERROR').toUpperCase(),
        message: rawResult.error || null,
        language,
        steps: rawSteps.map((event, index) => ({
          step: event.step || index + 1,
          line: event.line ?? rawErrorLine ?? null,
          lineNumber: event.line ?? rawErrorLine ?? null,
          event: event.type || 'code_step',
          operation: event.operation || event.type || 'code_step',
          explanation: event.message || event.code || '',
          variables: event.variables || {},
          output: event.output ? String(event.output).split(/\r?\n/).filter(Boolean) : [],
          dataStructureState: {
            type: event.dataStructure || universalTraceResult.dataStructure || 'universal-execution',
            algorithm: event.algorithm || universalTraceResult.algorithm || 'unknown',
            values: event.array || event.values || [],
            array: event.array || [],
            variables: event.variables || {},
            activeVariable: event.activeVariable || null,
            activeIndex: event.index ?? null,
            indices: event.indices || [],
            pointers: event.pointers || {},
            low: event.low ?? null,
            mid: event.mid ?? null,
            high: event.high ?? null,
            target: event.target ?? null,
            currentValue: event.currentValue ?? null,
            event: event.type || null,
            operation: event.operation || event.type || null,
            calculationInfo: event.calculationInfo || (event.type === 'calculation' ? {
              targetVar: event.resultName,
              expression: event.expression,
              result: event.result,
            } : null),
            conditionInfo: event.conditionInfo || (event.type === 'condition' ? {
              expression: event.condition,
              result: event.result,
            } : null),
            outputStream: rawResult.output ? String(rawResult.output).split(/\r?\n/).filter(Boolean) : [],
            errorInfo: event.type === 'error' ? {
              line: event.line ?? rawErrorLine ?? null,
              message: event.message || rawResult.error || 'Execution failed.',
              code: rawResult.stage || 'EXECUTION_ERROR',
            } : null,
          },
        })),
        totalSteps: rawSteps.length,
        finalVariables: {},
        output: rawResult.output ? String(rawResult.output).split(/\r?\n/).filter(Boolean) : [],
        executionTimeMs: rawResult.executionTime || 0,
        complexity: null,
      };
    } else {
      execResult = await executeCodeInSandbox({ code, language, input });
    }

    const errorText = execResult.message || '';
    const errorLineMatch = errorText.match(/(?:line|Line)\s*[:#]?\s*(\d+)/) || errorText.match(/:(\d+)(?::\d+)?/);
    const errorLine = errorLineMatch ? Number(errorLineMatch[1]) : null;

    // Persist to database if user is logged in
    const userId = req.user?.id || null;
    let savedRecord = null;

    if (isDbOnline() && execResult.status === 'COMPLETED') {
      try {
        const prisma = getPrisma();
        savedRecord = await prisma.algorithmExecution.create({
          data: {
            userId,
            title,
            language,
            code,
            input,
            status: 'COMPLETED',
            stepCount: execResult.totalSteps,
            executionTimeMs: execResult.executionTimeMs,
            traceJson: execResult.steps,
          },
        });
      } catch (dbErr) {
        console.warn('Could not persist execution to database:', dbErr.message);
      }
    } else if (execResult.status === 'COMPLETED') {
      // Memory store fallback
      savedRecord = {
        id: `exec-${Date.now()}`,
        userId,
        title,
        language,
        code,
        input,
        status: 'COMPLETED',
        stepCount: execResult.totalSteps,
        executionTimeMs: execResult.executionTimeMs,
        traceJson: execResult.steps,
        createdAt: new Date(),
      };
      memoryExecutions.unshift(savedRecord);
      if (memoryExecutions.length > 50) memoryExecutions.pop();
    }

    const universalContext = buildUniversalRuntimeContext(code, execResult.steps, execResult);

    return res.json({
      success: execResult.status === 'COMPLETED',
      executionId: savedRecord?.id || execResult.executionId,
      language: execResult.language,
      status: execResult.status,
      errorCode: execResult.errorCode || null,
      errorLine,
      message: execResult.message || null,
      steps: execResult.steps,
      totalSteps: execResult.totalSteps,
      finalVariables: execResult.finalVariables,
      output: execResult.output,
      executionTimeMs: execResult.executionTimeMs,
      complexity: execResult.complexity,
      universalContext,
    });
  } catch (err) {
    console.error('Execution controller error:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to complete execution.',
    });
  }
}

export function analyzeCode(req, res) {
  try {
    const { code = '', language = 'java' } = req.body;
    let loopNesting = 0;
    let maxNesting = 0;
    const lines = code.split('\n');
    for (const line of lines) {
      if (/\b(for|while)\b/.test(line)) {
        loopNesting++;
        if (loopNesting > maxNesting) maxNesting = loopNesting;
      }
      if (line.includes('}')) {
        loopNesting = Math.max(0, loopNesting - 1);
      }
    }
    const timeComplexity = maxNesting === 0 ? 'O(1)' : maxNesting === 1 ? 'O(n)' : maxNesting === 2 ? 'O(n²)' : `O(n^${maxNesting})`;
    const spaceComplexity = /\b(new\s+[a-zA-Z0-9_]+\[|vector<|list\(|\[\])/.test(code) ? 'O(n)' : 'O(1)';

    return res.json({
      success: true,
      timeComplexity,
      spaceComplexity,
      maxLoopNesting: maxNesting,
      language,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Analysis error' });
  }
}

