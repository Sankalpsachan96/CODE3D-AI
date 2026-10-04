import assert from 'node:assert';
import test from 'node:test';
import { executeCodeInSandbox } from '../src/sandbox/executionEngine.js';

test('Critical Test Case: 5-Language Loop Summation Equivalence', async (t) => {
  const cases = [
    {
      lang: 'javascript',
      code: `let sum = 0;
for (let i = 1; i <= 5; i++) {
  sum += i;
}`,
    },
    {
      lang: 'python',
      code: `sum = 0
for i in range(1, 6):
    sum += i`,
    },
    {
      lang: 'java',
      code: `int sum = 0;
for(int i = 1; i <= 5; i++) {
    sum += i;
}`,
    },
    {
      lang: 'cpp',
      code: `int sum = 0;
for(int i = 1; i <= 5; i++) {
    sum += i;
}`,
    },
    {
      lang: 'c',
      code: `int sum = 0;
for(int i = 1; i <= 5; i++) {
    sum += i;
}`,
    },
  ];

  for (const c of cases) {
    await t.test(`Language ${c.lang} executes and generates trace with final sum = 15`, async () => {
      const res = await executeCodeInSandbox({ code: c.code, language: c.lang });
      assert.strictEqual(res.status, 'COMPLETED', `${c.lang} should complete`);
      assert.ok(res.steps.length > 5, `${c.lang} should generate trace steps`);
      assert.strictEqual(res.finalVariables.sum, 15, `${c.lang} sum must be 15`);
    });
  }
});
