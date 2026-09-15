#!/bin/sh
# Cooperative docking: a lone docked monomer falls off at pUndock per step, a laterally linked run stays.
# Does that flip the dimer-versus-6-mer competition? Mutation off, unit-mode energy, abundant E.
# Then one full evolutionary run with undocking on, to see where length settles. 100k steps each.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
COMMON="--steps 100000 --every 5000 --nA 400 --nB 400 --nE 300 --W 80 --H 80 --sigma 0.3 --sigmaRot 0.45 --energyMode unit --pLigate 0"
{
for seed in 21 22; do
  echo "U_undock02_$seed  --seed $seed --seedSeq AB,ABBABA --seedCount 3 --pSoft 0 --pCapture 0 --pFray 0 --pUndock 0.02"
  echo "U_undock05_$seed  --seed $seed --seedSeq AB,ABBABA --seedCount 3 --pSoft 0 --pCapture 0 --pFray 0 --pUndock 0.05"
  echo "U_undock02_len12_$seed --seed $seed --seedSeq AB,ABBABA,ABBABAABABBA --seedCount 2 --pSoft 0 --pCapture 0 --pFray 0 --pUndock 0.02"
done
echo "U_evo_undock02_7  --seed 7 --seedSeq ABBABA --pSoft 0.01 --pCapture 0.01 --pFray 0.0001 --pUndock 0.02"
echo "U_evo_undock02_8  --seed 8 --seedSeq ABBABA --pSoft 0.01 --pCapture 0.01 --pFray 0.0001 --pUndock 0.02"
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$COMMON"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'
echo ALLDONE
# Stronger undocking, added after the first batch showed 0.02 and 0.05 shift the balance without flipping it.
{
echo "U_undock10_21  --seed 21 --seedSeq AB,ABBABA --seedCount 3 --pSoft 0 --pCapture 0 --pFray 0 --pUndock 0.1"
echo "U_undock20_21  --seed 21 --seedSeq AB,ABBABA --seedCount 3 --pSoft 0 --pCapture 0 --pFray 0 --pUndock 0.2"
echo "U_undock10_22  --seed 22 --seedSeq AB,ABBABA --seedCount 3 --pSoft 0 --pCapture 0 --pFray 0 --pUndock 0.1"
echo "U_undock20_22  --seed 22 --seedSeq AB,ABBABA --seedCount 3 --pSoft 0 --pCapture 0 --pFray 0 --pUndock 0.2"
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$COMMON"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'
echo ALLDONE2
