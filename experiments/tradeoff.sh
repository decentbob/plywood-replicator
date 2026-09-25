#!/bin/sh
# Letters with trade-offs (the user's idea, 2026-09-25; DESIGN 15). No motif rule for durability (shield off): C and D are
# tough (radiation resistance resC = resD = 0.8) but slow (a free C or D moves at mobC = mobD 0.5, so it meets templates
# less often and copies are slower to fill); A and B are fragile and fast. Capped genomes (bare caps, endLoss, feed relay:
# the energy gene ABA is required), nine units, the four other positions start mixed. Does the make-up of those positions
# follow the environment (tough letters under radiation, fast ones without)? TO_ctl_*: the same letters without the
# trade-off (no resistance, full speed), for drift.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}; P=${P:-4}; STEPS=${STEPS:-150000}
mkdir -p $O
C="--steps $STEPS --every 20000 --maxBirthLog 600000 --W 40 --H 40 --nA 200 --nB 200 --nC 200 --nD 200 --nP 80 --nQ 80 --capFray 0.03 --pUnzip 1 --pUndock 0 --pFray 0.001 --seedCount 2 --feed 1 --relay 1 --endLoss 1 --bareCaps 1 --seedSeq PABACADBQ,PABADBCAQ --nE 60 --pReload 0.002 --pSoft 0.01"
{
for sd in 1 2; do
if [ "${ROUND:-1}" = 1 ]; then
echo "TO_none_$sd --seed $sd --resC 0.8 --resD 0.8 --mobC 0.5 --mobD 0.5"
echo "TO_rad_$sd --seed $sd --resC 0.8 --resD 0.8 --mobC 0.5 --mobD 0.5 --pBreak 0.00005"
echo "TO_ctlrad_$sd --seed $sd --pBreak 0.00005"
else
# round 2: radiation gentle enough to live with; controls without the trade-off, with and without radiation
echo "TO2_ctlnone_$sd --seed $sd"
echo "TO2_rad1_$sd --seed $sd --resC 0.8 --resD 0.8 --mobC 0.5 --mobD 0.5 --pBreak 0.00001"
echo "TO2_rad2_$sd --seed $sd --resC 0.8 --resD 0.8 --mobC 0.5 --mobD 0.5 --pBreak 0.00002"
echo "TO2_ctlrad2_$sd --seed $sd --pBreak 0.00002"
fi
done
} | xargs -P $P -L 1 sh -c 'name=$0; node run.js '"$C"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo TRADEDONE
