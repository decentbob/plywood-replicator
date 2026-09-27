# Q8a: access at the end of a half-cell

2026-09-27. Prepared geometry and numerical-mechanics gate, before new chemistry.
Reference: `docs/POLYMER_CAPS.md`, RESULTS 25, 67–69, 80–81. The user proposes
radiation protection as a possible later payoff. The relevant existing route
is physical ray exclusion, not global `pBreak`; the straight copying boundary
remains exposed. No shielding, division, reproduction or fitness is tested here.

## Decision and contract

Can a complementary pair of cap polygons retain ordinary copying and rail edges,
an angled arc connection behind each copying face, and accessible fuel edges?
Compare attached rim stubs with the same unbound material in the same poses.
This is necessary for outward copying to build a second independent half-cell.

Use the existing deformable-polygon solver in a physics-only subclass. No core
edits, no additional forces, no new states or side marks, no reaction rules.
`step`, chemistry and bond formation must throw. Call only `_physics`, advancing
the observation clock explicitly. Prepared links and the removal of the two
copying-face bonds at t=100 are labelled interventions, not ordinary release.
Setup IDs classify the two sides only for measurement and prepared sweeps.

The unused lateral slot of each P/Q cap carries the rim pin **in this geometry
fixture only**. It must not be used with normal chemistry: that chemistry would
read it as another chain neighbor. Future chemistry requires a distinct rim
interface. Four working ports are not a design limit; this fixture reuses the
pin carrier to avoid an arity refactor before establishing physical fit.

## Frozen shapes and comparisons

Local F is +x, R is +y. Cap P vertices, counterclockwise before centering:
`(.5,-.5),(.5,.5),(-.5,.5),(-.5,0),(-.25,-.5)`.
Q mirrors P across local y=0 with vertex order reversed to remain counterclockwise:
`(.5,-.5),(.5,.5),(-.25,.5),(-.5,0),(-.5,-.5)`.
P edges F/R/K/rim are 0/1/2/3; Q edges F/rim/K/L are 0/2/3/4.
The copying and inward rail edges retain length 1; fuel edge length .5;
rim edge length sqrt(5)/4. W is a rectangle of that width and depth .5,
with its F edge pinned to the rim edge. Ordinary A and half-size E keep their
standard square shapes. Rest polygons are centered on their vertex mean.
Mass/inertia retain the engine's size-based approximation (cap size 1, W size .5),
identical in both arms; no physical mass accuracy is claimed for the new shapes.

Eight conserved blocks per fixture: P, Q, two A, two W (research C carrier), two E.
Each cap has one rail neighbor and one optional attached W. Two F-F contacts
join the rows. E starts flush with each K but has no enduring pin, as in core.
Test parent P and parent Q, at whole-fixture rotations 0 and 90 degrees for
static placement. A copied Q/P is rotated 180 degrees relative to the parent.

Static path: sample relative outward displacement 0 to 2 in steps of .1,
moving the prepared daughter cap/rail/W/E together for geometry inspection only.
No physical dynamics use this group positioning. Check actual convex polygon
overlap, intended endpoint coincidence, copying geometry and fuel placement.
These 21 placements per orientation are not a continuous swept-volume proof.

Dynamic jobs: parent P/Q x attached/unbound x seeds 611/613 x body4,
individual4, individual16 = 24 worlds, rotation 0. Use core sigma .3 and
sigmaRot .45; stiffA/P/Q/C .8, snapCorners/maxStrain off, all chemistry disabled.
Run 100 held steps, remove the two face contacts, then 100 released steps.
First five steps are a viability look on these same instances: stop only for
nonfinite geometry, conservation/bond asymmetry, or retained pin error >1.
Do not retune shapes, kicks, stiffness, iterations, seeds, horizon or gates.

Primary gate: all static placements have overlap <=1e-9, and exact contacts
at displacement 0 have endpoint residual <=1e-9 and pass copying/fuel geometry.
For every body4 and individual16 job, at least 24 of held steps 76–100 must
simultaneously have maximum retained-pin error <=.1, all-pair polygon overlap
area <=.02, both copying contacts geometrically eligible, and both ideal fuel
placements with maximum overlap <=.02. Individual4 is a numerical sensitivity
diagnostic, not an extra confirmation replicate. Report all failures, including
bare controls. Passing admits local cap/rim chemistry design, not a cell cycle.
If only numerical contact/exclusion fails, identify the actual discrepancy
before considering a targeted correction; do not add chemical states to fix it.

After prepared face removal, report maximum cross-side overlap, first step with
all cross-side structural polygons separated by at least .1, and intact original rail/rim
bonds. This is descriptive physical release under forced bond removal, not
autonomous release/acquisition. No birth classifier is used.
Structural groups include cap/rail and attached W, excluding free E and unbound
W. Overlap uses actual-corner convex envelopes; record hull excess to expose
nonconvex deformation. This is conservative rather than exact for concave shapes.

## Reproduction and checks

One process, no workers; inspect process command lines first. CPU cap 90 s with
40 s reserved for QA, including failed execution and validation. Store every
frame's actual polygons and recomputable measures, initial/midpoint/final states,
full parameters, jobs and source hashes. Observer/plain comparisons and t=100
restart must reproduce physical arrays and RNG (excluding pinsVersion cache).
Validate overlap on known touching/overlapping squares, independently recompute
all frame geometry and gates, replay trajectories, and reject corrupted corners
and summaries. Existing runtime/historical source bytes must remain unchanged.

```
node experiments/half_cell_geometry.js experiments/scratch/HC_geometry_20260927.json
node experiments/half_cell_geometry.js --validate experiments/scratch/HC_geometry_20260927.json
```

Refuse overwrites; incomplete attempts retain raw/error/CPU records. Archive raw,
CPU and validation companions, plus a schematic generated from actual starting
polygons. Report in RESULTS 82 and LEDGER; update ROADMAP. No full physics suite
or default fingerprints needed if core remains byte-identical. A reaction-enabled
follow-up needs its own frozen contract, controls and gates.
