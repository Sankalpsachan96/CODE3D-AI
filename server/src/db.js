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

export function isDbOnline() {
  return isDatabaseConnected;
}

export default getPrisma();
