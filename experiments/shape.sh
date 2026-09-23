#!/bin/sh
# Shape as phenotype on the polygon engine (RESULTS.md, section 15): wedge-shaped B (bendB 20) against square B,
# and 10-degree wedges on B only or on both types.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
O=experiments/out
M="--steps 800000 --every 20000 --maxBirthLog 200000 --W 40 --H 40 --nA 256 --nB 256 --nE 60 --pReload 0.002 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --seedSeq ABBABA --seedCount 2 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --stiffA 0.5 --stiffB 0.5"
{
for sd in 1 2; do
  echo "SH_wedge_$sd --seed $sd --bendB 20"
  echo "SH_square_$sd --seed $sd --bendB 0"
  echo "SH10_wedge_$sd --seed $sd --bendB 10"
  echo "SH10_all_$sd --seed $sd --bendB 10 --bendA 10"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$M"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo SHAPEDONE
