# Q6: can passive support reconnect a broken lateral bond?

2026-09-27; baseline dd38352. Prospective physical-effect screen, frozen before
execution. This is not a population or autonomous repair claim.

## Decision and evidence

The distinct operation is retaining adjacent broken ends for ordinary ligation.
An intact opposite row provides a mechanical bridge; the chemistry has no repair
state or damage detector. Sections 18/29 measured binding and sequestration,
not exact reconnection after damage. Section 33 discussed end joining as a
variation source. This tests preservation of an arrangement, unlike Q5's wrong
incoming-letter rejection or 47's straightening of a folding template.

Prediction: a bound intact support restores the original missing bond more
often than the same initially adjacent material without face bonds, or with
the support also cut. The latter retains face occupancy but removes the bridge.
No-ligation controls distinguish retention from actual reconnection.

Possible inherited use: protecting a useful arrangement from fragmentation
without spending fresh monomers to reconstruct it. The simplest competitor is
letting fragments renew independently. The present primary outcome is only
original-arrangement repair; it does not value length over viable dimers or
establish a reproductive advantage. Later benefit must compare reproducing
descendants per equal material, including dimers, support cost and lost copying
time. Existing complementary binding could acquire support and melting could
free it, but neither is demonstrated here. No population run is earned directly.

## Unchanged local contract

Use ordinary Sim with eight blocks: 4 A + 4 B, no fuel or other material, 24x24.
Two four-block rows are reverse complements. Test ABAB and AABB. All letters
start TPL. Squares, default stiffness and motion; snapCorners=false.
pLigate=0.02, pHyb=0, pMelt=pMeltEnd=pMeltRun=0; pSoft=pCapture=pSpont=
pFray=pUnzip=pBreak=0. No energy, shield, proof, translation, stack or new rules.
Remaining defaults are retained and saved in full.

A block exposes its free lateral side from its own state/bonds. Two compatible
exposed sides can join at pLigate when their actual side geometry permits.
Only an incident bond is changed. Face pins mechanically hold adjacent polygons.
No IDs, original-neighbor memory, length, support identity or completion reader
enters any reaction. All classifications and chosen cuts are setup/observation.
No new state, type, side mark, rule case, force or simulator knob. No relay.

Prepare exact square rows at y=12 and y=11, opposite orientations, with four
face bonds. Verify actual corners/normals and compatibility, then cut the
middle lateral bond of the first row (two dimers remain). No relaxation,
repositioning or intervention during the ordinary steps.

Five arms, identical block types and initial poses:
- bridge: cut first row only, retain four face bonds and intact support;
- split: additionally cut the middle support bond; same face occupancy;
- unbound: cut first row and remove all four face bonds;
- noLigate: bridge with pLigate=0;
- uncut: intact duplex with pLigate=0.02, a stability control.

The double cut is an explicit topology intervention, not equal damage. Report
repair of the support too; either reconnecting can restore the bridge. Its
purpose is to test load-path continuity. Disabling melting/acquisition isolates
retention at the cost of imposing permanent sequestration in bound arms.

## Frozen matrix and gate

Seeds 601/602, both arrangements, all five arms, body4 / individual4 /
individual16 = 60 eight-block worlds, 500 ordinary steps each. Individual4
separates the kick change from the solver change; individual16 checks resolution.
Each seed is a replicate, arrangements are balanced cases, not extra independent
world-level samples. No significance claim from this small screen.

Run setup/one ordinary step for all jobs first: symmetry/conservation, exact
expected prepared bonds and face geometry, END-END compatibility. Abort on
invalidity; no pose search. These preflight steps are extra checks, not outcomes.
Finish the small matrix unless validity or CPU fails. Record zeros and censoring.

Primary: original missing bond restored and present at step 500. First repair
time is secondary; never equate connectivity through the support with repair.
For each seed and physics stratum a lead requires bridge repair in both contexts,
and at most one of two repairs in EACH of split and unbound. All noLigate
worlds must have zero repair, all uncut rows must retain every original bond.
Any failure parks this preparation, without rates, extra seeds or longer runs.

A pass earns a separate fresh-seed acquisition/release plan using ordinary
binding/melting, including no-binding/no-ligation and same-material independent
renewal controls. It does not earn a population batch or new chemistry.

## Observation, cost and evidence

Record initial/mid/final full states, every link/unlink in order, actual broken
edge midpoint gap and normal angle before each bond scan, geometric eligibility,
repair time, support repair, final face occupancy and all other lateral joins.
Classify original intact/repaired, fragmented, cross-row/new-neighbor joins,
face-blocked material and censorship. No births are expected; none means a
physical repair result cannot be called reproductive closure.

For every job compare instrumented/plain final state and RNG and a midpoint
restart (known pinsVersion cache revision excluded). Check conservation and
invariants. Reconstruct the full bond tape independently, recalculate geometry
from raw side vectors, reject corrupted tapes, outcomes and gate summaries.
Preserve source/plan SHA-256 hashes and commands. Core/historical sources stay
byte-identical, so targeted checks suffice; the full physics suite is not due.

One process, no workers; first inspect machine simulation activity. Total CPU
cap 120 seconds, at most 80 for setup/run/neutrality/restart/serialization and
40 reserved for final validation/report. Meter all assay/validation commands;
include failures, do not rerun to erase costs. Shell/Git/docs time is outside.
Use a unique scratch stem; refuse overwrites. Archive full raw evidence and
CPU/validation records in out, then add RESULTS 78, LEDGER and queue disposition.

```sh
node experiments/duplex_repair.js experiments/scratch/DR_20260927.json
node experiments/duplex_repair_test.js experiments/scratch/DR_20260927.json
```
