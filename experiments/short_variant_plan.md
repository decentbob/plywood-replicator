# Short-variant renewal census

2026-09-27, Q0 follow-through; fixed before computing variant counts. Input:
`out/SS_screen_20260927.manifest.json` and `.runs.jsonl`, section 66's sixteen
100k worlds, seeds 203/204, both founder arrangements, both shapes, grip on/off.
Do not include viability seeds or select worlds by outcome. This is a new
retrospective endpoint; section 66's failed prospective gate stays unchanged.

## Contract and decision

Question: do the logged shorter rows include inherited, fuel-supported renewal
across two consecutive parent-child links, or only birth/rearm/recurrence events?
Use only archived observations. No simulator steps, new states, types, side
marks, rule cases, parameters, material edits or reaction reads/writes. Existing
rules read incident bonds and exposed side state; fuel GIVE contacts arm one
letter, and end loss/previous-pass FRAY permits turnover. Existing live-side
caveats remain. All 120 letters and 40 U are conserved in each input world;
fuel recharge and jostling supply drive. Body jostling/four passes is the
recorded approximation; no solver-independent mechanical claim is possible.

Validate the full original archive and source hashes first. Then inspect all
logged nonfounder rows of length 2–7. A useful row must be face-detached at its
logged birth. A renewal edge requires an exact reversed-complement child with
disjoint material and reversed per-member release mapping to one uninterrupted
parent. Reconstruct that relation from row/provenance/event records rather
than using stock generation, founder `depth`, or string recurrence. Ordered
events, not equality of step timestamps, determine whether a parent was live.

Also require the parent to have fully rearmed by the child's registration.
For every parent unit, the most recent release at the parent's registration
must have a recorded fuel rearming after that release and before the child is
registered. Arming before the parent's whole-row birth is allowed. This guards
against counting fragments of the prepared active founders as renewed solely
because they start active. Missing release/fuel witnesses are excluded and
reported, not inferred. Exact lineage identity ends at its first recorded
lateral edit/fray; reused block IDs cannot restore it.

Primary: number of distinct short detached nonfounder parents with a witnessed
fuel-supported renewal edge, per world. Stronger discriminator: A→B→C chains
with BOTH edges meeting that rule (A and B each fuel-supported). Report all
chains and their row IDs; overlapping chains/events in a world are not
independent replicates. Canonical family is the lexicographically smaller of a
sequence and its reversed complement; never collapse permutations or lengths.

## Fixed gate, controls and limits

Archive viability: all sixteen records validate; required release/rearm/row/
retirement events and member provenance exist. Missing fields or failed source
validation stop analysis, preserving the failure. A known exact eight-letter
renewal serves as a positive calibration of the same edge reconstruction;
it cannot qualify as a short candidate. Synthetic fixtures must detect mixed
parents, stale/recycled IDs, late fuel events, non-detachment and same-step
event ordering. No new trajectory replay is needed for a read-only analysis.

A family earns **candidate status only** if a two-edge chain occurs in both
203 and 204 under the same founder preparation and shape with grip on, and
that family's primary count exceeds its matched grip-off count in both worlds.
Test all observed families, report them all, and label selection exploratory;
this is not a multiple-testing-corrected benefit estimate. Square controls
show whether the witness also exists without wedges; no shape superiority is
required or inferred. Other preparation arms remain in the report.

Report detached births, fueled productive parents, two-edge chains, length
and family, fully active rows, horizon survivors, birth-by-50k counts and 5k
right censoring. Retain archived material partitions and short parents lacking
identifiable provenance. Lost rows are losses, not right censoring. No lack of
witness establishes sterility: the original observer registers stock births,
not every surviving fragment after a lateral edit. Those fragments can become
untracked parents. End-of-run physical state is not a history of their identity.

If a candidate passes, freeze a separate small common-environment ablation
plan before simulation; future P0 checks must preserve the candidate/control
contrast. If none passes, park this census as a candidate source and identify
whether absent renewal or incomplete parent registration limits the inference.
Do not rerun the failed eight-letter contrast with weaker thresholds, append
seeds, extend the horizon or add states. A census cannot establish causal
reproductive benefit, new mechanical capability or cumulative complexity.

## Reproduction and cost

Implement `short_variant_summary.js` and `short_variant_test.js` without editing
hashed historical sources. One analysis process, zero simulation workers;
budget 60 process CPU seconds, excluding test development. Save input/source/
plan SHA-256 hashes, exact command, full per-world/family counts and witnesses
under a fresh `experiments/scratch/SV_census_20260927` stem; refuse overwrites.
Archive the report in `out/`, preserve the existing raw input files, independently
recompute the report, run corruption/regression tests and `git diff --check`.
Add RESULTS/LEDGER entries, regenerate the knob index, update ROADMAP and the
handoff. No core invariant suite or default fingerprint rerun is needed if
runtime bytes remain unchanged. Report skipped checks accurately.
