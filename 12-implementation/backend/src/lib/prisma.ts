/**
 * Prisma Client
 *
 * Singleton instance of Prisma Client to prevent
 * multiple instances in development due to hot reloading.
 */

import { PrismaClient } from '@prisma/client';

// Extend global type to include prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create Prisma client with appropriate logging
const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
  });
};

// Use global prisma if available (development hot reloading)
// Otherwise create new instance
export const prisma = global.prisma || createPrismaClient();

// In development, attach to global to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
