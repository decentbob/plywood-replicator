# Integrated polymer caps: revised cell candidate

2026-09-27, following the user's clarification. **Working sides are not limited
to four.** That is an implementation detail of today's core, not a design
constraint. The separate-J preference in `BLOCK_ARCHITECTURES.md` was too strongly
based on that detail. That byte-hashed historical brief and RESULTS 81 remain
unchanged; this memo supersedes their architectural preference. No experiment
or new chemistry is claimed here. ROADMAP is the current queue.

## The small candidate

Keep ordinary A/B copying tiles. Give an integrated cap enough polygon edges
for an inward rail connection, a copying contact, two rim connections and fuel
access. These are five functional ports; the actual polygon can have additional
inert edges to provide clearance. Extra ports remove a connectivity restriction,
but their positions and mating orientations still have to fit physically.

Use two complementary cap variants, C_L and C_R, with the rail attachment on
opposite local sides. They are a reasonable way to encode end polarity, as with
existing P/Q. Left/right describe the drawn pose; runtime reads immutable port
labels, not world directions. Antiparallel copying rotates the complementary
cap, so check the resulting rim orientation as well as the rail orientation.
Two types are a design choice, not a proof that a rotatable single type cannot
work. They prevent specified unwanted bond matches; they do not by themselves
prevent steric obstruction or premature rim closure.

```text
           W—W—W—W
         /         \
       C_L—A—B—C_R
         \         /
           W—W—W—W
```

Connectivity sketch only: no validated polygon outline or division sequence.
W is an ordinary rim segment with two compatible end ports. It may be possible
to use the cap variants themselves as rim material, giving a smaller alphabet;
then their extra rail/copy ports remain present along the rim and may nucleate
unwanted structures. Do not silently disable those sites using an observer's
classification of which cap is a strip endpoint. A separate W type avoids that
particular ambiguity and remains an option, not a mandated extra type.

The core will need additional-side support for this candidate. Scope that work
to an isolated polygon assay first and preserve default behavior. Neither four
ports nor eight corners is a user-imposed upper bound. No engine-wide rewrite
or extra chemical state is justified merely by choosing a new block outline.

## Growth can be simple; specify which kind

At a free rim end, a nearby compatible free block binds and exposes its other
end. That is ordinary local end growth using conserved bath material. Fixed
curvature can turn the growing rim away from the copying region; growth is not
guaranteed to close around the right contents.

A closed two-port rim has no free ends. A third attachment to a saturated rim
block makes a branch, not a longer perimeter. Continuing to enlarge such a rim
requires opening a bond and sequential attachment/reclosure, or a distinct
growth topology. There must be no primitive that inserts a new block into an
occupied bond or shifts the whole rim to make room. Existing flush edge pins
also do not provide a stretchable gap automatically.

After strip copying, two strips attached to one rim still form one connected
assembly. A candidate division pathway must give each strip its own wall
continuation and separate them through incident-bond changes. The prior audit's
fixed-membership cut/rejoin bound describes one topology only; it neither proves
that a growing-rim route is complicated nor supplies that route. A small rule
set may suffice. A retained common wall, open fragments and inaccessible copies
must remain possible recorded outcomes rather than being repaired by setup.

## Try geometry before adding a timing mechanism

First place the rim ports and initial rim segments outward of the cap's copying
contact. Test copying access with rim binding available throughout. Growth may
be harmless in that layout, eliminating the need to delay it.

If cap-local recruitment obstructs copying, a minimal candidate gate is:

```
accept a new rim contact only if my rail port is bonded
and my copying port is unoccupied
```

This reads only the cap's own bonds, changes only eligibility for an incident
contact, adds no mutable state and retains existing rim bonds. It prevents an
unattached cap from starting rim recruitment and suppresses recruitment at the
cap while its copying face is occupied. It is a hypothesis to test, not a
guarantee of useful timing: the rail bond can exist before the rest of a strip
assembles; a free copying face can mean detachment or failure, not completion;
an already formed rim can still block incoming material.

Crucially, this gate does **not** stop a distant W tip growing. Doing that would
need a signal propagated through previous-pass side buffers, with propagation
and withdrawal checked, or another genuinely local physical cause. No relay is
admitted now. A cap must never read “the chain has finished replicating.”
More ports and simple side-dependent behavior are allowed; a whole-cell schedule
hidden in many local states is still contrary to intent.

## First physical question

Specify a pair of complementary integrated caps with their immediate rail,
rim and fuel neighbors. A ten-block prepared fixture (two caps, two rail tiles,
four rim stubs, two fuel blocks) can expose simultaneous-contact crowding.
Freeze polygon coordinates and all port assignments before outcomes. Check both
complementary orientations, actual corners, collision-free approach and release,
and the true copying placement of neighboring ordinary tiles. Compare with the
same cap shapes/inventory but rim bonds absent. It is a prepared geometry test,
not a dividing cell; rates, seeds and horizon are not frozen in this memo.

Then test ordinary end growth with copying in the same small world, initially
without a timing gate. Add the gate only if a measured local conflict warrants
the comparison; keep the ungated control. Use accepted body motion for exploration
and individual kicks/solver controls for promising mechanics. Keep material
inventory matched, and do not turn shape changes into selected-position memory.

Before a cell-cycle batch, specify a literal local pathway for wall growth,
reclosure and separation, with exposed copying/fuel access and replenishment
from conserved free material. Test whether both resulting assemblies repeat it.
That is the proposed simple cell's reproductive closure; useful retention and
inherited variation follow as separate questions. The open-frame alternative
remains available if a complete rim adds cost without useful function.
