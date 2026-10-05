import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Workflow, Eye, Compass, Activity, GitCompare } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';
import { Button, Field, TextInput, ErrorBox } from '../components/ui.jsx';

const points = [
  [Compass, 'Discover', 'Describe how work really happens in plain words.'],
  [Workflow, 'Visualize', 'Turn it into an editable flow diagram.'],
  [Activity, 'Analyze', 'Find manual work, bottlenecks and handoffs, with a health score.'],
  [GitCompare, 'Improve', 'Create a TO-BE process and compare it with today.'],
];

export default function Login() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', businessName: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { mode === 'login' ? await login(form.email, form.password) : await register(form); }
    catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-center bg-brand-700 p-14 text-white lg:flex">
        <div className="mb-8 flex items-center gap-3"><div className="rounded-lg bg-white/15 p-2"><Workflow size={26} /></div><span className="text-2xl font-semibold">FlowLens</span></div>
        <h2 className="mb-3 text-3xl font-semibold leading-tight">Know your processes.<br />Improve them with confidence.</h2>
        <p className="mb-10 max-w-md text-brand-100">Process discovery and improvement for small and medium businesses.</p>
        <ul className="space-y-5">{points.map(([Icon, t, d]) => (
          <li key={t} className="flex gap-3"><Icon size={20} className="mt-0.5 shrink-0 text-brand-100" /><div><p className="font-medium">{t}</p><p className="text-sm text-brand-100">{d}</p></div></li>))}
        </ul>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="w-full max-w-sm">
          <div className="mb-6 flex items-center gap-2 lg:hidden"><div className="rounded-lg bg-brand-600 p-1.5 text-white"><Workflow size={20} /></div><span className="text-lg font-semibold">FlowLens</span></div>
          <h1 className="text-2xl font-semibold text-slate-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">{mode === 'login' ? 'Sign in to manage your business processes.' : 'Set up your business workspace in a minute.'}</p>
          <ErrorBox error={error} />
          <div className="space-y-4">
            {mode === 'register' && <>
              <Field label="Your name"><TextInput required value={form.name} onChange={set('name')} autoComplete="name" /></Field>
              <Field label="Business name"><TextInput required value={form.businessName} onChange={set('businessName')} /></Field>
            </>}
            <Field label="Email"><TextInput type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></Field>
            <Field label="Password" hint={mode === 'register' ? 'At least 6 characters' : undefined}>
              <div className="relative">
                <TextInput type={show ? 'text' : 'password'} required minLength={mode === 'register' ? 6 : undefined} value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"><Eye size={16} /></button>
              </div>
            </Field>
          </div>
          <Button type="submit" disabled={busy} className="mt-6 w-full">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</Button>
          {mode === 'login' && (
            <button type="button" onClick={() => setForm({ ...form, email: 'demo@flowlens.app', password: 'demo1234' })} className="mt-3 w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-600 hover:bg-slate-50">
              Fill in demo account (demo@flowlens.app)
            </button>
          )}
          <p className="mt-6 text-center text-sm text-slate-500">
            {mode === 'login' ? 'New to FlowLens?' : 'Already have an account?'}{' '}
            <button type="button" className="font-medium text-brand-600 hover:underline" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
              {mode === 'login' ? 'Create an account' : 'Sign in'}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
