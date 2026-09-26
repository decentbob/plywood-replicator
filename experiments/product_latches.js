// Research-only chemistry for RESULTS 44. Latches permit escape but hurt productive occupancy;
// retain them for reproducibility, not as options in the normal simulator or viewer.
const { Sim, I_REPEL } = require('../src/sim.js');
class ProductLatchSim extends Sim {
  constructor(params = {}) {
    super({ pPReady: 1, productReset: false, ...params });
    this.productReadyEvents = 0;
    this.productResetEvents = 0;
  }
  _productReady(u) {
    const rate = this.p.pPReady;
    if (rate >= 1 || (rate > 0 && this.rng() < rate)) {
      super._productReady(u);
      if (rate < 1) { this.productReadyEvents++; this._event('productReady', u); }
    }
  }
  _productMelt(u) {
    super._productMelt(u);
    if (this.p.productReset) {
      this.is[u] = I_REPEL;
      this.productResetEvents++;
      this._event('productReset', u);
    }
  }
  stats() {
    return { ...super.stats(), productReady: this.productReadyEvents, productResets: this.productResetEvents };
  }
}
module.exports = { ProductLatchSim };
