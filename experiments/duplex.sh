#!/bin/sh
# Double strands and temperature cycles (RESULTS.md, section 29). Complementary copying (compCopy: A docks on B, C on D) makes a
# parent and its copy complementary, so with binding (pHyb) they zip into double strands. heatPeriod: every 5,000 steps a hot
# fifth melts bound pairs (heatMelt 0.05) and stops binding. Arms: comp only; comp + binding; comp + binding + heat; comp + heat.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}
mkdir -p $O
C="--steps 500000 --every 25000 --maxBirthLog 300000 --W 40 --H 40 --nA 256 --nB 256 --nE 60 --pReload 0.002 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --seedSeq AAABAB,ABBABA --seedCount 2 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --compCopy 1 --snapCorners 1 --maxStrain 0.5"
{
for sd in 1 2 3; do
  echo "DX_comp_$sd --seed $sd"
  echo "DX_bind_$sd --seed $sd --pHyb 0.2"
  echo "DX_bindheat_$sd --seed $sd --pHyb 0.2 --heatPeriod 5000"
  echo "DX_heat_$sd --seed $sd --heatPeriod 5000"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo DXDONE
