#!/usr/bin/env node
// Does an assembly beget itself? (RESULTS.md, section 32.) For a random chemistry (an rsearch.js index), run it to --t0, take
// its most repeated assembly of three or more blocks (by signature), then start the world again from the same seed twice: plain,
// and with --copies copies of that assembly transplanted in at the start (made from free blocks). If the assembly copies
// itself, the seeded world has more of it early on than the plain one plus the copies put in; if it merely self-assembles,
// the seeded world's count relaxes to the plain one's. Also runs the positive control (copyTable) with --control.
// Usage: node experiments/autocat.js <index...> [--t0=30000] [--copies=4] [--control]
const { RChem, copyTable } = require('../src/rchem.js');
const { drawR } = require('./rsearch.js');
const arg = (k, d) => Number((process.argv.find((a) => a.startsWith('--' + k + '=')) || `--${k}=${d}`).split('=')[1]);
const t0 = arg('t0', 30000), copies = arg('copies', 4), checks = [1000, 3000, 6000, 10000, 20000];
const count = (s, sig) => s.assemblies(3).filter((a) => a.sig === sig).length;
function test(name, make, seedFn) {
  const s0 = make(); if (seedFn) seedFn(s0); s0.run(t0);
  const as = s0.assemblies(3), m = new Map(); for (const a of as) m.set(a.sig, (m.get(a.sig) || []).concat([a]));
  const best = [...m.values()].sort((a, b) => b.length - a.length || b[0].size - a[0].size)[0];
  if (!best) { console.log(name, 'no assemblies'); return; }
  const sig = best[0].sig, cap = s0.capture(best[0].comp);
  const row = (s) => checks.map((t) => { s.run(t - s.t); return count(s, sig); });
  const plain = make(); if (seedFn) seedFn(plain);
  const seeded = make(); if (seedFn) seedFn(seeded);
  let put = 0; for (let k = 0; k < copies; k++) if (seeded.transplant(cap, seeded.rng() * seeded.p.W, seeded.rng() * seeded.p.H)) put++;
  console.log(`${name}: assembly of ${best[0].size} blocks, ${best.length} at t0; put in ${put}. At ${checks.join(', ')}: plain ${row(plain).join(' ')} | seeded ${row(seeded).join(' ')}`);
}
if (process.argv.includes('--control')) test('control', () => new RChem({ table: copyTable(0.00003, 0.01), seed: 1, nEach: 150, W: 25, H: 25, rBreak: 0.000005 }), (s) => s.seedChains(['ABBABA', 'ABBABA'], 5));
for (const a of process.argv.slice(2).filter((x) => !x.startsWith('--'))) test('table ' + a, () => new RChem(drawR(Number(a))));
