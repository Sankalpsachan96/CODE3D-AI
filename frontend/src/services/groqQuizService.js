const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

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

export async function generateAIQuiz(conceptId, questionCount = 10) {
  if (!GROQ_API_KEY) {
    throw new Error(
      'Groq API key not found. Add VITE_GROQ_API_KEY to frontend/.env and restart Vite.'
    );
  }

  const topic =
    topicNames[conceptId] || conceptId;

  const prompt = `
You are an expert DSA and programming quiz generator.

Generate exactly ${questionCount} multiple-choice questions about:

TOPIC: ${topic}

Target level:
- BCA / B.Tech beginner to intermediate
- Questions should test actual understanding
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
- The correctIndex must exactly match the correct option.
- Explanation must explain the concept, not just say the answer.
- Do not put the answer inside the question.
- Do not create trick questions.
- Keep questions relevant strictly to ${topic}.
`;

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'openai/gpt-oss-120b',
      temperature: 0.5,
      max_completion_tokens: 5000,
      response_format: {
        type: 'json_object',
      },
      messages: [
        {
          role: 'system',
          content:
            'You generate accurate programming and DSA quizzes. Return only valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `Groq request failed (${response.status}): ${errorText}`
    );
  }

  const data = await response.json();

  const content =
    data?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('Groq returned an empty response.');
  }

  let parsed;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    console.error('Groq raw response:', content);
    throw new Error(
      'Groq returned invalid JSON. Please try again.'
    );
  }

  if (
    !parsed.questions ||
    !Array.isArray(parsed.questions) ||
    parsed.questions.length === 0
  ) {
    throw new Error(
      'Groq did not return valid quiz questions.'
    );
  }

  const validQuestions = parsed.questions
    .filter((question) => {
      return (
        typeof question.question === 'string' &&
        Array.isArray(question.options) &&
        question.options.length === 4 &&
        Number.isInteger(question.correctIndex) &&
        question.correctIndex >= 0 &&
        question.correctIndex <= 3 &&
        typeof question.explanation === 'string'
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
}