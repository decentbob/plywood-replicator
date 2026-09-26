#!/usr/bin/env node
const assert = require('assert');
const { Sim, isProd, LETTERS, T_P, T_Q, I_TPL, I_DOCK, I_FRAY, L, R } = require('../src/sim.js');
function testProductDurability() {
  const s = new Sim({ seed: 11, W: 20, H: 20, nA: 2, nB: 0, nE: 0, n1: 2, nP: 1, nQ: 1,
    seedSeq: 'AA,11,PQ', seedCount: 1, pFray: 1, productFray: 0, capFray: 0 });
  const types = Array.from(s.type);
  s.run(10);
  for (let u = 0; u < s.n; u++) {
    if (isProd(s.type[u]) || s.type[u] === T_P || s.type[u] === T_Q) {
      assert.strictEqual(s.is[u], I_TPL, 'durable product or cap retained');
      assert(s.bond[u*4+L] >= 0 || s.bond[u*4+R] >= 0);
    } else if (LETTERS.includes(s.type[u])) assert.strictEqual(s.is[u], I_DOCK, 'ordinary letters still turn over');
  }
  s.p.productFray = 1; s.run(2);
  for (let u = 0; u < s.n; u++) if (isProd(s.type[u])) assert.strictEqual(s.is[u], I_DOCK);
  assert.deepStrictEqual(Array.from(s.type), types, 'no block conversion or loss');
  assert.deepStrictEqual(s.check(), []);
  const t = new Sim({ nA: 0, nB: 0, n1: 3, nE: 0, seedSeq: '111', seedCount: 1,
    W: 20, H: 20, productFray: 0, pFray: 1, pUnzip: 1 });
  const end = Array.from({length:t.n}, (_,u)=>u).find(u=>t.bond[u*4+L]<0);
  t.is[end] = I_FRAY; t._deriveAll(); t.run(5);
  assert(t.is.every(st=>st===I_DOCK), 'durability changes fray initiation, not propagation');
}
if (require.main === module) { testProductDurability(); console.log('product durability checks passed'); }
module.exports = testProductDurability;
