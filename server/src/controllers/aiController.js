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
    } = req.body || {};

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
