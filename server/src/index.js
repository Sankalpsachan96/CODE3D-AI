import dotenv from 'dotenv';
import { checkDatabaseConnection, ensureStriverProgressSchema } from './db.js';
import { purgeLegacyDemoAccounts } from './controllers/authController.js';
import { seedDatabase } from './seed.js';

dotenv.config();
// Load the app after dotenv so its origin allowlist sees environment settings
// from the local .env file as well as variables injected by Docker/production.
const { default: app } = await import('./app.js');

const PORT = parseInt(process.env.PORT || '5000', 10);

// Start accepting HTTP traffic before optional database bootstrapping. Previously,
// a slow/unreachable Neon connection or seed operation prevented app.listen()
// from running at all, so every frontend request eventually hit its 20s timeout.
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`
======================================================
🚀 CODE3D-AI Full-Stack Execution Server Online
======================================================
📡 Port: ${PORT}
🌍 URL:  http://localhost:${PORT}/api
🛡️  CORS: production origins plus configured local development origins
⚙️  Mode: ${process.env.NODE_ENV || 'development'}
Supported: Java, C++, Python, JavaScript, C
======================================================
`);
});

server.on('error', (err) => {
  console.error('HTTP server error:', err.message);
  process.exitCode = 1;
});

// Database setup is deliberately non-blocking for HTTP availability. The auth
// controller already has a bounded in-memory fallback when the DB is offline.
async function initializeBackendData() {
  const connected = await checkDatabaseConnection();

  if (connected) {
    await ensureStriverProgressSchema();
  } else {
    console.warn('[startup] Database unavailable; API remains online in fallback mode.');
  }

  // These operations may depend on PostgreSQL; run them after HTTP is listening.
  await seedDatabase();
  await purgeLegacyDemoAccounts();
  console.log('[startup] Backend data initialization finished.');
}

initializeBackendData().catch((err) => {
  console.error('[startup] Non-fatal backend data initialization error:', err.message);
});
