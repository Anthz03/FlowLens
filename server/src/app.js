import express from 'express';
import { getConfig } from './config.js';
import routes from './routes/index.js';
import authRoutes from './routes/auth.js';
import { requireAuth } from './services/auth.js';
import { requestId, securityHeaders, corsMiddleware, sanitizeBody, buildLimiters, notFoundApi, errorHandler } from './middleware/security.js';

// Builds the Express app (no database connection or listening here, so it can be tested).
export function createApp() {
  const cfg = getConfig();
  const app = express();
  const limit = buildLimiters();

  app.set('trust proxy', cfg.trustProxy);
  app.disable('x-powered-by');
  app.use(requestId, securityHeaders, corsMiddleware());
  app.use(express.json({ limit: cfg.bodyLimit }));
  app.use(sanitizeBody);

  app.get('/api/health', (_req, res) => res.json({ ok: true }));

  app.use('/api', limit.ip);
  // Brute-force and abuse protection on the sensitive endpoints
  app.use('/api/auth/login', limit.auth);
  app.use('/api/auth/google', limit.auth);
  app.use('/api/auth/change-password', limit.auth);
  app.use('/api/auth/register', limit.register);
  app.use('/api/auth', authRoutes);

  app.use('/api', requireAuth, limit.user, routes(limit));
  app.use('/api', notFoundApi);
  app.use(errorHandler);
  return app;
}
