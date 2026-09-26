'use strict';
const assert = require('assert/strict');
const fs = require('fs');
const {sweep, report, strip, types, hash} = require('./resource_economy');

// Independent algebra: prepend the parity complement and rotate the extended
// odd-parity word. This also proves no transient states and no all-zero orbit.
for (let n = 1; n <= 8; ++n) {
  const successors = new Set();
  for (let s = 0; s < 2 ** (n + 1); ++s) {
    const v = Array.from({length: n + 1}, (_, i) => (s >> i) & 1);
    const parityComplement = 1 ^ v.reduce((a, b) => a ^ b, 0);
    const expected = ((s << 1) & ((1 << n) - 1)) | v[n] | (parityComplement << n);
    const actual = sweep(n, s);
    assert.equal(actual.next, expected);
    assert.equal(actual.events[1], `T${parityComplement}`);
    successors.add(actual.next);
    assert.equal(Object.values(actual.counts).reduce((a, b) => a + b), 2 * (n + 1));
  }
  assert.equal(successors.size, 2 ** (n + 1));
}

const r = report();
for (const budget of r.finiteStocks) for (const c of budget.capacities) {
  const unit = r.examples.find(e => e.n === c.n).cycle.counts;
  for (const t of types) {
    assert.ok(c.free[t] >= 0);
    assert.equal(c.used[t] + c.free[t], budget.stock[t]);
  }
  assert.ok(types.some(t => c.free[t] < unit[t]));
}
for (const w of r.widths) {
  assert.equal(w.transientStates, 0);
  assert.equal(w.cycles.reduce((a, c) => a + c.states.length, 0), w.states);
  for (const c of w.cycles) {
    assert.equal((w.n + 2) % c.states.length, 0);
    assert.ok(c.counts.T1 > 0 && c.counts.B1 > 0);
    assert.equal(c.counts.T1, c.counts.B1);
  }
}
assert.deepEqual(sweep(1, 0).events, ['B0', 'T1']);
assert.deepEqual(r.widths[0].cycles.map(c => c.states), [[0, 2, 1], [3]]);

for (const e of r.examples) {
  assert.equal(e.cycle.columns, 2 * (e.n + 2));
  assert.equal(e.cycle.counts.T1, 1);
  assert.equal(e.provisionalTwoColumn.minDegree, 1);
  assert.equal(e.threeColumn.minDegree, 2);
  // Build an independent periodic contact graph, then partition by coordinates.
  // A boundary part crossing a cut is returned; crossing survivor bonds break.
  for (const p of e.threeColumn.phases) {
    const L = p.columns, n = e.n, nodes = new Map(), edges = [];
    const group = c => Math.floor(((c - p.phase + L) % L) / 3);
    for (let c = 0; c < L; ++c) {
      for (let y = 0; y < n; ++y) {
        const id = `i${c},${y}`; nodes.set(id, {group: group(c)});
        edges.push([id, `i${(c + 1) % L},${y}`]);
        if (y) edges.push([id, `i${c},${y - 1}`]);
      }
      const id = `e${c}`, next = (c + 1) % L, y = c % 2 ? 0 : n - 1;
      nodes.set(id, {group: group(c) === group(next) ? group(c) : null,
        type: e.cycle.edgeEvents[c % e.cycle.columns]});
      edges.push([id, `i${c},${y}`], [id, `i${next},${y}`], [id, `e${(c + 2) % L}`]);
    }
    const returned = Object.fromEntries(types.map(t => [t, 0]));
    for (const node of nodes.values()) if (node.group === null) ++returned[node.type];
    assert.deepEqual(returned, p.returned);
    const degrees = new Map([...nodes].filter(([, v]) => v.group !== null).map(([k]) => [k, 0]));
    let cuts = 0, keptEdges = 0;
    for (const [a, b] of edges) {
      const ga = nodes.get(a).group, gb = nodes.get(b).group;
      if (ga === null || gb === null || ga !== gb) ++cuts;
      else { ++keptEdges; degrees.set(a, degrees.get(a) + 1); degrees.set(b, degrees.get(b) + 1); }
    }
    assert.equal(cuts, p.fragments * (n + 5));
    assert.equal(keptEdges, p.fragments * (5 * n + 1));
    assert.equal(Math.min(...degrees.values()), 2);
    assert.equal(degrees.size, p.fragments * (3 * n + 2));
    for (const t of types) assert.equal(p.gross[t], p.returned[t] + p.retained[t]);
  }
}
// Removing the overhang stabilizes two columns but removes every two-contact
// growth site. Three columns retain two such sites, one at either end.
for (let n = 1; n <= 3; ++n) {
  assert.equal(strip(n, 2).minDegree, 2);
  const full = strip(n, 9);
  for (const length of [2, 3]) {
    const members = new Set(full.nodes.filter(({id}) => {
      const c = Number(id.slice(1).split(',')[0]);
      return id[0] === 'I' ? c >= 3 && c < 3 + length : c >= 3 && c + 1 < 3 + length;
    }).map(x => x.id));
    const frontier = new Map();
    for (const [a, b] of full.edges) {
      if (members.has(a) === members.has(b)) continue;
      const outside = members.has(a) ? b : a;
      frontier.set(outside, (frontier.get(outside) || 0) + 1);
    }
    assert.equal([...frontier.values()].filter(k => k >= 2).length, length === 2 ? 0 : 2);
  }
}

if (process.argv[2]) {
  const archived = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  for (const [file, expected] of Object.entries(archived.provenance.sourceHashes)) assert.equal(hash(file), expected, file);
  const {provenance, ...data} = archived;
  assert.deepEqual(data, r);
}
console.log('PASS: independent parity map; all 1,020 states; direct contact cuts, material conservation and source validation');
