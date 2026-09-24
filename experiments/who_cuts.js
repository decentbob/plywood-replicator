#!/usr/bin/env node
// RESULTS.md, section 26. Who cuts whom: at every cut, the cutter's strand and the victim's strand (read from the units' chains),
// tallied by whether the victim carries the cut motif too, and whether the two strands are the same sequence (either way round).
// Usage: node experiments/who_cuts.js [steps=200000] [k=v,...]
const { Sim, TNAME } = require('../src/sim.js');
const steps = Number(process.argv[2] || 200000);
const extra = {}; for (const kv of (process.argv[3] || '').split(',').filter(Boolean)) { const [k, v] = kv.split('='); extra[k] = v === 'true' ? true : v === 'false' ? false : isNaN(Number(v)) ? v : Number(v); }
const s = new Sim(Object.assign({ seed: 1, W: 40, H: 40, nA: 256, nB: 256, nE: 60, pReload: 0.002, pUnzip: 1, pUndock: 0.1, pFray: 0.00003, seedSeq: 'ABBABA', seedCount: 2,
  pSoft: 0.002, pCapture: 0.002, pSpont: 0.0002, pHyb: 0.05, mobS: 0.3, cut: true, pCut: 0.05, maxEventLog: 0 }, extra, extra.seedSeq ? { seedSeq: String(extra.seedSeq).replace(/;/g, ',') } : {}));
// a unit's own strand: walk its lateral bonds (a bound partner is in the same component, so componentOf would mix the two)
const seqOf = (u) => {
  let a = u, guard = 0; while (s.bond[a * 4 + 3] >= 0 && guard++ < 1000) { a = s.bond[a * 4 + 3] >> 2; if (a === u) break; }
  const out = []; let x = a; guard = 0;
  do { out.push(TNAME[s.type[x]]); const q = s.bond[x * 4 + 1]; x = q < 0 ? -1 : q >> 2; } while (x >= 0 && x !== a && guard++ < 1000);
  return out.join('');
};
const tally = {}, pairs = {}; let n = 0;
const orig = s._transition.bind(s);
s._transition = function (u) {
  const before = this.cutEvents; orig(u);
  if (this.cutEvents > before) {
    const v = this.bond[u * 4] >> 2;   // the bound cutter (the unlink is still pending)
    const vs = seqOf(v), us = seqOf(u), rev = (x) => [...x].reverse().join('');
    const cm = s.p.cutMotif; const key = `victim ${us.includes(cm) ? 'carries' : 'lacks'} ${cm}, ${us === vs || us === rev(vs) ? 'same sequence (kin)' : 'different'}`;
    tally[key] = (tally[key] || 0) + 1; n++;
    const pk = `${vs} cuts ${us}`; pairs[pk] = (pairs[pk] || 0) + 1;
  }
};
s.run(steps);
console.log(`${n} cuts in ${steps} steps`); for (const [k, v] of Object.entries(tally).sort((a, b) => b[1] - a[1])) console.log(`  ${v}  ${k}`);
console.log('commonest pairs:'); for (const [k, v] of Object.entries(pairs).sort((a, b) => b[1] - a[1]).slice(0, 10)) console.log(`  ${v}  ${k}`);
