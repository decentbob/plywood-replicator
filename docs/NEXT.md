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
node tri/demos.js heir 1 30000 runs                # chains grow pockets from their end seed; copies regrow them
node tri/demos.js cycle 1 120000 runs              # heritable factory cycle (two kits; see INNOVATIONS)
```
Older: `pocket`, `conveyor`, `gate`, `airlock`, `energy`, `arms`. Pictures go to `runs/NAME.png` with saved states.

## Do next (toward the BIG goal)
Built on rigid physics this session, in order: selective import (revolving door), protocell (import + factory + copying
inside a membrane), budding (a daughter ring detaches when complete: open signal + `&`), encapsulation (a chain's seed
grows a membrane around the chain; see INNOVATIONS for the latest result).
1. **Heritable cells**: dockers carry the membrane seed too, so every copy wraps itself; combine with the heritable
   pocket (other end seed) so a copy grows membrane and factory. Needs supply of both kits; mind kit sizes (speed).
2. **Feeding a closed daughter**: grown membranes have no door yet; a door cell in the ring kit (break the period at
   one place) or an import ring grown from a kit (`kit()` on `importRing`).
3. **Bud with contents**: parent exports a genome copy into the bud region before it closes (export door), or the
   copy wraps itself (1) while still attached to the parent.
4. Airlock on rigid physics (swept doors), scanner gate, heritable factory cycle on rigid physics.

## Pitfalls learned
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
