/**
 * PokeTB Forum Backend Entry Point
 *
 * This is the main entry point for the Koa server.
 */

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import helmet from 'koa-helmet';
import { config } from './config';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { prisma } from './lib/prisma';
import { routes } from './routes';

// Create Koa app
const app = new Koa();

// Trust proxy (for reverse proxy)
app.proxy = true;

// Security headers
app.use(helmet());

// CORS
app.use(cors({
  origin: (ctx) => {
    const requestOrigin = ctx.get('Origin');
    if (config.cors.origin.includes(requestOrigin)) {
      return requestOrigin;
    }
    return config.cors.origin[0];
  },
  credentials: true,
}));

// Body parser
app.use(bodyParser({
  jsonLimit: '10mb',
  textLimit: '10mb',
  formLimit: '10mb',
}));

// Request logging
app.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${ctx.method} ${ctx.url} - ${ctx.status} - ${ms}ms`);
});

// Error handling
app.use(errorHandler);

// Routes
app.use(routes.routes());
app.use(routes.allowedMethods());

// 404 handler
app.use(notFoundHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
