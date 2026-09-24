#!/usr/bin/env node
// RESULTS.md, section 25. Does a closed membrane ring shield what it encloses from rays? A hand-built ring of membrane at
// its natural size with one strand inside, one identical strand outside, rays all around; energy off so nothing copies.
// Counts ray hits on each strand's bonds (a broken bond relinks at once if the halves are still flush? no: they are
// re-pinned only by rule, so each hit is counted, and the strand is rebuilt after it breaks to keep the exposure equal).
// Usage: node experiments/ray_shield.js [nX=60] [steps=20000] [mobS=0.3] [mobM=1] [mobX=0.12]
const { Sim, T_M, T_X, L, R, I_TPL } = require('../src/sim.js');
const nX = Number(process.argv[2] || 60), steps = Number(process.argv[3] || 20000);
const N = 24, ang = 15;
const s = new Sim({ seed: 1, W: 30, H: 30, nA: 12, nB: 0, nE: 0, nM: N, nX, memAngle: ang, stiffM: 1, snapCorners: true, pReload: 0, energyGate: true, maxEventLog: 2000,
  rayHit: 0.05, resM: 1, mobS: Number(process.argv[4] || 0.3), mobM: Number(process.argv[5] || 1), mobX: Number(process.argv[6] || 0.12) });
// membrane ring around (10, 15); rays can still break membrane at resM 1? no: resM 1 makes it immune, so the ring stays closed
const r = N / (2 * Math.PI);
const mem = []; for (let u = 0; u < s.n; u++) if (s.type[u] === T_M) mem.push(u);
mem.forEach((u, i) => { const th = 2 * Math.PI * i / N; s.px[u] = 10 + r * Math.cos(th); s.py[u] = 15 + r * Math.sin(th); s.pa[u] = th; s._resetShape(u); });
mem.forEach((u, i) => s._link(u, R, mem[(i + 1) % N], L));
// two strands of 4 A: one at the ring's centre, one far outside
const inside = s.seedStrand(10, 15, 0, 4, 'AAAA'), outside = s.seedStrand(23, 15, 0, 4, 'AAAA');
// keep strands in place (they would drift out of the ring otherwise? no, the ring holds a strand); count hits by strand
// every ray starts outside the ring
for (let u = 0; u < s.n; u++) if (s.type[u] === T_X && Math.hypot(s._dx(s.px[u] - 10), s._dy(s.py[u] - 15)) < r + 1.5) s.px[u] = s._wx(s.px[u] + 12);
s._deriveAll(); s._computeOpen();
let hitIn = 0, hitOut = 0, insideUnits = 0, samples = 0;
const strandUnits = [...inside, ...outside];
for (let t = 0; t < steps; t++) {
  const before = s.rayHits; s.step();
  if (s.rayHits > before || t % 100 === 0) {
    const enc = new Set(s.enclosedBy(mem));
    if (t % 100 === 0) { insideUnits += strandUnits.filter((u) => enc.has(u)).length; samples++; }
    for (const e of s.events) if (e.t === s.t && e.kind === 'break') { if (enc.has(e.u)) { hitIn++; if (process.env.DEBUG && hitIn < 6) { const rays = []; for (let x = 0; x < s.n; x++) if (s.type[x] === T_X && Math.hypot(s._dx(s.px[x] - s.px[e.u]), s._dy(s.py[x] - s.py[e.u])) < 0.7) rays.push(x + (enc.has(x) ? ' (inside)' : ' (outside)')); console.log('inside hit at', s.t, 'on', e.u, 'rays near:', rays.join(', ')); } } else hitOut++; }
  }
  // keep both strands whole, so exposure stays equal: rejoin a broken bond only if the halves are still side by side
  for (const units of [inside, outside]) for (let i = 0; i + 1 < units.length; i++) {
    const a = units[i], b = units[i + 1];
    if (s.bond[a * 4 + R] < 0 && s.bond[b * 4 + L] < 0 && Math.hypot(s._dx(s.px[a] - s.px[b]), s._dy(s.py[a] - s.py[b])) < 1.2) { s._link(a, R, b, L); s.is[a] = s.is[b] = I_TPL; }
  }
}
const frac = insideUnits / samples / strandUnits.length;
console.log(`${nX} rays, mobS ${s.p.mobS} mobM ${s.p.mobM} mobX ${s.p.mobX}, ${steps} steps: hits on blocks inside the ring ${hitIn}, outside ${hitOut}; share of strand blocks inside ${frac.toFixed(2)}; hits per inside block-step vs outside: ${(hitIn / Math.max(frac, 1e-9)).toFixed(0)} vs ${(hitOut / Math.max(1 - frac, 1e-9)).toFixed(0)}; ring intact: ${mem.every((u) => s.bond[u * 4 + R] >= 0)}`);
