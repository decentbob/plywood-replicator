// Shared helpers for screen-tier assays (AGENTS "QA tiers"): observation, sampled neutrality/restart,
// overwrite-safe (optionally gzipped) output and CPU accounting. Observation only; nothing here enters reactions.
const fs = require('fs'), path = require('path'), zlib = require('zlib'), crypto = require('crypto'), assert = require('assert/strict');
const { Sim } = require('../src/sim.js');

const hash = x => crypto.createHash('sha256').update(x).digest('hex');
const cpu = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; };
// Full saved state minus the nonphysical pin-cache revision, for state/RNG equality checks.
const comparable = st => { const c = JSON.parse(JSON.stringify(st)); delete c.nums.pinsVersion; return c; };
// Hash of a source file with line endings normalized (archives mix Windows CRLF and LF checkouts).
const sourceHash = f => hash(fs.readFileSync(f).toString('utf8').replace(/\r\n/g, '\n'));

/** Record every bond change of s as {t, op, a, b} (side indices u*4+i) without changing its outcome. */
function tape(s) {
  const out = [], link = s._link, unlink = s._unlink;
  s._link = function(u, i, v, j) { out.push({ t: this.t, op: 'link', a: u * 4 + i, b: v * 4 + j }); return link.call(this, u, i, v, j); };
  s._unlink = function(u, i) { const a = u * 4 + i, b = this.bond[a]; if (b >= 0) out.push({ t: this.t, op: 'unlink', a, b }); return unlink.call(this, u, i); };
  return out;
}

/** Run `steps` from `initial` with an observer `watch(s)` called after every step; returns {final, midpoint, tape}.
 *  With check=true (screen tier: a sample of worlds, e.g. the first seed of each cell) also verifies that a plain run and a
 *  midpoint restart reproduce the final state and RNG. `Cls` is the Sim subclass that must be used for restarts. */
function run(initial, steps, watch, { check = false, Cls = Sim } = {}) {
  const s = Cls.fromState(initial), events = tape(s), mid = Math.floor(steps / 2);
  let midpoint = null;
  for (let i = 1; i <= steps; i++) { s.step(); if (watch) watch(s); if (i === mid) midpoint = s.saveState(); }
  const final = s.saveState();
  if (check) {
    const plain = Cls.fromState(initial); plain.run(steps);
    assert.deepEqual(comparable(plain.saveState()), comparable(final), 'observer changed state/RNG');
    const resumed = Cls.fromState(midpoint); resumed.run(steps - mid);
    assert.deepEqual(comparable(resumed.saveState()), comparable(final), 'restart changed state/RNG');
    assert.deepEqual(s.check(), []);
  }
  return { final, midpoint, tape: events, checked: check };
}

/** Write JSON (gzipped if the name ends in .gz), refusing to overwrite. */
function write(file, obj) {
  file = path.resolve(file); assert(!fs.existsSync(file), 'Refusing overwrite: ' + file);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const text = JSON.stringify(obj) + '\n';
  fs.writeFileSync(file, file.endsWith('.gz') ? zlib.gzipSync(text, { level: 9 }) : text, { flag: 'wx' });
  return file;
}
function read(file) { const b = fs.readFileSync(file); return JSON.parse(file.endsWith('.gz') ? zlib.gunzipSync(b) : b); }

/** One-sided Fisher exact P(X >= a) for a of n versus b of n successes. */
function fisherGreater(a, b, n) {
  const c = (m, k) => { let x = 1; for (let i = 0; i < k; i++) x = x * (m - i) / (i + 1); return x; };
  const K = a + b; let p = 0;
  for (let x = a; x <= Math.min(n, K); x++) p += c(n, x) * c(n, K - x) / c(2 * n, K);
  return p;
}

module.exports = { hash, cpu, comparable, sourceHash, tape, run, write, read, fisherGreater };
