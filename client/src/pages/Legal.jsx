import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { LEGAL } from '../lib/legal.js';
import { PAGES } from '../lib/legalContent.js';

const { appName: APP, updated: UPDATED } = LEGAL;

// **bold** inside text
function Rich({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') ? <strong key={i} className="font-semibold text-ink-900">{part.slice(2, -2)}</strong> : part));
}

function LegalPage({ page }) {
  const { title, intro, sections, other } = page;
  useEffect(() => { document.title = `${title} · ${APP}`; window.scrollTo(0, 0); }, [title]);
  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200/60 bg-page/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link to="/" aria-label={`${APP} home`}><Logo className="h-8 w-auto" /></Link>
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-ink-900"><ArrowLeft size={15} />Back to {APP}</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-5 py-12">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-ink-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-400">Last updated: {UPDATED}</p>
        <p className="mt-6 text-[17px] leading-relaxed text-slate-600">{intro}</p>
        <nav aria-label="On this page" className="mt-8 rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200/60">
          <p className="mb-2 text-sm font-semibold text-ink-900">On this page</p>
          <ol className="grid gap-x-8 gap-y-1 text-sm text-brand-700 sm:grid-cols-2">
            {sections.map((s, i) => <li key={s.title}><a href={`#s${i + 1}`} className="hover:underline">{i + 1}. {s.title}</a></li>)}
          </ol>
        </nav>
        <div className="mt-10 space-y-9">
          {sections.map((s, i) => (
            <section key={s.title} id={`s${i + 1}`} className="scroll-mt-6">
              <h2 className="font-display text-xl font-semibold text-ink-900">{i + 1}. {s.title}</h2>
              <div className="mt-3 space-y-3 leading-relaxed text-slate-600">
                {s.body.map((b, j) => (typeof b === 'string'
                  ? <p key={j}><Rich text={b} /></p>
                  : <ul key={j} className="list-disc space-y-2 pl-5 marker:text-brand-400">{b.list.map((li) => <li key={li}><Rich text={li} /></li>)}</ul>))}
              </div>
            </section>
          ))}
        </div>
        <footer className="mt-14 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6 text-sm text-slate-500">
          <span>© {new Date().getFullYear()} {APP}</span>
          <span className="flex gap-5"><Link to={other.path} className="hover:text-ink-900">{other.label}</Link><Link to="/login" className="hover:text-ink-900">Sign in</Link></span>
        </footer>
      </main>
    </div>
  );
}

export const Privacy = () => <LegalPage page={PAGES.privacy} />;
export const Terms = () => <LegalPage page={PAGES.terms} />;
