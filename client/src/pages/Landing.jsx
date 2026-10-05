import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { ArrowRight, Check, Compass, Workflow, Activity, GitCompare, Hand, Timer, Shuffle, UserX, Lock, MousePointerClick } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { ScoreRing, ScoreBar, Button } from '../components/ui.jsx';
import ProcessStrip, { StripLegend } from '../components/ProcessStrip.jsx';
import Reveal from '../components/Reveal.jsx';

const SIGN_UP = '/login?mode=register';
const DEMO = '/login?demo=1';

// ---- A small illustrative flow diagram (static, drawn in SVG) ----
function FlowDiagram({ className = '' }) {
  const Node = ({ x, y, w = 150, title, sub, color, slow, delay = 0 }) => (
    <g className="anim-pop" style={{ animationDelay: `${delay}ms` }}>
      <rect x={x} y={y} width={w} height="48" rx="12" fill="#fff" stroke={slow ? '#DC2626' : '#E2E8F0'} strokeWidth={slow ? 2 : 1.5} />
      <rect x={x} y={y} width="6" height="48" rx="3" fill={color} />
      <text x={x + 18} y={y + 20} fontSize="13" fontWeight="600" fill="#1E1B4B">{title}</text>
      <text x={x + 18} y={y + 37} fontSize="11" fill="#94A3B8">{sub}</text>
    </g>
  );
  const arrow = { stroke: '#CBD5E1', strokeWidth: 2, fill: 'none', markerEnd: 'url(#land-arrow)', strokeLinecap: 'round', strokeLinejoin: 'round' };
  const Arrow = ({ d, delay }) => <path d={d} {...arrow} pathLength="1" className="draw" style={{ animationDelay: `${delay}ms` }} />;
  return (
    <svg viewBox="0 0 440 440" className={className} role="img" aria-label="Example order process drawn as a flow diagram">
      <defs><marker id="land-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M1 1L9 5L1 9z" fill="#CBD5E1" /></marker></defs>
      <circle cx="215" cy="14" r="9" fill="#4F46E5" className="anim-pop" />
      <Arrow d="M215 24V44" delay={380} />
      <Node x={140} y={48} title="Receive order" sub="Sales Rep · Email" color="#F59E0B" delay={430} />
      <Arrow d="M215 96V120" delay={510} />
      <Node x={140} y={124} title="Enter in spreadsheet" sub="Sales Rep · Excel" color="#F59E0B" delay={560} />
      <Arrow d="M215 172V196" delay={640} />
      <g className="anim-pop" style={{ animationDelay: '800ms' }}><path d="M215 200L290 236L215 272L140 236Z" fill="#E0F2FE" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="5 4" />
      <text x="215" y="240" textAnchor="middle" fontSize="13" fontWeight="600" fill="#0C4A6E">In stock?</text></g>
      <Arrow d="M145 236H95V316" delay={770} /><text x="112" y="228" fontSize="11" fontWeight="600" fill="#64748B">No</text>
      <Arrow d="M285 236H335V316" delay={900} /><text x="305" y="228" fontSize="11" fontWeight="600" fill="#64748B">Yes</text>
      <Node x={20} y={320} w={150} title="Call the supplier" sub="Purchasing · Phone" color="#F59E0B" slow delay={690} />
      <Node x={260} y={320} w={150} title="Pack and ship" sub="Warehouse · System" color="#10B981" delay={820} />
      <Arrow d="M95 368V396H215V408" delay={1030} /><Arrow d="M335 368V396H215" delay={1160} />
      <circle cx="215" cy="424" r="9" fill="#1E1B4B" className="anim-pop" style={{ animationDelay: '1500ms' }} />
    </svg>
  );
}

function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-[520px] pb-10 pl-2 pr-2 lg:pl-8">
      <div className="absolute -right-6 -top-6 h-72 w-72 rounded-full bg-brand-200/50 blur-3xl" aria-hidden />
      <div className="anim-fade-up relative rotate-[1.2deg] rounded-3xl border border-slate-200/70 bg-white p-6 shadow-lift">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-display text-sm font-semibold text-ink-900">Customer order fulfillment</p>
          <span className="rounded-md bg-sky-50 px-1.5 py-0.5 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-200">AS-IS</span>
        </div>
        <FlowDiagram className="w-full" />
      </div>
      <div className="anim-float absolute -left-2 top-16 hidden rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-lift sm:block lg:-left-8">
        <p className="text-xs text-slate-400">Manual tasks</p>
        <p className="font-display text-2xl font-semibold text-ink-900">9 <span className="text-emerald-600">→ 4</span></p>
      </div>
      <div style={{ animationDelay: '-3s' }} className="anim-float absolute -bottom-0 right-0 flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white p-3 pr-5 shadow-lift lg:-right-4">
        <ScoreRing score={68} size={76} label={false} />
        <div><p className="text-xs text-slate-400">Health score</p><p className="text-sm font-semibold text-emerald-600">+19 with the TO-BE</p></div>
      </div>
    </div>
  );
}

const steps = [
  { n: '01', icon: Compass, title: 'Describe', text: 'Type what happens in plain words, or fill in a simple form. Say who does each step and which tool they use.' },
  { n: '02', icon: Workflow, title: 'See it', text: 'FlowLens draws the process as a diagram that you can change by dragging boxes and arrows.' },
  { n: '03', icon: Activity, title: 'Check it', text: 'Get a health score and a clear list of manual tasks, slow steps, repeated steps and steps with nobody in charge.' },
  { n: '04', icon: GitCompare, title: 'Improve it', text: 'Create a better version in one click, then compare today and tomorrow side by side.' },
];

function SectionTitle({ eyebrow, title, children, className = '' }) {
  return (
    <Reveal className={`max-w-2xl ${className}`}>
      <p className="text-sm font-semibold text-brand-600">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink-900 sm:text-4xl">{title}</h2>
      {children && <p className="mt-4 text-[17px] leading-relaxed text-slate-500">{children}</p>}
    </Reveal>
  );
}

const panel = 'rounded-3xl border border-slate-200/70 bg-white p-7 shadow-card';

export default function Landing() {
  const [demoEnabled, setDemoEnabled] = useState(false); // hidden until the server says the demo account exists
  useEffect(() => { api.authConfig().then((c) => setDemoEnabled(!!c.demoEnabled)).catch(() => {}); }, []);
  return (
    <div className="min-h-screen overflow-x-clip">
      <a href="#main" className="sr-only z-[200] rounded-lg bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-lift focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>

      <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-page/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label="FlowLens home"><Logo className="h-8 w-auto" /></Link>
          <nav aria-label="Main" className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#how" className="hover:text-ink-900">How it works</a>
            <a href="#features" className="hover:text-ink-900">Features</a>
            <a href="#who" className="hover:text-ink-900">Who it is for</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="rounded-xl px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100">Sign in</Link>
            <Button to={SIGN_UP} size="sm" className="!px-4 !py-2 !text-sm">Get started</Button>
          </div>
        </div>
      </header>

      <main id="main">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-20 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div className="stagger">
            <h1 className="mt-5 font-display text-[44px] font-semibold leading-[1.05] tracking-tight text-ink-900 sm:text-6xl">
              See how your business really works.<span className="text-brand-600"> Then make it work better.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500">
              FlowLens turns the way your team actually gets things done into clear diagrams, finds what slows the work down, and shows you a better way. No consultants and no jargon.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button to={SIGN_UP} className="!px-6 !py-3 !text-[15px]">Create a free account<ArrowRight size={16} /></Button>
              {demoEnabled && <Button to={DEMO} variant="secondary" className="!px-6 !py-3 !text-[15px]"><MousePointerClick size={16} />Try the demo</Button>}
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-500">
              {['Start by typing, no forms to learn', ...(demoEnabled ? ['Demo account with sample data'] : ['Guided tour on your first visit']), 'Each business sees only its own data'].map((t) => (
                <li key={t} className="flex items-center gap-1.5"><Check size={15} className="text-emerald-500" />{t}</li>
              ))}
            </ul>
          </div>
          <HeroVisual />
        </section>

        {/* Problem */}
        <section className="border-y border-slate-200/60 bg-white/60">
          <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
            <SectionTitle eyebrow="The problem" title="Most small businesses run on knowledge nobody wrote down.">
              Orders, approvals and hand-overs follow habits that only a few people know. It works until someone is away, a customer waits too long, or the business grows.
            </SectionTitle>
            <ul className="space-y-6 self-center">
              {[
                [UserX, 'Steps live in people’s heads', 'New staff learn by asking around, and answers change depending on who you ask.'],
                [Shuffle, 'The real process hides in spreadsheets and chat threads', 'Work passes between people many times, and nobody sees the whole picture.'],
                [Timer, 'Delays are felt, but not measured', 'You know things are slow, but not which step, or why.'],
              ].map(([Icon, t, d], i) => (
                <Reveal as="li" delay={i * 100} key={t} className="flex gap-4">
                  <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-card ring-1 ring-slate-200/60"><Icon size={18} /></span>
                  <div><p className="font-display text-lg font-semibold text-ink-900">{t}</p><p className="mt-1 leading-relaxed text-slate-500">{d}</p></div>
                </Reveal>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24">
          <SectionTitle eyebrow="How it works" title="From “how do we do this?” to a better process in four steps." />
          <ol className="mt-14 grid gap-x-12 gap-y-10 md:grid-cols-2">
            {steps.map((s, i) => (
              <Reveal as="li" delay={i * 110} key={s.n} className={`relative flex gap-5 ${i % 2 ? 'md:mt-10' : ''}`}>
                <span className="font-display text-5xl font-semibold leading-none text-brand-200">{s.n}</span>
                <div>
                  <p className="flex items-center gap-2 font-display text-xl font-semibold text-ink-900"><s.icon size={18} className="text-brand-600" />{s.title}</p>
                  <p className="mt-2 max-w-md leading-relaxed text-slate-500">{s.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* Features (asymmetric grid) */}
        <section id="features" className="scroll-mt-20 border-y border-slate-200/60 bg-white/60">
          <div className="mx-auto max-w-6xl px-5 py-24">
            <SectionTitle eyebrow="What you get" title="Everything you need to understand and improve a process.">
              Examples below use a sample order process.{demoEnabled ? ' You can open it in the demo.' : ''}
            </SectionTitle>
            <div className="mt-12 grid gap-6 lg:grid-cols-6">
              <Reveal as="article" delay={0} className={`${panel} lg:col-span-4`}>
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-600"><Compass size={16} />Process Discovery</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-ink-900">Describe it the way you would explain it to a new hire</h3>
                <div className="mt-6 grid items-center gap-5 sm:grid-cols-[1fr_auto_1fr]">
                  <div className="rounded-2xl bg-slate-50 p-4 font-mono text-[12.5px] leading-relaxed text-slate-600 ring-1 ring-inset ring-slate-100">
                    <p>Sales Rep: enters the order into Excel</p><p>Warehouse Clerk: checks stock</p><p>Is the item in stock?</p><p>Accountant: issues the invoice</p>
                  </div>
                  <ArrowRight className="mx-auto hidden text-brand-400 sm:block" />
                  <div className="space-y-3 rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-100">
                    <ProcessStrip steps={[{ type: 'start', order: 0 }, { type: 'task', isManual: true, order: 1 }, { type: 'task', isManual: true, order: 2 }, { type: 'decision', order: 3 }, { type: 'task', isManual: true, order: 4 }, { type: 'end', order: 5 }]} className="h-8 w-full" />
                    <p className="text-xs text-slate-500">Roles, tools and decisions are picked up automatically. You review and edit.</p>
                  </div>
                </div>
              </Reveal>

              <Reveal as="article" delay={80} className={`${panel} lg:col-span-2`}>
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-600"><Activity size={16} />Health score</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink-900">One number, five reasons</h3>
                <div className="mt-5 flex items-center gap-5">
                  <ScoreRing score={49} size={96} label={false} />
                  <div className="w-full space-y-2.5">{[['Documentation', 53], ['Automation', 0], ['Efficiency', 20]].map(([l, v]) => <ScoreBar key={l} label={l} value={v} />)}</div>
                </div>
              </Reveal>

              <Reveal as="article" delay={0} className={`${panel} lg:col-span-2`}>
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-600"><Workflow size={16} />Editable process map</p>
                <h3 className="mt-2 font-display text-xl font-semibold text-ink-900">Drag, connect, done</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">Move boxes, add decisions and label branches. Slow and manual steps stand out at a glance.</p>
                <div className="mt-5 rounded-2xl bg-slate-50 p-4 ring-1 ring-inset ring-slate-100"><ProcessStrip steps={[{ type: 'start', order: 0 }, ...[1, 2, 3, 4, 5, 6].map((o) => ({ type: 'task', isManual: o !== 5, estimatedTime: o === 3 ? 60 : 10, order: o })), { type: 'end', order: 7 }]} className="h-8 w-full" /><div className="mt-3"><StripLegend /></div></div>
              </Reveal>

              <Reveal as="article" delay={80} className={`${panel} lg:col-span-4`}>
                <p className="flex items-center gap-2 text-sm font-semibold text-brand-600"><GitCompare size={16} />AS-IS vs TO-BE</p>
                <h3 className="mt-2 font-display text-2xl font-semibold text-ink-900">See exactly what a better process saves</h3>
                <table className="mt-5 w-full text-left text-sm">
                  <thead><tr className="text-xs text-slate-400"><th className="py-2 font-medium">Example</th><th className="py-2 text-right font-medium">Today</th><th className="py-2 text-right font-medium">Improved</th><th className="py-2 text-right font-medium">Change</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {[['Manual tasks', '9', '4', '56% fewer'], ['Estimated time', '222 min', '140 min', '37% faster'], ['Health score', '49', '68', '+19 points']].map(([m, a, b, c]) => (
                      <tr key={m}><td className="py-3 font-medium text-ink-900">{m}</td><td className="py-3 text-right text-slate-500">{a}</td><td className="py-3 text-right font-semibold text-ink-900">{b}</td><td className="py-3 text-right font-medium text-emerald-600">{c}</td></tr>
                    ))}
                  </tbody>
                </table>
              </Reveal>
            </div>
          </div>
        </section>

        {/* Who it is for */}
        <section id="who" className="mx-auto grid max-w-6xl scroll-mt-20 gap-12 px-5 py-24 lg:grid-cols-[1fr_1.2fr]">
          <SectionTitle eyebrow="Who it is for" title="Made for owners and managers, not process experts.">
            You do not need to know any diagramming rules. If you can explain how work gets done, you can use FlowLens.
          </SectionTitle>
          <ul className="grid gap-x-8 gap-y-5 self-center sm:grid-cols-2">
            {[
              [Hand, 'Find work that can be automated'], [UserX, 'Make clear who is responsible for each step'], [Timer, 'Spot the steps that slow everything down'],
              [Shuffle, 'Reduce hand-overs between people'], [Lock, 'Keep each business’s data private'], [Check, 'Guided tour on your first visit'],
            ].map(([Icon, t], i) => (
              <Reveal as="li" delay={(i % 2) * 90 + Math.floor(i / 2) * 60} key={t} className="flex items-start gap-3 text-[15px] text-slate-700"><Icon size={18} className="mt-0.5 shrink-0 text-brand-600" />{t}</Reveal>
            ))}
          </ul>
        </section>

        {/* What data we ask for, and why (shown to everyone, no login needed) */}
        <section id="your-data" className="mx-auto max-w-6xl scroll-mt-20 px-5 pb-24">
          <div className="grid gap-10 rounded-3xl border border-slate-200/70 bg-white p-8 shadow-card lg:grid-cols-[1fr_1.4fr] lg:p-12">
            <SectionTitle eyebrow="Your data, explained" title="What we ask for, and why.">
              FlowLens only asks for what it needs to run your account. We never sell your information or use it for advertising.
            </SectionTitle>
            <ul className="space-y-5 self-center text-[15px] leading-relaxed text-slate-600">
              <li><b className="text-ink-900">Email sign-up:</b> your name, email and a password (stored only as a one-way hash) to create and secure your account.</li>
              <li><b className="text-ink-900">Sign in with Google:</b> we receive only your <b className="text-ink-900">name, email address and profile picture</b>, and use them only to create your account and sign you in. We do not access your Gmail, Drive, Calendar or contacts.</li>
              <li><b className="text-ink-900">Your processes:</b> what you type in is visible to people in your own company, according to their role, and to no one else.</li>
              <li><b className="text-ink-900">You stay in control:</b> download all your data any time, and ask us to delete it.</li>
              <li>Read the full <Link to="/privacy" className="font-medium text-brand-700 underline">Privacy Policy</Link> and <Link to="/terms" className="font-medium text-brand-700 underline">Terms of Service</Link>.</li>
            </ul>
          </div>
        </section>

        {/* Final call to action */}
        <section className="px-5 pb-24">
          <Reveal className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-ink-900 via-ink-900 to-ink-800 px-8 py-16 text-center text-white shadow-lift sm:px-16">
            <svg aria-hidden viewBox="0 0 400 260" className="pointer-events-none absolute -left-16 -top-8 h-[130%] opacity-[0.10]" fill="none" stroke="#A5B4FC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M40 230V90a30 30 0 0 1 30-30h200" /><path d="M40 150h130" /><path d="M170 150v50h120" /><circle cx="290" cy="60" r="14" fill="#A5B4FC" /><circle cx="190" cy="150" r="14" fill="#A5B4FC" /><circle cx="310" cy="200" r="14" fill="#A5B4FC" />
            </svg>
            <h2 className="relative mx-auto max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">Document your first process in about ten minutes.</h2>
            <p className="relative mx-auto mt-4 max-w-xl text-brand-200/90">Start with the process that causes the most daily frustration. You will see the diagram and your first health score straight away.</p>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Button to={SIGN_UP} variant="light" className="!px-6 !py-3 !text-[15px]">Create a free account<ArrowRight size={16} /></Button>
              {demoEnabled && <Button to={DEMO} variant="onDark" className="!px-6 !py-3 !text-[15px]">Try the demo first</Button>}
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-slate-200/60">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-8 text-sm text-slate-500">
          <Logo className="h-7 w-auto" />
          <p>Discover, document and improve your business processes.</p>
          <p className="flex flex-wrap gap-x-5 gap-y-1"><Link to="/login" className="hover:text-ink-900">Sign in</Link><Link to={SIGN_UP} className="hover:text-ink-900">Create account</Link><Link to="/privacy" className="hover:text-ink-900">Privacy</Link><Link to="/terms" className="hover:text-ink-900">Terms</Link></p>
        </div>
      </footer>
    </div>
  );
}
