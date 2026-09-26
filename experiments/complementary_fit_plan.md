# Can complementary shapes remove the linking obstruction? (49)

Written after the section 48 screen, before these outcomes, 2026-09-26.
Permanent wedges failed to copy at bendB 20 and 30 even with a straight brace.
At the BB site, docked monomer lateral edges exceeded the 10-degree link tolerance.
Hypothesis: opposing rest wedges plus existing complementary copying allow a
concave/convex pair of rows to fit where identical wedges cannot.

Use the ordinary Sim, 18 x 18, 60 A + 60 B, one ABBABA founder, no other blocks,
no energy, turnover, substitutions or ligation. Letter stiffness 0.5. Both copying
modes have docking and linking probability 1 for the intended partner. Only the
partner identity changes (`compCopy` false/true). Founder and pool composition
are balanced 3A/3B, so swapping required types does not alter stoichiometric demand.
No product row or catalyst is involved.

Four shapes: square (0,0), B-only (0,20), positive (20,20), opposed (-20,20).
The negative angle is already supported by the rest-shape formula; verify the
actual free and bonded geometry, not just parameter assignment. Screen seeds
21,22, 20k per shape and copying mode. Primary: exact released copies, expected
ABABBA for self-pairing and BABAAB for complementary pairing. Secondary: docks,
founder curvature, occupancy and unjoined adjacent dock geometry sampled every
20 steps using the read-only section 48 observer. Include every non-exact birth.

Select opposed shapes only if complementary copying improves exact output in
both seeds and the effect exceeds the same-seed square mode contrast. Confirm
on fresh seeds 23-30, square/opposed and both copying modes, 20k. Test the reverse
direction from BABAAB founders too: a one-way fit is not a reproductive cycle.
Require solver checks at iters 8 and individual jostling before claiming a robust
physical effect. If the screen fails, record it without searching angles for a
lucky rescue. Geometry-gate samples are dwell-time diagnostics, not independent
trials or measured probabilities of completing a copy.

Even a positive result would establish a physical compatibility condition, not
selection for complexity. No new chemical rule or fitness reward is justified.

Screen decision, before confirmation: opposed shapes give 0/0 exact copies with
self-pairing and 9/9 with complementary pairing; squares give 11/10 and 10/9.
Select opposed and square for seeds 23-30, both ABBABA and BABAAB founders,
both pairing modes, 20k (64 runs). Keep the screen separate. Then use seeds
23-26 for the same complete comparison under individual kicks and under iters 8
(32 runs each). These robustness checks reuse confirmation seeds and are not
additional independent replications. No population expansion before these checks.

Diagnostic extension after CF_local: with individual kicks and four solver
passes, the reverse-direction complement advantage vanishes (mean 4.75 vs
5.25 self copies), and squares show the same -0.5 difference. The source documents
8-24 passes for individual kicks. Before attributing this to a physical noise
effect, run seeds 23,24 at iters 16, both profiles/directions/modes (16 runs),
with all other parameters fixed. This is a post-hoc resolution diagnostic,
not independent confirmation or a reason to discard the four-pass result.

After CF_local16: both directions improve in both seeds (4/4 to 8/9 from
ABBABA, 2/4 to 7/8 from BABAAB). Proceed to a short **viability probe**, not an
evolutionary race: seeds 41,42, 24 x 24, 120 A + 120 B + 40 E, three ABBABA
founders, ordinary fuel reload, pFray 0.00003 and pUnzip 1, pSoft 0, default
body jostling/4 passes, 50k. Cross square/opposed shapes with self/complementary
copying. Retain 10k snapshots and all births; inspect the 20k point and report
late births, maximum generation, sequence/length changes and mass/bond checks.
No complexity or selection claim follows from viability in two seeds. Do not
run longer or add mutations just because a population persists.

Implementation record: the population probe leaves pUndock at its ordinary
default 0, unlike 0.1 in the isolated assay. Monomers can remain docked; density
and founder count also change. Compare the factorial arms within the population
probe; do not attribute a cross-assay difference solely to fuel or offspring.
