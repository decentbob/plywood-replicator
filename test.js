#!/usr/bin/env node
// Invariant checks for the chemistry. Run: node test.js
const { Sim, S, T_E, T_M, T_X, T_J, T_G, I_TPL, I_RAW, I_DOCK, I_ON, F, K, L, R, NV } = require('./src/sim.js');
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
  without.run(50000); const b = without.stats();
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

test('four letters copy exactly; shield: a D between two Cs keeps its bonds under radiation', () => {
  const s = new Sim(Object.assign({}, base, { seed: 5, nA: 100, nB: 100, nC: 100, nD: 100, seedSeq: 'ABCDCA' }));
  s.run(20000);
  assert.ok(s.births.length >= 2, 'four-letter strands should copy');
  for (const b of s.births) assert.strictEqual(b.seq, rev(b.parent));
  const mk = (shield) => new Sim(Object.assign({}, base, { seed: 4, W: 40, H: 40, nA: 3, nB: 3, nC: 3, nD: 3, nE: 10, seedSeq: 'CDCDCD', pBreak: 0.002, shield, energyGate: false }));
  const off = mk(false), on = mk(true); off.run(3000); on.run(3000);
  assert.ok(on.breakEvents < off.breakEvents, `shielded ${on.breakEvents} breaks vs ${off.breakEvents}`);
});

test('relay: one motif serves its whole strand (feed arms it, shield protects it)', () => {
  let off = 0, on = 0;
  for (const seed of [4, 5, 6]) {
    const mk = (relay) => new Sim(Object.assign({}, base, { seed, W: 40, H: 40, nA: 3, nB: 3, nC: 20, nD: 5, nE: 10, seedSeq: 'CCDCCCCC', pBreak: 0.002, shield: true, relay, energyGate: false }));
    const a = mk(false), b = mk(true); a.run(3000); b.run(3000); off += a.breakEvents; on += b.breakEvents;
  }
  assert.ok(on * 3 < off, `relayed shield ${on} breaks vs ${off} without`);
  // feed: a strand released with only its motif armed arms the rest through the relay, with no energy at all
  const s = new Sim(Object.assign({}, base, { seed: 4, W: 40, H: 40, nA: 20, nB: 20, nE: 0, seedSeq: 'AAABAAAA', feed: true, relay: true, sigma: 0, sigmaRot: 0 }));
  const units = []; for (let u = 0; u < s.n; u++) if (s.is[u] === I_TPL) units.push(u);
  for (const u of units) if (s.type[u] !== 1) s.is[u] = 1;   // REPEL, except the motif's B
  s._deriveAll(); s._computeOpen(); s.run(10);
  assert.ok(units.every((u) => s.is[u] === I_TPL), 'the whole strand should be armed through the relay');
});


test('slow polymers: bonded blocks creep, free ones do not; copies stay exact', () => {
  const mk = (mobS) => new Sim(Object.assign({}, base, { seed: 5, seedSeq: 'ABBABA', mobS }));
  const a = mk(1), b = mk(0.1);
  const disp = (s, steps) => { const u = s.seedStrand ? 0 : 0; let seedU = []; for (let v = 0; v < s.n; v++) if (s.is[v] === I_TPL) seedU.push(v);
    const x0 = seedU.map((v) => [s.px[v], s.py[v]]); s.run(steps); return seedU.reduce((m, v, k) => m + Math.hypot(s._dx(s.px[v] - x0[k][0]), s._dy(s.py[v] - x0[k][1])), 0) / seedU.length; };
  assert.ok(disp(b, 300) * 3 < disp(a, 300), 'a slow strand should move far less');
  b.run(30000);
  assert.ok(b.stats().births >= 10, 'slow strands still copy');
  for (const x of b.births) assert.strictEqual(x.seq, rev(x.parent), 'unfaithful copy ' + JSON.stringify(x));
});

test('act: units leaving a strand are inactive until a BAB back activates them; inactive monomers never dock', () => {
  const s = new Sim(Object.assign({}, base, { seed: 3, W: 40, H: 40, nA: 256, nB: 256, nE: 80, seedSeq: 'ABBABA', seedCount: 2, pUnzip: 1, pUndock: 0.1, pFray: 0.0001, act: true }));
  let sawRaw = false;
  for (let k = 0; k < 30; k++) {
    s.run(1000);
    for (let u = 0; u < s.n; u++) if (s.is[u] === I_RAW) { sawRaw = true; for (let i = 0; i < 4; i++) if (i !== K) assert.strictEqual(s.bond[u * 4 + i], -1, 'inactive monomer bonded'); }
    assert.deepStrictEqual(s.check(), []);
  }
  const st = s.stats();
  assert.ok(sawRaw && st.activations > 0 && st.births > 0, `inactive monomers ${sawRaw}, activations ${st.activations}, births ${st.births}`);
  // no BAB anywhere: once the pool is spent, copying stops
  const t = new Sim(Object.assign({}, base, { seed: 3, W: 40, H: 40, nA: 40, nB: 40, nE: 80, seedSeq: 'AABB', seedCount: 2, pUnzip: 1, pFray: 0.001, act: true }));
  t.run(40000); const b1 = t.stats().births; t.run(20000);
  assert.strictEqual(t.stats().activations, 0);
  assert.ok(t.stats().births - b1 <= 2, 'without the activating motif copying should stall');
});


test('maxStrain: a ring of its natural size keeps its bonds; an overgrown one snaps; off, it holds any shape', () => {
  const ring = (N, maxStrain) => {
    const s = new Sim({ seed: 1, W: 30, H: 30, nA: 0, nB: 0, nE: 0, nM: N, memAngle: 30, stiffM: 1, pReload: 0, maxStrain });
    const r = N / (2 * Math.PI) * 0.9;
    for (let i = 0; i < N; i++) { const th = 2 * Math.PI * i / N; s.px[i] = 15 + r * Math.cos(th); s.py[i] = 15 + r * Math.sin(th); s.pa[i] = th; s._resetShape(i); }
    for (let i = 0; i < N; i++) s._link(i, R, (i + 1) % N, L);
    s._deriveAll(); s._computeOpen(); s.run(3000); return s;
  };
  assert.strictEqual(ring(12, 0.25).strainEvents, 0, 'a natural ring should not snap');
  assert.ok(ring(20, 0.25).strainEvents > 0, 'an overgrown ring should snap');
  assert.strictEqual(ring(20, 0).strainEvents, 0);
});


test('snapCorners: bonded corners coincide after the physics of every step; with the strain limit on copies stay exact', () => {
  const s = new Sim(Object.assign({}, base, { seed: 2, W: 40, H: 40, nA: 200, nB: 200, nE: 120, seedSeq: 'ABBABA', seedCount: 2, snapCorners: true, maxStrain: 0.4 }));
  for (let k = 0; k < 30; k++) {
    s.run(999);
    // one step by hand, measured right after the physics phase (bonds formed later in the step are snapped the next one)
    s.t++; s._physics();
    const pins = s.pins; let worst = 0;
    for (let q = 0; q < pins.length; q += 2) { const u = (pins[q] / NV) | 0, v = (pins[q + 1] / NV) | 0;
      worst = Math.max(worst, Math.hypot(s._dx(s.px[v] + s.ox[pins[q + 1]] - s.px[u] - s.ox[pins[q]]), s._dy(s.py[v] + s.oy[pins[q + 1]] - s.py[u] - s.oy[pins[q]]))); }
    assert.ok(worst < 0.02, 'pinned corners apart by ' + worst);
    s._formBonds(); s._chemistry();
  }
  assert.ok(s.births.length >= 10, 'births ' + s.births.length);
  for (const x of s.births) assert.strictEqual(x.seq, rev(x.parent), 'unfaithful copy ' + JSON.stringify(x));
});


test('tether: membrane grows only from makers and stays with them; memPerm lets a free monomer through membrane', () => {
  const s = new Sim(Object.assign({}, base, { seed: 4, W: 30, H: 30, nA: 40, nB: 40, nE: 30, nM: 250, memAngle: 12, make: true, tether: true, pMemDecay: 0.002,
    seedSeq: 'ABBABA', seedCount: 1, energyGate: false, snapCorners: true, stiffM: 0.7, maxStrain: 0.5 }));
  s.run(30000);
  let active = 0, withMaker = 0;
  for (let u = 0; u < s.n; u++) {
    if (s.type[u] !== T_M || s.is[u] !== I_ON) continue; active++;
    if (s.componentOf(u).some((x) => s.type[x] !== T_M && s.type[x] !== T_E)) withMaker++;
  }
  assert.ok(active >= 20, 'membrane should grow on the makers, active ' + active);
  assert.ok(withMaker >= 0.9 * active, `active membrane should be attached to strands: ${withMaker} of ${active}`);
  // permeability: a free monomer placed on a membrane block is not pushed off it; a bonded one would be
  const t = new Sim({ seed: 1, W: 20, H: 20, nA: 1, nB: 0, nE: 0, nM: 1, memPerm: true, sigma: 0, sigmaRot: 0, pReload: 0 });
  t.px[0] = 10; t.py[0] = 10; t.px[1] = 10.3; t.py[1] = 10; t._resetShape(0); t._resetShape(1); t.run(5);
  assert.ok(Math.hypot(t.px[1] - t.px[0], t.py[1] - t.py[0]) < 0.4, 'a free monomer should pass through membrane');
  const c = new Sim({ seed: 1, W: 20, H: 20, nA: 1, nB: 0, nE: 0, nM: 1, memPerm: false, sigma: 0, sigmaRot: 0, pReload: 0 });
  c.px[0] = 10; c.py[0] = 10; c.px[1] = 10.3; c.py[1] = 10; c._resetShape(0); c._resetShape(1); c.run(5);
  assert.ok(Math.hypot(c.px[1] - c.px[0], c.py[1] - c.py[0]) > 0.6, 'without memPerm they collide');
});


test('rays: they break the bonds of an exposed strand and never reach one inside a closed ring', () => {
  const N = 24, r = N / (2 * Math.PI);
  const s = new Sim({ seed: 1, W: 30, H: 30, nA: 12, nB: 0, nE: 0, nM: N, nX: 60, memAngle: 15, stiffM: 1, snapCorners: true, pReload: 0, rayHit: 0.05, resM: 1, mobS: 0.6, mobM: 0.5, mobX: 0.08 });
  const mem = []; for (let u = 0; u < s.n; u++) if (s.type[u] === T_M) mem.push(u);
  mem.forEach((u, i) => { const th = 2 * Math.PI * i / N; s.px[u] = 10 + r * Math.cos(th); s.py[u] = 15 + r * Math.sin(th); s.pa[u] = th; s._resetShape(u); });
  mem.forEach((u, i) => s._link(u, R, mem[(i + 1) % N], L));
  const inside = s.seedStrand(10, 15, 0, 4, 'AAAA'), outside = s.seedStrand(23, 15, 0, 4, 'AAAA');
  for (let u = 0; u < s.n; u++) if (s.type[u] === T_X && Math.hypot(s._dx(s.px[u] - 10), s._dy(s.py[u] - 15)) < r + 1.5) s.px[u] = s._wx(s.px[u] + 12);
  s._deriveAll(); s._computeOpen();
  const intact = (units) => units.every((u, i) => i + 1 === units.length || s.bond[u * 4 + R] >= 0);
  s.run(15000);
  assert.ok(intact(inside), 'the strand inside the ring should be untouched');
  assert.ok(!intact(outside) && s.rayHits > 0, 'the strand outside should have been hit');
  assert.deepStrictEqual(s.check(), []);
});


test('cut: a bound cutter (BAB) cuts its partner; without the rule or without binding nothing is cut', () => {
  const mk = (o) => new Sim(Object.assign({}, base, { seed: 3, W: 30, H: 30, nA: 120, nB: 120, nE: 60, seedSeq: 'BABBAB,ABAABA', seedCount: 3, pHyb: 0.2 }, o));
  const on = mk({ cut: true, pCut: 0.2 }); on.run(20000);
  assert.ok(on.cutEvents > 0, 'cuts should happen between a cutter and its complement');
  assert.deepStrictEqual(on.check(), []);
  const off = mk({ cut: false }); off.run(20000); assert.strictEqual(off.cutEvents, 0);
  const nob = mk({ cut: true, pCut: 0.2, pHyb: 0 }); nob.run(20000); assert.strictEqual(nob.cutEvents, 0, 'no binding, no cutting');
});


test('fold: a free strand of folding letters curls; the part being copied straightens and copies stay exact', () => {
  const s = new Sim(Object.assign({}, base, { seed: 1, W: 30, H: 30, nA: 8, nB: 0, nE: 0, seedSeq: 'AAAAAAAA', foldA: 30, snapCorners: true, pReload: 0 }));
  const units = []; for (let u = 0; u < s.n; u++) if (s.is[u] === I_TPL) units.push(u);
  const span = () => Math.hypot(s._dx(s.px[units[0]] - s.px[units[units.length - 1]]), s._dy(s.py[units[0]] - s.py[units[units.length - 1]]));
  const before = span(); s.run(3000);
  assert.ok(span() < 0.7 * before, `the strand should curl: end to end ${before.toFixed(2)} -> ${span().toFixed(2)}`);
  const t = new Sim(Object.assign({}, base, { seed: 2, W: 40, H: 40, nA: 200, nB: 200, nE: 120, seedSeq: 'ABBABA', seedCount: 2, foldA: 20, foldB: 20, snapCorners: true, maxStrain: 0.5 }));
  t.run(30000);
  assert.ok(t.births.length >= 10, 'births ' + t.births.length);
  for (const x of t.births) assert.strictEqual(x.seq, rev(x.parent), 'unfaithful copy ' + JSON.stringify(x));
});


test('caps: a strand capped P...Q copies into capped strands, and caps never fray', () => {
  const swap = (q) => [...q].reverse().map((c) => (c === 'P' ? 'Q' : c === 'Q' ? 'P' : c)).join('');
  const s = new Sim(Object.assign({}, base, { seed: 2, W: 40, H: 40, nA: 150, nB: 150, nP: 30, nQ: 30, nE: 120, seedSeq: 'PABBAQ', seedCount: 2, pFray: 0.0003, pUnzip: 1 }));
  s.run(30000);
  assert.ok(s.births.length >= 5, 'births ' + s.births.length);
  assert.ok(s.births.every((b) => b.seq[0] === 'P' && b.seq[b.seq.length - 1] === 'Q'), 'every copy should be capped');
  assert.ok(s.births.some((b) => b.seq === swap(b.parent)), 'faithful copies exist');
  assert.strictEqual(s.frayEvents, 0, 'a strand capped at both ends never frays');
  assert.deepStrictEqual(s.check(), []);
});


test('endLoss: a copy lacks its template\'s open ends; a strand capped at both ends is copied whole', () => {
  const s = new Sim(Object.assign({}, base, { seed: 2, W: 40, H: 40, nA: 150, nB: 150, nP: 30, nQ: 30, nE: 120, seedSeq: 'PABBAQ,ABBABA,PABBAB', endLoss: true }));
  s.run(30000);
  const swap = (q) => [...q].reverse().map((c) => (c === 'P' ? 'Q' : c === 'Q' ? 'P' : c)).join('');
  const openEnds = (q) => (q[0] === 'P' ? 0 : 1) + (q[q.length - 1] === 'Q' ? 0 : 1);
  assert.ok(s.births.length >= 5, 'births ' + s.births.length);
  assert.ok(s.births.some((b) => b.parent === 'PABBAQ' && b.seq === 'PABBAQ'), 'a capped strand copies whole');
  for (const b of s.births) {
    if (!b.parent || b.seq.length === b.parent.length - openEnds(b.parent)) continue;
    assert.fail('a copy of ' + b.parent + ' is ' + b.seq + ': it should be ' + openEnds(b.parent) + ' shorter');
  }
  assert.ok(s.births.some((b) => b.parent === 'ABBABA' && b.seq === 'BABB'), 'an open strand loses both ends');
  assert.ok(s.births.every((b) => b.parent !== 'PABBAB' || b.seq === swap('PABBA')), 'a strand open at one end loses that end');
  assert.deepStrictEqual(s.check(), []);
});

test('bareCaps: a cap takes no energy, so only a capped strand carrying the feed motif re-arms', () => {
  const s = new Sim(Object.assign({}, base, { seed: 3, W: 40, H: 40, nA: 150, nB: 150, nP: 40, nQ: 40, nE: 120, seedSeq: 'PQ,PABAQ', seedCount: 2, endLoss: true, bareCaps: true, feed: true, relay: true }));
  s.run(25000);
  assert.ok(s.births.filter((b) => b.seq === 'PABAQ').length >= 5, 'PABAQ copies ' + s.births.filter((b) => b.seq === 'PABAQ').length);
  assert.strictEqual(s.energyUsed > 0, true);
  // every armed strand that is not one of the four seeds carries the motif; no PQ copy is ever armed
  let armedPQ = 0;
  for (let u = 0; u < s.n; u++) {
    if (s.type[u] < 7 || s.type[u] > 8 || s.is[u] !== I_TPL) continue;
    const seq = s.sequenceOf(s.componentOf(u));
    if (seq === 'PQ' && s.gen[u] > 0) armedPQ++;
  }
  assert.strictEqual(armedPQ, 0, 'an armed PQ copy');
  assert.deepStrictEqual(s.check(), []);
});

test('translate: the backs of an armed strand template product chains by the code, parallel to it; catalysis makes copying need them', () => {
  const code = { A: '1', B: '2', C: '3', D: '4' }, tr = (q) => [...q].map((c) => code[c]).join('');
  const s = new Sim(Object.assign({}, base, { seed: 1, W: 40, H: 40, nA: 150, nB: 150, nC: 150, nD: 150, n1: 100, n2: 100, n3: 100, n4: 100, nE: 100, seedSeq: 'ABACDCAB', seedCount: 3, translate: true }));
  s.run(20000);
  const pr = s.births.filter((b) => b.prod);
  assert.ok(pr.length >= 5, 'products ' + pr.length);
  assert.ok(pr.every((b) => b.seq === tr(b.parent)), 'a product is its template read through the code: ' + pr.map((b) => b.parent + '>' + b.seq).join(' '));
  assert.ok(s.births.some((b) => !b.prod), 'copying goes on beside translation');
  assert.deepStrictEqual(s.check(), []);
  // catalysis: with bare linking off, nothing is copied without products, and copying runs once products are made
  const w = { seed: 1, W: 40, H: 40, nA: 200, nB: 200, n1: 200, n2: 200, nE: 100, seedSeq: 'ABBABA', seedCount: 3, catalysis: true, pLinkBare: 0 };
  const a = new Sim(Object.assign({}, base, w)); a.run(40000);
  assert.strictEqual(a.births.length, 0, 'copies without a catalyst');
  const c = new Sim(Object.assign({}, base, w, { translate: true })); c.run(40000);
  assert.ok(c.births.filter((b) => !b.prod).length >= 3, 'copies with catalysis ' + c.births.filter((b) => !b.prod).length);
  assert.deepStrictEqual(c.check(), []);
});

test('bindAny: a shared catalyst copies strands that make no product far more often than a private one does', () => {
  const w = { seed: 1, W: 40, H: 40, nA: 150, nB: 150, nC: 150, nD: 150, n1: 200, n2: 200, nE: 100, seedSeq: 'ABBABA,CDDCDC', seedCount: 3, pUndock: 0.1, pFray: 0.00003, pUnzip: 1, translate: true, transCode: 'A1,B2', catalysis: true, pLinkBare: 0.01 };
  const parasites = (sim) => sim.births.filter((b) => !b.prod && !/[AB]/.test(b.seq)).length;
  const kin = new Sim(Object.assign({}, base, w)); kin.run(60000);
  const shared = new Sim(Object.assign({}, base, w, { bindAny: true })); shared.run(60000);
  assert.ok(parasites(shared) >= 3 * Math.max(1, parasites(kin)), 'parasite births, shared ' + parasites(shared) + ' against private ' + parasites(kin));
  assert.deepStrictEqual(shared.check(), []);
});

test('compCopy: copies are reversed complements; hubs hold strand ends and never enter a sequence', () => {
  const rc = (q) => [...q].reverse().map((c) => ({ A: 'B', B: 'A', C: 'D', D: 'C' })[c]).join('');
  const s = new Sim(Object.assign({}, base, { seed: 1, W: 40, H: 40, nA: 200, nB: 200, nE: 120, seedSeq: 'AAABAB', seedCount: 2, compCopy: true }));
  s.run(30000);
  assert.ok(s.births.length >= 10, 'births ' + s.births.length);
  for (const x of s.births) assert.strictEqual(x.seq, rc(x.parent), 'not the reversed complement ' + JSON.stringify(x));
  assert.ok(s.births.some((x) => x.seq === 'ABABBB') && s.births.some((x) => x.seq === 'AAABAB'), 'both forms should appear');
  const h = new Sim(Object.assign({}, base, { seed: 1, W: 40, H: 40, nA: 200, nB: 200, nE: 120, nJ: 20, pHub: 0.1, seedSeq: 'ABBABA', seedCount: 3, pFray: 0.00003, pUnzip: 1, pUndock: 0.1 }));
  h.run(30000);
  let held = 0; for (let u = 0; u < h.n; u++) if (h.type[u] === T_J) for (let i = 0; i < 4; i++) if (h.bond[u * 4 + i] >= 0) held++;
  assert.ok(held > 0, 'hubs should hold strand ends');
  assert.ok(!h.births.some((x) => x.seq.includes('J')), 'a hub is never part of a sequence');
  assert.deepStrictEqual(h.check(), []);
});

test('chiral: each hand copies into its own hand; lowercase seeds are mirror strands; a mirror monomer never docks without pMisDock', () => {
  const s = new Sim(Object.assign({}, base, { seed: 1, W: 40, H: 40, nA: 200, nB: 200, nE: 120, seedSeq: 'ABBABA,abbaba', seedCount: 2, chiral: 0.5, pMixLink: 0, pFray: 0.00003, pUnzip: 1, pUndock: 0.1 }));
  s.run(30000);
  const up = s.births.filter((x) => x.seq === x.seq.toUpperCase()).length, lo = s.births.filter((x) => x.seq === x.seq.toLowerCase()).length;
  assert.ok(up > 0 && lo > 0, `both hands copy: ${up} ${lo}`);
  assert.strictEqual(up + lo, s.births.length, 'no mixed births without pMixLink');
  for (let u = 0; u < s.n; u++) { const v = s.bond[u * 4] >> 2; if (v >= 0 && s.type[v] !== T_E && s.type[u] !== T_E) assert.strictEqual(s.hand[u], s.hand[v], 'docking across hands'); }
  assert.deepStrictEqual(s.check(), []);
});

test('droplets: G blocks attract each other into droplets and never bond; without stickiness they stay dispersed', () => {
  const largest = (g) => {
    const s = new Sim(Object.assign({}, base, { seed: 1, W: 30, H: 30, nA: 20, nB: 20, nE: 0, nG: 250, gStick: g, gRange: 2.2, seedCount: 0 }));
    s.run(4000);
    for (let u = 0; u < s.n; u++) if (s.type[u] === T_G) for (let i = 0; i < 4; i++) assert.strictEqual(s.bond[u * 4 + i], -1, 'G bonded');
    const G = []; for (let u = 0; u < s.n; u++) if (s.type[u] === T_G) G.push(u);
    const par = new Map(G.map((u) => [u, u])), f = (x) => { while (par.get(x) !== x) x = par.get(x); return x; };
    for (let a = 0; a < G.length; a++) for (let b = a + 1; b < G.length; b++) { const dx = s._dx(s.px[G[b]] - s.px[G[a]]), dy = s._dy(s.py[G[b]] - s.py[G[a]]); if (dx * dx + dy * dy < 1.69) par.set(f(G[a]), f(G[b])); }
    const sz = {}; for (const u of G) sz[f(u)] = (sz[f(u)] || 0) + 1;
    return Math.max(...Object.values(sz));
  };
  const on = largest(1), off = largest(0);
  assert.ok(on >= 55 && off <= 35, `largest droplet ${on} with stickiness, ${off} without`);
});

test('heat: no binding in the hot part of a cycle, and bound pairs melt there', () => {
  const s = new Sim(Object.assign({}, base, { seed: 1, W: 40, H: 40, nA: 200, nB: 200, nE: 120, seedSeq: 'AAABAB,ABBABA', seedCount: 2, compCopy: true, pHyb: 0.2, heatPeriod: 4000, heatFrac: 0.5, heatMelt: 0.05 }));
  let hotBinds = 0, coolBinds = 0, boundAtHotEnd = -1;
  const bound = () => { let b = 0; for (let u = 0; u < s.n; u++) { const q = s.bond[u * 4]; if (q >= 0 && (q & 3) === 0 && s.is[u] === I_TPL && s.is[q >> 2] === I_TPL) b++; } return b; };
  for (let t = 0; t < 24000; t++) {
    const h0 = s.hybEvents; s.step();
    if (s._hot) hotBinds += s.hybEvents - h0; else coolBinds += s.hybEvents - h0;
    if (s.t === 22000 - 1) boundAtHotEnd = bound();   // the last step of a hot phase (hot while t mod 4000 < 2000)
  }
  assert.strictEqual(hotBinds, 0, 'binding while hot');
  assert.ok(coolBinds > 0, 'no binding while cool');
  assert.strictEqual(boundAtHotEnd, 0, 'bound pairs left at the end of a hot phase: ' + boundAtHotEnd);
  assert.deepStrictEqual(s.check(), []);
});

test('proof: a strand carrying BDB (relayed) is copied with fewer substitutions; with the rule off, no fewer; flags need a source', () => {
  const run = (proof) => {
    let tot = 0, sub = 0, pe = 0;
    for (const seed of [1, 2]) {
      const s = new Sim(Object.assign({}, base, { seed, W: 30, H: 30, nA: 150, nB: 150, nC: 150, nD: 150, nE: 80, seedCount: 3, seedSeq: 'CABDBAC', pSoft: 0.05, proof, pProof: 0.9, relay: true, pUndock: 0.05 }));
      s.run(15000);
      // only copies of strands that carry the motif (a strand that has lost it is not proofread)
      for (const b of s.births) { if (!b.parent || !b.parent.includes('BDB')) continue; tot++; if (b.seq !== rev(b.parent) && b.seq.length === b.parent.length) sub++; }
      pe += s.proofEvents;
      assert.deepStrictEqual(s.check(), []);
    }
    return { tot, sub, pe };
  };
  const on = run(true), off = run(false);
  assert.ok(on.tot >= 30 && off.tot >= 30, `births ${on.tot} ${off.tot}`);
  assert.ok(on.pe > 0 && off.pe === 0, 'proof events ' + on.pe + ' ' + off.pe);
  assert.ok(on.sub / on.tot < 0.5 * off.sub / off.tot, `substitutions ${on.sub}/${on.tot} with proofreading, ${off.sub}/${off.tot} without`);
  // no motif, no flag: a strand without BDB never proofreads
  const s = new Sim(Object.assign({}, base, { seed: 3, W: 30, H: 30, nA: 150, nB: 150, nC: 150, nD: 150, nE: 80, seedCount: 3, seedSeq: 'CABCBAC', proof: true, relay: true }));
  s.run(3000);
  assert.ok(s.births.length > 0 && s.prf.every((x) => x === 0), 'a flag without a BDB source');
});

test('grip and pocket: folded backs hold small fuel two at a time; fuel held in a pocket arms a letter and is spent, once', () => {
  // grip: seeded product chains, straight or folded 45 degrees, and small fuel particles: only the folded ones make pockets
  const held = (fold) => { let h = 0; for (const seed of [1, 2]) { const s = new Sim({ seed, W: 30, H: 30, nA: 0, nB: 0, nE: 0, n1: 120, nU: 60, sizeU: 0.5, fold1: fold, grip: true, seedSeq: '111111', seedCount: 15 }); s.run(4000); h += s.stats().held2; assert.deepStrictEqual(s.check(), []); } return h; };
  const hf = held(45), hs = held(0);
  assert.ok(hf >= 10 && hf > 4 * hs, `fuel held in pockets: folded ${hf}, straight ${hs}`);
  // pocket: fuel is the only energy; every fuel spent arms exactly one letter, and a folded genome gets more of it than a straight one
  const run = (fold) => {
    const s = new Sim({ seed: 1, W: 30, H: 30, nA: 200, nB: 0, nE: 0, nU: 80, sizeU: 0.5, foldA: fold, pocket: true, pReloadU: 0.01, seedSeq: 'AAAAAA', seedCount: 3, pUndock: 0.1 });
    let rearms = 0; const orig = s._transition.bind(s);
    s._transition = function (u) { const was = this.is[u]; orig(u); if (was === 1 && this.is[u] === 2 && this.type[u] === 0) rearms++; };
    s.run(12000);
    assert.strictEqual(rearms, s.fuelUsed, 'each spent fuel arms one letter');
    let nU = 0; for (let u = 0; u < s.n; u++) if (s.type[u] === 15) nU++; assert.strictEqual(nU, 80);
    assert.deepStrictEqual(s.check(), []);
    return s.fuelUsed;
  };
  const ff = run(45), fs = run(0);
  assert.ok(ff > 2 * fs, `fuel used: folded ${ff}, straight ${fs}`);
});

test('backCopy and stack: a copy made on a back lies parallel (same sequence); stacked rows are exact, held, paid for, and melt off', () => {
  // backCopy alone: back copies are released like face copies, parallel to the template; face copies stay reversed
  const s1 = new Sim({ seed: 1, W: 30, H: 30, nA: 150, nB: 150, nE: 80, seedSeq: 'ABBABAAB', seedCount: 3, pUndock: 0.05, backCopy: true });
  s1.run(8000);
  let same = 0, revd = 0, other = 0;
  for (const b of s1.births) { if (b.seq === b.parent && b.seq !== rev(b.parent)) same++; else if (b.seq === rev(b.parent)) revd++; else other++; }
  assert.ok(same >= 5 && revd >= 5 && other === 0, `back copies ${same}, face copies ${revd}, wrong ${other}`);
  assert.deepStrictEqual(s1.check(), []);
  // stack: finished back copies hold (logged as rows), wait for energy, and pile up; melting releases them
  const s = new Sim({ seed: 2, W: 30, H: 30, nA: 150, nB: 150, nE: 80, seedSeq: 'ABBABAAB', seedCount: 3, pUndock: 0.05, backCopy: true, stack: true });
  let rearms = 0; const orig = s._transition.bind(s);
  s._transition = function (u) { const was = this.is[u], o = u * 4, q = this.bond[o + K]; const byE = q >= 0 && this.type[q >> 2] === T_E; orig(u); if ((was === 1 || was === 5) && this.is[u] === I_TPL && byE) rearms++; };
  let maxStack = 0;
  for (let k = 0; k < 6; k++) { s.run(2000); maxStack = Math.max(maxStack, s.stats().maxStack); }
  const rows = s.births.filter((b) => b.stk), face = s.births.filter((b) => !b.stk);
  assert.ok(rows.length >= 10 && rows.every((b) => b.seq === b.parent), `rows ${rows.length}, all copies of the row below`);
  assert.ok(face.every((b) => b.seq === rev(b.parent) || b.seq === b.parent), 'released copies exact');
  assert.ok(maxStack >= 3 && s.stackMelts > 0, `tallest stack ${maxStack} rows, melts ${s.stackMelts}`);
  assert.strictEqual(rearms, s.energyUsed, 'every arming (of a released or a held unit) is paid by one energy particle');
  let nA = 0; for (let u = 0; u < s.n; u++) if (s.type[u] === 0) nA++; assert.strictEqual(nA, 150);
  assert.deepStrictEqual(s.check(), []);
  // stacked units do not fray: a strand whose every unit is held keeps its units under fraying that would take a free strand apart
  const f = new Sim({ seed: 3, W: 20, H: 20, nA: 60, nB: 60, nE: 60, seedSeq: 'AABBA', seedCount: 1, backCopy: true, stack: true, stackHold: true, pSMelt: 0, pSMeltEnd: 0, pSMeltRun: 0 });
  f.run(3000);
  const held = []; for (let u = 0; u < f.n; u++) if (f.bond[u * 4] >= 0 && (f.bond[u * 4] & 3) === K && f.is[u] !== I_DOCK) held.push(u);
  assert.ok(held.length >= 5, 'a stacked row formed: ' + held.length);
  f.p.pFray = 0.05; f.run(500);
  assert.strictEqual(held.filter((u) => f.bond[u * 4] >= 0 && f.is[u] !== I_DOCK).length, held.length, 'stacked units kept their places under fraying');
  // a slippery letter's stacked rows melt off: with smeltA high, rows of A stay far shorter lived than rows of B
  const standing = (sm) => { const m = new Sim({ seed: 4, W: 24, H: 24, nA: 120, nB: 0, nE: 60, seedSeq: 'AAAAA', seedCount: 2, pUndock: 0.05, backCopy: true, stack: true, pSNuc: 0, pSBind: 0.1, smeltA: sm }); let h = 0; for (let k = 0; k < 20; k++) { m.run(200); h += m.stats().stacked; } return h; };
  const hs = standing(50), ho = standing(1);
  assert.ok(ho > 3 * hs, `units standing in stacks: slippery ${hs}, ordinary ${ho}`);
});

console.log(passed + ' tests passed');
