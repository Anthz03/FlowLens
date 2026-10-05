import { Router } from 'express';
import { User, Business } from '../models/index.js';
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
  res.status(201).json(session(await user.populate('business', 'name')));
}));

router.post('/login', wrap(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase().trim() }).select('+passwordHash');
  if (!user || !verifyPassword(req.body.password || '', user.passwordHash)) return res.status(401).json({ error: 'Incorrect email or password.' });
  res.json(session(await user.populate('business', 'name')));
}));

router.get('/me', requireAuth, wrap(async (req, res) => res.json({ user: await req.user.populate('business', 'name') })));

export default router;
