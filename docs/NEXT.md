# Next instance: start here

State on 2026-10-17 (after autorun run 20261017-2158, build). Read AGENTS.md first (rules of work), then this file.
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
- **Kin in place of the partner** (run 2102, "Two sites and no partner"): the one-type head `Y@&y@!y!` raises kin at both
  free sides, every bond a joint; its body is a conveyor (an elder and the cells it raised that still wait, 2-8 cells),
  not an individual that persists. A flow: it takes a world whose blanks lie free and is lost where a stock (the
  platform with common partners) holds the material; each keeps the other out. Under copy error no partner returns;
  the root guard `Y@&!y@!y!` is a ratchet (lost below 2-10% of bodies, selected above).
- **The kill's price** (run 2158, "A kill pays only if the killer is raised again"): the root guard's one act is its kid
  lysing a stranger that raised it; the lysis frees both, so the guard pays only where its kid is raised again more
  often than the stranger (a ratchet where free parts live 100 steps, a loss where they live 25, on the platform head
  `Y@&!c@y!` too). Guarded at both joints (root and site) a head keeps those letters under copy error; the front is no
  joint and varies.
- **The seal** (run 1902, "The seal is a race of standing minorities"): a parasite selects every partner it cannot read
  alike, so the escape goes to the class that stood larger, closed or another letter (22 of 23 episodes), and a letter
  usually stands larger (six times likelier per copy error). Under a seal no reader finds a side, so nothing keeps it:
  to 1.2M it drifts out and comes back with the episodes; only letters and marks vary, never the shape.

**Slice in progress (autorun run 20261017-2304, explore): priority 45, flow and stock under a varying drive.** New
labelled drive `PADZ` (demos.js, pair): free parts in a zone (the left half; `PADZX` its share) decay every `PADZ` steps
instead of `PADI`; `PADZT=T` turns the zone on and off every T steps (`PADZO` shifts the phase); 'zone:' lines give the
commonest bonded types, the rest and free blanks in ten bins of x. Without `PADZ` outputs are unchanged.
- **Theory.** From the six measured settings: the kin line (a flow) takes the scarce platform's world (`kin-take`)
  and is kept out of the common one (`kin-take-c`), and the platform entered into a kin world is lost in both: the
  platform never takes, it only keeps what it holds. A drive that varies therefore cannot hold both by alternation in
  time: the first fast phase after kin is present hands it the world, and a slow phase gives nothing back (one switch,
  never "in turn"). In space it can: if each zone's holder keeps the other out, the front between them has no reason to
  move off the place where the drive changes (a bistable front pinned by the map). The guard is the same with a
  threshold: p* (run 2158) is 0.29 for `C@s!T|` at 100 steps and 0.56 at 25, so from an even start (0.5) the slow half
  should go guarded and the fast half plain; in time the first phase decides.
- **Predictions** (before the runs; 60k worlds, 4 seeds; split = `PADI=100 PADZ=25`, fast half bins 0-4):
  P1 from an even start (10 bodies each) the kin line wins in all four settings (partner `C@s!T`/`C@s!T|` x 25/100
  steps), 3 of 4 or better each: a flow outgrows a stock that holds nothing yet.
  P2 kin entered (10 bodies at 10k): with `C@s!T` at 25 steps it takes the world, with `C@s!T|` at 100 it is lost (3 of
  4 each): the decay decides, not the partner.
  P3 split, the platform alone first and kin entered at 10k: kin takes the fast half and stops near its edge (at 60k kin
  over 80% of bonded cells in bins 0-4 and under 20% in bins 6-9), 3 of 4, with either partner.
  P4 in time (whole world, 25 and 100 in turn every 5000 steps), the same start: kin entered in a fast phase takes the
  world (3 of 4), entered in a slow phase it is lost (3 of 4).
  P5 the guard (`Y@&!c@y!` against `Y@&c@y!`, `C@s!T|`, even start), split: guarded over 70% of heads in bins 6-9 and
  under 30% in bins 0-3 at 60k, 3 of 4. P6 in time: slow phase first, the guard wins; fast phase first, the plain head
  (3 of 4 each).
  P7 under copy error (`pErr` 0.01, 240k), the split even start of P5: both halves held to 240k (2 of 4), and the plain
  half holds more bonded cells of other types than the guarded half.
- Read so far (`runs/z1`, `runs/z2`): P1 3 of 4 settings (with `C@s!T` at 100 steps the platform wins the even start,
  4 of 4); P2 first part **no** (kin entered into `C@s!T` at 25 is lost, 4 of 4), second yes (4 of 4); P3 **no**: with
  `C@s!T` kin is lost in both halves, with `C@s!T|` it takes the fast half and then the slow one (4 of 4 each); P5
  **no**: no difference between halves (`C@s!T|`: plain everywhere 4 of 4; `C@s!T`: guard 10-58% in both halves).
  Revised theory: every setting but (`C@s!T|`, 25) is bistable (a held world keeps the other out), and from an even
  start one side is stronger; between two bistable states the stronger one's front advances. So a front stops only
  where the stronger side changes. Before `runs/z3`: **P8** split, `C@s!T`, even start (kin stronger at 25, the
  platform at 100): kin over 80% of kin and platform cells in bins 0-4 and under 20% in bins 5-9 at 60k, 3 of 4 (side
  by side, pinned at the edge). **P9** in time (5000 steps each, `C@s!T`, even start, both orders): one line holds the
  world by 60k in 3 of 4 each, the platform (it took the even start at 100 from 22% of cells; kin takes only free
  material).
- Read `runs/z3` (z3b reran what a container restart stopped): **P8 no** (kin took both halves, 4 of 4); P9 one line
  holds the world (8 of 8) but it is **kin**, in both orders; P4 entered with `C@s!T|` in a fast phase kin took the
  world 3 of 4, in a slow phase it was lost 3 of 4 (the fourth survived to the next fast phase and took it); with `C@s!T`
  lost 8 of 8 (a held common world keeps it out in both phases); **P6 no**: the plain head won 8 of 8, both orders.
  Material moves (`tri/moveprobe.js`, rms displacement of every triangle): 3 units in 100 steps, 10 in 1000, 21-23 in
  5000, 30-32 in 10k, in kin and platform worlds alike: a 25-wide zone is crossed in the time a takeover takes
  (5-15k), so the split world acts as one well-mixed world with a mean drive, and any fast zone or phase feeds the flow.
  **P10** (before `runs/z4`): in a world three times as wide (150, 9000 blanks, 90 bodies of each), split, `C@s!T`,
  even start: at 60k the platform over 80% of kin and platform cells in bins 6-8 and kin over 80% in bins 1-3, 2 of 4.
- Batches: `runs/z1.json` (P1, P2), `runs/z2.json` (P3, P5), `runs/z3.json` (P4, P6, P8, P9), `runs/z4.json` (P10).

**Handoff status (autorun run 20261017-2158, build): priority 44 done (progressed).** The root guard counted
(`tri/lysprobe.js`, new: 'lys:', 'raise:', 'bounce:' lines) and put on the platform head, even and entered in four
settings and under copy error: checks `guard-plat`, `guard-plat-s` (4 of 4 each), `guard-plat-in` (3 of 4), digests
written; no rule or output change elsewhere. Predictions P1, P4, P5 yes; P2 (the guard wins scarce and common alike)
and P3's second part (the plain head entered into the guarded world is lost) no: the life of a free part decides
(INNOVATIONS run 2158 has each). The slice record is this file at `a31839c`; batches `runs/g1`-`g5` are described in
the INNOVATIONS entry's commands (60k worlds 2 minutes, the 240k copy-error ones 7-9). Open in it: why the plain head
entered as 10 bodies takes the scarce guarded world (the bounce threshold predicts a loss; its own raises per head run
10% above the guarded line's there). Nothing is running.

**Next step (rotation 105, explore): priority 45** (flow and stock), with the guard's new axis. Then 106 review-intent.

## Priorities

Done 1-24, 28-30, 32-34, 36-44: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user
approved the order (run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable
variation; a minimal competition test.
Open (set by review-intent run 20261017-0456; 45 by explore run 2102, its last sentence by build run 2158; reasoning in IDEAS "What a lineage owns is
what it raises", "The wait that pays" and "Two sites and no partner"):
45. [105 explore] **Flow and stock.** The kin line (a flow) wins where blanks lie free, the platform (a stock) where its
    partners hold the material, and each keeps the other out (run 2102). Theory first: under a labelled drive that
    varies in space or time (free parts decaying fast in part of the world), can both persist, side by side or in turn,
    and does copy error then make variants that use both? A drive map may need a demo option. The same map is a test
    for the root guard (run 2158): kept where free parts live long, lost where they decay fast, so side by side a
    frozen and a turning line.
31. [later] **Shape inside the loop.** Every class is one shape, so the loop is turnover of letters; 37 (done, run 1227:
    two locks hold two classes until copy error parts them) was its first concrete case. 39 is its next.
25. [later] **Length without sinks.** Chains of second cells arise by one mutation (an attach letter that complements a
    seed site) and preceded both collapses in run 0121 and all four in run 0551's control; a lysing site at the chain's
    tip stops them. Length as a function needs a chain that lets go (an `&` at its end) or a third cell that covers an
    open site (length as defence). On the platform (run 0726) the lattice stops a chain: bound by one side each time it
    closes after four cells into a ring of six (`rosette`); that ring is a parasite's, covering its head's site.
26. [later] Killing as a frequency-dependent enemy: the root-lysing seed site `z!` is the first killer to arise; it spread
    as a cheat, not as a predator, and guards against chains (run 0551). The root guard of the one-type head (run 2102)
    is the first case with a measured threshold, and its price is the killer's bounce (run 2158: a kill pays only if
    the killer is raised again, so the environment sets its worth).
Frozen: the 47-type organism (feeding, candidate (n), the front sink, lysis in the lineage); its genome copying left the
core in run 2221 (git `1284bb4`); `budpool`, `closure` and `lysis` keep its kit. Not taken from run 1750's list: (b) diets
of different length and (c) more diets than blanks (run 1150's R* rule again).

Rotation (autorun `projects/plywood/rotation.txt`, unchanged since run 0456): 105 explore, 106 review-intent
(the direction check 39's stop rule sends it to).

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((x) the option mode `lysJoint: 2` since run
2258, tried as the rule and kept an option in run 0518; (y) written and not proposed in run 0416; (z) written and not proposed in run 1406; (v) kept as the option `lysJoint`, (t), (s), (r)'s open part, (j), (l); settled there: (f),
(k) and the done ones, (u) and (w) in run 2221).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: the convention of reading a partner's current state is now used only by binding (the chain rules'
  same-pass reads left with them, run 2221; RULES, Locality audit). `pBond` is never below 1 (removing it changes the
  random stream only: take it with a change that changes outputs anyway).
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time: 85 and 89 minutes per part in harden run 20261017-0902 (91 checks; 105 since run 2102, about 15 minutes
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
lysprobe   'lys:' contact lysis by lysing type:side > lysed type, 'raise:' root bindings by raiser:side < kid, 'bounce:'
           kids that lysed their raiser (and those raisers) raised again within LY_BACK (200), every LY_EVERY (10000)
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
