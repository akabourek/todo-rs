#!/usr/bin/env node
// Ověří každou otázku na skutečném rustc: chybové kódy, výstupy, paniky i běh ToDo programu z gitového tagu.
// Dočasné soubory jdou do $TMPDIR. Návratový kód 1, pokud něco nesedí.
const { spawnSync } = require('child_process');
const fs = require('fs'), os = require('os'), path = require('path');
const K = path.resolve(__dirname, '..');
const ROOT = path.resolve(K, '../../..');
const Q = require(path.join(K, 'questions.js'));
const tmp = fs.mkdtempSync(path.join(process.env.TMPDIR || os.tmpdir(), 'kviz-'));
let fails = 0, checked = 0;
const lessons = {};
function compile(src, bin) {
  const f = bin + '.rs';
  fs.writeFileSync(f, src);
  return spawnSync('rustc', ['--edition', '2024', '-o', bin, f], { encoding: 'utf8' });
}
function source(q, c) {
  if (c.tag) return spawnSync('git', ['show', `${c.tag}:src/main.rs`], { cwd: ROOT, encoding: 'utf8' }).stdout;
  return c.src || q.code;
}
Q.forEach((q, i) => {
  lessons[q.l] = (lessons[q.l] || 0) + 1;
  const tag = `#${i} L${q.l} ${q.q.slice(0, 50)}`;
  const bad = (m) => { fails++; console.log('FAIL', tag, '\n  ', m); };
  if (q.opts.filter((o) => o.ok).length !== 1) bad('počet správných != 1');
  if (q.opts.length !== 4) bad('počet možností != 4');
  if (q.code && !q.checks) bad('má kód, ale žádnou kontrolu');
  (q.checks || []).forEach((c, j) => {
    checked++;
    const bin = path.join(tmp, `q${i}_${j}`);
    const r = compile(source(q, c), bin);
    if (c.err) {
      if (r.status === 0) return bad(`[${j}] přeložilo se, čekal jsem ${c.err}`);
      if (c.err !== 'any' && !r.stderr.includes(`error[${c.err}]`)) return bad(`[${j}] čekal jsem ${c.err}:\n${r.stderr.split('\n').filter((l) => l.startsWith('error')).join('\n')}`);
      if (c.count) { const n = r.stderr.split('\n').filter((l) => /^error\[/.test(l)).length; if (n !== c.count) bad(`[${j}] počet chyb ${n} != ${c.count}`); }
      return;
    }
    if (r.status !== 0) return bad(`[${j}] nepřeložilo se:\n${r.stderr}`);
    if (c.warn && !r.stderr.includes(c.warn)) bad(`[${j}] chybí varování ${c.warn}`);
    const run = spawnSync(bin, [], { input: c.stdin ?? '', encoding: 'utf8', timeout: 5000 });
    if (c.panic) { if (run.status === 0 || !run.stderr.includes(c.panic)) bad(`[${j}] čekal jsem paniku "${c.panic}", status ${run.status}: ${run.stderr}`); return; }
    if (run.stdout !== c.out) bad(`[${j}] výstup ${JSON.stringify(run.stdout)} != ${JSON.stringify(c.out)}`);
    if (c.stderr && !run.stderr.includes(c.stderr)) bad(`[${j}] stderr bez "${c.stderr}": ${run.stderr}`);
  });
  // Správná odpověď by neměla být nápadně nejdelší.
  const text = (o) => o.t || o.code;
  const okLen = text(q.opts.find((o) => o.ok)).length;
  if (okLen > Math.max(...q.opts.filter((o) => !o.ok).map((o) => text(o).length)) + 12) console.log('DLOUHÁ', tag);
});
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`otázek: ${Q.length}, kontrol na rustc: ${checked}, selhalo: ${fails}`);
console.log('po lekcích:', JSON.stringify(lessons));
process.exit(fails ? 1 : 0);
