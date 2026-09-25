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
const T_A = 0, T_B = 1, T_E = 2, T_M = 3, T_C = 4, T_D = 5, T_X = 6, T_P = 7, T_Q = 8, T_J = 9, T_G = 10;   // A, B, C, D are the replicator letters (each pairs with its own kind); X is a ray; P, Q are caps; J is a hub; G is droplet material
const T_1 = 11, T_2 = 12, T_3 = 13, T_4 = 14;   // product blocks (translate rule): a second polymer made on the backs of template strands
const T_U = 15, T_V = 16;   // fuel particles of two kinds (grip and pocket rules), each with its own size: held in the pockets of folded strands
const NT = 17;
const isFuel = (t) => t === T_U || t === T_V;
const isKT = (x) => x === 42 || x === 43 || x === 44;   // a back that templates (S.KT_MM, S.KT_LF, S.KT_RF; backCopy rule)
const PRODUCTS = [T_1, T_2, T_3, T_4];
const isProd = (t) => t >= T_1 && t <= T_4;
const NV = 8;   // most corners a unit can have
const TNAME = ['A', 'B', 'E', 'M', 'C', 'D', 'X', 'P', 'Q', 'J', 'G', '1', '2', '3', '4', 'U', 'V'];
const LETTERS = [T_A, T_B, T_C, T_D, T_P, T_Q];
/** The type of a letter character ('A'..'D', or the caps 'P', 'Q'); -1 if none. */
function letterType(ch) { const k = 'ABCDPQ1234'.indexOf(String(ch).toUpperCase()); return k < 0 ? -1 : k < 6 ? LETTERS[k] : PRODUCTS[k - 6]; }   // (product kinds '1'..'4' too, for seeding)
/** What a letter docks on: its own kind, except caps, which pair with each other (a copy lies reversed on its template). */
const PAIR = [T_A, T_B, -1, -1, T_C, T_D, -1, T_Q, T_P, -1];
/** Binding partners: A with B, C with D (copying pairs each letter with itself, binding with its complement). */
const COMP = [T_B, T_A, -1, -1, T_D, T_C, -1, -1, -1, -1];
/** A per-type parameter: p[base + letter], e.g. stiffC; dflt where the type has none (E has no stiffness knob). */
function typeParam(p, base, t, dflt) { const v = p[base + TNAME[t]]; return v === undefined ? dflt : v; }

// internal states
const I_DOCK = 0, I_REPEL = 1, I_TPL = 2, I_FRAY = 3, I_RAW = 4, I_HOLD = 5;   // A / B (RAW: an inactive free monomer, act rule; HOLD: a
                                                                             // finished copy still holding the back it was made on, stack rule)
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
  ANC: 27,                                              // L, R of an active membrane block, bonded, passing on the anchor signal (tether rule)
  CUT: 29,
  ARMEDC: 30, HYBC: 31,
  HUB: 32,
  PBIND: 36,
  BACK: 37,                                             // K of an armed letter with no product in the code (bindAny): a finished product may bind here                                            // F of a finished product (catalysis): binds the back of a strand it matches
  TRN_MM: 33, TRN_LF: 34, TRN_RF: 35,                   // K of an armed letter (translate rule): a product block docks here; which lateral neighbours also
                                                        // translate, as TPL_* says for a face (TRN_RF: the left one only, TRN_LF: the right one only)                                              // any side of a hub block, open: holds the open end of a strand (hub rule)                                 // L, R: ARMED / HYB carrying the cutter signal along a strand (cut rule with cutRelay)                                              // F of a template unit in cutMotif whose face is bound to another template (cut rule): its partner is cut
  GRIP: 38, FUEL: 39,                                   // K of a released product (grip rule); any side of a fuel particle
  GIVE: 40, SPENT: 41,                                  // fuel (pocket rule): the side through which a held, charged particle arms a letter; a spent one
  KT_MM: 42, KT_LF: 43, KT_RF: 44,                      // K of an armed letter (backCopy rule): a monomer of its kind docks here, and the copy lies parallel to
                                                        // its template; which lateral neighbours the template has, as TRN_* says (KT_RF: the left one only)
  HOLD: 45,                                             // F of a finished copy that holds the back it was made on (stack rule): holds, like a template's face
  MEMA: 28,                                             // L, R of an active membrane block, open, on an arc anchored on a maker (tether rule): raw blocks join here
};
const SNAME = []; for (const k in S) SNAME[S[k]] = k;   // name of each side-state value
// A bond breaks the moment either of its sides derives to one of these.
const NONHOLD = new Uint8Array(64);
NONHOLD[S.REPEL] = NONHOLD[S.INERT] = NONHOLD[S.IDLE] = NONHOLD[S.OFF] = NONHOLD[S.SPENT] = 1;

const DEFAULTS = {
  seed: 1,
  W: 48, H: 48,                 // torus
  nA: 160, nB: 160, nE: 120,    // fixed populations (mass and energy are conserved)
  nC: 0, nD: 0,                 // two more replicator letters; each pairs with its own kind, like A and B
  nM: 0,                        // membrane blocks: wedges that bond only to each other, side to side; self-assemble into arcs and rings
  nP: 0, nQ: 0,                 // caps: letters with one lateral side. P has only R (a left end), Q only L (a right end); P docks on a Q
                                // template and Q on P, so a capped strand P...Q copies into a capped strand. A cap cannot be extended
  bareCaps: false,              // caps have no back: no energy particle docks on a cap, so a cap is armed only through its bond (feed rule,
                                // with the relay), and a capped strand re-arms only if it carries a feed motif
  endLoss: false,               // end-replication loss: a template unit with a free lateral side shows nothing on its face and marks its
                                // bonded side as a tip; a neighbour reading the tip counts that side as the template's end. Every copy then
                                // lacks its template's open ends (two units shorter; one if capped at one end), so pieces of a strand die
                                // out in a few generations while a strand capped at both ends (P...Q) is copied whole (telomeres)
  capFray: 0,                   // a cap's fraying rate relative to an ordinary end's (0: a cap never frays, so a strand capped at both
                                // ends lives until it breaks in the middle)
  nJ: 0, pHub: 0.1,             // hubs: blocks whose four sides each hold the open end of a strand, per step of contact, so several strands
                                // are tethered in a star without being fused; to the strand the tethered side counts as free
  nX: 0,                        // rays: small fast blocks that never bond; they pass through everything but membrane, and a ray touching a
                                // block breaks one of its lateral bonds at rayHit (radiation as particles, so a wall shields what it encloses)
  rayHit: 0.05, sizeX: 0.3, mobX: 0.12, // per step of contact; a ray's size; its Brownian step relative to its size's. At 0.12 a ray
                                // moves about 0.12 of a side per step, too little to jump a wall (a wall also needs mobS about 0.3)
  nG: 0,                        // droplets (coacervates): blocks that never bond but attract each other within gRange of touching, closing
  gStick: 0.1, gRange: 1.6,     // gStick of the gap per step: with enough of them they separate into liquid droplets that fuse and break
  gStickS: 0, gStickF: 0,       // how strongly a letter in a strand (gStickS) or a free letter (gStickF) is drawn to G, as a fraction of gStick:
                                // strands then gather in droplets with the monomers they copy from (Oparin's coacervates)
  n1: 0, n2: 0, n3: 0, n4: 0,   // product blocks (translate rule), one count per kind; their physics per kind: size1, bend1, stiff1, res1, mob1 ...
  nU: 0, nV: 0,                 // fuel particles (grip and pocket rules) of two kinds, sizes sizeU and sizeV, mobilities mobU and mobV
  grip: false,                  // a released product's back grips a fuel particle (pGrip per step of contact); a particle held by one grip lets go
  pGrip: 0.2,                   // at pGripMelt per step, one held by two or more at pGripMelt2: only a pocket, two backs at once, holds one (a
  pGripMelt: 0.2, pGripMelt2: 0.001,   // mechanical AND), and whether a folded product's pockets fit a particle is its shape against the particle's size
  pocket: false,                // a letter waiting for energy (its back shows WANT) grips fuel particles too, and a charged particle held by two
                                // or more grips at once arms one of the letters holding it (and is spent): a released copy is curled where its
                                // letters fold (foldA..), so which fuel a genome can use is decided by its own shape (the genome as its own enzyme)
  pReloadU: 0.002,              // a spent fuel particle recharges at this rate per step (the environment's supply)
  backCopy: false,              // two-faced letters: the back of an armed letter templates too. A free monomer of the same kind docks its face there
                                // (another kind at pSoft), docked monomers link where the template continues, and the finished copy lies parallel
                                // to its template (the same sequence in the same direction; a copy on a face lies reversed). Released like a face copy
  stack: false,                 // (with backCopy) a finished back copy is not released: it keeps holding the back it was made on (HOLD), waits for
                                // energy like a released copy, and once armed its own back templates the next row, so copies pile into a stack (a
                                // crystal that grows row by row: Cairns-Smith's layered clays). A stacked unit's broken lateral bond re-links where
                                // the row below continues, as a docked copy's does; stacked units do not fray (their face is held)
  pSMelt: 0.05, pSMeltEnd: 0.005, pSMeltRun: 0.0002,   // a stacked bond (face on a back) melts per step with no stacked lateral neighbour, one, two:
                                // a row comes off its stack by unzipping from its ends, so long rows hold and short ones melt (scission)
  pSBind: 0,                    // (with stack) an armed or held face beside a stacked neighbour meets an armed back of its own kind: they bind, per
                                // step of contact (a melted row zips back)
  pSNuc: -1,                    // the same for a face with no stacked neighbour (a new junction: a strand joins a stack, or two strands meet face to
                                // back); -1: as pSBind. Low values are a nucleation barrier: rows zip back, strangers rarely start to bind
  pReloadV: -1,                 // the same for the second fuel, V (-1: as pReloadU); change either mid-run to shift the supply
  translate: false,             // the back of an armed letter templates a product block by a fixed code (transCode): a free product docks its face there,
                                // docked products link side to side where the template continues, and a finished product chain is released,
  transCode: 'A1,B2,C3,D4',     // as a copy is on the face. Products never become templates. The genome builds a polymer that is not itself
  pMisTrans: 0,                 // a product of the wrong kind docks on a back at this fraction of the rate (mistranslation)
  catalysis: false,             // (with translate) a finished product binds back onto the backs of a strand it matches by the code (pBindP per step
  pBindP: 0.2,                  // of contact; a lone bound unit lets go at pPMelt, one in a bound run at pPMeltRun), and where a product is bound
  pPMelt: 0.05, pPMeltRun: 0.0005, // the template's face is catalysed: two monomers docked there link side to side at once; elsewhere only at
  pLinkBare: 0.01,              // pLinkBare per step of contact. The genome needs the machine it builds to be copied
  bindAny: false,               // (with catalysis) a finished product binds the back of any armed letter, whether it matches or has a product
                                // in the code at all: the catalyst is shared, and a strand that makes none can use others' (a parasite)
  pMisMelt: -1,                 // (with bindAny) a bound product unit on a letter it does not match lets go at this rate per step, whatever its
                                // neighbours: binding is graded, products favour strands like their maker. -1: mismatched units hold like matched
  seedCount: 1, seedLen: 6, seedSeq: '',   // seedSeq: 'ABBABA' or a comma-separated list 'AB,ABBABA'
  // chemistry knobs
  pSoft: 0,        // wrong-type docking (A on a B template): substitution
  chiral: 0,       // chirality: this fraction of letter monomers are mirror forms (written in lowercase). A monomer docks only on a template
                   // of its own hand, binding pairs only one hand, and neighbours of different hands link only at pMixLink (capture and
  pMixLink: 0.05,  // ligation too): the cross-inhibition of mixed chains. 0.5 is a racemic pool; does a population become one-handed?
  pMisDock: 0,     // chirality: a monomer of the other hand docks at this fraction of the normal rate (enantiomeric cross-inhibition)
  pRacem: 0,       // chirality: a free letter (no bonds) flips to the other hand at this rate per step (racemization), so the two
                   // hands draw on one pool of monomers
  compCopy: false, // complementary copying: A docks on a B template and C on a D (caps still pair P with Q), so a copy is the reversed
                   // complement of its template and a lineage alternates between two forms, as DNA's strands do
  pCapture: 0,     // a free monomer sticks to an open strand end instead of a template: insertion / substitution
  pLigate: 0,      // two strand ends join end to end: fusion. Balanced against fraying it sets a length distribution.
  pFray: 0,        // an end unit of an undocked strand falls off, per step: turnover / deletion
  pUnzip: 0,       // processive fraying: a unit whose lateral neighbour is fraying frays next, per step. 1 unzips a whole strand; 0 is plain end fraying
  pUndock: 0,      // a docked monomer with no lateral bonds falls off its template, per step: cooperativity
  pHyb: 0,         // binding: two template faces of complementary letters (A on B, C on D) bind, per step of contact. Copies pair A on A, so kin never bind
  pMelt: 0.1,      // binding: a face-to-face bond with no bound neighbour melts, per step
  pMeltRun: 0.001, // binding: a face-to-face bond with a bound neighbour on each side melts, per step
  pMeltEnd: -1,    // binding: one with a bound neighbour on one side only (the end of a run); -1 means pMeltRun. Set between the two, only runs of three or more hold
  cut: false,      // (with binding, pHyb) a template unit in cutMotif whose face is bound to another strand's face shows CUT there, and the
                   // bound partner lets go of all its bonds at pCut per step: predation by recognition. Kin never bind, so never cut
  cutMotif: 'BAB', pCut: 0.01,
  cutRelay: false, // template units pass the cutter signal along their strand from a cutMotif unit, so any unit of a cutter strand cuts
                   // where it is bound: the rest of the strand is the key (not compatible with feed/shield, which also write lateral sides)
  heatPeriod: 0,   // temperature cycles (environment): for the first heatFrac of every heatPeriod steps it is hot, no two template faces
  heatFrac: 0.2,   // bind, and every face-to-face binding melts at least at heatMelt per step, so double strands come apart (as in PCR,
  heatMelt: 0.05,  // or strands cycled through a hydrothermal gradient); 0 is off
  pSpont: 0,       // two free monomers link side to side: the only way a strand can begin without a seed
  pBreak: 0,       // radiation: a lateral bond breaks, per step, scaled by (1 - resA/resB) of the two blocks it joins
  radBand: 1,      // radiation (pBreak) acts only on blocks in the band x < radBand * W: a world with a lit and a dark part
  resA: 0, resB: 0, resC: 0, resD: 0, // resistance of each block type to breaking, 0 (fragile) to 1 (immune)
  motif: false,    // a B template unit flanked by two A units charges spent energy at its back (sequence as metabolism)
  feed: false,     // a B template unit flanked by two A units re-arms its released neighbours through their shared bonds (private metabolism)
  shield: false,   // a D template unit flanked by two C units makes its two lateral bonds immune to radiation (private durability)
  relay: false,    // template units pass FEED and SHIELD on along their strand, away from the motif, so one motif serves the whole strand
  proof: false,    // proofreading: a template unit in proofMotif (the middle letter between two of the outer one) flags its face, and with the
  proofMotif: 'BDB', // relay passes the flag along its strand; a monomer of the wrong kind docked on a flagged face, not yet linked to a
  pProof: 0.5,     // neighbour, lets go at pProof per step, so the right kind can take the site (kinetic proofreading, a private gene)
  pMem: 0.2,       // two membrane blocks whose back corners touch link, per step of contact; the pins then pull their edges flush
  memAngle: 45,    // bend between two bonded membrane blocks, degrees toward the backs: their wedge shape (45 closes a ring of 8; at most about 50)
  resM: 0.5,       // membrane blocks' resistance to radiation
  memLinkTol: 0,   // how close (in block sides) two membrane blocks' back corners must come to link; 0 means linkDistTol. Looser lets
                   // two passing arc ends catch each other; with snapCorners the pins then pull them flush
  make: false,     // membrane blocks start raw. A raw block activates where its back docks on the back of an A template unit flanked by two B units
                   // (and stays anchored there), or where its side links to an active block's open side, so membrane grows from its makers
  pMemDecay: 0,    // an active membrane block with no lateral bonds falls back to raw, per step (make rule): membrane has to be made continually
  memPerm: false,  // membrane is permeable to free monomers (a membrane block and an unbonded letter do not collide); strands and energy
                   // particles stay on their side, so a closed ring is fed from outside and keeps its strands and its energy
  tether: false,   // (with make) an anchored block passes an anchor signal along its arc; raw blocks join only an anchored arc's open ends, and
                   // an active block the signal does not reach falls back to raw (at pMemDecay) and lets go: membrane stays with its makers
  act: false,      // a unit that leaves a strand is an inactive monomer (it cannot dock) until its back meets the back of a template unit in
                   // actMotif, which activates it: monomer activation as a second catalysed good beside energy
  actMotif: 'BAB', // the activating context: the middle letter flanked by the outer one on both sides (a palindrome)
  energyGate: true,// REPEL -> TPL needs an ON energy particle on K
  pReload: 0.002,  // OFF -> ON per step, the background energy income; the ABA motif (motif rule) is the other source
  // shape: each block type's rest polygon and how hard it is pulled back to it
  shapeA: 'square', shapeB: 'square', shapeC: 'square', shapeD: 'square', shapeM: 'square',   // 'square' (a wedge when bent) or 'oct' (an octagon, working sides on alternate edges)
  bendA: 0, bendB: 0, bendC: 0, bendD: 0,           // degrees of bend between two bonded neighbours of this type (0 square, >0 a wedge that curls strands)
  // foldA..foldD (default 0): a folding letter has this bend while its face is free and its ordinary shape while something is
  // bound to its face, so a free strand curls up and the part being copied straightens (copy straight, fold free)
  stiffA: 0.5, stiffB: 0.5, stiffC: 0.5, stiffD: 0.5, stiffM: 1,   // pull back to the rest shape per solver pass: 1 rigid; 0.5 is safe; below about 0.3 copies docked on neighbouring templates can link
  // physics knobs (these should not need tuning for the chemistry to work)
  sigma: 0.3, sigmaRot: 0.45,    // Brownian step (translation, rotation) per unit per step
  mobE: 1,                       // energy particles' Brownian step relative to their size's; below 1 the medium is viscous for energy
  mobM: 1,                       // Brownian step (and turn) of a membrane block relative to others: a wall that jostles as hard as a free
                                 // block sweeps small particles through itself
  mobS: 1,                       // Brownian step (and turn) of a non-membrane block that has a bond, relative to a free one's: below 1 polymers creep while monomers
                                 // and energy diffuse, as on a mineral surface, so offspring stay near their parents
  repMargin: 1.0,                // contact radius of a block as a fraction of half its side; unbonded blocks never overlap more than this allows
  iters: 4,                      // constraint passes per step (pins, contacts, shape). With bodyJostle 3 to 4 copy exactly (2 lets an odd copy
                                 // go wrong); without it 8 to 24 (16 was the default until 2026-09-25)
  bodyJostle: true,              // bonded blocks are jostled together, as the rigid body they form (one random move and turn about their centre,
                                 // of the size a body of that many blocks has), instead of each on its own: the bonds stay satisfied, so the
                                 // passes have only contacts to resolve (each block keeps its own shape, softness and wedge). About 2x faster
  maxStrain: 0,                  // a weak bond (membrane, a lone docked monomer) whose pinned corners the passes leave further apart than this
                                 // (in block sides) lets go: blocks give only so far, so a shape they do not fit (a ring of the wrong size)
                                 // snaps. Monomers linked into a copy in progress hold each other. 0: off
  maxStrainStrand: 0,            // the same for a strand's own lateral bonds (template to template): stronger, 0 = never breaks mechanically
  snapCorners: false,            // after the passes, every pinned corner pair is brought together exactly by deforming the two blocks: bonded
                                 // sides are always flush, and a misfit (a ring the wedges do not fit) is carried as deformation, which the
                                 // shape force works against from the next step on
  tolDeg: 30, tolRotDeg: 40, distTol: 0.35,   // geometric tolerance for docking (F to F, E to K)
  linkTolDeg: 10, linkDistTol: 0.15,          // tighter tolerance for side-to-side links (L to R): flush means flush
  sizeE: 0.5,                    // energy particles' size; sizeA..sizeD (default 1) and mobA..mobD (default 1) set a letter's size and
                                 // mobility: giant or tiny, sluggish or fast letters (a strand of mixed sizes deforms to keep its edges flush)
  logBirths: true, maxBirthLog: 5000, maxEventLog: 300,
};
/** Knobs of the rigid engine, removed on 2026-09-23 with it; the runner ignores them with a warning. */
const REMOVED = ['physics', 'hinge', 'hingeMax', 'slack', 'memFlex'];

function mulberry32(seed) {
  let a = seed | 0;
  const f = function () {
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  f.getState = () => a; f.setState = (x) => { a = x | 0; };   // for saving and resuming a run
  return f;
}
// typed arrays to and from base64, in Node and in the browser (saved states)
function toB64(ta) {
  const u8 = new Uint8Array(ta.buffer, ta.byteOffset, ta.byteLength);
  if (typeof Buffer !== 'undefined') return Buffer.from(u8).toString('base64');
  let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(s);
}
function fromB64(b64, Ctor) {
  let u8;
  if (typeof Buffer !== 'undefined') { const b = Buffer.from(b64, 'base64'); u8 = new Uint8Array(b.length); u8.set(b); }
  else { const s = atob(b64); u8 = new Uint8Array(s.length); for (let i = 0; i < s.length; i++) u8[i] = s.charCodeAt(i); }
  return new Ctor(u8.buffer);
}
const ARRAY_TYPES = { Float64Array, Int32Array, Uint8Array, Uint16Array, Int8Array };
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

  /** A standard normal deviate (Marsaglia's polar method, both values of each pair used). */
  _gauss() {
    if (this._spare === this._spare) { const g = this._spare; this._spare = NaN; return g; }
    // Marsaglia's polar method: two normals from a point in the unit disc, no trigonometry
    let x, y, q;
    do { x = 2 * this.rng() - 1; y = 2 * this.rng() - 1; q = x * x + y * y; } while (q >= 1 || q === 0);
    const f = Math.sqrt(-2 * Math.log(q) / q);
    this._spare = y * f;
    return x * f;
  }

  // ---------------------------------------------------------------- setup
  // ---------------------------------------------------------------- setup
  _init() {
    const p = this.p;
    const n = this.n = p.nA + p.nB + p.nE + (p.nM || 0) + (p.nC || 0) + (p.nD || 0) + (p.nX || 0) + (p.nP || 0) + (p.nQ || 0) + (p.nJ || 0) + (p.nG || 0) + (p.n1 || 0) + (p.n2 || 0) + (p.n3 || 0) + (p.n4 || 0) + (p.nU || 0) + (p.nV || 0);
    this.type = new Uint8Array(n);
    this.is = new Uint8Array(n);          // internal state
    this.hand = new Uint8Array(n);        // chirality, fixed for life: 1 is the mirror form (chiral rule)
    this.size = new Float64Array(n);
    this.rad = new Float64Array(n);       // repulsion radius
    this.w = new Float64Array(n);         // inverse mass
    this.wr = new Float64Array(n);        // inverse moment of inertia
    this.px = new Float64Array(n); this.py = new Float64Array(n); this.pa = new Float64Array(n);
    this.bond = new Int32Array(n * 4).fill(-1);   // partner = unit*4+side
    this.ss = new Uint8Array(n * 4);              // derived side states
    this.tip = new Uint8Array(n * 4);             // endLoss: a lateral side shows, beside its state, whether its unit is a tip (a template
                                                  // unit whose other lateral side is free), derived like the state
    this.ss0 = new Uint8Array(n * 4);             // side states as the last derive pass left them: a signal relayed along a strand (relay,
                                                  // cutRelay, tether) is read from here, so it moves one block per pass, never further
    this.cat = new Uint8Array(n * 4);             // catalysis: a face shows, beside its state, whether a finished product is bound to its unit's back
    this.tip0 = new Uint8Array(n * 4);            // the tips as the last derive pass left them, which is what a neighbour reads
    this.prf = new Uint8Array(n * 4);             // proof rule: a lateral side shows whether it passes on the proofreading flag, a face whether
    this.prf0 = new Uint8Array(n * 4);            // its unit proofreads (derived like the state); prf0 is the last pass's, read by neighbours
    this.stk = new Uint8Array(n * 4);             // stack rule: a lateral side shows, beside its state, whether its unit is stacked (its face holds a back)
    this.heldNew = [];                            // units that finished a copy on a back this step (observation: a row's birth)
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
    this.energyUsed = 0; this.energyCharged = 0; this.dockEvents = 0; this.captureEvents = 0; this.ligateEvents = 0; this.frayEvents = 0; this.softDockEvents = 0; this.undockEvents = 0; this.spontEvents = 0; this.breakEvents = 0; this.unzipEvents = 0; this.fedEvents = 0; this.makeEvents = 0; this.hybEvents = 0; this.meltEvents = 0; this.actEvents = 0; this.strainEvents = 0; this.strainFace = 0; this.rayHits = 0; this.strainBackbone = 0; this.cutEvents = 0; this.prodCount = 0; this.proofEvents = 0; this.fuelUsed = 0; this.stackMelts = 0; this.stackRows = 0;
    this._seen = new Uint8Array(n);
    const am = String(p.actMotif || 'BAB');
    this._actOut = letterType(am[0]); this._actMid = letterType(am[1]);   // act rule: flanking and middle letter
    this._mobL = new Float64Array(NT).fill(1); for (const t of LETTERS) this._mobL[t] = typeParam(p, 'mob', t, 1); this._mobL[T_G] = typeParam(p, 'mob', T_G, 1); this._mobL[T_U] = typeParam(p, 'mob', T_U, 1); this._mobL[T_V] = typeParam(p, 'mob', T_V, 1); for (const t of PRODUCTS) this._mobL[t] = typeParam(p, 'mob', t, 1);
    this._code = new Int8Array(NT).fill(-1);   // translate rule: which product kind docks on the back of each letter
    for (const pair of String(p.transCode || '').split(',')) { const lt = letterType(pair.trim()[0]), pt = TNAME.indexOf(pair.trim()[1]); if (lt >= 0 && isProd(pt)) this._code[lt] = pt; }
    const cm = String(p.cutMotif || 'BAB');
    this._cutOut = letterType(cm[0]); this._cutMid = letterType(cm[1]);   // cut rule
    const pm = String(p.proofMotif || 'BDB');
    this._prfOut = letterType(pm[0]); this._prfMid = letterType(pm[1]);   // proof rule

    this._initTypes();
    this._initGeometry();
    this._seedAll();
    this._deriveAll();
    this._computeOpen();
  }

  /** Block types, in a fixed order (A, B, E, M, C, D, X, P, Q, J, G, products). */
  _initTypes() {
    const p = this.p;
    let u = 0;
    for (let i = 0; i < p.nA; i++) this.type[u++] = T_A;
    for (let i = 0; i < p.nB; i++) this.type[u++] = T_B;
    for (let i = 0; i < p.nE; i++) this.type[u++] = T_E;
    for (let i = 0; i < (p.nM || 0); i++) this.type[u++] = T_M;
    for (let i = 0; i < (p.nC || 0); i++) this.type[u++] = T_C;
    for (let i = 0; i < (p.nD || 0); i++) this.type[u++] = T_D;
    for (let i = 0; i < (p.nX || 0); i++) this.type[u++] = T_X;
    for (let i = 0; i < (p.nP || 0); i++) this.type[u++] = T_P;
    for (let i = 0; i < (p.nQ || 0); i++) this.type[u++] = T_Q;
    for (let i = 0; i < (p.nJ || 0); i++) this.type[u++] = T_J;
    for (let i = 0; i < (p.nG || 0); i++) this.type[u++] = T_G;
    for (let k = 0; k < 4; k++) for (let i = 0; i < (p['n' + (k + 1)] || 0); i++) this.type[u++] = PRODUCTS[k];
    for (let i = 0; i < (p.nU || 0); i++) this.type[u++] = T_U;
    for (let i = 0; i < (p.nV || 0); i++) this.type[u++] = T_V;
  }

  /** Polygon engine: sizes, masses, hands, states, a jittered grid placement, rest shapes, the spatial hash. */
  _initGeometry() {
    const p = this.p, n = this.n;
    let u;
    for (u = 0; u < n; u++) {
      this.size[u] = typeParam(p, 'size', this.type[u], 1);   // sizeE, sizeX; sizeA..sizeD for letters (default 1)
      if (p.chiral > 0 && LETTERS.includes(this.type[u])) this.hand[u] = this.rng() < p.chiral ? 1 : 0;
      this.rad[u] = 0.5 * this.size[u] * p.repMargin;
      this.w[u] = 1 / (this.size[u] * this.size[u]);
      this.wr[u] = 6 / Math.pow(this.size[u], 4);
      this.is[u] = this.type[u] === T_E || isFuel(this.type[u]) ? I_ON : this.type[u] === T_M ? (p.make ? I_OFF : I_ON) : I_DOCK;   // a membrane block is active (ON) or raw (OFF)
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
    // slots NT..2NT-1 hold each type's folded shape (fold rule): the shape a folding letter takes while its face is free
    this.nv = new Uint8Array(NT); this.rx = new Float64Array(2 * NT * NV); this.ry = new Float64Array(2 * NT * NV); this.edgeOf = new Int8Array(NT * 4);
    this._fold = new Float64Array(NT); for (const t of [...LETTERS, ...PRODUCTS]) this._fold[t] = typeParam(p, 'fold', t, 0);
    for (let slot = 0; slot < 2 * NT; slot++) {
      const t = slot % NT, folded = slot >= NT;
      if (folded && !this._fold[t]) continue;
      const h = 0.5 * typeParam(p, 'size', t, 1), shape = typeParam(p, 'shape', t, 'square');
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
        const bend = t === T_M ? p.memAngle : folded ? this._fold[t] : typeParam(p, 'bend', t, 0);
        if (bend !== 0) { const hb = Math.max(0.15 * h, h - 2 * h * Math.tan(bend * Math.PI / 360)); pts = [[h, -h], [h, h], [-h, hb], [-h, -hb]]; }
      }
      let mx = 0, my = 0; for (const q of pts) { mx += q[0] / pts.length; my += q[1] / pts.length; }
      if (!folded) this.nv[t] = pts.length;
      for (let k = 0; k < pts.length; k++) { this.rx[slot * NV + k] = pts[k][0] - mx; this.ry[slot * NV + k] = pts[k][1] - my; }
      if (!folded) for (let i = 0; i < 4; i++) this.edgeOf[t * 4 + i] = edges[i];
    }
    // a membrane wedge's contact radius is its mean half-width, so two blocks can reach the flush pose
    const hbM = p.shapeM === 'oct' ? 0.5 : this.ry[T_M * NV + 2];
    for (u = 0; u < n; u++) if (this.type[u] === T_M) this.rad[u] = 0.5 * (0.5 + hbM) * p.repMargin;
    this.vw = new Float64Array(n);                 // inverse mass of one corner
    for (u = 0; u < n; u++) { this.vw[u] = this.nv[this.type[u]] * this.w[u]; this._resetShape(u); }
    // spatial hash
    // neighbour scan reach: docking distance (1.35 sides) plus room for the solver's moves within a step; the cells
    // are at least that wide, so the 3x3 cells around a unit hold every unit within reach
    let big = 1; for (let t = 0; t < NT; t++) big = Math.max(big, typeParam(p, 'size', t, 1));
    this.reach = 1.6 * big;
    this.cell = 1.6 * big;
    this.gw = Math.max(3, Math.ceil(p.W / this.cell)); this.gh = Math.max(3, Math.ceil(p.H / this.cell));
    // cell list: the units of cell c are cellItems[cellStart[c] .. cellStart[c + 1]); fwd holds each cell's four forward neighbours
    // (right, and the three above), so a scan of every cell against itself and those four meets every pair of nearby units once
    const nc = this.gw * this.gh;
    this.cellStart = new Int32Array(nc + 1); this.cellPos = new Int32Array(nc); this.cellItems = new Int32Array(n); this.cellOf = new Int32Array(n);
    this.fwd = new Int32Array(nc * 4);
    for (let cy = 0; cy < this.gh; cy++) for (let cx = 0; cx < this.gw; cx++) {
      const c = cy * this.gw + cx, up = ((cy + 1) % this.gh) * this.gw;
      this.fwd[c * 4] = cy * this.gw + (cx + 1) % this.gw;
      this.fwd[c * 4 + 1] = up + (cx + this.gw - 1) % this.gw; this.fwd[c * 4 + 2] = up + cx; this.fwd[c * 4 + 3] = up + (cx + 1) % this.gw;
    }
    this.cosTol = Math.cos(p.tolDeg * Math.PI / 180);
    this.cosTolRot = Math.cos(p.tolRotDeg * Math.PI / 180);
    this.cosLinkTol = Math.cos(p.linkTolDeg * Math.PI / 180);
  }

  /** Seed strands: seedSeq may list several sequences separated by commas; seedCount repeats the list. */
  _seedAll() {
    const p = this.p;
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
  }

  /** Place a template strand of `len` units (or the given A/B sequence): a row of blocks, each bonded to the next. */
  seedStrand(cx, cy, ang, len, seq) {
    const units = [];
    for (let i = 0; i < len; i++) {
      const want = seq ? letterType(seq[i]) : (this.rng() < 0.5 ? T_A : T_B), wantHand = seq && seq[i] !== seq[i].toUpperCase() ? 1 : 0;
      let found = -1;
      for (let u = 0; u < this.n; u++) {
        if (this.type[u] === want && this.hand[u] === wantHand && this.is[u] === I_DOCK && this.bond[u * 4] < 0 && this.bond[u * 4 + 1] < 0
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
    const n = this.n, gw = this.gw, gh = this.gh, cell = this.cell, px = this.px, py = this.py;
    const start = this.cellStart, pos = this.cellPos, items = this.cellItems, cOf = this.cellOf, nc = gw * gh;
    start.fill(0);
    for (let u = 0; u < n; u++) {
      const cx = Math.min(gw - 1, (px[u] / cell) | 0), cy = Math.min(gh - 1, (py[u] / cell) | 0), c = cy * gw + cx;
      cOf[u] = c; start[c + 1]++;
    }
    for (let c = 0; c < nc; c++) { start[c + 1] += start[c]; pos[c] = start[c]; }
    for (let u = 0; u < n; u++) items[pos[cOf[u]]++] = u;
  }

  /** Call fn(v) for every unit v in the 3x3 cells around (x, y). */
  _forNear(x, y, fn) {
    const cx = Math.min(this.gw - 1, (this._wx(x) / this.cell) | 0), cy = Math.min(this.gh - 1, (this._wy(y) / this.cell) | 0);
    for (let dy = -1; dy <= 1; dy++) {
      const yy = (cy + dy + this.gh) % this.gh;
      for (let dx = -1; dx <= 1; dx++) {
        const c = yy * this.gw + (cx + dx + this.gw) % this.gw;
        for (let k = this.cellStart[c], e = this.cellStart[c + 1]; k < e; k++) fn(this.cellItems[k]);
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
    const out = this.bonds, pins = this.pins, cu = this._cu || (this._cu = [0, 0]), cv = this._cv || (this._cv = [0, 0]);
    out.length = 0; pins.length = 0;
    for (let q = 0; q < this.n * 4; q++) {
      const r = this.bond[q]; if (r <= q) continue;
      const u = q >> 2, i = q & 3, v = r >> 2, j = r & 3;
      out.push(q);
      if (this.type[u] === T_E || this.type[v] === T_E) continue;   // an energy bond never lives into a physics phase
      // side i of u runs corner a0 -> a1, side j of v runs b0 -> b1; facing each other, a0 meets b1 and a1 meets b0
      this._sideCorners(u, i, cu); this._sideCorners(v, j, cv);
      pins.push(cu[0], cv[1], cu[1], cv[0]);
    }
    this.pinsVersion = (this.pinsVersion || 0) + 1; this.bondsDirty = false; return out;
  }

  /** Corners joined by pins, directly or through other pinned corners, as groups (rebuilt with the bond list). */
  _cornerGroups() {
    if (this._groupsFor === this.pinsVersion) return this._groups;
    const pins = this.pins, parent = new Map();
    const find = (x) => { while (parent.get(x) !== x) { const g = parent.get(parent.get(x)); parent.set(x, g); x = g; } return x; };
    for (const q of pins) if (!parent.has(q)) parent.set(q, q);
    for (let k = 0; k < pins.length; k += 2) { const a = find(pins[k]), b = find(pins[k + 1]); if (a !== b) parent.set(a, b); }
    const by = new Map();
    for (const q of parent.keys()) { const r = find(q); if (!by.has(r)) by.set(r, []); by.get(r).push(q); }
    this._groups = [...by.values()]; this._groupsFor = this.pinsVersion;
    return this._groups;
  }

  /** Number of corners of unit u. */
  corners(u) { return this.nv[this.type[u]]; }

  /** The two corners (as u*NV+k) of side i of u, in counter-clockwise order; -1 if u's shape has no such side. */
  _sideCorners(u, i, out) {
    const t = this.type[u], e = this.edgeOf[t * 4 + i], nv = this.nv[t];
    out[0] = u * NV + e; out[1] = u * NV + (e + 1) % nv;
    return out;
  }

  /** Which rest shape u has now: its folded one (slot type + NT) if it is a folding letter whose face is free. */
  _restSlot(u) { const t = this.type[u]; return this._fold[t] && this.bond[u * 4] < 0 ? t + NT : t; }

  /** Put u's corners at its rest shape, rotated to its orientation. */
  _resetShape(u) {
    const t = this.type[u], r = this._restSlot(u), c = Math.cos(this.pa[u]), s = Math.sin(this.pa[u]);
    for (let k = 0; k < this.nv[t]; k++) { const x = this.rx[r * NV + k], y = this.ry[r * NV + k]; this.ox[u * NV + k] = c * x - s * y; this.oy[u * NV + k] = s * x + c * y; }
  }

  /** Move unit u rigidly: translate by (dx, dy), turn its corners by da about its centre. */
  _rigidMove(u, dx, dy, da) {
    this.px[u] += dx; this.py[u] += dy;
    if (da === 0) return;
    this.pa[u] += da;
    let c, s;
    if (da < 0.1 && da > -0.1) { const d2 = da * da; c = 1 - d2 * (0.5 - d2 * (1 / 24 - d2 / 720)); s = da * (1 - d2 * (1 / 6 - d2 * (1 / 120 - d2 / 5040))); }   // series, exact to double precision here
    else { c = Math.cos(da); s = Math.sin(da); }
    for (let k = u * NV, e = u * NV + this.nv[this.type[u]]; k < e; k++) { const x = this.ox[k], y = this.oy[k]; this.ox[k] = c * x - s * y; this.oy[k] = s * x + c * y; }
  }

  /** True if unit m could sit at (tx,ty) without overlapping another unit (space exclusion). */
  _slotFree(m, tx, ty) {
    let free = true;
    this._forNear(tx, ty, (v) => {
      if (!free || v === m || this.type[v] === T_X || this.type[v] === T_G) return;
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
      const gx = dx + this.ox[bv] - this.ox[bu], gy = dy + this.oy[bv] - this.oy[bu], tol = (this.p.memLinkTol || this.p.linkDistTol) * (this.size[u] + this.size[v]) / 2;
      return gx * gx + gy * gy <= tol * tol && su[2] * sv[2] + su[3] * sv[3] <= 0;
    }
    const lateral = (i !== F || this.type[u] === T_J) && (j !== F || this.type[v] === T_J) && this.type[u] !== T_E && this.type[v] !== T_E && !(this.type[u] === T_M && this.type[v] === T_M)
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
    if (this.p.stack && ((i === F && j === K) || (i === K && j === F)) && this.is[u] !== I_DOCK && this.is[v] !== I_DOCK && LETTERS.includes(this.type[u]) && LETTERS.includes(this.type[v])) { this._link(u, i, v, j); return true; }   // (stack rule: a face binds a back, likewise)
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
      if (tu === T_M && tv === T_M) {
        if (!((i === L && j === R) || (i === R && j === L))) return 0;
        if (p.tether) {   // raw blocks join only an anchored arc; active ends link to each other
          const act = (x) => x === S.MEM || x === S.MEMA;
          return (act(su) && act(sv)) || (su === S.RAW && sv === S.MEMA) || (su === S.MEMA && sv === S.RAW) ? p.pMem : 0;
        }
        return (su === S.MEM && (sv === S.MEM || sv === S.RAW)) || (su === S.RAW && sv === S.MEM) ? p.pMem : 0;
      }
      // a raw membrane block's back meets a MAKE back
      if (tu === T_M) return tv !== T_E && i === K && su === S.RAW && j === K && sv === S.MAKE ? 1 : 0;
      return tu !== T_E && j === K && sv === S.RAW && i === K && su === S.MAKE ? 1 : 0;
    }
    if (tu === T_J || tv === T_J) {
      if (tu === T_J && tv === T_J) return 0;
      const [hs, xs, xi] = tu === T_J ? [su, sv, j] : [sv, su, i];
      return hs === S.HUB && (xi === L || xi === R) && xs === S.END ? p.pHub : 0;
    }
    if (tu === T_E || tv === T_E) {
      if (tu === T_E && tv !== T_E) return (j === K && ((su === S.ON && sv === S.WANT) || (su === S.OFF && sv === S.CHARGE))) ? 1 : 0;
      if (tv === T_E && tu !== T_E) return (i === K && ((sv === S.ON && su === S.WANT) || (sv === S.OFF && su === S.CHARGE))) ? 1 : 0;
      return 0;
    }
    if (tu === T_G || tv === T_G) return 0;
    if (isFuel(tu) || isFuel(tv)) {   // grip and pocket rules: a fuel particle's side and a gripping back
      if (isFuel(tu) && isFuel(tv)) return 0;
      const [xs, xi] = isFuel(tu) ? [sv, j] : [su, i], us = isFuel(tu) ? su : sv;
      if (xi !== K || us !== S.FUEL) return 0;
      return (xs === S.GRIP && (p.grip || p.pocket)) || (p.pocket && xs === S.WANT) ? p.pGrip : 0;
    }
    if (isProd(tu) !== isProd(tv)) {
      // translate rule: a free product block's face docks on an armed letter's back (TRN_*), by the code; nothing else joins the two families
      const [lt, ls, li, pt, ps, pi] = isProd(tu) ? [tv, sv, j, tu, su, i] : [tu, su, i, tv, sv, j];
      if (!p.translate || li !== K || pi !== F) return 0;
      if (ps === S.PBIND && p.catalysis && p.bindAny && (ls === S.BACK || ls === S.TRN_MM || ls === S.TRN_LF || ls === S.TRN_RF)) return p.pBindP;   // any back
      if (!(ls === S.TRN_MM || ls === S.TRN_LF || ls === S.TRN_RF)) return 0;
      if (ps === S.PBIND) return p.catalysis && this._code[lt] === pt ? p.pBindP : 0;   // a finished product binds back (catalysis)
      if (ps !== S.DOCK) return 0;
      return this._code[lt] === pt ? 1 : p.pMisTrans;
    }
    if (p.chiral > 0 && tu !== T_X && tv !== T_X && this.hand[u] !== this.hand[v]) {
      // chirality: no binding across hands, a mirror monomer docks only at pMisDock (then sits in the site, a poison,
      // until it falls off); side to side only at pMixLink
      if (i === F && j === F) { const d = this.ss[u * 4] === S.DOCK || this.ss[v * 4] === S.DOCK; return d && p.pMisDock > 0 ? this._compat0(u, i, v, j) * p.pMisDock : 0; }
      if (i === F || j === F) return 0;
      const r = this._compat0(u, i, v, j); return r > 0 ? r * p.pMixLink : 0;
    }
    return this._compat0(u, i, v, j);
  }

  _compat0(u, i, v, j) {
    const p = this.p, tu = this.type[u], tv = this.type[v];
    const su = this.ss[u * 4 + i], sv = this.ss[v * 4 + j];
    if (i === F && j === F) {
      const isTpl = (x) => x === S.TPL_MM || x === S.TPL_LF || x === S.TPL_RF;
      if (isTpl(su) && isTpl(sv)) return COMP[tu] === tv && !this._hot ? p.pHyb : 0;   // binding: two templates, complementary letters (A-B, C-D); not while hot
      if (!((su === S.DOCK && isTpl(sv)) || (sv === S.DOCK && isTpl(su)))) return 0;
      const mate = p.compCopy && tu < T_P ? COMP[tu] : PAIR[tu];
      return mate === tv ? 1 : (tu >= T_P || tv >= T_P) ? 0 : p.pSoft;   // caps pair only with each other
    }
    if (i === K && j === K) return (su === S.INACT && sv === S.ACT) || (su === S.ACT && sv === S.INACT) ? 1 : 0;   // activation (act rule)
    if ((i === F && j === K) || (i === K && j === F)) {
      // backCopy rule: a monomer's face docks on an armed back of its own kind (the copy lies parallel, so caps pair with their own kind
      // too); with the stack rule an armed or held face binds such a back (pSBind)
      if (!p.backCopy) return 0;
      const [fs, ks, ft, kt] = i === F ? [su, sv, tu, tv] : [sv, su, tv, tu];
      if (!(ks === S.KT_MM || ks === S.KT_LF || ks === S.KT_RF)) return 0;
      if (fs === S.DOCK) return ft === kt ? 1 : (ft >= T_P || kt >= T_P) ? 0 : p.pSoft;
      if (p.stack && (fs === S.HOLD || fs === S.TPL_MM || fs === S.TPL_LF || fs === S.TPL_RF) && ft === kt) {
        // a face beside a stacked neighbour zips on at pSBind; a face with none starts a new junction only at pSNuc (nucleation)
        const w = i === F ? u : v, b = this.bond, qL = b[w * 4 + L], qR = b[w * 4 + R];
        return (qL >= 0 && this.stk[qL]) || (qR >= 0 && this.stk[qR]) ? p.pSBind : p.pSNuc < 0 ? p.pSBind : p.pSNuc;
      }
      return 0;
    }
    if ((i === L && j === R) || (i === R && j === L)) {
      const openish = (x) => x === S.STICKY || x === S.END;
      if (su === S.STICKY && sv === S.STICKY) {
        if (!p.catalysis || isProd(tu)) return 1;   // (products link freely; only copies of letters need the catalyst)
        // catalysis: two docked monomers link at once where either one's template unit has a finished product on its back
        const fu = this.bond[u * 4 + F], fv = this.bond[v * 4 + F];
        return (fu >= 0 && this.cat[fu]) || (fv >= 0 && this.cat[fv]) ? 1 : p.pLinkBare;
      }
      if (openish(su) && openish(sv)) return p.pLigate;
      if ((su === S.INERT && openish(sv)) || (sv === S.INERT && openish(su))) return p.pCapture;
      if (su === S.INERT && sv === S.INERT) return p.pSpont;
      return 0;
    }
    return 0;
  }

  _computeOpen() {
    const p = this.p, b = this.bond, type = this.type, is = this.is;
    const freeMask = 1 << F | (p.pCapture > 0 || p.pSpont > 0 ? 1 << L | 1 << R : 0);   // a free monomer: its face, and its sides if they can capture
    for (let u = 0; u < this.n; u++) {
      const t = type[u], o = u * 4;
      if (is[u] === I_DOCK && b[o] < 0 && b[o + 1] < 0 && b[o + 2] < 0 && b[o + 3] < 0 && (t <= T_B || (t >= T_C && t <= T_D) || t === T_P || t === T_Q || isProd(t))) {
        this.open[u] = t === T_P ? freeMask & ~(1 << L) : t === T_Q ? freeMask & ~(1 << R) : freeMask;   // (a cap lacks one side)
        continue;
      }
      let m = 0;
      for (let i = 0; i < 4; i++) {
        if (this.bond[u * 4 + i] >= 0) continue;
        const s = this.ss[u * 4 + i];
        let ok = false;
        if (this.type[u] === T_X || this.type[u] === T_G) ok = false;
        else if (this.type[u] === T_J) ok = s === S.HUB;
        else if (this.type[u] === T_M) ok = s === S.MEM || s === S.RAW || s === S.MEMA;
        else if (this.type[u] === T_E) ok = s === S.ON || (s === S.OFF && p.motif);
        else if (isFuel(this.type[u])) ok = s === S.FUEL;
        else if (i === F) ok = s === S.DOCK || s === S.TPL_MM || s === S.TPL_LF || s === S.TPL_RF || s === S.PBIND || s === S.HOLD;
        else if (i === K) ok = s === S.WANT || s === S.CHARGE || s === S.MAKE || s === S.INACT || s === S.ACT || s === S.TRN_MM || s === S.TRN_LF || s === S.TRN_RF || s === S.BACK || s === S.GRIP || s === S.KT_MM || s === S.KT_LF || s === S.KT_RF;
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
      if (this.p.tether && on) {
        // the anchor signal runs along the arc away from the anchor: each side shows it if the block is anchored or its
        // neighbour on the other side shows it toward the block
        const src = b[o + K] >= 0, fromL = b[o + L] >= 0 && this.ss0[b[o + L]] === S.ANC, fromR = b[o + R] >= 0 && this.ss0[b[o + R]] === S.ANC;
        const sR = src || fromL, sL = src || fromR;
        this.ss[o + L] = b[o + L] >= 0 ? (sL ? S.ANC : S.BONDED) : (sL ? S.MEMA : S.MEM);
        this.ss[o + R] = b[o + R] >= 0 ? (sR ? S.ANC : S.BONDED) : (sR ? S.MEMA : S.MEM);
        return;
      }
      this.ss[o + L] = b[o + L] >= 0 ? S.BONDED : on ? S.MEM : S.RAW; this.ss[o + R] = b[o + R] >= 0 ? S.BONDED : on ? S.MEM : S.RAW;
      return;
    }
    if (this.type[u] === T_X || this.type[u] === T_G) { this.ss[o] = this.ss[o + 1] = this.ss[o + 2] = this.ss[o + 3] = S.IDLE; return; }
    if (isFuel(this.type[u])) {
      // fuel: charged, it shows FUEL; held by two or more grips (a pocket), it shows GIVE on the first side whose partner wants energy;
      // spent, it shows SPENT and lets go of everything
      if (this.is[u] !== I_ON) { this.ss[o] = this.ss[o + 1] = this.ss[o + 2] = this.ss[o + 3] = S.SPENT; return; }
      let nb = 0; for (let i = 0; i < 4; i++) { this.ss[o + i] = S.FUEL; if (b[o + i] >= 0) nb++; }
      if (this.p.pocket && nb >= 2) for (let i = 0; i < 4; i++) if (b[o + i] >= 0 && this.ss[b[o + i]] === S.WANT) { this.ss[o + i] = S.GIVE; break; }
      return;
    }
    if (this.type[u] === T_J) { for (let i = 0; i < 4; i++) this.ss[o + i] = b[o + i] >= 0 ? S.BONDED : S.HUB; return; }
    if (this.type[u] === T_E) {
      const s = this.is[u] === I_ON ? S.ON : S.OFF;
      this.ss[o] = this.ss[o + 1] = this.ss[o + 2] = this.ss[o + 3] = s;
      return;
    }
    if (this.is[u] === I_DOCK && b[o] < 0 && b[o + 1] < 0 && b[o + 2] < 0 && b[o + 3] < 0) {
      // a free monomer (the commonest block): what the full derivation below gives it, directly
      const ss = this.ss; ss[o + F] = S.DOCK; ss[o + L] = S.INERT; ss[o + R] = S.INERT; ss[o + K] = S.IDLE;
      if (this.p.proof) this.prf[o + F] = this.prf[o + L] = this.prf[o + R] = 0;
      if (this.p.catalysis) this.cat[o + F] = 0;
      if (this.p.endLoss) this.tip[o + L] = this.tip[o + R] = 0;
      if (this.p.stack) this.stk[o + L] = this.stk[o + R] = 0;
      if (this.type[u] === T_P || this.type[u] === T_Q) this._capSides(u);
      return;
    }
    const bF = b[o + F] >= 0, bL = b[o + L] >= 0 && this.type[b[o + L] >> 2] !== T_J, bR = b[o + R] >= 0 && this.type[b[o + R] >> 2] !== T_J, nl = (bL ? 1 : 0) + (bR ? 1 : 0);
    const st = this.is[u];
    if (this.p.stack) this.stk[o + L] = this.stk[o + R] = 0;
    if (this.p.proof) {
      // proof rule: a template unit in the motif flags its face; with the relay it also shows the flag on each lateral side if it is a
      // source or its neighbour on the other side showed it toward it on the last pass (one block per pass), and flags its face if either
      const pr = this.prf; pr[o + F] = pr[o + L] = pr[o + R] = 0;
      if (st === I_TPL && !isProd(this.type[u])) {
        const src = bL && bR && this.type[u] === this._prfMid && this.type[b[o + L] >> 2] === this._prfOut && this.type[b[o + R] >> 2] === this._prfOut;
        const rel = this.p.relay, inL = rel && bL && this.prf0[b[o + L]] === 1, inR = rel && bR && this.prf0[b[o + R]] === 1;
        if (bL && (src || inR)) pr[o + L] = 1;
        if (bR && (src || inL)) pr[o + R] = 1;
        if (src || inL || inR) pr[o + F] = 1;
      }
    }
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
    else if (st === I_HOLD) this.ss[o + F] = S.HOLD;
    else this.ss[o + F] = (bL && bR) ? S.TPL_MM : bL ? S.TPL_RF : S.TPL_LF;
    if (st === I_TPL && isProd(this.type[u])) this.ss[o + F] = S.PBIND;   // a finished product (catalysis)
    if (this.p.catalysis) this.cat[o + F] = st === I_TPL && b[o + K] >= 0 && this.ss[b[o + K]] === S.PBIND ? 1 : 0;
    // L, R. A docked unit's free lateral is sticky only where its template partner's face says the
    // template continues (TPL_MM, or TPL_LF for my L / TPL_RF for my R); at the template's end it is an open end.
    const pf = bF ? this.ss[b[o + F]] : -1;
    const kt = pf === S.KT_MM || pf === S.KT_LF || pf === S.KT_RF;   // (backCopy) my face is on a back: I lie parallel to that template
    const hyb = st === I_TPL && pf >= 0 && pf !== S.DOCK && !kt;   // my face is bound to another template's face
    // a lateral side: bonded (ARMED or HYB on a template), or free: STICKY where a docked unit's template continues, END at its end
    // or on a strand; a product docked on a back lies parallel to its template (a copy on a face lies reversed), so its L continues
    // where the template's L does
    const prod = isProd(this.type[u]), par = prod || kt;
    const onB = st === I_TPL ? (hyb ? S.HYB : S.ARMED) : S.BONDED, freeLone = nl > 0 ? S.STICKY : S.INERT;
    const cL = par ? pf === S.TRN_MM || pf === S.TRN_RF || pf === S.KT_MM || pf === S.KT_RF : pf === S.TPL_MM || pf === S.TPL_LF;
    const cR = par ? pf === S.TRN_MM || pf === S.TRN_LF || pf === S.KT_MM || pf === S.KT_LF : pf === S.TPL_MM || pf === S.TPL_RF;
    // (stack rule) a stacked unit, held or armed, is sticky where the row below continues, as a docked copy is: a broken row re-links
    const stacked = kt && (st === I_HOLD || st === I_TPL), dk = st === I_DOCK || stacked;
    this.ss[o + L] = bL ? onB : dk ? (bF ? (cL ? S.STICKY : S.END) : freeLone) : S.END;
    this.ss[o + R] = bR ? onB : dk ? (bF ? (cR ? S.STICKY : S.END) : freeLone) : S.END;
    if (stacked && this.p.stack) this.stk[o + L] = this.stk[o + R] = 1;
    if (this.p.cut && st === I_TPL) {
      const src = bL && bR && this.type[u] === this._cutMid && this.type[b[o + L] >> 2] === this._cutOut && this.type[b[o + R] >> 2] === this._cutOut;
      let carries = src;
      if (this.p.cutRelay) {
        // the signal runs along the strand away from its source; each side shows it if I am a source or my other side receives it
        const ss = this.ss, s0 = this.ss0, got = (q) => q >= 0 && (s0[q] === S.ARMEDC || s0[q] === S.HYBC);
        const inL = bL && got(b[o + L]), inR = bR && got(b[o + R]);
        if (bL && (src || inR)) ss[o + L] = ss[o + L] === S.HYB ? S.HYBC : S.ARMEDC;
        if (bR && (src || inL)) ss[o + R] = ss[o + R] === S.HYB ? S.HYBC : S.ARMEDC;
        carries = src || inL || inR;
      }
      if (hyb && carries) this.ss[o + F] = S.CUT;
    }
    if (st === I_TPL && (this.p.feed || this.p.shield)) {
      // a B between two As shows FEED on both sides, a D between two Cs SHIELD. With the relay, a template unit also shows
      // on each side what its neighbour on the other side shows toward it, so a signal runs along the strand away from
      // its motif and stops at the ends; it cannot circle without a source.
      const srcF = this.p.feed && bL && bR && this.type[u] === T_B && this.type[b[o + L] >> 2] === T_A && this.type[b[o + R] >> 2] === T_A;
      const srcS = this.p.shield && bL && bR && this.type[u] === T_D && this.type[b[o + L] >> 2] === T_C && this.type[b[o + R] >> 2] === T_C;
      const rel = this.p.relay, ss = this.ss;
      // what each neighbour showed toward me on the last pass
      const s0 = this.ss0, qL = b[o + L], qR = b[o + R], iL = rel && qL >= 0 ? s0[qL] : -1, iR = rel && qR >= 0 ? s0[qR] : -1;
      const fR = srcF || iL === S.FEED || iL === S.FSH, fL = srcF || iR === S.FEED || iR === S.FSH;
      const sR = srcS || iL === S.SHIELD || iL === S.FSH, sL = srcS || iR === S.SHIELD || iR === S.FSH;
      if (bL && (fL || sL)) ss[o + L] = fL && sL ? S.FSH : fL ? S.FEED : S.SHIELD;
      if (bR && (fR || sR)) ss[o + R] = fR && sR ? S.FSH : fR ? S.FEED : S.SHIELD;
    }
    // K. A B template unit flanked by two A units reads CHARGE at its back when the motif rule is on:
    // this is the one place a side's state depends on what its neighbours are (their type is their colour).
    // (K to K bonds no longer exist; the back is for energy only.)
    if (st === I_REPEL || st === I_HOLD) this.ss[o + K] = S.WANT;
    else if (this.p.motif && st === I_TPL && bL && bR && this.type[u] === T_B && this.type[b[o + L] >> 2] === T_A && this.type[b[o + R] >> 2] === T_A) this.ss[o + K] = S.CHARGE;
    else if (this.p.make && st === I_TPL && bL && bR && this.type[u] === T_A && this.type[b[o + L] >> 2] === T_B && this.type[b[o + R] >> 2] === T_B) this.ss[o + K] = S.MAKE;
    else if (this.p.act && st === I_TPL && bL && bR && this.type[u] === this._actMid && this.type[b[o + L] >> 2] === this._actOut && this.type[b[o + R] >> 2] === this._actOut) this.ss[o + K] = S.ACT;
    else if (this.p.translate && st === I_TPL && this._code[this.type[u]] >= 0) {
      // translate rule: my back templates a product; it says along which sides the template continues (bonded neighbours whose letter
      // has a product in the code; one not yet armed will be, and the product waits for it)
      const eL = bL && this._code[this.type[b[o + L] >> 2]] >= 0, eR = bR && this._code[this.type[b[o + R] >> 2]] >= 0;
      this.ss[o + K] = eL && eR ? S.TRN_MM : eL ? S.TRN_RF : eR ? S.TRN_LF : S.IDLE;
    }
    else if (this.p.bindAny && st === I_TPL && !isProd(this.type[u]) && this.type[u] !== T_P && this.type[u] !== T_Q && this.p.translate) this.ss[o + K] = S.BACK;
    else if (this.p.backCopy && st === I_TPL && !isProd(this.type[u])) this.ss[o + K] = bL && bR ? S.KT_MM : bL ? S.KT_RF : S.KT_LF;   // (backCopy) my back templates
    else this.ss[o + K] = S.IDLE;
    if (prod) this.ss[o + K] = this.p.grip && (st === I_REPEL || st === I_TPL) ? S.GRIP : S.IDLE;   // a product takes no energy and is never armed; released, it may grip fuel
    else if (this.p.pocket && st === I_TPL && this.ss[o + K] === S.IDLE) this.ss[o + K] = S.GRIP;   // pocket rule: an armed letter's idle back helps hold fuel
    if (this.p.endLoss) {
      // end-replication loss: a template unit with a free lateral side (a cap's missing side is not free) is a tip and shows no
      // face; a unit whose neighbour is a tip counts that side as the end, so the copy stops one unit short of the open end
      const tp = this.tip, t0 = this.tip0, t = this.type[u];
      tp[o + L] = tp[o + R] = 0;
      if (st === I_TPL && !isProd(t)) {
        if ((!bL && t !== T_P) || (!bR && t !== T_Q)) { this.ss[o + F] = S.IDLE; tp[o + L] = tp[o + R] = 1; }
        else {
          const eL = bL && !t0[b[o + L]], eR = bR && !t0[b[o + R]];   // sides along which the template continues
          if (eL !== bL || eR !== bR) this.ss[o + F] = (eL && eR) ? S.TPL_MM : eL ? S.TPL_RF : eR ? S.TPL_LF : S.IDLE;
        }
      }
    }
    if (this.type[u] === T_P || this.type[u] === T_Q) this._capSides(u);
  }

  /** Caps lack one lateral side (and, with bareCaps, the back): that side shows IDLE and never bonds. */
  _capSides(u) { const t = this.type[u]; if (t === T_P) this.ss[u * 4 + L] = S.IDLE; else if (t === T_Q) this.ss[u * 4 + R] = S.IDLE; if (this.p.bareCaps) this.ss[u * 4 + K] = S.IDLE; }

  _deriveAll() { const p = this.p; if (p.endLoss) this.tip0.set(this.tip); if (p.proof) this.prf0.set(this.prf); if (p.relay || p.cutRelay || p.tether) this.ss0.set(this.ss); for (let u = 0; u < this.n; u++) this._derive(u); }

  // ------------------------------------------------------------- the rule table
  /**
   * Transitions of the internal state. Every rule reads only this unit's state,
   * which of its sides are bonded, and the derived state of a bonded partner side.
   */
  _transition(u) {
    const p = this.p, b = this.bond, o = u * 4;
    if (this.is[u] === 0 && b[o] < 0 && b[o + 1] < 0 && b[o + 2] < 0 && b[o + 3] < 0) return;   // a free block in state 0 has no transition
    if (this.type[u] === T_X || this.type[u] === T_J || this.type[u] === T_G) return;
    if (isFuel(this.type[u])) {
      // pocket rule: a particle that showed GIVE has armed the letter on that side (it reads GIVE this step) and is spent
      if (this.is[u] === I_ON && (this.ss[o] === S.GIVE || this.ss[o + 1] === S.GIVE || this.ss[o + 2] === S.GIVE || this.ss[o + 3] === S.GIVE)) { this.is[u] = I_OFF; this.fuelUsed++; return; }
      // grip rule: held by one grip, a fuel particle lets go fast; held by two or more (in a pocket), slowly
      let nb = 0, first = -1; for (let i = 0; i < 4; i++) if (b[o + i] >= 0) { nb++; if (first < 0) first = i; }
      if (nb > 0 && this.rng() < (nb === 1 ? p.pGripMelt : p.pGripMelt2)) this.pendingUnlink.push(o + first);
      return;
    }
    if (this.type[u] === T_M) {
      // make rule: a raw block whose face is on a MAKE back turns active and lets go; an active block with no lateral
      // bonds falls back to raw at pMemDecay
      if (this.is[u] === I_OFF) {
        // anchored on a MAKE back, or linked to an active block: activate (and stay bonded)
        if (b[o + K] >= 0 || b[o + L] >= 0 || b[o + R] >= 0) { this.is[u] = I_ON; this.makeEvents++; this._event('make', u); }
        return;
      }
      if (p.tether) {
        // tether: an active block the anchor signal does not reach falls back to raw and lets go
        const ss = this.ss, anchored = b[o + K] >= 0 || (b[o + L] >= 0 && ss[b[o + L]] === S.ANC) || (b[o + R] >= 0 && ss[b[o + R]] === S.ANC);
        if (!anchored && p.pMemDecay > 0 && this.rng() < p.pMemDecay) { this.is[u] = I_OFF; this.pendingUnlink.push(o + L, o + R); return; }
      } else if (p.pMemDecay > 0 && b[o + L] < 0 && b[o + R] < 0 && b[o + K] < 0 && this.rng() < p.pMemDecay) { this.is[u] = I_OFF; return; }
      if (p.pBreak > 0 && (p.radBand >= 1 || this.px[u] < p.radBand * p.W)) {
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
    const bF = b[o + F] >= 0, bL = b[o + L] >= 0 && this.type[b[o + L] >> 2] !== T_J, bR = b[o + R] >= 0 && this.type[b[o + R] >> 2] !== T_J, bK = b[o + K] >= 0;   // a hub-held side counts as free
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
        // proofreading: a monomer of the wrong kind (it reads its partner's kind, its colour) on a flagged face lets go before it links
        if (p.proof && nl === 0 && this.prf[b[o + F]]) {
          const tt = this.type[b[o + F] >> 2], mate = p.compCopy && tt < T_P ? COMP[tt] : PAIR[tt];
          if (mate !== this.type[u] && this.rng() < p.pProof) { this.pendingUnlink.push(o + F); this.kicked.push(u); this.proofEvents++; this._event('proof', u); return; }
        }
        // R1 release: docked, and every lateral bond the template partner says I need is in place
        const pf = this.ss[b[o + F]], prod = isProd(this.type[u]), kt = pf === S.KT_MM || pf === S.KT_LF || pf === S.KT_RF, par = prod || kt;
        const needL = par ? pf === S.TRN_MM || pf === S.TRN_RF || pf === S.KT_MM || pf === S.KT_RF : pf === S.TPL_MM || pf === S.TPL_LF;
        const needR = par ? pf === S.TRN_MM || pf === S.TRN_LF || pf === S.KT_MM || pf === S.KT_LF : pf === S.TPL_MM || pf === S.TPL_RF;
        if ((!needL || bL) && (!needR || bR)) {
          this.fresh[u] = 1; this.parentOf[u] = b[o + F] >> 2;
          if (kt && p.stack) { this.is[u] = I_HOLD; this.heldNew.push(u); this._event('hold', u); }   // stack rule: a finished back copy stays
          else { this.is[u] = I_REPEL; this._event('release', u); }
        }
      } else if (nl > 0) {
        // R2 linked laterally without a template (captured by a strand end, or two free monomers that met): a new strand unit
        this.is[u] = I_REPEL; this.fresh[u] = 1; this.parentOf[u] = -1;
      }
    } else if (st === I_REPEL || st === I_HOLD) {
      if (nl === 0) this.is[u] = pool;                                     // R3 lost its strand: back to the pool (a held unit is then docked again)
      else if (isProd(this.type[u])) { if (p.catalysis) this.is[u] = I_TPL; }   // a product is never armed; with catalysis it is finished
      else if (!p.energyGate || (bK && (this.ss[b[o + K]] === S.ON || this.ss[b[o + K]] === S.GIVE))) { this.is[u] = I_TPL; this._event('rearm', u); }  // R4 re-arm (energy, or fuel held in a pocket)
      else if (p.feed && ((bL && (this.ss[b[o + L]] === S.FEED || this.ss[b[o + L]] === S.FSH)) || (bR && (this.ss[b[o + R]] === S.FEED || this.ss[b[o + R]] === S.FSH)))) { this.is[u] = I_TPL; this.fedEvents++; this._event('rearm', u); }  // R4b re-arm through a bond (feed rule)
    } else { // I_TPL
      if (p.cut && bF && this.ss[b[o + F]] === S.CUT && this.rng() < p.pCut) {   // C1 cut: bound to a cutter's face, I let go of everything
        this.pendingUnlink.push(o + F, o + L, o + R); this.cutEvents++; this._event('cut', u, b[o + F] >> 2); return;
      }
      if (nl === 0) this.is[u] = pool;                                     // R3
      else if (bF && isProd(this.type[u])) {
        // catalysis: a finished product bound to a back lets go fast where it is alone, slowly inside a bound run
        const isH = (x) => x === S.HYB || x === S.HYBC;
        const nh = (bL && isH(this.ss[b[o + L]]) ? 1 : 0) + (bR && isH(this.ss[b[o + R]]) ? 1 : 0);
        let pm = nh === 0 ? p.pPMelt : p.pPMeltRun;
        if (p.pMisMelt >= 0 && this._code[this.type[b[o + F] >> 2]] !== this.type[u]) pm = Math.max(pm, p.pMisMelt);   // graded: a mismatch lets go
        if (this.rng() < pm) this.pendingUnlink.push(o + F);
      }
      else if (bF && this.ss[b[o + F]] !== S.DOCK && (b[o + F] >> 2) > u && !(p.backCopy && isKT(this.ss[b[o + F]]))) {
        // binding melts: fast where no neighbour is bound, slowly where one is (rolled once per bond, by its lower end)
        const isH = (x) => x === S.HYB || x === S.HYBC;
        const nh = (bL && isH(this.ss[b[o + L]]) ? 1 : 0) + (bR && isH(this.ss[b[o + R]]) ? 1 : 0);
        let pm = nh === 0 ? p.pMelt : nh === 2 || p.pMeltEnd < 0 ? p.pMeltRun : p.pMeltEnd;
        if (this._hot && pm < p.heatMelt) pm = p.heatMelt;
        if (this.rng() < pm) { this.pendingUnlink.push(o + F); this.meltEvents++; }
      }
    }
    // S1 stack melting: a face held on a back lets go at pSMelt with no stacked lateral neighbour, pSMeltEnd with one, pSMeltRun with two,
    // so a row comes off its stack by unzipping from its ends
    if (p.stack && bF && (st === I_HOLD || st === I_TPL) && isKT(this.ss[b[o + F]])) {
      const sk = this.stk, ns = (bL && sk[b[o + L]] ? 1 : 0) + (bR && sk[b[o + R]] ? 1 : 0);
      if (this.rng() < (ns === 0 ? p.pSMelt : ns === 1 ? p.pSMeltEnd : p.pSMeltRun)) { this.pendingUnlink.push(o + F); this.stackMelts++; }
    }
    // R5 fraying: an end unit of an undocked strand falls off. With pUnzip > 0 it first reads FRAY for one step,
    // and an undocked neighbour that reads FRAY on its partner side follows it with probability pUnzip (processive fraying).
    const cap = this.type[u] === T_P || this.type[u] === T_Q, pfr = cap ? p.pFray * p.capFray : p.pFray;
    // (stack rule) a unit whose back holds a stacked unit's face is held too: in a stack only a lone row can fray
    const hk = p.stack && bK && (this.ss[b[o + K]] === S.HOLD || this.ss[b[o + K]] === S.TPL_MM || this.ss[b[o + K]] === S.TPL_LF || this.ss[b[o + K]] === S.TPL_RF);
    if (this.is[u] !== I_DOCK && !bF && !hk && nl === 1 && p.pFray > 0 && this.rng() < pfr) {
      this.fresh[u] = 0; this.frayEvents++; this._event('fray', u);
      if (p.pUnzip > 0) this.is[u] = I_FRAY;
      else { this.is[u] = pool; this.pendingUnlink.push(o + L, o + R); }
      return;
    }
    if (p.pUnzip > 0 && this.is[u] !== I_DOCK && !bF && !hk && ((bL && this.ss[b[o + L]] === S.FRAY) || (bR && this.ss[b[o + R]] === S.FRAY)) && this.rng() < (cap ? p.pUnzip * p.capFray : p.pUnzip)) {
      this.is[u] = I_FRAY; this.fresh[u] = 0; this.unzipEvents++;
      return;
    }
    // R7 radiation: each of my lateral bonds breaks with probability pBreak scaled by how fragile the two blocks are.
    // A docked copy re-links at once (its neighbours are still flush and sticky), so a template shields its copy.
    if (p.pBreak > 0 && nl > 0 && (p.radBand >= 1 || this.px[u] < p.radBand * p.W)) {   // radBand: radiation only where x < radBand * W
      const mine = 1 - this._resT[this.type[u]];
      for (const side of [L, R]) {
        const q = b[o + side]; if (q < 0) continue;
        const v = q >> 2; if (v < u) continue;   // each bond is rolled once, by its lower-numbered end
        const s1 = this.ss[o + side], s2 = this.ss[q];
        if (s1 === S.SHIELD || s1 === S.FSH || s2 === S.SHIELD || s2 === S.FSH) continue;   // shield rule: a shielded bond does not break
        const theirs = 1 - this._resT[this.type[v]];
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
      if ((isM ? this.type[start] !== T_M : (this.type[start] === T_E || this.type[start] === T_M || this.type[start] === T_J || isFuel(this.type[start]))) || seen[start] || this.bond[start * 4 + L] < 0 || this.bond[start * 4 + R] < 0) continue;
      const c = []; let u = start;
      while (u >= 0 && !seen[u] && c.length < 100000) { seen[u] = 1; c.push(u); const q = this.bond[u * 4 + R]; u = q < 0 || this.type[q >> 2] === T_J ? -1 : q >> 2; }
      if (u === start && c.length >= 3) { cyc = c; break; }
    }
    for (const u of units) seen[u] = 0;
    return cyc;
  }

  /** The longest L->R chain of A/B units in a unit list, as an array of unit indices; a ring counts as a chain from an arbitrary start. */
  chainOf(units) {
    let best = this.cycleOf(units);
    for (const start of units) {
      const ql = this.bond[start * 4 + L];
      if (this.type[start] === T_E || this.type[start] === T_M || this.type[start] === T_J || this.type[start] === T_X || this.type[start] === T_G || isFuel(this.type[start]) || (ql >= 0 && this.type[ql >> 2] !== T_J)) continue;
      const c = []; let u = start;
      while (u >= 0 && c.length < 100000) { c.push(u); const q = this.bond[u * 4 + R]; u = q < 0 || this.type[q >> 2] === T_J ? -1 : q >> 2; }
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

  /** The strand through unit u, L->R: its own chain, not the longest in its component (a template may be bound to another strand, or
   * a copy may bridge two templates, and those belong to its component too). Observation only. */
  strandOf(u) {
    const b = this.bond, J = (q) => q < 0 || this.type[q >> 2] === T_J;
    let s = u;
    for (let k = 0; k < 100000; k++) { const q = b[s * 4 + L]; if (J(q) || (q >> 2) === u) break; s = q >> 2; }
    const c = [];
    for (let x = s; x >= 0 && c.length < 100000;) { c.push(x); const q = b[x * 4 + R]; x = J(q) || (q >> 2) === s ? -1 : q >> 2; }
    return c;
  }

  /** Read a strand's sequence L->R from a unit list (E units ignored). */
  _letter(u) { const c = TNAME[this.type[u]]; return this.hand[u] ? c.toLowerCase() : c; }
  sequenceOf(units) { return this.chainOf(units).map((u) => this._letter(u)).join(''); }

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
      if (isProd(this.type[chain[0]])) {
        // a product chain came off its template (translate rule): logged with its template's sequence, not counted as a birth
        let tseq = '';
        if (pu >= 0) tseq = this.strandOf(pu).map((x) => this._letter(x)).join('');
        for (const x of chain) this.fresh[x] = 0;
        this.prodCount++;
        const seq = chain.map((x) => this._letter(x)).join('');
        this._event('product', chain[0]);
        if (this.p.logBirths) {
          this.births.push({ t: this.t, seq, prod: 1, parent: tseq, x: this.px[chain[0]], y: this.py[chain[0]] });
          if (this.births.length > this.p.maxBirthLog) this.births.splice(0, this.births.length - this.p.maxBirthLog);
        }
        continue;
      }
      let pgen = 0, parentSeq = '';
      if (pu >= 0) {
        const pchain = this.strandOf(pu);
        parentSeq = pchain.map((u) => this._letter(u)).join('');
        for (const u of pchain) if (this.gen[u] > pgen) pgen = this.gen[u];
      }
      const g = pgen + 1; if (g > this.maxGen) this.maxGen = g;
      for (const u of chain) { this.gen[u] = g; this.fresh[u] = 0; }
      this.birthCount++;
      const seq = chain.map((u) => this._letter(u)).join('');
      this._event('birth', chain[0]);
      if (this.p.logBirths) {
        this.births.push({ t: this.t, seq, gen: g, parent: parentSeq, x: this.px[chain[0]], y: this.py[chain[0]] });
        if (this.births.length > this.p.maxBirthLog) this.births.splice(0, this.births.length - this.p.maxBirthLog);
      }
    }
    this.brokeF.length = 0;
  }

  /** Stack rule: log a birth for every row that has just been finished on a back and holds it (every unit held or armed). */
  _logRows() {
    if (this.heldNew.length === 0) return;
    const done = new Set();
    for (const u0 of this.heldNew) {
      if (done.has(u0) || this.is[u0] !== I_HOLD) continue;
      const row = this.strandOf(u0);
      for (const x of row) done.add(x);
      if (row.length < 2) continue;
      let nFresh = 0, pu = -1, ok = true;
      for (const u of row) {
        if (this.is[u] === I_DOCK) { ok = false; break; }
        if (this.fresh[u]) { nFresh++; if (pu < 0 && this.parentOf[u] >= 0) pu = this.parentOf[u]; }
      }
      if (!ok || nFresh * 2 < row.length) continue;
      let pgen = 0, parentSeq = '';
      if (pu >= 0) { const pchain = this.strandOf(pu); parentSeq = pchain.map((x) => this._letter(x)).join(''); for (const x of pchain) if (this.gen[x] > pgen) pgen = this.gen[x]; }
      const g = pgen + 1; if (g > this.maxGen) this.maxGen = g;
      for (const x of row) { this.gen[x] = g; this.fresh[x] = 0; }
      this.birthCount++; this.stackRows++;
      const seq = row.map((x) => this._letter(x)).join('');
      this._event('birth', row[0]);
      if (this.p.logBirths) {
        this.births.push({ t: this.t, seq, gen: g, parent: parentSeq, stk: 1, x: this.px[row[0]], y: this.py[row[0]] });
        if (this.births.length > this.p.maxBirthLog) this.births.splice(0, this.births.length - this.p.maxBirthLog);
      }
    }
    this.heldNew.length = 0;
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
    this._hot = this.p.heatPeriod > 0 && (this.t % this.p.heatPeriod) < this.p.heatFrac * this.p.heatPeriod;
    this._physics();
    this._formBonds();
    this._chemistry();
  }

  /** Droplets: a pair of G blocks a little apart (up to gRange of touching) closes gStick of the gap; a letter and a G at
   * gStickS (in a strand) or gStickF (free) of that. An attraction between neighbours, nothing more. */
  _stick(pairs) {
    const p = this.p, px = this.px, py = this.py, wt = this.w, rad = this.rad, W = p.W, H = p.H, type = this.type, bond = this.bond;
    for (let k = 0; k < pairs.length; k += 2) {
      const u = pairs[k], v = pairs[k + 1], gu = type[u] === T_G, gv = type[v] === T_G;
      if (!gu && !gv) continue;
      let c = p.gStick;
      if (!(gu && gv)) {
        const x = gu ? v : u, t = type[x], xb = x * 4;
        if (!LETTERS.includes(t)) continue;
        c *= bond[xb] >= 0 || bond[xb + 1] >= 0 || bond[xb + 3] >= 0 ? p.gStickS : p.gStickF;
        if (c <= 0) continue;
      }
      let dx = px[v] - px[u]; dx -= W * Math.round(dx / W);
      let dy = py[v] - py[u]; dy -= H * Math.round(dy / H);
      const rr = rad[u] + rad[v], d2 = dx * dx + dy * dy;
      if (d2 <= rr * rr || d2 >= rr * rr * p.gRange * p.gRange) continue;
      const d = Math.sqrt(d2), m = c * (d - rr) / d, wu = wt[u], wv = wt[v], ws = wu + wv;
      px[u] = this._wx(px[u] + dx * m * wu / ws); py[u] = this._wy(py[u] + dy * m * wu / ws);
      px[v] = this._wx(px[v] - dx * m * wv / ws); py[v] = this._wy(py[v] - dy * m * wv / ws);
    }
  }

  /** A block's Brownian step size (translation) and turn size, from its mobility knobs. */
  _mobility(u) {
    const p = this.p, t = this.type[u], ub = u * 4, bond = this.bond;
    const slow = p.mobS !== 1 && t !== T_E && t !== T_X && (bond[ub] >= 0 || bond[ub + 1] >= 0 || bond[ub + 2] >= 0 || bond[ub + 3] >= 0);
    let mob = t === T_M ? p.mobM : slow ? p.mobS : 1;
    if (this._mobL[t] !== 1) mob *= this._mobL[t];
    const sw = t === T_E ? Math.sqrt(this.w[u]) * p.mobE : t === T_X ? Math.sqrt(this.w[u]) * p.mobX : Math.sqrt(this.w[u]) * mob;
    return sw;
  }

  /** bodyJostle: a free block jostles alone; a set of bonded blocks moves and turns as one rigid body. Every block still gets its
   * own kick in effect: the body's move is the mean of its blocks' kicks and its turn the torque they exert about its centre, so a
   * body of n blocks steps about 1/sqrt(n) as far and a long one turns slowly. Nothing reads the body; it is how rigid bonds move. */
  _jostleBodies() {
    const p = this.p, n = this.n, px = this.px, py = this.py, pa = this.pa, ox = this.ox, oy = this.oy, bond = this.bond, wt = this.w;
    const seen = this._jb || (this._jb = new Int32Array(n)), mark = ++this._jbMark || (this._jbMark = 1);
    const list = this._jbList || (this._jbList = new Int32Array(n)), rx = this._jbx || (this._jbx = new Float64Array(n)), ry = this._jby || (this._jby = new Float64Array(n));
    const rot = (u, c, s) => { for (let k = u * NV, e = k + this.nv[this.type[u]]; k < e; k++) { const x = ox[k], y = oy[k]; ox[k] = c * x - s * y; oy[k] = s * x + c * y; } };
    for (let u0 = 0; u0 < n; u0++) {
      if (seen[u0] === mark) continue;
      seen[u0] = mark;
      const b0 = u0 * 4;
      if (bond[b0] < 0 && bond[b0 + 1] < 0 && bond[b0 + 2] < 0 && bond[b0 + 3] < 0) {
        const sw = this._mobility(u0), t = this.type[u0];
        px[u0] = this._wx(px[u0] + p.sigma * sw * this._gauss()); py[u0] = this._wy(py[u0] + p.sigma * sw * this._gauss());
        const mob = t === T_E ? 1 : sw / Math.sqrt(wt[u0]);
        const da = p.sigmaRot * wt[u0] * mob * this._gauss();
        pa[u0] += da; rot(u0, Math.cos(da), Math.sin(da));
        continue;
      }
      // the body: every block reachable through bonds, with its offset from the first one
      let m = 0; list[m++] = u0; rx[u0] = 0; ry[u0] = 0;
      for (let k = 0; k < m; k++) {
        const x = list[k];
        for (let i = 0; i < 4; i++) {
          const q = bond[x * 4 + i]; if (q < 0) continue;
          const v = q >> 2; if (seen[v] === mark) continue;
          seen[v] = mark; list[m++] = v;
          rx[v] = rx[x] + this._dx(px[v] - px[x]); ry[v] = ry[x] + this._dy(py[v] - py[x]);
        }
      }
      let cx = 0, cy = 0, s2 = 0, tq = 0, inertia = 0;
      for (let k = 0; k < m; k++) { const x = list[k]; cx += rx[x]; cy += ry[x]; }
      cx /= m; cy /= m;
      for (let k = 0; k < m; k++) {
        // the body's move is the mean of its blocks' kicks; its turn is the torque of those kicks plus the blocks' own turns, each
        // weighed by the block's own moment of inertia (1 / wr), over the body's moment of inertia
        const x = list[k], sw = this._mobility(x), dxx = rx[x] - cx, dyy = ry[x] - cy, r2 = dxx * dxx + dyy * dyy, ib = 1 / this.wr[x];
        s2 += sw * sw; inertia += r2 + ib;
        const mob = this.type[x] === T_E ? 1 : sw / Math.sqrt(wt[x]), spin = p.sigmaRot * wt[x] * mob;
        tq += r2 * p.sigma * p.sigma * sw * sw + ib * ib * spin * spin;
      }
      const st = p.sigma * Math.sqrt(s2) / m;              // mean of m independent kicks
      const sr = Math.sqrt(tq) / inertia;                 // turn: torque of the kicks and the blocks' own turns over the body's inertia
      const tx = st * this._gauss(), ty = st * this._gauss(), da = sr * this._gauss(), c = Math.cos(da), s = Math.sin(da);
      const ax = px[u0] + cx, ay = py[u0] + cy;   // the centre, in world coordinates
      for (let k = 0; k < m; k++) {
        const x = list[k], dxx = rx[x] - cx, dyy = ry[x] - cy;
        px[x] = this._wx(ax + c * dxx - s * dyy + tx); py[x] = this._wy(ay + s * dxx + c * dyy + ty);
        pa[x] += da; rot(x, c, s);
      }
    }
  }

  /** Jostling; one neighbour scan; then pins, contacts and shape relaxation solved together. Leaves the hash built. */
  _physics() {
    const p = this.p, n = this.n;
    const px = this.px, py = this.py, pa = this.pa, ox = this.ox, oy = this.oy, rad = this.rad, bond = this.bond, wt = this.w, wr = this.wr, vw = this.vw;
    const W = p.W, H = p.H, gw = this.gw, gh = this.gh;
    // torus wrap: a difference well inside half the world needs none (the full formula gives the same number there, without a division)
    const hwW = 0.49 * W, hwH = 0.49 * H;
    // 1. Brownian jostling: each block translates and turns as a whole (its shape changes only under pins)
    if (p.bodyJostle) this._jostleBodies();
    else for (let u = 0; u < n; u++) {
      const ub = u * 4, slow = p.mobS !== 1 && this.type[u] !== T_E && this.type[u] !== T_X && (bond[ub] >= 0 || bond[ub + 1] >= 0 || bond[ub + 2] >= 0 || bond[ub + 3] >= 0);
      // mobility: energy mobE, rays mobX, membrane mobM (bonded or not), other bonded blocks mobS
      let mob = this.type[u] === T_M ? p.mobM : slow ? p.mobS : 1;
      if (this._mobL[this.type[u]] !== 1) mob *= this._mobL[this.type[u]];   // mobA..mobD: a letter's own mobility
      const sw = this.type[u] === T_E ? Math.sqrt(wt[u]) * p.mobE : this.type[u] === T_X ? Math.sqrt(wt[u]) * p.mobX : Math.sqrt(wt[u]) * mob;
      px[u] = this._wx(px[u] + p.sigma * sw * this._gauss()); py[u] = this._wy(py[u] + p.sigma * sw * this._gauss());
      const da = p.sigmaRot * wt[u] * mob * this._gauss(), c = Math.cos(da), s = Math.sin(da);
      pa[u] += da;
      for (let k = u * NV, e = k + this.nv[this.type[u]]; k < e; k++) { const x = ox[k], y = oy[k]; ox[k] = c * x - s * y; oy[k] = s * x + c * y; }
    }
    this._buildHash();
    // 2. one neighbour scan: every pair of units whose centres are within reach, for contacts now and bonding after
    const pairs = this.pairs; pairs.length = 0;
    const reach2 = this.reach * this.reach, start = this.cellStart, items = this.cellItems, fwd = this.fwd, nc = gw * gh;
    for (let c = 0; c < nc; c++) {
      const s0 = start[c], e0 = start[c + 1];
      for (let a = s0; a < e0; a++) {
        const u = items[a], x = px[u], y = py[u];
        // the rest of my own cell, then my four forward cells (each pair of cells is scanned from one side only)
        for (let f = -1; f < 4; f++) {
          let k0, k1;
          if (f < 0) { k0 = a + 1; k1 = e0; } else { const c2 = fwd[c * 4 + f]; k0 = start[c2]; k1 = start[c2 + 1]; }
          for (let k = k0; k < k1; k++) {
            const v = items[k];
            let dx = px[v] - x; if (dx > hwW || dx < -hwW) dx -= W * Math.round(dx / W);
            let dy = py[v] - y; if (dy > hwH || dy < -hwH) dy -= H * Math.round(dy / H);
            if (dx * dx + dy * dy < reach2) pairs.push(u, v);
          }
        }
      }
    }
    // contacts: the pairs that are not bonded and close enough that they might touch during the solve
    const contacts = this._contacts || (this._contacts = []); contacts.length = 0;
    for (let k = 0; k < pairs.length; k += 2) {
      const u = pairs[k], v = pairs[k + 1], ub = u * 4;
      let dx = px[v] - px[u]; if (dx > hwW || dx < -hwW) dx -= W * Math.round(dx / W);
      let dy = py[v] - py[u]; if (dy > hwH || dy < -hwH) dy -= H * Math.round(dy / H);
      const rr = (rad[u] + rad[v]) * 1.3;
      if (dx * dx + dy * dy >= rr * rr) continue;
      if ((bond[ub] >> 2) === v || (bond[ub + 1] >> 2) === v || (bond[ub + 2] >> 2) === v || (bond[ub + 3] >> 2) === v) continue;
      if ((this.type[u] === T_X || this.type[v] === T_X) && this.type[u] !== T_M && this.type[v] !== T_M) continue;   // a ray meets only membrane
      if (p.memPerm && (this.type[u] === T_M) !== (this.type[v] === T_M)) {
        // a free monomer passes through membrane
        const x = this.type[u] === T_M ? v : u, xb = x * 4;
        if (this.type[x] !== T_E && bond[xb] < 0 && bond[xb + 1] < 0 && bond[xb + 2] < 0 && bond[xb + 3] < 0) continue;
      }
      contacts.push(u, v);
    }
    if (p.nG > 0) this._stick(pairs);
    // 3. constraints
    this._bondList();
    const pins = this.pins, soft = this._soft || (this._soft = []);
    for (let t = 0; t < NT; t++) soft[t] = t === T_E ? 0 : 1 - typeParam(p, 'stiff', t, 1);
    const bonded = this._bondedUnits || (this._bondedUnits = []); bonded.length = 0;
    const mark = this._seen;
    for (let k = 0; k < pins.length; k++) { const u = (pins[k] / NV) | 0; if (!mark[u]) { mark[u] = 1; bonded.push(u); } }
    for (const u of bonded) mark[u] = 0;
    const shaped = this._shaped || (this._shaped = new Uint8Array(n)), shapeC = this._shapeC || (this._shapeC = new Float64Array(n)), shapeS = this._shapeS || (this._shapeS = new Float64Array(n));
    for (let it = 0; it < p.iters; it++) {
      for (let k = 0; k < contacts.length; k += 2) {
        const u = contacts[k], v = contacts[k + 1];
        let dx = px[v] - px[u]; if (dx > hwW || dx < -hwW) dx -= W * Math.round(dx / W);
        let dy = py[v] - py[u]; if (dy > hwH || dy < -hwH) dy -= H * Math.round(dy / H);
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
        let dx = px[v] + ox[qb] - px[u] - ox[qa]; if (dx > hwW || dx < -hwW) dx -= W * Math.round(dx / W);
        let dy = py[v] + oy[qb] - py[u] - oy[qa]; if (dy > hwH || dy < -hwH) dy -= H * Math.round(dy / H);
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
        if (soft[t] === 0 && !p.snapCorners) continue;   // rigid blocks keep their shape by moving rigidly, unless corners are snapped
        // shape matching: best-fit rotation of the rest shape onto the corners, then pull toward it by the stiffness;
        // the centre is re-read as the mean of the corners
        const o = u * NV, r = this._restSlot(u) * NV, nv = this.nv[t];
        let mx = 0, my = 0;
        for (let k = 0; k < nv; k++) { mx += ox[o + k]; my += oy[o + k]; }
        mx /= nv; my /= nv; px[u] += mx; py[u] += my;
        let A = 0, B = 0;
        for (let k = 0; k < nv; k++) { ox[o + k] -= mx; oy[o + k] -= my; A += this.rx[r + k] * ox[o + k] + this.ry[r + k] * oy[o + k]; B += this.rx[r + k] * oy[o + k] - this.ry[r + k] * ox[o + k]; }
        const hyp = Math.sqrt(A * A + B * B) || 1, c = A / hyp, s = B / hyp, a = 1 - soft[t];   // the best-fit turn (cos, sin)
        for (let k = 0; k < nv; k++) {
          const gx = c * this.rx[r + k] - s * this.ry[r + k], gy = s * this.rx[r + k] + c * this.ry[r + k];
          ox[o + k] += a * (gx - ox[o + k]); oy[o + k] += a * (gy - oy[o + k]);
        }
        shaped[u] = 1; shapeC[u] = c; shapeS[u] = s;
      }
    }
    for (const u of bonded) if (shaped[u]) { pa[u] = Math.atan2(shapeS[u], shapeC[u]); shaped[u] = 0; }   // a shaped block's angle: its last fit
    for (let u = 0; u < n; u++) { px[u] = this._wx(px[u]); py[u] = this._wy(py[u]); pa[u] = wrapAngle(pa[u]); }
    if (p.maxStrain > 0) {
      // strain: a bond whose corners the passes could not bring together lets go (applied with the rule breaks)
      const lim2 = p.maxStrain * p.maxStrain, lim2s = p.maxStrainStrand * p.maxStrainStrand, bl = this.bonds;
      for (let k = 0, q = 0; k < bl.length; k++) {
        const u = bl[k] >> 2, v = this.bond[bl[k]] >> 2;
        if (this.type[u] === T_E || this.type[v] === T_E) continue;
        const a0 = pins[q], b0 = pins[q + 1], a1 = pins[q + 2], b1 = pins[q + 3]; q += 4;
        let g = 0;
        for (const [qa, qb] of [[a0, b0], [a1, b1]]) {
          let dx = px[v] + ox[qb] - px[u] - ox[qa]; dx -= W * Math.round(dx / W);
          let dy = py[v] + oy[qb] - py[u] - oy[qa]; dy -= H * Math.round(dy / H);
          g = Math.max(g, dx * dx + dy * dy);
        }
        if (g > lim2) {
          // a lone docked monomer under strain falls off (as in undocking); a membrane bond breaks where it is; a strand's own
          // bond only past its own, higher limit; the units of a copy in progress hold each other
          const dk = (x) => x >= 0 && this.type[x] !== T_M && this.is[x] === I_DOCK && this.bond[x * 4 + F] >= 0;
          const m = dk(u) ? u : dk(v) ? v : -1;
          if (m < 0 && this.type[u] !== T_M && (lim2s === 0 || g <= lim2s)) continue;
          if (m >= 0) {
            if (this.bond[m * 4 + L] >= 0 || this.bond[m * 4 + R] >= 0) continue;   // a copy in progress holds its units (measured: breaking it costs fidelity)
            this.pendingUnlink.push(m * 4 + F); this.kicked.push(m);               // a lone docked monomer falls off, as in undocking
          } else { this.pendingUnlink.push(bl[k]); if (this.type[u] !== T_M) this.strainBackbone++; }
          this.strainEvents++; if ((bl[k] & 3) === F) this.strainFace++; this._event('snap', u, v);
        }
      }
    }
    if (p.snapCorners && pins.length) {
      // corners onto corners: every group of corners pinned together (two blocks, or three or four meeting at a point) moves
      // to its common mean, so the blocks deform just enough to meet exactly
      const groups = this._cornerGroups();
      for (const g of groups) {
        const q0 = g[0], u0 = (q0 / NV) | 0, x0 = px[u0] + ox[q0], y0 = py[u0] + oy[q0];
        let mx = 0, my = 0;
        for (const q of g) { const u = (q / NV) | 0; let dx = px[u] + ox[q] - x0; dx -= W * Math.round(dx / W); let dy = py[u] + oy[q] - y0; dy -= H * Math.round(dy / H); mx += dx; my += dy; }
        mx /= g.length; my /= g.length;
        for (const q of g) { const u = (q / NV) | 0; let dx = px[u] + ox[q] - x0; dx -= W * Math.round(dx / W); let dy = py[u] + oy[q] - y0; dy -= H * Math.round(dy / H); ox[q] += mx - dx; oy[q] += my - dy; }
      }
    }
    this._buildHash();   // for the empty-slot check when bonds form
  }

  /** Every pair of open units from this step's neighbour scan that is within docking distance gets a chance to bond. */
  _formBonds() {
    const p = this.p, px = this.px, py = this.py, open = this.open, size = this.size, pairs = this.pairs, W = p.W, H = p.H, hwW = 0.49 * W, hwH = 0.49 * H;
    const is = this.is, bond = this.bond, noSpont = !(p.pSpont > 0);
    for (let k = 0; k < pairs.length; k += 2) {
      const u = pairs[k], v = pairs[k + 1];
      if (p.nX > 0 && (this.type[u] === T_X) !== (this.type[v] === T_X)) { if (this.type[u] === T_X) this._rayHit(u, v); else this._rayHit(v, u); continue; }
      if (!open[u] || !open[v]) continue;
      // two unbonded blocks in state 0 (free monomers, spent energy, raw membrane) have no side pair that can bond except two
      // inert laterals, at pSpont: with pSpont 0 the pair is skipped (the table would say 0 for every side pair)
      if (noSpont && is[u] === 0 && is[v] === 0) {
        const bu = u * 4, bv = v * 4;
        if (bond[bu] < 0 && bond[bu + 1] < 0 && bond[bu + 2] < 0 && bond[bu + 3] < 0 && bond[bv] < 0 && bond[bv + 1] < 0 && bond[bv + 2] < 0 && bond[bv + 3] < 0) continue;
      }
      let dx = px[v] - px[u]; if (dx > hwW || dx < -hwW) dx -= W * Math.round(dx / W);
      let dy = py[v] - py[u]; if (dy > hwH || dy < -hwH) dy -= H * Math.round(dy / H);
      const d0 = (size[u] + size[v]) / 2, d2 = dx * dx + dy * dy;
      const dmax = d0 * (1 + p.distTol), dmin = d0 * (1 - p.distTol);
      if (d2 > dmax * dmax || d2 < dmin * dmin) continue;
      this._tryBond(u, v, dx, dy, Math.sqrt(d2));
    }
  }

  /** A ray touching block v breaks one of v's lateral bonds, at rayHit scaled by the resistance of the two blocks it joins
   * (membrane at resM); a shielded bond does not break. */
  _rayHit(x, v) {
    const p = this.p, t = this.type[v];
    if (t === T_E || t === T_X || t === T_G) return;
    let dx = this.px[v] - this.px[x]; dx -= p.W * Math.round(dx / p.W);
    let dy = this.py[v] - this.py[x]; dy -= p.H * Math.round(dy / p.H);
    const reach = 0.5 * (this.size[x] + this.size[v]); if (dx * dx + dy * dy > reach * reach) return;
    const o = v * 4, bL = this.bond[o + L] >= 0, bR = this.bond[o + R] >= 0; if (!bL && !bR) return;
    const side = bL && bR ? (this.rng() < 0.5 ? L : R) : bL ? L : R, q = this.bond[o + side], w = q >> 2;
    const s1 = this.ss[o + side], s2 = this.ss[q];
    if (s1 === S.SHIELD || s1 === S.FSH || s2 === S.SHIELD || s2 === S.FSH) return;
    const res = (y) => this.type[y] === T_M ? p.resM : typeParam(p, 'res', this.type[y], 0);
    if (this.rng() < p.rayHit * (1 - res(v)) * (1 - res(w))) { this.pendingUnlink.push(o + side); this.rayHits++; this._event('break', v, w); }
  }

  /** Transitions, bond holding, births, energy reload. */
  _chemistry() {
    const p = this.p, n = this.n, rng = this.rng;
    // 5. state transitions (synchronous: all read last step's derived states; bond breaks are applied after)
    const resT = this._resT || (this._resT = new Float64Array(NT)); for (let t = 0; t < NT; t++) resT[t] = typeParam(p, 'res', t, 0);   // (read once a step)
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
    if (this.p.stack) this._logRows();
    this._kickOff();
    // 8. energy reload (E is never created or destroyed; it flips OFF -> ON)
    for (let u = 0; u < n; u++) {
      if ((this.type[u] !== T_E && !isFuel(this.type[u])) || this.is[u] !== I_OFF) continue;
      if (this.type[u] === T_E) { if (rng() < p.pReload) this.is[u] = I_ON; }
      else if (this.bond[u * 4] < 0 && this.bond[u * 4 + 1] < 0 && this.bond[u * 4 + 2] < 0 && this.bond[u * 4 + 3] < 0 && rng() < (this.type[u] === T_V && p.pReloadV >= 0 ? p.pReloadV : p.pReloadU)) this.is[u] = I_ON;   // spent fuel, free
    }
    for (let u = 0; u < n; u++) if (this.type[u] === T_E || isFuel(this.type[u])) this._derive(u);
    if (p.pRacem > 0) for (let u = 0; u < n; u++) {
      const b = u * 4;
      if (LETTERS.includes(this.type[u]) && this.bond[b] < 0 && this.bond[b + 1] < 0 && this.bond[b + 2] < 0 && this.bond[b + 3] < 0 && rng() < p.pRacem) this.hand[u] ^= 1;
    }
    this._computeOpen();
    this._relaxFreed();
  }

  /** An undocked monomer is pushed off the face it left (physics). */
  _kickOff() {
    for (const u of this.kicked) {
      this.px[u] = this._wx(this.px[u] - 0.6 * Math.cos(this.pa[u])); this.py[u] = this._wy(this.py[u] - 0.6 * Math.sin(this.pa[u]));
    }
    this.kicked.length = 0;
  }

  /** A unit that has lost every bond springs back to its rest shape; only units pinned this step can be out of shape. */
  _relaxFreed() {
    for (const u of this._bondedUnits || []) {
      if (this.bond[u * 4] < 0 && this.bond[u * 4 + 1] < 0 && this.bond[u * 4 + 2] < 0 && this.bond[u * 4 + 3] < 0) this._resetShape(u);
    }
  }

  run(steps) { for (let i = 0; i < steps; i++) this.step(); }

  /** The whole state as a JSON-safe object: parameters, every per-block array, every counter, the random generator. Take it
   * between steps. Sim.fromState(saved) continues the run exactly where it was (or, with changed parameters, branches it). */
  saveState() {
    const arrays = {}, nums = {};
    for (const k of Object.keys(this)) {
      const v = this[k];
      if (k === '_spare') { nums[k] = Number.isNaN(v) ? null : v; continue; }
      if (k.startsWith('_') || k === 'p') continue;
      if (ArrayBuffer.isView(v) && ARRAY_TYPES[v.constructor.name]) arrays[k] = { t: v.constructor.name, b: toB64(v) };
      else if (typeof v === 'number' || typeof v === 'boolean') nums[k] = v;
    }
    return { version: 1, p: this.p, rng: this.rng.getState(), arrays, nums };
  }

  /** A Sim rebuilt from saveState(); `changes` (optional) overrides parameters, to branch a run. */
  static fromState(st, changes) {
    const s = new this(Object.assign({}, st.p, changes || {}));
    for (const k in st.arrays) {
      const a = fromB64(st.arrays[k].b, ARRAY_TYPES[st.arrays[k].t]);
      if (s[k] && s[k].length === a.length) s[k].set(a); else s[k] = a;
    }
    for (const k in st.nums) s[k] = k === '_spare' && st.nums[k] === null ? NaN : st.nums[k];
    s.rng.setState(st.rng);
    s.bondsDirty = true; s._groupsFor = null;
    s._computeOpen();
    return s;
  }

  // ------------------------------------------------------------- observation
  // ------------------------------------------------------------- observation
  stats() {
    const n = this.n;
    let held = 0, stacked = 0, held1 = 0, held2 = 0, inactive = 0, totalAct = 0, free = 0, eOn = 0, eOff = 0, repel = 0, tpl = 0, docked = 0, bonds = 0, totalMotif = 0, memActive = 0;
    for (let u = 0; u < n; u++) {
      if (this.type[u] === T_M) { if (this.is[u] === I_ON) memActive++; continue; }
      if (this.type[u] === T_X || this.type[u] === T_J || this.type[u] === T_G) continue;
      if (isFuel(this.type[u])) { let nb = 0; for (let i = 0; i < 4; i++) if (this.bond[u * 4 + i] >= 0) nb++; if (nb === 1) held1++; else if (nb >= 2) held2++; continue; }
      if (this.type[u] === T_E) { if (this.is[u] === I_ON) eOn++; else eOff++; continue; }
      const o = u * 4;
      if (this.ss[o + K] === S.CHARGE) totalMotif++;
      if (this.is[u] === I_DOCK && this.bond[o] < 0 && this.bond[o + L] < 0 && this.bond[o + R] < 0) free++;
      if (this.is[u] === I_RAW) inactive++;
      if (this.ss[o + K] === S.ACT) totalAct++;
      if (this.is[u] === I_DOCK && this.bond[o] >= 0) docked++;
      if (this.is[u] === I_REPEL) repel++;
      if (this.is[u] === I_TPL) tpl++;
      if (this.is[u] === I_HOLD) held++;
      if (this.bond[o] >= 0 && (this.bond[o] & 3) === K && LETTERS.includes(this.type[this.bond[o] >> 2])) stacked++;
      for (let i = 0; i < 4; i++) if (this.bond[o + i] >= 0) bonds++;
    }
    const hist = new Map(); const seqs = new Map();
    let prodChains = 0, prodUnits = 0;
    let strands = 0, complexes = 0, totalLen = 0, maxLen = 0, components = 0, rings = 0, ringLen = 0;
    let nStacks = 0, stackRowsNow = 0, maxStack = 0;
    let memRings = 0, memRingLen = 0, memArcs = 0, enclosedAB = 0, enclosedE = 0, memFree = 0, enclosedTPL = 0, enclosedMotif = 0, ringsWithStrand = 0;
    const seen = new Uint8Array(n);
    for (let u0 = 0; u0 < n; u0++) {
      if (seen[u0]) continue;
      const comp = this.componentOf(u0);
      for (const x of comp) seen[x] = 1;
      components++;
      // membrane in this component (a ring or arc may be anchored on a strand, so both kinds are looked for in any component)
      let nM = 0; for (const x of comp) if (this.type[x] === T_M) nM++;
      if (nM > 0) {
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
        } else if (nM >= 2) memArcs++;
        if (nM === comp.length) continue;
      }
      let nAB = 0, faceBonded = false;
      for (const u of comp) { if (this.type[u] === T_E || this.type[u] === T_M || this.type[u] === T_J || this.type[u] === T_X || this.type[u] === T_G || isFuel(this.type[u])) continue; nAB++; if (this.bond[u * 4 + F] >= 0) faceBonded = true; }
      if (nAB < 2) continue;
      if (this.p.stack) {
        // rows in a stack: armed or held letter units that start a row (no left neighbour; a P cap has none), in a component with a stacked unit
        let rows = 0, st = false;
        for (const u of comp) {
          if (!LETTERS.includes(this.type[u])) continue;
          if ((this.is[u] === I_TPL || this.is[u] === I_HOLD) && this.bond[u * 4 + L] < 0) rows++;
          if (this.bond[u * 4] >= 0 && (this.bond[u * 4] & 3) === K) st = true;
        }
        if (st) { nStacks++; stackRowsNow += rows; if (rows > maxStack) maxStack = rows; }
      }
      // length and sequence are read off the longest chain, so a template that is being copied still counts
      const chain = this.chainOf(comp), len = chain.length;
      if (len > 0 && isProd(this.type[chain[0]])) { prodChains++; prodUnits += len; continue; }   // product chains are counted apart
      if (this.isRing(comp)) { rings++; ringLen += len; }
      if (faceBonded) complexes++; else strands++;
      totalLen += len; if (len > maxLen) maxLen = len;
      hist.set(len, (hist.get(len) || 0) + 1);
      const s = chain.map((u) => this._letter(u)).join(''); const rs = s.split('').reverse().join('');
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
      ligations: this.ligateEvents, frays: this.frayEvents, undocks: this.undockEvents, spont: this.spontEvents, breaks: this.breakEvents, unzips: this.unzipEvents, fed: this.fedEvents, made: this.makeEvents, binds: this.hybEvents, melts: this.meltEvents, activations: this.actEvents, inactive, totalAct, snaps: this.strainEvents, rayHits: this.rayHits, cuts: this.cutEvents, snapsFace: this.strainFace, snapsBackbone: this.strainBackbone, proofs: this.proofEvents, held1, held2, fuelUsed: this.fuelUsed,
      held, stacked, stackMelts: this.stackMelts, stackRows: this.stackRows, nStacks, maxStack, meanStack: nStacks ? stackRowsNow / nStacks : 0,
      energyCharged: this.energyCharged, products: this.prodCount, prodChains, prodUnits, bodies: components, rings, meanRingLen: rings ? ringLen / rings : 0,
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


return { Sim, I_HOLD, isKT, PRODUCTS, T_U, T_V, isFuel, T_1, T_2, T_3, T_4, isProd, NV, NT, COMP, PAIR, letterType, T_P, T_Q, T_J, T_G, DEFAULTS, REMOVED, S, SNAME, F, R, K, L, T_A, T_B, T_C, T_D, T_E, T_M, TNAME, LETTERS, T_X, I_DOCK, I_REPEL, I_TPL, I_FRAY, I_RAW, I_ON, I_OFF, SIDE_NAME, mulberry32 };
});
