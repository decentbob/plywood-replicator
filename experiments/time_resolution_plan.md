# Q9: is near-encounter acquisition limited by the time step?

2026-09-28; ROADMAP order 1 (P0 numerical check); baseline `d5af3d1`.
Frozen before any run. Evidence sought: a numerical-sensitivity diagnosis,
not a new mechanism, autonomous operation or biological result.

## Decision

Acquisition from prepared near-encounters fails or is weak under individual kicks
in RESULTS 69, 79, 84, 89, 91 and 92. In RESULTS 92 even straight dimers that
start flush and eligible bind a face in only 8/8/7 of 16 worlds and sustain a bridge
in 5/7/7. The default step kicks a free block 0.3 side lengths and 0.45 radians
(26 degrees) per step, while binding tolerates a .35 gap and 30/40-degree normals
and fires with `pHyb` .2 per eligible step. One step can therefore cross the whole
acceptance window. Earlier P0 checks varied solver passes and body/individual kicks,
never the time step. If acquisition depends strongly on it, several parked failures
may partly be discretization artifacts; if not, that explanation is closed.

Result that changes the next decision (fixed now):

- more acquisition at finer steps: freeze one separate re-screen of a parked
  prepared acquisition fixture (RESULTS 79 acquire/on) at the finer step versus
  default. Nothing is reopened automatically; old gates stay failed;
- less acquisition at finer steps: the default step overstates acquisition; record
  a regularity, parked failures stand;
- converged: record that time-step refinement does not explain the failures; the
  portfolio moves to a different alternative;
- intermediate: report only; no reopening.

## Contract

No code or rule change. Existing knobs are rescaled by the standard stochastic
refinement: Brownian kicks `sigma` and `sigmaRot` by sqrt(dt), per-step
probabilities by p -> 1 - (1 - p)^dt (`pHyb` .2, `pLigate` .02, `pMelt` .1,
`pMeltRun` .001; `pMeltEnd` -1 keeps pMeltRun). Horizon and hold window are fixed
in physical time: 1,000 and 25 time units, or 1000/dt and 25/dt steps.
Not rescaled: shape stiffness per pass, pin/contact projection and derive passes
per step. These are projections, not rates, so finer steps apply them more often
per unit time. That is part of what is tested, not a claim that the solver is a
time-consistent integrator. The block fixture and chemistry are otherwise those of
RESULTS 92's straight arm (fold 0, `stiffA=stiffB` .8, `snapCorners` false,
`maxStrain` 0).

dt in {1, 1/4, 1/16}; physics body4, individual4, individual16 (passes per step
unchanged). Preparations: **acquire** (flush facing AB dimers, no face bonds,
after the RESULTS 92 zero-kick 100-step relaxation) and **escape** (RESULTS 80/92
fixture: one face pair removed at t=0). Kinetic phase: `Sim.fromState(prepared,
scaled)`. Seeds 7301–7332: 7301–7316 at dt=1 must reproduce the archived RESULTS
92 straight records exactly (a replication check); 7317–7332 are fresh. Same seed
across dt matches initial state only. 3 dt x 3 physics x 2 preparations x 32
seeds = **576 worlds**. The world is the unit.

## Outcomes and interpretation rule

Primary (acquire): sustained bridge, meaning both canonical faces bound with dimers
exact for 25 consecutive time units, starting within the horizon. Secondary: any
face link, first link time, direct escape (escape; the RESULTS 92 definition in
physical time), qualifying release, face occupancy fraction and pair eligibility
fraction, all in physical time.

For each physics mode, with B(dt) = sustained bridges /32:

- **sensitive**: |B(1/16) - B(1)| >= 8 and two-sided Fisher p <= .05;
- **converged at default**: |B(1/4) - B(1)| <= 3 and |B(1/16) - B(1)| <= 3;
- **intermediate** otherwise.

The cross-cutting verdict is set by the individual modes, where the parked failures
occurred. It is **sensitive** if either individual mode is sensitive (direction
from the sign), and **converged** if both are converged. Anything else is
intermediate. body4 is reported, not decisive. Direct escape is secondary: it
qualifies RESULTS 92's escape comparison and adds no gate.

## Validity and cost

Early viability on the same instances: seed 7301 of every cell to 50 time units,
with invariants, conservation of 2 A + 2 B and a clean `check()`. Only an invariant
failure stops the batch. For every world: observed/plain final state and RNG match,
plus a restart from the midpoint (500 time units), excluding `pinsVersion`. The dt=1
seeds 7301–7316 must match archived RESULTS 92 tapes and frames exactly.

A separate validator replays every world from its saved kinetic state and
recomputes the frames, tape, outcomes, verdicts and Fisher p. It rejects a
corrupted frame, tape event and summary, and runs synthetic scaled-window cases.

At most three simulation processes (one per physics mode), below the four-worker
cap; confirm nothing else is running. CPU cap 900 s: 600 for runs, 300 reserved
for validation and report. Raw is written gzipped, compact frames (flags + 64 x
occupied faces). Writers refuse overwrites.

```sh
node experiments/time_resolution.js body4 experiments/scratch/TR_20260928_body4.json.gz
node experiments/time_resolution.js individual4 experiments/scratch/TR_20260928_individual4.json.gz
node experiments/time_resolution.js individual16 experiments/scratch/TR_20260928_individual16.json.gz
node experiments/time_resolution_validate.js experiments/scratch/TR_20260928
```

Archive raw, CPU and validation records in `out`; RESULTS 93, LEDGER row, ledger
index, ROADMAP and handoff. Core bytes unchanged: full suite/fingerprints skipped.
This is a numerical check of one prepared fixture. It does not show that any
parked branch now works, and it does not establish a converged physics standard.
