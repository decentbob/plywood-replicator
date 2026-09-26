# Mechanical attachment assay (47)

Written before outcomes, 2026-09-26. One founder ABBABA, 120 letter blocks and one
preassembled six-block product chain in an 18 × 18 world. The chain starts beside
the founder's back in both arms. One arm has all six back/face bonds seeded; the
other has none and pBindP=0. Products do not melt or fray. All blocks are conserved.
This is an imposed initial condition to isolate physical function, not spontaneous
brace assembly or a complete evolutionary cycle.

Both arms have pLinkBare=1, so attachment never raises letter-link probability.
Letter stiffness is 0.5, product stiffness 1. Test foldB=0,15,30. No energy particles:
the founder remains active, but released copies cannot rearm. No substitutions or
turnover. Offspring cannot multiply, so founder copying is isolated.

Screen seeds 1–2, six arms each, 20k steps. Check support stays attached and there
is measurable physical straightening. Primary outcomes: exact founder copies and
time to first exact copy, censored at 20k (report the restricted mean and failures).
Secondary: adjacent founder-face bend angle, face occupation and support occupancy.
Every non-exact birth remains visible. No claim of improved function from
straightening alone. Compare attachment on/off within the same fold and seed;
the straight condition tests whether any gain is specific to folding.

If a folding condition improves exact yield in both seeds and physically straightens,
confirm it and the straight control with fresh seeds 3–10. Also require a control
with bodyJostle=false: attached mass changes body diffusion under the default physics,
so attachment alone does not isolate geometric bracing from mobility. Otherwise
record the screen as negative or inconclusive without promoting it to ecology.

Commands:

```sh
node experiments/mechanical_brace.js --out experiments/out/MB_screen --seeds 1,2 --steps 20000 --workers 4
```

Screen selection: foldB=30 met the prespecified rule (exact yield 7→11 and 7→10,
mean bend approximately 14°→2°). Fold 15 had mixed yield; straight lost one copy
in both seeds. Before fresh outcomes, select folds 0 and 30, seeds 3–10, same 20k
horizon, for both jostling settings. Analyze each batch separately from the screen.
Report paired yield differences and the folding-minus-straight attachment effect;
do not call all attachment effects geometric. First-copy time remains a separate
outcome, not a substitute if the yield result fails.

```sh
node experiments/mechanical_brace.js --out experiments/out/MB_confirm --seeds 3,4,5,6,7,8,9,10 --folds 0,30 --steps 20000 --workers 4
node experiments/mechanical_brace.js --out experiments/out/MB_local --seeds 3,4,5,6,7,8,9,10 --folds 0,30 --steps 20000 --workers 4 --bodyJostle 0
node experiments/mechanical_brace_summary.js experiments/out/MB_confirm experiments/out/MB_local
```
