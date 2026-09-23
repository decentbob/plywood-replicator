#!/usr/bin/env node
// Neighbour pairs in newborn strands, by window: the share of BB, AB and AA bonds against the shares expected if blocks
// were placed at random with the window's B fraction. With wedge-shaped B blocks a BB bond is bent twice as much as an
// AB bond, so shape can select on sequence. Usage: node experiments/pairs.js out/SH_*.births.jsonl [--window=200000]
const fs = require('fs');
const win = Number((process.argv.find((a) => a.startsWith('--window=')) || '--window=200000').split('=')[1]);
console.log('| run | window | births | mean len | B fraction | BB bonds (× chance) | AB bonds (× chance) | AA bonds (× chance) |');
console.log('|---|---|---:|---:|---:|---:|---:|---:|');
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const tmax = rows.length ? rows[rows.length - 1].t : 0;
  for (let w0 = 0; w0 < tmax; w0 += win) {
    const rs = rows.filter((r) => r.t >= w0 && r.t < w0 + win); if (!rs.length) continue;
    let len = 0, b = 0, bb = 0, ab = 0, aa = 0;
    for (const r of rs) {
      len += r.seq.length; b += (r.seq.match(/B/g) || []).length;
      for (let i = 0; i + 1 < r.seq.length; i++) { const p = r.seq[i] + r.seq[i + 1]; if (p === 'BB') bb++; else if (p === 'AA') aa++; else ab++; }
    }
    const q = b / len, nb = bb + ab + aa, f2 = (x, e) => `${(100 * x / nb).toFixed(0)}% (${(x / (nb * e)).toFixed(2)})`;
    console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${w0}-${w0 + win} | ${rs.length} | ${(len / rs.length).toFixed(2)} | ${q.toFixed(3)} | ${f2(bb, q * q)} | ${f2(ab, 2 * q * (1 - q))} | ${f2(aa, (1 - q) * (1 - q))} |`);
  }
}
