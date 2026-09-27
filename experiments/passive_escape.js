#!/usr/bin/env node
// Prepared geometry diagnostic; IDs and classification never enter reactions.
const fs = require('fs'), path = require('path'), crypto = require('crypto'), assert = require('assert/strict');
const { Sim, F, NV } = require('../src/sim.js');
const { geometry, comparable } = require('./duplex_repair.js');
const sources = ['src/sim.js', 'experiments/duplex_repair.js', 'experiments/passive_escape.js', 'experiments/passive_escape_plan.md'];
const hash = x => crypto.createHash('sha256').update(x).digest('hex');
const cpu = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; };
const jobs = [4, 16].flatMap(iters => ['straight', 'fold45', 'rigid45'].map(arm => ({ iters, arm })));
const contexts = new WeakMap();
function context(initial) {
  if (!contexts.has(initial)) { const s = Sim.fromState(initial); s._bondList(); contexts.set(initial, s); }
  return contexts.get(initial);
}
function setup(job) {
  const fold = job.arm === 'straight' ? 0 : 45, stiff = job.arm === 'rigid45' ? 1 : 0.8;
  const s = new Sim({ seed: 605, W: 24, H: 24, nA: 2, nB: 2, nE: 0, seedCount: 0,
    foldA: fold, foldB: fold, stiffA: stiff, stiffB: stiff, sigma: 0, sigmaRot: 0,
    bodyJostle: false, iters: job.iters, snapCorners: false, maxStrain: 0,
    pHyb: 0, pMelt: 0, pMeltEnd: 0, pMeltRun: 0, pLigate: 0, pFray: 0, pUnzip: 0,
    pCapture: 0, pSpont: 0, pSoft: 0, pBreak: 0, maxEventLog: 0 });
  const row = s.seedStrand(12, 12, 0, 2, 'AB'), support = s.seedStrand(12, 11, Math.PI, 2, 'AB');
  for (let i = 0; i < 2; i++) s._link(row[i], F, support[1 - i], F);
  // Square actual starting geometry in every arm, before the prepared loss.
  for (let u = 0; u < s.n; u++) s._resetShape(u);
  const edge = [row[1] * 4 + F, support[0] * 4 + F];
  s._unlink(row[1], F); s._deriveAll(); s._deriveAll(); s._computeOpen(); s._buildHash(); s._bondList();
  assert.equal(s.n, 4); assert.deepEqual(s.check(), []); assert(geometry(s, edge).pass);
  return { s, edge };
}
function frame(s, edge) {
  return { t: s.t, px: [...s.px], py: [...s.py], ox: [...s.ox], oy: [...s.oy],
    contact: geometry(s, edge) };
}
// Independent world-coordinate calculation from raw corners, not _side/_geomOK.
function measure(f, initial, edge) {
  const p = initial.p, a = context(initial);
  const wrap = (d, width) => d - width * Math.round(d / width);
  const delta = (u, v) => [wrap(f.px[v] - f.px[u], p.W), wrap(f.py[v] - f.py[u], p.H)];
  function side(x) {
    const u = x >> 2, k = a.edgeOf[a.type[u] * 4 + (x & 3)], q = u * NV + k, r = u * NV + (k + 1) % a.nv[a.type[u]];
    const ex = f.ox[r] - f.ox[q], ey = f.oy[r] - f.oy[q], len = Math.hypot(ex, ey);
    return [(f.ox[q] + f.ox[r]) / 2, (f.oy[q] + f.oy[r]) / 2, ey / len, -ex / len];
  }
  const u = edge[0] >> 2, v = edge[1] >> 2, sa = side(edge[0]), sb = side(edge[1]);
  const [dx, dy] = delta(u, v), d = Math.hypot(dx, dy), d0 = (a.size[u] + a.size[v]) / 2;
  const gap = Math.hypot(dx + sb[0] - sa[0], dy + sb[1] - sa[1]);
  const dot = sa[2] * sb[2] + sa[3] * sb[3], angle = Math.acos(Math.max(-1, Math.min(1, -dot))) * 180 / Math.PI;
  const cos = deg => Math.cos(deg * Math.PI / 180);
  const pass = d >= d0 * (1 - p.distTol) && d <= d0 * (1 + p.distTol) && gap <= p.distTol * d0 &&
    (sa[2] * dx + sa[3] * dy) / d >= cos(p.tolDeg) && -(sb[2] * dx + sb[3] * dy) / d >= cos(p.tolDeg) && dot <= -cos(p.tolRotDeg);
  let maxPin = 0;
  const pins = a.pins;
  assert.equal(pins.length, 12);
  for (let i = 0; i < pins.length; i += 2) {
    const qa = pins[i], qb = pins[i + 1], [x, y] = delta(Math.floor(qa / NV), Math.floor(qb / NV));
    maxPin = Math.max(maxPin, Math.hypot(x + f.ox[qb] - f.ox[qa], y + f.oy[qb] - f.oy[qa]));
  }
  return { gap, angle, pass, maxPin };
}
function invariant(s, initial) {
  assert.deepEqual(s.check(), []); assert.equal(s.n, 4);
  assert.deepEqual(s.type, context(initial).type); assert.deepEqual(s.bond, context(initial).bond);
  for (const a of [s.px, s.py, s.ox, s.oy]) assert([...a].every(Number.isFinite));
}
function validateRecord(r) {
  assert.equal(r.samples.length, 101);
  for (const f of r.samples) {
    const m = measure(f, r.initial, r.edge);
    assert.equal(m.pass, f.contact.pass, 'contact flag mismatch');
    assert(Math.abs(m.gap - f.contact.gap) < 1e-12);
    assert(Math.abs(m.angle - f.contact.angle) < 1e-7);
    assert(Number.isFinite(m.maxPin));
  }
  assert.equal(r.samples[0].contact.pass, true);
  const tail = r.samples.slice(76).map(f => measure(f, r.initial, r.edge));
  return { ...r.job, firstIneligible: r.samples.find(f => !f.contact.pass)?.t ?? null,
    tailEligible: tail.filter(m => m.pass).length, tailMaxPin: Math.max(...tail.map(m => m.maxPin)),
    final: measure(r.samples[100], r.initial, r.edge) };
}
function summary(records) {
  const rows = records.map(validateRecord);
  return { rows, admitted: records.length === jobs.length && rows.every(r => r.tailMaxPin < 0.1 && r.tailEligible === (r.arm === 'fold45' ? 0 : 25)) };
}
function main() {
  const validation = process.argv[2] === '--validate', file = path.resolve(process.argv[validation ? 3 : 2]);
  const target = validation ? file + '.validation.json' : file;
  assert(!fs.existsSync(target), 'Refusing overwrite');
  if (validation) {
    const r = JSON.parse(fs.readFileSync(file)); assert(r.complete); assert.deepEqual(r.jobs, jobs);
    for (const [f, h] of Object.entries(r.sources)) assert.equal(hash(fs.readFileSync(f)), h, f);
    const historical = JSON.parse(fs.readFileSync('experiments/out/DC_20260927.json'));
    assert.equal(r.sources['src/sim.js'], historical.sources['src/sim.js']);
    for (const rec of r.records) {
      const s = Sim.fromState(rec.initial);
      assert.deepEqual(frame(s, rec.edge), rec.samples[0]);
      for (let t = 1; t <= 100; t++) { s.step(); assert.deepEqual(frame(s, rec.edge), rec.samples[t]); invariant(s, rec.initial); }
      assert.deepEqual(comparable(s.saveState()), comparable(rec.final));
    }
    assert.deepEqual(summary(r.records), r.summary);
    const corrupt = structuredClone(r.records[0]); corrupt.samples[1].contact.pass = !corrupt.samples[1].contact.pass;
    assert.throws(() => validateRecord(corrupt), /contact flag mismatch/);
    const report = { valid: true, rawHash: hash(fs.readFileSync(file)), worlds: r.records.length,
      replaySteps: r.records.length * 100, corruptionRejected: true, coreUnchanged: true, summary: r.summary, cpuSeconds: cpu() };
    fs.writeFileSync(target, JSON.stringify(report) + '\n', { flag: 'wx' }); console.log(JSON.stringify(report)); return;
  }
  fs.mkdirSync(path.dirname(file), { recursive: true }); assert(!fs.existsSync(file + '.cpu.json'));
  const report = { kind: 'passive-escape-geometry', baseline: '28b08c9', command: process.argv, created: new Date().toISOString(),
    sources: Object.fromEntries(sources.map(f => [f, hash(fs.readFileSync(f))])), jobs, records: [], complete: false };
  try {
    // Viability uses the first five steps of these same worlds; no resetting pilots.
    const active = jobs.map(job => { const { s, edge } = setup(job); const initial = s.saveState();
      const record = { job, edge, initial, samples: [frame(s, edge)] }; report.records.push(record);
      return { s, record }; });
    for (const r of report.records) assert.deepEqual(r.samples[0], report.records[0].samples[0]);
    for (const { s, record: r } of active) {
      for (let i = 0; i < 5; i++) { s.step(); r.samples.push(frame(s, r.edge)); }
      invariant(s, r.initial);
    }
    for (const { s, record } of active) {
      assert(cpu() < 10, 'Simulation CPU reserve reached');
      for (let i = 5; i < 100; i++) {
        s.step(); record.samples.push(frame(s, record.edge)); invariant(s, record.initial);
        if (s.t === 50) record.midpoint = s.saveState();
      }
      record.final = s.saveState();
      const plain = Sim.fromState(record.initial), restarted = Sim.fromState(record.midpoint); plain.run(100); restarted.run(50);
      assert.deepEqual(comparable(record.final), comparable(plain.saveState()));
      assert.deepEqual(comparable(record.final), comparable(restarted.saveState()));
      record.checks = { neutral: true, restart: true, conserved: true };
    }
    report.summary = summary(report.records); report.complete = true;
  } catch (e) { report.failure = e.stack; process.exitCode = 1; }
  report.cpuSeconds = cpu(); fs.writeFileSync(file, JSON.stringify(report) + '\n', { flag: 'wx' });
  fs.writeFileSync(file + '.cpu.json', JSON.stringify({ cpuSeconds: cpu(), scope: 'setup, viability, observation/plain/restart, analysis and raw serialization', steps: report.complete ? 1500 : null }) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ complete: report.complete, failure: report.failure, cpuSeconds: cpu(), summary: report.summary }));
}
if (require.main === module) main();
module.exports = { measure, validateRecord, summary };
