// Runs after `vite build`. Writes dist/privacy.html and dist/terms.html: complete, static HTML pages.
// The app is a single-page application, so without this a crawler (such as Google's app reviewers) that does not run
// JavaScript would see an empty page at /privacy. These pages contain the full text and need no JavaScript.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { LEGAL } from '../src/lib/legal.js';
import { PAGES } from '../src/lib/legalContent.js';
import { HORIZONTAL_VIEWBOX, MARK_PATHS, MARK_CIRCLES, WORDMARK_PATH } from '../src/components/logoData.js';

const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist');
if (!fs.existsSync(dist)) throw new Error('dist/ not found. Run "vite build" first.');

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rich = (s) => esc(s).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

const logo = `<svg viewBox="${HORIZONTAL_VIEWBOX}" height="32" role="img" aria-label="${esc(LEGAL.appName)}">${MARK_PATHS.map((d) => `<path fill="#4F46E5" d="${d}"/>`).join('')}${MARK_CIRCLES.map(([x, y, r]) => `<circle fill="#4F46E5" cx="${x}" cy="${y}" r="${r}"/>`).join('')}<path fill="#1E1B4B" d="${WORDMARK_PATH}"/></svg>`;

const css = `
*{box-sizing:border-box}body{margin:0;background:#f5f6fb;color:#475569;font:16px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
a{color:#4338ca}header{border-bottom:1px solid #e2e8f0;background:#fff}
.bar{max-width:768px;margin:0 auto;padding:14px 20px;display:flex;align-items:center;justify-content:space-between}
.bar a.back{color:#475569;text-decoration:none;font-size:14px;font-weight:500}
main{max-width:768px;margin:0 auto;padding:48px 20px 64px}
h1{font-size:40px;line-height:1.15;color:#1e1b4b;margin:0 0 6px;letter-spacing:-.02em}
h2{font-size:20px;color:#1e1b4b;margin:0 0 10px}.updated{color:#94a3b8;font-size:14px;margin:0 0 20px}
.intro{font-size:17px}nav.toc{background:#fff;border:1px solid #e2e8f0;border-radius:16px;padding:18px 22px;margin:28px 0 36px}
nav.toc p{margin:0 0 8px;font-weight:600;color:#1e1b4b;font-size:14px}nav.toc ol{margin:0;padding-left:20px;columns:2;font-size:14px}
section{margin:0 0 34px;scroll-margin-top:16px}section p{margin:0 0 12px}ul{margin:0 0 12px;padding-left:22px}li{margin:0 0 8px}strong{color:#1e1b4b}
footer{margin-top:48px;padding-top:22px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px;font-size:14px;color:#64748b}
footer a{margin-left:18px}@media(max-width:560px){h1{font-size:32px}nav.toc ol{columns:1}}`;

function render(page) {
  const url = `${LEGAL.siteUrl}${page.path}`;
  const sections = page.sections.map((s, i) => `<section id="s${i + 1}"><h2>${i + 1}. ${esc(s.title)}</h2>${s.body.map((b) => (typeof b === 'string' ? `<p>${rich(b)}</p>` : `<ul>${b.list.map((li) => `<li>${rich(li)}</li>`).join('')}</ul>`)).join('')}</section>`).join('');
  const toc = page.sections.map((s, i) => `<li><a href="#s${i + 1}">${esc(s.title)}</a></li>`).join('');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(page.title)} · ${esc(LEGAL.appName)}</title>
<meta name="description" content="${esc(page.description)}">
<meta name="robots" content="index, follow">
<link rel="canonical" href="${esc(url)}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#4F46E5">
<style>${css}</style>
</head>
<body>
<header><div class="bar"><a href="/" aria-label="${esc(LEGAL.appName)} home">${logo}</a><a class="back" href="/">&larr; Back to ${esc(LEGAL.appName)}</a></div></header>
<main>
<h1>${esc(page.title)}</h1>
<p class="updated">Last updated: ${esc(LEGAL.updated)}</p>
<p class="intro">${esc(page.intro)}</p>
<nav class="toc" aria-label="On this page"><p>On this page</p><ol>${toc}</ol></nav>
${sections}
<footer><span>&copy; ${new Date().getFullYear()} ${esc(LEGAL.appName)}</span><span><a href="${page.other.path}">${esc(page.other.label)}</a><a href="/login">Sign in</a></span></footer>
</main>
</body>
</html>
`;
}

for (const [name, page] of Object.entries(PAGES)) {
  const html = render(page);
  fs.writeFileSync(path.join(dist, `${name}.html`), html);
  const words = html.replace(/<style[\s\S]*?<\/style>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
  console.log(`prerendered /${name} (${words} words of readable text)`);
}
