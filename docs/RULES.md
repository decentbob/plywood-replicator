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
| `@` | attach side: a free triangle that has one binds only by it, and never docks or fills (a part) |
| `^` (hinge side) | hand-off: the flap lets go of its cargo once the cargo is also bonded elsewhere |
| `!` (hinge side) | drop: the flap lets go of its cargo when its swing is complete |
| `#` (hinge side) | pulse door: a trigger opens it, it swings open, resets there, swings back |
| `#` (trigger side) | the key is let go one pass after it was read (not carried) |

## Physics (`tri/physics.js`)
- Torus `W x H`. Each step: Brownian jostling of **bodies** (blocks joined by bonds move and turn as one rigid
  body; free blocks alone; sigma 0.3, sigmaRot 0.45), then 32 constraint passes: polygon contacts (minimum
  translation; pairs within `contactMargin` 0.6 of touching after the jostle), pins (bond corners together), shape matching of bonded blocks (stiffness 0.8, soft corners).
- A **bond** pins both corner pairs of the shared side; a **hinged** bond pins one corner. Hinged pairs still collide.
- **No tunnelling:** if a jostle kick would carry a block's centre into a block of another bonded structure, the
  body moves only 1/2 or 1/4 of the way, or not at all (kicks reach about 1.8; a one-row wall is 0.87 thick).
  Free blocks still jostle past each other.
- `pairs`: blocks near enough to bond (centre distance within the two radii plus 0.23).

## Binding (one rule everywhere)
A side binds a flush side (both corner gaps within 0.45, closures 0.22) with the complementary glue, at
probability `pBond` per step (1: whenever flush), if at least one of the two triangles is already attached (**activation by
attachment**: free triangles never bind each other). **Binding pulls the free triangle in:** it is placed exactly
flush against its partner's side (it moves at most about the tolerance), so every bond starts aligned. A **discharged** triangle binds nothing. Close-only sides
bind only when both triangles are attached. A free part (a triangle with an attach side `@`) binds only by its
attach side. Option `pLoose` (proofreading): a triangle caught while free (not by an attach side) and held on only one
or two sides lets go with this probability per step.

Which sides of an attached triangle bind by glue: all free sides of a glue-bonded (grown) triangle; the back of a
released strand triangle; the spare edge of a strand end that is not being copied.

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
  else cuts the bond (e.g. a cast).
- **Latches** `~` let go while their door is triggered or opening (otherwise a door would re-latch before moving).
- **Heard triggers:** a triangle whose trigger side is bonded has trigger signal `sigRange` (6); a triangle hears the
  signal on its hear sides `+` (partner's previous value - 1). A flap with a heard signal swings. This wires a sensor
  (a trigger side anywhere in a frame) to a flap through a few bonds.
- **Interlock:** a triangle with an unbonded latch side emits a lock signal (12, relayed -1 per bond); a closed pulse
  door ignores its key, and its latch holds, while it hears the signal, so only one door of a lock is open at a time.
- Geometry rule: a triangle turning about a corner bulges 13% past the edge it swings toward, so a flap needs free
  space beside the side it swings toward; a carried block pressing on a neighbour stalls the swing (it then
  completes only with lucky jostling).

## Energy
Every triangle is charged by default. A flap whose own or hinge partner's type has a fuel side `$` starts each
swing only by spending a charged carrier bound to a fuel side: the carrier is discharged and, binding nothing,
falls off. Without fuel a triggered flap holds. **Environment drive** (labelled): free discharged triangles inside
the light zone `light: {x, y, r, p}` recharge at p per step.

## Parameters (defaults)
Physics: `sigma 0.3, sigmaRot 0.45, stiff 0.8, iters 32, pairTol 0.35, noTunnel true, contactMargin 0.6`. Chemistry: `pBond 1,
triTol 0.45, triTolClose 0.22, hingeAngle pi/3, hingeRate 0.05, dropTol 0.15, lockRange 12, sigRange 6, zip true`, other options off.
