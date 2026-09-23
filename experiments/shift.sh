#!/bin/sh
# Environment change (RESULTS.md, section 14): energy plentiful until step 500,000, then scarce. Feed rule against control.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
O=experiments/out
M="--steps 1500000 --every 20000 --maxBirthLog 200000 --W 40 --H 40 --nA 256 --nB 256 --nE 26 --pReload 0.005 --change 500000:pReload=0.0003 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --seedSeq ABBABA --seedCount 2 --slack 0.1 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002"
{
for sd in 1 2; do
  echo "S_feed_$sd --seed $sd --feed 1"
  echo "S_ctl_$sd  --seed $sd --feed 0"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$M"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo SHIFTDONE
