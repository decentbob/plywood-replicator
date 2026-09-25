#!/usr/bin/env node
// Births by lineage, for competitions between seeded genomes without mutation: each birth is counted under its sequence read
// either way round (a copy reads reversed), per window; pieces (anything not among the named genomes) are counted apart.
// Usage: node experiments/lineages.js AABBAABB,ABABABAB,AAAABBBB out/X_*.births.jsonl [--window=25000]
const fs = require('fs');
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const names = process.argv[2].split(','), win = Number(opt('window', 25000));
const rev = (q) => q.split('').reverse().join('');
const canon = (q) => (q < rev(q) ? q : rev(q));
const want = new Map(names.map((q) => [canon(q), q]));
console.log(`| run | window | ${names.join(' | ')} | pieces |`);
console.log('|---|---|' + names.map(() => '---:').join('|') + '|---:|');
for (const f of process.argv.slice(3).filter((a) => !a.startsWith('--'))) {
  if (!fs.existsSync(f)) continue;
  const rows = fs.readFileSync(f, 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((r) => !r.prod);
  const tmax = rows.length ? rows[rows.length - 1].t : 0;
  for (let w0 = 0; w0 <= tmax; w0 += win) {
    const rs = rows.filter((r) => r.t >= w0 && r.t < w0 + win); if (!rs.length) continue;
    const c = Object.fromEntries(names.map((q) => [q, 0])); let other = 0;
    for (const r of rs) { const k = want.get(canon(r.seq)); if (k) c[k]++; else other++; }
    console.log(`| ${f.replace(/.*\//, '').replace('.births.jsonl', '')} | ${w0 / 1000}k | ${names.map((q) => c[q]).join(' | ')} | ${other} |`);
  }
}
