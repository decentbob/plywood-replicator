#!/usr/bin/env node
// Who makes the pockets (RESULTS 41): every time a fuel particle arms a letter, the strands of the backs holding it are read, and
// the pocket is counted as one strand folded on itself, two strands of the same genome (either reading direction), or two genomes.
// Also which genome the armed letter sits in. Seeded capped race world of section 39/41; mutation off.
//   node experiments/pockets.js [sizeU=1.2] [steps=40000] [seed=1] [seqs=PAABBAABBQ,PABABABABQ,PAAAABBBBQ]
const { Sim, T_U } = require('../src/sim.js');
const size = +(process.argv[2] || 1.2), steps = +(process.argv[3] || 40000), seed = +(process.argv[4] || 1);
const seqs = process.argv[5] || 'PAABBAABBQ,PABABABABQ,PAAAABBBBQ';
const s = new Sim({ seed, W: 40, H: 40, nA: 200, nB: 200, nP: 120, nQ: 120, capFray: 0.03, pUnzip: 1, pUndock: 0, pFray: 0.001, endLoss: true, pocket: true, foldA: 45, foldB: 30, nE: 16, pReload: 0.0004, seedSeq: seqs, seedCount: 3, nU: 40, pReloadU: 0.002, sizeU: size, logBirths: false });
const rc = (q) => q.split('').reverse().map((c) => (c === 'P' ? 'Q' : c === 'Q' ? 'P' : c)).join('');
const canon = (q) => (q < rc(q) ? q : rc(q));
const kind = { self: 0, kin: 0, mixed: 0 }, armedIn = {}, pairs = {};
const orig = s._transition.bind(s);
s._transition = function (u) {
  if (this.type[u] === T_U && this.is[u] === 1) {
    const o = u * 4; let give = -1; const holders = [];
    for (let i = 0; i < 4; i++) { const q = this.bond[o + i]; if (q < 0) continue; holders.push(q >> 2); if (this.ss[o + i] === 40) give = q >> 2; }
    if (give >= 0) {
      const strands = holders.map((x) => { const c = this.strandOf(x); return { id: Math.min(...c), seq: canon(c.map((y) => this._letter(y)).join('')) }; });
      const ids = new Set(strands.map((x) => x.id)), sq = new Set(strands.map((x) => x.seq));
      if (ids.size === 1) kind.self++; else if (sq.size === 1) kind.kin++; else { kind.mixed++; const k = [...sq].sort().join('+'); pairs[k] = (pairs[k] || 0) + 1; }
      const g = strands[holders.indexOf(give)].seq; armedIn[g] = (armedIn[g] || 0) + 1;
    }
  }
  orig(u);
};
s.run(steps);
const tot = kind.self + kind.kin + kind.mixed;
console.log(`fuel ${size}, seed ${seed}, ${steps} steps: ${tot} fuel armings; pocket on one strand ${kind.self}, two strands of one genome ${kind.kin}, two genomes ${kind.mixed}`);
console.log('  armed letter in: ' + Object.entries(armedIn).sort((a, b) => b[1] - a[1]).map(([q, c]) => `${q} ${c}`).join(', '));
console.log('  mixed pockets: ' + Object.entries(pairs).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([q, c]) => `${q} ${c}`).join(', '));
