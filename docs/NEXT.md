# Next instance: start here

State on 2026-10-03 (after autorun run 20261003-1420, build). Read AGENTS.md first (rules of work), then this
file. History of earlier runs: docs/INNOVATIONS.md (newest first), RULES (Core changes), the autorun log and git (older
handoffs: NEXT.md in git, e.g. at `e3a3d06` for run 1351's, `7a98831` for run 1321's).

**Current slice (autorun 20261003-1520, harden; in progress).** Priority 6: run the full check suite and fix any
failure; then raise the margins of `budpore-c` (6 of 8, need 6) and `imprint-hood` (3 of 4, need 3): measure each on
more seeds, find the failure mode in the failing worlds from their pictures, fix it with the existing core (layout or
demo parameters, no rule change). Done when the suite passes and each of the two has a failure mode named and either
a fix that passes more worlds or a recorded reason why not. Stop there; no new capability.

**Handoff status (autorun run 20261003-1420, build).** Priority 1 done and merged into `main` (branch
`claude/autorun-20261003-1420`); no simulations running; 38 tests pass; check `budpool` 4 of 4. Demo `budpool`: a
prepared parent of `budKit(5, 7)` grows its bud on its seed site from a pool of all 47 part types (8 each, 40 of the
last cell E) and 8 copy blanks, held at that composition by a labelled harness, openRange 1; a stand-in catch at the
end splits it. Results (INNOVATIONS, run 1420; lessons in IDEAS, "The kind's bud from a part pool"):
(1) growth from the pool works, cell by cell, 0 stray bindings, a bud in 107-200 thousand steps (8 of 8 worlds);
(2) refill 1.37 copies per used part on average at one part per type per blank, as run 1221's law predicts, but about
45 percent of the types get no copy in a generation, and the copies of type k follow the wait for part k+1, not the
count of k: **the pool has no per-type regulation** (neutral drift; a type that dies out ends the lineage);
(3) **the last cell must come from inside the sealed pair**: by the pose's symmetry the bud's last cell E sits with its
seed side on the parent's root and its third side faces the doorway, so after cell N-2 the last site opens only into
the pair (with as many E parts as other types: 2 of 4 complete, exactly the worlds with an E part inside); every kind
with facing pores has this. (4) Growth time goes as the square of the number of types; crowding, not distance, limits
the rate (a denser 24 x 24 world was slower).

**Exact next step.** The next `harden` run takes priority 6. The next `build` or `explore` run takes priority 2, now
with two more requirements from run 1420: the kind's last site must be reachable (from outside, or an E source inside)
and the pool's per-type drift should be weighed (fewer types, or a template copied when its own type is scarce). The
next `core-review` takes priority 5.

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
   the bud's last site opens only into the sealed pair (an E part must be inside, or the kind changes so the last
   site is reachable: e.g. two fronts from two seed bonds meeting mid-wall, which needs a core change), and the
   pool's per-type counts drift with nothing to restore them (weigh fewer types, e.g. the periodic ring).
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
6. **Speed and margins** (`harden`): `budpore-c` (6 of 8, need 6) and `imprint-hood` (3 of 4, need 3) sit at their
   margins; speed idea from run 2150 (a flat per-step grid by counting sort; outputs need re-checking). One `harden` per
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
world from a saved state (not `split`: it places its parts after loading); `TRI_PARAMS='{...}'` overrides parameters.

## Pitfalls learned
Read before designing a layout: docs/IDEAS.md, "Pitfalls learned (copy lineage)" (doorways, anchors, food sinks,
signals, rings, physics) and "Pitfalls from the casting lineage" (kits, pockets, doors, flaps).
