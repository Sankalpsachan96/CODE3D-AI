import { getPrisma, isDbOnline } from '../db.js';

// In-memory catalog for DSA when database is connecting or seeding
export const memoryTopics = [];
export const memoryProblems = [];
export const memorySheets = [];
export const memoryProgress = new Map(); // key: `${userId}:${problemId}`
export const memoryNotes = new Map();
export const memorySubmissions = [];

export async function getTopics(req, res) {
  try {
    if (isDbOnline()) {
      const prisma = getPrisma();
      const topics = await prisma.dsaTopic.findMany({
        orderBy: { orderIndex: 'asc' },
        include: { _count: { select: { problems: true } } },
      });
      return res.json({ success: true, topics });
    }
    return res.json({ success: true, topics: memoryTopics });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve topics.' });
  }
}

export async function getProblems(req, res) {
  try {
    const { topic, difficulty, search } = req.query;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const where = {};
      if (topic) where.topic = { slug: topic };
      if (difficulty) where.difficulty = difficulty.toUpperCase();
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }

      const problems = await prisma.dsaProblem.findMany({
        where,
        orderBy: { title: 'asc' },
        include: { topic: { select: { name: true, slug: true } } },
      });
      return res.json({ success: true, problems });
    }

    let list = [...memoryProblems];
    if (topic) list = list.filter((p) => p.topicSlug === topic);
    if (difficulty) list = list.filter((p) => p.difficulty.toLowerCase() === difficulty.toLowerCase());
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    return res.json({ success: true, problems: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve problems.' });
  }
}

export async function getProblemBySlug(req, res) {
  try {
    const { slug } = req.params;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const problem = await prisma.dsaProblem.findUnique({
        where: { slug },
        include: {
          topic: true,
          pattern: true,
        },
      });

      if (!problem) {
        return res.status(404).json({ success: false, message: 'DSA problem not found.' });
      }

      return res.json({ success: true, problem });
    }

    const found = memoryProblems.find((p) => p.slug === slug);
    if (!found) {
      return res.status(404).json({ success: false, message: 'DSA problem not found.' });
    }

    return res.json({ success: true, problem: found });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve problem details.' });
  }
}

export async function getSheets(req, res) {
  try {
    if (isDbOnline()) {
      const prisma = getPrisma();
      const sheets = await prisma.dsaSheet.findMany({
        include: { _count: { select: { problems: true } } },
      });
      return res.json({ success: true, sheets });
    }
    return res.json({ success: true, sheets: memorySheets });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve sheets.' });
  }
}

export async function getSheetBySlug(req, res) {
  try {
    const { slug } = req.params;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const sheet = await prisma.dsaSheet.findUnique({
        where: { slug },
        include: {
          problems: {
            orderBy: [{ dayNumber: 'asc' }, { orderIndex: 'asc' }],
            include: { problem: { include: { topic: true } } },
          },
        },
      });

      if (!sheet) {
        return res.status(404).json({ success: false, message: 'DSA sheet not found.' });
      }

      return res.json({ success: true, sheet });
    }

    const found = memorySheets.find((s) => s.slug === slug);
    if (!found) {
      return res.status(404).json({ success: false, message: 'DSA sheet not found.' });
    }

    return res.json({ success: true, sheet: found });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve sheet problems.' });
  }
}

export async function getProgress(req, res) {
  try {
    const userId = req.user.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const progress = await prisma.userProblemProgress.findMany({
        where: { userId },
      });
      return res.json({ success: true, progress });
    }

    const userProgress = [];
    for (const [key, val] of memoryProgress.entries()) {
      if (key.startsWith(`${userId}:`)) userProgress.push(val);
    }

    return res.json({ success: true, progress: userProgress });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve user progress.' });
  }
}

export async function updateProgress(req, res) {
  try {
    const userId = req.user.id;
    const { problemId, status } = req.body;

    if (!problemId || !status) {
      return res.status(400).json({ success: false, message: 'problemId and status are required.' });
    }

    const now = new Date();
    const solvedAt = status === 'SOLVED' ? now : null;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const existing = await prisma.userProblemProgress.findUnique({
        where: { userId_problemId: { userId, problemId } },
      });

      const updated = await prisma.userProblemProgress.upsert({
        where: { userId_problemId: { userId, problemId } },
        update: {
          status,
          attemptCount: (existing?.attemptCount || 0) + 1,
          lastAttemptedAt: now,
          solvedAt: solvedAt || existing?.solvedAt,
        },
        create: {
          userId,
          problemId,
          status,
          attemptCount: 1,
          firstAttemptedAt: now,
          lastAttemptedAt: now,
          solvedAt,
        },
      });

      return res.json({ success: true, progress: updated });
    }

    const key = `${userId}:${problemId}`;
    const existing = memoryProgress.get(key);
    const updated = {
      userId,
      problemId,
      status,
      attemptCount: (existing?.attemptCount || 0) + 1,
      firstAttemptedAt: existing?.firstAttemptedAt || now,
      lastAttemptedAt: now,
      solvedAt: solvedAt || existing?.solvedAt,
    };
    memoryProgress.set(key, updated);

    return res.json({ success: true, progress: updated });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update progress.' });
  }
}
