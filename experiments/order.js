#!/usr/bin/env node
// Letter order in capped newborns (P...Q, caps stripped), per window: share of A, mean run length (runs of one letter), share of
// genomes with a run of four or more, share that alternate throughout, mean length, and the commonest genomes (either direction).
// For evolution runs where the order of letters, not only their make-up, may adapt (RESULTS 41: folds and fuel sizes).
//   node experiments/order.js out/EV12_*.births.jsonl [--window=50000] [--top=4] [--sum]   (--sum: one line per file group)
const fs = require('fs');
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const win = Number(opt('window', 50000)), ntop = Number(opt('top', 4));
const rc = (q) => q.split('').reverse().join('');
const canon = (q) => (q < rc(q) ? q : rc(q));
const runs = (q) => { const r = []; let n = 1; for (let i = 1; i <= q.length; i++) { if (i < q.length && q[i] === q[i - 1]) n++; else { r.push(n); n = 1; } } return r; };
console.log('| run | window | capped births | length | A share | mean run | run of 4+ | alternating | commonest |');
console.log('|---|---|---:|---:|---:|---:|---:|---:|---|');
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l))
    .filter((r) => !r.prod && r.seq.length >= 4 && ((r.seq[0] === 'P' && r.seq.endsWith('Q')) || (r.seq[0] === 'Q' && r.seq.endsWith('P'))));
  const tmax = rows.length ? rows[rows.length - 1].t : 0;
  for (let w0 = 0; w0 <= tmax; w0 += win) {
    const rs = rows.filter((r) => r.t >= w0 && r.t < w0 + win).map((r) => r.seq.slice(1, -1)).filter((q) => q.length > 0);
    if (!rs.length) continue;
    let a = 0, n = 0, rl = 0, nr = 0, r4 = 0, alt = 0, len = 0; const cnt = {};
    for (const q of rs) {
      for (const c of q) { if (c === 'A') a++; n++; }
      const r = runs(q); rl += r.reduce((x, y) => x + y, 0); nr += r.length;
      if (Math.max(...r) >= 4) r4++; if (Math.max(...r) === 1) alt++; len += q.length;
      const k = canon(q); cnt[k] = (cnt[k] || 0) + 1;
    }
    const top = Object.entries(cnt).sort((x, y) => y[1] - x[1]).slice(0, ntop).map(([q, c]) => `${q} ${c}`).join(', ');
    console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${w0 / 1000}k | ${rs.length} | ${(len / rs.length).toFixed(1)} | ${(100 * a / n).toFixed(0)}% | ${(rl / nr).toFixed(2)} | ${(100 * r4 / rs.length).toFixed(0)}% | ${(100 * alt / rs.length).toFixed(0)}% | ${top} |`);
  }
}
