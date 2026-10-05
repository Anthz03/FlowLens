import 'dotenv/config';
import { getConfig } from './config.js';
import { connectDB } from './db.js';
import { createApp } from './app.js';
import { seedIfEmpty, ensureDemoLogin } from './seed.js';
import { ensureOwners } from './services/migrations.js';

const cfg = getConfig(); // throws in production if AUTH_SECRET is missing, short or a known placeholder
if (cfg.weakSecret) console.warn('WARNING: AUTH_SECRET is missing, short or a placeholder. Anyone who knows it can forge logins. Set a long random value in server/.env.');

const port = process.env.PORT || 5000;
await connectDB();
if (process.env.SEED_DEMO === 'true') { await seedIfEmpty(); await ensureDemoLogin(); }
await ensureOwners();
createApp().listen(port, () => console.log(`FlowLens API running on http://localhost:${port}`));
