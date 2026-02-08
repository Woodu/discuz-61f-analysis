/**
 * Middleware Tests
 *
 * Tests for middleware functionality.
 */

import { Context } from 'koa';
import { errorHandler } from './errorHandler';
import { ValidationError } from '../types/errors';

interface MockContext extends Partial<Context> {
  body: any;
}

describe('Error Handler Middleware', () => {
  let mockContext: MockContext;
  let next: jest.Mock;

  beforeEach(() => {
    mockContext = {
      path: '/test',
      method: 'GET',
      status: 200,
      body: null,
      app: {
        emit: jest.fn(),
      } as any,
    };
    next = jest.fn();
  });

  it('should pass through when no error', async () => {
    next.mockResolvedValue('success');

    await errorHandler(mockContext as Context, next);

    expect(next).toHaveBeenCalled();
    expect(mockContext.status).toBe(200);
  });

  it('should handle ApiError', async () => {
    const error = new ValidationError('Test validation error');
    next.mockRejectedValue(error);

    await errorHandler(mockContext as Context, next);

    expect(mockContext.status).toBe(400);
    expect(mockContext.body).toEqual({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Test validation error',
      },
    });
  });

  it('should include stack trace in development', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    const error = new Error('Test error');
    next.mockRejectedValue(error);

    await errorHandler(mockContext as Context, next);

    expect((mockContext.body as any).error).toHaveProperty('stack');

    process.env.NODE_ENV = originalEnv;
  });

  it('should not include stack trace in production', async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    const error = new Error('Test error');
    next.mockRejectedValue(error);

    await errorHandler(mockContext as Context, next);

    expect((mockContext.body as any).error).not.toHaveProperty('stack');

    process.env.NODE_ENV = originalEnv;
  });
});
