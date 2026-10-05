import { useEffect, useState } from 'react';
import { FileSpreadsheet, FileJson, Printer } from 'lucide-react';
import { api } from '../../lib/api.js';
import { Card, Button, Notice } from '../../components/ui.jsx';
import { useFlash, SectionIntro } from './shared.jsx';

export default function Data() {
  const [count, setCount] = useState(null);
  const [busy, setBusy] = useState('');
  const [msg, flash] = useFlash();
  useEffect(() => { api.processes().then((l) => setCount(l.length)).catch(() => {}); }, []);

  const download = async (format) => {
    setBusy(format);
    try { await api.exportAll(format); flash(`Download started: all your processes as ${format.toUpperCase()}.`); }
    catch (e) { flash(e.message, 'error'); }
    setBusy('');
  };

  const options = [
    { format: 'csv', icon: FileSpreadsheet, title: 'Spreadsheet (CSV)', text: 'One row per step. Opens in Excel or Google Sheets, good for sharing or your own analysis.' },
    { format: 'json', icon: FileJson, title: 'Full data (JSON)', text: 'Every process with its steps, connections and health score. Good for backups or other tools.' },
  ];

  return (
    <div className="space-y-6">
      <SectionIntro title="Data export">Your processes belong to you. Download them any time{count !== null ? `: you have ${count} ${count === 1 ? 'process' : 'processes'}` : ''}.</SectionIntro>
      <Notice tone={msg?.tone}>{msg?.text}</Notice>
      <div className="grid gap-5 sm:grid-cols-2">
        {options.map((o) => (
          <Card key={o.format}>
            <span className="mb-4 inline-flex rounded-xl bg-brand-50 p-2.5 text-brand-600"><o.icon size={22} /></span>
            <h3 className="font-display text-lg font-semibold text-ink-900">{o.title}</h3>
            <p className="mb-5 mt-1.5 text-sm leading-relaxed text-slate-500">{o.text}</p>
            <Button onClick={() => download(o.format)} disabled={!!busy || count === 0}>{busy === o.format ? 'Preparing…' : `Download ${o.format.toUpperCase()}`}</Button>
          </Card>
        ))}
      </div>
      <Card title="One process, or a printable report">
        <div className="flex items-start gap-4 text-sm leading-relaxed text-slate-600">
          <Printer size={20} className="mt-0.5 shrink-0 text-brand-600" />
          <p>Open any process and use <b>Export</b> in the top right to download just that process, or to print it or <b>save it as a PDF</b> to show your team or an auditor.</p>
        </div>
      </Card>
      <p className="text-xs text-slate-400">Exports contain only your company’s processes. They never include passwords or other people’s account details. Each export is recorded in the activity log.</p>
    </div>
  );
}
