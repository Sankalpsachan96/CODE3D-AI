import { getPrisma, isDbOnline } from '../db.js';
import { memoryExecutions } from './executionController.js';
import { memorySaved } from './savedController.js';
import { memoryProgress } from './dsaController.js';

export async function getDashboardStats(req, res) {
  try {
    const userId = req.user?.id || null;

    if (isDbOnline()) {
      const prisma = getPrisma();

      const [totalExecutions, completedExecutions, savedCount, userProgressList, recentExecs] = await Promise.all([
        prisma.algorithmExecution.count({ where: userId ? { userId } : {} }),
        prisma.algorithmExecution.count({ where: { status: 'COMPLETED', ...(userId ? { userId } : {}) } }),
        userId ? prisma.savedVisualization.count({ where: { userId } }) : Promise.resolve(0),
        userId ? prisma.userProblemProgress.findMany({ where: { userId } }) : Promise.resolve([]),
        prisma.algorithmExecution.findMany({
          where: userId ? { userId } : {},
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            title: true,
            language: true,
            status: true,
            stepCount: true,
            createdAt: true,
          },
        }),
      ]);

      const solvedCount = userProgressList.filter((p) => p.status === 'SOLVED').length;
      const attemptedCount = userProgressList.filter((p) => p.status === 'ATTEMPTED').length;

      return res.json({
        success: true,
        stats: {
          totalExecutions,
          completedExecutions,
          savedCount,
          solvedCount,
          attemptedCount,
          recentActivity: recentExecs,
        },
      });
    }

    // Memory Store Stats
    const userExecs = userId ? memoryExecutions.filter((e) => e.userId === userId) : memoryExecutions;
    const totalExecutions = userExecs.length;
    const completedExecutions = userExecs.filter((e) => e.status === 'COMPLETED').length;
    const savedCount = userId ? memorySaved.filter((s) => s.userId === userId).length : 0;

    let solvedCount = 0;
    let attemptedCount = 0;
    if (userId) {
      for (const [key, p] of memoryProgress.entries()) {
        if (key.startsWith(`${userId}:`)) {
          if (p.status === 'SOLVED') solvedCount++;
          if (p.status === 'ATTEMPTED') attemptedCount++;
        }
      }
    }

    const recentActivity = userExecs.slice(0, 5).map((e) => ({
      id: e.id,
      title: e.title,
      language: e.language,
      status: e.status,
      stepCount: e.stepCount,
      createdAt: e.createdAt,
    }));

    return res.json({
      success: true,
      stats: {
        totalExecutions,
        completedExecutions,
        savedCount,
        solvedCount,
        attemptedCount,
        recentActivity,
      },
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve dashboard stats.' });
  }
}
