# Results

Measurements from the headless runner on the per-square physics (third draft, 2026-09-21).
Every run is deterministic per seed; the commands are in the `.sh` scripts next to this file and
`run_all.sh` reproduces everything in about 50 minutes on four cores. Tables come from
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

<<REGIMES>>

## 3. Does anything besides cooperativity hold length up? (`length_selection.sh`, 150,000 steps)

Mutation and turnover on (pSoft 0.02, pCapture 0.05, pFray 0.0003), varying how energy is
supplied. `unit`: every released unit needs its own particle. `strand`: one particle re-arms a
whole strand, caught by any of its N back sides. E40 uses fewer particles and a slower reload.
`sun`: particles reload only inside a disc of radius 12. Mean length counts templates that are
being copied as well as free strands.

<<LENGTH>>

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

<<EVO>>

## 6. Summary

- Copying, release, re-arming and turnover all come out of one internal state per square, one
  compatibility table and six local transitions, with nothing bigger than a square anywhere in
  the dynamics. Copies are exact when the soft knobs are zero.
- Every soft knob is a distinct, measurable mutation channel. Ligation is not usable as a
  per-step probability.
- Without cooperativity the shortest strand wins in every energy regime tried, by 10:1 to 60:1.
- With a lone docked monomer made unstable, the balance tips to longer strands at undocking
  rates above about 0.05 per step, decisively at 0.1. What sets the optimum length, and whether
  sequence content can matter once hinges, stacking or energy motifs exist, are the open
  questions for Phase 3.
