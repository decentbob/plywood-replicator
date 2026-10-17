# Next instance: start here

State on 2026-10-17 (after autorun run 20261017-0726, build). Read AGENTS.md first (rules of work), then this
file. History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (every done priority with its
run and checks), the autorun log, and git: each run's handoff is this file at its merge (`git log -p docs/NEXT.md`); a
slice record with its predictions is on its run's branch (`build-0726`, `explore-0416`, `build-0252`, `explore-2258`, `build-2151`,
`build-1902`, `explore-1602`, `build-1227`, `build-0727`, `core-review-2221`, `explore-1951`); the latest direction check
is IDEAS "What a lineage owns is what it raises" (run 0456).

**Goal (user, 2026-10-05): complex evolution** (AGENTS.md, IDEAS); the organism that feeds its bud is a direction.
Since review-intent run 1850 the vehicle is **the pair** (2 cells, 2 types; IDEAS "Sources in proportion to use"): every
cell of a body exposes exactly one copyable side, so part types are made in the proportion buds use them. The 47-type
organism lineage is frozen; it returns as the complex end once the pair world varies and competes.
Where the line stands (runs 1351-0416; INNOVATIONS has the numbers, IDEAS the reasoning): recognition is one glue pair
and copy error changes one side, so a lock its carrier needs is frozen and only a lock its carrier does not need turns
("Who pays for a lock"); a lock stays only where it pays its bearer, and under copy error every lock is transient, lost
to its cheats and reborn from them; the cheat wins the site by flux ("One encounter against two"); the nursery's share
is the environment's. **Candidate (x)** (`lysJoint: 2`, an option: a lysis side spares across a joint only a partner
carrying the identical side) keeps a guarded lineage's lock under copy error (24 of 24 censuses) and freezes its
letters. Two guarded nurseries front to front are two obligate classes (run 0252), but a public partner of a foreign
root takes either role, and **no body in the core checks the partner it keeps** (run 0416): every kept structure is
public, and what a lineage owns is what it raises, one triangle per generation. **The first bodies of more than two
cells** (run 0726): on the guarded platform the public partner is rootless, and one front error makes it a chain cell
that binds the partner's plain side and its own; a chain closes after four cells into a **ring of six** that covers
its head's site. It is the parasite's body, not the host's, and it lives on the partners' commonest letter, which
escapes it: so the guarded head keeps its letters while the partner's letter turns in bursts (IDEAS "Rings of six").

**Handoff status (autorun run 20261017-0726, build): priority 39, first slice, done.** Rings of six (INNOVATIONS run
0726; IDEAS "Rings of six"; pictures `rosette.png`, `rosette-escape.png`, `rosette-turns.png`). No rule change.
- Theory: a complete cell's root is spent, so a rootless partner is copied at two sides (why the end states' partners
  are rootless: 3 of 3 living `mutual-pair-evolve` worlds, 1 of 4 `kin-guard-evolve`). One front error to the complement
  of the partner's own plain letter (`C@s!T` to `t@s!T`) makes a chain cell.
- Checks (digests written): `rosette` 4 of 4 (chain cells entered at 10k on `Y@&c@y! C@s!T`: six-cell bodies held from
  15-20k; the ring's last cell covers the head's site; heads halved), `rosette-escape` 3 of 4 (a partner letter A entered
  as 10 bodies takes 95-100% of partners, the chain lost), `rosette-escape-c` 4 of 4 (without the chain A is lost).
- Watched: natural chains in 2 of 8 evolve end states to 480k and in 3 of 4 platform worlds under copy error (five
  episodes to 480k), each followed by its letter's fall; the letter also drifts between episodes. Partners whose two
  free sides lyse (immune) rose to 35-62% in 2 of 4 copy-error worlds, also 33% in a control: selection not shown.
- Tools: `census.js --partner`, `linechart.js` `LC_PARTNER=1`, `tri/bodyprobe.js` ('body:' lines, individuals by cells).
- Batches (`runs/` is ignored, so their JSON is here): e1 both evolve settings to 480k
  (`{"demo":"pair","steps":480000,"env":{"PAW":"2","TRI_PARAMS":"{\"pErr\":0.01,\"lysJoint\":2}"},"jobs":[{"id":"mp",
  "seeds":[1,2,3,4],"env":{"PA2":"Y@&c@y! C@x!X@&"}},{"id":"kg","seeds":[1,2,3,4],"env":{"PA2":"Y@&c@|y! C@|-Z@&"}}]}`);
  e6 the platform watch: the same with `PA2` `Y@&c@y! C@s!T`, one job; e5 `rq`: `rosette`'s command with
  `{"pErr":0.01,"lysJoint":2}` to 160k. Nothing is running.

**Next step (rotation 97, harden):** the suite has 91 checks (`rosette*` add 12 worlds, about 100 s each): keep both
parts inside two hours. Then **run 98 (build): priority 39, second slice** (below).

## Priorities

Done 1-24, 28-30, 32-34, 36-38: ROADMAP backlog A (each with its run and checks; INNOVATIONS has the evidence). The user
approved the order (run 0321): a world that runs indefinitely under steady, labelled drives; the simplest heritable
variation; a minimal competition test.
Open (set by review-intent run 20261017-0456; reasoning in IDEAS "What a lineage owns is what it raises"):
39. [98 build] **Growth on the guarded platform, second and last slice.** First slice (run 0726): rings of six, a
    parasite of the public partner's plain side that the letter escapes (`rosette*`). Theory first, then entry tests
    on `rosette`'s world: (a) **the immune partner** `C@s!T!` (both free sides lysing: no chain binds it) entered rare
    beside the chain: predict it escapes like A; then under copy error, whether it fixes and the partner's letter stops
    turning (the guard once more, one cell over); (b) **a ring that pays its head**: a chain cell carrying the head's
    site (`t@y!T`, one site error from `t@s!T`) makes each ring four nursery sites for the head's kin; an occupied site
    is not copied, so predict whether it spreads against `t@s!T` and whether heads on such rings out-raise plain ones.
    Done when one of them holds in 3 of 4 (a check) or the argument settles it. After it, 39 goes back to the direction
    check (stop rule: four slices without a capability that holds under copy error; the rings hold only without an
    escape letter).
40. [99 explore] **When a joint lets go (on paper first).** The one route to a body that owns more than one cell per
    generation is a checked bond that outlasts completion (IDEAS run 0416: (x)'s check bites only across a joint, and a
    joint is cut at completion). Design the smallest change on the keeping side, say exactly what it reads (locality),
    and derive whether it makes bodies that never let go (run 0820's collapse at 3x) or self-binders (candidate (y)).
    Build only if the argument says it does neither; record it under Core changes either way.
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

Rotation (autorun `projects/plywood/rotation.txt`, unchanged in runs 0456, 0518 and 0726): 95 core-review, 96 build, 97
harden, 98 build, 99 explore. Run 98 (build) takes 39's second slice.

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((x) the option mode `lysJoint: 2` since run
2258, tried as the rule and kept an option in run 0518; (y) written and not proposed in run 0416; (v) kept as the option `lysJoint`, (t), (s), (r)'s open part, (j), (l); settled there: (f),
(k) and the done ones, (u) and (w) in run 2221).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: the convention of reading a partner's current state is now used only by binding (the chain rules'
  same-pass reads left with them, run 2221; RULES, Locality audit). `pBond` is never below 1 (removing it changes the
  random stream only: take it with a change that changes outputs anyway).
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time: 87 minutes per part in run 0902's container (69 checks); lone blocks' physics is most of it (`_overlap`
  30%, `_pairs` 15%, `tryMove` 13% in a `PAW=2` world; a cell-distance cut in `_pairs` would rarely skip a cell: the
  pair reach, 1.39, is about a cell, 1.4). Worlds shared between checks: only `race`/`seal-evolve` had one setting
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
                                                   # if you edit code meanwhile);
                                                   # CHECK_SAVE=dir keeps each world's output; each line ends [same] etc.
                                                   # against main's digests (tri/digests.txt)
node tri/check.js --write [id ...]                  # ... and rewrite the digests of the worlds run (a PR that changes outputs)
node tri/check.js --write --from runs/a            # digests from a CHECK_SAVE directory, nothing run
node tri/check.js --cmd [id ...]                   # each check's demo command (env, seeds, steps): the world of every
                                                   # capability; change the steps (third argument) to run it longer
node tri/census.js runs/x.txt [--every k]         # heads by root letter, second cells by site letter, from 'types:' lines
                                                   # (copy error on; PATN=30 in the world lists 30 types)
node tri/census.js --loop runs/x.txt [...]        # one summary per world: site turns, commons episodes, sealed site,
                                                   # trap, plugs, chains
node tri/batch.js runs/b.json                      # a batch of demo worlds from a JSON file, 4 at a time, an output file and
                                                   # picture directory per world (format in the file's head comment)
PAW=2 node tri/demos.js pair 1 480000 runs/x       # THE LINE'S WORLD (run 0727): no stocks or mutagen, founder
                                                   # 'Z@&c@|- C@-z|!', pErr 0.01, lysJoint 1 (check line at 240k); read
                                                   # with census --pool --joint, chart with tri/linechart.js
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
NODE_OPTIONS='-r ./tri/siteprobe.js' ...           # run 1602: 'probe:' lines every 1000 steps from SP_T0 (20000): what holds
                                                   # the host nurseries' own sites (empty, kid, catcher waiting or filled)
COV_OUT=$PWD/runs/cov.jsonl NODE_OPTIONS="-r ./tri/coverage.js" node tri/check.js   # coverage: marks present, rule
                                                   # events, one JSON line per demo world
node tri/check.js --cmd two-locks two-locks-c two-locks-y
                                                   # run 1227: two classes on the two-lock carrier C@y!z|! (the mix from a
                                                   # Y majority), one carrier per class, the copied-side class alone
node tri/check.js --cmd nursery-mix mutualist-rare mutualist-major two-lineages
                                                   # run 1902: the nursery's cheat mix; a second nursery system lost
                                                   # rare, winning as the majority; the two-lineage body under copy error
node tri/check.js --cmd nursery-decay self-nursery   # run 2151: the nursery at PADI 50 (its number set by the free
                                                   # cheats' life); the one-type nursery Y@&y@!y@! alone
RP_T0=25000 NODE_OPTIONS='-r ./tri/raceprobe.js' ... # run 2151: 'race:' lines every 10000 steps: who takes a guarded
                                                   # site after a kid leaves, how long it was empty, the taker's origin;
                                                   # run 2258: 'fate:' lines (copies to site, decay or elsewhere; rB, pi,
                                                   # rho, c's births ratio against the N count)
node tri/check.js --cmd rosette rosette-escape rosette-escape-c
                                                   # run 0726: chain cells t@s!T entered on the platform close into rings
                                                   # of six; a rare partner letter escapes them; control
node tri/census.js --partner runs/x.txt            # run 0726: rootless partners by plain letter ('immune': both free sides
                                                   # lyse), chain cells, cells in 3+ bodies (from 'body:' lines); chart:
                                                   # LC_PARTNER=1 node tri/linechart.js out.png FILES
NODE_OPTIONS='-r ./tri/bodyprobe.js' ...           # run 0726: 'body:' lines every 5000 steps, individuals by cells
node tri/check.js --cmd kin-guard kin-guard-evolve   # run 2258: candidate (x), lysJoint 2 (TRI_PARAMS): the nursery's
                                                   # cheats lost; under copy error the lock in every census
node tri/check.js --cmd mutual-pair mutual-pair-a mutual-filler mutual-trap mutual-pair-evolve
                                                   # run 0252: two leaky guarded nurseries front to front, no filler;
                                                   # anchored control; a foreign-root public filler takes the role; a
                                                   # public head of root Y is lost; copy error to 120k
node tri/census.js --shape runs/x.txt              # run 1902: cells by shape (H front c@, K front C@) and own side (G
                                                   # guarded nursery, N plain nursery, P plain, S another letter's site);
                                                   # chart: LC_SHAPE=1 node tri/linechart.js out.png FILES
node tri/check.js --cmd catcher-mix catcher-letter catcher-letter-z
                                                   # run 1602: catchers entered hold a mix; a nursery in another letter
                                                   # survives them, one in their root letter dies
node tri/demos.js closure                          # the designed organism kind (budKit) drawn, no physics
node tri/demos.js imprint 1 200000 runs/x           # contact copying: a ring with one of each part closes, a second grows
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
