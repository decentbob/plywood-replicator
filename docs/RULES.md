# Rules of the typed-triangle world

The complete rule set of the simulation (`tri/`). Everything an experiment can rely on is here; the code is
`tri/physics.js` (motion) and `tri/sim.js` (chemistry). Every rule is local: it reads one triangle, its bonds, and
the values its bonded partners exposed in the previous pass. No rule counts, traverses, or reads an organism.

## Material

- **One block:** the unit equilateral triangle (side 1). Blocks are conserved: nothing is created or destroyed.
- **Type** (fixed per triangle unless cast): three side glues, counter-clockwise, written as a string such as
  `aB-`, plus marks after a glue (below). Type strings are read side 0, 1, 2.
- **State** (small values that change by rules): charge (charged/discharged), fill, cap, door open, powered.

### Glues
`a..z` pair with `A..Z` (complement = the other case); Greek `α..ω` pair with `Α..Ω` (24 more pairs) and 13 Cyrillic pairs `б..э` / `Б..Э`
(used by kits: 63 pairs in all). `-` is inert and binds nothing. Glue letters are labels: no letter has a rule of
its own (`K` was the casting activator until 2026-10-02; now the mark `%` is). `f`/`F` is used by the structure builder
to weld prepared structures (a builder convention, not a rule).

### Side marks
| Mark | Meaning |
|---|---|
| `<` `>` | hinge: a bond on this side pins only its first (`<`) or second (`>`) corner |
| `*` | trigger: a flap swings while a trigger side is bonded |
| `~` | latch: lets go while its door is triggered or opening |
| `.` | close-only: binds only triangles that are already attached, never a free one (a free triangle binds by no close-only side) |
| `$` | fuel side: a hinge here (or on its partner) spends one charged carrier per swing |
| `+` | hear side: the triangle hears the trigger signal of the partner bonded here (relayed, below) |
| `=` (hinge side) | wide hinge: swings 120 degrees instead of `hingeAngle` |
| `%` | activator side: counts as a casting activator while it is bonded by its glue (the only activator) |
| `@` | attach side: a free triangle that has one binds only by it, and never docks or fills (a part); an attached triangle's `@` side binds only a free part's `@` side (a growth site for parts only) |
| `&` | completion release: the bond on this side is cut once its triangle hears no open signal (its part is complete); the side is then spent and binds nothing again |
| `\|` | anchor: an unbonded anchor side catches a strand end's seed (complementary glue) as it would a free triangle; the strand is placed flush as one body (physics). With `@` it emits the open signal until it has caught one. A free triangle's anchor side binds nothing (since 2026-10-03), and no copy blank binds an anchor side (since 2026-10-03, run 1221): an anchor is never a template |
| `?` | copy side: a free triangle that has one binds only by it, to any free side of an attached triangle but an anchor side (any glue, inert too), takes that triangle's whole type and lets go (contact copying, below) |
| `'` | carried marks (stamp): marks written after an apostrophe (`b.'@`) do nothing on this side; a cast product takes them with this side's instruction glue (below) |
| `^` (hinge side) | hand-off: the flap lets go of its cargo once the cargo is also bonded elsewhere |
| `!` (hinge side) | drop: the flap lets go of its cargo when its swing is complete |
| `#` (hinge side) | pulse door: a trigger opens it, it swings open, resets there, swings back (its second meaning on a trigger side, "let the key go", was removed 2026-10-03: nothing carried it) |

## Physics (`tri/physics.js`): rigid parts, move or stop
- Torus `W x H`. Blocks are rigid unit triangles; a **body** (blocks joined by bonds, hinged ones included) moves and
  turns as one rigid piece. Nothing deforms, overlaps or squeezes (user, 2026-10-01: "no deformation and squeezing is
  fine and might even be good for deterministic machines").
- Each step every body, in random order, proposes a Brownian kick (parameters sigma 0.3, sigmaRot 0.45 per unit
  mass: a lone block, mass sqrt(3)/4, gets a kick of 0.46 and a turn of 1.04 rad standard deviation; a body gets the
  mean kick of its blocks and the turn of their torque, so larger bodies move less), translation and turn as two
  trials. A trial of at most `direct` (1.0) whose end is clear is taken at once if it is no longer than a sub-step
  (0.8); a longer one also needs a clear midpoint (fixed 2026-10-02, merged in autorun run 20261002-1050: with the end
  check alone a move between 0.8 and 1.0 took a block through a gap narrower than itself, e.g. across a one-row wall
  through the pinch at a hole's apex, 95 of 2000 kicks of 0.95; test "a block in a hole of a one-row wall never hops
  across it"). Otherwise the body moves in sub-steps (0.8) as far as it goes
  without overlapping another block, then closes in on the contact (one bisection). So nothing passes through a wall.
  A body that overlaps (rare: binding just placed it) may make a move that reduces its overlap, if the move is at most
  `direct` (fixed 2026-10-01: any length was allowed, and a block touching a wall jumped through it on a kick above
  1.44; cast products and released parts start touching).
  A lone block's trial checks every block within its reach (fixed 2026-10-01: only blocks in the 3 x 3 grid cells
  around its start were checked, so a block near a cell edge could move into a wall cell farther away and leave a
  closed ring).
- A **hinged flap** turns relative to its partner only when the chemistry drives it (below), by the same checked
  move: a blocked flap **stalls** (it does not push). A design must keep a flap's whole sweep clear.
- `pairs`: blocks near enough to bond (centre distance within the two radii plus 0.23).

## Core inventory (2026-10-03, core review run 20261003-0450)
Users measured by running every capability check with the coverage hook (`tri/coverage.js`: which demos' triangles
carry the mark, which rule events fire); 37 checks, 38 demo variants. "Copy lineage" marks what the line now being
built uses (`budpore`, `imprint` and its variants); everything else serves the frozen casting lineage (docs/NEXT.md,
Direction). Dates: when the item entered the core (the repository restarted on 2026-10-01).

| Item | Kind | Used by (demo variants) | Copy lineage | Since |
|---|---|---|---|---|
| `<` `>` hinge | mark | 19 (pockets, doors, conveyor, gate) | - | 10-01 |
| `.` close-only | mark | 22 (pockets, kits, rings; `imprint`'s ring) | yes | 10-01; a free triangle binds by none 10-03 |
| `*` trigger | mark | 20 | - | 10-01 |
| `+` hear | mark | 19 (lid pocket, door panels) | - | 10-01 |
| `=` wide hinge | mark | 18 (lid pocket) | - | 10-01 |
| `@` attach | mark | 19 (kits, rings, growth; `budpore`'s anchor) | yes | 10-01 |
| `&` completion release | mark | 16 (buds, membranes, spent walls of `imprint m/p`, `budpore`'s doorway) | yes | 10-01 |
| `~` latch | mark | 10 (doors) | - | 10-01 |
| `!` drop | mark | 6 (doors, conveyor) | - | 10-01 |
| `%` activator | mark | 16 (all casting) | - | 10-01 |
| `'` carried marks (stamp) | mark | 7 (stamp, grow 4s, split, split g, split o, budgrow, budgrow g) | - | 10-01 |
| `?` copy side | mark | 10 (every `imprint` variant, `budpore`) | yes | 10-02 |
| `$` fuel | mark | 2 (energy, energy dark) | - | 10-01 |
| `\|` anchor | mark | 9 (split g, split o, budgrow g, imprint p variants, budpore) | yes | 10-01; catches busy strands 10-02; a free one binds nothing 10-03; never copied 10-03 (run 1221) |
| `^` hand-off | mark | 1 (conveyor) | - | 10-01 |
| `#` pulse door (hinge side) | mark | 2 (budgrow, budgrow g) | - | 10-01; its trigger-side meaning removed 10-03 |
| busy (30, chain bonds) | relayed signal | 17 (all copying) | yes | 10-01 |
| zip (chain) | relayed signal | 17 (all copying; option `zip: false` removed 10-03) | yes | 10-01 |
| open (`openRange` 120) | relayed signal | 19 (growth; trigger sides deaf while open in 7, `&` release in 12) | yes | 10-01 |
| lock (`lockRange` 12) | relayed signal | 7 (keys deaf: split o, grown, live, cell, import; latches held: + gate; pulse door: budgrow, budgrow g) | - | 10-01 |
| hear (`sigRange` 6) | relayed signal | 19 (lid pocket, doors) | - | 10-01 |
| fn, need, gap, nb | exposed values (one bond) | copying | yes | 10-01 |
| fu, pwE; tb, nbc; actE | exposed values (one bond) | energy; machines; casting | - | 10-01 / pwE 10-02 |
| fill, refractory | state | 17 (copying) | yes | 10-01 |
| spent | state | 16 (`&`) | yes | 10-01 |
| charge | state | 2 (energy) | - | 10-01 |
| caught (`cg`) | state | 5 (pLoose: cycle, heir, grown, grow 12, grow 4s) | - | 10-01 |
| door open, powered, away, hinge rest angle and side | state | machines | - | 10-01 |
| `pLoose` | option | 5 (cycle, heir, grown, grow 12, grow 4s) | - | 10-01 |
| `light` | option (environment) | 1 (energy) | - | 10-01 |

**Counts (2026-10-03):** 16 mark meanings on 16 mark characters (was 17: `#` on a trigger side removed), 5 relayed
signals, 9 exposed one-bond values, 9 states, 2 options (was 4: `zip: false` removed, `latGlue` became the fill rule).
The copy lineage uses 5 marks (`. @ & | ?`), 3 relayed signals (busy, zip, open), the copying values and states, and no
option. Every counted rule event fires in some check (the key release, 0 events in run 0721 and this run, is
removed); of the uncounted branches, the latch's partner reads decided nothing and are removed (Core changes). Larger removals wait for the copy lineage to run a whole cycle (docs/NEXT.md, Direction, finding 2).

Previous inventory (2026-10-02, run 20261002-0721): 17 mark meanings, 5 relayed signals, 9 exposed values, 9 states,
4 options, after removing 8 unused options and merging the glue `K` into `%`.

## Locality audit (2026-10-02, rule by rule)
Every chemistry rule reads only: the triangle's own type, state and bonds; the fixed type of a direct partner (the
glue and marks of the side bonded to it; for a copy blank, its whole type); values a direct partner exposed in the
previous pass; and relayed signals that move one bond per pass and fade (busy, zip, lock, hear, open). Convention
(made explicit 2026-10-02): a rule may also read a direct partner's own current state (its bonds, role, fill, charge)
as it stands when the rule runs; that state was not relayed from anywhere, so information still moves at most one bond
per step. Writes: a rule changes its own state or one of its own bonds; binding sets the state of both parties of the
new bond (the caught triangle's caught/fill flags). Rules that were not local and were replaced: closures that asked
whether two triangles belong to the same body (now one flush tolerance, 0.05), snapping the smaller of two bonding
bodies (removed), copy release reading two bonds away (2026-10-01), copy release reading partners' fill state in the
same pass across two bonds and the flap discharging its hinge partner's carrier (2026-10-02, run 20261002-0335), the
fuel start pulse crossing two bonds in one step (2026-10-02, this audit: the fuel triangle reads the flap's start as
it stood before the servo). Physics, labelled: connected parts move as one rigid body; a flap whose body reaches its
own hinge partner cannot turn; a free triangle binds only into a free site and is placed flush there; a strand caught
by an anchor side `|` moves as one body into a free flush place (all or nothing; never by size).

| Rule (sim.js) | Reads | From where | Verdict |
|---|---|---|---|
| roles | own bonds and bond kinds, own fill | own | local |
| busy, refractory | own bond kinds; partners' busy | previous pass | local (relay) |
| nb, gap, need | next partner's role (its own bonds now), its nb / need / gap | partner current state; previous pass | local (convention) |
| zip | own bonds; next partner's role and its copy bond (TFACE); its zip; the `&` mark of the side bonded to the spare edge | partner current state; previous pass; fixed type | local (convention) |
| lock, open, hear signals | own sides; partners' values | previous pass | local (relay) |
| tb, nbc, actE | own bonds and marks; glue of the partner side bonded to an activator side | own; fixed type | local |
| fu (fuel) | own fuel sides; carrier's charge; own or hinge flap's start pulse (pwE) | partner current state; previous servo | local (fixed 2026-10-02) |
| copy bind | the blank's copy sides; the site's bond and spent state, and its anchor mark (since run 1221) | own; partner current state; fixed type | local |
| glue catch, dock, fill | own role, need, zip, refr, away, deaf; free triangle's side glue and marks | own; fixed type | local; sets the caught triangle's flags |
| `_snap`, anchor capture | is the place free; the strand's body moves as one; the end's role and whether its spare edge is bonded (own bonds) | physics (labelled); own | physics; local |
| glue closure, copy closure | own active sides, need; the other side's glue; flush geometry | own; fixed type; geometry | local |
| release | own face bond; chain partners' fn; template's chain bonds at the ends | previous pass; partner current state | local (fixed 2026-10-02) |
| fn | own fill; chain partners' fill | partner current state | local (convention) |
| loose (pLoose) | own caught flag and bonds; partner side's trigger mark | own; fixed type | local |
| copy (`?`) | the one partner's whole type | fixed type | local (gated, Core changes) |
| cast | own three bonds; each partner's actE; instruction glue and carried marks | partner value from this step's derive; fixed type | local (convention) |
| light | own position and charge | environment (labelled) | environment |
| `&` release | own open signal, own `&` sides | own | local |
| latches | own tb, sg, dOpen, lock | previous pass | local (partners' tb and dOpen no longer read, 2026-10-03) |
| fuel spend | own charge; partner's fuel mark and fu | fixed type; previous pass | local |
| hand-off, drop, swing, interlock, pulse | own marks, bonds, sg, dOpen, lock, pw; cargo's bond count; partners' tb and fu; hinge angle | previous pass; geometry | local |
| flap lock and turn | the flap's body (traversal) | physics (labelled) | physics |

Note: `_pairs` (physics) never lists two free triangles, so no chain of catches through free triangles can form in one
pass; the chemistry relies on this.

## Binding (one rule everywhere)
A free triangle binds an attached triangle's side with the complementary glue when its centre comes within `capture`
(0.6) of the free site beside that side (any orientation), and the site is free: **binding places it** exactly flush
in the site (activation by attachment: free triangles never bind each other). Two attached triangles close a bond
when their sides are flush within 0.05 (rigid parts are exact, so a flap that has arrived, a ring that closes or a
copy closes; two separately moving structures rarely meet that exactly). At probability
`pBond` per step (1). A **discharged** triangle binds nothing. Close-only sides
bind only when both triangles are attached, with one exception: an attached triangle's close-only side still takes a
dock (template face) or a fill (prev edge); glue catch skips it (the casting lineage's dockers `Ay.z` take their fills
`Y--` on the close-only `y.` side; recorded 2026-10-03, see Core changes: a candidate for the next review). A free triangle binds (glue catch, dock or fill) by none of its anchor
`|`, close-only `.` or spent sides (one test for all three ways in; until 2026-10-03 dock and fill skipped it). A free part (a triangle with an attach side `@`) binds only by its
attach side (an attached triangle's `@` side catches only a free part's `@` side; closures between two attached
triangles do not look at `@`). A bonded triangle is never free (fixed 2026-10-02: a docked template that had lost its
chain bonds was caught again), and a side binds only while unbonded. Option `pLoose` (proofreading, cooperative
binding): a triangle caught by glue while free (not by an attach side; docks and fills are not proofread) and held
on one side only lets go with this probability per step; a second matching side holds it. A triangle held by a
trigger side (a key a machine is reading) is not proofread.

**Anchor (2026-10-01):** an attached triangle's unbonded anchor side `|` catches a strand end whose seed (its unbonded
spare edge, also while the strand is being copied: since 2026-10-02, Core changes) carries the complementary glue, when the end's centre comes within
`capture` of the site: the whole strand (with any partial copy docked on it) moves rigidly into the flush place if that place is free (all or nothing).
The capture path (the turn the short way and the move) must be clear in sub-steps, as every move (fixed 2026-10-02:
a strand was pulled through a wall); a strand that already holds the anchor's triangle (one body) is not caught.
This is the only way a strand joins an existing structure (two attached triangles otherwise bond only when flush).
A free triangle's anchor side binds nothing (since 2026-10-03, Core changes: free copies of a waiting anchor
glue-capped strand ends), and no copy blank binds an anchor side (since 2026-10-03, run 1221, Core changes: a waiting
anchor was copied by every blank that reached it).

Which sides of an attached triangle bind by glue: all free sides of a glue-bonded (grown) triangle; the back of a
released strand triangle; the spare edge of a strand end while the strand is not being copied (busy relay 0) and its face is free (an anchor
reads only that the spare edge is unbonded, above). A
strand's high end held by a completion-release side `&` (a membrane growing around the strand) starts no copy.

## Chains and copying
A strand is triangles joined by chain bonds (PREV/NEXT ends). A strand triangle's free edge is a **face** if its
next edge is its prev edge + 1 (counter-clockwise), else a hidden **back**. Strand ends are faces with one spare
(inert) edge. Letters by hidden backs: gap 0 (T), 1 (R), 2 (Z) between faces.
- **dock:** a free triangle binds a template face with the complementary face glue (FACE on the copy end, TFACE on
  the template end).
- **fill:** a free triangle binds the prev edge of a docked or fill triangle while that still needs fills
  (need = 2 - template gap, relayed), by the complement of that edge's glue (an inert edge takes an inert side), so
  backs are heritable. (Until 2026-10-03 fills were glue-agnostic unless the option `latGlue` was set; the copy
  lineage's cell demos and most casting-lineage copy demos set it, `copy`, `factory`, `cell`, `grown` and `imprint g`
  did not; now it is the rule, Core changes.)
- **close:** a copy triangle's free prev edge binds another's free next edge, only when no more fills are needed.
- **release:** a docked triangle lets go of its face once its prev and next partners are complete (each partner
  exposes `fn`: it is a fill or has a fill on a chain bond, from the previous pass, and from the pass a fill binds:
  fixed 2026-10-02, a fill bound in the same pass did not hold the release); at a copy end without a prev (next) bond,
  once the template has no next (prev) bond there; the copy peels
  off as one strand and is a template itself. Copy faces carry the complement of the template's faces, so a copy
  of the copy restores them (the copy reads as the reverse complement).
- **zip:** a face takes a dock only while it hears zip: the strand's high end (no next bond) emits it, a
  face whose dock is bonded passes it on, backs relay it (previous pass). A copy therefore grows from the high end one
  face after another; parallel docking used to enclose an empty dock site between two partial copies (a hole no free
  triangle can reach), which deadlocked copying. (The option `zip: false`, parallel docking, was removed
  2026-10-03: only a test used it.)
- **refractory:** a released face takes no new dock until the busy relay around it (30 on a bonded face, -1 per
  chain bond) is 0, i.e. until the whole copy has let go.
- Removed 2026-10-02 (core review; no demo used them): options `caps` (capped ends emitted two relayed signals; only
  intact strands were copied), `pDissolve`, `triUndock`, `pFray`, `castComp`, `noDock`, `snap: false`; and (run
  20261002-0721) `capture: 0` with `triTol` (binding by a flush side instead of the capture radius).

## Casting (permanent type change)
A triangle bonded by glue on all three sides is in a **pocket**. For each partner: the side bonded to it is the
recognition side, the next side counter-clockwise the activator side, the remaining side the instruction side. If
every partner's activator side is an activator side `%` bonded by its glue, the triangle takes each partner's instruction
glue on the facing side, loses its marks, and lets go of all three. (Copying, not complementing: a complemented
product would stick to its own casters.)
**Stamp (2026-10-01):** the product side also takes the marks the instruction side carries (`'`), and nothing
carried: a caster's instruction side prints glue and marks, so a pocket can cast kit parts (`@`, `.`, `%`, ...) from
blanks. A product never carries marks itself (a stamp cannot be stamped).

**Contact copying (2026-10-02, copy side `?`):** a free triangle with a copy side binds by it to any free (unbonded, not
spent, not anchor) side of an attached triangle, whatever that side's glue and marks (close-only `.`, attach `@` and
trigger sides too; an anchor side `|` is the one mark it skips, since 2026-10-03, run 1221), when its centre comes within `capture` of the site and
the site is free. In the same pass it takes its partner's type (side i+k takes the partner's side j+k, i and j the
bonded sides: the partner turned about the shared edge; glues, marks and carried marks) and lets go. It binds nothing
else (no glue binding, dock or fill) and is never itself a template. Free triangles never bind each other, so only
attached triangles are copied. Gate entry: Core changes.

## Hinges and machines
- A hinge remembers its flush angle (when it bonded, snapped to a multiple of 60 degrees) and which way is away from its partner. While the flap is
  **triggered** (a trigger side bonded, or a triangle welded to it reports a bonded trigger, relayed one bond) it
  is driven `hingeAngle` (60 degrees) away from flush, at 0.025 rad per step while driven out (triggered), 0.05 rad
  per step on its way back (so a returning flap wins a push), turning about its pinned corner and **carrying everything bonded to it**. A flap
  whose body reaches its partner through other bonds is locked.
- **Releases:** hand-off `^`, drop `!`, pulse `#` (above). Without a mark a flap holds its cargo until something
  else cuts the bond (e.g. a cast). A hand-off flap's catch side catches free triangles only (it never closes onto
  the cargo it handed off); a flap's catch side catches only while the flap is at rest. A trigger side binds nothing
  (catch or closure) while its triangle hears an open signal (below): a sensor is live once its structure is complete (a grown door's key,
  a grown pocket's slot; a prepared machine has no attach sides and hears none).
- **Latches** `~` let go while their own triangle is triggered (a trigger side of its own bonded) or hears a trigger
  signal (and hears no lock signal), or while it is a pulse door that is opening (otherwise a door would re-latch
  before moving). (Until 2026-10-03 a latch also read its non-hinge partners' trigger and open state; that never
  decided anything in any check, Core changes.)
  (A latch no longer holds a trigger while it hears an open signal: removed 2026-10-02, it decided nothing in any
  check; a grown door's key side is deaf while its structure hears the open signal, which keeps the door shut.)
- **Open signal (completion):** an attached triangle with an unbonded attach side `@` that has a glue (an open growth front; an inert `@` side emits nothing) emits
  `openRange` (120), relayed -1 per bond (through every bond, so a pocket on a chain hears the chain's growing
  membrane). An `&` side (a spent attachment) and a latch side `~` (an edge meant to come apart) emit nothing. An `&`
  side catches free triangles but never closes onto an attached one (also before it is spent). A grown part that hears none is
  complete; `&` sides let go then and are spent (they never bind again; a bud's seed side: a daughter ring lets go of
  its parent once it has closed; a pore's panel lets go of the wall and the gap cannot be refilled).
- **Heard triggers:** a triangle whose trigger side is bonded has trigger signal `sigRange` (6); a triangle hears the
  signal on its hear sides `+` (partner's previous value - 1). A flap with a heard signal swings. This wires a sensor
  (a trigger side anywhere in a frame) to a flap through a few bonds.
- **Interlock (keys, 2026-10-01):** a trigger side binds nothing while its triangle hears the lock signal (a latch locks its flap only through a closed loop of bonds, so a ring with one open doorway does not hold a second door shut).
- **Interlock:** a triangle with an unbonded latch side emits a lock signal (12, relayed -1 per bond); a closed pulse
  door ignores its key, and its latch holds, while it hears the signal, so only one door of a lock is open at a time.
- Geometry rule: a triangle turning about a corner sweeps its far corner 13% past the chord, so a flap's (and its
  cargo's) whole sweep must be clear, or it stalls. A hinged panel's latch edge must move away from its neighbour
  (check designs by sweeping them, as `structures.ring` does). Lids that close onto a target turn about a corner of
  the slot, so their leading edge arrives flush.

## Energy
Every triangle is charged by default. A flap whose own or hinge partner's type has a fuel side `$` starts a swing
only while a charged carrier is bound to a fuel side of one of the two (the fuel triangle exposes it, `fu` 2). The
start (the flap's `pw` 1) reaches the fuel triangle one pass later (`fu` 3: the start of its own swing or of the flap
whose hinge side is bonded to it), and in the next servo every charged carrier on its fuel sides discharges itself
and, binding nothing, falls off (one bond per pass, fixed 2026-10-02: the flap used to discharge its partner's carrier,
two bonds away). Without fuel a triggered flap holds. Known gap (casting lineage, frozen; designed fix in docs/NEXT.md at `c11ed14`, core review follow-up 2): a fuel triangle with
two carriers spends both on one swing, and two flaps on one fuel triangle can both start on one carrier. **Environment drive** (labelled): free discharged triangles inside
the light zone `light: {x, y, r, p}` recharge at p per step.

## Core changes

Every core change (a new mark, signal, state, rule or rule branch, physics exception, or a default that changes
behaviour everywhere) is entered here before any code (AGENTS.md). Newest first.

### Narrowing: a copy blank binds no anchor side, 2026-10-03, autorun run 20261003-1221 (explore)
1. **Capability and why the goal needs it.** A waiting catching anchor must not eat the food its cell needs. An
   anchor with `@` waits unbonded (it emits the open signal until it catches), and a copy blank binds any free side,
   so every blank that touches it becomes a copy of the anchor cell. Measured in `budpore 300` (seeds 1-4, 200000
   steps, hook counting copy binds on anchor sides): 22 / 22 / 35 / 28 copies of the waiting anchor per world, 7-12%
   of the food, all of it lost to the genome (run 0751 counted 29-69 with food nearer the anchor). In the closure kind
   (`budKit`, run 1121) the catching anchor is the bud's root waiting in the doorway, next to the parent's food.
2. **Designs with the existing core, and why they fail.** Keeping food away from the waiting anchor (sealed `budpore
   c`) works only while the anchor is unreachable, and the closure kind's anchor waits in the doorway the parent's
   strands must cross. Spending the side is impossible (it must stay able to catch). The anchor cannot be covered
   (anything bonded there would be the catch). Candidate (c) of run 0751, *a copy blank binds no `@` side*, also stops
   it but is too wide: a cell whose only free sides are `@` would never be copied, and in a one-row ring that is the
   root (`W@|Y@&b@`), any in-wall anchor cell (its only free side is the anchor) and, while it is the front, every
   cell's forward link; closure (run 1121) needs every cell type copied in each generation, so (c) cuts the lineage.
3. **Locality.** The copy bind already reads the site side's bond and spent state (the attached triangle's own state);
   it now also reads that side's anchor mark (fixed type). Nothing else.
4. **Generality.** An anchor side then binds only by catching a strand end while attached and by nothing while free
   (run 0050): it is a catch side, never a template, as a spent side is never a template. Every cell of a grown ring
   stays copyable while it is the growth front (through its forward link, before the next cell arrives), the anchor
   cell included, so the closure kind keeps its lineage; what is lost is only the copying of an anchor while it waits.
   Affects only copy-lineage worlds with an unbonded anchor near copy blanks (`budpore`, `imprint p` variants); the
   casting lineage has no copy blanks. One glue-catch path of attached `@` anchors is kept (run 0050: removing it
   changed `imprint p`).
5. **What it replaces.** Nothing removed; the anchor's accidental use as a template is closed. Candidate (c) is
   withdrawn in its favour.
6. **Result.** (filled in below once measured)

### Core review 2026-10-03, autorun run 20261003-0450: four removals and one fix
Measured with the coverage hook (`tri/coverage.js`) and a trigger-path hook over every check (37 checks, 38 demo
variants); `node tri/check.js` before: 37 of 37; after all changes: 37 of 37 (the latch change was made after that run
and is output-identical by construction, below).
1. **Removed: `#` on a trigger side ("let the key go").** No structure carries `*` and `#` on one side (only
   `grownBud` writes `#`, on its hinge cells; `ring`'s `pulse` argument was never passed; copies only reproduce
   existing side mark sets): 0 key releases in every check world, here and in run 0721. `#` now has one meaning
   (pulse door). Removes one servo loop.
2. **Removed: option `zip: false`** (parallel docking). No demo set it; one physics test did (now runs with zip, still
   crowded and binding). The zip test keeps its negative case and gained a positive one (the high end docks).
3. **Merged: fills bind by the complement of the edge's glue (`latGlue` is the rule; the option is gone).** Two fill
   rules did one job: glue-agnostic (the default) and glue-matched (the option, set by every cell demo of the copy
   lineage and 7 casting-lineage demos). Glue-agnostic fills were the one binding that ignored glue; with the merge
   every binding of a free triangle except contact copying (`?`) reads glue, and backs are always heritable. An inert
   edge takes an inert side (comp of inert is inert), as under the option. Locality unchanged (the fill reads its own
   side glue and the docked triangle's fixed type). Cost, measured: `copy` (dockers `A--`... and `---` blanks) copies
   slower, because a fill bound by a glued side passes that glue to its prev edge, which then needs a complementary
   fill: complete copies `BBAABA` in 10000 steps, seeds 1-8, 2 2 3 2 2 2 1 2 before, 1 1 1 2 2 2 1 2 after; at 20000
   steps 2-4 before, 1-3 after (seed 2: 1). The `copy` check was seed 1 at 10000 steps (now 1 copy, fail); it is now a
   4-world check (seeds 1-4, 20000 steps, 2+ copies, need 3): 3 of 4. Other outputs changed: `cell` 51 imports (was
   50), `imprint g` 10/11/11 strands in seeds 2-4 (was 11/13/9). Every other check identical in outcome.
4. **Fix (code to RULES): a free triangle binds by none of its anchor `|`, close-only `.` or spent sides**, in glue
   catch, dock and fill (one helper; before, only glue catch tested these, so a free `A|--` docked by its anchor side:
   test "binding: a free triangle docks by none of its anchor, close-only or spent sides" fails on the old code).
   RULES already said so for `.` (binds no free triangle), spent (binds nothing again) and `|` (run 0050's narrowing).
   Changed outputs: `imprint 150p` seed 2 copies to genome 133, wall 1 (was 130, 4); `imprint 150ph` seed 4: 7 of 7
   strands (was 6 of 6). Found by an independent review (still open): on the attached side, a close-only side does
   take docks and fills (the casting lineage's dockers `Ay.z` take fills `Y--` on `y.`); documented in Binding as an
   exception, a candidate for the review that removes the casting lineage.
5. **Removed: a latch reading its non-hinge partners' trigger and open state.** Trigger-path hook over every check
   world: a latch whose own triangle was neither triggered nor hearing a trigger but whose partner was triggered: 0
   passes; a latch whose partner was an open door but not itself: 0 passes. The branch never decided, so outputs are
   identical by construction (spot-checked byte-identical: gate, import, cell, live, grown, split, split o 60000).
   The latch now reads only its own triangle. Kept (measured, decides): a flap triggered by a welded partner's bonded
   trigger read directly (not heard through `+`) is how `budgrow`'s pulse-door hinges swing (`d@-C<#@`, `-fb>#`: 2.1-2.5
   million passes per 4 worlds; every other flap swings on its own trigger or by hearing). Replacing it by a `+` mark on
   those weld sides would leave one trigger path; it needs `grownBud` rebuilt (casting lineage): NEXT, follow-ups.

### Narrowing: a free triangle's anchor side binds nothing, 2026-10-03, autorun run 20261003-0050 (explore)
1. **Capability and why the goal needs it.** A bud that catches a genome copy must not make strand caps. An anchor
   side `|` is meant to do one thing: an attached triangle's unbonded anchor side catches a strand end's seed and the
   strand moves into place. But the side also carries the complementary glue, and glue binding read it on free
   triangles too: a free copy of the bud's anchor cell (`W@|`, a part: copy blanks copy the anchor while it waits)
   bound a strand's low end `w` by glue. Measured in `budpore` (300 blanks, seeds 1-8, run 20261003-0050, with the
   completion-release doorway): 47-94 copies of wall types per world, of which 14-43 were copies of anchor copies
   bound to strands; run 2321 counted 5-17 strand ends capped this way per world (a capped end can no longer be
   caught).
2. **Designs with the existing core, and why they fail.** The anchor's glue must complement the strand end's seed
   (that is what it catches), and every copy of the anchor cell carries the same glue, so no glue choice avoids it.
   Without `@` the copy is not a part and binds by glue on any side, which is worse. Keeping blanks away from the
   anchor until it catches (sealed layout `budpore c`) works only while the anchor is unreachable; spending the anchor
   side is impossible (it must stay able to catch). A free part binding only an attached `@` side (wider) would also
   stop it but changes how every kit root attaches to a strand seed (casting lineage).
3. **Locality.** The rule reads only the mark of the free triangle's own side (fixed type). One test is added to glue
   catch.
4. **Generality.** A free triangle that carries an anchor side binds only by its other sides, as a free part binds
   only by `@` and a free copier only by `?`: catching strands is what attached anchors do, and a free triangle catches
   nothing. Affects only triangles with `|` sides while free: copies of anchor cells (`imprint`, `budpore`) and kit
   parts carrying an anchor (`budgrow g`'s `Z@|` attaches by its other `@` side, as designed).
5. **What it replaces.** Nothing removed; an accidental use of the anchor's glue is closed.
6. **Result (built as the rule).** `budpore 300` seeds 1-8: wall copies 20-35 per world, all direct copies of the
   waiting anchor (was 47-94); genome copies 265-280 of 300 (was 206-253); split with food left 7 of 8 (seed 2 caught
   late, after the food was gone; was 8 of 8); full copies by the bud after the split 2 of 8 (was 3 of 8): M2 not
   moved. Tried first, wider: no anchor side binds by glue, attached ones too (an attached `W|` also glue-caught free
   triangles with a `w` side). That changed `imprint p` seed 4: copying ran faster and most strands left through the
   pore (3 inside of 13, was 6 of 10), so check imprint-pore fell to 2 of 4; with the free-side test alone seed 4 is
   identical to before. Kept narrow. Test: "anchor: a free triangle's anchor side binds nothing". Full check: 36 of 36 pass.

### Generalization: an anchor catches a strand end whether or not the strand is being copied, 2026-10-02, autorun run 20261002-1551 (explore)
1. **Capability and why the goal needs it.** Segregation on copies: a bud catches a copy of its parent's genome while
   the parent is still copying from a steady blank supply, so the bud leaves with food around it and can copy its
   genome after the split ("feeds it until it can live on its own"). Measured before the change (run 0921, `budpore`
   world 3): 52-87 approaches of a strand end to D's anchor, every one while the strand was busy, 0 captures; with 300
   blanks, 0 of 4 worlds split in 200000 steps. A strand end's seed was active only while the strand was not being
   copied (busy relay 0) and its face was free; with blanks around, ends are idle only for moments.
2. **Designs with the existing core that fail or cost.** Fewer blanks (the pair splits only once food is gone: 2 of 4
   worlds with 150 blanks, the bud then has nothing to copy from); an anchor on the low end (busy covers the whole
   strand, range 30); keeping blanks out of D (the shared opening feeds both; a second gap cuts a ring); scarce
   dockers from a pocket (`split g`: works, but brings back casting).
3. **Locality.** The anchor reads less than before: the end triangle's role (a strand end, from its own bonds), its
   spare edge's glue (fixed type) and whether that edge is bonded (its own bond). It no longer reads the busy relay or
   the end's face bond. Capture stays the labelled physics exception: the strand and anything bonded to it (a partial
   copy docked on it) move as one body into a free flush place, all or nothing, along a clear path.
4. **Generality.** Any anchor (`split g`, `split o`, `budgrow g`, `imprint`, `budpore`) catches whichever strand end
   reaches it; seeds of strands for glue binding by free triangles keep both conditions (a kit growing on a strand
   while it is copied would enclose dock sites).
5. **What it replaces.** Two conditions of the anchor's seed test (busy 0, face free). Variants measured on `budpore`
   (300 blanks, 200000 steps, seeds 1-4): without the busy condition only (face must be free): split in 2 of 4 worlds
   while blanks remained (70000 with 100 left, 110000 with 71); without both: 3 of 4 (70000 / 100000 / 95000, with
   100 / 81 / 83 blanks left). Chosen: both removed.
6. **Result (built as the rule).** `budpore` seeds 1-8: the bud catches a copy and the pair splits with food left in
   4 of 8 worlds (seeds 5-8: 1 of 4; seed 7 split once the blanks were gone, 5 and 8 never split); before: 0 of 4.
   `node tri/check.js` 34 of 34 with the change. Cost, measured: `imprint p` (a lone founder in a cell fed through
   a pore) seed 2 caught its founder at step 1001 during its first copy, before any of its backs had been copied:
   pinned at the wall its backs face a narrow wedge that blanks do not reach, so no fill triangle ever exists and
   the copy stays docked for good (1 strand; without the change 7). Seeds 5-8 are identical with and without the
   change, seeds 1, 3, 4 pass (4, 7, 6 strands inside): 7 of 8 worlds (the check needs 3 of 4 and passes). Test: "anchor: catches a strand
   end while the strand is being copied".

### Removal: a latch held by the open signal, 2026-10-02, autorun run 20261002-0721 (core-review)
1. **Capability:** none lost. The branch "a latch holds a trigger while its triangle hears an open signal" was meant to
   keep a grown door shut until its wall is complete. 2. **Measured:** a coverage hook over every capability check (55
   demo worlds) counted the passes where a triggered latch was held by the open signal and not by the lock signal: 0.
   Grown doors stay shut because their key side is deaf while the structure hears the open signal (`_deaf`). 3.
   **Locality:** removing a read (own open signal) only. 4. **Generality:** a design that needs a latch to wait for
   completion can put its trigger behind a key side (deaf while open). 5. **Removes** one condition in the latch rule.
   Outputs of every check are unchanged by construction (the branch never decided).

### Merge: the glue `K` is no longer an activator; `%` is the only one, 2026-10-02, autorun run 20261002-0721 (core-review)
1. **Capability and why.** No new capability: casting keeps its activators. Two rules did one job: a caster's
   activator side counted if it was the glue letter `K` bonded to a `k`, or if it carried the activator mark `%` and
   was bonded by its glue. The first gives one glue letter a meaning of its own, against "glue letters are labels, not
   rules" (AGENTS.md): any structure or kit that happens to use the pair k/K for a weld or a link turns those cells
   into activators without saying so, and the kit builder had to reserve `k` and translate `K` into `%`. After the
   merge an activator is marked where it is, and `k`/`K` is an ordinary pair.
2. **Designs considered.** (a) Keep both (status quo): two branches in `derive` and in the kit builder for one
   meaning. (b) Remove `%` and keep `K`: kits need many distinct activator pairs (each kit cell attaches at one place
   only), so one letter cannot serve them; `%` is the general form. (c) Make activation implicit (any glue-bonded side
   after the recognition side activates): every pocket of glue-bonded triangles would cast, e.g. every ring cell
   bonded on three sides; casting must be marked. Chosen: (b') keep `%`, drop the `K` branch, write `K%` where the
   prepared pockets meant `K` (pocket, lid pocket, test pockets).
3. **Locality.** Unchanged and smaller: a triangle reads its own side's mark and glue and the glue of the partner side
   bonded to it (the partner's fixed type), as before; the `K` branch read the same things.
4. **Generality.** Any structure marks its activators explicitly; kits keep the mark they inherit (the builder no
   longer translates).
5. **What it removes.** One rule branch (glue `K` bonded to `k` activates) and its special case in the kit builder.
   Verified: demo outputs byte-identical before and after (lid, energy, grow 12 (a kit), factory), and
   `node tri/check.js` 30 of 30.

### Copy side `?` (contact copying), 2026-10-02, autorun run 20261002-0136 (explore)
1. **Capability and why the goal needs it.** Programmable synthesis: making any part type from uniform blanks. The
   organism must build its offspring; today every kit part (a bud ring has 54 types, a cell kit ~60) is prepared food
   in the world. Stamp casting makes one part type per pocket, and a pocket's casters carry marks (`'@`) that no cast
   can make (a product never carries marks), so pockets cannot make the pockets that make parts: the loop never
   closes. With contact copying a body's parts multiply from blanks, so a parent's parts become its offspring's parts
   (the offspring is grown from copies), and food can be one uniform blank type.
2. **Designs with the existing core, and why they fail.** (a) Stamp pockets for every part: one pocket (16 parts) per
   part type, and stamp casters cannot be cast (no product carries marks); a second apostrophe level only moves the
   regress one level up. (b) Kit-free growth (periodic motifs, the one-type cap): fewer types, but machines still need
   position-specific parts with `@` sides, and those come from supply or from stamp pockets, (a). (c) Translation with
   casting (a product in a notch beside three strand faces): a site touching three strand triangles needs the strand
   to wrap round it (the triangle lattice's dual has no 3-cycles), the frame must step along the strand, and the
   adaptors carry marks that no cast makes: several new rules, and it still needs a way to multiply the adaptors.
   (d) A copier pocket holding a free template: needs a glue-agnostic hold, a read rule and a release (three rules),
   and the free library parts are taken by growth sites before they are copied.
3. **Locality check.** The copy blank reads only its one bonded partner: that partner's own type (glue and marks of
   its three sides, a fixed property, not relayed state). Binding reads the partner's side and the free site, as every
   binding does. The copy blank changes only its own type and its own bonds. Nothing counts or traverses.
4. **Generality.** Any attached triangle with a free side is a template: ring cells (every cell of a one-row ring),
   pocket parts while their sides are exposed, strand triangles (a strand's own triangles are the dockers of its
   complement), door panels, roots with `&` seeds (a copied root starts a new bud). Cast products and strays are
   copied too: selection must act on what a body exposes, and copying is regulated by the supply of copy blanks
   (import doors).
5. **What it replaces or makes removable.** Stamp casting (`'`) existed to make kit parts; copying makes them without a
   pocket per type. Casting (K/k, `%`) makes dockers from blanks; a genome's dockers can be copied from the strands
   themselves. Once feeding and docker supply are rebuilt on copying, `'`, `%` and the cast rule are candidates for
   removal (a core-review question; not done here).

Rule as built: a copy side `?` on a free triangle binds any free (unbonded, not spent; since run 1221 not anchor) side of an attached triangle,
whatever its glue (inert too), when its centre comes within `capture` of the site and the site is free; a free
triangle with a copy side binds only by it (never by glue, dock or fill). In the same pass it takes its partner's type
(side i+k takes the partner's side j+k, k = 0, 1, 2, where i, j are the bonded sides: the copy is the partner turned
180 degrees about the shared edge) and lets go. Free triangles never bind each other, so only attached triangles are
copied.

## Parameters (defaults)
Physics: `sigma 0.3, sigmaRot 0.45, pairTol 0.35, direct 1.0, subStep 0.8, bisect 1, split true`. Chemistry: `pBond 1,
capture 0.6, triTolClose 0.05, hingeAngle pi/3, hingeRate 0.05, dropTol 0.15, lockRange 12,
sigRange 6, openRange 120`; options `pLoose` (0) and `light` (off).
