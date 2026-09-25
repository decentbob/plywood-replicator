#!/usr/bin/env node
// Many-seed races between seeded genomes without mutation (RESULTS 41): for runs named PREFIX<env>_<seed>, the share of each
// genome among its lineage births from step t0 on (either reading direction, caps swapped), per seed; then per environment the
// mean share and how many seeds each genome won. Many small seeds instead of one big world: drift decides single races (39e).
//   node experiments/races.js DIR PREFIX AABBAABB,ABABABAB,AAAABBBB [--t0=75000] [--caps]
const fs = require('fs'), path = require('path');
const [dir, prefix, list] = process.argv.slice(2);
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const t0 = Number(opt('t0', 75000)), caps = process.argv.includes('--caps');
const names = list.split(',');
const rc = (q) => q.split('').reverse().map((c) => (c === 'P' ? 'Q' : c === 'Q' ? 'P' : c)).join('');
const canon = (q) => (q < rc(q) ? q : rc(q));
const want = new Map(names.map((g) => [canon(caps ? 'P' + g + 'Q' : g), g]));
const envs = {};
for (const f of fs.readdirSync(dir).filter((x) => x.startsWith(prefix) && x.endsWith('.births.jsonl'))) {
  const m = f.slice(prefix.length, -'.births.jsonl'.length).match(/^(.*)_(\d+)$/); if (!m) continue;
  const [, env, seed] = m;
  const rows = fs.readFileSync(path.join(dir, f), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l)).filter((r) => !r.prod && r.t >= t0);
  const c = Object.fromEntries(names.map((g) => [g, 0]));
  for (const r of rows) { const g = want.get(canon(r.seq)); if (g) c[g]++; }
  (envs[env] = envs[env] || []).push({ seed: +seed, c, tot: names.reduce((a, g) => a + c[g], 0) });
}
console.log(`births from step ${t0}; per seed: ${names.join(' / ')}`);
console.log(`| env | seeds | ${names.map((g) => g + ' mean share (seeds won)').join(' | ')} | per seed |`);
console.log('|---|---:|' + names.map(() => '---:').join('|') + '|---|');
for (const env of Object.keys(envs).sort()) {
  const rs = envs[env].sort((a, b) => a.seed - b.seed), live = rs.filter((r) => r.tot > 0);
  const cells = names.map((g) => {
    const mean = live.length ? live.reduce((a, r) => a + r.c[g] / r.tot, 0) / live.length : 0;
    const won = live.filter((r) => names.every((h) => h === g || r.c[g] > r.c[h])).length;
    return `${(100 * mean).toFixed(0)}% (${won})`;
  });
  console.log(`| ${env} | ${live.length}/${rs.length} | ${cells.join(' | ')} | ${rs.map((r) => names.map((g) => r.c[g]).join('/')).join(', ')} |`);
}
