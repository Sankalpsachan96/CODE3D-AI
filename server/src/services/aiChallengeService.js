const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const MODELS = ['openai/gpt-oss-120b', 'openai/gpt-oss-20b'];
const LANGUAGES = new Set(['c', 'cpp', 'java', 'javascript', 'python']);

async function askGroq(messages, schema, temperature = 0.8) {
  const key = String(process.env.GROQ_API_KEY || '').trim();
  if (!key) {
    const error = new Error('AI is not configured on the server. Set GROQ_API_KEY in Render environment variables.');
    error.code = 'AI_NOT_CONFIGURED';
    throw error;
  }
  let lastError;
  for (const model of MODELS) {
    try {
      const response = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model, temperature, max_completion_tokens: 1800, messages,
          response_format: schema
            ? { type: 'json_schema', json_schema: { name: 'code3d_arena', strict: true, schema } }
            : { type: 'json_object' },
          include_reasoning: false,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error?.message || `Groq request failed (${response.status})`);
      const raw = data?.choices?.[0]?.message?.content || '';
      return JSON.parse(raw);
    } catch (error) {
      lastError = error;
    }
  }
  const error = new Error(lastError?.message || 'AI could not generate a valid challenge. Please try again.');
  error.code = 'AI_CHALLENGE_FAILED';
  throw error;
}

const schemas = {
  predict: {
    type: 'object',
    properties: {
      title: { type: 'string' }, topic: { type: 'string' }, difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
      code: { type: 'string' }, options: { type: 'array', minItems: 4, maxItems: 4, items: { type: 'string' } },
      correctIndex: { type: 'integer', minimum: 0, maximum: 3 }, explanation: { type: 'string' },
    },
    required: ['title', 'topic', 'difficulty', 'code', 'options', 'correctIndex', 'explanation'],
    additionalProperties: false,
  },
  repair: {
    type: 'object',
    properties: {
      title: { type: 'string' }, topic: { type: 'string' }, difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
      prompt: { type: 'string' }, code: { type: 'string' }, expectedOutput: { type: 'string' },
      solutionCode: { type: 'string' }, explanation: { type: 'string' },
    },
    required: ['title', 'topic', 'difficulty', 'prompt', 'code', 'expectedOutput', 'solutionCode', 'explanation'],
    additionalProperties: false,
  },
};

export async function generateArenaChallenge({ mode, language, difficulty, previousTitles = [] }) {
  if (!['predict', 'repair'].includes(mode)) throw new Error('Invalid challenge mode.');
  if (!LANGUAGES.has(language)) throw new Error('Unsupported programming language.');
  const schema = schemas[mode];
  const recent = previousTitles.slice(0, 8).map((title) => String(title).slice(0, 120));
  const task = mode === 'predict'
    ? 'Create one original code-tracing question. Provide exactly four distinct plausible output choices and the correct choice index. The code must compile/run in the requested language and be deterministic.'
    : 'Create one original debugging exercise. Provide intentionally buggy code, a clear repair instruction, the expected output after a correct repair, a complete correct solutionCode, and a concise explanation. The buggy code must contain a real, fixable logic or syntax bug.';
  const result = await askGroq([
    { role: 'system', content: `You create rigorous, student-friendly DSA and programming challenges for Code Vision 3D. Return only the requested JSON. Use authentic ${language} syntax, idioms and output conventions. Vary concepts across arrays, strings, stacks, queues, linked lists, recursion, searching, sorting, trees, graphs, hashing, pointers/references, loops and complexity. Avoid repeating recent titles or near-identical problem patterns. Ensure all code is short, self-contained and deterministic. ${task}` },
    { role: 'user', content: `Mode: ${mode}. Language: ${language}. Difficulty preference: ${difficulty}. Recently used titles to avoid: ${recent.join(' | ') || 'none'}. Generate a fresh challenge now.` },
  ], schema, 0.85);
  if (mode === 'predict' && (!result.code || result.options?.length !== 4 || !result.options[result.correctIndex])) throw new Error('AI returned an incomplete prediction challenge.');
  if (mode === 'repair' && (!result.code || !result.solutionCode || !result.expectedOutput)) throw new Error('AI returned an incomplete repair challenge.');
  return { ...result, mode, language, id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
}

export async function gradeArenaRepair({ language, challenge, submittedCode }) {
  if (!LANGUAGES.has(language) || !challenge?.solutionCode || typeof submittedCode !== 'string' || submittedCode.length > 20000) {
    throw new Error('Invalid repair submission.');
  }
  const schema = {
    type: 'object',
    properties: { correct: { type: 'boolean' }, feedback: { type: 'string' }, explanation: { type: 'string' } },
    required: ['correct', 'feedback', 'explanation'], additionalProperties: false,
  };
  const result = await askGroq([
    { role: 'system', content: 'You are a strict programming exercise grader. Judge semantic correctness, not exact text equality. Accept equivalent implementations that solve the stated task and produce the expected behaviour. Reject code that merely prints the expected output, has unrelated hardcoding, or leaves the bug unfixed. Return concise feedback in JSON only.' },
    { role: 'user', content: `Language: ${language}\nTask: ${challenge.prompt}\nExpected behaviour/output: ${challenge.expectedOutput}\nReference solution (for judging only):\n${challenge.solutionCode}\nStudent submission:\n${submittedCode}\nIs the submission a valid general solution to the task?` },
  ], schema, 0.1);
  return result;
}
