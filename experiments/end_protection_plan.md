# End protection and trapped intermediates (52)

Prospective, 2026-09-26. Use the existing cap types and capFray parameter only.
First check copying of PAAAABBBBQ: one active founder in 20x20 with 60 A, 60 B,
15 P, 15 Q, no energy/fuel, pFray=0, complementary pairing, stiffness 0.5 for
all four letters, square/opposed20 A/B wedges. Seeds 81,82, 20k. Exact offspring
are PAAAABBBBQ; none can reactivate. This is a copying viability check, not fitness.

Separately prepare three minimal lifetime fixtures, with no spare monomers,
fuel, ligation or spontaneous assembly: (1) a completed inactive PAAAABBBBQ;
(2) an inactive PAAAABBB partial row whose last B remains DOCK face-bound to
the appropriate A of an active PAAAABBBBQ parent; (3) the same partial row and
parent, with that single anchor absent and its last unit REPEL. All other
partial units are REPEL. Seeded states/bonds model a stalled intermediate;
their probability of occurring naturally is not measured by this fixture.

Use pFray=0.00003,pUnzip=1, capFray=0 or 1, both shapes, seeds 81,82, 50k.
Matched capFray arms have identical initial geometry, states, material and RNG.
Attached/detached arms have identical material/positions and differ only at
that one face bond and the corresponding DOCK/REPEL state. The completed
fixture has fewer blocks; do not compare absolute lifetimes across fixtures
as a density-controlled fitness effect.

Primary outcomes: first loss of an original target lateral bond (censored at
50k), original anchor loss, and target material becoming free. Track IDs so
reassembly does not count as continuous survival. Measure final link retention
and all birth logs, but do not count fragment births as copying rescue.
Verify the anchor's chemistry: linked DOCK end cannot undock while the missing
needed lateral side prevents its ordinary release; the other free end is a cap.
If protection preserves stalled rows as well as full ones, stop before a capped
population sweep and explain the local obstruction. Select new experiments
only after this diagnostic, not a new release rule in advance.

Screen decision: capped copying is viable in both seeds/shapes (5/5 square,
3/2 curved), while capFray=0 protects both full and attached-partial fixtures.
All detached partial controls lose an original bond. Do not expand to a capped
population. Replay the four copying runs exactly and inventory naturally grown
unfinished rows at 5k intervals through 20k. For each row, record membership,
sequence, states and face contacts; count ordinary free ends eligible to start
fraying if pFray were positive. A zero count means protected from initiating
end-fraying, not permanent kinetic arrest: free monomers can still complete it.
Require exact equality to the archived copying birth log and 10k statistics.
