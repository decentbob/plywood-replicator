#!/usr/bin/env node
// RESULTS.md, section 24. How often does a maker's own wall close around it? One ABBABA strand (it carries BAB) among raw
// membrane, tether on, copying off (no free letters of its kinds besides a few), so the maker stays alone. Counts, per
// seed, the step at which a membrane ring first encloses a template unit, and what the wall looks like at the end.
// Usage: node experiments/closure.js <memAngle> [seeds=10] [steps=60000] [k=v,k=v extra]
const { Sim, T_M, I_ON, I_TPL } = require('../src/sim.js');
const ang = Number(process.argv[2] || 15), seeds = Number(process.argv[3] || 10), steps = Number(process.argv[4] || 60000);
const extra = {}; for (const kv of (process.argv[5] || '').split(',').filter(Boolean)) { const [k, v] = kv.split('='); extra[k] = v === 'true' ? true : v === 'false' ? false : Number(v); }
const res = [];
for (let seed = 1; seed <= seeds; seed++) {
  const s = new Sim(Object.assign({ seed, W: 24, H: 24, nA: 3, nB: 3, nE: 10, nM: 150, memAngle: ang, make: true, tether: true, pMemDecay: 0.002,
    seedSeq: 'ABBABA', seedCount: 1, energyGate: false, snapCorners: true, stiffM: 0.7, maxStrain: 0.5 }, extra));
  let closedAt = -1, wall = 0;
  for (let t = 0; t < steps && closedAt < 0; t += 500) {
    s.run(500);
    const st = s.stats(); wall = st.memActive;
    if (st.ringsWithStrand > 0 || st.enclosedTPL > 0) closedAt = s.t;
  }
  res.push(closedAt);
  console.log(`seed ${seed}: ${closedAt >= 0 ? 'closed around the maker at ' + closedAt : 'not closed'}; active membrane ${wall}`);
}
const c = res.filter((x) => x >= 0);
console.log(`bend ${ang} ${JSON.stringify(extra)}: closed in ${c.length} of ${seeds}; median step ${c.length ? c.sort((a, b) => a - b)[c.length >> 1] : '-'}`);
