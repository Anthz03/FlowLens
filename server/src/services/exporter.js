import { analyzeProcess } from './analyzer.js';

// Spreadsheet programs run text that starts with = + - @ as a formula (CSV injection). Prefix such cells with an apostrophe.
export function csvCell(value) {
  let s = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

const STEP_COLUMNS = ['order', 'name', 'type', 'role', 'department', 'tool', 'estimatedTime', 'isManual', 'inputs', 'outputs', 'description'];

export function toExportObject(processes, rules, business) {
  return {
    app: 'FlowLens',
    exportedAt: new Date().toISOString(),
    business: business?.name || '',
    processes: processes.map((p) => {
      const a = analyzeProcess(p, rules);
      return {
        name: p.name, description: p.description, department: p.department, status: p.status, version: p.version,
        healthScore: a.score, improvements: p.improvements || [],
        steps: [...p.steps].sort((x, y) => x.order - y.order).map((s) => ({ key: s.key, ...Object.fromEntries(STEP_COLUMNS.map((c) => [c, s[c]])) })),
        connections: (p.edges || []).map((e) => ({ from: e.source, to: e.target, label: e.label || '' })),
      };
    }),
  };
}

// One row per step, with the process details repeated, so it opens cleanly in Excel or Google Sheets.
export function toCsv(processes, rules) {
  const head = ['process', 'version', 'status', 'process_department', 'health_score', 'step_no', 'step', 'type', 'role', 'step_department', 'tool', 'minutes', 'manual', 'inputs', 'outputs', 'description'];
  const rows = [head];
  for (const p of processes) {
    const score = analyzeProcess(p, rules).score;
    for (const s of [...p.steps].sort((a, b) => a.order - b.order)) {
      rows.push([p.name, p.version, p.status, p.department, score, s.order + 1, s.name, s.type, s.role, s.department, s.tool, s.estimatedTime, s.type === 'task' ? (s.isManual ? 'yes' : 'no') : '', s.inputs, s.outputs, s.description]);
    }
  }
  return `﻿${rows.map((r) => r.map(csvCell).join(',')).join('\r\n')}\r\n`; // BOM so Excel reads UTF-8
}
