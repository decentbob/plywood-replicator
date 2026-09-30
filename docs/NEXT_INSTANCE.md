# Next-instance handoff — 2026-09-30

**Read AGENTS.md first: the workflow changed on 2026-09-30 to innovation first.** Build
genuinely new block types, rules, geometries and combinations as configurations of the seeded
engine, show them in pictures (send images to the chat), log them in `docs/INNOVATIONS.md`, and
move on. Batches and confirmation rounds are the exception. The ROADMAP is an innovation
backlog; take the top unblocked item.

## State

- **Engine:** `experiments/seeded_growth.js` (port labels, activation by attachment, custom
  shapes, reversible programming, maintenance release, decay), `seeded_ports.js` (growth ports
  on any polygon edge, e.g. hexagonal hubs), `seeded_field.js` (shadowing damage field),
  `seeded_worlds.js` (configurations: HALF_CELL, COMB, COMB_ROD, SHIELD, CHOICE, ENZYME_CELL,
  TRIPOD, LATTICE, FUNNEL; `createWorld`, `census`), `half_cell_fast.js` (fast polygon runtime),
  `tools/snapshot.js` (any saved state to PNG).
- **Built this session** (details and pictures in INNOVATIONS): multi-generation half-cells;
  the generic engine; sequence-encoded arms, rods and shields; reversible block programming;
  the damage field; shields that evolve by mutation and spread under the field; multi-port
  hub/rod networks; the user's funnel (first demo).
- **Speed:** a 100-block polygon world runs at about 4–6 ms/step. Container restarts are frequent:
  commit results early, and re-arm background waits (1-hour limit per wait).

## In flight / loose ends

- Four round-3 structure-choice worlds (`experiments/scratch/SE3_20260930_on_175[1-4]`, shield vs rod,
  field on only; the field-off controls were cancelled when the workflow changed) may finish in the
  background: glance at B- vs D-share if present, record a line in RESULTS/INNOVATIONS, and start
  nothing like it.
- Funnel: tune lean and length so both blades point at the copying face (some splay outward).

## User ideas to keep (also in ROADMAP/IDEAS)

**Newest (2026-09-30): a small shape alphabet with a switch** (ROADMAP 10, preferred over pure tiles).
Blocks share unit working edges but differ in shape (square, wedge, half-square); the programmable
`kind` selects the rest shape; the sequence encodes the chain's own shape; bigger parts are bonded
squares, with length from copying (rod genes). The user worried a chain of squares has no shape of its
own; this answers it. A strong candidate for the next big capability, alongside hinges.


Funnel (done, tune); patchy hot/safe environment; fixed obstacles for motility; organisms
controlling their own supply (programmable blanks, erasers); custom parts instead of repeats;
more ports per block; enclosure; sub-block assembly. Mechanics and local logic matter more than
numerical perfection; speed matters.
