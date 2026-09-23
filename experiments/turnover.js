#!/usr/bin/env node
// Diversity and turnover of newborn sequences, by window: distinct sequences, Shannon entropy (bits), the dominant
// sequence and its share. Sequences are read without direction (a strand and its reverse are one). A dominant sequence
// that keeps being replaced is the mark of frequency-dependent selection.
// Usage: node experiments/turnover.js out/HY_*.births.jsonl [--window=100000]
const fs = require('fs');
const win = Number((process.argv.find((a) => a.startsWith('--window=')) || '--window=100000').split('=')[1]);
const canon = (s) => { const r = s.split('').reverse().join(''); return s < r ? s : r; };
console.log('| run | windows: distinct / entropy (bits) / dominant (share) | dominant changes | mean distinct | mean entropy |');
console.log('|---|---|---:|---:|---:|');
for (const f of process.argv.slice(2).filter((a) => !a.startsWith('--'))) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const tmax = rows.length ? rows[rows.length - 1].t : 0, cells = [];
  let changes = 0, prev = '', sumD = 0, sumH = 0, nw = 0;
  for (let w0 = 0; w0 < tmax; w0 += win) {
    const rs = rows.filter((r) => r.t >= w0 && r.t < w0 + win && r.seq.length >= 3); if (!rs.length) continue;
    const c = new Map(); for (const r of rs) { const k = canon(r.seq); c.set(k, (c.get(k) || 0) + 1); }
    let H = 0; for (const n of c.values()) { const q = n / rs.length; H -= q * Math.log2(q); }
    const [top, tn] = [...c.entries()].sort((a, b) => b[1] - a[1])[0];
    if (prev && top !== prev) changes++; prev = top; sumD += c.size; sumH += H; nw++;
    cells.push(`${c.size} / ${H.toFixed(1)} / ${top} (${(100 * tn / rs.length).toFixed(0)}%)`);
  }
  console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${cells.join('; ')} | ${changes} | ${(sumD / nw).toFixed(0)} | ${(sumH / nw).toFixed(2)} |`);
}
