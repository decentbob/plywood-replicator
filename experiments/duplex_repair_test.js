#!/usr/bin/env node
// Offline validation of prepared identities, ordered physical changes and gate arithmetic.
const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const { Sim, F, R, L } = require('../src/sim.js');
const { sources, hash, cpu, jobs, setup, comparable } = require('./duplex_repair.js');
function validate(data) {
  assert.equal(data.kind, 'duplex-repair-preflight'); assert.equal(data.complete, true);
  assert.deepEqual(data.jobs, jobs()); assert.deepEqual(data.preflight, jobs()); assert.equal(data.records.length, 60);
  for (const f of sources) assert.equal(data.sources[f], hash(fs.readFileSync(path.join(__dirname, '..', f))), 'Source changed: ' + f);
  for (let i = 0; i < data.records.length; i++) {
    const r = data.records[i]; assert.deepEqual(r.job, data.jobs[i]);
    const prepared = setup(r.job);
    for (const k of ['row', 'support', 'faces', 'edge', 'supportEdge']) assert.deepEqual(r[k], prepared[k]);
    assert.deepEqual(comparable(r.initial), comparable(prepared.s.saveState()));
    const initial = Sim.fromState(r.initial), mid = Sim.fromState(r.midpoint), final = Sim.fromState(r.final);
    assert.equal(mid.t, 250); assert.equal(final.t, 500);
    for (const s of [mid, final]) { assert.deepEqual(s.check(), []); assert.deepEqual(s.type, initial.type); assert.deepEqual(s.p, initial.p); assert.equal(s.n, 8); }
    const bonds = Array.from(initial.bond); let t = 0, first = null, supportFirst = null, changed = 0;
    const original = new Set();
    const key = (a, b) => [a, b].sort((a, b) => a - b).join(':');
    for (const xs of [r.row, r.support]) for (let k = 0; k < xs.length - 1; k++) original.add(key(xs[k] * 4 + R, xs[k + 1] * 4 + L));
    let midChecked = false;
    for (const e of r.tape) {
      assert(Number.isInteger(e.t) && e.t >= t && e.t >= 1 && e.t <= 500);
      if (!midChecked && e.t > 250) { assert.deepEqual(bonds, Array.from(mid.bond)); midChecked = true; }
      t = e.t;
      assert(Number.isInteger(e.a) && Number.isInteger(e.b) && e.a >= 0 && e.b >= 0 && e.a < 32 && e.b < 32 && (e.a >> 2) !== (e.b >> 2));
      if (e.op === 'link') {
        assert.equal(bonds[e.a], -1); assert.equal(bonds[e.b], -1); bonds[e.a] = e.b; bonds[e.b] = e.a;
        if (key(e.a, e.b) === key(...r.edge) && first === null) first = e.t;
        if (key(e.a, e.b) === key(...r.supportEdge) && supportFirst === null) supportFirst = e.t;
        if ([L, R].includes(e.a & 3) && [L, R].includes(e.b & 3) && !original.has(key(e.a, e.b))) changed++;
      } else { assert.equal(e.op, 'unlink'); assert.equal(bonds[e.a], e.b); assert.equal(bonds[e.b], e.a); bonds[e.a] = -1; bonds[e.b] = -1; }
    }
    if (!midChecked) assert.deepEqual(bonds, Array.from(mid.bond));
    assert.deepEqual(bonds, Array.from(final.bond));
    const intact = xs => xs.slice(0, -1).every((u, j) => bonds[u * 4 + R] === xs[j + 1] * 4 + L);
    assert.deepEqual(r.outcome, { repaired: r.job.arm !== 'uncut' && first !== null && bonds[r.edge[0]] === r.edge[1],
      firstRepair: first, censored: r.job.arm !== 'uncut' && first === null, supportRepair: supportFirst,
      rowIntact: intact(r.row), supportIntact: intact(r.support), occupiedFaces: bonds.filter((b, a) => a % 4 === F && b >= 0).length,
      changedNeighborJoins: changed, originalBondsRetained: Array.from(initial.bond).every((b, a) => b < 0 || bonds[a] === b),
      births: final.birthCount - initial.birthCount });
    assert.deepEqual(r.checks, { neutral: true, restart: true, conserved: true });
    assert.equal(r.samples.length, 500);
    for (let j = 0; j < r.samples.length; j++) {
      const g = r.samples[j]; assert.equal(g.t, j + 1);
      assert([...g.sa, ...g.sb, g.dx, g.dy, g.gap, g.angle].every(Number.isFinite));
      const gap = Math.hypot(g.dx + g.sb[0] - g.sa[0], g.dy + g.sb[1] - g.sa[1]);
      const dot = g.sa[2] * g.sb[2] + g.sa[3] * g.sb[3];
      assert(Math.abs(g.gap - gap) < 1e-12);
      assert(Math.abs(g.angle - Math.acos(Math.max(-1, Math.min(1, -dot))) * 180 / Math.PI) < 1e-9);
      const dist = Math.hypot(g.dx, g.dy), p = initial.p;
      assert.equal(g.pass, dist >= 1 - p.distTol && dist <= 1 + p.distTol && gap <= p.linkDistTol && dot <= -Math.cos(p.linkTolDeg * Math.PI / 180));
    }
  }
  // Recompute the promotion decision directly, without the assay's summarize helper.
  let passAll = true;
  for (const seed of [601, 602]) for (const mode of ['body4', 'individual4', 'individual16']) {
    const group = data.records.filter(r => r.job.seed === seed && r.job.mode === mode);
    const count = arm => group.filter(r => r.job.arm === arm && r.outcome.repaired).length;
    const validUncut = group.filter(r => r.job.arm === 'uncut' && r.outcome.originalBondsRetained).length;
    const pass = count('bridge') === 2 && count('split') <= 1 && count('unbound') <= 1 && count('noLigate') === 0 && validUncut === 2;
    const saved = data.summary.rows.find(r => r.seed === seed && r.mode === mode); assert(saved); assert.equal(saved.pass, pass);
    for (const arm of ['bridge', 'split', 'unbound', 'noLigate', 'uncut']) {
      const members = group.filter(r => r.job.arm === arm);
      assert.deepEqual(saved[arm], { n: 2, repaired: count(arm), retained: members.filter(r => r.outcome.originalBondsRetained).length,
        times: members.map(r => r.outcome.firstRepair), occupiedFaces: members.map(r => r.outcome.occupiedFaces) });
    }
    passAll &&= pass;
  }
  assert.equal(data.summary.rows.length, 6); assert.equal(data.summary.worlds, 60); assert.equal(data.summary.lead, passAll);
}
function main() {
  const file = process.argv[2]; assert(file, 'Raw JSON required'); const output = file + '.validation.json';
  assert(!fs.existsSync(output), 'Refusing overwrite');
  const report = { command: process.argv, valid: false };
  try {
    const bytes = fs.readFileSync(file), data = JSON.parse(bytes); report.inputSha256 = hash(bytes); validate(data);
    const cases = [x => { x.records[0].outcome.repaired = !x.records[0].outcome.repaired; },
      x => { x.records[0].tape.unshift({ t: 1, op: 'link', a: 99, b: 1 }); },
      x => { x.records[0].samples[0].gap += 1; }, x => { x.summary.lead = !x.summary.lead; }];
    for (const corrupt of cases) { const bad = structuredClone(data); corrupt(bad); assert.throws(() => validate(bad)); }
    report.valid = true; report.worlds = data.records.length; report.corruptionChecks = cases.length;
  } catch (error) { report.failure = error.stack; process.exitCode = 1; }
  report.cpuSeconds = cpu(); fs.writeFileSync(output, JSON.stringify(report) + '\n', { flag: 'wx' }); console.log(JSON.stringify(report));
}
if (require.main === module) main();
module.exports = { validate };
