# Next-instance handoff — 2026-09-27

Start with `git status`, AGENTS, [ROADMAP](../ROADMAP.md),
[LEDGER](../experiments/LEDGER.md) and the research audit. ROADMAP is the
queue. Q0 is complete as RESULTS 71; Q1 is next. Earlier P1–P4/C1 failed
settings remain parked, including section 66's eight-letter benefit gate.

## Completed work

Baseline `153ea31` on main; find this session's commit in `git log`.
[Portfolio comparison](../experiments/portfolio_checkpoint.md) chose the
short-variant census over delivery timing and resource-recycling hypotheses.
All sixteen archived section-66 worlds were reanalyzed; no simulator step,
historical source edit, new rule or parameter change occurred.

- Eight grip-on worlds contain 83 distinct short fueled productive parents
  and 39 overlapping two-link renewal chains; grip-off gives zero.
- Four preparation/shape/family combinations pass the retrospective candidate
  gate: AAA, AAAAB and AB in square worlds; ABABA in opposed20.
- ABABA/BABAB has one two-link chain in each reused seed (203/204), with 5/2
  fueled productive parents. Square dimers also qualify: no length payoff.
- These are physical parent/release/fuel witnesses, not repeated strings.
  They do not establish intrinsic shape benefit, novelty or cumulative complexity.
- Short fragments not registered as stock births remain an ancestry blind spot;
  whole communities may supply the required fuel contacts.

Evidence: `experiments/out/SV_census_20260927.json`, referencing the unchanged
tracked `SS_screen_20260927` manifest/runs by hash. The frozen census plan and
sources are hashed; do not tidy their bytes. Scratch originals are retained.
Cost 0.562 CPU seconds, zero simulation steps; no simulation queue was launched.

## Validation

Original archive/source validation passes. New synthetic lineage/fuel/order
tests, independent indexed edge/chain reconstruction, exact eight-letter
calibration and six report-corruption tests pass. The report recomputes exactly.
Core bytes are unchanged; full physics suite and default fingerprints were
not rerun for offline analysis. No new solver/individual-kick result is claimed.

```sh
node experiments/short_variant_test.js experiments/out/SV_census_20260927.json
node experiments/short_variant_analysis_test.js experiments/out/SV_census_20260927.json
node experiments/short_variant_summary.js --verify experiments/out/SV_census_20260927.json
```

## Next: Q1, one frozen common-environment assay

Read [short_variant_garden_plan.md](../experiments/short_variant_garden_plan.md).
Implement its separate runner/observer and tests; no Q1 runner or simulation
exists yet. Compare ABABA/BABAB to AABAB/ABABB at equal material/composition,
both shapes and grip on/off. Four five-letter active founders consume 10 A
and 10 B from the fixed 120-letter pool. Log actual fuel holders as well as
uninterrupted physical parentage, full rearming, useful output and material.

Viability seeds 301/302, opposed20/grip-on, 20k. Only if its fixed gate passes:
seeds 303/304, all eight arms, 100k. The plan fixes benefit gates, CPU budget,
validation and stop rules. Check machine simulation processes before launch;
at most four workers total. Use fresh stems if the listed paths already exist.

A positive screen earns a separately planned P0 sensitivity check and fresh
confirmation. A failed screen parks the candidate, without tuning or extra
seeds. Even positive arrangement benefit would not show that five letters
beat the observed dimer competitor. No population race or core promotion is
authorized by this census. Standing approval permits committing/pushing
validated work; inspect local/remote status before acting.
