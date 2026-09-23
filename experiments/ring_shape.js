#!/usr/bin/env node
// RESULTS.md, section 16 (division by overgrowth). A closed ring of N membrane wedges built by hand, relaxed for 3,000 steps:
// does a ring holding more blocks than its natural size pinch (two backs meeting at a waist, the place a division rule
// could act) or does it do something else? Prints the closest approach of two non-neighbouring blocks' centres.
// Usage: node experiments/ring_shape.js <memAngle> <stiffM> [png prefix]   (pictures need Playwright, tools/snap.js)
const { Sim, L, R } = require('../src/sim.js');
const angle = Number(process.argv[2] || 45), stiffM = Number(process.argv[3] || 1), png = process.argv[4];
(async () => {
  for (const N of [8, 12, 16, 20]) {
    const s = new Sim({ seed: 1, W: 30, H: 30, nA: 0, nB: 0, nE: 0, nM: N, memAngle: angle, stiffM, pReload: 0 });
    const r = N / (2 * Math.PI) * 0.9;
    for (let i = 0; i < N; i++) { const th = 2 * Math.PI * i / N; s.px[i] = 15 + r * Math.cos(th); s.py[i] = 15 + r * Math.sin(th); s.pa[i] = th; s._resetShape(i); }
    for (let i = 0; i < N; i++) s._link(i, R, (i + 1) % N, L);
    s._deriveAll(); s._computeOpen(); s.run(3000);
    let dmin = 1e9;
    for (let a = 0; a < N; a++) for (let b = a + 2; b < N; b++) if (!(a === 0 && b === N - 1)) dmin = Math.min(dmin, Math.hypot(s._dx(s.px[a] - s.px[b]), s._dy(s.py[a] - s.py[b])));
    console.log(`N ${N}, bend ${angle}, stiffness ${stiffM}: closest non-neighbours ${dmin.toFixed(2)} apart${s.check().length ? ', CHECK FAILED' : ''}`);
    if (png) await require('../tools/snap.js')(s, `${png}_${N}.png`, { x0: 7, y0: 7, w: 16, h: 16, label: `N=${N} bend ${angle} stiffness ${stiffM}` });
  }
})();
