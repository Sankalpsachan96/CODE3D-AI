import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

let prismaInstance = null;
let isDatabaseConnected = false;

export function getPrisma() {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return prismaInstance;
}

export async function checkDatabaseConnection() {
  try {
    const prisma = getPrisma();
    await prisma.$queryRaw`SELECT 1`;
    isDatabaseConnected = true;
    console.log('✅ PostgreSQL (Neon) Database connected successfully via Prisma.');
    return true;
  } catch (err) {
    isDatabaseConnected = false;
    console.warn('⚠️ PostgreSQL not reachable with current DATABASE_URL. Running in resilient mock-store mode for local development:', err.message);
    return false;
  }
}

// Idempotent additive repair for the Striver progress table. Uses PostgreSQL's
// built-in gen_random_uuid() so production does not depend on uuid-ossp.
export async function ensureStriverProgressSchema() {
  if (!isDatabaseConnected) return false;
  try {
    const prisma = getPrisma();
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS user_striver_progress (
        -- Prisma String IDs are stored as TEXT in this schema, not native UUID.
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        problem_key VARCHAR(32) NOT NULL,
        status VARCHAR(16) NOT NULL CHECK (status IN ('ATTEMPTED', 'SOLVED', 'REVISION')),
        attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
        first_attempted_at TIMESTAMPTZ,
        last_attempted_at TIMESTAMPTZ,
        solved_at TIMESTAMPTZ,
        CONSTRAINT user_striver_progress_user_problem_unique UNIQUE (user_id, problem_key)
      )
    `);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX IF NOT EXISTS idx_user_striver_progress_user_id
      ON user_striver_progress(user_id)
    `);
    console.log('✅ Striver progress schema verified.');
    return true;
  } catch (err) {
    console.error('❌ Striver progress schema repair failed:', err.message);
    return false;
  }
}

export function isDbOnline() {
  return isDatabaseConnected;
}

export default getPrisma();
