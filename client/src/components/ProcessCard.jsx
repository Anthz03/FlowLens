import { Link } from 'react-router-dom';
import { Layers, Clock, Hand, Trash2 } from 'lucide-react';
import { Badge, ScoreBadge, statusTone } from './ui.jsx';
import ProcessStrip from './ProcessStrip.jsx';
import { fmtTime } from '../lib/constants.js';

export default function ProcessCard({ process: p, onDelete }) {
  const m = p.analysis?.metrics || {};
  return (
    <article className="group flex flex-col rounded-2xl border border-slate-200/60 bg-white p-5 shadow-card transition duration-200 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="mb-4 rounded-xl bg-slate-50 px-3 py-3 ring-1 ring-inset ring-slate-100">
        <ProcessStrip steps={p.steps} className="h-7 w-full" />
      </div>
      <div className="mb-2 flex items-start justify-between gap-3">
        <Link to={`/processes/${p._id}`} className="font-display text-[17px] font-semibold leading-snug text-ink-900 hover:text-brand-700">{p.name}</Link>
        <ScoreBadge score={p.analysis?.score ?? 0} />
      </div>
      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge tone={p.version === 'to-be' ? 'brand' : 'blue'}>{p.version === 'to-be' ? 'TO-BE' : 'AS-IS'}</Badge>
        <Badge tone={statusTone[p.status]}>{p.status}</Badge>
        {p.department && <Badge>{p.department}</Badge>}
      </div>
      <p className="mb-4 line-clamp-2 flex-1 text-sm leading-relaxed text-slate-500">{p.description || 'No description yet.'}</p>
      <div className="mb-4 flex gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Layers size={14} />{m.steps ?? 0} steps</span>
        <span className="flex items-center gap-1"><Hand size={14} />{m.manualTasks ?? 0} manual</span>
        <span className="flex items-center gap-1"><Clock size={14} />{fmtTime(m.estimatedTime ?? 0)}</span>
      </div>
      <div className="flex items-center gap-4 border-t border-slate-100 pt-3.5 text-sm">
        <Link to={`/processes/${p._id}/map`} className="font-medium text-brand-600 hover:text-brand-700">Map</Link>
        <Link to={`/processes/${p._id}/analysis`} className="font-medium text-brand-600 hover:text-brand-700">Analysis</Link>
        <Link to={`/processes/${p._id}/edit`} className="font-medium text-slate-500 hover:text-slate-700">Edit</Link>
        {onDelete && <button onClick={() => onDelete(p)} aria-label={`Delete ${p.name}`} className="ml-auto rounded-lg p-1.5 text-slate-300 transition hover:bg-red-50 hover:text-red-600"><Trash2 size={16} /></button>}
      </div>
    </article>
  );
}
