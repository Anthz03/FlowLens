import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { scoreColor, scoreLabel } from '../lib/constants.js';

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-900">{title}</h1>
        {subtitle && <p className="mt-1.5 text-[15px] leading-relaxed text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Card({ title, action, children, className = '', tour, flush }) {
  return (
    <section data-tour={tour} className={`rounded-2xl border border-slate-200/60 bg-white shadow-card ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between px-6 pb-1 pt-5">
          <h2 className="font-display text-[17px] font-semibold text-ink-900">{title}</h2>
          {action}
        </header>
      )}
      <div className={flush ? 'p-2' : 'p-6'}>{children}</div>
    </section>
  );
}

const btn = {
  primary: 'bg-brand-600 text-white shadow-button hover:bg-brand-700',
  secondary: 'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
  onDark: 'bg-white/10 text-white ring-1 ring-inset ring-white/20 hover:bg-white/20',
  light: 'bg-white text-ink-900 shadow-sm hover:bg-brand-50',
};
export function Button({ variant = 'primary', size = 'md', to, className = '', children, ...props }) {
  const cls = `inline-flex items-center justify-center gap-1.5 rounded-xl font-medium transition duration-150 active:translate-y-px active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2.5 text-sm'} ${btn[variant]} ${className}`;
  return to ? <Link to={to} className={cls} {...props}>{children}</Link> : <button type="button" className={cls} {...props}>{children}</button>;
}

const tones = {
  brand: { chip: 'bg-brand-50 text-brand-600', ghost: 'text-brand-600/[0.07]' },
  green: { chip: 'bg-emerald-50 text-emerald-600', ghost: 'text-emerald-600/[0.08]' },
  amber: { chip: 'bg-amber-50 text-amber-600', ghost: 'text-amber-600/[0.09]' },
  red: { chip: 'bg-red-50 text-red-600', ghost: 'text-red-600/[0.08]' },
};
export function StatCard({ icon: Icon, label, value, hint, tone = 'brand' }) {
  const t = tones[tone];
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-5 shadow-card">
      <Icon aria-hidden size={92} strokeWidth={1.25} className={`absolute -bottom-4 -right-3 ${t.ghost}`} />
      <div className={`mb-4 inline-flex rounded-xl p-2.5 ${t.chip}`}><Icon size={20} /></div>
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-0.5 font-display text-[34px] font-semibold leading-none tracking-tight text-ink-900">{value}</p>
      {hint && <p className="mt-2 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

export function Badge({ children, tone = 'slate' }) {
  const t = {
    slate: 'bg-slate-100 text-slate-600 ring-slate-200', green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
    amber: 'bg-amber-50 text-amber-700 ring-amber-200', red: 'bg-red-50 text-red-700 ring-red-200',
    blue: 'bg-sky-50 text-sky-700 ring-sky-200', brand: 'bg-brand-50 text-brand-700 ring-brand-200',
  };
  return <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${t[tone]}`}>{children}</span>;
}

export const statusTone = { draft: 'amber', active: 'green', archived: 'slate' };

// ---- Score indicators ----
export function ScoreRing({ score, size = 140, label = true, onDark = false }) {
  const r = 52, c = 2 * Math.PI * r, color = onDark ? '#A5B4FC' : scoreColor(score);
  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`Health score ${score} out of 100`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke={onDark ? 'rgb(255 255 255 / 0.12)' : '#e8eaf4'} strokeWidth="9" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 60 60)" style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        <text x="60" y="62" textAnchor="middle" fontSize="30" fontWeight="600" fontFamily="var(--font-display)" fill={onDark ? '#fff' : '#1E1B4B'}>{score}</text>
        <text x="60" y="78" textAnchor="middle" fontSize="9" fill={onDark ? '#A5B4FC' : '#94a3b8'}>out of 100</text>
      </svg>
      {label && <span className="-mt-1 text-xs font-medium" style={{ color }}>{scoreLabel(score)}</span>}
    </div>
  );
}

export function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-sm"><span className="text-slate-600">{label}</span><span className="font-semibold text-ink-900">{value}</span></div>
      <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full transition-[width] duration-500" style={{ width: `${value}%`, background: scoreColor(value) }} /></div>
    </div>
  );
}

export function ScoreBadge({ score }) {
  return <span className="rounded-md px-2 py-0.5 text-xs font-semibold text-white" style={{ background: scoreColor(score) }}>{score}</span>;
}

// ---- Analysis card ----
const sevTone = { high: 'red', medium: 'amber', low: 'slate' };
const sevBar = { high: 'border-red-400', medium: 'border-amber-400', low: 'border-slate-300' };
export function AnalysisCard({ icon: Icon, title, count, tone = 'amber', items, empty = 'No issues found.' }) {
  const colors = { amber: 'text-amber-600 bg-amber-50', red: 'text-red-600 bg-red-50', brand: 'text-brand-600 bg-brand-50', slate: 'text-slate-600 bg-slate-100' };
  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-xl p-2.5 ${colors[tone]}`}><Icon size={18} /></div>
          <h3 className="font-display text-base font-semibold text-ink-900">{title}</h3>
        </div>
        <span className="font-display text-2xl font-semibold text-ink-900">{count}</span>
      </div>
      {items.length === 0 ? <p className="text-sm text-slate-400">{empty}</p> : (
        <ul className="space-y-2">
          {items.slice(0, 6).map((f, i) => (
            <li key={i} className={`rounded-lg border-l-[3px] bg-slate-50/80 px-3 py-2.5 text-sm ${sevBar[f.severity]}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-slate-800">{f.title}</span>
                <Badge tone={sevTone[f.severity]}>{f.severity}</Badge>
              </div>
              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{f.detail}</p>
            </li>
          ))}
          {items.length > 6 && <li className="text-xs text-slate-400">+ {items.length - 6} more</li>}
        </ul>
      )}
    </Card>
  );
}

// ---- Modal ----
export function Modal({ open, title, onClose, children, footer, wide }) {
  useEffect(() => {
    if (!open) return;
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/50 p-4 backdrop-blur-[2px]" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`flex max-h-[90vh] w-full flex-col rounded-2xl bg-white shadow-lift ${wide ? 'max-w-2xl' : 'max-w-md'}`} onMouseDown={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between px-6 pb-2 pt-5">
          <h2 className="font-display text-lg font-semibold text-ink-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </header>
        <div className="overflow-y-auto px-6 py-4">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</footer>}
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, message, confirmLabel = 'Delete', onConfirm, onClose }) {
  return (
    <Modal open={open} title={title} onClose={onClose} footer={<>
      <Button variant="secondary" onClick={onClose}>Cancel</Button>
      <Button variant="danger" onClick={onConfirm}>{confirmLabel}</Button>
    </>}>
      <p className="text-sm leading-relaxed text-slate-600">{message}</p>
    </Modal>
  );
}

// ---- Form fields ----
const input = 'w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100';
export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
    </label>
  );
}
export const TextInput = (p) => <input className={input} {...p} />;
export const TextArea = (p) => <textarea rows={3} className={input} {...p} />;
export const Select = ({ options, placeholder, ...p }) => (
  <select className={input} {...p}>
    {placeholder !== undefined && <option value="">{placeholder}</option>}
    {options.map((o) => (typeof o === 'string' ? <option key={o} value={o}>{o}</option> : <option key={o.value} value={o.value}>{o.label}</option>))}
  </select>
);
export function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-200" />
      {label}
    </label>
  );
}

// ---- Table ----
export function DataTable({ columns, rows, rowKey = (r) => r._id || r.key, empty = 'Nothing here yet.' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-medium text-slate-400">
            {columns.map((c) => <th key={c.header} className={`px-3 py-2.5 font-medium ${c.className || ''}`}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length} className="px-3 py-10 text-center text-slate-400">{empty}</td></tr>}
          {rows.map((r, i) => (
            <tr key={rowKey(r) ?? i} className="border-b border-slate-50 transition-colors last:border-0 hover:bg-brand-50/40">
              {columns.map((c) => <td key={c.header} className={`px-3 py-3 align-middle ${c.className || ''}`}>{c.render ? c.render(r, i) : r[c.field]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ---- Loading / empty / error ----
export function Skeleton({ className = '' }) { return <div className={`skeleton ${className}`} aria-hidden />; }

// Page-shaped placeholder shown while data loads (header, a row of tiles, two panels).
export function Loading() {
  return (
    <div role="status" aria-label="Loading" className="space-y-6">
      <div className="space-y-2"><Skeleton className="h-8 w-64" /><Skeleton className="h-4 w-96 max-w-full" /></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-32" />)}</div>
      <div className="grid gap-6 lg:grid-cols-3"><Skeleton className="h-72 lg:col-span-2" /><Skeleton className="h-72" /></div>
    </div>
  );
}

export function EmptyState({ title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white/70 px-6 py-14 text-center">
      <svg viewBox="0 0 160 72" className="mb-5 w-40" aria-hidden>
        <path d="M24 36h34M102 36h34" stroke="#c7d2fe" strokeWidth="3" strokeLinecap="round" strokeDasharray="2 7" />
        <circle cx="16" cy="36" r="9" fill="#e0e7ff" /><circle cx="144" cy="36" r="9" fill="#e0e7ff" />
        <rect x="58" y="20" width="44" height="32" rx="9" fill="#4f46e5" />
        <path d="M70 31h20M70 41h12" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" />
      </svg>
      <h3 className="font-display text-lg font-semibold text-ink-900">{title}</h3>
      <p className="mb-5 mt-1.5 max-w-sm text-sm leading-relaxed text-slate-500">{text}</p>
      {action}
    </div>
  );
}
export function ErrorBox({ error }) {
  return error ? <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null;
}
