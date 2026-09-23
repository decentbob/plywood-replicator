#!/bin/sh
# Slow polymers (mobS) and the public motif (RESULTS.md, section 21). Same small world as space.sh's SP_small_motif_*
# (motif charging the only real energy income), with bonded blocks jostling at a tenth or a thirtieth of a free block's
# step, so offspring stay near their parents while monomers and energy diffuse. V_ctl_*: motif off, background reload.
cd "$(dirname "$0")/.."
O=${OUT:-experiments/out}
mkdir -p $O
M="--steps 1000000 --every 20000 --maxBirthLog 300000 --pSoft 0.002 --pCapture 0.002 --pSpont 0.0002 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --mobE 0.2 --seedSeq ABBABA --W 40 --H 40 --nA 176 --nB 176 --nE 48 --seedCount 2"
{
for sd in 1 2 3; do
  echo "V_m10_$sd --seed $sd --mobS 0.1 --motif 1 --pReload 0.00005"
  echo "V_m30_$sd --seed $sd --mobS 0.03 --motif 1 --pReload 0.00005"
done
for sd in 1 2; do
  echo "V_ctl_m10_$sd --seed $sd --mobS 0.1 --motif 0 --pReload 0.0003"
done
echo "V_ctl_m100_1 --seed 1 --mobS 1 --motif 0 --pReload 0.0003"
# the mobS 1 motif runs are space.sh's SP_small_motif_* (reproduced bit for bit); rerun them with --births for the table
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$M"' "$@" --births '$O'/$name.births.jsonl > '$O'/$name.csv 2> '$O'/$name.json'
echo VISCOUSDONE
