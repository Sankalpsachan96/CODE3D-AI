import { JavaScriptTraceAdapter } from './JavaScriptTraceAdapter.js';
import { PythonTraceAdapter } from './PythonTraceAdapter.js';
import { JavaTraceAdapter } from './JavaTraceAdapter.js';
import { CppTraceAdapter } from './CppTraceAdapter.js';
import { CTraceAdapter } from './CTraceAdapter.js';

export const adapters = {
  javascript: new JavaScriptTraceAdapter(),
  js: new JavaScriptTraceAdapter(),
  python: new PythonTraceAdapter(),
  py: new PythonTraceAdapter(),
  java: new JavaTraceAdapter(),
  cpp: new CppTraceAdapter(),
  'c++': new CppTraceAdapter(),
  c: new CTraceAdapter(),
};

export function getAdapter(language) {
  if (!language) return adapters.java;
  const normalized = language.toLowerCase().trim();
  const adapter = adapters[normalized];
  if (!adapter) {
    throw new Error(`Unsupported language: '${language}'. Supported languages: java, cpp, python, javascript, c`);
  }
  return adapter;
}
