import assert from 'node:assert/strict';
import test from 'node:test';

import universalExecutor from '../src/services/universalExecutor.cjs';

const cases = [
  {
    language: 'cpp',
    code: '#include <iostream>\nusing namespace std;\nint main() { int a = 10; int b = 20; cout << a + b; return 0; }',
    expected: '30',
  },
  {
    language: 'c',
    code: '#include <stdio.h>\nint main() { int a = 10; int b = 20; printf("%d", a + b); return 0; }',
    expected: '30',
  },
  {
    language: 'python',
    code: 'a = 10\nb = 20\nprint(a + b)',
    expected: '30',
  },
  {
    language: 'java',
    code: 'public class Main { public static void main(String[] args) { int a = 10; int b = 20; System.out.print(a + b); } }',
    expected: '30',
  },
  {
    language: 'javascript',
    code: 'const a = 10; const b = 20; console.log(a + b);',
    expected: '30',
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
    });
  }
});
