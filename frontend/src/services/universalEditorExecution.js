/** Normalize the execution API response for the Universal Editor UI. */
export function normalizeUniversalExecutionResult(result = {}) {
  const status = result.status || (result.success === true ? 'COMPLETED' : 'ERROR');
  const output = Array.isArray(result.output) && result.output.length > 0
    ? result.output.map(String).filter((line, index, lines) => !(index === lines.length - 1 && line === ''))
    : typeof result.stdout === 'string'
      ? result.stdout.replace(/\r/g, '').split('\n').filter((line, index, lines) => !(index === lines.length - 1 && line === ''))
      : typeof result.output === 'string'
        ? result.output.replace(/\r/g, '').split('\n').filter((line, index, lines) => !(index === lines.length - 1 && line === ''))
        : [];
  const failed = status !== 'COMPLETED' || result.success === false;
  const executionTimeMs = result.executionTimeMs == null ? NaN : Number(result.executionTimeMs);
  const traceSupported = !failed && result.traceSupported === true;
  const errorDetails = [...new Set([result.message, result.stderr].filter((value) => typeof value === 'string' && value.trim()))];

  return {
    status,
    output,
    error: failed ? (errorDetails.join('\n') || `Execution ${String(status).toLowerCase()}.`) : null,
    executionTimeMs: Number.isFinite(executionTimeMs) && executionTimeMs >= 0 ? executionTimeMs : null,
    traceSupported,
    traceMode: result.traceMode || (result.traceGeneric === true ? 'source-model' : (traceSupported ? 'pattern-model' : 'output-only')),
    traceReason: result.traceGeneric === true
      ? 'Only generic source-level events were detected; no reliable data-structure trace is available.'
      : result.traceReason || null,
    complexity: result.complexity && typeof result.complexity === 'object' ? result.complexity : null,
    // Generic events are source-level models, not runtime instrumentation.
    steps: !failed && Array.isArray(result.steps) ? result.steps : [],
  };
}
