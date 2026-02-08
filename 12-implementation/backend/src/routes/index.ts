/**
 * Routes
 *
 * Main router configuration for the API.
 * All route modules should be registered here.
 */

import Router from '@koa/router';

export const routes = new Router({
  prefix: '/api',
});

// Health check endpoint
routes.get('/health', async (ctx) => {
  ctx.body = {
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    },
  };
});

// API info endpoint
routes.get('/', async (ctx) => {
  ctx.body = {
    success: true,
    message: 'PokeTB Forum API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      // Future endpoints will be documented here
    },
  };
});

// Placeholder for future route modules
// import authRoutes from './auth';
// routes.use('/auth', authRoutes.routes());
