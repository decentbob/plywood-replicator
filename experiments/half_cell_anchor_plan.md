# Q8m: rim growth only from anchored ends

2026-09-29; follows Q8l (RESULTS 96). Frozen before running. Screen tier, exploratory.

## Why

In the abundant soup (Q8l) nearly all W ends up bound to caps (35–40 of 40 at K=4,
53–65 of 72 at K=8), and some forms free W rings. Loose P/Q caps grow W arcs on their
rim ports before they ever join a chain, so the rim material is used up, and bulky
capped blobs dock poorly. Only one novel chain formed in eight 50k-step worlds.

## Rule (one local condition, no new state or type)

A rim port may bind only if its block is **anchored**: a cap whose own chain port is
bonded (P at R, Q at L), or a W whose other rim port is bonded. A rim bond forms when
at least one of the two contacting blocks is anchored (and all existing conditions
hold). Each block reads only its own ordinary and rim bond occupancy. Arcs then grow
outward from caps already in a chain: free caps no longer collect W, and free W–W pairs
cannot nucleate. Existing rim bonds never break under this rule. The founder's arc is
already anchored. The rule is an isolated subclass (`AnchorLiveSim`), not core.

## Comparison

The same soups, seeds, horizon, observation and QA as Q8l (seeds 1201–1202; K=4 in
24x24, K=8 in 32x32; 50,000 steps; project and pins). Only the anchor rule is new, so
Q8l's eight worlds are the matched ungated controls: 8 new worlds.

Reading, fixed now: a **lead** is any unpaired novel closed D (separated daughter)
under the anchor rule; **partial** is more novel chains than the matched Q8l arms, or
any novel closed D. W must also stay mostly free until caps anchor (report free W over
time). If no novel chain forms, chain assembly itself is the next bottleneck, to be
diagnosed from the tapes before any other rule.

```sh
HC_ARMS=anchorProject,anchorPins node experiments/half_cell_soup_screen.js all experiments/scratch/HCA_20260929
HC_ARMS=anchorProject,anchorPins node experiments/half_cell_soup_screen.js summary experiments/scratch/HCA_20260929
```
