# Next instance: start here

State on 2026-10-02 (after autorun run 20261002-1921, build). Read AGENTS.md first (rules of work), then this file.
History of earlier runs: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git.

**Current slice (autorun run 20261002-2150, harden): speed.** Goal: faster demos and checks without changing what
they compute (Direction priority 5). Measure steps per second on `budpore 300` and the slowest checks, profile, and
optimise the hot path (lone blocks in physics, `_single`, per-step chemistry). Done when: `budpore` steps per second
up by 1.5x or more, demo outputs on fixed seeds identical to `main` (or each difference explained), `node tri/test.js`
passes and `node tri/check.js` passes all working checks. Stop: if the profile shows no single hot spot worth more
than 20%, record the profile and report.

**Progress (run 2150, in progress).** Fixed: `imprint 60m`/`150p` crashed on main (`split is not defined`, a stray
`budpore` report suffix from d91de57), so checks imprint-cell, imprint-pore and their controls failed. Speed (outputs
identical to main on 12 short demo runs, `runs/bench.sh`): lone blocks skip grid cells out of reach; budPair's doorstop
search and sweepClear (split o setup 31 s -> 1.5 s); shared role records for free triangles. Short runs 1.1-1.25x,
split o 2.7x; budpore's loop only about 1.1x (the cost is spread: lone-block gather 20%, ring moves 14%, pairs 9%).
Running: `node tri/check.js > runs/check_full.txt` (full suite, about 35 minutes); rerun it if the run ended.

**Handoff status (autorun run 20261002-1921, build).** Everything committed on branch `claude/autorun-20261002-1921`
and merged into `main`. No simulations running; `node tri/test.js` 34 pass; `node tri/check.js budpore` passes 4 of 4
(no rule, physics or shared-structure change, so the full suite was not rerun; last full run 35 of 35 in run 1821).
No current slice. **Done (slice: M2 on `budpore`; not met, ended at the stop condition):** D's anchor is now `W@|*`
mid-wall on D's lower-left wall (a 4-bond hear chain `+` carries its trigger to the latch cell) and catches a strand's
low end `w` (the parent's anchor glue too), so the high end, where copying starts, stands free in the bud; the latch
bond and all prepared wall sides carry no glue. Splits with food left: 8 of 8 seeds (was 4 of 8), check `budpore`
updated (split with 50+ blanks left) and no longer partial. The bud's own copying after the split: one full copy in
2 of 8 seeds. Why (INNOVATIONS, run 1921): the caught strand leans with its backs towards the wall (one back site is
covered by a wall cell, centre distance 0.58), so back copies (the fills) are rare at the bud's strand; even while
joined with food around it gets 0-3 releases in 100000+ steps; and after the split P's copies outside, the freed latch
sides and copies of the anchor cell take the food (600 blanks did not help: 0-1 copies). Dropped variants (measured):
anchor catching the high end `z` mid-wall, low-end anchor at the old corner, an `&` hold two bonds from the anchor,
the mirrored layout (opening on the left: 2 of 4 split, no copies), and two anchors (one holding the bud's strand and
locking the latch with an unbonded latch side `~`, one triggering; "replicate before dividing"): the trigger anchor 2
bonds from the latch never caught. Two core-change candidates below.

**Exact next step (build, priority 1 below): M2, choose D's anchor by where the caught strand's backs face.** Before
running anything, dry-run the capture for each inner wall side of D within the hear range of the latch cell (or with a
larger `sigRange` passed as a parameter, if the best sides are farther): place a strand by its low end `w` with
`_snapBody` (as the founder is placed on P's anchor) and measure each back site's distance to the nearest wall cell;
keep sides whose back sites are all clear (more than about 1.5 from walls) and that leave the faces free too. Then run
`budpore` seeds 1-4 (300 blanks, 200000 steps, about 4.5 minutes each, 4 at once) and read "on the bud's anchored
strand N (copies M)" and "before the split on D's anchored strand". Target: one full copy of the bud's strand (4
releases) in 3 of 4 worlds, before or after the split. If no side gives open backs, the genome's handedness decides:
try the founder's mirror (`gaps` and faces reversed) so its backs face the other way. After that, "replicate before
dividing" (the bud's strand copies while joined; a second, triggering anchor releases the latch once both hold) is
the design that keeps the bud fed: place the trigger anchor where strands are caught often (the old corner place
caught in 4 of 4 worlds with `w`).

**Core-change candidates (for an `explore` run; each needs its case in RULES first).**
1. *A free part binds only an attached attach side `@`* (or narrower: a free triangle's anchor side `|` never binds by
   glue). Measured in `budpore`: copies of the bud's anchor cell (made before its catch, 15-60 per world) are parts
   `W@|*` that glue-bind strand low ends `w` (5-17 per world); a capped strand can no longer be caught, and the bound
   copy's free sides are copied again (30-80 copies after the split). Today an attached `@` side binds only a free
   part's `@` side, but a free part's `@` side binds any complementary glue side; making it symmetric would remove
   this, but kits (casting lineage) must be checked with the coverage hook first.
2. *A latch side that has let go, on a triangle without a hinge, is spent* (with `~` on both sides of the bond, the
   partner's latch letting go on the hear signal it gets through its own hear side). Measured: after the split the two
   freed latch sides are copied by every blank that reaches them: 19-105 copies per world (seed 1 with weld glue: 105
   of the 172 blanks left at the split). Doors re-latch on closing, so hinged latches stay as they are.

### Direction (autorun run 20261002-1751, review-intent): where the work stands and what comes first
**Findings.**
1. **Two half-organisms.** Since the synthesis decision (run 0136: contact copying) the build line has alternated
   between two lineages: the casting lineage (kit parts and stamp-cast dockers as prepared food: `split o`,
   `budgrow`, `budgrow g`; run 1351 built here) and the copy lineage (one uniform food, copy blanks: `imprint m/p`,
   `budpore`; runs 0236, 0921, 1551). Each covers part of the goal sentence with different prepared pieces; neither
   is converging on the other. The copy lineage is the only one where the parent can construct its offspring from
   uniform food (in the casting lineage the world supplies the bud's kit parts, the parent only a seed), and only it
   lets a later core review shrink the core. **Decision: all new building goes to the copy lineage; the casting
   lineage is frozen** (its checks keep running and passing; no new features, its open follow-ups are dropped:
   `budgrow g`'s transport tail and second bud, `grown`'s membrane stall, fuel per swing, the airlock).
2. **The core is not outgrowing the capabilities.** Since 10-01 the core gained one rule (copy side `?`) and lost or
   narrowed several (K merged into `%`, the latch's open hold, 8 options, the anchor reads less). Good. The larger
   win is ahead: the copy lineage uses only `@ . & | ? ~ *`, the open, busy and zip signals and binding; casting,
   stamp, fuel and most machine marks (`% ' $ ^ # = ! < > +`) serve only the frozen lineage (measured with the coverage hook on 3000-step runs of `budpore 300`, `imprint`,
   `imprint 60m`, `imprint 150p`: marks present are `. * ~ @ & | ?` only; since run 1921 `budpore` also uses `+`, its hear chain). Once the organism on
   copies runs a whole cycle (priority 3), a `core-review` should weigh removing them (with their demos, into git
   history, as the 10-01 restart did); the case goes through the RULES gate first.
3. **Prepared structure does most of the organism's work.** In `budpore` only the genome copies are grown; both
   rings, the bud's anchor, the latch bond, the opening and the founder are prepared (ROADMAP, "Organism on copies:
   parts and where they come from"). Of these, the bud ring and everything on it must be made each generation.
4. **Nothing yet tests closure.** The goal is a lineage: the offspring must be able to do it again. `budpore`'s bud is
   not its parent's kind (D is R 5 with anchor `Z@|*` and a latch side; P is R 7 with anchor `W|` and a seed for no
   bud), so even a perfect run would end the lineage after one generation. Closure is a design question to settle
   early, before more prepared asymmetries are built on.
5. **A design tension found.** Food protection needs spent `&` walls (spent sides are never copied: imprint m, p);
   but a spent wall cannot be a template, so a complete parent cannot template its bud's ring. Ring material must
   come from something exposed and unspent: the bud's own growing front (as `imprint`'s rings: one motif round grows
   into a whole ring from copies, while open-signal sides are unspent), or templates carried where they stay exposed
   (on the genome, inside the parent). Written into IDEAS.

**Priorities (in order; each a slice).**
1. **M2: the bud copies its genome after the split** (`budpore`, mid-wall anchor in D; as run 1551 set it; run 1921
   built the mid-wall low-end anchor, splits 8 of 8, but the caught strand's backs face the wall: see Exact next step). After the
   split D's half of the opening is its pore, so D is then an `imprint p` cell: the bud "lives on its own".
2. **Closure by design (analysis slice; "designed, not demonstrated" is a valid result).** Specify one organism kind
   whose bud is the same kind: one ring size or a fixed alternation, which anchor holds the founder and which catches
   (one glue for both roles, or roles by position), how the bud's seed site and latch are re-made in the bud, and
   where the bud ring's first motif round comes from (finding 5). Output: a parts list where every part is grown from
   copies or comes from the environment, with each step mapped to an existing demo, and the rules it reads (locality
   check). A `build` or `explore` run can take it; if it needs a core change, the case goes to RULES first.
3. **Grow the bud ring from copies** (replace D in `budpore`): the bud grows on P's seed site from copies of its own
   motif round (as `imprint`), outside in the food; latch and anchor as parts of its kit. Fix `imprint`'s one-front
   28/30 stall on the way (Pitfalls: one-front rings), since this ring uses the same growth. Target 3 of 4 worlds.
4. **Two generations:** the bud of priority 3 splits off, copies its genome (priority 1) and starts its own bud.
   This is the goal's whole cycle; then the core-review of finding 2.
5. **Speed (for `harden` runs):** `budpore` worlds take about 4 minutes and the check suite 40; copy-lineage worlds
   need hundreds of blanks, and lone blocks dominate physics (`_single`). Measure steps per second on `budpore` and
   optimise the lone-block path; keep capability lines identical or explain each difference.
**Rotation:** unchanged. Five `build` runs per twelve fit priorities 1-4; `explore` can take priority 2 or a core
change it needs; the two `harden` runs take priority 5 and the copy lineage's partial checks (`budpore`, `imprint`
5 of 8); `core-review` takes finding 2 once priority 3 works.

### Open follow-ups (not priorities; take when a run's kind fits)
- **Core review (after priority 3, see finding 2):** `#` on a trigger side ("let the key go") is now used only by the
  gate's pulse option (the airlock demo was removed in run 1821): remove both together, then `#` means only "pulse
  door". Lock signal has three uses (keys deaf, latches held, pulse doors ignore their trigger); a merge would need
  non-pulse flaps to tell their own open latch from another door's. Same-pass partner reads (zip, gap, release, fn,
  cast) are allowed by convention (RULES, Locality audit); change only if a locality problem traces back to them.
  Coverage hook: `COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r ./tri/coverage.js" node tri/check.js` (one JSON line
  per demo world: marks used, rule events).
- **Frozen with the casting lineage (not pursued):** fuel per swing (two carriers on one fuel triangle are both spent;
  design in git, NEXT.md at `c11ed14`), `grown`'s membrane stall at 72-76 of 78, `budgrow g`'s transport tail and
  second bud.

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/check.js [id ...]                         # capability checks: one PASS/FAIL line each (~40 min, 4 processes)
node tri/demos.js budpore 1 200000 runs 300        # bud pair on copies: mid-wall catch, split with food left (8 of 8); DBGC=1: where copies go, BUDF=20: frames
node tri/demos.js imprint 1 100000 runs 150p       # a cell fed through a pore copies its genome from blanks outside (150pc, 150pn: controls)
node tri/demos.js imprint 1 60000 runs 60m         # a sealed cell (spent & walls) copies its genome from copy blanks (60mn: control)
node tri/demos.js imprint 1 30000 runs g           # a strand copied from copies of its own triangles (gc: control)
node tri/demos.js imprint 1 200000 runs            # contact copying: a ring closes and a second grows from copy blanks only
```
Casting lineage and older (frozen; each has a check in `tri/check.js` with its seeds, steps and extra): `copy`, `lid`,
`factory`, `energy`, `conveyor`, `gate`, `import`, `grow` (`12`, `4s`), `stamp`, `ring`, `heir`, `cycle`, `wrap`,
`cells`, `live`, `cell`, `grown`, `bud`, `split` (default, `g`, `o`), `budgrow` (default, `g`). Pictures go to
`runs/NAME.png` with saved states; `TRI_NOPIC=1` turns them off. `TRI_RESUME=runs/x/NAME_tNNN.json.gz` continues a demo
world from a saved state (not `split`: it places its parts after loading); `TRI_PARAMS='{...}'` overrides parameters.

## Pitfalls learned
Casting-lineage and machine pitfalls (kits, pockets, doors, flaps): docs/IDEAS.md, "Pitfalls from the casting lineage".
- **Where a caught strand's backs face** (2026-10-02, run 1921). A strand caught by an end stands at 60 degrees to the
  wall, leaning one way fixed by which end is caught and the strand's handedness; its backs then face either the acute
  wedge (a back site can be covered by a wall cell) or the open side. Backs in the wedge get no copies, so there are
  no fills and copying stalls after a few docks. Dry-run the capture and measure back sites before placing an anchor.
- **Prepared bonds need no glue** (2026-10-02, run 1921). A weld glue left on a prepared side becomes active when the
  bond is cut (a latch letting go) or on every copy of the cell: copies of `f`/`F` cells glued onto each other and grew
  crystals. Zero the glue of prepared walls; give glue only to sides meant to bind.
- **A freed side is a food sink.** Every free, unspent side of an attached triangle is copied by every copy blank that
  reaches it, glue or not (a released latch side: up to 105 copies). Count exposed sides after each event, not only at t=0.
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
  anchors) lost 98% of the blanks to its walls. Hold by one latch bond instead, released by the anchor's own trigger
  side (`budpore`), so only the anchor side is ever unspent.
- **Anchors in the middle of a flat wall.** An anchor next to a hex corner lays its strand along the next wall with its
  backs hidden: no back is copied, so no fill exists and copying deadlocks (`budPair`'s P anchor is such a place).
- **One gap per one-row ring.** A pore plus a doorway cuts a ring's wall into two bodies.
- **Copy blanks go to every exposed side.** Walls take most of a batch (65-70% in a cell). Mark plain wall sides `&`:
  they are spent once the structure hears no open signal and are never copied. Copies of `&` cells used as fills are
  cut when their `&` side hears none: use `latGlue` so only genome back copies fill.
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
