# Complexity map: what the half-cell result generalizes to

2026-09-29, written at the user's request for a bird's-eye view after RESULTS 97–98.
This is a design map, not evidence. ROADMAP orders the work; each step still gets a
frozen plan. It builds on [BLOCK_ARCHITECTURES.md](BLOCK_ARCHITECTURES.md) (27 Sept) and
the [idea notebook](IDEAS.md).

## 1. What actually worked, stripped of the D-shape

The first multi-generation reproduction of a two-part assembly (RESULTS 97–98) used
three ingredients:

1. **A copied seed.** The P-A-A-Q chain is copied by ordinary templating (dock, link,
   energy-gated release). Only this part carries information from parent to child.
2. **A seeded structure.** The W arc is *not* copied. It is rebuilt from free parts in
   every generation, by growth that starts at ports the copied chain exposes (the caps).
3. **A coupling rule.** Growth happens only from anchored ends: a cap in a chain, or a W
   already attached. Before this rule, free caps and free W consumed each other and
   nothing copied (RESULTS 96). After it, the structure is built only where the copied
   part says, and the shared material stays available.

That is the same logic as a cell: a replicated description, with everything else
constructed around it by local processes that the description seeds. The wall is inherited
because its seeds are, not because it is copied. **Any structure whose growth is seeded
only by copied parts is inherited for free.** That is why this kind of complexity is
comparatively easy to expand: adding a structure needs a seed port and a growth rule, not
a new copying mechanism.

## 2. A small grammar of processes

Everything built so far is a combination of a few process types. Naming them makes the
design space visible.

| Symbol | Process | Examples here | What it provides | Known pitfalls |
|---|---|---|---|---|
| **T** | Templated copying | chain copying (core) | heredity, variation by errors | sequestration of templates; shortest wins (regularity 1) |
| **G** | Seeded growth | W arcs from caps (97) | construction of non-copied parts | uncontrolled nucleation eats material (96) |
| **C** | Closure by geometry | curved W closes the D | finite size without a counter | wrong curvature or rings with nothing inside |
| **A** | Activation by attachment | anchor rule (97), docking | stops free parts reacting prematurely | too strict, and nothing starts |
| **R** | Driven release | energy-gated REPEL/rearm | lets held parts go | passive switches trade acquisition for release (92) |
| **D** | Decay / turnover | fraying, radiation | recycles material; enables selection | too fast kills; too slow freezes (79, 94) |
| **P** | Physical effect on the world | walls block rays, parts catch fuel | makes structure matter | designed per-function rewards are not invention |

| **M** | Modification (metabolism) | *proposed* | organisms shape their own supply of part types | must stay local: a block may change only its own state |

The half-cell is **T + G + C + A + R** (no D, no P yet). Other combinations are
open, and each new row can reuse the same rules.

## 3. The expansion principle: one generic seeding rule, many seeds

The step that could make this open-ended, instead of one engineered cell:

- **Seed ports are labels, not rules.** A block side can carry a seed label. A growth
  rule is generic: a free part whose end label matches binds an anchored end with the
  complementary label. One rule, then any number of labels and polymer shapes.
- **The sequence chooses the seeds.** Letters differ in which seed labels they expose
  (sides are not limited to four; 2026-09-27). Copying the sequence copies the set of
  seeds, so the set of structures built around the chain becomes heritable and mutable.
  A copying error that swaps a letter changes which structure grows there. This is a
  genotype-to-phenotype map made of mechanics alone.
- **Structures can seed structures.** A W with an outward label can seed a coat polymer;
  an appendage tip can seed a second appendage. Depth comes from stacking, not from new
  rules. This is the "enough of it stacked together" the user suggests, made concrete.
- **Physics decides value.** A structure's shape and ports then affect copying speed,
  fuel access, protection, mobility or competitors' material. No reward is attached to any
  label, and selection comes only from physical consequences in a shared, finite soup.

With this, new "functions" are new *combinations* of labels and shapes that happen to
help. The rule set stays fixed while the design space grows combinatorially. That is the
honest target for open-ended complexity here, and it matches the audit's requirement that
novelty arise under fixed rules.

## 3b. Only the chain replicates, and that may be enough (user, 2026-09-29)

Only the chain is templated. Everything else is built around it by seeded growth, as in
biology, where one molecule class is templated and the rest is constructed. A two-step
route (chain copied, then a transcript that seeds structures) is optional. Crystal- or
stack-like self-copying (RESULTS 40) stays available but is not required.

## 3c. Organisms should shape their own supply (user, 2026-09-29)

Otherwise every organism is capped by the soup we prepare. Two local routes:

- **Programmable blanks (M).** Generic blocks carry a side-label *state* instead of a fixed
  type. A structure grown from the chain (the enzyme, encoded by the sequence) binds a blank
  through an ordinary incident bond. The blank reads the bonded partner's exposed mark and
  sets its *own* label state, which persists after release. This is within the locality
  contract: it reads its own and the bonded partner's side state and writes its own state.
  Sequence then controls which parts exist, as genes control chemistry through enzymes.
  State change, not type change (the user's preference).
  **Minimal design (user refinement, 2026-09-29):** one small integer *kind* per block
  (0 = blank), and a fixed table mapping kind to side labels; type and shape never change.
  A writer port exposes a kind k: a block bonded to it sets its own kind to k, and the
  change is permanent, beyond the attachment-only influence of ordinary bonds. After the
  write the block's labels no longer match the writer, so it releases that incompatible
  bond itself: release is driven by the state change, which carries memory, avoiding the
  RESULTS 92 trap. **Reversal is required**, or blanks run out: an eraser is a writer with
  k=0, and/or unattached programmed blocks slowly decay back to blank. Keep programmability
  this simple: a few kinds, no per-side editing.
- **Preferred direction (user, 2026-09-30): a small shape alphabet with a switch.** Similar-size blocks
  share unit-length working edges (face, laterals) and differ in back and angles: square, wedge,
  half-square. Any can be a chain letter, so the sequence encodes the chain's own shape and copying stays
  shape-agnostic. The programmable `kind` selects the rest shape (square or wedge, like the core fold rule),
  so shape supply is balanced by reprogramming and chains can fold after release. Bigger parts are 2–3
  squares bonded by existing mechanisms and splittable; intentional length comes from copying (rod genes).
- **Universal tiles and welding (user, 2026-09-30; earlier variant): shape supply.** Programming changes labels, not
  form. Build parts from universal tiles (triangles or squares plus half-squares) welded edge to edge
  (rigid in 2D; a single-corner weld is a hinge). Welds are durable, but broken by hot zones or unwelding
  ports. Welding happens only where a chain-seeded **jig** holds tiles, so part form is copied from the
  organism, not left to chance. Three levels: tiles, parts, structures. The cost is more bodies per part.
  Morphing blocks (a state selects one of a few rest shapes of equal area, like the fold rule) are
  a cheap partial alternative for small shape changes.

## 3d. Custom parts, not repeating blocks (user, 2026-09-29)

A structure meant to have a particular length and form should be **one custom block** with
its own polygon, not a run of small repeating blocks. Repeats grow to unbounded length, or to
random length if capped (the comb's J arms reached 23 blocks, RESULTS 100). With single parts,
function, length and form are intentional. Repeats are for the few cases where open-ended
growth is the point. The engine supports this (`config.shapes`, e.g. `rod(3)`; mass and
inertia follow the polygon). Viability look: a comb whose B seeds one 3x1 rod is bounded as
intended. In that world the armed founder stayed paired for 30k steps without finishing a
copy (the partner B, attached by its face, may grow a rod that jams); PAAQ made 4.

## 3e. Base shapes: square and triangle, one edge length; welded shapes; bends copied by moulding (design, 2026-09-30)

Picture: `experiments/out/SHAPES_alphabet_20260930.png` (script `experiments/shape_alphabet_figure.js`,
which also checks the copy geometry numerically). Stay simple and general; complex forms
come from combinations and sequences (user, 2026-09-30).

- **Two base shapes only: the unit square and the unit triangle.** Every working edge is one unit
  long, so any edge bonds to any other. The square has a face F, laterals R and L, and a back K.
  In a chain, a triangle uses one edge as its face and two as laterals, so it is a **bend T**:
  it turns 60° with the face outside.
  - No wedge, and no trapezoid shape.
  - Every turn is a 60° step, so chains and parts share six directions and meet edge to edge. Squares add 90° joints.
  - **No shape switch (user, 2026-09-30):** shape is not a block state. The soup supplies a fixed ratio of the base shapes.
  - **Triangle only? (user question, 2026-09-30).** For grown parts, yes: triangles alone give every 60° form and need no
    supply control (the bent-chain accretion demo already uses triangle tiles only). For the copying chain there is a catch.
    Triangles with faces on one side curl into a hexagon. A straight triangle chain is a strip whose faces alternate sides,
    so it has no single copying side and no free back. Working choice: triangles for all grown material, the square kept
    only as the straight chain letter. A both-sided triangle strip replicator is an open idea.
- **Welded shapes.** Bigger parts are bonded combinations: rods, corners, rhombi, trapezoids,
  hexagon hubs, houses, kinked plates and saws. A two-corner pin is rigid, one pin is a hinge, and releasing bonds splits a part.
  The trapezoid (three triangles) is just one of many useful welded shapes (user).
- **Copying a bent chain (user corrections, 2026-09-30).**
  - A square copy at a T bend leaves a 60° gap (0.52 units): the copy's neighbours cannot bond.
  - The complement of a T bend is a trapezoid, a **Z bend**, which turns the other way with the face inside. The copy's squares attach to its angled legs.
  - Paired, S+S is a domino and T+Z is a side-2 triangle, so a bent double strand is one rigid piece. Every pair of neighbouring copy units shares a whole lateral (checked: gap 0).
  - The Z is built **in place from supplied triangles**. One triangle docks face to face on the T. That leaves two 60° notches between it and the neighbouring copy squares, each exactly one unit triangle, which free triangles fill. **The template bend is a mould.**
  - Copying a Z bend back takes a single triangle on its short face, so the copy of a copy restores the T. Shape is inherited by complementarity.
  - Copying costs triangles unevenly: 3 per T bend, 1 per Z bend. A simulation that wants such shapes must supply enough triangles (user).
- **Consequences.**
  - No fold/unfold rule is needed: strands are bent while copied and after release.
  - One strand can hold both bends, so S-curves and zigzags are possible.
  - Examples: SSSSSS is a rod; TTTTTT is a hexagon with faces out; ZZZZZZ is a ring of 18 triangles with faces in; (ST)×6 is a 12-ring; SSS TTT SSS is a hairpin, whose copy (a U of 9 triangles and squares) slides off.
  - Structure seeds sit on square backs (or the Z's two unit back sites).
- **Open problems and questions.**
  - **Closed rings cannot separate:** in 2D a TTTTTT ring is enclosed by its copy. Rings would have to be copied open and then close, or open to release. The copy could also be a feature, as an enclosing wall.
  - Kinetics of notch filling: triangle edges must accept both face and lateral roles, and a notch triangle binds two open laterals at once (activation by attachment).
  - Do free triangles weld into unwanted clumps? Triangles probably need to be inert until they touch an attached edge.
- **First demo.** Square and triangle blocks, with triangle edges acting as face or lateral. A bent
  SSTSS founder copies with a moulded Z bend, and a copy of the copy restores the T.

## 4. Combinations worth trying (the map)

Ordered by how directly each builds on what works. None is tested unless marked.

| Assembly | Processes | Why interesting | First question |
|---|---|---|---|
| Half-cell (chain + seeded wall) | T G C A R | **works in screens (97–98)** | sustained with decay; with sequence variation |
| **Comb**: chain + appendages seeded by interior letters | T G A R | sequence-encoded morphology; many sites per chain | are appendages rebuilt on copies, and do extra letters matter? |
| Wall with outward seeds, i.e. a coat | T G G C A | depth by stacking; layered envelope | does a second layer grow only on finished walls? |
| Full cell: wall closes around the copying face | T G C A R | a real compartment; contents inherited by location | can copying still reach the inside? (the D shape avoided this) |
| Adhesive walls between cells | T G C A + P | colonies, cooperation, division of labour | do sibling cells stick, and does sticking pay? |
| Fuel-catching appendage | T G A R + P | internally generated benefit (faster rearming) | does a catcher raise its own lineage's copying? |
| Material theft: appendage that captures other cells' parts | T G A + P | predation and arms races from conserved material | does theft outcompete building from free parts? |
| Weak-seam ribbon (BLOCK_ARCHITECTURES 4) | T G D | growth plus fragmentation, a second reproduction mode | parked (section 40), unless it carries a seeded function |

## 5. What open-ended growth needs, and what has blocked it before

Requirements (all must hold at once):

1. heritable variation in *which structures* exist, not only in string length;
2. structures with physical consequences for reproduction;
3. costs, since every structure uses conserved material, which gives trade-offs;
4. turnover, so material recycles and lineages replace each other;
5. composability, so added structures do not break copying (the anchor rule is the
   template for this);
6. interactions between lineages (shared material, contact), so niches can form.

Lessons from failures, as design rules:

- **Unconditioned reactivity sequesters material** (18, 29, 79, 94, 96). Make parts
  reactive only when attached (A).
- **Hold-then-release needs memory or a drive** (79, 92). Reuse R rather than passive shapes.
- **Starved kinetics look like failed mechanisms** (95). Test in an abundant soup before
  judging a rule.
- **Length is not complexity** (regularity 1, 94). Count distinct structures and their
  effects instead.
- **A rewarded motif per function is not invention** (audit). Benefits must come from
  physics in a shared world.

## 6. A program, in small fast steps

Each step is a screen (AGENTS QA tiers); promising ones get confirmation.

1. **Generic seeded-growth engine.** Refactor the half-cell runtime so ports carry labels
   and anchored growth is one rule over a label table (polymer types by shape and labels,
   letters by the seeds they expose). Regression: the current half-cell configuration
   must still reproduce as in RESULTS 98. This turns every later idea into configuration,
   not new code.
2. **Turnover and sequence variation in the half-cell soup.** Add slow decay (W and chain
   bonds) and two chain letters. Ask whether reproduction continues past the material
   limit and whether sequences drift and compete. This is also the confirmation run for
   RESULTS 98, with fresh seeds and a dt 1/4 robustness rung.
3. **Comb: sequence-encoded appendages.** One letter exposes a back seed port; appendages
   are short straight polymers. Test that copies rebuild the appendage pattern their
   sequence specifies.
4. **First physical benefit without a reward.** Walls behind the chain do *not* shield it from
   rays at either ray speed (RESULTS 101–102): the copying face must stay open, and one
   break kills. **Leading candidate: a feeding arm.** Supply kinetics limit copying throughout
   RESULTS 95–100. Arm tips bind free letters reversibly by their back, raising the local
   concentration next to the chain. A held letter can still dock on the template by its face;
   once the letter links into the copy, the arm bond is released by that state change
   (release on incorporation, the same logic as block programming). The benefit stays with
   the arm's own chain because of where the arm sits. Other candidates: an enclosure with copying inside; repair (a bound
   partner holds broken ends, RESULTS 78) combined with driven release; appendages that catch fuel. Compete morphologies in one
   soup at equal material.
5. **Stack.** Coats on walls, adhesion between cells, theft. Each is a label and shape
   combination in the engine from step 1.
6. **Metabolism (M).** Programmable blanks reprogrammed by sequence-encoded enzyme
   structures, so organisms influence the part distribution themselves.
7. **Environment, later (IDEAS).** Patchy hot and safe zones for turnover and supply;
   fixed obstacles so directed movement can evolve.

Speed matters for all of this (user direction 2026-09-28). The half-cell runtime is now
6.4x faster; the next gains are in the polygon-contact sweep (IDEAS, Speed).
