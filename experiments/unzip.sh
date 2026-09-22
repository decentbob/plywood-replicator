#!/bin/sh
# Cooperative docking against turnover (RESULTS.md, section 13). Three batches, four runs at a time.
#  Z_end_*  end fraying only (pUnzip 0), 60x60, 100k steps; Z_end_*_b* uses radiation as the turnover instead
#  Z_zip_*  processive fraying (pUnzip 1), 60x60, 150k steps
#  Z_d42_*, Z_d50_*  the same at higher monomer density (42x42 and 50x50)
# Names: u = pUndock x 100, f = pFray (3e5 = 0.00003), b = pBreak.
cd "$(dirname "$0")/.."
mkdir -p experiments/out
MUT="--seedSeq ABBABA --seedCount 3 --slack 0.1 --pSoft 0.01 --pCapture 0.01 --pSpont 0.001 --nA 400 --nB 400"
run() { xargs -P 4 -L 1 sh -c 'name=$0; node run.js '"$1"' "$@" --births experiments/out/$name.births.jsonl > experiments/out/$name.csv 2> experiments/out/$name.json'; }
{
for u in 0 10; do
  pu=$(echo "$u" | awk '{print $1/100}')
  echo "Z_end_u${u}_f1e5 --seed 1 --pUndock $pu --pFray 0.00001"
  echo "Z_end_u${u}_f3e5 --seed 1 --pUndock $pu --pFray 0.00003"
  echo "Z_end_u${u}_f1e4 --seed 1 --pUndock $pu --pFray 0.0001"
  echo "Z_end_u${u}_b5e5 --seed 1 --pUndock $pu --pBreak 0.00005"
done
} | run "--steps 100000 --every 10000 --W 60 --H 60 --nE 300 $MUT"
{
for u in 0 5 10 20; do
  pu=$(echo "$u" | awk '{print $1/100}')
  echo "Z_zip_u${u}_f3e5 --seed 1 --pUndock $pu --pFray 0.00003"
  echo "Z_zip_u${u}_f1e4 --seed 1 --pUndock $pu --pFray 0.0001"
done
} | run "--steps 150000 --every 10000 --W 60 --H 60 --nE 300 --pUnzip 1 $MUT"
{
echo "Z_d50_u0_f3e5  --seed 1 --W 50 --H 50 --pFray 0.00003"
echo "Z_d50_u5_f3e5  --seed 1 --W 50 --H 50 --pFray 0.00003 --pUndock 0.05"
echo "Z_d50_u10_f3e5 --seed 1 --W 50 --H 50 --pFray 0.00003 --pUndock 0.1"
echo "Z_d50_u10_f1e5 --seed 1 --W 50 --H 50 --pFray 0.00001 --pUndock 0.1"
echo "Z_d42_u0_f3e5  --seed 1 --W 42 --H 42 --pFray 0.00003"
echo "Z_d42_u10_f3e5 --seed 1 --W 42 --H 42 --pFray 0.00003 --pUndock 0.1"
echo "Z_d42_u20_f3e5 --seed 1 --W 42 --H 42 --pFray 0.00003 --pUndock 0.2"
echo "Z_d42_u10_f1e4 --seed 1 --W 42 --H 42 --pFray 0.0001 --pUndock 0.1"
} | run "--steps 150000 --every 10000 --nE 250 --pUnzip 1 $MUT"
echo UNZIPDONE
