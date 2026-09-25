// Harvest spectrum: fuel used per 10,000 steps by a genome sequence, for each fuel size (fuel the only energy, mutation off).
const { Sim } = require(require('path').join(__dirname, '../src/sim.js'));
const seqs = (process.argv[2] || 'AAAAAAAA,BBBBBBBB,AAAABBBB,AABBAABB,ABABABAB').split(','), sizes = (process.argv[3] || '0.5,0.85,1.2').split(',').map(Number);
const folds = JSON.parse(process.argv[4] || '{"foldA":45,"foldB":30}');
console.log('sequence \\ fuel size: ' + sizes.join('  ') + '   (fuel used per 10k steps, 2 seeds; templates at the end)');
for (const q of seqs) {
  const cells = [];
  for (const sz of sizes) {
    let used = 0, tpl = 0;
    for (const seed of [1, 2]) {
      const s = new Sim(Object.assign({ seed, W: 30, H: 30, nA: 150, nB: 150, nE: 0, nU: 80, sizeU: sz, pocket: true, pReloadU: 0.01, seedSeq: q, seedCount: 3, pUndock: 0.1 }, folds));
      s.run(15000); used += s.fuelUsed; tpl += s.stats().tpl;
    }
    cells.push(`${String(Math.round(used / 3)).padStart(4)} (${tpl})`);
  }
  console.log(q.padEnd(10), cells.join('  '));
}
