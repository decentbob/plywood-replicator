# Two half-cells joined temporarily by their copying faces

2026-09-27, corrected after the user's drawing clarification. This is the current
Q8 candidate. The previous version of this memo mistakenly put both curved arcs
on one chain. The user means two separate D-shaped assemblies, each with its own
chain as the straight boundary and its own polymer arc. A prepared cap-geometry
assay and targeted contact comparison are complete (RESULTS 82–83). An isolated
rim interface and passive end-binding rule are implemented (84): prepared
release works, but the near-contact recruitment screen fails. Automatic polymer
capture and prepared joint alignment have since been tested (85–86). Complete
prepared D shapes now exist (87); their static fit passes, while the dynamic
gate still fails after one resolution check. Autonomous curved-arc growth and
complete half-cell reproduction remain unimplemented.
ROADMAP controls execution.

## Topology and sequence

Start with one prepared half-cell: ordinary chain blocks form the straight edge;
special caps form its two corners; ordinary rim polymers form its curved edge.
Its copying faces point outward, away from its own curved arc. Copying recruits
another chain on that exposed side, including complementary cap blocks.

```text
                W—W—W
              /       \
             P—A—B—A—Q       original straight boundary
             : : : : :       temporary copying contacts
             Q—A—B—A—P       newly assembled straight boundary
              \       /
                W—W—W
```

W denotes rim material. Solid strokes show within-assembly connections; colons
show the temporary face bonds. P/Q identify complementary cap types, not global
left/right. The lower caps are rotated relative to the upper ones. The sketch
is connectivity, not a validated polygon packing or an animation of outcomes.

The second curved arc grows from free conserved rim blocks on the far side of
the new chain. It may close while copying contacts remain or after ordinary
chain release. Breaking those temporary contacts should leave two independent
D-shaped assemblies. Each can in principle repeat the same outward copying
operation. Exact semicircular shape is optional; the essential feature is a
separate curved boundary attached to each straight chain.

**There is no shared old rim to split.** The parent's closed arc need not enlarge
or open to produce this offspring. The daughter constructs its own arc from bath
material. RESULTS 81's fixed-membership single-cycle cut/rejoin accounting does
not test this pathway and is not an admission gate for it. It remains valid
historical accounting for the different topology that was actually enumerated.

## Blocks and local actions

- A/B: retain ordinary chain copying, lateral joining and local release rules.
- P/Q variants: each carries one inward chain port, one rim-attachment port,
  a complementary copying port and, if required, a fuel port. Each cap connects
  to one curved arc, not both upper and lower arcs. Extra polygon sides remain
  allowed for geometry; four is not a user-imposed limit. Cap complementarity
  and actual rotated geometry must place each arc opposite its copying face.
- W: two end ports for local end growth and closure by compatible ends meeting.
  Start with one rim type with complementary end labels; fixed curvature or
  flexibility is a proposed mechanical property, not a ring-completion rule.

Association reads immutable contacting port labels and actual geometry. Each
block can change its own state or request an incident bond change. Runtime must
not label caps or W blocks by parent, half-cell, correct position or ancestry.
No primitive inserts a block into an occupied bond, creates material, schedules
a division, or commands an entire arc to move. A closed daughter boundary emerges
only if growing ends meet and bind under the same local rules.

## Why timing need not be the first mechanism

Both arcs should lie behind their respective chain copying faces. In that
layout concurrent arc growth might leave chain assembly and release accessible.
Begin without the previously suggested copy-face-occupancy gate. Closing after
release is explicitly allowed, so no completion signal or synchronized closure
is required by the architecture. A separated chain without its arc is an
unfinished descendant, not a completed half-cell or an automatic failure.

If a specific contact conflict occurs, compare a minimal local gate only against
that measured conflict. Do not preemptively add a relay or cap clock. Ordinary
release is a proposed reuse of existing chemistry, not yet evidence that attached
arcs preserve it. Accidental polymer bridges between the two sides would prevent
separation and must be counted rather than forbidden by an ancestry check.

## Next small test

**Q8a completed:** see `experiments/half_cell_geometry_plan.md` and RESULTS 82.
The measured fixture uses chamfered caps, one rim stub per cap and actual square
rail/fuel neighbors. Prepared geometry passes under body4/individual16, with a
failed individual4 sensitivity check. No ordinary copying or arc growth ran.
Forced release exposes overlap in the core contact approximation, including
ordinary A/A collisions. Q8b's polygon-contact comparison retains a four-pass
failure; its separately frozen body16 follow-up passes, as do the individual16
references, including fuel overlap checks (83). Use those resolved research
settings for the next small chemistry test. The fixture's unused lateral
slot carries a rim pin only while chemistry is disabled; a real rim interface
must remain distinct from the chain-neighbor ports.

The tested Q8c interface keeps ordinary chain bonds and rim bonds logically
separate. Its tests confirm rim occupancy does not change a cap's advertised chain end, substitute
for its inward rail bond, satisfy ordinary release requirements, or keep a cap
armed after its rail is lost. Conversely, mechanical pinning, collision checks
and body jostling must include rim attachments. A cap attached to a rim is not
a free monomer that can be snapped alone onto a copying face. Check both these
chemical and mechanical views; hiding a rim bond during chemistry alone is
insufficient. W end compatibility should use fixed local port labels and actual
contact geometry, with no ancestry or half-cell identity test. No new timing
state is justified by the contact result.

Q8c implements P+, Q-, W-minus/plus end labels with a separate reciprocal
`rimBond` table. W cannot join ordinary letter chemistry. A temporary union
supplies all pins and body motion to the existing solver; it is removed before
reactions run. A rim-attached cap can only bind in its current pose, while a
completely free ordinary monomer can use ordinary docking projection with a
polygon vacancy check. No new chemical state or completion mark is added.

All eight prepared chain-end fixtures release normally while retaining rims.
None of eight near/on worlds recruits W in 300 steps. No post-motion contact
meets the nearly flush endpoint criterion; initial prepared contact is lost
on the first kick. The on/off paths are identical, so this is not evidence
of polymer growth occurring at an inconvenient copying stage. The proposed
free-block docking comparison was superseded by the user's correction below.
Fresh worlds also expose transient overlap despite the previous prepared
contact checks; actual acquisition needs geometry measured at the binding phase.

**W should bind automatically like ordinary polymers (user, 2026-09-28).**
Q8d's `HalfCellPolymerSim` reuses the existing membrane end-corner contact
criterion and `pMem=.2` association probability. Complementary tips meet;
the added edge pins provide alignment. Neither copying progress nor fuel is
consulted. W stays constitutively sticky; membrane raw/active ecology is not
imported. No new states, tolerance knobs or docking projection are added.
Both cap roles bind in angled functional tests, and a cap-bound W accepts
another W on its free end in both directions. Those tests use `pMem=1` to
verify the operation, without stepping physics or claiming autonomous growth.

The original sparse motion screen remains negative at the normal rate:
one eligible encounter in 2,400 binding phases, no new bonds in eight worlds.
That single attempt misses at probability .2. All eight prepared release
controls still pass. This distinguishes implementing automatic association
from observing enough physical encounters to assess growth. Keep the simple
polymer rule; next check angled-contact relaxation and usable free-end geometry
with actual membrane controls, before a larger bath or curved arc test.

Q8e completes that prepared check (RESULTS86): 16/16 W cap/extension cases
and 8/8 native-M controls have good final alignment and room for the next
conserved block; 0/24 unbound controls maintain the candidate edge alignment.
Both body and individual kicks were tested at 16 solver passes. The new
bonds were prepared at eligible angled contacts, not acquired from a bath.
Temporary overlap still reaches .223063 in an individual-kick Q extension;
the illustrated actual frames include that failure of all-time exclusion.
Q8f answers the static geometry question (RESULTS87). Eight identical convex
W trapezoids, each turning 29.141 degrees, close an exterior arc behind P-A-A-Q.
Their two radial contact edges match the existing cap rim edge exactly; the
other sides are inert. The arc sweeps 233.130 degrees, giving a bulging D rather
than an exact semicircle. A 180-degree rotated duplicate faces the original
chain with its own arc on the far side. All actual-corner static overlap,
copying, cap fuel-probe and outward-translation checks pass. These dimensions
are prepared design choices, not a chain-length reader or block type conversion.

The [actual full-D frames](../experiments/out/HC_arc32_20260928.svg) show seed761.
Both halves separate in every tested world after imposed face removal, but
the dynamic gate fails: closed body16 2/2, individual16 0/2. Neutral replay
locates the largest overlap at a directly bonded ordinary A/A joint still
converging after16 constraint passes. A separately frozen32 comparison improves
closed results to3/4, yet seed769 still exceeds the held overlap bound
(.021333 > .02); all four closed released windows pass. The original and
follow-up remain negative. Park the dynamic setting and audit this narrow
contact/constraint discrepancy; no further resolution or threshold rescue.
No additional activation, fuel or timing state is indicated.

The completed paired-end fixture includes each cap's immediate ordinary chain
neighbor, one rim stub and fuel access. It checks both P/Q orientations,
actual-corner overlap, copying access and prepared release, against the same
inventory with rim stubs unbound. The old four-stub/two-cap preparation
represented the mistaken two-rim-ports-per-cap design and is superseded.

Only after a justified mechanical prerequisite passes, prepare one complete
D-shaped seed plus conserved free material and test
ordinary chain copying together with new-arc growth. Measure detached complete
chains, partial/closed arcs, persistent cross-links, rearming and descendants
that repeat both operations. Do not require rim closure before release. A
bare-chain equal-material control distinguishes an added boundary from a copying
improvement. Prepared seed construction is not autonomous acquisition.

Static cap/arc clearance and one compatible arc shape are established. Open
uncertainties are dynamic exclusion, spontaneous tip encounter and closure, monomer/fuel access,
and whether whole half-cells renew rather than only their chains. For these next
tests, no rate, seed, horizon or success gate is frozen yet. Use a proportional plan before simulation,
accepted body jostling for exploration, and targeted individual-kick/solver checks.

## Energy supply is an open design choice

2026-09-28 user clarification: physical fuel particles are not a requirement;
consider alternatives if fuel becomes a bottleneck. Q8c's failed W recruitment
is not evidence of fuel limitation: rim association does not read charge, and
the phase replay found no eligible rim encounters. Its partial rearming also
is not a controlled energy-limitation test. Keep those questions separate.

Start with the existing `energyGate=false` diagnostic when investigating repeat
copying: after the ordinary release state, a rail-connected unit rearms without
an E contact. This is already a block-local core option, not a new mechanism.
Keep the same material, including E, in the paired control so fuel obstruction
is not removed at the same time as the charge requirement. This represents
externally maintained activation; it is not autonomous energy harvesting or
an energetic-efficiency result. Do not enable it silently in a frozen assay.

Two simple candidate mechanisms, neither implemented here:

| Candidate | Local action and cost | Question it isolates |
|---|---|---|
| Ambient stochastic recharge | An existing released state becomes armed with a fixed per-step probability supplied by the environment. Reads own state and existing rail occupancy; no age, copy-completion or enclosure reader, and no new internal state. Energy comes from an explicitly imposed drive, analogous in role to environmental E recharge. | Can the assembly repeat its operation when recharge has a finite waiting time but no particle-transport requirement? |
| Fuel on an exposed edge | A released unit accepts a charged E on a free exposed port, spends that E and rearms. For example the currently free copying face could accept E only while released; alternatively a new polygon edge can carry this contact. Keep ordinary letter compatibility distinct. | Does the current inward K-port location obstruct fuel access, rather than the polymer architecture inherently preventing feeding? |

If useful later, charge could also pass across incident polymer/chain bonds,
but that is a larger mechanism: a donor must spend its charge and any relayed
availability advances through previous-pass buffers, one bond per derive pass.
The existing motif-based `feed` rule rearms neighbors without spending a donor
charge; it is not already this generic transport mechanism. Do not add a
rewarded motif merely to make the half-cell work.

Before choosing a replacement, compare fully rearmed, detached assemblies that
copy again, not just the fraction of armed blocks. A radiation test would need
separate charging and damaging environmental interactions: if polymers block
the charging input too, its cost must be counted. None of these candidates
justifies an enclosure bonus, bulk recharge, or exempting rim construction from
equal-material comparisons. ROADMAP keeps W acquisition first; energy is a
conditional diagnostic/design branch when repeated copying is tested.

## Radiation as a possible benefit

The user proposes that protective polymers could repay their costs under stronger
radiation. Treat this as a physical hypothesis. The current global `pBreak`
hazard cannot be blocked by a wall; existing X particles interact physically with
M and can be excluded. A future W must explicitly obstruct those particles via
contacts, without an observer granting protection to a recognized half-cell.
The straight chain remains exposed from its copying side, so a curved wall may
provide only partial shielding. Local cap fuel access in Q8a also does not prove
that a closed half-cell can acquire/recycle enough fuel or monomers.

After reproductive closure, compare matched material and physics under rays on/off
and polymer opacity on/off, measuring damage, usable descendants and sequestration.
This would be a designed environmental pressure, not evidence of open-ended
complexity by itself. RESULTS 25 demonstrated prepared shielding but walled-world
extinction; the new outward-copying topology must earn its own benefit result.
