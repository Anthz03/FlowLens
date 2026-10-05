import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../lib/auth.jsx';
import Logo from './Logo.jsx';
import Tour, { tourKey } from './Tour.jsx';
import { LayoutDashboard, FolderKanban, PlusCircle, Compass, Workflow, Activity, GitCompare, Menu, X, Plus, HelpCircle, LogOut } from 'lucide-react';

const nav = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/processes', label: 'Process Repository', icon: FolderKanban, end: true },
  { to: '/processes/new', label: 'Create Process', icon: PlusCircle },
  { to: '/discovery', label: 'Process Discovery', icon: Compass },
  { to: '/map', label: 'Process Map', icon: Workflow },
  { to: '/analysis', label: 'Process Analysis', icon: Activity },
  { to: '/compare', label: 'AS-IS vs TO-BE', icon: GitCompare },
];

function Sidebar({ onNavigate }) {
  return (
    <aside data-tour="sidebar" className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <Link to="/" onClick={onNavigate} aria-label="FlowLens home" className="block px-5 py-5"><Logo className="h-9 w-auto" /></Link>
      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'}`}>
            <Icon size={18} />{label}
          </NavLink>
        ))}
      </nav>
      <p className="px-5 py-4 text-xs text-slate-400">Discover, document and improve your business processes.</p>
    </aside>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const [tour, setTour] = useState(false);
  const [menu, setMenu] = useState(false);

  // First visit: start the tutorial automatically
  useEffect(() => {
    let done = true;
    try { done = !!localStorage.getItem(tourKey(user._id)); } catch { /* ignore */ }
    if (!done) { const t = setTimeout(() => setTour(true), 600); return () => clearTimeout(t); }
    return undefined;
  }, [user._id]);
  const closeTour = () => { setTour(false); try { localStorage.setItem(tourKey(user._id), '1'); } catch { /* ignore */ } };
  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <div className="flex h-screen overflow-hidden">
      <div className="hidden lg:block"><Sidebar /></div>
      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="shadow-xl"><Sidebar onNavigate={() => setOpen(false)} /></div>
          <div className="flex-1 bg-slate-900/40" onClick={() => setOpen(false)} />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 lg:px-8">
          <button className="rounded p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <p className="hidden text-sm text-slate-500 lg:block">{user.business?.name || 'My business'} · SME Process Improvement</p>
          <div className="flex items-center gap-3">
            <Link to="/processes/new" className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700"><Plus size={16} />New process</Link>
            <button data-tour="help-button" onClick={() => setTour(true)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"><HelpCircle size={16} /><span className="hidden sm:inline">Take the tour</span></button>
            <div className="relative">
              <button onClick={() => setMenu(!menu)} aria-label="Account menu" className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">{initials}</button>
              {menu && (
                <div className="absolute right-0 z-30 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-1 shadow-lg" onMouseLeave={() => setMenu(false)}>
                  <div className="border-b border-slate-100 px-3 py-2"><p className="text-sm font-medium text-slate-900">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
                  <button onClick={logout} className="mt-1 flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"><LogOut size={15} />Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8"><Outlet /></main>
        {tour && <Tour onClose={closeTour} />}
      </div>
    </div>
  );
}
