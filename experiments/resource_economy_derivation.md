# Resource economy: a contact-table candidate with an unresolved turnover advantage

2026-09-26, RESULTS 63. This is offline mathematics and contact-graph accounting,
not a new simulator, a physical assay, or evidence of evolved complexity.
The [pre-enumeration plan](resource_economy_plan.md) fixes the scope.

## Source and translation

Schulman & Winfree, [Simple Evolution of Complex Crystal Species (2011)](https://www.dna.caltech.edu/Papers/simple-ca-evolution2011-LNCS.pdf),
figures 2, 3 and 6, supplies candidate 670873 and its encoding. The diagrams were
inspected locally after web rendering failed. The source uses square interior
tiles, staggered double-width boundary tiles, orientation-specific contacts and
cooperative retention. Its growth model and population simulations do not give
this project's conserved-pool polygon dynamics or autonomous local fragmentation.
Accessed 2026-09-26. The following enumeration, contact budgets and cut analysis
are our own; no source illustrations are redistributed.

The identifier decodes to `1010 0011 1100 1001 10 01`. For the four binary input
pairs 00,01,10,11, this gives `f1=!y`, `f2=x`, `f3=!x`, `f4=XNOR(x,y)`;
boundary maps are `f5=!y`, `f6=y`. Here n is the number of interior rows, and
w=n+2 is the geometric width in square-tile units. Rectangles are one conserved
block each but have twice the area. Block counts and area are not interchangeable.

## Twelve fixed types, no mutable program

Symbols below name immutable port labels. D/U denote the two interior port
arrangements, not directions read from world coordinates. The four label
families H_D, H_U, V_D, V_U remain distinct even when their bit is the same.
Mating ports require complementary polarity and matching label. A rotated
block rotates its own ports; a global orientation lock is not proposed.

| Type | Two input values | Output right, output vertical |
|---|---|---|
| D00 | 0,0 | 1,0 |
| D01 | 0,1 | 0,0 |
| D10 | 1,0 | 1,1 |
| D11 | 1,1 | 0,1 |
| U00 | 0,0 | 1,1 |
| U01 | 0,1 | 1,0 |
| U10 | 1,0 | 0,0 |
| U11 | 1,1 | 0,1 |
| B0 | inward left 0 | inward right 1 |
| B1 | inward left 1 | inward right 0 |
| T0 | inward left 0 | inward right 0 |
| T1 | inward left 1 | inward right 1 |

D: west H_U(x), north V_D(y), east H_D(!y), south V_D(x).
U: west H_D(x), south V_U(y), east H_U(!x), north V_U(XNOR(x,y)).
B's two inward ports connect V_D to V_U; T connects V_U to V_D.
Each boundary rectangle also has left/right end contacts, one generic family
for B and a separate one for T. Thus every part has four active ports;
rectangles need two separately bondable segments on the same long face.
These are candidate geometries, not measured deformations or validated shapes.

Candidate operations: form one compatible contact at a time; a block may request
loss of one incident bond, using only its own bond count. Retention is weaker
with one contact and stronger with multiple contacts. New mutable states: zero;
relayed marks: zero; special reaction cases per width or pattern: zero. A future
assay would still need association, weak/strong loss, shape and motion parameters.
No numerical values are selected here. Two-contact retention must arise after
sequential binding; it cannot forbid the one-contact intermediate. Bond count
alone does not guarantee correct registration, rigidity or accessible motion.

Both interior input/output maps are bijective, as are the boundary maps, so
reverse contact constraints select one predecessor in an ideal ribbon. A block
never reads the sweep, width, parity, pattern phase or a fragment classification.
Those concepts exist only in this analysis. The offline code has no simulator
imports and must never become an interpreter inside reaction logic.

## Enumeration and an independent check

Represent a boundary by n horizontal bits and one carry bit. A full down/up
sweep updates these bits and records exactly 2n interior and two boundary parts.
An independent calculation appends their parity complement to make an odd-parity
word of length w. The full sweep rotates this extended word. Thus every state
is periodic, periods divide w, and a cycle cannot omit both occurrences of the
value 1 at the boundary indefinitely. The code checks the sweep against this
algebra at every state, not only against its own period outputs.

| n | Boundary states | Cycles | Longest repeat, columns | Minimum T1 per column | Cycles without T1 or B1 |
|---|---:|---:|---:|---:|---:|
| 1 | 4 | 2 | 6 | 1/6 | 0 |
| 2 | 8 | 2 | 8 | 1/8 | 0 |
| 3 | 16 | 4 | 10 | 1/10 | 0 |
| 4 | 32 | 6 | 12 | 1/12 | 0 |
| 5 | 64 | 10 | 14 | 1/14 | 0 |
| 6 | 128 | 16 | 16 | 1/16 | 0 |
| 7 | 256 | 30 | 18 | 1/18 | 0 |
| 8 | 512 | 52 | 20 | 1/20 | 0 |

All 1,020 states, 122 cycles; no transients. Making T0 or B0 scarce fails at
every odd n: an all-ones fixed cycle omits that type. T1 is the fixed scarce
type for the comparisons below; B1 is symmetric. This examines ideal ribbons
only: rotated, off-register, malformed, width-changing and zero-interior-row
assemblies are not covered. No claim excludes every simpler physical competitor.

## What is an independently renewing unit?

A full repeat uses one T1 at each n in the minimum-use cycle. Calling the whole
repeat an offspring therefore saves **no scarce block per offspring**. Likewise,
lengthening a chain with one obligatory scarce cap lowers its scarce fraction
but still costs one cap per new chain. Mechanical or kinetic benefits would need
separate evidence.

A two-column growth increment uses 2(n+1) blocks, but is not a valid renewal
unit under the proposed retention criterion. Keeping its overhanging boundary
part leaves that part with degree one. Dropping it leaves a stable graph but
no two-contact growth site on either end. A three-column strip with its two
fully contained boundary parts instead has 3n+2 blocks, minimum degree two,
and one two-contact growth site at each end. This is a topological criterion,
not proof of mechanical stability or useful growth rate.

In coordinates used only by the observer, bottom rectangles cover columns
(0,1), (2,3), ... and top rectangles (1,2), (3,4), ... . The three-column strip
0..2 holds B(0,1) and T(1,2). On the right, B(2,3) can contact both B(0,1) and
the bottom interior at column 2; the resulting ledge admits successive interior
parts. On the left, T(-1,0) has the analogous two contacts, and the inverse
tables support leftward extension. Each addition still requires its first
contact to survive until its second forms. The graph test checks these exposed
sites independently of the sweep code.

Grow by three columns, then separate columns 0..2 from 3..5. Returning the
straddling B(2,3) requires breaking its four incident contacts. Also break the
n horizontal interior contacts and the one direct top-boundary contact between
the fragments: n+5 bond losses. Every retained part has at least two remaining
contacts, including during a sequential removal of these bonds. This provides
an individual-bond path, not a rule choosing those bonds or proof that it is
common. Generic stochastic losses could instead dissolve tips, cut elsewhere,
reattach, or sequester the released boundary part. An observer may count a cut;
the reaction must never target a three-column boundary or classify the outcome.

| Interior rows n | Blocks in retained strip | Internal contacts | Added blocks per 3 columns | Formed contacts | Bond losses for separation | Gross T1 per 3 columns (cycle average) |
|---|---:|---:|---:|---:|---:|---:|
| 1 | 5 | 6 | 6 | 12 | 6 | 1/2 |
| 2 | 8 | 11 | 9 | 18 | 7 | 3/8 |
| 3 | 11 | 16 | 12 | 24 | 8 | 3/10 |

One boundary block is returned per separation, so gross-minus-returned equals
the retained inventory exactly. Formed-minus-broken contacts equal the added
strip's internal contacts. These counts assume the ideal path succeeds; they
are lower bookkeeping costs, not measured costs per successful physical child.
The smaller scarce demand trades against more parts, more contacts and a longer
cut. No width-dependent shear or selective fragmentation is supplied.

## Recycling changes the claimed economy

Repeat each pattern to a length divisible by three and enumerate all three
possible alignments of three-column cuts. For n=1, two alignments retain one
T1 per two strips; the third returns every T1. For n=2, every alignment retains
two T1 per eight strips; for n=3, two per ten strips. Thus net retained T1 per
strip is **0 or 1/2, 1/4, 1/5**, respectively. These are exact counts of ideal
partitions, not phase frequencies generated by physics. Returning all scarce
parts in the narrow pattern removes a blanket claim of monotonic savings in
scarce parts trapped per child. It does not enable growth with zero scarce
inventory: T1 is still needed transiently and every complete growth cycle uses it.

A uniformly sampled cut alignment would average retained T1 to 1/3, 1/4, 1/5.
Uniformity is an untested assumption; different shapes and bond histories may
bias cuts. The same rules that free T1 must also recycle ordinary material.
No dissolution or recovery time, incomplete return, or fragment survival rate
has been measured. Infinite turnover does not follow from crediting returned
blocks once. There is no creation, conversion or replenishment in the budget.

For a finite-stock check, give each of the eleven common types C blocks and
T1 four blocks, unchanged across n. The archived report retains each type's
demand, used stock and remainder. Fitting whole repeat count vectors with no
recycling gives:

| Common stock per type C | Total blocks | n=1 repeat capacity / columns | n=2 | n=3 |
|---|---:|---:|---:|---:|
| 12 | 136 | 4 / 24 | 3 / 24 | 1 / 10 |
| 48 | 532 | 4 / 24 | 4 / 32 | 4 / 40 |

These are packing bounds, not constructed populations or births. They include
all invested material: any prepared founder must be charged to the same stock,
including its actual end geometry, rather than added for free. The first row
already prevents inferring a universal wider-is-better yield. The second shows
the conditional gross economy when common parts are plentiful. The no-recycling
bound represents trapping; the partition counts are an optimistic full-return
bound. Neither supplies a turnover rate or a competitive reproductive benefit.

## Decision

The fixed table passes a conditional gross-material trade-off and the examined
T1-free periodic-competitor check. It has a contact-graph route to growth and
two viable-front fragments, improving on a bare rare-fraction argument. The
combined physical/renewal gate remains **incomplete**: actual deformable port
geometry, single-contact intermediates, uncontrolled breakage and material
return have not been tested. No inherited advantage or width evolution follows.

Do not implement a lattice or a table interpreter, add core states, or run a
large crystal population. A reopening P2 test must measure generic contact
growth, naturally released active fragments and returned/trapped T1 together
in conserved polygon fixtures, including the narrow recycling competitor.
Prepared cuts would only calibrate the bookkeeping. They cannot demonstrate
the requisite autonomous operation. At this portfolio checkpoint, P4 uses
existing simple rules and tests a closer evidence gap at lower mechanism cost;
make that the next main assay while retaining this candidate and its limits.
