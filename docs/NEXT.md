# Next instance: start here

State on 2026-10-01 (end of the fourth session). Read AGENTS.md first (rules of work), then this file.

**Handoff status (end of the fourth session).** Working tree clean; everything committed on branch
`claude/nice-tesla-eztyn4` and merged into `main`. No simulations running. `node tri/test.js`: 20 tests pass. Runs live
in `runs/` (not committed); regenerate with the commands below.
**Last change, not yet tried in a demo:** a trigger side is now also deaf while it hears the lock signal (sim.js
`_deaf`). Why: in `split o`, the bud's import door caught a blank at the split while the bud's doorway was still open;
its latch held, but a latch locks a flap only through a closed loop of bonds and the bud's ring was a C, so the import
panel swung and carried half the ring, jamming the closing door (world 3 of the last batch; replay showed import door
at 13 degrees, closing door stuck at 90, thousands of stalls). **Exact next step:** rerun
`for k in 1 2 3 4; do node tri/demos.js split $k 200000 runs/si$k o > runs/si$k.log & done` (about 1.5 h, 4 processes)
and check per world: SPLIT, `doors P:shut D:shut`, then `imports` rising and a new `aaaa` strand in D (a whole copy made
by the bud). Also rerun `split 1 30000 runs` and `split 1 60000 runs g` once to confirm the rule change keeps them
working (it should: their keys are deaf anyway until the split). Last batch (before this rule, xxx 10): 1 of 4 split by
200000 (organelle stuck at 14-15/16 in the others: the last kit parts are slow or lost; 2 copies per kit type) - if
that persists, give 3 copies per kit type. The demo's `outside=` count (flood fill on a 0.25 grid) can leak through wall
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
1. **A bud that lives alone** (`split 1 200000 runs o`, 2026-10-01): the bud grows its own stamp pocket (casting `aU.w`
   from blanks `uuu`, which are also its fills) from kit parts held as food in the parent, catches a copy, splits off,
   then imports `uuu` through its own door (interlocked with its closing door). 3 of 4 worlds split; in 1 the whole
   chain ran (import, cast, copying started); in 2 the bud's closing door jammed on a free copy in the doorway. Next:
   fewer free copies in the parent (fewer `xxx`: the parent needs only one or two copies), the doorway kept clearer (a
   60-degree bud door, or the anchor pulling the copy out of the doorway), then run until a whole copy forms in the bud.
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
   strand: hard). **Ask the user which way** before building: both need a rule.
4. **Birth (partial, older route):** `cellKit` + demo `birth` (a copy leaves through a pore and grows its own cell from
   kit parts in the world; 1 of 4 worlds started an offspring cell at ~2.6M steps). See INNOVATIONS.
5. Speed: physics is ~85% of step time, lone blocks dominate (`_single`); a big world is ~500 steps/s.

## Pitfalls learned
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
