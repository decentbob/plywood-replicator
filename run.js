#!/usr/bin/env node
/*
 * Headless runner. Prints a CSV row every `--every` steps and a JSON summary at the end.
 *   node run.js --steps 100000 --every 2000 --seed 3 --pCapture 0.02 --pFray 0.0005
 * Any DEFAULTS key from src/sim.js can be passed as --key value. Booleans: --sun 1.
 *   --births FILE   write the birth log (one JSON object per line), appended every reporting interval so a run in progress (or
 *                   one that is stopped) has its births so far
 *   --quiet         no CSV, only the summary
 *   --change T:k=v,k=v   at step T set parameters (an environment change); may be repeated
 *   --save FILE     write the whole world state to FILE (JSON) at every reporting interval and at the end: the viewer opens it
 *                   ("open state"), and --load continues from it
 *   --load FILE     start from a saved state instead of a fresh world; parameters given on the command line override the saved
 *                   ones (a branch: the evolved population under a changed rule). --steps counts the steps to add
 */
const { Sim, DEFAULTS, REMOVED } = require('./src/sim.js');
const fs = require('fs');

const args = process.argv.slice(2);
const opt = { steps: 50000, every: 2000, quiet: false, births: '', save: '', load: '' };
const params = {}, changes = [];
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
  if (k === 'change') {
    const [at, kv] = v.split(':'); const set = {};
    for (const pair of kv.split(',')) { const [key, val] = pair.split('='); if (!(key in DEFAULTS)) { console.error('unknown parameter in --change: ' + key); process.exit(2); } set[key] = typeof DEFAULTS[key] === 'boolean' ? val !== '0' : (typeof DEFAULTS[key] === 'string' ? val : Number(val)); }
    changes.push({ at: Number(at), set }); continue;
  }
  if (k in opt) opt[k] = typeof opt[k] === 'boolean' ? v !== '0' : (typeof opt[k] === 'number' ? Number(v) : v);
  else if (k in DEFAULTS) params[k] = typeof DEFAULTS[k] === 'boolean' ? v !== '0' : (typeof DEFAULTS[k] === 'string' ? v : Number(v));
  else if (/^(size|mob|bend|fold|stiff|res|shape|smelt)[A-Z0-9]$/.test(k)) params[k] = k.startsWith('shape') ? v : Number(v);   // per-type knobs (sizeA, mob1, ...)
  else if (REMOVED.includes(k)) console.error('ignoring --' + k + ': it belonged to the rigid engine, removed on 2026-09-23');
  else { console.error('unknown option --' + k); process.exit(2); }
}

const sim = opt.load ? Sim.fromState(JSON.parse(fs.readFileSync(opt.load, 'utf8')), params) : new Sim(params);
const t00 = sim.t;
const saveState = () => { if (opt.save) { fs.writeFileSync(opt.save + '.tmp', JSON.stringify(sim.saveState())); fs.renameSync(opt.save + '.tmp', opt.save); } };
const cols = ['t', 'free', 'docked', 'repel', 'tpl', 'strands', 'complexes', 'meanLen', 'maxLen', 'distinct', 'entropy', 'births', 'maxGen', 'eOn', 'energyUsed', 'docks', 'softDocks', 'captures', 'ligations', 'frays', 'unzips', 'fed', 'undocks', 'spont', 'breaks', 'energyCharged', 'rings', 'memRings', 'memArcs', 'enclosedAB', 'enclosedE', 'enclosedTPL', 'enclosedMotif', 'totalMotif', 'ringsWithStrand', 'memActive', 'made', 'binds', 'melts', 'snaps', 'rayHits', 'cuts', 'proofs', 'held', 'stacked', 'stackRows', 'stackMelts', 'nStacks', 'maxStack', 'meanStack'];
if (!opt.quiet) console.log(cols.join(','));
const t0 = Date.now();
// the birth log is flushed every interval (and the simulation's copy emptied), so it is complete up to the last report
if (opt.births) fs.writeFileSync(opt.births, '');
const flushBirths = () => { if (!opt.births || !sim.births.length) return; fs.appendFileSync(opt.births, sim.births.map((b) => JSON.stringify(b)).join('\n') + '\n'); sim.births.length = 0; };
changes.sort((a, b) => a.at - b.at);
for (let s = 0; s < opt.steps; s += opt.every) {
  // run to the end of this reporting interval, applying any environment change on the way (step numbers count from the start of
  // the original run, so a resumed run keeps its clock)
  const end = t00 + Math.min(s + opt.every, opt.steps);
  while (changes.length && changes[0].at < end) {
    sim.run(Math.max(0, changes[0].at - sim.t));
    Object.assign(sim.p, changes.shift().set); sim.bondsDirty = true; sim._computeOpen();
  }
  sim.run(end - sim.t);
  const st = sim.stats();
  if (!opt.quiet) console.log(cols.map((c) => typeof st[c] === 'number' ? +st[c].toFixed(3) : st[c]).join(','));
  flushBirths();
  saveState();
  const errs = sim.check();
  if (errs.length) { console.error('CHECK FAILED at t=' + sim.t + ': ' + errs.slice(0, 5).join('; ')); process.exit(1); }
}
const st = sim.stats();
const secs = (Date.now() - t0) / 1000;
console.error(JSON.stringify({ params: sim.p, final: st, stepsPerSec: Math.round(opt.steps / secs) }, null, 1));
flushBirths();
