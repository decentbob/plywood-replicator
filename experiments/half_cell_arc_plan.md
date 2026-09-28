# Q8f: a derived curved W and complete paired D geometry

Frozen 2026-09-28 before geometry/simulation outcomes. RESULTS86 admits a
prepared curved-arc test; user says continue. No rule, timing state or fuel
change. Question: can one polygon close an arc behind an ordinary capped chain
without blocking its outward duplicate, and can the two prepared assemblies
separate while keeping their own arcs? This is geometry/mechanics, not growth.

## Derivation and contract

Choose one four-block straight chain P-A-A-Q, nominal cap origins (0,0),(0,3),
existing chamfered cap shapes. Extending their rim edges gives center(-1.25,1.5),
inner radius .75*sqrt(5), outer radius sqrt(5). The connecting exterior arc
sweeps 2*pi - 2*atan(2) =233.130102 degrees. Split it into eight identical
convex annular trapezoids, turn29.141263 degrees each. Radial end edges have
length sqrt(5)/4, exactly the cap rim edge. In CCW vertex order, F is outer-to-
inner at the entering radial side (minus); K is inner-to-outer at the exiting
side (plus). Other sides stay inert. Subtract each polygon's vertex mean.
Set sizeC=sqrt(polygon area), so the inherited square-size mass proxy equals
its actual area. This is a new fixed rest shape in an isolated subclass, not
type conversion or a runtime arc/length reader. Counts/geometry are setup only.

The second D is a 180-degree rotation about(.5,1.5): Q-A-A-P shares four
copying faces with P-A-A-Q, while its arc lies on the opposite side. Each has
eight W, two A and P/Q: 24 structural blocks total, plus four free E parked
away initially. Keep all 28 blocks/types/masses fixed within every comparison.
Fuel-size probe placements use those existing E polygons analytically only.
All bonds are prepared. Chemistry, new binding, breakage and fraying are off.

Use existing separate rim storage, automatic polymer compatibility (inactive
in these physics-only runs), polygon contact solver and mechanical bond union.
No new chemical state, mark or knob. Numerics retain body grouping; compare
individual kicks at identical sixteen-pass resolution. Cap/chain rest shapes
unchanged. No global information enters chemistry, and no dynamics sees IDs.

## Fixed comparison and gate

Static: actual-corner overlap <=1e-9, every prepared pin/closing gap <=1e-9,
all four copying pairs accepted by core geometry/compatibility, all four cap
fuel probes nonoverlapping. Translate the second entire prepared D outward
by 0,.1,...,2 in an observer copy; no cross-assembly overlap at any position.
Verify same W has complementary end labels and cap/W, W/W corner eligibility.

Dynamic: fresh seeds761/769, body16/individual16, closed/open arcs =8 worlds.
Open control omits the middle W/W joint in each arc but keeps its pose/material.
Same copying-face bonds in both arms. Hold40 steps, then impose removal of
the four temporary face bonds and run80 more, horizon120. This is an explicit
experimental release; no autonomous copying/release claim. Sigma.3,
sigmaRot.45, stiffness.8 for A/P/Q/W, 24x24 torus, sixteen solver passes.
First5 steps: finite state, symmetric/disjoint graphs, fixed material, pin<=1.
Invariant failures stop the batch; geometry-gate failures are recorded, not tuned.

Closed-arm promotion requires every world to have all own bonds intact,
pin<=.1 and structural all-pair overlap<=.02 in every final10 held frame
(31..40) and every final10 released frame (111..120). In the held window,
copying pairs must remain core-geometry eligible and cap fuel-probe overlap
<=.02. After imposed release, achieve structural inter-assembly gap>=.1 in
at least one frame by120. Report all-pair overlap including E, transient
maxima, closure-gap controls and probe obstructions separately. Open controls
diagnose the mechanical cost/benefit of closure; they do not need to fail and
this is not a fitness comparison. Every closed world must pass; two seeds
are a lead. No angle, block-count, mass, horizon, stiffness or solver rescue.

## Evidence and delivery

Full initial/mid/final state; frame polygons/topology each step; independent
observer/plain and midpoint restart checks. Replay every frame and recompute
geometry/gates, reject corrupted corners/bond lists/job labels/aggregates.
Static probes must not alter arrays or RNG. Preserve failed preflights and
exact source snapshots before any repair; no overwrites. Record hashes and CPU.
One simulation process, no workers; inspect machine queue first. Budget180 CPU s:
execution70, validation70, report/archive reserve40. Stop instead of extending
a failed screen. Render actual full-cell geometry, inspect image, archive all
evidence, RESULTS87/LEDGER/index/ROADMAP/handoff and commit/push. Core unchanged.

```
node experiments/half_cell_arc.js experiments/scratch/HC_arc_20260928.json.gz
node experiments/half_cell_arc.js --validate experiments/scratch/HC_arc_20260928.json.gz
```
