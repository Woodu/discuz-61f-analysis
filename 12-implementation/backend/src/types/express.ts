/**
 * Extended Type Definitions
 *
 * Extended types for Koa Context and other global types.
 */

import { Context } from 'koa';

/**
 * User payload attached to context after authentication
 */
export interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: string;
}

/**
 * Extended Koa State with user information
 */
export interface AppState {
  user?: UserPayload;
  requestId?: string;
}

/**
 * Extended Koa Context with our custom state
 */
export interface AppContext extends Context {
  state: AppState;
}

/**
 * Standard API response format
 */
export interface ApiResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Error response format
 */
export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    stack?: string;
    details?: any;
  };
}

/**
 * Paginated response format
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}
