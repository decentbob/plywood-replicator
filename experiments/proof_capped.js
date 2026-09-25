// Proofreading efficiency in the capped world: substitution rate per capped copy, by whether the parent carries BDB
const { Sim } = require(require('path').join(__dirname, '../src/sim.js'));
const rc = (q) => q.split('').reverse().map((c) => (c === 'P' ? 'Q' : c === 'Q' ? 'P' : c)).join('');
const pProof = Number(process.argv[2] || 0.5), steps = Number(process.argv[3] || 30000);
for (const proof of [false, true]) {
  const tally = { BDB: [0, 0, 0], other: [0, 0, 0] };   // copies, substitutions, other errors
  for (const seed of [1, 2]) {
    const s = new Sim({ seed, W: 40, H: 40, nA: 200, nB: 200, nC: 200, nD: 200, nP: 120, nQ: 120, nE: 60, capFray: 0.03, pUnzip: 1, pFray: 0.001, seedCount: 3, feed: true, shield: true, relay: true, endLoss: true, bareCaps: true, seedSeq: 'PABACDCBDBQ,PABACDCBCBQ', pSoft: 0.01, proof, pProof });
    s.run(steps);
    for (const b of s.births) {
      if (!b.parent || b.parent[0] !== 'P' || !b.parent.endsWith('Q')) continue;
      const k = b.parent.includes('BDB') ? 'BDB' : 'other'; tally[k][0]++;
      if (b.seq !== rc(b.parent)) { if (b.seq.length === b.parent.length) tally[k][1]++; else tally[k][2]++; }
    }
  }
  for (const k of ['BDB', 'other']) { const [n, sb, ot] = tally[k]; console.log(`proof ${proof} pProof ${pProof} parent ${k.padEnd(5)}: copies ${n}, substitutions ${(100 * sb / n).toFixed(1)}%, other errors ${(100 * ot / n).toFixed(1)}%`); }
}
