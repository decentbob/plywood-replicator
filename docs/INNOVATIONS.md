# Innovation log

One short entry per new capability: what is new, how to see it, a picture, status, and what
it enables next. Newest first. Status: **works** (does what was intended in demos or
screens), **partial**, **not yet**. Batches and their numbers live in RESULTS/LEDGER.

## 2026-09-30 (session 2: chain core with grown shapes)

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
