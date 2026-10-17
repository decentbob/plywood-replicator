# Next instance: start here

State on 2026-10-17 (after autorun run 20261017-1802, cleanup). Read AGENTS.md first (rules of work), then this file.
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

**Handoff status (autorun run 20261017-1802, cleanup): done (progressed); no code or output change.** This file
shortened (the state as four points, run 1602's details and batch settings moved to its INNOVATIONS entry, the per-run
`--cmd` lines folded into one); INNOVATIONS gained harden run 20261017-0902's record (it had none) and commits in place
of the deleted branch names its prediction pointers gave; the unlinked picture `kin-guard.png` linked from run 2258's
entry; ROADMAP's speed item brought up to date. Nothing is running.

**Next step (rotation 102, build): priority 41.** Then 103 explore: priority 43 (kin in place of the partner).

## Current slice (autorun run 20261017-1902, build): priority 41, the closed platform at length

Goal: watch the guarded platform with copy error to 1.2M from the sealed partner `C@s!T.` and from the open `C@s!T`, and
say whether the seal comes (or stays), whether chain episodes stop once it has, and what varies on a body nothing reads.
Done when the 8 worlds are read against the predictions below; one check only if a number holds in 3 of 4 (and at a
length the suite can afford). Stop: one batch, read; no new mechanism this run.
- **Running**: `runs/h1.json` (detached `node tri/batch.js runs/h1.json runs/h1`, started 19:04 UTC): `PAW=2`, `PATN` 60,
  `TRI_PARAMS` `{"pErr":0.01,"lysJoint":2}`, bodyprobe every 10k; `sd` seeds 1-4 `PA2='Y@&c@y! C@s!T.'`, `op` seeds 1-4
  `PA2='Y@&c@y! C@s!T'`; 1.2M steps. Read with `node tri/census.js --partner runs/h1/*.txt --every 10` and the closed
  share (partners whose plain side carries `.`).
- **Theory.** On `Y@&c@y! C@s!T.` every free side is closed to a free reader: the head's site is guarded (only its kin is
  raised, any other reader is lysed across the joint), the partner's `s!` is a trap (a reader binds it by a bond that is
  not a joint and dies with the partner's body), `T.` binds no free triangle. Copy blanks still copy all of them. So the
  partner's plain letter under `.` and the letter under `!` are read by nothing: they drift. The ways out are one mark
  each: `.` lost (1/36 per copy error) reopens the plain side to a chain on its letter; `!` lost opens `s` to a reader
  that keeps it. By mutation alone the mark toggles at 0.01/36 per partner copy, about 20% open by 1.2M (about 850
  partner generations) if nothing selects it either way; a chain on an open partner selects the closed one back.
- **Predictions (before reading any output):**
  - P1 sealed arm: the closed share stays at or above half of partners at every 100k census to 1.2M in 3 of 4 worlds.
  - P2 chain episodes (20 or more chain cells): fewer in the sealed arm than in the open arm (summed over 4 worlds);
    every chain in the sealed arm is on a partner that lost its `.` or its `!`.
  - P3 open arm: the closed share passes half of partners in at most 1 of 4 by 1.2M; chain episodes still come after
    480k in at least 2 of 4 (the loop of letters does not end by itself in this time).
  - P4 sealed arm: the partner's majority plain letter turns at least once in 3 of 4 worlds (drift on a closed side);
    bodies stay of two cells (90% or more of complete individuals at 1.2M, 4 of 4).
  - P5 all 8 worlds alive at 1.2M.

## Priorities

Done 1-24, 28-30, 32-34, 36-40, 42: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user
approved the order (run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable
variation; a minimal competition test.
Open (set by review-intent run 20261017-0456, 43 by build run 1602; reasoning in IDEAS "What a lineage owns is what it
raises" and "The wait that pays"):
41. [102 build] **The closed platform at length.** `Y@&c@y! C@s!T.` under copy error
    (the body has no side a free reader can hold): watched to 1.2M from the platform with and without the closed side,
    does the seal come in the end as in run 1650, do chain episodes stop once it has, and what varies on a body nothing
    reads (drift only, or a new shape)? Watch first, then one check if a number holds in 3 of 4.
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
- Suite time: 85 and 89 minutes per part in harden run 20261017-0902 (91 checks; 99 since run 1602, about 10 minutes
  more per part); physics is most of it (INNOVATIONS run 20261017-0902; a cell-distance cut in `_pairs` would rarely
  skip a cell: the pair reach, 1.39, is about a cell, 1.4). When a
  part nears 2 hours, `--part k/3` balances three parts the same way. Worlds shared between checks: only `race`/`seal-evolve` had one setting
  (`pair-mut` reads a result line, which a longer world does not repeat).
- Copy error as the standard world's variation: decided in run 2151 not to retire `PAM` now (on in 21 checks, 5 of them
  the front-only mutagen `PAMF=1`, which copy error cannot replace); new work runs in the line's preset (priority 36).
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
                                                   # rootless partners by plain letter, chain cells (--partner, from 'body:'
                                                   # lines); cells by shape and own side (--shape); also --pool --joint
LC_PARTNER=1 | LC_SHAPE=1 node tri/linechart.js out.png FILES   # charts of the above
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
