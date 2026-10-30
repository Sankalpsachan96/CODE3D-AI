import assert from 'node:assert/strict';
import test from 'node:test';
import { buildStarterCode, isProblemLanguageSupported } from '../src/utils/striverProblemUtils.js';

test('unsupported Striver languages never receive another language source', () => {
  const problem = { title: 'Example', javaCode: 'class Solution { public int f() { return 1; } }', pythonCode: 'class Solution:\n    def f(self):\n        return 1' };
  assert.equal(buildStarterCode(problem, 'javascript'), '');
  assert.equal(buildStarterCode(problem, 'c'), '');
  assert.equal(isProblemLanguageSupported(problem, 'javascript'), false);
  assert.equal(isProblemLanguageSupported(problem, 'c'), false);
});

test('available C and JavaScript sources produce native starter shells', () => {
  const problem = { title: 'Example', cCode: 'int f(void) { return 1; }', javascriptCode: 'function f() { return 1; }' };
  assert.match(buildStarterCode(problem, 'c'), /#include <stdio.h>/);
  assert.match(buildStarterCode(problem, 'javascript'), /function solve/);
});

test('known generic sum-only placeholder solutions are not considered supported', () => {
  const problem = {
    title: 'Dijkstra',
    pythonCode: 'class Solution:\n    def shortestPath(self, nums):\n        return sum(nums)',
    cppCode: 'class Solution { public: int shortestPath(vector<int>& nums) { return accumulate(nums.begin(), nums.end(), 0); } };',
  };
  assert.equal(isProblemLanguageSupported(problem, 'python'), false);
  assert.equal(isProblemLanguageSupported(problem, 'cpp'), false);
  assert.equal(buildStarterCode(problem, 'python'), '');
  assert.equal(buildStarterCode(problem, 'cpp'), '');
});
