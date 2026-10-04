/**
 * CODE3D-AI - Language Dispatcher
 */

import { JavaAdapter } from './JavaAdapter.js';
import { JavaScriptAdapter } from './JavaScriptAdapter.js';
import { PythonAdapter } from './PythonAdapter.js';
import { CppAdapter } from './CppAdapter.js';
import { CAdapter } from './CAdapter.js';

export const languageAdapters = {
  java: new JavaAdapter(),
  javascript: new JavaScriptAdapter(),
  python: new PythonAdapter(),
  cpp: new CppAdapter(),
  c: new CAdapter(),
};

export function getLanguageAdapter(lang = 'java') {
  const normalized = (lang || 'java').toLowerCase().trim();
  return languageAdapters[normalized] || languageAdapters.java;
}

export function detectLanguage(code) {
  if (!code || typeof code !== 'string') return 'java';
  for (const [name, adapter] of Object.entries(languageAdapters)) {
    if (adapter.detect(code)) return name;
  }
  return 'java';
}
