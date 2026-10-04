import { getPrisma, isDbOnline } from '../db.js';

// In-memory fallback session store for local dev when Neon database isn't provisioned yet
export const memorySessions = new Map();
export const memoryUsers = new Map();

export async function requireAuth(req, res, next) {
  const cookieName = process.env.COOKIE_NAME || 'code3d_session';
  let sessionToken = req.cookies?.[cookieName] || req.headers['x-session-token'];
  if (!sessionToken && req.headers.authorization) {
    sessionToken = req.headers.authorization.replace(/^Bearer\s+/i, '');
  }

  if (!sessionToken) {
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Authentication required. Please log in to continue.',
    });
  }

  // Check Database Session if DB is connected
  if (isDbOnline()) {
    try {
      const prisma = getPrisma();
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      if (!session || new Date(session.expiresAt) < new Date()) {
        if (session) {
          await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
        }
        res.clearCookie(cookieName);
        return res.status(401).json({
          success: false,
          error: 'SESSION_EXPIRED',
          message: 'Your session has expired. Please log in again.',
        });
      }

      req.user = {
        id: session.user.id,
        username: session.user.username,
        email: session.user.email,
        role: session.user.role,
      };
      req.sessionToken = sessionToken;
      return next();
    } catch (err) {
      console.error('Error during DB session check:', err);
    }
  }

  // Memory fallback session check
  const memSession = memorySessions.get(sessionToken);
  if (memSession && new Date(memSession.expiresAt) > new Date()) {
    const user = memoryUsers.get(memSession.userId);
    if (user) {
      req.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role || 'USER',
      };
      req.sessionToken = sessionToken;
      return next();
    }
  }

  res.clearCookie(cookieName);
  return res.status(401).json({
    success: false,
    error: 'INVALID_SESSION',
    message: 'Invalid or expired session.',
  });
}

export async function optionalAuth(req, res, next) {
  const cookieName = process.env.COOKIE_NAME || 'code3d_session';
  let sessionToken = req.cookies?.[cookieName] || req.headers['x-session-token'];
  if (!sessionToken && req.headers.authorization) {
    sessionToken = req.headers.authorization.replace(/^Bearer\s+/i, '');
  }

  if (!sessionToken) {
    req.user = null;
    return next();
  }

  if (isDbOnline()) {
    try {
      const prisma = getPrisma();
      const session = await prisma.session.findUnique({
        where: { sessionToken },
        include: { user: true },
      });

      if (session && new Date(session.expiresAt) >= new Date()) {
        req.user = {
          id: session.user.id,
          username: session.user.username,
          email: session.user.email,
          role: session.user.role,
        };
        req.sessionToken = sessionToken;
      }
    } catch {}
  } else {
    const memSession = memorySessions.get(sessionToken);
    if (memSession && new Date(memSession.expiresAt) > new Date()) {
      const user = memoryUsers.get(memSession.userId);
      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role || 'USER',
        };
        req.sessionToken = sessionToken;
      }
    }
  }

  next();
}
