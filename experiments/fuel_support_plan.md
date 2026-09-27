# Fuel-support partners: bounded offline audit

2026-09-27, ROADMAP Q2; baseline `1874b38`. Fixed before counting support
pairs. Read all sixteen `SVG_screen_20260927` worlds, seeds 303/304, 100k,
both arrangements/shapes and grip on/off. Exclude pilot worlds. Q1's failed
gate remains failed. This is retrospective analysis, not fresh confirmation.

## Question and contract

Do repeated fuel contacts connect partners that each renew, beyond what their
observed contact opportunities predict? Section 72 already establishes outside
holders in 359/360 productive-parent arming witnesses. Section 50b already
establishes facilitation. Neither result establishes partner specificity,
reciprocity, helper benefit or inherited association.

No simulator steps, reactions, state changes, new knobs or material edits.
All row IDs, graphs and randomization exist only in this analyzer. The original
worlds conserve 120 letters and 40 U; recharge/jostling supply drive. Body4
and the existing side-state caveats apply. No new locality or solver claim.
First validate source/input hashes and the complete original bond/fuel tape.

## Identities, support and renewal

Reconstruct registered-row ownership in event order. Identity starts at row
registration and ends at retirement; same-step ordering matters. Do not infer
a retired row from reused block IDs. At actual fuel consumption, a directed
support edge runs from each distinct helper row to the actor's row, excluding
the actor's own row. The primary graph uses only events whose actor and ALL
holders have intact registered identities. Deduplicate multiple helper blocks
on the same row within an event. Report excluded events separately: actor
untracked, tracked actor with unknown holders, and same-row-only support.
Pre-registration arming remains unknown at that time; future membership is
not substituted into the graph. Record partly identifiable helpers separately
as coverage, not as additional primary evidence.

Record physical fuel-contact episode IDs: each fuel bond edit changes its
holder-set episode. A repeated link must use distinct episodes, not repeated
observations of one contact. For each directed pair report event/episode counts,
first/last support, distinct helper partners per recipient, switches between
successive helper sets, first-to-last span, and row retirement/horizon censoring.
These spans measure repeated encounters, not continuous partnership duration.

Use section 71's fueled exact-child edges for ALL registered lengths (the input
worlds have no births longer than five), without a founder-depth whitelist.
Report whether helpers and recipients reproduce, including zero/unknown cases.
Primary endpoint: number of unordered pairs of nonfounder rows with at least
two distinct fuel episodes in EACH direction, where each row produces a
fuel-supported exact detached child after its first received support and before
retirement. Report the weaker any-reciprocity and repeated-one-way counts too.
This is a repeated reciprocal renewal witness, not proof of mutual benefit.

## Fixed contact-opportunity reference

Reconstruct fuel co-holding opportunities from the complete bond tape. An
opportunity requires an actor unit on an intact registered row in REPEL, fuel
held by at least two blocks, all holders on intact registered rows, and at
least one external helper row. Row birth states and rearm/retire events define
known readiness; unregistered states are excluded. Fuel charge/recharge timing
is NOT recorded, so this is a geometric/readiness reference, not a full model
of reaction eligibility or an exchangeable causal randomization.

An opportunity configuration is actor row/unit + fuel holder-set episode +
helper-row set. Close it when bonds, ownership or actor readiness change.
Weight each configuration by inclusive recorded step span (end-start+1), so
within-step contacts have weight one; report episode counts separately. In a
fixed 10k-step bin, pool opportunities for the SAME actor row and unit, with
the same number of distinct helper rows as its observed consumption. Restrict
alternatives to episodes begun by that consumption and helpers still intact
at that exact event index. Clip durations to the bin and consumption time.
Do not pool other worlds, later lifetimes or unrelated recipient units.

For 199 replicates, independently draw one weighted opportunity for each
primary consumption; retain actor/time and the sampled helper set/episode.
Renewal outcomes remain those observed, not counterfactual births. Use a
separate deterministic xorshift32 seed 730000 + 100*simulationSeed + armIndex
(arm order: ABABA square off/on, ABABA opposed20 off/on, then AABAB likewise).
No simulator RNG is read or advanced. Report reference medians, 95th nearest-
rank quantiles, upper-tail fractions and the fraction of events with more than
one DISTINCT eligible helper set. The latter, not replicate count, measures
whether alternatives exist. Do not call these fractions significance tests:
unrecorded charge and fine spatial history limit the reference.

## Gate, controls and stop

The independent unit is the world. All eight grip-off worlds must have no
support edges; all eight on worlds stay in the report. Candidate status (for
designing a causal contrast only) requires the SAME preparation/shape in BOTH
seeds to have >=1 primary pair, primary above its reference 95th quantile,
and >=20% of primary-graph events with alternative helper sets. No pooled-seed
rescue, new threshold or tuned null. All preparation/shape candidates are
reported; selection remains exploratory. A degenerate reference is lack of
identifiability, not proof of no preference. Missing valid opportunities stop
the analysis as a measurement defect, without silently discarding events.

Regardless of gate, no new simulation is authorized by pair counts alone.
An earned candidate still needs a matched, local, conserved-material contrast
separating specific partners from ordinary contact opportunities. A negative
or unidentifiable result parks this candidate source and triggers a portfolio
reassessment; no extra states, rate/seed rescue or automatic ecology race.

## Evidence and reproduction

One offline process, zero simulation workers, 120 process CPU-second budget
excluding development/validation. Preserve all raw input files. Implement
`fuel_support.js` and tests, with ordered-event identity, episode boundaries,
late/retired helper exclusion, same-row deduplication, readiness and null
degeneracy fixtures. Independently reconstruct pair counts from saved edge
records; verify deterministic resampling, corruption rejection, source/input
hashes and exact archive recomputation. Observer neutrality follows from no
simulation writes; do not rerun physics tests for this offline change.

Save command, input/source/plan hashes, per-world coverage, opportunities,
support edges, pairs, null draws/summaries and gate under a fresh
`experiments/scratch/FS_audit_20260927` stem; refuse overwrite. Archive in out,
add RESULTS 73/LEDGER, rebuild the index, update ROADMAP/handoff, then commit
and push validated evidence. Record limitations and any departures explicitly.
