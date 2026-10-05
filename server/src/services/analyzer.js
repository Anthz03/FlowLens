// Rule-based process analysis. Pure functions: input is a plain process object with steps[] and edges[].
const STOP = new Set(['the', 'and', 'for', 'with', 'from', 'into', 'new', 'step']);
const words = (s = '') => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));

// Thresholds an owner can tune in Settings. The defaults are the original built-in values.
export const DEFAULT_RULES = {
  bottleneckMinutes: 45,    // a step this long (or longer) is a possible bottleneck
  slowFactor: 2,            // ...or one at least 20 min that is this many times the process average
  maxHandoffs: 3,           // more handoffs than this is "excessive"
  duplicateSimilarity: 0.6, // how alike two step names must be to be flagged as duplicates (0.5 - 1)
  longProcessSteps: 12,     // more activities than this is a long process
  maxDecisions: 3,          // more decision points than this is flagged as complex
};

export function similar(a, b, threshold = DEFAULT_RULES.duplicateSimilarity) {
  const A = new Set(words(a)), B = new Set(words(b));
  if (!A.size || !B.size) return false;
  const inter = [...A].filter((w) => B.has(w)).length;
  return inter / new Set([...A, ...B]).size >= threshold;
}

const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));
const same = (a, b) => (a || '').trim().toLowerCase() === (b || '').trim().toLowerCase();

export function effectiveEdges(steps, edges = []) {
  if (edges.length) return edges;
  const ordered = [...steps].sort((a, b) => a.order - b.order);
  return ordered.slice(1).map((s, i) => ({ source: ordered[i].key, target: s.key, label: '' }));
}

export function computeMetrics(process, rules = DEFAULT_RULES) {
  const steps = [...(process.steps || [])].sort((a, b) => a.order - b.order);
  const work = steps.filter((s) => s.type === 'task' || s.type === 'decision');
  const edges = effectiveEdges(steps, process.edges);
  const byKey = Object.fromEntries(steps.map((s) => [s.key, s]));
  const handoffEdges = edges.filter((e) => {
    const a = byKey[e.source], b = byKey[e.target];
    return a && b && a.role && b.role && !same(a.role, b.role);
  });
  const avgTime = work.length ? work.reduce((t, s) => t + (s.estimatedTime || 0), 0) / work.length : 0;
  const bottlenecks = work.filter((s) => s.estimatedTime >= rules.bottleneckMinutes || (s.estimatedTime >= 20 && s.estimatedTime > avgTime * rules.slowFactor));
  const duplicates = [];
  for (let i = 0; i < work.length; i++)
    for (let j = i + 1; j < work.length; j++)
      if (similar(work[i].name, work[j].name, rules.duplicateSimilarity)) duplicates.push([work[i], work[j]]);
  return {
    steps, edges, byKey, work, handoffEdges, bottlenecks, duplicates, avgTime,
    stepCount: steps.length,
    taskCount: work.length,
    manualCount: work.filter((s) => s.type === 'task' && s.isManual).length,
    decisionCount: steps.filter((s) => s.type === 'decision').length,
    handoffs: handoffEdges.length,
    totalTime: steps.reduce((t, s) => t + (s.estimatedTime || 0), 0),
    roles: [...new Set(steps.map((s) => s.role).filter(Boolean))],
    departments: [...new Set(steps.map((s) => s.department).filter(Boolean))],
    tools: [...new Set(steps.map((s) => s.tool).filter(Boolean))],
  };
}

export function analyzeProcess(process, rules = DEFAULT_RULES) {
  const m = computeMetrics(process, rules);
  const n = m.work.length || 1;
  const findings = [];
  const add = (type, severity, title, detail, steps = []) => findings.push({ type, severity, title, detail, steps });

  const manual = m.work.filter((s) => s.type === 'task' && s.isManual);
  manual.forEach((s) => add('manual', 'medium', `Manual task: ${s.name}`, `Performed by hand${s.tool ? ` (using ${s.tool})` : ' with no supporting tool'}. Consider automating or digitizing it.`, [s.name]));
  m.bottlenecks.forEach((s) => add('bottleneck', 'high', `Possible bottleneck: ${s.name}`, `Takes ${s.estimatedTime} min, well above the process average of ${Math.round(m.avgTime)} min.`, [s.name]));
  m.duplicates.forEach(([a, b]) => add('duplicate', 'medium', 'Possible duplicate steps', `"${a.name}" and "${b.name}" look very similar. Can they be merged?`, [a.name, b.name]));
  m.handoffEdges.forEach((e) => {
    const a = m.byKey[e.source], b = m.byKey[e.target];
    add('handoff', m.handoffs > 3 ? 'medium' : 'low', `Handoff: ${a.role} → ${b.role}`, `Work passes from "${a.name}" to "${b.name}".`, [a.name, b.name]);
  });
  if (m.handoffs > rules.maxHandoffs || (m.edges.length && m.handoffs / m.edges.length > 0.5))
    add('handoff', 'high', 'Excessive handoffs', `${m.handoffs} handoffs across ${m.edges.length} connections. Each handoff adds waiting time and risk of miscommunication.`);
  const unclear = m.work.filter((s) => !s.role);
  unclear.forEach((s) => add('responsibility', 'high', `Unclear responsibility: ${s.name}`, 'No employee or role is assigned to this step.', [s.name]));
  m.work.filter((s) => s.role && !s.department).forEach((s) => add('responsibility', 'low', `No department: ${s.name}`, 'Assign a department to clarify ownership.', [s.name]));
  m.work.filter((s) => !s.description).forEach((s) => add('documentation', 'low', `Undocumented step: ${s.name}`, 'Add a description so others can follow this step.', [s.name]));
  if (m.taskCount > rules.longProcessSteps) add('complexity', 'medium', 'Long process', `${m.taskCount} activities. Consider splitting into sub-processes or removing unnecessary steps.`);
  if (m.decisionCount > rules.maxDecisions) add('complexity', 'medium', 'Many decision points', `${m.decisionCount} decisions make this flow hard to follow and test.`);

  // Category scores (0-100)
  const doc = m.work.reduce((t, s) => t + [s.description, s.tool, s.inputs, s.outputs].filter(Boolean).length / 4, 0) / n * 100;
  const tasks = m.work.filter((s) => s.type === 'task');
  const automation = tasks.length ? (1 - m.manualCount / tasks.length) * 100 : 0;
  const roleClarity = m.work.reduce((t, s) => t + (s.role ? 0.7 : 0) + (s.department ? 0.3 : 0), 0) / n * 100;
  const complexity = 100 - Math.max(0, m.taskCount - 8) * 5 - Math.max(0, m.decisionCount - 2) * 6 - (m.edges.length ? (m.handoffs / m.edges.length) * 25 : 0);
  const efficiency = 100 - m.bottlenecks.length * 12 - m.duplicates.length * 10 - Math.max(0, m.handoffs - 2) * 6 - Math.min(25, Math.max(0, m.totalTime - 120) / 10);
  const categories = {
    Documentation: clamp(doc), Automation: clamp(automation), 'Role Clarity': clamp(roleClarity),
    'Process Complexity': clamp(complexity), Efficiency: clamp(efficiency),
  };
  const score = m.steps.length ? clamp(Object.values(categories).reduce((a, b) => a + b, 0) / 5) : 0;

  const recommendations = [];
  if (manual.length) recommendations.push(`Automate or digitize the ${manual.length} manual task(s), starting with the longest ones.`);
  if (m.bottlenecks.length) recommendations.push(`Break down or parallelize: ${m.bottlenecks.map((s) => s.name).join(', ')}.`);
  if (m.duplicates.length) recommendations.push('Merge duplicate steps to remove rework.');
  if (m.handoffs > rules.maxHandoffs) recommendations.push('Reduce handoffs by consolidating consecutive steps under one role.');
  if (unclear.length) recommendations.push('Assign an owner (role or employee) to every step.');
  if (categories.Documentation < 60) recommendations.push('Improve documentation: add descriptions, tools, inputs and outputs.');
  if (!recommendations.length) recommendations.push('This process looks healthy. Review it periodically.');

  const metrics = {
    steps: m.stepCount, tasks: m.taskCount, manualTasks: m.manualCount, decisions: m.decisionCount, handoffs: m.handoffs,
    bottlenecks: m.bottlenecks.length, duplicates: m.duplicates.length, unclearResponsibilities: unclear.length,
    estimatedTime: m.totalTime, roles: m.roles, departments: m.departments, tools: m.tools,
  };
  return { score, categories, metrics, findings, recommendations };
}
