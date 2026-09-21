#!/usr/bin/env node
/*
 * Headless runner. Prints a CSV row every `--every` steps and a JSON summary at the end.
 *   node run.js --steps 100000 --every 2000 --seed 3 --pCapture 0.02 --pFray 0.0005
 * Any DEFAULTS key from src/sim.js can be passed as --key value. Booleans: --sun 1.
 *   --births FILE   write the birth log (one JSON object per line)
 *   --quiet         no CSV, only the summary
 */
const { Sim, DEFAULTS } = require('./src/sim.js');
const fs = require('fs');

const args = process.argv.slice(2);
const opt = { steps: 50000, every: 2000, quiet: false, births: '' };
const params = {};
if (args.includes('--help') || args.includes('-h')) {
  console.log('usage: node run.js [--steps N] [--every N] [--quiet] [--births FILE] [--<param> value ...]\nparams and defaults:');
  for (const k in DEFAULTS) console.log('  --' + k.padEnd(12) + JSON.stringify(DEFAULTS[k]));
  process.exit(0);
}
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (!a.startsWith('--')) continue;
  const k = a.slice(2);
  const v = (i + 1 < args.length && !args[i + 1].startsWith('--')) ? args[++i] : '1';
  if (k in opt) opt[k] = typeof opt[k] === 'boolean' ? v !== '0' : (typeof opt[k] === 'number' ? Number(v) : v);
  else if (k in DEFAULTS) params[k] = typeof DEFAULTS[k] === 'boolean' ? v !== '0' : (typeof DEFAULTS[k] === 'string' ? v : Number(v));
  else { console.error('unknown option --' + k); process.exit(2); }
}

const sim = new Sim(params);
const cols = ['t', 'free', 'docked', 'repel', 'tpl', 'strands', 'complexes', 'meanLen', 'maxLen', 'distinct', 'entropy', 'births', 'maxGen', 'eOn', 'energyUsed', 'docks', 'softDocks', 'captures', 'ligations', 'frays', 'undocks', 'spont', 'breaks', 'energyCharged', 'rings'];
if (!opt.quiet) console.log(cols.join(','));
const t0 = Date.now();
for (let s = 0; s < opt.steps; s += opt.every) {
  sim.run(Math.min(opt.every, opt.steps - s));
  const st = sim.stats();
  if (!opt.quiet) console.log(cols.map((c) => typeof st[c] === 'number' ? +st[c].toFixed(3) : st[c]).join(','));
  const errs = sim.check();
  if (errs.length) { console.error('CHECK FAILED at t=' + sim.t + ': ' + errs.slice(0, 5).join('; ')); process.exit(1); }
}
const st = sim.stats();
const secs = (Date.now() - t0) / 1000;
console.error(JSON.stringify({ params: sim.p, final: st, stepsPerSec: Math.round(opt.steps / secs) }, null, 1));
if (opt.births) fs.writeFileSync(opt.births, sim.births.map((b) => JSON.stringify(b)).join('\n') + '\n');
