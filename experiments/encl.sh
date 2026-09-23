#!/bin/sh
# Do membrane wedges enclose strands by chance at high density? (RESULTS.md, section 16)
cd "$(dirname "$0")/.."
mkdir -p experiments/out
O=experiments/out
M="--steps 150000 --every 10000 --W 40 --H 40 --nA 200 --nB 200 --nE 100 --seedSeq ABBABA --seedCount 3 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --pBreak 0.0002 --resM 0.7 --resA 0.9 --resB 0.9"
{
echo "EN_m400_a20 --seed 1 --nM 400 --memAngle 20"
echo "EN_m400_a25 --seed 1 --nM 400 --memAngle 25"
echo "EN_m600_a20 --seed 1 --nM 600 --memAngle 20"
echo "EN_m600_a30 --seed 1 --nM 600 --memAngle 30"
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$M"' "$@" > '$O'/$name.csv 2> '$O'/$name.json'
echo ENCLDONE
