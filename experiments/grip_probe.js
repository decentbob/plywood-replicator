// Does a folded product's shape decide which fuel particles its pockets hold? Share of fuel particles held by two or more grips.
const { Sim } = require(require('path').join(__dirname, '../src/sim.js'));
const folds = (process.argv[2] || '0,30,45,60,90').split(',').map(Number), sizes = (process.argv[3] || '0.5,0.7,1').split(',').map(Number);
const seq = process.argv[4] || '111111';
console.log('fold \\ fuel size: ' + sizes.join('  '));
for (const f of folds) {
  const row = [];
  for (const sz of sizes) {
    let h2 = 0, h1 = 0, k = 0;
    for (const seed of [1, 2]) {
      const s = new Sim({ seed, W: 30, H: 30, nA: 0, nB: 0, nE: 0, n1: 120, nU: 60, sizeU: sz, fold1: f, grip: true, seedSeq: seq, seedCount: 15 });
      s.run(2000);
      for (let t = 0; t < 8; t++) { s.run(1000); const st = s.stats(); h2 += st.held2; h1 += st.held1; k++; }
    }
    row.push(`${(100 * h2 / (60 * k)).toFixed(1)}% (${(100 * h1 / (60 * k)).toFixed(0)})`);
  }
  console.log(`${String(f).padStart(4)}°  ` + row.join('  '));
}
