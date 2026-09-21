# Polygon Chemistry

An artificial life experiment: a 2D world of small rigid squares governed by one
fixed, universal rule table, in which template replication, copy errors, and
selection come out of the rules rather than being programmed into the creatures.

**Status.** Phase 1 and Phase 2 of the [design](DESIGN.md) run. A seeded strand of
squares is copied by templating, the copies are copied, copy errors appear and are
inherited, a conserved energy budget and end-fraying give turnover, and the
population reaches a steady state. Nothing in the rules mentions "copy",
"strand", or "organism". In a well-mixed world the shortest strand wins, as
Spiegelman found, by 25:1 to 60:1. One more local rule reverses that in a
head-to-head race: make a lone docked monomer unstable (a linked run is not), so
copying has to nucleate, and longer templates nucleate faster. At an undocking
rate of 0.1 per step the 6-mer out-reproduces the dimer nine to one. In an open
population with turnover the same rule has not yet won: at the densities tried,
fraying erodes long templates faster than copies nucleate. That window is the
next thing to map.
See [experiments/RESULTS.md](experiments/RESULTS.md) for the measurements.

## Run it

Open `index.html` in a browser (it loads `src/sim.js`; no build step, no
dependencies). Or serve the folder:

```sh
python3 -m http.server 8000     # then open http://localhost:8000/
```

The view opens zoomed on the seed strand. Scroll to zoom, drag to pan, click a
square to read its state and its partners' states, click an event in the feed to
jump to it. Every side of every square is drawn in the colour of its state, every
bond is a white tie across the shared edge, and every face has a notch so you can
see which way a free monomer points:

| colour | side | meaning |
|---|---|---|
| grey-blue | F | free monomer's face: will dock on a template of its type |
| green | F | template: a free monomer can dock here |
| orange | K | an `ABA` motif's back: recharges spent energy (motif rule) |
| red | F | released, waiting for energy |
| dark | L/R | inert: a free monomer's lateral sides never bond |
| yellow | L/R | sticky: a docked unit's side, will bond to its neighbour |
| cyan | L/R | open strand end |
| white | L/R | bonded |
| magenta | K | wants an energy particle |
| bright yellow square | E | energy particle, charged |
| grey small square | E | energy particle, spent |

Headless, for experiments:

```sh
node run.js --steps 100000 --every 5000 --seed 3 --pSoft 0.02 --pCapture 0.05 --pFray 0.0003
node run.js --help            # any key of DEFAULTS in src/sim.js is a flag
node test.js                  # invariants: no junk chains, exact copies, energy accounting, conservation, determinism
node build.js                 # single-file dist/polygon-chemistry.html
./experiments/run_all.sh      # every experiment batch, about 35 minutes on 4 cores
node experiments/summarize.js # tables from experiments/out/*.csv
```

## The whole chemistry

A unit is a square with four sides that are fixed for life: **F** (face), **R**,
**K** (back), **L**. The sides are not interchangeable. Only a face docks, and only
on the face of a template of the same type; L bonds only to a neighbour's R, so
every square has at most one neighbour on each lateral side and chains cannot
branch; the back takes only an energy particle. That is why forms are
one-dimensional. The `pStack` knob adds one row to the table (back of a template to
back of a template) and is the smallest change that lets them leave one dimension.

Two monomer types **A** and **B** pair face to face with their own type. A third
type **E** is the energy particle. Each A/B unit carries exactly one internal state:

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
| K `WANT` | E `ON` | 1 | energy docks and is spent |
| K `CHARGE` | E `OFF` | 1 | a spent particle recharges at an `ABA` motif's back (motif rule) |
| L `INERT` | R `INERT` | `pSpont` | two free monomers join: life without a seed |

A docked unit's free lateral side reads `STICKY` only where its template partner's face says the template continues; at the template's end it reads `END`. That is what stops copies docked on two different templates from linking into chimeras.

**Transitions** (six rules, one internal state):

| rule | from | to | when |
|---|---|---|---|
| R1 | DOCK | REPEL | docked, and every lateral bond the template partner says I need is in place |
| R2 | DOCK | REPEL | laterally captured without a template |
| R3 | REPEL / TPL | DOCK | no lateral bonds left |
| R4 | REPEL | TPL | an ON energy particle is docked on K (in `strand` mode, also if a lateral neighbour is already TPL) |
| R5 | REPEL / TPL | DOCK | fraying: an undocked end unit falls off with probability `pFray` per step |
| R6 | DOCK (docked) | DOCK (free) | cooperativity: a docked monomer with no lateral bonds falls off with probability `pUndock` per step |
| R7 | any | same, one lateral bond broken | radiation: a lateral bond breaks with probability `pBreak` scaled by the two blocks' resistances `resA`, `resB` |

**Bond holding.** A bond breaks the moment either side reads as `REPEL`,
`INERT`, `IDLE` or `OFF`. That is what releases a finished copy, resets a spent
energy particle, and frees a frayed unit.

**Energy.** Energy particles are half-size squares of a third type that never
chain. A charged one docks on the back of a released block, the block re-arms,
the particle is left spent and drifts off; nothing is absorbed and the count is
fixed. Spent particles recharge at a background rate, in the sun patch, or, with
the motif rule, at the back of a `B` block flanked by two `A`s, which makes energy
income a property of sequence.

There is no completion handshake and no cap type. A copy is released when every
unit is *locally* complete: a middle unit needs both lateral bonds, an end unit
needs one, and the unit learns which it is from its template partner's face
state. Because a docked monomer is rotated 180°, copies are antiparallel and a
child reads as the reverse of its parent, which is why every logged birth is
checked against `reverse(parent)`.

## Physics

Nothing bigger than a square exists in the physics. Each square gets its own
Brownian kick; two squares that are not bonded may not overlap; a bond is a
constraint that the two bonded sides lie flush. Both kinds of constraint are
enforced the same way, by nudging the two squares involved, 24 passes per step.
With the `hinge` knob, lateral bonds between free squares pin only their shared
back corner and may bend up to 90°, so free strands curl and can close into rings
by ligation, while a strand being copied is straightened by the docking itself. A
hinge forms where two back corners touch, which is what lets a ring's last bond
close. With `slack`, a flush bond tolerates a small corner gap, a trapezoid, so a
gently curved chain is a rest state; 0.1 is safe and raises the copying rate. Chains are straight because a row of flush
constraints is straight, not because anything holds a chain. Bonds never break
from jostling. A bond forms only if the compatibility table allows it, the two
sides face each other within a tolerance (30° for docking, 10° for side-to-side
links), and the moving square would land in an empty spot. A monomer that
undocks is pushed off the face it left. All soft probabilities are per step of
contact, and a contact lasts several steps, so nominal values overstate softness
(see the design doc, section 6). The functions that find connected components
are observation only and never feed back into the dynamics.

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
