#!/usr/bin/env node
// Ferris u taháku: v každé lekci drží předmět z její metafory a přidává krátkou radu.
// Vytvoří journal/ferris/tahak-NN.svg a doplní ho pod nadpis Tahák v lekci i infografice.
// Co už Ferrise má, nechá být. Novou lekci stačí přidat do pole LESSONS a spustit znovu.
const fs = require('fs'), path = require('path');
const { holding, rustLogo } = require('./ferris.js');
const J = path.resolve(__dirname, '../../../../journal');

const LESSONS = [
  { md: '00-priprava.md', html: '00-priprava-infografika.html', thing: 'kufřík s nářadím',
    tip: "`cargo check` je rychlá kontrola chyb, `cargo run` program přeloží a rovnou spustí.",
    object: `<path d="M88 20 V11 H112 V20" fill="none" stroke="#234a70" stroke-width="4" stroke-linejoin="round"/><rect x="70" y="20" width="60" height="28" rx="3" fill="#3f78ad" stroke="#234a70" stroke-width="2.5"/><path d="M70 31 H130" stroke="#234a70" stroke-width="2"/><rect x="95" y="27" width="10" height="9" rx="1.5" fill="#efc75e" stroke="#6f4c24" stroke-width="1.5"/>` },
  { md: '01-prvni-program.md', html: '01-prvni-program-infografika.html', thing: 'sklenici se štítkem',
    tip: "Hodnota se má měnit? Přidej `mut`. Výraz do výpisu patří za čárku, do `{…}` jen jméno proměnné.",
    object: `<rect x="76" y="16" width="48" height="32" rx="6" fill="#d7eef0" stroke="#0d7480" stroke-width="2.5"/><rect x="74" y="7" width="52" height="10" rx="2" fill="#c9975c" stroke="#6f4c24" stroke-width="2"/><rect x="85" y="25" width="30" height="14" rx="1.5" fill="#f7f1e3" stroke="#a7773f" stroke-width="1.5"/><path d="M90 32 H110" stroke="#5b6676" stroke-width="2"/>` },
  { md: '02-debugovani.md', html: '02-debugovani-infografika.html', thing: 'dálkové ovládání',
    tip: "`F9` breakpoint, `F5` spustit, `F10` přes řádek, `F11` dovnitř funkce.",
    object: `<rect x="72" y="9" width="56" height="38" rx="7" fill="#2b3442" stroke="#111821" stroke-width="2.5"/><rect x="85" y="17" width="7" height="22" rx="1.5" fill="#fff"/><rect x="97" y="17" width="7" height="22" rx="1.5" fill="#fff"/><circle cx="117" cy="21" r="3.5" fill="#f2766b"/><circle cx="117" cy="33" r="3.5" fill="#74c47a"/>` },
  { md: '03-struktury-a-metody.md', html: '03-struktury-infografika.html', thing: 'kartu úkolu',
    tip: "Metoda jen čte? `&self`. Mění? `&mut self`. A poslední výraz bez `;` je návratová hodnota.",
    object: `<rect x="70" y="9" width="60" height="38" rx="3" fill="#ffffff" stroke="#5b6676" stroke-width="2.5"/><rect x="77" y="17" width="10" height="10" rx="1.5" fill="#dcefdc" stroke="#2e7d32" stroke-width="2"/><path d="M79 22 L81.5 25 L85.5 19" fill="none" stroke="#2e7d32" stroke-width="2" stroke-linecap="round"/><path d="M92 19 H123 M92 26 H116 M77 36 H123" stroke="#5b6676" stroke-width="2.5" stroke-linecap="round"/>` },
  { md: '04-enumy-a-match.md', html: '04-enumy-infografika.html', thing: 'žeton',
    tip: "Každá varianta jinak? Plný `match`. Jen ano, nebo ne? `matches!`. Index zadal uživatel? `.get()`.",
    object: `<circle cx="100" cy="28" r="21" fill="#efc75e" stroke="#a7773f" stroke-width="2.5"/><circle cx="100" cy="28" r="14.5" fill="none" stroke="#a7773f" stroke-width="2" stroke-dasharray="3 3"/><path d="M92 28 L98 34 L109 21" fill="none" stroke="#6f4c24" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>` },
  { md: '05-vlastnictvi-a-vypujcky.md', html: '05-vlastnictvi-infografika.html', thing: 'krabici',
    tip: "Mnoho `&`, nebo jedna `&mut`, nikdy obojí. A výpůjčka končí posledním použitím.",
    object: `<rect x="71" y="13" width="58" height="35" rx="2" fill="#c9975c" stroke="#6f4c24" stroke-width="2.5"/><rect x="93" y="13" width="14" height="35" fill="#efc75e"/><path d="M71 22 H129" stroke="#6f4c24" stroke-width="2"/><rect x="74" y="31" width="14" height="10" fill="#f7f1e3" stroke="#a7773f" stroke-width="1"/>` },
  { md: '06-vstup-od-uzivatele.md', html: '06-vstup-infografika.html', thing: 'terminál',
    tip: "`read_line` text připisuje a nechá v něm `\\n`. Proto `String` uvnitř smyčky a pak `.trim()`.",
    object: `<rect x="70" y="9" width="60" height="38" rx="4" fill="#1b2330" stroke="#0b1016" stroke-width="2.5"/><path d="M70 17 H130" stroke="#3a4656" stroke-width="2"/><circle cx="76" cy="13" r="1.8" fill="#f2766b"/><circle cx="82" cy="13" r="1.8" fill="#efc75e"/><path d="M79 25 L87 31 L79 37" fill="none" stroke="#74c47a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><rect x="92" y="35" width="12" height="3.5" fill="#e6ebf1"/>` },
  { md: '07-chyby.md', html: '07-chyby-infografika.html', thing: 'červenou obálku',
    tip: "Chyba uživatele? `Result` a hláška. Předat o patro výš? `?`. Nemělo by to nastat? `.expect()`.",
    object: `<rect x="70" y="13" width="60" height="35" rx="3" fill="#b42318" stroke="#7a1610" stroke-width="2.5"/><path d="M71 15 L100 35 L129 15" fill="none" stroke="#f9dedb" stroke-width="2.5" stroke-linejoin="round"/><path d="M71 47 L91 29 M129 47 L109 29" stroke="#7a1610" stroke-width="1.5"/>` },
];
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const tipHtml = (t) => t.split('`').map((p, i) => (i % 2 ? `<code>${esc(p)}</code>` : esc(p))).join('');
const nn = (l) => String(l).padStart(2, '0');

fs.mkdirSync(path.join(J, 'ferris'), { recursive: true });
// Ferris v obsahu journalu drží logo Rustu.
fs.writeFileSync(path.join(J, 'ferris', 'ferris.svg'), holding(rustLogo(), 'role="img" aria-label="Krab Ferris drží nad hlavou logo Rustu"', true));

LESSONS.forEach((x, l) => {
  const alt = `Krab Ferris drží nad hlavou ${x.thing}`;
  fs.writeFileSync(path.join(J, 'ferris', `tahak-${nn(l)}.svg`), holding(x.object, `role="img" aria-label="${alt}"`));

  const mdPath = path.join(J, x.md);
  const m = fs.readFileSync(mdPath, 'utf8');
  if (!m.includes('Ferris radí')) {
    const head = '## Tahák\n\n';
    if (m.split(head).length !== 2) throw new Error('nenašel jsem jeden Tahák v ' + x.md);
    fs.writeFileSync(mdPath, m.replace(head, () => `${head}<img src="ferris/tahak-${nn(l)}.svg" alt="${alt}" width="110" align="right">\n\n**Ferris radí:** ${x.tip}\n\n`));
  }

  const htmlPath = path.join(J, 'infografika', x.html);
  const h = fs.readFileSync(htmlPath, 'utf8');
  if (!h.includes('Ferris radí')) {
    const head = '    <h2>Tahák</h2>\n';
    if (h.split(head).length !== 2) throw new Error('nenašel jsem jeden Tahák v ' + x.html);
    const svg = holding(x.object, 'width="110" style="flex:none; height:auto" aria-hidden="true"').trim().replace(/\n\s*/g, '');
    fs.writeFileSync(htmlPath, h.replace(head, () => `    <div style="display:flex; align-items:center; justify-content:space-between; gap:16px">
      <div style="display:grid; gap:6px; min-width:0">
        <h2>Tahák</h2>
        <p><b>Ferris radí:</b> ${tipHtml(x.tip)}</p>
      </div>
      ${svg}
    </div>
`));
  }
});
console.log('hotovo: lekcí', LESSONS.length);
