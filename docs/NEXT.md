# Next instance: start here

State on 2026-10-08 (after autorun run 20261008-1650, build). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (the pair's done priorities 1-24
and 28-30, each with its run and checks), the autorun log, and git: each run's handoff is this file at its merge (`git
log -p docs/NEXT.md`); the review-intent Direction of run 0751 in full at `a2f3914`, the pair Direction of run 1850 at
`20e9a88`.

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): a
kind where every cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use
them. The 47-type organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (runs 1351, 1522, 1650, INNOVATIONS): under copy error the commons loop (commons classes and the
second cell's site letter chasing each other) runs for a while and then **stops: the site seals itself** (the
close-only mark: still copied, binds no free part, so no class is born there and nothing parasitizes it). The pair's
two kinds of site split cleanly: the heads' own side is needed, and the head cannot guard it against its parasite, the
plug (run 1522); the shared site is not needed and ends its parasites for good by sealing (run 1650). Neither keeps
evolving. One-way lysis (`lysOneWay`, candidate (w)) kept the trap in a forced plug epidemic but showed no gain at
length (3 of 4 alive against the current core's 4 of 4).

**Current slice (autorun run 20261008-1951, explore; priority 33; in progress).** Goal: settle by theory which site
the core allows that its carrier needs and can still turn, then test the predictions. Done when the derivation is in
IDEAS and each prediction below is measured (3 of 4 worlds where it is a capability). Stop at the measurements; no core
change unless the derivation calls for one.
Derivation (before the batches). Recognition is one glue pair on two sides; copy error changes one side per copy.
(1) A lock its carrier needs is **frozen**: if its key is made by the carrier's own line (the nursery: root `Z@&` and own
side `z` on one type) a one-error change of either breaks in-place birth; if the key comes from the pool and is needed by
its own carrier too (front `c@` and attach `C@`), an unbound key is never copied, so no standing variation waits on the
other letter. Either way the change needs two errors at once (about pErr^2/(36*53) per copy). (2) A lock turns by
single errors only where one side drifts, i.e. where its carrier does not need it: the second cell's site. (3) So
"needed by its carrier and turnable" is impossible in the pair; the nearest thing is a **public lock**: a site needed by
a class but not by the part that carries it (the seed site of a pool-raised class on the second cell, the stockless
world B of run 0551/0651). There cheats (other letters, the seal) raise nobody, so they spread only while hosts' sites
are occupied: self-limiting (run 0551's cheats held at 0.9-3 per host); other-letter cheats are stepping stones, so root
letters keep turning (run 0651: B turned over in 2 of 4). (4) The loop's exit is **privatization**: one glue error on the
pool head's copy side (`-` to the root's complement) makes a nursery, which wins (run 0551: 410-440 individuals against
300-370) and makes the public lock unneeded; then it seals or turns freely and the loop stops (the race world, run 1650).
Predictions: E2 (B world, `pErr` 0.01, seeds 1-4, 480k): root-letter turns only before a nursery holds most heads; after
it, no turn, and the sealed or trap share of second cells rises; while no nursery, the sealed share stays below half.
E1 (B world with the anchorless site `C@-z`, no mutation, 10 sealed `C@-z.` pairs entered at 20k, 100k): the sealed
share levels off below 80% and the world lives (4 of 4); control: 10 more of the resident pair (drift). E3 (B with the
head's copy side close-only, `Z@&c@|-.`: a nursery then needs two errors, the first neutral): no nursery by 480k in 3 of
4, and root letters still turn after 240k in at least 2 of 4.
E2 read (before E3's results): 3 of 4 pool worlds **died** (seed 1 at 305k: a catcher `Z@&C@-` took the second
cells' place on host fronts and the locks died out; seed 2 at 415k after 3 turns: a plug `-N.g@` on the public G locks;
seed 3 at 145k: a plug `--D@` on a partial nursery whose second cells had no trap); seed 4 privatized (nursery from 195k,
trap `z!` on 92-100% of second cells, no turn after). Derived from it: **a lock is guardable only if its rightful keys
never travel free.** The guard is a trap of the lock's letter on the shared part; it cannot tell a pool-born child from a
plug (they differ only by `&`), so a public lock cannot be guarded and dies of its parasites, while a private lock's
children are born in place and the trap spares the class. Turnable and guardable exclude each other in the current core.
Revised predictions: E3 (door narrowed) no nursery in 3 of 4 and 3 of 4 dead by 480k of a lock parasite. E4: candidate
(v), contact lysis stops at a joint, as the parameter `lysJoint` with `lysOneWay` 1, and a guarded public lock (second
cell `C@-z|!`): a trap that raises keys with `&` and lyses plugs. Pool world as E2: 3 of 4 alive at 480k, no plug death,
root letters still turn in at least 2 of 4; control: the same second cell without `lysJoint` gives no class (every root
landing is lysed).

**Handoff status (autorun run 20261008-1650, build): priority 30 done.** No rule change. New checks `seal-evolve`
(3 of 4: seeds 5-8 at 400k), `seal` (4 of 4; control `commons`), `seal-turn` (4 of 4) (`node tri/check.js seal-evolve seal seal-turn`: 3 of 3 pass, 1205 s);
`tri/census.js --loop` (one summary per world; it dropped the first file without `--every`: fixed). Records:
INNOVATIONS run 1650, IDEAS "The shared site seals itself", RULES (w) item 6, ROADMAP (row, backlog A 30), picture
`loop-long.png`. The batches (`runs/` is not kept): the race world (`node tri/check.js --cmd race`) to 1.2M, seeds 5-8,
with and without `"lysOneWay":1` in `TRI_PARAMS` (41-85 minutes per world); the same to 480k, seeds 1-4 and 9-12; the
no-mutation worlds are the checks `seal` and `seal-turn`. Read any of them with `node tri/census.js --loop`. The full
suite was not rerun: no rule, physics or shared structure changed (three checks and a reader added). Nothing is running.

**Next step (rotation 81, explore): priority 33, a site that can neither be sealed nor turned** (below). Then rotation
82 (review-intent) and 83 (core-review: adopt or remove `lysOneWay`, priority 32).

## Priorities

Done 1-24 and 28-30: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user approved the order
(run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable variation; a minimal
competition test.
Open (review-intent 82 may reorder):
33. [81 explore] **A site that can neither be sealed nor turned** (theory first; IDEAS "The shared site seals itself",
    What it gives the goal). The loop of letters is transient: a site nobody needs seals (run 1650), a needed one has an
    unguardable plug (run 1522). Derive which site the core allows that its carrier needs (so not close-only, not inert)
    and whose parasite the carrier escapes only by a change that keeps its own use working: a head whose root letter
    and own side change together (two errors, rare, but its plug must change too), or a part recognised by two sides.
    Predict, then build the smallest such kind.
32. [83 core-review] **Adopt or remove `lysOneWay`** (RULES (w); item 6: no gain at length, a lysing plug killed one of
    four long worlds although every second cell carried two traps). For: the trap survives its catch, the scavenger's
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

Rotation (autorun `projects/plywood/rotation.txt`, unchanged): 80 build (done), 81 explore, 82
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
node tri/census.js --loop runs/x.txt [...]        # one summary per world: site turns, commons episodes, sealed site,
                                                   # trap, plugs, chains
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
