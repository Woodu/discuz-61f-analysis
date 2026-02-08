/**
 * Not Found Handler Middleware
 *
 * Handles 404 errors for unmatched routes.
 * Should be registered after all other routes.
 */

import { Context } from 'koa';

/**
 * Not found handler middleware
 */
export async function notFoundHandler(ctx: Context) {
  ctx.status = 404;
  ctx.body = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: '请求的资源不存在',
      path: ctx.path,
      method: ctx.method,
    },
  };
}
