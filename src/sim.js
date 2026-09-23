/*
 * Polygon Chemistry — simulation core.
 *
 * A 2D world of small polygons ("blocks") governed by one universal rule table. A block can read only its own
 * state, its own bonds, and the state of the side it is bonded to on each partner. Replication is a pathway that
 * falls out of the rules, not a primitive.
 *
 * Physics. Each block is a polygon of up to NV corners, held to its rest shape by a restoring force whose strength
 * is a per-type stiffness. A bond pins the two corners of one side onto the two corners of the partner's side, so
 * bonded edges coincide and a strand moves as one body. Everything is solved per block: a pin moves the two blocks
 * it joins (rigidly, and by their softness it deforms the pinned corners), a contact pushes two unbonded blocks
 * apart, and a soft block relaxes toward its rest shape. There is no object in this code larger than one block.
 * Chains, strands and copies exist only in the eye of the observer; the functions that look at connected
 * components (`componentOf`, `stats`, birth logging) are observation and never feed back into the dynamics.
 *
 * No dependencies. Works in the browser (global `PolyChem`) and in Node (`module.exports`).
 *
 * The four working sides of a block, counter-clockwise from the face:
 *   F (0) face   — docks on a template / is docked on
 *   R (1) right  — lateral, bonds only to a neighbour's L
 *   K (2) back   — energy docks here
 *   L (3) left   — lateral, bonds only to a neighbour's R
 * Each is one edge of the block's polygon (edgeOf); any other edge is skin and never bonds.
 *
 * Every unit carries ONE internal state:
 *   monomer types A, B:  DOCK | REPEL | TPL | FRAY (FRAY only with processive fraying, pUnzip > 0)
 *   energy type E:       OFF  | ON
 * Everything a neighbour can read (the "side states" of the design doc) is derived each step from that internal
 * state plus which sides are bonded.
 */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.PolyChem = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
'use strict';

const F = 0, R = 1, K = 2, L = 3;
const SIDE_NAME = ['F', 'R', 'K', 'L'];
const T_A = 0, T_B = 1, T_E = 2, T_M = 3, T_C = 4, T_D = 5;   // A, B, C, D are the replicator letters (each pairs with its own kind)
const NT = 6;
const NV = 8;   // most corners a unit can have
const TNAME = ['A', 'B', 'E', 'M', 'C', 'D'];
const LETTERS = [T_A, T_B, T_C, T_D];
/** Binding partners: A with B, C with D (copying pairs each letter with itself, binding with its complement). */
const COMP = [T_B, T_A, -1, -1, T_D, T_C];
/** A per-type parameter: p[base + letter], e.g. stiffC; dflt where the type has none (E has no stiffness knob). */
function typeParam(p, base, t, dflt) { const v = p[base + TNAME[t]]; return v === undefined ? dflt : v; }

// internal states
const I_DOCK = 0, I_REPEL = 1, I_TPL = 2, I_FRAY = 3, I_RAW = 4;   // A / B (RAW: an inactive free monomer, act rule)
const I_OFF = 0, I_ON = 1;                  // E

// derived side states (the interface a bonded partner can read)
const S = {
  DOCK: 0, TPL_MM: 1, TPL_LF: 2, TPL_RF: 3, REPEL: 4,   // F
  INERT: 5, STICKY: 6, BONDED: 7, END: 8,               // L, R
  IDLE: 9, WANT: 10,                                    // K
  ON: 11, OFF: 12,                                      // E (all four sides)
  ARMED: 13,                                            // L, R: bonded, and this unit is a template (TPL); read by nothing, shown by the viewer
  CHARGE: 15,                                           // K: the back of a B template unit flanked by two A units; charges spent energy
  MEM: 16,                                              // L, R of a membrane block: open, bonds only to another membrane block's opposite side
  RAW: 20,                                              // K and L, R of a raw membrane block (make rule): its back docks on a MAKE back and its sides on an active block's open side, either of which activates it
  MAKE: 21,                                             // K of an A template unit flanked by two B units (make rule): activates raw membrane blocks
  SHIELD: 23,                                           // L, R of a D template unit flanked by two C units (shield rule): radiation cannot break these bonds
  FSH: 24,                                              // L, R carrying both signals, FEED and SHIELD (relay)
  HYB: 22,                                              // L, R of a template unit whose face is bound to another template's face (binding, complementary letters): read by its neighbours
  FEED: 18,                                             // L, R of a B template unit flanked by two A units (feed rule): a released neighbour that reads it re-arms without energy
  FRAY: 17,                                             // L, R of a unit that is leaving its strand this step (processive fraying); holds, and a neighbour can read it
  INACT: 25,                                            // K of an inactive free monomer (act rule): docks on an ACT back and is activated there
  ACT: 26,                                              // K of a template unit in the activating motif (act rule): activates inactive monomers
};
const SNAME = []; for (const k in S) SNAME[S[k]] = k;   // name of each side-state value
// A bond breaks the moment either of its sides derives to one of these.
const NONHOLD = new Uint8Array(32);
NONHOLD[S.REPEL] = NONHOLD[S.INERT] = NONHOLD[S.IDLE] = NONHOLD[S.OFF] = 1;

const DEFAULTS = {
  seed: 1,
  W: 48, H: 48,                 // torus
  nA: 160, nB: 160, nE: 120,    // fixed populations (mass and energy are conserved)
  nC: 0, nD: 0,                 // two more replicator letters; each pairs with its own kind, like A and B
  nM: 0,                        // membrane blocks: wedges that bond only to each other, side to side; self-assemble into arcs and rings
  seedCount: 1, seedLen: 6, seedSeq: '',   // seedSeq: 'ABBABA' or a comma-separated list 'AB,ABBABA'
  // chemistry knobs
  pSoft: 0,        // wrong-type docking (A on a B template): substitution
  pCapture: 0,     // a free monomer sticks to an open strand end instead of a template: insertion / substitution
  pLigate: 0,      // two strand ends join end to end: fusion. Balanced against fraying it sets a length distribution.
  pFray: 0,        // an end unit of an undocked strand falls off, per step: turnover / deletion
  pUnzip: 0,       // processive fraying: a unit whose lateral neighbour is fraying frays next, per step. 1 unzips a whole strand; 0 is plain end fraying
  pUndock: 0,      // a docked monomer with no lateral bonds falls off its template, per step: cooperativity
  pHyb: 0,         // binding: two template faces of complementary letters (A on B, C on D) bind, per step of contact. Copies pair A on A, so kin never bind
  pMelt: 0.1,      // binding: a face-to-face bond with no bound neighbour melts, per step
  pMeltRun: 0.001, // binding: a face-to-face bond with a bound neighbour on each side melts, per step
  pMeltEnd: -1,    // binding: one with a bound neighbour on one side only (the end of a run); -1 means pMeltRun. Set between the two, only runs of three or more hold
  pSpont: 0,       // two free monomers link side to side: the only way a strand can begin without a seed
  pBreak: 0,       // radiation: a lateral bond breaks, per step, scaled by (1 - resA/resB) of the two blocks it joins
  resA: 0, resB: 0, resC: 0, resD: 0, // resistance of each block type to breaking, 0 (fragile) to 1 (immune)
  motif: false,    // a B template unit flanked by two A units charges spent energy at its back (sequence as metabolism)
  feed: false,     // a B template unit flanked by two A units re-arms its released neighbours through their shared bonds (private metabolism)
  shield: false,   // a D template unit flanked by two C units makes its two lateral bonds immune to radiation (private durability)
  relay: false,    // template units pass FEED and SHIELD on along their strand, away from the motif, so one motif serves the whole strand
  pMem: 0.2,       // two membrane blocks whose back corners touch link, per step of contact; the pins then pull their edges flush
  memAngle: 45,    // bend between two bonded membrane blocks, degrees toward the backs: their wedge shape (45 closes a ring of 8; at most about 50)
  resM: 0.5,       // membrane blocks' resistance to radiation
  memStrain: 0,    // a membrane bond whose pinned corners end a step further apart than this (in block sides) lets go: membrane cannot hold a
                   // shape its blocks do not fit, so a ring holding more blocks than its bend closes snaps. 0: off (pins stretch without limit)
  make: false,     // membrane blocks start raw. A raw block activates where its back docks on the back of an A template unit flanked by two B units
                   // (and stays anchored there), or where its side links to an active block's open side, so membrane grows from its makers
  pMemDecay: 0,    // an active membrane block with no lateral bonds falls back to raw, per step (make rule): membrane has to be made continually
  act: false,      // a unit that leaves a strand is an inactive monomer (it cannot dock) until its back meets the back of a template unit in
                   // actMotif, which activates it: monomer activation as a second catalysed good beside energy
  actMotif: 'BAB', // the activating context: the middle letter flanked by the outer one on both sides (a palindrome)
  energyGate: true,// REPEL -> TPL needs an ON energy particle on K
  pReload: 0.002,  // OFF -> ON per step, the background energy income; the ABA motif (motif rule) is the other source
  // shape: each block type's rest polygon and how hard it is pulled back to it
  shapeA: 'square', shapeB: 'square', shapeC: 'square', shapeD: 'square', shapeM: 'square',   // 'square' (a wedge when bent) or 'oct' (an octagon, working sides on alternate edges)
  bendA: 0, bendB: 0, bendC: 0, bendD: 0,           // degrees of bend between two bonded neighbours of this type (0 square, >0 a wedge that curls strands)
  stiffA: 0.5, stiffB: 0.5, stiffC: 0.5, stiffD: 0.5, stiffM: 1,   // pull back to the rest shape per solver pass: 1 rigid; 0.5 is safe; below about 0.3 copies docked on neighbouring templates can link
  // physics knobs (these should not need tuning for the chemistry to work)
  sigma: 0.3, sigmaRot: 0.45,    // Brownian step (translation, rotation) per unit per step
  mobE: 1,                       // energy particles' Brownian step relative to their size's; below 1 the medium is viscous for energy
  mobS: 1,                       // Brownian step (and turn) of a block that has a bond, relative to a free one's: below 1 polymers creep while monomers
                                 // and energy diffuse, as on a mineral surface, so offspring stay near their parents
  repMargin: 1.0,                // contact radius of a block as a fraction of half its side; unbonded blocks never overlap more than this allows
  iters: 16,                     // constraint passes per step (pins, contacts, shape); 8 to 24 all copy exactly, more keep bonded edges closer
  tolDeg: 30, tolRotDeg: 40, distTol: 0.35,   // geometric tolerance for docking (F to F, E to K)
  linkTolDeg: 10, linkDistTol: 0.15,          // tighter tolerance for side-to-side links (L to R): flush means flush
  sizeE: 0.5,
  logBirths: true, maxBirthLog: 5000, maxEventLog: 300,
};
/** Knobs of the rigid engine, removed on 2026-09-23 with it; the runner ignores them with a warning. */
const REMOVED = ['physics', 'hinge', 'hingeMax', 'slack', 'memFlex'];

function mulberry32(seed) {
  let a = seed | 0;
  return function () {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const TAU = Math.PI * 2;
function wrapAngle(a) { a %= TAU; if (a < 0) a += TAU; return a; }

class Sim {
  constructor(params) {
    this.p = Object.assign({}, DEFAULTS, params || {});
    this.rng = mulberry32(this.p.seed);
    this._spare = NaN;               // the second normal of the last Box-Muller pair
    this.t = 0;
    this._init();
  }

  /** A standard normal deviate (Box-Muller, both values of each pair used). */
  _gauss() {
    if (this._spare === this._spare) { const g = this._spare; this._spare = NaN; return g; }
    let u = 0; while (u === 0) u = this.rng();
    const v = this.rng(), r = Math.sqrt(-2 * Math.log(u));
    this._spare = r * Math.sin(TAU * v);
    return r * Math.cos(TAU * v);
  }

  // ---------------------------------------------------------------- setup
  // ---------------------------------------------------------------- setup
  _init() {
    const p = this.p;
    const n = this.n = p.nA + p.nB + p.nE + (p.nM || 0) + (p.nC || 0) + (p.nD || 0);
    this.type = new Uint8Array(n);
    this.is = new Uint8Array(n);          // internal state
    this.size = new Float64Array(n);
    this.rad = new Float64Array(n);       // repulsion radius
    this.w = new Float64Array(n);         // inverse mass
    this.wr = new Float64Array(n);        // inverse moment of inertia
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
    this.pins = [];                               // per bond, the two corner pairs it pins, as u*NV+k, v*NV+k
    this.bondsDirty = true;
    this.pairs = [];                              // unit pairs close enough this step to touch or to bond (one neighbour scan per step)
    this.ox = new Float64Array(n * NV); this.oy = new Float64Array(n * NV);   // corner offsets from the centre, world frame
    this.births = []; this.birthCount = 0; this.maxGen = 0;
    this.events = [];
    this.energyUsed = 0; this.energyCharged = 0; this.dockEvents = 0; this.captureEvents = 0; this.ligateEvents = 0; this.frayEvents = 0; this.softDockEvents = 0; this.undockEvents = 0; this.spontEvents = 0; this.breakEvents = 0; this.unzipEvents = 0; this.fedEvents = 0; this.makeEvents = 0; this.hybEvents = 0; this.meltEvents = 0; this.actEvents = 0; this.strainEvents = 0;
    this._seen = new Uint8Array(n);
    const am = String(p.actMotif || 'BAB');
    this._actOut = LETTERS['ABCD'.indexOf(am[0])]; this._actMid = LETTERS['ABCD'.indexOf(am[1])];   // act rule: flanking and middle letter

    // types
    let u = 0;
    for (let i = 0; i < p.nA; i++) this.type[u++] = T_A;
    for (let i = 0; i < p.nB; i++) this.type[u++] = T_B;
    for (let i = 0; i < p.nE; i++) this.type[u++] = T_E;
    for (let i = 0; i < (p.nM || 0); i++) this.type[u++] = T_M;
    for (let i = 0; i < (p.nC || 0); i++) this.type[u++] = T_C;
    for (let i = 0; i < (p.nD || 0); i++) this.type[u++] = T_D;
    for (u = 0; u < n; u++) {
      this.size[u] = this.type[u] === T_E ? p.sizeE : 1;
      this.rad[u] = 0.5 * this.size[u] * p.repMargin;
      this.w[u] = 1 / (this.size[u] * this.size[u]);
      this.wr[u] = 6 / Math.pow(this.size[u], 4);
      this.is[u] = this.type[u] === T_E ? I_ON : this.type[u] === T_M ? (p.make ? I_OFF : I_ON) : I_DOCK;   // a membrane block is active (ON) or raw (OFF)
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
    // rest shapes per type: nv corners about their mean, face along +x, counter-clockwise; edge e runs corner e -> e+1.
    // edgeOf maps each working side (F, R, K, L) to the polygon edge that carries it; any other edge is skin.
    this.nv = new Uint8Array(NT); this.rx = new Float64Array(NT * NV); this.ry = new Float64Array(NT * NV); this.edgeOf = new Int8Array(NT * 4);
    for (let t = 0; t < NT; t++) {
      const h = 0.5 * (t === T_E ? p.sizeE : 1), shape = typeParam(p, 'shape', t, 'square');
      let pts, edges;
      if (shape === 'oct') {
        // regular octagon one side across (flat to flat); the working sides are every other edge
        const r = h / Math.cos(Math.PI / 8);
        pts = []; for (let k = 0; k < 8; k++) { const a = -Math.PI / 8 + k * Math.PI / 4; pts.push([r * Math.cos(a), r * Math.sin(a)]); }
        edges = [0, 2, 4, 6];
      } else {
        pts = [[h, -h], [h, h], [-h, h], [-h, -h]]; edges = [0, 1, 2, 3];
        // wedges: the lateral sides lean in toward the back by half the bend, so two blocks bonded side to side meet at
        // the bend and a run of them curls with its backs inside. A block one side deep cannot lean past about 50 degrees.
        const bend = t === T_M ? p.memAngle : typeParam(p, 'bend', t, 0);
        if (bend !== 0) { const hb = Math.max(0.15 * h, h - 2 * h * Math.tan(bend * Math.PI / 360)); pts = [[h, -h], [h, h], [-h, hb], [-h, -hb]]; }
      }
      let mx = 0, my = 0; for (const q of pts) { mx += q[0] / pts.length; my += q[1] / pts.length; }
      this.nv[t] = pts.length;
      for (let k = 0; k < pts.length; k++) { this.rx[t * NV + k] = pts[k][0] - mx; this.ry[t * NV + k] = pts[k][1] - my; }
      for (let i = 0; i < 4; i++) this.edgeOf[t * 4 + i] = edges[i];
    }
    // a membrane wedge's contact radius is its mean half-width, so two blocks can reach the flush pose
    const hbM = p.shapeM === 'oct' ? 0.5 : this.ry[T_M * NV + 2];
    for (u = 0; u < n; u++) if (this.type[u] === T_M) this.rad[u] = 0.5 * (0.5 + hbM) * p.repMargin;
    this.vw = new Float64Array(n);                 // inverse mass of one corner
    for (u = 0; u < n; u++) { this.vw[u] = this.nv[this.type[u]] * this.w[u]; this._resetShape(u); }
    // spatial hash
    // neighbour scan reach: docking distance (1.35 sides) plus room for the solver's moves within a step; the cells
    // are at least that wide, so the 3x3 cells around a unit hold every unit within reach
    this.reach = 1.6;
    this.cell = 1.6;
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

  /** Place a template strand of `len` units (or the given A/B sequence): a row of blocks, each bonded to the next. */
  seedStrand(cx, cy, ang, len, seq) {
    const units = [];
    for (let i = 0; i < len; i++) {
      const want = seq ? LETTERS['ABCD'.indexOf(seq[i])] : (this.rng() < 0.5 ? T_A : T_B);
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
      this.is[u] = I_TPL; this._resetShape(u);
    }
    for (let i = 0; i + 1 < len; i++) this._link(units[i], R, units[i + 1], L);
    this._deriveAll();
    this._computeOpen();
    return units;
  }

  // ------------------------------------------------------------- geometry helpers
  // ------------------------------------------------------------- geometry helpers
  _wx(x) { const W = this.p.W; x %= W; return x < 0 ? x + W : x; }

  _wy(y) { const H = this.p.H; y %= H; return y < 0 ? y + H : y; }

  _dx(a) { const W = this.p.W; return a - W * Math.round(a / W); }

  _dy(a) { const H = this.p.H; return a - H * Math.round(a / H); }

  // ------------------------------------------------------------- spatial hash
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

  // ------------------------------------------------------------- bonds and shapes
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
    const out = [], pins = [];
    for (let q = 0; q < this.n * 4; q++) {
      const r = this.bond[q]; if (r <= q) continue;
      const u = q >> 2, i = q & 3, v = r >> 2, j = r & 3;
      out.push(q);
      if (this.type[u] === T_E || this.type[v] === T_E) continue;   // an energy bond never lives into a physics phase
      // side i of u runs corner a0 -> a1, side j of v runs b0 -> b1; facing each other, a0 meets b1 and a1 meets b0
      const cu = this._sideCorners(u, i, [0, 0]), cv = this._sideCorners(v, j, [0, 0]);
      pins.push(cu[0], cv[1], cu[1], cv[0]);
    }
    this.bonds = out; this.pins = pins; this.bondsDirty = false; return out;
  }

  /** Number of corners of unit u. */
  corners(u) { return this.nv[this.type[u]]; }

  /** The two corners (as u*NV+k) of side i of u, in counter-clockwise order; -1 if u's shape has no such side. */
  _sideCorners(u, i, out) {
    const t = this.type[u], e = this.edgeOf[t * 4 + i], nv = this.nv[t];
    out[0] = u * NV + e; out[1] = u * NV + (e + 1) % nv;
    return out;
  }

  /** Put u's corners at its rest shape, rotated to its orientation. */
  _resetShape(u) {
    const t = this.type[u], c = Math.cos(this.pa[u]), s = Math.sin(this.pa[u]);
    for (let k = 0; k < this.nv[t]; k++) { const x = this.rx[t * NV + k], y = this.ry[t * NV + k]; this.ox[u * NV + k] = c * x - s * y; this.oy[u * NV + k] = s * x + c * y; }
  }

  /** Move unit u rigidly: translate by (dx, dy), turn its corners by da about its centre. */
  _rigidMove(u, dx, dy, da) {
    this.px[u] += dx; this.py[u] += dy;
    if (da === 0) return;
    this.pa[u] += da;
    const c = Math.cos(da), s = Math.sin(da);
    for (let k = u * NV, e = u * NV + this.corners(u); k < e; k++) { const x = this.ox[k], y = this.oy[k]; this.ox[k] = c * x - s * y; this.oy[k] = s * x + c * y; }
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

  /** Midpoint (relative to u's centre) and outward unit normal of side i of u. */
  _side(u, i, out) {
    const cs = this._sideCorners(u, i, this._sc || (this._sc = [0, 0])), a = cs[0], b = cs[1];
    const ex = this.ox[b] - this.ox[a], ey = this.oy[b] - this.oy[a], el = Math.hypot(ex, ey) || 1;
    out[0] = (this.ox[a] + this.ox[b]) / 2; out[1] = (this.oy[a] + this.oy[b]) / 2; out[2] = ey / el; out[3] = -ex / el;
    return out;
  }

  _geomOK(u, i, v, j, dx, dy, dist) {
    const su = this._side(u, i, this._sa || (this._sa = [0, 0, 0, 0])), sv = this._side(v, j, this._sb || (this._sb = [0, 0, 0, 0]));
    if (this.type[u] === T_M && this.type[v] === T_M && i !== K && j !== K) {
      // membrane blocks link where their back corners touch and their sides roughly face; the pins then pull the
      // two edges flush and the blocks' leaning sides give the ring its bend
      // the back corner of a right side is its second corner, of a left side its first
      const cu = this._sideCorners(u, i, [0, 0]), cv = this._sideCorners(v, j, [0, 0]);
      const bu = i === R ? cu[1] : cu[0], bv = j === R ? cv[1] : cv[0];
      const gx = dx + this.ox[bv] - this.ox[bu], gy = dy + this.oy[bv] - this.oy[bu], tol = this.p.linkDistTol * (this.size[u] + this.size[v]) / 2;
      return gx * gx + gy * gy <= tol * tol && su[2] * sv[2] + su[3] * sv[3] <= 0;
    }
    const lateral = i !== F && j !== F && this.type[u] !== T_E && this.type[v] !== T_E && !(this.type[u] === T_M && this.type[v] === T_M)
      && !(i === K && j === K && this.type[u] !== T_M && this.type[v] !== T_M);   // back to back between letters (act rule) is a docking
    // gap between the two side midpoints, and how antiparallel the two sides are
    const gx = dx + sv[0] - su[0], gy = dy + sv[1] - su[1];
    const d0 = (this.size[u] + this.size[v]) / 2;
    const tolD = (lateral ? this.p.linkDistTol : this.p.distTol) * d0;
    if (gx * gx + gy * gy > tolD * tolD) return false;
    const cT = lateral ? this.cosLinkTol : this.cosTol, cR = lateral ? this.cosLinkTol : this.cosTolRot;
    const ux = dx / dist, uy = dy / dist, dock = !lateral && !(this.type[u] === T_M && this.type[v] === T_M);
    if (dock && su[2] * ux + su[3] * uy < cT) return false;          // v lies in front of u's side i (docking)
    if (dock && -(sv[2] * ux + sv[3] * uy) < cT) return false;       // (membrane blocks lean, so for them the sides alone decide)
    return su[2] * sv[2] + su[3] * sv[3] <= -cR;                      // the sides face each other
  }

  _formBond(u, i, v, j) {
    const nb = (x) => (this.bond[x * 4] >= 0) + (this.bond[x * 4 + 1] >= 0) + (this.bond[x * 4 + 2] >= 0) + (this.bond[x * 4 + 3] >= 0);
    if (this.type[u] === T_M && this.type[v] === T_M) { this._link(u, i, v, j); return true; }   // corners already touch
    if (i === F && j === F && this.is[u] === I_TPL && this.is[v] === I_TPL) { this._link(u, i, v, j); return true; }   // binding: both sit in strands, the pins align them
    let a = u, ia = i, m = v, im = j;
    if (nb(u) < nb(v)) { a = v; ia = j; m = u; im = i; }
    const sa = this._side(a, ia, [0, 0, 0, 0]), sm = this._side(m, im, [0, 0, 0, 0]);
    // rotate m rigidly so its side faces a's side, then move it so the two side midpoints coincide
    const rot = Math.atan2(-sa[3], -sa[2]) - Math.atan2(sm[3], sm[2]), c = Math.cos(rot), s = Math.sin(rot);
    const mx = c * sm[0] - s * sm[1], my = s * sm[0] + c * sm[1];
    const tx = this._wx(this.px[a] + sa[0] - mx), ty = this._wy(this.py[a] + sa[1] - my);
    if (!this._slotFree(m, tx, ty)) return false;
    if (this.type[a] !== T_E && this.type[m] !== T_E) {
      for (let k = 0; k < this.corners(m); k++) { const q = m * NV + k, x = this.ox[q], y = this.oy[q]; this.ox[q] = c * x - s * y; this.oy[q] = s * x + c * y; }
      this.pa[m] = wrapAngle(this.pa[m] + rot); this.px[m] = tx; this.py[m] = ty;
    }
    this._link(u, i, v, j);
    return true;
  }

  /** Probability that side i of u and side j of v bond when they meet. This is the compatibility table. */
  compat(u, i, v, j) {
    const p = this.p, tu = this.type[u], tv = this.type[v];
    const su = this.ss[u * 4 + i], sv = this.ss[v * 4 + j];
    if (tu === T_M || tv === T_M) {
      // side to side: two active blocks, or a raw block recruited by an active one
      if (tu === T_M && tv === T_M) return ((su === S.MEM && (sv === S.MEM || sv === S.RAW)) || (su === S.RAW && sv === S.MEM)) && ((i === L && j === R) || (i === R && j === L)) ? p.pMem : 0;
      // a raw membrane block's back meets a MAKE back
      if (tu === T_M) return tv !== T_E && i === K && su === S.RAW && j === K && sv === S.MAKE ? 1 : 0;
      return tu !== T_E && j === K && sv === S.RAW && i === K && su === S.MAKE ? 1 : 0;
    }
    if (tu === T_E || tv === T_E) {
      if (tu === T_E && tv !== T_E) return (j === K && ((su === S.ON && sv === S.WANT) || (su === S.OFF && sv === S.CHARGE))) ? 1 : 0;
      if (tv === T_E && tu !== T_E) return (i === K && ((sv === S.ON && su === S.WANT) || (sv === S.OFF && su === S.CHARGE))) ? 1 : 0;
      return 0;
    }
    if (i === F && j === F) {
      const isTpl = (x) => x === S.TPL_MM || x === S.TPL_LF || x === S.TPL_RF;
      if (isTpl(su) && isTpl(sv)) return COMP[tu] === tv ? p.pHyb : 0;   // binding: two templates, complementary letters (A-B, C-D)
      if (!((su === S.DOCK && isTpl(sv)) || (sv === S.DOCK && isTpl(su)))) return 0;
      return tu === tv ? 1 : p.pSoft;
    }
    if (i === K && j === K) return (su === S.INACT && sv === S.ACT) || (su === S.ACT && sv === S.INACT) ? 1 : 0;   // activation (act rule)
    if ((i === L && j === R) || (i === R && j === L)) {
      const openish = (x) => x === S.STICKY || x === S.END;
      if (su === S.STICKY && sv === S.STICKY) return 1;
      if (openish(su) && openish(sv)) return p.pLigate;
      if ((su === S.INERT && openish(sv)) || (sv === S.INERT && openish(su))) return p.pCapture;
      if (su === S.INERT && sv === S.INERT) return p.pSpont;
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
        if (this.type[u] === T_M) ok = s === S.MEM || s === S.RAW;
        else if (this.type[u] === T_E) ok = s === S.ON || (s === S.OFF && p.motif);
        else if (i === F) ok = s === S.DOCK || s === S.TPL_MM || s === S.TPL_LF || s === S.TPL_RF;
        else if (i === K) ok = s === S.WANT || s === S.CHARGE || s === S.MAKE || s === S.INACT || s === S.ACT;
        else ok = s === S.STICKY || s === S.END || (s === S.INERT && (p.pCapture > 0 || p.pSpont > 0));
        if (ok) m |= 1 << i;
      }
      this.open[u] = m;
    }
  }

  // ------------------------------------------------------------- derived side states
  _derive(u) {
    const b = this.bond, o = u * 4;
    if (this.type[u] === T_M) {
      // an active block's lateral sides link to other active blocks; a raw block shows only its face, which a MAKE back activates
      const on = this.is[u] === I_ON;
      this.ss[o + F] = S.INERT; this.ss[o + K] = b[o + K] >= 0 ? S.BONDED : on ? S.INERT : S.RAW;
      this.ss[o + L] = b[o + L] >= 0 ? S.BONDED : on ? S.MEM : S.RAW; this.ss[o + R] = b[o + R] >= 0 ? S.BONDED : on ? S.MEM : S.RAW;
      return;
    }
    if (this.type[u] === T_E) {
      const s = this.is[u] === I_ON ? S.ON : S.OFF;
      this.ss[o] = this.ss[o + 1] = this.ss[o + 2] = this.ss[o + 3] = s;
      return;
    }
    const bF = b[o + F] >= 0, bL = b[o + L] >= 0, bR = b[o + R] >= 0, nl = (bL ? 1 : 0) + (bR ? 1 : 0);
    const st = this.is[u];
    if (st === I_FRAY) {
      this.ss[o + F] = S.REPEL; this.ss[o + K] = S.IDLE; this.ss[o + L] = S.FRAY; this.ss[o + R] = S.FRAY;
      return;
    }
    if (st === I_RAW) {   // an inactive monomer shows nothing but its back
      this.ss[o + F] = S.IDLE; this.ss[o + L] = S.IDLE; this.ss[o + R] = S.IDLE; this.ss[o + K] = S.INACT;
      return;
    }
    // F
    if (st === I_DOCK) this.ss[o + F] = S.DOCK;
    else if (st === I_REPEL) this.ss[o + F] = S.REPEL;
    else this.ss[o + F] = (bL && bR) ? S.TPL_MM : bL ? S.TPL_RF : S.TPL_LF;
    // L, R. A docked unit's free lateral is sticky only where its template partner's face says the
    // template continues (TPL_MM, or TPL_LF for my L / TPL_RF for my R); at the template's end it is an open end.
    const pf = bF ? this.ss[b[o + F]] : -1;
    const hyb = st === I_TPL && pf >= 0 && pf !== S.DOCK;   // my face is bound to another template's face
    const lat = (bonded, contin) => bonded ? (st === I_TPL ? (hyb ? S.HYB : S.ARMED) : S.BONDED)
      : (st === I_DOCK ? (bF ? (contin ? S.STICKY : S.END) : (nl > 0 ? S.STICKY : S.INERT)) : S.END);
    this.ss[o + L] = lat(bL, pf === S.TPL_MM || pf === S.TPL_LF);
    this.ss[o + R] = lat(bR, pf === S.TPL_MM || pf === S.TPL_RF);
    if (st === I_TPL && (this.p.feed || this.p.shield)) {
      // a B between two As shows FEED on both sides, a D between two Cs SHIELD. With the relay, a template unit also shows
      // on each side what its neighbour on the other side shows toward it, so a signal runs along the strand away from
      // its motif and stops at the ends; it cannot circle without a source.
      const srcF = this.p.feed && bL && bR && this.type[u] === T_B && this.type[b[o + L] >> 2] === T_A && this.type[b[o + R] >> 2] === T_A;
      const srcS = this.p.shield && bL && bR && this.type[u] === T_D && this.type[b[o + L] >> 2] === T_C && this.type[b[o + R] >> 2] === T_C;
      const rel = this.p.relay, ss = this.ss;
      const has = (q, sig) => rel && q >= 0 && (ss[q] === sig || ss[q] === S.FSH);
      const fR = srcF || has(b[o + L], S.FEED), fL = srcF || has(b[o + R], S.FEED);
      const sR = srcS || has(b[o + L], S.SHIELD), sL = srcS || has(b[o + R], S.SHIELD);
      if (bL && (fL || sL)) ss[o + L] = fL && sL ? S.FSH : fL ? S.FEED : S.SHIELD;
      if (bR && (fR || sR)) ss[o + R] = fR && sR ? S.FSH : fR ? S.FEED : S.SHIELD;
    }
    // K. A B template unit flanked by two A units reads CHARGE at its back when the motif rule is on:
    // this is the one place a side's state depends on what its neighbours are (their type is their colour).
    // (K to K bonds no longer exist; the back is for energy only.)
    if (st === I_REPEL) this.ss[o + K] = S.WANT;
    else if (this.p.motif && st === I_TPL && bL && bR && this.type[u] === T_B && this.type[b[o + L] >> 2] === T_A && this.type[b[o + R] >> 2] === T_A) this.ss[o + K] = S.CHARGE;
    else if (this.p.make && st === I_TPL && bL && bR && this.type[u] === T_A && this.type[b[o + L] >> 2] === T_B && this.type[b[o + R] >> 2] === T_B) this.ss[o + K] = S.MAKE;
    else if (this.p.act && st === I_TPL && bL && bR && this.type[u] === this._actMid && this.type[b[o + L] >> 2] === this._actOut && this.type[b[o + R] >> 2] === this._actOut) this.ss[o + K] = S.ACT;
    else this.ss[o + K] = S.IDLE;
  }

  _deriveAll() { for (let u = 0; u < this.n; u++) this._derive(u); }

  // ------------------------------------------------------------- the rule table
  /**
   * Transitions of the internal state. Every rule reads only this unit's state,
   * which of its sides are bonded, and the derived state of a bonded partner side.
   */
  _transition(u) {
    const p = this.p, b = this.bond, o = u * 4;
    if (this.type[u] === T_M) {
      // make rule: a raw block whose face is on a MAKE back turns active and lets go; an active block with no lateral
      // bonds falls back to raw at pMemDecay
      if (this.is[u] === I_OFF) {
        // anchored on a MAKE back, or linked to an active block: activate (and stay bonded)
        if (b[o + K] >= 0 || b[o + L] >= 0 || b[o + R] >= 0) { this.is[u] = I_ON; this.makeEvents++; this._event('make', u); }
        return;
      }
      if (p.pMemDecay > 0 && b[o + L] < 0 && b[o + R] < 0 && b[o + K] < 0 && this.rng() < p.pMemDecay) { this.is[u] = I_OFF; return; }
      if (p.pBreak > 0) {
        const mine = 1 - p.resM;
        for (const side of [L, R]) {
          const q = b[o + side]; if (q < 0) continue;
          const v = q >> 2; if (v < u) continue;
          if (this.rng() < p.pBreak * mine * mine) { this.pendingUnlink.push(o + side); this.breakEvents++; this._event('break', u, v); }
        }
      }
      return;
    }
    if (this.type[u] === T_E) {
      // E: docking on a WANT back spends it; docking on a CHARGE back recharges it. Either way it lets go.
      for (let i = 0; i < 4; i++) {
        const q = b[o + i]; if (q < 0) continue;
        if (this.ss[q] === S.CHARGE) { if (this.is[u] === I_OFF) { this.energyCharged++; this._event('charge', u, q >> 2); } this.is[u] = I_ON; this.pendingUnlink.push(o + i); }
        else { if (this.is[u] === I_ON) { this.energyUsed++; this._event('energy', u); } this.is[u] = I_OFF; }
      }
      return;
    }
    const bF = b[o + F] >= 0, bL = b[o + L] >= 0, bR = b[o + R] >= 0, bK = b[o + K] >= 0;
    const nl = (bL ? 1 : 0) + (bR ? 1 : 0);
    const st = this.is[u], pool = p.act ? I_RAW : I_DOCK;   // what a unit that leaves its strand becomes
    if (st === I_RAW) {
      // A1 activation: my back is on an ACT back; I can dock from now on, and let go
      if (bK) { this.is[u] = I_DOCK; this.pendingUnlink.push(o + K); this.actEvents++; this._event('activate', u); }
      return;
    }
    if (st === I_FRAY) {
      // leaving: every lateral bond goes, and the unit is a free monomer again
      this.is[u] = pool; this.pendingUnlink.push(o + L, o + R);
      return;
    }
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
        // R2 linked laterally without a template (captured by a strand end, or two free monomers that met): a new strand unit
        this.is[u] = I_REPEL; this.fresh[u] = 1; this.parentOf[u] = -1;
      }
    } else if (st === I_REPEL) {
      if (nl === 0) this.is[u] = pool;                                     // R3 lost its strand: back to the pool
      else if (!p.energyGate || (bK && this.ss[b[o + K]] === S.ON)) { this.is[u] = I_TPL; this._event('rearm', u); }  // R4 re-arm (energy)
      else if (p.feed && ((bL && (this.ss[b[o + L]] === S.FEED || this.ss[b[o + L]] === S.FSH)) || (bR && (this.ss[b[o + R]] === S.FEED || this.ss[b[o + R]] === S.FSH)))) { this.is[u] = I_TPL; this.fedEvents++; this._event('rearm', u); }  // R4b re-arm through a bond (feed rule)
    } else { // I_TPL
      if (nl === 0) this.is[u] = pool;                                     // R3
      else if (bF && this.ss[b[o + F]] !== S.DOCK && (b[o + F] >> 2) > u) {
        // binding melts: fast where no neighbour is bound, slowly where one is (rolled once per bond, by its lower end)
        const nh = (bL && this.ss[b[o + L]] === S.HYB ? 1 : 0) + (bR && this.ss[b[o + R]] === S.HYB ? 1 : 0);
        const pm = nh === 0 ? p.pMelt : nh === 2 || p.pMeltEnd < 0 ? p.pMeltRun : p.pMeltEnd;
        if (this.rng() < pm) { this.pendingUnlink.push(o + F); this.meltEvents++; }
      }
    }
    // R5 fraying: an end unit of an undocked strand falls off. With pUnzip > 0 it first reads FRAY for one step,
    // and an undocked neighbour that reads FRAY on its partner side follows it with probability pUnzip (processive fraying).
    if (this.is[u] !== I_DOCK && !bF && nl === 1 && p.pFray > 0 && this.rng() < p.pFray) {
      this.fresh[u] = 0; this.frayEvents++; this._event('fray', u);
      if (p.pUnzip > 0) this.is[u] = I_FRAY;
      else { this.is[u] = pool; this.pendingUnlink.push(o + L, o + R); }
      return;
    }
    if (p.pUnzip > 0 && this.is[u] !== I_DOCK && !bF && ((bL && this.ss[b[o + L]] === S.FRAY) || (bR && this.ss[b[o + R]] === S.FRAY)) && this.rng() < p.pUnzip) {
      this.is[u] = I_FRAY; this.fresh[u] = 0; this.unzipEvents++;
      return;
    }
    // R7 radiation: each of my lateral bonds breaks with probability pBreak scaled by how fragile the two blocks are.
    // A docked copy re-links at once (its neighbours are still flush and sticky), so a template shields its copy.
    if (p.pBreak > 0 && nl > 0) {
      const mine = 1 - typeParam(p, 'res', this.type[u], 0);
      for (const side of [L, R]) {
        const q = b[o + side]; if (q < 0) continue;
        const v = q >> 2; if (v < u) continue;   // each bond is rolled once, by its lower-numbered end
        const s1 = this.ss[o + side], s2 = this.ss[q];
        if (s1 === S.SHIELD || s1 === S.FSH || s2 === S.SHIELD || s2 === S.FSH) continue;   // shield rule: a shielded bond does not break
        const theirs = 1 - typeParam(p, 'res', this.type[v], 0);
        if (this.rng() < p.pBreak * mine * theirs) { this.pendingUnlink.push(o + side); this.breakEvents++; this._event('break', u, v); }
      }
    }
  }

  _event(kind, u, v) {
    if (this.p.maxEventLog <= 0) return;
    this.events.push({ t: this.t, kind, u, v: v === undefined ? -1 : v });
    if (this.events.length > this.p.maxEventLog) this.events.splice(0, this.events.length - this.p.maxEventLog);
  }

  // ------------------------------------------------------------- observation: components, chains, births
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

  /** A closed L->R cycle of A/B units in a unit list, if there is one (a ring, possibly with monomers docked on it). */
  cycleOf(units, want) {
    const seen = this._seen, isM = want === T_M;
    let cyc = [];
    for (const start of units) {
      if ((isM ? this.type[start] !== T_M : (this.type[start] === T_E || this.type[start] === T_M)) || seen[start] || this.bond[start * 4 + L] < 0 || this.bond[start * 4 + R] < 0) continue;
      const c = []; let u = start;
      while (u >= 0 && !seen[u] && c.length < 100000) { seen[u] = 1; c.push(u); const q = this.bond[u * 4 + R]; u = q < 0 ? -1 : q >> 2; }
      if (u === start && c.length >= 3) { cyc = c; break; }
    }
    for (const u of units) seen[u] = 0;
    return cyc;
  }

  /** The longest L->R chain of A/B units in a unit list, as an array of unit indices; a ring counts as a chain from an arbitrary start. */
  chainOf(units) {
    let best = this.cycleOf(units);
    for (const start of units) {
      if (this.type[start] === T_E || this.type[start] === T_M || this.bond[start * 4 + L] >= 0) continue;
      const c = []; let u = start;
      while (u >= 0 && c.length < 100000) { c.push(u); const q = this.bond[u * 4 + R]; u = q < 0 ? -1 : q >> 2; }
      if (c.length > best.length) best = c;
    }
    return best;
  }

  /** True if the A/B units contain a closed ring. */
  isRing(units) { return this.cycleOf(units).length >= 3; }
  /** Units (of any type) whose centres lie inside the polygon through the given ring's centres. */

  enclosedBy(ring) {
    const ox = this.px[ring[0]], oy = this.py[ring[0]];
    const poly = ring.map((u) => [this._dx(this.px[u] - ox), this._dy(this.py[u] - oy)]);
    const out = [];
    for (let u = 0; u < this.n; u++) {
      if (ring.includes(u)) continue;
      const x = this._dx(this.px[u] - ox), y = this._dy(this.py[u] - oy);
      let inside = false;
      for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
        const [xa, ya] = poly[a], [xb, yb] = poly[b];
        if ((ya > y) !== (yb > y) && x < (xb - xa) * (y - ya) / (yb - ya) + xa) inside = !inside;
      }
      if (inside) out.push(u);
    }
    return out;
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

  /** Bond formation between two open units that are within docking distance: first compatible, well-placed side pair wins. */
  _tryBond(u, v, dx, dy, d) {
    const rng = this.rng;
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
        if (i === F && j === F && this.is[u] === I_TPL && this.is[v] === I_TPL) { this.hybEvents++; this._event('bind', u, v); }
        else if (i === F && j === F) { this.dockEvents++; if (this.type[u] !== this.type[v]) this.softDockEvents++; this._event('dock', u, v); }
        else if (i !== K && j !== K && this.type[u] !== T_E && this.type[v] !== T_E) {
          if (su === S.STICKY && sv === S.STICKY) this._event('link', u, v);
          else if (su === S.INERT && sv === S.INERT) { this.spontEvents++; this._event('spont', u, v); }
          else if (su === S.INERT || sv === S.INERT) { this.captureEvents++; this._event('capture', su === S.INERT ? u : v, su === S.INERT ? v : u); }
          else { this.ligateEvents++; this._event('ligate', u, v); }
        }
        this.open[u] &= ~(1 << i); this.open[v] &= ~(1 << j);
        break;
      }
    }
  }

  // ------------------------------------------------------------- one step
  step() {
    this.t++;
    this._physics();
    this._formBonds();
    this._chemistry();
  }

  /** Jostling; one neighbour scan; then pins, contacts and shape relaxation solved together. Leaves the hash built. */
  _physics() {
    const p = this.p, n = this.n;
    const px = this.px, py = this.py, pa = this.pa, ox = this.ox, oy = this.oy, rad = this.rad, bond = this.bond, wt = this.w, wr = this.wr, vw = this.vw;
    const W = p.W, H = p.H, gw = this.gw, gh = this.gh, cell = this.cell, head = this.head, next = this.next;
    // 1. Brownian jostling: each block translates and turns as a whole (its shape changes only under pins)
    for (let u = 0; u < n; u++) {
      const ub = u * 4, slow = p.mobS !== 1 && this.type[u] !== T_E && (bond[ub] >= 0 || bond[ub + 1] >= 0 || bond[ub + 2] >= 0 || bond[ub + 3] >= 0);
      const sw = this.type[u] === T_E ? Math.sqrt(wt[u]) * p.mobE : slow ? Math.sqrt(wt[u]) * p.mobS : Math.sqrt(wt[u]);
      px[u] = this._wx(px[u] + p.sigma * sw * this._gauss()); py[u] = this._wy(py[u] + p.sigma * sw * this._gauss());
      const da = p.sigmaRot * wt[u] * (slow ? p.mobS : 1) * this._gauss(), c = Math.cos(da), s = Math.sin(da);
      pa[u] += da;
      for (let k = u * NV, e = k + this.nv[this.type[u]]; k < e; k++) { const x = ox[k], y = oy[k]; ox[k] = c * x - s * y; oy[k] = s * x + c * y; }
    }
    this._buildHash();
    // 2. one neighbour scan: every pair of units whose centres are within reach, for contacts now and bonding after
    const pairs = this.pairs; pairs.length = 0;
    const reach = this.reach;
    for (let u = 0; u < n; u++) {
      const x = px[u], y = py[u];
      const cx = Math.min(gw - 1, (x / cell) | 0), cy = Math.min(gh - 1, (y / cell) | 0);
      for (let oyy = -1; oyy <= 1; oyy++) {
        const row = ((cy + oyy + gh) % gh) * gw;
        for (let oxx = -1; oxx <= 1; oxx++) {
          for (let v = head[row + (cx + oxx + gw) % gw]; v >= 0; v = next[v]) {
            if (v <= u) continue;
            let dx = px[v] - x; dx -= W * Math.round(dx / W);
            let dy = py[v] - y; dy -= H * Math.round(dy / H);
            if (dx * dx + dy * dy < reach * reach) pairs.push(u, v);
          }
        }
      }
    }
    // contacts: the pairs that are not bonded and close enough that they might touch during the solve
    const contacts = this._contacts || (this._contacts = []); contacts.length = 0;
    for (let k = 0; k < pairs.length; k += 2) {
      const u = pairs[k], v = pairs[k + 1], ub = u * 4;
      let dx = px[v] - px[u]; dx -= W * Math.round(dx / W);
      let dy = py[v] - py[u]; dy -= H * Math.round(dy / H);
      const rr = (rad[u] + rad[v]) * 1.3;
      if (dx * dx + dy * dy >= rr * rr) continue;
      if ((bond[ub] >> 2) === v || (bond[ub + 1] >> 2) === v || (bond[ub + 2] >> 2) === v || (bond[ub + 3] >> 2) === v) continue;
      contacts.push(u, v);
    }
    // 3. constraints
    this._bondList();
    const pins = this.pins, soft = this._soft || (this._soft = []);
    for (let t = 0; t < NT; t++) soft[t] = t === T_E ? 0 : 1 - typeParam(p, 'stiff', t, 1);
    const bonded = this._bondedUnits || (this._bondedUnits = []); bonded.length = 0;
    const mark = this._seen;
    for (let k = 0; k < pins.length; k++) { const u = (pins[k] / NV) | 0; if (!mark[u]) { mark[u] = 1; bonded.push(u); } }
    for (const u of bonded) mark[u] = 0;
    for (let it = 0; it < p.iters; it++) {
      for (let k = 0; k < contacts.length; k += 2) {
        const u = contacts[k], v = contacts[k + 1];
        let dx = px[v] - px[u]; dx -= W * Math.round(dx / W);
        let dy = py[v] - py[u]; dy -= H * Math.round(dy / H);
        const rr = rad[u] + rad[v];
        const d2 = dx * dx + dy * dy; if (d2 >= rr * rr) continue;
        const d = Math.sqrt(d2) || 1e-6;
        const push = (rr - d) / d, wu = wt[u], wv = wt[v], ws = wu + wv;
        const fx = dx * push, fy = dy * push;
        px[u] -= fx * wu / ws; py[u] -= fy * wu / ws;
        px[v] += fx * wv / ws; py[v] += fy * wv / ws;
      }
      for (let k = 0; k < pins.length; k += 2) {
        // a pin brings two corners together. Each unit takes its share of the correction partly as a rigid move
        // (translate and turn: a point constraint on a rigid body) and, by its softness, partly as a deformation of
        // that one corner
        const qa = pins[k], qb = pins[k + 1], u = (qa / NV) | 0, v = (qb / NV) | 0;
        let dx = px[v] + ox[qb] - px[u] - ox[qa]; dx -= W * Math.round(dx / W);
        let dy = py[v] + oy[qb] - py[u] - oy[qa]; dy -= H * Math.round(dy / H);
        const dl = Math.sqrt(dx * dx + dy * dy); if (dl < 1e-9) continue;
        const nx = dx / dl, ny = dy / dl;
        const cu = ox[qa] * ny - oy[qa] * nx, cv = ox[qb] * ny - oy[qb] * nx;
        const eu = wt[u] + wr[u] * cu * cu, ev = wt[v] + wr[v] * cv * cv;
        const lam = dl / (eu + ev), su = soft[this.type[u]], sv = soft[this.type[v]];
        this._rigidMove(u, nx * lam * wt[u] * (1 - su), ny * lam * wt[u] * (1 - su), wr[u] * cu * lam * (1 - su));
        this._rigidMove(v, -nx * lam * wt[v] * (1 - sv), -ny * lam * wt[v] * (1 - sv), -wr[v] * cv * lam * (1 - sv));
        if (su > 0) { ox[qa] += nx * lam * eu * su; oy[qa] += ny * lam * eu * su; }
        if (sv > 0) { ox[qb] -= nx * lam * ev * sv; oy[qb] -= ny * lam * ev * sv; }
      }
      for (const u of bonded) {
        const t = this.type[u];
        if (soft[t] === 0) continue;
        // shape matching: best-fit rotation of the rest shape onto the corners, then pull toward it by the stiffness;
        // the centre is re-read as the mean of the corners
        const o = u * NV, r = t * NV, nv = this.nv[t];
        let mx = 0, my = 0;
        for (let k = 0; k < nv; k++) { mx += ox[o + k]; my += oy[o + k]; }
        mx /= nv; my /= nv; px[u] += mx; py[u] += my;
        let A = 0, B = 0;
        for (let k = 0; k < nv; k++) { ox[o + k] -= mx; oy[o + k] -= my; A += this.rx[r + k] * ox[o + k] + this.ry[r + k] * oy[o + k]; B += this.rx[r + k] * oy[o + k] - this.ry[r + k] * ox[o + k]; }
        const th = Math.atan2(B, A), c = Math.cos(th), s = Math.sin(th), a = 1 - soft[t];
        for (let k = 0; k < nv; k++) {
          const gx = c * this.rx[r + k] - s * this.ry[r + k], gy = s * this.rx[r + k] + c * this.ry[r + k];
          ox[o + k] += a * (gx - ox[o + k]); oy[o + k] += a * (gy - oy[o + k]);
        }
        pa[u] = th;
      }
    }
    for (let u = 0; u < n; u++) { px[u] = this._wx(px[u]); py[u] = this._wy(py[u]); pa[u] = wrapAngle(pa[u]); }
    if (p.memStrain > 0) {
      // strain: a membrane bond whose corners the solver could not bring together lets go (applied with the rule breaks)
      const lim2 = p.memStrain * p.memStrain, bl = this.bonds;
      for (let k = 0, q = 0; k < bl.length; k++) {
        const u = bl[k] >> 2, v = this.bond[bl[k]] >> 2;
        if (this.type[u] === T_E || this.type[v] === T_E) continue;
        const a0 = pins[q], b0 = pins[q + 1], a1 = pins[q + 2], b1 = pins[q + 3]; q += 4;
        if (this.type[u] !== T_M || this.type[v] !== T_M) continue;
        let g = 0;
        for (const [qa, qb] of [[a0, b0], [a1, b1]]) {
          let dx = px[v] + ox[qb] - px[u] - ox[qa]; dx -= W * Math.round(dx / W);
          let dy = py[v] + oy[qb] - py[u] - oy[qa]; dy -= H * Math.round(dy / H);
          g = Math.max(g, dx * dx + dy * dy);
        }
        if (g > lim2) { this.pendingUnlink.push(bl[k]); this.strainEvents++; this._event('snap', u, v); }
      }
    }
    this._buildHash();   // for the empty-slot check when bonds form
  }

  /** Every pair of open units from this step's neighbour scan that is within docking distance gets a chance to bond. */
  _formBonds() {
    const p = this.p, px = this.px, py = this.py, open = this.open, size = this.size, pairs = this.pairs, W = p.W, H = p.H;
    for (let k = 0; k < pairs.length; k += 2) {
      const u = pairs[k], v = pairs[k + 1];
      if (!open[u] || !open[v]) continue;
      let dx = px[v] - px[u]; dx -= W * Math.round(dx / W);
      let dy = py[v] - py[u]; dy -= H * Math.round(dy / H);
      const d0 = (size[u] + size[v]) / 2, d2 = dx * dx + dy * dy;
      const dmax = d0 * (1 + p.distTol), dmin = d0 * (1 - p.distTol);
      if (d2 > dmax * dmax || d2 < dmin * dmin) continue;
      this._tryBond(u, v, dx, dy, Math.sqrt(d2));
    }
  }

  /** Transitions, bond holding, births, energy reload. */
  _chemistry() {
    const p = this.p, n = this.n, rng = this.rng;
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
      if (rng() < p.pReload) this.is[u] = I_ON;
    }
    for (let u = 0; u < n; u++) if (this.type[u] === T_E) this._derive(u);
    this._computeOpen();
    // a unit that has lost every bond springs back to its rest shape; only units pinned this step can be out of shape
    for (const u of this._bondedUnits || []) {
      if (this.bond[u * 4] < 0 && this.bond[u * 4 + 1] < 0 && this.bond[u * 4 + 2] < 0 && this.bond[u * 4 + 3] < 0) this._resetShape(u);
    }
  }

  run(steps) { for (let i = 0; i < steps; i++) this.step(); }

  // ------------------------------------------------------------- observation
  // ------------------------------------------------------------- observation
  stats() {
    const n = this.n;
    let inactive = 0, totalAct = 0, free = 0, eOn = 0, eOff = 0, repel = 0, tpl = 0, docked = 0, bonds = 0, totalMotif = 0, memActive = 0;
    for (let u = 0; u < n; u++) {
      if (this.type[u] === T_M) { if (this.is[u] === I_ON) memActive++; continue; }
      if (this.type[u] === T_E) { if (this.is[u] === I_ON) eOn++; else eOff++; continue; }
      const o = u * 4;
      if (this.ss[o + K] === S.CHARGE) totalMotif++;
      if (this.is[u] === I_DOCK && this.bond[o] < 0 && this.bond[o + L] < 0 && this.bond[o + R] < 0) free++;
      if (this.is[u] === I_RAW) inactive++;
      if (this.ss[o + K] === S.ACT) totalAct++;
      if (this.is[u] === I_DOCK && this.bond[o] >= 0) docked++;
      if (this.is[u] === I_REPEL) repel++;
      if (this.is[u] === I_TPL) tpl++;
      for (let i = 0; i < 4; i++) if (this.bond[o + i] >= 0) bonds++;
    }
    const hist = new Map(); const seqs = new Map();
    let strands = 0, complexes = 0, totalLen = 0, maxLen = 0, components = 0, rings = 0, ringLen = 0;
    let memRings = 0, memRingLen = 0, memArcs = 0, enclosedAB = 0, enclosedE = 0, memFree = 0, enclosedTPL = 0, enclosedMotif = 0, ringsWithStrand = 0;
    const seen = new Uint8Array(n);
    for (let u0 = 0; u0 < n; u0++) {
      if (seen[u0]) continue;
      const comp = this.componentOf(u0);
      for (const x of comp) seen[x] = 1;
      components++;
      if (this.type[u0] === T_M) {
        if (comp.length === 1) { memFree++; continue; }
        const cyc = this.cycleOf(comp, T_M);
        if (cyc.length >= 3) {
          memRings++; memRingLen += cyc.length;
          let tplHere = 0;
          for (const w of this.enclosedBy(cyc)) {
            if (this.type[w] === T_E) enclosedE++;
            else if (this.type[w] !== T_M) { enclosedAB++; if (this.is[w] === I_TPL) { enclosedTPL++; tplHere++; } if (this.ss[w * 4 + K] === S.CHARGE) enclosedMotif++; }
          }
          if (tplHere >= 2) ringsWithStrand++;
        } else memArcs++;
        continue;
      }
      let nAB = 0, faceBonded = false;
      for (const u of comp) { if (this.type[u] === T_E || this.type[u] === T_M) continue; nAB++; if (this.bond[u * 4 + F] >= 0) faceBonded = true; }
      if (nAB < 2) continue;
      // length and sequence are read off the longest chain, so a template that is being copied still counts
      const chain = this.chainOf(comp), len = chain.length;
      if (this.isRing(comp)) { rings++; ringLen += len; }
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
      ligations: this.ligateEvents, frays: this.frayEvents, undocks: this.undockEvents, spont: this.spontEvents, breaks: this.breakEvents, unzips: this.unzipEvents, fed: this.fedEvents, made: this.makeEvents, binds: this.hybEvents, melts: this.meltEvents, activations: this.actEvents, inactive, totalAct, snaps: this.strainEvents,
      energyCharged: this.energyCharged, bodies: components, rings, meanRingLen: rings ? ringLen / rings : 0,
      memRings, meanMemRingLen: memRings ? memRingLen / memRings : 0, memActive, memArcs, memFree, enclosedAB, enclosedE, enclosedTPL, enclosedMotif, totalMotif, ringsWithStrand,
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
    for (let k = 0; k < this.n * NV; k++) if (!Number.isFinite(this.ox[k]) || !Number.isFinite(this.oy[k])) { errs.push(`corner ${k} not finite`); break; }
    return errs;
  }
}


return { Sim, NV, NT, COMP, DEFAULTS, REMOVED, S, SNAME, F, R, K, L, T_A, T_B, T_C, T_D, T_E, T_M, TNAME, LETTERS, I_DOCK, I_REPEL, I_TPL, I_FRAY, I_RAW, I_ON, I_OFF, SIDE_NAME, mulberry32 };
});
