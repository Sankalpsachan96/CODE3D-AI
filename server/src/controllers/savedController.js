import { getPrisma, isDbOnline } from '../db.js';

export const memorySaved = [];

export async function getSavedList(req, res) {
  try {
    const userId = req.user.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const items = await prisma.savedVisualization.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
      });
      return res.json({ success: true, saved: items });
    }

    const filtered = memorySaved.filter((s) => s.userId === userId);
    return res.json({ success: true, saved: filtered });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve saved visualizations.' });
  }
}

export async function getSavedItem(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const item = await prisma.savedVisualization.findUnique({ where: { id } });

      if (!item || item.userId !== userId) {
        return res.status(404).json({ success: false, message: 'Saved visualization not found.' });
      }

      return res.json({ success: true, saved: item });
    }

    const found = memorySaved.find((s) => s.id === id && s.userId === userId);
    if (!found) {
      return res.status(404).json({ success: false, message: 'Saved visualization not found.' });
    }

    return res.json({ success: true, saved: found });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve item.' });
  }
}

export async function createSaved(req, res) {
  try {
    const userId = req.user.id;
    const { title, language, code, algorithm = 'Custom', input = '', configJson = null } = req.body;

    if (!title || !code) {
      return res.status(400).json({ success: false, message: 'Title and code are required.' });
    }

    if (isDbOnline()) {
      const prisma = getPrisma();
      const created = await prisma.savedVisualization.create({
        data: {
          userId,
          title,
          language: language || 'java',
          code,
          algorithm,
          input,
          configJson,
        },
      });
      return res.status(201).json({ success: true, saved: created });
    }

    const newSaved = {
      id: `saved-${Date.now()}`,
      userId,
      title,
      language: language || 'java',
      code,
      algorithm,
      input,
      configJson,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    memorySaved.unshift(newSaved);
    return res.status(201).json({ success: true, saved: newSaved });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to save visualization.' });
  }
}

export async function updateSaved(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, language, code, algorithm, input, configJson } = req.body;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const existing = await prisma.savedVisualization.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ success: false, message: 'Saved visualization not found.' });
      }

      const updated = await prisma.savedVisualization.update({
        where: { id },
        data: {
          title: title ?? existing.title,
          language: language ?? existing.language,
          code: code ?? existing.code,
          algorithm: algorithm ?? existing.algorithm,
          input: input ?? existing.input,
          configJson: configJson ?? existing.configJson,
        },
      });
      return res.json({ success: true, saved: updated });
    }

    const item = memorySaved.find((s) => s.id === id && s.userId === userId);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Saved visualization not found.' });
    }

    if (title !== undefined) item.title = title;
    if (language !== undefined) item.language = language;
    if (code !== undefined) item.code = code;
    if (algorithm !== undefined) item.algorithm = algorithm;
    if (input !== undefined) item.input = input;
    if (configJson !== undefined) item.configJson = configJson;
    item.updatedAt = new Date();

    return res.json({ success: true, saved: item });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update visualization.' });
  }
}

export async function deleteSaved(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const existing = await prisma.savedVisualization.findUnique({ where: { id } });
      if (!existing || existing.userId !== userId) {
        return res.status(404).json({ success: false, message: 'Saved visualization not found.' });
      }

      await prisma.savedVisualization.delete({ where: { id } });
      return res.json({ success: true, message: 'Saved visualization deleted.' });
    }

    const idx = memorySaved.findIndex((s) => s.id === id && s.userId === userId);
    if (idx !== -1) {
      memorySaved.splice(idx, 1);
    }
    return res.json({ success: true, message: 'Saved visualization deleted.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to delete visualization.' });
  }
}
