# Results

Measurements from the headless runner on the current code. Every run is deterministic per seed;
the commands are in the `.sh` scripts next to this file and `run_all.sh` reproduces everything
in about 40 minutes on four cores. Tables come from `summarize.js`, `births_by_length.js` and
`mutation_rates.js` over `out/*.csv` and `out/*.births.jsonl`.

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

`R_base` below is the same thing over 100,000 steps: 87 births, all faithful, until the free
monomer pool hits zero and every template is stuck holding a partial copy. That is the material
lockup the design predicted for a world without turnover.

## 2. One variation source at a time (`regimes.sh`, 100,000 steps)

| run | knobs | births | faithful | substitution | longer | shorter | mean length at end | distinct seqs | free monomers |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|
| R_base | none | 87 | 100% | 0% | 0% | 0% | 6.00 | 1 | 0 |
| R_soft | pSoft 0.02 | 88 | 73% | 27% | 0% | 0% | 6.00 | 5 | 0 |
| R_capture | pCapture 0.05 | 89 | 22% | 16% | 17% | 33% | 3.67 | 9 | 0 |
| R_fray | pFray 0.0003 | 6,880 | 99.6% | 0.1% | 0.3% | 0% | 2.00 | 2 | 278 |
| R_fraycap | pCapture 0.05, pFray 0.0003 | 1,851 | 36% | 14% | 18% | 14% | 2.72 | 10 | 71 |
| R_gentle_7 | pSoft 0.01, pCapture 0.01, pFray 0.0001 | 1,152 | 65% | 12% | 11% | 6% | 2.25 | 8 | 54 |
| R_gentle_8 | same, seed 8 | 1,175 | 64% | 13% | 10% | 5% | 2.41 | 11 | 36 |

What each source does:

- **Wrong-type docking** gives substitutions and nothing else. Length stays 6.
- **End capture** gives insertions (a monomer sticks to a strand end), gap substitutions (a monomer
  sticks to its neighbour instead of the template) and, through gaps, truncations: a captured unit
  faces the fragment on the far side of the gap with an `END` side, the fragment answers `STICKY`,
  they only join at `pLigate`, so the near fragment leaves as a shorter strand. A third of births
  are shorter than their parent at 0.05.
- **Fraying** alone gives turnover (278 free monomers at steady state instead of 0) and a
  seventy-fold jump in births, all of them dimers. Length collapses to 2 within 30,000 steps.
- **Gentle** (all sources at low rates) keeps two thirds of births faithful and a dozen sequences
  in play, and still collapses to length 2 to 2.5.

Soft probabilities are per step of contact. A free monomer sits in front of a face for roughly
five to ten steps, so `pSoft` 0.02 gives 27% wrong-type dockings, not 2%.

## 3. Does anything hold length up? (`length_selection.sh`, 150,000 steps)

Mutation and turnover on (pSoft 0.02, pCapture 0.05, pFray 0.0003), varying how energy is
supplied. `unit`: every released unit needs its own particle. `strand`: one particle re-arms a
whole strand, caught by any of its N back sides. E40 and E10 use fewer particles and a slower
reload. `sun`: particles reload only inside a disc of radius 12.

| run | energy | mean length | max | strands | births | distinct | entropy (bits) | E on |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| L_unit_E300_11 | unit, 300 | 2.61 | 5 | 113 | 2,594 | 9 | 2.70 | 270 |
| L_unit_E300_12 | unit, 300 | 2.80 | 6 | 104 | 1,945 | 9 | 2.79 | 274 |
| L_strand_E300_11 | strand, 300 | 2.53 | 4 | 117 | 2,819 | 9 | 2.74 | 288 |
| L_strand_E300_12 | strand, 300 | 2.69 | 5 | 123 | 2,896 | 9 | 2.77 | 289 |
| L_unit_E40_11 | unit, 40 | 2.93 | 5 | 113 | 2,647 | 13 | 3.28 | 11 |
| L_unit_E40_12 | unit, 40 | 2.83 | 7 | 110 | 2,348 | 13 | 3.23 | 10 |
| L_strand_E40_11 | strand, 40 | 2.72 | 5 | 119 | 2,267 | 11 | 3.08 | 24 |
| L_strand_E40_12 | strand, 40 | 2.56 | 5 | 121 | 2,104 | 9 | 2.72 | 27 |
| L_sun_strand_11 | strand, sun | 2.61 | 5 | 128 | 2,603 | 10 | 2.89 | 54 |
| L_sun_strand_12 | strand, sun | 2.66 | 5 | 116 | 2,666 | 10 | 2.85 | 47 |

Every configuration lands between 2.5 and 2.9. Strand-mode energy does not hold length up, and
40 particles are not even scarce in strand mode (24 to 27 of them are charged at any time). The
sun patch changes where things happen, not what.

**Ligation is a runaway.** Two probes with `pLigate` on, strand mode, 300 E:

| run | pLigate | ligations | strands at end | births | mean length |
|---|---:|---:|---:|---:|---:|
| L_ligate005_11 | 0.005 | 5,147 | 65 | 1,106 | 4.31 |
| L_ligate02_11 | 0.02 | 2,493 | 23 | 270 | 5.08 |

Rigid strands that touch end to end stay in contact for tens of steps and roll the dice every
step, so almost every touch fuses. The mean length goes up, but the population turns into a few
dozen rafts of fused templates with half-finished copies that cannot separate, and births fall
by three quarters. Default 0.

## 4. Direct competition: dimer against 6-mer (`competition.sh`, 100,000 steps)

Three `AB` and three `ABBABA` strands start together with every mutation knob at zero, so the two
species stay distinct and births per species are a direct fitness readout. "Other" is zero in
every run, which is the check that the chimera bug is gone.

| run | energy | fray | dimer births | 6-mer births | ratio |
|---|---|---|---:|---:|---:|
| C_unit_E300_fray0_21 | unit, 300 | 0 | 269 | 5 | 54 |
| C_unit_E300_fray0_22 | unit, 300 | 0 | 273 | 6 | 46 |
| C_strand_E300_fray0_21 | strand, 300 | 0 | 268 | 6 | 45 |
| C_strand_E300_fray0_22 | strand, 300 | 0 | 277 | 3 | 92 |
| C_unit_E10_fray0_21 | unit, 10 | 0 | 253 | 23 | 11 |
| C_unit_E10_fray0_22 | unit, 10 | 0 | 232 | 27 | 9 |
| C_strand_E10_fray0_21 | strand, 10 | 0 | 279 | 17 | 16 |
| C_strand_E10_fray0_22 | strand, 10 | 0 | 197 | 39 | 5 |
| C_unit_E300_fray3_21 | unit, 300 | 0.0003 | 4,911 | 0 | ∞ |
| C_unit_E300_fray3_22 | unit, 300 | 0.0003 | 4,553 | 0 | ∞ |
| C_strand_E10_fray3_21 | strand, 10 | 0.0003 | 436 | 6 | 73 |
| C_strand_E10_fray3_22 | strand, 10 | 0.0003 | 557 | 8 | 70 |

Without fraying the pool is exhausted by 50,000 steps and the dimers took nine tenths of it.
Scarce energy narrows the gap from about 50:1 to about 10:1 because everyone waits for
particles, but never closes it. With fraying and abundant energy the 6-mers produce no births at
all: they shorten faster than they finish a copy.

Why the dimer wins here is mechanical. A copy of N units waits for the slowest of N dockings
(roughly H_N times the single-site wait), then in unit mode for the slowest of N energy
arrivals, and then a longer rigid body diffuses away more slowly. Every term favours short. In
this world a single docked monomer is as stable as a full duplex, so a dimer copies on two lucky
dockings and nothing makes a long template a better place to copy.

## 5. Cooperative docking (`cooperativity.sh`, 100,000 steps)

Rule R6: a docked monomer with no lateral bonds falls off at `pUndock` per step and is pushed
off the face; a run of two or more linked units stays. Copying becomes nucleation-limited: the
slow step is two monomers landing side by side before either leaves, and a template of N units
has N-1 places for that to happen while a dimer has one.

(Results pending; this section is filled in when the batch completes.)
