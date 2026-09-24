#!/bin/sh
# Telomeres, round 3: bare caps (RESULTS.md, section 33). As telo.sh, but caps have no back (bareCaps): a cap is armed only
# through its bond, by the feed relay, so a genome re-arms only if it carries the energy gene ABA, and PQ is sterile.
# TB_keep_*: seed PABACDCQ alone. TB_comp_*: PABACDCQ against PABAQ (three of each). Four environments, two seeds.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-4}; STEPS=${STEPS:-500000}
mkdir -p $O
C="--steps $STEPS --every 20000 --maxBirthLog 400000 --W 40 --H 40 --nA 200 --nB 200 --nC 200 --nD 200 --nP 120 --nQ 120 --capFray 0.03 --pUnzip 1 --pUndock 0 --pFray 0.001 --seedCount 3 --pSoft 0.002 --pCapture 0.002 --feed 1 --shield 1 --relay 1 --endLoss 1 --bareCaps 1"
{
for sd in 1 2; do
for k in keep comp; do
S="--seed $sd --seedSeq PABACDCQ"; [ $k = comp ] && S="--seed $sd --seedSeq PABACDCQ,PABAQ"
echo "TB_${k}_none_$sd $S --nE 60 --pReload 0.002"
echo "TB_${k}_energy_$sd $S --nE 16 --pReload 0.0004"
echo "TB_${k}_rad_$sd $S --nE 60 --pReload 0.002 --pBreak 0.00003"
echo "TB_${k}_both_$sd $S --nE 16 --pReload 0.0004 --pBreak 0.00003"
done
done
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo TELO3DONE
