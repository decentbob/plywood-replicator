#!/usr/bin/env node
// RESULTS.md, section 16. Usage: node experiments/ring_growth.js <stiffM> <label>
// Do soft membrane rings grow past their natural size and split? Tracks the ring-size distribution over time.
const { Sim, T_M } = require('../src/sim.js');
const stiffM = Number(process.argv[2]), label = process.argv[3];
const s = new Sim({ seed: 3, W: 40, H: 40, nA: 150, nB: 150, nE: 60, nM: 500, memAngle: 25, stiffM, pBreak: 0.0007, resM: 0.9, resA: 0.9, resB: 0.9,
  seedSeq: 'ABBABA', seedCount: 2, pUnzip: 1, pUndock: 0.1, pFray: 0.00003 });
const out = [];
for (let k = 1; k <= 15; k++) {
  s.run(10000);
  const sizes = []; const seen = new Uint8Array(s.n);
  for (let u = 0; u < s.n; u++) {
    if (s.type[u] !== T_M || seen[u]) continue;
    const comp = s.componentOf(u); for (const x of comp) seen[x] = 1;
    const cyc = s.cycleOf(comp, T_M); if (cyc.length >= 3) sizes.push(cyc.length);
  }
  sizes.sort((a, b) => a - b);
  out.push(`${s.t}: ${sizes.length} rings, sizes ${sizes.length ? sizes[0] + '-' + sizes[sizes.length - 1] : '-'}, median ${sizes[sizes.length >> 1] || '-'}, >=22: ${sizes.filter((x) => x >= 22).length}, breaks ${s.breakEvents}`);
}
console.log(label + '\n' + out.join('\n'));
