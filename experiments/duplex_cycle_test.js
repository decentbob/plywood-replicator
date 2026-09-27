#!/usr/bin/env node
const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const { Sim, F, R, L, I_TPL } = require('../src/sim.js');
const { hash, cpu, comparable } = require('./duplex_repair.js');
const { sources, jobs, setup, analyse } = require('./duplex_cycle.js');
function fixtures() {
  const base = { job: { preparation: 'acquire' }, row: [0, 1, 2, 3], support: [4, 5, 6, 7], edge: [5, 11], tape: [] };
  const held = n => Array.from({ length: n }, () => [55, 4]);
  const free = n => Array.from({ length: n }, () => [59, 0]);
  let r = { ...base, frames: [...held(25), ...free(25)] };
  assert.deepEqual(analyse(r).firstRelease, { start: 26, end: 50 }); assert.equal(analyse(r).firstBridge, 25);
  r = { ...base, frames: [...free(25), ...held(25)] }; assert.equal(analyse(r).firstRelease, null);
  r = { ...base, frames: [...held(24), ...free(1), ...held(24)] }; assert.equal(analyse(r).firstBridge, null);
  r = { ...base, job: { preparation: 'release' }, frames: free(25), tape: [{ op: 'link', t: 1, a: 5, b: 11, supportedBefore: false }] };
  assert.equal(analyse(r).firstRepair, 1); assert.equal(analyse(r).firstRelease, null);
  r.tape[0].supportedBefore = true; assert.deepEqual(analyse(r).firstRelease, { start: 1, end: 25 });
  r.frames = [...free(24), ...held(1), ...free(25)]; assert.deepEqual(analyse(r).firstRelease, { start: 26, end: 50 });
  return 6;
}
const key = (a, b) => [a, b].sort((a, b) => a - b).join(':');
function independentOutcome(r) {
  // Window-based implementation, independent of the online streak counters.
  const has = (i, mask) => (r.frames[i][0] & mask) === mask;
  let firstBridge = null;
  for (let end = 24; end < r.frames.length; end++) {
    if (Array.from({ length: 25 }, (_, k) => end - k).every(i => has(i, 7))) { firstBridge = end + 1; break; }
  }
  const repairs = r.tape.filter(e => e.op === 'link' && key(e.a, e.b) === key(...r.edge));
  const supported = repairs.find(e => e.supportedBefore), firstSupportedRepair = supported ? supported.t : null;
  const after = r.job.preparation === 'acquire' ? firstBridge : firstSupportedRepair;
  let firstRelease = null;
  if (after !== null) for (let start = after - 1; start + 24 < r.frames.length; start++) {
    if (Array.from({ length: 25 }, (_, k) => start + k).every(i => has(i, 11))) { firstRelease = { start: start + 1, end: start + 25 }; break; }
  }
  const firstFace = r.tape.find(e => e.op === 'link' && e.a % 4 === F && e.b % 4 === F);
  const original = new Set();
  for (const xs of [r.row, r.support]) for (let i = 0; i < 3; i++) original.add(key(xs[i] * 4 + R, xs[i + 1] * 4 + L));
  return { firstNewFaceContact: firstFace ? firstFace.t : null, firstBridge, firstRepair: repairs.length ? repairs[0].t : null,
    firstSupportedRepair, firstRelease, success: firstRelease !== null, censored: firstRelease === null, horizon: r.frames.length,
    finalFlags: r.frames.at(-1), occupiedFaceSteps: r.frames.reduce((n, f) => n + f[1], 0),
    newNeighborJoins: r.tape.filter(e => e.op === 'link' && [R, L].includes(e.a % 4) && [R, L].includes(e.b % 4) && !original.has(key(e.a, e.b))).length };
}
function checkRecord(r, horizon) {
  const prepared = setup(r.job);
  for (const k of ['row', 'support', 'edge']) assert.deepEqual(r[k], prepared[k]);
  assert.deepEqual(comparable(r.initial), comparable(prepared.s.saveState()));
  const initial = Sim.fromState(r.initial), final = Sim.fromState(r.final);
  assert.equal(final.t, horizon); assert.equal(r.frames.length, horizon);
  for (const state of [r.final, r.pilotMidpoint, r.midpoint, r.pilotState].filter(Boolean)) {
    const s = Sim.fromState(state); assert.deepEqual(s.check(), []); assert.equal(s.n, 8);
    assert.deepEqual(s.p, initial.p); assert.deepEqual(s.type, initial.type); assert(Array.from(s.is).every(x => x === I_TPL));
  }
  const b = Array.from(initial.bond); let event = 0;
  const exact = xs => b[xs[0] * 4 + L] < 0 && b[xs[3] * 4 + R] < 0 && xs.slice(0, -1).every((u, i) => b[u * 4 + R] === xs[i + 1] * 4 + L);
  const supported = () => {
    const left = r.row.slice(0, 2).filter(u => b[u * 4 + F] >= 0 && r.support.includes(b[u * 4 + F] >> 2));
    const right = r.row.slice(2).filter(u => b[u * 4 + F] >= 0 && r.support.includes(b[u * 4 + F] >> 2));
    return exact(r.support) && left.length > 0 && right.length > 0;
  };
  let previous = 0;
  for (const e of r.tape) { assert(Number.isInteger(e.t) && e.t >= 1 && e.t >= previous && e.t <= horizon); previous = e.t; }
  for (let t = 1; t <= horizon; t++) {
    while (event < r.tape.length && r.tape[event].t === t) {
      const e = r.tape[event++]; assert(Number.isInteger(e.a) && Number.isInteger(e.b) && e.a >= 0 && e.a < 32 && e.b >= 0 && e.b < 32 && (e.a >> 2) !== (e.b >> 2));
      if (e.op === 'link') {
        assert.equal(b[e.a], -1); assert.equal(b[e.b], -1);
        if (key(e.a, e.b) === key(...r.edge)) assert.equal(e.supportedBefore, supported());
        b[e.a] = e.b; b[e.b] = e.a;
      } else { assert.equal(e.op, 'unlink'); assert.equal(b[e.a], e.b); assert.equal(b[e.b], e.a); b[e.a] = -1; b[e.b] = -1; }
    }
    // Under these fixed rules all blocks retain a lateral neighbor and their TPL state.
    for (let u = 0; u < 8; u++) assert(b[u * 4 + L] >= 0 || b[u * 4 + R] >= 0);
    const occupied = b.filter((q, i) => i % 4 === F && q >= 0).length;
    const flags = (exact(r.row) && exact(r.support) ? 1 : 0) | 2 | (supported() ? 4 : 0) |
      (occupied === 0 ? 8 : 0) | (b[r.edge[0]] === r.edge[1] ? 16 : 0) | (exact(r.support) ? 32 : 0);
    assert.deepEqual(r.frames[t - 1], [flags, occupied]);
    for (const state of [r.pilotMidpoint, r.midpoint, r.pilotState].filter(Boolean)) if (state.nums.t === t) assert.deepEqual(b, Array.from(Sim.fromState(state).bond));
  }
  assert.deepEqual(b, Array.from(final.bond)); assert.equal(event, r.tape.length);
  assert.deepEqual(r.outcome, independentOutcome(r)); assert.equal(r.births, final.birthCount - initial.birthCount);
  assert.deepEqual(r.checks, { neutral: true, restart: true, conserved: true });
  assert.equal(r.geometry.length, horizon / 50 + 1);
  for (let i = 0; i < r.geometry.length; i++) {
    const g = r.geometry[i]; assert.equal(g.t, i === 0 ? 1 : i * 50);
    const gap = Math.hypot(g.dx + g.sb[0] - g.sa[0], g.dy + g.sb[1] - g.sa[1]);
    const dot = g.sa[2] * g.sb[2] + g.sa[3] * g.sb[3], dist = Math.hypot(g.dx, g.dy), p = initial.p;
    assert(Number.isFinite(gap) && Number.isFinite(dot)); assert(Math.abs(gap - g.gap) < 1e-12);
    assert(Math.abs(g.angle - Math.acos(Math.max(-1, Math.min(1, -dot))) * 180 / Math.PI) < 1e-9);
    assert.equal(g.pass, dist >= 1 - p.distTol && dist <= 1 + p.distTol && gap <= p.linkDistTol && dot <= -Math.cos(p.linkTolDeg * Math.PI / 180));
  }
}
function validate(data) {
  assert.equal(data.kind, 'duplex-cycle-prerequisites'); assert.deepEqual(data.jobs, jobs());
  for (const f of sources) assert.equal(data.sources[f], hash(fs.readFileSync(path.join(__dirname, '..', f))), 'Changed source: ' + f);
  const pilots = jobs().filter(j => j.seed === 603 && j.preparation === 'release' && j.arm === 'on');
  assert.deepEqual(data.pilot.map(r => r.job), pilots);
  for (const pilot of data.pilot) {
    const r = data.records.find(r => JSON.stringify(r.job) === JSON.stringify(pilot.job)); assert(r);
    assert.deepEqual(r.pilotState, pilot.state);
    assert.deepEqual(pilot.outcome, independentOutcome({ ...r, frames: r.frames.slice(0, 500), tape: r.tape.filter(e => e.t <= 500) }));
  }
  const viable = ['body4', 'individual16'].every(mode => data.pilot.some(r => r.job.mode === mode && r.outcome.firstSupportedRepair !== null));
  assert.equal(data.viable, viable); assert.equal(data.complete, viable);
  assert.deepEqual(data.records.map(r => r.job), viable ? jobs() : pilots);
  for (const r of data.records) checkRecord(r, viable ? 5000 : 500);
  if (!viable) { assert(!data.summary); return; }
  let all = true;
  for (const seed of [603, 604]) for (const mode of ['body4', 'individual16']) for (const preparation of ['acquire', 'release']) {
    const group = data.records.filter(r => r.job.seed === seed && r.job.mode === mode && r.job.preparation === preparation);
    const saved = data.summary.rows.find(r => r.seed === seed && r.mode === mode && r.preparation === preparation); assert(saved);
    for (const arm of ['on', 'noBind', 'noLigate', 'noMelt']) {
      const rs = group.filter(r => r.job.arm === arm);
      assert.deepEqual(saved[arm], { n: 2, bridges: rs.filter(r => r.outcome.firstBridge !== null).length,
        repairs: rs.filter(r => r.outcome.firstRepair !== null).length, supportedRepairs: rs.filter(r => r.outcome.firstSupportedRepair !== null).length,
        successes: rs.filter(r => r.outcome.success).length, releaseIntervals: rs.map(r => r.outcome.firstRelease), finalOccupiedFaces: rs.map(r => r.outcome.finalFlags[1]) });
    }
    const succeeds = arm => group.filter(r => r.job.arm === arm && r.outcome.firstRelease !== null).length;
    const control = preparation === 'acquire' ? group.filter(r => r.job.arm === 'noBind').every(r => r.outcome.firstBridge === null)
      : group.filter(r => r.job.arm === 'noLigate').every(r => r.outcome.firstRepair === null);
    const pass = succeeds('on') >= 1 && succeeds('noMelt') === 0 && control;
    assert.equal(saved.pass, pass); all &&= pass;
  }
  assert.equal(data.summary.rows.length, 8); assert.equal(data.summary.worlds, 64); assert.equal(data.summary.lead, all);
}
function main() {
  const file = process.argv[2], report = { command: process.argv, valid: false };
  const output = file ? file + '.validation.json' : process.argv[3];
  if (output) assert(!fs.existsSync(output), 'Refusing overwrite');
  try {
    report.syntheticChecks = fixtures();
    if (file) {
      const bytes = fs.readFileSync(file), data = JSON.parse(bytes); report.inputSha256 = hash(bytes); validate(data);
      const mutations = [x => { x.records[0].frames[0][1] += 1; }, x => { x.records[0].outcome.firstRelease = { start: 1, end: 25 }; },
        x => { x.records[0].tape.unshift({ t: 1, op: 'link', a: 99, b: 1 }); }, x => { x.records[0].geometry[0].gap += 1; }];
      if (data.complete) mutations.push(x => { x.summary.lead = !x.summary.lead; });
      for (const mutate of mutations) { const bad = structuredClone(data); mutate(bad); assert.throws(() => validate(bad)); }
      report.corruptionChecks = mutations.length; report.worlds = data.records.length;
    }
    report.valid = true;
  } catch (error) { report.failure = error.stack; process.exitCode = 1; }
  report.cpuSeconds = cpu(); if (output) fs.writeFileSync(output, JSON.stringify(report) + '\n', { flag: 'wx' });
  console.log(JSON.stringify(report));
}
if (require.main === module) main();
module.exports = { validate, fixtures, independentOutcome };
