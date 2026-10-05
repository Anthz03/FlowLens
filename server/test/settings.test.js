// Tests for the Settings features: profile, analysis rules, data export and admin password reset.
import test, { after } from 'node:test';
import assert from 'node:assert/strict';

Object.assign(process.env, {
  NODE_ENV: 'test', AUTH_SECRET: 'test-secret-'.padEnd(64, 'y'), MAX_FAILED_LOGINS: '5',
  RATE_LIMIT_AUTH_MAX: '100', RATE_LIMIT_REGISTER_MAX: '100', RATE_LIMIT_HEAVY_MAX: '1000',
});
const { MongoMemoryServer } = await import('mongodb-memory-server');
const mongoose = (await import('mongoose')).default;
const mem = await MongoMemoryServer.create();
await mongoose.connect(mem.getUri('settingstest'));
const { createApp } = await import('../src/app.js');
const server = createApp().listen(0);
const base = `http://127.0.0.1:${server.address().port}/api`;
after(async () => { server.close(); await mongoose.disconnect(); await mem.stop(); });

const call = async (method, path, { body, token, raw } = {}) => {
  const res = await fetch(base + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = new TextDecoder('utf-8', { ignoreBOM: true }).decode(await res.arrayBuffer()); // keep the BOM so it can be asserted
  let json = {};
  try { json = JSON.parse(text); } catch { /* not JSON (CSV) */ }
  return { status: res.status, headers: res.headers, json, text };
};
const PW = 'Sup3rSecret99';
const register = async (name, email) => {
  const r = await call('POST', '/auth/register', { body: { name, email, password: PW, businessName: `${name} Co` } });
  assert.equal(r.status, 201, r.text);
  return { token: r.json.token, user: r.json.user };
};
const addMember = async (owner, name, email, permission = 'member') => {
  const r = await call('POST', '/users', { token: owner.token, body: { name, email, permission } });
  assert.equal(r.status, 201, r.text);
  const login = await call('POST', '/auth/login', { body: { email, password: r.json.temporaryPassword } });
  return { id: r.json.user._id, token: login.json.token, temp: r.json.temporaryPassword };
};
const A = await register('Alice', 'alice@set.test');
const B = await register('Bob', 'bob@set.test');

test('profile: people can edit their own name and job title, nothing else', async () => {
  const r = await call('PUT', '/auth/profile', { token: A.token, body: { name: 'Alice Cooper', role: 'Head of Ops', permission: 'member', email: 'evil@x.test', business: B.user.business._id } });
  assert.equal(r.status, 200);
  assert.equal(r.json.user.name, 'Alice Cooper');
  assert.equal(r.json.user.role, 'Head of Ops');
  assert.equal(r.json.user.permission, 'owner', 'cannot change own permission');
  assert.equal(r.json.user.email, 'alice@set.test', 'cannot change email here');
  assert.equal(String(r.json.user.business._id), String(A.user.business._id), 'cannot change business');
  assert.equal(r.json.user.hasPassword, true);
  assert.equal(r.json.user.hasGoogle, false);
  assert.equal((await call('PUT', '/auth/profile', { token: A.token, body: {} })).status, 400);
  assert.equal((await call('PUT', '/auth/profile', { token: A.token, body: { name: '' } })).status, 400);
  assert.equal((await call('PUT', '/auth/profile', {})).status, 401);
});

test('analysis rules: defaults, validation, roles, and real effect on results', async () => {
  const proc = (await call('POST', '/processes', { token: A.token, body: { name: 'Rules demo', steps: [
    { key: 'a', name: 'Prepare quote', type: 'task', estimatedTime: 30, isManual: true, role: 'Sales' },
    { key: 'b', name: 'Send quote', type: 'task', estimatedTime: 5, isManual: true, role: 'Sales' },
  ] } })).json;
  const bottlenecks = async () => (await call('GET', `/analysis/process/${proc._id}`, { token: A.token })).json.findings.filter((f) => f.type === 'bottleneck').length;

  const initial = await call('GET', '/settings/analysis-rules', { token: A.token });
  assert.equal(initial.json.rules.bottleneckMinutes, 45);
  assert.deepEqual(initial.json.rules, initial.json.defaults);
  assert.equal(await bottlenecks(), 0, '30 min is under the default 45-minute threshold');

  // validation
  for (const bad of [{ bottleneckMinutes: 1 }, { bottleneckMinutes: 9999 }, { duplicateSimilarity: 0.1 }, { slowFactor: 'abc' }, { nonsense: 1 }, {}]) {
    assert.equal((await call('PUT', '/settings/analysis-rules', { token: A.token, body: bad })).status, 400, JSON.stringify(bad));
  }
  // members can read but not change
  const member = await addMember(A, 'Mia', 'mia@set.test');
  assert.equal((await call('GET', '/settings/analysis-rules', { token: member.token })).status, 200);
  assert.equal((await call('PUT', '/settings/analysis-rules', { token: member.token, body: { bottleneckMinutes: 20 } })).status, 403);
  assert.equal((await call('DELETE', '/settings/analysis-rules', { token: member.token })).status, 403);

  // the owner tightens the rule: the same step is now a bottleneck, in analysis and in the list
  const saved = await call('PUT', '/settings/analysis-rules', { token: A.token, body: { bottleneckMinutes: 25 } });
  assert.equal(saved.status, 200);
  assert.equal(saved.json.rules.bottleneckMinutes, 25);
  assert.equal(saved.json.rules.maxHandoffs, 3, 'untouched rules keep their defaults');
  assert.equal(await bottlenecks(), 1);
  const listed = (await call('GET', '/processes', { token: A.token })).json.find((p) => p._id === proc._id);
  assert.equal(listed.analysis.metrics.bottlenecks, 1);

  // another business is unaffected
  assert.equal((await call('GET', '/settings/analysis-rules', { token: B.token })).json.rules.bottleneckMinutes, 45);

  // reset
  const reset = await call('DELETE', '/settings/analysis-rules', { token: A.token });
  assert.equal(reset.json.rules.bottleneckMinutes, 45);
  assert.equal(await bottlenecks(), 0);
  const log = (await call('GET', '/audit', { token: A.token })).json;
  assert.ok(log.some((e) => e.action === 'analysis_rules_changed') && log.some((e) => e.action === 'analysis_rules_reset'));
});

test('export: JSON and CSV contain only your data and are safe to open in a spreadsheet', async () => {
  const mine = (await call('POST', '/processes', { token: A.token, body: { name: 'Export me', department: 'Sales', steps: [
    { key: 'x', name: '=HYPERLINK("http://evil.test","click")', type: 'task', role: 'Ann', description: 'has, comma and "quotes"', estimatedTime: 10 },
    { key: 'y', name: '@cmd', type: 'task', role: '-2+3' },
  ] } })).json;
  await call('POST', '/processes', { token: B.token, body: { name: 'Bobs secret process', steps: [{ key: 'q', name: 'Bob step' }] } });

  const json = await call('GET', '/export/processes?format=json', { token: A.token });
  assert.equal(json.status, 200);
  assert.match(json.headers.get('content-disposition'), /attachment; filename="flowlens-processes-\d{4}-\d{2}-\d{2}\.json"/);
  const data = JSON.parse(json.text);
  assert.equal(data.app, 'FlowLens');
  assert.ok(data.processes.some((p) => p.name === 'Export me' && p.steps.length === 2 && typeof p.healthScore === 'number'));
  assert.ok(!json.text.includes('Bobs secret process'), 'other businesses never appear');
  for (const secret of ['passwordHash', 'tokenVersion', 'createdBy']) assert.ok(!json.text.includes(secret), `${secret} must not be exported`);
  assert.ok(!/[a-f0-9]{24}/i.test(json.text), 'no database ids in the export');

  const csv = await call('GET', '/export/processes?format=csv', { token: A.token });
  assert.equal(csv.status, 200);
  assert.match(csv.headers.get('content-type'), /text\/csv/);
  assert.ok(csv.text.startsWith('﻿process,version'), 'header row (with BOM for Excel)');
  assert.ok(csv.text.includes(`"'=HYPERLINK(""http://evil.test"",""click"")"`), 'formula cells are neutralised and quoted correctly');
  assert.ok(csv.text.includes(`'@cmd`) && csv.text.includes(`'-2+3`), 'other formula starters are neutralised');
  assert.ok(csv.text.includes('"has, comma and ""quotes"""'));
  assert.ok(!csv.text.includes('Bob step'));

  const one = await call('GET', `/processes/${mine._id}/export?format=csv`, { token: A.token });
  assert.equal(one.status, 200);
  assert.match(one.headers.get('content-disposition'), /flowlens-process-/);
  assert.equal((await call('GET', `/processes/${mine._id}/export`, { token: B.token })).status, 404, 'cannot export someone elses process');
  assert.equal((await call('GET', '/export/processes?format=xml', { token: A.token })).status, 400);
  assert.equal((await call('GET', '/export/processes?format=csv&evil=1', { token: A.token })).status, 400);
  assert.equal((await call('GET', '/export/processes')).status, 401);
  assert.ok((await call('GET', '/audit', { token: A.token })).json.some((e) => e.action === 'data_exported'));
});

test('admin password reset: new one-time password, sessions revoked, lockout cleared', async () => {
  const member = await addMember(A, 'Rita', 'rita@set.test');
  const admin = await addMember(A, 'Ada', 'ada@set.test', 'admin');

  // lock Rita's account with wrong passwords
  for (let i = 0; i < 5; i++) await call('POST', '/auth/login', { body: { email: 'rita@set.test', password: `Wrong-pass-${i}x` } });
  assert.equal((await call('POST', '/auth/login', { body: { email: 'rita@set.test', password: member.temp } })).status, 429);

  assert.equal((await call('POST', `/users/${member.id}/reset-password`, { token: member.token })).status, 403, 'members cannot reset');
  assert.equal((await call('POST', `/users/${A.user._id}/reset-password`, { token: admin.token })).status, 403, 'admin cannot reset the owner');
  assert.equal((await call('POST', `/users/${A.user._id}/reset-password`, { token: A.token })).status, 400, 'use change-password for yourself');
  assert.equal((await call('POST', `/users/${member.id}/reset-password`, { token: B.token })).status, 404, 'other businesses cannot reset');

  const r = await call('POST', `/users/${member.id}/reset-password`, { token: admin.token });
  assert.equal(r.status, 200);
  const fresh = r.json.temporaryPassword;
  assert.ok(fresh && fresh !== member.temp && fresh.length >= 12);
  assert.equal((await call('GET', '/processes', { token: member.token })).status, 401, 'old sessions end');
  assert.equal((await call('POST', '/auth/login', { body: { email: 'rita@set.test', password: member.temp } })).status, 401, 'old password stops working');
  assert.equal((await call('POST', '/auth/login', { body: { email: 'rita@set.test', password: fresh } })).status, 200, 'account is unlocked and the new password works');
  assert.ok((await call('GET', '/audit', { token: A.token })).json.some((e) => e.action === 'password_reset_by_admin'));
});
