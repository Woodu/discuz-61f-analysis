/**
 * Configuration
 *
 * Centralized configuration management for the application.
 * All environment variables are loaded and validated here.
 */

import { z } from 'zod';

// Configuration schema with validation
const configSchema = z.object({
  env: z.enum(['development', 'production', 'test']).default('development'),
  port: z.number().min(1).max(65535).default(3001),
  database: z.object({
    url: z.string().url(),
  }),
  redis: z.object({
    host: z.string().default('localhost'),
    port: z.number().min(1).max(65535).default(6379),
    password: z.string().optional(),
  }),
  jwt: z.object({
    accessSecret: z.string().min(32),
    refreshSecret: z.string().min(32),
    accessExpiresIn: z.string().default('15m'),
    refreshExpiresIn: z.string().default('7d'),
  }),
  cors: z.object({
    origin: z.array(z.string()).default(['http://localhost:3000']),
  }),
  encryption: z.object({
    key: z.string().min(32),
    salt: z.string().min(16),
  }),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Validate and export configuration
const rawConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  database: {
    url: process.env.DATABASE_URL || '',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || '',
    salt: process.env.HASH_SALT || '',
  },
  logLevel: process.env.LOG_LEVEL || 'info',
};

export const config = configSchema.parse(rawConfig);
