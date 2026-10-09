import assert from 'node:assert/strict';
import test from 'node:test';

test('Universal Editor sends source and stdin to the execution API and receives runtime fields', async () => {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  const source = 'public class Main { public static void main(String[] args) { int[] arr = {10, 20, 30, 40}; for (int value : arr) System.out.println(value); } }';
  const response = {
    success: true,
    status: 'COMPLETED',
    output: ['10', '20', '30', '40'],
    stdout: '10\n20\n30\n40\n',
    stderr: '',
    executionTimeMs: 31,
    traceSupported: false,
    traceReason: 'No supported loop trace model.',
  };
  const requests = [];
  globalThis.window = { location: { hostname: '127.0.0.1' } };
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    return { ok: true, json: async () => response };
  };

  try {
    const api = await import(`../src/services/apiService.js?editor-contract-${Date.now()}`);
    const result = await api.executeProgram(source, 'custom', 'java', '10, 20, 30, 40', true, undefined, { allowFallback: false });

    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, 'http://localhost:5000/api/execute');
    assert.deepEqual(JSON.parse(requests[0].options.body), {
      code: source,
      conceptId: 'custom',
      language: 'java',
      input: '10, 20, 30, 40',
      title: 'custom',
      universal: true,
    });
    assert.equal(result.status, 'COMPLETED');
    assert.deepEqual(result.output, ['10', '20', '30', '40']);
    assert.equal(result.executionTimeMs, 31);
    assert.equal(result.traceSupported, false);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
