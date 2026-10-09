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
