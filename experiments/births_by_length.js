#!/usr/bin/env node
// Births per strand length over time, from a birth log. Usage: node experiments/births_by_length.js out/C_*.births.jsonl
const fs = require('fs');
console.log('| run | births len 2 | len 6 | other | first 50k: len2 / len6 | last 50k: len2 / len6 |');
console.log('|---|---:|---:|---:|---:|---:|');
for (const f of process.argv.slice(2)) {
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const c = { 2: 0, 6: 0, o: 0 }, early = { 2: 0, 6: 0 }, late = { 2: 0, 6: 0 };
  const tmax = rows.length ? rows[rows.length - 1].t : 0;
  for (const r of rows) {
    const L = r.seq.length; const k = L === 2 ? 2 : L === 6 ? 6 : 'o'; c[k]++;
    if (k !== 'o') (r.t < 50000 ? early : late)[k]++;
  }
  console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${c[2]} | ${c[6]} | ${c.o} | ${early[2]} / ${early[6]} | ${late[2]} / ${late[6]} |`);
}
