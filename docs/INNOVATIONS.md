# Innovation log

One short entry per new capability: what is new, how to see it, a picture, status, and what
it enables next. Newest first. Status: **works** (does what was intended in demos or
screens), **partial**, **not yet**. Batches and their numbers live in RESULTS/LEDGER.

## 2026-09-29/30

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
