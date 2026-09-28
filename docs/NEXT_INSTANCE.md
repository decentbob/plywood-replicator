# Next-instance handoff — 2026-09-28

Read ROADMAP.md, the sole queue. Q8 is the user's two independent D-shaped
half-cells: a chain forms each straight boundary, its own arc connects its
caps, and ordinary copying-face release separates them. Closure after release
is allowed. Extra polygon sides are allowed. No complete cell has reproduced.

User correction implemented in Q8d (RESULTS 85): W should bind automatically
like other polymers. HalfCellPolymerSim reuses native membrane end-corner
geometry and pMem=.2, with fixed complementary rim labels and no fuel/copy
state gate, new states or projection. It inherits the separate rim interface
and mechanical union from Q8c; core and historical sources remain unchanged.
Functional cap attachment and extension of cap-bound W in both directions pass.
Twenty-four geometry decisions match the actual native-M branch. Those tests
use pMem=1 and no physics steps; they do not establish angled relaxation.

The same sparse motion screen still recruits 0/8. Only one eligible encounter
occurs in 2,400 on binding phases, at t6 seed703/body16/P, and its stochastic
attempt fails. Seven on/off paths match; the eighth diverges at t7 after the
extra RNG draw. Prepared release remains 8/8, and all 16 prepared/off final
states and RNG match archived Q8c. Transient overlap up to .235433 remains;
final-window geometry is not all-time exclusion or a sealed wall.

Next Q8e is not frozen: short prepared angled cap/W and W/W capture followed
by pin relaxation, with native membrane and binding-off controls, both motion
modes, actual overlap/pins/free-end access. Keep automatic polymer chemistry;
retire the sparse preparation. No longer run, fuel/timing gate or projection
rescue. The previously proposed free-W docking comparison is superseded by the
user correction and was never run. Curved arcs and bath growth remain later.

User also permits alternative fuel mechanisms. The cap memo records existing
energyGate=false as a same-material diagnostic, plus unimplemented ambient
recharge/exposed-edge E capture. No energy setting changed in Q8d; missing rim
contacts do not implicate fuel. Explicit external drive is not harvesting.

Evidence: experiments/out/HC_polymer_20260928.manifest.json, v2 raw/validation,
extension tests and failed initial harness/source. Missing size in a native-M
test adapter was fixed before any simulation step. No mechanism/gate retuning.
24 neutrality/restart checks, 6,424 frame replays, four corruption checks pass.
22,400 physics steps, 28.199 measured CPU seconds including failure/archive;
one read-only inspection, shell/editing/Git and final bookkeeping unmeasured.
Input is archived HC_rim_20260928.json.gz; no scratch prerequisite. Use unique
rerun stems. Full core suite/default fingerprints not rerun (core hashes fixed).
No task simulation or agent is active. Q7 remains deferred.
