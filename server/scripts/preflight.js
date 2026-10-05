// Pre-launch checklist. Run it with the SAME environment variables you will use in production:
//   NODE_ENV=production node scripts/preflight.js        (or:  npm run preflight)
// It prints PASS / WARN / FAIL for each item and exits with an error code if anything FAILS.
import 'dotenv/config';
import mongoose from 'mongoose';

const results = [];
const add = (level, title, detail = '') => results.push({ level, title, detail });
const env = process.env;
const isLocal = (s = '') => /localhost|127\.0\.0\.1|0\.0\.0\.0|\[::1\]/.test(s);

// ---- environment ----
env.NODE_ENV === 'production'
  ? add('PASS', 'NODE_ENV is production')
  : add('FAIL', 'NODE_ENV is not "production"', 'Set NODE_ENV=production on your host (the server then refuses weak secrets).');

const secret = (env.AUTH_SECRET || '').trim();
const knownWeak = ['flowlens-dev-secret-change-me', 'change-this-to-a-long-random-string'];
secret.length >= 32 && !knownWeak.includes(secret)
  ? add('PASS', 'AUTH_SECRET is long and not a placeholder')
  : add('FAIL', 'AUTH_SECRET is missing, short or a placeholder', 'Generate one: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');

const uri = env.MONGODB_URI || '';
!uri ? add('FAIL', 'MONGODB_URI is not set')
  : isLocal(uri) ? add('FAIL', 'MONGODB_URI points at this computer', 'Use a hosted database such as MongoDB Atlas.')
  : add('PASS', 'MONGODB_URI points at a hosted database');
if (uri && !/@/.test(uri)) add('WARN', 'MONGODB_URI has no username/password', 'Use a database user with a strong password.');

env.USE_MEMORY_FALLBACK === 'true'
  ? add('FAIL', 'USE_MEMORY_FALLBACK is true', 'A temporary in-memory database would silently replace your real one. Set it to false.')
  : add('PASS', 'In-memory database fallback is off');

env.SEED_DEMO === 'true'
  ? add('FAIL', 'SEED_DEMO is true', 'It creates a public demo account (demo@flowlens.app / demo1234). Set SEED_DEMO=false.')
  : add('PASS', 'Demo data seeding is off');

const origins = (env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
if (!origins.length) add('FAIL', 'CORS_ORIGINS is not set', 'Set it to your website address, e.g. https://flowlens.vercel.app');
else if (origins.some(isLocal)) add('FAIL', 'CORS_ORIGINS contains a localhost address', origins.join(', '));
else if (origins.some((o) => !o.startsWith('https://'))) add('FAIL', 'CORS_ORIGINS has a non-HTTPS address', origins.join(', '));
else add('PASS', `CORS_ORIGINS allows only ${origins.join(', ')}`);

env.TRUST_PROXY ? add('PASS', `TRUST_PROXY is ${env.TRUST_PROXY}`) : add('WARN', 'TRUST_PROXY is not set', 'Behind a host such as Render set TRUST_PROXY=1, or rate limiting sees the proxy instead of each visitor.');
env.GOOGLE_CLIENT_ID ? add('PASS', 'Google sign-in is configured', 'Remember to add your website to the OAuth client\'s Authorized JavaScript origins.') : add('WARN', 'Google sign-in is off', 'Fine if you only want email + password.');

// ---- database ----
if (uri && !isLocal(uri)) {
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
    add('PASS', 'Database is reachable');
    const demo = await mongoose.connection.db.collection('users').findOne({ email: 'demo@flowlens.app' }, { projection: { _id: 1 } });
    demo
      ? add('FAIL', 'The public demo account exists in this database', 'Remove it: npm run remove-demo -- --yes   (or use a fresh database for production)')
      : add('PASS', 'No demo account in this database');
    const weak = await mongoose.connection.db.collection('users').countDocuments({ passwordHash: { $regex: '^[0-9a-f]{32}:' } });
    if (weak) add('WARN', `${weak} account(s) still use the older password format`, 'They are upgraded automatically the next time each person signs in.');
  } catch (e) {
    add('FAIL', 'Could not reach the database', `${e.message} (check the connection string and Atlas Network Access)`);
  } finally { await mongoose.disconnect().catch(() => {}); }
}

const icon = { PASS: '[ OK ]', WARN: '[WARN]', FAIL: '[FAIL]' };
console.log('\nFlowLens pre-launch check\n');
for (const r of results) console.log(`${icon[r.level]} ${r.title}${r.detail ? `\n       ${r.detail}` : ''}`);
const fails = results.filter((r) => r.level === 'FAIL').length, warns = results.filter((r) => r.level === 'WARN').length;
console.log(`\n${fails ? `${fails} problem(s) to fix before going public.` : 'No blocking problems found.'}${warns ? ` ${warns} warning(s).` : ''}\n`);
process.exit(fails ? 1 : 0);
