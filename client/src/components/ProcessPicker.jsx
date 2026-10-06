import { useEffect, useState } from 'react';
import { SHOW_COMPARE } from '../lib/constants.js';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { Card, Loading, Badge, ScoreBadge, EmptyState, Button } from './ui.jsx';

// Shown on pages (Map / Analysis) that need a process but were opened without one.
export default function ProcessPicker({ title, suffix }) {
  const [list, setList] = useState(null);
  useEffect(() => { api.processes().then(setList).catch(() => setList([])); }, []);
  if (!list) return <Loading />;
  if (!list.length) return <EmptyState title="No processes yet" text="Create or discover a process first." action={<Button to="/processes/new">Create process</Button>} />;
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold text-slate-900">{title}</h1>
      <p className="mb-6 text-sm text-slate-500">Select a process to continue.</p>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((p) => (
          <Link key={p._id} to={`/processes/${p._id}/${suffix}`}>
            <Card className="transition-shadow hover:shadow-md">
              <div className="mb-2 flex items-start justify-between gap-2"><span className="font-medium text-slate-900">{p.name}</span><ScoreBadge score={p.analysis.score} /></div>
              <div className="flex gap-1.5">{SHOW_COMPARE && <Badge tone={p.version === 'to-be' ? 'brand' : 'blue'}>{p.version === 'to-be' ? 'TO-BE' : 'AS-IS'}</Badge>}{p.department && <Badge>{p.department}</Badge>}</div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
