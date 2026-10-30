import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildStarterCode,
  getProblemSupportedLanguages,
  isProblemLanguageSupported,
} from '../src/utils/striverProblemUtils.js';

const problem = {
  title: 'Example',
  description: 'Test problem',
  javaCode: 'class Solution { public int solve() { return 1; } }',
  cppCode: 'class Solution { public: int solve() { return 1; } };',
  pythonCode: 'class Solution:\n    def solve(self):\n        return 1',
};

test('catalog languages are reported only when an implementation exists', () => {
  assert.deepEqual(getProblemSupportedLanguages(problem), ['java', 'cpp', 'python']);
});

test('Java, C++ and Python receive their own source code', () => {
  assert.equal(buildStarterCode(problem, 'java').includes('class Solution'), true);
  assert.equal(buildStarterCode(problem, 'cpp').includes('public:'), true);
  assert.equal(buildStarterCode(problem, 'python').includes('def solve'), true);
});

test('JavaScript never falls back to Python source', () => {
  assert.equal(isProblemLanguageSupported(problem, 'javascript'), false);
  assert.equal(buildStarterCode(problem, 'javascript'), '');
});

test('C never falls back to Java source', () => {
  assert.equal(isProblemLanguageSupported(problem, 'c'), false);
  assert.equal(buildStarterCode(problem, 'c'), '');
});

test('unknown languages never silently fall back to Java', () => {
  assert.equal(buildStarterCode(problem, 'rust'), '');
  assert.equal(isProblemLanguageSupported(problem, 'rust'), false);
});

test('a genuine language-specific implementation is accepted', () => {
  const withCAndJs = {
    ...problem,
    cCode: 'int solve(void) { return 1; }',
    javascriptCode: 'function solve() { return 1; }',
  };
  assert.equal(buildStarterCode(withCAndJs, 'c'), withCAndJs.cCode);
  assert.equal(buildStarterCode(withCAndJs, 'javascript'), withCAndJs.javascriptCode);
});
