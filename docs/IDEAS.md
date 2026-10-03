# Idea notebook (typed-triangle world)

Ideas and design lessons for the typed-triangle simulation, most of them the user's. ROADMAP ranks the work; this
file keeps the reasoning so it is not lost. Add new ideas at the top of their section, with the date.

## The BIG goal (user, 2026-10-01)

An organism with a metabolism that constructs its offspring and feeds it until it can live on its own, then splits
it off. Build every mechanism in isolation and combine them later. Module table in ROADMAP.

## The way in is the way out; nothing may leak (design lesson, build run 20261003-0320, 2026-10-03)

Three findings from trying to keep the parent's copies in after `budpore`'s split (INNOVATIONS, run 0320):
- **Motion is reversible; only binding is one-way.** Rigid bodies move by random kicks, so any fixed opening a
  strand can pass inward it can pass outward. When the bud lets go, the space the strand moved through is still
  empty, so each half keeps an opening at least as wide as the passage. In `budpore c` the bud's 6-cell half lets its
  copies and strands out (even with the parent's genome made inert at the split), a 3-cell half lets no strand in, and
  a narrower parent half turns the founder's backs to the wall. Only binding events are one-way: an anchor's catch, a
  copy, a release, growth. So a bud that gets a strand and then keeps it needs an opening that a binding event narrows
  after the strand is in.
- **Free strands beat cells.** A strand outside has open backs and direct access to the food; three of them beside
  an `imprint p` cell take all 150 blanks in under 10000 steps and leave the cell 1-2 strands (alone it has 1-7). So an
  organism on copies must never put a strand outside: one leaked strand starts a population that starves every cell
  in reach, its own buds included. (Nothing in the world removes free strands; something that did would be a core
  change. Until then the rule is: no leaks.)
- **A bent opening keeps strands in.** A strand is a rigid strip about 4 long; blanks are single triangles. A pore
  under a hood (a corridor two rows high leading sideways to the pore) lets blanks in and no strand out (`imprint ...
  150ph`: no strand lost in 7 of 8 worlds; the plain pore loses 4-9 in 3 of 8). The same geometry would keep strands
  out, so it cannot be how a bud gets its genome.
Ways to give a bud its strand and then close its way in, each with a binding event (for the next build or explore):
(a) **the genome as the plug:** the bud's anchor on the edge of its gap so a caught strand lies in the wall row and
fills the gap but for a pore (a 10-cell gap, a 7-triangle strand, 3 cells left); the catch is the one-way step; which
way its faces point (into the bud or out) decides where its copies form. Built the same run for the bud (faces in: the
bud alone copies in 3 of 4 worlds); the parent's half is open (INNOVATIONS, run 0320). (b) **a closure grown after the split:** a
growth site on the bud's opening whose place is filled by the parent's wall until the parent leaves, more bonds from
the doorway bond than `openRange`, grown from copies. (c) **fission:** a septum grown across the parent.

## Let go by completion, not by a machine (design lesson, explore run 20261003-0050, 2026-10-03)

A one-shot separation needs no latch, trigger or hear chain: an anchor with `@` is an open growth front until it
catches, so "the bud has its genome" is the same event as "the bud is complete", and a completion-release bond (`&`)
that hears the anchor is cut by it. Its freed sides are spent, so they are never copied (a latch's freed sides were
copied 3-105 times per world). The general point: whatever comes apart only once should be an `&` bond; latches are
for doors that close again. The cost: every unspent side that hears the signal is exposed to copying while it waits,
so the structure around the anchor must already be spent. In `budpore` the walls start spent (prepared). A grown bud
has to get there by its order of growth: its walls spent before its anchor starts to emit. How is open (the site that
takes the anchor part emits too, so walls near it stay unspent until the anchor has caught); it belongs to the
closure question (ROADMAP, Organism on copies).

## A parent whose copies leak out feeds its competitors (design lesson, build run 20261002-2321, 2026-10-03)

In `budpore` the parent's opening is also its way out: its genome copies leave, copy each other in the open food (free
strands copy fastest: their backs are open) and take 7 to 100 times more food after the split than the bud does. A bud
cannot "live on its own" beside that population, whatever its anchor. Two consequences: the parent must keep its
copies (a pore one cell wide lets blanks in and keeps strands in, `imprint p`), and the bud is best fed **before** it
leaves, while parent and bud share one sealed space (with 80 blanks inside a sealed P+D, 70% of the food went to the
genome). Getting strands to the bud's anchor through an internal doorway took one more step: the founder hangs
under the doorway, so its copies are released at the way into the bud (`budpore c`: splits 7 of 8, the bud leaves with
1-4 strands). What remains is the time after the split, when both halves of the doorway are wide pores.

## Spent walls cannot be templates (design lesson, review-intent run 20261002-1751, 2026-10-02)

Feeding on copies needs every wall side spent (`&`), because spent sides are never copied and the food goes to the
genome (`imprint m`, `imprint p`). The same rule means a complete parent cannot template its bud's ring: its wall is
spent. Ring material for the next generation must therefore come from a surface that is exposed and unspent while it
is needed: the bud's own growing front (open-signal sides are unspent; `imprint` showed one motif round of a ring
growing into a whole ring and a second ring from copies), or templates carried somewhere they stay exposed (for
example parts held on the genome inside the parent). Which one, and where each bud's first motif round comes from, is
the closure question (ROADMAP, Organism on copies). Also from this review: the organism is a lineage only if the bud
is its parent's kind; `budpore`'s bud (R 5, catching anchor, latch) and parent (R 7, holding anchor) are not.

## Programmable synthesis: decision (autorun 20261002-0136, explore, 2026-10-02)

The maintainer asked an explore run to decide between part templating, translation and kit-free growth through the
core-change gate, least core growth, at most one new rule. Decision: **part templating, as contact copying** (one
mark `?`, gate entry in RULES "Core changes"). Reasoning:
- **Closure is the test.** A synthesis scheme is enough only if it can make the parts of its own machinery. Stamp
  casting cannot: a stamp caster carries `'` marks and no cast product carries marks. Kit-free growth (no rule) cuts the
  number of types but keeps the same gap. Translation also needs adaptors that carry marks, plus a reading frame, a
  site touching three strand faces (impossible on a straight strand: the lattice's dual has no 3-cycles) and stepping:
  several rules, and the adaptors still need a way to be multiplied. Part templating closes the loop with one rule.
- **The smallest templating has no machine.** A copier pocket needs a hold for arbitrary templates (glue-agnostic),
  a read rule and a release, and its library parts are taken by growth sites. Instead the copy blank itself reads: a
  free blank with copy sides binds any free side of an attached triangle and becomes a copy of it (the partner turned
  about the shared edge). The body is the template; nothing is held, nothing is used up.
- **Costs, stated.** Information about parts then lives in the body, not the chain (the chain still decides where
  parts grow, by its seeds). Only exposed triangles are copied: a cell whose three sides are bonded is copied only
  while it is still growing (5 of the lid pocket's 16 kit cells are enclosed when complete; every cell of a one-row
  ring keeps one free side, inside or outside). Everything exposed is copied, strays included, at rates set by
  surface and blank supply: regulation is by where copy blanks are (import doors), selection acts on bodies.
- **Biology.** Membranes and cortical patterns are inherited by templating in real cells (new membrane only grows from
  membrane); here every part is.
- **What it may remove later:** stamp marks (`'`) and, once dockers are copied from strands, casting itself.

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

## Pitfalls from the casting lineage (moved from docs/NEXT.md, cleanup run 20261002-1821)

Design lessons from kits, pockets, doors and flaps (the casting lineage, frozen since run 20261002-1751). The pitfalls
for current work stay in docs/NEXT.md.

- **Kit races** (`structures.kitRace`): a cell whose every side may face a non-descendant (or a slot) is lost for good
  if that neighbour arrives first; kit depth does not order arrival. The lid pocket's cell beside the slot is a leaf of
  every kit tree. Raise the supply of race cells (3x completed the grown pocket in 4 of 4 worlds).
- **A latch-cut closure re-closes**: two sides that stay flush close again next step (no `&` on a closure is possible:
  closures never form on `&` sides). Cut what must stay apart with `&` on a bond formed by binding a free part.
- **A grown flap hangs by its hinge only**: any second bond of the panel to the ring locks it. Its far end must move
  away from its neighbour when it swings (down-triangle far end, up-triangle neighbour for a panel swinging up).
- **Food in a kit site.** A blank whose glue complements casters' close-only instruction sides closes into an empty
  caster site of a growing pocket (two `U.` sides facing it) and blocks it for good. Keep a pocket's target blanks away
  until the pocket is complete (the bud gets `uuu` only through its own door, after the split).
- **Narrow kit sites.** A kit cell with a side on a wall can be entered only through one side once its parent is
  there; it stalled 2 of 4 bud pockets. `budPair` avoids such placements; check new layouts for them (the risk count
  in `structures.kit` does not see walls).
- **TRI_RESUME and `split`**: the demo places its prepared parts and food after `createWorld` has loaded the saved
  state, so a resumed `split` world is scrambled (and the genome variant may throw "prepared parts overlap"). Rerun from
  t=0 instead (a 200000-step world takes about 2 minutes).
- **A ring with two open doors falls apart** (two gaps make two rigid pieces). Interlock the doors of one ring: an
  unbonded latch side emits the lock signal and other latches hold while they hear it (raise `lockRange` for big
  rings). Seen in the bud: its import door opened before its closing door had shut.
- **Order of parts on one genome.** Pocket and membrane grow at once from the chain's two seeds; the open signal keeps
  the pocket idle and the membrane attached until both are complete. Tried and reverted: "a seed binds only while the
  strand hears no open signal" (one part at a time): a finished pocket then went live before any membrane, copying
  started outside, and a strand being copied exposes no seed, so the membrane never began. Remaining race: if the
  membrane closes before the pocket's last cell arrives, that site is inside and the cell is stuck (seen in 2 of 4
  worlds with a poor pocket supply).
- **Catchers in kits.** A target caught before a neighbouring caster arrives closes that caster's cell off; let only
  the caster whose cell borders the frame catch (lid pocket catcher 'B').
- A flap turning about a corner sweeps its far corner 13% past the chord: a carried target jams against a fixed
  neighbour across its far edge. Close lids onto a target instead of carrying the target (lid pocket).
- Kits: every functional pair (activator `%` pairs, instruction holders) must be a close-only closure or a unique activator glue (`%`);
  otherwise free kit cells, products or dockers stick at the wrong place. Free parts must bind only by `@`.
- Dockers used as fills expose their side glues on hidden backs: use `latGlue` with dedicated fill types when dockers
  carry seeds.
- A latch must stay released while its door opens; any doorway makes a 2D ring a C (use airlocks).
