/*
 * Polygon Chemistry — simulation core.
 *
 * A 2D world of squares governed by one universal rule table. A square can read
 * only its own state, its own bonds, and the state of the side it is bonded to
 * on each partner. Replication is a pathway that falls out of the rules, not a
 * primitive.
 *
 * There is no object in this code larger than one square. A bond is a constraint
 * between two squares (their bonded sides must lie flush); the physics enforces
 * every bond constraint by iteratively nudging the two squares it joins. Chains,
 * strands and copies exist only in the eye of the observer; the functions that
 * look at connected components (`componentOf`, `stats`, birth logging) are
 * observation and never feed back into the dynamics.
 *
 * No dependencies. Works in the browser (global `PolyChem`) and in Node
 * (`module.exports`).
 *
 * Sides of a square, counter-clockwise from the face:
 *   F (0) face   — docks on a template / is docked on
 *   R (1) right  — lateral, bonds only to a neighbour's L
 *   K (2) back   — regulatory, energy docks here
 *   L (3) left   — lateral, bonds only to a neighbour's R
 *
 * Every unit carries ONE internal state:
 *   monomer types A, B:  DOCK | REPEL | TPL
 *   energy type E:       OFF  | ON
 * Everything a neighbour can read (the "side states" of the design doc) is
 * derived each step from that internal state plus which sides are bonded.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PolyChem = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';

const F = 0, R = 1, K = 2, L = 3;
const SIDE_NAME = ['F', 'R', 'K', 'L'];
const T_A = 0, T_B = 1, T_E = 2;
const TNAME = ['A', 'B', 'E'];

// internal states
const I_DOCK = 0, I_REPEL = 1, I_TPL = 2;   // A / B
const I_OFF = 0, I_ON = 1;                  // E

// derived side states (the interface a bonded partner can read)
const S = {
  DOCK: 0, TPL_MM: 1, TPL_LF: 2, TPL_RF: 3, REPEL: 4,   // F
  INERT: 5, STICKY: 6, BONDED: 7, END: 8,               // L, R
  IDLE: 9, WANT: 10,                                    // K
  ON: 11, OFF: 12,                                      // E (all four sides)
  ARMED: 13,                                            // L, R: bonded, and this unit is a template (TPL)
  STACKED: 14,                                          // K: bonded back to back with another template unit
};
const SNAME = Object.keys(S);
// A bond breaks the moment either of its sides derives to one of these.
const NONHOLD = new Uint8Array(16);
NONHOLD[S.REPEL] = NONHOLD[S.INERT] = NONHOLD[S.IDLE] = NONHOLD[S.OFF] = 1;

const DEFAULTS = {
  seed: 1,
  W: 48, H: 48,                 // torus
  nA: 160, nB: 160, nE: 120,    // fixed populations (mass and energy are conserved)
  seedCount: 1, seedLen: 6, seedSeq: '',   // seedSeq: 'ABBABA' or a comma-separated list 'AB,ABBABA'
  // chemistry knobs
  pSoft: 0,        // wrong-type docking (A on a B template): substitution
  pCapture: 0,     // a free monomer sticks to an open strand end instead of a template: insertion / substitution
  pLigate: 0,      // two strand ends join end to end: fusion (a runaway with rigid strands; keep 0)
  pFray: 0,        // an end unit of an undocked strand falls off, per step: turnover / deletion
  pUndock: 0,      // a docked monomer with no lateral bonds falls off its template, per step: cooperativity
  pStack: 0,       // back sides of two template units bond (K to K): strands pair back to back, 2D forms become possible
  energyGate: true,// REPEL -> TPL needs an ON energy particle on K
  energyMode: 'unit', // 'unit': every unit needs its own E. 'strand': a re-armed unit re-arms its lateral neighbours.
  pReload: 0.002,  // OFF -> ON per step when the sun is off
  sun: false, sunR: 10,   // if on, OFF -> ON only inside a disc at the world centre
  // physics knobs (these should not need tuning for the chemistry to work)
  sigma: 0.3, sigmaRot: 0.45,    // Brownian step (translation, rotation) per unit per step
  repMargin: 1.0,                // contact radius of a square as a fraction of half its side; unbonded squares never overlap more than this allows
  iters: 24,                     // constraint iterations per step (bonds and contacts together)
  tolDeg: 30, tolRotDeg: 40, distTol: 0.35,   // geometric tolerance for docking (F to F, E to K)
  linkTolDeg: 10, linkDistTol: 0.15,          // tighter tolerance for side-to-side links (L to R, K to K): flush means flush
  sizeE: 0.5,
  logBirths: true, maxBirthLog: 5000, maxEventLog: 300,
};

function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function gauss(rng) {
  let u = 0, v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}
const TAU = Math.PI * 2;
function wrapAngle(a) { a %= TAU; if (a < 0) a += TAU; return a; }
function angDiff(a) { a = (a + Math.PI) % TAU; if (a < 0) a += TAU; return a - Math.PI; }  // into (-pi, pi]

class Sim {
  constructor(params) {
    this.p = Object.assign({}, DEFAULTS, params || {});
    this.rng = mulberry32(this.p.seed);
    this.t = 0;
    this._init();
  }

  // ---------------------------------------------------------------- setup
  _init() {
    const p = this.p;
    const n = this.n = p.nA + p.nB + p.nE;
    this.type = new Uint8Array(n);
    this.is = new Uint8Array(n);          // internal state
    this.size = new Float64Array(n);
    this.rad = new Float64Array(n);       // repulsion radius
    this.w = new Float64Array(n);         // inverse mass
    this.px = new Float64Array(n); this.py = new Float64Array(n); this.pa = new Float64Array(n);
    this.bond = new Int32Array(n * 4).fill(-1);   // partner = unit*4+side
    this.ss = new Uint8Array(n * 4);              // derived side states
    this.open = new Uint8Array(n);                // bitmask of bondable sides
    this.fresh = new Uint8Array(n);               // released from a template since last birth (observation)
    this.parentOf = new Int32Array(n).fill(-1);   // the template unit this unit was copied on (observation)
    this.gen = new Uint16Array(n);                // (observation)
    this.pendingUnlink = [];                      // bonds a transition asked to break, applied after all transitions
    this.kicked = [];                             // units that undocked this step and get pushed off the face
    this.brokeF = [];                             // units whose face bond broke this step (observation)
    this.bonds = [];                              // list of bonds as u*4+i (the lower end), rebuilt when bonds change
    this.bondsDirty = true;
    this.contacts = [];                           // candidate unbonded pairs close enough to touch this step
    this.births = []; this.birthCount = 0; this.maxGen = 0;
    this.events = [];
    this.energyUsed = 0; this.dockEvents = 0; this.captureEvents = 0; this.ligateEvents = 0; this.frayEvents = 0; this.softDockEvents = 0; this.undockEvents = 0;
    this._seen = new Uint8Array(n);

    // types
    let u = 0;
    for (let i = 0; i < p.nA; i++) this.type[u++] = T_A;
    for (let i = 0; i < p.nB; i++) this.type[u++] = T_B;
    for (let i = 0; i < p.nE; i++) this.type[u++] = T_E;
    for (u = 0; u < n; u++) {
      this.size[u] = this.type[u] === T_E ? p.sizeE : 1;
      this.rad[u] = 0.5 * this.size[u] * p.repMargin;
      this.w[u] = 1 / (this.size[u] * this.size[u]);
      this.is[u] = this.type[u] === T_E ? I_ON : I_DOCK;
    }
    // jittered grid placement
    const cols = Math.ceil(Math.sqrt(n * p.W / p.H)), rows = Math.ceil(n / cols);
    const dx = p.W / cols, dy = p.H / rows;
    const order = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) { const j = Math.floor(this.rng() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
    for (let k = 0; k < n; k++) {
      const uu = order[k];
      this.px[uu] = ((k % cols) + 0.5 + (this.rng() - 0.5) * 0.6) * dx;
      this.py[uu] = (Math.floor(k / cols) + 0.5 + (this.rng() - 0.5) * 0.6) * dy;
      this.pa[uu] = this.rng() * TAU;
    }
    // spatial hash
    this.cell = 1.5;
    this.gw = Math.max(3, Math.ceil(p.W / this.cell)); this.gh = Math.max(3, Math.ceil(p.H / this.cell));
    this.head = new Int32Array(this.gw * this.gh);
    this.next = new Int32Array(n);
    this.cosTol = Math.cos(p.tolDeg * Math.PI / 180);
    this.cosTolRot = Math.cos(p.tolRotDeg * Math.PI / 180);
    this.cosLinkTol = Math.cos(p.linkTolDeg * Math.PI / 180);

    // seed strands: seedSeq may list several sequences separated by commas; seedCount repeats the list
    const seqs = p.seedSeq ? String(p.seedSeq).split(',').map((q) => q.trim()).filter(Boolean) : [''];
    for (let s = 0; s < p.seedCount; s++) {
      for (let q = 0; q < seqs.length; q++) {
        const first = s === 0 && q === 0;
        const len = seqs[q] ? seqs[q].length : p.seedLen;
        const cx = p.W * (0.5 + (first ? 0 : (this.rng() - 0.5) * 0.8));
        const cy = p.H * (0.5 + (first ? 0 : (this.rng() - 0.5) * 0.8));
        this.seedStrand(cx, cy, this.rng() * TAU, len, seqs[q]);
      }
    }
    this._deriveAll();
    this._computeOpen();
  }

  /** Place a template strand of `len` units (or the given A/B sequence): a row of squares, each bonded to the next. */
  seedStrand(cx, cy, ang, len, seq) {
    const units = [];
    for (let i = 0; i < len; i++) {
      const want = seq ? (seq[i] === 'B' ? T_B : T_A) : (this.rng() < 0.5 ? T_A : T_B);
      let found = -1;
      for (let u = 0; u < this.n; u++) {
        if (this.type[u] === want && this.is[u] === I_DOCK && this.bond[u * 4] < 0 && this.bond[u * 4 + 1] < 0
            && this.bond[u * 4 + 2] < 0 && this.bond[u * 4 + 3] < 0 && !units.includes(u)) { found = u; break; }
      }
      if (found < 0) return false;
      units.push(found);
    }
    const c = Math.cos(ang), s = Math.sin(ang);
    for (let i = 0; i < len; i++) {
      const u = units[i], ox = i - (len - 1) / 2;
      this.px[u] = this._wx(cx + ox * c); this.py[u] = this._wy(cy + ox * s); this.pa[u] = ang - Math.PI / 2;
      this.is[u] = I_TPL;
    }
    for (let i = 0; i + 1 < len; i++) this._link(units[i], R, units[i + 1], L);
    this._deriveAll();
    this._computeOpen();
    return true;
  }

  // ------------------------------------------------------------- geometry helpers
  _wx(x) { const W = this.p.W; x %= W; return x < 0 ? x + W : x; }
  _wy(y) { const H = this.p.H; y %= H; return y < 0 ? y + H : y; }
  _dx(a) { const W = this.p.W; return a - W * Math.round(a / W); }
  _dy(a) { const H = this.p.H; return a - H * Math.round(a / H); }

  // ------------------------------------------------------------- spatial hash
  _buildHash() {
    this.head.fill(-1);
    for (let u = 0; u < this.n; u++) {
      const cx = Math.min(this.gw - 1, (this.px[u] / this.cell) | 0), cy = Math.min(this.gh - 1, (this.py[u] / this.cell) | 0);
      const c = cy * this.gw + cx;
      this.next[u] = this.head[c]; this.head[c] = u;
    }
  }
  /** Call fn(v) for every unit v in the 3x3 cells around (x, y). */
  _forNear(x, y, fn) {
    const cx = Math.min(this.gw - 1, (this._wx(x) / this.cell) | 0), cy = Math.min(this.gh - 1, (this._wy(y) / this.cell) | 0);
    for (let dy = -1; dy <= 1; dy++) {
      const yy = (cy + dy + this.gh) % this.gh;
      for (let dx = -1; dx <= 1; dx++) {
        const xx = (cx + dx + this.gw) % this.gw;
        for (let v = this.head[yy * this.gw + xx]; v >= 0; v = this.next[v]) fn(v);
      }
    }
  }

  // ------------------------------------------------------------- bonds
  _link(u, i, v, j) { this.bond[u * 4 + i] = v * 4 + j; this.bond[v * 4 + j] = u * 4 + i; this.bondsDirty = true; }
  _unlink(u, i) {
    const q = this.bond[u * 4 + i]; if (q < 0) return;
    this.bond[q] = -1; this.bond[u * 4 + i] = -1; this.bondsDirty = true;
    if (i === F && this.type[u] !== T_E) { this.brokeF.push(u); if (this.type[q >> 2] !== T_E) this.brokeF.push(q >> 2); }
  }
  _bonded(u, v) { for (let i = 0; i < 4; i++) if (this.bond[u * 4 + i] >= 0 && (this.bond[u * 4 + i] >> 2) === v) return true; return false; }
  _bondList() {
    if (!this.bondsDirty) return this.bonds;
    const out = [];
    for (let q = 0; q < this.n * 4; q++) { const r = this.bond[q]; if (r > q) out.push(q); }
    this.bonds = out; this.bondsDirty = false; return out;
  }

  /** True if unit m could sit at (tx,ty) without overlapping another unit (space exclusion). */
  _slotFree(m, tx, ty) {
    let free = true;
    this._forNear(tx, ty, (v) => {
      if (!free || v === m) return;
      const ex = this._dx(this.px[v] - tx), ey = this._dy(this.py[v] - ty);
      const lim = 0.75 * (this.size[v] + this.size[m]) / 2;
      if (ex * ex + ey * ey < lim * lim) free = false;
    });
    return free;
  }

  /** Form a bond between side i of u and side j of v, snapping the less-connected unit flush. Returns false if the spot is taken. */
  _formBond(u, i, v, j) {
    const nb = (x) => (this.bond[x * 4] >= 0) + (this.bond[x * 4 + 1] >= 0) + (this.bond[x * 4 + 2] >= 0) + (this.bond[x * 4 + 3] >= 0);
    let a = u, ia = i, m = v, im = j;
    if (nb(u) < nb(v)) { a = v; ia = j; m = u; im = i; }
    const phi = this.pa[a] + ia * Math.PI / 2;
    const d = (this.size[a] + this.size[m]) / 2;
    const tx = this._wx(this.px[a] + d * Math.cos(phi)), ty = this._wy(this.py[a] + d * Math.sin(phi));
    if (!this._slotFree(m, tx, ty)) return false;
    this.px[m] = tx; this.py[m] = ty; this.pa[m] = wrapAngle(phi + Math.PI - im * Math.PI / 2);
    // the hash is left as it was: the snap moves m by less than a cell, so it is still found from its old cell
    this._link(u, i, v, j);
    return true;
  }

  _geomOK(u, i, v, j, dx, dy, dist) {
    const phu = this.pa[u] + i * Math.PI / 2, phv = this.pa[v] + j * Math.PI / 2;
    const nux = Math.cos(phu), nuy = Math.sin(phu), nvx = Math.cos(phv), nvy = Math.sin(phv);
    const ux = dx / dist, uy = dy / dist;
    const lateral = i !== F && j !== F && this.type[u] !== T_E && this.type[v] !== T_E;
    const cT = lateral ? this.cosLinkTol : this.cosTol, cR = lateral ? this.cosLinkTol : this.cosTolRot;
    if (lateral) {
      const d0 = (this.size[u] + this.size[v]) / 2;
      if (dist > d0 * (1 + this.p.linkDistTol) || dist < d0 * (1 - this.p.linkDistTol)) return false;
    }
    if (nux * ux + nuy * uy < cT) return false;       // v lies in front of u's side i
    if (-(nvx * ux + nvy * uy) < cT) return false;    // u lies in front of v's side j
    if (nux * nvx + nuy * nvy > -cR) return false;    // sides are (nearly) antiparallel
    return true;
  }

  /** Probability that side i of u and side j of v bond when they meet. This is the compatibility table. */
  compat(u, i, v, j) {
    const p = this.p, tu = this.type[u], tv = this.type[v];
    const su = this.ss[u * 4 + i], sv = this.ss[v * 4 + j];
    if (tu === T_E || tv === T_E) {
      if (tu === T_E && tv !== T_E) return (su === S.ON && j === K && sv === S.WANT) ? 1 : 0;
      if (tv === T_E && tu !== T_E) return (sv === S.ON && i === K && su === S.WANT) ? 1 : 0;
      return 0;
    }
    if (i === K && j === K) return (su === S.IDLE && sv === S.IDLE && this.is[u] === I_TPL && this.is[v] === I_TPL) ? p.pStack : 0;
    if (i === F && j === F) {
      const isTpl = (x) => x === S.TPL_MM || x === S.TPL_LF || x === S.TPL_RF;
      if (!((su === S.DOCK && isTpl(sv)) || (sv === S.DOCK && isTpl(su)))) return 0;
      return tu === tv ? 1 : p.pSoft;
    }
    if ((i === L && j === R) || (i === R && j === L)) {
      const openish = (x) => x === S.STICKY || x === S.END;
      if (su === S.STICKY && sv === S.STICKY) return 1;
      if (openish(su) && openish(sv)) return p.pLigate;
      if ((su === S.INERT && openish(sv)) || (sv === S.INERT && openish(su))) return p.pCapture;
      return 0;
    }
    return 0;
  }

  _computeOpen() {
    const p = this.p;
    for (let u = 0; u < this.n; u++) {
      let m = 0;
      for (let i = 0; i < 4; i++) {
        if (this.bond[u * 4 + i] >= 0) continue;
        const s = this.ss[u * 4 + i];
        let ok = false;
        if (this.type[u] === T_E) ok = s === S.ON;
        else if (i === F) ok = s === S.DOCK || s === S.TPL_MM || s === S.TPL_LF || s === S.TPL_RF;
        else if (i === K) ok = s === S.WANT || (s === S.IDLE && p.pStack > 0 && this.is[u] === I_TPL);
        else ok = s === S.STICKY || s === S.END || (s === S.INERT && p.pCapture > 0);
        if (ok) m |= 1 << i;
      }
      this.open[u] = m;
    }
  }

  // ------------------------------------------------------------- derived side states
  _derive(u) {
    const b = this.bond, o = u * 4;
    if (this.type[u] === T_E) {
      const s = this.is[u] === I_ON ? S.ON : S.OFF;
      this.ss[o] = this.ss[o + 1] = this.ss[o + 2] = this.ss[o + 3] = s;
      return;
    }
    const bF = b[o + F] >= 0, bL = b[o + L] >= 0, bR = b[o + R] >= 0, nl = (bL ? 1 : 0) + (bR ? 1 : 0);
    const st = this.is[u];
    // F
    if (st === I_DOCK) this.ss[o + F] = S.DOCK;
    else if (st === I_REPEL) this.ss[o + F] = S.REPEL;
    else this.ss[o + F] = (bL && bR) ? S.TPL_MM : bL ? S.TPL_RF : S.TPL_LF;
    // L, R. A docked unit's free lateral is sticky only where its template partner's face says the
    // template continues (TPL_MM, or TPL_LF for my L / TPL_RF for my R); at the template's end it is an open end.
    const pf = bF ? this.ss[b[o + F]] : -1;
    const lat = (bonded, contin) => bonded ? (st === I_TPL ? S.ARMED : S.BONDED)
      : (st === I_DOCK ? (bF ? (contin ? S.STICKY : S.END) : (nl > 0 ? S.STICKY : S.INERT)) : S.END);
    this.ss[o + L] = lat(bL, pf === S.TPL_MM || pf === S.TPL_LF);
    this.ss[o + R] = lat(bR, pf === S.TPL_MM || pf === S.TPL_RF);
    // K
    const bK = b[o + K] >= 0;
    this.ss[o + K] = st === I_REPEL ? S.WANT : (bK && st === I_TPL && this.type[b[o + K] >> 2] !== T_E) ? S.STACKED : S.IDLE;
  }
  _deriveAll() { for (let u = 0; u < this.n; u++) this._derive(u); }

  // ------------------------------------------------------------- the rule table
  /**
   * Transitions of the internal state. Every rule reads only this unit's state,
   * which of its sides are bonded, and the derived state of a bonded partner side.
   */
  _transition(u) {
    const p = this.p, b = this.bond, o = u * 4;
    if (this.type[u] === T_E) {
      // E: docking spends it.
      if (b[o] >= 0 || b[o + 1] >= 0 || b[o + 2] >= 0 || b[o + 3] >= 0) {
        if (this.is[u] === I_ON) { this.energyUsed++; this._event('energy', u); }
        this.is[u] = I_OFF;
      }
      return;
    }
    const bF = b[o + F] >= 0, bL = b[o + L] >= 0, bR = b[o + R] >= 0, bK = b[o + K] >= 0;
    const nl = (bL ? 1 : 0) + (bR ? 1 : 0);
    const st = this.is[u];
    if (st === I_DOCK) {
      if (bF) {
        // R6 undocking: a lone docked monomer is not stable; a laterally linked run is
        if (nl === 0 && p.pUndock > 0 && this.rng() < p.pUndock) { this.pendingUnlink.push(o + F); this.kicked.push(u); this.undockEvents++; this._event('undock', u); return; }
        // R1 release: docked, and every lateral bond the template partner says I need is in place
        const pf = this.ss[b[o + F]];
        const needL = pf === S.TPL_MM || pf === S.TPL_LF;
        const needR = pf === S.TPL_MM || pf === S.TPL_RF;
        if ((!needL || bL) && (!needR || bR)) { this.is[u] = I_REPEL; this.fresh[u] = 1; this.parentOf[u] = b[o + F] >> 2; this._event('release', u); }
      } else if (nl > 0) {
        // R2 captured laterally without a template: also a new strand unit
        this.is[u] = I_REPEL; this.fresh[u] = 1; this.parentOf[u] = -1; this.captureEvents++; this._event('capture', u);
      }
    } else if (st === I_REPEL) {
      if (nl === 0) this.is[u] = I_DOCK;                                   // R3 lost its strand: back to the pool
      else if (!p.energyGate || (bK && this.ss[b[o + K]] === S.ON)) { this.is[u] = I_TPL; this._event('rearm', u); }  // R4 re-arm (energy)
      else if (p.energyMode === 'strand' && ((bL && this.ss[b[o + L]] === S.ARMED) || (bR && this.ss[b[o + R]] === S.ARMED))) this.is[u] = I_TPL; // R4b re-arm spreads along the strand
    } else { // I_TPL
      if (nl === 0) this.is[u] = I_DOCK;                                   // R3
    }
    // R5 fraying: an end unit of an undocked strand falls off
    if (this.is[u] !== I_DOCK && !bF && nl === 1 && p.pFray > 0 && this.rng() < p.pFray) {
      this.is[u] = I_DOCK; this.fresh[u] = 0;
      this.pendingUnlink.push(o + L, o + R); this.frayEvents++; this._event('fray', u);
    }
  }

  _event(kind, u, v) {
    if (this.p.maxEventLog <= 0) return;
    this.events.push({ t: this.t, kind, u, v: v === undefined ? -1 : v });
    if (this.events.length > this.p.maxEventLog) this.events.splice(0, this.events.length - this.p.maxEventLog);
  }

  // ------------------------------------------------------------- observation: components, chains, births
  /** Units reachable from u through bonds (observation only). */
  componentOf(u) {
    const comp = [u]; const seen = this._seen; seen[u] = 1;
    for (let k = 0; k < comp.length; k++) {
      const x = comp[k];
      for (let i = 0; i < 4; i++) {
        const q = this.bond[x * 4 + i]; if (q < 0) continue;
        const v = q >> 2; if (!seen[v]) { seen[v] = 1; comp.push(v); }
      }
    }
    for (const x of comp) seen[x] = 0;
    return comp;
  }
  /** The longest L->R chain of A/B units in a unit list, as an array of unit indices. */
  chainOf(units) {
    let best = [];
    for (const start of units) {
      if (this.type[start] === T_E || this.bond[start * 4 + L] >= 0) continue;
      const c = []; let u = start;
      while (u >= 0 && c.length < 100000) { c.push(u); const q = this.bond[u * 4 + R]; u = q < 0 ? -1 : q >> 2; }
      if (c.length > best.length) best = c;
    }
    return best;
  }
  /** Read a strand's sequence L->R from a unit list (E units ignored). */
  sequenceOf(units) { return this.chainOf(units).map((u) => TNAME[this.type[u]]).join(''); }

  /** After face bonds broke: log a birth for every chain that just came free of its template. */
  _logBirths() {
    if (this.brokeF.length === 0) return;
    const done = new Set();
    for (const u0 of this.brokeF) {
      if (done.has(u0)) continue;
      const comp = this.componentOf(u0);
      for (const x of comp) done.add(x);
      const chain = this.chainOf(comp);
      if (chain.length < 2) continue;
      let nFresh = 0, pu = -1, attached = false;
      for (const u of chain) {
        if (this.fresh[u]) { nFresh++; if (pu < 0 && this.parentOf[u] >= 0) pu = this.parentOf[u]; }
        if (this.is[u] === I_DOCK && this.bond[u * 4 + F] >= 0) attached = true;   // still docked on its template
      }
      if (attached || nFresh * 2 < chain.length) continue;
      let pgen = 0, parentSeq = '';
      if (pu >= 0) {
        const pchain = this.chainOf(this.componentOf(pu));
        parentSeq = pchain.map((u) => TNAME[this.type[u]]).join('');
        for (const u of pchain) if (this.gen[u] > pgen) pgen = this.gen[u];
      }
      const g = pgen + 1; if (g > this.maxGen) this.maxGen = g;
      for (const u of chain) { this.gen[u] = g; this.fresh[u] = 0; }
      this.birthCount++;
      const seq = chain.map((u) => TNAME[this.type[u]]).join('');
      this._event('birth', chain[0]);
      if (this.p.logBirths) {
        this.births.push({ t: this.t, seq, gen: g, parent: parentSeq, x: this.px[chain[0]], y: this.py[chain[0]] });
        if (this.births.length > this.p.maxBirthLog) this.births.splice(0, this.births.length - this.p.maxBirthLog);
      }
    }
    this.brokeF.length = 0;
  }

  // ------------------------------------------------------------- one step
  step() {
    const p = this.p, n = this.n, rng = this.rng;
    this.t++;
    // 1. Brownian jostling, per square
    for (let u = 0; u < n; u++) {
      const sw = Math.sqrt(this.w[u]);
      this.px[u] += p.sigma * sw * gauss(rng); this.py[u] += p.sigma * sw * gauss(rng);
      this.pa[u] += p.sigmaRot * this.w[u] * gauss(rng);
    }
    for (let u = 0; u < n; u++) { this.px[u] = this._wx(this.px[u]); this.py[u] = this._wy(this.py[u]); }
    this._buildHash();
    // 2. contact candidates: unbonded squares close enough that they might touch during the solve
    const contacts = this.contacts; contacts.length = 0;
    for (let u = 0; u < n; u++) {
      this._forNear(this.px[u], this.py[u], (v) => {
        if (v <= u) return;
        const dx = this._dx(this.px[v] - this.px[u]), dy = this._dy(this.py[v] - this.py[u]);
        const rr = (this.rad[u] + this.rad[v]) * 1.3;
        if (dx * dx + dy * dy >= rr * rr) return;
        if (this._bonded(u, v)) return;
        contacts.push(u, v);
      });
    }
    // 3. constraints. Bonds: the two bonded sides must lie flush. Contacts: two unbonded squares may not overlap.
    //    Each constraint nudges only the two squares it involves; the passes are repeated so they settle together.
    const bl = this._bondList();
    for (let it = 0; it < p.iters; it++) {
      for (let k = 0; k < contacts.length; k += 2) {
        const u = contacts[k], v = contacts[k + 1];
        const dx = this._dx(this.px[v] - this.px[u]), dy = this._dy(this.py[v] - this.py[u]);
        const rr = this.rad[u] + this.rad[v];
        const d2 = dx * dx + dy * dy; if (d2 >= rr * rr) continue;
        const d = Math.sqrt(d2) || 1e-6;
        const push = (rr - d) / d, wu = this.w[u], wv = this.w[v], ws = wu + wv;
        const fx = dx * push, fy = dy * push;
        this.px[u] -= fx * wu / ws; this.py[u] -= fy * wu / ws;
        this.px[v] += fx * wv / ws; this.py[v] += fy * wv / ws;
      }
      for (let k = 0; k < bl.length; k++) {
        const q = bl[k], r = this.bond[q];
        const u = q >> 2, i = q & 3, v = r >> 2, j = r & 3;
        const wu = this.w[u], wv = this.w[v], ws = wu + wv;
        // angle: v's side j must face u's side i
        const e = angDiff(this.pa[v] - this.pa[u] - ((i - j) * Math.PI / 2 + Math.PI));
        this.pa[u] += e * wu / ws; this.pa[v] -= e * wv / ws;
        // position: the two side midpoints must coincide
        const phu = this.pa[u] + i * Math.PI / 2, phv = this.pa[v] + j * Math.PI / 2;
        const hu = this.size[u] / 2, hv = this.size[v] / 2;
        const ex = this._dx(this.px[v] + hv * Math.cos(phv) - this.px[u] - hu * Math.cos(phu));
        const ey = this._dy(this.py[v] + hv * Math.sin(phv) - this.py[u] - hu * Math.sin(phu));
        this.px[u] += ex * wu / ws; this.py[u] += ey * wu / ws;
        this.px[v] -= ex * wv / ws; this.py[v] -= ey * wv / ws;
      }
    }
    for (let u = 0; u < n; u++) { this.px[u] = this._wx(this.px[u]); this.py[u] = this._wy(this.py[u]); this.pa[u] = wrapAngle(this.pa[u]); }
    this._buildHash();
    // 4. bond formation
    for (let u = 0; u < n; u++) {
      if (!this.open[u]) continue;
      this._forNear(this.px[u], this.py[u], (v) => {
        if (v <= u || !this.open[v] || !this.open[u]) return;
        const dx = this._dx(this.px[v] - this.px[u]), dy = this._dy(this.py[v] - this.py[u]);
        const d0 = (this.size[u] + this.size[v]) / 2;
        const d2 = dx * dx + dy * dy;
        const dmax = d0 * (1 + p.distTol), dmin = d0 * (1 - p.distTol);
        if (d2 > dmax * dmax || d2 < dmin * dmin) return;
        const d = Math.sqrt(d2);
        for (let i = 0; i < 4; i++) {
          if (!(this.open[u] & (1 << i))) continue;
          for (let j = 0; j < 4; j++) {
            if (!(this.open[v] & (1 << j))) continue;
            const pr = this.compat(u, i, v, j);
            if (pr <= 0) continue;
            if (!this._geomOK(u, i, v, j, dx, dy, d)) continue;
            if (pr < 1 && rng() >= pr) continue;
            const su = this.ss[u * 4 + i], sv = this.ss[v * 4 + j];
            if (!this._formBond(u, i, v, j)) continue;
            if (i === F && j === F) { this.dockEvents++; if (this.type[u] !== this.type[v]) this.softDockEvents++; this._event('dock', u, v); }
            else if (i !== K && j !== K && this.type[u] !== T_E && this.type[v] !== T_E) {
              if (su === S.STICKY && sv === S.STICKY) this._event('link', u, v);
              else if (su !== S.INERT && sv !== S.INERT) { this.ligateEvents++; this._event('ligate', u, v); }
            }
            this.open[u] &= ~(1 << i); this.open[v] &= ~(1 << j);
            break;
          }
        }
      });
    }
    // 5. state transitions (synchronous: all read last step's derived states; bond breaks are applied after)
    for (let u = 0; u < n; u++) this._transition(u);
    for (const q of this.pendingUnlink) this._unlink(q >> 2, q & 3);
    this.pendingUnlink.length = 0;
    // 6. derive, then break every bond that a side no longer holds
    this._deriveAll();
    for (let u = 0; u < n; u++) for (let i = 0; i < 4; i++) {
      if (this.bond[u * 4 + i] >= 0 && NONHOLD[this.ss[u * 4 + i]]) this._unlink(u, i);
    }
    this._deriveAll();
    // 7. observation: births; physics: an undocked monomer is pushed off the face it left
    this._logBirths();
    for (const u of this.kicked) {
      this.px[u] = this._wx(this.px[u] - 0.6 * Math.cos(this.pa[u])); this.py[u] = this._wy(this.py[u] - 0.6 * Math.sin(this.pa[u]));
    }
    this.kicked.length = 0;
    // 8. energy reload (E is never created or destroyed; it flips OFF -> ON)
    for (let u = 0; u < n; u++) {
      if (this.type[u] !== T_E || this.is[u] !== I_OFF) continue;
      if (p.sun) {
        const dx = this._dx(this.px[u] - p.W / 2), dy = this._dy(this.py[u] - p.H / 2);
        if (dx * dx + dy * dy <= p.sunR * p.sunR) this.is[u] = I_ON;
      } else if (rng() < p.pReload) this.is[u] = I_ON;
    }
    for (let u = 0; u < n; u++) if (this.type[u] === T_E) this._derive(u);
    this._computeOpen();
  }

  run(steps) { for (let i = 0; i < steps; i++) this.step(); }

  // ------------------------------------------------------------- observation
  stats() {
    const n = this.n;
    let free = 0, eOn = 0, eOff = 0, repel = 0, tpl = 0, docked = 0, bonds = 0;
    for (let u = 0; u < n; u++) {
      if (this.type[u] === T_E) { if (this.is[u] === I_ON) eOn++; else eOff++; continue; }
      const o = u * 4;
      if (this.is[u] === I_DOCK && this.bond[o] < 0 && this.bond[o + L] < 0 && this.bond[o + R] < 0) free++;
      if (this.is[u] === I_DOCK && this.bond[o] >= 0) docked++;
      if (this.is[u] === I_REPEL) repel++;
      if (this.is[u] === I_TPL) tpl++;
      for (let i = 0; i < 4; i++) if (this.bond[o + i] >= 0) bonds++;
    }
    const hist = new Map(); const seqs = new Map();
    let strands = 0, complexes = 0, totalLen = 0, maxLen = 0, components = 0;
    const seen = new Uint8Array(n);
    for (let u0 = 0; u0 < n; u0++) {
      if (seen[u0]) continue;
      const comp = this.componentOf(u0);
      for (const x of comp) seen[x] = 1;
      components++;
      let nAB = 0, faceBonded = false;
      for (const u of comp) { if (this.type[u] === T_E) continue; nAB++; if (this.bond[u * 4 + F] >= 0) faceBonded = true; }
      if (nAB < 2) continue;
      // length and sequence are read off the longest chain, so a template that is being copied still counts
      const chain = this.chainOf(comp), len = chain.length;
      if (faceBonded) complexes++; else strands++;
      totalLen += len; if (len > maxLen) maxLen = len;
      hist.set(len, (hist.get(len) || 0) + 1);
      const s = chain.map((u) => TNAME[this.type[u]]).join(''); const rs = s.split('').reverse().join('');
      const canon = s < rs ? s : rs;
      seqs.set(canon, (seqs.get(canon) || 0) + 1);
    }
    const nChains = strands + complexes;
    let H = 0;
    for (const c of seqs.values()) { const q = c / nChains; H -= q * Math.log2(q); }
    const top = [...seqs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
    return {
      t: this.t, units: n, bonds: bonds / 2, free, docked, repel, tpl, eOn, eOff,
      strands, complexes, meanLen: nChains ? totalLen / nChains : 0, maxLen,
      lenHist: [...hist.entries()].sort((a, b) => a[0] - b[0]),
      distinct: seqs.size, entropy: H, top,
      births: this.birthCount, maxGen: this.maxGen, energyUsed: this.energyUsed,
      docks: this.dockEvents, softDocks: this.softDockEvents, captures: this.captureEvents,
      ligations: this.ligateEvents, frays: this.frayEvents, undocks: this.undockEvents, bodies: components,
    };
  }

  /** Sanity checks: bond symmetry, one bond per side, finite positions, unit count. */
  check() {
    const errs = [];
    for (let u = 0; u < this.n; u++) {
      if (!Number.isFinite(this.px[u]) || !Number.isFinite(this.py[u]) || !Number.isFinite(this.pa[u])) errs.push(`unit ${u} pose not finite`);
      for (let i = 0; i < 4; i++) {
        const q = this.bond[u * 4 + i]; if (q < 0) continue;
        if (this.bond[q] !== u * 4 + i) errs.push(`asymmetric bond ${u}.${i}`);
        if ((q >> 2) === u) errs.push(`self bond ${u}.${i}`);
      }
    }
    return errs;
  }
}

return { Sim, DEFAULTS, S, SNAME, F, R, K, L, T_A, T_B, T_E, TNAME, I_DOCK, I_REPEL, I_TPL, I_ON, I_OFF, SIDE_NAME, mulberry32 };
});
