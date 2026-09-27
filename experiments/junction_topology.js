#!/usr/bin/env node
'use strict';
// Offline graph accounting only. No simulator import, dynamics or rule discovery.
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const assert = require('assert/strict');
const sources = ['src/sim.js', 'experiments/junction_topology.js',
  'experiments/junction_topology_plan.md', 'docs/BLOCK_ARCHITECTURES.md'];
const hash = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const cpu = () => { const c = process.cpuUsage(); return (c.user + c.system) / 1e6; };
const edgeKey = ([a, b]) => a < b ? `${a}:${b}` : `${b}:${a}`;

function inspect(n, edges) {
  const adj = Array.from({ length: n }, () => []), keys = new Set();
  for (const [a, b] of edges) {
    assert(Number.isInteger(a) && a >= 0 && a < n && Number.isInteger(b) && b >= 0 && b < n);
    assert(a !== b, 'self bond'); const key = edgeKey([a, b]);
    assert(!keys.has(key), 'duplicate bond'); keys.add(key);
    adj[a].push(b); adj[b].push(a);
  }
  const seen = new Set(), components = [];
  for (let i = 0; i < n; i++) {
    if (seen.has(i)) continue;
    const stack = [i], members = []; seen.add(i);
    while (stack.length) {
      const u = stack.pop(); members.push(u);
      for (const v of adj[u]) if (!seen.has(v)) { seen.add(v); stack.push(v); }
    }
    components.push(members.sort((a, b) => a - b));
  }
  assert.equal(components.flat().length, n, 'inventory');
  return { components, degree: adj.map(x => x.length),
    allCycles: components.every(c => c.length >= 3 && c.every(u => adj[u].length === 2)) };
}

function enumerate(n) {
  const base = Array.from({ length: n }, (_, i) => [i, (i + 1) % n]);
  const anchors = { parent: [0, 3 * n / 4], daughter: [n / 4, n / 2] };
  const row = { n, anchors, cutOnlyCases: 0, cutOnlyTwoCycles: 0, disjointCutPairs: 0,
    pairings: 0, rejectedPairings: 0, twoCycles: 0, anchorCompleteTwoCycles: 0,
    originalRejoins: 0, lengthOracleTwoCycles: 0, witness: null };
  const cuts = [[], ...base.map((_, i) => [i])];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) cuts.push([i, j]);
  for (const cut of cuts) {
    const kept = base.filter((_, i) => !cut.includes(i));
    const before = inspect(n, kept); row.cutOnlyCases++;
    if (before.allCycles && before.components.length === 2) row.cutOnlyTwoCycles++;
    if (cut.length !== 2) continue;
    const [a, b, c, d] = cut.flatMap(i => base[i]);
    if (new Set([a, b, c, d]).size !== 4) continue;
    row.disjointCutPairs++;
    const length = cut[1] - cut[0];
    if (length >= 3 && n - length >= 3) row.lengthOracleTwoCycles++;
    const matchings = [[[a, b], [c, d]], [[a, c], [b, d]], [[a, d], [b, c]]];
    for (let m = 0; m < matchings.length; m++) {
      row.pairings++;
      const added = matchings[m], all = [...kept, ...added];
      if (new Set(all.map(edgeKey)).size !== all.length) { row.rejectedPairings++; continue; }
      const after = inspect(n, all);
      assert(after.degree.every(x => x === 2)); assert.equal(all.length, n);
      if (m === 0) { assert.equal(after.components.length, 1); row.originalRejoins++; }
      if (!(after.allCycles && after.components.length === 2)) continue;
      row.twoCycles++;
      const complete = Object.values(anchors).every(pair =>
        after.components.some(comp => pair.every(u => comp.includes(u)) &&
          Object.values(anchors).flat().filter(u => comp.includes(u)).length === 2));
      if (!complete) continue;
      row.anchorCompleteTwoCycles++;
      if (!row.witness) row.witness = { removed: cut.map(i => base[i]), added, components: after.components };
    }
  }
  assert.equal(row.cutOnlyTwoCycles, 0);
  assert.equal(row.twoCycles, row.lengthOracleTwoCycles, 'independent segment-length oracle');
  assert.equal(row.originalRejoins, row.disjointCutPairs);
  assert(row.anchorCompleteTwoCycles > 0);
  return row;
}

function audit() {
  const portBudgets = [
    { name: 'direct cap with fuel', roles: ['rail', 'copy', 'fuel', 'rim1', 'rim2'] },
    { name: 'direct cap without fuel', roles: ['rail', 'copy', 'rim1', 'rim2'] },
    { name: 'separate-junction cap', roles: ['rail', 'copy', 'fuel', 'anchor'] },
    { name: 'separate junction', roles: ['anchor', 'rim1', 'rim2'] }
  ].map(x => ({ ...x, required: x.roles.length, fitsFour: x.roles.length <= 4 }));
  return { scope: 'necessary topology only; no physical or autonomous-operation evidence',
    portBudgets, rows: [8, 12, 16].map(enumerate) };
}

function selfCheck() {
  assert.equal(inspect(6, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5]]).allCycles, false);
  assert.throws(() => inspect(3, [[0, 1], [1, 0]]), /duplicate/);
  assert.throws(() => inspect(3, [[0, 0]]), /self/);
  const two = inspect(6, [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]]);
  assert(two.allCycles && two.components.length === 2);
}

function validate(raw) {
  assert.equal(raw.kind, 'junction-topology'); assert.equal(raw.complete, true);
  for (const f of sources) assert.equal(raw.sources[f], hash(f), f);
  assert.deepEqual(raw.result, audit(), 'enumeration mismatch');
}

function main() {
  const validating = process.argv[2] === '--validate';
  const arg = process.argv[validating ? 3 : 2];
  assert(arg, 'Provide a unique output JSON path, or --validate an existing one');
  const file = path.resolve(arg), target = validating ? file + '.validation.json' : file;
  assert(!fs.existsSync(target), 'Refusing overwrite'); selfCheck();
  let report;
  if (validating) {
    const raw = JSON.parse(fs.readFileSync(file)); validate(raw);
    const corrupt = structuredClone(raw); corrupt.result.rows[0].twoCycles++;
    assert.throws(() => validate(corrupt), /enumeration mismatch/);
    report = { valid: true, rawHash: hash(file), recomputed: true,
      corruptionRejected: true, cpuSeconds: cpu() };
  } else {
    report = { kind: 'junction-topology', complete: true, created: new Date().toISOString(),
      command: process.argv.slice(1), sources: Object.fromEntries(sources.map(f => [f, hash(f)])),
      result: audit(), cpuSeconds: cpu() };
  }
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
  console.log(JSON.stringify(report));
}
if (require.main === module) main();
module.exports = { inspect, enumerate, audit, validate };
