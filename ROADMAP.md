# Innovation backlog — 2026-09-30

Working mode: **innovation first** (AGENTS). Each item is a new capability to build and
demo, not a threshold to certify. Pick the top item that is not blocked, build it as a
configuration or small subclass of the seeded engine, show it in pictures, log it in
[docs/INNOVATIONS.md](docs/INNOVATIONS.md), and move on. Several items per session is normal.
The previous verification-heavy queue is archived (`docs/archive/ROADMAP-2026-09-30.md`).

## Where we are

Built and working in demos or screens (details in INNOVATIONS):
- chain core with grown shapes: accretion with heritable reach, bent chains (triangle/trapezoid complements, S-curves), all-trapezoid strips, hinges;
- chain copying with seeded structures: half-cells that reproduce across generations;
- the generic seeded-growth engine (port labels, activation by attachment, custom part
  shapes, maintenance release);
- sequence-encoded parts (comb arms, rods, shield plates) rebuilt on every copy;
- reversible block programming (blanks written by enzyme ports, forgetting);
- a shadowing damage field; shields that evolve by mutation and spread under it.

Open weaknesses to design around (not to re-test): one break kills a chain; material
saturates in closed worlds; supply is fixed by the starting soup; motion is pure drift.

## Backlog (top first)

| # | New capability | Why it is new / what it enables | First demo |
|---|---|---|---|
| 0 | **Chain core with grown shapes (user direction, 2026-09-30)** — first demos done (INNOVATIONS session 2): accretion on letter backs with reach, bent chains copied by T/Z complements, trapezoid strips, hinged arms | The chain copies; the non-copying side grows appendages from drifting tiles, so form emerges from simple welds, and its size is heritable (reach) | next rows 0a–0d |
| 0a | **Adaptation by protection or feeding** (user: the two main routes) | Grown appendages get a physical job: shade the chain under the damage field, or funnel letters to the face. First test of whether emergent shapes pay | Accreting chains (reach on B vs no B) in the shadowing field; picture of which shapes shade; later one small batch |
| 0b | **Make accretion compatible with copying** | Tiles slowed copying heavily (0 copies in 30k vs 2 in 20k without) | Fewer or smaller tiles, reach 2–3, or tiles only on caps; compare copy time in one or two worlds |
| 0c | **Triangle-only world** (user question) | One base shape removes shape supply control: strip letters (U, N trapezoids), caps, triangle tiles; bends via T/Z moulding (N is the Z) | Strip founder with a T bend and triangle tiles on backs; see whether the copy passes the bend |
| 0d | **Hinged flaps as moving funnels / paddles** | Hinges work (demo); a flap on a cap that sweeps letters toward the face, or pushes against fixed blocks (motility) | Hinged cap blade (FUNNEL + hinge); docking rate vs welded blade |
| 1a | **Funnel on the caps** (user, 2026-09-30) — first demo done (INNOVATIONS), tune lean | One to three longer custom blocks attached to the caps, leaning toward the copying side, so passing letters are funnelled in instead of drifting by. Simpler than a gripping arm; a feeding structure that benefits its own chain; later movement | A cap-seeded pair of angled rods forming a V in front of the copying face; compare docking rate in a demo |
| 1 | **Multi-port blocks (5–6 working sides)** — done: hubs, tripods, networks (INNOVATIONS); next: closed hub rings, frames as scaffolds | Branching frameworks, lattices and hubs, beyond chains and rims; the user's "sides not limited to four" | Extend the growth table past 4 ports; a hexagonal hub seeded by a chain letter grows a 3-way branched frame |
| 2 | **Hinges and pivots** — first demo done (hinged accreted arm swings ~95°, INNOVATIONS) | Parts joined at a single corner can swing: limbs, flaps, clamps, the first moving parts | A pivot bond type (one pinned corner); an arm on a chain that flaps under kicks |
| 3 | **Fixed obstacles and motility** | Immovable blocks give something to push against: grip, crawl, ratchet (user idea) | Pinned wall blocks; an organism with a hinged arm that sticks to the wall on one stroke only |
| 4 | **Organisms make their own supply** | Enzyme structures write blanks into the parts they need; erasers and hot zones recycle (user idea) | Enzyme cell with writers, erasers and forgetting; show the part distribution shifting |
| 5 | **Patchy environment** | Hot zones break and erase, cool zones are safe; continuous supply without stalling (user idea) | Field with a spatial profile plus zone-dependent erasing; picture with a coloured field |
| 6 | **Coats and layers** | Structures that seed structures: a second layer grows only on finished walls | Wall W with an outward seed; a coat polymer or custom plate grows on it |
| 7 | **Adhesion and colonies** | Walls with sticky outer ports hold sibling cells together: multicellular groups | Outer wall label that binds other walls; picture of a colony of Ds |
| 8 | **Predation and theft** | A part that pulls bonds or parts off other organisms: arms races from conserved material | A "hook" part whose contact releases a neighbour's growth bond and captures the part |
| 9 | **Two-step replication** | The chain seeds a transcript that seeds structures (DNA/RNA-like), decoupling copying from building | A short copied strand that detaches and seeds a structure elsewhere |
| 10 | **Small shape alphabet (user refinement, 2026-09-30; preferred over pure tiles)** — built as bent chains and trapezoid strips (row 0); shape switch dropped (user); earlier: design drawn (COMPLEXITY_MAP 3e: base shapes square and triangle only, welded shapes beyond; a triangle is a 60° bend; bends copied by moulding, with triangles filling a trapezoid on the bend's face); next: build the demo | A few similar-size block shapes that share **unit-length working edges** (face and laterals) and differ in back and angles: square (straight), wedge (curls a run), half-square or triangle (corners). Any of them can be a chain letter, so the **sequence encodes the chain's own shape** (a shape-programmable polymer), and copying stays shape-agnostic. **Switching** is a state: the programmable `kind` selects the rest shape (square or wedge), like the core fold rule, so blanks cover shape supply too and a chain can fold after release. **Bigger parts** are 2–3 squares bonded by existing mechanisms and splittable; intentional length comes from copying ("rod genes": short chains copied and released as parts, backlog 9) | A chain with square and wedge letters copies faithfully and each copy folds to the shape its sequence encodes; then a blank square reprogrammed to a wedge |
| 10b | **Universal tiles and welding** (earlier variant) | Labels can be reprogrammed (blanks), but shapes cannot. Universal small tiles (equilateral triangles, or unit squares plus half-square triangles) weld edge to edge into custom parts; a weld pinned at both corners of a shared edge is rigid in 2D, one corner makes a hinge. Welds are durable but broken by hot zones or an unwelding port. Welding only where a **jig** (a chain-seeded structure) holds tiles in place, so part length and form come from the organism (a mould), not from chance. Free tiles are universal supply; the environment recycles unused parts. Unifies shape supply with label supply (blanks become tiles, enzymes become jigs and writers) | Triangles only; a jig holds two free triangles edge to edge, they weld into a rhombus, the rhombus is released and seeds ordinary growth elsewhere. Picture of tiles becoming parts becoming structures |
| 11 | **Enclosure with copying inside** | A real compartment: wall around the chain, with parts entering through gates | Full ring wall with a gate part that admits letters |

## Parked evidence (do not re-test)

Walls/shields protection: favourable in most worlds (RESULTS 101–107), adopted as working
assumption. The round-3 structure-choice run (shield vs rod) was stopped on user request (2026-09-30). Only
field-on seed 1752 finished: the rod letter D rose to 0.71 of chain letters, B (shield) stayed at or below 0.29
(`experiments/out/SE3_20260930_on_1752.json.gz`). One world, no control; start nothing like it.
Older parked branches (repair, fold, delivery, and others) are listed in the archived roadmap.
