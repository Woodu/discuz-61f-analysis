/**
 * Error Handler Middleware
 *
 * Global error handling middleware for Koa.
 * Catches all errors and formats them consistently.
 */

import { Context, Next } from 'koa';
import { logger } from '../utils/logger';

interface ErrorWithProps extends Error {
  status?: number;
  statusCode?: number;
  code?: string;
  details?: any;
  stack?: string;
}

/**
 * Error handler middleware
 */
export async function errorHandler(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    const error = err as ErrorWithProps;

    // Log the error
    logger.error('Error occurred:', {
      message: error.message,
      stack: error.stack,
      status: error.status,
      code: error.code,
      path: ctx.path,
      method: ctx.method,
    });

    // Determine status code
    const status = error.status || error.statusCode || 500;

    // Prepare error response
    const errorResponse: {
      success: false;
      error: {
        code: string;
        message: string;
        stack?: string;
        details?: any;
      };
    } = {
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message || '服务器错误',
      },
    };

    // Include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error.stack = error.stack;
    }

    // Include validation errors if available
    if (error.details) {
      errorResponse.error.details = error.details;
    }

    // Set response
    ctx.status = status;
    ctx.body = errorResponse;

    // Emit error event for monitoring
    ctx.app.emit('error', err, ctx);
  }
}

/**
 * Create an API error
 */
export class ApiErrorClass extends Error {
  public status: number;
  public code: string;
  public details?: any;

  constructor(message: string, status: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}
