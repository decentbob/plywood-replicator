# Next instance: start here

State on 2026-10-17 (after autorun run 20261017-1602, build). Read AGENTS.md first (rules of work), then this
file. History: docs/INNOVATIONS.md (newest first), RULES (Core changes), ROADMAP backlog A (every done priority with its
run and checks), the autorun log, and git: each run's handoff is this file at its merge (`git log -p docs/NEXT.md`); a
slice record with its predictions is on its run's branch (`build-1602`, `explore-1406`, `build-1302`, `build-0726`, `explore-0416`, `build-0252`, `explore-2258`, `build-2151`,
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
escapes it: so the guarded head keeps its letters while the partner's letter turns in bursts (IDEAS "Rings of six"). Its
escapes (run 1302): a new letter (quick, transient) or a close-only plain side (permanent, but not found under copy error
in 480k); a lysing side is a trap that kills the body. A ring whose chain cells carry the head's site raises heads on
four sites and loses to the chain that keeps its side for copies: a gain a body gives away is public (IDEAS "A closed
side, not a lysing one").
**Keeping is waiting** (run 1406): a joint holds while its `&` cell hears an open front, its own `@` sides included, so a
kid whose site is an attach side keeps its checked joint until its own kid binds (buds of two raised cells, existing core);
kept for good (candidate (z)) a lineage is one ring of six, a sink. The bud of two holds under copy error and drops its
wait for the partner, but loses to the bud of one where partners come quickly: a kept daughter keeps its mother's site busy.
**The wait that pays** (run 1602): a site is filled mostly in place, a partner comes from elsewhere, so the ratio of the
wait for a partner to the wait for a kid orders every entry test; where partners are scarce (ratio 2.1: `C@s!T|` and free
parts living 25 steps) the head that does not wait for its partner (`Y@&cy@!`) wins 7 of 8 entered and its kid is a
carried line, not a body. Scarcity is not kept under copy error (the partner's anchor is lost, 7 of 8), and in one
world **kin replaced the partner** (`Y@&y@!y!`, a one-type world: every cell raised by the lineage and guarded).

**Handoff status (autorun run 20261017-1602, build): priority 42 done (progressed); no core change.** Slice record
with predictions in `docs/NEXT.md` at the branch's first commits (branch `build-1602`; P5-P7 added before the copy-error
batch); INNOVATIONS run 1602, IDEAS "The wait that pays"; picture `docs/pictures/no-wait.png`.
- **The order of two waits decides it** (platform alone, partner wait over site wait): `C@s!T` 0.4, with `PADI` 25 0.9,
  `C@s!T|` 1.2, with `PADI` 50 1.7, with `PADI` 25 2.1. The non-waiting head entered as 10 is lost at 0.4-1.2 (4 of 4
  each; P3 wrong: one copied side alone is not enough), wins 1 of 4 at 1.7 and 7 of 8 at 2.1 (check `no-wait`); the
  platform entered against it is lost at 2.1 (4 of 4, `no-wait-r`); control `no-wait-c` (0.9: lost 4 of 4).
  `Y@&c@y@!` (waits for both) lost 4 of 4 at 1.2 (P4 yes).
- Its cost: kids that leave with no partner are lost (13% at 0.4 to 60% at 2.1); it wins because a leaving kid carries
  its own kid (a line that sheds a cell per generation). Sites fill in place (59%, 74% at `PADI` 25: `PARP=1`).
- **Under copy error** (`pErr` 0.01, `PADI` 25, `C@s!T|`, to 240k): the platform never found `Y@&cy@!` (P5 yes, 4 of 4);
  the non-waiting head kept its form (P6 yes, 4 of 4); the partner lost its anchor in 7 of 8 (10-70k), after which each
  head held its world; in `pe1` (seed 1 from the platform) the front turned to `y@` by 15k, the partner was extinct by
  20-25k and the front carried the guard by 95k (`Y@&y@!y!` with its root-anchored form `Y@&|y@!y!`: 98% of cells at 240k): a one-type world.
- Code: `tri/waitprobe.js` ('wait:' lines: per head type the mean wait for its front, its cut, its site, and kids lost);
  checks `no-wait`, `no-wait-r`, `no-wait-c` (digests written). Batches (`runs/` is ignored; JSON here): base env
  `{"PAW":"2","TRI_PARAMS":"{\"pErr\":1e-9,\"lysJoint\":2}"}`; entries `PA3T` 10000 `PA3N` 10, `PA2` the resident head
  with its partner, `PA3` the entrant with its partner; waits with `NODE_OPTIONS='-r ./tri/waitprobe.js'` `WP_T0` 10000
  (30k); copy error `runs/g7.json`: `TRI_PARAMS` `{"pErr":0.01,"lysJoint":2}`, `PADI` 25, `PA2` `Y@&c@y! C@s!T|` (pe) or
  `Y@&cy@! C@s!T|` (ne), seeds 1-4, 240k (about 9 minutes each). The one-type world: `pe` seed 1 (its state at 120k:
  rerun with pictures on, `runs/pe1p/pair_end.json.gz`, not kept). Nothing is running.

**Next step (rotation 101, cleanup).** Then 102 build: priority 41; 103 explore: priority 43 (kin in place of the
partner).

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

Rotation (autorun `projects/plywood/rotation.txt`, unchanged in runs 0456, 0518, 0726, 1302, 1406 and 1602): 100
build, 101 cleanup, 102 build, 103 explore, 104 build, 105 explore, 106 review-intent (the direction check 39's stop
rule sends it to).

**Core-change candidates:** docs/RULES.md, Core changes, Open candidates ((x) the option mode `lysJoint: 2` since run
2258, tried as the rule and kept an option in run 0518; (y) written and not proposed in run 0416; (z) written and not proposed in run 1406; (v) kept as the option `lysJoint`, (t), (s), (r)'s open part, (j), (l); settled there: (f),
(k) and the done ones, (u) and (w) in run 2221).

**Open follow-ups (not priorities; take when a run's kind fits).**
- Core review: the convention of reading a partner's current state is now used only by binding (the chain rules'
  same-pass reads left with them, run 2221; RULES, Locality audit). `pBond` is never below 1 (removing it changes the
  random stream only: take it with a change that changes outputs anyway).
- Speed (run 1721): a supply drive that keeps its stock outside the world, about 1.6x early in a run, changes
  outputs; decide it in a `build` that changes the setup.
- Suite time: 85 and 89 minutes per part in harden run 20261017-0902 (91 checks; 96 since run 1406, about 7 minutes more per part); physics is most of it (handoff
  above; a cell-distance cut in `_pairs` would rarely skip a cell: the pair reach, 1.39, is about a cell, 1.4). When a
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
node tri/check.js --cmd rosette-pay rosette-pay-cheat rosette-dot
                                                   # run 1302: the paying chain t@y!T alone and beside t@s!T; the closed
                                                   # partner C@s!T. entered beside the chain
node tri/census.js --partner runs/x.txt            # run 0726: rootless partners by plain letter ('immune': both free sides
                                                   # lyse), chain cells, cells in 3+ bodies (from 'body:' lines); chart:
                                                   # LC_PARTNER=1 node tri/linechart.js out.png FILES
NODE_OPTIONS='-r ./tri/bodyprobe.js' ...           # run 0726: 'body:' lines every 5000 steps, individuals by cells
                                                   # BP_RIGID=1 (run 1406): 'rigid:' lines, bodies joined by any bond
                                                   # (joints too) by their root cells
node tri/check.js --cmd bud-two bud-two-c          # run 1406: the kid that waits for its own kid (Y@&c@y@!): buds of two
                                                   # raised cells; control with the platform's plain site
node tri/check.js --cmd no-wait no-wait-r no-wait-c   # run 1602: where partners are scarce (C@s!T|, PADI 25) the head that
                                                   # does not wait for its partner (Y@&cy@!) wins entered both ways; control
NODE_OPTIONS='-r ./tri/waitprobe.js' ...           # run 1602: 'wait:' lines every WP_EVERY (10000) from WP_T0 (10000): per head
                                                   # type the mean wait for its front, its cut, its site, and kids lost
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
