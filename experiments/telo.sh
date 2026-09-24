#!/bin/sh
# Telomeres: does end-replication loss (endLoss) let a two-gene genome hold? (RESULTS.md, section 33.)
# Four letters, caps P/Q (120 each), feed + shield + relay, open ends fragile (pFray 0.001) and caps not (capFray 0.03).
# K_: seed only PABACDCQ (energy gene ABA, shield gene CDC), endLoss on (on) or off (off), four environments.
# C_: competition, seeds PABACDCQ, PABAQ, PCDCQ and PQ (three of each), endLoss on.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-4}; STEPS=${STEPS:-500000}
mkdir -p $O
C="--steps $STEPS --every 20000 --maxBirthLog 400000 --W 40 --H 40 --nA 200 --nB 200 --nC 200 --nD 200 --nP 120 --nQ 120 --capFray 0.03 --pUnzip 1 --pUndock 0 --pFray 0.001 --seedCount 3 --pSoft 0.002 --pCapture 0.002 --feed 1 --shield 1 --relay 1"
{
for sd in 1 2; do
for el in on off; do
e=1; [ $el = off ] && e=0
echo "TK_${el}_none_$sd --seed $sd --endLoss $e --seedSeq PABACDCQ --nE 60 --pReload 0.002"
echo "TK_${el}_energy_$sd --seed $sd --endLoss $e --seedSeq PABACDCQ --nE 16 --pReload 0.0004"
echo "TK_${el}_rad_$sd --seed $sd --endLoss $e --seedSeq PABACDCQ --nE 60 --pReload 0.002 --pBreak 0.00003"
echo "TK_${el}_both_$sd --seed $sd --endLoss $e --seedSeq PABACDCQ --nE 16 --pReload 0.0004 --pBreak 0.00003"
done
S="--seed $sd --endLoss 1 --seedSeq PABACDCQ,PABAQ,PCDCQ,PQ"
echo "TC_none_$sd $S --nE 60 --pReload 0.002"
echo "TC_energy_$sd $S --nE 16 --pReload 0.0004"
echo "TC_rad_$sd $S --nE 60 --pReload 0.002 --pBreak 0.00003"
echo "TC_both_$sd $S --nE 16 --pReload 0.0004 --pBreak 0.00003"
done
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo TELODONE
