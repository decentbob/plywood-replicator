#!/bin/sh
# Lock-and-key binding between strands (RESULTS.md, section 18): pHyb 0, 0.05, 0.2.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
O=experiments/out
M="--steps 1000000 --every 20000 --maxBirthLog 300000 --W 40 --H 40 --nA 256 --nB 256 --nE 60 --pReload 0.002 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --seedSeq ABBABA --seedCount 2 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002"
{
echo "HY_ctl_1 --seed 1 --pHyb 0"
echo "HY_h20_1 --seed 1 --pHyb 0.2"
echo "HY_h05_1 --seed 1 --pHyb 0.05"
echo "HY_h20_2 --seed 2 --pHyb 0.2"
echo "HY_ctl_2 --seed 2 --pHyb 0"
echo "HY_h05_2 --seed 2 --pHyb 0.05"
} | xargs -P 2 -L 1 sh -c 'name=$0; node run.js '"$M"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo HYBDONE
