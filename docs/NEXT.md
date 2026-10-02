# Next instance: start here

## Current slice (autorun run 20261002-0136, explore, 2026-10-02)
- **Goal:** decide programmable synthesis (part templating, translation, kit-free growth) through the core-change
  gate and build the chosen one: parts are made from uniform blanks by copying the parts already in a body, so one set
  of an organism's parts can multiply into the parts of its offspring.
- **Decision (details: IDEAS, "Programmable synthesis"; gate entry: RULES, "Core changes"):** part templating in its
  smallest form, **contact copying**: a copy blank (a free triangle with copy sides `?`) binds any free side of an
  attached triangle and takes that triangle's whole type (glues, marks, carried marks), then lets go. No machine: the
  body is the template. Translation needs a reading frame, stepping and adaptors that carry marks (which no cast can
  make), so several rules; kit-free growth needs no rule but cannot close the loop (stamp casters carry `'` marks,
  and no cast product carries marks). Contact copying closes it: every part type on a body's surface, the copier's
  own included (there is none), can be multiplied from blanks.
- **Acceptance:** (1) `node tri/demos.js imprint k 80000 runs`, k = 1..4: an anchored ring root, ONE free copy of each
  ring part (R = 3, 5 motif types) and copy blanks only: two rings (the second anchor starts bare: its root is a copy
  too) close in at least 3 of 4 worlds; control `imprint k 80000 runs c` (blanks without `?`) never passes 6 ring
  cells. (2) Milestone 2, if budget allows: a lid pocket (16 kit types, 5 of them enclosed when complete) grows from one
  copy of each part and casts, at least 3 of 4 worlds. (3) `node tri/test.js` with a test of the copy rule; `node
  tri/check.js` all pass (no existing type has `?`).
- **Stop boundary:** no use in the organism yet (budgrow, split), no removal of casting or stamp marks (recorded as the
  follow-up). Budget: about 12 demo runs and one check.js run.
- **Approach:** one mark, one rule branch in binding plus one state change (`_copy` beside `_cast`); copy blanks bind
  only by `?` (like parts by `@`), never dock or fill. Designs considered and dropped: a copier pocket holding free
  templates (needs a glue-agnostic hold, a read rule and a release, and library parts get used up by growth sites);
  copying free templates (free triangles never bind each other).

State on 2026-10-02 (after autorun run 20261001-2235, build). Read AGENTS.md first (rules of work), then this file.

**Handoff status (autorun run 20261001-2235).** Everything committed on branch `claude/autorun-20261001-2235` and
merged into `main`. No simulations running. `node tri/test.js`: 23 tests pass; `node tri/check.js`: 24 of 25 in 803 s
(25 checks incl. the new `budgrow`, 4 of 4); the one failure, `split-o` at 200000 steps (2 of 4 still joined), passes
4 of 4 at 450000 (run separately; the check now uses 450000, about 7 minutes per world). No current slice.
**Done this run (slice: grow the bud ring instead of preparing it; acceptance met, 4 of 4 worlds):**
- Goal was: the bud ring grows from a seed on the parent's wall; its growth holds both doors shut until it is closed,
  the parent feeds it through the doorway, it splits off sealed. Acceptance: `budgrow k 250000`, k = 1..4, all cells,
  doors shut until closed, cap fed after closure, split with doors shut in >= 3 of 4; sigma-0 door-order test. Met:
  4 of 4 (details, numbers and picture: INNOVATIONS, newest). No new rule: pulse doors gated by the lock signal of the
  bud's open latch sites; the root's `&` seed bond cut once the cap is complete.
- Designs tried and dropped on the way (recorded so nobody retries them): growth sites as latches AND relying on them
  for the open signal (latch sides emit none: the root's `&` would cut early); a closure bond cut by a latch (the sides
  stay flush and re-close at once, then the restored lock signal keeps the latch from cutting again: the bud stayed
  stuck to the parent); a last cell resting on the parent (its site enclosed: buds stalled at 53/54).
- Two physics bugs fixed (both let blocks through closed walls; RULES Physics; tests). `heir`, `cycle` and `split-o`
  checks now run 45000 / 200000 / 450000 steps (same criteria): kit growth and copy traffic are slower without leaks.
**Exact next step:** a `build` slice: give the grown bud a genome copy (the anchor `Z@|` from `split g`, on a wall cell
of the grown bud, emitting the open signal until it catches a copy; the parent keeps its founder by its own anchor) and
then its own pocket (`split o`), so the grown bud lives alone. Keep the cap seed or the anchor on an early wall cell
(the open signal must exist before the 7-cell panel completes). Then: the parent's seed is free again after the split
(a second bud from fresh kit parts would test repeat budding).

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
3. **Programmable synthesis** (the next big blocker, see IDEAS): one stamp pocket makes one part type; a cell kit has
   ~60. Options: part templating (a copier pocket: simple, information in parts) or translation (a reading frame on a
   strand: hard). **User (2026-10-01): an explore run decides**, comparing part templating, translation and
   kit-free growth (no new rule) through the core-change gate (AGENTS.md); prefer the least core growth, at most one
   new rule; record the decision in IDEAS and here before building.
4. **Birth (partial, older route):** `cellKit` + demo `birth` (a copy leaves through a pore and grows its own cell from
   kit parts in the world; 1 of 4 worlds started an offspring cell at ~2.6M steps). See INNOVATIONS.
5. Speed: physics is ~85% of step time, lone blocks dominate (`_single`); a big world is ~500 steps/s.

## Pitfalls learned
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
