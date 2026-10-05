import { Link } from 'react-router-dom';
import { Layers, Clock, Hand, Trash2 } from 'lucide-react';
import { Badge, ScoreBadge, statusTone } from './ui.jsx';
import { fmtTime } from '../lib/constants.js';

export default function ProcessCard({ process: p, onDelete }) {
  const m = p.analysis?.metrics || {};
  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-2 flex items-start justify-between gap-2">
        <Link to={`/processes/${p._id}`} className="font-semibold text-slate-900 hover:text-brand-700">{p.name}</Link>
        <ScoreBadge score={p.analysis?.score ?? 0} />
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge tone={p.version === 'to-be' ? 'brand' : 'blue'}>{p.version === 'to-be' ? 'TO-BE' : 'AS-IS'}</Badge>
        <Badge tone={statusTone[p.status]}>{p.status}</Badge>
        {p.department && <Badge>{p.department}</Badge>}
      </div>
      <p className="mb-4 line-clamp-2 flex-1 text-sm text-slate-500">{p.description || 'No description yet.'}</p>
      <div className="mb-4 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Layers size={14} />{m.steps ?? 0} steps</span>
        <span className="flex items-center gap-1"><Hand size={14} />{m.manualTasks ?? 0} manual</span>
        <span className="flex items-center gap-1"><Clock size={14} />{fmtTime(m.estimatedTime ?? 0)}</span>
      </div>
      <div className="flex items-center gap-2 border-t border-slate-100 pt-3 text-sm">
        <Link to={`/processes/${p._id}/map`} className="font-medium text-brand-600 hover:underline">Map</Link>
        <Link to={`/processes/${p._id}/analysis`} className="font-medium text-brand-600 hover:underline">Analysis</Link>
        <Link to={`/processes/${p._id}/edit`} className="font-medium text-slate-600 hover:underline">Edit</Link>
        {onDelete && <button onClick={() => onDelete(p)} aria-label="Delete process" className="ml-auto rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>}
      </div>
    </div>
  );
}
