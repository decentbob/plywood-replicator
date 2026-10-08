# Next instance: start here

State on 2026-10-08 (after autorun run 20261008-1522, explore). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (the pair's done priorities 1-24, 28
and 29, each with its run and checks), the autorun log, and git: each run's handoff is this file at its merge (`git log -p
docs/NEXT.md`); the review-intent Direction of run 0751 in full at `a2f3914`, the pair Direction of run 1850 at `20e9a88`.

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): a
kind where every cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use
them. The 47-type organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (runs 1351, 1522, INNOVATIONS): under copy error the commons loop runs by itself (commons
classes and the second cell's site letter chase each other; turnover, not yet growth in complexity: every class has
one shape). Its one sink is a plug on the heads' own sides. No head can guard its own side; the guard is a trap on the
shared part (`z!` on the second cell), and under the current core the trap dies with each plug it lyses, so it is
selected away in an epidemic. One-way lysis (option `lysOneWay`, candidate (w)) keeps it.

**Handoff status (autorun run 20261008-1522, explore): priority 29 done.** One core candidate built as an option:
`lysOneWay` (default 0; RULES Core changes (w), with its case; every default output unchanged: a 15k copy-error world
byte for byte main's). New checks `trap`, `trap-c`, `trap-oneway`, `trap-oneway-c` (`node tri/check.js trap trap-c trap-oneway
trap-oneway-c`: 4 of 4 checks pass, each 4 of 4 worlds, 591 s); test "lysOneWay" (tests 45 of 45); demo option `PA3N`; a resumed world takes `TRI_PARAMS` and
`TRI_RESEED=k`. Records: INNOVATIONS run 1522, IDEAS "A trap on the shared part", RULES (w) and (v), ROADMAP (row,
backlog A 29), picture `plug-trap.png`. The batches (`runs/` is not kept) are rebuilt from INNOVATIONS run 1522's
entries and commands; read them with the trap reader in the checks (`trap*`: heads, second cells with `z!`, plugs from
`types:` lines). The full suite was not rerun: the option is off by default, and nothing else in the rules, physics or a
shared structure changed. Nothing is running.

**Current slice (autorun run 20261008-1650, build): priority 30, the loop at length.** Goal: does the commons loop
run indefinitely, and does one-way lysis change that? Worlds: the `race` world (`pErr` 0.005, I entry at 20k) to 1.2M,
seeds 5-8, current core (`cur`) and `lysOneWay` 1 (`ow`): `node tri/batch.js runs/p30.json runs/p30` (the file: `race`'s
env from `node tri/check.js --cmd race`, steps 1200000, jobs `cur` and `ow` seeds 5-8; about 45-60 minutes per world, 2
waves). Done when: the 8 worlds are read (site turns, commons classes, collapses and their cause, trap share) and, if
the loop holds through 3 or more turns in 3 of 4 of an arm, a check exists. Stop: no new mechanism this slice; if the
loop fails, record how.
Predictions (written while the batch started, before any census was read; run 1351: 16 turns in 1.92M world-steps,
4 commons classes in 4.8M, 1 plug collapse in 16 worlds of 240k):
- P1 current core: 3 of 4 alive at 1.2M; 0-2 collapses, each by a plug on the heads' own sides, none by chains.
- P2 each living world turns its majority site letter 5 or more times (expected about 10); median within 2x of 10.
- P3 a commons class (a root other than Z on 20% or more of heads at a census) in 2 or more of 4 worlds per arm.
- P4 Z holds most heads at 1.2M in 3 of 4 living worlds per arm.
- P5 `lysOneWay`: 4 of 4 alive; trap (`z!` on second cells) on more than half of second cells at 1.2M in 3 of 4.
- P6 turn rate the same in both arms within 2x (one-way lysis acts on plugs and chains, not on site letters).
- P7 no second trap side (`z!` twice) on 10% of second cells in any world (no selection for it without an epidemic).
- P8 every class stays one shape (a head and a second cell): turnover, no growth in complexity.

Read so far (wave 1, current core, seeds 5-8 to 1.2M, 41 minutes per world): alive 4 of 4 (P1 right, no collapse);
site turns 5, 3, 0, 3 (P2 wrong: the loop slows and stops); commons episodes by mutation 1, 3, 0, 0 after the I entry.
**Unpredicted: the second cell's site evolves the close-only mark** (`C@i.z!`, `C@n.z!`, `C@r.z!`: binds no free
part, still copied): sealed on more than half of second cells from 50k, 165k, 380k, 870k (seeds 7, 6, 8, 5), 88-100%
at 1.2M in 4 of 4. After the seal no commons episode and almost no turn (2 turns in 3.3M sealed world-steps against 9
in 1.47M unsealed): the sealed site is no target. Theory: a letter change is about 50x likelier than the mark toggle
(52 of 59 changes of a side against 1), so letters turn first; each letter escape is temporary, the seal is permanent.
Next in this slice: wave 2 (`ow`), then no-mutation tests (`seal`: I heads into sealed sites are lost; `seal-sel`:
sealed and open second cells with I heads entered, the seal spreads; `seal-sel-c` without I), more seeds for the seal
time (seeds 1-4, 9-12 to 480k), checks.

**After this slice:** rotation 83 (core-review): adopt `lysOneWay` as the rule or remove it (adopting changes outputs:
full suite).

## Priorities

Done 1-24, 28 and 29: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (review-intent 82 may reorder):
30. [80 build] **The loop at length.** Does it run indefinitely? Worlds at 0.005 (the `race` world) to 1.2M, seeds 5
    and 6 plus two more (about 45 minutes each): count site turns (run 1351: about one per 110k steps in the 480k
    worlds), commons classes by mutation (4 in 4.8M world-steps), nursery losses and returns, collapses. A check if
    the loop holds through several turns in 3 of 4. Second arm (run 1522): the same worlds with `lysOneWay` 1 (add it
    to `TRI_PARAMS`): plug collapses (current core: 1 in 16 by 240k) and the trap's share over time (`z!` on second
    cells: the `trap*` checks' reader); does a second trap side arise and spread during a plug epidemic?
32. [83 core-review] **Adopt or remove `lysOneWay`** (RULES (w)). For: the trap survives its catch, the scavenger's
    `&` trick becomes unnecessary, one condition. Against: it changes outputs wherever a `!` side holds a part without
    `&`. Run the suite with it on as default before deciding; the lysis demo's cutters and the scavenger test change.
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

Rotation (autorun `projects/plywood/rotation.txt`, unchanged): 79 explore (done), 80 build, 81 explore, 82
review-intent, 83 core-review.

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((w) built as `lysOneWay`, (v), (t), (u), (s), (r)'s open part, (j), (l);
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
