import { useEffect, useMemo, useState } from 'react';
import { api } from '../../lib/api.js';
import { Card, Badge, Loading, ErrorBox, EmptyState } from '../../components/ui.jsx';
import { timeAgo, SectionIntro } from './shared.jsx';

// [label, severity, group]  severity: alert (red) | notice (amber) | info
const EVENTS = {
  login_success: ['Signed in', 'info', 'signins'],
  google_login: ['Signed in with Google', 'info', 'signins'],
  register: ['Account created', 'info', 'signins'],
  login_failed: ['Failed sign-in attempt', 'alert', 'security'],
  google_login_failed: ['Failed Google sign-in', 'alert', 'security'],
  login_blocked: ['Sign-in blocked (account locked)', 'alert', 'security'],
  account_locked: ['Account locked after repeated wrong passwords', 'alert', 'security'],
  rate_limited: ['Too many requests (blocked)', 'alert', 'security'],
  password_changed: ['Password changed', 'notice', 'security'],
  password_change_failed: ['Wrong current password when changing password', 'alert', 'security'],
  password_reset_by_admin: ['Password reset by an admin', 'notice', 'team'],
  logout_all: ['Signed out of all devices', 'notice', 'security'],
  user_created: ['Added a team member', 'notice', 'team'],
  user_deleted: ['Removed a team member', 'notice', 'team'],
  permission_changed: ['Changed someone’s role', 'notice', 'team'],
  process_deleted: ['Deleted a process', 'notice', 'data'],
  analysis_rules_changed: ['Changed the analysis rules', 'notice', 'data'],
  analysis_rules_reset: ['Reset the analysis rules', 'notice', 'data'],
  data_exported: ['Exported data', 'info', 'data'],
};
const FILTERS = [['all', 'All'], ['signins', 'Sign-ins'], ['security', 'Security alerts'], ['team', 'Team'], ['data', 'Data']];
const tone = { alert: 'red', notice: 'amber', info: 'slate' };

function detail(e) {
  const m = e.meta || {};
  if (e.action === 'process_deleted' && m.name) return `“${m.name}”`;
  if (e.action === 'permission_changed' && m.permission) return `now ${m.permission}`;
  if (e.action === 'user_created' && m.permission) return `as ${m.permission}`;
  if (e.action === 'data_exported') return `${m.processes ?? 0} process${m.processes === 1 ? '' : 'es'} as ${String(m.format || '').toUpperCase()}`;
  if (e.action === 'rate_limited' && m.path) return m.path;
  return '';
}

export default function Activity() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  useEffect(() => { api.audit().then(setRows).catch((e) => setError(e.message)); }, []);

  const shown = useMemo(() => (rows || []).filter((e) => filter === 'all' || (EVENTS[e.action]?.[2] ?? 'data') === filter), [rows, filter]);
  if (error) return <ErrorBox error={error} />;
  if (!rows) return <Loading />;

  return (
    <div className="space-y-6">
      <SectionIntro title="Activity log">Recent sign-ins and security-related changes in your company. Kept for 90 days. Showing the latest 100.</SectionIntro>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter activity">
        {FILTERS.map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)} aria-pressed={filter === id}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${filter === id ? 'border-brand-600 bg-brand-50 font-medium text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}>{label}</button>
        ))}
      </div>
      {shown.length === 0 ? <EmptyState title="Nothing here yet" text="Activity appears here as people sign in and make changes." /> : (
        <Card flush>
          <ul className="divide-y divide-slate-100">
            {shown.map((e) => {
              const [label, severity] = EVENTS[e.action] || [e.action.replaceAll('_', ' '), 'info'];
              return (
                <li key={e._id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm">
                  <span className="w-44 shrink-0 text-slate-400" title={new Date(e.createdAt).toLocaleString()}>{timeAgo(e.createdAt)}</span>
                  <span className="min-w-0 flex-1"><Badge tone={tone[severity]}>{label}</Badge>{detail(e) && <span className="ml-2 text-slate-500">{detail(e)}</span>}</span>
                  <span className="shrink-0 text-slate-600">{e.user?.name || <span className="text-slate-300">unknown</span>}</span>
                  <span className="w-28 shrink-0 text-right font-mono text-xs text-slate-400" title={e.userAgent}>{e.ip?.replace('::ffff:', '')}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </div>
  );
}
