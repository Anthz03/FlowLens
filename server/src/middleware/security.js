import crypto from 'node:crypto';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import { ZodError } from 'zod';
import { getConfig } from '../config.js';
import { audit } from '../services/audit.js';

// Every request gets an id so a user-reported error can be matched to a server log line.
export const requestId = (req, res, next) => {
  req.id = crypto.randomUUID();
  res.set('X-Request-Id', req.id);
  next();
};

// Standard security headers (nosniff, frame protection, HSTS in production, no X-Powered-By ...). API responses must never be cached.
export const securityHeaders = [
  helmet(),
  (_req, res, next) => { res.set('Cache-Control', 'no-store'); next(); },
];

// Only the configured browser origins may call the API from another origin.
export function corsMiddleware() {
  const allowed = new Set(getConfig().corsOrigins);
  return cors({
    origin: (origin, cb) => cb(null, !origin || allowed.has(origin)),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  });
}

// Drops keys that could be interpreted as MongoDB operators ("$ne", "$where") or paths ("a.b") from request bodies (NoSQL injection).
function clean(value, depth = 0) {
  if (depth > 8) return undefined;
  if (Array.isArray(value)) return value.map((v) => clean(v, depth + 1));
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('$') || k.includes('.') || k === '__proto__' || k === 'constructor' || k === 'prototype') continue;
      out[k] = clean(v, depth + 1);
    }
    return out;
  }
  return value;
}
export const sanitizeBody = (req, _res, next) => { if (req.body && typeof req.body === 'object') req.body = clean(req.body); next(); };

// Validate (and strip unknown fields from) the body or query with a zod schema. Unknown keys are dropped, which prevents mass assignment.
export const validate = (schema, where = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[where] ?? {});
  if (!result.success) return next(result.error);
  if (where === 'body') req.body = result.data;
  else req.validatedQuery = result.data; // req.query is read-only in Express 5
  next();
};

// ---- rate limiting ----
const tooMany = (req, res) => {
  audit(req, 'rate_limited', { user: req.user, meta: { path: req.originalUrl.split('?')[0] } });
  res.status(429).json({ error: 'Too many requests. Please wait a moment and try again.' });
};
const base = { standardHeaders: 'draft-7', legacyHeaders: false, handler: tooMany };
const byIp = (req) => ipKeyGenerator(req.ip);
const byUser = (req) => (req.user ? `u:${req.user.id}` : byIp(req));

export function buildLimiters() {
  const { rate } = getConfig();
  return {
    // everything under /api, per IP (generous: protects against floods, not normal use)
    ip: rateLimit({ ...base, windowMs: rate.windowMs, limit: rate.ipMax, keyGenerator: byIp }),
    // signed-in traffic, per user
    user: rateLimit({ ...base, windowMs: rate.windowMs, limit: rate.userMax, keyGenerator: byUser }),
    // sign-in / Google / password change: only FAILED attempts count, so normal use is never blocked
    auth: rateLimit({ ...base, windowMs: rate.windowMs, limit: rate.authMax, keyGenerator: byIp, skipSuccessfulRequests: true }),
    // new accounts, per IP per hour
    register: rateLimit({ ...base, windowMs: rate.registerWindowMs, limit: rate.registerMax, keyGenerator: byIp }),
    // CPU-heavier endpoints (analysis, TO-BE generation), per user per minute
    heavy: rateLimit({ ...base, windowMs: rate.heavyWindowMs, limit: rate.heavyMax, keyGenerator: byUser }),
  };
}

// ---- errors ----
export const notFoundApi = (_req, res) => res.status(404).json({ error: 'Not found' });

// Turns every error into a safe JSON response. Details are logged on the server, never sent to the client.
export function errorHandler(err, req, res, _next) {
  const { isProd, isTest } = getConfig();
  let status = 500, message = 'Something went wrong. Please try again.';

  if (err instanceof ZodError) {
    status = 400;
    const first = err.issues[0];
    const field = first?.path?.length ? `${first.path.join('.')}: ` : '';
    message = `${field}${first?.message || 'Invalid input'}`;
  } else if (err?.type === 'entity.too.large') { status = 413; message = 'The request is too large.'; }
  else if (err?.type === 'entity.parse.failed' || err instanceof SyntaxError) { status = 400; message = 'Invalid JSON.'; }
  else if (err?.name === 'CastError') { status = 400; message = 'Invalid id.'; }
  else if (err?.name === 'ValidationError') { status = 400; message = 'Invalid data.'; }
  else if (err?.code === 11000) { status = 409; message = 'That already exists.'; }
  else if (Number.isInteger(err?.status) && err.status >= 400 && err.status < 500) { status = err.status; message = err.expose === false ? message : err.message; }

  if (status >= 500 && !isTest) console.error(JSON.stringify({ ts: new Date().toISOString(), level: 'error', requestId: req.id, path: req.originalUrl.split('?')[0], error: err?.stack || String(err) }));
  res.status(status).json({ error: message, ...(status >= 500 || !isProd ? { requestId: req.id } : {}) });
}
