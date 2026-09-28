# Research priorities — 2026-09-28

**Goal:** useful inherited organization, eventually cumulative complexity, from
simple fixed local rules acting on conserved physical parts. More mechanisms,
more births or longer strings are not by themselves progress toward that goal.

This file is the **only current queue**. Read the regularities in
[LEDGER](experiments/LEDGER.md) and the [intent audit](docs/RESEARCH_AUDIT.md).
The detailed Q7/Q8 briefs this queue replaced are preserved in the
[Q8 roadmap snapshot](docs/archive/ROADMAP-2026-09-28-Q8.md); older ones are in the
[Q5 snapshot](docs/archive/ROADMAP-2026-09-27-Q5.md). Do not execute historical
assignments from either. The [handoff](docs/NEXT_INSTANCE.md) is a status pointer.

## Current evidence

**Q7b fails its frozen gate (RESULTS 92); the passive repair branch is parked.**
With ordinary binding/melting, fold45 dimers escape directly (the retained face
melts before the freed one rebinds, then 25 free steps) in 11/9/12 of 16 worlds
against straight 5/4/4 (body4/individual4/individual16). But they sustain a full
bridge from relaxed free shapes in only 0/2/0 against 5/7/7. Binding one face
straightens only that block; its neighbour stays turned away, as RESULTS 80
predicted. An own-face shape rule with no memory cannot tell a lost bond from one
not yet formed, so it lowers sequestration by lowering binding. This is the
passive mechanical form of the RESULTS 79 tradeoff. Everything in the project that
holds and then releases (copy separation, rearming) uses a driven, state-changing
cycle. A repair-specific driven state would be a new state program and is not earned.

**Q8 half-cells remain parked (RESULTS 82–91).** Prepared geometry, chemistry
integration and W growth work; bath acquisition, placement and in-place capture
fail, especially under individual kicks. The isolated live lab
(`node tools/half_cell_server.js`) is available and unchanged.

**A cross-cutting observation motivates Q9.** Acquisition from prepared
near-encounters fails or is weak under individual kicks in RESULTS 69, 79, 84, 89,
91 and 92. In 92, straight dimers that start flush and eligible bind a face in only
8/8/7 of 16 worlds. A default step kicks a free block 0.3 side lengths and 26
degrees, as large as the whole binding tolerance window, and `pHyb` acts once per
step. Earlier P0 checks varied solver passes and body versus individual kicks,
never the time step.

## Queue

| Order | Work | Gate and reason |
|---|---|---|
| Always | P0: local reaction contract and targeted mechanics | Keep body jostling for exploration; compare relevant effects with individual kicks and solver controls. No prerequisite physics rewrite. |
| 1 | Q9: time-step resolution of near-encounter acquisition ([plan](experiments/time_resolution_plan.md)) | Existing knobs only: kicks x sqrt(dt), per-step probabilities 1-(1-p)^dt, physical-time horizon and hold; dt 1, 1/4, 1/16; RESULTS 92 straight dimer fixture; body4/individual4/individual16; 32 seeds. Frozen sensitive/converged/intermediate rule and the decision each triggers. Diagnostic only: it reopens nothing automatically. |
| 2, depends on Q9 | Either one frozen re-screen of RESULTS 79 acquire/on at a finer step (only if Q9 is sensitive toward more acquisition), or a portfolio choice among the parked alternatives below | If converged, time-step refinement does not explain acquisition failures and the next slice must be a different causal question, not another fixture in a parked branch. Candidates with the most prior foothold: P1 recipient function (62) and P3 useful mechanical operation (66). |

**Standing user preferences carried from Q8.** Radiation protection is the
hypothesised benefit of an enclosing wall, to test only after a wall reproduces,
against equal-material bare competitors. Physical E particles are not required:
for a demonstrated rearming bottleneck, first try `energyGate=false`, then the
ambient/edge-capture options recorded in [docs/POLYMER_CAPS.md](docs/POLYMER_CAPS.md).
Block sides are not limited to four. No simulation or lab server is running.

## Parked portfolio: evidence and reopening conditions

These are alternatives, not a backlog to run in the order of their IDs.
All section numbers refer to [RESULTS](experiments/RESULTS.md).

| Item | Disposition | What could reopen it |
|---|---|---|
| Q7/Q7b passive fold | Prepared fold turns a freed endpoint away (80); kinetic race improves direct escape but destroys bridge completion in every mode (92). | Nothing within passive own-face shape rules: a switch that cannot distinguish a just-lost bond from an unformed one trades acquisition for release. No angle/stiffness/rate/horizon rescue. |
| Q8 half-cell acquisition/capture | Bath acquisition fails (89); placement cause is identified (90); in-place capture gate fails, especially individual-motion access (91). Live prototype remains exploratory and unchanged. | A distinct demonstrated mechanical/numerical cause with a bounded test preserving exclusion and existing joints; no longer bath, arbitrary solver/tolerance sweep or state program. |
| Q6b acquisition/release | 0/16 on successes; all eight cells fail (79). Prepared repair persists but enabled rebinding sequesters material; the passive-fold escape also fails (92). | A driven (fuel-coupled) release that already exists for another reason, or Q9 showing acquisition is time-step limited, would justify one frozen re-screen. No new repair state, rate/heat/horizon rescue. |
| Q5 geometric error rejection | Failed selective wrong-member removal in every stratum (77); AA favors wrong joining | Distinct causal evidence, not favored contexts, angle/undocking tuning or proofreading. |
| Q4 causal-contrast comparison | Neither efficacy ablation nor pairing-mode renewal earned a run (76) | A physical operation with a same-material benefit prediction against simple renewal; Q6 is a distinct hypothesis, not a rescue of those contrasts. |
| Q3 delivery replay | All 16 trajectories reproduce; coverage/denominators fail (75) | Independent causal evidence, not threshold repair, extra seeds or automatic efficacy ablation. |
| Q2 support-partner audit | One renewing reciprocal pair, none above reference; sparse alternatives (73) | New evidence distinguishing partner-specific benefit from contact opportunity. |
| Q1 five-letter arrangement | One of two worlds misses the benefit/shape gate (72) | Different causal evidence, not retuning or more seeds. Square dimers remain the simpler competitor. |
| Q0 portfolio/census | Complete (71); short-family renewal nominated Q1 | No automatic repeated census or unchanged portfolio review. |
| P2 resource-efficient assembly | Contact accounting retained (63); prepared geometry passes (68), acquisition fails (69) | A distinct acquisition mechanism/cause, not tolerance, loss-rate or solver sweeps. Narrow recycling defeats a general per-child material-saving claim. |
| P3 curved mechanical renewal | Exact descendants through generation three; arrangement benefit fails (66) | A useful operation beyond uptake/fit, with inherited net payoff. Q6 tests a different operation using squares. |
| P4 random chemistry heredity | Pairs 55/57 fail heredity controls (64–65) | Evidence-backed discriminator; no unguided table search or recurrence-as-heredity claim. |
| P1 shared-product ecology | Positive average effect; only 2/4 fresh worlds pass (62) | A distinct recipient-function mechanism separated from producer supply; no frequency competition yet. |
| C1 contact handoff | Four cycles, no useful completion at original obstruction (70) | Distinct useful role, not additional endpoint states or repeated return. |
| P5 coupled modes | Two copying modes alone failed (40) | Measured material/function exchange and renewal of participating parts. |
| Compartments/droplets | Retention, exchange and renewal unresolved | A small autonomous useful cycle versus no wall. |
| New motif genes, constructor/interpreter, long searches | Designed rewards or cost without current evidence | Specific calibration need or a minimal useful operation; long runs need an earned lead or rare-event reason. |

## P0 and execution discipline

- Reactions read own state/bonds and exposed bonded-side information, and change
  own state or an incident bond. No ancestry, component, length or completion
  predicates. Relays advance one bond per derive pass, not per simulation step.
- Body jostling is accepted numerical motion, not strictly independent motion.
  Compare matched controls under individual kicks; separate solver resolution
  from kick changes. Use actual corner geometry, not only the selected rest shape.
- Keep one main experimental question active. The four-worker maximum covers
  every runner on the machine; it is not an instruction to launch four agents.
  Check process command lines; a scratch file or idle task does not prove activity.
- Use the [plan template](experiments/PLAN_TEMPLATE.md), fixed controls and gates,
  fresh seeds for earned confirmation, and an early viability look. Ordinary
  population screens use 50k–150k steps; prepared mechanical tests can be shorter.
- CPU caps include setup, failed attempts, observer/restart checks, validation,
  analysis and serialization. Reserve final QA before spending the run budget.
  Q3's 3,621.031 measured seconds exceeded its 3,600 cap; retain that deviation.
- Preserve zeros, censoring, raw evidence, hashes and historical source bytes.
  No overwrite, bulk scratch deletion or file moves that break provenance.
  `node tools/workspace_status.js` gives a read-only startup inventory;
  `--verify-scratch` checks same-name archive copies without deleting anything.
- Report the achieved evidence-ladder level. After three assays in a direction
  without advancing it, compare alternatives and park or justify the branch.
  Do not repeat an unchanged portfolio review instead of asking a causal question.
- Update this current queue and replace the brief handoff after each slice;
  record detailed history in RESULTS/LEDGER, not in another growing queue.
  Commit validated work; standing approval permits pushing main.
