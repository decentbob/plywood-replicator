# Q8b follow-up: resolve the measured four-pass contact/pin conflict

Frozen 2026-09-27 after HC_contact_20260927_v2 and its checked diagnostic.
This is a new, targeted numerical comparison, not a revised pass for Q8b.
Q8b fails 1/16 polygon worlds: body4, attached, seed611, Q at t115.
The within-step replay shows A/A overlap .7237 after kicking, zero after the
fourth contact sweep, then .0737 after final pin/shape correction. A/E overlaps
also persist at four passes. Individual16's eight worlds pass. This specific
constraint conflict justifies checking body16; body4 remains parked here.

Use precisely the existing polygon-contact subclass, geometry, eight-block
inventory, sigma .3/sigmaRot .45 and .8 stiffness. Change only `iters` from
4 to 16 in the eight archived body-jostled initial states (seeds611/613,
P/Q, attached/unbound). No reaction/interface changes, no new states or marks.
Runtime reads pair geometry/incident bonds; grouping for jostling is the
accepted approximation. Observer-only prepared removal of two face bonds
after 100 held steps, followed by 100 released steps. No growth or births.

Compare with Q8b's archived body4 and individual16 polygon worlds, without
rerunning them. This is a same-initial-state numerical check, not fresh-seed
confirmation. One new setting, no further solver, kick or horizon search.
Repeat source-span/self checks and initial five-step viability (finite arrays,
conservation, retained pin <=1). Keep every frame and every failure.

Admission: all eight body16 worlds pass the previous held gate (24/25 good
samples at t76..100), all 100 released frames have cross-side overlap <=.02,
at least99/100 have retained pin <=.1, and structural clearance >=.1 occurs.
Additionally, all-pair overlap including E and bonded neighbors must remain
<=.02 in every released frame. Apply this extra check retrospectively to the
eight archived individual16 reference worlds as well; report it separately
from the unchanged failed Q8b gate. No continuous non-crossing claim follows.
Success permits an isolated rim interface/chemistry assay at body16 with an
individual16 control, not a core-default change. Failure stops numerical
extensions this session and parks moving half-cell tests at these settings.

Run observed/plain and t100 subclass restart comparisons for every new world;
validate all frames from actual corners, replay all trajectories and compare
initial states to the archive plus the single documented parameter change.
Reject corner/aggregate corruption. Archive gzip raw, validator and CPU records,
all source/input hashes and command. Preserve Q8b failures and its validation
harness issues (initial serialized-array check; restored cache comparison).

One process, no workers; <=90 CPU seconds including execution, validation,
analysis, compression and any failed attempts; reserve45 for validation.
Q8b consumed about20 measured CPU seconds so far, below its separate180 cap.

```
node experiments/half_cell_resolution.js experiments/scratch/HC_resolution_20260927.json.gz
node experiments/half_cell_resolution.js --validate experiments/scratch/HC_resolution_20260927.json.gz
```

Record with RESULTS83, LEDGER and ROADMAP. Default core/historical sources
remain byte-identical; do not rerun the unrelated full physics suite.
