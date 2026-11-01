// Ferris nakreslený jako SVG: nálady pro kvíz a póza, ve které drží nad hlavou předmět.
const fs = require('fs'), path = require('path');

const ORANGE = '#f74c00', DARK = '#a52b00';
const f = (n) => Math.round(n * 10) / 10;

// Krunýř: ostnatý vršek, hladké břicho.
function shell() {
  const cx = 100, cy = 88, rx = 64, ry = 36, spikes = 9;
  const pts = [];
  for (let i = 0; i <= spikes * 2; i++) {
    const a = Math.PI + (i / (spikes * 2)) * Math.PI;
    const k = i % 2 ? 1.17 : 1;
    pts.push(`${f(cx + Math.cos(a) * rx * k)} ${f(cy + Math.sin(a) * ry * k)}`);
  }
  return `<path d="M${pts.join(' L')} Q${cx + rx - 6} ${cy + ry + 2} ${cx} ${cy + ry} Q${cx - rx + 6} ${cy + ry + 2} ${cx - rx} ${cy} Z" fill="${ORANGE}" stroke="${ORANGE}" stroke-width="5" stroke-linejoin="round"/>`;
}
// Klepeto: kolečko s výřezem otočeným ve směru `dir` (ve stupních).
function claw(cx, cy, r, dir) {
  const a = ((dir - 32) * Math.PI) / 180, b = ((dir + 32) * Math.PI) / 180;
  return `<path d="M${cx} ${cy} L${f(cx + Math.cos(b) * r)} ${f(cy + Math.sin(b) * r)} A${r} ${r} 0 1 1 ${f(cx + Math.cos(a) * r)} ${f(cy + Math.sin(a) * r)} Z" fill="${ORANGE}" stroke="${DARK}" stroke-width="2.5" stroke-linejoin="round"/>`;
}
const legs = `<g stroke="${DARK}" stroke-width="7" stroke-linecap="round" fill="none">
  <path d="M50 106 L30 122 L34 134"/><path d="M62 114 L50 130 L56 140"/><path d="M150 106 L170 122 L166 134"/><path d="M138 114 L150 130 L144 140"/>
</g>`;
const arm = (d) => `<path d="${d}" stroke="${DARK}" stroke-width="8" stroke-linecap="round" fill="none"/>`;
const eye = (x, y, gx = -2.5, gy = -3) => `<circle cx="${x}" cy="${y}" r="9" fill="#111"/><circle cx="${x + gx}" cy="${y + gy}" r="3" fill="#fff"/>`;
const smile = `<path d="M86 100 Q100 122 114 100 Z" fill="#111" stroke="#111" stroke-width="2" stroke-linejoin="round"/>`;
const tongue = `<path d="M93 108 Q100 116 107 108 Z" fill="#e8574f"/>`;

const MOODS = {
  // Přemýšlí: jedno klepeto nahoře, oči vzhůru, nad hlavou otazník.
  think: [
    legs, arm('M44 88 Q22 76 22 60'), claw(22, 46, 16, -90), arm('M156 92 Q178 92 176 74'), claw(176, 62, 14, -80), shell(),
    eye(80, 82, 1, -4), eye(120, 82, 1, -4),
    `<path d="M91 103 Q100 108 109 101" stroke="#111" stroke-width="3" stroke-linecap="round" fill="none"/>`,
    `<text x="100" y="40" text-anchor="middle" font-family="Saira Stencil One, Impact, sans-serif" font-size="36" fill="${DARK}">?</text>`,
  ],
  // Radost: obě klepeta nad hlavou, otevřená pusa.
  happy: [
    legs, arm('M46 84 Q26 66 30 40'), claw(32, 26, 17, -90), arm('M154 84 Q174 66 170 40'), claw(168, 26, 17, -90), shell(),
    eye(80, 82), eye(120, 82), smile, tongue,
  ],
  // Smutek: klepeta dole, pusa dolů, slza.
  sad: [
    legs, arm('M44 96 Q22 100 18 116'), claw(16, 126, 14, 90), arm('M156 96 Q178 100 182 116'), claw(184, 126, 14, 90), shell(),
    eye(80, 84), eye(120, 84),
    `<path d="M70 74 L87 69 M130 74 L113 69" stroke="#111" stroke-width="3.5" stroke-linecap="round"/>`,
    `<path d="M88 110 Q100 99 112 110" stroke="#111" stroke-width="3.5" stroke-linecap="round" fill="none"/>`,
    `<path d="M133 92 Q127 101 133 105 Q139 101 133 92 Z" fill="#7cc4ff" stroke="#2b78b8" stroke-width="1"/>`,
  ],
};
// Symboly pro <use> ve stránce kvízu.
const moodSymbols = () => Object.entries(MOODS).map(([k, parts]) =>
  `  <symbol id="ferris-${k}" viewBox="0 0 200 150">\n    ${parts.join('\n    ')}\n  </symbol>`).join('\n');

// Ferris drží předmět nad hlavou. Předmět se vejde do x 70–130, y 8–48 a klepeta ho svírají z boků.
// Spodek předmětu překrývá krunýř, s `inFront` je předmět vidět celý.
function holding(object, attrs, inFront = false) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 150" ${attrs}>
  ${legs}
  ${arm('M46 84 Q28 62 50 42')}
  ${arm('M154 84 Q172 62 150 42')}
  ${inFront ? '' : object}
  ${claw(58, 30, 15, 0)}
  ${claw(142, 30, 15, 180)}
  ${shell()}
  ${inFront ? object : ''}
  ${eye(80, 82)}${eye(120, 82)}
  ${smile}${tongue}
</svg>
`;
}

// Oficiální logo Rustu beze změny, černé na bílém kotouči, aby bylo vidět i v tmavém režimu.
// Podmínky: © Rust Foundation, CC-BY, uvést autora a nevypadat oficiálně (viz journal/README.md).
function rustLogo() {
  const svg = fs.readFileSync(path.join(__dirname, '../assets/rust-logo-blk.svg'), 'utf8');
  const inner = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/)[1].trim();   // všechny cesty, logo má ozubení zvlášť
  // Změřeno v prohlížeči: střed loga (71.06, 70.94), poloměr i s obrysem 52.3 z plátna 144.
  const r = 25, cx = 100, cy = 27, scale = r / 52.3;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#fff"/><g transform="translate(${f(cx - 71.06 * scale)} ${f(cy - 70.94 * scale)}) scale(${Math.round(scale * 1000) / 1000})">${inner}</g>`;
}

module.exports = { moodSymbols, holding, rustLogo };
