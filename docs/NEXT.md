# Next instance: start here

State on 2026-10-01 (end of the second session). Read AGENTS.md first (rules of work), then this file.

## Where things stand
- Built and working in demos (details and pictures: docs/INNOVATIONS.md): typed chain copying (now **zip**: from the
  high end, no deadlock), casting, hatch pocket (old), **lid pocket** (bulge-free, the standard casting pocket now),
  driven hinges, conveyor, gated ring, airlock, energy, factory (on lid pockets: several generations in 30k steps),
  typed arms, **kits** (any prepared structure becomes kit types that grow it from a seed), **grown pocket** (from an
  anchor), **heritable pocket** (a chain grows its pocket from an end seed; copies regrow it).
- New marks this session: `+` hear side (trigger signal relay), `=` wide hinge (120 degrees), `%` activator side, `@`
  attach side (parts bind only by it). New options: `zip` (default on), `pLoose` (proofreading: caught triangles held
  on 1-2 sides let go). Binding tolerance 0.45. Greek glue letters.
- Physics is about 4x faster than at the start of the session (grid broad phase, smaller contact margin).

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/demos.js copy 1 10000 runs                # typed copying (zip)
node tri/demos.js lid 1 4000 runs                  # lid pocket casting
node tri/demos.js factory 1 30000 runs Aa          # lid pockets feed a replicator (none = control)
node tri/demos.js grow 2 16000 runs 12             # a lid pocket kit grows from a seed and casts
node tri/demos.js heir 1 30000 runs                # chains grow pockets from their end seed; copies regrow them
node tri/demos.js cycle 1 120000 runs              # heritable factory cycle (two kits; see INNOVATIONS)
```
Older: `pocket`, `conveyor`, `gate`, `airlock`, `energy`, `arms`. Pictures go to `runs/NAME.png` with saved states.

## Do next (ROADMAP backlog, top first)
1. **Heritable factory cycle**: see the cycle entry in INNOVATIONS for where it stands. Main cost: kits are 16 types
   each and attach one cell at a time (about 1000 steps per cell at 10 copies in 24x24). Ideas: a smaller pocket
   (fewer frame cells), or a pocket that casts its own kit types.
2. **Pump**, 3. **scanner gate**, 4. **membrane growth**, 5. **bud and feed**, 6. **division** — see ROADMAP.

## Pitfalls learned
- **Enclosed holes.** A site whose three neighbours are all present before it fills can never be filled (no free
  triangle can reach it since the no-tunnelling fix). This caused the copy deadlock (fixed by zip) and the grown pocket
  stall (fixed by `pLoose`). Check every new design for sites that can become enclosed.
- A flap turning about a corner sweeps its far corner 13% past the chord: a carried target jams against a fixed
  neighbour across its far edge. Close lids onto a target instead of carrying the target (lid pocket).
- Kits: every functional pair (K/k, instruction holders) must be a close-only closure or a unique activator glue (`%`);
  otherwise free kit cells, products or dockers stick at the wrong place. Free parts must bind only by `@`.
- Dockers used as fills expose their side glues on hidden backs: use `latGlue` with dedicated fill types when dockers
  carry seeds.
- Shared edges of a prepared structure must have opposite directions when you write glue onto them.
- A latch must stay released while its door opens; any doorway makes a 2D ring a C (use airlocks).
