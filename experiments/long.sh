#!/bin/sh
# Long runs in a small world (40x40, 512 monomers): many generations, feed rule against control (RESULTS.md, section 14);
# L1L_*: the same with mutation cut about fivefold (pSoft, pCapture 0.002, pSpont 0.0002), four seeds each.
# (The L1S_* outputs came from the spend rule, since removed; see RESULTS.md section 14.)
cd "$(dirname "$0")/.."
mkdir -p experiments/out
M="--steps 1000000 --every 20000 --maxBirthLog 100000 --W 40 --H 40 --nA 256 --nB 256 --nE 26 --pReload 0.0005 --pUnzip 1 --pUndock 0.1 --pFray 0.00003 --seedSeq ABBABA --seedCount 2 --slack 0.1 --pSoft 0.01 --pCapture 0.01 --pSpont 0.001"
{
for sd in 1 2; do
  echo "L1M_feed_$sd --seed $sd --feed 1"
  echo "L1M_ctl_$sd  --seed $sd --feed 0"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$M"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'
LOW=$(echo "$M" | sed -e 's/--pSoft 0.01/--pSoft 0.002/' -e 's/--pCapture 0.01/--pCapture 0.002/' -e 's/--pSpont 0.001/--pSpont 0.0002/')
{
for sd in 1 2 3 4; do
  echo "L1L_feed_$sd --seed $sd --feed 1"
  echo "L1L_ctl_$sd  --seed $sd --feed 0"
done
} | xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$LOW"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'
echo LONGDONE
