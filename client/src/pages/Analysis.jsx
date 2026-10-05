import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Hand, Timer, Copy, Shuffle, UserX, FileText, RefreshCw, Wand2, Lightbulb } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { api } from '../lib/api.js';
import { PageHeader, Card, Button, Loading, ErrorBox, ScoreRing, ScoreBar, AnalysisCard, Badge } from '../components/ui.jsx';
import ProcessPicker from '../components/ProcessPicker.jsx';
import { fmtTime } from '../lib/constants.js';

function Metric({ label, value }) {
  return <div className="rounded-lg bg-slate-50 px-4 py-3"><p className="text-xs text-slate-500">{label}</p><p className="text-xl font-semibold text-slate-900">{value}</p></div>;
}

function AnalysisView({ id }) {
  const nav = useNavigate();
  const [process, setProcess] = useState(null);
  const [a, setA] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = () => Promise.all([api.process(id), api.runAnalysis(id)]).then(([p, an]) => { setProcess(p); setA(an); }).catch((e) => setError(e.message));
  useEffect(() => { load(); }, [id]);

  const makeToBe = async () => {
    setBusy(true);
    try { const copy = await api.duplicate(id, { optimize: true }); nav(`/compare?asis=${id}&tobe=${copy._id}`); }
    catch (e) { setError(e.message); setBusy(false); }
  };

  if (error && !a) return <ErrorBox error={error} />;
  if (!a || !process) return <Loading />;
  const f = (type) => a.findings.filter((x) => x.type === type);
  const bottleneckNames = new Set(f('bottleneck').flatMap((x) => x.steps));
  const times = process.steps.filter((s) => s.estimatedTime > 0).map((s) => ({ name: s.name.length > 22 ? `${s.name.slice(0, 21)}…` : s.name, minutes: s.estimatedTime, full: s.name }));
  const radar = Object.entries(a.categories).map(([k, v]) => ({ category: k, score: v }));
  const m = a.metrics;

  return (
    <div>
      <PageHeader title="Process Analysis" subtitle={`${process.name} · ${process.version === 'to-be' ? 'TO-BE' : 'AS-IS'}`}>
        <Button variant="secondary" onClick={async () => { setBusy(true); await load(); setBusy(false); }} disabled={busy}><RefreshCw size={16} />Re-run analysis</Button>
        <Button variant="secondary" to={`/processes/${id}/map`}>View map</Button>
        {process.version !== 'to-be' && <Button data-tour="analysis-tobe" onClick={makeToBe} disabled={busy}><Wand2 size={16} />Generate TO-BE</Button>}
      </PageHeader>
      <ErrorBox error={error} />

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card title="Process Health Score" className="lg:col-span-1" tour="analysis-score">
          <div className="flex flex-col items-center gap-5">
            <ScoreRing score={a.score} />
            <div className="w-full space-y-3">{Object.entries(a.categories).map(([k, v]) => <ScoreBar key={k} label={k} value={v} />)}</div>
          </div>
        </Card>
        <div className="space-y-6 lg:col-span-2">
          <Card title="Key metrics">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <Metric label="Steps" value={m.steps} /><Metric label="Manual tasks" value={m.manualTasks} />
              <Metric label="Handoffs" value={m.handoffs} /><Metric label="Total time" value={fmtTime(m.estimatedTime)} />
              <Metric label="Decisions" value={m.decisions} /><Metric label="Roles" value={m.roles.length} />
              <Metric label="Departments" value={m.departments.length} /><Metric label="Tools" value={m.tools.length} />
            </div>
          </Card>
          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Score profile">
              <div style={{ height: 210 }}><ResponsiveContainer>
                <RadarChart data={radar} outerRadius="70%"><PolarGrid /><PolarAngleAxis dataKey="category" tick={{ fontSize: 11 }} /><Radar dataKey="score" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.35} /><Tooltip /></RadarChart>
              </ResponsiveContainer></div>
            </Card>
            <Card title="Time per step (min)">
              <div style={{ height: 210 }}><ResponsiveContainer>
                <BarChart data={times} layout="vertical" margin={{ left: 0, right: 10 }}>
                  <XAxis type="number" tick={{ fontSize: 11 }} /><YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(v) => [`${v} min`, 'Time']} labelFormatter={(_, p) => p[0]?.payload.full} cursor={{ fill: '#f1f5f9' }} />
                  <Bar dataKey="minutes" radius={[0, 3, 3, 0]}>{times.map((t, i) => <Cell key={i} fill={bottleneckNames.has(t.full) ? '#dc2626' : '#818cf8'} />)}</Bar>
                </BarChart>
              </ResponsiveContainer></div>
              <p className="mt-1 text-xs text-slate-400">Red bars are possible bottlenecks.</p>
            </Card>
          </div>
        </div>
      </div>

      <Card title="Recommendations" className="mb-6">
        <ul className="space-y-2">{a.recommendations.map((r, i) => <li key={i} className="flex gap-2.5 text-sm text-slate-700"><Lightbulb size={16} className="mt-0.5 shrink-0 text-amber-500" />{r}</li>)}</ul>
      </Card>

      <div data-tour="analysis-findings" className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <AnalysisCard icon={Hand} title="Manual tasks" count={f('manual').length} items={f('manual')} empty="No manual tasks." />
        <AnalysisCard icon={Timer} title="Bottlenecks" count={f('bottleneck').length} tone="red" items={f('bottleneck')} empty="No bottlenecks detected." />
        <AnalysisCard icon={Shuffle} title="Handoffs" count={m.handoffs} tone="brand" items={f('handoff').filter((x) => x.severity !== 'low' || m.handoffs <= 6)} empty="No handoffs between roles." />
        <AnalysisCard icon={Copy} title="Duplicate steps" count={f('duplicate').length} items={f('duplicate')} empty="No duplicate steps." />
        <AnalysisCard icon={UserX} title="Unclear responsibilities" count={f('responsibility').length} tone="red" items={f('responsibility')} empty="Every step has an owner." />
        <AnalysisCard icon={FileText} title="Documentation & complexity" count={f('documentation').length + f('complexity').length} tone="slate" items={[...f('complexity'), ...f('documentation')]} empty="Well documented." />
      </div>
    </div>
  );
}

export default function Analysis() {
  const { id } = useParams();
  return id ? <AnalysisView key={id} id={id} /> : <ProcessPicker title="Process Analysis" suffix="analysis" />;
}
