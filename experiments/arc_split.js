#!/usr/bin/env node
// RESULTS.md, section 16. An open membrane arc of N wedges, laid out loosely and relaxed (300 steps without the strain
// limit), then left alone: what does it become? Counts outcomes over seeds: rings (by size) and leftover arcs.
// Usage: node experiments/arc_split.js <N> <maxStrain> [unused] [seeds=20] [memAngle=30] [k=v,k=v extra parameters, e.g. snapCorners=true,stiffM=0.7]
const { Sim, L, R, T_M } = require('../src/sim.js');
const N = Number(process.argv[2] || 24), strain = Number(process.argv[3] || 0.25);
const seeds = Number(process.argv[5] || 20), ang = Number(process.argv[6] || 30);
const extra = {}; for (const kv of (process.argv[7] || '').split(',').filter(Boolean)) { const [k, v] = kv.split('='); extra[k] = v === 'true' ? true : v === 'false' ? false : Number(v); }
const tally = new Map(); let ringsTot = 0, blocksInRings = 0;
for (let seed = 1; seed <= seeds; seed++) {
  const s = new Sim(Object.assign({ seed, W: 30, H: 30, nA: 0, nB: 0, nE: 0, nM: N, memAngle: ang, stiffM: 1, pReload: 0, maxStrain: 0 }, extra));
  const r = N / (2 * Math.PI);
  for (let i = 0; i < N; i++) { const th = 2 * Math.PI * i / N * 0.98; s.px[i] = 15 + r * Math.cos(th); s.py[i] = 15 + r * Math.sin(th); s.pa[i] = th; s._resetShape(i); }
  for (let i = 0; i + 1 < N; i++) s._link(i, R, i + 1, L);
  s._deriveAll(); s._computeOpen(); s.run(300); s.p.maxStrain = strain; s.run(20000);
  const seen = new Uint8Array(s.n), rings = [];
  for (let u = 0; u < s.n; u++) { if (seen[u]) continue; const c = s.componentOf(u); c.forEach((x) => seen[x] = 1); const cyc = s.cycleOf(c, T_M); if (cyc.length >= 3) rings.push(cyc.length); }
  rings.sort((a, b) => a - b); ringsTot += rings.length; blocksInRings += rings.reduce((a, b) => a + b, 0);
  const key = rings.length ? 'rings ' + rings.join('+') : 'no ring';
  tally.set(key, (tally.get(key) || 0) + 1);
}
console.log(`arc of ${N}, bend ${ang}, maxStrain ${strain} ${JSON.stringify(extra)}, ${seeds} seeds: ${ringsTot} rings, ${(100 * blocksInRings / (N * seeds)).toFixed(0)}% of blocks in rings`);
for (const [k, v] of [...tally.entries()].sort((a, b) => b[1] - a[1])) console.log(`  ${v} x ${k}`);
