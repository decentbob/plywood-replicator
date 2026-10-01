# Next instance: start here

State on 2026-10-01 (end of the second session). Read AGENTS.md first (rules of work), then this file.

## Where things stand
- Built and working in demos (details and pictures: docs/INNOVATIONS.md): typed chain copying (now **zip**: from the
  high end, no deadlock), casting, hatch pocket (old), **lid pocket** (bulge-free, the standard casting pocket now),
  driven hinges, conveyor, gated ring, airlock, energy, factory (on lid pockets: several generations in 30k steps),
  typed arms, **kits** (any prepared structure becomes kit types that grow it from a seed), **grown pocket** (from an
  anchor), **heritable pocket** (a chain grows its pocket from an end seed; copies regrow it).
- New marks this session: `+` hear side (trigger signal relay), `=` wide hinge (120 degrees), `%` activator side, `@`
  attach side (parts bind only by it). New options: `zip` (default on), `pLoose` (proofreading: a caught triangle held
  on one side only lets go). Binding by capture (0.6, into free sites only), `pBond` 1. Greek glue letters.
- Third session (2026-10-01): locality audit; a membrane kit that grows its own import door (`doorRingKit`); sensors
  live only once their structure is complete (open signal from open attach sides); the grown protocell (`grown`).
- **Physics is rigid-part, move-or-stop** (rewritten at the user's request): bodies move as rigid pieces, nothing
  overlaps, deforms or squeezes; flaps stall when blocked; binding places parts exactly in free sites (capture 0.6).
  About 20x faster than at the start of the session. Machines must keep their sweeps clear (see RULES, Geometry rule).

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
```
Older: `pocket`, `conveyor`, `gate`, `airlock`, `energy`, `arms`. Pictures go to `runs/NAME.png` with saved states.

## Do next (toward the BIG goal)
Built on rigid physics this session, in order: selective import (revolving door), protocell (import + factory + copying
inside a membrane), budding (a daughter ring detaches when complete: open signal + `&`), encapsulation (a chain grows a
membrane around itself), heritable cells (copies carry the seed and wrap themselves: two cells per world).
1. **Cells that live** — done (2026-10-01): `live` (grown door membrane imports) and `grown` (the chain grows its pocket
   and its membrane with door; the cell imports blanks, casts dockers and copies inside; 4 of 4 worlds, ~250k steps).
   Slow: kit growth is the bottleneck (one specific type must find each growth site in a crowded world).
2. **Birth (in progress, 2026-10-01).** `structures.cellKit`: one seed grows a whole cell: membrane (`doorRingKit` with
   unique wall cells), a **pore** (a 6-cell panel with a built-in trigger: it swings out once the cell is complete and
   stays open; a strand leaves through it in ~5-20k steps) and an **organelle** on the wall (two lid pockets joined,
   `pocketPair`, casting dockers `AXm` and `aXm`). The root keeps the chain (no `&`). Dockers carry the membrane seed
   `m` on their next side (a copy's high end exposes it) and `X` on their prev side (blanks are the fills, latGlue).
   Demo `birth` (800k steps): the cell completes at ~300-375k; watching whether copies leave and grow their own cells.
   Pitfalls met: the pore search must use the direction the hinge really turns (away from its partner); the ring can
   close before the organelle completes (organelle parts 4x).
3. **Heredity of the living cell.** A copy inside the cell cannot become a cell: its dockers carry no seeds, and kit
   parts cannot enter (the door takes blanks only; a free part binds only by its attach side). Options: (a) the pocket
   casts dockers that carry the seeds (`Ayz`-like, with fills that do not expose seeds), and the copy leaves the cell
   (an export door, or the membrane opens when copying is done: a local signal) to grow its own cell outside, where the
   kits are; (b) the cell makes kit parts itself (casting that keeps marks, item 4); (c) a door that imports kit parts.
   (a) is closest to the goal (offspring split off).
4. **Division of a living cell**: two genomes inside one cell -> each wraps itself inside (inner membranes), or the
   copy is exported into a bud (budding with contents). Commitment rules already stop copying once wrapping starts.
5. Kit cost: kits are many types and grow one cell at a time; a pocket that casts kit types (marks would have to travel
   with cast glues) would close the loop (metabolism makes the parts of the cell).
6. Airlock on rigid physics, scanner gate. (The heritable factory cycle works on rigid physics.)

## Pitfalls learned
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
