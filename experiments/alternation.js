#!/usr/bin/env node
// Share of newborns of length >= 4 that alternate perfectly (ABAB..., BABA...), by window, and that share against the
// share expected for random sequences of the same lengths (2 * 0.5^L each). With the feed rule every B between two
// As arms its neighbours, so alternation is the sequence the rule rewards most.
// Usage: node experiments/alternation.js out/L1L_*.births.jsonl [--window=250000]
const fs = require('fs');
const win = Number((process.argv.find((a) => a.startsWith('--window=')) || '--window=250000').split('=')[1]);
const alt = (s) => /^(AB)+A?$|^(BA)+B?$/.test(s);
console.log('| run | alternating share of newborns of length 4+, by window (× chance) | top long sequences, last window |');
console.log('|---|---|---|');
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const tmax = rows.length ? rows[rows.length - 1].t : 0, out = [];
  let last = [];
  for (let w = 0; w < tmax; w += win) {
    const r = rows.filter((x) => x.t >= w && x.t < w + win && x.seq.length >= 4);
    if (!r.length) continue;
    const a = r.filter((x) => alt(x.seq)).length, ch = r.reduce((s, x) => s + 2 * Math.pow(0.5, x.seq.length), 0);
    out.push(`${(100 * a / r.length).toFixed(0)}% (${(a / ch).toFixed(1)})`); last = r;
  }
  const c = {};
  for (const x of last) { const rv = x.seq.split('').reverse().join(''); const k = x.seq < rv ? x.seq : rv; c[k] = (c[k] || 0) + 1; }
  const top = Object.entries(c).sort((p, q) => q[1] - p[1]).slice(0, 5).map(([k, n]) => `${k} ${n}`).join(', ');
  console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${out.join(', ')} | ${top} |`);
}
