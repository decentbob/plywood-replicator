#!/usr/bin/env node
// Births in a capped world (endLoss), by window: how many are capped at both ends (P...Q, the only ones copied whole),
// their mean length, the share carrying each gene and all genes at once, and the commonest capped sequences.
// Usage: node experiments/capped.js ABA,CDC experiments/out/E_*.births.jsonl [--window=100000] [--top=4]
const fs = require('fs');
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const genes = process.argv[2].split(',');
const win = Number(opt('window', 100000)), ntop = Number(opt('top', 4));
const capped = (q) => q[0] === 'P' && q[q.length - 1] === 'Q';
console.log(`| run | window | births | capped | mean capped length | ${genes.map((g) => 'with ' + g).join(' | ')} | with all | commonest capped |`);
console.log('|---|---|---:|---:|---:|' + genes.map(() => '---:').join('|') + '|---:|---|');
for (const f of process.argv.slice(3).filter((a) => !a.startsWith('--'))) {
  if (!fs.existsSync(f)) { console.error('missing ' + f); continue; }
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const tmax = rows.length ? rows[rows.length - 1].t : 0;
  for (let w0 = 0; w0 < tmax; w0 += win) {
    const rs = rows.filter((r) => r.t >= w0 && r.t < w0 + win); if (!rs.length) continue;
    const cp = rs.filter((r) => capped(r.seq));
    const pct = (k) => cp.length ? (100 * k / cp.length).toFixed(0) + '%' : '-';
    const len = cp.length ? (cp.reduce((a, r) => a + r.seq.length, 0) / cp.length).toFixed(2) : '-';
    const cnt = {}; for (const r of cp) cnt[r.seq] = (cnt[r.seq] || 0) + 1;
    const top = Object.entries(cnt).sort((a, b) => b[1] - a[1]).slice(0, ntop).map(([q, c]) => `${q} ${c}`).join(', ');
    const cells = genes.map((g) => pct(cp.filter((r) => r.seq.includes(g)).length));
    console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${w0 / 1000}k-${(w0 + win) / 1000}k | ${rs.length} | ${cp.length} | ${len} | ${cells.join(' | ')} | ${pct(cp.filter((r) => genes.every((g) => r.seq.includes(g))).length)} | ${top} |`);
  }
}
