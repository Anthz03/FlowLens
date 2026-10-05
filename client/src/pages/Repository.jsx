import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, LayoutGrid, List } from 'lucide-react';
import { api } from '../lib/api.js';
import { PageHeader, Button, Loading, ErrorBox, EmptyState, TextInput, Select, DataTable, Badge, ScoreBadge, ConfirmModal, statusTone } from '../components/ui.jsx';
import ProcessCard from '../components/ProcessCard.jsx';
import { fmtTime, STATUSES } from '../lib/constants.js';
import { useAuth } from '../lib/auth.jsx';

export default function Repository() {
  const { user } = useAuth();
  const canDelete = user.permission !== 'member';
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [dept, setDept] = useState('');
  const [status, setStatus] = useState('');
  const [version, setVersion] = useState('');
  const [view, setView] = useState('grid');
  const [toDelete, setToDelete] = useState(null);

  const load = () => api.processes().then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const depts = useMemo(() => [...new Set((list || []).map((p) => p.department).filter(Boolean))], [list]);
  const filtered = useMemo(() => (list || []).filter((p) =>
    (!q || `${p.name} ${p.description}`.toLowerCase().includes(q.toLowerCase())) &&
    (!dept || p.department === dept) && (!status || p.status === status) && (!version || p.version === version)), [list, q, dept, status, version]);

  const confirmDelete = async () => {
    try { await api.deleteProcess(toDelete._id); setToDelete(null); load(); } catch (e) { setError(e.message); setToDelete(null); }
  };

  if (!list) return error ? <ErrorBox error={error} /> : <Loading />;
  return (
    <div>
      <PageHeader title="Process Repository" subtitle="All documented business processes in one place.">
        <Button to="/processes/new"><Plus size={16} />Create process</Button>
      </PageHeader>
      <ErrorBox error={error} />
      <div data-tour="repo-filters" className="mb-5 flex flex-wrap items-center gap-3">
        <div className="relative min-w-56 flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search processes…" aria-label="Search processes"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm shadow-sm transition hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
        </div>
        <div className="w-40"><Select placeholder="All departments" options={depts} value={dept} onChange={(e) => setDept(e.target.value)} aria-label="Department" /></div>
        <div className="w-36"><Select placeholder="All statuses" options={STATUSES} value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Status" /></div>
        <div className="w-36"><Select placeholder="AS-IS & TO-BE" options={[{ value: 'as-is', label: 'AS-IS' }, { value: 'to-be', label: 'TO-BE' }]} value={version} onChange={(e) => setVersion(e.target.value)} aria-label="Version" /></div>
        <div className="flex rounded-xl border border-slate-200 bg-white p-0.5 shadow-sm">
          {[['grid', LayoutGrid], ['table', List]].map(([v, Icon]) => (
            <button key={v} onClick={() => setView(v)} aria-label={`${v} view`} className={`rounded-md p-1.5 ${view === v ? 'bg-brand-50 text-brand-600' : 'text-slate-400'}`}><Icon size={18} /></button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No processes found" text="Try different filters, or document a new process." action={<Button to="/processes/new">Create process</Button>} />
      ) : view === 'grid' ? (
        <div data-tour="repo-list" className="stagger grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((p) => <ProcessCard key={p._id} process={p} onDelete={canDelete ? setToDelete : undefined} />)}</div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
          <DataTable rows={filtered} columns={[
            { header: 'Process', render: (p) => <Link to={`/processes/${p._id}`} className="font-medium text-slate-900 hover:text-brand-700">{p.name}</Link> },
            { header: 'Department', field: 'department' },
            { header: 'Type', render: (p) => <Badge tone={p.version === 'to-be' ? 'brand' : 'blue'}>{p.version === 'to-be' ? 'TO-BE' : 'AS-IS'}</Badge> },
            { header: 'Status', render: (p) => <Badge tone={statusTone[p.status]}>{p.status}</Badge> },
            { header: 'Steps', render: (p) => p.analysis.metrics.steps },
            { header: 'Time', render: (p) => fmtTime(p.analysis.metrics.estimatedTime) },
            { header: 'Health', render: (p) => <ScoreBadge score={p.analysis.score} /> },
            { header: '', render: (p) => canDelete && <button onClick={() => setToDelete(p)} className="text-xs text-red-600 hover:underline">Delete</button> },
          ]} />
        </div>
      )}
      <ConfirmModal open={!!toDelete} title="Delete process?" message={`"${toDelete?.name}" and all its steps will be permanently deleted.`} onConfirm={confirmDelete} onClose={() => setToDelete(null)} />
    </div>
  );
}
