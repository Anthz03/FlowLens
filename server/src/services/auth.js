import crypto from 'node:crypto';
import { promisify } from 'node:util';
import { User } from '../models/index.js';
import { getConfig } from '../config.js';

const scrypt = promisify(crypto.scrypt);

// ---------- passwords ----------
// Stored as  scrypt$N$r$p$salt$hash  so the cost can be raised later. Older accounts use  salt:hash  (N=16384) and are upgraded on login.
const COST = { N: 32768, r: 8, p: 1 };
const KEYLEN = 64;
const derive = (password, salt, { N, r, p }) => scrypt(password, salt, KEYLEN, { N, r, p, maxmem: 128 * N * r * 2 });

export async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = (await derive(password, salt, COST)).toString('hex');
  return `scrypt$${COST.N}$${COST.r}$${COST.p}$${salt}$${hash}`;
}

function parseHash(stored = '') {
  if (stored.startsWith('scrypt$')) {
    const [, N, r, p, salt, hash] = stored.split('$');
    return { cost: { N: +N, r: +r, p: +p }, salt, hash, legacy: false };
  }
  const [salt, hash] = stored.split(':');
  return { cost: { N: 16384, r: 8, p: 1 }, salt, hash, legacy: true };
}

// Always does the full key derivation (even for unknown users) so timing does not reveal which emails exist.
let dummyHash;
export async function verifyPassword(password, stored) {
  const real = Boolean(stored);
  const { cost, salt, hash, legacy } = parseHash(real ? stored : (dummyHash ||= await hashPassword('flowlens-dummy-password')));
  if (!salt || !hash) return { ok: false };
  const expected = Buffer.from(hash, 'hex');
  const actual = await derive(password, salt, cost);
  const ok = real && expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
  return { ok, needsRehash: ok && (legacy || cost.N < COST.N) };
}

// ---------- session tokens ----------
// Signed (HMAC-SHA256) token carrying the user id, a token version and an expiry. Bumping User.tokenVersion revokes all of a user's tokens.
const b64 = (v) => Buffer.from(v).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', getConfig().authSecret).update(data).digest();

export function signToken(user) {
  const now = Math.floor(Date.now() / 1000);
  const body = b64(JSON.stringify({ uid: String(user._id), v: user.tokenVersion || 0, iat: now, exp: now + getConfig().tokenTtlHours * 3600 }));
  return `${body}.${sign(body).toString('base64url')}`;
}

function readToken(token = '') {
  const parts = String(token).split('.');
  if (parts.length !== 2) return null;
  const [body, sig] = parts;
  const given = Buffer.from(sig, 'base64url'), expected = sign(body);
  if (given.length !== expected.length || !crypto.timingSafeEqual(given, expected)) return null;
  try {
    const data = JSON.parse(Buffer.from(body, 'base64url').toString());
    return typeof data.uid === 'string' && typeof data.exp === 'number' && data.exp > Math.floor(Date.now() / 1000) ? data : null;
  } catch { return null; }
}

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const data = header.startsWith('Bearer ') ? readToken(header.slice(7)) : null;
    const user = data && /^[a-f\d]{24}$/i.test(data.uid) ? await User.findById(data.uid) : null;
    if (!user || (user.tokenVersion || 0) !== data.v) return res.status(401).json({ error: 'Please sign in.' });
    req.user = user;
    next();
  } catch (e) { next(e); }
}

// ---------- roles ----------
const RANK = { member: 1, admin: 2, owner: 3 };
export const rank = (permission) => RANK[permission] || 0;
// Use after requireAuth:  router.delete(..., requireRole('admin'), handler)  -> admins and owners only
export const requireRole = (min) => (req, res, next) =>
  rank(req.user?.permission) >= rank(min) ? next() : res.status(403).json({ error: 'You do not have permission to do that.' });

// Random temporary password that satisfies the password policy
export function temporaryPassword() {
  for (;;) {
    const pw = crypto.randomBytes(12).toString('base64url').slice(0, 14);
    if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) return pw;
  }
}
