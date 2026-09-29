# Q8k: live half-cells with in-place capture (exploratory reopening)

2026-09-29; ROADMAP order 1; baseline `626317b`. Frozen before running. Screen tier.

## Why reopen

Q8 was parked after RESULTS 89–91. The free bath never assembled a new chain: 39/44
ordinary placements were rejected because the projected incoming block overlapped
neighbouring chain material (90). In-place face pins, which bind where the parts
already are, passed Q8j's capture gate in 37/38 saved bath contacts under body motion
but 0/38 under individual kicks (91). The frozen gate required both, so it failed.
The user has since directed (AGENTS, 2026-09-28) that mechanism logic should not wait
on numerical perfection: body jostling is the exploration standard, and
individual-kick checks are for confirmation-tier claims. This reopening follows that
change of policy, not new evidence. RESULTS 91 stays failed as recorded, and nothing
here is a confirmation-tier claim.

## Contract

`experiments/half_cell_fast.js` (bit-identical to the live runtime, 4x faster).
**project** = the unchanged live rule (a free block is projected into the slot, or
rejected). **pins** = Q8j's CaptureSim rule: when either block of a compatible,
geometry-passing non-fuel contact has no mechanical bond, link in place without
projection. Everything else delegates unchanged: fuel, bound-bound contacts, rim
chemistry, release and recycling. Reads: the two incident blocks' types and bond
occupancy, as in Q8j. No new state, mark, type or knob. Motion: body jostling, 16
passes (live default). The world is 28 blocks with one founder half-cell and one
offspring's worth of loose material (RESULTS 88).

## Comparison and outcomes

- **contacts** start (prepared loose contacts, RESULTS 88): seeds 1001–1008, 3,000 steps.
- **bath** start (randomly placed loose material): fresh seeds 1101–1104, 50,000 steps.

Arms project and pins, same seeds, so 24 worlds. Every 50 steps, the read-only
`live.observe` records the first novel chain (a P..Q chain whose units differ from the
founder's), the first novel closed D (a novel chain plus its own rim), and the first
unpaired novel closed D (no copying contacts). A detached novel closed D is checked
at those milestones and at the end, as in RESULTS 89. Maximum all-pair overlap is sampled
every 1,000 steps. Also recorded: final census, rim attachments and copying contacts.

Reading, fixed now: a **lead** is pins making a novel closed D in at least 2/4 bath
seeds with project at 0/4, or a detached/unpaired novel closed D in at least one bath
seed. Contacts is the stepping stone: pins should beat project there, otherwise the
bath is uninformative. Anything less, with pins no better than project, closes this
reopening. Overlap above .02 is reported and not gated (exploration tier).

QA (screen tier): the first seed of each start/arm cell repeats as a plain run
(state and RNG match) and as a midpoint restart with its own class. Initial states
are saved for replay. Four processes at most.

```sh
node experiments/half_cell_pins.js all experiments/scratch/HCP_20260929
node experiments/half_cell_pins.js summary experiments/scratch/HCP_20260929
```
