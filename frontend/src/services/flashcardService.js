import { apiRequest } from './api.js';

export const LEVELS = [
  { name: 'Beginner', hint: 'basic definitions and simple facts, one idea per card' },
  { name: 'Easy', hint: 'core concepts, operations and basic complexities' },
  { name: 'Medium', hint: 'small traces, operations and comparing approaches' },
  { name: 'Hard', hint: 'edge cases, trade-offs and complexity analysis' },
  { name: 'Expert', hint: 'interview-level reasoning and optimisation pitfalls' },
];
const ANGLES = ['definitions and terminology', 'time and space complexity', 'step-by-step examples', 'common mistakes', 'real-world uses', 'compare related concepts', 'edge cases'];

export async function generateFlashcards({ topic, levelIndex = 0, count = 5, avoid = [] }) {
  const level = LEVELS[Math.min(Math.max(Number(levelIndex) || 0, 0), LEVELS.length - 1)];
  const safeTopic = String(topic || '').replace(/\s+/g, ' ').trim().slice(0, 60);
  if (!safeTopic) throw new Error('Please choose a topic.');
  const angle = ANGLES[Math.floor(Math.random() * ANGLES.length)];
  const avoidList = avoid.slice(-30).map((q) => '- ' + String(q).slice(0, 120)).join('\n');
  const prompt = `Create exactly ${count} high-quality DSA study flashcards about: ${safeTopic}
Difficulty: ${level.name} (${level.hint}). Focus angle: ${angle}.
Each question must be under 25 words and have one concise correct answer under 15 words.
Return four options with the correct answer at correctIndex. Add a useful 1-2 sentence explanation.
Be technically accurate, avoid ambiguous/trick questions, and don't repeat these earlier questions:
${avoidList || '(none)'}`;
  const data = await apiRequest('/ai/explain', {
    method: 'POST',
    body: JSON.stringify({ action: 'QUIZ_GENERATE', level: level.name, language: 'javascript', code: '', output: [], question: prompt, history: [], questionCount: count }),
  });
  if (!data?.success || !Array.isArray(data.questions)) throw new Error(data?.message || 'Could not generate flashcards.');
  const stamp = Date.now();
  const cards = data.questions.map((q, i) => ({
    id: `ai-${stamp}-${i}`, front: String(q?.question || '').trim(),
    back: String(q?.options?.[q?.correctIndex] || '').trim(),
    explain: String(q?.explanation || '').trim(), level: level.name,
  })).filter((c) => c.front && c.back);
  if (!cards.length) throw new Error('AI returned no usable flashcards. Please try again.');
  return cards.slice(0, count);
}