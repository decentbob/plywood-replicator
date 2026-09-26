# Polygon Chemistry

The working name, *plywood replicator*, is after L. S. and R. Penrose's self-reproducing wooden blocks (1957–59):
passive units that copy a seed configuration when shaken, with all the logic in their mechanics. That is the spirit here.

An artificial life experiment: a 2D world of small deformable polygons governed by one
fixed, universal rule table, in which template replication, copy errors, and
selection come out of the rules rather than being programmed into the creatures.

**Status.** Copying, mutation, selection and adaptation all come out of the rules. Length is selected in
an open population (cooperative docking with processive fraying); private genes are selected where their pressure
acts and public goods are not; a block's shape selects on the sequences that carry it. With capped genomes whose
pieces die out (`endLoss`) and whose caps must be armed by the energy gene (`bareCaps`), a genome carrying two genes is
selected over its one-gene competitor, and in dense worlds the second gene arises by mutation and spreads (3 of 3
seeds), after which genomes expand. A genome can also build a second polymer by a code (translation) and be made to
need it for copying; shared, that catalyst feeds parasites. A second mode of replication exists beside strand copying: with
two-faced letters, copies made on a strand's back stay on as rows and pile into stacks, crystals that grow row by row and split
(`backCopy`, `stack`); they copy exactly, but do not by themselves make length pay or protect a population (40). Not yet: compartments that keep their contents and divide,
whole-key recognition between strands, and open-ended complexity. Proofreading supplies a third selected function (38).
`AGENTS.md` is the working guide for whoever continues
(`CLAUDE.md` imports it); `experiments/LEDGER.md` lists every experiment with its verdict.
See [experiments/RESULTS.md](experiments/RESULTS.md) for the measurements.

## Run it

Open `index.html` in a browser (it loads `src/sim.js`; no build step, no
dependencies). Or serve the folder:

```sh
python3 -m http.server 8000     # then open http://localhost:8000/
```

The view opens zoomed on the seed strand. Scroll to zoom, drag to pan, click a
block to read its state and its partners' states, click an event in the feed to
jump to it. Every side of every block is drawn in the colour of its state; bonded
blocks meet flush and share an edge, drawn pale:

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
node run.js --steps 200000 --save world.json ...   # keep the world's state (open it in the viewer: "Open state")
node run.js --steps 100000 --load world.json --pBreak 0.0001   # continue it, here under a changed rule (a branch)
node test.js                  # invariants: no junk chains, exact copies, energy accounting, conservation, determinism
node test.js --list           # list checks; --match=REGEX runs a selected group and reports its CPU time
node build.js                 # single-file dist/polygon-chemistry.html
./experiments/genes.sh        # one experiment batch per script; RESULTS.md names each section's script
node experiments/summarize.js # tables from experiments/out/*.csv
```

The portable product-exchange assay is `node experiments/product_exchange.js --out experiments/out/MY_BATCH
--steps 30000 --seeds 3,4,5,6 --arms baseline,durable --workers 3` (one command). It records parameters, source hashes,
occupancy, births and CPU time; summarize with `node experiments/product_exchange_summary.js experiments/out/MY_BATCH.csv`.
See RESULTS 44 for the measured release/lifetime tradeoff, and [LITERATURE.md](LITERATURE.md#spudcell-a-coupled-reproductive-cycle-and-its-mechanical-lessons-2026-09-26)
for SpudCell's implications and an untested mechanical-crowding hypothesis.

RESULTS 45 tests product shape changes with the same assay. `product_shape_summary.js` reports measured wedge angles and
assembly events; `product_parent_summary.js` reads the adjacent birth log to distinguish recipient reproduction, new
non-producers, and sequence changes. Shape switches live in `experiments/product_shapes.js`; they are experimental batch
options, not standard viewer or `run.js` knobs. Summaries reject incomplete batches unless `--partial` is explicitly used.

The four-arm flexibility control (46) has a pre-run plan in `experiments/flexibility_plan.md`.
`node experiments/flexibility_summary.js experiments/out/PF_binding` validates the complete batch,
reconciles raw births with every CSV window, checks the parameter contrast and reports paired binding
effects. It preserves zero births and undefined occupancy when no recipient sites remain.

For a smaller physical assay, `node experiments/mechanical_brace.js --out experiments/out/MY_BRACE --seeds 1,2`
compares a prepared attached product support with an unbound one. `pLinkBare=1` makes the chemical linking probability
equal, and no energy particles prevent copies from becoming active templates. Summarize with
`node experiments/mechanical_brace_summary.js experiments/out/MY_BRACE`. RESULTS 47 finds strong straightening but
no confirmed increase in 20k copy yield; earlier first copying under individual kicks is a separate, conditional lead.

The follow-up `geometric_bottleneck.js` measures why permanent wedges stall: a straight support does not align the
incoming wedges' lateral edges (48). `complementary_fit.js` tests existing complementary copying with opposing A/B
wedges. It restores copying in eight fresh seeds and both directions under default physics (49), with explicit solver
and jostling controls. `complementary_population.js` checks descendants with fuel and turnover; the small populations
reproduce but still shorten. These are research assays, not new chemistry or presets. Each has a `_summary.js` analyzer;
the prospective protocol is `experiments/complementary_fit_plan.md`.

Fuel acquisition is isolated in `curved_fuel.js` (one inactive row, no free letters), and
`curved_collective.js` (several rows, with actual cross-row fuel-contact diagnostics).
`curved_fuel_reproduction.js` couples acquisition to ordinary complementary copying from inactive founders.
Each has a `_summary.js` analyzer; `curved_fuel_plan.md` records the prospective choices and RESULTS 50 the outcomes.
These assays use the ordinary engine. Row identity is recorded only by observers, never read by a rule.

## The whole chemistry

**The fundamental rule: locality.** A block reads only its own type and state, which of its sides are bonded, and
the state shown by the side it is bonded to, and changes its own state by simple rules on those. Nothing bigger than a
block has any behaviour of its own: no rule treats a whole strand, a finished copy or a genome specially, and a signal
passed from block to block (the relay, the tether's anchor signal, `endLoss`'s tip) moves one block per update pass.
Whatever a strand or a population does comes out of that. This is what the project is about: evolution that emerges
without pre-programmed behaviour.

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
| L/R `RAW` of a membrane block | R/L `MEMA` | `pMem` | with `tether`: only an arc anchored on a maker recruits (its open ends read `MEMA`; the anchor signal runs along the arc as `ANC`) |
| K `INACT` of an inactive monomer | K `ACT` | 1 | with `act`: a monomer that left a strand is activated at the back of a template unit in `actMotif` (`BAB`) |

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
| M2 | membrane active | raw, letting go | with `tether`: the anchor signal does not reach it, at `pMemDecay` per step |
| A1 | inactive (`RAW`) | DOCK | with `act`: its back is docked on an `ACT` back; units leaving a strand become inactive instead of DOCK |

**Bond holding.** A bond breaks the moment either side reads as `REPEL`,
`INERT`, `IDLE` or `OFF`. That is what releases a finished copy, resets a spent
energy particle, and frees a frayed unit.

**Energy.** Energy particles are half-size squares of a third type that never
chain. A charged one docks on the back of a released block, the block re-arms,
the particle is left spent and drifts off; nothing is absorbed and the count is
fixed. Spent particles recharge at a background rate or, with the motif rule, at the
back of a `B` block flanked by two `A`s, which makes energy income a property of
sequence.

**Optional blocks and rules** (each behind knobs that default off; RESULTS.md sections in brackets):

| knobs | what it adds |
|---|---|
| `nX`, `rayHit`, `sizeX`, `mobX` | rays: small fast blocks that never bond; one touching a block breaks a lateral bond; only membrane stops them (19, 25) |
| `cut`, `cutMotif`, `pCut`, `cutRelay` | a bound template carrying `cutMotif` cuts the strand it is bound to (26) |
| `sizeA`..`sizeD`, `mobA`..`mobD`, `foldA`..`foldD` | per-letter size, mobility, and folding: the rest shape bends by `fold` degrees while the face is free. Bonded blocks adopt changing rest shapes only with stiffness below 1 or `snapCorners`; rigid bonded blocks otherwise keep their existing shape (45a). |
| `nP`, `nQ`, `capFray` | caps: letters with one lateral side (`P` has no left, `Q` no right) that pair only with each other and fray at `capFray` of the normal rate; a capped strand grows only by a copying mistake inside it |
| `translate`, `transCode`, `pMisTrans`, `n1`..`n4` | translation: the back of an armed letter templates a *product* block by a code (`A`→`1` …); docked products link where the template continues and a finished product chain is released, parallel to its template. Products never template; their physics is per kind (`size1`, `fold1`, `stiff1` …) (34) |
| `catalysis`, `pBindP`, `pPMelt`, `pPMeltRun`, `pLinkBare` | a finished product binds back onto strands it matches; a template face whose back holds one is catalysed, and monomers docked there link at once, elsewhere at `pLinkBare`: the genome needs the part it builds (34) |
| `bindAny`, `pMisMelt` | a finished product binds any armed back (a shared catalyst: strands that make none are parasites); with `pMisMelt` a mismatched bound unit lets go fast (graded specificity) (36) |
| `transStart` | (with translate) only a strand carrying a start motif (`CDC`, or one letter, `D`) translates: a template unit in the motif marks itself and the mark runs along its strand one block per pass. With a shared catalyst and graded specificity, a strand that carries a host's key but no start is a mimic: catalysed, making nothing (43) |
| `productFray` | product end-fraying relative to `pFray` (default 1); lower values let products survive longer between encounters without changing genome turnover or processive unzip. Section 44 tests durability and release separately. The unsuccessful delayed/retracting latch variants remain in `experiments/product_latches.js`, not the normal chemistry. |
| `bareCaps` | caps have no back: no energy particle docks on a cap, so caps are armed only through their bond (the `feed` relay) and a capped genome re-arms only if it carries the energy gene `ABA`; `PQ` is sterile (33) |
| `radBand` | radiation acts only where x < `radBand` × W: a world with a lit and a dark part (33) |
| `proof`, `proofMotif`, `pProof` | proofreading: a template unit in `BDB` flags its face (relayed along its strand); a wrong monomer docked on a flagged face lets go before it links (38) |
| `nU`, `nV`, `sizeU`, `sizeV`, `pReloadU`, `pocket`, `grip`, `pGrip`, `pGripMelt`, `pGripMelt2` | fuel particles of two sizes; with `pocket` a letter's back grips fuel, and a charged particle held by two backs at once (a pocket) arms one letter that wants energy and is spent; with `grip` released products' backs grip too. A strand folded by its letters (`foldA`..) makes pockets on the inside of its curl, and which fuel fits is geometry (39) |
| `backCopy`, `stack`, `pSBind`, `pSNuc`, `pSMelt`, `pSMeltEnd`, `pSMeltRun`, `stackHold` | stacks, a second way to copy: an armed letter's back templates too (the copy lies parallel to it); with `stack` a finished back copy stays on as a new row, is armed like a released copy, and then templates the next row, so copies pile into crystals that grow row by row and lose rows by unzipping (a face zips back beside a stacked neighbour at `pSBind`, starts a new junction at `pSNuc`). A stack's bottom row frays like any strand, so stacks treadmill; with `stackHold` it does not (40) |
| `endLoss` | end-replication loss: a template unit with a free lateral side shows no face and marks its bonded side as a tip, and a neighbour reading the tip counts that side as the end. Every copy lacks its template's open ends, so pieces of a strand shrink by a unit per open end each generation and die out, while a strand capped at both ends (`P...Q`) copies whole, as telomeres protect chromosome ends (33) |
| `compCopy` | complementary copying: `A` docks on `B` and `C` on `D`, so a copy is the reversed complement of its parent (28) |
| `nJ`, `pHub` | hubs: blocks whose four sides each hold a strand's open end, tethering strands in a star without fusing them |
| `heatPeriod`, `heatFrac`, `heatMelt` | temperature cycles: in the hot part of each period binding stops and bound pairs melt at `heatMelt` (29) |
| `chiral`, `pMisDock`, `pMixLink` | chirality: a fraction of letters are mirror forms (lowercase in sequences, drawn with a slash); each hand docks only on its own, a mirror monomer docks at `pMisDock` and blocks the site, and mixed neighbours link at `pMixLink` (30) |
| `nG`, `gStick`, `gRange`, `gStickS`, `gStickF` | droplets: `G` blocks never bond but attract each other within `gRange` of touching, so they separate into liquid droplets (coacervates); strand and free letters can be drawn to them (31) |

**Random chemistry** (`src/rchem.js`, section 32): the same physics under a random rule table. Each block has a type and a
state; each side shows a colour looked up from (type, state, side); colour pairs bond with probabilities from a random
table and a bond holds while its colours attract; a block switches state when one of its sides is bonded to a given colour
(or is free). `experiments/rsearch.js` screens random tables, `experiments/autocat.js` tests whether an assembly begets
itself, and the viewer's "random chemistry" preset shows any table by its seed.

There is no completion handshake. A copy is released when every
unit is *locally* complete: a middle unit needs both lateral bonds, an end unit
needs one, and the unit learns which it is from its template partner's face
state. Because a docked monomer is rotated 180°, copies are antiparallel and a
child reads as the reverse of its parent, which is why every logged birth is
checked against `reverse(parent)`.

## Physics

Each block is a polygon (a square, a wedge, or an octagon) held to its rest shape by a restoring
force whose strength is a per-type stiffness. A bond pins the two corners of one edge onto the two
corners of its partner's edge, so bonded edges coincide and a strand moves as one body. A free
block gets its own Brownian kick; a set of bonded blocks is kicked as the rigid body it forms, by
the move and turn its blocks' own kicks would give it (`bodyJostle`, default since 2026-09-25; it
made the engine about twice as fast). Two blocks that are not bonded may not overlap. Pins, contacts
and the shape restoring force are then solved together by nudging the blocks involved, 4 passes per
step (`iters`); a pin moves each block rigidly and, by its softness, deforms the pinned corner. No
rule reads a body: bonds, contacts and shapes are per block, and every rule is read by one block.

Deformation and changing the rest shape are separate controls: `stiff1=0.8`, for example,
lets a product polygon deform while pulling it back toward its current preferred shape;
`fold1` changes that preferred shape. Stiffness is a restoring strength, **not a hard maximum
deformation bound**. `maxStrain` limits the residual gap between bonded corners by breaking
eligible bonds; it does not cap a polygon's distance from its rest shape. Pins are solved
approximately unless `snapCorners` performs the final exact corner projection.

Chains are straight because a row of pinned squares is straight, not because anything holds a
chain. A wedge-shaped block (`bendA`, `bendB`) curls a strand where it sits, so shape follows
sequence. Membrane blocks are wedges whose rest state is a ring. Stiffness 0.5 is safe (exact
copies, faster copying than rigid blocks); below about 0.3 copies docked on neighbouring
templates start to link. Octagons (`shapeA`, `shapeB` = `oct`) copy but leak: their rounder
outline lets templates pack close enough for such links.

**Flush polygons** (`snapCorners`, `maxStrain`, off by default). After the passes, every group of
pinned corners is moved to its common point by deforming the blocks, so bonded blocks always meet
flush, like one polygon with lines between; the shape force pulls them back to their rest shape from
the next step on. A membrane bond, or a lone docked monomer, whose corners the passes leave further
apart than `maxStrain` lets go (the monomer falls off): blocks give only so far, so a ring of the
wrong size snaps and an overlong membrane splits into rings of about its natural size. The monomers
of a copy in progress hold each other, and a strand's own bonds break mechanically only past
`maxStrainStrand` (off): breaking either was measured to shatter strands into replicating
fragments (`experiments/RESULTS.md`, section 23). `mobS` slows bonded blocks relative to free ones
(polymers creep while monomers diffuse); `memPerm` lets free monomers pass membrane.

Bonds never break from jostling (with `maxStrain` off). A bond forms only if the compatibility table allows it, the two
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
src/rchem.js      random chemistry: the same physics under a random rule table (PolyChem.RChem)
index.html        viewer: canvas, knobs, readout, birth log
run.js            headless runner, CSV + JSON summary + birth log
test.js           invariant tests
build.js          inline everything into dist/polygon-chemistry.html
DESIGN.md         the design document, with a decision log
experiments/      scripts and measured results
```
