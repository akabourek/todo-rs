#!/usr/bin/env node
// Složí journal/kviz/kviz.html: šablona + otázky bez kontrol + Ferris jako SVG symboly.
const fs = require('fs'), path = require('path');
const { moodSymbols } = require('../../infografika/scripts/ferris.js');
const K = path.resolve(__dirname, '..');
const OUT = path.resolve(K, '../../../journal/kviz/kviz.html');
const Q = require(path.join(K, 'questions.js')).map(({ checks, ...q }) => q);

const json = '[\n' + Q.map((q) => '  ' + JSON.stringify(q).replace(/</g, '\\u003c')).join(',\n') + '\n]';
const html = fs.readFileSync(path.join(K, 'template.html'), 'utf8')
  .replace('__FERRIS_SYMBOLS__', () => moodSymbols())
  .replace('__QUESTIONS__', () => json);
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, html);
console.log('zapsáno', OUT, html.length, 'B');
