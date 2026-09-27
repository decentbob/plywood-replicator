# Next-instance handoff — 2026-09-27

Q3's bounded archived-world replay is complete (RESULTS 75). **No task-owned
simulation remains.** Read ROADMAP, LEDGER and the research audit first.
Baseline was `428b37a` on main; find the delivered commit with git log.

## Delivered result

All sixteen section-62 worlds (105–108, on/noBind/noSource/neither) completed
50k, 800,000 steps total. Initial hashes, full final saved state/RNG, old
100-step samples, births and original 5k member follow-ups agree exactly.
Ordered tapes reconstruct final bonds, row retirements, releases and physical
support witnesses. Core, historical sources, the section-74 observer and
frozen replay plan are byte-identical.

The cost-only 105/on 10k preflight passed: 41.234 CPU seconds, 149,856,256-byte
peak RSS, 3,298.72-second projection. It continued on the same instance. The
one-process batch finished at **3,581.703 CPU seconds**; peak RSS was
618,663,936 bytes. Final offline QA/analysis added **39.328 seconds**, so the
measured sum is **3,621.031**, above the frozen all-work budget by 21.031.
The runner did not reserve final-analysis cost. Earlier auxiliary checks were
not metered separately; do not claim total-budget compliance. Record this
deviation and reserve/aggregate final QA in future caps. No worker pool,
extra seed, horizon extension, threshold adjustment or chemistry change.

**No diagnostic signature qualifies.** Known-site coverage in on worlds is
79.6534/76.8809/75.9505/79.7978%, all below >=80%. Seed 106 also has only
13 geometric recipient opportunities and two ended bindings (<20 each).
Observed availability/encounter/binding rates order failed below passed
worlds, but the gates prevent nomination. Episode use does not share that
ordering: 108's 19/60 exceeds both passed worlds. Supported exact recipient
output 16/0/13/3 is attribution, not causal necessity or inherited benefit.

## Evidence and verification

Archive: `experiments/out/DD_replay_20260927/`: launch/final manifest, sixteen
lossless raw records (16,803,302 compressed bytes), and full per-world summary.
Raw files and manifest are byte-identical to retained scratch evidence.
The summary includes producer/recipient/unknown categories, raw denominators,
open/ended bindings, fixed 5k support follow-up, original mutation/follow-up
classes, source/input hashes and exact commands. No raw evidence was deleted.

`delivery_replay_test.js` verifies hashes, historical agreement, physical
tapes, sample completeness, cost boundaries and corruptions.
`delivery_replay_analysis_test.js` covers attribution, unknown row identities,
censoring, zero denominators and strict world-level gates. The section-74
fixture analyzer passes prepared neutrality and active-binding restart.
All five 1500-step default fingerprints match the audit baseline; no full
physics-suite rerun or P0 promotion. No complete simulation rerun for QA.

```sh
node experiments/delivery_replay_test.js experiments/out/DD_replay_20260927
node experiments/delivery_replay_analysis_test.js
node experiments/delivery_replay_summary.js experiments/out/DD_replay_20260927
```

Creation command was `node experiments/delivery_replay.js experiments/scratch/DD_replay_20260927`.
It refuses existing destinations. Do not launch it again merely to continue
this task; the bounded assay is finished and its diagnostic route is parked.

## Next: Q4, offline portfolio comparison

Compare distinct causal contrasts before any new assay. Include catalytic
efficacy with physical binding retained and an independent alternative grounded
in the existing mechanical fit/renewal evidence. Name a new causal prediction,
the simplest control, rule cost, path to inherited function, viability and
CPU/stop gates. A failed arrangement/port setting cannot be reopened by more
seeds or tuning. Write at most one prospective plan if a candidate earns it;
otherwise state the missing evidence. No simulation, efficacy implementation,
coverage repair, new state or population screen is queued. Sections 62, Q1
and Q2 remain failed/parked. ROADMAP contains the authoritative assignment.
