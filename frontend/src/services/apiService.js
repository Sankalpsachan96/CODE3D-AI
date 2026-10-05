/**
 * API Client connecting the CODE3D AI frontend to the Spring Boot REST backend.
 */

import { solvePersonalProblem, correctPersonalCode } from './personalProblemSolver';

const LIVE_RENDER_URL = 'https://code3d-ai.onrender.com/api';
const LOCAL_URL = 'http://localhost:5000/api';

// When accessed from phone, GitHub Pages, or Vercel, always use the live Render backend!
const isLocalhost =
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

const BACKEND_BASE_URL =
  import.meta.env.VITE_BACKEND_URL ||
  (isLocalhost ? LOCAL_URL : LIVE_RENDER_URL);

async function smartFetch(endpoint, options = {}) {
  const fetchOpts = {
    ...options,
    credentials: 'include',
  };

  try {
    const res = await fetch(
      `${BACKEND_BASE_URL}${endpoint}`,
      fetchOpts
    );

    return res;
  } catch (err) {
    // If local fetch failed, fallback to live Render cloud backend
    if (BACKEND_BASE_URL !== LIVE_RENDER_URL) {
      try {
        console.warn(
          `Local backend unreachable at ${BACKEND_BASE_URL}. Falling back to live cloud backend...`
        );

        return await fetch(
          `${LIVE_RENDER_URL}${endpoint}`,
          fetchOpts
        );
      } catch (fallbackErr) {
        console.warn(
          'Live backend also unreachable:',
          fallbackErr
        );
      }
    }

    throw err;
  }
}

export async function checkBackendHealth() {
  try {
    const res = await smartFetch('/health', {
      method: 'GET'
    });

    return res.ok;
  } catch (err) {
    return false;
  }
}

export async function fetchDsaConcepts() {
  try {
    const res = await smartFetch('/dsa/topics');

    if (!res.ok) {
      throw new Error('Failed to fetch DSA concepts');
    }

    return await res.json();
  } catch (err) {
    console.warn(
      'Backend unavailable, using local DSA concept catalog'
    );

    return null;
  }
}

export async function executeProgram(
  code,
  conceptId = null,
  language = 'java',
  input = null,
  universal = false
) {
  try {
    const res = await smartFetch('/execute', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        conceptId,
        language,
        input,
        title: conceptId || 'Custom Execution',
        universal,
      }),
    });

    if (!res.ok) {
      let message = 'Execution failed on backend';

      try {
        const data = await res.json();

        message =
          data?.message ||
          data?.error?.message ||
          message;
      } catch (_) {}

      throw new Error(message);
    }

    return await res.json();
  } catch (err) {
    console.warn(
      'Backend execution unavailable:',
      err
    );

    return null;
  }
}

// Projects API (Section 13)

export async function fetchProjects() {
  try {
    const res = await smartFetch('/projects');

    if (!res.ok) {
      throw new Error('Failed to fetch projects');
    }

    return await res.json();
  } catch (err) {
    return {
      success: false,
      projects: []
    };
  }
}

export async function saveProject(projectData) {
  try {
    const res = await smartFetch('/projects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(projectData),
    });

    return await res.json();
  } catch (err) {
    return {
      success: false,
      message: 'Failed to save project.'
    };
  }
}

export async function deleteProject(id) {
  try {
    const res = await smartFetch(
      `/projects/${id}`,
      {
        method: 'DELETE'
      }
    );

    return await res.json();
  } catch (err) {
    return {
      success: false,
      message: 'Failed to delete project.'
    };
  }
}

// Quiz Attempts API (Section 48)

export async function saveQuizAttempt(attemptData) {
  try {
    const res = await smartFetch('/quiz/attempts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(attemptData),
    });

    return await res.json();
  } catch (err) {
    return {
      success: false,
      message: 'Failed to save quiz attempt.'
    };
  }
}

export async function fetchQuizAttempts() {
  try {
    const res = await smartFetch('/quiz/attempts');

    if (!res.ok) {
      throw new Error(
        'Failed to fetch quiz attempts'
      );
    }

    return await res.json();
  } catch (err) {
    return {
      success: false,
      attempts: []
    };
  }
}

// Backward compatible alias

export const executeJavaProgram = executeProgram;

export async function analyzeCode(
  code,
  language = 'java'
) {
  try {
    const res = await smartFetch('/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        language
      }),
    });

    if (!res.ok) {
      throw new Error(
        'Analysis failed on backend'
      );
    }

    return await res.json();
  } catch (err) {
    console.warn(
      'Backend analysis unavailable:',
      err
    );

    return null;
  }
}

// Backward compatible alias

export const analyzeJavaCode = analyzeCode;

export async function requestAiExplanation(
  code,
  lineNumber,
  stepNumber,
  queryType,
  level,
  language = 'java',
  context = {}
) {
  try {
    const res = await smartFetch('/ai/explain', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code,
        lineNumber,
        stepNumber,
        action: queryType,
        level,
        language,
        currentStep:
          context.currentStep || null,
        output:
          context.output || [],
        error:
          context.error || null,
        detectedDsa:
          context.detectedDsa || null,
        detectedAlgorithm:
          context.detectedAlgorithm || null,
        question:
          context.question || null,
      }),
    });

    if (!res.ok) {
      throw new Error(
        'AI explanation request failed'
      );
    }

    return await res.json();
  } catch (err) {
    console.warn(
      'AI explanation unavailable:',
      err
    );

    return null;
  }
}

export async function fetchQuizQuestions(
  conceptId
) {
  try {
    const res = await smartFetch(
      `/quiz?conceptId=${encodeURIComponent(
        conceptId
      )}`
    );

    if (!res.ok) {
      throw new Error('Quiz fetch failed');
    }

    return await res.json();
  } catch (err) {
    console.warn(
      'Quiz service unavailable:',
      err
    );

    return null;
  }
}

// User Authentication API

export async function loginUser(credentials) {
  try {
    const res = await smartFetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials),
    });

    return await res.json();
  } catch (err) {
    console.warn(
      'Login request failed:',
      err
    );

    return {
      success: false,
      message:
        'Backend unreachable. Please check connection.'
    };
  }
}

export async function registerUser(userData) {
  try {
    const res = await smartFetch('/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData),
    });

    return await res.json();
  } catch (err) {
    console.warn(
      'Registration request failed:',
      err
    );

    return {
      success: false,
      message:
        'Backend unreachable. Please check connection.'
    };
  }
}

const STORAGE_KEY_EXECUTIONS =
  'code3d_db_executions_v2';

const STORAGE_KEY_QUIZZES =
  'code3d_db_quizzes_v2';

function isStorageAvailable() {
  try {
    return (
      typeof window !== 'undefined' &&
      !!window.localStorage
    );
  } catch (e) {
    return false;
  }
}

function getLocalExecutions() {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY_EXECUTIONS
      );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (e) {
    console.warn(
      'Recovered from corrupted execution history in localStorage:',
      e
    );

    return [];
  }
}

function saveLocalExecutions(list) {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    const safeList = Array.isArray(list)
      ? list.slice(0, 100)
      : [];

    localStorage.setItem(
      STORAGE_KEY_EXECUTIONS,
      JSON.stringify(safeList)
    );
  } catch (e) {
    console.warn(
      'Storage quota exceeded or error writing executions to localStorage:',
      e
    );
  }
}

function getLocalQuizzes() {
  if (!isStorageAvailable()) {
    return [];
  }

  try {
    const raw =
      localStorage.getItem(
        STORAGE_KEY_QUIZZES
      );

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);

    return Array.isArray(parsed)
      ? parsed
      : [];
  } catch (e) {
    console.warn(
      'Recovered from corrupted quiz history in localStorage:',
      e
    );

    return [];
  }
}

function saveLocalQuizzes(list) {
  if (!isStorageAvailable()) {
    return;
  }

  try {
    const safeList = Array.isArray(list)
      ? list.slice(0, 50)
      : [];

    localStorage.setItem(
      STORAGE_KEY_QUIZZES,
      JSON.stringify(safeList)
    );
  } catch (e) {
    console.warn(
      'Storage quota exceeded or error writing quizzes to localStorage:',
      e
    );
  }
}

/**
 * Record a code execution event using the current backend.
 * The backend owns persistence and derives the user from the session.
 */

export async function recordExecutionHistory({
  programTitle,
  conceptId,
  language = 'java',
  totalSteps = 1,
  status = 'COMPLETED',
  code = '',
  output = '',
  input = ''
}) {
  const payload = {
    title:
      programTitle ||
      'Custom Execution',
    language,
    code,
    input,
    status,
    totalSteps,
    output:
      Array.isArray(output)
        ? output.join('\n')
        : String(output || ''),
    conceptId:
      conceptId || 'custom'
  };

  try {
    const res = await smartFetch(
      '/history/execution',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body:
          JSON.stringify(payload)
      }
    );

    if (res.ok) {
      const data =
        await res.json();

      return (
        data?.record ||
        data
      );
    }
  } catch (err) {
    console.warn(
      'Execution history sync unavailable:',
      err
    );
  }

  const local = {
    id: `local-${Date.now()}`,
    programTitle:
      payload.title,
    conceptId:
      payload.conceptId,
    language:
      payload.language,
    totalSteps:
      payload.totalSteps,
    status:
      payload.status,
    code:
      payload.code,
    output:
      payload.output,
    input:
      payload.input,
    executedAt:
      new Date().toISOString()
  };

  const list =
    getLocalExecutions();

  list.unshift(local);

  saveLocalExecutions(list);

  return local;
}

/**
 * Record a quiz attempt in the current Prisma backend.
 */

export async function recordQuizHistory({
  conceptId,
  score = 0,
  totalQuestions = 1,
  accuracy,
  answers = null,
  quizMode = 'AI'
}) {
  const percentage =
    accuracy !== undefined
      ? accuracy
      : Math.round(
          (score /
            Math.max(
              1,
              totalQuestions
            )) *
            100
        );

  const quizRecord = {
    id: `quiz-${Date.now()}`,
    conceptId:
      conceptId || 'general',
    score,
    totalQuestions,
    accuracy:
      percentage,
    completedAt:
      new Date().toISOString()
  };

  try {
    const res =
      await smartFetch(
        '/quiz/attempts',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            quizMode,
            category:
              conceptId ||
              'general',
            score,
            totalQuestions,
            percentage,
            answers
          })
        }
      );

    if (res.ok) {
      const data =
        await res.json();

      const record =
        data?.attempt ||
        data?.record ||
        data;

      return {
        id:
          record?.id ||
          quizRecord.id,

        conceptId:
          record?.category ||
          record?.conceptId ||
          quizRecord.conceptId,

        score:
          record?.score ??
          score,

        totalQuestions:
          record?.totalQuestions ??
          totalQuestions,

        accuracy:
          record?.percentage ??
          record?.accuracy ??
          percentage,

        completedAt:
          record?.createdAt ||
          record?.completedAt ||
          quizRecord.completedAt
      };
    }
  } catch (err) {
    console.warn(
      'Quiz history persistence unavailable, using local fallback:',
      err
    );
  }

  // Backend unavailable -> save quiz locally
  const localQuizzes =
    getLocalQuizzes();

  localQuizzes.unshift({
    ...quizRecord,
    quizMode
  });

  saveLocalQuizzes(
    localQuizzes
  );

  return quizRecord;
}

/**
 * Retrieve current authenticated execution + quiz history.
 */

export async function getExecutionHistory() {
  let executionData = null;
  let quizData = null;

  try {
    const res =
      await smartFetch(
        '/history'
      );

    if (res.ok) {
      executionData =
        await res.json();
    }
  } catch (err) {
    console.warn(
      'Execution history unavailable:',
      err
    );
  }

  try {
    const res =
      await smartFetch(
        '/quiz/attempts'
      );

    if (res.ok) {
      quizData =
        await res.json();
    }
  } catch (err) {
    console.warn(
      'Quiz history unavailable:',
      err
    );
  }

  const rawExecutions =
    (
      executionData?.history ||
      executionData?.recentExecutions ||
      []
    ).concat(
      executionData
        ? []
        : getLocalExecutions()
    );

  const rawQuizzes =
    (
      quizData?.attempts ||
      quizData?.history ||
      quizData?.recentQuizzes ||
      []
    ).concat(
      quizData
        ? []
        : getLocalQuizzes()
    );

  const recentExecutions =
    rawExecutions.map(
      (rec) => ({
        id: rec.id,

        programTitle:
          rec.programTitle ||
          rec.title ||
          rec.programName ||
          'Custom Execution',

        conceptId:
          rec.conceptId ||
          'custom',

        language:
          rec.language ||
          'java',

        totalSteps:
          rec.totalSteps ??
          rec.stepCount ??
          0,

        status:
          rec.status ||
          rec.executionStatus ||
          'COMPLETED',

        code:
          rec.code ||
          rec.codeSnapshot ||
          '',

        input:
          rec.input ||
          '',

        output:
          rec.output ||
          '',

        executionTimeMs:
          rec.executionTimeMs ??
          0,

        executedAt:
          rec.executedAt ||
          rec.createdAt ||
          new Date().toISOString(),

        traceJson:
          rec.traceJson ||
          null
      })
    );

  const recentQuizzes =
    rawQuizzes.map(
      (q) => ({
        id: q.id,

        conceptId:
          q.conceptId ||
          q.category ||
          'general',

        score:
          q.score ?? 0,

        totalQuestions:
          q.totalQuestions ?? 0,

        accuracy:
          q.accuracy ??
          q.percentage ??
          0,

        completedAt:
          q.completedAt ||
          q.createdAt ||
          new Date().toISOString()
      })
    );

  return {
    totalExecutionsCount:
      executionData?.totalExecutionsCount ??
      recentExecutions.length,

    totalQuizzesTaken:
      quizData?.totalQuizzesTaken ??
      quizData?.total ??
      recentQuizzes.length,

    recentExecutions,

    recentQuizzes,

    isBackendConnected:
      Boolean(
        executionData ||
        quizData
      )
  };
}

export async function clearExecutionHistory() {
  try {
    await smartFetch(
      '/history',
      {
        method: 'DELETE'
      }
    );
  } catch (err) {
    console.warn(
      'Could not clear server history:',
      err
    );
  }

  try {
    localStorage.removeItem(
      STORAGE_KEY_EXECUTIONS
    );

    localStorage.removeItem(
      STORAGE_KEY_QUIZZES
    );
  } catch {}

  return true;
}
// Personal Problem Solver & Auto-Correction API

export async function correctAndVisualizeCode(
  code,
  language = 'java'
) {
  try {
    const res = await smartFetch(
      '/code/correct-and-visualize',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code,
          language
        }),
      }
    );

    if (res.ok) {
      const data =
        await res.json();

      if (
        data &&
        data.correctedCode
      ) {
        return data;
      }
    }
  } catch (err) {
    console.warn(
      'Backend Personal Problem Solver API unavailable, activating client solver:',
      err
    );
  }

  // Guaranteed client-side personal problem solver and 3D trace generator fallback
  return solvePersonalProblem(
    code,
    language
  );
}

export async function autoCorrectCode(
  code,
  language = 'java'
) {
  try {
    const res =
      await smartFetch(
        '/code/correct-and-visualize',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json'
          },
          body: JSON.stringify({
            code,
            language
          }),
        }
      );

    if (res.ok) {
      const data =
        await res.json();

      if (
        data &&
        data.correctedCode
      ) {
        return data;
      }
    }
  } catch (err) {
    console.warn(
      'Backend auto-correct API unavailable, using client corrector:',
      err
    );
  }

  return correctPersonalCode(
    code,
    language
  );
}

export const solveAndVisualizePersonalProblem =
  correctAndVisualizeCode;

export async function getAiExplanation({
  code,
  language = 'java',
  question = ''
}) {
  const res =
    await smartFetch(
      '/ai/explain',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/json'
        },
        body: JSON.stringify({
          code,
          language,
          action: 'ANALYZE_CODE',
          level: 'Beginner',
          question,
          output: []
        }),
      }
    );

  const data =
    await res.json();

  if (
    !res.ok ||
    !data?.success
  ) {
    throw new Error(
      data?.error?.message ||
      'AI analysis unavailable'
    );
  }

  const local =
    await analyzeCode(
      code,
      language
    );

  return {
    success: true,

    title:
      data.title ||
      'AI Code Analysis',

    timeComplexity:
      data.timeComplexity ||
      local?.timeComplexity ||
      '—',

    spaceComplexity:
      data.spaceComplexity ||
      local?.spaceComplexity ||
      '—',

    explanation:
      data.explanation ||
      'AI analysis completed.',

    insights:
      data.insights ||
      [data.keyTakeaway]
        .filter(Boolean),

    edgeCases:
      data.edgeCases ||
      [data.prevention]
        .filter(Boolean),
  };
}

export async function askAiFollowUp(
  prompt,
  code = '',
  language = 'java',
  history = []
) {
  try {
    const userPrompt =
      String(prompt || '').trim();

    const lower =
      userPrompt.toLowerCase();

    /*
     * User explicitly requested language.
     * This has HIGHER priority than the dropdown language.
     */

    let requestedLanguage =
      null;

    if (
      /\bc\+\+\b/.test(lower) ||
      /\bcpp\b/.test(lower)
    ) {
      requestedLanguage =
        'cpp';

    } else if (
      /\bpython\b/.test(lower)
    ) {
      requestedLanguage =
        'python';

    } else if (
      /\bjavascript\b/.test(lower) ||
      /\bjs\b/.test(lower)
    ) {
      requestedLanguage =
        'javascript';

    } else if (
      /\bjava\b/.test(lower) &&
      !/\bjavascript\b/.test(lower)
    ) {
      requestedLanguage =
        'java';

    } else if (
      /\bin\s+c\b/.test(lower) ||
      /\busing\s+c\b/.test(lower) ||
      /\bwith\s+c\b/.test(lower) ||
      /\bc\s+language\b/.test(lower)
    ) {
      requestedLanguage =
        'c';
    }

    const res =
      await smartFetch(
        '/ai/explain',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            action: 'CHAT',

            level: 'Beginner',

            // Current dropdown language
            language,

            // Explicit language requested in THIS message
            requestedLanguage,

            code:
              code || '',

            question:
              userPrompt,

            history:
              Array.isArray(history)
                ? history
                : [],
          }),
        }
      );

    const data =
      await res.json();

    if (
      !res.ok ||
      !data?.success
    ) {
      throw new Error(
        data?.error?.message ||
        data?.message ||
        'AI tutor unavailable'
      );
    }

    return {
      answer:
        data?.answer ||
        data?.explanation ||
        'I could not generate an answer right now.',
    };

  } catch (err) {
    console.error(
      'AI Tutor chat request failed:',
      err
    );

    throw new Error(
      err?.message ||
      'AI Tutor is temporarily unavailable.'
    );
  }
}

export async function judgeStriverProblem({
  problem,
  code,
  language = 'java'
}) {
  const res =
    await smartFetch(
      '/ai/explain',
      {
        method: 'POST',

        headers: {
          'Content-Type':
            'application/json'
        },

        body: JSON.stringify({
          action:
            'JUDGE_STRIVER',

          level:
            'Intermediate',

          language,

          code,

          question:
            JSON.stringify({
              title:
                problem.title,

              description:
                problem.description,

              difficulty:
                problem.difficulty,

              timeComplexity:
                problem.timeComplexity,

              spaceComplexity:
                problem.spaceComplexity,

              sampleInput:
                problem.defaultInput
            })
        }),
      }
    );

  const data =
    await res.json();

  if (
    !res.ok ||
    !data?.success
  ) {
    throw new Error(
      data?.error?.message ||
      'Submission judge unavailable'
    );
  }

  return data;
}