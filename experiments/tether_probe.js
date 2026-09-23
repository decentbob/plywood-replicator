#!/usr/bin/env node
// RESULTS.md, section 24. Membrane made by strands and tethered to them (make + tether), on the flush-polygon physics:
// does each maker grow its own wall, do walls close into rings around their makers, and what happens to the copies?
// Usage: node experiments/tether_probe.js <memAngle> [seed=4] [steps=150000] [k=v,k=v extra] [png prefix]
const { Sim } = require('../src/sim.js');
const ang = Number(process.argv[2] || 15), seed = Number(process.argv[3] || 4), steps = Number(process.argv[4] || 150000), png = process.argv[6];
const extra = {}; for (const kv of (process.argv[5] || '').split(',').filter(Boolean)) { const [k, v] = kv.split('='); extra[k] = v === 'true' ? true : v === 'false' ? false : Number(v); }
const s = new Sim(Object.assign({ seed, W: 30, H: 30, nA: 100, nB: 100, nE: 40, nM: 250, memAngle: ang, make: true, tether: true, pMemDecay: 0.002,
  seedSeq: 'ABBABA', seedCount: 1, energyGate: false, snapCorners: true, stiffM: 0.7, maxStrain: 0.5 }, extra));
(async () => {
  let sumR = 0, k = 0;
  for (let t = 10000; t <= steps; t += 10000) {
    s.run(10000); const st = s.stats();
    if (t > steps / 3) { sumR += st.ringsWithStrand; k++; }
    console.log(`${s.t}: active ${st.memActive} rings ${st.memRings} (mean ${st.meanMemRingLen.toFixed(0)}) arcs ${st.memArcs} rings holding a strand ${st.ringsWithStrand} template units inside ${st.enclosedTPL} births ${st.births} strands ${st.strands + st.complexes} free ${st.free}`);
    if (png && t % 50000 === 0) await require('../tools/snap.js')(s, `${png}_${s.t}.png`, { label: `make + tether, bend ${ang}, ${s.t} steps` });
  }
  console.log(`mean rings holding a strand over the last two thirds: ${(sumR / k).toFixed(2)}`);
})();
