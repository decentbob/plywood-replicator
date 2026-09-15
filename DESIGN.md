# Polygon Chemistry

Design notes for an artificial life simulation where replication and evolution come out of a tiny universal physics, not out of code inside the creatures.

**Status:** living design, second draft. The first draft was a plan; this draft records what was built, what the build changed, and what was measured. Section 2 lists the commitments that define the project. Everything else is a current best guess and should be replaced the moment a better idea or an experiment says so. The decision log at the end (section 14) is where the reasoning behind each change survives. Section 15 holds the ideas not yet tried.

---

## 1. The goal and the bet

Build a 2D world of small polygons ("primitives") governed by one fixed, universal rule set. A primitive can see only its own sides and the sides it is bonded to. From that, we want:

1. Chains that get copied by templating, without any rule that says "copy". **Done.**
2. Copy errors, without any rule that says "mutate". **Done.** Substitutions, insertions, deletions and fusions all come from soft binding and end fraying.
3. Selection, from a conserved energy budget and turnover. **Done, with the expected result:** in a well-mixed world the shortest strand wins.
4. Eventually, structures we did not design: membranes, catalysts, whatever shows up. **Open.**

The bet is that the mechanism biology uses, a molecule docking onto a template and thereby changing the state of its other sides, is enough to get template copying out of a handful of local rules, and that once copying with errors exists, the rest is an experiment rather than a design task. The first half of the bet has paid off: the whole chemistry is one internal state per square, one compatibility table, and five transitions (section 4).

Prior art worth reading before building: Lionel Penrose's mechanical self-replicating blocks (1957), Tim Hutton's Squirm3 artificial chemistry (2002 onward; he later got membranes and a genotype/phenotype split), JohnnyVon (Smith, Turney, Ewaschuk, 2003) for the "state flips propagate along a strand" release mechanism, and Boerlijst and Hogeweg on why spatial structure protects replicators from parasites. ALIEN (Heinemann) is the reference for simulating millions of bonded particles on a GPU, but its cells run programs, which is what we are trying to avoid. Spiegelman's monster (1965) is the result to expect from any well-mixed replicator soup, and we got it.

---

## 2. Core commitments (do not change without a very good reason)

- **One universal physics.** Every primitive obeys the same rule table. No primitive carries its own program, genome, or neural net. An "organism" is any configuration of primitives that happens to make more of itself.
- **Strict locality.** A primitive reads only: its own type, its own state, which of its sides are bonded, and the state of the side it is bonded to on each partner. No global signals, no counters, no knowledge of chain length, no "am I finished" flag that isn't computed locally.
- **Digital bonds.** A bond is on or off. Bonds never break from thermal jostling. They form when compatible sides meet and break only when a rule sets a side to a non-holding state. This is the single most important lesson from the failed earlier attempt, which used analog attraction and could not find a strength that both formed chains and released them.
- **Replication is a pathway, not a primitive.** The rule table must not contain anything that refers to "chain", "copy", "template", or "organism". Those words may appear in the documentation of why a rule exists, never in what a rule computes.
- **Mutation is a side effect.** Binding compatibility is soft: a near-match binds with low probability. Variation comes from that, from strands fraying, and from nothing else added on purpose.
- **Energy is conserved and recycled.** Energy particles are never created or destroyed. They flip between ON and OFF, and OFF ones get reloaded somewhere. Energy is required for exactly one scarce step of the replication pathway.
- **Minimal environment.** Random jostling (the only "temperature"), soft repulsion between bodies, and an energy reload rule. Nothing else. No gradients, no chemistry zones, unless an experiment shows they are needed. (The optional sun patch is such an experiment, section 8.)
- **Space is exclusive.** Two bodies cannot occupy the same place, and a bond cannot form into a slot that is occupied. Added in the second draft after the build showed what happens without it (section 10).

---

## 3. The primitive

A primitive is a small rigid square in a continuous 2D world (a torus).

Fields:

- `type`: fixed for life. `A` and `B` are monomers, `E` is the energy particle.
- `state`: one small integer. For `A`/`B`: `DOCK`, `REPEL` or `TPL`. For `E`: `OFF` or `ON`. That is the entire mutable state of a unit.
- `bond[4]`: for each side, either nothing or a pointer to one side of one other unit.

Sides, counter-clockwise from the face: `F` (face), `R` (right), `K` (back), `L` (left). Strand bonds run `L`-to-`R` only, which gives every strand a direction.

**Derived side states.** The first draft gave each side its own stored state. The build showed that every side state can be *derived* from the unit's one internal state plus which of its sides are bonded, so the interface a neighbour reads is:

| side | derived state | when |
|---|---|---|
| F | `DOCK` | state is `DOCK` (free, or docked on a template) |
| F | `TPL_MM`, `TPL_LF`, `TPL_RF` | state is `TPL`; both laterals bonded, left free, or right free |
| F | `REPEL` | state is `REPEL` |
| L, R | `BONDED` / `ARMED` | bonded; `ARMED` if this unit is `TPL` |
| L, R | `STICKY` | unbonded, and the unit is docked or laterally captured |
| L, R | `END` | unbonded, and the unit is `REPEL` or `TPL` (an open strand end) |
| L, R | `INERT` | unbonded free monomer |
| K | `WANT` / `IDLE` | state is `REPEL` / anything else |
| E (all sides) | `ON` / `OFF` | |

This keeps section 2's locality intact (a derived state depends only on the unit's own bonds and state) and shrinks the state space to three values per unit.

Physics:

- Brownian motion plus soft disc repulsion between bodies.
- A bonded set of units is one rigid body. When a bond forms the smaller body is snapped flush onto the larger and the two merge; when a bond breaks the body is split into its connected components. Strands come out exactly straight with no spring tuning.
- No ranged attraction of any kind.

Bond formation:

- Two sides may bond if the compatibility table allows their (type, side, derived state) pair, the vector between the two units lies along both sides' outward normals within a tolerance, the sides are nearly antiparallel, and **the slot the mover would snap into is empty**.
- Compatibility is probabilistic. Exact matches bind with probability 1. Near matches bind with a small probability. The near matches are the mutation sources (section 6).

Rules:

Every rule reads the unit's own state, which sides are bonded, and the derived state of bonded partner sides, and sets the unit's own state. A rule may also break the unit's own bonds (fraying does). That is the whole computational model.

---

## 4. The replication pathway

This is what the build settled on. It has no caps, no completion handshake, and no wave. It is smaller than the first draft's pathway and does the same job.

**Compatibility table** (symmetric):

| side | partner side | probability | role |
|---|---|---|---|
| F `DOCK` | F `TPL_*`, same type | 1 | docking |
| F `DOCK` | F `TPL_*`, other type | `pSoft` | substitution |
| L `STICKY` | R `STICKY` | 1 | two neighbours docked on the same template link |
| L/R `STICKY` or `END` | R/L `END` or `STICKY` | `pLigate` | two strands join end to end |
| L/R `INERT` | R/L `STICKY` or `END` | `pCapture` | a free monomer joins a strand without a template |
| K `WANT` | E `ON` | 1 | energy docks |

Everything else is 0. Note what is absent: `DOCK`-`DOCK` (two free monomers never join), `TPL`-`TPL` (two strands never dock on each other), anything involving `REPEL`.

**Transitions:**

| rule | from | to | condition |
|---|---|---|---|
| R1 | `DOCK` | `REPEL` | my F is bonded, and I have every lateral bond my template partner's face says I need: both if it reads `TPL_MM`, only L if `TPL_LF`, only R if `TPL_RF` |
| R2 | `DOCK` | `REPEL` | my F is not bonded and a lateral side is (I was captured) |
| R3 | `REPEL` or `TPL` | `DOCK` | no lateral bonds |
| R4 | `REPEL` | `TPL` | an `ON` energy particle is bonded to my K. In `strand` energy mode, also if a lateral partner reads `ARMED` |
| R5 | `REPEL` or `TPL` | `DOCK`, breaking my lateral bonds | I have no face bond, exactly one lateral bond, and a coin at `pFray` comes up |

**Bond holding:** a bond breaks when either of its sides derives to `REPEL`, `INERT`, `IDLE` or `OFF`.

**Walkthrough.**

1. *Free monomer.* State `DOCK`, no bonds. Its laterals derive to `INERT`. It can bond only face-first onto a `TPL` face.
2. *Docking.* It meets a `TPL` face of its own type, geometry checks, the slot is free, the bond forms. Its laterals now derive to `STICKY`. Because the docked monomer is rotated 180°, its L faces the template's R direction: copies are antiparallel.
3. *Lateral linking.* Two docked neighbours, both `STICKY`, link (probability 1). `STICKY` only ever arises from docking or capture, so free monomers never form chains.
4. *Local completion (R1).* A docked unit reads its partner's face. On a middle template unit it waits for both lateral bonds; on an end unit it waits for the one that points into the strand. When satisfied it goes `REPEL`, which breaks its face bond. There is no round trip and no cap: each unit decides for itself, and the copy leaves the template exactly when every unit has decided, because until then the undecided ones hold it. A copy with a gap waits for the gap to fill.
5. *Separation.* `REPEL` faces do not bond to anything. Body repulsion and jostling push the two strands apart. They cannot re-dock: `REPEL` is inert and `TPL` does not bond `TPL`.
6. *Re-arming (R4, the energy step).* A `REPEL` unit's K reads `WANT`. An `ON` energy particle docks, the unit goes `TPL`, the particle goes `OFF`, and both sides stop holding, so the particle leaves. The unit's face now reads `TPL_MM`/`TPL_LF`/`TPL_RF` from its own lateral bonds, so a fresh copy knows its own ends without being told.

Now both strands are templates and the cycle repeats. Verified in the sandbox (`node test.js`): free monomers never form dimers or chains; a seeded 6-mer gets complete copies, each the reverse of its parent, and nothing else; energy spent equals units re-armed (unit mode) or roughly copies made (strand mode); mass and energy are conserved; runs are deterministic per seed.

---

## 5. Minimal palette and the open choices in it

Types: `A`, `B`, `E`. Three internal states for monomers, two for energy. No cap type, no breaker type.

**Caps versus end-ness as state.** Resolved in favour of end-ness as state, carried on the template's face (`TPL_LF`/`TPL_RF`). It cost nothing: the end-ness is derived from the unit's own lateral bonds. Caps would have needed two cap types (a left cap's complement is a right cap, because copies are antiparallel) and a way to grow. Strands can now change length.

**Where energy gates.** Re-arming, as in the first draft. Two modes exist (section 8). The alternative of gating docking (activated monomers, as with NTPs) is untried; see section 15.

**Alphabet size.** Two letters, self-complementary (`A` pairs `A`, `B` pairs `B`). A copy is the reverse of its template, so a strand returns to itself after two generations, as with DNA. Self-complementary pairing was chosen over `A`-`B` pairing because it makes the birth log readable at a glance; nothing else depends on it.

---

## 6. Sources of variation

All measured in the birth log (`run.js --births`).

- **Substitution** from `pSoft`: an `A` docks where a `B` should.
- **Substitution and insertion** from `pCapture`: a free monomer sticks to a docked unit's open lateral side (filling a gap with a random letter, never checked against the template), or to a strand's open end (lengthening it by one, template or copy alike).
- **Truncation** from `pCapture` interacting with gaps: a captured unit in a gap has an `END` side facing the fragment on the other side of the gap, which is `STICKY`; they join only at `pLigate`. If they do not, the near fragment is complete and leaves as a shorter strand, and the far fragment waits on the template until fresh monomers fill the vacated sites and link to it. Nothing is stuck for good.
- **Deletion** from `pFray`: end units fall off undocked strands.
- **Fusion** from `pLigate`: two strands meet end to end and join.

Measured rates matter more than the parameters. In the reference runs, `pSoft` 0.02 gave about 6% of dockings wrong-typed; `pCapture` 0.05 gave about one capture per three dockings, most of them gap fills; `pFray` 0.0003 gave about one fray per birth in unit mode. See `experiments/RESULTS.md`.

---

## 7. Turnover

Resolved with fraying (R5): a unit that is not docked and has exactly one lateral bond falls off with probability `pFray` per step, returns to `DOCK`, and its neighbour's face re-derives to an end state. This is per-unit and memoryless, so it needs no timer and no breaker type. Mass is conserved (`test.js` checks it).

Without turnover the free monomer pool drains into strands and selection stops within a few hundred thousand steps: every template ends up holding a partial copy that can never be completed. With turnover the pool stays at a steady fraction and the population keeps producing births indefinitely.

Fraying also does something the first draft hoped for and the build confirmed only in part: a two-unit strand is two ends, so it dies at rate `2 pFray`, while a long strand only shortens. This penalises dimers but does not, on its own, hold length up (section 10, "shortest replicator wins").

---

## 8. Energy

- Fixed population of `E` particles, `ON` or `OFF`. Never created, never destroyed.
- `OFF` particles reload to `ON` either at a fixed rate everywhere (`pReload`) or only inside a disc (`sun`).
- Two modes of what one energy particle buys, chosen by `energyMode`:
  - `unit`: every released unit needs its own particle. Cost of a copy is its length, in both strands' worth of re-arming. This is the first draft's proposal.
  - `strand`: a re-armed unit re-arms its lateral neighbours (R4's second clause: a lateral partner reads `ARMED`). One particle re-arms a whole strand. The particle can land on any of the strand's N back sides, so a long strand catches energy N times faster than a monomer would, and the wait for energy shrinks with length instead of growing with it. This is the first mechanism in this world that gives length a physical advantage, and it is fully local. Whether it is enough to hold length up against the docking-time penalty is measured in `experiments/RESULTS.md`.
- Total energy and reload rate set the carrying capacity. In `strand` mode with abundant energy, monomers become the limiting resource instead.

---

## 9. Phenotype and higher structure

Copying alone gives selection on copy speed only, and the winner is the shortest strand. The build confirms it (section 10). For evolution to build anything, a sequence has to do something. Sources of phenotype, cheapest first:

**Energy capture (now).** In `strand` mode, length itself is a phenotype: more back sides catch more energy. Sequence is not yet.

**Geometry (next).** Mixed shapes in a strand give it a shape: a run of triangles bends, squares run straight, some sequences close into rings. Rings enclose monomers and energy near their own template, which is the strongest known protection against parasites. Working through the geometry turned up a problem the first draft missed: with rigid units, **a bent template cannot be copied**. A bend turns away from the face side, so the copy sits on the outside of the bend, where adjacent docked units are further apart than a side length and cannot link. The copy of a curve has gaps. The fix that keeps everything local is to make flexibility heritable: a lateral bond between two particular letters (say `B`-`B`) is a free hinge, everything else is rigid. A hinged template can fold; its copy has hinges in the same places (it is a copy), so the copy can flex to close its gaps. Sequence then decides where a strand bends, which is exactly a genotype-to-phenotype map, and it needs a constraint solver in the physics (section 12).

**Self-bonding.** Compatible faces on distant units of the same strand can bond, folding the strand (RNA secondary structure). Free once hinges exist. Avoid ranged attraction; it is the particle-life knob, hard to tune, and it blurs what "chemistry" means here.

**Gates.** A closed ring of flush-bonded polygons is sealed. Permeability has to come from a bond that can open. The natural candidate is the bond that closes a ring: an energy particle docking on that unit's K flips the closure bond open, the ring opens into a horseshoe, and it re-closes when the ends meet again. Heritable, evolvable, and it uses nothing beyond section 4's machinery.

**Pass-through option (experiment, not default).** Any two bodies may overlap but a third is blocked from a spot where two already overlap. Gives permeability by thickness. Kept behind a flag idea only; the hard-body baseline exists now, so there is something to compare against.

---

## 10. Failure modes, observed and expected

- **Junk chains.** Any lateral bonding not preceded by docking. *Observed: none* in 20,000 steps with no seed and `pCapture` 0 (`test.js`). With `pCapture` > 0, captured chains grow only from existing strand ends, never from nothing.
- **Everything ends up in strands.** *Observed*, exactly as predicted, whenever `pFray` is 0: free monomers hit zero and every template holds a partial copy forever. Fix: turnover (section 7).
- **Immediate re-docking.** *Not observed.* `REPEL` faces are inert and `TPL` does not dock on `TPL`, so the energy gate is not needed for this; it is needed only as the scarce resource.
- **Stalled copies.** *Observed as a transient*: a captured unit in a gap leaves the far fragment waiting on the template. It resolves when new monomers fill the freed sites. Diagnostic: `docked` count in the CSV that stays high while `free` is nonzero.
- **Docking through an occupied slot.** *Observed and fixed.* With loose geometric tolerance and soft repulsion, a monomer near a template site whose old copy unit was still sitting there unbonded could pass the geometry check and be snapped into the occupied spot, on top of the old unit. Fix: a bond forms only if the slot is empty (section 3). This is the reason for the "space is exclusive" commitment in section 2.
- **Shortest replicator wins.** *Observed.* With fraying on and unit-mode energy, mean strand length collapses from 6 to about 2.5 within 50,000 steps and stays there, while the birth rate goes up tenfold. Everything in the copy cycle favours short strands: a copy of N units waits for the slowest of N dockings, then (in unit mode) the slowest of N energy arrivals, then a longer body diffuses away more slowly. Fix candidates: strand-mode energy (section 8), spatial structure (sun patch), and phenotype (section 9). Measured in `experiments/RESULTS.md`.
- **Rules leaking global knowledge.** None. Every rule in section 4 reads one unit and its bonded partner sides.
- **Analog creep.** None in the chemistry. The physics has tolerances (docking angle and distance, repulsion stiffness, jostle size) but no pair of them has to be balanced against each other for chains to both form and release; release is a logic event.

---

## 11. Build plan

**Phase 0, physics sandbox.** *Done.* Rigid compound bodies, jostling, soft repulsion, face-normal check, slot check, snapping. No springs.

**Phase 1, one copy.** *Done.* One uncapped strand of length 6 in a bath gets a complete antiparallel copy, released and re-armed, no junk; then exponential growth until the monomer pool runs out. Energy consumption per copy equals strand length (unit mode).

**Phase 2, variation and selection.** *Done, first results in.* With `pSoft`, `pCapture`, `pLigate`, `pFray` all on, sequence diversity grows to a dozen or more distinct sequences and entropy of 2 to 3 bits within 100,000 steps, and length collapses to 2 to 3 units. Questions still open: does strand-mode energy under scarcity hold length up, and does the sun patch change the outcome?

**Phase 3, structure.** *Next.* Add sequence-dependent hinges (section 9), then a triangle type. Watch for self-closing rings. Ask: do ringed replicators outcompete open ones near the sun?

**Phase 4, rule-space search.** The whole chemistry is now one compatibility table of six rows and five transitions. Randomising it within section 2's constraints and searching for tables that produce replicators from a seedless bath is a smaller search than the first draft assumed. Still: do not start here.

Metrics logged from Phase 1 onward (`run.js`): free monomer count, strand count and length histogram, births, generation depth, sequence count and entropy, energy state, event counts for dockings, wrong-type dockings, captures, ligations, frays.

---

## 12. Implementation notes

- 2D torus with a spatial hash. Bodies are rigid compounds: merge on bond, split into connected components on break. Poses are exact; there is no jitter and no constraint solver. Hinges (section 9) will need one: either position-based dynamics on the bond constraints, or articulated bodies with pin joints.
- The compatibility table is one function (`compat`) over (type, side, derived state) pairs and the transitions are one function (`_transition`) of five clauses. Both are small enough to print on a page and to randomise.
- Deterministic RNG (mulberry32) with a logged seed. `test.js` checks two runs with the same seed give the same positions.
- Side states are drawn as colours on the square's edges; the state machine can be read off the screen, and clicking a square prints its state and its partners' states.
- Every birth is logged with time, sequence, generation, parent sequence and position. Most of the analysis happens on that log.
- Speed: about 1,000 steps per second for 1,100 units in Node on one core; about 350 in the browser while drawing. A copy cycle is a few thousand steps. Phase 3 will want a faster inner loop before it wants a GPU.

---

## 13. Open questions

Answered by the build:

- *Is the K side needed?* Yes, but only as a place for energy to dock that faces away from the template; nothing else uses it.
- *Does the FWD/REL round trip need caps at both ends?* Moot: the round trip is gone. Local completion needs neither caps nor a wave.
- *What is the smallest rule table that passes Phase 1?* Five transitions and the first three rows of the compatibility table. R2, R5 and the soft rows are only for variation and turnover.
- *Should a template accept docking while its neighbour is still busy?* Yes, and it does; no tangles observed.
- *Does anything secretly depend on strands being straight?* Yes, copying does (section 9). This is the phenotype/replication tension, arriving on schedule.

Still open:

- Is one universal `pCapture` right, or should captures at a template end and at a copy gap differ? (They are the same event locally; making them differ would need a new derived state.)
- Does the birth-rate advantage of short strands survive under strand-mode energy scarcity, and at what energy density does it flip?
- Is `pLigate` a mutation source or a runaway? Fusion is rare at 0.05 in a dilute world; in a crowded one it may not be.
- What does the population do over millions of steps rather than hundreds of thousands?

---

## 14. Decision log

Keep entries short: date, what changed, why, what evidence.

- 2026-09-15. Switched from thermal bond breaking to digital, rule-driven bonds. Reason: earlier build could not find an attraction strength that both formed chains and released them. Digital bonds make release a logic problem.
- 2026-09-15. Dropped the "size sieve" idea for membrane permeability. Reason: flush-bonded rings have no gaps. Replaced with an energy-openable cap-cap latch.
- 2026-09-15. Ranged attraction rejected as a folding mechanism in favour of self-bonding between compatible faces. Reason: keeps everything local and digital.
- 2026-09-15. Pass-through physics with triple-overlap blocking kept as an experiment behind a flag, not the default.
- 2026-09-15. Replaced the FWD/REL completion round trip and the cap type with local completion read off the template partner's face (`TPL_MM`/`TPL_LF`/`TPL_RF`). Reason: same guarantee (a copy with a gap cannot leave) with no wave, no caps, and strands that can change length. Evidence: `test.js`, exact copies only.
- 2026-09-15. Collapsed per-side stored states into one internal state per unit plus derived side states. Reason: every side state in the first draft was a function of the unit's bonds and one trit. Evidence: the derived table in section 3 reproduces the whole pathway.
- 2026-09-15. Chose rigid compound bodies over bond springs. Reason: exact flush geometry, no jitter, no false negatives on the face-normal check, no stiffness tuning. Cost: bending needs an articulated solver later.
- 2026-09-15. Added the slot-must-be-empty check on bond formation and the "space is exclusive" commitment. Reason: a monomer docked through a released copy unit and was snapped on top of it. Evidence: birth log showed a parent read as a single letter; the dump showed a template with a fresh monomer where the leaving copy still sat.
- 2026-09-15. Added end capture (`pCapture`) as the main variation source alongside wrong-type docking. Reason: one physically obvious soft event (a monomer sticks to its neighbour instead of the template) gives insertions, gap substitutions and truncations at once.
- 2026-09-15. Added end fraying as turnover instead of a breaker type or a timer. Reason: per-unit, memoryless, no new type, and it penalises dimers.
- 2026-09-15. Added `strand` energy mode (re-arming spreads along lateral bonds). Reason: it is the only local mechanism found so far that gives length a physical advantage; kept `unit` mode for comparison. Evidence pending in `experiments/RESULTS.md`.
- 2026-09-15. Self-complementary alphabet (`A`-`A`, `B`-`B`). Reason: birth log readability. Copies are reverses of parents.

---

## 15. Ideas not yet tried

Ordered by how little they add to the rule table.

1. **Activated monomers.** Gate docking instead of re-arming: a free monomer needs an `ON` energy particle on its K before its face reads `DOCK`. Energy is then carried by the food, as in biology. Changes who competes for energy (monomers, not strands) and may change the length result.
2. **Sequence-dependent hinges.** A `B`-`B` lateral bond is free to rotate; all other lateral bonds are rigid. Strands fold where the sequence says; copies inherit the fold; rings become possible; folded strands hide their faces and copy slower. This is the cheapest genotype-to-phenotype map available and the one Phase 3 should start with.
3. **Sequence motifs as metabolism.** Make energy reload conditional on a local pattern: an `OFF` particle docking on the K side of a unit whose lateral partners are both `A` (a derived state `K_MOTIF`) turns `ON`. Then an `A A A` run in a strand is a photosystem, and a strand's energy income depends on its sequence. Costs one derived state and one compatibility row. It would make selection act on content, not just length.
4. **Two-sided templates.** Let the K side also pair (`A.K` with `B.K`, say). Strands would then template on both faces, and two strands could sandwich a third. Probably too much; listed because it is one row.
5. **Parasite ecology.** With `pCapture` and `pLigate` on, strands appear that were never templated. Log lineage (which units were ever docked) and ask whether spatial structure from the sun patch separates producers from parasites, as Boerlijst and Hogeweg found for hypercycles.
6. **Rule-space search.** Treat the compatibility table's probabilities and the five transition conditions as a genome, start from a seedless bath, and select tables for births per energy. The search space is small enough now to be tractable on a laptop.
