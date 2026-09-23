#!/usr/bin/env node
// RESULTS.md, section 16: rings holding a strand with the make rule on (1) or with a fixed active membrane stock (0).
// Usage: node experiments/make_probe.js 1 [k=v,k=v extra parameters, e.g. maxStrain=0.25,memAngle=30] [seed=3]
const { Sim } = require('../src/sim.js');
const make = process.argv[2] === '1';
const extra = {}; for (const kv of (process.argv[3] || '').split(',').filter(Boolean)) { const [k, v] = kv.split('='); extra[k] = v === 'true' ? true : v === 'false' ? false : Number(v); }
const s = new Sim(Object.assign({ seed: Number(process.argv[4] || 3), W: 40, H: 40, nA: 150, nB: 150, nE: 60, nM: 400, memAngle: 18, make, pMemDecay: make ? 0.005 : 0, pBreak: 0.0005, resM: 0.8, resA: 0.9, resB: 0.9,
  seedSeq: 'ABBABA', seedCount: 3, pUnzip: 1, pUndock: 0.1, pFray: 0.00003 }, extra));
const out = []; let sumR = 0, sumT = 0, k = 0;
for (let i = 0; i < 15; i++) { s.run(10000); const st = s.stats(); if (i >= 3) { sumR += st.ringsWithStrand; sumT += st.enclosedTPL; k++; }
  out.push(`${s.t}: active ${st.memActive} rings ${st.memRings} (len ${st.meanMemRingLen.toFixed(1)}) encTPL ${st.enclosedTPL} ringsWithStrand ${st.ringsWithStrand} made ${st.made} births ${st.births} snaps ${st.snaps}`); }
console.log('make ' + make + ' ' + JSON.stringify(extra) + '\n' + out.join('\n') + `\nmean after 30k: rings holding a strand ${(sumR / k).toFixed(2)}, template units inside ${(sumT / k).toFixed(2)}`);
