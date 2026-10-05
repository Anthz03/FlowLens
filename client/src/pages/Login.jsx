import { useEffect, useRef, useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Workflow, Eye, Compass, Activity, GitCompare } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';
import { api } from '../lib/api.js';
import Logo from '../components/Logo.jsx';
import { Button, Field, TextInput, ErrorBox } from '../components/ui.jsx';

const points = [
  [Compass, 'Discover', 'Describe how work really happens in plain words.'],
  [Workflow, 'Visualize', 'Turn it into an editable flow diagram.'],
  [Activity, 'Analyze', 'Find manual work, bottlenecks and handoffs, with a health score.'],
  [GitCompare, 'Improve', 'Create a TO-BE process and compare it with today.'],
];

let gsiPromise;
const loadGoogleScript = () => (gsiPromise ||= new Promise((resolve, reject) => {
  if (window.google?.accounts?.id) return resolve();
  const s = document.createElement('script');
  s.src = 'https://accounts.google.com/gsi/client';
  s.async = true;
  s.onload = resolve;
  s.onerror = () => { gsiPromise = null; reject(new Error('Could not load Google.')); };
  document.head.appendChild(s);
}));

// Renders Google's official button, but only when the server has a GOOGLE_CLIENT_ID configured.
function GoogleButton({ mode, onCredential, onError }) {
  const [clientId, setClientId] = useState(null);
  const box = useRef(null);
  const cb = useRef(onCredential);
  cb.current = onCredential;

  useEffect(() => { api.authConfig().then((c) => setClientId(c.googleClientId)).catch(() => {}); }, []);
  useEffect(() => {
    if (!clientId || !box.current) return undefined;
    let cancelled = false;
    loadGoogleScript().then(() => {
      if (cancelled || !box.current) return;
      window.google.accounts.id.initialize({ client_id: clientId, callback: (r) => cb.current(r.credential) });
      box.current.innerHTML = '';
      window.google.accounts.id.renderButton(box.current, {
        theme: 'outline', size: 'large', shape: 'rectangular', logo_alignment: 'center',
        text: mode === 'login' ? 'signin_with' : 'signup_with', width: Math.min(400, box.current.offsetWidth || 340),
      });
    }).catch(() => onError('Could not load Google sign-in. Check your internet connection.'));
    return () => { cancelled = true; };
  }, [clientId, mode]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!clientId) return null;
  return (
    <div className="mt-5">
      <div className="mb-4 flex items-center gap-3 text-xs text-slate-400"><span className="h-px flex-1 bg-slate-200" />or<span className="h-px flex-1 bg-slate-200" /></div>
      <div ref={box} className="flex min-h-10 justify-center" />
    </div>
  );
}

export default function Login() {
  const { user, login, register, loginWithGoogle } = useAuth();
  const [params] = useSearchParams();
  const [mode, setMode] = useState(params.get('mode') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ name: '', businessName: '', email: params.get('demo') ? 'demo@flowlens.app' : '', password: params.get('demo') ? 'demo1234' : '' });
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const googleLogin = async (credential) => {
    setBusy(true); setError('');
    try { await loginWithGoogle(credential); }
    catch (err) { setError(err.message); setBusy(false); }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try { mode === 'login' ? await login(form.email, form.password) : await register(form); }
    catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-center relative overflow-hidden bg-gradient-to-br from-ink-900 via-ink-900 to-ink-800 p-14 text-white lg:flex">
        <svg aria-hidden viewBox="0 0 400 300" className="pointer-events-none absolute -bottom-28 -right-28 w-[34rem] opacity-[0.10]" fill="none" stroke="#A5B4FC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M60 270V110a30 30 0 0 1 30-30h210" /><path d="M60 180h140" /><path d="M200 180v50h130" /><path d="M300 80v60h80" />
          <circle cx="320" cy="80" r="15" fill="#A5B4FC" /><circle cx="220" cy="180" r="15" fill="#A5B4FC" /><circle cx="350" cy="230" r="15" fill="#A5B4FC" /><circle cx="390" cy="140" r="15" fill="#A5B4FC" />
        </svg>
        <Logo className="relative mb-10 h-12 w-auto self-start" markColor="#FFFFFF" textColor="#FFFFFF" />
        <h2 className="relative mb-4 text-4xl font-semibold leading-[1.1] tracking-tight">Know your processes.<br />Improve them with confidence.</h2>
        <p className="mb-10 max-w-md text-brand-100">Process discovery and improvement for small and medium businesses.</p>
        <ul className="space-y-5">{points.map(([Icon, t, d]) => (
          <li key={t} className="flex gap-3"><Icon size={20} className="mt-0.5 shrink-0 text-brand-100" /><div><p className="font-medium">{t}</p><p className="text-sm text-brand-100">{d}</p></div></li>))}
        </ul>
      </div>
      <div className="flex items-center justify-center p-6">
        <form onSubmit={submit} className="anim-fade-up w-full max-w-sm">
          <Logo className="mb-6 h-9 w-auto lg:hidden" />
          <h1 className="text-2xl font-semibold text-slate-900">{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
          <p className="mb-6 mt-1 text-sm text-slate-500">{mode === 'login' ? 'Sign in to manage your business processes.' : 'Set up your business workspace in a minute.'}</p>
          <ErrorBox error={error} />
          <div className="space-y-4">
            {mode === 'register' && <>
              <Field label="Your name"><TextInput required value={form.name} onChange={set('name')} autoComplete="name" /></Field>
              <Field label="Business name"><TextInput required value={form.businessName} onChange={set('businessName')} /></Field>
            </>}
            <Field label="Email"><TextInput type="email" required value={form.email} onChange={set('email')} autoComplete="email" /></Field>
            <Field label="Password" hint={mode === 'register' ? 'At least 8 characters, with a letter and a number' : undefined}>
              <div className="relative">
                <TextInput type={show ? 'text' : 'password'} required minLength={mode === 'register' ? 8 : undefined} value={form.password} onChange={set('password')} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} />
                <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"><Eye size={16} /></button>
              </div>
            </Field>
          </div>
          <Button type="submit" disabled={busy} className="mt-6 w-full">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}</Button>
          <GoogleButton mode={mode} onCredential={googleLogin} onError={setError} />
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
