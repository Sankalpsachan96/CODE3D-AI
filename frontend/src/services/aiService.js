/**
 * CODE3D-AI - Standardized AI Service Interface
 * 
 * Complies strictly with Section 45:
 * If an AI backend isn't configured, reports: 'AI service is not configured.'
 * Never returns fake hardcoded responses.
 */

import { apiRequest } from './api.js';

export class AIService {
  static isConfigured() {
    return Boolean(import.meta.env.VITE_AI_ENABLED === 'true' || import.meta.env.VITE_AI_API_KEY);
  }

  static async explainCode(code, language = 'java') {
    if (!this.isConfigured()) {
      return {
        configured: false,
        message: 'AI service is not configured. Configure VITE_AI_API_KEY to enable live AI code explanations.',
      };
    }
    try {
      return await apiRequest('/ai/explain-code', {
        method: 'POST',
        body: JSON.stringify({ code, language }),
      });
    } catch (err) {
      return { configured: true, error: err.message };
    }
  }

  static async explainStep(step, code, language = 'java') {
    if (!this.isConfigured()) {
      return {
        configured: false,
        message: 'AI service is not configured. Configure VITE_AI_API_KEY to enable live AI step insights.',
      };
    }
    try {
      return await apiRequest('/ai/explain-step', {
        method: 'POST',
        body: JSON.stringify({ step, code, language }),
      });
    } catch (err) {
      return { configured: true, error: err.message };
    }
  }

  static async explainError(error, code, language = 'java') {
    if (!this.isConfigured()) {
      return {
        configured: false,
        message: 'AI service is not configured. Configure VITE_AI_API_KEY to enable live AI error diagnostics.',
      };
    }
    try {
      return await apiRequest('/ai/explain-error', {
        method: 'POST',
        body: JSON.stringify({ error, code, language }),
      });
    } catch (err) {
      return { configured: true, error: err.message };
    }
  }

  static async generateHints(problemTitle, code) {
    if (!this.isConfigured()) {
      return {
        configured: false,
        message: 'AI service is not configured. Configure VITE_AI_API_KEY to enable live AI problem hints.',
      };
    }
    try {
      return await apiRequest('/ai/hints', {
        method: 'POST',
        body: JSON.stringify({ problemTitle, code }),
      });
    } catch (err) {
      return { configured: true, error: err.message };
    }
  }

  static async identifyAlgorithm(code) {
    if (!this.isConfigured()) {
      return {
        configured: false,
        message: 'AI service is not configured.',
      };
    }
    try {
      return await apiRequest('/ai/identify-algorithm', {
        method: 'POST',
        body: JSON.stringify({ code }),
      });
    } catch (err) {
      return { configured: true, error: err.message };
    }
  }
}
