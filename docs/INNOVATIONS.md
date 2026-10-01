# Innovation log (typed-triangle world)

One entry per capability: what it is, the evidence, the picture, the command, what it enables. Newest first.
Status: **works** (does what was intended in demos), **partial**, **not yet**. Pictures in `docs/pictures/` were
made with the pre-port engine (experiments/, history before commit `cac79c9`, same rules); `node tri/demos.js NAME`
reproduces each demo with the current engine (`tri/`). Results are from one or a few worlds; they show mechanisms,
not statistics.

## 2026-10-01 (second session)

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
