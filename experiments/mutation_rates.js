#!/usr/bin/env node
// Classify every birth against its parent: faithful (child == reverse(parent)), substitution (same length,
// differs), longer, shorter. Usage: node experiments/mutation_rates.js out/*.births.jsonl
const fs = require('fs');
const rev = (s) => s.split('').reverse().join('');
console.log('| run | births | faithful | substitution | longer | shorter | mean len |');
console.log('|---|---:|---:|---:|---:|---:|---:|');
for (const f of process.argv.slice(2)) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  let ok = 0, sub = 0, lon = 0, sho = 0, len = 0;
  for (const r of rows) {
    len += r.seq.length;
    if (!r.parent) continue;
    if (r.seq === rev(r.parent)) ok++; else if (r.seq.length === r.parent.length) sub++; else if (r.seq.length > r.parent.length) lon++; else sho++;
  }
  const n = rows.length, pc = (x) => (100 * x / n).toFixed(1) + '%';
  console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${n} | ${pc(ok)} | ${pc(sub)} | ${pc(lon)} | ${pc(sho)} | ${(len / n).toFixed(2)} |`);
}
