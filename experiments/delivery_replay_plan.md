# Q3 archived ecology replay: fixed diagnostic protocol

2026-09-27, written after the section-74 fixture gate, before replay outcomes.
This is a retrospective diagnostic of section 62's already-failed confirmation,
not another test of its benefit gate or a fresh replicate. No replay launched
as part of the fixture task. Earlier gates and parameters remain unchanged.

## Inputs, controls and execution gate

Use `experiments/out/RD_dependence_confirm` protocol, manifest and all sixteen
raw runs: seeds 105–108 crossed with on/noBind/noSource/neither, original
parameters, 50,000 steps. Analyze (10,000,50,000]; keep the earlier history to
resolve identities. Include successful seeds 105/107 and failed seeds 106/108.
Read original source hashes, job coverage, observations and initial hashes
before running. Do not edit historically hashed sources.

Use the section-74 observer unchanged. Also attach the original birth/member
observer and collect the old 100-step samples/follow-ups at exactly their old
times. Compare original initial physical hash, full final save/RNG, all old
births, samples and member follow-ups. A mismatch invalidates that replay;
stop before interpreting new events. The small fixtures already pass exact
neutrality and restart; archived-world agreement is still required.

First replay seed 105/on to 10k as a cost-only preflight, then continue that
same instance if it passes. Do not inspect diagnostic results to choose the
worlds or stop. CPU cap for all replay work is 3,600 process seconds (original
batch 1,673.093 seconds); promote the cost preflight only if it uses <=45 CPU
seconds, the simple 80-fold projection fits the total cap, and peak recorded
process RSS is <=1 GiB. These are resource gates, not evidence gates. If the
gate fails, preserve partial data and stop to redesign storage/measurement
cost without chemistry changes. Never discard a zero or expensive world.

At most four simulation workers machine-wide, including validation; prefer
one during preflight and at most three thereafter. Sum process CPU correctly
across independent child processes (or use a single process-wide worker CPU
counter, not both). Check the total cap between 1k chunks; report any <=one-
chunk overshoot. Stream or losslessly gzip each completed world's full record;
preserve partial records on errors. No long horizon or new seeds.

## Read/write and interpretation contract

All reaction rules, states, probabilities, material and physical approximations
are unchanged. Prepared founders are those of section 62. Only observer records
are new. Identities, row classification and event joins never enter reactions.
The existing live `cat` side-buffer dependency remains an audit caveat; this
work does not establish stricter locality or repair it. No solver claim is
being promoted, so no P0 mechanics comparison is earned by diagnostic counts.

The observer measures engine-scanned mature product/open-back pairs, before
binding probability, with actual-corner geometry. It does not enumerate every
possible physical encounter, including pairs omitted by the engine's scan.
Placement failures, random nonformation and geometry failures stay distinct;
do not call a missing formation attempt a failed vacancy test. Binding-disabled
controls retain geometrically eligible contacts with probability zero.

Report per world, with raw numerators and denominators:

1. Armed known-recipient site-steps, free-back site-steps, mature product-unit-
   steps, and unknown row coverage. Row identity ends at lateral edits/fraying;
   freed fragments are unknown until another recorded row is registered.
2. Recipient geometric opportunities per free-back site-step. Separately show
   scanned pairs rejected by geometry and eligible contact probability values.
3. Actual new mature recipient bindings per geometric opportunity, alongside
   formation attempts and vacancy failures. Count event opportunities, not
   independent organisms; repeated contacts are correlated.
4. Fraction of ended recipient binding episodes used by at least one witnessed
   supported lateral link. An episode must begin after 10k and end by 50k;
   report still-open episodes and their observed use separately as censored.
   Report unknown/stale cat signals rather than assigning physical support.
5. Detached exact output with at least one continuously surviving supported
   internal bond on its witnessed intact parent. Show all detached, variant,
   unknown-parent and unsupported births alongside it. For a fixed follow-up,
   use support events at or before 45k and output within 5k; report later events
   as age-censored. This output is physical attribution, not causal necessity.

Retain all producer and unknown categories, not just recipients. No zero
denominator is converted to a zero rate. Site coverage is known armed letter
site-steps / all armed letter site-steps; report how retirement affects it.
Retain states/type inventories, births, all observer events and open episodes.
Record original 5k intact/active follow-up separately from continuous identity;
neither stock generations nor supported output alone proves renewal.

## Fixed diagnostic decision and causal follow-up

The independent unit is the world. Do not fit thresholds to seed 106.
For each of availability (known-recipient site-steps per mature product-unit-
step), encounter rate, binding conversion and episode use, compare the two
previously failed on worlds (106/108) with the two passed on worlds (105/107).
Call a **retrospective bottleneck signature** only if both failed-world rates
are strictly below both passed-world rates. Require >=80% known-site coverage
in every on world; binding conversion also requires >=20 geometric recipient
opportunities per world, and episode use >=20 ended recipient bindings per
world. No pooling can rescue a failing world/denominator. These requirements
prevent interpreting an almost-unobserved category; they are not significance
tests. Report every stage, including multiple signatures or none, unchanged.

A signature identifies a candidate measurement explanation, not the cause of
the old benefit failure. For example, low availability can accompany poor
delivery, and abundant binding can be mechanically unproductive. If coverage,
denominators or ordering fail, state that this archive does not discriminate
the obstruction and park this diagnostic route without retuning or new states.

Only after a measurable bound-use path is established may a separate causal
plan consider removing catalytic acceleration while preserving production and
binding. Such a research-only local compatibility ablation would make docked
letter lateral links use the existing bare rate regardless of the cat flag;
it reads no IDs and conserves all material. Matched preparations must first
verify unchanged binding/geometry behavior and disappearance of catalytic
acceleration. Later trajectories can diverge, so it is not an encounter-matched
counterfactual. No implementation, new ecological run or selected dependency
claim is authorized by this protocol's diagnostic gate alone.

## Evidence and delivery

Write a launch manifest with exact command, parameters, source/plan/input
hashes, frozen criteria and CPU accounting before the first step. Use a fresh
`experiments/scratch/DD_replay_*` stem, refuse overwrites, and archive completed
or stopped evidence in `experiments/out/`. Validate ordered bond reconstruction,
retired identities, physical output witnesses and analysis corruption rejection.
Add a RESULTS section and LEDGER row, rebuild the index, update ROADMAP/handoff,
and commit/push validated work. Preserve negative worlds and any measurement
failure. No additional reward motif, fresh confirmation or frequency race.
