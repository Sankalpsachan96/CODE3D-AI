import { generateArenaChallenge, gradeArenaRepair } from '../services/aiChallengeService.js';

const languages = new Set(['c', 'cpp', 'java', 'javascript', 'python']);

export async function generateChallenge(req, res) {
  try {
    const { mode, language, difficulty = 'All levels', previousTitles = [] } = req.body || {};
    if (!['predict', 'repair'].includes(mode) || !languages.has(language)) {
      return res.status(400).json({ success: false, message: 'Choose a valid mode and one of the five supported languages.' });
    }
    if (!['All levels', 'Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({ success: false, message: 'Invalid difficulty.' });
    }
    if (!Array.isArray(previousTitles) || previousTitles.length > 8) {
      return res.status(400).json({ success: false, message: 'Invalid recent challenge history.' });
    }
    const challenge = await generateArenaChallenge({ mode, language, difficulty, previousTitles });
    return res.json({ success: true, challenge, provider: 'groq' });
  } catch (error) {
    console.warn('Predict & Repair generation failed:', error.message);
    return res.status(error.code === 'AI_NOT_CONFIGURED' ? 503 : 502).json({
      success: false, error: error.code || 'AI_CHALLENGE_FAILED',
      message: error.code === 'AI_NOT_CONFIGURED' ? error.message : 'AI could not generate a challenge. Please retry.',
    });
  }
}

export async function gradeRepair(req, res) {
  try {
    const { language, challenge, submittedCode } = req.body || {};
    if (!languages.has(language) || !challenge || typeof submittedCode !== 'string') {
      return res.status(400).json({ success: false, message: 'Invalid repair submission.' });
    }
    const result = await gradeArenaRepair({ language, challenge, submittedCode });
    return res.json({ success: true, ...result, provider: 'groq' });
  } catch (error) {
    console.warn('Predict & Repair grading failed:', error.message);
    return res.status(error.code === 'AI_NOT_CONFIGURED' ? 503 : 502).json({
      success: false, error: error.code || 'AI_GRADING_FAILED',
      message: error.code === 'AI_NOT_CONFIGURED' ? error.message : 'AI could not grade this submission. Please retry.',
    });
  }
}
