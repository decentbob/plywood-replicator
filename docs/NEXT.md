# Next instance: start here

State on 2026-10-02 (after autorun run 20261002-0236, build). Read AGENTS.md first (rules of work), then this file.

**Handoff status (autorun run 20261002-0236, build).** Everything committed on branch `claude/autorun-20261002-0236`
and merged into `main`. No simulations running. `node tri/test.js`: 24 tests pass; `node tri/check.js`: 30 of 30 pass in 1285 s (2 new: `imprint-cell` 3 of 4, its control `imprint-cell-n`).
No current slice.
**Done this run (slice: the bud's genome cycle on copies; budget used, acceptance not met, a milestone met):**
- Slice as set: M1 `split k 60000 runs q`: a copy anchored in D and the pair split in 3 of 4 worlds; M2: the bud
  copies its genome after the split. **Result: M1 partial, 1 of 4** (world 4 splits at 38000, both doors shut); M2 not
  reached. Numbers and every variant tried: INNOVATIONS (newest).
- **Milestone met (new capability): genome on copies inside a sealed cell** (`imprint k 40000 runs 60m`): a complete
  cell copies its genome from copy blanks alone, 5 / 2 / 5 / 6 strands from 60 blanks (control with plain walls
  `60mn`: 2 / 2 / 3 / 3, the wall takes 34-42 of 60 copies). Key: plain free wall sides marked `&` are spent once the
  cell hears no open signal, and spent sides are never copied (existing core). Genome: faces `aAaA` (its own reverse
  complement) seeded by `demos.seedCopyGenome` (`w` prev / `z` next on faces, `W` on backs, `latGlue`). New checks
  `imprint-cell`, `imprint-cell-n`.
- What blocks `split q` (measured): (1) the blanks are one batch, spent in about 2000 steps; dockers come out
  unbalanced and a copy waiting for a missing docker type stays paired with its template for good, so P makes only 1-2
  copies; (2) a joined pair hears the open signal of D's anchor (it must, to stay joined), so walls within
  `openRange` are not spent and still take blanks; with P's anchor `W@|` (default) nearly all walls hear an open
  signal; with a plain `W|` (tried, removed) 60 of 134 wall cells are spent, P makes 2-4 strands and strands enter D in
  3 of 4 worlds, but D's anchor caught none in 150000 steps (not diagnosed: check whether their high end `z` is free
  and not busy when near the anchor); (3) a pore in P (blanks from outside) fails: the rings' outer walls take all.
**Exact next step:** a `build` slice on the bud that copies its genome after the split (M2), which needs no joined
phase: the bud is complete then, so its `&` walls are spent (as in `imprint m`). Prepare it like `imprint m` with an
anchored strand (or take `split g`, where a cast copy `AAAA` is anchored: give the bud `aAaA` instead) and copy
blanks that reach the bud only after the split. The open problem is how blanks get into a sealed bud (see the core
change candidate below); until then, blanks inside the bud's ring from the start must survive the joined phase, which
needs D's walls out of the open signal's reach (anchor near the doorway, short `openRange`). Alternatively diagnose (2)
above first: one batch with `W|` and a trace of the strands that enter D.

### Core change candidate (run 20261002-0236): bringing copy blanks into a cell
1. **Capability:** feed a sealed cell (parent or bud) a steady supply of copy blanks, so contact copying of its genome
   (and later its parts) does not stop when one batch is spent; the BIG goal's "feeds it until it can live on its own".
2. **Designs with the existing core that fail:** (a) an import door: its key side catches by glue, but a copy blank
   binds only by its copy side (RULES, copy side), so no key catches it; (b) a pore: blanks outside are spent on the
   rings' outer walls (400 of 400, none got in); (c) a stamp pocket casting copy blanks from imported `xxx` (carried
   mark `'?`): possible, but it brings back the casting machinery copying was meant to replace, and each new blank
   starts touching the pocket, which it copies first.
3. **Locality of the smallest change found:** "a copy side with a glue (`u?`) is also caught by a trigger side by that
   glue (a key)": the key reads the free triangle's side glue, as every glue binding does; the blank changes only its
   own bonds. Alternative: copy sides bind only sides that carry a glue (inert sides are never templates), so inert
   walls are never copied; that changes `imprint` (ring cells are copied through inert faces) and needs a check.

## Where things stand
- Built and working in demos (details and pictures: docs/INNOVATIONS.md): typed chain copying (zip), casting, lid
  pocket, driven hinges, conveyor, gated ring, energy, factory, kits (any prepared structure grows from a seed),
  heritable pockets and the two-pocket cycle, ring membranes, import door, protocell (prepared and grown), budding of
  empty rings, encapsulation, heritable cells, cell kit with pore and organelle, birth (partial).
- **Fourth session (2026-10-01):**
  - **Stamp casting** (rule): marks after an apostrophe on an instruction side (`b.'@`) are carried: the product takes
    them, so pockets cast kit parts (`structures.stampInstr`). Demo `stamp`: five stamp pockets make a ring's parts
    from blanks and the ring grows from them (4 of 4 worlds). Stamp pockets grow from kits too (`grow 1 20000 runs 4s`).
  - **Bud, feed, split** (`structures.budPair`, `world.openBudDoors`, demo `split`): prepared parent and bud rings share a
    wall held by `&` pairs, with a doorway through both walls (panels prepared open, held by `&` doorstops, always
    triggered). The parent's stamp pocket feeds the bud; when the bud's growth front closes, all `&` let go, both doors
    shut and lock, the bud separates (cap content: 4 of 4; genome content: 4 of 4).
  - **Anchor `|`** (rule, physics exception): an anchor side catches a strand end's seed as it would a free triangle;
    the strand is placed flush as one body. The bud catches a genome copy; the parent keeps its founder by its own anchor.
  - **Physics fix**: bodies longer than half the world were folded by the minimum image (torn without losing bonds);
    offsets are now unwrapped along bonds.
- **Physics is rigid-part, move-or-stop**: bodies move as rigid pieces, nothing overlaps, deforms or squeezes; flaps
  stall when blocked; binding places parts exactly in free sites. A closing door stalls on anything in its sweep (a
  strand lying in the doorway jammed a panel once).

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/demos.js copy 1 10000 runs                # typed copying (zip)
node tri/demos.js lid 1 4000 runs                  # lid pocket casting
node tri/demos.js factory 1 30000 runs Aa          # lid pockets feed a replicator (none = control)
node tri/demos.js grow 1 16000 runs 12             # a lid pocket kit grows from a seed and casts
node tri/check.js                                  # capability checks: one PASS/FAIL line per working capability (~16 min)
node tri/demos.js ring 1 60000 runs 3              # ring membrane from a periodic kit, closes (7k-45k steps)
node tri/demos.js gate 1 10000 runs 12             # gated ring (swept 3-cell door)
node tri/demos.js import 1 20000 runs              # selective import (revolving door)
node tri/demos.js cell 2 40000 runs                # protocell: import + factory + copying inside a membrane
node tri/demos.js bud 3 50000 runs                 # budding: daughter rings detach when complete
node tri/demos.js wrap 2 100000 runs               # a chain grows a membrane around itself
node tri/demos.js cells 1 100000 runs 36           # heritable cells: copies wrap themselves
node tri/demos.js live 1 150000 runs 6x2           # a grown membrane with its own import door
node tri/demos.js grown 2 200000 runs              # chain grows membrane + door and a casting pocket (slow)
node tri/demos.js heir 1 45000 runs                # chains grow pockets from their end seed; copies regrow them
node tri/demos.js cycle 1 200000 runs              # heritable factory cycle (two kits; see INNOVATIONS)
node tri/demos.js stamp 1 60000 runs               # stamp pockets make a ring's parts from blanks; the ring grows
node tri/demos.js grow 1 20000 runs 4s             # a stamp pocket grows from its kit and casts A@-b@
node tri/demos.js split 1 30000 runs               # bud fed through a doorway grows a cap, then splits off sealed
node tri/demos.js split 1 60000 runs g             # the bud catches a genome copy (anchor), then splits off
node tri/demos.js split 1 450000 runs o            # + the bud grows its own pocket, splits, imports, copies its genome
node tri/demos.js budgrow 1 250000 runs            # the bud ring grows on the parent's seed, doorway opens once closed, cap fed, splits
node tri/demos.js imprint 1 100000 runs            # contact copying: a ring closes and a second grows from copy blanks only (c: control)
node tri/demos.js imprint 1 30000 runs g           # a strand copied from copies of its own triangles (gc: control)
node tri/demos.js imprint 1 40000 runs 60m         # a sealed cell (spent & walls) copies its genome from copy blanks (60mn: control)
node tri/demos.js split 1 150000 runs q            # the bud pair on copies (partial: 1 of 4 worlds splits)
```
Older: `pocket`, `conveyor`, `gate`, `airlock`, `energy`, `arms`. Pictures go to `runs/NAME.png` with saved states.
Long runs: `TRI_RESUME=runs/x/NAME_tNNN.json.gz node tri/demos.js NAME seed steps outdir` continues a demo world from a
saved state (same seed and extra; event counters restart). `TRI_PARAMS='{...}'` overrides parameters.

## Do next (toward the BIG goal)
The BIG goal's sentence now has a prepared, working skeleton: the parent **feeds** its bud through a doorway, the bud
**catches a genome copy** and grows its content, and it **splits off** sealed (demo `split`). What is still prepared
or missing, in order:
1. ~~**A bud that lives alone**~~ — works prepared, 4 of 4 worlds (`split 1 200000 runs o`, autorun 20261001-2006):
   the bud grows its own stamp pocket (casting `aU.w` from blanks `uuu`, also its fills) from kit parts held as food in
   the parent, catches a copy, splits off, imports `uuu` through its own door and makes a whole copy of its genome.
2. ~~**Grow the bud pair instead of preparing it.**~~ — works for a cap, 4 of 4 worlds (`budgrow`, autorun
   20261001-2235): the bud ring grows on the parent's seed; pulse doors held by the lock signal of its open wall sites
   open once it is closed; its cap is fed; it splits sealed. Next: genome anchor and pocket in the grown bud (see the
   handoff above); later the parent's door and seed as grown parts of the bud itself (the bud as the next parent).
3. ~~**Programmable synthesis**~~ — decided and built in isolation (autorun 20261002-0136): contact copying, copy
   side `?` (IDEAS, decision; INNOVATIONS). Next: the organism on copies (ROADMAP backlog 0). Original note: (see IDEAS): one stamp pocket makes one part type; a cell kit has
   ~60. Options: part templating (a copier pocket: simple, information in parts) or translation (a reading frame on a
   strand: hard). **User (2026-10-01): an explore run decides**, comparing part templating, translation and
   kit-free growth (no new rule) through the core-change gate (AGENTS.md); prefer the least core growth, at most one
   new rule; record the decision in IDEAS and here before building.
4. **Birth (partial, older route):** `cellKit` + demo `birth` (a copy leaves through a pore and grows its own cell from
   kit parts in the world; 1 of 4 worlds started an offspring cell at ~2.6M steps). See INNOVATIONS.
5. Speed: physics is ~85% of step time, lone blocks dominate (`_single`); a big world is ~500 steps/s.

## Pitfalls learned
- **Copy blanks go to every exposed side.** Walls take most of a batch (65-70% in a cell). Mark plain wall sides `&`:
  they are spent once the structure hears no open signal and are never copied. Copies of `&` cells used as fills are
  cut when their `&` side hears none: use `latGlue` so only genome back copies fill.
- **Latch sites emit no open signal** (`@~`): a front of latch sites carries the lock signal, not the open signal;
  something else must keep a structure open (ordinary sites, a content seed) or its `&` sides cut early.
- **A latch-cut closure re-closes**: two sides that stay flush close again next step (no `&` on a closure is possible:
  closures never form on `&` sides). Cut what must stay apart with `&` on a bond formed by binding a free part.
- **A grown flap hangs by its hinge only**: any second bond of the panel to the ring locks it. Its far end must move
  away from its neighbour when it swings (down-triangle far end, up-triangle neighbour for a panel swinging up).
- **lockBusy and other relays are Int8**: lockRange above 127 overflows (no lock at all). Use at most 120.
- **Physics leaks found 2026-10-02** (fixed): check new closed structures for escapes with a trace (cast products and
  released parts start touching their neighbours).
- **Food in a kit site.** A blank whose glue complements casters' close-only instruction sides closes into an empty
  caster site of a growing pocket (two `U.` sides facing it) and blocks it for good. Keep a pocket's target blanks away
  until the pocket is complete (the bud gets `uuu` only through its own door, after the split).
- **Narrow kit sites.** A kit cell with a side on a wall can be entered only through one side once its parent is
  there; it stalled 2 of 4 bud pockets. `budPair` avoids such placements; check new layouts for them (the risk count
  in `structures.kit` does not see walls).
- **Supply races decide reliability.** The founder's first dock races the membrane root (cells); leftover kit parts
  trapped in a closed ring jam its door (live). Supply ratios are design parameters: check them on 4 worlds.
- **TRI_RESUME and `split`**: the demo places its prepared parts and food after `createWorld` has loaded the saved
  state, so a resumed `split` world is scrambled (and the genome variant may throw "prepared parts overlap"). Rerun from
  t=0 instead (a 200000-step world takes about 2 minutes).
- **Bodies longer than half the world** were folded by the torus minimum image (fixed 2026-10-01, `_unwrap`). Keep
  world size larger than any body anyway (pictures and inside tests use minimum images).
- **A ring with two open doors falls apart** (two gaps make two rigid pieces). Interlock the doors of one ring: an
  unbonded latch side emits the lock signal and other latches hold while they hear it (raise `lockRange` for big
  rings). Seen in the bud: its import door opened before its closing door had shut.
- **A closing door stalls on anything in its sweep**; a strand lying across a doorway can jam it for good.
- **Apostrophes in test names**: `'` inside a single-quoted test name breaks the file (twice this session).
- **Locality (user, 2026-10-01).** Before writing a rule, ask: does this triangle know this through its own bonds,
  a direct partner's exposed value, or a relayed signal? "Same structure", "smaller body", "partner's partner" are
  not local (all three were written once and undone). Physics may treat a structure as one body; chemistry may not.
  See AGENTS.md (Locality) and RULES.md (Locality audit).
- **Inside or outside a hex ring: use `hexr`, not Euclidean distance.** Near a hexagon's corners a side on the inner
  boundary can lie farther from the centre than (R-0.5)H; for R >= 6 twelve sides were misjudged, so a door kit's last
  site faced inward and the ring could only be closed by triangles already trapped inside (fixed 2026-10-01).
- **Order of parts on one genome.** Pocket and membrane grow at once from the chain's two seeds; the open signal keeps
  the pocket idle and the membrane attached until both are complete. Tried and reverted: "a seed binds only while the
  strand hears no open signal" (one part at a time): a finished pocket then went live before any membrane, copying
  started outside, and a strand being copied exposes no seed, so the membrane never began. Remaining race: if the
  membrane closes before the pocket's last cell arrives, that site is inside and the cell is stuck (seen in 2 of 4
  worlds with a poor pocket supply).
- **Trailing comments in one-line code.** Twice a `// comment` appended inside a long line swallowed the code after it
  (no error, wrong behaviour). Put comments on their own line.
- **Rigid machines.** Every swing must be clear: sweep a design before building it (`structures.ring` shows how). A
  flap whose catch side stays flush with its cargo re-closes on it at once (hence the hand-off and at-rest rules).
- **Catchers in kits.** A target caught before a neighbouring caster arrives closes that caster's cell off; let only
  the caster whose cell borders the frame catch (lid pocket catcher 'B').
- **Enclosed holes.** A site whose three neighbours are all present before it fills can never be filled (no free
  triangle can reach it: rigid parts never pass through). This caused the copy deadlock (fixed by zip) and the grown pocket
  stall (fixed by `pLoose`). Check every new design for sites that can become enclosed.
- A flap turning about a corner sweeps its far corner 13% past the chord: a carried target jams against a fixed
  neighbour across its far edge. Close lids onto a target instead of carrying the target (lid pocket).
- Kits: every functional pair (K/k, instruction holders) must be a close-only closure or a unique activator glue (`%`);
  otherwise free kit cells, products or dockers stick at the wrong place. Free parts must bind only by `@`.
- Dockers used as fills expose their side glues on hidden backs: use `latGlue` with dedicated fill types when dockers
  carry seeds.
- Shared edges of a prepared structure must have opposite directions when you write glue onto them.
- A latch must stay released while its door opens; any doorway makes a 2D ring a C (use airlocks).
