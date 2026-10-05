import { useRef, useState, useEffect } from 'react';
import { Check, Copy } from 'lucide-react';
import { Badge, Button } from '../../components/ui.jsx';

export const RANK = { member: 1, admin: 2, owner: 3 };
export const rank = (p) => RANK[p] || 0;
export const ROLE_INFO = {
  owner: { label: 'Owner', tone: 'brand', text: 'Full control, including roles. A business always keeps at least one owner.' },
  admin: { label: 'Admin', tone: 'blue', text: 'Manages the team, company details, analysis rules and deleting processes.' },
  member: { label: 'Member', tone: 'slate', text: 'Creates and edits processes, runs analysis and exports data.' },
};

export const RoleBadge = ({ permission }) => <Badge tone={ROLE_INFO[permission]?.tone || 'slate'}>{ROLE_INFO[permission]?.label || permission}</Badge>;

export function Avatar({ name = '?', size = 40 }) {
  const initials = name.split(' ').filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || '?';
  return <span className="inline-flex shrink-0 items-center justify-center rounded-xl bg-ink-900 font-semibold text-white" style={{ width: size, height: size, fontSize: size * 0.36 }} aria-hidden>{initials}</span>;
}

// A message that appears after saving and fades after a few seconds.
export function useFlash(ms = 6000) {
  const [msg, setMsg] = useState(null);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = (text, tone = 'success') => {
    clearTimeout(timer.current);
    setMsg({ text, tone });
    if (tone === 'success') timer.current = setTimeout(() => setMsg(null), ms);
  };
  return [msg, flash, () => setMsg(null)];
}

export function CopyButton({ text, label = 'Copy' }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 1800); } catch { /* clipboard unavailable */ }
  };
  return <Button size="sm" variant="secondary" onClick={copy}>{done ? <><Check size={14} />Copied</> : <><Copy size={14} />{label}</>}</Button>;
}

export function SectionIntro({ title, children }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-xl font-semibold text-ink-900">{title}</h2>
      {children && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-slate-500">{children}</p>}
    </div>
  );
}

export function timeAgo(date) {
  const s = Math.max(1, Math.round((Date.now() - new Date(date).getTime()) / 1000));
  if (s < 60) return 'just now';
  const units = [[60, 'minute'], [3600, 'hour'], [86400, 'day']];
  let out = 'just now';
  for (const [secs, name] of units) if (s >= secs) { const n = Math.floor(s / secs); out = `${n} ${name}${n === 1 ? '' : 's'} ago`; }
  return s >= 86400 * 30 ? new Date(date).toLocaleDateString() : out;
}
