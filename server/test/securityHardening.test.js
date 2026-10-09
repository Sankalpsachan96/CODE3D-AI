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
    return {
      status: response.status,
      headers: response.headers,
      data: await response.json().catch(() => null),
    };
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test('security hardening: CORS, AI payload limits, and AI rate limiting', async () => {
  const localOrigins = [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
  ];

  for (const origin of localOrigins) {
    const preflight = await request('/api/execute', {
      method: 'OPTIONS',
      headers: {
        Origin: origin,
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'content-type,x-session-token',
      },
    });
    assert.equal(preflight.status, 204, `${origin} should receive a successful preflight`);
    assert.equal(preflight.headers.get('access-control-allow-origin'), origin);
    assert.equal(preflight.headers.get('access-control-allow-credentials'), 'true');

    const health = await request('/api/health', { headers: { Origin: origin } });
    assert.equal(health.headers.get('access-control-allow-origin'), origin);
  }

  const blockedPreflight = await request('/api/execute', {
    method: 'OPTIONS',
    headers: {
      Origin: 'https://untrusted.invalid',
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'content-type',
    },
  });
  assert.notEqual(blockedPreflight.headers.get('access-control-allow-origin'), 'https://untrusted.invalid');

  const blockedOrigin = await request('/api/ai/explain', {
    method: 'POST',
    headers: { Origin: 'https://untrusted.invalid' },
    body: { code: 'x', question: 'hello' },
  });
  assert.equal(blockedOrigin.status, 403);
  assert.equal(blockedOrigin.data.error, 'ORIGIN_NOT_ALLOWED');

  for (let i = 0; i < 10; i += 1) {
    const response = await request('/api/ai/explain', {
      method: 'POST',
      body: { code: 'x'.repeat(20001), question: '', history: [] },
    });
    assert.equal(response.status, 413, `request ${i + 1} should reach payload validation`);
    assert.equal(response.data.error.code, 'AI_CODE_LIMIT');
  }

  const limited = await request('/api/ai/explain', {
    method: 'POST',
    body: { code: 'x'.repeat(20001), question: '', history: [] },
  });
  assert.equal(limited.status, 429);
  assert.equal(limited.data.error, 'AI_RATE_LIMIT');
});
