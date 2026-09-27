# A small alphabet for replicators beyond a chain

2026-09-27. Design proposals prompted by the user's Squirm3 recollection.
**None of the new architectures below has been simulated.** The accompanying
[audit plan](../experiments/junction_topology_plan.md) checks port counts and
rim topology only. [ROADMAP](../ROADMAP.md) controls implementation order.

## The useful change: give connections different jobs

More letter types with the same ports mostly give longer or more varied strings.
A junction, a bend and a reversible attachment allow a different organization:
a strip with appendages, a frame carrying a strip, or several independently
renewing parts held together. The additional organization must eventually do
something that pays for the extra material. A cell-like outline is not enough.

The core already permits polygons with up to eight corners, but **only four
working sides**, F/R/K/L, each holding one bond. Octagons still have four active
ports. Ordinary lateral chains cannot branch; optional stacks and membranes
already make other contact graphs. A new shape is not automatically a new port.

## A concrete starter kit

Symbols denote proposed immutable types/port roles, not instructions to convert
existing blocks during a run. Starred caps and W/J would start in a research
subclass; names here are not new core type IDs.

| Block | Physical ports and candidate behavior | What it buys / unresolved cost |
|---|---|---|
| A, B: copying tiles | Keep the existing two lateral ports, copying face and fuel back. | Variable inherited strip; known control. |
| P*, Q*: attachment caps | Keep one inward lateral port, copying face and fuel back; use the previously inert outward lateral port for a J anchor. Complementary caps reverse orientation on face copying. | Attaches an independent part without occupying the copying face. New cap-side compatibility must preserve ordinary cap copying/rearming. |
| J: junction | One cap-anchor port and two rim-end ports; fourth port inert initially. Fixed complementary labels, no parent recognition. Start with a square T arrangement. | Three-way branch using three working sides. One J may bind any compatible cap, including the wrong assembly. |
| W: rim segment | Two complementary end ports; other faces inert. A fixed bent rest shape gives curvature. Reuse existing M geometry as a starting point, but do not assume M chemistry implements this proposal. | Curved rails and open frames. Bend, rigidity, closure and collision fit need measurement. |
| E: fuel | Existing conserved charged/spent particles. | Explicit rearming route remains accessible; no free energy from calling a part a junction. |

This is seven proposed material types including E (A, B, P*, Q*, J, W, E),
four of them new role variants. The first geometry fixture needs fewer: one cap,
one J, two W neighbors, one inward rail tile, a cap docking partner and E.
No new mutable state, side relay or division counter is admitted by this memo.

Proposed anchor/rim association would read immutable labels on contacting sides
and actual contact geometry, then request an incident bond. Retention may read
own bond occupancy and exposed bonded-side state. It may not check which cap
made a part, whether a ring closed, or whether a daughter is complete. Rates,
turnover and any state-dependent release remain unfrozen. These are candidate
interfaces, not an executable chemistry specification.

## Four assemblies worth distinguishing

### 1. Open frame carrying a copying strip — first choice

```text
       W—W—W                         W—W—W
       |                                 |
       J—P*—A—B—Q*—J       or        J—P*—A—B—Q*—J
       |                                 |
       W—W—W                         W—W—W
   one attached fork               two forks / open frame
```

Sketches show connectivity, not validated lengths, angles or flush polygon
contacts. In the left sketch only the left J has W arms; the right J is bare.
Separate caps can copy while forks stay attached outward of the strip. New caps
could recruit free junctions and rim fragments. Gaps avoid demanding membrane
division before testing any useful function. Candidate function: a fork retains
a useful product near an accessible copying strip, or limits disruptive contacts.
Actual retention, encounter rates and rearming must beat an untethered control;
previous fuel-contact and repair leads do not establish this payoff.

The next generation must recruit its own fork under ordinary rules. A permanent
prepared fork that helps an indefinitely surviving founder is not reproduction
of the assembly. Shape/attachment variants might be inherited through cap or
strip variation, but attachment alone does not transmit a fork's detailed shape.
Measure that coupling rather than assuming it.

### 2. Cap-anchored rim — closest to the remembered cell

```text
             W—W—W—W—W
           /           \
          J—P*—A—B—Q*—J
           \           /
             W—W—W—W—W
```

A rim connects through two J blocks to the strip ends. During copying, two new
caps must acquire anchors, each resulting assembly needs rim material, and both
rims must become separate, closed and usable. Releasing the face-to-face strip
bonds alone leaves a common rim. Breaking one rim bond opens it; breaking two
leaves two arcs. Two closed daughter rims require reclosure as well as scission.

With fixed rim membership and no new vertices, splitting one simple cycle into
two simple cycles requires at least **two old edges removed and two new edges
formed**. That is a graph lower bound, not a simultaneous four-body reaction.
Sequential incident-bond changes could meet it, but an allowed local pathway,
physical contact of the new ends and leakage during opening are all unresolved.
Growing extra membrane could change the pathway and material accounting.

The direct cap alternative needs rail + copy + two rim ports = four bonds,
or **five with fuel**. Even the four-port version has a directional conflict
if its two rim ports are literally above/below an ordinary square cap: the copy
face and fuel back already occupy those directions. A separate J uses the spare
outward cap edge and keeps each block within four ports. It costs two additional
J blocks per complete rim; this is a hypothesis about access, not free complexity.

No wall-dependent reward, completion wave or programmed pulling sequence is
proposed. Prefer the open-frame test first because it can expose a useful
mechanical function before solving all of closure, feeding and division.

### 3. Branched comb — a copier with attached tools

Use an internal junction variant X in place of a normal letter, with left/right
rail ports, a copying port and a tool-anchor back. Add a bent two-port tool
fragment. X has four ports, so its back can no longer take fuel: it needs an
explicit local rearming route, or the anchor must vacate for fuel access. A
pentagonal drawing does not supply a fifth working side in this engine.

```text
       tool           tool
         |              |
       A—X—B—A   →    A—X—B—A  +  A—X—B—A
```

The arrow is a target, not a measured cycle. Both descendants need tools; copying
X alone transmits an attachment site, not the assembled tool. Possible function:
a retained catalyst or mechanical gate that keeps its benefit near the carrier.
This differs from cap frames by allowing several interior attachments, but has
a sharper fuel-access conflict. Do not begin by designing a reward for each tool.

### 4. Ribbon with a weak seam — growth plus fragmentation

Four-port tiles can connect laterally and across rows. Curved boundary tiles or
weaker transverse contacts could make a finite-width ribbon that grows and
separates into viable pieces. Its inherited information lies across its width.
This is a plausible non-chain architecture, but section 40 already demonstrates
stack growth/splitting and rejects a benefit from stacking alone. Sections 63,
67–69 also warn that designed contact tables and prepared fit do not establish
resource-efficient autonomous growth. Reopen only for a distinct function such
as a measured load-bearing scaffold; a new appearance is not a new mechanism.

## What the Squirm3 reference actually supports

The author's [repository](https://github.com/timhutton/squirm3) links this
[video](https://www.youtube.com/watch?v=VrTM6wYl4Us) and the 2007 cell paper.
It is a plausible match to the recollection; the video itself was not inspectable
in this session. The [paper abstract](https://pubmed.ncbi.nlm.nih.gov/17204010/)
describes a genetic strip, enzymes retained by a membrane, and cell reproduction.
The full PDF fetch failed; no claim here rests on unseen figures.

The inspected [author's source, SquirmGrid.cpp](https://github.com/timhutton/squirm3/blob/gh-pages/src/SquirmGrid.cpp)
attaches the e/f strip ends to a membrane loop through a-state-T vertices in
`InitSimple`. It registers reactions r1–r37, including division and a pulling
sequence; membrane growth/loss uses three-reactant bond rearrangements. This
supports junction-attached architecture, not a claim that caps alone suffice.
Its [reaction implementation](https://github.com/timhutton/squirm3/blob/gh-pages/src/SquirmChemistry.cpp)
can update several reactants and the b–c bond in a three-reactant match. Port
geometry and this project's own-state/incident-bond contract require a new
derivation. We borrow the architecture, not that reaction table. Sources checked
2026-09-27 against the gh-pages branch; it is a mutable source, not a pinned copy.

## The next discriminating step

Build a seven-block **prepared access fixture**, not a whole cell: P*, inward A,
outward J, two W stubs, a complementary Q* and E. Fix actual square geometry
first, including simultaneous rim, copying and fuel contacts. Compare a bare
cap with the same unused material nearby and a direct-rim port assignment.
Measure collision-free approach, face-normal eligibility and retained-pin
residuals. Only then specify ordinary acquisition/release kinetics. Use body4,
individual4 and individual16 for a promising mechanical effect; never infer fit
from a selected rest shape. A docking fixture cannot establish rim retention,
selective permeability, division or any evolutionary benefit.

If a J can preserve access, choose **one** useful open-frame operation and test
its autonomous acquisition/action/release with the same inventory. Then require
descendants to rebuild it from free conserved parts, compare equal-material
independent strips, and test transmission of physical variants through turnover.
If the attachment blocks copying or needs a growing completion program, park it
and reassess the comb or another block primitive instead of rescuing a cell image.
