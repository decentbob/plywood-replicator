#!/usr/bin/env node
// Invariant checks for the chemistry. Run: node test.js
const { Sim, S, T_E, T_M, I_TPL, F, L, R, NV } = require('./src/sim.js');
const assert = require('assert');
const rev = (s) => s.split('').reverse().join('');
const base = { nA: 200, nB: 200, nE: 150, W: 60, H: 60 };
let passed = 0;
function test(name, fn) { fn(); passed++; console.log('ok  ' + name); }

test('free monomers never join each other (no seed, no capture)', () => {
  const s = new Sim(Object.assign({}, base, { seed: 3, seedCount: 0 }));
  s.run(20000);
  for (let u = 0; u < s.n; u++) if (s.type[u] !== T_E) for (let i = 0; i < 4; i++) assert.strictEqual(s.bond[u * 4 + i], -1, 'monomer bonded');
  assert.strictEqual(s.stats().births, 0);
  assert.deepStrictEqual(s.check(), []);
});

test('a seeded strand is copied exactly; every child is the reverse of its parent', () => {
  const s = new Sim(Object.assign({}, base, { seed: 5, seedSeq: 'ABBABA' }));
  s.run(30000);
  const st = s.stats();
  assert.ok(st.births >= 10, 'expected at least 10 births, got ' + st.births);
  for (const b of s.births) assert.strictEqual(b.seq, rev(b.parent), 'unfaithful copy ' + JSON.stringify(b));
  for (const [len] of st.lenHist) assert.strictEqual(len, 6, 'strand of wrong length');
  assert.strictEqual(st.distinct, 1);
  assert.deepStrictEqual(s.check(), []);
});

test('energy accounting, unit mode: one E per re-armed unit', () => {
  const s = new Sim(Object.assign({}, base, { seed: 5, seedSeq: 'ABBABA' }));
  s.run(30000);
  let tpl = 0; for (let u = 0; u < s.n; u++) if (s.type[u] !== T_E && s.is[u] === I_TPL) tpl++;
  assert.strictEqual(s.energyUsed, tpl - 6, 'E spent should equal re-armed units (seed excluded)');
  assert.strictEqual(s.stats().eOn + s.stats().eOff, 150, 'energy particles conserved');
});

test('mass is conserved and bonds stay consistent under mutation and turnover', () => {
  const s = new Sim(Object.assign({}, base, { seed: 9, seedSeq: 'ABBABA', pSoft: 0.05, pCapture: 0.1, pLigate: 0.2, pFray: 0.0005 }));
  for (let k = 0; k < 20; k++) { s.run(2000); assert.deepStrictEqual(s.check(), []); }
  assert.strictEqual(s.stats().units, s.n);
  assert.ok(s.stats().frays > 0 && s.stats().captures > 0, 'turnover and capture should both have fired');
});

test('determinism: same seed, same trajectory', () => {
  const a = new Sim(Object.assign({}, base, { seed: 21, seedSeq: 'ABAB', pSoft: 0.02, pFray: 0.0002 }));
  const b = new Sim(Object.assign({}, base, { seed: 21, seedSeq: 'ABAB', pSoft: 0.02, pFray: 0.0002 }));
  a.run(8000); b.run(8000);
  assert.deepStrictEqual(a.stats(), b.stats());
  assert.deepStrictEqual(Array.from(a.px), Array.from(b.px));
});



// --- channels added in the third draft
test('seedless bath: spontaneous linking starts replication, and nothing starts without it', () => {
  const off = new Sim(Object.assign({}, base, { seed: 3, seedCount: 0, pSpont: 0, pCapture: 0.02 }));
  off.run(30000); assert.strictEqual(off.stats().births, 0);
  const on = new Sim(Object.assign({}, base, { seed: 3, seedCount: 0, pSpont: 1e-3, pCapture: 0.02 }));
  on.run(30000); const st = on.stats();
  assert.ok(st.spont > 0, 'no spontaneous links');
  assert.ok(st.births > 0, 'no births from a seedless bath');
  assert.deepStrictEqual(on.check(), []);
});

test('motif metabolism: ABA backs recharge spent energy; a seed without the motif runs out', () => {
  const withMotif = new Sim(Object.assign({}, base, { seed: 3, seedSeq: 'ABBABA', motif: true, pReload: 0 }));
  withMotif.run(30000); const a = withMotif.stats();
  assert.ok(a.energyCharged > 0 && a.eOn + a.eOff === 150, 'charging should happen and E count stay fixed');
  const without = new Sim(Object.assign({}, base, { seed: 3, seedSeq: 'AABBAA', motif: true, pReload: 0 }));
  without.run(30000); const b = without.stats();
  assert.strictEqual(b.energyCharged, 0); assert.strictEqual(b.eOn, 0, 'all energy should be spent');
});

test('radiation: resistant blocks keep their bonds, fragile ones lose them', () => {
  const frag = new Sim(Object.assign({}, base, { seed: 4, seedSeq: 'AAAAAAAA', pBreak: 0.002, resA: 0, resB: 0.95, energyGate: false }));
  const tough = new Sim(Object.assign({}, base, { seed: 4, seedSeq: 'BBBBBBBB', pBreak: 0.002, resA: 0, resB: 0.95, energyGate: false }));
  frag.run(3000); tough.run(3000);
  assert.ok(frag.stats().breaks > 5 * (tough.stats().breaks + 1), `fragile ${frag.stats().breaks} breaks vs tough ${tough.stats().breaks}`);
});


test('membrane blocks self-assemble into rings and never bond to anything else', () => {
  const s = new Sim(Object.assign({}, base, { seed: 7, nM: 120, memAngle: 45, seedSeq: 'ABBABA' }));
  s.run(30000);
  const st = s.stats();
  assert.ok(st.memRings >= 3, 'expected membrane rings, got ' + st.memRings);
  for (let u = 0; u < s.n; u++) for (let i = 0; i < 4; i++) {
    const q = s.bond[u * 4 + i]; if (q < 0) continue;
    const mu = s.type[u] === T_M, mv = s.type[q >> 2] === T_M;
    assert.strictEqual(mu, mv, 'a membrane block bonded to a non-membrane block');
  }
  assert.ok(st.births > 0, 'replicators should keep copying with membranes around');
  assert.deepStrictEqual(s.check(), []);
});

test('processive fraying: with pUnzip 1 a strand that frays unzips completely; pUnzip 0 is plain end fraying', () => {
  const mk = (pUnzip) => new Sim(Object.assign({}, base, { seed: 3, nA: 20, nB: 20, nE: 10, W: 40, H: 40, seedSeq: 'ABBABAAB', pFray: 0.01, pUnzip, energyGate: false }));
  const zip = mk(1); zip.run(200);
  assert.strictEqual(zip.frayEvents, 1, 'one fray should start it');
  assert.strictEqual(zip.unzipEvents, 7, 'the other seven units should follow');
  assert.strictEqual(zip.stats().strands + zip.stats().complexes, 0);
  const end = mk(0); end.run(200);
  assert.ok(end.frayEvents >= 1 && end.unzipEvents === 0);
  assert.deepStrictEqual(zip.check(), []); assert.deepStrictEqual(end.check(), []);
});

test('feed: an armed ABA arms its released neighbours without energy, and every arming is paid for', () => {
  const f = new Sim(Object.assign({}, base, { seed: 5, seedSeq: 'ABBABA', feed: true, nE: 20, pReload: 0.001 }));
  f.run(30000);
  let tf = 0; for (let u = 0; u < f.n; u++) if (f.type[u] !== T_E && f.is[u] === I_TPL) tf++;
  assert.ok(f.fedEvents > 0, 'the motif should feed its neighbours');
  assert.strictEqual(f.energyUsed + f.fedEvents, tf - 6, 'every arming is paid by a particle or a feed');
  for (const b of f.births) assert.strictEqual(b.seq, rev(b.parent));
});

test('polygon physics: copies are exact at stiffness 1 and 0.5, octagons mostly, bonded edges coincide, membrane wedges close rings', () => {
  for (const st of [1, 0.5]) {
    const s = new Sim(Object.assign({}, base, { seed: 5, seedSeq: 'ABBABA', stiffA: st, stiffB: st }));
    s.run(20000);
    assert.ok(s.stats().births >= 5, `stiffness ${st}: expected copying, got ${s.stats().births} births`);
    for (const b of s.births) assert.strictEqual(b.seq, rev(b.parent), `stiffness ${st}: unfaithful copy`);
    for (const [len] of s.stats().lenHist) assert.strictEqual(len, 6, `stiffness ${st}: strand of wrong length`);
    // bonded corners coincide: median gap under 3% of a side, nine in ten under 15%
    s._bondList();
    const gaps = [];
    for (let k = 0; k < s.pins.length; k += 2) {
      const a = s.pins[k], b = s.pins[k + 1];
      const ua = (a / NV) | 0, ub = (b / NV) | 0;
      gaps.push(Math.hypot(s._dx(s.px[ub] + s.ox[b] - s.px[ua] - s.ox[a]), s._dy(s.py[ub] + s.oy[b] - s.py[ua] - s.oy[a])));
    }
    gaps.sort((x, y) => x - y);
    assert.ok(gaps[gaps.length >> 1] < 0.03 && gaps[Math.floor(gaps.length * 0.9)] < 0.15, 'bonded corners apart: median ' + gaps[gaps.length >> 1]);
    assert.deepStrictEqual(s.check(), []);
  }
  // octagons copy, but leak: their rounder outline lets neighbouring templates pack close enough for copies docked on
  // two of them to link (RESULTS.md, section 15), so only most of their copies are exact
  const o = new Sim(Object.assign({}, base, { seed: 5, seedSeq: 'ABBABA', shapeA: 'oct', shapeB: 'oct', stiffA: 1, stiffB: 1 }));
  o.run(20000);
  assert.ok(o.stats().births >= 3, 'octagons should copy too, got ' + o.stats().births);
  assert.ok(o.births.filter((b) => b.seq === rev(b.parent)).length >= 0.8 * o.births.length, 'octagons: most copies exact');
  const m = new Sim(Object.assign({}, base, { seed: 7, seedCount: 0, nA: 50, nB: 50, nE: 10, W: 40, H: 40, nM: 150, memAngle: 45 }));
  m.run(20000);
  assert.ok(m.stats().memRings >= 3, 'expected membrane rings, got ' + m.stats().memRings);
});

test('binding: opposite-type template faces bind and melt, cooperatively; copies never bind their parents; copying stays exact', () => {
  // ABBABA and BABAAB face each other letter for letter as opposites, so they bind; each one's copies pair like with like
  const s = new Sim(Object.assign({}, base, { seed: 4, W: 30, H: 30, nA: 120, nB: 120, nE: 80, seedSeq: 'ABBABA,BABAAB', seedCount: 4, pHyb: 0.2 }));
  let heldRuns = 0;
  for (let k = 0; k < 8; k++) {
    s.run(2500);
    for (let u = 0; u < s.n; u++) {
      if (s.is[u] !== I_TPL || s.type[u] === T_E || s.type[u] === T_M) continue;
      const q = s.bond[u * 4 + F]; if (q < 0 || s.is[q >> 2] !== I_TPL) continue;
      assert.notStrictEqual(s.type[u], s.type[q >> 2], 'bound faces must be of opposite type');
      const bl = s.bond[u * 4 + L], br = s.bond[u * 4 + R];
      if ((bl >= 0 && s.ss[bl] === S.HYB) || (br >= 0 && s.ss[br] === S.HYB)) heldRuns++;
    }
  }
  assert.ok(s.hybEvents > 50 && s.meltEvents > 50, 'binding should form and melt');
  assert.ok(heldRuns > 0, 'matching stretches should hold as runs');
  for (const b of s.births) assert.strictEqual(b.seq, rev(b.parent));
  assert.deepStrictEqual(s.check(), []);
});

console.log(passed + ' tests passed');
