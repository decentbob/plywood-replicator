#!/bin/sh
# Is the ABA motif selected once length is (RESULTS.md, section 14)? All runs in the length regime: 50x50,
# processive fraying, cooperative docking 0.1, fraying 0.00003, gentle mutation, three ABBABA seeds.
#  Q_m_*  motif charging with plenty of particles (250) and a weak background reload; energy mobility 1, 0.2, 0.05; control without motif
#  Q_n_*  motif charging as the only energy income, 60 particles; control with background reload instead
#  Q_f_*  the feed rule (motif re-arms its own neighbours through bonds) against a control, 40 particles, weak reload, 200k steps
cd "$(dirname "$0")/.."
mkdir -p experiments/out
M="--every 10000 --W 50 --H 50 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --seedSeq ABBABA --seedCount 3 --pSoft 0.01 --pCapture 0.01 --pSpont 0.001 --nA 400 --nB 400"
run() { xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$1"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'; }
{
for sd in 1 2; do
  echo "Q_m_mot_e100_$sd --seed $sd --motif 1 --mobE 1"
  echo "Q_m_mot_e20_$sd  --seed $sd --motif 1 --mobE 0.2"
  echo "Q_m_mot_e05_$sd  --seed $sd --motif 1 --mobE 0.05"
  echo "Q_m_ctl_e20_$sd  --seed $sd --motif 0 --mobE 0.2"
done
} | run "--steps 150000 --nE 250 --pReload 0.00005 $M"
{
for sd in 1 2; do
  echo "Q_n_mot60_e100_$sd --seed $sd --motif 1 --pReload 0 --mobE 1"
  echo "Q_n_mot60_e20_$sd  --seed $sd --motif 1 --pReload 0 --mobE 0.2"
  echo "Q_n_ctl60_$sd      --seed $sd --motif 0 --pReload 0.001"
done
} | run "--steps 150000 --nE 60 $M"
{
for sd in 1 2; do
  echo "Q_f_feed_$sd --seed $sd --feed 1"
  echo "Q_f_ctl_$sd  --seed $sd --feed 0"
done
} | run "--steps 200000 --nE 40 --pReload 0.0005 $M"
echo MOTIFDONE
