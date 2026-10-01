# Next instance: start here

## Current slice (autorun run 20261001-2235, build, 2026-10-01)
- **Goal:** the bud ring grows from a seed on the parent's wall instead of being prepared: its growth fronts hold
  both doors of the doorway shut until the bud's ring is closed, the parent then feeds it through the doorway, and when
  the bud's content is complete it splits off sealed (both doors shut) — the "builds its offspring" half of the BIG
  goal on the existing core.
- **Acceptance:** `node tri/demos.js budgrow k 300000 runs`, k = 1..4: the bud ring grows to all its cells, both doors
  stay shut until it is closed and then open, the cap grows from parts cast in the parent, the pair splits with both
  doors shut in at least 3 of 4 worlds; a sigma-0 test in `tri/test.js` shows the door order (shut while a front is
  open, open once closed, shut after the split).
- **Stop boundary:** cap content only (no genome anchor or organelle, no regrowth of the next bud); the parent stays
  prepared. Budget: about 15 demo runs; then hand off with the exact state.
- **Approach:** designs considered (details in INNOVATIONS when done): (a) grow budPair's open panels with `&`
  doorstops: every `&` cuts at the first silence, so the doors could not open on the bud's closing and shut on its
  completion with one open signal (NEXT analysis); (b) a trigger key bound when the ring closes: closures with trigger
  sides are deaf while anything is open; (c) chosen: both door panels are **pulse doors** (`#`) with a built-in
  trigger, held shut while they hear the **lock signal**. The bud's growth sites are latch sites (`@~`): while a
  front is open the lock signal holds both doors, so they open when the bud's last cell arrives (no rule reads the open
  signal for that), stay open while the bud's content (cap seed) is open, and once nothing is open the root's `&` seed
  bond is cut: the parent's seed side and the root's seed side are latches, unbonded they emit the lock signal again
  and both pulse doors swing shut. The bud's panel hangs only by its hinge (to the root); its far end meets the last
  wall cell flush, unbonded (a bond would lock the flap). Every bud cell type is unique (a periodic motif cannot end on
  a cell whose next side stays open).

State on 2026-10-01 (after autorun run 20261001-2006, harden). Read AGENTS.md first (rules of work), then this file.

**Handoff status (autorun run 20261001-2006).** Working tree clean; everything committed on branch
`claude/autorun-20261001-2006` and merged into `main`. No simulations running. `node tri/test.js`: 20 tests pass;
`node tri/check.js`: 24 of 24 checks pass in 467 s (4 processes). No current slice: the next run starts a new one.
**Done this run (slice: capability checks and the `split o` stall; acceptance met):**
- `tri/check.js`: one PASS/FAIL line per working capability of ROADMAP (24 checks with two controls; multi-world
  claims run seeds 1-4 and need 3). It spawns the existing demos with `TRI_NOPIC=1` (no pictures) and reads each
  demo's last report line, so setups live only in demos.js. Add a check for every new working capability.
- `split o` (a bud that lives alone): 4 of 4 worlds (was 2 of 4). An end-of-run report lists missing pocket cells and
  where their copies are. Causes found: a yolk blank `uuu` stuck in the last caster site (fix: no `uuu` inside the
  parent; the bud imports them after the split), then a narrow site (a kit cell with a side on the bud's wall; fix:
  `budPair` picks the organelle placement with the fewest wall-touching kit cells, after kit risk).
- The first check run found two older capabilities below their record: `cells` 2 of 4 (the founder's first dock lost
  the race with the membrane root: now 24 dockers per type, 4 roots: 4 of 4) and `live` 2 of 4 (leftover kit parts
  trapped in the ring jammed the door: now 2 kit copies per cell, 150000 steps: 4 of 4). Details: INNOVATIONS (newest).
**Exact next step:** a `build` slice toward growing the bud pair instead of preparing it (Do next, item 2), or the
explore run on programmable synthesis (item 3) when the rotation gives an explore run. Run `node tri/check.js` before
merging any rule, physics or shared-structure change.
The `split` demo's `outside=` count (flood fill on a 0.25 grid) can leak through wall gaps: treat it as rough.

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
node tri/check.js                                  # capability checks: one PASS/FAIL line per working capability (~8 min)
node tri/demos.js ring 1 60000 runs 3              # ring membrane from a periodic kit, closes (7k-45k steps)
node tri/demos.js gate 1 10000 runs 12             # gated ring (swept 3-cell door)
node tri/demos.js import 1 20000 runs              # selective import (revolving door)
node tri/demos.js cell 2 40000 runs                # protocell: import + factory + copying inside a membrane
node tri/demos.js bud 3 50000 runs                 # budding: daughter rings detach when complete
node tri/demos.js wrap 2 100000 runs               # a chain grows a membrane around itself
node tri/demos.js cells 1 100000 runs 36           # heritable cells: copies wrap themselves
node tri/demos.js live 1 150000 runs 6x2           # a grown membrane with its own import door
node tri/demos.js grown 2 200000 runs              # chain grows membrane + door and a casting pocket (slow)
node tri/demos.js heir 1 30000 runs                # chains grow pockets from their end seed; copies regrow them
node tri/demos.js cycle 1 120000 runs              # heritable factory cycle (two kits; see INNOVATIONS)
node tri/demos.js stamp 1 60000 runs               # stamp pockets make a ring's parts from blanks; the ring grows
node tri/demos.js grow 1 20000 runs 4s             # a stamp pocket grows from its kit and casts A@-b@
node tri/demos.js split 1 30000 runs               # bud fed through a doorway grows a cap, then splits off sealed
node tri/demos.js split 1 60000 runs g             # the bud catches a genome copy (anchor), then splits off
node tri/demos.js split 1 200000 runs o            # + the bud grows its own pocket, splits, imports, copies its genome
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
2. **Grow the bud pair instead of preparing it.** Ideas: grow D as a kit from a seed on the parent's outer wall
   (kits grow any prepared lattice structure). Problems to solve: (a) a hinge bonds only when its sides are flush, so
   a panel grown in the open position needs its hinge partner to be the cell beside it there (the doorstop) with the
   pin at the shared vertex, and its swing direction must point shut; (b) closures never form on `&` sides, so only
   tree edges can be `&` (the root's seed side, like the bud demo); (c) the parent's own door must open only after D's
   wall closes (two phases: the late-organelle trick, a trigger side deaf while the open signal is heard).
   Analysis (2026-10-01): D's open panel can be grown: in the open position the hinge cell's partner is the doorstop
   (the edge through the pin), the hold is a `@&` tree edge to a wall cell, the built-in trigger a tree edge with `*`
   (as the pore). The hard part is ordering with one open signal: D's wall completing silences everything for a moment,
   so every `&` (contact, doorstop) would cut before D's content starts. Needs a second, independent completion signal
   (e.g. one relayed only through hear sides, or a mark for "content" fronts), or an order where the content's seed is
   already an open front while the wall grows (then the parent's door must open on something else than silence).
3. **Programmable synthesis** (the next big blocker, see IDEAS): one stamp pocket makes one part type; a cell kit has
   ~60. Options: part templating (a copier pocket: simple, information in parts) or translation (a reading frame on a
   strand: hard). **User (2026-10-01): an explore run decides**, comparing part templating, translation and
   kit-free growth (no new rule) through the core-change gate (AGENTS.md); prefer the least core growth, at most one
   new rule; record the decision in IDEAS and here before building.
4. **Birth (partial, older route):** `cellKit` + demo `birth` (a copy leaves through a pore and grows its own cell from
   kit parts in the world; 1 of 4 worlds started an offspring cell at ~2.6M steps). See INNOVATIONS.
5. Speed: physics is ~85% of step time, lone blocks dominate (`_single`); a big world is ~500 steps/s.

## Pitfalls learned
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
