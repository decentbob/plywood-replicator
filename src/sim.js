/*
 * Polygon Chemistry — simulation core.
 *
 * A 2D world of rigid squares governed by one universal rule table. A square
 * can read only its own state, its own bonds, and the state of the side it is
 * bonded to on each partner. Replication is a pathway that falls out of the
 * rules, not a primitive.
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
};
const SNAME = Object.keys(S);
// A bond breaks the moment either of its sides derives to one of these.
const NONHOLD = new Uint8Array(16);
NONHOLD[S.REPEL] = NONHOLD[S.INERT] = NONHOLD[S.IDLE] = NONHOLD[S.OFF] = 1;

const DEFAULTS = {
  seed: 1,
  W: 80, H: 80,                 // torus
  nA: 400, nB: 400, nE: 300,    // fixed populations (mass and energy are conserved)
  seedCount: 1, seedLen: 6, seedSeq: '',
  // chemistry knobs
  pSoft: 0,        // wrong-type docking (A on a B template): substitution
  pCapture: 0,     // a free monomer sticks to an open strand end instead of a template: insertion / substitution
  pLigate: 0,      // two strand ends join end to end: fusion
  pFray: 0,        // an end unit of an undocked strand falls off, per step: turnover / deletion
  energyGate: true,// REPEL -> TPL needs an ON energy particle on K
  energyMode: 'strand', // 'unit': every unit needs its own E. 'strand': a re-armed unit re-arms its lateral neighbours, so one E per strand.
  pReload: 0.002,  // OFF -> ON per step when the sun is off
  sun: false, sunR: 12,   // if on, OFF -> ON only inside a disc at the world centre
  // physics knobs (these should not need tuning for the chemistry to work)
  sigma: 0.06, sigmaRot: 0.08,   // Brownian step (translation, rotation) for a unit-mass body
  repK: 0.5, repMargin: 1.06,    // soft body repulsion
  tolDeg: 30, tolRotDeg: 40, distTol: 0.35,   // geometric tolerance for bond formation
  sizeE: 0.5,
  logBirths: true, maxBirthLog: 5000,
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
    this.px = new Float64Array(n); this.py = new Float64Array(n); this.pa = new Float64Array(n);
    this.lx = new Float64Array(n); this.ly = new Float64Array(n); this.la = new Float64Array(n);
    this.rx = new Float64Array(n); this.ry = new Float64Array(n);
    this.body = new Int32Array(n);
    this.bond = new Int32Array(n * 4).fill(-1);   // partner = unit*4+side
    this.ss = new Uint8Array(n * 4);              // derived side states
    this.open = new Uint8Array(n);                // bitmask of bondable sides
    this.fresh = new Uint8Array(n);               // released from a template since last birth
    this.gen = new Uint16Array(n);
    this.bodies = new Map(); this.nextBodyId = 0;
    this.dirty = new Set();
    this.births = []; this.birthCount = 0; this.maxGen = 0;
    this.energyUsed = 0; this.dockEvents = 0; this.captureEvents = 0; this.ligateEvents = 0; this.frayEvents = 0; this.softDockEvents = 0;

    // types
    let u = 0;
    for (let i = 0; i < p.nA; i++) this.type[u++] = T_A;
    for (let i = 0; i < p.nB; i++) this.type[u++] = T_B;
    for (let i = 0; i < p.nE; i++) this.type[u++] = T_E;
    for (u = 0; u < n; u++) {
      this.size[u] = this.type[u] === T_E ? p.sizeE : 1;
      this.rad[u] = 0.5 * this.size[u] * p.repMargin;
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
      this._makeBody([uu]);
    }
    // spatial hash
    this.cell = 1.5;
    this.gw = Math.max(3, Math.ceil(p.W / this.cell)); this.gh = Math.max(3, Math.ceil(p.H / this.cell));
    this.head = new Int32Array(this.gw * this.gh);
    this.next = new Int32Array(n);
    this.cosTol = Math.cos(p.tolDeg * Math.PI / 180);
    this.cosTolRot = Math.cos(p.tolRotDeg * Math.PI / 180);

    // seed strands
    for (let s = 0; s < p.seedCount; s++) {
      const len = p.seedSeq ? p.seedSeq.length : p.seedLen;
      const cx = p.W * (0.5 + (s === 0 ? 0 : (this.rng() - 0.5) * 0.8));
      const cy = p.H * (0.5 + (s === 0 ? 0 : (this.rng() - 0.5) * 0.8));
      this.seedStrand(cx, cy, this.rng() * TAU, len, p.seedSeq);
    }
    this._deriveAll();
    this._computeOpen();
  }

  /** Place a template strand of `len` units (or the given A/B sequence) as one rigid body. */
  seedStrand(cx, cy, ang, len, seq) {
    // pick free monomers of the right types
    const units = [];
    for (let i = 0; i < len; i++) {
      const want = seq ? (seq[i] === 'B' ? T_B : T_A) : (this.rng() < 0.5 ? T_A : T_B);
      let found = -1;
      for (let u = 0; u < this.n; u++) {
        if (this.type[u] === want && this.is[u] === I_DOCK && this.bodies.get(this.body[u]).units.length === 1
            && this.bond[u * 4 + F] < 0 && this.bond[u * 4 + L] < 0 && this.bond[u * 4 + R] < 0 && !units.includes(u)) { found = u; break; }
      }
      if (found < 0) return false;
      units.push(found);
    }
    // strand runs along +x in its own frame with F pointing -y; F normal angle = ang - pi/2
    const c = Math.cos(ang), s = Math.sin(ang);
    for (let i = 0; i < len; i++) {
      const u = units[i];
      const ox = i - (len - 1) / 2;
      this.px[u] = cx + ox * c; this.py[u] = cy + ox * s; this.pa[u] = ang - Math.PI / 2;
      this.is[u] = I_TPL;
      this.bodies.delete(this.body[u]);
    }
    for (let i = 0; i + 1 < len; i++) this._link(units[i], R, units[i + 1], L);
    this._makeBody(units);
    return true;
  }

  // ------------------------------------------------------------- bodies
  _makeBody(units) {
    const id = this.nextBodyId++;
    let cx = 0, cy = 0;
    for (const u of units) { cx += this.px[u]; cy += this.py[u]; }
    cx /= units.length; cy /= units.length;
    let mass = 0, I = 0;
    for (const u of units) {
      this.body[u] = id;
      this.lx[u] = this.px[u] - cx; this.ly[u] = this.py[u] - cy; this.la[u] = this.pa[u];
      this.rx[u] = this.lx[u]; this.ry[u] = this.ly[u];
      const m = this.size[u] * this.size[u];
      mass += m; I += m * (this.lx[u] * this.lx[u] + this.ly[u] * this.ly[u]) + m * m / 6;
    }
    const b = { id, units, cx, cy, ca: 0, mass, I, fx: 0, fy: 0, tq: 0 };
    this.bodies.set(id, b);
    return b;
  }
  _updatePoses(b) {
    const c = Math.cos(b.ca), s = Math.sin(b.ca);
    for (const u of b.units) {
      const x = this.lx[u] * c - this.ly[u] * s, y = this.lx[u] * s + this.ly[u] * c;
      this.rx[u] = x; this.ry[u] = y;
      this.px[u] = b.cx + x; this.py[u] = b.cy + y; this.pa[u] = this.la[u] + b.ca;
    }
  }

  // ------------------------------------------------------------- spatial hash
  _buildHash() {
    const p = this.p;
    this.head.fill(-1);
    for (let u = 0; u < this.n; u++) {
      let x = this.px[u] % p.W; if (x < 0) x += p.W;
      let y = this.py[u] % p.H; if (y < 0) y += p.H;
      const cx = Math.min(this.gw - 1, (x / this.cell) | 0), cy = Math.min(this.gh - 1, (y / this.cell) | 0);
      const c = cy * this.gw + cx;
      this.next[u] = this.head[c]; this.head[c] = u;
    }
  }
  /** Call fn(v) for every unit v in the 3x3 cells around u. */
  _forNeighbours(u, fn) {
    const p = this.p;
    let x = this.px[u] % p.W; if (x < 0) x += p.W;
    let y = this.py[u] % p.H; if (y < 0) y += p.H;
    const cx = Math.min(this.gw - 1, (x / this.cell) | 0), cy = Math.min(this.gh - 1, (y / this.cell) | 0);
    for (let dy = -1; dy <= 1; dy++) {
      const yy = (cy + dy + this.gh) % this.gh;
      for (let dx = -1; dx <= 1; dx++) {
        const xx = (cx + dx + this.gw) % this.gw;
        for (let v = this.head[yy * this.gw + xx]; v >= 0; v = this.next[v]) fn(v);
      }
    }
  }
  _dx(a) { const W = this.p.W; return a - W * Math.round(a / W); }
  _dy(a) { const H = this.p.H; return a - H * Math.round(a / H); }

  // ------------------------------------------------------------- bonds
  _link(u, i, v, j) { this.bond[u * 4 + i] = v * 4 + j; this.bond[v * 4 + j] = u * 4 + i; }
  _unlink(u, i) {
    const q = this.bond[u * 4 + i]; if (q < 0) return;
    this.bond[q] = -1; this.bond[u * 4 + i] = -1;
    this.dirty.add(this.body[u]);
  }

  /** True if unit m could sit at (tx,ty) without overlapping a unit outside its own body (space exclusion). */
  _slotFree(m, tx, ty) {
    const p = this.p, bm = this.body[m];
    let x = tx % p.W; if (x < 0) x += p.W;
    let y = ty % p.H; if (y < 0) y += p.H;
    const cx = Math.min(this.gw - 1, (x / this.cell) | 0), cy = Math.min(this.gh - 1, (y / this.cell) | 0);
    for (let dy = -1; dy <= 1; dy++) {
      const yy = (cy + dy + this.gh) % this.gh;
      for (let dx = -1; dx <= 1; dx++) {
        const xx = (cx + dx + this.gw) % this.gw;
        for (let v = this.head[yy * this.gw + xx]; v >= 0; v = this.next[v]) {
          if (this.body[v] === bm) continue;
          const ex = this._dx(this.px[v] - tx), ey = this._dy(this.py[v] - ty);
          const lim = 0.75 * (this.size[v] + this.size[m]) / 2;
          if (ex * ex + ey * ey < lim * lim) return false;
        }
      }
    }
    return true;
  }

  /** Form a bond between side i of u and side j of v, snapping the smaller body flush. Returns false if the slot is occupied. */
  _formBond(u, i, v, j) {
    const bu = this.bodies.get(this.body[u]), bv = this.bodies.get(this.body[v]);
    if (bu !== bv) {
      // anchor = larger body; mover = smaller
      let a = u, ia = i, m = v, im = j, ba = bu, bm = bv;
      if (bv.units.length > bu.units.length) { a = v; ia = j; m = u; im = i; ba = bv; bm = bu; }
      const phi = this.pa[a] + ia * Math.PI / 2;
      const d = (this.size[a] + this.size[m]) / 2;
      const tx = this.px[a] + d * Math.cos(phi), ty = this.py[a] + d * Math.sin(phi);
      // the anchor unit itself sits at distance d from the slot; anything closer than 3/4 of a contact blocks it
      if (!this._slotFree(m, tx, ty)) return false;
      const tang = phi + Math.PI - im * Math.PI / 2;
      const ca2 = tang - this.la[m];
      const c = Math.cos(ca2), s = Math.sin(ca2);
      bm.ca = ca2;
      bm.cx = tx - (this.lx[m] * c - this.ly[m] * s);
      bm.cy = ty - (this.lx[m] * s + this.ly[m] * c);
      this._updatePoses(bm);
      const units = ba.units.concat(bm.units);
      this.bodies.delete(ba.id); this.bodies.delete(bm.id);
      this.dirty.delete(ba.id); this.dirty.delete(bm.id);
      this._makeBody(units);
    }
    this._link(u, i, v, j);
    return true;
  }

  _geomOK(u, i, v, j, dx, dy, dist) {
    const phu = this.pa[u] + i * Math.PI / 2, phv = this.pa[v] + j * Math.PI / 2;
    const nux = Math.cos(phu), nuy = Math.sin(phu), nvx = Math.cos(phv), nvy = Math.sin(phv);
    const ux = dx / dist, uy = dy / dist;
    if (nux * ux + nuy * uy < this.cosTol) return false;       // v lies in front of u's side i
    if (-(nvx * ux + nvy * uy) < this.cosTol) return false;    // u lies in front of v's side j
    if (nux * nvx + nuy * nvy > -this.cosTolRot) return false; // sides are (nearly) antiparallel
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
        else if (i === K) ok = s === S.WANT;
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
    // L, R
    const lat = (bonded) => bonded ? (st === I_TPL ? S.ARMED : S.BONDED) : (st === I_DOCK ? ((bF || nl > 0) ? S.STICKY : S.INERT) : S.END);
    this.ss[o + L] = lat(bL); this.ss[o + R] = lat(bR);
    // K
    this.ss[o + K] = st === I_REPEL ? S.WANT : S.IDLE;
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
        if (this.is[u] === I_ON) this.energyUsed++;
        this.is[u] = I_OFF;
      }
      return;
    }
    const bF = b[o + F] >= 0, bL = b[o + L] >= 0, bR = b[o + R] >= 0, bK = b[o + K] >= 0;
    const nl = (bL ? 1 : 0) + (bR ? 1 : 0);
    const st = this.is[u];
    if (st === I_DOCK) {
      if (bF) {
        // R1 release: docked, and every lateral bond the template partner says I need is in place
        const pf = this.ss[b[o + F]];
        const needL = pf === S.TPL_MM || pf === S.TPL_LF;
        const needR = pf === S.TPL_MM || pf === S.TPL_RF;
        if ((!needL || bL) && (!needR || bR)) { this.is[u] = I_REPEL; this.fresh[u] = 1; }
      } else if (nl > 0) {
        // R2 captured laterally without a template: also a new strand unit
        this.is[u] = I_REPEL; this.fresh[u] = 1; this.captureEvents++;
      }
    } else if (st === I_REPEL) {
      if (nl === 0) this.is[u] = I_DOCK;                                   // R3 lost its strand: back to the pool
      else if (!p.energyGate || (bK && this.ss[b[o + K]] === S.ON)) this.is[u] = I_TPL;  // R4 re-arm (energy)
      else if (p.energyMode === 'strand' && ((bL && this.ss[b[o + L]] === S.ARMED) || (bR && this.ss[b[o + R]] === S.ARMED))) this.is[u] = I_TPL; // R4b re-arm spreads along the strand
    } else { // I_TPL
      if (nl === 0) this.is[u] = I_DOCK;                                   // R3
    }
    // R5 fraying: an end unit of an undocked strand falls off
    if (this.is[u] !== I_DOCK && !bF && nl === 1 && p.pFray > 0 && this.rng() < p.pFray) {
      this.is[u] = I_DOCK; this.fresh[u] = 0;
      this._unlink(u, L); this._unlink(u, R); this.frayEvents++;
    }
  }

  // ------------------------------------------------------------- splitting and births
  _splitDirty() {
    if (this.dirty.size === 0) return;
    const seen = new Uint8Array(this.n);
    for (const id of this.dirty) {
      const b = this.bodies.get(id); if (!b) continue;
      const comps = [];
      for (const start of b.units) {
        if (seen[start]) continue;
        const comp = [start]; seen[start] = 1;
        for (let k = 0; k < comp.length; k++) {
          const u = comp[k];
          for (let i = 0; i < 4; i++) {
            const q = this.bond[u * 4 + i]; if (q < 0) continue;
            const v = q >> 2; if (!seen[v]) { seen[v] = 1; comp.push(v); }
          }
        }
        comps.push(comp);
      }
      if (comps.length === 1) continue;
      this.bodies.delete(id);
      const newBodies = comps.map((c) => this._makeBody(c));
      // births: a standalone strand made mostly of freshly released units
      for (let k = 0; k < newBodies.length; k++) {
        const c = newBodies[k].units;
        let nAB = 0, nFresh = 0, faceBonded = false;
        for (const u of c) {
          if (this.type[u] === T_E) continue;
          nAB++; if (this.fresh[u]) nFresh++;
          if (this.bond[u * 4 + F] >= 0) faceBonded = true;
        }
        if (nAB < 2 || faceBonded) continue;
        if (nFresh * 2 >= nAB) {
          let pgen = 0, parentSeq = '';
          for (let m = 0; m < newBodies.length; m++) {
            if (m === k) continue;
            for (const u of newBodies[m].units) if (this.type[u] !== T_E && this.gen[u] > pgen) pgen = this.gen[u];
            if (!parentSeq) parentSeq = this.sequenceOf(newBodies[m].units);
          }
          const g = pgen + 1; if (g > this.maxGen) this.maxGen = g;
          for (const u of c) this.gen[u] = g;
          this.birthCount++;
          if (this.p.logBirths) {
            const seq = this.sequenceOf(c);
            this.births.push({ t: this.t, seq, gen: g, parent: parentSeq, x: newBodies[k].cx, y: newBodies[k].cy });
            if (this.births.length > this.p.maxBirthLog) this.births.splice(0, this.births.length - this.p.maxBirthLog);
          }
        }
        for (const u of c) this.fresh[u] = 0;
      }
    }
    this.dirty.clear();
  }

  /** Read a strand's sequence L->R from a unit list (E units ignored). */
  sequenceOf(units) {
    let best = '';
    for (const start of units) {
      if (this.type[start] === T_E || this.bond[start * 4 + L] >= 0) continue;
      let s = '', u = start, guard = 0;
      while (u >= 0 && guard++ < 100000) {
        s += TNAME[this.type[u]];
        const q = this.bond[u * 4 + R]; u = q < 0 ? -1 : q >> 2;
      }
      if (s.length > best.length) best = s;
    }
    return best;
  }

  // ------------------------------------------------------------- one step
  step() {
    const p = this.p, n = this.n, rng = this.rng;
    this.t++;
    // 1. Brownian jostling
    for (const b of this.bodies.values()) {
      const sm = p.sigma / Math.sqrt(b.mass), sr = p.sigmaRot / Math.pow(b.mass, 1.5);
      b.cx += sm * gauss(rng); b.cy += sm * gauss(rng); b.ca += sr * gauss(rng);
      b.fx = 0; b.fy = 0; b.tq = 0;
    }
    for (const b of this.bodies.values()) this._updatePoses(b);
    this._buildHash();
    // 2. soft repulsion between bodies
    for (let u = 0; u < n; u++) {
      const bu = this.body[u];
      this._forNeighbours(u, (v) => {
        if (v <= u || this.body[v] === bu) return;
        const dx = this._dx(this.px[v] - this.px[u]), dy = this._dy(this.py[v] - this.py[u]);
        const rr = this.rad[u] + this.rad[v];
        const d2 = dx * dx + dy * dy; if (d2 >= rr * rr) return;
        const d = Math.sqrt(d2) || 1e-6;
        const f = p.repK * (rr - d) / d;           // force magnitude / d
        const fx = dx * f, fy = dy * f;              // on v (away from u)
        const A = this.bodies.get(bu), B = this.bodies.get(this.body[v]);
        A.fx -= fx; A.fy -= fy; A.tq -= this.rx[u] * fy - this.ry[u] * fx;
        B.fx += fx; B.fy += fy; B.tq += this.rx[v] * fy - this.ry[v] * fx;
      });
    }
    for (const b of this.bodies.values()) {
      b.cx += b.fx / b.mass; b.cy += b.fy / b.mass; b.ca += b.tq / b.I;
      b.cx %= p.W; if (b.cx < 0) b.cx += p.W;
      b.cy %= p.H; if (b.cy < 0) b.cy += p.H;
      b.ca = wrapAngle(b.ca);
      this._updatePoses(b);
    }
    this._buildHash();
    // 3. bond formation
    for (let u = 0; u < n; u++) {
      if (!this.open[u]) continue;
      this._forNeighbours(u, (v) => {
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
            // bookkeeping for the log
            if (i === F && j === F) { this.dockEvents++; if (this.type[u] !== this.type[v]) this.softDockEvents++; }
            else if (i !== K && j !== K && this.type[u] !== T_E && this.type[v] !== T_E) {
              if (!(su === S.STICKY && sv === S.STICKY) && su !== S.INERT && sv !== S.INERT) this.ligateEvents++;
            }
            this.open[u] &= ~(1 << i); this.open[v] &= ~(1 << j);
            break;
          }
        }
      });
    }
    // 4. state transitions (synchronous: all read last step's derived states)
    for (let u = 0; u < n; u++) this._transition(u);
    // 5. derive, then break every bond that a side no longer holds
    this._deriveAll();
    for (let u = 0; u < n; u++) for (let i = 0; i < 4; i++) {
      if (this.bond[u * 4 + i] >= 0 && NONHOLD[this.ss[u * 4 + i]]) this._unlink(u, i);
    }
    this._deriveAll();
    this._splitDirty();
    // 6. energy reload (E is never created or destroyed; it flips OFF -> ON)
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
    let strands = 0, complexes = 0, totalLen = 0, maxLen = 0;
    for (const b of this.bodies.values()) {
      let nAB = 0, faceBonded = false;
      for (const u of b.units) { if (this.type[u] === T_E) continue; nAB++; if (this.bond[u * 4 + F] >= 0) faceBonded = true; }
      if (nAB < 2) continue;
      if (faceBonded) { complexes++; continue; }
      strands++; totalLen += nAB; if (nAB > maxLen) maxLen = nAB;
      hist.set(nAB, (hist.get(nAB) || 0) + 1);
      const s = this.sequenceOf(b.units); const rs = s.split('').reverse().join('');
      const canon = s < rs ? s : rs;
      seqs.set(canon, (seqs.get(canon) || 0) + 1);
    }
    let H = 0;
    for (const c of seqs.values()) { const q = c / strands; H -= q * Math.log2(q); }
    const top = [...seqs.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
    return {
      t: this.t, units: n, bonds: bonds / 2, free, docked, repel, tpl, eOn, eOff,
      strands, complexes, meanLen: strands ? totalLen / strands : 0, maxLen,
      lenHist: [...hist.entries()].sort((a, b) => a[0] - b[0]),
      distinct: seqs.size, entropy: H, top,
      births: this.birthCount, maxGen: this.maxGen, energyUsed: this.energyUsed,
      docks: this.dockEvents, softDocks: this.softDockEvents, captures: this.captureEvents,
      ligations: this.ligateEvents, frays: this.frayEvents, bodies: this.bodies.size,
    };
  }

  /** Sanity checks: mass conservation, bond symmetry, one bond per side. */
  check() {
    const errs = [];
    let count = 0;
    for (const b of this.bodies.values()) for (const u of b.units) { count++; if (this.body[u] !== b.id) errs.push(`unit ${u} body mismatch`); }
    if (count !== this.n) errs.push(`unit count ${count} != ${this.n}`);
    for (let u = 0; u < this.n; u++) for (let i = 0; i < 4; i++) {
      const q = this.bond[u * 4 + i]; if (q < 0) continue;
      if (this.bond[q] !== u * 4 + i) errs.push(`asymmetric bond ${u}.${i}`);
      if (this.body[q >> 2] !== this.body[u]) errs.push(`bond across bodies ${u}.${i}`);
    }
    return errs;
  }
}

return { Sim, DEFAULTS, S, SNAME, F, R, K, L, T_A, T_B, T_E, TNAME, I_DOCK, I_REPEL, I_TPL, I_ON, I_OFF, SIDE_NAME, mulberry32 };
});
