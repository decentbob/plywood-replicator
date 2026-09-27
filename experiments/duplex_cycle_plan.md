# Q6b: association and release prerequisites for passive repair

2026-09-27; baseline d8d1bbc. Freeze before simulation. Physical-operation
prerequisites, not a full autonomous repair cycle or a population experiment.

## Decision

Section 78 reconnects a prepared broken bond in 12/12 intact-support cases,
including individual kicks, but permanently sequesters all eight faces. Two
separable uncertainties come before waiting for naturally occurring damage:
can ordinary binding acquire a bridge, and can ordinary melting free repaired
material? Sections 18/29 warn that binding can trap material and suppress renewal.

Possible inherited use is preservation of a useful arrangement without fresh
monomers. Repair has no value if the supporting parts cannot return to use.
Independent fragments remain the reproductive competitor; this prerequisite
does not measure their renewal or show that a four-letter order is useful.

## Fixed local contract and preparation

Ordinary Sim, no subclass chemistry, new states, marks, forces, types or knobs.
Eight squares (4 A + 4 B), 24x24, no fuel; two initially TPL four-letter rows,
ABAB or AABB and the reverse complement. Same positions as section 78: centres
(12,12)/(12,11), opposite orientations. This is an optimistic prepared
near-encounter, not unbiased acquisition from a bath. No relaxation or pose search.

Existing rates: pHyb=0.2 (section 29), pLigate=0.02 (78), pMelt=0.1,
pMeltRun=0.001, pMeltEnd=-1 (existing default end/run behaviour). No heat cycles.
pSoft=pCapture=pSpont=pFray=pUnzip=pBreak=0. All other defaults retained,
snapCorners=false. Both comparison arms have identical material and poses.

Two preparations:
- acquire: both rows intact; no prepared face bonds or cuts;
- release: four prepared face bonds; first row's middle lateral bond cut.

Four arms in EACH preparation: on; noBind (pHyb=0); noLigate (pLigate=0);
noMelt (all three melting rates 0). noBind in release still starts with the
four prepared bonds and isolates rebinding; it is not a no-support control.
Section 78's split/unbound controls already isolate support continuity. They
are not replaced by a claim that disabling future binding removes existing pins.

Binding reads exposed complementary faces and local contact geometry; ligation
reads exposed lateral sides and local geometry. Melting reads the block's
incident face/lateral bonds and the side states presented by lateral partners,
then requests unlinking of its own face. The existing lower-ID endpoint guard
deduplicates per-bond melting; it is not organism identity or ancestry. No
observer labels enter dynamics. Preserve the audit's existing side-interface
and numerical-motion caveats. No new relay to validate.

## Matrix, early gate and outcomes

Fresh seeds 603/604; both arrangements; body4 and individual16; two preparations
and four arms = 64 worlds, 5,000 steps each. No additional seeds or rates.
First run the four release/on seed-603 worlds through step 500. Require at
least one supported original-bond repair among the two arrangements in EACH
physics mode, plus invariants/conservation. If this viability gate fails,
archive the four partial records and stop. If it passes, continue those exact
instances and execute the remaining matrix to 5,000. No reset of their RNG.

Acquired bridge: both original rows remain exact; faces on both halves of
the first row contact members of the intact opposite row, continuously for
25 completed steps. Labels classify observed physical support only; they are
not a registration rule. Record any first face contact separately.

Supported repair: the originally cut bond is newly linked while immediately
before that link an intact opposite row has face contacts to BOTH halves.
Retain the ordered link/unlink tape, including support-before-link witnesses.
Unsupported rejoining is a separate result, not repair attributed to support.

Released availability: after acquired bridge (acquire) or supported repair
(release), BOTH original rows are exact, all eight units TPL with no face
bonds, and no additional lateral bonds at their ends, for 25 consecutive
completed steps. Record first qualifying interval and any later rebinding.
This means exposed active material, not demonstrated access by fresh monomers
or successful reproduction. Never count the acquire preparation's initially
unbound interval as release. Do not equate release of a fragment with repair.

For a prerequisite lead, in EVERY seed/physics stratum:
- acquire/on: >=1 of two contexts acquires a sustained bridge AND subsequently
  achieves released availability;
- release/on: >=1 of two contexts achieves supported repair AND subsequently
  released availability;
- acquire/noBind: zero acquired bridges; release/noLigate: zero repair;
- every noMelt world: zero qualifying release after its required event.

All eight on cells (two preparations x seeds x physics) must pass. Contexts
and repeated events are not independent replicates; two seeds remain a lead.
Failure parks this rate/preparation combination. Do not rescue by faster
melting, higher binding, heat, a larger horizon, selected context or new state.
A pass earns a separately frozen natural-damage cycle test under uniform
local damage, with fresh seeds; not a reproductive population test. No damage
is introduced during this prerequisite and no event-triggered intervention is
allowed. Thus even a pass does not establish the complete autonomous cycle.

## Observation, validity, cost and reproduction

Record initial, 500-step pilot where applicable, midpoint and final full states;
ordered edits; each step's exact/active/bridge/free-face flags and occupancy;
actual target-side geometry every 50 bond scans and at the first scan; all
first contacts/bridges/repairs/releases, failures, censored horizons, wrong
neighbor joins, final sequestration and births. Keep the full matrix, including
all noBind/noLigate/noMelt outcomes. Same-seed branches match initial conditions,
not event-by-event RNG after interventions change conditional consumption.

Observed/plain state and RNG neutrality for each completed world, midpoint
restart, fixed parameters/inventory and invariants. Reconstruct midpoint/final
bonds and every per-step topology flag from ordered events. Independently
recalculate event order, sustained intervals, geometry and promotion gate.
Test synthetic acquisition-then-release, premature release, interrupted holds,
unsupported repair and corrupt raw records. Exclude only the known pinsVersion
cache revision in full-state comparisons. Preserve historical source bytes.

One process, no workers. Inspect machine activity first. CPU cap 240 seconds:
160 execution including pilot/neutrality/restart/raw writing; 80 reserved for
fixture checks, final validation/report. Check budget within long jobs and
preserve a partial state on failure. Meter each simulation/QA command; include
failures. Shell/Git/documentation overhead is separate. No full physics-suite
or fingerprint rerun if core remains byte-identical.

```sh
node experiments/duplex_cycle_test.js
node experiments/duplex_cycle.js experiments/scratch/DC_20260927.json
node experiments/duplex_cycle_test.js experiments/scratch/DC_20260927.json
```

Refuse overwrites; hash core, imported helper, plan, runner and validator.
Archive raw evidence and cost/validation records in out. Add RESULTS 79 and
LEDGER, regenerate knob index, and replace the current queue/handoff decision.
