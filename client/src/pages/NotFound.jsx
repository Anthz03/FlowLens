import { Compass } from 'lucide-react';
import { Button } from '../components/ui.jsx';

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <div className="mb-5 rounded-2xl bg-brand-50 p-4 text-brand-600"><Compass size={32} /></div>
      <p className="text-sm font-medium text-brand-600">404</p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink-900">We can’t find that page</h1>
      <p className="mb-6 mt-2 text-slate-500">The link may be old, or the process may have been deleted.</p>
      <div className="flex gap-2"><Button to="/">Go to the dashboard</Button><Button variant="secondary" to="/processes">Browse processes</Button></div>
    </div>
  );
}
