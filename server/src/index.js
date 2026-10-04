import dotenv from 'dotenv';
import app from './app.js';
import { checkDatabaseConnection } from './db.js';

dotenv.config();

const PORT = parseInt(process.env.PORT || '5000', 10);

async function startServer() {
  await checkDatabaseConnection();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`
======================================================
🚀 CODE3D-AI Full-Stack Execution Server Online
======================================================
📡 Port: ${PORT}
🌍 URL:  http://localhost:${PORT}/api
🛡️  CORS: ${process.env.FRONTEND_URL || 'http://localhost:5173'}
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
