# Roadmap — typed-triangle world (2026-10-03)

## BIG goal (user, 2026-10-01)

**An organism with a metabolism that constructs its offspring and feeds it until it can live on its own, then
splits it off.** Build every mechanism in isolation, then combine them.

| Module | Biology | Status | Where |
|---|---|---|---|
| Genome: typed chain copied by complementary faces | DNA/RNA | works (zip copying from the high end, no deadlock) | sim.js chain rules |
| Compartment: closed ring membrane, sealed at the default jostle | cell membrane | works | test "a closed ring keeps its tracers" |
| Membrane growth | membrane growth | a ring grows from a periodic kit (2R-1 types) and closes (8-13k steps) | structures.ringKit, demo ring; backlog 2 |
| Budding: a ring on a seed lets go once complete (open signal, `&` release) | daughter cell | works (test "budding"); with contents: the bud pair and closure rows below | structures.ringKit `bud`, budKit |
| Segregation: the bud catches a genome copy | chromosome segregation | works: anchor side `\|` catches a copy's seed (the strand placed flush as one body); the parent keeps its founder by its own anchor | sim.js anchor, demo budpore |
| Programmable synthesis: contact copying (copy side `?`): a copy blank touching a body becomes a copy of the touched part | templating (membrane heredity) | works in isolation: a ring grown one motif round closes and a second ring grows, from copy blanks only (3 of 4 worlds at 200000 steps; 5 of 8 seeds); a strand is copied from copies of its own triangles (4 of 4) | sim.js _copy, demo imprint |
| Genome on copies inside a cell: a sealed cell copies its genome from copy blanks alone (spent `&` walls are never copied) | replication from uniform nutrients | works (4 of 4 worlds at 60000 steps, 4 strands from 60 blanks, since the 2026-10-02 release locality fix; before it 3 of 4 at 40000; control 2-3, the wall takes most); in a bud pair: see budpore below | demo imprint m |
| Feeding on copies: a cell fed through a pore copies its genome from copy blanks outside (every free side spent `&`, so only what lies inside is copied) | uptake of uniform nutrients | works (4 of 4 worlds, 5-6 strands inside from 150 blanks; controls: no pore 0 copies, plain walls take all; since anchors catch busy strands 7 of 8 seeds: a founder caught during its first copy, before any back was copied, never gets a fill) | demo imprint p |
| Hooded pore: a cell fed through a pore under a hood keeps every strand in (a strand cannot turn from the pore into the corridor under the hood; blanks can) | a cell that does not leak its genome | works (14 of 14 worlds with 5+ strands inside and none outside since run 1520's anchor shift, was 10 of 14; plain pore: 5-11 strands lost in 4 of 8). Needed because free strands outside starve any cell (3 rivals leave an `imprint p` cell 1-2 strands) | demo imprint `ph` |
| Only a held strand is copied (option `heldCopy`: zip starts at a high end only while its spare edge is held, not by `&`): free strands, leaked or rival, are sterile | replication from a membrane-attached origin | works in isolation (run 20261003-1720): with 3 rival strands outside a cell keeps 6-7 strands inside in 4 of 4 (control without the option: 2-3, the rivals multiply); a 7-cell pore leaks every copy and the held founder keeps copying (3 of 4); a lone cell 6 of 8. The answer proposed for the kind's opening (IDEAS): leaks no longer starve a cell; `budpore 300` with both anchors on high ends: the bud makes 10-15 full copies after the split in 3 of 4 (check `budpore-held`; 0-1 without the option): M2 on the open pair; run 1921: P's anchor on side `52:1` (dry-run `BUDDRYP`): 4 of 4, 7 of 8 seeds | sim.js zip, demo imprint `pzox`, `pzow`, `pzo` |
| Bud pair on copies with a doorway (no doors; held by one completion-release bond `&` that hears the bud anchor's open signal and is cut once the anchor has caught, its freed sides spent; until run 20261003-0050 a latch on a hear chain) | budding on copies | works: the bud's mid-wall anchor `W@\|` catches a copy by its low end and the pair splits with food left in 8 of 8 seeds (run 1921; before: 4 of 8); the bud copying its genome after the split: not yet (one full copy in 2 of 8: the food goes to P's copies outside, the freed latch sides and anchor copies). Sealed variant `c` (run 2321): the doorway joins P and D only, P feeds from blanks inside with its founder under the doorway; splits 7 of 8 with 1-4 strands in the bud; bud copies after the split 1 of 8. Run 0050: completion-release doorway (same splits; sealed pair 0-1 wall copies, was 8-57) and a free triangle's anchor side binds nothing (open pair: 7 of 8 split with food left, bud copies 2 of 8). Run 0320: no doorway width gives M2 (the opening a strand enters by stays after the split; IDEAS, 2026-10-03); the bud's genome as its plug (a strand caught at its gap's edge lies in its wall, a 3-cell pore left): the bud alone copies in 3 of 4, the parent's half still leaks. Run 1221: a copy blank binds no anchor side, so the waiting anchor is no longer copied (open pair seeds 1-4: genome copies 300 of 300, were 265-278; split with food left 3 of 4 as before; sealed pair 12 of 16, was 14 of 16, by divergence only) | demo budpore (`c`) |
| Closure: one kind whose bud is the same kind (`structures.budKit`: R 5, every cell its own type, 7-cell pore, root = seed bond, catching anchor (with heldCopy `Z@\|` on arc cell 6, run 1921), last cell = seed site) | a lineage | designed, not demonstrated (run 20261003-1121): signal logic checked (test "closure (budKit)", and with the anchor on cell 6: the bud lets go only after its catch and is then in its parent's starting state); the doorway passes strands in 4 of 4 with the founder away from it, 1 of 4 with the founder where the kind held it; growth from a part pool: works in isolation (below). Run 1921: on prepared rings of the kind's geometry with heldCopy and anchors on arc cell 6 the bud catches, splits and copies its strand 3-11 times after the split (8 of 8; check budpore-kind; 4 of 8 with no free strand in P at the start); anchors on the root: 0 of 4 | structures.budKit, demo closure, IDEAS |
| Closure kind's bud from a part pool: a prepared parent grows its bud on its seed site from free parts of all 47 types and copy blanks, then splits on a (stand-in) catch | growth from a shared parts pool | works in isolation (run 20261003-1420: 4 of 4 check worlds, 8 of 8 at 107-200 thousand steps, 0 stray bindings, 1.37 copies per used part at one part per type per blank); the last cell must already be inside the sealed pair (with as many E parts as other types 2 of 4; 40 E parts: 8 of 8); with E's pore side plain (an E source inside, run 20261003-1650) 4 of 4 with no E part in the pool (check budpool-e); the pool has no per-type regulation | demo budpool, IDEAS |

Every row marked works is guarded by `node tri/check.js` (one line per capability, about 18 minutes with 4 processes)
or by a test in `tri/test.js`.

**Removed 2026-10-03 (core review run 20261003-2121; RULES, Core changes): the casting lineage.** Rows that worked and
left the tree with their rules (in git at `7415fd4`, records in INNOVATIONS): casting factory (lid pockets, `factory`,
`lid`), stamps (`stamp`, `grow 4s`), heard-trigger signals, energy (`energy`), machines (conveyor, gated ring door),
import doors (`import`, grown door `live`), heritable machines (`grow`, `heir`, `cycle`), encapsulation and heritable
cells (`wrap`, `cells`), the protocell (`cell`, partial `grown`), feeding and division on kits (`split`, `split g`,
`split o`, `bud`), the grown bud (`budgrow`, `budgrow g`). Proofreading by cooperative binding (option `pLoose`) left with it; a scanner gate is backlog 1.

## Organism on copies: parts and where they come from (2026-10-02, review-intent run 20261002-1751)

The goal is reached when every part below is grown from copies or comes from the environment, and the bud is the same
kind as its parent (so the cycle repeats). State in `budpore`, the nearest demo:

| Part | Role | Source now | Must become |
|---|---|---|---|
| Copy blanks `-?-?-?` | the one food | environment | (stays) |
| Genome `aAaA` | template for its own dockers and fills | founder prepared; copies grown | founder = the parent's own inherited copy |
| Parent ring with `&` walls and one gap (pore) | compartment; spent walls are never copied | prepared (R 7) | the previous generation's bud |
| Parent anchor `W\|` | holds the founder mid-wall | prepared | a part of the ring's kit, same as the bud's anchor role |
| Bud ring (R 5), its half of the opening | the offspring's compartment; its pore after the split | prepared | grown from copies on the parent's seed site (priority 3) |
| Bud anchor `W@\|` (mid-wall, same glue as the parent's) | catches a copy by its low end; its open signal holds the doorway bond until then | prepared | a part of the bud's kit |
| Doorway bond `&` between the rings | holds the pair until the bud has its copy (completion release); its sides are spent after | prepared, walls start spent | made by the bud's growth, with its walls spent before its anchor emits (IDEAS, 2026-10-03) |
| Bud seed site on the parent | where the next bud starts | none | re-made in every bud (closure, priority 2) |

Spent walls cannot be templates, so ring material must come from an exposed, unspent surface (IDEAS, 2026-10-02).
**Closure design (run 20261003-1121, `budKit`; IDEAS, "Closure by design")**: parent and bud are one kind, R 5, a
7-cell pore; the bud ring grows on the parent's seed site `y` (its last cell, beside the pore) from copies made while
earlier buds grew (every cell its own type: 47); the root's pore side is the catching anchor (run 1921: with
heldCopy it moves to arc cell 6's inner side), which then holds the founder (one anchor, roles by time); the doorway is the two pores facing; the hold is the root's `&` seed bond
(completion release after the catch); the seed site is plain glue, so a parent buds again. Nothing in the table above
stays prepared but the first generation and an initial pool of parts (run 20261003-1221, analysis: a steady pool holds
about r + 1 parts of each type per blank near the growing bud, r = openRange; IDEAS, "Closure: what a part pool costs").
Open (direction check, run 20261003-1321): the 7-cell pore is the doorway and afterwards the feeding pore, so both
cells leak strands after the split; the kind needs an opening that a binding event closes to strands (NEXT, priority 2).

## Backlog (top first)

Since run 20261002-1751 all new building goes to the organism on copies (item 0): only copies let the parent construct
its offspring from one uniform food. The casting lineage (kit parts and cast dockers as prepared food), frozen since
then, was removed on 2026-10-03 (core review run 2121).

0. **Organism on copies**, in order (docs/NEXT.md, Direction of run 20261003-1321, with the reasoning): (a) the
   closure kind's bud grown from a part pool, in isolation: done (run 1420, demo `budpool`: works, 1.37 copies per used
   part; found that the last cell must come from inside the sealed pair and that the pool has no per-type regulation,
   both inputs to (b); the last cell from an E source inside: done in isolation, run 1650, check `budpool-e`); (b) the
   kind's opening (run 1650's analysis, IDEAS: one opening per body, only silence widens; an outline with the existing
   core and a core candidate to weigh in the next `explore`): its 7-cell pore is
   both doorway and feeding pore, so after the split both cells leak strands (run 1121) and starve; settle by design
   how the kind feeds without leaking and still passes a strand to its next bud (two openings with a hooded feeding
   pore, a doorway narrowed by the caught strand, or fission), then move the anchor and rerun the transfer on the
   kind's layout (run 20261003-1720, explore: none of the three works in the kind's geometry on paper; proposed
   instead: option `heldCopy`, free strands sterile, so the pores may stay wide; works in isolation, `imprint pzox`); this replaces M2 on `budpore`'s layout, which stopped after four build runs (1921, 2321, 0320, 0751;
   lessons in IDEAS); (c) two generations; (d) the
   casting lineage removed (core review run 2121: 5 marks left, `. @ & | ?`; every kept check's output byte for byte
   the same). Done so far: contact copying (run 0136), a
   sealed cell copies its genome from blanks (`imprint m`), a cell fed through a pore (`imprint p`), a hooded pore
   (`imprint ph`), `budpore` splits with food left (8 of 8, run 1921), completion release (run 0050), closure designed
   (`budKit`, run 1121), the part pool law (run 1221), `budpore`'s dead-end options pruned (24 to 17 `BUD*` variables, run 1351), the bud
   grown from a part pool (`budpool`, run 1420).
0b. **Speed** (harden runs): `budpore` worlds take about 3 minutes, the check suite 28 (run 0950: 1.34x by exact
   changes); lone blocks (`_single`), ring bodies (`_overlap`) and pairs share the time, no single hot spot left.
   Since run 20261003-1321 one `harden` run per twelve (design, not run time, limits the work).

Removed with the casting lineage (2026-10-03; in git at `7415fd4`): the heritable factory cycle, the factory on lid
pockets, the pump through a wall, bud and feed on kits, division by doors. Still open from that list:
1. **Scanner gate / proofreading.** Still relevant on copies (everything exposed is copied, strays too); after item 0.
2. **Membrane growth.** A ring that inserts wall cells while staying closed; after item 0.

## Known issues
- Physics leak fixed 2026-10-02 (run 1050, midpoint check). Left from it: a one-front ring whose last two sites are open can be finished only by a part already inside (the gap is a rhombus
  exactly one block wide: imprint's 28/30 stalls); see docs/IDEAS.md, Pitfalls learned (one-front rings).
- Core inventory and the rule-by-rule locality table: docs/RULES.md.
- Sequential (zip) copying is slower per copy than parallel docking was when it did not deadlock.
- Single runs are noisy; a claim needs a few worlds. Batches stay rare (AGENTS).
