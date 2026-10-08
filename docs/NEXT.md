# Next instance: start here

State on 2026-10-08 (after autorun run 20261008-1351, build). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (the pair's done priorities 1-24 and 28,
each with its run and checks), the autorun log, and git: each run's handoff is this file at its merge (`git log -p
docs/NEXT.md`); the review-intent Direction of run 0751 in full at `a2f3914`, the pair Direction of run 1850 at `20e9a88`.

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): a
kind where every cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use
them. The 47-type organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (run 1351, INNOVATIONS): under copy error the commons loop runs by itself. A head class born on a
site of the shared second cell (a commons) replaces the head nursery, its cheats always come first (no I nursery), and
a common site is a target: whatever binds it (the class, an in-place chain, a binder) makes second cells with another
letter win, so the site letter turns over, and commons classes of the new letters arise by one root error. Turnover,
not yet growth in complexity: every class has one shape.

**Handoff status (autorun run 20261008-1351, build): priority 28 done.** No rule or physics change. New check `race`
(the commons world under copy error at 0.005, 240k, about 9 minutes per world; 6 of 8 in the batch, need 3 of 4); demo
option `PATN=n` (`types:` lists n types; default 10, outputs unchanged); `tri/census.js` (heads by root letter, second
cells by site letter, from `types:` lines). Records: INNOVATIONS run 1351, IDEAS "A common site is a target", ROADMAP
(row, backlog A 28), pictures `race.png`, `race-long.png`. Evidence: tests 44 of 44; `node tri/check.js race copy-error`
from a worktree of the branch: `race` 3 of 4 (566 s), `copy-error` 4 of 4 (`types:` unchanged by default); the batches (`runs/` is not kept: rebuild them as `tri/batch.js` files
from INNOVATIONS' Commands: seeds 1-4 at 0.005, at 0.01, and the control; seeds 5-8 at 0.005; seeds 2, 3, 5, 6 at 0.005
to 480k) are read with `node tri/census.js`. The full
suite was not rerun: no rule, physics or shared structure changed, and `PATN` unset leaves every output as before.
Nothing is running.

**Next step (rotation 79, explore): priority 29, the plug guard** (below), the line's one observed collapse under copy
error. Or, if the explore run prefers a new idea, priority 31's theory.

## Current slice (autorun run 20261008-1522, explore): priority 29, the plug guard

Goal: settle which guard against a plug on the head's own side the core allows, and test the answer in isolation.
Done when: the derivation is written (IDEAS), each guard it leaves is tested without mutation in 4 worlds (works in 3
of 4 or not), and the core candidate, if any, is entered in RULES (Open candidates) with its case. Stop there; no
core change unless the derivation shows a small, general one.

**Derivation (before the runs).** A part bound to a side leaves it only by (1) an `&` release (the bond of an `&` side
is cut once that side's triangle hears no open signal, and the side is spent) or (2) lysis: by contact with a `!` side
(whatever the bond) or relayed from a partner across a bond that is not a joint. A child and a plug differ at the bond
only by `&` (child root `Z@&`, plug `Z@`). (1) The plug has none; an `&` on the head's own side fires when the head is
complete (its front filled), not when a child is done (the head cannot hear its child across the joint), and the spent
side never raises again: at most one child per head. (2) A `!` on the own side lyses the child too (contact ignores the
joint); relay from the head spares the child and takes the plug, but lyses the head. So **no head design guards its own
side in the current core**: a plug leaves only when its individual dies. What is left: (a) upstream, a plug that
kills its own copies: the one-error plug from the second cell (`C@-z!` with attach letter Z: `-z!Z@`) makes half its
copies on its own `z!` tip, where they bind and are lysed; a plug needs the tip gone first (`--Z@`, `T!Z@i!`); (b) a
refuge: a commons class (`I@&c@|z`, born on second cells' `i` sites) does not use its own `z` side, so a plug of `z`
cannot touch its births; (c) a core change (RULES, Open candidates).
Predictions (written while batch p29a ran, before reading it): P1 `--Z@` entered as 20 at 20k into the head nursery
(no mutation) sinks it (no Z head in a body) in 3 of 4 by 80k; P2 `-z!Z@` the same way is lost in 3 of 4 and the
nursery holds.
Batch p29a (`runs/p29a.json`, 80k, seeds 1-4 each): **P1 wrong**: `--Z@` lost in 4 of 4 (at most 22 attached, gone by
45-75k), the nursery untouched (heads 488-506). P2 right (never more than none in a census). Reading: a free plug
copy has at most 100 steps (decay) to find a free own side, nursery heads' own sides are mostly holding a child, and
every second cell carries a `z!` site, which binds a free `Z@` part and lyses it. **The second cell's `z!` is a trap**
for every free part with the root's attach letter: pool heads, the one-error plug's copies and any plug. So (a') the
guard the core already gives is the trap on the shared part; it is neutral while no plug is around, so it can drift
away, and then a plug spreads. Batch p29b (`runs/p29b.json`, running): P3 with second cells `C@-q!` (a lysing site of
an unused letter: no trap), `--Z@` entered as above sinks the nursery in 3 of 4 by 80k; its control without the plug
holds in 4 of 4. P4 the race control seed 4 at 0.01 (the one collapse, run 1351), rerun to 185k: before the collapse
most second cells carry no `z!` side.
Batch p29b read: **P3 right** (`C@-q!` second cells: 20 plugs sank the nursery in 4 of 4 by 35-40k; control 4 of 4
holds at 421-430). **P4 wrong, and why matters**: at 160k 95% of second cells carried `z!` (`C@i!z!` 347); the plug
`T!Z@i!` (`C@i!T!` with attach letter Z, one error) rose 2, 8, 37, 141 at 160-175k while trap carriers fell 347 to 59
and trapless `C@i!T!` and `C@i!J!` rose 29 to 154 of 247; empty at 185k. **The trap dies with its catch**: a plug
caught on `z!` is lysed by contact, and its lysis comes back across the bond (no joint) into the second cell and its
head. A trap that catches a part without `&` kills its own individual: an altruist, lost in an epidemic. Core case
(w) in RULES (a lysis side passes no lysis back), built as `lysOneWay` (default 0), test "lysOneWay"; resumed worlds
now take `TRI_PARAMS` and `TRI_RESEED=k`; demo option `PA3N`.
Running: p29c (`runs/p29c.json`, 60k, seeds 1-4 each; trap founder `C@-z!` at 0, trapless founder `C@-q!` at 100;
200 plugs `--Z@` at 20k): P5 under the current core the trap share at 30-60k falls below the plug-free control's
(`mixc`) in 3 of 4 seeds; P6 with `lysOneWay` it rises above it in 3 of 4, and the individuals' dip at 20-25k is
smaller than without. Then p29d: the 165k state of the collapse world (`runs/ctl4s/pair_end.json.gz`, rerun of race
control seed 4 at 0.01) resumed for 30k with `TRI_RESEED` 1-4: P7 current core collapses (no head in a body by
195k) in 3 of 4; P8 `lysOneWay` holds in 3 of 4 with trap carriers above half of second cells.

## Priorities

Done 1-24 and 28: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (review-intent 82 may reorder):
29. [79 explore] **The plug guard** (was 27). A part with the root letter as its attach side binds a nursery head's own
    side and stops in-place birth: `--D@` killed run 0651's D nursery, `T!Z@i!` (a second cell two errors away, attach
    letter Z) collapsed a race control world at 180k (run 1351, 1 of 16). Under copy error it is the one parasite that
    sinks the world, because it binds a side the head needs (IDEAS run 1351: a side nobody needs escapes by turnover).
    Guard designs: a release on the head's own side once a non-head binds (no such rule: a core candidate), a lysing
    own side (kills its own children), a second own side. Theory first: which guard needs no new rule.
30. [80 build] **The loop at length.** Does it run indefinitely? Worlds at 0.005 (the `race` world) to 1.2M, seeds 5
    and 6 plus two more (about 45 minutes each): count site turns (run 1351: about one per 110k steps in the 480k
    worlds), commons classes by mutation (4 in 4.8M world-steps), nursery losses and returns, collapses. A check if
    the loop holds through several turns in 3 of 4.
31. [later] **Shape inside the loop.** Every class is one shape (a head and a second cell), so the loop is turnover of
    letters. Complexity needs variants that differ in what they do and are selected inside it: a head with a second
    site of its own (a commons class that is also a commons), or a third cell that covers the site (length as
    defence, priority 25). Theory first: which one-error variant changes shape and pays inside the loop.
25. [later] **Length without sinks.** Chains of second cells arise by one mutation (an attach letter that complements a
    seed site) and preceded both collapses in run 0121 and all four in run 0551's control; a lysing site at the chain's
    tip stops them. Length as a function needs a chain that lets go (an `&` at its end) or a third cell that covers an
    open site (length as defence). Designed, not demonstrated.
26. [later] Killing as a frequency-dependent enemy: the root-lysing seed site `z!` is the first killer to arise; it spread
    as a cheat, not as a predator, and guards against chains (run 0551).
Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage). Not taken from run 1750's
list: (b) diets of different length and (c) more diets than blanks (run 1150's R* rule again).

Rotation (autorun `projects/plywood/rotation.txt`, unchanged): 78 build (done), 79 explore, 80 build, 81 explore, 82
review-intent.

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((t), (u), (s), (r)'s open part, (j), (l);
settled there: (f), (k) and the done ones).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: same-pass partner reads (zip, gap, release, fn) are allowed by convention (RULES, Locality audit);
  change only if a locality problem traces back to them.
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time: 71 minutes at run 0250, about 100 with the nine checks added since, 160 in run 0651's container (hence
  `--part`); the frozen lineage's two checks (one world each, 15-17 minutes) are about 12% of the suite's CPU; the rest
  is pair worlds, whose time is lone blocks' physics (about 80%; a destination-only neighbour gather was 5% slower).
- Copy error as the standard world's variation (cleanup run 1222 looked, did not do it): `PAM` is on in 21 checks, 5
  of them the front-only mutagen (`PAMF=1`: `diets`, `diets-ns`, `diets-catcher(-c)`, `ladder`), which copy error
  cannot replace (it errs on any side of a copy, not on free fronts). Retiring `PAM` changes the standard world
  (`PAW=1`) and every check built on it: a `build` decision for the setup, after review-intent 82, not a cleanup.
- Bigger cells and letter reuse (user, 2026-10-03; IDEAS): R 5 is the largest all-unique kind (46 letters); if a
  slice needs a larger cell, reuse letters inside sealed compartments.

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/check.js [id ...] > runs/check.txt         # capability checks: one PASS/FAIL line each, printed as each finishes
                                                   # (4 processes; 71-160 minutes by container: as two background jobs,
                                                   # --part 1/2 then --part 2/2, from a worktree if you edit code meanwhile);
                                                   # CHECK_SAVE=dir keeps each world's output
node tri/check.js --cmd [id ...]                   # each check's demo command (env, seeds, steps): the world of every
                                                   # capability; change the steps (third argument) to run it longer
node tri/census.js runs/x.txt [--every k]         # heads by root letter, second cells by site letter, from 'types:' lines
                                                   # (copy error on; PATN=30 in the world lists 30 types)
node tri/batch.js runs/b.json                      # a batch of demo worlds from a JSON file, 4 at a time, an output file and
                                                   # picture directory per world (format in the file's head comment)
PAW=1 node tri/demos.js pair 1 120000 runs/x       # THE STANDARD WORLD (check world): the diet kind among stocks C E G,
                                                   # openRange 9, deaths return blanks, decay, the whole-body hazard h 0.07,
                                                   # the general mutagen 0.01; any option set overrides (demos.js, comments
                                                   # above the pair demo, list every option)
PAW=1 PAF= PAM=0 TRI_PARAMS='{"pErr":0.01}' PA2='Z@&c@|z C@-z!' node tri/demos.js pair 1 240000 runs/x
                                                   # the head nursery under copy error (check copy-error at 60k); the
                                                   # commons and its turn: --cmd commons commons-turn
PAW=1 PAB=3000 PAS=87 PAF='C@-|z|:450 E@-|z|:450 G@-|z|:450' node tri/demos.js pair 1 240000 runs/x
                                                   # the standard world at 3x (about 50 minutes); 'web:' lines
NODE_OPTIONS='-r ./tri/copyrate.js' ...            # adds a 'copyrate:' line (copies per template class from CR_T0, 25000)
COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r ./tri/coverage.js" node tri/check.js   # coverage: marks present, rule
                                                   # events, one JSON line per demo world
node tri/demos.js closure                          # the designed organism kind (budKit) drawn, no physics
node tri/demos.js imprint 1 100000 runs 150ph      # a hooded pore (150pw: a 7-cell pore); the checked ones: --cmd imprint-pore
```
Pictures go to `runs/NAME.png` with saved states; `TRI_NOPIC=1` turns them off. `TRI_RESUME=runs/x/NAME_tNNN.json.gz`
continues a demo world from a saved state; `TRI_PARAMS='{...}'` overrides parameters. To show a change leaves outputs
the same: `CHECK_SAVE=$PWD/runs/a node tri/check.js` in a worktree of main and `CHECK_SAVE=$PWD/runs/b ...` in the
branch, then `diff -r`. Commands of earlier setups are in their INNOVATIONS entries (options since removed: in git at
the commit INNOVATIONS' header names).

## Pitfalls learned
Read before designing a layout: docs/IDEAS.md, "Pitfalls learned (copy lineage)" (doorways, anchors, food sinks,
signals, rings, physics) and "Pitfalls from the casting lineage" (kits, pockets, doors, flaps; that lineage is
removed, its lessons stay).
