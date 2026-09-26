#!/usr/bin/env node
// Mechanical diagnostics, one row per independent seed. Combine with product_exchange_summary.js for ecology.
const fs = require('fs');
const args = process.argv.slice(2), files = args.filter(a => !a.startsWith('--'));
const after = Number((args.find(a => a.startsWith('--after=')) || '--after=0').slice(8));
if (!files.length || !Number.isFinite(after) || args.some(a => a.startsWith('--') && !a.startsWith('--after=') && a!=='--partial')) {
  throw new Error('usage: product_shape_summary.js FILE.csv [FILE.csv ...] [--after=0] [--partial]');
}
const groups = new Map(), seen = new Set();
for (const file of files) {
  const manifest = file.replace(/\.csv$/, '.manifest.json');
  if (fs.existsSync(manifest) && !JSON.parse(fs.readFileSync(manifest,'utf8')).complete) {
    if (!args.includes('--partial')) throw new Error('Incomplete batch; --partial is for progress inspection only: '+file);
    console.error('PARTIAL: unequal run lengths may make these rows incomparable: '+file);
  }
  const [head, ...lines] = fs.readFileSync(file,'utf8').trim().split(/\r?\n/), cols = head.split(',');
  for (const line of lines) {
    const vals = line.split(','), row = Object.fromEntries(cols.map((c,i) => [c,c==='arm'?vals[i]:Number(vals[i])]));
    if (row.t <= after) continue;
    const key = row.arm+':'+row.seed, window = key+':'+row.t;
    if (seen.has(window)) throw new Error('Duplicate run/window: '+window);
    seen.add(window);
    if (!groups.has(key)) groups.set(key,{arm:row.arm,seed:row.seed});
    const g = groups.get(key);
    for (const c of cols) if (!['arm','seed','t'].includes(c)) g[c] = (g[c]||0)+row[c];
  }
}
if (!groups.size) throw new Error('No selected windows');
const ratio = (a,b) => b>0?a/b:null;
const metrics = g => ({arm:g.arm, seed:g.seed, links:g.productLateralEvents, docks:g.productDockEvents,
  rebinds:g.productBindEvents, releases:g.products, boundBend:ratio(g.boundBendDeg,g.boundShapeSamples),
  freeBend:ratio(g.freeBendDeg,g.freeShapeSamples), births:g.hostBirths+g.mimicBirths,
  host:ratio(g.hostBound,g.hostSites), recipient:ratio(g.mimicBound,g.mimicSites)});
const rows = [...groups.values()].map(metrics).sort((a,b)=>a.arm.localeCompare(b.arm)||a.seed-b.seed);
const num = x => x==null?'—':x.toFixed(2), pct = x => x==null?'—':(100*x).toFixed(2)+'%';
console.log('| arm | seed | lateral bonds | monomer dockings | mature bindings | full releases | bound bend ° | free bend ° | capped births | host occupancy | recipient occupancy |');
console.log('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
const print = r => console.log(`| ${r.arm} | ${r.seed} | ${num(r.links)} | ${num(r.docks)} | ${num(r.rebinds)} | ${num(r.releases)} | ${num(r.boundBend)} | ${num(r.freeBend)} | ${num(r.births)} | ${pct(r.host)} | ${pct(r.recipient)} |`);
rows.forEach(print);
console.log('\nEqual-weight seed means (descriptive screen):');
for (const arm of [...new Set(rows.map(r=>r.arm))]) {
  const rs=rows.filter(r=>r.arm===arm), mean={arm,seed:'mean, n='+rs.length};
  for (const k of Object.keys(rs[0]).filter(k=>!['arm','seed'].includes(k))) {
    const xs=rs.map(r=>r[k]).filter(x=>x!=null); mean[k]=xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
  }
  print(mean);
}
