# Next-instance handoff — 2026-09-27

Start with `git status`, AGENTS, [ROADMAP](../ROADMAP.md),
[LEDGER](../experiments/LEDGER.md) and the research audit. Q1 is complete as
RESULTS 72 and parked. Q2, an offline fuel-support audit, is next. No
simulation batch is queued; no task-owned simulation process remains.

## Completed five-letter assay

Session baseline `9fc9d4a` on main; find the delivered commit with `git log`.
The [frozen plan](../experiments/short_variant_garden_plan.md) was implemented
without changing its bytes, historical assays, simulator rules or defaults.
Four active five-letter founders consume 10 A + 10 B from 120 letters, with
40 U. ABABA/BABAB versus AABAB/ABABB, square/opposed20, grip on/off.

- Viability 301/302, 20k, four worlds: both arrangements copy; gate passes.
- Fresh screen 303/304, 100k, sixteen worlds: **fixed benefit gate fails**.
  Opposed20 primary alternating/rearranged: 10/3 and 9/8. Square: 12/18 and
  10/2. Seed 304 misses both the minimum difference and shape interaction.
- Both arrangements renew exact descendants; all initial founders disappear.
  Shorter registered rows also renew and remain in the evidence.
- Across 72 productive exact parents, 359/360 arming witnesses involve
  outside member IDs; 30 armings precede the parent's whole-row registration.
  This is shared-contact evidence, not proof of a specific dependency.
- 20 worlds / 1.68M steps / 803.455 process CPU seconds excluding validation.
  Viability used four workers; screen used three while one check/replay ran.
  No outcome-dependent stopping, missing arm, rate tuning or P0 batch.

Archives in `experiments/out/`: `SVG_viability_20260927` and
`SVG_screen_20260927`, each `.manifest.json`, `.runs.jsonl`, `.summary.json`,
`.details.json`. Raw screen JSONL is about 50.5 MB; it is evidence, not clutter.
Scratch originals are preserved. The summary's `fuel` field is the contact
breakdown; scalar fuel totals remain in raw `metrics.fuel` and `.details.json`.
Do not edit byte-hashed run sources just to change presentation.

## Validation and reproduction

All four selected core checks and five baseline fingerprints pass. Observer
neutrality covers both arrangements/shapes; full unobserved replays match
301 and 303 alternating/opposed20 worlds at 20k and 100k. All twenty saved
checkpoints resume for 500 steps exactly (excluding pin-cache version).
Independent primaries, complete bond/fuel-holder reconstruction and twelve
corruptions per batch pass. No full 39-check suite or new individual-kick
comparison was run; the failed gate earns neither confirmation nor tuning.

```sh
node experiments/short_variant_garden_summary.js experiments/out/SVG_screen_20260927
node experiments/short_variant_garden_analysis_test.js experiments/out/SVG_screen_20260927
node experiments/short_variant_garden_report.js experiments/out/SVG_screen_20260927
node experiments/short_variant_garden_report_test.js
```

Use fresh stems for reruns. Manifests contain source hashes, commands, exact
parameters and CPU costs; states, ordered events, fuel holders, shape samples,
material inventories, censoring and all descendants are retained.

## Next: Q2, offline support-partner audit

Read ROADMAP Q2. Before counting pairs, freeze a small plan for distinguishing
recurring renewing partners from incidental interchangeable contacts. Use
all sixteen screen worlds. Define identities at actual fuel consumption;
separate tracked intact rows, untracked material and pre-registration arming.
Never revive a retired row from reused block IDs. Measure partner turnover,
reciprocity and helper renewal, with world-level denominators, coverage and a
stated contact-opportunity null respecting lifetimes.

Section 50b already establishes cross-row contact facilitation. Merely counting
it again does not justify new mechanisms, cooperation or selection. This audit
may nominate a causal contrast, not rescue Q1 or prove a dependency. If it
cannot distinguish partner-specific benefit from contact opportunity, record
that no new candidate is justified and reassess the portfolio. No automatic
population race, fresh confirmation, helper state or selective exclusion is
queued. All earlier failed P1–P4/C1 settings remain parked.

Standing approval permits committing and pushing validated work. Inspect
local/remote status before delivery; main is the only long-lived branch.
