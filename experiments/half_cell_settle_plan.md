# Q8e: angled polymer bonds and free-end access

Frozen 2026-09-28 before running. RESULTS85 establishes automatic W attachment
but not mechanics after angled capture. User authorizes the next check.
Keep the existing rule; no new states, rates, fuel mechanism or projection.
Question: does an eligible angled attachment relax to a useful edge joint,
leaving room for a further block? This is a physical prerequisite for a
heritable protective arc, not evidence of growth, reproduction or protection.

## Prepared comparison

Six fixtures: P/W and Q/W attachment; extension from a W already attached to
P or Q; native M extension at each of its two ends. Each has five conserved
parts. P/Q fixtures contain one cap, one rail A, three W. Native controls have
four M and one parked A, with an M dimer initially prepared. These are
mechanical benchmarks of different shapes, not equal-material fitness races.
Within every on/off pair all material, poses and physics match.

Align one end corner with a 30-degree outward opening (sign fixed by end
polarity), zero gap. Assert eligibility and no initial overlap >1e-9. On adds
the eligible incident bond as an explicitly prepared intervention, without
moving either part; off leaves that joint absent. Preserve other prepared
rail/rim or M-dimer bonds. Association probability remains pMem=.2; this
mechanical intervention bypasses its stochastic draw and is not a birth.
No chemistry or further binding runs. Physics alone moves existing parts.

Use fresh seeds733/739, body16/individual16, 60 physics steps, sample every
step: 6 fixtures x 2 seeds x 2 modes x on/off =48 worlds. Rest stiffness .8,
sigma .3, sigmaRot .45, 24x24 torus; W/cap shapes as in85, native M wedge45
at size.5 and stiffness.8, mobility1. Retain the research polygon exclusion
solver. Extend its type whitelist to M only; same all-pair exclusion, direct
bond exemption, pins and body-jostling approximation in both families.

## Outcomes and gates

Preflight all initial geometry, conservation and subclass restart; first five
steps must stay finite, preserve bonds/material and pin <=1. Stop on invariant
failure, preserve raw attempt/source before repairs. Primary: all on fixtures
have max incident pin <=.1 and all-pair overlap <=.02 in every final10 frame.
Additionally, the incoming block's other end remains unoccupied and an
observer-only rigid placement of the already conserved spare block there has
pin <=.1 and overlap <=.02 with every other part in each final10 frame.
The probe reads actual corners, never moves material or feeds reactions.
Record transient maxima and the first persistent-good step separately.

Binding must improve edge alignment over waiting: in each fixture/motion
stratum, at least one of two on worlds passes the gate while its matched off
world does not maintain that same candidate edge within pin <=.1 in all final10
frames. All native benchmark on worlds must pass too. Off retains its original
topology; no new bonds. A failed gate stays failed, with no angle/stiffness,
solver, seed or horizon tuning. Diagnose a distinct cause before further work.
A pass admits curved-arc geometry planning, not a population or benefit claim.

## Evidence

Every record has initial/mid/final full state, actual polygons and metrics.
Compare observer/plain and midpoint restarts; replay all frames, recompute
metrics and summary, reject corrupted corners, labels and bonds. Source hashes
include unchanged imported code; record exact commands and all zero/failures.
Generate a labelled actual-frame SVG for inspection. One process/no workers;
check machine queues first. CPU budget120s: execution45, validation45, reserve30.
Archive raw and CPU reports/manifest; update RESULTS86, LEDGER/index, ROADMAP
and brief handoff; commit/push under standing approval. Core is unchanged.

```
node experiments/half_cell_settle.js experiments/scratch/HC_settle_20260928.json.gz
node experiments/half_cell_settle.js --validate experiments/scratch/HC_settle_20260928.json.gz
```
