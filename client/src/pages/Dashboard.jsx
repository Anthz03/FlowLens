import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FolderKanban, HeartPulse, Hand, Timer, Plus, Compass, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { api } from '../lib/api.js';
import { PageHeader, Card, StatCard, Button, Loading, ErrorBox, Badge, ScoreBadge, DataTable, statusTone } from '../components/ui.jsx';
import { scoreColor } from '../lib/constants.js';

const PIE = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { api.dashboard().then(setD).catch((e) => setError(e.message)); }, []);
  if (error) return <ErrorBox error={error} />;
  if (!d) return <Loading />;
  const t = d.totals;
  return (
    <div>
      <PageHeader title="Dashboard" subtitle="An overview of how well your business processes are documented and performing.">
        <Button variant="secondary" to="/discovery"><Compass size={16} />Discover a process</Button>
        <Button to="/processes/new"><Plus size={16} />Create process</Button>
      </PageHeader>

      <div data-tour="dash-stats" className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={FolderKanban} label="Processes" value={t.processes} hint={`${t.asIs} AS-IS · ${t.toBe} TO-BE`} />
        <StatCard icon={HeartPulse} label="Average health score" value={`${t.avgScore}/100`} tone={t.avgScore >= 75 ? 'green' : t.avgScore >= 50 ? 'amber' : 'red'} />
        <StatCard icon={Hand} label="Manual tasks" value={t.manualTasks} tone="amber" hint="across all processes" />
        <StatCard icon={Timer} label="Possible bottlenecks" value={t.bottlenecks} tone="red" hint={`${t.handoffs} handoffs in total`} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-3">
        <Card title="Process health scores" className="lg:col-span-2">
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <BarChart data={d.scores} layout="vertical" margin={{ left: 10, right: 20 }}>
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                <YAxis type="category" dataKey="name" width={190} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v}/100`, 'Health score']} cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>{d.scores.map((s) => <Cell key={s.id} fill={scoreColor(s.score)} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card title="Processes by department">
          <div style={{ height: 260 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={d.departments} dataKey="value" nameKey="name" innerRadius={50} outerRadius={85} paddingAngle={2}>
                  {d.departments.map((_, i) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                </Pie>
                <Tooltip /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Recently updated" className="lg:col-span-2" action={<Link to="/processes" className="text-sm font-medium text-brand-600 hover:underline">View all</Link>}>
          <DataTable rows={d.recent} columns={[
            { header: 'Process', render: (p) => <Link to={`/processes/${p._id}`} className="font-medium text-slate-900 hover:text-brand-700">{p.name}</Link> },
            { header: 'Dept', field: 'department' },
            { header: 'Type', render: (p) => <Badge tone={p.version === 'to-be' ? 'brand' : 'blue'}>{p.version === 'to-be' ? 'TO-BE' : 'AS-IS'}</Badge> },
            { header: 'Status', render: (p) => <Badge tone={statusTone[p.status]}>{p.status}</Badge> },
            { header: 'Health', render: (p) => <ScoreBadge score={p.score} /> },
          ]} />
        </Card>
        <Card title="Top issues to fix" tour="dash-issues">
          {d.issues.length === 0 ? <p className="text-sm text-slate-400">No high-severity issues. Nice work.</p> : (
            <ul className="space-y-3">
              {d.issues.map((f, i) => (
                <li key={i} className="flex gap-2.5 text-sm">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-red-500" />
                  <div><Link to={`/processes/${f.processId}/analysis`} className="font-medium text-slate-800 hover:text-brand-700">{f.title}</Link>
                    <p className="text-xs text-slate-400">{f.process}</p></div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
