# Persistent curvature and the copying bottleneck (48)

Prospective protocol, 2026-09-26. Section 47 used `foldB`, whose preferred bend
vanishes on face docking. Test whether a persistent `bendB` creates an actual
linking obstruction that a straight product row can relieve mechanically.
Use only the existing engine and initial bonds; no new transition or reward.

The conserved pool and founder are as in section 47: 60 A, 60 B, three 1 and
three 2 blocks, 18 x 18, ABBABA plus prepared 122121 support, no fuel, no turnover,
no substitutions. Compare attached and free support with identical initial
geometry. `pLinkBare=1` in both. Letter stiffness 0.5, support stiffness 1.

Screen seeds 11,12, persistent bendB 0,10,20,30, 20k steps each. Measure exact
released copies as primary outcome; all other births remain visible. Observe
every 20 steps: actual founder curvature, face occupancy, and each adjacent
pair of occupied founder faces. For docked letters not yet joined, record
whether the corresponding L/R sides are free and chemically compatible, their
edge midpoint gap, angular mismatch, and the existing geometry gate's result.
Report denominators, split by founder bond index: ABBABA has one BB adjacency.
These are dwell-time samples, not independent attempts or transition rates.
Also retain counts in 5k windows and raw births. Observation must consume no
randomness and must not alter trajectory.

A promising cell must lose copying relative to its straight free control,
gain exact yield with attachment in both seeds, and show a plausible measured
geometric obstruction. Select at most one angle for fresh seeds 13-20 alongside
straight controls. Confirm under both body jostling and individual kicks before
calling the support benefit robust. If no cell passes, record the negative;
do not widen the search indefinitely to find a lucky yield difference.

If a cell passes, require an additional solver-resolution check (iters 8 against
4, same physics within each pair). Permanent wedges affect incoming monomers
as well as the founder, so even a negative brace result may distinguish a
two-sided fit problem from mere founder curvature. A successful prepared brace
would still leave construction, delivery, turnover and inheritance untested.
