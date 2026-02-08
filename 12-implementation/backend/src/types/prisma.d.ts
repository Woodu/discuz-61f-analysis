/**
 * Prisma Type Extensions
 *
 * Extend Prisma types with custom properties and methods.
 */

import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}
