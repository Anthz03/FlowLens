import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { api } from '../../lib/api.js';
import { useAuth } from '../../lib/auth.jsx';
import { Card, Field, TextInput, Select, Button, Notice, Loading, ErrorBox } from '../../components/ui.jsx';
import { Choices, INDUSTRIES, SIZES } from '../Onboarding.jsx';
import { DEPARTMENTS } from '../../lib/constants.js';
import { useFlash, SectionIntro } from './shared.jsx';

export default function Company() {
  const { user, setUser } = useAuth();
  const [biz, setBiz] = useState(null);
  const [form, setForm] = useState(null);
  const [custom, setCustom] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [msg, flash] = useFlash();

  useEffect(() => {
    api.businesses().then(([b]) => { setBiz(b); setForm({ name: b.name || '', industry: b.industry || '', size: b.size || '', departments: b.departments || [] }); }).catch((e) => setError(e.message));
  }, []);
  if (error) return <ErrorBox error={error} />;
  if (!form) return <Loading />;

  const dirty = JSON.stringify(form) !== JSON.stringify({ name: biz.name || '', industry: biz.industry || '', size: biz.size || '', departments: biz.departments || [] });
  const depts = [...new Set([...DEPARTMENTS, ...form.departments])];
  const addDept = () => { const d = custom.trim(); if (d && !form.departments.includes(d)) setForm({ ...form, departments: [...form.departments, d] }); setCustom(''); };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return flash('Please enter the company name.', 'error');
    setSaving(true);
    try {
      const updated = await api.updateBusiness(biz._id, { name: form.name.trim(), industry: form.industry, size: form.size, departments: form.departments });
      setBiz(updated);
      setUser({ ...user, business: { ...user.business, ...updated } });
      flash('Company details saved.');
    } catch (err) { flash(err.message, 'error'); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <SectionIntro title="Company">Your company details. The department list appears as suggestions when you create processes and steps.</SectionIntro>
      <Card>
        <form onSubmit={save} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Company name"><TextInput value={form.name} maxLength={120} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
            <Field label="Type of business"><Select placeholder="Choose one…" options={INDUSTRIES} value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} /></Field>
          </div>
          <div><span className="mb-2 block text-sm font-medium text-slate-700">Company size</span><Choices label="Company size" options={SIZES} value={form.size} onChange={(v) => setForm({ ...form, size: v })} /></div>
          <div>
            <span className="mb-1 block text-sm font-medium text-slate-700">Departments and teams</span>
            <p className="mb-2 text-xs text-slate-400">Pick all that apply, or add your own.</p>
            <Choices multi label="Departments" options={depts} value={form.departments} onChange={(v) => setForm({ ...form, departments: v })} />
            <div className="mt-3 flex max-w-sm gap-2">
              <TextInput value={custom} maxLength={60} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDept())} placeholder="Add another team…" aria-label="Add another team" />
              <Button variant="secondary" size="sm" onClick={addDept}><Plus size={14} />Add</Button>
            </div>
          </div>
          <Notice tone={msg?.tone}>{msg?.text}</Notice>
          <div className="flex justify-end"><Button type="submit" disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save company details'}</Button></div>
        </form>
      </Card>
    </div>
  );
}
