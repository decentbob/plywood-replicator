# Walls against fast rays (new exposure plan after RESULTS 101)

2026-09-29. Frozen before running. Screen tier.

RESULTS 101 failed because slow rays linger. One ray starting near the founder hits it
repeatedly through the always-exposed copying face, so walls behind the chain cannot
matter. With fast rays (`mobX` 1, the same Brownian step as a block), each ray passes
through quickly, and a wall blocks the part of its path behind the chain. That partial
protection is what this tests. It is a different physical exposure, not a retune of 101,
which stays negative.

Calibration (bare arm only, before any walled world): with fast rays at `rayHit` .05, the
founder's first hit came at 600–3,000 steps (seeds 1590–1593). `rayHit` .003 (about 16x
less) aims for a first hit around 10–50k, comparable to copying time.

Design as in `ray_walls_plan.md` (2x2 walled/bare x rays on/off, two rays per world, K=4
soup, `pFray` .002, pins, body16, 100,000 steps), but with `mobX` 1, `rayHit` .003/0 and fresh
seeds 1511–1516. The same outcomes and the same reading: benefit only if the walled on/off
chain-step ratio is higher in at least 5/6 seeds and walled/on beats bare/on in at least 5/6.

```sh
RW_MOBX=1 RW_HIT=0.003 RW_SEEDS=1511,1512,1513,1514,1515,1516 node experiments/ray_walls.js all experiments/scratch/RWF_20260929
```
