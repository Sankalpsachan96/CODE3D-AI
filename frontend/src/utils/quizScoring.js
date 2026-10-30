export function addAnswerToScore(score, question, selectedOption) {
  return selectedOption === question?.correctIndex ? score + 1 : score;
}

// handleSubmit has already applied the submitted answer before finalization.
export function getFinalQuizScore(recordedScore) {
  return recordedScore;
}
