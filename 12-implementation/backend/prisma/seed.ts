/**
 * Prisma Seed Script
 *
 * This script seeds the database with initial data.
 * Run with: pnpm db:seed
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  // TODO: Add seed data here
  // Example:
  // await prisma.user.create({
  //   data: {
  //     username: 'admin',
  //     email: 'admin@poketb.com',
  //     // ...
  //   },
  // });

  console.log('Database seed completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
