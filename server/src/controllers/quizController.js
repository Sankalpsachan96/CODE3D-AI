import { getPrisma, isDbOnline } from '../db.js';

export const memoryQuizAttempts = [];

/**
 * GET /api/quiz/attempts
 * Retrieve authenticated user's quiz attempt history
 */
export async function getQuizAttempts(req, res) {
  try {
    const userId = req.user.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      // Use queryRaw if custom table or prisma model
      try {
        const attempts = await prisma.$queryRaw`
          SELECT id, user_id, quiz_mode, category, score, total_questions, percentage, created_at
          FROM quiz_attempts
          WHERE user_id = ${userId}::uuid
          ORDER BY created_at DESC
        `;
        return res.json({ success: true, attempts });
      } catch (sqlErr) {
        // Fallback to memory
      }
    }

    const userAttempts = memoryQuizAttempts.filter((a) => a.userId === userId);
    return res.json({ success: true, attempts: userAttempts });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'QUIZ_FETCH_ERROR',
        message: 'Failed to retrieve quiz attempts.',
      },
    });
  }
}

/**
 * POST /api/quiz/attempts
 * Record a new quiz attempt for the user
 */
export async function recordQuizAttempt(req, res) {
  try {
    const userId = req.user.id;
    const { mode = 'Predict Output', category = 'Arrays', score = 0, totalQuestions = 5, answers = [] } = req.body;
    const percentage = totalQuestions > 0 ? Number(((score / totalQuestions) * 100).toFixed(2)) : 0;

    if (isDbOnline()) {
      const prisma = getPrisma();
      try {
        const newId = `quiz-${Date.now()}`;
        await prisma.$queryRaw`
          INSERT INTO quiz_attempts (id, user_id, quiz_mode, category, score, total_questions, percentage, answers_json)
          VALUES (uuid_generate_v4(), ${userId}::uuid, ${mode}, ${category}, ${score}, ${totalQuestions}, ${percentage}, ${JSON.stringify(answers)}::jsonb)
        `;
        return res.status(201).json({
          success: true,
          attempt: {
            userId,
            mode,
            category,
            score,
            totalQuestions,
            percentage,
            createdAt: new Date(),
          },
        });
      } catch (sqlErr) {
        // Fallback to memory
      }
    }

    const newAttempt = {
      id: `attempt-${Date.now()}`,
      userId,
      mode,
      category,
      score,
      totalQuestions,
      percentage,
      answers,
      createdAt: new Date(),
    };
    memoryQuizAttempts.unshift(newAttempt);
    return res.status(201).json({ success: true, attempt: newAttempt });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: 'QUIZ_RECORD_ERROR',
        message: 'Failed to record quiz attempt.',
      },
    });
  }
}
