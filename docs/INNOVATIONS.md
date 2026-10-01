# Innovation log

One short entry per new capability: what is new, how to see it, a picture, status, and what
it enables next. Newest first. Status: **works** (does what was intended in demos or
screens), **partial**, **not yet**. Batches and their numbers live in RESULTS/LEDGER.

## 2026-09-30 (session 2c: typed triangles, casting, hinges)

User direction: no growth programs. Every block is the same triangle with a **type**: three side glues from
complementary pairs (a<->A, b<->B, ..., k<->K activator, '-' inert). One binding rule everywhere: complementary
flush sides bind if one triangle is already attached. Engine: `experiments/tri_typed.js` (subclass of `tri_chain.js`).

- **Typed chain copying (reads glue)** — works (1 world). A free triangle docks on a face only with the complementary
  glue; fills and closures stay glue-agnostic. Template `abaabb` (gaps 10211) gave `BBAABA` (gaps 11021, the
  reverse complement), whose copy was `abaabb` again, in 10k steps. Copying is slow because each face needs its
  own docker type (14 each of 106 free).
  `node experiments/tri_typed.js copy 1 10000 OUT`. Picture: `experiments/out/TYPED_copy_20260930.png`.
  Next: typed backs and ends (inherited only through the docker types), supply limits by type.
- **Factory: a casting pocket makes a replicator's parts** — works (1 world plus control). The founder chain has faces
  `aaaaa`; its copy needs dockers `A--`, and the world starts with none, only blanks `xxx`. Two hatch pockets
  (casters: recognition X, instructions -, A, -) cast blanks into `A--`. Result: 26 casts in 20000 steps and a
  complete copy `AAAAA` by t=10000. Control (same blanks, no pocket): no casts, no docks. First demo of a machine
  producing the supply replication needs. (Bug fixed on the way: a caster's inert instruction side was welded to
  the frame, which wrote the frame glue f into the products; such sides are now left unwelded.)
  `POCKETS=2 BLANKS=60 node experiments/tri_machines.js factory 1 20000 OUT 1` (control: last argument 0).
  Picture: `experiments/out/TYPED_factory_20260930.png`.
  **Closed cycle** (`KINDS=Aa BLANKS=60 ... factory SEED 40000 OUT 1`): one pocket casts A--, one casts a--, from the
  same blanks. World 2: first copy AAAAA by t=20000, copy of the copy aaaaa by t=28000, second AAAAA by t=36000,
  i.e. three complete copies over two generations, every docked part cast (46 casts). World 1: 41 casts, but the
  first copy stalled at AAAA (4 of 5 faces) for 20000 steps. Picture: `experiments/out/TYPED_factory_cycle_20260930.png`.
  Next: a replicator that carries its own pocket (heritable factory); stalled partial copies need recycling.
- **Typed arms (grown parts from types, no programs)** — partial (1 world). `experiments/tri_typed_parts.js`.
  An arm is a series of distinct types. Each attaches by the complement of its parent's exposed glue and exposes
  the next glue on side 1 or 2 (a bend). A type exposing nothing ends it, so the length needs no counting.
  Strand ends carry seed glues on their spare sides (first p, last u); dockers carry p and u on their side edges
  (Apu, Bpu, ...), so copies show the seeds again. The planner's shell pattern (222112, mirrored 111221 at the far
  end) as 2 x 7 types, 12 of each in supply: both founder ends grew their 7-triangle arm as planned, curling behind
  the chain (16 grown triangles in 20000 steps). Released copy fragments grew arms too, so the seeds are
  inherited. But copying was slow (5 docks): each face needs its own docker type, and arms need their own types,
  so every part draws on a specific supply (the supply dependence the user expected).
  `ARMS=12 node experiments/tri_typed_parts.js arms 1 20000 OUT`. Pictures: `experiments/out/TYPED_arms_20260930.png`
  (zoom), `experiments/out/TYPED_arms_frames_20260930.png`.
  Next: more docker supply or fewer distinct face glues; a pocket that casts supply (e.g. blank triangles into
  arm types).
- **Airlock with interlock (user: a double lock, one door closed while the other is open)** — partial (1 world).
  One-row ring; below it a small lock section: inner door (ring-row panel, swings inward), a two-cell chamber, outer
  door (swings outward). New: pulse doors (`#`): a key on the trigger opens the door and is let go at once; the door
  swings 120 degrees, back again, and re-latches. A latch stays released while its door is in the open state (it
  re-latched at once before, and the door stuck). Interlock: a door that is not latched emits a lock signal (range
  12, relayed -1 per bond, previous pass); a closed pulse door ignores its key and keeps its latch while it hears
  it. Without the interlock, 24 keys opened both doors together (26418 of 30000 steps) and the ring tore (doorway
  strain 9). With it, 25 door pulses and never both doors unlatched; doorway strain 0.38 inner, 1.33 in the lock
  section. Not yet: no key got through the chamber in 30000 steps (a key must slip in during a door's short
  opening), so nothing was imported. `node experiments/tri_machines.js airlock 1 30000 OUT 24`. Picture:
  `experiments/out/TYPED_airlock_20260930.png`.
  Retune (slower doors, RATE=0.015): still no import in 30000 steps. Diagnosis (15000 steps, 24 keys): the outer
  door opened 19 times, but in total only 1 key ever sat in the chamber (for 24 steps), and the inner door never
  opened. The key that opens the outer door is let go at once and pushed away by the door as it swings out; other
  keys are rarely nearby. So it is a lock, not a pump.
  Next: a carrying lock. A single 60- or 120-degree hatch cannot move cargo between two sealed regions; the cell it
  moves cargo into is always next to the chamber. The pocket hatch already carries a target from an outer slot into
  an enclosed centre; a pulse door on the centre's inside wall, with the hatch holding its return while the lock
  signal is on, would make a pump.
- **Physics fix: no tunnelling through structures (user: jumping single walls is a bug)** — works. Cause: a free
  triangle's jostle kick is large (20% of kicks exceed 0.8, the largest reach about 1.8), larger than a one-row wall
  (0.87). The kick puts its centre inside a wall block, and the contact solver pushes it out on the far side. Fix
  (`TriSim._jostleBodies`, all triangle worlds, `noTunnel:false` turns it off): after the jostle, a body whose
  block-centre path enters a block of another bonded body is moved only 1/2 or 1/4 of the way, or not at all.
  Free blocks still jostle past each other. About 0.7 moves per step are shortened; step time is unchanged.
  Closed rings at the default jostle: 1 row 141 crossings in 3000 steps before, 0 in 6000 after; 2 rows 0 in 8000.
  Costs: copying about 20-40% slower (docks 44-60 against 72 in 3000 steps; triangles no longer jump into docking
  sites through the chain), and the hatch pocket casts less often (1 and 3 against 6 and 6 in 4000 steps).
  Checks only blocks of structures, so it costs nothing measurable (13.5 against 17.2 ms per step in a copy world).
  Picture: `experiments/out/TRI_notunnel_sealed_20260930.png`.
  Gate at the default jostle (2 rows, 12 keys): the door opened near t=1500 and tracers crossed (66). But the open
  ring is a C that bends wide (openings of 1-3), probably because triangles wedge into the doorway. In 2D any
  doorway turns a ring into a C while it is open. Picture: `experiments/out/TYPED_gate_default_jostle_20260930.png`.
  Next: doors that close again soon (drop the key), or a revolving door that carries only the key through.
- **Hinge machines: triggers, latches, hand-off, conveyor, gated membrane** — works (demos, 1 world each).
  New side marks: `*` trigger (a flap swings while a trigger side is bonded, or while a triangle welded to it
  reports one, relayed one bond), `~` latch (lets go while its triangle or a welded partner has a bonded trigger),
  `^` hand-off (the flap lets go of its cargo once the cargo is bonded elsewhere too), `!` drop (it lets go when its
  swing is complete). A loaded flap drives at half rate, so an empty flap returning wins a push. Geometry rule found:
  a triangle turning about a corner bulges 13% past the edge it swings toward, so a flap needs free space beside its
  third side to close.
  **Conveyor** (`tri_machines.js conveyor`): hatch 1 catches an `aaa`, swings, and hands it to hatch 2, which swings
  on and drops it. Hand-offs 2, drops 5 in 3000 steps (hatch 2 also catches directly). Picture:
  `experiments/out/TYPED_conveyor_20260930.png`.
  **Gated membrane** (`ROWS=2 SIGMA=0.1 tri_machines.js gate 1 10000 OUT 12`): a closed two-row ring. The door is a
  two-triangle panel latched into the wall and hinged at its outer corner. A key (`ggg`) binding its outer face
  unlatches it, and it swings 120 degrees out carrying the key. Keyed world: door opened near t=3500, then 8
  crossings; no-key control: 0 crossings in 10k steps. At the default jostle (sigma 0.3) every wall leaked (fixed since,
  see the next entry up): a free
  triangle's jump (up to 1.8) is larger than a one-row wall (0.87); sigma 0.1 seals. A one-row ring with a notch cut
  into it was an open C and bent open; the latch keeps a closed door part of the ring. Weakness: once open, the
  ring bends at the doorway (the door's drive and the key push against the wall). Picture:
  `experiments/out/TYPED_gate_20260930.png`.
  Next: gates that close again (a key that is dropped or cast), a pump (conveyor through a wall), a replicator
  that carries a hatch.
- **Driven hinges and a hatch pocket (user: hinges should open and close by a trigger, not flop)** — works (3
  worlds). A hinged side (`<` or `>` marks the pinned corner) remembers its flush angle from when it bonded. While the
  flap's trigger side (the side before the hinge side) is bonded, the flap is driven 60 degrees away from its partner
  at 0.05 rad per step, and back when that side is released. Everything bonded to the flap is carried (a machine part
  moving blocks), and the flap jostles with its base, not on its own. The first hinge (loose, jostled on its own)
  flopped and jammed. **Close-only sides** (`.`) bind only triangles that are already attached.
- **Casting: permanent in-simulation type change** — works. A triangle glue-bonded on all three sides takes each
  encloser's instruction glue once every encloser's activator side (K) is bonded to k. Recognition, activator and
  instruction sides follow in counter-clockwise order. Then it lets go. The product copies the instruction glues
  rather than complementing them; a complemented product would stick to its casters. **Hatch pocket**
  (hand-built frame, a prepared starting condition): two fixed casters with close-only recognition sides and a
  hatch hinged at the corner it shares with the pocket centre. Cycle: the hatch waits open, catches an `aaa` in the
  upper slot, swings shut and carries it into the centre. The target binds both fixed casters, the cast gives `bcd`,
  and the hatch swings open so the product drifts out. 20 casts in 3 worlds x 4000 steps, all through the hatch
  (6, 6, 8). The first design (floppy lid, casters catching free targets) managed 4 in one world, and 7 of 9 casts in
  a later check took the direct route. Nothing is cast outside the frame. The frame dents where free triangles push
  into it but keeps its bonds.
  `node experiments/tri_typed.js pocket 1 4000 OUT`. Pictures: `experiments/out/TYPED_hatch_cycle_20260930.png`
  (one cycle), `experiments/out/TYPED_pocket_20260930.png` (first design).
  Next: two hatches as jaws; hatches that pass blocks along (conveyor); a pocket grown from types.

## 2026-09-30 (session 2b: triangle-only chains)

- **End arms: shells and funnels** (`tri_chain.js` site E; planner `experiments/tri_arm_design.js`) — works. Strand
  ends grow arms from their spare edge by a bend pattern, and the far end grows the mirror pattern. A lattice
  planner picks patterns that clear the chain and its copy's space. The shell (`222112`) curls behind the chain; the
  funnel (`112112`) reaches in front with a wide mouth. RESULTS 112: the funnel gives no speed-up; the shell cuts
  field breaks 3–6 fold. Pictures: `experiments/out/TRI_arms_sim_20260930.png`, `TRI_shell_field_20260930.png`.
- **Seeded letters** (`pieces`) — works (exact copying), no speed-up (RESULTS 111).

- **Marks: heritable parts on an unchanged shape** (`tri_chain.js`) — works (copying exact in demos). An R letter's
  hidden triangle can carry a mark. The template face shows it, the docked triangle reads it, and the fill placed
  beside it copies it (optional error `pMarkErr`). Marked R backs are growth site `Rm`. As a coat under the field:
  RESULTS 109, a cost, no benefit. Picture of copies verified geometrically: `experiments/out/TRI_verify_20260930.png`
  (`node experiments/tri_verify.js 2 4000 1101121 OUT`).
- **Hands and blades** (programs `hand`, `blade`) — mechanisms work. Hands hold passing triangles and hand them over
  when used. Blades cut strands they touch (predation). RESULTS 110: hands cost more than they return; blades met
  no prey in sparse worlds. Next: a flow past organisms or denser worlds.

- **Environment for triangle worlds** (`tri_chain.js` options) — works (mechanisms):
  - a damage field that breaks exposed chain bonds, with grown parts casting shadows;
  - fraying of single-bonded triangles, so material recycles and part tips regrow;
  - undocking of lone docked triangles;
  - optional end joining (`pLigate`, a new junction is a T bend), built but not yet demonstrated;
  - **caps**: an inherited end state whose relayed signals mark intact strands. Only intact strands start copies,
    and a copy finishes only at capped ends;
  - **dissolving**: strands missing a cap signal, and orphaned parts, fall apart.

  Caps and dissolving remove the fragment-parasite collapse that took over every field world without them.
  Picture of a turning-over coated world: `experiments/out/TRI_field_coat_on_1_20260930.png`.
- **Coats vs shape under the field** (RESULTS 108, small batch) — parts: not yet; shape: lead. Fans on Z sites halve
  field breaks, and the wave lineage `20202` outlasts a straight `11111` under the field in 2/2 worlds. It also does
  so without any growth, so the benefit is the shape's, not the parts'. Next: a heritable part choice on the same
  shape, or feeding.

- **Triangle-only replicator** (`experiments/tri_chain.js`, user direction) — works (demos; every complete strand
  correct in 2 worlds: 6/6 and 7/7 by t=4000). One block type, the unit triangle. Bonds use the ordinary bond table,
  so pins and rigid-body jostling are unchanged. A chain is a band of triangles. Each triangle reads its roles from its
  own bonds: its free edge is a face (copying side) or a hidden back. Letters are one face plus the backs that follow:
  T (1 triangle), R (rhombus, 2), Z (trapezoid, 3). The information is the gap sequence (0/1/2 backs between faces).
  Copying uses local rules:
  - a free triangle docks on a face;
  - fills bind a docked triangle's prev side, exactly 2 − c of them. The count is read from the template's
    hidden neighbours, one bond per pass;
  - closure happens only when no fill is needed;
  - a docked triangle releases (zipper) once both sides are bonded to complete partners;
  - released faces stay refractory until a relayed busy level falls to 0.

  So T↔Z, R↔R: `1101121` (RRTRRZRR) → `1011211` → `1101121`. Design figure (geometry checked):
  `experiments/out/TRI_alphabet_20260930.png` (`experiments/triangle_alphabet_figure.js`). Frames:
  `experiments/out/TRI_copy_frames_20260930.png` (`node experiments/tri_frames.js 2 1101121 OUT 100 22`).
  Bugs fixed on the way, each a local rule: template and copy ends of a face bond are distinct; the fill count is
  exact even under strain; no re-docking under a copy still peeling off; no release until the second fill has closed.
- **Grown parts by programs** (`tri_chain.js` `grow`) — works (gallery). Hidden backs are growth sites, read
  locally: an R back (both chain neighbours faces) and the first back of a Z. A site takes one free triangle and
  writes a program state into it; each state names which edges take a child and in which state:
  - **hex**: a ring of 6 that ends by closing on itself;
  - **plate**: a side-2 triangle, ended by stop states;
  - **spike**: a strip of 4;
  - **fan**: a triangle with two wings.

  Rules: only free triangles join (structures never fuse), only on released strands, nothing counts. The
  self-complementary founder `10121` (RTRZRR) is copied to the same shape, so founder and copy grow the same
  parts at the same place. In other chains Z sites become T in the copy, so parts alternate between generations.
  Picture: `experiments/out/TRI_parts_gallery_20260930.png`.
  Reproduce: `node experiments/tri_gallery.js OUT 10121 11 "Z:hex" "Z:plate" "Z:spike" "R:fan,Z:hex"`.
  Next: give parts a job. Plates as shields under the damage field, fans or spikes as funnels
  (the user's routes: protection or feeding); hinged parts.

## 2026-09-30 (session 2: chain core with grown shapes)

- **Trapezoid strip: a one-shape chain** (`seeded_bent.js` STRIP, user idea) — works for straight strips (1 demo);
  bends not yet. Every chain block, caps included, is the same welded trapezoid of three unit triangles, with
  two face choices: U has its face on the long edge (legs lean in), N on the short edge (legs lean out). The
  caps are N-shaped, because pentagon caps missed the 30° legs by more than the link tolerance. UNUN… is straight with
  all faces on one side and all backs free. Each letter pairs with its own kind (U+U is a hexagon, N+N meets
  short face to short face). `PCDCDCQ` was copied by t≈16k, and both strands were being copied again at 24k.
  Pictures: `experiments/out/STRIP_copy_20260930.png`, `STRIP_copy_t6000_20260930.png`. Reproduce:
  `node -e "const b=require('./experiments/seeded_bent');b.demo(4,24000,'OUT',['PCDCDCQ'],{C:10,D:10,P:5,Q:5},6000,b.STRIP,b.BentSim,22,{})"`.
  A bent strip (`PCDCCDCQ`, UU turns 60° with the faces on the concave side) did not copy in 30k steps: the two
  copy trapezoids at the bend crowd each other (`STRIP_bent_notyet_20260930.png`). Bends in strips need a
  bend piece, the moulding problem again. The N trapezoid is exactly the Z that complements a triangle bend,
  so a strip with triangle bends is the natural next try.
- **Hinges** (`seeded_ports.js`, label `hinge:true`) — works (demo). A hinged weld pins only one corner of
  the shared edge and keeps the pair's contact, so the part swings about that corner and cannot pass through
  its base. Demo: one chain, B's back takes a rod arm (reach 4) by a hinge; the arm swings between 14° on one side
  and 80° on the other (sd 23.5°, about 95° of range) and folds against the chain; a welded arm only flexes (sd 7.6°).
  Picture: `experiments/out/HINGE_arm_20260930.png` (welded: `HINGE_welded_20260930.png`).
  Reproduce: `node -e "require('./experiments/seeded_accrete').hingeDemo(5,20000,'OUT.png',true)"`.
  Next: flaps that sweep letters toward the face (a moving funnel), paddles for motility against fixed blocks.
- **Bent chains copied by complementary shapes** (`seeded_bent.js`) — works (2 demos). Letters keep unit
  faces and laterals; C is a unit triangle (T, 60° bend, face outside), D is the welded trapezoid of three
  triangles (Z, the other way, face inside); complementary copying pairs A↔B and T↔Z. `PAACAAQ` was copied to
  `PBBDBBQ` (bent the same way, t≈12k) and the copy was being copied back with a T. The S-curve `PAACAADAAQ`
  (both bends) was copied to `PBBCBBDBBQ` (t≈42k), and its copy was being copied again. Each T+Z pair is one
  rigid side-2 triangle. Pictures: `experiments/out/BENT_copy_20260930.png`, `BENT_copy_t5000_20260930.png`,
  `BENT_scurve_20260930.png`. Reproduce: `node experiments/seeded_bent.js demo 1 20000 OUT PAACAAQ`.
  The Z is one custom block for its three welded triangles; moulding it in place from notch triangles is not built.
- **Accretion on the chain's back** (`seeded_accrete.js`, user idea) — partial. Drifting base tiles weld to a
  sticky letter back and to each other (one weld family, sign 0: any tile edge binds any tile edge). Rules, each
  added after a demo failed:
  - activation by attachment: free tiles never clump;
  - **reach**, a relayed level: a letter back emits lvl, each tile relays max(partner) − 1, one bond per pass, and
    grows only at level ≥ 1. Appendage size is set by the letter (heritable); form comes from what drifts by.
    Without it, the appendage engulfed the chain and all 70 tiles;
  - **pure accretion**: an attached block takes only a free tile, so grown structures never fuse. Fused
    structures had locked template and copy together;
  - a letter's back is sticky only while its own face is free, so tiles grow on single strands and never
    fill docking sites;
  - appendages never capture loose letters. Otherwise they ate the B supply.

  Tile grammar: squares sticky on opposite edges make rods, triangles branch, one-edge triangles make tips.
  Demos show rod limbs with triangle joints and bounded shells, and a released copy growing its own appendage.
  Cost: copying slowed a lot. In one world there were 0 copies in 30k steps with tiles, against 2 copies in
  20k without them. Pictures: `experiments/out/ACCRETE_limbs_20260930.png`, `ACCRETE_reach_copy_20260930.png`,
  `ACCRETE_shell_20260930.png`, `ACCRETE_current_20260930.png` (current rules). Reproduce (current rules):
  `node -e "const a=require('./experiments/seeded_accrete');a.demo(2,30000,'OUT',['PBABQ'],{A:12,B:10,P:6,Q:6,C:30,J:20,D:6},a.REACH(5),5000)"`.
  Next: judge appendages by protection (damage field) or feeding (funnelling), the user's two routes to adaptation.
- **Fix: custom shapes centred on their corner mean** (`seeded_growth.js`). The solver's shape matching treats the
  corner mean as the centre, and shapes centred on the area centroid got a spurious turn every pass. Asymmetric
  parts drifted as a result: bends straightened, and the funnel blades and shield fans may have been affected.
  Earlier FUNNEL/SHIELD results predate the fix.

## 2026-09-30 (session 1)

- **Base-shape alphabet** (design, user direction) — not yet built. Two base shapes (unit
  square and unit triangle); everything else is welded (the trapezoid is one of many). A triangle in a
  chain is a 60° bend. A bent chain is copied because the bend is a mould: one triangle docks on the
  bend's face and two fill the notches, forming the complementary trapezoid bend. Paired, the bend is a
  rigid side-2 triangle (a square copy would leave a gap). Picture:
  `experiments/out/SHAPES_alphabet_20260930.png`; details in COMPLEXITY_MAP 3e. Next: demo copying a
  bent founder.
- **Funnel on the caps** (user idea) — partial/promising. Each cap's outer side seeds one custom
  parallelogram blade (C on P, mirrored D on Q) that leans toward the copying face. Blades are
  rebuilt on every copy. Demo (one seed each, 30k steps, 2 PAAQ founders): 7 chains and 26 face
  docks with funnels vs 5 and 22 without. Picture: `experiments/out/FUNNEL_20260930.png`.
  Reproduce: `createWorld({founder:['PAAQ','PAAQ'],loose:{A:14,P:6,Q:6,C:8,D:8},config:FUNNEL()})`.
  Next: tune lean/length so both blades point at the face (some splay outward now); longer
  blades; later, hinged blades that sweep (movement).
- **Multi-port blocks** (`seeded_ports.js`) — works. Growth ports on any polygon edge (edge-indexed
  bond table, pins in the physics, contact exclusion), so a hexagonal hub has six usable sides.
  *Tripod*: B seeds a hub that grows 3 rods (bounded frame). *Network*: rods' far ends catch new
  hubs that grow more rods, so an open branching frame of hubs and rods grows from the founder's
  seeds (58 port bonds in 15k steps). Picture: `experiments/out/PORTS_lattice_20260930.png`.
  Reproduce: `ports(PinsLiveSim, LATTICE)` with `createWorld({founder:['PBBQ'],loose:{J:20,C:40,...}})`.
  Next: closed cells from hub rings, frames as scaffolds for copying, frames that break apart
  (a new reproduction mode for frames).

## 2026-09-29/30 (earlier)

- **Evolved shields under a damage field** — works (screen). B letters arise by copying
  error, seed a fan plate that shades the chain, and spread to majority under the field in
  4/6 worlds. Picture: `experiments/out/SE2_20260929_on_1732.png`. RESULTS 105–107.
  Next: combine with supply control and patchy zones.
- **Shadowing damage field** (`seeded_field.js`) — works. Bond breaks scale with local
  intensity × exposure (the unshadowed fraction of directions); walls and plates cast shadows.
  Pictures: `experiments/out/FW_20260929*` (walled vs bare). RESULTS 103–104.
- **Maintenance by attachment** (`config.release`) — works (mechanism). A growth bond is kept
  only while one of its blocks is attached elsewhere; debris from broken chains is recycled.
- **Custom part shapes** (`config.shapes`, `rod()`, `fan()`) — works. One block per intended
  part, with mass and inertia from the polygon. Picture: `experiments/out/COMB_ROD_viability_20260929.png`.
- **Reversible block programming** (`config.programmable`) — partial. Blanks carry a `kind`
  state; a bonded writer port sets it permanently; the block then releases the mismatched
  bond; free programmed blocks forget. Enzyme-cell demo: a B-carrying chain writes its own wall
  material (23 writes in 40k steps). Next: erasers, visible supply shifts (backlog 4).
- **Comb: sequence-encoded arms** — works. B's back seeds a D junction and J arms; the arms
  are rebuilt on copies; useless arms are selected against (6/6). Picture:
  `experiments/out/COMB_20260929_1402.png`. RESULTS 100.
- **Generic seeded-growth engine** (`seeded_growth.js`) — works. Port labels (family, sign,
  seed), activation by attachment, structural types outside letter chemistry. The half-cell is
  one configuration and still reproduces across generations. RESULTS 99.
- **Anchored rim growth and multi-generation half-cells** — works (screen). Rims grow only
  from anchored ends; daughters template grand-daughters. Pictures:
  `experiments/out/HCA_20260929_lead.svg`, `experiments/out/HCG_20260929_gen2.png`. RESULTS 97–98.
- **Fast polygon runtime** (`half_cell_fast.js`) — works: 6.4x faster, bit-identical in tests.
- **Snapshot tool** (`tools/snapshot.js`) — works: any saved state to PNG.
