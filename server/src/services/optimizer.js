import { computeMetrics, similar, DEFAULT_RULES } from './analyzer.js';

// Generates an improved TO-BE copy of a process using simple rules. Returns { steps, edges, improvements }.
const AUTOMATABLE = /(send|notify|email|e-mail|enter|input|record|log|update|copy|transfer|forward|generate|print|file|sync|remind|calculate|invoice)/i;

export function optimizeProcess(process, rules = DEFAULT_RULES) {
  const m = computeMetrics(process, rules);
  const steps = m.steps.map((s) => ({ ...s }));
  let edges = m.edges.map((e) => ({ ...e }));
  const improvements = [];

  // 1. Merge duplicates: drop the later step and rewire its edges to the kept one
  const removed = new Set();
  for (let i = 0; i < steps.length; i++) {
    if (removed.has(steps[i].key) || steps[i].type !== 'task') continue;
    for (let j = i + 1; j < steps.length; j++) {
      if (removed.has(steps[j].key) || steps[j].type !== 'task' || !similar(steps[i].name, steps[j].name, rules.duplicateSimilarity)) continue;
      removed.add(steps[j].key);
      // bypass the removed step: connect its predecessors straight to its successors
      const rk = steps[j].key;
      const ins = edges.filter((e) => e.target === rk), outs = edges.filter((e) => e.source === rk);
      edges = edges.filter((e) => e.target !== rk && e.source !== rk);
      ins.forEach((a) => outs.forEach((b) => edges.push({ key: `${a.source}-${b.target}`, source: a.source, target: b.target, label: a.label || b.label })));
      improvements.push(`Merged duplicate step "${steps[j].name}" into "${steps[i].name}".`);
    }
  }
  edges = edges.filter((e, i) => e.source !== e.target && edges.findIndex((x) => x.source === e.source && x.target === e.target) === i);
  let result = steps.filter((s) => !removed.has(s.key));

  // 2. Automate repeatable manual tasks; shorten bottlenecks
  result = result.map((s) => {
    const o = { ...s };
    if (o.type === 'task' && o.isManual && AUTOMATABLE.test(`${o.name} ${o.description}`)) {
      o.isManual = false;
      o.tool = o.tool || 'Workflow Automation';
      o.estimatedTime = Math.max(1, Math.round(o.estimatedTime * 0.4));
      improvements.push(`Automated "${o.name}" (${s.estimatedTime} → ${o.estimatedTime} min).`);
    } else if (m.bottlenecks.some((b) => b.key === o.key)) {
      o.estimatedTime = Math.round(o.estimatedTime * 0.7);
      improvements.push(`Streamlined bottleneck "${o.name}" with templates/checklists (${s.estimatedTime} → ${o.estimatedTime} min).`);
    }
    return o;
  });

  // 3. Remove handoffs: a task sandwiched between two steps owned by the same role adopts that role
  const byKey = Object.fromEntries(result.map((s) => [s.key, s]));
  for (const s of result) {
    if (s.type !== 'task') continue;
    const ins = edges.filter((e) => e.target === s.key), outs = edges.filter((e) => e.source === s.key);
    if (ins.length !== 1 || outs.length !== 1) continue;
    const up = byKey[ins[0].source], down = byKey[outs[0].target];
    if (up?.role && up.role === down?.role && s.role && s.role !== up.role) {
      improvements.push(`Reassigned "${s.name}" from ${s.role} to ${up.role} to remove two handoffs.`);
      s.role = up.role;
      s.department = up.department || s.department;
    }
  }

  // 4. Flag missing owners
  result.forEach((s) => {
    if (s.type === 'task' && !s.role) {
      s.role = 'Process Owner (assign)';
      improvements.push(`Flagged "${s.name}" for an explicit owner.`);
    }
  });

  if (!improvements.length) improvements.push('No automatic improvements found. Edit this TO-BE copy manually.');
  return { steps: result.map((s, i) => ({ ...s, order: i, position: undefined })), edges, improvements };
}
