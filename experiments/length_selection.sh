#!/bin/sh
# Does strand-wide re-arm (one E per copy, caught by any of N back sides) select for length
# when energy is scarce? Energy supply x seeds, ligation off. (The strand-wide re-arm mode and the sun patch
# were removed after these runs showed neither changes anything; their rows stay in RESULTS.md as history.)
# Two extra probes measure how little ligation it takes to fuse the population into rafts.
# About 4 minutes per run on one core; runs 4 at a time.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
COMMON="--steps 150000 --every 5000 --nA 400 --nB 400 --W 80 --H 80 --seedSeq ABBABA --sigma 0.3 --sigmaRot 0.45 --pSoft 0.02 --pCapture 0.05 --pLigate 0 --pFray 0.0003"
{
for seed in 11 12; do
  echo "L_unit_E300_$seed   --seed $seed --nE 300"
  echo "L_unit_E40_$seed    --seed $seed --nE 40 --pReload 0.001"
done
echo "L_ligate005_11 --seed 11 --nE 300 --pLigate 0.005"
echo "L_ligate02_11  --seed 11 --nE 300 --pLigate 0.02"
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$COMMON"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'
echo ALLDONE
