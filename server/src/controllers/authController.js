import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { getPrisma, isDbOnline } from '../db.js';
import { memorySessions, memoryUsers } from '../middleware/auth.js';

const COOKIE_NAME = process.env.COOKIE_NAME || 'code3d_session';
const SESSION_DURATION_DAYS = parseInt(process.env.SESSION_DURATION_DAYS || '7', 10);

function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

function getCookieOptions() {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  };
}

export async function register(req, res) {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Username, email, and password are required.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'WEAK_PASSWORD',
        message: 'Password must be at least 6 characters.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

    let userObj = null;

    if (isDbOnline()) {
      const prisma = getPrisma();

      // Check existing user
      const existing = await prisma.user.findFirst({
        where: { OR: [{ email: email.toLowerCase() }, { username }] },
      });

      if (existing) {
        return res.status(409).json({
          success: false,
          error: 'USER_EXISTS',
          message: 'A user with this username or email already exists.',
        });
      }

      userObj = await prisma.user.create({
        data: {
          username,
          email: email.toLowerCase(),
          passwordHash,
          settings: {
            create: {
              theme: 'dark',
              animationSpeed: 1.0,
              reducedMotion: false,
            },
          },
          sessions: {
            create: {
              sessionToken,
              expiresAt,
            },
          },
        },
      });
    } else {
      // Memory Store Fallback
      for (const u of memoryUsers.values()) {
        if (u.email === email.toLowerCase() || u.username === username) {
          return res.status(409).json({
            success: false,
            error: 'USER_EXISTS',
            message: 'A user with this username or email already exists.',
          });
        }
      }

      const id = `user-${Date.now()}`;
      userObj = { id, username, email: email.toLowerCase(), passwordHash, role: 'USER' };
      memoryUsers.set(id, userObj);
      memorySessions.set(sessionToken, { id: `sess-${Date.now()}`, sessionToken, userId: id, expiresAt });
    }

    res.cookie(COOKIE_NAME, sessionToken, getCookieOptions());

    return res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: {
        id: userObj.id,
        username: userObj.username,
        email: userObj.email,
        role: userObj.role || 'USER',
      },
      sessionToken,
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to register account.',
    });
  }
}

export async function login(req, res) {
  try {
    const usernameOrEmail = req.body.usernameOrEmail || req.body.username || req.body.email;
    const { password } = req.body;

    if (!usernameOrEmail || !password) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Username/email and password are required.',
      });
    }

    let foundUser = null;
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000);

    if (isDbOnline()) {
      const prisma = getPrisma();
      foundUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: usernameOrEmail.toLowerCase() },
            { username: usernameOrEmail },
          ],
        },
      });

      if (!foundUser) {
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await bcrypt.compare(password, foundUser.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        });
      }

      await prisma.session.create({
        data: {
          sessionToken,
          userId: foundUser.id,
          expiresAt,
        },
      });
    } else {
      // Memory Store Fallback
      for (const u of memoryUsers.values()) {
        if (u.email === usernameOrEmail.toLowerCase() || u.username === usernameOrEmail) {
          foundUser = u;
          break;
        }
      }

      if (!foundUser) {
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        });
      }

      const isMatch = await bcrypt.compare(password, foundUser.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password.',
        });
      }

      memorySessions.set(sessionToken, {
        id: `sess-${Date.now()}`,
        sessionToken,
        userId: foundUser.id,
        expiresAt,
      });
    }

    res.cookie(COOKIE_NAME, sessionToken, getCookieOptions());

    return res.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: foundUser.id,
        username: foundUser.username,
        email: foundUser.email,
        role: foundUser.role || 'USER',
      },
      sessionToken,
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to log in.',
    });
  }
}

export async function logout(req, res) {
  try {
    const sessionToken = req.sessionToken || req.cookies?.[COOKIE_NAME];

    if (sessionToken) {
      if (isDbOnline()) {
        const prisma = getPrisma();
        await prisma.session.delete({ where: { sessionToken } }).catch(() => {});
      } else {
        memorySessions.delete(sessionToken);
      }
    }

    res.clearCookie(COOKIE_NAME, { path: '/' });
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Logout error:', err);
    return res.status(500).json({ success: false, message: 'Logout failed.' });
  }
}

export async function getMe(req, res) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authenticated.' });
  }

  return res.json({
    success: true,
    user: req.user,
  });
}
