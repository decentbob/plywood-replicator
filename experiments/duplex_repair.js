#!/usr/bin/env node
// Prepared topology interventions; all remembered identities are observation only.
const fs = require('fs'), path = require('path'), crypto = require('crypto'), assert = require('assert/strict');
const { Sim, F, L, R, S } = require('../src/sim.js');
const modes = ['body4', 'individual4', 'individual16'];
const arms = ['bridge', 'split', 'unbound', 'noLigate', 'uncut'];
const sources = ['src/sim.js', 'experiments/duplex_repair_plan.md', 'experiments/duplex_repair.js', 'experiments/duplex_repair_test.js'];
const hash = x => crypto.createHash('sha256').update(x).digest('hex');
const cpu = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; };
const jobs = () => [601, 602].flatMap(seed => modes.flatMap(mode => ['ABAB', 'AABB'].flatMap(seq => arms.map(arm => ({ seed, mode, seq, arm })))));
function refresh(s) { s._deriveAll(); s._deriveAll(); s._computeOpen(); s._buildHash(); }
function geometry(s, edge) {
  const [a, b] = edge, u = a >> 2, v = b >> 2;
  const sa = s._side(u, a & 3, [0, 0, 0, 0]), sb = s._side(v, b & 3, [0, 0, 0, 0]);
  const dx = s._dx(s.px[v] - s.px[u]), dy = s._dy(s.py[v] - s.py[u]), dist = Math.hypot(dx, dy);
  const d0 = (s.size[u] + s.size[v]) / 2;
  return { t: s.t, sa, sb, dx, dy, gap: Math.hypot(dx + sb[0] - sa[0], dy + sb[1] - sa[1]),
    angle: Math.acos(Math.max(-1, Math.min(1, -sa[2] * sb[2] - sa[3] * sb[3]))) * 180 / Math.PI,
    pass: dist >= d0 * (1 - s.p.distTol) && dist <= d0 * (1 + s.p.distTol) && s._geomOK(u, a & 3, v, b & 3, dx, dy, dist),
    probability: s.compat(u, a & 3, v, b & 3), free: s.bond[a] < 0 && s.bond[b] < 0 };
}
function setup(job) {
  const s = new Sim({ seed: job.seed, W: 24, H: 24, nA: 4, nB: 4, nE: 0, seedCount: 0,
    pLigate: job.arm === 'noLigate' ? 0 : 0.02, pHyb: 0, pMelt: 0, pMeltEnd: 0, pMeltRun: 0,
    pSoft: 0, pCapture: 0, pSpont: 0, pFray: 0, pUnzip: 0, pBreak: 0, snapCorners: false,
    bodyJostle: job.mode === 'body4', iters: job.mode === 'individual16' ? 16 : 4,
    maxEventLog: 0, maxBirthLog: 1000 });
  const rc = [...job.seq].reverse().map(x => x === 'A' ? 'B' : 'A').join('');
  const row = s.seedStrand(12, 12, 0, 4, job.seq), support = s.seedStrand(12, 11, Math.PI, 4, rc);
  assert(row && support);
  const faces = row.map((u, i) => [u * 4 + F, support[3 - i] * 4 + F]);
  for (const [a, b] of faces) { const g = geometry(s, [a, b]); assert(g.gap < 1e-12 && g.angle < 1e-5); s._link(a >> 2, F, b >> 2, F); }
  const edge = [row[1] * 4 + R, row[2] * 4 + L], supportEdge = [support[1] * 4 + R, support[2] * 4 + L];
  if (job.arm !== 'uncut') s._unlink(edge[0] >> 2, edge[0] & 3);
  if (job.arm === 'split') s._unlink(supportEdge[0] >> 2, supportEdge[0] & 3);
  if (job.arm === 'unbound') for (const [a] of faces) s._unlink(a >> 2, F);
  refresh(s);
  assert.equal(s.n, 8); assert.deepEqual(s.check(), []);
  assert.equal(Array.from(s.bond).filter(x => x >= 0).length / 2, { bridge: 9, split: 8, unbound: 5, noLigate: 9, uncut: 10 }[job.arm]);
  if (job.arm !== 'uncut') { assert.equal(s.ss[edge[0]], S.END); assert.equal(s.ss[edge[1]], S.END); assert.equal(geometry(s, edge).probability, s.p.pLigate); }
  return { s, row, support, faces, edge, supportEdge };
}
function observe(s, edge) {
  const tape = [], samples = [], link = s._link, unlink = s._unlink, form = s._formBonds;
  s._link = function(u, i, v, j) { tape.push({ t: this.t, op: 'link', a: u * 4 + i, b: v * 4 + j }); return link.call(this, u, i, v, j); };
  s._unlink = function(u, i) { const a = u * 4 + i, b = this.bond[a]; if (b >= 0) tape.push({ t: this.t, op: 'unlink', a, b }); return unlink.call(this, u, i); };
  s._formBonds = function() { samples.push(geometry(this, edge)); return form.call(this); };
  return { tape, samples };
}
const same = (e, edge) => (e.a === edge[0] && e.b === edge[1]) || (e.a === edge[1] && e.b === edge[0]);
function outcome(r) {
  const s = Sim.fromState(r.final), initial = Sim.fromState(r.initial);
  const target = r.tape.find(e => e.op === 'link' && same(e, r.edge));
  const support = r.tape.find(e => e.op === 'link' && same(e, r.supportEdge));
  const rowIntact = xs => xs.slice(0, -1).every((u, i) => s.bond[u * 4 + R] === xs[i + 1] * 4 + L);
  const originals = [...r.row.slice(0, -1).map((u, i) => [u * 4 + R, r.row[i + 1] * 4 + L]),
    ...r.support.slice(0, -1).map((u, i) => [u * 4 + R, r.support[i + 1] * 4 + L])];
  return { repaired: r.job.arm !== 'uncut' && !!target && s.bond[r.edge[0]] === r.edge[1],
    firstRepair: target ? target.t : null, censored: r.job.arm !== 'uncut' && !target,
    supportRepair: support ? support.t : null, rowIntact: rowIntact(r.row), supportIntact: rowIntact(r.support),
    occupiedFaces: Array.from(s.bond).filter((b, a) => a % 4 === F && b >= 0).length,
    changedNeighborJoins: r.tape.filter(e => e.op === 'link' && [L, R].includes(e.a & 3) && [L, R].includes(e.b & 3) && !originals.some(edge => same(e, edge))).length,
    originalBondsRetained: Array.from(initial.bond).every((b, a) => b < 0 || s.bond[a] === b), births: s.birthCount - initial.birthCount };
}
function comparable(state) { const copy = structuredClone(state); delete copy.nums.pinsVersion; return copy; }
function run(job) {
  const { s, ...ids } = setup(job), initial = s.saveState(), plain = Sim.fromState(initial), o = observe(s, ids.edge);
  s.run(250); const midpoint = s.saveState(), resumed = Sim.fromState(midpoint);
  s.run(250); plain.run(500); resumed.run(250);
  const final = s.saveState();
  assert.deepEqual(comparable(final), comparable(plain.saveState()), 'Observer changed physical state/RNG');
  assert.deepEqual(comparable(final), comparable(resumed.saveState()), 'Restart changed physical state/RNG');
  for (const x of [s, plain, resumed]) { assert.deepEqual(x.check(), []); assert.deepEqual(x.type, Sim.fromState(initial).type); }
  const r = { job, ...ids, initial, midpoint, final, ...o, checks: { neutral: true, restart: true, conserved: true } };
  r.outcome = outcome(r); return r;
}
function summarize(records) {
  const rows = [];
  for (const seed of [601, 602]) for (const mode of modes) {
    const row = { seed, mode };
    for (const arm of arms) {
      const group = records.filter(r => r.job.seed === seed && r.job.mode === mode && r.job.arm === arm);
      row[arm] = { n: group.length, repaired: group.filter(r => r.outcome.repaired).length,
        retained: group.filter(r => r.outcome.originalBondsRetained).length,
        times: group.map(r => r.outcome.firstRepair), occupiedFaces: group.map(r => r.outcome.occupiedFaces) };
    }
    row.pass = arms.every(a => row[a].n === 2) && row.bridge.repaired === 2 && row.split.repaired <= 1 &&
      row.unbound.repaired <= 1 && row.noLigate.repaired === 0 && row.uncut.retained === 2;
    rows.push(row);
  }
  return { worlds: records.length, rows, lead: records.length === 60 && rows.every(r => r.pass) };
}
function main() {
  assert(process.argv[2], 'Output path required'); const file = path.resolve(process.argv[2]);
  for (const name of [file, file + '.cpu.json', file + '.validation.json']) assert(!fs.existsSync(name), 'Refusing overwrite: ' + name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const report = { kind: 'duplex-repair-preflight', baseline: 'dd38352', command: process.argv, created: new Date().toISOString(),
    sources: Object.fromEntries(sources.map(f => [f, hash(fs.readFileSync(path.join(__dirname, '..', f)))])),
    jobs: jobs(), preflight: [], records: [], complete: false };
  try {
    for (const job of report.jobs) { assert(cpu() < 80, 'CPU reserve reached'); const { s } = setup(job); s.step(); assert.deepEqual(s.check(), []); report.preflight.push(job); }
    for (const job of report.jobs) { assert(cpu() < 80, 'CPU reserve reached'); report.activeJob = job; report.records.push(run(job)); }
    report.complete = true; report.summary = summarize(report.records);
  } catch (error) { report.failure = error.stack; process.exitCode = 1; }
  report.cpuSeconds = cpu();
  fs.writeFileSync(file, JSON.stringify(report) + '\n', { flag: 'wx' });
  fs.writeFileSync(file + '.cpu.json', JSON.stringify({ command: process.argv, cpuSeconds: cpu(), scope: 'process CPU through raw write: setup, preflight, observation/plain/restart, summary' }) + '\n', { flag: 'wx' });
  console.log(JSON.stringify({ complete: report.complete, failure: report.failure, cpuSeconds: cpu(), summary: report.summary }));
}
if (require.main === module) main();
module.exports = { sources, hash, cpu, jobs, setup, geometry, outcome, summarize, comparable, same };
