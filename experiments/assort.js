#!/usr/bin/env node
// Spatial assortment of a motif among newborns: for each newborn that carries the motif, the share of other newborns born
// within --r (world units) and --dt steps that also carry it, against the share among all newborns in the same time
// window. Above 1, carriers are born next to carriers (kin clusters); 1 means the world is well mixed at that scale.
// Usage: node experiments/assort.js ABA out/X.births.jsonl ... [--r=5] [--dt=5000] [--W=40]
const fs = require('fs');
const arg = (k, d) => Number((process.argv.find((a) => a.startsWith('--' + k + '=')) || `--${k}=${d}`).split('=')[1]);
const m = process.argv[2], r = arg('r', 5), dt = arg('dt', 5000), W = arg('W', 40);
const wrap = (d) => d - W * Math.round(d / W);
console.log('| run | carriers | share of carriers among all newborns | share among carriers\' neighbours | assortment |');
console.log('|---|---:|---:|---:|---:|');
for (const f of process.argv.slice(3).filter((a) => !a.startsWith('--'))) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((b) => b.seq.length >= 3);
  const has = rows.map((b) => b.seq.includes(m));
  let nb = 0, nbHas = 0, base = 0, baseHas = 0, carriers = 0;
  let lo = 0;
  for (let i = 0; i < rows.length; i++) {
    while (rows[lo].t < rows[i].t - dt) lo++;
    for (let j = lo; j < rows.length && rows[j].t <= rows[i].t + dt; j++) {
      if (j === i) continue;
      base++; if (has[j]) baseHas++;   // everyone in the time window, the well-mixed expectation for i
      if (!has[i]) continue;
      const dx = wrap(rows[j].x - rows[i].x), dy = wrap(rows[j].y - rows[i].y);
      if (dx * dx + dy * dy <= r * r) { nb++; if (has[j]) nbHas++; }
    }
    if (has[i]) carriers++;
  }
  const pAll = baseHas / base, pNb = nbHas / nb;
  console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${carriers} | ${pAll.toFixed(3)} | ${pNb.toFixed(3)} | ${(pNb / pAll).toFixed(2)} |`);
}
