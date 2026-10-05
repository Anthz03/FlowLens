import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Loader2, Inbox } from 'lucide-react';
import { scoreColor, scoreLabel } from '../lib/constants.js';

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

export function Card({ title, action, children, className = '', tour }) {
  return (
    <section data-tour={tour} className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      {(title || action) && (
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
          {action}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const btn = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700',
  secondary: 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-600 hover:bg-slate-100',
};
export function Button({ variant = 'primary', size = 'md', to, className = '', children, ...props }) {
  const cls = `inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 ${size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm'} ${btn[variant]} ${className}`;
  return to ? <Link to={to} className={cls} {...props}>{children}</Link> : <button type="button" className={cls} {...props}>{children}</button>;
}

export function StatCard({ icon: Icon, label, value, hint, tone = 'brand' }) {
  const tones = { brand: 'bg-brand-50 text-brand-600', green: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', red: 'bg-red-50 text-red-600' };
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`rounded-lg p-3 ${tones[tone]}`}><Icon size={22} /></div>
      <div>
        <p className="text-sm text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900">{value}</p>
        {hint && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}

export function Badge({ children, tone = 'slate' }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700', green: 'bg-emerald-50 text-emerald-700', amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700', blue: 'bg-sky-50 text-sky-700', brand: 'bg-brand-50 text-brand-700',
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

export const statusTone = { draft: 'amber', active: 'green', archived: 'slate' };

// ---- Score indicators ----
export function ScoreRing({ score, size = 140, label = true }) {
  const r = 52, c = 2 * Math.PI * r, color = scoreColor(score);
  return (
    <div className="relative inline-flex flex-col items-center" style={{ width: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} role="img" aria-label={`Health score ${score} out of 100`}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle cx="60" cy="60" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - score / 100)} transform="rotate(-90 60 60)" />
        <text x="60" y="58" textAnchor="middle" className="fill-slate-900" fontSize="28" fontWeight="600">{score}</text>
        <text x="60" y="76" textAnchor="middle" className="fill-slate-400" fontSize="10">/ 100</text>
      </svg>
      {label && <span className="-mt-2 text-xs font-medium" style={{ color }}>{scoreLabel(score)}</span>}
    </div>
  );
}

export function ScoreBar({ label, value }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm"><span className="text-slate-600">{label}</span><span className="font-medium text-slate-900">{value}</span></div>
      <div className="h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full" style={{ width: `${value}%`, background: scoreColor(value) }} /></div>
    </div>
  );
}

export function ScoreBadge({ score }) {
  return <span className="rounded-md px-2 py-0.5 text-xs font-semibold text-white" style={{ background: scoreColor(score) }}>{score}/100</span>;
}

// ---- Analysis card ----
const sevTone = { high: 'red', medium: 'amber', low: 'slate' };
export function AnalysisCard({ icon: Icon, title, count, tone = 'amber', items, empty = 'No issues found.' }) {
  const colors = { amber: 'text-amber-600 bg-amber-50', red: 'text-red-600 bg-red-50', brand: 'text-brand-600 bg-brand-50', slate: 'text-slate-600 bg-slate-100' };
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`rounded-lg p-2 ${colors[tone]}`}><Icon size={18} /></div>
          <h3 className="font-semibold text-slate-900">{title}</h3>
        </div>
        <span className="text-xl font-semibold text-slate-900">{count}</span>
      </div>
      {items.length === 0 ? <p className="text-sm text-slate-400">{empty}</p> : (
        <ul className="space-y-2">
          {items.slice(0, 6).map((f, i) => (
            <li key={i} className="rounded-lg bg-slate-50 p-2.5 text-sm">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-slate-800">{f.title}</span>
                <Badge tone={sevTone[f.severity]}>{f.severity}</Badge>
              </div>
              <p className="mt-0.5 text-xs text-slate-500">{f.detail}</p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" className={`flex max-h-[90vh] w-full flex-col rounded-xl bg-white shadow-xl ${wide ? 'max-w-2xl' : 'max-w-md'}`} onMouseDown={(e) => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-3">
          <h2 className="font-semibold text-slate-900">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-slate-400 hover:bg-slate-100"><X size={18} /></button>
        </header>
        <div className="overflow-y-auto p-5">{children}</div>
        {footer && <footer className="flex justify-end gap-2 border-t border-slate-100 px-5 py-3">{footer}</footer>}
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
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}

// ---- Form fields ----
const input = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100';
export function Field({ label, hint, children, className = '' }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
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
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-brand-600" />
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
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            {columns.map((c) => <th key={c.header} className={`px-3 py-2 font-medium ${c.className || ''}`}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={columns.length} className="px-3 py-8 text-center text-slate-400">{empty}</td></tr>}
          {rows.map((r, i) => (
            <tr key={rowKey(r) ?? i} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
              {columns.map((c) => <td key={c.header} className={`px-3 py-2.5 align-middle ${c.className || ''}`}>{c.render ? c.render(r, i) : r[c.field]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Loading() {
  return <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 className="animate-spin" size={28} /></div>;
}
export function EmptyState({ title, text, action }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white py-14 text-center">
      <Inbox className="mb-3 text-slate-300" size={36} />
      <h3 className="font-medium text-slate-800">{title}</h3>
      <p className="mb-4 mt-1 max-w-sm text-sm text-slate-500">{text}</p>
      {action}
    </div>
  );
}
export function ErrorBox({ error }) {
  return error ? <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null;
}
