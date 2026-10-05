// Central, validated configuration. Reads environment variables once and refuses unsafe settings in production.
const WEAK_SECRETS = ['flowlens-dev-secret-change-me', 'change-this-to-a-long-random-string'];
const DEV_SECRET = 'flowlens-dev-secret-change-me';

const num = (v, fallback) => { const n = Number(v); return Number.isFinite(n) && n > 0 ? n : fallback; };

function parseTrustProxy(v) {
  if (v === undefined || v === '' || v === 'false') return false;
  if (v === 'true') return true;
  return Number.isInteger(Number(v)) ? Number(v) : v; // hop count, or a named subnet like "loopback"
}

export function loadConfig(env = process.env) {
  const isProd = env.NODE_ENV === 'production';
  const secret = (env.AUTH_SECRET || '').trim();
  const weakSecret = secret.length < 32 || WEAK_SECRETS.includes(secret);
  if (isProd && weakSecret) {
    throw new Error('AUTH_SECRET must be a random string of at least 32 characters in production. '
      + 'Generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
  }
  const mins = (m) => m * 60 * 1000;
  return {
    isProd,
    isTest: env.NODE_ENV === 'test',
    authSecret: secret || DEV_SECRET,
    weakSecret,
    tokenTtlHours: num(env.TOKEN_TTL_HOURS, 12),
    // Browser origins allowed to call the API cross-origin. Same-origin requests and server-to-server calls are unaffected.
    corsOrigins: (env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',').map((s) => s.trim()).filter(Boolean),
    trustProxy: parseTrustProxy(env.TRUST_PROXY), // set when running behind a reverse proxy so client IPs are correct
    bodyLimit: env.BODY_LIMIT || '256kb',
    maxFailedLogins: num(env.MAX_FAILED_LOGINS, 5),
    lockoutMinutes: num(env.LOCKOUT_MINUTES, 15),
    rate: {
      windowMs: num(env.RATE_LIMIT_WINDOW_MS, mins(15)),
      ipMax: num(env.RATE_LIMIT_IP_MAX, 1000),         // every API request, per IP
      userMax: num(env.RATE_LIMIT_USER_MAX, 600),      // signed-in requests, per user
      authMax: num(env.RATE_LIMIT_AUTH_MAX, 10),       // failed sign-in attempts, per IP
      registerMax: num(env.RATE_LIMIT_REGISTER_MAX, 5), // new accounts, per IP per hour
      registerWindowMs: mins(60),
      heavyMax: num(env.RATE_LIMIT_HEAVY_MAX, 30),     // analysis / TO-BE generation, per user per minute
      heavyWindowMs: mins(1),
    },
  };
}

let cached;
export const getConfig = () => (cached ||= loadConfig());
export const resetConfig = () => { cached = undefined; };
