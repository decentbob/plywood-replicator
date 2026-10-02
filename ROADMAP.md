# Roadmap — typed-triangle world (2026-10-01)

## BIG goal (user, 2026-10-01)

**An organism with a metabolism that constructs its offspring and feeds it until it can live on its own, then
splits it off.** Build every mechanism in isolation, then combine them.

| Module | Biology | Status | Where |
|---|---|---|---|
| Genome: typed chain copied by complementary faces | DNA/RNA | works (zip copying from the high end, no deadlock) | sim.js chain rules |
| Compartment: closed ring membrane, sealed at the default jostle | cell membrane | works | structures.ring |
| Factory: casting pockets turn blanks into the parts copying needs | metabolism | works with prepared pockets; lid pocket casts without stalling | structures.pocket/lidPocket, demos factory, lid |
| Stamp: pockets cast kit parts (marks carried by instruction sides) | metabolism makes structure | works: five stamp pockets make a ring membrane's parts from blanks, the ring grows from them (4 of 4 worlds); stamp pockets grow from kits | sim.js _cast, structures.stampInstr, demo stamp |
| Signals: heard triggers wire a sensor side to a flap through hear sides | nerves, signalling | works (lid pocket) | sim.js sg |
| Energy: charged carriers fuel every hinge swing, recharge in a light zone | ATP, light | works | sim.js servo, demo energy |
| Machines: driven hinges, conveyor, gate, airlock with interlock | proteins that move | works on rigid physics except the airlock (rebuild with swept doors) | structures, demos |
| Import: bring raw material through the membrane (pump) | transporters | works: a revolving door carries blanks in selectively | structures.importRing, demo import |
| Heritable machines: parts grown from the chain's seeds | ribozymes, then translation | works: a chain grows a lid pocket from its end seed, copies regrow it; the two-pocket cycle (each generation casts the next one's dockers) reaches a third generation | structures.kit, demos grow, heir, cycle; backlog 1 |
| Encapsulation: a chain grows a membrane around itself | genome-directed compartment | works (seed on the chain end, ring kit seedIn) | demo wrap |
| Heritable cells: copies carry the membrane seed and wrap themselves | cell lineage | works (4 of 4 worlds, 4 cells each; 24 dockers per type, 4 roots) | demo cells |
| Membrane growth | membrane growth | a ring grows from a periodic kit (2R-1 types) and closes (8-13k steps) | structures.ringKit, demo ring; backlog 5 |
| Grown import door: the genome's membrane kit grows its own door | transporter made by the cell | works (4 of 4 worlds, R=6, 2 kit copies per cell, 150000 steps: closes, lets go of the chain, imports 14-16 blanks) | structures.doorRingKit, demo live |
| Protocell: membrane + import + factory + copying inside | cell | works prepared (demo cell); grown from the genome: partial since the midpoint physics (2026-10-02 run 1050: pocket complete 4 of 4 with race-cell supply, membrane with door closes 1 of 4 by 200000 steps, others stop at 72-76 of 78; before: 4 of 4 through wall-pinch hops) | demos cell, grown |
| Budding: second compartment with genome copy and parts | daughter cell | empty daughter rings bud off a parent (open signal, `&` release); with contents not yet | demo bud; backlog 6 |
| Birth: a grown cell makes copies that leave through a pore and start their own cells | reproduction | partial: copies leave and one began its own cell (1 of 4 worlds, 2.6M steps); not yet a complete offspring cell | structures.cellKit, demo birth |
| Feeding the bud through a shared wall gate | maternal supply | works prepared: parent and bud share a wall with a doorway through both; the parent's stamp pocket feeds the bud (parts, blanks, dockers) | structures.budPair, demo split |
| Division: cut the shared wall when the bud is complete | cytokinesis | works prepared (4 of 4 worlds): when the bud's growth front closes (cap complete, or its anchor has caught a genome copy) every `&` lets go, both doors swing shut and lock, the bud separates | demo split |
| Offspring that lives alone | independent daughter cell | works prepared (4 of 4 worlds): the bud grows its own pocket from parts the parent holds, splits off, imports blanks through its own door and makes a whole genome copy | demo split o |
| Grown bud: the bud ring grows on the parent's seed; its closing opens the doorway; fed cap; splits sealed | budding by growth | works (3 of 4 worlds since the midpoint physics; the parent's corner cell beside the bud's last site is left out): doors held shut by the lock signal of the bud's open wall sites, open once its last cell arrives, shut when its content is complete (no new rule) | structures.grownBud, demo budgrow |
| Grown bud with a genome: the grown bud's anchor catches a copy of the parent's genome, then it splits | budding with segregation | works (3 of 4 check worlds, 6 of 8 seeds, 400000 steps; the parent with founder and docker pocket is prepared; transport of a copy through the doorway has a long tail) | structures.grownBud anchorGlue, demo budgrow g |
| Segregation: the bud catches a genome copy | chromosome segregation | works: anchor side `\|` catches a copy's seed (the strand placed flush as one body); the parent keeps its founder by its own anchor | sim.js anchor, demo split g |
| Programmable synthesis: contact copying (copy side `?`): a copy blank touching a body becomes a copy of the touched part | templating (membrane heredity) | works in isolation: a ring grown one motif round closes and a second ring grows, from copy blanks only (3 of 4 worlds at 200000 steps; 5 of 8 seeds); a strand is copied from copies of its own triangles (4 of 4) | sim.js _copy, demo imprint |
| Genome on copies inside a cell: a sealed cell copies its genome from copy blanks alone (spent `&` walls are never copied) | replication from uniform nutrients | works (4 of 4 worlds at 60000 steps, 4 strands from 60 blanks, since the 2026-10-02 release locality fix; before it 3 of 4 at 40000; control 2-3, the wall takes most); in the bud pair (`split q`) partial, 1 of 4 | demos imprint m, split q |
| Feeding on copies: a cell fed through a pore copies its genome from copy blanks outside (every free side spent `&`, so only what lies inside is copied) | uptake of uniform nutrients | works (4 of 4 worlds, 5-6 strands inside from 150 blanks; controls: no pore 0 copies, plain walls take all) | demo imprint p |
| Bud pair on copies with a doorway (no doors; held by one latch bond released by the bud anchor's trigger side, so no wall hears an open signal) | budding on copies | partial: the bud's anchor rarely catches (strands are busy whenever food is plentiful; core change candidate in docs/NEXT.md) | demo budpore |
| Proofreading / scanner against stray cast types | proofreading, selectivity | idea | backlog 4 |

Every row marked works is guarded by `node tri/check.js` (one line per capability, about 29 minutes).

## Backlog (top first)

0. **Organism on copies** (contact copying works in isolation, 2026-10-02). Feed the grown bud from copies of the
   parent's parts (the parent's ring as the bud ring's template: same kit), dockers from copies of the genome; then ask
   a core-review whether stamp marks (`'`) and casting can be removed. Exposure: only free sides are copied (enclosed
   cells of a complete pocket are not; inside faces only from inside). Done 2026-10-02: a sealed cell copies its genome
   from copy blanks alone (`imprint m`; walls with spent `&` sides are not copied). Open: the bud pair on copies (`split
   q`, 1 of 4: blanks are one batch, copies stall, strands rarely reach D's anchor) and a way to bring copy blanks in
   (NEXT, core change candidate; 2026-10-02 run 0921: not needed, a pore with spent walls feeds a cell, `imprint p`). Open:
   the bud's anchor catches no busy strand (NEXT, core change candidate run 0921; demo `budpore`).

1. **Heritable factory cycle.** Chains grow the pocket that casts the dockers their copying needs (demo `cycle`; see
   INNOVATIONS). Then: smaller pockets (fewer kit types, faster growth); several seeds per chain (`latGlue` backs);
   a pocket that casts its own kit types. Marks now travel with cast glue (stamp, `'` carried marks, 2026-10-01): a
   pocket casts kit parts. Remaining blockers: one pocket per part type, and a product carries nothing (stamp casters
   cannot be cast). Needs programmable casting (see IDEAS: part templating, translation).
2. **Factory on lid pockets.** Switch the factory demo to lid pockets (done: copy deadlock fixed by zip; lid pocket
   built) and measure generations.
3. **Pump through a wall.** A carrying lock: the hatch pocket carries a key from an outer slot into an enclosed
   centre; a pulse door on the centre's inner wall opens while the hatch holds its return (interlock). Fuel each
   stroke (energy), so pumping is directional and costs carriers.
4. **Scanner gate / proofreading.** A pocket whose instructions equal what it recognizes (a checkpoint) between two
   doors admits only triangles matching on all three sides; or cooperative binding (a part stays bound only once a
   second side matches). Needed once casting makes stray types.
5. **Membrane growth.** A ring that inserts wall cells (a growth site with a seed glue, wall kit types), staying closed.
6. **Bud and feed** — works prepared (demo split, 2026-10-01), including a bud that lives alone (`split ... o`, 4 of 4).
   Grown pair: works for a cap (`budgrow`, 2026-10-02: the bud ring grows on the parent's seed) and for a genome copy
   (`budgrow ... g`, 2026-10-02 run 1351: 6 of 8 seeds). Next: food for the grown bud after the split (a pore with
   spent walls, `imprint p`), a pocket in the grown bud; a second bud already starts on the parent's freed seed.
7. **Division** — works prepared (completion signal cuts the shared wall; doors shut and lock).
8. ~~Pocket swing stall~~ — solved by the lid pocket (2026-10-01).

## Known issues
- Physics leak fixed 2026-10-02 (run 1050, midpoint check). Left from it: grown is partial (membrane closes 1 of 4);
  a one-front ring whose last two sites are open can be finished only by a part already inside (the gap is a rhombus
  exactly one block wide: imprint's 28/30 stalls); see docs/NEXT.md.
- Fuel is spent per fuel triangle, not per swing (two carriers on one triangle are both spent); designed fix in
  docs/NEXT.md (follow-up 2). The energy demo is not affected.
- Core inventory and the rule-by-rule locality table: docs/RULES.md.
- Airlock and old hatch pocket need squeezing; not working on rigid physics (rebuild airlock; hatch pocket superseded).
- Sequential (zip) copying is slower per copy than parallel docking was when it did not deadlock.
- Single runs are noisy; a claim needs a few worlds. Batches stay rare (AGENTS).
