# Idea notebook (typed-triangle world)

Ideas and design lessons for the typed-triangle simulation, most of them the user's. ROADMAP ranks the work; this
file keeps the reasoning so it is not lost. Add new ideas at the top of their section, with the date.

## The goal is complex evolution (user, 2026-10-05)

The user, during autorun run 20261005-0321: "I think the declared goal for you was something like get a replicator
that builds and feeds offspring until it can do it by itself. I am not sure it's a good goal. Maybe some direction to
work towards if unsure. The overall goal is to get complex evolution. If it looks different it is still welcome. The
more complex and the simpler the rules the better." So the organism below is a direction, not the finish line; work
is judged by how much evolves and how few rules it takes.

What evolution needs here, as of this run (notes, not the user's words): (1) **a world that does not stop**: every
`budcycle` world freezes once its food stock is spent (run 0321: blanks 0 by 1.0-1.4M steps, nothing happens after
1.6-1.9M), so a lineage has a fixed number of generations, not a population that turns over; (2) **heritable
variation that changes what is built**: today the strand (`aAaA`) is copied but encodes nothing the body uses, and the
kit is inherited by contact copying of the parent's parts, with no variant that copies itself; (3) **selection**:
variants competing for the same blanks, so the ones that copy faster or waste less take over.

## Think as much as test: concepts and prepared structures, small to big (user, 2026-10-07)

The user, during autorun run 20261006-2350: "Btw in general i think a lot more progress can be made often by
theorizing and think, not only small changes and many tests to try them out in practice. Much gain is new concepts or
ways to think about something. Thinking about and already preparing new structures (from tiny building pieces to large
ones with complex mechanisms). From small to big picture, practice and theory, some runs are needed for both."
So a slice should spend real effort on the idea before the batch: name the concept that explains a result (what makes
an individual, what sets its length), derive what follows from the rules, and design structures ahead of need, from
single part types to whole mechanisms. Runs then test a prediction instead of searching for one.

## A trap on the shared part: no head guards its own side, and the trap dies with its catch (explore run 20261008-1522, 2026-10-08)

NEXT priority 29, the plug guard: derived, then tested without mutation (INNOVATIONS run 1522). Notes, not the user's words.
- **No head design guards its own side.** A part bound to a side leaves it only by an `&` release (cut when that side's
  triangle hears no open signal; the side is then spent) or by lysis (by contact with a `!` side, whatever the bond, or
  relayed from a partner across a bond that is not a joint). A child and a plug differ at the bond only by `&`. An `&`
  on the head's own side fires when the head is complete, not when its child is (the head cannot hear its child across
  the joint), and spends the side: one child per head. A `!` there lyses the child too. Relay from the head would spare
  the child and take the plug, but lyses the head. So a plug leaves only when its individual dies.
- **The guard is a trap on the shared part.** A lysing site of the root's complement on the second cell (`z!`, evolved
  in run 0121 as a cheat that raises nobody, and the chain guard of run 0551) binds every free part with attach letter Z
  and lyses it: pool heads, chain copies, plugs. With it, 20 plugs `--Z@` entered into the head nursery were lost (4 of
  4); with the same cell carrying `q!` instead (no trap), the same 20 plugs left no head within 20k (4 of 4). Plug
  copies have at most 100 steps (decay) to find a free own side, and the nursery's own sides mostly hold a child, so a
  trap on every second cell keeps the plug's copies below replacement.
- **The trap dies with its catch.** A caught part without `&` is lysed by contact, and in the next pass its lysis is
  relayed back across the bond into the second cell and its head: the trap kills its own individual for every plug it
  stops. An altruist: while plugs are rare it costs nothing (pool heads carry `&`: their bond is a joint and nothing comes
  back), in an epidemic it is selected away. The one collapse of run 1351, rerun: trap carriers 95% of second cells at
  160k, then 59 of 247 at 175k while the plug `T!Z@i!` rose from 8 to 141 and trapless `C@i!T!`, `C@i!J!` took the rest;
  empty at 185k. With 200 plugs entered into a world of trap and trapless second cells, the trap share fell to 0 within
  5-10k and every world died (4 of 4). A guard that pays for each use with its carrier lasts only while it is not needed.
- **One-way lysis keeps the guard (candidate (w)).** If a lysis side passes no lysis back (`lysOneWay`), the trap
  survives what it lyses: in the same 200-plug worlds the trap took 98-100% of second cells and every world lived (4 of
  4), at about half the heads, with the plug endemic (170-200 attached). The parasite stays; the collapse becomes a
  burden. In the resumed collapse world the trap held in 5 of 5 continuations; the plug was lost in 1, endemic in 2,
  and 1 world died at about 200k.
- **Two trap sides end it under either rule.** With traps on both free sides of every second cell (`C@z!z!`) the same
  200 plugs were lost in 8 of 8, current core or not, with no dip in heads. The epidemic of B needed trapless second
  cells: their heads are the plug's reservoir, and the trap carriers' deaths feed them. So the current core's weakness
  is not the trap's strength but its cost: a trap is counter-selected exactly while it works. Under copy error a
  single trap is lost by one neutral error; two need two.
- **What it gives the goal.** A guard is a function selected only in the presence of its parasite; whether it lasts
  depends on who pays for its use. Under the current core the payer is the guard's carrier, so guard and parasite do not
  cycle: the guard collapses and the world with it. With one-way lysis the guard is selected during an epidemic
  (trap share up, not down), so a guard-parasite Red Queen becomes possible: next, whether copy error grows a second
  trap side, and whether the loop of run 1351 runs longer with one-way lysis.

## A common site is a target: the shared part's site letter turns over, and commons classes follow it (build run 20261008-1351, 2026-10-08)

The race of NEXT priority 28, measured under copy error (INNOVATIONS run 1351). Notes, not the user's words.
- **The race is decided by supply.** Copy error puts a given glue on a given side with probability pErr/318 per copy
  (a side 1/3, a glue 1/2, one of 53). The nursery mutant of the commons class (`I@&c@|z` to `I@&c@|i`) is one such
  change on one class's heads; a cheat of the commons is any change of the second cell's site side (pErr/3 per
  second-cell copy, a hundred times more, on the commonest part), and by 20k such variants are already about 5% of
  second cells by drift. So the cheats come first: no I nursery held in 16 worlds (one `I@&c@|i` head was seen once).
- **A common site is a target.** A side that something binds is no template, so whatever binds a site costs the
  site's carriers the copies made on that side, and second cells with another letter there win. Three kinds of
  binders arose: the commons class itself (a head whose root fits the site), the **in-place chain** (the second cell
  with its attach letter changed to the site's complement, `I@iz!` on i sites, `Mz!m@` on M, `E.z!e@` on E: one
  error, and it binds the site and offers it again, so it grows on its own tip), and parts that only bind it
  (`COz!` on o sites). Each is the commoner the commoner its site, so selection is negative frequency dependent: the
  commonest site letter is replaced by a minority one, which then becomes the commonest. The second cell's site side
  turned over in 10 of 16 worlds (twice or more in 8), i to M to V, i to m to a, i to o to i to X to f.
- **Where a parasite binds decides whether it is a sink or a turnover.** Run 0551's chains (`-zZ@` on the heads'
  own `z` sides) collapsed 4 of 4 worlds; here chains on the second cell's site collapsed none (predicted 2-6 of
  12). The head needs its own side (in-place birth is its heredity; a head that changes it is a cheat, lost within
  5k), so it cannot escape and needs a guard (a lysing tip, a release). The second cell does not need its site, so
  its carriers escape by changing the letter and the chain dies with its sites: a side nobody needs guards itself by
  turnover. The one collapse (1 of 16) came from the other kind: a plug `T!Z@i!` (a second cell's two-step variant
  with attach letter Z) on the heads' own sides (priority 27).
- **The commons door reopens by itself.** Turnover drives the new letter to nearly every second cell (M, m, Q, b:
  98-100% of second cells), exactly the condition under which a commons class of the complementary root invades (run 1021:
  80-100% of sites). The class comes from the nursery by one root error (`Z@&c@|z` to `q@&c@|z`, pErr/318 per head
  copy, about one per 100-200k steps at 0.005). Seen: Q on all second cells from 125k, a `q` class from 215k, 84% of
  heads at 250k (seed 5); `M@&c@|z` on m sites at 420-480k (seed 3, after m and a had alternated four times); in the control without any entered class, an I class by mutation on the starting i sites
  (52% of heads, seed 4 at 0.01). So the loop runs by mutation alone: site sweeps prepare commons classes, commons
  classes (and chains) end site sweeps.
- **The nursery is also one error from every commons class.** In seed 6 the I class took every head (the Z nursery
  extinct by 65k; individuals fell from about 420 to 250-330: pool classes alone are less productive), an N class
  arose on n sites and lived beside I for about 80k (two classes on two site letters: run 1821's bound, classes at
  most the resources, reached by evolution), then a head with root Z (`Z@&c@|z` is `I@&c@|z` with one root error)
  re-founded the nursery and had every head within 10k.
- **What it gives the goal.** A Red Queen of letters that needs no designer: root letters of commons classes and site
  letters of the shared part chase each other, with the in-place nursery as the stable base it returns to. It is
  turnover, not growth in complexity: every class has the same shape. Complexity needs classes that differ in what
  they do; the next lever is a variant that changes shape (a third cell, a second site) and is selected inside this loop.

## A site on the shared part is a commons: a class born there beats the nursery, and the part's cheats turn it back (build run 20261008-1021, 2026-10-08)

Derived, predicted wrong, then measured in the head-nursery world (INNOVATIONS run 1021). Notes, not the user's words.
- **The prediction and why it was wrong.** Before the batch: in the head nursery a new root letter X can only start as a
  pool class (`X@&c@|z`: its copies are born on its own `z` side, cannot bind it, and must reach an x site on a second
  cell within at most 100 steps, `PAD=1`), against a resident born about 0.9 in place; so X is at best near neutral.
  Measured: with the x site on every second cell, 10 X heads replace the nursery in 4 of 4 by 70k. The theory compared
  success per copy and left out the copy rate: a nursery head's own side holds its child until the child catches a
  second cell, and that whole time it is no template; a pool head's side stays free, because its children wait on second
  cells. Raising costs copies (run 0121); a class that raises on a shared part puts that cost on the shared part.
- **A site on the shared part is a commons.** Every individual carries one second cell, copied in the pool and caught by
  any head with the right front, so a site on it is a nursery for whatever root fits, owned by no class. A head nursery
  owns one private site per head (its own side, which its in-place births nearly always fill). A class born on the
  commons out-copies the nursery while most of the commons' sites are free: with i sites on 37-46% of second cells, 10 I
  heads were lost (6 of 6); at 80-100% they invaded in 9 of 10 (20 entered: 4 of 4). One head alone: 1 of 8. An I nursery
  (`I@&c@|i`) with the same sites replaced Z too (3 of 4); without them it drifted (lost 2 of 4).
- **The commons has its own cheats.** A second cell whose site holds a waiting head is no template on that side, so as
  the commons class grows, second cells without the site are copied more and spread (plain ones from 4% to over 90% of
  second cells within 20-30k); the class loses its births and dies out, and the nursery, whose births never used the
  commons, returns (4 of 4 when plain second cells are there while the class grows; the class at 76-86% of individuals at its peak). Negative frequency dependence
  across two levels, classes of heads and types of second cells, from one rule (every free side is a template): the
  first loop of its kind here. Without mutation the plain cells can drift out while the class is rare (2 of 4), and then
  the class keeps the world.
- **Two doors for a new root letter.** (1) The commons door: a site of the complement common on second cells, then a
  root mutant of that letter. Stockless founder world (run 0651, and here at `pErr` 0.005: Z, m, x in one world, each
  after its seed site spread on second cells). (2) The own-side door: a head carrying a site on a side it does not need
  (the founder head's inert side) is a template whose copies are born on that site, so a copy with the complementary root
  binds in place: one error founds a nursery of a new letter (stockless world at 0.005, seed 1: heads `C@|DZ@&`, then
  `C@|Dd@&`, 323 heads 10k later). In the head nursery the own side is the class's heredity (a head whose own side
  changes is a cheat, lost within 5k: run 0551), so door (2) is closed and only (1) is open.
- **Why the long mutation worlds kept Z (8 of 8 to 480k at `pErr` 0.005 and 0.01).** Door (1) needs a root mutant of
  exactly the right letter while its site is on most second cells, and then a 1-in-8 establishment. Site letters
  drifted up to 30-73% of second cells; only one world held one above half for long (L, 60-73% for about 300k), and two
  `l` roots appeared there and were lost. About one mutant of a given root letter per 100k steps at 0.01 (head copies per
  step times pErr/6/53), so turnover in the head nursery is a matter of millions of steps: supply, not a barrier.
- **Rate against place.** At `pErr` 0.005 (copy errors 104 by 20k, the mutagen's 123-131) root letters turned over in 2
  of 4 stockless founder worlds, as at 0.01, against 1 of 8 under the mutagen (run 0121). So the rate alone does not explain the
  difference; the place is the remaining candidate (copy error acts on each part as it is made, the mutagen on free
  parts).
- **What it opens.** All parts of a Red Queen of letters now work in one world: the commons class invades the nursery,
  commons cheats turn it back, and a commons class becomes a nursery of its own letter by one error (`I@&c@|z` to
  `I@&c@|i`: the mutant's copy goes once to the pool, then raises in place). Under copy error the question is a race:
  does the commons class become a nursery before the commons' cheats remove its sites? If it does, letters cycle; if not,
  the old nursery returns.

## Variation where copies are made: copy error moves the head, and root letters follow cheat letters (explore run 20261008-0651, 2026-10-08)

Copy error in contact copying (`pErr`, RULES Core changes, run 0651) in place of the free-part mutagen; checked in
INNOVATIONS run 0651. Notes, not the user's words.
- **Where mutation acts decides what can evolve (confirmed).** Under the free-part mutagen no head of the head nursery
  varied in 4 worlds of 240k (run 0551); with copy error at 0.01 per copy, head variants were in bodies in 4 of 4 by
  60k, and the founder head fell below half in 2 of 4 by 240k. The rate is per copy, so the parts copied most vary
  most, wherever they are born.
- **Most head changes are lethal, but the survivors are not rare.** Predicted: about 1/6 of head errors neutral (marks on
  sides whose role does not depend on them), the rest lethal or a cheat. Seen: two neutral heads took large shares
  (`Z@&c@z`, a front without anchor, 99.6% in one world; `Z@&|c@|z`, an anchor on the root, which is bonded or spent all
  its life, 56% in another), far faster than drift in 430 well-mixed individuals would give (0.4 N generations in
  240k). In-place heredity makes a population of clonal lines (each head raises its children on its own side), so
  drift is fast: the effective size is far below the census. Entered as 10 without mutation, `Z@&c@z` was lost in 4 of 4
  and the neutral marker in 3 of 4: both neutral, the sweeps drift.
- **A cheat's seed site is a stepping stone for a new root letter.** In the world without stocks the root letter turned
  over in 2 of 4 worlds (one world three times: Z, I, y, g) and began to in a third, where the mutagen kept it in 7 of 8
  (run 0121). Each new root letter was the complement of a seed site that had spread before it as a cheat (a seed site
  of another letter raises nobody and so spreads, run 0121). A root mutant that fits a common cheat site finds many
  free sites that no other root can use: an empty nursery, so no Allee barrier. Then the old letter's sites raise
  fewer roots and are the cheats of the new class. This is the Red Queen of letters that priority 21 looked for, through
  a different door: the cheat is not letter-specific, but it makes letters available.
- **Order decides: cheat first, then root.** Tested without mutation: I roots entered after `i` cheat sites had spread
  held beside the Z roots in 4 of 4 (about half the individuals); I roots entered with their own `i` second cells but no
  cheats first were lost in 4 of 4, while those `i` cells spread on as cheats. A rare class wastes its parts (run 1921)
  unless the sites it needs are already common, and in this world sites are made common by being cheats. So a new
  class is not founded by a lucky root; it is prepared by a cheat that spread on its own. Caveat: copy error at 0.01 is
  about twice the mutagen's supply in this world, so "copy error turns letters over, the mutagen did not" mixes rate
  and place; a run at `pErr` 0.005 would separate them.
- **The nursery's weak point is a plug.** In one world the evolved nursery `D@&c@|d` died: a part `--D@` (the second
  cell's attach letter changed to the nursery's root letter, no other glue) binds a head's own seed side and never lets
  go, so in-place birth stops; its copies come from its two inert sides. The lysis rule of thumb (run 0551: every side
  a part's own copies can bind needs a release or a lysing tip) applies to the head's own side too: a plug cannot be
  lysed by the head that holds it.

## In-place growth without a release is a sink; in-place birth starves a free-part mutagen (build run 20261008-0551, 2026-10-08)

Checked in the head-nursery founder world (INNOVATIONS run 0551). Notes, not the user's words.
- **In place is a mechanism, not a design.** A part whose attach side complements one of its own free sides is born in
  place: the copy made on that side lets go and binds the same side at once. The head nursery is one case (`Z@&c@|z`).
  The second cell is one letter away from another: `C@-z` with its attach letter changed to Z is `-zZ@`, which binds
  any free `z` side and offers one. It has no release, so its in-place copies stay: a chain that grows from its own tip
  on every head's `z` side, holds the material (11 blanks left) and blocks the heads' nursery. The world collapses
  about 10k after the first chains (4 of 4 without the lysis mark). Run 0121's chains (`-zZ@` among them) preceded both
  collapses there.
- **A lysing seed site is a chain guard.** With the lysis mark the same mutant is `-z!Z@`: the copy binding its tip is
  lysed, so the chain stops at one cell. So `z!` did two things in the evolved design: it raised nobody (a cheat, run
  0121) and it made the one-letter chain mutant harmless. A rule of thumb for designs: every side a part's own copies
  can bind needs either a release on the part or a lysing site at the tip.
- **In-place heredity keeps cheats out, and keeps rare nurseries out too.** A head without the `z` side sends every copy
  to the pool, where host `z` sides are nearly always taken by the host's own copy: lost within 5k (4 of 4). The
  same arithmetic works against a rare nursery among founders: its free `z` sides are seed sites for the founders'
  pool roots (λ 0.3 there), so 10 nursery heads were lost in 2 of 4; in the other 2 they took over within 15k, after
  their lysing second cell had spread among the founders and killed founder roots raised on it. A priority effect: who
  is common wins.
- **Where mutation acts decides what evolves.** The labelled mutagen hits free parts. In the head nursery nothing is
  free for long (at 240k no free part but blanks), so the head was never varied in 4 worlds of 240k: a stasis, not
  because variants lose but because none are made. The second cell, caught from the pool, still drifts. To let an
  in-place lineage evolve the mutation must reach attached parts: an environment drive on unbonded sides of attached
  parts (somatic mutation that is heritable, because a template's copies take its whole type) or copy error in
  contact copying (candidate (r), core). Prediction for either: the head is under strong stabilising selection (a
  changed front cannot bind its own copies' side; `z|` leaves a head with no template side; `z.` raises nobody), the
  second cell drifts as now, and new things come from the second cell's inert side (a glue there is a second site).

## A nursery is a crowd; a nursery in place is heredity (build run 20261008-0121, 2026-10-08)

Derived first, then checked in the world without stocks (INNOVATIONS run 0121). Notes, not the user's words.
- **Every free side is a template, whatever the part does.** Contact copying copies an attached part through each of
  its free sides that is not an anchor, so a part's share changes only through (i) how many templates it shows and for
  how long it stays attached, and (ii) where its copies land relative to the sites that take them. A seed site is a
  public good: it raises whatever root arrives.
- **A nursery is a crowd.** A host carries a waiting head on its seed site much of the time (36-44% in the stockless
  world); that head is a template too and shares the blanks that reach the host. So a body that raises nobody keeps its
  blank flux for its own parts and is copied faster (measured 1.2-1.5 times) and, under the whole-body hazard, dies less
  (no bud to be hit with). Raising costs copies: the cost of reproduction in this world.
- **Hence cheats hold at a balance, and the balance is set by heredity.** With c the cheat's copy advantage, D the
  host's death rate over the cheat's, λ the share of a host's births whose part comes from its own parent, host births
  B(λ + (1-λ)(1-p)) and cheat births B(1-λ)p (p the cheat's share of the free parts) give a cheat that invades iff
  D c (1-λ) > 1 and settles at r* = (D c (1-λ) - 1)/(c λ) cheats per host: a stable, frequency-dependent coexistence.
  Measured λ for the root: 0.30 when the seed site sits on the second cell. Cheats spread in 27 of 28 invasions (`q|`, `z!`, `z|!`), a
  marked host in 0 of 8 (above 20%).
- **The cheat is not specific to a letter, so there is no Red Queen of letters.** Any second cell that raises nobody
  is a cheat of every host with the same front; it is made by mutation from the host's own parts. A host that changes
  its seed letter makes cheats of its new letter at the same rate. (b) and (c) of priority 21 fail for this reason.
- **A nursery in place is heredity.** If the seed site is a template of the very part it raises, a parent's copies
  are born at its own seed site and bind it at once: births in place 0.90 (against 0.30). Then (1-λ)c is far below 1,
  and cheats cannot get in. Evolution found this in 4 of 8 stockless worlds: the head's plain side became the
  complement of its own root (`Z@&c@|z`), so heads raise heads on their own side, and the second cell, no longer a
  nursery, took the root-lysing seed site (`-z!C@`) that had spread as a cheat. Once there it held (to 720k in one
  world). It is the body plan the stocks made impossible (a stock part never mutates).
- **What it opens.** (1) A world started from the evolved design: in-place heredity should remove the Allee barrier of
  a rare class (IDEAS run 1921: a rare class wastes its parts in the pool; in place there is no pool for the root), so
  a second head-nursery class might invade where none could before. (2) Length arose by mutation in 3 of 8 worlds as
  chains of second cells whose attach letter complements a seed site (`-zZ@`, `-P|p@`, up to 6 cells), and both
  collapses followed it: a chain that never lets go is the stockless world's sink, as heads that never let go were the
  stock world's at 3x.

## Twenty slices on the pair: the web is bounded by resources; the stocks block coevolution (direction check, review-intent run 20261007-2021, 2026-10-07)

Weighed after priorities 10-20 (runs 1920-1921). Notes, not the user's words.
- **The core is not growing; the slices now combine.** Since run 1920: 6 marks, 3 relayed signals, 4 exposed values,
  2 states, plus one option (`copyGlue`, a negative, for the core review to remove). Eleven slices came from
  combinations, and since run 0420 nearly all of them run in or beside one standard world (`PAW=1`), each building on the
  last (the hazard's unit, the census, classes as cycles of letters, kinds as food, rare classes). Run 1851's worry,
  results in five settings and no world carrying them all, is settled. The environment grew a little (pair options 29
  to 31; 52 checks, 17 of them controls; the suite about 105 minutes, three quarters of it the frozen lineage).
- **The web-size line has reached its bound.** Priorities 15 and 18-20 asked why the standard world holds one class and
  answered with one statement, derived and measured: contact copying makes every part from a blank, so kinds as food add
  no resource (a catcher farms its catch), private letters separate nurseries but not food, and private recycling is a
  stock a class grows for itself, not a supply. **The classes that coexist are at most the limiting resources**, and a
  new class that catches only parts it makes cannot invade (a rare class wastes its parts). The one candidate left in the
  line, a by-product that one class makes and another catches, is the host-catcher link `web-two` already shows; a third
  level needs 3-cell kinds (the cap, run 1821). More slices there would measure the bound again.
- **Prepared structure doing the work: the stocks.** The standard world's only resources besides blanks are the stocks
  C, E, G: prepared, never decaying, never mutating, and carrying every host's seed site `z`. By the bound, every class
  beyond the first stands on a stock. And because a stock part never mutates, **a host can never change its seed
  letter**: run 0420 saw it (the parasite privatised its seed letter, the host could not), run 0820 called it
  saturation (every stock carries `z`). The stocks were added to make diets (run 1620); they now hold the world in one
  class.
- **Bodies have not grown.** Still 2 cells. Every attempt at length lost for one reason: a body pays per cell, in
  catches from a decaying pool (run 2350's shortcut, run 0622's arc with three catches per birth, a middle's seed site
  that deadlocks, the whole-body hazard taxing long waits), and heredity is by part type and recognition, so nothing
  copies a body as a unit. Length must earn its catches through a function only a longer body has; none is known yet.
- **What is missing: an interaction whose payoff depends on frequency.** All interactions so far are exploitation of
  blanks and nurseries (the commoner or the lower R* wins; equals drift), and farming. Ecology's routes past the R*
  bound without new resources are frequency dependence (an enemy specific to its host grows where its host is common:
  kill the winner, host-specific pathogens) and space. Frequency dependence is also the classic engine of evolution
  that does not settle: a host escapes its enemy by changing, the enemy follows (a Red Queen), and defence is a
  function a body can have, which could be the first reason for length.
- **The cheapest such enemy already arises: the nursery cheat.** A cheat is a head with a host's attach letter and no
  seed site of its own: it takes the host's seed sites and raises nobody (run 0820: 1-20 cheats per world, the plain
  catcher outnumbering hosts 2-3 to 1 under the whole-body hazard). It is specific to one seed letter, so it is common
  where its letter is common. A host lineage escapes by changing its letter pair (attach letter and seed letter), which
  arises in two steps through a neutral seed-letter change (run 1720, seed 2: `N@&c@|x`, then `X@&c@|x`); the cheat
  follows by one mutation (its attach letter). Predicted, in a world where seed sites are copied: the commonest seed
  letter turns over again and again, and two or more host classes coexist on blanks alone, each held down by its own
  cheats. In the stock world neither can happen: the seed sites are on stock parts.
- **Order chosen** (NEXT priorities 21-23). 21 (build): the standard world without stocks, founder the pair with the
  standard letters (`Z@&c@|-`, `C@-z|`; the stock part `C@-|z|` has no copyable side, so it cannot simply be left
  unstocked), all other drives as now; tests (a) letter-specific cheats arise, (b) the leading letter turns over, (c)
  two or more classes at once. If (c) holds, the stockless world becomes the standard (one drive fewer, nothing
  prepared but blanks). 22 (explore): the cause of whatever fails; if letters do not turn over, killing as the
  frequency-dependent enemy. With 2-cell kinds a killer gains only what cannot be copied (every part a 2-cell body holds
  exposes its copy side, so a catcher already makes what it could kill for): blanks freed near it, a nursery, or, with a
  third cell, a prey whose copy side it covers. Two obstacles in today's rules: the drive `PAHB=2` turns every lysed
  triangle into a blank (a killer would make food for everyone); and the holder of a `!` side hears its victim's lysis
  across their bond unless that bond is a joint (sim.js), so it is cut loose with its prey. 23: length as defence, a
  third cell over the host's open site once cheats or killers take it. Designed, not demonstrated.
- **Not chosen.** More classes through more prepared stocks (sideways, prepared); body length by more catches (the
  pool's cost per cell is the reason it lost); reopening the 47-type organism (its sinks are unchanged).

## A rare class wastes its parts; private recycling is not a resource (explore run 20261007-1921, 2026-10-07)

Derived first, then checked (INNOVATIONS run 1921). Notes, not the user's words.
- **Private recycling, the idea.** With candidate (t) (a glued copy side binds only a side with the complementary glue)
  and dead triangles returning as blanks that keep their glues (`PAHB=3`), a cell whose exposed copy side's glue
  complements one of its own glues is copied from its own dead material and from no one else's: each class would make a
  resource for itself, so the web could hold more classes than the world's foods.
- **Why it is not a resource (theory, and the runs agree).** A class makes its lettered blanks from its own deaths and
  its material from plain blanks, so nothing enters it from outside: at a given level of plain blanks its growth is
  still proportional to its size, and two classes cannot both be at rest on one plain level (run 1150's R* argument
  holds). Recycling lowers a class's leak (material leaves it only as undelivered copies that decay); it is a stock a
  class grows for itself, not a supply. Measured: two equal private classes exclude each other by 15-30k as fast as with
  (t) off (4 of 4 each), in both designs (an in-place head, and a pair whose copy sides are close-only).
- **Sources out of proportion to use, again.** A dead in-place head (`U@&C@|u`) returns a blank whose only template is
  a free `u` site, and that site holds a bud most of the time: head material piles up as blanks (800-900 of 1000) and
  the world dies (4 of 4 without a decay of letters). The pair whose copy sides are close-only (`X@&d@|x.` on `D@x|d.`)
  has no such sink: a template no bud sits on.
- **A rare class wastes its parts (an Allee effect).** Two classes of one design, each catching only the second cells
  it makes itself, hold 150-200 individuals each for about 10k and then one falls from about 130 to under 15 within
  5k, the majority winning: about 15 generations, where neutral drift at 360 individuals would take hundreds. The cause
  is the part pool: a class's free second cells decay (or drift away) before its waiting buds catch them, and the
  fewer its waiting buds the larger the share lost, so per capita births fall as a class becomes rare. Evidence: with
  no decay both classes are still there at 80k in 3 of 4 (0 of 12 with decay 0.1, 0.3 or 1); stirring the pool makes
  exclusion faster (gone by 10-20k, 4 of 4): clustering helps a class deliver its parts near its own buds.
- **What it explains.** Every new class starts rare, so a class that catches only parts it makes cannot invade: run
  1821's farmer of a private crop never held (0 of 8) but held when it entered first (4 of 4), and "whoever is in first
  keeps the blanks". A class whose parts others make in plenty (a stock, the hosts' heads that the u catchers take) has
  no such barrier: web-three's classes are all of that kind.
- **What this asks for.** A web grows where new classes can invade, so a new class should catch parts that are common
  already (another class's products, a stock) or get its own delivered without a pool (in place, which contact copying
  gives for one part per gap: IDEAS run 0622). The second resource made by kinds stays open: a part that one class
  makes as a by-product and another catches (kinds as food, with the farmer limited by something other than blanks).

## Every catcher farms its catch; classes are at most the limiting resources (build run 20261007-1821, 2026-10-07)

Derived first, then checked (INNOVATIONS run 1821). Notes, not the user's words.
- **Exposure does not depend on the holder.** Contact copying reads the free sides of attached triangles. Once an
  individual is complete, every `&` side in it is spent (the release spends all `&` sides of a triangle that hears no
  open signal, bonded or not), and a caught head's front is bonded. So a head exposes exactly one copyable side, its copy
  side, whether it sits in its own individual or in a catcher's. **Every catcher of heads farms them**: each catch is
  also a template of its prey, copied as often as in the prey's own body. In a 2-cell body nothing can cover the
  prey's copy side, so no predator can avoid making its prey; if that side is the prey's in-place seed site, the
  predator also raises prey buds.
- **The front bond is symmetric and alternates letters.** A waiting bud's open front `x@|` catches free parts with
  `X@`, and a free head whose front is `X@|` is caught by waiting fronts `x@|`: two kinds of heads on one letter pair
  eat each other (web-two holds both U+Z and Z+U). A catcher of catchers has the complement of the complement, the
  first level's front, so it eats the first level's stock as well (a third level of catches is a second host). And a
  head caught by its root is no catch: it completes and lets go (a front is a nursery, run 1720).
- **Every catch is made of blanks.** A head is a copy blank that touched a copy side, and a farmer's crop is copied
  from blanks at its catch's copy side. So every catcher of heads, whatever its letters, draws on one resource: the
  blanks. A stock part is a resource of its own (prepared, never made, never decays). Competitive exclusion (run 1150's
  R* rule) then bounds the web: **the classes that can coexist are at most the limiting resources** (blanks, and each
  stock a class has to itself). Kinds as food add no resource. Run 1720's "classes are at most the separate foods"
  is this rule, with blanks counted as a food.
- **Measured** (the web-two world: u catchers entered at 10k, a third kit at 20k, 80k, seeds 1-4 each). A farmer of U
  heads (`V@&c@|v` holding a U head) died out by 25-30k in 4 of 4: it shares the hosts' stock C and U's blanks. A second
  farmer of Z heads (`W@&C@|w`) made 3 classes and 3 links for 20-30k in 3 of 4, then one of the two farmers excluded
  the other (drift between equals). A farmer of a private crop (`X@&D@|x` holding `d@|-Y@&`, or its crop rooting on
  `z`) never established, 0 of 8: U had drawn the blanks down from about 600 to 31 of 1000. Entered first, while blanks
  were plenty, X held in 4 of 4; U then excluded it in 2 of 4 and never got in in the other 2 (X itself died out by
  60-100k there): whoever is in first keeps the blanks. The N host on a fourth stock K beside host and u catchers
  made 3 classes at every census from 30k to 80k in 3 of 4 (seed 2 until 70k): three classes on three resources (new
  check `web-three`).
- **No third level with 2-cell kinds; designed, not demonstrated, with three.** A predator that does not farm its prey
  needs a third cell over the prey's copy side: for U prey, a cap part `U@--` bound to the U head's `u` (a non-`&`
  attach side stays). Caps are copied from their own plain sides (blanks again) and cap every free `u` site, the
  prey's own nurseries included, so they would sterilise the prey. Not built.
- **What this asks for.** The web grows with resources, not with kinds. Contact copying makes every part from a
  blank, so a resource that is not blanks has to be a part nobody copies (a stock, prepared) or a second kind of blank (candidate (t), a copy side that reads glue: blanks that copy
  only sides of one glue are a resource of the kinds that carry it). A weaker route is a supply set by another class's
  deaths: without `PAHB=2` the lysis rule returns parts as themselves, so a scavenger's food would be what a class's
  deaths release (a flow set by the hazard, not by blanks; whether it limits anyone is open). The first two are the
  way to more classes; the second is a core change (make the case under RULES Core changes).

## A class is a cycle of seed letters; a seed site on a head's copy side roots in place (explore run 20261007-1720, 2026-10-07)

Derived first, then checked (INNOVATIONS run 1720). Notes, not the user's words.
- **The letter graph.** Every held kind joins its root letter (the glue of the `&` side it bound by) to every seed
  letter its cells carry (glued sides that are not attach, close-only or copy sides). The census's classes of kinds are
  the cycles of this graph of letters. Two things follow. A cell carries its seed letter into whatever individual holds
  it: a stock part's `z`, or a caught head's own site. And a letter on every stock part is one node that every stock
  eater with a `z` root passes through, so the standard world's hosts are one class whatever their diets (run 0820's
  saturation, explained).
- **What owning a letter takes.** A seed site that only the class's cells carry, and no cell of the class carrying
  another class's letter. A head has one free plain side (its copy side), so on a head-and-stock kind the first means
  the seed site is the head's copy side (`N@&c@|n`); the second means a stock part with no seed site (`K@-|-|`).
- **A seed site on a copy side roots in place.** A blank that copies the head at `n` takes the head's type turned about
  the shared edge, so the copy faces its parent with its own `n`; free from the next pass at almost no distance from
  the site, it binds there by its root (binding places a part in any orientation). So the class's copies seldom reach
  the pool and its letter stays its own. The cost: a bud is committed before its part is caught, its own `n` is copied
  while it waits, and the whole-body hazard charges the parent for every waiting bud. Measured alone on `K` (30k): 69%
  of all binds in place, falling to 24% as cheats (`IN@&k@|`, the site lost) and catchers take over.
- **Measured.** The n class of 1x seed 3 is such a kind, arisen by mutation and without any stock: `E@Nn@&` roots by
  `n@&` on its parent's `N` and catches a copied head `Z@&e@t` (two classes at every census from 145k, when the stock
  host died out there). The designed N host on the shared stock C keeps its own class in only 1 of 4 (merged in 2:
  catchers `Z@&C@` that hold an N head are raised by `z` and raise `n`, and every N individual raises `z`). On the
  site-free stock K it is a second class in 4 of 4, linked to the host class in 2 censuses of 80 (checks `own-letter`, `own-letter-c`).
- **Owning letters does not make the web grow** (both predictions of this run wrong). With a private seed letter on
  each stock (`y` on E, `x` on G) no second class arose by 240k (0 of 4): the one-mutation diet switch `Z@&e@|-` raises
  `y`, which no head takes, so it is a cheat and never held, and the class needs a second mutation on it. In the
  site-free world (every stock without a site, the founder the N host, so every class must own its letters) the web
  stayed one class at every census of the second half (4 of 4; one world died out at 125k). New private classes do
  arise, in two steps through a neutral head that changed only its site letter (`N@&c@|x`, then `X@&c@|x`; seed 2,
  and `M@&k@|m` beside N on K, seed 4), but they compete for the same stock and replace the old class (X replaced N in
  seed 2). **Classes are at most the separate foods**: private letters separate nurseries, not food. N on K beside Z
  on C coexist (4 of 4) because both letters and stocks differ.
- **Fronts are nurseries too.** An attached `@` side binds any free part's complementary `@` side, so a waiting head's
  open front `k@|` raises any part with root `K@&`. In the N-on-K world seed 3 the host class turned into `K@&c@|` heads
  rooting on waiting N heads' fronts and taking their place, and the N class fell to 27 individuals by 120k. The web
  census counts them as unraised cheats: it reads only plain seed sites.
- **What this asks for.** A web larger than its foods needs kinds to be food for kinds: catcher classes that own their
  letter (in-place, as the u catcher `U@&C@|u` of check `web-two`) eating another class's free heads, and catchers of
  those catchers. That is the next question: does a third level hold?

## The whole body as the hazard's unit; the strength is a second knob (build run 20261007-1351, 2026-10-07)

Measured (INNOVATIONS run 1351). Notes, not the user's words.
- **Unit and strength are separate.** Two things changed at once in run 0820: the unit (the hit individual's whole
  body) and, through it, the kill rate (about half the individuals). Matching the kill rate separates them. At 3x the
  hazard per individual collapses into chains at the matched h 0.15 as at 0.1, and the whole body at a gentler 0.07
  keeps as many individuals as the old standard (900-1300) with no chain. So the unit stops the chains: a chain hit
  anywhere dies whole, so the hazard no longer splits it into two growing chains.
- **Too strong a hazard is its own failure, at either unit.** At 1x the whole body at 0.1 lets plain catchers replace
  the hosts and then starve (1 of 4 extinct, 2 of 4 lose their stock hosts), and the hazard per individual at 0.15
  collapses into chains (1 of 4). A harsh hazard favours whatever pays least for it: kinds that carry no waiting bud,
  and aggregates that multiply by being cut.
- **What the whole body charges.** A body pays per individual it holds, and loses all of them: a parent with a waiting
  bud pays twice, a 4-cell arc whose bud waits for three catches pays for the whole wait (7-29 arcs at 30k against
  84-96 at h 0.03). So the whole body selects for short waits: buds that complete and let go soon. That fits the goal
  of individuals that separate, and it taxes long kinds whose buds wait for many catches.
- **For the next slices.** The standard world now has no growth of chains at either size, so a world can be run longer
  and larger before its end state. Cheats still outnumber the class in most worlds; a class that owns its seed letter
  (priority 18) arose once by mutation (1x seed 3: an e-diet host with seed letter `n`, two classes for most of the
  second half).

## Recognition classes merge; completion is optional (build run 20261007-0820, 2026-10-07)

Derived and measured (INNOVATIONS run 0820). Notes, not the user's words.
- **What a class is, read from the world.** A kind *raises* another when one of its seed sites takes the other's root
  (the `&` side that bound it). Recognition joins kinds in both directions only where they raise each other, so a class
  is a strongly connected set of the "raises" graph (the first census joined kinds by any binding and every world read
  as one class: a single kind that raises both sides bridges them). Between classes a link is one-way (a class whose
  sites raise another's heads: a nursery) or a catch (a front of one binding parts of the other). A cheat is raised and
  raises none of its raisers: the plain catcher, and any head whose seed site lost its letter.
- **Why the web stays at one class.** Every stock part carries `z` (stocks are exempt from the mutagen), so every
  individual that holds one raises the Z class. A catcher individual is two heads, and either may be its root (a catcher
  head catching a host head, or a waiting host head catching a catcher head as its part), so a kind of catchers is
  raised by both letters. A new private class (an attach letter and the seed letter that takes it, both changed) stays
  separate only while none of its kinds holds a stock part or a host head with a `z` site and no host offers its
  letter. Measured: 1 class at every census in 3 of 4 worlds at 1x; a private class in 1 of 4 (5 of 48 censuses); at 3x
  a private class in 4 of 4 (catchers s, x, C, and once a host that put its own seed letter `b` on its head), each
  merged into the host class within 15-45k. The web does not grow; it saturates at one class whose kinds turn over,
  with cheats from 1 to 20. Predicted (at most 2 classes, 0-1 links; NEXT before the runs), right in shape.
- **Completion is optional in the core.** A head lets go of its parent's seed site only when it hears no open signal,
  so a head whose front catches nothing stays on its site. Contact copying still copies it (every attached triangle's
  free sides), its copies take the seed sites of the chain, and the hazard splits chains (a hit lyses one individual,
  and a never-released head is an individual of one cell). Growth plus splitting reproduces it with one blank per cell
  and no catch: the lowest R* for blanks (run 1150's rule). At 3x, 3 of 4 standard worlds ended this way between 180k
  and 205k (blanks 20-50 of 3000; chains `X@&i@!x`, rosettes of `C@&c@z@!` whose open `z@!` sides lyse the host heads
  they catch); run 0621's 3x flow world ended the same way (rosettes and arcs). At 1x the same mutants are 3x rarer and
  none took over by 240k. The hazard per individual (run 0420) does not stop it: a chain of n one-cell individuals is hit
  n times, but each hit makes two chains.
- **The whole body as the hazard's unit (`PAHU=3`, a labelled drive).** If a hit lyses the hit individual's whole body,
  joints included, a chain of n heads is hit n times as often and dies whole each time: it cannot split, so it cannot
  multiply. What it costs: a parent carrying a waiting bud is hit twice as often and loses both. So it pays to raise
  nobody: the plain catcher (a cheat, no seed site, never carrying a bud) outnumbers its hosts 2-3 to 1.
  Measured at 3x: complete individuals in 4 of 4 worlds to 240k (1 of 4 with the hazard per individual), and one world
  held two or three classes for most of its second half, splitting and merging. It also kills more (about half the
  individuals), so its effect is not yet separated from a harsher hazard (separated in run 1351: the unit, not the strength;
  see above).
- **What this asks for.** Complexity in this world has two enemies found so far: kinds that raise nobody (cheats,
  favoured whenever raising costs) and heads that never let go (favoured whenever splitting a body is a birth). The
  whole-body hazard removes the second at the price of feeding the first. A web of several classes needs a seed letter
  a class can own: a stock part with a private seed site (a prepared start) or a host that carries its own seed site
  on a copied cell (the B host at 3x, seed 3: `B@&c@|b`, which then replaced the Z class).

## A bud gets one part by place and the rest by recognition; a catcher arms its host's diet (explore run 20261007-0622, 2026-10-07)

Derived first, then checked (INNOVATIONS run 0622). Notes, not the user's words.
- **What "in place" can mean.** A copy is born in the site beside its template's side (the template turned 180 degrees
  about the shared edge) and is free from the next pass; it binds where its centre comes within capture (0.6) of a site
  beside a side with the complementary glue. Within 0.6 of its birth site lie only that site and its three edge
  neighbours (0.58 away; every other site is 1 or more away). So a copy can land before it drifts into the pool only
  beside a cell three or more bonds from its template (the honeycomb of cells has no cycle shorter than six): the far
  end of a 4-cell arc round one vertex (born in the arc's two-site gap, it binds in the gap's other site), or the far
  end of a 5-cell arc (born in its one-site gap, it binds there).
- **No whole bud by place.** For a kind whose cells have distinct types, a bud made entirely of its parent's own copies
  delivered in place would be the parent moved by a rotation or translation of the lattice under which every cell moves
  at most two sites through a free middle site. Translations by a unit step: every up-triangle's middle site lies in one
  fixed edge direction and every down-triangle's in another, so no body cell may have a neighbour in those directions:
  only isolated pairs, and then parent and bud do not touch, so the bud's first cell has nothing to bind. Rotations move
  a cell far unless it lies within 1 of the centre (60 degrees about a vertex), 0.58 (120 degrees) or 0.5 (180
  degrees): only the cells round one vertex or one triangle, whose images overlap the parent or whose middle site is a
  parent cell. Checked by enumeration (every body of 2 to 5 cells, every motion): 3-5 cells, none; 2 cells, 6, none
  touching its parent. So **contact copying gives a bud at most one cell per gap from its own parent** (its root, by a
  4-arc; or its closing cell, by a 5-arc); the rest comes from the pool. A kind whose cells share one type escapes this
  (each copy binds beside its own template): one-type chains and rosettes are the only heredity by construction so far.
- **The 4-cell arc, built** (`Z@&t@|- T@-a@| A@-b@| B@-z|`: head, two middles, an end whose seed site `z|` faces the
  gap; each cell's one copyable side outward, the head's into the gap). The head's copies are born in the gap and land
  on the arc's own seed site: about half of all births without drives, 91-93% when the middles and the end are stock
  parts (the pool holds few heads), against 18% (copied end) and 47-48% (stock end) for the 2-cell kind with the same
  letters. The bud grows round the next vertex and shares the gap with its parent. The cost is length: three catches
  per birth. With copied middles it dies under the standard drives (0 of 4, the parts decay before they meet); with
  stock middles it lives only below the standard hazard (h 0.03: 84-96 individuals; h 0.1: 0 of 4).
- **Recognition is the other route, and it is exact.** Which parts a bud takes is decided by glue: a part binds only a
  site with the complementary glue. So variation in binding glues is inherited together wherever the parts were made (a
  head's attach glue and the seed site that takes it; a front and the part it catches), while variation on sides that
  bind nothing (copy sides, plain markers) mixes through the pool (run 1322's markers on plain sides lost their linkage
  within 35 generations). A kind is a **recognition class**, the types that bind one another, and the parental share
  s matters only for cheats inside a class (a part that keeps the class's glues but not its function: run 1322's
  threshold (1 - s) k > 1). A new private letter pair (an attach glue and the seed glue that takes it, changed
  together) closes a lineage off from the other classes: speciation by recognition. Seen in the standard world (seed 3,
  240k): a catcher with a private seed letter `C@|uU@&` replaced the plain catchers from 150k; from 220k a variant
  `C@|WU@&` (it takes u sites, its own seed side W binds nothing) rose to about as many as the u kind (90-142 against
  115-124): a cheat inside the new class, as the model says it must be.
- **Host and catcher.** The catcher's one mutation (front `c@|` to `C@|`) made a head that catches the host's free heads
  by their fronts and buds on the host's seed sites. Alone it never buds (0 of 4): a parasite of the host's nursery. The
  catchers that replaced it in two of the standard worlds carry a seed site of their own on the former copy side
  (`C@zZ@&`, `C@|uU@&`): founded alone without stock they grow (4 of 4 each, 178-378 individuals). They are pairs that
  eat blanks only (a root with a front and a seed site, plus a copied second cell); the "host head" is just their copied
  part. The z kind is the host kind with its prepared stock part replaced by a copied part that also roots.
- **No Red Queen, but exclusion: a catcher arms its host's diet.** Predicted: the catcher's cost is the seed sites it
  takes, which are diet-blind (`z` on every stock part), and the heads it eats are a surplus, so switching diet gives a
  host no escape and catchers do not select for it. Measured (the diets world, three diets near their stocks, catchers
  of diet c entered at 60k): diets e and g fall from about 125 hosts each to 7-34 within 20k and to 0-21 by 120k, while
  c keeps 88-100 (controls: all three 104-139 to 120k; 4 of 4 each). Diet switching away from c is selected against, not
  for. Why: a catcher individual copies its host head at two sides and its own head at one, and all of these bind every
  `z` seed site, so the c lineage (hosts and catchers) fills the shared nursery; e and g hosts make one head each and
  lose their own seed sites to c and catcher heads (10k after entry, free heads c 66 and catchers 57 against e 1). The
  same in the standard world, where a new diet is a rare mutant (the general mutagen picks one letter in 53): the one
  that took hold (seed 4, g, to 109 hosts at 140k with no catcher present) fell to 3 by 190k as a catcher (`Z@&C@-`)
  rose from 160k to 253 individuals. A kind that lives on a kind is here its ally against the others: the first
  interaction between three kinds.
- **What this asks for.** Place cannot make whole bodies heritable; recognition can, for whatever binds. So complex
  bodies should keep their function in what binds (fronts, attach and seed glues, the marks on binding sides), and
  lineages separate by private letters. Next questions: does a private class arise and hold whenever a kind is
  parasitised (the u kind arose once in 4 worlds); can a longer kind pay for itself where its in-place root keeps out a
  nursery parasite. Not here: the stock arc keeps its numbers beside the catcher (91-98 against 84-96 without, h 0.03)
  while the 2-cell kind loses 8%, but both are stock-limited at that hazard, and at h 0.1, where the catcher takes 27%
  of the 2-cell kind, the arc cannot live. A longer kind needs cheaper catches (more parts within reach of its fronts)
  before its root can pay.

## The hazard's unit decides between individuals and aggregates; marks are where function changes (build run 20261007-0420, 2026-10-07)

Derived first, then checked (INNOVATIONS run 0420). Notes, not the user's words.
- **What a hit costs depends on how a triangle is joined.** Lysis takes apart an individual (what bonds that are not
  joints join) and stops at `&` joints. Under the hazard *per triangle* (each attached triangle hit with probability
  h/2) a triangle in a k-cell individual dies when any of the k is hit, about k h/2: the larger the individual, the
  riskier each of its triangles, and the safest way to be attached is alone between joints. Under the hazard *per
  physics body* (one hit per body) an aggregate of n parts shares one hit, h/n each: the more joined, the safer. Only a
  hazard *per individual* (each individual lysed with probability h) gives every attached triangle the same risk h
  whatever its length and however it is joined. So the two hazards used so far both paid for aggregates (run 0450
  locked 4 of 4 worlds under the per-body hazard; pair-flow, per triangle, ended in 2 of 4 as rosettes and arcs in
  which every bond is a joint), and a hazard per individual is the one that pays for neither length nor joining.
- **Checked.** pair-flow's world with the hazard per individual (h 0.5, about as many pairs as per triangle at 0.6)
  keeps 2-cell individuals at every census in 4 of 4 worlds (fewest 44-98, 101-252 at 200k; seeds 2 and 4 had none
  left by 165k per triangle) and still sweeps (variants new after 100k in a tenth of the bodies: 1-4 per world).
  An aggregate still saves a copy per birth (one part instead of two); without the risk advantage that is not enough.
- **A mutagen on glue letters only keeps individuals and stops evolution.** Marks never changing (no part gains `&`
  or a front), the pair world keeps its founder pair in 8 of 8 worlds (either hazard), and no variant ever reaches a
  tenth of the bodies. Glue letters are labels: a letter mutation changes which partner a side binds, and in a world
  with one kind that is almost always a loss. Marks decide what a side does (attach, release, anchor, copy, lysis), so
  the variants that win (a seed site that lyses, an S with a joint, a head that catches heads) are mark or case changes.
  The standard world keeps the general mutagen and fixes the hazard.
- **A kind that lives on a kind, one mutation from the founder.** In the stock world under the general mutagen the
  diet kind's head `Z@&c@|-` mutates its front to `C@|`; on a seed site that front catches a free head *by its front*
  `c@|` (an attached `@` side binds a free part's `@` side; no `&` on either, so the two heads are one individual),
  and the pair lets go. It needs no stock: its second cell is the host's copied head. It still needs the host: it buds
  only on seed sites, which are on the stock parts that host individuals hold, and the host head it carries is copied at
  its own `-`, feeding the host's head pool. It became the commonest kind in 3 of 4 worlds (119-232 individuals beside
  61-85 hosts at 120k). This is the z route run 2350 closed (a front catching another kind's joint side) reopened
  through a side that is not a joint: a front. To 240k it holds in 2 of 4 worlds; in the other 2 it is replaced by
  catchers that **carry a seed site of their own**: the inert copy side took a glue (`C@zZ@&`: z, which every head
  binds; `C@|uU@&`: u, with the attach glue changed to U as well, a seed letter only catchers use), so the catcher no
  longer needs the host's seed sites. That is candidate 3's private seed letter, evolved by the parasite, not the host:
  the host's seed sites are on prepared stock parts, which do not mutate, so the host cannot privatise them.
- **Length by mutation, again, once.** In 1 of 4 standard worlds heads that lost `&` (`C@c@-`, a mark and a letter
  mutation: a middle) joined chains head, middles, stock part: kinds of 3 to 6 cells held at 120k. Under the hazard per
  individual a longer body costs no extra risk, so the shortcut's only advantage is fewer parts per birth.

## Joints make individuals; the shortcut makes length shrink (build run 20261006-2350, 2026-10-07)

Derived from the rules first, then checked (INNOVATIONS run 2350). Notes, not the user's words.
- **An individual is what lies between joints.** The open signal stops at `&` joints, and an `&` side lets go once its
  triangle hears nothing. So any part caught by its `&` side becomes an individual of its own as soon as its own fronts
  are filled, whatever caught it. A body grows longer only by parts caught by a plain attach side (`X@`, no `&`); and a
  part is copied only if, once attached, it still exposes a side that is neither bonded nor an anchor. So the cells of a
  kind are of three sorts: a **head** (`Z@&` attach side, a front, a copy side), **middles** (plain attach side, a front,
  a copy side) and an **end** (plain attach side, no front; a stock part, or a copied end with an open side).
- **The z kind was never a 3-cell kind.** In the diets world every copied part is a head; only the stock parts have a
  plain attach side, and they have no front. So a front mutation changes what an individual eats, never its length. The
  z front catches heads by their joint side: on a parent's seed site a z head is a seed site one cell further out (a
  nursery), and what it catches leaves as an ordinary 2-cell individual. Before run 1920 the parent heard the bud
  across the joint and waited, so z heads were seen holding waiting heads (the diet census counted them as complete);
  the end state of run 1750's long world shows exactly that (z head on a stock part, its front holding a head whose own
  front is open). Since run 1920 the caught head leaves at once and the z kind is gone (0 of 4 worlds at openRange 9;
  0 of 1 at openRange 3, where run 1750's code holds 27).
- **Given middles, length changes by one mutation, and the shortcut wins.** For every chain head -> middles -> stock
  part there is a 2-cell kind one front mutation away (the head's front takes the stock part's letter) that eats the
  same stock with fewer parts per birth and fewer catches before it lets go. Where the stock limits, the shortcut
  completes first and takes the stock: a 3-cell founder is replaced by its 2-cell shortcuts in 4 of 4 worlds by 40-60k
  (check `ladder`), also without the mutagen (founded beside the shortcut, 2 of 2). Middles whose fronts mutate to an
  unstocked letter wait forever on seed sites and clog them (one world nearly died of it at 40k).
- **So length needs a reason, not a mechanism.** The mechanism exists (middles, one mutation). What is missing is a
  thing that only a longer body can do. Not enough: a private stock that a middle catches (a head front can mutate to
  the same letter); a second seed site on a middle (tried: `C@e@|z`, lost in 2 of 2, because every kind's head binds
  every `z` seed site, so the extra site raises the shortcut's buds as often as its own); food without a seed site, so
  that the shortcut is sterile and the seed must sit on a middle (tried: `Z@&c@|- C@e@|z E@-|-|`, dies within 10k in
  2 of 2). **A middle has one free side** (attach, front, and one more): its seed site is then also its only copy
  site, a waiting bud on it stops the copies of the very middle the bud needs, and the kind deadlocks. An end has two
  free sides (the pair's S: a copy side and a seed site), so a kind's seed belongs on its end, and the end of a stock
  kind is the stock part. Candidates, from small to large, for a later slice:
  1. *Something a head front cannot reach:* a resource caught only where two cells of one body meet (a part bonded by
     one side and then closing flush onto a second cell); the shortcut has no second cell to close onto.
  2. *Heredity by construction* (IDEAS parity, run 1322): four or more cells in an arc round one vertex, so copies made
     inside the arc are within reach of the body's own fronts: length buys parts made where they are used, and with
     them resistance to cheats and mutants (s near 1). The first function in this world that needs a minimum length.
  3. *Private seed letters:* a kind whose seed sites take only its own heads (`y` sites, `Y@&` heads) keeps its buds,
     so its shortcut (a `Z@&` head) cannot be born on its sites. Two mutations (head attach glue and seed glue
     together) make such a kind, so it is a prepared start, and its stock part must carry its letter.
  4. *Copied ends:* an end that is copied (`D@-z|`, the duo strip) needs no stock, so a kind of copied cells only eats
     blanks; its shortcut is the head alone, which has no end and cannot bud. Length 2 or more is then forced by the
     need for an end, and the question becomes what a third cell adds (run 1150: nothing, the pair wins).
- **The full mutagen** (every glue and mark, `PAMF` off) collapses the diets world: stock parts mutate and decay, the
  stocks drain within 30k, and heads that mutate to catch their own kind (`C@&c@|-`) make stockless chains, the
  aggregators of run 0621 (details in INNOVATIONS).

## After nine slices on the pair: one world, one range, one measure, then longer kinds by mutation (direction check, review-intent run 20261006-1851, 2026-10-06)

Weighed after priority 9 (runs 2320-1750 on the pair; candidates (a) the z kind, (b) diets of different length,
(c) more diets than blanks support).
- **The core is not growing; the world is.** No rule changed since run 1921 (6 marks, 3 relays, 4 exposed values, 2
  states), and nine capabilities came from combinations. But demo `pair` now has 29 options, 11 of them drives or their
  settings (`PAD`, `PADI`, `PAH`, `PAHT`, `PAHU`, `PAHB`, `PAM`, `PAMF`, `PAMA`, `PAMX`, `PAF`). Labelled drives are
  allowed, but "the simpler the rules the better" counts the world's rules too: the environment is where rules now pile up.
- **Combined in sequence, not in one world.** Each slice built on the last (flow, two kinds, stock, diets), but the
  checks run five different settings: hazard per triangle (`pair-flow`, `pair-host`) or per individual (`duo-stock`,
  `diets`), openRange 1 or 3, the mutagen on every glue or on fronts only. No world carries all the results at once.
- **What evolved, and under which hands.** Complexity grew twice: three diets side by side (sideways: more kinds, same
  size) and, unplanned, the z kind (3 cells from one mutation). Both came in a world whose mutagen was confined to
  fronts and whose second resources were prepared stocks (immortal typed parts returned as themselves). Under the
  general mutagen without stocks the pair simplified to one-type chains and rosettes (run 0621). So the diets result
  shows a mechanism, not yet evolution that is open-ended on its own terms.
- **Prepared structure doing work:** the stocks. The z kind is the first resource that is grown (other kinds' copies),
  and the first increase of body length by mutation: that is why (a) comes first. (b) needs more prepared stocks with
  fronts of their own; (c) is run 1150's R* rule in a new setting, and its answer is largely predictable.
- **A body-length knob in disguise: openRange.** It is set per kind: 1 for the pair, 3 for strips and diets, 9 in the
  lineage, 50 in lysis (core default 120). Run 1150: a 3-cell strip lets its bud go half built below 3 (relay lag,
  candidate (o)); whether 4- and 5-cell kinds need more is unmeasured. If they do, a world tuned for one length caps
  the length that can evolve in it (AGENTS: no body sizes), and the z kind's longer z-z chains may fail for that reason,
  not a biological one. Kinds of different length can evolve in one world only if budding works at one fixed range
  for every length.
- **No measure of the goal.** Each slice writes its own census (`mut:`, `duo:`, `diet:`, `par:`). Complex evolution
  needs one census every pair world prints: kinds by body composition, how many hold 5 or more individuals, the
  longest body held, and kinds whose bodies hold another kind's parts. Then runs can be compared over time and with
  each other.
- **Order chosen** (NEXT priorities 10-14): one range for every length (core-review), the z kind and length by mutation,
  including the general mutagen (build), the kinds census (harden), one standard evolving world with the fewest drives
  (build), then grown instead of prepared resources: candidate (t) or kinds that live on kinds (explore).

## Heredity of combinations is locality: a parasite needs (1 - s) k > 1 (explore run 20261006-1322, 2026-10-06)

Measured on the flowing pair world without the mutagen (1000 blanks, world 50, `PAHB=2`, hazard per triangle; INNOVATIONS
run 1322), no rule change.
- **Heredity is half parental, not by body.** A newborn's R was copied from its own parent 39% of the time, its S 44%,
  both 20%, its two parts from one body (any) 22-23% (a random living body: 0.9%; h 0.6, decay every 100 steps). Two
  neutral markers put into the same half of the bodies (x on R, z on S) lose their linkage within 5000 steps (about 35
  generations: r from 1 to between -0.15 and 0.32): a newborn keeps its parent's combination about one time in five.
- **What sets the parental share is how many free parts compete for a site.** The parent's own copy is made 1.2 side
  lengths from where its bud needs it; it wins when the pool is lean: faster decay (every 10 steps: S 0.58 at h 0.3)
  and more births per copy (h 0.6: 0.43; h 0.3 with decay every 100 steps: 0.25, the pool is larger). Stirring the free
  parts (a labelled drive) takes it to 0.22, or 0.03. Fast decay costs material: at h 0.6 it kills the world (Allee). The
  levers move the share between about 0.2 and 0.6, not to 1.
- **The parasite threshold.** A part type copied k times as often as its rival, whose own body never buds, can fill only
  the births the parents' own copies do not take, a share 1 - s; it spreads only if (1 - s) k > 1, to about
  ((1 - s) k - 1) / (k - 1) of the bodies. Tested with S `B@-q` (its seed site a glue nothing binds, no anchor: copied
  at two sides, k about 2, threshold s = 0.5): s 0.58 and 0.43, gone within 2000-6000 steps (4 of 4 each); s 0.25, holds
  0.42-0.52 of the bodies to 80k (model 0.5; 4 of 4); the excluding world stirred to s 0.22, spreads to 0.51-0.53 within
  2000 steps, the hosts crash to 32-44 bodies, the parasite dies with them and the pair recovers (2 of 2); stirred at
  h 0.6, it spreads and the world dies (1 world). So locality alone lets selection see bodies against a cheat that does
  not make its own body bud, once s > 1 - 1/k. A cheat with a larger k, or one that costs its body only part of its
  births, needs a higher s.
- **Run 0621's selfish S is lethal here, not selfish.** `B@-y!` put into 1 in 10 S is gone within 2000 steps (4 of 4):
  its seed site is mostly covered by R being lysed, so it is copied less than plain S. Its sweeps in run 0621 came in
  worlds that had already evolved other R types. "Selection sees part types, not bodies" (above) holds only below the
  threshold.
- **Why the pair cannot get much higher (parity).** A copy is made in the site beside its template's side and lets go;
  the sites within capture (0.6) of it are that site and its three neighbours (0.58 away). Sites and cells form a
  honeycomb, which has no cycle shorter than six, so a site beside a different cell of the same body is within reach of
  a fresh copy only when that cell is three bonds from the template (four cells in an arc round one vertex). In a pair a
  copy can bind at once only beside its own template, and only if its type binds its own kind: a one-type chain. That is
  a reason one-type chains win in the mutagen world (run 0621): they are the only pair-sized kind whose parts are made
  where they bind, with heredity by construction. A kind with parts made beside the cell they join needs four or more
  cells in an arc (designed, not built), or a compartment.
- **For complex evolution:** keep the free-part pool lean (fast turnover), and measure s before a selection test. A
  kind whose cooperative parts must stay together needs s above 1 - 1/k for every cheat's k it is to resist.

## Diets evolve by one letter; the resident guards the seed sites (explore run 20261006-1750, 2026-10-06)

Measured with a 2-cell kind `Z@&c@|- C@-|z|` among stocks C, E, G and a mutagen on front glues (INNOVATIONS run 1750).
- **A diet is one heritable letter.** The front glue decides which stock a kind eats, and copies carry it exactly, so a
  mutagen on fronts alone makes diets evolve: no core change, no new mark. From one founder, three diets live side by
  side in 4 of 4 worlds, each holding about as many individuals as its stock has parts (Tilman: k resources, k kinds).
- **The barrier is the seed sites, not the food.** A stock-limited kind keeps a starving bud on nearly every seed site,
  so a mutant that could eat an unused stock rarely finds a site, and its own site is usually taken by the resident's
  copies, which outnumber its own a hundredfold. Most such mutants are lost (roughly 1 in 130-280 takes hold, after
  15k-35k steps); one that takes hold fills its stock within 5-10k steps. Shared growth sites make a priority effect
  (as run 1620's bistability): the resident holds the ground until a mutant's local luck carries it past it.
- **Eating other kinds' parts is one mutation away.** Every root carries an attach side `Z@`; a front `z@|` catches it,
  so a mutant root takes another kind's free root as its second cell (which then catches its own stock): a 3-cell kind
  made from the copy cloud of others, and z-z chains. Any glue that every kind exposes is a resource a mutant front can
  claim: here is a route to longer bodies and to kinds that live on kinds, both from one letter. It persists in a
  minority (8-15 of 400 individuals to 120k); what limits it is open.
- **Blanks become the shared bottleneck.** Each new diet adds individuals that copy from the same blanks (free blanks
  510 with one diet, 40-120 with three); with more diets than blanks support, diets would compete for blanks again and
  the kind that wastes fewest copies would win (IDEAS "One supply, one winner"), unless diets also differ in that.

## A resource of one's own is bound by glue, not copied (build run 20261006-1620, 2026-10-06)

Measured with the pair and a 3-cell strip whose extra cells come from a stock of parts (INNOVATIONS run 1620).
- **Copying is shared by everyone.** A copy side binds any non-anchor side whatever its glue, so every blank can become
  a part of every kind: blanks are one common resource, and no blank type can be one kind's own (that would take a
  copy side that reads glue: candidate (t), NEXT). What a kind can own is what it binds by glue: free parts that only its
  front catches. A stock of such parts is a second resource in Tilman's sense.
- **Per individual, length costs only risk and waste.** If each part a birth needs comes from one copy source on the
  body, births per individual at a blank level are about one source's copy rate whatever the length (the pair: two
  sources, two copies per birth). Length then costs through waste (each part copied apart and decaying before its site
  is ready: run 1150's 23% against 85%) and through risk (more triangles hit). Parts taken from a stock remove the
  waste of their copies and the blanks they would use; risk per triangle still costs. Measured: with a hazard per
  triangle the stock strip still loses; with a hazard per individual it coexists, and with a larger stock it wins.
- **The stock sets the balance, and history matters.** Stock 200: the pair wins; 400: the two coexist; 600: the strip
  wins. At 400 pairs can enter a strip world but strips cannot enter a pair world: two stable states, so which kind
  came first matters (a priority effect), and the mix cannot be reached from the pair's side.
- **Diet is heritable without a core change** (designed, not demonstrated): which stock a kind uses is the glue of its
  fronts, and a part's glue is copied exactly, so a mutagen that changes a front glue changes the kind's diet. A world
  with several stock types (each a part only some fronts catch) offers as many niches as types (Tilman: k resources
  can hold up to k kinds). That is a route to many kinds evolving side by side, each with its own diet and a body
  length that its diet pays for; the next test is whether a mutant front reaches an unused stock and spreads.
- **Risk per triangle is the remaining cost of size.** Under the hazard per triangle (the default of the flowing
  world since run 0621) every extra cell costs as much as in run 1150; a kind gets size for free only if risk does not
  grow with it (shelter, a body that sheds hits: IDEAS "One supply, one winner", (b)).

## One supply, one winner: the kind that wastes fewest copies (build run 20261006-1150, 2026-10-06)

Measured with the pair and a 3-cell strip of the same design in the flowing world (INNOVATIONS run 1150).
- **Competitive exclusion by R*.** With one resource (copy blanks) and deaths that return it, each kind alone leaves the
  free blanks at a level of its own (pair 11, strip about 100 at h 0.1, decay 1), and the kind with the lower level wins
  from every start: from one founder each, entering the other's world, or resisting entry (4 of 4 each). This is the
  ecologists' R* rule, and it makes the "smallest fastest replicator wins" risk of run 1850 a measured fact here.
- **Why length costs.** A birth needs every cell's part copied apart, carried to the bud and bound in turn before it
  decays. The pair binds 85% of its copies, the strip 23%: three sequential bindings under decay waste most parts, and
  each extra cell adds a triangle at risk. So the strip lives only below about a sixth of the pair's hazard (0.12
  against 0.7). Any longer kind on this design pays this; adding cells is not neutral.
- **A kind of three or more cells needs openRange 3 (relay lag).** When the second cell binds, the root stops emitting
  in the same pass the new front starts, so the root hears nothing for one pass and its `&` lets go: at openRange 1 or 2
  the bud leaves its parent half built. At 3 the echo through the parent covers the pass. A core fix would let binding
  set the new part's open signal at once (binding already sets both parties' state); not needed while the range works
  (candidate (o), NEXT).
- **A trap for free parts gives at most a priority effect.** A cell can only catch free parts (attached triangles bind
  each other only when flush), and its one exposed side must stay its copy source, so a predator cell has one trap.
  Lysing the rival's free roots slows an invasion at slow decay (parts live long enough to meet traps) and repelled it in
  1 world of 4 beyond chance; at fast decay it changes nothing. It does not pay for the waste of length.
- **What could pay for a longer kind** (to test): (a) lower waste: parts made where they bind (a bud that copies its own
  next part), or fewer free stages; (b) lower risk per cell: a hazard per body instead of per triangle (an individual
  then dies at the same rate whatever its size; run 0450) or shelter; (c) a second resource only the longer kind can use (Tilman: two
  resources allow two kinds to coexist when each is limited by a different one), e.g. a second blank type that only a
  cell with a second copy side takes; (d) spatial structure (patches) in larger worlds. Of these, (c) is the first to
  try: it needs no rule change, only a second labelled supply. Tested in run 1620 (section above): a stock of parts only the
  strip binds pays when risk is per individual (coexistence at stock 400, the strip wins at 600), not when it is per
  triangle; a second blank type cannot be one kind's own in the core (copying is glue-blind).

## Deaths that return blanks keep material flowing; selection of part types can still kill the world (build run 20261006-0621, 2026-10-06)

Measured on the mutagen pair world (m 0.01, hazard per triangle h 0.6, decay d 1; INNOVATIONS run 0621).
- **Flow by construction.** If every lysed triangle comes back as a copy blank (labelled drive `PAHB=2`), each
  triangle held in a body dies at the hazard's rate whatever binds it, and by conservation copying must replace it:
  in a steady state copies per step equal deaths per step, about held material x h/200. Binding variants can no
  longer stop the flow, only lower the free blanks. Measured: copies 16-28k per 5000 steps through 300k where the same
  seeds without the drive fall to 0.4-4k.
- **Few blanks is competition, not a lock.** With the drive, the types that win are the ones that keep the free
  blanks lowest (they copy fastest from few blanks), as the consumer that draws a resource lowest wins in ecology
  (Tilman's R*). Blanks 34-150 with copying at full rate is a busy world, not a stuck one. Copies per 5000 steps, not
  free blanks, is the measure of flow.
- **Selfish parts.** Heredity is by part type in a mixed pool, so selection favours a type that is copied more even
  when it harms the bodies it is in. The clearest case: S whose seed site carries a lysis mark (`-y!B@`, `B@p!y`,
  `-!y!B@`): an R that binds it is lysed (and, under the drive, becomes a blank; the relay stops at R's `&` side), so
  the seed site is free again and S is copied there more, while no bud ever grows on it. In a world of 1000 blanks
  (100-250 bodies) such sweeps ended 1 of 4 worlds by 260k (and 2 of 4 with `PAHB=1`, where variants copied less
  swept first): evolutionary suicide. In a 3x world (3000 blanks, 200-1000 bodies) 4 of 4 lived to 300k: the selfish
  S swept there too, and R answered by evolving its own seed site (`Y@&b@|y@`: R buds R, S still binds the front).
- **What evolves when material flows:** a succession of kinds, still sweeping at 235-275k of 300k: one-type
  replicators (`Y@&b@y`, `O@&b@o`: a part that binds its own kind's seed site, buds it and lets go, in chains of 2-6),
  chains of mutually binding types (`L@V@v@&`, `V@i@v@&`), R-chains carrying S. The pair simplifies more often than it
  grows: with selection on part types, the type that is copied most wins, and a type that is its own template wins
  by not needing the other. Run to 10^6 steps (3x world), all 4 worlds end as one-type chains and rosettes whose
  variants keep replacing one another: turnover without growth in complexity.
- **What this asks for next:** heredity of combinations (a body's parts from its own copies) so that selection sees
  bodies and selfish parts cost their carriers, and larger populations (or many patches) against drift and suicide.
  The drive stays labelled; a core rule that returns lysed material as blanks would make it the physics (a candidate,
  not needed yet).

## Variation on the pair: exposure is fitness, and binding beats copying (explore run 20261006-0450, 2026-10-06)

Measured on the running pair world (h 0.6, d 1, 1000 blanks, world 50) with no rule change (INNOVATIONS run 0450).
- **Heredity is by part type, mixed fast.** A neutral marker (glue x on R's plain side) put into half the world drifts
  to fixation or loss in 45k-215k steps (4 worlds), about what a well-mixed population of 280 bodies gives. Patches
  dissolve within 5000 steps (same-marker share among a body's 6 nearest only 0.04-0.06 above random), so the 2.3 side
  lengths from copy to birth do not make lineages: a bud's parts come from its whole neighbourhood, and bodies move.
  Selection acts on each part type in its pool, not on bodies (as foreseen in "Sources in proportion to use").
- **Exposure is fitness.** A part type's copies are made where its free sides are exposed, so a variant that exposes
  itself more is copied more: S whose seed site lost its anchor mark (copied while no bud sits on it) went from 1 in
  10 to all S in 15-30k steps in 4 of 4 worlds; R whose front lost it (copied while a bud waits) likewise (see the
  INNOVATIONS entry). Under the mutagen they arose and swept unprompted (6 of 8 worlds by 60k). The pair as designed hid its
  binding sites from copying ("expose a type on a side that nothing binds", run 2320) to keep sources in proportion to
  use; evolution undoes that at once, because what counts for a type is its own copies, not the balance of the pool.
- **Binding beats copying.** The next winners are variants that keep a body joined (a glued `@` side that never closes:
  the part hears an open front forever, so its `&` never lets go) and then parts that bind their own kind (`g@` and
  `G@` on one part: `F@f@&J@` closes rings of six, rosettes) or each other (R `X@...` with S `...x@`). They capture
  free parts before decay can return them to blanks, so blanks fall from about 150 to 2-20 and copying falls 3-15x:
  a material lock, and evolution nearly stops. A per-body hazard rewards this strongly (a hit takes one part between `&`
  joints, so a joined body's parts die k times less often): 4 of 4 worlds. With the hazard per triangle the pair held
  to 300k in 1 of 4 worlds at the same mutation rate; the others locked up by 80-140k. Some winners are new kinds,
  not clumps: R that buds its own kind at its outer side (`N@&|b@n`), then two R-derived types binding each other with
  no S left. Evolution happens; it runs toward holding material, and then slows (copying a third).
- **What follows for the vehicle.** Complex evolution needs (a) heredity of combinations, not only of part types (a
  body's parts should come mostly from its own copies: compartments, or copying that binds the copy to its template's
  body), and (b) a reason why material held in bodies still flows: deaths that return blanks rather than parts, or
  costs for holding. Without (a) only single-type improvements are selected; without (b) the first aggregator wins.

## A world that runs on: a death must give back raw material, not parts (build run 20261006-0251, 2026-10-06)

Measured on the pair with two labelled drives, a body hazard h (lysis into the two parts) and decay d of free parts
into blanks, 1000 blanks in world 50 (INNOVATIONS run 0251).
- **Slow decay recycles parts, not material.** With d of 0.01-0.3 per 100 steps, a dead body's R and S rebind at once
  (a waiting seed site is always near), so births follow deaths one for one and the population is set by the material
  (370-425 bodies of at most about 500), whatever h (0.05-0.5). New bodies are then built from old parts: copies made
  per part born 0.05-0.2. That world runs on, but it would not evolve: a part type is made only by copying, so a
  variant could spread only as fast as parts are copied, not reused.
- **Fast decay makes every birth a copy.** With d = 1 (every free part a blank again within 100 steps) 94-96% of the
  parts born into bodies are fresh copies, and the population is set by the hazard: about 340 bodies at h = 0.5, 285
  at 0.6, 50-190 at 0.7 (fluctuating), none at 0.8-1.0.
- **An extinction edge (an Allee effect).** A birth needs an R and an S copied, moving to a seed site and binding
  before either decays. In a sparse population both decay first, so below some density births cannot keep up: between
  h = 0.7 and 0.8 the steady state disappears, and at 0.7 a world of about 100 bodies drifts across it (2 of 4 extinct
  by 10^6 steps). The 50-200 bodies first proposed lie just above that edge; a robust world keeps more.
- **Copying is local.** A part is born into a body on average 2.3 side lengths from where it was copied (91% within 5;
  a random place in this world would be about 19 away). The pair has no heredity of its own (a bud is built from any free
  parts that reach the seed site), but with copies this local, the parts a body copies end in buds a few side lengths away
  (its own or its neighbours'): heredity by neighbourhood, and bodies cluster in patches (picture). Direction 2 depends on this: a
  variant part made by copy error is copied again by the body that carries it, and its copies go to that body's
  neighbourhood.
- **Remaining asymmetry, measured:** copies R : S 1.20-1.22 (a waiting bud's R exposes its `-`; 30-100 buds wait).

## Sources in proportion to use: every cell exposes one side; the smallest kind, the pair (direction check, review-intent run 20261005-1850, 2026-10-05): built in run 20261005-2320 with one correction (below)

The question left by run 1422: under closed walls type k is made only at a waiting front of cell k, where it is no
longer needed. Weighed: (a) few part types, (b) parts made where they are used next, (c) a source of every type in
each living body with need-limited exposure.
- **Why the sink is structural.** Contact copying makes a type where its free sides are exposed, at a rate set by how
  often blanks reach them. In the 47-type kind those places are growth fronts (type k while the front waits for k+1)
  and, with open walls, the outward half of a one-row ring (the inward half faces the lumen and gets 3-20x fewer
  blanks, run 0721). So each type has its own source strength, need-blind; with 47 unique types in one pool the
  weakest source empties first and every bud stops before it. A decay drive only sets each pool to its source
  divided by the decay rate, so it cannot make unequal sources equal (runs 0721, 1051, 1422).
- **The rule that removes it: every cell of a complete body exposes exactly one copyable side to the outside.** Then
  each living body is one source of each of its cells' types, so with N bodies of one kind type k is made at rate
  about c b N m_k (c: copy rate per exposed side per blank, b: blank density, m_k: cells of type k per body), and buds
  use it at rate (births) x m_k: supply follows use by symmetry, with no need signal. This is (c) met by geometry
  instead of by a gate. Heredity needs the same property: a variant part is made in proportion to the bodies that
  carry it, so a variant that helps its bodies spreads (the pool mixes types between lineages, so selection acts on
  each type separately unless offspring use parts made nearby; locality makes them partly linked).
- **Which shapes meet it.** A one-row ring with a lumen cannot (each cell has one free side, half of them face in).
  A filled hexagon (6 cells around a vertex, each with one outer side) almost does, but its root's one outer side is
  the joint to its parent, spent after the split, so the root type has no source in an adult. A strip can: its end
  cells have two free sides, one for the joint or the seed site and one exposed. Growth of a strip of unique types
  ends by itself (the last cell has no glued `@` side left), so no closure problem arises.
- **The pair (2 cells, 2 types).** R `Y@&` `b@` `-`, S `B@` `y` `-|` (the side order chosen so that a bud points away
  from its parent; to check with pictures). A free R binds a body's seed site `y` by `Y@&` (as `budKit`'s root binds
  `y`); its unbonded `b@` emits the open signal; a free S binds `b@`; R then hears nothing (openRange 1 is enough, R
  being the emitter) and its `&` lets go and is spent: two pairs. A prepared founder needs no spent state (an `&` side
  emits nothing, so the founder's free `Y@&` is spent in its first pass). Sources: R's `-` (always), S's `y` (while no
  bud sits on it; settled candidate (f)), and R's `b@` while a bud waits for its S; S's third side is closed (`-|`, an
  anchor side, never copied), so both types are exposed once per adult. Rules used: `@` binding, contact copying, the
  open signal, `&` release; no new rule, no strand, no lumen.
- **Built (build run 20261005-2320): a source must not be a binding site.** As written above the pair stalls: S's
  only source is its seed site `y`, and R, the more common part at first, covers it at once; a waiting bud then makes
  R at its front and its `-` while nothing makes S (1-5 bodies in 4 worlds, copies R 181-289 against S 0-6). Moving
  the anchor mark (no glue: never a template) from S's third side to the seed site, S `B@-y|`, and onto R's front, R
  `Y@&b@|-`, makes each cell's plain `-` its one source and keeps binding sites out of the copying: one founder among
  300 copy blanks makes 134-148 bodies in 4 of 4 worlds (INNOVATIONS run 2320). The general lesson for any kind
  built on contact copying: **expose a type on a side that nothing binds**, else the source closes exactly when the
  type is needed (the seed site) or opens exactly when it is not (a waiting front makes surplus root parts: 92-99
  stranded buds with the front copyable). The seed site opposite R's Y gives a strip (the bud points away); beside it
  (S `B@y|-`) a bud turns 120 degrees and three generations close a hexagon (also grows, fewer bodies). Remaining
  asymmetry: a waiting bud's R is attached, so its `-` is one extra R source; the surplus equals the buds still
  waiting when the blanks run out.
- **Mean-field count.** Bodies N, free R and S pools r and s, blanks b; a part binding a waiting site at rate a per
  part, copying at c per exposed side per blank, a labelled body hazard h (lysis into parts) and decay d of free parts
  into blanks. An idle body buds at about a r s / (r + s); births = deaths gives r = s = 2h/a; copying then only has to
  replace decayed parts, c b N = d r for each type. So a steady state exists once material exceeds a threshold set by h, a, c and
  d, with no condition on any single type. To measure, not assume: crowding, buds jammed beside their parents, the
  seed site exposed only while idle.
- **Not taken.** (b) needs contact copying to make the complement of its template (a core change), and then every blank
  at a front becomes the next cell and binds there: crystal growth that only geometry stops. (a) few periodic types in a
  ring helps only linearly (the pool law, run 1221) and keeps the lumen; a periodic ring with an odd motif puts every
  type in both inward and outward cells, a later way to give the vehicle a compartment.
- **What the pair does not answer.** Complexity: in template worlds the smallest fastest replicator usually wins
  (Spiegelman's experiment). What could pay for a longer kind here (outer sides that prey with `!`, that shield, that
  catch parts; spatial crowding) is the competition test's question. Variation: a copy error on an outer side changes
  behaviour without breaking assembly; one on a joint side (`b@`, `B@`, `Y@`, `y`) is lethal; a longer kind needs a
  new `@` site and a part that fits it, two changes at once (the variation explore must say how that can happen).

## Closing one sink moves the blanks to the next (explore run 20261005-1422, 2026-10-05)

Measured with candidate (p) (free strands not contact-copied; INNOVATIONS run 1422). With the strand sink closed, no
blank is spent on a free strand, but the blanks do not go where they are needed: they go to the next most exposed
copyable side, a kit front stalled for want of the next type, which copies its own type again and again (parts 519-670
against 45-122 without the change; one type up to 356). The strand sink had been a fast loop: its monomers turned back
into blanks within about 100 / 0.001 = 100k steps; surplus parts return ten times slower. So sinks are not independent:
in a closed world with need-blind sources, removing one sink only matters if the next one is not worse. The source that
is blind to need here is the growth front: under closed walls type k is made only at a waiting front of cell k, i.e.
exactly where type k is no longer needed (the front needs k+1). A kind whose parts are made where they are used next,
or a kind with few part types (each type used many times per body, so no single type is the weakest link), would avoid
this; both are design questions for the next review (NEXT).

## The scavenger's dilemma: clearing has to scale with the population (build run 20261005-1051, 2026-10-05)

Measured with prepared scavengers (`Z@|!&`, run 0721) in 4M-step lineage worlds (INNOVATIONS run 1051). A leaked
strand is two things at once: the genome the next bud must catch, and the largest blank sink (a free strand's sides
turn every blank that reaches them into monomers; 20-76% of the blanks copied by genome triangles went to free strands).
Eight scavengers clear every strand and no bud ever catches; two leave the buds their catches but fall behind once
bodies multiply (6-8 free strands at 0.5M, 18-40 at 2-3M), and only 1 of 4 worlds still made offspring near 4M. A
fixed, prepared clearer cannot track a population. Two ways out, both local: (1) clearing that grows with the bodies,
e.g. a scavenger side on each body's own outer wall (a lysis anchor that eats strands near it; to design: it must
not take its own bud's catch, and an adult's `&` is spent once it hears no open signal, so the side needs another
stop for the lysis); (2) free strands that are not copied at all (candidate (p): contact copying follows the same
"held" condition as chain copying), so a leaked strand only waits for a catch and costs no blanks. Also learned:
with closed walls, a uniform part decay must be slower than a bud's passage (`BCLK=0.0003` emptied types within 0.4M;
0.0001 held), and a hazard that holds a lineage at 1-4 bodies lets it die out by chance (3 of 4 by 4M).

## Material flows by exposure, not by need: what a world that runs on requires (explore run 20261005-0721, 2026-10-05)

Measured while trying a world that runs indefinitely with the existing core (INNOVATIONS run 0721). Every attached
triangle with a copyable free side turns the blanks that reach it into copies of itself, at a rate set by how often
blanks reach it (geometry, crowding), not by whether anything needs the copies. So in a closed world the blanks end
wherever the most exposure is: surplus parts at waiting fronts, monomers at free strands, and above all **leaked
genome copies** (52-60 free strands, about 40% of all triangles, at 1.3-1.4M steps in 3 of 4 long worlds: each adult
copies its held strand while blanks reach it, each bud catches one). A labelled decay of free typed triangles returns
blanks, but at a uniform rate a type's pool settles at (its sources) / (the decay rate), and a kind with 47 (or 27)
unique part types in one shared pool is a chain whose weakest link sets the rate: whichever type has the weakest
source empties, and every bud stops at the cell before it. Sources tried: growth fronts only (closed walls: an emptied
type comes back only when a body that holds one dies), every cell's wall (open walls: the inner walls of a closed ring
get 3-20x fewer blanks; on a half ring every wall is reached alike in isolation, 854 vs 1054 copies per cell, but in the
crowded lineage world one side's sites stay blocked). Conditions for a world that runs on, as found here: (1) every
sink has a way back (decay for free monomers and parts, death for bodies and free strands); (2) every part type has
a source in every living body, or parts are conserved and recycled whole (lysis returns exactly one of each);
(3) sources limited by need, or losses that grow faster than linearly with abundance, so that one type's surplus
cannot drain the others. A density-dependent loss (a free triangle that touches one of its own type reverts) is the
smallest local form of (3): a pool then settles near the square root of its source, not proportional to it. Tried
as a labelled drive in this run, it made things worse: the blanks it freed went into leaked strands (66-86 free
strands by 600k), so the strand sink has to be closed first. Closing it with scavengers (same run) showed the other side: the leaked
strands had also been where most genome monomers were made, so the held strand's copying nearly stopped. Candidates for the next attempt, smallest first: (a) copy
only what is needed: a parent that stops copying its strand while a copy waits uncaught, or free strands that come
apart (the strand sink); (b) parts conserved: copy blanks do not copy kit parts, so every type
keeps its count and lysis recycles it, blanks serving only the genome (indefinite, but no new parts: the kit cannot
vary); (c) a kind with few, periodic part types (each type in many cells and many bodies, so its sources are many).

## Earlier goal, now a direction (user, 2026-10-01)

An organism with a metabolism that constructs its offspring and feeds it until it can live on its own, then splits
it off. Build every mechanism in isolation and combine them later. Module table in ROADMAP.

## Ask "who is waiting" at the part that exists only when waiting is possible: a receptor on the last cell (build run 20261004-2221, 2026-10-05)
The anchor cell does two jobs: in a parent it holds the strand where blanks reach it, in a bud it decides from when
the bud can catch (and, with a cutter at the anchor, from when it can die). One cell cannot serve both: on cell 6 the
strand is copied but a cutter kills every growing bud at 7 cells (run 2051); on cell 44 (or 40, 38) only nearly
complete buds are exposed but the held strand hangs in the pore and its first copy jams (12 worlds, INNOVATIONS run
2221). Decoupled with what the kit already has: the cutter's target is a second site on the last cell E, an
attach-and-release side `Г@&`. E exists only on a complete bud; an `&` side binds only while its triangle hears an
open signal, and on a complete bud only a waiting anchor sends one; once it hears none the side is spent for ever.
So the receptor is open exactly while a complete bud waits for its catch (openRange covering the 40 bonds from anchor
to E). The pattern is general: a site placed on the part made last, with an `&` mark, asks "complete and still
waiting?" with no new rule. Cost found: a parent hears its attached bud's open signal (its seed cell is next to E), so
a parent whose own bud is already growing when it catches keeps its receptor open; buds that bud only after letting
go (candidate (n)) would close that too.

## A body taken apart whole returns one of each of its parts: lysis (explore run 20261004-2051, 2026-10-04)

The first reverse path (RULES, Core changes; INNOVATIONS run 2051). Why this one of the user's four ideas: turning
typed triangles back into blanks loses what a body knows (a part type is remade only by copying an exposed copy of
it, so decayed types run out: run 1021's setup C); cutting single bonds at random splits a one-row arc into two
pieces whose open fronts both regrow. Taking a body apart whole, in one wave, returns exactly one of each of its parts,
fresh, the per-type balance a pool needs. Lessons: (1) **a cut must spread, or the pieces regrow**: lysis moves one bond
per pass, and a lysed triangle binds nothing until it is free; (2) **a joint stops it**: the `&` bond between a bud and
its parent is the one bond made to come apart, so lysis does not cross it and a parent survives its bud's death;
(3) **who dies is chosen by glue and by where the target sits in the growth order**: a cutter is a part that binds a
waiting anchor, the site that is open only while a bud has no strand; with the anchor early in growth (cell 6) every
growing bud dies, with it late (cell 44) only a nearly complete or waiting one; (4) **the kill rate must lose to growth
and catch**: 4 cutters in a 30 x 30 world find an open anchor in 4-10 thousand steps, faster than a bud's last two
parts arrive one copy each, so a lineage needs few cutters, more parts, or an anchor that opens last; (5) **freed parts
lie next to their old sites**, so they re-bind within a pass or two: that exposed a one-pass lag in the open relay (a
triangle joined by partners that were free a pass ago hears 0, so a re-bound root is released as complete), an old
weakness that slow growth from a pool hid (candidate (o) in NEXT). Predation and scavenging (the user's interest)
follow from the same mark with other glues: a cutter whose side matches an adult's exposed site would prey on adults.

## Rules must let replication go on indefinitely: a way back to blanks (user, 2026-10-04)

The user asked whether any block can be changed or only blanks: only blanks change (contact copying turns a blank
into a copy of the part it touches); typed parts never turn back and bodies never come apart. "If only blanks then
the simulation will just run out. Rules in the simulation should be set so it can continue replicating indefinitely
(and probably reverse stuff)." Measured the same day (build run 20261004-1021, INNOVATIONS): in a closed world the
blanks end as kit parts, leaked strands and new bodies, and the lineage stalls after 2-3 generations; a labelled
drive returning unused monomers to blanks only churns, and one returning free kit parts empties the rarely copied
types. So the core needs a reverse path (typed triangles back to blanks) that keeps every part type available, and a
way for finished or dead bodies to come apart: a core change (explore or core-review run; NEXT, candidate (m)).

The user's follow-up ideas (same day, "just ideas, not thought through"): whatever rule set the world settles on must
have no limit that eventually stops replication, so blocks must circulate back into the mix, by decay or by a
mechanism. (1) **A block type or mechanism that cuts other bodies' bonds** (very interesting to the user: it could
evolve into predation and scavenging: something that takes apart dead or living bodies and returns their parts).
(2) **Wider molding:** contact copying could act on typed triangles too, not only blanks. (3) **A way to revert
blocks to blanks.** (4) **Molding one side at a time:** a copy changes one side per contact, so a triangle can move
step by step to more or fewer side rules (types change gradually, in both directions, instead of a blank becoming a
whole copy at once).

## "Feeding" the offspring means giving it building blocks (user, 2026-10-04)

The user, on the goal sentence "feeds it until it can live on its own": the intent is that the parent provides the
offspring with all the usual building blocks it needs to grow and later replicate itself, not a new block type or an
energy type (energy existed in the removed casting lineage). In this world the building blocks are the unit
triangles themselves: copy blanks `-?-?-?` (untyped) and the parts and monomers made from them by contact copying.
Records have called blanks "food"; read that as "building blocks". Today the bud takes its parts and blanks from the
shared environment directly and the parent gives it only a seed site and a strand, so the goal's feeding step (the
parent passing building blocks to its bud) is not built yet.

## Breadth starves depth: a bud should bud only after it lets go (build run 20261004-1721, 2026-10-04)

Measured in `budcycle` with a sink census (INNOVATIONS, run 1721). Every chain whose bud never copied its own strand
failed the same way: the bud, complete and waiting for its catch, grew its own bud from its seed site, and that bud
caught the next leaked strand first. Food was there; the order was wrong. Nothing local stops an attached bud from
budding, and no seed cell hides the attached bud's seed site. An oracle that opens a bud's seed site only after it
lets go makes every chain bud copy its strand after let-go, which is the goal's "lives on its own" in local terms, but
two costs show: the lineage now waits on catches (100-400 thousand steps each: the parent copies its strand only
4-12 times), and when catches come faster (no E source) the parent and every adult keep budding, so surplus buds of
generation 1 take the fixed pool before generation 3 starts. Lessons: (1) in a closed world, breadth (the number of
buds each adult makes) and depth (generations) draw on the same stocks; a lineage that should go deep needs either
material coming back (the reverse path) or a limit on breadth; (2) a sink census per template is cheap and settles
"is it food or order?" before a layout is changed; (3) a component placed at the pore (the E source) takes the food
that comes in first: placement decides who eats, as with the fronts in run 0251.

## A stock is not a metabolism (direction check, review-intent run 20261004-0751, 2026-10-04)

Measured with the census in `budcycle-free` (INNOVATIONS, run 0751): the food stock is gone by the first split and
the part pool's mean halves over two generations, so the lineage ends when either stock ends. With conservation,
indefinite cycles need a material loop: food that keeps arriving, which in a closed world means material returning to
food (waste monomers, free kit parts and abandoned bodies decaying to blanks: a labelled drive) or an open boundary.
The pool is renewable in principle (a growing bud makes about 2 kit copies per part used while food lasts) but has no
per-type regulation: a front waiting for part k+1 exposes part k, so scarcity makes copies of the type before the
scarce one, not of the scarce one. Lessons: (1) count every prepared stock's balance per generation before calling a
cycle self-sustaining; (2) "lives on its own" (the goal) has a local measure, the bud's own copies after the split and
its own bud's catch of one, and that is the target, not the number of generations alone.

## Sterile leaks make the doorway unnecessary: bud off the corner (explore run 20261004-0621, 2026-10-04)

The kind's doorway (the bud's pore facing the parent's) was designed when the bud had to receive a strand directly.
Since `heldCopy` (run 1720) a leaked strand is sterile but catchable: the parent's 7-cell pore leaks every copy, and
any waiting anchor can catch one from open space. So the bud can grow anywhere on the wall. Placing it across the pore
cost the most: the growing bud sat in the parent's food stream, and once complete it sealed the pair, so a parent
without a copy by then never made one (run 0251). With the seed site on the cell beside the top-right corner
(`budKit(..., seedAt=45)`) the bud hangs off the corner, its pore facing the parent's across an open wedge: food reaches
both pores, leaked copies drift into the bud's, and the bud may complete long before it catches (it waits; its root
holds while the waiting anchor emits). Lessons: (1) a mechanism made redundant by a later rule can be the next
bottleneck: re-check old layout choices when a rule changes; (2) the order "complete, then catch" is now safe, so the
race between growth and the parent's copying no longer matters. Still open: the bud copies its caught strand only 0-2
times after the split, so a lineage runs on its first parent's copies; a bud whose own copies feed its own bud is the
next step for indefinite cycles. Other outer cells give other wedges (the pose of each is in `budKit`); only 45 tried.

## Food goes to whatever templates are exposed; walls should not be templates (build run 20261004-0251, 2026-10-04)

Measured with `budcycle` without the harness (INNOVATIONS, run 0251). Contact copying turns a blank into whatever
attached triangle it touches first, so food divides among templates by exposure, not by need. The kind exposes
dozens of open wall sides and one held strand; three quarters of the food became kit parts. Three lessons.
- **A stock is taken by the fronts of its time.** Copies per part used go as blanks / parts near the front (run 1221's
  law), so a stock is converted at the first fronts (types 0-9 here) and nothing is left for later ones or for the
  genome. Narrowing which sides are copyable alone does not help (oracle: the copies move to the `@` fronts); food must
  arrive over time (a supply, labelled) and templates that need none must be closed.
- **Walls should be closed sides.** The kind's wall sides were `-&` (copyable until completion spends them); a growing
  or anchor-waiting bud keeps 16 cells open for a long time, in the doorway where the parent's food passes. A `-|` side
  (the anchor mark, no glue) is closed from the start: a wall needs no other property. With a supply, closed walls
  move the food to the genome (gen2 0 -> 2 of 4).
- **The sealed pair starves the parent.** Once the bud is complete before its anchor has caught, the pair is sealed
  (pores face each other): no food reaches the parent's founder, so no copy is made and no catch ever comes. The
  parent must copy while its bud grows: the order "catch, then complete" (7 of 8 in run 2221) is a race against the
  food supply. Ways: a bud that grows slower than the parent copies (fewer parts per type), food inside the parent at
  the start (30 blanks inside made it worse: 0 of 4, monomers made but not assembled; not understood), or a kind
  whose bud cannot seal before its catch.

## Monomers are made in proportion to exposure, not to need (explore run 20261004-0022, 2026-10-04)
Contact copying turns every blank into a copy of whatever attached side it touches first, so the mix of genome
monomers follows which sides are exposed, not what copying uses. Anything that adds exposed sides of one type skews
the mix, and the scarcest monomer sets the copy rate while the others pile up as dead food. In `budcycle` one binding
did it (a back monomer glue-capping a strand's low end: the cap hid one face monomer's source and was itself copied
over and over; INNOVATIONS, run 0022); removing strand-end glue binding brought the mix to about 1 : 1 : 1 and the use
from 17-46% to 47-86% of what was made. Lessons: (1) count a food sink by what is made and what is used, per type,
before blaming the amount of food ("food after the split" in run 2221 was mostly this); (2) a rule that stops copies
in one place moves them elsewhere (the oracle for free strands, candidate (g): the blanks went to the held strands
instead), because every blank is copied somewhere; (3) left over: a copy still uses 2 : 2 : 3 of a mix made about
1 : 1 : 1, so back monomers can run short first now (seed 1: 18 left with 77 face monomers), and the strand's
middle faces are copied far less than its ends (seed 3: 9-10 copies each, against 43-53 for each end's two free
sides). In a sealed cell with little food (`imprint m`, 60 blanks) the backs are the limit already: 13-19 fills to
30-36 docks, 3-5 strands where the caps' back copies had allowed 5-8. A genome whose exposure matches its use would
waste less; not tried.

## A bud that catches early splits early and finishes alone (build run 20261003-2221, 2026-10-03)
The kind was designed for one order: the bud completes (sealing the pair), then catches a copy, then lets go. In
`budcycle` (no stand-in) the bud's anchor on arc cell 6 is exposed from the moment cell 6 binds, next to the pore
the parent's copies come out of, and catches one while growing in 7 of 8 worlds. With openRange 9 its root then hears
nothing (the front is more than 9 bonds away) and lets go: the bud leaves as an open arc holding its strand and grows
the rest of its wall alone from the pool. Three consequences. (1) It is a working cycle, not a failure: every such bud
completed and ended in its parent's state. (2) The sealed pair's last-cell problem (run 1420: only an E part inside at
sealing finishes the bud) disappears, because the early-split bud's last site opens outward; it returns only when the
bud completes first (seed 2 of the openRange 50 batch stopped at 46 of 47). (3) Making the root wait for both
(openRange at least N - 1, 46) keeps the whole bud unspent while it grows, and blanks copy its wall 2-10 times more
(time and food at the doorway, and in 2 of 4 worlds the founder's first copy stalled). So openRange 9 stays: the
order of catch and completion is left to chance, and both orders end in the same state.

**Food after the split is the next limit.** Blanks copy the sides of every strand, held or free (sterile strands are
still contact-copied), and the copies pile up as free face and back triangles only a held strand can use: 200 blanks
are gone by t = 75000, long before most splits (t = 145000-218000). Recycling free genome triangles outside the cells
into blanks (a labelled drive) recycles the parent's own face copies before they dock and did not raise the bud's
copies. Ideas for the next run: the strand's triangles as `&`-like sides that are not copied once the strand is free
(no core: would need a mark that reads "held"), a hooded feeding pore on the kind (IDEAS, run 1650: one opening per
body), a larger or steady food supply outside, or fewer strands per generation (one copy per bud is enough for the
cycle: the bud catches one).

## The kind's anchor moves off the pore's edge (build run 20261003-1921, 2026-10-03)

With `heldCopy` an anchor holds a strand by its high end, and a strand held that way leans the other way from one held
by its low end. On the root's pore side (where run 1121 put the kind's one anchor, so that it could both catch and
hold) it stands out of the cell into the doorway, in parent and bud alike (`budpore` dry-runs `BUDDRYP`, `BUDDRY`), and
the pair never splits. So the anchor goes on an inner side further round the arc: even arc cells only (in a one-row
ring the free side alternates inner and outer), and of those cell 6 is best (backs and faces furthest from the wall;
cell 4 copies 1-4 times after the split where cell 6 copies 3-11). What the move costs and keeps:
- The root still holds the bud by its `&` seed bond, but now hears the waiting anchor from 6 bonds away, so openRange
  must exceed 6 (9 in the test and `budpool`). More cells hear during growth, so fewer of their sides are spent while the
  bud grows: about three times the copies (a food sink), and more of the pool's types refilled.
- The anchor is exposed to the outside from cell 6's binding until the bud seals the pair (on the root it was exposed from the start). A strand caught then (a
  leaked, sterile copy, which the catch makes fertile) would silence the anchor early; the root then holds only while
  the growth front is within range of it, which it is not after cell 9 or so: an early catch would split an unfinished
  bud. Not seen (`budpool` has no strands); a question for the whole cycle (priority 3).
- The two numbers that decide a held founder's first copy (the back sites' distance from the wall, and no face site
  nearer than 1.00) are necessary, not sufficient: sides beside the doorway with good numbers fail (copies leave).
- A sealed parent with few blanks inside can still stall at its first copy (no back copy among its 20 blanks); in the
  kind the parent copies through its open pore before a bud seals it, so the pair should start with copies made.

## The kind's opening: the parent cannot see its bud finish; make free strands sterile instead (explore run 20261003-1720, 2026-10-03)

Run 1650 asked the next `explore` to weigh three designs for the parent's opening (narrow at rest, wide once the bud
has sealed the pair, narrow again after the catch). On paper, in the kind's geometry (`budKit`), none works:
- **The bud's last cell touches its parent only on a spent side.** The bud is its parent turned by an involution T
  that maps the root's seed edge onto E's seed-site edge, so it also maps E's seed edge onto the root's: the bud's root
  sits on the parent's E (the seed bond) and the bud's E sits with its seed side on the parent's root's seed side, and
  that is the only edge they share (E's link holds the bud's cell N-2, its third side faces the doorway). The root's
  seed side was cut by completion release at the parent's own split, so it is spent and binds nothing: the event "the
  bud is sealed" never reaches the parent. Design (i) (a resting emitter at the parent's root silenced by the bud's last
  cell) has no bond to do it. Making that side reusable moves the cut to E's seed side, which is then spent after the
  first bud (one bud per cell), and E's `&` seed side would be spent at rest anyway (E hears no signal).
- **A release by signal fires at the wrong end.** Signals move through bonds only. The bud's root binds the parent's E
  and emits (its anchor and its forward link) from the bud's first cell on, so a release by signal on the E side opens
  the parent during the whole growth (100-200 thousand steps, the pair is not sealed until cell N-2); on the root side
  it never fires (the bud's front is 40+ bonds away through bonds, and the kind's openRange is 1-3). Design (ii) fails
  on timing, not on locality.
- **Fission** (iii) needs a septum and insertion growth on rigid bodies (two cuts, halves re-aligned flush): no step
  of it is near. A hood keeps strands in and therefore out: no transfer through it.
- **Turn the problem round.** The opening matters only because a free strand outside copies itself from the open food
  faster than any cell (run 0320). If only a strand held at the wall is copied, a leaked strand is sterile: it costs the
  cell one strand and feeds nobody's copying (its free sides are still contact-copied, which makes dockers and fills that
  any held strand can use). Then both cells may keep their 7-cell pores, the doorway needs no closing event, and the
  parent's founder and the bud's caught copy are the templates. One condition on an existing relay does it: zip starts
  at a strand's high end only while that end's spare edge is held (not by `&`). Option `heldCopy` (RULES, Core changes,
  run 1720). Biology has the same arrangement: a bacterial chromosome is replicated from an origin attached to the
  membrane, and naked DNA outside a cell is not replicated.
- **What it asks of the kind.** Anchors must catch high ends (glue `Z`, the genome's high-end seed `z`) and carry `@`
  (a free face copy carries `z` and caps a plain `Z|`: seen in this run's first batch, the pitfall of run 0751 again);
  a cell's copying is linear (one held template) instead of exponential inside; leaked strands pile up as inert
  material (and can be caught by any waiting anchor, which is a transfer, not a loss).
- **Measured (same run).** `imprint` with a held founder: three rival strands outside leave the cell 6-7 strands (2-3
  without the option); a 7-cell pore leaks every copy and the founder keeps copying. `budpore 300` (open pair, both
  anchors on high ends): the bud makes 10-15 full copies after the split in every world that split (5 of 8 seeds and 3
  of 4 checked; 0-1 without the option). M2, open since run 1921, came from one condition on zip, not from closing the
  doorway. Left for the kind: a held founder must finish its first copy alone (its backs must face open space, since
  no back copy exists until it has made one); the kind's root anchor holds the founder at the pore's edge (run 1121:
  it jams the doorway), and the transfer on the kind's own layout is untested.

## The kind's opening: one opening per body, and only silence widens one (build run 20261003-1650, 2026-10-03): analysis

Priority 2 asks for an opening that is wide while a strand crosses to the bud and closed to strands while each cell
feeds. Three arguments (not runs) narrow the designs:
- **One opening per body.** A cell whose wall is one connected body has at most one opening (one passage between its
  interior and the outside). Two passages would make a loop through the interior, one passage, the outside and the
  other passage; the wall pieces between the passages lie on both sides of that loop, yet the wall is connected and
  never crosses it (on the torus too, for a cell smaller than the world). So a hood joined to both sides of its pore
  adds nothing (the ring already joins them; the corridor's mouth is still the one opening), and a feeding pore beside
  a doorway can exist only while a second body (the attached bud) joins the two wall pieces; that doorway must be
  closed by a binding event before the bud lets go, or the cell falls in two. Candidate (a) of NEXT reduces to "one
  opening" or "a doorway that exists only while the pair is joined". The pitfall "one gap per one-row ring" is a case
  of this.
- **Only silence widens.** In the copy lineage the one rule that cuts a bond is completion release, which fires when a
  triangle hears no open signal. A cell at rest (no growth front, no waiting anchor, no unbonded `@` side with glue)
  hears nothing, so every `&` bond in it is already cut: an opening narrowed by bonds at rest (a plug, a cap, grown
  cells) can widen later only if something within openRange of those bonds emits all through the rest and falls
  silent at the right moment. An emitter at rest is an unbonded `@` side with glue (a waiting anchor; a seed site
  written `y@`), and it keeps every side within openRange unspent, i.e. copied: a food sink.
- **The bud cannot time its parent near the junction.** The bud's root carries its anchor, which emits from the moment
  the root binds until it catches; so every parent cell within openRange of the bud's root (the parent's E and its
  neighbours) hears a signal without a break from the root's binding to the catch, and the silence after the catch is
  the split itself. A release in the parent before the catch can happen only far from the junction, at the parent's
  root, which the bud's front reaches last (by the pose): there the bud's last part could bind and silence a parent
  emitter, the one local event that marks the bud's completion.
- **Consequence for the kind.** Each generation the parent's one opening must go narrow (rest), wide (before the bud's
  catch), narrow (after the catch, before the split), each step a binding event: the widening a release (a resting
  emitter at the parent's root, silenced when the bud completes), the narrowing a second catch ordered by parity after
  the bud's (cap release, run 0751: 2 of 4). A released `&` side is spent and a bonded anchor catches nothing, so the
  parts that narrow the opening must be replaced every generation (grown again from copies). Designed in outline only,
  with three orderings that are each a race: not built. The next `explore` should weigh it against (i) fission with
  insertion growth (no transfer, so no doorway at all) and (ii) a core candidate, a release by signal (a bond cut while
  its triangle hears the open signal: the opposite polarity of `&`, read from the triangle's own signal), with which
  the bud's approaching front would reopen the parent's opening directly; the narrowing after the catch would still be
  a catch.
- **The bud's half already has its event.** The bud's opening narrows by its own catch (its genome as the plug, run
  0320: the bud alone made a full copy in 3 of 4), so the bud's half is solved by a binding event that exists; the
  parent's half is what the arguments above constrain.

## The kind's bud from a part pool: the last cell comes from inside; the pool has no per-type regulation (build run 20261003-1420, 2026-10-03)

Measured with demo `budpool` (INNOVATIONS, run 1420): a prepared parent of `budKit(5, 7)` grows its bud on its seed
site from a pool of all 47 part types plus copy blanks (a harness turns each copy back into a blank, so the pool keeps
its composition; openRange 1, the anchor on the root). Growth itself works: one cell after another, no stray binding
in 14 worlds. Three lessons for the kind.
- **The last cell can only come from inside the pair** (geometry, holds for the whole family). The bud is its parent
  turned 180 degrees by T, with T(the root's seed edge) = the parent's seed-site edge. T is its own inverse, so the
  bud's last cell E always lies with its seed side on the parent root's seed side. Its link side holds cell N-2, and
  its third side faces the bud's pore, i.e. the doorway. So once cell N-2 binds, the pair is sealed, and the last site
  opens only into it: only an E part already inside can complete the bud. Measured: with 8 E parts (as many as every
  other type, 30 x 30 world) the bud completed in 2 of 4 worlds, exactly those with an E part inside at sealing (1, 0,
  1, 0); with 40 E parts it completed in 8 of 8 (1-7 inside). E parts inside per E part in the world: 0.088, so
  P(complete) is about 1 - exp(-0.088 n_E) here (an inside area of about 80 of 900). Any kind whose pore lies between
  root and seed cell (the condition for facing pores) has this property, and a stalled bud waits for ever.
  Where E parts come from: the seed site `y` is plain glue and is copied whenever no bud sits on it (parent and bud
  alike), so a lineage over-produces E by itself, at the cost of food. Ways out, for priority 2 (the kind's opening):
  keep it and count on E-rich surroundings; give the parent an E source inside (a plain side of E facing the doorway:
  copied by the parent's own food, a food sink); or a kind whose last site is not at the pore: two fronts from two
  seed bonds (one per pore edge) meeting mid-wall, which needs the parent root's seed side to bind again after its own
  split (a spent side binds nothing: a core change).
  **Built (run 20261003-1650): an E source inside.** E's pore side plain (`budKit(..., eSource)`: `-` instead of `-&`,
  never spent) is copied by any blank that reaches the pore, so E parts form in the pore, which is the pair's inside
  once the bud has grown round. `budpool` with no E part in the pool (`BPES=1 BPE=0 BPB=16`): complete in 4 of 4, every
  last cell a copy of the parent's E (12-14 such copies per world; check `budpool-e`); with 8 E parts like the other
  types 4 of 4 (was 2 of 4); with 8 blanks and no E parts 5 of 7 (the two failures had no blank and no E copy inside
  after sealing). In the 16-blank worlds the E part that finished the bud was made long before sealing and was
  inside at sealing by drift (one in each), so the source works mostly by stocking the region around the pore, not
  by copying after the seal (once, in an 8-blank world, a copy made after sealing finished it). The kind then needs
  no E parts in its pool: each parent makes its bud's last cell. Cost: the plain side is copied at rest too (a food
  sink, not measured with a fed parent), and the E parts it makes accumulate.
- **A pool of unique types has no per-type regulation** (argument, supported by the runs). Copies of type k are made
  while cell k is the growth front, i.e. while it waits for part k+1 (openRange 1; with r > 1 also while the next r - 1
  cells arrive). So copies of k scale with the wait for k+1, which goes as 1/n(k+1), not with n(k): correlation of
  the wait for k+1 with the copies of k 0.56-0.78 in 4 worlds. The steady state (every n about c B) is neutral: a
  type's own count has no restoring force and drifts by about one per generation (Poisson copies, one used), so in a
  balanced pool some type dies out after about n^2 generations, and with it the lineage (walls are spent: no template
  of it is left). A supercritical pool (more than one copy per use) outruns the drift but grows on food. Measured: 0.91
  to 1.85 copies per used part (mean 1.37) at one part of each type per blank (8 and 8), as the law of run 1221
  predicts ((r + 1)/2 to r + 1 parts per blank for one copy per use). Fewer types make each count larger and the drift
  slower; a template that is copied when its own type is scarce would regulate, and none exists in this kind.
  Without the harness, with a stock of 100 blanks as the only food (`BPHOLD=0 BPB=100`, seed 1; the bud completed at
  157048): the parent's free seed site took 15 blanks before the root bound (E copies), the root 24 and cells 1-7 another
  31, and the stock was gone by cell 35; the last 12 types got no copy. As run 1221 predicted, the first fronts take a
  stock: a refill for every type needs blanks arriving all through the growth (a supply), not a stock.
- **Growth time grows as the square of the number of types.** Waits per cell spread from 8 to 32000 steps (median
  1500-2500) at 20 percent area cover, so a bud takes 100-200 thousand steps. At fixed cover each type's density goes as
  1/types, and a bud needs one wait per type. The same pool in a 24 x 24 world (30 percent cover) was slower (34 and 42
  of 47 cells at 160000 steps): crowding, not distance, limits the rate. Another argument for the periodic ring with few
  motif types for cells larger than R 5.

## One opening cannot be both doorway and feeding pore (direction check, review-intent run 20261003-1321, 2026-10-03)

The closure kind (below) feeds through the same 7-cell pore its parent's strand crosses to reach it. A doorway must
pass a strand (3-cell halves pass none, run 1121); a feeding pore must pass none (free strands outside starve every
cell, run 0320); and fixed openings pass strands both ways. So an organism on copies needs, at each opening, a binding
event that closes it to strands after the transfer and, if the same opening serves the next bud, one that reopens it.
Candidates for the design slice (NEXT, priority 2): a hooded feeding pore beside a doorway that the caught strand plugs
(two gaps cut a one-row ring into two bodies; a hood held on both sides of its pore would join them, untested: the
`imprint ph` hood hangs on a strut at one end); one opening plugged by
the caught strand and released by the next bud's growth; fission, which needs no transfer but needs a membrane that
grows back (insertion growth, below). Not yet weighed in detail.

## Closure by design (build run 20261003-1121, 2026-10-03): designed, not demonstrated

The question (NEXT, priority 2): one organism kind whose bud is the same kind, every part grown from copies or taken
from the environment. Result: the kind of `structures.budKit` (INNOVATIONS, run 1121), found through four constraints.
- **Growth cannot stop beside a gap.** A ring grown from a periodic motif (ringKit) ends only by closing onto a cell
  already there: cells of the same motif index are interchangeable, so a special cell placed by its glue lands at any
  of the six repeats. Hence every unique cell (anchor, seed site, closure target, door) must lie on a segment of unique
  cells that grows from the root, and an opening in a grown ring is made either by all-unique cells up to its far edge
  or by unique cells released later.
- **A bud's pose is fixed by its seed bond.** A bud of the same kind attached by its root to the parent's seed cell on
  the same wall is the parent turned 180 degrees about the midpoint between the parent's root and seed cell. So the two
  pores face each other only if the pore lies between root and seed cell (the seed cell is the root's mirror image
  across the pore), and then the bud's seed cell lies on the parent's root: covered until the split, free after it.
- **One signal, two events.** With the open signal the only release, a door that must open at ring closure while the
  bud still holds on until its catch can be ordered only by distance: the root must hear exactly 1 from the anchor
  (openRange = k + 1, k = anchor distance) so the door's neighbour hears 0; that neighbour must also hear something
  while its door cell has not arrived, which holds only while the other growth front is within reach: a race (estimated
  1 bud in 10 lost at the smallest distance). The all-unique ring has no door: its doorway is open from the moment its
  last cell arrives, and only one release remains (the split, by completion after the catch).
- **Every part must be copyable at some time.** The next generation's parts are copies of this generation's cells,
  made while their free sides are unspent (within openRange - 1 bonds of a growth front or the waiting anchor). Spent
  walls protect the food and still pass the kit on, because each cell is copied during its own bud's growth. A cell
  whose free sides are all `@` would be copied only through `@` sides (the root `W@|Y@&b@`): copy-blank narrowing (c)
  would cut the lineage there.
**The kind** (R 5, `budKit(5, 7)`): root `W@|Y@&b@` at the pore's left edge (seed bond out, anchor into the pore), 45
unique wall cells (`&` free sides), last cell E with the seed site `y` at the right edge; 7-cell pore. Life cycle,
each step with the demo closest to it: (1) the cell feeds through its pore and copies its genome (`imprint p`, works);
(2) a free root copy binds its seed site `y` and the bud grows one cell after another from copies of earlier buds' cells
(`imprint`: a ring's cells multiply and a second ring grows from the copies, 3 of 4, periodic R 3; along a parent's wall:
`budgrow`, casting lineage; from a pool of 47 unique types: not demonstrated); (3) the last cell closes the pair: the
doorway joins the two cells only, the bud's anchor waits (its open signal holds the root's `&`); (4) a parent strand
crosses the doorway and the anchor catches it (`budpore`; with this kit's 7-cell doorway 4 of 4 with the founder away
from the doorway, 1 of 4 with the founder on the parent's root as the kind puts it); (5) completion cuts the root's
seed bond: split (`budpore`, test "closure (budKit)": the bud is then in its parent's starting state); (6) both cells
feed through their pores again, the parent can bud again on its free seed site (M2: partial). Rules read: binding of
parts by `@`, contact copying, the open signal (one bond per pass), completion release (own `&`, own signal), the anchor
catch (labelled physics). No new rule.
**Open, in order:** the anchor must not hold the founder in the doorway (move it k cells from the root, openRange k + 1;
dry-run where a held strand leans away from the doorway); 7-cell pores leak strands after the split (M2's food problem,
plus a hood or a narrower opening that strands still pass); the part pool (47 types kept across generations by the
copies each bud's growth makes) is untested; a radius-5 cell holds only 3-4 strands and 20 blanks. Bigger cells need
more letters: reuse letters in separate compartments (user idea below) or the periodic ring with door cells and its race.
**The periodic alternative** (for R 7 and larger; not built): root, a unique segment with the anchor k cells
counter-clockwise, and clockwise a buffer cell X, 4 door cells and E, whose far side is a closure target `@.` (it emits
until the long periodic front closes onto it, so the door cells are held exactly until ring closure); X's door side `&`
hears 0 after closure and is spent (no door cell can re-attach); needs k >= 5, openRange k + 1, and loses the bud if
the anchor cell arrives before X and the first door cell.

## Closure: what a part pool costs (explore run 20261003-1221, 2026-10-03): law measured on one front, pool designed

The closure kind (above) grows its bud one unique cell after another from free parts, and the next generation's parts
are copies made while cells are unspent. How large must the pool be? An argument, not a run (a pool of 47 types does
not exist yet in any world):
- **When a cell is copied.** With openRange r (the kind needs r = k + 1, k = the anchor's distance from the root) a
  cell's `&` side is unspent while a front emitter is fewer than r bonds away, i.e. from its arrival until r more cells
  have arrived; its forward link (an `@` side, never spent) is a free side until the next cell arrives. With the
  narrowing of this run (a copy blank binds no anchor side) the anchor cell follows the same law; before it, a waiting
  anchor was copied for as long as it waited (22-35 times per world in `budpore 300`), far more than any other cell.
- **Blanks and parts reach a site at the same rate.** Both are single unit triangles moved by the same kicks, and
  binding takes either within `capture` of the site whatever its orientation. So while front j waits for part j+1, the
  expected number of copies it gets is the ratio of blanks to parts j+1 near the front, per free unspent side, summed
  over the waits it stays unspent: two free sides during the first wait, the `&` side alone during the r - 1 waits
  after, so c_j = (2 + (r - 1)) rho_blank / rho_part = (r + 1) rho_blank / rho_part.
- **Steady state.** Each generation uses one part of each type and makes c_j copies of it, so the pool is steady when
  c_j = 1: about r + 1 parts of each type per blank near the growing bud, and 46 (r + 1) parts per blank in all for
  the R 5 kind (92 per blank with the anchor on the root, r = 1). A smaller pool grows by itself (each front waits
  longer and is copied more) but converts the food into early types first: from one part of each type and 100 blanks,
  the first fronts would take most of the blanks before the ring is half grown.
- **Consequences for priority 3.** (a) Seed the first pool at the steady ratio (labelled), and keep blanks scarce
  where the bud grows: the bud grows best outside the parent's food, in a part-rich medium, and the genome is fed
  where parts are rare (inside, through the pore). (b) Fewer types help linearly: a periodic ring of m motif types
  needs m (r + 1) parts per blank (14 for m = 7), so the periodic alternative with door cells (above) is worth its race
  for large cells. (c) Every plain free side is copied for ever: the kind's seed site `y` (plain glue, never spent)
  makes copies of E whenever no bud sits on it; one of the kit's costs to measure.
- **Measured on one front (demo `pool`, same run).** With B and n held fixed by a harness: copies at the forward site
  per bound part = 0.90-1.03 x B/n when it is the only copyable side of its body, 0.48-0.55 x B/n with three more
  copyable sides beside it (they absorb blanks before these reach the front; parts are not absorbed), plus about as many
  again at the front's `&` side. So the estimate holds up to a geometric factor near one half: about (r + 1)/2 to
  r + 1 parts of each type per blank near the bud.
- **Not yet checked:** a whole bud growing from a pool (47 types), and crowding at that many parts per blank. (Checked
  in run 1420, demo `budpool`: section above.)

## Grow a finished membrane by breaking it and inserting triangles (user, 2026-10-03)

"A mechanism to grow or lengthen a membrane after it is built by breaking and inserting triangles. Just a thought,
don't know how feasible." Not built yet; first notes (harden run 20261003-0950, analysis only):
- **Why it matters here.** Closure (NEXT priority 2) needs the bud to become its parent's kind; today the bud is a
  smaller ring (R 5 vs R 7). A bud that is born small and grows its ring after the split would remove that asymmetry,
  and a small bud is cheaper to grow and to wall off. It also gives a cell room for more food (bigger cells, above).
- **Rigidity: one cut opens nothing.** A ring cut at one place is still one rigid body (physics moves bonded blocks as
  one piece), so the gap never widens. It needs two cuts, so the ring falls into two halves that can move apart.
- **Lattice closure: insert on opposite sides together.** A hexagonal ring of unit triangles with sides a1..a6 closes
  only if a1 + a2 = a4 + a5 and a2 + a3 = a5 + a6. Lengthening two opposite sides by one each keeps that (an elongated
  hexagon); one side alone does not. One-row walls alternate up and down cells, so each seam takes a rhombus (two
  triangles). So: two seams on opposite sides, each a `&`-style bond that lets go, each refilled by two triangles.
- **The hard part: keeping the halves aligned.** Two free halves drift and turn; re-closing needs them flush again
  (glue closure only binds flush sides, 0.05). The one existing move that brings a whole body flush is the anchor
  catch (`_snapBody`), which today takes only strand ends. Options to weigh: inserts that grow from one half as a
  front (open signal holds the other seam closed until they arrive), so only one half moves at a time; or a seam
  that hinges (casting-lineage hinge marks, removed from the core on 2026-10-03: they would come back only through
  the RULES gate) so the halves stay joined at one corner while the gap opens. Either needs
  a design sweep before a demo, and possibly a core case (a body catch on a seam side) under RULES "Core changes".
- **Where the inserts come from:** copy blanks binding the exposed seam ends (as `imprint`'s growing front), so the
  insert is a copy of the wall cell beside it; the walls must be unspent there while the seam is open.

## Shut the parent's half by a catch after the bud's (design lesson, build run 20261003-0751, 2026-10-03)

- A bud on copies starves if any parent strand is outside after the split (free strands beat cells), so the parent's
  half of the doorway must be shut by the time of the split. Shutting it by a binding event (a catch) is the one-way
  step; the catch must come after the bud's, since a parent plug that catches first narrows the passage to a pore no
  strand passes.
- Ordering two catches locally: the parent's plug anchor is bonded to a free cap while the bud's anchor waits; the
  decaying signal releases the cap one pass before the doorway (parity of distance), and the freed anchor's own signal
  then holds the doorway until it has caught (`budpore` option `BUDCAP`, INNOVATIONS run 0751). A tooth bonded to the
  bud does not work: it frees the anchor only at the split, and the window lets strands out.
- Bigger cells (user, 2026-10-03) were tried for the parent: a radius-9 parent holds 160 blanks (radius 7: about 80);
  the extra food stays in the parent unless the bud is fed before its catch.
- Still open: after the split a plug in the wall exposes its backs to the outside food, and so does any freed plain
  side; a bud on copies needs its food to reach its interior before such exposed templates take it.

## Reuse glue letters in separate compartments; bigger cells (user, 2026-10-03)
User (during core-review run 20261003-0450): "It seems it is useful to have many different basic structures that can
be combined to a larger one. That needs a lot of different types of sides. One way to reduce type need is to have
connection blocks for the basic structure be different in different environments (different combination of side
types). Of course that means these areas have to be kept sterile, but possible with cell-like walls. Maybe also
bigger 'cells' are needed - much is stuffed in there now."
- Why it fits: glue letters are labels with no rule of their own, and binding is local, so a letter means something
  only among the triangles that can meet. Two sealed compartments can use the same letters for different joints, as
  cells reuse one genetic code in separate bodies. The letter budget (63 pairs, a grown bud of side 5 uses 54: NEXT,
  Pitfalls) then limits one compartment, not the world. No core change: spent `&` walls already keep compartments
  sterile (`imprint m`: every copy goes to the genome), and a hooded pore lets blanks in without letting strands out.
- What it needs: each compartment's parts must never leave it (the way in is the way out, above: openings bent or
  closed by binding), and food that enters must be uniform blanks (copy blanks carry no letters until they copy).
- Bigger cells: today's cells are R 5-7 with the genome, an anchor, a doorway and the food inside; strands press
  against walls (backs in a wedge get no copies). A larger ring costs only more wall cells, which are spent and so
  cost no food; worth trying when a slice is limited by crowding (`budpore`'s parent half).
- Not yet built or measured.

## The way in is the way out; nothing may leak (design lesson, build run 20261003-0320, 2026-10-03)

Three findings from trying to keep the parent's copies in after `budpore`'s split (INNOVATIONS, run 0320):
- **Motion is reversible; only binding is one-way.** Rigid bodies move by random kicks, so any fixed opening a
  strand can pass inward it can pass outward. When the bud lets go, the space the strand moved through is still
  empty, so each half keeps an opening at least as wide as the passage. In `budpore c` the bud's 6-cell half lets its
  copies and strands out (even with the parent's genome made inert at the split), a 3-cell half lets no strand in, and
  a narrower parent half turns the founder's backs to the wall. Only binding events are one-way: an anchor's catch, a
  copy, a release, growth. So a bud that gets a strand and then keeps it needs an opening that a binding event narrows
  after the strand is in.
- **Free strands beat cells.** A strand outside has open backs and direct access to the food; three of them beside
  an `imprint p` cell take all 150 blanks in under 10000 steps and leave the cell 1-2 strands (alone it has 1-7). So an
  organism on copies must never put a strand outside: one leaked strand starts a population that starves every cell
  in reach, its own buds included. (Nothing in the world removes free strands; something that did would be a core
  change. Until then the rule is: no leaks.)
- **A bent opening keeps strands in.** A strand is a rigid strip about 4 long; blanks are single triangles. A pore
  under a hood (a corridor two rows high leading sideways to the pore) lets blanks in and no strand out (`imprint ...
  150ph`: no strand lost in 7 of 8 worlds; the plain pore loses 4-9 in 3 of 8). The same geometry would keep strands
  out, so it cannot be how a bud gets its genome.
Ways to give a bud its strand and then close its way in, each with a binding event (for the next build or explore):
(a) **the genome as the plug:** the bud's anchor on the edge of its gap so a caught strand lies in the wall row and
fills the gap but for a pore (a 10-cell gap, a 7-triangle strand, 3 cells left); the catch is the one-way step; which
way its faces point (into the bud or out) decides where its copies form. Built the same run for the bud (faces in: the
bud alone copies in 3 of 4 worlds); the parent's half is open (INNOVATIONS, run 0320). (b) **a closure grown after the split:** a
growth site on the bud's opening whose place is filled by the parent's wall until the parent leaves, more bonds from
the doorway bond than `openRange`, grown from copies. (c) **fission:** a septum grown across the parent.

## Let go by completion, not by a machine (design lesson, explore run 20261003-0050, 2026-10-03)

A one-shot separation needs no latch, trigger or hear chain: an anchor with `@` is an open growth front until it
catches, so "the bud has its genome" is the same event as "the bud is complete", and a completion-release bond (`&`)
that hears the anchor is cut by it. Its freed sides are spent, so they are never copied (a latch's freed sides were
copied 3-105 times per world). The general point: whatever comes apart only once should be an `&` bond; latches are
for doors that close again. The cost: every unspent side that hears the signal is exposed to copying while it waits,
so the structure around the anchor must already be spent. In `budpore` the walls start spent (prepared). A grown bud
has to get there by its order of growth: its walls spent before its anchor starts to emit. How is open (the site that
takes the anchor part emits too, so walls near it stay unspent until the anchor has caught); it belongs to the
closure question (ROADMAP, Organism on copies).

## A parent whose copies leak out feeds its competitors (design lesson, build run 20261002-2321, 2026-10-03)

In `budpore` the parent's opening is also its way out: its genome copies leave, copy each other in the open food (free
strands copy fastest: their backs are open) and take 7 to 100 times more food after the split than the bud does. A bud
cannot "live on its own" beside that population, whatever its anchor. Two consequences: the parent must keep its
copies (a pore one cell wide lets blanks in and keeps strands in, `imprint p`), and the bud is best fed **before** it
leaves, while parent and bud share one sealed space (with 80 blanks inside a sealed P+D, 70% of the food went to the
genome). Getting strands to the bud's anchor through an internal doorway took one more step: the founder hangs
under the doorway, so its copies are released at the way into the bud (`budpore c`: splits 7 of 8, the bud leaves with
1-4 strands). What remains is the time after the split, when both halves of the doorway are wide pores.

## Spent walls cannot be templates (design lesson, review-intent run 20261002-1751, 2026-10-02)

Feeding on copies needs every wall side spent (`&`), because spent sides are never copied and the food goes to the
genome (`imprint m`, `imprint p`). The same rule means a complete parent cannot template its bud's ring: its wall is
spent. Ring material for the next generation must therefore come from a surface that is exposed and unspent while it
is needed: the bud's own growing front (open-signal sides are unspent; `imprint` showed one motif round of a ring
growing into a whole ring and a second ring from copies), or templates carried somewhere they stay exposed (for
example parts held on the genome inside the parent). Which one, and where each bud's first motif round comes from, is
the closure question (ROADMAP, Organism on copies). Also from this review: the organism is a lineage only if the bud
is its parent's kind; `budpore`'s bud (R 5, catching anchor, latch) and parent (R 7, holding anchor) are not.

## Programmable synthesis: decision (autorun 20261002-0136, explore, 2026-10-02)

The maintainer asked an explore run to decide between part templating, translation and kit-free growth through the
core-change gate, least core growth, at most one new rule. Decision: **part templating, as contact copying** (one
mark `?`, gate entry in RULES "Core changes"). Reasoning:
- **Closure is the test.** A synthesis scheme is enough only if it can make the parts of its own machinery. Stamp
  casting cannot: a stamp caster carries `'` marks and no cast product carries marks. Kit-free growth (no rule) cuts the
  number of types but keeps the same gap. Translation also needs adaptors that carry marks, plus a reading frame, a
  site touching three strand faces (impossible on a straight strand: the lattice's dual has no 3-cycles) and stepping:
  several rules, and the adaptors still need a way to be multiplied. Part templating closes the loop with one rule.
- **The smallest templating has no machine.** A copier pocket needs a hold for arbitrary templates (glue-agnostic),
  a read rule and a release, and its library parts are taken by growth sites. Instead the copy blank itself reads: a
  free blank with copy sides binds any free side of an attached triangle and becomes a copy of it (the partner turned
  about the shared edge). The body is the template; nothing is held, nothing is used up.
- **Costs, stated.** Information about parts then lives in the body, not the chain (the chain still decides where
  parts grow, by its seeds). Only exposed triangles are copied: a cell whose three sides are bonded is copied only
  while it is still growing (5 of the lid pocket's 16 kit cells are enclosed when complete; every cell of a one-row
  ring keeps one free side, inside or outside). Everything exposed is copied, strays included, at rates set by
  surface and blank supply: regulation is by where copy blanks are (import doors), selection acts on bodies.
- **Biology.** Membranes and cortical patterns are inherited by templating in real cells (new membrane only grows from
  membrane); here every part is.
- **What it may remove later:** stamp marks (`'`) and, once dockers are copied from strands, casting itself. (Done
  2026-10-03, core review run 20261003-2121: the whole casting lineage left the core; RULES, Core changes.)

## Programmable synthesis: the next big blocker (2026-10-01, fourth session)

Stamp casting lets a pocket cast kit parts, but one pocket makes one part type, and a cell needs dozens of types
(a cell kit has ~60). A pocket that casts its own kit (16 types) would need 16 stamp pockets, each needing 16 more:
no closed loop. Biology solves this with a code: few adaptor types read a sequence, so one machine makes many
products. Candidates here (none built; each needs a rule change, so the user should choose):
- **Part templating (simplest):** a pocket with a *read* side holds a template part and casts a blank into a copy of
  the template's type (marks included). One copier pocket then multiplies every part type present: a cell carrying one
  of each of its parts (a "library") can make all of them from blanks, and pass a library to its offspring. Local (the
  caster exposes the type of the triangle bonded to its read side, one bond per pass), but information then lives in
  the parts, not in the chain, and stray types are copied too (selection would have to act on parts).
- **Translation (closest to biology, hardest):** a reading frame on a strand: three consecutive faces each hold an
  adaptor, and a product in a notch touching the three adaptors takes one glue from each (n adaptor types give n^3
  products). Needs a site touched by three reader cells and a way to step along the strand (a ratchet).
- **Kit-free growth:** shapes from few types (periodic motifs, the 3-cell cap from one type) wherever position-specific
  parts are not needed; kits only for the machines.

## Division and segregation (2026-10-01, fourth session)

Built (demo `split`): parent and bud share a wall held by `&` pairs with a doorway through both walls; the parent's
pockets feed the bud through it; when the bud's growth front closes (open signal gone) every `&` lets go, both doors
(prepared open, always triggered, held by a `&` doorstop) swing shut and lock by a closure. Genome segregation needed a
new physical rule: a strand cannot otherwise bind an attached structure (capture needs a free triangle, closures need
an exact fit). The anchor `|`: an anchor side catches a strand end's seed as it would a free triangle, and the strand
moves as one body into place (physics; the choice is by role, not by body size). Next: grow the bud pair instead of
preparing it (a bud ring grown on the parent's wall around its doorway), and give the bud its own pockets.

## Heredity of machines (user, 2026-10-01)

User: "Without new block types it should already be heritable, no? Because the blocks on the chain it attaches to
are heritable and only bind arms." Yes: the chain carries seed glues, copies carry the same seeds (through the
docker types), and parts regrow on every copy from supply, as the typed arms already did.
- Any shape can be grown from a seed: lay its cells out as a spanning tree from the seed, give every tree edge its
  own glue pair (unique attachment), and give the remaining shared edges closure glues (they bind once both sides
  are attached), which closes rings. A pocket needs about 16 distinct types.
- Information capacity: now only the two strand ends expose seeds (hidden backs are random fills). Since
  2026-10-03 fills must carry the complement of the docker's lateral glue (once the option `latGlue`), so every back is determined by its face's docker type,
  and the face sequence decides a sequence of parts along the back: a real genome-to-body mapping.
- The bottleneck is supply: each copy needs its own kit types. A pocket that casts blanks into kit types would make
  its own parts (an autocatalytic factory, the core of a metabolism).

## Biology as a source of ideas (user, 2026-10-01: "compare to real life and evolution")

Mapping: typed triangles ~ monomers with specific pairing; complementary chain copying ~ template replication by
base pairing; casting pocket ~ enzyme active site; factory ~ metabolism; hatches and doors ~ conformational changes;
airlock with interlock ~ alternating-access transporter; scanner pocket ~ selectivity filter; stray cast types ~
non-canonical monomers and toxic by-products.
How life copes with strays: recognition of the whole shape (many contacts), kinetic proofreading (a delay before
commitment lets wrong partners fall off), sanitizing enzymes that destroy or recycle wrong building blocks,
compartments with selective transport, and a frozen code (once much depends on an alphabet, new letters are rarely
adopted). Strays create selection for accuracy, which could make proofreading evolve here.
Ideas: (1) energy for motion (built); (2) proofreading as a binding rule; (3) the "RNA world" route: the replicator's
heritable arms fold into its own pocket; (4) sanitizing pockets that cast stray types back into blanks;
(5) compartment plus transporters = a cell.

## Energy (user, 2026-10-01)

"Discharged energy shouldn't bind, otherwise the mechanism could just wait for a recharge." Built that way.

## Casting makes stray types; replicators need to scan (user, 2026-10-01)

"New types can emerge that make past machines not build correctly. If a machine relies on [if side 1 is a, then
side 2 is b], a triangle with side 1 = a and side 2 something else will block it. Still, a cast should theoretically
be able to make all sorts of triangles. Long term a replicator relying on specific blocks would need a mechanism to
scan and only let in the right ones."
- Scanner gate: the pocket already reads all three sides of a triangle (casting needs all three recognitions); a
  pocket whose instructions equal what it recognizes changes nothing but works as a checkpoint; with a hatch on each
  side it admits only triangles that match on all three sides.
- Cooperative binding (cheap, everywhere): a part stays bound only once a second side also matches, otherwise it is
  let go after a delay.

## Machines from hinges (user, 2026-09-30)

"Simulation is in need of a hinge triangle, useful for membranes; it should open with intention" (a trigger
mechanism, not free flopping); "maybe two hinges to capture better"; "a hatch catching one, then closing and after a
cast immediately opening again"; "blocks attached to hatches while they open or shut is good for moving blocks as a
machine"; "a double lock with one door closed and one open so the membrane does not drift apart". All built (see
INNOVATIONS) except two-hinge jaws. Lessons: a flap needs free space beside the side it swings toward (13% bulge);
a single rotating hatch cannot carry cargo between two sealed regions (the cell it moves cargo into always touches
the chamber), so a pump needs a carrying hatch plus a door, or a multi-blade rotor; any doorway turns a closed ring
into a C while it is open, hence airlocks.

## Design principles (user, 2026-09-30)

- (2026-10-01) "I don't care much about the simulation being byte-identical, as long as the mechanisms work. The
  simulation is mostly a tool in pursuit of the goal and letting us play out the rules." Physics and rule changes
  that keep mechanisms working are fine; re-run the affected demos, no need for bit-for-bit reproduction.

- One base shape (the triangle) and local side rules; welding is ordinary bonding. Shapes come from chains of
  triangles (letters T, R, Z by hidden backs); copies must be exact, so growth must be planned with intent (distinct
  types, terminators), not left to repeats.
- No programs in triangles ("one complexity level lower, like amino acids instead of proteins"): each triangle has
  one active glue per side; behaviour comes from types and their combination. Repeats are allowed; if unwanted,
  design the types with more intent.
- Casting should be simple and general (able to make any type), rare by chance and routine in machines.

## Adaptation and environment (user, 2026-09-29/30; for later)

- Two routes to adaptation: protection from the environment (shields, shells) or a feeding shape (funnels, pumps).
  Grown parts should be judged by these effects.
- Patchy environment: destructive zones (heat, radiation) that break and recycle, and safe zones to build in; light
  zones as energy sources (built as recharge zones).
- Fixed blocks in the environment (immovable obstacles) would let directed movement evolve (grip, crawl).
- In closed, material-limited worlds a part's cost so far outweighed its benefit (earlier triangle-chain batches):
  parts need supply that machines make, or an environment that pays for them.

## Pitfalls learned (copy lineage; moved from docs/NEXT.md, cleanup run 20261003-1351)
Roughly newest first. Add new ones here; docs/NEXT.md points to this section.
- *(run 2221)* **A late anchor starves the founder.** The held strand hangs from the anchor cell; on cells 38-44 it
  sits in or beside the pore, its first copy jams waiting for a fill, and no incoming blank reaches it (12 worlds at 44,
  4 at 40/38). The anchor on cell 6 jams too at first but clears in 100-180k steps. Place the strand where incoming
  blanks pass it.
- **Growth cannot stop beside a gap** (2026-10-03, run 1121). A ring grown from a periodic motif ends only by closing
  onto a cell already there (cells of one motif index are interchangeable among the six repeats), so a grown ring with
  a pore needs unique cells up to the pore's far edge, or cells released later. Unique cells lie on segments grown
  from the root.
- **Two aligned 3-cell halves pass no strand** (2026-10-03, run 1121; run 0320 for a 3-cell bud half). The doorway's
  waist is one unit wide and two rows long: 0 of 8 worlds; 7-cell halves pass (4 of 4).
- **An anchor at a doorway's edge holds its strand across the doorway** (2026-10-03, run 1121). A strand caught on the
  pore side of an edge cell (or one cell from it) leans over the opening; as a parent's founder it jams the doorway
  (1 of 4 transfers, 4 of 4 with the founder elsewhere).
- **A catching anchor must carry `@`** (2026-10-03, run 0751). An attached glued side without `@` binds any free
  triangle with the complementary glue (glue catch): a plain `Z|` anchor was capped by a lone face copy and never
  caught a strand. With `@` it binds only a part's `@` side, so only the anchor catch (strand ends) can take it.
- **A waiting anchor near food is a food sink** (2026-10-03, run 0751; narrowed run 1221). Its unbonded `@|` side was
  copied by every blank that touched it (29-69 copies per world); since run 1221 no copy blank binds an anchor side.
  The anchor cell's own `&` sides still stay unspent while it hears its own signal (60-68 copies once exposed): keep
  waiting anchors' cells spent elsewhere or away from food.
- **A strand lying in a wall row facing a fed interior gets no fills** (2026-10-03, run 0751). Its faces meet all the
  food and its backs none: all blanks become face copies, no back copies, copying stalls (80 copies, 12 docks).
- **Signal decay is simultaneous** (2026-10-03, run 0751). When an emitter stops, every cell within range reaches 0
  within the same one or two passes (value R - t or R - 1 - t by distance parity), so `&` cuts cannot be staged by
  distance, only by parity: a cell with R - d even reaches 0 one pass before one with R - d odd.
- **An opening that lets a strand in lets it out** (2026-10-03, run 0320). Motion is reversible: a doorway, pore or
  gap a strand can pass one way it can pass the other, and it stays open after a split. Keep strands in with a bent
  opening (hooded pore) or a binding event (a catch, growth); never count on a narrow straight opening.
- **Changing a layout moves the automatic anchor choice** (2026-10-03, run 0320). `budpore` picks D's anchor by distance
  and corners; with another gap it took the gap's edge (the strand stood outside). Pass `BUDA` and dry-run (`BUDDRY=1`).
- **Where a caught strand's backs face** (2026-10-02, run 1921). A strand caught by an end stands at 60 degrees to the
  wall, leaning one way fixed by which end is caught and the strand's handedness; its backs then face either the acute
  wedge (a back site can be covered by a wall cell) or the open side. Backs in the wedge get no copies, so there are
  no fills and copying stalls after a few docks. Dry-run the capture and measure back sites before placing an anchor.
  On a flat wall the wedge differs by side: one side over (2026-10-03, run 1520) `imprint p`'s anchor at x = 0 left the
  caught founder's outer back sites 1.53 and 1.73 from wall cells and 4 of 14 hooded worlds stalled (a founder caught
  before any back was copied: 50000-90000 steps without a fill); at x = -1 they are 1.53 and 2.31 and 14 of 14 pass.
  The back next to the anchor is always in the corner (0.58: a notch).
- **Prepared bonds need no glue** (2026-10-02, run 1921). A weld glue left on a prepared side becomes active when the
  bond is cut (a latch letting go) or on every copy of the cell: copies of `f`/`F` cells glued onto each other and grew
  crystals. Zero the glue of prepared walls; give glue only to sides meant to bind.
- **A freed side is a food sink.** Every free, unspent side of an attached triangle is copied by every copy blank that
  reaches it, glue or not (a released latch side: up to 105 copies). Count exposed sides after each event, not only at t=0.
  A bond that comes apart once should be an `&` bond: its freed sides are spent (`budpore` since run 0050).
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
- **An open-signal hold exposes its whole range to copying** (2026-10-02, run 0921). `&` sides are spent only where
  nothing is heard; every wall cell within `openRange` of an emitter keeps its free side and is copied by any blank
  that reaches it, from inside or outside. With blanks outside, a pair held by `&` pairs (range 27, or 11 with two
  anchors) lost 98% of the blanks to its walls. Start the structure spent and hold by one `&` bond that hears the
  anchor (`budpore` since run 0050; spent sides stay spent), so only the anchor side is ever unspent.
- **Anchors in the middle of a flat wall.** An anchor next to a hex corner lays its strand along the next wall with its
  backs hidden: no back is copied, so no fill exists and copying deadlocks (`budPair`'s P anchor is such a place).
- **One gap per one-row ring.** A pore plus a doorway cuts a ring's wall into two bodies.
- **Copy blanks go to every exposed side.** Walls take most of a batch (65-70% in a cell). Mark plain wall sides `&`:
  they are spent once the structure hears no open signal and are never copied. Copies of `&` cells used as fills are
  cut when their `&` side hears none: give backs a lateral glue so only genome back copies fill (fills match the edge's glue).
- **Latch sites emit no open signal** (`@~`): a front of latch sites carries the lock signal, not the open signal;
  something else must keep a structure open (ordinary sites, a content seed) or its `&` sides cut early.
- **Physics leaks found 2026-10-02** (fixed): check new closed structures for escapes with a trace (cast products and
  released parts start touching their neighbours).
- **Bodies longer than half the world** were folded by the torus minimum image (fixed 2026-10-01, `_unwrap`). Keep
  world size larger than any body anyway (pictures and inside tests use minimum images).
- **A closing door stalls on anything in its sweep**; a strand lying across a doorway can jam it for good.
- **Apostrophes in test names**: `'` inside a single-quoted test name breaks the file (twice this session).
- **Locality (user, 2026-10-01).** Before writing a rule, ask: does this triangle know this through its own bonds,
  a direct partner's exposed value, or a relayed signal? "Same structure", "smaller body", "partner's partner" are
  not local (all three were written once and undone). Physics may treat a structure as one body; chemistry may not.
  See AGENTS.md (Locality) and RULES.md (Locality audit).
- **Inside or outside a hex ring: use `hexr`, not Euclidean distance.** Near a hexagon's corners a side on the inner
  boundary can lie farther from the centre than (R-0.5)H; for R >= 6 twelve sides were misjudged, so a door kit's last
  site faced inward and the ring could only be closed by triangles already trapped inside (fixed 2026-10-01).
- **Trailing comments in one-line code.** Twice a `// comment` appended inside a long line swallowed the code after it
  (no error, wrong behaviour). Put comments on their own line.
- **Rigid machines.** Every swing must be clear: sweep a design before building it (`structures.ring` shows how). A
  flap whose catch side stays flush with its cargo re-closes on it at once (hence the hand-off and at-rest rules).
- **Enclosed holes.** A site whose three neighbours are all present before it fills can never be filled (no free
  triangle can reach it: rigid parts never pass through). This caused the copy deadlock (fixed by zip) and the grown pocket
  stall (fixed by `pLoose`). Check every new design for sites that can become enclosed.
- **lockBusy and other relays are Int8**: lockRange above 127 overflows (no lock at all). Use at most 120.
- **Supply races decide reliability.** The founder's first dock races the membrane root (cells); leftover kit parts
  trapped in a closed ring jam its door (live). Supply ratios are design parameters: check them on 4 worlds.
- Shared edges of a prepared structure must have opposite directions when you write glue onto them.

## Pitfalls from the casting lineage (moved from docs/NEXT.md, cleanup run 20261002-1821)
(The lineage was removed from the core on 2026-10-03, core review run 20261003-2121; code in git at `7415fd4`. These
lessons stay for any machine that comes back through the RULES gate.)

Design lessons from kits, pockets, doors and flaps (the casting lineage, frozen since run 20261002-1751). The pitfalls
for current work are in "Pitfalls learned (copy lineage)" above.

- **Kit races** (`structures.kitRace`): a cell whose every side may face a non-descendant (or a slot) is lost for good
  if that neighbour arrives first; kit depth does not order arrival. The lid pocket's cell beside the slot is a leaf of
  every kit tree. Raise the supply of race cells (3x completed the grown pocket in 4 of 4 worlds).
- **A latch-cut closure re-closes**: two sides that stay flush close again next step (no `&` on a closure is possible:
  closures never form on `&` sides). Cut what must stay apart with `&` on a bond formed by binding a free part.
- **A grown flap hangs by its hinge only**: any second bond of the panel to the ring locks it. Its far end must move
  away from its neighbour when it swings (down-triangle far end, up-triangle neighbour for a panel swinging up).
- **Food in a kit site.** A blank whose glue complements casters' close-only instruction sides closes into an empty
  caster site of a growing pocket (two `U.` sides facing it) and blocks it for good. Keep a pocket's target blanks away
  until the pocket is complete (the bud gets `uuu` only through its own door, after the split).
- **Narrow kit sites.** A kit cell with a side on a wall can be entered only through one side once its parent is
  there; it stalled 2 of 4 bud pockets. `budPair` avoids such placements; check new layouts for them (the risk count
  in `structures.kit` does not see walls).
- **TRI_RESUME and `split`**: the demo places its prepared parts and food after `createWorld` has loaded the saved
  state, so a resumed `split` world is scrambled (and the genome variant may throw "prepared parts overlap"). Rerun from
  t=0 instead (a 200000-step world takes about 2 minutes).
- **A ring with two open doors falls apart** (two gaps make two rigid pieces). Interlock the doors of one ring: an
  unbonded latch side emits the lock signal and other latches hold while they hear it (raise `lockRange` for big
  rings). Seen in the bud: its import door opened before its closing door had shut.
- **Order of parts on one genome.** Pocket and membrane grow at once from the chain's two seeds; the open signal keeps
  the pocket idle and the membrane attached until both are complete. Tried and reverted: "a seed binds only while the
  strand hears no open signal" (one part at a time): a finished pocket then went live before any membrane, copying
  started outside, and a strand being copied exposes no seed, so the membrane never began. Remaining race: if the
  membrane closes before the pocket's last cell arrives, that site is inside and the cell is stuck (seen in 2 of 4
  worlds with a poor pocket supply).
- **Catchers in kits.** A target caught before a neighbouring caster arrives closes that caster's cell off; let only
  the caster whose cell borders the frame catch (lid pocket catcher 'B').
- A flap turning about a corner sweeps its far corner 13% past the chord: a carried target jams against a fixed
  neighbour across its far edge. Close lids onto a target instead of carrying the target (lid pocket).
- Kits: every functional pair (activator `%` pairs, instruction holders) must be a close-only closure or a unique activator glue (`%`);
  otherwise free kit cells, products or dockers stick at the wrong place. Free parts must bind only by `@`.
- Dockers used as fills expose their side glues on hidden backs: give dockers dedicated fill types when they
  carry seeds (fills match the lateral glue since 2026-10-03).
- A latch must stay released while its door opens; any doorway makes a 2D ring a C (use airlocks).
