import { Router } from 'express';
import { User, Business } from '../models/index.js';
import { googleClientId, verifyGoogleCredential, findOrCreateGoogleUser } from '../services/google.js';
import { hashPassword, verifyPassword, signToken, requireAuth } from '../services/auth.js';

const router = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const session = (user) => ({ token: signToken(user._id), user });

router.post('/register', wrap(async (req, res) => {
  const { name, email, password, businessName } = req.body;
  if (!name?.trim() || !email?.trim() || !businessName?.trim()) return res.status(400).json({ error: 'Name, email and business name are required.' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  if (await User.findOne({ email: email.toLowerCase().trim() })) return res.status(409).json({ error: 'An account with this email already exists.' });
  const business = await Business.create({ name: businessName.trim(), departments: ['Sales', 'Finance', 'HR', 'Operations', 'IT'] });
  const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), passwordHash: hashPassword(password), role: 'Owner', business: business._id });
  res.status(201).json(session(await user.populate('business', 'name industry size departments')));
}));

router.post('/login', wrap(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase().trim() }).select('+passwordHash');
  if (!user || !verifyPassword(req.body.password || '', user.passwordHash)) return res.status(401).json({ error: 'Incorrect email or password.' });
  res.json(session(await user.populate('business', 'name industry size departments')));
}));

// Setup questionnaire shown after sign-up / first sign-in. { skip: true } records that it was skipped.
const strings = (v, max = 12) => (Array.isArray(v) ? v.map((x) => String(x).trim().slice(0, 80)).filter(Boolean).slice(0, max) : []);
const text = (v, max = 500) => String(v ?? '').trim().slice(0, max);

router.post('/onboarding', requireAuth, wrap(async (req, res) => {
  const b = req.body;
  const user = req.user;
  if (!b.skip) {
    const biz = {};
    if (text(b.businessName, 120)) biz.name = text(b.businessName, 120);
    if (b.industry !== undefined) biz.industry = text(b.industry, 80);
    if (b.size !== undefined) biz.size = text(b.size, 40);
    if (Array.isArray(b.departments)) biz.departments = strings(b.departments, 20);
    if (Object.keys(biz).length) await Business.findByIdAndUpdate(user.business, biz);
    user.onboarding = {
      completed: true, skipped: false, completedAt: new Date(),
      source: text(b.source, 120), jobRole: text(b.jobRole, 80),
      goals: strings(b.goals), documentation: strings(b.documentation), challenge: text(b.challenge),
    };
  } else {
    user.onboarding = { completed: true, skipped: true, completedAt: new Date() };
  }
  await user.save();
  res.json({ user: await user.populate('business', 'name industry size departments') });
}));

// Tells the client whether Google sign-in is available (and which client id to use).
router.get('/config', (_req, res) => res.json({ googleClientId: googleClientId() || null }));

router.post('/google', wrap(async (req, res) => {
  let profile;
  try { profile = await verifyGoogleCredential(req.body.credential); }
  catch (e) {
    if (e.status) return res.status(e.status).json({ error: e.message });
    return res.status(401).json({ error: 'Google sign-in failed. Please try again.' });
  }
  const user = await findOrCreateGoogleUser(profile);
  res.json(session(await user.populate('business', 'name industry size departments')));
}));

router.get('/me', requireAuth, wrap(async (req, res) => res.json({ user: await req.user.populate('business', 'name industry size departments') })));

export default router;
