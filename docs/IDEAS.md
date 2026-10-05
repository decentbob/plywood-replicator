# Idea notebook (typed-triangle world)

Ideas and design lessons for the typed-triangle simulation, most of them the user's. ROADMAP ranks the work; this
file keeps the reasoning so it is not lost. Add new ideas at the top of their section, with the date.

## The BIG goal (user, 2026-10-01)

An organism with a metabolism that constructs its offspring and feeds it until it can live on its own, then splits
it off. Build every mechanism in isolation and combine them later. Module table in ROADMAP.

## Ask "who is waiting" at the part that exists only when waiting is possible: a receptor on the last cell (build run 20261004-2221, 2026-10-05)
The anchor cell does two jobs: in a parent it holds the strand where blanks reach it, in a bud it decides from when
the bud can catch (and, with a cutter at the anchor, from when it can die). One cell cannot serve both: on cell 6 the
strand is copied but a cutter kills every growing bud at 7 cells (run 2051); on cell 44 (or 40, 38) only nearly
complete buds are exposed but the held strand hangs in the pore and its first copy jams (12 worlds, INNOVATIONS run
2221). Decoupled with what the kit already has: the cutter's target is a second site on the last cell E, an
attach-and-release side `Г@&`. E exists only on a complete bud; an `&` side binds only while its triangle hears an
open signal, and on a complete bud only a waiting anchor sends one; once it hears none the side is spent for ever.
So the receptor is open exactly while a complete bud waits for its catch (openRange covering the 40 bonds from anchor
to E). The pattern is general: a site placed on the part made last, with an `&` mark, asks "complete and still
waiting?" with no new rule. Cost found: a parent hears its attached bud's open signal (its seed cell is next to E), so
a parent whose own bud is already growing when it catches keeps its receptor open; buds that bud only after letting
go (candidate (n)) would close that too.

## A body taken apart whole returns one of each of its parts: lysis (explore run 20261004-2051, 2026-10-04)

The first reverse path (RULES, Core changes; INNOVATIONS run 2051). Why this one of the user's four ideas: turning
typed triangles back into blanks loses what a body knows (a part type is remade only by copying an exposed copy of
it, so decayed types run out: run 1021's setup C); cutting single bonds at random splits a one-row arc into two
pieces whose open fronts both regrow. Taking a body apart whole, in one wave, returns exactly one of each of its parts,
fresh, the per-type balance a pool needs. Lessons: (1) **a cut must spread, or the pieces regrow**: lysis moves one bond
per pass, and a lysed triangle binds nothing until it is free; (2) **a joint stops it**: the `&` bond between a bud and
its parent is the one bond made to come apart, so lysis does not cross it and a parent survives its bud's death;
(3) **who dies is chosen by glue and by where the target sits in the growth order**: a cutter is a part that binds a
waiting anchor, the site that is open only while a bud has no strand; with the anchor early in growth (cell 6) every
growing bud dies, with it late (cell 44) only a nearly complete or waiting one; (4) **the kill rate must lose to growth
and catch**: 4 cutters in a 30 x 30 world find an open anchor in 4-10 thousand steps, faster than a bud's last two
parts arrive one copy each, so a lineage needs few cutters, more parts, or an anchor that opens last; (5) **freed parts
lie next to their old sites**, so they re-bind within a pass or two: that exposed a one-pass lag in the open relay (a
triangle joined by partners that were free a pass ago hears 0, so a re-bound root is released as complete), an old
weakness that slow growth from a pool hid (candidate (o) in NEXT). Predation and scavenging (the user's interest)
follow from the same mark with other glues: a cutter whose side matches an adult's exposed site would prey on adults.

## Rules must let replication go on indefinitely: a way back to blanks (user, 2026-10-04)

The user asked whether any block can be changed or only blanks: only blanks change (contact copying turns a blank
into a copy of the part it touches); typed parts never turn back and bodies never come apart. "If only blanks then
the simulation will just run out. Rules in the simulation should be set so it can continue replicating indefinitely
(and probably reverse stuff)." Measured the same day (build run 20261004-1021, INNOVATIONS): in a closed world the
blanks end as kit parts, leaked strands and new bodies, and the lineage stalls after 2-3 generations; a labelled
drive returning unused monomers to blanks only churns, and one returning free kit parts empties the rarely copied
types. So the core needs a reverse path (typed triangles back to blanks) that keeps every part type available, and a
way for finished or dead bodies to come apart: a core change (explore or core-review run; NEXT, candidate (m)).

The user's follow-up ideas (same day, "just ideas, not thought through"): whatever rule set the world settles on must
have no limit that eventually stops replication, so blocks must circulate back into the mix, by decay or by a
mechanism. (1) **A block type or mechanism that cuts other bodies' bonds** (very interesting to the user: it could
evolve into predation and scavenging: something that takes apart dead or living bodies and returns their parts).
(2) **Wider molding:** contact copying could act on typed triangles too, not only blanks. (3) **A way to revert
blocks to blanks.** (4) **Molding one side at a time:** a copy changes one side per contact, so a triangle can move
step by step to more or fewer side rules (types change gradually, in both directions, instead of a blank becoming a
whole copy at once).

## "Feeding" the offspring means giving it building blocks (user, 2026-10-04)

The user, on the goal sentence "feeds it until it can live on its own": the intent is that the parent provides the
offspring with all the usual building blocks it needs to grow and later replicate itself, not a new block type or an
energy type (energy existed in the removed casting lineage). In this world the building blocks are the unit
triangles themselves: copy blanks `-?-?-?` (untyped) and the parts and monomers made from them by contact copying.
Records have called blanks "food"; read that as "building blocks". Today the bud takes its parts and blanks from the
shared environment directly and the parent gives it only a seed site and a strand, so the goal's feeding step (the
parent passing building blocks to its bud) is not built yet.

## Breadth starves depth: a bud should bud only after it lets go (build run 20261004-1721, 2026-10-04)

Measured in `budcycle` with a sink census (INNOVATIONS, run 1721). Every chain whose bud never copied its own strand
failed the same way: the bud, complete and waiting for its catch, grew its own bud from its seed site, and that bud
caught the next leaked strand first. Food was there; the order was wrong. Nothing local stops an attached bud from
budding, and no seed cell hides the attached bud's seed site. An oracle that opens a bud's seed site only after it
lets go makes every chain bud copy its strand after let-go, which is the goal's "lives on its own" in local terms, but
two costs show: the lineage now waits on catches (100-400 thousand steps each: the parent copies its strand only
4-12 times), and when catches come faster (no E source) the parent and every adult keep budding, so surplus buds of
generation 1 take the fixed pool before generation 3 starts. Lessons: (1) in a closed world, breadth (the number of
buds each adult makes) and depth (generations) draw on the same stocks; a lineage that should go deep needs either
material coming back (the reverse path) or a limit on breadth; (2) a sink census per template is cheap and settles
"is it food or order?" before a layout is changed; (3) a component placed at the pore (the E source) takes the food
that comes in first: placement decides who eats, as with the fronts in run 0251.

## A stock is not a metabolism (direction check, review-intent run 20261004-0751, 2026-10-04)

Measured with the census in `budcycle-free` (INNOVATIONS, run 0751): the food stock is gone by the first split and
the part pool's mean halves over two generations, so the lineage ends when either stock ends. With conservation,
indefinite cycles need a material loop: food that keeps arriving, which in a closed world means material returning to
food (waste monomers, free kit parts and abandoned bodies decaying to blanks: a labelled drive) or an open boundary.
The pool is renewable in principle (a growing bud makes about 2 kit copies per part used while food lasts) but has no
per-type regulation: a front waiting for part k+1 exposes part k, so scarcity makes copies of the type before the
scarce one, not of the scarce one. Lessons: (1) count every prepared stock's balance per generation before calling a
cycle self-sustaining; (2) "lives on its own" (the goal) has a local measure, the bud's own copies after the split and
its own bud's catch of one, and that is the target, not the number of generations alone.

## Sterile leaks make the doorway unnecessary: bud off the corner (explore run 20261004-0621, 2026-10-04)

The kind's doorway (the bud's pore facing the parent's) was designed when the bud had to receive a strand directly.
Since `heldCopy` (run 1720) a leaked strand is sterile but catchable: the parent's 7-cell pore leaks every copy, and
any waiting anchor can catch one from open space. So the bud can grow anywhere on the wall. Placing it across the pore
cost the most: the growing bud sat in the parent's food stream, and once complete it sealed the pair, so a parent
without a copy by then never made one (run 0251). With the seed site on the cell beside the top-right corner
(`budKit(..., seedAt=45)`) the bud hangs off the corner, its pore facing the parent's across an open wedge: food reaches
both pores, leaked copies drift into the bud's, and the bud may complete long before it catches (it waits; its root
holds while the waiting anchor emits). Lessons: (1) a mechanism made redundant by a later rule can be the next
bottleneck: re-check old layout choices when a rule changes; (2) the order "complete, then catch" is now safe, so the
race between growth and the parent's copying no longer matters. Still open: the bud copies its caught strand only 0-2
times after the split, so a lineage runs on its first parent's copies; a bud whose own copies feed its own bud is the
next step for indefinite cycles. Other outer cells give other wedges (the pose of each is in `budKit`); only 45 tried.

## Food goes to whatever templates are exposed; walls should not be templates (build run 20261004-0251, 2026-10-04)

Measured with `budcycle` without the harness (INNOVATIONS, run 0251). Contact copying turns a blank into whatever
attached triangle it touches first, so food divides among templates by exposure, not by need. The kind exposes
dozens of open wall sides and one held strand; three quarters of the food became kit parts. Three lessons.
- **A stock is taken by the fronts of its time.** Copies per part used go as blanks / parts near the front (run 1221's
  law), so a stock is converted at the first fronts (types 0-9 here) and nothing is left for later ones or for the
  genome. Narrowing which sides are copyable alone does not help (oracle: the copies move to the `@` fronts); food must
  arrive over time (a supply, labelled) and templates that need none must be closed.
- **Walls should be closed sides.** The kind's wall sides were `-&` (copyable until completion spends them); a growing
  or anchor-waiting bud keeps 16 cells open for a long time, in the doorway where the parent's food passes. A `-|` side
  (the anchor mark, no glue) is closed from the start: a wall needs no other property. With a supply, closed walls
  move the food to the genome (gen2 0 -> 2 of 4).
- **The sealed pair starves the parent.** Once the bud is complete before its anchor has caught, the pair is sealed
  (pores face each other): no food reaches the parent's founder, so no copy is made and no catch ever comes. The
  parent must copy while its bud grows: the order "catch, then complete" (7 of 8 in run 2221) is a race against the
  food supply. Ways: a bud that grows slower than the parent copies (fewer parts per type), food inside the parent at
  the start (30 blanks inside made it worse: 0 of 4, monomers made but not assembled; not understood), or a kind
  whose bud cannot seal before its catch.

## Monomers are made in proportion to exposure, not to need (explore run 20261004-0022, 2026-10-04)
Contact copying turns every blank into a copy of whatever attached side it touches first, so the mix of genome
monomers follows which sides are exposed, not what copying uses. Anything that adds exposed sides of one type skews
the mix, and the scarcest monomer sets the copy rate while the others pile up as dead food. In `budcycle` one binding
did it (a back monomer glue-capping a strand's low end: the cap hid one face monomer's source and was itself copied
over and over; INNOVATIONS, run 0022); removing strand-end glue binding brought the mix to about 1 : 1 : 1 and the use
from 17-46% to 47-86% of what was made. Lessons: (1) count a food sink by what is made and what is used, per type,
before blaming the amount of food ("food after the split" in run 2221 was mostly this); (2) a rule that stops copies
in one place moves them elsewhere (the oracle for free strands, candidate (g): the blanks went to the held strands
instead), because every blank is copied somewhere; (3) left over: a copy still uses 2 : 2 : 3 of a mix made about
1 : 1 : 1, so back monomers can run short first now (seed 1: 18 left with 77 face monomers), and the strand's
middle faces are copied far less than its ends (seed 3: 9-10 copies each, against 43-53 for each end's two free
sides). In a sealed cell with little food (`imprint m`, 60 blanks) the backs are the limit already: 13-19 fills to
30-36 docks, 3-5 strands where the caps' back copies had allowed 5-8. A genome whose exposure matches its use would
waste less; not tried.

## A bud that catches early splits early and finishes alone (build run 20261003-2221, 2026-10-03)
The kind was designed for one order: the bud completes (sealing the pair), then catches a copy, then lets go. In
`budcycle` (no stand-in) the bud's anchor on arc cell 6 is exposed from the moment cell 6 binds, next to the pore
the parent's copies come out of, and catches one while growing in 7 of 8 worlds. With openRange 9 its root then hears
nothing (the front is more than 9 bonds away) and lets go: the bud leaves as an open arc holding its strand and grows
the rest of its wall alone from the pool. Three consequences. (1) It is a working cycle, not a failure: every such bud
completed and ended in its parent's state. (2) The sealed pair's last-cell problem (run 1420: only an E part inside at
sealing finishes the bud) disappears, because the early-split bud's last site opens outward; it returns only when the
bud completes first (seed 2 of the openRange 50 batch stopped at 46 of 47). (3) Making the root wait for both
(openRange at least N - 1, 46) keeps the whole bud unspent while it grows, and blanks copy its wall 2-10 times more
(time and food at the doorway, and in 2 of 4 worlds the founder's first copy stalled). So openRange 9 stays: the
order of catch and completion is left to chance, and both orders end in the same state.

**Food after the split is the next limit.** Blanks copy the sides of every strand, held or free (sterile strands are
still contact-copied), and the copies pile up as free face and back triangles only a held strand can use: 200 blanks
are gone by t = 75000, long before most splits (t = 145000-218000). Recycling free genome triangles outside the cells
into blanks (a labelled drive) recycles the parent's own face copies before they dock and did not raise the bud's
copies. Ideas for the next run: the strand's triangles as `&`-like sides that are not copied once the strand is free
(no core: would need a mark that reads "held"), a hooded feeding pore on the kind (IDEAS, run 1650: one opening per
body), a larger or steady food supply outside, or fewer strands per generation (one copy per bud is enough for the
cycle: the bud catches one).

## The kind's anchor moves off the pore's edge (build run 20261003-1921, 2026-10-03)

With `heldCopy` an anchor holds a strand by its high end, and a strand held that way leans the other way from one held
by its low end. On the root's pore side (where run 1121 put the kind's one anchor, so that it could both catch and
hold) it stands out of the cell into the doorway, in parent and bud alike (`budpore` dry-runs `BUDDRYP`, `BUDDRY`), and
the pair never splits. So the anchor goes on an inner side further round the arc: even arc cells only (in a one-row
ring the free side alternates inner and outer), and of those cell 6 is best (backs and faces furthest from the wall;
cell 4 copies 1-4 times after the split where cell 6 copies 3-11). What the move costs and keeps:
- The root still holds the bud by its `&` seed bond, but now hears the waiting anchor from 6 bonds away, so openRange
  must exceed 6 (9 in the test and `budpool`). More cells hear during growth, so fewer of their sides are spent while the
  bud grows: about three times the copies (a food sink), and more of the pool's types refilled.
- The anchor is exposed to the outside from cell 6's binding until the bud seals the pair (on the root it was exposed from the start). A strand caught then (a
  leaked, sterile copy, which the catch makes fertile) would silence the anchor early; the root then holds only while
  the growth front is within range of it, which it is not after cell 9 or so: an early catch would split an unfinished
  bud. Not seen (`budpool` has no strands); a question for the whole cycle (priority 3).
- The two numbers that decide a held founder's first copy (the back sites' distance from the wall, and no face site
  nearer than 1.00) are necessary, not sufficient: sides beside the doorway with good numbers fail (copies leave).
- A sealed parent with few blanks inside can still stall at its first copy (no back copy among its 20 blanks); in the
  kind the parent copies through its open pore before a bud seals it, so the pair should start with copies made.

## The kind's opening: the parent cannot see its bud finish; make free strands sterile instead (explore run 20261003-1720, 2026-10-03)

Run 1650 asked the next `explore` to weigh three designs for the parent's opening (narrow at rest, wide once the bud
has sealed the pair, narrow again after the catch). On paper, in the kind's geometry (`budKit`), none works:
- **The bud's last cell touches its parent only on a spent side.** The bud is its parent turned by an involution T
  that maps the root's seed edge onto E's seed-site edge, so it also maps E's seed edge onto the root's: the bud's root
  sits on the parent's E (the seed bond) and the bud's E sits with its seed side on the parent's root's seed side, and
  that is the only edge they share (E's link holds the bud's cell N-2, its third side faces the doorway). The root's
  seed side was cut by completion release at the parent's own split, so it is spent and binds nothing: the event "the
  bud is sealed" never reaches the parent. Design (i) (a resting emitter at the parent's root silenced by the bud's last
  cell) has no bond to do it. Making that side reusable moves the cut to E's seed side, which is then spent after the
  first bud (one bud per cell), and E's `&` seed side would be spent at rest anyway (E hears no signal).
- **A release by signal fires at the wrong end.** Signals move through bonds only. The bud's root binds the parent's E
  and emits (its anchor and its forward link) from the bud's first cell on, so a release by signal on the E side opens
  the parent during the whole growth (100-200 thousand steps, the pair is not sealed until cell N-2); on the root side
  it never fires (the bud's front is 40+ bonds away through bonds, and the kind's openRange is 1-3). Design (ii) fails
  on timing, not on locality.
- **Fission** (iii) needs a septum and insertion growth on rigid bodies (two cuts, halves re-aligned flush): no step
  of it is near. A hood keeps strands in and therefore out: no transfer through it.
- **Turn the problem round.** The opening matters only because a free strand outside copies itself from the open food
  faster than any cell (run 0320). If only a strand held at the wall is copied, a leaked strand is sterile: it costs the
  cell one strand and feeds nobody's copying (its free sides are still contact-copied, which makes dockers and fills that
  any held strand can use). Then both cells may keep their 7-cell pores, the doorway needs no closing event, and the
  parent's founder and the bud's caught copy are the templates. One condition on an existing relay does it: zip starts
  at a strand's high end only while that end's spare edge is held (not by `&`). Option `heldCopy` (RULES, Core changes,
  run 1720). Biology has the same arrangement: a bacterial chromosome is replicated from an origin attached to the
  membrane, and naked DNA outside a cell is not replicated.
- **What it asks of the kind.** Anchors must catch high ends (glue `Z`, the genome's high-end seed `z`) and carry `@`
  (a free face copy carries `z` and caps a plain `Z|`: seen in this run's first batch, the pitfall of run 0751 again);
  a cell's copying is linear (one held template) instead of exponential inside; leaked strands pile up as inert
  material (and can be caught by any waiting anchor, which is a transfer, not a loss).
- **Measured (same run).** `imprint` with a held founder: three rival strands outside leave the cell 6-7 strands (2-3
  without the option); a 7-cell pore leaks every copy and the founder keeps copying. `budpore 300` (open pair, both
  anchors on high ends): the bud makes 10-15 full copies after the split in every world that split (5 of 8 seeds and 3
  of 4 checked; 0-1 without the option). M2, open since run 1921, came from one condition on zip, not from closing the
  doorway. Left for the kind: a held founder must finish its first copy alone (its backs must face open space, since
  no back copy exists until it has made one); the kind's root anchor holds the founder at the pore's edge (run 1121:
  it jams the doorway), and the transfer on the kind's own layout is untested.

## The kind's opening: one opening per body, and only silence widens one (build run 20261003-1650, 2026-10-03): analysis

Priority 2 asks for an opening that is wide while a strand crosses to the bud and closed to strands while each cell
feeds. Three arguments (not runs) narrow the designs:
- **One opening per body.** A cell whose wall is one connected body has at most one opening (one passage between its
  interior and the outside). Two passages would make a loop through the interior, one passage, the outside and the
  other passage; the wall pieces between the passages lie on both sides of that loop, yet the wall is connected and
  never crosses it (on the torus too, for a cell smaller than the world). So a hood joined to both sides of its pore
  adds nothing (the ring already joins them; the corridor's mouth is still the one opening), and a feeding pore beside
  a doorway can exist only while a second body (the attached bud) joins the two wall pieces; that doorway must be
  closed by a binding event before the bud lets go, or the cell falls in two. Candidate (a) of NEXT reduces to "one
  opening" or "a doorway that exists only while the pair is joined". The pitfall "one gap per one-row ring" is a case
  of this.
- **Only silence widens.** In the copy lineage the one rule that cuts a bond is completion release, which fires when a
  triangle hears no open signal. A cell at rest (no growth front, no waiting anchor, no unbonded `@` side with glue)
  hears nothing, so every `&` bond in it is already cut: an opening narrowed by bonds at rest (a plug, a cap, grown
  cells) can widen later only if something within openRange of those bonds emits all through the rest and falls
  silent at the right moment. An emitter at rest is an unbonded `@` side with glue (a waiting anchor; a seed site
  written `y@`), and it keeps every side within openRange unspent, i.e. copied: a food sink.
- **The bud cannot time its parent near the junction.** The bud's root carries its anchor, which emits from the moment
  the root binds until it catches; so every parent cell within openRange of the bud's root (the parent's E and its
  neighbours) hears a signal without a break from the root's binding to the catch, and the silence after the catch is
  the split itself. A release in the parent before the catch can happen only far from the junction, at the parent's
  root, which the bud's front reaches last (by the pose): there the bud's last part could bind and silence a parent
  emitter, the one local event that marks the bud's completion.
- **Consequence for the kind.** Each generation the parent's one opening must go narrow (rest), wide (before the bud's
  catch), narrow (after the catch, before the split), each step a binding event: the widening a release (a resting
  emitter at the parent's root, silenced when the bud completes), the narrowing a second catch ordered by parity after
  the bud's (cap release, run 0751: 2 of 4). A released `&` side is spent and a bonded anchor catches nothing, so the
  parts that narrow the opening must be replaced every generation (grown again from copies). Designed in outline only,
  with three orderings that are each a race: not built. The next `explore` should weigh it against (i) fission with
  insertion growth (no transfer, so no doorway at all) and (ii) a core candidate, a release by signal (a bond cut while
  its triangle hears the open signal: the opposite polarity of `&`, read from the triangle's own signal), with which
  the bud's approaching front would reopen the parent's opening directly; the narrowing after the catch would still be
  a catch.
- **The bud's half already has its event.** The bud's opening narrows by its own catch (its genome as the plug, run
  0320: the bud alone made a full copy in 3 of 4), so the bud's half is solved by a binding event that exists; the
  parent's half is what the arguments above constrain.

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
  1, 0); with 40 E parts it completed in 8 of 8 (1-7 inside). E parts inside per E part in the world: 0.088, so
  P(complete) is about 1 - exp(-0.088 n_E) here (an inside area of about 80 of 900). Any kind whose pore lies between
  root and seed cell (the condition for facing pores) has this property, and a stalled bud waits for ever.
  Where E parts come from: the seed site `y` is plain glue and is copied whenever no bud sits on it (parent and bud
  alike), so a lineage over-produces E by itself, at the cost of food. Ways out, for priority 2 (the kind's opening):
  keep it and count on E-rich surroundings; give the parent an E source inside (a plain side of E facing the doorway:
  copied by the parent's own food, a food sink); or a kind whose last site is not at the pore: two fronts from two
  seed bonds (one per pore edge) meeting mid-wall, which needs the parent root's seed side to bind again after its own
  split (a spent side binds nothing: a core change).
  **Built (run 20261003-1650): an E source inside.** E's pore side plain (`budKit(..., eSource)`: `-` instead of `-&`,
  never spent) is copied by any blank that reaches the pore, so E parts form in the pore, which is the pair's inside
  once the bud has grown round. `budpool` with no E part in the pool (`BPES=1 BPE=0 BPB=16`): complete in 4 of 4, every
  last cell a copy of the parent's E (12-14 such copies per world; check `budpool-e`); with 8 E parts like the other
  types 4 of 4 (was 2 of 4); with 8 blanks and no E parts 5 of 7 (the two failures had no blank and no E copy inside
  after sealing). In the 16-blank worlds the E part that finished the bud was made long before sealing and was
  inside at sealing by drift (one in each), so the source works mostly by stocking the region around the pore, not
  by copying after the seal (once, in an 8-blank world, a copy made after sealing finished it). The kind then needs
  no E parts in its pool: each parent makes its bud's last cell. Cost: the plain side is copied at rest too (a food
  sink, not measured with a fed parent), and the E parts it makes accumulate.
- **A pool of unique types has no per-type regulation** (argument, supported by the runs). Copies of type k are made
  while cell k is the growth front, i.e. while it waits for part k+1 (openRange 1; with r > 1 also while the next r - 1
  cells arrive). So copies of k scale with the wait for k+1, which goes as 1/n(k+1), not with n(k): correlation of
  the wait for k+1 with the copies of k 0.56-0.78 in 4 worlds. The steady state (every n about c B) is neutral: a
  type's own count has no restoring force and drifts by about one per generation (Poisson copies, one used), so in a
  balanced pool some type dies out after about n^2 generations, and with it the lineage (walls are spent: no template
  of it is left). A supercritical pool (more than one copy per use) outruns the drift but grows on food. Measured: 0.91
  to 1.85 copies per used part (mean 1.37) at one part of each type per blank (8 and 8), as the law of run 1221
  predicts ((r + 1)/2 to r + 1 parts per blank for one copy per use). Fewer types make each count larger and the drift
  slower; a template that is copied when its own type is scarce would regulate, and none exists in this kind.
  Without the harness, with a stock of 100 blanks as the only food (`BPHOLD=0 BPB=100`, seed 1; the bud completed at
  157048): the parent's free seed site took 15 blanks before the root bound (E copies), the root 24 and cells 1-7 another
  31, and the stock was gone by cell 35; the last 12 types got no copy. As run 1221 predicted, the first fronts take a
  stock: a refill for every type needs blanks arriving all through the growth (a supply), not a stock.
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
  that hinges (casting-lineage hinge marks, removed from the core on 2026-10-03: they would come back only through
  the RULES gate) so the halves stay joined at one corner while the gap opens. Either needs
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
- **What it may remove later:** stamp marks (`'`) and, once dockers are copied from strands, casting itself. (Done
  2026-10-03, core review run 20261003-2121: the whole casting lineage left the core; RULES, Core changes.)

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
- *(run 2221)* **A late anchor starves the founder.** The held strand hangs from the anchor cell; on cells 38-44 it
  sits in or beside the pore, its first copy jams waiting for a fill, and no incoming blank reaches it (12 worlds at 44,
  4 at 40/38). The anchor on cell 6 jams too at first but clears in 100-180k steps. Place the strand where incoming
  blanks pass it.
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
  On a flat wall the wedge differs by side: one side over (2026-10-03, run 1520) `imprint p`'s anchor at x = 0 left the
  caught founder's outer back sites 1.53 and 1.73 from wall cells and 4 of 14 hooded worlds stalled (a founder caught
  before any back was copied: 50000-90000 steps without a fill); at x = -1 they are 1.53 and 2.31 and 14 of 14 pass.
  The back next to the anchor is always in the corner (0.58: a notch).
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
(The lineage was removed from the core on 2026-10-03, core review run 20261003-2121; code in git at `7415fd4`. These
lessons stay for any machine that comes back through the RULES gate.)

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
