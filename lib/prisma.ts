// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Always use the primary DATABASE_URL to avoid confusion between multiple databases
// PRISMA_DATABASE_URL (Accelerate) is deprecated - we use direct Neon connection
const DATABASE_URL = process.env.DATABASE_URL || process.env.NEON_DATABASE_URL;

// During build time, DATABASE_URL might not be available
// Use a dummy URL during build to prevent errors, but it will fail at runtime if not set
const buildTimeUrl = DATABASE_URL || 'postgresql://dummy:dummy@dummy:5432/dummy';

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: buildTimeUrl,
      },
    },
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Helper function to check if database is available
export function isDatabaseAvailable(): boolean {
  return !!DATABASE_URL;
}
