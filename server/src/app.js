import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import apiRouter from './routes/api.js';

const app = express();

app.set('trust proxy', 1);

// Security Headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow 3D canvas and dynamic WebGL shaders
    crossOriginEmbedderPolicy: false,
  })
);

// Exact CORS allowlist. Configure FRONTEND_URL and optionally CORS_ALLOWED_ORIGINS
// (comma-separated) in production. Local development origins are also needed
// when the Node service runs in Docker with NODE_ENV=production.
const allowedOrigins = new Set([
  'https://code-3d-ai.vercel.app',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.CORS_ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.use(
  cors({
    origin: (origin, callback) => {
      // Requests without an Origin header are non-browser/server-to-server clients.
      callback(null, !origin || allowedOrigins.has(origin));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-session-token'],
  })
);

// CORS alone does not stop a browser from sending every cross-origin request.
// Reject untrusted browser origins on state-changing API requests as a CSRF defence.
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const stateChanging = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  if (origin && stateChanging && !allowedOrigins.has(origin)) {
    return res.status(403).json({
      success: false,
      error: 'ORIGIN_NOT_ALLOWED',
      message: 'This origin is not allowed to modify CODE3D-AI data.',
    });
  }
  return next();
});

// Body parsing with safe size bounds
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

// Rate Limiting for execution and general API
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 120, // 120 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'RATE_LIMIT_EXCEEDED', message: 'Too many requests. Please wait a moment.' },
});

const executionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30, // 30 code executions per minute per client IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'EXECUTION_RATE_LIMIT', message: 'Execution rate limit exceeded. Please wait 1 minute.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10, // Protect paid AI provider quota from anonymous abuse.
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'AI_RATE_LIMIT', message: 'Too many AI requests. Please wait one minute.' },
});

app.use('/api', generalLimiter);
app.use('/api/executions', executionLimiter);
app.use('/api/ai/explain', aiLimiter);

// Lightweight deployment health check (does not require database access).
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    service: 'code3d-ai-api',
    status: 'ok',
  });
});

// API Routes
app.use('/api', apiRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: `Cannot ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler (Never expose raw stack traces)
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    error: err.code || 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred. Please try again.'
      : err.message,
  });
});

export default app;
