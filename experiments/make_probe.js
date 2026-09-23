#!/usr/bin/env node
// RESULTS.md, section 16: rings holding a strand with the make rule on (1) or with a fixed active membrane stock (0).
// Usage: node experiments/make_probe.js 1
const { Sim } = require('../src/sim.js');
const make = process.argv[2] === '1';
const s = new Sim({ seed: 3, W: 40, H: 40, nA: 150, nB: 150, nE: 60, nM: 400, memAngle: 18, make, pMemDecay: make ? 0.005 : 0, pBreak: 0.0005, resM: 0.8, resA: 0.9, resB: 0.9,
  seedSeq: 'ABBABA', seedCount: 3, pUnzip: 1, pUndock: 0.1, pFray: 0.00003 });
const out = []; let sumR = 0, sumT = 0, k = 0;
for (let i = 0; i < 15; i++) { s.run(10000); const st = s.stats(); if (i >= 3) { sumR += st.ringsWithStrand; sumT += st.enclosedTPL; k++; }
  out.push(`${s.t}: active ${st.memActive} rings ${st.memRings} (len ${st.meanMemRingLen.toFixed(1)}) encTPL ${st.enclosedTPL} ringsWithStrand ${st.ringsWithStrand} made ${st.made} births ${st.births}`); }
console.log('make ' + make + '\n' + out.join('\n') + `\nmean after 30k: rings holding a strand ${(sumR / k).toFixed(2)}, template units inside ${(sumT / k).toFixed(2)}`);
