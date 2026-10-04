import { getPrisma, isDbOnline } from '../db.js';
import { memoryExecutions } from './executionController.js';

export async function createHistoryExecution(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required.' });
    }

    const {
      programTitle,
      title,
      language = 'java',
      code = '',
      input = '',
      status = 'COMPLETED',
      totalSteps = 0,
      executionTimeMs = 0,
      output = '',
    } = req.body || {};

    if (!code || typeof code !== 'string') {
      return res.status(400).json({ success: false, message: 'Code is required.' });
    }

    if (!isDbOnline()) {
      const record = {
        id: `exec-${Date.now()}`,
        userId,
        title: programTitle || title || 'Custom Execution',
        language,
        code,
        input,
        status,
        stepCount: Number(totalSteps) || 0,
        executionTimeMs: Number(executionTimeMs) || 0,
        traceJson: [],
        createdAt: new Date(),
      };
      memoryExecutions.unshift(record);
      if (memoryExecutions.length > 50) memoryExecutions.pop();
      return res.status(201).json({ success: true, record });
    }

    const prisma = getPrisma();
    const executionTitle = programTitle || title || 'Custom Execution';

    // Prevent the frontend history call from duplicating an execution that
    // the execution controller has just persisted.
    const existing = await prisma.algorithmExecution.findFirst({
      where: {
        userId,
        code,
        title: executionTitle,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (existing && Date.now() - new Date(existing.createdAt).getTime() < 15000) {
      return res.status(200).json({ success: true, record: existing, deduplicated: true });
    }

    const record = await prisma.algorithmExecution.create({
      data: {
        userId,
        title: executionTitle,
        language,
        code,
        input,
        status,
        stepCount: Number(totalSteps) || 0,
        executionTimeMs: Number(executionTimeMs) || 0,
        traceJson: [],
      },
    });

    return res.status(201).json({ success: true, record });
  } catch (err) {
    console.error('Create history execution error:', err);
    return res.status(500).json({ success: false, message: 'Failed to save execution history.' });
  }
}

export async function getHistory(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });

    if (isDbOnline()) {
      const prisma = getPrisma();
      const items = await prisma.algorithmExecution.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          userId: true,
          title: true,
          language: true,
          code: true,
          input: true,
          status: true,
          stepCount: true,
          executionTimeMs: true,
          traceJson: true,
          createdAt: true,
        },
      });
      return res.json({
        success: true,
        history: items,
        totalExecutionsCount: items.length,
        isBackendConnected: true,
      });
    }

    const filtered = memoryExecutions.filter((e) => e.userId === userId);
    return res.json({ success: true, history: filtered.slice(0, 50), totalExecutionsCount: filtered.length, isBackendConnected: false });
  } catch (err) {
    console.error('History fetch error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve execution history.' });
  }
}

export async function getHistoryItem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });

    if (isDbOnline()) {
      const prisma = getPrisma();
      const item = await prisma.algorithmExecution.findFirst({ where: { id, userId } });
      if (!item) return res.status(404).json({ success: false, message: 'History record not found.' });
      return res.json({ success: true, record: item });
    }

    const found = memoryExecutions.find((e) => e.id === id && e.userId === userId);
    if (!found) return res.status(404).json({ success: false, message: 'History record not found.' });
    return res.json({ success: true, record: found });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve record.' });
  }
}

export async function deleteHistoryItem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });

    if (isDbOnline()) {
      const prisma = getPrisma();
      const item = await prisma.algorithmExecution.findFirst({ where: { id, userId } });
      if (!item) return res.status(404).json({ success: false, message: 'Record not found.' });
      await prisma.algorithmExecution.delete({ where: { id } });
      return res.json({ success: true, message: 'History record deleted.' });
    }

    const idx = memoryExecutions.findIndex((e) => e.id === id && e.userId === userId);
    if (idx !== -1) memoryExecutions.splice(idx, 1);
    return res.json({ success: true, message: 'History record deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete record.' });
  }
}

export async function clearHistory(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ success: false, message: 'Authentication required.' });

    if (isDbOnline()) {
      const prisma = getPrisma();
      const result = await prisma.algorithmExecution.deleteMany({ where: { userId } });
      return res.json({ success: true, message: 'History cleared.', deletedCount: result.count });
    }

    const remaining = memoryExecutions.filter((e) => e.userId !== userId);
    memoryExecutions.length = 0;
    memoryExecutions.push(...remaining);
    return res.json({ success: true, message: 'History cleared.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to clear history.' });
  }
}
