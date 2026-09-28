#!/usr/bin/env node
// Independent replay validator for Q7b. Replaces the runner's --validate mode, whose core-byte check compared this
// Linux checkout (LF) with the CRLF bytes hashed on Windows for RESULTS 80; the comparison below normalizes line endings.
const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const { Sim, F } = require('../src/sim.js');
const { hash, cpu, comparable } = require('./duplex_repair.js');
const K = require('./passive_fold_kinetics.js');
const HORIZON = 1000, MID = 500;
const plainJSON = x => JSON.parse(JSON.stringify(x));
const lf = b => Buffer.from(b.toString('utf8').replace(/\r\n/g, '\n'));
const isFace = e => (e.a & 3) === F && (e.b & 3) === F;

function replay(rec) {
  assert.deepEqual(plainJSON(K.prepare(rec.job).initial), rec.initial, 'relaxation/preparation mismatch');
  const s = Sim.fromState(rec.initial), link = s._link, unlink = s._unlink, tape = [], frames = [];
  s._link = function(u, i, v, j) { tape.push({ t: this.t, op: 'link', a: u * 4 + i, b: v * 4 + j }); return link.call(this, u, i, v, j); };
  s._unlink = function(u, i) { const a = u * 4 + i, b = this.bond[a]; if (b >= 0) tape.push({ t: this.t, op: 'unlink', a, b }); return unlink.call(this, u, i); };
  const t0 = s.t, ids = { row: rec.row, support: rec.support, pairs: rec.pairs };
  while (s.t < t0 + HORIZON) {
    s.step(); frames.push(K.frame(s, ids));
    if (s.t === t0 + MID) assert.deepEqual(plainJSON(comparable(s.saveState())), comparable(rec.midpoint), 'midpoint mismatch');
    assert.deepEqual(s.check(), []); assert.equal(s.n, 4);
  }
  assert.equal(rec.t0, t0);
  assert.deepEqual(tape, rec.tape, 'tape mismatch'); assert.deepEqual(frames, rec.frames, 'frame mismatch');
  assert.deepEqual(plainJSON(comparable(s.saveState())), comparable(rec.final), 'final mismatch');
  assert.deepEqual(Array.from(s.type), Array.from(Sim.fromState(rec.initial).type), 'inventory changed');
  assert.deepEqual(plainJSON(K.analyse(rec)), rec.outcome, 'outcome mismatch');
}

function main() {
  const file = path.resolve(process.argv[2] || ''), out = file + '.validation.json';
  assert(process.argv[2], 'Usage: passive_fold_kinetics_validate.js RAW.json'); assert(!fs.existsSync(out), 'Refusing overwrite');
  const bytes = fs.readFileSync(file), data = JSON.parse(bytes); assert(data.complete);
  for (const [f, h] of Object.entries(data.sources)) assert.equal(hash(fs.readFileSync(path.join(__dirname, '..', f))), h, f);
  const pe = JSON.parse(fs.readFileSync(path.join(__dirname, 'out/PE_geometry_20260927.json')));
  const core = fs.readFileSync(path.join(__dirname, '../src/sim.js'));
  assert.equal(hash(Buffer.from(lf(core).toString().replace(/\n/g, '\r\n'))), pe.sources['src/sim.js'], 'core differs from RESULTS 80 beyond line endings');
  assert.deepEqual(data.records.map(r => r.job), K.jobs());
  const syntheticCases = K.synthetic();
  for (const rec of data.records) replay(rec);
  assert.deepEqual(plainJSON(K.summarize(data.records)), data.summary, 'summary mismatch');
  // Independent Fisher check by enumeration of all 16-choose tables.
  for (const row of data.summary.rows) {
    const a = row.directEscapes.fold45, b = row.directEscapes.straight, n = row.n, Kt = a + b;
    const c = (m, k) => { let x = 1; for (let i = 0; i < k; i++) x = x * (m - i) / (i + 1); return x; };
    let p = 0; for (let x = a; x <= Math.min(n, Kt); x++) p += c(n, x) * c(n, Kt - x) / c(2 * n, Kt);
    assert(Math.abs(p - row.fisherP) < 1e-12);
  }
  const c1 = structuredClone(data.records.find(r => r.job.preparation === 'escape'));
  c1.frames[0][0] ^= 4; assert.throws(() => replay(c1), /frame mismatch/);
  const c2 = structuredClone(data.records.find(r => r.outcome.firstFaceEvent));
  c2.tape.find(isFace).t++; assert.throws(() => replay(c2), /tape mismatch/);
  const c3 = structuredClone(data.summary); c3.rows[0].bridges.fold45++;
  assert.throws(() => assert.deepEqual(plainJSON(K.summarize(data.records)), c3));
  const report = { valid: true, command: process.argv, inputSha256: hash(bytes), validatorSha256: hash(fs.readFileSync(__filename)),
    worlds: data.records.length, replaySteps: data.records.length * HORIZON + 2 * HORIZON,
    relaxationRecomputed: data.records.filter(r => r.job.preparation === 'acquire').length, syntheticCases,
    corruptionsRejected: 3, coreMatchesRESULTS80AfterLineEndingNormalization: true, summary: data.summary, cpuSeconds: cpu() };
  fs.writeFileSync(out, JSON.stringify(report) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ valid: true, worlds: report.worlds, cpuSeconds: report.cpuSeconds }));
}
main();
