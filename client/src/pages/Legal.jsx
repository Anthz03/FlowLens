import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo.jsx';
import { LEGAL } from '../lib/legal.js';

const { appName: APP, owner: OWNER, contactEmail: EMAIL, country: COUNTRY, updated: UPDATED } = LEGAL;

// Each section: a title and a list of blocks. A block is a paragraph (string) or { list: [...] }.
const PRIVACY = [
  { title: 'Who we are', body: [
    `${APP} is a web application that helps small and medium businesses document, visualize, analyze and improve their business processes. It is operated by ${OWNER} (“we”, “us”).`,
    `If you have a question about this policy or your information, contact us at ${EMAIL}.`,
  ] },
  { title: 'Information we collect', body: [
    'We collect only what we need to run the service:',
    { list: [
      '**Account details:** your name, email address, job title, and your role in your company (owner, admin or member). Your password is never stored as you typed it. We store only a salted, one-way hash of it.',
      '**Google sign-in:** if you choose “Sign in with Google”, Google tells us your name, email address, profile picture link and Google account ID. We never see your Google password. We use this information only to create and sign you in to your account.',
      '**Company details:** your company name, type of business, size and departments.',
      '**Setup answers (optional):** how you found us, your role, what you want to do with the app, how your processes are documented today, and your biggest daily problem.',
      '**Your process data:** the processes, steps, descriptions, roles, tools, inputs, outputs, time estimates, diagrams, analysis results and notes you enter.',
      '**Security and activity records:** sign-ins, failed sign-in attempts, password changes, role changes, exports and deletions, with the IP address and browser type. We keep these for 90 days to keep accounts safe.',
      '**Technical data:** like most websites, our servers and hosting providers record standard request information such as IP address and time.',
    ] },
  ] },
  { title: 'Cookies and browser storage', body: [
    `${APP} does not use advertising or tracking cookies, and does not use analytics tools. It stores two small things in your browser’s local storage: a sign-in token that keeps you signed in (it expires after 12 hours of inactivity), and a flag that remembers you finished the guided tour.`,
  ] },
  { title: 'How we use your information', body: [
    { list: [
      'To provide the service: create your account, store and analyze your processes, and show comparisons and reports.',
      'To keep the service secure: detect repeated failed sign-ins, prevent abuse, and keep the activity log.',
      'To personalize suggestions, such as the first steps we recommend after your setup answers.',
    ] },
    'We do not sell your personal information and we do not use it for advertising.',
    'Our use of information received from Google follows the Google API Services User Data Policy, including its Limited Use requirements. We use your Google name, email address and profile picture only to provide sign-in for your account.',
  ] },
  { title: 'Who can see your information', body: [
    { list: [
      '**People in your company** can see company processes according to their role. Owners and admins can also see the team list and the activity log.',
      '**Other companies** cannot see your data. Each company’s data is kept separate.',
      `**Our service providers** process data for us only to run ${APP}: Vercel (hosts the website), Render (hosts the application server), MongoDB Atlas (stores the data) and Google (sign-in). They may process data in the countries where they operate.`,
      '**Authorities:** we may disclose information if the law requires it.',
    ] },
  ] },
  { title: 'How long we keep it', body: [
    { list: [
      'Account and process data is kept while your account exists. Deleting a process also deletes its steps and analysis.',
      'Security and activity records are deleted automatically after 90 days.',
      'If you ask us to delete your account or company data, we will delete it. Copies in backups, if any, are removed when those backups expire.',
    ] },
  ] },
  { title: 'Your choices', body: [
    { list: [
      '**See and correct:** you can view and edit your profile and company details in Settings.',
      '**Download:** you can export all your processes as CSV or JSON in Settings, under Data export.',
      '**Delete:** owners and admins can delete processes in the app. To delete your account or your company’s data, email us.',
      '**Google:** you can stop Google sign-in at any time at myaccount.google.com/permissions.',
    ] },
    `To make a request, email ${EMAIL}. We may need to confirm it is you.`,
  ] },
  { title: 'Security', body: [
    'We protect your information with encrypted connections (HTTPS), hashed passwords, role-based access, sign-in rate limiting, account lockout after repeated wrong passwords, and an activity log. No online service can be completely secure, so please use a strong password and keep it private.',
  ] },
  { title: 'Children', body: [
    `${APP} is not meant for children under 13, and we do not knowingly collect their information. If you believe a child has given us information, contact us and we will delete it.`,
  ] },
  { title: 'Changes to this policy', body: [
    'We may update this policy. When we make an important change we will update the date at the top. Using the service after a change means you accept the updated policy.',
  ] },
  { title: 'Contact', body: [`${OWNER} · ${EMAIL}`] },
];

const TERMS = [
  { title: 'Agreement', body: [
    `By creating an account or using ${APP} (“the Service”), you agree to these Terms and to our Privacy Policy. If you use the Service for a company, you confirm you have the authority to accept these Terms for it. If you do not agree, please do not use the Service.`,
    'You must be at least 13 years old to use the Service.',
  ] },
  { title: 'What the Service does', body: [
    `${APP} lets you describe business processes, view them as diagrams, receive rule-based analysis and scores, create improved versions, and compare them. The Service is a prototype. We may change, add or remove features at any time.`,
  ] },
  { title: 'Your account', body: [
    { list: [
      'Give accurate information and keep your password private. You are responsible for activity under your account.',
      'Company owners and admins decide who joins their company and what each person can do.',
      'Tell us promptly if you think your account has been misused.',
    ] },
  ] },
  { title: 'Your content', body: [
    `You keep ownership of everything you enter into ${APP} (“your content”). You give us permission to store, process and display it only as needed to provide the Service to you and your company.`,
    'You are responsible for your content. Please do not enter passwords, payment card numbers, government ID numbers or other sensitive personal information in your processes.',
  ] },
  { title: 'Acceptable use', body: [
    'Do not:',
    { list: [
      'break the law, or use the Service to harm others;',
      'try to access other people’s accounts or data, or bypass security or access controls;',
      'probe, scan or test the Service for weaknesses without our written permission;',
      'overload the Service, for example with automated or excessive requests (the Service limits request rates);',
      'upload malicious code, or pretend to be someone else.',
    ] },
    'We may suspend or remove accounts that break these rules.',
  ] },
  { title: 'Analysis is guidance, not advice', body: [
    'Health scores, bottleneck findings and suggested improvements come from simple automatic rules applied to the information you enter. They are suggestions only. They are not professional, legal, financial or operational advice, and you should check them before making business decisions.',
  ] },
  { title: 'Availability', body: [
    'We try to keep the Service available, but we do not promise it will always work or be error-free. It may be unavailable during maintenance, or slow to respond after a period of inactivity. Keep your own copy of important data using the export feature.',
  ] },
  { title: 'Ending your use', body: [
    `You can stop using the Service at any time and ask us to delete your data (${EMAIL}). We may suspend or end your access if you break these Terms or if needed to protect the Service or other users.`,
  ] },
  { title: 'No warranties', body: [
    'The Service is provided “as is” and “as available”, without warranties of any kind, to the fullest extent permitted by law.',
  ] },
  { title: 'Limit of liability', body: [
    'To the fullest extent permitted by law, we are not liable for indirect, incidental or consequential losses, or for loss of data, profits or business, arising from your use of the Service. Nothing in these Terms limits liability that cannot be limited by law.',
  ] },
  { title: 'Changes to these Terms', body: [
    'We may update these Terms. When we make an important change we will update the date at the top. Using the Service after a change means you accept the updated Terms.',
  ] },
  { title: 'Governing law', body: [`These Terms are governed by the laws of ${COUNTRY}.`] },
  { title: 'Contact', body: [`${OWNER} · ${EMAIL}`] },
];

// **bold** inside text
function Rich({ text }) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => (part.startsWith('**') ? <strong key={i} className="font-semibold text-ink-900">{part.slice(2, -2)}</strong> : part));
}

function LegalPage({ title, intro, sections, other }) {
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
          <span className="flex gap-5"><Link to={other.to} className="hover:text-ink-900">{other.label}</Link><Link to="/login" className="hover:text-ink-900">Sign in</Link></span>
        </footer>
      </main>
    </div>
  );
}

export function Privacy() {
  return <LegalPage title="Privacy Policy" sections={PRIVACY} other={{ to: '/terms', label: 'Terms of Service' }}
    intro={`This policy explains what information ${APP} collects, how it is used, and the choices you have. We have tried to keep it short and in plain language.`} />;
}

export function Terms() {
  return <LegalPage title="Terms of Service" sections={TERMS} other={{ to: '/privacy', label: 'Privacy Policy' }}
    intro={`These Terms are the rules for using ${APP}. Please read them. They are written to be easy to follow.`} />;
}
