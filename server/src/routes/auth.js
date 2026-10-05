import { Router } from 'express';
import { User, Business } from '../models/index.js';
import { googleClientId, verifyGoogleCredential, findOrCreateGoogleUser } from '../services/google.js';
import { hashPassword, verifyPassword, signToken, requireAuth, rank } from '../services/auth.js';
import { audit } from '../services/audit.js';
import { validate } from '../middleware/security.js';
import { getConfig } from '../config.js';
import { registerSchema, loginSchema, googleSchema, onboardingSchema, changePasswordSchema } from '../validation/schemas.js';

const router = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const BUSINESS_FIELDS = 'name industry size departments';
const session = async (user) => ({ token: signToken(user), user: await user.populate('business', BUSINESS_FIELDS) });

router.post('/register', validate(registerSchema), wrap(async (req, res) => {
  const { name, email, password, businessName } = req.body;
  if (await User.exists({ email })) return res.status(409).json({ error: 'An account with this email already exists.' });
  const business = await Business.create({ name: businessName, departments: ['Sales', 'Finance', 'HR', 'Operations', 'IT'] });
  const user = await User.create({ name, email, passwordHash: await hashPassword(password), role: 'Owner', permission: 'owner', business: business._id });
  await audit(req, 'register', { user });
  res.status(201).json(await session(user));
}));

router.post('/login', validate(loginSchema), wrap(async (req, res) => {
  const { email, password } = req.body;
  const cfg = getConfig();
  const user = await User.findOne({ email }).select('+passwordHash +failedLogins +lockUntil');

  if (user?.lockUntil && user.lockUntil > new Date()) {
    await audit(req, 'login_blocked', { user, meta: { reason: 'locked' } });
    const mins = Math.ceil((user.lockUntil - Date.now()) / 60000);
    return res.status(429).json({ error: `Too many failed attempts. Try again in ${mins} minute${mins === 1 ? '' : 's'}.` });
  }

  // Runs the full password check even when the email is unknown, so response time does not reveal which emails exist.
  const { ok, needsRehash } = await verifyPassword(password, user?.passwordHash);
  if (!user || !ok) {
    if (user) {
      user.failedLogins = (user.failedLogins || 0) + 1;
      const lock = user.failedLogins >= cfg.maxFailedLogins;
      if (lock) { user.lockUntil = new Date(Date.now() + cfg.lockoutMinutes * 60000); user.failedLogins = 0; }
      await user.save();
      await audit(req, lock ? 'account_locked' : 'login_failed', { user });
    } else {
      await audit(req, 'login_failed', { meta: { reason: 'unknown_email' } });
    }
    return res.status(401).json({ error: 'Incorrect email or password.' });
  }

  if (needsRehash) user.passwordHash = await hashPassword(password); // upgrade older hashes transparently
  user.failedLogins = 0;
  user.lockUntil = undefined;
  await user.save();
  await audit(req, 'login_success', { user });
  res.json(await session(user));
}));

// Setup questionnaire shown after sign-up / first sign-in. { skip: true } records that it was skipped.
router.post('/onboarding', requireAuth, validate(onboardingSchema), wrap(async (req, res) => {
  const b = req.body;
  const user = req.user;
  if (b.skip) {
    user.onboarding = { completed: true, skipped: true, completedAt: new Date() };
  } else {
    // Only owners and admins may change company details; everyone can save their own answers.
    if (rank(user.permission) >= rank('admin')) {
      const biz = {};
      if (b.businessName) biz.name = b.businessName;
      if (b.industry !== undefined) biz.industry = b.industry;
      if (b.size !== undefined) biz.size = b.size;
      if (b.departments) biz.departments = b.departments;
      if (Object.keys(biz).length) await Business.findByIdAndUpdate(user.business, biz);
    }
    user.onboarding = {
      completed: true, skipped: false, completedAt: new Date(),
      source: b.source || '', jobRole: b.jobRole || '', goals: b.goals || [], documentation: b.documentation || [], challenge: b.challenge || '',
    };
  }
  await user.save();
  res.json({ user: await user.populate('business', BUSINESS_FIELDS) });
}));

// Tells the client whether Google sign-in is available (and which client id to use).
router.get('/config', (_req, res) => res.json({ googleClientId: googleClientId() || null }));

router.post('/google', validate(googleSchema), wrap(async (req, res) => {
  let profile;
  try { profile = await verifyGoogleCredential(req.body.credential); }
  catch (e) {
    await audit(req, 'google_login_failed');
    if (e.status === 503) return res.status(503).json({ error: 'Google sign-in is not available.' });
    return res.status(401).json({ error: 'Google sign-in failed. Please try again.' });
  }
  const user = await findOrCreateGoogleUser(profile);
  await audit(req, 'google_login', { user });
  res.json(await session(user));
}));

// Returns the current user and a fresh token, so active people stay signed in while idle sessions expire.
router.get('/me', requireAuth, wrap(async (req, res) => {
  res.json({ user: await req.user.populate('business', BUSINESS_FIELDS), token: signToken(req.user) });
}));

// Changing the password signs out every other device (token version bump) and returns a new token for this one.
router.post('/change-password', requireAuth, validate(changePasswordSchema), wrap(async (req, res) => {
  const user = await User.findById(req.user._id).select('+passwordHash');
  if (user.passwordHash) {
    const { ok } = await verifyPassword(req.body.currentPassword, user.passwordHash);
    if (!ok) { await audit(req, 'password_change_failed', { user }); return res.status(401).json({ error: 'Your current password is incorrect.' }); }
  }
  user.passwordHash = await hashPassword(req.body.newPassword);
  user.passwordChangedAt = new Date();
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  await audit(req, 'password_changed', { user });
  res.json(await session(user));
}));

// Sign out of every device: all existing tokens stop working.
router.post('/logout-all', requireAuth, wrap(async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $inc: { tokenVersion: 1 } });
  await audit(req, 'logout_all', { user: req.user });
  res.json({ ok: true });
}));

export default router;
