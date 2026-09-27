#!/usr/bin/env node
// Offline observation only: never advances or edits a simulation.
const fs = require('fs');
const path = require('path');
const assert = require('assert/strict');
const crypto = require('crypto');
const {load, validate} = require('./sequence_shape_summary.js');
const root = path.join(__dirname, '..');
const inputStem = 'experiments/out/SS_screen_20260927';
const sourceFiles = ['experiments/short_variant_plan.md', 'experiments/portfolio_checkpoint.md',
  'experiments/short_variant_summary.js', 'experiments/short_variant_test.js'];
const hash = data => crypto.createHash('sha256').update(data).digest('hex');
const complement = q => [...q].reverse().map(c => c === 'A' ? 'B' : 'A').join('');
const family = q => [q, complement(q)].sort()[0];
const short = p => p.born > 0 && p.seq.length >= 2 && p.seq.length <= 7;

function census(r) {
  const live = new Map(), releases = new Map(), arms = new Map(), origins = new Map();
  const registered = new Set(), edges = [], relations = [];
  let previous = 0;
  for (const [index, e] of r.events.entries()) {
    assert(e.t >= previous && e.t <= r.steps, 'Event order'); previous = e.t;
    if (e.kind === 'release') {
      assert.equal(e.row, live.get(e.unit) ?? null, 'Release parent not live');
      releases.set(e.u, {...e, index});
    }
    if (e.kind === 'rearm') arms.set(e.u, {...e, index});
    if (e.kind === 'retire') {
      assert(registered.has(e.id), 'Unknown retired row');
      for (const u of r.rows[e.id].units) if (live.get(u) === e.id) live.delete(u);
    }
    if (e.kind !== 'row') continue;
    const p = r.rows[e.id];
    assert(p && !registered.has(e.id), 'Duplicate/missing row');
    assert.equal(p.born, e.t); assert.deepEqual(p.units, e.units);
    registered.add(e.id);
    const witnesses = p.units.map(u => releases.get(u) ?? null);
    origins.set(p.id, witnesses);
    let parent = null;
    if (p.born) {
      assert.deepEqual(p.provenance, witnesses.map(v => v ? {t:v.t, unit:v.unit, row:v.row} : null));
      const ids = new Set(witnesses.map(v => v?.row ?? null));
      if (ids.size === 1 && !ids.has(null)) {
        const par = r.rows[[...ids][0]];
        if (par.units.length === p.units.length && witnesses.every((v, i) =>
          v.unit === par.units.at(-1-i) && live.get(v.unit) === par.id) &&
          p.units.every(u => !par.units.includes(u))) parent = par.id;
      }
      assert.equal(p.parent, parent, 'Reconstructed parent differs');
      assert.equal(p.exact, parent !== null && p.detached && p.seq === complement(r.rows[parent].seq));
      if (parent !== null) {
        const par = r.rows[parent];
        const fueled = par.units.every((u, i) => {
          const release = origins.get(par.id)[i], arm = arms.get(u);
          return release && arm && arm.index > release.index;
        });
        const exact = p.exact && par.detached && par.born > 0;
        const active = par.fullAt !== null && par.fullAt <= e.t;
        const relation = {parent, child:p.id, family:family(p.seq), length:p.seq.length,
          t:e.t, exact, active, fueled};
        relations.push(relation);
        if (exact && active && fueled) edges.push(relation);
      }
    }
    for (const u of p.units) { assert(!live.has(u), 'Reused live member'); live.set(u, p.id); }
  }
  assert.equal(registered.size, r.rows.length);
  const shortRows = r.rows.filter(short);
  const shortEdges = edges.filter(e => short(r.rows[e.parent]));
  const chains = shortEdges.flatMap(first => shortEdges.filter(second => first.child === second.parent)
    .map(second => ({family:first.family, rows:[first.parent, first.child, second.child],
      times:[r.rows[first.parent].born, first.t, second.t]})));
  const summarize = rows => {
    const ids = new Set(rows.map(p => p.id));
    const es = shortEdges.filter(e => ids.has(e.parent));
    return {births:rows.length, detached:rows.filter(p => p.detached).length,
      full:rows.filter(p => p.detached && p.fullAt !== null).length,
      unassignedParent:rows.filter(p => p.parent === null).length,
      primary:new Set(es.map(e => e.parent)).size,
      earlyPrimary:new Set(es.filter(e => r.rows[e.parent].born <= 50000).map(e => e.parent)).size,
      edges:es.length, chains:chains.filter(c => ids.has(c.rows[0])).length,
      intactAtHorizon:rows.filter(p => p.detached && p.lost === null).length,
      persistent5k:rows.filter(p => p.detached && p.born + 5000 <= r.steps &&
        (p.lost === null || p.lost >= p.born + 5000)).length,
      censored5k:rows.filter(p => p.detached && p.lost === null && p.born + 5000 > r.steps).length};
  };
  const families = [...new Set(shortRows.map(p => family(p.seq)))].sort().map(q =>
    ({family:q, length:q.length, ...summarize(shortRows.filter(p => family(p.seq) === q))}));
  return {seed:r.seed, sequence:r.sequence, profile:r.profile, grip:r.grip, steps:r.steps,
    totals:summarize(shortRows), families, edges:shortEdges, chains,
    calibrationEightParents:new Set(edges.filter(e => r.rows[e.parent].depth !== null &&
      r.rows[e.parent].seq.length === 8).map(e => e.parent)).size,
    exactShortEdgesWithoutFuel:relations.filter(e => e.exact && e.length < 8 && !e.fueled).length,
    finalMaterial:r.samples.at(-1).material};
}

function decision(worlds) {
  const candidates = [];
  for (const sequence of ['AAAABBBB', 'ABABABAB']) for (const profile of ['square', 'opposed20']) {
    const arm = (seed, grip) => worlds.find(w => w.seed === seed && w.sequence === sequence &&
      w.profile === profile && w.grip === grip);
    const families = [...new Set([203,204].flatMap(seed => arm(seed,true).families.map(f => f.family)))].sort();
    for (const q of families) if ([203,204].every(seed => {
      const on = arm(seed,true).families.find(f => f.family === q);
      const off = arm(seed,false).families.find(f => f.family === q);
      return on && on.chains > 0 && on.primary > (off?.primary ?? 0);
    })) candidates.push({sequence, profile, family:q});
  }
  return {candidates, pass:candidates.length > 0};
}

function analyze() {
  const {m, rs} = load(path.join(root, inputStem));
  validate(m, rs);
  assert.equal(rs.length, 16); assert(rs.every(r => r.steps === 100000));
  assert.deepEqual([...new Set(rs.map(r => r.seed))].sort(), [203,204]);
  const worlds = rs.map(census);
  // Calibration only: the independent fuel witness must not invent exact-founder renewal.
  for (let i = 0; i < rs.length; i++) assert(worlds[i].calibrationEightParents <= rs[i].metrics.primary);
  assert(worlds.some(w => w.calibrationEightParents > 0), 'Positive renewal calibration absent');
  return {worlds, decision:decision(worlds)};
}

function hashes(files) { return Object.fromEntries(files.map(f => [f, hash(fs.readFileSync(path.join(root,f)))])); }
function verify(file) {
  const saved = JSON.parse(fs.readFileSync(file, 'utf8'));
  assert.deepEqual(saved.inputs, hashes([inputStem+'.manifest.json', inputStem+'.runs.jsonl']));
  assert.deepEqual(Object.keys(saved.sources).sort(), [...sourceFiles].sort());
  for (const [f,h] of Object.entries(saved.sources)) {
    const raw = fs.readFileSync(path.join(root,f)), lf = raw.toString().replace(/\r\n/g,'\n');
    assert([hash(raw),hash(lf),hash(lf.replace(/\n/g,'\r\n'))].includes(h), 'Source changed: '+f);
  }
  assert.deepEqual(saved.result, analyze());
  return saved;
}
if (require.main === module) {
  if (process.argv[2] === '--verify') {
    verify(process.argv[3]); console.log('Archived census hashes and complete recomputation pass.');
  } else {
    assert(process.argv[2], 'Provide a fresh output stem');
    const file = path.resolve(process.argv[2]+'.json'); assert(!fs.existsSync(file), 'Refusing overwrite');
    const start = process.cpuUsage(), result = analyze(), used = process.cpuUsage(start);
    const report = {kind:'retrospective-short-variant-census', created:new Date().toISOString(),
      command:['node','experiments/short_variant_summary.js',...process.argv.slice(2)].join(' '),
      inputs:hashes([inputStem+'.manifest.json',inputStem+'.runs.jsonl']), sources:hashes(sourceFiles),
      cpuSeconds:(used.user+used.system)/1e6, simulationSteps:0, result};
    fs.mkdirSync(path.dirname(file), {recursive:true}); fs.writeFileSync(file, JSON.stringify(report,null,2)+'\n', {flag:'wx'});
    console.table(result.worlds.map(w => ({seed:w.seed,sequence:w.sequence,profile:w.profile,grip:w.grip,...w.totals})));
    console.log(JSON.stringify({decision:result.decision,cpuSeconds:report.cpuSeconds,file}));
  }
}
module.exports = {census, decision, analyze, verify, complement, family};
