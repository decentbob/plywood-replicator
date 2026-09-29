# Q8n: do daughter half-cells become parents?

2026-09-29; follows the Q8m lead (RESULTS 97). Frozen before running. Screen tier, exploratory.

Q8m produced one separated active daughter D in eight worlds under the anchor rule.
Reproduction requires daughters that copy in turn. This runs fresh seeds for longer and
tracks parentage with an observer only.

World and rules as in Q8m: `half_cell_soup.js` with K=4 in 24x24 (founder D plus four
loose inventories; at most four new D can form from the material), anchor rule, body
motion, 16 passes. Arms anchorPins and anchorProject; fresh seeds 1301–1306; 150,000
steps; 12 worlds.

**Parent tracking (observation only, never read by rules).** Every 100 steps, each
complete P..Q chain gets an identity (its unit set). The first time a novel chain is
seen, its parent is the known chain holding the most face bonds to it at that moment,
or the one recorded when it last had face partners. Generation = parent generation + 1;
the founder is generation 0. A chain whose units later rebuild into a different set is a
new identity. Closed D, unpaired and detached status are recorded per identity (as in RESULTS 89).

Primary: the number of worlds with a **generation-2 chain** (templated on a daughter),
and with a generation-2 closed D. Secondary: separated closed Ds per world, the time to
each, the chain breakups seen, and free W / fuel over time.

Reading, fixed now: a generation-2 closed D in any world is a **reproduction lead**, which
earns a confirmation-tier plan (fresh seeds and individual-kick sensitivity per AGENTS).
Generation-2 chains without closure are partial. Only founder-made daughters means
daughters do not act as templates in this setting; diagnose (for example, whether their
faces point into their own arc) before changing any rule.

QA: the first seed per arm gets plain and midpoint-restart checks. Four workers at most.

```sh
node experiments/half_cell_generations.js all experiments/scratch/HCG_20260929
node experiments/half_cell_generations.js summary experiments/scratch/HCG_20260929
```
