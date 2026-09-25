#!/usr/bin/env node
// Fitness apart from drift: each genome alone in each environment (monoculture runs named PREFIX_<genome>_<env>_<seed>);
// births of the seeded lineage (either reading direction, caps swapped) from step t0 on, per 10,000 steps, one value per seed.
// Usage: node experiments/monoculture.js DIR PREFIX [--t0=50000]
const fs = require('fs'), path = require('path');
const [dir, prefix] = process.argv.slice(2);
const opt = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=')[1] : d; };
const t0 = Number(opt('t0', 50000));
const rc = (q) => q.split('').reverse().map((c) => (c === 'P' ? 'Q' : c === 'Q' ? 'P' : c)).join('');
const canon = (q) => (q < rc(q) ? q : rc(q));
const cells = {}, envs = new Set(), genomes = new Set();
for (const f of fs.readdirSync(dir).filter((x) => x.startsWith(prefix + '_') && x.endsWith('.births.jsonl'))) {
  const [g, env, seed] = f.slice(prefix.length + 1, -'.births.jsonl'.length).split('_');
  const want = canon('P' + g + 'Q');
  const rows = fs.readFileSync(path.join(dir, f), 'utf8').trim().split('\n').filter(Boolean).map((l) => JSON.parse(l));
  const tmax = rows.length ? Math.max(t0 + 1, rows[rows.length - 1].t) : t0 + 1;
  const n = rows.filter((r) => r.t >= t0 && canon(r.seq) === want).length;
  const key = g + '|' + env; (cells[key] = cells[key] || []).push((10000 * n / (tmax - t0)).toFixed(1)); envs.add(env); genomes.add(g);
}
const E = [...envs].sort(), G = [...genomes].sort();
console.log(`| genome | ${E.join(' | ')} |`); console.log('|---|' + E.map(() => '---:').join('|') + '|');
for (const g of G) console.log(`| ${g} | ${E.map((e) => (cells[g + '|' + e] || []).join(', ')).join(' | ')} |`);
