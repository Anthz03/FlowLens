import { Router } from 'express';
import { User, Business, Process, ProcessStep, ProcessAnalysis } from '../models/index.js';
import { hashPassword } from '../services/auth.js';
import { loadProcess, loadAllProcesses, replaceSteps, removeProcess } from '../services/processService.js';
import { analyzeProcess } from '../services/analyzer.js';
import { optimizeProcess } from '../services/optimizer.js';

const router = Router();
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const notFound = (res) => res.status(404).json({ error: 'Not found' });

// Generic CRUD for simple collections
function crud(path, Model) {
  router.get(path, wrap(async (_req, res) => res.json(await Model.find().sort('-createdAt'))));
  router.get(`${path}/:id`, wrap(async (req, res) => { const d = await Model.findById(req.params.id); d ? res.json(d) : notFound(res); }));
  router.post(path, wrap(async (req, res) => res.status(201).json(await Model.create(req.body))));
  router.put(`${path}/:id`, wrap(async (req, res) => { const d = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); d ? res.json(d) : notFound(res); }));
  router.delete(`${path}/:id`, wrap(async (req, res) => { const d = await Model.findByIdAndDelete(req.params.id); d ? res.json({ ok: true }) : notFound(res); }));
}
// ---- Businesses: a user can only see/edit their own ----
router.get('/businesses', wrap(async (req, res) => res.json(await Business.find({ _id: req.user.business }))));
router.put('/businesses/:id', wrap(async (req, res) => {
  if (String(req.user.business) !== req.params.id) return notFound(res);
  res.json(await Business.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
}));

// ---- Users (team members of the signed-in business) ----
router.get('/users', wrap(async (req, res) => res.json(await User.find({ business: req.user.business }).sort('name'))));
router.post('/users', wrap(async (req, res) => {
  const { name, email, role, password = 'welcome123' } = req.body;
  res.status(201).json(await User.create({ name, email, role, passwordHash: hashPassword(password), business: req.user.business }));
}));
router.put('/users/:id', wrap(async (req, res) => {
  const u = await User.findOneAndUpdate({ _id: req.params.id, business: req.user.business }, { name: req.body.name, role: req.body.role }, { new: true });
  u ? res.json(u) : notFound(res);
}));
router.delete('/users/:id', wrap(async (req, res) => {
  if (String(req.user._id) === req.params.id) return res.status(400).json({ error: 'You cannot delete your own account.' });
  const u = await User.findOneAndDelete({ _id: req.params.id, business: req.user.business });
  u ? res.json({ ok: true }) : notFound(res);
}));

// ---- Tenant isolation: processes/steps/analysis must belong to the user's business ----
const sameBiz = (req, doc) => doc && String(doc.business) === String(req.user.business);
const ownProcess = wrap(async (req, res, next) => {
  const p = await Process.findById(req.params.id).select('business');
  return sameBiz(req, p) ? next() : notFound(res);
});
const ownStep = wrap(async (req, res, next) => {
  const s = await ProcessStep.findById(req.params.id).select('process');
  const p = s && (await Process.findById(s.process).select('business'));
  return sameBiz(req, p) ? next() : notFound(res);
});
router.use('/processes/:id', ownProcess);
router.use('/analysis/process/:id', ownProcess);
router.use('/steps/:id', ownStep);

// ---- Processes ----
router.get('/processes', wrap(async (req, res) => {
  const filter = { business: req.user.business };
  ['department', 'status', 'version'].forEach((f) => req.query[f] && (filter[f] = req.query[f]));
  const list = await loadAllProcesses(filter);
  res.json(list.map((p) => ({ ...p, analysis: (({ score, metrics }) => ({ score, metrics }))(analyzeProcess(p)) })));
}));

router.get('/processes/:id', wrap(async (req, res) => {
  const p = await loadProcess(req.params.id);
  if (!p) return notFound(res);
  p.toBeVersions = await Process.find({ baseProcess: p._id }).select('name version status').lean();
  res.json(p);
}));

router.post('/processes', wrap(async (req, res) => {
  const { steps, edges, ...data } = req.body;
  data.createdBy = req.user._id;
  data.business = req.user.business;
  const p = await Process.create(data);
  await replaceSteps(p._id, steps, edges);
  res.status(201).json(await loadProcess(p._id));
}));

router.put('/processes/:id', wrap(async (req, res) => {
  const { steps, edges, _id, createdAt, updatedAt, ...data } = req.body;
  delete data.analysis; delete data.toBeVersions; delete data.createdBy; delete data.business;
  const p = await Process.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
  if (!p) return notFound(res);
  if (steps) await replaceSteps(p._id, steps, edges ?? p.edges.map((e) => e.toObject()));
  else if (edges) await Process.findByIdAndUpdate(p._id, { edges });
  res.json(await loadProcess(p._id));
}));

router.delete('/processes/:id', wrap(async (req, res) => { await removeProcess(req.params.id); res.json({ ok: true }); }));

// Duplicate as TO-BE; { optimize: true } applies rule-based improvements
router.post('/processes/:id/duplicate', wrap(async (req, res) => {
  const src = await loadProcess(req.params.id);
  if (!src) return notFound(res);
  const { optimize = false, version = 'to-be' } = req.body || {};
  let { steps, edges } = src;
  let improvements = [];
  if (optimize) ({ steps, edges, improvements } = optimizeProcess(src));
  const copy = await Process.create({
    name: `${src.name} (${version === 'to-be' ? 'TO-BE' : 'Copy'})`, description: src.description, department: src.department,
    status: 'draft', version, baseProcess: version === 'to-be' ? src._id : null, improvements,
    business: src.business, createdBy: src.createdBy?._id,
  });
  await replaceSteps(copy._id, steps.map((s) => ({ ...s, position: optimize ? undefined : s.position })), edges);
  res.status(201).json(await loadProcess(copy._id));
}));

// ---- Process steps ----
router.get('/processes/:id/steps', wrap(async (req, res) => res.json(await ProcessStep.find({ process: req.params.id }).sort('order'))));
router.post('/processes/:id/steps', wrap(async (req, res) => {
  const count = await ProcessStep.countDocuments({ process: req.params.id });
  const key = req.body.key || Math.random().toString(36).slice(2, 10);
  const step = await ProcessStep.create({ ...req.body, key, process: req.params.id, order: count });
  await Process.findByIdAndUpdate(req.params.id, { $push: { steps: step._id } });
  res.status(201).json(step);
}));
router.get('/steps/:id', wrap(async (req, res) => { const s = await ProcessStep.findById(req.params.id); s ? res.json(s) : notFound(res); }));
router.put('/steps/:id', wrap(async (req, res) => { const s = await ProcessStep.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); s ? res.json(s) : notFound(res); }));
router.delete('/steps/:id', wrap(async (req, res) => {
  const s = await ProcessStep.findByIdAndDelete(req.params.id);
  if (!s) return notFound(res);
  await Process.findByIdAndUpdate(s.process, { $pull: { steps: s._id, edges: { $or: [{ source: s.key }, { target: s.key }] } } });
  res.json({ ok: true });
}));

// ---- Analysis ----
async function runAnalysis(processId) {
  const p = await loadProcess(processId);
  if (!p) return null;
  const result = analyzeProcess(p);
  return ProcessAnalysis.findOneAndUpdate({ process: processId }, { process: processId, ...result }, { upsert: true, new: true, setDefaultsOnInsert: true });
}
router.get('/analysis', wrap(async (req, res) => {
  const ids = (await Process.find({ business: req.user.business }).select('_id')).map((p) => p._id);
  res.json(await ProcessAnalysis.find({ process: { $in: ids } }).populate('process', 'name version'));
}));
router.get('/analysis/process/:id', wrap(async (req, res) => {
  // Always recompute so the result reflects the latest edits.
  const a = await runAnalysis(req.params.id);
  a ? res.json(a) : notFound(res);
}));
router.post('/analysis/process/:id', wrap(async (req, res) => { const a = await runAnalysis(req.params.id); a ? res.status(201).json(a) : notFound(res); }));
router.put('/analysis/:id', wrap(async (req, res) => { const a = await ProcessAnalysis.findByIdAndUpdate(req.params.id, { notes: req.body.notes }, { new: true }); a ? res.json(a) : notFound(res); }));
router.delete('/analysis/:id', wrap(async (req, res) => { await ProcessAnalysis.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));

// ---- Dashboard ----
router.get('/dashboard', wrap(async (req, res) => {
  const list = await loadAllProcesses({ business: req.user.business });
  const rows = list.map((p) => ({ p, a: analyzeProcess(p) }));
  const asIs = rows.filter((r) => r.p.version === 'as-is');
  const sum = (f) => rows.reduce((t, r) => t + f(r), 0);
  const scored = rows.filter((r) => r.a.metrics.steps);
  const departments = {};
  list.forEach((p) => { const d = p.department || 'Unassigned'; departments[d] = (departments[d] || 0) + 1; });
  const issues = rows.flatMap((r) => r.a.findings.filter((f) => f.severity === 'high').map((f) => ({ ...f, process: r.p.name, processId: r.p._id })));
  res.json({
    totals: {
      processes: list.length, asIs: asIs.length, toBe: list.length - asIs.length,
      avgScore: scored.length ? Math.round(scored.reduce((t, r) => t + r.a.score, 0) / scored.length) : 0,
      manualTasks: sum((r) => r.a.metrics.manualTasks), bottlenecks: sum((r) => r.a.metrics.bottlenecks),
      handoffs: sum((r) => r.a.metrics.handoffs),
      // minutes of work done by hand vs. by a system, across all AS-IS processes
      manualMinutes: asIs.reduce((t, r) => t + r.p.steps.filter((s) => s.type === 'task' && s.isManual).reduce((m, s) => m + (s.estimatedTime || 0), 0), 0),
      autoMinutes: asIs.reduce((t, r) => t + r.p.steps.filter((s) => s.type === 'task' && !s.isManual).reduce((m, s) => m + (s.estimatedTime || 0), 0), 0),
    },
    scores: rows.map((r) => ({ id: r.p._id, name: r.p.name, version: r.p.version, score: r.a.score })),
    departments: Object.entries(departments).map(([name, value]) => ({ name, value })),
    issues: issues.slice(0, 6),
    recent: rows.slice(0, 5).map((r) => ({ _id: r.p._id, name: r.p.name, department: r.p.department, status: r.p.status, version: r.p.version, score: r.a.score, updatedAt: r.p.updatedAt, steps: r.p.steps.map(({ key, name, role, type, isManual, estimatedTime, order }) => ({ key, name, role, type, isManual, estimatedTime, order })) })),
  });
}));

export default router;
