import assert from 'node:assert/strict';
import test from 'node:test';

test('Universal editor execution stays on the configured local backend after a network failure', async () => {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.window = { location: { hostname: 'localhost' } };
  globalThis.fetch = async (url) => {
    requests.push(String(url));
    throw new TypeError('backend unreachable');
  };

  try {
    const api = await import(`../src/services/apiService.js?editor-backend-${Date.now()}`);
    await assert.rejects(
      api.executeProgram('print(1)', 'custom', 'python', '', true, undefined, { allowFallback: false }),
      /backend unreachable/
    );
    assert.deepEqual(requests, ['http://localhost:5000/api/execute']);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
