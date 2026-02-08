/**
 * Validation Utilities
 *
 * Common validation functions and helpers.
 */

import { z } from 'zod';

/**
 * Common validation schemas
 */
export const commonSchemas = {
  // Email validation
  email: z.string().email('无效的邮箱地址'),

  // Username validation (3-20 chars, alphanumeric and underscore)
  username: z
    .string()
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .regex(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),

  // Password validation (min 8 chars)
  password: z
    .string()
    .min(8, '密码至少8个字符')
    .max(100, '密码最多100个字符'),

  // URL validation
  url: z.string().url('无效的URL'),

  // UUID validation
  uuid: z.string().uuid('无效的UUID'),

  // Pagination parameters
  pagination: z.object({
    page: z.coerce.number().int().positive().default(1),
    pageSize: z.coerce.number().int().positive().max(100).default(20),
  }),
};

/**
 * Validate request body against a schema
 */
export function validateBody<T>(schema: z.ZodSchema<T>, data: unknown): T {
  return schema.parse(data);
}

/**
 * Safely validate request body (returns result instead of throwing)
 */
export function safeValidateBody<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
