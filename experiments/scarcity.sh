#!/bin/sh
# Scarcity and density (the user's point, 2026-09-25). Which resource is scarce sets what length costs: caps are one pair per
# genome, letters one per unit. Small worlds (40x40), bare caps + endLoss, radiation only, seeded with PABAQ, fivefold
# mutation and ligation (as TD_lig), 400,000 steps. Caps 30/60/120 of each kind x letters 100/200/400 of each kind.
# Question: where do genomes grow longer (raw material for a new gene), and does a gene appear?
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-2}; STEPS=${STEPS:-400000}
mkdir -p $O
C="--steps $STEPS --every 20000 --maxBirthLog 600000 --W 40 --H 40 --capFray 0.03 --pUnzip 1 --pUndock 0 --pFray 0.001 --seedCount 3 --feed 1 --shield 1 --relay 1 --endLoss 1 --bareCaps 1 --seedSeq PABAQ --nE 60 --pReload 0.002 --pBreak 0.00003 --pSoft 0.01 --pCapture 0.01 --pLigate 0.05 --seed 1"
{
for c in 30 60 120; do for l in 100 200 400; do
echo "SC_c${c}_l${l} --nP $c --nQ $c --nA $l --nB $l --nC $l --nD $l"
done; done
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo SCARCEDONE
