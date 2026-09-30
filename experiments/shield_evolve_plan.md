# Can shields evolve? (working-mode plan, 2026-09-29)

Build on RESULTS 105 (shields favoured under the field in most soups). Start with no shields:
founder PAAQ only; loose A 12, B 12, P 8, Q 8, J (plates) 16; copying errors `pSoft` .05 (a wrong
letter docks at 5% of the right one's rate; caps never mispair), so B, and with it a shield seed,
arises only by mutation. Same engine and SHIELD configuration (fan plate), `pFray` .002,
`energyGate=false`, pins, body16. Field on (1e-5) or off; seeds 1721–1726; 200,000 steps.

Readout: chain-steps per sequence (every 500 steps), the share held by B-carrying variants in
each 50k window, the first appearance of each variant, and final chains. Expectation: B-variants
arise in both arms and rise under the field but not without it. This is steering, not a gate.

## Round 2 (after RESULTS 106; working mode: strengthen conditions)

A single plate was too weak (about a 15% exposure cut) and B→A back-mutation at 5% eroded gains;
lineages were few. Round 2: a larger fan (far edge 6, depth 1.5; one plate cuts exposure to about .67),
`pSoft` .01, three PAAQ founders, 26x26 with loose A 16, B 16, P 10, Q 10, J 24, and 300,000 steps.
Seeds 1731–1736, field on and off. Same readout.
`SE_ROUND=2 node experiments/shield_evolve.js all experiments/scratch/SE2_20260929`

## Round 3: a choice of structures (after RESULTS 107)

Building on evolved shields: B seeds a fan shield plate (useful under the field) and D seeds a
plain 3x1 rod (no protective shape, a pure cost as in the comb). Copying errors (`pSoft` .01) can
turn A into either. Maintenance by attachment (`release`) frees parts from broken chains. The
founders are three PAAQ; 26x26; loose A 16, B 12, D 12, P 10, Q 10, plates 20, rods 20. Field on/off;
seeds 1751–1756; 300,000 steps. Readout: B-share and D-share per window. Expectation: under the
field B rises and D does not; without it neither is selected.
`SE_ROUND=3 node experiments/shield_evolve.js all experiments/scratch/SE3_20260930`
