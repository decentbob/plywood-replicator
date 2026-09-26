# Fresh confirmation of recipient dependence

2026-09-26; ROADMAP P1, following RESULTS 61 at commit 71042ca.
This plan is fixed before seeds 105–108 are run. The first two screen worlds
passed: recipient-parent binding contrasts +18/+23, production contrasts
+16/+23. Detached exact output supported the same direction. That result
earned confirmation, not frequency competition or an evolved-complexity claim.

## Unchanged experiment

Use recipient_dependence.js byte-for-byte, four arms on/noBind/noSource/neither,
seeds 105,106,107,108, 50,000 steps, observations every 100 steps and primary
interval (10,000,50,000]. The original recipient_dependence_plan.md specifies
the block-level read/write contract, local signal timing, controls and all
1,000 conserved blocks. No new states, marks, reactions, types, parameters or
observer hooks. Three BAAAAB and three BCDDCB founders; bodyJostle=true,
iters=4, square shapes, no corner snapping. This is the same chemical
dependency test; it does not claim robustness to another motion approximation.

The source ablation retains material and mature binding compatibility while
changing construction contacts/back exposure. Binding ablation retains
construction cost. These are ecological interventions. Same-seed arms match
initial physical state; later conditional RNG consumption can diverge.

Prior viability is established by seeds 101/102 and the completed 103/104
screen under identical sources. Inspect the new 10k progress without selecting
or replacing seeds. Every arm finishes its fixed horizon, including zero runs.
Only invariant failure or compute-budget exhaustion aborts the batch; preserve
partial evidence and do not treat incomplete output as confirmation.

## Decision fixed before outcomes

The independent unit is a world. Do not pool the earlier two positive seeds
into the confirmation decision, and do not treat sampled contacts as replicates.

**Confirmation requires every one of the four fresh seeds to pass:**

1. On-arm recipient-parent births exceed both noBind and noSource by at least
   five in the primary interval (the unchanged screen threshold).
2. On has at least five producer-parent births, including at least one at
   recorded generation >=2, and nonzero sampled recipient mature occupancy.
3. Detached exact recipient-parent output is strictly greater than each of
   noBind and noSource. This was a post-hoc screen diagnostic; it is now an
   additional prospective guard against stock-release artifacts.

Classify the parent snapshot by presence of AA, with missing/one-unit parents
unknown. Report raw counts, both absolute paired differences, occupancy
numerators/denominators, exact/same-length/length errors, detached output,
sampled 5k intact/active follow-up, censoring and final material inventories.
Retain the neither arm, all negative outcomes and all parameters.

If any world fails, report precisely which requirement failed and park this
setting for advancement to frequency competition. No rate changes, extra seeds,
longer horizon or new states to rescue the confirmation. A failure is not proof
of zero benefit in every world. Compare P2 and P4 for the next bounded question.
If all pass, this confirms a reproductive effect at this tested density/rule
setting. It earns a separately planned rare/common competition with conserved
material, not a large or long evolution run. Stock parent snapshots/generations
and 5k sampled integrity remain limited lineage evidence; inherited benefit,
descendant turnover, frequency dependence and novelty are not established here.

## Provenance, validation and cost

Write a launch protocol before simulation: criteria, fresh seed/arm matrix,
commit, timestamp and hashes of this plan, the analyzer and unchanged sources.
At most four simulation workers on the machine, one queue. Expected CPU cost
about 1,600 seconds; stop the known task process if it exceeds 3,600 CPU seconds.
Archive the protocol, raw runs, manifest and reports under RD_dependence_confirm.
Do not overwrite the screen or its sources. New hashed files retain LF bytes.

The existing observer-neutrality, restart, conservation and local signal checks
passed in 61, and their sources remain unchanged. Rerun analysis regression
fixtures and test the confirmation decision at threshold boundaries, with
missing/duplicate worlds, incomplete arms and detached-output failures. The
existing validator checks all completed runs and source hashes; check default
fingerprints before delivery. The long unchanged core tests need not be repeated.
Add RESULTS 62 and a LEDGER row, update ROADMAP, regenerate the index, then
commit and push the validated evidence and disposition.

```sh
node experiments/recipient_confirmation_summary.js --prepare experiments/scratch/RD_dependence_confirm
node experiments/recipient_dependence.js --out experiments/scratch/RD_dependence_confirm --seeds 105,106,107,108 --arms on,noBind,noSource,neither --steps 50000 --workers 4
node experiments/recipient_confirmation_summary.js experiments/out/RD_dependence_confirm
```
