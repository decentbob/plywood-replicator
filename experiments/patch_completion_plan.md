# Patch formation and completion (prospective, 2026-09-26)

Question: does stronger existing lone-monomer undocking reduce competing patches
while improving exact copying? It cannot detach already linked anchors. No engine
change, new reaction, energy, turnover, or population experiment.

Use section 52's single active PAAAABBBBQ founder, 20x20, 60 A + 60 B +
15 P + 15 Q, complementary recognition, stiffness 0.5, square caps. Compare
square A/B with opposed -20/+20-degree wedges, all other parameters identical.
No offspring can rearm. The pool permits at most 14 exact offspring.

Screen seeds 83/84, pUndock 0.1 (control), 0.3 and 1, 50k steps, four workers.
Primary: exact generation-1 offspring at 20k and 50k. Record every new lateral
bond as nucleation (two isolated units), extension (one linked patch) or merge
(two separate linked patches), and assign nucleation histories to released rows.
Track completed first-nucleation-to-birth times and report unfinished histories
as right-censored. These are correlated events within worlds, not independent
replicates. Sample concurrent unfinished patches every 100 steps; store material
inventories every 5k. A patch means a connected lateral component of >=2 units.

Advance at most one stronger rate only if it increases curved exact output in
both seeds at 50k and does not reduce it in either at 20k, with no inexact births.
If both qualify choose the greater summed curved 50k output, then lower rate.
Confirm on fresh seeds 85-92 with both shapes and the same control, 50k. Do not
pool selected screen seeds with confirmation. Solver controls are required before
promoting a positive shape-dependent conclusion. If no rate qualifies, stop this
direction and document the negative screen; no long run is earned.

Instrumentation must leave saved state, RNG, births and statistics identical to
an uninstrumented run. Fixtures must exercise nucleation, extension, merging,
birth attribution and censoring; datasets must reconcile bond histories, births
and all 150 conserved units. Record hashes of executed sources and full params.

Commands (use a fresh output prefix; existing outputs are refused):

```sh
node experiments/patch_completion_test.js
node experiments/patch_completion.js --out experiments/scratch/PC_screen
node experiments/patch_completion_summary.js experiments/scratch/PC_screen
```
