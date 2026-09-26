'use strict';
// Offline finite-state and material accounting. Never imported by the simulator.
const fs = require('fs');
const crypto = require('crypto');
const ID = 670873;
const bits = ID.toString(2).padStart(20, '0').split('').map(Number);
const tables = [bits.slice(0, 4), bits.slice(4, 8), bits.slice(8, 12),
  bits.slice(12, 16), bits.slice(16, 18), bits.slice(18, 20)];
const types = ['D00', 'D01', 'D10', 'D11', 'U00', 'U01', 'U10', 'U11', 'B0', 'B1', 'T0', 'T1'];
const empty = () => Object.fromEntries(types.map(t => [t, 0]));
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

function sweep(n, state) {
  const cells = Array.from({length: n}, (_, i) => (state >> i) & 1);
  let carry = (state >> n) & 1;
  const counts = empty(), events = [];
  for (let i = 0; i < n; ++i) {
    const x = cells[i], y = carry, input = 2 * x + y;
    ++counts[`D${x}${y}`];
    cells[i] = tables[0][input]; carry = tables[1][input];
  }
  ++counts[`B${carry}`]; events.push(`B${carry}`); carry = tables[4][carry];
  for (let i = n - 1; i >= 0; --i) {
    const x = cells[i], y = carry, input = 2 * x + y;
    ++counts[`U${x}${y}`];
    cells[i] = tables[2][input]; carry = tables[3][input];
  }
  ++counts[`T${carry}`]; events.push(`T${carry}`); carry = tables[5][carry];
  return {next: cells.reduce((s, x, i) => s | (x << i), carry << n), counts, events};
}

function enumerate(n) {
  const size = 2 ** (n + 1), transitions = Array.from({length: size}, (_, s) => sweep(n, s));
  const seen = new Set(), cycles = [];
  let transientStates = 0;
  for (let start = 0; start < size; ++start) {
    if (seen.has(start)) continue;
    const path = [], positions = new Map();
    let s = start;
    while (!seen.has(s) && !positions.has(s)) {
      positions.set(s, path.length); path.push(s); s = transitions[s].next;
    }
    const first = positions.get(s);
    if (first === undefined) transientStates += path.length;
    else {
      transientStates += first;
      const states = path.slice(first), counts = empty(), edgeEvents = [];
      for (const state of states) {
        const t = transitions[state];
        for (const key of types) counts[key] += t.counts[key];
        edgeEvents.push(...t.events);
      }
      cycles.push({states, columns: 2 * states.length, counts, edgeEvents});
    }
    path.forEach(x => seen.add(x));
  }
  return {n, width: n + 2, states: size, transientStates, cycles};
}

// A rectangular edge part spans columns c,c+1. Sweep events alternate bottom,
// top. A cut between c and c+1 returns that spanning part; it cannot cut a part.
// All returned parts are credited only after every incident bond is broken.
function fragments(cycle, length, phase) {
  const gcd = (a, b) => b ? gcd(b, a % b) : a;
  const columns = cycle.columns * length / gcd(cycle.columns, length);
  const gross = empty(), returned = empty();
  const repeats = columns / cycle.columns;
  for (const key of types) gross[key] = cycle.counts[key] * repeats;
  for (let c = 0; c < columns; ++c) {
    if ((c + 1 - phase + columns) % length === 0)
      ++returned[cycle.edgeEvents[c % cycle.columns]];
  }
  const retained = Object.fromEntries(types.map(k => [k, gross[k] - returned[k]]));
  return {length, phase, columns, fragments: columns / length, gross, returned, retained};
}

// Undirected contact graph for a finite strip. This is a geometry sketch for
// counting contacts, not a lattice dynamics model or executable reaction rule.
function strip(n, length, keepCrossingRight = false) {
  const nodes = [], edges = [], add = (id, kind) => nodes.push({id, kind});
  for (let c = 0; c < length; ++c) {
    for (let r = 0; r < n; ++r) {
      add(`I${c},${r}`, 'interior');
      if (r) edges.push([`I${c},${r - 1}`, `I${c},${r}`]);
      if (c) edges.push([`I${c - 1},${r}`, `I${c},${r}`]);
    }
  }
  for (let c = 0; c < length - (keepCrossingRight ? 0 : 1); ++c) {
    const side = c % 2 === 0 ? 'B' : 'T', id = `${side}${c}`;
    add(id, 'edge');
    const r = side === 'B' ? n - 1 : 0;
    edges.push([id, `I${c},${r}`]);
    if (c + 1 < length) edges.push([id, `I${c + 1},${r}`]);
    if (c >= 2) edges.push([`${side}${c - 2}`, id]);
  }
  const degree = Object.fromEntries(nodes.map(x => [x.id, 0]));
  for (const [a, b] of edges) { ++degree[a]; ++degree[b]; }
  return {nodes, edges, degree, minDegree: Math.min(...Object.values(degree))};
}

function report() {
  const widths = Array.from({length: 8}, (_, i) => enumerate(i + 1));
  const examples = widths.slice(0, 3).map(w => {
    // Fixed scarce type T1: choose minimum use per column, then smallest state.
    const cycle = [...w.cycles].sort((a, b) => a.counts.T1 / a.columns - b.counts.T1 / b.columns || a.states[0] - b.states[0])[0];
    const two = strip(w.n, 2, true), three = strip(w.n, 3);
    return {n: w.n, width: w.width, cycle,
      provisionalTwoColumn: {parts: two.nodes.length, minDegree: two.minDegree, rarePerUnit: 2 * cycle.counts.T1 / cycle.columns},
      threeColumn: {parts: three.nodes.length, contacts: three.edges.length, minDegree: three.minDegree,
        cutBonds: w.n + 5, growthParts: 3 * (w.n + 1), formationContacts: 6 * (w.n + 1),
        phases: [0, 1, 2].map(p => fragments(cycle, 3, p))}};
  });
  const summary = widths.map(w => ({n: w.n, states: w.states, cycles: w.cycles.length,
    transientStates: w.transientStates, maxColumns: Math.max(...w.cycles.map(c => c.columns)),
    zeroRareCycles: Object.fromEntries(['B0', 'B1', 'T0', 'T1'].map(k => [k, w.cycles.filter(c => c.counts[k] === 0).length])),
    minRareT1PerColumn: Math.min(...w.cycles.map(c => c.counts.T1 / c.columns))}));
  const finiteStocks = [12, 48].map(common => {
    const stock = Object.fromEntries(types.map(t => [t, t === 'T1' ? 4 : common]));
    const capacities = examples.map(e => {
      const repeats = Math.min(...types.filter(t => e.cycle.counts[t]).map(t => Math.floor(stock[t] / e.cycle.counts[t])));
      const used = Object.fromEntries(types.map(t => [t, repeats * e.cycle.counts[t]]));
      return {n: e.n, repeats, columns: repeats * e.cycle.columns, used,
        free: Object.fromEntries(types.map(t => [t, stock[t] - used[t]]))};
    });
    return {stock, capacities};
  });
  return {schema: 1, tableId: ID, tables, types, assumptions: {
    inventory: 'Exact monomer counts; rectangles count as one block, twice the square area.',
    cycles: 'All boundary bit states n=1..8; no rotated, off-register or malformed assemblies.',
    fragments: 'Graph bookkeeping for ideal three-column strips; no physical birth or probability claim.',
    renewal: 'Full return of bridging parts is a conditional credit, not demonstrated recycling.'
  }, summary, examples, finiteStocks, widths};
}

function format(r) {
  const lines = ['Table 670873: offline material accounting', 'n states cycles maxColumns zeros[B0,B1,T0,T1] minT1/column'];
  for (const w of r.summary) lines.push(`${w.n} ${w.states} ${w.cycles} ${w.maxColumns} ${Object.values(w.zeroRareCycles).join(',')} ${w.minRareT1PerColumn}`);
  for (const e of r.examples) {
    lines.push(`n=${e.n} repeat=${e.cycle.columns} counts=${JSON.stringify(e.cycle.counts)}`);
    lines.push(`  2-column parts=${e.provisionalTwoColumn.parts} minDegree=${e.provisionalTwoColumn.minDegree}`);
    lines.push(`  3-column parts=${e.threeColumn.parts} contacts=${e.threeColumn.contacts} minDegree=${e.threeColumn.minDegree} cutBonds=${e.threeColumn.cutBonds}`);
    for (const p of e.threeColumn.phases) lines.push(`  phase=${p.phase} fragments=${p.fragments} rare gross/returned/retained=${p.gross.T1}/${p.returned.T1}/${p.retained.T1}`);
  }
  return lines.join('\n') + '\n';
}

if (require.main === module) {
  const start = process.cpuUsage(), result = report(), out = process.argv[2];
  if (!out) throw new Error('Usage: node experiments/resource_economy.js UNIQUE_OUTPUT_STEM');
  const sources = ['experiments/resource_economy_plan.md', 'experiments/resource_economy.js', 'experiments/resource_economy_test.js'];
  result.provenance = {baseline: '19cd4e6', created: new Date().toISOString(), command: process.argv.join(' '),
    sourceUrl: 'https://www.dna.caltech.edu/Papers/simple-ca-evolution2011-LNCS.pdf',
    sourceHashes: Object.fromEntries(sources.map(p => [p, hash(p)])), input: {tableId: ID, n: [1, 8], scarce: 'T1'},
    cpuSeconds: Object.values(process.cpuUsage(start)).reduce((a, b) => a + b) / 1e6};
  // Fail before writing either output if the stem already exists.
  for (const ext of ['json', 'txt']) if (fs.existsSync(`${out}.${ext}`)) throw new Error(`Output exists: ${out}.${ext}`);
  fs.writeFileSync(`${out}.json`, JSON.stringify(result, null, 2) + '\n', {flag: 'wx'});
  fs.writeFileSync(`${out}.txt`, format(result), {flag: 'wx'});
  process.stdout.write(format(result));
}
module.exports = {ID, tables, types, sweep, enumerate, fragments, strip, report, format, hash};
