#!/usr/bin/env node
// Paired stiffness x binding contrasts, with complete-window and raw-log validation.
const fs = require('fs');
const assert = require('assert/strict');
const { kind } = require('./product_exchange.js');
const ARMS = ['durable', 'durableNoBind', 'soft0', 'soft0NoBind'];

function analyze(prefix, after = 20000, until = 50000) {
  const m = JSON.parse(fs.readFileSync(prefix + '.manifest.json', 'utf8'));
  assert(m.complete, 'Batch must be complete');
  const { every, steps, seeds, arms } = m.options;
  assert(Number.isInteger(after) && Number.isInteger(until) && after >= 0 && until > after &&
    until <= steps && after % every === 0 && (until % every === 0 || until === steps), 'Use complete recorded windows');
  assert.deepEqual(arms.split(',').sort(), [...ARMS].sort(), 'Expected the four stiffness/binding arms');
  const seedList = seeds.split(',').map(Number), jobs = new Map();
  for (const job of m.jobs) {
    const key = job.arm + ':' + job.seed;
    assert(!jobs.has(key), 'Duplicate job'); jobs.set(key, job);
  }
  assert.equal(jobs.size, seedList.length * ARMS.length, 'Missing jobs');
  for (const seed of seedList) {
    const reference = jobs.get('durable:' + seed).params;
    for (const arm of ARMS) {
      const p = jobs.get(arm + ':' + seed).params;
      const soft = arm.startsWith('soft'), off = arm.endsWith('NoBind');
      assert.equal(p.stiff1 ?? 1, soft ? 0.8 : 1); assert.equal(p.stiff2 ?? 1, soft ? 0.8 : 1);
      assert.equal(p.pBindP, off ? 0 : reference.pBindP);
      assert(reference.pBindP > 0);
      const clean = x => Object.fromEntries(Object.entries(x).filter(([k]) => !['stiff1','stiff2','pBindP'].includes(k)));
      assert.deepEqual(clean(p), clean(reference), 'Unexpected parameter difference');
    }
  }
  const [header, ...lines] = fs.readFileSync(prefix + '.csv', 'utf8').trim().split(/\r?\n/);
  const columns = header.split(','), windows = new Map(), totals = new Map();
  for (const seed of seedList) for (const arm of ARMS) totals.set(arm + ':' + seed,
    { arm, seed, capped: 0, recipientParents: 0, exact: 0, unknown: 0, sites: 0, bound: 0 });
  for (const line of lines) {
    const values = line.split(','), r = Object.fromEntries(columns.map((c,i) => [c, c === 'arm' ? values[i] : Number(values[i])]));
    const key = r.arm + ':' + r.seed, wk = key + ':' + r.t;
    assert(jobs.has(key) && !windows.has(wk), 'Unknown job or duplicate window');
    assert(r.t > 0 && r.t <= steps && (r.t % every === 0 || r.t === steps), 'Unexpected window');
    windows.set(wk, { ...r, raw: { host:0, mimic:0, other:0, products:0 } });
    if (r.t > after && r.t <= until) {
      const g = totals.get(key); g.sites += r.mimicSites; g.bound += r.mimicBound;
    }
  }
  assert.equal(windows.size, jobs.size * Math.ceil(steps / every), 'Missing windows');
  for (const line of fs.readFileSync(prefix + '.births.jsonl', 'utf8').split(/\r?\n/).filter(Boolean)) {
    const b = JSON.parse(line), key = b.arm + ':' + b.seed;
    const w = windows.get(key + ':' + Math.min(steps, Math.ceil(b.t / every) * every));
    assert(w && b.t > 0 && b.t <= steps, 'Birth outside recorded windows');
    w.raw[b.prod ? 'products' : kind(b.seq)]++;
    if (b.prod || b.t <= after || b.t > until || kind(b.seq) === 'other') continue;
    const g = totals.get(key); g.capped++;
    const pk = kind(b.parent || '');
    if (pk === 'mimic') g.recipientParents++;
    if (pk === 'other') g.unknown++;
    else if (b.seq === [...b.parent].reverse().map(c => c === 'P' ? 'Q' : c === 'Q' ? 'P' : c).join('')) g.exact++;
  }
  for (const w of windows.values()) {
    for (const k of ['host','mimic','other']) assert.equal(w.raw[k], w[k + 'Births'], 'Raw/CSV birth mismatch');
    assert.equal(w.raw.products, w.products, 'Raw/CSV product mismatch');
  }
  const contrasts = seedList.map(seed => {
    const value = arm => totals.get(arm + ':' + seed).recipientParents;
    const rigid = value('durable') - value('durableNoBind');
    const flexible = value('soft0') - value('soft0NoBind');
    return { seed, rigid, flexible, interaction: flexible - rigid };
  });
  return { rows:[...totals.values()], contrasts, windows:windows.size };
}

if (require.main === module) {
  assert(process.argv.length === 3, 'usage: flexibility_summary.js PREFIX (fixed primary interval 20k–50k)');
  const { rows, contrasts, windows } = analyze(process.argv[2]);
  console.log(`Validated ${windows} windows against raw births and the four-arm parameter contrast. Interval: 20k–50k.`);
  console.log('| arm | seed | capped births | recipient-parent births | exact | unknown parent | recipient site-samples | recipient occupancy |');
  console.log('|---|---:|---:|---:|---:|---:|---:|---:|');
  for (const r of rows) console.log(`| ${r.arm} | ${r.seed} | ${r.capped} | ${r.recipientParents} | ${r.exact} | ${r.unknown} | ${r.sites} | ${r.sites ? (100*r.bound/r.sites).toFixed(2)+'%' : 'undefined'} |`);
  console.log('\nBinding effect on recipient-parent births (on minus off), paired within seed:');
  console.log('| seed | rigid | flexible | flexible minus rigid effect |\n|---|---:|---:|---:|');
  for (const r of contrasts) console.log(`| ${r.seed} | ${r.rigid} | ${r.flexible} | ${r.interaction} |`);
  console.log('| mean | ' + ['rigid','flexible','interaction'].map(k => contrasts.reduce((s,r)=>s+r[k],0)/contrasts.length).join(' | ') + ' |');
}
module.exports = { analyze };
