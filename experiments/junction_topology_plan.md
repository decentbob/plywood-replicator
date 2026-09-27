# Q8: junction caps and non-chain replication — design admission

2026-09-27. User-directed change of question: explore block alphabets and
replicators beyond a chain, especially a strip attached to a dividing rim.
Q7b is deferred, not failed or run. This is an offline necessary-condition
audit, not a dynamics experiment or a lattice replacement.

## Decision and existing evidence

Compare a cap that directly carries two rim bonds with a cap attached to a
separate three-way junction. Account for copying and fuel access simultaneously.
Then check what connectivity changes a single simple rim would need to leave
two closed rims. This can reject an incomplete design before adding states.
It cannot establish assembly, division, permeability or inherited benefit.

Relevant evidence: walls trapped material or failed to pay (16, 24–25); stacks
grew/split without a length benefit (40); non-square geometry needs actual-corner
checks (67–69); repair can sequester material (78–80). The possible benefit here
is retaining useful independent parts near a renewing strip, with the parts'
cost and descendant replacement included later. No new motif reward is proposed.

## Contract

No simulator subclass or reaction is introduced. The executable analyzes static
graphs, never imports `src/sim.js`, and is never imported by dynamics. Vertex IDs,
connected-component searches and anchor labels are observer mathematics only.
No blocks are created or removed within a graph comparison. Ports have one bond
each. A working cap needs rail + copy + fuel; direct rim attachment adds two
simultaneous bonds. A separate junction needs anchor + two rim bonds; its cap
needs rail + copy + fuel + anchor. An octagonal outline alone does not increase
the engine's four working sides.

## Fixed enumeration

Use simple undirected rim cycles of 8, 12 and 16 conserved vertices. The rim
subgraph excludes inward anchor bonds. Mark indices 0, n/4, n/2, 3n/4 as
parent-left, daughter-left, daughter-right, parent-right. These labels are a
prepared topology, not a proposed rule for choosing cuts.

For every set of zero, one or two removed rim edges, record connected components
and whether each is a simple cycle of at least three vertices. For every pair
of disjoint removed edges, enumerate the three pairings of their four exposed
ports. Reject loops/duplicate bonds; record two-cycle outcomes and, separately,
outcomes with exactly the intended anchor pair in each component. Rejoining
original partners is a control. Do not search more sizes or promote chemistry
from favorable counts. Exact counts, not stochastic samples; no seeds or horizon.

The gate for a physical fixture is only that the separate-junction allocation
fits four ports per block and there is a graph witness for two anchor-complete
rims. A witness earns geometric design, not a division mechanism. If cuts alone
fail, record the missing reclosure explicitly instead of declaring scission a
solution. Preserve all counts and one witness per size. CPU cap 10 seconds,
one Node process, zero simulation workers; reserve 5 seconds for validation.

## Validation and reproduction

Check inventory, degree, edge count and exact anchor distribution. Independently
use cycle-segment lengths to predict two-cycle outcomes: both segments must have
at least three vertices. Test that an isolated triangle plus an open path is
rejected, and reject an altered aggregate in the archived report. Recompute all
counts on validation. Hash the runner, plan, design memo and unchanged core.

```
node experiments/junction_topology.js experiments/scratch/JT_20260927.json
node experiments/junction_topology.js --validate experiments/scratch/JT_20260927.json
```

Refuse overwrites. Archive the JSON and validation companion, report measured
CPU separately from shell/documentation time, add RESULTS 81 and LEDGER, and
update ROADMAP. No physics suite or trajectory rerun is needed if core and
historical assay bytes stay unchanged. Freeze a separate physical plan only
after actual port coordinates and a block-level contract are specified.
