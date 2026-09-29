# Walls in a shadowing damage field: larger confirmation

2026-09-29. Frozen before running. Follows RESULTS 103: favourable 4/6 on both criteria, below
that screen's 5/6 rule. Same code, configuration, calibration (`pField` 1e-5, range 5) and 2x2
design as `field_walls_plan.md`, with **12 fresh seeds 1531–1542**, 100,000 steps; 48 worlds.
RESULTS 103 is not pooled into this test.

**Pre-specified tests (paired by seed, ties excluded, one-sided exact sign tests):**
1. Net benefit: walled/on chain-steps > bare/on, p <= .05.
2. Protection: the walled on/off chain-step ratio > bare's, p <= .05.

Confirmation needs both. Secondary: early founder death (chain-steps below 5,000 with the field on),
distinct chains, field breaks. A failure means the benefit is at most small at this exposure and
material level; record it, with no retuning.

```sh
FW_SEEDS=1531,1532,1533,1534,1535,1536,1537,1538,1539,1540,1541,1542 node experiments/field_walls.js all experiments/scratch/FWC_20260929
```
