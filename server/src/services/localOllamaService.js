const DEFAULT_OLLAMA_URL = 'http://127.0.0.1:11434';
const ALLOWED_OLLAMA_MODELS = new Set([
  'qwen2.5:3b-instruct',
  'qwen2.5:3b',
  'qwen3:4b-instruct',
  'qwen3:4b',
]);

function clean(value, limit = 12000) {
  return String(value ?? '').slice(0, limit);
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];
  return history
    .filter((item) => item && (item.role === 'user' || item.role === 'assistant') && typeof item.content === 'string')
    .slice(-10)
    .map((item) => ({ role: item.role, content: clean(item.content, 3000) }));
}

function selectedModel() {
  const model = String(process.env.OLLAMA_MODEL || 'qwen2.5:3b-instruct').trim();
  if (!ALLOWED_OLLAMA_MODELS.has(model)) {
    const error = new Error('OLLAMA_MODEL "' + model + '" is not in the supported small Qwen allowlist.');
    error.code = 'OLLAMA_MODEL_NOT_ALLOWED';
    throw error;
  }
  return model;
}

export async function isOllamaAvailable() {
  const baseUrl = String(process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_URL).replace(/\/+$/, '');
  try {
    const response = await fetch(baseUrl + '/api/tags', { signal: AbortSignal.timeout(1500) });
    if (!response.ok) return false;
    const data = await response.json();
    const names = new Set((data?.models || []).map((item) => String(item.name || '')));
    return names.has(selectedModel());
  } catch {
    return false;
  }
}

export async function askLocalOllama({
  action = 'CHAT',
  code = '',
  language = 'java',
  output = [],
  error = null,
  question = '',
  history = [],
}) {
  const model = selectedModel();
  const baseUrl = String(process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_URL).replace(/\/+$/, '');
  const safeOutput = Array.isArray(output) ? output.join('\n') : String(output || '');
  const system = 'You are Code3D AI Tutor, a student-friendly programming and DSA tutor.\n' +
    'Use the supplied code, actual runtime output, and error accurately. Never invent program output or claim code ran if it did not. ' +
    'Explain concepts with simple steps and short examples. If the user asks for code, provide runnable code. ' +
    'Stay focused on programming, DSA, debugging, algorithms, and complexity. Current language: ' + clean(language, 40) +
    '. Action: ' + clean(action, 40) + '.\nCURRENT CODE:\n' + (clean(code, 12000) || '(No code supplied)') +
    '\nREAL PROGRAM OUTPUT:\n' + (clean(safeOutput, 6000) || '(No output yet)') +
    '\nREAL PROGRAM ERROR:\n' + (clean(error, 3000) || '(No error)');

  const messages = [
    { role: 'system', content: system },
    ...normalizeHistory(history),
    { role: 'user', content: clean(question, 3000) || 'Analyze the current code.' },
  ];

  let response;
  try {
    response = await fetch(baseUrl + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        options: { temperature: 0.2, num_predict: 1600 },
      }),
      signal: AbortSignal.timeout(120000),
    });
  } catch (cause) {
    const unavailable = new Error('Local Ollama is not reachable. Start Ollama and run the configured Qwen model, or switch AI_PROVIDER=groq.');
    unavailable.code = 'OLLAMA_UNAVAILABLE';
    unavailable.cause = cause;
    throw unavailable;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const failure = new Error(data?.error || ('Ollama request failed with HTTP ' + response.status + '.'));
    failure.code = 'OLLAMA_REQUEST_FAILED';
    failure.status = response.status;
    throw failure;
  }

  const answer = String(data?.message?.content || '').trim();
  if (!answer) {
    const failure = new Error('The local model returned an empty answer.');
    failure.code = 'OLLAMA_EMPTY_RESPONSE';
    throw failure;
  }

  return { answer, level: 'Beginner', provider: 'ollama', model };
}

export function getLocalOllamaConfig() {
  return {
    baseUrl: String(process.env.OLLAMA_BASE_URL || DEFAULT_OLLAMA_URL).replace(/\/+$/, ''),
    model: selectedModel(),
  };
}
