# Roadmap — typed-triangle world (2026-10-01)

## BIG goal (user, 2026-10-01)

**An organism with a metabolism that constructs its offspring and feeds it until it can live on its own, then
splits it off.** Build every mechanism in isolation, then combine them.

| Module | Biology | Status | Where |
|---|---|---|---|
| Genome: typed chain copied by complementary faces | DNA/RNA | works (zip copying from the high end, no deadlock) | sim.js chain rules |
| Compartment: closed ring membrane, sealed at the default jostle | cell membrane | works | structures.ring |
| Factory: casting pockets turn blanks into the parts copying needs | metabolism | works with prepared pockets; lid pocket casts without stalling | structures.pocket/lidPocket, demos factory, lid |
| Signals: heard triggers wire a sensor side to a flap through hear sides | nerves, signalling | works (lid pocket) | sim.js sg |
| Energy: charged carriers fuel every hinge swing, recharge in a light zone | ATP, light | works | sim.js servo, demo energy |
| Machines: driven hinges, conveyor, gate, airlock with interlock | proteins that move | works | structures, demos |
| Import: bring raw material through the membrane (pump) | transporters | not yet (lock works, pump does not) | backlog 3 |
| Heritable machines: parts grown from the chain's seeds | ribozymes, then translation | arms inherited; pocket kit not yet | backlog 1 |
| Membrane growth | membrane growth | not yet | backlog 5 |
| Budding: second compartment with genome copy and parts | daughter cell | not yet | backlog 6 |
| Feeding the bud through a shared wall gate | maternal supply | not yet | backlog 6 |
| Division: cut the shared wall when the bud is complete | cytokinesis | not yet | backlog 7 |
| Proofreading / scanner against stray cast types | proofreading, selectivity | idea | backlog 4 |

## Backlog (top first)

1. **Grown pocket (heritable factory).** Design a pocket kit: the hatch pocket's cells as a spanning tree from one
   seed glue, one glue pair per tree edge, closure glues for the remaining shared edges; kit types in supply. Grow it
   from a chain-end seed; check it forms on the founder, regrows on copies, and casts. Then `latGlue` backs so a chain
   carries several seeds (different chains grow different parts), and a pocket that casts its own kit types.
2. **Factory on lid pockets.** Switch the factory demo to lid pockets (done: copy deadlock fixed by zip; lid pocket
   built) and measure generations.
3. **Pump through a wall.** A carrying lock: the hatch pocket carries a key from an outer slot into an enclosed
   centre; a pulse door on the centre's inner wall opens while the hatch holds its return (interlock). Fuel each
   stroke (energy), so pumping is directional and costs carriers.
4. **Scanner gate / proofreading.** A pocket whose instructions equal what it recognizes (a checkpoint) between two
   doors admits only triangles matching on all three sides; or cooperative binding (a part stays bound only once a
   second side matches). Needed once casting makes stray types.
5. **Membrane growth.** A ring that inserts wall cells (a growth site with a seed glue, wall kit types), staying closed.
6. **Bud and feed.** A second ring grown against the parent with a shared wall and gate; the parent's chain copy
   moves through; the parent's factory feeds parts across.
7. **Division.** A local completion signal (relayed) that cuts the shared wall (latches) once the bud has its genome
   and factory.
8. ~~Pocket swing stall~~ — solved by the lid pocket (2026-10-01).

## Known issues
- Sequential (zip) copying is slower per copy than parallel docking was when it did not deadlock.
- Single runs are noisy; a claim needs a few worlds. Batches stay rare (AGENTS).
