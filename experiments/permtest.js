#!/usr/bin/env node
// Permutation test for many-seed races (RESULTS 41): the share of one genome among lineage births from step T0, per seed, compared
// between two groups of runs (PREFIX_<seed>) by the difference of means, two-sided, 20,000 shuffles.
//   node experiments/permtest.js DIR PREFIX1 PREFIX2 AABBAABB,ABABABAB,AAAABBBB AAAABBBB 75000   (genomes between caps P...Q)

const fs = require('fs'), path = require('path');
const [dir, g1, g2, name, gen, t0] = process.argv.slice(2);
const names = name.split(','), gi = names.indexOf(gen);
const rc = (q) => q.split('').reverse().map((c) => (c === 'P' ? 'Q' : c === 'Q' ? 'P' : c)).join('');
const canon = (q) => (q < rc(q) ? q : rc(q));
const want = new Map(names.map((g, i) => [canon('P' + g + 'Q'), i]));
const shares = (pre) => fs.readdirSync(dir).filter((f) => f.startsWith(pre + '_') && f.endsWith('.births.jsonl')).map((f) => {
  const c = names.map(() => 0);
  for (const l of fs.readFileSync(path.join(dir, f), 'utf8').trim().split('\n')) { if (!l) continue; const r = JSON.parse(l); if (r.t < +t0) continue; const k = want.get(canon(r.seq)); if (k !== undefined) c[k]++; }
  const tot = c.reduce((a, b) => a + b, 0); return tot ? c[gi] / tot : null; }).filter((x) => x !== null);
const a = shares(g1), b = shares(g2), m = (x) => x.reduce((p, q) => p + q, 0) / x.length, obs = Math.abs(m(a) - m(b)), all = a.concat(b);
let k = 0; const N = 20000; for (let i = 0; i < N; i++) { const s = all.slice().sort(() => Math.random() - 0.5); if (Math.abs(m(s.slice(0, a.length)) - m(s.slice(a.length))) >= obs - 1e-12) k++; }
console.log(`${gen}: ${g1} ${(100 * m(a)).toFixed(0)}% (n=${a.length}) vs ${g2} ${(100 * m(b)).toFixed(0)}% (n=${b.length}): p = ${(k / N).toFixed(3)}`);
