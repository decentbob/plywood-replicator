# Product flexibility: independent binding control (46)

Specified before running the batch, 2026-09-26. Section 45d reused historical controls;
this experiment uses fresh seeds 7–10 in the same conserved-block world.

Run 50,000 steps for each of four arms: durable, durableNoBind, soft0, soft0NoBind.
This is a 2 × 2 comparison: product stiffness 1 versus 0.8, mature-product binding
enabled versus disabled (`pBindP=0`). All rest shapes remain straight. No new chemistry.

Primary interval: 20,000 < t <= 50,000. Primary outcome: absolute capped births
whose parent snapshot is a capped non-producer. Compare binding on minus off within
each stiffness, then the difference between those effects. Report every seed and
equal-weight seed means; occupancy samples are not independent replicates.
Also report total capped births, producer-parent births, recipient occupancy,
original-block retention and snapshot copying fidelity. Missing/uncapped parents
remain unknown. Earlier windows are diagnostics, not a replacement primary interval.

Prediction: if flexibility makes delivery useful to recipients, flexible binding
should increase recipient-parent births over its no-binding control, with a larger
effect than rigid binding. More occupancy alone does not confirm this prediction.
Disabling binding removes physical attachment as well as catalysis; this experiment
cannot distinguish these two causes or prove individual-level causal assistance.
Stiffness is fixed by run, so this is not selection on an inherited material trait.

Command:

```sh
node experiments/product_exchange.js --out experiments/out/PF_binding --steps 50000 --seeds 7,8,9,10 --arms durable,durableNoBind,soft0,soft0NoBind --workers 4
node experiments/product_exchange_summary.js experiments/out/PF_binding.csv --after=20000
node experiments/product_parent_summary.js experiments/out/PF_binding.births.jsonl --after=20000
node experiments/flexibility_summary.js experiments/out/PF_binding
```

The last command validates complete windows, reconciles every raw birth against the CSV,
checks that arm parameters differ only in stiffness/binding, and prints paired effects.
While a batch runs, do not compare whole-run totals from `--partial` summaries: different
workers can have different final recorded intervals even within the same seed.
