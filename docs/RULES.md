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
`a..z` pair with `A..Z` (complement = the other case); Greek `α..ω` pair with `Α..Ω` (24 more pairs, used by kits). `-` is inert and binds nothing. `k`/`K` is the casting
activator pair (by convention only). `f`/`F` is used by the structure builder to weld prepared structures.

### Side marks
| Mark | Meaning |
|---|---|
| `<` `>` | hinge: a bond on this side pins only its first (`<`) or second (`>`) corner |
| `*` | trigger: a flap swings while a trigger side is bonded |
| `~` | latch: lets go while its door is triggered or opening |
| `.` | close-only: binds only triangles that are already attached, never a free one |
| `$` | fuel side: a hinge here (or on its partner) spends one charged carrier per swing |
| `+` | hear side: the triangle hears the trigger signal of the partner bonded here (relayed, below) |
| `=` (hinge side) | wide hinge: swings 120 degrees instead of `hingeAngle` |
| `%` | activator side: counts as a casting activator while it is bonded by its glue (like K bonded to k) |
| `@` | attach side: a free triangle that has one binds only by it, and never docks or fills (a part); an attached triangle's `@` side binds only a free part's `@` side (a growth site for parts only) |
| `&` | completion release: the bond on this side is cut once its triangle hears no open signal (its part is complete); it never re-closes |
| `^` (hinge side) | hand-off: the flap lets go of its cargo once the cargo is also bonded elsewhere |
| `!` (hinge side) | drop: the flap lets go of its cargo when its swing is complete |
| `#` (hinge side) | pulse door: a trigger opens it, it swings open, resets there, swings back |
| `#` (trigger side) | the key is let go one pass after it was read (not carried) |

## Physics (`tri/physics.js`): rigid parts, move or stop
- Torus `W x H`. Blocks are rigid unit triangles; a **body** (blocks joined by bonds, hinged ones included) moves and
  turns as one rigid piece. Nothing deforms, overlaps or squeezes (user, 2026-10-01: "no deformation and squeezing is
  fine and might even be good for deterministic machines").
- Each step every body, in random order, proposes a Brownian kick (sigma 0.3, sigmaRot 0.45 for a lone block; a body
  gets the mean kick of its blocks and the turn of their torque, so larger bodies move less), translation and turn
  as two trials. Each trial moves in sub-steps (0.3) as far as it goes without overlapping another block, then closes
  in on the contact (bisection). So nothing passes through a wall. A body that overlaps (rare: binding just placed
  it) may make any move that reduces its overlap.
- A **hinged flap** turns relative to its partner only when the chemistry drives it (below), by the same checked
  move: a blocked flap **stalls** (it does not push). A design must keep a flap's whole sweep clear.
- `pairs`: blocks near enough to bond (centre distance within the two radii plus 0.23).

## Binding (one rule everywhere)
A free triangle binds an attached triangle's side with the complementary glue when its centre comes within `capture`
(0.6) of the free site beside that side (any orientation), and the site is free: **binding places it** exactly flush
in the site (activation by attachment: free triangles never bind each other). Two attached triangles close a bond
when their sides are flush: exactly (0.05) inside one body (parts are exact, so a gap means a flap has not arrived);
separate bodies do not close (option `closeBodies`: within 0.22, the smaller body placed flush; off, since neighbouring
membranes would fuse). At probability
`pBond` per step (1). A **discharged** triangle binds nothing. Close-only sides
bind only when both triangles are attached. A free part (a triangle with an attach side `@`) binds only by its
attach side. Option `pLoose` (proofreading, cooperative binding): a triangle caught while free (not by an attach side) and held
on one side only lets go with this probability per step; a second matching side holds it.

Which sides of an attached triangle bind by glue: all free sides of a glue-bonded (grown) triangle; the back of a
released strand triangle; the spare edge of a strand end while the strand is not being copied (busy relay 0). A
strand's high end held by a completion-release side `&` (a membrane growing around the strand) starts no copy.

## Chains and copying
A strand is triangles joined by chain bonds (PREV/NEXT ends). A strand triangle's free edge is a **face** if its
next edge is its prev edge + 1 (counter-clockwise), else a hidden **back**. Strand ends are faces with one spare
(inert) edge. Letters by hidden backs: gap 0 (T), 1 (R), 2 (Z) between faces.
- **dock:** a free triangle binds a template face with the complementary face glue (FACE on the copy end, TFACE on
  the template end).
- **fill:** a free triangle binds the prev edge of a docked or fill triangle while that still needs fills
  (need = 2 - template gap, relayed), glue-agnostic (option `latGlue`: the fill needs the complement of the lateral
  glue, which makes backs heritable).
- **close:** a copy triangle's free prev edge binds another's free next edge, only when no more fills are needed.
- **release:** a docked triangle lets go of its face once its prev and next partners are complete; the copy peels
  off as one strand and is a template itself. Copy faces carry the complement of the template's faces, so a copy
  of the copy restores them (the copy reads as the reverse complement).
- **zip (default on):** a face takes a dock only while it hears zip: the strand's high end (no next bond) emits it, a
  face whose dock is bonded passes it on, backs relay it (previous pass). A copy therefore grows from the high end one
  face after another; parallel docking used to enclose an empty dock site between two partial copies (a hole no free
  triangle can reach), which deadlocked copying. Option `zip: false` restores parallel docking.
- **refractory:** a released face takes no new dock until the busy relay around it (30 on a bonded face, -1 per
  chain bond) is 0, i.e. until the whole copy has let go.
- options: `caps` (capped ends emit relayed signals; only intact strands are copied), `pDissolve` (with caps:
  strands missing a signal fall apart), `triUndock` (lone docked triangles leave), `pFray` (single-bond triangles
  not being copied let go).

## Casting (permanent type change)
A triangle bonded by glue on all three sides is in a **pocket**. For each partner: the side bonded to it is the
recognition side, the next side counter-clockwise the activator side, the remaining side the instruction side. If
every partner's activator side carries `K` bonded to a `k` (or is an activator side `%` bonded by its glue), the triangle takes each partner's instruction
glue on the facing side (option `castComp`: the complement), loses its marks, and lets go of all three. (Copying,
not complementing, is the default: a complemented product would stick to its own casters.)

## Hinges and machines
- A hinge remembers its flush angle (when it bonded, snapped to a multiple of 60 degrees) and which way is away from its partner. While the flap is
  **triggered** (a trigger side bonded, or a triangle welded to it reports a bonded trigger, relayed one bond) it
  is driven `hingeAngle` (60 degrees) away from flush, at 0.05 rad per step (half rate while loaded, so an empty
  flap returning wins a push), turning about its pinned corner and **carrying everything bonded to it**. A flap
  whose body reaches its partner through other bonds is locked.
- **Releases:** hand-off `^`, drop `!`, pulse `#` (above). Without a mark a flap holds its cargo until something
  else cuts the bond (e.g. a cast). A hand-off flap's catch side catches free triangles only (it never closes onto
  the cargo it handed off); a flap's catch side catches only while the flap is at rest.
- **Latches** `~` let go while their door is triggered (or the latch triangle hears a trigger signal) or opening (otherwise a door would re-latch before moving).
- **Open signal (completion):** an attached part (a triangle with an attach side) with an unbonded glued side (an
  open growth front, an open closure side) emits `openRange` (60), relayed -1 per bond. A grown part that hears none is
  complete; `&` sides let go then (a bud's seed side: a daughter ring lets go of its parent once it has closed).
- **Heard triggers:** a triangle whose trigger side is bonded has trigger signal `sigRange` (6); a triangle hears the
  signal on its hear sides `+` (partner's previous value - 1). A flap with a heard signal swings. This wires a sensor
  (a trigger side anywhere in a frame) to a flap through a few bonds.
- **Interlock:** a triangle with an unbonded latch side emits a lock signal (12, relayed -1 per bond); a closed pulse
  door ignores its key, and its latch holds, while it hears the signal, so only one door of a lock is open at a time.
- Geometry rule: a triangle turning about a corner sweeps its far corner 13% past the chord, so a flap's (and its
  cargo's) whole sweep must be clear, or it stalls. A hinged panel's latch edge must move away from its neighbour
  (check designs by sweeping them, as `structures.ring` does). Lids that close onto a target turn about a corner of
  the slot, so their leading edge arrives flush.

## Energy
Every triangle is charged by default. A flap whose own or hinge partner's type has a fuel side `$` starts each
swing only by spending a charged carrier bound to a fuel side: the carrier is discharged and, binding nothing,
falls off. Without fuel a triggered flap holds. **Environment drive** (labelled): free discharged triangles inside
the light zone `light: {x, y, r, p}` recharge at p per step.

## Parameters (defaults)
Physics: `sigma 0.3, sigmaRot 0.45, pairTol 0.35, subStep 0.3, bisect 5, split true`. Chemistry: `pBond 1,
capture 0.6, triTol 0.65 (with capture 0), triTolClose 0.22, triTolSame 0.05, hingeAngle pi/3, hingeRate 0.05, dropTol 0.15, lockRange 12, sigRange 6, zip true`, other options off.
