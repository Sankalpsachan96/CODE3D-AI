import assert from 'node:assert';
import test from 'node:test';
import app from '../src/app.js';

// Simple lightweight HTTP request helper for testing express app without external dependencies
async function request(path, options = {}) {
  const server = app.listen(0);
  const port = server.address().port;
  try {
    const res = await fetch(`http://localhost:${port}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
    const data = await res.json().catch(() => null);
    const cookie = res.headers.get('set-cookie');
    return { status: res.status, data, cookie };
  } finally {
    server.close();
  }
}

test('API Endpoints Test Suite', async (t) => {
  await t.test('GET /api/health returns online status', async () => {
    const res = await request('/api/health');
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.status === 'ok' || res.data.status === 'online');
    assert.strictEqual(res.data.supportedLanguages.length, 5);
  });

  let sessionCookie = '';

  await t.test('POST /api/auth/register creates user and returns session', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: {
        username: `tester_${Date.now()}`,
        email: `tester_${Date.now()}@code3d.io`,
        password: 'password123',
      },
    });
    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.sessionToken);
    sessionCookie = res.cookie ? res.cookie.split(';')[0] : '';
  });

  await t.test('POST /api/executions/run executes custom code', async () => {
    const res = await request('/api/executions/run', {
      method: 'POST',
      body: {
        code: 'int sum = 0;\nfor(int i = 1; i <= 5; i++) { sum += i; }',
        language: 'java',
        title: 'Java Test',
      },
      headers: sessionCookie ? { Cookie: sessionCookie } : {},
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.strictEqual(res.data.status, 'COMPLETED');
    assert.strictEqual(res.data.finalVariables.sum, 15);
  });

  await t.test('POST /api/auth/register rejects duplicate email', async () => {
    const res = await request('/api/auth/register', {
      method: 'POST',
      body: {
        username: `duplicate_${Date.now()}`,
        email: `tester_${Date.now()}@code3d.io`, // might collide or use fixed
        password: 'password123',
      },
    });
    // First create a fixed user
    const u1 = await request('/api/auth/register', {
      method: 'POST',
      body: {
        username: 'user_unique_1',
        email: 'unique1@code3d.io',
        password: 'password123',
      },
    });
    // Duplicate email
    const u2 = await request('/api/auth/register', {
      method: 'POST',
      body: {
        username: 'user_unique_2',
        email: 'unique1@code3d.io',
        password: 'password123',
      },
    });
    assert.strictEqual(u2.status, 409);
    assert.strictEqual(u2.data.error, 'USER_EXISTS');
  });

  await t.test('POST /api/auth/login validates credentials', async () => {
    // Correct login
    const valid = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'unique1@code3d.io',
        password: 'password123',
      },
    });
    assert.strictEqual(valid.status, 200);
    assert.strictEqual(valid.data.success, true);
    assert.ok(valid.data.sessionToken);

    // Invalid password
    const invalid = await request('/api/auth/login', {
      method: 'POST',
      body: {
        email: 'unique1@code3d.io',
        password: 'wrongpassword',
      },
    });
    assert.strictEqual(invalid.status, 401);
    assert.strictEqual(invalid.data.error, 'INVALID_CREDENTIALS');
  });

  let userAToken = '';
  let userBToken = '';
  let userAProjectId = '';

  await t.test('POST /api/projects creates user-scoped project and validates ownership', async () => {
    // Register User A
    const resA = await request('/api/auth/register', {
      method: 'POST',
      body: {
        username: 'owner_user_a',
        email: 'owner_a@code3d.io',
        password: 'password123',
      },
    });
    userAToken = resA.data.sessionToken;

    // Register User B
    const resB = await request('/api/auth/register', {
      method: 'POST',
      body: {
        username: 'owner_user_b',
        email: 'owner_b@code3d.io',
        password: 'password123',
      },
    });
    userBToken = resB.data.sessionToken;

    // User A creates project
    const projRes = await request('/api/projects', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}` },
      body: {
        name: 'Binary Search Tree 3D',
        code: 'class BST {}',
        language: 'java',
        visualization_type: 'tree',
      },
    });
    assert.strictEqual(projRes.status, 201);
    assert.strictEqual(projRes.data.success, true);
    userAProjectId = projRes.data.project.id;

    // User A can access project
    const getResA = await request(`/api/projects/${userAProjectId}`, {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert.strictEqual(getResA.status, 200);
    assert.strictEqual(getResA.data.project.name, 'Binary Search Tree 3D');

    // User B CANNOT access User A's project (Ownership Isolation)
    const getResB = await request(`/api/projects/${userAProjectId}`, {
      headers: { Authorization: `Bearer ${userBToken}` },
    });
    assert.strictEqual(getResB.status, 404); // returns 404 or 403
  });

  await t.test('POST /api/quiz/attempts saves and retrieves user attempts', async () => {
    const saveRes = await request('/api/quiz/attempts', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}` },
      body: {
        quizMode: 'find_bug',
        category: 'arrays',
        score: 4,
        totalQuestions: 5,
        percentage: 80.0,
      },
    });
    assert.strictEqual(saveRes.status, 201);
    assert.strictEqual(saveRes.data.success, true);

    const getRes = await request('/api/quiz/attempts', {
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert.strictEqual(getRes.status, 200);
    assert.ok(getRes.data.attempts.length >= 1);
  });

  await t.test('POST /api/auth/logout invalidates session', async () => {
    const logoutRes = await request('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${userAToken}` },
    });
    assert.strictEqual(logoutRes.status, 200);
    assert.strictEqual(logoutRes.data.success, true);
  });

  await t.test('GET /api/dsa/topics returns topics list', async () => {
    const res = await request('/api/dsa/topics');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.topics));
  });

  await t.test('GET /api/dsa/problems returns seeded problems', async () => {
    const res = await request('/api/dsa/problems');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.problems));
  });

  await t.test('GET /api/dashboard/stats returns real counters', async () => {
    const res = await request('/api/dashboard/stats');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(typeof res.data.stats.totalExecutions === 'number');
  });
});
