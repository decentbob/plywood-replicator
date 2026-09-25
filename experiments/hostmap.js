#!/usr/bin/env node
// Picture of a saved host-parasite world (RESULTS 42): strands that make product (a run of A, code A1) in blue, strands that make
// none in red, product chains pink, free letters dim, energy yellow. Needs Playwright (NODE_PATH=$(npm root -g)).
//   node experiments/hostmap.js out/SP_slow_1.state.json out.png [--host=AA]
const fs = require('fs');
const { Sim, T_E, isProd, LETTERS } = require('../src/sim.js');
const snap = require('../tools/snap.js');
const [src, png] = process.argv.slice(2);
const host = (process.argv.find((a) => a.startsWith('--host=')) || '--host=AA').split('=')[1];
const s = Sim.fromState(JSON.parse(fs.readFileSync(src, 'utf8')));
const kind = new Int8Array(s.n).fill(-1), seen = new Uint8Array(s.n);
let nh = 0, np = 0;
for (let u = 0; u < s.n; u++) {
  if (seen[u] || !LETTERS.includes(s.type[u])) continue;
  const ch = s.strandOf(u); for (const x of ch) seen[x] = 1;
  if (ch.length < 2) continue;
  const h = ch.map((x) => s._letter(x)).join('').includes(host) ? 1 : 0;
  for (const x of ch) kind[x] = h; if (h) nh++; else np++;
}
console.log(`${src}: t=${s.t}, ${nh} strands that make product, ${np} that make none`);
snap(s, png, { scale: 10, colorOf: (u) => kind[u] === 1 ? '#3d8bff' : kind[u] === 0 ? '#ff4d4d' : isProd(s.type[u]) ? (s.bond[u * 4] >= 0 || s.bond[u * 4 + 1] >= 0 || s.bond[u * 4 + 3] >= 0 ? '#ff9ad5' : '#5a3a4d') : s.type[u] === T_E ? '#6b6020' : '#2a2f38' });
