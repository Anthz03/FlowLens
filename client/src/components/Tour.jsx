import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { SHOW_COMPARE } from '../lib/constants.js';
import { useNavigate } from 'react-router-dom';
import { X, ArrowLeft, ArrowRight, Check, Lightbulb, Loader2 } from 'lucide-react';
import { api } from '../lib/api.js';

export const tourKey = (uid) => `flowlens_tour_done_${uid}`;

// Plain-language steps. `tip` is shown as "Try this". Steps that need a real process are
// included only when the business already has one.
function buildSteps(sample) {
  const id = sample?.asis?._id;
  const compare = sample?.tobe ? `/compare?asis=${id}&tobe=${sample.tobe._id}` : '/compare';
  const steps = [
    { path: '/', title: 'Welcome to FlowLens 👋', text: 'FlowLens helps you write down how work gets done in your business, find what slows it down, and plan a better way.', list: ['Describe a process', 'See it as a diagram', 'Check it for problems', SHOW_COMPARE ? 'Compare with a better version' : 'Get recommendations'], tip: 'This tour takes about 2 minutes. You can skip it at any time.' },
    { path: '/', target: 'sidebar', title: 'The menu', text: 'This menu takes you to every page. We will visit them one by one, in the order you would normally use them.' },
    { path: '/', target: 'dash-stats', title: 'Dashboard: your summary', text: 'These boxes sum up all your processes. The Health Score goes from 0 to 100 — higher is better. "Manual tasks" are jobs done by hand. "Possible bottlenecks" are steps that take a very long time.' },
    { path: '/', target: 'dash-issues', title: 'What to fix first', text: 'The most urgent problems across all your processes.', tip: 'Click a problem to see the details.' },
    { path: '/processes', target: 'repo-filters', title: 'Process Repository', text: `This is your library of processes. Search or filter to find one quickly.${SHOW_COMPARE ? ' "AS-IS" means how work is done today. "TO-BE" means the improved version.' : ''}` },
    { path: '/processes', target: 'repo-list', title: 'Your processes', text: 'Each card is one process, with its score. "Map" shows the diagram, "Analysis" shows the problems, and "Edit" lets you change it.' },
    { path: '/processes/new', target: 'form-details', title: 'Create a process (1 of 2)', text: 'First give your process a name and write one or two sentences about it.', tip: 'Example name: "Customer Order Fulfillment". Leave the status as Draft for now.' },
    { path: '/processes/new', target: 'form-steps', title: 'Create a process (2 of 2)', text: 'Now list the steps one by one with "Add step". For each step, say who does it, which tool they use (like Excel or email) and how many minutes it takes.', tip: 'Tick "Performed manually" if it is done by hand. Choose "Decision point" for yes/no questions.' },
    { path: '/discovery', target: 'discovery-wizard', title: 'Process Discovery', text: 'Do not want to fill in forms? Just type what happens, one step per line, the way you would explain it to a new coworker. FlowLens turns it into steps for you.', tip: 'Start a line with "Sales Rep:" to say who does it. End a line with "?" for a question. The "Use an example" button shows how.' },
  ];
  if (id) steps.push(
    { path: `/processes/${id}/map`, target: 'map-toolbar', title: 'Process Map', text: 'This is your process as a diagram. Use these buttons to add a step or a decision, tidy up the layout, and save.', tip: 'Press "Save changes" when you are done.' },
    { path: `/processes/${id}/map`, target: 'map-canvas', title: 'Change the diagram', text: 'Drag boxes to move them. To connect two boxes, drag from the small dot under one box to another box. To delete something, click it and press Delete.', tip: '✋ Hand = done by hand. ⚡ Bolt = automated. Red border = a very slow step.' },
    { path: `/processes/${id}/map`, target: 'map-panel', title: 'Edit a step', text: 'Click any box and its details appear here. You can change its name, owner, tool and time.' },
    { path: `/processes/${id}/analysis`, target: 'analysis-score', title: 'Process Analysis', text: 'FlowLens checks your process and gives it a Health Score out of 100. The bars show how it does on five things: documentation, automation, clear owners, simplicity and speed.' },
    { path: `/processes/${id}/analysis`, target: 'analysis-findings', title: 'What was found', text: 'Jobs done by hand, slow steps, work passed between too many people, repeated steps, and steps with nobody in charge.' },
    { path: `/processes/${id}/analysis`, target: 'analysis-tobe', title: 'Make it better', text: 'This button makes an improved copy of your process: it removes repeated steps, automates simple manual jobs and shortens slow steps.', tip: 'Your original process stays untouched.' },
    { path: compare, target: sample?.tobe ? 'compare-table' : 'compare-select', title: 'Compare: before and after', text: 'See today\'s process next to the improved one: number of steps, manual jobs, time and score, with how much better it got in percent.' },
  );
  else steps.push({ path: '/compare', target: 'compare-select', title: 'Compare: before and after', text: 'Once you have a process, choose it here, create an improved version, and see both side by side with the percent improvement.' });
  steps.push({ path: '/settings', target: 'settings-tabs', title: 'Settings', text: 'Change your profile and password, set up your company and team, and download your data. You can also replay this tour from the Profile tab.', tip: 'Owners and admins also see Team and roles, Analysis rules and the Activity log.' });
  steps.push({ path: '/', target: 'help-button', title: 'You are ready! 🎉', text: 'A good first step: open Process Discovery and type in one real process from your business.', tip: 'Click "Take the tour" any time to see this guide again.' });
  // The comparison steps only make sense while the AS-IS vs TO-BE module is visible.
  return SHOW_COMPARE ? steps : steps.filter((s) => s.target !== 'analysis-tobe' && !String(s.path).startsWith('/compare') && !String(s.target).startsWith('compare-'));
}

const here = () => window.location.pathname + window.location.search;

export default function Tour({ onClose }) {
  const nav = useNavigate();
  const [steps, setSteps] = useState(null);
  const [i, setI] = useState(0);              // step currently shown
  const [loadingTo, setLoadingTo] = useState(null); // step being prepared (page loading)
  const [rect, setRect] = useState(null);
  const [cardH, setCardH] = useState(240);
  const cardRef = useRef(null);
  const lastPos = useRef(null);

  useEffect(() => {
    api.processes().then((list) => {
      const asis = [...list].filter((p) => p.version === 'as-is').sort((a, b) => b.steps.length - a.steps.length)[0];
      setSteps(buildSteps(asis ? { asis, tobe: list.find((p) => p.baseProcess === asis._id) } : null));
    }).catch(() => setSteps(buildSteps(null)));
    if (here() !== '/') nav('/'); // the tour always starts from the Dashboard
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Move to another step: navigate first, wait until the page and its target are on screen, then switch.
  const go = (n) => { if (steps && n >= 0 && n < steps.length && loadingTo === null) setLoadingTo(n); };
  useEffect(() => {
    if (loadingTo === null || !steps) return undefined;
    const s = steps[loadingTo];
    if (here() !== s.path) nav(s.path);
    let waited = 0;
    const timer = setInterval(() => {
      waited += 80;
      const onPage = here() === s.path;
      const el = s.target && document.querySelector(`[data-tour="${s.target}"]`);
      const visible = el && el.getBoundingClientRect().width > 0;
      const ready = onPage && (s.target ? visible && waited >= 240 : waited >= 240);
      if (ready || (onPage && waited >= 1600) || waited >= 3000) {
        clearInterval(timer);
        if (visible) el.scrollIntoView({ block: el.getBoundingClientRect().height > window.innerHeight * 0.6 ? 'start' : 'center', behavior: 'smooth' });
        setI(loadingTo); setLoadingTo(null);
      }
    }, 80);
    return () => clearInterval(timer);
  }, [loadingTo]); // eslint-disable-line react-hooks/exhaustive-deps

  // Follow the highlighted element every frame so the spotlight stays correct while the page scrolls or re-lays out.
  const target = steps?.[i]?.target;
  useEffect(() => {
    if (!target) { setRect(null); return undefined; }
    let raf, last = '';
    const tick = () => {
      const el = document.querySelector(`[data-tour="${target}"]`);
      const b = el?.getBoundingClientRect();
      const r = b && b.width > 0 && b.height > 0 ? { top: b.top, left: b.left, width: b.width, height: b.height } : null;
      const key = r ? [r.top, r.left, r.width, r.height].map(Math.round).join('|') : '';
      if (key !== last) { last = key; setRect(r); }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [target]);

  useLayoutEffect(() => {
    const h = cardRef.current?.offsetHeight;
    if (h && h !== cardH) setCardH(h);
  });

  const next = () => (i === steps.length - 1 ? onClose() : go(i + 1));
  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') (i === steps?.length - 1 ? onClose() : go(i + 1));
      if (e.key === 'ArrowLeft') go(i - 1);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });

  if (!steps) return null;
  const step = steps[i];
  const vw = window.innerWidth, vh = window.innerHeight, W = Math.min(390, vw - 32);
  const clampL = (l) => Math.max(16, Math.min(l, vw - W - 16));

  let pos = { top: Math.max(16, (vh - cardH) / 2), left: (vw - W) / 2 };
  if (rect) {
    const big = rect.height > vh * 0.5;
    if (big && rect.left + rect.width + 20 + W <= vw) pos = { top: Math.max(16, Math.min(rect.top + 16, vh - cardH - 16)), left: rect.left + rect.width + 20 };
    else if (big) pos = { top: vh - cardH - 16, left: vw - W - 16 };
    else if (rect.top + rect.height + 18 + cardH <= vh) pos = { top: rect.top + rect.height + 18, left: clampL(rect.left) };
    else pos = { top: Math.max(16, rect.top - cardH - 18), left: clampL(rect.left) };
  } else if (loadingTo !== null && lastPos.current) pos = lastPos.current; // hold still while the next page loads
  lastPos.current = pos;

  const last = i === steps.length - 1;
  const busy = loadingTo !== null;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Guided tour">
      {rect ? (
        <div className="pointer-events-none fixed rounded-lg ring-2 ring-brand-500 transition-all duration-300 ease-out"
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12, boxShadow: '0 0 0 9999px rgba(15,23,42,0.6)' }} />
      ) : <div className="fixed inset-0 bg-slate-900/60" />}
      <div ref={cardRef} className="fixed rounded-xl bg-white p-5 shadow-2xl transition-all duration-300 ease-out" style={{ ...pos, width: W }}>
        <button onClick={onClose} aria-label="Close tour" className="absolute right-3 top-3 rounded p-1 text-slate-400 hover:bg-slate-100"><X size={16} /></button>
        <p className="mb-1 text-xs font-medium text-brand-600">Step {i + 1} of {steps.length}</p>
        <h3 className="mb-2 pr-6 text-base font-semibold text-slate-900">{step.title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{step.text}</p>
        {step.list && (
          <ol className="mt-3 space-y-1.5">{step.list.map((t, n) => (
            <li key={t} className="flex items-center gap-2.5 text-sm text-slate-700"><span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">{n + 1}</span>{t}</li>))}
          </ol>
        )}
        {step.tip && (
          <p className="mt-3 flex gap-2 rounded-lg bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-900"><Lightbulb size={14} className="mt-0.5 shrink-0" /><span><b>Try this:</b> {step.tip}</span></p>
        )}
        <div className="mt-4 h-1 rounded-full bg-slate-100"><div className="h-1 rounded-full bg-brand-600 transition-all duration-300" style={{ width: `${((i + 1) / steps.length) * 100}%` }} /></div>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">{last ? '' : 'Skip tour'}</button>
          <div className="flex gap-2">
            {i > 0 && <button disabled={busy} onClick={() => go(i - 1)} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"><ArrowLeft size={14} />Back</button>}
            <button disabled={busy} onClick={next} className="inline-flex min-w-20 items-center justify-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-70">
              {busy ? <Loader2 size={14} className="animate-spin" /> : last ? <>Finish<Check size={14} /></> : <>Next<ArrowRight size={14} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
