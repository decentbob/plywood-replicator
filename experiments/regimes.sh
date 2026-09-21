#!/bin/sh
# One variation source at a time (base, wrong-type docking, end capture, fraying, fraying + capture),
# plus a "gentle" regime with all sources on at low rates. 100k steps each, about 3 minutes per run.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
COMMON="--steps 100000 --every 5000 --nA 400 --nB 400 --nE 300 --W 80 --H 80 --seedSeq ABBABA --sigma 0.3 --sigmaRot 0.45 --pLigate 0"
{
echo "R_base      --seed 7 --pSoft 0 --pCapture 0 --pFray 0"
echo "R_soft      --seed 7 --pSoft 0.02 --pCapture 0 --pFray 0"
echo "R_capture   --seed 7 --pSoft 0 --pCapture 0.05 --pFray 0"
echo "R_fray      --seed 7 --pSoft 0 --pCapture 0 --pFray 0.0003"
echo "R_fraycap   --seed 7 --pSoft 0 --pCapture 0.05 --pFray 0.0003"
echo "R_gentle_7  --seed 7 --pSoft 0.01 --pCapture 0.01 --pFray 0.0001"
echo "R_gentle_8  --seed 8 --pSoft 0.01 --pCapture 0.01 --pFray 0.0001"
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$COMMON"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'
echo ALLDONE
