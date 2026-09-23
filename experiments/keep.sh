#!/bin/sh
# Is a two-gene genome kept once it exists? (RESULTS.md, section 22.) Seed only ABACDC (energy gene ABA and shield gene CDC,
# relay on) in the four-letter world of genes.sh, and put it under both pressures at the strengths of G3_both (where
# single-gene seeds collapsed to dimers) and of the milder grid cell GR_e16_b3; K_none: no pressure, for drift alone.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}
mkdir -p $O
C="--steps 1000000 --every 20000 --maxBirthLog 300000 --W 40 --H 40 --nA 128 --nB 128 --nC 128 --nD 128 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --seedSeq ABACDC --seedCount 3 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --feed 1 --shield 1 --relay 1"
{
for sd in 1 2; do
echo "K_hard_$sd --seed $sd --nE 12 --pReload 0.0003 --pBreak 0.0001"
echo "K_mild_$sd --seed $sd --nE 16 --pReload 0.0004 --pBreak 0.00003"
echo "K_none_$sd --seed $sd --nE 60 --pReload 0.002"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo KEEPDONE
