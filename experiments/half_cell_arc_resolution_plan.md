# Q8f/P0 follow-up: one solver-resolution comparison

Frozen after HC_arc_20260928 completes and its unchanged-pass diagnosis:
static full-D geometry passes, body16 closed2/2, individual16 closed0/2.
Worst overlap is a directly bonded A/A pair at seed769 t36, not an arc collision.
After solver passes12..16, pin residual falls .15444,.14310,.13306,.12402,.11587
and overlap .06207,.05833,.05484,.05157,.04856. Contact correction omits direct
bonds; their pins/shape matching are still converging. This distinct numerical
cause admits one targeted P0 check, not a shape/chemistry rescue or parameter search.

The original Q8f gate remains failed. Do not modify its source, evidence or plan.
Branch its same eight saved initial states once to iters32, both body and
individual motion, both closed/open controls. Preserve every other parameter,
material, pose, seed, chemistry-off setting and the t40 imposed release; 120
steps. No further resolution, angle, stiffness, size, rate or horizon option.
Existing 16-pass records are the reference. Same initial RNG does not imply
identical later trajectories when numerical geometry changes.

Use precisely the original held/released windows and thresholds. All four
closed worlds must pass to admit ordinary-chemistry testing at this resolved
setting. Report open controls, whole-run maxima and all original negatives.
Even a pass is prepared geometry, not acquisition, autonomous release or
reproduction. If it fails, stop and park this dynamic setting; no third setting.

First5-step invariants/viability; observer/plain and t60 restart in all eight;
replay every frame/state/RNG, recompute summaries and reject corner, label,
bond and aggregate corruption. Explicit iters32 provenance and initial-array
equality to the archived source. Same ArcSim, no code/rule change. One process,
no workers. Combined Q8f plus follow-up measured CPU budget180s; this follow-up
execution60, validation45, remaining reporting/archive15. Store unique outputs,
failures and hashes; include both results in RESULTS87, update queue and commit.

```
node experiments/half_cell_arc_resolution.js experiments/scratch/HC_arc32_20260928.json.gz
node experiments/half_cell_arc_resolution.js --validate experiments/scratch/HC_arc32_20260928.json.gz
```
