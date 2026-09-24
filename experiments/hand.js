#!/usr/bin/env node
// Chirality of newborns over time (RESULTS.md, section 30): per window, the share of births that are all upper case (one hand),
// all lower case (the mirror hand) or mixed, and the enantiomeric excess |up - lo| / (up + lo).
// Usage: node experiments/hand.js out/CH_*.births.jsonl [--window=50000]
const fs = require('fs');
const win = Number((process.argv.find((a) => a.startsWith('--window=')) || '--window=50000').split('=')[1]);
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const w = [];
  for (const l of fs.readFileSync(f, 'utf8').split('\n')) {
    if (!l.trim()) continue; const b = JSON.parse(l); if (b.seq.length < 2) continue;
    const k = Math.floor(b.t / win); w[k] = w[k] || { up: 0, lo: 0, mix: 0 };
    if (b.seq === b.seq.toUpperCase()) w[k].up++; else if (b.seq === b.seq.toLowerCase()) w[k].lo++; else w[k].mix++;
  }
  console.log(f.split('/').pop().replace('.births.jsonl', ''), w.map((x) => x ? `${x.up}/${x.lo}/${x.mix} ee${((Math.abs(x.up - x.lo)) / Math.max(1, x.up + x.lo)).toFixed(2)}` : '-').join(' | '));
}
