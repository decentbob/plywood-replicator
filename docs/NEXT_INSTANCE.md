# Next-instance handoff — 2026-09-28

Read ROADMAP.md, the sole queue. Q8j / RESULTS91 is complete, archived and
validated. The user requested a stop here for another instance. No simulation
or lab server remains running; check machine-wide workers before starting work.
Core, live lab and historical sources are unchanged.

In-place face pins align all38 saved bath contacts under both body16 and
individual16. The complete final10-frame geometry/access gate passes37/38 body
and0/38 individual. All34 previously rejected free contacts pass under body
motion, but relative kicks leave existing joints and neighboring rail fit faulty:
geometry passes9/38, access1/38, their intersection0. Target-pair overlap stays
within .02; final-window global overlap reaches .198082. One previously accepted
body contact also loses rail fit. Thus local alignment works, while the frozen
mechanical gate fails. No chemistry, rail growth or reproduction was tested.

Prepared moving controls pass4/4 body and0/4 individual. IMPORTANT: the main raw
file's original24 prepared controls accidentally inherited zero kicks from Q8i.
Those records remain preserved. The separately frozen correction reruns only
those controls at sigma=.3/sigmaRot=.45. Use the **controls-file summary**, which
combines unchanged bath results with corrected controls. Both gate summaries fail.
The initial preflight also failed on a stale derived open-side cache; its source
and output are retained, and the corrected preflight passes. See the control note
and RESULTS91; do not interpret stationary controls as moving successes.

The isolated CaptureSim is NOT integrated into live/core chemistry. Park this
variant and the current half-cell acquisition branch: no new bath, solver,
tolerance, horizon or timing-state rescue. The live prototype remains available.
A distinct demonstrated cause could justify a new physical question, not merely
continuing the latest fix. Existing failed Q8 dynamic and acquisition gates stand.

**Next ranked slice: freeze Q7b, not yet planned or executed.** The portfolio
reassessment favors the deferred passive-fold acquisition/rebinding test, using
existing fold0/45 at matched stiffness .8 and ordinary rates/material. Read
RESULTS79–80, passive_escape_plan.md and the Q7b roadmap constraints. Include
relaxed free-row acquisition as co-primary, body4/individual4/individual16 and
fixed seeds/horizon/stop criteria. Q7's prepared geometry lead is not an autonomous
repair result. If the acquisition/release tradeoff fails, park without angle,
stiffness, rate or horizon rescue. A pass only earns the matched eight-block
operation; no population run or new state is admitted.

Evidence: experiments/out/HC_capture_20260928* (13 evidence files plus manifest).
Reproduction uses archived Q8i inputs, with no scratch prerequisite:

```
node experiments/half_cell_capture.js --preflight UNIQUE.preflight.json.gz
node experiments/half_cell_capture.js UNIQUE.json.gz
node experiments/half_cell_capture.js --validate UNIQUE.json.gz
node experiments/half_cell_capture_controls.js UNIQUE.json.gz UNIQUE.controls.json.gz
node experiments/half_cell_capture_report.js UNIQUE.json.gz UNIQUE_FIGURE_STEM
```

Use unique scratch paths. The batch-specific archive script refuses overwrite.
All276 original/corrected observed trajectories match plain and midpoint restart;
all16,836 frames replay, three deliberate corruptions are rejected, and all six
bound-branch controls match historical behavior. Total58,222 physics steps and
549.494 measured CPU seconds, including failed preflight/correction/report/archive,
below750s. Editing, shell/Git, read-only inspection and raster preview are untimed.
No censoring. Actual-corner SVG was rasterized and visually checked; Fontconfig
cache warnings did not prevent rendering. Full core suite/default fingerprints
were not rerun for this isolated assay; historical/core/live bytes are unchanged.
