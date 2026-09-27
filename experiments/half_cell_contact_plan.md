# Q8b: polygon contacts in the half-cell end fixture

2026-09-27. Freeze before outcomes. ROADMAP Q8b, RESULTS 68 and 82.
Question: does the existing research polygon-exclusion method fix released
overlap without sacrificing prepared cap access? This is a numerical prerequisite
for interpreting attachment/release, not a new cell mechanism or fitness test.

## Contract

Reuse Q8a's exact archived eight-block initial states and parameters. A new
HalfCellGeometrySim subclass delegates physics to the existing PolygonContactSim
solver and its shape-bound/outline/separation methods. Extend its supported-type
guard to A, C-as-W, P, Q and E. Every unbonded pair uses actual convex envelopes;
directly bonded pairs retain the existing exemption. No rays, membranes,
droplets, strain breaking or corner snapping are supported in this fixture.
The inherited kicks, pins, deformation and wrapping remain unchanged; check
their source spans. Contacts read pair geometry, mass and incident bonds, and
write pair positions. Body jostling retains its documented component grouping.

No reactions, new states, side marks, mutable type conversions or runtime
observer IDs. Ordinary step/chemistry/binding still throw. Cap rim pins remain
temporary lateral-slot carriers with chemistry disabled. No block creation or
destruction; P/Q, two A, two W and two E remain fixed. Prepared unlink at t=100
is exactly the earlier intervention. No growth, births or descendants are tested.

## Fixed comparison

Input: `out/HC_geometry_20260927_v2.json`. Select its 16 body4/individual16
worlds (seeds 611/613, parent P/Q, attached/unbound rim). For each, run core
and polygon arms from the identical saved state, 100 held + 100 released steps.
Core must replay every archived frame. These are paired numerical comparisons
using old seeds, not fresh biological confirmation. No parameter tuning or
extra seeds/horizon after outcomes. Single process, no workers; inspect other
simulation command lines before execution.

Capture all 201 frames and recompute Q8a metrics from actual corners. First
five steps per world are viability checks: finite state, symmetric unchanged
material/bonds and pin residual <=1. Stop on invariant failure, preserve the
partial attempt. Ordinary numerical gate failures do not censor later worlds.

Primary admission requires all 16 polygon worlds to retain Q8a's held gate:
at least 24 of t=76..100 with pin residual <=.1, all-pair overlap <=.02,
both copying contacts eligible, both ideal fuel probes overlap <=.02.
Also require each polygon world's maximum released cross-side structural
overlap <=.02 (t=101..200), retained-pin residual <=.1 in at least 99/100
released frames, and at least one released structural clearance >=.1.
Report all-pair overlap and directly bonded overlap separately from cross-side
overlap; a pass is bounded residual control, not exact exclusion or prevention
of tunneling between saved steps. No continuous collision detection is added.
Compare maxima and failed-frame counts with core in every mode/rim stratum.

Passing admits the distinct rim interface and a chemistry test, without core
promotion. Failure identifies the residual cause and parks this particular
contact setting; no solver sweep or chemical state may hide it. The next action
must distinguish contact error from cap design before a larger cell run.

## Validation and provenance

For both arms, compare observed/plain final physical arrays and RNG, and exact
subclass restart at t=100 (ignore only pinsVersion cache). Recompute all stored
metrics and gates, replay all frames, check retained bonds and type inventory.
Check known overlap, containment, torus and mass-weighted pair separation,
guard unsupported types, and reject altered corners, aggregates and job labels.
No observer classification enters mechanics. Check core/historical source hashes.

Budget: 180 CPU seconds across execution/QA, with execution ceiling 60 and
validation ceiling 60, leaving 60 for failure handling, analysis and file work.
Use process CPU including startup, analysis and compression, plus CPU deltas for
serialization; report any unmeasured final bookkeeping explicitly. No wall-time
speed claims. Store partial records before advancing, error and CPU artifacts on
failure; refuse overwrites. Raw is gzip JSON with all initial/mid/final states,
frames, parameters, input/source hashes, and exact command. Hash imported
research helper sources as well as the core and new files. Archive exact bytes,
write RESULTS 83 and LEDGER, rebuild index, update ROADMAP and brief handoff.

```
node experiments/half_cell_contact.js experiments/scratch/HC_contact_20260927.json.gz
node experiments/half_cell_contact.js --validate experiments/scratch/HC_contact_20260927.json.gz
```

No full core suite or trajectory fingerprints are required when core bytes are
unchanged. A later reaction-enabled assay needs its own local read/write contract.
