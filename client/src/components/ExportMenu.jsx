import { useEffect, useRef, useState } from 'react';
import { Download, FileSpreadsheet, FileJson, Printer, ChevronDown } from 'lucide-react';
import { api } from '../lib/api.js';
import { Button } from './ui.jsx';

// Download one process as CSV or JSON, or print it / save it as a PDF.
export default function ExportMenu({ processId }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState('');
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (!box.current?.contains(e.target)) setOpen(false); };
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  const run = async (fn) => { setError(''); try { await fn(); setOpen(false); } catch (e) { setError(e.message); } };
  const item = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100';

  return (
    <div ref={box} className="relative">
      <Button variant="secondary" aria-haspopup="menu" aria-expanded={open} onClick={() => setOpen(!open)}><Download size={16} />Export<ChevronDown size={14} /></Button>
      {open && (
        <div role="menu" className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-slate-200/70 bg-white p-1.5 shadow-lift">
          <button role="menuitem" className={item} onClick={() => run(() => api.exportProcess(processId, 'csv'))}><FileSpreadsheet size={16} className="text-brand-600" />Spreadsheet (CSV)</button>
          <button role="menuitem" className={item} onClick={() => run(() => api.exportProcess(processId, 'json'))}><FileJson size={16} className="text-brand-600" />Full data (JSON)</button>
          <button role="menuitem" className={item} onClick={() => { setOpen(false); setTimeout(() => window.print(), 50); }}><Printer size={16} className="text-brand-600" />Print or save as PDF</button>
          {error && <p role="alert" className="px-3 py-2 text-xs text-red-600">{error}</p>}
        </div>
      )}
    </div>
  );
}
