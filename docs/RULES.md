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
| `.` | close-only: binds only triangles that are already attached, never a free one |
| `$` | fuel side: a hinge here (or on its partner) spends one charged carrier per swing |
| `+` | hear side: the triangle hears the trigger signal of the partner bonded here (relayed, below) |
| `=` (hinge side) | wide hinge: swings 120 degrees instead of `hingeAngle` |
| `%` | activator side: counts as a casting activator while it is bonded by its glue (the only activator) |
| `@` | attach side: a free triangle that has one binds only by it, and never docks or fills (a part); an attached triangle's `@` side binds only a free part's `@` side (a growth site for parts only) |
| `&` | completion release: the bond on this side is cut once its triangle hears no open signal (its part is complete); the side is then spent and binds nothing again |
| `\|` | anchor: an unbonded anchor side catches a strand end's seed (complementary glue) as it would a free triangle; the strand is placed flush as one body (physics). With `@` it emits the open signal until it has caught one |
| `?` | copy side: a free triangle that has one binds only by it, to any free side of an attached triangle (any glue, inert too), takes that triangle's whole type and lets go (contact copying, below) |
| `'` | carried marks (stamp): marks written after an apostrophe (`b.'@`) do nothing on this side; a cast product takes them with this side's instruction glue (below) |
| `^` (hinge side) | hand-off: the flap lets go of its cargo once the cargo is also bonded elsewhere |
| `!` (hinge side) | drop: the flap lets go of its cargo when its swing is complete |
| `#` (hinge side) | pulse door: a trigger opens it, it swings open, resets there, swings back |
| `#` (trigger side) | the key is let go one pass after it was read (not carried) |

## Physics (`tri/physics.js`): rigid parts, move or stop
- Torus `W x H`. Blocks are rigid unit triangles; a **body** (blocks joined by bonds, hinged ones included) moves and
  turns as one rigid piece. Nothing deforms, overlaps or squeezes (user, 2026-10-01: "no deformation and squeezing is
  fine and might even be good for deterministic machines").
- Each step every body, in random order, proposes a Brownian kick (parameters sigma 0.3, sigmaRot 0.45 per unit
  mass: a lone block, mass sqrt(3)/4, gets a kick of 0.46 and a turn of 1.04 rad standard deviation; a body gets the
  mean kick of its blocks and the turn of their torque, so larger bodies move less), translation and turn as two
  trials. A trial of at most `direct` (0.8, below a block's width: fixed 2026-10-02, 1.0 let a block in a wall's hole
  hop across it through the apex pinch) is checked once; a longer one moves in sub-steps (0.8) as far as it goes
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
| copy bind | the blank's copy sides; the site's bond and spent state | own; partner current state | local |
| glue catch, dock, fill | own role, need, zip, refr, away, deaf; free triangle's side glue and marks | own; fixed type | local; sets the caught triangle's flags |
| `_snap`, anchor capture | is the place free; the strand's body moves as one | physics (labelled) | physics |
| glue closure, copy closure | own active sides, need; the other side's glue; flush geometry | own; fixed type; geometry | local |
| release | own face bond; chain partners' fn; template's chain bonds at the ends | previous pass; partner current state | local (fixed 2026-10-02) |
| fn | own fill; chain partners' fill | partner current state | local (convention) |
| loose (pLoose) | own caught flag and bonds; partner side's trigger mark | own; fixed type | local |
| copy (`?`) | the one partner's whole type | fixed type | local (gated, Core changes) |
| cast | own three bonds; each partner's actE; instruction glue and carried marks | partner value from this step's derive; fixed type | local (convention) |
| light | own position and charge | environment (labelled) | environment |
| `&` release | own open signal, own `&` sides | own | local |
| latches | own tb, sg, dOpen, lock, open; non-hinge partners' tb and dOpen | previous pass | local |
| fuel spend | own charge; partner's fuel mark and fu | fixed type; previous pass | local |
| hand-off, drop, swing, interlock, pulse | own marks, bonds, sg, dOpen, lock, pw; cargo's bond count; partners' tb and fu; hinge angle | previous pass; geometry | local |
| flap lock and turn | the flap's body (traversal) | physics (labelled) | physics |
| key release | own trigger side | own | local |

Note: `_pairs` (physics) never lists two free triangles, so no chain of catches through free triangles can form in one
pass; the chemistry relies on this.

## Binding (one rule everywhere)
A free triangle binds an attached triangle's side with the complementary glue when its centre comes within `capture`
(0.6) of the free site beside that side (any orientation), and the site is free: **binding places it** exactly flush
in the site (activation by attachment: free triangles never bind each other). Two attached triangles close a bond
when their sides are flush within 0.05 (rigid parts are exact, so a flap that has arrived, a ring that closes or a
copy closes; two separately moving structures rarely meet that exactly). At probability
`pBond` per step (1). A **discharged** triangle binds nothing. Close-only sides
bind only when both triangles are attached. A free part (a triangle with an attach side `@`) binds only by its
attach side (an attached triangle's `@` side catches only a free part's `@` side; closures between two attached
triangles do not look at `@`). A bonded triangle is never free (fixed 2026-10-02: a docked template that had lost its
chain bonds was caught again), and a side binds only while unbonded. Option `pLoose` (proofreading, cooperative
binding): a triangle caught by glue while free (not by an attach side; docks and fills are not proofread) and held
on one side only lets go with this probability per step; a second matching side holds it. A triangle held by a
trigger side (a key a machine is reading) is not proofread.

**Anchor (2026-10-01):** an attached triangle's unbonded anchor side `|` catches a strand end whose seed (spare edge,
active while the strand is not being copied) carries the complementary glue, when the end's centre comes within
`capture` of the site: the whole strand moves rigidly into the flush place if that place is free (all or nothing).
The capture path (the turn the short way and the move) must be clear in sub-steps, as every move (fixed 2026-10-02:
a strand was pulled through a wall); a strand that already holds the anchor's triangle (one body) is not caught.
This is the only way a strand joins an existing structure (two attached triangles otherwise bond only when flush).

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
- **release:** a docked triangle lets go of its face once its prev and next partners are complete (each partner
  exposes `fn`: it is a fill or has a fill on a chain bond, from the previous pass, and from the pass a fill binds:
  fixed 2026-10-02, a fill bound in the same pass did not hold the release); at a copy end without a prev (next) bond,
  once the template has no next (prev) bond there; the copy peels
  off as one strand and is a template itself. Copy faces carry the complement of the template's faces, so a copy
  of the copy restores them (the copy reads as the reverse complement).
- **zip (default on):** a face takes a dock only while it hears zip: the strand's high end (no next bond) emits it, a
  face whose dock is bonded passes it on, backs relay it (previous pass). A copy therefore grows from the high end one
  face after another; parallel docking used to enclose an empty dock site between two partial copies (a hole no free
  triangle can reach), which deadlocked copying. Option `zip: false` restores parallel docking.
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
spent) side of an attached triangle, whatever that side's glue and marks (close-only `.`, attach `@` and trigger sides
too: the copy side is the only test), when its centre comes within `capture` of the site and
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
- **Latches** `~` let go while their door is triggered (or the latch triangle hears a trigger signal) or opening (otherwise a door would re-latch before moving).
  A latch holds a trigger while its triangle hears an open signal: a door does not open before its wall is complete.
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
two bonds away). Without fuel a triggered flap holds. Known gap (designed fix in docs/NEXT.md): a fuel triangle with
two carriers spends both on one swing, and two flaps on one fuel triangle can both start on one carrier. **Environment drive** (labelled): free discharged triangles inside
the light zone `light: {x, y, r, p}` recharge at p per step.

## Core changes

Every core change (a new mark, signal, state, rule or rule branch, physics exception, or a default that changes
behaviour everywhere) is entered here before any code (AGENTS.md). Newest first.

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
   Expected behaviour: identical in every demo whose only `K`/`k` pairs are the prepared pockets' activators
   (verified by comparing demo outputs before and after, and by `node tri/check.js`).

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

Rule as built: a copy side `?` on a free triangle binds any free (unbonded, not spent) side of an attached triangle,
whatever its glue (inert too), when its centre comes within `capture` of the site and the site is free; a free
triangle with a copy side binds only by it (never by glue, dock or fill). In the same pass it takes its partner's type
(side i+k takes the partner's side j+k, k = 0, 1, 2, where i, j are the bonded sides: the copy is the partner turned
180 degrees about the shared edge) and lets go. Free triangles never bind each other, so only attached triangles are
copied.

## Parameters (defaults)
Physics: `sigma 0.3, sigmaRot 0.45, pairTol 0.35, direct 1.0, subStep 0.8, bisect 1, split true`. Chemistry: `pBond 1,
capture 0.6, triTolClose 0.05, hingeAngle pi/3, hingeRate 0.05, dropTol 0.15, lockRange 12,
sigRange 6, openRange 120, zip true`, other options off.
