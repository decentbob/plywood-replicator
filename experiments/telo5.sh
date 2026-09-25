#!/bin/sh
# Telomeres, round 6: a gene from nothing in a population four times larger (RESULTS.md, section 33). As TD_rad5 / TD_lig of
# telo4.sh (bare caps, radiation only, fivefold mutation, seed PABAQ) in an 80x80 world with four times the blocks
# (about 240 genomes). Several hours per run on one core.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-3}; STEPS=${STEPS:-1000000}
mkdir -p $O
C="--steps $STEPS --every 20000 --maxBirthLog 2000000 --W 80 --H 80 --nA 800 --nB 800 --nC 800 --nD 800 --nP 480 --nQ 480 --capFray 0.03 --pUnzip 1 --pUndock 0 --pFray 0.001 --seedCount 12 --feed 1 --shield 1 --relay 1 --endLoss 1 --bareCaps 1 --seedSeq PABAQ --nE 240 --pReload 0.002 --pBreak 0.00003 --pSoft 0.01 --pCapture 0.01"
{
echo "TE_lig_1 --seed 1 --pLigate 0.05"
echo "TE_lig_2 --seed 2 --pLigate 0.05"
echo "TE_nolig_1 --seed 1"
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo TELO5DONE
