# Q7: does freeing a face physically turn it away?

2026-09-27. Frozen before running. Evidence sought: prepared geometry only.

## Admission review

RESULTS 78 established supported ligation; 79 failed acquisition and usable
release. Another population or eight-block repair batch is not earned. Leaving
repair parked costs no compute and avoids optimizing a prepared rescue. A small
geometry diagnostic is justified only because 79 identifies repeated binding,
and the existing fold rule could change that contact through mechanics without
adding a reaction. This is the third diagnostic in the repair direction, not a
third attempt to pass its failed autonomous gate. A negative ends this candidate;
a positive admits only a separately planned competition between relaxation and
rebinding, including acquisition cost. No fold/stiffness sweep follows either.

Source: `src/sim.js` rest-shape construction, `_restSlot`, `_physics`, `_geomOK`;
RESULTS 34e, 45a and 47. For a unit square the free-face wedge has front vertices
(0.5,+/-0.5) and back vertices (-0.5,+/-hb), with
`hb=max(0.075,0.5-tan(fold*pi/360))`. At fold 45, hb=0.0857864.
The face itself does not retract. The lateral side leans by 22.5 degrees; a
freed endpoint beside a square neighbour could rotate away through their pins.
Two opposing endpoints could therefore lose their antiparallel fit. This is a
prediction about relaxation, not a claim that pinned corners reach rest shape.
Circular repulsion and elastic compromise may prevent it. The maximum effective
lean is about 23.03 degrees, so larger fold settings offer little extra range.

The same fold acts before acquisition. There is no direction-sensitive latch:
if folding suppresses reattachment it can also suppress useful attachment.
RESULTS 47's straightening did not improve sustained copying; do not count
deformation alone as function or inheritability.

## Frozen fixture and gate

Six four-block worlds: two AB dimers facing antiparallel, 2 A + 2 B, no fuel,
24 by 24 box. Both lateral links and one face link supplied; the other face
link is removed at t=0. All arms start with identical square actual corners,
positions, orientations and internal states. This is a prepared intervention.

Arms: straight (`foldA=foldB=0`, stiffness 0.8), fold45 (fold 45, stiffness 0.8),
rigid45 (fold 45, stiffness 1; expected inactive bonded-shape control).
Use solver iterations 4 and 16 for every arm; `snapCorners=false`, strain breaking
off. `sigma=sigmaRot=0`, body jostling off, seed 605. There are no random physical
kicks, so duplicate seeds and body-jostle comparisons would not be independent
physical evidence. Binding, melting, ligation, fraying, capture and damage are
disabled equally. Use ordinary `Sim.step`, not a replacement solver. No changed
types, states, side marks, reaction cases or knobs. The fold reads only the
block's own face occupancy and changes its own preferred polygon geometry.

Run 100 steps, record actual corners, contact eligibility and maximum existing
pin residual at every step, including t=0. Verify finite geometry, conserved
inventory and original three bonds after the first five steps before continuing
the six worlds. Stop on an invariant failure; keep partial evidence. Full
state/RNG observation neutrality and step-50 restart comparison are required.

Primary gate, separately at 4 and 16 iterations: the missing face must be
geometrically ineligible at every sample 76--100 in fold45, eligible throughout
that window in straight and rigid45, and every existing pin residual must be
below 0.1 throughout that window in all arms. All initial missing faces must
be eligible. Report first ineligibility and its persistence, actual angle/gap,
and pin residuals even when the gate fails. Samples are not replicates.

Only a pass at both solver settings admits a new kinetic plan. No autonomous
release/repair claim: those processes are disabled. No new natural-damage or
population run, no claim of inherited benefit or evolved complexity. This test
does not establish physical energy accounting for the prescribed shape switch.

## Execution and evidence

One process; confirm global simulation count before running. Budget 30 CPU
seconds, at most 10 for simulations and 20 reserved for analysis/QA. Include
setup, observer/plain/restart, failures, serialization and validation. Exact run:

```
node experiments/passive_escape.js experiments/scratch/PE_geometry_20260927.json
node experiments/passive_escape.js --validate experiments/scratch/PE_geometry_20260927.json
```

Store full initial/midpoint/final states, every actual-geometry sample, complete
parameters, source/plan hashes and CPU usage. Validate geometry independently
from saved corners, replay every sample, compare plain/restart states, reject
modified contact flags, and verify historical core bytes against DC_20260927.
Never overwrite files. Archive raw and validation/CPU records in `out`, update
RESULTS/LEDGER/index and the sole ROADMAP queue. No core or historical source
edits; full physics suite/default fingerprint reruns are unnecessary for this
isolated fixture and will be recorded as skipped.
