# Roadmap — typed-triangle world (2026-10-02)

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
| Bud pair on copies with a doorway (no doors; held by one latch bond released by the bud anchor's trigger side, so no wall hears an open signal) | budding on copies | partial: since anchors catch busy strands (core change 2026-10-02, run 1551) the bud catches a copy and splits with food left in 4 of 8 seeds (before: 0 of 4); the bud does not yet copy its genome after the split (its anchor sits beside a corner) | demo budpore |
| Proofreading / scanner against stray cast types | proofreading, selectivity | idea | backlog 4 |

Every row marked works is guarded by `node tri/check.js` (one line per capability, about 40 minutes with 4 processes).

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
| Bud anchor `Z@\|*` | catches a copy; its trigger releases the latch | prepared | a part of the bud's kit |
| Latch bond `~` between the rings | holds the pair until the bud has its copy | prepared | made by the bud's growth |
| Bud seed site on the parent | where the next bud starts | none | re-made in every bud (closure, priority 2) |

Spent walls cannot be templates, so ring material must come from an exposed, unspent surface (IDEAS, 2026-10-02).

## Backlog (top first)

Since run 20261002-1751 all new building goes to the organism on copies (item 0); the casting lineage (items 1-3, 6:
kit parts and cast dockers as prepared food) is frozen: its checks keep passing, no new features. Reason: only copies
let the parent construct its offspring from one uniform food, and only that route lets the core shrink later (docs/NEXT.md,
"Direction").

0. **Organism on copies**, in order (docs/NEXT.md, Direction, priorities): (a) the bud copies its genome after the
   split (`budpore`, mid-wall anchor in D); (b) closure by design: one organism kind whose bud is the same kind (ring
   size, anchor roles, seed site, the first motif round), "designed, not demonstrated" counts; (c) grow the bud ring
   from copies on the parent's seed site (as `imprint`'s rings; fix the one-front 28/30 stall); (d) two generations;
   then (e) a core review of removing casting, stamp, fuel and machine marks that only the frozen lineage uses
   (`% ' $ ^ # = ! < > +`). Done so far: contact copying (run 0136), a sealed cell copies its genome from blanks
   (`imprint m`), a cell fed through a pore (`imprint p`), anchors catch busy strands and `budpore` splits with food
   left in 4 of 8 seeds (run 1551).
0b. **Speed** (harden runs): `budpore` worlds take about 4 minutes, the check suite 40; lone blocks dominate physics
   (`_single`).

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
  exactly one block wide: imprint's 28/30 stalls); see docs/NEXT.md, Pitfalls (one-front rings).
- Fuel is spent per fuel triangle, not per swing (two carriers on one triangle are both spent); designed fix in
  docs/NEXT.md at `c11ed14` (core review follow-up 2); casting lineage, frozen. The energy demo is not affected.
- Core inventory and the rule-by-rule locality table: docs/RULES.md.
- Sequential (zip) copying is slower per copy than parallel docking was when it did not deadlock.
- Single runs are noisy; a claim needs a few worlds. Batches stay rare (AGENTS).
