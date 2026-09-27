# Next-instance handoff — 2026-09-27

Read [ROADMAP](../ROADMAP.md), the sole current queue. This slice began at
`28b08c9`; find the delivered commit in git log. No task-owned simulation or
other agent remains active. Historical failed gates stay failed.

**Q7 geometry admission passes (RESULTS 80).** Existing free-face fold 45 at
stiffness 0.8 turns prepared endpoints out of binding alignment after 3 steps
with solver 4 and 1 step with solver 16. Straight and rigid-fold controls remain
eligible. Final angle 43.81 degrees, gap 0.2464, retained-pin residual 0.0633.
All six four-block fixtures retain their original three bonds and replay exactly.
Binding, melting and random kicks were disabled: this is prepared geometry,
not an autonomous repair cycle. Q6b (79) remains failed.

**Next: Q7b kinetic acquisition/rebinding comparison.** No executable plan is
frozen yet. Preserve the admitted fold 45/stiffness 0.8 contrast; acquisition cost
is co-primary because folding acts before initial contact too. Separate body4,
individual4 and individual16. Faster solver relaxation may change the race
against per-step binding even when final geometry matches. Freeze a bounded
plan before running; no rate/angle/stiffness/horizon/context rescue after failure.
A pass would still need matched-stiffness repair before natural damage or benefit.

Evidence: [plan](../experiments/passive_escape_plan.md),
[raw](../experiments/out/PE_geometry_20260927.json), CPU/validation companions.
Actual-corner reconstruction, 606-sample replay, neutrality/restart, inventory
and bond checks pass; corrupted contact flag rejected. 2,100 ordinary steps
including checks, 1.326 measured CPU seconds. Core/historical bytes unchanged;
full physics suite/default fingerprint reruns skipped.

Use `node tools/workspace_status.js` for read-only archive/scratch checks.
Inspect process command lines before simulation. Preserve raw evidence and
hashed sources; do not execute historical next paragraphs as current assignments.
