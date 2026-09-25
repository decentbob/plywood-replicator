#!/usr/bin/env node
// Rebuild the knob index of experiments/LEDGER.md: for every knob named in backticks in the Mechanism column of the
// experiment table, the rows that used it and their verdicts. Writes between the <!-- knob-index --> markers.
//   node tools/ledger_index.js            (in place)     node tools/ledger_index.js --print   (to stdout only)
const fs = require('fs'), path = require('path');
const file = path.join(__dirname, '../experiments/LEDGER.md');
const text = fs.readFileSync(file, 'utf8');
const rows = text.split('\n').filter((l) => /^\| *[0-9]+[a-z']*\b/.test(l));
// only knobs: current DEFAULTS, per-type knobs (sizeA, fold1 ...), and knobs of mechanisms removed since (kept for history)
const { DEFAULTS, REMOVED } = require('../src/sim.js');
const OLD = ['energyMode', 'sun', 'spend', ...REMOVED];
const isKnob = (k) => k in DEFAULTS || OLD.includes(k) || /^(size|mob|bend|fold|stiff|res|shape)[A-Z0-9]$/.test(k);
const idx = new Map();
for (const r of rows) {
  const c = r.split('|').map((x) => x.trim());   // ['', §, name, question, mechanism, verdict, ...]
  const sec = c[1], verdict = c[5];
  for (const m of c[4].matchAll(/`([A-Za-z][A-Za-z0-9]*)`/g)) {
    const k = m[1]; if (!isKnob(k)) continue; if (!idx.has(k)) idx.set(k, []);
    const list = idx.get(k); if (!list.some((e) => e.sec === sec)) list.push({ sec, verdict });
  }
}
const keys = [...idx.keys()].sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
const out = ['| knob | rows (verdict) |', '|---|---|'];
for (const k of keys) out.push(`| \`${k}\` | ${idx.get(k).map((e) => `${e.sec} (${e.verdict})`).join(', ')} |`);
const block = out.join('\n');
if (process.argv.includes('--print')) { console.log(block); process.exit(0); }
const a = text.indexOf('<!-- knob-index -->'), b = text.indexOf('<!-- /knob-index -->');
if (a < 0 || b < 0) { console.error('markers not found'); process.exit(1); }
fs.writeFileSync(file, text.slice(0, a) + '<!-- knob-index -->\n' + block + '\n' + text.slice(b));
console.log(`${keys.length} knobs indexed from ${rows.length} rows`);
