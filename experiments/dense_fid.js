// Copy fidelity in the dense capped world with mutation off: share of capped copies that are exact / shorter / other, by engine setting
const simPath = process.argv[2], variants = JSON.parse(process.argv[3]), steps = Number(process.argv[4] || 20000);
const { Sim } = require(simPath || require('path').join(__dirname, '../src/sim.js'));
const rc = (q) => q.split('').reverse().map((c) => (c === 'P' ? 'Q' : c === 'Q' ? 'P' : c)).join('');
const base = { W: 40, H: 40, nA: 400, nB: 400, nC: 400, nD: 400, nP: 120, nQ: 120, capFray: 0.03, pUnzip: 1, pFray: 0.001, seedCount: 3, feed: true, shield: true, relay: true, endLoss: true, bareCaps: true, nE: 60, pBreak: 0.00003, pLigate: 0.05, seedSeq: 'PABACDCQ' };
for (const [vn, v] of Object.entries(variants)) {
  let n = 0, ex = 0, sh = 0, lo = 0, secs = 0;
  for (const seed of [1, 2]) {
    const s = new Sim(Object.assign({ seed }, base, v));
    const t0 = process.cpuUsage(); s.run(steps); const du = process.cpuUsage(t0); secs += (du.user + du.system) / 1e6;
    for (const b of s.births) { if (!b.parent || b.parent[0] !== 'P' || !b.parent.endsWith('Q') || b.seq[0] !== 'P' || !b.seq.endsWith('Q')) continue; n++; if (b.seq === rc(b.parent)) ex++; else if (b.seq.length < b.parent.length) sh++; else if (b.seq.length > b.parent.length) lo++; }
  }
  console.log(`${vn.padEnd(14)} cpu steps/s ${Math.round(2 * steps / secs).toString().padStart(4)}  capped copies ${n}  exact ${(100 * ex / n).toFixed(0)}%  shorter ${(100 * sh / n).toFixed(0)}%  longer ${(100 * lo / n).toFixed(0)}%`);
}
