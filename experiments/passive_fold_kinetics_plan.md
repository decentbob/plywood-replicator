# Q7b: does the free-face fold beat rebinding without losing acquisition?

2026-09-28; ROADMAP order 1; baseline `66e8263`. Frozen before any kinetic run.
Evidence sought: a kinetic physical-effect lead in prepared small worlds, not
an autonomous repair operation, descendants or inherited benefit.

## Decision

RESULTS 79: prepared repair succeeds, but ordinary rebinding keeps 99% of faces
occupied and usable release fails 0/8; disabling future binding releases 7/8
while removing acquisition. RESULTS 80: with reactions and kicks disabled, the
existing fold (fold 45, stiffness 0.8) turns a freed dimer endpoint 43.8 degrees
out of binding alignment after 3 steps (4 passes) or 1 step (16 passes).
The open question is kinetic: ordinary binding (`pHyb` 0.2 per eligible step)
can act before the fold develops, and the same fold acts on free material
before acquisition. There is no direction-sensitive latch.

This test resolves whether that existing shape change changes the race in the
right direction without destroying acquisition. A pass admits only a separately
frozen matched-stiffness eight-block acquisition/repair/release operation
(ROADMAP order 2). A failure parks the fold candidate: no fold angle, stiffness,
rate, horizon, tolerance, pose or context rescue, and no new repair state.
Relation to inherited function: a support that can both hold and let go could
make repair compatible with reuse; nothing here measures reuse or reproduction.

## Rule and physics contract

Ordinary `Sim.step`; no subclass, new type, state, side mark, reaction case or
knob. The fold reads only the block's own face occupancy and changes its own
preferred polygon (`_restSlot`). Binding reads exposed complementary template
faces and local contact geometry; melting reads the block's own face bond and
the states exposed by its lateral partners (`nh` = bound lateral neighbours).
Observer IDs (row/support, canonical pairs) never enter reactions.

Material: 2 A + 2 B squares, no fuel, 24x24, `seedCount` 0. Two AB dimers
facing antiparallel as in RESULTS 80: row at (12,12) angle 0, support at
(12,11) angle pi; canonical face pairs row[0]-support[1] and row[1]-support[0].

Kinetic parameters, identical in every arm except the fold: `pHyb` 0.2,
`pLigate` 0.02, `pMelt` 0.1, `pMeltRun` 0.001, `pMeltEnd` -1 (existing RESULTS 79
rates); `pSoft=pCapture=pSpont=pFray=pUnzip=pBreak=0`; `stiffA=stiffB=0.8`;
`snapCorners=false`, `maxStrain=0`; default `sigma` 0.3, `sigmaRot` 0.45.
Arms: **straight** `foldA=foldB=0`; **fold45** `foldA=foldB=45`. The rigid45
control is omitted: its stiffness differs and RESULTS 80 already showed it inert.

Physics (P0): **body4** (`bodyJostle` true, 4 passes), **individual4** (false, 4),
**individual16** (false, 16). body4 versus individual4 isolates relative kicks;
individual4 versus individual16 isolates solver resolution.

Preparations (prepared interventions, labelled as such):

- **escape**: the RESULTS 80 fixture. Both lateral bonds and face pair 0 are
  retained; face pair 1 is removed at t=0. All corners start at the actual square
  shape (the pre-loss bound state is square in both arms). The freed block's
  fold then develops under ordinary physics while binding and melting run.
- **acquire**: no face bonds. From the same square facing pose, both arms first
  run a 100-step relaxation with kicks and all reactions set to zero (same
  passes and motion mode), so fold45 dimers take their actual free curled shape
  before contact. The kinetic phase then starts from that relaxed state with the
  kinetic parameters (`Sim.fromState(relaxed, kinetic)`). Resetting free rows to
  squares before contact would hide the acquisition cost, so it is not allowed.

## Comparison fixed before running

Seeds 7301–7316 (16 per cell), fresh for this fixture. 2 preparations x 2 arms
x 3 physics x 16 seeds = **192 worlds**, 1,000 kinetic steps each. The world is
the independent unit; within-world repeated contacts are not replicates. Same
seed across arms matches initial conditions (and RNG state at kinetic start),
not later events.

Per-step observer frame after each completed step: dimers exact (both original
lateral bonds, no other lateral bond), all four blocks `I_TPL`, each canonical
face pair bound, each canonical pair's actual-geometry eligibility (engine
`_geomOK` plus distance band, as in RESULTS 78–80) and occupied face count.
Ordered link/unlink tape.

**Primary acquisition outcome (acquire):** a sustained bridge, i.e. both
canonical faces bound with dimers exact for 25 consecutive completed steps,
starting within the 1,000-step kinetic horizon.

**Primary escape outcome (escape): direct escape.** The first face-bond event
in the tape is the unlinking of the retained face pair (not a new face link),
and the 25 completed steps beginning with that step all have zero face bonds,
dimers exact and all blocks `I_TPL`. A world whose retained face never melts,
or whose window extends beyond the horizon, is censored and counts as failure.

Secondary, not gated: first face link / first full bridge (acquire), any
25-step qualifying release by the horizon and first release step (escape), face
links per world, occupied face-steps, canonical-pair eligibility fractions,
relaxed initial angle/gap/eligibility of both pairs, extra lateral joins, births.

**Gate, separately in each physics mode** (A = sustained bridges /16,
E = direct escapes /16):

1. fixture validity: A_straight >= 8;
2. acquisition retained: A_fold45 >= ceil(A_straight / 2);
3. escape beats rebinding: E_fold45 - E_straight >= 4 and one-sided Fisher
   exact p <= 0.05 (fold45 greater).

**Lead** only if all three pass in all three physics modes. Anything else parks
the fold candidate as above. Report every count, including failing modes.
A lead is 16 fresh seeds in a prepared fixture, not confirmation of a repair
cycle; the eight-block operation is the next test and has its own gate.

Early viability, on the same instances without reset: seed 7301 of all twelve
cells runs to kinetic step 50; require finite geometry, conservation of 2 A +
2 B, `check()` clean and the prepared bond counts at t0. Only an invariant
failure stops the batch (partial evidence kept); outcomes do not.

## Evidence scope

Measured link: a kinetic physical effect (fold versus straight) on acquisition
and immediate release in a prepared four-block pair. Untested: broken-row
repair at stiffness 0.8, bath encounters, natural damage, reuse by copying,
descendants, inheritance. No energy accounting for the prescribed shape switch.

Validity: observed/plain final state and RNG match for every world, midpoint
(kinetic step 500) restart match, excluding only the known `pinsVersion` cache
revision. Independent validator replays every world from its saved kinetic
initial state, reproduces every tape event and frame, recomputes the relaxation
from setup, recomputes outcomes and the gate (including Fisher p), and rejects a
corrupted frame, tape event and summary. Synthetic analysis cases: direct
escape; rebinding first; release interrupted by a new face link; late censored
window; bridge interrupted before 25 steps.

## Execution, cost and reproduction

One simulation process; confirm no other simulation is running. CPU cap 240
seconds: at most 150 for execution (relaxation, viability, observed, plain and
restart runs, raw write) and 90 reserved for validation/report. Include failures.

```sh
node experiments/passive_fold_kinetics.js experiments/scratch/PF_20260928.json
node experiments/passive_fold_kinetics.js --validate experiments/scratch/PF_20260928.json
```

Writers refuse overwrites. Raw record hashes core, `duplex_repair.js` helper,
this plan and the runner. Archive raw, `.cpu.json` and `.validation.json` in
`out`; add RESULTS 92, a LEDGER row, rerun `node tools/ledger_index.js`, update
ROADMAP and the handoff. No core or historical source edits; the full physics
suite and default fingerprints are skipped because core bytes are unchanged.
