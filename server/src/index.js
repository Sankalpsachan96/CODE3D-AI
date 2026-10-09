import dotenv from 'dotenv';
import { checkDatabaseConnection } from './db.js';
import { purgeLegacyDemoAccounts } from './controllers/authController.js';

dotenv.config();
// Load the app after dotenv so its origin allowlist sees environment settings
// from the local .env file as well as variables injected by Docker/production.
const { default: app } = await import('./app.js');

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  await checkDatabaseConnection();
  await purgeLegacyDemoAccounts();

  app.listen(PORT, '0.0.0.0', () => {
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
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
