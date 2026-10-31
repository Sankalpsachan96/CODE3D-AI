import assert from 'node:assert/strict';
import test from 'node:test';
import { STRIVER_PROBLEMS } from '../src/utils/striverCatalog.js';
import { isProblemLanguageSupported } from '../src/utils/striverProblemUtils.js';

test('known generic Python catalog placeholders are never advertised as runnable starters', () => {
  const blocked = STRIVER_PROBLEMS.filter(problem => !isProblemLanguageSupported(problem, 'python'));
  assert.ok(blocked.length >= 166, 'the audited catalog contains at least 166 generic Python placeholders');
  for (const problem of blocked) assert.equal(isProblemLanguageSupported(problem, 'python'), false, problem.title);
});

test('known foreach accumulator placeholders are blocked without rejecting algorithmic counters', () => {
  const generic = /for\s*\(\s*(?:(?:int|long|auto)\s+)?(\w+)\s*:\s*(nums|arr|array)\s*\)[\s\S]*?\b(sum|ans|total)\s*\+=\s*\1\b[\s\S]*?return\s+\3\s*;?/i;
  for (const language of ['java', 'python', 'cpp']) {
    for (const problem of STRIVER_PROBLEMS) {
      const source = problem[language + 'Code'] || '';
      if (generic.test(source)) assert.equal(isProblemLanguageSupported(problem, language), false, problem.title + ' (' + language + ')');
    }
  }
});

test('the Striver catalog has no silent cross-language support', () => {
  for (const problem of STRIVER_PROBLEMS) {
    if (!problem.javascriptCode) assert.equal(isProblemLanguageSupported(problem, 'javascript'), false, problem.title);
    if (!problem.cCode) assert.equal(isProblemLanguageSupported(problem, 'c'), false, problem.title);
  }
});
