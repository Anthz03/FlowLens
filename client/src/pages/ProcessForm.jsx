import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, Hand, Zap } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHeader, Card, Button, Field, TextInput, TextArea, Select, Modal, DataTable, Badge, Loading, ErrorBox } from '../components/ui.jsx';
import StepFields from '../components/StepFields.jsx';
import { DEPARTMENTS, STATUSES, newStep, uid } from '../lib/constants.js';

const seqEdges = (steps) => steps.slice(1).map((s, i) => ({ key: uid(), source: steps[i].key, target: s.key, label: '' }));
const isSequential = (steps, edges) => edges.length === Math.max(0, steps.length - 1) && steps.slice(1).every((s, i) => edges.some((e) => e.source === steps[i].key && e.target === s.key));

export default function ProcessForm() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', description: '', department: '', status: 'draft', version: 'as-is' });
  const [steps, setSteps] = useState([]);
  const [edges, setEdges] = useState([]);
  const [editing, setEditing] = useState(null); // step being edited in modal
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    api.process(id).then((p) => {
      const { steps, edges, name, description, department, status, version } = p;
      setForm({ name, description, department, status, version });
      setSteps(steps); setEdges(edges || []);
    }).catch((e) => setError(e.message)).finally(() => setLoading(false));
  }, [id]);

  const setF = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const saveStep = () => {
    if (!editing.step.name.trim()) return setError('Step name is required.');
    setError('');
    const s = editing.step;
    if (editing.isNew) {
      const last = steps[steps.length - 1];
      setSteps([...steps, s]);
      if (last && last.type !== 'end') setEdges([...edges, { key: uid(), source: last.key, target: s.key, label: '' }]);
    } else setSteps(steps.map((x) => (x.key === s.key ? s : x)));
    setEditing(null);
  };

  const removeStep = (s) => {
    const ins = edges.filter((e) => e.target === s.key), outs = edges.filter((e) => e.source === s.key);
    const rest = edges.filter((e) => e.target !== s.key && e.source !== s.key);
    ins.forEach((a) => outs.forEach((b) => rest.push({ key: uid(), source: a.source, target: b.target, label: a.label })));
    setSteps(steps.filter((x) => x.key !== s.key)); setEdges(rest);
  };

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= steps.length) return;
    const sequential = isSequential(steps, edges);
    const next = [...steps];
    [next[i], next[j]] = [next[j], next[i]];
    setSteps(next);
    if (sequential) setEdges(seqEdges(next));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Process name is required.');
    setSaving(true); setError('');
    try {
      const body = { ...form, steps, edges };
      const p = id ? await api.updateProcess(id, body) : await api.createProcess(body);
      nav(steps.length ? `/processes/${p._id}/map` : `/processes/${p._id}`);
    } catch (err) { setError(err.message); setSaving(false); }
  };

  if (loading) return <Loading />;
  return (
    <form onSubmit={submit}>
      <PageHeader title={id ? 'Edit Process' : 'Create Process'} subtitle="Describe the process, then add each step with who does it and how.">
        <Button variant="secondary" onClick={() => nav(-1)}>Cancel</Button>
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save & view map'}</Button>
      </PageHeader>
      <ErrorBox error={error} />

      <Card title="Process details" className="mb-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Process name *" className="sm:col-span-2"><TextInput value={form.name} onChange={setF('name')} placeholder="e.g. Customer Order Fulfillment" /></Field>
          <Field label="Description" className="sm:col-span-2"><TextArea value={form.description} onChange={setF('description')} placeholder="What is this process for, and when does it start and end?" /></Field>
          <Field label="Primary department"><TextInput list="process-depts" value={form.department} onChange={setF('department')} placeholder="e.g. Sales" />
            <datalist id="process-depts">{DEPARTMENTS.map((d) => <option key={d} value={d} />)}</datalist></Field>
          <Field label="Status"><Select options={STATUSES} value={form.status} onChange={setF('status')} /></Field>
        </div>
      </Card>

      <Card title={`Process steps (${steps.length})`} action={<div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={() => setEditing({ isNew: true, step: newStep({ type: 'start', name: 'Start', estimatedTime: 0, isManual: false }) })}>Add start</Button>
        <Button size="sm" onClick={() => setEditing({ isNew: true, step: newStep() })}><Plus size={14} />Add step</Button>
      </div>}>
        <DataTable rows={steps} empty="No steps yet. Add the first activity, or use Process Discovery to describe the process in plain words." columns={[
          { header: '#', render: (_, i) => i + 1, className: 'w-10 text-slate-400' },
          { header: 'Step', render: (s) => <div><span className="font-medium text-slate-900">{s.name}</span>{s.type !== 'task' && <Badge tone="brand"> {s.type}</Badge>}</div> },
          { header: 'Role', render: (s) => s.role || (s.type === 'task' || s.type === 'decision' ? <span className="text-red-500">Unassigned</span> : '') },
          { header: 'Department', field: 'department' },
          { header: 'Tool', field: 'tool' },
          { header: 'Time', render: (s) => (s.estimatedTime ? `${s.estimatedTime} min` : '') },
          { header: 'Mode', render: (s) => s.type === 'task' && (s.isManual ? <span className="flex items-center gap-1 text-amber-600"><Hand size={14} />Manual</span> : <span className="flex items-center gap-1 text-emerald-600"><Zap size={14} />Auto</span>) },
          { header: '', className: 'text-right whitespace-nowrap', render: (s, i) => (
            <div className="flex justify-end gap-0.5 text-slate-400">
              <button type="button" aria-label="Move up" onClick={() => move(i, -1)} className="rounded p-1 hover:bg-slate-100"><ArrowUp size={15} /></button>
              <button type="button" aria-label="Move down" onClick={() => move(i, 1)} className="rounded p-1 hover:bg-slate-100"><ArrowDown size={15} /></button>
              <button type="button" aria-label="Edit step" onClick={() => setEditing({ step: { ...s } })} className="rounded p-1 hover:bg-slate-100"><Pencil size={15} /></button>
              <button type="button" aria-label="Delete step" onClick={() => removeStep(s)} className="rounded p-1 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
            </div>) },
        ]} />
        <p className="mt-3 text-xs text-slate-400">Steps are connected in order. Add branches for decision points on the Process Map.</p>
      </Card>

      <Modal wide open={!!editing} onClose={() => setEditing(null)} title={editing?.isNew ? 'Add step' : 'Edit step'}
        footer={<><Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={saveStep}>{editing?.isNew ? 'Add step' : 'Save step'}</Button></>}>
        {editing && <StepFields step={editing.step} onChange={(step) => setEditing({ ...editing, step })} />}
      </Modal>
    </form>
  );
}
