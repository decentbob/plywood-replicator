# Q5: can existing geometry reject a wrong docked letter?

2026-09-27; baseline 9fa730d. Freeze before running. This is a prepared
physical-effect assay, not a population test or a claim of evolved proofreading.

## Why this is a new question

Section 49 establishes correct complementary fit with substitutions disabled.
Sections 66/72 test arrangement-dependent fuel renewal, not discrimination of
incorrect docked material. Section 38's proofreading explicitly recognizes a
wrong label; this proposal leaves that rule off. Hypothesis: a wrong wedge
cannot align its lateral side before ordinary, label-blind monomer undocking
removes it, while correctly matched wedges can join. Squares are the simpler
matched competitor. This would be a possible mechanical error filter using no
extra states or rewarded motif, rather than merely restoring correct copying.

The potential inherited function is retention of a useful letter arrangement
through physical error discrimination. Fidelity alone is not benefit: a later
test would need more useful reproducing descendants per equal material than
squares, retaining viable variants and accounting for stalled material. No
such population test is admitted here. Initial docking is deliberately supplied;
natural acquisition would still need demonstration if this prerequisite passes.

## Contract and fixed comparison

Use unchanged Sim only: 8 A + 8 B, no E, 24x24, no seeded random strands;
compCopy=true, pSoft=0.002, pUndock=0.1, pFray=0, energyGate=true,
proof=false, catalysis=false, stiffA=stiffB=0.5, snapCorners=false.
All other defaults retained. Body jostling / 4 passes and individual kicks /
16 passes are separate matched physics strata, not additional seeds.
Shapes: square (0/0), opposed (-20/+20). No tuning these values after outcomes.

Each prepared template is AA, AB, BA or BB. Two incoming letters are either
both complementary, wrong at template site 0 only, or wrong at site 1 only.
Seeds 501 and 502; 4 contexts x 3 incoming conditions x 2 shapes x 2 physics x
2 seeds = 96 small worlds. All worlds conserve the same type inventory. Choose
existing blocks at setup; no type changes. The unused letters occupy a remote
spaced grid. Seed a central template dimer and relax it with 100 zero-kick
physics-only passes before docking; this prepared relaxation is not autonomy.
Then use the ordinary single-block face-alignment/vacancy placement to impose
the two face bonds, including the deliberately incorrect one. No incoming
lateral bond is prepared. Stop the entire assay on a failed placement or
invariant, retain partial evidence, and do not search for a nicer pose.

Run ordinary steps for 200 steps after setup, recording the first of:
(a) incoming pair forms its lateral bond; (b) either imposed face bond breaks;
(c) neither by the horizon (censored). For wrong cases distinguish loss of the
wrong member, loss of its correct neighbor, and incorporation of the wrong
member. A neighbor loss is not successful error rejection. Later events cannot
replace the first-event outcome. Keep all subsequent tape entries and final
state; this experiment does not test released full copies or descendant renewal.

Reactions read existing block state, incident bonds and exposed partner-side
information. Local lateral geometry and uniform undocking are unchanged.
Correct/wrong labels, template indices and outcome classifications exist only
in setup/observation. New types, rules, states, side marks and knobs: zero.
No new relay or strain-dependent break rule. The audit's existing interface
caveats and body-jostling approximation remain. Record actual side-midpoint
gaps, antiparallel-angle errors, compatibility and the engine geometry result
immediately before each ordinary bond scan; no observer affects RNG or arrays.

## Frozen decision and checks

Unit of replication is a seed/world; contexts are balanced prepared cases,
not independent population samples. Report every context and each seed/physics
stratum. Viability: at least 3/4 correct contexts link first in EACH shape and
seed/physics stratum. If any misses, no mechanical-filter lead is earned.
Complete the fixed small matrix to expose context failures, unless CPU or
validity stops it; no extra seed, horizon, tolerance or rate search.

For a lead, in EVERY seed/physics stratum:
- square wrong incorporation must be >=4/8 (positive error-opportunity control);
- opposed wrong incorporation must be <= half the square count;
- opposed correct-link fraction minus wrong-incorporation fraction must exceed
  the square difference by >=0.25;
- the wrong member itself must undock first in >=4/8 opposed wrong cases.

Any failed condition parks this specific geometric-error-filter preparation.
No pooling across seeds/physics or treating censorship/neighbor loss as rejection.
A pass earns only a separately planned autonomous misdocking/usable-output
screen with fresh seeds and variant costs, not a benefit or fidelity claim.

For every world, compare observed dynamics to plain dynamics for the same
200 steps, and a save/restore at 100 followed by 100 more. Compare full saved
state/RNG (excluding the known restored pin-cache revision), invariant checks
and conserved type arrays. Validate ordered bond tapes against final bonds,
first-event labels and independently recalculated geometry; reject corrupted
outcomes/tapes. No full physics suite or default fingerprint run if core bytes
remain unchanged; relevant compatibility, geometry and conservation fixtures
must pass. Preserve all sources and input hashes.

One process, no workers; inspect existing simulation processes before launch.
Total task CPU cap 120 seconds: fixture/neutrality/restart execution stops at
80, leaving 40 for independent final validation. Meter setup, validation and
serialization; aggregate any auxiliary Node process CPU rather than excluding
QA. Check between worlds. Retain partial/failed records on exceptions.

Commands (new files, historical sources untouched):
`node experiments/geometric_error.js experiments/scratch/GE_20260927.json`
then `node experiments/geometric_error_test.js experiments/scratch/GE_20260927.json`.
Refuse existing output paths. Archive validated raw JSON with summary, complete
initial/final states, ordered bond edits, geometry observations, all parameters,
source/plan hashes, command and CPU ledger. Add RESULTS 77 and LEDGER, rebuild
the index and update ROADMAP/handoff. Preserve scratch. No core promotion.
