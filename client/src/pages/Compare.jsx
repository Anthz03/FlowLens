import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Minus, Wand2, Copy, CheckCircle2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { api } from '../lib/api.js';
import { PageHeader, Card, Button, Loading, ErrorBox, EmptyState, Select, Field, ScoreRing, DataTable } from '../components/ui.jsx';
import { fmtTime } from '../lib/constants.js';

// Lower is better for every row except the health score.
const ROWS = [
  { label: 'Process Steps', get: (p) => p.analysis.metrics.steps },
  { label: 'Manual Tasks', get: (p) => p.analysis.metrics.manualTasks },
  { label: 'Handoffs', get: (p) => p.analysis.metrics.handoffs },
  { label: 'Bottlenecks', get: (p) => p.analysis.metrics.bottlenecks },
  { label: 'Estimated Time', get: (p) => p.analysis.metrics.estimatedTime, fmt: (v) => `${v} min` },
  { label: 'Health Score', get: (p) => p.analysis.score, fmt: (v) => `${v}/100`, higherBetter: true },
];

function Delta({ row, a, b }) {
  const diff = b - a;
  if (diff === 0) return <span className="flex items-center gap-1 text-slate-400"><Minus size={14} />No change</span>;
  const good = row.higherBetter ? diff > 0 : diff < 0;
  const pct = a ? Math.abs(Math.round((diff / a) * 100)) : null;
  const Icon = diff > 0 ? ArrowUp : ArrowDown;
  return <span className={`flex items-center gap-1 font-medium ${good ? 'text-emerald-600' : 'text-red-600'}`}><Icon size={14} />{pct !== null ? `${pct}% ${good ? 'better' : 'worse'}` : good ? 'better' : 'worse'}</span>;
}

export default function Compare() {
  const [params, setParams] = useSearchParams();
  const [list, setList] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const load = () => api.processes().then(setList).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);

  const asisId = params.get('asis') || '';
  const tobeId = params.get('tobe') || '';
  const asis = list?.find((p) => p._id === asisId);
  const tobe = list?.find((p) => p._id === tobeId);
  const asisOptions = useMemo(() => (list || []).filter((p) => p.version === 'as-is').map((p) => ({ value: p._id, label: p.name })), [list]);
  const tobeOptions = useMemo(() => (list || []).filter((p) => p._id !== asisId && (p.baseProcess === asisId || !asisId)).map((p) => ({ value: p._id, label: p.name })), [list, asisId]);

  const pickAsis = (id) => {
    const next = (list || []).find((p) => p.baseProcess === id);
    setParams(id ? { asis: id, ...(next ? { tobe: next._id } : {}) } : {});
  };
  const create = async (optimize) => {
    setBusy(true);
    try { const c = await api.duplicate(asisId, { optimize }); await load(); setParams({ asis: asisId, tobe: c._id }); } catch (e) { setError(e.message); }
    setBusy(false);
  };

  if (!list) return error ? <ErrorBox error={error} /> : <Loading />;
  const chart = asis && tobe ? ROWS.filter((r) => !r.higherBetter && r.label !== 'Estimated Time').map((r) => ({ name: r.label, 'AS-IS': r.get(asis), 'TO-BE': r.get(tobe) })) : [];

  return (
    <div>
      <PageHeader title="AS-IS vs TO-BE Comparison" subtitle="See how the improved process compares with how work happens today." />
      <ErrorBox error={error} />
      <Card className="mb-6">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="AS-IS process (current)"><Select placeholder="Select a process…" options={asisOptions} value={asisId} onChange={(e) => pickAsis(e.target.value)} /></Field>
          <Field label="TO-BE process (improved)"><Select placeholder={asisId ? 'Select a TO-BE version…' : 'Choose AS-IS first'} options={tobeOptions} value={tobeId} disabled={!asisId} onChange={(e) => setParams({ asis: asisId, ...(e.target.value ? { tobe: e.target.value } : {}) })} /></Field>
        </div>
        {asisId && (
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            <Button onClick={() => create(true)} disabled={busy}><Wand2 size={16} />Generate improved TO-BE</Button>
            <Button variant="secondary" onClick={() => create(false)} disabled={busy}><Copy size={16} />Duplicate as TO-BE to edit manually</Button>
          </div>
        )}
      </Card>

      {!asis ? <EmptyState title="Choose a process to compare" text="Pick an AS-IS process, then generate or select its TO-BE version." />
        : !tobe ? <EmptyState title="No TO-BE selected" text="Generate an improved TO-BE automatically, or duplicate the AS-IS process and edit it yourself." />
        : (
          <>
            <div className="mb-6 grid gap-6 lg:grid-cols-3">
              <Card title="Comparison" className="lg:col-span-2">
                <DataTable rowKey={(r) => r.label} rows={ROWS} columns={[
                  { header: 'Metric', render: (r) => <span className="font-medium text-slate-800">{r.label}</span> },
                  { header: 'AS-IS', render: (r) => (r.fmt || String)(r.get(asis)), className: 'text-right tabular-nums' },
                  { header: 'TO-BE', render: (r) => <span className="font-semibold text-slate-900">{(r.fmt || String)(r.get(tobe))}</span>, className: 'text-right tabular-nums' },
                  { header: 'Improvement', render: (r) => <Delta row={r} a={r.get(asis)} b={r.get(tobe)} /> },
                ]} />
                <p className="mt-3 text-xs text-slate-400">Time saved: {fmtTime(Math.max(0, asis.analysis.metrics.estimatedTime - tobe.analysis.metrics.estimatedTime))} per run.</p>
              </Card>
              <Card title="Health score">
                <div className="flex justify-around"><div className="text-center"><ScoreRing score={asis.analysis.score} size={110} label={false} /><p className="text-xs text-slate-500">AS-IS</p></div>
                  <div className="text-center"><ScoreRing score={tobe.analysis.score} size={110} label={false} /><p className="text-xs text-slate-500">TO-BE</p></div></div>
              </Card>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card title="Metrics side by side">
                <div style={{ height: 260 }}><ResponsiveContainer>
                  <BarChart data={chart}><XAxis dataKey="name" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} allowDecimals={false} /><Tooltip cursor={{ fill: '#f1f5f9' }} /><Legend />
                    <Bar dataKey="AS-IS" fill="#94a3b8" radius={[3, 3, 0, 0]} /><Bar dataKey="TO-BE" fill="#4f46e5" radius={[3, 3, 0, 0]} /></BarChart>
                </ResponsiveContainer></div>
              </Card>
              <Card title="What changed" action={<Link to={`/processes/${tobe._id}/map`} className="text-sm font-medium text-brand-600 hover:underline">Edit TO-BE map</Link>}>
                {tobe.improvements?.length ? (
                  <ul className="space-y-2">{tobe.improvements.map((t, i) => <li key={i} className="flex gap-2 text-sm text-slate-700"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />{t}</li>)}</ul>
                ) : <p className="text-sm text-slate-500">This TO-BE was edited manually. Open the map to change steps, then return here to see the effect.</p>}
              </Card>
            </div>
          </>
        )}
    </div>
  );
}
