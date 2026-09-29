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
