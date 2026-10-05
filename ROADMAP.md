# Roadmap — typed-triangle world (2026-10-04)

## BIG goal (user, 2026-10-01)

**An organism with a metabolism that constructs its offspring and feeds it until it can live on its own, then
splits it off.** Build every mechanism in isolation, then combine them.

| Module | Biology | Status | Where |
|---|---|---|---|
| Genome: typed chain copied by complementary faces | DNA/RNA | works (zip copying from the high end, no deadlock; only a strand held by its high end is copied, since run 20261004-0820) | sim.js chain rules, demo copy |
| Compartment: closed ring membrane, sealed at the default jostle | cell membrane | works | test "a closed ring keeps its tracers" |
| Membrane growth | membrane growth | a ring grows from a periodic kit (2R-1 types) and closes (8-13k steps) | structures.ringKit, demo ring; backlog 2 |
| Budding: a ring on a seed lets go once complete (open signal, `&` release) | daughter cell | works (test "budding"); with contents: the bud pair and closure rows below | structures.ringKit `bud`, budKit |
| Segregation: the bud catches a genome copy | chromosome segregation | works: anchor side `\|` catches a copy's seed (the strand placed flush as one body); the parent keeps its founder by its own anchor | sim.js anchor, demo budcycle (the doorway pairs `budpore`: retired 2026-10-04, git `882b7d4`) |
| Programmable synthesis: contact copying (copy side `?`): a copy blank touching a body becomes a copy of the touched part | templating (membrane heredity) | works in isolation: a ring grown one motif round closes and a second ring grows, from copy blanks only (3 of 4 worlds at 200000 steps; 5 of 8 seeds); a held strand is copied from copies of its own triangles (4 of 4, 11-15 strands from 200 blanks; until run 0820 a free founder whose copies copied too: 9-15) | sim.js _copy, demo imprint, `g` |
| Genome on copies inside a cell: a sealed cell copies its genome from copy blanks alone (spent `&` walls are never copied) | replication from uniform nutrients | worked (3-4 of 4 worlds at 60000 steps); check retired 2026-10-04 (run 0820): the cell fed through a pore (next row) shows the same with its founder held | demo imprint m |
| Feeding on copies: a cell fed through a pore copies its held genome from copy blanks outside (every free side spent `&`, so only what lies inside is copied); 3 rival strands outside stay sterile | uptake of uniform nutrients | works (4 of 4 worlds: 6-8 strands inside from 150 blanks, wall 0; controls: no pore 0 copies, plain walls take all). Since run 20261004-0820 the founder is held by its high end on an anchor `Z@\|` (the check is run 1720's `imprint-held`, byte for byte); before, an anchor `W\|` held it by its low end and free strands copied (7-8 inside) | demo imprint p (`x`: rivals) |
| Hooded pore: a cell fed through a pore under a hood keeps every strand in (a strand cannot turn from the pore into the corridor under the hood; blanks can) | a cell that does not leak its genome | worked (4 of 4 at the last run; 14 of 14 worlds since run 1520); check retired 2026-10-04 (run 0820): leaked strands are sterile since held copying is the rule, so a leak costs a cell only the strand | demo imprint `ph` |
| Only a held strand is copied (zip starts at a high end only while its spare edge is held by an anchor): free strands, leaked or rival, are sterile | replication from a membrane-attached origin | **the rule since run 20261004-0820** (the option `heldCopy` of run 1720; RULES, Core changes): with 3 rival strands outside a cell keeps 6-8 strands inside in 4 of 4 (on the old rule 1-3, the rivals multiply); a 7-cell pore leaked every copy and the held founder kept copying (4 of 4, 9-11 made; check `imprint-held-w` retired with the rule) | sim.js zip, test "copy: only a strand held by its high end is copied" |
| Bud pair on copies with a doorway (no doors; held by one completion-release bond `&` that hears the bud anchor's open signal and is cut once the anchor has caught, its freed sides spent; until run 20261003-0050 a latch on a hear chain) | budding on copies | **retired 2026-10-04** (run 0820: the corner bud needs no doorway; checks `budpore`, `budpore-c`, `budpore-held`, `budpore-kind` and the demo in git at `882b7d4`; last results: open pair 4 of 4 split with food left, sealed pair 7 of 8, the bud copies 11-14 times after the split with held copying, 3 of 4). Worked: the bud's mid-wall anchor `W@\|` catches a copy by its low end and the pair splits with food left in 8 of 8 seeds (run 1921; before: 4 of 8); the bud copying its genome after the split: not yet (one full copy in 2 of 8: the food goes to P's copies outside, the freed latch sides and anchor copies). Sealed variant `c` (run 2321): the doorway joins P and D only, P feeds from blanks inside with its founder under the doorway; splits 7 of 8 with 1-4 strands in the bud; bud copies after the split 1 of 8. Run 0050: completion-release doorway (same splits; sealed pair 0-1 wall copies, was 8-57) and a free triangle's anchor side binds nothing (open pair: 7 of 8 split with food left, bud copies 2 of 8). Run 0320: no doorway width gives M2 (the opening a strand enters by stays after the split; IDEAS, 2026-10-03); the bud's genome as its plug (a strand caught at its gap's edge lies in its wall, a 3-cell pore left): the bud alone copies in 3 of 4, the parent's half still leaks. Run 1221: a copy blank binds no anchor side, so the waiting anchor is no longer copied (open pair seeds 1-4: genome copies 300 of 300, were 265-278; split with food left 3 of 4 as before; sealed pair 12 of 16, was 14 of 16, by divergence only) | demo budpore (`c`) |
| Closure: one kind whose bud is the same kind (`structures.budKit`: R 5, every cell its own type, 7-cell pore, root = seed bond, catching anchor (with heldCopy `Z@\|` on arc cell 6, run 1921), last cell = seed site) | a lineage | designed, not demonstrated (run 20261003-1121): signal logic checked (test "closure (budKit)", and with the anchor on cell 6: the bud lets go only after its catch and is then in its parent's starting state); the doorway passes strands in 4 of 4 with the founder away from it, 1 of 4 with the founder where the kind held it; growth from a part pool: works in isolation (below). Run 1921: on prepared rings of the kind's geometry with heldCopy and anchors on arc cell 6 the bud catches, splits and copies its strand 3-11 times after the split (8 of 8; check budpore-kind; 4 of 8 with no free strand in P at the start); anchors on the root: 0 of 4 | structures.budKit, demo closure, IDEAS |
| Closure kind's bud from a part pool: a prepared parent grows its bud on its seed site from free parts of all 47 types and copy blanks, then splits on a (stand-in) catch | growth from a shared parts pool | works in isolation (run 20261003-1420: 4 of 4 check worlds, 8 of 8 at 107-200 thousand steps, 0 stray bindings, 1.37 copies per used part at one part per type per blank); the last cell must already be inside the sealed pair (with as many E parts as other types 2 of 4; 40 E parts: 8 of 8); with E's pore side plain (an E source inside, run 20261003-1650) 4 of 4 with no E part in the pool (check budpool-e, retired 2026-10-04: the corner bud's last site opens to the outside); the pool has no per-type regulation | demo budpool, IDEAS |
| One generation from the kit: a parent holding its founder copies it, grows its bud from the part pool, the bud catches a real copy, splits and completes | a cell cycle | works (run 20261003-2221: 8 of 8 seeds split after a real catch and complete, 0 stray; check budcycle). Labelled: the prepared parent, the seeded pool and its harness. The bud usually catches while growing (7 of 8), lets go 10 steps later (openRange 9) and finishes its wall alone; both seed sites then start new buds (8 of 8). The limit after the split was the genome monomers' mix, not the amount of food: back monomers glue-capped strand ends and were copied over and over (run 20261004-0022); since strand ends bind only by an anchor's catch the monomers are made about 1 : 1 : 1 and 47-86% used (was 17-46%), and the bud copies 6-8 times after the split in 3 of 4 worlds (was 0-8, 3 of 4 at 0-3). Two generations: run to 600000 steps, a bud's own bud completes and lets go after its catch in 6 of 6 (check budcycle-2, retired 2026-10-04: budcycle-free shows two generations without the harness) | demo budcycle |
| Three generations from the kit on a slow supply: the bud grows off its parent's corner (seed site on cell 45, `budKit(..., seedAt)`; the pair is never sealed), closed walls `-\|`, no harness; 400 pre-food turning slowly into copy blanks and unused monomers returning to blanks (labelled drives) | a lineage that feeds itself from the environment | works for three generations (run 20261004-1021: 4 of 4 check worlds, generation 3 at 0.74-1.03M steps; without the monomer loop 0 of 4; the chain's own copies after let-go 1-3 per bud in 2 of 4); run 20261004-1721 (build): where the blanks go (census `sinks`, `chain:`): the chains fail because a bud waiting for its catch buds first and its bud catches first; no kit change (E source removed or outside) meets 3 of 4 and keeps generation 3; an oracle that lets a bud bud only after let-go makes every chain bud copy, but slows the lineage and, with a fixed pool, surplus buds starve the next generation (candidate (n)); a burn-down, not yet a metabolism: only blanks change type, so blanks end as kit parts and bodies and the pool's fewest falls to 0-3 (INNOVATIONS run 1021). Before: two generations on 180 pre-food in 3 of 4 (run 0621, check `budcycle-free`, retired in run 1021); census run 0751. Next: a reverse path in the core (NEXT, candidate (m); first step: the lysis side, run 2051, row below) | demo budcycle (defaults), check budcycle-3 |
| Lysis (reverse path): a lysis side `!` lyses the triangle it binds; lysis moves one bond per pass (not across `&` joints) and each lysed triangle cuts its bonds and leaves fresh, so a body comes apart whole into the parts it was made of; a cutter part `z@!-\|-\|` binds only a waiting anchor | death and recycling (predation, lysis) | works in isolation (run 20261004-2051: a bud stuck on its parent's seed site taken apart in 4 of 4 worlds, a new bud on the parent built from 45-46 of its 47 parts in 4 of 4; check `lysis`); in the lineage (run 20261004-2221): a receptor `Г@&` on each body's last cell (`budKit(..., receptor)`, kit only) lets cutters `г@!-\|-\|` take apart only complete buds waiting for a catch: 16 of 16 lysed buds complete, generation 3 in 3 of 4 (check `budcycle-lysis`); a longer lineage from it not yet shown; the open relay's one-pass lag releases roots incomplete in the default lineage too (candidate (o)) | sim.js `_lyse`, demo lysis, budcycle `BCQ`, checks lysis, budcycle-lysis |

Every row marked works is guarded by `node tri/check.js` (one line per capability, about 70 minutes with 4 processes; `budcycle-3` and `budcycle-lysis` 30-50 minutes each)
or by a test in `tri/test.js`.

**Removed 2026-10-03 (core review run 20261003-2121; RULES, Core changes): the casting lineage.** Rows that worked and
left the tree with their rules (in git at `7415fd4`, records in INNOVATIONS): casting factory (lid pockets, `factory`,
`lid`), stamps (`stamp`, `grow 4s`), heard-trigger signals, energy (`energy`), machines (conveyor, gated ring door),
import doors (`import`, grown door `live`), heritable machines (`grow`, `heir`, `cycle`), encapsulation and heritable
cells (`wrap`, `cells`), the protocell (`cell`, partial `grown`), feeding and division on kits (`split`, `split g`,
`split o`, `bud`), the grown bud (`budgrow`, `budgrow g`). Proofreading by cooperative binding (option `pLoose`) left with it; a scanner gate is backlog 1.

## Organism on copies: parts and where they come from (2026-10-02, review-intent run 20261002-1751)

The goal is reached when every part below is grown from copies or comes from the environment, and the bud is the same
kind as its parent (so the cycle repeats). State in `budpore`, then the nearest demo (retired 2026-10-04; the kind of
`budKit` in `budcycle` replaced every prepared row but the first generation, the pool and the food: below):

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
   lessons in IDEAS); (c) two generations: done in run 20261003-2221 with a prepared pool and budpool's harness (demo `budcycle`, checks `budcycle`, `budcycle-2`); (e) the pool without the harness: run 20261004-0251 (build) found food, not the pool, to be the limit (kit copies take three quarters of a stock); closed walls (`-|`) and a food supply give two generations in 2 of 4 (INNOVATIONS); run 20261004-0621 (explore): the bud off the parent's corner (no sealed pair) gives 3 of 4 (check `budcycle-free`); (f) a lineage that does not burn down (direction check run 20261004-0751: the two generations live on a food stock and a part pool that both run down; NEXT priorities 1-2: `heldCopy` as the rule and retire the checks of layouts the lineage left (done, core review run 20261004-0820: 23 checks to 11, the suite 2849 s to 1349 s), then three generations: done in build run 20261004-1021 on a slow supply (check `budcycle-3`), a steady loop not: blanks end as parts and bodies, and returning free parts by a drive empties types; an indefinite lineage needs a reverse path in the core, NEXT candidate (m)); (d) the
   casting lineage removed (core review run 2121: 5 marks left, `. @ & | ?`; every kept check's output byte for byte
   the same). Done so far: contact copying (run 0136), a
   sealed cell copies its genome from blanks (`imprint m`), a cell fed through a pore (`imprint p`), a hooded pore
   (`imprint ph`), `budpore` splits with food left (8 of 8, run 1921), completion release (run 0050), closure designed
   (`budKit`, run 1121), the part pool law (run 1221), `budpore`'s dead-end options pruned (24 to 17 `BUD*` variables, run 1351), the bud
   grown from a part pool (`budpool`, run 1420).
0b. **Speed** (harden runs): a three-generation `budcycle` world takes about 30 minutes, the check suite 36 (run 1421;
   run 0950: 1.34x, run 1421: 1.18x on the suite, both exact); lone blocks (`_single`: about 780 free triangles in a
   `budcycle` world) take most of the time; no single hot spot left inside them.
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
