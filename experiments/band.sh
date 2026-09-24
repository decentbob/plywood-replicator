#!/bin/sh
# Niches: radiation only in the left half of a long world (radBand 0.5, 80x20, same area and block counts as telo3.sh).
# Bare caps, seeds PABACDCQ and PABAQ. Does each half keep its own genome (both genes where it is lit, the energy gene
# alone where it is dark)? TR_band_*: ordinary mobility; TR_bandslow_*: slow polymers (mobS 0.3), less mixing.
# Analysis: node experiments/capped.js ABA,CDC out/TR_band_1.births.jsonl --x0=0 --x1=40 (lit) and --x0=40 --x1=80 (dark)
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-4}; STEPS=${STEPS:-1000000}
mkdir -p $O
C="--steps $STEPS --every 20000 --maxBirthLog 600000 --W 80 --H 20 --nA 200 --nB 200 --nC 200 --nD 200 --nP 120 --nQ 120 --capFray 0.03 --pUnzip 1 --pUndock 0 --pFray 0.001 --seedCount 3 --pSoft 0.002 --pCapture 0.002 --feed 1 --shield 1 --relay 1 --endLoss 1 --bareCaps 1 --seedSeq PABACDCQ,PABAQ --nE 60 --pReload 0.002 --pBreak 0.00003 --radBand 0.5"
{
echo "TR_band_1 --seed 1"
echo "TR_bandslow_1 --seed 1 --mobS 0.3"
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
