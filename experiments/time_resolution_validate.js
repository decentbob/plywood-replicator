#!/usr/bin/env node
// Independent replay validator for Q9: every world, the RESULTS 92 replication, combined verdicts and corruptions.
const fs = require('fs'), path = require('path'), zlib = require('zlib'), assert = require('assert/strict');
const { Sim, F } = require('../src/sim.js');
const { hash, cpu, comparable } = require('./duplex_repair.js');
const T = require('./time_resolution.js'), K = require('./passive_fold_kinetics.js');
const plainJSON = x => JSON.parse(JSON.stringify(x));
const isFace = e => (e.a & 3) === F && (e.b & 3) === F;

function replay(rec) {
  assert.deepEqual(plainJSON(T.prepare(rec.job).initial), rec.initial, 'preparation mismatch');
  const m = T.perUnit(rec.job.dt), s = Sim.fromState(rec.initial), link = s._link, unlink = s._unlink, tape = [], frames = [];
  s._link = function(u, i, v, j) { tape.push({ t: this.t, op: 'link', a: u * 4 + i, b: v * 4 + j }); return link.call(this, u, i, v, j); };
  s._unlink = function(u, i) { const a = u * 4 + i, b = this.bond[a]; if (b >= 0) tape.push({ t: this.t, op: 'unlink', a, b }); return unlink.call(this, u, i); };
  const t0 = s.t, ids = { pairs: rec.pairs, row: rec.row, support: rec.support };
  assert.equal(t0, rec.t0);
  while (s.t < t0 + T.HORIZON * m) {
    s.step(); frames.push(T.pack(K.frame(s, ids)));
    if (s.t === t0 + T.MID * m) assert.deepEqual(plainJSON(comparable(s.saveState())), comparable(rec.midpoint), 'midpoint mismatch');
  }
  assert.deepEqual(s.check(), []); assert.equal(s.n, 4);
  assert.deepEqual(Array.from(s.type), Array.from(Sim.fromState(rec.initial).type), 'inventory changed');
  assert.deepEqual(tape, rec.tape, 'tape mismatch'); assert.deepEqual(frames, rec.frames, 'frame mismatch');
  assert.deepEqual(plainJSON(comparable(s.saveState())), comparable(rec.final), 'final mismatch');
  assert.deepEqual(plainJSON(T.analyse(rec)), rec.outcome, 'outcome mismatch');
}

function main() {
  const stem = path.resolve(process.argv[2] || ''), out = stem + '.validation.json';
  assert(process.argv[2], 'Usage: time_resolution_validate.js STEM'); assert(!fs.existsSync(out), 'Refusing overwrite');
  const pe = JSON.parse(fs.readFileSync(path.join(__dirname, 'out/PE_geometry_20260927.json')));
  const core = fs.readFileSync(path.join(__dirname, '../src/sim.js')).toString().replace(/\r\n/g, '\n');
  assert.equal(hash(Buffer.from(core.replace(/\n/g, '\r\n'))), pe.sources['src/sim.js'], 'core differs from RESULTS 80/92 beyond line endings');
  const pf = JSON.parse(fs.readFileSync(path.join(__dirname, 'out/PF_20260928.json'))).records;
  const syntheticCases = T.synthetic(), inputs = {}, records = [];
  let replicated = 0;
  for (const mode of T.modes) {
    const file = `${stem}_${mode}.json.gz`, bytes = fs.readFileSync(file), data = JSON.parse(zlib.gunzipSync(bytes));
    inputs[path.basename(file)] = hash(bytes);
    assert(data.complete, mode + ' incomplete'); assert.equal(data.mode, mode);
    for (const [f, h] of Object.entries(data.sources)) assert.equal(hash(fs.readFileSync(path.join(__dirname, '..', f))), h, f);
    assert.deepEqual(data.records.map(r => r.job), T.jobs(mode));
    for (const rec of data.records) {
      replay(rec);
      if (rec.job.dt === 1 && rec.job.seed <= 7316) {
        const a = pf.find(x => x.job.arm === 'straight' && x.job.mode === mode && x.job.preparation === rec.job.preparation && x.job.seed === rec.job.seed);
        assert.deepEqual(rec.tape, a.tape, 'RESULTS 92 tape'); assert.deepEqual(rec.frames.map(T.unpack), a.frames, 'RESULTS 92 frames');
        assert.equal(rec.replicatesRESULTS92, true); replicated++;
      } else assert.equal(rec.replicatesRESULTS92, null);
      records.push(rec);
    }
    assert.deepEqual(plainJSON(T.verdicts(data.records)), data.summary, mode + ' summary mismatch');
    console.error(JSON.stringify({ mode, validated: data.records.length, cpuSeconds: cpu() }));
  }
  assert.equal(replicated, 96);
  const combined = T.verdicts(records);
  for (const row of combined.rows) {   // independent two-sided Fisher by explicit table enumeration
    const a = row.bridges[1 / 16], b = row.bridges[1], n = row.n, Kt = a + b;
    const c = (x, k) => { let v = 1; for (let i = 0; i < k; i++) v = v * (x - i) / (i + 1); return v; };
    const pr = x => c(n, x) * c(n, Kt - x) / c(2 * n, Kt), o = pr(a);
    let p = 0; for (let x = Math.max(0, Kt - n); x <= Math.min(n, Kt); x++) if (pr(x) <= o * (1 + 1e-9)) p += pr(x);
    assert(Math.abs(Math.min(1, p) - row.fisherP) < 1e-12);
  }
  const c1 = structuredClone(records.find(r => r.job.dt === 1 / 16 && r.frames.length)); c1.frames[3] ^= 4;
  assert.throws(() => replay(c1), /frame mismatch/);
  const c2 = structuredClone(records.find(r => r.tape.some(isFace))); c2.tape.find(isFace).t++;
  assert.throws(() => replay(c2), /tape mismatch/);
  const c3 = structuredClone(combined); c3.rows[1].bridges[1]++;
  assert.throws(() => assert.deepEqual(plainJSON(T.verdicts(records)), plainJSON(c3)));
  const report = { valid: true, command: process.argv, validatorSha256: hash(fs.readFileSync(__filename)), inputs,
    worlds: records.length, replicatedRESULTS92: replicated, syntheticCases, corruptionsRejected: 3,
    coreMatchesRESULTS80AfterLineEndingNormalization: true, combined, cpuSeconds: cpu() };
  fs.writeFileSync(out, JSON.stringify(report) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ valid: true, worlds: records.length, combined, cpuSeconds: report.cpuSeconds }));
}
main();
