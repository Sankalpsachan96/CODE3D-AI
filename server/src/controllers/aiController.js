import { askCodeTutor } from '../services/aiTutorService.js';

export async function explainContext(req, res) {
  try {
    const {
      action = 'EXPLAIN_CODE',
      code = '',
      language = 'java',
      lineNumber = null,
      currentStep = null,
      output = [],
      error = null,
      detectedDsa = null,
      detectedAlgorithm = null,
      level = 'Beginner',
      stepNumber = null,
      question = '',
      history = [],
      requestedLanguage = null,
      questionCount = 10,
    } = req.body || {};

    // Bound the amount of user-controlled content forwarded to the AI provider.
    if (typeof code !== 'string' || code.length > 20000) {
      return res.status(413).json({
        success: false,
        error: { code: 'AI_CODE_LIMIT', message: 'Code must be a string of at most 20,000 characters.' },
      });
    }
    if (typeof question !== 'string' || question.length > 4000) {
      return res.status(413).json({
        success: false,
        error: { code: 'AI_QUESTION_LIMIT', message: 'Question must be a string of at most 4,000 characters.' },
      });
    }
    if (!Array.isArray(history) || history.length > 12) {
      return res.status(400).json({
        success: false,
        error: { code: 'AI_HISTORY_LIMIT', message: 'Conversation history may contain at most 12 messages.' },
      });
    }
    if (Array.isArray(output) && output.length > 40) {
      return res.status(413).json({
        success: false,
        error: { code: 'AI_OUTPUT_LIMIT', message: 'Output context may contain at most 40 lines.' },
      });
    }
    if (!Number.isInteger(questionCount) || questionCount < 1 || questionCount > 20) {
      return res.status(400).json({
        success: false,
        error: { code: 'AI_QUESTION_COUNT_LIMIT', message: 'Question count must be between 1 and 20.' },
      });
    }

    const response = await askCodeTutor({
      action,
      code,
      language,
      lineNumber,
      currentStep,
      output,
      error,
      detectedDsa,
      detectedAlgorithm,
      level,
      question,
      history,
      requestedLanguage,
      questionCount,
    });

    return res.json({
      success: true,
      action,
      stepNumber,
      ...response,
    });
  } catch (err) {
    if (err.code === 'AI_NOT_CONFIGURED') {
      return res.status(503).json({
        success: false,
        error: { code: err.code, message: err.message },
      });
    }
    console.warn('AI tutor upstream error:', err.message);
    return res.status(502).json({
      success: false,
      error: {
        code: err.code || 'AI_UPSTREAM_ERROR',
        message: 'AI provider error occurred while generating the tutor response.',
      },
    });
  }
}
