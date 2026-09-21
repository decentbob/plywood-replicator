#!/bin/sh
# Hinged chains: do rings close, do they persist, and what does that cost copying? 100k steps each.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
COMMON="--steps 100000 --every 5000 --W 80 --H 80 --nA 400 --nB 400 --nE 300 --energyMode unit --hinge all --pSoft 0.01 --pCapture 0.01"
{
for seed in 41 42; do
  echo "H_rigid_$seed     --seed $seed --hinge none --seedSeq ABBABABABABA --pLigate 0.02 --pFray 0.0001"
  echo "H_hinge_$seed     --seed $seed --seedSeq ABBABABABABA --pLigate 0.02 --pFray 0.0001"
  echo "H_hingerad_$seed  --seed $seed --seedSeq ABBABABABABA --pLigate 0.02 --pFray 0.0001 --pBreak 0.0003 --resB 0.9"
  echo "H_hingeBB_$seed   --seed $seed --hinge BB --seedSeq ABBABABABABA --pLigate 0.02 --pFray 0.0001"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$COMMON"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'
echo RINGSDONE
