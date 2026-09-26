#!/usr/bin/env node
const assert = require('assert');
const { Sim, NT, F, L, R, I_TPL, isProd } = require('../src/sim.js');
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
  const c = new ProductShapeSim({ ...config, productShape: 'lateral', fold1: 15, fold2: 15 });
  c.run(2500);
  assert(c.productLateralEvents > 0, 'assembly survives the shape change');
  const d = ProductShapeSim.fromState(JSON.parse(JSON.stringify(c.saveState())));
  c.run(300); d.run(300);
  for (const k of ['is','bond','px','py','ox','oy','type']) assert.deepStrictEqual(d[k], c[k], 'resume: '+k);
  for (const k of ['productLateralEvents','productDockEvents','productBindEvents']) assert.strictEqual(d[k],c[k]);
  assert.deepStrictEqual(c.check(), []);
  assert.deepStrictEqual(Array.from(c.type), Array.from(a.type), 'types and mass unchanged');
}
if (require.main === module) { test(); console.log('product shape locality, assembly, neutral trajectory and resume passed'); }
module.exports = test;
