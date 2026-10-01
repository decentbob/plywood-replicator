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
| Heritable cells: copies carry the membrane seed and wrap themselves | cell lineage | works (founder and copy each end in their own cell) | demo cells |
| Membrane growth | membrane growth | a ring grows from a periodic kit (2R-1 types) and closes (8-13k steps) | structures.ringKit, demo ring; backlog 5 |
| Grown import door: the genome's membrane kit grows its own door | transporter made by the cell | works (3 of 3 worlds, R=6: closes, lets go of the chain, imports blanks) | structures.doorRingKit, demo live |
| Protocell: membrane + import + factory + copying inside | cell | works prepared (demo cell) and grown from the genome (4 of 4 worlds: pocket and membrane with door grow from the chain's seeds, import, cast, copy inside) | demos cell, grown |
| Budding: second compartment with genome copy and parts | daughter cell | empty daughter rings bud off a parent (open signal, `&` release); with contents not yet | demo bud; backlog 6 |
| Birth: a grown cell makes copies that leave through a pore and start their own cells | reproduction | partial: copies leave and one began its own cell (1 of 4 worlds, 2.6M steps); not yet a complete offspring cell | structures.cellKit, demo birth |
| Feeding the bud through a shared wall gate | maternal supply | works prepared: parent and bud share a wall with a doorway through both; the parent's stamp pocket feeds the bud (parts, blanks, dockers) | structures.budPair, demo split |
| Division: cut the shared wall when the bud is complete | cytokinesis | works prepared (4 of 4 worlds): when the bud's growth front closes (cap complete, or its anchor has caught a genome copy) every `&` lets go, both doors swing shut and lock, the bud separates | demo split |
| Segregation: the bud catches a genome copy | chromosome segregation | works: anchor side `\|` catches a copy's seed (the strand placed flush as one body); the parent keeps its founder by its own anchor | sim.js anchor, demo split g |
| Proofreading / scanner against stray cast types | proofreading, selectivity | idea | backlog 4 |

## Backlog (top first)

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
6. **Bud and feed** — works prepared (demo split, 2026-10-01). Next: grow the pair (a bud ring grown from a seed on
   the parent's wall around its doorway), and a bud that lives alone (its own docker pocket: `split ... o`).
7. **Division** — works prepared (completion signal cuts the shared wall; doors shut and lock).
8. ~~Pocket swing stall~~ — solved by the lid pocket (2026-10-01).

## Known issues
- Airlock and old hatch pocket need squeezing; not working on rigid physics (rebuild airlock; hatch pocket superseded).
- Sequential (zip) copying is slower per copy than parallel docking was when it did not deadlock.
- Single runs are noisy; a claim needs a few worlds. Batches stay rare (AGENTS).
