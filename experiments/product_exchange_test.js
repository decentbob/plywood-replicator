#!/usr/bin/env node
const assert = require('assert');
const { isProd, I_REPEL, I_TPL, I_DOCK, F, K, R, L, S } = require('../src/sim.js');
const { ProductLatchSim: Sim } = require('./product_latches.js');
const { kind, sample } = require('./product_exchange.js');

function testProductReady() {
  const s = new Sim({ seed: 17, W: 20, H: 20, nA: 0, nB: 0, nE: 0, n1: 12,
    seedSeq: '111', seedCount: 1, catalysis: true, pPReady: 0 });
  const units = Array.from({ length: s.n }, (_, u) => u).filter(u => s.is[u] === I_TPL);
  assert.strictEqual(units.length, 3);
  for (const u of units) s.is[u] = I_REPEL;
  s._deriveAll(); s._computeOpen();
  const bonds = Array.from(s.bond);
  s.run(20);
  assert.deepStrictEqual(Array.from(s.bond), bonds, 'waiting does not destroy the linked assembly');
  for (const u of units) {
    assert.strictEqual(s.is[u], I_REPEL);
    assert.strictEqual(s.ss[u * 4 + F], S.REPEL);
    assert.strictEqual(s.open[u] & (1 << F), 0, 'waiting face cannot bind');
  }
  // This transition depends only on the block, with no component/lineage observer permitted.
  s.componentOf = s.strandOf = s.chainOf = () => { throw new Error('nonlocal dynamics'); };
  s.p.pPReady = 1;
  const rng = s.rng;
  s.rng = () => { throw new Error('default activation must not consume RNG'); };
  for (const u of units) s._transition(u);
  s.rng = rng;
  for (const u of units) assert.strictEqual(s.is[u], I_TPL);
  delete s.componentOf; delete s.strandOf; delete s.chainOf;
  // A block losing its last lateral bond recycles even if its activation is disabled.
  const u = units[0];
  for (const side of [L, R]) { const q = s.bond[u * 4 + side]; if (q >= 0) { s.bond[q] = -1; s.bond[u * 4 + side] = -1; } }
  s.is[u] = I_REPEL; s.p.pPReady = 0; s._transition(u);
  assert.strictEqual(s.is[u], I_DOCK);
  assert.strictEqual(s.n, 12);

  const a = new Sim({ seed: 11, W: 25, H: 25, nA: 40, nB: 40, n1: 60, n2: 60, nE: 30,
    seedSeq: 'ABBAB', seedCount: 2, translate: true, transCode: 'A1,B2', catalysis: true,
    pPReady: 0.001, pUndock: 0.1 });
  let waited = false;
  for (let t = 0; t < 2000; t += 20) {
    a.run(20);
    waited ||= Array.from(a.is).some((st, i) => isProd(a.type[i]) && st === I_REPEL);
  }
  assert(a.prodCount > 0, 'products still form with delayed activation');
  assert(waited, 'some product units wait after release');
  const b = Sim.fromState(JSON.parse(JSON.stringify(a.saveState())));
  a.run(200); b.run(200);
  for (const key of ['is', 'bond', 'px', 'py']) assert.deepStrictEqual(a[key], b[key], 'resume preserves ' + key);
  assert.deepStrictEqual(a.check(), []);

  assert.strictEqual(kind('PDABBABQ'), 'host');
  assert.strictEqual(kind('QBABBACP'), 'mimic');
  assert.strictEqual(kind('DABBAB'), 'other');
  // Occupancy counts finished bound products, not docked building material.
  const c = new Sim({ nA: 3, nB: 0, nD: 1, nP: 1, nQ: 1, n1: 2, nE: 0,
    W: 20, H: 20, seedSeq: 'PDAAAQ', seedCount: 1, translate: true,
    transCode: 'A1', transStart: 'D', catalysis: true, bindAny: true });
  const v = Array.from(c.type).findIndex(t => t === 0), p = Array.from(c.type).findIndex(isProd);
  c.bond[v * 4 + K] = p * 4 + F; c.bond[p * 4 + F] = v * 4 + K;
  const row = () => Object.fromEntries(['hostSites','mimicSites','otherSites','hostBound','mimicBound','otherBound',
    'matchedBound','mismatchedBound','productUnits','readyUnits','waitingUnits','sameSiteBound'].map(k => [k,0]));
  const before = row(); sample(c, before); assert.strictEqual(before.hostBound, 0);
  c.is[p] = I_TPL;
  const after = row(); sample(c, after); assert.strictEqual(after.hostBound, 1); assert.strictEqual(after.matchedBound, 1);
  // A melting latch becomes unbindable, keeps its lateral connection, and can reactivate later.
  const p2 = p + 1;
  c.bond[p * 4 + R] = p2 * 4 + L; c.bond[p2 * 4 + L] = p * 4 + R;
  c.p.productReset = true; c.p.pPReady = 0; c.p.pPMelt = 1; c.p.pPMeltRun = 1;
  c._deriveAll(); c._transition(p);
  assert.strictEqual(c.is[p], I_REPEL);
  assert.strictEqual(c.productResetEvents, 1);
  assert(c.pendingUnlink.includes(p * 4 + F));
  assert.strictEqual(c.bond[p * 4 + R], p2 * 4 + L);
  c._derive(p); assert.strictEqual(c.ss[p * 4 + F], S.REPEL);
}
if (require.main === module) { testProductReady(); console.log('product activation and exposure checks passed'); }
module.exports = testProductReady;
