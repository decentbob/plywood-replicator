#!/bin/sh
# Hinged chains in an open population with ligation: do rings form and persist? 100k steps, three seeds.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
COMMON="--steps 100000 --every 5000 --W 80 --H 80 --nA 400 --nB 400 --nE 300 --energyMode unit --hinge all --seedSeq ABBABA --pLigate 0.02 --pFray 0.0001 --pSoft 0.01 --pCapture 0.01"
{
for seed in 51 52 53; do
  echo "H2_hinge_$seed    --seed $seed"
  echo "H2_hingerad_$seed --seed $seed --pBreak 0.0003 --resB 0.9 --nA 600 --nB 200"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$COMMON"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'
echo RINGS2DONE
