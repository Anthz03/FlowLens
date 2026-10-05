import crypto from 'node:crypto';
import { User } from '../models/index.js';

const secret = () => process.env.AUTH_SECRET || 'flowlens-dev-secret-change-me';
const b64 = (s) => Buffer.from(s).toString('base64url');
const sign = (data) => crypto.createHmac('sha256', secret()).update(data).digest('base64url');

export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  return `${salt}:${crypto.scryptSync(password, salt, 64).toString('hex')}`;
}

export function verifyPassword(password, stored = '') {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const a = Buffer.from(hash, 'hex'), b = crypto.scryptSync(password, salt, 64);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

export function signToken(userId, days = 7) {
  const body = b64(JSON.stringify({ uid: String(userId), exp: Date.now() + days * 864e5 }));
  return `${body}.${sign(body)}`;
}

function readToken(token = '') {
  const [body, sig] = token.split('.');
  if (!body || !sig || sign(body) !== sig) return null;
  const data = JSON.parse(Buffer.from(body, 'base64url').toString());
  return data.exp > Date.now() ? data : null;
}

export async function requireAuth(req, res, next) {
  try {
    const data = readToken((req.headers.authorization || '').replace(/^Bearer /, ''));
    const user = data && (await User.findById(data.uid));
    if (!user) return res.status(401).json({ error: 'Please sign in.' });
    req.user = user;
    next();
  } catch (e) { next(e); }
}
