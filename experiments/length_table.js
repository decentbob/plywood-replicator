#!/usr/bin/env node
// Length under selection: final state plus mean newborn length over the last `--tail` steps, from out/<name>.json and
// out/<name>.births.jsonl. Usage: node experiments/length_table.js Z_zip [--tail=50000]
const fs = require('fs'), path = require('path');
const dir = path.join(__dirname, 'out');
const tail = Number((process.argv.find((a) => a.startsWith('--tail=')) || '--tail=50000').split('=')[1]);
const filt = process.argv.slice(2).filter((a) => !a.startsWith('--'));
console.log('| run | mean length | max | strands | free | births | births, last ' + tail / 1000 + 'k | newborn length, last ' + tail / 1000 + 'k | distinct | entropy (bits) | frays | unzips |');
console.log('|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|');
for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json') && filt.some((q) => f.startsWith(q))).sort()) {
  const name = f.replace('.json', ''), j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')), s = j.final;
  let rows = [];
  try { rows = fs.readFileSync(path.join(dir, name + '.births.jsonl'), 'utf8').trim().split('\n').filter(Boolean).map(JSON.parse); } catch (e) { /* no log */ }
  const late = rows.filter((r) => r.t > s.t - tail);
  const nl = late.length ? (late.reduce((a, r) => a + r.seq.length, 0) / late.length).toFixed(2) : '-';
  console.log(`| ${name} | ${s.meanLen.toFixed(2)} | ${s.maxLen} | ${s.strands + s.complexes} | ${s.free} | ${s.births} | ${late.length} | ${nl} | ${s.distinct} | ${s.entropy.toFixed(2)} | ${s.frays} | ${s.unzips || 0} |`);
}
