#!/bin/sh
# Telomeres, round 4: can a two-gene genome be assembled? (RESULTS.md, section 33.) World of telo3.sh (bare caps),
# seeds PABAQ and PCDCQ (one gene each, three of each). Radiation breaks genomes into pieces with open ends; with
# ligation (pLigate) a piece carrying P and one carrying Q can join into a new capped genome, which is recombination.
# TA_lig_*: ligation 0.02; TA_nolig_*: none (only point mutations, capture and chimeras).
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-4}; STEPS=${STEPS:-1000000}
mkdir -p $O
C="--steps $STEPS --every 20000 --maxBirthLog 600000 --W 40 --H 40 --nA 200 --nB 200 --nC 200 --nD 200 --nP 120 --nQ 120 --capFray 0.03 --pUnzip 1 --pUndock 0 --pFray 0.001 --seedCount 3 --pSoft 0.002 --pCapture 0.002 --feed 1 --shield 1 --relay 1 --endLoss 1 --bareCaps 1 --seedSeq PABAQ,PCDCQ --nE 16 --pReload 0.0004 --pBreak 0.00003"
{
for sd in 1 2; do
echo "TA_lig_$sd --seed $sd --pLigate 0.02"
echo "TA_nolig_$sd --seed $sd"
done
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo TELO2DONE
