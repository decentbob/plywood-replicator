# Two half-cells joined temporarily by their copying faces

2026-09-27, corrected after the user's drawing clarification. This is the current
Q8 candidate. The previous version of this memo mistakenly put both curved arcs
on one chain. The user means two separate D-shaped assemblies, each with its own
chain as the straight boundary and its own polymer arc. A prepared cap-geometry
assay is now complete (RESULTS 82); growth chemistry remains unimplemented.
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
ordinary A/A collisions. ROADMAP requires a targeted contact comparison before
using release/contact outcomes to assess chemistry. The fixture's unused lateral
slot carries a rim pin only while chemistry is disabled; a real rim interface
must remain distinct from the chain-neighbor ports.

The completed paired-end fixture includes each cap's immediate ordinary chain
neighbor, one rim stub and fuel access. It checks both P/Q orientations,
actual-corner overlap, copying access and prepared release, against the same
inventory with rim stubs unbound. The old four-stub/two-cap preparation
represented the mistaken two-rim-ports-per-cap design and is superseded.

Then prepare one complete D-shaped seed plus conserved free material and test
ordinary chain copying together with new-arc growth. Measure detached complete
chains, partial/closed arcs, persistent cross-links, rearming and descendants
that repeat both operations. Do not require rim closure before release. A
bare-chain equal-material control distinguishes an added boundary from a copying
improvement. Prepared seed construction is not autonomous acquisition.

Open uncertainties are concrete: cap/arc clearance, arc length and curvature
compatible with the chain span, tip encounter and closure, monomer/fuel access,
and whether whole half-cells renew rather than only their chains. For these next
tests, no rate, seed, horizon or success gate is frozen yet. Use a proportional plan before simulation,
accepted body jostling for exploration, and targeted individual-kick/solver checks.

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
