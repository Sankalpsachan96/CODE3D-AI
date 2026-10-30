import assert from 'node:assert/strict';
import test from 'node:test';
import { addAnswerToScore, getFinalQuizScore } from '../src/utils/quizScoring.js';

test('a correct final answer is counted exactly once', () => {
  const afterSubmit = addAnswerToScore(4, { correctIndex: 2 }, 2);
  assert.equal(afterSubmit, 5);
  assert.equal(getFinalQuizScore(afterSubmit), 5);
});

test('an incorrect final answer does not increase the score', () => {
  const afterSubmit = addAnswerToScore(4, { correctIndex: 2 }, 1);
  assert.equal(afterSubmit, 4);
  assert.equal(getFinalQuizScore(afterSubmit), 4);
});
