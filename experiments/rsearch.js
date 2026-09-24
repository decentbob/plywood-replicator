#!/usr/bin/env node
// Random chemistries (RESULTS.md, section 32): each index draws a random rule table (src/rchem.js) and a few global rates,
// runs it in a small world, and takes a census every --every steps: how many blocks are bonded, the largest assembly, how
// many kinds of assembly of four or more blocks exist, and repeats of identical assemblies (the same graph of type and state,
// side to side). Many identical large assemblies is the blind sign of copying (or of self-assembly into a fixed shape).
// Usage: node experiments/rsearch.js <from> <to> [--steps=30000] [--every=5000] > out.jsonl
const { RChem } = require('../src/rchem.js');
const { mulberry32 } = require('../src/sim.js');
const arg = (k, d) => Number((process.argv.find((a) => a.startsWith('--' + k + '=')) || `--${k}=${d}`).split('=')[1]);
const from = Number(process.argv[2] || 0), to = Number(process.argv[3] || from + 1), steps = arg('steps', 30000), every = arg('every', 5000);

function drawR(i) {
  const r = mulberry32(4242 + i * 9973), pick = (a) => a[Math.floor(r() * a.length)], uni = (a, b) => a + r() * (b - a), logu = (a, b) => Math.exp(Math.log(a) + r() * (Math.log(b) - Math.log(a)));
  const K = pick([2, 3, 4, 5, 6]);
  return { chemSeed: 1 + i, seed: 1, K, NS: pick([2, 3, 4]), NC: pick([3, 4, 5, 6, 8]), pInert: uni(0.1, 0.5), pAff: uni(0.1, 0.5), pRule: uni(0.05, 0.4), pRuleFree: pick([0, 0.02, 0.1]),
    rBreak: logu(2e-5, 1e-3), nEach: Math.round(300 / K), W: 25, H: 25 };
}
module.exports = { drawR };
if (require.main !== module) return;
for (let i = from; i < to; i++) {
  const p = drawR(i), t0 = Date.now(), s = new RChem(p), cen = [];
  let ok = true;
  try { for (let t = every; t <= steps; t += every) { s.run(every); cen.push(s.census()); } } catch (e) { ok = false; }
  const late = cen.slice(Math.floor(cen.length / 2));
  const score = ok && late.length ? { top6: Math.max(...late.map((c) => c.top6)), repeat6: Math.max(...late.map((c) => c.repeat6)), largest: Math.max(...late.map((c) => c.largest)), bonded: late[late.length - 1].bonded, kinds: late[late.length - 1].kinds } : null;
  console.log(JSON.stringify({ i, ok, secs: Math.round((Date.now() - t0) / 1000), params: p, score, census: cen }));
}
