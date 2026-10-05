import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, HeartPulse, Hand, Timer, Plus, Compass, AlertTriangle, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, LabelList } from 'recharts';
import { api } from '../lib/api.js';
import { Card, StatCard, Button, Loading, ErrorBox, Badge, ScoreBadge, ScoreRing, EmptyState, statusTone } from '../components/ui.jsx';
import ProcessStrip, { StripLegend } from '../components/ProcessStrip.jsx';
import { useAuth } from '../lib/auth.jsx';
import { scoreColor, fmtTime } from '../lib/constants.js';

const DEPT_COLORS = ['#4F46E5', '#818CF8', '#312E81', '#A5B4FC', '#6366F1', '#C7D2FE'];
const tooltipStyle = { borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 8px 24px -8px rgb(30 27 75 / 0.25)', fontSize: 13 };

// Maps what the user said they want during setup to a concrete first action.
const NEXT_STEPS = {
  'Write down how we work': ['Describe a process in plain words', '/discovery'],
  'Find problems and delays': ['Check a process for problems', '/analysis'],
  'Reduce manual work': ['See which tasks are done by hand', '/analysis'],
  'Make clear who is responsible': ['Add a process and assign owners', '/processes/new'],
  'Plan and compare improvements': ['Compare today with a better version', '/compare'],
  'Train new employees': ['Browse your process library', '/processes'],
};

function suggestions(user) {
  const ob = user.onboarding;
  const picks = ob?.completed && !ob.skipped ? (ob.goals || []).map((g) => NEXT_STEPS[g]).filter(Boolean) : [];
  if ((ob?.documentation || []).some((d) => d.startsWith('It is not written'))) picks.unshift(NEXT_STEPS['Write down how we work']);
  const unique = [...new Map(picks.map((p) => [p[1], p])).values()].slice(0, 3);
  return unique.length ? unique : [NEXT_STEPS['Write down how we work'], ['Create a process step by step', '/processes/new']];
}

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

// Decorative process-flow lines for the hero background
function HeroPattern() {
  return (
    <svg aria-hidden viewBox="0 0 400 260" className="pointer-events-none absolute -right-10 -top-6 h-[120%] opacity-[0.16]" fill="none" stroke="#A5B4FC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M40 230V90a30 30 0 0 1 30-30h200" /><path d="M40 150h130" /><path d="M170 150v50h120" /><path d="M270 60v60h90" />
      <circle cx="290" cy="60" r="14" fill="#A5B4FC" /><circle cx="190" cy="150" r="14" fill="#A5B4FC" /><circle cx="310" cy="200" r="14" fill="#A5B4FC" /><circle cx="380" cy="120" r="14" fill="#A5B4FC" />
    </svg>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.dashboard().then(setD).catch((e) => setError(e.message)); }, []);
  if (error) return <ErrorBox error={error} />;
  if (!d) return <Loading />;

  const t = d.totals;
  const first = user.name.split(' ')[0];
  const challenge = user.onboarding?.challenge;
  const picks = suggestions(user);
  const totalMin = t.manualMinutes + t.autoMinutes;
  const manualPct = totalMin ? Math.round((t.manualMinutes / totalMin) * 100) : 0;
  const timeData = [{ name: 'By hand', value: t.manualMinutes, color: '#F59E0B' }, { name: 'By a system', value: t.autoMinutes, color: '#10B981' }];
  const deptTotal = d.departments.reduce((n, x) => n + x.value, 0) || 1;
  // Chart labels keep the TO-BE marker visible even when the name is shortened
  const label = (name) => { const tb = / \(TO-BE\)$/.test(name); const base = name.replace(/ \(TO-BE\)$/, ''); const max = tb ? 19 : 27; const b = base.length > max ? `${base.slice(0, max - 1)}…` : base; return tb ? `${b} · TO-BE` : b; };

  return (
    <div className="stagger space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink-900 via-ink-900 to-ink-800 p-7 text-white shadow-lift sm:p-9">
        <HeroPattern />
        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-xl">
            <p className="text-sm font-medium text-brand-300">{greeting()}, {first}</p>
            <h1 className="mt-1.5 font-display text-[32px] font-semibold leading-tight tracking-tight sm:text-4xl">
              {t.processes ? `${t.processes} ${t.processes === 1 ? 'process' : 'processes'} documented` : 'Let’s document your first process'}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-brand-200/85">
              {t.processes
                ? `${t.manualTasks} manual ${t.manualTasks === 1 ? 'task' : 'tasks'} and ${t.bottlenecks} possible ${t.bottlenecks === 1 ? 'bottleneck' : 'bottlenecks'} found so far.`
                : 'Describe how work happens in plain words and FlowLens will draw it, check it and suggest improvements.'}
              {challenge && <> You told us: <i>“{challenge}”</i></>}
            </p>
            <div className="mt-6 flex flex-wrap gap-2.5">
              {picks.map(([label, to], i) => (
                <Button key={to} to={to} variant={i === 0 ? 'light' : 'onDark'}>{label}<ArrowRight size={15} /></Button>
              ))}
            </div>
          </div>
          {t.processes > 0 && (
            <div className="flex flex-col items-center rounded-2xl bg-ink-950/70 px-8 py-5 ring-1 ring-inset ring-white/10">
              <ScoreRing score={t.avgScore} size={132} label={false} onDark />
              <p className="mt-1 text-xs font-medium text-brand-200">Average health score</p>
            </div>
          )}
        </div>
      </section>

      <div data-tour="dash-stats" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FolderKanban} label="Processes" value={t.processes} hint={`${t.asIs} AS-IS · ${t.toBe} TO-BE`} />
        <StatCard icon={HeartPulse} label="Average health score" value={`${t.avgScore}`} tone={t.avgScore >= 75 ? 'green' : t.avgScore >= 50 ? 'amber' : 'red'} hint="out of 100, higher is better" />
        <StatCard icon={Hand} label="Manual tasks" value={t.manualTasks} tone="amber" hint="done by hand today" />
        <StatCard icon={Timer} label="Possible bottlenecks" value={t.bottlenecks} tone="red" hint={`${t.handoffs} handoffs between people`} />
      </div>

      {t.processes === 0 ? (
        <EmptyState title="No processes yet" text="Start by describing one process of your business. It only takes a few minutes, and your charts and scores will appear here."
          action={<div className="flex gap-2"><Button to="/discovery"><Compass size={16} />Discover a process</Button><Button variant="secondary" to="/processes/new"><Plus size={16} />Create manually</Button></div>} />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Health score by process" className="lg:col-span-2">
              <div style={{ height: Math.max(220, d.scores.length * 54) }}>
                <ResponsiveContainer>
                  <BarChart data={d.scores.map((x) => ({ ...x, label: label(x.name) }))} layout="vertical" margin={{ left: 0, right: 36, top: 8 }} barCategoryGap="28%">
                    <XAxis type="number" domain={[0, 100]} hide />
                    <YAxis type="category" dataKey="label" width={215} tick={{ fontSize: 12.5, fill: '#475569' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v) => [`${v} / 100`, 'Health score']} contentStyle={tooltipStyle} cursor={{ fill: '#f1f2fa' }} />
                    <Bar dataKey="score" animationDuration={500} radius={[0, 8, 8, 0]} background={{ fill: '#f1f2fa', radius: 8 }}>
                      {d.scores.map((s) => <Cell key={s.id} fill={scoreColor(s.score)} />)}
                      <LabelList dataKey="score" position="right" style={{ fontSize: 12, fontWeight: 600, fill: '#1E1B4B' }} />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card title="Where the time goes">
              <div className="relative mx-auto" style={{ height: 190, maxWidth: 220 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={timeData} dataKey="value" nameKey="name" animationDuration={500} innerRadius={62} outerRadius={88} paddingAngle={3} stroke="none">
                      {timeData.map((x) => <Cell key={x.name} fill={x.color} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [fmtTime(v), n]} contentStyle={tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-3xl font-semibold text-ink-900">{manualPct}%</span>
                  <span className="text-xs text-slate-400">by hand</span>
                </div>
              </div>
              <ul className="mt-3 space-y-1.5 text-sm">
                {timeData.map((x) => (
                  <li key={x.name} className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: x.color }} />{x.name}</span><span className="font-medium text-ink-900">{fmtTime(x.value)}</span></li>
                ))}
              </ul>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Recently updated" className="lg:col-span-2" action={<Link to="/processes" className="text-sm font-medium text-brand-600 hover:text-brand-700">View all</Link>}>
              <ul className="divide-y divide-slate-100">
                {d.recent.map((p) => (
                  <li key={p._id} className="grid items-center gap-x-5 gap-y-2 py-3.5 sm:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)_auto]">
                    <div className="min-w-0">
                      <Link to={`/processes/${p._id}`} className="block truncate font-medium text-ink-900 hover:text-brand-700">{p.name}</Link>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <Badge tone={p.version === 'to-be' ? 'brand' : 'blue'}>{p.version === 'to-be' ? 'TO-BE' : 'AS-IS'}</Badge>
                        <Badge tone={statusTone[p.status]}>{p.status}</Badge>
                        {p.department && <Badge>{p.department}</Badge>}
                      </div>
                    </div>
                    <ProcessStrip steps={p.steps} className="h-7 w-full" />
                    <ScoreBadge score={p.score} />
                  </li>
                ))}
              </ul>
              <div className="mt-2 border-t border-slate-100 pt-3"><StripLegend /></div>
            </Card>

            <div className="space-y-6">
              <Card title="Top issues to fix" tour="dash-issues">
                {d.issues.length === 0 ? <p className="text-sm text-slate-400">No high-severity issues. Nice work.</p> : (
                  <ul className="space-y-3.5">
                    {d.issues.map((f, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-500"><AlertTriangle size={14} /></span>
                        <div className="min-w-0"><Link to={`/processes/${f.processId}/analysis`} className="font-medium leading-snug text-slate-800 hover:text-brand-700">{f.title}</Link>
                          <p className="truncate text-xs text-slate-400">{f.process}</p></div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
              <Card title="By department">
                <div className="flex h-3 overflow-hidden rounded-full bg-slate-100" role="img" aria-label="Processes by department">
                  {d.departments.map((x, i) => <div key={x.name} style={{ width: `${(x.value / deptTotal) * 100}%`, background: DEPT_COLORS[i % DEPT_COLORS.length] }} title={`${x.name}: ${x.value}`} />)}
                </div>
                <ul className="mt-4 space-y-1.5 text-sm">
                  {d.departments.map((x, i) => (
                    <li key={x.name} className="flex items-center justify-between"><span className="flex items-center gap-2 text-slate-600"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: DEPT_COLORS[i % DEPT_COLORS.length] }} />{x.name}</span><span className="font-medium text-ink-900">{x.value}</span></li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
