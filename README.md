# Polygon Chemistry

An artificial life experiment: a 2D world of small rigid squares governed by one
fixed, universal rule table, in which template replication, copy errors, and
selection come out of the rules rather than being programmed into the creatures.

**Status.** Copying, mutation, selection and adaptation all come out of the rules. Length is selected in
an open population (cooperative docking with processive fraying); a private energy motif is selected and a
public one is not; populations adapt when the environment changes; on the deformable-polygon engine a block's
shape selects on the sequences that carry it; radiation selects a shield gene. Not yet: compartments that
keep their contents and divide, specific recognition between strands, and genomes that carry more than one
gene, all of which run into the same obstacle, that every pressure here costs long genomes more than short
ones. `AGENTS.md` is the working guide for whoever continues (`CLAUDE.md` imports it).
See [experiments/RESULTS.md](experiments/RESULTS.md) for the measurements.

## Run it

Open `index.html` in a browser (it loads `src/sim.js`; no build step, no
dependencies). Or serve the folder:

```sh
python3 -m http.server 8000     # then open http://localhost:8000/
```

The view opens zoomed on the seed strand. Scroll to zoom, drag to pan, click a
block to read its state and its partners' states, click an event in the feed to
jump to it. Every side of every block is drawn in the colour of its state, and
every bond is a white tie across the shared edge:

| colour | side | meaning |
|---|---|---|
| grey-blue | F | free monomer's face: will dock on a template of its type |
| green | F | template: a free monomer can dock here |
| orange | K | an `ABA` motif's back: recharges spent energy (motif rule) |
| moss green | M | membrane block; pale sides are its open ends |
| red | F | released, waiting for energy |
| dark | L/R | inert: a free monomer's lateral sides never bond |
| yellow | L/R | sticky: a docked unit's side, will bond to its neighbour |
| cyan | L/R | open strand end |
| white | L/R | bonded |
| magenta | K | wants an energy particle |
| bright yellow square | E | energy particle, charged |
| grey small square | E | energy particle, spent |

Headless, for experiments:

```sh
node run.js --steps 100000 --every 5000 --seed 3 --pSoft 0.02 --pCapture 0.05 --pFray 0.0003
node run.js --help            # any key of DEFAULTS in src/sim.js is a flag
node test.js                  # invariants: no junk chains, exact copies, energy accounting, conservation, determinism
node build.js                 # single-file dist/polygon-chemistry.html
./experiments/run_all.sh      # every experiment batch, about 35 minutes on 4 cores
node experiments/summarize.js # tables from experiments/out/*.csv
```

## The whole chemistry

A unit is a block with four working sides that are fixed for life: **F** (face), **R**,
**K** (back), **L**. The sides are not interchangeable. Only a face docks, and only
on the face of a template of the same type; L bonds only to a neighbour's R, so
every square has at most one neighbour on each lateral side and chains cannot
branch; the back takes only an energy particle. That is why forms are
one-dimensional. Membrane blocks (type M) are the only squares that build anything
else, and they build it around the chains, not out of them.

Monomer types **A** and **B** (and, with `nC`, `nD`, **C** and **D**) pair face to face with their own type. A third
type **E** is the energy particle. A fourth, **M**, is a membrane block: it bonds
only to other M blocks, side to side, at a built-in bend, so arcs and rings
self-assemble around whatever is there, and radiation opens them again. Each A/B
unit carries exactly one internal state:

```
DOCK    a free monomer, or a monomer docked on a template
REPEL   released from its template, needs re-arming
TPL     a template unit
```

Everything a neighbour can read is derived from that state and from which sides
are bonded. The face of a TPL unit reads as `TPL_MM`, `TPL_LF` or `TPL_RF`
according to which lateral sides are bonded, so a docked monomer can tell from its
partner whether it sits in the middle of the template or at an end.

**Bond formation** (the compatibility table, probabilistic and geometric):

| my side | partner side | probability | meaning |
|---|---|---|---|
| F `DOCK` | F `TPL_*`, same type | 1 | docking |
| F `DOCK` | F `TPL_*`, other type | `pSoft` | substitution |
| L `STICKY` | R `STICKY` | 1 | two docked neighbours link |
| L/R `STICKY`/`END` | R/L `END`/`STICKY` | `pLigate` | strands fuse end to end |
| L/R `INERT` | R/L `STICKY`/`END` | `pCapture` | a free monomer joins a strand without a template |
| K `WANT` | E `ON` | 1 | energy docks and is spent |
| K `CHARGE` | E `OFF` | 1 | a spent particle recharges at an `ABA` motif's back (motif rule) |
| L `INERT` | R `INERT` | `pSpont` | two free monomers join: life without a seed |
| F `TPL_*` | F `TPL_*`, complementary letter (A–B, C–D) | `pHyb` | two templates bind face to face (binding); kin never match |
| K `RAW` of a membrane block | K `MAKE` | 1 | a raw membrane block anchors on a strand and turns active (make rule) |
| L/R `RAW` of a membrane block | R/L `MEM` | `pMem` | an active membrane arc recruits a raw block (make rule) |

A docked unit's free lateral side reads `STICKY` only where its template partner's face says the template continues; at the template's end it reads `END`. That is what stops copies docked on two different templates from linking into chimeras.

**Transitions** (one internal state):

| rule | from | to | when |
|---|---|---|---|
| R1 | DOCK | REPEL | docked, and every lateral bond the template partner says I need is in place |
| R2 | DOCK | REPEL | laterally captured without a template |
| R3 | REPEL / TPL | DOCK | no lateral bonds left |
| R4 | REPEL | TPL | an ON energy particle is docked on K, or (with `feed`) a neighbour's side reads FEED: an armed `B` between two `A`s arms its neighbours through their bonds |
| R5 | REPEL / TPL | DOCK | fraying: an undocked end unit falls off with probability `pFray` per step |
| R5b | REPEL / TPL | FRAY, then DOCK | processive fraying: an undocked unit whose neighbour's side reads FRAY follows it with probability `pUnzip`, so a strand can unzip whole |
| R6 | DOCK (docked) | DOCK (free) | cooperativity: a docked monomer with no lateral bonds falls off with probability `pUndock` per step |
| R7 | any | same, one lateral bond broken | radiation: a lateral bond breaks with probability `pBreak` scaled by the two blocks' resistances (`resA` to `resD`), unless a side reads SHIELD (a `D` between two `C`s, with `shield`) |
| R8 | TPL (bound face to face) | same, face bond broken | binding melts: `pMelt` with no bound neighbour, `pMeltEnd` with one, `pMeltRun` with two |
| M1 | membrane raw | active | anchored on a MAKE back or recruited by an active block (make rule); back to raw at `pMemDecay` when alone |

**Bond holding.** A bond breaks the moment either side reads as `REPEL`,
`INERT`, `IDLE` or `OFF`. That is what releases a finished copy, resets a spent
energy particle, and frees a frayed unit.

**Energy.** Energy particles are half-size squares of a third type that never
chain. A charged one docks on the back of a released block, the block re-arms,
the particle is left spent and drifts off; nothing is absorbed and the count is
fixed. Spent particles recharge at a background rate or, with the motif rule, at the
back of a `B` block flanked by two `A`s, which makes energy income a property of
sequence.

There is no completion handshake and no cap type. A copy is released when every
unit is *locally* complete: a middle unit needs both lateral bonds, an end unit
needs one, and the unit learns which it is from its template partner's face
state. Because a docked monomer is rotated 180°, copies are antiparallel and a
child reads as the reverse of its parent, which is why every logged birth is
checked against `reverse(parent)`.

## Physics

Nothing bigger than a block exists in the physics. Each block is a polygon (a square, a wedge,
or an octagon) held to its rest shape by a restoring force whose strength is a per-type
stiffness. A bond pins the two corners of one edge onto the two corners of its partner's edge,
so bonded edges coincide and a strand moves as one body. Each block gets its own Brownian kick;
two blocks that are not bonded may not overlap. Pins, contacts and the shape restoring force are
solved together by nudging the blocks involved, 16 passes per step; a pin moves each block
rigidly and, by its softness, deforms the pinned corner.

Chains are straight because a row of pinned squares is straight, not because anything holds a
chain. A wedge-shaped block (`bendA`, `bendB`) curls a strand where it sits, so shape follows
sequence. Membrane blocks are wedges whose rest state is a ring. Stiffness 0.5 is safe (exact
copies, faster copying than rigid blocks); below about 0.3 copies docked on neighbouring
templates start to link. Octagons (`shapeA`, `shapeB` = `oct`) copy but leak: their rounder
outline lets templates pack close enough for such links.

Bonds never break from jostling. A bond forms only if the compatibility table allows it, the two
sides face each other within a tolerance (30° for docking, 10° for side-to-side links), and the
moving block would land in an empty spot. A monomer that undocks is pushed off the face it
left. All soft probabilities are per step of contact. The functions that find connected
components are observation only and never feed back into the dynamics.

An earlier rigid-body engine (squares as rigid bodies, with hinges and slack for bending) was
removed on 2026-09-23; `experiments/RESULTS.md` sections 1 to 14 were measured on it, and it can
be recovered from git at commit `b41557c`.

## Layout

```
src/sim.js        the simulation core (browser global PolyChem, or require())
index.html        viewer: canvas, knobs, readout, birth log
run.js            headless runner, CSV + JSON summary + birth log
test.js           invariant tests
build.js          inline everything into dist/polygon-chemistry.html
DESIGN.md         the design document, with a decision log
experiments/      scripts and measured results
```
