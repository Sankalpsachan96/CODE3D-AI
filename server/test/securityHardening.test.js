import assert from 'node:assert/strict';
import test from 'node:test';
import app from '../src/app.js';

async function request(path, options = {}) {
  const server = app.listen(0);
  const address = server.address();
  try {
    const response = await fetch(`http://127.0.0.1:${address.port}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    return { status: response.status, data: await response.json().catch(() => null) };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('security hardening: rejects untrusted browser origins for writes', async () => {
  const response = await request('/api/ai/explain', {
    method: 'POST',
    headers: { Origin: 'https://untrusted.invalid' },
    body: { code: 'x', question: 'hello' },
  });

  assert.equal(response.status, 403);
  assert.equal(response.data.error, 'ORIGIN_NOT_ALLOWED');
});

test('security hardening: AI payload size is bounded', async () => {
  const response = await request('/api/ai/explain', {
    method: 'POST',
    body: { code: 'x'.repeat(20001), question: '', history: [] },
  });

  assert.equal(response.status, 413);
  assert.equal(response.data.error.code, 'AI_CODE_LIMIT');
});

test('security hardening: AI requests are rate limited', async () => {
  for (let i = 0; i < 10; i += 1) {
    const response = await request('/api/ai/explain', {
      method: 'POST',
      body: { code: 'x'.repeat(20001), question: '', history: [] },
    });
    assert.equal(response.status, 413, `request ${i + 1} should reach payload validation`);
  }

  const limited = await request('/api/ai/explain', {
    method: 'POST',
    body: { code: 'x'.repeat(20001), question: '', history: [] },
  });
  assert.equal(limited.status, 429);
  assert.equal(limited.data.error, 'AI_RATE_LIMIT');
});
