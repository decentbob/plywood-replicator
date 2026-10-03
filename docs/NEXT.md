# Next instance: start here

**Current slice (autorun run 20261003-1921, build; in progress).** Goal: a held founder's first copy reliable on the
open pair (`budpore-held` 4 of 4), by a dry-run of P's anchor sides (`BUDDRYP`, new; `BUDPA=cell:side` picks one).
Done when: a side gives the bud 5+ copies after the split in 4 of 4 check worlds (and 6+ of 8 seeds). Then, if time is
left: the kind's own layout (`budKit`, root anchor `Z@|`, heldCopy). Stop: if no side reaches 4 of 4, record the
failure modes per side. Batch: `runs/b1921/q.sh OUT "cell:side ..." "seeds"` (in `runs/`, regenerate from git history
of this note if lost: it runs budpore 300 with BUDPA, BUDAG=Z, BUDPFE=z, heldCopy, 4 at a time).

State on 2026-10-03 (after autorun run 20261003-1720, explore). Read AGENTS.md first (rules of work), then this
file. History of earlier runs: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (older
handoffs: NEXT.md in git, e.g. at `e5c6085` for run 1650's, `96c5221` for run 1520's).

**Handoff status (autorun run 20261003-1720, explore).** Priority 2 taken by analysis plus one gated core change;
merged into `main` (branch `claude/autorun-20261003-1720`); no simulations running; 39 tests pass; `node tri/check.js`
42 of 42 before the last edits (budpore labels, `budpore-held`, run alone: pass 3 of 4), so 43 checks now.
(1) **Analysis** (IDEAS, "The kind's opening: the parent cannot see its bud finish"): none of run 1650's three designs
works in `budKit`'s geometry. The bud's E touches the parent only on the root's seed side, which is spent at the
parent's own split, so "the bud has sealed the pair" never reaches the parent (design i); a release by signal fires on
the parent's E side from the bud's first cell and never on the root side (ii); fission needs insertion growth (iii).
(2) **Core change, option `heldCopy`** (RULES, Core changes, run 1720; default off): zip starts at a strand's high end
only while its spare edge is held (bonded, not to `&`), so free strands, leaked or rival, are never copied. Then leaks
no longer starve a cell, and the kind may keep its 7-cell pores. `imprint` cell (flags `z` anchor `Z@|` at x = +1,
`o` option, `w` 7-cell pore): 3 rivals outside, 6-7 strands inside in 4 of 4 (2-3 without; check `imprint-held`); a
7-cell pore leaks every copy and the founder keeps copying (3 of 4, `imprint-held-w`). (3) **M2 on the open pair:**
`budpore 300` with both anchors on high ends (`BUDAG=Z BUDPFE=z`) and the option: the bud makes 10-15 full copies after
the split in every world that split (3 of 4 checked, `budpore-held`; 5 of 8 seeds; 0-1 without the option). Every
failure: the parent's founder stalls at its first copy (backs in the wall's wedge; no back copy exists anywhere until
a held strand has made one).

**Exact next step.** The next run in the rotation is `build`: take the kind with `heldCopy` toward priority 3. (a) Make
a held founder's first copy reliable: dry-run P's anchor sides in `budpore` as `BUDDRY` does for D's (where the backs of
a strand held by its high end face open space), pick the side, target 4 of 4 for `budpore-held`. (b) Then the kind's
own layout: `budKit` with the root's anchor `Z@|` (high end), the option, the 7-cell doorway; the transfer batch of
run 1121 (founder where the kind holds it: 1 of 4 there, the jam) and the bud's copies after the split. Decide whether
the kind needs the anchor off the pore's edge. Regenerate the pictures: `node tri/demos.js imprint 2 100000 runs
150pzox` (and `150pzx`, `150pzow` seed 1); `BUDAG=Z BUDPFE=z TRI_PARAMS='{"heldCopy":true}' node tri/demos.js budpore 2
200000 runs 300`. Making `heldCopy` the rule waits for priority 5 (the casting lineage's free chains copy).

**Core-change candidates.** (c) withdrawn (run 1221); its narrower form is the rule now. (d) *Code vs RULES:*
the anchor catch does not test `spent` (`sim.js`, anchor block), while RULES says a spent side binds nothing again; no
structure has a spent anchor side, so nothing depends on it; a core review should add the test. (a) A flap swings on a
welded partner's bonded trigger read directly, besides hearing through `+`: only `budgrow`'s pulse-door hinges use the
direct path (`grownBud`); a `+` on those weld sides would leave one path. (b) An attached close-only side still takes
docks and fills (dockers `Ay.z` take fills on `y.`), against "close-only binds no free triangle"; documented as an
exception in RULES Binding. (a) and (b) are casting lineage; they go with its removal (priority 5). New observation
(run 1221): the kind's seed site `y` (plain glue, never spent) is copied by every blank that reaches it while no bud
sits on it (copies of E); measured in run 1420: 0-6 copies before the first root binds (about 1000 steps); in a
lineage the site is free most of the time, so E is over-produced, which the last-cell problem needs: keep it for now.

### Direction (autorun run 20261003-1321, review-intent): where the work stands and what comes first
Ten runs since the last direction check (run 1751): four `build` runs on M2 (1921, 2321, 0320, 0751), one `build` on
closure (1121), two `explore` (0050 completion release, 1221 anchor narrowing), one `core-review` (0450, removals), two
`harden` (speed 1.1-1.25x, 1.34x), one `cleanup`. **Findings.**
1. **M2 in `budpore` has stopped paying.** Four build runs gave real lessons (the way in is the way out; free strands
   beat cells; completion release; the genome as the plug; cap release 2 of 4) but no bud that copies its genome after
   the split, and `budpore` is a prepared pair that is not the organism's kind (finding 4 of run 1751). Further M2
   work there tunes a layout the lineage will not use. **Decision: no more M2 work on `budpore`'s layout**; `budpore`
   and `budpore c` stay as checks of transfer and split. M2 is now a question about the closure kind (priority 2).
2. **The closure kind inherits the unsolved problem.** `budKit`'s 7-cell pore is both the doorway (strands must pass,
   7 cells needed: 3-cell halves pass none) and the cell's feeding pore afterwards. By the law found in run 0320 (an
   opening a strand passes one way it passes the other) both cells then leak strands (run 1121: 0 / 11 / 7 / 9 strands
   outside after the split in 4 worlds), and leaked strands starve every cell near them. So the kind as designed cannot
   live on its own after the split, whatever its growth does. The kind's opening must be settled by design before more
   is built on its geometry, and the planned "move the anchor off the doorway" depends on that answer (an anchor at the
   pore's edge is a jam for the parent's founder but a plug for the bud's: run 0320 vs run 1121).
3. **Closure depends on an untested step with a large cost.** Every bud part comes from a pool of free parts of 46
   types, kept by copies made while each bud grows; run 1221's law puts the steady pool at about (r + 1)/2 to r + 1
   parts of each type per blank near the bud. If growth from such a pool stalls (crowding, wrong-type jams, the first
   fronts taking the blanks) the kind is dead whatever its opening. And a pool the organism does not refill is the
   casting lineage's prepared kit again (the reason it was frozen). This is the riskiest assumption left; test it first
   and in isolation, measuring the refill, not only completion.
4. **The core is shrinking; good.** Since run 1751: the latch, hear chain and trigger left the copy lineage; `#` key
   release, `zip` and `latGlue` options and latch partner reads removed; anchors narrowed twice. Capabilities did not
   pile up as separate demos (`budpore` combines `imprint p`, anchors and completion release), but **diagnostic options
   piled up in one demo**: `budpore` reads 24 `BUD*` environment variables, most from options tried once and dropped.
5. **The frozen casting lineage costs about half of every check run** (estimated worker time in `tri/check.js`: 5100 s
   of 9200 s) and about a dozen of the core's marks, and nothing on the closure path uses it (the copy lineage uses `. @ & | ?`,
   the open signal and binding). Run 1751 deferred its removal until a whole cycle works; that is several runs away
   (priorities 1-3), so the cost is paid on every check until then.
6. **Other paths, weighed.** *Fission* (a septum across a cell holding two strands) needs no strand transfer and no
   wide doorway at all, but its halves are not the parent's shape until the membrane grows back (insertion growth: the
   user's idea of 2026-10-03, hard on rigid physics: IDEAS). *A periodic ring* (7 motif types plus about 10 unique
   cells) cuts the pool by about 3x but brings back the door-cell race. Neither is clearly simpler than fixing the
   kind's opening; both stay candidates for priority 2's analysis. The goal sentence (the parent builds and feeds its
   offspring, then splits it off) fits budding; no change to the goal is proposed.

**Priorities (in order; each a slice).**
1. **Done (run 1420, demo `budpool`; was priority 3): the kind's bud grown from a part pool, in isolation.** The
   original text: A fixed seed site `y` (the
   parent's E alone, or a prepared parent ring without food or strands), a pool of `budKit` parts seeded at about
   (r + 1)/2 parts of each type per blank, the anchor at a parameter k (r = k + 1; k from a quick dry-run, no transfer
   batch). Measure: bud completed (target 3 of 4 worlds), steps to complete, copies made per type during the growth
   (the refill: at least one per type used), stray bindings, crowding. If it stalls, find out why before anything else;
   a fix to the kit or a smaller kind is the slice. This settles finding 3.
2. **The kind's opening: feed without leaking, still pass a strand to the next bud** (analysis first; `explore` or
   `build`; "designed, not demonstrated" is a valid result). The opening must be wide while a strand crosses to the bud
   and closed to strands while each cell feeds, and only binding events are one-way. Weigh at least: (a) two openings,
   a hooded feeding pore (`imprint ph`: no strand out) and a doorway that a binding event narrows after the transfer
   (the bud's caught strand as its plug, run 0320) and that the next bud's growth reopens; two gaps cut a one-row ring
   in two (IDEAS, Pitfalls), so the hood must join both sides of its pore (`imprint ph`'s hangs on one strut: untested); (b) one opening narrowed by its own caught strand and re-opened
   by a release the next bud's growth triggers; (c) fission plus insertion growth (finding 6). Output: the revised kind
   (`budKit` and its test), with each step mapped to a demo and the rules it reads (locality); a core change only
   through the RULES gate. Then move the anchor where the chosen opening needs it, and rerun the transfer batch on the
   kind's own layout (target 3 of 4). This replaces the old M2 priority. Two more requirements from run 1420 (IDEAS):
   the bud's last site opens only into the sealed pair (solved in isolation in run 1650: E's pore side plain, an E
   source inside, check `budpool-e`), and the pool's per-type counts drift with nothing to restore them (weigh fewer
   types, e.g. the periodic ring). Run 1650's analysis (IDEAS) narrows the opening: one opening per body, only
   silence widens; (a)'s hood joining both sides of its pore is no help. **Run 1720 (explore):** (i)-(iii) fail on paper in the kind's geometry;
   proposed instead: option `heldCopy` (free strands sterile), with which leaks cost nothing and the bud copies after
   the split on `budpore`'s open pair (3 of 4); next: the kind's own layout with it (Exact next step).
3. **Two generations** (was 4): a grown bud catches a strand, splits, feeds without leaking, and starts its own bud.
   The whole cycle; then priority 5's removal is no longer premature by anyone's measure.
4. **Prune `budpore`** (done in run 1351, cleanup; left: decide on `BUDCAP` and `BUDRD=7` once priority 2 has chosen): drop options no check or listed command uses (dead ends such as
   `BUDTOOTH`, `BUDNOCA`, `BUDDBGA`, `BUDNOP`; their results stay in INNOVATIONS and git); decide whether the plug
   (`BUDRD=7`) and cap-release (`BUDCAP`) commands still earn their options once priority 2 has chosen; keep `300`,
   `100c`, the 7-cell doorway and the dry-run; outputs identical on the checked worlds. Also: `tri/check.js` printing
   each check as it finishes (autorun feedback, run 2150).
5. **Weigh removing the casting lineage now, not after a whole cycle** (next `core-review`, case through the RULES
   gate first): its demos and checks (`lid`, `factory`, `energy`, `conveyor`, `gate`, `import`, `grow`, `stamp`, `heir`,
   `cycle`, `wrap`, `cells`, `live`, `cell`, `grown`, `bud`, `split`, `budgrow`) and the marks only they use (`% ' $ ^ #
   = ! < > * ~ +`, re-measure with the coverage hook), into git history as the 10-01 restart did. For: half the check
   time, a smaller core and RULES, nothing on the closure path uses them. Against: working capabilities (machines,
   pumps) leave the tree; they stay in git and could return if proofreading or transport needs them. If the review
   decides against, record why and keep them frozen.
6. **Speed and margins** (`harden`): `imprint-hood` done in run 1520 (14 of 14). Left at their margins, failure modes
   named (INNOVATIONS, run 1520): `budpore-c` 6 of 8 (frozen layout: fix only if priority 2 reuses it), `imprint` 3 of
   4 (seed 6's stop at 28 of 30 not diagnosed: next harden's first look), `budpore` 3 of 4 (food used up). Speed: the
   flat cell grid of run 2150's idea was built in run 0950; the full suite takes about 32 minutes. One `harden` per
   twelve runs is enough now: the work is limited by design questions, not by run time.
**Rotation (autorun `projects/plywood/rotation.txt`):** the second `harden` (line 8) became an `explore`: priorities 1
and 3 are `build` work, 2 is design work that `explore` and `build` can both take, 5 is the `core-review`'s.

### Open follow-ups (not priorities; take when a run's kind fits)
- **Core review:** `#` on a trigger side was removed in run 0450. Lock signal has three uses (keys deaf, latches held,
  pulse doors ignore their trigger); moot if priority 5 removes the casting lineage. Same-pass partner reads (zip, gap,
  release, fn, cast) are allowed by convention (RULES, Locality audit); change only if a locality problem traces back
  to them. Coverage hook: `COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r ./tri/coverage.js" node tri/check.js` (one JSON
  line per demo world: marks used, rule events).
- **Frozen with the casting lineage (not pursued):** fuel per swing (design in git, NEXT.md at `c11ed14`), `grown`'s
  membrane stall at 72-76 of 78, `budgrow g`'s transport tail and second bud.
- **Bigger cells and letter reuse** (user, 2026-10-03; IDEAS): R 5 is the largest all-unique kind (46 letters); if
  priority 1 or 2 needs a larger cell, reuse letters inside sealed compartments.

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/check.js [id ...] > runs/check.txt         # capability checks: one PASS/FAIL line each, printed as each finishes (~28 min, 4 processes)
POOLB=20 POOLISO=1 node tri/demos.js pool 1 100000 runs 4   # a waiting front among 20 blanks and 4 next parts: copies per bound part vs B/n
                                                   # (seconds; without POOLISO three more copyable sides beside it)
node tri/demos.js budpool 1 250000 runs             # the kind's bud grown from a pool of its 47 part types (extra: parts per type, 8;
                                                   # BPE: E parts, 40; BPB: blanks, 8; BPS: world size, 30; BPR: openRange, 1; BPHOLD=0: no harness)
BPES=1 BPE=0 BPB=16 node tri/demos.js budpool 1 250000 runs   # the same with E's pore side plain and no E part: the last cell from the source
node tri/demos.js closure                          # the designed kind (budKit): parent, bud grown in signal passes, catch, split (picture, no physics)
BUDRP=5 BUDRD=5 BUDPG=-1.75,1.75 BUDDG=-1.75,1.75 BUDPX=b BUDLX=2 BUDA=84:2 BUDNI=20 BUDPS=2 node tri/demos.js budpore 1 100000 runs 100c
                                                   # the kind's 7-cell doorway, founder away (4 of 4 split); the kind's own layout:
                                                   # BUDPF=-1.75 BUDPFE=w instead of BUDPX=b (1 of 4); 3-cell pores: BUDPG=BUDDG=-0.75,0.75
                                                   # BUDLX=1 BUDA=90:2 (0 of 8); BUDDRY=1: dry-run every bud anchor side (BUDAG=Z: by the high end)
node tri/demos.js budpore 1 100000 runs 100c       # sealed bud pair: P feeds inside, founder under the doorway (7 of 8 split)
node tri/demos.js budpore 1 200000 runs 300        # bud pair on copies: mid-wall catch, the doorway bond cut by completion release, split with food left (7 of 8); DBGC=1: where copies go, BUDF=20: frames;
                                                   # BUDDRY=1: dry-run a catch on every inner side of D; BUDA=cell:side: anchor
BUDRD=7 BUDDG=-1.75,3.25 BUDA=126:1 node tri/demos.js budpore 1 100000 runs 100c   # the bud's genome as its plug (run 0320)
BUDCAP=-2.75 BUDRP=9 BUDNI=160 BUDPG=-2.75,2.25 BUDPX=b BUDRD=7 BUDDG=-1.75,3.25 BUDA=146:1 node tri/demos.js budpore 1 100000 runs 100c
                                                   # cap release: the parent plugs its half after the bud's catch (2 of 4 split)
node tri/demos.js imprint 2 100000 runs 150pzox    # heldCopy: anchor Z@| holds the founder's high end, 3 sterile rivals outside
                                                   # (150pzx: control without the option; 150pzow: 7-cell pore; 150pzo: alone)
BUDAG=Z BUDPFE=z TRI_PARAMS='{"heldCopy":true}' node tri/demos.js budpore 2 200000 runs 300   # the bud copies after the split
                                                   # (BUDPX=b1: P's anchor at x = +1; check budpore-held)
node tri/demos.js imprint 1 100000 runs 150p       # a cell fed through a pore copies its genome from blanks outside (150pc, 150pn: controls)
node tri/demos.js imprint 1 100000 runs 150ph      # the same cell with a hooded pore: no strand leaves (x: 3 rival strands outside)
node tri/demos.js imprint 1 60000 runs 60m         # a sealed cell (spent & walls) copies its genome from copy blanks (60mn: control)
node tri/demos.js imprint 1 30000 runs g           # a strand copied from copies of its own triangles (gc: control)
node tri/demos.js imprint 1 200000 runs            # contact copying: a ring closes and a second grows from copy blanks only
```
Casting lineage and older (frozen; each has a check in `tri/check.js` with its seeds, steps and extra): `copy`, `lid`,
`factory`, `energy`, `conveyor`, `gate`, `import`, `grow` (`12`, `4s`), `stamp`, `ring`, `heir`, `cycle`, `wrap`,
`cells`, `live`, `cell`, `grown`, `bud`, `split` (default, `g`, `o`), `budgrow` (default, `g`). Pictures go to
`runs/NAME.png` with saved states; `TRI_NOPIC=1` turns them off. `TRI_RESUME=runs/x/NAME_tNNN.json.gz` continues a demo
world from a saved state (not `split` or `budpore`: they place parts after loading); `TRI_PARAMS='{...}'` overrides parameters.

## Pitfalls learned
Read before designing a layout: docs/IDEAS.md, "Pitfalls learned (copy lineage)" (doorways, anchors, food sinks,
signals, rings, physics) and "Pitfalls from the casting lineage" (kits, pockets, doors, flaps).
