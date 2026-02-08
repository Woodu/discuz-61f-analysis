/**
 * Jest Test Setup
 */

import { PrismaClient } from '@prisma/client';

// Set test environment variables before importing config
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/poketb_test?schema=test';
process.env.JWT_ACCESS_SECRET = 'test-jwt-access-secret-minimum-32-chars';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-minimum-32-chars';
process.env.JWT_ACCESS_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.ENCRYPTION_KEY = 'test-encryption-key-minimum-32-chars';
process.env.HASH_SALT = 'test-salt-min-16-chars';
process.env.ALLOWED_ORIGINS = 'http://localhost:5173';

// Global test setup
beforeAll(async () => {
  // Setup test database
});

afterAll(async () => {
  // Cleanup
});

beforeEach(async () => {
  // Reset database state before each test
});

afterEach(async () => {
  // Cleanup after each test
});

// Mock Prisma Client
export const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  thread: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  // Add other models as needed
} as unknown as PrismaClient;
