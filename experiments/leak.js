#!/usr/bin/env node
// RESULTS.md, section 25. Particles started inside a closed membrane ring (resistant to rays): how many are outside after T
// steps? Energy particles (E) or rays (X) at several mobilities, walls at membrane mobility mobM.
// Usage: node experiments/leak.js [mobM=0.5]
const { Sim, T_M, T_E, T_X, L, R } = require('../src/sim.js');
let NP = 3; const MOBM = Number(process.argv[2] || 0.5);
function run(kind, mob, steps) {
  const N = 24, cx = 15, cy = 15, r = N / (2 * Math.PI);
  const s = new Sim({ seed: 2, W: 30, H: 30, nA: 0, nB: 0, nE: kind === 'E' ? NP : 0, nX: kind === 'X' ? NP : 0, nM: N, memAngle: 15, stiffM: 1, snapCorners: true, pReload: 0, mobE: kind === 'E' ? mob : 1, mobX: kind === 'X' ? mob : 1, resM: 1, rayHit: 0, mobM: MOBM });
  const mem = [], parts = []; for (let u = 0; u < s.n; u++) (s.type[u] === T_M ? mem : parts).push(u);
  mem.forEach((u, i) => { const th = 2 * Math.PI * i / N; s.px[u] = cx + r * Math.cos(th); s.py[u] = cy + r * Math.sin(th); s.pa[u] = th; s._resetShape(u); });
  mem.forEach((u, i) => s._link(u, R, mem[(i + 1) % N], L));
  parts.forEach((u, i) => { s.px[u] = cx + (i % 5 - 2) * 0.6; s.py[u] = cy + (Math.floor(i / 5) - 2) * 0.6; });
  s._deriveAll(); s._computeOpen(); s.run(steps);
  const ins = new Set(s.enclosedBy(mem)); const out = parts.filter((u) => !ins.has(u)).length;
  return `${kind} mobility ${mob}: ${out} of ${parts.length} outside after ${steps} steps`;
}
for (const [k, m] of [['E', 1], ['E', 0.2], ['X', 0.3], ['X', 0.12], ['X', 0.08]]) console.log(`walls at mobM ${MOBM}: ` + run(k, m, 20000));
