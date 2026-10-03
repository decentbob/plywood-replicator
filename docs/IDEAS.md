# Idea notebook (typed-triangle world)

Ideas and design lessons for the typed-triangle simulation, most of them the user's. ROADMAP ranks the work; this
file keeps the reasoning so it is not lost. Add new ideas at the top of their section, with the date.

## The BIG goal (user, 2026-10-01)

An organism with a metabolism that constructs its offspring and feeds it until it can live on its own, then splits
it off. Build every mechanism in isolation and combine them later. Module table in ROADMAP.

## The kind's bud from a part pool: the last cell comes from inside; the pool has no per-type regulation (build run 20261003-1420, 2026-10-03)

Measured with demo `budpool` (INNOVATIONS, run 1420): a prepared parent of `budKit(5, 7)` grows its bud on its seed
site from a pool of all 47 part types plus copy blanks (a harness turns each copy back into a blank, so the pool keeps
its composition; openRange 1, the anchor on the root). Growth itself works: one cell after another, no stray binding
in 14 worlds. Three lessons for the kind.
- **The last cell can only come from inside the pair** (geometry, holds for the whole family). The bud is its parent
  turned 180 degrees by T, with T(the root's seed edge) = the parent's seed-site edge. T is its own inverse, so the
  bud's last cell E always lies with its seed side on the parent root's seed side. Its link side holds cell N-2, and
  its third side faces the bud's pore, i.e. the doorway. So once cell N-2 binds, the pair is sealed, and the last site
  opens only into it: only an E part already inside can complete the bud. Measured: with 8 E parts (as many as every
  other type, 30 x 30 world) the bud completed in 2 of 4 worlds, exactly those with an E part inside at sealing (1, 0,
  1, 0); with 40 E parts it completed in 7 of 7 (1-5 inside). E parts inside per E part in the world: 0.077, so
  P(complete) is about 1 - exp(-0.077 n_E) here (an inside area of about 70 of 900). Any kind whose pore lies between
  root and seed cell (the condition for facing pores) has this property, and a stalled bud waits for ever.
  Where E parts come from: the seed site `y` is plain glue and is copied whenever no bud sits on it (parent and bud
  alike), so a lineage over-produces E by itself, at the cost of food. Ways out, for priority 2 (the kind's opening):
  keep it and count on E-rich surroundings; give the parent an E source inside (a plain side of E facing the doorway:
  copied by the parent's own food, a food sink); or a kind whose last site is not at the pore: two fronts from two
  seed bonds (one per pore edge) meeting mid-wall, which needs the parent root's seed side to bind again after its own
  split (a spent side binds nothing: a core change).
- **A pool of unique types has no per-type regulation** (argument, supported by the runs). Copies of type k are made
  while cell k is the growth front, i.e. while it waits for part k+1 (openRange 1; with r > 1 also while the next r - 1
  cells arrive). So copies of k scale with the wait for k+1, which goes as 1/n(k+1), not with n(k): correlation of
  the wait for k+1 with the copies of k 0.56-0.78 in 4 worlds. The steady state (every n about c B) is neutral: a
  type's own count has no restoring force and drifts by about one per generation (Poisson copies, one used), so in a
  balanced pool some type dies out after about n^2 generations, and with it the lineage (walls are spent: no template
  of it is left). A supercritical pool (more than one copy per use) outruns the drift but grows on food. Measured: 0.91
  to 1.72 copies per used part (mean 1.3) at one part of each type per blank (8 and 8), as the law of run 1221
  predicts ((r + 1)/2 to r + 1 parts per blank for one copy per use). Fewer types make each count larger and the drift
  slower; a template that is copied when its own type is scarce would regulate, and none exists in this kind.
- **Growth time grows as the square of the number of types.** Waits per cell spread from 8 to 32000 steps (median
  1500-2500) at 20 percent area cover, so a bud takes 100-200 thousand steps. At fixed cover each type's density goes as
  1/types, and a bud needs one wait per type. The same pool in a 24 x 24 world (30 percent cover) was slower (34 and 42
  of 47 cells at 160000 steps): crowding, not distance, limits the rate. Another argument for the periodic ring with few
  motif types for cells larger than R 5.

## One opening cannot be both doorway and feeding pore (direction check, review-intent run 20261003-1321, 2026-10-03)

The closure kind (below) feeds through the same 7-cell pore its parent's strand crosses to reach it. A doorway must
pass a strand (3-cell halves pass none, run 1121); a feeding pore must pass none (free strands outside starve every
cell, run 0320); and fixed openings pass strands both ways. So an organism on copies needs, at each opening, a binding
event that closes it to strands after the transfer and, if the same opening serves the next bud, one that reopens it.
Candidates for the design slice (NEXT, priority 2): a hooded feeding pore beside a doorway that the caught strand plugs
(two gaps cut a one-row ring into two bodies; a hood held on both sides of its pore would join them, untested: the
`imprint ph` hood hangs on a strut at one end); one opening plugged by
the caught strand and released by the next bud's growth; fission, which needs no transfer but needs a membrane that
grows back (insertion growth, below). Not yet weighed in detail.

## Closure by design (build run 20261003-1121, 2026-10-03): designed, not demonstrated

The question (NEXT, priority 2): one organism kind whose bud is the same kind, every part grown from copies or taken
from the environment. Result: the kind of `structures.budKit` (INNOVATIONS, run 1121), found through four constraints.
- **Growth cannot stop beside a gap.** A ring grown from a periodic motif (ringKit) ends only by closing onto a cell
  already there: cells of the same motif index are interchangeable, so a special cell placed by its glue lands at any
  of the six repeats. Hence every unique cell (anchor, seed site, closure target, door) must lie on a segment of unique
  cells that grows from the root, and an opening in a grown ring is made either by all-unique cells up to its far edge
  or by unique cells released later.
- **A bud's pose is fixed by its seed bond.** A bud of the same kind attached by its root to the parent's seed cell on
  the same wall is the parent turned 180 degrees about the midpoint between the parent's root and seed cell. So the two
  pores face each other only if the pore lies between root and seed cell (the seed cell is the root's mirror image
  across the pore), and then the bud's seed cell lies on the parent's root: covered until the split, free after it.
- **One signal, two events.** With the open signal the only release, a door that must open at ring closure while the
  bud still holds on until its catch can be ordered only by distance: the root must hear exactly 1 from the anchor
  (openRange = k + 1, k = anchor distance) so the door's neighbour hears 0; that neighbour must also hear something
  while its door cell has not arrived, which holds only while the other growth front is within reach: a race (estimated
  1 bud in 10 lost at the smallest distance). The all-unique ring has no door: its doorway is open from the moment its
  last cell arrives, and only one release remains (the split, by completion after the catch).
- **Every part must be copyable at some time.** The next generation's parts are copies of this generation's cells,
  made while their free sides are unspent (within openRange - 1 bonds of a growth front or the waiting anchor). Spent
  walls protect the food and still pass the kit on, because each cell is copied during its own bud's growth. A cell
  whose free sides are all `@` would be copied only through `@` sides (the root `W@|Y@&b@`): copy-blank narrowing (c)
  would cut the lineage there.
**The kind** (R 5, `budKit(5, 7)`): root `W@|Y@&b@` at the pore's left edge (seed bond out, anchor into the pore), 45
unique wall cells (`&` free sides), last cell E with the seed site `y` at the right edge; 7-cell pore. Life cycle,
each step with the demo closest to it: (1) the cell feeds through its pore and copies its genome (`imprint p`, works);
(2) a free root copy binds its seed site `y` and the bud grows one cell after another from copies of earlier buds' cells
(`imprint`: a ring's cells multiply and a second ring grows from the copies, 3 of 4, periodic R 3; along a parent's wall:
`budgrow`, casting lineage; from a pool of 47 unique types: not demonstrated); (3) the last cell closes the pair: the
doorway joins the two cells only, the bud's anchor waits (its open signal holds the root's `&`); (4) a parent strand
crosses the doorway and the anchor catches it (`budpore`; with this kit's 7-cell doorway 4 of 4 with the founder away
from the doorway, 1 of 4 with the founder on the parent's root as the kind puts it); (5) completion cuts the root's
seed bond: split (`budpore`, test "closure (budKit)": the bud is then in its parent's starting state); (6) both cells
feed through their pores again, the parent can bud again on its free seed site (M2: partial). Rules read: binding of
parts by `@`, contact copying, the open signal (one bond per pass), completion release (own `&`, own signal), the anchor
catch (labelled physics). No new rule.
**Open, in order:** the anchor must not hold the founder in the doorway (move it k cells from the root, openRange k + 1;
dry-run where a held strand leans away from the doorway); 7-cell pores leak strands after the split (M2's food problem,
plus a hood or a narrower opening that strands still pass); the part pool (47 types kept across generations by the
copies each bud's growth makes) is untested; a radius-5 cell holds only 3-4 strands and 20 blanks. Bigger cells need
more letters: reuse letters in separate compartments (user idea below) or the periodic ring with door cells and its race.
**The periodic alternative** (for R 7 and larger; not built): root, a unique segment with the anchor k cells
counter-clockwise, and clockwise a buffer cell X, 4 door cells and E, whose far side is a closure target `@.` (it emits
until the long periodic front closes onto it, so the door cells are held exactly until ring closure); X's door side `&`
hears 0 after closure and is spent (no door cell can re-attach); needs k >= 5, openRange k + 1, and loses the bud if
the anchor cell arrives before X and the first door cell.

## Closure: what a part pool costs (explore run 20261003-1221, 2026-10-03): law measured on one front, pool designed

The closure kind (above) grows its bud one unique cell after another from free parts, and the next generation's parts
are copies made while cells are unspent. How large must the pool be? An argument, not a run (a pool of 47 types does
not exist yet in any world):
- **When a cell is copied.** With openRange r (the kind needs r = k + 1, k = the anchor's distance from the root) a
  cell's `&` side is unspent while a front emitter is fewer than r bonds away, i.e. from its arrival until r more cells
  have arrived; its forward link (an `@` side, never spent) is a free side until the next cell arrives. With the
  narrowing of this run (a copy blank binds no anchor side) the anchor cell follows the same law; before it, a waiting
  anchor was copied for as long as it waited (22-35 times per world in `budpore 300`), far more than any other cell.
- **Blanks and parts reach a site at the same rate.** Both are single unit triangles moved by the same kicks, and
  binding takes either within `capture` of the site whatever its orientation. So while front j waits for part j+1, the
  expected number of copies it gets is the ratio of blanks to parts j+1 near the front, per free unspent side, summed
  over the waits it stays unspent: two free sides during the first wait, the `&` side alone during the r - 1 waits
  after, so c_j = (2 + (r - 1)) rho_blank / rho_part = (r + 1) rho_blank / rho_part.
- **Steady state.** Each generation uses one part of each type and makes c_j copies of it, so the pool is steady when
  c_j = 1: about r + 1 parts of each type per blank near the growing bud, and 46 (r + 1) parts per blank in all for
  the R 5 kind (92 per blank with the anchor on the root, r = 1). A smaller pool grows by itself (each front waits
  longer and is copied more) but converts the food into early types first: from one part of each type and 100 blanks,
  the first fronts would take most of the blanks before the ring is half grown.
- **Consequences for priority 3.** (a) Seed the first pool at the steady ratio (labelled), and keep blanks scarce
  where the bud grows: the bud grows best outside the parent's food, in a part-rich medium, and the genome is fed
  where parts are rare (inside, through the pore). (b) Fewer types help linearly: a periodic ring of m motif types
  needs m (r + 1) parts per blank (14 for m = 7), so the periodic alternative with door cells (above) is worth its race
  for large cells. (c) Every plain free side is copied for ever: the kind's seed site `y` (plain glue, never spent)
  makes copies of E whenever no bud sits on it; one of the kit's costs to measure.
- **Measured on one front (demo `pool`, same run).** With B and n held fixed by a harness: copies at the forward site
  per bound part = 0.90-1.03 x B/n when it is the only copyable side of its body, 0.48-0.55 x B/n with three more
  copyable sides beside it (they absorb blanks before these reach the front; parts are not absorbed), plus about as many
  again at the front's `&` side. So the estimate holds up to a geometric factor near one half: about (r + 1)/2 to
  r + 1 parts of each type per blank near the bud.
- **Not yet checked:** a whole bud growing from a pool (47 types), and crowding at that many parts per blank. (Checked
  in run 1420, demo `budpool`: section above.)

## Grow a finished membrane by breaking it and inserting triangles (user, 2026-10-03)

"A mechanism to grow or lengthen a membrane after it is built by breaking and inserting triangles. Just a thought,
don't know how feasible." Not built yet; first notes (harden run 20261003-0950, analysis only):
- **Why it matters here.** Closure (NEXT priority 2) needs the bud to become its parent's kind; today the bud is a
  smaller ring (R 5 vs R 7). A bud that is born small and grows its ring after the split would remove that asymmetry,
  and a small bud is cheaper to grow and to wall off. It also gives a cell room for more food (bigger cells, above).
- **Rigidity: one cut opens nothing.** A ring cut at one place is still one rigid body (physics moves bonded blocks as
  one piece), so the gap never widens. It needs two cuts, so the ring falls into two halves that can move apart.
- **Lattice closure: insert on opposite sides together.** A hexagonal ring of unit triangles with sides a1..a6 closes
  only if a1 + a2 = a4 + a5 and a2 + a3 = a5 + a6. Lengthening two opposite sides by one each keeps that (an elongated
  hexagon); one side alone does not. One-row walls alternate up and down cells, so each seam takes a rhombus (two
  triangles). So: two seams on opposite sides, each a `&`-style bond that lets go, each refilled by two triangles.
- **The hard part: keeping the halves aligned.** Two free halves drift and turn; re-closing needs them flush again
  (glue closure only binds flush sides, 0.05). The one existing move that brings a whole body flush is the anchor
  catch (`_snapBody`), which today takes only strand ends. Options to weigh: inserts that grow from one half as a
  front (open signal holds the other seam closed until they arrive), so only one half moves at a time; or a seam
  that hinges (casting-lineage hinge marks) so the halves stay joined at one corner while the gap opens. Either needs
  a design sweep before a demo, and possibly a core case (a body catch on a seam side) under RULES "Core changes".
- **Where the inserts come from:** copy blanks binding the exposed seam ends (as `imprint`'s growing front), so the
  insert is a copy of the wall cell beside it; the walls must be unspent there while the seam is open.

## Shut the parent's half by a catch after the bud's (design lesson, build run 20261003-0751, 2026-10-03)

- A bud on copies starves if any parent strand is outside after the split (free strands beat cells), so the parent's
  half of the doorway must be shut by the time of the split. Shutting it by a binding event (a catch) is the one-way
  step; the catch must come after the bud's, since a parent plug that catches first narrows the passage to a pore no
  strand passes.
- Ordering two catches locally: the parent's plug anchor is bonded to a free cap while the bud's anchor waits; the
  decaying signal releases the cap one pass before the doorway (parity of distance), and the freed anchor's own signal
  then holds the doorway until it has caught (`budpore` option `BUDCAP`, INNOVATIONS run 0751). A tooth bonded to the
  bud does not work: it frees the anchor only at the split, and the window lets strands out.
- Bigger cells (user, 2026-10-03) were tried for the parent: a radius-9 parent holds 160 blanks (radius 7: about 80);
  the extra food stays in the parent unless the bud is fed before its catch.
- Still open: after the split a plug in the wall exposes its backs to the outside food, and so does any freed plain
  side; a bud on copies needs its food to reach its interior before such exposed templates take it.

## Reuse glue letters in separate compartments; bigger cells (user, 2026-10-03)
User (during core-review run 20261003-0450): "It seems it is useful to have many different basic structures that can
be combined to a larger one. That needs a lot of different types of sides. One way to reduce type need is to have
connection blocks for the basic structure be different in different environments (different combination of side
types). Of course that means these areas have to be kept sterile, but possible with cell-like walls. Maybe also
bigger 'cells' are needed - much is stuffed in there now."
- Why it fits: glue letters are labels with no rule of their own, and binding is local, so a letter means something
  only among the triangles that can meet. Two sealed compartments can use the same letters for different joints, as
  cells reuse one genetic code in separate bodies. The letter budget (63 pairs, a grown bud of side 5 uses 54: NEXT,
  Pitfalls) then limits one compartment, not the world. No core change: spent `&` walls already keep compartments
  sterile (`imprint m`: every copy goes to the genome), and a hooded pore lets blanks in without letting strands out.
- What it needs: each compartment's parts must never leave it (the way in is the way out, above: openings bent or
  closed by binding), and food that enters must be uniform blanks (copy blanks carry no letters until they copy).
- Bigger cells: today's cells are R 5-7 with the genome, an anchor, a doorway and the food inside; strands press
  against walls (backs in a wedge get no copies). A larger ring costs only more wall cells, which are spent and so
  cost no food; worth trying when a slice is limited by crowding (`budpore`'s parent half).
- Not yet built or measured.

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
- Information capacity: now only the two strand ends expose seeds (hidden backs are random fills). Since
  2026-10-03 fills must carry the complement of the docker's lateral glue (once the option `latGlue`), so every back is determined by its face's docker type,
  and the face sequence decides a sequence of parts along the back: a real genome-to-body mapping.
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

## Pitfalls learned (copy lineage; moved from docs/NEXT.md, cleanup run 20261003-1351)
Roughly newest first. Add new ones here; docs/NEXT.md points to this section.
- **Growth cannot stop beside a gap** (2026-10-03, run 1121). A ring grown from a periodic motif ends only by closing
  onto a cell already there (cells of one motif index are interchangeable among the six repeats), so a grown ring with
  a pore needs unique cells up to the pore's far edge, or cells released later. Unique cells lie on segments grown
  from the root.
- **Two aligned 3-cell halves pass no strand** (2026-10-03, run 1121; run 0320 for a 3-cell bud half). The doorway's
  waist is one unit wide and two rows long: 0 of 8 worlds; 7-cell halves pass (4 of 4).
- **An anchor at a doorway's edge holds its strand across the doorway** (2026-10-03, run 1121). A strand caught on the
  pore side of an edge cell (or one cell from it) leans over the opening; as a parent's founder it jams the doorway
  (1 of 4 transfers, 4 of 4 with the founder elsewhere).
- **A catching anchor must carry `@`** (2026-10-03, run 0751). An attached glued side without `@` binds any free
  triangle with the complementary glue (glue catch): a plain `Z|` anchor was capped by a lone face copy and never
  caught a strand. With `@` it binds only a part's `@` side, so only the anchor catch (strand ends) can take it.
- **A waiting anchor near food is a food sink** (2026-10-03, run 0751; narrowed run 1221). Its unbonded `@|` side was
  copied by every blank that touched it (29-69 copies per world); since run 1221 no copy blank binds an anchor side.
  The anchor cell's own `&` sides still stay unspent while it hears its own signal (60-68 copies once exposed): keep
  waiting anchors' cells spent elsewhere or away from food.
- **A strand lying in a wall row facing a fed interior gets no fills** (2026-10-03, run 0751). Its faces meet all the
  food and its backs none: all blanks become face copies, no back copies, copying stalls (80 copies, 12 docks).
- **Signal decay is simultaneous** (2026-10-03, run 0751). When an emitter stops, every cell within range reaches 0
  within the same one or two passes (value R - t or R - 1 - t by distance parity), so `&` cuts cannot be staged by
  distance, only by parity: a cell with R - d even reaches 0 one pass before one with R - d odd.
- **An opening that lets a strand in lets it out** (2026-10-03, run 0320). Motion is reversible: a doorway, pore or
  gap a strand can pass one way it can pass the other, and it stays open after a split. Keep strands in with a bent
  opening (hooded pore) or a binding event (a catch, growth); never count on a narrow straight opening.
- **Changing a layout moves the automatic anchor choice** (2026-10-03, run 0320). `budpore` picks D's anchor by distance
  and corners; with another gap it took the gap's edge (the strand stood outside). Pass `BUDA` and dry-run (`BUDDRY=1`).
- **Where a caught strand's backs face** (2026-10-02, run 1921). A strand caught by an end stands at 60 degrees to the
  wall, leaning one way fixed by which end is caught and the strand's handedness; its backs then face either the acute
  wedge (a back site can be covered by a wall cell) or the open side. Backs in the wedge get no copies, so there are
  no fills and copying stalls after a few docks. Dry-run the capture and measure back sites before placing an anchor.
- **Prepared bonds need no glue** (2026-10-02, run 1921). A weld glue left on a prepared side becomes active when the
  bond is cut (a latch letting go) or on every copy of the cell: copies of `f`/`F` cells glued onto each other and grew
  crystals. Zero the glue of prepared walls; give glue only to sides meant to bind.
- **A freed side is a food sink.** Every free, unspent side of an attached triangle is copied by every copy blank that
  reaches it, glue or not (a released latch side: up to 105 copies). Count exposed sides after each event, not only at t=0.
  A bond that comes apart once should be an `&` bond: its freed sides are spent (`budpore` since run 0050).
- **A strand caught while busy needs fills from elsewhere** (2026-10-02, run 1551). Anchors catch busy strands; the
  strand and its partial copy are pinned in the anchor's orientation. If its backs then face a wall (a narrow wedge),
  no back is copied there, and a copy caught before any back copy exists never gets a fill (`imprint p` seed 2). Place
  anchors so a caught strand stands into the cell with backs open, or keep other strands copying nearby.
- **Glue letters run out; seed letters clash** (2026-10-02, run 1351). The glue code is Int8: 63 letters, and a grown
  bud of side 5 uses 54. A genome in the same world needs its own letters (`avoid`), and the bud's seed glue must not
  be the genome's (a free part carrying the anchor's `Z@` bound the parent's seed side `z@~` in place of the root).
  Prepared bonds that never let go can share one letter (`f`).
- **The last open-signal source must arrive early.** A grown pair holds while anything hears an open signal; latch
  sites emit none. If the content seed (cap seed, anchor) sits late on the wall front, the panel front completes first
  and the root lets go of a half-grown bud. Put it early and give the cells before it more supply.
- **A site needs an open approach, not just a free side** (2026-10-02, run 1050). Binding needs the part within the
  capture tolerance of its place, so a site whose way in is a channel exactly one block wide (0.866) fills only by luck:
  the grown bud's last site beside the parent's corner apex, an import door's drop place boxed in by its open panel,
  the wall and a strand. Check new layouts: mirror the site across its free side; that place must share no side with
  another cell, and anything a door drops needs room to leave its sweep.
- **One-front rings: the last two sites.** Sites alternate outward / inward along a one-row ring, so with one growth
  front and an outward root the second-to-last site faces inward. While it and the last site are both open, the gap
  through the wall is a rhombus exactly one block wide: only a part already inside can fill the inward site (imprint's
  rings stuck at 28/30). `ringKit(..., seedIn)` ends on an outward corner pair instead, but puts the root (and its
  anchor) inside; that changed what imprint copies (tried, reverted: rings stalled at 7 cells).
- **An open-signal hold exposes its whole range to copying** (2026-10-02, run 0921). `&` sides are spent only where
  nothing is heard; every wall cell within `openRange` of an emitter keeps its free side and is copied by any blank
  that reaches it, from inside or outside. With blanks outside, a pair held by `&` pairs (range 27, or 11 with two
  anchors) lost 98% of the blanks to its walls. Start the structure spent and hold by one `&` bond that hears the
  anchor (`budpore` since run 0050; spent sides stay spent), so only the anchor side is ever unspent.
- **Anchors in the middle of a flat wall.** An anchor next to a hex corner lays its strand along the next wall with its
  backs hidden: no back is copied, so no fill exists and copying deadlocks (`budPair`'s P anchor is such a place).
- **One gap per one-row ring.** A pore plus a doorway cuts a ring's wall into two bodies.
- **Copy blanks go to every exposed side.** Walls take most of a batch (65-70% in a cell). Mark plain wall sides `&`:
  they are spent once the structure hears no open signal and are never copied. Copies of `&` cells used as fills are
  cut when their `&` side hears none: give backs a lateral glue so only genome back copies fill (fills match the edge's glue).
- **Latch sites emit no open signal** (`@~`): a front of latch sites carries the lock signal, not the open signal;
  something else must keep a structure open (ordinary sites, a content seed) or its `&` sides cut early.
- **Physics leaks found 2026-10-02** (fixed): check new closed structures for escapes with a trace (cast products and
  released parts start touching their neighbours).
- **Bodies longer than half the world** were folded by the torus minimum image (fixed 2026-10-01, `_unwrap`). Keep
  world size larger than any body anyway (pictures and inside tests use minimum images).
- **A closing door stalls on anything in its sweep**; a strand lying across a doorway can jam it for good.
- **Apostrophes in test names**: `'` inside a single-quoted test name breaks the file (twice this session).
- **Locality (user, 2026-10-01).** Before writing a rule, ask: does this triangle know this through its own bonds,
  a direct partner's exposed value, or a relayed signal? "Same structure", "smaller body", "partner's partner" are
  not local (all three were written once and undone). Physics may treat a structure as one body; chemistry may not.
  See AGENTS.md (Locality) and RULES.md (Locality audit).
- **Inside or outside a hex ring: use `hexr`, not Euclidean distance.** Near a hexagon's corners a side on the inner
  boundary can lie farther from the centre than (R-0.5)H; for R >= 6 twelve sides were misjudged, so a door kit's last
  site faced inward and the ring could only be closed by triangles already trapped inside (fixed 2026-10-01).
- **Trailing comments in one-line code.** Twice a `// comment` appended inside a long line swallowed the code after it
  (no error, wrong behaviour). Put comments on their own line.
- **Rigid machines.** Every swing must be clear: sweep a design before building it (`structures.ring` shows how). A
  flap whose catch side stays flush with its cargo re-closes on it at once (hence the hand-off and at-rest rules).
- **Enclosed holes.** A site whose three neighbours are all present before it fills can never be filled (no free
  triangle can reach it: rigid parts never pass through). This caused the copy deadlock (fixed by zip) and the grown pocket
  stall (fixed by `pLoose`). Check every new design for sites that can become enclosed.
- **lockBusy and other relays are Int8**: lockRange above 127 overflows (no lock at all). Use at most 120.
- **Supply races decide reliability.** The founder's first dock races the membrane root (cells); leftover kit parts
  trapped in a closed ring jam its door (live). Supply ratios are design parameters: check them on 4 worlds.
- Shared edges of a prepared structure must have opposite directions when you write glue onto them.

## Pitfalls from the casting lineage (moved from docs/NEXT.md, cleanup run 20261002-1821)

Design lessons from kits, pockets, doors and flaps (the casting lineage, frozen since run 20261002-1751). The pitfalls
for current work are in "Pitfalls learned (copy lineage)" above.

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
- Dockers used as fills expose their side glues on hidden backs: give dockers dedicated fill types when they
  carry seeds (fills match the lateral glue since 2026-10-03).
- A latch must stay released while its door opens; any doorway makes a 2D ring a C (use airlocks).
