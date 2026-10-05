import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Card, Button, Notice, Loading, ErrorBox, ConfirmModal } from '../../components/ui.jsx';
import { useFlash, SectionIntro } from './shared.jsx';

// One entry per rule: how it is shown, and what it means in plain words.
const FIELDS = [
  { key: 'bottleneckMinutes', label: 'A step is a bottleneck when it takes at least', unit: 'minutes', min: 5, max: 240, step: 5,
    help: (v) => `Any step of ${v} minutes or more is flagged as a possible bottleneck.` },
  { key: 'slowFactor', label: 'Also flag steps that are much slower than the rest', unit: '× the average', min: 1.5, max: 10, step: 0.5,
    help: (v) => `A step of 20+ minutes that is more than ${v} times the average step is flagged too.` },
  { key: 'maxHandoffs', label: 'Too many handoffs is more than', unit: 'handoffs', min: 1, max: 20, step: 1,
    help: (v) => `A handoff is work passing between two different people. More than ${v} in one process is flagged.` },
  { key: 'duplicateSimilarity', label: 'Two steps are duplicates when their names are', unit: '% alike', min: 50, max: 100, step: 5, scale: 100,
    help: (v) => `Names that are ${v}% or more alike are flagged as possible repeats. Lower finds more, higher finds fewer.` },
  { key: 'longProcessSteps', label: 'A process is long when it has more than', unit: 'activities', min: 5, max: 100, step: 1,
    help: (v) => `More than ${v} activities suggests splitting the process or removing steps.` },
  { key: 'maxDecisions', label: 'A process is complex when it has more than', unit: 'decisions', min: 1, max: 20, step: 1,
    help: (v) => `More than ${v} yes/no decision points makes a process hard to follow.` },
];
const show = (f, v) => Math.round(v * (f.scale || 1) * 100) / 100;

export default function AnalysisRules() {
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [msg, flash] = useFlash(9000);

  const apply = (d) => { setData(d); setForm(Object.fromEntries(FIELDS.map((f) => [f.key, show(f, d.rules[f.key])]))); };
  useEffect(() => {
    let cancelled = false; // a late response must never overwrite what the person has already typed
    api.analysisRules().then((d) => { if (!cancelled) apply(d); }).catch((e) => { if (!cancelled) setError(e.message); });
    return () => { cancelled = true; };
  }, []);
  if (error) return <ErrorBox error={error} />;
  if (!form) return <Loading />;

  const dirty = FIELDS.some((f) => Number(form[f.key]) !== show(f, data.rules[f.key]));
  const atDefaults = FIELDS.every((f) => show(f, data.rules[f.key]) === show(f, data.defaults[f.key]));
  const bottlenecks = async () => (await api.dashboard()).totals.bottlenecks;

  const save = async () => {
    setSaving(true);
    try {
      const before = await bottlenecks();
      const body = Object.fromEntries(FIELDS.map((f) => [f.key, Number(form[f.key]) / (f.scale || 1)]));
      apply(await api.saveAnalysisRules(body));
      const after = await bottlenecks();
      flash(`Saved. Possible bottlenecks across your processes: ${before} → ${after}. Every analysis and score now uses these rules.`);
    } catch (err) { flash(err.message, 'error'); }
    setSaving(false);
  };
  const reset = async () => {
    setConfirmReset(false); setSaving(true);
    try { apply(await api.resetAnalysisRules()); flash('Rules are back to their defaults.'); } catch (err) { flash(err.message, 'error'); }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <SectionIntro title="Analysis rules">What counts as a problem depends on your business. Tune these thresholds and every health score, bottleneck and recommendation will follow them.</SectionIntro>
      <Card>
        <div className="divide-y divide-slate-100">
          {FIELDS.map((f) => {
            const def = show(f, data.defaults[f.key]), v = Number(form[f.key]);
            return (
              <div key={f.key} className="grid gap-3 py-5 first:pt-0 last:pb-0 sm:grid-cols-[1fr_auto] sm:items-center sm:gap-8">
                <div>
                  <label htmlFor={f.key} className="text-sm font-medium text-ink-900">{f.label}</label>
                  <p className="mt-1 text-sm text-slate-500">{f.help(v)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <input aria-label={`${f.label} (slider)`} type="range" min={f.min} max={f.max} step={f.step} value={v} onChange={(e) => setForm({ ...form, [f.key]: Number(e.target.value) })} className="w-36 accent-brand-600 sm:w-44" />
                  <input id={f.key} type="number" min={f.min} max={f.max} step={f.step} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-20 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-right text-sm shadow-sm focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-100" />
                  <span className="w-24 text-xs text-slate-400">{f.unit}<br />default {def}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6 space-y-4 border-t border-slate-100 pt-5">
          <Notice tone={msg?.tone}>{msg?.text}</Notice>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="secondary" onClick={() => setConfirmReset(true)} disabled={atDefaults || saving}><RotateCcw size={15} />Reset to defaults</Button>
            <Button onClick={save} disabled={!dirty || saving}>{saving ? 'Saving…' : 'Save rules'}</Button>
          </div>
        </div>
      </Card>
      <ConfirmModal open={confirmReset} title="Reset to the default rules?" message="Your changes will be replaced by the built-in thresholds. Scores and findings will update." confirmLabel="Reset" onConfirm={reset} onClose={() => setConfirmReset(false)} />
    </div>
  );
}
