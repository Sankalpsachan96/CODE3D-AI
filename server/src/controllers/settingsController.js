import { getPrisma, isDbOnline } from '../db.js';

export const memorySettings = new Map();

export async function getSettings(req, res) {
  try {
    const userId = req.user.id;

    if (isDbOnline()) {
      const prisma = getPrisma();
      let settings = await prisma.userSettings.findUnique({
        where: { userId },
      });

      if (!settings) {
        settings = await prisma.userSettings.create({
          data: { userId, theme: 'dark', animationSpeed: 1.0, reducedMotion: false },
        });
      }

      return res.json({ success: true, settings });
    }

    let settings = memorySettings.get(userId);
    if (!settings) {
      settings = { userId, theme: 'dark', animationSpeed: 1.0, reducedMotion: false };
      memorySettings.set(userId, settings);
    }

    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to retrieve settings.' });
  }
}

export async function updateSettings(req, res) {
  try {
    const userId = req.user.id;
    const { theme, animationSpeed, reducedMotion } = req.body;

    if (isDbOnline()) {
      const prisma = getPrisma();
      const updated = await prisma.userSettings.upsert({
        where: { userId },
        update: {
          theme: theme !== undefined ? theme : undefined,
          animationSpeed: animationSpeed !== undefined ? Number(animationSpeed) : undefined,
          reducedMotion: reducedMotion !== undefined ? Boolean(reducedMotion) : undefined,
        },
        create: {
          userId,
          theme: theme || 'dark',
          animationSpeed: animationSpeed ? Number(animationSpeed) : 1.0,
          reducedMotion: reducedMotion ? Boolean(reducedMotion) : false,
        },
      });

      return res.json({ success: true, settings: updated });
    }

    let settings = memorySettings.get(userId) || { userId, theme: 'dark', animationSpeed: 1.0, reducedMotion: false };
    if (theme !== undefined) settings.theme = theme;
    if (animationSpeed !== undefined) settings.animationSpeed = Number(animationSpeed);
    if (reducedMotion !== undefined) settings.reducedMotion = Boolean(reducedMotion);
    memorySettings.set(userId, settings);

    return res.json({ success: true, settings });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Failed to update settings.' });
  }
}
