import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, ClipboardList } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { Card, Field, TextInput, Button, Notice, Badge } from '../../components/ui.jsx';
import { Avatar, RoleBadge, ROLE_INFO, useFlash, SectionIntro } from './shared.jsx';

export default function Profile() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: user.name, role: user.role || '' });
  const [saving, setSaving] = useState(false);
  const [msg, flash] = useFlash();
  const dirty = form.name.trim() !== user.name || form.role.trim() !== (user.role || '');
  const ob = user.onboarding?.completed && !user.onboarding?.skipped ? user.onboarding : null;

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return flash('Please enter your name.', 'error');
    setSaving(true);
    try {
      const { user: u } = await api.updateProfile({ name: form.name.trim(), role: form.role.trim() });
      setUser(u);
      flash('Profile saved.');
    } catch (err) { flash(err.message, 'error'); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <SectionIntro title="Profile">How you appear to your team. Your email and role are managed by your company owner.</SectionIntro>
      <Card>
        <form onSubmit={save} className="space-y-5">
          <div className="flex items-center gap-4">
            <Avatar name={form.name || user.name} size={56} />
            <div><p className="font-display text-lg font-semibold text-ink-900">{user.name}</p><div className="mt-1 flex items-center gap-2"><RoleBadge permission={user.permission} /><span className="text-sm text-slate-500">{user.business?.name}</span></div></div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name"><TextInput value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Job title" hint="For example: Operations Manager"><TextInput value={form.role} maxLength={80} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
            <Field label="Email" hint="Used to sign in. It cannot be changed here."><TextInput value={user.email} disabled readOnly className="cursor-not-allowed bg-slate-50 text-slate-500" /></Field>
          </div>
          <Notice tone={msg?.tone}>{msg?.text}</Notice>
          <div className="flex justify-end"><Button type="submit" disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save profile'}</Button></div>
        </form>
      </Card>

      <Card title="Your role">
        <p className="text-sm leading-relaxed text-slate-600"><b className="text-ink-900">{ROLE_INFO[user.permission]?.label}</b>: {ROLE_INFO[user.permission]?.text}</p>
        <ul className="mt-3 grid gap-2 text-sm text-slate-500 sm:grid-cols-3">
          {['owner', 'admin', 'member'].map((r) => <li key={r} className={`rounded-xl p-3 ring-1 ring-inset ${r === user.permission ? 'bg-brand-50 ring-brand-200' : 'bg-slate-50 ring-slate-100'}`}><span className="mb-1 block"><RoleBadge permission={r} /></span>{ROLE_INFO[r].text}</li>)}
        </ul>
      </Card>

      <Card title="Setup and help">
        {ob ? (
          <div className="mb-5 space-y-2 text-sm text-slate-600">
            <p>You told us you want to: {(ob.goals || []).length ? (ob.goals || []).map((g) => <Badge key={g} tone="brand">{g}</Badge>).reduce((a, b) => [a, ' ', b]) : <i>no goals chosen</i>}</p>
            {ob.challenge && <p>Your biggest problem: <i>“{ob.challenge}”</i></p>}
          </div>
        ) : <p className="mb-5 text-sm text-slate-500">You skipped the setup questions. Answering them lets FlowLens suggest where to start.</p>}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => window.dispatchEvent(new Event('flowlens:start-tour'))}><GraduationCap size={16} />Replay the guided tour</Button>
          <Button variant="secondary" onClick={() => nav('/welcome?redo=1')}><ClipboardList size={16} />{ob ? 'Change my setup answers' : 'Answer the setup questions'}</Button>
        </div>
      </Card>
    </div>
  );
}
