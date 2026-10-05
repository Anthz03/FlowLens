import { useEffect, useState } from 'react';
import { UserPlus, KeyRound, Trash2, ShieldCheck } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { Card, Button, Field, TextInput, Select, Modal, ConfirmModal, DataTable, Loading, ErrorBox, Notice } from '../../components/ui.jsx';
import { Avatar, RoleBadge, CopyButton, ROLE_INFO, rank, SectionIntro } from './shared.jsx';

// Shown once, right after someone is added or their password is reset.
function Credentials({ info, onClose }) {
  if (!info) return null;
  const text = `FlowLens sign-in\nEmail: ${info.email}\nTemporary password: ${info.password}\nPlease change it in Settings > Security after you sign in.`;
  return (
    <Modal open title={info.title} onClose={onClose} footer={<><CopyButton text={text} label="Copy details" /><Button onClick={onClose}>Done</Button></>}>
      <p className="mb-4 text-sm leading-relaxed text-slate-600">Share this with <b>{info.name}</b> in a private message. <b>It is shown only once</b>, and they should change it after signing in.</p>
      <dl className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm ring-1 ring-inset ring-slate-100">
        <div><dt className="text-xs text-slate-400">Email</dt><dd className="font-medium text-ink-900">{info.email}</dd></div>
        <div><dt className="text-xs text-slate-400">Temporary password</dt><dd className="select-all font-mono text-base font-semibold text-ink-900">{info.password}</dd></div>
      </dl>
    </Modal>
  );
}

export default function Team() {
  const { user: me } = useAuth();
  const [people, setPeople] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', role: '', permission: 'member' });
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const [creds, setCreds] = useState(null);
  const [toRemove, setToRemove] = useState(null);
  const [toReset, setToReset] = useState(null);

  const load = () => api.users().then(setPeople).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  if (!people) return error ? <ErrorBox error={error} /> : <Loading />;

  const isOwner = me.permission === 'owner';
  const canManage = (p) => p._id !== me._id && (isOwner || rank(p.permission) < rank(me.permission));
  const run = async (fn, okText) => { setError(''); try { await fn(); if (okText) setNotice(okText); await load(); } catch (e) { setError(e.message); } };

  const add = async (e) => {
    e.preventDefault(); setFormError(''); setBusy(true);
    try {
      const r = await api.createUser({ name: form.name.trim(), email: form.email.trim(), role: form.role.trim(), permission: form.permission });
      setAdding(false);
      setCreds({ title: 'Person added', name: r.user.name, email: r.user.email, password: r.temporaryPassword });
      setForm({ name: '', email: '', role: '', permission: 'member' });
      await load();
    } catch (err) { setFormError(err.message); }
    setBusy(false);
  };

  const columns = [
    { header: 'Person', render: (p) => <div className="flex items-center gap-3"><Avatar name={p.name} size={36} /><div className="min-w-0"><p className="truncate font-medium text-ink-900">{p.name}{p._id === me._id && <span className="ml-2 text-xs font-normal text-slate-400">you</span>}</p><p className="truncate text-xs text-slate-500">{p.email}</p></div></div> },
    { header: 'Job title', render: (p) => p.role || <span className="text-slate-300">—</span> },
    { header: 'Role', render: (p) => (isOwner && canManage(p)
      ? <Select aria-label={`Role for ${p.name}`} value={p.permission} onChange={(e) => run(() => api.updateUser(p._id, { permission: e.target.value }), `${p.name} is now ${ROLE_INFO[e.target.value].label.toLowerCase()}.`)} options={Object.entries(ROLE_INFO).map(([value, v]) => ({ value, label: v.label }))} />
      : <RoleBadge permission={p.permission} />) },
    { header: '', className: 'text-right', render: (p) => canManage(p) && (
      <div className="flex justify-end gap-1">
        <button onClick={() => setToReset(p)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"><KeyRound size={14} />Reset password</button>
        <button onClick={() => setToRemove(p)} aria-label={`Remove ${p.name}`} className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={15} /></button>
      </div>) },
  ];

  return (
    <div className="space-y-6">
      <SectionIntro title="Team and roles">Add the people who work on processes with you, and choose what each person can do.</SectionIntro>
      <ErrorBox error={error} />
      <Notice tone="success">{notice}</Notice>
      <Card title={`People (${people.length})`} action={<Button size="sm" onClick={() => { setNotice(''); setAdding(true); }}><UserPlus size={14} />Add person</Button>} flush>
        <DataTable rows={people} columns={columns} />
      </Card>
      <Card title="What each role can do">
        <ul className="grid gap-3 sm:grid-cols-3">
          {Object.entries(ROLE_INFO).map(([k, v]) => <li key={k} className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600 ring-1 ring-inset ring-slate-100"><span className="mb-2 flex items-center gap-2 font-medium text-ink-900"><ShieldCheck size={15} className="text-brand-600" />{v.label}</span>{v.text}</li>)}
        </ul>
      </Card>

      <Modal open={adding} onClose={() => setAdding(false)} title="Add a person"
        footer={<><Button variant="secondary" onClick={() => setAdding(false)}>Cancel</Button><Button onClick={add} disabled={busy || !form.name.trim() || !form.email.trim()}>{busy ? 'Adding…' : 'Add person'}</Button></>}>
        <form onSubmit={add} className="space-y-4">
          <ErrorBox error={formError} />
          <Field label="Name"><TextInput value={form.name} maxLength={80} onChange={(e) => setForm({ ...form, name: e.target.value })} autoFocus /></Field>
          <Field label="Email" hint="They sign in with this email."><TextInput type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Job title (optional)"><TextInput value={form.role} maxLength={80} onChange={(e) => setForm({ ...form, role: e.target.value })} /></Field>
          <Field label="Role" hint={ROLE_INFO[form.permission].text}>
            <Select value={form.permission} onChange={(e) => setForm({ ...form, permission: e.target.value })} options={[{ value: 'member', label: 'Member' }, ...(isOwner ? [{ value: 'admin', label: 'Admin' }] : [])]} />
          </Field>
          <button type="submit" className="hidden" />
        </form>
      </Modal>

      <Credentials info={creds} onClose={() => setCreds(null)} />
      <ConfirmModal open={!!toRemove} title="Remove this person?" message={`${toRemove?.name} will lose access to ${me.business?.name || 'the company'} immediately. Processes they created stay.`} confirmLabel="Remove"
        onConfirm={() => { const p = toRemove; setToRemove(null); run(() => api.deleteUser(p._id), `${p.name} was removed.`); }} onClose={() => setToRemove(null)} />
      <ConfirmModal open={!!toReset} title="Reset password?" message={`${toReset?.name} will be signed out everywhere and get a new one-time password. If their account was locked, it is unlocked.`} confirmLabel="Reset password"
        onConfirm={async () => { const p = toReset; setToReset(null); await run(async () => { const r = await api.resetPassword(p._id); setCreds({ title: 'New temporary password', name: p.name, email: p.email, password: r.temporaryPassword }); }); }} onClose={() => setToReset(null)} />
    </div>
  );
}
