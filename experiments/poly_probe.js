#!/usr/bin/env node
// Copying probe for the polygon engine (RESULTS.md, section 15): two seeds, 60x60, ABBABA, every soft knob at zero.
// Usage: node experiments/poly_probe.js poly 20000 '{"stiffA":0.5,"stiffB":0.5,"bendB":10}'
const { Sim } = require('../src/sim.js');
const rev = (s) => s.split('').reverse().join('');
const phys = process.argv[2] || 'poly', steps = Number(process.argv[3] || 20000), extra = JSON.parse(process.argv[4] || '{}');
for (const seed of [2, 5]) {
  const s = new Sim(Object.assign({ W: 60, H: 60, nA: 200, nB: 200, nE: 150, seed, seedSeq: 'ABBABA', physics: phys }, extra));
  const t0 = Date.now(); s.run(steps); const st = s.stats();
  const bad = s.births.filter((b) => b.seq !== rev(b.parent));
  console.log(phys, 'seed', seed, 'births', st.births, 'docks', st.docks, 'unfaithful', bad.length, 'lens', JSON.stringify(st.lenHist), 'sps', Math.round(steps / (Date.now() - t0) * 1000), s.check().slice(0, 2));
  if (bad.length) console.log('  e.g.', JSON.stringify(bad.slice(0, 3)));
}
