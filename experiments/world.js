#!/usr/bin/env node
// Run one world from search.js by its index, with overrides, for a long time: prints a row every --every steps and writes the
// birth log. Use it to follow a promising world and to knock mechanisms out one at a time.
// Usage: node experiments/world.js <index> [--steps=2000000] [--every=100000] [--births=FILE] [--round=1|2] [k=v,k=v overrides]
const { Sim } = require('../src/sim.js');
const { draw, draw2 } = require('./search.js');
const fs = require('fs');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith('--' + k + '=')); return a ? a.split('=').slice(1).join('=') : d; };
const i = Number(process.argv[2]), steps = Number(arg('steps', 2000000)), every = Number(arg('every', 100000)), births = arg('births', '');
const over = {}; for (const kv of (process.argv.slice(3).find((a) => !a.startsWith('--')) || '').split(',').filter(Boolean)) { const [k, v] = kv.split('='); over[k] = v === 'true' ? true : v === 'false' ? false : isNaN(Number(v)) ? v : Number(v); }
const p = Object.assign(arg('round', '1') === '2' ? draw2(i) : draw(i), over, { maxBirthLog: 1000000 });
const s = new Sim(p);
console.log('t,tpl,meanLen,distinct,births,eOn,memActive,ringsWithStrand,cuts,rayHits');
for (let t = every; t <= steps; t += every) {
  s.run(every); const st = s.stats();
  console.log([s.t, st.tpl, st.meanLen.toFixed(2), st.distinct, st.births, st.eOn, st.memActive, st.ringsWithStrand, st.cuts, st.rayHits].join(','));
}
if (births) fs.writeFileSync(births, s.births.map((b) => JSON.stringify(b)).join('\n') + '\n');
console.error(JSON.stringify({ index: i, overrides: over, params: p }));
