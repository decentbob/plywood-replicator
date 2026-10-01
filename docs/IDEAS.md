# Idea notebook (typed-triangle world)

Ideas and design lessons for the typed-triangle simulation, most of them the user's. ROADMAP ranks the work; this
file keeps the reasoning so it is not lost. Add new ideas at the top of their section, with the date.

## The BIG goal (user, 2026-10-01)

An organism with a metabolism that constructs its offspring and feeds it until it can live on its own, then splits
it off. Build every mechanism in isolation and combine them later. Module table in ROADMAP.

## Programmable synthesis: the next big blocker (2026-10-01, fourth session)

Stamp casting lets a pocket cast kit parts, but one pocket makes one part type, and a cell needs dozens of types
(a cell kit has ~60). A pocket that casts its own kit (16 types) would need 16 stamp pockets, each needing 16 more:
no closed loop. Biology solves this with a code: few adaptor types read a sequence, so one machine makes many
products. Candidates here (none built; each needs a rule change, so the user should choose):
- **Part templating (simplest):** a pocket with a *read* side holds a template part and casts a blank into a copy of
  the template's type (marks included). One copier pocket then multiplies every part type present: a cell carrying one
  of each of its parts (a "library") can make all of them from blanks, and pass a library to its offspring. Local (the
  caster exposes the type of the triangle bonded to its read side, one bond per pass), but information then lives in
  the parts, not in the chain, and stray types are copied too (selection would have to act on parts).
- **Translation (closest to biology, hardest):** a reading frame on a strand: three consecutive faces each hold an
  adaptor, and a product in a notch touching the three adaptors takes one glue from each (n adaptor types give n^3
  products). Needs a site touched by three reader cells and a way to step along the strand (a ratchet).
- **Kit-free growth:** shapes from few types (periodic motifs, the 3-cell cap from one type) wherever position-specific
  parts are not needed; kits only for the machines.

## Division and segregation (2026-10-01, fourth session)

Built (demo `split`): parent and bud share a wall held by `&` pairs with a doorway through both walls; the parent's
pockets feed the bud through it; when the bud's growth front closes (open signal gone) every `&` lets go, both doors
(prepared open, always triggered, held by a `&` doorstop) swing shut and lock by a closure. Genome segregation needed a
new physical rule: a strand cannot otherwise bind an attached structure (capture needs a free triangle, closures need
an exact fit). The anchor `|`: an anchor side catches a strand end's seed as it would a free triangle, and the strand
moves as one body into place (physics; the choice is by role, not by body size). Next: grow the bud pair instead of
preparing it (a bud ring grown on the parent's wall around its doorway), and give the bud its own pockets.

## Heredity of machines (user, 2026-10-01)

User: "Without new block types it should already be heritable, no? Because the blocks on the chain it attaches to
are heritable and only bind arms." Yes: the chain carries seed glues, copies carry the same seeds (through the
docker types), and parts regrow on every copy from supply, as the typed arms already did.
- Any shape can be grown from a seed: lay its cells out as a spanning tree from the seed, give every tree edge its
  own glue pair (unique attachment), and give the remaining shared edges closure glues (they bind once both sides
  are attached), which closes rings. A pocket needs about 16 distinct types.
- Information capacity: now only the two strand ends expose seeds (hidden backs are random fills). With `latGlue`
  (fills must carry the complement of the docker's lateral glue) every back is determined by its face's docker type,
  so the face sequence decides a sequence of parts along the back: a real genome-to-body mapping.
- The bottleneck is supply: each copy needs its own kit types. A pocket that casts blanks into kit types would make
  its own parts (an autocatalytic factory, the core of a metabolism).

## Biology as a source of ideas (user, 2026-10-01: "compare to real life and evolution")

Mapping: typed triangles ~ monomers with specific pairing; complementary chain copying ~ template replication by
base pairing; casting pocket ~ enzyme active site; factory ~ metabolism; hatches and doors ~ conformational changes;
airlock with interlock ~ alternating-access transporter; scanner pocket ~ selectivity filter; stray cast types ~
non-canonical monomers and toxic by-products.
How life copes with strays: recognition of the whole shape (many contacts), kinetic proofreading (a delay before
commitment lets wrong partners fall off), sanitizing enzymes that destroy or recycle wrong building blocks,
compartments with selective transport, and a frozen code (once much depends on an alphabet, new letters are rarely
adopted). Strays create selection for accuracy, which could make proofreading evolve here.
Ideas: (1) energy for motion (built); (2) proofreading as a binding rule; (3) the "RNA world" route: the replicator's
heritable arms fold into its own pocket; (4) sanitizing pockets that cast stray types back into blanks;
(5) compartment plus transporters = a cell.

## Energy (user, 2026-10-01)

"Discharged energy shouldn't bind, otherwise the mechanism could just wait for a recharge." Built that way.

## Casting makes stray types; replicators need to scan (user, 2026-10-01)

"New types can emerge that make past machines not build correctly. If a machine relies on [if side 1 is a, then
side 2 is b], a triangle with side 1 = a and side 2 something else will block it. Still, a cast should theoretically
be able to make all sorts of triangles. Long term a replicator relying on specific blocks would need a mechanism to
scan and only let in the right ones."
- Scanner gate: the pocket already reads all three sides of a triangle (casting needs all three recognitions); a
  pocket whose instructions equal what it recognizes changes nothing but works as a checkpoint; with a hatch on each
  side it admits only triangles that match on all three sides.
- Cooperative binding (cheap, everywhere): a part stays bound only once a second side also matches, otherwise it is
  let go after a delay.

## Machines from hinges (user, 2026-09-30)

"Simulation is in need of a hinge triangle, useful for membranes; it should open with intention" (a trigger
mechanism, not free flopping); "maybe two hinges to capture better"; "a hatch catching one, then closing and after a
cast immediately opening again"; "blocks attached to hatches while they open or shut is good for moving blocks as a
machine"; "a double lock with one door closed and one open so the membrane does not drift apart". All built (see
INNOVATIONS) except two-hinge jaws. Lessons: a flap needs free space beside the side it swings toward (13% bulge);
a single rotating hatch cannot carry cargo between two sealed regions (the cell it moves cargo into always touches
the chamber), so a pump needs a carrying hatch plus a door, or a multi-blade rotor; any doorway turns a closed ring
into a C while it is open, hence airlocks.

## Design principles (user, 2026-09-30)

- (2026-10-01) "I don't care much about the simulation being byte-identical, as long as the mechanisms work. The
  simulation is mostly a tool in pursuit of the goal and letting us play out the rules." Physics and rule changes
  that keep mechanisms working are fine; re-run the affected demos, no need for bit-for-bit reproduction.

- One base shape (the triangle) and local side rules; welding is ordinary bonding. Shapes come from chains of
  triangles (letters T, R, Z by hidden backs); copies must be exact, so growth must be planned with intent (distinct
  types, terminators), not left to repeats.
- No programs in triangles ("one complexity level lower, like amino acids instead of proteins"): each triangle has
  one active glue per side; behaviour comes from types and their combination. Repeats are allowed; if unwanted,
  design the types with more intent.
- Casting should be simple and general (able to make any type), rare by chance and routine in machines.

## Adaptation and environment (user, 2026-09-29/30; for later)

- Two routes to adaptation: protection from the environment (shields, shells) or a feeding shape (funnels, pumps).
  Grown parts should be judged by these effects.
- Patchy environment: destructive zones (heat, radiation) that break and recycle, and safe zones to build in; light
  zones as energy sources (built as recharge zones).
- Fixed blocks in the environment (immovable obstacles) would let directed movement evolve (grip, crawl).
- In closed, material-limited worlds a part's cost so far outweighed its benefit (earlier triangle-chain batches):
  parts need supply that machines make, or an environment that pays for them.
