# Persistent curvature, fuel capture and complete rearming (50)

Prospective protocol, 2026-09-26, following 49. Existing opposed A/B wedges can
copy with complementary pairing. Test whether that persistent geometry also
supports the existing two-contact fuel reaction. No new rule or reward.

First isolate acquisition. One eight-unit, initially REPEL strand in a 12x12
world, all letter material in that strand, 40 U particles, no E, no free letters,
no turnover, substitutions, ligation or spontaneous links. Fuel size 0.5 or 1.2,
reload 0.002, ordinary grip probabilities, letter stiffness 0.5. Three balanced
sequences: AAAABBBB, AABBAABB, ABABABAB. All are their own reverse complements.
Shapes: square; bendA=-20/bendB=20 (the copying lead); -40/+40 (stronger curvature,
whose copying viability is not yet known). Use compCopy=true throughout.

Screen seeds 51,52, 50k, all 36 cells. Primary outcomes: number of the eight
letters actually rearmed, which indices/types receive fuel, and time to complete
rearming censored at 50k. Record every arming and its held fuel, first fuel use,
and ordinary geometry/occupancy samples in 10k windows. There is no state reset,
no forced binding, and no removal/replacement of fuel during a run. An armed
unit may help grip fuel for another through existing rules. More occupation
alone is not function, and rearming a subset is not complete strand recovery.

Same-seed square controls must run. Choose at most one curved sequence/size/
angle if it increases the number rearmed over square in both seeds, without
reducing complete rearming, or achieves complete rearming in both while square
fails. If only partial recovery occurs, characterize that limitation rather
than immediately starting an ecology. Confirm a selected lead on seeds 53-60
and a higher solver resolution. Establish copying at the selected angle with
ordinary monomers before coupling fuel acquisition to reproduction.

A grip-disabled control (pGrip=0, same fuel/mass) must yield no rearming;
observation must preserve the exact trajectory and random stream. Every fuel
consumption must correspond to one actual letter rearming. All blocks and seeded
lateral bonds must be conserved. Report undefined event/geometry denominators.

Only after acquisition and copying pass should the same shape's contribution
to reproduction be tested against square and grip-disabled controls. Avoid a
large race: sections 39/41 already show that fuel harvest can fail to increase
births when material, rather than energy, is limiting.

Screen selection before fresh outcomes: select AAAABBBB, opposed20, size 1.2.
It rearms 4/3 units versus 0/0 square, all B, with no full recovery. The 40-degree
conditions can acquire more fuel but have not established copying; prefer the
already supported 20-degree material. Confirm 8 fresh seeds (53-60), square/
opposed20 at 50k, then 4 of these seeds at iters 8. Include a full-length grip-off
control in seeds 53,54. This confirms partial capture, not autonomous recovery.

Independent follow-up hypothesis: another strand may provide the missing second
contact for outward-facing A backs. Screen seeds 61,62 with 1/2/4 AAAABBBB rows
in the same 12x12 world and the same 40 size-1.2 fuel particles; square/opposed20,
50k. More rows change letter density and encounters: do not call a benefit
cooperation from totals alone. Record each actual arming's holder-row identities,
per-row complete recovery, and same-row/cross-row A/B events. Those identities
are observation only. Square rows at the same row count are required controls.
Only a confirmed full-recovery lead earns coupling to copying; partial results
must remain visible even if a different outcome is attractive.

Collective screen decision: four rows fully recover 2/3 curved rows per seed,
versus 3/2 square; totals are nearly equal. All curved A armings in multi-row
screens use cross-row fuel contacts. Confirm four-row recovery on seeds 63-70,
square/opposed20, 50k; then seeds 63-66 at iters 8. This tests a shared-contact
route, not curvature superiority. No shape race is warranted.

Before a bootstrap probe, verify AAAABBBB copying directly: seeds 71,72, one
armed founder, 60 A + 60 B in 18x18, no fuel, no turnover, pUndock 0.1, compCopy,
square/opposed20, 20k. Only founder copying is possible.

If collective recovery and direct copying hold, test inactive founders in the
same 18x18 world with the same 60 A + 60 B, adding 40 size-1.2 fuel particles.
Seed 1 or 4 inactive AAAABBBB rows, no E, pFray 0, pSoft 0, pUndock 0.1. Cross
square/opposed20 and pGrip 0/0.2, seeds 71,72, 50k. All material is conserved;
more founders consume more of the fixed free-letter pool. Record actual births,
generations, exact founder-family births versus fragments, energy consumed and
remaining free material. A result is initial bootstrap, not steady persistence
or selection. Do not infer faster per-founder reproduction from unnormalized
totals at different founder counts.

Bootstrap screen decision: both four-row curved runs make one exact eight-letter
offspring by 50k, square makes four/zero; all one-row and grip-off runs make zero.
No generation-2 birth yet. Confirm the startup route on fresh seeds 73-76, four
founders, both shapes and grip states, extending to 100k to allow the observed
slow onset. Primary outcomes are exact family births and generation-2-or-later
births by 100k; report each seed and its 50k outcome too. Do not pool the selected
screen or label a difference in four seeds selection for shape.
