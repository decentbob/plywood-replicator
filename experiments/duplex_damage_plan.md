# Q10: do double strands let repair make length pay under damage?

2026-09-28; ROADMAP order 1 (logic-first portfolio choice); baseline `eea70dc`.
Frozen before any run. Screen tier (AGENTS QA tiers): two seeds give a lead at most.

## Decision

Regularity 1: without something that makes length pay, populations shrink. Radiation
(`pBreak`) makes length costly; only the designed shield gene has countered it (33).
RESULTS 78: a bound complementary strand holds broken ends for ordinary ligation.
RESULTS 79/92: a bound support cannot release without a driven cycle. RESULTS 29: heat
cycles (an existing environmental drive) keep length near the no-binding level when
copies bind their parents (`compCopy`), but 29 had no damage and no ligation, so
"whether double strands protect anything" was left open.

This combines existing mechanics only: complementary copying, binding, heat cycles,
ligation and radiation. It asks whether passive double-strand repair makes longer
templates persist under damage. A lead would be a route out of regularity 1 without
a designed length gene; a negative closes this combination. No new state, type or knob.

## Contract and arms

Base, the RESULTS 29 command (`experiments/duplex.sh`): 40x40, 256 A + 256 B, 60 E,
`pReload` .002, `pUnzip` 1, `pUndock` .1, `pFray` .00003, seeds AAABAB,ABBABA x2,
`pSoft` .002, `pCapture` .002, `pSpont` .0002, `compCopy` 1, `snapCorners` 1,
`maxStrain` .5, `heatPeriod` 5000 in every arm (heat acts only on face binding).
Added in every arm: `pLigate` .02 (ends join; also the repair step).

| Arm | `pHyb` | `pLigate` | `pBreak` |
|---|---|---|---|
| ss | 0 | .02 | 0 |
| ds | .2 | .02 | 0 |
| ssRad | 0 | .02 | R |
| dsRad | .2 | .02 | R |
| ssRadNoLig | 0 | 0 | R |
| dsRadNoLig | .2 | 0 | R |

Reactions stay the core's local rules: binding reads complementary exposed faces,
ligation reads exposed lateral ends plus geometry, radiation breaks own lateral bonds,
and heat is a global environmental schedule. No reaction reads observer classifications.

**Calibration of R (ssRad only, fixed before looking at any ds arm):** seed 90,
20,000 steps at pBreak 1e-5, 3e-5 and 1e-4, against ss at seed 90. Choose the lowest R whose
final `meanLen` is at least 15% below ss while births in 10k–20k are >= 20. If none
qualifies, use 1e-4. Calibration worlds are not outcome data.

## Outcomes and gate

Seeds 1 and 2; 150,000 steps; CSV every 10,000 steps; births JSONL. The world is the unit.
Primary: L = mean parent length of births with t in [100k, 150k) (reproducing
templates, not stock), and B = the number of those births. Secondary: CSV
`meanLen`/`maxLen`/`distinct`, breaks, ligations, and newborn length.

**Lead** if in both seeds: (1) dsRad has B >= 20; (2) L(dsRad) - L(ssRad) >= 0.5;
(3) that difference exceeds L(ds) - L(ss) by >= 0.5 (damage-specific);
(4) it exceeds L(dsRadNoLig) - L(ssRadNoLig) by >= 0.5 (requires ligation, i.e. repair).
Anything else is negative for this combination at this R. No R, heat or rate rescue;
a lead earns fresh-seed confirmation at full QA plus a direct repair-event count.

## Execution

Four `run.js` workers at most. The screen does no per-world neutrality: `run.js`
has no reaction-affecting observer. Cost estimate: 12 x 150k plus calibration 4 x 20k.

```sh
node experiments/duplex_damage.js calibrate experiments/scratch/DD10_cal
node experiments/duplex_damage.js screen experiments/scratch/DD10 R
node experiments/duplex_damage.js summary experiments/scratch/DD10
```
