import { useSearchParams } from 'react-router-dom';
import { UserRound, ShieldCheck, Building2, Users, SlidersHorizontal, History, Download } from 'lucide-react';
import { useAuth } from '../lib/auth.jsx';
import { PageHeader } from '../components/ui.jsx';
import Profile from './settings/Profile.jsx';
import Security from './settings/Security.jsx';
import Company from './settings/Company.jsx';
import Team from './settings/Team.jsx';
import AnalysisRules from './settings/AnalysisRules.jsx';
import Activity from './settings/Activity.jsx';
import Data from './settings/Data.jsx';

// `admin: true` tabs are shown to owners and admins only (the server enforces this as well).
const TABS = [
  { id: 'profile', label: 'Profile', icon: UserRound, View: Profile },
  { id: 'security', label: 'Security', icon: ShieldCheck, View: Security },
  { id: 'company', label: 'Company', icon: Building2, View: Company, admin: true },
  { id: 'team', label: 'Team and roles', icon: Users, View: Team, admin: true },
  { id: 'analysis', label: 'Analysis rules', icon: SlidersHorizontal, View: AnalysisRules, admin: true },
  { id: 'activity', label: 'Activity log', icon: History, View: Activity, admin: true },
  { id: 'data', label: 'Data export', icon: Download, View: Data },
];

export default function Settings() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const isAdmin = user.permission !== 'member';
  const tabs = TABS.filter((t) => !t.admin || isAdmin);
  const active = tabs.find((t) => t.id === params.get('tab')) || tabs[0];

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account, your company and how FlowLens analyzes your processes." />
      <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
        <nav data-tour="settings-tabs" aria-label="Settings sections" className="-mx-1 flex gap-1 overflow-x-auto px-1 pb-2 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0 lg:pb-0">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setParams({ tab: t.id })} aria-current={active.id === t.id ? 'page' : undefined}
              className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-left text-sm font-medium transition-colors ${active.id === t.id ? 'bg-white text-brand-700 shadow-card ring-1 ring-slate-200/70' : 'text-slate-600 hover:bg-white/70'}`}>
              <t.icon size={17} strokeWidth={1.75} className={active.id === t.id ? 'text-brand-600' : 'text-slate-400'} />{t.label}
            </button>
          ))}
        </nav>
        <div key={active.id} className="anim-fade-up min-w-0"><active.View /></div>
      </div>
    </div>
  );
}
