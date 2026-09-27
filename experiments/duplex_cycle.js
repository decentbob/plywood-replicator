#!/usr/bin/env node
// Fixed-rule association/release prerequisites. Observer identities never enter Sim.
const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const { Sim, F, R, L, I_TPL } = require('../src/sim.js');
const { hash, cpu, geometry, comparable } = require('./duplex_repair.js');
const sources = ['src/sim.js', 'experiments/duplex_repair.js', 'experiments/duplex_cycle_plan.md',
  'experiments/duplex_cycle.js', 'experiments/duplex_cycle_test.js'];
const modes = ['body4', 'individual16'], arms = ['on', 'noBind', 'noLigate', 'noMelt'];
const jobs = () => [603, 604].flatMap(seed => modes.flatMap(mode => ['ABAB', 'AABB'].flatMap(seq =>
  ['acquire', 'release'].flatMap(preparation => arms.map(arm => ({ seed, mode, seq, preparation, arm }))))));
const sameEdge = (e, edge) => (e.a === edge[0] && e.b === edge[1]) || (e.b === edge[0] && e.a === edge[1]);
function intact(bonds, xs) {
  return xs.slice(0, -1).every((u, i) => bonds[u * 4 + R] === xs[i + 1] * 4 + L) &&
    bonds[xs[0] * 4 + L] < 0 && bonds[xs[3] * 4 + R] < 0;
}
function bridge(bonds, r) {
  const attached = u => bonds[u * 4 + F] >= 0 && r.support.includes(bonds[u * 4 + F] >> 2);
  return intact(bonds, r.support) && r.row.slice(0, 2).some(attached) && r.row.slice(2).some(attached);
}
function frame(s, r) {
  const b = s.bond, occupied = Array.from(b).filter((x, i) => i % 4 === F && x >= 0).length;
  const flags = (intact(b, r.row) && intact(b, r.support) ? 1 : 0) |
    (Array.from(s.is).every(x => x === I_TPL) ? 2 : 0) | (bridge(b, r) ? 4 : 0) |
    (occupied === 0 ? 8 : 0) | (b[r.edge[0]] === r.edge[1] ? 16 : 0) | (intact(b, r.support) ? 32 : 0);
  return [flags, occupied];
}
function analyse(r) {
  let streak = 0, released = 0, firstBridge = null, firstRelease = null;
  const target = r.tape.filter(e => e.op === 'link' && sameEdge(e, r.edge));
  const supported = target.find(e => e.supportedBefore), firstSupportedRepair = supported ? supported.t : null;
  for (let i = 0; i < r.frames.length; i++) {
    const t = i + 1, flags = r.frames[i][0];
    streak = (flags & 7) === 7 ? streak + 1 : 0;
    if (firstBridge === null && streak >= 25) firstBridge = t;
    const after = r.job.preparation === 'acquire' ? firstBridge : firstSupportedRepair;
    released = after !== null && t >= after && (flags & 11) === 11 ? released + 1 : 0;
    if (firstRelease === null && released >= 25) firstRelease = { start: t - 24, end: t };
  }
  const face = r.tape.find(e => e.op === 'link' && (e.a & 3) === F && (e.b & 3) === F);
  const originals = [...r.row.slice(0, -1).map((u, i) => [u * 4 + R, r.row[i + 1] * 4 + L]),
    ...r.support.slice(0, -1).map((u, i) => [u * 4 + R, r.support[i + 1] * 4 + L])];
  return { firstNewFaceContact: face ? face.t : null, firstBridge, firstRepair: target.length ? target[0].t : null,
    firstSupportedRepair, firstRelease, success: firstRelease !== null, censored: firstRelease === null,
    horizon: r.frames.length, finalFlags: r.frames.at(-1),
    occupiedFaceSteps: r.frames.reduce((n, f) => n + f[1], 0),
    newNeighborJoins: r.tape.filter(e => e.op === 'link' && [R, L].includes(e.a & 3) && [R, L].includes(e.b & 3) && !originals.some(x => sameEdge(e, x))).length };
}
function setup(job) {
  const s = new Sim({ seed: job.seed, W: 24, H: 24, nA: 4, nB: 4, nE: 0, seedCount: 0,
    pHyb: job.arm === 'noBind' ? 0 : 0.2, pLigate: job.arm === 'noLigate' ? 0 : 0.02,
    pMelt: job.arm === 'noMelt' ? 0 : 0.1, pMeltRun: job.arm === 'noMelt' ? 0 : 0.001,
    pMeltEnd: job.arm === 'noMelt' ? 0 : -1, pSoft: 0, pCapture: 0, pSpont: 0, pFray: 0,
    pUnzip: 0, pBreak: 0, snapCorners: false, bodyJostle: job.mode === 'body4', iters: job.mode === 'body4' ? 4 : 16,
    maxEventLog: 0, maxBirthLog: 1000 });
  const rc = [...job.seq].reverse().map(x => x === 'A' ? 'B' : 'A').join('');
  const row = s.seedStrand(12, 12, 0, 4, job.seq), support = s.seedStrand(12, 11, Math.PI, 4, rc);
  assert(row && support); const edge = [row[1] * 4 + R, row[2] * 4 + L];
  for (let k = 0; k < 4; k++) {
    const a = row[k] * 4 + F, b = support[3 - k] * 4 + F, g = geometry(s, [a, b]);
    assert(g.gap < 1e-12 && g.angle < 1e-5);
    if (job.preparation === 'release') s._link(a >> 2, F, b >> 2, F);
  }
  if (job.preparation === 'release') s._unlink(edge[0] >> 2, edge[0] & 3);
  s._deriveAll(); s._deriveAll(); s._computeOpen(); s._buildHash();
  assert.equal(s.n, 8); assert.deepEqual(s.check(), []);
  assert.equal(Array.from(s.bond).filter(x => x >= 0).length / 2, job.preparation === 'release' ? 9 : 6);
  return { s, row, support, edge };
}
function start(job) {
  const { s, ...ids } = setup(job);
  const r = { job, ...ids, initial: s.saveState(), tape: [], frames: [], geometry: [] };
  const link = s._link, unlink = s._unlink, form = s._formBonds;
  s._link = function(u, i, v, j) {
    const e = { t: this.t, op: 'link', a: u * 4 + i, b: v * 4 + j };
    if (sameEdge(e, r.edge)) e.supportedBefore = bridge(this.bond, r);
    r.tape.push(e); return link.call(this, u, i, v, j);
  };
  s._unlink = function(u, i) {
    const a = u * 4 + i, b = this.bond[a]; if (b >= 0) r.tape.push({ t: this.t, op: 'unlink', a, b });
    return unlink.call(this, u, i);
  };
  s._formBonds = function() { if (this.t === 1 || this.t % 50 === 0) r.geometry.push(geometry(this, r.edge)); return form.call(this); };
  return { s, r };
}
function advance(ctx, end) {
  while (ctx.s.t < end) {
    if (ctx.s.t % 250 === 0) assert(cpu() < 150, 'Execution CPU reserve reached before serialization');
    ctx.s.step(); ctx.r.frames.push(frame(ctx.s, ctx.r));
    if (ctx.s.t === 250) ctx.r.pilotMidpoint = ctx.s.saveState();
    if (ctx.s.t === 2500) ctx.r.midpoint = ctx.s.saveState();
  }
}
function verify(ctx, horizon) {
  const { s, r } = ctx; r.final = s.saveState();
  const plain = Sim.fromState(r.initial), resumed = Sim.fromState(horizon === 500 ? r.pilotMidpoint : r.midpoint);
  for (const x of [plain, resumed]) {
    while (x.t < horizon) { assert(cpu() < 150, 'Execution CPU reserve reached'); x.run(Math.min(250, horizon - x.t)); }
    assert.deepEqual(comparable(r.final), comparable(x.saveState()), 'Neutrality/restart mismatch');
  }
  for (const x of [s, plain, resumed]) { assert.deepEqual(x.check(), []); assert.equal(x.n, 8); assert.deepEqual(x.type, Sim.fromState(r.initial).type); }
  r.outcome = analyse(r); r.births = s.birthCount - Sim.fromState(r.initial).birthCount;
  r.checks = { neutral: true, restart: true, conserved: true }; return r;
}
function finish(ctx) { advance(ctx, 5000); return verify(ctx, 5000); }
function summarize(records) {
  const rows = [];
  for (const seed of [603, 604]) for (const mode of modes) for (const preparation of ['acquire', 'release']) {
    const row = { seed, mode, preparation };
    for (const arm of arms) {
      const rs = records.filter(r => r.job.seed === seed && r.job.mode === mode && r.job.preparation === preparation && r.job.arm === arm);
      row[arm] = { n: rs.length, bridges: rs.filter(r => r.outcome.firstBridge !== null).length,
        repairs: rs.filter(r => r.outcome.firstRepair !== null).length, supportedRepairs: rs.filter(r => r.outcome.firstSupportedRepair !== null).length,
        successes: rs.filter(r => r.outcome.success).length, releaseIntervals: rs.map(r => r.outcome.firstRelease),
        finalOccupiedFaces: rs.map(r => r.outcome.finalFlags[1]) };
    }
    row.pass = arms.every(a => row[a].n === 2) && row.on.successes >= 1 && row.noMelt.successes === 0 &&
      (preparation === 'acquire' ? row.noBind.bridges === 0 : row.noLigate.repairs === 0);
    rows.push(row);
  }
  return { worlds: records.length, rows, lead: records.length === 64 && rows.every(r => r.pass) };
}
function main() {
  assert(process.argv[2], 'Output JSON required'); const file = path.resolve(process.argv[2]);
  for (const f of [file, file + '.cpu.json', file + '.validation.json']) assert(!fs.existsSync(f), 'Refusing overwrite: ' + f);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const report = { kind: 'duplex-cycle-prerequisites', baseline: 'd8d1bbc', created: new Date().toISOString(), command: process.argv,
    sources: Object.fromEntries(sources.map(f => [f, hash(fs.readFileSync(path.join(__dirname, '..', f)))])),
    jobs: jobs(), pilot: [], records: [], complete: false };
  const contexts = new Map(); let active;
  try {
    for (const job of report.jobs.filter(j => j.seed === 603 && j.preparation === 'release' && j.arm === 'on')) {
      active = start(job); contexts.set(JSON.stringify(job), active); advance(active, 500);
      assert.deepEqual(active.s.check(), []); const saved = active.s.saveState();
      report.pilot.push({ job, state: saved, outcome: analyse(active.r) }); active.r.pilotState = saved;
    }
    report.viable = modes.every(mode => report.pilot.some(r => r.job.mode === mode && r.outcome.firstSupportedRepair !== null));
    if (!report.viable) { report.disposition = 'stop: early repair viability gate failed'; report.records = [...contexts.values()].map(c => verify(c, 500)); }
    else {
      for (const job of report.jobs) {
        active = contexts.get(JSON.stringify(job)) || start(job); report.activeJob = job;
        report.records.push(finish(active)); console.error(JSON.stringify({ done: report.records.length, total: 64, job, cpuSeconds: cpu() }));
      }
      report.complete = true; report.summary = summarize(report.records);
    }
  } catch (error) {
    report.failure = error.stack; process.exitCode = 1;
    if (active) report.partial = { ...active.r, final: active.s.saveState(), outcome: analyse(active.r) };
  }
  report.cpuSeconds = cpu(); fs.writeFileSync(file, JSON.stringify(report) + '\n', { flag: 'wx' });
  fs.writeFileSync(file + '.cpu.json', JSON.stringify({ command: process.argv, cpuSeconds: cpu(), scope: 'whole process through raw serialization/write; pilot continues on original instances' }) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ complete: report.complete, viable: report.viable, failure: report.failure, disposition: report.disposition,
    cpuSeconds: cpu(), summary: report.summary }));
}
if (require.main === module) main();
module.exports = { sources, jobs, setup, analyse, summarize, bridge, frame, intact, sameEdge };
