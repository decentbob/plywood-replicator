# Next instance: start here

State on 2026-10-01, after the cleanup. Read AGENTS.md first (rules of work), then this file.

## Where things stand
- The repository contains only the typed-triangle simulation (`tri/`). All earlier work is in git history at
  commit `cac79c9` and before; nothing there is needed.
- Built and working in demos: typed chain copying, casting, the hatch pocket, driven hinges (triggers, latches,
  hand-off, drop, pulse doors, interlock), conveyor, gated ring membrane, airlock, energy (charged carriers, light
  zone), factory (pockets cast the dockers a chain needs; two generations on cast supply), typed arms from strand
  seeds, no tunnelling through structures. Details and pictures: docs/INNOVATIONS.md.
- The engine was rewritten on 2026-10-01 (`tri/physics.js`, `tri/sim.js`) from the old research stack; demos were
  re-run on it (see INNOVATIONS, "Clean engine").

## Commands
```
node tri/test.js                                   # fast checks (~6 s)
node tri/demos.js copy 1 10000 runs                # typed copying
node tri/demos.js pocket 1 4000 runs               # hatch casting pocket
node tri/demos.js conveyor 1 3000 runs             # two hatches, hand-off
node tri/demos.js gate 1 10000 runs 12r2           # key-gated ring (2 rows, 12 keys)
node tri/demos.js airlock 1 30000 runs 24          # double lock with interlock
node tri/demos.js energy 1 10000 runs [dark]       # fuelled pocket, light on/off
node tri/demos.js factory 2 40000 runs Aa          # pockets feed a replicator (none = control)
node tri/demos.js arms 1 20000 runs 222112         # typed arms from end seeds
```
Pictures go to `runs/NAME.png` (Chromium at /opt/pw-browsers renders SVG to PNG); a saved state goes next to each
picture (`.json.gz`, reload with `TriSim.fromState(JSON.parse(gunzip(...)))`). Demos take 1-15 minutes; run long
ones in the background and at most four at once.

## Do next (ROADMAP backlog, top first)
1. **Grown pocket (heritable factory).** Write a kit generator: given a structure (list of cells) and a root cell,
   build a spanning tree, assign one glue pair per tree edge (child attaches by the complement of the glue its parent
   exposes) and closure glue pairs for shared non-tree edges; marks (hinge, trigger, K, instruction glues) stay on
   the cells that need them. Grow the hatch pocket from a strand-end seed with the kit in supply. Check it forms,
   regrows on copies, casts. Watch: glue letters are limited to 26 pairs (`a..z`), so a kit needs a careful letter
   plan or an extended alphabet in sim.js (gcode/gname).
2. **Copy deadlock.** Two partial copies on one template keep the busy relay high; the other faces stay refractory
   for ever (copy demo seed 1: stalls at 5 docks). Try `triUndock` and a refractory rule scoped to the copy that just
   released; measure completed copies in a few worlds.
3. **Pump**, 4. **scanner gate**, 5. **membrane growth**, 6. **bud and feed**, 7. **division**, 8. **pocket swing
   stall** — see ROADMAP.

## Pitfalls learned
- A flap needs free space beside the side it swings toward: a triangle turning about a corner bulges 13% past that
  edge. A carried block that presses on a neighbour stalls the swing.
- Shared edges of a prepared structure must have opposite directions when you write glue onto them (edge (a->b) on
  one cell faces (b->a) on the other). Getting this wrong silently drops a bond (a ring becomes an open chain).
- Free triangles jump far per step (kicks up to about 1.8); the no-tunnelling check protects only bonded structures.
- A latch must stay released while its door opens, or it re-latches before the door moves.
- Any doorway makes a 2D ring a C while it is open; use airlocks (one door latched at all times).
- Specific types are scarce in supply: designs that need many distinct types grow slowly; machines that cast their
  own parts are the way out.
