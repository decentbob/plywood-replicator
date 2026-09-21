#!/usr/bin/env node
// Invariant checks for the chemistry. Run: node test.js
const { Sim, T_E, I_TPL, F, L, R } = require('./src/sim.js');
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
  const s = new Sim(Object.assign({}, base, { seed: 5, seedSeq: 'ABBABA', energyMode: 'unit' }));
  s.run(30000);
  const st = s.stats();
  assert.ok(st.births >= 10, 'expected at least 10 births, got ' + st.births);
  for (const b of s.births) assert.strictEqual(b.seq, rev(b.parent), 'unfaithful copy ' + JSON.stringify(b));
  for (const [len] of st.lenHist) assert.strictEqual(len, 6, 'strand of wrong length');
  assert.strictEqual(st.distinct, 1);
  assert.deepStrictEqual(s.check(), []);
});

test('energy accounting, unit mode: one E per re-armed unit', () => {
  const s = new Sim(Object.assign({}, base, { seed: 5, seedSeq: 'ABBABA', energyMode: 'unit' }));
  s.run(30000);
  let tpl = 0; for (let u = 0; u < s.n; u++) if (s.type[u] !== T_E && s.is[u] === I_TPL) tpl++;
  assert.strictEqual(s.energyUsed, tpl - 6, 'E spent should equal re-armed units (seed excluded)');
  assert.strictEqual(s.stats().eOn + s.stats().eOff, 150, 'energy particles conserved');
});

test('energy accounting, strand mode: about one E per copy', () => {
  const s = new Sim(Object.assign({}, base, { seed: 5, seedSeq: 'ABBABA', energyMode: 'strand' }));
  s.run(30000);
  const st = s.stats();
  assert.ok(st.births >= 10);
  assert.ok(s.energyUsed < 2.5 * st.births, `E spent ${s.energyUsed} for ${st.births} births`);
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


test('hinges: free chains bend up to the limit, docked chains are straight, copies stay exact', () => {
  const s = new Sim(Object.assign({}, base, { seed: 2, seedSeq: 'ABBABABA', hinge: 'all', hingeMax: 90 }));
  const rel = (u, v, i, j) => { let e = s.pa[v] - s.pa[u] - ((i - j) * Math.PI / 2 + Math.PI); e = (e + Math.PI) % (2 * Math.PI); if (e < 0) e += 2 * Math.PI; e -= Math.PI; return (i === R ? 1 : -1) * e * 180 / Math.PI; };
  const hinged = [], rigid = [];
  for (let k = 0; k < 20; k++) {
    s.run(1000); s._bondList();
    for (let b = 0; b < s.bonds.length; b++) { const q = s.bonds[b], r = s.bond[q]; if (s.bondKind[b] === 2) hinged.push(rel(q >> 2, r >> 2, q & 3, r & 3)); else if (s.bondKind[b] === 1) rigid.push(Math.abs(rel(q >> 2, r >> 2, q & 3, r & 3))); }
  }
  hinged.sort((a, b) => a - b); rigid.sort((a, b) => a - b);
  assert.ok(hinged.length > 20, 'expected hinged bonds to exist');
  assert.ok(hinged[Math.floor(hinged.length / 2)] > 10, 'free chains should bend');
  assert.ok(hinged[hinged.length - 1] < 100 && hinged[0] > -10, 'hinge angle should respect its limit');
  assert.ok(rigid.length === 0 || rigid[Math.floor(rigid.length * 0.9)] < 5, 'docked chains should be straight');
  assert.ok(s.stats().births > 0, 'copying should still happen');
  for (const b of s.births) assert.strictEqual(b.seq, rev(b.parent));
  assert.deepStrictEqual(s.check(), []);
});

console.log(passed + ' tests passed');
