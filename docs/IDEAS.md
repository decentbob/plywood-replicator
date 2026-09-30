# Idea notebook

Untested ideas and design lessons, recorded at the user's request (2026-09-29).
The organizing view is [COMPLEXITY_MAP.md](COMPLEXITY_MAP.md); this file keeps the loose ends.
Nothing here is a queue item: ROADMAP ranks work, and each idea needs a frozen plan
before it runs. Add new ideas at the top of their section, with date and evidence.

## Adaptation (user, 2026-09-30; for later)

- **Two main routes to adaptation: protection from the environment, or a feeding/funnelling
  shape.** Structures pay either by shielding the chain from a damage field (shields evolved,
  RESULTS 105–107) or by bringing material to the copying face (the funnel). Emergent
  appendages (accretion on the chain's back) should be judged by these two effects: do grown
  shapes shade the chain, or funnel letters to its face, and does that shift which sequences spread?

## Mechanism logic

- **A latch needs memory or a drive (from RESULTS 79, 92, 94).** A shape switch that
  reads only current occupancy cannot tell a bond just lost from one never formed, so it
  trades acquisition for release. Every hold-then-release success here uses a driven,
  state-changing cycle (docking, linking, energy-gated REPEL, rearming). Candidates:
  - *Partner-completion release (Penrose-style):* a block changes shape when a bond forms
    on another of its own sides (e.g. the new partner-partner link), not when its face
    frees. It is local (own bonds only) and direction-sensitive. RESULTS 45 tried an
    assembly-triggered shape on selected rest shapes; retry with actual geometry.
  - *Energy-reset bistability:* a block keeps a folded or open state after an event and
    returns only after contact with a charged E, reusing the existing rearm contact.
- **Reuse the copy cycle for other operations.** Its REPEL/rearm release is the only
  driven release. Supports, carriers or delivery may work better as ordinary copying
  participants than as new bound states.
- **Splinted ligation makes length, not function (RESULTS 94).** A bound complement
  aligns two ends for joining; with heat cycles, templates stay 2–3x longer at a sixth of
  the births. Only interesting if length then carries a function; otherwise this is the
  known accumulation regularity.
- **Sequestration is the recurring failure.** Binding-based functions keep locking
  material (18, 29, 79, 94). Report the active (unbound, TPL) fraction beside any
  binding benefit, and look for functions that pay while bound.

## Half-cells (Q8)

- **In-place capture under body motion** is being screened as Q8k (reopened under the
  2026-09-28 speed/logic policy). Next steps if it forms new D-shapes: repeated cycles
  with more loose material, then the equal-material bare-chain competitor.
- **Radiation protection** as the wall's benefit (POLYMER_CAPS.md): compare walled and
  bare competitors under ray particles that M/W block physically.
- **Energy options** for rearming: `energyGate=false` diagnostic, ambient recharge, or
  exposed-edge E capture (POLYMER_CAPS.md).

## Environment (user, 2026-09-29; for later, not now)

- **Patchy environment: safe pockets and destructive pockets.** A homogeneous world tends
  to be either hostile to replication or eaten up by replicators until it stalls (seen in
  many runs here). Zones of high temperature or radiation break things apart, returning
  fresh, mixed supply; cool zones are safe places to build and experiment. Material flows
  between them by diffusion. Existing hooks: `radBand` (radiation only in part of the world)
  and heat cycles (`heatPeriod`, currently global). This needs position-dependent heat,
  decay or erasing, which also fits the reversible programming idea (erase to blank in
  hot zones). Name and mechanism are open; local rules stay local, and the environment
  is an explicit, labelled external drive.
- **Fixed blocks in the environment.** Immovable obstacles (at least colliding, perhaps
  binding) give organisms something to push against or hold on to. Directed movement could
  then evolve (grip, crawl, ratchet against the fixed structure) instead of only random
  drift. Needs an immovable block type in the physics (infinite mass or pinned position).

## Exploration method

- **Pairwise mechanism-combination screen.** Toggle pairs of existing default-off
  mechanisms in one small viable world, 50k steps, two seeds. Record births, length of
  reproducing parents, distinct reproducing sequences and the active fraction separately.
  This nominates leads cheaply; it is research by us, not evolution, and designed-gene
  effects (shield, feed) are known calibrations. Many mechanisms need prerequisites, so
  list valid pairs first.
- **Rate-robust design test.** A mechanism whose logic is sound should work at dt 1 and at
  dt 1/4 (RESULTS 93). Use this as a cheap robustness filter instead of individual-kick
  gates when the claim is about logic rather than precise rates.

## Speed

- Research subclasses, not the core, are the slow part: the half-cell runtime cost
  about 200x the core per block-step. Pattern: find per-sweep invariants (radii, pair
  lists), cache them in a new subclass, and prove bit identity by trajectory comparison
  (`experiments/half_cell_fast_test.js`). Historical sources stay byte-identical.
- Remaining half-cell hotspot: polygon outline/hull allocation inside the contact sweep.
  Caching outlines per sweep is exact only if hull ordering is reproduced; test before use.
- Screen-tier QA (AGENTS) removes about 2.5x redundant replay steps from screens.

## Hinge triangles (user, 2026-09-30)

"Simulation is in need of a hinge triangle, useful for this and other things like membranes; not sure how best
to make it open with intention." First version in `tri_typed.js`: a hinge is a side property, so the pinned
corner fixes the swing direction. Binding shuts a flap and unbinding opens it; a flap held only by hinges never
captures free triangles. Open options for intention: a rest angle (spring) per hinge side; a latch that re-pins the
second corner when a trigger side is bonded (the switch the user proposed for type states); stops that
limit the swing (one-way valves for membranes).
