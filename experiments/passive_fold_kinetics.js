#!/usr/bin/env node
// Q7b kinetic race: free-face fold versus straight material. Observer IDs never enter Sim.
const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const { Sim, F, R, L, I_TPL } = require('../src/sim.js');
const { hash, cpu, geometry, comparable } = require('./duplex_repair.js');
const sources = ['src/sim.js', 'experiments/duplex_repair.js', 'experiments/passive_fold_kinetics_plan.md', 'experiments/passive_fold_kinetics.js'];
const modes = ['body4', 'individual4', 'individual16'], arms = ['straight', 'fold45'], preparations = ['escape', 'acquire'];
const seeds = Array.from({ length: 16 }, (_, i) => 7301 + i);
const HORIZON = 1000, RELAX = 100, HOLD = 25, MID = 500;
const jobs = () => preparations.flatMap(preparation => modes.flatMap(mode => arms.flatMap(arm => seeds.map(seed => ({ preparation, mode, arm, seed })))));
const quiet = { pHyb: 0, pLigate: 0, pMelt: 0, pMeltRun: 0, pMeltEnd: 0, sigma: 0, sigmaRot: 0 };
const kinetic = { pHyb: 0.2, pLigate: 0.02, pMelt: 0.1, pMeltRun: 0.001, pMeltEnd: -1, sigma: 0.3, sigmaRot: 0.45 };
const sameEdge = (e, edge) => (e.a === edge[0] && e.b === edge[1]) || (e.b === edge[0] && e.a === edge[1]);
const plainJSON = x => JSON.parse(JSON.stringify(x));
const isFace = e => (e.a & 3) === F && (e.b & 3) === F;
function refresh(s) { s._deriveAll(); s._deriveAll(); s._computeOpen(); s._buildHash(); }

function build(job) {
  const fold = job.arm === 'fold45' ? 45 : 0;
  const s = new Sim({ seed: job.seed, W: 24, H: 24, nA: 2, nB: 2, nE: 0, seedCount: 0,
    foldA: fold, foldB: fold, stiffA: 0.8, stiffB: 0.8, bodyJostle: job.mode === 'body4',
    iters: job.mode === 'individual16' ? 16 : 4, snapCorners: false, maxStrain: 0,
    pSoft: 0, pCapture: 0, pSpont: 0, pFray: 0, pUnzip: 0, pBreak: 0, maxEventLog: 0, maxBirthLog: 1000, ...quiet });
  const row = s.seedStrand(12, 12, 0, 2, 'AB'), support = s.seedStrand(12, 11, Math.PI, 2, 'AB');
  assert(row && support);
  const pairs = [[row[0] * 4 + F, support[1] * 4 + F], [row[1] * 4 + F, support[0] * 4 + F]];
  for (const p of pairs) { const g = geometry(s, p); assert(g.gap < 1e-12 && g.angle < 1e-5); }
  if (job.preparation === 'escape') for (const [a, b] of pairs) s._link(a >> 2, F, b >> 2, F);
  for (let u = 0; u < s.n; u++) s._resetShape(u);   // square actual corners in every arm
  if (job.preparation === 'escape') s._unlink(pairs[1][0] >> 2, F);
  refresh(s);
  assert.equal(s.n, 4); assert.deepEqual(s.check(), []);
  assert.equal(Array.from(s.bond).filter(x => x >= 0).length / 2, job.preparation === 'escape' ? 3 : 2);
  return { s, row, support, pairs };
}
// The kinetic initial state; acquire first relaxes free material with kicks and reactions at zero.
function prepare(job) {
  const { s, ...ids } = build(job);
  if (job.preparation === 'acquire') { s.run(RELAX); assert.deepEqual(s.check(), []); }
  const relaxed = s.saveState(), k = Sim.fromState(relaxed, kinetic);
  return { ...ids, initial: k.saveState(), relaxedGeometry: ids.pairs.map(p => pick(geometry(k, p))) };
}
const pick = g => ({ gap: g.gap, angle: g.angle, pass: g.pass });

function exact(b, r) {
  const lateral = [[r.row[0] * 4 + R, r.row[1] * 4 + L], [r.support[0] * 4 + R, r.support[1] * 4 + L]];
  if (!lateral.every(([x, y]) => b[x] === y)) return false;
  for (const u of [...r.row, ...r.support]) for (const i of [R, L]) {
    const x = u * 4 + i; if (b[x] >= 0 && !lateral.some(e => e.includes(x))) return false;
  }
  return true;
}
// flags: 1 exact, 2 all TPL, 4 pair0 bound, 8 pair1 bound, 16 pair0 eligible, 32 pair1 eligible; then occupied faces
function frame(s, r) {
  const b = s.bond; let occupied = 0;
  for (let u = 0; u < s.n; u++) if (b[u * 4 + F] >= 0) occupied++;
  const g = r.pairs.map(p => geometry(s, p).pass);
  return [(exact(b, r) ? 1 : 0) | (Array.from(s.is).every(x => x === I_TPL) ? 2 : 0) |
    (b[r.pairs[0][0]] === r.pairs[0][1] ? 4 : 0) | (b[r.pairs[1][0]] === r.pairs[1][1] ? 8 : 0) |
    (g[0] ? 16 : 0) | (g[1] ? 32 : 0), occupied / 2];
}
function observe(r) {
  const s = Sim.fromState(r.initial), link = s._link, unlink = s._unlink;
  r.t0 = s.t; r.tape = []; r.frames = [];
  s._link = function(u, i, v, j) { r.tape.push({ t: this.t, op: 'link', a: u * 4 + i, b: v * 4 + j }); return link.call(this, u, i, v, j); };
  s._unlink = function(u, i) { const a = u * 4 + i, b = this.bond[a]; if (b >= 0) r.tape.push({ t: this.t, op: 'unlink', a, b }); return unlink.call(this, u, i); };
  return s;
}
function advance(s, r, end) {
  while (s.t < r.t0 + end) {
    s.step(); r.frames.push(frame(s, r));
    if (s.t === r.t0 + MID) r.midpoint = s.saveState();
  }
}
function invariant(s, r) {
  assert.deepEqual(s.check(), []); assert.equal(s.n, 4);
  assert.deepEqual(Array.from(s.type), Array.from(Sim.fromState(r.initial).type));
  for (const a of [s.px, s.py, s.ox, s.oy]) assert([...a].every(Number.isFinite));
}

// Outcomes come only from the ordered tape and per-step frames. Frame i is the state after kinetic step i + 1.
function analyse(r) {
  const rel = t => t - r.t0;   // Sim.step increments t first, so an event in kinetic step k carries t0 + k
  const faces = r.tape.filter(isFace);
  let streak = 0, firstBridge = null, released = 0, firstRelease = null, firstFull = null;
  for (let i = 0; i < r.frames.length; i++) {
    const f = r.frames[i][0], step = i + 1;
    if (firstFull === null && (f & 12) === 12) firstFull = step;
    streak = (f & 13) === 13 ? streak + 1 : 0;
    if (firstBridge === null && streak >= HOLD) firstBridge = step - HOLD + 1;
    released = (f & 3) === 3 && r.frames[i][1] === 0 ? released + 1 : 0;
    if (firstRelease === null && released >= HOLD) firstRelease = step - HOLD + 1;
  }
  let directEscape = false, firstFaceEvent = null;
  if (faces.length) {
    const e = faces[0]; firstFaceEvent = { op: e.op, step: rel(e.t) };
    if (r.job.preparation === 'escape' && e.op === 'unlink' && sameEdge(e, r.pairs[0])) {
      const start = rel(e.t), window = r.frames.slice(start - 1, start - 1 + HOLD);
      directEscape = window.length === HOLD && window.every(([f, n]) => (f & 3) === 3 && n === 0);
    }
  }
  const eligible = k => r.frames.filter(([f]) => f & (16 << k)).length;
  return { firstFaceEvent, directEscape, firstFaceLink: faces.find(e => e.op === 'link') ? rel(faces.find(e => e.op === 'link').t) : null,
    firstFull, firstBridge, bridge: firstBridge !== null && firstBridge <= r.frames.length - HOLD + 1, firstRelease,
    faceLinks: faces.filter(e => e.op === 'link').length, faceUnlinks: faces.filter(e => e.op === 'unlink').length,
    occupiedFaceSteps: r.frames.reduce((n, f) => n + f[1], 0), eligibleSteps: [eligible(0), eligible(1)],
    lateralEvents: r.tape.filter(e => !isFace(e)).length, finalFlags: r.frames.at(-1) };
}
function choose(n, k) { let c = 1; for (let i = 1; i <= k; i++) c = c * (n - k + i) / i; return c; }
function fisherGreater(a, b, n) {   // P(X >= a) for fold successes a, straight b, n per arm
  const K = a + b; let p = 0;
  for (let x = a; x <= Math.min(n, K); x++) p += choose(n, x) * choose(n, K - x) / choose(2 * n, K);
  return p;
}
function summarize(records) {
  const count = (prep, mode, arm, key) => records.filter(r => r.job.preparation === prep && r.job.mode === mode && r.job.arm === arm && r.outcome[key]).length;
  const rows = modes.map(mode => {
    const A = { straight: count('acquire', mode, 'straight', 'bridge'), fold45: count('acquire', mode, 'fold45', 'bridge') };
    const E = { straight: count('escape', mode, 'straight', 'directEscape'), fold45: count('escape', mode, 'fold45', 'directEscape') };
    const p = fisherGreater(E.fold45, E.straight, seeds.length);
    const valid = A.straight >= 8, retained = A.fold45 >= Math.ceil(A.straight / 2), escape = E.fold45 - E.straight >= 4 && p <= 0.05;
    return { mode, n: seeds.length, bridges: A, directEscapes: E, fisherP: p, valid, retained, escape, pass: valid && retained && escape };
  });
  return { worlds: records.length, rows, lead: records.length === jobs().length && rows.every(r => r.pass) };
}

function synthetic() {
  const base = { job: { preparation: 'escape' }, t0: 0, pairs: [[0, 12], [4, 8]] };
  const free = Array(30).fill([3, 0]), held = [3 | 4, 1];
  const mk = (tape, frames) => analyse({ ...base, tape, frames });
  const unlink0 = { t: 2, op: 'unlink', a: 0, b: 12 }, relink1 = { t: 1, op: 'link', a: 4, b: 8 };
  assert.equal(mk([unlink0], [held, ...free]).directEscape, true, 'direct escape');
  assert.equal(mk([relink1, unlink0], [held, ...free]).directEscape, false, 'rebinding first');
  const interrupted = [held, ...free.slice(0, 10), [3 | 8, 1], ...free];
  assert.equal(mk([unlink0, { t: 12, op: 'link', a: 4, b: 8 }], interrupted).directEscape, false, 'interrupted release');
  assert.equal(mk([{ t: 990, op: 'unlink', a: 0, b: 12 }], [...Array(989).fill(held), ...Array(11).fill([3, 0])]).directEscape, false, 'censored window');
  const acq = f => analyse({ ...base, job: { preparation: 'acquire' }, tape: [], frames: f }).bridge;
  assert.equal(acq([...Array(24).fill([15, 2]), [3, 0], ...Array(24).fill([15, 2])]), false, 'interrupted bridge');
  assert.equal(acq(Array(25).fill([15, 2])), true, 'sustained bridge');
  assert(Math.abs(fisherGreater(12, 4, 16) - 0.00614) < 1e-4 && fisherGreater(4, 4, 16) > 0.5);
  return 7;
}

function runWorld(job, stopAt) {
  const r = { job, ...prepare(job) };
  const s = observe(r); advance(s, r, stopAt); invariant(s, r);
  return { s, r };
}
function finish({ s, r }) {
  advance(s, r, HORIZON); invariant(s, r); r.final = s.saveState();
  const plain = Sim.fromState(r.initial), resumed = Sim.fromState(r.midpoint);
  plain.run(HORIZON); resumed.run(HORIZON - MID);
  assert.deepEqual(comparable(r.final), comparable(plain.saveState()), 'Observer changed state/RNG');
  assert.deepEqual(comparable(r.final), comparable(resumed.saveState()), 'Restart changed state/RNG');
  r.outcome = analyse(r); r.births = s.birthCount - Sim.fromState(r.initial).birthCount;
  r.checks = { neutral: true, restart: true, conserved: true }; return r;
}

function checkRecord(rec) {
  assert.deepEqual(plainJSON(prepare(rec.job).initial), rec.initial, 'relaxation/preparation mismatch');
  const r = { job: rec.job, row: rec.row, support: rec.support, pairs: rec.pairs, initial: rec.initial };
  const s = observe(r); advance(s, r, HORIZON);
  assert.deepEqual(r.tape, rec.tape, 'tape mismatch'); assert.deepEqual(r.frames, rec.frames, 'frame mismatch');
  assert.deepEqual(plainJSON(comparable(s.saveState())), comparable(rec.final), 'final mismatch');
  assert.deepEqual(plainJSON(analyse(rec)), rec.outcome, 'outcome mismatch');
}
function validate(file) {
  const bytes = fs.readFileSync(file), data = JSON.parse(bytes); assert(data.complete);
  for (const [f, h] of Object.entries(data.sources)) assert.equal(hash(fs.readFileSync(path.join(__dirname, '..', f))), h, f);
  const historical = JSON.parse(fs.readFileSync(path.join(__dirname, 'out/PE_geometry_20260927.json')));
  assert.equal(data.sources['src/sim.js'], historical.sources['src/sim.js'], 'core bytes changed since RESULTS 80');
  assert.deepEqual(data.records.map(r => r.job), jobs());
  const cases = synthetic();
  for (const rec of data.records) checkRecord(rec);
  assert.deepEqual(plainJSON(summarize(data.records)), data.summary, 'summary mismatch');
  const c1 = structuredClone(data.records.find(r => r.job.preparation === 'escape'));
  c1.frames[0][0] ^= 4; assert.throws(() => checkRecord(c1), /frame mismatch/);
  const c2 = structuredClone(data.records.find(r => r.outcome.firstFaceEvent));
  c2.tape.find(isFace).t++; assert.throws(() => checkRecord(c2), /tape mismatch/);
  const c3 = structuredClone(data.summary); c3.rows[0].bridges.fold45++;
  assert.throws(() => assert.deepEqual(plainJSON(summarize(data.records)), c3));
  return { valid: true, inputSha256: hash(bytes), worlds: data.records.length, replaySteps: data.records.length * HORIZON,
    relaxationRecomputed: data.records.filter(r => r.job.preparation === 'acquire').length, syntheticCases: cases,
    corruptionsRejected: 3, coreMatchesRESULTS80: true, summary: data.summary };
}

function main() {
  const isValidate = process.argv[2] === '--validate', file = path.resolve(process.argv[isValidate ? 3 : 2] || '');
  assert(process.argv[isValidate ? 3 : 2], 'Usage: passive_fold_kinetics.js [--validate] OUT.json');
  if (isValidate) {
    const out = file + '.validation.json'; assert(!fs.existsSync(out), 'Refusing overwrite');
    const report = { ...validate(file), command: process.argv, cpuSeconds: cpu() };
    fs.writeFileSync(out, JSON.stringify(report) + '\n', { flag: 'wx' }); console.log(JSON.stringify(report)); return;
  }
  for (const f of [file, file + '.cpu.json', file + '.validation.json']) assert(!fs.existsSync(f), 'Refusing overwrite: ' + f);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const report = { kind: 'passive-fold-kinetics', baseline: '65fad20', created: new Date().toISOString(), command: process.argv,
    sources: Object.fromEntries(sources.map(f => [f, hash(fs.readFileSync(path.join(__dirname, '..', f)))])),
    parameters: { quiet, kinetic, HORIZON, RELAX, HOLD, MID, seeds }, records: [], complete: false };
  let current;
  try {
    report.syntheticCases = synthetic();
    const all = jobs(), started = new Map();
    // Early viability on the same instances: seed 7301 of every cell to kinetic step 50.
    for (const job of all.filter(j => j.seed === seeds[0])) { current = runWorld(job, 50); started.set(JSON.stringify(job), current); }
    report.viability = { worlds: started.size, steps: 50, passed: true };
    for (const job of all) {
      assert(cpu() < 145, 'Execution CPU cap reached before serialization');
      current = started.get(JSON.stringify(job)) || runWorld(job, 0);
      report.records.push(finish(current));
      if (report.records.length % 16 === 0) console.error(JSON.stringify({ done: report.records.length, total: all.length, cpuSeconds: cpu() }));
    }
    report.summary = summarize(report.records); report.complete = true;
  } catch (e) {
    report.failure = e.stack; process.exitCode = 1;
    if (current) report.partial = { ...current.r, outcome: current.r.frames.length ? analyse(current.r) : null };
  }
  report.cpuSeconds = cpu(); fs.writeFileSync(file, JSON.stringify(report) + '\n', { flag: 'wx' });
  fs.writeFileSync(file + '.cpu.json', JSON.stringify({ command: process.argv, cpuSeconds: cpu(),
    steps: report.complete ? { relaxation: 96 * RELAX, observed: 192 * HORIZON, plain: 192 * HORIZON, restart: 192 * (HORIZON - MID) } : null,
    scope: 'whole process: preparation/relaxation, viability, observed/plain/restart runs, analysis and raw serialization' }) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ complete: report.complete, failure: report.failure, cpuSeconds: cpu(), summary: report.summary }));
}
if (require.main === module) main();
module.exports = { jobs, build, prepare, frame, analyse, summarize, fisherGreater, synthetic };
