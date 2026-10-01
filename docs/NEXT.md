# Next instance: start here

State on 2026-10-01 (after autorun run 20261001-1806). Read AGENTS.md first (rules of work), then this file.

**Handoff status (autorun run 20261001-1806).** Working tree clean; everything committed on branch
`claude/autorun-20261001-1806` and merged into `main`. No simulations running. `node tri/test.js`: 20 tests pass. Runs
live in `runs/` (not committed); regenerate with the commands below.
**Done this run:** the `split o` batch with the lock-signal deafness rule (sim.js `_deaf`), then one retune (3 kit
parts per organelle type, was 2). Result: 2 of 4 worlds run the whole chain (split, both doors shut, 42-47 imports, 16
casts, a new `aaaa` copy in the bud); see INNOVATIONS (newest entry) and `docs/pictures/split_alone.png`. The cap and
genome variants still work. A batch takes about 2 minutes per world here (not 1.5 h).
**Open problem:** in the other 2 worlds (seeds 2 and 3) the bud's pocket stops at 14-15 of 16 cells with the doorway
open, so it never splits; 3 parts per type did not fix it, so it is probably not supply. Not yet diagnosed: TRI_RESUME
does not work for `split` (the demo re-places the prepared parts and the food after `createWorld` has loaded the
saved state, so the resumed world is scrambled). **Exact next step:** add an end-of-run report to demo `split` (extra
`o`) listing each kit type missing from the bud's pocket and where its copies are (bonded in D/P, free in D/P/out),
rerun seeds 2 and 3 (`node tri/demos.js split 2 200000 runs/sj2 o`), look at the pocket zoom and decide: an enclosed
site (a design fix in the organelle kit), a part stuck on a wrong partner (glue fix), or parts that cannot reach D.
The demo's `outside=` count (flood fill on a 0.25 grid) can leak through wall
gaps between sample points: treat it as rough.

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
node tri/demos.js ring 1 30000 runs 3              # ring membrane from a periodic kit, closes
node tri/demos.js gate 1 10000 runs 12             # gated ring (swept 3-cell door)
node tri/demos.js import 1 20000 runs              # selective import (revolving door)
node tri/demos.js cell 2 40000 runs                # protocell: import + factory + copying inside a membrane
node tri/demos.js bud 3 50000 runs                 # budding: daughter rings detach when complete
node tri/demos.js wrap 2 100000 runs               # a chain grows a membrane around itself
node tri/demos.js cells 1 100000 runs 36           # heritable cells: copies wrap themselves
node tri/demos.js live 1 90000 runs 6x3            # a grown membrane with its own import door
node tri/demos.js grown 2 200000 runs              # chain grows membrane + door and a casting pocket (slow)
node tri/demos.js heir 1 30000 runs                # chains grow pockets from their end seed; copies regrow them
node tri/demos.js cycle 1 120000 runs              # heritable factory cycle (two kits; see INNOVATIONS)
node tri/demos.js stamp 1 60000 runs               # stamp pockets make a ring's parts from blanks; the ring grows
node tri/demos.js grow 1 20000 runs 4s             # a stamp pocket grows from its kit and casts A@-b@
node tri/demos.js split 1 30000 runs               # bud fed through a doorway grows a cap, then splits off sealed
node tri/demos.js split 1 60000 runs g             # the bud catches a genome copy (anchor), then splits off
node tri/demos.js split 1 150000 runs o            # + the bud grows its own docker pocket from parts the parent holds
```
Older: `pocket`, `conveyor`, `gate`, `airlock`, `energy`, `arms`. Pictures go to `runs/NAME.png` with saved states.
Long runs: `TRI_RESUME=runs/x/NAME_tNNN.json.gz node tri/demos.js NAME seed steps outdir` continues a demo world from a
saved state (same seed and extra; event counters restart). `TRI_PARAMS='{...}'` overrides parameters.

## Do next (toward the BIG goal)
The BIG goal's sentence now has a prepared, working skeleton: the parent **feeds** its bud through a doorway, the bud
**catches a genome copy** and grows its content, and it **splits off** sealed (demo `split`). What is still prepared
or missing, in order:
1. **A bud that lives alone** (`split 1 200000 runs o`): the bud grows its own stamp pocket (casting `aU.w` from blanks
   `uuu`, which are also its fills) from kit parts held as food in the parent, catches a copy, splits off, imports
   `uuu` through its own door (interlocked with its closing door) and makes a whole copy of its genome. Works in 2 of 4
   worlds (autorun 20261001-1806, 3 kit parts per type); in the other 2 the pocket stalls at 14-15/16 (see the handoff
   status for the diagnosis step). Earlier jams of the closing door on a free copy did not recur this batch.
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
