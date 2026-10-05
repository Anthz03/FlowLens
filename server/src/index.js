import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import routes from './routes/index.js';
import authRoutes from './routes/auth.js';
import { requireAuth } from './services/auth.js';
import { seedIfEmpty, ensureDemoLogin } from './seed.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));
app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api', requireAuth, routes);
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || err.name === 'ValidationError' || err.name === 'CastError' ? 400 : 500;
  res.status(status).json({ error: err.message });
});

const port = process.env.PORT || 5000;
await connectDB();
if (process.env.SEED_DEMO === 'true') { await seedIfEmpty(); await ensureDemoLogin(); }
app.listen(port, () => console.log(`FlowLens API running on http://localhost:${port}`));
