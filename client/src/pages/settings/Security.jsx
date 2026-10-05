import { useState } from 'react';
import { KeyRound, LogOut, Check, X, Globe } from 'lucide-react';
import { api, setToken } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { Card, Field, TextInput, Button, Notice, Badge, ConfirmModal } from '../../components/ui.jsx';
import { useFlash, SectionIntro } from './shared.jsx';

const rules = [
  ['At least 8 characters', (p) => p.length >= 8],
  ['A letter', (p) => /[A-Za-z]/.test(p)],
  ['A number', (p) => /\d/.test(p)],
];

export default function Security() {
  const { user, setUser, logout } = useAuth();
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [busy, setBusy] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);
  const [msg, flash] = useFlash();

  const ok = rules.every(([, test]) => test(form.next));
  const match = form.next && form.next === form.confirm;
  const ready = ok && match && (form.current || !user.hasPassword);

  const change = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api.changePassword({ currentPassword: form.current, newPassword: form.next });
      setToken(r.token); // this device stays signed in; every other device is signed out
      setUser(r.user);
      setForm({ current: '', next: '', confirm: '' });
      flash(user.hasPassword ? 'Password changed. Other devices were signed out.' : 'Password set. You can now sign in with your email and password too.');
    } catch (err) { flash(err.message, 'error'); }
    setBusy(false);
  };

  const signOutEverywhere = async () => {
    try { await api.logoutAll(); } catch { /* sign out locally either way */ }
    logout();
  };

  return (
    <div className="space-y-6">
      <SectionIntro title="Security">Keep your account safe. Sessions last 12 hours and refresh while you are active.</SectionIntro>

      <Card title="How you sign in">
        <ul className="divide-y divide-slate-100 text-sm">
          <li className="flex items-center justify-between py-3"><span className="flex items-center gap-3 text-slate-700"><KeyRound size={18} className="text-brand-600" />Email and password</span>{user.hasPassword ? <Badge tone="green">Set up</Badge> : <Badge tone="amber">Not set</Badge>}</li>
          <li className="flex items-center justify-between py-3"><span className="flex items-center gap-3 text-slate-700"><Globe size={18} className="text-brand-600" />Google</span>{user.hasGoogle ? <Badge tone="green">Linked</Badge> : <Badge>Not linked</Badge>}</li>
        </ul>
      </Card>

      <Card title={user.hasPassword ? 'Change password' : 'Set a password'}>
        <form onSubmit={change} className="max-w-md space-y-4">
          {user.hasPassword && <Field label="Current password"><TextInput type="password" autoComplete="current-password" value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} /></Field>}
          <Field label="New password"><TextInput type="password" autoComplete="new-password" value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} /></Field>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs" aria-label="Password requirements">
            {rules.map(([label, test]) => { const pass = test(form.next); return <li key={label} className={`flex items-center gap-1 ${pass ? 'text-emerald-600' : 'text-slate-400'}`}>{pass ? <Check size={13} /> : <X size={13} />}{label}</li>; })}
          </ul>
          <Field label="Confirm new password" hint={form.confirm && !match ? 'The passwords do not match yet.' : undefined}><TextInput type="password" autoComplete="new-password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} /></Field>
          <Notice tone={msg?.tone}>{msg?.text}</Notice>
          <Button type="submit" disabled={!ready || busy}>{busy ? 'Saving…' : user.hasPassword ? 'Change password' : 'Set password'}</Button>
        </form>
      </Card>

      <Card title="Sessions">
        <p className="max-w-xl text-sm leading-relaxed text-slate-600">Lost a laptop or used a shared computer? Sign out everywhere to end every session of your account on every device, including this one.</p>
        <Button variant="secondary" className="mt-4" onClick={() => setConfirmOut(true)}><LogOut size={16} />Sign out of all devices</Button>
      </Card>

      <ConfirmModal open={confirmOut} title="Sign out of all devices?" message="You will be signed out here too and will need to sign in again." confirmLabel="Sign out everywhere" onConfirm={signOutEverywhere} onClose={() => setConfirmOut(false)} />
    </div>
  );
}
