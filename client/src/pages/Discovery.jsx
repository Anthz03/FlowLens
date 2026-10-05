import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Wand2, Check } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHeader, Card, Button, Field, TextInput, TextArea, DataTable, Toggle, ErrorBox } from '../components/ui.jsx';
import { newStep, uid } from '../lib/constants.js';

const EXAMPLE = `Customer sends an order by email or WhatsApp
Sales Rep: enters the order into an Excel sheet
Warehouse Clerk: checks stock availability
Is the item in stock?
Purchasing Officer: calls the supplier to restock
Sales Manager: approves the order by email
Warehouse Clerk: packs the items
Accountant: issues the invoice in QuickBooks`;

const TOOLS = ['Excel', 'Email', 'WhatsApp', 'Messenger', 'Phone', 'QuickBooks', 'Paper', 'Word', 'Google Sheets', 'Slack', 'ERP', 'CRM'];
const AUTO_WORDS = /\b(automatic|automatically|system sends|auto-|workflow|integration|erp|crm|portal|app)\b/i;

// Turns informal, one-step-per-line text into structured steps using simple heuristics.
export function parseSteps(text) {
  const lines = text.split('\n').map((l) => l.replace(/^\s*(\d+[.)]|[-*•])\s*/, '').trim()).filter(Boolean);
  return lines.map((line) => {
    const m = line.match(/^([A-Z][\w &/]{1,30}?)\s*[:\-–]\s+(.+)$/);
    const role = m ? m[1].trim() : '';
    const action = (m ? m[2] : line).trim();
    const decision = /\?\s*$/.test(action) || /^(if|whether)\b/i.test(action);
    const tool = TOOLS.find((t) => new RegExp(`\\b${t}\\b`, 'i').test(action)) || '';
    const name = action.charAt(0).toUpperCase() + action.slice(1).replace(/[.?]$/, '');
    return newStep({ name, role, tool, type: decision ? 'decision' : 'task', isManual: !AUTO_WORDS.test(action), estimatedTime: decision ? 2 : 15, description: '' });
  });
}

export default function Discovery() {
  const nav = useNavigate();
  const [stage, setStage] = useState(1);
  const [info, setInfo] = useState({ name: '', department: '', trigger: '', result: '' });
  const [text, setText] = useState('');
  const [steps, setSteps] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const parse = () => {
    const parsed = parseSteps(text);
    if (!parsed.length) return setError('Describe at least one step.');
    setError(''); setSteps(parsed); setStage(3);
  };
  const upd = (key, patch) => setSteps(steps.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  const save = async () => {
    setSaving(true);
    try {
      const all = [
        newStep({ type: 'start', name: info.trigger || 'Process starts', isManual: false, estimatedTime: 0 }),
        ...steps,
        newStep({ type: 'end', name: info.result || 'Process complete', isManual: false, estimatedTime: 0 }),
      ];
      const edges = all.slice(1).map((s, i) => ({ key: uid(), source: all[i].key, target: s.key, label: '' }));
      const p = await api.createProcess({ name: info.name, department: info.department, status: 'draft', description: `Discovered process. Starts with: ${info.trigger || 'n/a'}. Ends with: ${info.result || 'n/a'}.`, steps: all, edges });
      nav(`/processes/${p._id}/map`);
    } catch (e) { setError(e.message); setSaving(false); }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Process Discovery" subtitle="Not documented yet? Describe how work really happens in plain words and we will turn it into a process." />
      <ol className="mb-6 flex items-center gap-2 text-sm">
        {['About the process', 'Describe the steps', 'Review & create'].map((l, i) => (
          <li key={l} className={`flex items-center gap-2 rounded-full px-3 py-1 ${stage === i + 1 ? 'bg-brand-600 text-white' : stage > i + 1 ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {stage > i + 1 ? <Check size={14} /> : <span className="font-semibold">{i + 1}</span>}<span className="hidden sm:inline">{l}</span>
          </li>
        ))}
      </ol>
      <ErrorBox error={error} />

      {stage === 1 && (
        <Card title="Tell us about the process">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="What do you call this process? *" className="sm:col-span-2"><TextInput value={info.name} onChange={(e) => setInfo({ ...info, name: e.target.value })} placeholder="e.g. Customer Order Fulfillment" /></Field>
            <Field label="Which department owns it?"><TextInput value={info.department} onChange={(e) => setInfo({ ...info, department: e.target.value })} placeholder="e.g. Sales" /></Field>
            <div />
            <Field label="What triggers it?" hint="The event that starts the process"><TextInput value={info.trigger} onChange={(e) => setInfo({ ...info, trigger: e.target.value })} placeholder="e.g. Customer places an order" /></Field>
            <Field label="What is the end result?"><TextInput value={info.result} onChange={(e) => setInfo({ ...info, result: e.target.value })} placeholder="e.g. Order delivered and invoiced" /></Field>
          </div>
          <div className="mt-5 flex justify-end"><Button disabled={!info.name.trim()} onClick={() => setStage(2)}>Next</Button></div>
        </Card>
      )}

      {stage === 2 && (
        <Card title="Describe what happens, one step per line">
          <p className="mb-3 text-sm text-slate-500">Write it the way you would explain it to a new employee. Start a line with <b>Role:</b> to say who does it, and end a line with <b>?</b> for a decision. We will detect tools such as Excel, Email or QuickBooks automatically.</p>
          <TextArea rows={10} value={text} onChange={(e) => setText(e.target.value)} placeholder={EXAMPLE} aria-label="Process description" />
          <div className="mt-4 flex flex-wrap justify-between gap-2">
            <Button variant="ghost" onClick={() => setText(EXAMPLE)}>Use an example</Button>
            <div className="flex gap-2"><Button variant="secondary" onClick={() => setStage(1)}>Back</Button><Button onClick={parse}><Wand2 size={16} />Build steps</Button></div>
          </div>
        </Card>
      )}

      {stage === 3 && (
        <Card title={`Review the ${steps.length} discovered steps`}>
          <p className="mb-3 text-sm text-slate-500">Check what we understood. Fix roles, tools and times now, or refine everything later on the Process Map.</p>
          <DataTable rows={steps} columns={[
            { header: 'Step', render: (s) => <input className="w-full min-w-48 rounded border border-slate-200 px-2 py-1 text-sm" value={s.name} onChange={(e) => upd(s.key, { name: e.target.value })} aria-label="Step name" />, className: 'min-w-48' },
            { header: 'Type', render: (s) => <span className="text-xs text-slate-500">{s.type}</span> },
            { header: 'Role', render: (s) => <input className="w-32 rounded border border-slate-200 px-2 py-1 text-sm" value={s.role} placeholder="Unassigned" onChange={(e) => upd(s.key, { role: e.target.value })} aria-label="Role" /> },
            { header: 'Tool', render: (s) => <input className="w-28 rounded border border-slate-200 px-2 py-1 text-sm" value={s.tool} onChange={(e) => upd(s.key, { tool: e.target.value })} aria-label="Tool" /> },
            { header: 'Min', render: (s) => <input type="number" min="0" className="w-16 rounded border border-slate-200 px-2 py-1 text-sm" value={s.estimatedTime} onChange={(e) => upd(s.key, { estimatedTime: Number(e.target.value) })} aria-label="Minutes" /> },
            { header: 'Manual', render: (s) => <Toggle checked={s.isManual} onChange={(v) => upd(s.key, { isManual: v })} label="" /> },
          ]} />
          <div className="mt-5 flex justify-between">
            <Button variant="secondary" onClick={() => setStage(2)}>Back</Button>
            <Button disabled={saving} onClick={save}><Compass size={16} />{saving ? 'Creating…' : 'Create process & open map'}</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
