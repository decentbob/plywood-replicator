# Q8j moving-control correction — 2026-09-28

Recorded after the first complete outcome and before corrected controls run.
The bath gate already fails:37/38 pins contacts pass under body16,0/38 under
individual16. It remains failed. No threshold, horizon, shape or solver change.

QA found the four prepared-control phase states retain sigma=0/sigmaRot=0 from
Q8i. Q8j's plan also says preserve saved parameters but explicitly specifies
sigma=.3/sigmaRot=.45 for its physics comparison. The latter values were not
applied to those controls. Preserve all24 stationary controls, raw/source and
validation. Their motion-mode labels describe the algorithm selected, not actual
random kicks; do not cite them as individual-motion successes.

Use a separate runner to repeat only the four prepared phases x three arms x
two motion modes with sigma=.3/sigmaRot=.45. All other saved parameters, states,
geometry, material and RNG remain fixed. Same60 passes, final10 gates, plain and
midpoint restart comparisons and complete frame replay. Combine these corrected
controls with the228 unchanged bath records for the corrected252-record summary.
Keep both summaries. No new bath, candidate adjustment or reinterpretation of
the already-failed bath gate is admitted. This is a harness correction, not a
mechanism rescue. Charge all extra CPU/steps to the original750s budget.
