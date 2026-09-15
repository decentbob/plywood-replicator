# Polygon Chemistry

An artificial life experiment: a 2D world of small rigid squares governed by one
fixed, universal rule table, in which template replication, copy errors, and
selection come out of the rules rather than being programmed into the creatures.

**Status.** Phase 1 and Phase 2 of the [design](DESIGN.md) run. A seeded strand of
squares is copied by templating, the copies are copied, copy errors appear and are
inherited, a conserved energy budget and end-fraying give turnover, and the
population reaches a steady state. Nothing in the rules mentions "copy",
"strand", or "organism". What happens after that is an open experiment; see
[experiments/RESULTS.md](experiments/RESULTS.md) for what we have measured so far.

## Run it

Open `index.html` in a browser (it loads `src/sim.js`; no build step, no
dependencies). Or serve the folder:

```sh
python3 -m http.server 8000     # then open http://localhost:8000/
```

Click a square to read its state. Side colours are the state machine:

| colour | side | meaning |
|---|---|---|
| green | F | template: a free monomer can dock here |
| red | F | released, waiting for energy |
| yellow | L/R | sticky: a docked unit's side, will bond to its neighbour |
| cyan | L/R | open strand end |
| magenta | K | wants an energy particle |
| bright yellow square | E | energy particle, charged |
| grey small square | E | energy particle, spent |

Headless, for experiments:

```sh
node run.js --steps 100000 --every 5000 --seed 3 --pSoft 0.02 --pCapture 0.05 --pFray 0.0003
node run.js --help            # any key of DEFAULTS in src/sim.js is a flag
node test.js                  # invariants: no junk chains, exact copies, energy accounting, conservation, determinism
node build.js                 # single-file dist/polygon-chemistry.html
```

## The whole chemistry

A unit is a square with four sides: **F** (face), **R**, **K** (back), **L**. Two
monomer types **A** and **B** pair face to face with their own type. A third type
**E** is the energy particle. Each A/B unit carries exactly one internal state:

```
DOCK    a free monomer, or a monomer docked on a template
REPEL   released from its template, needs re-arming
TPL     a template unit
```

Everything a neighbour can read is derived from that state and from which sides
are bonded. The face of a TPL unit reads as `TPL_MM`, `TPL_LF` or `TPL_RF`
according to which lateral sides are bonded, so a docked monomer can tell from its
partner whether it sits in the middle of the template or at an end.

**Bond formation** (the compatibility table, probabilistic and geometric):

| my side | partner side | probability | meaning |
|---|---|---|---|
| F `DOCK` | F `TPL_*`, same type | 1 | docking |
| F `DOCK` | F `TPL_*`, other type | `pSoft` | substitution |
| L `STICKY` | R `STICKY` | 1 | two docked neighbours link |
| L/R `STICKY`/`END` | R/L `END`/`STICKY` | `pLigate` | strands fuse end to end |
| L/R `INERT` | R/L `STICKY`/`END` | `pCapture` | a free monomer joins a strand without a template |
| K `WANT` | E `ON` | 1 | energy docks |

**Transitions** (five rules, one internal state):

| rule | from | to | when |
|---|---|---|---|
| R1 | DOCK | REPEL | docked, and every lateral bond the template partner says I need is in place |
| R2 | DOCK | REPEL | laterally captured without a template |
| R3 | REPEL / TPL | DOCK | no lateral bonds left |
| R4 | REPEL | TPL | an ON energy particle is docked on K (in `strand` mode, also if a lateral neighbour is already TPL) |
| R5 | any | DOCK | fraying: an undocked end unit falls off with probability `pFray` per step |

**Bond holding.** A bond breaks the moment either side reads as `REPEL`,
`INERT`, `IDLE` or `OFF`. That is what releases a finished copy, resets a spent
energy particle, and frees a frayed unit.

There is no completion handshake and no cap type. A copy is released when every
unit is *locally* complete: a middle unit needs both lateral bonds, an end unit
needs one, and the unit learns which it is from its template partner's face
state. Because a docked monomer is rotated 180°, copies are antiparallel and a
child reads as the reverse of its parent, which is why every logged birth is
checked against `reverse(parent)`.

## Physics

Rigid compound bodies in a periodic box with Brownian jostling, soft disc
repulsion between bodies, and digital bonds. When a bond forms, the smaller body
is snapped flush onto the larger one and the two become one rigid body; when a
bond breaks, the body is split into its connected components. Bonds never break
from jostling. A bond forms only if the compatibility table allows it, the two
sides face each other within a tolerance, and the slot the mover would snap into
is empty.

## Layout

```
src/sim.js        the simulation core (browser global PolyChem, or require())
index.html        viewer: canvas, knobs, readout, birth log
run.js            headless runner, CSV + JSON summary + birth log
test.js           invariant tests
build.js          inline everything into dist/polygon-chemistry.html
DESIGN.md         the design document, with a decision log
experiments/      scripts and measured results
```
