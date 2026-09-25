#!/usr/bin/env node
// Trajectory fingerprint: hashes positions, corners, bonds and states after N steps on a few configurations. Use it to
// prove a refactor or a new knob (default off) changes nothing: run before and after, diff the output.
//   node tools/fingerprint.js [steps=1500] [path/to/sim.js]
const path = require('path');
const steps = Number(process.argv[2] || 1500);
const { Sim } = require(path.resolve(process.argv[3] || path.join(__dirname, '../src/sim.js')));
const crypto = require('crypto');
const cfgs = [
  { seed: 7, W: 40, H: 40, nA: 200, nB: 100, nE: 100, seedSeq: 'ABBABA', pSoft: 0.01, pCapture: 0.01, pSpont: 0.001, pLigate: 0.02, pFray: 0.0001 },
  { seed: 8, W: 40, H: 40, nA: 200, nB: 100, nE: 100, nM: 100, memAngle: 30, motif: true, pReload: 0.0005, pBreak: 0.0005, resB: 0.9, seedSeq: 'ABBABA', pUndock: 0.05, pSpont: 0.001 },
  { seed: 9, W: 40, H: 40, nA: 200, nB: 200, nE: 100, pLigate: 0.02, pFray: 0.0002, pUnzip: 1, seedSeq: 'ABBABA,AB', bendB: 10 },
  // the capped world of RESULTS 33 (relayed feed and shield, end loss, bare caps, radiation), where most new rules act
  { seed: 10, W: 30, H: 30, nA: 150, nB: 150, nC: 150, nD: 150, nP: 60, nQ: 60, nE: 40, capFray: 0.03, pUnzip: 1, pFray: 0.001,
    seedCount: 3, feed: true, shield: true, relay: true, endLoss: true, bareCaps: true, pBreak: 0.0003, pLigate: 0.05,
    pSoft: 0.01, pCapture: 0.01, seedSeq: 'PABACDCQ' },
  // translation with a shared catalyst and graded specificity (RESULTS 34, 36)
  { seed: 11, W: 30, H: 30, nA: 150, nB: 150, nC: 100, nD: 100, n1: 120, nE: 60, translate: true, catalysis: true, bindAny: true,
    pMisMelt: 0.05, transCode: 'A1', pLinkBare: 0.01, pSoft: 0.002, seedCount: 3, seedSeq: 'BAAAAB,BCDDCB' },
];
for (const c of cfgs) {
  const s = new Sim(c); s.run(steps);
  const h = crypto.createHash('md5');
  for (const a of [s.px, s.py, s.pa, s.ox, s.oy, s.bond, s.is]) h.update(Buffer.from(a.buffer));
  const st = s.stats();
  console.log(h.digest('hex'), st.births, st.docks, st.breaks);
}
