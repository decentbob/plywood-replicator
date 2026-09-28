#!/usr/bin/env node
// Q9: acquisition and escape of the RESULTS 92 straight dimer fixture at finer time steps. Existing knobs only:
// kicks scale by sqrt(dt), per-step probabilities by 1-(1-p)^dt; horizon and hold are fixed in physical time.
const fs = require('fs'), path = require('path'), zlib = require('zlib'), assert = require('assert/strict');
const { Sim, F } = require('../src/sim.js');
const { hash, cpu, comparable } = require('./duplex_repair.js');
const K = require('./passive_fold_kinetics.js');
const sources = ['src/sim.js', 'experiments/duplex_repair.js', 'experiments/passive_fold_kinetics.js',
  'experiments/time_resolution_plan.md', 'experiments/time_resolution.js'];
const modes = ['body4', 'individual4', 'individual16'], preparations = ['escape', 'acquire'], dts = [1, 1 / 4, 1 / 16];
const seeds = Array.from({ length: 32 }, (_, i) => 7301 + i);
const HORIZON = 1000, HOLD = 25, MID = 500, CAP = { body4: 200, individual4: 200, individual16: 200 };
const base = { pHyb: 0.2, pLigate: 0.02, pMelt: 0.1, pMeltRun: 0.001, sigma: 0.3, sigmaRot: 0.45 };
// dt = 1 keeps the exact RESULTS 92 values (1 - (1 - .2) is not exactly .2 in floating point).
const scaled = dt => {
  const q = { pMeltEnd: -1 };
  for (const [k, v] of Object.entries(base)) q[k] = dt === 1 ? v : k.startsWith('sigma') ? v * Math.sqrt(dt) : 1 - Math.pow(1 - v, dt);
  return q;
};
const perUnit = dt => Math.round(1 / dt);
const jobs = mode => preparations.flatMap(preparation => dts.flatMap(dt => seeds.map(seed => ({ preparation, mode, dt, seed }))));
const isFace = e => (e.a & 3) === F && (e.b & 3) === F;
const sameEdge = (e, edge) => (e.a === edge[0] && e.b === edge[1]) || (e.b === edge[0] && e.a === edge[1]);
const pack = ([f, n]) => f | (n << 6), unpack = x => [x & 63, x >> 6];

function prepare(job) {
  const p = K.prepare({ preparation: job.preparation, mode: job.mode, arm: 'straight', seed: job.seed });
  return { row: p.row, support: p.support, pairs: p.pairs, initial: Sim.fromState(p.initial, scaled(job.dt)).saveState() };
}
function observe(r) {
  const s = Sim.fromState(r.initial), link = s._link, unlink = s._unlink;
  r.t0 = s.t; r.tape = []; r.frames = [];
  s._link = function(u, i, v, j) { r.tape.push({ t: this.t, op: 'link', a: u * 4 + i, b: v * 4 + j }); return link.call(this, u, i, v, j); };
  s._unlink = function(u, i) { const a = u * 4 + i, b = this.bond[a]; if (b >= 0) r.tape.push({ t: this.t, op: 'unlink', a, b }); return unlink.call(this, u, i); };
  return s;
}
function advance(s, r, units) {
  const m = perUnit(r.job.dt), end = r.t0 + units * m;
  while (s.t < end) {
    s.step(); r.frames.push(pack(K.frame(s, r)));
    if (s.t === r.t0 + MID * m) r.midpoint = s.saveState();
  }
}
function invariant(s, r) {
  assert.deepEqual(s.check(), []); assert.equal(s.n, 4);
  assert.deepEqual(Array.from(s.type), Array.from(Sim.fromState(r.initial).type));
  for (const a of [s.px, s.py, s.ox, s.oy]) assert([...a].every(Number.isFinite));
}
// Frame i is the state after kinetic step i + 1; an event in kinetic step k carries t0 + k. Times are reported in time units.
function analyse(r) {
  const m = perUnit(r.job.dt), hold = HOLD * m, frames = r.frames.map(unpack), faces = r.tape.filter(isFace);
  let streak = 0, firstBridge = null, released = 0, firstRelease = null, firstFull = null;
  for (let i = 0; i < frames.length; i++) {
    const [f, n] = frames[i], step = i + 1;
    if (firstFull === null && (f & 12) === 12) firstFull = step;
    streak = (f & 13) === 13 ? streak + 1 : 0;
    if (firstBridge === null && streak >= hold) firstBridge = step - hold + 1;
    released = (f & 3) === 3 && n === 0 ? released + 1 : 0;
    if (firstRelease === null && released >= hold) firstRelease = step - hold + 1;
  }
  let directEscape = false;
  const first = faces[0], link = faces.find(e => e.op === 'link');
  if (r.job.preparation === 'escape' && first && first.op === 'unlink' && sameEdge(first, r.pairs[0])) {
    const start = first.t - r.t0, window = frames.slice(start - 1, start - 1 + hold);
    directEscape = window.length === hold && window.every(([f, n]) => (f & 3) === 3 && n === 0);
  }
  const time = step => step === null ? null : step / m;
  const count = k => frames.filter(([f]) => f & (16 << k)).length / frames.length;
  return { bridge: firstBridge !== null, firstBridge: time(firstBridge), firstFull: time(firstFull), directEscape,
    firstFaceEvent: first ? { op: first.op, time: time(first.t - r.t0) } : null, firstFaceLink: link ? time(link.t - r.t0) : null,
    firstRelease: time(firstRelease), faceLinks: faces.filter(e => e.op === 'link').length,
    occupiedFaceFraction: frames.reduce((a, [, n]) => a + n, 0) / (2 * frames.length), eligibleFraction: [count(0), count(1)],
    lateralEvents: r.tape.filter(e => !isFace(e)).length, final: frames.at(-1) };
}
function choose(n, k) { let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return c; }
function fisherTwoSided(a, b, n) {   // successes a and b of n each; sum of tables no more probable than observed
  const K2 = a + b, pr = x => choose(n, x) * choose(n, K2 - x) / choose(2 * n, K2), obs = pr(a);
  let p = 0; for (let x = Math.max(0, K2 - n); x <= Math.min(n, K2); x++) { const q = pr(x); if (q <= obs * (1 + 1e-9)) p += q; }
  return Math.min(1, p);
}
function verdicts(records) {
  const rows = modes.filter(mode => records.some(r => r.job.mode === mode)).map(mode => {
    const B = {}, E = {};
    for (const dt of dts) {
      const rs = records.filter(r => r.job.mode === mode && r.job.dt === dt);
      B[dt] = rs.filter(r => r.job.preparation === 'acquire' && r.outcome.bridge).length;
      E[dt] = rs.filter(r => r.job.preparation === 'escape' && r.outcome.directEscape).length;
    }
    const n = seeds.length, d = B[1 / 16] - B[1], p = fisherTwoSided(B[1 / 16], B[1], n);
    const verdict = Math.abs(d) >= 8 && p <= 0.05 ? (d > 0 ? 'sensitive-more' : 'sensitive-less')
      : Math.abs(B[1 / 4] - B[1]) <= 3 && Math.abs(d) <= 3 ? 'converged' : 'intermediate';
    return { mode, n, bridges: B, directEscapes: E, fisherP: p, verdict };
  });
  const ind = rows.filter(r => r.mode !== 'body4');
  let overall = null;
  if (ind.length === 2) {
    const sens = ind.filter(r => r.verdict.startsWith('sensitive'));
    overall = sens.length ? (sens.every(r => r.verdict === sens[0].verdict) ? sens[0].verdict : 'sensitive-mixed')
      : ind.every(r => r.verdict === 'converged') ? 'converged' : 'intermediate';
  }
  return { rows, overall };
}
function synthetic() {
  const job = dt => ({ preparation: 'escape', dt }), pairs = [[0, 12], [4, 8]];
  const held = pack([3 | 4, 1]), free = pack([3, 0]);
  // dt 1/4: hold is 100 steps
  const e = (tape, frames, dt = 1 / 4) => analyse({ job: job(dt), t0: 0, pairs, tape, frames }).directEscape;
  assert.equal(e([{ t: 2, op: 'unlink', a: 0, b: 12 }], [held, ...Array(100).fill(free)]), true);
  assert.equal(e([{ t: 2, op: 'unlink', a: 0, b: 12 }], [held, ...Array(99).fill(free)]), false, 'window truncated');
  assert.equal(e([{ t: 2, op: 'unlink', a: 0, b: 12 }], [held, ...Array(50).fill(free), pack([3 | 8, 1]), ...Array(100).fill(free)]), false);
  const b = (frames, dt) => analyse({ job: { preparation: 'acquire', dt }, t0: 0, pairs, tape: [], frames }).bridge;
  assert.equal(b(Array(399).fill(pack([15, 2])), 1 / 16), false, 'bridge shorter than 25 units');
  assert.equal(b(Array(400).fill(pack([15, 2])), 1 / 16), true);
  assert.equal(scaled(1).pHyb, 0.2); assert(Math.abs(scaled(1 / 4).pHyb - (1 - Math.pow(0.8, 0.25))) < 1e-15);
  assert(Math.abs(fisherTwoSided(24, 12, 32) - 0.0051373) < 1e-6 && fisherTwoSided(10, 10, 32) > 0.999999);
  return 7;
}
// dt = 1 seeds of RESULTS 92 must reproduce its archived straight records exactly.
let archived = null;
function replication(r) {
  if (r.job.dt !== 1 || r.job.seed > 7316) return null;
  archived = archived || JSON.parse(fs.readFileSync(path.join(__dirname, 'out/PF_20260928.json'))).records;
  const a = archived.find(x => x.job.arm === 'straight' && x.job.mode === r.job.mode && x.job.preparation === r.job.preparation && x.job.seed === r.job.seed);
  assert.deepEqual(JSON.parse(JSON.stringify(r.tape)), a.tape, 'RESULTS 92 tape not reproduced');
  assert.deepEqual(r.frames.map(unpack), a.frames, 'RESULTS 92 frames not reproduced');
  assert.equal(r.outcome.bridge, a.outcome.bridge); assert.equal(r.outcome.directEscape, a.outcome.directEscape);
  return true;
}
function runWorld(job, units) { const r = { job, ...prepare(job) }, s = observe(r); advance(s, r, units); invariant(s, r); return { s, r }; }
function finish({ s, r }) {
  const m = perUnit(r.job.dt);
  advance(s, r, HORIZON); invariant(s, r); r.final = s.saveState();
  const plain = Sim.fromState(r.initial), resumed = Sim.fromState(r.midpoint);
  plain.run(HORIZON * m); resumed.run((HORIZON - MID) * m);
  assert.deepEqual(comparable(r.final), comparable(plain.saveState()), 'Observer changed state/RNG');
  assert.deepEqual(comparable(r.final), comparable(resumed.saveState()), 'Restart changed state/RNG');
  r.outcome = analyse(r); r.replicatesRESULTS92 = replication(r);
  r.checks = { neutral: true, restart: true, conserved: true }; return r;
}
function main() {
  const [mode, out] = process.argv.slice(2);
  assert(modes.includes(mode) && out, 'Usage: time_resolution.js MODE OUT.json.gz');
  const file = path.resolve(out);
  for (const f of [file, file + '.cpu.json']) assert(!fs.existsSync(f), 'Refusing overwrite: ' + f);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const report = { kind: 'time-resolution', baseline: 'd5af3d1', created: new Date().toISOString(), command: process.argv, mode,
    sources: Object.fromEntries(sources.map(f => [f, hash(fs.readFileSync(path.join(__dirname, '..', f)))])),
    parameters: { dts, scaled: dts.map(scaled), HORIZON, HOLD, MID, seeds, cap: CAP[mode] }, records: [], complete: false };
  let current, steps = 0;
  try {
    report.syntheticCases = synthetic();
    const all = jobs(mode), started = new Map();
    for (const job of all.filter(j => j.seed === seeds[0])) { current = runWorld(job, 50); started.set(JSON.stringify(job), current); }
    report.viability = { worlds: started.size, units: 50, passed: true };
    for (const job of all) {
      assert(cpu() < CAP[mode], 'Execution CPU cap reached before serialization');
      current = started.get(JSON.stringify(job)) || runWorld(job, 0);
      report.records.push(finish(current)); steps += 2.5 * HORIZON * perUnit(job.dt);
      if (report.records.length % 32 === 0) console.error(JSON.stringify({ mode, done: report.records.length, total: all.length, cpuSeconds: cpu() }));
    }
    report.summary = verdicts(report.records); report.complete = true;
  } catch (e) {
    report.failure = e.stack; process.exitCode = 1;
    if (current) report.partial = { job: current.r.job, t: current.s.t, tape: current.r.tape.length, frames: current.r.frames.length };
  }
  report.cpuSeconds = cpu();
  fs.writeFileSync(file, zlib.gzipSync(JSON.stringify(report) + '\n', { level: 9 }), { flag: 'wx' });
  fs.writeFileSync(file + '.cpu.json', JSON.stringify({ command: process.argv, cpuSeconds: cpu(), kineticSteps: steps,
    relaxationSteps: report.records.filter(r => r.job.preparation === 'acquire').length * 100,
    scope: 'whole process: preparation, viability, observed/plain/restart runs, replication check, analysis, gzip serialization' }) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ mode, complete: report.complete, failure: report.failure, cpuSeconds: cpu(), summary: report.summary }));
}
if (require.main === module) main();
module.exports = { sources, modes, dts, seeds, jobs, scaled, prepare, observe, advance, analyse, verdicts, synthetic, pack, unpack, fisherTwoSided, perUnit, HORIZON, MID };
