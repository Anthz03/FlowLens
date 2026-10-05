import { Router } from 'express';
import { User, Business, Process, ProcessStep, ProcessAnalysis, AuditLog } from '../models/index.js';
import { hashPassword, requireRole, rank, temporaryPassword } from '../services/auth.js';
import { audit } from '../services/audit.js';
import { validate } from '../middleware/security.js';
import { loadProcess, loadAllProcesses, replaceSteps, removeProcess } from '../services/processService.js';
import { analyzeProcess } from '../services/analyzer.js';
import { optimizeProcess } from '../services/optimizer.js';
import {
  processCreateSchema, processUpdateSchema, processQuerySchema, duplicateSchema, stepSchema, stepUpdateSchema,
  analysisNotesSchema, userCreateSchema, userUpdateSchema, businessUpdateSchema,
} from '../validation/schemas.js';

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const notFound = (res) => res.status(404).json({ error: 'Not found' });
const forbidden = (res, message = 'You do not have permission to do that.') => res.status(403).json({ error: message });
const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));
const PROCESS_FIELDS = ['name', 'description', 'department', 'status', 'version', 'improvements'];
const STEP_FIELDS = ['key', 'name', 'description', 'role', 'department', 'type', 'tool', 'inputs', 'outputs', 'estimatedTime', 'isManual', 'position'];
const MAX_STEPS_PER_PROCESS = 300;

// Every route here runs after requireAuth, so req.user is always set.
export default function routes(limit) {
  const router = Router();

  // Reject malformed ids before they reach the database
  router.param('id', (_req, res, next, id) => (/^[a-f\d]{24}$/i.test(id) ? next() : res.status(400).json({ error: 'Invalid id.' })));

  // ---------- Tenant isolation: a record must belong to the signed-in user's business ----------
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
  const ownAnalysis = wrap(async (req, res, next) => {
    const a = await ProcessAnalysis.findById(req.params.id).select('process');
    const p = a && (await Process.findById(a.process).select('business'));
    return sameBiz(req, p) ? next() : notFound(res);
  });
  router.use('/processes/:id', ownProcess);
  router.use('/analysis/process/:id', ownProcess);
  router.use('/steps/:id', ownStep);
  router.put('/analysis/:id', ownAnalysis);
  router.delete('/analysis/:id', ownAnalysis);

  // A process may only point at a "base" process of the same business
  const baseIsOwn = async (req, baseProcess) => !baseProcess || sameBiz(req, await Process.findById(baseProcess).select('business'));

  // ---------- Business ----------
  router.get('/businesses', wrap(async (req, res) => res.json(await Business.find({ _id: req.user.business }))));
  router.put('/businesses/:id', requireRole('admin'), validate(businessUpdateSchema), wrap(async (req, res) => {
    if (String(req.user.business) !== req.params.id) return notFound(res);
    res.json(await Business.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }));
  }));

  // ---------- Team ----------
  router.get('/users', wrap(async (req, res) => res.json(await User.find({ business: req.user.business }).sort('name'))));

  router.post('/users', requireRole('admin'), validate(userCreateSchema), wrap(async (req, res) => {
    const { name, email, role, permission } = req.body;
    if (rank(permission) >= rank(req.user.permission)) return forbidden(res, 'You can only add people with a lower role than yours.');
    if (await User.exists({ email })) return res.status(409).json({ error: 'An account with this email already exists.' });
    const password = temporaryPassword();
    const user = await User.create({ name, email, role, permission, passwordHash: await hashPassword(password), business: req.user.business });
    await audit(req, 'user_created', { user: req.user, meta: { target: String(user._id), permission } });
    // The temporary password is shown once, here. Ask the person to change it after signing in.
    res.status(201).json({ user, temporaryPassword: password });
  }));

  router.put('/users/:id', requireRole('admin'), validate(userUpdateSchema), wrap(async (req, res) => {
    const target = await User.findOne({ _id: req.params.id, business: req.user.business });
    if (!target) return notFound(res);
    const self = String(target._id) === String(req.user._id);
    if (!self && rank(target.permission) >= rank(req.user.permission)) return forbidden(res, 'You cannot change someone with the same or a higher role.');
    if (req.body.permission !== undefined && req.body.permission !== target.permission) {
      if (req.user.permission !== 'owner') return forbidden(res, 'Only an owner can change roles.');
      if (target.permission === 'owner' && (await User.countDocuments({ business: req.user.business, permission: 'owner' })) <= 1) {
        return res.status(400).json({ error: 'A business must keep at least one owner.' });
      }
    }
    const changedRole = req.body.permission !== undefined && req.body.permission !== target.permission;
    Object.assign(target, req.body);
    if (changedRole) target.tokenVersion = (target.tokenVersion || 0) + 1; // re-issue sessions so the new role applies immediately
    await target.save();
    if (changedRole) await audit(req, 'permission_changed', { user: req.user, meta: { target: String(target._id), permission: target.permission } });
    res.json(target);
  }));

  router.delete('/users/:id', requireRole('admin'), wrap(async (req, res) => {
    if (String(req.user._id) === req.params.id) return res.status(400).json({ error: 'You cannot delete your own account.' });
    const target = await User.findOne({ _id: req.params.id, business: req.user.business });
    if (!target) return notFound(res);
    const equalOwners = target.permission === 'owner' && req.user.permission === 'owner'; // owners may remove another owner
    if (!equalOwners && rank(target.permission) >= rank(req.user.permission)) return forbidden(res, 'You cannot remove someone with the same or a higher role.');
    await target.deleteOne();
    await audit(req, 'user_deleted', { user: req.user, meta: { target: String(target._id) } });
    res.json({ ok: true });
  }));

  // ---------- Processes ----------
  router.get('/processes', validate(processQuerySchema, 'query'), wrap(async (req, res) => {
    const filter = { business: req.user.business, ...req.validatedQuery };
    const list = await loadAllProcesses(filter);
    res.json(list.map((p) => ({ ...p, analysis: (({ score, metrics }) => ({ score, metrics }))(analyzeProcess(p)) })));
  }));

  router.get('/processes/:id', wrap(async (req, res) => {
    const p = await loadProcess(req.params.id);
    if (!p) return notFound(res);
    p.toBeVersions = await Process.find({ baseProcess: p._id, business: req.user.business }).select('name version status').lean();
    res.json(p);
  }));

  router.post('/processes', validate(processCreateSchema), wrap(async (req, res) => {
    const { steps, edges, baseProcess } = req.body;
    if (!(await baseIsOwn(req, baseProcess))) return res.status(400).json({ error: 'baseProcess: Invalid process.' });
    const p = await Process.create({ ...pick(req.body, PROCESS_FIELDS), baseProcess: baseProcess || null, createdBy: req.user._id, business: req.user.business });
    await replaceSteps(p._id, steps, edges);
    res.status(201).json(await loadProcess(p._id));
  }));

  router.put('/processes/:id', validate(processUpdateSchema), wrap(async (req, res) => {
    const { steps, edges, baseProcess } = req.body;
    if (baseProcess !== undefined && !(await baseIsOwn(req, baseProcess))) return res.status(400).json({ error: 'baseProcess: Invalid process.' });
    const data = pick(req.body, PROCESS_FIELDS);
    if (baseProcess !== undefined) data.baseProcess = baseProcess || null;
    const p = await Process.findByIdAndUpdate(req.params.id, data, { new: true, runValidators: true });
    if (!p) return notFound(res);
    if (steps) await replaceSteps(p._id, steps, edges ?? p.edges.map((e) => e.toObject()));
    else if (edges) await Process.findByIdAndUpdate(p._id, { edges });
    res.json(await loadProcess(p._id));
  }));

  router.delete('/processes/:id', requireRole('admin'), wrap(async (req, res) => {
    const p = await Process.findById(req.params.id).select('name');
    await removeProcess(req.params.id);
    await audit(req, 'process_deleted', { user: req.user, meta: { process: String(req.params.id), name: p?.name } });
    res.json({ ok: true });
  }));

  // Duplicate as TO-BE; { optimize: true } applies rule-based improvements
  router.post('/processes/:id/duplicate', limit.heavy, validate(duplicateSchema), wrap(async (req, res) => {
    const src = await loadProcess(req.params.id);
    if (!src) return notFound(res);
    const { optimize = false, version = 'to-be' } = req.body;
    let { steps, edges } = src;
    let improvements = [];
    if (optimize) ({ steps, edges, improvements } = optimizeProcess(src));
    const copy = await Process.create({
      name: `${src.name} (${version === 'to-be' ? 'TO-BE' : 'Copy'})`.slice(0, 200), description: src.description, department: src.department,
      status: 'draft', version, baseProcess: version === 'to-be' ? src._id : null, improvements,
      business: req.user.business, createdBy: req.user._id,
    });
    await replaceSteps(copy._id, steps.map((s) => ({ ...s, position: optimize ? undefined : s.position })), edges);
    res.status(201).json(await loadProcess(copy._id));
  }));

  // ---------- Process steps ----------
  router.get('/processes/:id/steps', wrap(async (req, res) => res.json(await ProcessStep.find({ process: req.params.id }).sort('order'))));
  router.post('/processes/:id/steps', validate(stepSchema), wrap(async (req, res) => {
    const count = await ProcessStep.countDocuments({ process: req.params.id });
    if (count >= MAX_STEPS_PER_PROCESS) return res.status(400).json({ error: `A process can have at most ${MAX_STEPS_PER_PROCESS} steps.` });
    const key = req.body.key || Math.random().toString(36).slice(2, 10);
    const step = await ProcessStep.create({ ...pick(req.body, STEP_FIELDS), key, process: req.params.id, order: count });
    await Process.findByIdAndUpdate(req.params.id, { $push: { steps: step._id } });
    res.status(201).json(step);
  }));
  router.get('/steps/:id', wrap(async (req, res) => { const s = await ProcessStep.findById(req.params.id); s ? res.json(s) : notFound(res); }));
  router.put('/steps/:id', validate(stepUpdateSchema), wrap(async (req, res) => {
    // Only whitelisted fields: a step can never be moved to a different process through this endpoint
    const s = await ProcessStep.findByIdAndUpdate(req.params.id, pick(req.body, STEP_FIELDS.filter((f) => f !== 'key')), { new: true, runValidators: true });
    s ? res.json(s) : notFound(res);
  }));
  router.delete('/steps/:id', wrap(async (req, res) => {
    const s = await ProcessStep.findByIdAndDelete(req.params.id);
    if (!s) return notFound(res);
    await Process.findByIdAndUpdate(s.process, { $pull: { steps: s._id, edges: { $or: [{ source: s.key }, { target: s.key }] } } });
    res.json({ ok: true });
  }));

  // ---------- Analysis ----------
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
  router.get('/analysis/process/:id', limit.heavy, wrap(async (req, res) => {
    // Always recompute so the result reflects the latest edits.
    const a = await runAnalysis(req.params.id);
    a ? res.json(a) : notFound(res);
  }));
  router.post('/analysis/process/:id', limit.heavy, wrap(async (req, res) => { const a = await runAnalysis(req.params.id); a ? res.status(201).json(a) : notFound(res); }));
  router.put('/analysis/:id', validate(analysisNotesSchema), wrap(async (req, res) => {
    const a = await ProcessAnalysis.findByIdAndUpdate(req.params.id, { notes: req.body.notes }, { new: true });
    a ? res.json(a) : notFound(res);
  }));
  router.delete('/analysis/:id', requireRole('admin'), wrap(async (req, res) => { await ProcessAnalysis.findByIdAndDelete(req.params.id); res.json({ ok: true }); }));

  // ---------- Security log (owners and admins) ----------
  router.get('/audit', requireRole('admin'), wrap(async (req, res) => {
    res.json(await AuditLog.find({ business: req.user.business }).sort('-createdAt').limit(100).populate('user', 'name email').lean());
  }));

  // ---------- Dashboard ----------
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

  return router;
}
