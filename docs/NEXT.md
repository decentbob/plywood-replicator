# Next instance: start here

State on 2026-10-17 (after autorun run 20261017-1902, build). Read AGENTS.md first (rules of work), then this file.
History: docs/INNOVATIONS.md (newest first; each entry names its checks, commands and the commit of its slice record
with the predictions), RULES (Core changes), ROADMAP backlog A (every done priority with its run and checks), the
autorun log, and git: each run's handoff is this file at its merge (`git log -p docs/NEXT.md`). Run branches are
deleted at merge: cite commits, not branch names. The latest direction check is IDEAS "What a lineage owns is what it
raises" (run 0456).

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): every
cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use them. The 47-type
organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (INNOVATIONS has the numbers, IDEAS the reasoning under the quoted headings):
- **Locks** ("Who pays for a lock", "One encounter against two"): recognition is one glue pair and copy error changes
  one side, so a lock stays only where it pays its bearer; under copy error every lock is transient, and the cheat wins
  the site by flux. Candidate (x), the option `lysJoint: 2` (a lysis side spares across a joint only a partner carrying
  the identical side), keeps a guarded lineage's lock under copy error and freezes its letters: the guarded platform.
- **Ownership** ("What a lineage owns is what it raises"): no body in the core checks the partner it keeps; every kept
  structure is public, and a lineage owns what it raises, one triangle per generation.
- **Bodies of more than two cells** ("Rings of six", "A closed side, not a lysing one", "Keeping is waiting"): on the
  platform a chain of the public partner closes into a ring of six, a parasite's body that the partner's letter
  escapes; a gain a body gives away is public. A joint holds while its cell waits, so a kid whose site is an attach
  side makes buds of two raised cells, which hold under copy error and lose to the bud of one.
- **The wait that pays** (run 1602): the ratio of the wait for a partner to the wait for a kid orders every entry test;
  where partners are scarce the head that does not wait for its partner (`Y@&cy@!`) wins. Scarcity is not kept under
  copy error, and in one world kin replaced the partner (`Y@&y@!y!`, a one-type world: priority 43).
- **The seal** (run 1902, "The seal is a race of standing minorities"): a parasite selects every partner it cannot read
  alike, so the escape goes to the class that stood larger, closed or another letter (22 of 23 episodes), and a letter
  usually stands larger (six times likelier per copy error). Under a seal no reader finds a side, so nothing keeps it:
  to 1.2M it drifts out and comes back with the episodes; only letters and marks vary, never the shape.

**Handoff status (autorun run 20261017-1902, build): priority 41 done (progressed).** The closed platform watched to
1.2M (8 worlds, sealed and open founders) and the escape race entered: checks `rosette-race`, `rosette-race-r` (3 of 4
each, digests written; no rule or output change elsewhere); `census.js --partner` gained the closed share and readers,
`census.js --race` reads each episode, `linechart.js` `LC_CLOSED=1`; picture `seal-race.png`. Predictions: P2, P4, P5,
P6 yes; P1, P3 (first part), P7 no (INNOVATIONS run 1902 has each). The slice record is this file at `9846f0f`. The
1.2M worlds are only in `runs/` (gone): `runs/h1.json` is in INNOVATIONS (42 minutes per world, 4 at once). Nothing is
running.

**Next step (rotation 103, explore): priority 43** (kin in place of the partner). Then 104 build, 105 explore, 106
review-intent.

## Current slice (autorun run 20261017-2102, explore): priority 43, kin in place of the partner

Goal: say what the one-type head `Y@&y@!y!` (run 1602's `pe1`) is: what its kid waits for, which bodies leave and how
big they are, whether it is a sink; then alone (4 seeds, 60k, no copy error), entered into the platform's world and the
platform into its world, with partners scarce (`C@s!T|`, `PADI` 25) and common (`C@s!T`, default decay), and alone
under copy error. Done when the worlds are read against the predictions below; one check if a number holds in 3 of 4.
Stop: no rule change unless the runs show a sink the core cannot leave.
- **Running**: `runs/k2.json` (alone `a`, kin entered `ks`/`kc`, platform entered `ps`/`pc`; seeds 1-4, 60k, bodyprobe
  `BP_RIGID` and waitprobe preloaded; waitprobe now takes the attach side as the front when both free sides are lysis
  sides). Rerun: `node tri/batch.js runs/k2.json` with the file as in this commit's message.
- **Theory.** The head's root is its only `&` side, and every bond in a one-type world holds a root, so every bond is a
  joint and each cell hears only its own front: a cell is held by its parent exactly until its front is bound (the kid
  waits for its front only). Both free sides raise kin, and by the same rule: the site `y!` takes a kin root, the front
  `y@!` takes a kin root, and each such kin leaves once its own front is bound. So the head has two sites and no
  partner, and a kin cell costs one triangle where a platform head costs two. A cell leaves carrying its front kin and
  any site kid (each waiting); waiting cells raise at their sites (fans about a vertex, at most six), so bodies are one
  elder (spent root) with waiting cells, 2 to about 6 cells. The elder is lost (a free cell nothing binds) once both its
  sides are empty at once, so each generation sheds a cell: the line persists, not the body. Not a sink: no cell keeps a
  joint once its front is bound, and every front faces out. The front is filled mostly by a copy made at the front
  (a copy blank takes the cell's type there), so its wait is local, like the site's, while the platform's partner wait
  depends on travel. A kin site raises a platform head too (both carry `y!`: spared), and a platform site raises kin;
  a kin front lyses a platform head (no `y@!` on it).
- **Predictions (before any output of the batch):**
  - P1 alone: alive 4 of 4 at 60k with 800 or more kin cells (the platform alone: about 520 heads).
  - P2 alone: 90% or more of kin cells in rigid bodies of two or more roots; no body above 8 roots at any census from
    10k; the mean front wait within a factor 1.5 of the mean site wait.
  - P3 kin entered (10 bodies at 10k) where partners are scarce: more kin cells than platform heads at 60k, 4 of 4.
  - P4 kin entered where partners are common (the platform's best case, wait ratio 0.4): the same, 3 of 4 or more.
  - P5 the platform entered into the kin world: no platform head at 60k, 4 of 4 in both settings.
  - P6 (copy error, `pErr` 0.01, 240k, from the kin founder; batch after this one): `Y@&y@!y!` stays the commonest head
    type in 3 of 4; no partner-type cell (a head front that is not `y`) reaches 10% of cells.
- **Second batch** (`runs/k3.json`, after `runs/kE` showed the root-guarded form `Y@&!y@!y!` taking 2 of 4 worlds under
  copy error). Theory: a root-guarded kid raised by a cell without the guard lyses that cell across the joint (it
  carries no `Y@&!`); the cell cuts its bonds and comes back fresh, freeing its other kin. A plain kid at a root-guarded
  cell is spared both ways (it carries `y!` and `y@!`). So the guarded form raises both kinds and the plain form raises
  only its own: an asymmetry that should select the guard.
  - P7 `Y@&!y@!y!` entered (10 bodies at 10k) into the kin world: more than half of the cells at 60k in 3 of 4.
  - P8 the plain kin entered into the root-guarded world: below 10% of cells at 60k in 4 of 4.
  - P9 control, the anchored root `Y@&|y@!y!` (neutral: no rule reads an anchor on a bonded root) entered the same
    way: below 10% at 60k in 3 of 4.
  - Read (k3): P7 **no** (the guarded form lost 4 of 4; 187 cells at 20k in one world, then gone), P8 yes (4 of 4), P9
    yes (4 of 4). Entered at 2%, each form holds its world, as the neutral control does. Next, an even start
    (`runs/k4.json`: 10 bodies of each at step 1, both orders, 4 seeds each). P10: if the asymmetry is weak (kin are
    raised mostly by copies made in place), the guarded form has the majority at 60k in 3 to 5 of 8, as drift would
    give; 6 or more of 8 would mean it is selected once common.
  - Read (k4): P10 **no**: the guarded form won 8 of 8 (ahead at 5k in 7 of 8). Checks `root-guard` (even start) and
    `root-guard-rare` (k3's entry) 4 of 4 each. Threshold (`runs/k5.json`: guarded 5 of 20 and 2 of 20 bodies at the
    start, 4 seeds each). P11: at 25% the guarded form wins 3 of 4 or more; at 10% it wins at most 2 of 4.
  - Read (k5): at 25% the guarded form won 3 of 4 (the fourth mixed, 29% at 60k), at 10% also 3 of 4 (P11 first part
    yes, second **no**). So k3's loss may be the held world's barrier (the neutral control was lost there too), not a
    threshold of the guard. `runs/k6.json`: the guard at 1 of 50 bodies from a shared start; control, the anchored root
    at 2 of 20. P12: the guarded form wins 1 or more of 4 at 2%; the anchored root wins at most 1 of 4 at 10%.

## Priorities

Done 1-24, 28-30, 32-34, 36-42: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user
approved the order (run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable
variation; a minimal competition test.
Open (set by review-intent run 20261017-0456, 43 by build run 1602, 41 done in run 1902; reasoning in IDEAS "What a lineage owns is what it
raises" and "The wait that pays"):
43. [103 explore] **Kin in place of the partner.** In one copy-error world from the scarce platform (run 1602, `pe1`)
    the front changed to the root's complement and the partner went extinct: `Y@&y@!y!`, one type whose front (`y@!`,
    attach and guarded) and site (`y!`, guarded) both raise kin. Theory first: what a kid waits for (its front only),
    which bodies leave and how big they are (fans about a vertex?), whether it is a sink. Then alone (4 seeds, without
    copy error, from one founder; `PA2='Y@&y@!y!'` is a one-type strip: check the founder binds), entered into the
    platform's world and the platform into its world, with partners common and scarce. One check if a number holds
    in 3 of 4.
31. [later] **Shape inside the loop.** Every class is one shape, so the loop is turnover of letters; 37 (done, run 1227:
    two locks hold two classes until copy error parts them) was its first concrete case. 39 is its next.
25. [later] **Length without sinks.** Chains of second cells arise by one mutation (an attach letter that complements a
    seed site) and preceded both collapses in run 0121 and all four in run 0551's control; a lysing site at the chain's
    tip stops them. Length as a function needs a chain that lets go (an `&` at its end) or a third cell that covers an
    open site (length as defence). On the platform (run 0726) the lattice stops a chain: bound by one side each time it
    closes after four cells into a ring of six (`rosette`); that ring is a parasite's, covering its head's site.
26. [later] Killing as a frequency-dependent enemy: the root-lysing seed site `z!` is the first killer to arise; it spread
    as a cheat, not as a predator, and guards against chains (run 0551).
Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage); its genome copying left the
core in run 2221 (git `1284bb4`); `budpool`, `closure` and `lysis` keep its kit. Not taken from run 1750's list: (b) diets
of different length and (c) more diets than blanks (run 1150's R* rule again).

Rotation (autorun `projects/plywood/rotation.txt`, unchanged since run 0456): 102 build, 103 explore, 104 build,
105 explore, 106 review-intent (the direction check 39's stop rule sends it to).

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((x) the option mode `lysJoint: 2` since run
2258, tried as the rule and kept an option in run 0518; (y) written and not proposed in run 0416; (z) written and not proposed in run 1406; (v) kept as the option `lysJoint`, (t), (s), (r)'s open part, (j), (l); settled there: (f),
(k) and the done ones, (u) and (w) in run 2221).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: the convention of reading a partner's current state is now used only by binding (the chain rules'
  same-pass reads left with them, run 2221; RULES, Locality audit). `pBond` is never below 1 (removing it changes the
  random stream only: take it with a change that changes outputs anyway).
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time: 85 and 89 minutes per part in harden run 20261017-0902 (91 checks; 101 since run 1902, about 12 minutes
  more per part); physics is most of it (INNOVATIONS run 20261017-0902; a cell-distance cut in `_pairs` would rarely
  skip a cell: the pair reach, 1.39, is about a cell, 1.4). When a
  part nears 2 hours, `--part k/3` balances three parts the same way. Worlds shared between checks: only `race`/`seal-evolve` had one setting
  (`pair-mut` reads a result line, which a longer world does not repeat).
- Copy error as the standard world's variation: decided in run 2151 not to retire `PAM` now (on in 21 checks, 5 of them
  the front-only mutagen `PAMF=1`, which copy error cannot replace); new work runs in the line's preset (priority 36).
- A seal that is kept (run 1902): on the platform the close-only mark drifts out between parasite episodes. It would
  stay only with a cost for open sides between episodes or episodes often enough to outpace drift (several readers
  of different letters at once); not a priority, a direction for when parasites diversify.
- Bigger cells and letter reuse (user, 2026-10-03; IDEAS): R 5 is the largest all-unique kind (46 letters); if a
  slice needs a larger cell, reuse letters inside sealed compartments.

## Commands
```
node tri/test.js                                   # fast checks (~5 s)
node tri/check.js [id ...] > runs/check.txt         # capability checks: one PASS/FAIL line each, printed as each finishes
                                                   # (4 processes; about 1.5 hours per part: as two background jobs,
                                                   # --part 2/2 started from --part 1/2's notification, from a worktree
                                                   # if you edit code meanwhile); no --help: a lone flag runs them all;
                                                   # CHECK_SAVE=dir keeps each world's output; each line ends [same] etc.
                                                   # against main's digests (tri/digests.txt)
node tri/check.js --write [id ...]                  # ... and rewrite the digests of the worlds run (a PR that changes outputs)
node tri/check.js --write --from runs/a            # digests from a CHECK_SAVE directory, nothing run
node tri/check.js --cmd [id ...]                   # each check's demo command (env, seeds, steps): the world of every
                                                   # capability (its INNOVATIONS entry names the checks); change the
                                                   # steps (third argument) to run it longer
node tri/batch.js runs/b.json                      # a batch of demo worlds from a JSON file, 4 at a time, an output file and
                                                   # picture directory per world (format in the file's head comment)
PAW=2 node tri/demos.js pair 1 480000 runs/x       # THE LINE'S WORLD (run 0727): no stocks or mutagen, founder
                                                   # 'Z@&c@|- C@-z|!', pErr 0.01, lysJoint 1 (check line at 240k); the
                                                   # guarded platform: PA2='Y@&c@y! C@s!T' and TRI_PARAMS
                                                   # '{"pErr":1e-9,"lysJoint":2}' (--cmd rosette)
PAW=1 node tri/demos.js pair 1 120000 runs/x       # THE STANDARD WORLD (check world): the diet kind among stocks C E G,
                                                   # openRange 9, deaths return blanks, decay, the whole-body hazard h 0.07,
                                                   # the general mutagen 0.01; any option set overrides (demos.js, comments
                                                   # above the pair demo, list every option)
node tri/demos.js closure                          # the designed organism kind (budKit) drawn, no physics
node tri/demos.js imprint 1 200000 runs/x           # contact copying: a ring with one of each part closes, a second grows
```
Readers (`runs/x.txt` is a world's output):
```
node tri/census.js runs/x.txt [--every k]         # heads by root letter, second cells by site letter, from 'types:' lines
                                                   # (copy error on; PATN=30 in the world lists 30 types)
node tri/census.js --loop|--partner|--shape runs/x.txt   # per world: site turns, commons, seal, chains (--loop);
                                                   # rootless partners by plain letter, closed share, chain cells, readers
                                                   # (--partner); cells by shape and own side (--shape); each parasite
                                                   # episode and where it escaped (--race); also --pool --joint
LC_PARTNER=1 [LC_CLOSED=1] | LC_SHAPE=1 node tri/linechart.js out.png FILES   # charts of the above
```
Probes (added to any demo world with `NODE_OPTIONS='-r ./tri/NAME.js'`; each prints its own lines):
```
copyrate   'copyrate:' copies per template class from CR_T0 (25000)
siteprobe  'probe:' every 1000 steps from SP_T0 (20000): what holds the host nurseries' own sites
raceprobe  'race:' every 10000 steps from RP_T0: who takes a guarded site after a kid leaves; 'fate:' copies' fates
bodyprobe  'body:' every 5000 steps, individuals by cells; BP_RIGID=1 'rigid:' bodies joined by any bond
waitprobe  'wait:' every WP_EVERY (10000) from WP_T0 (10000): per head type the wait for its front, cut and site
coverage   COV_OUT=$PWD/runs/cov.jsonl with tri/check.js: marks present, rule events, one JSON line per world
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
