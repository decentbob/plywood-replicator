# Next-instance handoff — 2026-09-27

Read [ROADMAP](../ROADMAP.md), the sole current queue. Q8 is the user's two
independent D-shaped half-cells: each chain is its own straight boundary and
its own curved arc connects the special caps. Copy outward, build a new arc,
release ordinary face bonds; closure may occur after release. More working
sides are allowed. There is no shared old wall to cut.

Q8a geometry (82) and Q8b contacts (83) are complete. Research polygon contacts
preserve access but fail one body4 fixture. Solver-phase replay shows final
pin/shape correction reintroducing A/A overlap; E also overlaps at four passes.
A separately frozen body16 follow-up passes 8/8, as do 8/8 individual16 references
under the added all-pair bound. Use polygon contacts/body16 with individual16
controls for the next isolated assay. Body4 is parked here. The original Q8b
failure is not reclassified. No chemistry, growth or descendants ran.

Evidence: `out/HC_contact_resolution_20260927.manifest.json` maps all 13 archived
artifacts and matching scratch copies. Standalone `half_cell_contact_validate.js`
passes full replay and diagnoses the residuals. The original contact runner's
built-in validation has a preserved initial-cache comparison bug; do not use
that path. Its first t0 serialized-array check failure also survives with source.
`half_cell_resolution.js` validates its own raw. Restore its two fixed scratch
inputs from archived copies if needed; exact instructions are in RESULTS 83.

Next Q8c: separate rim bonds from chain-neighbor chemistry. Cap end signals,
release requirements and rearming must reflect only the inward rail; mechanical
pins, collision and jostling must still include the rim. A rim-attached cap cannot
be docked by snapping it alone as a free monomer. W association should read local
port labels and actual contact geometry; no ancestry checks, completion signals
or timing states. Freeze a small contract and kinetic gate before running.

28,116 physics steps and 28.539 measured CPU seconds this slice, including
failures/QA/archive; small final bookkeeping writes and shell work unmeasured.
Core/historical sources unchanged; no full core suite/fingerprint rerun.

User hypothesis: rays blocked by polymers might make half-cells competitive.
Global pBreak ignores walls; explicit ray exclusion and exposed straight-boundary
geometry matter. After reproduction works, use ray/opacity and equal-material
controls, count damage/descendants/costs, and preserve old wall negatives (25).
No task-owned simulation or agent is active. Q7b remains deferred.
