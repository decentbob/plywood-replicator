// Random chemistry (RESULTS.md, section 32): the polygon world with its hand-made rule table replaced by a random one.
// The user's question, 2026-09-24: drop simple blocks with randomly assigned sides (different attractions) and random side
// switching rules into a world; too much chaos, or enough for complexity to emerge?
//
// A block has a type (one of K) and an internal state (one of NS, all start in state 0). What each of its four sides shows
// is a colour, looked up from (type, state, side): colour 0 is inert. Two sides meeting bond with a probability from a
// random symmetric colour table; a bond holds while the two colours still attract (and breaks at rBreak per step anyway).
// The only rules: when side i of a block in state s is bonded to a side showing colour c (or is free: c = NC), the block
// may switch to another state, with a probability. So a block reads its own type and state, which sides are bonded, and the
// colour of the side it is bonded to: exactly the locality of the hand-made table, and the hand-made table (docking,
// linking, release) is one point of this space. Nothing in here knows about copying.
//
// Browser: load after sim.js (PolyChem.RChem). Node: const { RChem, randomTable } = require('./src/rchem.js').
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(require('./sim.js'));
  else root.PolyChem.RChem = factory(root.PolyChem).RChem;
})(typeof self !== 'undefined' ? self : this, function (PC) {
  const { Sim, NV, LETTERS, mulberry32, TNAME } = PC;
  const TAU = 2 * Math.PI;

  /** A random table from a seed. K types, NS states, NC colours (0 inert). Densities: pAff of colour pairs attract, pRule of
   * (type, state, side, colour) combinations carry a switching rule. */
  function randomTable(o) {
    const r = mulberry32(o.chemSeed || 1), pick = (a) => a[Math.floor(r() * a.length)];
    const K = o.K || 3, NS = o.NS || 3, NC = o.NC || 4;
    const show = [];   // show[t][s][i]
    for (let t = 0; t < K; t++) { show.push([]); for (let s = 0; s < NS; s++) { const q = []; for (let i = 0; i < 4; i++) q.push(r() < (o.pInert ?? 0.3) ? 0 : 1 + Math.floor(r() * (NC - 1))); show[t].push(q); } }
    const aff = []; for (let c = 0; c < NC; c++) aff.push(new Array(NC).fill(0));
    for (let c = 1; c < NC; c++) for (let d = c; d < NC; d++) if (r() < (o.pAff ?? 0.3)) aff[c][d] = aff[d][c] = pick([1, 0.3, 0.1, 0.03]);
    const rule = [];   // rule[t][s][i][c] = [to, prob] or null; c = NC means the side is free
    for (let t = 0; t < K; t++) { rule.push([]); for (let s = 0; s < NS; s++) { rule[t].push([]); for (let i = 0; i < 4; i++) {
      const q = []; for (let c = 0; c <= NC; c++) {
        let e = null;
        if (c > 0 && NS > 1 && r() < (c === NC ? (o.pRuleFree ?? 0.05) : (o.pRule ?? 0.2))) { let to = Math.floor(r() * (NS - 1)); if (to >= s) to++; e = [to, c === NC ? pick([0.01, 0.001]) : pick([1, 0.3, 0.03])]; }
        q.push(e);
      }
      rule[t][s].push(q);
    } } }
    return { K, NS, NC, show, aff, rule };
  }

  /** A hand-written table in the same format that copies strands (the positive control): letters A and B, each pairing with
   * its own kind. States: 0 free, 1 docked, 2 docked and linked on the right (or needing no right link), 3 the same on the
   * left, 4 released, 5 in a strand, 6 left end of a strand, 7 right end. A docked monomer links to its docked neighbours
   * and lets go of the template once every link its template position needs is made; a released block becomes a strand
   * block, and a strand block whose side is free becomes an end, which is how a docked monomer knows its template ends
   * (face to face, a docked block's right lies over the template's left: a left-end template means no right link is due).
   * Ends show nothing on their free side (strands do not fuse) and fray back into monomers at pFray; a docked block that
   * has no link yet falls off at pUndock (cooperative docking, as in the hand-made table). */
  function copyTable(pFray = 0.0003, pUndock = 0.01) {
    const K = 2, NS = 9, lk = 9, dl = 10, NC = 11;
    const fm = [1, 2], tm = [3, 6], tL = [4, 7], tR = [5, 8];   // per type: monomer face, template face, left-end face, right-end face
    const show = [], rule = [], aff = [];
    for (let c = 0; c < NC; c++) aff.push(new Array(NC).fill(0));
    const set = (c, d) => { aff[c][d] = aff[d][c] = 1; };
    set(lk, lk); set(dl, dl); set(dl, lk);   // docked blocks link with dl, strand blocks hold with lk
    for (let t = 0; t < K; t++) {
      for (const f of [tm[t], tL[t], tR[t]]) set(fm[t], f);
      show.push([[fm[t], 0, 0, 0], [fm[t], dl, 0, dl], [fm[t], dl, 0, dl], [fm[t], dl, 0, dl], [0, lk, 0, lk], [tm[t], lk, 0, lk], [tL[t], lk, 0, 0], [tR[t], 0, 0, lk], [0, 0, 0, 0]]);   // an end shows nothing on its free side: no fusion
      const r = []; for (let st = 0; st < NS; st++) { r.push([]); for (let i = 0; i < 4; i++) r[st].push(new Array(NC + 1).fill(null)); }
      const on = (st, side, c, to) => { r[st][side][c] = [to, 1]; };
      const F = 0, R = 1, L = 3, FREE = NC;
      for (const f of [tm[t], tL[t], tR[t]]) on(0, F, f, 1);
      // a docked block with no link yet lets go at pUndock (state 8 shows nothing, so every bond breaks, then it is free)
      r[1][F][tm[t]] = [8, pUndock]; on(1, F, tL[t], 2); on(1, F, tR[t], 3); on(1, R, dl, 2); on(1, R, lk, 2); on(1, L, dl, 3); on(1, L, lk, 3); on(1, F, FREE, 0);
      on(2, F, tR[t], 4); on(2, L, dl, 4); on(2, L, lk, 4); on(2, F, FREE, 4);
      on(3, F, tL[t], 4); on(3, R, dl, 4); on(3, R, lk, 4); on(3, F, FREE, 4);
      r[2][F][tm[t]] = [8, pUndock / 10]; r[3][F][tm[t]] = [8, pUndock / 10];   // a half-linked one that waits too long lets go too
      on(8, F, FREE, 0);
      on(4, F, FREE, 5);
      on(5, R, FREE, 7); on(5, L, FREE, 6);
      // an end block frays (goes back to a free monomer, which lets go of its neighbour) at pFray; a lone one at once
      on(6, R, FREE, 0); r[6][L][FREE] = [0, pFray]; on(7, L, FREE, 0); r[7][R][FREE] = [0, pFray];
      rule.push(r);
    }
    return { K, NS, NC, show, aff, rule };
  }

  const RDEFAULTS = { K: 3, NS: 3, NC: 4, chemSeed: 1, pInert: 0.3, pAff: 0.3, pRule: 0.2, pRuleFree: 0.05, rBreak: 0.0002, nEach: 100 };

  class RChem extends Sim {
    constructor(params) {
      const o = Object.assign({}, RDEFAULTS, params || {});
      const tab = o.table || randomTable(o);
      const counts = {}; for (let t = 0; t < 6; t++) counts['n' + TNAME[LETTERS[t]]] = t < tab.K ? (o['n' + TNAME[LETTERS[t]]] ?? o.nEach) : 0;
      super(Object.assign({ W: 25, H: 25, nE: 0, seedCount: 0, maxEventLog: 0, maxBirthLog: 0, snapCorners: true }, o, counts, { _tab: tab }));
    }

    /** Seed strands (a sequence of letters, 'A' is the first type) in state st, placed like the hand-made world's seeds. */
    seedChains(seqs, st) {
      for (const q of seqs) {
        const u = this.seedStrand(this.rng() * this.p.W, this.rng() * this.p.H, this.rng() * TAU, q.length, q);
        if (u) for (const x of u) this.is[x] = st;
      }
      this._deriveAll(); this._computeOpen();
    }

    _ti(u) { return LETTERS.indexOf(this.type[u]); }

    _derive(u) {
      const tab = this.p._tab, sh = tab.show[this._ti(u)][this.is[u]], o = u * 4;
      for (let i = 0; i < 4; i++) this.ss[o + i] = sh[i];
    }

    _computeOpen() {
      const aff = this.p._tab.aff, NC = this.p._tab.NC;
      const any = this._any || (this._any = aff.map((row) => row.some((x) => x > 0)));
      for (let u = 0; u < this.n; u++) {
        let m = 0; for (let i = 0; i < 4; i++) if (this.bond[u * 4 + i] < 0 && any[this.ss[u * 4 + i]]) m |= 1 << i;
        this.open[u] = m;
      }
      void NC;
    }

    compat(u, i, v, j) { return this.p._tab.aff[this.ss[u * 4 + i]][this.ss[v * 4 + j]]; }

    _formBond(u, i, v, j) {
      // generic: the block with fewer bonds turns and moves so its side meets the other's
      const nb = (x) => (this.bond[x * 4] >= 0) + (this.bond[x * 4 + 1] >= 0) + (this.bond[x * 4 + 2] >= 0) + (this.bond[x * 4 + 3] >= 0);
      let a = u, ia = i, m = v, im = j;
      if (nb(u) < nb(v)) { a = v; ia = j; m = u; im = i; }
      if (nb(m) > 0) { this._link(u, i, v, j); return true; }   // both already held: the pins pull them together
      const sa = this._side(a, ia, [0, 0, 0, 0]), sm = this._side(m, im, [0, 0, 0, 0]);
      const rot = Math.atan2(-sa[3], -sa[2]) - Math.atan2(sm[3], sm[2]), c = Math.cos(rot), s = Math.sin(rot);
      const mx = c * sm[0] - s * sm[1], my = s * sm[0] + c * sm[1];
      const tx = this._wx(this.px[a] + sa[0] - mx), ty = this._wy(this.py[a] + sa[1] - my);
      if (!this._slotFree(m, tx, ty)) return false;
      for (let k = 0; k < this.corners(m); k++) { const q = m * NV + k, x = this.ox[q], y = this.oy[q]; this.ox[q] = c * x - s * y; this.oy[q] = s * x + c * y; }
      let pa = (this.pa[m] + rot) % TAU; if (pa < 0) pa += TAU; this.pa[m] = pa; this.px[m] = tx; this.py[m] = ty;
      this._link(u, i, v, j);
      return true;
    }

    _chemistry() {
      const tab = this.p._tab, n = this.n, rng = this.rng, NC = tab.NC, bond = this.bond, ss = this.ss;
      this.brokeF.length = 0;
      // switching rules, synchronous (all read the colours derived last step)
      const next = this._next || (this._next = new Uint8Array(n));
      for (let u = 0; u < n; u++) {
        next[u] = this.is[u];
        const rs = tab.rule[this._ti(u)][this.is[u]];
        for (let i = 0; i < 4; i++) {
          const q = bond[u * 4 + i], e = rs[i][q < 0 ? NC : ss[q]];
          if (e && (e[1] >= 1 || rng() < e[1])) { next[u] = e[0]; this.switches++; break; }
        }
      }
      for (let u = 0; u < n; u++) this.is[u] = next[u];
      this._deriveAll();
      // a bond holds while its two colours attract; thermal breaks
      for (let u = 0; u < n; u++) for (let i = 0; i < 4; i++) {
        const q = bond[u * 4 + i]; if (q < 0 || (q >> 2) < u) continue;
        if (tab.aff[ss[u * 4 + i]][ss[q]] <= 0 || rng() < this.p.rBreak) { this._unlink(u, i); this.breaks++; }
      }
      this.brokeF.length = 0;
      this._computeOpen();
      for (const u of this._bondedUnits || []) if (bond[u * 4] < 0 && bond[u * 4 + 1] < 0 && bond[u * 4 + 2] < 0 && bond[u * 4 + 3] < 0) this._resetShape(u);
    }

    _init() { this.switches = 0; this.breaks = 0; super._init(); }

    /** Observation: the bonded components, each with a signature (a Weisfeiler-Lehman hash of its graph of (type, state)
     * blocks joined side to side), so identical assemblies can be counted. */
    assemblies(minSize = 2) {
      const n = this.n, seen = new Uint8Array(n), out = [];
      for (let s0 = 0; s0 < n; s0++) {
        if (seen[s0]) continue;
        const comp = this.componentOf(s0); for (const x of comp) seen[x] = 1;
        if (comp.length < minSize) continue;
        let lab = new Map(comp.map((u) => [u, this._ti(u) * 16 + this.is[u]]));
        for (let it = 0; it < 3; it++) {
          const nl = new Map();
          for (const u of comp) {
            const parts = [];
            for (let i = 0; i < 4; i++) { const q = this.bond[u * 4 + i]; if (q >= 0) parts.push(i * 4 + (q & 3) + ':' + lab.get(q >> 2)); }
            parts.sort(); nl.set(u, hash(lab.get(u) + '|' + parts.join(',')));
          }
          lab = nl;
        }
        const sig = comp.length + '#' + hash([...lab.values()].sort((a, b) => a - b).join(','));
        out.push({ size: comp.length, sig });
      }
      return out;
    }

    /** One snapshot: how many blocks are bonded, component sizes, and repeats of identical assemblies of size >= 4. */
    census() {
      const as = this.assemblies(2), bySig = new Map();
      let bonded = 0, largest = 0;
      for (const a of as) { bonded += a.size; largest = Math.max(largest, a.size); if (a.size >= 4) bySig.set(a.sig, (bySig.get(a.sig) || 0) + 1); }
      let top = 0, topSize = 0, repeat = 0, kinds = 0, top6 = 0, top6Size = 0, repeat6 = 0;
      for (const [sig, c] of bySig) {
        const size = Number(sig.split('#')[0]);
        kinds++; if (c >= 2) repeat += (c - 1) * size;
        if (c > top || (c === top && size > topSize)) { top = c; topSize = size; }
        if (size >= 6) { if (c >= 2) repeat6 += (c - 1) * size; if (c > top6 || (c === top6 && size > top6Size)) { top6 = c; top6Size = size; } }
      }
      return { t: this.t, comps: as.length, bonded, largest, kinds, top, topSize, repeat, top6, top6Size, repeat6, switches: this.switches, breaks: this.breaks };
    }
  }

  function hash(s) { let h = 2166136261; for (let k = 0; k < s.length; k++) { h ^= s.charCodeAt(k); h = Math.imul(h, 16777619); } return h >>> 0; }

  return { RChem, randomTable, copyTable, RDEFAULTS };
});
