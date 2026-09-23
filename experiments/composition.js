#!/usr/bin/env node
// Composition of births over time: fraction of B blocks and ABA motifs per block, in windows. "ABA vs chance" divides
// the motifs observed by those expected if every newborn's blocks were drawn at random with the window's B fraction.
// Usage: node experiments/composition.js out/X_*.births.jsonl [--window=25000]
const fs = require('fs');
const win = Number((process.argv.find((a) => a.startsWith('--window=')) || '--window=25000').split('=')[1]);
const files = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const motifs = (s) => { let n = 0; for (let i = 1; i + 1 < s.length; i++) if (s[i] === 'B' && s[i - 1] === 'A' && s[i + 1] === 'A') n++; return n; };
console.log('| run | window | births | mean len | B fraction | ABA per block | ABA vs chance | first birth |');
console.log('|---|---|---:|---:|---:|---:|---:|---:|');
for (const f of files) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  if (!rows.length) { console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | - | 0 | - | - | - | never |`); continue; }
  const tmax = rows[rows.length - 1].t;
  for (let w0 = 0; w0 <= tmax; w0 += win) {
    const rs = rows.filter((r) => r.t >= w0 && r.t < w0 + win);
    if (!rs.length) continue;
    let len = 0, b = 0, m = 0;
    let inner = 0;
    for (const r of rs) { len += r.seq.length; b += (r.seq.match(/B/g) || []).length; m += motifs(r.seq); inner += Math.max(0, r.seq.length - 2); }
    const q = b / len, expect = inner * q * (1 - q) * (1 - q);
    console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${w0}-${w0 + win} | ${rs.length} | ${(len / rs.length).toFixed(2)} | ${q.toFixed(3)} | ${(m / len).toFixed(3)} | ${expect ? (m / expect).toFixed(2) : '-'} | ${w0 === 0 ? rows[0].t : ''} |`);
  }
}
