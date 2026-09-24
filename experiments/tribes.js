#!/usr/bin/env node
// RESULTS.md, section 26. Newborns by "tribe": a strand that uses at most one letter of each binding pair (A-B, C-D) can never
// bind a strand of its own tribe, itself included. Tribes AC, AD, BC, BD (a strand of one letter kind belongs to two; counted
// under the first that fits), and "mixed" for strands carrying both letters of a pair (which can bind their own kind).
// Usage: node experiments/tribes.js out/X.births.jsonl ... [--window=250000]
const fs = require('fs');
const win = Number((process.argv.find((a) => a.startsWith('--window=')) || '--window=250000').split('=')[1]);
const tribeOf = (q) => { const has = (c) => q.includes(c); if ((has('A') && has('B')) || (has('C') && has('D'))) return 'mixed';
  return (has('B') ? 'B' : 'A') + (has('D') ? 'D' : 'C'); };
console.log('| run | window | births | mean len | AC | AD | BC | BD | mixed | CAC per block |');
console.log('|---|---|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((r) => r.seq.length >= 3);
  const tmax = rows.length ? rows[rows.length - 1].t : 0;
  for (let w0 = 0; w0 < tmax; w0 += win) {
    const rs = rows.filter((r) => r.t >= w0 && r.t < w0 + win); if (!rs.length) continue;
    const c = { AC: 0, AD: 0, BC: 0, BD: 0, mixed: 0 }; let len = 0, cac = 0;
    for (const r of rs) { c[tribeOf(r.seq)]++; len += r.seq.length; for (let i = 0; i + 3 <= r.seq.length; i++) if (r.seq.startsWith('CAC', i)) cac++; }
    const pc = (k) => (100 * c[k] / rs.length).toFixed(0) + '%';
    console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${w0}-${w0 + win} | ${rs.length} | ${(len / rs.length).toFixed(2)} | ${pc('AC')} | ${pc('AD')} | ${pc('BC')} | ${pc('BD')} | ${pc('mixed')} | ${(cac / len).toFixed(3)} |`);
  }
}
