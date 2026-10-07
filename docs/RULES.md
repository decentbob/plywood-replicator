# Rules of the typed-triangle world

The complete rule set of the simulation (`tri/`). Everything an experiment can rely on is here; the code is
`tri/physics.js` (motion) and `tri/sim.js` (chemistry). Every rule is local: it reads one triangle, its bonds, and
the values its bonded partners exposed in the previous pass. No rule counts, traverses, or reads an organism.

The casting lineage (casting, stamps, hinges and machines, latches and keys, energy, proofreading: 11 marks, two
relayed signals, charge and four other states, two options) was removed on 2026-10-03 (autorun run 20261003-2121,
core-review; Core changes). Its rules, demos and checks are in git at `7415fd4`; its lessons stay in docs/IDEAS.md
("Pitfalls from the casting lineage") and docs/INNOVATIONS.md.

## Material

- **One block:** the unit equilateral triangle (side 1). Blocks are conserved: nothing is created or destroyed.
- **Type** (fixed per triangle unless copied): three side glues, counter-clockwise, written as a string such as
  `aB-`, plus marks after a glue (below). Type strings are read side 0, 1, 2.
- **State** (small values that change by rules): fill (a copy triangle still being completed), spent sides, and the
  relayed signals and exposed values below.

### Glues
`a..z` pair with `A..Z` (complement = the other case); Greek `α..ω` pair with `Α..Ω` (24 more pairs) and 13 Cyrillic
pairs `б..э` / `Б..Э` (used by kits: 63 pairs in all). `-` is inert and binds nothing. Glue letters are labels: no
letter has a rule of its own. `f`/`F` is used by the structure builder to weld prepared structures (a builder
convention, not a rule).

### Side marks
| Mark | Meaning |
|---|---|
| `.` | close-only: binds only triangles that are already attached, never a free one by glue (no glue catch, dock or fill on it; a copy blank still copies it), and a free triangle binds by none of its close-only sides (a copy side too, since run 20261007-2051) |
| `@` | attach side: a free triangle that has one binds only by it, and never docks or fills (a part; if it also has a copy side, it binds only by that: Contact copying); an attached triangle's `@` side binds by glue only a free part's `@` side (a growth site for parts only; a copy blank still copies it, and an anchor `@\|` also catches a strand end); an unbonded glued `@` side of an attached triangle emits the open signal |
| `&` | completion release: the bond on this side is cut once its triangle hears no open signal (its part is complete); the side is then spent and binds nothing again |
| `\|` | anchor: an unbonded, unspent anchor side of an attached triangle catches a strand end's seed (complementary glue) as it would a free triangle; the strand is placed flush as one body (physics). No copy blank binds an anchor side: an anchor is never a template. Otherwise an anchor side binds as its glue does (a free one too since run 20261004-0820; an inert one `-\|` binds no glue and catches nothing: a closed side; the chain bonds, a fill (inert to inert) and copy closure, do not look at the mark, but no strand kit carries one) |
| `?` | copy side: a free triangle that has one binds only by it, to any free side of an attached triangle but an anchor side (any glue, inert too), takes that triangle's whole type and lets go (contact copying, below) |
| `!` | lysis side (since 2026-10-04, run 2051): binds as its glue and other marks say; the triangle bonded to it is lysed (Lysis, below) |

A type string with any other mark is rejected (the removed marks `< > * ~ $ + = % ' ^ #`; `!`, the casting lineage's drop, was
removed on 2026-10-03 and is the lysis side since 2026-10-04).

## Physics (`tri/physics.js`): rigid parts, move or stop
- Torus `W x H`. Blocks are rigid unit triangles; a **body** (blocks joined by bonds) moves and turns as one rigid
  piece. Nothing deforms, overlaps or squeezes (user, 2026-10-01: "no deformation and squeezing is fine and might
  even be good for deterministic machines").
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
  1.44; released parts start touching).
  A lone block's trial checks every block within its reach (fixed 2026-10-01: only blocks in the 3 x 3 grid cells
  around its start were checked, so a block near a cell edge could move into a wall cell farther away and leave a
  closed ring).
- `pairs`: blocks near enough to bond (centre distance within the two radii plus 0.23).
- Labelled exceptions used by the chemistry: binding places a free triangle flush in a free site; an anchor's catch
  moves the caught strand (with anything bonded to it) as one body into a free flush place along a clear path.

## Core inventory (2026-10-06, core review run 20261006-1920; table from run 20261005-1921)
Users from the kept demos and checks ("demos": which of `copy`, `ring`, `imprint` (its rings, its `g` strand and its
`p`/`m` cells), `pool`, `budpool`, `budcycle`, `closure` carry or fire it; `budpore` was retired in run 0820). Dates:
when the item entered the core (the repository restarted on 2026-10-01).

| Item | Kind | Used by | Since |
|---|---|---|---|
| `.` close-only | mark | ring kits (the root's closure side), `imprint`'s rings | 10-01; a free triangle binds by none 10-03; takes no dock or fill 10-03 (run 2121) |
| `@` attach | mark | ring kits, `budKit` (`budpool`, `budcycle`, `closure`), `pool`, the cell anchor `Z@\|` (`imprint p`) | 10-01 |
| `&` completion release | mark | ring kits (`bud`), `budKit`, spent walls (`imprint p/m`) | 10-01 |
| `\|` anchor | mark | `budKit` (the catching anchor; closed walls `-\|` in `budcycle`), `imprint p/m`, founder holds (`copy`, `imprint g`, tests) | 10-01; catches busy strands 10-02; a free one binds nothing 10-03 (removed 10-04, run 0820); never copied 10-03 (run 1221); a spent one catches nothing 10-03 (run 2121) |
| `?` copy side | mark | every `imprint` variant, `pool`, `budpool`, `budcycle` | 10-02 |
| `!` lysis side | mark | cutters `z@!-\|-\|` (`lysis`), `г@!-\|-\|` at a receptor `Г@&` on E (`budcycle` `BCQ`, run 2221) | 10-04 (run 2051) |
| zip (chain) | relayed signal | all copying | 10-01; from a held high end only 10-04 (run 0820: was the option `heldCopy`) |
| open (`openRange` 120) | relayed signal | growth and `&` release | 10-01; stops at `&` joints, a caught part emits at once 10-06 (run 1920) |
| lysis (one bit; not across `&` bonds) | relayed signal | `lysis` | 10-04 (run 2051) |
| gap, need, fn | exposed values (one bond) | chain copying (`copy`, `imprint`, `budpool`, `budcycle`) | 10-01; nb merged into gap 10-07 (run 2051) |
| fill | state | copying | 10-01 (refractory, its companion state, removed 10-05, run 1921) |
| spent | state | `&` sides | 10-01 |

**Counts (2026-10-06, run 1920):** unchanged (6 marks, 3 relayed signals, 4 exposed one-bond values, 2 states, no
option). The open signal now stops at `&` joints, the condition lysis already had (one condition for both relays), and a
part caught with an open front emits in the pass it binds (candidate (o), adopted with the joint; Core changes). One
openRange then serves every body length up to it; the per-demo ranges (pair 1, strips 3, lineage 9 and 50, imprint 1)
remain as set, and the pair-world checks pass at the default 120 (run 1920).

**Counts (2026-10-05, run 1921):** 6 marks, 3 relayed signals (zip, open, lysis), 4 exposed one-bond values, 2 states
(fill, spent), no option. Removed: the option `heldContact` with its relay `hold`, and the busy relay with the state
refractory (removal (q)); candidate (o) closed without a change (Core changes). Every mark and every rule event fires in
the check suite's 40 worlds (coverage hook, this run).

**Counts (2026-10-05, run 1422):** 6 marks, 5 relayed signals, 4 exposed one-bond values, 3 states, 1 option
(`heldContact`, candidate (p): adopt or remove at the next core review; Core changes).

**Counts (2026-10-04, run 2051):** 6 marks, 4 relayed signals, 4 exposed one-bond values, 3 states, no option (the
lysis side and its signal added; Core changes).

**Counts (2026-10-04, run 0820):** 5 marks, 3 relayed signals, 4 exposed one-bond values, 3 states, no option (was 1:
`heldCopy` became the rule). Run 2121's removal and run 0022's narrowing below.

**Counts (2026-10-03, run 2121):** 5 marks (was 16), 3 relayed signals (was 5: lock and hear removed), 4 exposed
one-bond values (was 9: fu, pwE, tb, nbc, actE removed), 3 states (was 9: charge, caught, door open, powered, away and
the hinge's rest angle and side removed), 1 option (was 2 plus the environment drive `light`: `pLoose` and `light`
removed). Physics lost one exception (a hinged flap turned by the chemistry). `tri/sim.js` 336 -> about 230 lines.
Run 20261004-0022 (explore): the same counts; glue binding lost two cases (a strand end's seed, a released back: only
grown triangles bind by glue) and zip its `&` case (Core changes).

Previous inventories: 2026-10-03 run 0450 (16 marks, 5 signals, 9 exposed values, 9 states, 2 options), 2026-10-02
run 0721 (17 marks, 5 signals, 9 values, 9 states, 4 options): RULES.md in git at `7415fd4`.

## Locality audit (2026-10-02, rule by rule; rows of removed rules dropped 2026-10-03)
Every chemistry rule reads only: the triangle's own type, state and bonds; the fixed type of a direct partner (the
glue and marks of the side bonded to it; for a copy blank, its whole type); values a direct partner exposed in the
previous pass; and relayed signals that move one bond per pass and fade (zip, open, lysis; busy until run 20261005-1921). Convention (made explicit
2026-10-02): a rule may also read a direct partner's own current state (its bonds, role, fill) as it stands when the
rule runs; that state was not relayed from anywhere, so information still moves at most one bond per step. The binding
rules read a binding candidate (a triangle in contact, about to become a direct partner) the same way: its fixed type,
and for two attached triangles its role and chain edges (anchor catch, glue and copy closure; named in run
20261007-2051). Writes: a
rule changes its own state or one of its own bonds; binding sets the state of both parties of the new bond (the caught
triangle's fill flag). Rules that were not local and were replaced: closures that asked whether two triangles belong
to the same body (now one flush tolerance, 0.05), snapping the smaller of two bonding bodies (removed), copy release
reading two bonds away (2026-10-01), copy release reading partners' fill state in the same pass across two bonds
(2026-10-02, run 20261002-0335). Physics, labelled: connected parts move as one rigid body; a free triangle binds only
into a free site and is placed flush there; a strand caught by an anchor side `|` moves as one body into a free flush
place (all or nothing; never by size).

| Rule (sim.js) | Reads | From where | Verdict |
|---|---|---|---|
| roles | own bonds and bond kinds, own fill | own | local |
| gap, need | next partner's role (its own bonds now), its gap / need; a docked triangle: its template's gap | partner current state; previous pass | local (convention; nb merged into gap in run 20261007-2051) |
| zip | own bonds (whether the high end's spare edge is bonded: held); next partner's role and its copy bond (TFACE); its zip | own; partner current state; previous pass | local (convention) |
| open signal | own sides; partners' values; the two sides' `&` marks of each bond (run 1920) | previous pass; fixed type | local (relay) |
| copy bind | the blank's copy sides and their close-only and spent marks (since run 20261007-2051); the site's bond and spent state, and its anchor mark (since run 1221) | own; partner current state; fixed type | local |
| glue catch, dock, fill | own role (glue: grown triangles only, since run 20261004-0022), need, zip; own side's close-only and spent marks; free triangle's side glue and marks | own; fixed type | local; sets the caught triangle's flags (a fill's fill flag and both parties' fn; a caught part's open signal, run 1920) |
| `_snap`, anchor capture | is the place free; the strand's body moves as one; the end's role and whether its spare edge is bonded (own bonds); the anchor side's spent flag (own) | physics (labelled); own | physics; local |
| glue closure | own active sides (role); the candidate's active sides and glue, both sides' `&` marks; flush geometry | own; candidate current state; fixed type; geometry | local (convention) |
| copy closure | own and the candidate's roles and chain edges, own need; both edges' bonds and `&` marks (run 20261007-2051); flush geometry | own; candidate current state; fixed type; geometry | local (convention) |
| release | own face bond; chain partners' fn (previous pass, or set this pass by a fill binding); template's chain bonds at the ends | previous pass; partner current state | local (fixed 2026-10-02) |
| fn | own fill; chain partners' fill | partner current state | local (convention) |
| copy (`?`) | own role when the pass began (free: since run 20261007-2051); the one partner's whole type | own; fixed type | local (gated, Core changes) |
| `&` release | own open signal, own `&` sides | own | local |
| lysis, `_lyse` (run 2051) | own bonds and lysis; a bonded partner's side mark `!` and the two sides' `&` marks; partners' lysis | own; fixed type; previous pass | local (relay); writes own bonds (all at once, as a copy blank lets go) and own state |

Known limit (independent review, run 20261007-2051; part of the labelled physics exception, not fixed): an anchor
catches no strand end of its own body (`_snapBody` cannot move a body into itself), and two attached strand triangles
close no glue bond, so a strand caught at one anchor whose high end lands flush at a second anchor of the same structure
is never held there; the same geometry across two bodies binds. Whether a kept kit (the lineage's pore cell) ever meets
it was not checked.

Note: `_pairs` (physics) never lists two free triangles, so no chain of catches through free triangles can form in one
pass; the chemistry relies on this.

## Binding (one rule everywhere)
A free triangle binds an attached triangle's side with the complementary glue when its centre comes within `capture`
(0.6) of the free site beside that side (any orientation), and the site is free: **binding places it** exactly flush
in the site (activation by attachment: free triangles never bind each other). Two attached triangles close a bond
when their sides are flush within 0.05 (rigid parts are exact, so a ring that closes or a copy closes; two separately
moving structures rarely meet that exactly). At probability `pBond` per step (1). A close-only side binds only an
attached triangle: no glue catch, dock or fill binds a free triangle on it (until 2026-10-03, run 2121, an attached
close-only side still took docks and fills: the casting lineage's dockers `Ay.z` took their fills on `y.`; Core
changes). A free triangle binds (glue catch, dock or fill) by none of its close-only `.` or spent sides (nor, from 2026-10-03
to run 20261004-0820, by its anchor `|` sides: Core changes).
A free part (a triangle with an attach side `@`) binds only by its attach side (an attached triangle's `@` side catches
only a free part's `@` side; closures between two attached triangles do not look at `@`). A bonded triangle is never
free (fixed 2026-10-02: a docked template that had lost its chain bonds was caught again), and a side binds only while
unbonded; a spent side binds nothing.

**Anchor (2026-10-01):** an attached triangle's unbonded, unspent anchor side `|` catches a strand end whose seed (its
unbonded spare edge, also while the strand is being copied: since 2026-10-02, Core changes) carries the complementary
glue, when the end's centre comes within `capture` of the site: the whole strand (with any partial copy docked on it)
moves rigidly into the flush place if that place is free (all or nothing). The capture path (the turn the short way and
the move) must be clear in sub-steps, as every move (fixed 2026-10-02: a strand was pulled through a wall); a strand
that already holds the anchor's triangle (one body) is not caught. This is the only way a strand joins an existing
structure (two attached triangles otherwise bond only when flush). No copy blank binds an anchor side
(since 2026-10-03, run 1221, Core changes: a waiting anchor was copied by every blank that reached it), and a spent
anchor side catches nothing (since 2026-10-03, run 2121: the code had not tested it; no structure has one).
Otherwise an anchor side binds as its glue does, free or attached (from 2026-10-03, run 0050, to run 20261004-0820 a
free triangle's anchor side bound nothing: Core changes).

Which sides of an attached triangle bind by glue: the free sides of a glue-bonded (grown) triangle, and no others
(since 2026-10-04, run 20261004-0022, Core changes). A strand triangle binds by dock, fill and copy closure, and a
strand end's seed only by an anchor's catch (above). Until then the back of a released strand triangle and the spare
edge of a strand end that was not being copied also bound by glue: free back monomers capped strands' low ends, and a
high end held by a completion-release side `&` started no copy (a case of zip, removed with it).

## Chains and copying
A strand is triangles joined by chain bonds (PREV/NEXT ends). A strand triangle's free edge is a **face** if its
next edge is its prev edge + 1 (counter-clockwise), else a hidden **back**. Strand ends are faces with one spare
(inert) edge. Letters by hidden backs: gap 0 (T), 1 (R), 2 (Z) between faces. **gap** (exposed, previous pass): how many
hidden backs follow a strand triangle before the next face (0, 1, or 2 for two or more), relayed by backs (since run
20261007-2051, which merged the value nb, "my next partner is a back", into it; the same need everywhere).
- **dock:** a free triangle binds a template face with the complementary face glue (FACE on the copy end, TFACE on
  the template end).
- **fill:** a free triangle binds the prev edge of a docked or fill triangle while that still needs fills
  (need = 2 - template gap, relayed), by the complement of that edge's glue (an inert edge takes an inert side), so
  backs are heritable. (Until 2026-10-03 fills were glue-agnostic unless the option `latGlue` was set; now it is the
  rule, Core changes.)
- **close:** a copy triangle's free prev edge binds another's free next edge, only when no more fills are needed and
  neither edge carries `&` (since run 20261007-2051). A triangle docked or filled in a pass closes from the next pass.
  Dock and fill take no spent side (since run 20261007-2051; no strand kit has one).
- **release:** a docked triangle lets go of its face once its prev and next partners are complete (each partner
  exposes `fn`: it is a fill or has a fill on a chain bond, from the previous pass, and from the pass a fill binds:
  fixed 2026-10-02, a fill bound in the same pass did not hold the release); at a copy end without a prev (next) bond,
  once the template has no next (prev) bond there; the copy peels
  off as one strand and is a template itself once an anchor holds its high end (zip, below). Copy faces carry the complement of the template's faces, so a copy
  of the copy restores them (the copy reads as the reverse complement).
- **zip:** a face takes a dock only while it hears zip: the strand's high end (no next bond) emits it while its
  spare edge is bonded, i.e. held by an attached anchor side (since run 20261004-0022 nothing else holds it: a copy
  blank that binds it lets go in the same pass), a face whose dock is bonded passes it on, backs relay it (previous
  pass). **Only a strand held by its high end is copied**: a free strand and one held by its low end take no dock (the
  option `heldCopy` of run 1720, the rule since run 20261004-0820: Core changes). A hold is lost only if the anchor
  side or the spare edge carries `&` (no kit has one); a copy in progress then still completes (zip passes on from its
  bonded docks), and no new one starts. A copy grows from the high end one face after another;
  parallel docking used to enclose an empty dock site between two partial copies (a hole no free triangle can reach),
  which deadlocked copying. (The option `zip: false`, parallel docking, was removed 2026-10-03: only a test used it.)
- **refractory** (a released face took no new dock until a busy relay, 30 on a bonded face and -1 per chain bond, was
  0 around it) was removed on 2026-10-05 (run 20261005-1921, removal (q), Core changes): zip orders docking from the
  held high end, and a released face's dock site stays occupied by its copy triangle until the whole copy lets go.
- Removed 2026-10-02 (core review; no demo used them): options `caps` (capped ends emitted two relayed signals; only
  intact strands were copied), `pDissolve`, `triUndock`, `pFray`, `castComp`, `noDock`, `snap: false`; and (run
  20261002-0721) `capture: 0` with `triTol` (binding by a flush side instead of the capture radius).

## Contact copying (copy side `?`, 2026-10-02)
A free triangle with a copy side binds by it (by none of its close-only copy sides, since run 20261007-2051) to any free
(unbonded, not spent, not anchor) side of an attached triangle, whatever that side's glue and marks (close-only `.` and attach `@` sides too; an anchor side `|` is the one
mark it skips, since 2026-10-03, run 1221), when its centre comes within `capture` of the site and the site is free.
In the same pass, if it was free when the pass began (a copy blank that has just bound; since run 20261007-2051: two
prepared triangles welded only by `?` sides were rewritten, the one with the lower index taking the other's type), it takes its partner's type (side i+k takes the partner's side j+k, i and j the bonded sides: the
partner turned about the shared edge; glues and marks) and lets go. It binds nothing else (no glue binding, dock or
fill) and is never itself a template. Free triangles never bind each other, so only attached triangles are copied.
This is the only way a type changes (casting, the other, was removed 2026-10-03). Gate entry: Core changes.

## Open signal and completion release
- **Open signal (completion):** an attached triangle with an unbonded attach side `@` that has a glue (an open growth
  front; an inert `@` side emits nothing) emits `openRange` (120), relayed -1 per bond, across every bond but a
  **joint**: a bond on which either side carries `&` (a bud and its parent; lysis stops there too). So a body between
  joints hears only its own fronts (since 2026-10-06, run 1920: until then it crossed every bond, and a parent heard its
  growing bud; Core changes). An `&` side (a spent attachment) emits nothing. A free triangle hears nothing (-1: not
  yet heard). A triangle caught by glue that has an open front emits from the pass it binds (since run 1920: it emitted
  from the next pass, and the cells behind it heard a pass of silence).
- **Completion release `&`:** a triangle that hears no open signal is complete; its `&` sides let go then and are
  spent (they never bind again: a bud's seed side: a daughter ring lets go of its parent once it has closed; a pore's
  panel lets go of the wall and the gap cannot be refilled). An `&` side catches free triangles but never closes onto
  an attached one (also before it is spent). The release runs first in each step, before physics.

## Lysis (lysis side `!`, 2026-10-04, run 2051)
- A triangle bonded to a partner's lysis side `!` is **lysed**. Lysis is relayed one bond per pass (previous pass)
  across every bond but a joint, one on which either side carries `&` (the joint between a bud and its parent stops it,
  as it stops the open signal since run 1920). A side
  `!` binds as its glue and other marks say; no binding rule of its own.
- A triangle lysed for a whole pass (its partners have heard it) cuts all its bonds. A lysed triangle that is then free
  (by its own cuts or its partners') returns to a fresh state of its type: spent sides and fill cleared, and
  it hears nothing (open -1). So a body comes apart whole, one bond further per pass, each part as the part it was made
  as, each strand triangle as a monomer.
- A lysed triangle binds nothing (no glue catch, dock, fill, copy, anchor catch or closure on it), so no freed part
  rejoins a body that is coming apart.
- Lysis runs first in the chemistry of each pass. Gate entry: Core changes, run 2051.

## Core changes

Every core change (a new mark, signal, state, rule or rule branch, physics exception, or a default that changes
behaviour everywhere) is entered here before any code (AGENTS.md). Newest first. Entries older than run 2121 also
speak of rules removed with the casting lineage (triggers, latches, casting, fuel): they are history.

### Core review 2026-10-07, autorun run 20261007-2051: one removal, one merge, four fixes
An independent reviewer read every rule in `tri/sim.js` against locality and this file (findings below; the full list
in the run's NEXT handoff, git). Pass order is clean: no loop in derive or chemistry reads a value it writes in the same
pass, nothing reads two bonds away, `bodyOf` is used only inside the anchor catch (labelled physics), and `sim.js`
never creates or destroys a triangle or changes a type except by copying.
1. **Removal: the option `copyGlue`** (candidate (t), run 1921, entry below). No check, kit or command uses it, and its
   result was negative (a class copied only from its own deaths makes no resource). Removed with the demo drive values
   that served only it (`pair`'s `PAHB=3`, lettered blanks, and `PADL`, their decay); code in git at `25c68b9`. Contact
   copying stays glue-blind (test "copying is glue-blind"). A slice that needs a resource kinds make starts again from
   the case below, with what keeps the second blank type in supply answered first.
2. **Merge: the exposed value nb into gap.** nb ("my next partner is a back") served only to let a face's gap tell one
   hidden back from two. Backs now expose gap too, 1 + (1 if the next partner's gap was above 0), capped at 2: a face
   reads the same 0, 1 or 2 in every pass (gap0 > 0 exactly when nb0 was 1: both say the partner was a strand triangle
   whose next was a back), so need and every copy are unchanged. One exposed value fewer.
3. **Fix: copying only by a triangle free when the pass began.** `_copy` rewrote any triangle bonded by a `?` side and
   nothing else: two prepared triangles welded only by `?` sides, and the one with the lower index took the other's type
   (an index-order effect). Now the rule reads its own role from the pass's start (free), as "a copy blank that bound
   this pass" always said. Only prepared structures reached the old case.
4. **Fix: a free triangle binds by none of its close-only copy sides.** The mark's meaning (a free triangle binds by none
   of its close-only sides) held for glue catch, dock and fill but not for copy binding: a blank `-.?-?-?` copied by its
   `.?` side. The general mutagen makes such sides (it toggles marks on free parts), so this is the one change that
   alters outputs, only in worlds with the general mutagen (measured below). Spent copy sides are excluded the same
   way (rare: a free triangle keeps a spent flag only after a lone caught part lets go, and then needs the mutagen).
5. **Fix: a spent side binds nothing; no `&` side closes.** Dock and fill did not test the spent flag, copy closure no
   mark at all; now dock and fill skip spent sides and copy closure skips `&` edges, as glue closure does. No strand kit
   carries `&`, so no output changes.
6. **Text fixes (no code):** the inert anchor `-|` binds no glue but chain bonds ignore the mark; copy blanks copy `.`
   and `@` sides (the marks' rows said "never a free one", "only a free part"); a free triangle with `?` and `@` binds
   by `?`; the audit rows of copy closure (it reads roles and chain edges, not glue), gap and need, fill (it sets both
   parties' fn) and release; the convention names the binding candidate. Dead checks removed (no change): `free()`'s
   role test, a bonded test in the copy branch and in `_snap`, `r.free>=0` in dock; `rb.inert<0` (never true) is now
   `rb.inert===undefined`. Not changed: the anchor catch refuses a strand of its own body (Locality audit, Known limit);
   `pBond` (never set below 1: removing it changes the random stream, not the rules; left for a run that changes outputs
   anyway); `capture` and `triTolClose` (different tests); `_snap` and `_snapBody` (a merge changes outputs); `fn` (not
   derivable without a relay).

**Result (measured):** PENDING.

### Option `copyGlue` (candidate (t)): a glued copy side binds only a complementary side, 2026-10-07, autorun run 20261007-1921 (explore) (removed run 2051)
NEXT priority 20. The case, written before the code; the result follows when measured.
1. **Capability and why the goal needs it.** A web of classes larger than its foods. Run 1821 showed that every catch
   is copied from blanks, so every class that makes its parts draws on one resource, and by competitive exclusion the
   classes are at most the limiting resources (blanks and each prepared stock). Complex evolution needs resources that
   kinds make, not only ones the world is given.
2. **Why the existing core cannot do it.** Contact copying is glue-blind: a copy blank binds any free side that is not
   an anchor. Every part a kind makes is a blank turned into a copy, and any blank can become any part, so whatever a
   dead body returns (as blanks, `PAHB=2`) is everyone's food. A stock of parts bound by glue is a private resource only
   because nothing makes it (`PAF`, prepared, run 1620). No arrangement of types gives a blank that only some kinds can
   use.
3. **The rule.** A copy side with a glue binds only a side carrying the complementary glue; an inert copy side binds
   any side, as now. Every existing blank is `-?-?-?`, so every existing world is unchanged except where the mutagen
   makes a part with a glued copy side (as an option, default off, nothing changes).
4. **Locality.** It reads the copy side's own glue (its own type) and the partner side's glue (a fixed type), as glue
   binding already does. Nothing new is exposed or relayed.
5. **Generality.** Copy binding then reads glue as every other binding does, with the inert side as the one wildcard:
   one condition added to a rule that exists, no new mark, state or signal.
6. **What it replaces.** If adopted, "whatever that side's glue" in Contact copying. With a drive under which a dead
   triangle returns as a blank that keeps its glues (`PAHB=3`, labelled environment, the demo's), a class whose cells
   carry the complement of their exposed glue is copied from its own dead material: each class makes a resource for
   itself. Biology: monomers keep their identity when a body is broken down, and are reused by whoever reads them.
7. **Result (built as an option, `copyGlue`, default off; INNOVATIONS run 1921).** Outputs with the option off are
   unchanged by construction (the condition is skipped; checks pair, catcher-free-c, web-two-c, imprint-genome and
   strips byte for byte against `main`). With `PAHB=3` it does what it was built for (a class whose
   cells carry the complement of their exposed glue is copied from its own dead material), but that is no resource: two
   equal private classes exclude each other by 15-30k as with the option off (4 of 4 in each of two designs), and an
   in-place head's lettered blanks pile up where only a free seed site takes them (the world dies, 4 of 4, without a
   decay of letters). Reason (IDEAS run 1921): a class makes its lettered blanks from its own deaths, so nothing enters
   it from outside. Not adopted; kept as an option for the next core review to remove unless a slice uses it.

### Candidate (o) with the joint: one range for every length, 2026-10-06, autorun run 20261006-1920 (core-review)
NEXT priority 10 (run 1851: openRange was set per kind, 1 for the pair, 3 for the 3-cell strip, 9 and 50 in the
lineage, a body-length knob in disguise). The case, written before the rule; the measurement and the decision follow.
1. **What fails (measured on `main`, `e63366e`).** Strips of k cells (each cell bound by its side 0 to the previous
   one's front `x@|`, a root `Z@&c@|-` on the last cell's seed site `z|`; own letters, no hazard, no mutagen; 300 blanks,
   world 30, 6000 steps, seeds 1 and 2; script and numbers below). A k-strip's root lets go before its individual is
   complete unless openRange is at least about k (3 cells: every release incomplete at 1 and 2, complete at 3; 4 cells:
   incomplete at 3, complete at 4 or more), and a large range stalls long kinds (openRange 120: 4- and 5-cell strips made
   2 to 11 individuals in 6000 steps, chains of up to 23 triangles; the pair 92, the 3-cell strip 66-79). No one range
   serves 2 to 5 cells.
2. **Why, from the rule.** (a) *The parent hears its child.* The open signal crosses every bond, the `&` joint between
   a bud's root and its parent's seed site too. A parent is released only when it hears nothing, so a child's open front
   within openRange of the parent's root holds the parent (and the grandparent behind it) until the child is complete:
   with a large range, generations stay joined and a body's release waits on its descendants (the stall). Lysis already
   stops at this joint (Lysis, run 2051). (b) *The new part's lag (candidate (o)).* A part caught at a front emits from
   the next pass only (it was free, -1, when the previous pass's values were taken), while the front it closed stops
   emitting at once. The cells behind hear a dip for one pass: the root of a strip whose front is cell j hears at least
   openRange - j - 1 and lets go at 0, so a k-strip needs openRange >= k. The root itself (j = 1) hears nothing in that
   pass but the echo from its parent across the joint: so stopping the signal at the joint alone breaks every strip of
   3 or more (measured: every release incomplete at every range), and the two parts go together.
3. **The rule as proposed.** (a) The open signal is not relayed across a bond on which either side carries `&` (the
   joint between a bud and its parent), as lysis already is not: one condition for both relayed signals. (b) A triangle
   caught by glue that has an open front (an unbonded glued `@` side that is not `&`) emits openRange from the pass it
   binds, not from the next (binding already sets the caught triangle's state: the fill flag of a fill). Locality: (a)
   reads the marks of the two sides of a bond (fixed types); (b) reads the caught triangle's own sides. Nothing new is
   counted or exposed; no new mark, signal or state. Cost: one condition in the open relay (shared with lysis), one line
   in glue binding.
4. **What it should change.** A body between `&` joints hears only its own fronts, so openRange needs only to reach
   across one individual (openRange >= k - 1 for a k-strip), and the default 120 serves every kind shorter than that.
   The pair (2 cells) behaves at every range as at openRange 1 now. Release comes about openRange passes after the last
   part binds (the signal fades one per pass, echoing inside the body) for 3 or more cells; immediately for 2.
5. **Test.** The strip measurement on the oracles `openJoint`, `openCatch`; the check suite with `CHECK_SAVE` against
   `main` with both on, every changed outcome explained; then the pair-world checks at one range.
6. **Result: adopted (the rule since run 1920; the oracles are gone).**
   - *Strips* (oracles, 2 seeds each, 6000 steps; complete / incomplete releases): with both parts, openRange 3 buds 2-
     to 4-cell strips with none incomplete (5 cells: 11 and 33 incomplete, as 5 > openRange + 1), openRange 5, 9 and 120
     every length 2 to 5 (e.g. at 120: 91, 75-81, 27-35, 19-20 complete, none incomplete). Main at 120: 80-100, 63-76
     (2 incomplete each), 2-9, 4-7. Each part alone fails: the joint alone leaves the root of every strip of 3 or more
     a pass of silence (all releases incomplete at every range); the catch alone removes the incomplete releases but
     not the stall. Release comes about openRange passes after the last cell binds for 3 or more cells (the median
     delay: 2 at openRange 3, 8 at 9, 96-120 at 120), at once for 2.
   - *Suite* (`CHECK_SAVE` against main `e63366e`, both on this branch's checks): 34 of 34 pass on both. Byte for byte
     the same: every pair world without a strip (`pair`, `pair-c`, `pair-run`, `pair-sel(-c)`, `pair-mut`,
     `pair-flow(-c)`, `pair-host(-c, -mx)`: a 2-cell kind at openRange 1 hears the same), `copy`, `ring`, `imprint`,
     `imprint-genome(-c)`, `imprint-pore(-c, -n)`, `budpool`, `budcycle-3` seeds 3, 4 and `budcycle-lysis` seeds 1-3.
     Changed, same outcome: `duo*` and `diets*` (openRange 3: a pair's or diet's root now lets go one pass after its
     front closes instead of three, as its parent no longer echoes; means within a few percent, e.g. `duo` pair 369-379,
     base 376-385; `duo-stock-hi` the pair extinct in 4 of 4 worlds, base 2 of 4, the check's claim either way);
     `lysis` (openRange 50; later bud 47, 45, 45, 46 parts, base 45, 45, 46, 45); `budcycle-3` seeds 1, 2 from 699k and
     880k on (generation 3 of seed 2 at 928600, base 908100; seed 1 reaches 2, not 3, as before); `budcycle-lysis` seed
     4 (generation 3 at 1094000, base 856900; 3 buds lysed, base 6). The lineage's incomplete root releases (`falseRel`
     8, 1, 2, 9) did not change: they are not this race (run 1921 found the same).
   - *One range* (`TRI_PARAMS='{"openRange":120}'`): the 15 pair-family checks and `strips` pass (`duo-stock-hi` 3 of
     4); 2-cell kinds byte for byte as at their own range. Cost: a body of 3 or more cells lets go about openRange
     passes after its last part binds, so at 120 the duo worlds' 3-cell strips are weaker (INNOVATIONS run 1920). The
     range is now a completion delay, not a body-length limit (it must exceed k - 2 for a k-cell kind).
   - *Independent review* (run 1920, no defect found; locality, several catches in one pass, lysis, spent sides, copy
     blanks and deadlock traced). Two behaviour changes to know: a complete parent now spends its unbonded `&` sides
     (budKit walls `-&`, the receptor `Г@&`) while its bud still grows, since the bud's signal no longer keeps them
     unspent; and a mutant that carries `&` on an inner side (the full mutagen can toggle it, e.g. a middle cell
     `C@&d@|-`) splits its body at that bond into pieces released separately: "a body between joints" is then smaller
     than the individual.

### Candidate (r): copy error in contact copying, 2026-10-06, autorun run 20261006-0450 (explore): not needed yet
NEXT priority 5 (Direction 2, heritable variation). The case, written before any code; then what was done instead.
1. **Capability and why the goal needs it.** Heritable variation: a part type that differs from its template and is
   then copied true. Evolution needs it; the core has no source of new types (contact copying is exact, and casting,
   the other way a type changed, was removed on 2026-10-03).
2. **The rule as proposed.** With probability `pErr` per contact copy, the copy takes one of its three sides wrong: a
   side drawn at random gets a random glue (inert or a letter) or one of its marks toggled. Locality: the copying
   triangle changes its own type, as now; the draw is noise, as `pBond`'s. Cost: one parameter and one branch in
   `_copy`. Biology: replication errors.
3. **Can the existing core do it? Yes, with a labelled environment drive.** In a world where free parts decay
   (`PAD`), nearly every free part is a fresh copy, so a drive that changes one side of a free part now and then (a
   mutagen, labelled like decay, which already changes free parts' types) makes the same variants at nearly the same
   places in the life cycle; a variant that binds into a body is copied true by the existing rule. The only
   difference: an error inside the rule happens at a rate per copy, the drive at a rate per free part per time.
4. **Decision: not changed.** Built as demo `pair`'s drive `PAM` (no rule change; INNOVATIONS run 0450). Revisit only
   if a world without free-part decay needs variation, or if a rate per copy turns out to matter (e.g. a kind that
   copies faster should also vary faster).
5. **What the drive showed for the core** (INNOVATIONS run 0450, IDEAS "Variation on the pair"): variants are inherited
   and selected with no rule change; the variants that win expose their part more (an anchor mark lost from a seed site
   or a front), or bind more (a glued `@` side that keeps a body joined, then parts that bind their own kind or each
   other), and the latter lock the material in rosettes and networks, so copying falls 3-15x (3 of 4 worlds by 140k even with the hazard per triangle). Nothing in the rule set
   stops a part from carrying both `g@` and `G@`; such a part grows by binding its own kind (crystal growth), which is
   legitimate chemistry. Whether the core or the environment should limit it is open (NEXT).

### Removal (q): the busy relay and refractory, 2026-10-05, autorun run 20261005-1921 (core-review)
1. **What they do.** busy: 30 on a triangle with a bonded face (either end of a dock), relayed -1 per chain bond.
   Refractory: a triangle that had a face bond in the previous pass and has none now takes no dock until busy around it
   is 0. Since run 20261004-0022 nothing else reads busy (Core changes, that entry's point 5). Purpose (run of
   2026-10-01, before zip gated docking): stop a released face from re-docking under a copy that is still peeling off.
2. **Why they may be redundant now.** (a) A face docks only while it hears zip, which starts at a held high end and
   passes face by face as docks bond, so docking is already ordered from the high end. (b) A released face's dock site
   is occupied by the copy triangle that sat there until the whole copy has let go: that triangle stays bonded by chain
   bonds to copy triangles still docked, so the copy is one rigid body with the template, and binding places a free
   triangle only into a free site (physics). (c) A copy that has let go entirely is a bonded body, never a free
   triangle, so no template face can dock it. So a re-dock under a peeling copy cannot happen; what refractory still
   does is delay the next copy by up to 30 passes after the last face lets go.
3. **What removal changes.** One relayed signal and one state leave the core (5 -> 4 signals counting lysis; 3 -> 2
   states); dock reads zip, its site and the glue only. Copies may start sooner after a release, so copying worlds
   change from the first release on.
4. **Test of the claim.** The check suite with `CHECK_SAVE` against this run's baseline: every capability must still
   pass; look for strands that dock under a peeling copy (stray partial copies), and for copy counts.
5. **Result: removed.** Check suite with `CHECK_SAVE` against this run's baseline (both on this run's code but for the
   removal): 12 of 12. Byte for byte the same: `copy` (4 worlds: refractory never decided a dock there), `ring`,
   `imprint`, the `imprint-pore` worlds, `budpool`, `lysis`, `budcycle-3` seed 3, `budcycle-lysis` seeds 1, 3. Changed:
   `imprint-genome` (strands 14, 13, 11, 13; base 15, 13, 11, 13), `budcycle-3` seeds 1, 2, 4 and `budcycle-lysis` seeds
   2, 4. No stray part in any world. Generation 3 by 1.2M in the lineage worlds (`budcycle-3` seeds 1-8 and
   `budcycle-lysis` seeds 1-4; seeds 5-8 run for this decision): base 9 of 12, without refractory 8 of 12 (seed 1 of
   `budcycle-3` reached generation 2 at 935600, base 1031000, and not 3; base reached 3 in the same pass as 2). Where
   both reach it (8 worlds), generation 3 comes earlier without refractory in 5, in the same pass in 2, later in 1 (e.g. `budcycle-lysis` seed 4 856900,
   base 1083700) and parents make more copies (`budcycle-3` parentCopies 4, 8, 3, 4; base 3, 6, 3, 3). Read as
   noise around the same reliability: base `budcycle-3` alone is 6 of 8 over seeds 1-8 (seeds 5, 6 fail in both).

### Core review 2026-10-05, autorun run 20261005-1921: (p) removed, (o) closed without a change
1. **Removal: the option `heldContact` (candidate (p)) and its relayed value `hold`.** Why it existed: a free strand's
   triangles took copy blanks (run 1422, entry below). Why it goes: it was never made the rule (it closed the strand
   sink but moved the blanks to stalled fronts), and the direction check of run 1850 moved the evolution work to a kind
   without strands (the pair). No default world read it: 17 short worlds (`copy`, `ring`, `imprint-genome(-c)`,
   `lysis`) byte for byte as on `main` (`f1ec517`), and the check suite on this code 12 of 12. Code in git at `4f65d5c`.
2. **Candidate (o), the open relay hears "complete" too early after a new bond: closed, no change.**
   - *The oracle as proposed is wrong.* Run 2051's `LYFIX` (a triangle that would hear 0 while a bonded partner had -1
     in the previous pass hears -1) never fades: in a body with no open front, a triangle set to -1 makes its partners
     -1 in the next pass while it hears 0 again, a standing period-2 wave. Bond graphs of flush unit triangles are
     bipartite (every bond joins an up and a down triangle), so two new bonds at passes of opposite parity leave every
     triangle -1 on every pass: the body never hears 0 and its `&` sides never release. Shown on a held 9-triangle
     strand with two monomers bound 3 passes apart: all 9 at -1 from the 8th pass on, still at the 60th.
   - *A fading variant (o') was built and measured:* a bonded partner that had -1 in the previous pass (free then, so
     its bond is new) counts as open one bond away, i.e. contributes 1 instead of nothing (`v=max(v, w<0 ? 1 : w-1)`).
     It fades (the 1 relays to 0), reads only partners' previous-pass values, and closes the traced race (a root
     `Y@&b@-` on a silent site joined in the next pass by an open part `B@c@-` heard 0, then 1). An independent review
     found the race open for a chain of three new triangles bound in one pass (formBonds lets a part bind a triangle
     that bound earlier in the same pass), and no other flaw. Check suite with `CHECK_SAVE` against this run's baseline:
     12 of 12; `budcycle-3` and the `imprint`, `copy`, `ring` worlds byte for byte the same; `budpool` splits one pass
     later in 4 of 4 (nothing else changes); `lysis` mixed (seed 1: a complete later bud of 47 of the stuck bud's
     parts, base 45; seed 2: no off-parent arc, base 37 parts; seeds 3, 4: off-parent arcs of 6 and 29 parts, base
     none); `budcycle-lysis` roots released incomplete 8, 0, 2, 14 (base 8, 0, 2, 13). **Not adopted:** the false
     releases it was meant to remove are not the one-pass race (their count did not fall), and a rule branch that
     does not change what it was made for is not worth its place. Before any further fix, trace one `falseRel` in
     `budcycle-lysis` seed 4 (what the root heard in the passes before it let go). `LYFIX` is removed from
     `tri/demos.js` (in git at `f1ec517`).

### Candidate (p): contact copying of a strand triangle follows "held", 2026-10-05, autorun run 20261005-1422 (explore)
NEXT step 1 (Direction 1, a world that runs indefinitely; IDEAS "The scavenger's dilemma"). The case, written before
the code; then the result.
1. **Capability and why the goal needs it.** A leaked genome copy (a free strand) should wait for a catch without
   eating the world's food. Today chain copying already ignores a free strand (only a strand held by its high end takes
   a dock, run 0820), but contact copying does not: every copy blank that reaches a free strand's free side turns into a
   monomer of that triangle. In run 1051's 4M worlds 20-76% of the blanks copied by genome triangles went to free
   strands, and 52-60 free strands held about 40% of all triangles at 1.3M (run 0721): the largest blank sink, and it
   grows with the population (each adult leaks copies). An indefinite world needs that sink closed or cleared in
   proportion to the bodies.
2. **Designs with the existing core, and why they fail.** (a) Prepared scavengers (run 0721, 1051): a fixed number
   cannot track a population; eight eat every offspring's genome, two fall behind (1 of 4 worlds runs on to 4M).
   (b) Each body its own scavenger (a lysis anchor `!` on an outer wall cell): clearing would scale, but such a side
   lyses whatever strand it catches, its own bud's next catch included, and an adult's `&` sides are spent once it hears
   no open signal, so the scavenger's `&` (which stops the lysis at its own bond) stays unspent only beside a glued `@`
   side no part matches, an open front that never closes, which must then sit out of `openRange` of every `&` joint
   that has to release. Not designed further: two constraints on every kit, for a fix of one sink. (c) Reading an existing relay: zip reaches a
   held strand's faces only one after another while it is being copied (at rest only the high end hears it), so
   gating on zip would leave the held strand's other triangles uncopyable and the parent without monomers; busy is 0
   on a held strand between copies, so gating on busy deadlocks (no monomers, so no dock, so no busy). (d) Labelled
   drives that dissolve free strands (decay from an unheld end) are possible but are environment, not chemistry.
3. **The rule.** A new relayed value `hold` on strand triangles (role face, back or docked; fills too): a strand's
   high end (no next bond) whose spare edge is bonded (held: only an anchor's catch binds it) has `hold` = 30 (the busy
   range); every other strand triangle takes the largest `hold` of its chain and face partners (previous pass) less 1,
   floor 0. A copy blank binds a strand triangle's free side only while that triangle has `hold` > 0. Grown
   triangles (kit parts, walls) are copied as before. So a free strand, and one held only by its low end, is not
   contact-copied; a released copy stops being copied within the relay's fade (at most 30 passes).
4. **Locality.** Reads: own role and own bond on the spare edge (as zip's origin does), the chain and face partners'
   `hold` from the previous pass (one bond per pass, fading, like busy). The copy bind reads the site triangle's own
   `hold` (the site's own state, as it already reads its bond, spent and anchor state). No count, no body, no organism.
5. **Generality and cost.** One relayed value (4 -> 5 relayed signals), one added condition on copy bind. It makes the
   two copying paths read the same "held" condition: a strand is a template (for a copy and for monomers) only while
   held by its high end. Biology: a chromosome's genes are read where the chromosome is attached; a free fragment is
   inert until taken up.
6. **What it replaces.** If it carries the lineage: the prepared scavengers (`BCSV`) and the case for each body its
   own scavenger; free strands then cost material only by what they hold (the hazard and the monomer loop return it).
   It does not replace zip (zip orders docking; `hold` gates monomer making).
7. **Result (built as the parameter `heldContact`, default off; not made the rule in this run).** Test "copy side
   (heldContact, candidate (p)) ...": a free strand's triangle takes no copy blank, a held strand's low end (hold 26, four
   bonds from the high end) does, and a strand that lost its hold is copied for a few passes more and then not. Default
   outputs byte for byte the same (`budcycle` 100k seed 1 against main; the check suite on this code). In four
   `budcycle` worlds with run 1051's drives and no scavengers (`BCSV=0 BCL=0.001 BCLK=0.0001 BCH=0.0001 BCHT=600000`,
   seeds 2-5, to 2M) against the same worlds without it (INNOVATIONS run 1422): the strand sink closes (blanks copied by
   free strands' triangles 0, against 1133-1979), blanks stay at 2-39 (control 0-1) and complete bodies at 2M are 2, 3,
   3, 5 (control 1, 0, 1, 2); but the blanks it saves go to kit fronts (1363, 453, 1387, 1286 copies, control 144-237)
   and pile up as surplus parts at stalled fronts (parts 519-670, one type at 61-356; control 45-122), so the lineage is
   not deeper (highest generation by 2M: 1, 0, 3, 3; control 2, 2, 2, 2). The free strands' monomers had been the fast
   loop that kept blanks from the fronts (IDEAS, "Closing one sink moves the blanks to the next"). Not adopted yet:
   the parameter stays (one option in the core) for the next `core-review` to make it the rule or remove it, after the
   front sink has a design (NEXT). **Removed in run 20261005-1921 (core-review)**: the direction check of run 1850 moved
   the evolution work to a kind without strands (the pair); the code is in git at `4f65d5c`.

### Rule: a lysis side `!` takes a body apart into its units, 2026-10-04, autorun run 20261004-2051 (explore)
NEXT priority 3, candidate (m) (the user, 2026-10-04: "if only blanks [change], the simulation will just run out";
IDEAS). The case, then the result.
1. **Capability and why the goal needs it.** A reverse path: blocks locked in bodies return to the mix. Today nothing
   comes apart: the only cuts are a copy's release, a copy blank letting go and completion release `&` (one bond, the
   bud's root), so every closed world runs down (runs 0751, 1021, 1721: parts end in surplus and waiting buds, the pool's
   fewest type falls to 0, the lineage stalls after 2-3 generations). An indefinite lineage under conservation needs
   bodies that die and return their material; the user's first choice is a bond-cutting type (predation, scavenging).
2. **Designs with the existing core, and why they fail.** No rule cuts a link bond between two grown triangles, so
   none can free a body. Labelled drives that turn free typed triangles back into blanks (`BCL`, `BCLK`, run 1021) only
   churn what is already free, and returning parts as blanks empties the rarely copied types (setup C: a part type is
   remade only by copying an exposed attached copy of it), so the information in a body is lost with it. A drive that
   cuts bonds at random breaks a one-row arc into two pieces whose ends are open fronts: each piece regrows (two more
   sinks), strands fragment, and nothing tells the dead from the living. The user's other options were weighed: wider
   molding and molding one side at a time change types but free nothing; reverting to blanks is the drive above. A body
   taken apart whole returns exactly one of each of its parts: the reverse path that keeps every type.
3. **The rule.** A new side mark `!` (lysis side). It binds as its glue and other marks say (no binding rule of its
   own; who it can bind is chosen by glue, like everything else). A triangle bonded to a partner's `!` side is
   **lysed**; lysis is relayed one bond per pass across every bond but one on an `&` side (either end: the joint
   between a bud and its parent, the one kit bond made to come apart, so a bud's death does not reach its parent and a
   parent's does not reach its attached bud); a triangle lysed for a whole pass (its partners have heard it) cuts all its
   bonds and returns to a fresh state of its type (spent sides, fill and refractory cleared). The body comes apart
   whole, one bond further per pass, before a fragment can regrow; each part leaves as the part it was made as (a
   lysed root's spent seed side is fresh again), each strand triangle as a monomer. A lysed triangle binds nothing, so
   no freed part rejoins the body behind the wave (added while building: designed from a race on paper, a freed cell
   re-binding a lysed neighbour's open front in the pass before that neighbour cuts; not observed without it).
4. **Locality.** Reads: its own bonds and lysis value; a bonded partner's fixed side mark (`!` on the bonded side), the
   `&` marks of the bond's two sides (fixed types) and the partner's lysis value from the previous pass. Writes: its own
   bonds (all of them at once, as a copy blank lets go of all of them) and its own state. No count, no body, no
   organism: a lysed triangle does not know what it belongs to.
5. **Generality and cost.** One mark and one relayed one-bit signal (6 marks, 4 signals); nothing else changes, and no
   kept structure carries `!`, so every existing world runs as before (to be shown byte for byte). Copies take the
   mark with the rest of the type. What a `!` side cuts is decided by its glue: the first user is a prepared cutter
   part `z@!-|-|` (labelled starting condition, never copied: its other sides are closed), which binds only a waiting
   anchor `Z@|` (a free part binds an attached `@` side of complementary glue), so it takes apart a bud waiting for its
   catch (or growing past its anchor cell) and never an adult, whose anchor holds a strand. Biology: lysis by a
   predator or a phage at a receptor.
6. **What it replaces.** Nothing yet; if it carries the lineage, the labelled food loop (`BCL`; `BCLK` removed in run
   20261005-0251) becomes unnecessary for bodies (monomers of lysed strands are monomers again) and candidate (n) (bud only after letting go)
   may not be needed: a bud stuck waiting is taken apart instead of starving its line.
7. **Result (built as the rule; test "lysis: a part with a lysis side bound to a waiting anchor takes the bud apart
   into its parts, fresh; the parent behind its & joint stays whole"; demo and check `lysis`; INNOVATIONS run 2051).**
   No kept world carries `!`: the 10 short checks with `CHECK_SAVE` at `ef27e51` and on this code, 31 worlds, byte for
   byte the same (10 of 10 both times, 575 / 580 s); `budcycle-3` 4 of 4 with the same results as runs 1021 and 1721 (generation 3 at 1031000, 977300, 735900, 827100; 0 stray; 1880 s). In `lysis` (a parent with a complete bud stuck on its
   seed site, no food, 4 cutters, the anchor on cell 44): the stuck bud comes apart into its 47 parts in 4 of 4 worlds
   (t = 4005-10498) and a later bud on the parent's seed site is built from 45-46 of them in 4 of 4 by 1M steps. Two
   findings for the kind and the core: (a) a cutter at the waiting anchor also kills a growing bud once its anchor cell
   is attached; on cell 6 (budcycle's kind) every regrowing bud died at 7 cells, on cell 44 only nearly complete or
   waiting buds are exposed; (b) the open relay's one-pass lag (a triangle bonded to a partner that was free in the
   previous pass hears 0, "complete") releases a fresh root that re-binds the seed site together with its next cell in
   consecutive passes (traced: root binds 4006, cell 1 binds 4007, released 4008); the parts then grow a free arc off
   the parent (seed 1: until it too was lysed at about 380k). An oracle that keeps such a triangle at -1 (`LYFIX=1`) removes the detour
   (candidate (o) in NEXT; not changed in this run: one core change per run).

### Removal: run 0050's narrowing (a free triangle's anchor side binds nothing), 2026-10-04, autorun run 20261004-0820 (core-review)
Candidate (i) of the direction check (run 0751). 1. **Why it existed.** Free copies of a waiting anchor (`W@|`, `W|`)
glue-capped strands' low ends `w` (run 0050). 2. **Why it is no longer needed.** Since run 20261004-0022 no strand end
binds by glue at all (only an anchor's catch binds it), and every glued anchor side in the kept worlds is on a part
(`Z@|`: a free part binds only by `@`) or is attached and never copied (the hold cells, the cell anchor); a free
triangle's anchor side could only glue-bind a grown triangle's free side, which no kept structure offers one.
3. **Locality.** A read is removed (the free triangle's own anchor mark in glue catch, dock and fill). 4. **Generality.**
An anchor side then binds as its glue does, free or attached (an attached grown one already glue-caught free
triangles: run 0050 kept that path), and in addition an attached one catches strand ends and no copy blank binds it:
one meaning instead of two. A free triangle binds by none of its close-only or spent sides. 5. **Measured.** The check
suite on this run's code with and without the narrowing (`CHECK_SAVE`): all 35 worlds of the 11 checks byte for byte
the same (11 of 11 pass both times). Tests: "binding: a free triangle docks by none of its close-only or spent sides"
(the anchor case dropped) and "anchor: a free triangle's anchor side binds as its glue does" (was "... binds nothing").

### Rule: only a strand held by its high end is copied (`heldCopy` becomes the rule), 2026-10-04, autorun run 20261004-0820 (core-review)
1. **Capability and why the goal needs it.** None new: the kind's cycle already runs on it. `budcycle` and
   `budcycle-free` (one and two generations from the kit, runs 2221 and 0621) and the held-founder cells (`imprint
   150pzox`, run 1720) set the option; leaked strands are then sterile, which is what dissolved the kind's opening
   problem (run 1720) and lets the corner bud grow with no doorway (run 0621). As an option it is a fork: two zip
   rules, six checks and every unit test of copying on the other branch, and every new layout has to choose (NEXT,
   direction check run 0751, finding 2 and candidate (e)).
2. **Designs with the existing core, and why they fail.** Keeping the option keeps two rules for one job. Keeping the
   old default (every strand is copied wherever it lies) is what made leaks feed rivals: three rival strands outside an
   `imprint p` cell left it 1-3 strands (runs 0320, 1720), and a bud on the old rule copied its caught strand 0-1 times
   after the split in every run before 1720.
3. **Locality.** Smaller than before: zip's origin reads the high end's own bond on its spare edge (own state) and no
   option. Since run 20261004-0022 only an anchor's catch binds a strand end's spare edge, so "held" means "held by an
   anchor" without reading the partner.
4. **Generality.** Every strand, every world: a free strand and a strand held by its low end take no dock (a hold is
   lost only through a `&` on the anchor side or the spare edge, which no kit has; a copy in progress then completes);
   any anchor that catches a high end makes that strand a template.
   Contact copying of a strand's free sides is unchanged (a free strand's triangles are still copied). Biology: a
   chromosome is replicated where its origin is attached to the membrane.
5. **What it replaces.** The option `heldCopy` and the old default branch (zip from every free high end): the core
   has no option left. Checks that relied on free strands being copied adapt (the founder starts held by its high end
   on a prepared anchor, labelled: `copy`, the `imprint p` cells, the unit tests of copying) or retire with the layouts
   the lineage has left (NEXT priority 1: the doorway pairs `budpore*`, the sealed pair's last cell `budpool-e`, the
   harness's two generations `budcycle-2`, and the `imprint` variants the held cell supersedes); each retired check's
   INNOVATIONS entry stays and its ROADMAP row says "retired".
6. **Result (built as the rule; test "copy: only a strand held by its high end is copied (a free strand, or one held
   by its low end, takes no dock)").** `node tri/check.js` with `CHECK_SAVE`, before (`882b7d4`: 23 of 23, 2849 s) and
   after (11 of 11, 1349 s): the worlds that already ran with the option or never copy a strand are byte for byte the
   same (`ring`, `imprint`, `budpool`, `budcycle`, `budcycle-free`: 20 worlds), and the new `imprint-pore` (`150px`)
   is the old `imprint-held` (`150pzox`) byte for byte (4 worlds). Adapted: `copy` (held founder) 4 of 4 with 2-4
   copies (was 2-3 on free strands); `imprint-genome` (held founder) 4 of 4 with 11-15 strands (was 9-15: the free
   copies copied too); `imprint-pore-c` and `-n` pass as before. Retired (12 checks; code in git at `882b7d4`, INNOVATIONS
   entries kept): `imprint-cell`, `imprint-cell-n`, `imprint-held`, `imprint-held-c`, `imprint-held-w`, `imprint-hood`,
   `budpore`, `budpore-c`, `budpore-held`, `budpore-kind`, `budpool-e`, `budcycle-2`; the `budpore` demo (146 lines)
   left `tri/demos.js`. Founders can start held (`createWorld` founder option `hold`: an anchor cell and a support,
   their other sides closed `-|`; found by an independent review: with plain sides copy blanks copied the hold cells,
   44 of 195 copies in `imprint g`). `node tri/test.js`: 32 tests, the copying tests on held founders.

### Narrowing: only grown triangles bind by glue; a strand end binds only by an anchor's catch, 2026-10-04, autorun run 20261004-0022 (explore)
1. **Capability and why the goal needs it.** A cell must turn its food into the genome monomers it uses. In `budcycle`
   (the kind's cycle, run 2221) the 200 blanks are gone by t = 75000 and the buds that split late copy their strand
   0-3 times. Measured in this run (`budcycle`, seeds 1-4, 300000 steps, census of every contact copy by the role and
   side of the copied triangle): the blanks become genome monomers 5x faster than copying uses them (seed 1: 194 made,
   about 40 used by t = 70000), and in the wrong proportions: awz : Awz : --W = 30 : 64 : 100 made, 2 : 2 : 3 used per
   copy, so the face monomer `awz` runs out first (4 left at the end of seed 1, against 38 `Awz` and 49 `--W`). The
   cause is one binding: a free back monomer `--W` glue-binds a strand's low-end seed `w` (the spare edge, which carries
   the docker's prev glue, the one a fill binds). That cap hides the low end's own copyable spare edge (4 copies of the
   low end's spare against 36 of the high end's) and is itself a grown triangle with two free sides that blanks copy
   (5 caps made 61 of the 100 back monomers). Candidate (g) of run 2221 (free strands not contact-copied) was weighed
   first with a non-local oracle (`BCG=1`, the most any local rule could do) and does not help: the blanks are copied
   at the held strands instead (seed 1: 186 of 186 genome copies from held bodies; seed 2: the parent made 2 copies and
   the bud never caught). Withdrawn.
2. **Designs with the existing core, and why they fail.** The cap needs a back monomer whose next side complements the
   docker's prev side (that is what a fill is), and every face triangle is a docker type, so a strand's low end always
   exposes a fill site's glue: no genome design avoids it. A `.` (close-only) prev side on dockers stops the cap and
   stops every fill with it (test "an attached triangle's close-only side takes no dock or fill"). Recycling monomers
   (waste drive `BCW`, run 2221) returns blanks that are copied in the same skewed proportions.
3. **Locality.** Nothing new is read: glue binding and glue closure already ask which sides of an attached triangle are
   active (its own role and bonds); the change removes two of the three cases (the spare edge of a strand end that is
   not being copied, which also read the triangle's busy relay; the back edge of a released strand triangle). A strand
   triangle then binds only by dock, fill and copy closure, and its end's seed only by an anchor's catch (a rule of its
   own, unchanged).
4. **Generality.** One rule for glue: only grown (glue-bonded) triangles bind by glue, free triangles and attached ones
   alike. With it the `&` case of zip (a high end held by a completion-release side starts no copy) can no longer
   arise, since only an anchor side holds a strand end and no anchor side carries `&`: it is removed too. The
   strand-end catch by glue was the casting lineage's (caps, a ring grown on a strand's seed); nothing kept uses it on
   purpose (point 7: every check still passes; the margins moved both ways).
5. **What it replaces.** Two branches of the active-side rule and one case of zip; the busy relay is then read by
   refractory alone. The narrowing of run 0050 (a free triangle's anchor side binds nothing) was made because free copies
   of a waiting anchor glue-capped strand ends; it stays (a free anchor-side triangle could still bind a grown side).
6. **Measured before the change** (`budcycle` `BCH=1`, the same rule as a demo what-if, seeds 1-4, 300000 steps;
   without it in brackets): monomers made awz : Awz : --W about 1 : 1 : 1 (1 : 2 : 3.3); used in copies 47-86% of those
   made (17-46%); full copies, parent and bud together, 10 / 11 / 13 / 13 (12 / 8 / 8 / 4); strands leaked 9-17 (1-11);
   the split at 144301 / 127592 / 58302 / 73532 (47081 / 217572 / 145137 / 217631); the bud's copies after the split 1 /
   6 / 8 / 7 (8 / 2 / 3 / 0); 0 stray bindings, every bud complete.
7. **Result (built as the rule; tests "binding: a strand end's seed and a strand's back bind no free triangle by
   glue", "anchor: a free triangle's anchor side binds nothing" now against a grown side).** `node tri/check.js` 21 of 22 with the change (the old code: 22 of 22, 2151 s; new 2072 s): `copy` 3 -> 4 of 4,
   `budpore` 3 -> 4 of 4, `budpore-c` 6 -> 7 of 8, `budpore-held` 4 -> 3 of 4 (seed 1 never split), `imprint-cell` 4 -> 3
   of 4 (5 / 5 / 5 / 3 strands, was 8 / 6 / 5 / 7: in a sealed cell with 60 blanks the back monomers run short now,
   since the caps' copies had supplied them: 13-19 fills to 30-36 docks), `imprint-held-w` 3 -> 2 of 4, the rest
   unchanged. `imprint-held-w`'s failures (and seed 2's on the old code) were a race in the setup: the founder started
   free beside the anchor and left through the 7-cell pore before it was caught (seeds 1-8: 1 of 8 on the old code, 3
   of 8 on the new). The `z` variants of `imprint` now start with the founder held on the anchor (labelled, as in
   `budcycle`); seeds 1-8 then pass on both codes in all three held checks (`imprint-held-w` 5-11 strands made, new
   code), and `node tri/check.js imprint-held imprint-held-c imprint-held-w`: 3 of 3 (4/4, 1/1, 4/4). So 22 of 22. The
   20 worlds in which nothing can glue-bind a strand (`ring`, `imprint`'s rings, `budpool`, `budpool-e`, the controls
   with inert blanks) are byte for byte the same; the 57 others differ.

### Removal: the casting lineage leaves the core, 2026-10-03, autorun run 20261003-2121 (core-review)
NEXT.md's priority 5 (direction check, run 1321): weigh removing the frozen casting lineage now rather than after a
whole cycle works. Decided: remove. The case, then the result.
1. **What leaves.** Rules: casting (a pocket of three activated casters, `%`) and stamps (carried marks `'`); hinges
   and driven flaps (`<` `>`, wide `=`, hand-off `^`, drop `!`, pulse door `#`), triggers `*`, latches `~`, heard
   triggers `+` (the hear signal), the lock signal (interlock), the trigger side's deafness while open or locked;
   energy (charge, "a discharged triangle binds nothing", fuel `$`, the environment drive `light`); proofreading
   (option `pLoose`, the caught state). States and values: charge, caught, door open, powered, away, the hinge's rest
   angle and side, fu, pwE, tb, nbc, actE, sg, lockBusy. Physics: the hinge mark per side and the flap turned by the
   chemistry (the labelled exception "a flap whose body reaches its own hinge partner cannot turn"). Demos (18) and
   their checks (24): `lid`, `factory`, `energy`, `conveyor`, `gate`, `import`, `grow`, `stamp`, `heir`, `cycle`,
   `wrap`, `cells`, `live`, `cell`, `grown`, `bud`, `split`, `budgrow`; structures `lidPocket`, `stampInstr`,
   `conveyor`, `ring` (the gated ring), `importRing`, `kit`, `kitOptions`, `kitRace`, `doorRingKit`, `budPair`,
   `grownBud`, `mapKit`; 12 tests. All of it stays in git at `7415fd4`.
2. **For.** (a) Nothing on the closure path uses it: the copy lineage (`imprint`, `budpore`, `pool`, `budpool`,
   `closure`, `budKit`) uses the marks `. @ & | ?`, the busy, zip and open signals, binding, chain and contact
   copying (coverage hook, run 0450 and this run; and every kept check's output is byte for byte the same without it,
   below). (b) It was frozen since run 1751 (2026-10-02) and three direction checks found no step of the current plan
   that needs it. (c) It cost about half of every check run (run 1321's estimate: 5100 of 9200 worker-seconds) and
   most of the core: 11 of 16 marks, 2 of 5 signals, 6 of 9 states. (d) Two open core-review candidates were casting
   lineage only and close with it: a welded partner's bonded trigger read directly (`budgrow`'s pulse-door hinges)
   and the attached close-only side that took docks and fills (dockers `Ay.z`). (e) AGENTS.md: "Simplifying is
   progress"; "Prefer generalizing or removing a rule over adding one".
3. **Against, and why it does not hold.** Working capabilities leave the tree: casting dockers from blanks, import
   doors, pumps, energy per swing, grown doors, a protocell. They were a different route (prepared kits of 50-60 part
   types per machine, a pocket per cast type) that contact copying replaced (Core changes, 2026-10-02: "Stamp casting
   existed to make kit parts; copying makes them without a pocket per type"). If the organism later needs selective
   transport, proofreading or energy, those designs and their pitfalls are in git, INNOVATIONS and IDEAS, and a
   machine would come back through this gate rebuilt on the current core, not as the old lineage. Run 1751's reason
   to wait (remove once a whole cycle works) was weighed by run 1321: the cycle is several runs away and the cost is
   paid on every check until then.
4. **Locality.** Only reads are removed. Two narrowings ride along, each reading one more fixed or own value: a
   spent anchor side catches nothing (the anchor reads its own side's spent flag; candidate (d) of run 1921's NEXT:
   RULES said a spent side binds nothing, the anchor code did not test it), and an attached close-only side takes no
   dock or fill (the template reads its own side's close-only mark; candidate (b): the exception existed only for
   the casting lineage's dockers). Binding now has no exception: a close-only side binds no free triangle at all.
5. **Generality.** The copy lineage's worlds carry none of the removed marks, so every removed branch was inert in
   them: charge was always 1, no side was a trigger, latch, hinge or fuel side, no activator made `actE` count, no
   rule consumed a random number on their behalf (`pLoose` and `light` only when set). The step order is unchanged
   (the completion release ran first in `servo`, which returned early without hinges; it now runs first as
   `_release`). So outputs must be identical, and they were checked to be (6).
6. **Result.** `node tri/check.js` on the 20 kept checks with `CHECK_SAVE` (new: keeps each world's whole output),
   before (`7415fd4`) and after: 20 of 20 pass both times (1139 s before, 1086 s after; the full suite with the casting lineage took 2438 s in run 1921), and all 69 worlds' outputs are byte for byte the same (`diff -r`); the demos outside the checks too (`closure`; `pool 4` and `budpool` seed 2, 20000-30000 steps). `node tri/test.js`: 29 tests (was 40: 12 removed with the
   lineage, the type test rewritten, 1 added for the close-only narrowing; the anchor test gained a spent case; both
   narrowings' tests fail when their condition is reverted). The core: 5 marks, 3 relayed signals, 4 exposed values,
   3 states, 1 option (Core inventory); `tri/sim.js` 336 -> 231 lines, the whole `tri/` about 1300 lines shorter.

### Option `heldCopy`: only a strand held by its high end is copied, 2026-10-03, autorun run 20261003-1720 (explore)
1. **Capability and why the goal needs it.** A cell that leaks strands must not starve. The closure kind's 7-cell pore
   is both the doorway its strand crosses to the bud and its feeding pore afterwards, so after the split both cells lose
   strands, and today a free strand outside copies itself from the open food faster than any cell (three rival strands
   leave an `imprint p` cell 1-2 strands: run 0320). Every design so far tried to stop the leak (NEXT priority 2). If
   a free strand cannot be copied, a leak costs the cell only the strand, and the opening problem goes away: the cell
   keeps a held strand that copies, its leaked copies feed nobody's growth.
2. **Designs with the existing core, and why they fail** (analysis in IDEAS, run 1720: "The kind's opening: the parent
   cannot see its bud finish"). The parent's opening must widen after the bud has sealed the pair and narrow again after
   the catch. (i) The existing-core outline (a resting emitter at the parent's root silenced by the bud's last cell)
   needs a bond between the bud's last cell E and the parent's root, and the only edge they share is the seed edge,
   whose root side is spent at the parent's own split: no bond can form there, so the parent cannot see its bud finish.
   (ii) A release by signal (cut while hearing the open signal) fires on the parent's E side from the bud's first cell
   (the bud's root binds E and emits), opening the parent during the whole growth, and never on the root side (the bud
   front is 40+ bonds away through bonds, openRange is 1-3). (iii) Fission needs insertion growth on rigid bodies
   (IDEAS, 2026-10-03): not a near step. A hood keeps strands in but also out (no transfer).
3. **Locality.** The zip relay already starts at a strand's high end (no next bond) and already reads the bond on the
   end's spare edge (zip 0 while it is held by a `&` side). With the option the high end emits zip only while its spare
   edge is bonded, and not to a `&` side: its own bond and the partner side's fixed mark, nothing more. Docking is
   unchanged (a face takes a dock only while it hears zip).
4. **Generality.** One condition on zip's origin, the opposite of a case that exists: "held by `&`: no copy" becomes
   "copied only while held, not by `&`". Any anchor that catches a strand's high end (glue complementing the high end's
   spare edge, `z` in the copy lineage's genome) makes it a template; a free strand, a strand held by its low end and a
   partial copy left on a free strand stay as they are. Contact copying of a free strand's triangles is unchanged (its
   free sides are still copied: dockers and fills for the held ones). Biology: a chromosome is replicated where its
   origin is attached to the membrane.
5. **What it replaces.** An option, off by default (the casting lineage's free chains copy, `imprint g` and `imprint m`
   copy free founders); if it carries the kind, it replaces the `&` case of zip as the rule when the casting lineage
   leaves (priority 5) and the copy lineage's demos move their anchors to the high end.
6. **Result (built as an option, `heldCopy`, default off).** Outputs with the option off are unchanged by construction
   (the zip branch is the same when the option is off); `node tri/check.js` 42 of 42 (the 39 before plus three new).
   `imprint` cell with a held founder (anchor `Z@|`, 150 blanks outside, 100000 steps; INNOVATIONS run 1720): three
   rival strands outside, 6-7 strands inside in 4 of 4 (without the option 2-3, the rivals multiply); a 7-cell pore
   leaks every copy and the founder keeps copying (3 of 4); a lone cell 6 of 8 with 6+ inside (free copying: 8-9).
   `budpore 300` (open pair, both anchors on high ends, `BUDAG=Z BUDPFE=z`): the bud's caught strand makes 11-14 full
   copies after the split in 3 of 4 worlds (without the option 0-1, as in every earlier run); the fourth world never
   split (the parent's founder stalled at its first copy, backs in the wall's wedge). Test: "heldCopy option".

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
6. **Result (built as the rule).** Outputs change only in worlds where a blank reached an anchor. `budpore 300` seeds
   1-4: anchor copies 22 / 22 / 35 / 28 -> 0, genome copies 265-278 -> 300 of 300, split with 50+ blanks left 3 of 4
   (as before, other seeds). Worlds with 0-1 anchor copies diverge either way: `budpore 100c` seeds 1-16 12 split (was
   14; 13 identical worlds), `imprint 150p` seeds 1-8 8 with 4+ inside (was 7), `imprint 150ph` seeds 1-8 7 (was 8).
   `node tri/check.js`: 37 of 37 (budpore-c 6 of 8 and imprint-hood 3 of 4, both at their margins). Test: "copy side: a
   copy blank binds no anchor side (a waiting anchor is no template)". Candidate (c) withdrawn.

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
capture 0.6, triTolClose 0.05, openRange 120`; no options (`heldCopy` became the rule 2026-10-04, run 0820).
(Removed 2026-10-03 with the casting lineage: `hingeAngle`, `hingeRate`, `dropTol`, `lockRange`, `sigRange`,
`pLoose`, `light`.)
