#!/usr/bin/env node
// Equal-weight seed summaries, never treating repeated occupancy samples as independent replicates.
// node experiments/product_exchange_summary.js experiments/out/PE_screen.csv --after=20000
const fs = require('fs');
const args = process.argv.slice(2), after = Number((args.find(a => a.startsWith('--after=')) || '--after=0').split('=')[1]);
const groups = new Map();
const windows = new Set();
for (const file of args.filter(a => !a.startsWith('--'))) {
  const [header, ...lines] = fs.readFileSync(file, 'utf8').trim().split(/\r?\n/);
  const columns = header.split(',');
  for (const line of lines) {
    const values = line.split(','), r = Object.fromEntries(columns.map((c, i) => [c, c === 'arm' ? values[i] : Number(values[i])]));
    if (r.t <= after) continue;
    const windowKey = r.arm + ':' + r.seed + ':' + r.t;
    if (windows.has(windowKey)) throw new Error('Duplicate run/window (do not pool different modes or replay checks): ' + windowKey);
    windows.add(windowKey);
    const key = r.arm + ':' + r.seed;
    if (!groups.has(key)) groups.set(key, { arm: r.arm, seed: r.seed });
    const g = groups.get(key);
    for (const c of columns) if (!['arm','seed','t'].includes(c)) g[c] = (g[c] || 0) + r[c];
  }
}
const ratio = (a, b) => b > 0 ? a / b : null;
function metrics(g) {
  const bound = g.hostBound + g.mimicBound + g.otherBound;
  return { arm: g.arm, seed: g.seed, births: g.hostBirths + g.mimicBirths,
    mimicShare: ratio(g.mimicBirths, g.hostBirths + g.mimicBirths),
    hostOccupancy: ratio(g.hostBound, g.hostSites), mimicOccupancy: ratio(g.mimicBound, g.mimicSites),
    products: g.products, sameSite: ratio(g.sameSiteBound, bound), mismatch: ratio(g.mismatchedBound, bound),
    ready: ratio(g.readyUnits, g.productUnits) };
}
const rows = [...groups.values()].map(metrics).sort((a,b) => a.arm.localeCompare(b.arm) || a.seed-b.seed);
const pct = x => x === null ? '-' : (100*x).toFixed(2) + '%';
console.log('| arm | seed | capped births | non-producer share | host occupancy | non-producer occupancy | full releases | same block | mismatches | ready fraction |');
console.log('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const r of rows) console.log(`| ${r.arm} | ${r.seed} | ${r.births} | ${pct(r.mimicShare)} | ${pct(r.hostOccupancy)} | ${pct(r.mimicOccupancy)} | ${r.products} | ${pct(r.sameSite)} | ${pct(r.mismatch)} | ${pct(r.ready)} |`);
console.log('\nEqual-weight means across seeds (descriptive; selected screens are not confirmatory tests):');
for (const arm of [...new Set(rows.map(r=>r.arm))]) {
  const rs = rows.filter(r=>r.arm===arm), mean = k => {
    const xs = rs.map(r=>r[k]).filter(x=>x!==null); return xs.length ? xs.reduce((a,b)=>a+b,0)/xs.length : null;
  };
  console.log(`${arm}, n=${rs.length}: births ${mean('births').toFixed(1)}, non-producer share ${pct(mean('mimicShare'))}, host occupancy ${pct(mean('hostOccupancy'))}, non-producer occupancy ${pct(mean('mimicOccupancy'))}, same block ${pct(mean('sameSite'))}`);
}
