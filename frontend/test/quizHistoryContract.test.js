import assert from 'node:assert/strict';
import test from 'node:test';

test('quiz history sends the canonical mode field and includes session credentials', async () => {
  const previousWindow = globalThis.window;
  const previousFetch = globalThis.fetch;
  const requests = [];
  globalThis.window = {
    location: { hostname: '127.0.0.1' },
    localStorage: { getItem: () => null, setItem: () => {} },
  };
  globalThis.fetch = async (url, options) => {
    requests.push({ url: String(url), options });
    return {
      ok: true,
      json: async () => ({
        success: true,
        attempt: { mode: 'AI', category: 'arrays', score: 8, totalQuestions: 10, percentage: 80 },
      }),
    };
  };

  try {
    const api = await import(`../src/services/apiService.js?quiz-contract-${Date.now()}`);
    await api.recordQuizHistory({ conceptId: 'arrays', score: 8, totalQuestions: 10, mode: 'AI' });
    assert.equal(requests.length, 1);
    assert.equal(requests[0].url, 'http://localhost:5000/api/quiz/attempts');
    assert.equal(requests[0].options.credentials, 'include');
    const body = JSON.parse(requests[0].options.body);
    assert.equal(body.mode, 'AI');
    assert.equal(Object.hasOwn(body, 'quizMode'), false);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousWindow === undefined) delete globalThis.window;
    else globalThis.window = previousWindow;
  }
});
