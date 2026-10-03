# Roadmap — typed-triangle world (2026-10-03)

## BIG goal (user, 2026-10-01)

**An organism with a metabolism that constructs its offspring and feeds it until it can live on its own, then
splits it off.** Build every mechanism in isolation, then combine them.

| Module | Biology | Status | Where |
|---|---|---|---|
| Genome: typed chain copied by complementary faces | DNA/RNA | works (zip copying from the high end, no deadlock) | sim.js chain rules |
| Compartment: closed ring membrane, sealed at the default jostle | cell membrane | works | structures.ring |
| Factory: casting pockets turn blanks into the parts copying needs | metabolism | works with prepared pockets; lid pocket casts without stalling | structures.lidPocket, demos factory, lid |
| Stamp: pockets cast kit parts (marks carried by instruction sides) | metabolism makes structure | works: five stamp pockets make a ring membrane's parts from blanks, the ring grows from them (4 of 4 worlds); stamp pockets grow from kits | sim.js _cast, structures.stampInstr, demo stamp |
| Signals: heard triggers wire a sensor side to a flap through hear sides | nerves, signalling | works (lid pocket) | sim.js sg |
| Energy: charged carriers fuel every hinge swing, recharge in a light zone | ATP, light | works | sim.js servo, demo energy |
| Machines: driven hinges, conveyor, gate (pulse doors, interlock) | proteins that move | works on rigid physics (the airlock and the hatch pocket did not; removed 2026-10-02, in git at `c11ed14`) | structures, demos |
| Import: bring raw material through the membrane (pump) | transporters | works: a revolving door carries blanks in selectively | structures.importRing, demo import |
| Heritable machines: parts grown from the chain's seeds | ribozymes, then translation | works: a chain grows a lid pocket from its end seed, copies regrow it; the two-pocket cycle (each generation casts the next one's dockers) reaches a third generation | structures.kit, demos grow, heir, cycle; backlog 1 |
| Encapsulation: a chain grows a membrane around itself | genome-directed compartment | works (seed on the chain end, ring kit seedIn) | demo wrap |
| Heritable cells: copies carry the membrane seed and wrap themselves | cell lineage | works (4 of 4 worlds, 4 cells each; 24 dockers per type, 4 roots) | demo cells |
| Membrane growth | membrane growth | a ring grows from a periodic kit (2R-1 types) and closes (8-13k steps) | structures.ringKit, demo ring; backlog 5 |
| Grown import door: the genome's membrane kit grows its own door | transporter made by the cell | works (4 of 4 worlds, R=6, 2 kit copies per cell, 150000 steps: closes, lets go of the chain, imports 14-16 blanks) | structures.doorRingKit, demo live |
| Protocell: membrane + import + factory + copying inside | cell | works prepared (demo cell); grown from the genome: partial since the midpoint physics (2026-10-02 run 1050: pocket complete 4 of 4 with race-cell supply, membrane with door closes 1 of 4 by 200000 steps, others stop at 72-76 of 78; before: 4 of 4 through wall-pinch hops) | demos cell, grown |
| Budding: second compartment with genome copy and parts | daughter cell | empty daughter rings bud off a parent (open signal, `&` release); with contents not yet | demo bud; backlog 6 |
| Feeding the bud through a shared wall gate | maternal supply | works prepared: parent and bud share a wall with a doorway through both; the parent's stamp pocket feeds the bud (parts, blanks, dockers) | structures.budPair, demo split |
| Division: cut the shared wall when the bud is complete | cytokinesis | works prepared (4 of 4 worlds): when the bud's growth front closes (cap complete, or its anchor has caught a genome copy) every `&` lets go, both doors swing shut and lock, the bud separates | demo split |
| Offspring that lives alone | independent daughter cell | works prepared (4 of 4 worlds): the bud grows its own pocket from parts the parent holds, splits off, imports blanks through its own door and makes a whole genome copy | demo split o |
| Grown bud: the bud ring grows on the parent's seed; its closing opens the doorway; fed cap; splits sealed | budding by growth | works (4 of 4 worlds; the parent's corner cell beside the bud's last site is left out since the midpoint physics): doors held shut by the lock signal of the bud's open wall sites, open once its last cell arrives, shut when its content is complete (no new rule) | structures.grownBud, demo budgrow |
| Grown bud with a genome: the grown bud's anchor catches a copy of the parent's genome, then it splits | budding with segregation | works (3 of 4 check worlds at 300000 steps, 6 of 8 seeds at 400000; the parent with founder and docker pocket is prepared; transport of a copy through the doorway has a long tail) | structures.grownBud anchorGlue, demo budgrow g |
| Segregation: the bud catches a genome copy | chromosome segregation | works: anchor side `\|` catches a copy's seed (the strand placed flush as one body); the parent keeps its founder by its own anchor | sim.js anchor, demo split g |
| Programmable synthesis: contact copying (copy side `?`): a copy blank touching a body becomes a copy of the touched part | templating (membrane heredity) | works in isolation: a ring grown one motif round closes and a second ring grows, from copy blanks only (3 of 4 worlds at 200000 steps; 5 of 8 seeds); a strand is copied from copies of its own triangles (4 of 4) | sim.js _copy, demo imprint |
| Genome on copies inside a cell: a sealed cell copies its genome from copy blanks alone (spent `&` walls are never copied) | replication from uniform nutrients | works (4 of 4 worlds at 60000 steps, 4 strands from 60 blanks, since the 2026-10-02 release locality fix; before it 3 of 4 at 40000; control 2-3, the wall takes most); in a bud pair: see budpore below | demo imprint m |
| Feeding on copies: a cell fed through a pore copies its genome from copy blanks outside (every free side spent `&`, so only what lies inside is copied) | uptake of uniform nutrients | works (4 of 4 worlds, 5-6 strands inside from 150 blanks; controls: no pore 0 copies, plain walls take all; since anchors catch busy strands 7 of 8 seeds: a founder caught during its first copy, before any back was copied, never gets a fill) | demo imprint p |
| Hooded pore: a cell fed through a pore under a hood keeps every strand in (a strand cannot turn from the pore into the corridor under the hood; blanks can) | a cell that does not leak its genome | works (8 of 8 worlds with 4+ strands inside, none lost in 7 of 8; plain pore: 4-9 strands lost in 3 of 8). Needed because free strands outside starve any cell (3 rivals leave an `imprint p` cell 1-2 strands) | demo imprint `ph` |
| Bud pair on copies with a doorway (no doors; held by one completion-release bond `&` that hears the bud anchor's open signal and is cut once the anchor has caught, its freed sides spent; until run 20261003-0050 a latch on a hear chain) | budding on copies | works: the bud's mid-wall anchor `W@\|` catches a copy by its low end and the pair splits with food left in 8 of 8 seeds (run 1921; before: 4 of 8); the bud copying its genome after the split: not yet (one full copy in 2 of 8: the food goes to P's copies outside, the freed latch sides and anchor copies). Sealed variant `c` (run 2321): the doorway joins P and D only, P feeds from blanks inside with its founder under the doorway; splits 7 of 8 with 1-4 strands in the bud; bud copies after the split 1 of 8. Run 0050: completion-release doorway (same splits; sealed pair 0-1 wall copies, was 8-57) and a free triangle's anchor side binds nothing (open pair: 7 of 8 split with food left, bud copies 2 of 8). Run 0320: no doorway width gives M2 (the opening a strand enters by stays after the split; IDEAS, 2026-10-03); the bud's genome as its plug (a strand caught at its gap's edge lies in its wall, a 3-cell pore left): the bud alone copies in 3 of 4, the parent's half still leaks. Run 1221: a copy blank binds no anchor side, so the waiting anchor is no longer copied (open pair seeds 1-4: genome copies 300 of 300, were 265-278; split with food left 3 of 4 as before; sealed pair 12 of 16, was 14 of 16, by divergence only) | demo budpore (`c`) |
| Closure: one kind whose bud is the same kind (`structures.budKit`: R 5, every cell its own type, 7-cell pore, root = catching anchor + seed bond, last cell = seed site) | a lineage | designed, not demonstrated (run 20261003-1121): signal logic checked (test "closure (budKit)": the bud lets go only after its catch and is then in its parent's starting state); the doorway passes strands in 4 of 4 with the founder away from it, 1 of 4 with the founder where the kind holds it; growth from a part pool untested | structures.budKit, demo closure, IDEAS |
| Proofreading / scanner against stray cast types | proofreading, selectivity | idea | backlog 4 |

Every row marked works is guarded by `node tri/check.js` (one line per capability, about 30-40 minutes with 4 processes).

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
earlier buds grew (every cell its own type: 47); the root's pore side is the catching anchor, which then holds the
founder (one anchor, roles by time); the doorway is the two pores facing; the hold is the root's `&` seed bond
(completion release after the catch); the seed site is plain glue, so a parent buds again. Nothing in the table above
stays prepared but the first generation and an initial pool of parts (run 20261003-1221, analysis: a steady pool holds
about r + 1 parts of each type per blank near the growing bud, r = openRange; IDEAS, "Closure: what a part pool costs").
Open (direction check, run 20261003-1321): the 7-cell pore is the doorway and afterwards the feeding pore, so both
cells leak strands after the split; the kind needs an opening that a binding event closes to strands (NEXT, priority 2).

## Backlog (top first)

Since run 20261002-1751 all new building goes to the organism on copies (item 0); the casting lineage (items 1-3, 6:
kit parts and cast dockers as prepared food) is frozen: its checks keep passing, no new features. Reason: only copies
let the parent construct its offspring from one uniform food, and only that route lets the core shrink later (docs/NEXT.md,
"Direction").

0. **Organism on copies**, in order (docs/NEXT.md, Direction of run 20261003-1321, with the reasoning): (a) the
   closure kind's bud grown from a part pool, in isolation (`budKit`, pool at about (r + 1)/2 parts of each type per
   blank; measure completion and the refill: copies made per type used); (b) the kind's opening: its 7-cell pore is
   both doorway and feeding pore, so after the split both cells leak strands (run 1121) and starve; settle by design
   how the kind feeds without leaking and still passes a strand to its next bud (two openings with a hooded feeding
   pore, a doorway narrowed by the caught strand, or fission), then move the anchor and rerun the transfer on the
   kind's layout; this replaces M2 on `budpore`'s layout, which stopped after four build runs (1921, 2321, 0320, 0751;
   lessons in IDEAS); (c) two generations; (d) a
   core review weighs removing the casting lineage now (its checks are about half the check time; marks
   `% ' $ ^ # = ! < > * ~ +`; the copy lineage uses only `. @ & | ?`). Done so far: contact copying (run 0136), a
   sealed cell copies its genome from blanks (`imprint m`), a cell fed through a pore (`imprint p`), a hooded pore
   (`imprint ph`), `budpore` splits with food left (8 of 8, run 1921), completion release (run 0050), closure designed
   (`budKit`, run 1121), the part pool law (run 1221), `budpore`'s dead-end options pruned (24 to 17 `BUD*` variables, run 1351).
0b. **Speed** (harden runs): `budpore` worlds take about 3 minutes, the check suite 28 (run 0950: 1.34x by exact
   changes); lone blocks (`_single`), ring bodies (`_overlap`) and pairs share the time, no single hot spot left.
   Since run 20261003-1321 one `harden` run per twelve (design, not run time, limits the work).

Frozen (casting lineage; kept for reference and checks):
1. **Heritable factory cycle.** Chains grow the pocket that casts the dockers their copying needs (demo `cycle`). Open
   ends (smaller pockets, several seeds per chain, a pocket that casts its own kit) are superseded by contact copying.
2. **Factory on lid pockets** (lid pocket built; factory demo not switched).
3. **Pump through a wall** (carrying lock, fuelled strokes): not needed on copies (a pore with spent walls feeds a cell).
4. **Scanner gate / proofreading.** Still relevant on copies (everything exposed is copied, strays too); after item 0.
5. **Membrane growth.** A ring that inserts wall cells while staying closed; after item 0.
6. **Bud and feed on kits** — works prepared (`split`, `split o` 4 of 4) and grown (`budgrow`, `budgrow g` 6 of 8).
   Frozen: the transport tail, the second bud on the freed seed and food after the split are not pursued here.
7. **Division** — works prepared (completion signal cuts the shared wall; doors shut and lock).

## Known issues
- Physics leak fixed 2026-10-02 (run 1050, midpoint check). Left from it: grown is partial (membrane closes 1 of 4);
  a one-front ring whose last two sites are open can be finished only by a part already inside (the gap is a rhombus
  exactly one block wide: imprint's 28/30 stalls); see docs/IDEAS.md, Pitfalls learned (one-front rings).
- Fuel is spent per fuel triangle, not per swing (two carriers on one triangle are both spent); designed fix in
  docs/NEXT.md at `c11ed14` (core review follow-up 2); casting lineage, frozen. The energy demo is not affected.
- Core inventory and the rule-by-rule locality table: docs/RULES.md.
- Sequential (zip) copying is slower per copy than parallel docking was when it did not deadlock.
- Single runs are noisy; a claim needs a few worlds. Batches stay rare (AGENTS).
