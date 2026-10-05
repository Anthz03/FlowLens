import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, UserRound, Target, ArrowLeft, ArrowRight, Check, Plus } from 'lucide-react';
import { api } from '../lib/api.js';
import Logo from '../components/Logo.jsx';
import { useAuth } from '../lib/auth.jsx';
import { Button, Field, TextInput, TextArea, Select, ErrorBox } from '../components/ui.jsx';
import { DEPARTMENTS } from '../lib/constants.js';

const INDUSTRIES = ['Retail & Wholesale', 'Food & Beverage', 'Manufacturing', 'Professional Services', 'Healthcare', 'Education & Training', 'Construction', 'Logistics & Transport', 'Technology / IT', 'Other'];
const SIZES = ['Just me', '2–10 people', '11–50 people', '51–250 people'];
const ROLES = ['Owner / Founder', 'Manager', 'Operations / Process lead', 'Team member', 'Consultant', 'Student / Teacher', 'Other'];
const SOURCES = ['Search engine (Google, Bing…)', 'Social media', 'Friend or colleague', 'School or training', 'Event or webinar', 'Other'];
const GOALS = ['Write down how we work', 'Find problems and delays', 'Reduce manual work', 'Make clear who is responsible', 'Plan and compare improvements', 'Train new employees'];
const DOCS = ['It is not written down (people just know)', 'Spreadsheets', 'Chat or messaging apps', 'Paper or notes', 'Word / PDF documents', 'Business software (ERP, CRM)'];

// Selectable pill buttons; `multi` allows several answers.
function Choices({ options, value, onChange, multi, label }) {
  const selected = (o) => (multi ? value.includes(o) : value === o);
  const toggle = (o) => onChange(multi ? (value.includes(o) ? value.filter((x) => x !== o) : [...value, o]) : o);
  return (
    <div role={multi ? 'group' : 'radiogroup'} aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => (
        <button key={o} type="button" role={multi ? 'checkbox' : 'radio'} aria-checked={selected(o)} onClick={() => toggle(o)}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-colors ${selected(o) ? 'border-brand-600 bg-brand-50 font-medium text-brand-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50'}`}>
          {selected(o) && <Check size={14} />}{o}
        </button>
      ))}
    </div>
  );
}

const STEPS = [
  { icon: Building2, title: 'Tell us about your company', sub: 'This helps us set up FlowLens for your business.' },
  { icon: UserRound, title: 'A little about you', sub: 'Two quick questions.' },
  { icon: Target, title: 'What do you want to achieve?', sub: 'We will suggest the best place to start.' },
];

export default function Onboarding() {
  const { user, setUser } = useAuth();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [custom, setCustom] = useState('');
  const [sourceOther, setSourceOther] = useState('');
  const [f, setF] = useState({
    businessName: user.business?.name || '', industry: user.business?.industry || '', size: '', departments: user.business?.departments?.length ? user.business.departments : [],
    jobRole: '', source: '', goals: [], documentation: [], challenge: '',
  });
  const set = (k) => (v) => { setError(''); setF((p) => ({ ...p, [k]: v })); };

  const addDept = () => {
    const d = custom.trim();
    if (d && !f.departments.includes(d)) set('departments')([...f.departments, d]);
    setCustom('');
  };

  const validate = () => {
    if (step === 0 && !f.businessName.trim()) return 'Please enter your company name.';
    if (step === 0 && !f.industry) return 'Please choose the industry that fits best.';
    if (step === 0 && !f.size) return 'Please choose your company size.';
    if (step === 1 && !f.jobRole) return 'Please choose your role.';
    if (step === 1 && !f.source) return 'Please tell us where you found FlowLens.';
    if (step === 1 && f.source === 'Other' && !sourceOther.trim()) return 'Please write where you found FlowLens.';
    return '';
  };
  const next = () => { const e = validate(); setError(e); if (!e) setStep(step + 1); };

  const finish = async (skip = false) => {
    setBusy(true); setError('');
    try {
      const body = skip ? { skip: true } : { ...f, source: f.source === 'Other' ? `Other: ${sourceOther.trim()}` : f.source };
      const { user: u } = await api.saveOnboarding(body);
      setUser(u);
      nav('/', { replace: true });
    } catch (e) { setError(e.message); setBusy(false); }
  };

  const { icon: Icon, title, sub } = STEPS[step];
  const depts = [...new Set([...DEPARTMENTS, ...f.departments])];

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Logo className="h-9 w-auto" />
          <button onClick={() => finish(true)} disabled={busy} className="text-sm text-slate-500 hover:text-slate-700 hover:underline">Skip for now</button>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-3 text-xs font-medium text-brand-600">Welcome, {user.name.split(' ')[0]}! · Step {step + 1} of {STEPS.length}</p>
          <div className="mb-6 flex gap-1.5">{STEPS.map((_, i) => <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-brand-600' : 'bg-slate-200'}`} />)}</div>
          <div className="mb-6 flex items-start gap-3">
            <div className="rounded-lg bg-brand-50 p-2.5 text-brand-600"><Icon size={22} /></div>
            <div><h1 className="text-xl font-semibold text-slate-900">{title}</h1><p className="text-sm text-slate-500">{sub}</p></div>
          </div>
          <ErrorBox error={error} />

          {step === 0 && (
            <div className="space-y-5">
              <Field label="What is your company called?"><TextInput value={f.businessName} onChange={(e) => set('businessName')(e.target.value)} autoFocus /></Field>
              <Field label="What kind of business is it?"><Select placeholder="Choose one…" options={INDUSTRIES} value={f.industry} onChange={(e) => set('industry')(e.target.value)} /></Field>
              <div><span className="mb-2 block text-sm font-medium text-slate-700">How many people work there?</span><Choices label="Company size" options={SIZES} value={f.size} onChange={set('size')} /></div>
              <div>
                <span className="mb-1 block text-sm font-medium text-slate-700">Which departments or teams do you have?</span>
                <p className="mb-2 text-xs text-slate-400">Pick all that apply. You can add your own.</p>
                <Choices multi label="Departments" options={depts} value={f.departments} onChange={set('departments')} />
                <div className="mt-3 flex max-w-sm gap-2">
                  <input value={custom} onChange={(e) => setCustom(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addDept())} placeholder="Add another team…" aria-label="Add another team"
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100" />
                  <Button variant="secondary" size="sm" onClick={addDept}><Plus size={14} />Add</Button>
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <div><span className="mb-2 block text-sm font-medium text-slate-700">What is your role?</span><Choices label="Your role" options={ROLES} value={f.jobRole} onChange={set('jobRole')} /></div>
              <div>
                <span className="mb-2 block text-sm font-medium text-slate-700">Where did you find FlowLens?</span>
                <Choices label="Where you found FlowLens" options={SOURCES} value={f.source} onChange={set('source')} />
                {f.source === 'Other' && <div className="mt-3 max-w-sm"><TextInput value={sourceOther} onChange={(e) => setSourceOther(e.target.value)} placeholder="Where did you hear about us?" aria-label="Other source" /></div>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div><span className="mb-2 block text-sm font-medium text-slate-700">What do you want to do with FlowLens?</span><p className="mb-2 text-xs text-slate-400">Pick all that apply.</p>
                <Choices multi label="Goals" options={GOALS} value={f.goals} onChange={set('goals')} /></div>
              <div><span className="mb-2 block text-sm font-medium text-slate-700">How are your processes written down today?</span>
                <Choices multi label="Current documentation" options={DOCS} value={f.documentation} onChange={set('documentation')} /></div>
              <Field label="What is the biggest daily problem in your work? (optional)"><TextArea value={f.challenge} onChange={(e) => set('challenge')(e.target.value)} placeholder="Example: Orders get lost between sales and the warehouse." /></Field>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            {step > 0 ? <Button variant="secondary" onClick={() => { setError(''); setStep(step - 1); }}><ArrowLeft size={16} />Back</Button> : <span />}
            {step < STEPS.length - 1
              ? <Button onClick={next}>Next<ArrowRight size={16} /></Button>
              : <Button onClick={() => finish(false)} disabled={busy}>{busy ? 'Setting up…' : <>Finish setup<Check size={16} /></>}</Button>}
          </div>
        </div>
      </div>
    </div>
  );
}
