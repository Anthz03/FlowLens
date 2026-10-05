// A tiny at-a-glance picture of a process: one node per step, coloured by what kind of step it is.
const COLORS = { manual: '#F59E0B', auto: '#10B981', decision: '#0EA5E9', start: '#4F46E5', end: '#1E1B4B' };
const GAP = 30;

function kind(s) {
  if (s.type === 'start' || s.type === 'end' || s.type === 'decision') return s.type;
  return s.isManual ? 'manual' : 'auto';
}

export default function ProcessStrip({ steps = [], className = 'h-8 w-full' }) {
  const list = [...steps].sort((a, b) => a.order - b.order);
  if (!list.length) return <div className={`${className} rounded-lg bg-slate-100`} aria-hidden />;
  const w = (list.length - 1) * GAP + 28;
  return (
    <svg viewBox={`0 0 ${w} 36`} className={className} preserveAspectRatio="xMinYMid meet" role="img" aria-label={`Process with ${list.length} steps`}>
      <path d={`M14 18H${w - 14}`} stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" />
      {list.map((s, i) => {
        const x = 14 + i * GAP, k = kind(s), c = COLORS[k], slow = s.type === 'task' && s.estimatedTime >= 45;
        return (
          <g key={s.key || i}>
            <title>{`${s.name}${s.role ? ` · ${s.role}` : ''}${s.estimatedTime ? ` · ${s.estimatedTime} min` : ''}`}</title>
            {k === 'decision' && <path d={`M${x} 8L${x + 10} 18L${x} 28L${x - 10} 18Z`} fill={c} />}
            {(k === 'start' || k === 'end') && <circle cx={x} cy="18" r="7" fill={c} />}
            {(k === 'manual' || k === 'auto') && <rect x={x - 11} y="9" width="22" height="18" rx="6" fill={c} stroke={slow ? '#DC2626' : 'none'} strokeWidth="3" />}
          </g>
        );
      })}
    </svg>
  );
}

export function StripLegend() {
  const items = [['Manual', COLORS.manual], ['Automated', COLORS.auto], ['Decision', COLORS.decision], ['Start / end', COLORS.start]];
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
      {items.map(([t, c]) => <li key={t} className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: c }} />{t}</li>)}
      <li className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-[3px] ring-2 ring-red-500" />Very slow step</li>
    </ul>
  );
}
