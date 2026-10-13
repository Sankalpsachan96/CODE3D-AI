import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import universalExecutor from '../src/services/universalExecutor.cjs';

const expected = Array.from({ length: 256 }, (_, index) => index).join(',');
const pad = 'large-source-stress-'.repeat(3200);
const implementations = [
  {
    language: 'javascript',
    code: '/*' + pad + '*/\n' + [
      'function mergeSort(values) {',
      ' if (values.length < 2) return values;',
      ' const middle = Math.floor(values.length / 2);',
      ' const left = mergeSort(values.slice(0, middle));',
      ' const right = mergeSort(values.slice(middle));',
      ' const merged = []; let i = 0, j = 0;',
      ' while (i < left.length && j < right.length) merged.push(left[i] <= right[j] ? left[i++] : right[j++]);',
      ' return merged.concat(left.slice(i), right.slice(j));',
      '}',
      'const values = Array.from({ length: 256 }, (_, i) => 255 - i);',
      "console.log(mergeSort(values).join(','));"
    ].join('\n')
  },
  {
    language: 'python',
    code: '#' + pad + '\n' + [
      'def merge_sort(values):',
      '    if len(values) < 2: return values',
      '    middle = len(values) // 2',
      '    left = merge_sort(values[:middle])',
      '    right = merge_sort(values[middle:])',
      '    merged = []; i = 0; j = 0',
      '    while i < len(left) and j < len(right):',
      '        if left[i] <= right[j]: merged.append(left[i]); i += 1',
      '        else: merged.append(right[j]); j += 1',
      '    return merged + left[i:] + right[j:]',
      'values = list(range(255, -1, -1))',
      "print(','.join(map(str, merge_sort(values))))"
    ].join('\n')
  },
  {
    language: 'java',
    code: '/*' + pad + '*/\n' + [
      'import java.util.Arrays;',
      'public class Main {',
      ' static int[] mergeSort(int[] values) {',
      '  if (values.length < 2) return values;',
      '  int middle = values.length / 2;',
      '  int[] left = mergeSort(Arrays.copyOfRange(values, 0, middle));',
      '  int[] right = mergeSort(Arrays.copyOfRange(values, middle, values.length));',
      '  int[] merged = new int[values.length]; int i = 0, j = 0, k = 0;',
      '  while (i < left.length && j < right.length) merged[k++] = left[i] <= right[j] ? left[i++] : right[j++];',
      '  while (i < left.length) merged[k++] = left[i++];',
      '  while (j < right.length) merged[k++] = right[j++];',
      '  return merged;',
      ' }',
      ' public static void main(String[] args) {',
      '  int[] values = new int[256];',
      '  for (int i = 0; i < values.length; i++) values[i] = 255 - i;',
      "  System.out.println(Arrays.toString(mergeSort(values)).replaceAll(\"[\\\\[\\\\] ]\", \"\"));",
      ' }',
      '}'
    ].join('\n')
  },
  {
    language: 'cpp',
    code: '/*' + pad + '*/\n' + [
      '#include <algorithm>',
      '#include <iostream>',
      '#include <vector>',
      'using namespace std;',
      'vector<int> mergeSort(vector<int> values) {',
      ' if (values.size() < 2) return values;',
      ' auto middle = values.begin() + values.size() / 2;',
      ' vector<int> left(values.begin(), middle), right(middle, values.end());',
      ' left = mergeSort(left); right = mergeSort(right);',
      ' vector<int> merged; merged.reserve(values.size());',
      ' merge(left.begin(), left.end(), right.begin(), right.end(), back_inserter(merged));',
      ' return merged;',
      '}',
      'int main() {',
      ' vector<int> values(256); for (int i = 0; i < 256; ++i) values[i] = 255 - i;',
      ' auto sorted = mergeSort(values);',
      ' for (size_t i = 0; i < sorted.size(); ++i) cout << (i ? "," : "") << sorted[i];',
      " cout << '\\n';",
      '}'
    ].join('\n')
  },
  {
    language: 'c',
    code: '/*' + pad + '*/\n' + [
      '#include <stdio.h>',
      '#include <stdlib.h>',
      'void merge_sort(int *values, int length) {',
      ' if (length < 2) return;',
      ' int middle = length / 2;',
      ' int *left = malloc((size_t)middle * sizeof(int));',
      ' int *right = malloc((size_t)(length - middle) * sizeof(int));',
      ' if (!left || !right) { free(left); free(right); return; }',
      ' for (int i = 0; i < middle; i++) left[i] = values[i];',
      ' for (int i = middle; i < length; i++) right[i - middle] = values[i];',
      ' merge_sort(left, middle); merge_sort(right, length - middle);',
      ' int i = 0, j = 0, k = 0;',
      ' while (i < middle && j < length - middle) values[k++] = left[i] <= right[j] ? left[i++] : right[j++];',
      ' while (i < middle) values[k++] = left[i++];',
      ' while (j < length - middle) values[k++] = right[j++];',
      ' free(left); free(right);',
      '}',
      'int main(void) {',
      ' int values[256]; for (int i = 0; i < 256; i++) values[i] = 255 - i;',
      ' merge_sort(values, 256);',
      ' for (int i = 0; i < 256; i++) printf("%s%d", i ? "," : "", values[i]);',
      " putchar('\\n'); return 0;",
      '}'
    ].join('\n')
  }
];

test('Universal editor stress: large merge-sort programs execute in every available runtime', async (t) => {
  const availability = universalExecutor.getRuntimeAvailability();
  if (!availability.executionAvailable) {
    t.skip('No working Bubblewrap sandbox or configured Judge0 provider is available in this test environment.');
    return;
  }
  for (const item of implementations) {
    await t.test(item.language, async () => {
      const code = item.code;
      assert.ok(Buffer.byteLength(code, 'utf8') > 60 * 1024, 'source should exercise a large payload');
      assert.ok(Buffer.byteLength(code, 'utf8') < 100 * 1024, 'source must remain below the execution limit');
      const result = await universalExecutor.executeCode(item.language, code, '');
      assert.equal(result.success, true, result.error || item.language + ' execution failed');
      assert.equal(String(result.output).trim(), expected, item.language + ' produced incorrect merge-sort output');
      assert.ok(Array.isArray(result.runtimeTrace), item.language + ' should return a runtime trace array');
      assert.ok(result.runtimeTrace.length > 0, item.language + ' should capture runtime events');
      assert.ok(result.runtimeTrace.length <= 121, item.language + ' trace must respect the 120-step cap plus marker');
      assert.ok(Number.isFinite(result.executionTime) && result.executionTime >= 0, 'execution time should be reported');
    });
  }
});


test('Trusted large-code fixtures compile and produce exact output on CI hosts', () => {
  // This fallback validates the large fixture programs themselves when CI
  // cannot run Bubblewrap/Judge0. It is NOT a substitute for isolated executor
  // integration tests, which remain conditional on a real sandbox/provider.
  const available = {
    javascript: [process.execPath, []],
    python: ['python3', ['--version']],
    c: ['gcc', ['--version']],
    cpp: ['g++', ['--version']],
    java: ['javac', ['-version']]
  };
  const probe = (command, args) => spawnSync(command, args, { encoding: 'utf8', timeout: 5000 });
  const enabled = Object.fromEntries(Object.entries(available).map(([language, [command, args]]) => {
    const result = probe(command, args);
    return [language, !result.error && result.status === 0];
  }));
  for (const item of implementations) {
    if (!enabled[item.language]) {
      test('trusted fixture ' + item.language + ' runtime unavailable', { skip: true }, () => {});
      continue;
    }
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'code3d-large-fixture-'));
    try {
      const fileNames = { javascript: 'main.js', python: 'main.py', c: 'main.c', cpp: 'main.cpp', java: 'Main.java' };
      const sourcePath = path.join(directory, fileNames[item.language]);
      fs.writeFileSync(sourcePath, item.code, 'utf8');
      const run = (command, args) => {
        const result = spawnSync(command, args, { cwd: directory, encoding: 'utf8', timeout: 15000, maxBuffer: 1024 * 1024 });
        assert.ifError(result.error);
        assert.equal(result.status, 0, result.stderr || result.stdout || (command + ' exited ' + result.status));
        return result.stdout;
      };
      if (item.language === 'javascript') {
        assert.equal(run(process.execPath, [sourcePath]).trim(), expected);
      } else if (item.language === 'python') {
        assert.equal(run('python3', [sourcePath]).trim(), expected);
      } else if (item.language === 'java') {
        run('javac', ['Main.java']);
        assert.equal(run('java', ['Main']).trim(), expected);
      } else if (item.language === 'c') {
        run('gcc', ['-O2', 'main.c', '-o', 'main']);
        assert.equal(run('./main', []).trim(), expected);
      } else if (item.language === 'cpp') {
        run('g++', ['-std=c++20', '-O2', 'main.cpp', '-o', 'main']);
        assert.equal(run('./main', []).trim(), expected);
      }
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }
});

test('Universal editor guardrails reject oversized source and stdin before launching a runtime', async () => {
  const tooMuchCode = '// ' + 'x'.repeat(100 * 1024) + '\nconsole.log("unreachable");';
  const sourceResult = await universalExecutor.executeCode('javascript', tooMuchCode, '');
  assert.equal(sourceResult.success, false);
  assert.equal(sourceResult.stage, 'validation');
  assert.match(sourceResult.error, /100 KB execution limit/i);
  const inputResult = await universalExecutor.executeCode('javascript', "console.log('unreachable');", 'x'.repeat(20 * 1024 + 1));
  assert.equal(inputResult.success, false);
  assert.equal(inputResult.stage, 'validation');
  assert.match(inputResult.error, /20 KB/i);
});

test('Universal editor guardrails bound output and stop runaway JavaScript', async (t) => {
  const availability = universalExecutor.getRuntimeAvailability();
  if (!availability.executionAvailable) {
    t.skip('No working Bubblewrap sandbox or configured Judge0 provider is available in this test environment.');
    return;
  }
  const outputCode = "for (let i = 0; i < 20000; i++) console.log('output-line-' + i + '-xxxxxxxxxxxxxxxx');";
  const outputResult = await universalExecutor.executeCode('javascript', outputCode, '');
  assert.equal(outputResult.success, false);
  assert.match(outputResult.error, /output limit/i);
  assert.ok(Buffer.byteLength(String(outputResult.output || ''), 'utf8') <= 100 * 1024);
  const runawayResult = await universalExecutor.executeCode('javascript', 'while (true) {}', '');
  assert.equal(runawayResult.success, false);
  assert.match(runawayResult.error, /time limit|timed out/i);
});
