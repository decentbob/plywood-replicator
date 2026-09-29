# Q8l: does the half-cell copy in an abundant soup?

2026-09-29; baseline after RESULTS 95. Frozen before running. Screen tier, exploratory.

RESULTS 95: with one offspring's inventory, assembly is starved (2–3 face dockings per
50k steps), whichever placement rule is used. Squirm3-style chain copying normally runs
in a soup with spare parts. This asks whether the unchanged live half-cell chemistry
copies when loose parts are abundant.

World (`experiments/half_cell_soup.js`): one founder D (the RESULTS 87/88 geometry,
active) plus K loose inventories (P, A, A, Q, eight W and two E each, plus the founder's
four E), placed randomly without overlap. K=4 in 24x24 (72 blocks); K=8 in 32x32
(128 blocks). Live chemistry and parameters, body motion, 16 passes, and the fast runtime
(bit-identical in tests). Arms: project (unchanged) and pins (Q8j in-place capture).
Seeds 1201–1202; 50,000 steps; 8 worlds.

Observed every 100 steps (read-only `live.observe`): first novel chain, first novel
closed D, first unpaired novel closed D (detachment checked there and at the end), and
chain/closed counts every 1,000 steps. At the end: free-W rings/arcs versus cap-bound W.

Reading, fixed now: a **lead** is any novel closed D that becomes unpaired (a
separated daughter half-cell) in any world; a **partial** is novel chains without
closure. Neither is a reproduction claim; a lead earns a repeated-generation soup run.
QA: the first seed per cell gets plain and midpoint-restart checks. Four workers at most.

```sh
node experiments/half_cell_soup_screen.js all experiments/scratch/HCS_20260929
node experiments/half_cell_soup_screen.js summary experiments/scratch/HCS_20260929
```
