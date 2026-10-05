// Security tests: run with  npm test  (uses an in-memory MongoDB, no setup needed)
import test, { after } from 'node:test';
import assert from 'node:assert/strict';

Object.assign(process.env, {
  NODE_ENV: 'test', AUTH_SECRET: 'test-secret-'.padEnd(64, 'x'), MAX_FAILED_LOGINS: '5',
  RATE_LIMIT_AUTH_MAX: '30', RATE_LIMIT_REGISTER_MAX: '100', RATE_LIMIT_HEAVY_MAX: '1000', CORS_ORIGINS: 'http://localhost:5173',
});
const { MongoMemoryServer } = await import('mongodb-memory-server');
const mongoose = (await import('mongoose')).default;
const mem = await MongoMemoryServer.create();
await mongoose.connect(mem.getUri('securitytest'));
const { createApp } = await import('../src/app.js');
const server = createApp().listen(0);
const base = `http://127.0.0.1:${server.address().port}/api`;
after(async () => { server.close(); await mongoose.disconnect(); await mem.stop(); });

const call = async (method, path, { body, token, headers = {}, raw } = {}) => {
  const res = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers },
    body: raw ?? (body === undefined ? undefined : JSON.stringify(body)),
  });
  return { status: res.status, headers: res.headers, json: await res.json().catch(() => ({})) };
};
const PW = 'Sup3rSecret99';
const register = async (name, email, businessName = `${name} Co`) => {
  const r = await call('POST', '/auth/register', { body: { name, email, password: PW, businessName } });
  assert.equal(r.status, 201, JSON.stringify(r.json));
  return { token: r.json.token, user: r.json.user };
};
const makeProcess = async (token, name = 'Order process') => {
  const r = await call('POST', '/processes', { token, body: { name, steps: [{ key: 'a', name: 'Receive order', type: 'task' }, { key: 'b', name: 'Ship', type: 'task' }] } });
  assert.equal(r.status, 201, JSON.stringify(r.json));
  return r.json;
};

const A = await register('Alice', 'alice@a.test');
const B = await register('Bob', 'bob@b.test');

test('authentication is required and tokens cannot be forged', async () => {
  assert.equal((await call('GET', '/health')).status, 200);
  assert.equal((await call('GET', '/processes')).status, 401);
  assert.equal((await call('GET', '/processes', { token: 'garbage' })).status, 401);
  const [body, sig] = A.token.split('.');
  const forged = Buffer.from(JSON.stringify({ ...JSON.parse(Buffer.from(body, 'base64url')), uid: B.user._id })).toString('base64url');
  assert.equal((await call('GET', '/processes', { token: `${forged}.${sig}` })).status, 401, 'tampered payload must be rejected');
  const noneAlg = `${Buffer.from(JSON.stringify({ uid: A.user._id, v: 0, exp: 9999999999 })).toString('base64url')}.`;
  assert.equal((await call('GET', '/processes', { token: noneAlg })).status, 401);
});

test('passwords must be strong; secrets never leave the server', async () => {
  for (const password of ['short1', 'password123', 'abcdefghij', '1234567890', 'aaaaaaaa']) {
    const r = await call('POST', '/auth/register', { body: { name: 'X', email: `weak${password}@x.test`, password, businessName: 'X' } });
    assert.equal(r.status, 400, `"${password}" should be rejected`);
  }
  assert.equal(A.user.permission, 'owner');
  for (const k of ['passwordHash', 'tokenVersion', 'failedLogins', 'lockUntil']) assert.equal(k in A.user, false, `${k} leaked`);
});

test('NoSQL injection payloads are rejected', async () => {
  assert.equal((await call('POST', '/auth/login', { body: { email: { $ne: null }, password: { $ne: null } } })).status, 400);
  assert.equal((await call('POST', '/auth/login', { body: { email: 'alice@a.test', password: { $gt: '' } } })).status, 400);
  assert.equal((await call('GET', '/processes?department[$ne]=x', { token: A.token })).status, 400);
  assert.equal((await call('GET', '/processes?status=bogus', { token: A.token })).status, 400);
  const p = await call('POST', '/processes', { token: A.token, body: { name: 'inj', $where: 'sleep(1000)', 'a.b': 1, description: { $ne: 1 } } });
  assert.equal(p.status, 400, 'object where a string is expected is invalid');
});

test('mass assignment: clients cannot set owners, tenants or move steps between processes', async () => {
  const forged = await call('POST', '/processes', {
    token: B.token, body: { name: 'Mine', business: A.user.business._id, createdBy: A.user._id, _id: '0'.repeat(24), isAdmin: true },
  });
  assert.equal(forged.status, 201);
  const mine = (await call('GET', `/processes/${forged.json._id}`, { token: B.token })).json;
  assert.notEqual(String(mine.business), String(A.user.business._id));
  assert.equal(String(mine.createdBy._id ?? mine.createdBy), String(B.user._id));
  assert.notEqual(mine._id, '0'.repeat(24));

  const victim = await makeProcess(A.token, 'Victim');
  const myProc = await makeProcess(B.token, 'Attacker');
  const stepId = myProc.steps[0]._id;
  const moved = await call('PUT', `/steps/${stepId}`, { token: B.token, body: { name: 'renamed', process: victim._id } });
  assert.equal(moved.status, 200);
  assert.equal(String(moved.json.process), String(myProc._id), 'step must stay in its own process');
  assert.equal((await call('GET', `/processes/${victim._id}`, { token: A.token })).json.steps.length, 2, 'victim process untouched');
});

test('tenant isolation: another business cannot read or change your data', async () => {
  const proc = await makeProcess(A.token, 'Private');
  const stepId = proc.steps[0]._id;
  const analysis = (await call('POST', `/analysis/process/${proc._id}`, { token: A.token })).json;
  const probes = [
    ['GET', `/processes/${proc._id}`], ['PUT', `/processes/${proc._id}`, { name: 'hacked' }], ['DELETE', `/processes/${proc._id}`],
    ['GET', `/processes/${proc._id}/steps`], ['POST', `/processes/${proc._id}/steps`, { name: 'x' }], ['POST', `/processes/${proc._id}/duplicate`, {}],
    ['GET', `/steps/${stepId}`], ['PUT', `/steps/${stepId}`, { name: 'x' }], ['DELETE', `/steps/${stepId}`],
    ['GET', `/analysis/process/${proc._id}`], ['PUT', `/analysis/${analysis._id}`, { notes: 'x' }], ['DELETE', `/analysis/${analysis._id}`],
  ];
  for (const [method, path, body] of probes) {
    const r = await call(method, path, { token: B.token, body });
    assert.ok([403, 404].includes(r.status), `${method} ${path} gave ${r.status}`);
  }
  const still = await call('GET', `/processes/${proc._id}`, { token: A.token });
  assert.equal(still.json.name, 'Private');
  assert.equal((await call('GET', '/analysis', { token: A.token })).json.some((a) => a._id === analysis._id), true, 'analysis must survive');
  assert.equal((await call('GET', '/processes', { token: B.token })).json.some((p) => p._id === proc._id), false);
  // cannot attach your process to someone else's as its "base"
  assert.equal((await call('POST', '/processes', { token: B.token, body: { name: 'x', baseProcess: proc._id } })).status, 400);
});

test('input validation: bad ids, bad types and oversized data', async () => {
  assert.equal((await call('GET', '/processes/not-an-id', { token: A.token })).status, 400);
  assert.equal((await call('POST', '/processes', { token: A.token, body: { name: '' } })).status, 400);
  assert.equal((await call('POST', '/processes', { token: A.token, body: { name: 'x', status: 'hacked' } })).status, 400);
  assert.equal((await call('POST', '/processes', { token: A.token, body: { name: 'x', steps: [{ name: 'a', type: 'weird' }] } })).status, 400);
  assert.equal((await call('POST', '/processes', { token: A.token, body: { name: 'x', steps: Array.from({ length: 301 }, (_, i) => ({ name: `s${i}` })) } })).status, 400);
  assert.equal((await call('POST', '/processes', { token: A.token, raw: '{bad json' })).status, 400);
  const big = await call('POST', '/processes', { token: A.token, body: { name: 'x', description: 'y'.repeat(300_000) } });
  assert.equal(big.status, 413);
  assert.equal((await call('GET', '/no-such-route', { token: A.token })).status, 404);
});

test('roles: members cannot delete, manage the team or change the business', async () => {
  const created = await call('POST', '/users', { token: A.token, body: { name: 'Mia', email: 'mia@a.test' } });
  assert.equal(created.status, 201);
  const temp = created.json.temporaryPassword;
  assert.ok(temp && temp !== 'welcome123' && temp.length >= 12, 'random temporary password');
  const login = await call('POST', '/auth/login', { body: { email: 'mia@a.test', password: temp } });
  assert.equal(login.status, 200);
  const member = login.json.token;
  assert.equal(login.json.user.permission, 'member');

  const proc = await makeProcess(member, 'Member made');          // members can create and edit
  assert.equal((await call('PUT', `/processes/${proc._id}`, { token: member, body: { name: 'Edited' } })).status, 200);
  assert.equal((await call('DELETE', `/processes/${proc._id}`, { token: member })).status, 403);
  assert.equal((await call('POST', '/users', { token: member, body: { name: 'Z', email: 'z@a.test' } })).status, 403);
  assert.equal((await call('PUT', `/businesses/${A.user.business._id}`, { token: member, body: { name: 'Mine now' } })).status, 403);
  assert.equal((await call('GET', '/audit', { token: member })).status, 403);
  assert.equal((await call('PUT', `/users/${A.user._id}`, { token: member, body: { permission: 'member' } })).status, 403);

  // the owner can; admins cannot create other admins; the last owner cannot be demoted
  assert.equal((await call('DELETE', `/processes/${proc._id}`, { token: A.token })).status, 200);
  const adminRes = await call('POST', '/users', { token: A.token, body: { name: 'Ada', email: 'ada@a.test', permission: 'admin' } });
  assert.equal(adminRes.status, 201);
  const admin = (await call('POST', '/auth/login', { body: { email: 'ada@a.test', password: adminRes.json.temporaryPassword } })).json.token;
  assert.equal((await call('POST', '/users', { token: admin, body: { name: 'Eve', email: 'eve@a.test', permission: 'admin' } })).status, 403);
  assert.equal((await call('PUT', `/users/${A.user._id}`, { token: admin, body: { name: 'pwned' } })).status, 403, 'admin cannot edit the owner');
  assert.equal((await call('PUT', `/users/${A.user._id}`, { token: A.token, body: { permission: 'member' } })).status, 400, 'last owner stays an owner');
  const audit = await call('GET', '/audit', { token: A.token });
  assert.equal(audit.status, 200);
  assert.ok(audit.json.some((e) => e.action === 'user_created') && audit.json.some((e) => e.action === 'process_deleted'));
  // role change takes effect immediately (old tokens revoked)
  const memberId = created.json.user._id;
  assert.equal((await call('PUT', `/users/${memberId}`, { token: A.token, body: { permission: 'admin' } })).status, 200);
  assert.equal((await call('GET', '/processes', { token: member })).status, 401);
});

test('account lockout after repeated wrong passwords', async () => {
  await register('Lena', 'lena@l.test');
  for (let i = 0; i < 5; i++) assert.equal((await call('POST', '/auth/login', { body: { email: 'lena@l.test', password: `Wrong-pass-${i}1` } })).status, 401);
  const locked = await call('POST', '/auth/login', { body: { email: 'lena@l.test', password: PW } });
  assert.equal(locked.status, 429, 'even the correct password is refused while locked');
  assert.match(locked.json.error, /minute/);
  // unknown and known emails give the same message
  const unknown = await call('POST', '/auth/login', { body: { email: 'nobody@nowhere.test', password: 'Whatever123' } });
  assert.equal(unknown.status, 401);
  assert.equal(unknown.json.error, 'Incorrect email or password.');
});

test('sessions: change password and sign-out-everywhere revoke old tokens; /me refreshes', async () => {
  const U = await register('Sam', 'sam@s.test');
  const me = await call('GET', '/auth/me', { token: U.token });
  assert.equal(me.status, 200);
  assert.ok(me.json.token, 'fresh token issued');

  assert.equal((await call('POST', '/auth/change-password', { token: U.token, body: { currentPassword: 'Not-the-one-1', newPassword: 'Another99pass' } })).status, 400);
  assert.equal((await call('POST', '/auth/change-password', { token: U.token, body: { currentPassword: PW, newPassword: 'weak' } })).status, 400);
  const changed = await call('POST', '/auth/change-password', { token: U.token, body: { currentPassword: PW, newPassword: 'Another99pass' } });
  assert.equal(changed.status, 200);
  assert.equal((await call('GET', '/processes', { token: U.token })).status, 401, 'old token revoked');
  assert.equal((await call('GET', '/processes', { token: changed.json.token })).status, 200, 'new token works');
  assert.equal((await call('POST', '/auth/login', { body: { email: 'sam@s.test', password: PW } })).status, 401, 'old password no longer works');

  const out = await call('POST', '/auth/logout-all', { token: changed.json.token });
  assert.equal(out.status, 200);
  assert.equal((await call('GET', '/processes', { token: changed.json.token })).status, 401);
});

test('security headers, CORS allow-list and safe errors', async () => {
  const r = await call('GET', '/health');
  assert.equal(r.headers.get('x-powered-by'), null);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(r.headers.get('cache-control'), 'no-store');
  assert.ok(r.headers.get('x-request-id'));
  assert.equal((await call('GET', '/health', { headers: { Origin: 'http://evil.example' } })).headers.get('access-control-allow-origin'), null);
  assert.equal((await call('GET', '/health', { headers: { Origin: 'http://localhost:5173' } })).headers.get('access-control-allow-origin'), 'http://localhost:5173');
  const err = await call('GET', '/processes/zzz', { token: A.token });
  assert.ok(!/mongo|stack|cast|at /i.test(JSON.stringify(err.json)), 'no internals in error bodies');
});

test('rate limiting blocks repeated failed sign-ins from one address', async () => {
  let blocked;
  for (let i = 0; i < 60 && !blocked; i++) {
    const r = await call('POST', '/auth/login', { body: { email: `ghost${i}@nowhere.test`, password: 'Whatever123' } });
    if (r.status === 429) blocked = r;
  }
  assert.ok(blocked, 'a 429 should appear within 60 failed attempts');
  assert.ok(blocked.headers.get('retry-after') || blocked.headers.get('ratelimit'), 'rate limit headers present');
  // a correct login from the same address is also paused while the limit is active (protects against password spraying)
  assert.equal((await call('POST', '/auth/login', { body: { email: 'alice@a.test', password: PW } })).status, 429);
});
