import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { api } from '../lib/api.js';

export const tourKey = (uid) => `flowlens_tour_done_${uid}`;

// Builds the tour. Steps that need a real process are included only when the business has one.
function buildSteps(sample) {
  const id = sample?.asis?._id;
  const cmp = sample?.tobe ? `/compare?asis=${id}&tobe=${sample.tobe._id}` : '/compare';
  const steps = [
    { path: '/', title: 'Welcome to FlowLens 👋', text: 'FlowLens helps you document how your business really works, find what slows it down, and plan a better version. This 2-minute tour walks you through every page. The workflow is: Document → Visualize → Analyze → Improve → Compare.' },
    { path: '/', target: 'sidebar', title: 'Your menu', text: 'Everything you need is in this menu. We will visit each page in the order you would normally use them. Use the top-right "Take the tour" button to see this guide again any time.' },
    { path: '/', target: 'dash-stats', title: 'Dashboard: your health at a glance', text: 'See how many processes you have, the average Process Health Score (0–100), how many tasks are still manual, and possible bottlenecks. Higher health score is better.' },
    { path: '/', target: 'dash-issues', title: 'Top issues to fix', text: 'The most serious problems found across all your processes. Click one to jump straight to its analysis.' },
    { path: '/processes', target: 'repo-filters', title: 'Process Repository', text: 'All your documented processes live here. Search by name, or filter by department, status (draft / active / archived), and AS-IS (how it works today) or TO-BE (the improved version).' },
    { path: '/processes', target: 'repo-list', title: 'Process cards', text: 'Each card shows its health score, steps, manual tasks and total time. Use "Map" to see the diagram, "Analysis" for problems, or "Edit" to change it. Switch to table view with the icons above.' },
    { path: '/processes/new', target: 'form-details', title: 'Create a process: step 1', text: 'Give your process a name, a short description, the main department and a status. Start with "draft" while you are still documenting it.' },
    { path: '/processes/new', target: 'form-steps', title: 'Create a process: step 2', text: 'Add each activity with "Add step". For every step say who does it (employee or role), the department, the tool used (Excel, email…), inputs and outputs, estimated minutes, and whether it is done manually. Choose type "Decision point" for yes/no questions. Reorder with the arrows.' },
    { path: '/discovery', target: 'discovery-wizard', title: 'Process Discovery', text: 'Not sure how to start? Just describe the process in plain words, one step per line (start a line with "Role:" to say who does it, and end with "?" for a decision). FlowLens turns it into structured steps that you can review and edit.' },
  ];
  if (id) steps.push(
    { path: `/processes/${id}/map`, target: 'map-toolbar', title: 'Process Map: toolbar', text: 'Your process as a visual flow. Add steps or decisions, tidy the layout with Auto-layout, and press "Save changes" when done. Analyze and Table view are one click away.' },
    { path: `/processes/${id}/map`, target: 'map-canvas', title: 'Edit the diagram', text: 'Drag boxes to move them. Drag from the dot at the bottom of a box to another box to connect them. Click a box or arrow and press Delete to remove it. A hand icon means manual, a bolt means automated, and a red border marks a possible bottleneck.' },
    { path: `/processes/${id}/map`, target: 'map-panel', title: 'Edit details', text: 'Click any step and edit its name, owner, tool, time and more here. Click a decision arrow to label it "Yes" or "No".' },
    { path: `/processes/${id}/analysis`, target: 'analysis-score', title: 'Process Analysis: health score', text: 'FlowLens checks your process against simple rules and gives a Health Score out of 100, broken down into Documentation, Automation, Role Clarity, Process Complexity and Efficiency.' },
    { path: `/processes/${id}/analysis`, target: 'analysis-findings', title: 'What was found', text: 'Manual tasks, bottlenecks (very slow steps), excessive handoffs between people, duplicate steps and steps without a clear owner. Each finding says which step is affected.' },
    { path: `/processes/${id}/analysis`, target: 'analysis-tobe', title: 'Create the improved TO-BE', text: '"Generate TO-BE" makes a copy of your process with improvements applied automatically: duplicates merged, repeatable manual tasks automated and slow steps shortened. You can then edit the copy on the map.' },
    { path: cmp, target: sample?.tobe ? 'compare-table' : 'compare-select', title: 'AS-IS vs TO-BE', text: 'Compare today\'s process with the improved one: steps, manual tasks, handoffs, time and health score, with the percentage improvement. The "What changed" list explains each improvement.' },
  );
  else steps.push({ path: '/compare', target: 'compare-select', title: 'AS-IS vs TO-BE', text: 'Once you have a process, pick it here, generate a TO-BE version, and see steps, manual tasks, handoffs and time side by side with the percentage improvement.' });
  steps.push({ path: '/', target: 'help-button', title: 'You are ready! 🎉', text: 'Try it: open Process Discovery, describe a real process of yours, then check its analysis. Need this guide again? Click "Take the tour" here at any time.' });
  return steps;
}

function useTargetRect(selector, deps) {
  const [rect, setRect] = useState(null);
  const el = useRef(null);
  const measure = useCallback(() => {
    if (!el.current || !document.contains(el.current)) return;
    const r = el.current.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, []);
  useEffect(() => {
    setRect(null); el.current = null;
    if (!selector) return undefined;
    let tries = 0, scrolled = false;
    const timer = setInterval(() => {
      const found = document.querySelector(`[data-tour="${selector}"]`);
      if (found && found.getBoundingClientRect().width > 0) {
        el.current = found;
        if (!scrolled) { found.scrollIntoView({ block: 'center', behavior: 'instant' }); scrolled = true; }
        measure();
      }
      if (found && tries++ > 6) clearInterval(timer);   // keep measuring briefly so late layout/data is picked up
      if (!found && tries++ > 40) clearInterval(timer); // give up after ~4s: the card is shown centered
    }, 100);
    window.addEventListener('resize', measure);
    document.addEventListener('scroll', measure, true);
    return () => { clearInterval(timer); window.removeEventListener('resize', measure); document.removeEventListener('scroll', measure, true); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, ...deps]);
  return rect;
}

export default function Tour({ onClose }) {
  const nav = useNavigate();
  const loc = useLocation();
  const [steps, setSteps] = useState(null);
  const [i, setI] = useState(0);
  const cardRef = useRef(null);
  const [cardH, setCardH] = useState(220);

  useEffect(() => {
    api.processes().then((list) => {
      const asis = [...list].filter((p) => p.version === 'as-is').sort((a, b) => b.steps.length - a.steps.length)[0];
      const tobe = asis && list.find((p) => p.baseProcess === asis._id);
      setSteps(buildSteps(asis ? { asis, tobe } : null));
    }).catch(() => setSteps(buildSteps(null)));
  }, []);

  const step = steps?.[i];
  useEffect(() => { if (step && loc.pathname + loc.search !== step.path) nav(step.path); }, [step]); // eslint-disable-line react-hooks/exhaustive-deps
  const rect = useTargetRect(step?.target, [i, steps]);
  useLayoutEffect(() => { if (cardRef.current) setCardH(cardRef.current.offsetHeight); });

  const next = useCallback(() => (steps && i < steps.length - 1 ? setI(i + 1) : onClose()), [i, steps, onClose]);
  const back = useCallback(() => i > 0 && setI(i - 1), [i]);
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); if (e.key === 'ArrowRight') next(); if (e.key === 'ArrowLeft') back(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [next, back, onClose]);

  if (!step) return null;
  const vw = window.innerWidth, vh = window.innerHeight, W = Math.min(380, vw - 32);
  let pos = { top: Math.max(16, (vh - cardH) / 2), left: (vw - W) / 2 };
  if (rect) {
    const big = rect.height > vh * 0.55;
    if (big && rect.left + rect.width + 16 + W <= vw) pos = { top: Math.max(16, Math.min(rect.top + 16, vh - cardH - 16)), left: rect.left + rect.width + 16 };
    else if (big) pos = { top: vh - cardH - 16, left: vw - W - 16 };
    else if (rect.top + rect.height + 16 + cardH <= vh) pos = { top: rect.top + rect.height + 16, left: Math.max(16, Math.min(rect.left, vw - W - 16)) };
    else pos = { top: Math.max(16, rect.top - cardH - 16), left: Math.max(16, Math.min(rect.left, vw - W - 16)) };
  }
  const last = i === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[100]" role="dialog" aria-modal="true" aria-label="Guided tour">
      {rect ? (
        <div className="pointer-events-none fixed rounded-lg ring-2 ring-brand-500 transition-all duration-200"
          style={{ top: rect.top - 6, left: rect.left - 6, width: rect.width + 12, height: rect.height + 12, boxShadow: '0 0 0 9999px rgba(15,23,42,0.6)' }} />
      ) : <div className="fixed inset-0 bg-slate-900/60" />}
      <div ref={cardRef} className="fixed rounded-xl bg-white p-5 shadow-2xl" style={{ ...pos, width: W }}>
        <button onClick={onClose} aria-label="Skip tour" className="absolute right-3 top-3 rounded p-1 text-slate-400 hover:bg-slate-100"><X size={16} /></button>
        <p className="mb-1 text-xs font-medium text-brand-600">Step {i + 1} of {steps.length}</p>
        <h3 className="mb-2 pr-6 text-base font-semibold text-slate-900">{step.title}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{step.text}</p>
        <div className="mt-4 h-1 rounded-full bg-slate-100"><div className="h-1 rounded-full bg-brand-600 transition-all" style={{ width: `${((i + 1) / steps.length) * 100}%` }} /></div>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={onClose} className="text-xs text-slate-400 hover:text-slate-600">{last ? '' : 'Skip tour'}</button>
          <div className="flex gap-2">
            {i > 0 && <button onClick={back} className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"><ArrowLeft size={14} />Back</button>}
            <button onClick={next} className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">{last ? <>Finish<Check size={14} /></> : <>Next<ArrowRight size={14} /></>}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
