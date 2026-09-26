// Research-only rest-shape selection. Every decision reads this block's type and own bonds.
// "lateral": bend while either lateral side is bonded, including while the face is bound.
// "lateralFree": the same, but straighten on face binding (isolates the free-monomer effect).
// "face": unchanged engine rule. No assembly identity, length, age, or completion test.
const { ProductLatchSim } = require('./product_latches.js');
const { isProd, LETTERS, NT, F, K, L, R, I_TPL } = require('../src/sim.js');
class ProductShapeSim extends ProductLatchSim {
  constructor(params = {}) {
    if (params.productShape && !['face', 'lateral', 'lateralFree'].includes(params.productShape)) {
      throw new Error('Unknown productShape: ' + params.productShape);
    }
    super({ productShape: 'face', ...params });
    this.productLateralEvents = 0;
    this.productDockEvents = 0;
    this.productBindEvents = 0;
  }
  _restSlot(u) {
    const t = this.type[u], mode = this.p.productShape;
    if (!isProd(t) || mode === 'face') return super._restSlot(u);
    const o = u * 4;
    const linked = this.bond[o + L] >= 0 || this.bond[o + R] >= 0;
    return this._fold[t] && linked && (mode !== 'lateralFree' || this.bond[o + F] < 0) ? t + NT : t;
  }
  // Observation only, never read by the dynamics. Count actual accepted bonds, not full-release logs.
  _formBond(u, i, v, j) {
    const accepted = super._formBond(u, i, v, j);
    if (!accepted) return false;
    if (isProd(this.type[u]) && isProd(this.type[v]) &&
        ((i === L && j === R) || (i === R && j === L))) this.productLateralEvents++;
    const p = isProd(this.type[u]) && i === F && LETTERS.includes(this.type[v]) && j === K ? u :
      isProd(this.type[v]) && j === F && LETTERS.includes(this.type[u]) && i === K ? v : -1;
    if (p >= 0) {
      if (this.is[p] === I_TPL) this.productBindEvents++;
      else this.productDockEvents++;
    }
    return true;
  }
}
module.exports = { ProductShapeSim };
