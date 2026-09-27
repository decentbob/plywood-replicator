# Next-instance handoff — 2026-09-27

Read [ROADMAP](../ROADMAP.md): it is the sole current queue. This slice began
at `dd38352`; find the delivered commit in git log. No task-owned simulation
remains. The previous long roadmap is preserved in the
[Q5 snapshot](archive/ROADMAP-2026-09-27-Q5.md); its next steps are historical.

**New lead: Q6 prepared passive repair (RESULTS 78).** Sixty eight-block worlds,
seeds 601/602, ABAB/AABB, body4/individual4/individual16. An intact face-bound
support restores the original cut bond in 12/12 cases; split-support and
unbound controls give 0/12 each. No-ligation gives 0/12, uncut stability 12/12.
All six fixed seed/physics gates pass. Actual geometry, observer neutrality,
restart, bond reconstruction and four corruption checks pass. No new core rule.

**Critical limit:** all eight bound faces remain occupied, with no births or
detached repaired output. Support, alignment and damage were prepared; melting
and further binding were disabled. This establishes a physical effect only.
Independent dimers remain the simpler reproductive competitor. Two seeds are a
lead, not confirmation; the detailed limits are in RESULTS 78.

**Next slice: Q6b.** Freeze a small fresh-seed acquisition/repair/release plan
using existing local rules. Require usable release and test no-binding and
no-ligation controls; no observer-triggered damage or release logic. Cheap
acquisition/release prerequisites may precede waiting for spontaneous damage.
Only an autonomous useful cycle can earn a benefit comparison against simple
renewal. No population batch, new repair state or rate sweep is queued.

Evidence: [plan](../experiments/duplex_repair_plan.md),
[raw](../experiments/out/DR_20260927.json), accompanying CPU/validation files,
and `DR_20260927.report.json`/`DR_20260927.summary.json`. Archive and scratch
copies match. Measured assay/QA/analysis CPU is 16.121 s; 75,060 total ordinary
steps including validation continuations. No core or historical source/data
bytes changed. No full physics-suite or default fingerprint rerun was needed.

Workflow: `node tools/workspace_status.js` checks archive/scratch inventory;
`--verify-scratch` additionally hashes same-name tracked archive copies. It is
read-only and cannot detect running simulations. Inspect actual process command
lines before launching anything; four workers maximum across the machine.
Preserve raw/failed evidence. All earlier failed gates remain parked.
