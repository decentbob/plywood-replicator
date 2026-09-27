# Next-instance handoff — 2026-09-27

Q5's prepared geometric-error assay is complete (RESULTS 77), after Q4's
portfolio comparison (76). **No task-owned simulation remains.** Baseline was
`9fa730d`; find the delivered commit with git log. Read ROADMAP and LEDGER.

## What was tested

A distinct hypothesis: existing wedge geometry might prevent wrong docked
letters joining long enough for ordinary undocking to remove them. This uses
no new proof rule, state, force or core change. Unlike section 49 (pSoft=0),
it explicitly supplies a wrong letter; unlike 66/72 it measures discrimination,
not arrangement/fuel benefit. The prospective plan is
[geometric_error_plan.md](../experiments/geometric_error_plan.md).

96 conserved 16-block prepared worlds: every AA/AB/BA/BB context, both correct
or one wrong incoming letter at either site, square/opposed20, seeds 501/502,
body4/individual16. Template relaxation is 100 zero-kick physics-only passes;
two face bonds are prepared by ordinary placement, then 200 ordinary steps.
Acquisition is supplied, not demonstrated. First lateral joining, wrong-member
loss and correct-neighbor loss are separate outcomes.

## Result: park this preparation

Correct joining is square 4/4 and opposed 3/4 in every seed/physics stratum.
Square wrong joining is 8/8; opposed gives 2/8 for both body seeds and 4/8 for
both individual-kick seeds. The square-adjusted contrast passes. However,
wrong-member loss is only 2/2/3/1 of eight (body501/body502/individual501/
individual502), below the frozen >=4 gate throughout. Neighbor losses are
4/4/1/3. No censoring or simultaneous-first-loss ambiguity.

Every AA correct pair loses a member first, while both AA wrong placements
join, in every stratum. Actual corner-derived side geometry supports that
reversal. Fewer wrong joins in aggregate is not a useful general error filter.
No causal reproductive benefit, natural acquisition, inherited fidelity or
complexity is demonstrated. Do not select favorable contexts, tune angles or
undocking, add proofreading, or run a population extension. Q4's general
reopening condition remains: a distinct physical operation with a measurable
same-material benefit prediction against simple renewal. No assay is queued.

## Evidence and checks

`experiments/out/GE_20260927.json` is 13,114,085 bytes; `.json.cpu.json`,
`.json.validation.json` and `GE_20260927.summary.json` accompany it. Scratch
originals are preserved and byte-identical. Source/plan hashes, parameters,
full initial/mid/final states, ordered edits and actual geometry are retained.
The offline report includes every context and checks loss timing.

All 96 observed/plain comparisons and halfway restarts match saved state/RNG
(excluding the known restored pin-cache revision). Bond reconstruction,
conservation, fixed parameters, geometry calculations and four corruption
checks pass. Core and all historical assay/data files are unchanged. No full
physics suite or default fingerprint rerun. One process, no workers.

Cost: 48,000 ordinary steps including neutrality/restart, plus 9,600 prepared
physics passes. Measured execution 9.405 CPU seconds, validation 1.858, timing
inspection 0.233, report calculation 0.452 = 11.948. Cap 120, with 40 reserved
for QA. Last report write and shell/Git/docs overhead are outside those tiny
measured intervals. No parameter/horizon/seed changes or partial runs.

```sh
node experiments/geometric_error.js experiments/scratch/GE_NEW.json
node experiments/geometric_error_test.js experiments/scratch/GE_NEW.json
node experiments/geometric_error_report.js experiments/scratch/GE_NEW.json experiments/scratch/GE_NEW.summary.json
```

These are reproduction commands, not a request to rerun a parked test. Outputs
refuse overwrites. The archived context report includes the original one-off
timing-inspection cost; distinguish historical accounting from a fresh run.

## Earlier decisions remain

Q3 archive `experiments/out/DD_replay_20260927/` preserves sixteen exact
historical trajectories, but all on worlds miss >=80% identity coverage;
seed 106 also misses both denominator gates. Supported output is attribution,
not necessity. Its run plus unreserved QA cost at least 3,621.031 CPU seconds,
21.031 above its 3,600 cap; do not erase that deviation. Section 62, Q1 and Q2
remain failed/parked. Q4's rejected efficacy and pairing-renewal candidates
were not implemented. Preserve all raw evidence and historical source bytes.
