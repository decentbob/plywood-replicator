# Walls against rays: a first beneficial structure?

2026-09-29; ROADMAP order 1. Frozen before the screen. Screen tier, exploratory.

**Question (the user's hypothesis).** Do half-cell walls pay by shielding chains from
radiation? Rays (core X particles, `_rayHit` unchanged) break a chain's lateral bond on
contact. In this engine they collide only with wall blocks (`seeded_rays.js`), so a wall
physically blocks them. The copying face stays exposed, so protection is partial, except
while two Ds copy face to face.

**Design (2x2, world = unit).** HALF_CELL configuration, pins, K=4 soup in 24x24 (founder D
plus four loose inventories), `pFray` .002 (fragments fray, returning letters; caps do not
fray), body16. Rays: 2 X particles in every arm, so material is equal. `rayHit` .01 (on) or
0 (off). Walls: `rimBind` true (walled) or false (bare: the same W present but inert).
Calibration on the bare arm only: 4 rays at .05 hit the founder within 1–4k steps, far
faster than copying (10–40k), so exposure was cut about 8x before any walled world ran.
Seeds 1501–1506, 100,000 steps; 24 worlds.

**Outcomes** (read-only, every 500 steps): intact complete P..Q chains, distinct chains ever
seen (founder plus copies), and ray hits. Primary: distinct chains ever made, and
chain-steps (the time integral of intact chains).

**Reading, fixed now.** A benefit exists if rays reduce bare chain-steps more than walled
chain-steps: the ratio on/off is higher for walled in at least 5/6 seeds (paired by seed),
and walled/on beats bare/on in chain-steps in at least 5/6. Anything weaker is no benefit at
this exposure, and there is no rescue by tuning rays; a different exposure would be a new
frozen plan. QA: the first seed of each cell gets plain and restart checks.
