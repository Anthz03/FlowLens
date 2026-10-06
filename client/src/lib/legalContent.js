// The text of the Privacy Policy and Terms of Service. Plain data, shared by the in-app pages (Legal.jsx)
// and by the build step that creates static HTML pages for search engines and Google's reviewers (scripts/prerender-legal.mjs).
import { LEGAL } from './legal.js';

const { appName: APP, owner: OWNER, contactName: CONTACT, contactEmail: EMAIL, country: COUNTRY } = LEGAL;

// Each section: a title and a list of blocks. A block is a paragraph (string) or { list: [...] }. **bold** is supported.
export const PRIVACY = [
  { title: 'Who we are', body: [
    `${APP} is a web application that helps small and medium businesses document, visualize, analyze and improve their business processes. It is operated by ${OWNER} (“we”, “us”) and is available at ${LEGAL.siteUrl}.`,
    `If you have a question about this policy or your information, contact us at ${EMAIL}.`,
  ] },
  { title: 'Information we collect', body: [
    'We collect only what we need to run the service:',
    { list: [
      '**Account details:** your name, email address, job title, and your role in your company (owner, admin or member). Your password is never stored as you typed it. We store only a salted, one-way hash of it.',
      '**Google sign-in:** if you choose “Sign in with Google”, Google tells us your name, email address, profile picture link and Google account ID. We never see your Google password. See “Google user data” below.',
      '**Company details:** your company name, type of business, size and departments.',
      '**Setup answers (optional):** how you found us, your role, what you want to do with the app, how your processes are documented today, and your biggest daily problem.',
      '**Your process data:** the processes, steps, descriptions, roles, tools, inputs, outputs, time estimates, diagrams, analysis results and notes you enter.',
      '**Security and activity records:** sign-ins, failed sign-in attempts, password changes, role changes, exports and deletions, with the IP address and browser type. We keep these for 90 days to keep accounts safe.',
      '**Technical data:** like most websites, our servers and hosting providers record standard request information such as IP address and time.',
    ] },
  ] },
  { title: 'Google user data', body: [
    `${APP} offers “Sign in with Google”. When you use it, we request only the basic sign-in permissions (openid, email and profile). We do not request access to your Gmail, Google Drive, Google Calendar, contacts or any other Google service.`,
    'The Google data we receive and store is limited to:',
    { list: [
      'your **name**,',
      'your **email address**,',
      'your **profile picture link**, and',
      'your **Google account ID** (a number that identifies your Google account to us).',
    ] },
    '**How we use it:** only to create your account, recognize you when you sign in, and show your name in the app. We do not use Google user data for advertising, we do not sell it, we do not transfer it to third parties except the service providers listed below that host the app for us, and we do not use it to train machine-learning or AI models.',
    '**How we protect it:** it is stored in an access-controlled database, transmitted over encrypted connections, and visible only to you and to people in your own company as described in this policy.',
    `**Retention and deletion:** we keep it while your account exists. To delete it, email ${EMAIL} and we will delete your account data. You can also remove FlowLens’s access to your Google account at any time at myaccount.google.com/permissions.`,
    `${APP}’s use and transfer of information received from Google APIs adheres to the Google API Services User Data Policy, including the Limited Use requirements.`,
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
  { title: 'Contact', body: [`${OWNER} · ${CONTACT} · ${EMAIL}`] },
];

export const TERMS = [
  { title: 'Agreement', body: [
    `By creating an account or using ${APP} (“the Service”), you agree to these Terms and to our Privacy Policy. If you use the Service for a company, you confirm you have the authority to accept these Terms for it. If you do not agree, please do not use the Service.`,
    'You must be at least 13 years old to use the Service.',
  ] },
  { title: 'What the Service does', body: [
    `${APP} lets you describe business processes, view them as diagrams, and receive rule-based analysis, scores and improvement suggestions. The Service is a prototype. We may change, add or remove features at any time.`,
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
  { title: 'Contact', body: [`${OWNER} · ${CONTACT} · ${EMAIL}`] },
];

export const PAGES = {
  privacy: {
    path: '/privacy', title: 'Privacy Policy', sections: PRIVACY, other: { path: '/terms', label: 'Terms of Service' },
    intro: `This policy explains what information ${APP} collects, how it is used, and the choices you have. We have tried to keep it short and in plain language.`,
    description: `How ${APP} collects, uses and protects your information, including Google sign-in data.`,
  },
  terms: {
    path: '/terms', title: 'Terms of Service', sections: TERMS, other: { path: '/privacy', label: 'Privacy Policy' },
    intro: `These Terms are the rules for using ${APP}. Please read them. They are written to be easy to follow.`,
    description: `The rules for using ${APP}.`,
  },
};
