import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Workflow, Activity, Pencil, Copy, Trash2, GitCompare, Hand, Zap } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHeader, Card, Button, Loading, ErrorBox, Badge, DataTable, ScoreRing, ConfirmModal, statusTone } from '../components/ui.jsx';
import ProcessStrip, { StripLegend } from '../components/ProcessStrip.jsx';
import { fmtTime } from '../lib/constants.js';

const Chips = ({ items, empty = 'None' }) => (items.length ? <div className="flex flex-wrap gap-1.5">{items.map((i) => <Badge key={i}>{i}</Badge>)}</div> : <span className="text-sm text-slate-400">{empty}</span>);

export default function ProcessDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState(null);
  const [a, setA] = useState(null);
  const [error, setError] = useState('');
  const [confirm, setConfirm] = useState(false);

  useEffect(() => { Promise.all([api.process(id), api.analysis(id)]).then(([pr, an]) => { setP(pr); setA(an); }).catch((e) => setError(e.message)); }, [id]);

  const toBe = async () => { try { const c = await api.duplicate(id, { optimize: false }); nav(`/processes/${c._id}/map`); } catch (e) { setError(e.message); } };
  const del = async () => { try { await api.deleteProcess(id); nav('/processes'); } catch (e) { setError(e.message); setConfirm(false); } };

  if (error && !p) return <ErrorBox error={error} />;
  if (!p || !a) return <Loading />;
  const m = a.metrics;

  return (
    <div>
      <PageHeader title={p.name} subtitle={p.description || 'No description yet.'}>
        <Button variant="secondary" to={`/processes/${id}/edit`}><Pencil size={16} />Edit</Button>
        <Button variant="secondary" to={`/processes/${id}/map`}><Workflow size={16} />Map</Button>
        <Button variant="secondary" to={`/processes/${id}/analysis`}><Activity size={16} />Analysis</Button>
        {p.version !== 'to-be' && <Button variant="secondary" onClick={toBe}><Copy size={16} />Duplicate as TO-BE</Button>}
        <Button variant="ghost" onClick={() => setConfirm(true)} aria-label="Delete process"><Trash2 size={16} className="text-red-500" /></Button>
      </PageHeader>
      <ErrorBox error={error} />

      <Card title="Process at a glance" className="mb-6">
        <ProcessStrip steps={p.steps} className="h-12 w-full" />
        <div className="mt-3"><StripLegend /></div>
      </Card>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card title="Overview" className="lg:col-span-2">
          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
            <div><dt className="text-slate-500">Type</dt><dd className="mt-1"><Badge tone={p.version === 'to-be' ? 'brand' : 'blue'}>{p.version === 'to-be' ? 'TO-BE' : 'AS-IS'}</Badge></dd></div>
            <div><dt className="text-slate-500">Status</dt><dd className="mt-1"><Badge tone={statusTone[p.status]}>{p.status}</Badge></dd></div>
            <div><dt className="text-slate-500">Department</dt><dd className="mt-1 font-medium">{p.department || '—'}</dd></div>
            <div><dt className="text-slate-500">Steps</dt><dd className="mt-1 font-medium">{m.steps}</dd></div>
            <div><dt className="text-slate-500">Estimated time</dt><dd className="mt-1 font-medium">{fmtTime(m.estimatedTime)}</dd></div>
            <div><dt className="text-slate-500">Created by</dt><dd className="mt-1 font-medium">{p.createdBy?.name || '—'}</dd></div>
            <div className="col-span-2 sm:col-span-3"><dt className="mb-1 text-slate-500">Roles involved</dt><dd><Chips items={m.roles} /></dd></div>
            <div className="col-span-2 sm:col-span-3"><dt className="mb-1 text-slate-500">Departments involved</dt><dd><Chips items={m.departments} /></dd></div>
            <div className="col-span-2 sm:col-span-3"><dt className="mb-1 text-slate-500">Tools & systems</dt><dd><Chips items={m.tools} /></dd></div>
          </dl>
          {p.toBeVersions?.length > 0 && (
            <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4 text-sm">
              <GitCompare size={16} className="text-brand-600" />TO-BE versions:
              {p.toBeVersions.map((t) => <Link key={t._id} className="font-medium text-brand-600 hover:underline" to={`/compare?asis=${id}&tobe=${t._id}`}>{t.name}</Link>)}
            </div>
          )}
          {p.baseProcess && <div className="mt-5 border-t border-slate-100 pt-4 text-sm"><Link className="font-medium text-brand-600 hover:underline" to={`/compare?asis=${p.baseProcess}&tobe=${id}`}>Compare with its AS-IS process →</Link></div>}
        </Card>
        <Card title="Health score"><div className="flex justify-center"><ScoreRing score={a.score} /></div>
          <Link to={`/processes/${id}/analysis`} className="mt-3 block text-center text-sm font-medium text-brand-600 hover:underline">View full analysis</Link></Card>
      </div>

      <Card title="Process steps">
        <DataTable rows={p.steps} columns={[
          { header: '#', render: (_, i) => i + 1, className: 'w-10 text-slate-400' },
          { header: 'Step', render: (s) => <div><span className="font-medium text-slate-900">{s.name}</span>{s.description && <p className="text-xs text-slate-500">{s.description}</p>}</div> },
          { header: 'Type', render: (s) => <Badge tone={s.type === 'decision' ? 'blue' : s.type === 'task' ? 'slate' : 'green'}>{s.type}</Badge> },
          { header: 'Role', render: (s) => s.role || '—' },
          { header: 'Dept', render: (s) => s.department || '—' },
          { header: 'Tool', render: (s) => s.tool || '—' },
          { header: 'Input → Output', render: (s) => (s.inputs || s.outputs ? <span className="text-xs text-slate-500">{s.inputs || '—'} → {s.outputs || '—'}</span> : '—') },
          { header: 'Time', render: (s) => (s.estimatedTime ? `${s.estimatedTime} min` : '—') },
          { header: 'Mode', render: (s) => s.type === 'task' && (s.isManual ? <span className="flex items-center gap-1 text-amber-600"><Hand size={14} />Manual</span> : <span className="flex items-center gap-1 text-emerald-600"><Zap size={14} />Auto</span>) },
        ]} />
      </Card>
      <ConfirmModal open={confirm} title="Delete process?" message={`"${p.name}" and all its steps will be permanently deleted.`} onConfirm={del} onClose={() => setConfirm(false)} />
    </div>
  );
}
