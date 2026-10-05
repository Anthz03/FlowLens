import { useState, useEffect } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, PlusCircle, Compass, Workflow, Activity, GitCompare, Menu, X, Plus, HelpCircle, LogOut, Sparkles, Settings } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';
import Logo from './Logo.jsx';
import Tour, { tourKey } from './Tour.jsx';

const groups = [
  { label: 'Workspace', items: [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/processes', label: 'Process Repository', icon: FolderKanban, end: true },
  ] },
  { label: 'Build', items: [
    { to: '/processes/new', label: 'Create Process', icon: PlusCircle },
    { to: '/discovery', label: 'Process Discovery', icon: Compass },
    { to: '/map', label: 'Process Map', icon: Workflow },
  ] },
  { label: 'Improve', items: [
    { to: '/analysis', label: 'Process Analysis', icon: Activity },
    { to: '/compare', label: 'AS-IS vs TO-BE', icon: GitCompare },
  ] },
  { label: 'Account', items: [
    { to: '/settings', label: 'Settings', icon: Settings },
  ] },
];

function Sidebar({ onNavigate, onTour }) {
  return (
    <aside data-tour="sidebar" className="flex h-full w-64 flex-col bg-gradient-to-b from-ink-900 to-ink-950 text-brand-200">
      <Link to="/" onClick={onNavigate} aria-label="FlowLens home" className="block px-6 pb-6 pt-6">
        <Logo className="h-9 w-auto" markColor="#A5B4FC" textColor="#FFFFFF" />
      </Link>
      <nav aria-label="Main" className="flex-1 space-y-6 overflow-y-auto px-3">
        {groups.map((g) => (
          <div key={g.label}>
            <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-[0.12em] text-brand-300/50">{g.label}</p>
            <div className="space-y-0.5">
              {g.items.map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end} onClick={onNavigate}
                  className={({ isActive }) => `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${isActive
                    ? 'bg-white/10 text-white before:absolute before:-left-3 before:top-2 before:h-6 before:w-1 before:rounded-r-full before:bg-brand-400'
                    : 'text-brand-200/75 hover:bg-white/5 hover:text-white'}`}>
                  <Icon size={18} strokeWidth={1.75} />{label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      <div className="m-3 rounded-2xl bg-white/5 p-4 ring-1 ring-inset ring-white/10">
        <p className="flex items-center gap-1.5 text-sm font-medium text-white"><Sparkles size={14} className="text-brand-300" />New here?</p>
        <p className="mt-1 text-xs leading-relaxed text-brand-200/70">Take the 2-minute tour of every page.</p>
        <button onClick={() => { onNavigate?.(); onTour(); }} className="mt-3 w-full rounded-lg bg-white/10 py-1.5 text-xs font-medium text-white transition hover:bg-white/20">Start the tour</button>
      </div>
    </aside>
  );
}

export default function Layout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const [tour, setTour] = useState(false);
  const [menu, setMenu] = useState(false);
  const { pathname } = useLocation();

  // First visit: start the tutorial automatically
  useEffect(() => {
    let done = true;
    try { done = !!localStorage.getItem(tourKey(user._id)); } catch { /* ignore */ }
    if (!done) { const t = setTimeout(() => setTour(true), 600); return () => clearTimeout(t); }
    return undefined;
  }, [user._id]);
  useEffect(() => { // lets other pages (Settings) start the tour
    const start = () => setTour(true);
    window.addEventListener('flowlens:start-tour', start);
    return () => window.removeEventListener('flowlens:start-tour', start);
  }, []);
  const closeTour = () => { setTour(false); try { localStorage.setItem(tourKey(user._id), '1'); } catch { /* ignore */ } };
  const initials = user.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div className="flex h-screen overflow-hidden print:block print:h-auto print:overflow-visible">
      <a href="#main" className="sr-only z-[200] rounded-lg bg-white px-4 py-2 text-sm font-medium text-brand-700 shadow-lift focus:not-sr-only focus:fixed focus:left-4 focus:top-4">Skip to content</a>
      <div className="hidden lg:block print:hidden"><Sidebar onTour={() => setTour(true)} /></div>
      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="shadow-lift"><Sidebar onNavigate={() => setOpen(false)} onTour={() => setTour(true)} /></div>
          <div className="flex-1 bg-ink-950/50" onClick={() => setOpen(false)} />
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 print:hidden items-center justify-between border-b border-slate-200/60 bg-white/70 px-4 backdrop-blur-md lg:px-10">
          <button className="rounded-lg p-1.5 text-slate-600 hover:bg-slate-100 lg:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
          <p className="hidden text-sm text-slate-500 lg:block"><span className="font-medium text-ink-900">{user.business?.name || 'My business'}</span></p>
          <div className="flex items-center gap-2.5">
            <Link to="/processes/new" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-2 text-sm font-medium text-white shadow-button transition hover:bg-brand-700 active:translate-y-px"><Plus size={16} />New process</Link>
            <button data-tour="help-button" onClick={() => setTour(true)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"><HelpCircle size={16} /><span className="hidden sm:inline">Take the tour</span></button>
            <div className="relative">
              <button onClick={() => setMenu(!menu)} aria-label="Account menu" aria-expanded={menu} className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-900 text-xs font-semibold text-white transition hover:bg-ink-800">{initials}</button>
              {menu && (
                <div className="absolute right-0 z-30 mt-2 w-60 rounded-xl border border-slate-200/70 bg-white p-1.5 shadow-lift" onMouseLeave={() => setMenu(false)}>
                  <div className="border-b border-slate-100 px-3 py-2.5"><p className="text-sm font-medium text-ink-900">{user.name}</p><p className="truncate text-xs text-slate-500">{user.email}</p></div>
                  <Link to="/settings" onClick={() => setMenu(false)} className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"><Settings size={15} />Settings</Link>
                  <button onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"><LogOut size={15} />Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <main id="main" className="flex-1 overflow-y-auto p-4 lg:p-10 print:overflow-visible print:p-0"><div key={pathname} className="anim-fade-up mx-auto max-w-[1280px]"><Outlet /></div></main>
        {tour && <Tour onClose={closeTour} />}
      </div>
    </div>
  );
}
