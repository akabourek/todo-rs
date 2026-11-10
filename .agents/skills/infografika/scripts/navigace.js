#!/usr/bin/env node
// Navigace infografik: nahoře i dole na stránce odkazy na předchozí infografiku, text lekce, obsah,
// další infografiku a GitHub. Pořadí řady = pořadí souborů journal/infografika/NN-*-infografika.html.
// Lekci pozná podle odkazu ../NN-….md v horní navigaci, titulek infografiky podle <title>.
// Spouštět po přidání nové infografiky (doplní "další" i do předchozí). Opakované spuštění nic nerozbije.
const fs = require('fs'), path = require('path');
const DIR = path.resolve(__dirname, '../../../../journal/infografika');
const GH = 'https://github.com/akabourek/todo-rs';
const STYLE = 'display:flex; flex-wrap:wrap; gap:4px 18px; font-size:0.95rem';

const files = fs.readdirSync(DIR).filter((f) => /^\d\d-.*-infografika\.html$/.test(f)).sort();
const pages = files.map((file) => {
  const html = fs.readFileSync(path.join(DIR, file), 'utf8');
  const title = html.match(/<title>([^<]*)<\/title>/)[1];
  const top = html.match(/<nav aria-label="Navigace"[^>]*>[\s\S]*?<\/nav>/);
  if (!top) throw new Error('chybí horní navigace v ' + file);
  const m = top[0].match(/href="\.\.\/(\d\d-[^"]+\.md)">(?:← Lekce|Text lekce) (\d\d): ([^<]+)</);
  if (!m) throw new Error('v navigaci chybí odkaz na lekci: ' + file);
  return { file, html, title, md: m[1], nn: m[2], lesson: m[3] };
});

const nav = (i, label) => {
  const p = pages[i], prev = pages[i - 1], next = pages[i + 1];
  const links = [
    prev && `<a href="${prev.file}">← Infografika ${prev.nn}: ${prev.title}</a>`,
    `<a href="../${p.md}">Text lekce ${p.nn}: ${p.lesson}</a>`,
    '<a href="../README.md">Obsah</a>',
    next && `<a href="${next.file}">Infografika ${next.nn}: ${next.title} →</a>`,
    `<a href="${GH}">GitHub</a>`,
  ].filter(Boolean);
  return `<nav aria-label="${label}" style="${STYLE}">\n${links.map((l) => '    ' + l).join('\n')}\n  </nav>`;
};

pages.forEach((p, i) => {
  let h = p.html.replace(/<nav aria-label="Navigace"[^>]*>[\s\S]*?<\/nav>/, () => nav(i, 'Navigace'));
  if (/<nav aria-label="Navigace dole"/.test(h)) {
    h = h.replace(/<nav aria-label="Navigace dole"[^>]*>[\s\S]*?<\/nav>/, () => nav(i, 'Navigace dole'));
  } else {
    if (h.split('</footer>').length !== 2) throw new Error('nenašel jsem jeden </footer> v ' + p.file);
    h = h.replace('</footer>', () => `</footer>\n\n  ${nav(i, 'Navigace dole')}`);
  }
  if (h !== p.html) fs.writeFileSync(path.join(DIR, p.file), h);
});
console.log('navigace:', pages.map((p) => p.nn).join(' '));
