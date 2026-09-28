# Results

Measurements from the headless runner. **Sections 1 to 14 were measured on the rigid-body engine,
which was removed on 2026-09-23** (recover it from git at commit `b41557c` to reproduce them bit
for bit; their scripts now run on the polygon engine and give different numbers). Section 15 and
later are on the polygon engine, which is now the only one. Where a result was re-measured on the
polygon engine (length selection, section 15) it held.
Every run is deterministic per seed; the commands are in the `.sh` scripts next to this file (the
scripts of sections 10 to 12 tested mechanisms that were removed with the rigid engine, so they
were deleted too; they are at commit `b41557c`). Tables come from
`summarize.js`, `births_by_length.js` and `mutation_rates.js` over `out/*.csv` and
`out/*.births.jsonl`. The same batches were run on the earlier rigid-body physics; every
conclusion below held there too, with different rates.

Unless stated otherwise: 80×80 torus, 400 A + 400 B monomers, 300 energy particles, one seed
strand `ABBABA`, jostle 0.3, unit-mode energy, ligation off. "Steps" are simulation steps; a
copy cycle for a 6-mer in a fresh bath is roughly 1,500 steps.

## 1. Phase 1: copying works, exactly

`node test.js` checks these on every change:

- With no seed strand and capture off, free monomers never bond to each other (20,000 steps).
- A seeded 6-mer is copied; every logged child equals the reverse of its parent; no strand of any
  other length appears; one sequence in the population.
- Unit-mode energy spent equals the number of re-armed units exactly. Strand mode spends about
  one particle per copy.
- Mass and energy particle counts are conserved under mutation and turnover; bond tables stay
  symmetric; two runs with the same seed give identical positions.

Two 30,000-step runs with every soft knob at zero (seeds 2 and 5, 60×60 world) produced 29 and
36 births, all exact, no chain of any length but 6, and the closest pair of unbonded squares in
the world never inside a side length. Three separate mechanisms that produced chimeras before
that test passed are recorded in the design doc, section 10.

`R_base` below is the same thing over 100,000 steps: births are all faithful until the free
monomer pool hits zero and every template is stuck holding a partial copy. That is the material
lockup the design predicted for a world without turnover.

## 2. One variation source at a time (`regimes.sh`, 100,000 steps)

| run | knobs | births | faithful | substitution | longer | shorter | mean length at end | distinct seqs | free monomers |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| R_base | none | 83 | 100% | 0% | 0% | 0% | 6.00 | 1 | 0 |
| R_soft | pSoft 0.02 | 81 | 83% | 17% | 0% | 0% | 6.00 | 10 | 0 |
| R_capture | pCapture 0.05 | 91 | 77% | 0% | 10% | 13% | 5.40 | 22 | 0 |
| R_fray | pFray 0.0003 | 4,027 | 98.6% | 0.4% | 1.0% | 0% | 2.06 | 5 | 365 |
| R_fraycap | pCapture 0.05, pFray 0.0003 | 2,869 | 89.5% | 2.3% | 5.8% | 1.0% | 2.45 | 15 | 207 |
| R_gentle_7 | pSoft 0.01, pCapture 0.01, pFray 0.0001 | 1,898 | 92% | 4.4% | 2.8% | 0.4% | 2.30 | 14 | 104 |
| R_gentle_8 | same, seed 8 | 1,841 | 92% | 4.9% | 2.3% | 0.6% | 2.26 | 12 | 90 |

What each source does:

- **Wrong-type docking** gives substitutions and nothing else. Length stays 6. At `pSoft` 0.02 about
  3% of dockings are wrong-typed and 17% of births carry at least one substitution.
- **End capture** gives insertions (a monomer sticks to a strand end) and, through gaps, both
  substitutions and truncations: a captured unit faces the fragment on the far side of the gap with
  an `END` side, the fragment answers `STICKY`, they only join at `pLigate`, so the near fragment
  leaves as a shorter strand. The longest strand reached 12 units and 22 sequences were in play.
- **Fraying** alone gives turnover (365 free monomers at steady state instead of 0) and a
  fifty-fold jump in births, almost all of them dimers and trimers. Length collapses to 2 within
  30,000 steps. Fraying is itself a mutation source: 1% of births are longer than their parent,
  because a template end frays after its copy unit has released.
- **Gentle** (all sources at low rates) keeps nine tenths of births faithful and a dozen sequences
  in play, and still collapses to length 2.3.

Soft probabilities are per step of contact. A free monomer sits in front of a face for a few
steps, so `pSoft` 0.02 gives 3% wrong-typed dockings, not 2%; on the earlier rigid-body physics,
whose contacts lasted longer, the same setting gave 6%.

## 3. Does anything besides cooperativity hold length up? (`length_selection.sh`, 150,000 steps)

Mutation and turnover on (pSoft 0.02, pCapture 0.05, pFray 0.0003), varying how energy is
supplied. `unit`: every released unit needs its own particle. `strand`: one particle re-arms a
whole strand, caught by any of its N back sides. E40 uses fewer particles and a slower reload.
`sun`: particles reload only inside a disc of radius 12. Mean length counts templates that are
being copied as well as free strands.

| run | energy | mean length | max | strands | births | distinct | entropy (bits) | E on | free |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| L_unit_E300_11 | unit, 300 | 2.46 | 5 | 146 | 5,611 | 16 | 2.96 | 251 | 279 |
| L_unit_E300_12 | unit, 300 | 2.52 | 5 | 148 | 5,070 | 16 | 3.02 | 260 | 244 |
| L_strand_E300_11 | strand, 300 | 2.49 | 6 | 155 | 5,380 | 19 | 2.96 | 281 | 238 |
| L_strand_E300_12 | strand, 300 | 2.74 | 6 | 137 | 4,675 | 22 | 3.52 | 285 | 214 |
| L_unit_E40_11 | unit, 40 | 2.51 | 5 | 78 | 2,520 | 14 | 3.02 | 15 | 531 |
| L_unit_E40_12 | unit, 40 | 2.45 | 5 | 73 | 2,653 | 13 | 2.77 | 17 | 553 |
| L_strand_E40_11 | strand, 40 | 2.47 | 5 | 137 | 4,233 | 14 | 2.91 | 17 | 315 |
| L_strand_E40_12 | strand, 40 | 2.57 | 5 | 140 | 4,289 | 19 | 3.17 | 20 | 279 |
| L_sun_strand_11 | strand, sun | 2.53 | 5 | 144 | 4,643 | 17 | 3.07 | 33 | 282 |
| L_sun_strand_12 | strand, sun | 2.54 | 6 | 140 | 4,321 | 16 | 3.06 | 39 | 293 |

Every configuration lands between 2.45 and 2.75. Strand-mode energy does not hold length up;
under scarcity it only supports more strands (137 against 75), because one particle re-arms a
whole strand. The sun patch changes where things happen, not what. Roughly one birth in six
carries a mutation in these runs (84% faithful, 8% substitution, 6% longer, 1% shorter).

**Ligation, revised.** On the rigid-body physics ligation was a runaway: fused strands became
rigid rafts that could not separate and births fell by three quarters. On the per-square physics
the same two probes (strand mode, 300 E, otherwise as above) give the longest and most diverse
populations measured so far:

| run | pLigate | ligations | mean length | max | strands | births | distinct | entropy (bits) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| L_ligate005_11 | 0.005 | 668 | 2.75 | 6 | 149 | 3,913 | 24 | 3.42 |
| L_ligate02_11 | 0.02 | 1,390 | 4.66 | 19 | 90 | 2,110 | 46 | 4.95 |

At 0.02 the length histogram at the end runs from 2 to 25 units with most mass between 3 and 8,
births continue at two fifths of the ligation-free rate, and eight of ten births are still
faithful copies. Fusion and fraying set a length distribution the way a polymerisation
equilibrium does; this is chemistry, not selection, but it is the first open regime in which long
strands persist. Whether selection acts on top of it (ligation with cooperative docking on, and
which sequences win) is the obvious next run.

## 4. Direct competition: dimer against 6-mer (`competition.sh`, 100,000 steps)

Three `AB` and three `ABBABA` strands start together with every mutation knob at zero, so the two
species stay distinct and births per species are a direct fitness readout. "Other" is zero in
every run without fraying, which is the check that no chimeras form.

| run | energy | fray | dimer births | 6-mer births | ratio |
|---|---|---|---:|---:|---:|
| C_unit_E300_fray0_21 | unit, 300 | 0 | 260 | 9 | 29 |
| C_unit_E300_fray0_22 | unit, 300 | 0 | 270 | 5 | 54 |
| C_strand_E300_fray0_21 | strand, 300 | 0 | 253 | 11 | 23 |
| C_strand_E300_fray0_22 | strand, 300 | 0 | 277 | 4 | 69 |
| C_unit_E10_fray0_21 | unit, 10 | 0 | 252 | 22 | 11 |
| C_unit_E10_fray0_22 | unit, 10 | 0 | 268 | 17 | 16 |
| C_strand_E10_fray0_21 | strand, 10 | 0 | 244 | 25 | 10 |
| C_strand_E10_fray0_22 | strand, 10 | 0 | 291 | 14 | 21 |
| C_unit_E300_fray3_21 | unit, 300 | 0.0003 | 4,600 | 12 | 383 |
| C_unit_E300_fray3_22 | unit, 300 | 0.0003 | 4,732 | 0 | ∞ |
| C_strand_E10_fray3_21 | strand, 10 | 0.0003 | 325 | 0 | ∞ |
| C_strand_E10_fray3_22 | strand, 10 | 0.0003 | 380 | 4 | 95 |

Without fraying the pool is exhausted by 50,000 steps and the dimers took nine tenths of it.
Scarce energy narrows the gap from 25:1 to 60:1 down to 10:1 to 20:1 because everyone waits for
particles, but never closes it. Strand-mode energy, which lets a long strand catch a particle on
any of its back sides, makes no difference. With fraying on, the 6-mers make almost no births:
they shorten faster than they finish a copy.

Why the dimer wins here is mechanical. A copy of N units waits for the slowest of N dockings
(roughly H_N times the single-site wait), then in unit mode for the slowest of N energy
arrivals. Every term favours short. In this world a single docked monomer is as stable as a full
duplex, so a dimer copies on two lucky dockings and nothing makes a long template a better place
to copy.

## 5. Cooperative docking (`cooperativity.sh`, 100,000 steps)

Rule R6: a docked monomer with no lateral bonds falls off at `pUndock` per step and is pushed
off the face; a run of two or more linked units stays. Copying becomes nucleation-limited: the
slow step is two monomers landing side by side before either leaves, and a template of N units
has N-1 places for that to happen while a dimer has one.

Same competition as section 4 (three `AB` and three `ABBABA`, mutation off, unit-mode energy,
300 particles), with the undocking rate varied. Two seeds each.

| pUndock | dimer births (seed 21, 22) | 6-mer births (21, 22) | dimer : 6-mer by births | share of copied material in 6-mers |
|---:|---:|---:|---:|---:|
| 0 (section 4) | 260, 270 | 9, 5 | 38 : 1 | 7% |
| 0.02 | 262, 215 | 36, 48 | 6 : 1 | 35% |
| 0.05 | 86, 99 | 90, 87 | 1 : 1 | 74% |
| 0.1 | 5, 20 | 116, 107 | 1 : 9 | 96% |
| 0.2 | 11, 16 | 93, 97 | 1 : 7 | 95% |

"Share of copied material" weights births by length. The race flips between 0.02 and 0.05 per
step, which at this jostle is an undocking wait of twenty to fifty steps against a single-site
docking wait of a few hundred. At 0.1 the 6-mer wins outright: the dimers are nearly extinct by
the second half of the run (0 and 3 births in the last 50,000 steps against 33 and 35 for the
6-mers). One local rule, of the same form as fraying, turns selection for the shortest strand
into selection for the longer one.

Two runs also seeded a 12-mer (`ABBABAABABBA`) at `pUndock` 0.02: it reproduced (13 and 16
births against 54 and 17 for the 6-mer and 87 and 173 for the dimer) but did not gain. Where the
optimum lies at higher undocking rates is the next measurement; the copy-time estimate in the
design doc (section 13) puts it near 12 units when undocking is ten times faster than docking.

**Evolutionary regime with undocking.** Gentle mutation and turnover (pSoft 0.01, pCapture 0.01,
pFray 0.0001), one seed strand, 100,000 steps, two seeds, with undocking off (`R_gentle`,
section 2), at 0.02 and at 0.1.

| run | pUndock | mean length | max | strands | free | births | faithful | distinct seqs | entropy (bits) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| R_gentle_7 | 0 | 2.27 | 5 | 216 | 96 | 1,898 | 92% | 12 | 1.92 |
| R_gentle_8 | 0 | 2.28 | 6 | 214 | 88 | 1,841 | 92% | 13 | 2.42 |
| U_evo_undock02_7 | 0.02 | 2.28 | 4 | 149 | 422 | 1,434 | 90% | 9 | 2.24 |
| U_evo_undock02_8 | 0.02 | 2.26 | 4 | 143 | 442 | 1,525 | 90% | 11 | 2.11 |
| U_evo_undock10_7 | 0.1 | died at ~40,000 | 0 | 0 | 800 | 14 | 64% | 0 | 0 |
| U_evo_undock10_8 | 0.1 | 3.39 | 6 | 24 | 709 | 151 | 78% | 12 | 3.19 |

This is the honest limit of the result so far. Undocking wins the head-to-head race, but in the
evolutionary regime with turnover on it does not lift length at 0.02 (it only leaves more
monomers free, because lone dockings that used to lock up material now fall off), and at 0.1 the
population starves: with 800 monomers in an 80×80 world a lone docked monomer lasts ten steps
and the next monomer takes hundreds to arrive, so copies rarely nucleate, while fraying keeps
eroding the templates that wait. One seed died at about 40,000 steps; the other hung on with two
dozen strands of mean length 3.4, the longest population this regime has produced.

Density changes the picture. In the viewer's world (48×48, 400 monomers) at `pUndock` 0.1 with
fraying off, the population grows to about fifty strands of mean length 6.2 to 6.5 (insertions
lengthen them); with fraying at 0.0001 the dimers come back and mean length is 2.4 to 2.6.
Cooperativity therefore beats the shortest-wins rule when nucleation is fast enough, and
fraying is what decides whether it is. The window between "dimers win" and "nothing
nucleates" is where the next measurements go: fraying rate against density against undocking
rate, with more than two seeds.

## 7. Origins: a seedless bath (`channels.sh`, `O_` runs, 100,000 steps)

No seed strand. Two free monomers whose lateral sides meet flush link with probability `pSpont`
per step of contact, become a two-unit strand (rule R2), get re-armed, and are templates.
Gentle mutation and turnover (pSoft 0.01, pCapture 0.02, pFray 0.0001), 400 A + 400 B.

| run | pSpont | first birth at | births | strands at end | mean length | distinct | B fraction of births |
|---|---:|---:|---:|---:|---:|---:|---:|
| O_spont3e4_31 | 0.0003 | 8,458 | 2,747 | 244 | 2.12 | 9 | 0.49 |
| O_spont3e4_32 | 0.0003 | 15,015 | 2,368 | 234 | 2.16 | 9 | 0.50 |
| O_spont1e3_31 | 0.001 | 8,574 | 2,696 | 246 | 2.10 | 8 | 0.50 |
| O_spont1e3_32 | 0.001 | 1,639 | 2,586 | 225 | 2.26 | 13 | 0.52 |
| O_spont3e3_31 | 0.003 | 1,063 | 2,889 | 230 | 2.19 | 11 | 0.51 |
| O_spont3e3_32 | 0.003 | 1,708 | 2,634 | 213 | 2.33 | 14 | 0.49 |

Life starts by itself in every run, and once it has started the rate of spontaneous links no
longer matters: all six reach the same population of 210 to 250 strands with about 2,600 births.
What emerges is what the physics of this world favours, dimers, at the pool's composition. The
tight flush check makes `pSpont` 0.0003 already rare in practice (first event after 8,000 to
15,000 steps with 800 monomers); with `pSpont` at 0 nothing ever starts (`node test.js`).

## 8. Radiation with unequal resistance (`channels.sh`, `X_` runs, 100,000 steps)

Rule R7: every lateral bond breaks with probability `pBreak` × (1 − resA) × (1 − resB) per step
for the two blocks it joins. `B` is tough (resB 0.9) and scarce (100 B against 300 A, so a
quarter of the pool). Ligation 0.005 lets fragments rejoin. Control: same rates, no resistance.

| run | resistance | births | strands at end | B fraction of births, first half | second half |
|---|---|---:|---:|---:|---:|
| X_ctrl_31 | none | 2 | 0 | (died) | |
| X_ctrl_32 | none | 1 | 0 | (died) | |
| X_rad_31 | B 0.9 | 4 | 0 | (died) | |
| X_rad_32 | B 0.9 | 616 | 30 | 0.46 | 0.41 |

At `pBreak` 0.001 the seed strand's five bonds last about 200 steps and the seed usually dies
before its first copy: both controls and one of the two resistant runs died. The run that lived
shows the effect clearly: tough blocks make up 41% to 46% of the copied material against 25% of
the pool, almost twice their availability, because an `A`-`A` bond breaks 25 times more often
than a `B`-`B` bond and scarcity is a weaker penalty than fragility at this rate. The population
is dimers (mean length 2.0), so what is being selected is the `BB` dimer over `AB` and `AA`.
A milder batch (`pBreak` 0.0003, three seeds, with controls) is in `X_rad03_*` / `X_ctrl03_*`.

Milder rate, three seeds each:

| run | resistance | births | strands at end | B fraction of births, first half | second half |
|---|---|---:|---:|---:|---:|
| X_ctrl03_31 | none | 828 | 32 | 0.05 | 0.04 |
| X_ctrl03_32 | none | 0 | 0 | (died) | |
| X_ctrl03_33 | none | 588 | 25 | 0.06 | 0.07 |
| X_rad03_31 | B 0.9 | 828 | 58 | 0.40 | 0.29 |
| X_rad03_32 | B 0.9 | 727 | 64 | 0.23 | 0.26 |
| X_rad03_33 | B 0.9 | 639 | 56 | 0.50 | 0.28 |

The right comparison is not against the pool but against the control, and it is stark. Without
resistance, scarcity alone drives `B` out: only 4% to 7% of copied material is `B` against 25%
of the pool, because a strand that needs a `B` waits three times longer for its monomer, and in
a world of dimers that decides everything. With resistance, `B` holds 26% to 29% in the second
half of every run, five to six times the control, and the resistant runs carry twice as many
strands. Durability pays for scarcity and then some. At the harsh rate above the enrichment
reached 41% to 46%. Sequence content is under selection, in the direction the physics predicts,
and the strength of the selection is set by the radiation rate. What has not happened is any
length beyond 2: the winning form is the `BB` dimer, and a ring of tough blocks around a fragile
core is not something a one-dimensional chain can build.

## 9. Metabolism from sequence (`channels.sh`, `M_` runs, 100,000 steps)

Motif rule on and background reload off, so the only source of charged energy is the back of a
`B` block flanked by two `A` blocks. Seed `ABBABA` carries one such motif. Mutation and turnover
as in section 7. Control: motif off, background reload 0.002.

| run | energy from | births | strands | E charged | E spent | E on / off at end | ABA per block, first half | second half |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| M_ctrl_31 | background | 1,301 | 191 | 0 | 3,292 | 283 / 17 | 0.021 | 0.027 |
| M_ctrl_32 | background | 1,037 | 192 | 0 | 3,199 | 281 / 19 | 0.044 | 0.024 |
| M_motif_31 | ABA motifs only | 1,772 | 206 | 3,411 | 3,594 | 117 / 183 | 0.014 | 0.017 |
| M_motif_32 | ABA motifs only | 1,575 | 204 | 3,480 | 3,579 | 201 / 99 | 0.019 | 0.024 |

The population lives on motif energy alone: 3,400 recharges against 3,600 spends, and more
births than the controls, because a motif on a strand charges particles right where they are
needed. But the motif is not selected for: `ABA` per block stays at 0.015 to 0.025 in both
conditions, and the commonest sequences under the motif rule are `AB`, `AA`, `ABB` and `BB`,
none of which carries it. A charged particle diffuses away from the back that charged it and
re-arms whoever is nearest, so the motif is a public good and the dimers free-ride on it.
This is the expected result for a well-mixed world and the classic reason spatial structure or
compartments matter: the benefit has to stay with the sequence that pays for it.

## 10. Hinges, rings and slack (`rings.sh`, `rings2.sh`, 100,000 steps)

A hinge is a lateral bond that pins only the shared back corner, bends up to 90° toward the
backs, and is rigid whenever either square has a face bond: chains are straight while copied and
fold when free. With flush-only bond formation no ring closed in any run (a ring's last bond is
itself a bend). With hinges allowed to form where two back corners touch, rings close.

Open population, `hinge` all, ligation 0.02, gentle mutation and turnover, three seeds:

| run | rings every 20,000 steps | mean ring length | births | strands | mean length | max | distinct | entropy (bits) |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| H2_hinge_51 | 0, 5, 6, 5, 5 | 5.2 | 175 | 69 | 5.6 | 23 | 42 | 5.02 |
| H2_hinge_52 | 1, 2, 3, 4, 4 | 4.3 | 551 | 82 | 4.8 | 27 | 38 | 4.41 |
| H2_hinge_53 | 0, 0, 2, 2, 2 | 4.5 | 113 | 64 | 6.0 | 20 | 41 | 4.84 |

Rings appear within 20,000 to 60,000 steps, are mostly four squares, and persist: they have no
ends to fray and nothing else in this regime breaks a bond. They are sterile (a ring's faces lie
on a curve, so a copy on it can never complete), so they accumulate as durable dead ends and
slowly lock up material. The population around them is the most diverse measured so far: about
forty sequences and 4.4 to 5.0 bits, mean length 5 to 6, strands up to 27, because hinged chains
fuse by ligation readily and fray slowly. Copying is slower than with rigid chains (113 to 551
births against 1,000 to 2,000 in comparable rigid regimes): a curled template has to be
straightened by the docking itself before its copy can link.

With radiation on top (`H2_hingerad_*`, `pBreak` 0.0003, `resB` 0.9, B a quarter of the pool),
rings are transient (0 or 1 at any sample), radiation opening them as fast as ligation closes
them, and the population is dimers again (mean length 2.3 to 2.4). Tough blocks hold 14% to 19%
of copied material, above the 4% to 7% of a scarcity-only control but below the pool.

**Slack.** A rigid lateral bond may instead tolerate a corner gap up to `slack` with no
restoring force inside it (a trapezoid block). Two seeds, 20,000 steps, all soft knobs at zero:

| slack | births | copies exact | odd-length chains | max joint angle |
|---:|---:|---|---:|---:|
| 0 | 33 | yes | 0 | 0.7° |
| 0.1 | 42 | yes | 0 | 18.7° |
| 0.2 | 41 | no | 2 | 23.5° |

At 0.1 the copying rate rises by a quarter, because linking tolerates the wobble of a docked
pair, and copies stay exact. At 0.2 squares docked on different templates link again. The
tolerance is a property of the block, and 0.1 is where it should sit.

## 11. Membrane blocks (`membranes.sh`, 100,000 steps)

A fourth block type `M` bonds only to other `M`, side to side, forming on any corner touch and
then holding a built-in bend (`memAngle` ± `memFlex`), so arcs grow by capturing free blocks at
their ends and close into rings when they reach the size the bend dictates. Radiation breaks
`M` bonds at `resM`. `M` has no state, docks on nothing, and takes no energy.

**Self-assembly** (300 blocks, no replicators): with a 60° bend, 14 rings by 20,000 steps and
41 rings of about 6 blocks by 100,000, with 13 arcs left; with 45°, 26 rings of about 8. Forming
bonds only when the corners meet *at the right bend* had failed completely (arcs grew one block
per 10,000 steps and never closed); forming on any corner touch and letting the bond pull the
joint to its angle is what makes assembly fast.

**Enclosure** (300 blocks with 800 monomers, gentle mutation and turnover, spontaneous
linking, radiation 0.0002 with `resM` 0.7): rings form at the same rate (33 at the end, two
seeds), but they close around almost nothing. At any sample 2 to 4 monomers are inside a ring,
never a template unit, and no ring ever held a strand. A six-block ring has an interior of
about 2.6 square sides in a world with 0.17 units per square side, so it expects to enclose
about half a unit, and a strand of two or more essentially never. The replicator population is
unaffected (6,000 births, all dimers).

**Compartments and the motif** could therefore not be tested: nothing was inside to select. The
motif regime itself (energy only from `ABA`, no background reload) also died within 50,000 steps
both with and without membranes, because under turnover and spontaneous linking the dimers that
take over carry no motif, the charged energy runs out, and copying stops.

What this says: self-assembly works; enclosure by chance does not at any density a replicator
population tolerates. For compartments to matter, rings have to form *around* strands, which
biology does with coat proteins that recognise the genome (a capsid) or with lipids at
concentrations where anything is inside. In this table that is one more row, `M` binding the
back of a template unit so that membranes nucleate on strands, and it is the next experiment.

## 12. Choosing the presets (`presets.sh`, 100,000 steps)

Four candidate open regimes, all with trapezoid slack 0.1, spontaneous linking 0.001, gentle
mutation and ligation 0.02, `B` scarce (200 against 600 `A`):

| run | turnover | mean length | max | strands | births | distinct | entropy (bits) | B fraction, 2nd half |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| E_fray | fraying 0.0001 | 4.33 | 14 | 107 | 1,369 | 40 | 4.64 | 0.24 |
| E_rad1 | radiation 0.0001, resB 0.9 | 2.54 | 8 | 202 | 1,159 | 24 | 2.88 | 0.06 |
| E_rad3 | radiation 0.0003, resB 0.9 | 2.32 | 6 | 200 | 2,156 | 18 | 2.12 | 0.11 |
| E_rad3_und | radiation 0.0003, resB 0.9, undock 0.05 | 2.37 | 6 | 158 | 834 | 15 | 2.15 | 0.20 |

Fraying and radiation are not interchangeable. Fraying erodes ends only, so with ligation it
sets a length distribution and the population stays long and diverse; radiation cuts anywhere,
so with ligation it fragments, and at every rate tried the population is dimers. Radiation is
the selective pressure (section 8), fraying is the turnover, and the "evolution" preset uses
fraying with ligation. Cooperative undocking halves births here and does not lift length.

Larger membrane rings, same regime plus radiation 0.0002 (`resM` 0.7):

| run | bend | ring size | rings at 100k | template units inside, per 20k sample | rings holding a strand, per sample |
|---|---:|---:|---:|---|---|
| P_ring30 | 30° | ~10 | 10 | 0, 0, 2, 0, 0 | 0, 0, 1, 0, 0 |
| P_ring225 | 22.5° | ~14 | 6 | 2, 2, 2, 0, 2 | 1, 1, 1, 0, 1 |

Fourteen-block rings enclose a strand some of the time; ten-block rings almost never. The
protocell regime (30° rings, motif energy with a small background reload) ran without dying,
1,833 births against 1,702 in its membrane-free control, with one ring holding a strand at the
end and no motif inside any ring. That is the state of the compartment line: the machinery
works, the statistics are too thin to say anything about selection, and nucleation on strands
(design doc, section 15, item 7) is what would change that.

The viewer keeps three presets: copying with every soft knob at zero, the `E_fray` regime as
"evolution", and "protocells" (evolution plus 300 membrane blocks at 30°, motif energy, a little
radiation).

## 13. Turnover is a deletion ratchet; processive fraying lifts it (`unzip.sh`)

**Diagnosis.** In a closed world the only way a monomer returns to the pool is by fraying off an
end. A copy of L units therefore has to be paid for by about L end deletions somewhere in the
population. With cooperative docking on (`pUndock` 0.1) and end fraying at 0.00003, one run had
1,092 frays for 602 births: each lineage loses a unit or two per copy cycle, faster than
cooperativity rewards the extra length. Turnover itself is the mutation pressure that keeps
strands short.

**Change.** Processive fraying (`pUnzip`): a unit that frays reads `FRAY` on its lateral sides
for one step before it lets go, and an undocked neighbour that reads `FRAY` follows it with
probability `pUnzip`. At 1 a strand that starts to fray unzips one unit per step until it
reaches a unit with a copy docked on it (being copied protects). Material comes back by strands
dying whole instead of survivors being eroded. At `pUnzip` 0 nothing changes (trajectories are
bit-identical).

End fraying, 60×60, 400 A + 400 B, 300 E, three `ABBABA` seeds, gentle mutation (pSoft 0.01,
pCapture 0.01, pSpont 0.001, slack 0.1), 100,000 steps, one seed each. "u" is `pUndock` × 100,
"f" is `pFray`, "b" radiation instead of fraying:

| run | mean length | max | strands | free | births | newborn length, last 50k | distinct | entropy (bits) | frays |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Z_end_u0_f1e5 | 2.27 | 7 | 251 | 4 | 558 | 2.16 | 15 | 1.84 | 333 |
| Z_end_u0_f3e5 | 2.41 | 6 | 223 | 10 | 941 | 2.25 | 15 | 2.54 | 895 |
| Z_end_u0_f1e4 | 2.22 | 5 | 239 | 57 | 2,754 | 2.14 | 12 | 1.97 | 2,994 |
| Z_end_u0_b5e5 | 2.00 | 2 | 300 | 8 | 1,573 | 2.01 | 3 | 1.23 | 0 |
| Z_end_u10_f1e5 | 3.66 | 8 | 189 | 68 | 363 | 3.64 | 40 | 4.59 | 396 |
| Z_end_u10_f3e5 | 3.17 | 7 | 203 | 117 | 602 | 3.15 | 33 | 4.12 | 1,092 |
| Z_end_u10_f1e4 | 2.60 | 5 | 164 | 339 | 1,614 | 2.73 | 20 | 2.93 | 3,078 |
| Z_end_u10_b5e5 | 2.27 | 4 | 265 | 179 | 1,163 | 2.32 | 15 | 2.38 | 0 |

With end fraying, cooperative docking helps (2.3 to 3.2-3.7) and the gentler the fraying the
longer the strands, but births fall with it. Radiation as the only turnover gives dimers either
way: it cuts anywhere, which is a deletion ratchet too.

Processive fraying, same world, 150,000 steps, one seed each:

| run | mean length | max | strands | free | births | newborn length, last 50k | distinct | entropy (bits) | frays | unzips |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Z_zip_u0_f3e5 | 2.26 | 7 | 246 | 16 | 1,589 | 2.15 | 15 | 2.24 | 1,478 | 804 |
| Z_zip_u5_f3e5 | 3.97 | 8 | 140 | 128 | 1,404 | 3.75 | 41 | 4.80 | 1,582 | 2,807 |
| Z_zip_u10_f3e5 | 4.72 | 9 | 119 | 136 | 952 | 4.64 | 42 | 4.91 | 1,140 | 2,779 |
| Z_zip_u20_f3e5 | 5.36 | 13 | 94 | 196 | 738 | 5.09 | 52 | 5.40 | 870 | 2,454 |
| Z_zip_u0_f1e4 | 2.31 | 6 | 231 | 42 | 4,112 | 2.17 | 16 | 2.40 | 4,357 | 2,459 |
| Z_zip_u5_f1e4 | 3.13 | 7 | 142 | 270 | 3,197 | 3.19 | 24 | 3.88 | 4,040 | 6,039 |
| Z_zip_u10_f1e4 | 3.48 | 6 | 105 | 371 | 2,472 | 3.45 | 32 | 4.37 | 3,107 | 5,538 |
| Z_zip_u20_f1e4 | 3.10 | 7 | 58 | 599 | 1,506 | 3.00 | 15 | 3.10 | 1,759 | 3,364 |

Replicates of the four settings that matter, three seeds each (150,000 steps; end-fraying seed 1
ran 100,000):

| setting | mean length | births | distinct |
|---|---|---|---|
| unzip, no cooperative docking | 2.26, 2.32, 2.23 | 1,589, 1,569, 1,638 | 15, 18, 17 |
| end fraying, `pUndock` 0.1 | 3.17, 3.31, 3.23 | 602, 745, 752 | 33, 36, 38 |
| unzip, `pUndock` 0.1 | 4.72, 4.02, 4.31 | 952, 1,223, 1,199 | 42, 38, 44 |
| unzip, `pUndock` 0.2 | 5.36, 4.43, 4.52 | 738, 886, 916 | 52, 45, 50 |

What this says:

- Neither rule alone does it. Unzipping without cooperativity is still a dimer world (2.3);
  cooperativity with end fraying gives 3.2. Together they give 4.0 to 5.4, a clean dose-response
  in `pUndock`, and the length of newborns climbs through each run (from about 3.5 in the first
  30,000 steps to about 5 at the end at `pUndock` 0.2). This is selection, not ligation: `pLigate`
  is 0 in every run.
- Unzipping is only partly processive in practice: two to three unzip steps per fray at
  `pUndock` 0.1, because a template is often holding a nucleated copy and that stops the wave.
- Denser worlds (42×42 and 50×50 with the same material) give the same lengths (3.9 to 4.9 with
  cooperativity, 2.3 to 2.5 without) and no more births. Births are set by recycling: a birth
  needs free monomers, and monomers come back only when strands die.
- The price is speed. At `pUndock` 0.1 and fraying 0.00003 each strand is copied about once per
  20,000 steps, so a 150,000-step run is only a dozen generations.

Density runs (`Z_d42_*`, `Z_d50_*`, one seed each, 150,000 steps, 250 E):

| run | mean length | max | births | distinct | entropy (bits) |
|---|---:|---:|---:|---:|---:|
| Z_d50_u0_f3e5 | 2.32 | 7 | 1,638 | 18 | 2.23 |
| Z_d50_u5_f3e5 | 3.95 | 8 | 1,373 | 35 | 4.62 |
| Z_d50_u10_f3e5 | 4.21 | 10 | 1,313 | 40 | 4.79 |
| Z_d50_u10_f1e5 | 4.30 | 10 | 629 | 48 | 5.03 |
| Z_d42_u0_f3e5 | 2.51 | 7 | 1,356 | 23 | 2.50 |
| Z_d42_u10_f3e5 | 4.35 | 9 | 1,411 | 51 | 5.17 |
| Z_d42_u20_f3e5 | 4.85 | 11 | 1,177 | 52 | 5.22 |
| Z_d42_u10_f1e4 | 3.88 | 9 | 3,812 | 46 | 4.89 |

## 14. Does sequence pay once length does? The `ABA` motif (`motif.sh`, `long.sh`)

All runs in the length regime above (50×50, unzip, `pUndock` 0.1, fraying 0.00003). The measure
is `ABA` motifs in newborns against the number expected if each newborn's blocks were drawn at
random at the window's `B` fraction (`composition.js`, "ABA vs chance"). Every run starts from
`ABBABA` seeds, which carry one motif, so founder descent pushes even the controls above 1; the
comparison that counts is motif against control.

**Public motif, energy plentiful** (`Q_m_*`, 250 particles, background reload 0.00005, two
seeds). The motif is 1.2 to 1.8 × chance in the last 50,000 steps against 0.9 to 1.3 in the
control, and slowing energy particles to a fifth or a twentieth of their mobility (`mobE`) makes
no consistent difference. The reason is in the energy counts: once any motifs exist, about 200 of
250 particles are charged at any time, and the motif-off control, which used less than half the
energy, made as many births (1,251 to 1,289 against 1,177 to 1,350). Energy is not what limits
copying here; recycling and nucleation are. A public good that is not scarce is not selected.

**Public motif, energy scarce** (`Q_n_*`, 60 particles, motif charging the only income; control
with background reload instead). Last 50,000 steps: 1.3 to 1.6 × chance at normal mobility, 1.7
to 1.9 at mobility 0.2, against 1.7 in the control. No selection.

**Private motif** (`Q_f_*`, the `feed` rule: an armed `B` between two `A`s re-arms its released
neighbours through their shared bonds, so a strand carrying the motif pays one particle where it
would pay three and nobody else benefits). 40 particles, reload 0.0005, energy limiting (1 to 5
particles charged at any time), 200,000 steps, two seeds:

| run | births | fed re-arms | ABA per block, last 50k | ABA vs chance, by 50k window | mean length |
|---|---:|---:|---:|---|---:|
| Q_f_ctl_1 | 1,575 | 0 | 0.093 | 1.55, 1.34, 1.45, 1.52 | 4.27 |
| Q_f_ctl_2 | 1,446 | 0 | 0.106 | 2.02, 1.87, 1.88, 1.79 | 4.28 |
| Q_f_feed_1 | 1,443 | 525 | 0.108 | 2.03, 1.89, 1.89, 1.59 | 4.66 |
| Q_f_feed_2 | 1,381 | 710 | 0.142 | 2.33, 1.94, 2.00, 1.99 | 4.97 |

With `feed` the motif is somewhat more common and strands are longer (the energy saved buys
length), but the difference is within the seed-to-seed spread. One arming in ten comes through a
motif, a saving of a few percent per copy, and 200,000 steps is about fifteen generations: too
few for a few-percent advantage to show above drift.

**Private motif over many generations** (`long.sh`, `L1M_*`): a 40×40 world with 256 A + 256 B
and 26 particles (energy limiting), same regime, 1,000,000 steps, 40 to 52 generations, two seeds
each. "ABA vs chance" by 200,000-step window:

| run | births | max generation | fed re-arms | ABA vs chance, by 200k window | ABA per block, whole run |
|---|---:|---:|---:|---|---:|
| L1M_ctl_1 | 3,816 | 40 | 0 | 1.59, 1.43, 0.95, 1.18, 1.01 | 0.082 |
| L1M_ctl_2 | 3,992 | 44 | 0 | 1.16, 0.62, 0.98, 1.42, 1.72 | 0.078 |
| L1M_feed_1 | 3,845 | 46 | 2,035 | 1.98, 2.15, 2.07, 1.64, 1.65 | 0.132 |
| L1M_feed_2 | 3,712 | 52 | 2,243 | 1.92, 2.24, 2.11, 2.33, 1.64 | 0.147 |

This is the first sequence-level selection in the open regime. With the motif private, `ABA` stays
at 1.6 to 2.3 times chance in every window of both seeds and averages 1.7 times the control's
frequency; without it, the frequency drifts between 0.6 and 1.7 times chance. It is a balance,
not a sweep: the motif does not keep rising. One arming in seven comes through a motif, total
births are unchanged (they are set by recycling, section 13), and mutation keeps breaking motifs
as fast as selection keeps them. Mean length is the same in both arms (4.4 to 5.1). What it
shows is the condition, not the size, of the effect: in this well-mixed world a sequence feature
is selected when its benefit reaches its carrier through the carrier's own bonds, and not when
it goes out into the medium, however slowly the medium carries it.

**Less mutation, four seeds** (`L1L_*`, same world as `L1M_*` with `pSoft` and `pCapture` at 0.002
and `pSpont` at 0.0002, 1,000,000 steps; 91% of births faithful against 72%):

| run | births | fed re-arms | ABA per block | ABA vs chance | mean newborn length | alternating share of newborns of length 4+, by 250k window | top long sequences, last 250k |
|---|---:|---:|---:|---:|---:|---|---|
| L1L_ctl_1 | 5,284 | 0 | 0.099 | 1.90 | 3.47 | 18%, 14%, 39%, 25% | AABA, ABAB, BABB |
| L1L_ctl_2 | 5,542 | 0 | 0.099 | 2.04 | 3.29 | 16%, 33%, 18%, 38% | ABAB, AABAB, AABA |
| L1L_ctl_3 | 6,458 | 0 | 0.050 | 1.22 | 2.97 | 13%, 2%, 12%, 9% | AABB, BAAB, ABBB |
| L1L_ctl_4 | 5,999 | 0 | 0.101 | 2.22 | 3.13 | 22%, 42%, 16%, 23% | BABB, ABAB, AABA |
| L1L_feed_1 | 5,446 | 2,915 | 0.192 | 3.36 | 3.59 | 35%, 70%, 55%, 52% | ABAB, ABABAB, ABABA |
| L1L_feed_2 | 5,670 | 2,200 | 0.146 | 2.72 | 3.48 | 24%, 52%, 39%, 31% | ABAB, AABA, BABB |
| L1L_feed_3 | 5,222 | 2,477 | 0.155 | 2.70 | 3.67 | 34%, 54%, 30%, 16% | ABAB, AABA, BAAB |
| L1L_feed_4 | 5,116 | 2,362 | 0.151 | 2.57 | 3.72 | 19%, 35%, 36%, 16% | AABA, ABAB, AABB |

The two arms no longer overlap. With the private motif every seed carries 0.146 to 0.192 motifs
per block and every control 0.050 to 0.101, and newborns are longer in every `feed` run (3.5 to
3.7 against 3.0 to 3.5): a strand that feeds itself can afford more units. Selection also finds
the sequence the rule rewards most. In an alternating strand every inner `B` is flanked by `A`s,
so `ABABA` needs two particles instead of five; alternating newborns reach 50% to 70% of the long
births in some windows of the `feed` runs (`ABABAB` and `ABABA` among the commonest long strands
in seed 1), and seldom pass 40% in the controls. Nothing in the rules mentions alternation. The
controls are not flat either: with little mutation a few lineages dominate and drift carries
them, so `ABAB` is also common without feed, and the windows swing widely in both arms. Less
mutation raised motif frequency in both arms; the ratio between them stayed near 1.7, so mutation
was not what capped the motif.

**The environment changes, the population adapts** (`shift.sh`, `S_*`). Same small world and low
mutation as `L1L_*`, 1,500,000 steps, two seeds each. For the first 500,000 steps energy is
plentiful (reload 0.005 per spent particle per step); at step 500,000 it drops to 0.0003 and
stays there (`run.js --change 500000:pReload=0.0003`). The rules never change; only the world
does.

| run | ABA per block, by 250k window (switch after the second) | mean newborn length, same windows | alternating share of long newborns, same windows |
|---|---|---|---|
| S_ctl_1 | 0.152, 0.147 → 0.088, 0.017, 0.036, 0.025 | 4.4, 4.5 → 3.4, 2.8, 2.7, 2.4 | 26%, 24% → 19%, 3%, 31%, 21% |
| S_ctl_2 | 0.082, 0.095 → 0.053, 0.033, 0.050, 0.014 | 3.6, 3.9 → 3.0, 2.9, 2.9, 2.8 | 24%, 9% → 20%, 16%, 9%, 1% |
| S_feed_1 | 0.140, 0.126 → 0.079, 0.182, 0.215, 0.189 | 4.0, 3.7 → 3.2, 3.0, 2.9, 3.0 | 15%, 23% → 10%, 45%, 56%, 46% |
| S_feed_2 | 0.127, 0.160 → 0.182, 0.194, 0.166, 0.186 | 3.7, 3.3 → 3.2, 3.0, 3.0, 3.2 | 34%, 74% → 49%, 60%, 60%, 52% |

While energy is plentiful the two arms look the same: the motif saves nothing when particles
are free. When energy turns scarce they split. Without the private motif, selection strips the
population to the cheapest strands, mean length falls from about 4 to 2.5, and the motif all but
disappears (0.4 to 1.3 × chance by the end). With it, the motif rises to 0.17 to 0.22 per block
(3.8 to 5.0 × chance), alternating strands make up about half of the long newborns, and length
holds at 3. Seed 1 shows the adaptation in time: the motif first falls with everything else
after the switch (0.079), then climbs back past its old level within 250,000 steps. Same rules,
same seeds; only the environment changed, and the population followed it.

**Making energy the bottleneck: the spend rule, tried and removed** (`L1S_*`, same world and
regime as `L1M_*`). With `spend` on, a docked unit that is complete reads `DONE` on its face for
a step, and its template unit reads that and drops back to needing energy, so every copy costs
energy on both sides and a motif on the template pays at the step that limits copying.

| run | births | faithful births | fed re-arms | ABA vs chance, by 200k window | ABA per block, whole run |
|---|---:|---:|---:|---|---:|
| L1S_ctl_1 | 2,753 | 47% | 0 | 1.15, 1.48, 1.27, 1.07, 1.00 | 0.066 |
| L1S_ctl_2 | 2,790 | 47% | 0 | 1.63, 1.01, 1.13, 1.57, 1.05 | 0.070 |
| L1S_feed_1 | 3,002 | 56% | 3,523 | 1.61, 2.33, 2.34, 2.20, 2.00 | 0.131 |
| L1S_feed_2 | 2,865 | 55% | 3,529 | 1.93, 1.69, 1.95, 2.48, 2.22 | 0.132 |

The motif is held a little higher (about twice the control, 2.0 to 2.5 × chance late in the
runs), one arming in five comes through it, and for the first time it raises births (5%). But
copying falls apart: only half of births are faithful, against 72% without the rule, with 13%
longer and 10% shorter than their parent. A template unit spent mid-copy is undocked, so it can
fray and unzip while the rest of its strand is still being copied, and the copy's finished part
leaves early as a truncated strand. Selection cannot build on a lineage when every other birth is
a mutant. The rule was removed: it adds a state and a row and costs more fidelity than it buys.

## 15. Deformable polygons (`physics: 'poly'`, `poly_probe.js`)

A second physics engine, on the user's suggestion: each unit is four corners held to a rest
shape by shape matching at a per-type stiffness, and a bond pins the two corners of one side onto
the two corners of the other, so bonded edges coincide and a strand is drawn and moves as one
body. A pin moves each unit rigidly (as the rigid engine's point constraint does) and, by the
unit's softness, deforms the pinned corner. The chemistry is unchanged. The rigid engine stays
the default, so every table above is reproducible bit for bit.

**Copying at every soft knob zero**, `ABBABA`, 60×60, 20,000 steps, seeds 2 and 5:

| engine | stiffness | births | exact | odd lengths |
|---|---:|---|---|---|
| rigid | - | 12, 21 | yes | none |
| poly | 1 | 13, 11 | yes | none |
| poly | 0.5 | 15, 19 | yes | none |
| poly | 0.2 | 25, 23 | 3 unfaithful in one seed | 3- and 8-mers |
| poly | 0.05 | 40, 60 | 18 unfaithful | dimers to 7-mers |

Softness does what slack did (section 10): a little speeds copying because neighbours docked on a
template can link while wobbling, and too much lets copies docked on neighbouring templates link.
0.5 is safe. Bonded corners sit a median 0.015 of a side apart (90th percentile 0.08).

**Length selection carries over** (`PZ_*`, the section 13 regime on the polygon engine at stiffness
0.5, 150,000 steps): mean length 2.50 without cooperative docking, 3.83 and 3.70 at `pUndock`
0.1 (two seeds) and 4.85 at 0.2, against 2.2 to 2.3, 4.0 to 4.7 and 4.4 to 5.4 on the rigid
engine. The same dose-response, slightly lower at 0.1. The polygon engine is about twice as
slow per step at this size.

**Membrane wedges.** The membrane block's rest shape is a trapezoid whose lateral sides lean in
by half the bend, so a ring is its rest state and no bend rule is needed; a bond forms where two
back corners touch and the pins pull the edges flush. A block one side deep cannot lean past
about 50 degrees, so rings have at least seven or eight blocks. 150 blocks in 40×40: rings of
about 7 at 45 degrees (9 rings by 20,000 steps) and 11 at 30 degrees (6 rings).

**Shape as a phenotype.** `bendA` and `bendB` give the replicator blocks the same wedge rest
shape, so a strand's resting curvature is set by its sequence. Copying `ABBABA` at stiffness 0.5:

| `B` bend per bond | births (seeds 2, 5) | exact |
|---:|---|---|
| 0 (square) | 15, 19 | yes |
| 10 | 25, 24 | yes |
| 20 | 9, 9 | yes |
| 30 | 0, 0 | - |

**Octagons** (`shapeA`, `shapeB` = `oct`: a regular octagon one side across, the four working
sides on alternate edges, the other four inert skin) copy at about the square rate, 14 and 20
births at stiffness 0.5, with one truncated copy per seed: neighbours touch only along short
edges, which leaves more room for neighbouring templates to interfere.

Shape has a fitness landscape: a slight taper copies faster than a square, a strong bend slows
copying and at 30 degrees a template cannot be copied at all (monomers docked on its outer curve
splay too far apart to link; an all-`B` 6-mer stays curled at about 155 degrees with monomers
docked on it). Two seeds at 20,000 steps each: a lead, not yet a result.

**Shape selects on sequence** (`shape.sh`, `SH_*`): the section 13 regime on the polygon engine,
40×40, 256 A + 256 B, low mutation, 800,000 steps, two seeds each. `B` blocks are wedges bending
20 degrees per `BB` bond (10 per `AB` bond), against square `B` as the control. The monomer pool is
half `B` throughout; what changes is what the newborns are made of (`pairs.js`):

| run | window | mean length | B fraction of newborn blocks | BB / AB / AA bonds (× chance) |
|---|---|---:|---:|---|
| SH_square_1 | first 200k | 4.40 | 0.50 | 0.73 / 1.42 / 0.43 |
| SH_square_1 | last 200k | 3.34 | 0.50 | 0.44 / 1.64 / 0.28 |
| SH_square_2 | first 200k | 4.04 | 0.51 | 0.70 / 1.59 / 0.09 |
| SH_square_2 | last 200k | 3.23 | 0.49 | 0.32 / 1.73 / 0.23 |
| SH_wedge_1 | first 200k | 2.14 | 0.02 | 0 / 1.03 / 1.00 |
| SH_wedge_1 | last 200k | 2.89 | 0.06 | 0.21 / 0.85 / 1.02 |
| SH_wedge_2 | first 200k | 2.07 | 0.03 | 0 / 1.06 / 1.00 |
| SH_wedge_2 | last 200k | 2.84 | 0.08 | 0.24 / 0.86 / 1.03 |

Block shape alone purged `B` from the genomes: with wedge `B` it makes up 2% to 8% of the blocks
in newborns, against 50% with square `B` and 50% of the pool. The population first collapsed to
`AA` dimers (a dimer has one bond to bend, so it copies whatever its shape) and then rebuilt length
out of `A` (mean newborn length 2.1 rising to 2.9). The prediction was that selection would favour
mixing, since an `AB` bond bends half as much as a `BB` bond; at 20 degrees it did not, because
even an `AB` bond (10 degrees) costs more than it buys.

With a gentler wedge the prediction holds (`SH10_*`, 10 degrees per `BB` bond, 5 per `AB`):

| run | window | mean length | B fraction of newborn blocks | BB / AB / AA bonds (× chance) |
|---|---|---:|---:|---|
| SH10_wedge_1 | first 200k | 3.66 | 0.48 | 0.30 / 1.69 / 0.32 |
| SH10_wedge_1 | last 200k | 3.29 | 0.47 | 0.04 / 1.83 / 0.28 |
| SH10_wedge_2 | first 200k | 3.89 | 0.50 | 0.30 / 1.76 / 0.17 |
| SH10_wedge_2 | last 200k | 3.18 | 0.50 | 0.02 / 1.82 / 0.34 |
| SH10_all_1 | whole run | 2.0 to 2.2 | 0.43 to 0.60 | about 1 / 1 / 1 (137 births in 800k) |
| SH10_all_2 | whole run | 2.0 | 0.39 to 0.53 | about 1 / 1 / 1 (125 births) |

The genome keeps the curved block and spaces it out. `B` stays at half of every newborn, but two
`B`s are almost never neighbours: `BB` bonds fall to 1% (0.02 to 0.04 × chance) against 8% to 11%
in the square control, and nine bonds in ten are `AB`. Where both block types are 10-degree
wedges (`SH10_all_*`) there is no straight block to fall back on, every strand curls, and the
population barely survives as dimers. The same physics gives three different answers depending
on how strong the shape effect is and whether there is an alternative: space the curved block out
(mild), purge it (strong), or fail (no escape). The controls are a warning about
baselines: with little mutation they keep the founder's make-up (`ABBABA` is four fifths `AB`
bonds), so "× chance" figures in a control measure descent as much as selection. The comparison
that counts is against the control, as everywhere above.

## 16. Compartments by chance (`encl.sh`, polygon engine)

40×40, 400 replicator monomers in the length regime, many membrane wedges, mild radiation
(0.0002 per bond, `resM` 0.7, both replicator types resistance 0.9), 150,000 steps, one seed each.
"Rings holding a strand" counts rings with two or more template units inside, sampled every
30,000 steps.

| run | M blocks | bend | rings | rings holding a strand |
|---|---:|---:|---|---|
| EN_m400_a20 | 400 | 20° | 11 to 15 | 1, 2, 2, 3, 2 |
| EN_m400_a25 | 400 | 25° | 19 to 24 | 0, 1, 1, 2, 0 |
| EN_m600_a20 | 600 | 20° | 14 to 24 | 2, 3, 1, 1, 10 |
| EN_m600_a30 | 600 | 30° | 44 to 50 | 0, 1, 0, 1, 0 |

Large wedge rings (18 blocks at 20 degrees) at high density do close around strands, up to ten
at once, where the rigid engine's rings almost never did. Two things are still missing for
compartments to be selected. At this radiation rate a ring opens every few thousand steps, far
less than a generation (about 20,000), so an enclosure does not last. And rings do not divide,
so a ring holding a good strand cannot make more rings like it. Division is the missing step.

**Can rings grow and split without a new rule?** (`ring_growth.js`, 500 membrane blocks at 25
degrees, radiation opening a ring every ten thousand steps or so, 150,000 steps.) The hope was
that an opened ring would take in free blocks, reclose larger, and at about twice its natural
size split in two when two of its bonds broke. It does not happen. Ring sizes stay at 8 to 18
(median 11 with soft blocks, 13 with rigid ones) and never reach 22: an opened ring's ends are
still next to each other, so it recloses before anything can join, and almost every block is
already in some ring, so there is little free membrane to add. Growth needs membrane to be made
continuously, not drawn from a fixed stock. The natural candidate is membrane made by the
replicators themselves: a precursor block that becomes a membrane block where it touches a strand
carrying some motif, so membrane forms around its makers and a ring holding a maker grows. 

**Membrane made by the replicators** (`make` rule, `make_probe.js`). Built as a state change, on
the user's preference, not a new type: membrane blocks start raw (their sides cannot link); the
back of an `A` template unit between two `B`s reads `MAKE`; an active block with no neighbours
falls back to raw at `pMemDecay`. Same world as above, 400 blocks at 18 degrees (rings of about
18), radiation opening rings, 150,000 steps. Mean over samples after step 30,000:

| membrane | rings holding a strand | template units inside rings |
|---|---:|---:|
| fixed stock, all active (`make` off) | 1.42 | 3.42 |
| made: a raw block activates where its face touches a `MAKE` back, then lets go | 0.08 | 0.17 |
| made and anchored: a raw block's back docks on a `MAKE` back and stays; raw blocks touching an active block's open side are recruited | 1.42 | 3.58 |

Neither version puts compartments around their makers. Activated blocks that let go drift off
and decay before they meet, so rings seldom assemble at all. Anchored blocks do start arcs on the
strands, but recruitment spreads: within 40,000 steps nearly every block is active (395 of 400)
and the world looks like the fixed-stock one. What is still missing is something that keeps a
membrane with the strand that made it, as a tether keeps a cell wall with its cell. The rule is
kept, off by default, as the base for that.

**Division by overgrowth, checked** (`ring_shape.js`, 2026-09-23). The hope behind "a ring grown
past its natural size divides": a closed loop of wedges that together want to turn 720° must
buckle, perhaps into a dumbbell whose waist brings two membrane backs together, where one local
rule could split it. Rings of 8 to 20 blocks built by hand and relaxed for 3,000 steps:

| bend, stiffness | natural size | 12 blocks | 16 blocks | 20 blocks |
|---|---:|---|---|---|
| 45°, rigid | 8 | round | coils into a double loop that overlaps itself | the same |
| 45°, soft (0.5) | 8 | round | round, blocks flattened | round, blocks flattened |
| 30°, rigid | 12 | round | round, pins gape | round, pins gape |

No ring pinches. Soft blocks and the pins' give absorb the extra membrane, so an overgrown ring is
just a larger round ring; at a strong bend it coils past itself, an artefact of the membrane's small
contact radius. Division would need a rule of its own; the geometry does not supply one.

Why the overgrown ring stays round: a bond pins two corners onto two corners, but the pins are
constraints solved in a fixed number of passes, and when a shape is geometrically impossible they
settle on an even compromise. In a natural 12-ring at 30° the pinned corners coincide (gap 0.008
of a side on average); in a 20-ring they gape by 0.15 on average and 0.27 at most, and 64 or 256
passes instead of 16 change nothing (0.147, 0.146). Frustrated pins act as stiff springs.
A strain limit (`maxStrain`, section 23) lets such a bond go, so membrane cannot hold a shape its
blocks do not fit; with it an overlong membrane closes into several rings of about the natural
size instead of one frustrated one (section 23).

## 17. Does space rescue a public good? (`space.sh`)

The `ABA` charging motif as the only real energy income (background reload 0.00005), energy
particles slowed to a fifth (`mobE` 0.2), low mutation, the length regime, 1,000,000 steps. The
same density of monomers and particles in a 40×40 world and in an 80×80 one (four times the
area, four times the population).

| run | world | motifs per template unit at 200k, 400k, 600k, 800k, 1M | mean length at the end | outcome |
|---|---|---|---:|---|
| SP_small_motif | 40×40 | 0.14, 0.08, 0.12, 0.03, 0 | 2.04 | collapsed to motif-free dimers |
| SP_small_motif_2 | 40×40 | 0.10, 0.02, 0, 0, 0.05 | 2.26 | collapsed |
| SP_small_motif_3 | 40×40 | 0.03, 0.07, 0.13, 0.18, 0.16 | 3.34 | survived, motif enriched |
| SP80_motif_1 | 80×80 | 0.11, 0.14, 0.12, 0.12, 0.12 | 2.96 | sustained |
| SP80_motif_2 | 80×80 | 0.12, 0.12, 0.09, 0.10, 0.10 | 3.55 | sustained |

In the small world the motif economy collapses in two seeds of three: once the motif carriers
dip, energy runs out, only dimers (which cannot carry `ABA`) still copy, and the motif is gone.
In the larger world neither seed collapses; the motif holds at about one template unit in ten
throughout. What this does not yet say is why. The larger world differs in two ways, local
structure (energy charged in one corner is spent there) and a four times larger population,
which is harder to lose to chance. Separating them needs the large world with energy mobility 1,
which washes local structure out while keeping the population.

| run | world | energy mobility | motifs per template unit at 200k, 400k, 600k, 800k, 1M | charged particles |
|---|---|---:|---|---:|
| SP80_fastE_1 | 80×80 | 1 | 0.14, 0.13, 0.11, 0.06, 0.04 | 130 to 185 of 192 |
| SP80_fastE_2 | 80×80 | 1 | 0.15, 0.18, 0.13, 0.11, 0.12 | 165 to 185 of 192 |

With fast energy the large world does not collapse either, so the rescue is mostly size: a
population four times larger does not lose its motif carriers to chance. There is a hint of local
structure on top. Fast particles find motif backs quickly, energy is plentiful (130 to 185 of 192
charged, against about 100 with slow particles), and in one seed the motif erodes to 0.04 per
template unit, as a public good does when free-riders pay nothing for it; with slow energy it held
at 0.10 to 0.14 in both seeds. One seed each way: space as such is not shown to matter yet.

## 18. Lock-and-key binding between strands (`binding.sh`)

Two template faces of opposite type bind at `pHyb` per step of contact; a bond with a bound
neighbour melts at 0.001 per step, a lone one at 0.1. Copies pair like with like, so kin never
bind. Small world, low mutation, the length regime, 1,000,000 steps. Diversity is counted over
newborns of three units or more, per 200,000-step window (`turnover.js`).

| run | pHyb | births | bindings | mean newborn length, last half | distinct sequences (mean) | entropy (bits, mean) | changes of the dominant sequence |
|---|---:|---:|---:|---:|---:|---:|---:|
| HY_ctl_1 | 0 | 5,275 | 0 | 3.64 | 30 | 3.89 | 3 |
| HY_ctl_2 | 0 | 4,961 | 0 | 3.65 | 33 | 3.92 | 3 |
| HY_h05_1 | 0.05 | 4,984 | 65,523 | 3.42 | 28 | 3.67 | 2 |
| HY_h05_2 | 0.05 | 5,465 | 68,153 | 3.15 | 26 | 3.56 | 3 |
| HY_h20_1 | 0.2 | 4,252 | 191,417 | 2.59 | 18 | 3.17 | 3 |
| HY_h20_2 | 0.2 | 4,750 | 180,152 | 2.56 | 18 | 2.96 | 2 |

The hope was frequency-dependent selection: common sequences caught by their complements,
diversity kept high, the dominant sequence replaced again and again. The opposite happened.
Binding lowers diversity (18 sequences against 30 to 33 at 0.2, 26 to 28 at 0.05), shortens strands and costs births, and the
dominant sequence changes no more often. The reason is that a two-unit match already holds, and
among random sequences a two-unit opposite-letter match is everywhere: binding is not a lock and
key but general stickiness, and it costs long strands most because they have more places to be
caught. **A longer key, tried.** `pMeltEnd` sets the melting of a bond with a bound neighbour on one side
only (the end of a run), between the lone rate and the in-run rate, so only runs of three or more
hold (a zipper). Bound units on average over 12,000 steps, four copies of `ABBABA` and of its
perfect complement `BABAAB` against eight random 6-mers:

| pMeltEnd | perfect complements | random strands |
|---:|---:|---:|
| 0.02 | 0.3 | 1.0 |
| 0.01 | 0.7 | 5.7 |
| 0.004 | 13.7 | 12.7 |

There is no window in which the perfect match holds and the random ones do not. Random 6-mers
share a three-unit opposite stretch often enough, and nucleating a run takes as long for a
perfect match as for a partial one. With two letters and strands of four to six, there are too
few distinct keys for recognition to be specific. The line would need longer strands or a larger
alphabet; it is parked, with both knobs off by default.

## 19. Two genes in a four-letter world (`genes.sh`, `motifs.js`)

Four letters, 128 of each, small world, low mutation, the length regime. Two rules of the same
form, both always on: `feed` (an armed `B` between two `A`s arms its neighbours: private energy)
and `shield` (a `D` between two `C`s makes its two bonds immune to radiation: private durability).
Seeds `ABABCD` and `CDCDAB` carry one gene each. Only the environment differs. Motif frequency
per block (× chance at the window's letter frequencies), by 250,000-step window:

| run | environment | ABA | CDC | mean newborn length |
|---|---|---|---|---:|
| G_none_1 | plentiful energy, no radiation | 0.054, 0.026, 0.027, 0.003 | 0.003, 0.001, 0.005, 0.024 | 3.4 to 4.0 |
| G_energy_1 | 26 particles, reload 0.0005 | 0.003, 0.009, 0.021, 0.001 | 0.075, 0.030, 0.009, 0.002 | 3.3 to 3.7 |
| G_rad_1 | radiation 0.0001 | 0.001, 0.003, 0, 0 | 0.185, 0.188, 0.171, 0.176 (13 to 21 × chance) | 2.5 to 2.6 |
| G_both_1 | both | 0, 0, 0, 0 | 0.207, 0.212, 0.203, 0.214 (8 to 10 × chance) | 2.6 |

Radiation selects the shield strongly and at once, and the population shrinks to about the
smallest strand that carries it, `CDC` itself, with both its bonds shielded. The energy setting
was not a pressure: `feed` fired 91 times in a million steps and births were as in the unpressed
run, so `ABA` drifted. With both, the shield wins alone and no genome carries both genes: the
radiation pressure toward short strands overrides everything, and a genome with both genes needs
at least six units.

Round 2 (`G2_*`), energy truly scarce (12 particles, reload 0.0003), radiation a third as strong,
two seeds each. Scarce energy: `ABA` rose to 0.09 to 0.11 per block (6 to 11 × chance) for
750,000 steps in one seed and was then lost, and never rose in the other; genomes shrank to 2.4
to 3.2 units. Both pressures: dimers in one seed, `CDC` alone in the other. No genome carried
both.

Why, in one line: neither gene pays for its own length. `ABA` with `feed` is three units that
save at most two energy particles, so a strand without it is always cheaper; `CDC` with `shield`
adds two bonds and protects exactly those two. Selection therefore prefers the shortest genome
that works, and two genes never fit. For genes to accumulate, a gene's benefit has to grow with
the genome that carries it. That is what the relay does (`relay`: a template unit passes FEED and
SHIELD on along its strand, away from the motif, so one motif arms or shields the whole strand);
round 3 (`G3_*`) repeats the four environments with it.

Round 3 (`G3_*`, relay on), per-block motif frequency (× chance) over the run, two seeds each:

| environment | ABA | CDC | mean newborn length | outcome |
|---|---|---|---:|---|
| none | drifts, 0 to 0.05 | drifts, 0 to 0.05 | 3.3 to 3.9 | neither selected |
| scarce energy | seed 1 held at 0.07 to 0.09 (4 to 7 ×) all run; seed 2 never arose | - | 3.3 to 4.1 (seed 1) | energy gene kept where it exists |
| radiation | - | 0.15 to 0.20 (8 to 11 ×), both seeds | 2.8 to 3.4 | shield gene selected, genomes longer than without the relay (2.5) |
| both | - | lost | 2.0 | both seeds collapse to dimers |

With the relay each gene pays for length where its pressure acts: energy-limited genomes carrying
`ABA` stay at 3.3 to 4.1 units, and radiation no longer shrinks shield carriers to bare `CDC`. No
genome carried both genes, though: two pressures at these strengths are more than the population
survives, and point mutation alone is slow to build a genome of six or more that has both.
Round 4 (`G4_*`) makes both pressures milder and turns on ligation, the one channel here that
joins two strands, so an energy-gene strand and a shield-gene strand can fuse.

Round 4 (26 particles, reload 0.0005, radiation 0.00005, relay on, two seeds each, with and
without ligation 0.02): every run survives and every run selects the shield (`CDC` 8 to 17 ×
chance). `ABA` never rises: `feed` fired 2 to 107 times in a million steps, so energy was still not
what limited births in the four-letter world. Ligation made 185 to 200 fusions per run and
genomes carrying both genes appeared (up to 8% of the long newborns in one window) but did not
spread, and none were left in the last quarter of either run.

Where the two-gene test stands: each gene is selected where its pressure acts, and with the
relay each pays for length; the shield is robust, the energy gene only where energy truly limits
copying, which in four-letter worlds is a narrow band between "not limiting" and "the population
dies". Genes did not accumulate in any run. The obstacle is not the rules for the genes but the
pressures: to hold two genes the population must meet two pressures of similar strength, each
strong enough to select and together weak enough to survive, for long enough that a combined
genome arises and spreads. That band has not been found.

**The band, searched** (`GR_*`): energy at 12, 16 and 20 particles (reload 0.0003 to 0.0005) against
radiation at 0.00002, 0.00003 and 0.00005, relay and ligation 0.01 on, 1,000,000 steps, one seed
each. Last 500,000 steps:

| energy \ radiation | 0.00002 | 0.00003 | 0.00005 |
|---|---|---|---|
| 12 particles | length 2.2, neither gene | 2.3, neither | 2.1, `ABA` traces |
| 16 particles | 2.2, `CDC` traces | 2.5, `CDC` 0.09 per block | 2.7, `CDC` 0.13 |
| 20 particles | 2.4, neither | 2.7, `CDC` 0.07 | 2.8, `CDC` 0.13 |

No cell holds both genes, and no cell holds the energy gene past the first half. Under two
pressures at once every population shrinks toward two or three units, the shield survives where
radiation is strong enough to select it, and the energy gene, which needs three units and an
armed middle before it pays, is lost. Genomes carrying both never exceeded a trace.

This is the old obstacle in a new form: every pressure in this world costs long genomes more than
short ones, so a genome carrying two genes must out-copy a dimer, and it does not. Biology's
answer to the same problem was not longer genomes first but compartments: genes in separate
short strands that share one enclosure and are selected together (the stochastic corrector). That
again needs compartments that keep with their contents and divide, which section 16 did not get.

## 20. Summary

**Historical summary:** this section predates gene accumulation (33), proofreading (38),
translation/stacks/ecology and the later engine settings. Its claims about absent genes,
old hinges and per-block physics are not current status. See the ledger, README and the
[2026-09-26 intent audit](../docs/RESEARCH_AUDIT.md); [ROADMAP](../ROADMAP.md) is the current queue.

- Copying, release, re-arming and turnover all come out of one internal state per square, one
  compatibility table and six local transitions, with nothing bigger than a square anywhere in
  the dynamics. Copies are exact when the soft knobs are zero.
- Every soft knob is a distinct, measurable mutation channel. Ligation, a runaway on rigid
  bodies, is on the per-square physics the one regime that keeps long strands in an open
  population (mean length 4.7, up to 25 units, 46 sequences), by fusion balanced against fraying.
- Without cooperativity or ligation the shortest strand wins in every energy regime tried, by 10:1
  to 60:1.
- With a lone docked monomer made unstable, the head-to-head race tips to longer strands at
  undocking rates above about 0.05 per step, decisively at 0.1. In the evolutionary regime with
  turnover the same rule has not yet produced a long-strand population: at low rates it changes
  nothing, at high rates nucleation starves at the densities tried.
- Life starts by itself from a seedless bath at every spontaneous-link rate tried, within 1,000
  to 15,000 steps.
- Radiation with unequal resistance selects on content: tough but scarce blocks make up 26% to
  46% of copied material, against 4% to 7% when they are scarce but not tough. Energy from `ABA`
  motifs sustains a population but is not selected for in a well-mixed world; the dimers free-ride.
- Hinged chains, rigid while copied and free when split, close into four-square rings once a
  hinge may form where corners touch; rings persist without radiation and accumulate as sterile
  durable forms, and the hinged, ligating population is the most diverse measured (about forty
  sequences, five bits). A trapezoid slack of 0.1 on flush bonds raises the copying rate by a
  quarter at no cost; 0.2 lets chimeras back in.
- Membrane blocks self-assemble into rings of a chosen size within 10,000 to 20,000 steps, and
  replicators are unaffected by them; but rings close around empty space at every density tried,
  so no strand was ever enclosed and compartment selection could not be measured.
- Turnover by end fraying is a deletion ratchet: every recycled monomer is a deletion. With
  processive fraying (a fraying strand unzips whole) and cooperative docking together, the open
  population holds a mean length of 4 to 5.4 by selection, 40 to 50 sequences, against 2.3 with
  either rule alone (three seeds each). Monomer density does not matter; recycling sets births.
- The `ABA` energy motif is not selected as a public good, even with energy scarce and slow. Made
  private (`feed`: the motif arms its own neighbours through their bonds) it holds at about 1.7
  times the control's frequency over 40 to 50 generations (0.15 to 0.19 motifs per block against
  0.05 to 0.10, four seeds each, no overlap), strands carrying it are longer, and alternating
  sequences, which the rule rewards most, become common without any rule mentioning them.
- In a four-letter world a shield gene (`CDC`: its bonds immune to radiation) is selected
  strongly and at once wherever radiation acts; an energy gene (`ABA` with `feed`) only where
  energy truly limits copying. With a relay (one motif serves its whole strand) each gene pays
  for the length of its genome. Genomes carrying both genes appeared with ligation but did not
  spread in any run: accumulation of genes has not been shown.
- On the polygon engine, a block's shape is a phenotype that selects on sequence, with no rule
  mentioning shape or sequence: a strongly wedge-shaped `B` is purged from the genomes (2% to 8%
  of newborn blocks against 50% with square `B`); a mildly wedge-shaped one is kept at half the
  genome but never placed next to another `B` (`BB` bonds 1% against 8% to 11% in the control).
- When the environment changes from plentiful to scarce energy, populations adapt: without the
  private motif they shrink to short, motif-free strands; with it the motif rises to 4 to 5 ×
  chance and alternating strands to half of the long births, and length holds.
- The open questions for Phase 3: make membranes nucleate on strands (one row: `M` binds a
  template's back), so that compartments hold a genome and the `ABA` motif's public good can
  stay with its carrier; find the radiation window where long strands persist; and give rings a
  way to divide.

## 21. Slow polymers: does limited dispersal rescue a public good? (`viscous.sh`, `assort.js`)

Section 17 slowed the energy particles and enlarged the world; the strands themselves always
diffused freely, so a copy was far from its parent within a generation. `mobS` slows every block
that has a bond (its Brownian step and turn) relative to a free one, as polymers adsorbed on a
mineral surface creep while monomers and energy diffuse: offspring stay near their parents. The
world is `SP_small_motif`'s (40×40, public `ABA` motif as the only real energy income, energy at a
fifth of its mobility, low mutation, the length regime, 1,000,000 steps). Copying is unharmed:
in a 150,000-step probe births were 571, 722, 606 and 840 at `mobS` 1, 0.3, 0.1 and 0.03, though
strands are shorter at 0.03 (2.4 against 4.0). `ABA` per newborn block, by 250,000-step window:

| run | mobS | ABA per block, by window | lost (≤ 0.01) in a window |
|---|---:|---|---|
| SP_small_motif (rerun, bit-identical) | 1 | 0.125, 0.102, 0.129, 0.035 | no, falling |
| SP_small_motif_2 | 1 | 0.105, 0.068, 0.004, 0.008 | yes |
| SP_small_motif_3 | 1 | 0.072, 0.128, 0.164, 0.184 | no |
| V_m10_1 | 0.1 | 0.159, 0.073, 0.001, 0.120 | yes, then back |
| V_m10_2 | 0.1 | 0.148, 0.130, 0.175, 0.118 | no |
| V_m10_3 | 0.1 | 0.213, 0.164, 0.146, 0.149 | no |
| V_m30_1 | 0.03 | 0.131, 0.149, 0.127, 0.107 | no |
| V_m30_2 | 0.03 | 0.120, 0.182, 0.207, 0.221 | no |
| V_m30_3 | 0.03 | 0.187, 0.114, 0.002, 0.007 | yes |
| V_ctl_m100_1 (motif off, reload 0.0003) | 1 | 0.046, 0.056, 0.087, 0.130 | - |
| V_ctl_m10_1 (motif off) | 0.1 | 0.037, 0.008, 0.035, 0.119 | - |
| V_ctl_m10_2 (motif off) | 0.1 | 0.036, 0.061, 0.109, 0.111 | - |

Slow polymers do make space: a newborn carrying `ABA` has carriers among the newborns born within
five units and 5,000 steps of it 1.12 to 1.61 times as often as among all newborns of that time,
against 1.05 to 1.18 at full mobility (`assort.js`). But the public motif is not rescued: it is
lost in one run of three at every mobility, and where it survives its frequency overlaps the
motif-off controls, which drift up to 0.11 to 0.13 by the end through founder descent. The losses
are not a slow invasion by free-riders but a crash: energy dips, only dimers (which cannot carry
`ABA`) still afford a copy, and the motif is gone with them. Kin clusters of a few strands do not
protect against that.

What this does not say: the worlds are small (about 100 strands) and one clustering scale was
measured; a larger world with slow polymers might behave differently. `mobS` stays as a physics
knob, default 1.

## 22. Is a two-gene genome kept once it exists? (`keep.sh`)

Section 19 asked whether evolution would assemble a genome carrying both genes and found none. This
asks the other half: seed only `ABACDC` (the energy gene `ABA` with `feed` and the shield gene `CDC`
with `shield`, relay on, so one copy of each serves the whole strand; three seed strands) in the
same four-letter world, and see whether it holds. Hard: the pressures of `G3_both` (12 particles,
reload 0.0003, radiation 0.0001); mild: `GR_e16_b3` (16 particles, 0.0004, radiation 0.00003);
none: 60 particles, reload 0.002, no radiation. Two seeds each, 1,000,000 steps.

| run | commonest newborns, first 50k steps | commonest newborns, 50k to 150k | last birth carrying `ABACDC` (step) | end: template units, mean length |
|---|---|---|---:|---|
| K_hard_1 | ABACDC, AB, CDC, CD | CDC, AB, CD, ACDC | 78,347 | 0, extinct |
| K_hard_2 | (both genes in half of the long births) | dimers only | 13,349 | 0, extinct |
| K_mild_1 | ABACDC, AB, ABA, CD | AB, CD, ABA, AC, CDC | 71,508 | 82, 2.4 |
| K_mild_2 | ABA and CDC at 11 to 16 × chance | both genes in 54% of long births | 175,877 | 58, 2.0 |
| K_none_1 | BBACDC, ABACDC, BACDC | BACDC, BBACDC, AB, CD | 221,527 | 291, 3.5 |
| K_none_2 | both genes in 14% of long births | no long birth carries both | 83,996 | 310, 3.4 |

The two-gene genome is not kept anywhere, not even without pressure. It falls apart into pieces
of itself (`AB`, `CD`, `ABA`, `CDC`, `ACDC`); the last birth carrying it comes between steps 13,000 and 222,000, and the pieces, each a
complete replicator of two to four units, out-copy the whole. Under radiation the reason is plain:
a newborn copy is not shielded until it is re-armed (the shield is a template-unit state), so it
is broken while it waits for energy, and the fragments live on. Under the hard pressures the
fragments die too and the world goes extinct; under the mild ones dimers take over.

What this says: the obstacle of section 19 is not only assembly. Every fragment of a genome longer
than two is itself a viable replicator, so any genome is in competition with its own pieces, and
pieces are cheaper. A genome can hold only where its fragments cannot live on their own. Two
directions follow: a smallest viable replicator longer than two (so fragments die), or compartments
(so fragments stay with the whole and are selected with it).

## 23. Flush polygons: snapped corners and a strain limit (`arc_split.js`)

On the user's picture of bonded polygons as one shape with a line between them: a bond pins two
corners onto two corners, but in a fixed number of solver passes the pins settle on a compromise
wherever the blocks cannot fit (section 16), and a closed ring of the wrong size shows gaping
corners. Two knobs, both default off:

- `snapCorners`: after the passes, every group of pinned corners (two blocks, or three or four
  meeting at a point) is brought to its common mean by deforming the blocks; the shape force works against the deformation from the next step on
  (rigid blocks included). Bonded sides are then always flush.
- `maxStrain`: a bond whose corners the passes left further apart than this (in block sides) lets
  go. It applies to membrane bonds and to a lone docked monomer (which falls off, as in undocking).
  A strand's own lateral bonds have their own limit, `maxStrainStrand`, off by default.

**Copying.** 40×40, 400 monomers, two `ABBABA` seeds, 40,000 steps, three seeds per row
(`snapCorners` on):

| rule for a strained bond | limit | births | unfaithful | strands not of length 6 at the end |
|---|---:|---:|---:|---:|
| none (limit off) | - | 107 | 0 | 0 |
| every bond breaks where it is | 0.25 | 854 | 49 | 471 |
| every bond breaks where it is | 0.9 | 129 | 18 | 44 |
| docked monomer falls off whole, strand bonds exempt | 0.25 | 496 | 26 | 496 |
| docked monomer lets go of its template only | 0.25 | 541 | 107 | 470 |
| only a lone docked monomer falls off; a copy in progress holds | 0.25 | 118 | 0 | 0 |
| the same | 0.4 | 115 | 0 | 0 |

Any mechanical break inside a copy in progress wrecks fidelity, at every limit tried: the strands
break into fragments, each a replicator. The misfits come from ordinary copying: 1% of face bonds
are pulled more than 0.26 to 0.54 of a side at any moment, almost all on docked monomers that
already have a linked neighbour (10% of those against 0.2% of lone ones), where a partial copy
forms a closed loop of bonds with its template; some are bridges between two neighbouring
templates. Polygon-exact contacts between unbonded blocks (a corner inside another block pushed out
across its nearest edge) were tried and removed: the tail did not shrink (face p99 0.45 either way)
and the physics ran 2.3 times slower. With a copy in progress exempt, copying is exact and
`snapCorners` alone copies exactly at stiffness 0.5 and 1 (140 and 159 births, none unfaithful, four
seeds).

**Membrane.** An open arc of 24 wedges at 30° (natural ring 12), relaxed, then left alone for
20,000 steps, 20 seeds each:

| setting | two rings | one ring | no ring | ring sizes |
|---|---:|---:|---:|---|
| no limit | 0 | 18 (all of 24, frustrated) | 2 | 24 |
| limit 0.25, rigid wedges | 4 | 13 | 3 | 9 to 13 |
| limit 0.25, corners snapped | 8 | 12 | 0 | 9 to 13 |
| no limit, corners snapped, stiffness 0.7 | 0 | 12 | 8 | - |
| limit 0.25, corners snapped, stiffness 0.7 | 15 | 5 | 0 | 8 to 14 |
| the same, an arc of 36 | 19 (two or three) | 1 | 0 | 8 to 14 |

Blocks that give a little plus bonds that give up past a limit turn an overlong membrane into
rings of about the natural size: the arc curls, the most strained bond lets go, and each part
closes. That is the physical half of division: a membrane that has grown to twice its natural
size usually ends up as two compartments. Whether the contents are split between them is the next
question. Fluid membrane (an open membrane side taking over a bonded one, `pSwap`) was also tried
and removed: rings formed faster but at the wrong sizes, and with the limit on it did not help.

## 24. Walls made by their strands (`tether_probe.js`, `cells.sh`, `walls.sh`)

Section 16's make rule activated membrane at a maker's back, but activated membrane spread
everywhere. `tether` keeps it with its makers: a raw block anchored on a `MAKE` back (the back of an
`A` template unit between two `B`s) passes an anchor signal along its arc (as `relay` passes `FEED`
along a strand); raw blocks join only an anchored arc's open ends; active membrane the signal does
not reach falls back to raw at `pMemDecay` and lets go. `memPerm` makes membrane permeable to free
monomers (a membrane block and an unbonded letter do not collide), while strands and energy
particles stay on their side. All on the flush-polygon physics of section 23 (corners snapped,
membrane stiffness 0.7, strain limit 0.5).

**What the tether does.** One `ABBABA` strand among 250 raw membrane blocks (30×30, no turnover,
energy not gating): an anchored arc grows on the strand's back and curls around it, the strand
bending along the inside of its wall; each copy that carries `BAB` starts a wall of its own; arcs of
neighbouring strands join end to end into walls shared by several strands; now and then an arc
closes into a ring around its maker and the maker's copy. Nothing in the rules mentions a cell;
the rule is "raw membrane joins the open end of an arc anchored on a maker".

**Rings holding strands**, three seeds per regime, 150,000 steps, bend 15° (rings of about 24),
standard turnover; mean over the last two thirds (`cells.sh`):

| membrane | seed 1 | seed 2 | seed 3 | active membrane at the end (of 250) |
|---|---:|---:|---:|---|
| fixed stock, all active | 1.40 | 2.30 | 1.70 | 250 |
| made at `BAB` backs (section 16's rule), permeable | 0.30 | 1.10 | 0.30 | 20, 250, 16 |
| tethered | 0.20 | 0.00 (extinct) | 1.20 | 155, 0, 74 |
| tethered, permeable | 0.00 | 0.80 | 0.00 | 0, 87, 0 |

By this measure the tether does worse than a fixed stock. Where walls vanish, the population lost
its `BAB` makers: a wall does nothing for the strand inside it yet, so nothing keeps the maker
motif against drift, and without makers the tethered membrane decays. When energy comes only from
the public `ABA` motif (charged particles cannot pass membrane), walls persist in both seeds tried
(121 to 176 active blocks after 200,000 steps, one to four rings holding strands). Whether walls
then pay (whether `BAB` and `ABA` rise together) is `walls.sh`, below.

**Correction (section 25).** The three rounds below ran with energy particles at full mobility and
membrane jostling as hard as any block, and in that setting walls do not keep energy particles in:
three particles started inside a closed ring were all outside within 20,000 steps. The benefit these
rounds were meant to test (energy kept inside) did not exist; what they measured is the cost of a
wall. Read them as that.

**Do walls pay?** (`walls.sh`, 30×30, energy only from the public `ABA` motif, 1,000,000 steps,
three seeds each.) W: strands carrying `BAB` grow tethered, permeable walls. N: the same world with no
membrane, where `BAB` does nothing. Per newborn block, × chance, by 250,000-step window:

| run | `BAB` | `ABA` | births | active membrane at the end |
|---|---|---|---:|---:|
| W_1 | 2.2, 0.8, 0.2, 0.1 | 2.7, 2.0, 2.3, 3.6 | 1,470 | 79 |
| W_2 | 0, 0, 0, 0 (lost with the motif at the start) | 0, 0, 0.3, 0.1 | 930 | 30 |
| W_3 | 1.6, 0.8, 0.4, 0.8 | 1.7, 3.0, 4.3, 3.2 | 1,485 | 49 |
| N_1 | 1.7, 2.3, 1.9, 2.2 | 1.6, 2.7, 2.1, 0.9 | 1,636 | - |
| N_2 | 1.9, 1.4, 2.0, 0.6 | 1.9, 1.9, 2.1, 0.7 | 1,469 | - |
| N_3 | 2.0, 2.8, 4.1, 3.9 | 2.3, 2.4, 2.4, 2.9 | 2,112 | - |

Making a wall is selected against: where walls exist `BAB` falls from about twice chance to a fifth
of it, while in the world without membrane, where it does nothing, it drifts around twice chance.
`ABA` does as well or better in the walled seeds that kept it, but only after the walls were gone.
The reason is that only a closed ring keeps energy in, and a wall rarely closes around its maker;
an open wall is a cost (it bends its strand, crowds the copies, and slows births) with no return.

What this says: tethered walls are made by, and stay with, their makers, which section 16 lacked,
but a wall pays only when it closes, and closure is left to chance. For compartments to be selected,
a maker's wall has to close around it reliably, and then divide with it. Neither is solved.

**Closure around the maker** (`closure.js`: one `ABBABA` among 150 raw membrane blocks, 24×24,
tether on, strain limit 0.5, corners snapped, 20 seeds, 60,000 steps). A wall that does not close
either overshoots (its two ends pass each other and it grows on into a spiral, up to three times a
ring's length) or breaks and loses its unanchored part. Two membrane ends link where their back
corners come within `memLinkTol` of each other (default: the side-to-side tolerance, 0.15 of a
side); passing ends rarely come that close. Since corners are now snapped together and a badly
aligned bond snaps under strain, the catch can be looser:

| bend | membrane stiffness | catch | walls closed around their maker | median step |
|---:|---:|---:|---:|---:|
| 15° | 0.7 | 0.15 | 10 of 20 | 30,000 |
| 15° | 1 | 0.15 | 8 of 20 (9 overshot, 3 broke) | 49,500 |
| 12° | 1 | 0.15 | 8 of 20 (5 overshot, 7 broke) | 30,000 |
| 15° | 1 | **0.3** | **20 of 20** | 11,500 |
| 18° | 1 | 0.3 | 20 of 20 | 13,500 |
| 12° | 1 | 0.3 | 15 of 20 | 13,500 |
| 15° | 0.7 | 0.3 | 14 of 20 | 10,000 |
| 15° | 1 | 0.5 | 19 of 20 | - |

With the looser catch a maker's wall closes around it within about 12,000 steps, stays closed for
10,000 to 50,000 steps, opens under strain and often closes again (eight seeds traced over 60,000
steps). Rigid membrane closes more reliably than soft.

**Do walls pay once they close?** (`walls.sh`, round 2, `W2_*`: the same test with rigid membrane
and the catch at 0.3; `W2b_1` at 18°; the `N_*` runs above are the control.)

| run | `BAB` × chance, by 250k window | `ABA` × chance | charged particles (of 40), every 100k |
|---|---|---|---|
| W2_1 | 2.3, 0.5, 0.8, 0.1 | 3.0, 4.6, 1.9, 1.0 | 33 36 39 37 33 26 1 5 36 2 |
| W2_2 | 1.0, 0.4, 0.4, 0.0 | 4.2, 4.1, 2.2, 1.1 | 38 38 38 40 38 40 34 38 34 2 |
| W2_3 | 0.3, 0, 0, 0.1 | 1.4, 0.2, 0, 0 | 36 27 1 19 1 1 1 1 2 0 |
| W2b_1 | 0.5, 0, 0.3, 0.1 | 0.6, 1.4, 3.1, 2.2 | 5 0 1 33 32 38 37 40 40 37 |
| N_1 (no membrane) | 1.7, 2.3, 1.9, 2.2 | 1.6, 2.7, 2.1, 0.9 | 39 38 33 38 38 38 38 39 19 0 |

Closing walls are selected against as strongly as open ones. The energy column shows why this test
could not have shown a benefit: once a few motifs exist, nearly every particle is charged, so energy
is not scarce, and a wall that keeps energy private saves nothing (the lesson of section 14 again).
What was measured is the cost: a closed wall also shuts its maker's copies in, so a walled lineage
cannot spread until its wall opens, while an unwalled one spreads freely. Round 3 makes energy scarce.

**Round 3, energy scarce** (`W3_*`, `N3_*`: 12 particles instead of 40, two seeds each):

| run | `BAB` × chance, by 250k window | `ABA` × chance | charged particles (of 12), every 100k | births |
|---|---|---|---|---:|
| W3_1 | 0.6, 0, 0, 0 | 0.6, 0, 0, 0 | 2 1 2 0 0 2 0 1 4 1 | 420 |
| W3_2 | 1.5, 0.9, 0.1, 0.1 | 2.3, 5.8, 4.0, 2.2 | 1 8 10 11 9 12 8 2 8 1 | 1,593 |
| N3_1 | 2.3, 2.1, 2.3, 1.8 | 2.3, 2.5, 2.8, 1.0 | 9 10 12 10 10 12 7 10 0 0 | 1,525 |
| N3_2 | 1.6, 2.1, 0.2, 0.3 | 1.5, 1.2, 1.7, 2.8 | 10 10 4 2 0 6 9 10 10 9 | 1,773 |

Walls are selected against here too: in the walled seed that lived, `BAB` fell to a tenth of chance
within 500,000 steps while `ABA` rose to 4 to 6 times chance without it; the other walled seed lost
its motifs early and lived on dimers. Even with 12 particles the energy economy flips between
plenty and crash, so a steady scarcity in which private energy pays for the wall was not reached.

Where walls stand after three rounds: made by their strands, tethered to them, closing reliably, and
not worth their cost to the lineage in any energy regime tried. Two costs are plain: a closed wall
shuts the maker's copies in until strain opens it, and the wall is made from the same crowded space
the lineage needs to spread into. The benefit (energy kept inside) is real only while energy is
scarce, and in this world energy is scarce only on the way to a crash.

## 25. Walls that are walls, and rays as particles (`leak.js`, `ray_shield.js`, `closure.js`)

**Leaks.** Particles started inside a closed ring of rigid membrane (24 blocks at 15°, immune to
rays), counted outside after 20,000 steps (`leak.js`; three particles; the ring's own polygon decides
inside):

| walls' mobility | energy, mobility 1 | energy, 0.2 | ray (size 0.3), mobility 0.3 | ray, 0.12 | ray, 0.08 |
|---:|---:|---:|---:|---:|---:|
| 1 | 3 of 3 out | 3 of 3 | 3 of 3 | 3 of 3 | 3 of 3 |
| 0.5 | 3 of 3 | **0 of 3** | 3 of 3 | 2 of 3 | **0 of 3** |

Two separate leaks. A particle whose Brownian step is a sizeable part of a side (energy at full
mobility moves about 0.6 per step) jumps a wall one block thick. And a wall block kicked as hard as a
free block (0.3 per step, sometimes 0.9) can carry its centre past a particle lying against it; the
disc contact then pushes the particle out the far side while the pins pull the block back (traced
step by step: the particle moves 0.6 to 1.2 within the solve, against a kick of 0.12). Crowding does
the same: particles pressed into the wall by others are pushed through. Neither is cured by more
passes or a wider contact list. A wall seals when its blocks move less (`mobM`, the membrane's
Brownian step, default 1) and what it holds moves in small steps. The same goes for strands: at full
strand mobility a strand leaves a closed ring (5% of its blocks inside at the end against 50% for a
strand that stays); at `mobS` 0.6 it stays.

**Rays** (`nX`, `rayHit`, `sizeX`, `mobX`): radiation as particles instead of a rate. A ray is a small
block that never bonds; it passes through everything but membrane, and touching a block it breaks one
of its lateral bonds at `rayHit` per step of contact, scaled by the resistances (a shielded bond does
not break). A closed ring then shields what it encloses by plain physics (`ray_shield.js`: a ring
immune to rays, a strand of four inside, one outside, 60 rays, broken bonds rejoined only where the
halves still touch, 30,000 steps):

| mobilities (bonded letters, membrane, rays) | hits inside | hits outside | strand blocks inside |
|---|---:|---:|---:|
| 1, 1, 0.08 | 0 | 992 | 3% (the strand left) |
| 1, 0.5, 0.08 | 0 | 1,420 | 4% (the strand left) |
| 0.6, 0.7, 0.08 | 152 | 492 | 50% |
| **0.6, 0.5, 0.08** | **0** | **594** | **50%** |

**Closure at sealing mobilities.** Slow membrane closes less often: the arms of a wall that miss each
other no longer wobble into each other, and they overshoot into spirals. The pictures show why they
miss: the maker, a straight strand anchored on its own wall, is a stiff bar across the inside of the
ring and holds the wall out of round near the anchor. A genome has to fit inside the wall it makes
(`closure.js`, bend 15° unless noted, catch 0.3, letters 0.6, membrane 0.5, 20 seeds, 60,000 steps):

| maker | closed | overshot |
|---|---:|---:|
| `ABBABA` (6 units) | 4 | 11 (5 broke) |
| `ABBABA`, bend 10°, catch 0.5 | 10 | 10 |
| `ABAB` (4) | 11 | 9 |
| `BAB` (3) | 19 | 1 |
| `BAB`, bend 18° | 20 | 0 |

(At full mobility, where walls leak, `ABBABA` closed 20 of 20: its strand bends and the wall wobbles.)
So in a world where walls hold, cell size limits genome length, a constraint no rule states. The
selection test with rays is `rays.sh`, below.

**Walls against rays** (`rays.sh`: 30×30, 60 rays at `rayHit` 0.0005, the sealing mobilities above,
`ABBABA` seeds, 1,000,000 steps, three seeds each):

| run | template units every 200k | births | ends |
|---|---|---:|---|
| R_W_1 (walls) | 0 0 2 0 0 | 285 | extinct |
| R_W_2 | 0 2 9 10 0 | 358 | extinct |
| R_W_3 | 6 0 2 0 0 | 269 | extinct |
| R_N_1 (no membrane) | 35 34 39 44 23 | 3,170 | dimers |
| R_N_2 | 16 51 26 24 45 | 3,021 | dimers |
| R_N_3 | 40 43 52 41 32 | 3,152 | dimers |

The walled worlds die; the unwalled ones live on as dimers. Two probes with three-unit makers
(`BAB`, which close their walls reliably), rays switched on at step 40,000 once walls had had time
to form, at `rayHit` 0.001 and 0.002: in both, one wall at most had closed when the rays came, the
unwalled strands died, and the walled lineage was gone by step 100,000 (its wall decays once its
maker is lost); the world without membrane lived on at 0.001 and was near extinction at 0.002.

Where compartments stand after sections 16, 24 and 25. Every piece works on its own: division of an
overlong membrane (strain), walls made by and tethered to their makers, closure around the maker,
walls that keep rays out and strands in. Together they do not pay, for reasons that are physical
rather than about the rules: a wall of 20 to 24 blocks recruited one at a time from the medium
takes longer to build than a strand takes to copy; walls seal only when membrane and contents move
slowly, and slow walls close only around short makers; a closed wall shuts its maker's copies in;
and a world dense in membrane is a worse place for strands. In every selection test here, making a
wall was selected against or the walled world died.

## 26. Cutting by recognition (`cut.sh`, `who_cuts.js`, `tribes.js`)

The user's choice after section 25: ecology instead of longer genomes. `cut` builds on binding
(section 18: two template faces of complementary letters, A–B and C–D, stick; a run of such pairs
holds long, a lone pair melts fast): a template unit in the motif `cutMotif` (default `BAB`) whose face
is bound to another strand shows `CUT`, and the unit bound to it lets go of all its bonds at `pCut`
per step, so the other strand is cut. Copies pair a letter with itself, so a strand and its copy do
not bind at the copying alignment; the hope was a bacteriocin: a cutter that cuts only non-kin.
Neighbours are competitors when polymers creep (`mobS` 0.3).

**Two letters** (`CUT_*`, `CTL_*`: 40×40, 256 A + 256 B, binding 0.05, `ABBABA` seeds, 1,000,000 steps):

| run | `BAB` × chance, by 250k window | births | cuts |
|---|---|---:|---:|
| CUT_1 | 0.3, 0.1, 0.2, 0.2 | 5,751 | 233 |
| CUT_2 | 1.6, 0.5, 0.3, 0.1 | 6,598 | 568 |
| CUT_3 | 0.6, 1.2, 0.7, 0.2 | 6,953 | 577 |
| CTL_1 (binding, no cutting) | 1.7, 0.9, 0.7, 0.3 | 5,322 | 0 |
| CTL_2 | 3.8, 3.7, 3.0, 2.4 | 5,964 | 0 |
| CTL_3 | 0.6, 0.3, 0.5, 0.8 | 5,280 | 0 |

The cutter motif is selected against, ending at 0.1 to 0.2 × chance in every cutting run. Births
rise a little with cutting (cut strands return their monomers). Who cuts whom (`who_cuts.js`, 200,000
steps of `CUT_1`'s world, each strand read along its own bonds): 34 of 77 cuts hit a strand of the
cutter's own sequence (`BABA` cuts `ABAB`, its reversed copy), 39 hit other strands without the motif.
The cutter is autoimmune: `BAB` is alternating, and an alternating stretch is complementary to
itself shifted by one letter, so a strand carrying it binds its own copies, which slow polymers keep
beside it. In two letters no cutter can avoid it.

**Four letters.** A strand that uses only one letter of each pair (only A and C, say) can never bind
its own kind. With cutter motif `CAC` and a cutter strand `ACACCA` among mixed strands, 23 of 24 cuts
in 200,000 steps hit strands carrying B or D, none a strand of the cutter's own sequence: self and
non-self are told apart by sequence. The selection test is below (`CUT4_*`, `CTL4_*`).

**Four letters, selection** (`CUT4_*`, `CTL4_*`: 128 of each letter, binding 0.05, cutter motif `CAC`,
seeds `ACACCA` and `ABCDBA`, slow polymers, 1,000,000 steps, three seeds each). Newborns of three
units or more by tribe (`tribes.js`: a strand using one letter of each binding pair cannot bind its
own kind):

| run | cuts | births | `CAC` per block, by 250k window | share of newborns in a tribe (not mixed), by window |
|---|---:|---:|---|---|
| CUT4_1 | 5 | 3,079 | 0.003, 0.001, 0.001, 0.001 | 4%, 10%, 6%, 6% |
| CUT4_2 | 14 | 3,221 | 0.012, 0.003, 0.002, 0.000 | 9%, 8%, 22%, 11% |
| CUT4_3 | 36 | 3,352 | 0.010, 0.001, 0.002, 0.012 | 8%, 6%, 13%, 18% |
| CTL4_1 | 0 | 3,380 | 0.004, 0.000, 0.001, 0.001 | 5%, 11%, 8%, 11% |
| CTL4_2 | 0 | 3,457 | 0.021, 0.000, 0.001, 0.001 | 17%, 7%, 11%, 10% |
| CTL4_3 | 0 | 3,382 | 0.025, 0.021, 0.005, 0.012 | 12%, 4%, 14%, 18% |

Nothing happened: cutting was too rare to matter (5 to 36 cuts in a million steps). The one A/C cutter
seed was swamped by mixed strands within the first window, and random sequences almost always carry
both letters of a pair (80% to 96% of newborns), so a cutter's own lineage is mixed within a few
generations and the motif is as rare as in the control. Cutting as built needs its motif to be
common before it can pay, and nothing makes it common. A null result, not a negative one.

## 27. Throwing things at the wall: a random search over worlds (`search.js`, `search_summary.js`, `world.js`)

The user's suggestion (2026-09-24): real evolution is messy and got going once enough complexity had
built up through many separate processes, so stop testing one mechanism at a time. Almost everything
built here fails alone for one reason: it is a cost with nothing yet to pay for it (walls without a
hazard, cutters without prey, energy genes without scarcity). `search.js` draws worlds at random from
everything built so far (two or four letters; energy count, reload, `motif`, `feed`, `relay`; `shield`;
`act`; radiation as a rate or as rays; binding and cutting with or without the relay; tethered walls,
permeable or not; polymer and membrane mobility; ligation; cooperative docking and fraying rates).
Seeds are four random strands and spontaneous origins, so no gene is put in by hand. Each world runs
300,000 steps (40×40, corners snapped, strain limit 0.5) and is scored, over the middle and the last
third, on newborn length, distinct sequences, how many of its functional motifs (those that do
something under its rules) are present, and how many sit in one genome. 80 worlds, results in
`experiments/out/search_1.jsonl`; 64 alive at the end. Top by length and by motifs in one genome:

| world | births | mean newborn length, middle → last third | distinct sequences | functional motifs present | most in one genome | mechanisms on |
|---:|---:|---|---|---|---:|---|
| 62 | 633 | 5.07 → 5.15 | 68 → 57 | `BAB` | 1 | 4 letters, walls (permeable), ligation, 40 particles, `mobS` 0.6 |
| 19 | 444 | 4.35 → 4.78 | 33 → 42 | `ABA`, `CDC`, `BAB` | 2 | 4 letters, public energy motif, shield, walls (permeable), binding 0.02, ligation, 40 particles |
| 59 | 218 | 4.05 → 4.23 | 13 → 16 | `CDC` of 3 | 1 | 4 letters, shield, relayed cutting, walls, binding, scarce energy, `mobS` 0.3 |
| 45 | 534 | 3.51 → 3.80 | 24 → 26 | `ABA` | 1 | 2 letters, cutting, binding, ligation, `mobS` 0.3 |
| 58 | 1,114 | 2.96 → 3.29 | 53 → 69 | `CDC`, `ACA` | 1 | 4 letters, relay, shield, cutting, radiation, binding 0.05, ligation, 12 particles |
| 65 | 1,483 | 3.10 → 3.06 | 59 → 55 | `ABA` | 1 | 2 letters, feed, relayed cutting, 80 rays, binding 0.1, ligation, `mobS` 0.3 |

(Two-letter worlds reach "two motifs in one genome" trivially: `ABAB` carries `ABA` and `BAB`.) World 19
is the first world in this project where genomes are long and growing, diversity is rising, all
its functional motifs are present, and genomes carry two of them at once, in four letters, where
two genes need five units or more. Ligation is on in five of the six. Walls, which never paid in a
controlled test, are on in three. One seed each and 300,000 steps: these are leads. Long runs and a
second seed follow (`world.js`).

**World 19 followed up** (`world.js 19`, 2,000,000 steps, and with a second random seed): mean newborn
length by 500,000-step window 5.0, 7.3, 7.9, 8.7 (second seed 5.0, 7.9, 12.1, 11.0), strands in the
population 12 to 13 units long at the end, the longest this project has seen; but births fall in
every window (596 to 195), diversity falls (36 to 18 distinct), and the three motifs do not hold.
Knockouts, one mechanism off at a time, 1,000,000 steps:

| world 19 with | mean strand length at 1M | births | `ABA` × chance, second half |
|---|---:|---:|---:|
| everything on | 7.7 | 959 | 0.7 |
| ligation off | **4.1** | **1,540** | **6.9** |
| binding off | 17.8 | 667 | 0.7 |
| walls off | 8.6 | 845 | 1.9 |
| shield off | 12.3 | 833 | 1.8 |
| energy motif off | 14.1 | 605 | 2.0 |

The long genomes are ligation and nothing else: strands fuse end to end, fraying is at the bottom of
the searched range (1.1e-5), and fused strands pile up and copy ever more slowly. It is accumulation
by fusion, not selection for function. Without ligation the world copies faster and the energy motif
stands at 5 to 7 times chance. A false lead, with a lesson for the search: mean length rewards fusion,
so a score must ask for function, not length.

## 28. Stranger blocks (the user's idea, 2026-09-24)

Block types that were not thought of or were set aside, each behind a knob (default off,
trajectories bit-identical) so the search can draw them.

- **Size and mobility per letter** (`sizeA`..`sizeD`, `mobA`..`mobD`). 40×40, two `ABBABA` seeds,
  30,000 steps, two seeds: uniform giants (1.4) 77 births, none unfaithful; uniform small letters
  (0.7) 84 births, 7 unfaithful; A at 1.4 with B at 0.7, 2 births: a docked giant and a docked small
  neighbour cannot hold a link, so a strand of mixed sizes can hardly be copied.
- **Folding letters** (`foldA`..`foldD`, degrees): a folding letter has the fold as its bend while
  its face is free and its ordinary shape while something is bound to its face, so a free strand
  curls and the part being copied straightens (copy straight, fold free: the hinge idea of the rigid
  engine, now as a shape). Twelve A at 30° curl into a spiral; they do not close into a ring (ligation
  needs flush ends). Copying is untouched: fold 0, 10 and 20° on both letters give 74, 71 and 76
  births, none unfaithful.
- **Caps** (`nP`, `nQ`, `capFray`), after the user's question whether chains have end blocks (they did
  not: an end was any letter with a free side). `P` has only a right side and can sit only at a left
  end, `Q` the mirror; a copy lies reversed on its template, so `P` docks on a `Q` template and `Q` on
  `P`, and a capped strand `P…Q` copies into a capped strand. A cap cannot be extended, captured onto
  or ligated, and it frays at `capFray` times the normal rate (default 0: never). Seeds `PABBAQ`
  against `ABBA`, strong fraying, three seeds, 40,000 steps:

  | seed | births | capped at both ends | frays | template units at the end |
  |---|---:|---:|---:|---:|
  | `PABBAQ` | 59 | 59 | 0 | 922 |
  | `ABBA` | 3,191 | 0 | 3,461 | 688 |

  Capped strands never die, so the material ends up locked in immortal templates and births almost
  stop; caps need something else that kills (radiation, rays, cutting). A capped genome changes length
  only by copying errors inside it (the user's point: consistent copies, variation still possible).
  The errors that appeared are duplications: `PABBAQ` → `PABBBBAQ` → `PABBBBBBBBAQ`, made when a copy's
  two halves dock on two neighbouring templates and link in the middle (the chimera of crowded
  templates, section 10). With capped ends that is the only way a genome grows, and what it makes is
  internal duplication, which in biology is the raw material of new genes.

Search round 3 (`search.js --round=3`) draws folding letters, more ligation and caps on top of round 2.

## 29. Double strands and temperature cycles (`duplex.sh`), partial

Complementary copying (`compCopy`) with binding (`pHyb` 0.2) and heat cycles (`heatPeriod` 5,000, hot fifth). 500,000
steps, 40×40. Seeds 1 and 2 finished (seed 3 and `DX_bindheat_2` were stopped at the handoff, 2026-09-24). Mean length of
newborns (length 2 and up) per 125,000-step window:

| run | births | mean length by window |
|---|---:|---|
| DX_comp_1 (no binding) | 2,674 | 4.55, 3.61, 3.37, 3.48 |
| DX_comp_2 | 2,213 | 4.60, 4.26, 4.18, 3.71 |
| DX_bind_1 (binding, no heat) | 2,444 | 2.09, 2.26, 2.38, 2.39 |
| DX_bind_2 | 2,578 | 2.13, 2.31, 2.33, 2.33 |
| DX_bindheat_1 (binding + heat) | 1,678 | 4.56, 4.17, 3.92, 3.63 |
| DX_heat_1, DX_heat_2 (heat, no binding) | | identical to DX_comp_1, _2 (heat acts only on binding) |

What it says: binding without heat collapses length to about 2.3 (long strands are locked in double strands and stop
copying; short ones win). Heat undoes that: with cycles, length stays near the no-binding level (3.6 at the end against
3.5, one seed). The earlier lead (4.3–4.8 against 3.65 in a short probe) does not hold at 500,000 steps. What it does not
say: one seed for binding + heat; whether double strands protect anything (no pressure was on).

## 30. Chirality (`chiral.sh`, `hand.js`), partial

A racemic pool (`chiral` 0.5), one strand of each hand as seeds, 300,000 steps. Births per 50,000-step window as
one-handed upper / one-handed lower / mixed, and the enantiomeric excess of the one-handed ones:

| run | windows |
|---|---|
| CH_mis0_1 (no mirror docking) | ee 0.10, 0.13, 0.04, 0.06, 0.06, 0.06; no mixed births |
| CH_mis03_1 (`pMisDock` 0.3) | ee 0.10, 0.03, 0.13, 0.10, 0.21, 0.02; about half of births mixed |
| CH_mis1_1 (`pMisDock` 1) | ee 0.00, 0.16, 0.04, 0.16, 0.04, 0.01; about half mixed |

No symmetry breaking: with hands fixed for life, the losing hand's monomers pile up in the pool and favour it again
(negative frequency dependence), as expected without a shared pool. Round 2 (`ROUND=2 experiments/chiral.sh`: free monomers
flip hand at `pRacem` 0.001, mixed neighbours link at `pMixLink` 0.001, with and without mirror docking; Frank's conditions)
was started and stopped at the handoff; it needs running. Seed 2 of round 1 also.

## 31. Droplets (`droplets.sh`), not yet run

`nG` blocks separate into liquid droplets at `gStick` 1, `gRange` 2.2 (at 0.3 or with range 1.6 they stay dispersed:
Brownian steps are 0.3 of a side). With strands drawn to G (`gStickS` 0.6, `gStickF` 0.3) about a fifth of template units
sit in droplets, at the droplet surfaces, and copying is unharmed (105 births in 30,000 steps against 82 without). The
selection test (does grouping in droplets rescue the public `ABA` motif that section 21 lost) is scripted, not run.

## 32. Random chemistry (`src/rchem.js`, `rsearch.js`, `autocat.js`), partial

The user's question (2026-09-24): blocks with random sides, random attractions and random switching rules in one world,
too much chaos or enough for complexity? A random table: K types, NS states, NC side colours (0 inert); a side's colour
from (type, state, side); colour pairs attract with probability pAff; rules "side i bonded to colour c (or free) → state
s" with probability pRule. 31 of 100 tables screened (`experiments/out/rsearch_1_partial.jsonl`, 30,000 steps, 25×25,
about 300 blocks):

- 5 of 31 gel (one assembly of 100 or more blocks), 2 barely bond, 24 in between: small assemblies that form and break.
- Order beyond chance is common: repeats among assemblies of 3+ blocks against the same assemblies with their make-up
  shuffled are 44 against 1 (table 55), 30 against 0 (table 4), 65 against 22 (table 57). Table 4 of the first probe
  builds 2×2 squares of two types. This is self-assembly; it is not yet known to be copying.
- Positive control: `copyTable()` is a hand-written copier in the same format (states: free, docked, docked and linked
  right or left, released, strand, left end, right end, leaving). It copies (strand blocks from 12 to 140 in 30,000 steps)
  but products fragment into 2–3-block strands (the fragment problem of section 22 again). `autocat.js --control`: 4
  copies of its commonest assembly put into a fresh world give 12 after 1,000 steps against 1 unseeded. That is the test
  that separates copying from self-assembly.

Not yet done: `autocat.js` on the top tables (55, 57, 4, 15, 1, 54), and the other 69 tables.

## 33. Telomeres: end-replication loss and the fragment problem (`telo.sh`, `telo3.sh`, `telo2.sh`, `capped.js`)

Section 22 ended on the fragment problem: any piece of a genome is itself a replicator and out-copies the whole, so a
two-gene genome falls apart into its genes. `endLoss` is a one-neighbour rule aimed at it (the user's point the same day:
locality is fundamental, so no rule may treat whole strands specially). A template block with a free lateral side shows no
face and marks its bonded side as a tip; a block that reads the tip counts that side as the end. A copy therefore lacks
its template's open ends. Caps (`P` has no left side, `Q` no right side) have no free side, so a strand capped at both ends
copies whole; a piece shrinks by a unit per open end per generation (`ABBABA` → `BABB` → `BA` → nothing; `PABBAB` →
`ABBAQ` → `PABBA` → `BBAQ` → `PAB` → `AQ` → nothing, `test.js`). This is the end-replication problem of linear
chromosomes and the telomere answer to it.

**Finding a working regime** (40×40, four letters, feed, shield and relay on, seed `PABACDCQ` ×3, 150,000-step probes):

| regime | what happened |
|---|---|
| 40 caps of each kind, 128 of each letter, `pFray` 3e-5, `pUndock` 0.1 | copying of the 8-unit genome so slow that radiation 3e-5 kills everything |
| 60 caps, `pUndock` 0 | copying stops at 20,000 steps: half-finished copies hold all the `A` and `C` monomers, and a template with a copy on it cannot die |
| 40 caps, 200 of each letter, `pUndock` 0.02 | the pieces' dying lineages (`CDCA` → `CD`, `PABA` → `BAQ` → `PA`) hold the caps; capped births stop |
| 120 caps, `pUndock` 0 | better (69 to 90 capped births in the first 50,000 steps), then the pieces' lineages fill the world and take the free letters |
| 120 caps, open ends fragile (`pFray` 0.001), caps not (`capFray` 0.03) | pieces die within about 1,000 steps; whole genomes copy steadily (120 to 340 capped births per 50,000 steps) |

The last is the regime of everything below: open ends fray fast (an exonuclease), capped ends slowly. Biology again: an
unprotected chromosome end is degraded.

**Round 1** (`telo.sh`, seed `PABACDCQ` alone, 500,000 steps, seed 1). Environments as in section 22: none (60
particles, reload 0.002), energy (16, 0.0004), radiation (`pBreak` 3e-5), both. Share of capped births carrying each gene:

| run | 0–100k | 100k–200k | 200k–300k | 300k–400k | 400k–500k |
|---|---|---|---|---|---|
| none | ABA 55%, CDC 47%, `PQ` 35 of 292 | `PQ` 271 of 388 | `PQ` 371 of 379 | `PQ` 360 of 361 | `PQ` only |
| energy | ABA 89%, CDC 90% | 82%, 82% | 87%, 74% | 89%, 53% | 85%, 64% (length 7.8) |
| radiation | ABA 65%, CDC 85% | 66%, 85% | 65%, 85% | `PQ` 101 of 363 | `PQ` 464 of 554 |
| both | ABA 73%, CDC 73% | `PQ` 373 of 675 | `PQ` 628 of 665 | `PQ` only | `PQ` only |

What it says. The fragment problem is gone: genomes do not fall apart into their genes, and each gene is kept where its
pressure acts (the energy gene at 85 to 89% under scarce energy while the unused shield gene drifts down; the shield at 85%
under radiation). But a new, smaller replicator appears: `PQ`, two caps and nothing between, made by a copying mistake
(first births of `PQ` at steps 17,615 to 30,198 in all four runs, from parents such as `DCABAQ`, `PABACDCQ`, `PCDC`).
Without pressure it won at once. Under radiation it arose at step 28,069 and took over only after step 300,000; under both
pressures it took over by step 200,000. Under scarce energy alone it arose (step 25,558) and did not spread: 19 births in
500,000 steps, while the two-gene genome held at length 7.8. So under scarce energy the genome with the private `feed` gene holds against `PQ` (why exactly is not measured); under
radiation, which costs per bond, the one-bond `PQ` wins slowly, and with both pressures radiation's push wins sooner. A gene here only reduces a cost that grows
with length, and the shortest genome hardly pays that cost.

Controls without `endLoss` (`TK_off_*_1`, same world otherwise): under scarce energy `PQ` takes over too (the two-gene
genome falls from 72% to 28% of capped births, `PQ` is the commonest capped strand at the end), where with `endLoss` it never
spread; under radiation the genome falls apart into its pieces, `PCDCQ` (the shield gene alone) rising to the commonest
capped birth (94 of 242 in the last window) beside `PQ`, with most births uncapped; under both pressures `PQ` again. So
`endLoss` alone already stops the genome falling into its genes, and under scarce energy it also keeps `PQ` out.

The fix tried next is in the same spirit as `endLoss`, one block property: `bareCaps`, caps have no back, so no energy
particle docks on a cap and a cap is armed only through its bond (the `feed` relay). Then `PQ` can never be re-armed, and a
genome must carry the energy gene to reproduce, as a real genome must encode its own metabolism.

**Round 2: bare caps** (`telo3.sh`: as round 1 with `bareCaps`; `TB_comp_*`: `PABACDCQ` against `PABAQ`, three seed strands
each; 500,000 steps). With bare caps `PQ` is sterile and the smallest viable genome is `PABAQ`, the energy gene between
caps. Share of capped births carrying each gene, and the one-gene competitor's births, by 100,000-step window, seed 1:

| environment | 0–100k | 100k–200k | 200k–300k | 300k–400k | 400k–500k | `PABAQ` births after 100k |
|---|---|---|---|---|---|---:|
| none | ABA 67%, CDC 15% | 58%, 2% | 55%, 0% | 57%, 0% | 60%, 0% | 183 to 192 per window |
| energy | ABA 72%, CDC 21% | 67%, 0% | 68%, 0% | 64%, 0% | 66%, 0% | 234 to 279 per window |
| radiation | ABA 86%, CDC 64% | 84%, 80% | 86%, 83% | 85%, 86% | 85%, 84% | 1 |
| both | ABA 91%, CDC 79% | 94%, 91% | 90%, 90% | 92%, 91% | 93%, 92% | 0 |

(The capped births without `ABA` are one-generation dead ends: `PABDQ`, `PCBAQ` and the like, point mutants of the energy
gene that cannot re-arm their caps. That load is why `ABA` sits at 55 to 70% of births where `PABAQ` wins.)

What it says: the shield gene is kept exactly where it pays. Where radiation acts, the eight-unit genome carrying both genes
drives the five-unit `PABAQ` extinct within the first 50,000 steps (78 births of it in the first 50,000, then 1 in 450,000)
and holds both genes in 74% (radiation) and 81 to 86% (both pressures) of capped births for the rest of the run, at mean
capped length 7.9 to 8.0. Where radiation does not act, `PABAQ` wins and the shield gene is lost by step 100,000 to
200,000. This is the first time in this project that a genome with two genes has been selected over a shorter competitor
and kept, and it happens in the environment (energy and radiation together) where every earlier attempt collapsed (section
19: to dimers; section 22: to the genome's own pieces; round 1: to `PQ`). **Seed 2** repeats every cell: with no pressure and with scarce energy `PABAQ` wins and the shield gene is gone by step
200,000 (`TB_comp_none_2`, `TB_comp_energy_2`); with radiation (`TB_comp_rad_2`, `TB_comp_both_2`) `PABAQ` is
out-competed within the first window, both genes in 68 to 70% (radiation) and 82 to 85% (both) of capped births from
100,000 steps to the end. **Keep runs** (`TB_keep_*`, `PABACDCQ` alone, two seeds): with radiation both genes stay in 67 to 88% of
capped births for 500,000 steps (under both pressures `PABAQ` arose by mutation, 33 births between steps 200,000 and 300,000,
and was purged); without radiation the shield gene decays by point mutation (74% → 32% with no pressure, 75% → 26% under
scarce energy in seed 1; 68% → 45% and 60% → 55% in seed 2) while the energy gene holds at 80 to 89%.

**Control: bare caps without `endLoss`** (`TB_noend_comp_rad_1`, radiation, seed 1). Among capped births the two-gene
genome still beats `PABAQ` (both genes in 59 to 71%), so bare caps are what decide between capped genomes. But pieces now
live on: capped births are 13 to 19% of all births (against 25 to 33% with `endLoss`), mean newborn length is 3.8, and at
the end the world holds 25 two-gene genomes among dimers and pieces (`CP`, `AP`, `DCP`, `CQ`, `AB`), against 47 with
`endLoss`. `endLoss` keeps the population made of whole genomes; bare caps make the second gene pay.

**Assembly** (`telo2.sh`, `TA_lig_1`: seeds `PABAQ` and `PCDCQ`, both pressures, ligation 0.02, 1,000,000 steps): no
genome carrying both genes was ever born. With bare caps `PCDCQ` cannot re-arm, so its seeds only wait to be broken; the last
birth carrying `CDC` was at step 32,662, and 174 ligations in the run never joined a `CDC` piece to an `ABA` piece. The test
gave the second gene no time to be picked up. The fairer question, whether the shield gene can arise inside `PABAQ` by
mutation, is `telo4.sh`.

**A gene from nothing** (`telo4.sh`, `TD_*`: seed `PABAQ` only, both pressures, 1,000,000 steps). A shield gene needs about
three insertions and some point mutations inside a genome that must keep `ABA` at every step. None arose: at fivefold
mutation (`pSoft`, `pCapture` 0.01) one birth in two million steps carried `CDC` (a sterile `PCDCQ`), and capped births were
almost all five units long (seed 1: 3,945 of length 5, 66 of length 6, none longer; seed 2: 4,386 of length 5, one of
length 6). Insertions happen but are lost: each adds a bond for radiation to break and pays nothing until the whole gene is
there, and under both pressures the population is small (60 to 70 template units, about thirteen genomes). This is the
classic valley between genes. Under radiation alone (`TD_rad5_1`, `_2`: plentiful energy, about 300 template units or
60 genomes, fivefold mutation) it is the same: 28 births in two million steps carried `CDC`, all of them sterile pieces
(`CDC`, `PCDCQ`, `CDCD`), none with `ABA` as well; 15,103 capped births were five units long and ten were longer. With these
mutation channels and population sizes a new gene of three letters does not arise inside a genome in a million steps.
Seeded, it is kept; from nothing, it is not made.
Part of the reason is the mutation spectrum: in a capped world almost only point mutations happen (a copy lies letter for
letter on its template; insertions and deletions need a copy that bridges two templates, which is rare), so genome length
hardly changes (15,103 of 15,113 capped births five units long). Ligation adds a local channel that changes length: a
genome broken by radiation can have its pieces rejoined to other pieces (end joining, as cells repair double-strand
breaks), giving duplications and deletions. With ligation 0.05 (`TD_lig_1`, `_2`, radiation only, fivefold mutation)
length varies more (lengths 6 to 10 in 94 and 88 capped births, against 10 in all without it), but no genome carrying both
genes was made in two million steps either (40 births with `CDC`, all sterile pieces).

**Niches** (`band.sh`: radiation only in the left half of an 80×20 world, `radBand` 0.5, seeds `PABACDCQ` and `PABAQ`,
1,000,000 steps, seed 1). Share of capped births carrying `CDC`, lit half (x < 40) against dark half, by 200,000-step window:

| run | lit half | dark half |
|---|---|---|
| TR_band_1 (ordinary mobility) | 63%, 83%, 82%, 83%, 80% | 46%, 63%, 70%, 65%, 64% |
| TR_bandslow_1 (`mobS` 0.3) | 79%, 81%, 81%, 83%, 82% | 58%, 50%, 54%, 55%, 44% |

No second species: `PABAQ` died out in both halves (after about 200,000 steps with ordinary mobility; at once, by chance,
with slow polymers, 4 births in all), so the dark half is filled by the lit half's genome too. What does differ is the
shield: in the dark half it decays by point mutation into same-length genomes with a broken shield (`PABADDCQ`,
`PABABDCQ`, `PCDBABAQ`), 44% against 82% at the end with slow polymers. That is relaxed selection in a place: a cline in
the genomes across the world, the first spatial difference in genomes seen here. One seed each.

## 34. Translation: a genome that builds a second polymer (`tr1.js`-style probes, `CA_*` runs), stage by stage

The user's direction (2026-09-25): emergent complexity from local rules, ideally "a well-running machine made of independent
parts that can copy itself", and replication modes of different kinds together. Of the directions in `LITERATURE.md` and
DESIGN 15, translation was chosen first: the genome builds something that is not a copy of itself (von Neumann's missing
half). `translate`: the back of an armed letter templates a *product* block (a new family, kinds `1`..`4`) by a fixed code
(`A`→`1`, `B`→`2`, `C`→`3`, `D`→`4`); docked products link where the template continues and a finished product chain is
released, exactly as a copy is on the face. No rule mentions translation: it is docking, linking and release on another
side.

**Stage 1, translation works** (40×40, four letters and four product kinds of 100 to 150 each, seed `ABACDCAB`): 12 of 12
products in 20,000 steps were exact (`ABACDCAB` → `12134312`), made beside ordinary copying. A first version cut products
short at any neighbour not yet re-armed (partial products `3121`, `12`); continuation is now read from the neighbour's type,
and a product waits for a neighbour that will be armed.

**Stage 2, products fold** (`fold1` 45°: a product block of kind `1` is a wedge while its face is free and square while
docked): the product of `AAAAAAAA` folds into an almost closed wheel of eight wedges (rendered; one gap: ligation needs flush
ends). Shape follows the genome's sequence.

**Stage 3, the machine needs its part** (`catalysis`): a finished product binds back onto strands it matches by the code
(cooperatively: a lone bound unit lets go at 0.05 per step, one in a bound run at 0.0005), and where one is bound the
template's face is catalysed: two monomers docked there link at once, elsewhere only at `pLinkBare`. Two letters, 50,000
steps, seed `ABBABA`:

| world | births |
|---|---:|
| ordinary copying | 152 |
| `pLinkBare` 0.01, no translation (no catalyst) | 0, extinct by step 30,000 |
| translation, no catalysis | 127 |
| translation + catalysis, `pLinkBare` 0.01 | 40, from step 30,000 on and accelerating (template units 19 → 201) |

With `pLinkBare` 0 nothing is ever copied without products, and with translation copying runs (test). The genome is copied
only with the help of the machine part it builds. (A bug on the way: the catalysis gate first applied to the links between
product blocks too, so no product could be finished; products link freely now.)

**Does the machine make length pay?** The hypothesis: longer products bind back longer, so length pays by degrees, which
might carry genomes over the valley of section 33. 300,000 steps, two letters, mutation (`CA_cat_1` against `CA_ctl_1`,
translation without catalysis):

| run | mean newborn length by 50,000-step window | births per window |
|---|---|---|
| CA_cat_1 | 5.25, 4.27, 3.97, 3.93, 3.60, 3.73 | 116 to 184 |
| CA_ctl_1 | 4.87, 4.10, 4.02, 3.99, 3.64, 3.64 | 161 to 218 |

No: length falls the same way with and without catalysis. The machine works but adds no new selective dimension: every
genome's own product fits it, and a two-unit product binds as stably as a long one (both of its units count as in a run).
One seed. What it would take for the product to matter: a function that depends on the product's sequence or shape in
graded ways (its fold, its kinds' physics), not only on matching its maker.

**Four times the population** (`telo5.sh`, `TE_lig_1`, `_2`: 80×80, 800 letters and 480 caps of each kind, about 240 genomes,
radiation only, fivefold mutation, ligation 0.05, 1,000,000 steps): about 30,000 capped births per run, 1.7 to 1.9% longer
than five units (up to 16), `CDC` in 14 and 16 capped births (mostly the sterile `PCDCQ`; near-misses such as `PABCDCQ`,
which has `AB`, not `ABA`), and no birth carrying both genes. Population size alone, at four times, does not make the gene.

**Scarcity and density** (`scarcity.sh`: the `TD_lig` world, caps 30/60/120 of each kind × letters 100/200/400 of each kind,
400,000 steps, seed 1). Capped births from step 200,000 on:

| caps \ letters | 100 | 200 | 400 |
|---|---|---|---|
| 30 | extinct | extinct | extinct |
| 60 | extinct | extinct | length 5.05, 3.1% longer than 5 (up to 9) |
| 120 | extinct | length 4.99, 1.0% longer than 5 (up to 10) | length 5.21, **10.4%** longer than 5 (up to 14) |

Under this radiation a capped world needs density to live at all (six of nine cells died out). Where it lives, letter
density sets how often genome length changes: at 400 letters of each kind a tenth of capped births are longer than the
five-unit genome, against one in a hundred at 200. Crowded templates make more copies that bridge two templates (the
duplications and insertions of section 28). No `CDC` gene arose in 400,000 steps. What it suggests: gene origin should be
tried in dense worlds, where the raw material (longer genomes) is ten times as common. One seed.

**A gene from nothing, in a dense world (lead, one seed)** (`TF_dense_1`: the `TD_lig` world with 400 letters of each kind,
radiation only, fivefold mutation, ligation 0.05, seed `PABAQ` only, 1,000,000 steps). Capped births by 50,000-step window:

| window | births | capped | mean capped length | carrying both `ABA` and `CDC` |
|---|---:|---:|---:|---:|
| 500k–550k | 1,771 | 469 | 5.2 | 0 |
| 600k–650k | 1,958 | 453 | 5.4 | 1 |
| 650k–700k | 1,474 | 299 | 7.4 | 43 |
| 700k–750k | 844 | 126 | 12.1 | 44 |
| 800k–850k | 849 | 127 | 11.2 | 46 |
| 850k–900k | 983 | 149 | 11.6 | 56 |
| 950k–1000k | 758 | 110 | 10.8 | 26 |

How it happened: by step 630,000 genomes had grown by duplicating the energy gene with insertions (`PABACAABAQ`,
`PABAACABAACABABAQ`); at step 645,743 a copy carried `CDC` (`PABACDCAABAAQ`), and within 20,000 steps its descendants
diversified into many two-gene genomes (`PADBDACDCABAQ`, `PBCDCDABAQ`, `PABACDCCDBCAQ`, up to 28 units with two `CDC`).
Then genomes expanded: mean capped length went from 5 to 11 or 12 (the longest 43), free monomers fell from about 1,000 to
about 150 (letters locked in long genomes) and births fell with them. Over the last 400,000 steps half of all capped births
carry `CDC` and 35% carry both genes. The reading: duplications in a dense world supplied the raw material (a genome with
room: `ABA` plus spare letters), point mutation made `CDC` in it, and once a genome was shielded radiation stopped
punishing length, so genomes grew. This is the first gene in the project to arise by mutation and spread.

**Confirmed, three seeds and two controls.** Seed 2 (`TF_dense_2`): the first capped birth with both genes at step 437,447,
then `CDC` in 38 to 61% of capped births per 100,000-step window and genomes of 11 to 12.6 units. Seed 3 (`TF_dense_3`): first
at step 173,324 (`PABADCDCQ`), then `CDC` in 35 to 55% and genomes of 10 to 13 units. Control without the shield rule
(`TF_noshield_1`, seed 1): no gene, capped genomes 5.1 to 5.3 units for the whole million steps, free monomers stay at about
1,100. What drives the expansion (`TG_l200_1`, `TG_l400_1`: the two-gene genome `PABACDCQ` seeded, 300,000 steps, one seed
each): at 200 letters of each kind genomes stay at 7.5 to 7.8 units; at 400 they grow to 9.3 → 10.7. So the gene arises
where density supplies duplications (3 of 3 dense seeds against 0 of 7 runs at ordinary density), and genomes expand where
both the shield (radiation no longer punishes length) and density (insertions are common) are present. Commands:
`telo4.sh` (`TF_*` lines); the `TG` runs are that world with `--seedSeq PABACDCQ --shield 1 --steps 300000` and 200 or 400
letters of each kind. What it does not show: whether a third gene can arise in the expanded genomes (no third pressure
was offered), and why births fall once genomes expand (letters locked in long genomes is the likely reason, not measured).

## 35. Letters with trade-offs (`tradeoff.sh`, `letters.js`), the user's idea, first screens

Letters that differ physically, none simply better, so a genome's make-up is a phenotype. First pair tried: `C` and `D`
tough (radiation resistance 0.8) but slow (`mobC`, `mobD` 0.5), `A` and `B` fragile and fast. Capped nine-unit genomes with the
energy gene (bare caps, `endLoss`, feed relay; the shield rule off), four free positions starting mixed; share of each letter
in those positions, 150,000 steps, two seeds.

Speed check first (homopolymer copies in 15,000 steps, two seeds): slow `C` 4 to 16 against `A` 37 to 38; large `C` (1.2)
31 to 35; soft `C` (stiffness 0.3) 34 to 36; wedge `C` (15°) none at all. Slowness is a real copying cost, wedges forbid
copying outright, size and softness cost little.

| run | environment | C + D in the free positions, by 50,000-step window |
|---|---|---|
| TO2_ctlnone_1, _2 | no trade-off, no radiation | 59 → 58 → 65%; 55 → 60 → 69% |
| TO_none_1, _2 | trade-off, no radiation | 52 → 61 → 60%; 43 → 60 → 69% |
| TO2_rad1_1, _2 | trade-off, radiation 1e-5 | 36 → 42 → 45%; 49 → 52 → 63% |
| TO2_rad2_1, _2 | trade-off, radiation 2e-5 | 38 → 36 → 27%; 42 → 50%, then extinct |
| TO2_ctlrad2_1, _2 | no trade-off, radiation 2e-5 | extinct in both |
| TO_rad, TO_ctlrad | radiation 5e-5 | extinct in all four |

What it says: nothing clean. `C` and `D` drift upward even with no trade-off and no radiation (a founder or mutation bias),
and under radiation the tough letters are not favoured (in three of four runs the fast letters did as well or better):
toughness does not pay for slowness at these doses. Radiation 2e-5 killed the worlds without the trade-off and one of two
with it, so toughness helps survival a little. Populations are small (50 to 90 capped births per 50,000 steps) and drift
dominates. Composition as a phenotype is weak here; it would need larger worlds, or a trade-off whose two sides are closer
in size. Not pursued further for now.

**Does a product's shape matter?** (`prodshape.sh`: the catalysis world with product kind `1` folding by 0, 30, 45 or 60°,
genome `ABBABA`, 80,000 steps, two seeds.) Births: 213 and 229 (0°), 215 and 188 (30°), 245 and 191 (45°), 244 and 197
(60°); products 109 to 139 in every run. No effect: a folding product straightens as its face binds (the fold rule), so its
free shape never meets the genome. For shape to matter the product would have to keep it while bound (a permanent wedge,
`bend1`), and wedges were seen to forbid docking outright (a wedge `C` homopolymer is never copied, section 35), so that
would be a switch, not a gradient.

## 36. A shared catalyst and its parasites (`parasite.sh`), the machine as an ecology

The literature's reading (`LITERATURE.md`): where complexity grew in replicator systems it came, among other things, from
ecology, parasites and cooperators (Könnyű, Hogeweg, Mizuuchi). The catalysis machine of section 34 is private by
construction (a product binds only strands it matches). `bindAny` makes it a shared good: a finished product binds the back
of any armed letter. With the code `A`→`1`, `B`→`2` only, strands of `C` and `D` make no product and are copied with other
strands' products: parasites that arise from nothing more than a letter without a product in the code. Seeds `ABBABA` and
`CDDCDC`, three each, `pLinkBare` 0.01, mutation 0.002, 100,000 steps, two seeds. Pure parasites (strands with no `A` or `B`)
among births, and the share of `C` + `D` among newborn letters, by 25,000-step window:

| run | pure parasites among births | C + D share |
|---|---|---|
| PA_kin_1, _2 (products bind only what they match) | 1, 2, 3, 1 of 52–88; 1, 0, 0, 0 of 36–57 | 4 → 10%; 5 → 10% |
| PA_mix_1, _2 (shared catalyst) | 1, 4, 58, 60 of 56–165; 2, 7, 21, 49 of 30–110 | 6 → 49%; 11 → 45% |
| PA_slow_1, _2 (shared, slow polymers `mobS` 0.3) | 6, 27, 43, 60 of 42–131; 5, 11, 22, 44 of 21–99 | 14 → 49%; 31 → 48% |

What it says: with a private catalyst parasites cannot live (they are seeded and vanish); with a shared one they rise to
about half of all births within 100,000 steps, and slow polymers do not hold them back at this size. Births still rise in
every shared run, so the cooperators are not yet losing. Whether this ends in coexistence, cycles or collapse is the
question for the long runs (`PL_*`, 400,000 steps, same world: `STEPS=400000` with `--bindAny 1`).

Long runs (`PL_mix_1`, `PL_mix_2`, `PL_slow_1`, 400,000 steps): steady coexistence in all three, about half of births pure
parasites and half the letters `C`/`D` in every 50,000-step window from 50,000 on, births steady (250 to 360 per window).
But the parasite share follows the supply of its letters (`PX_*`, 100,000 steps): with 300 `C` and 300 `D` against 150 `A`
and 150 `B` parasites made 151 of 227 births in the last window (73% `C`/`D` letters), with 75 of each 4 of 45 (12%). So the
coexistence is mostly the two kinds living on separate letters, not host–parasite dynamics. A fair test needs parasites
and cooperators drawing on the same letters: code `A`→`1` only, cooperators `ABABBA`, parasites `BCDDCB` (`PY_*`).

**Parasites on the same letters** (`PY_*`: code `A`→`1` only, so a product is made only along runs of `A`; cooperators `BAAAAB`
(product `1111`), parasites `BCDDCB`; 150 of each letter; 150,000 steps). A first version seeded `ABABBA`, which has no two
`A` side by side, made no product and died out in every run. Births (of which strands with no `AA`, which make no product),
and the share of `A` among newborn letters, first and last 25,000-step windows:

| run | births (no `AA`), first → last window | `A` share |
|---|---|---|
| PY_kin_1 (products bind what they match) | 24 (0) → 37 (5) | 61 → 64% |
| PY_mix_1 (shared) | 22 (0) → 106 (62) | 65 → 30% |
| PY_mix_2 (shared) | 40 (5) → 127 (89) | 61 → 26% |
| PY_slow_1 (shared, slow polymers) | 32 (3) → 103 (69) | 64 → 30% |

With letters shared, strands that make no product take 60 to 70% of births within 75,000 steps of a shared catalyst and
then level off, while births keep rising: the cooperators are kept at a minority but not lost, since the parasites cannot
live without their products. A private catalyst keeps parasites at a few percent. Slow polymers only delay the takeover.
This is the classic replicase–parasite system, here made of physical parts. What it does not have yet is anything the
cooperators could evolve against the parasites: `bindAny` is all or nothing for the whole world. Graded specificity (a
product binds any back but lets go faster where it does not match) would let discrimination and mimicry evolve.

**Graded specificity** (`parasite2.sh`, `PG_*`: the shared-letter world with `bindAny` and `pMisMelt`: a bound product unit on
a letter it does not match lets go at 0.05 or 0.2 per step, matched units hold as a run; 200,000 steps, two seeds). Births
(no `AA`), `A` share, by 40,000-step window, and the commonest births of the last window:

| run | births (no `AA`) | `A` share | commonest last |
|---|---|---|---|
| PG_mis05_1 | 59 (6), 75 (14), 67 (10), 68 (5), 60 (5) | 56 to 59% | `BAAC`, `AAAAB`, `BAAAA`, `CAAB` |
| PG_mis05_2 | 48 (3), 61 (3), 77 (12), 83 (16), 80 (3) | 55 to 64% | `AAD`, `DAA`, `AAAB`, `AA` |
| PG_mis2_1 | 55 (4), 65 (4), 59 (4), 68 (5), 74 (6) | 65 to 67% | `BAAAC`, `BAAAA`, `AAAAB`, `BAAB` |
| PG_mis2_2 | 53 (3), 80 (4), 77 (8), 88 (5), 83 (7) | 58 to 71% | `BAAC`, `CAAB`, `BAAA`, `AAAB` |

With graded specificity parasites stay at 5 to 20% of births (against 60 to 70% with the all-or-nothing shared catalyst):
a product helps its maker's kind most, so a strand that makes none gets little. What wins is the smallest cooperator,
one `AA` run and a letter or two (`BAAC`, `AAD`), making the smallest product (`11`). Strands that would be parasites
survive by carrying `AA`, which makes them cooperators; but the population shrinks toward the minimal cooperator, the old
"shortest wins" in a new form. Births are lower than with the shared catalyst (60 to 88 per 40,000 steps). One screen,
two seeds.

## 37. A faster engine (2026-09-25; `bench_final.js`-style probes in the session scratchpad, numbers below)

The user: the physics so far was one instance's guess, results need not stay the same, speed pays for years; shapes stay
(no grid). Every change was measured in CPU time per step (the machine is shared, so wall time misleads) and checked with
mutation off, where every copy must be exact (capped worlds: copies of capped parents).

**What was changed** (in order): exact skips (the torus wrap only near half the world; pairs of free blocks skipped in bond
formation when `pSpont` is 0); no trigonometry in the solver (shape matching from the fit's cosine and sine, small turns by
series, polar-method normals); a cell-list neighbour scan over half the neighbour cells; free monomers skip derivation,
transitions and open-side work; allocations trimmed; and the big one, `bodyJostle` with `iters` 4: a set of bonded blocks is
kicked as the rigid body it forms (a move and a turn of the size its blocks' own kicks would give it), so bonds are no longer
pulled apart every step and a few passes suffice.

| world (2 seeds × 20,000 steps, mutation off) | setting | CPU steps/s | births | wrong copies |
|---|---|---:|---:|---:|
| copying (40×40, 256 A + 256 B, `ABBABA` ×3) | old default: per-block jostle, 16 passes | 501–573 | 126–131 | 0 |
| | bodies jostled whole, 4 passes | 1,066 | 137 | 0 |
| | bodies, 3 passes | 1,157 | 137 | 0 |
| | bodies, 2 passes | 1,279 | 138 | 1 |
| capped (40×40, 200 each, 120 caps, feed/shield/relay, end loss, bare caps) | old default | 218–227 | 252–255 | 6 |
| | bodies, 4 passes | 499–558 | 280 | 9 |
| dense, jammed (40×40, 400 each: blocks cover more than the world) | old engine (16 passes) | 69 (heavier load) | 195 capped | 93% exact, 2% shorter |
| | bodies, 4 passes | 289 | 202 capped | 59% exact, **39% shorter** |
| | bodies, 8 passes | 198 | 198 capped | 86% exact, 10% shorter |
| | bodies, 4 passes, 48×48 (80% covered) | 336 | 178 capped | 97% exact, 3% shorter |

(In capped worlds a few "wrong" copies are expected with mutation off: a template changes while being copied.) After the
later micro-optimizations the capped world ran at 775 CPU steps/s against 657 before them (same births, same trajectory).
Tried and removed: stopping the passes on a tolerance (they never converge while loose monomers jostle), resolving loose
pairs in the first pass only (no gain once bodies move whole), a larger Brownian step (copying is not diffusion-limited
here: births per step unchanged, each step dearer).

What it says: at ordinary densities the engine is about 2 to 2.5 times faster and copies as exactly as before. **A jammed
world is different**: with 4 passes a third of copies lose a letter (mutation off, not ligation: 23 of 62 shorter copies with
`pLigate` 0 as with 0.05, none assembled on two templates; blocks squeezed past the linking tolerance). The dense worlds of
section 33 were jammed. On this engine use 48×48 for "dense" (area covered about 80%), or 8 to 16 passes. Two slips found on
the way and fixed: a body's turn first counted every block's own spin as the whole body's (a slow strand, `mobS` 0.1, moved
more than it should); and a birth's parent was read as the longest chain of the template's component, which could be another
strand bound or bridged to it (now `strandOf`, the template unit's own strand). What it does not say: the old results
(sections 1 to 36) were measured on the old engine and are not re-measured here; a known limitation remains that loose
monomers jostling a slow strand push it further than its mass should allow (4 times less motion than a free strand, not 10).

## 38. Proofreading: a third gene whose pressure is copying itself (`proof`, 2026-09-25)

The shield and the energy gene each remove a cost that grows with genome length (bonds that radiation breaks; units that need
energy). Copy errors are a third such cost, intrinsic, not an environment: every functional letter can be miscopied, so the
load grows with the number of letters that matter (Eigen's error threshold). `proof`: a D between two Bs (`proofMotif` `BDB`)
flags its template face and, with the relay, its whole strand's faces; a monomer of the wrong kind docked on a flagged face,
not yet linked to a neighbour, lets go at `pProof` per step (it reads its partner's kind, as docking does). Kinetic
proofreading, local, one block and its partner.

**Does it work** (capped world, 40×40, `pSoft` 0.01, seeds `PABACDCBDBQ` and `PABACDCBCBQ`, 30,000 steps, 2 seeds): share of
capped copies with a substitution, by parent. Without the rule 50% (parents with `BDB`) and 75%; with the rule at `pProof` 0.5,
17.5% against 49%; at 0.9, 9.5% against 57%. Proofreading cuts substitutions three- to sixfold for the strand that carries it.
(At `pSoft` 0.01 half or more of 11-unit copies carry a substitution: this is a heavy mutation regime.)

**Is it selected** (`PC_*`: same world with radiation 3e-5, three seeds of each genome, which differ in one letter,
`pProof` 0.9, 150,000 steps, 2 seeds; `experiments/capped.js`):

| run | `BDB` among capped births, by 50,000-step window | `BCB` | `CDC` |
|---|---|---|---|
| PC_on_1 | 55%, 58%, 76% | 20%, 11%, 7% | 95%, 91%, 93% |
| PC_on_2 | 54%, 69%, 78% | 10%, 0%, 0% | 87%, 96%, 100% |
| PC_off_1 (rule off) | 20%, 13%, 10% | 35%, 23%, 12% | 73%, 80%, 82% |
| PC_off_2 (rule off) | 29%, 9%, 17% | 35%, 23%, 23% | 78%, 81%, 64% |

With the rule on, the proofreading genome takes over from its one-letter competitor in both seeds, and the other genes are
kept better (fewer mutants); lineages are less diverse (10 to 18 distinct capped sequences per window against 20 to 32).
With the rule off, both letters drift down alike. A lead (2 seeds, small populations: 45 to 78 capped births per window).
An earlier attempt in the jammed dense world (`PR_*`, old engine, 5x mutation, pProof 0.5) showed no rescue: both arms melted
down (births 128 → 23 per 20,000 steps); there about half the copy errors were length changes (baseline `BASE_m5`: 51% of
capped copies exact, 27% with a substitution, 22% longer or shorter), a load proofreading of substitutions cannot lift. What it does not show yet: whether the gene arises from spare letters by point
mutation (next).

**A gene from a spare letter** (`PN1_*`: the same world, seeded only with `PABACDCBCBQ` ×6, whose spare `BCB` is one point
mutation from the proofreading motif; 300,000 steps, 2 seeds):

| run | `BDB` among capped births, by 50,000-step window | `CDC` at the end | births per window |
|---|---|---:|---|
| PN1_on_1 | 8%, 29%, 54%, 73%, 79%, 89% | 98% | 492 → 302 |
| PN1_on_2 | 2%, 22%, 41%, 62%, 71%, 73% | 99% | 514 → 311 |
| PN1_off_1 (rule off) | 9%, 17%, 16%, 8%, 3%, 7% | 76% | 502 → 548 |
| PN1_off_2 (rule off) | 5%, 7%, 17%, 3%, 9%, 9% | 68% | 513 → 527 |

The motif arises by a point mutation and sweeps where it proofreads; where it does nothing it drifts at a few percent. The
other genes are kept better under proofreading (energy gene 87 to 91% against 67 to 72%, shield 98 to 99% against 68 to 76%).
And a trade-off that no rule states: with proofreading total births fall by about a third (a wrong monomer that lets go
leaves its site empty for a while), while more of the births are sound, the speed-accuracy trade-off of real polymerases.
This is the second gene in the project to arise by mutation and spread, the first at ordinary density and the first whose
pressure is copying itself rather than an imposed environment. What it does not show: a gene from nothing (the spare letters
were placed one mutation away); from three mutations away (`PN3_*`, spare `AAA`) nothing arose in 110,000 steps (stopped),
since at ordinary density genome length rarely changes (regularity 5) and three silent substitutions in a row are rare.

## 39. Shape as function: pockets that fit fuel (`grip`, `pocket`, fuel `U`/`V`, 2026-09-25), first probes

The user: shapes are a very promising direction; the decision log: fit worth exploring is at the level of assemblies (emergent
fit, a mechanical AND, graded fit). Option B of DESIGN 15, built first with the genome as its own enzyme. One generic rule:
a back grips a fuel particle (per step of contact), a particle held by one grip lets go fast, and a charged particle held by two
or more backs at once (a pocket: a mechanical AND read by the particle from its own bonds) arms one letter that wants energy
and is spent. Nothing mentions shape or size; which strands hold which particles is geometry (wedge letters, `fold`, curl a
free strand with its backs inside).

**Which folds hold which particles** (`grip` on seeded product chains `111111`, 15 chains, 60 particles, share of particles held
by two or more grips, steps 2,000 to 10,000, 2 seeds; the one-grip share in brackets, all 0 to 2%):

| fold of product \ particle size | 0.4 | 0.5 | 0.7 | 0.85 | 1.0 | 1.2 |
|---|---:|---:|---:|---:|---:|---:|
| 0° (straight) | 0.6% | 1.4% | 10.2% | 7.7% | 9.9% | 3.8% |
| 20° | 0.9% | 0.8% | 0.2% | 0.9% | 1.6% | 1.1% |
| 30° | 0.2% | 0.1% | 0.8% | 7.3% | 10.8% | 17.3% |
| 45° | 24.9% | 24.3% | 23.0% | 18.6% | 9.5% | 5.5% |
| 60° | 24.7% | 24.8% | 20.9% | 13.9% | 6.1% | 0.0% |
| 90° | 24.7% | 24.8% | 20.9% | 13.9% | 6.1% | 0.0% |

(60° and 90° agree to the digit: a folded block cannot lean past about 50°, so both are the same shape.) Straight chains hold
mid-sized and large particles between two chains lying back to back; 20° holds almost nothing (no pocket, no pairing); 30°
holds the largest; 45° and more hold small ones in the corners of the curl. Different folds, different niches.

**The genome as its own enzyme** (`pocket`, fuel the only energy, seeds `AAAAAA` ×3, 30×30, 20,000 steps): armed templates and
copies still waiting for energy. Fold 45° with fuel 0.5 (fits): 87 armed, 16 waiting; fold 0° with fuel 0.5: 34, 117; fold 45°
with fuel 1.2: 49, 68; fold 30° with fuel 1.2 (fits): 78, 36. A genome whose shape fits the fuel arms its copies two to three
times as fast. Folding costs copying little: births of `AAAAAA` in 2 × 15,000 steps at fold 0/20/30/45/60°: 75, 70, 68, 52, 56
with `pUndock` 0.1, 69 to 75 at every angle with 0.02.

**Genotype to phenotype** (`harvest.js`: fuel used per 10,000 steps by a seeded genome, 3 seeds of it, `foldA` 45, `foldB` 30,
fuel the only energy, 15,000 steps, 2 seeds; mutation off):

| sequence | fuel 0.5 | fuel 0.85 | fuel 1.2 |
|---|---:|---:|---:|
| `AAAAAAAA` | 14 | 14 | 3 |
| `BBBBBBBB` | 21 | 21 | 12 |
| `AAAABBBB` | 14 | **23** | 8 |
| `AABBAABB` | **36** | 20 | 17 |
| `ABABABAB` | 29 | 15 | **24** |

Each fuel size has a different best sequence, and the three mixed ones have the same letters in different orders: the order of
letters, through the shape it folds into, decides which fuel a genome can use. No rule lists sequences or sizes. This is a
many-to-many genotype-to-phenotype map made of geometry, the kind that motif rules (one hand-written function each) cannot
give. What it does not show yet: selection (the first screens, `FS_*`/`FT_*`, ran in a world too poor in fuel to hold a
population: 9 to 47 births per 30,000 steps); harvest here mixes shape with copying speed; two seeds.

**Selection, first attempts (what failed and why).** Fuel as the only energy makes fragile worlds. Uncapped (`FS_*`, `PK_*`,
`PR05..12`, `PW_*`: 30×30 to 60×60): copies waiting for fuel fray from their open ends before they are armed, and births stay
at a few per 25,000 steps per lineage. Capped (`PC*_fold_*`: 40×40, the three 8-mers between caps, 200,000 steps, mutation off),
births of each lineage per 50,000 steps:

| run | `PAABBAABBQ` | `PABABABABQ` | `PAAAABBBBQ` | prediction from the harvest spectrum |
|---|---|---|---|---|
| fuel 0.5, seed 1 | 16, 20, 8, 5 | 13, 1, 0, 0 | 12, 0, 0, 0 | `AABBAABB` (right) |
| fuel 0.5, seed 2 | 7, 14, 7, 2 | 20, 1, 0, 0 | 19, 1, 0, 0 | `AABBAABB` (right) |
| fuel 0.85, seed 1 | 13, 2, 0, 1 | 7, 11, 0, 0 | 7, 1, 0, 0 | `AAAABBBB` (wrong: `ABAB` led, then all died) |
| fuel 1.2, seed 1 | 6, 6, 4, 17 | 13, 2, 0, 0 | 11, 0, 0, 0 | `ABABABAB` (wrong: `AABB` won) |
| fuel 0.5, letters that do not fold | 7, then extinct | 13, then extinct | 14, then extinct | nothing lives on small fuel without folds |

`AABBAABB` won three of four capped races, including one the uncapped spectrum gave to another sequence; without folding
letters nothing lived on small fuel. But every capped fuel world declined (capped births 12 → 1 per 10,000 steps): a copy
needs ten captures, two contacts each, and a capped genome lives about 16,000 steps (caps fray); making caps last ten times
longer only locks the letters up (templates pile up, births stop). So these races are small and dying: a lead that fold and
fuel size select sequences, not a result. Next: fuel as a supplement to scarce ordinary energy (`PS_*`), so every genome lives
and shape gives a graded advantage.

**Fuel as a supplement** (`PS*`: the capped race world with scarce ordinary energy underneath, 16 particles at reload 0.0004,
plus 120 fuel particles; `foldA` 45, `foldB` 30; 200,000 steps, 2 seeds). Births of each lineage in the last 50,000 steps
(`PAABBAABBQ` / `PABABABABQ` / `PAAAABBBBQ`):

| world | seed 1 | seed 2 |
|---|---|---|
| no fuel | 11 / 27 / 0 | 5 / 23 / 7 |
| fuel 0.5 | 1 / 7 / 8 | 19 / 5 / 1 |
| fuel 0.85 | 2 / 5 / 3 | 2 / 5 / 7 |
| fuel 1.2 | 0 / 6 / 17 | 5 / 12 / 2 |

Every world lives now. Without fuel `ABABABAB` wins in both seeds (the folded runs of `AAAABBBB` copy worst); with fuel the
outcome changes, but not the same way in the two seeds. Inconclusive: 5 to 30 births per lineage per window is drift's
territory (regularity 10). What would decide it: fitness measured apart from drift, each genome alone (a monoculture) in each
environment, births per step at steady state; then competitions in worlds large enough for hundreds of births per lineage.

**Why the supplement races could not decide: fuel saturated energy** (`MO_*`, `experiments/monoculture.js`: each genome alone,
nine seeds of it, same world as `PS*`, 100,000 steps, 2 seeds). Births of the lineage per 10,000 steps from step 50,000:

| genome | fuel 0.5 | fuel 0.85 | fuel 1.2 | no fuel |
|---|---|---|---|---|
| `AAAABBBB` | 4.7, 4.6 | 6.2, 4.0 | 6.3, 3.1 | 9.8, 5.6 |
| `AABBAABB` | 5.4, 5.6 | 5.1, 5.7 | 5.9, 3.8 | 5.6, 8.6 |
| `ABABABAB` | 5.3, 5.5 | 7.7, 6.4 | 3.0, 1.8 | 5.8, 7.2 |

With 120 fuel particles recharging at 0.01, energy stops limiting every genome: copies waiting for energy fall from about 150
units to about 40, armed template units rise from about 220 to about 360, and free letters fall from about 150 to about 85, so
births are limited by letters (and fall a little). With energy saturated, shape cannot be selected through it, and drift
decides the races. The regime needed: fuel limiting (waiting copies high) while scarce ordinary energy keeps the world alive
(`ML_*`: 40 fuel particles at 0.002, running at the end of the session).

**Fuel limited** (`ML_*`: 40 fuel particles at 0.002 over the same scarce energy, one seed, 100,000 steps). Births of the
lineage per 10,000 steps from 50,000, and at the end armed template units / units waiting for energy:

| genome | fuel 0.5 | fuel 0.85 | fuel 1.2 |
|---|---|---|---|
| `AAAABBBB` | 6.7 (316 / 69) | 5.6 (318 / 61) | 6.4 (220 / 104) |
| `AABBAABB` | 7.0 (305 / 89) | 7.2 (322 / 82) | 5.8 (230 / 120) |
| `ABABABAB` | 6.9 (301 / 84) | 6.3 (299 / 87) | 5.6 (322 / 67) |

At a tenth of the supply fuel still covers most of the need (60 to 120 units waiting, against about 150 with no fuel). The
armed state follows the harvest spectrum where it differs most: with large fuel `ABABABAB` keeps 322 armed and 67 waiting,
`AABBAABB` 230 and 120, `AAAABBBB` 220 and 104 (the spectrum's order at 1.2: 24, 17, 8). But births hardly differ (5.6 to 7.2):
a genome alone is limited by free letters, not by energy. What this says: shape decides how well a genome keeps itself armed;
whether that decides who wins needs a competition where lineages take letters from each other, in a world large enough for
hundreds of births per lineage (the next step in the handoff). One seed.

## 40. Stacks: a second way to copy (`backCopy`, `stack`, `experiments/stacks.sh`, 2026-09-25)

The user (2026-09-25): perhaps it is enough to get several different kinds of replication going, with mutation and a reason for
selection, and mechanical designs should be enough. Every copy in this world so far is made on a face and released. This adds
the growth-and-scission mode of crystals (Cairns-Smith's layered clays, Schulman–Yurke–Winfree's ribbons) with the same letters.
**Two-faced letters** (`backCopy`): an armed letter's back templates too (it shows `KT_*`, as a face shows `TPL_*`); a free
monomer of its kind docks there, and the copy lies parallel to its template (same sequence, same direction; a face copy lies
reversed). **Stacks** (`stack`): a finished back copy is not released. It holds the back it was made on (`HOLD`), waits for
energy like a released copy (every row costs as much as a copy), and once armed its own back templates the next row, so copies
pile into a stack, a crystal of one sequence that grows row by row. A stacked bond melts at `pSMelt` / `pSMeltEnd` / `pSMeltRun`
(no, one, two stacked lateral neighbours), so a row comes off by unzipping from its ends; `pSBind` zips a face back beside a
stacked neighbour, `pSNuc` starts a new junction (a nucleation barrier when low). Stacked units do not fray (their face is held);
with `stackHold` a unit holding a stacked row on its back does not fray either, and without it a stack's exposed bottom row frays
like any strand (with processive fraying it goes whole), so the stack treadmills: it grows at the top and dies at the bottom. A
stacked unit's broken lateral bond re-links where the row below continues, as a docked copy's does. Every rule is one block and
its bonded partner.

**It works.** Rows are exact copies of the row below (20 of 20 in a probe; `test.js`), stacks reach 3 to 26 rows, melt apart
and regrow (a stack of `ABBABAAB` rows is a crystal striped by letter, one column per position). With re-zipping and no
nucleation barrier, strands of different sequences that share a run of three letters in register bind face to back and hold,
so two-letter stacks become mixed aggregates (the tallest stack of a probe had its commonest row in 3 of 13 rows); with four
letters such matches are rarer.

**Does stacking make length pay?** (Open two-letter world, 40×40, 256 of each letter, seeded `ABBABAAB` ×3, `pUndock` 0.05,
processive fraying 0.0003, `pSoft` and `pCapture` 0.002; 60,000 steps unless noted; seeds 1, 2. Newborn length and births in the
first and the last 15,000 steps, free letters at the end, tallest stack.)

| arm | births first → last (15k) | newborn length first → last | free letters at end | tallest stack |
|---|---|---|---:|---:|
| plain (100k) | 65 → 527, 211 → 455 | 3.80 → 2.02, 3.17 → 2.09 | 384, 373 | – |
| back copies released | 333 → 788, 401 → 664 | 3.14 → 2.20, 3.03 → 2.42 | 261, 292 | – |
| stacks held, no zipping (100k) | 440 → 804, 396 → 866 | 2.44 → 2.06, 3.10 → 2.04 | 274, 275 | 4 |
| held, zip 0.002, barrier | 440 → 762, 384 → 753 | 2.58 → 2.19, 3.03 → 2.17 | 264, 238 | 5 |
| held, zip 0.005, barrier | 304 → 651, 462 → 821 | 3.25 → 2.51, 2.68 → 2.05 | 262, 278 | 4 |
| held, zip 0.02, barrier | 160 → 390, 380 → 286 | 3.89 → 3.14, 2.75 → 3.49 | 166, 191 | 8 |
| held, zip 0.03, barrier | 207 → 65, 157 → 54 | 3.34 → 4.52, 3.99 → 4.76 | 84, 69 | 11 |
| held, zip 0.05, barrier | 127 → 32, 303 → 118 | 4.81 → 4.78, 2.88 → 3.54 | 66, 113 | 13 |
| treadmill, no zipping | 253 → 783, 252 → 659 | 3.64 → 2.13, 4.03 → 2.41 | 281, 282 | 4 |
| treadmill, zip 0.02, barrier | 310 → 715, 272 → 676 | 3.24 → 2.25, 3.49 → 2.44 | 286, 254 | 4 |
| treadmill, zip 0.1, barrier | 302 → 693, 267 → 469 | 2.89 → 2.27, 3.48 → 2.67 | 259, 215 | 9 |
| treadmill, zip 0.5, barrier | 279 → 333, 342 → 440 | 3.12 → 2.78, 2.84 → 2.76 | 197, 194 | 11 |
| treadmill, zip 0.5, no barrier (aggregates) | 126 → 84, 134 → 64 | 4.13 → 4.37, 4.43 → 4.84 | 130, 131 | 26 |

(Two runs held with zip 0.1 and 0.5 and no barrier locked up entirely: 16 to 22 free letters and 90 to 155 births by 50,000
steps; stopped.) One regularity covers every row: **newborn length stays above about 3.5 only where stacks have locked up the
letters** (free letters below about 190 of 512) **and births are falling** (to a third or a tenth of the start). Where stacks turn
over, length falls to 2.0 to 2.8 as without them. Stacks hold length by hoarding, not by selection: a long row zipped into a
stack is all but immortal (a row's stability grows steeply with its length), so the letters end up in stacks of long rows and
the world slows toward a standstill. A knife edge lies between (zip 0.02 held: alive, length 3.1 to 3.5). Treadmilling stacks
(the bottom row frays) never lock up at any zip rate tried, and do not hold length either: melting is not death (a row that
comes off is a free strand, which copies on both sides at once), so short rows lose nothing by their stacks falling apart, and
they copy faster.

**Is a two-gene genome kept?** (The keep world of section 22: four letters, `ABACDC` ×3, feed, shield, relay; mild pressure
(16 energy particles at 0.0004, radiation 3e-5) and none; 200,000 steps; stacks held, zip 0.02, barrier. Births of length 5 or
more carrying both genes, first and last 50,000 steps; last birth of `ABACDC`.)

| run | plain: both genes, first → last | plain: last `ABACDC` | stacks: both genes | stacks: last `ABACDC` |
|---|---|---:|---|---:|
| mild, seed 1 | 76% → 50% | 194,071 | 77% → 55% | 198,786 |
| mild, seed 2 | 40% → none long | 76,072 | 67% → 26% | 164,573 |
| none, seed 1 | 46% → 21% | 196,881 | 49% → 4% | 162,745 |
| none, seed 2 | 27% → 0% | 78,279 | 83% → 18% | 191,999 |

Stacks kept the two-gene genome much longer in seed 2 of both environments and made no difference (or a small loss) in seed 1.
Inconclusive. Also new: on the current engine the plain world keeps `ABACDC` far longer than section 22 found (last births at
76,000 to 197,000 steps, and half of the long births still carry both genes after 200,000 steps in one mild run), so section 22's
"lost in 6 of 6" does not carry over to this engine and these rates (22 ran 1,000,000 steps on the old engine).

**Under radiation** (`ST_rad*`: the open world above with `pBreak` 3e-5, 1e-4, 3e-4; plain against treadmilling stacks, zip 0.1
and 0.5, barrier; 60,000 steps, seeds 1, 2; births in the last 15,000 steps, newborn length):

| radiation | plain | back copies released, no stacks | stacks, zip 0.1 | stacks, zip 0.5 |
|---|---|---|---|---|
| 3e-5 | 513, 507 births; length 2.10, 2.08 | – | 602, 593; 2.32, 2.36 | 493, 452; 2.32, 2.57 |
| 1e-4 | 433, 365; 2.00, 2.14 | 834, 811; 2.04, 2.00 | 776, 794; 2.05, 2.03 | 662, 690; 2.11, 2.02 |
| 3e-4 | extinct, extinct | 684, 665; 2.00, 2.01 | 602, 619; 2.06, 2.01 | 618, 619; 2.00, 2.00 |

Stack worlds live where the plain world dies (2 of 2 seeds at 3e-4), but so do worlds where back copies are simply released
(`ST_radback_*`, run afterwards as the control): what rescues the population is two-faced templating, which gives every strand
two copy sites and doubles its birth rate, not the stack. Stacking adds nothing under radiation (slightly fewer births), and
length is 2.0 in every arm. (A first reading of these runs, before the control, called stacks a mechanical shield; it was wrong.)

**Can the mode evolve?** (`ST_slipA_*`: the stack world, zip 0.1, with `smeltA` 20, so rows rich in `A` fall off at once and rows
rich in `B` stay, against `ST_slipctl_*` with both letters alike; radiation 0, 1e-4, 3e-4; 100,000 steps; 2 seeds.) The share of
`B` among newborn letters stays at 0.47 to 0.55 in every arm and window: no selection on the mode, as expected once stacking
itself turned out to give nothing here. The population is dimers throughout (length 2.0 to 2.2 under radiation).

**Shape-limited stacks** (probe: rows of `A` only, `bendA` 0 to 20°, strong zipping, 15,000 steps, 2 seeds): tallest stacks 8 to
10 rows at 0°, 6 to 7 at 5° and 10°; at 10° rows are made five times more slowly, and at 15° and 20° nothing is copied at all.
Geometry acts as a switch (regularity 7), not as a sequence-set height; the idea is not worth pursuing in this form.

What this says: a second mode of replication, crystal growth with scission, comes out of two local rules on the same letters,
copies exactly, and lives beside strand copying (stacks shed free strands from their bottom face; a free strand founds a stack on
its back). By itself it does not break regularity 1: a stack's rows are protected, but protection that makes long rows immortal
locks up the world, and protection that lets stacks turn over leaves short rows free to win. What it does not say: whether
stacks pay where something else punishes free strands (radiation breaks free strands while stacked rows re-link; that is untested
here), whether kin aggregation (the no-barrier arm, with four letters) makes stacks into groups of genes that are selected
together, or whether shape-limited stacks (rows of wedge letters are squeezed more with every row on their concave side, so a
stack would snap at a height set by its sequence) give scission a sequence-set rate. Two seeds per arm.

## 41. Shape selection with many seeds (`races.js`, `pockets.js`, `order.js`; RC, RN, EL, DR, DS runs; 2026-09-25)

Section 39's pocket races were two seeds each and drowned in drift. Runs are cheap on the current engine (a capped 40×40 race of
150,000 steps takes about 2.5 minutes), so the same question is asked here with 8 to 12 seeds per cell and a control in which the
letters do not fold (so `A` and `B` are physically identical and any difference between the three genomes is drift).

**Races in the section 39 world** (`RC*`: capped 40×40, 200 of each letter, 120 caps of each kind, three genomes of the same
letters ×3 each, `foldA` 45, `foldB` 30, scarce energy (16 particles at 0.0004) plus 40 fuel particles at 0.002; mutation off;
150,000 steps; 8 seeds. `RN*`: the same without folds.) Mean share of each genome among lineage births from step 75,000, and
the number of seeds it won:

| fuel | `AABBAABB` | `ABABABAB` | `AAAABBBB` |
|---|---|---|---|
| none (folds) | 34% (3) | 38% (3) | 28% (2) |
| 0.5 (folds) | 47% (4) | 35% (3) | 17% (1) |
| 0.85 (folds) | 21% (1) | 38% (3) | 41% (4) |
| 1.2 (folds) | 35% (4) | 22% (1) | 43% (3) |
| 0.5, no folds | 33% (2) | 35% (3) | 32% (3) |
| 1.2, no folds | 28% (2) | 22% (1) | 50% (4) |

Per-seed shares run from 0 to over 70%, so a mean over 8 seeds has an error of about 8 points. With folds, small fuel favours
`AABBAABB` and the no-fold control is flat, as shape would predict; but at fuel 1.2 `AAAABBBB` leads just as much *without*
folds (50%), where it cannot have an advantage, so leads of this size are drift. Permutation tests on the per-seed shares: the
one nominal difference (`AAAABBBB` 17% at fuel 0.5 against 43% at 1.2, p = 0.05, one of many comparisons) is matched by the
no-fold control (50% at 1.2); fold against no fold at 0.5, `AABBAABB` 47% against 33%, p = 0.27.

**Why: this world is limited by letters, not energy.** Capped births per seed from step 75,000: no fuel 122, fuel 0.5 106, 0.85
129, 1.2 105, no folds 106 to 109. Fuel arms many more templates (363 armed units against 152 at the end of seed 1) but uses up
the free letters (79 against 224), so births stay where letter turnover sets them, and a better harvest cannot win much (as the
monocultures of section 39 said). **Who makes the pockets** (`pockets.js`: every fuel arming, the strands of the backs holding
the particle, 30,000 steps, 2 seeds): 86 to 92% of armings at fuel 0.5 and 81 to 83% at 1.2 are in a pocket of one strand folded
on itself; pockets between two genomes are 6 to 15%. Here `AAAABBBB` harvests most at 1.2 (13 armed letters against 10 and 5)
and `ABABABAB` at 0.5 (29, 22, 13), not in the order of the section 39 spectrum (which was measured uncapped with fuel the only
energy): a genome's harvest depends on the world it is in.

**An energy-limited world** (`EL*`: capped 48×48, 400 of each letter, 240 caps of each kind, one seed, 60,000 steps; capped births
from 30,000 to 60,000 steps): energy particles 8, 16, 32, 64 give 39, 68, 86, 127 births; over 16 particles, fuel (size 0.5) adds
births (20 at 0.001: 74; 10 at 0.001: 88; 40 at 0.002: 99; over 8 particles, 20 at 0.001: 67), with 260 to 370 letters waiting
for energy and 400 to 680 free letters. Here energy limits births, and harvest can decide who wins.

**Races in the energy-limited world** (`DR*`: the dense world above, 8 energy particles at 0.0004 plus 20 fuel particles at 0.001,
the three genomes ×3, folds as before; `DS*`: no folds; 120,000 steps; 12 seeds, 6 without fuel). Mean share of lineage births
from step 60,000 (seeds won):

| world | `AABBAABB` | `ABABABAB` | `AAAABBBB` |
|---|---|---|---|
| folds, no fuel (6 seeds) | 41% (2) | 49% (4) | 10% (0) |
| folds, fuel 0.5 | 45% (6) | 29% (4) | 27% (2) |
| folds, fuel 1.2 | 27% (3) | 50% (7) | 23% (2) |
| no folds, fuel 0.5 | 43% (6) | 25% (3) | 33% (3) |
| no folds, fuel 1.2 | 37% (6) | 24% (3) | 38% (3) |

The directions are those shape would give (with folds `ABABABAB` takes 50% at fuel 1.2 against 24% without; `AAAABBBB`, whose
long runs curl up hardest, does worst with folds), but part of it is folding itself (with folds and no fuel `ABABABAB` leads as
much, 49%), and nothing is significant: `ABABABAB` folds against no folds at 1.2, p = 0.09; at 1.2 against 0.5 with folds,
p = 0.15; `AABBAABB` at 0.5 against 1.2 with folds, p = 0.14 (permutation tests, 12 seeds). Lineages make 20 to 40 births each in
the second half, and per-seed shares run from 0 to 100%.

What this says: with the same letters in different orders, the fitness differences that pockets give are small, a few tens of
percent in share at most, against drift that swings shares from nothing to everything in populations of 20 to 30 genomes; neither
a letter-limited nor an energy-limited world at this size shows them. Section 39's harvest spectrum is real (a folded genome
arms faster from fuel that fits it), but it does not become a decisive fitness difference. What would: populations several times
larger (a 96×96 world, about 13 minutes per 120,000 steps, so 12 seeds of two arms take about 80 minutes on four cores), genomes
whose shapes differ more (compositions: `AAAAAAAA` against `ABABABAB` harvest 3 against 24 at fuel 1.2 in section 39), or a
pocket that pays more (fuel the only energy, which made worlds fragile in section 39). What it does not say: that shape cannot be
selected; the order effects may be real at a size these runs cannot resolve. The planned evolution runs (letter order adapting
under mutation) were not run: they would be drift-dominated for the same reason.

## 42. Ecology in space: a shared catalyst and its parasites in a large world (`hostparasite.sh`, `spatial.js`, `hostmap.js`)

Where complexity grew in replicator systems it came from ecology (Könnyű, Hogeweg, Mizuuchi; `LITERATURE.md`), and section 36's
shared catalyst gives the strongest ecological effect in this project: strands that make no product take 60 to 70% of births.
It ran in a 40×40 world, where slow polymers (`mobS` 0.3) only delayed the takeover. The theory (Boerlijst and Hogeweg; Colizzi
and Hogeweg 2016) says that a catalyst acting locally, in a world where offspring stay near their parents, lets cooperators and
parasites separate in space, which holds parasites down, sometimes as travelling waves. Here: section 36's `PY` world (code `A`→`1`,
`bindAny`, hosts `BAAAAB` and parasites `BCDDCB`, 12 of each) four times larger (80×80, 600 of each letter, 1,200 product blocks,
400 energy particles), with polymers that creep (`mobS` 0.1) against well mixed; 300,000 steps, 2 seeds. Births of strands with
an `AA` run (hosts: they make product) and without (parasites), and the segregation index of `spatial.js` (for each birth, the
share of births within 8 sides in the same 50,000-step window that are of its own kind, minus its kind's share; 0 is well mixed):

| run | parasites among births, windows 0 / 100k / 250k | host births per 50k (last) | segregation, 0 / 100k / 250k |
|---|---|---:|---|
| HP_mix_1 | 27% / 67% / 71% | 305 | 0.073 / 0.013 / 0.021 |
| HP_mix_2 | 19% / 66% / 72% | 317 | 0.036 / 0.002 / 0.018 |
| HP_slow_1 | 9% / 50% / 65% | 267 | 0.010 / 0.066 / 0.033 |
| HP_slow_2 | 8% / 42% / 50% | 313 | -0.001 / 0.070 / 0.036 |

With creeping polymers hosts and parasites sit apart (segregation 0.03 to 0.10 against 0.01 to 0.02 well mixed; a picture of the
saved world shows host patches with their products and parasite patches), and parasites rise more slowly and less far (50 to 65%
of births at the end against 71 to 72%). Host births are the same in both worlds (about 300 per 50,000 steps): space costs the
parasites, not the hosts, because the catalyst stays near its makers. The segregation falls in the second half as the parasites
catch up; no travelling front was found (the host births' centre is spread, concentration 0.07 to 0.12, and moves without a
steady direction). What it says: the classic result that spatial structure protects a shared good holds for this machine made of
physical parts, weakly, in two seeds. What it does not say: whether it lasts (the effect is shrinking at 300,000 steps), whether
it holds when parasites must arise by mutation, or that anything evolves in response; the hosts cannot yet do anything against
the parasites except be elsewhere.

**More mobilities, and parasites that arise** (`HP_mid_*`: polymers at `mobS` 0.3; `HM_*`: only hosts seeded, 24 of them, mutation
0.005, so strands that make no product have to arise; 300,000 steps, 2 seeds). Parasites among births in the last 50,000 steps:

| world | seed 1 | seed 2 |
|---|---:|---:|
| seeded parasites, creeping (`mobS` 0.1) | 65% | 50% |
| seeded parasites, `mobS` 0.3 | 60% | 63% |
| seeded parasites, well mixed | 71% | 72% |
| parasites from mutation, creeping | 62% | 58% |
| parasites from mutation, well mixed | 72% | 72% |

Every creeping or half-creeping run ends below every well-mixed one (8 against 4 runs; segregation 0.03 to 0.10 against 0.01 to
0.03). Parasites arise by themselves within 50,000 steps: short strands of the letters that make no product (`BDC`, `BCC`, `CD`,
`BD`; mean length 3.1), and the hosts shrink too (`AAB`, `AAAB`, `AAA`), so shortest wins on both sides. Space holds the
parasites down by about ten percentage points and no more; it does not stop them, and it does not make anything evolve against them.

## 43. Keys and mimics: can hosts evolve against parasites? (`transStart`, `armsrace.sh`, `keys.js`, `redqueen.js`)

Section 42's hosts can escape parasites only by being elsewhere. For hosts to evolve a defence, the catalyst must recognise
sequence, and making product must be separable from being catalysed. With the full code (`A`→`1`, `B`→`2`) a product carries its
maker's key (its run of `A` and `B`), and with graded specificity (`pMisMelt`) it binds strongly only where that key recurs; but
every strand with coded letters translates, so every strand that is catalysed also makes product. **`transStart`** (new, default off):
only a strand carrying a start motif translates (here one letter, `D`); a template unit carrying it marks itself and the mark runs
along the strand one block per pass, as the proofreading flag does. A mimic is then possible: a strand with a host's key and no
`D`, copied on others' products and making none. A host that mutates its key keeps its own catalyst (made from the new key) and
leaves its mimics behind: the ingredients of tag-based cooperation (Riolo, Cohen and Axelrod 2001), whose cheaters and escapes cycle
without end, with no rule about keys.

**Open world** (`AR_*`: 40×40, four letters, 150 of each, 150 blocks of each product kind, hosts `DABBAB` ×6, shared catalyst,
1,000,000 steps, 2 seeds; controls without specificity and without the start rule). Births from step 500,000:

| run | births | hosts (with `D`) | commonest host keys | mimics (a host key, no `D`) |
|---|---:|---:|---|---:|
| specificity, seed 1 | 1,732 | 1,166 | `AB` 329, `ABA` 287, `ABB` 279 | 499 |
| specificity, seed 2 | 1,899 | 1,627 | `AB` 706, `ABB` 333, `ABA` 173 | 236 |
| no specificity, seed 1 | 2,747 | 1,872 | `BAB` 349, `AAB` 275, `AB` 227 | 656 |
| no specificity, seed 2 | 2,551 | 1,881 | `AB` 469, `BAB` 397, `AA` 242 | 368 |
| no start rule, seed 1 | 2,099 | 1,257 | `AB` 928, `ABB` 182 | (785, all translate) |
| no start rule, seed 2 | 2,116 | 1,089 | `AB` 909, `ABB` 37 | (889, all translate) |

Mimics arise at once (15 to 25% of births in the first 200,000 steps, by losing the `D` or as pieces without it) and stay (12 to
29% of births late). Keys do change: in seed 1 with specificity the hosts' commonest key went `AB` → `ABBA` → `AB` → `ABA`, with
`AB` mimics peaking (38 per 50,000 steps) just before the hosts moved to `ABBA` and dying away while `ABBA` led. But that is what
the eye picks out of drift: across all windows and keys, the mimic load on a key does not predict its fall among hosts (`redqueen.js`,
50,000-step windows, pooled over two seeds: r = +0.05, p = 0.72 with specificity; +0.15 without; +0.12 without the start rule), and
keys turn over as often without specificity. The keys shrink to two or three letters (`AB`, `ABA`, `ABB`) in every arm: the shortest
key wins (regularity 1), and a two-letter key recurs in almost any strand, so there is no specificity left to escape by.

What this says: the parts of an arms race exist (mimics arise and live on hosts' products; hosts can change keys and keep their
catalyst), but in an open world the keys shrink until they recognise nothing.

**Capped world** (`CR_*`: section 33's capped world with the same machine, hosts `PDABBABQ`, so a genome keeps its length and its
pieces are sterile; `pLinkBare` 0.05, since at 0.01 this world died; 2,000,000 steps, specificity on and off, 2 seeds). Capped
births per 500,000-step window: 750 to 940, of which mimics (a host key, no `D`) 1 to 23, that is 0.1 to 2.7%, in both arms and all
windows. The hosts' keys still change (capped genomes gain and lose letters now and then: `ABBAB` → `ABBA` → `ABB`, `ABBAB` → `AABA`
→ `ABAB`, `ABBAB` → `AA` → `ABBAB`), as much without specificity as with it, and mimic load does not predict a key's fall (capped
genomes only, 100,000-step windows, r = +0.02 in both arms). No arms race starts, because mimics never become common: a mimic is
catalysed only by a product that reaches it, and products stay on their makers (the probe above), so a mimic copies at the bare rate,
twenty times slower than a host, and loses.

What the two worlds say together: tag-based cooperation needs a good that actually reaches others; here the shared catalyst is, in
practice, private. Where products were free to wander (the `A`-only code of section 36, hosts making short products that fell
off) parasites took 60 to 70% of births; with keys, products bind their maker in register and stay. What would test the arms race:
products that leave their maker after they are made (they may not bind the strand they were made on, or not for a while), keys
that cannot shrink (capped), and a binding that recognises whole keys (above).

**How specific is a product?** (Probes, 24×24, strands without the start letter so they make nothing, seeded finished products
`12212` made from key `ABBAB`, 4,000 steps, 6 seeds.) Strands one letter off (`ABBAA`) hold 74% as many bound product units as
exact ones (`ABBAB`): recognition is by runs, not by whole keys, which is also why keys can shrink to two letters. A stricter rule
was tried and removed: a bound product unit on a wrong letter marks its product, the mark is relayed along it, and every marked unit
lets go at `pMisMelt`; it moved the ratio only to 70%, because the wrong unit lets go within a few steps and its mark goes with it.
And in the hosts' own world products seldom meet other strands at all: released beside their template, they rebind to it in
register and hold (no product unit was found on a wrong letter in 10,000 steps of a mixed `DABBAB`/`DABBAA` world), so a shared
catalyst at this density is mostly private to its maker, which limits what mimics can take.

## 44. Escape is not delivery: product latches and lifetime (2026-09-26)

**Question.** Is immediate rebinding the only obstacle to a useful shared catalyst? Section 43 suggested remembering a
product's maker and forbidding binding there. That would introduce identity into the chemistry. Instead, try a local latch:
a linked product block stays in its existing `REPEL` state until a stochastic activation exposes `PBIND` (`pPReady`, default 1).
With `productReset` (default false), a melting bound face returns to `REPEL`. Neither transition reads a clock, a parent,
a component, or a sequence. A third parameter, `productFray` (default 1), multiplies product end-fraying, just as `capFray`
sets cap end-fraying; it does not change processive unzip. All blocks and types remain conserved.

**Assay and reproducibility.** `product_exchange.js` runs bounded worker batches on Windows or Unix, at most four workers.
Each output has a CSV and a manifest with full parameters, source hashes, Node version, completion status, and batch CPU/wall
time. The lifetime probe and subsequent batches also retain individual birth records. Simulation implementations for the first
two screens are in commits `617cb1d` and `da2f406`; later default-only additions preserve their trajectories. Hashes identify
the actual file bytes, so line-ending conversion can change a hash without changing the simulation.

All race worlds: 40×40, A/B/C/D 150 each, P/Q 120 each, products 1/2 150 each, E 100; `PDABBABQ` and `PCABBABQ`, six of
each, `transStart D`, code A1/B2, shared binding, mismatch melting 0.05, `pLinkBare 0.05`, `endLoss`, `pUndock 0.1`,
`pFray 0.001`, `capFray 0.03`, `pUnzip 1`, `pSoft 0.002`. Hosts and seeded non-producers have equal length and the same
five-letter key. Samples every 100 steps count mature product binding, not product monomers still being assembled.

Definitions and limits:

- **Host/non-producer:** capped sequences with/without D. Historical CSV columns say `mimic`, but that class includes
  mutations with other keys: it is not proof of matching keys or parasitism. Uncapped births are recorded separately.
- **Occupancy:** summed bound mature units divided by summed armed non-cap positions of that class. The denominator is
  an armed-site exposure measure; isolated coded positions need not expose a binding back. It is not a count of independent
  encounters. Report seed-level ratios, with equal weight per seed, not significance tests on thousands of serial samples.
- **Same block:** fraction of bound product units on the exact block recorded in `parentOf` when they formed. This observer
  never affects dynamics. It is not whole-maker or lineage identity; block recycling can change who contains that block.
- **Products:** the engine's logged full-release events, not total synthesis. Products can assemble and rebind piecemeal
  without a full release being logged. The standing `productUnits` samples therefore matter too.
- The no-binding control sets `pBindP=0`; it disables physical mature-product binding as well as catalysis, not catalysis
  alone. Non-producers can reproduce at the bare rate, so survival or increasing birth share does not establish exploitation.

### 44a. One-time delays and faster melting do not reliably deliver catalysts

```sh
node experiments/product_exchange.js --out experiments/out/PE_screen --steps 50000 --seeds 1,2
node experiments/product_exchange_summary.js experiments/out/PE_screen.csv --after=20000
```

The last 30,000 steps; equal-weight means of two seeds:

| arm | capped births | non-producer birth share | host occupancy | non-producer occupancy | same block |
|---|---:|---:|---:|---:|---:|
| immediate activation | 34.0 | 21.88% | 59.24% | 0.02% | 99.87% |
| activation probability 0.01 | 24.0 | 26.35% | 55.64% | 1.97% | 97.60% |
| activation probability 0.001 | 13.5 | 22.53% | 32.53% | 0.00% | 96.58% |
| in-run melting 0.05 | 16.0 | 68.75% | 22.38%* | 0.00% | 83.96%* |

`*` Only seed 1 has a nonzero denominator: in seed 2 there are no armed host sites in this window. Do not treat missing
occupancy as zero. The apparent strong "parasite success" under fast melting is host loss without observed catalyst delivery.
The 100-step mean delay gives non-producers 3.94% occupancy in seed 1 and zero in seed 2: a weak, non-replicated lead.
The longer delay reduces births in both seeds. A mean activation time is per block, not a synchronized timer for the polymer.

### 44b–c. Repeated latch retraction, and a folding failure

```sh
node experiments/product_exchange.js --out experiments/out/PE_reset_screen --steps 20000 --seeds 1,2 --arms reset100,reset1000,delayFold --workers 3
```

| arm | host occupancy, seeds 1 / 2 | non-producer occupancy | logged releases, seeds 1 / 2 |
|---|---:|---:|---:|
| reset, activation 0.01 | 19.27% / 25.11% | 0 / 0 | 7 / 7 |
| reset, activation 0.001 | 2.58% / 1.43% | 0 / 0 | 32 / 26 |
| activation 0.01, fold1=fold2=45° | 0 / 0 | 0 / 0 | 0 / 0 |

Repeated retraction frees the host surface but does not deliver catalysts in this turnover regime. At activation 0.001,
only about 14% of linked product-unit samples are mature. Products can fray while waiting. The folding arm has **zero linked
product-unit samples**, not merely zero logged releases: it fails before catalytic delivery. Inspection of `_restSlot` shows
that free monomers fold too; all product monomers in this arm are wedges before docking. The plausible geometry explanation
is not yet an isolated causal test. Do not conclude that every folding product fails (34e used different folds).

### 44d. Remove turnover to isolate whether the latch can permit exchange

```sh
node experiments/product_exchange.js --out experiments/out/PE_lifetime_probe --steps 20000 --seeds 1,2 --arms baseline,reset1000 --workers 3 --mode probe
```

`probe` disables both fraying and mutation, not just product fraying. Across the full 20,000 steps:

| arm | host occupancy | non-producer occupancy, seeds 1 / 2 | same block, seeds 1 / 2 | logged releases |
|---|---:|---:|---:|---:|
| baseline | 52.48% | 0 / 0 | 100.00% / 99.98% | 0 / 0 |
| reset, activation 0.001 | 1.20% | 0.92% / 0.51% | 17.44% / 47.67% | 27 / 14 |

Here exchange occurs in both reset seeds. The latch can break original-site retention, but productive occupancy is tiny.
This is an isolation probe, not evidence for a viable ecology: immortality removes genome turnover as well. It motivated the
next assay, which changes only product fragility while keeping genomes mortal and mutation active.

### 44e. Matched controls favor durability over forced escape

```sh
node experiments/product_exchange.js --out experiments/out/PE_durable --steps 30000 --seeds 3,4,5,6 --arms durable,durableReset,durableNoBind --workers 3
node experiments/product_exchange.js --out experiments/out/PE_durable_control --steps 30000 --seeds 3,4,5,6 --arms baseline --workers 3
node experiments/product_exchange_summary.js experiments/out/PE_durable.csv experiments/out/PE_durable_control.csv --after=10000
```

Four fresh seeds, restoring mutation and genome turnover. Durable products have `productFray=0.03`; the reset arm also has
activation 0.001 and repeated retraction; the no-binding arm has `pBindP=0`. The ordinary-lifetime arm is the **same-seed**
control, not the earlier seeds 1–2. Last 20,000 steps; means of seed-level values:

| arm | capped births | non-producer birth share | host occupancy | non-producer occupancy | same block |
|---|---:|---:|---:|---:|---:|
| ordinary lifetime | 20.75 | 14.36% | 57.57% | 0.00% | 99.88% |
| durable products | 20.25 | 21.59% | 59.89% | 1.45% | 98.07% |
| durable + reset | 8.25 | 47.72% | 1.93% | 0.43% | 39.26% |
| durable, no mature-product binding | 8.50 | 31.62% | 0.00% | 0.00% | — |

Durable products without reset give non-producer occupancy **0.07, 0, 1.13, 4.63%**, against zero in every ordinary-lifetime
late window. Total capped births are similar; the per-seed non-producer birth-share differences have mixed signs. This is a
**transport lead**, not established selection. The reset arm loses capped births in every paired seed (6/14/4/9 against
17/19/28/19); it frees products but reduces productive host occupancy to approximately the no-binding regime. Its higher
non-producer share is mainly a smaller host denominator, not evidence of a successful parasite population. Non-producer
births also occur with binding disabled.

**Decision.** Keep `productFray` in the normal simulator: it separates product lifetime from genome turnover, with a measured
transport lead and default 1. Park `pPReady` and `productReset` in `experiments/product_latches.js`, a research subclass using
two single-block transition hooks. They remain reproducible, but are not new viewer/CLI options or an evolutionary preset.
This keeps the negative findings without accumulating unsuccessful rules in the main chemistry. No extra relay, identity
memory, block creation, sequence-specific reward, or organism-level action was added.

**What to predict next.** Measure encounter-to-binding efficiency before increasing world size or running millions of steps.
Survival after release is necessary in the tested regime, but release alone is costly; durable products with moderate
affinity changes deserve more seeds. A different mechanical direction is a shape change triggered by a block's lateral
bond: free monomers remain dockable, while the joined block retains curvature even on rebinding. Test assembly yield,
release, useful recipient occupancy, and births independently. This geometry is **not implemented or established** here.
See the 2025 templating paper and the 2024 mechanical construction reference added to `LITERATURE.md`.

**Scope.** 34 experimental runs, 1,080,000 total steps; two-seed screens and four-seed follow-up, not a search-wide statistical
claim. The five batch manifests record about 3,088 process CPU seconds in total. No arms race, new heritable function, or
increase in evolved complexity was demonstrated. The useful outcome is the distinction between release, survival, delivery,
and reproductive benefit, plus a reproducible assay that prevents mistaking host suppression for parasitism.

**Validation and replay.** All 38 checks were covered across runs. The serial suite passed its first 27 checks before the
final extraction of research latches; it was stopped during the long shared-catalyst check to avoid duplicating work.
The final source passed translation, shared catalysis, both new product checks, and the eight remaining checks in these batches:

```sh
node test.js '--match=^(translate:|bindAny:|product)'
node test.js '--match=^(compCopy:|chiral:|heat:)'
node test.js '--match=^(droplets:|proof:|grip and pocket:)'
node test.js '--match=^(backCopy and stack:|transStart:)'
node tools/fingerprint.js 1500
node build.js
```

All five default trajectory fingerprints match the starting commit `775189d`. The new checks exercise local activation,
face retraction, occupancy classification, exact saved-state continuation, conserved blocks/types, independent genome
turnover, and unchanged processive unzip. Build and whitespace checks pass. CLI guards reject output overwrite, more than
four workers, duplicated analysis windows and a test selector matching no checks.

`PE_replay_probe` repeats seed 1 baseline/reset1000 in probe mode for 10,000 steps; `PE_durable_replay` repeats seed 3
durable/durableReset in race mode for 10,000 steps. All four CSV rows match the corresponding earlier rows exactly after
the subclass extraction. Their manifests and birth logs are retained as verification, **not additional experimental seeds**.

## 45. Does an assembly-triggered shape preserve building and improve delivery? (2026-09-26)

**Hypothesis.** Section 44's folding screen changed free monomers as well as assembled products. A block that stays flat
until it has a lateral bond could assemble readily, then retain curvature even when its face binds again. Test that physical
tradeoff before another ecological arms-race run. This is motivated by the measured assembly and retention problems; it does
not implement SpudCell or add compartment behavior.

`experiments/product_shapes.js` is a research subclass. `productShape=lateral` selects the existing folded rest shape when
either of the block's lateral sides is bonded, regardless of its face. `lateralFree` also requires an unbound face, separating
the monomer-shape issue from persistent curvature on rebinding. `face` preserves the original rule. Every decision reads only
the block's own type and bonds; there is no completion flag, timer, provenance check or extra relay. The normal engine is
unchanged. All arms keep the mortal-genome, durable-product world of section 44 (`productFray=0.03`).

### 45a. Physical activation check: rigid bonded blocks do not adopt a new rest shape

The initial screen used the section 44 defaults (`stiff1=stiff2=1`, `snapCorners=false`). It was stopped when independent shape
arms produced identical rows. The rigid branch of `_physics` skips shape matching for bonded units. A selected folded rest
shape is therefore **not an actual shape change** in this regime. Free monomers are reset to their rest shape, so the old
face-fold rule instead gives initially wedged blocks that remain wedged after bonding.

```sh
node experiments/product_exchange.js --out experiments/out/PS_screen --steps 20000 --seeds 1,2 --arms durable,shapeFace15,shapeSide5,shapeSide15,shapeSide30,shapeSideNeg15,shapeFree15 --workers 4
```

Nine complete 10k windows were retained before stopping (90k measured steps, plus unrecorded partial work). Seed 1's
straight, lateral-5-degree and lateral-15-degree arms have identical values in **every diagnostic column** at both 10k and
20k; the lateral-30-degree arm also matches at 10k. The face-fold arm does differ. The stopped manifest explains why the
batch is incomplete; it is a solver diagnostic, not evidence that working shape changes have no benefit. Its implementation
is preserved at `dc4f7b4`.

The updated test checks physical curling of an eight-block chain, not just `_restSlot`. At stiffness 0.8 the chain's end-to-end
span falls below 80% of its initial span; at stiffness 1 it stays above 95%. Subsequent arms all use `stiff1=stiff2=0.8`,
including their straight control. Genome stiffness stays at 1. No strain-triggered bond break is enabled: this assay tests
assembly and rebinding geometry, not active mechanical ejection. The existing section 34e folding experiment used
`snapCorners=1` (`prodshape.sh`); this diagnosis does not invalidate that separate result.

### 45b. Deformable products: assembly survives mild bends, but large bends cost function

```sh
node experiments/product_exchange.js --out experiments/out/PS_flexible --steps 20000 --seeds 1,2 --arms soft0,softFace15,softSide5,softSide15,softSide30,softSideNeg15,softFree15 --workers 4
node experiments/product_shape_summary.js experiments/out/PS_flexible.csv
node experiments/product_exchange_summary.js experiments/out/PS_flexible.csv --after=10000
```

All shape changes are product-only. The controls separate when the same rest shape is selected:

| mode | unlinked, free | laterally linked, face free | laterally linked, face bound |
|---|---|---|---|
| straight | flat | flat | flat |
| face | bent | bent | flat |
| lateralFree | flat | bent | flat |
| lateral | flat | bent | bent |

The observer counts accepted product–product lateral bonds, product-monomer dockings, and mature-product bindings.
Repeated bonding of the same blocks counts repeatedly; these are **events**, not independently produced molecules.
The measured bend is the absolute angle between the opposed normals of each linked mature block's two lateral edges,
sampled every 100 steps. It measures the block's physical wedge, not polymer curvature or a prescribed target angle.
Summed angles are divided by block-samples separately for face-bound and face-free blocks. These observers never feed back.

Full 20k windows; equal-weight means across the two seeds:

| arm | lateral bonds | full releases | actual bound / free bend | capped births | host occupancy | non-producer occupancy |
|---|---:|---:|---:|---:|---:|---:|
| straight (`soft0`) | 49.5 | 6.0 | 0.15° / 0.19° | 16.5 | 49.50% | 0.02% |
| face 15° | 52.5 | 3.5 | 0.17° / 14.95° | 15.0 | 60.34% | 0.68% |
| lateralFree 15° | 42.5 | 5.5 | 0.18° / 14.94° | 14.0 | 50.93% | 5.77% |
| lateral 5° | 65.0 | 3.5 | 4.85° / 4.99° | 22.5 | 57.19% | 1.41% |
| lateral 15° | 57.0 | 5.5 | 14.66° / 15.00° | 18.0 | 55.39% | 1.10% |
| lateral 30° | 28.5 | 5.5 | 29.59° / 29.98° | 8.0 | 13.73% | 0.56% |
| lateral −15° | 44.0 | 3.5 | 14.75° / 15.01° | 9.5 | 57.15% | 1.43% |

The bend now physically occurs while bound, and does not necessarily prevent assembly. A persistent 30° bend nevertheless
roughly halves lateral-bond formation and births, with low host occupancy. Its many mature binding events (1,870.5 versus
1,311 for straight) do not mean sustained useful attachment: repeated contacts and occupied-site time are different measures.

The **mild-bend lead** is higher births in both seeds (25/20 versus 20/13), without a repeated delivery increase. The
**free-bending lead** is higher non-producer occupancy in both seeds (1.00/10.53% versus 0/0.05%), but fewer total births
(19/9). Its late-window non-producer births are 0/4 versus straight 1/3, so there is no replicated reproductive benefit.
In particular, the strongest delivery screen straightens on binding: it does not support the initial prediction that retaining
curvature while bound is necessary for escape. These are selected, two-seed leads, not established improvements.

### 45c. Fresh-seed comparison (analysis specified before outcomes)

```sh
node experiments/product_exchange.js --out experiments/out/PS_confirm --steps 50000 --seeds 3,4,5,6 --arms soft0,softSide5,softFree15,softFree15NoBind --workers 4
node experiments/product_shape_summary.js experiments/out/PS_confirm.csv --after=20000
node experiments/product_exchange_summary.js experiments/out/PS_confirm.csv --after=20000
```

Compare the last 30k steps per seed, equal seed weights: capped births and absolute non-producer births, host and recipient
occupancy, full releases, assembly bonds and original-block retention. `softFree15NoBind` sets only `pBindP=0` relative to
`softFree15`; as in section 44, this removes physical mature-product binding as well as catalysis. The 5° persistent and 15°
free-bending arms differ in both angle and switching rule, so their direct contrast cannot isolate either factor. No claim of
selection on shape is possible here: shape parameters are fixed for the whole run, not heritable competing alleles.

Completed results, four fresh seeds, 20k–50k; equal-weight seed means:

| arm | capped births | exact parent-snapshot copies | capped offspring of non-producing parents | recipient occupancy | same original block |
|---|---:|---:|---:|---:|---:|
| straight, flexible | 36.25 | 31.25 | 8.75 | 10.32% | 85.54% |
| persistent 5° bend | 43.25 | 36.50 | 5.00 | 16.04% | 80.85% |
| face-free 15° bend | 35.75 | 33.50 | 6.50 | 18.02% | 81.15% |
| face-free 15°, no binding | 11.00 | 10.00 | 6.50 | 0.00% | — |

The mild-bend birth lead survives in three of four seeds: 40/53/28/52 versus straight 23/40/39/43. Exact copies also rise
in three seeds (29/44/27/46 versus 19/37/33/36), but neither result is uniform. The initially concerning accuracy cost is
seed-dependent: the mean per-seed non-exact fraction is 14.90% versus straight 14.14%. Face-free bending gives 6.45%, lower
in each seed, a **post-hoc accuracy lead**, not the prespecified primary result. No capped offspring differs in length from
a capped parent in this late window; one mild-bend birth has an uncapped parent snapshot and cannot be classified as exact.

Face-free bending raises recipient occupancy in three seeds (13.33/5.94/31.38/21.45% versus 10.69/8.37/6.55/15.70%),
but births from non-producing parents are 11/8/6/1 versus straight 8/10/14/3. The matched no-binding values are 10/6/6/4,
with the **same mean of 6.5**. Binding strongly benefits total reproduction, mostly by producers; there is no replicated
recipient reproductive gain from this shape rule. High occupancy can coexist with a dwindling recipient population:
the face-free arm has no armed capped non-producer sites at all in seed 6's final 10k window.

Additional diagnostics, added while the fresh-seed batch ran: `product_parent_summary.js` separates capped offspring
produced by non-producing templates from non-producer offspring arising from producer templates. It also compares each
offspring with the reversed parent sequence, swapping P/Q as required by capped copying. These are comparisons to the
**parent snapshot at release**, not proof of a particular mutation mechanism. This guards against treating extra births
as extra faithful copies. In the screen's last 10k steps, mild-bend exact copies were 19/11 versus straight 13/7; changed
same-length sequences were 1/3 versus 0/1. There were no capped length changes in those windows.

### 45d. Existing rigid controls isolate product flexibility

The section 44 `PE_durable` runs use the same seeds and parameters as `PS_confirm`'s `soft0` arm except product stiffness
(1 versus 0.8). The new research subclass's neutral `productShape=face` parameter is an implementation difference verified
to leave trajectories unchanged. Compare only the shared interval, 10k–30k, never the old 30k runs against the new 50k runs:

```sh
node experiments/product_exchange_summary.js experiments/out/PE_durable.csv experiments/out/PS_confirm.csv --after=10000 --until=30000
```

The relevant rows are `durable` and `soft0`. This reuses matched controls to distinguish material compliance from changing
rest shape. It is a descriptive comparison using earlier seeds, not an independent replication of the durability finding.

| product stiffness | recipient occupancy, seeds 3 / 4 / 5 / 6 | mean recipient occupancy | mean capped births | offspring of non-producing parents, seeds 3 / 4 / 5 / 6 |
|---|---:|---:|---:|---:|
| 1 (rigid) | 0.07 / 0.00 / 1.13 / 4.63% | 1.45% | 20.25 | 5 / 3 / 7 / 1 |
| 0.8 (flexible) | 10.09 / 7.51 / 4.03 / 8.88% | 7.63% | 21.75 | 6 / 6 / 10 / 4 |

Both recipient occupancy and reproduction by non-producing templates increase in **all four matched seeds**. Original-block
retention falls from 98.07% to 85.14%; host occupancy stays similar (59.89% versus 60.89%). Mean per-seed snapshot disagreement
is also similar, 7.35% versus 6.97%. This is the clearest lead of this session: modest material compliance improves transfer
without changing preferred shape or introducing a new chemical rule. Four reused seeds do not establish generality, selection
on an inherited trait, or an arms race. A direct flexibility × binding ablation remains unrun; the face-free no-binding arm
is not that ablation because it changes shape too.

### 45e. Substitution-disabled check and decision

```sh
node experiments/product_exchange.js --out experiments/out/PS_exact --steps 20000 --seeds 3,4 --arms soft0Exact,softSide5Exact --workers 4
node experiments/product_parent_summary.js experiments/out/PS_exact.births.jsonl
```

These four post-hoc diagnostic runs change only `pSoft=0` relative to their straight/mild-bend arms. Of 53 capped births,
52 have a capped parent snapshot and all 52 match it exactly (27 straight, 25 mild-bend). The remaining mild-bend birth's
recorded parent is the single cap `Q`, so its copying fidelity is unknown. This checks for an obvious geometry-induced
copying failure under these settings; it does not establish perfect long-run fidelity or identify the cause of every earlier
sequence difference. Parent-at-release observation needs this explicit unknown category.

**Decision.** Keep shape switches in the research module, not the standard chemistry. The measured material-compliance
lead uses existing `stiff1`/`stiff2`; expose those controls in the viewer with neutral defaults of 1. Do not add a new preset
or an evolutionary success claim. Next, isolate flexibility with a matched binding ablation and additional seeds, then ask
whether mixed-stiffness products make inherited composition or arrangement affect function. The new shape rules have
not earned an expansion into a larger ecology yet. SpudCell remains background inspiration, not a specification.

**Validation and cost.** The engine source is unchanged from `4218cea`, and its five 1,500-step fingerprints remain identical.
All three affected product checks pass, including actual curling, neutral-subclass trajectory equality, conservation,
locality and exact saved-state continuation; 39 checks are now registered. The unchanged general suite was not rerun.
The viewer build and script syntax pass; stiffness controls reset to 1. Three completed batches contain 34 runs and
1,160,000 steps, using about 3,600 process CPU seconds. The stopped rigid diagnostic retains another 90k measured steps,
excluding unfinished work. CSVs, birth logs and full parameter/source-hash manifests are retained. Every raw birth reconciles
with its CSV window and every planned job/window is present in the completed batches. Incomplete-batch, duplicate-window
and invalid-range guards were exercised successfully.

## 46. Independent flexibility × binding control: recipient benefit does not replicate

**Question.** Does the section 45d material-compliance lead survive fresh seeds and a direct binding ablation?
The earlier result reused four historical rigid controls. Here all four combinations are run together: straight durable
products at stiffness 1 or 0.8, with mature-product binding enabled or disabled. No new physics or chemistry is introduced.
Only `soft0NoBind` is added to the experimental arm table. The world and all other settings remain those of sections 44–45:
`productFray=0.03`, `pLinkBare=0.05`, mutation and turnover enabled, six seeds of each capped founder sequence.

The protocol in `experiments/flexibility_plan.md` was written before launching the batch. Four fresh random seeds (7–10),
50k steps each, primary interval **20k < t <= 50k**. Primary outcome: absolute capped offspring with a capped non-producing
parent snapshot. Compute binding-on minus binding-off within each stiffness and seed, then subtract the rigid effect from
the flexible effect. More recipient occupancy alone was explicitly not a successful outcome.

```sh
node experiments/product_exchange.js --out experiments/out/PF_binding --steps 50000 --seeds 7,8,9,10 --arms durable,durableNoBind,soft0,soft0NoBind --workers 4
node experiments/flexibility_summary.js experiments/out/PF_binding
node experiments/product_exchange_summary.js experiments/out/PF_binding.csv --after=20000
node experiments/product_parent_summary.js experiments/out/PF_binding.births.jsonl --after=20000
```

### 46a. The earlier recipient benefit is not reliable

All vectors below list seeds **7 / 8 / 9 / 10**, in that order. Means weight seeds equally.

| arm | capped offspring of non-producing parents | mean | total capped births | mean total | mean producer-parent births |
|---|---:|---:|---:|---:|---:|
| rigid, binding (`durable`) | 7 / 0 / 7 / 10 | 6.00 | 42 / 42 / 41 / 39 | 41.00 | 34.25 |
| rigid, no binding (`durableNoBind`) | 4 / 6 / 8 / 3 | 5.25 | 7 / 12 / 11 / 14 | 11.00 | 5.75 |
| flexible, binding (`soft0`) | 15 / 0 / 4 / 2 | 5.25 | 36 / 26 / 42 / 32 | 34.00 | 28.25 |
| flexible, no binding (`soft0NoBind`) | 2 / 5 / 12 / 3 | 5.50 | 8 / 18 / 16 / 6 | 12.00 | 6.50 |

| seed | rigid binding effect on recipient-parent births | flexible binding effect | flexible minus rigid effect |
|---|---:|---:|---:|
| 7 | +3 | +13 | +10 |
| 8 | -6 | -5 | +1 |
| 9 | -1 | -8 | -7 |
| 10 | +7 | -1 | -8 |
| mean | +0.75 | -0.25 | -1.00 |

Flexible binding increases recipient-parent births over its own no-binding control in **one of four seeds**. Its mean
effect is slightly negative, and its additional benefit relative to rigid binding also has mixed signs. With binding on,
flexibility beats rigidity for recipient-parent births in one seed, ties in one and loses in two. This does not confirm the
prediction from 45d. Four seeds do not prove the true effect is zero or negative; they do show the earlier four-seed pattern
was insufficient grounds for promoting flexibility as a reliable ecological improvement.

Binding does increase total capped births in every seed at both stiffnesses: mean +30 for rigid and +22 for flexible.
Most additional births have producer parents. This is a population-level intervention, not a per-template causal effect:
binding also changes population sizes, resource competition and physical attachment. The protocol measures productive
recipient exchange at the population level; it cannot identify which individual birth was helped by a borrowed product.

### 46b. Occupancy and fidelity do not rescue the primary prediction

| binding-enabled arm | recipient occupancy, seeds 7 / 8 / 9 / 10 | mean host occupancy | mean original-block retention | exact capped parent-snapshot copies |
|---|---:|---:|---:|---:|
| rigid | 5.61 / 3.50 / 15.38 / 9.78% | 55.66% | 85.05% | 34 / 34 / 34 / 34 |
| flexible | 21.84 / undefined / 15.14 / 7.28% | 55.56% | 78.51% | 34 / 22 / 36 / 29 |

Flexible seed 8 has **zero armed capped non-producer site-samples throughout the primary interval**. Its occupancy is
undefined, not zero; its recipient-parent births are zero. Among the three seeds with defined occupancy under both
stiffnesses, flexibility increases occupancy only in seed 7. The generic summary's flexible occupancy mean of 14.75%
uses just three seeds, while rigid 8.57% uses all four: those means cannot establish a replicated improvement. The summary
now explicitly prints how many seeds have a defined recipient-occupancy denominator; the paired report prints the actual
site-sample counts as well. No-binding occupancy is zero with nonzero denominators in every run.

Of 164 rigid-binding capped births, 136 match a capped parent snapshot exactly, 25 have same-length changes and three
have uncapped parent snapshots. Flexible binding gives 121 exact, 13 same-length changes and two unknown out of 136.
There are no measured capped-parent length changes. These are observations at release, not proof of the mutation mechanism;
unknown parent snapshots are never silently counted as faithful copies. Exact-copy counts improve in only one flexible seed,
tie in one and fall in two, so an accuracy observation does not reverse the reproductive conclusion.

### 46c. Decision, workflow and next discriminating hypothesis

**Downgrade the flexibility lead.** Keep the existing controls and physics, but do not promote a new preset, enlarge this
into an arms-race experiment, or assume mixed stiffness will now be selected. The next missing evidence is a function that
helps the recipient under controlled physical conditions, not another occupancy increase. A separate mechanical-bracing
probe is worth considering: retain product attachment but set `pLinkBare=1`, making docked-letter link probability equal
with and without an attached product. This removes the existing programmed catalytic advantage while retaining geometry.
Use matched attachment/no-attachment controls and a small copying assay before a population competition. Turning
`catalysis=false` is **not** that control: it also removes mature-product binding. This new probe is unrun, not a result.

The user's description of flexible polygons was already implemented: corner deformation plus restoration toward a rest
shape. README now explicitly distinguishes stiffness from a hard deformation bound, and approximate pins from the exact
`snapCorners` projection. No hard deformation clamp was added without evidence that one is needed.

The new paired analyzer rejects incomplete batches/windows and unexpected arm differences, reconciles every raw birth
against its CSV interval, preserves zero outcomes, and prints the four paired contrasts. Its fixture exercises missing and
duplicate windows, mismatched raw counts, unexpected parameters, incomplete manifests and partial-window requests.
During progress inspection, one preliminary report used unequal final intervals and was corrected immediately; no partial
totals enter the tables above. Complete paired windows are required for final claims.

**Validation and cost.** Sixteen completed runs, 800,000 steps, 80 validated windows; 2,404.063 process CPU seconds and
900.240 wall seconds with at most four simulation workers. All four simulation-source hashes still match the launch
manifest. CSV, manifest and raw birth log are retained. Every interval checked bond invariants, conserved block count and
unchanged block types. All three product checks and the analysis fixture pass. The unchanged general suite was not rerun.
The engine is unchanged from `d189ee2`; all five 1,500-step fingerprints match the earlier session exactly.

## 47. A mechanical brace straightens a template, but does not increase sustained copying

**Question.** Can an attached product help copying by its physics, with the programmed catalytic link advantage removed?
Section 46 left this untested. `experiments/mechanical_brace.js` now isolates the operation in a small world using the
unchanged `Sim`, existing parameters, and seeded initial bonds. The prospective protocol is `mechanical_brace_plan.md`.

### 47a. One active founder, equal chemistry, matched initial geometry

An 18×18 world contains 60 A, 60 B, three product-1 and three product-2 blocks. One active `ABBABA` founder and one
preassembled `122121` product row are seeded. Both arms start with **identical positions, angles, shapes and internal
states**. In one arm all six product faces are bonded to the corresponding founder backs; in the other they are unbound
and `pBindP=0`. The free row remains in the world: mass is identical. In the attached arm `pBindP=0.2`, but existing bonds
never melt (`pPMelt=pPMeltRun=0`). Neither strand frays. Product stiffness is 1; letter stiffness is 0.5.

Both arms use **`pLinkBare=1`**. A test verifies that two adjacent docked letters link with probability 1 both with and
without support, and that reducing this parameter restores the usual chemical contrast. `catalysis` stays enabled to
retain product attachment; it confers no linking-probability advantage in this assay.

There are no energy particles and `energyGate=true`: the seeded founder remains active, but its copies cannot rearm.
There is no mutation, capture, ligation or turnover. Thus exact released `ABABBA` chains measure repeated copying by
one founder, not descendant population growth. All material comes from the fixed initial pool. Every run verifies
unchanged types, conserved mass, bond invariants, the assigned support bonds and absence of active offspring at its end.

`foldB=0,15,30` changes B's preferred shape while its face is free; docking straightens that preferred shape through the
existing local rule. The product row itself stays straight. The bend observer measures mean angle between neighbouring
founder-face normals every 100 steps; it is actual geometry, not the prescribed fold angle. The same samples record
founder face and back occupancy. Observers never affect the simulation. These are prepared substrates, not a demonstration
of spontaneous brace assembly, a free catalyst finding a client, or inherited support.

### 47b. The two-seed yield lead fails fresh-seed confirmation

```sh
node experiments/mechanical_brace.js --out experiments/out/MB_screen --seeds 1,2 --steps 20000 --workers 4
node experiments/mechanical_brace_summary.js experiments/out/MB_screen
```

Each cell lists **free support / attached support**. Full 20k runs, equal seed weights:

| foldB | exact copies, seed 1 | exact copies, seed 2 | mean measured bend | mean first-copy time |
|---|---:|---:|---:|---:|
| 0° | 10 / 9 | 10 / 9 | 3.81° / 1.40° | 976 / 610 |
| 15° | 10 / 9 | 9 / 10 | 8.42° / 1.55° | 1,208 / 1,083 |
| 30° | 7 / 11 | 7 / 10 | 14.27° / 2.09° | 1,768 / 1,016 |

The 30° condition met the prewritten selection rule: yield increased in both seeds and the support physically
straightened the founder. It and the straight control were selected for seeds 3–10 before those outcomes were available.
A second confirmation uses `bodyJostle=false`, giving blocks their individual kicks instead of the default body's
combined kick. This checks dependence on the body's noise calculation; it does not remove all physical damping or
transport effects of attachment. Batches ran sequentially, at most four workers in total.

```sh
node experiments/mechanical_brace.js --out experiments/out/MB_confirm --seeds 3,4,5,6,7,8,9,10 --folds 0,30 --steps 20000 --workers 4
node experiments/mechanical_brace.js --out experiments/out/MB_local --seeds 3,4,5,6,7,8,9,10 --folds 0,30 --steps 20000 --workers 4 --bodyJostle 0
node experiments/mechanical_brace_summary.js experiments/out/MB_confirm experiments/out/MB_local
```

Fresh-seed means, full 20k, free / attached:

| jostling | foldB | exact copies | attachment yield wins / ties / losses | measured bend | first exact copy, steps | earlier first copy with attachment |
|---|---|---:|---:|---:|---:|---:|
| body (default) | 0° | 10.00 / 9.50 | 1 / 5 / 2 | 4.11° / 1.39° | 1,344 / 1,154 | 2/8 |
| body (default) | 30° | 9.50 / 9.25 | 3 / 1 / 4 | 14.59° / 2.13° | 1,001 / 988 | 4/8 |
| individual blocks | 0° | 6.625 / 6.375 | 4 / 0 / 4 | 11.94° / 5.22° | 2,671 / 2,027 | 6/8 |
| individual blocks | 30° | 7.125 / 6.50 | 2 / 1 / 5 | 18.55° / 5.27° | 2,721 / 1,425 | 7/8 |

The support reduces bending in every fresh matched run, but does **not** increase mean exact-copy yield in any of the
four cells. Its folding-specific yield effect, subtracting its effect on straight templates, is only +0.25 copies under
default jostling and -0.375 under individual kicks, with mixed signs across seeds. The selected screen is not pooled into
these confirmation means. No fresh-seed evidence supports sustained copying improvement at the tested fold/stiffness.

### 47c. A narrower onset lead under individual kicks

First-copy time was a separate prespecified outcome, not substituted for the failed yield prediction. All runs produced
at least one exact copy, so the 20k censoring limit was unused. Under individual kicks, support at fold 30 shortens mean
first-copy time by 47.6%, improving seven of eight seeds. It also shortens first-copy time for straight templates in six
of eight seeds (24.1% mean reduction). This is a conditional, transient lead; the advantage is not general to the default
noise scheme, and the straight control shows it is not exclusively a rescue of preferred curvature.

Post-hoc timing diagnostic, mean cumulative exact copies for fold 30, free / attached:

| time | default body jostling | individual kicks |
|---|---:|---:|
| 1,000 | 0.625 / 0.375 | 0 / 0.25 |
| 2,000 | 1.375 / 1.375 | 0.375 / 0.875 |
| 5,000 | 3.25 / 2.875 | 1.75 / 2.00 |
| 10,000 | 5.375 / 5.25 | 3.375 / 3.625 |
| 20,000 | 9.50 / 9.25 | 7.125 / 6.50 |

The individual-kick lead is visible early but is gone by the end. It does not demonstrate faster steady copying, selection,
or a new heritable function. A finite pool and accumulated inactive copies also make this a bounded assay rather than a
measurement of an infinite-reservoir steady rate. Supports start assembled and permanently attached; their construction,
delivery, release and inheritance costs are unmeasured.

**Decision.** Keep this as a reproducible mechanical assay, not a chemistry feature or preset. Do not turn straightening
alone into a claim of catalysis. Before another support ecology, identify a step whose failure is actually caused by geometry
and measure its rescue separately from encounters and first-copy timing. The conditional onset lead remains worth tracking
if a later mechanism makes rapid initial copying valuable, but does not justify an evolutionary expansion by itself.

**Validation and cost.** 76 runs × 20k = 1.52M steps, 564.485 process CPU seconds and 198.266 summed batch wall seconds.
All 630 logged letter births match the expected copy and founder snapshot; none is classified as another sequence.
CSV, full-parameter/raw-birth JSONL and source-hash manifests are retained. The analyzer reconciles them, rejects incomplete
or duplicate runs and unexpected paired parameters, and reports paired folding-specific effects. Matched initial geometry,
equal chemical linking probability, support retention, single-founder behaviour and exact saved-state continuation are
tested by `mechanical_brace_test.js`. The core engine is unchanged from `ec8a1c7`; all five default 1,500-step fingerprints
match. The unchanged general suite was not rerun. No new rule, material type or deformation clamp was added.

## 48. Permanent wedges reveal a linking obstruction that a straight brace cannot remove

**Question.** Section 47's folding letters flatten their preferred shape when a monomer docks. Does permanent
curvature expose a physical failure, and can a prepared support rescue it? `geometric_bottleneck_plan.md` specifies
the screen prospectively. The unchanged engine uses the same pool, initial geometry and support comparison as 47,
but with `bendB=0,10,20,30` instead of `foldB`. Seeds 11-12, 20k steps, stiffness 0.5, default body jostling.

```sh
node experiments/geometric_bottleneck.js --out experiments/out/GB_screen --seeds 11,12 --steps 20000 --workers 4
node experiments/geometric_bottleneck_summary.js experiments/out/GB_screen
node experiments/geometric_bottleneck_test.js
```

Each entry is free / attached support. Means give equal weight to the two seeds.

| bendB | exact copies, seed 11 | exact copies, seed 12 | actual mean founder bend | founder face occupancy |
|---|---:|---:|---:|---:|
| 0 | 10 / 9 | 10 / 10 | 3.81 / 1.38 degrees | 15.54 / 14.95% |
| 10 | 5 / 8 | 7 / 7 | 6.83 / 1.58 degrees | 22.47 / 18.22% |
| 20 | 0 / 0 | 0 / 0 | 12.48 / 2.01 degrees | 9.96 / 22.58% |
| 30 | 0 / 0 | 0 / 0 | 18.42 / 1.97 degrees | 8.20 / 7.45% |

The support straightens even the non-copying founders, but does not restore copying. The 10-degree yield increase
occurs in only one seed, failing the prespecified two-seed selection criterion; it is not promoted or pooled with
the earlier folding result. All 66 released letter births are exact.

**Where the process stalls.** Every 20 steps the observer examines adjacent occupied founder faces. For the two
docked letters it records whether the matching L/R sides are already joined, or are free and chemically compatible;
in the latter case it measures edge midpoint gap, angular mismatch, and the unchanged `_geomOK` decision. Counters
are retained separately for all five founder bonds and in 5k windows. They are dwell-time samples, **not independent
attempts, reaction rates, or estimates of copy completion probability**. Fast successful links may occur between samples.

At the founder's BB adjacency with bend 20, all 14 eligible free-support samples and all 476 attached-support samples
fail the angular gate (10 degrees). Mean angular mismatch by seed is 43.34/40.93 degrees free and 23.47/23.24 degrees
attached. Corresponding edge gaps are 0.350/0.360 and 0.189/0.187, against a 0.15 distance tolerance. Thus support
reduces a real geometric mismatch, yet the incoming wedges themselves still cannot form the required joint reliably.
The bottleneck is the fit of **both rows**, not just the founder's curvature.

**What this does not say.** Two seeds do not rule out rare copying or other supports. Initial support is imposed,
no offspring rearms, and neither construction costs nor population selection are measured. There is no new chemistry,
force, template-specific behaviour, or programmed success reward. This negative result motivates a distinct hypothesis:
existing complementary copying might allow oppositely wedged partners to fit (49).

**Validation and provenance.** The test checks physically changed corners, matched initial geometry, equal link
probabilities, observation neutrality including the random stream, retained support, conserved material, inactive
offspring and exact saved-state continuation. The analyzer rejects incomplete/duplicate jobs and reconciles raw births,
CSV, parameters and window counters. A first harness attempt accidentally imported a worker entry point, producing
duplicate results; it was discarded in full. The corrected observer is self-contained, worker entry points are guarded,
and the batch was rerun. Only the valid 16 runs (320k steps, 94.250 CPU seconds) are retained as results. Raw births,
all counters, parameters and source hashes accompany the CSV. All five default 1,500-step fingerprints are unchanged.

## 49. Complementary shapes restore curved copying; the strength depends on deformation resolution

**Question.** Could the obstruction in 48 be removed by matching the shapes of the two rows, without a brace or a
new chemical reward? Existing `compCopy` pairs A with B. Existing negative `bendA` makes A widen toward its back,
while positive `bendB` makes B narrow. Pairing such opposing wedges should reduce the lateral joint mismatch that
stalls identical wedges. This hypothesis and the sequence of checks were recorded in `complementary_fit_plan.md`.

### 49a. An isolated, balanced comparison

`complementary_fit.js` uses the ordinary Sim: 60 A, 60 B, one six-letter founder in 18x18, stiffness 0.5, no fuel,
turnover, substitutions, ligation or products. Only the founder can template. Each pairing mode has probability 1
for its intended docking and lateral links; complementary mode changes partner identity, not bond probability.
The founder contains three of each letter, so the two modes have equal material demand. Within a shape condition,
starting positions, corners and internal states are identical across pairing modes. Both free and bonded shape effects
are measured; a test verifies that the actual A back edge is wider than its face and B's is narrower.

Four profiles test shape and partner identity separately. Two seeds, 21-22; full 20k outcomes, self / complementary:

| profile | bendA / bendB | exact copies, seed 21 | exact copies, seed 22 |
|---|---|---:|---:|
| square | 0 / 0 | 11 / 10 | 10 / 9 |
| B only | 0 / 20 | 0 / 1 | 0 / 0 |
| positive | 20 / 20 | 0 / 0 | 0 / 0 |
| opposed | -20 / 20 | 0 / 9 | 0 / 9 |

Complementary recognition alone does not rescue all-positive wedges. Opposing shapes with self-pairing also fail.
Together they copy repeatedly. The opposed profile passes the prospective screen rule and is selected with the
square control; the screen is not pooled into confirmation.

```sh
node experiments/complementary_fit.js --out experiments/out/CF_screen --seeds 21,22 --workers 4
node experiments/complementary_fit.js --out experiments/out/CF_confirm --seeds 23,24,25,26,27,28,29,30 --profiles square,opposed --sequences ABBABA,BABAAB --workers 3
node experiments/complementary_fit_summary.js experiments/out/CF_confirm
```

### 49b. Eight fresh seeds, and both directions

Complementary copying maps ABBABA to BABAAB and back again. Prepare each founder in separate matched assays so a
one-way fit cannot masquerade as a cycle. Exact self-pairing children are ABABBA and BAABAB, respectively. All released
births in these assays match their mode's expected sequence and founder snapshot.

| founder | profile | mean exact copies, self / complementary | complementary yield wins / ties / losses |
|---|---|---:|---:|
| ABBABA | square | 9.625 / 9.750 | 3 / 2 / 3 |
| ABBABA | opposed | 0 / 10.125 | 8 / 0 / 0 |
| BABAAB | square | 10.375 / 9.375 | 3 / 1 / 4 |
| BABAAB | opposed | 0.625 / 7.750 | 8 / 0 / 0 |

Subtract the square mode contrast from the opposed mode contrast within each seed: the mean shape-specific gains
are +10.0 and +8.125 copies for the two founders, positive in every seed in both directions. This demonstrates a
repeatable physical compatibility effect under default physics, not a higher copy rate than square letters.

At ABBABA's BB site, self-pairing opposed rows spend 88-96% of samples with both faces occupied but the two docked
letters still unjoined. Of these eligible samples, approximately 99.8-100% fail the angular gate. The complementary
rows spend much less time in that stalled state and repeatedly release exact copies. These are per-run dwell samples,
not independent trials; a near-zero number of unjoined samples can mean rapid linking, not lack of opportunities.
The founder remains visibly bent with complementary pairing (mean 7.09 degrees), so rescue does not require a
straight row. The intended fit is between two deformed rows.

### 49c. The solver and jostling controls limit the claim

```sh
node experiments/complementary_fit.js --out experiments/out/CF_solver --seeds 23,24,25,26 --profiles square,opposed --sequences ABBABA,BABAAB --iters 8 --workers 3
node experiments/complementary_fit.js --out experiments/out/CF_local --seeds 23,24,25,26 --profiles square,opposed --sequences ABBABA,BABAAB --bodyJostle 0 --workers 3
node experiments/complementary_fit.js --out experiments/out/CF_local16 --seeds 23,24 --profiles square,opposed --sequences ABBABA,BABAAB --iters 16 --bodyJostle 0 --workers 3
```

Means, self / complementary, 20k. These reuse confirmation seeds and are not additional independent replications.

| jostling / passes | seeds | founder | opposed copies | square copies | opposed mean bend |
|---|---:|---|---:|---:|---:|
| body / 8 | 4 | ABBABA | 0 / 10.50 | 10.50 / 10.75 | 8.10 / 5.97 degrees |
| body / 8 | 4 | BABAAB | 0 / 6.50 | 10.00 / 10.75 | 6.61 / 5.67 degrees |
| individual / 4 | 4 | ABBABA | 3.75 / 7.25 | 6.25 / 5.75 | 14.51 / 14.33 degrees |
| individual / 4 | 4 | BABAAB | 5.25 / 4.75 | 7.25 / 6.75 | 13.19 / 13.87 degrees |
| individual / 16 | 2 | ABBABA | 4.00 / 8.50 | 8.50 / 8.50 | 8.42 / 7.88 degrees |
| individual / 16 | 2 | BABAAB | 3.00 / 7.50 | 9.00 / 10.00 | 10.14 / 6.96 degrees |

Doubling the default solver passes preserves the rescue in every seed and direction. At four passes with individual
kicks, however, the reverse-direction advantage disappears; its square-adjusted effect is exactly zero on average.
This result stays in the record. The source documents 8-24 passes for individual kicks, so a post-hoc 16-pass diagnostic
was specified before its outcomes. It recovers a positive effect in both directions and both seeds, including after
subtracting the square contrast (+4.5 and +3.5 copies). Two seeds do not establish convergence. Absolute sterility of
self-paired wedges is **not** robust to noise/solver settings; the strength of the fit advantage depends on deformation.

This is enough to motivate a short descendant-viability probe, not a new preset, a claim of selection, or another
support ecology. No core code, chemistry, fitness reward or viewer setting has changed.

### 49d. Descendants reproduce, but the population still shortens

After the isolated checks, a prospective 50k viability probe used seeds 41-42, 24x24, 120 A + 120 B + 40 E,
three ABBABA founders, ordinary fuel reload, `pFray=0.00003`, `pUnzip=1`, `pSoft=0`, default body jostling and
four solver passes. Cross square/opposed shapes with both pairing modes. This is a small viability test, not a race
between inherited variants or a measurement of selection for complexity. All material is conserved.
This probe uses the default `pUndock=0` (the isolated assay used 0.1): docked monomers can remain trapped.
Together with the changed density and founder count, this precludes attributing cross-assay differences to fuel alone.
The four population arms themselves have matched conditions except shape and partner identity.

```sh
node experiments/complementary_population.js --out experiments/out/CF_population --seeds 41,42 --workers 3
node experiments/complementary_population_summary.js experiments/out/CF_population
```

Each pair of numbers is seed 41 / seed 42. Later births are strictly after 20k through 50k.

| shapes / pairing | births at 20k | births at 50k | later births | maximum generation | later mean birth length |
|---|---:|---:|---:|---:|---:|
| square / self | 28 / 26 | 39 / 33 | 11 / 7 | 5 / 5 | 4.00 / 5.43 |
| square / complementary | 29 / 27 | 41 / 40 | 12 / 13 | 4 / 5 | 4.08 / 3.92 |
| opposed / self | 8 / 3 | 12 / 10 | 4 / 7 | 3 / 2 | 6.00 / 5.29 |
| opposed / complementary | 30 / 24 | 42 / 34 | 12 / 10 | 4 / 5 | 4.08 / 4.50 |

Opposed complementary populations produce 29/24 births at generation 2 or later and continue reproducing in the
late window. Both six-letter forms remain among late offspring in both seeds. Thus the result is more than repeated
copying by prepared founders. It is also not absolute dependence: crowded, active, turning-over self-paired populations
produce some descendants despite the strong isolated bottleneck.

There is **no complexity gain** here. Complementary opposed populations shorten from their six-letter founders,
and perform near the square controls rather than exceeding them. Free letters are exhausted at 50k in both opposed
complementary runs; the small finite pool and low turnover constrain late output. No claim of indefinite persistence
follows from 50k. Different sequences can arise without substitutions through fragmentation and geometric errors;
parent-at-release snapshots can themselves be fragments. The analyzer therefore calls the 208/251 whole-probe
parent/child matches *snapshot exact*, not an independently established fidelity rate. All raw births remain available.

**Decision and next question.** Geometry can impose and relieve a large reproductive obstruction using only existing
shapes and the existing partner table. The stronger lesson is to measure the two-row fit, not assume that straightening
one row is the useful operation. The next mechanical question is whether a persistently curved, copying sequence can
perform another measurable function (for example fuel capture through the existing pocket geometry). Measure that
function and its same-physics control before an evolutionary race. This work neither makes length pay nor supplies a
new product catalyst. Keep these as assays, with no new preset or core rule.

**Validation and cost.** The 160 isolated runs cover 3.2M steps and 1,066.779 process CPU seconds; all 1,062 births
match the intended founder/child mapping. The eight population runs add 400k steps, 438.688 CPU seconds and 251 births.
Manifests retain every job, full parameters, source hashes, CPU time and completion state. CSV, raw births and every
geometry window are committed. The analyzers reject incomplete, duplicate, missing or parameter-mismatched pairs;
they reconcile window counts and raw births, keep undefined geometric denominators explicit, and report square-adjusted
paired effects. `geometry_analysis_test.js` checks malformed datasets as well as valid ones. The two assay tests check
actual shapes, equal chemical probabilities, conserved single-founder setups and non-invasive observation. Seven relevant
existing tests pass (exact copying, translation/catalysis, shared catalysts, complementary copying and three product checks).
The unchanged full 39-check suite was not rerun. All five default fingerprints remain identical; `src/sim.js` is unchanged.

## 50. Persistent shapes capture fuel; shared contacts complete recovery

### 50a. A curved row captures fuel but cannot fully reactivate itself

Following 49, test a physical function of copying-compatible curvature using **only existing rules**.
The prospective protocol is `curved_fuel_plan.md`. One initially REPEL eight-letter row, 12x12 world,
40 U particles, no E or free letters, stiffness 0.5, complementary pairing, pUndock 0.1, no fraying or
substitutions. All blocks and the seeded lateral bonds are conserved. Each actual REPEL-to-TPL transition
is logged with its fuel particle and the sides holding that particle. Two contacts are required by the
existing fuel rule; one consumption arms one letter. There is no state reset or artificial fuel placement.

The 36-run screen crosses two seeds (51,52), three balanced self-reverse-complementary sequences,
fuel sizes 0.5/1.2, and square/opposed-20/opposed-40 shapes, 50k steps. Entries are units rearmed in seed 51/52;
every square control rearms zero. No row completely rearms in this screen.

| sequence | fuel size | opposed 20 | opposed 40 |
|---|---:|---:|---:|
| AAAABBBB | 0.5 | 0 / 0 | 4 / 4 |
| AAAABBBB | 1.2 | 4 / 3 | 5 / 5 |
| AABBAABB | 0.5 | 0 / 0 | 4 / 4 |
| AABBAABB | 1.2 | 0 / 0 | 5 / 4 |
| ABABABAB | 0.5 | 0 / 0 | 0 / 0 |
| ABABABAB | 1.2 | 0 / 0 | 2 / 0 |

Select AAAABBBB, opposed 20, size 1.2 before fresh outcomes: the angle has previous copying evidence;
40 degrees does not. Fresh seeds 53-60 rearm **4,2,4,4,4,2,4,5** units versus zero in every square control.
Mean 3.625/8; 28 of 29 events arm B, one arms the adjacent A. Actual mean bend is 19.33 degrees versus
5.26 square. None fully recovers. Doubling solver passes in seeds 53-56 retains partial capture, but reduces
it to 2,2,1,3 units, all B (mean 2), versus zero square. This magnitude is resolution-sensitive, not a
convergence result. Same-mass grip-off controls in seeds 53,54 produce zero events with either shape.

```sh
node experiments/curved_fuel.js --out experiments/out/UF_screen
node experiments/curved_fuel.js --out experiments/out/UF_confirm --seeds 53,54,55,56,57,58,59,60 --sequences AAAABBBB --profiles square,opposed20 --sizes 1.2
node experiments/curved_fuel.js --out experiments/out/UF_solver --seeds 53,54,55,56 --sequences AAAABBBB --profiles square,opposed20 --sizes 1.2 --iters 8
node experiments/curved_fuel.js --out experiments/out/UF_off --seeds 53,54 --sequences AAAABBBB --profiles square,opposed20 --sizes 1.2 --grip 0
node experiments/curved_fuel_summary.js experiments/out/UF_confirm experiments/out/UF_solver experiments/out/UF_off
```

**What this says:** persistent geometry has a measurable fuel-acquisition function without a motif reward.
**What it does not say:** partial capture is neither full recovery nor reproductive benefit. Opposite bends
put the two letter types in different contact geometries; a good inward-facing pocket does not supply every site.

### 50b. Other rows provide the missing contacts, including for straight material

Screen seeds 61,62 with 1/2/4 inactive AAAABBBB rows in the same 12x12 world and 40 size-1.2 U particles,
50k, square/opposed20. There are still no free letters or births. More rows add letter material and density;
this comparison cannot separate them from encounter frequency. Holder-row identities are **observation only**.

| rows | square rearmed / total, seeds 61 / 62 | curved rearmed / total, seeds 61 / 62 | full rows: square; curved |
|---|---|---|---|
| 1 | 0/8; 0/8 | 4/8; 4/8 | 0/0; 0/0 |
| 2 | 13/16; 13/16 | 13/16; 16/16 | 0/0; 0/2 |
| 4 | 31/32; 30/32 | 30/32; 31/32 | 3/2; 2/3 |

Every curved A arming in this screen uses a fuel particle held across different rows. Straight material
also recovers with those contacts. Select four rows to confirm recovery, **not** superiority of curvature.

| fresh seed | square / curved units per row | square / curved completely recovered rows (of 4) |
|---:|---:|---:|
| 63 | 6 / 8 | 1 / 4 |
| 64 | 8 / 7.75 | 4 / 3 |
| 65 | 7.25 / 7.75 | 3 / 3 |
| 66 | 7 / 7.75 | 2 / 3 |
| 67 | 6 / 7.5 | 1 / 2 |
| 68 | 7.75 / 8 | 3 / 4 |
| 69 | 8 / 7.25 | 4 / 2 |
| 70 | 8 / 8 | 4 / 4 |

```sh
node experiments/curved_collective.js --out experiments/out/UF_collective --seeds 61,62 --rows 1,2,4
node experiments/curved_collective.js --out experiments/out/UF_collective_confirm --seeds 63,64,65,66,67,68,69,70 --rows 4
node experiments/curved_collective.js --out experiments/out/UF_collective_solver --seeds 63,64,65,66 --rows 4 --iters 8
node experiments/curved_collective_summary.js experiments/out/UF_collective_confirm experiments/out/UF_collective_solver
```

At eight solver passes, seeds 63-66 still yield full recovery: square 2,3,2,2 rows; curved 3,4,1,2.
Across the eight fresh four-pass seeds, mean rearmed units per row are 7.25 square / 7.75 curved;
22/32 square and 25/32 curved rows completely recover. Cross-row contacts supply 115/116 square A armings
and all 124 curved A armings. These events come from eight worlds, not 124 independent replicates.
Thus shared contacts can close the missing-contact problem under both resolutions. Curvature is not necessary.
This is physical facilitation in a finite prepared assembly, not selection for cooperation, inherited partnerships,
or evidence that longer sequences pay. Whether it supports reproduction needs a separate assay.

### 50c. Shared-contact startup works, but curved descendants do not yet reproduce

First verify this particular eight-letter sequence can copy. One armed AAAABBBB founder in 18x18,
60 A + 60 B, no U/E, 20k: seeds 71/72 give 7/8 exact square copies and 4/1 curved copies. All 20 births
are generation 1 and exact; no offspring can rearm. This establishes viability, not equal copying speed.

Next use the same fixed 120-letter pool with 40 size-1.2 U, no E, and 1 or 4 initially inactive founders.
All arms use compCopy, stiffness 0.5, pUndock 0.1, four passes and body jostling; no turnover/substitutions.
Cross shape and pGrip 0/0.2. More founders consume more of the fixed letter pool; normalize any per-founder
claim and do not compare these totals directly to the smaller no-monomer acquisition world.

| 50k screen, seeds 71 / 72 | square births | curved births | curved fuel consumed |
|---|---:|---:|---:|
| 1 inactive founder, grip on | 0 / 0 | 0 / 0 | 4 / 3 |
| 4 inactive founders, grip on | 4 / 0 | 1 / 1 | 30 / 40 |
| either founder count, grip off | 0 / 0 | 0 / 0 | 0 / 0 |

All six births are exact AAAABBBB from AAAABBBB parents and generation 1. No world has a birth by 20k;
an early viability check therefore sees acquisition in progress rather than immediate reproduction.
Choose four founders, fresh seeds 73-76, 100k to allow this slow startup, with both shapes and grip ablations.
The planned endpoints are exact family births and generation-2-or-later births. Screen and confirmation stay separate.

| fresh seed | births at 50k, square / curved | exact births at 100k, square / curved | generation >=2 births, square / curved | free letters at 100k, square / curved |
|---:|---:|---:|---:|---:|
| 73 | 0 / 5 | 7 / 6 | 1 / 0 | 2 / 7 |
| 74 | 0 / 0 | 4 / 4 | 0 / 0 | 28 / 18 |
| 75 | 7 / 2 | 7 / 6 | 1 / 0 | 0 / 5 |
| 76 | 5 / 0 | 7 / 5 | 0 / 0 | 0 / 9 |

Every grip-off control has zero fuel consumption and zero births. All 46 confirmation births are exact
eight-letter founder-family sequences. The curved arms consume 96/68/99/86 fuel; square 92/47/107/105.
More energy use is not more output: curved mean 5.25 births versus 6.25 square. Four seeds are not a
shape-fitness study, and initial onset varies strongly: square seed 73 is still at zero births at 50k but
overtakes curved by 100k. Only two square runs have a generation-2 birth; none of the four curved runs does.

```sh
node experiments/curved_fuel_reproduction.js --out experiments/out/UF_copy
node experiments/curved_fuel_reproduction.js --out experiments/out/UF_bootstrap --mode bootstrap --rows 1,4 --grips 0,1 --steps 50000
node experiments/curved_fuel_reproduction.js --out experiments/out/UF_bootstrap_confirm --mode bootstrap --seeds 73,74,75,76 --rows 4 --grips 0,1 --steps 100000
node experiments/curved_fuel_reproduction_summary.js experiments/out/UF_copy experiments/out/UF_bootstrap experiments/out/UF_bootstrap_confirm
```

**Decision.** An existing local two-contact reaction plus encounters among rows can start reproduction from
inactive material. No rule recognizes a partner row, provides a whole-row reward, or creates blocks. The
shape-only fuel advantage of an isolated row does not establish superior reproduction in a shared world.
Keep the assays, add no preset or chemistry. No length selection, evolved cooperation or indefinite persistence
has been demonstrated. This no-turnover world increasingly binds up its finite material.

**Next useful measurement:** follow each released offspring's incomplete rearming and count material trapped
in unfinished copies. Separate the contact/energy bottleneck from monomer availability before changing turnover,
density or chemistry. Do not jump from a fuel pocket to another support ecology or an arms-race sweep.

**Validation and cost.** 136 runs, 7.48M steps, 2,223.877 process CPU seconds. Manifests retain source byte hashes,
full parameters, job lists, completion status and CPU costs; raw events/births and windows accompany every CSV.
All three assay checks pass: observer neutrality, actual curvature, local one-fuel/one-arming accounting,
matched grip ablation, conserved material, single-row reference trajectory and inactive/active founder setups.
`curved_fuel_analysis_test.js` validates all batches and rejects malformed copies (incomplete manifests,
duplicate/missing arms, parameter mismatch and out-of-window events). Source checks allow only Git newline
conversion when comparing current source to the recorded byte hash. The existing `grip and pocket` check
passes. The full 39-check suite was not rerun; the engine is unchanged and all five 1500-step default fingerprints
are identical. No browser or build changes were made.

## 51. Fully active offspring can still stall among unfinished rows

### 51a. Replaying the same worlds with block identities

Section 50 leaves two possibilities: curved offspring cannot fully rearm, or they cannot assemble another row
from the remaining material. `offspring_recovery.js` replays the eight grip-enabled 100k worlds of 50c, seeds
73-76, square/opposed20. These are **the same worlds**, not eight new confirmations. The ordinary birth logs,
every 10k statistic and every fuel arming match the archived records exactly. The observer keeps member IDs at
birth, parent-member provenance, exact time of complete rearming, and a 100-step sample of incoming monomers
and joined incoming material. No identity or row count enters a simulation rule.

The fixed world has 120 letters, 40 U, four initially inactive AAAABBBB founders, no turnover or substitutions.
The prospective protocol is `offspring_recovery_plan.md`. A fully rearmed row is an observational milestone;
partially active rows can already recruit material under the existing per-block rules.

| seed | released offspring, square / curved | fully rearmed by 100k, square / curved | offspring ever observed with joined incoming material, square / curved | free letters at 100k, square / curved | letters in unlogged linked rows, square / curved |
|---:|---:|---:|---:|---:|---:|
| 73 | 7 / 6 | 4 / 5 | 3 / 3 | 2 / 7 | 30 / 33 |
| 74 | 4 / 4 | 1 / 0 | 2 / 2 | 28 / 18 | 28 / 35 |
| 75 | 7 / 6 | 7 / 3 | 3 / 3 | 0 / 5 | 32 / 35 |
| 76 | 7 / 5 | 6 / 2 | 3 / 2 | 0 / 9 | 32 / 39 |

Thus **10/21 curved offspring fully rearm**, yet none produces a logged child by 100k. Square has 18/25 fully
rearmed offspring and two productive parents. This rules out failure to complete rearming as the sole explanation.
Late-born offspring have less time; in the prespecified cohort born by 50k, six of seven curved offspring fully
rearm with at least 50k follow-up, but none produces a child. The square cohort has 12/12 fully rearmed and one
productive parent. Those rows occur in only two worlds per shape, so they are not independent replicates.

All 31 curved and 26 square unlogged linked rows at 100k still have at least one docked unit. They are neither
free pool material nor missed detached births at that snapshot. Their lengths range from 2 to 7. They contain
80 active units in curved worlds and 53 in square worlds: release and rearming happen block by block before
a whole-row birth is logged. It would be wrong to call all of this material chemically inert. Conversely, its
activity does not establish a completed reproductive cycle. Each world reconciles exactly to 32 founder units,
logged offspring, free monomers, isolated docked monomers, unlogged linked rows and other units (zero here).

```sh
node experiments/offspring_recovery.js --out experiments/out/OR_replay
node experiments/offspring_recovery_summary.js experiments/out/OR_replay
node experiments/offspring_recovery_test.js
```

**What this says:** whole-world fuel use and birth totals conceal the obstruction. Some mature offspring are
active and initiate joined material, while a substantial part of the conserved pool remains in unfinished rows.
**What it does not say:** this inventory alone proves that freeing monomers restores exact reproduction, or that
energy no longer matters. Full rearming can occur late; the next probe changes those constraints separately.

### 51b. Turnover restores some exact descendant copying, while destroying most original rows

Recreate seeds 73,74 of both shapes through 100k; require the archived birth log and final statistics to match.
Save each world and fork its **identical state and RNG** four ways for 50k: unchanged; `energyGate=false`;
`pFray=0.00003,pUnzip=1`; both changes. The energy bypass is a diagnostic ablation, not a proposed new chemistry.
No blocks are added, removed or repositioned. The four branches differ only in the stated existing parameters.
These are deliberately reused seeds for a causal diagnostic, not independent confirmation.

Primary outcome: an exact AAAABBBB birth from a still-intact offspring row that already existed at the fork.
The observer tracks the original member IDs, retires that row at its first fray event, and checks parent provenance
at each birth. Recycled IDs cannot count as survival of the original row. All whole-world birth sequences are also
retained. The table gives seeds 73 / 74; counts refer only to the 100k-150k continuation.

| shape / intervention | all births | exact births from original offspring | mean newborn length | original offspring intact at 150k | free letters at 150k |
|---|---:|---:|---:|---:|---:|
| square / unchanged | 1 / 3 | 0 / 2 | 8 / 8 | 7 / 4 | 0 / 0 |
| square / energy bypass | 0 / 2 | 0 / 1 | undefined / 8 | 7 / 4 | 0 / 0 |
| square / turnover | 25 / 33 | 0 / 2 | 5.96 / 5.64 | 0 / 0 | 24 / 14 |
| square / both | 25 / 31 | 2 / 2 | 6.64 / 6.42 | 0 / 0 | 8 / 16 |
| curved / unchanged | 1 / 1 | 0 / 0 | 8 / 8 | 6 / 4 | 2 / 12 |
| curved / energy bypass | 3 / 1 | 1 / 0 | 8 / 8 | 6 / 4 | 0 / 7 |
| curved / turnover | 24 / 27 | 2 / 2 | 5.13 / 4.37 | 1 / 0 | 38 / 22 |
| curved / both | 12 / 33 | 3 / 2 | 6.58 / 4.70 | 1 / 0 | 25 / 32 |

Energy bypass alone does not reliably rescue exact copying: the primary outcome improves in one curved seed and
not the other, while square is unchanged or lower. Existing turnover, with the ordinary energy requirement still
on, permits two exact births from original curved offspring in each seed. This demonstrates that those offspring
are not intrinsically sterile. It is a **two-seed lead**, not a robust estimate of turnover's benefit. Turnover also
changes row lengths, contact geometry, template competition and fuel access, so it is not a pure monomer-supply
intervention; the experiment cannot attribute the improvement exclusively to freed monomers.

The larger birth total is mostly a different outcome. Curved turnover produces only 2/5 whole-world exact
eight-letter parent/child matches among 24/27 births; newborn means fall to 5.13/4.37. These whole-world matches
use parent-at-release snapshots, whereas the primary original-offspring endpoint additionally checks physical
membership and uninterrupted survival. Nine of ten original curved offspring and all eleven square offspring
lose their original rows by 150k under turnover. Combining turnover with bypass does not consistently increase
total output. No selection for length, persistence of the eight-letter lineage, or complexity gain follows.

```sh
node experiments/offspring_forks.js --out experiments/out/OR_forks
node experiments/offspring_forks_summary.js experiments/out/OR_forks
node experiments/offspring_forks_test.js
node experiments/offspring_analysis_test.js
```

**Decision and next question.** Energy acquisition is one obstruction, but completing a second cycle also depends
on how conserved material turns over. Existing turnover can enable exact curved descendant copying, while eroding
the structure whose reproduction we wanted. Keep this as a diagnostic lead, with no new mechanism or preset.
A useful next small assay is whether existing local end protection can preserve a completed row **without also
preserving stalled intermediates**. Caps already exist, but an unfinished row may also have a protected free end;
do not assume capping solves the problem. Establish those two lifetimes and copying viability before a population race.

**Validation and cost.** Eight 100k diagnostic replays, four reconstructed 100k fork points and sixteen 50k
continuations: 2M steps, 1,592.984 process CPU seconds. Raw per-row histories, inventories, every continuation
birth with member provenance, full parameters, source hashes, source-state hashes and manifests are retained.
The two assay tests pass, including exact observer neutrality, control continuation, immutable fork sources,
parameter-only contrasts and rejecting recycled IDs as intact parents. The analyzer validates all pairs, material
counts, windows, birth/lineage accounting and source hashes (allowing Git newline conversion); malformed manifests,
missing pairs, parameter changes and corrupted counters are rejected. The engine is unchanged and all five default
1500-step fingerprints remain identical. The unchanged full 39-check suite was not rerun.

## 52. Caps protect completed rows and unfinished intermediates alike

### 52a. Capped curved rows can copy

Following 51, test existing end protection before a population experiment. The prospective protocol is
`end_protection_plan.md`; no engine or rule change. One active PAAAABBBBQ founder in 20x20, 60 A + 60 B +
15 P + 15 Q, no E/U, pFray=0, pUndock=0.1, complementary pairing, stiffness 0.5 for all four types.
P/Q remain square; A/B are square or opposed -20/+20-degree wedges. No offspring can rearm.

| shape | exact PAAAABBBBQ copies at 20k, seed 81 / 82 | other births |
|---|---:|---:|
| square | 5 / 5 | 0 / 0 |
| opposed wedges | 3 / 2 | 0 / 0 |

All 15 births are exact generation-1 copies. This establishes copying viability in two seeds, not a rate
advantage or fitness benefit from caps. Do not compare these totals directly with earlier eight-letter worlds:
the sequence, material pool and world size differ.

```sh
node experiments/end_protection.js --out experiments/out/EP_copy --modes copy --caps 0 --steps 20000
```

### 52b. A protected free end plus one docked end blocks recycling

Three prepared lifetime fixtures contain only their row material, no spare monomers, energy or spontaneous links:
a completed inactive PAAAABBBBQ; an inactive PAAAABBB partial row whose last B remains DOCK on the matching A of
an active PAAAABBBBQ parent; and the same partial/parent pair with that single face bond absent and the last B
REPEL. All other partial units are REPEL. The incomplete row lacks two units. These are prepared states, not
claims about their natural frequency. All material is conserved throughout a run.

Use pFray=0.00003, pUnzip=1, capFray=0 or 1, seeds 81/82, both shapes, 50k. Cap-susceptibility pairs start with
identical positions, internal states, bonds, types and RNG. Attached/detached pairs have identical material and
geometry and differ only at the anchor and its DOCK/REPEL state. The completed fixture has 10 blocks, versus
18 for the partial-plus-parent fixture; cross-fixture lifetimes are not a controlled density comparison.

Primary outcome: first loss of an original target lateral bond. Reassembly of recycled IDs cannot restore its
continuous-survival record. First-loss times happen to be identical across the two shapes for each seed; they
are **not four independent stochastic observations**. An em dash means no loss by 50k, not an estimated lifetime.

| prepared target | capFray | first original bond loss, seed 81 / 82 | target links remaining at 50k, seed 81 / 82 |
|---|---:|---:|---:|
| completed, 10 units | 0 | — / — | 9 / 9 |
| completed, 10 units | 1 | 22,189 / 22,565 | 0 / 0 |
| attached partial, 8 units | 0 | — / — | 7 / 7 |
| attached partial, 8 units | 1 | 7,605 / — | 0 / 7 |
| detached partial, 8 units | 0 | 11,074 / 11,299 | 0 / 0 |
| detached partial, 8 units | 1 | 4,445 / 11,299 | 0 / 0 |

Perfect caps preserve **both** completed rows and attached incomplete rows. Removing the partial row's one
anchor exposes an ordinary end and permits turnover despite the cap at its other end. The protected attached
cases never lose their anchor or free any target material. In fragile-cap seed 82, the parent changes and the
original face bond breaks at 18,518 square / 22,925 curved, yet the target's lateral bonds survive to the endpoint;
this remains a censored outcome. Parent susceptibility changes with the same cap knob, so this arm does not isolate
the partial row's intrinsic lifetime. The raw `anchorLostAt` also records later breaks of that designated pair
in initially detached runs; the summary uses it as an original-anchor lifetime only for initially attached cases.

The protected fixture has a simple local explanation. One end cannot initiate fraying because it is a cap.
The other cannot because it is DOCK and face-bound. Its lateral bond excludes the lone-monomer undocking rule,
while its missing lateral neighbor prevents ordinary release. There is no FRAY source to start unzipping. With
no spare monomers, energy, cutting or mechanical bond breaking enabled, no tested reaction opens an escape path.
This conditional rule argument is stronger than merely observing zero losses in two seeds. It is not a claim
that such a row must remain unfinished in a world where additional monomers can arrive.

```sh
node experiments/end_protection.js --out experiments/out/EP_lifetime
node experiments/end_protection_summary.js experiments/out/EP_copy experiments/out/EP_lifetime
```

### 52c. Ordinary copying also leaves no exposed end to recycle

Replay the four copying worlds exactly, retaining member IDs of completed births so they are excluded from the
unfinished inventory. Sample every 5k through 20k. Births and every archived 10k statistic match. For each unlogged
linked row, count ends that could initiate fraying if pFray were positive, under its actual state, face bonds and
capFray=0. This is a counterfactual eligibility count; no turnover is enabled in these copying replays.

| shape / seed | unfinished row-samples | with one cap and a docked end | capless, both ends docked | row-samples with an eligible fraying end |
|---|---:|---:|---:|---:|
| square / 81 | 6 | 4 | 2 | 0 |
| square / 82 | 6 | 3 | 3 | 0 |
| curved / 81 | 4 | 3 | 1 | 0 |
| curved / 82 | 5 | 5 | 0 | 0 |

These 21 row-samples are repeated observations within four worlds, not 21 independent trials. Typical examples
are PAAAABBBB with its final unit still docked, and an internal AAA patch with DOCK units at both ends. The latter
has no caps at all and is nevertheless protected from initiating end-fraying. Every inventory reconciles to the
150 original letters, including complete rows, free monomers and isolated docked monomers. Protection from this
one reaction does not prove kinetic arrest: the same worlds continue completing exact copies.

```sh
node experiments/end_protection_natural.js --out experiments/out/EP_natural --reference experiments/out/EP_copy.runs.jsonl
node experiments/end_protection_summary.js experiments/out/EP_natural
node experiments/end_protection_test.js
node experiments/end_protection_analysis_test.js
```

**Decision.** Caps are not selective cleanup in this regime. They preserve finished material but also remove
one of the ways incomplete material could recycle; docking can protect the other end. Stop before a capped
population sweep. The next useful measurement is the formation and completion of separate growing patches on
one template, including whether stronger existing lone-monomer undocking changes that balance. Measure joined
patches and completion times before proposing a release mechanism. Section 23 already found that breaking face
bonds inside ongoing copies causes fragments and copying errors; do not reinstate that rule casually.

**Validation and cost.** Four copying runs, 24 lifetime fixtures and four exact replays: 1.36M steps, 146.595
process CPU seconds. Full parameters, source hashes, raw birth records, target IDs, original-bond losses and
inventories are retained. Tests check actual wedge curvature, observer neutrality including saved RNG state,
matched initial conditions, anchor chemistry, exposed-end recycling and conserved material. The analyzer checks
paired parameters, first-loss records, inventories and raw counts; malformed manifests, missing shape controls,
parameter changes and count corruption are rejected. All five default 1500-step fingerprints remain unchanged;
core code, chemistry and presets are unchanged. The full 39-check suite was not rerun.

## 53. Stronger lone-monomer undocking suppresses copying; separate patches often join productively

Prospective protocol: `patch_completion_plan.md`. Keep section 52's one active PAAAABBBBQ founder,
20x20, 60 A + 60 B + 15 P + 15 Q, no fuel/rearming, complementary recognition and stiffness 0.5.
P/Q are square; A/B are square or opposed -20/+20-degree wedges. No turnover or substitutions.
Only pUndock changes: 0.1 control, 0.3, or 1. This existing local reaction removes an isolated docked
monomer; it cannot detach a linked anchor. Seeds 83/84, 50k steps, at most four workers.

An observer tracks each new lateral bond as nucleation (two isolated units), extension (one linked
patch plus a monomer), or merger (two linked patches). A patch is a lateral component of at least
two units. Released offspring retain the identities of their constituent nucleation events. Histories
remaining unfinished at the endpoint are right-censored. Sample unfinished component counts every
100 steps and reconcile a full material inventory every 5k. These observations never feed the engine.

### 53a. Neither stronger rate earns confirmation

Primary outcome is exact completed copies, not fewer visible intermediates. All 47 births across the
screen are exact PAAAABBBBQ generation-1 copies. The finite pool allows at most 14 copies per world;
none reaches that ceiling. Counts below are seed 83 / seed 84, with each same-seed arm paired.

| shape | pUndock | exact copies at 20k | exact copies at 50k | nucleation events through 50k | patch mergers through 50k |
|---|---:|---:|---:|---:|---:|
| square | 0.1 | 5 / 3 | 8 / 8 | 11 / 12 | 2 / 4 |
| square | 0.3 | 3 / 3 | 6 / 7 | 8 / 9 | 1 / 2 |
| square | 1 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |
| opposed wedges | 0.1 | 4 / 2 | 7 / 6 | 13 / 11 | 5 / 5 |
| opposed wedges | 0.3 | 1 / 1 | 1 / 4 | 3 / 5 | 0 / 1 |
| opposed wedges | 1 | 0 / 0 | 0 / 0 | 0 / 0 | 0 / 0 |

At 0.3 every matched 50k output is lower. At 1 no linked patch forms in these four runs; its clean
inventory reflects suppressed assembly. Neither candidate passes the predeclared advancement criterion
(higher curved 50k output in both seeds without reducing either 20k count). No fresh confirmation,
solver sweep or longer run is warranted by this screen. This does not locate an optimum or rule out
lower undocking rates; it rejects this proposed increase in the tested regime.

### 53b. Several patches can contribute to one exact copy

At pUndock=0.1, **10 of 13 curved offspring** incorporate two independently nucleated patches, versus
5 of 16 square offspring. These are descriptive within-world counts, not independent replicates or a
confirmed shape contrast. A second patch is often a productive part of assembly, not necessarily a
competitor to eliminate. Merger totals also include one still-unfinished square row in seed 83.

| shape | pUndock | samples with at least two unfinished patches, %, seed 83 / 84 | median first-nucleation-to-release time among completed rows, seed 83 / 84 |
|---|---:|---:|---:|
| square | 0.1 | 14.8 / 16.0 | 3,681 / 3,854 |
| square | 0.3 | 2.6 / 9.2 | 5,493 / 5,260 |
| opposed wedges | 0.1 | 29.2 / 39.8 | 4,684 / 9,121 |
| opposed wedges | 0.3 | 80.8 / 5.0 | 6,439 / 7,346 |

Each percentage uses 500 time samples in one world; temporal autocorrelation precludes treating them
as 500 trials. Completed-only medians omit unfinished histories and cannot alone establish faster
completion. At 0.3, curved seed 83 has just one completed row and two censored patches aged 42,984
and 36,327 steps at the endpoint. Its median therefore describes the one success, not typical assembly.

The same two partial sequences, PAAAABB and PAAAAB, appear at every 5k inventory from 15k through
50k, each with a single anchor at template indices 3 and 4 respectively (zero-based along PAAAABBBBQ).
They are overlapping prefixes, not complementary pieces of one copy. Their 13 linked units coexist
with **117 free monomers** at 50k, plus the founder and one released ten-unit offspring. This excludes
exhaustion of the total free pool as the explanation for this observed stall. It does not establish
which local encounter or geometric gate prevents progress, permanent arrest, or scarcity of a specific
needed species near the endpoint. Stronger lone-monomer undocking does not release either linked anchor.

The other endpoint censoring records are curved/control seed 83: length 9, age 7,772; square/control
seed 83: length 9 from two nuclei, age 7,819; square/0.3 seed 83: length 9, age 1,066. Seed 84 has
no linked unfinished rows at 50k, although curved/control retains an isolated docked monomer.

```sh
node experiments/patch_completion.js --out experiments/scratch/PC_screen
node experiments/patch_completion_summary.js experiments/out/PC_screen
node experiments/patch_completion_test.js
node experiments/patch_completion_analysis_test.js
```

**Decision / handoff.** Keep the core and pUndock settings unchanged. Do not label all multiple-patch
assembly as harmful, add a completion detector, or launch capped population experiments. The next
focused diagnostic is the overlapping-prefix case: exactly replay seed 83/opposed20/pUndock=0.3,
measure exposed template sites and accepted/rejected incoming geometry around the two anchors, and
distinguish occupied sites from failed fit or local monomer delivery. This is a selected diagnostic,
not an independent replication. The section 23 warning about fragmenting ongoing copies remains.

**Validation and cost.** Twelve runs, 600k steps, 185.344 process CPU seconds. Full parameters, source
hashes, raw lateral events, birth membership, inventories and censored histories are retained in
`PC_screen.manifest.json` and `PC_screen.runs.jsonl`. The observer exactly matches uninstrumented
saved state including RNG, births and statistics at 20k, and reproduces an archived section-52 run.
Synthetic fixtures exercise nucleation, extension, merger, release attribution and unfinished histories.
The analyzer independently reconstructs connected components from the raw edges, verifies all samples,
birth memberships, source provenance, complete paired grid and 150-unit accounting, and rejects
malformed histories, parameters, counts and manifests. Relevant existing determinism, caps and
complementary-copying checks pass. All five 1500-step default fingerprints remain identical. The
engine, viewer and presets are unchanged; the full 39-check suite was not rerun.

## 54. A selected stall has both an occupied site and a placement/geometry barrier

Protocol: `assembly_front_plan.md`, first stage. Exactly replay the selected section-53
world: seed 83, opposed20, pUndock 0.3, 50k. This is the same world, not a fresh
replicate. `anchor_access.js` wraps the existing compatibility, geometry and placement
methods; each original call runs once, and observation draws no random numbers.
Count gates during steps 15,001–50,000, and sample occupancy after each step.
The final saved state including RNG matches an uninstrumented 50k replay exactly;
births, lateral events, parameters and all 5k inventories match the archive.

The PAAAABB anchor is block 87 on founder site 3; it needs growth toward site 2.
The PAAAAB anchor is block 107 on site 4; it needs site 3, already held by block 87.
These IDs and positions are observer labels, never inputs to a reaction.

| observation in the 35k-step interval | count |
|---|---:|
| site 3 occupied by linked material, post-step samples | 35,000 / 35,000 |
| site 2 free / occupied by an isolated monomer, post-step samples | 34,992 / 8 |
| site 2 compatible docking geometry checks | 8,146 |
| first failure: midpoint gap / bearing / opposing-side angle | 8,014 / 57 / 28 |
| checks passing all docking geometry | 47 |
| placement rejected by `_slotFree` / docking accepted | 43 / 4 |
| block 87 compatible lateral geometry checks / gap failures | 428 / 428 |
| block 107 compatible lateral checks | 0 |

The smaller prefix has an occupied next site. The larger one's next site is
usually open and sees compatible incoming material, but successful docking is
rare and no lateral geometry check at its anchor passes. Placement rejects 43
of 47 otherwise geometrically admissible docking attempts. Thus absence of
material encounters is not the only explanation. There are 117 free monomers
at 50k, as in section 53. No completed copying occurs after the single early birth.

**Limits.** Gate counts are repeated calls within one correlated trajectory,
not independent arrival rates or unique monomers. Post-step occupancy omits
contacts formed and lost within a step. Geometry failures use the first failed
test, so later tests may also fail. Lateral candidates are all actual compatible
candidates at that anchor, not exclusively arrivals docked on site 2. We do not
identify which neighboring polygon excludes each placement, prove permanent
arrest, or establish that removing either partial row would restore copying.
No chemistry or geometry tolerance was changed to obtain this diagnosis.

```sh
node experiments/anchor_access.js experiments/scratch/AA_selected.json
node experiments/anchor_access_summary.js experiments/out/AA_selected.json
```

**Cost/provenance:** each execution uses 100k steps (50k observed plus 50k neutrality
replay). The initial execution cost 46.859 process CPU seconds; a repeat after fixing
automatic output-directory creation cost 61.500, giving 200k steps and 108.359 CPU
seconds total. Every observation and the final-state hash match between executions;
these are repetitions of the same selected world, not new evidence across seeds.
`AA_selected.json` retains the latter execution's gate counts, inventories,
full parameters, reference/source hashes and the final-state hash. Its analyzer
checks gate partitions, occupancy totals, archived records and source provenance.
Section 55 tests a contact-gated recruitment hypothesis rather than treating
this selected diagnosis as evidence for a general release rule.

## 55. Contact-gated assembly works, but reduces completed output

The user's constructor suggestion led to a primary-source review of mechanical
constructors and signal-passing tile assembly; see the dated addition to
`LITERATURE.md`. The testable idea is contact-triggered exposure of another
binding site. This is one assembly primitive, not a universal constructor.

**Rule in block terms.** An armed letter advertises whether its own face is bound
on each bonded lateral side. Its free face is receptive when its designated
lateral side is unbonded, or its partner's bonded side advertised occupancy in
the previous derive pass. Otherwise that free face shows IDLE. Bound faces keep
their normal identity, so holding and release conditions are unchanged. Test
both fixed polarities L and R; no block reads a sequence, component, coordinate,
counter, observer identity or completion flag. A mark does not propagate past
an unoccupied face merely because its neighbor received a mark.

`assembly_front.js` implements the gate in a research-only subclass. The off
arm is bit-identical to ordinary physics; no standard rule, knob or preset changes.
The initial fixture remains one active PAAAABBBBQ, complementary recognition,
stiffness 0.5, 150 conserved blocks in 20x20, no energy, substitutions or turnover.
Square versus opposed -20/+20-degree A/B wedges, square caps. New seeds 85/86,
pUndock 0.1, 50k, four workers. Protocol and advancement criterion were written
before the screen. All arms use the same starting geometry and RNG for a seed/shape;
only the experimental face receptivity/derived contact marks differ.

| shape | gate | exact offspring at 20k, seeds 85 / 86 | at 50k | nuclei at 50k | mergers at 50k |
|---|---|---:|---:|---:|---:|
| square | off | 5 / 2 | 9 / 4 | 16 / 9 | 6 / 1 |
| square | L | 1 / 1 | 3 / 2 | 3 / 2 | 0 / 0 |
| square | R | 1 / 0 | 2 / 2 | 2 / 3 | 0 / 1 |
| opposed wedges | off | 2 / 1 | 7 / 4 | 13 / 7 | 5 / 2 |
| opposed wedges | L | 2 / 0 | 3 / 2 | 3 / 3 | 0 / 0 |
| opposed wedges | R | 1 / 1 | 3 / 4 | 3 / 4 | 0 / 0 |

All 45 offspring are exact generation 1. Gating substantially reduces nucleation
and usually eliminates mergers; **neither direction passes the prospective
advancement test** (higher curved 50k output in both seeds, no lower 20k output,
no errors). Seven of eight gated worlds finish with no linked unfinished row,
but output is lower in seven comparisons and tied in one. The remaining gated
world has a four-unit patch aged 3,611 steps. Control square seed 86 retains four
patches (lengths 9/8/7/2, ages 30,538/27,630/19,797/1,831). Cleaner endpoint
inventories alone would give the wrong verdict. Successful multiple-patch
assembly remains visible in the controls, and even one R-gated world has a merger.

**What this says.** Contact-only state changes can bias assembly order while
preserving exact output. In this screen the restriction costs more completed
output than it gains. A spatially ordered assembly operation must earn its
transport and initiation cost; it is not automatically better because it looks
more machine-like. This screen does not separately attribute the cost to initial
docking, contact lifetime, or subsequent extension.

**What it does not say.** Two seeds do not establish general inferiority, universal
construction, selection, or a shape advantage. No descendants rearm in this assay.
The gate changes opportunities to dock, not local detachment chemistry, and is
not a causal rescue of section 54's particular stalled state. No rate tuning,
fresh confirmation, solver sweep or long run was launched after it failed.
Keep it out of the standard engine. The retained research code reproduces the negative.

```sh
node experiments/assembly_front_test.js
node experiments/assembly_front.js --out experiments/scratch/AF_screen
node experiments/assembly_front_summary.js experiments/out/AF_screen
node experiments/assembly_front_analysis_test.js
```

**Cost/validation:** 12 runs, 600k steps, 199.407 process CPU seconds. Raw lateral
events, physical birth membership, censored patches, inventories, full parameters
and executed-source hashes are in `AF_screen.runs.jsonl` and its manifest; the CSV
is derived from the validated raw records. The graph analyzer independently
reconstructs all patch histories and 150-block inventories. Tests cover exact
off-state/RNG identity, both contact polarities, previous-pass reads, no contactless
propagation, bound-side preservation, gate reset, malformed data and provenance.
All 39 standard invariant checks also pass: the first 27 completed in the sequential
run, then the remaining 12 completed in three independent `--match` partitions
(`bindAny|compCopy|chiral`, `droplets|heat|proof`, and the six grip/stack/transStart/product
checks). The sequential process was stopped after its first 27 successes to avoid
duplicating those partitions. All five 1500-step default trajectory fingerprints
match the pre-change values. Core simulation, viewer and presets remain unchanged.

**Next direction:** test reversible positioning of a linked part while preserving
its lateral structure, before inventing a constructor interpreter. The selected
stall now provides a concrete placement obstruction. Identify actual blocking
neighbors in a matched fixture, then assess a strictly local reversible attachment
cycle, recording useful reattachment and fidelity as well as escape. Section 23's
fragmentation warning still applies. No ecological sweep is warranted.

## 56. Releasing either competing prefix restores exact copying in the selected stall

**Question.** Which blocks exclude placement in section 54, and does freeing an
attachment restore productive assembly? This is a causal intervention in that
same selected seed-83/opposed20/pUndock-0.3 world, not a fresh replicate or a new
reaction. Protocol: `placement_release_plan.md`. Restore the full state/RNG at
15k, fork four matched fixtures, then run ordinary chemistry through 50k.

The two retained prefixes are PAAAABB (anchor 87, founder site 3) and PAAAAB
(anchor 107, site 4). Release changes only the chosen anchor's internal state
from DOCK to REPEL and removes its F bond. No displacement or kick, lateral
severing, added monomer, type conversion, fuel or further intervention is used.
Choosing these IDs is a prepared diagnostic fixture; no ID-aware rule is added.

**The excluding block is the anchor itself.** In the unchanged branch, all 43
slot rejections at founder site 2 involve block 87, and no other block is inside
the exclusion threshold. The gate uses center distance, not a polygon-overlap
calculation. All 47 admissible placement calls and four accepted dockings match
section 54. This narrows the geometric obstruction beyond merely observing
many attached patches. It does not prove which upstream forces held that anchor
in the excluding position.

| intervention at 15k | new exact offspring by 50k | forced partial releases logged as births | originally attached piece that completes | completion step | free monomers at 50k |
|---|---:|---:|---|---:|---:|
| unchanged | 0 | 0 | neither | — | 117 |
| release 87 | 3 | 1 | original PAAAAB, all six members retained | 23,606 | 88 |
| release 107 | 3 | 1 | original PAAAABB, all seven members retained | 20,258 | 84 |
| release both | 2 | 2 | neither original piece | — | 97 |

All eight new exact offspring are PAAAABBBBQ, generation 1 from the original
founder. The single birth before the fork is excluded from this table. Each
released partial row produces a stock birth-log entry at 15,001; these four
entries are **not** counted as exact output. Original-member tracking shows
that all forcibly released prefixes remain intact, detached and entirely REPEL
at 50k. None extends or is reused. All lateral bonds survive in every branch,
and every 5k inventory accounts for all 150 original blocks.

| intervention | admissible placements at sites 2/3 | accepted | rejected |
|---|---:|---:|---:|
| unchanged | 47 | 4 | 43 |
| release 87 | 231 | 205 | 26 |
| release 107 | 108 | 80 | 28 |
| release both | 292 | 256 | 36 |

These are repeated calls, not independent arrivals. In the release-107 branch,
block 87 excludes only three placement calls. Thus useful growth can resume
while preserving the very piece that excluded every placement in the control.
Removing the other attachment changes the subsequent geometry and trajectory;
it is not necessary to discard both intermediates. The increased counts alone
do not establish an independent rate effect, and the branches diverge in RNG
use after the intervention.

**What this says.** Escape from an attachment obstruction can preserve a partial
assembly and restore exact copying without fragmentation. A selected state with
plenty of free monomers can still be rescued by removing an attachment. This
earns a prepared test of local reversible docking, where productive reattachment
of the released material must be demonstrated separately.

**What it does not say.** This single selected state does not establish a general
fitness benefit, a curvature advantage, reusable construction parts, sustained
reproduction or a universal constructor. The current release spends an unfinished
piece as inactive material. It changes both state and bonding, so it does not
isolate the effect of a bond edit alone. It also does not show that arbitrary
endpoint releases are beneficial: section 53's productive mergers remain a
reason to measure interruption costs. No new chemistry, viewer knob or preset.

```sh
node experiments/placement_release.js experiments/scratch/PR_selected.json
node experiments/placement_release_summary.js experiments/out/PR_selected.json
node experiments/placement_release_test.js
```

**Provenance/validation.** `PR_selected.json` retains the 15k saved state, source
hashes, all bond events, exact physical birth membership, placement blockers and
seven complete inventories per branch. The archived execution uses 240k steps
(15k preparation, four 35k forks, an unobserved 35k restored control and a 50k
continuous control), 57.188 process CPU seconds. Development replays while
correcting cache-comparison assertions are not included in that timing and are
not independent samples. The observed/unobserved restored controls match every
saved field and RNG bit. The continuous control matches the archived section-54
hash; compared with the restored control, only `pinsVersion` differs by one.
Restoration invalidates the bond cache, causing one extra rebuild; this counter
only invalidates cached corner groups. Every other saved field matches exactly.

Tests verify the precise intervention edits, unchanged physical arrays/RNG,
four-arm observer neutrality, event-time birth membership, raw graph/material
reconstruction, provenance and 21 malformed-data cases. Focused standard checks
and all five default fingerprints are also checked; the full 39-check suite was
passed in section 55 and is not rerun for this observer-only addition.

## 57. Local redocking reuses intact parts, but permits shifted assembly

Section 56 established that attachment release can rescue a selected stall,
while ordinary released material remains inactive. Here a research-only state
tests whether a released endpoint can bind again and contribute to completion.
Prospective protocol: `local_redocking_plan.md`. The standard engine is unchanged.

**Rule, in block terms.** After the ordinary transition, a letter still DOCK,
with its face bound and exactly one lateral bond, can lose its face bond at a
fixed probability per step. An irreversible control changes to REPEL. The
reversible arm changes to SEEK: face DOCK, back IDLE, bonded laterals BONDED,
free laterals INERT. While linked but face-free it stays SEEK. A face bond returns
it to ordinary DOCK and its usual transition; losing all lateral bonds also
returns it to DOCK. No kick or lateral break, no component/sequence/age/identity
read, no geometry override. Ordinary chemical compatibility, distance, angle
and placement gates apply. This subclass supports only the no-energy,
no-turnover assay; it is not a general viewer feature or standard knob.

**Accounting matters.** The unchanged stock logger can label temporary
detachment a birth, clear freshness and later miss a completed product. It is
retained as raw data, but does not define the primary outcome. An independent
observer records each newly detached lateral row with all units REPEL and no
face bonds, once per physical member set. It records exact PAAAABBBBQ and
non-exact rows separately. This criterion never feeds back into a transition.
The analyzer reconstructs bonds in event order and verifies every new settled
row against the final material inventory. No lateral losses or rearming occur,
so settled identities remain intact. Generation counters after temporary
detachments are not used as evidence of reproduction.

### 57a. Prepared selected-state test: productive reuse occurs

Restore the same section-56 state at 15k, then run to 50k. Five arms: off,
irreversible/reversible release at 0.0001 and 0.001. Release applies to every
eligible endpoint, not to the previously selected IDs. The rates were declared
before running. No additional prepared release or movement is applied.

| mode | rate | endpoint releases | redock transitions | new exact settled rows | non-exact settled rows | exact rows containing a fully detached, redocked part |
|---|---:|---:|---:|---:|---:|---:|
| off | 0 | 0 | 0 | 0 | 0 | 0 |
| irreversible | 0.0001 | 4 | 0 | 0 | 4 | 0 |
| reversible | 0.0001 | 8 | 6 | 1 | 0 | 1 |
| irreversible | 0.001 | 14 | 0 | 0 | 9 | 0 |
| reversible | 0.001 | 47 | 42 | 1 | 0 | 1 |

At the lower rate, the original six-member PAAAAB with endpoint 107 releases
at 18,280. It fully detaches, redocks and retains all six original members in
the exact product completed at 31,568. That eventual product also experiences
two later endpoint-release episodes. At the higher rate a different assembly
completes exactly at 30,693. Both rates meet the prepared criterion, so the
predeclared lower-rate choice earns the fresh screen below. This is feasibility
in one selected state, not two independent confirmations.

At 50k the low/high reversible branches still contain two/five SEEK units;
not every attempt succeeds. Repeated releases/redocks are correlated events.
The high-rate stock log contains zero exact births despite one exact settled
product, illustrating why ordinary birth counts would misclassify this test.

### 57b. Fresh screen: curved yield improves, but fidelity criterion fails

Before this screen, declare seeds 87/88, square/opposed20, off/irreversible/
reversible at 0.0001, pUndock=0.1, 50k. Same 150 conserved blocks, single active
PAAAABBBBQ, stiffness 0.5, no energy or turnover. Every arm starts with identical
physical state/RNG for its seed/shape. Confirmation requires a curved exact-output
gain in both seeds, no worse curved 20k output, intact reuse and no non-exact
settled rows in the reversible arm. Square controls remain visible.

| shape | mode | exact at 20k, seeds 87 / 88 | exact at 50k | non-exact at 50k | exact products reusing a fully detached part |
|---|---|---:|---:|---:|---:|
| square | off | 4 / 5 | 8 / 10 | 0 / 0 | 0 / 0 |
| square | irreversible | 3 / 1 | 6 / 3 | 4 / 7 | 0 / 0 |
| square | reversible | 3 / 2 | 7 / 8 | 1 / 0 | 1 / 4 |
| opposed wedges | off | 2 / 2 | 2 / 5 | 0 / 0 | 0 / 0 |
| opposed wedges | irreversible | 1 / 3 | 3 / 5 | 4 / 4 | 0 / 0 |
| opposed wedges | reversible | 3 / 4 | 5 / 7 | 1 / 0 | 1 / 4 |

Curved exact output increases in both seeds, and five of those exact products
reuse a part that became completely face-free and subsequently redocked.
Releasing one endpoint while another remains bound is not counted as full-part
reuse. Square exact output decreases in both seeds. Irreversible release strands
substantially more non-exact material. These are two-seed leads, not established
fitness effects, independent per-event samples, or sustained descendant reproduction.

**Both non-exact reversible products are nine-unit PAAAABBBQ.** In square seed
87, endpoint 114 leaves founder site 3 at 5,316 and redocks at site 4 at 5,329;
the resulting member set settles at 6,714. In curved seed 87, endpoint 107 leaves
site 3 at 28,184 and redocks at site 2 at 28,208; its row settles at 28,274.
The new sites carry the same letter as the old one. These observed shifts are
consistent with loss of position along repeated letters. No existing lateral
bond breaks and no block disappears: the final sequence omits a B during assembly.
This tracing is not a separate intervention proving that the shift alone caused
the omission, or proof that all wrong placements have this form.

**Verdict.** Productive reuse is demonstrated as a local mechanical/chemical
operation, and curved yield is a lead. The predeclared fidelity criterion fails.
Do not promote the rule, tune rates or launch longer confirmation. The next
question is physical registration on repeated letters: can contact and fit
retain position without an index reader, global completion detector or severing
the part? Keep this primitive available only in the research assay. Neither a
universal constructor nor a self-constructing machine has been demonstrated.

```sh
node experiments/local_redocking_test.js
node experiments/local_redocking.js experiments/scratch/RD_selected.json
node experiments/local_redocking_summary.js experiments/out/RD_selected.json experiments/out/RD_selected.csv
node experiments/local_redocking_screen.js experiments/scratch/RD_screen.json
node experiments/local_redocking_screen_summary.js experiments/out/RD_screen.json experiments/out/RD_screen.csv
node experiments/local_redocking_analysis_test.js
```

**Cost/provenance.** Selected batch: five 35k forks plus a 35k ordinary control,
210k steps, 48.687 CPU seconds. Fresh batch: twelve 50k worlds plus four ordinary
off-arm neutrality replays, 800k steps, 287.625 CPU seconds. Total archived work
1.01M steps, 336.312 process CPU seconds, at most four workers. Tests are additional.
Both JSON archives retain executed-source hashes, full initial/final states (the
selected initial state is referenced by hash), ordered bond/release/redock events,
raw stock births, settled member IDs and 5k inventories of all 150 blocks.
The companion CSVs are derived from validated raw records.

Tests cover local eligibility/state changes, no kicks/global reads, free SEEK
persistence, contact-triggered return, ordinary compatibility, off trajectory
identity, active observer neutrality and restart. The analyzer checks source
provenance, exact input/parameter matching, raw bond reconstruction, complete
settled inventories and rejects corrupted data. Focused determinism/caps/compCopy
checks pass, with all five default fingerprints unchanged. The full 39-check
suite last passed in section 55; core source, viewer and presets remain unchanged.

## 58. Stronger shape retention does not restore registration

**Question.** Can greater stiffness stop the shifted reattachments seen in
section 57 without losing completion? Protocol: `registration_fit_plan.md`.
This is a selected-state physics diagnostic, not a fresh-seed confirmation or
a new reaction. Keep the research SEEK rule and its rate 0.0001 unchanged.

First classify **all 25** redocking episodes in the four section-57 fresh seek
worlds: 23 return to the same founder site, two shift; 21 return on the next
step. The other delays are 2 and 7 steps for same-site returns, 13 and 24 for
the shifts. Seventeen episodes fully detach their lateral part; eight retain
another face contact. Both shifts are in the fully detached group. These are
correlated events, not 25 independent trials or evidence that a retained
contact guarantees fidelity. A later shift can spoil material that previously
returned correctly, as in the square seed-87 shortened product.

Replay seed87 square to 5,316 (endpoint114, original four-member BBBQ) and
opposed20 to 28,184 (endpoint107, original seven-member PAAAABB). Each is the
state just after the selected release: all faces of that part are free. Fork
the full state/RNG into stiffness 0.5/0.8 for A/B/P/Q, crossed with 4/8 solver
passes, and run 5,000 more steps. All other parameters, rest shapes, material,
recognition, noise and chemistry remain unchanged. No kick or prepared position
edit. Controls exactly reconcile to the archived continuous trajectories.

| selected fixture | stiffness | passes | first return: delay / site | original part's outcome by +5k | other exact products |
|---|---:|---:|---|---|---:|
| square, former site 3 | 0.5 | 4 | 13 / 4 | PAAAABBBQ at 6,714 | 1 |
| square | 0.8 | 4 | 13 / 4 | PAAAABBBQ at 6,029 | 1 |
| square | 0.5 | 8 | 13 / 4 | PAAAABBBQ at 7,454 | 1 |
| square | 0.8 | 8 | 13 / 4 | PAAAABBBQ at 7,167 | 0 |
| opposed20, former site 3 | 0.5 | 4 | 24 / 2 | PAAAABBBQ at 28,274 | 0 |
| opposed20 | 0.8 | 4 | 7 / 2 | PAAAABB, face-free and unfinished at 33,184 | 0 |
| opposed20 | 0.5 | 8 | 23 / 2 | PAAAABB, one face attached at 33,184 | 0 |
| opposed20 | 0.8 | 8 | 25 / 2 | PAAAABB, one face attached at 33,184 | 0 |

**All eight first returns still shift one site; none of the original parts
completes exactly.** The square error survives both stiffness and solver changes.
The curved alternatives suppress the completed error within this window by
leaving the part unfinished, not by making it exact. Other exact square output
comes from different material and is not a rescue of the tracked part. Every
original lateral bond and all 150 blocks survive; unfinished outcomes are
censored at +5k, not declared permanently arrested.

**The physical change is real.** Measure RMS corner displacement from the
best-fit rotated rest shape of the original target members, after removing
translation. At +100 in the curved fixture, stiffness 0.5→0.8 changes RMS
0.01665→0.00346 at four passes and 0.01009→0.00177 at eight. These are point
samples in diverging trajectories, not independent samples or isolated material
constants. Square deformation is not uniformly lower at every sample: at +100
and four passes it is 0.00189→0.00205. Full per-unit measurements at the fork,
+1/+10/+100 and each +1000 step are retained. Stronger rest-shape matching can
reduce deformation without selecting the former attachment site.

Geometry observations keep all selected-endpoint checks, both successes and
failures, and match passing geometry to placement calls and accepted bonds.
They do not override the gates. In the square branches the shifted return
passes ordinary geometry and placement in every setting. The curved branches
also all admit a shifted return. This is not evidence that every possible
geometry would fail; it rules out this stiffness change in these two fixtures.

**Verdict/next direction.** Neither stiffness nor additional passes passes the
prospective rescue test, so no fresh population screen, stiffness tuning or
long continuation is launched. A useful next mechanical operation is retaining
a second contact during repositioning. First establish whether an actual second
contact is geometrically available and whether it preserves useful motion in
a matched fixture. The eight partly attached historical episodes motivate this
question but do not answer it. Do not add a correct-site/index reader, global
registration memory, whole-part positioning rule or lateral fragmentation.

```sh
node experiments/registration_fit.js experiments/scratch/RF_selected.json
node experiments/registration_fit_summary.js experiments/out/RF_selected.json experiments/out/RF_selected.csv
node experiments/registration_fit_test.js
node experiments/local_redocking_analysis_test.js
```

**Cost/provenance:** eight 5k forks, two original prefix replays (5,316+28,184),
two 5k continuous controls and two 5k unobserved restored controls: 93,500 steps,
31.515 process CPU seconds, at most four workers. `RF_selected.json` retains
input/source hashes, full fork/initial/final states, ordered bond and state
events, raw births, settled members, five 150-block inventories per fork,
geometry/placement checks and actual deformation. The CSV is derived from
validated raw records. Both controls match archived events and every continuous
saved-state field/RNG bit; cache-version deltas are zero in these snapshots.

Tests verify only the intended initial parameters change, observer neutrality
in all eight conditions, the deformation metric's response and rotation/
translation invariance, graph reconstruction from an already-SEEK snapshot,
complete settled inventories, gate/event reconciliation and 16 corrupted-data
cases. The shared analyzer now accepts an explicit sampling interval and initial
SEEK units; all section-57 analysis tests (25 corruptions) still pass. All five
default fingerprints match. No core, viewer, preset or reaction change; focused
standard tests last passed in section57 and the full suite in section55.

## 59. A prepared supporting contact rescues alignment; late face exposure does not

**Question.** Does a physically admissible second contact retain useful
alignment, rather than merely inhibit assembly? Protocol: `second_contact_plan.md`.
Use section 58's two post-release states. No new reaction or state is introduced;
all edits below are prepared fixtures, not rules selecting IDs or whole parts.

### 59a. Availability at the release instant

For each other original member, enumerate chemically matching founder faces
after hypothetically exposing that member's docking face in a separate clone.
Retain the real world's state. Rebuild each restored clone's spatial hash;
check occupancy, ordinary geometry and ordinary placement without bypassing gates.
The actual inactive faces are not already receptive: this tests potential
physical contacts, not spontaneous capture under current chemistry.

| selected fixture | matching candidate pairs | geometry passes | unoccupied, admissible placement |
|---|---:|---:|---:|
| square BBBQ, endpoint 114 released | 9 | 1 | member 107 → founder site 2 |
| opposed20 PAAAABB, endpoint 107 released | 21 | 0 | none |

All curved candidates fail the midpoint-gap gate, including cap contacts; some
sites are also occupied. This is only the fork instant, not a statement about
later encounters. Do not force a curved bond or infer that a second contact is
universally available. Continue the prepared test only for the available square pair.

### 59b. Contact constraint versus placement alone

Four matched fixtures run from step 5,316 to 10,316: unchanged; admissible alignment
then immediate bond removal and REPEL restoration; the same alignment with an
ordinary DOCK bond; the same alignment with the existing HOLD state. No manual
displacement, kick, new material or permanent clamp. Existing chemistry controls
later release/melting. All three placement arms have identical initial physical
arrays and RNG within a placement-order comparison. Their bonding/state differs.

There is an ordering sensitivity in `_formBond`: with equal bond counts it moves
the second argument's block. The first prepared assay calls member 107 first,
moving founder 1. The neighbor scan at this saved snapshot lists founder 1 first,
moving member 107 instead. Retain both assays and repeat all four arms in that
observed scan order, reconstructed from spatial cells (not numeric ID sorting).
Both orders pass ordinary geometry and placement. This is a post-hoc control of
the fixture's placement operation, not an independent world or new seed.

| placement order | fixture | physics steps with secondary contact | steps with both contacts | primary returns to site | intact original part settles as / at |
|---|---|---:|---:|---:|---|
| either (identical replay) | unchanged | 0 | 0 | 4 | PAAAABBBQ / 6,714 |
| member first | placement only | 0 | 0 | 4 | PAAAABBBQ / 6,848 |
| member first | ordinary DOCK | 1 | 0 | 3 | PAAAABBBBQ / 7,713 |
| member first | HOLD | 14 | 13 | 3 | PAAAABBBBQ / 6,120 |
| scan order | placement only | 0 | 0 | 4 | PAAAABBBQ / 10,007 |
| scan order | ordinary DOCK | 1 | 0 | 3 | PAAAABBBBQ / 6,473 |
| scan order | HOLD | 14 | 13 | 3 | PAAAABBBBQ / 9,429 |

The original primary site is 3. Both bond-retention fixtures return there at 5,317,
while unchanged and placement-only arms return to site 4 at 5,329. All four original
members remain in each eventual product; every original lateral bond and all 150
blocks survive. Exact output from other parts is retained separately in the raw
records and is not counted as target rescue.

**The rescue survives placement order, but the speed ranking does not.** A
single physics phase under an ordinary contact already suffices in this selected
fixture. A long-lived HOLD contact is not established as superior. With ordinary
DOCK, the primary reattaches after that physics phase and the secondary releases
during chemistry in the same step. Thus there are zero physics phases with both
contacts, despite a successful transfer of attachment. HOLD supplies 13 overlapping
physics phases and melts at 5,330. Do not confuse simultaneous contact in a
bond/chemistry phase with force constraints acting during a physics phase.

HOLD remains an inactive internal state after losing its face in this no-energy
assay. Independent settled-row observation therefore accepts face-free rows
entirely REPEL or HOLD, while SEEK remains unfinished. The extension is explicitly
enabled only for these HOLD fixtures; older analyzers' default remains REPEL-only.
No observer condition feeds into chemistry, and raw stock births remain separate.

### 59c. Natural capture after exposing the available face fails

After the prepared rescue, declare a two-arm follow-up: unchanged versus only
changing member 107 from REPEL to SEEK at 5,316, with no bond, coordinate or RNG
edit. Let ordinary formation act for +5k. This tests a receptive face, not an
autonomous way to choose or activate that face.

| arm | accepted secondary contact | physics phases retaining that contact | primary return | target outcome |
|---|---|---:|---|---|
| unchanged | none | 0 | site 4 at 5,329 | PAAAABBBQ at 6,714 |
| expose face | site 3 at 5,329; breaks in the same step | 0 | site 4 at 5,329 | PAAAABBBQ at 5,823 |

The extra contact forms at the shifted location and undergoes ordinary local
release immediately. It never constrains a subsequent physics phase. Exposure
alone fails the prospective advancement criterion. Do not treat the prepared
contact's effect as evidence that present chemistry can acquire it naturally.

**Verdict/next.** A real supporting bond can causally rescue this selected square
part beyond the effect of placement alone, in either placement order. No fresh
screen or core feature is justified yet. The next candidate is a local contact
handoff: establish support before releasing the old attachment, and allow that
support to persist into a physics phase. Each block may read only its own bonds
and previous-pass states on bonded partner sides. A prepared rescue does not
authorize a correct-site reader, global row coordination or permanent clamp.
The curved fixture lacks an admissible second contact at the tested instant;
availability and the cost of waiting remain open. No constructor universality,
sustained reproduction or evolved machine is demonstrated.

```sh
node experiments/second_contact.js experiments/scratch/SC_selected.json
node experiments/second_contact_exposure.js experiments/scratch/SC_exposure.json
node experiments/second_contact_order.js experiments/scratch/SC_scan_order.json
node experiments/second_contact_summary.js experiments/out/SC_selected.json experiments/out/SC_selected.csv
node experiments/second_contact_summary.js experiments/out/SC_exposure.json experiments/out/SC_exposure.csv
node experiments/second_contact_summary.js experiments/out/SC_scan_order.json experiments/out/SC_scan_order.csv
node experiments/second_contact_test.js
```

**Cost/provenance:** first four fixtures plus unobserved HOLD control, 25k steps,
10.657 CPU seconds; exposure pair plus unobserved exposed control, 15k/4.735;
scan-order fixtures plus unobserved HOLD control, 25k/8.157. Total 65k steps,
23.549 process CPU seconds, at most four workers. Availability clones do not run
simulation steps. Archives retain input/source hashes, full initial/final states,
all candidate probes, ordered bond/state events, raw births, settled members and
1k inventories. CSVs are derived from validated raw records.

Tests check candidate availability, both placement orders, matched physical
controls, pure state-only exposure, eight prepared-arm short observer-neutrality
checks plus full HOLD/exposed controls, event-reconstructed contact lifetimes,
complete 150-block and settled-row inventories, explicit HOLD handling and 20
malformed datasets. Section 57 and 58 analysis tests still pass; all five default
fingerprints match. Core chemistry, physics, viewer and presets are unchanged.

## 60. A local handshake acquires support, but does not beat waiting

**Question.** Can support be acquired before release using only a block's own
state/bonds and previous-pass marks from bonded partner sides? Section 59's
prepared contact worked, but late face exposure did not. Protocol:
`contact_handoff_plan.md`. These are research-only states, not standard knobs.

Replay the two section-58 worlds to one step before the selected release:
square 5,315 and opposed20 28,183. Four identical-state forks each run +5k.
The original 0.0001 endpoint hazard now either releases into SEEK (control) or
enters REQUEST. No ID is read by a reaction; no prepared bond, pose/RNG edit,
kick, geometry override, lateral cut or new material is supplied.

### 60a. The block-local operation

REQUEST retains its face and ordinary DOCK lateral behavior while it has exactly
one lateral bond. It publishes a request only on bonded laterals. A REPEL block
whose face is free reads that mark from the previous derive pass and enters
OFFER: a receptive DOCK face, bonded laterals BONDED, free laterals INERT.

If OFFER's face binds, retained capture enters LATCH, holds its face and
publishes support on bonded laterals. A REQUEST reading that support releases
its own face into SEEK. LATCH returns to ordinary DOCK when it no longer reads
a request. OFFER withdraws if the request disappears; REQUEST returns to ordinary
DOCK if its own face is absent or lateral bond count changes. Ordinary local
release and redocking then apply. No state reads a correct position or sequence.

Two ablations separate waiting, exposure and retention: **wait** never exposes
the neighbor's face; **pulse** lets a captured OFFER immediately run the ordinary
DOCK transition instead of retaining it. Every side mark is derived from its
owner's state/contact and stored separately from the previous-pass array. No
signal propagates through an unbonded side or a second neighbor in one pass.

### 60b. Physical outcomes

| fixture | arm | supporting LATCH physics phases | phases overlapping primary face | original target outcome / absolute step | all new exact / nonexact |
|---|---|---:|---:|---|---:|
| square | seek | 0 | 0 | PAAAABBBQ / 6,714 | 1 / 1 |
| square | wait | 0 | 0 | PAAAABBBBQ / 6,619 | 1 / 0 |
| square | pulse | 0 | 0 | PAAAABBBBQ / 6,048 | 1 / 0 |
| square | hold | 2 | 1 | PAAAABBBBQ / 7,728 | 1 / 0 |
| opposed20 | seek | 0 | 0 | PAAAABBBQ / 28,274 | 0 / 1 |
| opposed20 | wait | 0 | 0 | unfinished PAAAABB / 33,183 | 0 / 0 |
| opposed20 | pulse | 0 | 0 | unfinished PAAAABB / 33,183 | 0 / 0 |
| opposed20 | hold | 0 | 0 | unfinished PAAAABB / 33,183 | 0 / 0 |

The square handoff is autonomous after switching the universal research rule:

- At 5,316 endpoint 114 enters REQUEST while retaining founder site 3.
- At 5,317 its bonded neighbor 107 enters OFFER.
- At 5,318 ordinary formation binds neighbor 107 to site 2; it enters LATCH.
- Physics at 5,319 has both contacts. Endpoint 114 reads support and releases.
- Physics at 5,320 still has the secondary contact. Endpoint 114 returns to
  site 3; the secondary loses its request and releases during chemistry.
- The exact product at 7,728 contains all four original target members.

Thus the protocol closes the acquisition gap left by section 59. But **it does
not establish a useful advantage over waiting**: the wait control lets ordinary
growth finish without releasing the primary face, and completes sooner. The
pulse arm also completes sooner, with no target handoff. Its 519 accepted
OFFER captures across the world release within their capture step; they provide
repeated placements rather than retained physical constraints. It finishes the
window with a separate request/offer pair still unresolved. These are correlated
events within one selected trajectory, not hundreds of independent trials.

In the curved world the request appears at 28,184 and neighbor 111 opens its
face at 28,185. Neither pulse nor hold acquires that face contact within the
window. The primary remains attached and the original seven-member PAAAABB
remains unfinished. Zero erroneous products here is not a fidelity success:
the alternative is no completed product. This is censoring at +5k, not proof
that the request can never resolve.

**Verdict.** One local, contact-mediated handoff now works without forced
placement and preserves exact completion. No efficiency benefit or general
curved registration solution is established. No rate search, additional state,
fresh-seed screen, long confirmation, core feature or preset follows.

**Next bounded question.** Apply the same unmodified handshake to the original
two-prefix obstruction (section 56), alongside unchanged, SEEK and waiting
controls. Require useful exact output and intact original-member reuse beyond
waiting; mere retention or suppression of errors earns nothing. If supporting
contact cannot be acquired usefully there, park handoff rather than add a
whole-part search or global stall detector. Constructor universality and
self-construction remain unshown.

### Reproduction and validation

```sh
node experiments/contact_handoff.js experiments/scratch/CH_selected.json
node experiments/contact_handoff_summary.js experiments/out/CH_selected.json experiments/out/CH_selected.csv
node experiments/contact_handoff_test.js
```

`CH_selected.json` archives initial/final states, current/previous side marks,
ordered bond and state changes with local input marks, raw stock births,
independent settled member sets and five 1k inventories per arm. Primary
completion requires all-REPEL, face-free rows and does not feed back into rules.
All 150 blocks and every original lateral bond reconcile; the analyzer rebuilds
states and bonds step by step and finds exactly the recorded completed rows.
Stock birth counts remain separate from physical completion.

Both continuous prefix replays exactly reproduce section 58's saved states.
Restored one-step replays differ only by the documented cache `pinsVersion`
increment and added research mark arrays; physical arrays and RNG match. Saved
marks are restored explicitly. Eight full unobserved forks equal the observed
final worlds. Eight additional short observer and restart checks pass, including
restart during the square capture. Unit tests check previous-pass latency,
absence of second-hop propagation, contact loss, immediate versus held capture
and signal withdrawal; the analyzer rejects 19 corrupted datasets.

Archived execution: **113,500 steps, 54.156 process CPU seconds**, including
33,500 prefix steps and 40k each of observed and unobserved forks, at most four
workers. Section 57 and 59 analysis regressions and all five 1500-step default
fingerprints pass. Core chemistry, physics, viewer and presets are unchanged;
the full 39-check suite was last run in section 55. Do not load these research
states in the standard viewer.

## 61. Shared products support recipient reproduction in an uncapped ecology

2026-09-26, ROADMAP P1; [prospective plan](recipient_dependence_plan.md).
**Two-seed lead:** removing either mature-product binding or production reduces
absolute recipient-parent output, while producers continue reproducing. This
returns to section 36's viable PY ecology; it does not rescue the failed capped
flexibility setting (46), demonstrate frequency dependence, or establish novelty.

### Controls and locality

The unchanged core at baseline `768e564` runs 1,000 conserved blocks in 40x40:
A/B/C/D 150 each, product 1 300, E 100; three BAAAAB and three BCDDCB founders.
Code A1, shared binding, bare linking 0.01, fraying 0.00003, unzip 1,
lone-monomer undocking 0.1, mutation 0.002. Ordinary body jostling, four solver
passes, square shapes and no corner snapping apply to every arm.

`on` retains production and binding. `noBind` sets pBindP=0. `noSource`
requires the existing translation-start mark from P, absent from the inventory;
`neither` combines both. All other parameters and each seed's initial positions,
corners, states, bonds, types and RNG match. No parts are removed or converted.
The production ablation retains `translate`, `catalysis`, A1 and `bindAny`:
turning translate off would also disable mature binding. It changes coded backs
from TRN to BACK, suppressing construction contacts while retaining mature
binding compatibility. These are population-level interventions, not isolated
per-recipient catalytic effects. The noSource/neither final physical hashes and
RNG match within both seeds, as expected with no products available to bind.
Other arms consume RNG conditionally after intervention, so matching their
initial state does not imply later event-by-event matching.

No reaction, state, type or core knob was added. Existing rules read own state,
incident bonds, bonded-side marks and neighboring immutable type labels; the
start signal uses trs0. Existing cat derivation reads live incident PBIND state,
so this is not a blanket synchronous-side proof. Sequence classes, member IDs,
inventory and follow-up are observation only. Aggregate motion is the accepted
approximation; no geometric advantage or individual-kick robustness is claimed.

### Predeclared screen

Viability seeds 101/102 ran 10k: 8/9 producer-parent births, with 34/38 linked
product units at the end. Both pass. Full product releases were 0/1: those
events alone miss piecemeal production and mature binding. Fresh screen seeds
103/104 then ran all four arms for 50k, with the primary interval (10k,50k].
Classify a length>=2 parent snapshot as producer-potential when it contains AA,
recipient otherwise; one-unit/missing parents remain unknown. The structural
classification stays fixed even in production-disabled worlds.

| arm | recipient-parent births, 103 / 104 | producer-parent births | producer-parent births at recorded gen>=2 | recipient mature bound / armed site-samples |
|---|---:|---:|---:|---|
| production + binding | 18 / 24 | 48 / 58 | 42 / 56 | 1,052 / 12,747; 3,411 / 15,493 |
| no binding | 0 / 1 | 1 / 0 | 0 / 0 | 0 / 1,296; 0 / 8,511 |
| no production | 2 / 1 | 4 / 0 | 1 / 0 | 0 / 1,233; 0 / 2,376 |
| neither | 2 / 1 | 4 / 0 | 1 / 0 | 0 / 1,233; 0 / 2,376 |

Recipient binding contrasts are **+18/+23** births; production contrasts
**+16/+23**. Each passes the predeclared +5 threshold against both ablations,
with at least five producer-parent births, at least one recorded later-generation
producer birth and nonzero recipient occupancy. Recipient occupancy is 8.25/22.02%;
producer occupancy is 54.19/56.31%. Repeated 100-step samples are exposure
measurements, not independent encounters or replicates. Both controls support
an ecological dependence lead, not a claim that recipients are absolutely sterile
without products: bare reproduction remains possible.

### Physical output, variation and sequestration

Stock births are release observations, not a completion oracle. There are 69/83
non-product events in the primary on windows, including 3/1 unknown-parent events.
At logging, 66/79 have every member's F face unbound; 0/2 are already fully TPL.
This distinction was recorded prospectively. The following stricter filter is
a **post-hoc robustness check**, retaining the original primary outcome:

| arm | detached recipient-parent events, 103 / 104 | detached exact recipient output | detached exact producer output |
|---|---:|---:|---:|
| production + binding | 16 / 22 | 15 / 18 | 37 / 47 |
| no binding | 0 / 1 | 0 / 1 | 1 / 0 |
| no production | 2 / 1 | 2 / 1 | 3 / 0 |
| neither | 2 / 1 | 2 / 1 | 3 / 0 |

The direction survives requiring detached output exactly matching reversed parent
snapshots. Across all on events with known parents, 54/67 are exact, 7/9 have
same-length changes, and 5/6 have length changes. These classes do not identify
the physical error mechanism or prove the changed offspring are viable.

For on events old enough for a 5k follow-up, 42/55 and 46/65 retain exactly their
original member order and endpoints at the sampled follow-up; every such intact
row is then fully TPL. Another 14/18 events are age-censored at the horizon.
This is sampled integrity and activation, not continuous survival or a complete
pedigree. Recorded gen>=2 output supports continued reproduction but is stock
bookkeeping, not independent verification of all ancestry after material recycling.

Final inventories (each category counts units; free means unlinked DOCK with
unbound F; unfinished linked means any member still DOCK):

| arm | free letters, 103 / 104 | docked single letters | unfinished linked letters | released linked letters | free products | unfinished linked products | released linked products |
|---|---:|---:|---:|---:|---:|---:|---:|
| production + binding | 387 / 351 | 4 / 4 | 21 / 47 | 188 / 198 | 155 / 137 | 5 / 4 | 140 / 158 |
| no binding | 592 / 583 | 0 / 0 | 0 / 5 | 8 / 12 | 260 / 300 | 2 / 0 | 38 / 0 |
| no production | 587 / 600 | 0 / 0 | 0 / 0 | 13 / 0 | 300 / 300 | 0 / 0 | 0 / 0 |
| neither | 587 / 600 | 0 / 0 | 0 / 0 | 13 / 0 | 300 / 300 | 0 / 0 | 0 / 0 |

One additional product monomer is docked in on seed 104; all other omitted
product-single/other bins are zero. All worlds retain exactly 600 letters,
300 product blocks and 100 energy particles. Released linked inventory can
include mature products bound to letters; it does not mean free-floating material.
More reproduction also sequesters more material, so indefinite persistence is
unproven. No replenishment was used.

### Reproduction, validation and decision

```sh
node experiments/recipient_dependence.js --out experiments/scratch/RD_dependence_viability --seeds 101,102 --arms on --steps 10000 --workers 2
node experiments/recipient_dependence.js --out experiments/scratch/RD_dependence_screen --seeds 103,104 --arms on,noBind,noSource,neither --steps 50000 --workers 4
node experiments/recipient_dependence_summary.js experiments/out/RD_dependence_viability 0
node experiments/recipient_dependence_summary.js experiments/out/RD_dependence_screen
node experiments/recipient_dependence_test.js
node experiments/recipient_dependence_analysis_test.js
node test.js --match="^(translate:|bindAny:|transStart:)"
node tools/fingerprint.js 1500
```

Both prefixes are archived in out with `.runs.jsonl` and `.manifest.json`:
raw births, member follow-ups, all 100-step inventories/occupancy counts, final
restart states, exact launch commands, parameters and source/input hashes.
Path-specific Git attributes preserve the new hashed runner/plan's LF bytes;
the unchanged engine hash records this checkout's existing CRLF bytes.
The analyzer rejects missing/duplicate runs or samples, changed parameters,
inconsistent birth/member counts, invalid inventories and incomplete manifests;
it reconciles final samples against reconstructed final states. Observer neutrality
compares complete saved arrays/counters and RNG; restart and mature-binding
controls pass. Start-mark propagation and withdrawal are checked per derive pass.

Ten assay runs, **420,000 steps and 795.203 process CPU seconds**: viability
29.734, screen 765.469, at most four workers and no overlapping simulation-test
queue. No deviations to rates, seeds, horizon or primary thresholds. Core,
viewer and historical assay sources remain unchanged. The full 39-check suite
is not required for this observer-only assay; focused checks and fingerprints
are used instead. Both new test scripts and all three selected core checks
pass; the five 1500-step fingerprints match the audit baseline exactly.

**Decision:** P1 advances to a causal reproductive-effect lead under existing
rules. Confirm the unchanged four-arm comparison at 50k in four fresh seeds
(105–108) before frequency competition. Require recipient benefit across fresh
worlds and continuing producer reproduction; a failed confirmation parks this
setting without rate tuning or new states. This does not establish a heritable
advantage, frequency dependence, sustained ecological closure or evolved complexity.

## 62. Fresh recipient-dependence confirmation fails its consistency gate

2026-09-26, ROADMAP P1; [prospective confirmation plan](recipient_confirmation_plan.md).
**Negative confirmation decision:** two of four fresh seeds meet all criteria.
The mean recipient effect remains positive, but one seed reverses the binding
contrast and another misses the minimum effect. Park this setting for advancement
to frequency competition. This does not erase the successful worlds or prove
that shared products have no benefit.

### Frozen comparison and outcome

The section-61 runner, observer, rules, parameters and original plan are
byte-identical. Seeds 105–108 each run on/noBind/noSource/neither for 50k;
the primary window remains (10k,50k]. There are 1,000 fixed blocks, identical
initial material/poses within each seed, body jostling and four solver passes.
Production is disabled with absent-P translation initiation; binding is disabled
with pBindP=0. The ablations' construction/contact effects and the live cat-side
read remain as described in 61. No new mechanism or signal is introduced.

Before launch, `.protocol.json` froze the seed/arm matrix, criteria, timestamp,
baseline commit `71042ca` and hashes of the unchanged sources, new plan and
confirmation analyzer. Every fresh seed had to retain the original +5-birth
advantage against both ablations, >=5 producer-parent births, >=1 recorded
later-generation producer birth, and nonzero recipient occupancy. The detached
exact recipient advantage, post-hoc in 61, was an additional prospective guard
here. Neither earlier screen seed enters this decision. No seed was replaced,
no horizon extended, and all 16 runs finished.

All counts below are in seed order **105 / 106 / 107 / 108**. Parent snapshots
with AA are producer-potential; other length>=2 parents are recipients. Missing
or one-unit parents remain unknown, including 3/1/4/2 in the on arm.

| arm | recipient-parent births | producer-parent births | detached exact recipient output |
|---|---:|---:|---:|
| production + binding | 24 / 4 / 23 / 8 | 49 / 56 / 53 / 55 | 22 / 2 / 21 / 7 |
| no binding | 8 / 5 / 1 / 4 | 1 / 2 / 3 / 0 | 5 / 4 / 1 / 3 |
| no production | 3 / 1 / 2 / 4 | 1 / 0 / 5 / 0 | 3 / 1 / 2 / 4 |
| neither | 3 / 1 / 2 / 4 | 1 / 0 / 5 / 0 | 3 / 1 / 2 / 4 |

| seed | binding effect | production effect | detached exact binding effect | detached exact production effect | decision |
|---|---:|---:|---:|---:|---|
| 105 | +16 | +21 | +17 | +19 | passes |
| 106 | -1 | +3 | -2 | +1 | fails both +5 thresholds and detached binding advantage |
| 107 | +22 | +21 | +20 | +19 | passes |
| 108 | +4 | +4 | +4 | +3 | positive direction, below both +5 thresholds |

Equal-weight fresh-seed means are 14.75 recipient-parent births on, 4.5 without
binding and 2.5 without production: mean effects +10.25 and +12.25. Three of four
worlds have positive effects against both controls. Those observations do not
satisfy the predeclared all-four confirmation requirement; no significance claim
is made from the many correlated contacts or pooled birth events.

All four on worlds pass the producer and occupancy conditions. Producer-parent
output at recorded gen>=2 is 39/56/44/47. Thus the failed recipient effect is
not accompanied by donor collapse over the measured window. In seed 106,
recipient occupancy is only **17/3,053 armed-site samples (0.56%)**, versus
3,109/16,593 (18.74%), 3,203/12,573 (25.48%) and 728/9,482 (7.68%) in the other
on worlds. This identifies low observed recipient binding, not its cause:
encounters, delivery, recipient loss and competition were not separately ablated.
No rate or identity-aware recognition change follows this observation.

### Physical output and material

The on arm records 76/61/80/65 non-product releases in the primary interval;
74/58/78/64 have all member F faces unbound at logging. None are fully TPL at
that instant. Known-parent exact copies number 65/54/66/54, same-length changes
6/2/7/8 and length changes 2/4/3/1. Variation is retained and classified; this is
not a claim that every altered row remains viable.

At the first sample at least 5k after release, **54/63, 35/52, 46/65 and 40/55**
eligible on rows retain their original members/order/endpoints; every such row
is fully TPL. Another 13/9/15/10 releases are age-censored. These are sampled
integrity/activation measurements, not continuous survival or a verified pedigree
through recycling. Stock generations alone do not establish reproductive closure.

| on seed | free letters | docked single letters | unfinished linked letters | released linked letters | free products | docked single products | unfinished linked products | released linked products |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| 105 | 302 | 7 | 59 | 232 | 137 | 2 | 2 | 159 |
| 106 | 412 | 5 | 29 | 154 | 177 | 1 | 4 | 118 |
| 107 | 350 | 6 | 44 | 200 | 142 | 2 | 4 | 152 |
| 108 | 411 | 2 | 28 | 159 | 163 | 0 | 4 | 133 |

The archived report gives the same inventory for every control, together with
all occupancy denominators. All 8,000 sampled inventories conserve 600 letters,
300 product units and 100 energy particles. Production-off worlds retain all
300 products as free monomers; their neither controls match final physical state
and RNG exactly in all four seeds. Other arms diverge after conditional RNG use.
Released linked product inventory can include bound mature material, and no
claim of free circulation or indefinitely sustainable turnover is made.

### Reproduction, validation and disposition

```sh
node experiments/recipient_confirmation_summary.js --prepare experiments/scratch/RD_dependence_confirm
node experiments/recipient_dependence.js --out experiments/scratch/RD_dependence_confirm --seeds 105,106,107,108 --arms on,noBind,noSource,neither --steps 50000 --workers 4
node experiments/recipient_confirmation_summary.js experiments/out/RD_dependence_confirm
node experiments/recipient_confirmation_test.js
node experiments/recipient_dependence_analysis_test.js
node tools/fingerprint.js 1500
```

Archive: `out/RD_dependence_confirm.{protocol.json,manifest.json,runs.jsonl,summary.txt}`.
It retains all raw births, member follow-ups, 100-step samples, final states,
parameters, launch command and source hashes. The analyzer verifies that the
protocol precedes launch and its sources/specification are unchanged, then
validates the complete 16-world matrix and reconstructs each final state.
Boundary fixtures reject changed criteria, missing/duplicate/old seeds, late
protocols, incomplete batches, source changes and detached-output failures.

Cost: **800,000 steps, 1,673.093 process CPU seconds**, four workers at most,
below the declared 3,600-second ceiling. No outcome-dependent stopping. Both
analysis test scripts pass; all five default fingerprints match the audit baseline.
The section-61 observer/restart/local-signal tests and three core regressions
were not rerun because their simulation/observer sources did not change. The
full physics suite was not rerun. Core, viewer and historical evidence are intact.

**Decision:** park this uncapped setting for frequency competition and retain
the operation/evidence library. The two-stage P1 exercise improves causal
evidence but does not advance beyond autonomous interaction on the audit ladder;
reliable recipient benefit under the stated confirmation criterion remains unmet.
Choose **P2 next**, as already ranked: a bounded material-budget derivation and
candidate block-level table for two or three organizations, including recycling
and simpler resource-free competitors, before implementing a new mechanism.
P4's heredity discrimination is an independent fallback; P3 still needs net
reproductive benefit rather than another uptake/fit result. Reopen this P1
setting only with independent evidence of a distinct causal bottleneck, not
another rate sweep, more confirmation seeds or an easier retrospective threshold.

## 63. Resource-economy derivation: gross savings, unresolved renewal advantage

2026-09-26, ROADMAP P2, baseline `19cd4e6`. Analytical assay under the
[fixed plan](resource_economy_plan.md), with the full block-level contract and
derivation in [resource_economy_derivation.md](resource_economy_derivation.md).
No simulator, observer, physics, core state or default changed. No world seeds
or simulation workers. The source reference, inspected figures and encoding
are recorded in the derivation; this section reports our calculations.

### Enumeration and material accounting

The fixed twelve-type table 670873 has **122 cycles across all 1,020 boundary
states** at interior widths n=1..8, with no transients. Every cycle uses T1 and
B1; treating T0 or B0 as scarce instead admits a zero-use cycle at odd n.
Independent parity/rotation algebra agrees with every decoded transition.
This is exhaustive only for the stated ideal ribbon patterns, not for rotated,
malformed or zero-interior-row physical competitors.

For the minimum-T1-use cycle at each of the first three widths:

| n | Columns per repeat | T1 per repeat | Gross T1 per 3 columns | Blocks in retained 3-column strip | Internal contacts | Bond losses for separation | Net retained T1 per strip across cut alignments |
|---|---:|---:|---:|---:|---:|---:|---|
| 1 | 6 | 1 | 1/2 | 5 | 6 | 6 | 1/2, 1/2, 0 |
| 2 | 8 | 1 | 3/8 | 8 | 11 | 7 | 1/4 in all three |
| 3 | 10 | 1 | 3/10 | 11 | 16 | 8 | 1/5 in all three |

Calling a full repeat a child gives one scarce part per child at every width.
Two-column growth increments have a one-contact boundary overhang; removing
it leaves no two-contact restart site. They cannot be counted as independently
renewing output under the assumed retention criterion. Three-column strips
have minimum contact degree two and growth sites on both ends in the ideal
graph. Reversible local port constraints support either direction. No physical
retention, collision, deformation or growth-rate measurement was performed.

Adding three columns costs 6/9/12 blocks and 12/18/24 contact formations.
Separating two three-column strips returns one straddling boundary block after
four incident losses, plus n interior and one boundary-to-boundary bond loss.
All retained parts keep at least two contacts along this particular sequence.
The program validates the material and contact balance by independently
constructing and partitioning periodic contact graphs. This is an existence
path, not a reaction that chooses a cut or evidence of its probability.

The returned boundary part matters: one alignment of the narrow pattern returns
every T1, whereas the wider examples retain some. The narrow fragments still
need T1 during subsequent growth; they are not a zero-scarce-inventory growing
cycle. Uniform cut alignment would restore a decreasing *average* retention
cost, but no dynamics here establishes that distribution or complete recycling.
Prescribed cuts or phase-sensitive hazards would violate this assay's intent.

Finite-stock bounds use four T1 and the same C copies of each common type for
every candidate. With C=12 (136 total blocks), complete-repeat count vectors
fit **24/24/10 columns** at n=1/2/3; with C=48 (532 total), **24/32/40**.
These packing bounds include all material, including any founder allocation;
they do not count births. The archive lists each of the twelve demands and
remainders. Nothing is replenished or converted. No-recycling packing and
ideal full-return partitions bound bookkeeping, not turnover times or fitness.

### Reproduction and checks

```sh
node experiments/resource_economy_test.js
node experiments/resource_economy.js experiments/scratch/RE_670873_20260926
node experiments/resource_economy_test.js experiments/out/RE_670873_20260926.json
node tools/ledger_index.js
```

Archive: `out/RE_670873_20260926.{json,txt}`. The JSON retains every cycle's
states and twelve-type counts, edge sequence, all three cut phases, finite
stock vectors, source/plan/test hashes, exact command and input. The runner
refuses an existing output stem. Enumeration/archive cost: **0.031 process CPU
seconds**; no outcome-dependent stopping, incomplete or zero runs suppressed.
The CPU figure excludes development, tests, source reading and rendering.

Tests pass for all decoded transitions against independent algebra, state-space
coverage, direct cut graphs, both exposed ends, conservation, finite-stock
maximality and replay of the archive with hash checks. During validation, a
proposed assertion that a two-column strip without its overhang had degree one
was rejected: it actually has degree two but no cooperative restart site. The
corrected distinction is retained above. No simulator or hashed historical
source changed. The full physics suite is inapplicable and was not run; default
fingerprints were not rerun for this analytical-only change.

### Decision and portfolio checkpoint

**Bounded derivation complete; physical/renewal gate incomplete.** A fixed local
palette can exhibit a conditional gross-material trade-off. The three-column
contact path identifies a concrete possible renewal operation, but larger
organization also costs more parts and cut contacts. Scarce fraction alone
does not establish reduced consumption per independent offspring, especially
when the narrow pattern can return its scarce parts. No new inherited function,
autonomous physical renewal, sustained advantage or evolved complexity is shown.

Hold implementation. A future P2 fixture must jointly measure growth, naturally
released active fragments and trapped/returned material under generic incident
bond losses, including the narrow recycling competitor, then apply P0 to any
promising mechanical effect. Selected cuts are calibration only. Do not add
states to force the desired phase or impose a lattice/whole-pattern operation.

After the P1 screen and failed confirmation (61–62), this analysis completes
the next bounded alternative. **Choose P4's existing random-chemistry heredity
discrimination next**, before the twelve-type geometry/kinetics investment.
P3 still needs inherited reproductive benefit beyond fit or capture. This
portfolio decision preserves the P2 theoretical lead and its explicit gaps;
it does not conclude that resource-based selection is impossible.

## 64. Exact-structure heredity screen for random chemistry table 55

2026-09-26, ROADMAP P4, baseline `0f2dbed`; [prospective plan](random_heredity_plan.md).
This closes one of section 32's missing discrimination tests. Recurrence and
three-round graph hashes alone cannot distinguish copying from repeated
self-assembly. No chemistry or simulator source changes were made.

### Recovery, controls and the measured outcome

All six archived candidate parameter vectors (55,57,4,15,1,54) match `drawR`.
The protocol stores their explicit generated tables and hashes. Only table 55,
first in the existing queue, was run. The historical base engine used 16 solver
passes and lacked body jostling; these new runs use the current accepted physics:
`bodyJostle=true`, `iters=4`, `snapCorners=true`, 25x25, 300 conserved blocks.
They are not exact replays of the historical trajectories.

Recovering table 55 at seed 1 for 30k steps, with 5k samples, identifies two
four-block chains of equal composition (two type-0 and two type-1 blocks):
V0 has type order ABBA, V1 AABB up to reversal. Their particular local side
connections also differ and are part of the exact target definitions. V0/V1
have 13/3 total sampled occurrences, including the final sample. The pair is
selected by the fixed ranking, not by its subsequent transplant performance.
The archive contains actual corner offsets, orientations, states and bonds.

The positive control is unchanged `copyTable(0.00003,0.01)`, `rBreak=0.000005`,
150 each A/B. Prepared AAB and ABA trimers have identical type inventories;
each target includes its reversed copy orientation. For random targets, side
numbers remain exact. Neither internal-state switching nor global rotation
creates a new structural identity. Canonical rooted traversals encode the
entire labelled graph, rather than accepting a finite-round hash match.

Four prepared founders use existing free blocks in each seeded bath. Disrupted
controls have exactly the same members, positions, corners, orientations and
states, with only their bonds removed before the run. Plain baths retain their
original arrangement. All three conserve identical type counts. Initial actual
polygon overlaps are recorded; preparation changes geometry relative to plain,
and disrupted controls share that preparation. Subsequent conditional RNG use
can diverge: this is initial matching, not event-by-event pairing.

The two control variants pass the seed-201 10k viability check: 38/42 distinct
founder-disjoint target member sets, of which 35/38 persist for at least 100
steps. The screen then runs both tables, both variants, fresh bath seeds
202/203, three arms, 50k steps each. Plain runs repeated under the two variant
labels must have identical physical final states and RNG; the analyzer checks this.

Primary output is the number of distinct founder-disjoint target member sets
that remain a detached exact component continuously for at least 100 steps.
Any incident bond event interrupts persistence, even if attachment and release
occur within one step. Reappearance of the same members is deduplicated. These
are distinct member sets, not necessarily mutually disjoint material or new
pedigrees; the report also gives distinct participating blocks and final standing
targets. Founder material stays excluded even if it later recycles. Opposite
variant output is recorded in every world.

A renewal contact witness requires an already persistent new target to contact
material of a later persistent, member-disjoint target of the same variant,
before the latter separates. This is necessary exposure evidence, not sufficient
proof of copying or a parent-child relationship. No IDs, signatures, membership
or ancestry enter a reaction. The fixed screen gate requires >=3 extra persistent
outputs above each control and at least one witness in both variants and both
bath seeds. No physical advantage or evolved novelty follows from passing it alone.

### Outcome

| Table / target | Bath seed | Seeded persistent new targets | Disrupted | Plain | Renewal contact witnesses in seeded | Fixed case gate |
|---|---:|---:|---:|---:|---:|---|
| copy / AAB | 202 | 24 | 0 | 0 | 2 | pass |
| copy / AAB | 203 | 23 | 0 | 0 | 5 | pass |
| copy / ABA | 202 | 50 | 0 | 0 | 11 | pass |
| copy / ABA | 203 | 38 | 0 | 0 | 7 | pass |
| 55 / V0 | 202 | 8 | 10 | 5 | 0 | fail |
| 55 / V0 | 203 | 3 | 3 | 8 | 0 | fail |
| 55 / V1 | 202 | 0 | 0 | 1 | 0 | fail |
| 55 / V1 | 203 | 0 | 2 | 0 | 0 | fail |

**Table 55 fails all four cases; the positive control passes all four.** The
V0 effects against disruption are -2/0 and against plain +3/-5. V1 produces
no new persistent own-variant structures in either seeded bath, while 7/6
persistent V0 member sets appear there. V0-seeded worlds also produce one V1
each. No table-55 arm supplies a renewal contact witness. All eight V1 founders
reach a 100-step intact episode, so the V1 result is not simply inability of
the prepared organization to survive the persistence criterion.

This supports recurrence and a preference for some structures over the tested
variant-specific inheritance hypothesis. It does not establish a unique
equilibrium, prove that table 55 has no other heritable organization, or reject
the other random tables. There are only two independent bath seeds per contrast;
repeated contacts and member sets are not additional replicates.

The copying control establishes sensitivity to designed copying under the same
observation rules. It is not evidence of indefinite exact-population maintenance:
at 50k its four seeded worlds have only 0/1/1/1 standing persistent new targets,
with 5/1/2/2 free blocks and largest components of 17/15/16/13. Its disrupted
and plain controls finish with all 300 blocks free. Most material in seeded
controls is therefore in other structures or attached complexes, consistent
with the old fragment/assembly problem rather than an indefinitely sustained
target population. New qualifying targets do still appear after 30k in every
seeded control. Off-target persistent output is 0/1 for AAB-seeded worlds and
1/0 for ABA-seeded worlds; the assay does not erase variation.

Table-55 worlds finish with 57–79 free blocks, 221–243 bonded blocks and largest
components of 11–28. The archive gives every arm's inventory. All 1k samples
conserve 100/100/100 blocks for table 55 or 150/150 for copyTable. Actual polygon
SAT finds 64 initially overlapping pairs in each plain bath and 72–82 in the
prepared screen baths; seeded/disrupted values match exactly. These overlaps
are preparation and bath-packing effects, not new material, and are left for
the unchanged physics to resolve. They limit comparison to these preparations.

### Reproduction and validation

```sh
node experiments/random_heredity_test.js
node experiments/random_heredity.js prepare experiments/scratch/RH_20260926
node experiments/random_heredity.js recover experiments/scratch/RH_20260926
node experiments/random_heredity.js calibrate experiments/scratch/RH_20260926
node experiments/random_heredity.js screen experiments/scratch/RH_20260926
node experiments/random_heredity_summary.js experiments/out/RH_20260926
node experiments/random_heredity_analysis_test.js experiments/out/RH_20260926
node tools/fingerprint.js 1500
node test.js --match='mass is conserved|determinism'
node tools/ledger_index.js
```

Archive: `out/RH_20260926.*` includes the prospective protocol, recovery samples
and selected captures, launch manifests, all 26 complete world records, summary
and file-hash index. Each world retains initial/final RChem states, every actual
bond event, target episodes with member IDs and observed internal states,
inventories and process CPU time. Explicit tables and effective parameters are
saved; replay with RChem, not the default Sim class. Output stems refuse reuse.

Cost: **1,250,000 simulation steps, 796.719 process CPU seconds** (30k recovery,
20k calibration, 1.2M screen), two assay workers, below the 3,600-second budget.
No runs are incomplete, skipped, zero-suppressed or budget-censored. Verification
cost is separate: the two core tests use 43.91 and 10.08 CPU seconds; source
inspection, observer tests, fingerprints and bond replay are not included in
the assay CPU figure. At most four simulation processes ran at once when the
two independent core/fingerprint checks accompanied the two assay workers.

The analyzer reconstructs every bond and target episode from initial conditions
and the raw bond history, confirms final bonds/types, checks all inventories,
recomputes counts/witnesses and validates the full matrix against the frozen
protocol. Tests reject altered events, inflated counts, missing cases, absent
witnesses, subthreshold differences and censored runs. Exact identity tests
cover reordered IDs, state changes and the control's reversal convention;
member reuse and same-step attachment/release do not inflate persistence.

Observer neutrality passes for both tables, including all typed arrays and RNG.
RChem restart matches physical arrays, counters and RNG; rebuilding the pin
cache increments `pinsVersion`, which is explicitly excluded from restart
equality as cache bookkeeping. It is not a physical discrepancy. Both selected
core tests pass, and all five default fingerprints match the audit baseline.
The full 39-test physics suite was not rerun; core and historical hashed sources
are byte-unchanged. No positive new mechanical claim requires a P0 sensitivity
batch from these negative random-table results.

### Disposition

Park this table-55 pair: no rate tuning, longer run, extra seeds or new states
to rescue it. The previously unclosed recurrence-versus-heredity question now
has a negative two-variant screen for this pair and a working positive control.
No unengineered reproductive closure or inherited benefit is established.

One additional already-listed candidate is a reasonable bounded next test:
recover **table 57**, first checking whether it supplies two distinct persistent
structures of equal composition. Reuse the exact-graph and disrupted/plain
controls, with a new prospective protocol; do not manufacture a second variant
or resume the unfinished 69-table search. If this independent candidate cannot
advance heredity evidence, reassess P4 against P3 before testing more tables.
P2 still lacks physical turnover advantage and P1 remains parked; neither
negative result justifies adding mechanisms to the core.

## 65. Table 57: a second bounded random-chemistry heredity test

2026-09-26, ROADMAP P4, baseline `50b147e`;
[prospective plan](random_57_plan.md). Section 64's table-55 pair failed its
screen while the designed copying control passed. This assay uses only the
next already-listed table, 57. No broad random-table search, rule change or
simulator modification is made. All historical hashed assay sources remain
unchanged; the new launcher reuses the section-64 worker and bond-history validator.

### Persistent-variant prerequisite

`drawR(57)` and its full generated table match the parameters and table archived
in the section-64 protocol. A 30k recovery at bath seed 1 uses the same current
physics: body jostling, four solver passes, snapped corners, 25x25, 150 A and
150 B. As in section 64, this is not historical trajectory replication.

Six 5k catalogs rank exact type-and-side graphs of 3–10 blocks by accumulated
occurrence and canonical string. A final 100-step observed interval requires
the same isolated members and topology, with no incident bond event. Internal
state changes alone do not change structural identity. Final structures and
all failed persistence candidates are retained. The pair selection is an
experimenter operation; no simulation rule reads these classifications.

There are ten final structural signatures, nine with a qualifying persistent
member set. The first eligible equal-composition pair consists of **two BBB
trimers**. V0 links R-to-F twice; V1 has a central B linked F-to-F and K-to-F.
They therefore differ in local side connectivity, even though their unlabelled
three-node graphs and type inventories agree. V0's captured internal states
are 1/1/1, V1's 0/1/1; the target definitions do not require those states.
The actual corner offsets and orientations are captured from surviving members.

| Selected variant | Total occurrences in six snapshots | Final count | Member sets intact through final 100 steps |
|---|---:|---:|---:|
| V0 | 8 | 1 | 1 |
| V1 | 3 | 2 | 2 |

Occurrences across snapshots in this one recovery world are not independent
samples. The selected pair is chosen before transplant outcomes; neither the
ranking nor the persistence requirement is relaxed. Both observed and
unobserved replay of the saved final window reproduce physical arrays and RNG.

### Calibration and fixed screen

Four prepared founders per world consume existing free blocks. Bath seed 204,
10k, tests both random variants and the unchanged AAB/ABA copying controls.
The random variants need at least two original founder sets to attain an intact
100-step episode; controls need at least one persistent founder-disjoint target.
All four pass:

| Calibration target | Founders with a 100-step episode | Persistent new own-target member sets |
|---|---:|---:|
| copy AAB | 2/4 | 38 |
| copy ABA | 3/4 | 39 |
| table 57 V0 | 2/4 | 11 |
| table 57 V1 | 4/4 | 1 |

The random calibration counts alone do not distinguish copying from spontaneous
assembly. The screen uses fresh bath seeds 205/206, 50k, both variants, both
tables, and seeded/disrupted/plain arms: 24 worlds. Seeded and disrupted arms
have identical initial members, positions, corners, orientations and internal
states; disruption removes only founder bonds. All counts and types are fixed.
Plain baths keep their original initial arrangement. Initial physical overlaps
are recorded, and comparisons are limited to these preparations.

The primary metric and decision rule are unchanged from section 64: distinct
founder-disjoint exact target member sets persisting >=100 steps, with a >=3
seeded advantage above each control in both variants and both bath seeds, plus
at least one same-variant renewal contact witness per seeded case. Any incident
bond change interrupts persistence, including same-step binding and release.
Member-set reappearance is deduplicated; the first qualifying target assignment
is retained if the same material later changes topology. Witnesses use the first
qualifying episodes and are conservative exposure evidence, not full pedigrees.
All episodes, off-target signatures and contact histories remain in the archive.
Only two bath seeds are independent samples per contrast.

### Outcome

Counts are cumulative persistent new own-target member sets. Witnesses are
same-variant renewal contact witnesses in the seeded arm.

| Table / target | Bath seed | Seeded | Disrupted | Plain | Witnesses | Fixed gate |
|---|---:|---:|---:|---:|---:|---|
| copy AAB | 205 | 31 | 0 | 0 | 3 | pass |
| copy AAB | 206 | 13 | 0 | 0 | 2 | pass |
| copy ABA | 205 | 48 | 0 | 0 | 10 | pass |
| copy ABA | 206 | 42 | 0 | 0 | 2 | pass |
| table 57 V0 | 205 | 37 | 31 | 64 | 1 | fail |
| table 57 V0 | 206 | 34 | 49 | 40 | 7 | fail |
| table 57 V1 | 205 | 8 | 2 | 7 | 0 | fail |
| table 57 V1 | 206 | 2 | 2 | 5 | 0 | fail |

**Table 57 fails all four cases; the copying control passes all four.** V0
produces fewer targets than the plain bath in both seeds. V1 has a partial
seeding effect in 205 (+6 above disrupted, +1 above plain), but misses the
predeclared +3 plain threshold and has no qualifying renewal witness. Seed
206 has no advantage above disrupted and is below plain. Do not erase the
partial effect or promote it after changing the gate.

Random-table contact witnesses all concern V0. Plain baths also supply four
witnesses in 205 and one in 206, with identical results in the duplicate plain
jobs. Thus repeated exact structures and contact witnesses can arise without
prepared founders. Witnesses alone cannot establish causal descent. V1-seeded
worlds also make 25/24 persistent V0 member sets; these are off-target output,
not transmission of V1. No two-variant inherited reproductive benefit is shown.

All worlds retain 150 A and 150 B. Random screen worlds end with 95–121 free
blocks (179–205 bonded), largest components of 4–6 blocks. This is not a
large-component sequestration result. Copying seeded worlds finish with only
0–2 free blocks and 0–2 standing persistent own-target structures: their
cumulative output does not prove indefinite population renewal either.
Initial random-world overlap counts are 62–65 in seeded/disrupted preparations
and 51 in plain baths; preparation geometry limits interpretation of the plain
contrast. No mid-run intervention changes geometry or material.

### Reproduction, validation and cost

The archive is `experiments/out/R57_20260926.*`: recovery and screen protocols,
captured states, full bond histories, both job manifests, all 28 calibration and
screen worlds, and machine-readable/text summaries. Its separate archive index
records the SHA-256 of each evidence file. Protocols freeze source/input hashes,
seeds, parameters and the actual invocation arguments. Historical assay sources
and the core remain unchanged.

```sh
node experiments/random_57_test.js
node experiments/random_57_screen_test.js
node experiments/random_57.js prepare experiments/scratch/R57_20260926
node experiments/random_57.js recover experiments/scratch/R57_20260926
node experiments/random_57.js validate experiments/scratch/R57_20260926
node experiments/random_57_screen.js prepare experiments/scratch/R57_20260926
node experiments/random_57_screen.js calibrate experiments/scratch/R57_20260926
node experiments/random_57_screen.js screen experiments/scratch/R57_20260926
node experiments/random_57_screen.js summary experiments/scratch/R57_20260926 experiments/scratch/R57_20260926.summary
node experiments/random_57_screen.js summary experiments/out/R57_20260926
node tools/fingerprint.js 1500
```

Use a fresh output stem for new runs; launchers reject existing outputs. Tests
cover ranking, equal composition, distinct structures, interrupted persistence,
the 99/100-step boundary, calibration, censoring and gate/matrix validation.
Complete bond-history replay verifies every world's inventory, bonds and target
episodes, and checks matched preparations and duplicate plain outcomes. Recovery
replay verifies observer neutrality of physical arrays and RNG. Both new test
suites pass; all five 1500-step default fingerprints match the baseline. The
full core invariant suite was not rerun because core rules are unchanged.

Total cost is **1,270,000 steps and 769.351 process CPU seconds**: recovery
30k/15.984 s, calibration 40k/35.361 s, screen 1.2M/718.006 s. All 28 worlds
complete without censoring or skipped jobs. Two assay workers run concurrently;
the fingerprint check brings the maximum to three simulation processes. Cost
excludes analysis, tests and fingerprints, and is not shared-machine wall time.

### Portfolio decision

Park both tested random-table pairs and further candidate screening. Sections
64–65 do not rule out heredity in every random chemistry, but they do not earn
another unguided candidate. Reopening P4 needs a distinct, evidence-backed
mechanism or discriminator. Preserve the exact-observation library and failures.

**P3 is next:** compare equal-composition arrangements using existing geometry,
fuel and turnover rules, measuring released, rearmed offspring that themselves
reproduce. Fix preparations and an early viability gate before running. Uptake
alone is insufficient; neither added states nor further rate tuning is a rescue.
P2 still requires physical turnover evidence, and P1's failed confirmation remains
parked. These are prepared-function tests, not claims of evolved complexity.

## 66. Equal-composition arrangements renew descendants, but miss the fixed benefit gate

**2026-09-27, ROADMAP P3.** `sequence_shape_plan.md` fixes a comparison of
AAAABBBB and ABABABAB under existing complementary copying, fuel and turnover.
No new reaction, state, type or physics mechanism is introduced. Each 18×18 world
contains 60 A, 60 B and 40 U (size 1.2), with four prepared eight-unit rows.
Founders start **active**; offspring must acquire fuel normally. Unlike section
50's inactive bootstrap and section 51's late intervention, slow turnover
(`pFray=0.00003,pUnzip=1`) operates from time zero. Other relevant settings are
`pUndock=0.1,pSoft=0,pReloadU=0.002`, stiffness 0.5, body jostling and four passes.

Cross both sequences with square/opposed20 (-20/+20 degrees) and `pGrip=0.2/0`.
Grip-off controls retain all fuel material. Same-seed arms share bath generation
and composition, but seed arrangement and conditional RNG consumption differ;
later contacts are not event-matched. The independent replicate is the world.

### Measurement and viability

The observer captures each unit's physical parent when it releases. An exact
lineage requires the reversed-complement sequence, reverse member mapping to
one still-intact parent, disjoint child material, and all child face bonds free
at its logged birth. A row is retired at its first fray or actual letter-lateral
bond edit; reusing its block IDs cannot restore its identity. Primary outcome:
distinct exact offspring that fully rearm and produce an exact detached child
before retirement. Stock generation numbers and parent strings do not define it.
Full arming can precede whole-row birth. The full-face-detachment criterion is
conservative: it can exclude a row already recruiting material on its own face,
as well as a row retaining an old attachment. Those cases are not called deaths.

The first pilot had a measurement defect: the observer treated a fuel particle's
L/R contact to a letter's K side as a lateral edit to the letter. Dynamics were
unchanged, but parent lifetimes and lineage counts were invalid. The rejected
four 20k records, manifest and exact source remain in
`out/SS_observer_rejected_20260927/`. After checking each endpoint's type and side,
a regression fixture covers both link orientations and unbinding. Rerunning
the same four worlds gives exactly the same final physical-state hashes.
This correction is not another independent sample or a biological gate failure.

Corrected viability seeds 201/202, opposed20/grip-on, 20k: AAAABBBB produces
2/3 exact founder children and ABABABAB 9/9. Both pass the prospective initial
copying gate; none has a fully rearmed exact offspring by 20k. Proceed with fresh
seeds 203/204, all eight arms, 100k. No rate, horizon or threshold is retuned.

### Fresh screen

Paired entries below are **203 / 204**. Exact output includes all observed depths
of the original exact lineage; second-cycle output has depth at least two.
Unfinished inventory counts letters in linked, unregistered rows containing a
docked unit at 100k. All 120 letters reconcile in every 100-step snapshot.

| arrangement | shape / grip | all births | exact lineage output | reproducing rearmed offspring (primary) | second-cycle output | unfinished letters |
|---|---|---:|---:|---:|---:|---:|
| AAAABBBB | square / on | 68 / 66 | 14 / 11 | 1 / 1 | 2 / 3 | 16 / 15 |
| AAAABBBB | square / off | 33 / 48 | 4 / 8 | 0 / 0 | 0 / 0 | 0 / 0 |
| AAAABBBB | opposed20 / on | 68 / 55 | 11 / 2 | 2 / 0 | 3 / 0 | 5 / 20 |
| AAAABBBB | opposed20 / off | 30 / 37 | 16 / 9 | 0 / 0 | 0 / 0 | 0 / 0 |
| ABABABAB | square / on | 74 / 84 | 11 / 12 | 0 / 0 | 0 / 0 | 23 / 25 |
| ABABABAB | square / off | 22 / 40 | 12 / 17 | 0 / 0 | 0 / 0 | 0 / 0 |
| ABABABAB | opposed20 / on | 56 / 58 | 14 / 15 | 3 / 3 | 4 / 6 | 17 / 39 |
| ABABABAB | opposed20 / off | 12 / 15 | 7 / 8 | 0 / 0 | 0 / 0 | 0 / 0 |

ABABABAB reaches exact lineage depth three in both opposed20/grip-on worlds:
two depth-three births in 203, one in 204. All six productive parents in those
worlds were born by 50k; this is not a late-cohort denominator change. Exact
offspring fully rearmed at some time are 5/6 there, versus 0/0 with square
geometry; AAAABBBB has 2/1 opposed20 and 3/3 square. Every grip-off world has
zero fuel use, fully rearmed offspring and primary output. Its stock births
come from the prepared active material and subsequent physical histories;
they are not fuel-independent renewal of an intact exact offspring lineage.

**The fixed promotion gate fails.** Alternating-minus-clustered primary output
is +1/+3 in opposed20. The plan requires at least +2 in **both** seeds, in
addition to >=2 productive offspring, a stronger contrast than square geometry,
and >=2 improvement over grip-off. Seed 203 fails the between-sequence minimum.
The opposite sequence cannot pass either. Keep the positive matched-control
differences and the failed full criterion; do not lower the threshold afterward.

### Shape, material and persistence

The shape setting actually acts. Mean absolute angle between adjacent face
normals, pooled across intact tracked joints at 100-step samples, is
17.35/17.00 degrees for opposed20 AAAABBBB and 5.06/4.77 for ABABABAB with grip.
Square values are 4.69/4.80 and 4.91/4.63. These are survivor- and time-weighted
measurements of deforming rows, not isolated rest shapes or independent contacts.
Opposed20 fuel use is 188/185 versus 247/238; square use is 249/223 versus
248/268. Uptake totals alone do not predict exact renewal.

All prepared founders lose their original organization in all sixteen worlds.
Opposed20/grip-on short births are 56/51 of 68/55 for AAAABBBB and 34/39 of
56/58 for ABABABAB. No longer-than-eight or changed-sequence eight-letter birth
occurs. Same-sequence births with incomplete/retired/mixed parent provenance
are retained but excluded from the exact lineage, not called substitutions.
Stock births exceed the strict face-detached count in six grip-on worlds
(square AAA: 67/64 detached; square ABA: 70/81; opposed20 AAA: 68/52;
opposed20 ABA: 56/57). All grip-off births meet the detachment check.

At 100k, only opposed20/grip-on ABABABAB seed 204 retains intact exact descendants:
four, of which three have fully rearmed. It has 15 free letters and 39 in
unfinished rows. All other grip-on exact lineages have lost their tracked intact
rows. There are no still-intact exact births with less than 5k follow-up at the
horizon; raw lifetimes retain all earlier losses and censoring. This is finite
descendant renewal, not sustained preservation of the eight-letter organization.

### Reproduction, validation and decision

```sh
node experiments/sequence_shape.js --out experiments/scratch/SS_viability_fixed_20260927 --seeds 201,202 --profiles opposed20 --grips 1 --steps 20000 --workers 4
node experiments/sequence_shape.js --out experiments/scratch/SS_screen_20260927 --seeds 203,204 --steps 100000 --workers 4
node experiments/sequence_shape_summary.js experiments/out/SS_viability_fixed_20260927
node experiments/sequence_shape_summary.js experiments/out/SS_screen_20260927
node experiments/sequence_shape_test.js
node experiments/sequence_shape_analysis_test.js experiments/out/SS_screen_20260927
node test.js --match='mass is conserved|processive fraying:|compCopy:|grip and pocket:'
node tools/fingerprint.js 1500
```

Completed raw JSONL, CSV and manifests are archived with those stems. Manifests
record exact commands, parameters and source hashes; runs retain release/rearm
events, lateral edits, row lifetimes, sampled material/shape, birth logs and full
final states. Corrected viability costs 45.672 CPU seconds and the screen
833.672: **20 valid worlds, 1.68M steps, 879.344 CPU seconds**. Including the
rejected observer pilot gives 24 runs, 1.76M steps, 927.969 CPU seconds. Tests and
analysis are excluded from these costs; no more than four simulation workers ran.

Observer tests verify exact dynamics/RNG neutrality, state continuation (excluding
the pin-cache rebuild counter), matched grip ablation, conservation, physical
parent registration, partial-rearming exclusion and rejection of recycled IDs.
The analyzer validates job coverage, sources, initial/final states, immutable
types, counters, per-unit release histories, row retirement, primary metrics and
material partitions, and rejects corrupted/missing records. All four selected
core invariant checks pass; all five 1500-step default fingerprints match the
audit baseline exactly. The full 39-check suite was not rerun; the engine is unchanged.

**Disposition:** exact descendant renewal is demonstrated in prepared worlds,
including three generations under the tested motion model. The inherited-benefit
screen is negative by its unchanged gate. No evolved novelty, sustained selection,
solver-independent shape advantage or new core mechanism is claimed. Park this
preparation; do not add states, tune rates or run extra confirmation to rescue it.
The full gate did not earn P0 solver/individual-kick comparisons. P2's distinct
polygon-port feasibility and conserved growth/turnover question is next, including
the narrow recycling competitor. P1/P4 remain parked; C1 is optional closure.

## 67. Boundary ports fit, but radial geometry blocks the resource-economy preflight

**2026-09-27, ROADMAP P2/P0; partial.** Section 63 supplies a material/contact
argument, not a physical ribbon. `resource_ports_plan.md` fixes this preflight
before measurement. The proposed boundary parts are 2×1 rectangles with two
independent contacts along their inward long face and one contact at each end.
The interior parts are unit squares. No new chemistry, state, growth rule,
turnover rate or simulator-core code is introduced.

### Port representation passes

Use six vertices for each rectangle: split both long edges, leaving the outward
segments inert. This keeps the vertex mean at the area centroid and fits within
the existing eight-corner storage. Four active length-one ports map directly to
existing side/corner accessors and pin constraints. There is no multi-part
placement operation or world-orientation lock. All twelve immutable label patterns
from section 63 are defined offline; the selected minimum-scarce cycles exercise
ten of them (D11 and U00 are absent). Geometry has only three archetypes, represented
by A/B/C aliases in the physical fixture; those aliases carry no new reactions.

Enumerate n=1,2,3, both strip parities, lengths 3/6 and four quarter-turn rotations,
with two scalar-size choices: **96 ideal layouts**. Actual corner coincidence
discovers exactly the section-63 contact graph in every case. All internal and
front contacts match their immutable labels, all pin residuals are below 1e-8,
there is no double-booked side, and polygon overlap area is below 1e-8. Every
tested strip has two exposed two-contact growth sites. These are prepared
geometric possibilities; neither assembly nor fragmentation has occurred.

### Current search and vacancy checks disagree with those polygons

The engine's `_formBonds` outer filter uses centre distance and one scalar `size`;
`_slotFree` is another centre-distance test. `_physics` uses size-derived circles
for unbonded exclusion. Edge geometry and corner constraints are polygonal, but
those three checks are not polygon intersection tests. README's unconditional
no-overlap claim has been corrected; the core remains byte-identical.

The default-like rectangle mapping uses `size=sqrt(area)=sqrt(2)`. The fixed
diagnostic alternative uses `size=2`, the long dimension. Both retain the same
2×1 polygon, mass 2 and inverse inertia 1.2; squares retain unit mass and size.
Thus size sensitivity here changes search/radius proxies, not material or inertia.

| rectangle size mapping | ideal internal contacts inspected | rejected by outer distance/search gate | candidate growth fronts | excluded front contacts | rejected exact front placements |
|---|---:|---:|---:|---:|---:|
| sqrt(area) | 960 | 72 | 96 | 96 | 0 |
| long dimension | 960 | 0 | 96 | 0 | 96 |

All of these contacts pass `_geomOK` at their exact pose. Under area sizing,
an end-to-end rectangle contact has centre distance 2, beyond the outer
`1.35*sqrt(2)=1.9092` limit. Each front needs one such contact. Under long-dimension
sizing, the legal rectangle/square centre distance is `sqrt(1.25)=1.1180`, less
than `_slotFree`'s exclusion threshold `0.75*(2+1)/2=1.125`. It rejects the
geometrically empty placement. Repeated rotations and ports are diagnostic cases,
not independent statistical replicates.

There is also an explicit scalar-size conflict at the default repulsion margin:
admitting the end contact requires `size >= 2/1.35 = 1.48148`, while avoiding
false repulsion at the legal rectangle/square contact requires
`size <= sqrt(5)-1 = 1.23607`. No one size satisfies both. This is a certificate
about these existing checks and shapes, not a proof against every geometry or
parameterization. Separating search bounds from polygon contact geometry is the
next hypothesis; widening a tolerance is not evidence that the geometry is sound.

### Steric witnesses and prepared single-contact fixtures

Two unbound rectangles with centres 1.6 apart along their long dimension overlap
by 0.4 square units. Centres 1.2 apart along the short dimension give a genuine
0.2 gap. Run ten zero-kick physics steps, with identical results at 4 and 16 passes:

| size mapping | witness | vacant according to `_slotFree`? | centre distance before → after | actual overlap before → after |
|---|---|---|---|---|
| sqrt(area) | long-axis overlap | yes | 1.6 → 1.6 | 0.4 → 0.4 |
| sqrt(area) | short-axis separation | yes | 1.2 → 1.4142 | 0 → 0 |
| long dimension | long-axis overlap | yes | 1.6 → 2 | 0.4 → 0 |
| long dimension | short-axis separation | no | 1.2 → 2 | 0 → 0 |

The square calibration pairs remain separated and unmoved. For identical
rectangles, no orientation-independent radial cutoff can both reject the
overlap at distance 1.6 and permit the separation at 1.2. Increasing solver
passes cannot change a missing or incorrectly applied contact condition.

The 100-step prepared probes use a three-column n=1 strip, an incoming boundary
at either end, and either of its two contacts already pinned. No second bond
forms: this assay measures only its geometric availability. Seeds 211/212,
area/long sizing and body4, individual4, individual16, zero4 and zero16 give
80 boundary fixtures. Forty four-square corner controls use the same solver
conditions; their different mass/shape makes them numerical calibrations, not
material-matched tests of a reproductive benefit. Chemical labels are unused
throughout these physics-only runs.

With area sizing and zero kicks, a missing end contact stays exactly aligned
but excluded by the centre filter. A missing inward contact remains within
the geometry tolerance despite a false repulsive displacement. With long sizing,
the missing inward contact fails `_geomOK` after one physics step in both end
fixtures. Its corner gap is about 0.463–0.466 by step 100 at four passes.
The same qualitative failure persists at sixteen zero-kick passes; prepared
square controls remain exact. These are local contact distortions, not a
failure to acquire an unmeasured organism-level program.

Individual kicks add solver sensitivity: at step 100, square second-contact
eligibility is 1/4 at four passes and 4/4 at sixteen (two seeds × two first
contacts, correlated conditions). Boundary eligibility varies with end and
first contact, and the deterministic search/placement failures remain. Body
jostling keeps the bonded fixture together; it cannot validate excluded or
missed contacts. Raw snapshots include all pin gaps and convex-hull overlap
bounds. Hull overlaps in deformed outlines are conservative diagnostics;
the exact overlap claims above concern the undeformed convex rectangles.

### Reproduction, checks and disposition

```sh
node experiments/resource_ports_test.js
node experiments/resource_ports.js experiments/scratch/RP_preflight_20260927
node experiments/resource_ports_summary.js experiments/out/RP_preflight_20260927.json.gz
node experiments/resource_ports_analysis_test.js experiments/out/RP_preflight_20260927.json.gz
node tools/fingerprint.js 1500
```

Raw output is archived losslessly as `RP_preflight_20260927.json.gz`, alongside
the original `.summary.json`. It includes exact command, baseline, input/source
hashes, all ideal polygons and ports, parameters, full initial/final states and
sampled physical output. Counts/types and every prepared bond are conserved.
Cost: **120 × 100 + 16 × 10 = 12,160 physics steps, 10.469 CPU seconds**, plus
the static layouts; validation/replay and fingerprints are excluded from cost.
One assay process was used; unrelated Node processes were identified before running.

Tests check overlap against independent rectangle areas, all graph/rotation
cases, port perturbations, exact observer/RNG neutrality, material conservation
and geometry restart. All 136 physical fixtures replay exactly from saved states
(apart from the pin-cache version counter). Corrupted source metadata, geometry,
coverage, state hashes and vacancy results are rejected. All five default
1500-step fingerprints match the baseline. The unchanged full invariant suite
was not rerun. An early fixture test caught a stale open-side cache after prepared
bond insertion; setup now recomputes it before measurement, and restart passes.

**Decision:** port representation passes; current numerical mechanics do not
validate this candidate's physical growth. No turnover run or population test
is earned. The smallest next test is a research-only polygon-aware contact and
placement correction, with conservative search bounds, unchanged pin/deformation
rules and body jostling, reusing these exact witnesses and square controls.
It must resolve this measured discrepancy before cooperative retention and
natural fragmentation are tested. This is a targeted P0 case, not a prerequisite
whole-engine rewrite. The narrow recycling competitor and section-63 finite-stock
accounting remain mandatory later; no per-child economy, heredity or complexity
claim follows from fitting the ports.

## 68. Polygon contact correction resolves the prepared rectangle witnesses

**2026-09-27, ROADMAP P0/P2; works for the specified prepared geometry.**
The prospective `polygon_contact_plan.md` follows section 67's measured
rectangle discrepancy. All four fixed gates pass. This is a numerical
geometry result; no second bond, autonomous acquisition, growth, fragmentation,
descendant or scarce-material benefit is demonstrated.

### Isolated correction and unchanged mechanics

`PolygonContactSim` extends the section-67 geometry fixture. Its only physical
changes are candidate enumeration, unbonded exclusion and vacancy checking.
Actual corner radii plus existing side-distance tolerances bound candidate
pairs. Small worlds use pair enumeration instead of the fixed spatial grid;
collision bounds are evaluated from current corners on each solver pass and
candidate pairs refreshed after solving. There is no orientation lock, target
lookup, pattern reader, component-based placement or chemical state addition.

For exclusion, edge-normal projections of each block's convex hull give the
smallest separating translation. The two centres share it by inverse mass,
as in the old translation-only radial response. Directly bonded neighbors
retain the existing exemption. Vacancy checks use the proposed translation
and rotation against other blocks, including bonded neighbors. The subclass
supports only the three fixture archetypes and deliberately throws on `step`,
`_formBonds` or `_formBond`: the future bonding path is **not integrated**.

Kicks, pin solving, shape restoration and final wrapping/strain code are copied
verbatim from the core method; tests compare the source spans. Brownian body
jostling is inherited unchanged. Deformable polygons and their ordinary pin
constraints remain in use. All original core and section-67 sources are
byte-identical; this is not a core/default physics migration.

Convex hulls equal the actual polygons when outlines are convex, but conservatively
fill concave dents. The assay records hull area minus polygon area and does not
call this exact collision resolution for arbitrary deformable outlines. Collision
corrections precede pin/shape corrections in each pass, so finite-pass residual
overlap is also possible. Neither those limitations nor bonded-pair exemptions
are hidden by the pass criteria.

### Frozen paired comparison

Use the exact initial states from `RP_preflight_20260927.json.gz`: 120 prepared
first-contact fixtures for 100 steps plus 16 free-pair steric witnesses for ten,
under both baseline and corrected mechanics. The 272 trajectories total
**24,320 physics steps, 7.517 CPU seconds**; validation, replay and fingerprints
are excluded from this cost. One simulation worker was used after checking
the machine's Node processes. No failed or censored batch occurred.
The steric records additionally retain step 1 as a diagnostic sample; the
planned step-0/10 endpoints and all decision thresholds are unchanged.

Material, mass/inertia, prepared bonds, stiffness, seeds 211/212, both size
proxies and all five motion/solver settings match section 67. Every baseline
final physical state and RNG reproduces its archived original. The two arms
start from the same state, but later geometry can diverge; this is a reused-seed
diagnostic, not fresh statistical confirmation. Square cases repeat under the
two proxy settings; the repeated controls and ports are not independent samples.

| Fixed gate | Baseline evidence | Polygon correction |
|---|---|---|
| Ideal search/geometry and vacancy, 96 layouts / 192 fronts | Area proxy excludes required end contacts; long proxy rejects all 96 placements | All contacts eligible and all 192 exact front placements admitted |
| 16 steric witnesses, ten zero-kick steps | Area proxy leaves 0.4 overlap; both proxies push separated rectangles; long proxy rejects the empty placement | All overlaps rejected by vacancy and resolved to zero; separated rectangles and squares unchanged within 1e-8 |
| Body4/zero4/zero16 target geometry and pin precision | 48/72 target predicates pass; some deterministic pin distortions remain | 72/72 pass with final target and existing-pin gaps below 1e-7 |
| Individual16 target eligibility at step 100 | 15/24 | 24/24 |

For the overlapping long-axis rectangle pairs, the corrected centre distance
changes from 1.6 to 2 and overlap from 0.4 to zero. Separated short-axis pairs
stay at 1.2, rather than moving to sqrt(2) or 2. Results hold for both size
proxies and 4/16 solver passes. Independent unit checks additionally exercise
arbitrary rotation, periodic crossing, tangency, containment, diagonal gaps,
mass weighting, rotated placement and search bounds after actual shape expansion.

### What geometric eligibility leaves unresolved

| Motion / solver | Baseline eligible at 100 | Corrected eligible at 100 | Corrected largest final target endpoint gap | Corrected largest final existing-pin gap |
|---|---:|---:|---:|---:|
| body4 | 16/24 | 24/24 | <6e-14 | <6e-14 |
| zero4 | 16/24 | 24/24 | 0 | 0 |
| zero16 | 16/24 | 24/24 | 0 | 0 |
| individual4 | 6/24 | 12/24 | 1.3610 | 0.5288 |
| individual16 | 15/24 | 24/24 | 0.7515 | 0.2328 |

Eligibility means a conservative candidate passes the unchanged `_geomOK`
midpoint, direction and angle test. It does **not** require reversed endpoints
to coincide. The worst individual16 target endpoint gap is 0.751491 in
`long/right/0/212/individual16`; that same physical configuration also occurs
with area sizing. The gate fixed before outcomes measured eligibility, so it
passes as written; the result cannot be upgraded to a well-aligned acquired
bond. Four passes remain inadequate for the tested individual kicks, even
for some square controls.

Across sampled corrected individual16 states, maximum hull excess is 0.015635
square units; individual4 reaches 0.031017. Maximum hull overlap at the final
individual16 sample is 0.029940, including directly bonded pairs. Thus the
analytic overlap witnesses are resolved, but arbitrary moving fixtures are
not proven nonoverlapping. Under zero kicks the prepared shapes stay exact;
under body jostling their numerical residuals are at roundoff scale. This
supports the targeted correction without treating aggregate motion as ground truth.

### Reproduction, validation and next decision

```sh
node experiments/polygon_contact_test.js
node experiments/polygon_contact.js experiments/scratch/PC_compare_20260927
node experiments/polygon_contact_analysis_test.js experiments/out/PC_compare_20260927.json.gz
node experiments/polygon_contact_summary.js experiments/out/PC_compare_20260927.json.gz
node tools/fingerprint.js 1500
```

Archive: `PC_compare_20260927.json.gz` (lossless raw JSON) and its original
`.summary.json`. The raw record includes exact command, Node version, baseline,
input/source hashes, complete cases, initial/final states and sampled polygons.
Both methods conserve every block/type and every prepared bond. All 272
trajectories replay exactly, including final RNG (the restore-only pin-cache
version is excluded when comparing to section 67). Tests verify neutral
observation/restart and reject altered input, source metadata, coverage,
placement, state, observations, targets and gate summaries. All five default
1500-step fingerprints match; the unchanged full core suite was not rerun.
No outcome-dependent parameter or gate change was made.

**Decision:** keep the correction research-only. It earns a separately planned
first/second-contact acquisition assay with immutable complementary port labels,
one-block/incident-bond operations, actual bond and endpoint measurements,
overlap, persistence and single-contact survival. Start the incoming part
unbound, retain a prepared first-contact calibration and square controls,
and compare body motion with resolved individual kicks. Correctly integrate
the rotated candidate pose into vacancy checking; do not silently reuse the
old rotation-unaware call. Growth and turnover remain gated. After two
geometry assays the next advance must be autonomous contact acquisition,
not another geometry-only success or added state machinery. Retain the
section-63 common-stock and narrow-recycling objections for any later economy claim.

## 69. Actual port acquisition fails the fixed robustness gate

**2026-09-27, ROADMAP P2/P0; negative by its predeclared gate.** The prospective
`port_acquisition_plan.md` tests actual binding after the prepared-geometry
successes in 67–68. There are limited successful operations under body jostling,
but the tested setting does not establish robust acquisition. Park it; do not
rescue it with more seeds, higher solver counts, new states or looser tolerances.

### Local rule and physical implementation

`AcquisitionSim` inherits the unchanged research polygon mechanics from 68.
The twelve immutable section-63 label patterns are installed as four saved
labels per block, alongside the three geometric aliases. Reactions compare
only a facing label and its complementary polarity. Square controls use the
same orthogonal X/Y face palette on every square. The setup sweep, target
contacts, intended positions and original membership never enter reactions.
There are no mutable chemical states, relays or type conversions.

After physics, complementary free faces within the existing geometry tolerance
may form one incident bond. A free block can align to the contacting edge by
one rigid rotation/translation; the proposed **rotated** pose must pass polygon
vacancy before it moves. If both blocks already have bonds, neither is moved
by association. Reversed endpoint gaps must fit `linkDistTol=0.15` times the
mean actual edge length, including after a proposed projection. This uses a
local geometric constraint, not knowledge of a correct pose. Several events
can occur sequentially in one step; no artificial delay coordinates them.

Every bond has uniform loss probability 0.001 per step, after association.
Canonical endpoint ordering merely avoids duplicate random draws. There is
no degree-dependent loss rate, selected cut, original-scaffold exemption or
organism-level retention action. The alternative arm disables association,
retaining identical loss and physics rules. Stock copying/energy chemistry and
birth classification are not run. All core and older assay sources are unchanged.

### Fixed worlds, viability and outcome

Use the n=1 three-column left/right boundary fixtures (six blocks including
the incoming rectangle) and the four-square corner control. Area-size mapping,
mass/inertia, stiffness 0.5 and kicks match the previous geometry assays.
Starts are either one of two prepared first contacts or an unbound incoming
part displaced 0.35 outward on both axes and turned +10/-10 degrees for seeds
221/222. This is a prepared near-encounter with conserved material, not a
random-bath recruitment test. All bonds in the substrate can be lost.

Twelve zero-kick/zero-loss, 20-step viability worlds pass: all six enabled
preparations acquire the second intended bond; all six disabled controls
preserve their original bond arrays. The frozen screen then runs 108 worlds,
500 steps each: three fixtures × three starts × two arms × body4/individual16/
individual32 × two fresh seeds. No failed batch or censoring occurred.

A world succeeds only after **100 consecutive steps** with both exact target
bonds, no other incoming contact, maximum incoming endpoint gap <=0.15, and
incoming hull overlap <=0.02 square units. These observer criteria do not
affect binding. Raw double binding, single-contact duration, all bond changes
and physical residuals are also recorded. The gate requires every enabled
case to succeed under body4 and individual32; individual16 is the fixed
sensitivity comparison. It passes only **15/36** required cases and fails.

| Motion | Start | Enabled worlds | Any intended first contact | Any intended double contact | Persistent physical success |
|---|---|---:|---:|---:|---:|
| body4 | unbound | 6 | 3 | 2 | 2 |
| body4 | prepared one contact | 12 | 12 prepared | 12 | 12 |
| individual16 | unbound | 6 | 1 | 0 | 0 |
| individual16 | prepared one contact | 12 | 12 prepared | 1 | 1 |
| individual32 | unbound | 6 | 1 | 0 | 0 |
| individual32 | prepared one contact | 12 | 12 prepared | 1 | 1 |

All **54 disabled-association worlds** remain negative for double acquisition
and persistent success. Their prepared contacts are not counted as new births
or acquisition. The independent unit is a world; related preparations and
repeated events are not additional seeds. Shared initial seeds do not imply
identical later loss draws after bond histories and random consumption diverge.

The two unbound successes are right-boundary/body4/221 and square/body4/221.
Both acquire their first target at step 1 and second at step 2. Their longest
acceptable double-contact intervals are 301 and 293 steps; both retain two
contacts at step 500 with roundoff-scale residuals. Neither left-boundary
unbound body case succeeds. The prepared square `one0/221` is the sole success
under each individual-kick setting, with acceptable runs of 356 steps at 16
passes and 292 at 32; raw double-binding intervals last 365 in both. No
prepared rectangle acquires its second intended contact under either setting.

Single-contact histories are retained, including the failed intermediates:
the longest single-contact interval reaches 355 steps among unbound body cases
and 210 among unbound individual-kick cases. Disabled prepared contacts last
148–500 steps with body jostling and 208–500 with individual kicks. Uniform
loss also dismantles scaffolds: enabled unbound worlds retain 19/28 original
scaffold bonds at the end under body4, 11/28 under individual16 and 10/28 under
individual32. These are standing original contacts, not uninterrupted survival
or material loss; all blocks and types remain present.

Two enabled worlds make a label-compatible incoming contact outside the
observer's intended registration: right/one1/222 at individual16 and
square/one1/221 at individual32. This physical error channel is measured rather
than suppressed with an identity or correct-position predicate.

Association rejection totals over all enabled worlds are, respectively,
geometry/endpoints/vacancy: body4 **28,677 / 1 / 757**, individual16
**32,052 / 1,952 / 3,280**, individual32 **31,486 / 1,216 / 5,826**.
These are repeated attempted face pairs across whole worlds, not independent
samples or an isolated causal diagnosis of the target failure. Hull vacancy
remains conservative for concave deformations, and finite-pass pin/contact
residuals remain. The data do not justify selecting one tolerance to loosen.

### Evidence, validation and portfolio decision

```sh
node experiments/port_acquisition_test.js
node experiments/port_acquisition.js experiments/scratch/PA_screen_20260927
node experiments/port_acquisition_analysis_test.js experiments/out/PA_screen_20260927.json.gz
node experiments/port_acquisition_summary.js experiments/out/PA_screen_20260927.json.gz
node tools/fingerprint.js 1500
```

Archive: `PA_screen_20260927.json.gz` and its original `.summary.json`, with
full initial/final states and labels, snapshots, every-step physical metrics,
bond event histories, exact command, parameters, seeds and source hashes.
Cost: **54,240 physics steps / 36.953 CPU seconds**, including viability and
excluding validation/replay. One simulation worker was used. No outcome-based
change to rules, horizon, seeds or gate was made.

All 120 trajectories replay; independent bond-event reconstruction agrees with
final arrays. Tests cover rotated vacancy, rejection without movement, no
bonded-block repositioning, uniform loss/conservation and face specificity.
Poisoned setup metadata, observer graph helpers and the unused core `open`
cache can remain inaccessible throughout runtime without changing the result.
Saved research checkpoints resume with identical physical arrays, labels,
events, diagnostics and RNG. Core restore rebuilds the unused `open` cache and
pin-cache version; only those two derived caches are excluded from checkpoint
comparison. Full from-initial replay retains exact recorded state equality.
The poisoning test removes forbidden-read getters before serialization, which
enumerates private fields; that pre-run test-harness correction changed no
simulation rule. Corrupt source metadata, coverage, targets, states, observations,
events and gate summaries are rejected. All five default fingerprints match;
the unchanged full core suite was not rerun.

**Decision:** park this tested P2 acquisition setting. One rectangle and one
square near-encounter demonstrate a limited local operation under body4;
they do not establish solver-robust assembly, growing ribbons, turnover,
descendants, resource savings or inherited benefit. After three P2 geometry/
acquisition assays, compare alternatives: P1 failed fresh confirmation, P3
failed inherited benefit, and both tested P4 pairs failed heredity. C1 remains
one concrete bounded test of existing rules at the original obstruction.
Make that unchanged handoff-versus-waiting closure next, without fresh-seed
sweeps or hazard tuning. Further P2 work requires distinct causal evidence,
not another stage added to prolong this setting. The narrow-recycling and
common-stock objections from 63 remain unresolved.

## 70. Retained handoff operates at the original obstruction but gives no completion benefit

2026-09-27; baseline `f013101`. This is C1's single outstanding closure test,
following the prospective `handoff_closure_plan.md`. It applies the unchanged
section-60 rules to the original section-56 two-prefix obstruction, not the
later prepared handoff fixture. No core, historical assay, rule or physics
source changed. The result is negative by the fixed useful-output/reuse gate.

### Fixed comparison and local contract

Fork `PR_selected.json`'s exact 150-block state and RNG at step 15,000 into
ordinary Sim, SEEK, request/wait, pulse capture and retained handoff. Preserve
seed 83, opposed20 shapes, pUndock 0.3, body jostling, four solver passes and
all other saved parameters. Request/SEEK hazard stays 0.0001. Each arm runs
35,000 further steps to absolute 50,000; these are five branches of one selected
world, not five independent samples. Conditional RNG use diverges after the
initial state. No new bond, release, pose edit, supporting part or type is
prepared. No extra seed, failed pilot, truncation or censored arm occurred.

SEEK/REQUEST/OFFER/LATCH remain the existing research states. Each block reads
its own state/bonds and previous-pass marks from an incident lateral partner;
it changes its own state or requests release of its own face bond. Marks move
one bond per derive pass, with several passes per step. Original cohort IDs,
founder sites, sequences and completion classes are observers only. The new
runner adds observation/orchestration, not reactions. Ordinary Sim receives
zero mark buffers solely for the shared observer. Its final state, excluding
only those added arrays, exactly matches section 56's original keep-control hash.

The primary useful output is a new exact `PAAAABBBBQ` row, fully detached and
all REPEL by 49,000, still the same settled member set at 50,000. Existing
output at 15,000 is excluded. Promotion requires hold to exceed wait, equal
or exceed ordinary/SEEK, reuse more original cohorts than wait, and link at
least one such completion to retained physical support, release and redocking.
Pulse tests whether retaining the support adds anything. Inactive completion
does not mean rearming or reproduction; this fixture has no energy supply.

### Outcome and physical events

| Arm | Stock births | New settled exact | Useful persistent exact | Original cohorts completed intact | New settled nonexact | Free blocks at 50k | Unfinished row material |
|---|---:|---:|---:|---:|---:|---:|---:|
| ordinary | 0 | 0 | 0 | 0 | 0 | 117 | 13 |
| SEEK | 6 | 1 | 1 | 1 | 0 | 94 | 26 |
| request/wait | 0 | 0 | 0 | 0 | 0 | 108 | 22 |
| pulse capture | 1 | 1 | 1 | 1 | 0 | 102 | 18 |
| retained handoff | 0 | 0 | 0 | 0 | 0 | 112 | 18 |

Unfinished material counts members of non-settled multi-block rows excluding
the founder template; it includes attached and research-state rows. It is not
destroyed material. All 150 blocks, their types and the initial lateral bonds
are conserved. Free counts alone do not measure productive availability.

SEEK completes the original anchor-107 `PAAAAB` cohort intact at 31,568;
pulse completes anchor-87 `PAAAABB` intact at 27,819. Both exact rows remain
detached/all REPEL at 50,000. No other new row settles in any arm. SEEK's six
stock births therefore greatly overstate its one physical completion. The
uncompleted original cohort in SEEK retains a SEEK endpoint; pulse retains
REQUEST/OFFER on its uncompleted original cohort.

Hold has five requests, five offers, four captures, four REQUEST-to-SEEK
releases and four redocking events. Every capture is block 44 binding founder
block 60; endpoint 107 then releases founder block 3 and redocks to that same
site on the following step:

| Capture | Supported release | Same-site return |
|---:|---:|---:|
| 18,287 | 18,288 | 18,289 |
| 22,318 | 22,319 | 22,320 |
| 34,640 | 34,641 | 34,642 |
| 39,498 | 39,499 | 39,500 |

Each supporting face remains bonded through two actual physics passes: eight
contact observations in total, with maximum endpoint gaps after those passes
ranging from 0.0778 to 0.2001. These are measured finite-solver residuals, not
a claim of exact pin coincidence or a newly imposed tolerance. Captures and
release signals occur autonomously under the existing rules, but the cycle
returns to the obstruction. At 50,000 both original prefixes are still intact
and attached; anchor 87 retains REQUEST with adjacent OFFER, and anchor 107
is ordinary DOCK at its original site. No original-cohort completion follows
the physical handoffs, so the completion-linked `physicalHandoff` gate is
false despite the four observed operations.

Pulse makes 6,586 transient captures across 6,589 offers, with no LATCH state
surviving a physics pass. Those repeated contacts are not independent samples
and do not establish a unique retention benefit. Waiting makes six requests
but no capture; its original cohorts grow to incomplete nine- and seven-block
rows. Fewer errors or fewer unfinished members cannot rescue hold's zero output.

### Reproduction, validation and decision

```sh
node experiments/contact_handoff_test.js
node experiments/handoff_closure_test.js
node experiments/handoff_closure.js experiments/scratch/HC_original_20260927
node experiments/handoff_closure_analysis_test.js experiments/out/HC_original_20260927.json.gz
node experiments/handoff_closure_summary.js experiments/out/HC_original_20260927.json.gz
node tools/fingerprint.js 1500
```

Use a fresh output stem when reproducing; the runner refuses overwrites.
Archive: `HC_original_20260927.json.gz` and `.summary.json`. The gzip round-trip
matches the original 4,075,539-byte raw JSON exactly (522,732 compressed bytes).
It includes the prepared input, five complete initial/final worlds, mark buffers,
ordered events, physical support records, 5k inventories, restart checkpoints,
parameters, exact command, source/input hashes and CPU cost. Scratch originals
are retained. The observed experiment costs **175,000 steps / 133.250 CPU
seconds**, excluding input validation, regression tests and validation replays.
The five arms run sequentially in one simulation process.

The existing section-60 propagation/withdrawal, capture/release, restart and
19-corruption suite passes. New short tests verify all five observer modes and
calibrate the physics observer against the archived square handoff. Independent
event reconstruction recovers all state/bond/mark inventories, settled output
and original cohort membership. Every full observed fork replays exactly, and
every unobserved full fork has identical final arrays/RNG. The five saved
25,000-step checkpoints restart to their recorded 25,300-step state; only the
derived pin-cache version is excluded. Corrupt input/source metadata, arms,
membership, events, inventories, marks and fabricated support records are
rejected; synthetic decision checks reject equal waiting output and missing
physical evidence. All five 1,500-step default fingerprints match the audit
baseline. The unchanged full core suite and a new individual-kick batch were
not run; no general mechanical benefit is claimed.

**Decision:** park C1 and preserve its operation library. This closes the
specified question in one selected world; it is not a universal disproof of
handoff or a population effect estimate. No hazard tuning, additional states,
longer run or fresh-seed rescue is earned. Local action has been measured,
but useful completion, reproductive closure, inherited benefit and evolved
complexity have not advanced here. P1's failed confirmation, P2's failed
acquisition gate, P3's failed benefit gate and both P4 failures remain parked.
The next task is ROADMAP Q0: compare distinct causal hypotheses using these
records and freeze one small discriminating assay plan before more simulation.

## 71. Short variants retain inherited renewal after the exact founder family erodes

**2026-09-27, Q0 portfolio checkpoint and retrospective analysis.** The
[comparison](portfolio_checkpoint.md) considers three causal hypotheses:
shortening preserves function, delivery timing limits ecological benefit,
and recycling cancels gross scarce-part savings. Choose the first because
the existing section-66 archive can distinguish physical renewal from mere
short births without another simulation or rule. The other hypotheses lack
an isolated causal obstruction or a working physical prerequisite.

The [census plan](short_variant_plan.md) was written before computing these
counts. The outcomes of section 66 were already known, so this is a new
retrospective endpoint on reused worlds, not a fresh confirmation. Its
eight-letter arrangement-benefit gate remains failed. No historical source,
simulator, parameters, raw trajectories or rule table changed.

### What counts

Analyze all sixteen 100k section-66 worlds, seeds 203/204, both preparations,
square/opposed20, grip on/off. A short parent is a nonfounder logged row of
length 2–7, detached at registration. Reconstruct its child's reversed member
mapping from ordered release events and still-live parents; require exact
reversed-complement sequence, disjoint material and detached child. Every
parent unit must have a fuel-rearming event after its latest release at parent
registration and before child registration, and the parent must have fully
rearmed. Arming before the parent's whole-row birth is allowed. Retirement
ends identity, including when it shares a step number with another event.

Primary counts distinct fueled productive parents, not births or contacts.
A two-link chain A→B→C additionally requires B to fuel-rearm and reproduce
before retirement. A and B can subsequently disappear; this is a historical
renewal witness, not survival to the horizon. Overlapping chains are retained
and explicitly not independent samples.

### All worlds, including controls

Paired entries are **203 / 204**. Short births include non-detached stock births;
only the strict detached/mapped/fueled subset can contribute to the primary.

| founder preparation | shape / grip | short births | fueled productive short parents | two-link chains |
|---|---|---:|---:|---:|
| AAAABBBB | square / on | 53 / 51 | 16 / 9 | 3 / 4 |
| AAAABBBB | square / off | 28 / 38 | 0 / 0 | 0 / 0 |
| AAAABBBB | opposed20 / on | 56 / 51 | 10 / 9 | 3 / 4 |
| AAAABBBB | opposed20 / off | 12 / 25 | 0 / 0 | 0 / 0 |
| ABABABAB | square / on | 54 / 64 | 7 / 15 | 5 / 15 |
| ABABABAB | square / off | 6 / 21 | 0 / 0 | 0 / 0 |
| ABABABAB | opposed20 / on | 34 / 39 | 6 / 11 | 1 / 4 |
| ABABABAB | opposed20 / off | 4 / 6 | 0 / 0 | 0 / 0 |

Across the eight grip-on worlds: 402 short births, 395 detached, **83**
distinct fueled productive short parents and **39** overlapping two-link
chains. Counts are descriptive sums of worlds, not 83 or 39 replicates.
Grip-off worlds have short births but no such renewal. Per-world/family
full-arming, born-by-50k, survival, 5k censoring and final material partitions
are retained in the report, including zeros and all observed short families.

The fixed candidate gate requires a two-link chain in both seeds under the
same preparation/shape, and a higher family primary than the matched off arm
in both. Four preparation/shape/family combinations pass:

| preparation / shape | canonical family (sequence or reversed complement) | primary, 203 / 204 | chains, 203 / 204 |
|---|---|---:|---:|
| AAAABBBB / square | AAA / BBB | 5 / 2 | 2 / 2 |
| AAAABBBB / square | AAAAB / ABBBB | 3 / 3 | 1 / 1 |
| ABABABAB / square | AB | 2 / 4 | 2 / 4 |
| ABABABAB / opposed20 | ABABA / BABAB | 5 / 2 | 1 / 1 |

Matched off-arm primary counts are all zero. Families were selected from the
same archive; there is no multiple-testing-corrected benefit estimate. For
ABABA/BABAB, exact row-ID witnesses are 23→32→56 at steps
36,206→51,106→95,884 in 203, and 42→51→58 at
59,483→83,508→92,112 in 204. The bodies are physically distinct along each
edge, with uninterrupted parent membership and fuel witnesses. These are not
string-frequency matches. Square AB dimers also renew, so a five-letter
witness does not establish a reason for greater organization.

### Limits and next decision

Shortening does not erase every inherited reproductive function in these
worlds. The exact eight-letter lineage endpoint in 66 correctly answers its
own question but cannot stand for all viable variation. This revises that
interpretation, not its counts or failed gate. No new mechanical capability,
net benefit of arrangement, sustained selection or cumulative complexity is
demonstrated. The fuel-supported function already existed in the rules/world;
retaining it in a shorter row is not evidence of a new function.

Most importantly, these short rows live among a changing community. The census
does not distinguish self-generated fuel geometry from contacts supplied by
other rows or fragments. The original observer registers stock births, not
each fragment created by a lateral edit. Many short births have no identifiable
registered parent (counts are archived); ancestry through those gaps is unknown.
Negative family counts are lower bounds on witnessed renewal, not sterility.
Body4 results make no solver-independent mechanical claim.

Select ABABA/BABAB for a small **common-environment** test because it is an
observed five-letter renewing family in the wedge setting, not because it is
the most frequent family. The [prospective next plan](short_variant_garden_plan.md)
compares an equal-composition rearrangement, both shapes and grip controls,
with actual fuel-holder measurements. It is frozen; implementation and
viability are next. No new simulation has run. Square dimers remain a simpler
competitor, and any later claim that extra organization pays must address them.
All earlier failed settings stay parked; no handoff or P2 repair is queued.

### Reproduction and validation

```sh
node experiments/short_variant_test.js
node experiments/short_variant_summary.js experiments/scratch/SV_census_20260927
node experiments/short_variant_test.js experiments/out/SV_census_20260927.json
node experiments/short_variant_analysis_test.js experiments/out/SV_census_20260927.json
node experiments/short_variant_summary.js --verify experiments/out/SV_census_20260927.json
node tools/ledger_index.js
```

Use a fresh output stem for another run; the analyzer refuses overwrite.
Archive: `out/SV_census_20260927.json`, referencing the unchanged tracked
`SS_screen_20260927.manifest.json` and `.runs.jsonl` by SHA-256. The report
also hashes its plan/comparison/analyzer/test, records the exact command and
every family, edge and two-link witness. Cost: **zero simulation steps,
0.562 process CPU seconds**, including original archive validation but
excluding development and later validation. One analysis process; no workers.

The original validator checks sources, parameters, all sixteen worlds,
physical final-state invariants, release provenance and original metrics.
New fixtures cover recurrence without heredity, mixed parents, pre-release
and late fuel, same-step event ordering, retired/recycled identity,
detachment, missing full activation and decision controls. A second analyzer
independently queries historical child lists and indexed fuel intervals;
every edge/chain matches the streaming reconstruction. Its eight-letter
positive-control counts equal all sixteen original primary counts. Six
corrupted reports (input/source hashes, decision, witness, world coverage,
primary) are rejected, and the archived report recomputes exactly.
Core source bytes are unchanged. The full physics suite and default
fingerprints were not rerun for offline analysis; no new motion comparison
was performed or claimed.

## 72. Five-letter variants renew, but the arrangement-benefit screen fails

**2026-09-27, Q1; [frozen plan](short_variant_garden_plan.md).** Section 71's
retrospective ABABA/BABAB candidate earns a common-environment test, not a
reopening of the failed eight-letter contrast. Compare ABABA/BABAB with the
equal-composition rearrangement AABAB/ABABB. Four active prepared five-unit
founders alternate complementary orientations at the fixed four positions,
using 10 A and 10 B from the same 60 A / 60 B / 40 U pool in 18×18. Cross
square/opposed20 and grip on/off. Ordinary fuel, complementary copying and
slow turnover are unchanged; body jostling, four solver passes, stiffness 0.5.
No new simulator rules, states, types or physical forces.

The new observer wraps the unchanged section-66 row tracker. It logs every
bond edit and records the full set of holders at each actual fuel arming,
before unlinking. Offline analysis reconstructs all bonds, retirement,
detachment, full activation and physical parent/member mapping. Primary:
distinct nonfounder exact-founder-lineage parents that fully rearm with a
fuel witness for **every** member after its release, then produce an exact
detached child while intact. Row registration may follow arming; event order
resolves same-step cases. Additional shorter and other lineages are retained
separately rather than called failures of all heredity.

### Viability and fixed screen

Viability seeds 301/302, opposed20/grip-on, 20k: alternating founders give
22/17 exact detached children; rearranged give 15/16. Both pass. Alternating
has 2/0 productive rearmed exact offspring; rearranged 0/0. These pilot
renewals do not count as fresh screen evidence. No parameters were changed.

Fresh seeds 303/304, all eight arms, 100k. Entries are **303 / 304**; the
independent unit is the world, not a birth or fuel contact.

| arrangement | shape / grip | all births | exact lineage output | fueled productive exact offspring (primary) | second-cycle output | unfinished letters |
|---|---|---:|---:|---:|---:|---:|
| alternating | square / on | 140 / 124 | 42 / 43 | 12 / 10 | 24 / 18 | 9 / 6 |
| alternating | square / off | 46 / 28 | 20 / 23 | 0 / 0 | 0 / 0 | 0 / 0 |
| alternating | opposed20 / on | 150 / 119 | 43 / 37 | 10 / 9 | 23 / 20 | 11 / 13 |
| alternating | opposed20 / off | 47 / 51 | 28 / 28 | 0 / 0 | 0 / 0 | 0 / 0 |
| rearranged | square / on | 111 / 152 | 66 / 13 | 18 / 2 | 45 / 2 | 7 / 5 |
| rearranged | square / off | 50 / 34 | 32 / 29 | 0 / 0 | 0 / 0 | 0 / 0 |
| rearranged | opposed20 / on | 130 / 113 | 22 / 44 | 3 / 8 | 8 / 17 | 12 / 13 |
| rearranged | opposed20 / off | 40 / 45 | 27 / 20 | 0 / 0 | 0 / 0 | 0 / 0 |

**The unchanged gate fails.** Opposed20 alternating-minus-rearranged is
+7/+1; square contrasts are -6/+8. Seed 303 passes all conditions. Seed 304
misses both the >=2 arrangement difference and the requirement that this
difference exceed the square contrast. Both seeds exceed grip-off by >=2;
that does not rescue the failed conditions. No averaging across seeds or
lowering the threshold. Wedges also do not increase alternating primary
relative to squares: 10/9 versus 12/10.

Both arrangements genuinely renew in these prepared environments. Exact
lineage depths reach 4/4 for opposed20 alternating and 3/3 for rearranged;
square depths are 5/4 and 5/2. All original founders lose their organization
in all sixteen worlds. Intact exact descendants at 100k are 1/0 and 2/1
under opposed20, 2/3 and 10/0 under squares. These are finite histories,
not sustained preservation or selection. Each 100-step snapshot reconciles
all 120 letters. Short births dominate several on arms (for example 104/67
alternating opposed20); every shorter/other registered family and its fueled
renewal is retained in the summary. No longer-than-five or different-family
five-letter stock birth occurs; same-family births with uncertain/mixed
parentage are reported outside the exact lineage. Some stock births are
not fully face-detached (149/150 in alternating opposed20 seed 303, for example).

### What supplied the fuel contacts?

There are 2,611 arming events in the eight grip-on worlds, zero in the off
controls. At event time, 1,680 have holders on different intact tracked rows,
931 include untracked material, and zero have all holders on one tracked row.
Untracked includes material before its first whole-row registration and
fragments after retirement; it is not equivalent to a free monomer.

A descriptive membership query added after the pilot, without changing the
gate, traces the actual arming events of the 72 productive exact parents.
For each parent's first qualifying child, select each member's fuel event
after its release and before that child's registration. **359 of 360** events
involve at least one holder outside the eventual parent's members. Thirty
of these 360 armings precede parent registration. The one event whose holders
are all eventual parent members is therefore compatible with the zero count
for a single already-tracked row. Neither classification establishes an
isolated self-fueling pocket or proves that a particular helper is necessary.
Event witnesses and member IDs are retained in `.details.json`.

The imposed shape acts, but actual geometry also depends on arrangement:
mean adjacent face-normal angles are 4.05/4.34 degrees for alternating
opposed20 and 6.95/7.45 for rearranged; squares give 4.14/4.31 and 4.40/3.41.
These are time/survivor-weighted intact-row observations, not preferred rest
angles or independent replicates. Outside support and these angles cannot
establish a causal arrangement advantage that the primary comparison failed.

### Validation, cost and disposition

```sh
node experiments/short_variant_garden_test.js
node experiments/short_variant_garden.js --out experiments/scratch/SVG_viability_20260927 --seeds 301,302 --profiles opposed20 --grips 1 --steps 20000 --workers 4
node experiments/short_variant_garden_summary.js experiments/out/SVG_viability_20260927
node experiments/short_variant_garden_analysis_test.js experiments/out/SVG_viability_20260927 --replay
node experiments/short_variant_garden.js --out experiments/scratch/SVG_screen_20260927 --seeds 303,304 --steps 100000 --workers 3 --priorCpu 47.142
node experiments/short_variant_garden_summary.js experiments/out/SVG_screen_20260927
node experiments/short_variant_garden_analysis_test.js experiments/out/SVG_screen_20260927
node experiments/short_variant_garden_report.js experiments/out/SVG_screen_20260927
node experiments/short_variant_garden_report_test.js
node test.js --match='mass is conserved|processive fraying:|compCopy:|grip and pocket:'
node tools/fingerprint.js 1500
```

Use fresh output stems for reproduction. Both batches' manifests, raw JSONL,
summaries and detailed witnesses are archived under the shown names. They
contain exact commands, complete parameters/source hashes, initial/final
states, mid-run checkpoints plus their 500-step continuations, bond/fuel/row
events, actual geometry, material and censoring records. Scratch originals
remain. Viability costs **47.142** CPU seconds; screen **756.313**, total
**803.455 CPU seconds / 1.68M steps / 20 worlds**, excluding validation.
No zero/failed arm is omitted and there was no outcome-dependent stopping.
The sole scheduling deviation is three screen workers, leaving one slot for
core checks and then replay; no more than four simulation workers ran.

Observer tests compare all arrays/counters/RNG for both arrangements/shapes,
check fuel-side L/R contacts do not retire letter rows, and reject recycled
parents and activity without per-member fuel. Full plain replays match the
301 alternating/opposed20 20k world and the corresponding 303 100k world.
All twenty checkpoint continuations match, excluding only the derived
pin-cache version. Independent parent-centric queries reproduce every primary;
full bond reconstruction verifies every fuel-holder endpoint. Twelve malformed
batch/parameter/lineage/fuel records are rejected in each batch. The additional
report test covers arming before registration, outside-member classification
and temporal exclusions. All four selected core checks pass (152.80 CPU s),
and all five default fingerprints match. The unchanged full 39-check suite
was not rerun. No individual-kick/solver comparison was earned or run.

**Decision:** park Q1's arrangement-benefit hypothesis, with no rate, seed,
horizon or state rescue. Preserve its evidence of finite renewal and shared
contacts; no shape benefit, selected dependency, new function or complexity
gain is demonstrated. Next is ROADMAP Q2's bounded offline audit: do actual
fuel contacts connect recurring renewing partners, or merely available
material? Fix opportunity controls and identity coverage before counting
partnerships. A new simulation needs a distinct causal contrast; neither
more fuel contacts nor a renamed copying mechanism supplies one.

## 73. Repeated fuel support does not nominate a partner-specific candidate

2026-09-27, ROADMAP Q2; [frozen plan](fuel_support_plan.md), baseline
`1874b38`. Offline analysis of all sixteen section-72 screen worlds, seeds
303/304, 100k, both arrangements/shapes and grip controls. No pilot selection,
new simulation, changed rule, state, knob, material or physical approximation.
Body4 limitations remain those of the original runs. The archived report is
`out/FS_audit_20260927.json`; original input and scratch files are preserved.

### Measurement and coverage

At actual fuel consumption, a helper-to-actor edge requires intact registered
identities for the actor and every holder. Registration/retirement ordering
resolves same-step events. Reused members never revive an old identity, and
later row membership never fills an earlier unknown. Multiple holder blocks
on one helper row count once per consumption. Every fuel bond edit changes
the contact episode, so repeated observation of an unchanged holder set does
not establish another encounter. All classifications remain offline.

Of 2,611 fuel events, **1,680 (64.3%)** enter the primary graph. The exclusions
are 443 untracked actors (58 never previously registered) and 488 tracked
actors with at least one unknown holder. Of the latter, 82 also have an
identifiable external helper, retained only as partial coverage. Zero events
have all holders on a single tracked row. Unknown material includes both
pre-registration assemblies and fragments after retirement, not just free
monomers. These exclusions reconcile the earlier 931 partly untracked events.

| seed | preparation / shape | all fuel events | covered | untracked actor | unknown holder with tracked actor | covered helper-set changes / successive events |
|---|---|---:|---:|---:|---:|---:|
| 303 | ABABA / square | 325 | 214 | 46 | 65 | 83 / 105 |
| 303 | ABABA / opposed20 | 369 | 242 | 54 | 73 | 101 / 126 |
| 303 | AABAB / square | 310 | 195 | 67 | 48 | 74 / 115 |
| 303 | AABAB / opposed20 | 307 | 183 | 55 | 69 | 76 / 92 |
| 304 | ABABA / square | 336 | 229 | 65 | 42 | 103 / 128 |
| 304 | ABABA / opposed20 | 355 | 205 | 60 | 90 | 79 / 111 |
| 304 | AABAB / square | 301 | 228 | 26 | 47 | 99 / 109 |
| 304 | AABAB / opposed20 | 308 | 184 | 70 | 54 | 69 / 103 |

All eight grip-off worlds have zero fuel events, support edges and primary
pairs. Across on worlds there are 1,783 directed event edges, 1,421 distinct
unordered within-world pairs and 791 receiving row identities. Helper sets
change in 684/889 successive covered events (76.9%); excluded events may
intervene, so these are not all successive physical contacts. Counts pool
descriptions only; worlds, not contacts or pairs, are independent units.

### Recurrence, renewal and opportunity reference

The fixed primary counts nonfounder pairs with >=2 distinct fuel episodes
in each direction, with each partner producing a fueled exact detached child
after first receiving support from that partner and before retirement. All
registered lengths enter; founder-lineage membership is not required.

Reconstruct geometric/readiness opportunities from the complete bond tape:
a REPEL unit on a live row co-holds fuel with known external rows. Compare
each actual consumption with opportunities for the **same actor row/unit**
and helper cardinality in its fixed 10k bin, begun by the consumption, with
helpers still live at its event index. Inclusive duration weights are clipped
to the bin and consumption time. The report saves 2,093 configurations,
all pools and 199 weighted draws per world using a separate fixed RNG.
Observed renewal is held fixed in the reference; counterfactual births are
not simulated. Fuel charge is unlogged. This is a conditional geometric/
readiness reference, not an exchangeable causal null or significance test.

| seed | preparation / shape | pairs | repeated one-way or more | reciprocal | repeated both ways | primary | primary reference median / q95 | events with alternative helper sets |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| 303 | ABABA / square | 183 | 21 | 15 | 1 | 0 | 0 / 0 | 9/214 (4.2%) |
| 303 | ABABA / opposed20 | 209 | 24 | 17 | 0 | 0 | 0 / 0 | 15/242 (6.2%) |
| 303 | AABAB / square | 147 | 32 | 13 | 3 | 0 | 0 / 0 | 8/195 (4.1%) |
| 303 | AABAB / opposed20 | 164 | 17 | 10 | 0 | 0 | 0 / 0 | 9/183 (4.9%) |
| 304 | ABABA / square | 201 | 28 | 19 | 1 | 0 | 0 / 0 | 12/229 (5.2%) |
| 304 | ABABA / opposed20 | 161 | 23 | 17 | 2 | 1 | 2 / 3 | 7/205 (3.4%) |
| 304 | AABAB / square | 221 | 15 | 13 | 0 | 0 | 0 / 0 | 9/228 (3.9%) |
| 304 | AABAB / opposed20 | 135 | 35 | 13 | 1 | 0 | 0 / 0 | 6/184 (3.3%) |

There are 117 reciprocal pairs and eight repeated in both directions. Of all
1,421 pairs, 873 have neither participant's qualifying renewal after received
support, 523 have one, and 25 have both; absence is no observed qualifying
renewal, not proof of incapacity. For one-way pairs, the helper has no received
support from that partner and cannot meet that temporal criterion. Both rows
remain intact at the horizon in 140 pairs; all endpoint lifetimes and encounter
spans remain in the report/input, including censored observations.

The sole primary pair is seed 304 ABABA/opposed20, rows **70 (ABAB)** and
**71 (BABAB)**, neither with assigned ancestry. Four episodes support 71 and
two support 70, spanning steps 58,518–61,163. They produce exact fueled
children 83 at 70,927 and 88 at 73,448, then retire by fraying at 78,080 and
80,822. This establishes a finite reciprocal-renewal witness, not continuous
association, inherited pairing or mutual reproductive benefit. Its observed
count is below the reference median two and q95 three; all 199 reference
draws have at least one primary pair. Other worlds' primary upper fractions
are also one because their observed primary is zero.

**No candidate passes.** Every world fails the fixed >=20% opportunity-
alternative condition (75/1,680 events overall, 4.5%). Only one has a primary
pair, and none exceeds its reference q95. No preparation/shape qualifies in
both seeds. Few available alternatives mean weak identifiability; do not
interpret failure as evidence that partners are biologically interchangeable
or that all possible partnerships are absent. Lifetime conditioning, the
same-unit pool, coarse time bins, unknown charge and incomplete identity
coverage limit the reference. No null tuning or pooled-seed rescue occurred.

### Validation, cost and disposition

```sh
node experiments/fuel_support_test.js
node experiments/fuel_support.js experiments/scratch/FS_audit_20260927
node experiments/fuel_support.js --verify experiments/out/FS_audit_20260927.json
node experiments/fuel_support_analysis_test.js experiments/out/FS_audit_20260927.json
```

Use a fresh stem when rerunning creation. The report records the exact command,
source/plan/input SHA-256 hashes, ordered receipts, lifetimes, opportunities,
pair witnesses, every reference draw and fixed decision. Complete deterministic
recomputation passes, including the original archive's source validation and
physical bond/fuel-holder reconstruction. Synthetic checks cover ordering,
retired/future helpers, readiness, episode boundaries, within-step weighting,
time bins, deduplication, renewal and deterministic draws. An independent
static query of raw row lifetimes/holders reproduces all 16 coverage and pair
counts, checks before-retirement renewal, pool membership/weights, quantiles
and the gate; ten corrupted records are rejected. The core and historical
hashed sources are unchanged. No physics suite, fingerprint rerun or solver
comparison was required or run for this offline-only analysis.

Analysis cost: **9.327 process CPU seconds, zero new simulation steps**, below
the 120-second cap, excluding development and verification. All sixteen worlds
and zero controls are retained. No measurement defect or plan departure arose.

**Decision:** park Q2 as a source of partner-specific candidates. Q1 remains
failed; there is no selected dependency or complexity gain. The
[portfolio reassessment](portfolio_after_support.md) compares shared-product
delivery diagnostics against further partner/shape tuning, resource acquisition
and random chemistry. It selects an observation-design task for the unresolved
delivery-versus-recipient-opportunity question from section 62. Existing ecology
archives lack the ordered contacts needed to answer it. Design and validate
that discriminator before considering deterministic replay; no new mechanism,
population batch or confirmation is queued.

## 74. Delivery-stage observation passes prepared fixtures and neutrality

2026-09-27, ROADMAP Q3; baseline `98838fc`,
[fixture plan](delivery_diagnostic_plan.md). Section 62's aggregate occupancy
cannot distinguish scarce recipient sites, failed delivery or unproductive
binding. Section 73 supplies no partner-specific candidate. This task builds
and validates a measurement under unchanged chemistry, not an explanation of
either result. No archived ecology world has been replayed yet.

### Read/write contract and physical witnesses

`delivery_diagnostic.js` wraps existing methods and calls each original once.
All row IDs, classifications and histories stay in observer closures. The
simulator reads none of them. No new state, side mark, type, probability,
force or material operation. Core and historical assay sources remain byte-
identical. Existing body jostling/four passes and the live cat-side derivation
caveat remain; this is not a new locality or mechanical accuracy claim.

At each bond-formation phase the observer records armed known-recipient,
producer and unknown site counts, their free backs, and mature products. It
records mature product/open-back pairs at actual `_tryBond` calls, evaluates
their ordinary centre and actual-corner side geometry before probability,
then records formation attempts and successful binding episodes. The pBindP=0
control still has geometric opportunities. This counts engine-scanned pairs,
not every possible polygon collision; vacancy tests occur later and remain
separate. Geometry uses private scratch arrays and does not touch Sim caches.

A supported lateral letter link must be sticky, read a true cat flag on an
incident template face, and have a physically present mature product with a
witnessed active binding episode. Stale/unidentified signals remain unknown.
Each internal lateral bond carries its current link-event witness until that
bond breaks. Row identity ends on fraying or lateral edits. Exact detached
output requires release witnesses mapping every member to the same still-live
parent in reverse order, correct sequence and fully unbound F faces. Support
attribution additionally requires a surviving internal link supported on that
parent. A broken and later replaced link cannot reuse its old attribution.

### Fixed prepared fixtures

Every case conserves four B blocks and two product blocks. Setup explicitly
prepares a BB recipient and a two-unit product; selected cases prepare two
docked copy units. Pose/state edits and phase scheduling are fixture
interventions, not autonomous acquisition. Binding probability is 0 or 1;
bare linking is 1 to exercise output without catalytic support. These are
calibrations, not the original ecology parameters or a benefit comparison.

| prepared case | geometric opportunities | bindings | placement failures | known supported links | detached exact output | supported exact output |
|---|---:|---:|---:|---:|---:|---:|
| no armed recipient | 0 | 0 | 0 | 0 | 0 | 0 |
| product too far | 0 | 0 | 0 | 0 | 0 | 0 |
| product misoriented | 0 | 0 | 0 | 0 | 0 | 0 |
| immature product | 0 | 0 | 0 | 0 | 0 | 0 |
| binding disabled | 1 | 0 | 0 | 0 | 0 | 0 |
| binding without docked copy | 1 | 1 | 0 | 0 | 0 | 0 |
| placement blocked | 1 | 0 | 1 | 0 | 0 | 0 |
| supported linking and release | 1 | 1 | 0 | 1 | 1 | 1 |
| bare linking and release | 0 | 0 | 0 | 0 | 1 | 0 |
| parent retired before release | 1 | 1 | 0 | 1 | 0 | 0 |
| supported bond severed and replaced bare | 1 | 1 | 0 | 1 | 1 | 0 |
| product unlinked before cat signal refresh | 1 | 1 | 0 | 0 | 1 | 0 |

Availability distinguishes the first two rows: zero versus two armed recipient
sites. Misorientation reaches the scan once but fails side geometry. The stale
signal case has one unknown-support link and does not receive physical-support
credit. Retired-parent output still exists as a detached row, but exact ancestry
is unassigned. All twelve expected signatures pass. This does not establish
that these are the causes of the earlier ecological failures.

### Neutrality, restart and independent validation

Seeds 411/412, on/noBind/noSource/neither, 1,000 steps: eight 68-block worlds
in 16x16 with 12 each A/B/C/D, 12 products, eight energy particles and the
two original six-letter seed sequences. Instrumented/plain runs match all
saved state, typed arrays, numeric counters and RNG. Observer records also
match a restart at step 500 through step 1,000; state comparison excludes only
the derived pin-cache revision on restored instances. All final invariants
and type inventories pass. These small worlds produce no mature deliveries
or births, so they alone cannot validate the positive observation paths.

The independent check therefore also pairs **every prepared case** with the
same actions without observation: all arrays/counters/RNG match and reproduce
the archived fixture states. An active binding episode survives observer/Sim
restart and produces identical link/output records. Twenty ordered event tapes
(12 prepared, eight small worlds) reconstruct final bonds, continuous row
ownership, release parents and surviving support witnesses independently.
Six altered counts, parents, witnesses, episode endings or bond endpoints are
rejected. A full deterministic suite rerun reproduces the archived evidence,
excluding wall timestamp/CPU measurement. Twenty-four orientation/offset/seam
geometry cases agree with the engine's actual-corner predicate.

```sh
node experiments/delivery_diagnostic_test.js experiments/scratch/DD_fixtures_20260927
node experiments/delivery_diagnostic_analysis_test.js experiments/out/DD_fixtures_20260927.json --replay
```

Creation refuses overwrites; use a fresh stem. The archive
`out/DD_fixtures_20260927.json` (3,522,308 bytes) is byte-identical to the retained
scratch original. It records the exact command, source/plan SHA-256 hashes,
parameters through saved states, all initial/final states, observer records,
zero outcomes, counts and CPU cost. Completed suite cost: **11.781 process CPU
seconds and 20,000 simulation steps**, including plain/restarted comparisons,
plus manually scheduled fixture phases; validation reruns are excluded from
that cost. One process, no workers or archived population replay. No fixture
failure or rule change was needed. No default fingerprint or full core-suite
rerun was required; core bytes are unchanged and relevant invariants pass.

### Disposition

**Measurement gate passes.** It earns the
[fixed retrospective replay plan](delivery_replay_plan.md), not a new ecological
benefit claim. That plan retains all four confirmation seeds and four controls,
the original 50k horizon and (10k,50k] window, exact original-state/observation
agreement, a 3,600 CPU-second cap and cost-only preflight. It freezes coverage,
denominator and failed-versus-passed-world stage comparisons before replay.

A later research-only catalytic-efficacy ablation could retain production and
product binding while making docked letters use the existing bare linking rate.
That would separate chemical acceleration from physical bound-product presence
at the rule level, with no ID reads or material change; subsequent contacts
would still diverge. It is a proposed causal contrast, not implemented or earned
by these fixtures. Section 62 remains failed, Q2 remains parked, and no new
mechanism, population screen, heritable dependency or complexity is demonstrated.

## 75. Archived delivery replay: exact histories, limited identification

2026-09-27, ROADMAP Q3; baseline `428b37a`,
[frozen replay protocol](delivery_replay_plan.md). This is a retrospective
measurement of section 62, with no new chemistry, population, seed, horizon,
state or rate. The original failed benefit gate remains failed.

**Outcome: complete but inconclusive.** All sixteen original worlds completed
50k (800,000 steps), with exact historical agreement and no partial/failed
replay. Main execution used 3,581.703 CPU seconds; required final QA takes the
measured total to 3,621.031, above the frozen all-work budget (see below). The diagnostic gate fails: all four on
worlds have <80% known-site coverage, seed 106 misses both minimum denominators,
and episode-use ordering differs from earlier stages. Park Q3; no causal
explanation or benefit is earned.

### Contract and interpretation

`delivery_replay.js` validates the sixteen original inputs and their source
hashes, attaches the unchanged section-74 observer alongside the original
birth/member observer, and reproduces the original 100-step sampling schedule.
Initial physical hashes, full final saved arrays/counters/RNG, samples, births
and 5k member follow-ups must agree before a completed world's measurements
are interpreted. Every saved event tape independently reconstructs its final
bonds, row retirements, release parents and surviving support witnesses.

The launch manifest freezes commands, parameters through original inputs,
source/input/plan hashes, all sixteen jobs and unchanged criteria before the
first step. One process runs sequentially; process CPU is checked between 1k
chunks. Completed and stopped records are losslessly gzipped, with initial and
final states, full observer records, original observations, progress and hashes.
Scratch evidence is retained. No historical source or frozen plan is edited.

The report keeps producer, recipient and unknown sites/events separate. Zero
denominators yield null rates. Geometry rejections, probability nonformation
and actual failed vacancy tests are different outcomes. Binding episodes keep
the category known at onset; links use their live identity at the link event.
The report also separates episode use with the same live row from use after
identity loss/change (these subsidiary categories may overlap). Primary use
remains the frozen fraction of ended episodes with any witnessed supported link.

Exact supported output requires a continuous physical internal-bond witness on
the same intact parent. Original stock exact/variant/unknown birth classes and
sampled 5k integrity/activation remain separate from this stricter attribution.
The fixed 5k support follow-up includes links through 45k and records later
links as age-censored. Open binding episodes are reported separately from ended
ones; repeated contacts are not independent replicates. Neither supported
output nor a retrospective rate ordering proves catalytic necessity, heritable
benefit or renewal. Existing body jostling and live cat-side derivation caveats
remain; no mechanical/locality promotion or P0 comparison is claimed.

### Validated on-world measurements

These four worlds each completed 50k and passed full historical agreement.
Counts below are in (10k,50k]; binding use includes only episodes beginning in
that window and ending by 50k. The table is descriptive: every world misses
the fixed >=80% known-site coverage requirement.

| seed (old benefit gate) | known / all armed site-steps | coverage | recipient geometric opportunities | recipient bindings | used / ended recipient bindings | supported exact recipient output |
|---|---:|---:|---:|---:|---:|---:|
| 105 (pass) | 5,420,180 / 6,804,706 | 79.6534% | 1,617 | 254 | 62 / 227 | 16 |
| 106 (fail) | 2,563,530 / 3,334,419 | 76.8809% | 13 | 2 | 0 / 2 | 0 |
| 107 (pass) | 4,619,105 / 6,081,730 | 75.9505% | 1,373 | 237 | 52 / 218 | 13 |
| 108 (fail) | 4,488,598 / 5,624,964 | 79.7978% | 444 | 68 | 19 / 60 | 3 |

| seed | recipient armed site-steps / mature product-unit-steps | geometric opportunities / free-back site-steps | formation attempts / vacancy failures | open bindings / used open bindings | eligible support links / outputs within 5k / late links |
|---|---:|---:|---:|---:|---:|
| 105 | 1,128,127 / 4,515,511 | 1,617 / 860,489 | 306 / 52 | 27 / 5 | 39 / 10 / 27 |
| 106 | 137,074 / 2,222,428 | 13 / 137,049 | 4 / 2 | 0 / 0 | 0 / 0 / 0 |
| 107 | 835,210 / 3,962,972 | 1,373 / 563,928 | 301 / 64 | 19 / 8 | 31 / 7 / 20 |
| 108 | 579,426 / 3,708,808 | 444 / 507,674 | 89 / 21 | 8 / 3 | 7 / 2 / 12 |

Observed availability, encounter and binding-conversion rates are lower in
both formerly failed on worlds than in either formerly passed world. This is
**not a qualifying signature**: coverage fails everywhere, and seed 106 has
fewer than the required 20 geometric opportunities and 20 ended bindings.
Episode use does not have that ordering: seed 108's 19/60 exceeds 62/227 and
52/218 in the passed worlds. Do not pool worlds or lower the gates.

Recipient supported output is physically witnessed in three worlds; its absence
in the covered seed-106 recipient history is not proof of catalytic inefficacy.
Stock detached-exact recipient counts (22/2/21/7 in section 62) differ from the
stricter support-attributed counts because continuous parent/bond identity,
not just an old parent sequence, is required here. Unknown retired fragments
can alter apparent stage rates. This archive does not isolate the cause of the
old benefit failure, and supports no inherited-benefit or complexity claim.

### Controls, archive and validation

All four noBind controls retain geometric recipient opportunities (493/79/
1,613/1,720), each with probability zero and no actual recipient binding.
Production-disabled and neither controls have no mature-product delivery.
Every control's supported exact output is zero. The full report includes
producer, recipient and unknown categories in **all sixteen worlds**, with
raw availability/encounter/binding/use numerators and denominators, geometric
rejections, attempts, vacancy failures, retirement counts, mutation classes,
material inventory and censored follow-ups. Zero denominators remain null.
On-world producer supported exact output is 32/39/30/39; unknown-parent births
are 20/17/30/16. The narrower recipient result is not the whole population.

```sh
node experiments/delivery_replay.js experiments/scratch/DD_replay_20260927
node experiments/delivery_replay_summary.js experiments/out/DD_replay_20260927 experiments/out/DD_replay_20260927/summary.json
node experiments/delivery_replay_analysis_test.js
node experiments/delivery_diagnostic_analysis_test.js experiments/out/DD_fixtures_20260927.json
node tools/fingerprint.js 1500
node tools/ledger_index.js
```

Creation refuses overwrites. Archive: `out/DD_replay_20260927/manifest.json`,
sixteen `.json.gz` records totaling **16,803,302 compressed bytes**, and
`summary.json`. Raw records and manifest are byte-identical to retained scratch
copies. The summary records its own command, input-manifest/analyzer hashes,
per-world results and unchanged decision gates; it rejects incomplete matrices
for the full-stage decision. No raw record was deleted or selected away.

The final archive validator passes source/input/raw hashes, complete job/sample
coverage, historical arrays/counters/RNG, all births and member follow-ups,
ordered bond/row/release reconstruction, and three corruptions in each of the
sixteen records. Separate analysis fixtures pass zero denominators, strict
world ordering, coverage/denominator boundaries, open/ended episodes, window
and 5k follow-up boundaries, changed/unknown identity, and bare/retired/severed/
stale support controls. The section-74 fixture analyzer passes its six
corruptions, twelve prepared neutrality comparisons and active-binding restart.
All five default 1500-step fingerprints match the audit baseline. The full
physics suite and a second full ecological replay were not run. Core, viewer,
historical assay sources, diagnostic observer and frozen plan are unchanged.

### Cost accounting and disposition

The cost-only 105/on preflight used **41.234 CPU seconds**, 149,856,256-byte
peak RSS, with an 80-fold projection of 3,298.72 seconds; the same instance
continued. One process, no simulation workers. All sixteen trajectories
finished after **3,581.703 process CPU seconds**; peak recorded RSS was
618,663,936 bytes. All checks inside that runner and raw serialization are
included. The cap was checked every 1k steps and was not raised; no partial
or failed run occurred.

**Accounting deviation:** the runner enforced its own 3,600-second execution
cap, but failed to reserve CPU for the required final offline archive QA and
analysis. That process added **39.328 CPU seconds**, giving a measured replay
plus final-QA total of **3,621.031 seconds**, 21.031 over the frozen all-work
budget. Earlier auxiliary checks were not CPU-metered separately, so this is
a lower bound on total task cost, not an all-work compliance claim. No extra
simulation steps followed the cap check. Future bounded runners must reserve
and aggregate final-analysis cost rather than silently exclude it. The raw
launch/run records and analyzer accounting are retained unchanged; no rerun
is justified to repair this administrative miss.

**Decision:** no qualifying bottleneck signature; park this diagnostic route.
The stage counts describe physical deliveries but cannot isolate the old
benefit failure with the fixed coverage/denominator requirements. No threshold
relaxation, new seed, frequency race, identity-aware reaction, coverage repair
or catalytic-efficacy implementation follows automatically. Section 62 stays
failed; Q1 and Q2 remain parked. ROADMAP Q4 is an offline portfolio comparison
of distinct causal contrasts and their path to inherited function before
another prospective assay. More observation or births alone is not progress
up the research audit's evidence ladder.

## 76. Portfolio after delivery: neither causal contrast earns an assay

2026-09-27, ROADMAP Q4; baseline `c710056`. This is a **static design review**,
not a simulation result or an empirical rejection of either proposed effect.
The full [comparison](portfolio_after_delivery.md) records evidence, local
read/write contracts, rule cost, simpler competitors, inheritance paths and
admission/CPU/stop conditions. No new rules, states, seeds or assay plan.

| Candidate | Distinct causal prediction | Decision |
|---|---|---|
| Keep physical product binding, suppress supported letter linking to the original bare rate | Ordinary rules produce more output than efficacy-off rules at the same initial material and geometry. This separates efficacy from attachment at the rule level. | Clean total-effect contrast, but both producer and recipient linking change. Producer-mediated supply and direct recipient action remain mixed; no inherited functional organization is identified. Retain as a possible later calibration, not the next assay. |
| Cross complementary/self recognition with opposed/square geometry and measure descendant renewal | Opposed material loses more renewal on removing complementary recognition than square material does. | Mechanically relevant and no new rules, but extends section 49's known fit rescue to an endpoint already demonstrated under complementary rules in 66/72. No additional useful operation or benefit over square renewal is predicted. Reject for current priority. |

Source inspection confirms that `catalysis=false` also prevents mature product
binding, whereas `pLinkBare=1` raises unsupported linking. Neither implements
the first proposed ablation. A research override could change only the eligible
letter-letter STICKY lateral probability while preserving product linking and
all binding/geometry rules. Subsequent physical histories would still diverge;
the comparison would not preserve recipient exposure or isolate named helpers.
Section 75's failed coverage/denominator gates cannot nominate such helpers.

For the second contrast, self and complementary recognition generate different
child sequences. Equal composition does not hold descendant arrangement fixed.
Section 49 establishes a fit interaction, not superiority over square copying;
sections 50–51 separate capture, arming and productive renewal. Sections 66/72
fail their benefit gates, and 71 supplies renewing square dimers as a simpler
competitor. No new seeds or mechanical tuning are earned by joining these facts.

**Disposition:** zero plans and zero simulation steps. The missing causal
measurement is a benefit of inherited physical organization over simple renewal
with equal material, retained through descendant turnover. A new proposal must
identify the physical operation and its smallest counterfactual: separate useful
recipient action from changed producer supply, or identify a mechanical use beyond
restoring copy compatibility. Either route may qualify independently. This is not
a demand for a positive result before testing; it is a demand for a discriminating
hypothesis before paying for another assay. No currently admitted executable
experiment remains. Prior failures and Q3's cost-accounting deviation stand.

**Verification and limits.** Reviewed the cited result sections, ledger, audit,
DESIGN commitments and actual compatibility branches; checked document references,
the rebuilt ledger index and whitespace. Runtime, historical assay sources,
frozen plans and raw evidence are unchanged. No simulation or archive reanalysis;
no fingerprints, build or physics suite rerun for documentation-only work. Cost
estimates in the comparison use archived run CPU, not new timings, and include
explicit future QA reserves; they are not measured costs for unimplemented arms.

## 77. Geometry reduces wrong joining but fails selective error rejection

2026-09-27, Q5; baseline `9fa730d`, [frozen plan](geometric_error_plan.md).
Q4 required a different physical function with a causal prediction. This test
asks whether shape can reject wrong incoming material using existing undocking,
without the designed proofreading rule. Section 49 disabled substitutions;
the fuel/arrangement tests did not isolate this discrimination. This is a
prepared physical-effect test, not a reopened arrangement-benefit screen.

### Fixed preparation and local contract

Every world contains eight A and eight B blocks, no energy, in 24x24. A central
AA/AB/BA/BB dimer is relaxed with 100 zero-kick physics-only passes, then two
selected existing letters are placed using ordinary face alignment and vacancy.
Both are complementary, or one supplied letter is wrong at site 0 or site 1.
This deliberately bypasses initial recognition/acquisition; it is conditional
on already docked material. Unused letters remain in a remote spaced grid;
types and counts never change. No incoming lateral link is prepared.

Square/opposed20 shapes, seeds 501/502 and body4/individual16 physics give
96 cases. All use complementary recognition, stiffness 0.5, pSoft 0.002,
pUndock 0.1, zero fraying, energy gate on and proofreading/catalysis off.
No chemistry, force, mutable state or relay is added. Each case runs 200
ordinary steps; classification observes the first incoming lateral join or
loss of an imposed face bond. Correct/wrong identities are observer-only.
Subsequent events cannot replace the first outcome. Existing side-interface,
radial exclusion and body-jostling qualifications remain.

### Frozen outcome

Counts in each row are separate balanced prepared cases, not independent
population contacts. Censored outcomes are zero throughout.

| seed / physics | square correct joins / 4 | opposed correct joins / 4 | square wrong joins / 8 | opposed wrong joins / 8 | opposed wrong-member losses / 8 | opposed correct-neighbor losses / 8 | promotion |
|---|---:|---:|---:|---:|---:|---:|---|
| 501 / body4 | 4 | 3 | 8 | 2 | 2 | 4 | fail |
| 502 / body4 | 4 | 3 | 8 | 2 | 2 | 4 | fail |
| 501 / individual16 | 4 | 3 | 8 | 4 | 3 | 1 | fail |
| 502 / individual16 | 4 | 3 | 8 | 4 | 1 | 3 | fail |

All strata pass the >=3/4 correct-joining viability criterion, the positive
square error-opportunity control, the halving of wrong joins, and the >=0.25
square-adjusted discrimination contrast (body 0.5; individual 0.25). **All fail
the required >=4/8 losses of the wrong member itself.** Losing the correct
neighbor is not successful rejection; fewer wrong joins alone does not pass.
The independent timing check finds no simultaneous first-face losses to make
these labels ambiguous. Joins followed by normal release within the same step
remain incorporation, as required by the ordered physical tape.

The context-specific counterexample matters: **every AA correct preparation
loses a member before joining, while both AA wrong placements join in every
seed/physics stratum**. With body kicks the first actual side gaps are about
0.1635 for the correct pair versus 0.0186–0.0239 for the wrong placements;
the engine's geometry predicate fails the former and passes the latter.
These are measured deformed sides, not selected rest shapes. Individual-kick
cases keep this first-outcome reversal, despite different geometries/timing.
The result is a context-dependent compatibility filter, not a general preference
for correct chemical identity. No useful-output, inheritance, selection or
complexity claim follows. It does not show that every possible shape filter fails.

### Validation, cost and disposition

For all 96 cases, observed versus plain 200-step dynamics and a 100+100 restart
match full saved state/RNG, excluding only the known restored pin-cache revision.
All invariants and type inventories pass. The independent analyzer reconstructs
final bonds from ordered edits, checks initial material and fixed parameters,
reclassifies first outcomes and recalculates side geometry from raw values.
Four corrupt outcome/tape/geometry/decision records are rejected. All sources,
plan hashes, parameters, initial/mid/final states, samples and tapes are archived.

```sh
node experiments/geometric_error.js experiments/scratch/GE_20260927.json
node experiments/geometric_error_test.js experiments/scratch/GE_20260927.json
node experiments/geometric_error_report.js experiments/scratch/GE_20260927.json experiments/scratch/GE_20260927.summary.json
node tools/ledger_index.js
```

Creation/validation outputs refuse overwrites; reproduction needs a fresh path.
Archive `out/GE_20260927.json` (13,114,085 bytes), its `.cpu.json` and
`.validation.json` companions, and `out/GE_20260927.summary.json` are identical
to retained scratch originals. The report preserves every context, including
negative outcomes, and checks simultaneous-loss ambiguity. The sources and
plan were frozen before the run; the context/timing report is subsequent
descriptive analysis and does not change the decision criteria.

One simulation process, no workers; the machine process inventory contained
only tool servers before launch. Ordinary steps: 19,200 observed + 19,200
plain + 9,600 restart continuation = **48,000**, plus **9,600 prepared
physics-only passes**. Execution including setup/neutrality/restart/raw writing
used 9.405 process CPU seconds; validation 1.858, one read-only timing inspection
0.233, and final report calculation 0.452: **11.948 measured CPU seconds**.
This leaves ample room under the 120-second cap with its 40-second QA reserve;
the last tiny report write and shell/Git/documentation overhead are outside
those measured intervals. No wall time is used as CPU cost. No failed placement,
invariant, partial case, extra seed or parameter revision occurred.

**Park this preparation.** Do not select only favorable contexts, tune angles,
undocking or solver passes, add a proofreading rule, or launch population work.
Correct-neighbor loss and AA's reversal defeat the proposed useful filter.
The broader next direction still requires a distinct inherited physical
operation with a same-material benefit prediction against simple renewal.
Core and historical sources/data remain unchanged; no full physics suite,
default fingerprint rerun or core promotion was needed for this isolated assay.

## 78. Passive support restores a broken bond in prepared duplexes

2026-09-27; Q6, baseline `dd38352`. **Physical-effect lead, not autonomous
repair or inherited benefit.** The [prospective plan](duplex_repair_plan.md)
tests a distinct operation: whether an intact face-bound row holds adjacent
broken ends for ordinary ligation. Existing rules only; no repair state, damage
sensor, new force, whole-key match or core change. Sections 18/29 measured
binding/sequestration, not this exact damage-and-reconnection contrast. Q5's
failed discrimination gate remains failed.

### Preparation, controls and commands

Sixty eight-block worlds (4 A + 4 B, no fuel), 24x24: seeds 601/602, ABAB/AABB
and reverse-complement supports, body4/individual4/individual16, five arms.
All begin with identical square poses, two active four-block rows, and selected
bonds. The first row's middle bond is cut in every arm except uncut:

- bridge: four face bonds and an intact opposite row;
- split: same face occupancy, with the opposite middle bond also cut;
- unbound: intact opposite row but all four face bonds removed;
- noLigate: bridge with ligation disabled;
- uncut: intact duplex stability control.

`pLigate=0.02` except noLigate; acquisition, melting, fraying, background damage,
spontaneous joining and capture are disabled. There are no mid-run observer
interventions. Both dimers remain active after the imposed middle cut. The
split arm has more imposed damage, explicitly testing load-path continuity,
not equal damage. Permanent face bonds deliberately isolate mechanics while
preventing release. All parameters and full states are in the raw record.

```sh
node experiments/duplex_repair.js experiments/scratch/DR_20260927.json
node experiments/duplex_repair_test.js experiments/scratch/DR_20260927.json
node experiments/duplex_repair_report.js experiments/scratch/DR_20260927.json experiments/scratch/DR_20260927.report.json
```

Those exact outputs already exist; choose a new stem for reproduction. Every
writer refuses overwrites. Archive: `out/DR_20260927.json`, its `.cpu.json` and
`.validation.json`, plus `DR_20260927.report.json` and the earlier one-off
`DR_20260927.summary.json` (auxiliary analysis/cost retained). Archive copies
are byte-identical to scratch. Raw SHA-256:
`2ec6805064943277cd7745b0af649ab2520991f5894d6190271c3c677762fc1c`.
The raw record hashes core, prospective plan, runner and validator; the report
hashes its own source and requires a matching successful validation record.

### Result and physical witness

Primary: the original missing bond reconnects and remains at step 500.
Connectivity through the support alone does not count as repair. Each table
cell combines both contexts and seeds for presentation; the gate was applied
separately to every seed/physics stratum, requiring both bridge contexts and
at most one successful context in each split/unbound control.

| Physics | Bridge repairs | Split repairs | Unbound repairs | No-ligation repairs | Uncut bonds retained | Bridge first repair steps (601 ABAB/AABB, 602 ABAB/AABB) |
|---|---|---|---|---|---|---|
| body4 | 4/4 | 0/4 | 0/4 | 0/4 | 4/4 | 1, 1, 19, 19 |
| individual4 | 4/4 | 0/4 | 0/4 | 0/4 | 4/4 | 42, 127, 220, 432 |
| individual16 | 4/4 | 0/4 | 0/4 | 0/4 | 4/4 | 103, 88, 70, 55 |

**All six seed/physics strata pass.** Twelve bridge repairs, no original-row
repairs in either negative topology control, and no repair without ligation.
All uncut controls retain every prepared bond. All 36 non-uncut negative
cases are right-censored at 500 for target repair; zero is not an infinite-time
impossibility. One split support itself reconnects (seed 601, AABB,
individual4, step 19), but its first row does not repair within the horizon.
No new-neighbor lateral joining or births occur in any world.

Actual side-midpoint gaps and antiparallel normals are sampled before every
ordinary bond scan. Before repair, bridge geometry is eligible on 40/40 scans
under body4, 88/821 under individual4, and 215/316 under individual16. Without
ligation, the supported gap remains eligible on 2000/2000, 198/2000 and
1144/2000 scans respectively. Unbound target ends have 0/2000 eligible scans
in each mode; split targets have 2/2000, 38/2000 and 1/2000. These are correlated
within-world physical witnesses, not independent trials or comparable exposure
rates after stopping at repair. Body motion strongly changes retention/timing;
the qualitative reconnection contrast survives independent kicks and solver
resolution. Sixteen passes are a sensitivity check, not a convergence proof.

### Scope, validity and cost

The chemistry reads local side state/bonds and uses ordinary local geometry
and ligation. The observer remembers original members/edges; reactions do not.
It wraps link/unlink and geometry sampling without changing their outcomes.
Sixty observed/plain full final states and RNGs match, as do sixty midpoint
restarts (only the known pin-cache revision is excluded). Conservation,
prepared face geometry, END-END compatibility and bond symmetry pass. The
independent validator reconstructs midpoint/final bonds, recalculates geometric
predicates and the fixed gate, and rejects corrupt outcome, tape, geometry and
summary records. Initial/final source and parameter checks pass.

One simulation process, no workers; the process inventory showed no other
simulation before launch. Steps: 60 setup checks + 30,000 observed + 30,000
plain + 15,000 restart continuation = **75,060 ordinary steps**. CPU: run
13.030 s, validation 2.640 s, initial one-off analysis 0.280 s, final report
0.171 s = **16.121 measured seconds**, within the 120 s cap and 40 s final-QA
reserve. Final small QA/report serialization and shell/Git/docs/workspace
inventory overhead are outside these intervals; no strict whole-session CPU
claim. A zero-step side-orientation inspection preceded execution. No failed
assay, invalid placement, retuning, extra seed or horizon change occurred.

Every bound case ends with **8/8 faces occupied**, versus 0/8 in unbound.
There are no active detached repaired outputs and no descendants. We supplied
support, alignment and a break; the retained material cannot copy while bound.
The experiment does not show self-acquisition, natural damage recovery,
release, protection from continuing damage, reproductive payoff or evolved
novelty. Two seeds and two prepared sequences are a lead, not confirmation.
Independent dimers can renew without protecting the original four-letter order;
this remains a simpler competitor, not a failed control of this experiment.

**Next:** a small fresh-seed plan for ordinary acquisition, repair and release,
with intact-support, no-binding and no-ligation contrasts and a release/use
criterion. Only a completed autonomous operation can earn an equal-material
reproductive test against independent renewal. No population batch or new repair
state is yet admitted. Core and all historical assay/data bytes are unchanged;
the full physics suite and default fingerprints were not rerun for this isolated
assay. The current roadmap was shortened, with all old briefs retained in its
dated snapshot, so those historical next steps cannot compete with Q6b.

## 79. Repair survives ordinary melting, but acquisition and usable release fail

2026-09-27; Q6b, baseline `d8d1bbc`. **Negative by the frozen prerequisite
gate.** Section 78's prepared repair effect survives, but the same local rules
do not reliably acquire support and return repaired material to exposed use
in this setting. No natural-damage cycle or reproductive assay is earned.

### Prospective comparison and evidence

The [plan](duplex_cycle_plan.md) separates two prerequisites instead of hiding
acquisition and release inside a long damage search. Both use eight squares
(4 A + 4 B), 24x24, ABAB/AABB and reverse-complement rows, fresh seeds 603/604,
and matched body4/individual16 physics. No new chemistry, state, force or type.

- **Acquire:** two intact unbound rows begin in the same favorable near-facing
  poses as section 78. No face bonds are supplied. This tests contact-mediated
  acquisition from a prepared near-encounter, not unbiased encounters in a bath.
- **Release:** four face bonds are prepared and the first row's middle bond is
  cut. This tests repair followed by release, with acquisition deliberately supplied.

Each preparation has on/noBind/noLigate/noMelt arms. On uses `pHyb=0.2` from
section 29, `pLigate=0.02` from 78, and ordinary `pMelt=0.1`,
`pMeltRun=0.001`, `pMeltEnd=-1`. No heat, fraying, background damage, fresh
monomers or fuel. No mid-run pose/state edits or observer-triggered interventions.
The noBind release control keeps its initially prepared bonds and disables
**future** binding; it is not a no-support comparison.

The four release/on seed-603 pilots passed the step-500 repair gate in both
physics modes and continued on those exact instances. All 64 worlds completed
5,000 steps. Primary prerequisite success requires the earlier acquisition
or supported repair, then both original rows exact/active, no extra lateral
bonds and all eight faces unbound for 25 consecutive steps. Initial unbound
acquisition poses never count as release. Support is witnessed immediately
before the repair link; later binding cannot retrospectively supply it.

```sh
node experiments/duplex_cycle_test.js
node experiments/duplex_cycle.js experiments/scratch/DC_20260927.json
node experiments/duplex_cycle_test.js experiments/scratch/DC_20260927.json
node experiments/duplex_cycle_report.js experiments/scratch/DC_20260927.json experiments/scratch/DC_20260927.report.json
```

Existing output paths refuse overwrites; use a new stem for reproduction.
Archive: `out/DC_20260927.json`, its `.cpu.json` and `.validation.json`, plus
`DC_20260927.fixtures.json` and `DC_20260927.report.json`. All five archives
match scratch byte-for-byte. Raw SHA-256:
`f7fea2d7cb57c31d5b209bda1e122a8a455260fd944f9f322aea584cbe041c44`.
Core, imported section-78 helper, frozen plan, runner and validator hashes
are recorded; the derived report also hashes its own source.

### Result

Counts below combine contexts/seeds only for display. The frozen gate was
applied to each seed/physics/preparation cell (two contexts per cell): at least
one on success, with the specified negative controls. **All eight cells fail.**
Repeated events and the two contexts are not independent population replicates.

| Physics / preparation | Arm | New face contact | Sustained bridge with both rows exact | Supported original repair | Qualifying release | Final occupied faces across four worlds |
|---|---|---|---|---|---|---|
| body4 / acquire | on | 3/4 | 2/4 | — | 0/4 | 8, 8, 0, 0 |
| body4 / acquire | noBind | 0/4 | 0/4 | — | 0/4 | 0, 0, 0, 0 |
| body4 / acquire | noLigate | 3/4 | 2/4 | — | 0/4 | 8, 8, 0, 0 |
| body4 / acquire | noMelt | 3/4 | 3/4 | — | 0/4 | 8, 4, 0, 4 |
| individual16 / acquire | on | 2/4 | 0/4 | — | 0/4 | 0, 0, 0, 0 |
| individual16 / acquire | noBind | 0/4 | 0/4 | — | 0/4 | 0, 0, 0, 0 |
| individual16 / acquire | noLigate | 2/4 | 0/4 | — | 0/4 | 0, 0, 0, 0 |
| individual16 / acquire | noMelt | 2/4 | 2/4 | — | 0/4 | 0, 4, 8, 0 |
| body4 / release | on | 4/4 | 4/4 | 4/4 | 0/4 | 8, 8, 8, 8 |
| body4 / release | noBind | 0/4 | 4/4 | 4/4 | 4/4 | 0, 0, 0, 0 |
| body4 / release | noLigate | 4/4 | 0/4 | 0/4 | 0/4 | 4, 0, 0, 4 |
| body4 / release | noMelt | 0/4 | 4/4 | 4/4 | 0/4 | 8, 8, 8, 8 |
| individual16 / release | on | 4/4 | 4/4 | 4/4 | 0/4 | 8, 8, 6, 6 |
| individual16 / release | noBind | 0/4 | 3/4 | 3/4 | 3/4 | 0, 0, 0, 0 |
| individual16 / release | noLigate | 4/4 | 0/4 | 0/4 | 0/4 | 4, 0, 4, 4 |
| individual16 / release | noMelt | 0/4 | 4/4 | 4/4 | 0/4 | 8, 8, 8, 8 |

The sustained-bridge metric requires both original rows to be exact, so a
broken noLigate row does not qualify despite its initially supplied support.
The separate supported-repair metric uses the actual support immediately
before the original bond reconnects.

Both successful acquire/on bridges occur in body4 seed 603; neither releases.
The other six on acquisition worlds never sustain a bridge. Individual kicks
permit some first contacts but none of the on contacts become a 25-step bridge.
A near-encounter is therefore not sufficient evidence of useful acquisition.

All eight release/on worlds reconnect while physically supported, yet none
returns both rows to sustained exposed availability. Their face occupancy over
time is 159,016/160,000 possible face-steps in body4 (99.39%) and
158,728/160,000 in individual16 (99.21%). Disabling future binding allows
repair-and-release in 7/8, with much lower occupancy (13.52% and 7.65%). The
remaining noBind individual16 AABB seed-603 world releases fragments without
repair, so it correctly fails. Successful release intervals begin at steps
512–1291 in body4 and 542–729 in individual16; the full per-case report is archived.

All release/on tapes contain new face links after the initially supplied
contacts, demonstrating actual rebinding. The noBind contrast identifies its
importance for sequestration in this preparation. It does not provide a
solution: disabling the acquisition route is incompatible with autonomous
support acquisition. Same-seed branches match preparation, not later individual
RNG events or exact melting histories. No claim is made about an infinite-time
failure to separate, or a universal optimum of binding/melting rates.

Every noMelt world fails qualifying release; every acquire/noBind world fails
bridge acquisition; every release/noLigate world fails repair. No new-neighbor
lateral join or birth occurs. All 16 on cases and 41 other cases are censored
for the primary outcome at 5,000; only seven noBind release controls succeed.
A censored initial-acquisition failure is distinct from retained repaired material.

### Validation, cost and disposition

All 64 observed/plain final state/RNG comparisons and midpoint restarts match
(excluding only the known pinsVersion cache revision). The validator checks
prepared states/geometry, fixed parameters/types, conservation, ordered bond
reconstruction at every step and checkpoint, physical support before links,
all exact/active/bridge/free flags, sustained-window event ordering, actual
side geometry and the independently recalculated promotion gate. Six synthetic
cases cover acquisition/release order, interrupted holds and unsupported repair;
five corruptions of frames, outcomes, tapes, geometry and gate summaries are
rejected. No validity failure, truncated world, retuning or extra seed occurred.

One process, no workers; no other Node process was present before launch.
Ordinary steps: 320,000 observed + 320,000 plain + 160,000 restart continuation
= **800,000**. Pilot steps are already included because the instances continued.
CPU: initial fixtures 0.093 s; execution/raw writing 123.718 s; final validation
6.968 s; report calculation 0.405 s = **131.184 measured seconds**, within the
240 s cap and 80 s QA reserve. Final small validation/report serialization and
shell/Git/documentation/archive-copy overhead are outside these intervals.
Core/historical source and data bytes are unchanged; no default fingerprints
or full physics-suite rerun was needed.

**Park this rate/preparation combination.** No natural-damage search, population
screen, longer horizon, faster melting, stronger binding, heat-cycle rescue or
new repair state is earned. Section 78 retains its prepared physical-effect
lead; section 79 does not establish an autonomous repair cycle or inherited
benefit. The next admissible design question is physically different escape
after partial detachment, for example whether the existing bond-dependent rest
shape could reduce reattachment while preserving repair. That is an untested
mechanical hypothesis requiring a source/geometry prediction and its own
matched-control plan; it is not a newly admitted simulation or a gate rescue.

## 80. A freed endpoint can fold out of binding alignment, in prepared geometry

**Q7 passes its geometry admission gate, not an autonomous-operation gate.**
Source review identifies a mechanical route distinct from retuning section 79:
the existing free-face fold changes the back corners, and lateral pins can turn
the face away. It does not directly retract the face or recognize completion.
The review and fixed comparison with leaving repair parked are in
`passive_escape_plan.md`, written before outcomes. No simulator code changed.

```
node experiments/passive_escape.js experiments/scratch/PE_geometry_20260927.json
node experiments/passive_escape.js --validate experiments/scratch/PE_geometry_20260927.json
```

Six four-block worlds contain two AB dimers, two supplied lateral bonds and one
remaining face bond after a prepared face loss. Initial actual square corners,
positions, orientations and states match in every arm. Compare free-face fold
0 versus 45 at stiffness 0.8, with fold45/stiffness1 as the rigid activation
control; use four and sixteen solver iterations. All worlds have zero random
kicks and disabled binding, melting, ligation and damage. Seed 605 is a setup
identifier, not a stochastic replicate. Same instances pass the first-five-step
viability check and continue to 100; no pilot reset or tuning.

| Solver iterations | Arm | First ineligible step | Eligible samples, steps 76–100 | Final face gap | Final normal mismatch | Maximum retained-pin residual, steps 76–100 |
|---|---|---:|---:|---:|---:|---:|
| 4 | straight, stiffness 0.8 | none | 25/25 | 0 | 0° | 0 |
| 4 | fold45, stiffness 0.8 | 3 | 0/25 | 0.24644 | 43.80867° | 0.06326 |
| 4 | fold45, stiffness 1 | none | 25/25 | 0 | 0° | <1e-15 |
| 16 | straight, stiffness 0.8 | none | 25/25 | 0 | 0° | 0 |
| 16 | fold45, stiffness 0.8 | 1 | 0/25 | 0.24644 | 43.80867° | 0.06326 |
| 16 | fold45, stiffness 1 | none | 25/25 | 0 | 0° | <1e-15 |

Both prespecified gates pass: missing faces become ineligible throughout the
last 25 samples only in the flexible folded arm, while all three existing bonds
remain and their pin residuals stay below 0.1 in that window. Actual corner
measurements establish deformation, unlike the selected-rest-shape failure in
45a. The final mismatch exceeds the existing 40-degree antiparallel tolerance;
the face-midpoint gap remains below 0.35. Increasing solver iterations speeds
relaxation without changing its final shape in this fixture.

**What this does not establish.** The remaining face is supplied and never melts;
there is no autonomous acquisition, release, repair, output or reproduction.
Turning away can prevent useful initial attachment too. At four iterations a
face remains eligible during early relaxation, so ordinary per-step binding can
intervene before the measured exclusion develops. Matching final shapes across
solvers does not prove matching kinetics. Relative random kicks, repair at
stiffness 0.8 and the energy accounting of the prescribed shape switch remain
untested. Samples within a world are not independent evidence. Section 79's
failed operation gate remains failed, and section 47 still warns that a shape
effect is not a reproductive benefit.

All worlds conserve the same two A/two B blocks and three retained bonds. All
observed/plain and midpoint-restart state/RNG comparisons pass (excluding the
nonphysical `pinsVersion` cache revision). Independent calculations from stored
corners agree with engine contact flags, gaps and angles. All 606 saved samples
replay exactly; a corrupted contact flag is rejected. Raw source/plan hashes
are checked, including exact core bytes against `DC_20260927.json`.

Archive: `out/PE_geometry_20260927.json`, its `.cpu.json` and `.validation.json`.
Raw SHA-256: `9670225a4ebe4c3847f28916a2d5e61d425edaecc42537de2cc7b73f66b3f1a7`.
One process, no workers; no other Node process was found before launch. Steps:
600 observed + 600 plain + 300 restart + 600 validation replay = **2,100**.
CPU: 0.702 s execution/analysis/raw write + 0.624 s validation = **1.326 measured
seconds**, within the 30 s budget and its 20 s QA reserve. Final validation
serialization and shell/Git/documentation/archive-copy overhead are outside
these intervals. There were no failed runs or plan deviations. Historical
source/data bytes remain unchanged; full physics suite and default fingerprint
reruns were skipped because no core code changed.

**Next decision:** this physical effect earns one bounded kinetic comparison
of folding versus straight material, with acquisition cost as a co-primary
prerequisite and targeted individual-kick/solver controls. Freeze that plan
before execution. Do not tune rates, fold, stiffness or horizon to rescue it;
a failed tradeoff parks the candidate. Even a kinetic pass would still require
the repair operation at matched stiffness before natural damage or population
work. The sole current queue is ROADMAP, not this historical next paragraph.

## 81. Junction caps and non-chain architectures: port and topology admission

The user's new question prompted a block-design slice, not another repair assay.
`docs/BLOCK_ARCHITECTURES.md` compares open frames, cap-anchored closed rims,
branched tool-bearing strips and ribbons, with concrete cap/junction/rim roles.
The preferred first candidate attaches a separate three-way junction to a cap's
otherwise inert outward edge. This preserves a cap's rail, copying and fuel
contacts within four ports. A direct cap with both rim bonds needs five ports
when fuel access is retained. Polygon corner count does not increase the core's
four working sides. These are proposed roles, not implemented new blocks.

The Squirm3 author's source supports strip ends attached to membrane junctions,
but its cell division also uses a pulling/division reaction sequence. The design
brief links the source and plausible video; the video and full paper were not
inspectable. It distinguishes that reference from our proposed local contract.

### Fixed offline check

Plan: `junction_topology_plan.md`, written before enumeration. Commands:

```
node experiments/junction_topology.js experiments/scratch/JT_20260927.json
node experiments/junction_topology.js --validate experiments/scratch/JT_20260927.json
```

This executable never imports the simulator. It enumerates removals of zero,
one or two edges of a simple rim cycle, then the three pairings of exposed ports
for each disjoint two-edge cut. Duplicate bonds are rejected. All vertices are
retained. Four prepared anchor labels distinguish the two intended strip-end
pairs; these labels and graph traversal are observation only.

| Rim vertices | Cut-only cases | Cut-only two closed rims | Reconnection pairings | Rejected duplicate-edge pairings | Two closed rims | Two rims with intended anchor pairs |
|---|---:|---:|---:|---:|---:|---:|
| 8 | 37 | 0 | 60 | 8 | 12 | 4 |
| 12 | 79 | 0 | 162 | 12 | 42 | 9 |
| 16 | 137 | 0 | 312 | 16 | 88 | 16 |

These are exact combinatorial counts, not success probabilities or independent
worlds. No geometry, rates, seeds, horizon, dynamics, births or descendants are
measured. Rejoining original endpoints always restores one cycle. A segment-
length calculation independently matches the two-cycle totals. With fixed rim
membership, two closed rims require at least two removals and two new joins;
cutting alone cannot suffice. The enumeration admits a graph witness, not a
local chemical pathway or physical ability to bring the new ends into contact.

### Validation and disposition

All counts recompute; inventory, degree, edge counts and anchor distributions
pass. Synthetic malformed/open graphs are rejected, and an altered result fails
validation. Archives `out/JT_20260927.json` and its `.validation.json` match
scratch byte-for-byte. Raw SHA-256:
`eb2ba76681ddb862e7ce53c453ec3e9056f0b4e9565d17dd0e17f5d3a0370dcd`.
Runner, plan, design brief and unchanged core hashes are in the raw report.
Measured CPU: 0.140 s enumeration/self-checks + 0.218 s validation = **0.358 s**,
within the 10 s cap; final serialization, shell, documentation and Git overhead
are outside these intervals. One Node process at a time, zero simulation workers.
No failed enumeration or parameter changes occurred.

**Q8a is geometry next, not cell division.** Specify and freeze a seven-block
cap/J fixture to check simultaneous copy/fuel access, approach and actual polygon
exclusion. Start with an open fork; require a useful autonomous operation and
rebuilding in descendants before a full rim. No new mutable states or core
chemistry were added. Q7b is deferred in response to the user's direction, not
failed, and its admission constraints remain in ROADMAP. Prior wall/stack/repair
failures are unchanged. Evidence level: necessary-condition design accounting,
below physical effect. Full physics suite and fingerprints were skipped because
runtime and historical assay source bytes are unchanged.

## 82. Half-cell caps preserve prepared copying and fuel access

**Q8a passes its prepared geometry gate, not an autonomous-operation gate.**
The corrected user proposal has two independent D-shaped half-cells, each with
its own chain as the straight boundary and its own curved arc. Ordinary copying
faces temporarily join them. The daughter arc may close after release; there
is no shared old rim to divide. This assay tests the first local geometry only.

Frozen plan: `half_cell_geometry_plan.md`. A new physics-only subclass keeps
the existing solver and changes only P/Q rest polygons/edge maps and W stub
geometry (C is the experimental carrier). The caps retain unit copying/rail
edges, a .5 fuel edge and a sqrt(5)/4 angled rim edge. Each fixture has P/Q,
two A, two W and two E: eight conserved blocks, with identical shapes/material
in attached and unbound-rim arms. One unused lateral slot carries each rim pin
only in this fixture. Normal chemistry would misread that bond as a chain
neighbor, so `step`, chemistry and binding throw. No core rule is promoted.
More working sides remain allowed; this is a temporary mechanical representation,
not an argument for a four-side limit.

### Protocol and results

```
node experiments/half_cell_geometry.js experiments/scratch/HC_geometry_20260927_v2.json
node experiments/half_cell_geometry.js --validate experiments/scratch/HC_geometry_20260927_v2.json
node experiments/half_cell_geometry_report.js experiments/out/HC_geometry_20260927_v2.json experiments/out/HC_geometry_20260927.json
```

Output paths refuse overwrites. The initial unsuccessful command used
`experiments/scratch/HC_geometry_20260927.json`; its failure is retained below.
The report accepts an optional new output path; the archived report is
`out/HC_geometry_20260927.report.json`.

Both cap orientations at fixture rotations 0/90 degrees pass all **84 sampled
approach/release placements** (21 displacements from 0 to 2 per orientation).
Actual polygon overlap is at most 1.42e-14; intended pins coincide and the
copying/fuel poses pass geometry checks. These are prepared sampled placements,
not a continuous swept-volume proof, binding events, or independent worlds.
An SVG generated from actual initial corners is archived beside the valid raw.

Twenty-four worlds use seeds 611/613, parent P/Q, attached/unbound W, and
body4/individual4/individual16. Kicks remain sigma .3 / sigmaRot .45;
A/P/Q/W stiffness is .8, with snapCorners and strain breaking off. The first
five steps of the same instances pass viability. Run 100 held physics steps,
then impose removal of the two F-F contacts and run another 100 steps.
No ordinary chemistry, monomer recruitment, growth or reproduction occurs.

The frozen held gate requires at least 24 of steps 76–100 in each world to have
pin residual <=.1, overlap area <=.02, eligible copying faces and fuel placement
overlap <=.02. Body4 and individual16 are required; individual4 is the declared
numerical sensitivity diagnostic. The sample totals below are descriptive.

| Motion / solver | Rim arm | Worlds passing | Good held samples | Maximum held-tail pin residual | Maximum held-tail overlap area |
|---|---|---:|---:|---:|---:|
| body4 | attached | 4/4 | 100/100 | 0.000111 | 0.000419 |
| body4 | unbound | 4/4 | 99/100 | <1e-9 | 0.021808 |
| individual4 | attached | 0/4 | 63/100 | 0.202024 | 0.042394 |
| individual4 | unbound | 4/4 | 100/100 | 0.042615 | 0.006684 |
| individual16 | attached | 4/4 | 100/100 | 0.001092 | 0.000230 |
| individual16 | unbound | 4/4 | 100/100 | <4.1e-7 | <1.5e-7 |

The body4 unbound outlier occupies one sample, within the fixed per-world gate;
it is not discarded. Attached individual4 fails in every seed/end combination.
Increasing resolution is therefore material to this fixture; no claim of
kinetic equivalence between body and individual motion is made. All observed
polygons remain convex within numerical error (max hull excess 5.69e-14).

After **prepared** face removal, all 24 worlds reach a cross-side structural
clearance of .1 by steps 102–114, retaining their supplied rail/rim bonds.
However, later collisions allow cross-side polygon overlap up to **0.261316**.
The worst recorded pair is ordinary A/A in body4, attached, seed 611, parent Q,
step 115. This is an existing exclusion limitation, not proof of a cap-specific
obstruction or reliable nonoverlap during separation. The clearance events do
not establish autonomous release, irreversibility, non-crossing or a stable wall.
Fuel probes show available local poses; they do not show actual fuel capture or
feeding through a completed enclosure. There are no measured descendants.

### Validation, failed attempt and provenance

All 24 observer/plain physical-array/RNG comparisons and midpoint subclass
restarts match, ignoring only the pinsVersion cache. All 4,824 dynamic frames
replay exactly; their geometry and gates recompute from stored actual corners.
Synthetic overlap/distance checks pass; altered corners and an altered aggregate
are rejected. Type inventory and retained bonds are checked. Core and historical
assay sources remain byte-identical; full physics suite/default fingerprints
were not rerun for this isolated fixture.

The first command stopped after its first world's neutrality assertion: setup
left the `open` cache stale whereas restore recomputed it. Setup and prepared
release now refresh the cache. Shapes, parameters and gates were not retuned.
The old runner also counted only completed records, reporting zero steps despite
200 observed + 200 plain + 100 restart steps executed before the assertion.
The failed JSON, CPU record and exact failed source/frozen-plan snapshots are
archived. That first attempt did not retain its failed world's frame trace;
this provenance limitation is not concealed by the successful rerun.

Valid raw: `out/HC_geometry_20260927_v2.json`, SHA-256
`4063556df0f259fbb2aea077d423137911b39322c328981ab2d2f5a9d0124f80`.
Raw/CPU/validation/SVG and failed-attempt files match scratch byte-for-byte.
The report records their hashes and checks both current and failed source inputs.
One simulation process at a time, no workers; process inspection found no other
simulation in this repository. Total physics steps including failure, plain,
restart and validation: **17,300**. Measured CPU: failure .734 s, valid execution
6.234 s, validation 3.749 s, report .421 s = **11.138 s**. A preliminary read-only
aggregation was not CPU-instrumented; the fully inclusive 90 s budget is therefore
not independently verified. Shell, documentation, Git and final report writing
are outside these measured intervals. No parameter search or seed extension ran.

**Next:** the geometry earns an isolated reaction-interface design, with rim bonds
kept distinct from chain-neighbor ports. Before interpreting moving acquisition/
release, compare the existing research polygon-exclusion approach against these
archived core-contact fixtures; do not rewrite unrelated physics or add states
to cover numerical overlap. Then test ordinary chain copying and new-arc growth,
allowing closure after release. ROADMAP holds that order.

The user's proposed radiation payoff remains a hypothesis. Global `pBreak`
ignores walls; physically excluded rays are the relevant existing route, and a
new W needs explicit opacity rather than an enclosure-classification bonus.
The straight copying boundary is exposed, so shielding could be partial. Only
after half-cells renew should ray/opacity ablations and equal-material competitors
measure damage, usable descendants and rim costs. Section 25's earlier walled
extinctions are not overturned by this access result.

## 83. Half-cell contacts: four passes fail, targeted sixteen-pass comparison passes

**Prepared numerical mechanics only.** Q8b reuses the exact eight-block cap
fixtures from 82. Existing research convex-envelope contacts preserve access,
but the original release gate fails in 1/16 polygon worlds. An observer-neutral
solver trace identifies pin/shape corrections reintroducing overlap. A separately
frozen body16 follow-up passes 8/8, alongside 8/8 archived individual16 references,
including an added all-pair overlap bound. The original failure remains failed.

Plans: `half_cell_contact_plan.md`, then `half_cell_resolution_plan.md` after
the measured failure/diagnosis. `HalfCellContactSim` inherits Q8a polygons and
delegates physics to `PolygonContactSim` (68), extending its supported types to
P/Q and E. Actual convex envelopes, inverse masses and incident bonds determine
pair correction. Directly bonded pairs retain their exclusion exemption. No
membrane/ray/droplet cases, strain breaking or snapping are enabled. Unchanged
kick/pin/deformation/wrapping source spans are checked against the core.

All worlds conserve P,Q,two A,two W(C carrier),two E, with .8 stiffness and
sigma .3/sigmaRot .45. Rim pins remain lateral-slot carriers; chemistry, ordinary
steps and binding throw. Run 100 held steps, impose removal of two copying-face
links, run 100 released steps. No reactions read observer IDs; no copying,
growth, autonomous release, descendants or radiation effects are measured.
Body jostling retains its accepted grouped-motion approximation.

Initial comparison: seeds 611/613 × P/Q × attached/unbound × body4/individual16
× core/polygon =32 worlds. Every core frame matches the Q8a archive; all viability
checks pass. Held access requires 24/25 good t76–100 samples, as in 82. Release
requires cross-side overlap <=.02 throughout t101–200, pin <=.1 in at least 99/100
frames and structural clearance >=.1 at least once. These reused worlds are a
paired numerical test, not fresh biological confirmation or independent contacts.

| Contacts / motion | Rim | Worlds passing | Held access pass | Released frames with cross overlap >.02 | Max cross overlap | Max all-pair overlap |
|---|---|---:|---:|---:|---:|---:|
| core / body4 | attached | 0/4 | 4/4 | 27/400 | .261316 | .261316 |
| core / body4 | unbound | 0/4 | 4/4 | 23/400 | .116788 | .116788 |
| core / individual16 | attached | 0/4 | 4/4 | 30/400 | .115990 | .115990 |
| core / individual16 | unbound | 0/4 | 4/4 | 49/400 | .114837 | .114837 |
| polygon / body4 | attached | 3/4 | 4/4 | 1/400 | .073665 | .215652 |
| polygon / body4 | unbound | 4/4 | 4/4 | 0/400 | .000179 | .205565 |
| polygon / individual16 | attached | 4/4 | 4/4 | 0/400 | .000004754 | .000678 |
| polygon / individual16 | unbound | 4/4 | 4/4 | 0/400 | .000000124 | .0000371 |

All 32 worlds reach clearance. Polygon contacts reduce cross-overlap failures
from 129 to 1 of 1600 released frames, but fail the all-world gate. All-pair
measurements expose fuel conflicts missed by the narrower structural measure.
No failed sample/world is removed.

The worst polygon cross case is seed 611/body4/Q/attached/t115, ordinary A/A:
overlap .723739 after kicking, zero after the fourth contact sweep, .073665
after final pin/shape correction (pin residual .192910). The worst all-pair
case is seed 611/P/attached/t143, A/E, .215652. The checked report stores actual
corners and each solver-phase trace; instrumented and plain replay match.
This specific constraint conflict earns one fixed body16 comparison, not a
solver sweep or a change to the failed gate. Its eight initial states differ
only by `iters:16`; shapes, kicks, material and horizon stay fixed. The follow-up
adds all-pair overlap <=.02 in every released frame, including E and bonded
neighbors, also applied retrospectively to the eight individual16 references.

| Polygon contacts | Passing strengthened gate | Held good samples | Max released cross overlap | Max released all-pair overlap | Max released pin |
|---|---:|---:|---:|---:|---:|
| body16 | 8/8 new | 200/200 | .000052244 | .001207 | .006578 |
| individual16 | 8/8 archived references | 200/200 | .000004754 | .000678 | .001739 |

Body 16 clearance occurs at t102–105; every released pin in both settings
satisfies .1. This admits a small rim-interface/association assay at body16
with individual16 controls. Body 4 stays parked for this fixture. Finite
residuals, direct-bond exemption, convex-envelope conservatism and possible
between-step tunneling remain; this is not exact nonoverlap or stable wall proof.
No core-default change or chemical timing state is earned.

Validation: all 40 observed/plain physical-array/RNG checks and t100 subclass
restarts match. Replayed 6,432 comparison plus 1,608 follow-up frames reproduce
actual corners and metrics; material and retained bonds pass. Geometry checks
cover containment, touching, torus and mass-weighted correction. Altered
corners, summaries and job labels are rejected. Two diagnostic traces are neutral.

Two harness failures survive. Initial execution stopped at t0 because the finite
array check treated serialized base64 descriptors as arrays; no physics steps
ran. Its partial record/CPU/source snapshot are archived. Correcting the array
check and decoding initial bonds did not change the protocol. The valid v2
batch's built-in validator then stopped before replay because `fromState`
sets `bondsDirty=true`, unlike the pre-restore archive. The standalone validator
compares with the same restored initial state the runner saves, without globally
ignoring that field. Its full replay passes. The original failed validation
JSON/CPU record and hashed runner remain unchanged: use the standalone validator.

Exact executed commands (use new output stems for repetition):

```
node experiments/half_cell_contact.js experiments/scratch/HC_contact_20260927.json.gz
node experiments/half_cell_contact.js experiments/scratch/HC_contact_20260927_v2.json.gz
node experiments/half_cell_contact.js --validate experiments/scratch/HC_contact_20260927_v2.json.gz
node experiments/half_cell_contact_validate.js experiments/scratch/HC_contact_20260927_v2.json.gz experiments/scratch/HC_contact_20260927_v2.checked.json
node experiments/half_cell_resolution.js experiments/scratch/HC_resolution_20260927.json.gz
node experiments/half_cell_resolution.js --validate experiments/scratch/HC_resolution_20260927.json.gz
node experiments/half_cell_archive.js
```

First and third commands are retained failures. On a fresh checkout, restore
the resolution runner's fixed scratch inputs by copying
`HC_contact_20260927_v2.json.gz` and `HC_contact_20260927_v2.checked.json` from
`out/` to `scratch/` unchanged if absent, refusing overwrites. The standalone
validator also accepts the archived raw path plus a new report path. The archive
utility is completed-batch packaging, not required for replay, and refuses overwrites.

`out/HC_contact_resolution_20260927.manifest.json` records all 13 archived file
hashes/sizes and matching scratch paths, source/input hashes and costs. CPU:
initial failure .358 s, execution 10.374, failed validation 1.311, corrected
validation/diagnosis 8.046, body16 execution 4.311, validation 3.296, archive .843
=**28.539 measured seconds**. Total 28,116 physics steps includes all plain,
restart/replay and 116 diagnostic steps. One process, no workers; command-line
inspection found no other repository simulation. CPU covers startup, analysis
and compression; final CPU-companion writes, manifest serialization, shell,
editing and Git are unmeasured, so fully inclusive caps are not independently
verified. No simulation is active. Core/historical bytes are unchanged; the
full core invariant suite/default fingerprints were not rerun.

Next Q8c: keep rim bonds chemically separate from chain neighbors but present
for mechanics, especially attached-cap docking. Then test local W recruitment
without ancestry, enclosure or completion predicates. Radiation benefit still
requires autonomous half-cell renewal and equal-material controls.

## 84. Separate rim bonds preserve cap chemistry; passive recruitment fails

**Q8c's combined gate fails.** The separate rim interface passes deterministic
chemical/mechanical checks and all eight prepared ordinary-release fixtures.
None of eight near/on worlds forms a new rim bond in 300 steps. Observer-neutral
replay finds no eligible rim encounters at the actual binding phase; on/off
trajectories are identical. Keep the interface, park this passive acquisition
setting. This is not a complete half-cell or a test of shielding/fitness.

Frozen protocol: `half_cell_rim_plan.md`. `HalfCellRimSim` is an isolated subclass
of the Q8 contact solver. W uses the fixed C carrier and is inert to ordinary
letter chemistry. P's outer rim connector is +, Q's is -, and W F/K ends are
-/+. A complementary exposed pair, with at least one W, binds when reversed
endpoint gaps are <=.1 and normals oppose within 10 degrees. Cap/cap rim bonds
are incompatible. No mutable type, new internal state, relay, timer, ancestry,
length or completion predicate is added. Rim bonds persist in this first assay;
persistence is not evidence of material turnover.

`rimBond` is a separate reciprocal table. Chemistry reads ordinary `bond`;
physics temporarily sees their union, including pins, contacts and body
jostling, and restores the ordinary graph before reactions/observation. The
unused cap lateral slot is only a mechanical carrier in that temporary view.
This does not establish a four-side design limit. Q's W is rotated 180 degrees
to use its complementary K end, leaving the same rectangular outline.

Ordinary compatibility/derive/transition rules remain in use for A/P/Q/E.
Current-corner search/vacancy and a mechanically-free check govern docking:
a free block may be projected, but if both participants are attached, a new
pin is added in place only at endpoint gap <=.1. A rim-attached cap is never
snapped alone onto a face. E docking moves neither participant. Shape reset
requires freedom from both bond tables. Undocking kicks, proofreading, strain
breaking and corner snapping are disabled/guarded; broader chemistry is not
claimed supported. No core or historical source is edited.

### Checks and kinetic screen

Deterministic tests cover 12 P/Q × rail present/absent × DOCK/REPEL/TPL cases,
plus supplied-fuel rearming, W's inert ordinary ports, correct/wrong rim labels,
W/W end binding, attachment-off control, no attached-cap projection, poisoned
observer metadata, mechanical-union equivalence, subclass restart and malformed
rim rejection. End signals and ordinary transitions agree with the rim absent;
rim occupancy cannot satisfy a missing rail or keep a rail-less cap armed.
Mechanical union reproduces the prior contact solver's physical arrays/RNG.

Seeds 701/703 × parent end P/Q × body16/individual16 give eight preparations.
Each conserves P,Q,two A,two W,two E. Parent cap/letter begin TPL, daughter
cap/letter DOCK and fuel ON. Both rails and two copying-face contacts are
prepared; ordinary chemistry supplies release, with no imposed unlink. Use
the established .8 stiffness, sigma .3/sigmaRot .45, 16 passes, 24×24 torus.
Breaking, fraying, melting, undocking, spontaneous chain joining and fuel
reload are off; rearming still requires energy.

Each preparation has three arms: supplied rim bonds/new rim binding off
(200 steps), or free W .06 outward from the matching rim faces with binding
on/off (300 steps). This is a prepared near-contact opportunity, not a mixed
bath. All first-five-step finite-state/conservation/pin checks pass. The frozen
prepared gate requires release by t10, clearance >=.1, retained rims/rails and
final20-frame pin <=.1 / overlap <=.02. Recruitment requires sustained parent-cap
W attachment with those final-window bounds in at least one of two seeds per
mode/end stratum. Off must recruit nothing. No rates/shapes/gates were retuned.

| Motion / end | Prepared release gate | Near/on sustained recruitment | Near/off recruitment | Eligible post-motion rim contacts in on worlds |
|---|---:|---:|---:|---:|
| body16 / P | 2/2 | 0/2 | 0/2 | 0 |
| body16 / Q | 2/2 | 0/2 | 0/2 | 0 |
| individual16 / P | 2/2 | 0/2 | 0/2 | 0 |
| individual16 / Q | 2/2 | 0/2 | 0/2 | 0 |

All 24 worlds release both initial face bonds at t1. Prepared structural
clearance occurs at t2–6 and all supplied rims/rails survive. All final-window
geometry gates pass. Prepared worlds sequester both W blocks; near/on and off
leave both W free. There are no W/W or cross-preparation cap/W bonds, no new
rim bonds of any kind, and no newly acquired daughter arc. Final armed chain
units number 2 or 3 out of 4; this is not full rearming or reproductive renewal.
Stock birth counters are not used to call the supplied daughter autonomous.

The [actual prepared release frames](out/HC_rim_20260928.svg) depict two
chain-end fragments with rim stubs, not two complete D-shaped cells.

### What failed, and physical limits

At t0, every near/on world has two eligible prepared contacts at gap .06.
After the first physical movement none is eligible, and there are zero eligible
pairs across all 2,400 inspected binding phases. Per-world closest endpoint
gaps during the run range .18023–.52310, always above .1 even before applying
the opposing-normal requirement. The phase observer leaves every frame/final
state unchanged; all near/on frames equal their matching off frames. Thus the
failure occurs before bond acquisition, not because ordinary copying strips
polymers off or because an arc closes too early. It does not show that no
longer bath run could ever acquire a bond; the fixed screen still fails.

Fresh worlds also expose transient overlap despite the previous numerical
fixtures. The maximum is .235433 between W(C) and P at t1, seed703,
individual16/P/on (and matching off). Replay observes exactly that overlap
after physics, after binding and after chemistry: the binding rule did not
create it. Some prepared body16 worlds also exceed .02 early. The declared
gate checks the final20 frames, so prepared success is not all-time exclusion
or an impermeable boundary. These limits qualify extrapolation from 83's
specific fixtures. No added timing state or blanket solver guarantee follows.

Next: freeze a separate comparison using the existing free-block docking
operation to recruit mechanically free W, against this failed passive rule
and binding-off. Retain in-place binding for attached parts and measure actual
contact, vacancy, pin and overlap outcomes. Do not simply widen this rule's
tolerances, extend its horizon or add a completion signal. Curvature, closure,
whole-chain acquisition, descendant renewal and radiation payoff remain later.

### Reproduction and cost

```
node experiments/half_cell_rim_test.js experiments/scratch/HC_rim_20260928.tests.json
node experiments/half_cell_rim_assay.js experiments/scratch/HC_rim_20260928.json.gz
node experiments/half_cell_rim_assay.js --validate experiments/scratch/HC_rim_20260928.json.gz
node experiments/half_cell_rim_diagnose.js experiments/scratch/HC_rim_20260928.json.gz experiments/scratch/HC_rim_20260928.diagnosis.json
node experiments/half_cell_rim_archive.js
```

Use unique output stems on rerun. The assay names the scratch tests input:
restore `HC_rim_20260928.tests.json` from out to scratch unchanged if absent,
refusing overwrite. The manifest records exact source/input/artifact hashes,
matching scratch/archive bytes and costs. All 24 observed/plain physical-array
and RNG comparisons and midpoint subclass restarts pass. Validation replays
all 6,424 frames, recomputes actual-corner metrics and gates, checks both bond
graphs, and rejects altered corners, rim lists, job labels and aggregates.
No execution/test/validation attempt failed; the experimental gate did.

Total **24,823 physics steps** includes 16,000 observed/plain/restart, 6,400
validation, 22 tests and 2,401 diagnosis. Measured CPU: tests .468s, execution
16.734, validation 10.687, read-only inspection .452, diagnosis 3.858, archive
.781 = **32.980s**. Startup, analysis and compression are included; final small
bookkeeping/manifest writes, shell, editing and Git are unmeasured. The fully
inclusive cap is therefore not independently verified. One process/no workers,
no other repository simulation found; none remains active. Core/historical
bytes are unchanged; the full core suite/default fingerprints were not rerun.

## 85. W uses ordinary polymer end-corner capture

2026-09-28, Q8d. The user asks why W does not attach automatically like other
polymers. Q8c imposed an unnecessary nearly-flush edge requirement. The
[frozen correction](half_cell_polymer_plan.md) replaces it with the existing
membrane end-corner criterion and probability in an isolated subclass,
`HalfCellPolymerSim`. This supersedes the proposed free-W docking comparison;
no projection experiment was run. Core and historical source bytes stay fixed.

### Rule and functional checks

P+/W+ use the native membrane R endpoint role; Q-/W- use L. Unoccupied,
complementary end corners can bind within `(memLinkTol || linkDistTol)` times
mean size, if the side normals have dot product <=0. Existing defaults give
distance .1125 for cap/W, .075 for W/W and `pMem=.2` per eligible contact.
Binding writes one reciprocal incident rim bond without changing either pose.
Existing edge pins subsequently act on it. W is always sticky: M's raw/active
ecology is not imported. No copying-progress, fuel, ancestry or observer read,
new state, conversion, tolerance knob or rule for a whole assembly is added.
The inherited mechanical bond union/body jostling exception remains as in 84.

Twenty-four geometry decisions (P/Q, angles 0/30/90/120 degrees, offsets
0/.06/.2) match the actual core M geometry branch via a physical-array adapter.
Both 30-degree cap encounters attach despite failing the old two-end gap
criterion. Six state/energy settings, wrong labels, binding-off and unchanged
poses pass. Additional functional tests extend an already cap-bound W at
either free end, retain its cap attachment, reject occupied ports/zero rate,
preserve poses/material/ordinary bonds and restore the newly formed bonds.
These deterministic attachment tests use `pMem=1` and do not step physics;
they establish association behavior, not stable angled relaxation or bath growth.

### Same-world kinetic screen

Reuse 84's 24 exact initial worlds: seeds 701/703, P/Q ends, body16/individual16,
prepared 200 steps and near/on/off 300 steps. All inventories, shapes, kicks,
ordinary chemistry and the gate are unchanged. Each world has P,Q, two A,
two W and two E. Only the rim association method changes; kinetic `pMem=.2`.

| Motion / end | Prepared release gate | Near/on sustained recruitment | Near/off recruitment | Eligible on encounters |
|---|---:|---:|---:|---:|
| body16 / P | 2/2 | 0/2 | 0/2 | 1 |
| body16 / Q | 2/2 | 0/2 | 0/2 | 0 |
| individual16 / P | 2/2 | 0/2 | 0/2 | 0 |
| individual16 / Q | 2/2 | 0/2 | 0/2 | 0 |

The combined gate fails, with no new bonds of any kind. One eligible encounter
occurs at t6 in seed703/body16/P/on and the .2-probability attempt misses.
The old criterion admits none. Across all eight on worlds there are 2,400
binding phases, not 2,400 independent contact opportunities. Seven on/off
frame sequences match; the eighth diverges at t7 after the extra RNG draw,
despite no new bond. Do not claim later event-by-event matching. Prepared/off
controls match all archived frames and all 16 final physical states/RNG.

All prepared worlds release their initial face contacts at t1 and retain rims;
all final-window geometry gates pass. Transient maximum overlap remains
.235433 and maximum pin residual .106373 across the full batch, so this is
not all-time exclusion. Prepared arms retain both W; all on/off W stay free.
There is no new daughter arc, W/W product, autonomous full-chain assembly,
complete half-cell, descendant renewal or evidence about radiation advantage.

Keep the simpler automatic polymer rule, while recording this preparation's
failed acquisition gate. A single failed stochastic contact is not evidence
that W needs a copying timer or fuel. Retire the sparse near-contact screen;
next freeze a short prepared cap/W and W/W angled-contact relaxation check
against actual membrane/binding-off controls, measuring pins, overlap and
free-end access under both motion modes. Do not promote to a longer bath run
or add states on this evidence. Fuel alternatives are recorded separately in
the cap memo; no energy mechanism or setting changed here.

### Reproduction, failures and cost

```
node experiments/half_cell_polymer_assay.js experiments/scratch/HC_polymer_20260928_v2.json.gz
node experiments/half_cell_polymer_assay.js --validate experiments/scratch/HC_polymer_20260928_v2.json.gz
node experiments/half_cell_polymer_test.js experiments/scratch/HC_polymer_20260928.extensions.json
node experiments/half_cell_polymer_archive.js
```

Use unique stems for assay/test reruns. Input is the archived 84 raw file, with
no scratch dependency. The first attempt, stem without `_v2`, failed because
the native-M test adapter omitted its size array. It ran zero physics steps.
The exact failed source/raw/CPU record are retained; adding that array fixed
only the test harness, without changing mechanism, parameters or gate.

All 24 observer/plain comparisons and midpoint restarts pass. Validation
replays 6,424 frames, recomputes metrics/gates and rejects four corruptions
(corner, job label, rim list, aggregate). The manifest verifies source/input
hashes and byte-identical archive copies, plus archived control state/RNG.
[Manifest](out/HC_polymer_20260928.manifest.json),
[raw](out/HC_polymer_20260928_v2.json.gz).

Total **22,400 physics steps**: observed/plain/restart 16,000, validation 6,400;
functional tests and failed attempt step no physics. Measured CPU **28.199s**:
failed harness .608, execution 15.859, validation 10.234, extension tests .124,
archive 1.374. Includes startup/compression; one read-only summary inspection,
shell/editing/Git and final small bookkeeping writes are unmeasured. The fully
inclusive 180s cap is not independently verified. One process/no workers,
none remains active. Historical/core hashes verified unchanged; full core
suite/default fingerprints were not rerun for this isolated research change.

## 86. Prepared angled polymer joints settle and leave a usable end

2026-09-28, Q8e, [frozen plan](half_cell_settle_plan.md). RESULTS85 establishes
automatic W association but leaves post-capture mechanics untested. Here
ordinary edge pins relax prepared angled cap/W and W/W joints, compared with
native M end joints and the same parts left unbound. No chemistry or bath
acquisition runs. This measures a physical prerequisite, not autonomous growth.

### Fixture and contract

`SettleSim` extends the unchanged `HalfCellPolymerSim`; its only physics
adaptation admits M to the existing all-pair polygon-contact whitelist. Directly
bonded pairs retain the inherited exclusion exemption; pins, deformation and
body motion are unchanged. The assay forbids ordinary steps and calls physics
alone. Observer IDs, probe poses and measured outcomes never enter reactions.
No states, port labels, rates, energy rules or core changes are introduced.

Pattach/Qattach prepare a cap/rail and one incoming W; Pextend/Qextend also
prepare a cap-bound W and bring another W to its free end. Each contains one
P or Q, one A and three W. M+/M- prepare an M dimer with another M contacting
either end, plus a spare M and a parked A. All worlds contain five conserved
blocks. On/off inventories and poses match exactly. Native M controls are
different-shape mechanical benchmarks, not equal-material fitness comparisons.

One complementary end corner touches with a 30-degree outward opening and
zero initial overlap. The on arm **imposes the eligible bond** without moving
either polygon; off leaves it absent. The native M geometry/compatibility and
actual core M binding function are used; W uses the tested rim interface.
Existing `pMem=.2` stays unchanged but its draw is bypassed by this prepared
intervention. No later binding occurs. None of these attachments is counted
as a birth or autonomous acquisition.

Fresh seeds733/739 x body16/individual16 x six fixtures x on/off produce
48 worlds, each 60 physics steps. Stiffness .8, sigma .3, sigmaRot .45,
16 solver passes, 24x24 torus; W/caps retain their previous shapes, while
native M uses wedge45, size.5, stiffness.8, mobility1. All initial geometry
and first-five-step viability checks pass after the harness repairs below.

### Outcome

The frozen gate requires all bound worlds to retain every prepared bond and
have pin <=.1, all-pair overlap <=.02 and usable free-end fit in every final10
frame. An observer rigidly aligns the already conserved spare at the incoming
block's other end using actual corners, measuring its overlap and pin fit
without moving it in the world. The test requires at least one bound-versus-
unbound alignment benefit per fixture/motion stratum, and all native controls
to pass. All conditions pass.

| Prepared joint | Bound final gate | Unbound candidate stays aligned | Maximum final-window pin | Maximum final-window overlap |
|---|---:|---:|---:|---:|
| P cap / W | 4/4 | 0/4 | .000146 | .000044 |
| Q cap / W | 4/4 | 0/4 | .000077 | .000023 |
| Extend P-bound W | 4/4 | 0/4 | .044847 | .005329 |
| Extend Q-bound W | 4/4 | 0/4 | .080312 | .009121 |
| Native M, positive end | 4/4 | 0/4 | .000278 | .000040 |
| Native M, negative end | 4/4 | 0/4 | .000296 | .000070 |

All 24 bound worlds leave their next port unoccupied. Maximum final-window
probe overlap is below 4.5e-13 and probe pin gap below 8.8e-8. All material
and all original/prepared bonds remain fixed; off makes no new bonds. Bond
retention is expected because this fixture disables chemistry/loss. The result
of interest is actual alignment and space for the next part, beyond waiting.

Transient errors remain substantial in one Q extension (seed733/individual16,
t3): overlap **.223063**, maximum pin **.606927**. The combined geometry/access
criterion becomes permanently good between t1 and t50, depending on the world;
this includes temporary probe obstruction, not just joint alignment. Native-M
transient overlap stays below .000114. Thus the final-window pass does not
establish continuous exclusion, a sealed wall or native-M-equivalent robustness.
[Actual frames, including the overlap](out/HC_settle_20260928.svg)
([PNG](out/HC_settle_20260928.png)) show both extension orientations. The dashed
block is a hypothetical placement of the conserved spare, not a new attachment.

This supports keeping ordinary polymer capture and edge pins without a timing
or fuel gate. Admit one curved-W/full-D **prepared geometry** design next:
derive compatible edge lengths and an arc for the chain/cap span, then check
actual copying access and release clearance. Current W is straight. No longer
bath run, growth claim, reproductive closure or radiation benefit follows from
these prepared fixtures. The temporary exclusion error remains a limitation
for any eventual protective-wall claim.

### Reproduction and validation

```
node experiments/half_cell_settle.js experiments/scratch/HC_settle_20260928_v5.json.gz
node experiments/half_cell_settle.js --validate experiments/scratch/HC_settle_20260928_v5.json.gz
python experiments/half_cell_settle_report.py experiments/scratch/HC_settle_20260928_v5.json.gz experiments/scratch/HC_settle_20260928
node experiments/half_cell_settle_archive.js
```

The figure script requires Pillow; this run used the bundled runtime Python
named in the environment, since `python` need not resolve there on Windows.
Use unique output stems. Four failed preflights are preserved with exact source
snapshots: unexported metadata helper; unexported polygon/side/contact helpers;
dirty-bond cache after restore; open-port cache not refreshed after prepared
native-M binding. All occurred before any physics step. Repairs added local
analysis helpers and synchronized setup caches; no geometry, rule, parameter,
seed or gate was retuned. Each earlier raw/CPU/source remains archived.

All 48 observer/plain and midpoint restart comparisons pass. Validation
reconstructs each setup, replays **2,928 frames**, recomputes every metric/gate,
checks full final arrays/RNG and rejects altered corners, labels, rim lists
and aggregates. Source/artifact hashes and exact scratch/archive copies are
verified in the [manifest](out/HC_settle_20260928.manifest.json).
The SVG/PNG was inspected: six legible panels include both transient worst
frames and clearly distinguish measured spare placement from simulation.

Total **10,081 physics steps**: 7,200 observed/plain/restart plus 2,881 replay
(including one corruption-test step). Measured CPU **10.712s**: failed attempts
.515/.515/.733/.765, execution4.140, validation2.968, report.594, logged
inspection.155, archive.327. Python imports/package checks, one additional
read-only inspection, shell/editing/Git and final small bookkeeping are not
timed; the fully inclusive cap is not independently verified. One process,
no workers or other repository simulation found; none remains active.
Core/historical source hashes are unchanged. The full core suite and default
fingerprints were not rerun for this isolated assay.

## 87. Complete paired D geometry: static fit, unresolved dynamic overlap

2026-09-28, Q8f/P0. [Frozen geometry plan](half_cell_arc_plan.md),
[assay](half_cell_arc.js), [neutral diagnosis](half_cell_arc_diagnose.js),
[separate resolution plan](half_cell_arc_resolution_plan.md) and
[runner](half_cell_arc_resolution.js). This tests the user's two independent
half-cells with their own straight copying boundaries and curved W arcs.

### Design and intervention

One fixed design, derived before simulation: P-A-A-Q has nominal cap origins
(0,0),(0,3). Extending the existing angled rim edges gives center(-1.25,1.5),
inner radius .75*sqrt(5), outer radius sqrt(5), exterior sweep233.130102 degrees.
Eight identical convex W trapezoids each turn29.141263 degrees; both radial
contact edges have length sqrt(5)/4, matching each cap's rim edge. The second
assembly rotates180 degrees around(.5,1.5), placing its Q-A-A-P boundary on the
first chain's four exposed copying faces and its own arc on the opposite side.
It is a bulging D rather than an exact semicircle. No changed caps or handed
W variant is needed. The design and centered polygon coordinates are in raw.

ArcSim changes the research C/W rest polygon only; it inherits separate rim
storage and native-polymer end compatibility. The two other W sides stay inert.
No chemical state, side mark or runtime chain-length/closure predicate is added.
Its area .53261744 determines sizeC=.72980644 so the inherited square-size mass
proxy equals area; rotational inertia remains the inherited square-size proxy.
Actual corner contact/shape matching, not an observer's circle, drives mechanics.
All IDs and half-cell groups are observer/setup data. Core sources are unchanged.

Each world has two prepared12-block halves (16 W,4 A,2 P,2 Q total), plus4 free E,
in a24x24 torus: **28 conserved blocks**. No chemistry, binding, fraying, fuel
consumption or spontaneous loss runs. All initial bonds are imposed. The four
temporary copying-face bonds are removed experimentally after step40; physics
continues to120. Fuel-access probes analytically place an existing E polygon
without changing world state or creating material. Closed/open arms differ only
by omission of the middle W/W joint in each arc; initial poses/material match.
These controls diagnose closure mechanics, not reproductive fitness.

Seeds761/769 x body/individual motion x closed/open =8 original worlds at16
solver passes, sigma.3, sigmaRot.45, stiffness.8. All initial static tests pass:
actual overlap/pin/closure gaps <=1e-9, all four ordinary copying pairs satisfy
core geometry and compatibility, cap fuel probes fit, all rim pairs have correct
labels and eligible native corner geometry. Observer translations of the second
D by0,.1,...,2 produce no cross-overlap (168 checked placements, repeated
geometry across8 worlds, not168 independent samples). All first5-step viability
checks pass. Static probes preserve arrays and RNG.

### Outcomes and separately frozen follow-up

The gate requires **every closed world** to pass. In held frames31–40 and
released frames111–120: pin residual <=.1 and structural pair overlap <=.02;
held copying geometry remains eligible and cap fuel-probe overlap <=.02.
All own bonds must persist, with an inter-half gap >=.1 at least once after
release by120. Open controls need not fail. Overlap below is area, not distance.

| Passes | Motion | Closed held gate | Closed released gate | Closed total gate | Open total gate | Largest closed overlap, whole run |
|---|---|---:|---:|---:|---:|---:|
|16, original|body|2/2|2/2|2/2|2/2|.010070|
|16, original|individual|0/2|0/2|0/2|0/2|.048558|
|32, separate comparison|body|2/2|2/2|2/2|2/2|.005455|
|32, separate comparison|individual|1/2|2/2|1/2|0/2|.021333|

Every world reaches the separation-gap condition, at t42–54. At16 the closed
individual held maximum pins are .117121/.115866 and overlaps .023162/.048558
for761/769; released maxima are pin .077983/.122984, overlap .024188/.020795.
All-pair maxima including E equal the structural maxima in these runs. Full
per-world maxima, fuel probes and open-arc gap/error controls remain in raw/report.

The unchanged-parameter diagnostic replays seed769 individual16 t36. Its worst
pair is **directly bonded ordinary A/A**, excluded by polygon contact correction;
the pin/shape solver is still converging. Across the last five completed passes
(12–16), max pin falls .154443,.143103,.133058,.124016,.115866 and largest overlap
.062068,.058328,.054836,.051573,.048558. Instrumentation preserves the exact
frame, final physical arrays and RNG. This is numerical evidence, not an arc
self-collision or evidence that W needs a timing program.

That distinct cause admitted one **separately frozen** P0 comparison at32, using
the same saved eight initial worlds and every other parameter unchanged. It does
not revise the original failed gate. Initial arrays/RNG are equal; later paths
are not claimed event-by-event matched. The follow-up also fails its all-world
gate: seed769 individual32 held overlap **.02133344184 > .02**, at t36. Its held
pin .054567 and fuel-probe overlap .002576 pass; its released pin .072672 and
overlap .013342 pass. All four closed released windows pass at32. The two open
individual controls still fail, and their final mid-arc gaps reach1.25–2.15.
No third resolution or threshold/angle/stiffness/horizon rescue is permitted.

[Original actual frames](out/HC_arc_20260928.svg) and
[32-pass actual frames](out/HC_arc32_20260928.svg)
([PNG](out/HC_arc32_20260928.png)) show seed761 at0/40/120 in both motion modes.
They illustrate the topology and separation, **not failing seed769**. All four
free E are outside the structural crop, explicitly labelled. Neither prepared
arc construction nor imposed release is autonomous growth/division. Bond
retention with loss disabled is not chemical persistence. No radiation barrier,
energy sufficiency, inherited function, descendants or selection is demonstrated.

**Decision:** retain the static geometric lead; park this dynamic setting.
Ordinary chemistry/growth is not promoted. Next is a narrow source/archived-frame
audit of bonded A/A exclusion versus pin/shape correction, deciding whether a
distinct small mechanical correction has a causal case. This does not license
a general physics rewrite, another resolution sweep or new reaction states.

### Reproduction, validation and cost

```
node experiments/half_cell_arc.js experiments/scratch/HC_arc_20260928.json.gz
node experiments/half_cell_arc.js --validate experiments/scratch/HC_arc_20260928.json.gz
python experiments/half_cell_arc_report.py experiments/scratch/HC_arc_20260928.json.gz experiments/scratch/HC_arc_20260928
node experiments/half_cell_arc_diagnose.js experiments/scratch/HC_arc_20260928.json.gz experiments/scratch/HC_arc_20260928.diagnosis.json
node experiments/half_cell_arc_resolution.js experiments/scratch/HC_arc32_20260928.json.gz
node experiments/half_cell_arc_resolution.js --validate experiments/scratch/HC_arc32_20260928.json.gz
python experiments/half_cell_arc32_report.py experiments/scratch/HC_arc32_20260928.json.gz experiments/scratch/HC_arc32_20260928
node experiments/half_cell_arc_archive.js
```

Use unique output stems; no overwrites. The resolution runner requires the fixed
original scratch input. If absent, restore the archived original with:

```
node -e "const f=require('fs');f.copyFileSync('experiments/out/HC_arc_20260928.json.gz','experiments/scratch/HC_arc_20260928.json.gz',f.constants.COPYFILE_EXCL)"
```

Python/Pillow reports used the bundled runtime Python on Windows. Both SVG/PNG
renders were inspected. All16 observer/plain and midpoint-restart checks pass;
validators replay1,936 frames including initial states, recompute metrics/gates,
check final physical arrays/RNG, and reject eight corner/label/bond/aggregate
corruptions. The original validator reconstructs static geometry; the32 validator
also verifies its sole parameter change and exact reference initial arrays.
No harness execution failed. Geometry gate failures are complete negative runs.

The [manifest](out/HC_arc_20260928.manifest.json) preserves15 byte-identical raw,
CPU, validation, diagnosis and figure files plus source/input hashes. Total
**6,792 physics steps**: each resolution has2,400 observed/plain/restart and960
replay; diagnosis adds72. Measured CPU **121.401s**: original execution29.296,
validation15.952; comparison46.280/24.343; diagnosis2.437; reports1.0625/1.171875;
archive.859. Node includes startup/compression; Python imports, read-only
inspections, shell/editing/Git and final small bookkeeping are unmeasured, so
the fully inclusive180s cap is not independently verified. One simulation
process, no workers; no other repository simulation found and none remains
active. Core/historical hashes unchanged; full core suite/default fingerprints
were not rerun for this isolated geometry assay.

## 88. Live half-cell chemistry and an opt-in viewer

2026-09-28, Q8g. The user approved the shape and asked to integrate it into the
real simulation. [Frozen plan](half_cell_live_plan.md),
[runtime](half_cell_live.js), [assay/validator](half_cell_live_assay.js),
[server](../tools/half_cell_server.js) and [viewer](../half-cell.html).
This user direction supersedes the previous queue's chemistry-admission stop;
RESULTS87's failed dynamic gates remain failed. Source inspection confirms the
contact solver omits directly bonded pairs and finishes each pass with pin/shape
correction. Applying generic separation to bonded pairs could fight the pins;
no such correction or further resolution sweep was justified or implemented.

### What is integrated

LiveHalfCellSim reuses Q8f's curved W rest geometry and HalfCellPolymerSim's
rim/chain interface, calling actual `Sim.step`: physics, binding, chemistry.
P/Q/A/E run the existing ordinary rules. W automatically binds complementary
empty ends at native-polymer corner contact with pMem=.2; it never enters
letter chemistry. No new chemical state, relay, type conversion, scheduled
release, target-position reader or material insertion occurs during stepping.
Rim bonds currently do not decay. The numeric16-pass contact solver is unchanged;
body jostling is the exploratory default, individual kicks a sensitivity check.

The28-block inventory and24x24 world are unchanged from Q8f:4 A,16 W,2 P,2 Q,4 E.
One D has P-A-A-Q plus8 W. The three starts use identical material: (1) one
prepared D and nonoverlapping randomly placed free material, (2) one D and loose
daughter parts already at compatible positions, (3) two complete prepared Ds
joined by copying bonds. All relocation and imposed bonds belong to setup only.
The second start is an encounter preparation, not random-bath acquisition.
Ordinary pMelt=.1, pMeltRun=.001, pMeltEnd=-1 and pReload=.002 are restored from
core defaults; energyGate=true. Sigma.3, sigmaRot.45, stiffness.8, iters16.
No radiation or separate energy hypothesis is tested.

The Node loopback server and browser page run this same runtime, with run/pause,
step/+100, three starts, random seed, body/individual motion, follow/whole-world
view and research save/load. Actual deformed corners and rim/copying bonds are
drawn. Counts use read-only topology traversal; no observer classification feeds
reactions. Closed-rim counts indicate connectivity, not an impermeable wall or
a successful offspring. Unpaired means all chain copying faces are empty; a
spatial gap, active state and descendant operation remain distinct properties.
The standard viewer links to the local lab; default chemistry is unchanged.

### Integration outcomes

Seeds787/797 x body/individual x three starts =12 worlds,120 ordinary steps each.
First5-step and final/material checks pass. No manual release occurs after setup.

| Start | Worlds | Newly complete capped chains | Newly closed Ds | Prepared pair releases | New rim bonds by120 |
|---|---:|---:|---:|---:|---:|
|Random loose bath|4|0|0|not applicable|0|
|Prepared loose contacts, moving|4|0|0|not applicable|1 total, seed787/body only|
|Prepared complete pair|4|0 (already prepared)|0 (already prepared)|4/4 at t1|0 (already prepared)|

In the paired start, all four copying contacts disappear at t1 through ordinary
chemistry and both chain/rim graphs remain complete to120. One of the two closed
assemblies is active at120; the prepared daughter is unpaired but not fully armed.
The two seed787 moving-contact worlds reach up to2 copying contacts; seed797
contact and all bath worlds reach0. These are short integration checks, not
50k–150k population screens: no free-bath reproduction is demonstrated or ruled
out. No longer run, rate rescue or new state was added after these zeros.

Separate deterministic functional tests start with the same prepared loose
contacts, but zero kicks and ordinary melting disabled for12 steps. All four
pMem0/1 x rimBindfalse/true combinations assemble and release a second capped
chain. Only pMem1/rimBindtrue acquires the9 missing cap/W and W/W bonds, including
closure, yielding two closed Ds; the three off controls acquire0. This shows
automatic attachment/extension/closure coexisting with ordinary copying and
release, without a timing gate. It is **prepared-contact function**, not successful
stochastic growth. Material, W type and ordinary/rim port separation stay fixed.

Across moving worlds, largest convex-outline overlap is **.194134** (seed787
body/contacts), largest pin gap **.583212**, both transient. Paired-world maxima
range .020007–.034653 overlap and .061901–.211148 pin. The known exclusion problem
persists; neither body mode nor this integration establishes a sealed boundary.

Charged E briefly falls from4 to3 in seed787 individual/contacts and returns to4;
other screened worlds retain4. Thus ordinary fuel use/reload occurs in one
partial-assembly world, while no newly complete active daughter is established.
The preliminary manifest's phrase "no fuel utilization" was wrong; its
[explicit correction](out/HC_live_20260928.correction.json) accompanies the
unchanged manifest for provenance. No evidence here requires a new fuel rule.

### Validation, reproduction and disposition

```
node experiments/half_cell_live_assay.js experiments/scratch/HC_live_20260928.json.gz
node experiments/half_cell_live_assay.js --validate experiments/scratch/HC_live_20260928.json.gz
node tools/half_cell_server_test.js experiments/scratch/HC_live_20260928.http.json
node experiments/half_cell_live_archive.js
node tools/half_cell_server.js
node build.js
```

Use unique output names. Archived Q8f inputs are read directly, no scratch
prerequisite. Runtime still depends on the research modules and archived catalog;
it is not bundled into the core or standalone generated HTML. Run the server
from the repository root, then open http://127.0.0.1:8787. It starts paused and
only steps on request; one shared world is served to its tabs. Ctrl+C stops it.

All12 observer/plain and midpoint-restart comparisons pass. The validator
reconstructs all initial worlds, replays1,452 frames, recomputes topology/geometry
and summaries, matches final arrays/RNG and rejects a corrupted aggregate.
Functional checks cover observer neutrality, exact save continuation, cut-rim
classification and four invalid-save cases. HTTP checks verify ordinary release,
save/load continuation, alternate setup/motion and invalid-request preservation.
Browser checks exercise reset, one step, +100, run/pause and both view/motion
controls; actual polygons render and the console has no errors/warnings.
The browser file picker was not exercised; save/load continuation was checked
through HTTP. Build passes. No failed harness executions occurred.

[Manifest](out/HC_live_20260928.manifest.json) archives five raw/CPU/validation/HTTP
files with exact source/input hashes. Measured **5,112 physics steps**, plus123
untimed smoke/browser steps: assay3,651 (51 functional,1,440 observed,1,440 plain,
720 restart), validation1,440, HTTP21. Measured CPU **64.326s**: execution41.546,
validation19.953, HTTP1.765, archive1.062. Node costs include startup/compression;
initial smoke, live UI/server, read/edit/build/Git are unmeasured, so the fully
inclusive180s cap is not independently verified. One assay process at a time,
then the local viewer server, left paused. Core/historical source hashes are
unchanged; full core suite/default fingerprints were not rerun for this isolated
runtime bridge and viewer link. Generated pages were rebuilt.

**Decision:** deliver the exploratory live mode and keep the numerical caveat.
Prepared local operation works; autonomous cell reproduction remains open.
Next freeze a bounded free-bath on/off screen with early viability and actual
encounter/attachment accounting before adding mechanisms. Promising operation
still needs targeted individual-motion geometry checks and descendant turnover.

## 89. Free-bath W growth without chain acquisition

2026-09-28, Q8h. The user requested one bounded slice before an instance switch.
[Frozen plan](half_cell_bath_plan.md), [summary](out/HC_bath_20260928.summary.json),
[actual final polygons](out/HC_bath_20260928_v2.svg),
[manifest](out/HC_bath_20260928.manifest.json).

### Question and fixed contract

Does the live runtime acquire a new complete half-cell in a small bath on an
ordinary screening horizon? RESULTS88 tested only120 moving steps. This assay
changes no runtime rule, shape, state, rate, fuel mechanism or core source.
Fresh seeds809/811 each run50,000 ordinary steps with future rim binding on/off;
body jostling,16 solver passes and all other Q8g settings remain fixed. The
prepared founder D remains in both arms. Initial arrays/RNG match within each
seed, but conditional RNG draws can diverge subsequent trajectories.

Each24x24 world conserves28 blocks:4 A,16 W,2 P,2 Q,4 E. The founder is P-A-A-Q
with8 W; the remaining structural material permits one offspring, not sustained
turnover. W binds automatically through existing end-corner contacts with pMem=.2
and persistent rim bonds. Reactions never read observer identities, components,
completion, detachment or ancestry. Read-only observers record bonds, contact
eligibility and physical outputs; they do not supply actions to the runtime.

Primary success requires a new capped chain and cap-to-cap W rim, empty copying
faces, no external structural bonds, actual gap>=.1 and100 consecutive steps of
persistence. Active state, exact versus variant organization and an unpaired
bare chain are distinct outputs. The bare-chain detachment metric excludes
partial W attachments; a complete D includes its own rim when checking distance.
Neither on world reaches even the earlier capped-chain condition.

### Outcomes

All four worlds finish50k without censoring. No new chain rail bond, capped
chain, closed D, detached complete output or active offspring appears. The
founder remains the only capped chain and closed D. The ordered bond tape also
shows zero short rail fragments, so this zero is not merely an exact-copy filter.

| Seed/arm | Phase-start eligible rim pairs (distinct port pairs) | New rim bonds | New copying bonds | Ordinary placement rejected/attempted | Charged E minimum |
|---|---:|---:|---:|---:|---:|
|809/on|44 (31)|6|1|14/15|4|
|809/off|116 (57)|0|1|4/5|4|
|811/on|15 (13)|7|2|3/5|4|
|811/off|127 (56)|0|1|18/19|4|

Phase-start counts include repeated contacts and are not independent samples.
The on worlds actually test90,430/13,248 rim geometries, with44/15 eligible calls;
off arms execute no rim-binding tests, but the neutral observer records their
would-be eligible phase-start pairs. The6/7 successes are stochastic outcomes,
not estimates from independent replicates. On/off exposure differences include
changed shapes, occupied ports and divergent random draws.

Ordinary placement is counted **after** candidate, compatible-side, geometry and
probability filters. Across all worlds39/44 attempts fail:34 free-block projection
rejections and5 attempts involving two mechanically bound blocks. These are not
the total encounter opportunities. Existing code checks polygon slot overlap for
a projected free part and a gap limit for two bound parts; this assay does not
record the attempted sides or blocking polygon. Therefore the rejection counts
identify a diagnostic stage, not the causal geometry or a proven algorithm bug.
There are5 successful face bonds in total, no face removals, no new rail bonds
or fuel bonds. Every E stays charged at every observed step. Fuel exhaustion is
not implicated; failure occurs before a complete output needs rearming.

W acquisition is real but incomplete. In809/on the spare caps become connected
by a two-W arc; separate free W components contain2,3 and1 blocks. In811/on the
spare caps carry2 and1 W respectively, with a separate five-W free arc. The
founder's8 W remain attached. Thus2/3 additional W are cap-bound,6/5 are outside
cap-bound components, and only1/0 W remain isolated. No free W ring appears at
any step. Off arms keep all8 spare W isolated. This material sequestration may
matter, but rim-off also fails to assemble rails; premature W growth alone does
not explain the observed chain failure.

Geometry is sampled every500 steps, not continuously. Maximum sampled convex
overlap/pin gap is .016187/.037573 (809/on), .006209/.024692 (809/off),
.203795/.263823 (811/on), .005853/.031694 (811/off). The known numerical issue
persists. These data do not pass the old mechanical gate, establish a sealed
wall, demonstrate radiation protection or compare reproductive fitness.

### Validation and reproduction

```
node experiments/half_cell_bath.js --preflight experiments/scratch/UNIQUE.preflight.json
node experiments/half_cell_bath.js 809 on experiments/scratch/UNIQUE_809_on.json.gz
node experiments/half_cell_bath.js 809 off experiments/scratch/UNIQUE_809_off.json.gz
node experiments/half_cell_bath.js 811 on experiments/scratch/UNIQUE_811_on.json.gz
node experiments/half_cell_bath.js 811 off experiments/scratch/UNIQUE_811_off.json.gz
node experiments/half_cell_bath.js --validate experiments/scratch/UNIQUE_809_on.json.gz
```

Validate each of the four raw files. Summary takes an unused output path followed
by all four raw paths in809on/off,811on/off order. Report takes that summary and
an unused output stem. The archive script preserves this completed batch and
refuses overwrite. The manifest records exact executed commands, hashes and CPU
costs; archived Q8g input is read directly, without a scratch-input prerequisite.
At most four simulation processes ran at once. No new settings or longer run
were introduced after the early viability looks or final zeros.

Both100-step preflights pass observer/plain equality and50-step restart. The
first source is preserved: before the full runs, the harness was extended to
save/replay first qualifying milestone states, then the preflight passed again.
No runtime parameter changed. Synthetic checks cover founder exclusion, cut rim,
still-paired structures and corrupt sample rejection. Independent tape analysis
reconstructs every saved ordinary/rim graph and final tables, reconciles event
counts and rejects three deliberate corruptions.

All four full plain replays pass: every-step bond tables, all404 sampled frames,
all saved checkpoints, final physical arrays/RNG and outcome census agree.
Each25k checkpoint also resumes exactly to the saved26k state. The full replay
does not independently recount every rim-geometry query; instrument neutrality
and aggregate/tape consistency are tested separately as described above.

The manifest archives25 evidence files plus itself. Total **404,500 physics
steps**:200,000 observed,200,000 plain replay,4,000 midpoint restart and500 across
the two preflights. Measured Node CPU **3,768.891s**, within the5,000s budget;
all execution and replay ceilings pass. Startup/compression are included;
read/edit, shell/Git and visual inspection/conversion are unmeasured, so a fully
inclusive cost is not independently verified. No simulation remains active.

The first SVG had overlapping row labels. Its exact source, figure and report
are retained; v2 corrects spacing and its raster preview was visually inspected.
A browser-opening attempt timed out; bundled Sharp rendered both previews despite
font-cache warnings. These UI/conversion checks ran no physics and are untimed.
No simulation/harness failure occurred. Core/historical sources are unchanged;
the full core suite, default fingerprints and generated viewer rebuild were not
rerun for this observer/assay/documentation slice.

**Decision:** the acquisition gate fails in both on worlds; park this bath setting.
Automatic polymer growth works, but ordinary chain placement and assembly fail in
both arms. Next freeze a small actual-rejection geometry diagnostic, comparing
prepared successful contacts and ordinary-chain placement, before considering a
change. Do not lengthen this batch, add a timing program or alter fuel on these
results. No operational lead earns individual-motion or descendant confirmation.
Stop after validation/archive/handoff for the user's instance switch.
