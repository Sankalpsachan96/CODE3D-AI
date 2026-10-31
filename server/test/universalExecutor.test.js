import assert from 'node:assert/strict';
import test from 'node:test';

import universalExecutor from '../src/services/universalExecutor.cjs';

const cases = [
  {
    language: 'cpp',
    code: '#include <iostream>\nint main() {\n  int values[2] = {2, 4};\n  int total = 0;\n  for (int i = 0; i < 2; ++i) {\n    total += values[i];\n  }\n  std::cout << total << "\\n";\n}',
    expected: '6',
    loopLine: 6,
  },
  {
    language: 'c',
    code: '#include <stdio.h>\nint main(void) {\n  int values[2] = {2, 4};\n  int total = 0;\n  for (int i = 0; i < 2; ++i) {\n    total += values[i];\n  }\n  printf("%d\\n", total);\n}',
    expected: '6',
    loopLine: 6,
  },
  {
    language: 'python',
    code: 'values = [2, 4]\ntotal = 0\nfor i, value in enumerate(values):\n    total += value\nprint(total)',
    expected: '6',
    loopLine: 4,
  },
  {
    language: 'java',
    code: 'public class Main {\n  public static void main(String[] args) {\n    int[] values = {2, 4};\n    int total = 0;\n    for (int i = 0; i < values.length; i++) {\n      total += values[i];\n    }\n    System.out.println(total);\n  }\n}',
    expected: '6',
    loopLine: 6,
  },
  {
    language: 'javascript',
    code: 'const values = [2, 4];\nlet total = 0;\nfor (let i = 0; i < values.length; i++) {\n  total += values[i];\n}\nconsole.log(total);',
    expected: '6',
    loopLine: 4,
  },
];

test('Real universal executor: all supported languages produce real stdout', async (t) => {
  const availability = universalExecutor.getRuntimeAvailability();

  if (!availability.sandbox) {
    t.skip('bubblewrap namespace sandbox is unavailable; executor intentionally fails closed');
    return;
  }

  for (const item of cases) {
    await t.test(item.language, async () => {
      const available = item.language === 'cpp'
        ? availability.cpp
        : item.language === 'c'
          ? availability.c
          : item.language === 'python'
            ? availability.python
            : item.language === 'java'
              ? availability.java
              : availability.javascript;

      if (!available) {
        t.skip(`${item.language} runtime is unavailable in this test environment`);
        return;
      }

      const result = await universalExecutor.executeCode(
        item.language,
        item.code,
        ''
      );

      assert.equal(result.success, true, result.error || 'execution failed');
      assert.match(String(result.output).trim(), new RegExp(`^\\s*${item.expected}\\s*$`));
      assert.ok(Array.isArray(result.runtimeTrace) && result.runtimeTrace.length > 0, `${item.language} should return captured runtime states`);
      assert.ok(result.runtimeTrace.every((event) => Number.isInteger(event.line)), `${item.language} trace steps should map to source lines`);
      const loopStates = result.runtimeTrace.filter((event) => event.line === item.loopLine);
      assert.equal(loopStates.length, 2, `${item.language} should capture both actual loop iterations`);
      assert.deepEqual(loopStates.map((event) => event.variables.i), [0, 1]);
      assert.deepEqual(loopStates.map((event) => event.variables.total), [0, 2]);
      assert.deepEqual(loopStates[0].variables.values, [2, 4]);
    });
  }
});


test('Judge0 RapidAPI credentials use the required host and key headers', async () => {
  const requests = [];
  const fetchImpl = async (url, init = {}) => {
    requests.push({ url, headers: init.headers || {} });
    if (init.method === 'POST') {
      return new Response(JSON.stringify({ token: 'rapid-token' }), { status: 201, headers: { 'content-type': 'application/json' } });
    }
    return new Response(JSON.stringify({
      status: { id: 3, description: 'Accepted' },
      stdout: Buffer.from('6\n').toString('base64'),
      stderr: '',
      time: '0.01',
      memory: 1024,
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const result = await universalExecutor.executeWithJudge0(
    'javascript',
    'console.log(6)',
    '',
    {
      judge0Url: 'https://judge0-ce.p.rapidapi.com',
      judge0ApiKey: 'test-key',
      judge0ApiHost: 'judge0-ce.p.rapidapi.com',
      fetchImpl,
      pollIntervalMs: 1,
      deadlineMs: 1000,
    },
  );

  assert.equal(result.success, true, result.error);
  assert.equal(result.output.trim(), '6');
  assert.equal(requests[0].headers['X-RapidAPI-Key'], 'test-key');
  assert.equal(requests[0].headers['X-RapidAPI-Host'], 'judge0-ce.p.rapidapi.com');
});

test('Judge0 polling retries transient network failures without resubmitting code', async () => {
  let submissions = 0;
  let polls = 0;
  const fetchImpl = async (_url, init = {}) => {
    if (init.method === 'POST') {
      submissions += 1;
      return new Response(JSON.stringify({ token: 'retry-token' }), { status: 201, headers: { 'content-type': 'application/json' } });
    }
    polls += 1;
    if (polls === 1) throw new TypeError('fetch failed');
    return new Response(JSON.stringify({
      status: { id: 3, description: 'Accepted' },
      stdout: Buffer.from('42\n').toString('base64'),
      stderr: '',
      time: '0.01',
      memory: 1024,
    }), { status: 200, headers: { 'content-type': 'application/json' } });
  };

  const result = await universalExecutor.executeWithJudge0(
    'python',
    'print(42)',
    '',
    {
      judge0Url: 'https://judge0.example.test',
      fetchImpl,
      pollIntervalMs: 1,
      deadlineMs: 2000,
    },
  );

  assert.equal(result.success, true, result.error);
  assert.equal(result.output.trim(), '42');
  assert.equal(submissions, 1, 'a transient poll failure must not duplicate code submissions');
  assert.equal(polls, 2);
});


test('Python LeetCode maxDepth solution runs with a default sample tree and captures recursion', async (t) => {
  const { spawnSync } = await import('node:child_process');
  const solution = `class Solution:
    def maxDepth(self, root):
        if root is None:
            return 0
        leftHeight = self.maxDepth(root.left)
        rightHeight = self.maxDepth(root.right)
        return 1 + max(leftHeight, rightHeight)
`;
  const instrumented = universalExecutor.buildPythonInstrumentedSource(solution);
  const result = spawnSync('python3', ['-c', instrumented], { encoding: 'utf8', timeout: 5000 });
  if (result.error?.code === 'ENOENT') {
    t.skip('python3 is unavailable in this test environment');
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), '3');
  const marker = '__CODE3D_RUNTIME_TRACE__';
  const traceLine = result.stderr.split(/\\r?\\n/).find((line) => line.startsWith(marker));
  assert.ok(traceLine, 'runtime trace marker should be present');
  const events = JSON.parse(traceLine.slice(marker.length));
  assert.ok(events.some((event) => event.callStack?.includes('maxDepth')), 'trace should include recursive maxDepth calls');
  assert.ok(events.some((event) => event.variables?.root?.left), 'trace should include the actual tree node state');
});

test('Python LeetCode maxDepth solution accepts JSON level-order tree input', async (t) => {
  const { spawnSync } = await import('node:child_process');
  const solution = `class Solution:
    def maxDepth(self, root):
        if root is None:
            return 0
        return 1 + max(self.maxDepth(root.left), self.maxDepth(root.right))
`;
  const instrumented = universalExecutor.buildPythonInstrumentedSource(solution, '[1, 2, null, 3]');
  const result = spawnSync('python3', ['-c', instrumented], { encoding: 'utf8', timeout: 5000 });
  if (result.error?.code === 'ENOENT') {
    t.skip('python3 is unavailable in this test environment');
    return;
  }
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), '3');
});
