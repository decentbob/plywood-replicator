#!/usr/bin/env node
const assert = require('assert');
const { Sim, NT, F, L, R, isProd } = require('../src/sim.js');
const { ProductShapeSim } = require('./product_shapes.js');
const config = { seed: 11, W: 25, H: 25, nA: 40, nB: 40, n1: 60, n2: 60, nE: 30,
  seedSeq: 'ABBAB', seedCount: 2, translate: true, transCode: 'A1,B2', catalysis: true, pUndock: 0.1 };
function test() {
  const a = new Sim(config), b = new ProductShapeSim(config);
  a.run(2500); b.run(2500);
  for (const k of ['is','bond','px','py','ox','oy']) assert.deepStrictEqual(b[k], a[k], 'neutral subclass: '+k);
  assert(b.productLateralEvents > 0 && b.productDockEvents > 0 && b.productBindEvents > 0);
  const s = new ProductShapeSim({ ...config, fold1: 15, productShape: 'lateral' });
  const u = Array.from(s.type).findIndex(isProd), t = s.type[u], o = u * 4;
  s.componentOf = s.strandOf = () => { throw new Error('nonlocal shape'); };
  assert.strictEqual(s._restSlot(u), t, 'free monomer stays flat');
  s.bond[o+L] = 0;
  assert.strictEqual(s._restSlot(u), t+NT, 'one lateral bond bends');
  s.bond[o+F] = 4;
  assert.strictEqual(s._restSlot(u), t+NT, 'face rebinding cannot flatten');
  s.p.productShape = 'lateralFree';
  assert.strictEqual(s._restSlot(u), t, 'control straightens on binding');
  s.bond[o+L] = -1; s.bond[o+R] = 0; s.bond[o+F] = -1;
  assert.strictEqual(s._restSlot(u), t+NT, 'either lateral side suffices');
  const c = new ProductShapeSim({ ...config, productShape: 'lateral', fold1: 15, fold2: 15, stiff1:0.8, stiff2:0.8 });
  c.run(2500);
  assert(c.productLateralEvents > 0, 'assembly survives the shape change');
  const d = ProductShapeSim.fromState(JSON.parse(JSON.stringify(c.saveState())));
  c.run(300); d.run(300);
  for (const k of ['is','bond','px','py','ox','oy','type']) assert.deepStrictEqual(d[k], c[k], 'resume: '+k);
  for (const k of ['productLateralEvents','productDockEvents','productBindEvents']) assert.strictEqual(d[k],c[k]);
  assert.deepStrictEqual(c.check(), []);
  assert.deepStrictEqual(Array.from(c.type), Array.from(a.type), 'types and mass unchanged');
  // A selected rest shape is not proof of a physical shape change. The rigid solver skips it.
  const curl = stiffness => {
    const q = new ProductShapeSim({ nA:0, nB:0, nE:0, n1:8, W:30, H:30,
      seedSeq:'11111111', seedCount:1, fold1:30, productShape:'lateral', stiff1:stiffness });
    const chain = q.strandOf(0);
    const span = () => Math.hypot(q._dx(q.px[chain[0]]-q.px[chain.at(-1)]), q._dy(q.py[chain[0]]-q.py[chain.at(-1)]));
    const before = span(); q.run(500);
    assert.deepStrictEqual(q.check(), []);
    return span()/before;
  };
  const rigid = curl(1), flexible = curl(0.8);
  assert(rigid > 0.95 && flexible < 0.8, `actual curling: rigid ${rigid}, flexible ${flexible}`);
}
if (require.main === module) { test(); console.log('product shape locality, assembly, neutral trajectory and resume passed'); }
module.exports = test;
