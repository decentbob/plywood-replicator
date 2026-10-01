# Innovation log (typed-triangle world)

One entry per capability: what it is, the evidence, the picture, the command, what it enables. Newest first.
Status: **works** (does what was intended in demos), **partial**, **not yet**. Pictures in `docs/pictures/` were
made with the pre-port engine (experiments/, history before commit `cac79c9`, same rules); `node tri/demos.js NAME`
reproduces each demo with the current engine (`tri/`). Results are from one or a few worlds; they show mechanisms,
not statistics.

## 2026-10-01 (second session)

- **Cell kit: one seed grows a membrane with a pore and an organelle** — partial (in progress). `structures.cellKit`
  turns a door ring kit plus an organelle (two lid pockets joined, `pocketPair`, casting dockers `AXm` and `aXm`) into
  one kit grown from the chain's seed `m` (R=7: 110 cells, 59 types, 62 of 63 glue pairs; the alphabet gained 13
  Cyrillic pairs). Placement by search: organelle on an inward wall cell, slots and lid space clear of wall, door
  sweep and the chain with its dock sites; the door must also not sweep the chain (it did: the panel stalled against
  the chain beside its hinge, flickering its latch 7686 times). New pieces, all local:
  **pore**: a 6-cell panel with a built-in trigger, held to the wall by a completion-release pair `&`; once the cell
  hears no open signal it lets go and swings out for good (a strand leaves through a 6-cell pore in ~5-20k steps; a
  4-cell pore at a hex corner barely lets it out). **Spent sides**: a `&` side whose triangle hears no open signal is
  spent and binds nothing again (with a latch, the open wall side recruited spare panel cells and a second ring grew
  on the first). **Late organelle**: its wall seed is a trigger side, deaf while the wall grows, so the wall closes
  and the pore opens first, then organelle parts come in through the pore (otherwise the ring closed before the
  organelle in 2 of 3 worlds and the cell was stuck). Also fixed: door searches use the direction the hinge really
  turns. Status (4 worlds, 100 blanks, chain `aaaaa`): the wall completes at ~340-380k steps, the pore opens, then
  the organelle grows inside, slowly (its parts must wander in through the pore): complete in 1 of 4 worlds by
  ~900k, the others 1-2 cells short at 1.5M. In that world the organelle cast dockers, the chain copied inside its
  cell, copies were copied again inside (with the second docker type), and **a copy left through the pore**
  (~1.1M steps; four free copies by 2.6M, some copied again outside by dockers that drifted out). A free copy was
  bound by a membrane root and **began its own cell** (root, wall cell and pore panel), but its long wall front stopped
  after one cell: each unique wall part had 3 copies, one went into the parent and one into a ring that a root started
  on a copy *inside* the parent (roots enter through the pore too). Not yet: a complete offspring cell. Lessons: the
  late organelle is safe but slow (parts must find the pore); roots inside the parent waste parts and trap copies;
  supply of unique parts limits the number of cells. Picture: `docs/pictures/birth.png` (world 3 at 2.6M steps: parent
  cell with organelle and copies, free copies above, the offspring's started wall). Long runs continue with
  `TRI_RESUME`. `node tri/demos.js birth 3 900000 runs`.
- **Heritable factory cycle on rigid physics** — works (third generation in 2 of 3 worlds by 150000 steps). Founder
  `aaaaa` with seed `y`; two pocket kits in the supply: P_y casts blanks into dockers `Az-`, P_z casts `ay-`; fills
  `Z--`/`Y--` (latGlue), blanks 60. The founder grows P_y (complete at 35000-40000) and casts `Az-`; its copies
  `AAAAA` carry seed `z` (a docker's lateral glue left free at the copy's end) and grow P_z, which casts `ay-`; their
  copies `aaaaa` carry `y` again. World 1 by 150000: 59 casts (42 `Az-`, 18 `ay-`), five strands, a third-generation
  `aaaaa` that has regrown P_y; world 2: a third-generation strand without its pocket yet; world 3: second generation
  with pockets. Blanks run out (1 left in world 1). No rule changes were needed since the old engine.
  `node tri/demos.js cycle 1 150000 runs`. Picture: `docs/pictures/heritable_cycle.png` (strands with their pockets).
- **Grown protocell: a chain grows its own cell, feeds it and copies inside** — works (4 of 4 worlds). Chain `aaaaa`
  with seed `z` on its low end and `y` on its high end; in the supply: the door membrane kit (R=7, 78 cells, 4 copies
  per cell), a lid pocket kit (16 types that cast blanks `xxx` into dockers `A--`), blanks and junk; `pLoose` 0.05.
  From `y` the pocket grows (complete at 40000-105000 steps), from `z` the membrane with its import door (closed at
  105000-175000). The open signal orders the work without any counter: while the membrane grows, its signal reaches
  the pocket through the chain, so the pocket's sensor stays idle; the membrane cannot let go until the pocket is
  complete. Once the cell is closed: the door imports blanks (36-42 by 250000), the pocket casts dockers inside (20-24
  casts), and the chain copies inside its own membrane (1-4 copies `AAAAA` per world; the first cast always after
  closure, the first copy 10000-25000 steps later). Two fixes on the way: proofreading (`pLoose`) no longer drops a
  key's cargo (the door's blank fell off mid-swing), and the pocket kit gets a richer supply (if the membrane closes
  before the pocket's last cell arrives, that site is inside and the cell is stuck: 2 of 4 worlds with half the
  pocket supply). Not yet: the copies cannot become cells (their dockers carry no seeds, and kit parts cannot enter).
  `node tri/demos.js grown 3 250000 runs`. Picture: `docs/pictures/grown_protocell.png`.
- **A grown membrane with its own import door** — works (3 of 3 worlds at R=6). The door ring kit
  (`structures.doorRingKit`) grows two fronts from its root, which holds the chain's seed: the periodic motif the long
  way round, and a short unique front (one wall cell, then a four-cell door panel attached by its latch side `~`,
  welded by hear sides `+`, whose last cell carries the key `X*` outside and a close-only hinge side). The motif's last
  cell closes onto that hinge side, so the hinge exists only once the ring is closed (a door that swung while the wall
  was open would carry half the wall). Local rules: only unbonded attach sides `@` (growth fronts) emit the open
  signal (`&` sides do not), relayed through every bond (range 120); a trigger side binds nothing (catch or closure)
  while its triangle hears the open signal, so a sensor is live once its structure is complete. So the key stays idle
  until the wall has closed, and the ring lets go of the chain while its key is free. Then a blank binds the
  key, the latch lets go, the panel swings 120 degrees inward, drops the blank and swings back; junk is not caught.
  Chain `aaaaa` (seed `z`), 3 kit copies per cell in a 26x26 world: membranes closed at 28000, 36000 and 44000 steps,
  chain inside, 13-15 blanks imported by 88000 (2 junk slipped in while the door was open). A geometry bug found on the
  way: the "faces outward" test used Euclidean distance, which misjudges sides near hex corners for R >= 6 (the last
  site faced inward and could only be closed by triangles trapped inside); now hex radius everywhere.
  `node tri/demos.js live 1 90000 runs 6x3`. Picture: `docs/pictures/grown_door.png`. Enables a cell that feeds itself:
  the genome grows its membrane and the door that brings in its food.
- **Locality audit (user: "a triangle shouldn't know it is part of a larger structure")** — done. All chemistry rules
  reviewed; three non-local rules removed: closures that asked whether two triangles are in the same body (now one flush
  tolerance, 0.05, for every closure), snapping the smaller of two bonding bodies (removed), copy release reading two
  bonds away (the partner now exposes whether a fill is beside it, computed after bonding). Physics exceptions labelled
  (rigid bodies, flap locked by a loop, binding into free sites). Recorded in AGENTS.md (Locality, with the mistakes),
  RULES.md (Locality audit) and NEXT.md. Re-checked: copying 30-32 docks per 10k steps, factory 4 + 3 copies, conveyor,
  lid, import, grow, bud unchanged.
- **Heritable cells: copies wrap themselves** — works (3 of 3 worlds). Genome `aaaa` with seed `z` on its high end
  (there a smaller membrane fits: R=4, 42 cells, 7 motif types); dockers `Ay.z`/`ay.z` carry `z` on their next side, so
  a copy's high end exposes it again; fills `Y--` (latGlue). In each world the founder made a copy, then founder and copy
  each grew their own membrane and were released inside it: two cells, each with its genome (by 40000-60000 steps).
  Local rules added on the way: a strand end's seed is exposed only while the strand is not being copied, and a high end
  held by a completion-release side starts no copy (commitment: a wrapping genome stops copying, so copy and membrane
  do not jam each other); a kit's growth sites (`@` on an attached triangle) take parts only (a free docker had bound a
  membrane front and seeded a second membrane inside it); the dockers' prev side is close-only (a loose fill had stuck to a copy's end in the membrane's way).
  `node tri/demos.js cells 1 100000 runs 36`. Picture: `docs/pictures/heritable_cells.png`.
- **Encapsulation: a chain grows its own membrane** — works (2 of 2 worlds). The chain's low end exposes seed `z`; a
  periodic ring kit (R=6, 66 cells, 11 motif types) whose root binds the seed by its inner side grows the membrane
  around the chain; the root is chosen so the last two sites face outward (a corner pair), so the ring can close from
  outside; the root's seed side releases on completion (`&`), leaving the chain free inside. The ring size was found by
  a placement check (R=4 and 5 touch the chain or its dock sites). 12 copies per kit type in a 26x26 world: membranes
  complete and released at about 45000 and 65000 steps, chain inside in both. `node tri/demos.js wrap 2 100000 runs`.
  Picture: `docs/pictures/encapsulation.png`. Enables heritable cells: copies carry the seed and can wrap themselves.
- **Budding: a daughter ring grows on the parent and lets go when complete** — works (5 of 5 worlds released a
  complete daughter; 2 released two). New local rule, the open signal: an attached part with an unbonded glued side
  (an open growth front) emits a signal relayed one bond per pass and fading by 1 per bond; a side marked `&` lets go
  once its triangle hears none, i.e. once the part it grew into is complete. The daughter's root carries its seed
  side with `&`: when the ring closes, the last open sides vanish, the signal fades and the daughter detaches; the
  parent's seed is free for the next daughter. Geometry found by search: the seed sits at the tip of a three-cell
  stalk on the parent, so the daughter's closing gap (always next to its root, with one front) is 2.5 away from the
  parent (with the seed on the wall, the last sites faced a crevice and never filled). Two growth fronts were tried
  and dropped: they meet at a random cell, and an inward-facing last cell can only be filled from the closed inside.
  Parent R=3 ring, daughter kit (5 motif types x 14, 6 roots) in a 20x20 world, 50000 steps: first daughter released
  at about 15-30k steps. Test: a complete prepared daughter lets go, an incomplete one holds.
  `node tri/demos.js bud 3 50000 runs`. Picture: `docs/pictures/budding.png`. Enables division: the same signal can
  release a bud that carries a genome copy and a factory.
- **Protocell: import, metabolism and copying inside a membrane** — works (2 of 2 worlds). Combines the import ring
  (R=7), and inside (labelled start, layout found by a search that keeps slots, dock sites and the door's sweep free) the
  chain `aaaaa` and two lid pockets that cast blanks into its dockers `A--` and `a--`; outside 50 blanks and 30 junk
  triangles, no dockers anywhere. 40000 steps: in both worlds the pockets cast 15 dockers inside, the chain made a full
  copy `AAAAA` inside, junk inside 0, products outside 0-1. Control without pockets: blanks accumulate inside (16), no
  casts, no copies. Bottleneck: import (one door; about one catch per 6000 steps; some blanks drift in while it is
  open). `node tri/demos.js cell 2 40000 runs` (`none` = control). Picture: `docs/pictures/protocell.png`.
- **Selective import: a revolving door** — works (2 of 2 worlds). A one-row ring whose door is a 4-cell panel (welded
  with hear sides) hinged at an inner corner, with a catch side (X) on an outer face: a caught blank triggers it, the
  latch hears the trigger through the panel (new: a latch lets go while its triangle hears a trigger), the panel swings
  120 degrees inward carrying the blank, drops it inside, swings back and re-latches. The design was found by sweeping
  panel and carried blank (rigid parts). 12 blanks and 24 junk triangles outside, 20000 steps: 11 and 12 blanks
  inside, junk inside 0 in both worlds (a few blanks slipped out while the door was open and were carried in again).
  The membrane now feeds its inside selectively: the transport step of a metabolism. `node tri/demos.js import 1
  20000 runs`. Picture: `docs/pictures/import.png`.
- **Physics speed (second round)** — a move short enough that it cannot pass through a one-row wall (under 1.0; passing
  needs 1.44) is taken after a single check; one bisection; inlined neighbour loops. A 357-triangle world: 4.2 -> 2.0
  ms per step; binding faster (737 vs 177 catches in the benchmark).
- **Rigid-part physics (user: "let connected parts move as one"; "no deformation and squeezing is fine")** — works.
  `tri/physics.js` rewritten: a body (blocks joined by bonds) is one rigid piece; each step every body tries a
  Brownian translation and turn and moves in sub-steps until contact (move or stop): no overlap, no deformation, no
  tunnelling, no constraint passes. Hinged flaps turn by the same checked move and stall when blocked. Binding:
  a free triangle within 0.6 of a free site beside a complementary side is placed in it (capture; it cannot bind
  into an occupied site); closures inside one body only when flush, between bodies the smaller is placed flush.
  Speed: copy world 1.9 -> 0.5 ms per step, a 357-triangle cycle world 7.6 -> 1.5 ms (about 5x). Re-run on it:
  copying 26 docks in 10k steps (2 copies and copies of copies; was 4-14); lid pocket 6-8 casts per 4000 steps;
  factory 4 new `aaaaa` + 3 `AAAAA` in 30k steps (best so far); energy (lid pocket with fuel) 13 casts paid by 13
  carriers (was 2 casts); ring membrane closed in 2 of 2 worlds at 12939 and 8463 steps (was 40k); gated ring
  (rebuilt) opens and tracers cross (28 crossings in 10k steps); conveyor 4-5 hand-offs and 14-20 drops per 3000;
  grown pocket complete in 2 of 3 worlds by 13.6k steps; heritable pocket: founder, copy and copies of copies grow
  pockets. Fixes the rigid world needed: hand-off flaps no longer re-close on their cargo; flaps catch only at
  rest; in kits only caster B catches (a target in the slot before B arrived closed B's cell off); `pLoose` frees a
  triangle held on one side only. Not yet on rigid physics: the old hatch pocket (its carried target bulges into a
  caster; superseded by the lid pocket) and the airlock (its door panels collide with the wall; rebuild with swept
  doors like the gate).
- **Gated ring rebuilt (swept door)** — works. A hinged panel in a closed wall collides with its latch neighbour
  unless its latch edge moves away during the swing; a search over ring doors found clear 120-degree doors: panels of
  three cells (two at a corner) hinged at an outer vertex, swinging out. `structures.ring` now picks such a door by
  sweeping it, welds the panel with hear sides (the key's signal reaches the hinge two cells away) and puts the key
  trigger next to the latch. `node tri/demos.js gate 1 10000 runs 12`.
- **Heritable factory cycle (progress, old engine)** — partial (works on rigid physics, see above). Two kits (pocket P_y casts `Az-`, pocket P_z casts
  `ay-`), founder `aaaaa` with seed y. By 48000 steps in world 2: the founder grew P_y and cast 50 `Az-`; its copies
  `AAAAA` grew P_z (one complete) which began casting `ay-` (2). Not yet: a third generation. Re-running on rigid
  physics.
- **Aligned bonds (user: "edges don't seem to align, which leads to deformation")** — works. Diagnosis: a free
  triangle bound as soon as its corners were within 0.45 of flush, so cells joined tilted; in a grown strip, cells two
  apart then overlapped, their contact forces pushed against the pins, and the strip jammed bent (flush gaps up to
  0.28-0.40, bonded neighbours overlapping by 0.1; a prepared strip stays at 0.000). Fix (rule): binding pulls the
  free triangle in, placing it exactly flush against its partner's side. Grown rings and pockets now: worst gap
  0.008-0.03.
- **Kit safety: no enclosed cells** — works. The grown pocket stalled at 15/16 (and the cycle worlds too): caster B's
  cell lies between its k cell, the frame below and the slot; in 2D the frame must close around it, so once anything
  sits in the slot B can only squeeze in through it. `kit()` now scores each tree: a cell is risky if, when it
  arrives, all its sides may already face cells no deeper than it (not its descendants) or a slot; the generator picks
  a risk-free root (next to B, so B arrives before the frame closes around it). With binding probability 1
  (`pBond`, was 0.5; binding was limited by flush encounters anyway): grown pocket complete at 6400 steps in 2 of 2
  worlds (was 10-11k, and stalls), 11-13 casts by 16000.
- **Rigid clusters (cluster shape matching)** — works. Even with flush bonds, a grown one-row C curled: each joint's
  tiny angle error bent the same way, and over 28 joints the front overlapped the root region (a prepared 28-cell C
  among free triangles: far end up to 2.15 off its design position). The local pin solver cannot keep long strips
  true. Now blocks joined by full bonds form a cluster whose exact lattice shape follows from the bonds; once per step
  each cluster is pulled onto the best-fit rigid placement of that shape (hinged parts stay free). Far end now within
  0.36. Running it more often than once per step made frames effectively infinitely heavy, and hinged flaps got kicked
  by their frame (conveyor: no hand-offs), so once per step it is.
- **Ring membrane from a periodic kit** — works (closed in 1 world at 40202 steps; others still growing). A one-row hexagonal ring
  of side R is six repeats of a (2R-1)-cell motif; motif types attach in a cycle of unique glues (no counting), the
  root carries the seed on its outer side and closes the ring by a close-only glue. R=3: 30 cells from 5 motif types +
  root. 30000 steps, 12 copies per type: 28/30 cells in 2 of 2 worlds, a clean hexagon with every bond flush (worst gap
  0.03); before the alignment fix the open C crumpled into a spiral. `node tri/demos.js ring 1 60000 runs 3`. Picture: `docs/pictures/grown_ring.png`.
- **Heritable pocket: a chain grows its machine, copies regrow it** — works (2 of 2 worlds). The founder `aaaaa` exposes
  seed `z` on its low end; dockers `Az-`/`az-` carry `z` on their prev side, so every copy's low end exposes the seed
  again (the template's high end becomes the copy's low end). A placement check (`world.partPlacement`) picks the kit
  root and seed side so the grown pocket meets neither the chain, its dock sites nor the cells beside them. Fills must
  be `Z--` (`latGlue`): a docker used as a fill exposed `z` on a hidden back and grew extra pockets mid-chain. 30000
  steps, kit x12: world 1: the founder, its copy `AAAAA` (complete 16-cell pocket, casting) and the copy of the copy
  each grew a pocket at their low end; world 2: founder and copy (copy's pocket complete). The products here (`-A-`)
  lack the seed, so copies built from them would not inherit (fixed in the cycle demo). `node tri/demos.js heir 1
  30000 runs`. Picture: `docs/pictures/heritable_pocket.png`.
- **Greek glue letters** — 24 more glue pairs (α..ω / Α..Ω) so two kits can use disjoint alphabets.
- **Grown pocket (kit generator)** — works (3 of 3 worlds). `structures.kit(tris, root, reserved, seed)` turns a
  prepared structure into kit types that grow it from one root cell: a breadth-first spanning tree (root chosen for the
  shallowest tree), one unique glue pair per tree edge, casters attached by their activator edge (unique glue plus the
  new activator mark `%`), all other shared edges close-only closures. Three problems found and fixed on the way:
  (1) a free caster stuck to a caught target by its recognition side, so the new attach mark `@` makes a free part
  bind only by its attach side (and never dock or fill); (2) a hinge bound at the 0.45 tolerance kept a crooked rest
  angle, so hinge rest angles snap to the lattice; (3) a caster that arrives after the slot caught a target finds its
  cell enclosed (in 2D the frame must close around it), so caught triangles held on only one or two sides now let go
  (option `pLoose`, the user's cooperative-binding idea; a fully recognized target casts at once). Lid pocket for the
  factory part (`-A-`, recognition X), 16 kit types x 12 in a 16x16 world with an anchor + root (labelled start): the
  pocket completed at 11200, 10400, 11200 steps and cast 5, 8, 7 times by 16000. `node tri/demos.js grow 2 16000 runs
  12`. Picture: `docs/pictures/grown_pocket.png`. Enables heritable machines (grow from a strand-end seed next).
- **Factory on lid pockets** — works (2 of 2 worlds). Same factory world (chain `aaaaa`, blanks `xxx`, no dockers),
  two lid pockets casting `A--` and `a--`, 30000 steps: world 1 made 3 new `aaaaa` and 2 `AAAAA` (58 casts), world 2 3
  and 3 (60 casts), all 60 blanks used; control without pockets: nothing. Before (hatch pockets): one generation
  cycle in 1 of 2 worlds in 40000 steps. `node tri/demos.js factory 1 30000 runs Aa`.
- **Lid pocket (bulge-free casting pocket)** — works (3 worlds). Diagnosis of the old hatch pocket's stall: a triangle
  turning 60 degrees about a corner sweeps its far corner along an arc that bulges 0.134 past the chord, straight
  into the fixed caster across the target's far edge, so the carried target jams (seed 1: one catch, then nothing for
  4000 steps). New design: the target slides into an open V notch between two fixed casters (B, R); R's recognition
  side is a trigger, its signal is heard through one frame cell (Q) by a lid hinged to Q (new marks: hear side `+`,
  wide hinge `=` 120 degrees); the lid turns about a corner of the slot, so its leading edge arrives flush and nothing
  bulges into the target; cast; the trigger lets go and the lid reopens. 4000 steps, 16 targets: 5, 5 and 9 casts
  (seeds 1-3) against 0-2 for the hatch pocket. Test: deterministic catch-close-cast-reopen. Enables faster factories;
  the heard trigger wires any sensor side to a flap a few bonds away (signals for budding and division later).
  `node tri/demos.js lid 1 4000 runs`. Picture: `docs/pictures/lid_pocket.png`.
- **Copy deadlock fixed: zip copying** — works (copies complete in 4 of 4 worlds that deadlocked or stalled before).
  Diagnosis: two partial copies on one template leave an empty dock site enclosed on all three sides (template face,
  the lower copy's last fill, the upper copy's dock); no free triangle can reach it since the no-tunnelling fix, so
  the busy relay stays high for ever. Fix (rule): a face docks only while it hears zip from the strand's high end
  (relayed through docked faces and backs), so copies grow one face after another and every dock site is an open
  notch. Sequential docking is slower, so the binding tolerance went from 0.3 to 0.45 (also 2-3x faster conveyor
  hand-offs). copy world (abaabb), 10k steps: zip + 0.45 gave complete copies `BBAABA` in seeds 1-4 (seed 1 also a
  copy of the copy); without zip, seed 3 deadlocked (`BBA*` + `BA*`).
- **Speed** — physics 2.6x faster (cell-grid broad phase, radii cached per pass, allocation-free triangle SAT; same
  results bit for bit): copy world 8.6 -> 3.3 ms per step.

## 2026-10-01

- **Clean engine (`tri/`)** — works. The typed-triangle world was ported out of the old research stack (core letter
  chemistry, half-cells, seeded engine; about 3,500 lines) into `tri/physics.js` + `tri/sim.js` (about 400 lines).
  Same rules and parameters; growth programs, marks, pieces, hands, blades and the damage field were dropped.
  Checks on the new engine: tests pass (`node tri/test.js`); energy demo gives the same numbers (2 casts, 3
  carriers spent, 15 recharges in 10k steps); pocket casts at a similar low rate (5 casts in 3 x 8k steps against
  1-3 per 4k before); conveyor 8 hand-offs in 3k steps (2-4 before); about 3 ms per step.
- **Energy** — works (light on/off, one world each). Charge state; discharged triangles bind nothing (user); a
  hinge with a fuel side spends one charged carrier per swing; carriers recharge in a light zone (environment
  drive). Pocket with fuel, carriers starting discharged, 10k steps: light off: the hatch caught a target and waited
  unfuelled (9692 steps), no casts; light on: 15 recharges, 3 swings, 2 casts.
  `node tri/demos.js energy 1 10000 runs [dark]`. Picture: `docs/pictures/energy.png`.
- **Factory: pockets cast a replicator's parts** — works (closed cycle in 1 of 2 worlds). Chain `aaaaa`; the world
  starts with blanks `xxx` and no dockers. Pockets cast blanks into the dockers `A--`/`a--`. One pocket kind (A--),
  two pockets, 20k steps: 26 casts, a complete copy `AAAAA` by t=10000; control without pockets: nothing. Both kinds
  (Aa), 40k steps: world 2 made `AAAAA`, then the copy of the copy `aaaaa`, then a second `AAAAA` (two generations, 46
  casts); world 1 stalled at a partial copy. `node tri/demos.js factory SEED 40000 runs Aa` (`none` = control).
  Pictures: `docs/pictures/factory.png`, `docs/pictures/factory_cycle.png`.
- **Typed arms** — partial. An arm is a series of distinct types grown from a seed glue on a strand end; each type
  attaches by the complement of its parent's exposed glue and exposes the next glue on side 1 or 2 (the bend); a
  type exposing nothing ends it. Dockers carry the seeds on their side edges, so copies show them again. The shell
  pattern 222112 (mirrored at the far end), 12 of each type in supply: both founder ends grew their planned
  7-triangle arm in 20k steps; copy fragments grew arms too; copying was slow (5 docks).
  `node tri/demos.js arms 1 20000 runs 222112`. Picture: `docs/pictures/typed_arms.png`.
- **Airlock with interlock (user: a double lock)** — partial. One-row ring with a lock: inner door, two-cell
  chamber, outer door; pulse doors (a key opens, is let go, the door swings and re-latches); a lock signal from an
  unlatched door makes the other door ignore its key. Without the interlock both doors opened together and the ring
  tore; with it, in 30k steps the doors never stood open together and the ring kept its shape. Not yet: no key got
  through (it is pushed away by the opening door; a lock is not a pump).
  `node tri/demos.js airlock 1 30000 runs 24`. Picture: `docs/pictures/airlock.png`.
- **No tunnelling (user: jumping single walls is a bug)** — works. Kicks reached 1.8 against a 0.87 wall; a body
  whose centre path enters a block of another structure is moved 1/2, 1/4 of the way or not at all. One-row ring:
  141 crossings in 3k steps before, 0 in 6k after; two-row ring 0 in 8k. Costs: copying and catching slower
  (triangles no longer jump into nooks through structures). Picture: `docs/pictures/sealed_ring.png`.

## 2026-09-30

- **Gated ring membrane** — works (mechanism; the open ring bends). Closed ring; door = two-triangle panel latched
  into the wall, hinged at its outer corner; a key on its outer face unlatches it and it swings 120 degrees out.
  With keys: door opened, tracers crossed; without: none. Once open the ring is a C that bends wide (any doorway
  turns a 2D ring into a C), which led to the airlock. `node tri/demos.js gate 1 10000 runs 12r2`.
  Picture: `docs/pictures/gate.png`.
- **Conveyor (hand-off between hatches)** — works. Hatch 1 catches a block and swings it to hatch 2; once the block
  is bonded twice hatch 1 lets go (hand-off `^`); hatch 2 swings on and drops it (`!`). Lessons: a flap needs free
  space beside the side it swings toward (13% bulge); a loaded flap drives at half rate so a returning one wins.
  `node tri/demos.js conveyor 1 3000 runs`. Picture: `docs/pictures/conveyor.png`.
- **Driven hinges, triggers, latches, close-only sides** — works. Hinges open and close by a trigger (user: not
  floppy), carry what is bonded to the flap; pulse doors; latches; interlock. Rules in docs/RULES.md.
- **Hatch casting pocket** — works. Two fixed casters with close-only recognition sides and a hinged hatch: the hatch
  waits open, catches a target, swings it into the centre, the cast happens, the hatch reopens; 20 casts in 3 x 4k
  steps before the tunnelling fix, all through the hatch. Weakness: the carried target presses on a caster during
  the swing, which then completes only with lucky jostling. `node tri/demos.js pocket 1 4000 runs`.
  Picture: `docs/pictures/hatch_cycle.png`.
- **Casting** — works. A triangle glue-bonded on all three sides to activated casters takes their instruction glues
  and lets go: a permanent, in-simulation type change, general (any type) and rare by chance (needs a frame).
- **Typed triangles; copying reads glue** — works. Types are three side glues in complementary pairs; one binding
  rule; docking needs the complementary face glue. Template `abaabb` -> `BBAABA` (reverse complement) -> `abaabb`.
  `node tri/demos.js copy 1 10000 runs`. Picture: `docs/pictures/typed_copy.png`.
- **Triangle-only chains (foundation)** — works. One block shape; letters T/R/Z by hidden backs (gap 0/1/2); exact
  moulded copying verified geometrically (turns within 4 degrees, corner gaps under 0.05); bent chains copy; fills
  2 - gap; refractory faces stop re-docking under a copy that is still peeling off. Pictures:
  `docs/pictures/letters.png`, `docs/pictures/copy_frames.png`, `docs/pictures/copy_verify.png`; the lattice arm
  planner's shell: `docs/pictures/arm_planner_shell.png`.
