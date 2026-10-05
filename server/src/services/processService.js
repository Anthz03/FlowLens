import { randomUUID } from 'node:crypto';
import { Process, ProcessStep, ProcessAnalysis } from '../models/index.js';

const STEP_FIELDS = ['key', 'name', 'description', 'role', 'department', 'type', 'tool', 'inputs', 'outputs', 'estimatedTime', 'isManual', 'position'];

export async function loadProcess(id) {
  const p = await Process.findById(id).populate('createdBy', 'name email').lean();
  if (!p) return null;
  p.steps = await ProcessStep.find({ process: id }).sort('order').lean();
  return p;
}

export async function loadAllProcesses(filter = {}) {
  const list = await Process.find(filter).sort('-updatedAt').populate('createdBy', 'name').lean();
  const steps = await ProcessStep.find({ process: { $in: list.map((p) => p._id) } }).sort('order').lean();
  const grouped = {};
  steps.forEach((s) => (grouped[s.process] ||= []).push(s));
  list.forEach((p) => (p.steps = grouped[p._id] || []));
  return list;
}

// Replace all steps of a process with the given list; keeps Process.steps in sync.
export async function replaceSteps(processId, steps = [], edges) {
  await ProcessStep.deleteMany({ process: processId });
  const docs = steps.map((s, i) => {
    const d = { process: processId, order: i };
    STEP_FIELDS.forEach((f) => { if (s[f] !== undefined) d[f] = s[f]; });
    d.key ||= randomUUID().slice(0, 8);
    d.estimatedTime = Number(d.estimatedTime) || 0;
    if (d.type === 'start' || d.type === 'end' || d.type === 'decision') d.isManual = d.type === 'decision' ? !!d.isManual : false;
    if (!d.position || d.position.x == null) delete d.position;
    return d;
  });
  const created = await ProcessStep.insertMany(docs);
  const keys = new Set(created.map((s) => s.key));
  const update = { steps: created.map((s) => s._id) };
  if (edges) update.edges = edges.filter((e) => keys.has(e.source) && keys.has(e.target)).map((e) => ({ key: e.key || randomUUID().slice(0, 8), source: e.source, target: e.target, label: e.label || '' }));
  await Process.findByIdAndUpdate(processId, update);
}

export async function removeProcess(id) {
  await ProcessStep.deleteMany({ process: id });
  await ProcessAnalysis.deleteMany({ process: id });
  await Process.findByIdAndDelete(id);
}
