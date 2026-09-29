# Walls in a shadowing damage field (user's design, 2026-09-29)

Frozen before running. Screen tier. It follows RESULTS 101–102, where discrete rays made damage
all-or-nothing per encounter, so walls could not matter.

**Field** (`seeded_field.js`): an environmental field breaks chain lateral bonds. Per step, a
bonded letter or cap breaks one lateral bond with probability pField × I × exposure.
Exposure is the fraction of 16 directions whose segment of length 5 crosses no wall (W)
polygon, so walls cast shadows. It is an explicit external drive like core `pBreak`; the
reactions are unchanged. I is uniform here (1). The shading check on a founder D gives chain
exposure .44–.50 inside its own wall, the halving the user predicted.

**Calibration (bare arm only, before any walled run):** `pField` 1e-5 gives the founder's first
break at 11.5k–54k steps (seeds 1690–1693), comparable to copy time.

**Design:** 2x2, walled (`rimBind` true) or bare (the same W, inert, which still casts shadows
where it floats), crossed with field on (1e-5) or off. HALF_CELL config, pins, K=4 soup in 24x24,
`pFray` .002, body16, fresh seeds 1521–1526, 100,000 steps; 24 worlds.

**Outcomes:** chain-steps (the time integral of intact P..Q chains), distinct chains ever seen,
and field breaks. **Reading, fixed now:** protection holds if the walled on/off chain-step ratio
exceeds bare's in at least 5/6 seeds; net benefit also needs walled/on above bare/on in at least
5/6. Report both. There is no rescue by retuning; a zoned or gradient field is a later plan.
