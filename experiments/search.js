#!/usr/bin/env node
// Random search over worlds (RESULTS.md, section 27): throw many mechanisms together and see what sticks. Each index draws a
// world deterministically (which rules are on, how strong, energy, radiation, rays, binding and cutting, walls, mobility, two
// or four letters); seeds are a few random strands plus spontaneous origins, so no gene is put in by hand. Each world runs
// for --steps and is scored on several signs of accumulating complexity, printed as one JSON line per world.
// Usage: node experiments/search.js <from> <to> [--steps=300000] [--round=1|2] > out.jsonl   (run several ranges in parallel)
// Round 2 adds random per-letter properties (bend, stiffness, resistance, shape) to each round-1 world.
const { Sim } = require('../src/sim.js');
const arg = (k, d) => Number((process.argv.find((a) => a.startsWith('--' + k + '=')) || `--${k}=${d}`).split('=')[1]);
const from = Number(process.argv[2] || 0), to = Number(process.argv[3] || from + 1), steps = arg('steps', 300000);

function mulberry(seed) { let a = seed | 0; return () => { a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

/** The world of index i. */
function draw(i) {
  const r = mulberry(1000 + i * 7919), pick = (a) => a[Math.floor(r() * a.length)], logu = (a, b) => Math.exp(Math.log(a) + r() * (Math.log(b) - Math.log(a)));
  const four = r() < 0.5, L = four ? 'ABCD' : 'AB';
  const p = { seed: i + 1, W: 40, H: 40, snapCorners: true, maxStrain: 0.5 };
  if (four) Object.assign(p, { nA: 128, nB: 128, nC: 128, nD: 128 }); else Object.assign(p, { nA: 256, nB: 256 });
  // copying and turnover
  Object.assign(p, { pUndock: pick([0.05, 0.1, 0.15, 0.2]), pUnzip: 1, pFray: logu(1e-5, 1e-4), pSoft: logu(5e-4, 5e-3), pCapture: logu(5e-4, 5e-3), pSpont: logu(1e-4, 1e-3),
    pLigate: pick([0, 0, 0.005, 0.02]) });
  // energy
  Object.assign(p, { nE: pick([12, 20, 40, 80]), pReload: logu(2e-5, 2e-3), motif: r() < 0.4, feed: r() < 0.4, relay: r() < 0.4, mobE: pick([1, 0.2]) });
  if (four) p.shield = r() < 0.5;
  p.act = r() < 0.25;
  // radiation: a rate, rays, or neither
  const rad = pick(['none', 'rate', 'rays']);
  if (rad === 'rate') Object.assign(p, { pBreak: logu(1e-5, 1e-4) });
  if (rad === 'rays') Object.assign(p, { nX: pick([20, 40, 80]), rayHit: logu(2e-4, 2e-3), mobX: 0.08 });
  // binding and cutting
  if (r() < 0.5) { p.pHyb = pick([0.02, 0.05, 0.1]); if (r() < 0.6) Object.assign(p, { cut: true, pCut: pick([0.01, 0.05]), cutRelay: r() < 0.5, cutMotif: four ? pick(['CAC', 'DBD', 'ACA']) : pick(['BAB', 'ABA']) }); }
  // walls
  if (r() < 0.4) Object.assign(p, { nM: pick([100, 200]), make: true, tether: true, memPerm: r() < 0.7, memAngle: pick([15, 18]), memLinkTol: 0.3, stiffM: 1, pMemDecay: 0.002, resM: pick([0.5, 0.9]) });
  // mobility
  Object.assign(p, { mobS: pick([1, 0.6, 0.3]), mobM: p.nM ? pick([1, 0.5]) : 1 });
  // seeds: random strands, no designed genes
  const seqs = []; for (let k = 0; k < 4; k++) { let q = ''; const n = 4 + Math.floor(r() * 4); for (let j = 0; j < n; j++) q += L[Math.floor(r() * L.length)]; seqs.push(q); }
  p.seedSeq = seqs.join(','); p.seedCount = 1;
  p.maxBirthLog = 200000; p.maxEventLog = 0;
  return p;
}

/** Round 2: the round-1 world, plus random properties per letter drawn from a second random stream (so a round-2 world
 * differs from its round-1 namesake only in its letters): a wedge bend, stiffness, resistance to breaking, octagon shape,
 * size and mobility. */
function draw2(i) {
  const p = draw(i), r = mulberry(555 + i * 104729), pick = (a) => a[Math.floor(r() * a.length)];
  for (const L of p.nC ? 'ABCD' : 'AB') {
    p['bend' + L] = r() < 0.6 ? 0 : pick([5, 10, 15, 20, 25]);
    p['stiff' + L] = pick([0.4, 0.5, 0.7, 1]);
    p['res' + L] = pick([0, 0, 0.5, 0.9]);
    p['shape' + L] = r() < 0.1 ? 'oct' : 'square';
    p['size' + L] = pick([1, 1, 1, 0.8, 0.9, 1.1, 1.25]);
    p['mob' + L] = pick([1, 1, 0.5, 2]);
  }
  return p;
}

/** Round 3: round 2 plus folding letters (curled while their face is free), ligation more often, and cap letters (P, Q). */
function draw3(i) {
  const p = draw2(i), r = mulberry(777 + i * 15485863), pick = (a) => a[Math.floor(r() * a.length)];
  for (const L of p.nC ? 'ABCD' : 'AB') p['fold' + L] = r() < 0.5 ? 0 : pick([10, 15, 20, 30]);
  if (r() < 0.5) p.pLigate = pick([0.005, 0.02]);
  // caps: letters with one lateral side that end a strand and never (or seldom) fray
  if (r() < 0.5) Object.assign(p, { nP: pick([20, 40, 80]), nQ: 0, capFray: pick([0, 0, 0.1]) }), p.nQ = p.nP;
  return p;
}
const ROUND = Number((process.argv.find((a) => a.startsWith('--round=')) || '--round=1').split('=')[1]);
const drawRound = (i) => (ROUND === 3 ? draw3(i) : ROUND === 2 ? draw2(i) : draw(i));

/** Motifs that do something under the world's rules (a motif is a middle letter flanked by one letter on both sides). */
function functional(p) {
  const m = [];
  if (p.motif || p.feed) m.push('ABA');
  if (p.shield) m.push('CDC');
  if (p.make) m.push('BAB');
  if (p.act) m.push(p.actMotif || 'BAB');
  if (p.cut) m.push(p.cutMotif);
  return [...new Set(m)];
}

function score(s, p) {
  const b = s.births.filter((x) => x.seq.length >= 2), third = steps / 3;
  const part = (lo, hi) => b.filter((x) => x.t >= lo && x.t < hi);
  const stat = (rs) => {
    if (!rs.length) return { n: 0, len: 0, distinct: 0, motifs: 0 };
    const seqs = new Set(rs.filter((x) => x.seq.length >= 3).map((x) => { const r = [...x.seq].reverse().join(''); return x.seq < r ? x.seq : r; }));
    const fm = functional(p), carried = fm.filter((m) => rs.some((x) => x.seq.includes(m)));
    // how many functional motifs co-occur in one genome, at most
    let both = 0; for (const x of rs) both = Math.max(both, fm.filter((m) => x.seq.includes(m)).length);
    // enrichment of each functional motif against chance at the window's letter frequencies, and the share of newborns
    // carrying two different functional motifs at once
    const freq = {}; let tot = 0; for (const x of rs) for (const c of x.seq) { freq[c] = (freq[c] || 0) + 1; tot++; }
    const enrich = {};
    for (const m of fm) {
      let obs = 0, exp = 0;
      for (const x of rs) { for (let k = 0; k + 3 <= x.seq.length; k++) if (x.seq.startsWith(m, k)) obs++; exp += Math.max(0, x.seq.length - 2) * [...m].reduce((q, c) => q * (freq[c] || 0) / tot, 1); }
      enrich[m] = exp > 0 ? +(obs / exp).toFixed(2) : 0;
    }
    const multi = rs.filter((x) => fm.filter((m) => x.seq.includes(m)).length >= 2).length / rs.length;
    return { n: rs.length, len: +(rs.reduce((a, x) => a + x.seq.length, 0) / rs.length).toFixed(2), distinct: seqs.size, motifs: carried.length, maxMotifsInOne: both, enrich, multi: +multi.toFixed(3) };
  };
  const mid = stat(part(third, 2 * third)), last = stat(part(2 * third, steps + 1));
  const st = s.stats();
  return { alive: st.tpl > 0, tpl: st.tpl, births: s.birthCount, mid, last, functional: functional(p) };
}

module.exports = { draw, draw2, draw3, functional };
if (require.main !== module) return;
for (let i = from; i < to; i++) {
  const p = drawRound(i), t0 = Date.now();
  const s = new Sim(p);
  let ok = true;
  try { s.run(steps); } catch (e) { ok = false; }
  const out = { i, round: ROUND, ok, secs: Math.round((Date.now() - t0) / 1000), params: p, score: ok ? score(s, p) : null };
  console.log(JSON.stringify(out));
}
