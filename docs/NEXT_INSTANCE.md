# Next-instance handoff — 2026-09-30

**Read AGENTS.md first: the workflow changed on 2026-09-30 to innovation first.** Build
genuinely new block types, rules, geometries and combinations as configurations of the seeded
engine, show them in pictures (send images to the chat), log them in `docs/INNOVATIONS.md`, and
move on. Batches and confirmation rounds are the exception. The ROADMAP is an innovation
backlog; take the top unblocked item.

## Session 2b (2026-09-30): triangle-only replicator (current direction)

The user chose one base shape: the unit triangle. `experiments/tri_chain.js` holds the whole chemistry (roles from
bonds; dock, fill 2 − c, close, zipper release, refractory faces; growth programs on hidden backs). Letters T/R/Z
by hidden backs; figure `experiments/out/TRI_alphabet_20260930.png`. Every complete strand was a correct copy in
2 worlds. Parts: hex ring, plate, spike, fan (gallery). Next (ROADMAP row 00): parts with a job (protection under
the damage field, funnelling), then mutation and selection. Growth should be intentional and bounded (user): use
closure and stop states, not repeats.

## Session 2 (2026-09-30): chain core with grown shapes

User direction: the chain is the reproduction core, and its non-copying side grows appendages from drifting
tiles; hinges later. User decisions: no shape switch (fixed supply ratio). Triangle-only is attractive (see
COMPLEXITY_MAP 3e); a straight chain can be made of welded trapezoids (built: STRIP). The user's two routes to
adaptation are protection and feeding (IDEAS). Built (INNOVATIONS session 2): accretion with reach
(`seeded_accrete.js`), bent chains T/Z (`seeded_bent.js`), trapezoid strip, hinges (`seeded_ports.js`
`hinge:true`), and a centring fix for custom shapes. Next: ROADMAP rows 0a–0d.
Gotcha: to reload a saved state, use the wrapped class (`seeded(Base,config).fromState`, or `s.constructor`).
The bare Base treats C as half-cell wall.

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

- Nothing running. Round 3 (shield vs rod) was stopped on user request; only seed 1752 finished
  (rods won there: D share 0.71). Recorded in ROADMAP "Parked evidence"; start nothing like it.
- Funnel: tune lean and length so both blades point at the copying face (some splay outward).
- **Next build (user focus): the base-shape alphabet** (COMPLEXITY_MAP 3e, picture
  `experiments/out/SHAPES_alphabet_20260930.png`). Base shapes: unit square and unit triangle only;
  trapezoids and other parts are welded. A triangle in a chain is a 60° bend; the bend is a mould
  whose copy is a trapezoid of three triangles (one docks, two fill notches). Demo: a bent SSTSS
  founder copies. Open: closed rings are enclosed by their copies.

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
