const topicNames = {
  'array-loop': '1D Arrays and Memory',
  matrix: '2D Matrices and Row-Major Order',
  'linked-list': 'Singly and Doubly Linked Lists',
  stack: 'Stack, LIFO and Monotonic Stack',
  queue: 'Queue, FIFO, Deque and Priority Queue',
  bst: 'Binary Search Tree',
  'trees-advanced': 'Advanced Trees, AVL and LCA',
  'bubble-sort': 'Bubble Sort',
  'binary-search': 'Binary Search',
  recursion: 'Recursion and Call Stack',
  graphs: 'Graph Algorithms, BFS, DFS and Dijkstra',
  'dp-hashing': 'Dynamic Programming and Hashing',
  'c-lang': 'C Pointers and Memory',
  'cpp-lang': 'C++ STL and Vectors',
  'python-lang': 'Python Lists and Dictionaries',
  'js-lang': 'JavaScript ES6+ and Event Loop',
};

import { apiRequest } from './api.js';

export async function generateAIQuiz(conceptId, questionCount = 10) {
  const topic = topicNames[conceptId] || conceptId;

  const prompt = `
You are an expert DSA and programming quiz generator.

Generate exactly ${questionCount} multiple-choice questions about:

TOPIC: ${topic}

Target level:
- BCA / B.Tech beginner to intermediate
- Test actual understanding
- Mix conceptual, output-based, complexity and algorithm questions where appropriate
- Do not repeat the same concept
- Avoid ambiguous questions
- Every question must have exactly 4 options
- Exactly ONE option must be correct

Return ONLY valid JSON.
Do not use markdown.
Do not add any text before or after the JSON.

Required JSON format:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctIndex": 0,
      "explanation": "Clear explanation of why the correct answer is correct."
    }
  ]
}

Rules:
- correctIndex must be 0, 1, 2 or 3.
- correctIndex must exactly match the correct option.
- Explanation must explain the concept.
- Do not put the answer inside the question.
- Do not create trick questions.
- Keep questions strictly relevant to ${topic}.
`;

  try {
    const data = await apiRequest('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({
        action: 'CHAT',
        level: 'Intermediate',
        language: 'javascript',
        code: '',
        output: [],
        question: prompt,
        history: [],
      }),
    });

    if (!data?.success) {
      throw new Error(data?.message || 'Quiz generation failed.');
    }

    // Backend AI response can be returned as answer/explanation
    const content =
      data?.answer ||
      data?.explanation ||
      data?.keyTakeaway ||
      '';

    if (!content) {
      throw new Error('AI returned an empty quiz response.');
    }

    // Remove accidental markdown fences if the model adds them
    const cleaned = String(content)
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (error) {
      console.error('AI raw quiz response:', content);
      throw new Error(
        'AI returned invalid quiz JSON. Please try again.'
      );
    }

    if (
      !parsed?.questions ||
      !Array.isArray(parsed.questions)
    ) {
      throw new Error(
        'AI did not return valid quiz questions.'
      );
    }

    const validQuestions = parsed.questions
      .filter((question) => {
        return (
          typeof question?.question === 'string' &&
          Array.isArray(question?.options) &&
          question.options.length === 4 &&
          Number.isInteger(question?.correctIndex) &&
          question.correctIndex >= 0 &&
          question.correctIndex <= 3 &&
          typeof question?.explanation === 'string'
        );
      })
      .map((question) => ({
        question: question.question.trim(),

        options: question.options.map((option) =>
          String(option).trim()
        ),

        correctIndex: question.correctIndex,

        explanation: question.explanation.trim(),
      }));

    if (validQuestions.length === 0) {
      throw new Error(
        'No valid questions were generated.'
      );
    }

    return validQuestions.slice(0, questionCount);
  } catch (error) {
    console.error('AI Quiz Error:', error);

    throw new Error(
      error?.message ||
        'Unable to generate AI quiz.'
    );
  }
}