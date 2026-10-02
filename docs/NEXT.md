# Next instance: start here

State on 2026-10-02 (after autorun run 20261002-1751, review-intent). Read AGENTS.md first (rules of work), then this file.

**Current slice (autorun 20261002-1821, cleanup).** Goal: a lean starting point. NEXT.md down to the current state,
direction, next step, commands and pitfalls (handoff history moves to INNOVATIONS or stays in git); demos and structures
nothing checks or uses removed (`pocket`, `airlock`, `arms`, `birth`, the `split q` variant superseded by `budpore`),
with outputs of the remaining demos unchanged; stale docs fixed; autorun prompt friction fixed. Done when tests pass,
the checks pass as before and NEXT.md is under about 150 lines. No new capabilities, no core changes.

**Handoff status (autorun run 20261002-1751, review-intent).** Docs only, on branch `claude/autorun-20261002-1751`,
merged into `main`. No simulations running; tests 34 pass; checks not rerun (no code change). No current slice.
**Done this run (slice: direction check, no building; met):** findings and priorities below ("Direction"); ROADMAP
backlog reordered to match (organism on copies first, casting lineage frozen) with a parts table of the organism on
copies; IDEAS has the design lesson (spent walls cannot be templates). Autorun rotation unchanged (reason below).
**Exact next step:** the rotation's next run is `cleanup`; then `build` takes priority 1 below (M2 on `budpore`, as
run 1551 set it: mid-wall anchor in D, target the bud holds 2+ strands at the end in 3 of 4 worlds).

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
   `imprint 60m`, `imprint 150p`: marks present are `. * ~ @ & | ?` only). Once the organism on
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
1. **M2: the bud copies its genome after the split** (`budpore`, mid-wall anchor in D; as run 1551 set it). After the
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

**Handoff status (autorun run 20261002-1551, explore).** Everything committed on branch `claude/autorun-20261002-1551`
and merged into `main`. No simulations running. `node tri/test.js`: 34 tests pass; `node tri/check.js`: 34 of 34 pass
with the change (run as an experiment option, 2144 s), and the five anchor checks rerun on the final code give the same
lines (`imprint-pore budpore split-g split-o budgrow-g`, 1351 s; new partial check `budpore` 3 of 4). No current slice.
**Done this run (slice: an anchor catches a strand that is being copied; met):** core change, case and result in
RULES (Core changes, newest): an anchor side catches a strand end whose spare edge is unbonded, busy or not, face
docked or not; the strand moves with its partial copy as one body. `budpore` (300 blanks): the bud catches a copy and
splits with food left in 4 of 8 seeds (seeds 1-4: 3 of 4; before: 0 of 4); a variant keeping "end face free" gave 2
of 4. Cost: `imprint p` seed 2 (founder caught during its first copy, no back copied yet, its backs face the wall's
wedge: no fill ever; 7 of 8 seeds now). Test "anchor: catches a strand end while the strand is being copied".
Pictures `budpore_busy.png`, `anchor_busy_deadlock.png`. Also (user, 2026-10-02): AGENTS.md now asks every run to
send the user a picture now and then (file-send tool), e.g. of the current work or a surprising result.
**Exact next step:** the rotation's next run is `build`: the bud copies its genome after the split (M2) on `budpore`:
move D's anchor mid-wall (a hear chain `+` of up to 5 bonds from the anchor to the latch cell; the latch lets go while
it hears a trigger signal; check the anchor site with the pitfall "Anchors in the middle of a flat wall") so a caught
strand stands into the bud with backs exposed; target: the bud holds 2 or more strands at the end in 3 of 4 worlds
(seeds 1-4, 300 blanks, 200000 steps; `budpore` worlds take about 4 minutes each). Also worth a look: seeds 5 and 8
never split (seed 5: 180 of 270 copies went to walls). Build follow-ups of run 1351 below are still open. Probes used
this run (scratch, in `runs/`, not kept): `anclog.js` (log anchor captures, render the scene after), `anclog2.js`
(render the strand body zoomed at given steps), `fillprobe.js` / `backprobe.js` (copy types made, each docker's fill
need, each back's free site and its nearest triangle), `snaptest.js` (dry-run `_snap` of a blank into each back site);
all are preloads via `NODE_OPTIONS="-r ./runs/NAME.js"` with `ANC_AT` (step) and `ANC_OUT` (picture folder).

**Handoff status (autorun run 20261002-1351, build).** Everything committed on branch `claude/autorun-20261002-1351`
and merged into `main`. No simulations running. `node tri/test.js`: 33 tests pass; `node tri/check.js`: 34 of 34 pass in 2391 s (new `budgrow-g` 3 of 4;
`budgrow` now 4 of 4, see below).
No current slice.
**Done this run (slice: the grown bud catches a genome copy; met):** `node tri/demos.js budgrow k 400000 runs g`: the
bud ring grows on the parent's seed, carrying an anchor `Z@|` (new `grownBud` option `anchorGlue`: an inner side of an
early wall-front cell, mid-wall, farthest from the door sweeps) instead of a cap; the parent holds the founder `aaaa`
on `W|` and a stamp pocket casting its dockers `Ay.z` (as `split g`). Seeds 1-8: 6 split with a copy anchored in the
bud and both doors shut by 400000 steps, 5 by 300000 (check `budgrow-g`: seeds 1-4, 300000 steps, 3 of 4). No rule change. Details, numbers and the three design
points (seed letter clash, early-anchor supply race, trapped anchor parts): INNOVATIONS (newest). Shared change: the
parent's panel welds in `grownBud` use the weld letter `f` (frees 4 letters; default `budgrow` unchanged otherwise);
`budgrow` events log an early release ("early releases at") and follow the regrown bud instead of calling it a split,
and the report follows the bud the events track: `budgrow` world 1's "door open after the split" (run 1050's harden
follow-up 3) was the old report reading a second bud regrowing on the parent's freed seed (same events on `main`:
split at 202850, doors shut); `budgrow` is 4 of 4.
**Exact next step:** the rotation's next run is `explore`: the anchor core change candidate below (an anchor catches a
busy strand) is still open for `budpore`. Build follow-ups, in order: (1) food for the grown bud after the split, so
it copies its genome (M2 on the grown pair): copy blanks through a pore with spent `&` walls (as `imprint p`; the
genome then becomes `aAaA` seeded by `demos.seedCopyGenome`, as in `budpore`) keep the parts list shortest; the
alternative is `split o`'s own pocket and import door; (2) the
transport tail: seeds 3 and 8 stay open 170000-232000 steps with 8-9 idle copies in the parent (try fewer copies or
the anchor nearer the doorway's middle; measure on 8 seeds); (3) the second bud that starts on the parent's freed seed
after the split (world 4): measure whether it closes and catches a copy too (needs more kit parts). Regenerate: each
world about 10 minutes with pictures (`runs/bgK`); probes used: `runs/probe.js` (strand ends and what is bonded at
them, from a saved `.json.gz`) and `runs/zoom.js` (render a saved state around one unit type), scratch.

**Handoff status (autorun run 20261002-1050, harden).** Everything committed on branch `claude/autorun-20261002-1050`
and merged into `main`. No simulations running. `node tri/test.js`: 33 tests pass; `node tri/check.js`: 33 of 33 pass in 1713 s (grown reported partial; lid and grow now 4 worlds; imprint 200000 steps).
No current slice.
**Done this run (slice: merge the physics midpoint fix; met, with grown downgraded to partial):** a direct move longer
than a sub-step needs a clear midpoint, so no block passes a gap narrower than itself (core-review follow-up 1 below;
test "a block in a hole of a one-row wall never hops across it"). Each check that relied on the hop was traced with a
probe (scratch `runs/pinch.js`: wraps the midpoint check through a require hook, logs the moves it blocks, `PINCH_OLD=1`
lets them through as before; lone blocks that bind within 3 steps of a blocked hop mark sites reached only through a
sub-width gap) and pictures of the stalled worlds; INNOVATIONS (newest) has the numbers:
- **budgrow** 3 of 4 (was 1 of 4 with the fix): `grownBud` requires the bud's last site to have an open approach and
  leaves out the parent's outer corner cell beside it (sealed: its neighbours meet at a point); door search tries every
  clear pair. World 1 splits but a door stays open after the split (not looked at).
- **split-o** 4 of 4 (was 0 of 4): `budPair` keeps the import door's drop place 2 clear of the strand, its dock sites
  and the organelle, trying the next import door candidate when nothing fits (picture `import_trap.png`).
- **lid, grow**: 4 worlds, need 3 (their single seeds were noise under both rules; 8-seed sweeps).
- **imprint**: 200000 steps (3 of 8 worlds close both rings at 100000 under both rules; 5 of 8 at 200000 with the fix).
- **grown**: partial. Race cells (`structures.kitRace`) get 3x supply (pocket 4 of 4), membrane roots 6; the membrane
  closes in 1 of 4 worlds by 200000 steps (others 72-76 of 78, not diagnosed).
- Judgement recorded here for the maintainer: merging makes the RULES physics true ("nothing passes through a wall")
  at the cost of one capability claim (grown, a single-seed check that passed through hops). To undo: revert the
  physics.js midpoint lines (commit "Physics: reapply the midpoint fix ...").
**Exact next step:** the rotation's next run is `build` (the build line below waits on the anchor core change
candidate, for an `explore` run). Harden follow-ups, in order: (1) grown's membrane stall at 72-76 of 78: zoom on the
end state of `node tri/demos.js grown 3 200000 runs` (about 6 minutes) and find the missing sites (the door kit? the
rhombus pitfall below?); (2) imprint's 28/30 stall (Pitfalls: one-front rings); (3) done in run 1351 (a misreport, see its
handoff). Regenerate the probe: logic above (about 30 lines). 

**Handoff status (autorun run 20261002-0921, build).** Everything committed on branch `claude/autorun-20261002-0921`
and merged into `main`. No simulations running. `node tri/test.js`: 32 tests pass; `node tri/check.js`: 33 of 33 pass in 1363 s (3 new: `imprint-pore` 4 of 4, its controls `imprint-pore-c`, `imprint-pore-n`).
No current slice.
**Done this run (slice: feeding on copies through a pore; part 1 met, part 2 partial):**
- **(1) A cell fed through a pore** (new capability, 4 of 4 worlds; `node tri/demos.js imprint k 100000 runs 150p`): a
  ring whose every free side is a spent `&` (outer, inner, pore edges) with a 3-cell pore copies its anchored genome
  from copy blanks outside only: 5-6 strands inside, all 150 copies genome. Controls: no pore (`150pc`) 0 copies;
  plain walls (`150pn`) all 150 copies of wall cells. Checks `imprint-pore`, `imprint-pore-c`, `imprint-pore-n`. The
  core change candidate "bringing copy blanks into a cell" is not needed for feeding (its design (b) failed only with
  plain walls). The anchor must be mid-wall (a corner anchor lays the strand along the wall: no fill copies).
- **(2) The bud copies its genome after the split (M2): not yet.** New demo `budpore` (fewest parts so far: two rings
  joined by one latch bond beside a shared opening; D's anchor `Z@|*` releases the latch by its trigger side when it
  catches; no wall hears an open signal): splits in 2 of 4 worlds (150 blanks), both after the food was spent; no bud
  copied after the split. Diagnosed: a strand's seed is inactive while it is being copied, and with food around strands
  are almost always being copied (52-87 approaches to D's anchor, all busy, 0 capture attempts). Core change candidate
  below. Also learned (Pitfalls): an open-signal hold exposes every wall in range to copying (`split ... qp`, tried and
  removed: 98% of blanks lost to walls).
**Exact next step:** the rotation's next run is `harden`: the physics leak (core-review follow-up 1 below). For the
build line: an `explore` run takes the core change candidate "an anchor catches a strand that is being copied" (below);
then `budpore` with D's anchor moved mid-wall (a hear chain `+` of up to 5 bonds from the anchor to the latch cell; the
latch lets go while it hears a trigger signal) and enough blanks that food lasts past the split; target: the bud holds
2 or more strands after the split in 3 of 4 worlds. Regenerate: `node tri/demos.js budpore k 200000 runs 150` (about
5 minutes per world); probes used this run: `runs/anchdiag.js`, `runs/anchdiag2.js` (preloads via
`NODE_OPTIONS="-r ./runs/anchdiag2.js"`; scratch, not kept: their logic is described in the candidate below).

**Handoff status (autorun run 20261002-0721, core-review).** Everything committed on branch
`claude/autorun-20261002-0721` and merged into `main`. No simulations running. `node tri/test.js`: 32 tests pass;
`node tri/check.js`: 30 of 30 pass (run in parts on the final code: 6 + 22 + 2 checks, about 25 minutes in all). One
check recalibrated: `imprint-cell` (and its control) runs 60000 steps instead of 40000; with the release locality fix
copies let go one pass later and at 40000 steps only 2 of 4 worlds had reached 4 strands (main's same-pass read gave
5 / 2 / 5 / 6, the local read 4 / 4 / 3 / 2; at 60000: 4 / 4 / 4 / 4, control 2 strands, wall 42 of 60). No current slice.
**Done this run (slice: finish run 0335's core review; acceptance met):** run 0335 (never reported back) had left five
commits that broke 14 of 30 checks; they were reviewed (two `deep-reviewer` passes, every finding reproduced before
acting), fixed or split off, and merged with the rest:
- **Removed:** 8 unused options (`caps` with its state and two relayed signals, `pDissolve`, `triUndock`, `pFray`,
  `castComp`, `noDock`, `snap: false`: run 0335; `capture: 0` with `triTol`: this run) and the latch's open-signal hold
  (fired in none of 55 check worlds, measured with a coverage hook). **Merged:** the glue `K` is no longer a casting
  activator; the mark `%` is the only one (RULES, Core changes; glue letters are now all labels).
- **Locality fixes** (RULES, Locality audit, now a rule-by-rule table): copy release reads partners' fill exposure
  (run 0335) and a fill exposes itself from the pass it binds (this run: without it a docked triangle let go while a
  fill bound in the same pass was incomplete, which broke copying in 11 checks; regression test); fuel: the carrier
  spends itself (run 0335), the start pulse reaches the fuel triangle one pass later (pwE), and only the flap of a hinge
  on the fuel triangle spends its carriers (this run; regression test); anchor capture checks its whole path, measured
  along bonds.
- **Core inventory** in RULES with users measured per check and counts: 17 mark meanings, 5 relayed signals, 9 exposed
  values, 9 states, 4 options. RULES and code now agree on 11 points the audit found (kick sizes, hinge rates, `@`
  closures, copy sides on any side, pLoose scope, inert `@`, `&` closures, release at ends, fuel).
- **Physics leak kept on main, fix on a branch** (see the first item below).

**Exact next step (as of run 0721, still valid for harden):** a `harden` slice on the physics leak (item 1 below); the build line continues from run 0236's
handoff (below, "Build line").

### Core review follow-ups (run 20261002-0721), in order
1. **Done (run 20261002-1050, merged; see the handoff above).** Was: **Physics: capabilities rely on a leak.** A direct move (at most 1.0) is checked only at its end, so a block passes a
   gap narrower than itself (a block in a one-row wall's hole hops across the wall: 95 of 2000 kicks of 0.95). The fix
   (a direct move longer than a sub-step needs a clear midpoint; the same as `direct` 0.8) is on branch
   `claude/physics-pinch-midpoint` (commit "Physics: direct back to 1.0, ...", with the test "a block in a hole of a
   one-row wall never hops across it"). With it 6 checks fail: budgrow 1 of 4 (the bud ring never closes in 3 worlds),
   split-o 0 of 4 (no genome copy reaches D), grown (pocket 15/16), imprint 2 of 4, lid (4 casts, seed noise: seeds 1-4
   average the same), grow (seed noise: completes in 4 of 5 seeds). Commands: on that branch,
   `node tri/check.js budgrow split-o grown imprint` (about 9 minutes). Next: trace which sites in budgrow and split-o
   are reached only through a sub-width gap (they are "narrow kit sites", see Pitfalls), widen those layouts, then
   merge the fix. Until then membranes on main are not sealed against this hop.
2. **Fuel per swing (designed, not built).** A fuel triangle spends every charged carrier on its fuel sides when a
   flap starts (two carriers: both spent), and two flaps hinged on one fuel triangle can both start on one carrier
   (the start reads `fu` 2 before anything is spent). No current structure has either. Target design, all local: the
   flap requests (pw 1) and does not move; the fuel triangle grants one request per pass (the hinge side with the
   lowest index) and exposes which fuel side pays (fuSide); only the carrier on that side discharges; the flap moves
   once its hinge partner (or itself) exposes "paid". Also closes a hole with `pLoose` (a carrier that leaves in the
   same pass is never spent). Reproducers were in the run's scratch (`fuel.js`, `fuel2.js`): build them as tests.
3. **`#` has two meanings.** On a trigger side ("let the key go after reading") it is used only by the airlock and the
   gate's pulse option; the airlock does not work on rigid physics (ROADMAP, Known issues). Remove the trigger-side
   meaning together with the airlock, or rebuild the airlock; then `#` means only "pulse door".
4. **Lock signal, three uses** (keys deaf, latches held, pulse doors ignore their trigger): all three fire in checks
   (keys: split o, live, cell, import; latches: those and gate; pulse doors: budgrow). A merge would need non-pulse
   flaps to tell "my own latch is open" from "another door is open"; not found this run.
5. **Same-pass partner reads** (zip, gap, release, fn, cast) are allowed by an explicit convention (RULES, Locality
   audit); a strict version snapshots role and exposes an end bit, at one pass of lag per face. Decide only if a
   locality problem traces back to it.
6. Coverage hook for the next core review (marks per demo, rule events, why keys and latches were held):
   `COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r ./tri/coverage.js" node tri/check.js` (one JSON line per demo world).

### Build line (from run 20261002-0236)
**Handoff status of run 20261002-0236 (build).** Everything committed on branch `claude/autorun-20261002-0236`
and merged into `main`. No simulations running. `node tri/test.js`: 24 tests pass; `node tri/check.js`: 30 of 30 pass in 1285 s (2 new: `imprint-cell` 3 of 4, its control `imprint-cell-n`).
No current slice.
**Done this run (slice: the bud's genome cycle on copies; budget used, acceptance not met, a milestone met):**
- Slice as set: M1 `split k 60000 runs q`: a copy anchored in D and the pair split in 3 of 4 worlds; M2: the bud
  copies its genome after the split. **Result: M1 partial, 1 of 4** (world 4 splits at 38000, both doors shut); M2 not
  reached. Numbers and every variant tried: INNOVATIONS (newest).
- **Milestone met (new capability): genome on copies inside a sealed cell** (`imprint k 40000 runs 60m`): a complete
  cell copies its genome from copy blanks alone, 5 / 2 / 5 / 6 strands from 60 blanks (control with plain walls
  `60mn`: 2 / 2 / 3 / 3, the wall takes 34-42 of 60 copies). Key: plain free wall sides marked `&` are spent once the
  cell hears no open signal, and spent sides are never copied (existing core). Genome: faces `aAaA` (its own reverse
  complement) seeded by `demos.seedCopyGenome` (`w` prev / `z` next on faces, `W` on backs, `latGlue`). New checks
  `imprint-cell`, `imprint-cell-n`.
- What blocks `split q` (measured): (1) the blanks are one batch, spent in about 2000 steps; dockers come out
  unbalanced and a copy waiting for a missing docker type stays paired with its template for good, so P makes only 1-2
  copies; (2) a joined pair hears the open signal of D's anchor (it must, to stay joined), so walls within
  `openRange` are not spent and still take blanks; with P's anchor `W@|` (default) nearly all walls hear an open
  signal; with a plain `W|` (tried, removed) 60 of 134 wall cells are spent, P makes 2-4 strands and strands enter D in
  3 of 4 worlds, but D's anchor caught none in 150000 steps (not diagnosed: check whether their high end `z` is free
  and not busy when near the anchor); (3) a pore in P (blanks from outside) fails: the rings' outer walls take all.
**Next step as of run 0236 (taken by run 0921, see above):** a `build` slice on the bud that copies its genome after the split (M2), which needs no joined
phase: the bud is complete then, so its `&` walls are spent (as in `imprint m`). Prepare it like `imprint m` with an
anchored strand (or take `split g`, where a cast copy `AAAA` is anchored: give the bud `aAaA` instead) and copy
blanks that reach the bud only after the split. The open problem is how blanks get into a sealed bud (see the core
change candidate below); until then, blanks inside the bud's ring from the start must survive the joined phase, which
needs D's walls out of the open signal's reach (anchor near the doorway, short `openRange`). Alternatively diagnose (2)
above first: one batch with `W|` and a trace of the strands that enter D.

### Core change candidate (run 20261002-0921): an anchor catches a strand that is being copied
**Status (run 20261002-1551): done, built as the rule (RULES, Core changes); `budpore` 4 of 8 seeds split with food left.**
1. **Capability:** segregation on copies: a bud catches a genome copy while the parent copies from a steady blank
   supply. Measured (`budpore`, world 3, 60000 steps, a probe counting strand ends with seed `z` within `capture` of
   D's anchor site every 20 steps): 52-87 close approaches, every one while the strand was busy (busy 26-30: being
   copied or within 30 passes of a release), 0 capture attempts. With blanks everywhere, a blank touching a strand face
   becomes a docker beside it, and zip docks the high end (the seed end) first, so an end is idle only for moments.
   `split g` catches copies because its dockers come only from P's pocket (scarce); run 0236's `split q` (D's anchor
   caught none, undiagnosed) is most likely the same cause.
2. **Designs with the existing core that fail or cost:** fewer blanks (strands idle once food runs out; then the bud
   has none to copy its genome after the split; measured below); an anchor on the low end (busy covers the whole
   strand, range 30); keeping blanks out of D before the split (the junction feeds both; a second gap cuts a ring).
3. **Smallest change:** an anchor side `|` catches a strand end's seed also while the strand is busy (the strand and
   its partial copy are one body and move together; the copy still releases as usual). Reads: the end's spare-edge
   glue (fixed type), as now; removes one condition (busy) for anchors only. Alternative: a seed is active while its
   own face is free (not the whole strand's busy relay). For an explore run; not changed here.

### Core change candidate (run 20261002-0236): bringing copy blanks into a cell
**Status (run 20261002-0921): not needed for feeding.** A pore works once every free side of the cell is spent
(`imprint ... p`, 4 of 4 worlds); design (b) below failed only because the walls were plain.
1. **Capability:** feed a sealed cell (parent or bud) a steady supply of copy blanks, so contact copying of its genome
   (and later its parts) does not stop when one batch is spent; the BIG goal's "feeds it until it can live on its own".
2. **Designs with the existing core that fail:** (a) an import door: its key side catches by glue, but a copy blank
   binds only by its copy side (RULES, copy side), so no key catches it; (b) a pore: blanks outside are spent on the
   rings' outer walls (400 of 400, none got in); (c) a stamp pocket casting copy blanks from imported `xxx` (carried
   mark `'?`): possible, but it brings back the casting machinery copying was meant to replace, and each new blank
   starts touching the pocket, which it copies first.
3. **Locality of the smallest change found:** "a copy side with a glue (`u?`) is also caught by a trigger side by that
   glue (a key)": the key reads the free triangle's side glue, as every glue binding does; the blank changes only its
   own bonds. Alternative: copy sides bind only sides that carry a glue (inert sides are never templates), so inert
   walls are never copied; that changes `imprint` (ring cells are copied through inert faces) and needs a check.

## Where things stand
- Built and working in demos (details and pictures: docs/INNOVATIONS.md): typed chain copying (zip), casting, lid
  pocket, driven hinges, conveyor, gated ring, energy, factory, kits (any prepared structure grows from a seed),
  heritable pockets and the two-pocket cycle, ring membranes, import door, protocell (prepared and grown), budding of
  empty rings, encapsulation, heritable cells, cell kit with pore and organelle, birth (partial).
- **Fourth session (2026-10-01):**
  - **Stamp casting** (rule): marks after an apostrophe on an instruction side (`b.'@`) are carried: the product takes
    them, so pockets cast kit parts (`structures.stampInstr`). Demo `stamp`: five stamp pockets make a ring's parts
    from blanks and the ring grows from them (4 of 4 worlds). Stamp pockets grow from kits too (`grow 1 20000 runs 4s`).
  - **Bud, feed, split** (`structures.budPair`, `world.openBudDoors`, demo `split`): prepared parent and bud rings share a
    wall held by `&` pairs, with a doorway through both walls (panels prepared open, held by `&` doorstops, always
    triggered). The parent's stamp pocket feeds the bud; when the bud's growth front closes, all `&` let go, both doors
    shut and lock, the bud separates (cap content: 4 of 4; genome content: 4 of 4).
  - **Anchor `|`** (rule, physics exception): an anchor side catches a strand end's seed as it would a free triangle;
    the strand is placed flush as one body. The bud catches a genome copy; the parent keeps its founder by its own anchor.
  - **Physics fix**: bodies longer than half the world were folded by the minimum image (torn without losing bonds);
    offsets are now unwrapped along bonds.
- **Physics is rigid-part, move-or-stop**: bodies move as rigid pieces, nothing overlaps, deforms or squeezes; flaps
  stall when blocked; binding places parts exactly in free sites. A closing door stalls on anything in its sweep (a
  strand lying in the doorway jammed a panel once).

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/demos.js copy 1 10000 runs                # typed copying (zip)
node tri/demos.js lid 1 4000 runs                  # lid pocket casting
node tri/demos.js factory 1 30000 runs Aa          # lid pockets feed a replicator (none = control)
node tri/demos.js grow 1 16000 runs 12             # a lid pocket kit grows from a seed and casts
node tri/check.js                                  # capability checks: one PASS/FAIL line per working capability (~40 min)
node tri/demos.js ring 1 60000 runs 3              # ring membrane from a periodic kit, closes (7k-45k steps)
node tri/demos.js gate 1 10000 runs 12             # gated ring (swept 3-cell door)
node tri/demos.js import 1 20000 runs              # selective import (revolving door)
node tri/demos.js cell 2 40000 runs                # protocell: import + factory + copying inside a membrane
node tri/demos.js bud 3 50000 runs                 # budding: daughter rings detach when complete
node tri/demos.js wrap 2 100000 runs               # a chain grows a membrane around itself
node tri/demos.js cells 1 100000 runs 36           # heritable cells: copies wrap themselves
node tri/demos.js live 1 150000 runs 6x2           # a grown membrane with its own import door
node tri/demos.js grown 2 200000 runs              # chain grows membrane + door and a casting pocket (slow)
node tri/demos.js heir 1 45000 runs                # chains grow pockets from their end seed; copies regrow them
node tri/demos.js cycle 1 200000 runs              # heritable factory cycle (two kits; see INNOVATIONS)
node tri/demos.js stamp 1 60000 runs               # stamp pockets make a ring's parts from blanks; the ring grows
node tri/demos.js grow 1 20000 runs 4s             # a stamp pocket grows from its kit and casts A@-b@
node tri/demos.js split 1 30000 runs               # bud fed through a doorway grows a cap, then splits off sealed
node tri/demos.js split 1 60000 runs g             # the bud catches a genome copy (anchor), then splits off
node tri/demos.js split 1 450000 runs o            # + the bud grows its own pocket, splits, imports, copies its genome
node tri/demos.js budgrow 1 250000 runs            # the bud ring grows on the parent's seed, doorway opens once closed, cap fed, splits
node tri/demos.js budgrow 1 400000 runs g          # the grown bud's anchor catches a copy of the parent's genome, then it splits
node tri/demos.js imprint 1 200000 runs            # contact copying: a ring closes and a second grows from copy blanks only (c: control)
node tri/demos.js imprint 1 30000 runs g           # a strand copied from copies of its own triangles (gc: control)
node tri/demos.js imprint 1 60000 runs 60m         # a sealed cell (spent & walls) copies its genome from copy blanks (60mn: control)
node tri/demos.js split 1 150000 runs q            # the bud pair on copies (partial: 1 of 4 worlds splits)
node tri/demos.js imprint 1 100000 runs 150p      # a cell fed through a pore: genome copied from blanks outside (150pc, 150pn: controls)
node tri/demos.js budpore 1 200000 runs 300        # bud pair on copies: the bud catches a busy copy, splits with food left (partial: 4 of 8)
```
Older: `pocket`, `conveyor`, `gate`, `airlock`, `energy`, `arms`. Pictures go to `runs/NAME.png` with saved states.
Long runs: `TRI_RESUME=runs/x/NAME_tNNN.json.gz node tri/demos.js NAME seed steps outdir` continues a demo world from a
saved state (same seed and extra; event counters restart). `TRI_PARAMS='{...}'` overrides parameters.

## Do next (toward the BIG goal)
**Superseded by "Direction" above (run 20261002-1751): its priorities come first; the list below is the older
casting-lineage record.**
The BIG goal's sentence now has a prepared, working skeleton: the parent **feeds** its bud through a doorway, the bud
**catches a genome copy** and grows its content, and it **splits off** sealed (demo `split`). What is still prepared
or missing, in order:
1. ~~**A bud that lives alone**~~ — works prepared, 4 of 4 worlds (`split 1 200000 runs o`, autorun 20261001-2006):
   the bud grows its own stamp pocket (casting `aU.w` from blanks `uuu`, also its fills) from kit parts held as food in
   the parent, catches a copy, splits off, imports `uuu` through its own door and makes a whole copy of its genome.
2. ~~**Grow the bud pair instead of preparing it.**~~ — works for a cap, 4 of 4 worlds (`budgrow`, autorun
   20261001-2235): the bud ring grows on the parent's seed; pulse doors held by the lock signal of its open wall sites
   open once it is closed; its cap is fed; it splits sealed. Next: genome anchor and pocket in the grown bud (see the
   handoff above); later the parent's door and seed as grown parts of the bud itself (the bud as the next parent).
3. ~~**Programmable synthesis**~~ — decided and built in isolation (autorun 20261002-0136): contact copying, copy
   side `?` (IDEAS, decision; INNOVATIONS). Next: the organism on copies (ROADMAP backlog 0). Original note: (see IDEAS): one stamp pocket makes one part type; a cell kit has
   ~60. Options: part templating (a copier pocket: simple, information in parts) or translation (a reading frame on a
   strand: hard). **User (2026-10-01): an explore run decides**, comparing part templating, translation and
   kit-free growth (no new rule) through the core-change gate (AGENTS.md); prefer the least core growth, at most one
   new rule; record the decision in IDEAS and here before building.
4. **Birth (partial, older route):** `cellKit` + demo `birth` (a copy leaves through a pore and grows its own cell from
   kit parts in the world; 1 of 4 worlds started an offspring cell at ~2.6M steps). See INNOVATIONS.
5. Speed: physics is ~85% of step time, lone blocks dominate (`_single`); a big world is ~500 steps/s.

## Pitfalls learned
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
- **Kit races** (`structures.kitRace`): a cell whose every side may face a non-descendant (or a slot) is lost for good
  if that neighbour arrives first; kit depth does not order arrival. The lid pocket's cell beside the slot is a leaf of
  every kit tree. Raise the supply of race cells (3x completed the grown pocket in 4 of 4 worlds).
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
- **A latch-cut closure re-closes**: two sides that stay flush close again next step (no `&` on a closure is possible:
  closures never form on `&` sides). Cut what must stay apart with `&` on a bond formed by binding a free part.
- **A grown flap hangs by its hinge only**: any second bond of the panel to the ring locks it. Its far end must move
  away from its neighbour when it swings (down-triangle far end, up-triangle neighbour for a panel swinging up).
- **lockBusy and other relays are Int8**: lockRange above 127 overflows (no lock at all). Use at most 120.
- **Physics leaks found 2026-10-02** (fixed): check new closed structures for escapes with a trace (cast products and
  released parts start touching their neighbours).
- **Food in a kit site.** A blank whose glue complements casters' close-only instruction sides closes into an empty
  caster site of a growing pocket (two `U.` sides facing it) and blocks it for good. Keep a pocket's target blanks away
  until the pocket is complete (the bud gets `uuu` only through its own door, after the split).
- **Narrow kit sites.** A kit cell with a side on a wall can be entered only through one side once its parent is
  there; it stalled 2 of 4 bud pockets. `budPair` avoids such placements; check new layouts for them (the risk count
  in `structures.kit` does not see walls).
- **Supply races decide reliability.** The founder's first dock races the membrane root (cells); leftover kit parts
  trapped in a closed ring jam its door (live). Supply ratios are design parameters: check them on 4 worlds.
- **TRI_RESUME and `split`**: the demo places its prepared parts and food after `createWorld` has loaded the saved
  state, so a resumed `split` world is scrambled (and the genome variant may throw "prepared parts overlap"). Rerun from
  t=0 instead (a 200000-step world takes about 2 minutes).
- **Bodies longer than half the world** were folded by the torus minimum image (fixed 2026-10-01, `_unwrap`). Keep
  world size larger than any body anyway (pictures and inside tests use minimum images).
- **A ring with two open doors falls apart** (two gaps make two rigid pieces). Interlock the doors of one ring: an
  unbonded latch side emits the lock signal and other latches hold while they hear it (raise `lockRange` for big
  rings). Seen in the bud: its import door opened before its closing door had shut.
- **A closing door stalls on anything in its sweep**; a strand lying across a doorway can jam it for good.
- **Apostrophes in test names**: `'` inside a single-quoted test name breaks the file (twice this session).
- **Locality (user, 2026-10-01).** Before writing a rule, ask: does this triangle know this through its own bonds,
  a direct partner's exposed value, or a relayed signal? "Same structure", "smaller body", "partner's partner" are
  not local (all three were written once and undone). Physics may treat a structure as one body; chemistry may not.
  See AGENTS.md (Locality) and RULES.md (Locality audit).
- **Inside or outside a hex ring: use `hexr`, not Euclidean distance.** Near a hexagon's corners a side on the inner
  boundary can lie farther from the centre than (R-0.5)H; for R >= 6 twelve sides were misjudged, so a door kit's last
  site faced inward and the ring could only be closed by triangles already trapped inside (fixed 2026-10-01).
- **Order of parts on one genome.** Pocket and membrane grow at once from the chain's two seeds; the open signal keeps
  the pocket idle and the membrane attached until both are complete. Tried and reverted: "a seed binds only while the
  strand hears no open signal" (one part at a time): a finished pocket then went live before any membrane, copying
  started outside, and a strand being copied exposes no seed, so the membrane never began. Remaining race: if the
  membrane closes before the pocket's last cell arrives, that site is inside and the cell is stuck (seen in 2 of 4
  worlds with a poor pocket supply).
- **Trailing comments in one-line code.** Twice a `// comment` appended inside a long line swallowed the code after it
  (no error, wrong behaviour). Put comments on their own line.
- **Rigid machines.** Every swing must be clear: sweep a design before building it (`structures.ring` shows how). A
  flap whose catch side stays flush with its cargo re-closes on it at once (hence the hand-off and at-rest rules).
- **Catchers in kits.** A target caught before a neighbouring caster arrives closes that caster's cell off; let only
  the caster whose cell borders the frame catch (lid pocket catcher 'B').
- **Enclosed holes.** A site whose three neighbours are all present before it fills can never be filled (no free
  triangle can reach it: rigid parts never pass through). This caused the copy deadlock (fixed by zip) and the grown pocket
  stall (fixed by `pLoose`). Check every new design for sites that can become enclosed.
- A flap turning about a corner sweeps its far corner 13% past the chord: a carried target jams against a fixed
  neighbour across its far edge. Close lids onto a target instead of carrying the target (lid pocket).
- Kits: every functional pair (activator `%` pairs, instruction holders) must be a close-only closure or a unique activator glue (`%`);
  otherwise free kit cells, products or dockers stick at the wrong place. Free parts must bind only by `@`.
- Dockers used as fills expose their side glues on hidden backs: use `latGlue` with dedicated fill types when dockers
  carry seeds.
- Shared edges of a prepared structure must have opposite directions when you write glue onto them.
- A latch must stay released while its door opens; any doorway makes a 2D ring a C (use airlocks).
